"""
MedGraph Therapy Engine — Medical Report Summarizer & NLP Pipeline.

Extracts clinically relevant information from OCR text using:
  1. spaCy (MIT Licensed) — local NLP for sentence segmentation and NER when installed.
  2. Built-in Medical PhraseMatcher — regex-compiled Trie/pattern matcher over the medical
     lexicon for body areas, conditions, symptoms, severity, imaging & lab findings.
  3. Extractive Summarization — scores sentences based on medical keyword density.

NO API keys. NO cloud services. Runs entirely on the LOCAL device.
"""

import re
from collections import defaultdict
from typing import Optional

from app.nlp.medical_lexicon import (
    BODY_AREAS,
    CONDITIONS,
    SYMPTOMS,
    SEVERITY,
    IMAGING_FINDINGS,
    LAB_MARKERS,
    get_all_keywords_flat,
)

# ── Optional spaCy import with automatic fallback ──────────────────
try:
    import spacy
    from spacy.matcher import PhraseMatcher
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
    HAS_SPACY = True
except Exception:
    HAS_SPACY = False
    nlp = None

_flat_keywords = get_all_keywords_flat()

# Pre-compile regex patterns for fast matching if spaCy is unavailable
_COMPILED_PATTERNS = []
# Sort keywords by length descending so longer multi-word phrases match first
sorted_keywords = sorted(_flat_keywords.keys(), key=lambda k: len(k), reverse=True)
for kw in sorted_keywords:
    pattern = re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE)
    _COMPILED_PATTERNS.append((pattern, kw, _flat_keywords[kw]))


def extract_medical_entities(text: str) -> dict:
    """
    Extract medical entities from text using rule-based matching
    against the medical lexicon.
    """
    found_entities: dict[str, set] = {
        "body_area": set(),
        "condition": set(),
        "symptom": set(),
        "severity": set(),
        "imaging": set(),
        "lab_marker": set(),
    }
    entities_raw = []
    text_lower = text.lower()

    if HAS_SPACY and nlp is not None:
        try:
            doc = nlp(text_lower)
            matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
            cat_patterns = defaultdict(list)
            for keyword, category in _flat_keywords.items():
                cat_type = category.split(":")[0]
                cat_patterns[cat_type].append(nlp.make_doc(keyword))
            for cat_type, patterns in cat_patterns.items():
                matcher.add(cat_type, patterns)

            matches = matcher(doc)
            for match_id, start, end in matches:
                span_text = doc[start:end].text
                cat_type = nlp.vocab.strings[match_id]
                full_cat = _flat_keywords.get(span_text, cat_type)
                sub_cat = full_cat.split(":")[-1] if ":" in full_cat else span_text
                found_entities.setdefault(cat_type, set()).add(sub_cat)
                entities_raw.append((span_text, full_cat))
        except Exception:
            # Fallback to compiled regex
            _regex_extract(text, found_entities, entities_raw)
    else:
        _regex_extract(text, found_entities, entities_raw)

    # Regex-based number extraction (measurements)
    measurement_pattern = re.compile(
        r'(\d+\.?\d*)\s*(mm|cm|ml|mg|mg/dl|g/dl|%|degrees?|°)\b',
        re.IGNORECASE
    )
    measurements = [
        {"value": float(m.group(1)), "unit": m.group(2).lower()}
        for m in measurement_pattern.finditer(text)
    ]

    return {
        "body_areas": sorted(found_entities.get("body_area", set())),
        "conditions": sorted(found_entities.get("condition", set())),
        "symptoms": sorted(found_entities.get("symptom", set())),
        "severity": sorted(found_entities.get("severity", set())),
        "imaging_findings": sorted(found_entities.get("imaging", set())),
        "lab_markers": sorted(found_entities.get("lab_marker", set())),
        "measurements": measurements,
        "entities_raw": entities_raw,
    }


def _regex_extract(text: str, found_entities: dict, entities_raw: list):
    """Fast regex matching over pre-compiled patterns."""
    text_lower = text.lower()
    for pattern, kw, full_cat in _COMPILED_PATTERNS:
        if pattern.search(text_lower):
            cat_type = full_cat.split(":")[0]
            sub_cat = full_cat.split(":")[-1] if ":" in full_cat else kw
            found_entities.setdefault(cat_type, set()).add(sub_cat)
            entities_raw.append((kw, full_cat))


def compute_sentence_scores(text: str) -> list[dict]:
    """
    Score each sentence by medical keyword density.
    Used for extractive summarization.
    """
    # Sentence splitting (works with or without spacy)
    if HAS_SPACY and nlp is not None:
        try:
            doc = nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents]
        except Exception:
            sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', text) if s.strip()]
    else:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', text) if s.strip()]

    scored_sentences = []
    for sent_text in sentences:
        if len(sent_text) < 10:
            continue

        sent_lower = sent_text.lower()
        keyword_hits = 0
        for pattern, _, _ in _COMPILED_PATTERNS:
            if pattern.search(sent_lower):
                keyword_hits += 1

        word_count = max(len(sent_text.split()), 1)
        density = keyword_hits / word_count

        # Severity bonus
        severity_bonus = 0.0
        for sev_terms in SEVERITY.values():
            for term in sev_terms:
                if term in sent_lower:
                    severity_bonus += 0.15
                    break

        score = density + severity_bonus

        scored_sentences.append({
            "sentence": sent_text,
            "score": round(score, 4),
            "keyword_hits": keyword_hits,
        })

    scored_sentences.sort(key=lambda s: s["score"], reverse=True)
    return scored_sentences


def summarize_report(text: str, max_sentences: int = 8) -> dict:
    """
    Generate structured medical summary and clinical profile from OCR text.
    """
    entities = extract_medical_entities(text)
    scored = compute_sentence_scores(text)
    top_sentences = scored[:max_sentences]

    clinical_profile = {
        "affected_areas": entities["body_areas"],
        "diagnosed_conditions": entities["conditions"],
        "reported_symptoms": entities["symptoms"],
        "severity_level": _determine_overall_severity(entities["severity"]),
        "imaging_notes": entities["imaging_findings"],
        "lab_observations": entities["lab_markers"],
        "measurements": entities["measurements"],
    }

    # Build search keywords for Neo4j matching
    search_keywords = []
    search_keywords.extend(entities["conditions"])
    search_keywords.extend(entities["symptoms"])
    search_keywords.extend(entities["body_areas"])
    
    seen = set()
    unique_keywords = []
    for kw in search_keywords:
        if kw not in seen:
            seen.add(kw)
            unique_keywords.append(kw)

    return {
        "entities": entities,
        "summary_sentences": top_sentences,
        "clinical_profile": clinical_profile,
        "search_keywords": unique_keywords,
    }


def _determine_overall_severity(severity_tags: list[str]) -> str:
    priority_order = ["severe", "moderate", "chronic", "mild"]
    for level in priority_order:
        if level in severity_tags:
            return level
    return "undetermined"
