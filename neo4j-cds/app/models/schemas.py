"""
MedGraph Therapy Engine — Pydantic Response Schemas.
"""

from pydantic import BaseModel
from typing import Optional


class OCRResult(BaseModel):
    raw_text: str
    confidence: float
    word_count: int
    lines: list[str]


class ClinicalProfile(BaseModel):
    affected_areas: list[str]
    diagnosed_conditions: list[str]
    reported_symptoms: list[str]
    severity_level: str
    imaging_notes: list[str]
    lab_observations: list[str]
    measurements: list[dict]


class ScoredSentence(BaseModel):
    sentence: str
    score: float
    keyword_hits: int


class NLPSummary(BaseModel):
    clinical_profile: ClinicalProfile
    summary_sentences: list[ScoredSentence]
    search_keywords: list[str]


class TherapyMatch(BaseModel):
    therapy_id: Optional[str] = None
    therapy_name: str
    therapy_description: str
    therapy_type: Optional[str] = None
    duration: Optional[str] = None
    contraindications: Optional[str] = None
    graph_priority: Optional[int] = None
    evidence_level: Optional[str] = None
    matching_diseases: list[str] = []
    target_areas: list[str] = []
    relevance_score: float = 0.0
    combined_score: float = 0.0


class MedicationMatch(BaseModel):
    medication_id: Optional[str] = None
    medication_name: str
    medication_description: str
    dosage: Optional[str] = None
    form: Optional[str] = None
    frequency: Optional[str] = None
    contraindications: Optional[str] = None
    graph_priority: Optional[int] = None
    evidence_level: Optional[str] = None
    matching_diseases: list[str] = []
    relevance_score: float = 0.0
    combined_score: float = 0.0


class DrugInteraction(BaseModel):
    drug_a: str
    drug_b: str
    severity: str
    interaction_note: str


class AnalysisResponse(BaseModel):
    ocr: OCRResult
    summary: NLPSummary
    therapies: list[TherapyMatch]
    medications: list[MedicationMatch]
    drug_interactions: list[DrugInteraction]
    matched_diseases: list[dict]


class HealthCheckResponse(BaseModel):
    neo4j: dict
    services: dict
