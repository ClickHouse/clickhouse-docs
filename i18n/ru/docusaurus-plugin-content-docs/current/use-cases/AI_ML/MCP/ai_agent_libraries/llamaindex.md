---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/llamaindex'
'sidebar_label': 'Интеграция LlamaIndex'
'title': 'Как создать LlamaIndex AI агент с использованием ClickHouse MCP Server.'
'pagination_prev': null
'pagination_next': null
'description': 'Узнайте, как создать LlamaIndex AI агент, который может взаимодействовать
  с ClickHouse MCP Server.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'LlamaIndex'
'show_related_blogs': true
'doc_type': 'guide'
---


# Как создать агента ИИ LlamaIndex с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать агента ИИ [LlamaIndex](https://docs.llamaindex.ai), который может взаимодействовать с [SQL-площадкой ClickHouse](https://sql.clickhouse.com/) с помощью [MCP Server ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример можно найти в виде блокнота в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb).
:::

## Предварительные требования {#prerequisites}
- У вас должна быть установлена Python на вашей системе.
- У вас должен быть установлен `pip` на вашей системе.
- Вам нужен ключ API Anthropic или ключ API от другого поставщика LLM.

Вы можете выполнять следующие шаги либо из вашего Python REPL, либо через скрипт.

<VerticalStepper headerLevel="h2">

## Установка библиотек {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```python
!pip install -q --upgrade pip
!pip install -q llama-index
!pip install -q clickhouse-connect
!pip install -q llama-index-llms-anthropic
!pip install -q llama-index-tools-mcp
```

## Настройка учетных данных {#setup-credentials}

Далее вам нужно предоставить ваш ключ API Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Использование другого поставщика LLM
Если у вас нет ключа API Anthropic и вы хотите использовать другого поставщика LLM,
вы можете найти инструкции по настройке ваших учетных данных в [документации "LLMs" LlamaIndex](https://docs.llamaindex.ai/en/stable/examples/)
:::

## Инициализация MCP Server {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server, чтобы он указывал на SQL-площадку ClickHouse.
Вам нужно преобразовать их из функций Python в инструменты Llama Index:

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
## Создание агента {#create-agent}

Теперь вы готовы создать агента, который имеет доступ к этим инструментам. Установите максимальное
число вызовов инструментов за одно выполнение на 10. Вы можете изменить этот параметр, если хотите:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
```

## Инициализация LLM {#initialize-llm}

Инициализируйте модель Claude Sonnet 4.0 с помощью следующего кода:

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```

## Запуск агента {#run-agent}

Наконец, вы можете задать агенту вопрос:

```python
response = agent.query("What's the most popular repository?")
```

Ответ слишком длинный, поэтому он был сокращен в примере 
ответа ниже:

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
