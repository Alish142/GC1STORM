from neo4j import GraphDatabase

from app.core.config import get_settings
from app.data.primary_themes import PRIMARY_THEME_RELATIONSHIPS, PRIMARY_THEMES

settings = get_settings()

driver = GraphDatabase.driver(
    settings.neo4j_uri,
    auth=(settings.neo4j_user, settings.neo4j_password),
)


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
