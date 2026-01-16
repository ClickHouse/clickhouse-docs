---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: '集成 Chainlit'
title: '如何使用 Chainlit 与 ClickHouse MCP Server 构建 AI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Chainlit 配合 ClickHouse MCP Server 构建基于 LLM 的聊天应用程序'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 Chainlit 和 ClickHouse MCP Server 构建 AI 智能体 \\{#how-to-build-an-ai-agent-with-chainlit-and-the-clickhouse-mcp-server\\}

本指南介绍如何将功能强大的 Chainlit 聊天界面框架与 ClickHouse Model Context Protocol (MCP) Server 相结合，以构建交互式数据应用程序。Chainlit 使你可以用最少的代码为 AI 应用构建对话式界面，而 ClickHouse MCP Server 则提供与 ClickHouse 高性能列式数据库的无缝集成。

## 前提条件 \\{#prerequisites\\}
- 需要一个 Anthropic API 密钥
- 需要已安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)

## 基本 Chainlit 应用 \\{#basic-chainlit-app\\}

你可以通过运行以下命令来查看一个简单聊天应用的示例：

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

然后访问 `http://localhost:8000`

## 添加 ClickHouse MCP Server \\{#adding-clickhouse-mcp-server\\}

在添加 ClickHouse MCP Server 后，事情会变得更有趣。
你需要更新 `.chainlit/config.toml` 文件，以允许使用 `uv` 命令：

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
你可以在[示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)中找到完整的 `config.toml` 文件。
:::

由于需要一些“胶水代码”来让 MCP Servers 与 Chainlit 协同工作，因此我们需要运行下面的命令来启动 Chainlit：

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

要添加 MCP Server，请在聊天界面中点击插头形图标，然后添加以下命令以连接并使用 ClickHouse SQL Playground：

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

如果你想使用自己的 ClickHouse 实例，可以调整环境变量的值。

然后你就可以向它提问类似下面的问题：

* 告诉我可以查询的表有哪些
* 关于纽约的出租车，有什么有趣的事情？
