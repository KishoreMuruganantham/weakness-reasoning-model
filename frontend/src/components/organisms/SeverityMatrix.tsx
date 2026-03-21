"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SeverityBadge } from "@/components/atoms/SeverityBadge";
import { TrendIndicator } from "@/components/atoms/TrendIndicator";
import { ConceptIcon } from "@/components/atoms/ConceptIcon";
import { MasteryRing } from "@/components/atoms/MasteryRing";
import type { Weakness } from "@/types/weakness";
import { severityToColor } from "@/lib/colorScale";

interface SeverityMatrixProps {
  weaknesses: Weakness[];
  onSelectWeakness: (w: Weakness) => void;
}

type SortKey = "severity_score" | "p_mastery" | "mastery_velocity" | "downstream_impact" | "confidence";

const C: React.CSSProperties = { borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" as const };
const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: d, ease: [0.4, 0, 0.2, 1] as const } });

export function SeverityMatrix({ weaknesses, onSelectWeakness }: SeverityMatrixProps) {
  const [sortKey, setSortKey] = useState<SortKey>("severity_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => [...weaknesses].sort((a, b) => {
    const av = sortKey === "downstream_impact" ? a.downstream_impact.length : a[sortKey];
    const bv = sortKey === "downstream_impact" ? b.downstream_impact.length : b[sortKey];
    return sortDir === "desc" ? bv - av : av - bv;
  }), [weaknesses, sortKey, sortDir]);

  const toggle = (k: SortKey) => { if (sortKey === k) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortKey(k); setSortDir("desc"); } };

  const maxImpact = Math.max(...weaknesses.map(w => w.downstream_impact.length));
  const domainGroups = useMemo(() => {
    const g: Record<string, Weakness[]> = {};
    weaknesses.forEach(w => (g[w.domain] ||= []).push(w));
    return Object.entries(g);
  }, [weaknesses]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Bubble Map */}
      <motion.div {...fade(0)} style={C}>
        <div style={{ padding: "16px 20px 12px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Impact Map</h2>
          <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 2 }}>Bubble size = downstream impact · Color = domain · Ring = severity</p>
        </div>
        <div style={{ padding: "0 16px 20px" }}>
          {domainGroups.map(([domain, items]) => {
            const dc = { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" }[domain] || "#71717a";
            return (
              <div key={domain} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 3, borderRadius: 2, backgroundColor: dc }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: 1 }}>{domain}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, alignItems: "center" }}>
                  {items.sort((a, b) => b.downstream_impact.length - a.downstream_impact.length).map((w) => {
                    const impactRatio = w.downstream_impact.length / Math.max(maxImpact, 1);
                    const size = 56 + impactRatio * 48;
                    const sevColor = severityToColor(w.severity_score);
                    return (
                      <motion.button key={w.topic_id} onClick={() => onSelectWeakness(w)}
                        whileHover={{ scale: 1.08 }}
                        style={{
                          width: size, height: size, borderRadius: "50%",
                          border: `2px solid ${sevColor}40`,
                          backgroundColor: `${dc}10`,
                          cursor: "pointer", color: "inherit",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          padding: 4, transition: "box-shadow 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${dc}20`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <span style={{ fontSize: size > 80 ? 10 : 8, fontWeight: 700, color: "#e4e4e7", textAlign: "center" as const, lineHeight: 1.1 }}>
                          {w.topic_name.length > 12 ? w.topic_name.slice(0, 11) + "…" : w.topic_name}
                        </span>
                        <span style={{ fontSize: 8, fontFamily: "monospace", color: sevColor, fontWeight: 800, marginTop: 2 }}>{(w.severity_score * 100).toFixed(0)}%</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div {...fade(0.1)} style={C}>
        <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #18181b" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Severity Matrix</h2>
          <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 2 }}>Click headers to sort · Click rows to analyze</p>
        </div>
        <div style={{ overflowX: "auto" as const }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #18181b" }}>
                <Th>#</Th><Th>Topic</Th>
                {([["severity_score", "Severity"], ["p_mastery", "Mastery"], ["mastery_velocity", "Trend"], ["downstream_impact", "Impact"], ["confidence", "Conf."]] as [SortKey, string][]).map(([k, l]) => (
                  <Th key={k} onClick={() => toggle(k)} style={{ cursor: "pointer", color: sortKey === k ? "#10b981" : "#3f3f46" }}>
                    {l} {sortKey === k && (sortDir === "desc" ? "↓" : "↑")}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((w, i) => (
                <motion.tr key={w.topic_id} onClick={() => onSelectWeakness(w)}
                  style={{ borderBottom: "1px solid #18181b08", cursor: "pointer", transition: "background 0.15s" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#18181b"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <Td><span style={{ fontFamily: "monospace", color: i < 3 ? "#ef4444" : "#3f3f46", fontWeight: 800, fontSize: 11 }}>{i + 1}</span></Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ConceptIcon domain={w.domain} size="sm" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7" }}>{w.topic_name}</div>
                        <div style={{ fontSize: 9, color: "#3f3f46" }}>{w.weakness_type.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><SeverityBadge severity={w.severity_score} size="sm" /></Td>
                  <Td><MasteryRing mastery={w.p_mastery} size={26} strokeWidth={2.5} /></Td>
                  <Td><TrendIndicator velocity={w.mastery_velocity} showLabel size="sm" /></Td>
                  <Td><span style={{ fontFamily: "monospace", fontWeight: 700, color: w.downstream_impact.length > 5 ? "#ef4444" : "#71717a", fontSize: 12 }}>{w.downstream_impact.length}</span></Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 48, height: 3, backgroundColor: "#18181b", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, backgroundColor: "#10b981", width: `${w.confidence * 100}%`, opacity: 0.6 }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b" }}>{(w.confidence * 100).toFixed(0)}</span>
                    </div>
                  </Td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function Th({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return <th onClick={onClick} style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#3f3f46", textTransform: "uppercase" as const, letterSpacing: 1, textAlign: "left" as const, transition: "color 0.15s", ...style }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 14px" }}>{children}</td>;
}
