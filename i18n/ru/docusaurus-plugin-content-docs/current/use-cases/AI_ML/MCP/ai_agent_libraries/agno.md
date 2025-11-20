---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: 'Интеграция Agno'
title: 'Как создать ИИ-агента с помощью Agno и ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать ИИ-агента с помощью Agno и ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента с Agno и сервером ClickHouse MCP

В этом руководстве вы узнаете, как создать AI-агента на базе [Agno](https://github.com/agno-agi/agno), который может взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [сервера ClickHouse MCP](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ Anthropic или API-ключ другого провайдера LLM.

Следующие шаги можно выполнить как из Python REPL, так и с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек {#install-libraries}

Установите библиотеку Agno, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```


## Настройка учётных данных {#setup-credentials}

Далее необходимо указать ваш API-ключ Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Введите API-ключ Anthropic:")
```

```response title="Ответ"
Введите API-ключ Anthropic: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
инструкции по настройке учётных данных можно найти в [документации Agno](https://docs.agno.com/concepts/models/introduction)
:::

Далее определите учётные данные, необходимые для подключения к демонстрационной среде ClickHouse SQL:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## Инициализация MCP-сервера и агента Agno {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP-сервер для подключения к ClickHouse SQL playground
и инициализируйте агента Agno, задав ему вопрос:

```python
from agno.agent import Agent
from agno.tools.mcp import MCPTools
from agno.models.anthropic import Claude
```

```python
async with MCPTools(command="uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse", env=env, timeout_seconds=60) as mcp_tools:
    agent = Agent(
        model=Claude(id="claude-3-5-sonnet-20240620"),
        markdown=True,
        tools = [mcp_tools]
    )
await agent.aprint_response("What's the most starred project in 2025?", stream=True)
```

```response title="Ответ"
▰▱▱▱▱▱▱ Thinking...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ Какой проект получил больше всего звёзд в 2025 году?                                                           ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Tool Calls ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ • list_tables(database=github, like=%)                                                                          ┃
┃ • run_select_query(query=SELECT                                                                                 ┃
┃     repo_name,                                                                                                  ┃
┃     SUM(count) AS stars_2025                                                                                    ┃
┃ FROM github.repo_events_per_day                                                                                 ┃
┃ WHERE event_type = 'WatchEvent'                                                                                 ┃
┃     AND created_at >= '2025-01-01'                                                                              ┃
┃     AND created_at < '2026-01-01'                                                                               ┃
┃ GROUP BY repo_name                                                                                              ┃
┃ ORDER BY stars_2025 DESC                                                                                        ┃
┃ LIMIT 1)                                                                                                        ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Response (34.9s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ Чтобы ответить на ваш вопрос о проекте с наибольшим количеством звёзд в 2025 году, мне нужно выполнить запрос к базе данных ClickHouse.     ┃
┃ Однако сначала мне необходимо собрать информацию и убедиться, что мы работаем с правильными данными. ┃
┃ Давайте сначала проверим доступные базы данных и таблицы.Спасибо за предоставленный список баз данных. Я вижу,  ┃
┃ что есть база данных "github", которая, вероятно, содержит нужную информацию. Давайте проверим ┃
┃ таблицы в этой базе данных.Теперь, когда у нас есть информация о таблицах в базе данных github, мы можем запросить  ┃
┃ необходимые данные для ответа на ваш вопрос о проекте с наибольшим количеством звёзд в 2025 году. Мы используем таблицу repo_events_per_day ┃
┃ , которая содержит ежедневное количество событий для каждого репозитория, включая события добавления в избранное (WatchEvents).              ┃
┃                                                                                                                 ┃
┃ Давайте создадим запрос для поиска проекта с наибольшим количеством звёзд в 2025 году:На основе результатов запроса я могу ответить на ваш     ┃
┃ вопрос о проекте с наибольшим количеством звёзд в 2025 году:                                                   ┃
┃                                                                                                                 ┃
┃ Проектом с наибольшим количеством звёзд в 2025 году стал deepseek-ai/DeepSeek-R1, который получил 84 962 звезды за этот год.     ┃
┃                                                                                                                 ┃
┃ Этот проект, DeepSeek-R1, по-видимому, является репозиторием, связанным с искусственным интеллектом, от организации DeepSeek AI. Он привлёк  ┃
┃ значительное внимание и популярность в сообществе GitHub в 2025 году, получив наибольшее количество звёзд    ┃
┃ среди всех проектов за этот год.                                                                               ┃
┃                                                                                                                 ┃
┃ Стоит отметить, что эти данные основаны на событиях GitHub, записанных в базе данных, и представляют  ┃
┃ звёзды (WatchEvents), накопленные именно в течение 2025 года. Общее количество звёзд для этого проекта   ┃
┃ может быть выше, если учитывать весь период его существования.                                                 ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
