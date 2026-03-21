"use client";

import { severityToLabel } from "@/lib/colorScale";

interface SeverityBadgeProps {
  severity: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function SeverityBadge({ severity, size = "md", showScore = true }: SeverityBadgeProps) {
  const label = severityToLabel(severity);
  const color = severity >= 0.8 ? "#ef4444" : severity >= 0.7 ? "#f97316" : severity >= 0.5 ? "#f59e0b" : severity >= 0.3 ? "#eab308" : "#10b981";
  const padding = size === "sm" ? "2px 8px" : size === "lg" ? "5px 14px" : "3px 10px";
  const fontSize = size === "sm" ? 10 : size === "lg" ? 13 : 11;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      borderRadius: 6, padding, fontSize, fontWeight: 600,
      backgroundColor: `${color}15`, color,
      letterSpacing: 0.3,
    }}>
      {severity >= 0.7 && <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: color, animation: "pulse 2s infinite" }} />}
      {label}
      {showScore && <span style={{ opacity: 0.7, fontFamily: "monospace", fontWeight: 700 }}>{(severity * 100).toFixed(0)}</span>}
    </span>
  );
}
