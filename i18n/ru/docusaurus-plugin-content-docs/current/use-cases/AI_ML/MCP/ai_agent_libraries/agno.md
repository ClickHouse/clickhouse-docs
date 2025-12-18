---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: 'Интеграция Agno'
title: 'Как создать AI-агента с помощью Agno и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать AI-агента с помощью Agno и сервера ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать агента ИИ с помощью Agno и ClickHouse MCP Server {#how-to-build-an-ai-agent-with-agno-and-the-clickhouse-mcp-server}

В этом руководстве вы узнаете, как создать агента ИИ на базе [Agno](https://github.com/agno-agi/agno), способного взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb).
:::

## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ Anthropic или API-ключ другого поставщика LLM.

Следующие шаги можно выполнить либо из Python REPL, либо с помощью скрипта.

<VerticalStepper headerLevel="h2">

## Установка библиотек {#install-libraries}

Установите библиотеку Agno с помощью следующих команд:

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```

## Настройка учетных данных {#setup-credentials}

Далее необходимо указать свой API-ключ Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
вы можете найти инструкции по настройке учётных данных в [документации Agno](https://docs.agno.com/concepts/models/introduction)
:::

Далее определите учётные данные, необходимые для подключения к песочнице ClickHouse SQL:

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

```response title="Response"
▰▱▱▱▱▱▱ Thinking...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ What's the most starred project in 2025?                                                                        ┃
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
┃ To answer your question about the most starred project in 2025, I'll need to query the ClickHouse database.     ┃
┃ However, before I can do that, I need to gather some information and make sure we're looking at the right data. ┃
┃ Let me check the available databases and tables first.Thank you for providing the list of databases. I can see  ┃
┃ that there's a "github" database, which is likely to contain the information we're looking for. Let's check the ┃
┃ tables in this database.Now that we have information about the tables in the github database, we can query the  ┃
┃ relevant data to answer your question about the most starred project in 2025. We'll use the repo_events_per_day ┃
┃ table, which contains daily event counts for each repository, including star events (WatchEvents).              ┃
┃                                                                                                                 ┃
┃ Let's create a query to find the most starred project in 2025:Based on the query results, I can answer your     ┃
┃ question about the most starred project in 2025:                                                                ┃
┃                                                                                                                 ┃
┃ The most starred project in 2025 was deepseek-ai/DeepSeek-R1, which received 84,962 stars during that year.     ┃
┃                                                                                                                 ┃
┃ This project, DeepSeek-R1, appears to be an AI-related repository from the DeepSeek AI organization. It gained  ┃
┃ significant attention and popularity among the GitHub community in 2025, earning the highest number of stars    ┃
┃ for any project during that year.                                                                               ┃
┃                                                                                                                 ┃
┃ It's worth noting that this data is based on the GitHub events recorded in the database, and it represents the  ┃
┃ stars (WatchEvents) accumulated specifically during the year 2025. The total number of stars for this project   ┃
┃ might be higher if we consider its entire lifespan.                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
