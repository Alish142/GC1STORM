import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ZoomIn, ZoomOut, Maximize2, X, Network,
  Building2, Users, Lightbulb, Layers, BarChart3,
  Globe2, Info, Filter, RefreshCw, Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  label: string;
  type: "Issuer" | "Investor" | "Opportunity" | "Project" | "Market";
  region?: string;
  description?: string;
  value?: number;
  country?: string;
  // Layout
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

// ── Node config ───────────────────────────────────────────────────────────────
const NODE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Issuer:      { color: "#22c55e", bg: "rgba(34,197,94,0.15)",   icon: Building2,  label: "Issuers" },
  Investor:    { color: "#3b82f6", bg: "rgba(59,130,246,0.15)",  icon: Users,      label: "Investors" },
  Opportunity: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  icon: Lightbulb,  label: "Opportunities" },
  Project:     { color: "#a855f7", bg: "rgba(168,85,247,0.15)",  icon: Layers,     label: "Projects" },
  Market:      { color: "#06b6d4", bg: "rgba(6,182,212,0.15)",   icon: BarChart3,  label: "Markets" },
};

const FILTER_TYPES = ["Issuer", "Investor", "Opportunity", "Project", "Market"];
const FILTER_REGIONS = ["Europe", "Asia", "Pacific", "North America", "South America", "Africa", "Middle East", "Global"];

// ── Force-directed layout ─────────────────────────────────────────────────────
function applyForceLayout(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const k = Math.sqrt((width * height) / nodes.length) * 0.8;

  for (let iter = 0; iter < 80; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].vx = 0;
      nodes[i].vy = 0;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (k * k) / dist;
        nodes[i].vx += (dx / dist) * force * 0.8;
        nodes[i].vy += (dy / dist) * force * 0.8;
      }
    }
    // Attraction
    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist * dist) / k;
      const fx = (dx / dist) * force * 0.3;
      const fy = (dy / dist) * force * 0.3;
      src.vx += fx;
      src.vy += fy;
      tgt.vx -= fx;
      tgt.vy -= fy;
    }
    // Gravity to center
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.01;
      n.vy += (cy - n.y) * 0.01;
    }
    // Apply
    const cooling = 1 - iter / 80;
    for (const n of nodes) {
      n.x += n.vx * cooling * 0.5;
      n.y += n.vy * cooling * 0.5;
      n.x = Math.max(60, Math.min(width - 60, n.x));
      n.y = Math.max(60, Math.min(height - 60, n.y));
    }
  }
}

