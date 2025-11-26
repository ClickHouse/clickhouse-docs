---
slug: /use-cases/AI/MCP/ai-agent-libraries/mcp-agent
sidebar_label: 'mcp-agent を統合する'
title: 'mcp-agent と ClickHouse MCP Server を用いて AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'mcp-agent と ClickHouse MCP Server を用いて AI エージェントを構築する方法を解説します'
keywords: ['ClickHouse', 'MCP', 'mcp-agent']
show_related_blogs: true
doc_type: 'guide'
---



# CrewAI と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を用いて [ClickHouse SQL playground](https://sql.clickhouse.com/) と対話する [mcp-agent](https://github.com/lastmile-ai/mcp-agent) ベースの AI エージェントの構築方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb) 内のノートブックとして提供されています。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされていること
- システムに`pip`がインストールされていること
- OpenAI APIキーを取得していること

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール

次のコマンドを実行して、`mcp-agent` ライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q mcp-agent openai
pip install -q ipywidgets
```


## 認証情報の設定

次に、OpenAI の API キーを設定する必要があります。

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI APIキーを入力:")
```

```response title="Response"
OpenAI APIキーを入力: ········
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


## MCP Server と mcp-agent エージェントの初期化

次に、ClickHouse MCP Server を ClickHouse SQL Playground を参照するように設定し、
あわせてエージェントを初期化して質問してみます。

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
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - ListToolsRequestタイプのリクエストを処理中
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - ListPromptsRequestタイプのリクエストを処理中
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - ListResourcesRequestタイプのリクエストを処理中
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
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - 全データベースを一覧表示中
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続をdemoとして作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 への接続に成功しました
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
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - データベース 'uk' 内のテーブルを一覧表示中
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続をdemoとして作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 への接続に成功しました
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
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT
count(*) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続をdemoとして作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - クエリが1行を返しました
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続をdemoとして作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - クエリが8行を返しました
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT town, count(*) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続をdemoとして作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - ClickHouseサーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - クエリが10行を返しました
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - CallToolRequestタイプのリクエストを処理中
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 に demo として ClickHouse クライアント接続を作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - ClickHouse サーバーバージョン 25.8.1.8344 に正常に接続しました
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - クエリは 2 行を返しました
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - CallToolRequest タイプのリクエストを処理中
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - SELECT クエリを実行中: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 に demo として ClickHouse クライアント接続を作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - ClickHouse サーバーバージョン 25.8.1.8344 に正常に接続しました
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - クエリは 5 行を返しました
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 要約 (TL;DR)
- ClickHouse の UK Price Paid テーブルに基づくと、2025年にこれまで記録された取引は 376,633 件で、平均価格は
£362,283、中央値は £281,000 です。データには 2025年1月から8月のみが含まれているようです(したがって 2025年のデータは不完全です)。平均を歪める極端な
外れ値(最小 £100、最大 £127,700,000)が存在します。
```



What I computed (how)
ClickHouse 内の uk.price-paid テーブルに対して集計を実行しました:
- uk.uk_price_paid_simple_partitioned から 2025 年全体のサマリ (count, mean, median, min, max)
- 2025 年の月別内訳 (transactions, mean, median)
- 2025 年における平均価格トップの town (取引件数が 50 件以上の town)
- 年次比較: 2024 年 vs 2025 年 (count, mean, median)
- uk.uk_price_paid を用いた 2025 年の物件タイプ別内訳 (counts, avg, median)

Key numbers (from the dataset)
- 2025 年全体 (記録された取引): transactions = 376,633; mean price = £362,282.66; median price = £281,000; min = £100; max =
£127,700,000.
- 月別 (2025): (month, transactions, mean price, median price)
  - Jan: 53,927, mean £386,053, median £285,000
  - Feb: 58,740, mean £371,803, median £285,000
  - Mar: 95,274, mean £377,200, median £315,000
  - Apr: 24,987, mean £331,692, median £235,000
  - May: 39,013, mean £342,380, median £255,000
  - Jun: 41,446, mean £334,667, median £268,500
  - Jul: 44,431, mean £348,293, median £277,500
  - Aug: 18,815, mean £364,653, median £292,999
  (このデータセットには 1–8 月のみが含まれています。)
- 平均価格の高い town トップ (2025 年、取引件数が 50 件以上の town)
  - TRING: 126 txns, avg £1,973,274
  - BUCKHURST HILL: 98 txns, avg £1,441,331
  - ASCOT: 175 txns, avg £1,300,748
  - RADLETT: 69 txns, avg £1,160,217
  - COBHAM: 115 txns, avg £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON もトップ 10 に含まれます (いずれも平均価格の高い通勤圏／富裕層エリアの town)。
- 年次比較 (記録されている 2024 年 vs 2025 年)
  - 2024: 859,960 transactions, mean £390,879, median £280,000
  - 2025: 376,633 transactions, mean £362,283, median £281,000
  (2025 年の件数がかなり少ないのは、このデータセットが年の一部しか含んでいないためです。)
- 物件タイプ別 (2025)
  - detached: 85,362 txns, avg £495,714, median £415,000
  - semi-detached: 107,580 txns, avg £319,922, median £270,000
  - flat: 62,975 txns, avg £298,529, median £227,000
  - terraced: 112,832 txns, avg £286,616, median £227,000
  - other: 7,884 txns, avg £1,087,765 (median £315,000) — 少数グループと外れ値の影響に注意

Important caveats and data quality notes
- このデータセットの 2025 年分は一部のみ (Jan–Aug のみ存在) のように見えます。いずれの「2025」トータルも通年の数値ではありません。
- 大きな外れ値が存在します (例: 最大 £127.7M、最小 £100)。これらには入力ミスや標準的でないレコードが含まれている可能性があり、mean (平均値) を押し上げます。median (中央値) の方がしばしばより頑健な指標になります。
- 「other」物件タイプの平均値は、件数が少なく不均質であることと外れ値のために不安定です。
- is_new、duration、その他メタデータによるフィルタリングは行っていません。そうしたフィルタ (たとえば新築や leasehold を除外するなど) を適用すると結果は変わり得ます。
- これらのテーブルは Price Paid 形式の取引レコード (記録された売買) であり、掲載価格や評価額を直接表すものではありません。



推奨される次のステップ(実行可能)

- 明らかな外れ値(例: 価格が£10k未満または£10M超)を除外し、平均値/中央値を再計算します。
- 地域/郡/郵便番号エリアごとの集計とマップを生成します。
- 月次比較または3ヶ月移動中央値を計算し、2025年を通じたトレンドを表示します。
- 月次の前年同月比(YoY)成長率を生成します(例: 2025年3月 vs 2024年3月)。
- 単純な外挿または時系列モデリングを使用して2025年全体の予測を行います(ただし、欠損月/外れ値の処理方法を決定した後の方が望ましい)。

ご希望であれば、以下を実行できます:

- 極端な外れ値を除外した後、同じ集計を再実行し、クリーニングされた結果を表示します。
- 月次YoY成長率とチャートを生成します(CSV形式またはJSON形式の集計データを返却可能)。
  次にどれを実行しますか?
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最後のアグリゲータを終了し、すべての永続的接続をシャットダウンしています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - すべての永続的サーバー接続を切断しています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - ClickHouse: シャットダウンを要求しています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - すべての永続的サーバー接続に切断シグナルを送信しました。
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - 接続マネージャーが正常に終了し、コンテキストから削除されました
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
```
