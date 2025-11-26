---
slug: /use-cases/AI/MCP/ai-agent-libraries/openai-agents
sidebar_label: 'Интеграция с OpenAI'
title: 'Как создать агента OpenAI с использованием ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать агента OpenAI, который может взаимодействовать с ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'OpenAI']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать агента OpenAI с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать агента [OpenAI](https://github.com/openai/openai-agents-python), который
может взаимодействовать с [SQL‑песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ OpenAI.

Следующие шаги можно выполнить либо из Python REPL, либо через скрипт.

<VerticalStepper headerLevel="h2">


## Установка библиотек

Установите необходимую библиотеку, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q openai-agents
```


## Настройка учетных данных

Далее вам нужно будет указать свой ключ API OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Введите API-ключ OpenAI:")
```

```response title="Response"
Введите API-ключ OpenAI: ········
```


## Инициализация MCP Server и агента OpenAI

Теперь настройте ClickHouse MCP Server так, чтобы он указывал на ClickHouse SQL playground,
инициализируйте агента OpenAI и задайте ему вопрос:

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """Упрощённая версия, фильтрующая только важные события"""

    # Вызовы инструментов
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Инструмент: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # Обработка строкового и уже разобранного вывода
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # Обработка форматов dict и list
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Ошибка: {text}")
                        else:
                            print(f"✅ Результат: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # Обработка формата списка
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Ошибка: {text}")
                        else:
                            print(f"✅ Результат: {text[:100]}...")
                else:
                    # Резервный вариант — вывод необработанных данных
                    print(f"✅ Результат: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # Резервный вариант: вывод необработанных данных при ошибке разбора
                print(f"✅ Результат: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Ответ: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Ответ: {str(chunk.item)[:100]}...")

    # Текстовые дельты для потоковой передачи
    elif (hasattr(chunk, 'type') and
          chunk.type == 'raw_response_event' and
          hasattr(chunk, 'data') and
          hasattr(chunk.data, 'type') and
          chunk.data.type == 'response.output_text.delta'):
        print(chunk.data.delta, end='', flush=True)

async with MCPServerStdio(
        name="ClickHouse SQL Playground",
        params={
            "command": "uv",
            "args": [
                'run',
                '--with', 'mcp-clickhouse',
                '--python', '3.13',
                'mcp-clickhouse'
            ],
            "env": env
        }, client_session_timeout_seconds = 60
) as server:
    agent = Agent(
        name="Ассистент",
        instructions="Используйте инструменты для выполнения запросов к ClickHouse и ответов на вопросы на основе этих файлов.",
        mcp_servers=[server],
    )

    message = "Какой самый крупный проект на GitHub в 2025 году?"
    print(f"\n\nВыполнение: {message}")
    with trace("Рабочий процесс поиска крупнейшего проекта"):
        result = Runner.run_streamed(starting_agent=agent, input=message, max_turns=20)
        async for chunk in result.stream_events():
            simple_render_chunk(chunk)
```


```response title="Ответ"
Выполняется: Какой самый крупный проект на GitHub на данный момент в 2025 году?
🔧 Tool: list_databases({})
✅ Result: amazon
bluesky
country
covid
default
dns
environmental
food
forex
geo
git
github
hackernews
imdb
log...
🔧 Tool: list_tables({"database":"github"})
✅ Result: {
  "database": "github",
  "name": "actors_per_repo",
  "comment": "",
  "columns": [
    {
      "...
🔧 Tool: run_select_query({"query":"SELECT repo_name, MAX(stars) FROM github.top_repos_mv"})
✅ Result: {
  "status": "error",
  "message": "Query failed: HTTPDriver for https://sql-clickhouse.clickhouse....
🔧 Tool: run_select_query({"query":"SELECT repo_name, stars FROM github.top_repos ORDER BY stars DESC LIMIT 1"})
✅ Result: {
  "repo_name": "sindresorhus/awesome",
  "stars": 402893
}...
Самый крупный проект на GitHub в 2025 году по количеству звёзд — «[sindresorhus/awesome](https://github.com/sindresorhus/awesome)» с 402 893 звёздами.💬 Ответ: Самый крупный проект на GitHub в 2025 году по количеству звёзд — «[sindresorhus/awesome](https://github.com/sindresorhus/awesome)» с 402 893 звёздами.
```

</VerticalStepper>
