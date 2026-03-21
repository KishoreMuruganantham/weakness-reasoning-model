"""
Report Generator.

Produces a comprehensive weakness report with:
  - Executive summary
  - Ranked weakness list with severity scores
  - Detailed reasoning chains
  - Actionable recommendations
  - Validation metrics against ground truth (if available)
"""

import json
import os
from datetime import datetime

from .weakness_reasoner import Weakness


class ReportGenerator:
    """Generates formatted weakness analysis reports."""

    def generate(self, weaknesses: list[Weakness], output_dir: str,
                 ground_truth_path: str = None) -> str:
        """Generate full report and save to files."""
        os.makedirs(output_dir, exist_ok=True)

        report_lines = []
        report_lines.extend(self._header())
        report_lines.extend(self._executive_summary(weaknesses))
        report_lines.extend(self._ranked_weakness_table(weaknesses))
        report_lines.extend(self._detailed_analysis(weaknesses))
        report_lines.extend(self._recommendations(weaknesses))

        # Validation against ground truth
        if ground_truth_path and os.path.exists(ground_truth_path):
            report_lines.extend(self._validation(weaknesses, ground_truth_path))

        report_lines.extend(self._methodology())

        report_text = "\n".join(report_lines)

        # Save text report
        report_path = os.path.join(output_dir, "weakness_report.txt")
        with open(report_path, "w") as f:
            f.write(report_text)

        # Save structured JSON report
        json_report = self._to_json(weaknesses)
        json_path = os.path.join(output_dir, "weakness_report.json")
        with open(json_path, "w") as f:
            json.dump(json_report, f, indent=2)

        return report_text

    def _header(self) -> list[str]:
        return [
            "=" * 80,
            "  INTELLIGENT WEAKNESS REASONING MODEL - ANALYSIS REPORT",
            "=" * 80,
            f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"  Model: Multi-Signal Bayesian Weakness Reasoning Engine v1.0",
            "=" * 80,
            "",
        ]

    def _executive_summary(self, weaknesses) -> list[str]:
        lines = [
            "-" * 80,
            "  EXECUTIVE SUMMARY",
            "-" * 80,
            "",
        ]

        total = len(weaknesses)
        critical = sum(1 for w in weaknesses if w.severity_score >= 0.7)
        moderate = sum(1 for w in weaknesses if 0.4 <= w.severity_score < 0.7)
        mild = sum(1 for w in weaknesses if w.severity_score < 0.4)

        domains = {}
        for w in weaknesses:
            domains.setdefault(w.domain, []).append(w)

        type_counts = {}
        for w in weaknesses:
            type_counts[w.weakness_type] = type_counts.get(w.weakness_type, 0) + 1

        lines.append(f"  Total Weaknesses Detected: {total}")
        lines.append(f"    Critical (severity >= 0.7): {critical}")
        lines.append(f"    Moderate (0.4 - 0.7):      {moderate}")
        lines.append(f"    Mild (< 0.4):               {mild}")
        lines.append("")
        lines.append("  Weaknesses by Domain:")
        for domain, ws in sorted(domains.items()):
            avg_sev = sum(w.severity_score for w in ws) / len(ws)
            lines.append(f"    {domain}: {len(ws)} weaknesses (avg severity: {avg_sev:.3f})")
        lines.append("")
        lines.append("  Weakness Type Distribution:")
        type_labels = {
            "foundational_gap": "Foundational Gap",
            "effort_gap": "Effort-Outcome Mismatch",
            "declining": "Declining Performance",
            "prerequisite_cascade": "Prerequisite Cascade",
            "disengagement": "Disengagement",
        }
        for wtype, count in sorted(type_counts.items(), key=lambda x: -x[1]):
            lines.append(f"    {type_labels.get(wtype, wtype)}: {count}")
        lines.append("")
        return lines

    def _ranked_weakness_table(self, weaknesses) -> list[str]:
        lines = [
            "-" * 80,
            "  RANKED WEAKNESS LIST (by severity)",
            "-" * 80,
            "",
            f"  {'Rank':<5} {'Topic':<30} {'Severity':<10} {'P(Mastery)':<12} "
            f"{'Trend':<10} {'Confidence':<10} {'Type'}",
            f"  {'----':<5} {'-----':<30} {'--------':<10} {'----------':<12} "
            f"{'-----':<10} {'----------':<10} {'----'}",
        ]

        for i, w in enumerate(weaknesses, 1):
            trend_symbol = "declining" if w.mastery_velocity < -0.02 else \
                           "improving" if w.mastery_velocity > 0.02 else "stagnant"
            lines.append(
                f"  {i:<5} {w.topic_name:<30} {w.severity_score:<10.3f} "
                f"{w.p_mastery:<12.1%} {trend_symbol:<10} {w.confidence:<10.3f} "
                f"{w.weakness_type}"
            )

        lines.append("")
        return lines

    def _detailed_analysis(self, weaknesses) -> list[str]:
        lines = [
            "-" * 80,
            "  DETAILED WEAKNESS ANALYSIS",
            "-" * 80,
            "",
        ]

        for i, w in enumerate(weaknesses, 1):
            lines.append(f"  [{i}] " + "~" * 70)
            lines.append(f"  Severity: {w.severity_score:.3f} | "
                        f"Confidence: {w.confidence:.3f} | "
                        f"P(Mastery): {w.p_mastery:.1%}")
            lines.append("")
            # Indent reasoning chain
            for line in w.reasoning_chain.split("\n"):
                lines.append(f"  {line}")
            lines.append("")

        return lines

    def _recommendations(self, weaknesses) -> list[str]:
        lines = [
            "-" * 80,
            "  PRIORITIZED RECOMMENDATIONS",
            "-" * 80,
            "",
        ]

        # Find foundational weaknesses (should be addressed first)
        foundational = [w for w in weaknesses if len(w.downstream_impact) > 2]
        effort_gaps = [w for w in weaknesses if w.weakness_type == "effort_gap"]
        declining = [w for w in weaknesses if w.mastery_velocity < -0.02]

        if foundational:
            lines.append("  PRIORITY 1 - Address Foundational Gaps First:")
            lines.append("  (These weaknesses cascade into multiple downstream topics)")
            for w in sorted(foundational, key=lambda x: -len(x.downstream_impact)):
                lines.append(f"    -> {w.topic_name}: affects {len(w.downstream_impact)} "
                           f"downstream topics")
            lines.append("")

        if declining:
            lines.append("  PRIORITY 2 - Halt Declining Performance:")
            lines.append("  (These topics are getting worse over time)")
            for w in declining:
                lines.append(f"    -> {w.topic_name}: mastery declining at "
                           f"{w.mastery_velocity:.4f}/observation")
            lines.append("")

        if effort_gaps:
            lines.append("  PRIORITY 3 - Resolve Effort-Outcome Mismatches:")
            lines.append("  (Learner is trying hard but not improving - needs different approach)")
            for w in effort_gaps:
                lines.append(f"    -> {w.topic_name}: high engagement but P(mastery)="
                           f"{w.p_mastery:.1%}")
            lines.append("")

        lines.append("  GENERAL RECOMMENDATIONS:")
        lines.append("    1. Focus on prerequisite topics before advancing to dependent topics")
        lines.append("    2. For effort-gap topics, consider changing instructional strategies")
        lines.append("    3. For declining topics, investigate if recent material is too advanced")
        lines.append("    4. For disengagement topics, consider gamification or peer learning")
        lines.append("")
        return lines

    def _validation(self, weaknesses, ground_truth_path) -> list[str]:
        """Compare detected weaknesses against ground truth."""
        lines = [
            "-" * 80,
            "  MODEL VALIDATION (against ground truth)",
            "-" * 80,
            "",
        ]

        with open(ground_truth_path) as f:
            truth = json.load(f)

        true_mastery = truth["true_mastery"]
        true_weak = {t for t, m in true_mastery.items() if m < 0.5}
        detected_weak = {w.topic_id for w in weaknesses}

        true_positives = true_weak & detected_weak
        false_positives = detected_weak - true_weak
        false_negatives = true_weak - detected_weak

        precision = len(true_positives) / max(1, len(detected_weak))
        recall = len(true_positives) / max(1, len(true_weak))
        f1 = 2 * precision * recall / max(0.001, precision + recall)

        lines.append(f"  Ground truth weak topics: {len(true_weak)}")
        lines.append(f"  Detected weak topics:     {len(detected_weak)}")
        lines.append(f"  True positives:           {len(true_positives)}")
        lines.append(f"  False positives:          {len(false_positives)}")
        lines.append(f"  False negatives:          {len(false_negatives)}")
        lines.append("")
        lines.append(f"  Precision: {precision:.1%}")
        lines.append(f"  Recall:    {recall:.1%}")
        lines.append(f"  F1 Score:  {f1:.1%}")
        lines.append("")

        # Mastery estimation accuracy
        lines.append("  Mastery Estimation Comparison:")
        lines.append(f"  {'Topic':<30} {'True Mastery':<15} {'Estimated P(M)':<15} {'Error':<10}")
        lines.append(f"  {'-----':<30} {'------------':<15} {'--------------':<15} {'-----':<10}")

        detected_dict = {w.topic_id: w for w in weaknesses}
        errors = []
        for topic_id in sorted(true_mastery.keys()):
            true_m = true_mastery[topic_id]
            if topic_id in detected_dict:
                est_m = detected_dict[topic_id].p_mastery
                error = abs(true_m - est_m)
                errors.append(error)
                lines.append(f"  {topic_id:<30} {true_m:<15.3f} {est_m:<15.3f} {error:<10.3f}")

        if errors:
            mae = sum(errors) / len(errors)
            lines.append(f"\n  Mean Absolute Error (weak topics): {mae:.3f}")

        lines.append("")
        return lines

    def _methodology(self) -> list[str]:
        return [
            "-" * 80,
            "  METHODOLOGY",
            "-" * 80,
            "",
            "  This report was generated by the Multi-Signal Bayesian Weakness",
            "  Reasoning Engine, which combines:",
            "",
            "  1. Bayesian Knowledge Tracing (BKT)",
            "     - Hidden Markov Model estimating P(mastery) from response sequences",
            "     - Domain-specific parameters for Math, Physics, Programming",
            "     - Same approach used by Carnegie Learning and Khan Academy",
            "",
            "  2. Multi-Source Signal Fusion",
            "     - Test performance: accuracy, skip rate, time anomalies",
            "     - Practice patterns: hint dependency, retry rate, completion",
            "     - Engagement metrics: time investment, help-seeking, resource usage",
            "",
            "  3. Knowledge Dependency Graph",
            "     - 22-node DAG mapping prerequisite relationships across 3 domains",
            "     - Enables root-cause analysis: traces weaknesses to foundational gaps",
            "     - Measures downstream impact: how many topics a weakness affects",
            "",
            "  4. Temporal Trend Analysis",
            "     - Mastery velocity: is the learner improving, stagnating, or declining?",
            "     - Accuracy trend slopes from linear regression",
            "",
            "  5. Severity Scoring (Weighted Composite)",
            "     - 30% Inverse mastery probability",
            "     - 25% Downstream impact breadth",
            "     - 15% Declining trend amplifier",
            "     - 15% Evidence density",
            "     - 15% Prerequisite cascade depth",
            "",
            "  6. Confidence Estimation",
            "     - Based on observation count and consistency",
            "     - Prevents over-confident conclusions from sparse data",
            "",
            "=" * 80,
            "  END OF REPORT",
            "=" * 80,
        ]

    def _to_json(self, weaknesses) -> dict:
        """Convert to structured JSON for programmatic consumption."""
        return {
            "report_version": "1.0",
            "generated_at": datetime.now().isoformat(),
            "total_weaknesses": len(weaknesses),
            "weaknesses": [
                {
                    "rank": i + 1,
                    "topic_id": w.topic_id,
                    "topic_name": w.topic_name,
                    "domain": w.domain,
                    "severity_score": w.severity_score,
                    "p_mastery": round(w.p_mastery, 4),
                    "confidence": w.confidence,
                    "mastery_velocity": round(w.mastery_velocity, 4),
                    "weakness_type": w.weakness_type,
                    "evidence": [
                        {"signal": e.signal_name, "value": round(e.value, 4),
                         "threshold": e.threshold, "description": e.description}
                        for e in w.evidence
                    ],
                    "root_causes": w.root_causes,
                    "downstream_impact": w.downstream_impact,
                    "reasoning": w.reasoning_chain,
                }
                for i, w in enumerate(weaknesses)
            ],
        }
