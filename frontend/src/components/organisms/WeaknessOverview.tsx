"use client";

import { motion } from "framer-motion";
import { RadialWeaknessChart } from "@/components/molecules/RadialWeaknessChart";
import { TrajectoryGraph } from "@/components/molecules/TrajectoryGraph";
import { MasteryRing } from "@/components/atoms/MasteryRing";
import { SeverityBadge } from "@/components/atoms/SeverityBadge";
import { TrendIndicator } from "@/components/atoms/TrendIndicator";
import { ConceptIcon } from "@/components/atoms/ConceptIcon";
import type { Weakness, TemporalDataPoint, DomainSummary, LearnerProfile } from "@/types/weakness";

interface WeaknessOverviewProps {
  weaknesses: Weakness[];
  temporalData: TemporalDataPoint[];
  domains: DomainSummary[];
  profile: LearnerProfile;
  onSelectWeakness: (w: Weakness) => void;
  selectedId?: string;
}

const C: React.CSSProperties = { borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" as const };
const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: d, ease: [0.4, 0, 0.2, 1] as const } });

export function WeaknessOverview({ weaknesses, temporalData, domains, profile, onSelectWeakness, selectedId }: WeaknessOverviewProps) {
  const critical = weaknesses.filter(w => w.severity_score >= 0.7).length;
  const declining = weaknesses.filter(w => w.mastery_velocity < -0.02).length;
  const improving = weaknesses.filter(w => w.mastery_velocity > 0.02).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats Row */}
      <motion.div {...fade(0)} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(3, 1fr)", gap: 12 }}>
        <div style={{ ...C, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18, background: "linear-gradient(135deg, #0f0f12, rgba(16,185,129,0.04))" }}>
          <MasteryRing mastery={profile.overallMastery} size={64} strokeWidth={5} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>OVERALL MASTERY</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fafafa", lineHeight: 1, fontFamily: "monospace" }}>{(profile.overallMastery * 100).toFixed(0)}%</div>
            <div style={{ fontSize: 10, color: "#52525b", marginTop: 4 }}>{weaknesses.length} weaknesses · {domains.length} domains</div>
          </div>
        </div>
        <Stat value={critical} total={weaknesses.length} label="Critical" color="#ef4444" />
        <Stat value={declining} label="Declining" color="#f59e0b" />
        <Stat value={improving} label="Improving" color="#10b981" />
      </motion.div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <motion.div {...fade(0.08)} style={{ ...C, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px 4px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Severity Distribution</h2>
            <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 2 }}>Click to drill down</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RadialWeaknessChart weaknesses={weaknesses} onSelect={onSelectWeakness} selectedId={selectedId} />
          </div>
        </motion.div>

        <motion.div {...fade(0.12)} style={{ ...C, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px 4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Performance Over Time</h2>
                <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 2 }}>30-day trend with AI prediction</p>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
                {[["Tests", "#a855f7"], ["Practice", "#f59e0b"], ["Engagement", "#10b981"]].map(([l, c]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "#3f3f46" }}>
                    <span style={{ width: 10, height: 2, borderRadius: 1, backgroundColor: c }} />{l}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "8px 8px 12px", minHeight: 300 }}>
            <TrajectoryGraph data={temporalData} />
          </div>
        </motion.div>
      </div>

      {/* Domains + Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        <motion.div {...fade(0.16)} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#3f3f46", textTransform: "uppercase" as const, letterSpacing: 2, padding: "0 2px" }}>Domain Health</span>
          {domains.map((d) => {
            const color = { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" }[d.domain] || "#71717a";
            return (
              <div key={d.domain} style={{ ...C, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <ConceptIcon domain={d.domain} size="md" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{d.domain}</span>
                    <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>{d.weaknessCount} weak</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, backgroundColor: "#18181b", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div style={{ height: "100%", borderRadius: 2, backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${d.avgSeverity * 100}%` }} transition={{ duration: 0.8, delay: 0.4 }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", fontWeight: 700 }}>{(d.avgSeverity * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.div {...fade(0.2)} style={{ ...C, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #18181b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Top Weaknesses</h2>
            <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>{weaknesses.length} total</span>
          </div>
          <div style={{ flex: 1, padding: "4px 6px 10px", overflowY: "auto" as const }}>
            {weaknesses.slice(0, 8).map((w, i) => (
              <motion.button key={w.topic_id} onClick={() => onSelectWeakness(w)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", backgroundColor: "transparent", cursor: "pointer", textAlign: "left" as const, color: "inherit", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.03 }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: i < 3 ? "#ef444415" : "#18181b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: i < 3 ? "#ef4444" : "#3f3f46", fontFamily: "monospace" }}>{i + 1}</span>
                <ConceptIcon domain={w.domain} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{w.topic_name}</div>
                  <div style={{ fontSize: 9, color: "#3f3f46", marginTop: 1 }}>{w.domain}</div>
                </div>
                <TrendIndicator velocity={w.mastery_velocity} size="sm" />
                <MasteryRing mastery={w.p_mastery} size={24} strokeWidth={2.5} />
                <SeverityBadge severity={w.severity_score} size="sm" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ value, total, label, color }: { value: number; total?: number; label: string; color: string }) {
  return (
    <div style={{ ...{ borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" as const }, padding: "16px 18px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, opacity: 0.8, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1, fontFamily: "monospace" }}>{value}</span>
        {total !== undefined && <span style={{ fontSize: 16, fontWeight: 600, color: "#27272a" }}>/{total}</span>}
      </div>
    </div>
  );
}
