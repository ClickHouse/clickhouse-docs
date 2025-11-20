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

> 本指南说明如何将 ClickHouse MCP 服务器与 Ollama 配合使用。

<VerticalStepper headerLevel="h2">


## 安装 Ollama {#install-ollama}

Ollama 是一个用于在本地机器上运行大型语言模型（LLM）的库。
它提供[丰富的可用模型](https://ollama.com/library)，且易于使用。

您可以从[下载页面](https://ollama.com/download)下载适用于 Mac、Windows 或 Linux 的 Ollama。

运行 Ollama 后,它会在后台启动一个本地服务器,您可以使用该服务器来运行模型。
或者,您也可以通过运行 `ollama serve` 手动启动服务器。

安装完成后,您可以通过以下方式将模型拉取到本地机器:

```bash
ollama pull qwen3:8b
```

如果模型不存在,此命令会将模型拉取到本地机器。
下载完成后,您可以通过以下方式运行模型:

```bash
ollama run qwen3:8b
```

:::note
只有[支持工具的模型](https://ollama.com/search?c=tools)才能与 MCP Server 配合使用。
:::

我们可以通过以下方式列出已下载的模型:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

我们可以使用以下命令查看已下载模型的详细信息:

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

从此输出可以看出,默认的 qwen3 模型拥有略超过 80 亿个参数。


## 安装 MCPHost {#install-mcphost}

在撰写本文时(2025年7月),Ollama 尚不支持与 MCP Servers 配合使用的原生功能。
不过,我们可以使用 [MCPHost](https://github.com/mark3labs/mcphost) 在 MCP Servers 上运行 Ollama 模型。

MCPHost 是一个 Go 应用程序,因此您需要确保机器上已[安装 Go](https://go.dev/doc/install)。
然后可以通过运行以下命令来安装 MCPHost:

```bash
go install github.com/mark3labs/mcphost@latest
```

二进制文件将安装在 `~/go/bin` 目录下,因此需要确保该目录已添加到系统路径中。


## 配置 ClickHouse MCP 服务器 {#configure-clickhouse-mcp-server}

我们可以使用 YAML 或 JSON 文件通过 MCPHost 配置 MCP 服务器。
MCPHost 将按以下顺序在您的主目录中查找配置文件:

1. `.mcphost.yml` 或 `.mcphost.json`(首选)
2. `.mcp.yml` 或 `.mcp.json`(向后兼容)

它使用与标准 MCP 配置文件类似的语法。
以下是 ClickHouse MCP 服务器配置示例,我们将其保存到 `~/.mcphost.json` 文件:

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": [
        "uv",
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

与标准 MCP 配置文件的主要区别在于需要指定 `type`。
该类型用于指示 MCP 服务器使用的传输类型。

- `local` → stdio 传输
- `remote` → 流式传输
- `builtin` → 进程内传输

我们还需要配置以下环境变量:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
理论上,您应该能够在 MCP 配置文件的 `environment` 键下提供这些变量,但我们发现这种方式无法正常工作。
:::


## 运行 MCPHost {#running-mcphost}

配置好 ClickHouse MCP 服务器后,可以通过以下命令运行 MCPHost:

```bash
mcphost --model ollama:qwen3
```

如果需要使用特定的配置文件:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json
```

:::warning
如果不提供 `--model` 参数,MCPHost 将在环境变量中查找 `ANTHROPIC_API_KEY`,并使用 `anthropic:claude-sonnet-4-20250514` 模型。
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

使用 `/tools` 命令列出可用工具:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

然后可以向模型询问 ClickHouse SQL playground 中可用的数据库和表相关问题。

根据我们的经验,使用较小的模型时(默认的 qwen3 模型有 80 亿参数),需要更明确地说明希望执行的操作。
例如,需要明确要求列出数据库和表,而不是直接要求查询某个表。
可以通过使用更大的模型(如 qwen3:14b)来部分缓解这个问题,但在消费级硬件上运行速度会更慢。

</VerticalStepper>
