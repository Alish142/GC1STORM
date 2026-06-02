from collections import Counter, defaultdict
from datetime import UTC, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.crud.visual_settings import get_visual_config
from app.db import get_db
from app.db.neo4j import get_graph_view_data_or_fallback
from app.models.document import Document
from app.models.document_member_state import DocumentMemberState
from app.models.issuer import Issuer
from app.models.market_index import MarketIndex
from app.models.offering import Offering
from app.services.s3_documents import resolve_document_url

router = APIRouter(prefix="/data", tags=["data"])


def _apply_sort(query: Select, model: type, sort_by: str | None, sort_dir: str = "asc") -> Select:
    if not sort_by:
        return query

    column = getattr(model, sort_by, None)
    if column is None:
        return query

    return query.order_by(desc(column) if sort_dir == "desc" else asc(column))


def _paginate(items: list[dict], total: int, page: int, page_size: int) -> dict[str, object]:
    return {
        "data": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
    }


def _currency_display(amount: Decimal | None, currency: str | None) -> str:
    if amount is None:
        return "—"
    if not currency:
        return f"{amount:,.0f}"
    numeric_amount = float(amount)
    if numeric_amount >= 1_000_000_000:
        return f"{currency} {numeric_amount / 1_000_000_000:.1f}B"
    if numeric_amount >= 1_000_000:
        return f"{currency} {numeric_amount / 1_000_000:.0f}M"
    return f"{currency} {numeric_amount:,.0f}"


def _file_size_display(size_bytes: int | None) -> str:
    if size_bytes is None:
        return "—"
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    if size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes} B"


def _build_recommendations(
    *,
    graph_source_name: str,
    graph_source: dict[str, list[dict]],
    document_count: int,
) -> list[dict[str, object]]:
    nodes = graph_source["nodes"]
    edges = graph_source["edges"]
    if not nodes:
        return []

    nodes_by_id = {str(node["id"]): node for node in nodes}
    degrees: Counter[str] = Counter()
    neighbors: defaultdict[str, set[str]] = defaultdict(set)

    for edge in edges:
        source_id = str(edge["source"])
        target_id = str(edge["target"])
        if source_id not in nodes_by_id or target_id not in nodes_by_id:
            continue
        degrees[source_id] += 1
        degrees[target_id] += 1
        neighbors[source_id].add(target_id)
        neighbors[target_id].add(source_id)

    ranked_nodes = sorted(
        nodes,
        key=lambda node: (
            -degrees.get(str(node["id"]), 0),
            str(node.get("label", "")),
        ),
    )

    recommendations: list[dict[str, object]] = []
    used_node_ids: set[str] = set()

    def add_recommendation(node: dict, *, category: str, reason: str) -> None:
        node_id = str(node["id"])
        if node_id in used_node_ids or len(recommendations) >= 3:
            return
        recommendations.append(
            {
                "id": f"{category}:{node_id}",
                "category": category,
                "title": str(node["label"]),
                "reason": reason,
                "nodeId": node_id,
                "nodeType": str(node["type"]),
                "graphSource": graph_source_name,
            }
        )
        used_node_ids.add(node_id)

    for node in ranked_nodes:
        if str(node.get("type")) != "Theme":
            continue
        add_recommendation(
            node,
            category="theme",
            reason=(
                f"Connected to {len(neighbors.get(str(node['id']), set()))} related nodes"
                if neighbors.get(str(node["id"]))
                else "A strong theme to start exploring the network"
            ),
        )
        if len(recommendations) >= 2:
            break

    for node in ranked_nodes:
        if str(node.get("type")) == "Theme":
            continue
        connected_types = sorted(
            {str(nodes_by_id[neighbor_id]["type"]) for neighbor_id in neighbors.get(str(node["id"]), set())}
        )
        add_recommendation(
            node,
            category="entity",
            reason=(
                f"Touches {', '.join(connected_types[:2])}"
                if connected_types
                else "Worth reviewing from the current graph"
            ),
        )
        if len(recommendations) >= 3:
            break

    if document_count > 0 and recommendations:
        anchor = recommendations[0]
        recommendations.append(
            {
                "id": f"document-focus:{anchor['nodeId']}",
                "category": "document",
                "title": f"Track disclosures around {anchor['title']}",
                "reason": f"{document_count} document records are available for deeper review",
                "nodeId": anchor["nodeId"],
                "nodeType": anchor["nodeType"],
                "graphSource": graph_source_name,
            }
        )

    return recommendations[:3]


@router.get("/visual-config")
def visual_config(db: Session = Depends(get_db)):
    return get_visual_config(db)


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    return {
        "issuers": db.scalar(select(func.count()).select_from(Issuer)) or 0,
        "offerings": db.scalar(
            select(func.count()).select_from(Offering).where(Offering.delisted.is_(False))
        )
        or 0,
        "indices": db.scalar(select(func.count()).select_from(MarketIndex)) or 0,
        "documents": db.scalar(select(func.count()).select_from(Document)) or 0,
    }


