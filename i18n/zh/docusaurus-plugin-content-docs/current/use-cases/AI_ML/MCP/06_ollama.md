---
slug: /use-cases/AI/MCP/ollama
sidebar_label: '集成 Ollama'
title: '使用 Ollama 配置 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何使用 Ollama 配置 ClickHouse MCP 服务器。'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# 使用 ClickHouse MCP 服务器与 Ollama

> 本指南介绍如何使用 ClickHouse MCP 服务器与 Ollama。

<VerticalStepper headerLevel="h2">


## 安装 Ollama

Ollama 是一个用于在本机运行大语言模型（LLM）的库。
它提供了[种类丰富的模型](https://ollama.com/library)，并且非常易于使用。

可以从[下载页面](https://ollama.com/download)获取适用于 Mac、Windows 或 Linux 的 Ollama。

运行 Ollama 之后，它会在后台启动一个本地服务器，你可以通过该服务器来运行模型。
或者，也可以通过运行 `ollama serve` 手动启动服务器。

安装完成后，可以按如下方式将模型拉取到本机：

```bash
ollama pull qwen3:8b
```

如果本地尚未存在该模型，将会将其拉取到本机。
下载完成后，你可以按如下方式运行该模型：

```bash
ollama run qwen3:8b
```

:::note
只有[支持工具的模型](https://ollama.com/search?c=tools)才能与 MCP 服务器配合使用。
:::

我们可以像这样列出已经下载的模型：

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

我们可以使用以下命令查看已下载模型的详细信息：

```bash
ollama show qwen3
```

```text
  模型
    架构                qwen3
    参数量              8.2B
    上下文长度          40960
    嵌入维度            4096
    量化方式            Q4_K_M

  能力
    补全
    工具

  参数
    repeat_penalty    1
    stop              "<|im_start|>"
    stop              "<|im_end|>"
    temperature       0.6
    top_k             20
    top_p             0.95

  许可证
    Apache License
    Version 2.0, January 2004
```

从该输出可以看出，默认的 qwen3 模型拥有稍多于 80 亿个参数。


## 安装 MCPHost

截至撰写本文时（2025 年 7 月），还没有将 Ollama 与 MCP Servers 一起使用的原生支持。
不过，我们可以使用 [MCPHost](https://github.com/mark3labs/mcphost) 在 MCP Servers 中运行 Ollama 模型。

MCPHost 是一个用 Go 编写的应用程序，因此你需要先在本机[安装 Go](https://go.dev/doc/install)。
然后你可以通过运行以下命令来安装 MCPHost：

```bash
go install github.com/mark3labs/mcphost@latest
```

该可执行文件会安装在 `~/go/bin` 目录下，因此我们需要确保该目录已添加到我们的 `PATH` 中。


## 配置 ClickHouse MCP 服务器

我们可以在 YAML 或 JSON 配置文件中通过 MCPHost 配置 MCP 服务器。
MCPHost 会按以下顺序在你的家目录中查找配置文件：

1. `.mcphost.yml` 或 `.mcphost.json`（首选）
2. `.mcp.yml` 或 `.mcp.json`（向后兼容）

它采用的语法与标准 MCP 配置文件的语法类似。
下面是一个 ClickHouse MCP 服务器配置示例，我们将其保存到 `~/.mcphost.json` 文件中：

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

与标准的 MCP 配置文件相比，主要区别在于我们需要指定一个 `type`。
该类型用于指示 MCP 服务器所使用的传输方式。

* `local` → stdio 传输
* `remote` → 流式传输（streamable）
* `builtin` → 进程内传输（inprocess）

我们还需要配置以下环境变量：

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
原则上，可以在 MCP 配置文件的 `environment` 字段下提供这些变量，但我们发现这样做并不起作用。
:::


## 运行 MCPHost {#running-mcphost}

配置好 ClickHouse MCP 服务器后,可以通过运行以下命令来运行 MCPHost:

```bash
mcphost --model ollama:qwen3
```

或者,如果您希望使用特定的配置文件:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json
```

:::warning
如果您不提供 `--model` 参数,MCPHost 将在环境变量中查找 `ANTHROPIC_API_KEY` 并使用 `anthropic:claude-sonnet-4-20250514` 模型。
:::

应该会看到以下输出:

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

可以使用 `/servers` 命令列出 MCP 服务器:

```text
  ┃                                                                                      ┃
  ┃  ## Configured MCP Servers                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

使用 `/tools` 命令列出可用的工具:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

然后可以向模型询问有关 ClickHouse SQL 演练场中可用数据库/表的问题。

根据我们的经验,使用较小的模型时(默认的 qwen3 模型有 80 亿个参数),您需要更明确地说明希望它执行的操作。
例如,您需要明确要求它列出数据库和表,而不是直接要求它查询某个表。
您可以通过使用更大的模型(例如 qwen3:14b)来部分缓解此问题,但在消费级硬件上运行速度会更慢。

</VerticalStepper>
