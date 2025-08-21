---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Integrate Ollama'
title: 'Set Up ClickHouse MCP Server with Ollama'
pagination_prev: null
pagination_next: null
description: 'This guide explains how to set up Ollama with a ClickHouse MCP server.'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: explanation
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

# Using ClickHouse MCP server with Ollama

> This guide explains how to use the ClickHouse MCP Server with Ollama.

<VerticalStepper headerLevel="h2">

## Install Ollama {#install-ollama}

Ollama is a library for running Large Language Models (LLMs) on your own machine.
It has a [wide range of models available](https://ollama.com/library) and is easy to use.

You can download Ollama for Mac, Windows, or Linux from the [download page](https://ollama.com/download).

Once you run Ollama, it will start a local server in the background that you can use to run models.
Alternatively, you can run the server manually by running `ollama serve`.

Once installed, you can pull a model down to your machine like this:

```bash
ollama pull qwen3:8b
```

This will pull the model to your local machine if it is not present.
Once it's downloaded, you can run the model like this:

```bash
ollama run qwen3:8b
```

:::note
Only [models that have tool support](https://ollama.com/search?c=tools) will work with MCP Servers.
:::

We can list the models that we have downloaded like this:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

We can use the following command to see more information about the model that we've downloaded:

```bash
ollama show qwen3
```

```text
  Model
    architecture        qwen3
    parameters          8.2B
    context length      40960
    embedding length    4096
    quantization        Q4_K_M

  Capabilities
    completion
    tools

  Parameters
    repeat_penalty    1
    stop              "<|im_start|>"
    stop              "<|im_end|>"
    temperature       0.6
    top_k             20
    top_p             0.95

  License
    Apache License
    Version 2.0, January 2004
```

We can see from this output that the default qwen3 model has just over 8 billion parameters.

## Install MCPHost {#install-mcphost}

At the time of writing (July 2025) there is no native functionality for using Ollama with MCP Servers.
However, we can use [MCPHost](https://github.com/mark3labs/mcphost) to run Ollama models with MCP Servers.

MCPHost is a Go application, so you'll need to make sure that you have [Go installed](https://go.dev/doc/install) on your machine.
You can then install MCPHost by running the following command:

```bash
go install github.com/mark3labs/mcphost@latest
```

The binary will be installed under `~/go/bin` so we need to make sure that directory is on our path.

## Configuring ClickHouse MCP Server {#configure-clickhouse-mcp-server}

We can configure MCP Servers with MCPHost in YAML or JSON files. 
MCPHost will look for config files in your home directory the following order:

1. `.mcphost.yml` or `.mcphost.json`  (preferred)
2. `.mcp.yml` or `.mcp.json` (backwards compatibility)

It uses a syntax that's similar to that used in the standard MCP configuration file.
Here's an example of a ClickHouse MCP server configuration, which we'll save to the `~/.mcphost.json` file:

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": ["uv",
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ]
    }
  }
}
```

The main difference from the standard MCP configuration file is that we need to specify a `type`.
The type is used to indicate the transport type used by the MCP Server.

* `local` → stdio transport
* `remote` → streamable transport
* `builtin` → inprocess transport

We'll also need to configure the following environment variables:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
In theory, you should be able to provide these variables under the `environment` key in the MCP configuration file, but we've found that this doesn't work.
:::

## Running MCPHost {#running-mcphost}

Once you've configured the ClickHouse MCP server, you can run MCPHost by running the following command:

```bash
mcphost --model ollama:qwen3
```

Or, if you want to have it use a specific config file:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
If you don't provide `--model`, MCPHost will look in the environment variables for `ANTHROPIC_API_KEY` and will use the `anthropic:claude-sonnet-4-20250514` model.
:::

We should see the following output:

```text
  ┃                                                                                     ┃
  ┃  Model loaded: ollama (qwen3)                                                       ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Model loaded successfully on GPU                                                   ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Loaded 3 tools from MCP servers                                                    ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  Enter your prompt (Type /help for commands, Ctrl+C to quit, ESC to cancel generation)
```

We can use the `/servers` command to list the MCP Servers:

```text
  ┃                                                                                      ┃
  ┃  ## Configured MCP Servers                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

And `/tools` to list the tools available:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

We can then ask the model questions about the databases/tables available in the ClickHouse SQL playground.

In our experience when using smaller models (the default qwen3 model has 8 billion parameters), you'll need to be more specific about what you'd like it to do.
For example, you'll need to explicitly ask it to list the databases and tables rather than straight away asking it to query a certain table.
You can partially eleviate this problem by using a large model (e.g. qwen3:14b), but that will run more slowly on consumer hardware.

</VerticalStepper>
