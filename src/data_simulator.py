"""
Synthetic Activity Data Simulator.

Generates realistic multi-source learning activity logs:
  - Test attempts (scored assessments with per-topic breakdown)
  - Practice sessions (self-paced exercises with time spent)
  - Engagement metrics (login frequency, resource access, help-seeking)

The simulator creates a learner profile with deliberate weakness patterns
to validate the reasoning model's detection capabilities.
"""

import json
import random
import os
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

from .knowledge_graph import KnowledgeGraph


@dataclass
class TestAttempt:
    timestamp: str
    topic_id: str
    total_questions: int
    correct: int
    incorrect: int
    skipped: int
    time_spent_seconds: int
    difficulty_level: float


@dataclass
class PracticeSession:
    timestamp: str
    topic_id: str
    exercises_attempted: int
    exercises_correct: int
    hints_used: int
    time_spent_seconds: int
    completion_rate: float
    retry_count: int


@dataclass
class EngagementEvent:
    timestamp: str
    topic_id: str
    event_type: str   # "login", "resource_view", "video_watch", "help_request", "forum_post"
    duration_seconds: int
    completed: bool


class LearnerProfile:
    """Defines a learner's true mastery levels (hidden from the model)."""

    def __init__(self, learner_id: str, kg: KnowledgeGraph, seed: int = 42):
        self.learner_id = learner_id
        self.kg = kg
        rng = random.Random(seed)

        # Assign true mastery levels per topic (0.0 to 1.0)
        # Create deliberate weakness clusters
        self.true_mastery = {}
        weak_topics = set()

        # Pick 2-3 foundational topics as root weaknesses
        foundations = ["algebra_basics", "control_flow", "kinematics"]
        for f in foundations:
            self.true_mastery[f] = rng.uniform(0.15, 0.35)
            weak_topics.add(f)

        # Propagate weakness to dependents (realistic cascade)
        for tid in kg.get_all_topic_ids():
            if tid in self.true_mastery:
                continue
            prereqs = kg.nodes[tid].prerequisites
            weak_prereq_count = sum(1 for p in prereqs if p in weak_topics)

            if weak_prereq_count > 0:
                # Weakness propagates: more weak prereqs = weaker mastery
                penalty = 0.2 * weak_prereq_count
                base = rng.uniform(0.3, 0.55)
                self.true_mastery[tid] = max(0.1, base - penalty)
                if self.true_mastery[tid] < 0.4:
                    weak_topics.add(tid)
            else:
                # Strong topic
                self.true_mastery[tid] = rng.uniform(0.65, 0.95)

        # Create one "effort without results" pattern
        # Learner tries hard at trigonometry but still struggles
        self.high_effort_topics = {"trigonometry", "quadratic_eq"}


