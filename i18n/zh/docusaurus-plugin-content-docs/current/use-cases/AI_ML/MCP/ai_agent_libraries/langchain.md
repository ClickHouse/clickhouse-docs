---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: '集成 LangChain'
title: '如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 ClickHouse 的 MCP Server 构建一个能够与 ClickHouse SQL Playground 交互的 LangChain/LangGraph AI Agent。'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: '指南'
---

# 如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI 代理

在本指南中，您将学习如何构建一个 [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI 代理，使其能够借助 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL Playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
该示例以 Notebook 形式提供，您可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) 中找到。
:::

## 前提条件 {#prerequisites}

- 需要在系统上安装 Python。
- 需要在系统上安装 `pip`。
- 需要一个 Anthropic API 密钥，或其他 LLM 服务提供商的 API 密钥。

你可以在 Python REPL 中执行以下步骤，或通过脚本运行它们。

<VerticalStepper headerLevel="h2">
  ## 安装依赖库

  运行以下命令以安装所需的库：

  ```python
  pip install -q --upgrade pip
  pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
  ```

  ## 设置凭据

  接下来,您需要提供 Anthropic API 密钥:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  输入 Anthropic API 密钥：········
  ```

  :::note 使用其他 LLM 提供商
  如果您没有 Anthropic API 密钥且希望使用其他 LLM 提供商,
  可以在 [Langchain Providers 文档](https://python.langchain.com/docs/integrations/providers/)中查看凭据配置说明
  :::

  ## 初始化 MCP 服务器

  现在配置 ClickHouse MCP Server 以指向 ClickHouse SQL 演练场:

  ```python
  from mcp import ClientSession, StdioServerParameters
  from mcp.client.stdio import stdio_client

  server_params = StdioServerParameters(
      command="uv",
      args=[
          "run",
          "--with", "mcp-clickhouse",
          "--python", "3.13",
          "mcp-clickhouse"
      ],
      env={
          "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
          "CLICKHOUSE_PORT": "8443",
          "CLICKHOUSE_USER": "demo",
          "CLICKHOUSE_PASSWORD": "",
          "CLICKHOUSE_SECURE": "true"
      }
  )
  ```

  ## 配置流处理器

  在使用 Langchain 和 ClickHouse MCP Server 时,查询结果通常以流式数据返回,而非单次响应。对于大型数据集或处理耗时较长的复杂分析查询,配置流处理器至关重要。若未正确处理,此类流式输出可能难以在应用程序中使用。

  配置流式输出的处理器以便更易于消费:

  ```python
  class UltraCleanStreamHandler:
      def __init__(self):
          self.buffer = ""
          self.in_text_generation = False
          self.last_was_tool = False
          
      def handle_chunk(self, chunk):
          event = chunk.get("event", "")
          
          if event == "on_chat_model_stream":
              data = chunk.get("data", {})
              chunk_data = data.get("chunk", {})
              
              # Only handle actual text content, skip tool invocation streams
              if hasattr(chunk_data, 'content'):
                  content = chunk_data.content
                  if isinstance(content, str) and not content.startswith('{"'):
                      # Add space after tool completion if needed
                      if self.last_was_tool:
                          print(" ", end="", flush=True)
                          self.last_was_tool = False
                      print(content, end="", flush=True)
                      self.in_text_generation = True
                  elif isinstance(content, list):
                      for item in content:
                          if (isinstance(item, dict) and 
                              item.get('type') == 'text' and 
                              'partial_json' not in str(item)):
                              text = item.get('text', '')
                              if text and not text.startswith('{"'):
                                  # Add space after tool completion if needed
                                  if self.last_was_tool:
                                      print(" ", end="", flush=True)
                                      self.last_was_tool = False
                                  print(text, end="", flush=True)
                                  self.in_text_generation = True
                                  
          elif event == "on_tool_start":
              if self.in_text_generation:
                  print(f"\n🔧 {chunk.get('name', 'tool')}", end="", flush=True)
                  self.in_text_generation = False
                  
          elif event == "on_tool_end":
              print(" ✅", end="", flush=True)
              self.last_was_tool = True
  ```

  ## 调用 Agent

  最后，调用您的代理并询问谁向 ClickHouse 提交了最多的代码：

  ```python
  async with stdio_client(server_params) as (read, write):
      async with ClientSession(read, write) as session:
          await session.initialize()
          tools = await load_mcp_tools(session)
          agent = create_react_agent("anthropic:claude-sonnet-4-0", tools)
          
          handler = UltraCleanStreamHandler()        
          async for chunk in agent.astream_events(
              {"messages": [{"role": "user", "content": "谁向 ClickHouse 提交的代码最多?"}]}, 
              version="v1"
          ):
              handler.handle_chunk(chunk)
              
          print("\n")
  ```

  您应该看到类似以下的响应:

  ```response title="Response"
  我将通过探索可用的数据库和表来帮助您查找向 ClickHouse 提交代码最多的人员,以定位 git 提交数据。
  🔧 list_databases ✅ 我可以看到有一个 `git` 数据库,其中可能包含 git 提交信息。让我探索该数据库中的表:
  🔧 list_tables ✅ 完美!我可以看到 git 数据库中的 `clickhouse_commits` 表包含 ClickHouse 提交数据,共有 80,644 次提交。该表包含每次提交的信息,包括作者、添加/删除的行数、修改的文件等。让我查询此表,根据不同的指标找出提交代码最多的人员。
  🔧 run_select_query ✅ 让我也查看一下仅添加的行数,以了解谁贡献了最多的新代码:
  🔧 run_select_query ✅ 根据 ClickHouse git 提交数据,**Alexey Milovidov** 在多个指标上向 ClickHouse 提交了最多的代码:

  ## 关键统计数据:

  1. **总变更行数最多**: Alexey Milovidov,**总共变更 1,696,929 行**(添加 853,049 行 + 删除 843,880 行)
  2. **添加行数最多**: Alexey Milovidov,**添加 853,049 行**
  3. **提交次数最多**: Alexey Milovidov,**15,375 次提交**
  4. **变更文件数最多**: Alexey Milovidov,**变更 73,529 个文件**

  ## 按添加行数排名的主要贡献者:

  1. **Alexey Milovidov**: 添加 853,049 行(15,375 次提交)
  2. **s-kat**: 添加 541,609 行(50 次提交) 
  3. **Nikolai Kochetov**: 添加 219,020 行(4,218 次提交)
  4. **alesapin**: 添加 193,566 行(4,783 次提交)
  5. **Vitaly Baranov**: 添加 168,807 行(1,152 次提交)

  Alexey Milovidov 显然是 ClickHouse 最多产的贡献者,这是合理的,因为他是该项目的原始创建者和首席开发人员之一。无论是在代码总量还是提交次数方面,他的贡献都远超其他人,向项目提交了近 16,000 次,添加了超过 850,000 行代码。
  ```
</VerticalStepper>