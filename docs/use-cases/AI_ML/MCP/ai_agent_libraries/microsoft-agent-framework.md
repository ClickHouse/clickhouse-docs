---
slug: /use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework
sidebar_label: 'Integrate Microsoft Agent Framework'
title: 'How to build an AI Agent with Microsoft Agent Framework and the ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Learn how build an AI Agent with Microsoft Agent Framework and the ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Microsoft']
show_related_blogs: true
doc_type: 'guide'
---

# How to build an AI Agent with Microsoft Agent Framework and the ClickHouse MCP Server

In this guide you'll learn how to build a [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) AI agent that can interact with 
[ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Example notebook
This example can be found as a notebook in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
- You'll need to have `pip` installed on your system.
- You'll need an OpenAI API key

You can run the following steps either from your Python REPL or via script.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the Microsoft Agent Framework library by running the following commands:

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```

## Setup credentials {#setup-credentials}

Next, you'll need to provide your OpenAI API key:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

Next, define the credentials needed to connect to the ClickHouse SQL playground:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## Initialize MCP Server and Microsoft Agent Framework agent {#initialize-mcp-and-agent}

Now configure the ClickHouse MCP Server to point at the ClickHouse SQL playground 
and also initialize our agent and ask it a question:

```python
from agent_framework import ChatAgent, MCPStdioTool
from agent_framework.openai import OpenAIResponsesClient
```

```python
clickhouse_mcp_server = MCPStdioTool(
    name="clickhouse",
    command="uv",
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ],
    env=env
)


async with ChatAgent(
    chat_client=OpenAIResponsesClient(model_id="gpt-5-mini-2025-08-07"),
    name="HousePricesAgent",
    instructions="You are a helpful assistant that can help query a ClickHouse database",
    tools=clickhouse_mcp_server,
) as agent:
    query = "Tell me about UK property prices over the last five years"
    print(f"User: {query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

The output of running this script is shown below:

```response title="Response"
User: Tell me about UK property prices over the last five years
I looked at monthly UK sold-price records in the uk.uk_price_paid_simple_partitioned table for the last five years (toStartOfMonth(date), from Oct 2020 → Aug 2025). Summary and key points:

What I measured
- Metrics: monthly median price, mean price, and transaction count (price paid records).
- Period covered: months starting 2020-10-01 through 2025-08-01 (last five years from today).

High-level findings
- Median price rose from £255,000 (2020-10) to £294,500 (2025-08) — an increase of about +15.4% over five years.
  - Equivalent compound annual growth rate (CAGR) for the median ≈ +2.9% per year.
- Mean price fell slightly from about £376,538 (2020-10) to £364,653 (2025-08) — a decline of ≈ −3.2% over five years.
  - Mean-price CAGR ≈ −0.6% per year.
- The divergence (median up, mean slightly down) suggests changes in the mix of transactions (fewer very-high-value sales or other compositional effects), since the mean is sensitive to outliers while the median is not.

Notable patterns and events in the data
- Strong rises in 2020–2021 (visible in both median and mean), consistent with the post‑pandemic / stamp‑duty / demand-driven market surge seen in that period.
- Peaks in mean prices around mid‑2022 (mean values ~£440k), then a general softening through 2022–2023 and stabilisation around 2023–2024.
- Some months show large volatility or unusual counts (e.g., June 2021 and June 2021 had very high transaction counts; March 2025 shows a high median but April–May 2025 show lower counts). Recent months (mid‑2025) have much lower transaction counts in the table — this often indicates incomplete reporting for the most recent months and means recent monthly figures should be treated cautiously.

Example datapoints (from the query)
- 2020-10: median £255,000, mean £376,538, transactions 89,125
- 2022-08: mean peak ~£441,209 (median ~£295,000)
- 2025-03: median ~£314,750 (one of the highest medians)
- 2025-08: median £294,500, mean £364,653, transactions 18,815 (low count — likely incomplete)

Caveats
- These are transaction prices (Price Paid dataset) — actual house “values” may differ.
- Mean is sensitive to composition and outliers. Changes in the types of properties sold (e.g., mix of flats vs detached houses, regional mix) will affect mean and median differently.
- Recent months can be incomplete; months with unusually low transaction counts should be treated with caution.
- This is a national aggregate — regional differences can be substantial.

If you want I can:
- Produce a chart of median and mean over time.
- Compare year-on-year or compute CAGR for a different start/end month.
- Break the analysis down by region/county/town, property type (flat, terraced, semi, detached), or by price bands.
- Show a table of top/bottom regions for price growth over the last 5 years.

Which follow-up would you like?

```

</VerticalStepper>
