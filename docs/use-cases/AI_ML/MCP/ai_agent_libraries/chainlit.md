---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Integrate Chainlit'
title: 'How to build an AI Agent with Chainlit and the ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Learn how to use Chainlit to build LLM-based chat apps together with the ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'how-to'
---

# How to build an AI agent with Chainlit and the ClickHouse MCP Server

This guide explores how to combine Chainlit's powerful chat interface framework 
with the ClickHouse Model Context Protocol (MCP) Server to create interactive data
applications. Chainlit enables you to build conversational interfaces for AI 
applications with minimal code, while the ClickHouse MCP Server provides seamless
integration with ClickHouse's high-performance columnar database.

## Prerequisites {#prerequisites}
- You'll need an Anthropic API key
- You'll need to have [`uv`](https://docs.astral.sh/uv/getting-started/installation/) installed

## Basic Chainlit app {#basic-chainlit-app}

You can see an example of a basic chat app by running the following:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

Then navigate to `http://localhost:8000`

## Adding ClickHouse MCP Server {#adding-clickhouse-mcp-server}

Things get more interesting if we add the ClickHouse MCP Server.
You'll need to update your `.chainlit/config.toml` file to allow the `uv` command
to be used:

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
Find the full `config.toml` file in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)
:::

There's some glue code to get MCP Servers working with Chainlit, so we'll need to
run this command to launch Chainlit instead:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

To add the MCP Server, click on the plug icon in the chat interface, and then 
add the following command to connect to use the ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

If you want to use your own ClickHouse instance, you can adjust the values of 
the environment variables.

You can then ask it questions like this:

* Tell me about the tables that you have to query
* What's something interesting about New York taxis?
