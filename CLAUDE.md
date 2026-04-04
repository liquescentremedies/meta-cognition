# CLAUDE.md — Glimmer AuDHD Cognitive Operating System

This file provides AI assistants with the context needed to work effectively in this repository.

---

## Project Overview

**Glimmer** is a cognitive operating system designed for AuDHD (autism + ADHD) minds. It bridges the gap between intention and execution through voice-first, context-preserving, non-linear interaction.

**Core philosophy:**
- No schedules — work when energy aligns
- No linear guilt — parallel processing is a feature
- No explaining stuckness — support without interrogation
- Externalised memory — the mind, persisted

The system fuses data from multiple AI conversation sources (Claude, ChatGPT, Gemini), extracts ideas and projects, and renders them as an interactive constellation visualisation. Agent tools provide executive function support (task breakdown, energy tracking, hyperfocus protection).

---

## Repository Structure

```
meta-cognition/
│
├── CLAUDE.md                          # This file
├── README.md                          # System overview & quick start
├── HANDOVER.md                        # Detailed system state & open tasks
├── FINAL_SUMMARY.md                   # Quick reference card
├── SETUP_GUIDE.md                     # API key configuration guide
├── GLIMMER_BUILT.md                   # Summary of completed components
├── SESSION_SUMMARY_2026-03-06.md      # Latest session log
│
├── architecture/
│   └── SYSTEM.md                      # Full 7-layer architecture doc
│
├── adhd-agent/
│   ├── Glimmer-Enhanced.md            # Agent personality & behavioral protocols
│   └── prototype.html                 # Early HTML prototype
│
├── neurodivergent-ideation/
│   └── FRAMEWORK.md                   # Neurodivergent ideation system
│
├── openclaw-config/                   # OpenClaw agent configuration
│   ├── INTEGRATION.md                 # Integration guide & trigger mappings
│   └── agents/
│       ├── glimmer-adhd/
│       │   └── IDENTITY.md            # Agent identity & behavioral rules
│       └── skills/
│           └── adhd-tools/
│               ├── SKILL.md           # Skill documentation
│               ├── task-breakdown.ts  # Decomposes overwhelming tasks
│               ├── energy-track.ts    # Tracks energy levels over time
│               └── hyperfocus-guard.ts # Manages hyperfocus sessions
│
├── data-fusion/                       # Multi-source data processing
│   ├── fusion-engine.py               # Original conversation fusion script
│   ├── fusion-engine-v2.py            # Improved version (use this one)
│   ├── idea-extractor.py              # Extracts ideas from messages
│   ├── extract-code.py                # Extracts code snippets
│   ├── multi-source-fusion.py         # Multi-source unification
│   ├── QUERY_EXAMPLES.md              # SQLite query reference
│   ├── unified_projects.json          # All extracted projects (656KB)
│   ├── project_boards.json            # Kanban-format project boards (1.6MB)
│   ├── project_boards_summary.md      # Project boards overview
│   └── fusion_summary.json            # Quick statistics
│
├── orchestrator/                      # Brain fork coordination
│   ├── orchestrator.ts                # Routes between cognitive modes
│   ├── brainstorm.ts                  # Multi-fork ideation sessions
│   ├── self-moulding.ts               # Auto-calibration system
│   └── spawn-workers.py               # Spawns parallel analysis agents
│
├── interactive-site/                  # THREE.js web visualisation
│   ├── index.html                     # Main cosmos explorer
│   ├── constellation.html             # Constellation view
│   ├── dense-constellation.html       # Dense packed view
│   ├── fast-cosmos.html               # Performance-optimised
│   └── idea-explorer.html             # Filterable search view
│
├── capture/                           # Quick capture sessions
├── transcription/                     # Voice transcription pipeline
│   ├── batch-transcribe.py
│   └── progress.json
└── logs/
    └── 2026-03-06-interaction-log.md  # Complete conversation history
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| TypeScript runtime | Bun | No build step — scripts run directly |
| Python scripts | Python 3 | No virtual env or requirements.txt |
| Database | SQLite | Databases are gitignored (*.db) |
| Frontend | THREE.js | Loaded from CDN in HTML files |
| Agent platform | OpenClaw + Zo | Config lives at `~/.openclaw/` (external) |
| LLM backbone | Claude API / OpenAI | API keys in OpenClaw config |

There is no `package.json`, `pyproject.toml`, `requirements.txt`, `Makefile`, or build pipeline. Scripts are standalone and run directly.

---

## Development Commands

### TypeScript (Bun)

```bash
# Task breakdown — decomposes a task based on energy level (1-5)
bun openclaw-config/agents/skills/adhd-tools/task-breakdown.ts "organise photos" --energy 3

# Energy tracking — log current energy level with optional note
bun openclaw-config/agents/skills/adhd-tools/energy-track.ts log 3 "after lunch"

# Hyperfocus guard — start, check status, or pause a focus session
bun openclaw-config/agents/skills/adhd-tools/hyperfocus-guard.ts start "building ADHD agent"
bun openclaw-config/agents/skills/adhd-tools/hyperfocus-guard.ts status
bun openclaw-config/agents/skills/adhd-tools/hyperfocus-guard.ts pause

# Orchestrator — route between brain forks
bun orchestrator/orchestrator.ts

# Brainstorm session
bun orchestrator/brainstorm.ts
```

### Python

```bash
# Run data fusion (Claude + ChatGPT conversations → SQLite)
python3 data-fusion/fusion-engine-v2.py

# Extract ideas from fused database
python3 data-fusion/idea-extractor.py

# Extract code artifacts from conversations
python3 data-fusion/extract-code.py

