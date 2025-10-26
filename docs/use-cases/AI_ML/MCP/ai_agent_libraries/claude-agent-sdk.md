---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: 'Integrate Claude Agent SDK'
title: 'How to build an AI Agent with Claude Agent SDK and the ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Learn how build an AI Agent with Claude Agent SDK and the ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---

# How to build an AI Agent with Claude Agent SDK and the ClickHouse MCP Server

In this guide you'll learn how to build a [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) AI agent that can interact with 
[ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Example notebook
This example can be found as a notebook in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
- You'll need to have `pip` installed on your system.
- You'll need an Anthropic API key

You can run the following steps either from your Python REPL or via script.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the Claude Agent SDK library by running the following commands:

```python
pip install -q --upgrade pip
pip install -q claude-agent-sdk
pip install -q ipywidgets
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

## Initialize MCP Server and Claude Agent SDK agent {#initialize-mcp-and-agent}

Now configure the ClickHouse MCP Server to point at the ClickHouse SQL playground 
and also initialize our agent and ask it a question:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, UserMessage, TextBlock, ToolUseBlock
```

```python
options = ClaudeAgentOptions(
    allowed_tools=[
        "mcp__mcp-clickhouse__list_databases",
        "mcp__mcp-clickhouse__list_tables", 
        "mcp__mcp-clickhouse__run_select_query",
        "mcp__mcp-clickhouse__run_chdb_select_query"
    ],
    mcp_servers={
        "mcp-clickhouse": {
            "command": "uv",
            "args": [
                "run",
                "--with", "mcp-clickhouse",
                "--python", "3.10",
                "mcp-clickhouse"
            ],
            "env": env
        }
    }
)


async for message in query(prompt="Tell me something interesting about UK property sales", options=options):
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(f"🤖 {block.text}")
            if isinstance(block, ToolUseBlock):
                print(f"🛠️ {block.name} {block.input}")
    elif isinstance(message, UserMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
```

Note the code inside the `for` block is filtering the output for brevity.

```response title="Response"
🤖 I'll query the ClickHouse database to find something interesting about UK property sales.

Let me first see what databases are available:
🛠️ mcp__mcp-clickhouse__list_databases {}
🤖 Great! There's a "uk" database. Let me see what tables are available:
🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
🤖 Perfect! The `uk_price_paid` table has over 30 million property sales records. Let me find something interesting:
🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
🤖 Here's something fascinating: **Baker Street in London** (yes, the famous Sherlock Holmes street!) has the largest price range of any street with over 100 sales - properties sold for as low as **£2,500** and as high as **£594.3 million**, a staggering difference of over £594 million!

This makes sense given Baker Street is one of London's most prestigious addresses, running through wealthy areas like Marylebone, and has had 541 recorded sales in this dataset.
```

</VerticalStepper>
