"use client";

import { masteryToColor } from "@/lib/colorScale";

interface MasteryRingProps {
  mastery: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function MasteryRing({ mastery, size = 48, strokeWidth = 4, showLabel = true }: MasteryRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - mastery);
  const color = masteryToColor(mastery);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      {showLabel && (
        <span style={{
          position: "absolute", fontSize: size < 36 ? 8 : 10,
          fontWeight: 700, fontFamily: "monospace", color: "#a1a1aa",
        }}>
          {(mastery * 100).toFixed(0)}
        </span>
      )}
    </div>
  );
}
