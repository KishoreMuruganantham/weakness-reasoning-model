"""
Bayesian Knowledge Tracing (BKT) Implementation.

BKT is a Hidden Markov Model used in educational data mining to estimate
the probability that a learner has mastered a skill, given a sequence
of observed correct/incorrect responses.

Parameters per topic:
  - P(L0): Prior probability of initial mastery
  - P(T):  Probability of transitioning from unlearned to learned
  - P(G):  Probability of guessing correctly when unlearned (guess)
  - P(S):  Probability of making a mistake when learned (slip)

This is the same model used by Carnegie Learning and Khan Academy.
"""

from dataclasses import dataclass


@dataclass
class BKTParams:
    p_init: float = 0.1    # P(L0) - prior knowledge
    p_transit: float = 0.1  # P(T)  - learning rate
    p_guess: float = 0.25   # P(G)  - guess rate
    p_slip: float = 0.1     # P(S)  - slip rate


@dataclass
class BKTResult:
    topic_id: str
    p_mastery: float          # Final P(mastery) after all observations
    p_mastery_history: list   # P(mastery) over time
    n_observations: int
    mastery_velocity: float   # Rate of mastery change (positive = learning)
    confidence: float         # How confident we are in this estimate


class BayesianKnowledgeTracer:
    """Estimates P(mastery) for each topic using Bayesian Knowledge Tracing."""

    def __init__(self):
        # Default BKT parameters (can be tuned per topic/domain)
        self.default_params = BKTParams()

        # Domain-specific parameter adjustments
        self.domain_params = {
            "Mathematics": BKTParams(p_init=0.1, p_transit=0.08, p_guess=0.25, p_slip=0.12),
            "Physics": BKTParams(p_init=0.08, p_transit=0.07, p_guess=0.2, p_slip=0.1),
            "Programming": BKTParams(p_init=0.05, p_transit=0.12, p_guess=0.15, p_slip=0.08),
        }

    def trace(self, topic_id: str, observations: list[bool],
              domain: str = None) -> BKTResult:
        """
        Run BKT on a sequence of observations for a topic.

        Args:
            topic_id: The topic being traced
            observations: List of True (correct) / False (incorrect) responses
            domain: Optional domain for domain-specific parameters

        Returns:
            BKTResult with mastery probability and metadata
        """
        params = self.domain_params.get(domain, self.default_params) if domain else self.default_params

        if not observations:
            return BKTResult(
                topic_id=topic_id, p_mastery=params.p_init,
                p_mastery_history=[params.p_init], n_observations=0,
                mastery_velocity=0.0, confidence=0.0
            )

        p_learned = params.p_init
        history = [p_learned]

        for obs in observations:
            # E-step: Update P(L) given observation
            if obs:  # correct response
                p_obs_given_learned = 1.0 - params.p_slip
                p_obs_given_unlearned = params.p_guess
            else:  # incorrect response
                p_obs_given_learned = params.p_slip
                p_obs_given_unlearned = 1.0 - params.p_guess

            # Posterior P(L|obs) using Bayes' rule
            numerator = p_learned * p_obs_given_learned
            denominator = numerator + (1.0 - p_learned) * p_obs_given_unlearned

            if denominator > 0:
                p_learned_posterior = numerator / denominator
            else:
                p_learned_posterior = p_learned

            # M-step: Account for learning transition
            p_learned = p_learned_posterior + (1.0 - p_learned_posterior) * params.p_transit
            p_learned = max(0.001, min(0.999, p_learned))
            history.append(p_learned)

        # Calculate mastery velocity (trend over recent observations)
        velocity = self._compute_velocity(history)

        # Confidence based on number of observations and consistency
        confidence = self._compute_confidence(history, len(observations))

        return BKTResult(
            topic_id=topic_id,
            p_mastery=p_learned,
            p_mastery_history=history,
            n_observations=len(observations),
            mastery_velocity=velocity,
            confidence=confidence,
        )

    def _compute_velocity(self, history: list[float]) -> float:
        """Compute the rate of mastery change using recent history."""
        if len(history) < 3:
            return 0.0

        # Use last 30% of history for trend
        window = max(3, len(history) // 3)
        recent = history[-window:]
        early = history[-2 * window:-window] if len(history) >= 2 * window else history[:window]

        avg_recent = sum(recent) / len(recent)
        avg_early = sum(early) / len(early)

        return avg_recent - avg_early

    def _compute_confidence(self, history: list[float], n_obs: int) -> float:
        """Confidence in the estimate based on data quantity and consistency."""
        # More observations = more confidence (saturating)
        quantity_factor = min(1.0, n_obs / 20.0)

        # Lower variance in recent history = more confidence
        if len(history) > 3:
            recent = history[-min(10, len(history)):]
            mean = sum(recent) / len(recent)
            variance = sum((x - mean) ** 2 for x in recent) / len(recent)
            consistency_factor = max(0.0, 1.0 - variance * 10)
        else:
            consistency_factor = 0.3

        return round(quantity_factor * 0.6 + consistency_factor * 0.4, 3)
