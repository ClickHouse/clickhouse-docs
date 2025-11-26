---
slug: /use-cases/AI/MCP/ai-agent-libraries/DSPy
sidebar_label: '集成 DSPy'
title: '如何使用 DSPy 和 ClickHouse MCP Server 构建 AI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何使用 DSPy 和 ClickHouse MCP Server 构建 AI 智能体'
keywords: ['ClickHouse', 'MCP', 'DSPy']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 DSPy 和 ClickHouse MCP Server 构建 AI 智能体

在本指南中，您将学习如何使用 [DSPy](https://github.com/langchain-ai/langgraph) 构建一个 AI 智能体，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL Playground](https://sql.clickhouse.com/) 交互。

## 前置条件 {#prerequisites}

- 系统中已安装 Python。
- 系统中已安装 `pip`。
- 拥有一个 Anthropic API key，或其他 LLM 提供商的 API key。

你可以在 Python REPL 中或通过脚本来运行以下步骤。

:::note 示例 Notebook
你可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/dspy/dspy.ipynb)中以 Notebook 形式查看此示例。
:::

<VerticalStepper headerLevel="h2">
  ## 安装依赖库

  使用 `pip` 运行以下命令来安装所需的库：

  ```shell
  pip install -q --upgrade pip
  pip install -q dspy
  pip install -q mcp
  ```

  ## 设置凭据

  接下来,您需要提供 Anthropic API 密钥:

  ```python
  import os
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("输入 Anthropic API 密钥:")
  ```

  :::note 使用其他 LLM 提供商
  如果您没有 Anthropic API 密钥且想使用其他 LLM 提供商,
  可以在 [DSPy 文档](https://dspy.ai/#__tabbed_1_1)中查看凭据配置说明
  :::

  接下来,定义连接到 ClickHouse SQL playground 所需的凭据:

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## 初始化 MCP 服务器

  现在配置 ClickHouse MCP Server 使其指向 ClickHouse SQL playground。

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

  ## 初始化 LLM

  接下来，使用以下代码行初始化 LLM：

  ```python
  dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-20250514"))
  ```

  ## 运行 Agent

  最后,初始化并运行 agent:

  ```python
  class DataAnalyst(dspy.Signature):
      """你是一名数据分析师。你会收到问题,需要尝试使用可用的工具来回答这些问题。"""

      user_request: str = dspy.InputField()
      process_result: str = dspy.OutputField(
          desc=(
              "查询结果"
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
          result = await react.acall(user_request="亚马逊最受欢迎的产品类别是什么")
          print_dspy_result(result)
  ```

  ```response title="Response"
  ================================================================================
  🤖 DSPy ReAct 结果
  ================================================================================

  📍 步骤 1
  ----------------------------------------
  🧠 思考:我需要查找 Amazon 产品类别的相关信息,并确定哪个类别最受欢迎。首先,我应该查看有哪些可用的数据库,看看是否有 Amazon 相关的数据。

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
  🧠 思考:太好了!我看到有一个"amazon"数据库可用。这正是我查找 Amazon 产品类别信息所需要的。让我查看 amazon 数据库中的表,看看有哪些可用数据。

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
  🧠 思考:完美!我找到了 amazon_reviews 表,其中包含 product_category 列。该表有超过 1.5 亿行 Amazon 评论数据,能够很好地反映产品的受欢迎程度。要找到最受欢迎的 Amazon 产品类别,我需要统计每个类别的评论数量,并按数量降序排列。评论数量最多的类别即为最受欢迎的类别。

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
  🧠 思考:完美!我已经找到了用户问题的答案。根据 Amazon 评论数据,我可以清楚地看到"Books"是最受欢迎的 Amazon 产品类别,拥有 19,530,930 条评论,其次是"Digital_Ebook_Purchase",拥有 17,622,107 条评论。数据清晰地展示了基于评论数量的产品类别受欢迎程度排名。我现在已经掌握了回答用户问题所需的全部信息。

  🔧 工具:finish

  📊 结果:
     已完成。

  🎯 推理过程
  ----------------------------------------
  为了回答关于最受欢迎的 Amazon 产品类别的问题,我访问了 Amazon 数据库,并找到了一个名为"amazon_reviews"的表,其中包含超过 1.5 亿条评论记录。该表包含"product_category"列,使我能够根据评论数量分析产品的受欢迎程度。我运行了一个查询来统计每个产品类别的评论数量,并按数量降序排列。这里的假设是,评论数量越多的类别表明受欢迎程度越高,因为更多的评论通常意味着更多的购买量和更高的客户参与度。

  ✅ 最终结果
  ----------------------------------------
  根据包含超过 1.5 亿条记录的 Amazon 评论数据,最受欢迎的 Amazon 产品类别是 **Books**,拥有 19,530,930 条评论。

  以下是按评论数量排列的前 10 个最受欢迎的 Amazon 产品类别:

  1. **Books** - 19,530,930 条评论
  2. **Digital_Ebook_Purchase** - 17,622,107 条评论  
  3. **Wireless** - 9,001,567 条评论
  4. **PC** - 6,908,245 条评论
  5. **Home** - 6,221,321 条评论
  6. **Apparel** - 5,906,085 条评论
  7. **Health & Personal Care** - 5,331,239 条评论
  8. **Beauty** - 5,115,462 条评论
  9. **Video DVD** - 5,069,014 条评论
  10. **Mobile_Apps** - 5,033,164 条评论

  值得注意的是,Books 和 Digital Ebook Purchase(这两个相关类别)合计超过 3700 万条评论,显示了阅读材料在 Amazon 平台上的强劲受欢迎程度。
  ================================================================================
  ```
</VerticalStepper>