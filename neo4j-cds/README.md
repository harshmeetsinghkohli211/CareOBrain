# Neo4j Graph Platform & Knowledge Engineering Hub

Welcome to the **Neo4j Graph Platform & Knowledge Engineering Hub**. This environment is trained and standardized on official Neo4j architectural principles, production Bolt driver patterns (`movies-python-bolt`, `movies-golang-bolt`), the `neo4j-graphrag-python` ecosystem, and foundational graph mastery (`dwyl/learn-neo4j`).

---

## 1. Architectural Foundations (The Native Graph Advantage)

Based on the engineering evolution of Neo4j (Dr. Jim Webber, Neo4j Chief Scientist):

* **The Problem with Relational DBs for Graphs (The "JOIN Bomb")**:
  * Relational engines store entities in tabular format. As queries traverse multi-hop paths, recursive JOIN operations rapidly exhaust RAM, causing cache eviction and page spilling to disk. Performance plummets from electronic RAM speeds to disk I/O bottlenecks.
* **Index-Free Adjacency (IFA)**:
  * Neo4j does not compute joins via index lookup tables at runtime.
  * Every node and relationship is stored with direct physical pointers to adjacent entities on disk and in the page cache.
  * Path traversal is **$O(1)$** per hop regardless of the overall graph size, ensuring predictable millisecond query execution across deep subgraphs.
* **ACID vs. BASE (Eventual Consistency)**:
  * Non-native graph solutions or NoSQL key-value/document stores attempting graph abstractions suffer from broken relationships and orphan edges under eventual consistency.
  * Neo4j utilizes strong ACID transactional integrity across **Causal Clustering** (Raft protocol leader/follower architecture), guaranteeing structural correctness across distributed replicas.

---

## 2. Driver Connection & Bolt Protocol Standards

Learned from `neo4j-examples/movies-python-bolt` and `neo4j-examples/movies-golang-bolt`:

### Connection Best Practices
1. **Singleton Driver**: Allocate one `Driver` instance per application lifetime. It manages connection pooling, routing tables, and thread-safe sockets. Never create a driver per request.
2. **Bolt Protocol Scheme**:
   * Local / Single Instance: `bolt://localhost:7687`
   * Cloud / AuraDB (Routing & TLS): `neo4j+s://<dbid>.databases.neo4j.io`
   * Self-Managed Cluster: `neo4j://<host>:7687`
3. **Transaction Execution Models**:
   * Modern drivers (>= 5.x) prefer `driver.execute_query(...)` for simple queries or managed transaction functions:
     * `session.execute_read(tx_fn)` (routed to read replicas/followers)
     * `session.execute_write(tx_fn)` (routed to cluster leader with automatic transient-failure retry)
4. **Mandatory Query Parameterization**:
   * *Never* concatenate raw strings into Cypher queries. Parameterize with `$param_name` to defend against Cypher injection and enable the database query cache to reuse query plans.

### Python Reference (Bolt Driver >= 5.x)
```python
from neo4j import GraphDatabase, RoutingControl

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "password")

driver = GraphDatabase.driver(URI, auth=AUTH)

def search_movies(title_prefix: str):
    records, summary, keys = driver.execute_query(
        """
        MATCH (m:Movie)
        WHERE toLower(m.title) STARTS WITH toLower($prefix)
        RETURN m.title AS title, m.released AS released, m.tagline AS tagline
        ORDER BY m.released DESC
        LIMIT 10
        """,
        prefix=title_prefix,
        database_="neo4j",
        routing_=RoutingControl.READ
    )
    return [record.data() for record in records]
```

### Go Reference (`movies-golang-bolt`)
```go
package main

import (
    "context"
    "github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func FindMovieCast(ctx context.Context, driver neo4j.DriverWithContext, title string) ([]string, error) {
    session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
    defer session.Close(ctx)

    result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
        query := `
            MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(a:Person)
            RETURN a.name AS actor
            ORDER BY a.name ASC
        `
        res, err := tx.Run(ctx, query, map[string]any{"title": title})
        if err != nil {
            return nil, err
        }
        var actors []string
        for res.Next(ctx) {
            actors = append(actors, res.Record().Values[0].(string))
        }
        return actors, nil
    })
    if err != nil {
        return nil, err
    }
    return result.([]string), nil
}
```

