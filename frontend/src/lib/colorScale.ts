export function severityToColor(severity: number): string {
  if (severity >= 0.8) return "#ef4444";
  if (severity >= 0.7) return "#f97316";
  if (severity >= 0.5) return "#f59e0b";
  if (severity >= 0.3) return "#eab308";
  return "#10b981";
}

export function severityToLabel(severity: number): string {
  if (severity >= 0.8) return "Critical";
  if (severity >= 0.7) return "High";
  if (severity >= 0.5) return "Moderate";
  if (severity >= 0.3) return "Low";
  return "Healthy";
}

export function masteryToColor(mastery: number): string {
  if (mastery >= 0.8) return "#10b981";
  if (mastery >= 0.6) return "#22c55e";
  if (mastery >= 0.4) return "#f59e0b";
  if (mastery >= 0.2) return "#f97316";
  return "#ef4444";
}

export function domainToColor(domain: string): string {
  return { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" }[domain] || "#71717a";
}

export function domainToBg(domain: string): string {
  return { Mathematics: "bg-purple-500/10 text-purple-400", Physics: "bg-amber-500/10 text-amber-400", Programming: "bg-emerald-500/10 text-emerald-400" }[domain] || "bg-zinc-500/10 text-zinc-400";
}

export function trendToIcon(velocity: number): { symbol: string; color: string; label: string } {
  if (velocity < -0.05) return { symbol: "↓↓", color: "text-red-500", label: "Rapid Decline" };
  if (velocity < -0.02) return { symbol: "↓", color: "text-orange-500", label: "Declining" };
  if (velocity > 0.05) return { symbol: "↑↑", color: "text-emerald-500", label: "Rapid Growth" };
  if (velocity > 0.02) return { symbol: "↑", color: "text-green-500", label: "Improving" };
  return { symbol: "→", color: "text-yellow-500", label: "Stagnant" };
}
