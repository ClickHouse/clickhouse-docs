---
slug: /use-cases/AI/MCP/ai-agent-libraries/DSPy
sidebar_label: 'DSPy との統合'
title: 'DSPy と ClickHouse MCP Server を使って AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'DSPy と ClickHouse MCP Server を使って AI エージェントを構築する方法を説明します'
keywords: ['ClickHouse', 'MCP', 'DSPy']
show_related_blogs: true
doc_type: 'guide'
---



# DSPy と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[DSPy](https://github.com/langchain-ai/langgraph) と [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用して、[ClickHouse の SQL Playground](https://sql.clickhouse.com/) と対話できる AI エージェントを構築する方法を学びます。



## 前提条件 {#prerequisites}

- システムに Python がインストールされている必要があります。
- システムに `pip` がインストールされている必要があります。
- Anthropic の API キー、または他の LLM プロバイダーの API キーのいずれかが必要です。

以下の手順は、Python REPL から実行することも、スクリプトとして実行することもできます。

:::note サンプル ノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/dspy/dspy.ipynb) にノートブックとして含まれています。
:::

<VerticalStepper headerLevel="h2">


## ライブラリのインストール

必要なライブラリをインストールするために、`pip` を使って次のコマンドを実行します。

```shell
pip install -q --upgrade pip
pip install -q dspy
pip install -q mcp
```


## 認証情報の設定

次に、Anthropic API キーを入力する必要があります。

```python
import os
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Anthropic API キーを入力してください:")
```