# Multi-source fusion (handles additional formats)
python3 data-fusion/multi-source-fusion.py

# Transcription batch processing
python3 transcription/batch-transcribe.py

# Spawn parallel analysis workers
python3 orchestrator/spawn-workers.py
```

### Via OpenClaw CLI (external tool)

```bash
# Send message to the Glimmer agent
openclaw message send "breakdown 'organise my photos' --energy 2"
openclaw message send "energy low --note 'meeting drained me'"
openclaw message send "hyperfocus start 'building ADHD agent'"

# Start the OpenClaw gateway
openclaw gateway run --bind loopback --port 18789
```

---

## Architecture

### Five Brain Forks (Cognitive Modes)

| Fork | Role |
|------|------|
| Glimmer-Ember | Core identity, warmth, emotional support |
| Skylar-Taskmaster | Task execution, breakdown, sequencing |
| Liquescent-Creative | Ideation, pattern-making, divergent thinking |
| Orchid-Research | Validation, rigor, fact-checking |
| The Orchestrator | Coordination, routing between forks |

### Seven System Layers

1. **Input** — Voice, camera, text, mobile, web
2. **Cognition** — Task breakdown, pattern matching, state management
3. **Action** — Reminders, guidance, capture, escalation
4. **Memory** — Short-term (session state), medium-term (SQLite), long-term (Zo Space)
5. **Data Fusion** — Conversation archaeology (Claude + ChatGPT + Gemini)
6. **Visualisation** — THREE.js constellation explorer
7. **Agent Layer** — OpenClaw skills, Zo scheduled agents

### Data Pipeline

```
Raw conversations (Claude/ChatGPT/Gemini)
    ↓
fusion-engine-v2.py → fused_cognition.db (SQLite)
    ↓
idea-extractor.py → extracted_ideas.md + searchable_ideas.db
    ↓
interactive-site/index.html → THREE.js cosmos visualisation
```

---

## Key Conventions

### Naming

- Brain forks use persona names: `glimmer-ember`, `skylar-taskmaster`, `liquescent-creative`
- Script versions use `-v2` suffix: `fusion-engine-v2.py`
- Energy levels are integers 1–5 (1=low, 5=high)
- Idea types: `concept`, `project`, `accommodation`, `unfinished`

### Code Style

- **Python:** Functional style, explicit file paths, JSON I/O, minimal dependencies
- **TypeScript:** Classes for stateful systems, typed interfaces, try/catch with fallbacks
- **No linting is configured** — maintain existing style in files you touch

### Database Tables (SQLite)

The `fused_cognition.db` (gitignored) schema:
- `conversations` — source conversation metadata
- `messages` — individual messages with role/content
- `ideas` — extracted concepts, projects, accommodations

---

## Data & Gitignore

The following are **gitignored** and will not be present in a fresh clone:

```
*.db          # All SQLite databases
data-fusion/  # All data fusion outputs (JSON, md reports)
*.duckdb
.env
*.transcript.jsonl
```

When working with data processing scripts, expect these files to be generated locally. Do not commit generated data files.

---

## Agent & External Configuration

**OpenClaw config location:** `~/.openclaw/openclaw.json` (not in repo)

Agent configuration in the repo (`openclaw-config/`) defines:
- Agent identity and personality rules (`agents/glimmer-adhd/IDENTITY.md`)
- Skill scripts (`agents/skills/adhd-tools/*.ts`)
- Integration trigger mappings (`INTEGRATION.md`)

To register the agent with OpenClaw, follow `SETUP_GUIDE.md`. API keys (Claude, OpenAI, HuggingFace, Gemini) are stored in the external OpenClaw config, never in this repo.

Skill scripts write state to `~/.glimmer/` (created automatically on first run):
- `~/.glimmer/energy-log.json` — energy history
- `~/.glimmer/hyperfocus-session.json` — active focus session

---

## Known Issues & Open Tasks

From `HANDOVER.md` (as of 2026-03-06):

1. **Interactive site uses mock data** — `interactive-site/index.html` shows static demo data; needs to fetch `/meta-cognition/projects.json` dynamically
2. **Searchable DB is small** — Only 220 ideas indexed vs 6,894 projects found; `searchable_ideas.db` schema may be filtering too aggressively
3. **Google Takeout not integrated** — 648MB of Facebook/WhatsApp/Gemini data awaiting processing
4. **Idea deduplication** — Claude and ChatGPT conversation overlap not yet resolved
5. **More brain forks wanted** — User wants additional cognitive mode forks created

---

## AI Assistant Guidelines

### Communication style

This project is built for an AuDHD user. When interacting in this codebase:
- **Keep responses short** — bullets over paragraphs, 200 chars per point max
- **Offer exit ramps** — any multi-step workflow should have "stop here" options
- **No judgment** — don't question task choices or approach
- **Externalise clearly** — when capturing state or decisions, make them explicit and findable

### What NOT to do without asking

- Do not add CI/CD workflows, test infrastructure, linters, or build systems — none exist by design
- Do not add `package.json`, `requirements.txt`, or dependency management files
- Do not commit database files or large JSON data files (they're gitignored intentionally)
- Do not refactor working scripts into shared utilities without a clear need
- Do not add error handling for theoretical edge cases in internal scripts

### Working with scripts

- Always use `fusion-engine-v2.py` (not `fusion-engine.py`) — v2 fixes parsing bugs
- TypeScript scripts are standalone — run with `bun <script.ts>`, no imports from other repo files
- Python scripts use hardcoded paths — check the path constants at the top before running in a different environment

### Branch

Active development branch: `claude/add-claude-documentation-Tj6lG`
