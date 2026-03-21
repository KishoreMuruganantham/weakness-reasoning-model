"use client";

import { trendToIcon } from "@/lib/colorScale";

interface TrendIndicatorProps {
  velocity: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const colorMap: Record<string, string> = {
  "text-red-500": "#ef4444",
  "text-orange-500": "#f97316",
  "text-emerald-500": "#10b981",
  "text-green-500": "#22c55e",
  "text-yellow-500": "#eab308",
};

export function TrendIndicator({ velocity, showLabel = false, size = "md" }: TrendIndicatorProps) {
  const { symbol, color, label } = trendToIcon(velocity);
  const hexColor = colorMap[color] || "#888";
  const fs = size === "sm" ? 11 : 13;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: hexColor, fontSize: fs }}>
      <span style={{ fontFamily: "monospace" }}>{symbol}</span>
      {showLabel && <span style={{ fontWeight: 400, opacity: 0.8 }}>{label}</span>}
    </span>
  );
}
