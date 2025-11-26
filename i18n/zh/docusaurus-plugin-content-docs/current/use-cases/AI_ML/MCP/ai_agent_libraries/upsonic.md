---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: '集成 Upsonic'
title: '如何使用 Upsonic 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Upsonic 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Upsonic 和 ClickHouse MCP Server 构建 AI Agent

在本指南中，您将学习如何构建一个基于 [Upsonic](https://github.com/Upsonic/Upsonic/tree/master) 的 AI Agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与
[ClickHouse 的 SQL 在线体验平台](https://sql.clickhouse.com/) 进行交互。

:::note 示例笔记本
该示例以笔记本形式提供，位于 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb) 中。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库

通过运行以下命令安装 mcp-agent 库：

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```


## 配置凭证

接下来，需要提供 OpenAI API 密钥：

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("输入 OpenAI API 密钥：")
```

```response title="Response"
输入 OpenAI API 密钥：········
```

接下来，定义用于连接 ClickHouse SQL playground 的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP Server 和 Upsonic 代理

现在将 ClickHouse MCP Server 配置为指向 ClickHouse SQL playground，
同时初始化我们的代理，然后向它提一个问题：

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
print(&quot;\n多 MCP 工作流结果：&quot;)
print(workflow&#95;result)

````

```response title="响应"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
在 DatabaseMCP 中找到 3 个工具
  - list_databases: 列出可用的 ClickHouse 数据库
  - list_tables: 列出数据库中可用的 ClickHouse 表，包括表结构、备注、
行数和列数。
  - run_select_query: 在 ClickHouse 数据库中运行一条 SELECT 查询
✅ 已通过当前线程发现 MCP 工具

...
````


[10/10/25 11:26:20] INFO 使用传输方式 'stdio' 启动 MCP 服务器 'mcp-clickhouse' server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - 处理类型为 ListToolsRequest 的请求
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - 处理类型为 ListPromptsRequest 的请求
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - 处理类型为 ListResourcesRequest 的请求
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - 使用推理模型 'gpt-5-mini-2025-08-07'，推理强度为
'medium'
[INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "list_databases",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - 正在列出所有数据库
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - 找到 38 个数据库
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "list_tables",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - 正在列出数据库 'uk' 中的表
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - 找到 9 张表
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求调用工具
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - 正在执行 SELECT 查询：SELECT
count(_) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - 查询返回 1 行
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - 正在执行 SELECT 查询：SELECT toMonth(date) AS month, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - 查询返回 8 行
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - 正在执行 SELECT 查询：SELECT town, count(_) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - 查询返回 10 行
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - 处理类型为 CallToolRequest 的请求
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - 正在执行 SELECT 查询：SELECT toYear(date) AS year, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - 正在以 demo 身份创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - 查询返回 2 行结果
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - 正在处理类型为 CallToolRequest 的请求
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在执行 SELECT 查询：SELECT type, count(\*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在创建到 sql-clickhouse.clickhouse.com:8443 的 ClickHouse 客户端连接，使用 demo 用户（secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s）
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - 成功连接到 ClickHouse 服务器，版本 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - 查询返回 5 行结果
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 摘要（要点概述）

- 基于 ClickHouse 中的英国房价实付数据表，2025 年迄今记录的交易共有 376,633 笔，平均成交价为
  £362,283，中位数价格为 £281,000。数据似乎仅涵盖 2025 年 1 月至 8 月（因此 2025 年数据不完整）。存在极端
  离群值（最低 £100，最高 £127,700,000），导致平均值出现偏差。



我计算了什么（以及如何计算）
我在 ClickHouse 中对 `uk.price-paid` 表进行了聚合分析：
- 使用 `uk.uk_price_paid_simple_partitioned` 计算 2025 年整体汇总（count、mean、median、min、max）
- 计算 2025 年的按月明细（transactions、mean、median）
- 2025 年按平均价格统计的高价城镇（交易笔数 ≥ 50 的城镇）
- 年度对比：2024 年 vs 2025 年（count、mean、median）
- 使用 `uk.uk_price_paid` 按 2025 年房产类型拆分（counts、avg、median）

关键数字（来自数据集）
- 2025 年整体情况（已记录交易）：transactions = 376,633；mean price = £362,282.66；median price = £281,000；min = £100；max =
£127,700,000。
- 按月（2025）：（month, transactions, mean price, median price）
  - Jan：53,927，mean £386,053，median £285,000
  - Feb：58,740，mean £371,803，median £285,000
  - Mar：95,274，mean £377,200，median £315,000
  - Apr：24,987，mean £331,692，median £235,000
  - May：39,013，mean £342,380，median £255,000
  - Jun：41,446，mean £334,667，median £268,500
  - Jul：44,431，mean £348,293，median £277,500
  - Aug：18,815，mean £364,653，median £292,999
  （数据集中只包含 1–8 月。）
- 按平均价格排序的城镇（2025 年，交易笔数 ≥ 50 的城镇）
  - TRING：126 笔交易，avg £1,973,274
  - BUCKHURST HILL：98 笔交易，avg £1,441,331
  - ASCOT：175 笔交易，avg £1,300,748
  - RADLETT：69 笔交易，avg £1,160,217
  - COBHAM：115 笔交易，avg £1,035,192
  - EAST MOLESEY、BEACONSFIELD、ESHER、CHALFONT ST GILES、THAMES DITTON 也都位列前 10（均为高均价的通勤/富裕城镇）。
- 年度对比（2024 vs 2025，基于已记录交易）
  - 2024：859,960 笔交易，mean £390,879，median £280,000
  - 2025：376,633 笔交易，mean £362,283，median £281,000
  （2025 年的计数明显更低，因为数据集只覆盖了全年的一部分。）
- 按房产类型拆分（2025）
  - detached：85,362 笔交易，avg £495,714，median £415,000
  - semi-detached：107,580 笔交易，avg £319,922，median £270,000
  - flat：62,975 笔交易，avg £298,529，median £227,000
  - terraced：112,832 笔交易，avg £286,616，median £227,000
  - other：7,884 笔交易，avg £1,087,765（median £315,000）—— 需注意样本量小及异常值带来的影响

重要注意事项与数据质量说明
- 2025 年的数据集似乎不完整（只包含 1–8 月数据）。任何“2025”总计都不是全年数字。
- 存在较大的异常值（例如 max £127.7M，以及 min £100）。这些记录很可能包含录入错误或非标准记录，会抬高
mean。在这里 median 往往是更稳健的度量。
- “other” 房产类型的平均值不稳定，因为样本量较小、差异较大且有异常值。
- 我没有按 `is_new`、`duration` 或其他元数据进行过滤；这些过滤条件会改变结果（例如排除新建房或
leaseholds）。
- 这些表是 Price Paid 样式的交易记录（已记录成交），并不能直接代表挂牌价或估值。



建议的后续步骤（这些我都可以帮你完成）

- 剔除明显的异常值（例如价格小于 £10k 或大于 £10M），并重新计算平均值/中位数。
- 生成按地区/郡/邮编区域划分的汇总和地图。
- 计算环比或滚动 3 个月的中位数，用于展示贯穿 2025 年的趋势。
- 生成按月的同比（YoY）增长率（例如 2025 年 3 月对比 2024 年 3 月）。
- 使用简单外推或时间序列建模对整个 2025 年进行预测（但最好先决定如何处理缺失月份/异常值）。

如果你需要的话，我可以：

- 在移除极端异常值后重新运行相同的聚合，并展示清洗后的结果。
- 生成月度同比增长数据及图表（我可以返回便于你制图的 CSV 或 JSON 聚合数据）。
  你希望我接下来做哪一项？
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最后一个聚合器正在关闭，正在关闭所有持久连接……
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - 正在断开所有持久的服务器连接……
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse：正在请求关闭……
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - 已向所有持久服务器连接发出断开信号。
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
