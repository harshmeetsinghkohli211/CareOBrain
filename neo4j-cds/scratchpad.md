# Neo4j & GraphRAG Engineering Scratchpad

## 1. Resource Ingestion & Knowledge Synthesis

| Source | Core Focus | Key Architectural Takeaway |
| :--- | :--- | :--- |
| **Dr. Jim Webber: Engineering Evolution of Neo4j** | Native Graph Architecture & Clustering | Defused the "JOIN bomb" via **Index-Free Adjacency** (pointer hopping $O(1)$). Proved NoSQL/BASE eventual consistency causes broken graph topologies; Neo4j requires ACID transactions over Causal Clustering (Raft). |
| **`neo4j-examples/movies-python-bolt`** | Python Bolt Protocol Implementation | Uses singleton `GraphDatabase.driver()`. Features both sync (Flask, `movies_sync.py`) and async (FastAPI, `movies_async.py`). Strict query parameterization with `$title`, managed transaction execution. |
| **`neo4j-examples/movies-golang-bolt`** | Go Driver Bolt Protocol Implementation | Uses `neo4j.NewDriverWithContext` and `session.ExecuteRead` / `session.ExecuteWrite` with context cancellation, streaming record consumption, and D3 graph visualization payloads. |
| **`dwyl/learn-neo4j`** | Property Graph Foundations & Cypher Basics | Nodes (`(n:Label)`), Relationships (`-[:TYPE]->`), Properties (`{key: val}`). Declarative CRUD via `MATCH`, `CREATE`, `MERGE`, `WHERE`, `RETURN`. Explicit uniqueness constraints and index definitions. |
| **`neo4j/neo4j-graphrag-python`** | Graph-Native Retrieval Augmented Generation | Unifies semantic search (vector indexes) with graph topology. Uses `VectorRetriever`, `VectorCypherRetriever` (hybrid vector + graph traversal), `HybridCypherRetriever` (BM25 + vector + graph), and `Text2CypherRetriever`. |
| **Neo4j Developer Blog** | GenAI & Modern Agentic Graph Applications | Multi-agent state & memory persistence in Neo4j, Model Context Protocol (MCP) servers for Neo4j, AuraDB serverless scaling, and Graph Data Science (GDS) algorithms. |

---

## 2. Active Role Directives

* **Assigned Role**: **Senior Neo4j & Graph Systems Architect / Lead Knowledge Engineer**.
* **Guiding Principles**:
  1. **Zero Join-Bombs**: Model connected systems using index-free adjacency; avoid tabular normalization anti-patterns.
  2. **Singleton Driver & Managed Transactions**: Never reopen drivers on per-request lifecycles; route read/write transactions properly across clusters.
  3. **Mandatory Parameterization**: Zero raw Cypher string formatting.
  4. **Graph-Enhanced RAG**: Always enrich vector queries with relational Cypher context when building AI retrievers.

---

## 3. Project Environment Status

* **Project Directory**: `C:\Users\Victus\.gemini\antigravity-ide\scratch\neo4j`
* **Customization Assets Installed**:
  - Global Skill: `C:\Users\Victus\.gemini\config\skills\neo4j-graph-engineer\SKILL.md`
  - Workspace Skill: `C:\Users\Victus\.gemini\antigravity-ide\scratch\neo4j\.agents\skills\neo4j-graph-engineer\SKILL.md`
  - Project Rules: `C:\Users\Victus\.gemini\antigravity-ide\scratch\neo4j\AGENTS.md` and `GEMINI.md`
  - Documentation: `C:\Users\Victus\.gemini\antigravity-ide\scratch\neo4j\README.md`
* **Next Steps**: Awaiting the user's specific application idea or domain model to implement.
