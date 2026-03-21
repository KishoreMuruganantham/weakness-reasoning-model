"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import type { Weakness } from "@/types/weakness";

interface RadialWeaknessChartProps {
  weaknesses: Weakness[];
  onSelect: (w: Weakness) => void;
  selectedId?: string;
}

function getSeverityColor(s: number): string {
  if (s >= 0.8) return "#ef4444";
  if (s >= 0.7) return "#f97316";
  if (s >= 0.5) return "#f59e0b";
  if (s >= 0.3) return "#eab308";
  return "#22c55e";
}

function getDomainColor(domain: string): string {
  return { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" }[domain] || "#9ca3af";
}

export function RadialWeaknessChart({ weaknesses, onSelect, selectedId }: RadialWeaknessChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; w: Weakness } | null>(null);
  const [size, setSize] = useState(400);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth, 480);
        setSize(Math.max(280, w));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const render = useCallback(() => {
    if (!svgRef.current || !weaknesses.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = size / 2, cy = size / 2;
    const outerR = Math.min(cx, cy) - 50;
    const innerR = outerR * 0.3;
    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

    // Background circles
    [0.25, 0.5, 0.75, 1].forEach((r) => {
      g.append("circle")
        .attr("r", innerR + (outerR - innerR) * r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.03)")
        .attr("stroke-width", 1);
    });

    const angleScale = d3.scaleBand<number>()
      .domain(weaknesses.map((_, i) => i))
      .range([0, 2 * Math.PI])
      .padding(0.08);

    const radiusScale = d3.scaleLinear().domain([0, 1]).range([innerR, outerR]);

    const arc = d3.arc<unknown, { startAngle: number; endAngle: number; innerRadius: number; outerRadius: number }>();

    // Create glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filter.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).join("feMergeNode").attr("in", (d) => d);

    weaknesses.forEach((w, i) => {
      const start = angleScale(i)!;
      const end = start + angleScale.bandwidth();
      const barR = radiusScale(w.severity_score);
      const isSelected = w.topic_id === selectedId;
      const color = getSeverityColor(w.severity_score);
      const domColor = getDomainColor(w.domain);

      // Gradient
      const gradId = `bar-grad-${i}`;
      const grad = defs.append("linearGradient").attr("id", gradId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "-" + outerR);
      grad.append("stop").attr("offset", "0%").attr("stop-color", domColor).attr("stop-opacity", 0.5);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 1);

      // Glow bar (behind)
      if (w.severity_score >= 0.7) {
        g.append("path")
          .attr("d", arc({ startAngle: start, endAngle: end, innerRadius: innerR, outerRadius: barR }))
          .attr("fill", color)
          .attr("opacity", 0.15)
          .attr("filter", "url(#glow)");
      }

      // Main bar
      const path = g.append("path")
        .attr("d", arc({ startAngle: start, endAngle: end, innerRadius: innerR, outerRadius: innerR }))
        .attr("fill", `url(#${gradId})`)
        .attr("stroke", isSelected ? "#fff" : "rgba(255,255,255,0.08)")
        .attr("stroke-width", isSelected ? 2 : 0.5)
        .attr("cursor", "pointer")
        .attr("opacity", 0.9);

      // Animate bars growing
      path.transition()
        .duration(800)
        .delay(i * 40)
        .ease(d3.easeCubicOut)
        .attrTween("d", () => {
          const interp = d3.interpolateNumber(innerR, barR);
          return (t) => arc({ startAngle: start, endAngle: end, innerRadius: innerR, outerRadius: interp(t) }) || "";
        });

      // Interactions
      path.on("mouseenter", function(event) {
        d3.select(this).attr("opacity", 1).attr("stroke", "#fff").attr("stroke-width", 2);
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltip({ x: mx, y: my, w });
      })
      .on("mouseleave", function() {
        d3.select(this).attr("opacity", 0.9).attr("stroke", isSelected ? "#fff" : "rgba(255,255,255,0.08)").attr("stroke-width", isSelected ? 2 : 0.5);
        setTooltip(null);
      })
      .on("click", () => onSelect(w));

      // Label
      const midAngle = start + angleScale.bandwidth() / 2;
      const labelR = barR + 16;
      const lx = Math.sin(midAngle) * labelR;
      const ly = -Math.cos(midAngle) * labelR;
      const rot = (midAngle * 180) / Math.PI;
      const flip = rot > 90 && rot < 270;

      g.append("text")
        .attr("x", lx).attr("y", ly)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "rgba(255,255,255,0.45)")
        .attr("font-size", size > 380 ? "9" : "7")
        .attr("font-weight", "600")
        .attr("font-family", "system-ui")
        .attr("transform", `rotate(${flip ? rot + 180 : rot}, ${lx}, ${ly})`)
        .text(w.topic_name.length > 14 ? w.topic_name.slice(0, 13) + "…" : w.topic_name)
        .attr("opacity", 0)
        .transition().duration(400).delay(i * 40 + 600).attr("opacity", 1);
    });

    // Center content
    g.append("circle").attr("r", innerR - 4).attr("fill", "rgba(9,9,11,0.85)");

    g.append("text").attr("text-anchor", "middle").attr("y", -6)
      .attr("fill", "#fff").attr("font-size", "22").attr("font-weight", "900")
      .attr("font-family", "system-ui")
      .text(`${weaknesses.length}`);
    g.append("text").attr("text-anchor", "middle").attr("y", 14)
      .attr("fill", "rgba(255,255,255,0.25)").attr("font-size", "9")
      .attr("font-weight", "700").attr("letter-spacing", "2")
      .attr("font-family", "system-ui")
      .text("WEAKNESSES");
  }, [weaknesses, selectedId, onSelect, size]);

  useEffect(() => { render(); }, [render]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg ref={svgRef} width={size} height={size} style={{ margin: "0 auto" }} role="img" aria-label="Radial weakness severity chart" />
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", zIndex: 50, pointerEvents: "none",
              borderRadius: 8, padding: 12, backgroundColor: "#18181b",
              border: "1px solid #27272a", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              left: Math.min(tooltip.x + 12, size - 180), top: tooltip.y - 10,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tooltip.w.topic_name}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{tooltip.w.domain}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Severity</p>
                <p style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: getSeverityColor(tooltip.w.severity_score) }}>
                  {(tooltip.w.severity_score * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Mastery</p>
                <p style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
                  {(tooltip.w.p_mastery * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Impact</p>
                <p style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
                  {tooltip.w.downstream_impact.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
