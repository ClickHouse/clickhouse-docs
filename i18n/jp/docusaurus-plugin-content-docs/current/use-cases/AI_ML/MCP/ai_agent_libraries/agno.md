---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: 'Agno を統合する'
title: 'Agno と ClickHouse MCP Server を使用して AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Agno と ClickHouse MCP Server を使用して AI エージェントを構築する方法を学ぶ'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---

# Agno と ClickHouse MCP Server を使用して AI エージェントを構築する方法 {#how-to-build-an-ai-agent-with-agno-and-the-clickhouse-mcp-server}

このガイドでは、[Agno](https://github.com/agno-agi/agno) を使って、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を介して [ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できる AI エージェントを構築する方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb) にノートブックとして用意されています。
:::

## 前提条件 {#prerequisites}

- システムにPythonがインストールされていること
- システムに`pip`がインストールされていること
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキー

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">

## ライブラリをインストールする {#install-libraries}

以下のコマンドを実行して Agno ライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```

## 認証情報の設定 {#setup-credentials}

次に、Anthropic API キーを指定する必要があります：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 他の LLM プロバイダーを使用する場合
Anthropic の API キーを持っておらず、別の LLM プロバイダーを使用したい場合は、
資格情報の設定手順を [Agno ドキュメント](https://docs.agno.com/concepts/models/introduction) で確認できます。
:::

次に、ClickHouse の SQL Playground に接続するために必要な資格情報を定義します。

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCPサーバーとAgnoエージェントの初期化 {#initialize-mcp-and-agent}

ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドに接続するように設定し、
Agnoエージェントを初期化して質問してみます:

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
