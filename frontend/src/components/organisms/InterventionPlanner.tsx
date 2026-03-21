"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { ConceptIcon } from "@/components/atoms/ConceptIcon";
import { MasteryRing } from "@/components/atoms/MasteryRing";
import type { InterventionStep } from "@/types/weakness";

interface InterventionPlannerProps {
  steps: InterventionStep[];
}

const C: React.CSSProperties = { borderRadius: 12, border: "1px solid #18181b", backgroundColor: "#0f0f12", overflow: "hidden" as const };
const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: d, ease: [0.4, 0, 0.2, 1] as const } });

const DC: Record<string, string> = { Mathematics: "#a855f7", Physics: "#f59e0b", Programming: "#10b981" };

export function InterventionPlanner({ steps: initialSteps }: InterventionPlannerProps) {
  const [steps] = useState(initialSteps);
  const [studyHours, setStudyHours] = useState(10);

  const projections = useMemo(() => {
    const mw = studyHours * 60;
    let acc = 0;
    return steps.map((s) => {
      acc += s.estimatedMinutes;
      return { ...s, weeksNeeded: Math.ceil(acc / mw), projectedMastery: Math.min(s.masteryTarget, s.currentMastery + 0.12 * (mw / s.estimatedMinutes) * 0.5), totalWeeks: Math.ceil(acc / mw) };
    });
  }, [steps, studyHours]);

  const totalWeeks = projections.length > 0 ? projections[projections.length - 1].totalWeeks : 0;
  const totalMin = steps.reduce((s, x) => s + x.estimatedMinutes, 0);
  const avgCurrent = steps.reduce((s, x) => s + x.currentMastery, 0) / steps.length;
  const avgProjected = projections.reduce((s, p) => s + p.projectedMastery, 0) / projections.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Simulator */}
      <motion.div {...fade(0)} style={{ ...C, background: "linear-gradient(135deg, #0f0f12, rgba(16,185,129,0.03), rgba(168,85,247,0.02))" }}>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #10b981, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fafafa" }}>Study Simulator</h2>
              <p style={{ fontSize: 11, color: "#52525b" }}>Adjust weekly hours to project your mastery growth</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Left: Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 10, color: "#52525b", fontWeight: 600, display: "block", marginBottom: 4 }}>Hours per week</span>
                  <span style={{ fontSize: 52, fontWeight: 900, fontFamily: "monospace", color: "#fafafa", lineHeight: 1 }}>{studyHours}<span style={{ fontSize: 20, color: "#52525b" }}>h</span></span>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: 9, color: "#3f3f46", marginBottom: 2 }}>Projected mastery</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#3f3f46", fontFamily: "monospace", textDecoration: "line-through" }}>{(avgCurrent * 100).toFixed(0)}%</span>
                    <span style={{ fontSize: 9, color: "#3f3f46" }}>→</span>
                    <span style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace", color: "#10b981" }}>{(avgProjected * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <Slider value={[studyHours]} onValueChange={(v) => setStudyHours(Array.isArray(v) ? v[0] : v)} min={2} max={30} step={1} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 9, color: "#27272a" }}>2h casual</span>
                <span style={{ fontSize: 9, color: "#27272a" }}>15h balanced</span>
                <span style={{ fontSize: 9, color: "#27272a" }}>30h intensive</span>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { l: "Total Study", v: `${Math.round(totalMin / 60)}h`, c: "#a1a1aa" },
                { l: "Duration", v: `${totalWeeks}wk`, c: "#a855f7" },
                { l: "Topics", v: String(steps.length), c: "#f59e0b" },
                { l: "Mastery Gain", v: `+${((avgProjected - avgCurrent) * 100).toFixed(0)}%`, c: "#10b981" },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ borderRadius: 10, backgroundColor: "#18181b", padding: "12px 14px" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#3f3f46", letterSpacing: 1.5, textTransform: "uppercase" as const }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: c, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div {...fade(0.05)} style={{ ...C, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a" }}>Timeline</span>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46" }}>{totalWeeks} weeks</span>
        </div>
        <div style={{ display: "flex", gap: 2, height: 24, borderRadius: 6, overflow: "hidden" }}>
          {projections.map((step, i) => {
            const color = DC[step.domain] || "#71717a";
            return (
              <motion.div key={step.id}
                style={{ height: "100%", backgroundColor: color, opacity: 0.5, flex: step.estimatedMinutes / totalMin, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.04 }}
              >
                {(step.estimatedMinutes / totalMin) > 0.08 && <span style={{ fontSize: 7, fontWeight: 800, color: "#fafafa", opacity: 0.8 }}>{step.topic_name.split(" ")[0]}</span>}
              </motion.div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
          {Object.entries(DC).map(([d, c]) => (
            <span key={d} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3f3f46" }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: c, opacity: 0.5 }} />{d}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Study Steps */}
      <motion.div {...fade(0.1)} style={C}>
        <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #18181b" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>Study Sequence</h2>
          <p style={{ fontSize: 10, color: "#3f3f46", marginTop: 2 }}>Dependency-ordered · Foundational topics first</p>
        </div>
        <div style={{ padding: "8px 12px 16px" }}>
          {projections.map((step, i) => {
            const progress = step.projectedMastery / step.masteryTarget;
            const color = DC[step.domain] || "#71717a";
            return (
              <motion.div key={step.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10,
                    transition: "background 0.12s", marginBottom: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#18181b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {/* Number */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: i < 2 ? `${color}15` : "#18181b",
                    border: i < 2 ? `1px solid ${color}25` : "1px solid #27272a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 900, color: i < 2 ? color : "#3f3f46", fontFamily: "monospace",
                  }}>{i + 1}</div>

                  <ConceptIcon domain={step.domain} size="md" />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>{step.topic_name}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, backgroundColor: `${color}12`, color, fontWeight: 600 }}>{step.domain}</span>
                      {i < 2 && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, backgroundColor: "#10b98118", color: "#10b981", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" as const }}>Start</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, backgroundColor: "#18181b", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div style={{ height: "100%", borderRadius: 2, backgroundColor: color, opacity: 0.7 }} initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", minWidth: 80, textAlign: "right" as const }}>
                        {(step.currentMastery * 100).toFixed(0)}% → <span style={{ color: "#10b981", fontWeight: 700 }}>{(step.projectedMastery * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                    {step.dependencies.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 8, color: "#27272a" }}>needs:</span>
                        {step.dependencies.map(dep => (
                          <span key={dep} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, backgroundColor: "#18181b", color: "#52525b" }}>{dep}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mastery comparison */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MasteryRing mastery={step.currentMastery} size={28} strokeWidth={2.5} />
                    <span style={{ color: "#27272a", fontSize: 10 }}>→</span>
                    <MasteryRing mastery={step.projectedMastery} size={28} strokeWidth={2.5} />
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: "right" as const, minWidth: 48 }}>
                    <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#71717a" }}>{step.estimatedMinutes}m</div>
                    <div style={{ fontSize: 8, color: "#3f3f46" }}>~{step.weeksNeeded}wk</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
