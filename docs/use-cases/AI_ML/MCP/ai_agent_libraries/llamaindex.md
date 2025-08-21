---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'Integrate LlamaIndex'
title: 'How to build a LlamaIndex AI agent using ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Learn how to build a LlamaIndex AI agent that can interact with ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: how-to
---

# How to build a LlamaIndex AI agent using ClickHouse MCP Server

In this guide, you'll learn how to build a [LlamaIndex](https://docs.llamaindex.ai) AI agent that
can interact with [ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Example notebook
This example can be found as a notebook in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
- You'll need to have `pip` installed on your system.
- You'll need an Anthropic API key, or API key from another LLM provider

You can run the following steps either from your Python REPL or via script.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the required libraries by running the following commands:

```python
!pip install -q --upgrade pip
!pip install -q llama-index
!pip install -q clickhouse-connect
!pip install -q llama-index-llms-anthropic
!pip install -q llama-index-tools-mcp
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
you can find the instructions for setting up your credentials in the [LlamaIndex "LLMs" docs](https://docs.llamaindex.ai/en/stable/examples/)
:::

## Initialize MCP Server {#initialize-mcp-and-agent}

Now configure the ClickHouse MCP Server to point at the ClickHouse SQL playground.
You'll need to convert those from Python functions into Llama Index tools:

```python
from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

mcp_client = BasicMCPClient(
    "uv",
    args=[
        "run",
        "--with", "mcp-clickhouse",
        "--python", "3.13",
        "mcp-clickhouse"
    ],
    env={
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": "",
        "CLICKHOUSE_SECURE": "true"
    }
)

mcp_tool_spec = McpToolSpec(
    client=mcp_client,
)

tools = await mcp_tool_spec.to_tool_list_async()
```
## Create an agent {#create-agent}

You're now ready to create an agent that has access to those tools. Set the maximum
number of tool calls in one run to 10. You can modify this parameter if you want:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
```

## Initialize the LLM {#initialize-llm}

Initialize the Claude Sonnet 4.0 model with the following code:

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```

## Run the agent {#run-agent}

Finally, you can ask the agent a question:

```python
response = agent.query("What's the most popular repository?")
```

The response back is long, so it has been truncated in the example 
response below:

```response title="Response"
Added user message to memory: What's the most popular repository?
=== LLM Response ===
I'll help you find the most popular repository. Let me first explore the available databases and tables to understand the data structure.
=== Calling Function ===
Calling function: list_databases with args: {}
=== Function Output ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM Response ===
I can see there's a `github` database which likely contains repository data. Let me explore the tables in that database.
=== Calling Function ===
Calling function: list_tables with args: {"database": "github"}
=== Function Output ===
...
...
...
=== LLM Response ===
Based on the GitHub data, **the most popular repository is `sindresorhus/awesome`** with **402,292 stars**.

Here are the top 10 most popular repositories by star count:

1. **sindresorhus/awesome** - 402,292 stars
2. **996icu/996.ICU** - 388,413 stars  
3. **kamranahmedse/developer-roadmap** - 349,097 stars
4. **donnemartin/system-design-primer** - 316,524 stars
5. **jwasham/coding-interview-university** - 313,767 stars
6. **public-apis/public-apis** - 307,227 stars
7. **EbookFoundation/free-programming-books** - 298,890 stars
8. **facebook/react** - 286,034 stars
9. **vinta/awesome-python** - 269,320 stars
10. **freeCodeCamp/freeCodeCamp** - 261,824 stars

The `sindresorhus/awesome` repository is a curated list of awesome lists, which explains its popularity as it serves as a comprehensive directory of resources across many different topics in software development.
```

</VerticalStepper>
