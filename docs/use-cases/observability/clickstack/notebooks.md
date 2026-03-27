---
slug: /use-cases/observability/clickstack/notebooks
title: 'AI Notebooks with ClickStack'
sidebar_label: 'AI Notebooks'
pagination_prev: null
pagination_next: null
description: 'AI-powered investigation notebooks for ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import notebook_hero from '@site/static/images/use-cases/observability/hyperdx-notebook-hero.png';
import notebook_list from '@site/static/images/use-cases/observability/hyperdx-notebook-list.png';
import notebook_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-tiles.png';
import notebook_branching from '@site/static/images/use-cases/observability/hyperdx-notebook-branching.png';
import notebook_branch_modal from '@site/static/images/use-cases/observability/hyperdx-notebook-branch-modal.png';
import notebook_manual_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-manual-tiles.png';
import notebook_agent_context from '@site/static/images/use-cases/observability/hyperdx-notebook-agent-context.png';
import notebook_ai_consent from '@site/static/images/use-cases/observability/hyperdx-notebook-ai-consent.png';

<PrivatePreviewBadge/>

AI Notebooks are an interactive investigation tool in HyperDX that combines an AI agent with manual analysis. Engineers can describe an issue in plain language, and the AI agent will query logs, traces, and metrics on their behalf — surfacing relevant data, charts, and summaries as a series of tiles. Users can also add their own tiles (charts, tables, searches, and markdown notes) alongside the AI-generated output, building a complete record of an investigation.

<Image img={notebook_hero} alt="AI Notebook investigating a Visa cache full outage" size="lg"/>

## Availability {#availability}

| Deployment                        | Supported | Notes                                                                                     |
| --------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| **ClickHouse Cloud (ClickStack)** | Yes       | AI API keys are managed by the platform. Users only need to enable the AI consent toggle. |
| **Enterprise Edition (EE)**       | Yes       | Requires manually configuring AI API keys via environment variables.                      |
| **Open Source (OSS)**             | No        | AI Notebooks are not available in the open source edition.                                |

## Prerequisites {#prerequisites}

Before using AI Notebooks, the following must be in place:

