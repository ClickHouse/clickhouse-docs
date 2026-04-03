---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: 'Claude Agent SDK を統合する'
title: 'Claude Agent SDK と ClickHouse MCP server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Claude Agent SDK と ClickHouse MCP server を使用して AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---

# Claude Agent SDK と ClickHouse MCP server を使って AI エージェントを構築する方法 \{#how-to-build-an-ai-agent-with-claude-agent-sdk-and-the-clickhouse-mcp-server\}

このガイドでは、[Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) を使って、[ClickHouse SQLプレイグラウンド](https://sql.clickhouse.com/) と [ClickHouse MCP server](https://github.com/ClickHouse/mcp-clickhouse) を経由して対話できる AI エージェントを構築する方法を説明します。

:::note サンプルノートブック
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb) 内のノートブックとして参照できます。
:::

## 前提条件 \{#prerequisites\}

* システムにPythonがインストールされている必要があります。
* システムに`pip`がインストールされている必要があります。
* Anthropic APIキーが必要です

以下の手順は、Python REPL またはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">
  ## ライブラリのインストール \{#install-libraries\}

  以下のコマンドを実行して、Claude Agent SDKライブラリをインストールします:

  ```python
  pip install -q --upgrade pip
  pip install -q claude-agent-sdk
  pip install -q ipywidgets
  ```

  ## 認証情報の設定 \{#setup-credentials\}

  次に、Anthropic APIキーを指定する必要があります:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  次に、ClickHouse SQLプレイグラウンドへの接続に必要な認証情報を定義します:

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## MCP ServerとClaude Agent SDKエージェントの初期化 \{#initialize-mcp-and-agent\}

  ClickHouse MCP ServerをClickHouse SQLプレイグラウンドに接続するよう設定し、
  エージェントを初期化して質問します:

  ```python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, UserMessage, TextBlock, ToolUseBlock
  ```

  ```python
  options = ClaudeAgentOptions(
      allowed_tools=[
          "mcp__mcp-clickhouse__list_databases",
          "mcp__mcp-clickhouse__list_tables", 
          "mcp__mcp-clickhouse__run_select_query",
          "mcp__mcp-clickhouse__run_chdb_select_query"
      ],
      mcp_servers={
          "mcp-clickhouse": {
              "command": "uv",
              "args": [
                  "run",
                  "--with", "mcp-clickhouse",
                  "--python", "3.10",
                  "mcp-clickhouse"
              ],
              "env": env
          }
      }
  )


  async for message in query(prompt="Tell me something interesting about UK property sales", options=options):
      if isinstance(message, AssistantMessage):
          for block in message.content:
              if isinstance(block, TextBlock):
                  print(f"🤖 {block.text}")
              if isinstance(block, ToolUseBlock):
                  print(f"🛠️ {block.name} {block.input}")
      elif isinstance(message, UserMessage):
          for block in message.content:
              if isinstance(block, TextBlock):
                  print(block.text)
  ```

  なお、`for`ブロック内のコードは、簡潔にするために出力をフィルタリングしています。

  ```response title="Response"
  🤖 I'll query the ClickHouse database to find something interesting about UK property sales.

  Let me first see what databases are available:
  🛠️ mcp__mcp-clickhouse__list_databases {}
  🤖 Great! There's a "uk" database. Let me see what tables are available:
  🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
  🤖 Perfect! The `uk_price_paid` table has over 30 million property sales records. Let me find something interesting:
  🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
  🤖 Here's something fascinating: **Baker Street in London** (yes, the famous Sherlock Holmes street!) has the largest price range of any street with over 100 sales - properties sold for as low as **£2,500** and as high as **£594.3 million**, a staggering difference of over £594 million!

  This makes sense given Baker Street is one of London's most prestigious addresses, running through wealthy areas like Marylebone, and has had 541 recorded sales in this dataset.
  ```
</VerticalStepper>