"""
MedGraph Therapy Engine — Tokenization & Relevance Scorer.

Uses TF-IDF vectorization (scikit-learn, BSD licensed) to convert
extracted medical keywords and Neo4j graph results into numerical
vectors, then computes cosine similarity to rank therapy and medication
matches from HIGHEST to LOWEST relevance.

This is the core scoring engine that sits between the NLP summary
and the Neo4j graph results to produce the final ranked output.

NO API keys. NO cloud. Runs entirely on LOCAL device using CPU.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import TFIDF_MAX_FEATURES, TFIDF_NGRAM_RANGE, MIN_CONFIDENCE_THRESHOLD


class MedicalTokenScorer:
    """
    Tokenizes medical text and therapy/medication descriptions using TF-IDF,
    then scores matches via cosine similarity.

    Architecture:
        Patient Report Text → TF-IDF Vector (query vector)
        Each Therapy/Medication description → TF-IDF Vector (candidate vectors)
        Score = cosine_similarity(query_vector, candidate_vector)
    """

    def __init__(self):
        # Optimized for instant sub-millisecond clinical token scoring
        self._vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),  # Unigrams & bigrams provide optimal speed + clinical precision
            stop_words="english",
            lowercase=True,
            sublinear_tf=True,
        )
        self._is_fitted = False

    def score_candidates(
        self,
        query_text: str,
        candidates: list[dict],
        text_key: str = "description",
        min_threshold: float = None,
    ) -> list[dict]:
        """
        Score a list of candidate therapies/medications against the patient's
        extracted medical text using TF-IDF + cosine similarity.

        Args:
            query_text: The patient's medical summary text (keywords, conditions, etc.)
            candidates: List of dicts, each containing at least a `text_key` field
                        with the therapy/medication description.
            text_key: The key in each candidate dict that holds the text to compare.
            min_threshold: Minimum cosine similarity to include in results.

        Returns:
            List of candidate dicts with added "relevance_score" field,
            sorted from highest to lowest score.
        """
        if not candidates:
            return []

        threshold = min_threshold if min_threshold is not None else MIN_CONFIDENCE_THRESHOLD

        # Build the corpus: [query, candidate_0, candidate_1, ...]
        candidate_texts = [c.get(text_key, "") for c in candidates]
        corpus = [query_text] + candidate_texts

        # Fit and transform TF-IDF
        tfidf_matrix = self._vectorizer.fit_transform(corpus)
        self._is_fitted = True

        # Query vector is row 0, candidates are rows 1..N
        query_vector = tfidf_matrix[0:1]
        candidate_vectors = tfidf_matrix[1:]

        # Compute cosine similarities
        similarities = cosine_similarity(query_vector, candidate_vectors).flatten()

        # Attach scores and filter
        scored_candidates = []
        for idx, candidate in enumerate(candidates):
            score = float(similarities[idx])
            if score >= threshold:
                scored = {**candidate, "relevance_score": round(score, 4)}
                scored_candidates.append(scored)

        # Sort by relevance_score descending (HIGH → LOW)
        scored_candidates.sort(key=lambda c: c["relevance_score"], reverse=True)

        return scored_candidates

    def build_query_text(self, clinical_profile: dict, entities: dict) -> str:
        """
        Build a rich query text string from the NLP-extracted clinical profile.
        Concatenates conditions, symptoms, body areas, and severity to create
        a maximally-informative TF-IDF query vector.

        This is where tokenization quality directly affects matching accuracy.
        """
        parts = []

        # Conditions are highest priority — repeat for emphasis in TF-IDF
        conditions = clinical_profile.get("diagnosed_conditions", [])
        for condition in conditions:
            parts.append(condition)
            parts.append(condition)  # Double-weight conditions

        # Symptoms
        symptoms = clinical_profile.get("reported_symptoms", [])
        parts.extend(symptoms)

        # Affected areas
        areas = clinical_profile.get("affected_areas", [])
        parts.extend(areas)

        # Severity (affects therapy intensity selection)
        severity = clinical_profile.get("severity_level", "")
        if severity and severity != "undetermined":
            parts.append(severity)
            parts.append(f"{severity} condition")

        # Lab and imaging observations
        parts.extend(clinical_profile.get("lab_observations", []))
        parts.extend(clinical_profile.get("imaging_notes", []))

        # Also include raw entity keywords for maximum coverage
        for entity_text, category in entities.get("entities_raw", []):
            parts.append(entity_text)

        return " ".join(parts)

    def compute_keyword_overlap_score(
        self, keywords: list[str], candidate_text: str
    ) -> float:
        """
        Simple keyword overlap scoring as a secondary signal.
        Returns the fraction of query keywords found in the candidate text.
        """
        if not keywords:
            return 0.0

        candidate_lower = candidate_text.lower()
        hits = sum(1 for kw in keywords if kw.lower() in candidate_lower)
        return round(hits / len(keywords), 4)

    def combined_score(
        self,
        tfidf_score: float,
        keyword_overlap: float,
        graph_weight: float = 1.0,
        tfidf_weight: float = 0.5,
        overlap_weight: float = 0.3,
        graph_factor: float = 0.2,
    ) -> float:
        """
        Compute a weighted combined score from multiple signals:
          - TF-IDF cosine similarity
          - Keyword overlap ratio
          - Neo4j graph relationship weight (priority from graph)

        Formula:
          final = (tfidf_weight * tfidf_score)
                + (overlap_weight * keyword_overlap)
                + (graph_factor * graph_weight)
        """
        final = (
            tfidf_weight * tfidf_score
            + overlap_weight * keyword_overlap
            + graph_factor * graph_weight
        )
        return round(min(final, 1.0), 4)


# Module-level singleton for reuse
scorer = MedicalTokenScorer()
