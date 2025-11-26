---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: 'Upsonic を統合する'
title: 'Upsonic と ClickHouse MCP Server を使用して AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Upsonic と ClickHouse MCP Server を使用して AI エージェントを構築する方法について説明します'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---



# Upsonic と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できる、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) に対応した [Upsonic](https://github.com/Upsonic/Upsonic/tree/master) ベースの AI エージェントの構築方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb) 内のノートブックとして確認できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- OpenAI APIキーが必要です。

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリをインストールする

次のコマンドを実行して、`mcp-agent` ライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```


## 認証情報の設定

次に、OpenAI API キーを設定する必要があります。

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


## MCP Server と Upsonic エージェントの初期化

ClickHouse MCP Server を構成して ClickHouse SQL playground を接続先として指定し、
あわせてエージェントを初期化して質問を投げてみます。

```python
from upsonic import Agent, Task
from upsonic.models.openai import OpenAIResponsesModel
```

```python
class DatabaseMCP:
    """
    ClickHouseデータベース操作用のMCPサーバー。
    テーブルおよびデータベースのクエリツールを提供
    """
    command="uv"
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ]
    env=env


database_agent = Agent(
    name="データアナリスト",
    role="ClickHouseスペシャリスト。",
    goal="ClickHouseデータベースおよびテーブルをクエリして質問に回答",
    model=OpenAIResponsesModel(model_name="gpt-5-mini-2025-08-07")
)


task = Task(
    description="2020年代の英国不動産市場の動向を教えてください。ClickHouseを使用すること。",
    tools=[DatabaseMCP]
)
```


# ワークフローを実行する

workflow&#95;result = database&#95;agent.do(task)
print(&quot;\nMulti-MCP Workflow Result:&quot;)
print(workflow&#95;result)

````

```response title="レスポンス"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
DatabaseMCPから3つのツールが見つかりました
  - list_databases: 利用可能なClickHouseデータベースの一覧表示
  - list_tables: データベース内の利用可能なClickHouseテーブルの一覧表示(スキーマ、コメント、
行数、列数を含む)
  - run_select_query: ClickHouseデータベースでのSELECTクエリの実行
✅ スレッド経由でMCPツールを検出

...
````


