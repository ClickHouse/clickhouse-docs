---
slug: /use-cases/AI/MCP/ai-agent-libraries/mcp-agent
sidebar_label: 'mcp-agent の統合'
title: 'mcp-agent と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'mcp-agent と ClickHouse MCP Server を使って AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'mcp-agent']
show_related_blogs: true
doc_type: 'guide'
---

# CrewAI と ClickHouse MCP Server を使用して AI エージェントを構築する方法

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できる AI エージェント [mcp-agent](https://github.com/lastmile-ai/mcp-agent) を、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を用いて構築する方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb) 内のノートブックとして提供されています。
:::

## 前提条件 {#prerequisites}

- 環境に Python がインストールされている必要があります。
- 環境に `pip` がインストールされている必要があります。
- OpenAI の API キーが必要です。

以下の手順は、Python REPL からでもスクリプトからでも実行できます。

<VerticalStepper headerLevel="h2">
  ## ライブラリのインストール

  以下のコマンドを実行して、mcp-agentライブラリをインストールします。

  ```python
  pip install -q --upgrade pip
  pip install -q mcp-agent openai
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

  次に、ClickHouse SQLプレイグラウンドに接続するための認証情報を定義します。

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## MCPサーバーとmcp-agentエージェントの初期化

  次に、ClickHouse MCP ServerをClickHouse SQLプレイグラウンドに接続するように設定し、
  エージェントを初期化して質問します:

  ```python
  from mcp_agent.app import MCPApp
  from mcp_agent.agents.agent import Agent
  from mcp_agent.workflows.llm.augmented_llm_openai import OpenAIAugmentedLLM
  from mcp_agent.config import Settings, MCPSettings, MCPServerSettings, OpenAISettings
  ```

  ```python
  settings = Settings(
      execution_engine="asyncio",
      openai=OpenAISettings(
          default_model="gpt-5-mini-2025-08-07",
      ),
      mcp=MCPSettings(
          servers={
              "clickhouse": MCPServerSettings(
                  command='uv',
                  args=[
                      "run",
                      "--with", "mcp-clickhouse",
                      "--python", "3.10",
                      "mcp-clickhouse"
                  ],
                  env=env
              ),
          }
      ),
  )

  app = MCPApp(name="mcp_basic_agent", settings=settings)

  async with app.run() as mcp_agent_app:
      logger = mcp_agent_app.logger
      data_agent = Agent(
          name="database-anayst",
          instruction="""ClickHouseデータベースを利用して質問に回答できます。""",
          server_names=["clickhouse"],
      )

      async with data_agent:
          llm = await data_agent.attach_llm(OpenAIAugmentedLLM)
          result = await llm.generate_str(
              message="2025年の英国不動産価格について教えてください。ClickHouseを使用して算出してください。"
          )
          
          logger.info(result)
  ```

  ```response title="Response"
  [10/10/25 11:26:20] INFO     MCPサーバー 'mcp-clickhouse' をトランスポート 'stdio' で起動中                                      server.py:1502
  2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: ListToolsRequest
  2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: ListPromptsRequest
  2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: ListResourcesRequest
  [INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - 推論モデル 'gpt-5-mini-2025-08-07' を推論レベル 'medium' で使用中
  [INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "list_databases",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - 全データベースを一覧表示中
  2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - ClickHouseクライアント接続を sql-clickhouse.clickhouse.com:8443 へユーザー demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
  2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - 38個のデータベースが見つかりました
  [INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "list_tables",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - データベース 'uk' 内のテーブルを一覧表示中
  2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - ClickHouseクライアント接続を sql-clickhouse.clickhouse.com:8443 へユーザー demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
  2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - 9個のテーブルが見つかりました
  [INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "run_select_query",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  [INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "run_select_query",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  [INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "run_select_query",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  [INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "run_select_query",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  [INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエスト中
  {
    "data": {
      "progress_action": "ツール呼び出し中",
      "tool_name": "run_select_query",
      "server_name": "clickhouse",
      "agent_name": "database-anayst"
    }
  }
  2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT
  count(*) AS transactions,
  avg(price) AS avg_price,
  quantileExact(0.5)(price) AS median_price,
  min(price) AS min_price,
  max(price) AS max_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date)=2025
  2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - ClickHouseクライアント接続を sql-clickhouse.clickhouse.com:8443 へユーザー demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
  2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - クエリが1行を返しました
  2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date)=2025
  GROUP BY month
  ORDER BY month
  2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - ClickHouseクライアント接続を sql-clickhouse.clickhouse.com:8443 へユーザー demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
  2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - クエリが8行を返しました
  2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT town, count(*) AS transactions, avg(price) AS avg_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date)=2025
  GROUP BY town
  HAVING transactions >= 50
  ORDER BY avg_price DESC
  LIMIT 10
  2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - ClickHouseクライアント接続を sql-clickhouse.clickhouse.com:8443 へユーザー demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
  2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - クエリが10行を返しました
  2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - リクエストタイプを処理中: CallToolRequest
  2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date) IN (2024,2025)
  GROUP BY year
  ORDER BY year
  2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続を demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 に正常に接続しました
  2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - クエリが 2 行を返しました
  2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - CallToolRequest タイプのリクエストを処理中
  2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - SELECT クエリを実行中: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid
  WHERE toYear(date)=2025
  GROUP BY type
  ORDER BY avg_price DESC
  2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続を demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 に正常に接続しました
  2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - クエリが 5 行を返しました
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 要約 (TL;DR)
  - ClickHouse の UK Price Paid テーブルに基づくと、2025年にこれまで記録された取引は 376,633 件で、平均価格は
  £362,283、中央値は £281,000 です。データには 2025年1月から8月のみが含まれているようです(したがって 2025年は不完全です)。平均値を歪める極端な外れ値(最小 £100、最大 £127,700,000)が存在します。

  計算内容（方法）
  ClickHouseのuk.price-paidテーブルに対して集計を実行しました：
  - uk.uk_price_paid_simple_partitionedからの2025年全体サマリー（件数、平均、中央値、最小値、最大値）
  - 2025年の月次内訳（取引件数、平均、中央値）
  - 2025年の平均価格上位の町（取引件数50件以上の町）
  - 年次比較：2024年対2025年（件数、平均、中央値）
  - uk.uk_price_paidを使用した2025年の物件タイプ別内訳（件数、平均、中央値）

  主要数値（データセットより）
  - 2025年全体（記録された取引）：取引件数 = 376,633件；平均価格 = £362,282.66；中央値価格 = £281,000；最小値 = £100；最大値 = £127,700,000
  - 月別（2025年）：（月、取引件数、平均価格、中央値価格）
    - 1月：53,927件、平均£386,053、中央値£285,000
    - 2月：58,740件、平均£371,803、中央値£285,000
    - 3月：95,274件、平均£377,200、中央値£315,000
    - 4月：24,987件、平均£331,692、中央値£235,000
    - 5月：39,013件、平均£342,380、中央値£255,000
    - 6月：41,446件、平均£334,667、中央値£268,500
    - 7月：44,431件、平均£348,293、中央値£277,500
    - 8月：18,815件、平均£364,653、中央値£292,999
    （データセットには1月から8月のみが含まれています。）
  - 平均価格上位の町（2025年、取引件数50件以上の町）
    - TRING：126件、平均£1,973,274
    - BUCKHURST HILL：98件、平均£1,441,331
    - ASCOT：175件、平均£1,300,748
    - RADLETT：69件、平均£1,160,217
    - COBHAM：115件、平均£1,035,192
    - EAST MOLESEY、BEACONSFIELD、ESHER、CHALFONT ST GILES、THAMES DITTONもトップ10に含まれます（すべて平均価格の高い通勤圏/富裕層の町）。
  - 年次比較（記録された2024年対2025年）
    - 2024年：859,960件、平均£390,879、中央値£280,000
    - 2025年：376,633件、平均£362,283、中央値£281,000
    （データセットには年の一部のみが含まれているため、2025年の件数は大幅に少なくなっています。）
  - 物件タイプ別（2025年）
    - 戸建て：85,362件、平均£495,714、中央値£415,000
    - 半戸建て：107,580件、平均£319,922、中央値£270,000
    - 集合住宅：62,975件、平均£298,529、中央値£227,000
    - テラスハウス：112,832件、平均£286,616、中央値£227,000
    - その他：7,884件、平均£1,087,765（中央値£315,000）— 小規模グループと外れ値の影響に注意

  重要な注意事項とデータ品質に関する注記
  - データセットは2025年の一部のみ（1月から8月のみ）を含んでいるようです。すべての「2025年」の合計は年間全体の数値ではありません。
  - 大きな外れ値が存在します（例：最大値£127.7M、最小値£100）。これらはデータ入力エラーまたは非標準的な記録を含む可能性が高く、平均値を押し上げています。中央値はここではより堅牢な指標となることが多いです。
  - 「その他」の物件タイプの平均値は、件数が少なく不均一であることと外れ値により不安定です。
  - is_new、duration、その他のメタデータによるフィルタリングは行っていません。これらのフィルタは結果を変える可能性があります（例：新築物件や借地権物件を除外する場合）。
  - テーブルはPrice Paid形式の取引記録（記録された売買）であり、希望価格や評価額を直接表すものではありません。

  推奨される次のステップ（実行可能）
  - 明らかな外れ値（例：価格が£10k未満または£10M超）を除外し、平均値/中央値を再計算する。
  - 地域/郡/郵便番号エリアのサマリーとマップを作成する。
  - 2025年を通じたトレンドを示すため、月次比較または3か月移動中央値を計算する。
  - 月別の前年比（YoY）成長率を算出する（例：2025年3月対2024年3月）。
  - 単純な外挿または時系列モデリングを使用して2025年全体を予測する（ただし、欠損月/外れ値の処理方法を決定した後の方が良い）。

  ご希望であれば、以下を実行できます：
  - 極端な外れ値を除去した後、同じ集計を再実行し、クリーンな結果を表示する。
  - 月次前年比成長率とチャートを作成する（グラフ化可能なCSVまたはJSON集計を返すことができます）。
  次にどちらを実行しますか？
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最後のアグリゲータを閉じています。すべての永続接続をシャットダウンしています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - すべての永続サーバー接続を切断しています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: シャットダウンを要求しています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - すべての永続サーバー接続に切断信号を送信しました。
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - 接続マネージャーが正常に閉じられ、コンテキストから削除されました
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp_basic_agent - MCPAppクリーンアップ
  {
    "data": {
      "progress_action": "完了",
      "target": "mcp_basic_agent",
      "agent_name": "mcp_application_loop"
    }
  }
  ```
</VerticalStepper>