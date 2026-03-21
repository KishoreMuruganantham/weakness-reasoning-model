"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExplanationCard } from "@/components/molecules/ExplanationCard";
import { KnowledgeGraphViz } from "@/components/molecules/KnowledgeGraphViz";
import type { Weakness, KnowledgeNode, KnowledgeEdge } from "@/types/weakness";
import { SeverityBadge } from "@/components/atoms/SeverityBadge";
import { ConceptIcon } from "@/components/atoms/ConceptIcon";
import { TrendIndicator } from "@/components/atoms/TrendIndicator";
import { severityToColor } from "@/lib/colorScale";

interface ReasoningPanelProps {
  weaknesses: Weakness[];
  knowledgeNodes: KnowledgeNode[];
  knowledgeEdges: KnowledgeEdge[];
  selectedWeakness: Weakness | null;
  onSelectWeakness: (w: Weakness) => void;
  onNodeClick: (nodeId: string) => void;
}

const C: React.CSSProperties = { borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" as const };
const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: d, ease: [0.4, 0, 0.2, 1] as const } });

export function ReasoningPanel({ weaknesses, knowledgeNodes, knowledgeEdges, selectedWeakness, onSelectWeakness, onNodeClick }: ReasoningPanelProps) {
  const weakCount = knowledgeNodes.filter(n => n.isWeak).length;
  const strongCount = knowledgeNodes.filter(n => !n.isWeak).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Graph + Stats Side by Side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Graph */}
        <motion.div {...fade(0)} style={C}>
          <div style={{ padding: "14px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Knowledge Graph</h2>
              <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 1 }}>Force-directed prerequisite map · Hover for details · Click to analyze</p>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#52525b" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
                Strong ({strongCount})
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#52525b" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                Weak ({weakCount})
              </span>
            </div>
          </div>
          <div style={{ padding: "0 8px 8px" }}>
            <KnowledgeGraphViz nodes={knowledgeNodes} edges={knowledgeEdges} onNodeClick={onNodeClick} />
          </div>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div {...fade(0.05)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Total Nodes", value: knowledgeNodes.length, color: "#a1a1aa" },
            { label: "Weak Nodes", value: weakCount, color: "#ef4444" },
            { label: "Strong Nodes", value: strongCount, color: "#10b981" },
            { label: "Connections", value: knowledgeEdges.length, color: "#a855f7" },
            { label: "Avg Severity", value: `${(weaknesses.reduce((s, w) => s + w.severity_score, 0) / weaknesses.length * 100).toFixed(0)}%`, color: "#f59e0b" },
          ].map((s, i) => (
            <motion.div key={s.label} {...fade(0.05 + i * 0.03)} style={{
              ...C, padding: "12px 16px", flex: 1,
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#3f3f46", letterSpacing: 1.5, textTransform: "uppercase" as const }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "monospace", marginTop: 4 }}>{s.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* List + Detail */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Weakness List */}
        <motion.div {...fade(0.1)} style={{ ...C, display: "flex", flexDirection: "column", maxHeight: 640 }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #18181b" }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>Weaknesses</h3>
            <p style={{ fontSize: 9, color: "#3f3f46", marginTop: 2 }}>Select to view AI reasoning</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto" as const, padding: "4px 6px 8px" }}>
            {weaknesses.map((w) => {
              const isActive = selectedWeakness?.topic_id === w.topic_id;
              const sc = severityToColor(w.severity_score);
              return (
                <button key={w.topic_id} onClick={() => onSelectWeakness(w)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8,
                    border: "none",
                    borderLeft: isActive ? `3px solid ${sc}` : "3px solid transparent",
                    backgroundColor: isActive ? "#18181b" : "transparent",
                    cursor: "pointer", textAlign: "left" as const, color: "inherit",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#141416"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? "#18181b" : "transparent"; }}
                >
                  <ConceptIcon domain={w.domain} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "#fafafa" : "#a1a1aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{w.topic_name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 9, color: "#3f3f46" }}>{w.domain}</span>
                      <TrendIndicator velocity={w.mastery_velocity} size="sm" />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <SeverityBadge severity={w.severity_score} size="sm" showScore={false} />
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "#3f3f46" }}>{(w.p_mastery * 100).toFixed(0)}% mastery</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Detail */}
        <div style={{ minHeight: 560 }}>
          <AnimatePresence mode="wait">
            {selectedWeakness ? (
              <motion.div key={selectedWeakness.topic_id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}>
                <ExplanationCard weakness={selectedWeakness} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...C, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 560 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: "#18181b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>🔬</div>
                <p style={{ color: "#71717a", fontSize: 14, fontWeight: 600 }}>Select a weakness</p>
                <p style={{ color: "#3f3f46", fontSize: 11, marginTop: 4, textAlign: "center" as const, maxWidth: 260, lineHeight: 1.5 }}>
                  Click from the list or the knowledge graph to view evidence, root causes, and AI analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
