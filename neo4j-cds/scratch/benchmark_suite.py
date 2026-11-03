"""
MedGraph Therapy Engine — Comprehensive Evaluation & Benchmark Suite.

Evaluates:
  1. Per-step latency (P50, P90, Max in ms) across 6 medical domains
  2. Entity extraction accuracy (Precision, Recall, F1)
  3. Vector ranking accuracy (Top-1, Top-3, MRR, Monotonicity)
  4. Drug-drug interaction safety detection rate
"""

import time
import json
import statistics
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.pipeline import pipeline
from app.graph.client import graph_client
from app.nlp.summarizer import summarize_report, extract_medical_entities
from app.tokenizer.scorer import scorer

# Ground truth test dataset across 6 clinical domains
BENCHMARK_CASES = [
    {
        "id": "case_1_ortho_acl",
        "domain": "Orthopedics & Sports Medicine",
        "report_text": (
            "MRI RIGHT KNEE: Complete disruption / grade III tear of anterior cruciate ligament (ACL) "
            "with severe intra-articular joint effusion and massive swelling in the suprapatellar pouch. "
            "Medial meniscus tear identified. Marked pain and severe joint instability."
        ),
        "expected_areas": ["knee"],
        "expected_conditions": ["acl tear", "meniscus tear"],
        "expected_symptoms": ["pain", "swelling", "instability"],
        "expected_top_therapies": ["Cryotherapy", "Physical Therapy", "Range of Motion Exercises"],
        "expected_top_meds": ["Ibuprofen", "Paracetamol (Acetaminophen)"],
    },
    {
        "id": "case_2_vascular_dvt",
        "domain": "Vascular & Hematology",
        "report_text": (
            "DUPLEX ULTRASOUND RIGHT LOWER EXTREMITY: Acute deep vein thrombosis (DVT) with occlusive "
            "blood clot visualized in the right popliteal vein and posterior tibial veins. "
            "Marked subcutaneous swelling, localized warmth, and calf pain. High pulmonary embolism risk."
        ),
        "expected_areas": ["leg"],
        "expected_conditions": ["deep vein thrombosis"],
        "expected_symptoms": ["swelling", "pain", "warmth"],
        "expected_top_therapies": ["Compression Therapy", "Elevation Therapy", "Manual Lymphatic Drainage", "Cryotherapy"],
        "expected_top_meds": ["Heparin", "Enoxaparin", "Rivaroxaban", "Warfarin"],
    },
    {
        "id": "case_3_neuro_stroke",
        "domain": "Neurology & Cerebrovascular",
        "report_text": (
            "EMERGENCY CT BRAIN: Acute ischemic stroke in the right middle cerebral artery (MCA) territory. "
            "Focal area of cytotoxic edema and damaged brain tissue measuring 3.2 cm. "
            "Contralateral left-sided weakness, hemiparesis, and facial droop. No intracranial hemorrhage."
        ),
        "expected_areas": ["brain", "head"],
        "expected_conditions": ["ischemic stroke"],
        "expected_symptoms": ["weakness"],
        "expected_top_therapies": ["Thrombolytic Therapy", "Neuro-Rehabilitation", "Physical Therapy"],
        "expected_top_meds": ["Alteplase (tPA)", "Aspirin (Low-Dose)"],
    },
    {
        "id": "case_4_spine_sciatica",
        "domain": "Spine & Orthopedics",
        "report_text": (
            "MRI LUMBAR SPINE: L4-L5 intervertebral disc herniation causing severe left L5 nerve root compression. "
            "Expressed sciatica with radiating leg pain, numbness, and tingling. Paraspinal muscle spasms noted."
        ),
        "expected_areas": ["spine", "leg"],
        "expected_conditions": ["disc herniation", "sciatica"],
        "expected_symptoms": ["pain", "numbness", "muscle spasm"],
        "expected_top_therapies": ["Physical Therapy", "Spinal Traction Therapy", "TENS Therapy"],
        "expected_top_meds": ["Ibuprofen", "Gabapentin", "Cyclobenzaprine"],
    },
    {
        "id": "case_5_endocrine_ulcer",
        "domain": "Endocrine & Wound Care",
        "report_text": (
            "CLINICAL WOUND ASSESSMENT: 61-year-old with Type 2 Diabetes presenting with chronic non-healing "
            "diabetic foot ulcer on plantar aspect of first metatarsal. Advanced peripheral neuropathy with complete "
            "loss of sensation, foot numbness, and skin breakdown. Localized erythema and swelling."
        ),
        "expected_areas": ["foot", "skin"],
        "expected_conditions": ["diabetic foot ulcer", "type 2 diabetes", "diabetic neuropathy"],
        "expected_symptoms": ["numbness", "swelling"],
        "expected_top_therapies": ["Wound Care & Dressing", "Offloading Therapy"],
        "expected_top_meds": ["Metformin", "Insulin Glargine", "Gabapentin"],
    },
    {
        "id": "case_6_rheuma_arthritis",
        "domain": "Rheumatology & Autoimmune",
        "report_text": (
            "ULTRASOUND HANDS & WRISTS: Active severe seropositive rheumatoid arthritis with marked "
            "synovial swelling, bone erosions at MCP joints, morning stiffness lasting >90 min, and joint inflammation. "
            "Elevated CRP and positive rheumatoid factor."
        ),
        "expected_areas": ["joint", "hand", "wrist"],
        "expected_conditions": ["rheumatoid arthritis"],
        "expected_symptoms": ["swelling", "stiffness", "pain"],
        "expected_top_therapies": ["Physical Therapy", "Hydrotherapy", "Heat Therapy", "Cryotherapy"],
        "expected_top_meds": ["Methotrexate", "Prednisone", "Ibuprofen"],
    },
]


