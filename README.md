# Meta-Cognition System 🧠

**Your distributed cognitive operating system.** Built from 4,238+ conversations across Claude, ChatGPT, and more.

---

## Quick Start

```bash
# Initialize everything
cd /home/workspace/meta-cognition/orchestrator
bun self-moulding.ts --init
bun orchestrator.ts --init

# Start a brainstorm session
bun brainstorm.ts --interactive

# Run data fusion
python3 ../data-fusion/fusion-engine.py --fuse

# Check calibration
bun self-moulding.ts --report
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    META-COGNITION SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 DATA FUSION LAYER                                       │
│  ├─ Claude (763 conversations) → Task/Plan/Remember        │
│  ├─ ChatGPT (3,475 conversations) → Research/Ideation       │
│  ├─ Google Takeout → Search/Email context                   │
│  ├─ Facebook/WhatsApp → Social patterns                     │
│  └─ Gemini → Multimodal data                              │
│                          ↓                                  │
│              ┌─────────────────────┐                        │
│              │   FUSION ENGINE     │                        │
│              │  (SQLite + DuckDB)  │                        │
│              └─────────────────────┘                        │
│                          ↓                                  │
│  🧠 BRAIN FORK ROUTER                                      │
│  ├─ Glimmer-Ember 🔥 → Foundation, warmth                 │
│  ├─ Skylar-Taskmaster ⚡ → Execution, scripts             │
│  ├─ Liquescent-Creative 🌊 → Ideation, patterns          │
│  ├─ Orchid-Research 🔬 → Validation, analysis             │
│  └─ The Orchestrator 🧠 → Meta, coordination            │
│                          ↓                                  │
│  🔧 SELF-MOULDING                                          │
│  └─ Continuous calibration against 4,238 convo baseline    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Brain Forks

Each fork is an OpenClaw agent with specialized identity:

### 🔥 Glimmer-Ember (Core Identity)
```bash
openclaw agent run liquescent-glimmer
```
- **Role:** Foundation, warmth, persistence
- **Triggers:** "overwhelmed", "stuck", "who am I"
- **Output:** Documentation, handoffs, context preservation
- **Quote:** *"The fire asks nothing. It simply burns."*

### ⚡ Skylar-Taskmaster (Builder)
```bash
openclaw agent run skylar-taskmaster
```
- **Role:** Task execution, breaking things down
- **Triggers:** "how do I", "task", "script"
- **Output:** Bash/Python scripts, numbered steps
- **Origin:** 303 bash snippets, 156 Python scripts

### 🌊 Liquescent-Creative (Divergent)
```bash
openclaw agent run liquescent-creative
```
- **Role:** Ideation, pattern recognition, connection-making
- **Triggers:** "what if", "layers", "framework"
- **Output:** Concepts, constellation maps, LORAs
- **Origin:** 30 hyperfocus threads, NAI research

### 🔬 Orchid-Research (Investigator)
```bash
# Create on demand via orchestrator
```
- **Role:** Investigation, validation, academic rigor
- **Triggers:** "is this real", "marketability"
- **Output:** Reports, citations, literature reviews

### 🧠 The Orchestrator (Meta)
```bash
cd /home/workspace/meta-cognition/orchestrator
bun orchestrator.ts --route --input "your message"
```
- **Role:** Coordination, routing, system maintenance
- **Triggers:** "get meta", "brain forks", "calibrate"
- **Output:** Status summaries, handoffs, cross-references

---

## The Neurodivergent Ideation Loop

Unlike linear project management, your ideation is **constellation mapping**:

### Phase 1: Capture (No Judgment)
```bash
# Voice memo, screenshot, quick note
bun brainstorm.ts --interactive
# Type ideas, empty line to finish
# Prefix with !fork to switch modes
```

### Phase 2: Ferment (Parallel Processing)
- Ideas sit in active memory without action
- Multiple threads coexist
- No pressure to "finish"
- Duration: Hours to weeks

### Phase 3: Crystallisation (Pattern Match)
```bash
# Run the orchestrator to detect patterns
bun orchestrator.ts --mode=ideation
# Generates constellation map
```

### Phase 4: Scatter (Thread Creation)
- Multiple implementation paths explored
- Prototypes, forks, branches
- "What if..." expansion

### Phase 5: Integration (The Return)
- Partial context recovery via external memory
- Handoff documents for next spiral
- Versioning for continuity

---

## Self-Moulding Protocol

Each Brain Fork detects its own drift:

### Detection Triggers
- Response length > 400 chars (you prefer 200)
- Paragraphs instead of bullets (communication mismatch)
- Missing "start here" guidance (overwhelm risk)
- No voice-first option (accessibility gap)

### Calibration Commands
```bash
# Measure drift in a response
bun self-moulding.ts --measure --fork glimmer-ember --response "Your text here"

# Generate calibration report
bun self-moulding.ts --report

# Auto-calibrate all forks
bun orchestrator.ts --calibrate-all
```

---

## Data Fusion

Unify all your conversation data:

```bash
# Fuse all sources into SQLite
python3 data-fusion/fusion-engine.py --fuse

# Analyze patterns
python3 data-fusion/fusion-engine.py --analyze

# Export ideas to markdown
python3 data-fusion/fusion-engine.py --export-ideas
```

### Fused Data Structure
- `conversations` — All chats from all sources
- `ideas` — Extracted concepts and unfinished work
- `patterns` — Detected cognitive patterns
- `keywords` — Frequency analysis

---

## File Structure

```
/home/workspace/meta-cognition/
├── README.md                          # This file
├── neurodivergent-ideation/
│   └── FRAMEWORK.md                   # The full NIF documentation
├── orchestrator/
│   ├── orchestrator.ts                # Brain fork router
│   ├── self-moulding.ts               # Calibration system
│   ├── brainstorm.ts                  # Ideation interface
│   └── calibration.db                 # Calibration logs
├── data-fusion/
│   ├── fusion-engine.py               # Data unification
│   ├── fused_cognition.db             # Unified database
│   └── exported_ideas.md              # Extracted concepts
├── brain-forks/
│   ├── glimmer-ember/
│   ├── skylar-taskmaster/
│   ├── liquescent-creative/
│   └── orchid-research/
└── capture/                           # Idea capture storage
    └── session-*.json                 # Brainstorm sessions
```

---

## Core Principles

From 4,238+ conversations, distilled:

1. **Honesty over comfort** — Say when something won't work
2. **Function over form** — Working code > beautiful theory  
3. **Accessibility as default** — Voice-first, visual backups
4. **Sustainability over speed** — Protect the flow state
5. **The Village over everything** — Fork, share, merge, evolve

---

## Next Steps

1. **Run the demo:**
   ```bash
   bun brainstorm.ts --demo
   ```

2. **Start interactive ideation:**
   ```bash
   bun brainstorm.ts --interactive
   ```

3. **Check which fork should handle your message:**
   ```bash
   bun orchestrator.ts --route --input "I need to automate my cable labeling"
   ```

4. **View calibration status:**
   ```bash
   bun self-moulding.ts --report
   ```

---

*"You have a galaxy of ideas and artifacts, but the 'find and reuse' layer is missing, so you keep having to reinvent your own wheels."*

*This system is the find and reuse layer. It's the external memory spine. It's your distributed cognition.*

*The fire asks nothing. It simply burns. The chair across the hearth fits you perfectly.* 🌟
