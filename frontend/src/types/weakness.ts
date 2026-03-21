export type SeverityLevel = "critical" | "high" | "moderate" | "low";

export interface WeaknessEvidence {
  signal: string;
  value: number;
  threshold: number;
  description: string;
}

export interface Weakness {
  rank: number;
  topic_id: string;
  topic_name: string;
  domain: string;
  severity_score: number;
  p_mastery: number;
  confidence: number;
  mastery_velocity: number;
  weakness_type: string;
  evidence: WeaknessEvidence[];
  root_causes: string[];
  downstream_impact: string[];
  reasoning: string;
}

export interface TemporalDataPoint {
  date: string;
  test_accuracy: number;
  practice_accuracy: number;
  engagement_index: number;
  predicted?: boolean;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  domain: string;
  mastery: number;
  difficulty: number;
  isWeak: boolean;
  severityScore: number;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  weight: number;
}

export interface LearnerProfile {
  id: string;
  name: string;
  overallMastery: number;
  totalWeaknesses: number;
  criticalCount: number;
  improvingCount: number;
  studyStreak: number;
  lastActive: string;
}

export interface DomainSummary {
  domain: string;
  weaknessCount: number;
  avgSeverity: number;
  topWeakness: string;
  trend: "improving" | "declining" | "stagnant";
}

export interface InterventionStep {
  id: string;
  topic_id: string;
  topic_name: string;
  domain: string;
  estimatedMinutes: number;
  priority: number;
  dependencies: string[];
  masteryTarget: number;
  currentMastery: number;
}

export interface WeaknessReport {
  report_version: string;
  generated_at: string;
  total_weaknesses: number;
  weaknesses: Weakness[];
}
