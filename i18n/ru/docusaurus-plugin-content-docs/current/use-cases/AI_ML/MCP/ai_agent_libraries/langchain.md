---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: 'Интеграция LangChain'
title: 'Как создать AI‑агента LangChain/LangGraph с использованием сервера ClickHouse MCP.'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать AI‑агента LangChain/LangGraph, который может взаимодействовать с SQL‑песочницей ClickHouse с помощью сервера ClickHouse MCP.'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента LangChain/LangGraph с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать AI-агента [LangChain/LangGraph](https://github.com/langchain-ai/langgraph),
который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с использованием [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример доступен в виде блокнота в [репозитории examples](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ Anthropic или API-ключ другого провайдера LLM.

Следующие шаги можно выполнить как из Python REPL, так и с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
```


## Настройка учетных данных {#setup-credentials}

Теперь вам нужно указать свой API‑ключ Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Введите API‑ключ Anthropic:")
```

```response title="Ответ"
Введите API‑ключ Anthropic: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API‑ключа Anthropic и вы хотите использовать другого провайдера LLM,
инструкции по настройке учетных данных можно найти в [документации LangChain по провайдерам](https://python.langchain.com/docs/integrations/providers/)
:::


## Инициализация MCP-сервера {#initialize-mcp-and-agent}

Теперь настройте MCP-сервер ClickHouse для подключения к тестовой среде ClickHouse SQL:

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
## Настройка обработчика потока {#configure-the-stream-handler}

При работе с Langchain и сервером ClickHouse MCP результаты запросов часто
возвращаются в виде потоковых данных, а не единого ответа. Для больших наборов данных или
сложных аналитических запросов, обработка которых может занять некоторое время, важно настроить
обработчик потока. Без должной обработки этот потоковый вывод может быть трудным
для работы в вашем приложении.

Настройте обработчик для потокового вывода, чтобы его было проще потреблять:

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
````


## Вызов агента {#call-the-agent}

Наконец, вызовите агента и спросите его, кто внёс больше всего кода в ClickHouse:

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

Вы должны увидеть ответ, аналогичный приведённому ниже:

```response title="Ответ"
Я помогу вам найти, кто внёс больше всего кода в ClickHouse, изучив доступные базы данных и таблицы для поиска данных о git-коммитах.
🔧 list_databases ✅ Я вижу базу данных `git`, которая, вероятно, содержит информацию о git-коммитах. Давайте изучим таблицы в этой базе данных:
🔧 list_tables ✅ Отлично! Я вижу, что таблица `clickhouse_commits` в базе данных git содержит данные о коммитах ClickHouse — всего 80 644 коммита. Эта таблица содержит информацию о каждом коммите, включая автора, добавленные/удалённые строки, изменённые файлы и т. д. Давайте запросим эту таблицу, чтобы найти, кто внёс больше всего кода на основе различных метрик.
🔧 run_select_query ✅ Давайте также посмотрим только на добавленные строки, чтобы увидеть, кто внёс больше всего нового кода:
🔧 run_select_query ✅ На основе данных git-коммитов ClickHouse **Alexey Milovidov** внёс больше всего кода в ClickHouse по нескольким показателям:

```


## Основные показатели:

1. **Больше всего изменённых строк всего**: Alexey Milovidov — **1 696 929 изменённых строк всего** (853 049 добавлено + 843 880 удалено)
2. **Больше всего добавленных строк**: Alexey Milovidov — **853 049 добавленных строк**
3. **Больше всего коммитов**: Alexey Milovidov — **15 375 коммитов**
4. **Больше всего изменённых файлов**: Alexey Milovidov — **73 529 изменённых файлов**



## Топ-контрибьюторы по количеству добавленных строк:

1. **Alexey Milovidov**: 853 049 добавленных строк (15 375 коммитов)
2. **s-kat**: 541 609 добавленных строк (50 коммитов)
3. **Nikolai Kochetov**: 219 020 добавленных строк (4 218 коммитов)
4. **alesapin**: 193 566 добавленных строк (4 783 коммитов)
5. **Vitaly Baranov**: 168 807 добавленных строк (1 152 коммитов)

Alexey Milovidov явно является самым продуктивным контрибьютором в ClickHouse, что логично, поскольку он один из создателей и ведущих разработчиков проекта. Его вклад значительно превосходит вклад других как по общему объёму кода, так и по количеству коммитов: почти 16 000 коммитов и более 850 000 добавленных строк кода в проекте.

```

</VerticalStepper>
```
