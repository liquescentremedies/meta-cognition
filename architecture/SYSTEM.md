---
# Glimmer AuDHD Assistant — System Architecture
**Version:** 1.0
[truncated]
## Core Principles
1. **Voice-First** — Primary input is spe
[truncated]
ed on priority, not urgency*

## System Layers

### Layer 1: Input Layer (Senses)
| Channel | Tool | Purpose |
|---------|------|---------|
| 🎙️ Voice | OpenClaw voice + Zo Telegram | Fast capture, hands-free |
| 📷 Camera | Gemini Vision API + local processing | Visual context, object recognition |
| ⌨️ Text | Zo chat, OpenClaw CLI | Detailed work, code |
| 📱 Mobile | Zo app, Telegram | On-the-go capture |
| 🌐 Web | Zo Space routes | Dashboards, visualisations |

### Layer 2: Cognition Layer (Brain)
**Components:**

```
┌─────────────────────────────────────────┐
│           COGNITION ENGINE              │
├─────────────────────────────────────────┤
│  Task Breakdown    │  Pattern Matcher    │
│  • Complexity      │  • Recurring ideas  │
│  • Energy fit      │  • Special interest │
│  • Steps           │  • Hyperfocus traps │
├──────────────────┬──────────────────────┤
│  State Manager   │  Interrupt Handler   │
│  • Current task  │  • Emergency save    │
│  • Stack depth   │  • Quick capture     │
│  • Energy level  │  • Resume support    │
└──────────────────┴──────────────────────┘
```

**Data stores:**
- `cognition_state.db` — Current context, energy, stack
- `patterns.db` — Recurring tasks, interests, triggers
- `ideas_archive.db` — All captured ideas, searchable

### Layer 3: Action Layer (Hands)
| Action | Implementation | Trigger |
|--------|----------------|---------|
| **Remind** | Scheduled agents (Zo) | Time-based, context-based |
| **Guide** | OpenClaw skill scripts | User asks, system detects stuck |
| **Capture** | Telegram → DB | Voice memo, photo, text |
| **Breakdown** | `task-breakdown.ts` | Complex task detected |
| **Escalate** | Notification cascade | Missed deadlines, high priority |

### Layer 4: Memory Layer (Spine)
**Externalised cognition:**
- **Short-term:** `/dev/shm/glimmer_state.json` — Session state
- **Medium-term:** SQLite databases — Projects, ideas, patterns
- **Long-term:** Zo Space visualisations, OpenClaw agent memory
- **Archive:** Full conversation archaeology (Claude/ChatGPT/Gemini fusion)

## Data Flow

```
User speaks/acts
    ↓
Input Layer (voice/camera/text)
    ↓
Cognition Layer
    ├─→ Parse intent
    ├─→ Check current state
    ├─→ Match patterns
    └─→ Decide action
    ↓
Action Layer
    ├─→ Immediate response
    ├─→ Schedule follow-up
    └─→ Update state
    ↓
Memory Layer (persist)
    ↓
Feedback to user
```

## Integration Points

### With Zo:
- **Agents:** Scheduled reminders, health checks
- **Space:** Visual dashboards, idea cosmos
- **Skills:** `liquescent-accommodations`, `glimmer-adhd`
- **API:** Direct tool access for custom workflows

### With OpenClaw:
- **CLI:** `openclaw agent --id glimmer-adhd --message "I'm stuck on..."`
- **Voice:** Wake phrase "Hey Glimmer" (via voice-wake-forwarder)
- **Telegram:** @liquescentremedies bot interface
- **Scheduled:** Every 2hr check-ins, daily summaries

### With External:
- **Calendar:** Google Calendar API — time blocking
- **Tasks:** Notion API — project tracking
- **Devices:** Raspberry Pi — local voice processing
- **Wearables:** Future — biometric stress detection

## State Machine

