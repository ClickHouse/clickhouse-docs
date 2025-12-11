---
slug: /use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework
sidebar_label: 'Microsoft Agent Framework を統合する'
title: 'Microsoft Agent Framework と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Microsoft Agent Framework と ClickHouse MCP Server で AI エージェントを構築する方法を学ぶ'
keywords: ['ClickHouse', 'MCP', 'Microsoft']
show_related_blogs: true
doc_type: 'guide'
---

# Microsoft Agent Framework と ClickHouse MCP Server を使用して AI エージェントを構築する方法 {#how-to-build-an-ai-agent-with-microsoft-agent-framework-and-the-clickhouse-mcp-server}

このガイドでは、[Microsoft Agent Framework](https://github.com/microsoft/agent-framework) を使って、[ClickHouse の SQL Playground](https://sql.clickhouse.com/) と対話できる AI エージェントを [ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を通じて構築する方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb) 内のノートブックとして確認できます。
:::

## 前提条件 {#prerequisites}

- システムに Python がインストールされている必要があります。
- システムに `pip` がインストールされている必要があります。
- OpenAI の API キーが必要です。

以下の手順は、Python REPL からでもスクリプトとしてでも実行できます。

<VerticalStepper headerLevel="h2">
  ## ライブラリのインストール

  以下のコマンドを実行して、Microsoft Agent Frameworkライブラリをインストールします：

  ```python
  pip install -q --upgrade pip
  pip install -q agent-framework --pre
  pip install -q ipywidgets
  ```

  ## 認証情報の設定

  次に、OpenAI APIキーを指定する必要があります:

  ```python
  import os, getpass
  os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
  ```

  ```response title="Response"
  OpenAI APIキーを入力: ········
  ```

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

  ## MCPサーバーとMicrosoft Agent Frameworkエージェントの初期化

  次に、ClickHouse MCP ServerをClickHouse SQLプレイグラウンドに接続するよう設定し、
  エージェントを初期化して質問します:

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
      instructions="ClickHouseデータベースへのクエリをサポートする支援アシスタントです",
      tools=clickhouse_mcp_server,
  ) as agent:
      query = "過去5年間の英国の不動産価格について教えてください"
      print(f"ユーザー: {query}")
      async for chunk in agent.run_stream(query):
          print(chunk.text, end="", flush=True)
      print("\n\n")
  ```

  このスクリプトを実行した結果は以下の通りです:

  ```response title="Response"
  ユーザー: 過去5年間の英国不動産価格について教えてください
  uk.uk_price_paid_simple_partitionedテーブルの過去5年間（2020年10月～2025年8月、toStartOfMonth(date)使用）の英国月次売却価格記録を分析しました。概要と主要ポイント:

  測定項目
  - 指標: 月次中央値価格、平均価格、取引件数（支払価格記録）
  - 対象期間: 2020年10月1日～2025年8月1日（本日から過去5年間）

  主要な分析結果
  - 中央値価格は£255,000（2020年10月）から£294,500（2025年8月）に上昇 — 5年間で約+15.4%の増加
    - 中央値の年平均成長率（CAGR）≈ +2.9%
  - 平均価格は約£376,538（2020年10月）から£364,653（2025年8月）にわずかに下落 — 5年間で≈ −3.2%の減少
    - 平均価格のCAGR ≈ −0.6%
  - この乖離（中央値は上昇、平均はわずかに下落）は、取引構成の変化（超高額物件の売却減少など）を示唆しています。平均値は外れ値の影響を受けやすい一方、中央値は影響を受けにくいためです。

  データから見られる注目すべきパターンと事象
  - 2020年～2021年にかけての大幅な上昇（中央値・平均値の両方で確認）は、この期間に見られたパンデミック後/印紙税優遇/需要主導型市場の急騰と一致しています。
  - 2022年半ばごろに平均価格がピーク（平均値約£440k）に達し、その後2022年～2023年にかけて全般的に軟化、2023年～2024年ごろに安定化しました。
  - 一部の月では大きな変動や異常な件数が見られます（例: 2021年6月は非常に高い取引件数を記録、2025年3月は高い中央値を示すが2025年4月～5月は低い件数）。直近の月（2025年半ば）はテーブル内の取引件数が大幅に少なくなっています — これは最新月のデータ報告が不完全であることを示す場合が多く、直近の月次数値は慎重に扱う必要があります。

  データポイントの例（クエリ結果より）
  - 2020年10月: 中央値£255,000、平均£376,538、取引件数89,125
  - 2022年8月: 平均ピーク約£441,209（中央値約£295,000）
  - 2025年3月: 中央値約£314,750（最高中央値の一つ）
  - 2025年8月: 中央値£294,500、平均£364,653、取引件数18,815（低件数 — データ不完全の可能性が高い）

  注意事項
  - これらは取引価格（Price Paidデータセット）であり、実際の住宅「評価額」とは異なる場合があります。
  - 平均値は構成と外れ値の影響を受けやすくなっています。売却される物件タイプの変化（例: フラットと一戸建ての割合、地域構成）は、平均値と中央値に異なる影響を与えます。
  - 直近の月はデータが不完全な場合があります。異常に低い取引件数を示す月は慎重に扱う必要があります。
  - これは全国集計データです — 地域差は大きい可能性があります。

  ご希望であれば、以下の分析を実行できます:
  - 時系列での中央値と平均値のチャート作成
  - 前年比の比較、または異なる開始/終了月のCAGR計算
  - 地域/郡/町、物件タイプ（フラット、テラスハウス、セミデタッチド、一戸建て）、または価格帯別の分析
  - 過去5年間の価格上昇率上位/下位地域の表示

  どの分析をご希望ですか？
  ```
</VerticalStepper>