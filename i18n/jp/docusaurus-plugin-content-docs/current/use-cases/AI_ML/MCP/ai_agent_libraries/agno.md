---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: 'Agno を統合する'
title: 'Agno と ClickHouse MCP サーバーで AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Agno と ClickHouse MCP サーバーを使って AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---



# Agno と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できるようにするために [ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用した、[Agno](https://github.com/agno-agi/agno) ベースの AI エージェントの構築方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb) 内のノートブックとして参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーが必要です。

以下の手順は、PythonのREPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行してAgnoライブラリをインストールします：

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```


## 認証情報の設定 {#setup-credentials}

次に、Anthropic APIキーを指定する必要があります：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 別のLLMプロバイダーを使用する場合
Anthropic APIキーをお持ちでない場合や、別のLLMプロバイダーを使用したい場合は、
[Agnoドキュメント](https://docs.agno.com/concepts/models/introduction)で認証情報の設定手順を確認できます
:::

次に、ClickHouse SQLプレイグラウンドへの接続に必要な認証情報を定義します：

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

```response title="レスポンス"
▰▱▱▱▱▱▱ 処理中...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ 2025年で最もスターを獲得したプロジェクトは何ですか?                                                                        ┃
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
┃ 2025年で最もスターを獲得したプロジェクトについてお答えするには、ClickHouseデータベースにクエリを実行する必要があります。     ┃
┃ ただし、その前にいくつかの情報を収集し、正しいデータを参照していることを確認する必要があります。 ┃
┃ まず、利用可能なデータベースとテーブルを確認します。データベースのリストをご提供いただきありがとうございます。  ┃
┃ 「github」データベースがあり、これが探している情報を含んでいる可能性が高いです。このデータベース内の ┃
┃ テーブルを確認しましょう。githubデータベース内のテーブルに関する情報が得られたので、  ┃
┃ 2025年で最もスターを獲得したプロジェクトについての質問に答えるために関連データをクエリできます。repo_events_per_day ┃
┃ テーブルを使用します。このテーブルには、スターイベント(WatchEvents)を含む各リポジトリの日次イベント数が格納されています。              ┃
┃                                                                                                                 ┃
┃ 2025年で最もスターを獲得したプロジェクトを見つけるクエリを作成しましょう:クエリ結果に基づいて、     ┃
┃ 2025年で最もスターを獲得したプロジェクトについてお答えします:                                                                ┃
┃                                                                                                                 ┃
┃ 2025年で最もスターを獲得したプロジェクトはdeepseek-ai/DeepSeek-R1で、その年に84,962個のスターを獲得しました。     ┃
┃                                                                                                                 ┃
┃ このプロジェクトDeepSeek-R1は、DeepSeek AI組織によるAI関連のリポジトリのようです。2025年にGitHubコミュニティから  ┃
┃ 大きな注目と人気を集め、その年のすべてのプロジェクトの中で最も多くのスターを獲得しました。    ┃
┃                                                                                                                 ┃
┃ このデータはデータベースに記録されたGitHubイベントに基づいており、2025年中に蓄積された  ┃
┃ スター(WatchEvents)を表していることに注意してください。このプロジェクトの全期間を考慮すると、スターの総数   ┃
┃ はさらに多い可能性があります。                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
