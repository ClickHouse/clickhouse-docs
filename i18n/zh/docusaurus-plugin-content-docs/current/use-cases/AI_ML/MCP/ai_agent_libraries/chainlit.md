---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: '集成 Chainlit'
title: '如何使用 Chainlit 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何将 Chainlit 与 ClickHouse MCP Server 结合，构建基于 LLM 的聊天应用程序'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Chainlit 和 ClickHouse MCP Server 构建 AI 智能体

本指南将介绍如何将功能强大的 Chainlit 聊天界面框架与 ClickHouse Model Context Protocol（MCP）Server 结合起来，创建交互式数据应用。Chainlit 使您能够以最少的代码为 AI 应用构建对话式界面，而 ClickHouse MCP Server 则提供与 ClickHouse 高性能列式数据库的无缝集成。



## 前提条件 {#prerequisites}

- 您需要一个 Anthropic API 密钥
- 您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)


## 基础 Chainlit 应用 {#basic-chainlit-app}

运行以下命令可查看基础聊天应用示例:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

然后在浏览器中访问 `http://localhost:8000`


## 添加 ClickHouse MCP 服务器 {#adding-clickhouse-mcp-server}

添加 ClickHouse MCP 服务器后,操作会变得更加有趣。
您需要更新 `.chainlit/config.toml` 文件以允许使用 `uv` 命令:

```toml
[features.mcp.stdio]
    enabled = true
    # 只有允许列表中的可执行文件才能用于 MCP stdio 服务器。
    # 只需要可执行文件的基本名称,例如 "npx",而不是 "/usr/bin/npx"。
    # 目前请不要注释此行,我们需要它来解析可执行文件名称。
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
在[示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)中查找完整的 `config.toml` 文件
:::

为了让 MCP 服务器与 Chainlit 协同工作,需要一些粘合代码,因此我们需要运行以下命令来启动 Chainlit:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

要添加 MCP 服务器,请点击聊天界面中的插头图标,然后添加以下命令以连接并使用 ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

如果您想使用自己的 ClickHouse 实例,可以调整环境变量的值。

然后您可以提出如下问题:

- 告诉我可以查询哪些表
- 关于纽约出租车有什么有趣的发现?
