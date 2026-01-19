---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: 'Интеграция с Claude Agent SDK'
title: 'Как создать ИИ-агента с помощью Claude Agent SDK и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать ИИ-агента с помощью Claude Agent SDK и сервера ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать AI-агента с помощью Claude Agent SDK и ClickHouse MCP Server \{#how-to-build-an-ai-agent-with-claude-agent-sdk-and-the-clickhouse-mcp-server\}

В этом руководстве вы узнаете, как создать AI-агента на базе [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview), который может взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример доступен в виде блокнота в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb).
:::

## Предварительные требования \{#prerequisites\}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ Anthropic.

Следующие шаги можно выполнить либо из Python REPL, либо через скрипт.

<VerticalStepper headerLevel="h2">

## Установка библиотек \{#install-libraries\}

Установите библиотеку Claude Agent SDK, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q claude-agent-sdk
pip install -q ipywidgets
```

## Настройка учетных данных \{#setup-credentials\}

Далее вам нужно будет указать свой ключ API Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

Далее задайте учетные данные, необходимые для подключения к песочнице ClickHouse SQL:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## Инициализация MCP-сервера и агента Claude Agent SDK \{#initialize-mcp-and-agent\}

Теперь настройте ClickHouse MCP-сервер для подключения к ClickHouse SQL playground
и инициализируйте агента, задав ему вопрос:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, UserMessage, TextBlock, ToolUseBlock
```

```python
options = ClaudeAgentOptions(
    allowed_tools=[
        "mcp__mcp-clickhouse__list_databases",
        "mcp__mcp-clickhouse__list_tables", 
        "mcp__mcp-clickhouse__run_select_query",
        "mcp__mcp-clickhouse__run_chdb_select_query"
    ],
    mcp_servers={
        "mcp-clickhouse": {
            "command": "uv",
            "args": [
                "run",
                "--with", "mcp-clickhouse",
                "--python", "3.10",
                "mcp-clickhouse"
            ],
            "env": env
        }
    }
)


async for message in query(prompt="Tell me something interesting about UK property sales", options=options):
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(f"🤖 {block.text}")
            if isinstance(block, ToolUseBlock):
                print(f"🛠️ {block.name} {block.input}")
    elif isinstance(message, UserMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
```

Обратите внимание, что код внутри блока `for` фильтрует вывод для краткости.

```response title="Response"
🤖 I'll query the ClickHouse database to find something interesting about UK property sales.

Let me first see what databases are available:
🛠️ mcp__mcp-clickhouse__list_databases {}
🤖 Great! There's a "uk" database. Let me see what tables are available:
🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
🤖 Perfect! The `uk_price_paid` table has over 30 million property sales records. Let me find something interesting:
🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
🤖 Here's something fascinating: **Baker Street in London** (yes, the famous Sherlock Holmes street!) has the largest price range of any street with over 100 sales - properties sold for as low as **£2,500** and as high as **£594.3 million**, a staggering difference of over £594 million!

This makes sense given Baker Street is one of London's most prestigious addresses, running through wealthy areas like Marylebone, and has had 541 recorded sales in this dataset.
```

</VerticalStepper>
