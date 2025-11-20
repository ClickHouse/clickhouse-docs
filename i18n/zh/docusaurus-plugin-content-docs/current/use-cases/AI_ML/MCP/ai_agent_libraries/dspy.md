---
slug: /use-cases/AI/MCP/ai-agent-libraries/DSPy
sidebar_label: '集成 DSPy'
title: '如何使用 DSPy 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 DSPy 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'DSPy']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 DSPy 和 ClickHouse MCP Server 构建 AI Agent

在本指南中，你将学习如何使用 [DSPy](https://github.com/langchain-ai/langgraph) 构建一个 AI agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥或其他 LLM 提供商的 API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

:::note 示例笔记本
此示例可在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/dspy/dspy.ipynb) 中以笔记本形式找到。
:::

<VerticalStepper headerLevel="h2">


## 安装依赖库 {#install-libraries}

使用 `pip` 运行以下命令安装所需的依赖库:

```shell
pip install -q --upgrade pip
pip install -q dspy
pip install -q mcp
```


## 设置凭证 {#setup-credentials}

接下来,您需要提供 Anthropic API 密钥:

```python
import os
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

:::note 使用其他 LLM 提供商
如果您没有 Anthropic API 密钥,并且想要使用其他 LLM 提供商,
您可以在 [DSPy 文档](https://dspy.ai/#__tabbed_1_1) 中找到设置凭证的相关说明
:::

接下来,定义连接到 ClickHouse SQL 演练环境所需的凭证:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP 服务器 {#initialize-mcp}

现在配置 ClickHouse MCP 服务器以指向 ClickHouse SQL 演练场。

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import dspy

server_params = StdioServerParameters(
    command="uv",
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
```


## 初始化 LLM {#initialize-llm}

接下来，使用以下代码初始化 LLM：

```python
dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-20250514"))
```


## 运行代理 {#run-the-agent}

最后,初始化并运行代理:

```python
class DataAnalyst(dspy.Signature):
    """你是一名数据分析师。你将被问及问题,需要尝试使用可用的工具来回答这些问题。"""

    user_request: str = dspy.InputField()
    process_result: str = dspy.OutputField(
        desc=(
            "查询的答案"
        )
    )

from utils import print_dspy_result

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()

        dspy_tools = []
        for tool in tools.tools:
            dspy_tools.append(dspy.Tool.from_mcp_tool(session, tool))

        react = dspy.ReAct(DataAnalyst, tools=dspy_tools)
        result = await react.acall(user_request="最受欢迎的亚马逊产品类别是什么")
        print_dspy_result(result)
```

```response title="响应"
================================================================================
🤖 DSPy ReAct 结果
================================================================================

📍 步骤 1
----------------------------------------
🧠 思考:我需要查找有关亚马逊产品类别的信息,并确定哪个类别最受欢迎。首先,我应该探索有哪些可用的数据库,看看是否有任何与亚马逊相关的数据。

🔧 工具:list_databases

📊 结果:
   amazon
bluesky
country
covid
default
dns
environmental
food
forex
geo
git
github
hackernews
imdb
logs
metrica
mgbench
mta
noaa
nyc_taxi
nypd
ontime
opensky
otel
otel_v2
pypi
random
reddit
rubygems
sta...

📍 步骤 2
----------------------------------------
🧠 思考:太好了!我可以看到有一个"amazon"数据库可用。这正是我需要的,可以找到有关亚马逊产品类别的信息。让我探索 amazon 数据库中的表,看看有哪些可用数据。

🔧 工具:list_tables
   参数:{'database': 'amazon'}

📊 结果:
   {
  "database": "amazon",
  "name": "amazon_reviews",
  "comment": "",
  "columns": [
    {
      "name": "review_date",
      "type": "Date",
      "default_type": "",
      "default_expression": "",...

📍 步骤 3
----------------------------------------
🧠 思考:完美!我找到了 amazon_reviews 表,其中包含 product_category 列。该表拥有超过 1.5 亿行亚马逊评论数据,这应该能很好地反映产品的受欢迎程度。要找到最受欢迎的亚马逊产品类别,我需要统计每个类别的评论数量,并按数量降序排列。评论数量最多的类别将被视为最受欢迎的类别。

🔧 工具:run_select_query
   参数:{'query': 'SELECT product_category, COUNT(*) as review_count FROM amazon.amazon_reviews GROUP BY product_category ORDER BY review_count DESC LIMIT 10'}

📊 结果:
   1. Books:19,530,930 条评论
   2. Digital_Ebook_Purchase:17,622,107 条评论
   3. Wireless:9,001,567 条评论
   4. PC:6,908,245 条评论
   5. Home:6,221,321 条评论
   ... 以及另外 5 个

📍 步骤 4
----------------------------------------
🧠 思考:完美!我已经找到了用户问题的答案。根据亚马逊评论数据,我可以清楚地看到"Books"是最受欢迎的亚马逊产品类别,拥有 19,530,930 条评论,其次是"Digital_Ebook_Purchase",拥有 17,622,107 条评论。数据显示了基于每个类别收到的评论数量的产品类别受欢迎程度的明确排名。我现在拥有回答用户问题所需的所有信息。

🔧 工具:finish

📊 结果:
   已完成。

🎯 推理过程
----------------------------------------
为了回答关于最受欢迎的亚马逊产品类别的问题,我访问了 Amazon 数据库,并找到了一个名为"amazon_reviews"的表,其中包含超过 1.5 亿条评论记录。该表包含一个"product_category"列,使我能够根据评论数量分析产品的受欢迎程度。我运行了一个查询来统计每个产品类别的评论数量,并按数量降序排列。这里的假设是,评论数量更多的类别表示更高的受欢迎程度,因为更多的评论通常与更多的购买和客户参与度相关。

✅ 最终结果
----------------------------------------
根据包含超过 1.5 亿条记录的亚马逊评论数据,最受欢迎的亚马逊产品类别是 **Books**,拥有 19,530,930 条评论。

```


以下是按评论数量排序的前 10 个最受欢迎的 Amazon 商品类别：

1. **Books** - 19,530,930 条评论
2. **Digital&#95;Ebook&#95;Purchase** - 17,622,107 条评论
3. **Wireless** - 9,001,567 条评论
4. **PC** - 6,908,245 条评论
5. **Home** - 6,221,321 条评论
6. **Apparel** - 5,906,085 条评论
7. **Health &amp; Personal Care** - 5,331,239 条评论
8. **Beauty** - 5,115,462 条评论
9. **Video DVD** - 5,069,014 条评论
10. **Mobile&#95;Apps** - 5,033,164 条评论

# 值得注意的是，Books 和 Digital Ebook Purchase（两个彼此关联的类别）合计就超过 3,700 万条评论，体现了阅读类商品在 Amazon 平台上的强劲受欢迎程度。

```
</VerticalStepper>
```
