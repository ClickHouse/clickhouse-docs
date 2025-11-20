---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'LlamaIndex を統合する'
title: 'ClickHouse MCP Server を使って LlamaIndex AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と対話できる LlamaIndex AI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server を使用して LlamaIndex AI エージェントを構築する方法

このガイドでは、[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使用して、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できる [LlamaIndex](https://docs.llamaindex.ai) 製 AI エージェントを構築する方法を説明します。

:::note Example notebook
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb) にあるノートブックとして参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされていること
- システムに`pip`がインストールされていること
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーを取得していること

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行して、必要なライブラリをインストールします：

```python
pip install -q --upgrade pip
pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
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

:::note 別の LLM プロバイダーを使用する場合
Anthropic API キーをお持ちでない場合や、別の LLM プロバイダーを使用したい場合は、
[LlamaIndex "LLMs" ドキュメント](https://docs.llamaindex.ai/en/stable/examples/)で認証情報の設定手順を確認できます。
:::


## MCP サーバーの初期化 {#initialize-mcp-and-agent}

次に、ClickHouse MCP サーバーを ClickHouse SQL プレイグラウンドに接続するように設定します。
これらを Python 関数から Llama Index ツールに変換する必要があります:

```python
from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

mcp_client = BasicMCPClient(
    "uv",
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

mcp_tool_spec = McpToolSpec(
    client=mcp_client,
)

```


tools = await mcp&#95;tool&#95;spec.to&#95;tool&#95;list&#95;async()

````
## エージェントの作成 {#create-agent}

これで、これらのツールにアクセス可能なエージェントを作成する準備が整いました。1回の実行でのツール呼び出しの最大回数を10に設定します。このパラメータは必要に応じて変更可能です:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
````


## LLMの初期化 {#initialize-llm}

以下のコードでClaude Sonnet 4.0モデルを初期化します：

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```


## エージェントの実行 {#run-agent}

最後に、エージェントに質問することができます：

```python
response = agent.query("What's the most popular repository?")
```

レスポンスは長いため、以下の例では一部省略されています：

```response title="Response"
Added user message to memory: What's the most popular repository?
=== LLM Response ===
最も人気のあるリポジトリを見つけるお手伝いをします。まず、データ構造を理解するために利用可能なデータベースとテーブルを確認してみましょう。
=== Calling Function ===
Calling function: list_databases with args: {}
=== Function Output ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM Response ===
`github`データベースがあり、リポジトリデータが含まれている可能性があります。このデータベース内のテーブルを確認してみましょう。
=== Calling Function ===
Calling function: list_tables with args: {"database": "github"}
=== Function Output ===
...
...
...
=== LLM Response ===
GitHubデータに基づくと、**最も人気のあるリポジトリは`sindresorhus/awesome`**で、**402,292スター**を獲得しています。

スター数による上位10リポジトリは以下の通りです：

1. **sindresorhus/awesome** - 402,292スター
2. **996icu/996.ICU** - 388,413スター
3. **kamranahmedse/developer-roadmap** - 349,097スター
4. **donnemartin/system-design-primer** - 316,524スター
5. **jwasham/coding-interview-university** - 313,767スター
6. **public-apis/public-apis** - 307,227スター
7. **EbookFoundation/free-programming-books** - 298,890スター
8. **facebook/react** - 286,034スター
9. **vinta/awesome-python** - 269,320スター
10. **freeCodeCamp/freeCodeCamp** - 261,824スター

`sindresorhus/awesome`リポジトリは、厳選されたリストのコレクションであり、ソフトウェア開発における多様なトピックのリソースを網羅的にまとめたディレクトリとして機能しているため、高い人気を誇っています。
```

</VerticalStepper>
