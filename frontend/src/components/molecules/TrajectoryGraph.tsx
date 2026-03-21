"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { TemporalDataPoint } from "@/types/weakness";

interface TrajectoryGraphProps {
  data: TemporalDataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div style={{ borderRadius: 8, padding: 10, backgroundColor: "#18181b", border: "1px solid #27272a" }}>
      <p style={{ fontSize: 10, color: "#52525b", fontFamily: "monospace", marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: entry.color }} />
          <span style={{ flex: 1, color: "#71717a" }}>{entry.name}</span>
          <span style={{ color: "#fafafa", fontFamily: "monospace", fontWeight: 700 }}>{(entry.value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export function TrajectoryGraph({ data }: TrajectoryGraphProps) {
  const predictedStart = data.findIndex((d) => d.predicted);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="testGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="practiceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
          <XAxis dataKey="date" tick={{ fill: "#3f3f46", fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} axisLine={{ stroke: "#18181b" }} interval={4} />
          <YAxis tick={{ fill: "#3f3f46", fontSize: 10 }} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} axisLine={{ stroke: "#18181b" }} domain={[0, 1]} />
          <Tooltip content={<CustomTooltip />} />
          {predictedStart > 0 && (
            <ReferenceLine x={data[predictedStart]?.date} stroke="#27272a" strokeDasharray="6 3" label={{ value: "AI Prediction →", fill: "#3f3f46", fontSize: 10, position: "insideTopRight" }} />
          )}
          <Area type="monotone" dataKey="test_accuracy" name="Test Accuracy" stroke="#a855f7" fill="url(#testGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#a855f7", stroke: "#09090b", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="practice_accuracy" name="Practice Accuracy" stroke="#f59e0b" fill="url(#practiceGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f59e0b", stroke: "#09090b", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="engagement_index" name="Engagement" stroke="#10b981" fill="url(#engGrad)" strokeWidth={1.5} dot={false} strokeDasharray="6 3" activeDot={{ r: 3, fill: "#10b981" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
