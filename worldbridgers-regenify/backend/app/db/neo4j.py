from decimal import Decimal
from fastapi import HTTPException
from neo4j import GraphDatabase, TrustAll
from typing import TYPE_CHECKING

from app.core.config import get_settings
from app.data.mock_data import GRAPH_DATA
from app.data.primary_themes import PRIMARY_THEME_RELATIONSHIPS, PRIMARY_THEMES

if TYPE_CHECKING:
    from app.models.issuer import Issuer
    from app.models.market_index import MarketIndex
    from app.models.offering import Offering

settings = get_settings()

driver_kwargs = {
    "auth": (settings.neo4j_user, settings.neo4j_password),
}

if settings.neo4j_trust_all:
    driver_kwargs["trusted_certificates"] = TrustAll()

driver = GraphDatabase.driver(settings.neo4j_uri, **driver_kwargs)


def verify_neo4j() -> bool:
    try:
        driver.verify_connectivity()
        return True
    except Exception:
        return False


def close_neo4j() -> None:
    driver.close()


def seed_primary_themes() -> dict[str, int]:
    with driver.session() as session:
        session.run(
            """
            MERGE (h:ThemeHub {id: 'global-theme-hub'})
            SET h.name = 'Global Themes'
            """
        )

        for item in PRIMARY_THEMES:
            session.run(
                """
                MERGE (t:Theme {id: $id})
                SET t.name = $name,
                    t.theme_id = $id,
                    t.curation = $curation,
                    t.description = $description
                WITH t
                MATCH (h:ThemeHub {id: 'global-theme-hub'})
                MERGE (h)-[:HAS_THEME]->(t)
                """,
                id=item["id"],
                name=item["name"],
                curation=item["curation"],
                description=item["description"],
            )

        for source_id, target_id in PRIMARY_THEME_RELATIONSHIPS:
            session.run(
                """
                MATCH (a:Theme {id: $source_id})
                MATCH (b:Theme {id: $target_id})
                MERGE (a)-[:RELATED_TO]->(b)
                """,
                source_id=source_id,
                target_id=target_id,
            )

        count_record = session.run("MATCH (t:Theme) RETURN count(t) AS count").single()
        rel_record = session.run("MATCH (:Theme)-[r:RELATED_TO]->(:Theme) RETURN count(r) AS count").single()
        return {
            "themes": int(count_record["count"] if count_record else 0),
            "relationships": int(rel_record["count"] if rel_record else 0),
        }


def seed_mock_graph_entities() -> dict[str, int]:
    with driver.session() as session:
        for node in GRAPH_DATA["nodes"]:
            labels = f"Entity:{node['type']}"
            session.run(
                f"""
                MERGE (n:{labels} {{id: $id}})
                SET n.label = $label,
                    n.type = $type,
                    n.region = $region,
                    n.description = $description,
                    n.country = $country,
                    n.value = $value
                """,
                id=node["id"],
                label=node["label"],
                type=node["type"],
                region=node.get("region"),
                description=node.get("description"),
                country=node.get("country"),
                value=node.get("value"),
            )

        for edge in GRAPH_DATA["edges"]:
            rel_type = edge["label"].replace("-", "_").replace(" ", "_").upper()
            session.run(
                f"""
                MATCH (source {{id: $source_id}})
                MATCH (target {{id: $target_id}})
                MERGE (source)-[r:{rel_type} {{id: $edge_id}}]->(target)
                SET r.label = $label,
                    r.weight = $weight
                """,
                source_id=edge["source"],
                target_id=edge["target"],
                edge_id=edge["id"],
                label=edge["label"],
                weight=edge.get("weight", 1),
            )

        node_record = session.run("MATCH (n:Entity) RETURN count(n) AS count").single()
        rel_record = session.run("MATCH (:Entity)-[r]->(:Entity) RETURN count(r) AS count").single()
        return {
            "entities": int(node_record["count"] if node_record else 0),
            "relationships": int(rel_record["count"] if rel_record else 0),
        }


def get_primary_themes() -> list[dict]:
    query = """
    MATCH (h:ThemeHub {id: 'global-theme-hub'})-[:HAS_THEME]->(t:Theme)
    OPTIONAL MATCH (t)-[:RELATED_TO]->(other:Theme)
    RETURN t.id AS id,
           t.name AS name,
           t.curation AS curation,
           t.description AS description,
           collect(other.id) AS related
    ORDER BY t.name ASC
    """
    with driver.session() as session:
        result = session.run(query)
        rows: list[dict] = []
        for record in result:
            rows.append(
                {
                    "id": record["id"],
                    "name": record["name"],
                    "curation": record["curation"],
                    "description": record["description"],
                    "related": [x for x in record["related"] if x],
                }
            )
        return rows


