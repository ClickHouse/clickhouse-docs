---
sidebar_label: 'Quickstart'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: 'Quickstart'
description: 'Build and run your first ClickHouse Agent against a ClickHouse Cloud service'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'quickstart', 'agent builder']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import agentBuilder from '@site/static/images/cloud/agent-builder/agent-builder.png';
import capabilities from '@site/static/images/cloud/agent-builder/capabilities.png';
import toolsButton from '@site/static/images/cloud/agent-builder/tools-button.png';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';
import chatQuery from '@site/static/images/cloud/agent-builder/chat-query.png';
import launchAgents from '@site/static/images/cloud/agent-builder/launch-ch-agents.png';

<BetaBadge/>

Build a custom agent in the Cloud console and run a natural-language query against your service.

## Prerequisites {#prerequisites}

- A ClickHouse Cloud service you can query.
- The **Create agent** option in the Agent Builder. If it's missing, ask an org admin to grant agent creation via Admin Settings as detailed in [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access).

## Build the agent {#build-the-agent}

<VerticalStepper headerLevel="h3">

### Launch ClickHouse Agents {#launch-agents}

From your Cloud service, click **ClickHouse agents** in the left sidebar to open the agents launchpad. Click **Launch ClickHouse agents** to open the Agent Builder.

<Image img={launchAgents} alt="Cloud service navigation with ClickHouse agents (Beta) selected, showing the launchpad with the Launch ClickHouse agents button" size="lg" />

### Create the agent {#create-the-agent}

In the Agent Builder, click **Create New Agent** at the top of the left panel. Fill in the core fields:

- **Name** — a short identifier.
- **Description** — one line so teammates know what the agent is for.
- **Category** — leave as `General` unless your org has custom categories.
- **Instructions** — the system prompt. Describe the agent's role, the questions it should answer, and any business rules it must follow.
- **Model** — pick a model from the dropdown. Tune temperature and other generation settings in [model parameters](/cloud/features/ai-ml/agents/builder/model-parameters).

<Image img={agentBuilder} alt="Agent Builder panel showing the Create New Agent dropdown, the form fields (Name, Description, Category, Instructions, Model), and the Capabilities section" size="lg" />

### Attach capabilities and tools {#attach-tools}

The agent's capabilities and tools live in two places.

**Capabilities** in the main panel — first-party features like [Run Code](/cloud/features/ai-ml/agents/builder/code-interpreter), [Web Search](/cloud/features/ai-ml/agents/builder/web-search), File Context, Artifacts, [MCP Servers](/cloud/features/ai-ml/agents/builder/mcp-servers), and [Skills](/cloud/features/ai-ml/agents/builder/skills). Toggle the ones the agent needs.

<Image img={capabilities} alt="Capabilities section of the Agent Builder panel showing Run Code, Web Search, File Context, Artifacts, MCP Servers, and Skills toggles" size="sm" />

**Tools** behind the **Add Tools** button at the bottom of the panel — third-party integrations like [image generation](/cloud/features/ai-ml/agents/builder/image-generation), [vision](/cloud/features/ai-ml/agents/builder/vision), search APIs, and external services.

<Image img={toolsButton} alt="Bottom of the Agent Builder panel with the Add Tools button highlighted" size="sm"/>

Click **Add Tools** to browse the catalog:

<Image img={toolsModal} alt="Agent Tools modal showing a grid of third-party integrations including Google, OpenAI Image Tools, Wolfram, DALL-E-3, Tavily Search, Calculator, and Stable Diffusion" size="lg"/>

[Subagents](/cloud/features/ai-ml/agents/builder/subagents) are configured under **Advanced settings** — see the subagents page for details.

You can change attached capabilities and tools any time.

### Run a query {#run-a-query}

Save the agent, open a new conversation, and select your agent from the agent picker. Type a question — for example, *"What are my top 10 tables by row count this week?"* — and the agent plans, calls tools as needed, and returns an answer.

<Image img={chatQuery} alt="Chat exchange showing the question 'What are my top 10 tables by row count this week?' and the agent's response — a Markdown table ranking the top 10 tables across services by row count, with Key Observations below" size="lg" />

</VerticalStepper>

## Next steps {#next-steps}

- [Share the agent](/cloud/features/ai-ml/agents/sharing-and-access) with teammates.
- Publish to the [marketplace](/cloud/features/ai-ml/agents/marketplace) once the agent is stable.
