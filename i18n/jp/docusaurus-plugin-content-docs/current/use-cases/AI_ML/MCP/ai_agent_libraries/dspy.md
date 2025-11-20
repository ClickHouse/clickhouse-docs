---
slug: /use-cases/AI/MCP/ai-agent-libraries/DSPy
sidebar_label: 'DSPy を統合する'
title: 'DSPy と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'DSPy と ClickHouse MCP Server を使って AI エージェントの構築方法を学びます'
keywords: ['ClickHouse', 'MCP', 'DSPy']
show_related_blogs: true
doc_type: 'guide'
---



# DSPy と ClickHouse MCP Server を使用して AI エージェントを構築する方法

このガイドでは、[DSPy](https://github.com/langchain-ai/langgraph) を使用して、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を通じて対話できる AI エージェントを構築する方法を説明します。



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーが必要です。

以下の手順は、PythonのREPLまたはスクリプトから実行できます。

:::note サンプルノートブック
この例は、[examplesリポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/dspy/dspy.ipynb)でノートブックとして確認できます。
:::

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

`pip`を使用して以下のコマンドを実行し、必要なライブラリをインストールします：

```shell
pip install -q --upgrade pip
pip install -q dspy
pip install -q mcp
```


## 認証情報の設定 {#setup-credentials}

次に、Anthropic APIキーを指定する必要があります：

```python
import os
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Anthropic APIキーを入力してください:")
```

:::note 別のLLMプロバイダーを使用する場合
Anthropic APIキーをお持ちでない場合や、別のLLMプロバイダーを使用したい場合は、
[DSPyドキュメント](https://dspy.ai/#__tabbed_1_1)で認証情報の設定手順を確認できます
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


## MCP サーバーの初期化 {#initialize-mcp}

次に、ClickHouse MCP サーバーが ClickHouse SQL プレイグラウンドを参照するように設定します。

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


## LLMの初期化 {#initialize-llm}

次に、以下のコードでLLMを初期化します。

```python
dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-20250514"))
```


## エージェントの実行 {#run-the-agent}

最後に、エージェントを初期化して実行します：

```python
class DataAnalyst(dspy.Signature):
    """あなたはデータアナリストです。質問を受け、利用可能なツールを使用して回答を試みる必要があります。"""

    user_request: str = dspy.InputField()
    process_result: str = dspy.OutputField(
        desc=(
            "クエリへの回答"
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
        result = await react.acall(user_request="最も人気のあるAmazon製品カテゴリは何ですか")
        print_dspy_result(result)
```

```response title="レスポンス"
================================================================================
🤖 DSPy ReAct 結果
================================================================================

📍 ステップ 1
----------------------------------------
🧠 思考: Amazon製品カテゴリに関する情報を見つけ、最も人気のあるものを特定する必要があります。まず、Amazon関連のデータがあるかどうかを確認するために、利用可能なデータベースを調べます。

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
🧠 思考: 素晴らしい！「amazon」データベースが利用可能であることが確認できました。これはAmazon製品カテゴリに関する情報を見つけるために必要なものです。amazonデータベース内のテーブルを調べて、どのようなデータが利用可能かを確認します。

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
🧠 思考: 完璧です！product_category列を含むamazon_reviewsテーブルを見つけました。このテーブルには1億5000万行を超えるAmazonレビューデータがあり、製品の人気度を適切に表現できるはずです。最も人気のあるAmazon製品カテゴリを見つけるには、カテゴリごとのレビュー数をカウントし、カウント数の降順で並べ替える必要があります。最も多くのレビューを持つカテゴリが最も人気があると見なされます。

🔧 ツール: run_select_query
   引数: {'query': 'SELECT product_category, COUNT(*) as review_count FROM amazon.amazon_reviews GROUP BY product_category ORDER BY review_count DESC LIMIT 10'}

📊 結果:
   1. Books: 19,530,930件のレビュー
   2. Digital_Ebook_Purchase: 17,622,107件のレビュー
   3. Wireless: 9,001,567件のレビュー
   4. PC: 6,908,245件のレビュー
   5. Home: 6,221,321件のレビュー
   ... その他5件

📍 ステップ 4
----------------------------------------
🧠 思考: 完璧です！ユーザーの質問に対する答えが見つかりました。Amazonレビューデータに基づくと、「Books」が19,530,930件のレビューで最も人気のあるAmazon製品カテゴリであり、次いで「Digital_Ebook_Purchase」が17,622,107件のレビューであることが明確にわかります。データは、各カテゴリが受け取ったレビュー数に基づいて、製品カテゴリの人気度の明確なランキングを示しています。ユーザーの質問に答えるために必要なすべての情報が揃いました。

🔧 ツール: finish

📊 結果:
   完了しました。

🎯 推論
----------------------------------------
最も人気のあるAmazon製品カテゴリに関する質問に答えるため、Amazonデータベースにアクセスし、1億5000万件を超えるレビューレコードを含む「amazon_reviews」というテーブルを見つけました。このテーブルには「product_category」列があり、レビュー数に基づいて製品の人気度を分析できます。製品カテゴリごとのレビュー数をカウントし、カウント数の降順で並べ替えるクエリを実行しました。ここでの前提は、レビュー数が多いカテゴリほど人気が高いということです。これは、レビュー数が多いほど購入数や顧客エンゲージメントが高いことと相関する傾向があるためです。

✅ 最終結果
----------------------------------------
1億5000万件を超えるレコードを含むAmazonレビューデータに基づくと、最も人気のあるAmazon製品カテゴリは**Books**で、19,530,930件のレビューがあります。

```


以下は、レビュー数が最も多い Amazon の人気商品カテゴリ上位 10 件です。

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

# Books と Digital&#95;Ebook&#95;Purchase（関連する 2 つのカテゴリ）だけで合計 3,700 万件以上のレビューがあり、Amazon のプラットフォームにおける読書関連コンテンツの非常に高い人気がうかがえます。

```
</VerticalStepper>
```
