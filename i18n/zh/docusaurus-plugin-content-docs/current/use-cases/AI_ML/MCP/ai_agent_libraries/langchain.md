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

# 如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI 代理 {#how-to-build-a-langchainlanggraph-ai-agent-using-clickhouse-mcp-server}

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
Enter Anthropic API Key: ········
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
            {"messages": [{"role": "user", "content": "Who's committed the most code to ClickHouse?"}]}, 
            version="v1"
        ):
            handler.handle_chunk(chunk)
            
        print("\n")
```

  您应该看到类似以下的响应:

  ```response title="Response"
I'll help you find who has committed the most code to ClickHouse by exploring the available databases and tables to locate git commit data.
🔧 list_databases ✅ I can see there's a `git` database which likely contains git commit information. Let me explore the tables in that database:
🔧 list_tables ✅ Perfect! I can see the `clickhouse_commits` table in the git database contains ClickHouse commit data with 80,644 commits. This table has information about each commit including the author, lines added/deleted, files modified, etc. Let me query this table to find who has committed the most code based on different metrics.
🔧 run_select_query ✅ Let me also look at just the lines added to see who has contributed the most new code:
🔧 run_select_query ✅ Based on the ClickHouse git commit data, **Alexey Milovidov** has committed the most code to ClickHouse by several measures:

## Key Statistics:

1. **Most Total Lines Changed**: Alexey Milovidov with **1,696,929 total lines changed** (853,049 added + 843,880 deleted)
2. **Most Lines Added**: Alexey Milovidov with **853,049 lines added**
3. **Most Commits**: Alexey Milovidov with **15,375 commits**
4. **Most Files Changed**: Alexey Milovidov with **73,529 files changed**

## Top Contributors by Lines Added:

1. **Alexey Milovidov**: 853,049 lines added (15,375 commits)
2. **s-kat**: 541,609 lines added (50 commits) 
3. **Nikolai Kochetov**: 219,020 lines added (4,218 commits)
4. **alesapin**: 193,566 lines added (4,783 commits)
5. **Vitaly Baranov**: 168,807 lines added (1,152 commits)

Alexey Milovidov is clearly the most prolific contributor to ClickHouse, which makes sense as he is one of the original creators and lead developers of the project. His contribution dwarfs others both in terms of total code volume and number of commits, with nearly 16,000 commits and over 850,000 lines of code added to the project.
```
</VerticalStepper>