class DataSimulator:
    """Generates synthetic activity logs based on learner profiles."""

    def __init__(self, seed: int = 42):
        self.kg = KnowledgeGraph()
        self.rng = random.Random(seed)
        self.profile = LearnerProfile("learner_001", self.kg, seed)

    def generate_all(self, output_dir: str, days: int = 60, events_per_day: int = 8):
        """Generate all activity logs and save to JSON files."""
        os.makedirs(output_dir, exist_ok=True)
        start_date = datetime(2025, 12, 1)

        test_logs = []
        practice_logs = []
        engagement_logs = []

        for day in range(days):
            current_date = start_date + timedelta(days=day)

            # Some days the learner is less active (realistic)
            if self.rng.random() < 0.15:
                continue  # skip day (absence)

            daily_topics = self.rng.sample(
                self.kg.get_all_topic_ids(),
                min(self.rng.randint(2, 5), len(self.kg.get_all_topic_ids()))
            )

            for topic_id in daily_topics:
                mastery = self.profile.true_mastery[topic_id]
                hour = self.rng.randint(8, 22)
                ts = current_date.replace(hour=hour, minute=self.rng.randint(0, 59))
                timestamp = ts.isoformat()

                # Add temporal trend: slight improvement over time for some topics
                time_factor = day / days
                mastery_adjusted = min(0.95, mastery + 0.05 * time_factor)

                # But for certain weak topics, mastery stagnates or declines
                if topic_id in ("algebra_basics", "control_flow"):
                    mastery_adjusted = mastery - 0.02 * time_factor  # declining

                # Generate test attempt (~40% of interactions)
                if self.rng.random() < 0.4:
                    test_logs.append(self._gen_test(timestamp, topic_id, mastery_adjusted))

                # Generate practice session (~50% of interactions)
                if self.rng.random() < 0.5:
                    practice_logs.append(self._gen_practice(timestamp, topic_id, mastery_adjusted))

                # Generate engagement events
                n_events = self.rng.randint(1, 3)
                if topic_id in self.profile.high_effort_topics:
                    n_events += 2  # more engagement on struggle topics
                for _ in range(n_events):
                    engagement_logs.append(self._gen_engagement(timestamp, topic_id, mastery_adjusted))

        # Save logs
        for name, logs in [("test_logs", test_logs), ("practice_logs", practice_logs),
                           ("engagement_logs", engagement_logs)]:
            path = os.path.join(output_dir, f"{name}.json")
            with open(path, "w") as f:
                json.dump([asdict(l) for l in logs], f, indent=2)

        # Save ground truth (for validation only, not used by model)
        truth = {
            "learner_id": self.profile.learner_id,
            "true_mastery": self.profile.true_mastery,
            "high_effort_topics": list(self.profile.high_effort_topics),
        }
        with open(os.path.join(output_dir, "ground_truth.json"), "w") as f:
            json.dump(truth, f, indent=2)

        return {
            "test_attempts": len(test_logs),
            "practice_sessions": len(practice_logs),
            "engagement_events": len(engagement_logs),
        }

    def _gen_test(self, timestamp, topic_id, mastery) -> TestAttempt:
        total_q = self.rng.choice([5, 10, 15, 20])
        noise = self.rng.gauss(0, 0.1)
        effective = max(0.0, min(1.0, mastery + noise))
        correct = int(round(total_q * effective))
        correct = max(0, min(total_q, correct))
        skipped = self.rng.randint(0, max(0, total_q - correct) // 2)
        incorrect = total_q - correct - skipped
        difficulty = self.kg.nodes[topic_id].difficulty

        # Weak students spend more time (struggling) or very little (giving up)
        if mastery < 0.3:
            time = self.rng.randint(60, 300) if self.rng.random() < 0.5 else self.rng.randint(600, 1200)
        else:
            time = self.rng.randint(180, 600)

        return TestAttempt(timestamp, topic_id, total_q, correct, incorrect,
                           skipped, time, difficulty)

    def _gen_practice(self, timestamp, topic_id, mastery) -> PracticeSession:
        exercises = self.rng.randint(3, 15)
        noise = self.rng.gauss(0, 0.1)
        effective = max(0.0, min(1.0, mastery + noise))
        correct = int(round(exercises * effective))
        correct = max(0, min(exercises, correct))
        hints = self.rng.randint(0, exercises) if mastery < 0.5 else self.rng.randint(0, 2)
        completion = self.rng.uniform(0.4, 0.7) if mastery < 0.4 else self.rng.uniform(0.7, 1.0)
        retries = self.rng.randint(2, 6) if mastery < 0.4 else self.rng.randint(0, 2)

        is_high_effort = topic_id in self.profile.high_effort_topics
        time = self.rng.randint(600, 1800) if is_high_effort else self.rng.randint(180, 900)

        return PracticeSession(timestamp, topic_id, exercises, correct, hints,
                               time, round(completion, 2), retries)

    def _gen_engagement(self, timestamp, topic_id, mastery) -> EngagementEvent:
        event_types = ["resource_view", "video_watch", "help_request", "forum_post"]
        weights = [0.4, 0.3, 0.2, 0.1]

        # Weak + high effort: more help requests
        if topic_id in self.profile.high_effort_topics:
            weights = [0.2, 0.3, 0.35, 0.15]

        etype = self.rng.choices(event_types, weights=weights)[0]
        duration = self.rng.randint(30, 600)
        completed = self.rng.random() < (0.5 + 0.4 * mastery)

        return EngagementEvent(timestamp, topic_id, etype, duration, completed)