@router.get("/recommendations")
def recommendations(db: Session = Depends(get_db)):
    graph_source, graph_source_name = get_graph_view_data_or_fallback()
    document_count = db.scalar(select(func.count()).select_from(Document)) or 0

    return {
        "data": _build_recommendations(
            graph_source_name=graph_source_name,
            graph_source=graph_source,
            document_count=document_count,
        ),
        "graphSource": graph_source_name,
        "generatedAt": datetime.now(UTC).isoformat(),
    }


@router.get("/issuers")
def issuers(
    db: Session = Depends(get_db),
    search: str | None = None,
    classifications: list[str] | None = Query(default=None),
    regions: list[str] | None = Query(default=None),
    wbx_label: bool | None = None,
    eu_taxonomy: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str | None = None,
    sort_dir: str = "asc",
):
    visual_config = get_visual_config(db)
    table_dot_colors = visual_config["tableDots"]
    query = select(Issuer)
    if search:
        q = search.lower()
        query = query.where(
            or_(
                func.lower(Issuer.name).contains(q),
                func.lower(Issuer.country).contains(q),
                func.lower(Issuer.classification).contains(q),
            )
        )
    if classifications:
        query = query.where(Issuer.classification.in_(classifications))
    if regions:
        query = query.where(Issuer.region.in_(regions))
    if wbx_label:
        query = query.where(Issuer.wbx_label.is_(True))
    if eu_taxonomy:
        query = query.where(Issuer.eu_taxonomy.is_(True))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = _apply_sort(query, Issuer, sort_by, sort_dir).offset((page - 1) * page_size).limit(page_size)
    rows = db.scalars(query).all()

    data = [
        {
            "id": str(row.id),
            "name": row.name,
            "country": row.country,
            "region": row.region,
            "classification": row.classification,
            "wbxLabel": row.wbx_label,
            "euTaxonomy": row.eu_taxonomy,
            "assets": _currency_display(row.assets_amount, row.assets_currency),
            "assetsAmount": float(row.assets_amount) if row.assets_amount is not None else None,
            "assetsCurrency": row.assets_currency or "",
            "description": row.description or "",
            "foundedYear": row.founded_year,
            "issuerNameDotColor": table_dot_colors["issuerName"],
            "wbxLabelDotColor": table_dot_colors["wbxLabel"],
        }
        for row in rows
    ]
    return {
        **_paginate(data, total, page, page_size),
        "visualConfig": visual_config,
    }


@router.get("/offerings")
def offerings(
    db: Session = Depends(get_db),
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    include_delisted: bool = False,
    page: int = 1,
    page_size: int = 20,
    sort_by: str | None = None,
    sort_dir: str = "asc",
):
    visual_config = get_visual_config(db)
    table_dot_colors = visual_config["tableDots"]
    query = select(Offering, Issuer.name.label("issuer_name")).join(Issuer, Offering.issuer_id == Issuer.id)
    if not include_delisted:
        query = query.where(Offering.delisted.is_(False))
    if search:
        q = search.lower()
        query = query.where(
            or_(
                func.lower(Offering.name).contains(q),
                func.lower(Issuer.name).contains(q),
                func.lower(Offering.isin).contains(q),
            )
        )
    if types:
        query = query.where(Offering.type.in_(types))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = _apply_sort(query, Offering, sort_by, sort_dir).offset((page - 1) * page_size).limit(page_size)
    rows = db.execute(query).all()

    data = [
        {
            "id": str(offering.id),
            "issuerId": str(offering.issuer_id),
            "type": offering.type,
            "segment": offering.segment,
            "issuer": issuer_name,
            "isin": offering.isin,
            "name": offering.name,
            "issuedAmount": float(offering.issued_amount) if offering.issued_amount is not None else 0,
            "currency": offering.currency,
            "listingDate": offering.listing_date.isoformat() if offering.listing_date else "",
            "wbxClassification": offering.wbx_classification or "",
            "coupon": float(offering.coupon) if offering.coupon is not None else None,
            "lastPrice": float(offering.last_price) if offering.last_price is not None else 0,
            "delisted": offering.delisted,
            "issuerDotColor": table_dot_colors["offeringIssuer"],
            "typeDotColor": table_dot_colors["offeringType"],
        }
        for offering, issuer_name in rows
    ]
    return {
        **_paginate(data, total, page, page_size),
        "visualConfig": visual_config,
    }


