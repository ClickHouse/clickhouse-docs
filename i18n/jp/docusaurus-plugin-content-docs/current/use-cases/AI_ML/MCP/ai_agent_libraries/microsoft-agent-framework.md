---
slug: /use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework
sidebar_label: 'Microsoft Agent Framework を統合する'
title: 'Microsoft Agent Framework と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Microsoft Agent Framework と ClickHouse MCP Server で AI エージェントを構築する方法を解説します'
keywords: ['ClickHouse', 'MCP', 'Microsoft']
show_related_blogs: true
doc_type: 'guide'
---



# Microsoft Agent Framework と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[Microsoft Agent Framework](https://github.com/microsoft/agent-framework) と [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使って、[ClickHouse SQL Playground](https://sql.clickhouse.com/) と対話できる AI エージェントを構築する方法を解説します。

:::note Example notebook
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb) 内のノートブックとして提供されています。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- OpenAI APIキーが必要です

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行して、Microsoft Agent Frameworkライブラリをインストールします：

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```


## 認証情報の設定 {#setup-credentials}

次に、OpenAI API キーを指定する必要があります:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

次に、ClickHouse SQL プレイグラウンドへの接続に必要な認証情報を定義します:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCPサーバーとMicrosoft Agent Frameworkエージェントの初期化 {#initialize-mcp-and-agent}

次に、ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドに接続するように設定し、
エージェントを初期化して質問してみます:

```python
from agent_framework import ChatAgent, MCPStdioTool
from agent_framework.openai import OpenAIResponsesClient
```

```python
clickhouse_mcp_server = MCPStdioTool(
    name="clickhouse",
    command="uv",
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ],
    env=env
)


async with ChatAgent(
    chat_client=OpenAIResponsesClient(model_id="gpt-5-mini-2025-08-07"),
    name="HousePricesAgent",
    instructions="You are a helpful assistant that can help query a ClickHouse database",
    tools=clickhouse_mcp_server,
) as agent:
    query = "Tell me about UK property prices over the last five years"
    print(f"User: {query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

このスクリプトの実行結果は以下の通りです:

```response title="Response"
User: 過去5年間の英国不動産価格について教えてください
uk.uk_price_paid_simple_partitionedテーブルで過去5年間(2020年10月から2025年8月まで、toStartOfMonth(date))の英国月次売却価格記録を調査しました。要約と主要なポイント:

測定内容
- 指標: 月次中央値価格、平均価格、取引件数(支払価格記録)。
- 対象期間: 2020年10月1日から2025年8月1日までの月(本日から過去5年間)。

主要な知見
- 中央値価格は£255,000(2020年10月)から£294,500(2025年8月)に上昇 — 5年間で約+15.4%の増加。
  - 中央値の年平均成長率(CAGR)≈ +2.9%。
- 平均価格は約£376,538(2020年10月)から£364,653(2025年8月)にわずかに下落 — 5年間で≈ −3.2%の減少。
  - 平均価格のCAGR ≈ −0.6%。
- この乖離(中央値は上昇、平均はわずかに下落)は、取引構成の変化(超高額売却の減少やその他の構成効果)を示唆しています。平均は外れ値に敏感ですが、中央値はそうではないためです。

データにおける注目すべきパターンと出来事
- 2020年から2021年にかけての大幅な上昇(中央値と平均の両方で確認可能)は、この期間に見られたパンデミック後/印紙税/需要主導の市場急騰と一致しています。
- 2022年半ばごろに平均価格がピーク(平均値~£440k)に達し、その後2022年から2023年にかけて全般的に軟化し、2023年から2024年ごろに安定化。
- 一部の月は大きな変動や異常な件数を示しています(例: 2021年6月は非常に高い取引件数、2025年3月は高い中央値を示すが2025年4月から5月は低い件数)。最近の月(2025年半ば)はテーブル内の取引件数が大幅に少なくなっています — これは最新月の報告が不完全であることを示すことが多く、最近の月次数値は慎重に扱う必要があることを意味します。

データポイントの例(クエリから)
- 2020年10月: 中央値£255,000、平均£376,538、取引件数89,125
- 2022年8月: 平均ピーク~£441,209(中央値~£295,000)
- 2025年3月: 中央値~£314,750(最も高い中央値の一つ)
- 2025年8月: 中央値£294,500、平均£364,653、取引件数18,815(低件数 — おそらく不完全)

注意事項
- これらは取引価格(Price Paidデータセット)です — 実際の住宅「価値」は異なる場合があります。
- 平均は構成と外れ値に敏感です。売却される物件の種類の変化(例: フラットと戸建住宅の混合、地域の混合)は、平均と中央値に異なる影響を与えます。
- 最近の月は不完全な場合があります。異常に低い取引件数を示す月は慎重に扱う必要があります。
- これは全国集計です — 地域差は大きい可能性があります。

ご希望であれば、以下のことができます:
- 時系列での中央値と平均のチャートを作成する。
- 前年比を比較するか、異なる開始/終了月のCAGRを計算する。
- 地域/郡/町、物件タイプ(フラット、テラスハウス、セミデタッチド、戸建)、または価格帯別に分析を細分化する。
- 過去5年間の価格上昇率が最も高い/低い地域の表を表示する。

```


どのフォローアップを選択しますか？

```

</VerticalStepper>
```