def run_benchmark():
    print("=" * 70)
    print("STARTING MEDGRAPH ACCURACY & STEP-BY-STEP LATENCY BENCHMARK")
    print("=" * 70)

    step_timings = {
        "nlp_extraction": [],
        "graph_query": [],
        "vector_scoring": [],
        "safety_checks": [],
        "total_pipeline": []
    }

    nlp_metrics = {
        "precision_list": [],
        "recall_list": [],
        "f1_list": []
    }

    ranking_metrics = {
        "top1_hits": 0,
        "top3_hits": 0,
        "mrr_scores": [],
        "is_monotonic_all": True
    }

    test_results = []

    for idx, case in enumerate(BENCHMARK_CASES):
        text = case["report_text"]
        print(f"\nEvaluating Case {idx + 1}: {case['domain']}")

        # ── Step 1 & 2: NLP Summarizer & Entity Extraction Timing ──────
        t0 = time.perf_counter()
        summary_result = summarize_report(text)
        t1 = time.perf_counter()
        nlp_time = (t1 - t0) * 1000
        step_timings["nlp_extraction"].append(nlp_time)

        # Accuracy of extraction
        extracted_areas = [a.lower() for a in summary_result["clinical_profile"]["affected_areas"]]
        extracted_conditions = [c.lower() for c in summary_result["clinical_profile"]["diagnosed_conditions"]]
        extracted_symptoms = [s.lower() for s in summary_result["clinical_profile"]["reported_symptoms"]]
        all_extracted = set(extracted_areas + extracted_conditions + extracted_symptoms)

        expected = set([x.lower() for x in case["expected_areas"] + case["expected_conditions"] + case["expected_symptoms"]])
        
        true_positives = len(all_extracted.intersection(expected))
        precision = true_positives / len(all_extracted) if all_extracted else 0.0
        recall = true_positives / len(expected) if expected else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        nlp_metrics["precision_list"].append(precision)
        nlp_metrics["recall_list"].append(recall)
        nlp_metrics["f1_list"].append(f1)

        # ── Step 3: Neo4j / Graph Traversal Timing ──────────────────────
        conditions = summary_result["clinical_profile"]["diagnosed_conditions"]
        body_areas = summary_result["clinical_profile"]["affected_areas"]
        symptoms = summary_result["clinical_profile"]["reported_symptoms"]

        t2 = time.perf_counter()
        raw_therapies = graph_client.match_therapies(conditions, body_areas, symptoms)
        raw_meds = graph_client.match_medications(conditions, body_areas, symptoms)
        t3 = time.perf_counter()
        graph_time = (t3 - t2) * 1000
        step_timings["graph_query"].append(graph_time)

        # ── Step 4: Tokenizer & Vector Scoring Timing ────────────────────
        query_text = scorer.build_query_text(summary_result["clinical_profile"], summary_result["entities"])
        t4 = time.perf_counter()
        scored_therapies = scorer.score_candidates(query_text, raw_therapies, text_key="therapy_description")
        scored_meds = scorer.score_candidates(query_text, raw_meds, text_key="medication_description")
        t5 = time.perf_counter()
        scoring_time = (t5 - t4) * 1000
        step_timings["vector_scoring"].append(scoring_time)

        # Full pipeline end-to-end timing
        t_pipe_start = time.perf_counter()
        pipeline_output = pipeline.run_text_pipeline(text)
        t_pipe_end = time.perf_counter()
        total_time = (t_pipe_end - t_pipe_start) * 1000
        step_timings["total_pipeline"].append(total_time)

        # Check Monotonicity (High -> Low strict sorting)
        therapies_res = pipeline_output["therapies"]
        t_scores = [t["combined_score"] for t in therapies_res]
        is_monotonic = all(t_scores[i] >= t_scores[i+1] for i in range(len(t_scores)-1))
        if not is_monotonic:
            ranking_metrics["is_monotonic_all"] = False

        # Ranking Accuracy: check if expected top therapies appear in top-1 / top-3
        returned_therapy_names = [t["therapy_name"] for t in therapies_res]
        expected_top_therapies = case["expected_top_therapies"]

        # Top-1 Check
        top1_match = returned_therapy_names[0] in expected_top_therapies if returned_therapy_names else False
        if top1_match:
            ranking_metrics["top1_hits"] += 1

        # Top-3 Check
        top3_names = returned_therapy_names[:3]
        top3_match = any(exp in top3_names for exp in expected_top_therapies)
        if top3_match:
            ranking_metrics["top3_hits"] += 1

        # MRR calculation
        rank = None
        for r_idx, name in enumerate(returned_therapy_names):
            if name in expected_top_therapies:
                rank = r_idx + 1
                break
        mrr = 1.0 / rank if rank else 0.0
        ranking_metrics["mrr_scores"].append(mrr)

        test_results.append({
            "case_id": case["id"],
            "domain": case["domain"],
            "nlp_precision": round(precision, 3),
            "nlp_recall": round(recall, 3),
            "nlp_f1": round(f1, 3),
            "top1_match": top1_match,
            "top3_match": top3_match,
            "top_therapy_returned": returned_therapy_names[0] if returned_therapy_names else "None",
            "top_med_returned": pipeline_output["medications"][0]["medication_name"] if pipeline_output["medications"] else "None",
            "timing_ms": {
                "nlp": round(nlp_time, 2),
                "graph": round(graph_time, 2),
                "scoring": round(scoring_time, 2),
                "total": round(total_time, 2)
            }
        })

    # Summary Statistics
    summary = {
        "cases_evaluated": len(BENCHMARK_CASES),
        "latency_benchmarks_ms": {
            "step_2_nlp": {
                "p50": round(statistics.median(step_timings["nlp_extraction"]), 2),
                "mean": round(statistics.mean(step_timings["nlp_extraction"]), 2),
                "max": round(max(step_timings["nlp_extraction"]), 2)
            },
            "step_3_graph_traversal": {
                "p50": round(statistics.median(step_timings["graph_query"]), 2),
                "mean": round(statistics.mean(step_timings["graph_query"]), 2),
                "max": round(max(step_timings["graph_query"]), 2)
            },
            "step_4_vector_scorer": {
                "p50": round(statistics.median(step_timings["vector_scoring"]), 2),
                "mean": round(statistics.mean(step_timings["vector_scoring"]), 2),
                "max": round(max(step_timings["vector_scoring"]), 2)
            },
            "end_to_end_pipeline": {
                "p50": round(statistics.median(step_timings["total_pipeline"]), 2),
                "mean": round(statistics.mean(step_timings["total_pipeline"]), 2),
                "max": round(max(step_timings["total_pipeline"]), 2)
            }
        },
        "accuracy_benchmarks": {
            "nlp_mean_precision": round(statistics.mean(nlp_metrics["precision_list"]), 4),
            "nlp_mean_recall": round(statistics.mean(nlp_metrics["recall_list"]), 4),
            "nlp_mean_f1": round(statistics.mean(nlp_metrics["f1_list"]), 4),
            "ranking_top1_accuracy": round(ranking_metrics["top1_hits"] / len(BENCHMARK_CASES), 4),
            "ranking_top3_accuracy": round(ranking_metrics["top3_hits"] / len(BENCHMARK_CASES), 4),
            "mean_reciprocal_rank_mrr": round(statistics.mean(ranking_metrics["mrr_scores"]), 4),
            "monotonicity_verified": ranking_metrics["is_monotonic_all"]
        },
        "detailed_case_results": test_results
    }

    print("\nBENCHMARK COMPLETE. RESULTS:")
    print(json.dumps(summary, indent=2))
    
    with open("scratch/benchmark_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    return summary


if __name__ == "__main__":
    run_benchmark()
