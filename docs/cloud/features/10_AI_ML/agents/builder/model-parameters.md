---
sidebar_label: 'Model parameters'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/builder/model-parameters
title: 'Model parameters'
description: 'Configure model selection and generation parameters for ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'model parameters', 'temperature', 'top-p', 'top-k', 'thinking', 'prompt caching']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Model parameters control which model an agent uses and how that model generates responses. Configure them in the Agent Builder's **Model Parameters** panel.

## Provider and model {#provider-and-model}

- **Provider** — the upstream LLM provider.
- **Model** — the specific model from that provider. Different models have different strengths: large reasoning models for planning-heavy tasks, faster small models for routine queries.

Provider and model are required. The rest of the panel adapts based on what the selected model supports.

## Context and output limits {#context-and-output-limits}

- **Max Context Tokens** — caps total context the agent sends to the model. Leave as **System** to use the model's default. Lower it to reduce cost; raise it for agents that need to reason over large inputs.
- **Max Output Tokens** — caps the size of the agent's response. **System** uses the model's default. Set lower if responses are too long, higher if they're being cut off.
- **File Token Limit** — caps how many tokens a single uploaded file contributes to context. Useful when users attach large files and you don't want them to crowd out the rest of the conversation.

## Sampling {#sampling}

- **Temperature** — randomness. Higher values (0.7–1.0) = more random, while lower values (0.0–0.3) = more focused and deterministic. We recommend altering this or Top P but not both.
- **Top P** — nucleus sampling. Changes how the model selects tokens for output.
- **Top K** — restricts sampling to the top K most likely tokens at each step. Supported by some providers; controls determinism along a different axis than temperature.

If you're not tuning for a specific behavior, leave the sliders near their defaults — small changes here rarely move the needle and large ones can degrade output quality.

## Reasoning controls {#reasoning-controls}

Available on models that expose extended reasoning. The exact set varies by provider.

- **Thinking** — toggles the model's extended reasoning mode. When on, the model produces internal thinking tokens before its final answer; this usually improves accuracy on hard tasks at the cost of latency and tokens.
- **Thinking Budget** — token budget for the thinking phase. The model stops thinking and answers once it has spent this many tokens.
- **Effort** — high-level reasoning effort dial (**Auto**, low, medium, high). Used by reasoning models that don't expose a thinking-token budget directly.
- **Thought Visibility** — controls whether the model's thinking is shown to the user inline, hidden behind a collapsed view, or omitted entirely.

## Conversation behavior {#conversation-behavior}

- **Resend Files** — when on, files attached in earlier turns are re-sent on every subsequent turn so the model doesn't lose track of them. Turn off to save tokens if the conversation is short or the model is summarizing files as it goes.
- **Use Prompt Caching** — when supported by the provider, caches reusable parts of the prompt to reduce cost and latency on conversations where instructions and tool descriptions repeat across turns.
- **Web Search** — toggles provider-native web search on supported models. This is distinct from the [Web search tool](/cloud/features/ai-ml/agents/builder/web-search), which runs as one of the agent's tools rather than as a provider capability.

## Reset {#reset}

**Reset Model Parameters** at the bottom of the panel restores every field to system defaults. Use it when you've experimented enough to want a clean starting point.
