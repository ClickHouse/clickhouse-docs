---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/openai-agents'
'sidebar_label': 'OpenAI の統合'
'title': 'ClickHouse MCP サーバーを使用して OpenAI エージェントを構築する方法。'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse MCP サーバーと対話できる OpenAI エージェントを構築する方法を学びましょう。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'OpenAI'
'show_related_blogs': true
'doc_type': 'guide'
---


# ClickHouse MCPサーバーを使用してOpenAIエージェントを構築する方法

このガイドでは、[ClickHouseのSQLプレイグラウンド](https://sql.clickhouse.com/)と[ClickHouseのMCPサーバー](https://github.com/ClickHouse/mcp-clickhouse)を使用して、[OpenAI](https://github.com/openai/openai-agents-python)エージェントを構築する方法を学びます。

:::note 例のノートブック
この例は、[examplesリポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb)のノートブックとして見つけることができます。
:::

## 前提条件 {#prerequisites}
- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- OpenAI APIキーが必要です。

次の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">

## ライブラリのインストール {#install-libraries}

必要なライブラリを以下のコマンドを実行してインストールします。

```python
!pip install -q --upgrade pip
!pip install -q openai-agents
```

## 認証情報の設定 {#setup-credentials}

次に、OpenAI APIキーを提供する必要があります:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

## MCPサーバーとOpenAIエージェントの初期化 {#initialize-mcp-and-agent}

現在、ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドを指すように構成し、
OpenAIエージェントを初期化して、質問をします:

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """Simple version that just filters important events"""

    # Tool calls
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Tool: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # Handle both string and already-parsed output
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # Handle both dict and list formats
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # Handle list format
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                else:
                    # Fallback - just print the raw output
                    print(f"✅ Result: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # Fallback to raw output if parsing fails
                print(f"✅ Result: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Response: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Response: {str(chunk.item)[:100]}...")

    # Text deltas for streaming
    elif (hasattr(chunk, 'type') and
          chunk.type == 'raw_response_event' and
          hasattr(chunk, 'data') and
          hasattr(chunk.data, 'type') and
          chunk.data.type == 'response.output_text.delta'):
        print(chunk.data.delta, end='', flush=True)

async with MCPServerStdio(
        name="ClickHouse SQL Playground",
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
        instructions="Use the tools to query ClickHouse and answer questions based on those files.",
        mcp_servers=[server],
    )

    message = "What's the biggest GitHub project so far in 2025?"
    print(f"\n\nRunning: {message}")
    with trace("Biggest project workflow"):
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
The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.💬 Response: The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.
```

</VerticalStepper>
