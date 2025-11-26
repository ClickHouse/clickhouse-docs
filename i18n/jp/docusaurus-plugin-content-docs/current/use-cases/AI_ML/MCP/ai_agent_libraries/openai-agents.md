---
slug: /use-cases/AI/MCP/ai-agent-libraries/openai-agents
sidebar_label: 'OpenAI を統合する'
title: 'ClickHouse MCP Server を使って OpenAI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と連携して動作する OpenAI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'OpenAI']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server を使用して OpenAI エージェントを構築する方法

このガイドでは、[ClickHouse SQL playground](https://sql.clickhouse.com/) と対話できる [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用して [OpenAI](https://github.com/openai/openai-agents-python) エージェントを構築する手順を説明します。

:::note サンプルノートブック
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb) 内のノートブックとして提供されています。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- OpenAI APIキーが必要です。

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリをインストールする

次のコマンドを実行して、必要なライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q openai-agents
```


## 認証情報のセットアップ

次に、OpenAI API キーを指定する必要があります。

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI APIキーを入力:")
```

```response title="Response"
OpenAI APIキーを入力: ········
```


## MCP Server と OpenAI エージェントの初期化

ここでは、ClickHouse MCP Server を ClickHouse SQL playground を参照するように設定し、
OpenAI エージェントを初期化して質問させます。

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """重要なイベントのみをフィルタリングするシンプル版"""

    # ツール呼び出し
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Tool: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # 文字列と解析済み出力の両方に対応
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # 辞書形式とリスト形式の両方に対応
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # リスト形式に対応
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                else:
                    # フォールバック - 生の出力を表示
                    print(f"✅ Result: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # 解析失敗時は生の出力にフォールバック
                print(f"✅ Result: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Response: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Response: {str(chunk.item)[:100]}...")

    # ストリーミング用テキスト差分
    elif (hasattr(chunk, 'type') and
          chunk.type == 'raw_response_event' and
          hasattr(chunk, 'data') and
          hasattr(chunk.data, 'type') and
          chunk.data.type == 'response.output_text.delta'):
        print(chunk.data.delta, end='', flush=True)

async with MCPServerStdio(
        name="ClickHouse SQLプレイグラウンド",
        params={
            "command": "uv",
            "args": [
                'run',
                '--with', 'mcp-clickhouse',
                '--python', '3.13',
                'mcp-clickhouse'
            ],
            "env": env
        }, client_session_timeout_seconds = 60
) as server:
    agent = Agent(
        name="Assistant",
        instructions="ツールを使用してClickHouseにクエリを実行し、それらのファイルに基づいて質問に回答します。",
        mcp_servers=[server],
    )

    message = "2025年現在で最大のGitHubプロジェクトは何ですか？"
    print(f"\n\nRunning: {message}")
    with trace("最大プロジェクトワークフロー"):
        result = Runner.run_streamed(starting_agent=agent, input=message, max_turns=20)
        async for chunk in result.stream_events():
            simple_render_chunk(chunk)
```


```response title="Response"
Running: What's the biggest GitHub project so far in 2025?
🔧 Tool: list_databases({})
✅ Result: amazon
bluesky
country
covid
default
dns
environmental
food
forex
geo
git
github
hackernews
imdb
log...
🔧 Tool: list_tables({"database":"github"})
✅ Result: {
  "database": "github",
  "name": "actors_per_repo",
  "comment": "",
  "columns": [
    {
      "...
🔧 Tool: run_select_query({"query":"SELECT repo_name, MAX(stars) FROM github.top_repos_mv"})
✅ Result: {
  "status": "error",
  "message": "Query failed: HTTPDriver for https://sql-clickhouse.clickhouse....
🔧 Tool: run_select_query({"query":"SELECT repo_name, stars FROM github.top_repos ORDER BY stars DESC LIMIT 1"})
✅ Result: {
  "repo_name": "sindresorhus/awesome",
  "stars": 402893
}...
2025年最大のGitHubプロジェクトは、スター数に基づくと402,893スターの「[sindresorhus/awesome](https://github.com/sindresorhus/awesome)」です。💬 レスポンス: 2025年最大のGitHubプロジェクトは、スター数に基づくと402,893スターの「[sindresorhus/awesome](https://github.com/sindresorhus/awesome)」です。
```

</VerticalStepper>
