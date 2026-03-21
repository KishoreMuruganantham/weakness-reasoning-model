"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Weakness } from "@/types/weakness";
import { SeverityBadge } from "@/components/atoms/SeverityBadge";
import { TrendIndicator } from "@/components/atoms/TrendIndicator";
import { ConceptIcon } from "@/components/atoms/ConceptIcon";
import { MasteryRing } from "@/components/atoms/MasteryRing";
import { severityToColor } from "@/lib/colorScale";

interface ExplanationCardProps {
  weakness: Weakness;
}

export function ExplanationCard({ weakness: w }: ExplanationCardProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsStreaming(true);
    let i = 0;
    const text = w.reasoning;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayedText(text.slice(0, i + 1)); i++; }
      else { setIsStreaming(false); clearInterval(interval); }
    }, 4);
    return () => clearInterval(interval);
  }, [w.reasoning]);

  const sc = severityToColor(w.severity_score);

  return (
    <div style={{ borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${sc}, transparent)` }} />

      {/* Header */}
      <div style={{ padding: "18px 22px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ConceptIcon domain={w.domain} size="lg" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fafafa" }}>{w.topic_name}</h3>
              <p style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>{w.domain} · Rank #{w.rank} · {w.weakness_type.replace(/_/g, " ")}</p>
            </div>
          </div>
          <SeverityBadge severity={w.severity_score} size="lg" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 16 }}>
          <MiniStat label="Mastery"><MasteryRing mastery={w.p_mastery} size={40} strokeWidth={3.5} /></MiniStat>
          <MiniStat label="Confidence"><span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: "#e4e4e7" }}>{(w.confidence * 100).toFixed(0)}%</span></MiniStat>
          <MiniStat label="Trend"><TrendIndicator velocity={w.mastery_velocity} showLabel size="md" /></MiniStat>
          <MiniStat label="Impact"><span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: w.downstream_impact.length > 5 ? "#ef4444" : "#e4e4e7" }}>{w.downstream_impact.length}</span></MiniStat>
        </div>
      </div>

      <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Evidence */}
        <section>
          <Label>Evidence</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {w.evidence.map((e, i) => {
              const bad = Math.abs(e.value) > e.threshold || (e.value < 0 && e.value < e.threshold);
              return (
                <motion.div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6, backgroundColor: bad ? "#ef444408" : "transparent" }}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: bad ? "#ef4444" : "#10b981", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 11, color: "#71717a" }}>{e.signal}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: bad ? "#ef4444" : "#52525b" }}>
                    {Math.abs(e.value) < 1 ? (e.value * 100).toFixed(1) + "%" : e.value.toFixed(3)}
                  </span>
                  <div style={{ width: 48, height: 3, backgroundColor: "#18181b", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div style={{ height: "100%", borderRadius: 2, backgroundColor: bad ? "#ef4444" : "#10b981", opacity: 0.6 }}
                      initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.abs(e.value) * 100)}%` }} transition={{ duration: 0.5, delay: i * 0.03 + 0.2 }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Root Causes */}
        {w.root_causes.length > 0 && (
          <section>
            <Label>Root Cause Chain</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
              {w.root_causes.map((rc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {i > 0 && <span style={{ color: "#27272a", fontSize: 12 }}>→</span>}
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, backgroundColor: "#ef444410", color: "#ef4444", fontWeight: 600 }}>{rc}</span>
                </div>
              ))}
              <span style={{ color: "#27272a", fontSize: 12 }}>→</span>
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, backgroundColor: "#f59e0b10", color: "#f59e0b", fontWeight: 700 }}>{w.topic_name}</span>
            </div>
          </section>
        )}

        {/* Downstream */}
        {w.downstream_impact.length > 0 && (
          <section>
            <Label>Downstream Impact ({w.downstream_impact.length})</Label>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {w.downstream_impact.map((d, i) => (
                <span key={i} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, backgroundColor: "#18181b", color: "#52525b", fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          </section>
        )}

        {/* AI Reasoning */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 20, height: 20, borderRadius: 5, background: "linear-gradient(135deg, #10b981, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff" }}>AI</span>
            <Label style={{ marginBottom: 0 }}>Reasoning</Label>
            {isStreaming && <span style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#10b981", animation: "pulse 1.5s infinite" }} />analyzing</span>}
          </div>
          <div style={{
            borderRadius: 10, backgroundColor: "#09090b", border: "1px solid #18181b",
            padding: 16, fontFamily: "monospace", fontSize: 11, color: "#71717a",
            lineHeight: 1.8, whiteSpace: "pre-wrap" as const, minHeight: 70,
          }}>
            {displayedText}
            {isStreaming && <span style={{ color: "#10b981", fontWeight: 900 }}>▊</span>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h4 style={{ fontSize: 9, fontWeight: 700, color: "#3f3f46", textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 8, ...style }}>{children}</h4>;
}

function MiniStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 10, backgroundColor: "#18181b" }}>
      <span style={{ fontSize: 8, color: "#3f3f46", textTransform: "uppercase" as const, letterSpacing: 1.5, fontWeight: 700 }}>{label}</span>
      {children}
    </div>
  );
}
