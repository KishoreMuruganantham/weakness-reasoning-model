"""
Core Weakness Reasoning Engine.

Fuses signals from tests, practice, engagement, and BKT to:
  1. Identify weaknesses (P(mastery) < threshold)
  2. Trace root causes through the knowledge dependency graph
  3. Detect patterns (effort-gap, declining trends, prerequisite cascades)
  4. Generate natural-language reasoning chains explaining WHY each weakness exists
"""

from dataclasses import dataclass, field

from .knowledge_graph import KnowledgeGraph, TopicNode
from .bkt_model import BayesianKnowledgeTracer, BKTResult
from .signal_processors import TestSignal, PracticeSignal, EngagementSignal


@dataclass
class WeaknessEvidence:
    signal_name: str
    value: float
    threshold: float
    description: str


@dataclass
class Weakness:
    topic_id: str
    topic_name: str
    domain: str
    severity_score: float          # 0.0 (mild) to 1.0 (critical)
    p_mastery: float               # BKT estimated mastery probability
    confidence: float              # How confident we are
    mastery_velocity: float        # Trend direction
    evidence: list = field(default_factory=list)        # List of WeaknessEvidence
    root_causes: list = field(default_factory=list)     # Prerequisite weaknesses causing this
    downstream_impact: list = field(default_factory=list)  # Topics affected by this weakness
    reasoning_chain: str = ""      # Natural language explanation
    weakness_type: str = ""        # "foundational_gap", "effort_gap", "declining", "cascade"


