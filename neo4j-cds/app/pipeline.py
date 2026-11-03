"""
MedGraph Therapy Engine — Core Diagnostic & Sorting Pipeline.

Coordinates the 4-stage local pipeline:
  1. Local OCR (Image-to-Text via Tesseract/Pillow)
  2. Local Clinical NLP Summarizer (Medical Lexicon & Extractive Density)
  3. Neo4j Knowledge Graph Traversal (Bolt driver & Cypher queries)
  4. Tokenization & Vector Scorer (TF-IDF vectorizer & Cosine similarity ranking)

Outputs:
  - Ranked Therapies (Sorted HIGH to LOW by combined score)
  - Ranked Medications & Dosages (Sorted HIGH to LOW by combined score)
  - Drug-Drug Interaction Safety Verification
  - Clinical Summary Profile (Damaged areas, Swollen regions, Blood clots, Symptoms)
"""

import io
from pathlib import Path
from PIL import Image

from app.ocr.extractor import extract_text_from_pil_image, extract_text_from_image
from app.nlp.summarizer import summarize_report
from app.graph.client import graph_client
from app.tokenizer.scorer import scorer


class MedGraphPipeline:
    def __init__(self):
        self.graph = graph_client
        self.scorer = scorer

    def run_image_pipeline(self, image_bytes: bytes, filename: str = "report.png") -> dict:
        """Execute full pipeline starting from uploaded report image."""
        # 1. OCR Extraction
        pil_img = Image.open(io.BytesIO(image_bytes))
        ocr_result = extract_text_from_pil_image(pil_img, source_filename=filename)
        raw_text = ocr_result.get("raw_text", "")

        return self.run_text_pipeline(raw_text, ocr_metadata=ocr_result)

    def run_text_pipeline(self, raw_text: str, ocr_metadata: dict = None) -> dict:
        """Execute pipeline from clinical report text directly."""
        if not ocr_metadata:
            ocr_metadata = {
                "raw_text": raw_text,
                "confidence": 100.0,
                "word_count": len(raw_text.split()),
                "lines": [l.strip() for l in raw_text.split("\n") if l.strip()],
                "engine": "direct_input",
                "status": "success",
            }

        # 2. Local Medical NLP Summarization
        summary_result = summarize_report(raw_text)
        clinical_profile = summary_result["clinical_profile"]
        entities = summary_result["entities"]
        keywords = summary_result["search_keywords"]

        conditions = clinical_profile.get("diagnosed_conditions", [])
        body_areas = clinical_profile.get("affected_areas", [])
        symptoms = clinical_profile.get("reported_symptoms", [])

        # 3. Neo4j Graph Traversal & Cypher Matching
        raw_therapies = self.graph.match_therapies(
            conditions=conditions,
            body_areas=body_areas,
            symptoms=symptoms,
        )

        raw_medications = self.graph.match_medications(
            conditions=conditions,
            body_areas=body_areas,
            symptoms=symptoms,
        )

        # 4. Tokenization & Vector Relevance Scoring
        # Build query vector representation from clinical profile
        query_text = self.scorer.build_query_text(clinical_profile, entities)

        # Score therapies using TF-IDF tokenization & cosine similarity
        scored_therapies = []
        if raw_therapies:
            tfidf_scored_therapies = self.scorer.score_candidates(
                query_text=query_text,
                candidates=raw_therapies,
                text_key="therapy_description",
                min_threshold=0.0,
            )

            for item in tfidf_scored_therapies:
                t_score = item.get("relevance_score", 0.0)
                t_text = f"{item.get('therapy_name', '')} {item.get('therapy_description', '')}"
                kw_overlap = self.scorer.compute_keyword_overlap_score(keywords, t_text)
                graph_p = item.get("graph_priority", 5) / 10.0  # normalize 1-10 to 0.1-1.0

                comb_score = self.scorer.combined_score(
                    tfidf_score=t_score,
                    keyword_overlap=kw_overlap,
                    graph_weight=graph_p,
                    tfidf_weight=0.45,
                    overlap_weight=0.30,
                    graph_factor=0.25,
                )
                scored_therapies.append({
                    **item,
                    "relevance_score": t_score,
                    "keyword_overlap": kw_overlap,
                    "combined_score": comb_score,
                })

            # Sort HIGH to LOW
            scored_therapies.sort(key=lambda x: (x["combined_score"], x.get("graph_priority", 0)), reverse=True)

        # Score medications using TF-IDF tokenization & cosine similarity
        scored_medications = []
        if raw_medications:
            tfidf_scored_meds = self.scorer.score_candidates(
                query_text=query_text,
                candidates=raw_medications,
                text_key="medication_description",
                min_threshold=0.0,
            )

            for item in tfidf_scored_meds:
                m_score = item.get("relevance_score", 0.0)
                m_text = f"{item.get('medication_name', '')} {item.get('medication_description', '')}"
                kw_overlap = self.scorer.compute_keyword_overlap_score(keywords, m_text)
                graph_p = item.get("graph_priority", 5) / 10.0

                comb_score = self.scorer.combined_score(
                    tfidf_score=m_score,
                    keyword_overlap=kw_overlap,
                    graph_weight=graph_p,
                    tfidf_weight=0.45,
                    overlap_weight=0.30,
                    graph_factor=0.25,
                )
                scored_medications.append({
                    **item,
                    "relevance_score": m_score,
                    "keyword_overlap": kw_overlap,
                    "combined_score": comb_score,
                })

            # Sort HIGH to LOW
            scored_medications.sort(key=lambda x: (x["combined_score"], x.get("graph_priority", 0)), reverse=True)

        # 5. Check Drug-Drug Interactions
        med_ids = [m.get("medication_id") for m in scored_medications if m.get("medication_id")]
        interactions = self.graph.check_drug_interactions(med_ids[:10])

        # Graph matched diseases summary
        matched_disease_names = set()
        for t in scored_therapies:
            matched_disease_names.update(t.get("matching_diseases", []))
        for m in scored_medications:
            matched_disease_names.update(m.get("matching_diseases", []))

        return {
            "ocr": ocr_metadata,
            "summary": summary_result,
            "therapies": scored_therapies,
            "medications": scored_medications,
            "drug_interactions": interactions,
            "matched_diseases": list(matched_disease_names),
            "stats": {
                "therapies_count": len(scored_therapies),
                "medications_count": len(scored_medications),
                "interactions_count": len(interactions),
                "graph_mode": self.graph.health_check().get("mode", "Local"),
            }
        }


# Module singleton
pipeline = MedGraphPipeline()
