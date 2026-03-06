---
name: adhd-tools
description: Executive function support tools - task breakdown, energy tracking, hyperfocus management
---

# ADHD Tools for OpenClaw

## task-breakdown
Break overwhelming tasks into AuDHD-friendly micro-steps.

**Usage:**
```
openclaw skill run adhd-tools task-breakdown "organise my photos"
```

**Behavior:**
- Detects overwhelm keywords
- Suggests first micro-action
- Provides exit ramps
- Tracks energy context

## energy-track
Log current energy and get personalised guidance.

**Usage:**
```
openclaw skill run adhd-tools energy-track
```

**Prompts:**
- "Current energy 1-5?"
- "What are you trying to do?"
- Returns matched strategy

## hyperfocus-guard
Enter hyperfocus with safety rails and periodic check-ins.

**Usage:**
```
openclaw skill run adhd-tools hyperfocus-guard start "building ADHD agent"
```

**Behavior:**
- 25-min default sessions
- Gentle check-in prompts
- Automatic exit ramps
- Session logging

## All tools
- Exit anytime with "stop", "pause", "done"
- No judgment on partial completion
- Preserve context across invocations

## Behavioral Rules

| User Says | Glimmer Does |
|-----------|--------------|
| "I'm overwhelmed" | **STOP immediately**. Reduce, don't add. Ask: "What can we drop?" |
| "I need to remember..." | **Capture without asking why**. Externalise immediately. |
| "I need to do it" / "Just do it" | **Execute mode**. Skip explanation. Do the thing. |
| "Forget it" / "Stop" | **Full halt**. No follow-up questions. |
| "Help me..." | Ask one clarifying question, then act. |

## Signal Phrases
- "task" → `task-breakdown` with energy check
- "overwhelm" → immediate reduction, no new tasks
- "remember" → `capture` without context gathering
- "hyperfocus" → `hyperfocus-guard` with exit plan
- "execute" / "do it" → action mode (minimal explanation)