@router.get("/indices")
def indices(
    db: Session = Depends(get_db),
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    currencies: list[str] | None = Query(default=None),
    page: int = 1,
    page_size: int = 20,
    sort_by: str | None = None,
    sort_dir: str = "asc",
):
    visual_config = get_visual_config(db)
    table_dot_colors = visual_config["tableDots"]
    query = select(MarketIndex)
    if search:
        q = search.lower()
        query = query.where(
            or_(
                func.lower(MarketIndex.name).contains(q),
                func.lower(MarketIndex.type).contains(q),
            )
        )
    if types:
        query = query.where(MarketIndex.type.in_(types))
    if currencies:
        query = query.where(MarketIndex.currency.in_(currencies))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = _apply_sort(query, MarketIndex, sort_by, sort_dir).offset((page - 1) * page_size).limit(page_size)
    rows = db.scalars(query).all()

    data = [
        {
            "id": str(row.id),
            "type": row.type,
            "name": row.name,
            "currency": row.currency,
            "last": float(row.last) if row.last is not None else 0,
            "changePercent": float(row.change_percent) if row.change_percent is not None else 0,
            "change": float(row.change) if row.change is not None else 0,
            "monthHigh": float(row.month_high) if row.month_high is not None else 0,
            "monthLow": float(row.month_low) if row.month_low is not None else 0,
            "yearHigh": float(row.year_high) if row.year_high is not None else 0,
            "yearLow": float(row.year_low) if row.year_low is not None else 0,
            "typeDotColor": table_dot_colors["indexType"],
        }
        for row in rows
    ]
    return {
        **_paginate(data, total, page, page_size),
        "visualConfig": visual_config,
    }


@router.get("/documents")
def documents(
    db: Session = Depends(get_db),
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    sub_types: list[str] | None = Query(default=None),
    page: int = 1,
    page_size: int = 20,
):
    visual_config = get_visual_config(db)
    table_dot_colors = visual_config["tableDots"]
    member_states = (
        select(
            DocumentMemberState.document_id.label("document_id"),
            func.array_agg(DocumentMemberState.country_code).label("member_states"),
        )
        .group_by(DocumentMemberState.document_id)
        .subquery()
    )
    query = (
        select(
            Document,
            Issuer.name.label("issuer_name"),
            member_states.c.member_states,
        )
        .join(Issuer, Document.issuer_id == Issuer.id, isouter=True)
        .join(member_states, member_states.c.document_id == Document.id, isouter=True)
    )
    if search:
        q = search.lower()
        query = query.where(
            or_(
                func.lower(Document.name).contains(q),
                func.lower(Document.type).contains(q),
                func.lower(func.coalesce(Document.sub_type, "")).contains(q),
            )
        )
    if types and "All" not in types:
        query = query.where(Document.type.in_(types))
    if sub_types:
        query = query.where(Document.sub_type.in_(sub_types))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.execute(query.order_by(desc(Document.document_date)).offset((page - 1) * page_size).limit(page_size)).all()

    data = [
        {
            "id": str(document.id),
            "type": document.type,
            "subType": document.sub_type or "",
            "name": document.name,
            "issuerId": str(document.issuer_id) if document.issuer_id else None,
            "issuer": issuer_name or "—",
            "memberStates": member_state_list or [],
            "date": document.document_date.isoformat() if document.document_date else "",
            "fileSize": _file_size_display(document.file_size_bytes),
            "fileUrl": resolve_document_url(document.file_url),
            "issuerDotColor": table_dot_colors["documentIssuer"],
            "typeDotColor": table_dot_colors["documentType"],
        }
        for document, issuer_name, member_state_list in rows
    ]
    return {
        **_paginate(data, total, page, page_size),
        "visualConfig": visual_config,
    }


@router.get("/graph")
def graph_data(
    db: Session = Depends(get_db),
    filter_types: list[str] | None = Query(default=None),
    filter_regions: list[str] | None = Query(default=None),
    search: str | None = None,
):
    visual_config = get_visual_config(db)
    graph_source, graph_source_name = get_graph_view_data_or_fallback()
    nodes = [*graph_source["nodes"]]
    edges = [*graph_source["edges"]]

    if filter_types:
        nodes = [n for n in nodes if n["type"] in filter_types]
        node_ids = {n["id"] for n in nodes}
        edges = [e for e in edges if e["source"] in node_ids and e["target"] in node_ids]
    if filter_regions:
        nodes = [n for n in nodes if ("region" not in n) or (n["region"] in filter_regions)]
        node_ids = {n["id"] for n in nodes}
        edges = [e for e in edges if e["source"] in node_ids and e["target"] in node_ids]
    if search:
        q = search.lower()
        nodes = [n for n in nodes if q in n["label"].lower()]
        node_ids = {n["id"] for n in nodes}
        edges = [e for e in edges if e["source"] in node_ids and e["target"] in node_ids]

    return {
        "nodes": nodes,
        "edges": edges,
        "visualConfig": visual_config,
        "graphSource": graph_source_name,
    }
