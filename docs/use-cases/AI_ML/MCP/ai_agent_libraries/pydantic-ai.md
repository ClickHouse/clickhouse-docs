---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: 'Integrate PydanticAI'
title: 'How to build a PydanticAI agent using ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Learn how to build a PydanticAI agent that can interact with ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: how-to
---

# How to build a PydanticAI agent using ClickHouse MCP Server

In this guide, you'll learn how to build a [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) agent that
can interact with [ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Example notebook
This example can be found as a notebook in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
- You'll need to have `pip` installed on your system.
- You'll need an Anthropic API key, or API key from another LLM provider

You can run the following steps either from your Python REPL or via script.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the required library by running the following commands:

```python
!pip install -q --upgrade pip
!pip install -q "pydantic-ai-slim[mcp]"
!pip install -q "pydantic-ai-slim[anthropic]" # replace with the appropriate package if using a different LLM provider
```

## Setup credentials {#setup-credentials}

Next, you'll need to provide your Anthropic API key:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Using another LLM provider
If you don't have an Anthropic API key, and want to use another LLM provider,
you can find the instructions for setting up your credentials in the [PydanticAI docs](https://ai.pydantic.dev/models/)
:::

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

## Initialize MCP Server and PydanticAI agent {#initialize-mcp}

Now configure the ClickHouse MCP Server to point at the ClickHouse SQL playground:

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.messages import ToolCallPart, ToolReturnPart

server = MCPServerStdio(
    'uv',
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
agent = Agent('anthropic:claude-sonnet-4-0', mcp_servers=[server])
```

## Ask the agent a question {#ask-agent}

Finally, you can ask the agent a question:

```python
async with agent.run_mcp_servers():
    result = await agent.run("Who's done the most PRs for ClickHouse?")
    print(result.output)
```

You'll get back a similar response as below:

```response title="Response"
Based on the data from the ClickHouse GitHub repository, here are the top contributors by number of pull requests created:

**Top contributors to ClickHouse by PRs opened:**

1. **alexey-milovidov** - 3,370 PRs opened
2. **azat** - 1,905 PRs opened  
3. **rschu1ze** - 979 PRs opened
4. **alesapin** - 947 PRs opened
5. **tavplubix** - 896 PRs opened
6. **kssenii** - 871 PRs opened
7. **Avogar** - 805 PRs opened
8. **KochetovNicolai** - 700 PRs opened
9. **Algunenano** - 658 PRs opened
10. **kitaisreal** - 630 PRs opened

**Alexey Milovidov** stands out as by far the most active contributor with over 3,370 pull requests opened, which is significantly more than any other contributor. This makes sense as Alexey Milovidov is one of the founders and lead developers of ClickHouse.

The data also shows that alexey-milovidov has been very active in managing PRs, with 12,818 "closed" events (likely reviewing and closing PRs from other contributors) in addition to creating his own PRs.

It's worth noting that I filtered out various robot/bot accounts that handle automated processes, focusing on human contributors to give you the most meaningful answer about who has contributed the most PRs to ClickHouse.
```

</VerticalStepper>
