import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
  type: "issuer" | "investor" | "opportunity" | "market";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

const NODE_COLORS = {
  issuer: "rgba(80, 200, 140, 0.9)",
  investor: "rgba(80, 140, 220, 0.9)",
  opportunity: "rgba(220, 180, 60, 0.9)",
  market: "rgba(160, 100, 220, 0.9)",
};

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const types: Node["type"][] = ["issuer", "investor", "opportunity", "market"];
    const nodeCount = 22;
    nodesRef.current = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 3 + Math.random() * 4,
      color: NODE_COLORS[types[i % types.length]],
      pulsePhase: Math.random() * Math.PI * 2,
      type: types[i % types.length],
    }));

    const spawnParticle = () => {
      const nodes = nodesRef.current;
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      particlesRef.current.push({
        x: nodes[from].x,
        y: nodes[from].y,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 80 + Math.random() * 60,
        fromNode: from,
        toNode: to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.006,
      });
    };

    let frameCount = 0;
    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const particles = particlesRef.current;

      // Update nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulsePhase += 0.025;
      });

      // Draw edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(100, 200, 160, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles along edges
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        p.x = from.x + (to.x - from.x) * p.progress;
        p.y = from.y + (to.y - from.y) * p.progress;

        const alpha = Math.sin(p.progress * Math.PI) * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 230, 190, ${alpha})`;
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((n) => {
        const pulse = Math.sin(n.pulsePhase) * 1.5;
        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius + 8 + pulse);
        grd.addColorStop(0, n.color.replace("0.9", "0.25"));
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 8 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + pulse * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      // Spawn particles periodically
      if (frameCount % 12 === 0 && particles.length < 30) spawnParticle();
      frameCount++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.65 }}
    />
  );
}
