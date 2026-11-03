"""
Export script to generate standalone database files for MedGraph:
1. database/medical_database.cypher (Ready to run in Neo4j Browser, cypher-shell, Desktop, AuraDB)
2. database/medical_database.json (Full graph export in structured JSON)
"""
import json
from pathlib import Path
from app.graph.seed_data import (
    get_constraints_cypher,
    get_body_areas,
    get_symptoms,
    get_therapies,
    get_medications,
    get_diseases,
    get_relationships,
)

def export():
    out_dir = Path("database")
    out_dir.mkdir(exist_ok=True)

    cypher_lines = [
        "// ==========================================================================",
        "// MedGraph Therapy & Medication Engine — Complete Neo4j Cypher Database Export",
        "// Dialect: Neo4j 5.x / AuraDB / Desktop / cypher-shell",
        "// ==========================================================================\n",
    ]

    cypher_lines.append("// 1. Uniqueness Constraints")
    for c in get_constraints_cypher():
        cypher_lines.append(f"{c};")
    cypher_lines.append("")

    def esc(val):
        if val is None:
            return '""'
        return json.dumps(str(val))

    cypher_lines.append("// 2. Body Areas (30 nodes)")
    for ba in get_body_areas():
        cypher_lines.append(
            f'MERGE (ba:BodyArea {{id: {esc(ba["id"])}}}) SET ba.name = {esc(ba.get("name", ""))}, ba.region = {esc(ba.get("region", ""))};'
        )
    cypher_lines.append("")

    cypher_lines.append("// 3. Symptoms (50+ nodes)")
    for s in get_symptoms():
        cypher_lines.append(
            f'MERGE (s:Symptom {{id: {esc(s["id"])}}}) SET s.name = {esc(s.get("name", ""))}, s.category = {esc(s.get("category", ""))};'
        )
    cypher_lines.append("")

    cypher_lines.append("// 4. Therapies (30 nodes)")
    for t in get_therapies():
        cypher_lines.append(
            f'MERGE (t:Therapy {{id: {esc(t["id"])}}}) SET t.name = {esc(t.get("name", ""))}, t.type = {esc(t.get("type", ""))}, '
            f't.description = {esc(t.get("description", ""))}, t.contraindications = {esc(t.get("contraindications", ""))}, '
            f't.duration = {esc(t.get("duration", ""))}, t.evidence_level = {esc(t.get("evidence_level", "A"))};'
        )
    cypher_lines.append("")

    cypher_lines.append("// 5. Medications (50+ nodes)")
    for m in get_medications():
        cypher_lines.append(
            f'MERGE (m:Medication {{id: {esc(m["id"])}}}) SET m.name = {esc(m.get("name", ""))}, m.description = {esc(m.get("description", ""))}, '
            f'm.dosage = {esc(m.get("dosage", ""))}, m.form = {esc(m.get("form", ""))}, m.frequency = {esc(m.get("frequency", ""))}, '
            f'm.contraindications = {esc(m.get("contraindications", ""))};'
        )
    cypher_lines.append("")

    cypher_lines.append("// 6. Diseases (40+ nodes)")
    for d in get_diseases():
        tags_json = json.dumps(d.get("tags", []))
        cypher_lines.append(
            f'MERGE (d:Disease {{id: {esc(d["id"])}}}) SET d.name = {esc(d.get("name", ""))}, d.description = {esc(d.get("description", ""))}, '
            f'd.category = {esc(d.get("category", ""))}, d.tags = {tags_json};'
        )
    cypher_lines.append("")

    cypher_lines.append("// 7. Relationships (280+ edges)")
    for rel in get_relationships():
        rtype = rel.get("type")
        fid = esc(rel.get("from_id"))
        tid = esc(rel.get("to_id"))
        if rtype == "TREATED_BY":
            prio = rel.get("priority", 5)
            ev = esc(rel.get("evidence", "B"))
            cypher_lines.append(
                f"MATCH (d:Disease {{id: {fid}}}), (t:Therapy {{id: {tid}}}) "
                f"MERGE (d)-[r:TREATED_BY]->(t) SET r.priority = {prio}, r.evidence_level = {ev};"
            )
        elif rtype == "MEDICATED_WITH":
            prio = rel.get("priority", 5)
            ev = esc(rel.get("evidence", "B"))
            cypher_lines.append(
                f"MATCH (d:Disease {{id: {fid}}}), (m:Medication {{id: {tid}}}) "
                f"MERGE (d)-[r:MEDICATED_WITH]->(m) SET r.priority = {prio}, r.evidence_level = {ev};"
            )
        elif rtype == "PRESENTS_SYMPTOM":
            cypher_lines.append(
                f"MATCH (d:Disease {{id: {fid}}}), (s:Symptom {{id: {tid}}}) "
                f"MERGE (d)-[r:PRESENTS_SYMPTOM]->(s);"
            )
        elif rtype == "AFFECTS_AREA":
            cypher_lines.append(
                f"MATCH (d:Disease {{id: {fid}}}), (ba:BodyArea {{id: {tid}}}) "
                f"MERGE (d)-[r:AFFECTS_AREA]->(ba);"
            )
        elif rtype == "TARGETS_AREA":
            cypher_lines.append(
                f"MATCH (t:Therapy {{id: {fid}}}), (ba:BodyArea {{id: {tid}}}) "
                f"MERGE (t)-[r:TARGETS_AREA]->(ba);"
            )
        elif rtype == "INTERACTS_WITH":
            sev = esc(rel.get("severity", "moderate"))
            desc = esc(rel.get("description", ""))
            cypher_lines.append(
                f"MATCH (m1:Medication {{id: {fid}}}), (m2:Medication {{id: {tid}}}) "
                f"MERGE (m1)-[r:INTERACTS_WITH]->(m2) SET r.severity = {sev}, r.description = {desc};"
            )

    cypher_file = out_dir / "medical_database.cypher"
    cypher_file.write_text("\n".join(cypher_lines), encoding="utf-8")

    json_data = {
        "metadata": {
            "database_name": "MedGraph Clinical Knowledge Graph",
            "version": "1.0.0",
            "total_diseases": len(get_diseases()),
            "total_therapies": len(get_therapies()),
            "total_medications": len(get_medications()),
            "total_body_areas": len(get_body_areas()),
            "total_symptoms": len(get_symptoms()),
            "total_relationships": len(get_relationships()),
        },
        "nodes": {
            "body_areas": get_body_areas(),
            "symptoms": get_symptoms(),
            "therapies": get_therapies(),
            "medications": get_medications(),
            "diseases": get_diseases(),
        },
        "relationships": get_relationships(),
    }

    json_file = out_dir / "medical_database.json"
    json_file.write_text(json.dumps(json_data, indent=2), encoding="utf-8")

    print("Database export generated successfully!")
    print(f"1. Cypher: {cypher_file.resolve()} ({cypher_file.stat().st_size:,} bytes)")
    print(f"2. JSON:   {json_file.resolve()} ({json_file.stat().st_size:,} bytes)")

if __name__ == "__main__":
    export()
