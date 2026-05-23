---
sidebar_label: 'Quickstart'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: 'ClickHouse Agents Quickstart'
description: 'Build and run your first ClickHouse Agent against a ClickHouse Cloud service'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'quickstart', 'agent builder']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Build a custom agent in the Cloud console and run a natural-language query against your service.

## Prerequisites

- A ClickHouse Cloud service you can query.
- The **Create agent** option in the Agent Builder. If it's missing, ask an org admin to grant agent creation via Admin Settings as detailed in [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access).

## Create the agent

Open Agents from the Cloud console and click **Create agent** in the Agent Builder side panel. Fill in the core fields:

- **Name** — a short identifier.
- **Description** — one line so teammates know what the agent is for.
- **Instructions** — the system prompt. Describe the agent's role, the questions it should answer, and any business rules it must follow.
- **Model** — pick a model from the dropdown. Tune temperature and other generation settings in [model parameters](/cloud/features/ai-ml/agents/builder/model-parameters).

## Attach tools

Decide which capabilities the agent needs. From the Builder, you can add:

- [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — sandboxed code execution for computation and data transformation.
- [Web search](/cloud/features/ai-ml/agents/builder/web-search) — public-web lookups.
- [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) and [vision](/cloud/features/ai-ml/agents/builder/vision) — visual outputs and inputs.
- [MCP servers](/cloud/features/ai-ml/agents/builder/mcp-servers) — third-party tools over Model Context Protocol.
- [Skills](/cloud/features/ai-ml/agents/builder/skills) and [Subagents](/cloud/features/ai-ml/agents/builder/subagents) — reusable instruction packs and task delegation.

You can change attached tools any time.

## Run a query

Save the agent, open a new conversation, and select your agent from the agent picker. Type a question — for example, *"What are my top 10 tables by row count this week?"* — and the agent plans, calls tools as needed, and returns an answer.

## Next steps

- Add [AGENTS.md](/cloud/features/ai-ml/agents/semantic-layer) to inject business rules and schema conventions into every conversation against this service.
- [Share the agent](/cloud/features/ai-ml/agents/sharing-and-access) with teammates.
- Publish to the [marketplace](/cloud/features/ai-ml/agents/marketplace) once the agent is stable.
