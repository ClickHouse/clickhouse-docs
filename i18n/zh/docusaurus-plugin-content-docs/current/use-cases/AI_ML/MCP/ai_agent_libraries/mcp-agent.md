---
slug: /use-cases/AI/MCP/ai-agent-libraries/mcp-agent
sidebar_label: '集成 mcp-agent'
title: '如何使用 mcp-agent 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '学习如何使用 mcp-agent 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'mcp-agent']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 CrewAI 和 ClickHouse MCP Server 构建 AI Agent

在本指南中，将介绍如何使用 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 构建一个 [mcp-agent](https://github.com/lastmile-ai/mcp-agent) AI agent，使其能够与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例笔记本
该示例可作为笔记本在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb) 中查看。
:::



## 前置条件 {#prerequisites}

- 系统需已安装 Python。
- 系统需已安装 `pip`。
- 需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本执行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装库

运行以下命令安装 `mcp-agent` 库：

```python
pip install -q --upgrade pip
pip install -q mcp-agent openai
pip install -q ipywidgets
```


## 配置凭据

接下来，需要提供您的 OpenAI API 密钥：

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("输入 OpenAI API 密钥：")
```

```response title="Response"
输入 OpenAI API 密钥：········
```

接下来，定义连接 ClickHouse SQL playground 所需的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP Server 和 mcp-agent 代理

现在将 ClickHouse MCP Server 配置为指向 ClickHouse SQL playground，
并初始化我们的代理，然后向它提出一个问题：

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
        instruction="""您可以借助 ClickHouse 数据库来回答问题。""",
        server_names=["clickhouse"],
    )

    async with data_agent:
        llm = await data_agent.attach_llm(OpenAIAugmentedLLM)
        result = await llm.generate_str(
            message="请告诉我 2025 年英国房产价格的情况。使用 ClickHouse 来计算。"
        )
        
        logger.info(result)
```


```response title="Response"
[10/10/25 11:26:20] 信息     启动 MCP 服务器 'mcp-clickhouse',传输方式:'stdio'                                      server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - 信息 - 处理 ListToolsRequest 类型请求
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - 信息 - 处理 ListPromptsRequest 类型请求
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - 信息 - 处理 ListResourcesRequest 类型请求
[信息] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - 使用推理模型 'gpt-5-mini-2025-08-07',推理强度:'medium'
[信息] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "list_databases",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:23,479 - mcp-clickhouse - 信息 - 列出所有数据库
2025-10-10 11:26:23,479 - mcp-clickhouse - 信息 - 创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户:demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - 信息 - 成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - 信息 - 发现 38 个数据库
[信息] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "list_tables",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:26,832 - mcp-clickhouse - 信息 - 列出数据库 'uk' 中的表
2025-10-10 11:26:26,832 - mcp-clickhouse - 信息 - 创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户:demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - 信息 - 成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - 信息 - 发现 9 个表
[信息] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[信息] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[信息] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[信息] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[信息] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - 请求工具调用
{
  "data": {
    "progress_action": "调用工具",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:48,367 - mcp-clickhouse - 信息 - 执行 SELECT 查询:SELECT
count(*) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - 信息 - 创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户:demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - 信息 - 成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - 信息 - 查询返回 1 行
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:49,408 - mcp-clickhouse - 信息 - 执行 SELECT 查询:SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - 信息 - 创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户:demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - 信息 - 成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - 信息 - 查询返回 8 行
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:50,069 - mcp-clickhouse - 信息 - 执行 SELECT 查询:SELECT town, count(*) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - 信息 - 创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户:demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - 信息 - 成功连接到 ClickHouse 服务器版本 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - 信息 - 查询返回 10 行
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - 信息 - 处理 CallToolRequest 类型请求
2025-10-10 11:26:50,746 - mcp-clickhouse - 信息 - 执行 SELECT 查询:SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - 正在创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户 demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - 已成功连接至 ClickHouse 服务器,版本 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - 查询返回 2 行
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - 正在处理 CallToolRequest 类型请求
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在执行 SELECT 查询: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - 正在创建 ClickHouse 客户端连接至 sql-clickhouse.clickhouse.com:8443,用户 demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - 已成功连接至 ClickHouse 服务器,版本 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - 查询返回 5 行
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - 摘要 (TL;DR)
- 基于 ClickHouse 中的英国房价支付表,2025 年迄今记录的交易共有 376,633 笔销售,平均价格为 £362,283,中位数价格为 £281,000。数据似乎仅包含 2025 年 1 月至 8 月(因此 2025 年数据不完整)。存在极端异常值(最小值 £100,最大值 £127,700,000)使平均值出现偏差。
```



