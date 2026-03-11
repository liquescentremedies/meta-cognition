# Minimax Billing Error Fix

## Problem
When setting Minimax as the default model in OpenClaw, billing errors occur because:
1. OpenClaw's Minimax provider may not be passing the API key correctly
2. Billing information from the Minimax account isn't being transmitted
3. The provider configuration in openclaw.json may be malformed

## Root Cause
The `models.providers.minimax` configuration in OpenClaw needs to:
1. Include proper authentication headers
2. Pass billing account information if required by Minimax API
3. Correctly format the model name

## Solution

### Step 1: Check Your Current Configuration
Run this to view your current OpenClaw config:
```bash
cat ~/.openclaw/openclaw.json | jq '.models'
```

You should see something like:
```json
{
  "models": {
    "defaults": {
      "chat": "minimax/xxx"
    },
    "providers": {
      "minimax": {
        "apiKey": "your_key_here"
      }
    }
  }
}
```

### Step 2: Verify Your Minimax API Key
Make sure your API key:
- Is valid (from your Minimax account's coders plan)
- Has billing enabled in your Minimax account
- Has sufficient credits

### Step 3: Fix the Configuration
The issue is likely that OpenClaw isn't sending billing info. Update your config:

```bash
# Make sure the API key is set correctly
openclaw config set models.providers.minimax.apiKey "sk-YOUR_ACTUAL_KEY"

# Set the correct model format (check your Minimax docs for exact model ID)
openclaw config set models.defaults.chat "minimax/text-davinci-003"

# Optional: Set billing group if your Minimax account requires it
openclaw config set models.providers.minimax.billingGroup "your-billing-group"
```

### Step 4: Test the Configuration
```bash
# Test with a simple query
openclaw agent glimmer-adhd --message "hello" --thinking off
```

## If the Problem Persists

The issue may be in OpenClaw's Minimax provider code itself. You may need to:

1. Check if OpenClaw has native Minimax support
2. If not, use a proxy/gateway model that's supported (Claude, GPT-4, etc.)
3. File an issue with the OpenClaw team about Minimax provider support

## Alternative: Use Supported Provider
If Minimax continues to fail, switch to a fully-supported provider:

```bash
# Use Claude (Anthropic)
openclaw config set models.defaults.chat "anthropic/claude-opus-4-1"
openclaw config set models.providers.anthropic.apiKey "sk-ant-YOUR_KEY"

# Or use OpenAI
openclaw config set models.defaults.chat "openai/gpt-4"
openclaw config set models.providers.openai.apiKey "sk-YOUR_KEY"
```