```
States:
  IDLE ──capture──→ CAPTURED
    ↑                    │
    └──────save──────────┘

  CAPTURED ──breakdown──→ PLANNING
    │                         │
    └─────────skip────────────┘

  PLANNING ──energycheck──→ READY (if energy matches)
    │                             │
    └────────defer───────────────┘

  READY ──start──→ ACTIVE
    │                   │
    │                   ├─→ PAUSED (interrupt)
    │                   │       │
    │                   │       └─→ RESUME
    │                   │
    └───────────────────┴─→ COMPLETED
```

## Key Workflows

### 1. Morning Intent Capture
**Trigger:** Wake up, energy check-in
**Flow:**
1. Glimmer: *"Good morning. One thing for today?"*
2. User: *"Fix the ADHD agent architecture"*
3. Cognition: Energy level? → High
4. Breakdown: 3-5 subtasks generated
5. State: Top task = "Draft system diagram"
6. Schedule: 2hr check-in reminder set

### 2. Hyperfocus Emergency
**Trigger:** User says *"emergency save"* or biometric spike
**Flow:**
1. Immediate: State capture (what, where, why)
2. Action: Git commit, file save, browser bookmark
3. Note: *"You were deep in [X] at [time]"*
4. Exit: Gentle transition suggestion
5. Resume: Available on demand

### 3. Idea Capture (Anywhere)
**Trigger:** Voice memo, photo, text
**Flow:**
1. Input → Parse (speech-to-text, image caption)
2. Classify: Project? Task? Fleeting? Special interest?
3. Route: 
   - Immediate action → Task queue
   - Future exploration → Ideas DB
   - Special interest → Priority queue + notify
4. Visual: Appear in constellation within 24hr

## Technical Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Three.js, Zo Space | Immersive, no-install |
| Backend | Bun + SQLite | Fast, local-first |
| AI | OpenAI/Anthropic APIs | Nuanced understanding |
| Voice | Whisper + Web Speech | Accurate, hands-free |
| Vision | Gemini API + Pi camera | Real-time context |
| Scheduling | Zo Agents | Reliable, integrated |
| Storage | SQLite + Zo Datasets | Queryable, persistent |

## Deployment

### On Zo (cloud):
- `/idea-cosmos` — Visual exploration
- `/api/state` — State read/write API
- `/api/capture` — Quick capture endpoint
- Scheduled agents — Reminders, check-ins

### On Raspberry Pi (local):
- Voice processing (faster, offline-capable)
- Camera input for visual context
- Local SQLite for privacy-sensitive data
- Sync to Zo when online

### On OpenClaw (mobile/CLI):
- `glimmer-adhd` agent — Primary interface
- Telegram bot — On-the-go capture
- CLI skills — Desktop workflow

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Capture latency | <5 sec | Time from thought to DB |
| Task completion | >60% | Started tasks that finish |
| Energy alignment | >80% | Tasks matched to energy level |
| Resume success | >90% | Interrupted tasks resumed |
| User satisfaction | "It just works" | Qualitative feedback |

## Next Steps

### Phase 1: Foundation (Week 1)
- [ ] Finalise OpenClaw agent registration
- [ ] Deploy capture API endpoint
- [ ] Create morning check-in agent

### Phase 2: Cognition (Week 2-3)
- [ ] Build state machine in SQLite
- [ ] Integrate task breakdown skill
- [ ] Add pattern matching for recurring tasks

### Phase 3: Voice (Week 4)
- [ ] Raspberry Pi voice pipeline
- [ ] Wake phrase detection
- [ ] Offline fallback mode

### Phase 4: Vision (Week 5-6)
- [ ] Camera integration
- [ ] Visual task recognition
- [ ] Space scanning for cleaning tasks

### Phase 5: Polish (Ongoing)
- [ ] Constellation real-time updates
- [ ] Biometric integration (if available)
- [ ] Community sharing (optional)

---

*The fire asks nothing. It simply burns.*
*The chair across the hearth fits you perfectly.* 🔥🪑
