---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: '集成 Upsonic'
title: '如何使用 Upsonic 和 ClickHouse MCP 服务器构建 AI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Upsonic 和 ClickHouse MCP 服务器构建 AI 智能体'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Upsonic 和 ClickHouse MCP Server 构建 AI Agent

在本指南中,您将学习如何构建一个 [Upsonic](https://github.com/Upsonic/Upsonic/tree/master) AI Agent,使其能够通过 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse SQL Playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
此示例可在 [examples 代码仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb) 中以 Notebook 形式获取。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装库 {#install-libraries}

通过运行以下命令安装 mcp-agent 库：

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```


## 设置凭据 {#setup-credentials}

接下来，您需要提供 OpenAI API 密钥：

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

接下来，定义连接到 ClickHouse SQL 演练场所需的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP 服务器和 Upsonic 代理 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器以指向 ClickHouse SQL 演练场，
并初始化我们的代理并向其提问：

```python
from upsonic import Agent, Task
from upsonic.models.openai import OpenAIResponsesModel
```

```python
class DatabaseMCP:
    """
    用于 ClickHouse 数据库操作的 MCP 服务器。
    提供查询表和数据库的工具
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
    name="数据分析师",
    role="ClickHouse 专家。",
    goal="查询 ClickHouse 数据库和表并回答问题",
    model=OpenAIResponsesModel(model_name="gpt-5-mini-2025-08-07")
)


task = Task(
    description="告诉我 2020 年代英国房地产市场发生了什么。使用 ClickHouse。",
    tools=[DatabaseMCP]
)

```


# 执行工作流

workflow&#95;result = database&#95;agent.do(task)
print(&quot;\n多 MCP 工作流结果:&quot;)
print(workflow&#95;result)

````

```response title="响应"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - 正在处理 ListToolsRequest 类型的请求
从 DatabaseMCP 中发现 3 个工具
  - list_databases: 列出可用的 ClickHouse 数据库
  - list_tables: 列出数据库中可用的 ClickHouse 表,包括架构、注释、
行数和列数。
  - run_select_query: 在 ClickHouse 数据库中运行 SELECT 查询
✅ 已通过线程发现 MCP 工具

...
````


[10/10/25 11:26:20] INFO Starting MCP server 'mcp-clickhouse' with transport 'stdio' server.py:1502
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
count(_) AS transactions,
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
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toMonth(date) AS month, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Query returned 8 rows
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Executing SELECT query: SELECT town, count(_) AS transactions, avg(price) AS avg_price
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
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toYear(date) AS year, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - 已成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - 查询返回了 2 行数据
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - 正在处理 CallToolRequest 类型请求
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在执行 SELECT 查询: SELECT type, count(\*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在创建 ClickHouse 客户端连接,目标地址 sql-clickhouse.clickhouse.com:8443,用户 demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - 已成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - 查询返回了 5 行数据
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 摘要 (TL;DR)

- 基于 ClickHouse 中的英国房产交易价格表,截至目前 2025 年已记录 376,633 笔交易,平均价格为 £362,283,中位数价格为 £281,000。数据似乎仅包含 2025 年 1 月至 8 月的记录(因此 2025 年数据不完整)。存在极端异常值(最小值 £100,最大值 £127,700,000),导致平均值发生偏移。



计算内容与方法
我对 ClickHouse 中的 uk.price-paid 表执行了聚合查询:
- 从 uk.uk_price_paid_simple_partitioned 获取 2025 年总体统计(计数、均值、中位数、最小值、最大值)
- 2025 年按月统计(交易量、均值、中位数)
- 2025 年按平均价格排名的主要城镇(交易量 >= 50 的城镇)
- 年度对比:2024 年 vs 2025 年(计数、均值、中位数)
- 使用 uk.uk_price_paid 按房产类型统计 2025 年数据(计数、平均值、中位数)

关键数据(来自数据集)
- 2025 年总体(已记录交易):交易量 = 376,633;平均价格 = £362,282.66;中位数价格 = £281,000;最小值 = £100;最大值 =
£127,700,000。
- 按月份统计(2025 年):(月份、交易量、平均价格、中位数价格)
  - 1 月:53,927,平均 £386,053,中位数 £285,000
  - 2 月:58,740,平均 £371,803,中位数 £285,000
  - 3 月:95,274,平均 £377,200,中位数 £315,000
  - 4 月:24,987,平均 £331,692,中位数 £235,000
  - 5 月:39,013,平均 £342,380,中位数 £255,000
  - 6 月:41,446,平均 £334,667,中位数 £268,500
  - 7 月:44,431,平均 £348,293,中位数 £277,500
  - 8 月:18,815,平均 £364,653,中位数 £292,999
  (数据集中仅包含 1-8 月数据。)
- 按平均价格排名的主要城镇(2025 年,交易量 ≥50 的城镇)
  - TRING:126 笔交易,平均 £1,973,274
  - BUCKHURST HILL:98 笔交易,平均 £1,441,331
  - ASCOT:175 笔交易,平均 £1,300,748
  - RADLETT:69 笔交易,平均 £1,160,217
  - COBHAM:115 笔交易,平均 £1,035,192
  - EAST MOLESEY、BEACONSFIELD、ESHER、CHALFONT ST GILES、THAMES DITTON 也位列前 10 名(均为高平均价格的通勤/富裕城镇)。
- 年度对比(2024 年 vs 2025 年已记录数据)
  - 2024 年:859,960 笔交易,平均 £390,879,中位数 £280,000
  - 2025 年:376,633 笔交易,平均 £362,283,中位数 £281,000
  (2025 年的交易量明显较低,因为数据集仅包含部分年份数据。)
- 按房产类型统计(2025 年)
  - 独立式:85,362 笔交易,平均 £495,714,中位数 £415,000
  - 半独立式:107,580 笔交易,平均 £319,922,中位数 £270,000
  - 公寓:62,975 笔交易,平均 £298,529,中位数 £227,000
  - 联排别墅:112,832 笔交易,平均 £286,616,中位数 £227,000
  - 其他:7,884 笔交易,平均 £1,087,765(中位数 £315,000)— 注意小样本和异常值效应

重要注意事项和数据质量说明
- 数据集中 2025 年的数据不完整(仅包含 1-8 月)。任何"2025 年"总计均非全年数据。
- 存在较大异常值(例如,最大值 £127.7M,最小值 £100)。这些可能包括数据录入错误或非标准记录,会拉高平均值。在此情况下,中位数通常是更稳健的度量指标。
- "其他"房产类型的平均值因样本量较小/异构性和异常值而不稳定。
- 未按 is_new、duration 或其他元数据进行过滤;这些过滤条件可能会改变结果(例如排除新建房产或租赁房产)。
- 这些表是 Price Paid 风格的交易记录(已记录的销售交易)— 不直接代表要价或估值。



建议的后续步骤（我可以执行这些操作）

- 清除明显的异常值（例如，价格 < £10k 或 > £10M）并重新计算平均值/中位数。
- 生成区域/郡/邮编区域汇总和地图。
- 计算环比或滚动 3 个月中位数以显示 2025 年的趋势。
- 按月生成同比（YoY）增长率（例如，2025 年 3 月与 2024 年 3 月对比）。
- 使用简单外推或时间序列建模预测整个 2025 年（但最好在决定如何处理缺失月份/异常值之后进行）。

如果您需要，我可以：

- 在移除极端异常值后重新运行相同的聚合并显示清理后的结果。
- 生成同比月度增长和图表（我可以返回 CSV 或 JSON 聚合数据供您制图）。
  您希望我接下来执行哪项操作？
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最后一个聚合器正在关闭，正在关闭所有持久连接...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - 正在断开所有持久服务器连接...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: 正在请求关闭...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - 所有持久服务器连接已收到断开信号。
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - 连接管理器已成功关闭并从上下文中移除
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp_basic_agent - MCPApp 清理
  {
  "data": {
  "progress_action": "已完成",
  "target": "mcp_basic_agent",
  "agent_name": "mcp_application_loop"
  }
  }

```

</VerticalStepper>
```
