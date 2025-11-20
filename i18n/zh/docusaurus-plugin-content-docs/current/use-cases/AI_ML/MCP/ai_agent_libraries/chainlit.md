---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: '集成 Chainlit'
title: '如何使用 Chainlit 与 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '学习如何使用 Chainlit 搭配 ClickHouse MCP Server 构建基于 LLM 的聊天应用'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Chainlit 与 ClickHouse MCP Server 构建 AI Agent

本指南将介绍如何将功能强大的 Chainlit 聊天界面框架与 ClickHouse Model Context Protocol (MCP) Server 相结合，用于构建交互式数据应用。Chainlit 使你能够以最少的代码为 AI 应用构建对话式界面，而 ClickHouse MCP Server 则提供与 ClickHouse 高性能列式数据库的无缝集成。



## 前提条件 {#prerequisites}

- 您需要一个 Anthropic API 密钥
- 您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)


## 基础 Chainlit 应用 {#basic-chainlit-app}

运行以下命令可查看基础聊天应用示例:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

然后访问 `http://localhost:8000`


## 添加 ClickHouse MCP Server {#adding-clickhouse-mcp-server}

添加 ClickHouse MCP Server 后会更加有趣。
您需要更新 `.chainlit/config.toml` 文件以允许使用 `uv` 命令:

```toml
[features.mcp.stdio]
    enabled = true
    # 只有允许列表中的可执行文件可用于 MCP stdio server。
    # 只需提供可执行文件的基本名称,例如 "npx",而非 "/usr/bin/npx"。
    # 暂时请勿注释此行,我们需要用它来解析可执行文件名称。
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
完整的 `config.toml` 文件可在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml) 中找到
:::

为了使 MCP Servers 与 Chainlit 协同工作,需要一些粘合代码,因此我们需要运行以下命令来启动 Chainlit:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

要添加 MCP Server,请点击聊天界面中的插头图标,然后添加以下命令以连接到 ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

如果您想使用自己的 ClickHouse 实例,可以调整相应的环境变量值。

然后您可以提出如下问题:

- 告诉我有哪些可以查询的表
- 关于纽约出租车有什么有趣的发现?