:::note 別の LLM プロバイダーを利用する場合
Anthropic の API キーをお持ちでなく、別の LLM プロバイダーを使いたい場合は、
認証情報の設定手順が [DSPy ドキュメント](https://dspy.ai/#__tabbed_1_1) に記載されています。
:::

次に、ClickHouse SQL Playground に接続するために必要な認証情報を定義します。

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCP サーバーの初期化

次に、ClickHouse MCP Server が ClickHouse SQL Playground を参照するように設定します。

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import dspy

server_params = StdioServerParameters(
    command="uv",
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
```


## LLM の初期化

次に、以下の行を使って LLM を初期化します。

```python
dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-20250514"))
```


## エージェントを実行する

最後に、エージェントを初期化して実行します。

```python
class DataAnalyst(dspy.Signature):
    """あなたはデータアナリストです。さまざまな質問が与えられるので、利用可能なツールを使って可能な限り回答してください。 """

    user_request: str = dspy.InputField()
    process_result: str = dspy.OutputField(
        desc=(
            "クエリに対する回答"
        )
    )

from utils import print_dspy_result

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()

        dspy_tools = []
        for tool in tools.tools:
            dspy_tools.append(dspy.Tool.from_mcp_tool(session, tool))

        react = dspy.ReAct(DataAnalyst, tools=dspy_tools)
        result = await react.acall(user_request="最も人気のある Amazon の商品カテゴリーは何ですか")
        print_dspy_result(result)
```

```response title="Response"
================================================================================
🤖 DSPy ReAct 結果
================================================================================

📍 ステップ 1
----------------------------------------
🧠 THINKING: Amazon の商品カテゴリに関する情報を見つけて、どのカテゴリが最も人気があるかを特定する必要がある。まず、利用可能なデータベースを調べて、Amazon 関連のデータがあるかどうかを確認しよう。

🔧 ツール: list_databases

📊 結果:
   amazon
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
logs
metrica
mgbench
mta
noaa
nyc_taxi
nypd
ontime
opensky
otel
otel_v2
pypi
random
reddit
rubygems
sta...

📍 ステップ 2
----------------------------------------
🧠 THINKING: よし！「amazon」データベースが利用可能なのが確認できた。これは Amazon の商品カテゴリに関する情報を見つけるためにまさに必要なものだ。amazon データベース内のテーブルを調べて、どのようなデータがあるか見てみよう。

🔧 ツール: list_tables
   引数: {'database': 'amazon'}

📊 結果:
   {
  "database": "amazon",
  "name": "amazon_reviews",
  "comment": "",
  "columns": [
    {
      "name": "review_date",
      "type": "Date",
      "default_type": "",
      "default_expression": "",...

📍 ステップ 3
----------------------------------------
🧠 THINKING: 完璧だ！product_category 列を含む amazon_reviews テーブルを見つけた。このテーブルには 1 億 5,000 万行を超える Amazon のレビューデータが含まれており、商品の人気度を判断するうえで十分代表性のあるデータになっているはずだ。最も人気のある Amazon の商品カテゴリを見つけるには、カテゴリごとにレビュー数を集計し、その数で降順に並べ替える必要がある。レビュー数が最も多いカテゴリが、最も人気があると見なされる。

🔧 ツール: run_select_query
   Args: {'query': 'SELECT product_category, COUNT(*) as review_count FROM amazon.amazon_reviews GROUP BY product_category ORDER BY review_count DESC LIMIT 10'}

📊 結果:
   1. Books: 19,530,930 件のレビュー
   2. Digital_Ebook_Purchase: 17,622,107 件のレビュー
   3. Wireless: 9,001,567 件のレビュー
   4. PC: 6,908,245 件のレビュー
   5. Home: 6,221,321 件のレビュー
   … そのほか 5 つ

📍 ステップ 4
----------------------------------------
🧠 THINKING: 完璧だ！ユーザーの質問への答えを見つけることができた。Amazon レビューデータに基づくと、「Books」が 19,530,930 件のレビューで最も人気のある Amazon の商品カテゴリであり、続いて「Digital_Ebook_Purchase」が 17,622,107 件のレビューとなっていることがはっきりわかる。このデータは、各カテゴリが受け取ったレビュー数に基づいて、商品カテゴリの人気度に明確なランキングがあることを示している。これでユーザーの質問に答えるために必要な情報はすべてそろった。

🔧 ツール: finish

📊 結果:
   完了しました。

🎯 推論
----------------------------------------
最も人気のある Amazon の商品カテゴリに関する質問に答えるために、Amazon データベースにアクセスし、1 億 5,000 万件を超えるレビュー記録を持つ「amazon_reviews」というテーブルを見つけた。このテーブルには「product_category」列があり、レビュー数に基づいて商品の人気度を分析できる。カテゴリごとのレビュー数を集計し、その数で降順に並べ替えるクエリを実行した。ここでの前提は、レビュー数が多いカテゴリほど人気が高いとみなせるというものであり、一般的にレビュー数の多さは購入数やユーザーエンゲージメントの高さと相関付けられる、という考えに基づいている。

✅ 最終結果
----------------------------------------
1 億 5,000 万件を超える Amazon レビューデータに基づくと、最も人気のある Amazon の商品カテゴリは、レビュー件数 19,530,930 件の **Books** である。
```


以下は、レビュー数に基づく Amazon の人気商品カテゴリー上位 10 個です。

1. **Books** - 19,530,930 件のレビュー
2. **Digital&#95;Ebook&#95;Purchase** - 17,622,107 件のレビュー
3. **Wireless** - 9,001,567 件のレビュー
4. **PC** - 6,908,245 件のレビュー
5. **Home** - 6,221,321 件のレビュー
6. **Apparel** - 5,906,085 件のレビュー
7. **Health &amp; Personal Care** - 5,331,239 件のレビュー
8. **Beauty** - 5,115,462 件のレビュー
9. **Video DVD** - 5,069,014 件のレビュー
10. **Mobile&#95;Apps** - 5,033,164 件のレビュー

# Books と Digital&#95;Ebook&#95;Purchase（関連する 2 つのカテゴリー）を合わせると、レビュー数が 3,700 万件を超えており、Amazon プラットフォーム上での読書関連コンテンツの強い人気がうかがえます。

```
</VerticalStepper>
```
