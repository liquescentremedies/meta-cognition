# Glimmer-OpenClaw Integration

## Architecture

```
[User] → [Glimmer Agent] → [Skill Router] → [Tool Execution]
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
[Task-Breakd
[truncated]
 [Energy-Track]  [Hyperfocus-Guard]
```

## Trigger Mapping

| User Says | Glimmer Action | Tool Invoked |
|-----------|---------------|--------------|
| "I need to..." / task description | Break down with energy check | `task-breakdown.ts` |
| "I'm at energy X" / "feeling..." | Log energy state | `energy-track.ts log N` |
| "Going into hyperfocus on..." | Start protected session | `hyperfocus-guard.ts start 'topic'` |
| "How long have I been..." | Check session status | `hyperfocus-guard.ts status` |
| "I need to remember..." | **Externalise immediately** — capture without asking why |
| "I'm overwhelmed" | **STOP** — reduce scope, don't add |

## Direct CLI Usage (No Agent)

```bash
# Task breakdown
cd ~/.openclaw/agents/skills/adhd-tools
bun scripts/task-breakdown.ts 'your task' --energy 3

# Energy logging
bun scripts/energy-track.ts log 3 "after lunch"
bun scripts/energy-track.ts view

# Hyperfocus session
bun scripts/hyperfocus-guard.ts start 'coding'
bun scripts/hyperfocus-guard.ts status
bun scripts/hyperfocus-guard.ts exit
```

## Agent Mode Usage (With OpenClaw)

```bash
# Via OpenClaw gateway (when API keys fresh)
openclaw agent glimmer-adhd --local --message "break down: organise my desk" --thinking off

# Or via direct identity load
openclaw message send --agent glimmer-adhd "I'm at energy 2, help me prioritise"
```

## State Files

All tools write to `~/.glimmer-state/`:
- `energy.jsonl` — Energy log
- `tasks/` — Task breakdowns
- `hyperfocus/` — Session states

## Integration Status

| Component | Status | Location |
|-----------|--------|----------|
| Glimmer Agent | ✅ Configured | `~/.openclaw/agents/glimmer-adhd/` |
| adhd-tools Skill | ✅ Installed | `~/.openclaw/agents/skills/adhd-tools/` |
| task-breakdown | ✅ Working | `scripts/task-breakdown.ts` |
| energy-track | ✅ Working | `scripts/energy-track.ts` |
| hyperfocus-guard | ✅ Working | `scripts/hyperfocus-guard.ts` |
| API Keys | ⚠️ Needs refresh | `~/.openclaw/openclaw.json` |
| Gateway | ⚠️ Not running | Needs `openclaw gateway run` |

## Next Steps

1. **Refresh API keys** in `~/.openclaw/openclaw.json` (anthropic/openai)
2. **Start gateway**: `openclaw gateway run --bind loopback --port 18789`
3. **Test full flow**: `openclaw agent glimmer-adhd --message "test"`

---

*The fire asks nothing. It simply burns.* 🔥