---
slug: /use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework
sidebar_label: '集成 Microsoft Agent Framework'
title: '如何使用 Microsoft Agent Framework 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Microsoft Agent Framework 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'Microsoft']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Microsoft Agent Framework 和 ClickHouse MCP Server 构建 AI Agent

在本指南中，您将学习如何构建一个基于 [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) 的 AI agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与
[ClickHouse 的 SQL 在线体验环境](https://sql.clickhouse.com/) 进行交互。

:::note 示例 notebook
该示例以 notebook 形式提供，位于 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb) 中。
:::



## 前置条件 {#prerequisites}

- 系统需已安装 Python。
- 系统需已安装 `pip`。
- 需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本执行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库

通过运行以下命令来安装 Microsoft Agent Framework 库：

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```


## 配置凭证

接下来，您需要提供 OpenAI API 密钥：

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("输入 OpenAI API 密钥：")
```

```response title="Response"
输入 OpenAI API 密钥:········
```

接下来，定义连接 ClickHouse SQL Playground 所需的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP Server 和 Microsoft Agent Framework 代理

现在将 ClickHouse MCP Server 配置为连接到 ClickHouse SQL Playground，
并初始化我们的代理，然后向它提一个问题：

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
    instructions="您是一个可以帮助查询 ClickHouse 数据库的助手",
    tools=clickhouse_mcp_server,
) as agent:
    query = "告诉我过去五年英国的房产价格情况"
    print(f"用户:{query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

该脚本的运行结果如下：

```response title="Response"
用户:请介绍一下过去五年英国房产价格的情况
我查询了 uk.uk_price_paid_simple_partitioned 表中过去五年的英国月度成交价格记录(toStartOfMonth(date),时间范围为 2020 年 10 月至 2025 年 8 月)。以下是摘要和要点:

测量内容
- 指标:月度中位价格、平均价格和交易数量(实际成交价格记录)。
- 覆盖时段:2020-10-01 至 2025-08-01(截至今日的过去五年)。

主要发现
- 中位价格从 £255,000(2020-10)上涨至 £294,500(2025-08)——五年内增长约 +15.4%。
  - 中位价格的复合年增长率(CAGR)≈ +2.9%。
- 平均价格从约 £376,538(2020-10)小幅下降至 £364,653(2025-08)——五年内下降约 −3.2%。
  - 平均价格 CAGR ≈ −0.6%。
- 这种分化现象(中位价格上涨,平均价格略有下降)表明交易结构发生了变化(超高价值交易减少或其他构成因素影响),因为平均值对异常值敏感,而中位值不受影响。

数据中的显著趋势和事件
- 2020-2021 年强劲上涨(中位值和平均值均明显上升),与该时期疫情后/印花税优惠/需求驱动的市场激增相符。
- 平均价格在 2022 年中期达到峰值(平均值约 £440k),随后在 2022-2023 年整体回落,并在 2023-2024 年左右趋于稳定。
- 部分月份显示出较大波动或异常计数(例如,2021 年 6 月交易数量非常高;2025 年 3 月中位值较高,但 2025 年 4-5 月计数较低)。最近几个月(2025 年中期)表中的交易数量明显偏低——这通常表明最近月份的数据报告不完整,因此应谨慎对待近期月度数据。

示例数据点(来自查询结果)
- 2020-10:中位值 £255,000,平均值 £376,538,交易数 89,125
- 2022-08:平均值峰值约 £441,209(中位值约 £295,000)
- 2025-03:中位值约 £314,750(最高中位值之一)
- 2025-08:中位值 £294,500,平均值 £364,653,交易数 18,815(计数偏低——可能数据不完整)

注意事项
- 这些是实际成交价格(Price Paid 数据集)——与房产的实际"估值"可能存在差异。
- 平均值对交易构成和异常值敏感。所售房产类型的变化(例如,公寓与独立式住宅的比例、区域分布)会对平均值和中位值产生不同影响。
- 最近几个月的数据可能不完整;交易数量异常偏低的月份应谨慎对待。
- 这是全国汇总数据——各地区之间可能存在显著差异。

如有需要,我可以:
- 生成中位值和平均值随时间变化的图表。
- 进行同比比较或计算不同起止月份的 CAGR。
- 按地区/郡/城镇、房产类型(公寓、联排别墅、半独立式、独立式)或价格区间进行细分分析。
- 显示过去 5 年价格增长最高/最低地区的排名表。
```


你想选择哪种后续操作？

```

</VerticalStepper>
```
