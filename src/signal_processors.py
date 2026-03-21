"""
Multi-Source Signal Processors.

Extracts structured signals from raw activity logs:
  - TestSignalProcessor: accuracy, skip rate, time anomalies
  - PracticeSignalProcessor: hint dependency, retry patterns, completion
  - EngagementSignalProcessor: effort levels, help-seeking behavior
"""

import json
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class TestSignal:
    topic_id: str
    avg_accuracy: float
    accuracy_trend: float      # slope of accuracy over time
    avg_skip_rate: float
    time_anomaly_score: float  # how abnormal the time patterns are
    n_attempts: int
    observations: list         # bool sequence for BKT


@dataclass
class PracticeSignal:
    topic_id: str
    avg_accuracy: float
    avg_hint_rate: float       # hints per exercise
    avg_retry_rate: float      # retries per session
    avg_completion: float
    total_time_spent: int
    n_sessions: int
    observations: list         # bool sequence for BKT


@dataclass
class EngagementSignal:
    topic_id: str
    total_time_spent: int
    event_count: int
    help_request_rate: float
    resource_completion_rate: float
    engagement_score: float    # composite engagement metric


class TestSignalProcessor:
    def process(self, log_path: str) -> dict[str, TestSignal]:
        with open(log_path) as f:
            logs = json.load(f)

        topic_data = defaultdict(list)
        for entry in logs:
            topic_data[entry["topic_id"]].append(entry)

        signals = {}
        for topic_id, attempts in topic_data.items():
            # Sort by timestamp for trend analysis
            attempts.sort(key=lambda x: x["timestamp"])

            accuracies = [a["correct"] / a["total_questions"] for a in attempts]
            skip_rates = [a["skipped"] / a["total_questions"] for a in attempts]
            times = [a["time_spent_seconds"] for a in attempts]

            # Accuracy trend (linear regression slope)
            trend = self._compute_trend(accuracies)

            # Time anomaly: high variance or extreme values suggest struggle
            time_anomaly = self._compute_time_anomaly(times)

            # Build observation sequence for BKT
            observations = []
            for a in attempts:
                ratio = a["correct"] / a["total_questions"]
                # Expand into individual question-level observations
                for _ in range(a["correct"]):
                    observations.append(True)
                for _ in range(a["incorrect"] + a["skipped"]):
                    observations.append(False)

            signals[topic_id] = TestSignal(
                topic_id=topic_id,
                avg_accuracy=sum(accuracies) / len(accuracies),
                accuracy_trend=trend,
                avg_skip_rate=sum(skip_rates) / len(skip_rates),
                time_anomaly_score=time_anomaly,
                n_attempts=len(attempts),
                observations=observations,
            )
        return signals

    def _compute_trend(self, values: list[float]) -> float:
        """Simple linear regression slope."""
        n = len(values)
        if n < 2:
            return 0.0
        x_mean = (n - 1) / 2.0
        y_mean = sum(values) / n
        numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        return numerator / denominator if denominator != 0 else 0.0

    def _compute_time_anomaly(self, times: list[int]) -> float:
        """Detect abnormal time patterns (giving up quickly or struggling too long)."""
        if len(times) < 2:
            return 0.0
        mean = sum(times) / len(times)
        if mean == 0:
            return 0.0
        variance = sum((t - mean) ** 2 for t in times) / len(times)
        cv = (variance ** 0.5) / mean  # coefficient of variation
        return min(1.0, cv)


class PracticeSignalProcessor:
    def process(self, log_path: str) -> dict[str, PracticeSignal]:
        with open(log_path) as f:
            logs = json.load(f)

        topic_data = defaultdict(list)
        for entry in logs:
            topic_data[entry["topic_id"]].append(entry)

        signals = {}
        for topic_id, sessions in topic_data.items():
            sessions.sort(key=lambda x: x["timestamp"])

            accuracies = [s["exercises_correct"] / max(1, s["exercises_attempted"]) for s in sessions]
            hint_rates = [s["hints_used"] / max(1, s["exercises_attempted"]) for s in sessions]
            retry_rates = [s["retry_count"] for s in sessions]
            completions = [s["completion_rate"] for s in sessions]
            total_time = sum(s["time_spent_seconds"] for s in sessions)

            observations = []
            for s in sessions:
                for _ in range(s["exercises_correct"]):
                    observations.append(True)
                for _ in range(s["exercises_attempted"] - s["exercises_correct"]):
                    observations.append(False)

            signals[topic_id] = PracticeSignal(
                topic_id=topic_id,
                avg_accuracy=sum(accuracies) / len(accuracies),
                avg_hint_rate=sum(hint_rates) / len(hint_rates),
                avg_retry_rate=sum(retry_rates) / len(retry_rates),
                avg_completion=sum(completions) / len(completions),
                total_time_spent=total_time,
                n_sessions=len(sessions),
                observations=observations,
            )
        return signals


class EngagementSignalProcessor:
    def process(self, log_path: str) -> dict[str, EngagementSignal]:
        with open(log_path) as f:
            logs = json.load(f)

        topic_data = defaultdict(list)
        for entry in logs:
            topic_data[entry["topic_id"]].append(entry)

        signals = {}
        for topic_id, events in topic_data.items():
            total_time = sum(e["duration_seconds"] for e in events)
            help_requests = sum(1 for e in events if e["event_type"] == "help_request")
            completions = [1 if e["completed"] else 0 for e in events]

            # Engagement score: weighted combination
            time_score = min(1.0, total_time / 5000.0)
            frequency_score = min(1.0, len(events) / 50.0)
            help_rate = help_requests / max(1, len(events))

            engagement_score = 0.4 * time_score + 0.4 * frequency_score + 0.2 * (1.0 - help_rate)

            signals[topic_id] = EngagementSignal(
                topic_id=topic_id,
                total_time_spent=total_time,
                event_count=len(events),
                help_request_rate=help_rate,
                resource_completion_rate=sum(completions) / max(1, len(completions)),
                engagement_score=round(engagement_score, 3),
            )
        return signals
