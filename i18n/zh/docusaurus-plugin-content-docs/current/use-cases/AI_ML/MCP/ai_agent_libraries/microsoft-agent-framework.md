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



# 如何使用 Microsoft Agent Framework 和 ClickHouse MCP Server 构建 AI 代理

在本指南中，你将学习如何使用 [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) 构建一个 AI 代理，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例笔记本
该示例以笔记本形式收录在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb)中。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装库 {#install-libraries}

通过运行以下命令安装 Microsoft Agent Framework 库:

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```


## 设置凭据 {#setup-credentials}

接下来,您需要提供 OpenAI API 密钥:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

接下来,定义连接到 ClickHouse SQL 演练环境所需的凭据:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP 服务器和 Microsoft Agent Framework 代理 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器以指向 ClickHouse SQL 演练场，
并初始化我们的代理向其提问：

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
    instructions="You are a helpful assistant that can help query a ClickHouse database",
    tools=clickhouse_mcp_server,
) as agent:
    query = "Tell me about UK property prices over the last five years"
    print(f"User: {query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

运行此脚本的输出如下所示：

```response title="响应"
用户：告诉我过去五年英国房产价格的情况
我查看了 uk.uk_price_paid_simple_partitioned 表中过去五年的英国月度售价记录（toStartOfMonth(date)，从 2020 年 10 月到 2025 年 8 月）。摘要和要点：

测量内容
- 指标：月度中位价格、平均价格和交易数量（已支付价格记录）。
- 覆盖期间：从 2020-10-01 到 2025-08-01 的月份（从今天起的过去五年）。

主要发现
- 中位价格从 £255,000（2020-10）上升到 £294,500（2025-08）——五年内增长约 +15.4%。
  - 中位价格的等效复合年增长率（CAGR）≈ 每年 +2.9%。
- 平均价格从约 £376,538（2020-10）略微下降到 £364,653（2025-08）——五年内下降 ≈ −3.2%。
  - 平均价格 CAGR ≈ 每年 −0.6%。
- 这种分化（中位价格上升，平均价格略微下降）表明交易组合发生了变化（极高价值销售减少或其他组成效应），因为平均值对异常值敏感，而中位数则不然。

数据中的显著模式和事件
- 2020-2021 年强劲上涨（中位数和平均值均可见），与该时期疫情后/印花税/需求驱动的市场激增一致。
- 平均价格在 2022 年中期左右达到峰值（平均值约 £440k），然后在 2022-2023 年普遍走软，并在 2023-2024 年左右趋于稳定。
- 某些月份显示出较大波动或异常计数（例如，2021 年 6 月的交易数量非常高；2025 年 3 月显示较高的中位数，但 2025 年 4-5 月显示较低的计数）。最近几个月（2025 年中期）表中的交易数量要低得多——这通常表明最近几个月的报告不完整，意味着应谨慎对待最近的月度数据。

示例数据点（来自查询）
- 2020-10：中位数 £255,000，平均值 £376,538，交易数 89,125
- 2022-08：平均值峰值约 £441,209（中位数约 £295,000）
- 2025-03：中位数约 £314,750（最高中位数之一）
- 2025-08：中位数 £294,500，平均值 £364,653，交易数 18,815（计数较低——可能不完整）

注意事项
- 这些是交易价格（已支付价格数据集）——实际房屋"价值"可能有所不同。
- 平均值对组成和异常值敏感。所售房产类型的变化（例如，公寓与独立式住宅的混合、区域混合）将对平均值和中位数产生不同影响。
- 最近几个月的数据可能不完整；交易数量异常低的月份应谨慎对待。
- 这是全国汇总数据——区域差异可能很大。

如果您需要，我可以：
- 生成中位数和平均值随时间变化的图表。
- 比较同比数据或计算不同起始/结束月份的 CAGR。
- 按地区/郡/城镇、房产类型（公寓、联排别墅、半独立式、独立式）或价格区间细分分析。
- 显示过去 5 年价格增长最高/最低地区的表格。

```


您希望选择哪种后续操作？

```

</VerticalStepper>
```
