import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import { backendApi } from "@/lib/backendApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Globe2,
  Layers,
  Lightbulb,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "Issuer" | "Investor" | "Opportunity" | "Project" | "Market" | "Theme";
  region?: string;
  description?: string;
  value?: number;
  country?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

const NODE_CONFIG: Record<GraphNode["type"], { color: string; fill: string; icon: React.ElementType }> = {
  Issuer: { color: "#3a8f58", fill: "#ebf7ef", icon: Building2 },
  Investor: { color: "#4668d8", fill: "#eef2ff", icon: Users },
  Opportunity: { color: "#c88a1a", fill: "#fff5df", icon: Lightbulb },
  Project: { color: "#d0661b", fill: "#fff0e5", icon: Layers },
  Market: { color: "#2b8b8b", fill: "#e7f7f7", icon: Globe2 },
  Theme: { color: "#30384a", fill: "#f2f4f8", icon: Network },
};

const CENTER_IMAGES: Record<GraphNode["type"], string> = {
  Issuer: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  Investor: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  Opportunity: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  Project: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
  Market: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  Theme: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
};

const NODE_TRANSITION = "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";

function wrapCenterLabel(label: string) {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= 16) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 2);
}

function centerImageForNode(node: GraphNode | null) {
  if (!node) {
    return CENTER_IMAGES.Theme;
  }

  const lower = `${node.label} ${node.description ?? ""}`.toLowerCase();
  if (lower.includes("climate") || lower.includes("carbon") || lower.includes("ocean") || lower.includes("biodiversity")) {
    return "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80";
  }
  if (lower.includes("bank") || lower.includes("finance") || lower.includes("investment")) {
    return CENTER_IMAGES.Issuer;
  }
  if (lower.includes("asia") || lower.includes("market")) {
    return CENTER_IMAGES.Market;
  }

  return CENTER_IMAGES[node.type];
}

function buildCircularLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  selectedId: string,
  options?: { innerRadius?: number; outerRadius?: number }
) {
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const others = nodes.filter((node) => node.id !== selected.id);
  const relatedIds = new Set<string>();
  const innerRadius = options?.innerRadius ?? 120;
  const outerRadius = options?.outerRadius ?? 225;

  for (const edge of edges) {
    if (edge.source === selected.id) {
      relatedIds.add(edge.target);
    }
    if (edge.target === selected.id) {
      relatedIds.add(edge.source);
    }
  }

  const inner = others
    .filter((node) => relatedIds.has(node.id))
    .sort((left, right) => left.label.localeCompare(right.label));
  const outer = others
    .filter((node) => !relatedIds.has(node.id))
    .sort((left, right) => left.label.localeCompare(right.label));

  const center = { ...selected, x: 0, y: 0, ring: "center" as const, angle: 0 };
  const innerNodes = inner.map((node, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / Math.max(inner.length, 1);
    return {
      ...node,
      x: Math.cos(angle) * innerRadius,
      y: Math.sin(angle) * innerRadius,
      ring: "inner" as const,
      angle,
    };
  });

  const outerNodes = outer.map((node, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / Math.max(outer.length, 1);
    return {
      ...node,
      x: Math.cos(angle) * outerRadius,
      y: Math.sin(angle) * outerRadius,
      ring: "outer" as const,
      angle,
    };
  });

  return { center, innerNodes, outerNodes };
}

function connectionPairs(edges: GraphEdge[], visibleIds: Set<string>) {
  return edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
}

function shortLabel(label: string) {
  return label.length > 28 ? `${label.slice(0, 26)}...` : label;
}

function hexPoints(size: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return `${Math.cos(angle) * size},${Math.sin(angle) * size}`;
  }).join(" ");
}

