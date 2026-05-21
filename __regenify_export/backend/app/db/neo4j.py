from neo4j import GraphDatabase, TrustAll

from app.core.config import get_settings
from app.data.mock_data import GRAPH_DATA
from app.data.primary_themes import PRIMARY_THEME_RELATIONSHIPS, PRIMARY_THEMES

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
