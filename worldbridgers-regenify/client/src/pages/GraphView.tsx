import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import { backendApi } from "@/lib/backendApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ShieldCheck,
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

const GRAPH_TRANSITION = "all 520ms cubic-bezier(0.22, 1, 0.36, 1)";

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

  return lines.slice(0, 3);
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

function buildCircularLayout(nodes: GraphNode[], edges: GraphEdge[], selectedId: string) {
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const others = nodes.filter((node) => node.id !== selected.id);
  const relatedIds = new Set<string>();

  for (const edge of edges) {
    if (edge.source === selected.id) relatedIds.add(edge.target);
    if (edge.target === selected.id) relatedIds.add(edge.source);
  }

  const inner = others.filter((node) => relatedIds.has(node.id));
  const outer = others.filter((node) => !relatedIds.has(node.id));

  const center = { ...selected, x: 0, y: 0, ring: "center" as const, angle: 0 };
  const innerNodes = inner.map((node, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / Math.max(inner.length, 1);
    return {
      ...node,
      x: Math.cos(angle) * 118,
      y: Math.sin(angle) * 118,
      ring: "inner" as const,
      angle,
    };
  });

  const outerNodes = outer.map((node, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / Math.max(outer.length, 1);
    return {
      ...node,
      x: Math.cos(angle) * 230,
      y: Math.sin(angle) * 230,
      ring: "outer" as const,
      angle,
    };
  });

  return { center, innerNodes, outerNodes };
}

