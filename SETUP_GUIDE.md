# Glimmer Agent — Complete Setup Guide

## ✅ What's Already Installed

| Component | Location | Status |
|-----------|----------|--------|
| **Agent Identity** | `/root/.openclaw/agents/glimmer-adhd/IDENTITY.md` | ✅ Ready |
| **Skills (3 tools)** | `/root/.openclaw/agents/skills/adhd-tools/` | ✅ Ready |
| **OpenClaw Config** | `~/.openclaw/openclaw.json` | ✅ Registered |
| **Git Repo** | `https://github.com/liquescentremedies/glimmer-adhd-system` | ✅ Pushed |

---

## 🔑 Step 1: Get API Keys

### Option A: HuggingFace (Free, Recommended)

1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create new token with `read` scope
3. Copy token (starts with `hf_...`)

### Option B: Anthropic (Claude)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Copy key (starts with `sk-ant-...`)

### Option C: OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy key (starts with `sk-...`)

---

## ⚙️ Step 2: Configure OpenClaw

```bash
# Set the API key
openclaw config set models.providers.huggingface.apiKey "YOUR_HF_KEY"

# Or for Anthropic
openclaw config set models.providers.anthropic.apiKey "YOUR_ANTHROPIC_KEY"

# Or for OpenAI
openclaw config set models.providers.openai.apiKey "YOUR_OPENAI_KEY"

# Set default model
openclaw config set models.defaults.chat "huggingface/moonshotai/kimi-k2.5"
```

---

## 🧠 Step 3: Test the Agent

```bash
# Quick test
openclaw agent --agent glimmer-adhd --message "organise my photos" --thinking minimal

# With energy level context
openclaw agent --agent glimmer-adhd --message "plan my week" --thinking low

# Deep session (more context-aware)
openclaw agent --agent glimmer-adhd --message "I'm overwhelmed" --thinking high
```

---

## 🛠️ Available Tools (Once Running)

### 1. Task Breakdown
```bash
# Via agent
"break down: organise my photos"

# Direct skill (if configured)
openclaw skill run adhd-tools task-breakdown "organise my photos" --energy 2
```

### 2. Energy Track
```bash
# Via agent
"track my energy"

# Log manually
openclaw skill run adhd-tools energy-track --level 2 --state scattered
```

### 3. Hyperfocus Guard
```bash
# Via agent
"enter hyperfocus on coding project"

# Start session
openclaw skill run adhd-tools hyperfocus-guard "coding" --duration 90 --checkpoint 20
```

---

## 🔧 Troubleshooting

### "Invalid username or password"
- API key expired or wrong
- Re-run `openclaw config set` with fresh key
- Check `openclaw doctor` for config issues

### "Agent not found"
- Verify agent ID: `openclaw agents list`
- Check config: `jq '.agents.list[].id' ~/.openclaw/openclaw.json`

### "Skill not available"
- Verify skill path: `ls ~/.openclaw/agents/skills/`
- Check skill is linked to agent in config

---

## 📊 Verification Checklist

Run these to verify everything works:

```bash
# 1. Check agent loads
openclaw agents list | grep glimmer-adhd

# 2. Check identity readable
cat ~/.openclaw/agents/glimmer-adhd/IDENTITY.md

# 3. Check skills exist
ls ~/.openclaw/agents/skills/adhd-tools/scripts/

# 4. Test with minimal thinking (no API cost)
openclaw agent --agent glimmer-adhd --message "hello" --thinking off

# 5. Full test (requires API key)
openclaw agent --agent glimmer-adhd --message "help me plan my day"
```

---

## 🌐 Web Interface (Bonus)

Your visual cosmos is live:
- **Dense constellation**: `https://liquescentremedies.zo.space/idea-cosmos`
- **Fast version**: `https://liquescentremedies.zo.space/meta-cognition/fast-cosmos.html`

---

## 📝 Quick Reference Card

| You Say | Glimmer Does |
|---------|--------------|
| "task" | Breaks it down |
| "plan" | Creates structured plan |
| "overwhelm" | Reduces, simplifies |
| "energy" | Logs state, suggests actions |
| "hyperfocus" | Sets up guard rails |
| "remember" | Captures to external memory |
| "scattered" | Helps focus, prioritises |

---

*The fire asks nothing. It simply burns.* 🔥
*The chair across the hearth fits you perfectly.* 🪑