1. **AI API keys configured** — The HyperDX server must have access to a supported LLM provider (handled automatically in ClickHouse Cloud, manual in EE).
2. **Generative AI enabled** — A team admin must enable the Generative AI consent toggle. See [Enabling Generative AI](#enabling-generative-ai).
3. **Notebook access** — The user's role must have read/write permissions for Notebooks.

## Setup {#setup}

<Tabs groupId="deployment">
<TabItem value="chc" label="ClickHouse Cloud" default>

<PrivatePreviewBadge/>

AI Notebooks are currently in private preview in ClickHouse Cloud. AI API keys are automatically configured by the platform.

To enable AI Notebooks, follow the steps in [Enabling Generative AI](#enabling-generative-ai). Once enabled, the **Notebooks** entry appears in the left sidebar for all users with the appropriate role.

</TabItem>
<TabItem value="ee" label="Enterprise Edition">

Enterprise Edition deployments require configuring an AI provider via environment variables on the HyperDX server.

**Variables**

| Variable                       | Required | Description                                                                                                                |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `AI_API_KEY`                   | Yes      | API key for the configured provider.                                                                                       |
| `AI_PROVIDER`                  | Yes      | LLM provider to use. Example values: `anthropic`, `openai`.                                                                |
| `AI_MODEL_NAME`                | Yes      | Model identifier (e.g. `claude-sonnet-4-20250514` for Anthropic).                                                          |
| `AI_NOTEBOOK_ROLLOUT_STRATEGY` | No       | Controls notebook availability: `all` (enabled for every team), `off` (disabled globally), or omit to manage per-team.     |
| `USE_AWS_BEDROCK`              | No       | Set to `true` to use Amazon Bedrock instead of direct Anthropic API access, makes `AI_API_KEY` and `AI_PROVIDER` optional. |

**Minimal example** using Anthropic:

```shell
docker run \
  -e AI_PROVIDER='anthropic' \
  -e AI_API_KEY='sk-ant-...' \
  -e AI_MODEL_NAME='claude-sonnet-4-20250514' \
  -e AI_NOTEBOOK_ROLLOUT_STRATEGY='all' \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

After setting these variables and restarting the server, follow the steps in [Enabling Generative AI](#enabling-generative-ai). The **Notebooks** entry will then appear in the left sidebar.

</TabItem>
</Tabs>

## Enabling Generative AI {#enabling-generative-ai}

A team admin must enable the Generative AI consent toggle before notebooks (and other AI features) can be used.

1. Navigate to **Team Settings > Security Policies**.
2. Toggle **Generative AI** to on.
3. Review and accept the consent dialog.

<Image img={notebook_ai_consent} alt="Generative AI toggle in Team Settings" size="lg"/>

## Using AI Notebooks {#using-notebooks}

### Creating a notebook {#creating-a-notebook}

1. Select **Notebooks** from the left sidebar.
2. Click **New Private Notebook** (visible only to you) or **New Shared Notebook** (visible to your team).

The notebook list page shows all notebooks you have access to. You can filter by name, tags, or toggle between **My Notebooks** and **All Notebooks**.

<Image img={notebook_list} alt="Notebook list page" size="lg"/>

### Running an AI investigation {#running-investigation}

At the bottom of a notebook, enter a prompt describing what you want to investigate — for example, _"Why did error rates spike in the checkout service over the last hour?"_

Press **Send** (or hit Enter). The AI agent will:

1. Examine your available data sources.
2. Run search and aggregation queries against your logs, traces, and metrics.
3. Produce a series of tiles showing its thought process, the queries it ran, intermediate charts, and a final summary with conclusions.

Each step appears as a tile in the notebook. **Thought process** tiles show the reasoning behind each query, and **Output** tiles contain the agent's conclusions and optional charts. Unlike a standard AI chat, notebooks let you see exactly what data the AI is working with at each step — so you can verify its reasoning, spot interesting leads it may have overlooked, and [branch](#branching) the investigation to steer it in a different direction.

While an investigation is running, you can click **Stop** to cancel it.

<Image img={notebook_tiles} alt="Notebook with AI-generated tiles" size="lg"/>

### Branching an investigation {#branching}

As the AI investigates, you may notice an intermediate step that surfaces something interesting — but the agent continued down a different path. **Branching** lets you restart from that point with a different prompt, without losing the original investigation path.

To create a branch:

1. Expand a thought process tile and click **Restart from Here**.
2. In the dialog, enter a modified prompt that steers the investigation in the new direction.
3. Click **Interrupt & Create Branch**. The AI starts a new investigation branch from that point.

<Image img={notebook_branch_modal} alt="Create New Branch dialog" size="md"/>

Once a tile has multiple branches, left and right arrow buttons appear on the tile header with a badge (e.g. **1/2**) indicating how many branches exist. Click the arrows to switch between branches.

<Image img={notebook_branching} alt="Branch navigation arrows and 1/2 badge on a tile" size="lg"/>

### Adding manual tiles {#manual-tiles}

In addition to AI-generated tiles, you can add your own analysis blocks using the buttons at the bottom of the notebook:

| Button       | Shortcut | Description                                                                                                                     |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Search**   | `S`      | A log/trace search view, equivalent to the search page.                                                                         |
| **Chart**    | `L`      | A time series line chart, using the same visualization builder as [Dashboards](/use-cases/observability/clickstack/dashboards). |
| **Table**    | `T`      | A tabular aggregation view.                                                                                                     |
| **Markdown** | `M`      | Freeform text for notes, hypotheses, or conclusions.                                                                            |

After adding a tile, it opens in inline edit mode where you can configure the data source, filters, and aggregations — the same interface used when building [dashboard visualizations](/use-cases/observability/clickstack/dashboards#creating-visualizations). Click **Save** to finalize the tile.

Manual tiles are added below the last visible tile in the current branch. You can resize tiles vertically by dragging their bottom edge.

<Image img={notebook_manual_tiles} alt="Manual tile buttons at the bottom of a notebook" size="lg"/>

:::note
If an AI investigation is currently running, adding or editing a manual tile will cancel the investigation. A confirmation dialog will appear before proceeding.
:::

### Sharing and organizing {#sharing-organizing}

- **Private vs. Shared** — Toggle the lock icon in the notebook header to switch between private (only you) and shared (visible to the team). Only the notebook creator can change this setting.
- **Tags** — Add tags to notebooks for easy filtering on the list page.
- **Naming** — Click the notebook title to rename it. If you start an investigation on an untitled notebook, the AI will suggest a name automatically.

### Custom agent context {#custom-agent-context}

Team admins can provide additional context that is included in every AI notebook investigation for the team. This is useful for giving the AI background on your system architecture, naming conventions, or known issues.

To configure this:

1. Navigate to **Notebooks** from the left sidebar.
2. Open **Agent Settings** (available to team admins).
3. Enter your custom context (up to 50,000 characters) and save.

This context is appended to the AI's system prompt for all notebook investigations across the team.

<Image img={notebook_agent_context} alt="Agent Settings panel for custom context" size="lg"/>
