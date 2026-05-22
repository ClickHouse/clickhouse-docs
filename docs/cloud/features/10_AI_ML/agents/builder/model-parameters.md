---
sidebar_label: 'Model parameters'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/builder/model-parameters
title: 'Model parameters'
description: 'Configure model selection and generation parameters for ClickHouse Agents'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'model parameters', 'temperature', 'top-p', 'presets']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Model parameters control which model an agent uses and how that model generates responses. Configure them in the Agent Builder under the model section.

## Model selection

Pick a provider and model from the dropdown. Available models depend on the providers your organization has enabled. Different models have different strengths — large reasoning models for planning-heavy tasks, faster small models for routine queries.

## Generation parameters

The most common knobs:

- **Temperature** — randomness. Lower values (0.0–0.3) produce focused, deterministic output suited to SQL generation and structured analysis. Higher values (0.7–1.2) produce more varied text for ideation or copywriting.
- **Top-p** — nucleus sampling. Restricts token sampling to the smallest set whose cumulative probability is at least `p`. Leave at the model's default unless you have a reason.
- **Max output tokens** — caps the size of the agent's response. Set lower if responses are too long; raise if they're being cut off.
- **Context window** — total tokens the agent can hold in working memory. Bounded by the model's limit.

Provider-specific knobs (Anthropic, OpenAI, Bedrock, etc.) appear below the common ones when relevant.

## Presets

A preset bundles a model selection and its parameter values under a name so you can reapply the configuration to a new conversation in one click.

To create one, configure the model and parameters as you want them and click **Save as preset**. Name it descriptively — for example, *"Claude Sonnet, tight SQL"* or *"GPT-4, creative copy"*.

Apply a saved preset from the preset selector in the chat header. Mark one as the default to load it automatically on new conversations.

Presets are per-user. To share a configuration across a team, build it into an agent's saved configuration instead.
