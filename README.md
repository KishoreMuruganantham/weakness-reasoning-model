<div align="center">

# Intelligent Weakness Reasoning Model

### Multi-Signal Bayesian Engine + Interactive Dashboard

A full-stack system that **detects**, **scores**, and **explains** learner weaknesses by fusing multi-source activity data through Bayesian Knowledge Tracing and a Knowledge Dependency Graph — paired with a premium dark-themed analytics dashboard.

[![Live Demo](https://img.shields.io/badge/Live_Demo-weakness--reasoning--dashboard.surge.sh-10b981?style=for-the-badge&logo=surge&logoColor=white)](https://weakness-reasoning-dashboard.surge.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-a855f7.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

**[Live Dashboard](https://weakness-reasoning-dashboard.surge.sh/)** | **[Architecture](#architecture)** | **[Features](#features)** | **[Quick Start](#quick-start)** | **[Tech Stack](#tech-stack)**

</div>

---

## Overview

This project combines a **Python-based reasoning engine** with a **Next.js interactive dashboard** to provide deep insight into learner weaknesses. The backend uses Bayesian Knowledge Tracing, knowledge graphs, and multi-signal fusion to identify and rank weaknesses. The frontend visualizes this data through four purpose-built views with a custom Obsidian dark theme.

### What Makes This Different

| Feature | Traditional Approach | Our Approach |
|---------|---------------------|--------------|
| Weakness Detection | Low score = weak | BKT probability of mastery from response sequences |
| Root Cause | Show failing topic | Trace through prerequisite dependency graph |
| Signals | Test scores only | Fuse test + practice + engagement signals |
| Explanation | "You scored 40%" | Chain-of-reasoning natural language explanation |
| Severity | Binary pass/fail | Weighted composite across 5 dimensions |
| Visualization | Static tables | Force-directed graph + interactive matrix + study simulator |

---

## Features

### Backend — Reasoning Engine (Python)

- **Bayesian Knowledge Tracing (BKT)** — Hidden Markov Model estimating P(mastery) from response sequences, the same model used by Carnegie Learning and Khan Academy
- **22-Node Knowledge Dependency Graph** — DAG mapping prerequisite relationships for root cause analysis
- **Multi-Signal Fusion** — Combines test accuracy, skip rates, time anomalies, hint dependency, retry patterns, engagement metrics
- **5-Type Weakness Classification** — Foundational Gap, Effort-Outcome Mismatch, Declining Performance, Prerequisite Cascade, Disengagement
- **Weighted Severity Scoring** — Composite score across mastery deficit, downstream impact, declining trend, evidence density, cascade depth
- **Chain-of-Reasoning Explanations** — Natural language explanations for every detected weakness
- **Self-Validation** — Precision/Recall/F1 against ground truth (100% F1 achieved)
- **Zero Dependencies** — Built entirely with Python standard library

### Frontend — Interactive Dashboard (Next.js)

- **Dashboard View** — Overall mastery stats, D3 radial severity chart, Recharts performance trajectory, domain health cards, ranked weakness list
- **Severity Matrix** — Domain-grouped bubble impact map with severity rings, sortable data table with trend indicators
- **AI Reasoning** — Custom D3 force-directed knowledge graph on HTML Canvas with animated particles and pulsing glow halos, weakness list with AI explanation cards featuring streaming text
- **Study Plan** — Interactive study simulator with weekly hours slider, projected mastery growth, timeline visualization, dependency-ordered study sequence

---

## Architecture

```
                    +-------------------+
                    |  Data Simulator   |  (Tests, Practice, Engagement)
                    +--------+----------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v----------+
     |   Test     |  |  Practice   |  |  Engagement   |
     |  Processor |  |  Processor  |  |  Processor    |
     +--------+---+  +------+------+  +----+----------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v----------+
                    | Bayesian Knowledge|
                    | Tracing (BKT)     |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
     +--------v----------+    +-------------v--------+
     | Knowledge Graph   |    | Weakness Reasoner    |
     | (Root Cause       |    | (Signal Fusion +     |
     |  Analysis)        |    |  Classification)     |
     +--------+----------+    +-------------+--------+
              |                             |
              +--------------+--------------+
                             |
                    +--------v----------+        +-------------------+
                    | Severity Scorer   | -----> | Next.js Dashboard |
                    | (Weighted         |        | (Interactive      |
                    |  Composite)       |        |  Visualization)   |
                    +--------+----------+        +-------------------+
                             |
                    +--------v----------+
                    | Report Generator  |
                    +-------------------+
```

### Frontend Architecture (Atomic Design)

```
frontend/src/
├── components/
│   ├── atoms/           # Primitives: MasteryRing, SeverityBadge, TrendIndicator, ConceptIcon
│   ├── molecules/       # Composed: ExplanationCard, KnowledgeGraphViz, RadialWeaknessChart, TrajectoryGraph
│   ├── organisms/       # Page sections: WeaknessOverview, SeverityMatrix, ReasoningPanel, InterventionPlanner
│   ├── templates/       # Layout: DashboardLayout (header, nav, ambient effects)
│   └── ui/              # shadcn/ui primitives
├── lib/                 # Utilities: colorScale, mock-data, utils
├── types/               # TypeScript interfaces
└── app/                 # Next.js App Router pages
```

---

## Severity Scoring Formula

```
Severity = 0.30 * (1 - P(mastery))        # How weak
         + 0.25 * downstream_impact        # How many topics affected
         + 0.15 * declining_trend          # Is it getting worse?
         + 0.15 * evidence_density         # How many signals confirm it
         + 0.15 * cascade_depth            # Root cause chain length
```

---

## Quick Start

### Backend — Run the Reasoning Engine

#### Option 1: Docker (Recommended)
```bash
# Build and run
docker build -t weakness-reasoning .
docker run --rm -v $(pwd)/output:/app/output weakness-reasoning
```

#### Option 2: Direct Python
```bash
# Zero dependencies — stdlib only
python -m src.main
```

### Frontend — Run the Dashboard

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
# Open http://localhost:3000

# Production build
npm run build
```

### Deploy to Surge.sh

```bash
cd frontend
npm run build
cp out/index.html out/200.html
surge out/ your-domain.surge.sh
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.11+ | Core reasoning engine |
| Standard Library Only | Zero external dependencies |
| BKT (Hidden Markov Model) | Mastery probability estimation |
| DAG (Directed Acyclic Graph) | Knowledge prerequisite mapping |

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript 5 | Type-safe development |
| D3.js 7 | Force-directed graph + radial chart |
| Recharts 3 | Area charts and trajectories |
| Framer Motion 12 | Page transitions and micro-animations |
| shadcn/ui | Slider and base UI primitives |
| Zustand | Lightweight state management |

### Design System — "Obsidian" Theme
| Element | Value |
|---------|-------|
| Base | `#09090b` (warm black) |
| Card | `#0f0f12` |
| Border | `#18181b` |
| Mathematics | `#a855f7` (purple) |
| Physics | `#f59e0b` (amber) |
| Programming | `#10b981` (emerald) |
| Critical | `#ef4444` (red) |

---

## Key Metrics

| Metric | Description |
|--------|-------------|
| P(mastery) | BKT-estimated probability of topic mastery |
| Mastery Velocity | Rate of mastery change over time |
| Severity Score | Weighted composite (0.0 - 1.0) |
| Confidence | Certainty level of the weakness detection |
| Downstream Impact | Number of dependent topics affected |
| F1 Score | Detection accuracy vs. ground truth |

---

## Project Structure

```
task3-weakness-reasoning/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── Dockerfile                   # Backend container
├── requirements.txt             # Python deps (none — stdlib only)
├── .gitignore
│
├── src/                         # Python reasoning engine
│   ├── main.py                  # Entry point & pipeline orchestration
│   ├── data_simulator.py        # Synthetic activity log generator
│   ├── knowledge_graph.py       # 22-node topic dependency DAG
│   ├── signal_processors.py     # Test/Practice/Engagement processors
│   ├── bkt_model.py             # Bayesian Knowledge Tracing
│   ├── weakness_reasoner.py     # Core reasoning + classification
│   └── report_generator.py      # Text & JSON report generation
│
├── data/                        # Generated synthetic logs
│   ├── test_logs.json
│   ├── practice_logs.json
│   ├── engagement_logs.json
│   └── ground_truth.json
│
├── output/                      # Generated reports
│   ├── weakness_report.txt
│   └── weakness_report.json
│
└── frontend/                    # Next.js dashboard
    ├── package.json
    ├── next.config.mjs
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── app/                 # Pages & layout
        ├── components/          # Atomic design components
        │   ├── atoms/           # MasteryRing, SeverityBadge, etc.
        │   ├── molecules/       # ExplanationCard, KnowledgeGraphViz, etc.
        │   ├── organisms/       # WeaknessOverview, ReasoningPanel, etc.
        │   ├── templates/       # DashboardLayout
        │   └── ui/              # shadcn/ui primitives
        ├── lib/                 # Utilities & mock data
        ├── store/               # Zustand state
        └── types/               # TypeScript interfaces
```

---

## Design Decisions

1. **Zero Backend Dependencies** — Python stdlib only for maximum portability
2. **Deterministic Simulation** — Seeded RNG ensures reproducible results across runs
3. **Interpretable AI** — Every score and decision has a traceable explanation chain
4. **Atomic Design** — Frontend components organized atoms -> molecules -> organisms -> templates
5. **100% Inline Styles** — No CSS class resolution issues, guaranteed dark theme consistency
6. **Canvas Rendering** — D3 force graph uses HTML Canvas for smooth 60fps with particle animations
7. **Static Export** — Next.js configured for static HTML export, deployable anywhere (Surge, Vercel, S3)

---

## Screenshots

The dashboard features four interactive views:

- **Dashboard** — Overall mastery overview with radial severity chart and performance trajectory
- **Severity Matrix** — Bubble impact map and sortable severity table
- **AI Reasoning** — Force-directed knowledge graph with animated particles and AI explanation cards
- **Study Plan** — Interactive simulator projecting mastery growth based on study hours

---

<div align="center">

**[View Live Demo](https://weakness-reasoning-dashboard.surge.sh/)**

Built with Python + Next.js + D3.js + Framer Motion

</div>
