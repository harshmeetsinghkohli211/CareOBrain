"""
MedGraph Therapy Engine — Configuration.

All settings are LOCAL-only. No cloud API keys. No external service calls.
Environment variables control Neo4j connection and local paths.
"""

import os
from pathlib import Path

# ── Project Paths ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR.mkdir(exist_ok=True)

# ── Neo4j Local Connection (Bolt Protocol) ─────────────────────────
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# ── Tesseract OCR Local Path ───────────────────────────────────────
# On Windows, set this to the Tesseract executable path.
# On Linux/Mac, usually auto-detected from PATH.
TESSERACT_CMD = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# ── NLP Settings ───────────────────────────────────────────────────
SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")

# ── Tokenizer / Scorer Settings ───────────────────────────────────
# TF-IDF vectorizer parameters
TFIDF_MAX_FEATURES = 5000
TFIDF_NGRAM_RANGE = (1, 3)  # Unigrams through trigrams for medical phrases

# Minimum confidence threshold for therapy/medication recommendations
MIN_CONFIDENCE_THRESHOLD = 0.15