---

## 3. Cypher Query Engineering & Graph Data Modeling

Learned from `dwyl/learn-neo4j` and production query tuning:

* **Property Graph Fundamentals**:
  * **Nodes**: Entities with 1 or more `:Labels` (e.g., `(:User:Customer)`).
  * **Relationships**: Directed connections with exactly one `[:TYPE]` and optional properties (e.g., `-[:ACTED_IN {role: 'Neo'}]->`).
  * **Properties**: Key-value pairs on nodes and relationships (strings, numbers, booleans, datetime, vectors/arrays).
* **Idempotency with `MERGE`**:
  * Always use `MERGE` for ingest to avoid duplicate nodes or relationships:
    ```cypher
    MERGE (p:Person {id: $personId})
    ON CREATE SET p.name = $name, p.createdAt = datetime()
    ON MATCH SET p.lastSeenAt = datetime()
    ```
* **Constraints and Indexes**:
  * Define unique constraints before loading data:
    ```cypher
    CREATE CONSTRAINT user_id_unique IF NOT EXISTS
    FOR (u:User) REQUIRE u.id IS UNIQUE;
    
    CREATE INDEX movie_title_idx IF NOT EXISTS
    FOR (m:Movie) ON (m.title);
    ```

---

## 4. GraphRAG & Generative AI Integration

Learned from `neo4j/neo4j-graphrag-python`:

GraphRAG combines vector embedding similarity with knowledge graph topology, overcoming hallucinations and context fragmentation in pure vector databases.

### Core Retrievers
1. **`VectorRetriever`**:
   * Uses Neo4j's native Vector Index (`db.index.vector.queryNodes`) for top-$k$ semantic search.
2. **`VectorCypherRetriever`**:
   * Extends vector search with graph traversal. It seeds the search with nearest-neighbor vector matches and then runs a custom Cypher query to pull related entities, paths, and graph context.
3. **`HybridRetriever` & `HybridCypherRetriever`**:
   * Combines BM25 full-text index search with vector similarity using Reciprocal Rank Fusion (RRF), enriched with multi-hop graph hops.
4. **`Text2CypherRetriever`**:
   * Provides graph schema definitions to the LLM to generate precise Cypher queries from natural language questions, executing them safely against Neo4j.

### Python GraphRAG Pipeline Example
```python
from neo4j import GraphDatabase
from neo4j_graphrag.embeddings.openai import OpenAIEmbeddings
from neo4j_graphrag.retrievers import VectorCypherRetriever
from neo4j_graphrag.generation import GraphRAG
from neo4j_graphrag.llm import OpenAILLM

# 1. Driver and Embedding setup
driver = GraphDatabase.driver("neo4j+s://<dbid>.databases.neo4j.io", auth=("neo4j", "password"))
embedder = OpenAIEmbeddings(model="text-embedding-3-small")
llm = OpenAILLM(model_name="gpt-4o")

# 2. VectorCypherRetriever: Vector seed + Graph traversal
retriever = VectorCypherRetriever(
    driver=driver,
    index_name="chunk_vector_idx",
    embedder=embedder,
    retrieval_query="""
        MATCH (node)-[:MENTIONS]->(e:Entity)-[:RELATED_TO]->(target)
        RETURN node.text AS text,
               collect(DISTINCT e.name + ' -> ' + target.name) AS graph_context
    """
)

# 3. GraphRAG Orchestration
rag = GraphRAG(retriever=retriever, llm=llm)
response = rag.search(query_text="How is Neo connected to the Matrix ecosystem?", return_context=True)
print(response.answer)
```

---

## 5. Working Directory & Active Workspace Recommendation

* Current Directory: `C:\Users\Victus\.gemini\antigravity-ide\scratch\neo4j`
* **Recommended Next Step**: Open this directory as the **Active Workspace** in Antigravity IDE to allow full workspace indexing, relative customizations discovery (`.agents/`), and live terminal execution.
