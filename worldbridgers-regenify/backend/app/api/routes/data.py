from typing import Any

from fastapi import APIRouter, Query

from app.data.mock_data import DOCUMENTS, GRAPH_DATA, INDICES, ISSUERS, OFFERINGS

router = APIRouter(prefix="/data", tags=["data"])


def _sort_rows(rows: list[dict[str, Any]], sort_by: str | None, sort_dir: str = "asc") -> list[dict[str, Any]]:
    if not sort_by:
        return rows
    reverse = sort_dir == "desc"
    return sorted(rows, key=lambda r: str(r.get(sort_by, "")), reverse=reverse)


def _paginate(rows: list[dict[str, Any]], page: int, page_size: int) -> dict[str, Any]:
    total = len(rows)
    start = max((page - 1) * page_size, 0)
    return {
        "data": rows[start : start + page_size],
        "total": total,
        "page": page,
        "pageSize": page_size,
    }


@router.get("/issuers")
def issuers(
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
    data = [*ISSUERS]
    if search:
        q = search.lower()
        data = [d for d in data if q in d["name"].lower() or q in d["country"].lower() or q in d["classification"].lower()]
    if classifications:
        data = [d for d in data if d["classification"] in classifications]
    if regions:
        data = [d for d in data if d["region"] in regions]
    if wbx_label:
        data = [d for d in data if d["wbxLabel"]]
    if eu_taxonomy:
        data = [d for d in data if d["euTaxonomy"]]

    data = _sort_rows(data, sort_by, sort_dir)
    return _paginate(data, page, page_size)


@router.get("/offerings")
def offerings(
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    include_delisted: bool = False,
    page: int = 1,
    page_size: int = 20,
    sort_by: str | None = None,
    sort_dir: str = "asc",
):
    data = [*OFFERINGS]
    if not include_delisted:
        data = [d for d in data if not d["delisted"]]
    if search:
        q = search.lower()
        data = [
            d
            for d in data
            if q in d["name"].lower() or q in d["issuer"].lower() or q in d["isin"].lower()
        ]
    if types:
        data = [d for d in data if d["type"] in types]
    data = _sort_rows(data, sort_by, sort_dir)
    return _paginate(data, page, page_size)


@router.get("/indices")
def indices(
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    currencies: list[str] | None = Query(default=None),
    page: int = 1,
    page_size: int = 20,
    sort_by: str | None = None,
    sort_dir: str = "asc",
):
    data = [*INDICES]
    if search:
        q = search.lower()
        data = [d for d in data if q in d["name"].lower() or q in d["type"].lower()]
    if types:
        data = [d for d in data if d["type"] in types]
    if currencies:
        data = [d for d in data if d["currency"] in currencies]
    data = _sort_rows(data, sort_by, sort_dir)
    return _paginate(data, page, page_size)


@router.get("/documents")
def documents(
    search: str | None = None,
    types: list[str] | None = Query(default=None),
    sub_types: list[str] | None = Query(default=None),
    page: int = 1,
    page_size: int = 20,
):
    data = [*DOCUMENTS]
    if search:
        q = search.lower()
        data = [d for d in data if q in d["name"].lower() or q in d["type"].lower() or q in d["subType"].lower()]
    if types and "All" not in types:
        data = [d for d in data if d["type"] in types]
    if sub_types:
        data = [d for d in data if d["subType"] in sub_types]
    return _paginate(data, page, page_size)


@router.get("/graph")
def graph_data(
    filter_types: list[str] | None = Query(default=None),
    filter_regions: list[str] | None = Query(default=None),
    search: str | None = None,
):
    nodes = [*GRAPH_DATA["nodes"]]
    edges = [*GRAPH_DATA["edges"]]

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

    return {"nodes": nodes, "edges": edges}