export default function GraphView() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncMobile = () => setIsMobile(mediaQuery.matches);
    syncMobile();

    mediaQuery.addEventListener("change", syncMobile);
    return () => mediaQuery.removeEventListener("change", syncMobile);
  }, []);

  const { data, isLoading, refetch } = useQuery<{ nodes: GraphNode[]; edges: GraphEdge[] }>({
    queryKey: ["graph-view", search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }
      return backendApi.graph(params) as Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
    },
  });

  const filteredNodes = data?.nodes ?? [];
  const requestedNodeId =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("node") : null;
  const querySelectedId =
    requestedNodeId && filteredNodes.some((node) => node.id === requestedNodeId) ? requestedNodeId : null;
  const defaultSelectedId = selectedId && filteredNodes.some((node) => node.id === selectedId)
    ? selectedId
    : querySelectedId ?? filteredNodes[0]?.id ?? "";

  useEffect(() => {
    if (querySelectedId && querySelectedId !== selectedId) {
      setSelectedId(querySelectedId);
    }
  }, [querySelectedId, selectedId]);

  const selectedNode = filteredNodes.find((node) => node.id === defaultSelectedId) ?? null;
  const layoutRadii = useMemo(
    () => (isMobile ? { innerRadius: 148, outerRadius: 264 } : { innerRadius: 168, outerRadius: 306 }),
    [isMobile]
  );

  const graph = useMemo(() => {
    if (!filteredNodes.length || !defaultSelectedId) {
      return null;
    }
    return buildCircularLayout(filteredNodes, data?.edges ?? [], defaultSelectedId, layoutRadii);
  }, [filteredNodes, data?.edges, defaultSelectedId, layoutRadii]);

  const visibleNodeMap = useMemo(() => {
    if (!graph) {
      return new Map<string, (GraphNode & { x: number; y: number; ring: "center" | "inner" | "outer"; angle: number })>();
    }
    return new Map(
      [graph.center, ...graph.innerNodes, ...graph.outerNodes].map((node) => [node.id, node])
    );
  }, [graph]);

  const orbitNodes = useMemo(() => {
    if (!graph) {
      return [];
    }

    return [...graph.innerNodes, ...graph.outerNodes].sort((left, right) => {
      if (left.ring !== right.ring) {
        return left.ring === "inner" ? -1 : 1;
      }
      return left.label.localeCompare(right.label);
    });
  }, [graph]);

  const visibleEdges = useMemo(() => connectionPairs(data?.edges ?? [], new Set(visibleNodeMap.keys())), [data?.edges, visibleNodeMap]);

  const relatedNodes = useMemo(() => {
    if (!selectedNode || !data) {
      return [];
    }
    const relatedIds = new Set<string>();
    for (const edge of data.edges) {
      if (edge.source === selectedNode.id) relatedIds.add(edge.target);
      if (edge.target === selectedNode.id) relatedIds.add(edge.source);
    }
    return data.nodes.filter((node) => relatedIds.has(node.id)).slice(0, 6);
  }, [data, selectedNode]);

  const centerLabelLines = useMemo(() => wrapCenterLabel(selectedNode?.label || "Graph View"), [selectedNode]);
  const centerImage = useMemo(() => centerImageForNode(selectedNode), [selectedNode]);
  const graphScale = isMobile ? 1.2 : 1.06;
  const outerLabelFontSize = isMobile ? 16 : 14;
  const innerLabelFontSize = isMobile ? 18 : 16;
  const outerLabelDistance = isMobile ? 56 : 50;
  const innerLabelOffset = isMobile ? 24 : 24;
  const outerNodeRadius = isMobile ? 14 : 13;
  const outerActiveNodeRadius = isMobile ? 17 : 15.5;
  const innerNodeRadius = isMobile ? 15.5 : 14.5;
  const innerActiveNodeRadius = isMobile ? 18.5 : 17;
  const nodeHitRadius = isMobile ? 24 : 21;
  const centerHexSize = isMobile ? 74 : 68;
  const centerTypeFontSize = isMobile ? 11 : 10;
  const centerLabelPrimarySize = isMobile ? 17 : 15;
  const centerLabelSecondarySize = isMobile ? 15 : 13;
  const centerLabelLineGap = isMobile ? 18 : 16;
  const centerImageSize = isMobile ? 170 : 156;
  const graphOffsetX = isMobile ? 0 : 8;
  const graphOffsetY = isMobile ? -56 : -88;

  const selectedConnections = useMemo(() => {
    if (!selectedNode || !data) {
      return new Set<string>();
    }

    const ids = new Set<string>();
    for (const edge of data.edges) {
      if (edge.source === selectedNode.id) ids.add(edge.target);
      if (edge.target === selectedNode.id) ids.add(edge.source);
    }
    return ids;
  }, [data, selectedNode]);

  const hoveredConnections = useMemo(() => {
    if (!hoveredId || !data) {
      return new Set<string>();
    }

    const ids = new Set<string>();
    for (const edge of data.edges) {
      if (edge.source === hoveredId) ids.add(edge.target);
      if (edge.target === hoveredId) ids.add(edge.source);
    }
    return ids;
  }, [data, hoveredId]);

  useEffect(() => {
    if (!isMobile) {
      setDetailsOpen(false);
    }
  }, [isMobile]);

  const handleNodeSelect = (nodeId: string, options?: { openDetails?: boolean }) => {
    setSelectedId(nodeId);
    if (isMobile && options?.openDetails) {
      setDetailsOpen(true);
    }
  };

  const detailsPanel = selectedNode ? (
    <>
      <div
        className="shrink-0 min-h-[220px] px-7 pb-7 pt-14 text-white xl:min-h-[246px] xl:px-8 xl:pb-8 xl:pt-16"
        style={{
          backgroundImage: `linear-gradient(rgba(18,24,38,0.42), rgba(18,24,38,0.68)), url(${centerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mt-4 text-[40px] font-semibold leading-[1.05] xl:text-[48px]">{selectedNode.label}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="rounded-full border-0 px-3 py-1 text-sm" style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "white" }}>
            {selectedNode.type}
          </Badge>
          {selectedNode.region ? <Badge variant="outline" className="rounded-full border-white/35 bg-white/10 px-3 py-1 text-sm text-white">{selectedNode.region}</Badge> : null}
          {selectedNode.country ? <Badge variant="outline" className="rounded-full border-white/35 bg-white/10 px-3 py-1 text-sm text-white">{selectedNode.country}</Badge> : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-7 py-6 xl:px-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400 xl:text-[12px]">Overview</div>
          <p className="mt-3 text-[17px] leading-8 text-slate-600 xl:text-[18px]">
            {selectedNode.description || "This node is connected to the broader market intelligence network."}
          </p>
        </div>

        <div className="rounded-[24px] border border-[#ece7de] bg-[#fbfaf7] px-6 py-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400 xl:text-[12px]">Interpretation</div>
          <div className="mt-3 text-[16px] leading-8 text-slate-600 xl:text-[17px]">
            {selectedNode.type === "Issuer" && "This issuer can be reviewed through offerings, disclosures, and relationship links across the Worldbridgers market ecosystem."}
            {selectedNode.type === "Investor" && "This investor node shows how capital relationships connect with issuers, themes, and regional opportunity clusters."}
            {selectedNode.type === "Market" && "This market node anchors the selected company within a wider region or thematic trading environment."}
            {selectedNode.type === "Theme" && "This theme highlights how companies and instruments cluster around a shared sustainability or transition topic."}
            {selectedNode.type === "Opportunity" && "This opportunity node shows where companies or themes align with investable or strategic growth areas."}
            {selectedNode.type === "Project" && "This project node reveals execution-level links between issuers, markets, and impact themes."}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400 xl:text-[12px]">Related nodes</div>
            <div className="text-xs text-slate-400">Move inward on select</div>
          </div>
          <div className="mt-3 space-y-2">
            {relatedNodes.length ? relatedNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => handleNodeSelect(node.id, { openDetails: isMobile })}
                className="flex w-full items-center justify-between rounded-2xl border border-[#ebe8e0] bg-[#faf9f6] px-4 py-3 text-left transition-colors hover:border-[#d6d1c7] hover:bg-white"
              >
                <div>
                  <div className="text-[18px] font-medium leading-6 text-slate-800">{shortLabel(node.label)}</div>
                  <div className="mt-1 text-sm text-slate-500">{node.type}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            )) : (
              <div className="rounded-2xl border border-dashed border-[#ddd7cd] px-4 py-4 text-sm text-slate-500">
                No related nodes available.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f7f6f2] px-5 py-5">
            <div className="text-sm text-slate-500">Visible nodes</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{filteredNodes.length}</div>
          </div>
          <div className="rounded-2xl bg-[#f7f6f2] px-5 py-5">
            <div className="text-sm text-slate-500">Visible links</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{data?.edges.length ?? 0}</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#ebe5db] bg-[#faf8f3] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400 xl:text-[12px]">Node types</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(NODE_CONFIG) as GraphNode["type"][]).map((type) => {
              const Icon = NODE_CONFIG[type].icon;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: NODE_CONFIG[type].fill, color: NODE_CONFIG[type].color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-slate-700">{type}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="flex h-full min-h-[520px] items-center justify-center px-8 text-center">
      <div>
        <Network className="mx-auto h-10 w-10 text-slate-300" />
        <div className="mt-4 text-lg font-medium text-slate-700">Select a node</div>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          The information panel will update with its summary, context, and related connections.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f6f5f1]">
      <DashboardHeader />
      <main className="mx-auto flex h-[calc(100vh-72px)] max-w-[1900px] flex-col px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
        <div className="mb-3 flex flex-col gap-3 rounded-[28px] border border-[#e8e4dc] bg-white/70 px-4 py-3 backdrop-blur-sm xl:flex-row xl:items-center xl:justify-between xl:px-5">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-xl font-semibold text-slate-800 transition-colors hover:text-[#244cba]"
            >
              <ArrowLeft className="h-4 w-4" />
              Discover
            </button>
            <div className="hidden h-8 w-px bg-[#dbd5ca] sm:block" />
            <div className="text-sm text-slate-500 xl:text-[15px]">
              Explore the live relationship graph and inspect node context side by side.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-[260px] xl:min-w-[360px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search themes, issuers, investors..."
                className="h-10 rounded-full border-[#e3ddd2] bg-white pl-10 xl:h-12"
              />
            </div>
            <Button variant="outline" className="h-10 rounded-full border-[#dfd8cb] bg-white px-5 xl:h-12" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(420px,0.78fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(460px,0.82fr)]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[34px] border border-[#e8e4dc] bg-white shadow-[0_18px_48px_rgba(20,31,24,0.06)]">
            <div className="min-h-[62vh] flex-1 bg-[radial-gradient(circle_at_center,_#fdfdfb_0%,_#f6f5f1_62%,_#f1eee8_100%)] px-1 py-1 sm:min-h-0 sm:px-3 sm:py-3 xl:px-4 xl:py-4">
              {isLoading ? (
                <div className="flex h-full min-h-[62vh] items-center justify-center sm:min-h-[700px] xl:min-h-[760px]">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-[#244cba]" />
                    <div className="text-sm">Loading graph view...</div>
                  </div>
                </div>
              ) : graph ? (
                <div className="flex h-full min-h-[62vh] items-center justify-center overflow-hidden sm:min-h-[700px] xl:min-h-[760px]">
                  <svg
                    viewBox="-470 -450 940 900"
                    className="mx-auto h-full w-full max-w-[min(100vw-1rem,46rem)] sm:max-h-[min(86vh,82rem)] sm:max-w-[min(100%,82rem)]"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <g transform={`translate(${graphOffsetX} ${graphOffsetY}) scale(${graphScale})`}>
                    <circle cx="0" cy="0" r={layoutRadii.innerRadius} fill="none" stroke="#c7cedd" strokeWidth="2.2" />
                    <circle cx="0" cy="0" r={layoutRadii.outerRadius} fill="none" stroke="#bcc6da" strokeWidth="2.2" />

                    {visibleEdges.map((edge) => {
                      const source = visibleNodeMap.get(edge.source);
                      const target = visibleNodeMap.get(edge.target);
                      if (!source || !target) return null;
                      const isSelectedConnection =
                        edge.source === selectedNode?.id || edge.target === selectedNode?.id;
                      const isHoveredConnection =
                        hoveredId !== null && (edge.source === hoveredId || edge.target === hoveredId);
                      const mx = (source.x + target.x) / 2;
                      const my = (source.y + target.y) / 2;
                      const cx = mx * 0.86;
                      const cy = my * 0.86;
                      return (
                        <path
                          key={edge.id}
                          d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                          fill="none"
                          stroke={isHoveredConnection ? "#153e75" : isSelectedConnection ? "#4159c7" : "#8f9db6"}
                          strokeWidth={isHoveredConnection ? "3" : isSelectedConnection ? "2.3" : "1.4"}
                          opacity={isHoveredConnection ? "1" : isSelectedConnection ? "0.96" : "0.48"}
                          style={{ transition: "stroke 180ms ease, stroke-width 180ms ease, opacity 180ms ease" }}
                        />
                      );
                    })}

                    {orbitNodes.map((node) => {
                      const isActive = node.id === selectedNode?.id;
                      const isRelated = selectedConnections.has(node.id);
                      if (node.ring === "outer") {
                        const labelDistance = outerLabelDistance;
                        const labelX = node.x >= 0 ? labelDistance : -labelDistance;
                        const labelY = node.y > layoutRadii.outerRadius * 0.6
                          ? labelDistance * 0.55
                          : node.y < -layoutRadii.outerRadius * 0.6
                            ? -labelDistance * 0.55
                            : 0;
                        const anchor =
                          Math.abs(node.x) < layoutRadii.outerRadius * 0.24
                            ? "middle"
                            : node.x > 0
                              ? "start"
                              : "end";
                        return (
                          <g key={node.id} transform={`translate(${node.x} ${node.y})`} style={{ transition: NODE_TRANSITION }}>
                            <circle
                              cx="0"
                              cy="0"
                              r={nodeHitRadius}
                              fill="transparent"
                              onClick={() => handleNodeSelect(node.id, { openDetails: true })}
                              onMouseEnter={() => setHoveredId(node.id)}
                              onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                              style={{ cursor: "pointer" }}
                            />
                            <circle
                              cx="0"
                              cy="0"
                              r={isActive ? outerActiveNodeRadius : outerNodeRadius}
                              fill={isActive ? NODE_CONFIG[node.type].color : "white"}
                              stroke={NODE_CONFIG[node.type].color}
                              strokeWidth={isActive ? 3 : hoveredConnections.has(node.id) ? 2.9 : isRelated ? 2.4 : 1.9}
                              onClick={() => handleNodeSelect(node.id, { openDetails: true })}
                              onMouseEnter={() => setHoveredId(node.id)}
                              onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                              style={{ cursor: "pointer" }}
                            />
                            <text
                              x={labelX}
                              y={labelY}
                              textAnchor={anchor}
                              dominantBaseline="middle"
                              fontSize={outerLabelFontSize}
                              fill={isActive ? "#1c2d80" : "#222631"}
                              style={{ fontWeight: isActive || isRelated ? 700 : 500 }}
                            >
                              {shortLabel(node.label)}
                            </text>
                          </g>
                        );
                      }

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x} ${node.y})`}
                          style={{ cursor: "pointer", transition: NODE_TRANSITION }}
                        >
                          <circle
                            cx="0"
                            cy="0"
                            r={nodeHitRadius}
                            fill="transparent"
                            onClick={() => handleNodeSelect(node.id, { openDetails: true })}
                            onMouseEnter={() => setHoveredId(node.id)}
                            onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r={isActive ? innerActiveNodeRadius : innerNodeRadius}
                            fill={isActive ? NODE_CONFIG[node.type].color : "white"}
                            stroke={NODE_CONFIG[node.type].color}
                            strokeWidth={isActive ? 3 : hoveredConnections.has(node.id) ? 3 : isRelated ? 2.5 : 2.1}
                          />
                          <text
                            x={node.x >= 0 ? innerLabelOffset : -innerLabelOffset}
                            y="0"
                            textAnchor={node.x >= 0 ? "start" : "end"}
                            dominantBaseline="middle"
                            fontSize={innerLabelFontSize}
                            fill={isActive ? "#1c2d80" : "#1f2430"}
                            style={{ fontWeight: isActive || isRelated ? 700 : 600 }}
                          >
                            {shortLabel(node.label)}
                          </text>
                        </g>
                      );
                    })}

                    <g>
                      <polygon points={hexPoints(centerHexSize)} fill={`url(#centerImagePattern)`} />
                      <polygon points={hexPoints(centerHexSize)} fill="rgba(28, 32, 40, 0.28)" />
                      <text x="0" y="-15" textAnchor="middle" fontSize={centerTypeFontSize} fill="white" style={{ fontWeight: 500, letterSpacing: "0.1em" }}>
                        {selectedNode?.type?.toUpperCase() || "NODE"}
                      </text>
                      <text x="0" y="4" textAnchor="middle" fill="white" dominantBaseline="middle" style={{ fontWeight: 700 }}>
                        {centerLabelLines.map((line, index) => (
                          <tspan key={line} x="0" dy={index === 0 ? 0 : centerLabelLineGap} fontSize={index === 0 ? centerLabelPrimarySize : centerLabelSecondarySize}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>

                    <defs>
                      <radialGradient id="centerFill" cx="50%" cy="45%" r="70%">
                        <stop offset="0%" stopColor="#5b6478" />
                        <stop offset="55%" stopColor="#444a58" />
                        <stop offset="100%" stopColor="#2e3340" />
                      </radialGradient>
                      <pattern id="centerImagePattern" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox">
                        <image
                          href={centerImage}
                          x="-12"
                          y="-8"
                          width={centerImageSize}
                          height={centerImageSize}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </pattern>
                    </defs>
                    </g>
                  </svg>
                </div>
              ) : (
                <div className="flex h-full min-h-[62vh] items-center justify-center text-center text-slate-500 sm:min-h-[700px] xl:min-h-[760px]">
                  <div>
                    <Network className="mx-auto h-10 w-10 text-slate-300" />
                    <div className="mt-4 text-sm">No graph data available for this selection.</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="hidden min-h-0 flex-col overflow-hidden rounded-[36px] border border-[#e8e4dc] bg-white shadow-[0_18px_48px_rgba(20,31,24,0.06)] sm:flex">
            {detailsPanel}
          </aside>
        </div>

        {isMobile ? (
          <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DrawerContent className="max-h-[82vh] rounded-t-[28px] border-[#e8e4dc] bg-[#f6f5f1]">
              <DrawerHeader className="pb-2 text-left">
                <DrawerTitle>{selectedNode ? selectedNode.label : "Node details"}</DrawerTitle>
                <DrawerDescription>Swipe down to return to the graph.</DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 overflow-y-auto px-3 pb-4">
                <div className="overflow-hidden rounded-[28px] border border-[#e8e4dc] bg-white shadow-[0_18px_48px_rgba(20,31,24,0.06)]">
                  {detailsPanel}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </main>
    </div>
  );
}
