"""
MedGraph Therapy Engine — Neo4j Graph Client & Hybrid Routing.

Singleton Bolt driver following production patterns from movies-python-bolt.
Managed transactions with automatic retry for transient failures.

If Neo4j Bolt server is reachable: executes parameterized Cypher queries over Bolt.
If Neo4j Bolt server is offline: automatically falls back to in-memory graph index
so the local pipeline functions with zero setup friction.
"""

import logging
from typing import Optional
from neo4j import GraphDatabase, Driver, RoutingControl

from app.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE
from app.graph.in_memory_graph import in_memory_engine
from app.graph.queries import (
    MATCH_THERAPIES_BY_CONDITIONS,
    MATCH_MEDICATIONS_BY_CONDITIONS,
    MATCH_THERAPIES_BY_AREA_AND_CONDITION,
    MATCH_MEDICATIONS_BY_AREA_AND_CONDITION,
    MATCH_THERAPIES_BY_SYMPTOMS,
    MATCH_MEDICATIONS_BY_SYMPTOMS,
    CHECK_DRUG_INTERACTIONS,
    FULLTEXT_SEARCH_DISEASES,
    GET_ALL_DISEASES,
    GET_DB_STATS,
)

logger = logging.getLogger("medgraph.graph")


class Neo4jClient:
    """
    Singleton Neo4j Bolt driver wrapper with hybrid fallback.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._driver: Optional[Driver] = None
            cls._instance._is_connected = False
            cls._instance._uri = NEO4J_URI
            cls._instance._user = NEO4J_USER
            cls._instance._password = NEO4J_PASSWORD
            cls._instance._database = NEO4J_DATABASE
        return cls._instance

    def connect(
        self,
        uri: str = None,
        user: str = None,
        password: str = None,
        database: str = None,
    ) -> bool:
        """Initialize the Bolt driver connection with safe check."""
        self._uri = uri or NEO4J_URI
        self._user = user or NEO4J_USER
        self._password = password or NEO4J_PASSWORD
        self._database = database or NEO4J_DATABASE

        try:
            self._driver = GraphDatabase.driver(
                self._uri, auth=(self._user, self._password)
            )
            self._driver.verify_connectivity()
            self._is_connected = True
            logger.info(f"Connected to Neo4j at {self._uri}")
            return True
        except Exception as e:
            logger.warning(f"Neo4j Bolt server not reached at {self._uri} ({e}). Using embedded in-memory graph.")
            self._is_connected = False
            return False

    @property
    def is_live(self) -> bool:
        if self._driver is None or not self._is_connected:
            return False
        try:
            self._driver.verify_connectivity()
            return True
        except Exception:
            self._is_connected = False
            return False

    def close(self):
        if self._driver is not None:
            try:
                self._driver.close()
            except Exception:
                pass
            self._driver = None
            self._is_connected = False

    def read(self, cypher: str, parameters: dict = None) -> list[dict]:
        """Execute a read transaction with automatic routing."""
        if not self.is_live:
            raise ConnectionError("Neo4j Bolt is not connected")
        records, summary, keys = self._driver.execute_query(
            cypher,
            parameters_=(parameters or {}),
            database_=self._database,
            routing_=RoutingControl.READ,
        )
        return [record.data() for record in records]

    def write(self, cypher: str, parameters: dict = None) -> list[dict]:
        """Execute a write transaction routed to the leader."""
        if not self.is_live:
            raise ConnectionError("Neo4j Bolt is not connected")
        records, summary, keys = self._driver.execute_query(
            cypher,
            parameters_=(parameters or {}),
            database_=self._database,
            routing_=RoutingControl.WRITE,
        )
        return [record.data() for record in records]

    # ── High-Level Hybrid Retrieval Methods ────────────────────────────

    def match_therapies(
        self,
        conditions: list[str],
        body_areas: list[str] = None,
        symptoms: list[str] = None,
    ) -> list[dict]:
        """Find therapies ranked from HIGH to LOW priority."""
        if self.is_live and conditions:
            try:
                if body_areas:
                    results = self.read(
                        MATCH_THERAPIES_BY_AREA_AND_CONDITION,
                        {"conditions": conditions, "body_areas": body_areas},
                    )
                    if results:
                        return results
                results = self.read(
                    MATCH_THERAPIES_BY_CONDITIONS,
                    {"conditions": conditions},
                )
                if results:
                    return results
                if symptoms:
                    return self.read(
                        MATCH_THERAPIES_BY_SYMPTOMS,
                        {"symptoms": symptoms},
                    )
            except Exception as e:
                logger.error(f"Neo4j query error: {e}, using in-memory engine fallback.")

        # Fallback to in-memory graph index
        return in_memory_engine.match_therapies(conditions, body_areas, symptoms)

    def match_medications(
        self,
        conditions: list[str],
        body_areas: list[str] = None,
        symptoms: list[str] = None,
    ) -> list[dict]:
        """Find medications and dosages ranked from HIGH to LOW priority."""
        if self.is_live and conditions:
            try:
                if body_areas:
                    results = self.read(
                        MATCH_MEDICATIONS_BY_AREA_AND_CONDITION,
                        {"conditions": conditions, "body_areas": body_areas},
                    )
                    if results:
                        return results
                results = self.read(
                    MATCH_MEDICATIONS_BY_CONDITIONS,
                    {"conditions": conditions},
                )
                if results:
                    return results
                if symptoms:
                    return self.read(
                        MATCH_MEDICATIONS_BY_SYMPTOMS,
                        {"symptoms": symptoms},
                    )
            except Exception as e:
                logger.error(f"Neo4j query error: {e}, using in-memory engine fallback.")

        # Fallback to in-memory graph index
        return in_memory_engine.match_medications(conditions, body_areas, symptoms)

    def check_drug_interactions(self, medication_ids: list[str]) -> list[dict]:
        """Check known drug-drug interactions."""
        if len(medication_ids) < 2:
            return []

        if self.is_live:
            try:
                return self.read(
                    CHECK_DRUG_INTERACTIONS,
                    {"medication_ids": medication_ids},
                )
            except Exception as e:
                logger.error(f"Neo4j query error: {e}")

        return in_memory_engine.check_drug_interactions(medication_ids)

    def get_all_diseases(self) -> list[dict]:
        """List all diseases supported by the knowledge graph."""
        if self.is_live:
            try:
                return self.read(GET_ALL_DISEASES)
            except Exception:
                pass
        return list(in_memory_engine.diseases.values())

    def get_stats(self) -> dict:
        """Database statistics."""
        if self.is_live:
            try:
                stats = self.read(GET_DB_STATS)
                if stats:
                    return {**stats[0], "mode": "neo4j_bolt_live", "uri": self._uri}
            except Exception:
                pass
        return {**in_memory_engine.get_stats(), "mode": "in_memory_standby", "uri": self._uri}

    def health_check(self) -> dict:
        """Check Neo4j connectivity status."""
        live = self.is_live
        return {
            "neo4j_connected": live,
            "uri": self._uri,
            "mode": "Neo4j Bolt Live" if live else "Embedded Graph Engine (Local Standby)",
            "total_diseases": len(in_memory_engine.diseases),
            "total_therapies": len(in_memory_engine.therapies),
            "total_medications": len(in_memory_engine.medications),
            "total_relationships": len(in_memory_engine.relationships),
        }


# Module-level singleton
graph_client = Neo4jClient()
