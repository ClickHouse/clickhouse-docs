---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: 'LangChain を統合する'
title: 'ClickHouse MCP Server を使用して LangChain/LangGraph の AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server を使用して、ClickHouse の SQL Playground と対話可能な LangChain/LangGraph の AI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server を使用して LangChain/LangGraph AI エージェントを構築する方法

このガイドでは、[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用して、[ClickHouse SQL playground](https://sql.clickhouse.com/) と対話できる [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) ベースの AI エージェントを構築する方法を解説します。

:::note サンプル ノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) にあるノートブックとして利用できます。
:::



## 前提条件 {#prerequisites}

- 利用する環境に Python がインストールされている必要があります。
- 利用する環境に `pip` がインストールされている必要があります。
- Anthropic の API キー、または他の LLM プロバイダーの API キーが必要です。

以下の手順は、Python REPL から、またはスクリプトとして実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール

次のコマンドを実行して、必要なライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
```


## 資格情報を設定する

次に、Anthropic の API キーを指定する必要があります。

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Anthropic APIキーを入力: ········
```

:::note 別の LLM プロバイダーを使用する場合
Anthropic の API キーを持っておらず、別の LLM プロバイダーを使用したい場合は、
クレデンシャルの設定方法が [Langchain Providers ドキュメント](https://python.langchain.com/docs/integrations/providers/) に記載されています。
:::


## MCP Server を初期化する

ClickHouse MCP Server を構成し、ClickHouse SQL Playground を参照先として指定します。

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
```


server_params = StdioServerParameters(
command="uv",
args=[
"run",
"--with", "mcp-clickhouse",
"--python", "3.13",
"mcp-clickhouse"
],
env={
"CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
"CLICKHOUSE_PORT": "8443",
"CLICKHOUSE_USER": "demo",
"CLICKHOUSE_PASSWORD": "",
"CLICKHOUSE_SECURE": "true"
}
)

````
## ストリームハンドラーの設定 {#configure-the-stream-handler}

LangchainとClickHouse MCP Serverを使用する場合、クエリ結果は単一のレスポンスではなく、ストリーミングデータとして返されることがよくあります。大規模なデータセットや処理に時間がかかる複雑な分析クエリの場合、ストリームハンドラーを設定することが重要です。適切な処理を行わないと、このストリーミング出力をアプリケーションで扱うことが困難になる可能性があります。

ストリーミング出力を扱いやすくするため、ハンドラーを次のように設定します:

```python
class UltraCleanStreamHandler:
    def __init__(self):
        self.buffer = ""
        self.in_text_generation = False
        self.last_was_tool = False

    def handle_chunk(self, chunk):
        event = chunk.get("event", "")

        if event == "on_chat_model_stream":
            data = chunk.get("data", {})
            chunk_data = data.get("chunk", {})

            # 実際のテキストコンテンツのみを処理し、ツール呼び出しストリームはスキップ
            if hasattr(chunk_data, 'content'):
                content = chunk_data.content
                if isinstance(content, str) and not content.startswith('{"'):
                    # 必要に応じてツール完了後にスペースを追加
                    if self.last_was_tool:
                        print(" ", end="", flush=True)
                        self.last_was_tool = False
                    print(content, end="", flush=True)
                    self.in_text_generation = True
                elif isinstance(content, list):
                    for item in content:
                        if (isinstance(item, dict) and
                            item.get('type') == 'text' and
                            'partial_json' not in str(item)):
                            text = item.get('text', '')
                            if text and not text.startswith('{"'):
                                # 必要に応じてツール完了後にスペースを追加
                                if self.last_was_tool:
                                    print(" ", end="", flush=True)
                                    self.last_was_tool = False
                                print(text, end="", flush=True)
                                self.in_text_generation = True

        elif event == "on_tool_start":
            if self.in_text_generation:
                print(f"\n🔧 {chunk.get('name', 'tool')}", end="", flush=True)
                self.in_text_generation = False

        elif event == "on_tool_end":
            print(" ✅", end="", flush=True)
            self.last_was_tool = True
````


## エージェントを呼び出す

最後に、エージェントを呼び出し、ClickHouse へのコードコミット数が最も多いのは誰かを尋ねます。

```python
async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await load_mcp_tools(session)
        agent = create_react_agent("anthropic:claude-sonnet-4-0", tools)
        
        handler = UltraCleanStreamHandler()        
        async for chunk in agent.astream_events(
            {"messages": [{"role": "user", "content": "ClickHouseに最も多くコードをコミットしたのは誰ですか？"}]}, 
            version="v1"
        ):
            handler.handle_chunk(chunk)
            
        print("\n")
```

以下のようなレスポンスが返ってくるはずです。

```response title="Response"
利用可能なデータベースとテーブルを調査してgitコミットデータを特定し、ClickHouseに最も多くのコードをコミットした人物を特定します。
🔧 list_databases ✅ gitコミット情報を含むと思われる`git`データベースを確認しました。このデータベース内のテーブルを調査します:
🔧 list_tables ✅ 完璧です。gitデータベース内の`clickhouse_commits`テーブルに80,644件のコミットを含むClickHouseコミットデータが格納されていることを確認しました。このテーブルには、作成者、追加/削除された行数、変更されたファイルなど、各コミットに関する情報が含まれています。さまざまな指標に基づいて最も多くのコードをコミットした人物を特定するため、このテーブルにクエリを実行します。
🔧 run_select_query ✅ 次に、追加された行数のみを確認して、最も多くの新規コードを貢献した人物を特定します:
🔧 run_select_query ✅ ClickHouseのgitコミットデータに基づくと、**Alexey Milovidov**が複数の指標においてClickHouseに最も多くのコードをコミットしていることが確認できました:
```


## 主な統計情報:

1. **総変更行数が最も多い開発者**: Alexey Milovidov（**総変更行数 1,696,929行**、853,049行追加 + 843,880行削除）
2. **追加行数が最も多い開発者**: Alexey Milovidov（**853,049行追加**）
3. **コミット数が最も多い開発者**: Alexey Milovidov（**15,375コミット**）
4. **変更ファイル数が最も多い開発者**: Alexey Milovidov（**73,529ファイル変更**）



## 追加行数によるトップコントリビューター:

1. **Alexey Milovidov**: 853,049 行を追加 (15,375 コミット)
2. **s-kat**: 541,609 行を追加 (50 コミット)
3. **Nikolai Kochetov**: 219,020 行を追加 (4,218 コミット)
4. **alesapin**: 193,566 行を追加 (4,783 コミット)
5. **Vitaly Baranov**: 168,807 行を追加 (1,152 コミット)

Alexey Milovidov は ClickHouse へのコントリビューションが明らかに最も多く、彼がプロジェクトのオリジナルの作者の一人であり、リード開発者でもあることを踏まえると当然と言えます。彼の貢献は、総コード量とコミット数の両方の点で他の貢献者を大きく上回っており、プロジェクトに追加されたコードは 85 万行以上、コミット数もほぼ 1.6 万件に達しています。

```

</VerticalStepper>
```