[10/10/25 11:26:20] 情報 MCPサーバー 'mcp-clickhouse' をトランスポート 'stdio' で起動しています server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - 情報 - ListToolsRequest タイプのリクエストを処理しています
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - 情報 - ListPromptsRequest タイプのリクエストを処理しています
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - 情報 - ListResourcesRequest タイプのリクエストを処理しています
[情報] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - 推論モデル 'gpt-5-mini-2025-08-07' を 'medium' 推論レベルで使用しています
[情報] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "list_databases",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:23,479 - mcp-clickhouse - 情報 - すべてのデータベースを一覧表示しています
2025-10-10 11:26:23,479 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - 情報 - ClickHouse サーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:24,551 - mcp-clickhouse - 情報 - 38 個のデータベースが見つかりました
[情報] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "list_tables",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:26,832 - mcp-clickhouse - 情報 - データベース 'uk' 内のテーブルを一覧表示しています
2025-10-10 11:26:26,832 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - 情報 - ClickHouse サーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:28,738 - mcp-clickhouse - 情報 - 9 個のテーブルが見つかりました
[情報] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[情報] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[情報] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[情報] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[情報] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - ツール呼び出しをリクエストしています
{
"data": {
"progress_action": "ツールを呼び出しています",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:48,367 - mcp-clickhouse - 情報 - SELECT クエリを実行しています: SELECT
count(_) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - 情報 - ClickHouse サーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:49,407 - mcp-clickhouse - 情報 - クエリは 1 行を返しました
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:49,408 - mcp-clickhouse - 情報 - SELECT クエリを実行しています: SELECT toMonth(date) AS month, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - 情報 - ClickHouse サーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:50,067 - mcp-clickhouse - 情報 - クエリは 8 行を返しました
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:50,069 - mcp-clickhouse - 情報 - SELECT クエリを実行しています: SELECT town, count(_) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - 情報 - ClickHouse サーバーバージョン 25.8.1.8344 への接続に成功しました
2025-10-10 11:26:50,741 - mcp-clickhouse - 情報 - クエリは 10 行を返しました
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - 情報 - CallToolRequest タイプのリクエストを処理しています
2025-10-10 11:26:50,746 - mcp-clickhouse - 情報 - SELECT クエリを実行しています: SELECT toYear(date) AS year, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - 情報 - sql-clickhouse.clickhouse.com:8443 へ demo として ClickHouse クライアント接続を作成しています (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - ClickHouseサーバー バージョンに正常に接続しました 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - クエリ結果: 2 行
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - リクエストを処理中: タイプ CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - SELECTクエリを実行中: SELECT type, count(\*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - ClickHouseクライアント接続を作成中: sql-clickhouse.clickhouse.com:8443 ユーザー: demo（secure=True、verify=True、connect_timeout=30秒、send_receive_timeout=30秒）
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - ClickHouseサーバー バージョンに正常に接続しました 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - クエリ結果: 5 行
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - サマリー（要約）

- ClickHouseのUK Price Paidテーブルに基づくと、2025年にこれまで記録された取引は376,633件で、平均価格は
  £362,283、中央値は£281,000です。データには2025年1月から8月のみが含まれているようです(したがって2025年のデータは不完全です)。平均値を歪める極端な
  外れ値(最小£100、最大£127,700,000)が存在します。



算出内容（方法）
ClickHouse の `uk.price-paid` テーブルに対して集約処理を実行しました:
- `uk.uk_price_paid_simple_partitioned` を使った 2025 年全体のサマリー（件数、平均、中央値、最小値、最大値）
- 2025 年の月別内訳（取引件数、平均、中央値）
- 2025 年における平均価格が高いタウンのランキング（取引件数が 50 件以上のタウン）
- 年次比較: 2024 年 vs 2025 年（件数、平均、中央値）
- `uk.uk_price_paid` を使った 2025 年の物件タイプ別内訳（件数、平均、中央値）

主要な数値（データセットより）
- 2025 年全体（記録された取引）: 取引件数 = 376,633 件; 平均価格 = £362,282.66; 中央値 = £281,000; 最小値 = £100; 最大値 =
£127,700,000.
- 月別 (2025 年):（月, 取引件数, 平均価格, 中央値）
  - 1 月: 53,927 件, 平均 £386,053, 中央値 £285,000
  - 2 月: 58,740 件, 平均 £371,803, 中央値 £285,000
  - 3 月: 95,274 件, 平均 £377,200, 中央値 £315,000
  - 4 月: 24,987 件, 平均 £331,692, 中央値 £235,000
  - 5 月: 39,013 件, 平均 £342,380, 中央値 £255,000
  - 6 月: 41,446 件, 平均 £334,667, 中央値 £268,500
  - 7 月: 44,431 件, 平均 £348,293, 中央値 £277,500
  - 8 月: 18,815 件, 平均 £364,653, 中央値 £292,999
  （このデータセットには 1〜8 月のみが含まれています。）
- 平均価格の高いタウン（2025 年、取引件数が 50 件以上のタウン）
  - TRING: 126 件, 平均 £1,973,274
  - BUCKHURST HILL: 98 件, 平均 £1,441,331
  - ASCOT: 175 件, 平均 £1,300,748
  - RADLETT: 69 件, 平均 £1,160,217
  - COBHAM: 115 件, 平均 £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON もトップ 10 に含まれます（いずれも平均価格が高い通勤・富裕層タウン）。
- 年次比較（2024 年 vs 2025 年、記録ベース）
  - 2024 年: 859,960 件, 平均 £390,879, 中央値 £280,000
  - 2025 年: 376,633 件, 平均 £362,283, 中央値 £281,000
  （2025 年の件数がかなり少ないのは、このデータセットが年の一部しか含んでいないためです。）
- 物件タイプ別（2025 年）
  - detached: 85,362 件, 平均 £495,714, 中央値 £415,000
  - semi-detached: 107,580 件, 平均 £319,922, 中央値 £270,000
  - flat: 62,975 件, 平均 £298,529, 中央値 £227,000
  - terraced: 112,832 件, 平均 £286,616, 中央値 £227,000
  - other: 7,884 件, 平均 £1,087,765（中央値 £315,000）— 少数サンプルおよび外れ値の影響に注意

重要な注意点とデータ品質に関する補足
- 2025 年のデータセットは部分的なものに見えます（1〜8 月のみ）。したがって、「2025 年」の合計値は通年の値ではありません。
- 大きな外れ値が存在します（例: 最大 £127.7M、最小 £100）。これらには入力ミスや非標準的なレコードが含まれる可能性があり、平均値を押し上げます。この場合は中央値の方がよりロバストな指標になります。
- 「other」物件タイプの平均値は、件数が少ないことや異質な物件・外れ値を含むことから、信頼性が低くなります。
- `is_new`、`duration` その他のメタデータによるフィルタリングは行っていません。これらのフィルタ（たとえば新築やリースホールドの除外）により結果は変わり得ます。
- テーブルは Price Paid スタイルの取引レコード（成約済みの売買）であり、掲載価格や評価額を直接表すものではありません。



推奨される次のステップ(実行可能)

- 明らかな外れ値(例: 価格が£10k未満または£10M超)を除外し、平均値/中央値を再計算します。
- 地域/郡/郵便番号エリアごとの集計とマップを作成します。
- 月次比較または3ヶ月移動中央値を計算し、2025年を通じたトレンドを表示します。
- 月別の前年同月比(YoY)成長率を算出します(例: 2025年3月 vs 2024年3月)。
- 単純な外挿または時系列モデリングを使用して2025年全体の予測を行います(ただし、欠損月/外れ値の処理方法を決定した後の方が望ましい)。

ご希望であれば、以下を実行できます:

- 極端な外れ値を除外した後、同じ集計を再実行し、クリーンアップ済みの結果を表示します。
- 月次YoY成長率とチャートを作成します(CSV形式またはJSON形式の集計データを返却可能)。
  次にどれを実行しますか?
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
