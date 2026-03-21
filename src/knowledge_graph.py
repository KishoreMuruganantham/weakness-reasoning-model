"""
Knowledge Dependency Graph for Learning Topics.

Maps prerequisite relationships between topics, enabling root-cause
analysis: if a learner is weak at 'Quadratic Equations', we can trace
it back to a foundational gap in 'Linear Equations' or 'Algebra Basics'.
"""

from dataclasses import dataclass, field


@dataclass
class TopicNode:
    topic_id: str
    name: str
    domain: str
    difficulty: float  # 0.0 (easy) to 1.0 (hard)
    prerequisites: list = field(default_factory=list)


class KnowledgeGraph:
    """Directed acyclic graph of topic dependencies."""

    def __init__(self):
        self.nodes: dict[str, TopicNode] = {}
        self._build_graph()

    def _build_graph(self):
        """Build a realistic multi-domain knowledge graph."""
        topics = [
            # --- Mathematics Domain ---
            TopicNode("math_basics", "Arithmetic Basics", "Mathematics", 0.1),
            TopicNode("fractions", "Fractions & Decimals", "Mathematics", 0.2,
                      ["math_basics"]),
            TopicNode("algebra_basics", "Algebra Basics", "Mathematics", 0.3,
                      ["math_basics", "fractions"]),
            TopicNode("linear_eq", "Linear Equations", "Mathematics", 0.4,
                      ["algebra_basics"]),
            TopicNode("quadratic_eq", "Quadratic Equations", "Mathematics", 0.5,
                      ["linear_eq", "algebra_basics"]),
            TopicNode("functions", "Functions & Graphs", "Mathematics", 0.5,
                      ["linear_eq"]),
            TopicNode("trigonometry", "Trigonometry", "Mathematics", 0.6,
                      ["functions", "algebra_basics"]),
            TopicNode("calculus_intro", "Introduction to Calculus", "Mathematics", 0.7,
                      ["functions", "trigonometry"]),
            TopicNode("probability", "Probability", "Mathematics", 0.5,
                      ["fractions", "algebra_basics"]),
            TopicNode("statistics", "Statistics", "Mathematics", 0.5,
                      ["probability", "math_basics"]),

            # --- Physics Domain ---
            TopicNode("physics_units", "Units & Measurements", "Physics", 0.15),
            TopicNode("kinematics", "Kinematics", "Physics", 0.4,
                      ["physics_units", "algebra_basics", "linear_eq"]),
            TopicNode("newtons_laws", "Newton's Laws of Motion", "Physics", 0.5,
                      ["kinematics"]),
            TopicNode("work_energy", "Work & Energy", "Physics", 0.55,
                      ["newtons_laws", "calculus_intro"]),
            TopicNode("waves", "Waves & Oscillations", "Physics", 0.6,
                      ["trigonometry", "newtons_laws"]),

            # --- Programming Domain ---
            TopicNode("prog_basics", "Programming Basics", "Programming", 0.15),
            TopicNode("variables_types", "Variables & Data Types", "Programming", 0.2,
                      ["prog_basics"]),
            TopicNode("control_flow", "Control Flow (if/else/loops)", "Programming", 0.3,
                      ["variables_types"]),
            TopicNode("functions_prog", "Functions & Scope", "Programming", 0.4,
                      ["control_flow"]),
            TopicNode("data_structures", "Data Structures", "Programming", 0.5,
                      ["functions_prog", "control_flow"]),
            TopicNode("recursion", "Recursion", "Programming", 0.6,
                      ["functions_prog", "data_structures"]),
            TopicNode("algorithms", "Algorithms & Complexity", "Programming", 0.7,
                      ["recursion", "data_structures"]),
        ]

        for t in topics:
            self.nodes[t.topic_id] = t

    def get_prerequisites(self, topic_id: str, depth: int = -1) -> list[str]:
        """Get all prerequisites recursively up to given depth (-1 = unlimited)."""
        visited = set()
        result = []
        self._dfs_prereqs(topic_id, visited, result, depth, 0)
        return result

    def _dfs_prereqs(self, topic_id, visited, result, max_depth, current_depth):
        if topic_id in visited:
            return
        if max_depth != -1 and current_depth > max_depth:
            return
        visited.add(topic_id)
        node = self.nodes.get(topic_id)
        if not node:
            return
        for prereq in node.prerequisites:
            if prereq not in visited:
                result.append(prereq)
                self._dfs_prereqs(prereq, visited, result, max_depth, current_depth + 1)

    def get_dependents(self, topic_id: str) -> list[str]:
        """Get all topics that depend on this topic (downstream impact)."""
        dependents = []
        for tid, node in self.nodes.items():
            if topic_id in node.prerequisites:
                dependents.append(tid)
                dependents.extend(self.get_dependents(tid))
        return list(set(dependents))

    def get_dependency_depth(self, topic_id: str) -> int:
        """How many downstream topics are affected by weakness in this topic."""
        return len(self.get_dependents(topic_id))

    def get_all_topic_ids(self) -> list[str]:
        return list(self.nodes.keys())

    def get_domain_topics(self, domain: str) -> list[str]:
        return [tid for tid, n in self.nodes.items() if n.domain == domain]
