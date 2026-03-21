import { create } from "zustand";
import type { Weakness } from "@/types/weakness";

interface DashboardState {
  selectedWeakness: Weakness | null;
  setSelectedWeakness: (w: Weakness | null) => void;
  activeView: "overview" | "severity" | "reasoning" | "intervention";
  setActiveView: (v: DashboardState["activeView"]) => void;
  selectedDomain: string | null;
  setSelectedDomain: (d: string | null) => void;
  studyHoursPerWeek: number;
  setStudyHoursPerWeek: (h: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedWeakness: null,
  setSelectedWeakness: (w) => set({ selectedWeakness: w }),
  activeView: "overview",
  setActiveView: (v) => set({ activeView: v }),
  selectedDomain: null,
  setSelectedDomain: (d) => set({ selectedDomain: d }),
  studyHoursPerWeek: 10,
  setStudyHoursPerWeek: (h) => set({ studyHoursPerWeek: h }),
}));