// ── Node Detail Panel ─────────────────────────────────────────────────────────
function NodeDetailPanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const cfg = NODE_CONFIG[node.type];
  const Icon = cfg.icon;

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">{node.label}</div>
            <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{node.type}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {node.description && (
          <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
        )}

        <div className="space-y-2">
          {node.region && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Region</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Globe2 className="w-3 h-3" />
                {node.region}
              </div>
            </div>
          )}
          {node.country && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Country</span>
              <span className="text-xs text-slate-300">{node.country}</span>
            </div>
          )}
          {node.value !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Value</span>
              <span className="text-xs text-slate-300 font-semibold">
                USD {(node.value / 1_000_000).toFixed(0)}M
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <Badge
            className="text-xs font-medium border-0"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {node.type}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ── Main Graph View ───────────────────────────────────────────────────────────
export default function GraphView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const transformRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState("");
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const { data, isLoading, refetch } = trpc.graph.data.useQuery({
    filterTypes: filterTypes.length ? filterTypes : undefined,
    filterRegions: filterRegions.length ? filterRegions : undefined,
    search: search || undefined,
  });

  // Initialize layout when data arrives
  useEffect(() => {
    if (!data || !containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const h = containerRef.current.offsetHeight;

    const nodes: GraphNode[] = data.nodes.map((n) => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: 0,
      vy: 0,
    }));

    applyForceLayout(nodes, data.edges as GraphEdge[], w, h);
    nodesRef.current = nodes;
    edgesRef.current = data.edges as GraphEdge[];
    setIsLayoutReady(true);
  }, [data]);

  // Canvas draw loop
  useEffect(() => {
    if (!isLayoutReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.offsetWidth * window.devicePixelRatio;
      canvas.height = containerRef.current.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    let frame = 0;
    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const { scale, tx, ty } = transformRef.current;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Draw edges
      for (const edge of edges) {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) continue;

        const isHighlighted =
          selectedNode?.id === edge.source || selectedNode?.id === edge.target;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = isHighlighted
          ? "rgba(100,200,160,0.6)"
          : "rgba(100,150,200,0.15)";
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
        ctx.stroke();

        // Edge label on hover
        if (isHighlighted) {
          const mx = (src.x + tgt.x) / 2;
          const my = (src.y + tgt.y) / 2;
          ctx.fillStyle = "rgba(100,200,160,0.8)";
          ctx.font = "9px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(edge.label, mx, my - 4);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const cfg = NODE_CONFIG[node.type];
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNodeRef.current === node.id;
        const isConnected = selectedNode
          ? edges.some(
              (e) =>
                (e.source === selectedNode.id && e.target === node.id) ||
                (e.target === selectedNode.id && e.source === node.id)
            )
          : false;

        const r = isSelected ? 14 : isConnected ? 11 : 8;
        const alpha = selectedNode && !isSelected && !isConnected ? 0.3 : 1;

        ctx.globalAlpha = alpha;

        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r + 12);
        grd.addColorStop(0, cfg.color.replace(")", ", 0.25)").replace("rgb", "rgba"));
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 12, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Ring for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Core circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = cfg.color;
        ctx.fill();

        // Label
        ctx.fillStyle = isSelected || isHovered ? "rgba(255,255,255,0.95)" : "rgba(200,220,240,0.75)";
        ctx.font = `${isSelected ? "bold " : ""}10px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + r + 14);

        ctx.globalAlpha = 1;
      }

      ctx.restore();
      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [isLayoutReady, selectedNode]);

  // Mouse interactions
  const getNodeAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { scale, tx, ty } = transformRef.current;
    const x = (clientX - rect.left - tx) / scale;
    const y = (clientY - rect.top - ty) / scale;

    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 18) return node;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      dragNodeRef.current = node;
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - transformRef.current.tx, y: e.clientY - transformRef.current.ty };
    }
  }, [getNodeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    hoveredNodeRef.current = node?.id ?? null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = node ? "pointer" : isDraggingRef.current ? "grabbing" : "grab";
    }

    if (dragNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { scale, tx, ty } = transformRef.current;
      dragNodeRef.current.x = (e.clientX - rect.left - tx) / scale;
      dragNodeRef.current.y = (e.clientY - rect.top - ty) / scale;
    } else if (isDraggingRef.current) {
      transformRef.current.tx = e.clientX - dragStartRef.current.x;
      transformRef.current.ty = e.clientY - dragStartRef.current.y;
    }
  }, [getNodeAt]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragNodeRef.current) {
      dragNodeRef.current = null;
    } else if (!isDraggingRef.current) {
      const node = getNodeAt(e.clientX, e.clientY);
      setSelectedNode(node ? (node.id === selectedNode?.id ? null : node) : null);
    }
    isDraggingRef.current = false;
  }, [getNodeAt, selectedNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.3, Math.min(3, transformRef.current.scale * factor));
    transformRef.current.scale = newScale;
  }, []);

  const zoom = (factor: number) => {
    transformRef.current.scale = Math.max(0.3, Math.min(3, transformRef.current.scale * factor));
  };

  const resetView = () => {
    transformRef.current = { scale: 1, tx: 0, ty: 0 };
  };

  const toggleType = (t: string) =>
    setFilterTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleRegion = (r: string) =>
    setFilterRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <div className="flex-1 flex flex-col bg-slate-900 relative overflow-hidden">
        {/* Top toolbar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-md rounded-xl px-4 py-2.5 border border-slate-700/50">
            <Network className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">Relationship Graph</span>
            {data && (
              <span className="text-xs text-slate-400 ml-1">
                {data.nodes.length} nodes · {data.edges.length} edges
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-slate-800/90 border-slate-700/50 text-white placeholder:text-slate-500 text-sm backdrop-blur-md focus-visible:ring-green-500/30"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
              showFilters || filterTypes.length || filterRegions.length
                ? "bg-green-500/20 border-green-500/40 text-green-400"
                : "bg-slate-800/90 border-slate-700/50 text-slate-300 hover:text-white"
            } backdrop-blur-md`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {(filterTypes.length + filterRegions.length) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold leading-none">
                {filterTypes.length + filterRegions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/50 text-slate-400 hover:text-white transition-colors backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="absolute top-16 left-4 z-20 w-72 bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Filter Graph</span>
              <button onClick={() => { setFilterTypes([]); setFilterRegions([]); }} className="text-xs text-slate-400 hover:text-white">Clear all</button>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-slate-400 mb-2">Entity Type</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_TYPES.map((t) => {
                  const cfg = NODE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
                      style={{
                        backgroundColor: filterTypes.includes(t) ? cfg.bg : "transparent",
                        borderColor: filterTypes.includes(t) ? cfg.color : "rgba(100,116,139,0.4)",
                        color: filterTypes.includes(t) ? cfg.color : "rgba(148,163,184,1)",
                      }}
                    >
                      <cfg.icon className="w-3 h-3" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-400 mb-2">Region</div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleRegion(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                      filterRegions.includes(r)
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                        : "border-slate-600/50 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-green-400" />
                <span className="text-sm">Loading graph data...</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: "transparent" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { isDraggingRef.current = false; dragNodeRef.current = null; }}
            onWheel={handleWheel}
          />

          {/* Background grid */}
          <div className="absolute inset-0 pointer-events-none opacity-5" style={{
            backgroundImage: "linear-gradient(rgba(100,200,160,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,160,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-6 left-4 flex flex-col gap-1.5 z-20">
          <button onClick={() => zoom(1.2)} className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => zoom(0.8)} className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-20 bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Legend</div>
          <div className="space-y-1.5">
            {Object.entries(NODE_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                  <span className="text-[11px] text-slate-300">{cfg.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500">
            Click to select · Drag to pan · Scroll to zoom
          </div>
        </div>

        {/* Node detail panel */}
        {selectedNode && (
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}

        {/* Empty state */}
        {!isLoading && data?.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-slate-400">
              <Network className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No nodes match your filters.</p>
              <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => { setFilterTypes([]); setFilterRegions([]); setSearch(""); }}
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
