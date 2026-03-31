import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Filter,
  Globe2,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  Maximize2,
  Network,
  RefreshCw,
  Search,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "Issuer" | "Investor" | "Opportunity" | "Project" | "Market" | "Theme";
  region?: string;
  description?: string;
  value?: number;
  country?: string;
  x: number;
  y: number;
  angle?: number;
  ring?: 0 | 1 | 2;
  targetX?: number;
  targetY?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

const NODE_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  Issuer: { color: "#22c55e", icon: Building2, label: "Issuers" },
  Investor: { color: "#3b82f6", icon: Users, label: "Investors" },
  Opportunity: { color: "#f59e0b", icon: Lightbulb, label: "Opportunities" },
  Project: { color: "#f97316", icon: Layers, label: "Projects" },
  Market: { color: "#06b6d4", icon: Globe2, label: "Markets" },
  Theme: { color: "#111827", icon: Network, label: "Themes" },
};

const FILTER_TYPES = ["Theme", "Issuer", "Investor", "Opportunity", "Project", "Market"];
const FILTER_REGIONS = [
  "Europe",
  "Asia",
  "Pacific",
  "North America",
  "South America",
  "Africa",
  "Middle East",
  "Global",
];

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawTextInsideHexagon(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return;

  const maxTextWidth = radius * 1.45;
  const maxLines = 3;
  let fontSize = 15;
  let lines: string[] = [];

  const buildLines = (size: number) => {
    ctx.font = `700 ${size}px Inter, sans-serif`;
    const words = normalized.split(" ");
    const result: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxTextWidth) {
        current = test;
      } else {
        if (current) result.push(current);
        current = word;
      }
    }
    if (current) result.push(current);
    return result;
  };

  for (let i = 0; i < 6; i++) {
    lines = buildLines(fontSize);
    const lineHeight = fontSize * 1.1;
    const totalHeight = lines.length * lineHeight;
    const fitsHeight = totalHeight <= radius * 1.35;
    const fitsLines = lines.length <= maxLines;
    const fitsWidth = lines.every((line) => ctx.measureText(line).width <= maxTextWidth);
    if (fitsHeight && fitsLines && fitsWidth) break;
    fontSize -= 1;
  }

  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1] ?? "";
    lines[maxLines - 1] = last.length > 2 ? `${last.slice(0, Math.max(0, last.length - 2))}..` : `${last}..`;
  }

  const lineHeight = fontSize * 1.1;
  const totalHeight = lines.length * lineHeight;
  let y = cy - totalHeight / 2 + lineHeight * 0.85;
  ctx.fillStyle = "white";
  ctx.font = `700 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = "center";

  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }
}

function chooseCenterNodeId(nodes: GraphNode[]) {
  const byLabel = nodes.find((n) => /entrepreneur|regenify|exchange/i.test(n.label));
  return (byLabel ?? nodes[0])?.id ?? "";
}

function buildRadialLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  centerId?: string,
): GraphNode[] {
  if (nodes.length === 0) return [];
  const fallbackCenterId = chooseCenterNodeId(nodes);
  const center =
    nodes.find((n) => n.id === centerId) ??
    nodes.find((n) => n.id === fallbackCenterId) ??
    nodes[0];
  const others = nodes.filter((n) => n.id !== center.id);

  const cx = width / 2;
  const cy = height / 2;
  const innerR = Math.min(width, height) * 0.2;
  const outerR = Math.min(width, height) * 0.36;

  const connectedToCenter = new Set(
    edges
      .filter((e) => e.source === center.id || e.target === center.id)
      .map((e) => (e.source === center.id ? e.target : e.source)),
  );

  const innerNodes = others.filter((n) => connectedToCenter.has(n.id));
  const outerNodes = others.filter((n) => !connectedToCenter.has(n.id));

  const place = (list: GraphNode[], radius: number, ring: 1 | 2) =>
    list.map((node, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(list.length, 1) - Math.PI / 2;
      return {
        ...node,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        angle,
        ring,
      };
    });

  return [
    { ...center, x: cx, y: cy, angle: 0, ring: 0 },
    ...place(innerNodes, innerR, 1),
    ...place(outerNodes, outerR, 2),
  ];
}

function NodeDetailPanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const cfg = NODE_CONFIG[node.type];
  const Icon = cfg.icon;
  return (
    <div className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="flex items-start justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100">
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight">{node.label}</div>
            <div className="text-xs mt-0.5" style={{ color: cfg.color }}>
              {node.type}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {node.description && <p className="text-xs text-slate-600 leading-relaxed">{node.description}</p>}
        {node.region && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Region</span>
            <span className="text-slate-900">{node.region}</span>
          </div>
        )}
        {node.country && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Country</span>
            <span className="text-slate-900">{node.country}</span>
          </div>
        )}
        {node.value !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Value</span>
            <span className="text-slate-900 font-semibold">USD {(node.value / 1_000_000).toFixed(0)}M</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-200">
          <Badge className="text-xs font-medium border-0 text-white" style={{ backgroundColor: cfg.color }}>
            {node.type}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function GraphView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const transformRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const hoverRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeCenterId, setActiveCenterId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = trpc.graph.data.useQuery({
    filterTypes: filterTypes.length ? filterTypes : undefined,
    filterRegions: filterRegions.length ? filterRegions : undefined,
    search: search || undefined,
  });

  const hasData = useMemo(() => Boolean(data && data.nodes.length), [data]);

  useEffect(() => {
    if (!data || !containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    const incoming = data.nodes.map((n) => ({ ...n, x: 0, y: 0 })) as GraphNode[];
    const centerId =
      activeCenterId && incoming.some((n) => n.id === activeCenterId)
        ? activeCenterId
        : chooseCenterNodeId(incoming);

    const laidOut = buildRadialLayout(
      incoming,
      data.edges as GraphEdge[],
      width,
      height,
      centerId,
    );
    const prevById = new Map(nodesRef.current.map((n) => [n.id, n]));
    nodesRef.current = laidOut.map((n) => {
      const prev = prevById.get(n.id);
      return {
        ...n,
        x: prev?.x ?? n.x,
        y: prev?.y ?? n.y,
        targetX: n.x,
        targetY: n.y,
      };
    });
    edgesRef.current = data.edges as GraphEdge[];
  }, [activeCenterId, data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      if (!containerRef.current) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = containerRef.current.offsetWidth * ratio;
      canvas.height = containerRef.current.offsetHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (nodesRef.current.length > 0) {
        const laidOut = buildRadialLayout(
          nodesRef.current.map((n) => ({ ...n, x: 0, y: 0 })),
          edgesRef.current,
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight,
          activeCenterId ?? undefined,
        );
        const prevById = new Map(nodesRef.current.map((n) => [n.id, n]));
        nodesRef.current = laidOut.map((n) => {
          const prev = prevById.get(n.id);
          return {
            ...n,
            x: prev?.x ?? n.x,
            y: prev?.y ?? n.y,
            targetX: n.x,
            targetY: n.y,
          };
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const { scale, tx, ty } = transformRef.current;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      for (const node of nodes) {
        if (node.targetX !== undefined) node.x += (node.targetX - node.x) * 0.14;
        if (node.targetY !== undefined) node.y += (node.targetY - node.y) * 0.14;
      }

      const center = nodes.find((n) => n.ring === 0);
      if (center) {
        const innerR = Math.min(w, h) * 0.2;
        const outerR = Math.min(w, h) * 0.36;
        ctx.beginPath();
        ctx.arc(center.x, center.y, innerR, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(24, 46, 100, 0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(center.x, center.y, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(24, 46, 100, 0.25)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 70);
        grad.addColorStop(0, "#f59e0b");
        grad.addColorStop(0.6, "#f97316");
        grad.addColorStop(1, "#1e3a8a");
        drawHexagon(ctx, center.x, center.y, 64);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(30, 58, 138, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        if (selectedNode && center.id === selectedNode.id) {
          drawTextInsideHexagon(ctx, center.label, center.x, center.y, 64);
        }

      }

      for (const edge of edges) {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) continue;
        const highlighted =
          selectedNode?.id === src.id ||
          selectedNode?.id === tgt.id ||
          hoverRef.current === src.id ||
          hoverRef.current === tgt.id;
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        const curvePull = center ? 0.15 : 0;
        const cx = center ? mx + (center.x - mx) * curvePull : mx;
        const cy = center ? my + (center.y - my) * curvePull : my;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
        ctx.strokeStyle = highlighted ? "rgba(31, 85, 206, 0.45)" : "rgba(14, 30, 60, 0.12)";
        ctx.lineWidth = highlighted ? 1.5 : 1;
        ctx.stroke();
      }

      for (const node of nodes) {
        if (node.ring === 0) continue;
        const cfg = NODE_CONFIG[node.type];
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoverRef.current === node.id;
        const r = isSelected ? 13 : 10;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        const labelOffset = node.ring === 2 ? 22 : 18;
        ctx.fillStyle = isSelected || isHovered ? "rgba(17, 24, 39, 0.95)" : "rgba(30, 41, 59, 0.75)";
        ctx.font = `${isSelected ? "700" : "500"} 11px Inter, sans-serif`;

        if (node.ring === 2 && node.angle !== undefined) {
          const lx = node.x + Math.cos(node.angle) * labelOffset;
          const ly = node.y + Math.sin(node.angle) * labelOffset;
          const rightSide = Math.cos(node.angle) >= 0;
          ctx.textAlign = rightSide ? "left" : "right";
          ctx.fillText(node.label, lx, ly + 4);
        } else {
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x, node.y + labelOffset);
        }
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [activeCenterId, selectedNode]);

  const findNodeAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { scale, tx, ty } = transformRef.current;
    const x = (clientX - rect.left - tx) / scale;
    const y = (clientY - rect.top - ty) / scale;

    for (const node of nodesRef.current) {
      const radius = node.ring === 0 ? 60 : 13;
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) return node;
    }
    return null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const node = findNodeAt(e.clientX, e.clientY);
    if (!node) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - transformRef.current.tx,
        y: e.clientY - transformRef.current.ty,
      };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const node = findNodeAt(e.clientX, e.clientY);
    hoverRef.current = node?.id ?? null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = node ? "pointer" : isDraggingRef.current ? "grabbing" : "grab";
    }
    if (!isDraggingRef.current) return;
    transformRef.current.tx = e.clientX - dragStartRef.current.x;
    transformRef.current.ty = e.clientY - dragStartRef.current.y;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) {
      const node = findNodeAt(e.clientX, e.clientY);
      setSelectedNode(node ?? null);
      if (node) {
        setActiveCenterId(node.id);
      } else if (data?.nodes?.length) {
        setActiveCenterId(chooseCenterNodeId(data.nodes as GraphNode[]));
      }
    }
    isDraggingRef.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.92;
    transformRef.current.scale = Math.max(0.5, Math.min(2.4, transformRef.current.scale * factor));
  };

  const zoom = (factor: number) => {
    transformRef.current.scale = Math.max(0.5, Math.min(2.4, transformRef.current.scale * factor));
  };

  const resetView = () => {
    transformRef.current = { scale: 1, tx: 0, ty: 0 };
  };

  const toggleType = (t: string) =>
    setFilterTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const toggleRegion = (r: string) =>
    setFilterRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50">
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2.5 border border-slate-200">
            <Network className="w-4 h-4 text-blue-700" />
            <span className="text-sm font-semibold text-slate-900">Ecosystem Ring View</span>
            {data && (
              <span className="text-xs text-slate-500 ml-1">
                {data.nodes.length} nodes · {data.edges.length} edges
              </span>
            )}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${
              showFilters || filterTypes.length || filterRegions.length
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white/90 border-slate-200 text-slate-700"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {(filterTypes.length + filterRegions.length) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold leading-none">
                {filterTypes.length + filterRegions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="absolute top-16 left-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-900">Filter Graph</span>
              <button
                onClick={() => {
                  setFilterTypes([]);
                  setFilterRegions([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Clear all
              </button>
            </div>
            <div className="mb-4">
              <div className="text-xs font-medium text-slate-500 mb-2">Entity Type</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_TYPES.map((t) => {
                  const cfg = NODE_CONFIG[t];
                  const active = filterTypes.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                      style={{
                        color: active ? cfg.color : "#475569",
                        borderColor: active ? cfg.color : "rgba(148,163,184,0.5)",
                        backgroundColor: active ? "rgba(241,245,249,0.95)" : "transparent",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Region</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_REGIONS.map((r) => {
                  const active = filterRegions.includes(r);
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRegion(r)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        active ? "bg-cyan-100 border-cyan-300 text-cyan-700" : "border-slate-300 text-slate-600"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={containerRef} className="absolute inset-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-sm">Loading graph data...</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => {
              isDraggingRef.current = false;
            }}
            onWheel={onWheel}
          />
        </div>

        <div className="absolute bottom-6 left-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => zoom(1.15)}
            className="w-8 h-8 rounded-lg bg-white/90 border border-slate-200 text-slate-700 flex items-center justify-center"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(0.85)}
            className="w-8 h-8 rounded-lg bg-white/90 border border-slate-200 text-slate-700 flex items-center justify-center"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-lg bg-white/90 border border-slate-200 text-slate-700 flex items-center justify-center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-6 right-4 z-20 bg-white/95 rounded-xl border border-slate-200 p-3">
          <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Legend</div>
          <div className="space-y-1.5">
            {Object.entries(NODE_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: cfg.color }} />
                  <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                  <span className="text-[11px] text-slate-700">{cfg.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Ring layout for executive storytelling
          </div>
        </div>

        {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}

        {!isLoading && hasData === false && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-slate-500">
              <Network className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No nodes match your filters.</p>
              <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-slate-300 text-slate-700"
                onClick={() => {
                  setFilterTypes([]);
                  setFilterRegions([]);
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
