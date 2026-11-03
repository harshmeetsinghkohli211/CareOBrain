"""
MedGraph Therapy Engine — FastAPI Web Application.

Endpoints:
  - POST /api/upload: Upload medical report image for OCR + NLP + Neo4j + Vector Ranking
  - POST /api/analyze-text: Direct text analysis for clinical notes
  - GET  /api/sample-reports: Pre-built clinical reports across pathologies
  - GET  /api/diseases: List of all 40+ supported conditions
  - GET  /api/health: System health and Neo4j connection status
  - POST /api/seed-graph: Seed Neo4j database
  - Static file hosting for frontend UI
"""

import os
import json
import time
import logging
from typing import Optional, List
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from app.config import STATIC_DIR, UPLOAD_DIR
from app.pipeline import pipeline
from app.graph.client import graph_client
from app.graph.seed_data import seed_database
from app.ocr.extractor import is_tesseract_installed

logger = logging.getLogger("medgraph.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm ML & Vector models during startup so first user request is instant
    try:
        pipeline.run_text_pipeline("Warmup diagnostic model")
    except Exception:
        pass
    yield

app = FastAPI(
    title="MedGraph Therapy & Medication Engine",
    description="Local Clinical Intelligence System combining OCR, NLP Extractive Summarization, Neo4j Graph Queries, and TF-IDF Vector Ranking.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)


class TextAnalysisRequest(BaseModel):
    text: str


@app.get("/")
def get_index():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "MedGraph API is running. Place index.html into static/ directory."}


@app.post("/api/upload")
async def upload_and_analyze(file: UploadFile = File(...)):
    """
    Upload a medical report image (PNG, JPG, TIFF, WebP, etc.).
    Runs full 4-stage local pipeline:
      1. OCR text extraction
      2. Clinical NLP summary & profile
      3. Neo4j graph traversal
      4. TF-IDF vectorization & high-to-low ranking
    """
    t_start = time.time()
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    save_path = UPLOAD_DIR / file.filename
    try:
        with open(save_path, "wb") as f:
            f.write(content)
    except Exception:
        pass

    try:
        result = pipeline.run_image_pipeline(content, filename=file.filename)
        duration_ms = round((time.time() - t_start) * 1000, 1)
        result["execution_time_ms"] = duration_ms
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")


@app.post("/api/analyze-text")
def analyze_text(request: TextAnalysisRequest):
    """
    Analyze direct clinical text or transcription with timing breakdown.
    """
    t_start = time.time()
    if not request.text or len(request.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text is too short for clinical analysis")

    try:
        result = pipeline.run_text_pipeline(request.text)
        duration_ms = round((time.time() - t_start) * 1000, 1)
        result["execution_time_ms"] = duration_ms
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")


@app.get("/api/sample-reports")
def get_sample_reports():
    """
    Provides pre-curated realistic medical reports for instant 1-click evaluation.
    """
    return [
        {
            "id": "sample_knee_acl",
            "title": "Orthopedic MRI: Acute ACL & Meniscus Tear with Swelling",
            "category": "Orthopedics & Sports Medicine",
            "body_area": "Right Knee",
            "text": (
                "CLINICAL INDICATION: 28-year-old athlete following non-contact deceleration injury to right knee with audible pop.\n\n"
                "MAGNETIC RESONANCE IMAGING (MRI) RIGHT KNEE:\n"
                "- Anterior Cruciate Ligament (ACL): Complete disruption / grade III tear of mid-substance fibers with retraction.\n"
                "- Meniscus: Radial tear noted in posterior horn of the medial meniscus.\n"
                "- Effusion: Extensive intra-articular joint effusion and significant soft tissue swelling around suprapatellar pouch.\n"
                "- Bone Contusions: Marked kissing bone contusions involving posterior lateral tibial plateau and lateral femoral condyle.\n"
                "- Range of Motion: Severely restricted secondary to acute pain, effusion, and mechanical joint instability.\n\n"
                "IMPRESSION: Acute complete ACL rupture accompanied by medial meniscus tear, severe joint swelling, and lateral compartment bone contusions."
            )
        },
        {
            "id": "sample_dvt_clot",
            "title": "Vascular Doppler: Deep Vein Thrombosis & Blood Clot",
            "category": "Vascular & Hematology",
            "body_area": "Right Calf & Leg",
            "text": (
                "CLINICAL INDICATION: 54-year-old female presenting with 48 hours of progressive right lower extremity swelling, warmth, and erythema following a 14-hour transcontinental flight.\n\n"
                "DUPLEX ULTRASOUND OF LOWER EXTREMITY DEEP VEINS:\n"
                "- Right Popliteal Vein: Demonstrates lack of compressibility with internal hypoechoic material consistent with acute occlusive blood clot (thrombus).\n"
                "- Posterior Tibial Veins: Non-compressible segments identified with absent color Doppler flow signaling extended thrombosis.\n"
                "- Edema: Marked subcutaneous edema and swollen soft tissue throughout the right calf compartment.\n"
                "- Superficial System: Greater saphenous vein is patent without evidence of superficial thrombophlebitis.\n\n"
                "IMPRESSION: Acute deep vein thrombosis (DVT) involving the right popliteal and posterior tibial veins with significant leg swelling. High risk for pulmonary embolism."
            )
        },
        {
            "id": "sample_brain_stroke",
            "title": "Neurology CT/MRI: Acute Ischemic Stroke with Brain Lesion",
            "category": "Neurology & Cerebrovascular",
            "body_area": "Brain & Cranial",
            "text": (
                "CLINICAL INDICATION: 66-year-old male with sudden onset of left hemiparesis, facial droop, and dysarthria presenting within 2.5 hours of symptom onset.\n\n"
                "DIFFUSION WEIGHTED MRI & NON-CONTRAST CT OF BRAIN:\n"
                "- Findings: High signal intensity on DWI with corresponding ADC hypointensity in the right middle cerebral artery (MCA) territory.\n"
                "- Damaged Area: Focal region of acute cytotoxic edema and cerebral tissue damage involving the right corona radiata and basal ganglia measuring 3.2 cm.\n"
                "- Perfusion: Hypoperfused ischemic penumbra surrounding core infarct.\n"
                "- Hemorrhage: No evidence of intracranial hemorrhage or midline shift.\n\n"
                "IMPRESSION: Acute right MCA ischemic stroke with localized brain tissue injury and contralateral hemiparesis. Urgent thrombolytic / antiplatelet therapy evaluation required."
            )
        },
        {
            "id": "sample_spine_sciatica",
            "title": "Spine MRI: L4-L5 Disc Herniation & Sciatic Nerve Compression",
            "category": "Spinal & Orthopedics",
            "body_area": "Lumbar Spine & Leg",
            "text": (
                "CLINICAL INDICATION: 45-year-old male reporting 3 weeks of excruciating lower back pain radiating down the posterior left leg into the lateral foot (sciatica).\n\n"
                "MRI LUMBAR SPINE (L1-S1):\n"
                "- L4-L5 Level: Prominent 6.5 mm posterolateral disc protrusion / herniation encroaching upon the left lateral recess.\n"
                "- Nerve Root: Definite compression of the traversing left L5 nerve root with surrounding inflammatory edema.\n"
                "- L5-S1 Level: Mild disc desiccation with minor concentric bulge, without significant canal stenosis.\n"
                "- Symptoms: Severe numbness and paresthesia in the L5 dermatomal distribution and paraspinal muscle spasms.\n\n"
                "IMPRESSION: Extruded L4-L5 intervertebral disc herniation causing severe left L5 radiculopathy and sciatic nerve impingement."
            )
        },
        {
            "id": "sample_diabetic_ulcer",
            "title": "Endocrine & Wound Care: Diabetic Foot Ulcer & Neuropathy",
            "category": "Endocrine & Wound Care",
            "body_area": "Right Foot & Ankle",
            "text": (
                "CLINICAL INDICATION: 61-year-old patient with poorly managed Type 2 Diabetes (HbA1c 9.4%) presenting with chronic non-healing plantar lesion.\n\n"
                "PHYSICAL EXAMINATION & WOUND ASSESSMENT:\n"
                "- Inspection: Grade 2 neuropathic ulcer on the plantar surface of the first metatarsal head measuring 2.4 cm x 1.8 cm.\n"
                "- Tissue Characteristics: Hyperkeratotic margins with granulating wound bed. Mild perilesional erythema and localized warmth.\n"
                "- Neurological: Absent protective sensation bilaterally via 10g Semmes-Weinstein monofilament test, consistent with advanced peripheral neuropathy.\n"
                "- Vascular: Palpable dorsalis pedis pulse; non-critical limb ischemia.\n\n"
                "IMPRESSION: Chronic diabetic neuropathic foot ulcer with underlying peripheral nerve damage. Requires debridement, offloading therapy, and glycemic optimization."
            )
        },
        {
            "id": "sample_arthritis_joint",
            "title": "Rheumatology: Rheumatoid Arthritis with Severe Synovitis",
            "category": "Autoimmune & Rheumatology",
            "body_area": "Bilateral Hands & Wrists",
            "text": (
                "CLINICAL INDICATION: 39-year-old female with persistent bilateral morning joint stiffness lasting over 90 minutes, hand swelling, and fatigue.\n\n"
                "ULTRASOUND & RADIOGRAPHIC FINDINGS (WRISTS & MCP JOINTS):\n"
                "- Synovium: Marked active power Doppler synovitis with hypoechoic synovial hypertrophy in 2nd and 3rd MCP joints bilaterally.\n"
                "- Erosions: Marginal cortical bone erosions noted at the radial aspect of the right second metacarpal head.\n"
                "- Joint Space: Mild uniform joint space narrowing in radiocarpal joints.\n"
                "- Laboratory Markers: Rheumatoid factor (RF) 142 IU/ml (high positive), anti-CCP antibody >200 U/ml, elevated CRP 28 mg/L.\n\n"
                "IMPRESSION: Active seropositive rheumatoid arthritis with progressive erosive disease, marked synovial swelling, and symmetric inflammatory arthropathy."
            )
        }
    ]


@app.get("/api/diseases")
def list_diseases():
    """List all supported diseases and their treatment capabilities."""
    diseases = graph_client.get_all_diseases()
    return {"count": len(diseases), "diseases": diseases}


@app.get("/api/health")
def health_check():
    """System health check across all local components."""
    graph_health = graph_client.health_check()
    return {
        "status": "healthy",
        "ocr": {
            "tesseract_installed": is_tesseract_installed(),
            "status": "ready (native)" if is_tesseract_installed() else "ready (adaptive heuristic)",
        },
        "nlp": {
            "engine": "spaCy v3 + Medical Lexicon PhraseMatcher",
            "status": "ready",
        },
        "tokenizer": {
            "engine": "scikit-learn TF-IDF Vectorizer",
            "status": "ready",
        },
        "graph": graph_health,
    }


@app.post("/api/seed-graph")
def trigger_seed_database():
    """
    Seed or refresh the Neo4j database with medical nodes and relationships.
    """
    if not graph_client.is_live:
        return {
            "status": "skipped",
            "message": "Neo4j Bolt server is offline. Running on embedded in-memory graph engine.",
            "stats": graph_client.get_stats(),
        }
    try:
        stats = seed_database(graph_client.driver)
        return {"status": "success", "seeded_data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed Neo4j: {str(e)}")


# ── Doctor Prescriptions & Patient Scans Storage ───────────────────────
PRESCRIPTIONS_FILE = UPLOAD_DIR / "prescriptions.json"
PATIENT_SCANS_FILE = UPLOAD_DIR / "patient_scans.json"

class PrescriptionsPayload(BaseModel):
    prescriptions: List[dict]


@app.get("/api/prescriptions")
def get_prescriptions():
    """Retrieve all doctor-prescribed therapies and activities."""
    if PRESCRIPTIONS_FILE.exists():
        try:
            with open(PRESCRIPTIONS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {"status": "success", "prescriptions": data}
        except Exception as e:
            logger.error(f"Error reading prescriptions: {e}")
    return {"status": "success", "prescriptions": []}


@app.post("/api/prescriptions")
def save_prescriptions(payload: PrescriptionsPayload):
    """Save or update doctor-prescribed therapies and activities."""
    try:
        with open(PRESCRIPTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(payload.prescriptions, f, indent=2)
        return {
            "status": "success",
            "count": len(payload.prescriptions),
            "prescriptions": payload.prescriptions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save prescriptions: {str(e)}")


@app.get("/api/patient-scans")
def list_patient_scans():
    """List medical reports & scans uploaded by patient for doctor examination."""
    if PATIENT_SCANS_FILE.exists():
        try:
            with open(PATIENT_SCANS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {"status": "success", "scans": data}
        except Exception:
            pass
    return {"status": "success", "scans": []}


@app.post("/api/patient-scans")
async def upload_patient_scan(
    file: UploadFile = File(...),
    patient_code: str = Form("PT-7241"),
    patient_name: str = Form("Lakshmi Devi"),
    scan_type: str = Form("MRI / Radiology"),
    notes: str = Form("")
):
    """Store patient uploaded scan image ready for doctor scan."""
    content = await file.read()
    safe_name = file.filename.replace(" ", "_") if file.filename else "scan.png"
    filename = f"scan_{int(time.time())}_{safe_name}"
    save_path = UPLOAD_DIR / filename
    with open(save_path, "wb") as f:
        f.write(content)

    new_scan = {
        "id": f"scan_{int(time.time())}",
        "filename": filename,
        "original_filename": file.filename or "medical_scan.png",
        "patient_code": patient_code,
        "patient_name": patient_name,
        "scan_type": scan_type,
        "notes": notes,
        "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "ready_for_scan",
        "file_url": f"/uploads/{filename}",
    }

    scans = []
    if PATIENT_SCANS_FILE.exists():
        try:
            with open(PATIENT_SCANS_FILE, "r", encoding="utf-8") as f:
                scans = json.load(f)
        except Exception:
            scans = []
    scans.insert(0, new_scan)
    with open(PATIENT_SCANS_FILE, "w", encoding="utf-8") as f:
        json.dump(scans, f, indent=2)

    return {"status": "success", "scan": new_scan}


# Mount uploads and static assets
if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
