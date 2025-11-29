---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: 'Claude Agent SDK を統合する'
title: 'Claude Agent SDK と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Claude Agent SDK と ClickHouse MCP Server を使用して AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---



# Claude Agent SDK と ClickHouse MCP Server を使って AI エージェントを構築する方法 {#how-to-build-an-ai-agent-with-claude-agent-sdk-and-the-clickhouse-mcp-server}

このガイドでは、[Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) を使って、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を経由して対話できる AI エージェントを構築する方法を説明します。

:::note サンプルノートブック
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb) 内のノートブックとして参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされていること
- システムに`pip`がインストールされていること
- Anthropic APIキーを取得していること

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリをインストールする {#install-libraries}

以下のコマンドを実行して、Claude Agent SDK をインストールします。

```python
pip install -q --upgrade pip
pip install -q claude-agent-sdk
pip install -q ipywidgets
```


## 資格情報の設定 {#setup-credentials}

次に、Anthropic の API キーを指定する必要があります。

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Anthropic APIキーを入力:")
```

```response title="Response"
Anthropic APIキーを入力: ········
```

次に、ClickHouse SQL Playground に接続するために必要な資格情報を定義します。

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCP ServerとClaude Agent SDKエージェントの初期化 {#initialize-mcp-and-agent}

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
🤖 ClickHouseデータベースにクエリを実行して、英国の不動産販売に関する興味深い情報を見つけます。

まず、利用可能なデータベースを確認します:
🛠️ mcp__mcp-clickhouse__list_databases {}
🤖 素晴らしい！"uk"データベースがあります。利用可能なテーブルを確認します:
🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
🤖 完璧です！`uk_price_paid`テーブルには3000万件以上の不動産販売記録があります。興味深い情報を探します:
🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
🤖 興味深い発見です:**ロンドンのBaker Street**(そう、あの有名なシャーロック・ホームズの通りです!)は、100件以上の販売実績がある通りの中で最大の価格幅を持っています - 最低**£2,500**から最高**£594.3 million**まで、実に£594 millionを超える驚異的な差があります！

Baker Streetはロンドンで最も名高い住所の一つであり、Maryleboneのような富裕地域を通っており、このデータセットには541件の販売記録があることから、この結果は納得できます。
```

</VerticalStepper>
