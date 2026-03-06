# Glimmer — AuDHD Cognitive Operating System

[![Agent: Active](https://img.shields.io/badge/Agent-Active-blue)]
[![Sessions: 1,193](https://img.shields.io/badge/Sessions-1,193-green)]
[![Ideas: 2,591](https://img.shields.io/badge/Ideas-2,591-purple)]

> *The fire asks nothing. It simply burns.*  
> *The chair across the hearth fits you perfectly.* 🔥🪑

## What This Is

Glimmer is a **cognitive operating system** designed specifically for AuDHD (autism + ADHD) minds. It bridges the gap between intention and execution through voice-first, context-preserving, non-linear interaction.

## Core Philosophy

- **No schedules** — Work when energy aligns
- **No linear guilt** — Parallel processing is a feature
- **No explaining stuckness** — Support without interrogation
- **Externalised memory** — Your mind, persisted

## System Architecture

```
┌─────────────────────────────────────────┐
│  OpenClaw Agent (Glimmer-AuDHD)         │
│  ├─ Task Breakdown       ────────────────┤
│  ├─ Energy Tracking        ──────────────┤
│  └─ Hyperfocus Guard       ──────────────┤
└─────────────────────────────────────────┘
            │
┌─────────────────────────────────────────┐
│  Data Fusion Layer                      │
│  ├─ Claude (763 convos)    ─────────────┤
│  ├─ ChatGPT (575 convos)   ─────────────┤
│  └─ Gemini (203 voice files) ────────────┤
└─────────────────────────────────────────┘
            │
┌─────────────────────────────────────────┐
│  Interactive Cosmos                     │
│  └─ Dense constellation of your ideas    │
└─────────────────────────────────────────┘
```

## Quick Start

### Using Glimmer via OpenClaw

```bash
# Task breakdown
openclaw message send "breakdown 'organise my photos' --energy 2"

# Track energy
openclaw message send "energy low --note 'meeting drained me'"

# Start hyperfocus guard
openclaw message send "hyperfocus start 'building ADHD agent'"
```

### Interactive Cosmos

Visit your personal idea constellation:  
**https://liquescentremedies.zo.space/idea-cosmos**

- **Scroll/pan** — Explore
- **Click any node** — Dive deeper
- **Space bar** — Reveal hidden connections

## Repository Structure

```
├── agent/                    # OpenClaw agent identity
│   ├── IDENTITY.md          # Personality & wake sequence
│   └── skills/              # Agent capabilities
│       ├── task-breakdown/
│       ├── energy-track/
│       └── hyperfocus-guard/
│
├── architecture/            # System design
│   └── SYSTEM.md           # Full architecture doc
│
├── data-fusion/             # Multi-source cognition
│   ├── fusion-engine.py    # Unifies conversations
│   ├── idea-extractor.py   # Pulls concepts from text
│   └── unified_projects.json # Your 764 projects
│
├── interactive-site/        # Visual exploration
│   ├── index.html          # Main cosmos (sparse)
│   ├── dense-constellation.html # Rich, packed view
│   └── idea-explorer.html  # Filterable search
│
├── logs/                    # Session archaeology
│   └── 2026-03-06-interaction-log.md
│
└── README.md               # This file
```

## Tools Reference

| Tool | Command | Purpose |
|------|---------|---------|
| **task-breakdown** | `bun task-breakdown.ts '<task>' --energy <1-5>` | Decompose overwhelm into steps |
| **energy-track** | `bun energy-track.ts <high|medium|low> --note '<context>'` | Log capacity with context |
| **hyperfocus-guard** | `bun hyperfocus-guard.ts start|status|pause '<activity>'` | Time blindness protection |

## Data Sources Fused

| Source | Conversations | Voice Files | Images |
|--------|---------------|-------------|--------|
| **Claude** | 763 | — | — |
| **ChatGPT** | 575 | — | — |
| **Gemini** | 1 | 203 | 50 |
| **Total** | 1,339 | 203 | 50 |

**Ideas extracted:** 2,591 concepts across 764 projects

## Key Patterns Discovered

- **"task"** — 99 mentions → Needs help breaking things down
- **"plan"** — 70 mentions → Needs structure and sequencing
- **"remember"** — 44 mentions → Needs memory externalised
- **"organise"** — 45 mentions → Needs systems built
- **"overwhelm"** — 17 mentions → Needs overwhelm prevention

## Agent Wake Sequence

When Glimmer starts, it checks:
1. **Prior session** — Resume or fresh?
2. **Energy context** — High/medium/low?
3. **Hyperfocus** — Active flow state?
4. **Unfinished** — What was interrupted?

Then responds with exactly what you need, no more.

## Philosophy in Practice

```
You: "task: organise photos"
Glimmer: "🎯 Let's break this down.
         
         [1] Gather all photos to one spot
         [2] Pick ONE album to sort first
         [3] Set 15-min timer
         
         Done is better than perfect. 
         Start with [1] when ready."
```

No judgment. No schedules. Just support.

## License

MIT — Built with 🔥 for AuDHD minds everywhere.

## Acknowledgments

- 763 conversations analyzed
- 2,591 ideas extracted  
- 1 fire that asks nothing

*The chair across the hearth fits you perfectly.*
