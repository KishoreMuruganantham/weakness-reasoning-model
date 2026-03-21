"use client";

import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { WeaknessOverview } from "@/components/organisms/WeaknessOverview";
import { SeverityMatrix } from "@/components/organisms/SeverityMatrix";
import { ReasoningPanel } from "@/components/organisms/ReasoningPanel";
import { InterventionPlanner } from "@/components/organisms/InterventionPlanner";
import {
  weaknesses,
  temporalData,
  knowledgeNodes,
  knowledgeEdges,
  domainSummaries,
  learnerProfile,
  interventionSteps,
} from "@/lib/mock-data";
import type { Weakness } from "@/types/weakness";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWeakness, setSelectedWeakness] = useState<Weakness | null>(null);

  const handleSelectWeakness = useCallback((w: Weakness) => {
    setSelectedWeakness(w);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const w = weaknesses.find((w) => w.topic_id === nodeId);
      if (w) setSelectedWeakness(w);
    },
    []
  );

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      learnerName={learnerProfile.name}
    >
      {activeTab === "overview" && (
        <WeaknessOverview
          weaknesses={weaknesses}
          temporalData={temporalData}
          domains={domainSummaries}
          profile={learnerProfile}
          onSelectWeakness={(w) => {
            handleSelectWeakness(w);
            setActiveTab("reasoning");
          }}
          selectedId={selectedWeakness?.topic_id}
        />
      )}

      {activeTab === "severity" && (
        <SeverityMatrix
          weaknesses={weaknesses}
          onSelectWeakness={(w) => {
            handleSelectWeakness(w);
            setActiveTab("reasoning");
          }}
        />
      )}

      {activeTab === "reasoning" && (
        <ReasoningPanel
          weaknesses={weaknesses}
          knowledgeNodes={knowledgeNodes}
          knowledgeEdges={knowledgeEdges}
          selectedWeakness={selectedWeakness}
          onSelectWeakness={handleSelectWeakness}
          onNodeClick={handleNodeClick}
        />
      )}

      {activeTab === "intervention" && (
        <InterventionPlanner steps={interventionSteps} />
      )}
    </DashboardLayout>
  );
}
