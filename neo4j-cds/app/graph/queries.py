"""
MedGraph Therapy Engine — Cypher Query Library.

All queries use parameterized Cypher ($param) — NEVER raw string injection.
Follows dwyl/learn-neo4j and movies-python-bolt patterns.

Graph Schema:
  (:Disease {id, name, description, icd_code, category})
  (:Symptom {id, name, description})
  (:BodyArea {id, name, region})
  (:Therapy {id, name, description, type, duration, contraindications})
  (:Medication {id, name, description, dosage, form, frequency, contraindications})

  (:Disease)-[:PRESENTS_SYMPTOM {frequency}]->(:Symptom)
  (:Disease)-[:AFFECTS_AREA]->(:BodyArea)
  (:Disease)-[:TREATED_BY {priority, evidence_level}]->(:Therapy)
  (:Disease)-[:MEDICATED_WITH {priority, evidence_level}]->(:Medication)
  (:Therapy)-[:TARGETS_AREA]->(:BodyArea)
  (:Medication)-[:INTERACTS_WITH {severity}]->(:Medication)
  (:Symptom)-[:LOCATED_AT]->(:BodyArea)
"""


# ── Match Therapies by Conditions (sorted HIGH → LOW priority) ────
MATCH_THERAPIES_BY_CONDITIONS = """
    UNWIND $conditions AS condition_name
    MATCH (d:Disease)-[r:TREATED_BY]->(t:Therapy)
    WHERE toLower(d.name) CONTAINS toLower(condition_name)
       OR toLower(d.description) CONTAINS toLower(condition_name)
       OR ANY(tag IN d.tags WHERE toLower(tag) CONTAINS toLower(condition_name))
    OPTIONAL MATCH (t)-[:TARGETS_AREA]->(ba:BodyArea)
    RETURN DISTINCT
        t.id AS therapy_id,
        t.name AS therapy_name,
        t.description AS therapy_description,
        t.type AS therapy_type,
        t.duration AS duration,
        t.contraindications AS contraindications,
        r.priority AS graph_priority,
        r.evidence_level AS evidence_level,
        collect(DISTINCT d.name) AS matching_diseases,
        collect(DISTINCT ba.name) AS target_areas
    ORDER BY r.priority DESC
"""

# ── Match Medications by Conditions (sorted HIGH → LOW priority) ──
MATCH_MEDICATIONS_BY_CONDITIONS = """
    UNWIND $conditions AS condition_name
    MATCH (d:Disease)-[r:MEDICATED_WITH]->(m:Medication)
    WHERE toLower(d.name) CONTAINS toLower(condition_name)
       OR toLower(d.description) CONTAINS toLower(condition_name)
       OR ANY(tag IN d.tags WHERE toLower(tag) CONTAINS toLower(condition_name))
    RETURN DISTINCT
        m.id AS medication_id,
        m.name AS medication_name,
        m.description AS medication_description,
        m.dosage AS dosage,
        m.form AS form,
        m.frequency AS frequency,
        m.contraindications AS contraindications,
        r.priority AS graph_priority,
        r.evidence_level AS evidence_level,
        collect(DISTINCT d.name) AS matching_diseases
    ORDER BY r.priority DESC
"""

# ── Match by Body Area + Condition (more specific) ────────────────
MATCH_THERAPIES_BY_AREA_AND_CONDITION = """
    UNWIND $conditions AS condition_name
    UNWIND $body_areas AS area_name
    MATCH (d:Disease)-[r:TREATED_BY]->(t:Therapy)
    WHERE (toLower(d.name) CONTAINS toLower(condition_name)
           OR ANY(tag IN d.tags WHERE toLower(tag) CONTAINS toLower(condition_name)))
    MATCH (d)-[:AFFECTS_AREA]->(ba:BodyArea)
    WHERE toLower(ba.name) CONTAINS toLower(area_name)
       OR toLower(ba.region) CONTAINS toLower(area_name)
    RETURN DISTINCT
        t.id AS therapy_id,
        t.name AS therapy_name,
        t.description AS therapy_description,
        t.type AS therapy_type,
        t.duration AS duration,
        r.priority AS graph_priority,
        r.evidence_level AS evidence_level,
        collect(DISTINCT d.name) AS matching_diseases,
        collect(DISTINCT ba.name) AS matched_areas
    ORDER BY r.priority DESC
"""

# ── Match Medications by Area + Condition ─────────────────────────
MATCH_MEDICATIONS_BY_AREA_AND_CONDITION = """
    UNWIND $conditions AS condition_name
    UNWIND $body_areas AS area_name
    MATCH (d:Disease)-[r:MEDICATED_WITH]->(m:Medication)
    WHERE (toLower(d.name) CONTAINS toLower(condition_name)
           OR ANY(tag IN d.tags WHERE toLower(tag) CONTAINS toLower(condition_name)))
    MATCH (d)-[:AFFECTS_AREA]->(ba:BodyArea)
    WHERE toLower(ba.name) CONTAINS toLower(area_name)
       OR toLower(ba.region) CONTAINS toLower(area_name)
    RETURN DISTINCT
        m.id AS medication_id,
        m.name AS medication_name,
        m.description AS medication_description,
        m.dosage AS dosage,
        m.form AS form,
        m.frequency AS frequency,
        r.priority AS graph_priority,
        r.evidence_level AS evidence_level,
        collect(DISTINCT d.name) AS matching_diseases,
        collect(DISTINCT ba.name) AS matched_areas
    ORDER BY r.priority DESC
"""

