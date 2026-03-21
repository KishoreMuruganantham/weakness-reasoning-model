"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import type { KnowledgeNode, KnowledgeEdge } from "@/types/weakness";
import { masteryToColor } from "@/lib/colorScale";

interface KnowledgeGraphVizProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  onNodeClick: (nodeId: string) => void;
}

const domainColor: Record<string, string> = { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" };

interface TooltipData { x: number; y: number; node: KnowledgeNode }

export function KnowledgeGraphViz({ nodes, edges, onNodeClick }: KnowledgeGraphVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<d3.SimulationNodeDatum & KnowledgeNode, undefined> | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 420 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: 420 });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    type SimNode = d3.SimulationNodeDatum & KnowledgeNode;
    type SimLink = d3.SimulationLinkDatum<SimNode> & { weight: number };

    const simNodes: SimNode[] = nodes.map(n => ({ ...n, x: dims.w / 2 + (Math.random() - 0.5) * 200, y: dims.h / 2 + (Math.random() - 0.5) * 200 }));
    const simLinks: SimLink[] = edges.map(e => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
    }));

    const nodeMap = new Map(simNodes.map(n => [n.id, n]));

    const sim = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(80).strength(d => d.weight * 0.3))
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(dims.w / 2, dims.h / 2))
      .force("collision", d3.forceCollide().radius(d => 14 + (d as SimNode).difficulty * 16 + 6))
      .force("x", d3.forceX(dims.w / 2).strength(0.05))
      .force("y", d3.forceY(dims.h / 2).strength(0.05));

    simRef.current = sim;

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, dims.w, dims.h);

      // Draw edges
      simLinks.forEach(link => {
        const s = typeof link.source === "object" ? link.source as SimNode : nodeMap.get(link.source as string);
        const t = typeof link.target === "object" ? link.target as SimNode : nodeMap.get(link.target as string);
        if (!s?.x || !t?.x || !s?.y || !t?.y) return;

        const targetIsWeak = (typeof link.target === "object" ? (link.target as SimNode) : nodeMap.get(link.target as string))?.isWeak;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (targetIsWeak) {
          ctx.strokeStyle = "rgba(239,68,68,0.12)";
          ctx.lineWidth = link.weight * 2;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = "rgba(161,161,170,0.06)";
          ctx.lineWidth = link.weight * 1.5;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated particle on weak edges
        if (targetIsWeak && frameCount % 3 === 0) {
          const t2 = ((frameCount * 0.008) % 1);
          const px = s.x + (t.x - s.x) * t2;
          const py = s.y + (t.y - s.y) * t2;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239,68,68,0.4)";
          ctx.fill();
        }
      });

      // Draw nodes
      simNodes.forEach(node => {
        if (!node.x || !node.y) return;
        const r = 10 + node.difficulty * 18;
        const color = node.isWeak ? masteryToColor(node.mastery) : domainColor[node.domain] || "#71717a";

        // Outer glow for weak nodes
        if (node.isWeak) {
          const pulse = 0.3 + Math.sin(frameCount * 0.03 + node.difficulty * 10) * 0.15;
          const grad = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 2.5);
          grad.addColorStop(0, `${color}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`);
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.isWeak ? `${color}20` : `${color}15`;
        ctx.fill();
        ctx.strokeStyle = node.isWeak ? `${color}80` : `${color}30`;
        ctx.lineWidth = node.isWeak ? 2 : 1;
        ctx.stroke();

        // Inner mastery ring
        if (node.mastery > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * node.mastery);
          ctx.strokeStyle = `${color}60`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = node.isWeak ? "#fafafa" : "#a1a1aa";
        ctx.font = `${r > 16 ? 9 : 7}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = node.label.length > 10 ? node.label.slice(0, 9) + "…" : node.label;
        ctx.fillText(label, node.x, node.y);
      });
    };

    sim.on("tick", draw);

    // Keep animating for glow effects
    let animFrame: number;
    const animate = () => {
      if (sim.alpha() < 0.01) {
        frameCount++;
        draw();
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);

    // Mouse interaction
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: SimNode | null = null;
      for (const node of simNodes) {
        if (!node.x || !node.y) continue;
        const r = 10 + node.difficulty * 18;
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < r * r) {
          found = node;
          break;
        }
      }

      if (found) {
        canvas.style.cursor = "pointer";
        setTooltip({ x: mx, y: my, node: found });
      } else {
        canvas.style.cursor = "default";
        setTooltip(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of simNodes) {
        if (!node.x || !node.y) continue;
        const r = 10 + node.difficulty * 18;
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < r * r) {
          onNodeClick(node.id);
          break;
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mouseleave", () => setTooltip(null));

    return () => {
      cancelAnimationFrame(animFrame);
      sim.stop();
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("click", handleClick);
    };
  }, [nodes, edges, dims, onNodeClick]);

  useEffect(() => { const cleanup = render(); return () => cleanup?.(); }, [render]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: 420, borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(9,9,11,0.5)", border: "1px solid #18181b" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", pointerEvents: "none",
              left: Math.min(tooltip.x + 14, dims.w - 200), top: Math.max(tooltip.y - 60, 8),
              borderRadius: 10, padding: "10px 14px",
              backgroundColor: "rgba(24,24,27,0.95)",
              border: "1px solid #27272a",
              backdropFilter: "blur(8px)",
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fafafa" }}>{tooltip.node.label}</div>
            <div style={{ fontSize: 10, color: "#71717a", marginTop: 2 }}>{tooltip.node.domain}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: 1 }}>Mastery</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: masteryToColor(tooltip.node.mastery) }}>{(tooltip.node.mastery * 100).toFixed(0)}%</div>
              </div>
              {tooltip.node.isWeak && (
                <div>
                  <div style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: 1 }}>Severity</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: "#ef4444" }}>{(tooltip.node.severityScore * 100).toFixed(0)}%</div>
                </div>
              )}
            </div>
            {tooltip.node.isWeak && (
              <div style={{ marginTop: 6, fontSize: 9, color: "#ef4444", fontWeight: 600 }}>⚠ Weakness detected</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Domain legend */}
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 12, fontSize: 10 }}>
        {Object.entries(domainColor).map(([d, c]) => (
          <span key={d} style={{ display: "flex", alignItems: "center", gap: 4, color: "#52525b" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: c }} />
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