class WeaknessReasoner:
    """Multi-signal reasoning engine for weakness detection and explanation."""

    MASTERY_THRESHOLD = 0.5
    WEAKNESS_THRESHOLD = 0.45

    def __init__(self, kg: KnowledgeGraph):
        self.kg = kg
        self.bkt = BayesianKnowledgeTracer()

    def analyze(self, test_signals: dict[str, TestSignal],
                practice_signals: dict[str, PracticeSignal],
                engagement_signals: dict[str, EngagementSignal]) -> list[Weakness]:
        """Run full weakness analysis pipeline."""

        # Step 1: Run BKT on all available observation sequences
        bkt_results = self._run_bkt(test_signals, practice_signals)

        # Step 2: Identify weaknesses from all signals
        weaknesses = self._identify_weaknesses(bkt_results, test_signals,
                                                practice_signals, engagement_signals)

        # Step 3: Trace root causes through knowledge graph
        self._trace_root_causes(weaknesses, bkt_results)

        # Step 4: Classify weakness types
        self._classify_weaknesses(weaknesses, engagement_signals)

        # Step 5: Compute severity scores
        self._compute_severity(weaknesses)

        # Step 6: Generate reasoning chains
        self._generate_reasoning(weaknesses)

        # Step 7: Sort by severity (highest first)
        weaknesses.sort(key=lambda w: w.severity_score, reverse=True)

        return weaknesses

    def _run_bkt(self, test_signals, practice_signals) -> dict[str, BKTResult]:
        """Run Bayesian Knowledge Tracing on combined observations."""
        results = {}
        all_topics = set(list(test_signals.keys()) + list(practice_signals.keys()))

        for topic_id in all_topics:
            # Combine observations from tests and practice
            observations = []
            if topic_id in test_signals:
                observations.extend(test_signals[topic_id].observations)
            if topic_id in practice_signals:
                observations.extend(practice_signals[topic_id].observations)

            domain = self.kg.nodes[topic_id].domain if topic_id in self.kg.nodes else None
            results[topic_id] = self.bkt.trace(topic_id, observations, domain)

        return results

    def _identify_weaknesses(self, bkt_results, test_signals,
                              practice_signals, engagement_signals) -> list[Weakness]:
        """Identify topics where the learner shows weakness signals."""
        weaknesses = []

        for topic_id, bkt in bkt_results.items():
            node = self.kg.nodes.get(topic_id)
            if not node:
                continue

            evidence = []
            is_weak = False

            # Signal 1: Low BKT mastery probability
            if bkt.p_mastery < self.MASTERY_THRESHOLD:
                evidence.append(WeaknessEvidence(
                    "BKT Mastery", bkt.p_mastery, self.MASTERY_THRESHOLD,
                    f"Bayesian Knowledge Tracing estimates only {bkt.p_mastery:.1%} "
                    f"mastery probability (threshold: {self.MASTERY_THRESHOLD:.0%})"
                ))
                is_weak = True

            # Signal 2: Low test accuracy
            if topic_id in test_signals:
                ts = test_signals[topic_id]
                if ts.avg_accuracy < 0.5:
                    evidence.append(WeaknessEvidence(
                        "Test Accuracy", ts.avg_accuracy, 0.5,
                        f"Average test accuracy is {ts.avg_accuracy:.1%} across "
                        f"{ts.n_attempts} attempts"
                    ))
                    is_weak = True
                if ts.avg_skip_rate > 0.15:
                    evidence.append(WeaknessEvidence(
                        "Skip Rate", ts.avg_skip_rate, 0.15,
                        f"High question skip rate of {ts.avg_skip_rate:.1%} suggests "
                        f"avoidance or lack of confidence"
                    ))
                if ts.accuracy_trend < -0.02:
                    evidence.append(WeaknessEvidence(
                        "Declining Accuracy", ts.accuracy_trend, -0.02,
                        f"Test accuracy is declining (slope: {ts.accuracy_trend:.4f})"
                    ))

            # Signal 3: Low practice performance
            if topic_id in practice_signals:
                ps = practice_signals[topic_id]
                if ps.avg_accuracy < 0.5:
                    evidence.append(WeaknessEvidence(
                        "Practice Accuracy", ps.avg_accuracy, 0.5,
                        f"Practice accuracy is {ps.avg_accuracy:.1%} across "
                        f"{ps.n_sessions} sessions"
                    ))
                    is_weak = True
                if ps.avg_hint_rate > 0.4:
                    evidence.append(WeaknessEvidence(
                        "Hint Dependency", ps.avg_hint_rate, 0.4,
                        f"High hint usage ({ps.avg_hint_rate:.2f} hints/exercise) "
                        f"indicates reliance on scaffolding"
                    ))
                if ps.avg_completion < 0.65:
                    evidence.append(WeaknessEvidence(
                        "Low Completion", ps.avg_completion, 0.65,
                        f"Average session completion is only {ps.avg_completion:.1%}"
                    ))

            # Signal 4: Negative mastery velocity (getting worse)
            if bkt.mastery_velocity < -0.03:
                evidence.append(WeaknessEvidence(
                    "Negative Mastery Trend", bkt.mastery_velocity, -0.03,
                    f"Mastery is declining over time (velocity: {bkt.mastery_velocity:.4f})"
                ))
                is_weak = True

            if is_weak:
                weaknesses.append(Weakness(
                    topic_id=topic_id,
                    topic_name=node.name,
                    domain=node.domain,
                    severity_score=0.0,  # computed later
                    p_mastery=bkt.p_mastery,
                    confidence=bkt.confidence,
                    mastery_velocity=bkt.mastery_velocity,
                    evidence=evidence,
                ))

        return weaknesses

    def _trace_root_causes(self, weaknesses, bkt_results):
        """Trace weaknesses back to prerequisite gaps."""
        weak_ids = {w.topic_id for w in weaknesses}

        for w in weaknesses:
            prereqs = self.kg.get_prerequisites(w.topic_id, depth=3)
            for prereq_id in prereqs:
                if prereq_id in weak_ids:
                    prereq_node = self.kg.nodes[prereq_id]
                    w.root_causes.append(
                        f"{prereq_node.name} (P(mastery)="
                        f"{bkt_results[prereq_id].p_mastery:.1%})"
                    )

            # Downstream impact
            dependents = self.kg.get_dependents(w.topic_id)
            for dep_id in dependents:
                if dep_id in self.kg.nodes:
                    w.downstream_impact.append(self.kg.nodes[dep_id].name)

    def _classify_weaknesses(self, weaknesses, engagement_signals):
        """Classify each weakness into a type based on signal patterns."""
        for w in weaknesses:
            eng = engagement_signals.get(w.topic_id)

            if w.root_causes:
                w.weakness_type = "prerequisite_cascade"
            elif w.mastery_velocity < -0.03:
                w.weakness_type = "declining"
            elif eng and eng.engagement_score > 0.6 and w.p_mastery < 0.4:
                w.weakness_type = "effort_gap"
            elif eng and eng.engagement_score < 0.3:
                w.weakness_type = "disengagement"
            else:
                w.weakness_type = "foundational_gap"

    def _compute_severity(self, weaknesses):
        """Compute composite severity score from multiple factors."""
        for w in weaknesses:
            # Factor 1: Inverse mastery (lower mastery = higher severity)
            mastery_factor = 1.0 - w.p_mastery

            # Factor 2: Downstream impact (more dependents = higher severity)
            impact_count = len(w.downstream_impact)
            impact_factor = min(1.0, impact_count / 5.0)

            # Factor 3: Declining trend amplifier
            trend_factor = 0.0
            if w.mastery_velocity < -0.02:
                trend_factor = min(1.0, abs(w.mastery_velocity) * 10)

            # Factor 4: Evidence density (more signals = more certain)
            evidence_factor = min(1.0, len(w.evidence) / 5.0)

            # Factor 5: Root cause depth (cascade = amplified)
            cascade_factor = min(1.0, len(w.root_causes) / 3.0)

            # Weighted composite
            w.severity_score = round(
                0.30 * mastery_factor +
                0.25 * impact_factor +
                0.15 * trend_factor +
                0.15 * evidence_factor +
                0.15 * cascade_factor,
                3
            )

    def _generate_reasoning(self, weaknesses):
        """Generate natural-language reasoning chains for each weakness."""
        type_labels = {
            "foundational_gap": "Foundational Knowledge Gap",
            "effort_gap": "Effort-Outcome Mismatch",
            "declining": "Declining Performance",
            "prerequisite_cascade": "Prerequisite Cascade Effect",
            "disengagement": "Disengagement Pattern",
        }

        for w in weaknesses:
            lines = []
            label = type_labels.get(w.weakness_type, "Learning Weakness")
            lines.append(f"[{label}] {w.topic_name} ({w.domain})")
            lines.append("")

            # WHY this is a weakness
            lines.append("WHY this is a weakness:")
            for ev in w.evidence:
                lines.append(f"  - {ev.description}")

            # Root cause analysis
            if w.root_causes:
                lines.append("")
                lines.append("ROOT CAUSE ANALYSIS:")
                lines.append("  This weakness likely stems from gaps in prerequisite topics:")
                for rc in w.root_causes:
                    lines.append(f"  -> {rc}")
                lines.append("  Addressing these foundational gaps first will have cascading benefits.")

            # Trend analysis
            lines.append("")
            if w.mastery_velocity < -0.02:
                lines.append(f"TREND: Performance is DECLINING (velocity: {w.mastery_velocity:.4f}).")
                lines.append("  This requires immediate attention as the gap is widening.")
            elif w.mastery_velocity > 0.02:
                lines.append(f"TREND: Some improvement detected (velocity: {w.mastery_velocity:.4f}).")
                lines.append("  The learner is making progress, but has not yet reached mastery.")
            else:
                lines.append("TREND: Performance is STAGNANT.")
                lines.append("  Current learning strategies are not producing measurable improvement.")

            # Effort-gap detection
            if w.weakness_type == "effort_gap":
                lines.append("")
                lines.append("EFFORT-GAP DETECTED:")
                lines.append("  The learner is investing significant time and effort in this topic")
                lines.append("  but outcomes remain poor. This suggests:")
                lines.append("  - Possible misconceptions that practice alone won't fix")
                lines.append("  - Need for different instructional approach or tutoring")
                lines.append("  - Prerequisite gaps silently blocking progress")

            # Downstream impact
            if w.downstream_impact:
                lines.append("")
                lines.append(f"DOWNSTREAM IMPACT ({len(w.downstream_impact)} topics affected):")
                for dep in w.downstream_impact[:5]:
                    lines.append(f"  - {dep}")
                if len(w.downstream_impact) > 5:
                    lines.append(f"  ... and {len(w.downstream_impact) - 5} more")

            w.reasoning_chain = "\n".join(lines)
