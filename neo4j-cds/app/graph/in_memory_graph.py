"""
MedGraph Therapy Engine — In-Memory Graph Engine (Standby / Local Cache).

Provides an in-memory graph index built directly from the same
domain model and seed data as Neo4j.

When Neo4j Bolt instance is reachable, queries execute via Cypher on Neo4j.
When Neo4j is offline or initializing, this engine executes identical graph
retrievals in memory with zero setup requirements, 100% local, zero latency.
"""

from typing import Optional
from app.graph.seed_data import (
    get_diseases,
    get_therapies,
    get_medications,
    get_body_areas,
    get_symptoms,
    get_relationships,
)


class InMemoryGraphEngine:
    def __init__(self):
        self.diseases = {d["id"]: d for d in get_diseases()}
        self.therapies = {t["id"]: t for t in get_therapies()}
        self.medications = {m["id"]: m for m in get_medications()}
        self.body_areas = {ba["id"]: ba for ba in get_body_areas()}
        self.symptoms = {s["id"]: s for s in get_symptoms()}
        self.relationships = get_relationships()

        # Build index lookups
        self._build_indices()

    def _build_indices(self):
        # Disease -> list of {therapy_id, priority, evidence}
        self.disease_therapies = {}
        # Disease -> list of {medication_id, priority, evidence}
        self.disease_medications = {}
        # Disease -> list of symptom_id
        self.disease_symptoms = {}
        # Disease -> list of bodyarea_id
        self.disease_areas = {}
        # Therapy -> list of bodyarea_id
        self.therapy_areas = {}
        # Symptom -> list of disease_id
        self.symptom_diseases = {}
        # Drug interactions: (drug1, drug2) -> {severity, description}
        self.drug_interactions = []

        for rel in self.relationships:
            rtype = rel.get("type")
            fid = rel.get("from_id")
            tid = rel.get("to_id")

            if rtype == "TREATED_BY":
                self.disease_therapies.setdefault(fid, []).append({
                    "id": tid,
                    "priority": rel.get("priority", 5),
                    "evidence": rel.get("evidence", "B")
                })
            elif rtype == "MEDICATED_WITH":
                self.disease_medications.setdefault(fid, []).append({
                    "id": tid,
                    "priority": rel.get("priority", 5),
                    "evidence": rel.get("evidence", "B")
                })
            elif rtype == "PRESENTS_SYMPTOM":
                self.disease_symptoms.setdefault(fid, []).append(tid)
                self.symptom_diseases.setdefault(tid, []).append(fid)
            elif rtype == "AFFECTS_AREA":
                self.disease_areas.setdefault(fid, []).append(tid)
            elif rtype == "TARGETS_AREA":
                self.therapy_areas.setdefault(fid, []).append(tid)
            elif rtype == "INTERACTS_WITH":
                self.drug_interactions.append(rel)

    def match_diseases(self, keywords: list[str]) -> list[dict]:
        """Match disease nodes by keywords with exact phrase weighting."""
        if not keywords:
            return []
        
        matched = {}
        for kw in keywords:
            kw_lower = kw.lower().strip()
            if len(kw_lower) < 2:
                continue

            for did, d in self.diseases.items():
                score = 0
                d_name = d["name"].lower()
                
                # Exact or full-phrase match gets highest clinical weighting
                if kw_lower == d_name:
                    score += 30
                elif kw_lower in d_name:
                    score += 15
                
                for tag in d.get("tags", []):
                    tag_lower = tag.lower()
                    if kw_lower == tag_lower:
                        score += 25
                    elif kw_lower in tag_lower:
                        score += 12
                
                if kw_lower in d.get("description", "").lower():
                    score += 5
                
                if score > 0:
                    if did not in matched:
                        matched[did] = {**d, "match_score": score}
                    else:
                        matched[did]["match_score"] += score

        res = list(matched.values())
        res.sort(key=lambda x: x["match_score"], reverse=True)
        return res

    def match_therapies(self, conditions: list[str], body_areas: list[str] = None, symptoms: list[str] = None) -> list[dict]:
        """
        Match therapies with ranking priority (HIGH to LOW).
        Corresponds to MATCH_THERAPIES_BY_CONDITIONS and MATCH_THERAPIES_BY_AREA_AND_CONDITION.
        """
        matched_disease_objs = self.match_diseases(conditions)
        if not matched_disease_objs and symptoms:
            # Try matching through symptoms
            for s_kw in symptoms:
                for sid, s in self.symptoms.items():
                    if s_kw.lower() in s["name"].lower():
                        d_ids = self.symptom_diseases.get(sid, [])
                        for did in d_ids:
                            if did in self.diseases:
                                matched_disease_objs.append({**self.diseases[did], "match_score": 5})

        therapies_map = {}
        for d in matched_disease_objs:
            did = d["id"]
            d_name = d["name"]
            d_therapies = self.disease_therapies.get(did, [])

            for dt in d_therapies:
                tid = dt["id"]
                if tid not in self.therapies:
                    continue
                t_obj = self.therapies[tid]
                priority = dt["priority"]
                evidence = dt["evidence"]

                # Target body areas
                target_areas = [
                    self.body_areas[ba_id]["name"]
                    for ba_id in self.therapy_areas.get(tid, [])
                    if ba_id in self.body_areas
                ]

                # Check body area filter if provided
                area_boost = 0
                if body_areas:
                    for ba in body_areas:
                        if any(ba.lower() in a.lower() for a in target_areas):
                            area_boost += 2

                if tid not in therapies_map:
                    therapies_map[tid] = {
                        "therapy_id": tid,
                        "therapy_name": t_obj["name"],
                        "therapy_description": t_obj["description"],
                        "therapy_type": t_obj.get("type", "physical"),
                        "duration": t_obj.get("duration", "4-8 weeks"),
                        "contraindications": t_obj.get("contraindications", "None reported"),
                        "graph_priority": priority + area_boost,
                        "evidence_level": evidence,
                        "matching_diseases": [d_name],
                        "target_areas": target_areas,
                    }
                else:
                    if d_name not in therapies_map[tid]["matching_diseases"]:
                        therapies_map[tid]["matching_diseases"].append(d_name)
                    # Keep maximum priority
                    if priority + area_boost > therapies_map[tid]["graph_priority"]:
                        therapies_map[tid]["graph_priority"] = priority + area_boost

        results = list(therapies_map.values())
        results.sort(key=lambda x: x["graph_priority"], reverse=True)
        return results

    def match_medications(self, conditions: list[str], body_areas: list[str] = None, symptoms: list[str] = None) -> list[dict]:
        """
        Match medications with dosage and ranking priority (HIGH to LOW).
        Corresponds to MATCH_MEDICATIONS_BY_CONDITIONS.
        """
        matched_disease_objs = self.match_diseases(conditions)
        if not matched_disease_objs and symptoms:
            for s_kw in symptoms:
                for sid, s in self.symptoms.items():
                    if s_kw.lower() in s["name"].lower():
                        d_ids = self.symptom_diseases.get(sid, [])
                        for did in d_ids:
                            if did in self.diseases:
                                matched_disease_objs.append({**self.diseases[did], "match_score": 5})

        meds_map = {}
        for d in matched_disease_objs:
            did = d["id"]
            d_name = d["name"]
            d_meds = self.disease_medications.get(did, [])

            for dm in d_meds:
                mid = dm["id"]
                if mid not in self.medications:
                    continue
                m_obj = self.medications[mid]
                priority = dm["priority"]
                evidence = dm["evidence"]

                if mid not in meds_map:
                    meds_map[mid] = {
                        "medication_id": mid,
                        "medication_name": m_obj["name"],
                        "medication_description": m_obj["description"],
                        "dosage": m_obj.get("dosage", "As prescribed"),
                        "form": m_obj.get("form", "oral"),
                        "frequency": m_obj.get("frequency", "daily"),
                        "contraindications": m_obj.get("contraindications", "None reported"),
                        "graph_priority": priority,
                        "evidence_level": evidence,
                        "matching_diseases": [d_name],
                    }
                else:
                    if d_name not in meds_map[mid]["matching_diseases"]:
                        meds_map[mid]["matching_diseases"].append(d_name)
                    if priority > meds_map[mid]["graph_priority"]:
                        meds_map[mid]["graph_priority"] = priority

        results = list(meds_map.values())
        results.sort(key=lambda x: x["graph_priority"], reverse=True)
        return results

    def check_drug_interactions(self, medication_ids: list[str]) -> list[dict]:
        """Detect interactions among prescribed medications."""
        if len(medication_ids) < 2:
            return []

        interactions = []
        med_set = set(medication_ids)
        for rel in self.drug_interactions:
            f = rel["from_id"]
            t = rel["to_id"]
            if f in med_set and t in med_set:
                m1_name = self.medications.get(f, {}).get("name", f)
                m2_name = self.medications.get(t, {}).get("name", t)
                interactions.append({
                    "drug_a": m1_name,
                    "drug_b": m2_name,
                    "severity": rel.get("severity", "moderate"),
                    "interaction_note": rel.get("description", "Potential contraindication"),
                })
        return interactions

    def get_stats(self) -> dict:
        return {
            "diseases": len(self.diseases),
            "therapies": len(self.therapies),
            "medications": len(self.medications),
            "body_areas": len(self.body_areas),
            "symptoms": len(self.symptoms),
            "relationships": len(self.relationships),
            "mode": "in_memory_index"
        }


# Singleton instance
in_memory_engine = InMemoryGraphEngine()
