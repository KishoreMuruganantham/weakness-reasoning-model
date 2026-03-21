"use client";

interface ConceptIconProps {
  domain: string;
  size?: "sm" | "md" | "lg";
}

const config: Record<string, { icon: string; color: string }> = {
  Mathematics: { icon: "∑", color: "#a855f7" },
  Physics: { icon: "⚛", color: "#f59e0b" },
  Programming: { icon: "⟨/⟩", color: "#10b981" },
};

export function ConceptIcon({ domain, size = "md" }: ConceptIconProps) {
  const c = config[domain] || { icon: "?", color: "#71717a" };
  const s = size === "sm" ? 24 : size === "lg" ? 40 : 30;
  const fs = size === "sm" ? 10 : size === "lg" ? 17 : 13;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: s, height: s, borderRadius: s > 30 ? 10 : 7,
      backgroundColor: `${c.color}12`,
      color: c.color,
      fontWeight: 800, fontSize: fs, flexShrink: 0,
    }}>
      {c.icon}
    </span>
  );
}