我计算了什么（以及如何计算）
我在 ClickHouse 中对 uk.price-paid 表进行了聚合分析：
- 使用 uk.uk_price_paid_simple_partitioned 计算 2025 年整体汇总（count、mean、median、min、max）
- 统计 2025 年按月分解结果（transactions、mean、median）
- 统计 2025 年按平均价格排序的高价城镇（交易次数 ≥ 50 的城镇）
- 按年份对比：2024 vs 2025（count、mean、median）
- 使用 uk.uk_price_paid 统计 2025 年按房产类型分解结果（counts、avg、median）

关键数据（来自数据集）
- 2025 年整体（记录的交易）：transactions = 376,633；mean price = £362,282.66；median price = £281,000；min = £100；max =
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
  （数据集中仅包含 1–8 月。）
- 按平均价格排序的高价城镇（2025 年，交易次数 ≥ 50 的城镇）
  - TRING：126 笔交易，avg £1,973,274
  - BUCKHURST HILL：98 笔交易，avg £1,441,331
  - ASCOT：175 笔交易，avg £1,300,748
  - RADLETT：69 笔交易，avg £1,160,217
  - COBHAM：115 笔交易，avg £1,035,192
  - EAST MOLESEY、BEACONSFIELD、ESHER、CHALFONT ST GILES、THAMES DITTON 也位列前 10（都是平均价格较高的通勤/富裕城镇）。
- 年度对比（2024 vs 2025，基于已记录数据）
  - 2024：859,960 笔交易，mean £390,879，median £280,000
  - 2025：376,633 笔交易，mean £362,283，median £281,000
  （2025 年的计数要低得多，因为数据集只覆盖了该年的部分时间。）
- 按房产类型（2025）
  - detached：85,362 笔交易，avg £495,714，median £415,000
  - semi-detached：107,580 笔交易，avg £319,922，median £270,000
  - flat：62,975 笔交易，avg £298,529，median £227,000
  - terraced：112,832 笔交易，avg £286,616，median £227,000
  - other：7,884 笔交易，avg £1,087,765（median £315,000）—— 注意小样本量和离群值效应

重要注意事项与数据质量说明
- 2025 年的数据集似乎是不完整的（仅包含 Jan–Aug）。任何“2025”总量都不是全年数据。
- 存在较大的离群值（例如 max £127.7M 和 min £100）。这些极端值很可能包含数据录入错误或非标准记录，从而抬高
mean。此处 median 往往是更稳健的度量。
- “other” 房产类型的平均值不稳定，原因在于计数较少/异质性较强以及离群值。
- 我没有按 is_new、duration 或其他元数据进行过滤；这些过滤条件会改变结果（例如排除新建房或
leasehold）。
- 这些表是 Price Paid 类型的交易记录（已记录的成交销售）—— 并不直接代表挂牌价格或估值。



建议的后续步骤(我可以执行这些操作)

- 清除明显的异常值(例如,价格 < £10k 或 > £10M)并重新计算平均值/中位数。
- 生成区域/郡/邮编区域汇总和地图。
- 计算环比或滚动 3 个月中位数以显示 2025 年的趋势。
- 按月生成同比(YoY)增长率(例如,2025 年 3 月与 2024 年 3 月对比)。
- 使用简单外推或时间序列建模预测整个 2025 年(但最好在决定如何处理缺失月份/异常值之后进行)。

如果您需要,我可以:

- 在移除极端异常值后重新运行相同的聚合并显示清理后的结果。
- 生成同比月度增长和图表(我可以返回 CSV 或 JSON 聚合数据供您制图)。
  您希望我接下来执行哪项操作?
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - 最后一个聚合器正在关闭,正在关闭所有持久连接...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - 正在断开所有持久服务器连接...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - ClickHouse: 正在请求关闭...
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