def get_graph_view_data() -> dict[str, list[dict]]:
    query = """
    MATCH (n)
    WHERE NOT n:ThemeHub
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE NOT m:ThemeHub AND type(r) <> 'HAS_THEME'
    RETURN collect(distinct CASE
        WHEN n:Theme THEN {
            id: n.id,
            label: n.name,
            type: 'Theme',
            region: 'Global',
            description: n.description,
            country: null,
            value: null
        }
        ELSE {
            id: n.id,
            label: coalesce(n.label, n.name, n.id),
            type: n.type,
            region: n.region,
            description: n.description,
            country: n.country,
            value: n.value
        }
    END) AS nodes,
    collect(distinct CASE
        WHEN r IS NULL OR m IS NULL THEN NULL
        ELSE {
            id: coalesce(r.id, n.id + '-' + type(r) + '-' + m.id),
            source: n.id,
            target: m.id,
            label: coalesce(r.label, type(r)),
            weight: coalesce(r.weight, 1)
        }
    END) AS edges
    """

    with driver.session() as session:
        record = session.run(query).single()
        if not record:
            return {"nodes": [], "edges": []}

        nodes = [node for node in (record["nodes"] or []) if node]
        edges = [edge for edge in (record["edges"] or []) if edge]
        return {"nodes": nodes, "edges": edges}


def get_graph_view_data_or_fallback() -> tuple[dict[str, list[dict]], str]:
    if verify_neo4j():
        return get_graph_view_data(), "neo4j"
    if settings.allow_mock_graph_fallback:
        return GRAPH_DATA, "mock"
    raise HTTPException(status_code=503, detail="Graph database is unavailable.")


def _to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


def upsert_issuer_node(issuer: "Issuer") -> None:
    with driver.session() as session:
        session.run(
            """
            MERGE (n:Entity:Issuer {id: $id})
            SET n.label = $label,
                n.type = 'Issuer',
                n.region = $region,
                n.description = $description,
                n.country = $country,
                n.value = $value
            """,
            id=str(issuer.id),
            label=issuer.name,
            region=issuer.region,
            description=issuer.description,
            country=issuer.country,
            value=_to_float(issuer.assets_amount),
        )


def delete_issuer_node(issuer_id: str) -> None:
    with driver.session() as session:
        session.run("MATCH (n {id: $id}) DETACH DELETE n", id=issuer_id)


def upsert_offering_node(offering: "Offering", *, issuer: "Issuer") -> None:
    with driver.session() as session:
        session.run(
            """
            MERGE (issuer:Entity:Issuer {id: $issuer_id})
            SET issuer.label = $issuer_label,
                issuer.type = 'Issuer',
                issuer.region = $issuer_region,
                issuer.description = $issuer_description,
                issuer.country = $issuer_country,
                issuer.value = $issuer_value
            MERGE (offering:Entity:Offering {id: $offering_id})
            SET offering.label = $offering_label,
                offering.type = 'Offering',
                offering.region = $issuer_region,
                offering.description = $offering_description,
                offering.country = $issuer_country,
                offering.value = $offering_value
            MERGE (issuer)-[r:ISSUES {id: $relationship_id}]->(offering)
            SET r.label = 'ISSUES',
                r.weight = $relationship_weight
            """,
            issuer_id=str(issuer.id),
            issuer_label=issuer.name,
            issuer_region=issuer.region,
            issuer_description=issuer.description,
            issuer_country=issuer.country,
            issuer_value=_to_float(issuer.assets_amount),
            offering_id=str(offering.id),
            offering_label=offering.name,
            offering_description=" | ".join(
                part for part in [offering.segment, offering.wbx_classification, offering.type] if part
            ),
            offering_value=_to_float(offering.issued_amount),
            relationship_id=f"issuer-{issuer.id}-offering-{offering.id}",
            relationship_weight=1 if offering.delisted else 2,
        )


def delete_offering_node(offering_id: str) -> None:
    with driver.session() as session:
        session.run("MATCH (n {id: $id}) DETACH DELETE n", id=offering_id)


def upsert_index_node(index: "MarketIndex") -> None:
    with driver.session() as session:
        session.run(
            """
            MERGE (n:Entity:Index {id: $id})
            SET n.label = $label,
                n.type = 'Index',
                n.region = 'Global',
                n.description = $description,
                n.country = NULL,
                n.value = $value
            """,
            id=str(index.id),
            label=index.name,
            description=f"{index.type} benchmark in {index.currency}",
            value=_to_float(index.last),
        )


def delete_index_node(index_id: str) -> None:
    with driver.session() as session:
        session.run("MATCH (n {id: $id}) DETACH DELETE n", id=index_id)
