---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: '集成 Agno'
title: '如何使用 Agno 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Agno 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Agno 和 ClickHouse MCP Server 构建 AI Agent

在本指南中，你将学习如何构建一个 [Agno](https://github.com/agno-agi/agno) AI agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
该示例可以在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb) 中以 Notebook 的形式找到。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥或其他 LLM 提供商的 API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装库

运行以下命令来安装 Agno 库：

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```


## 配置凭证

接下来，您需要提供 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
输入 Anthropic API 密钥：········
```

:::note 使用其他 LLM 提供商
如果你没有 Anthropic API 密钥，并且想要使用其他 LLM 提供商，
可以在 [Agno 文档](https://docs.agno.com/concepts/models/introduction) 中找到设置凭据的说明。
:::

接下来，定义用于连接 ClickHouse SQL playground 的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP 服务器和 Agno 代理 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器指向 ClickHouse SQL 演练场,
并初始化 Agno 代理,然后向其提问:

```python
from agno.agent import Agent
from agno.tools.mcp import MCPTools
from agno.models.anthropic import Claude
```

```python
async with MCPTools(command="uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse", env=env, timeout_seconds=60) as mcp_tools:
    agent = Agent(
        model=Claude(id="claude-3-5-sonnet-20240620"),
        markdown=True,
        tools = [mcp_tools]
    )
await agent.aprint_response("What's the most starred project in 2025?", stream=True)
```

```response title="响应"
▰▱▱▱▱▱▱ Thinking...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ What's the most starred project in 2025?                                                                        ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Tool Calls ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ • list_tables(database=github, like=%)                                                                          ┃
┃ • run_select_query(query=SELECT                                                                                 ┃
┃     repo_name,                                                                                                  ┃
┃     SUM(count) AS stars_2025                                                                                    ┃
┃ FROM github.repo_events_per_day                                                                                 ┃
┃ WHERE event_type = 'WatchEvent'                                                                                 ┃
┃     AND created_at >= '2025-01-01'                                                                              ┃
┃     AND created_at < '2026-01-01'                                                                               ┃
┃ GROUP BY repo_name                                                                                              ┃
┃ ORDER BY stars_2025 DESC                                                                                        ┃
┃ LIMIT 1)                                                                                                        ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Response (34.9s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ 要回答您关于 2025 年获星最多项目的问题,我需要查询 ClickHouse 数据库。     ┃
┃ 但在此之前,我需要收集一些信息并确保查看的是正确的数据。 ┃
┃ 让我先检查可用的数据库和表。感谢您提供数据库列表。我看到  ┃
┃ 有一个 "github" 数据库,它很可能包含我们要查找的信息。让我们检查 ┃
┃ 该数据库中的表。现在我们已经获得了 github 数据库中表的信息,可以查询  ┃
┃ 相关数据来回答您关于 2025 年获星最多项目的问题。我们将使用 repo_events_per_day ┃
┃ 表,该表包含每个仓库的每日事件计数,包括星标事件 (WatchEvents)。              ┃
┃                                                                                                                 ┃
┃ 让我们创建一个查询来查找 2025 年获星最多的项目:根据查询结果,我可以回答您     ┃
┃ 关于 2025 年获星最多项目的问题:                                                                ┃
┃                                                                                                                 ┃
┃ 2025 年获星最多的项目是 deepseek-ai/DeepSeek-R1,该年度获得了 84,962 个星标。     ┃
┃                                                                                                                 ┃
┃ 该项目 DeepSeek-R1 似乎是来自 DeepSeek AI 组织的一个 AI 相关仓库。它在  ┃
┃ 2025 年获得了 GitHub 社区的广泛关注和欢迎,获得了该年度所有项目中最多的星标。    ┃
┃                                                                                                                 ┃
┃ 值得注意的是,此数据基于数据库中记录的 GitHub 事件,它表示  ┃
┃ 专门在 2025 年期间累积的星标 (WatchEvents)。如果考虑该项目的整个生命周期,   ┃
┃ 其星标总数可能会更高。                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
