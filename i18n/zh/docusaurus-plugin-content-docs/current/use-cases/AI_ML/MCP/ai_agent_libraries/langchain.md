---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/langchain'
'sidebar_label': '集成 Langchain'
'title': '如何使用 ClickHouse MCP 服务器构建 LangChain/LangGraph AI 代理'
'pagination_prev': null
'pagination_next': null
'description': '学习如何构建一个 LangChain/LangGraph AI 代理，该代理可以使用 ClickHouse 的 MCP 服务器与 ClickHouse
  的 SQL 游乐场进行交互。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'LangChain'
- 'LangGraph'
'show_related_blogs': true
'doc_type': 'guide'
---


# 如何使用 ClickHouse MCP 服务器构建 LangChain/LangGraph AI 代理

在本指南中，您将学习如何构建一个可以使用 [ClickHouse 的 SQL 游乐场](https://sql.clickhouse.com/) 进行交互的 [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI 代理，利用 [ClickHouse 的 MCP 服务器](https://github.com/ClickHouse/mcp-clickhouse)。

:::note 示例笔记本
此示例可以在 [示例代码库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) 中找到作为笔记本。
:::

## 先决条件 {#prerequisites}
- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 Anthropic API 密钥，或者来自其他 LLM 提供商的 API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">

## 安装库 {#install-libraries}

通过运行以下命令安装所需的库：

```python
!pip install -q --upgrade pip
!pip install -q langchain-mcp-adapters
!pip install -q langgraph
!pip install -q "langchain[anthropic]"
```

## 设置凭证 {#setup-credentials}

接下来，您需要提供您的 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 使用其他 LLM 提供商
如果您没有 Anthropic API 密钥，并希望使用其他 LLM 提供商，
您可以在 [Langchain Providers 文档](https://python.langchain.com/docs/integrations/providers/) 中找到设置凭证的说明。
:::

## 初始化 MCP 服务器 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器以指向 ClickHouse SQL 游乐场：

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
## 配置流处理程序 {#configure-the-stream-handler}

在与 Langchain 和 ClickHouse MCP 服务器一起工作时，查询结果通常作为流数据返回，而不是单个响应。对于大型数据集或可能需要时间处理的复杂分析查询，配置流处理程序非常重要。没有适当的处理，流式输出在您的应用程序中可能很难使用。

配置流输出的处理程序，以便更容易地使用：

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

## 调用代理 {#call-the-agent}

最后，调用您的代理，并询问谁向 ClickHouse 提交了最多的代码：

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

您应该会看到类似以下的响应：

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
