"""
Main entry point for the Intelligent Weakness Reasoning Model.

Pipeline:
  1. Simulate multi-source activity data (tests, practice, engagement)
  2. Process signals from each data source
  3. Run Bayesian Knowledge Tracing
  4. Fuse signals and reason about weaknesses
  5. Generate ranked weakness report with explanations
"""

import os
import sys
import time

from .data_simulator import DataSimulator
from .knowledge_graph import KnowledgeGraph
from .signal_processors import (
    TestSignalProcessor, PracticeSignalProcessor, EngagementSignalProcessor
)
from .weakness_reasoner import WeaknessReasoner
from .report_generator import ReportGenerator


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    output_dir = os.path.join(base_dir, "output")

    print("=" * 60)
    print("  Intelligent Weakness Reasoning Model v1.0")
    print("  Multi-Signal Bayesian Weakness Reasoning Engine")
    print("=" * 60)

    # Step 1: Generate synthetic data
    print("\n[1/5] Generating synthetic activity data...")
    t0 = time.time()
    simulator = DataSimulator(seed=42)
    stats = simulator.generate_all(data_dir, days=60, events_per_day=8)
    print(f"  Generated {stats['test_attempts']} test attempts, "
          f"{stats['practice_sessions']} practice sessions, "
          f"{stats['engagement_events']} engagement events")
    print(f"  Time: {time.time() - t0:.2f}s")

    # Step 2: Process signals
    print("\n[2/5] Processing multi-source signals...")
    t0 = time.time()
    test_signals = TestSignalProcessor().process(os.path.join(data_dir, "test_logs.json"))
    practice_signals = PracticeSignalProcessor().process(os.path.join(data_dir, "practice_logs.json"))
    engagement_signals = EngagementSignalProcessor().process(os.path.join(data_dir, "engagement_logs.json"))
    print(f"  Test signals:       {len(test_signals)} topics")
    print(f"  Practice signals:   {len(practice_signals)} topics")
    print(f"  Engagement signals: {len(engagement_signals)} topics")
    print(f"  Time: {time.time() - t0:.2f}s")

    # Step 3: Run weakness reasoning engine
    print("\n[3/5] Running Bayesian Knowledge Tracing + Weakness Reasoning...")
    t0 = time.time()
    kg = KnowledgeGraph()
    reasoner = WeaknessReasoner(kg)
    weaknesses = reasoner.analyze(test_signals, practice_signals, engagement_signals)
    print(f"  Detected {len(weaknesses)} weaknesses")
    print(f"  Time: {time.time() - t0:.2f}s")

    # Step 4: Generate report
    print("\n[4/5] Generating weakness report...")
    t0 = time.time()
    reporter = ReportGenerator()
    ground_truth_path = os.path.join(data_dir, "ground_truth.json")
    report = reporter.generate(weaknesses, output_dir, ground_truth_path)
    print(f"  Time: {time.time() - t0:.2f}s")

    # Step 5: Print report
    print("\n[5/5] Analysis complete. Full report:\n")
    print(report)

    print(f"\nReport saved to:")
    print(f"  Text: {os.path.join(output_dir, 'weakness_report.txt')}")
    print(f"  JSON: {os.path.join(output_dir, 'weakness_report.json')}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