function curvedPath(
  source: { x: number; y: number; ring: "center" | "inner" | "outer" },
  target: { x: number; y: number; ring: "center" | "inner" | "outer" },
  highlighted: boolean
) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const sx = source.x;
  const sy = source.y;
  const tx = target.x;
  const ty = target.y;
  const sourceRadius = Math.hypot(sx, sy) || 1;
  const targetRadius = Math.hypot(tx, ty) || 1;
  const sourceTowardCenterX = sx - (sx / sourceRadius) * (highlighted ? 68 : 92);
  const sourceTowardCenterY = sy - (sy / sourceRadius) * (highlighted ? 68 : 92);
  const targetTowardCenterX = tx - (tx / targetRadius) * (highlighted ? 68 : 92);
  const targetTowardCenterY = ty - (ty / targetRadius) * (highlighted ? 68 : 92);
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const nx = -dy / distance;
  const ny = dx / distance;
  const sweep =
    source.ring === "outer" && target.ring === "outer"
      ? highlighted ? 34 : 24
      : source.ring === "center" || target.ring === "center"
        ? highlighted ? 14 : 8
        : highlighted ? 24 : 16;
  const direction = mx >= 0 ? 1 : -1;
  const bendX = mx + nx * sweep * direction;
  const bendY = my + ny * sweep * direction;

  return `M ${sx} ${sy} C ${sourceTowardCenterX} ${sourceTowardCenterY}, ${bendX} ${bendY}, ${targetTowardCenterX} ${targetTowardCenterY} S ${tx} ${ty}, ${tx} ${ty}`;
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
  const defaultSelectedId = selectedId && filteredNodes.some((node) => node.id === selectedId)
    ? selectedId
    : filteredNodes[0]?.id ?? "";

  const selectedNode = filteredNodes.find((node) => node.id === defaultSelectedId) ?? null;

  const graph = useMemo(() => {
    if (!filteredNodes.length || !defaultSelectedId) {
      return null;
    }
    return buildCircularLayout(filteredNodes, data?.edges ?? [], defaultSelectedId);
  }, [data?.edges, filteredNodes, defaultSelectedId]);

  const visibleNodeMap = useMemo(() => {
    if (!graph) {
      return new Map<string, (GraphNode & { x: number; y: number; ring: "center" | "inner" | "outer"; angle: number })>();
    }
    return new Map(
      [graph.center, ...graph.innerNodes, ...graph.outerNodes].map((node) => [node.id, node])
    );
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

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <DashboardHeader />
      <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#e8e4dc] bg-white p-6 shadow-[0_14px_40px_rgba(20,31,24,0.05)]">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#244cba]"
            >
              <ArrowLeft className="h-4 w-4" />
              Discover
            </button>

            <div className="mt-6 rounded-[22px] bg-slate-950 px-5 py-4 text-white">
              <div className="text-xs uppercase tracking-[0.22em] text-white/50">Strategic Intelligence</div>
              <div className="mt-2 text-lg font-semibold">Relationship Graph</div>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">How to read</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Select any company, theme, investor, or market node in the map. The right-side panel updates with its information, regional context, and related connections.
                </p>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Related nodes</div>
                <div className="mt-3 space-y-2">
                  {relatedNodes.length ? relatedNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#ebe8e0] bg-[#faf9f6] px-4 py-3 text-left transition-colors hover:border-[#d6d1c7] hover:bg-white"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800">{shortLabel(node.label)}</div>
                        <div className="mt-1 text-xs text-slate-500">{node.type}</div>
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
            </div>
          </aside>

          <section className="rounded-[28px] border border-[#e8e4dc] bg-white px-4 py-4 shadow-[0_14px_40px_rgba(20,31,24,0.05)] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 border-b border-[#eee9e1] pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[#f6f5f1] px-4 py-2 text-sm font-medium text-slate-700">
                  Intelligence Map
                </div>
                {data ? (
                  <div className="text-sm text-slate-500">
                    {data.nodes.length} nodes · {data.edges.length} links
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search themes, issuers, investors..."
                    className="h-11 rounded-full border-[#e3ddd2] bg-[#fbfaf7] pl-10"
                  />
                </div>
                <Button variant="outline" className="h-11 rounded-full border-[#dfd8cb]" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
              <div className="rounded-[26px] bg-[#f7f6f2] p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex min-h-[720px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin text-[#244cba]" />
                      <div className="text-sm">Loading graph view...</div>
                    </div>
                  </div>
                ) : graph ? (
                  <div className="overflow-auto">
                    <svg viewBox="-360 -360 720 720" className="mx-auto h-[720px] w-full min-w-[640px]">
                      <circle cx="0" cy="0" r="225" fill="none" stroke="#bcc6da" strokeWidth="2.2" />

                      {visibleEdges.map((edge) => {
                        const source = visibleNodeMap.get(edge.source);
                        const target = visibleNodeMap.get(edge.target);
                        if (!source || !target) return null;
                        const isSelectedConnection =
                          edge.source === selectedNode?.id || edge.target === selectedNode?.id;
                        const isHoveredConnection =
                          hoveredId != null && (edge.source === hoveredId || edge.target === hoveredId);
                        const isContextConnection =
                          selectedConnections.has(edge.source) && selectedConnections.has(edge.target);
                        return (
                          <path
                            key={edge.id}
                            d={curvedPath(source, target, isSelectedConnection)}
                            fill="none"
                            stroke={
                              isSelectedConnection
                                ? "#3f56be"
                                : isHoveredConnection
                                  ? "#5f6f9b"
                                  : isContextConnection
                                    ? "#717e99"
                                    : "#96a3b9"
                            }
                            strokeWidth={isSelectedConnection ? "2.5" : isHoveredConnection ? "1.9" : isContextConnection ? "1.6" : "1.2"}
                            opacity={isSelectedConnection ? "0.96" : isHoveredConnection ? "0.64" : isContextConnection ? "0.5" : "0.26"}
                            style={{ transition: GRAPH_TRANSITION }}
                          />
                        );
                      })}

                      {graph.outerNodes.map((node) => {
                        const isActive = node.id === selectedNode?.id;
                        const isRelated = selectedConnections.has(node.id);
                        const angle = node.angle * 180 / Math.PI;
                        const labelX = Math.cos(node.angle) * 258;
                        const labelY = Math.sin(node.angle) * 258;
                        const rotate = angle > 90 || angle < -90 ? angle + 180 : angle;
                        const anchor = angle > 90 || angle < -90 ? "end" : "start";
                        return (
                          <g
                            key={node.id}
                            style={{
                              transition: GRAPH_TRANSITION,
                            }}
                          >
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={isActive ? 12.5 : isRelated ? 10.8 : 9.5}
                              fill={isActive ? NODE_CONFIG[node.type].color : isRelated ? "white" : "#f4f5f8"}
                              stroke={isActive ? NODE_CONFIG[node.type].color : isRelated ? NODE_CONFIG[node.type].color : "#626976"}
                              strokeWidth={isActive ? 3 : hoveredId === node.id ? 2.8 : isRelated ? 2.3 : 1.8}
                              onClick={() => setSelectedId(node.id)}
                              onMouseEnter={() => setHoveredId(node.id)}
                              onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                              style={{
                                cursor: "pointer",
                                transition: GRAPH_TRANSITION,
                                filter: hoveredId === node.id ? "drop-shadow(0 0 10px rgba(80,95,140,0.24))" : "none",
                                transform: hoveredId === node.id ? "scale(1.08)" : "scale(1)",
                                transformOrigin: `${node.x}px ${node.y}px`,
                              }}
                            />
                            <text
                              x={labelX}
                              y={labelY}
                              textAnchor={anchor}
                              dominantBaseline="middle"
                              transform={`rotate(${rotate} ${labelX} ${labelY})`}
                              fontSize="11"
                              fill={isActive ? "#1c2d80" : isRelated ? "#1f2430" : "#3f4758"}
                              style={{
                                fontWeight: isActive || hoveredId === node.id || isRelated ? 700 : 500,
                                opacity: hoveredId === node.id || isRelated ? 1 : 0.94,
                                transition: GRAPH_TRANSITION,
                              }}
                            >
                              {shortLabel(node.label)}
                            </text>
                          </g>
                        );
                      })}

                      {graph.innerNodes.map((node) => {
                        const isActive = node.id === selectedNode?.id;
                        const isRelated = selectedConnections.has(node.id);
                        return (
                        <g
                          key={node.id}
                          onClick={() => setSelectedId(node.id)}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                          style={{ cursor: "pointer", transition: GRAPH_TRANSITION }}
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isActive ? 14 : 13}
                            fill={isActive ? NODE_CONFIG[node.type].color : "#fbfcff"}
                            stroke={NODE_CONFIG[node.type].color}
                            strokeWidth={isActive ? 3 : hoveredId === node.id ? 3 : 2.6}
                            style={{
                              transition: GRAPH_TRANSITION,
                              filter: hoveredId === node.id ? "drop-shadow(0 0 12px rgba(64,88,168,0.24))" : "none",
                              transform: hoveredId === node.id ? "scale(1.08)" : "scale(1)",
                              transformOrigin: `${node.x}px ${node.y}px`,
                            }}
                          />
                          <text
                            x={node.x + (node.x >= 0 ? 18 : -18)}
                            y={node.y}
                            textAnchor={node.x >= 0 ? "start" : "end"}
                            dominantBaseline="middle"
                            fontSize="12"
                            fill={isActive ? "#1c2d80" : "#1f2430"}
                            style={{
                              fontWeight: isActive || hoveredId === node.id || isRelated ? 700 : 650,
                              transition: GRAPH_TRANSITION,
                            }}
                          >
                            {shortLabel(node.label)}
                          </text>
                        </g>
                      )})}

                      <g>
                        <circle cx="0" cy="0" r="122" fill="none" stroke="#c7cedd" strokeWidth="2.2" />
                        <polygon points={hexPoints(72)} fill="url(#centerFill)" stroke="#8ea5ef" strokeWidth="3.2" />
                        <polygon points={hexPoints(58)} fill={`url(#centerImagePattern)`} />
                        <polygon points={hexPoints(58)} fill="rgba(28, 32, 40, 0.22)" />
                        <text x="0" y="-14" textAnchor="middle" fontSize="11" fill="white" style={{ fontWeight: 500, letterSpacing: "0.12em" }}>
                          {selectedNode?.type?.toUpperCase() || "NODE"}
                        </text>
                        <text x="0" y="4" textAnchor="middle" fill="white" style={{ fontWeight: 700 }}>
                          {centerLabelLines.map((line, index) => (
                            <tspan key={line} x="0" dy={index === 0 ? 0 : 18} fontSize={index === 0 ? 16 : 14}>
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
                            width="140"
                            height="140"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </pattern>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <div className="flex min-h-[720px] items-center justify-center text-center text-slate-500">
                    <div>
                      <Network className="mx-auto h-10 w-10 text-slate-300" />
                      <div className="mt-4 text-sm">No graph data available for this selection.</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-[#ebe5db] bg-[#faf8f3] p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Node types</div>
                  <div className="mt-4 space-y-3">
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
                          <div className="text-sm font-medium text-slate-700">{type}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#ebe5db] bg-white p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected company / node</div>
                  {selectedNode ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[22px] border border-[#ebe5db] bg-[#f7f8fc] p-4">
                        <div className="text-lg font-semibold text-slate-900">{selectedNode.label}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="rounded-full border-0 px-3 py-1 text-xs" style={{ backgroundColor: NODE_CONFIG[selectedNode.type].fill, color: NODE_CONFIG[selectedNode.type].color }}>
                            {selectedNode.type}
                          </Badge>
                          {selectedNode.region ? <Badge variant="outline" className="rounded-full">{selectedNode.region}</Badge> : null}
                          {selectedNode.country ? <Badge variant="outline" className="rounded-full">{selectedNode.country}</Badge> : null}
                        </div>
                      </div>
                      <p className="text-sm leading-7 text-slate-600">
                        {selectedNode.description || "This node is connected to the broader market intelligence network."}
                      </p>
                      <div className="rounded-[22px] bg-[#f7f6f2] px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">What this means</div>
                        <div className="mt-2 text-sm leading-7 text-slate-600">
                          {selectedNode.type === "Issuer" && "This issuer can be reviewed through offerings, disclosures, and relationship links across the Worldbridgers market ecosystem."}
                          {selectedNode.type === "Investor" && "This investor node shows how capital relationships connect with issuers, themes, and regional opportunity clusters."}
                          {selectedNode.type === "Market" && "This market node anchors the selected company within a wider region or thematic trading environment."}
                          {selectedNode.type === "Theme" && "This theme highlights how companies and instruments cluster around a shared sustainability or transition topic."}
                          {selectedNode.type === "Opportunity" && "This opportunity node shows where companies or themes align with investable or strategic growth areas."}
                          {selectedNode.type === "Project" && "This project node reveals execution-level links between issuers, markets, and impact themes."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-slate-500">Choose a node to view more detail.</div>
                  )}
                </div>

                <div className="rounded-[24px] border border-[#ebe5db] bg-white p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Graph summary</div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-[#f7f6f2] px-4 py-3">
                      <div className="text-xs text-slate-500">Visible nodes</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-900">{filteredNodes.length}</div>
                    </div>
                    <div className="rounded-2xl bg-[#f7f6f2] px-4 py-3">
                      <div className="text-xs text-slate-500">Visible links</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-900">{data?.edges.length ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