# ── Match by Symptoms ─────────────────────────────────────────────
MATCH_THERAPIES_BY_SYMPTOMS = """
    UNWIND $symptoms AS symptom_name
    MATCH (s:Symptom)<-[:PRESENTS_SYMPTOM]-(d:Disease)-[r:TREATED_BY]->(t:Therapy)
    WHERE toLower(s.name) CONTAINS toLower(symptom_name)
       OR toLower(s.description) CONTAINS toLower(symptom_name)
    RETURN DISTINCT
        t.id AS therapy_id,
        t.name AS therapy_name,
        t.description AS therapy_description,
        t.type AS therapy_type,
        r.priority AS graph_priority,
        collect(DISTINCT d.name) AS matching_diseases,
        collect(DISTINCT s.name) AS matched_symptoms
    ORDER BY r.priority DESC
"""

MATCH_MEDICATIONS_BY_SYMPTOMS = """
    UNWIND $symptoms AS symptom_name
    MATCH (s:Symptom)<-[:PRESENTS_SYMPTOM]-(d:Disease)-[r:MEDICATED_WITH]->(m:Medication)
    WHERE toLower(s.name) CONTAINS toLower(symptom_name)
       OR toLower(s.description) CONTAINS toLower(symptom_name)
    RETURN DISTINCT
        m.id AS medication_id,
        m.name AS medication_name,
        m.description AS medication_description,
        m.dosage AS dosage,
        m.form AS form,
        m.frequency AS frequency,
        r.priority AS graph_priority,
        collect(DISTINCT d.name) AS matching_diseases,
        collect(DISTINCT s.name) AS matched_symptoms
    ORDER BY r.priority DESC
"""

# ── Full-text search across all disease nodes ─────────────────────
FULLTEXT_SEARCH_DISEASES = """
    UNWIND $keywords AS keyword
    MATCH (d:Disease)
    WHERE toLower(d.name) CONTAINS toLower(keyword)
       OR toLower(d.description) CONTAINS toLower(keyword)
       OR ANY(tag IN d.tags WHERE toLower(tag) CONTAINS toLower(keyword))
    RETURN DISTINCT d.id AS disease_id, d.name AS disease_name,
           d.description AS description, d.category AS category
"""

# ── Check drug interactions ───────────────────────────────────────
CHECK_DRUG_INTERACTIONS = """
    UNWIND $medication_ids AS med_id
    MATCH (m1:Medication {id: med_id})-[r:INTERACTS_WITH]-(m2:Medication)
    WHERE m2.id IN $medication_ids AND m1.id < m2.id
    RETURN m1.name AS drug_a, m2.name AS drug_b,
           r.severity AS severity, r.description AS interaction_note
"""

# ── Get all diseases for browsing ─────────────────────────────────
GET_ALL_DISEASES = """
    MATCH (d:Disease)
    OPTIONAL MATCH (d)-[:TREATED_BY]->(t:Therapy)
    OPTIONAL MATCH (d)-[:MEDICATED_WITH]->(m:Medication)
    RETURN d.id AS id, d.name AS name, d.category AS category,
           d.description AS description,
           count(DISTINCT t) AS therapy_count,
           count(DISTINCT m) AS medication_count
    ORDER BY d.name
"""

# ── Get disease detail with all connected nodes ───────────────────
GET_DISEASE_DETAIL = """
    MATCH (d:Disease {id: $disease_id})
    OPTIONAL MATCH (d)-[rt:TREATED_BY]->(t:Therapy)
    OPTIONAL MATCH (d)-[rm:MEDICATED_WITH]->(m:Medication)
    OPTIONAL MATCH (d)-[:PRESENTS_SYMPTOM]->(s:Symptom)
    OPTIONAL MATCH (d)-[:AFFECTS_AREA]->(ba:BodyArea)
    RETURN d {.*, therapies: collect(DISTINCT {
                name: t.name, description: t.description,
                type: t.type, priority: rt.priority}),
              medications: collect(DISTINCT {
                name: m.name, description: m.description,
                dosage: m.dosage, priority: rm.priority}),
              symptoms: collect(DISTINCT s.name),
              body_areas: collect(DISTINCT ba.name)} AS disease
"""

# ── Database statistics ───────────────────────────────────────────
GET_DB_STATS = """
    MATCH (d:Disease) WITH count(d) AS diseases
    MATCH (t:Therapy) WITH diseases, count(t) AS therapies
    MATCH (m:Medication) WITH diseases, therapies, count(m) AS medications
    MATCH (s:Symptom) WITH diseases, therapies, medications, count(s) AS symptoms
    MATCH (ba:BodyArea) WITH diseases, therapies, medications, symptoms, count(ba) AS body_areas
    RETURN diseases, therapies, medications, symptoms, body_areas
"""
