---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: '集成 LangChain'
title: '如何使用 LangChain/LangGraph 和 ClickHouse MCP Server 构建 AI 代理'
pagination_prev: null
pagination_next: null
description: '了解如何使用 LangChain/LangGraph 和 ClickHouse MCP Server 构建一个可以与 ClickHouse SQL Playground 交互的 AI 代理。'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 ClickHouse MCP Server 构建 LangChain/LangGraph AI 代理

在本指南中，您将学习如何构建一个 [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI 代理，
它可以使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse SQL Playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
该示例可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) 中的 Notebook 形式找到。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥或其他 LLM 提供商的 API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库

通过运行以下命令来安装所需的依赖库：

```python
pip install -q --upgrade pip
pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
```


## 设置凭证

接下来，您需要提供 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
输入 Anthropic API 密钥：········
```

:::note 使用其他 LLM 提供商
如果你没有 Anthropic API 密钥并希望使用其他 LLM 提供商，
可以在 [LangChain Providers 文档](https://python.langchain.com/docs/integrations/providers/) 中找到配置凭据的说明。
:::


## 初始化 MCP Server

现在将 ClickHouse MCP Server 配置为连接到 ClickHouse SQL playground：

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

在使用 Langchain 和 ClickHouse MCP Server 时,查询结果通常以流式数据形式返回,而非单次响应。对于大型数据集或需要较长处理时间的复杂分析查询,配置流处理器非常重要。如果没有正确处理,这种流式输出在应用程序中将难以使用。

配置流式输出处理器以便更易于使用:

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


## 调用代理

最后，调用你的代理，询问是谁向 ClickHouse 提交的代码最多：

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

你应该会看到类似如下所示的响应：

```response title="Response"
我将通过探索可用的数据库和表来定位 git 提交数据,帮助您找出谁向 ClickHouse 提交了最多代码。
🔧 list_databases ✅ 可以看到有一个 `git` 数据库,其中可能包含 git 提交信息。让我探索该数据库中的表:
🔧 list_tables ✅ 完美!可以看到 git 数据库中的 `clickhouse_commits` 表包含 ClickHouse 提交数据,共有 80,644 次提交。该表包含每次提交的信息,包括作者、添加/删除的行数、修改的文件等。让我查询此表,根据不同指标找出谁提交了最多代码。
🔧 run_select_query ✅ 让我再查看仅添加的行数,以了解谁贡献了最多新代码:
🔧 run_select_query ✅ 根据 ClickHouse git 提交数据,**Alexey Milovidov** 从多个指标来看向 ClickHouse 提交了最多代码:
```


## 关键统计数据：

1. **总变更行数最多**：Alexey Milovidov，**变更 1,696,929 行代码**（新增 853,049 行 + 删除 843,880 行）
2. **新增行数最多**：Alexey Milovidov，**新增 853,049 行代码**
3. **提交次数最多**：Alexey Milovidov，**15,375 次提交**
4. **变更文件数最多**：Alexey Milovidov，**变更 73,529 个文件**



## 按新增代码行数排名的顶级贡献者：

1. **Alexey Milovidov**：新增 853,049 行代码（15,375 次提交）
2. **s-kat**：新增 541,609 行代码（50 次提交）
3. **Nikolai Kochetov**：新增 219,020 行代码（4,218 次提交）
4. **alesapin**：新增 193,566 行代码（4,783 次提交）
5. **Vitaly Baranov**：新增 168,807 行代码（1,152 次提交）

Alexey Milovidov 显然是 ClickHouse 最为高产的贡献者，这也顺理成章，因为他是该项目的早期创建者之一，也是核心开发负责人之一。他在总代码量和提交次数上都远超其他人，为该项目贡献了近 16,000 次提交和超过 850,000 行新增代码。

```

</VerticalStepper>
```
