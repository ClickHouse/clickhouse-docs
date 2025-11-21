---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: '集成 LangChain'
title: '如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何使用 ClickHouse 的 MCP Server 构建一个能够与 ClickHouse SQL Playground 交互的 LangChain/LangGraph AI 智能体。'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: '指南'
---



# 如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI 代理

在本指南中，您将学习如何使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)，构建一个可以与 [ClickHouse SQL Playground](https://sql.clickhouse.com/) 交互的 [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI 代理。

:::note 示例笔记本
该示例可在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) 中以笔记本形式查看。
:::



## 前提条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥,或其他 LLM 提供商的 API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库 {#install-libraries}

运行以下命令安装所需的依赖库:

```python
pip install -q --upgrade pip
pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
```


## 设置凭据 {#setup-credentials}

接下来,您需要提供 Anthropic API 密钥:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 使用其他 LLM 提供商
如果您没有 Anthropic API 密钥,并希望使用其他 LLM 提供商,
可以在 [Langchain Providers 文档](https://python.langchain.com/docs/integrations/providers/)中查看设置凭据的说明
:::


## 初始化 MCP 服务器 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器以指向 ClickHouse SQL 演练场:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

```


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

````
## 配置流处理器 {#configure-the-stream-handler}

在使用 Langchain 和 ClickHouse MCP Server 时,查询结果通常以流式数据返回,而非单次响应。对于大型数据集或需要较长处理时间的复杂分析查询,配置流处理器至关重要。如果没有正确处理,这种流式输出在应用程序中可能难以使用。

配置流式输出处理器以便更方便地使用:

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

            # 仅处理实际文本内容,跳过工具调用流
            if hasattr(chunk_data, 'content'):
                content = chunk_data.content
                if isinstance(content, str) and not content.startswith('{"'):
                    # 如需要,在工具完成后添加空格
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
                                # 如需要,在工具完成后添加空格
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
````


## 调用代理 {#call-the-agent}

最后,调用您的代理并询问谁向 ClickHouse 提交了最多代码:

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

您应该会看到类似以下的响应:

```response title="响应"
我将通过探索可用的数据库和表来帮助您查找谁向 ClickHouse 提交了最多代码,以定位 git 提交数据。
🔧 list_databases ✅ 我可以看到有一个 `git` 数据库,其中可能包含 git 提交信息。让我探索该数据库中的表:
🔧 list_tables ✅ 完美!我可以看到 git 数据库中的 `clickhouse_commits` 表包含 ClickHouse 提交数据,共有 80,644 次提交。该表包含每次提交的信息,包括作者、添加/删除的行数、修改的文件等。让我查询此表,根据不同的指标找出谁提交了最多代码。
🔧 run_select_query ✅ 让我也查看一下仅添加的行数,看看谁贡献了最多新代码:
🔧 run_select_query ✅ 根据 ClickHouse git 提交数据,**Alexey Milovidov** 从多个指标来看向 ClickHouse 提交了最多代码:

```


## 关键统计数据：

1. **总变更代码行数最多**：Alexey Milovidov，**共变更 1,696,929 行代码**（新增 853,049 行 + 删除 843,880 行）
2. **新增代码行数最多**：Alexey Milovidov，**新增 853,049 行代码**
3. **提交次数最多**：Alexey Milovidov，**15,375 次提交**
4. **变更文件数最多**：Alexey Milovidov，**变更 73,529 个文件**



## 按新增代码行数排名的主要贡献者：

1. **Alexey Milovidov**：新增 853,049 行代码（15,375 次提交）
2. **s-kat**：新增 541,609 行代码（50 次提交）
3. **Nikolai Kochetov**：新增 219,020 行代码（4,218 次提交）
4. **alesapin**：新增 193,566 行代码（4,783 次提交）
5. **Vitaly Baranov**：新增 168,807 行代码（1,152 次提交）

Alexey Milovidov 显然是对 ClickHouse 贡献最多的开发者，这也合乎情理，因为他是该项目的最初创建者之一，也是项目的主要开发者之一。无论从代码总量还是提交次数来看，他的贡献都远超其他人，几乎 16,000 次提交，为项目新增了超过 850,000 行代码。

```

</VerticalStepper>
```
