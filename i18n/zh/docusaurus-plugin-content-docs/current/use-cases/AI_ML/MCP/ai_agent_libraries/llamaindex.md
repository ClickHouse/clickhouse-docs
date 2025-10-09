---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/llamaindex'
'sidebar_label': '集成 LlamaIndex'
'title': '如何使用 ClickHouse MCP Server 构建 LlamaIndex AI 代理。'
'pagination_prev': null
'pagination_next': null
'description': '学习如何构建可以与 ClickHouse MCP Server 交互的 LlamaIndex AI 代理。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'LlamaIndex'
'show_related_blogs': true
'doc_type': 'guide'
---


# 如何使用 ClickHouse MCP 服务器构建 LlamaIndex AI 代理

在本指南中，您将学习如何构建一个可以使用 [ClickHouse 的 SQL 游乐场](https://sql.clickhouse.com/) 进行交互的 [LlamaIndex](https://docs.llamaindex.ai) AI 代理，使用 [ClickHouse 的 MCP 服务器](https://github.com/ClickHouse/mcp-clickhouse)。

:::note 示例笔记本
此示例可以在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb) 中找到。
:::

## 前提条件 {#prerequisites}
- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 Anthropic API 密钥，或来自其他 LLM 提供商的 API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">

## 安装库 {#install-libraries}

通过运行以下命令安装所需的库：

```python
!pip install -q --upgrade pip
!pip install -q llama-index
!pip install -q clickhouse-connect
!pip install -q llama-index-llms-anthropic
!pip install -q llama-index-tools-mcp
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
如果您没有 Anthropic API 密钥，并想使用其他 LLM 提供商，您可以在 [LlamaIndex "LLMs" 文档](https://docs.llamaindex.ai/en/stable/examples/) 中找到设置凭证的说明。
:::

## 初始化 MCP 服务器 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器指向 ClickHouse SQL 游乐场。您需要将这些从 Python 函数转换为 Llama Index 工具：

```python
from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

mcp_client = BasicMCPClient(
    "uv",
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

mcp_tool_spec = McpToolSpec(
    client=mcp_client,
)

tools = await mcp_tool_spec.to_tool_list_async()
```
## 创建代理 {#create-agent}

您现在准备创建一个访问这些工具的代理。将一次运行中的最大工具调用次数设置为 10。您可以根据需要修改此参数：

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
```

## 初始化 LLM {#initialize-llm}

使用以下代码初始化 Claude Sonnet 4.0 模型：

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```

## 运行代理 {#run-agent}

最后，您可以问代理一个问题：

```python
response = agent.query("What's the most popular repository?")
```

返回的响应很长，因此在下面的示例响应中已被截断：

```response title="Response"
Added user message to memory: What's the most popular repository?
=== LLM Response ===
I'll help you find the most popular repository. Let me first explore the available databases and tables to understand the data structure.
=== Calling Function ===
Calling function: list_databases with args: {}
=== Function Output ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM Response ===
I can see there's a `github` database which likely contains repository data. Let me explore the tables in that database.
=== Calling Function ===
Calling function: list_tables with args: {"database": "github"}
=== Function Output ===
...
...
...
=== LLM Response ===
Based on the GitHub data, **the most popular repository is `sindresorhus/awesome`** with **402,292 stars**.

Here are the top 10 most popular repositories by star count:

1. **sindresorhus/awesome** - 402,292 stars
2. **996icu/996.ICU** - 388,413 stars  
3. **kamranahmedse/developer-roadmap** - 349,097 stars
4. **donnemartin/system-design-primer** - 316,524 stars
5. **jwasham/coding-interview-university** - 313,767 stars
6. **public-apis/public-apis** - 307,227 stars
7. **EbookFoundation/free-programming-books** - 298,890 stars
8. **facebook/react** - 286,034 stars
9. **vinta/awesome-python** - 269,320 stars
10. **freeCodeCamp/freeCodeCamp** - 261,824 stars

The `sindresorhus/awesome` repository is a curated list of awesome lists, which explains its popularity as it serves as a comprehensive directory of resources across many different topics in software development.
```

</VerticalStepper>
