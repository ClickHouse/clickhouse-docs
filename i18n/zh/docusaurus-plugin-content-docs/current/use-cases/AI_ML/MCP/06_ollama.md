---
'slug': '/use-cases/AI/MCP/ollama'
'sidebar_label': '集成 Ollama'
'title': '设置 ClickHouse MCP 服务器与 Ollama'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释如何与 ClickHouse MCP 服务器设置 Ollama。'
'keywords':
- 'AI'
- 'Ollama'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# 使用 ClickHouse MCP 服务器与 Ollama

> 本指南解释了如何将 ClickHouse MCP 服务器与 Ollama 一起使用。

<VerticalStepper headerLevel="h2">

## 安装 Ollama {#install-ollama}

Ollama 是一个在您自己的机器上运行大型语言模型（LLMs）的库。
它提供了 [丰富的模型可供选择](https://ollama.com/library)，易于使用。

您可以从 [下载页面](https://ollama.com/download) 下载适用于 Mac、Windows 或 Linux 的 Ollama。

一旦运行 Ollama，它将在后台启动一个本地服务器，您可以用来运行模型。
或者，您也可以通过运行 `ollama serve` 手动启动服务器。

安装完成后，您可以像这样将模型下载到您的机器：

```bash
ollama pull qwen3:8b
```

如果该模型未在本地，则会将其下载到您的本地机器。
下载完成后，您可以像这样运行该模型：

```bash
ollama run qwen3:8b
```

:::note
只有 [支持工具的模型](https://ollama.com/search?c=tools) 才能与 MCP 服务器配合使用。
:::

我们可以像这样列出我们下载的模型：

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

我们可以使用以下命令查看有关我们下载的模型的更多信息：

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

从该输出中，我们可以看到默认的 qwen3 模型有超过 80 亿个参数。

## 安装 MCPHost {#install-mcphost}

在写作时（2025年7月），没有原生功能可让 Ollama 与 MCP 服务器一起使用。
不过，我们可以使用 [MCPHost](https://github.com/mark3labs/mcphost) 来让 Ollama 模型与 MCP 服务器一起运行。

MCPHost 是一个 Go 应用程序，因此您需要确保在您的机器上 [安装 Go](https://go.dev/doc/install)。
然后，您可以通过运行以下命令安装 MCPHost：

```bash
go install github.com/mark3labs/mcphost@latest
```

该二进制文件将安装在 `~/go/bin` 目录下，因此我们需要确保该目录在我们的路径中。

## 配置 ClickHouse MCP 服务器 {#configure-clickhouse-mcp-server}

我们可以在 YAML 或 JSON 文件中使用 MCPHost 配置 MCP 服务器。
MCPHost 将按照以下顺序在您的家目录中查找配置文件：

1. `.mcphost.yml` 或 `.mcphost.json`  （优先）
2. `.mcp.yml` 或 `.mcp.json` （向后兼容性）

它使用的语法类似于标准 MCP 配置文件中的语法。
以下是一个 ClickHouse MCP 服务器配置的示例，我们将其保存到 `~/.mcphost.json` 文件中：

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

与标准 MCP 配置文件的主要区别在于，我们需要指定一个 `type`。
该类型用于指示 MCP 服务器使用的传输类型。

* `local` → 标准输入输出传输
* `remote` → 可流传输
* `builtin` → 内部过程传输

我们还需要配置以下环境变量：

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
理论上，您应该能够在 MCP 配置文件的 `environment` 键下提供这些变量，但我们发现这样做不起作用。
:::

## 运行 MCPHost {#running-mcphost}

配置好 ClickHouse MCP 服务器后，您可以通过运行以下命令运行 MCPHost：

```bash
mcphost --model ollama:qwen3
```

或者，如果您想使用特定的配置文件：

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
如果您不提供 `--model`，MCPHost 将在环境变量中查找 `ANTHROPIC_API_KEY`，并将使用 `anthropic:claude-sonnet-4-20250514` 模型。
:::

我们应该看到以下输出：

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

我们可以使用 `/servers` 命令列出 MCP 服务器：

```text
┃                                                                                      ┃
┃  ## Configured MCP Servers                                                           ┃
┃                                                                                      ┃
┃  1. mcp-ch                                                                           ┃
┃   MCPHost System (10:00)                                                             ┃
┃
```

使用 `/tools` 列出可用的工具：

```text
┃  ## Available Tools                                                                  ┃
┃                                                                                      ┃
┃  1. mcp-ch__list_databases                                                           ┃
┃  2. mcp-ch__list_tables                                                              ┃
┃  3. mcp-ch__run_select_query
```

然后，我们可以向模型提出有关 ClickHouse SQL 演示环境中可用数据库/表的问题。

根据我们的经验，当使用较小的模型时（默认的 qwen3 模型有 80 亿个参数），您需要更具体地说明希望它执行的操作。
例如，您需要明确要求它列出数据库和表，而不是直接要求它查询某个表。
您可以通过使用大型模型（例如 qwen3:14b）来部分缓解此问题，但在消费类硬件上运行速度较慢。

</VerticalStepper>
