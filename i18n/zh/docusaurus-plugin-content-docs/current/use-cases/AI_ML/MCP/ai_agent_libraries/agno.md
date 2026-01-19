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

# 如何使用 Agno 和 ClickHouse MCP Server 构建 AI Agent \{#how-to-build-an-ai-agent-with-agno-and-the-clickhouse-mcp-server\}

在本指南中，你将学习如何构建一个 [Agno](https://github.com/agno-agi/agno) AI agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
该示例可以在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb) 中以 Notebook 的形式找到。
:::

## 前置条件 \{#prerequisites\}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥或其他 LLM 提供商的 API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">

## 安装库 \{#install-libraries\}

运行以下命令来安装 Agno 库：

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```

## 配置凭证 \{#setup-credentials\}

接下来，您需要提供 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
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

## 初始化 MCP 服务器和 Agno 代理 \{#initialize-mcp-and-agent\}

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

```response title="Response"
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
┃ To answer your question about the most starred project in 2025, I'll need to query the ClickHouse database.     ┃
┃ However, before I can do that, I need to gather some information and make sure we're looking at the right data. ┃
┃ Let me check the available databases and tables first.Thank you for providing the list of databases. I can see  ┃
┃ that there's a "github" database, which is likely to contain the information we're looking for. Let's check the ┃
┃ tables in this database.Now that we have information about the tables in the github database, we can query the  ┃
┃ relevant data to answer your question about the most starred project in 2025. We'll use the repo_events_per_day ┃
┃ table, which contains daily event counts for each repository, including star events (WatchEvents).              ┃
┃                                                                                                                 ┃
┃ Let's create a query to find the most starred project in 2025:Based on the query results, I can answer your     ┃
┃ question about the most starred project in 2025:                                                                ┃
┃                                                                                                                 ┃
┃ The most starred project in 2025 was deepseek-ai/DeepSeek-R1, which received 84,962 stars during that year.     ┃
┃                                                                                                                 ┃
┃ This project, DeepSeek-R1, appears to be an AI-related repository from the DeepSeek AI organization. It gained  ┃
┃ significant attention and popularity among the GitHub community in 2025, earning the highest number of stars    ┃
┃ for any project during that year.                                                                               ┃
┃                                                                                                                 ┃
┃ It's worth noting that this data is based on the GitHub events recorded in the database, and it represents the  ┃
┃ stars (WatchEvents) accumulated specifically during the year 2025. The total number of stars for this project   ┃
┃ might be higher if we consider its entire lifespan.                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
