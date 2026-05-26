---
sidebar_label: 'Overview'
slug: /cloud/features/ai-ml/agents/builder
title: 'Agent Builder'
description: 'Create and configure ClickHouse Agents in the Agent Builder'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'agent builder', 'tools', 'instructions']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

The Agent Builder is where you create and configure agents. It opens as a side panel in the Cloud console.

The panel has three sections:

- **Identity** at the top — name, description, avatar, and the instructions field (the system prompt).
- **Model configuration** in the middle — provider, model, and generation parameters.
- **Capabilities** at the bottom — the tools, MCP servers, skills, and subagents you attach.

Save from the footer button. Edits take effect on the next conversation; in-flight runs aren't interrupted.

## Identity {#identity}

The instructions field is the agent's system prompt. Describe the role, the kinds of questions it should answer, and any rules it must follow. Be specific about schema conventions, calculated metrics, and terminology if the agent will query your ClickHouse service — the model can't infer your business definitions on its own.

## Core configuration {#core-configuration}

- [Model parameters](/cloud/features/ai-ml/agents/builder/model-parameters) — Pick a model and tune generation parameters. Save a configuration as a named preset to reuse it.

## Built-in tools {#built-in-tools}

- [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — Sandboxed code execution.
- [Web search](/cloud/features/ai-ml/agents/builder/web-search) — Public-web lookups.
- [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) — Generate images from text.
- [Vision](/cloud/features/ai-ml/agents/builder/vision) — Accept image inputs.

## Extensibility {#extensibility}

- [MCP servers](/cloud/features/ai-ml/agents/builder/mcp-servers) — Attach third-party MCP servers to an agent.
- [Skills](/cloud/features/ai-ml/agents/builder/skills) — Reusable instruction packs.
- [Subagents](/cloud/features/ai-ml/agents/builder/subagents) — Delegate work to child agents.
