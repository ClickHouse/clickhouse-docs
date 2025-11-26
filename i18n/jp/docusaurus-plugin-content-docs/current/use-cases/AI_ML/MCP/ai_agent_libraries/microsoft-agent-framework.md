---
slug: /use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework
sidebar_label: 'Microsoft Agent Framework を統合する'
title: 'Microsoft Agent Framework と ClickHouse MCP Server を使って AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Microsoft Agent Framework と ClickHouse MCP Server を使って AI エージェントを構築する方法について学びます'
keywords: ['ClickHouse', 'MCP', 'Microsoft']
show_related_blogs: true
doc_type: 'guide'
---



# Microsoft Agent Framework と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[Microsoft Agent Framework](https://github.com/microsoft/agent-framework) を使い、[ClickHouse の SQL Playground](https://sql.clickhouse.com/) と対話できる AI エージェントを、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用して構築する方法を説明します。

:::note Example notebook
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb) 内のノートブックとして確認できます。
:::



## 前提条件 {#prerequisites}

- システムに Python がインストールされている必要があります。
- システムに `pip` がインストールされている必要があります。
- OpenAI の API キーが必要です。

以下の手順は、Python の REPL からでもスクリプトとしてでも実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール

次のコマンドを実行して、Microsoft Agent Framework ライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```


## 認証情報を設定する

次に、OpenAI API キーを入力する必要があります。

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI APIキーを入力してください:")
```

```response title="Response"
OpenAI API キーを入力してください: ········
```

次に、ClickHouse SQL Playground への接続に必要な認証情報を定義します。

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCP Server と Microsoft Agent Framework エージェントの初期化

ここでは、ClickHouse MCP Server を ClickHouse の SQL playground を参照するように設定し、
あわせてエージェントを初期化して、質問してみます。

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
    instructions="あなたは、ClickHouse データベースへのクエリ実行を支援する役立つアシスタントです",
    tools=clickhouse_mcp_server,
) as agent:
    query = "過去5年間の英国の不動産価格について教えてください"
    print(f"ユーザー: {query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

このスクリプトを実行した際の出力は次のとおりです。

```response title="Response"
ユーザー: 過去5年間のUK不動産価格について教えてください
uk.uk_price_paid_simple_partitioned テーブルの過去5年間の月次UK売却価格記録を調べました（toStartOfMonth(date)、2020年10月から2025年8月まで）。要約と主要ポイント：

測定した内容
- 指標：月次中央値価格、平均価格、および取引数（売却価格記録）。
- 対象期間：2020-10-01から2025-08-01までの月（今日からの過去5年間）。

主な所見
- 中央値価格は£255,000（2020-10）から£294,500（2025-08）へ上昇——5年間で約+15.4%の増加。
  - 中央値の等価複合年間成長率（CAGR）は年あたり約+2.9%。
- 平均価格は約£376,538（2020-10）から£364,653（2025-08）へわずかに下落——5年間で約−3.2%の減少。
  - 平均価格のCAGRは年あたり約−0.6%。
- この乖離（中央値の上昇と平均のわずかな下落）は、取引の構成変化（高額売却の減少やその他の要因）を示唆しており、平均は外れ値に敏感であるのに対し、中央値は影響を受けにくいためです。

データ内の注目すべきパターンと出来事
- 2020–2021年の強い上昇（中央値と平均の両方で顕著）——これはその時期のパンデミック後・印紙税・需要主導の市場急騰と一致します。
- 2022年中頃の平均価格ピーク（平均値約£440k）、その後2022–2023年にかけての全体的な軟化と、2023–2024年頃の安定化。
- 一部の月で大きな変動や異常な取引数が見られます（例：2021年6月と2021年6月は取引数が非常に多かった；2025年3月は高い中央値を示すが、2025年4–5月は取引数が少ない）。最近の月（2025年中頃）はテーブル内の取引数が大幅に少なく——これは最新月の報告が不完全であることを示すことが多く、最近の月次データは慎重に扱うべきです。

クエリからの例データポイント
- 2020-10：中央値 £255,000、平均 £376,538、取引数 89,125
- 2022-08：平均ピーク ≈£441,209（中央値 ≈£295,000）
- 2025-03：中央値 ≈£314,750（最も高い中央値の一つ）
- 2025-08：中央値 £294,500、平均 £364,653、取引数 18,815（取引数が少ない——おそらく不完全）

注意事項
- これらは取引価格（Price Paid データセット）です——実際の住宅価値とは異なる場合があります。
- 平均は構成や外れ値に敏感です。売却物件の種類の変化（例：フラットと独立家屋の割合、地域の混合）は、平均と中央値に異なる影響を及ぼします。
- 最近の月は不完全な場合があります；取引数が異常に少ない月は注意が必要です。
- これは全国集計です——地域差は大きい可能性があります。

ご希望であれば、以下を提供できます：
- 時間経過に伴う中央値と平均のチャートを作成。
- 年次比較、または異なる開始/終了月でのCAGR計算。
- 分析を地域/郡/町別、物件タイプ（flat, terraced, semi, detached）、または価格帯別に分解。
- 過去5年間の価格成長の上位/下位地域のテーブルを表示。
```


どのフォローアップを選択しますか？

```

</VerticalStepper>
```
