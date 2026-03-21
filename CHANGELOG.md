# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-21

### Added

#### Backend — Reasoning Engine
- Bayesian Knowledge Tracing (BKT) model for mastery probability estimation
- 22-node knowledge dependency graph with prerequisite mapping
- Multi-signal fusion engine combining test, practice, and engagement data
- 5-type weakness classification system (Foundational Gap, Effort-Outcome Mismatch, Declining Performance, Prerequisite Cascade, Disengagement)
- Weighted severity scoring across mastery deficit, downstream impact, trend, evidence density, and cascade depth
- Chain-of-reasoning natural language explanations for every weakness
- Self-validation pipeline achieving 100% F1 score against ground truth
- Synthetic data simulator for tests, practice sessions, and engagement logs
- Docker support for containerized execution
- Zero external dependencies (Python stdlib only)

#### Frontend — Interactive Dashboard
- Next.js 14 App Router with TypeScript
- "Obsidian" dark theme design system with warm black base and domain-specific accent colors
- **Dashboard View**: Overall mastery ring, critical/declining/improving stats, D3 radial severity chart, Recharts performance trajectory, domain health cards, ranked weakness list
- **Severity Matrix**: Domain-grouped bubble impact map with severity-colored rings, sortable table with 5 sort dimensions
- **AI Reasoning**: Custom D3 force-directed knowledge graph on HTML Canvas with animated particles on weak edges, pulsing glow halos on weak nodes, mouse hover tooltips, streaming AI explanation cards with evidence signals and root cause chains
- **Study Plan**: Interactive study simulator with hours slider (2-30h/week), projected mastery growth calculator, visual timeline bar, dependency-ordered study sequence with mastery before/after comparison
- Atomic design component architecture (atoms, molecules, organisms, templates)
- Framer Motion page transitions and micro-animations
- shadcn/ui slider component integration
- Static export configuration for deployment to Surge.sh
- Responsive design with inline styles for guaranteed dark theme consistency

#### Infrastructure
- Docker container definition for backend
- Surge.sh deployment for frontend
- Git repository with comprehensive .gitignore
- MIT License

### Technical Details
- Backend: Python 3.11+, zero dependencies
- Frontend: Next.js 14, TypeScript 5, D3.js 7, Recharts 3, Framer Motion 12, Zustand
- Canvas-based graph rendering for 60fps performance with particle animations
- 100% inline styles to prevent CSS class resolution issues
- Seeded RNG for deterministic, reproducible analysis results
