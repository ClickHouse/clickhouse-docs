---
slug: /use-cases/AI/MCP/ai-agent-libraries/mcp-agent
sidebar_label: 'mcp-agent を統合する'
title: 'mcp-agent と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'mcp-agent と ClickHouse MCP Server で AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'mcp-agent']
show_related_blogs: true
doc_type: 'guide'
---



# CrewAI と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できるようにするために、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用した [mcp-agent](https://github.com/lastmile-ai/mcp-agent) AI エージェントの構築方法を説明します。

:::note Example notebook
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb) にあるノートブックとして確認できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- OpenAI APIキーが必要です

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行して mcp-agent ライブラリをインストールします：

```python
pip install -q --upgrade pip
pip install -q mcp-agent openai
pip install -q ipywidgets
```


## 認証情報の設定 {#setup-credentials}

次に、OpenAI APIキーを指定する必要があります:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

次に、ClickHouse SQLプレイグラウンドへの接続に必要な認証情報を定義します:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCPサーバーとmcp-agentエージェントの初期化 {#initialize-mcp-and-agent}

次に、ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドに接続するように設定し、
エージェントを初期化して質問してみます:

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
            message="2025年の英国不動産価格について教えてください。ClickHouseを使用して計算してください。"
        )

        logger.info(result)
```


```response title="Response"
[10/10/25 11:26:20] INFO     Starting MCP server 'mcp-clickhouse' with transport 'stdio'                                      server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - Processing request of type ListPromptsRequest
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - Processing request of type ListResourcesRequest
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - Using reasoning model 'gpt-5-mini-2025-08-07' with
'medium' reasoning effort
[INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "list_databases",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Listing all databases
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Found 38 databases
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "list_tables",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Listing tables in database 'uk'
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Found 9 tables
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Executing SELECT query: SELECT
count(*) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - Query returned 1 rows
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Query returned 8 rows
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Executing SELECT query: SELECT town, count(*) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - Query returned 10 rows
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続を demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - クエリが2行を返しました
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - CallToolRequest 型のリクエストを処理中
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - sql-clickhouse.clickhouse.com:8443 へのClickHouseクライアント接続を demo として作成中 (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - ClickHouseサーバー バージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - クエリが5行を返しました
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 要約 (TL;DR)
- ClickHouseのUK Price Paidテーブルに基づくと、2025年にこれまで記録された取引は376,633件で、平均価格は£362,283、中央値は£281,000です。データには2025年1月から8月のみが含まれているようです(つまり2025年は不完全です)。平均値を歪める極端な外れ値(最小£100、最大£127,700,000)が存在します。
```



私が計算した内容（方法）
ClickHouse の uk.price-paid テーブルに対して集計を実行しました:
- uk.uk_price_paid_simple_partitioned を用いた 2025 年全体のサマリー（件数、平均、中央値、最小値、最大値）
- 2025 年の月別内訳（取引件数、平均、中央値）
- 2025 年の平均価格が高い上位の町（取引件数が 50 件以上の町）
- 年次比較: 2024 年 vs 2025 年（件数、平均、中央値）
- uk.uk_price_paid を用いた 2025 年の物件タイプ別内訳（件数、平均、中央値）

主要な数値（このデータセットから）
- 2025 年全体（記録された取引）: 取引件数 = 376,633 件; 平均価格 = £362,282.66; 中央値 = £281,000; 最小値 = £100; 最大値 =
£127,700,000。
- 月別（2025 年）:（月、取引件数、平均価格、中央値）
  - 1 月: 53,927 件、平均 £386,053、中央値 £285,000
  - 2 月: 58,740 件、平均 £371,803、中央値 £285,000
  - 3 月: 95,274 件、平均 £377,200、中央値 £315,000
  - 4 月: 24,987 件、平均 £331,692、中央値 £235,000
  - 5 月: 39,013 件、平均 £342,380、中央値 £255,000
  - 6 月: 41,446 件、平均 £334,667、中央値 £268,500
  - 7 月: 44,431 件、平均 £348,293、中央値 £277,500
  - 8 月: 18,815 件、平均 £364,653、中央値 £292,999
  （このデータセットには 1〜8 月のデータのみ含まれます。）
- 平均価格が高い上位の町（2025 年、取引件数 ≥ 50 の町）
  - TRING: 126 件、平均 £1,973,274
  - BUCKHURST HILL: 98 件、平均 £1,441,331
  - ASCOT: 175 件、平均 £1,300,748
  - RADLETT: 69 件、平均 £1,160,217
  - COBHAM: 115 件、平均 £1,035,192
  - EAST MOLESEY、BEACONSFIELD、ESHER、CHALFONT ST GILES、THAMES DITTON もトップ 10 に含まれます（いずれも平均価格が高い通勤圏／富裕層向けの町）。
- 年次比較（2024 年 vs 2025 年、記録ベース）
  - 2024 年: 859,960 件の取引、平均 £390,879、中央値 £280,000
  - 2025 年: 376,633 件の取引、平均 £362,283、中央値 £281,000
  （2025 年の件数が大幅に少ないのは、このデータセットが年の一部のみを含んでいるためです。）
- 物件タイプ別（2025 年）
  - detached（一戸建て）: 85,362 件、平均 £495,714、中央値 £415,000
  - semi-detached（セミデタッチド）: 107,580 件、平均 £319,922、中央値 £270,000
  - flat（フラット）: 62,975 件、平均 £298,529、中央値 £227,000
  - terraced（テラスド）: 112,832 件、平均 £286,616、中央値 £227,000
  - other: 7,884 件、平均 £1,087,765（中央値 £315,000）— 少数グループおよび外れ値の影響に注意

重要な注意事項とデータ品質に関する補足
- 2025 年のデータセットは部分的であるように見受けられます（1〜8 月のみ存在）。「2025 年」のトータルは通年値ではありません。
- 大きな外れ値が存在します（例: 最大 £127.7M、最小 £100）。これらには入力ミスや標準的でないレコードが含まれている可能性があり、平均値を押し上げます。
  この場合、中央値の方がより堅牢な指標となることが多いです。
- 「other」物件タイプの平均値は、件数が少なく不均質であり、外れ値の影響もあるため安定しません。
- is_new、duration、その他のメタデータによるフィルタリングは行っていません。それらのフィルタを適用すると（新築物件やリースホールドを除外するなど）結果が変わり得ます。
- テーブルは Price Paid 形式の取引レコード（記録された売買）であり、掲載価格や評価額を直接表しているわけではありません。



推奨される次のステップ（実行可能）

- 明らかな外れ値（例：価格が£10k未満または£10M超）を除外し、平均値/中央値を再計算します。
- 地域/郡/郵便番号エリアごとの集計とマップを生成します。
- 月次比較または3ヶ月移動中央値を計算し、2025年を通じたトレンドを表示します。
- 月ごとの前年同月比（YoY）成長率を生成します（例：2025年3月 vs 2024年3月）。
- 単純な外挿または時系列モデリングを使用して2025年全体の予測を行います（ただし、欠損月/外れ値の処理方法を決定した後の方が望ましい）。

ご希望であれば、以下を実行できます：

- 極端な外れ値を除外した後、同じ集計を再実行し、クリーニングされた結果を表示します。
- 月次YoY成長率とチャートを生成します（CSV形式またはJSON形式の集計データを返却可能で、チャート化できます）。
  次にどれを実行しますか？
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最後のアグリゲータを終了し、すべての永続的接続をシャットダウンしています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - すべての永続的サーバー接続を切断しています...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: シャットダウンを要求しています...
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
