---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: '集成 LlamaIndex'
title: '如何使用 ClickHouse MCP Server 构建 LlamaIndex AI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何构建可以与 ClickHouse MCP Server 交互的 LlamaIndex AI 智能体。'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 ClickHouse MCP Server 构建 LlamaIndex AI Agent

在本指南中，你将学习如何构建一个 [LlamaIndex](https://docs.llamaindex.ai) AI agent，并使用 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 notebook
你可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb) 中找到本示例对应的 notebook。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要 Anthropic API 密钥,或其他 LLM 提供商的 API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库 {#install-libraries}

运行以下命令安装所需的依赖库：

```python
pip install -q --upgrade pip
pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
```


## 设置凭证 {#setup-credentials}

接下来,您需要提供 Anthropic API 密钥:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 使用其他 LLM 提供商
如果您没有 Anthropic API 密钥,且希望使用其他 LLM 提供商,
可以在 [LlamaIndex "LLMs" 文档](https://docs.llamaindex.ai/en/stable/examples/)中查看凭证设置说明
:::


## 初始化 MCP 服务器 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器,使其指向 ClickHouse SQL 演练场。
您需要将这些 Python 函数转换为 Llama Index 工具:

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

```


tools = await mcp&#95;tool&#95;spec.to&#95;tool&#95;list&#95;async()

````
## 创建 Agent {#create-agent}

现在可以创建一个能够访问这些工具的 agent 了。将单次运行中工具调用的最大次数设置为 10。您可以根据需要修改此参数:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
````


## 初始化 LLM {#initialize-llm}

使用以下代码初始化 Claude Sonnet 4.0 模型:

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```


## 运行代理 {#run-agent}

最后,您可以向代理提问:

```python
response = agent.query("What's the most popular repository?")
```

返回的响应内容较长,因此在下面的示例响应中已被截断:

```response title="响应"
Added user message to memory: What's the most popular repository?
=== LLM 响应 ===
我将帮助您找到最受欢迎的仓库。首先让我探索可用的数据库和表,以了解数据结构。
=== 调用函数 ===
Calling function: list_databases with args: {}
=== 函数输出 ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM 响应 ===
我看到有一个 `github` 数据库,其中可能包含仓库数据。让我探索该数据库中的表。
=== 调用函数 ===
Calling function: list_tables with args: {"database": "github"}
=== 函数输出 ===
...
...
...
=== LLM 响应 ===
根据 GitHub 数据,**最受欢迎的仓库是 `sindresorhus/awesome`**,拥有 **402,292 个星标**。

以下是按星标数排名的前 10 个最受欢迎的仓库:

1. **sindresorhus/awesome** - 402,292 个星标
2. **996icu/996.ICU** - 388,413 个星标
3. **kamranahmedse/developer-roadmap** - 349,097 个星标
4. **donnemartin/system-design-primer** - 316,524 个星标
5. **jwasham/coding-interview-university** - 313,767 个星标
6. **public-apis/public-apis** - 307,227 个星标
7. **EbookFoundation/free-programming-books** - 298,890 个星标
8. **facebook/react** - 286,034 个星标
9. **vinta/awesome-python** - 269,320 个星标
10. **freeCodeCamp/freeCodeCamp** - 261,824 个星标

`sindresorhus/awesome` 仓库是一个精选的优质列表合集,这解释了它为何如此受欢迎——它作为一个综合性资源目录,涵盖了软件开发中众多不同的主题。
```

</VerticalStepper>
