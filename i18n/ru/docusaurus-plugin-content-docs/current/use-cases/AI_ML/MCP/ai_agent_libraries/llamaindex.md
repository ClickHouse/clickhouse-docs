---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'Интеграция с LlamaIndex'
title: 'Как создать ИИ-агента LlamaIndex с использованием ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать ИИ-агента LlamaIndex, который может взаимодействовать с ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать AI-агента LlamaIndex с использованием ClickHouse MCP Server {#how-to-build-a-llamaindex-ai-agent-using-clickhouse-mcp-server}

В этом руководстве вы узнаете, как создать AI-агента [LlamaIndex](https://docs.llamaindex.ai), который
может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb).
:::

## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ Anthropic или API-ключ другого поставщика LLM.

Следующие шаги можно выполнить либо из Python REPL, либо с помощью скрипта.

<VerticalStepper headerLevel="h2">

## Установите библиотеки {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
```

## Настройка учётных данных {#setup-credentials}

Далее вам нужно указать свой ключ API Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
вы можете найти инструкции по настройке учетных данных в [документации LlamaIndex «LLMs»](https://docs.llamaindex.ai/en/stable/examples/)
:::

## Инициализируйте MCP Server {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server для работы с ClickHouse SQL Playground.
Вам потребуется преобразовать их из функций Python в инструменты LlamaIndex:

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

tools = await mcp&#95;tool&#95;spec.to&#95;tool&#95;list&#95;async()

````python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
````python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```python
response = agent.query("What's the most popular repository?")
```python
response = agent.query("What's the most popular repository?")
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
