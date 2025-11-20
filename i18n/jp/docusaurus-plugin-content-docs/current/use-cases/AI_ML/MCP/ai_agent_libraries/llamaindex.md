---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'LlamaIndex を統合する'
title: 'ClickHouse MCP Server を使用して LlamaIndex AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と連携して動作する LlamaIndex AI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server を使用して LlamaIndex AI エージェントを構築する方法

このガイドでは、[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使って、[ClickHouse の SQL Playground](https://sql.clickhouse.com/) と対話できる [LlamaIndex](https://docs.llamaindex.ai) 製の AI エージェントを構築する方法を説明します。

:::note Example notebook
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb) にあるノートブックとしても参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーが必要です。

以下の手順は、PythonのREPLまたはスクリプトから実行できます。

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

:::note 別の LLM プロバイダーの使用
Anthropic API キーをお持ちでない場合や、別の LLM プロバイダーを使用したい場合は、
[LlamaIndex "LLMs" ドキュメント](https://docs.llamaindex.ai/en/stable/examples/)で認証情報の設定手順を確認できます。
:::


## MCP サーバーの初期化 {#initialize-mcp-and-agent}

次に、ClickHouse MCP Server を ClickHouse SQL プレイグラウンドに接続するように設定します。
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

これで、これらのツールにアクセス可能なエージェントを作成する準備が整いました。1回の実行におけるツール呼び出しの最大回数を10に設定します。このパラメータは必要に応じて変更可能です:

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


## エージェントを実行する {#run-agent}

最後に、エージェントに質問することができます：

```python
response = agent.query("What's the most popular repository?")
```

レスポンスは長いため、以下の例では一部省略されています：

```response title="Response"
Added user message to memory: What's the most popular repository?
=== LLM Response ===
I'll help you find the most popular repository. Let me first explore the available databases and tables to understand the data structure.
=== Calling Function ===
Calling function: list_databases with args: {}
=== Function Output ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM Response ===
I can see there's a `github` database which likely contains repository data. Let me explore the tables in that database.
=== Calling Function ===
Calling function: list_tables with args: {"database": "github"}
=== Function Output ===
...
...
...
=== LLM Response ===
Based on the GitHub data, **the most popular repository is `sindresorhus/awesome`** with **402,292 stars**.

Here are the top 10 most popular repositories by star count:

1. **sindresorhus/awesome** - 402,292 stars
2. **996icu/996.ICU** - 388,413 stars
3. **kamranahmedse/developer-roadmap** - 349,097 stars
4. **donnemartin/system-design-primer** - 316,524 stars
5. **jwasham/coding-interview-university** - 313,767 stars
6. **public-apis/public-apis** - 307,227 stars
7. **EbookFoundation/free-programming-books** - 298,890 stars
8. **facebook/react** - 286,034 stars
9. **vinta/awesome-python** - 269,320 stars
10. **freeCodeCamp/freeCodeCamp** - 261,824 stars

The `sindresorhus/awesome` repository is a curated list of awesome lists, which explains its popularity as it serves as a comprehensive directory of resources across many different topics in software development.
```

</VerticalStepper>
