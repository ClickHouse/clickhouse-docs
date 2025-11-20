---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: 'Интеграция PydanticAI'
title: 'Как создать агента PydanticAI на основе ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать агента PydanticAI, который может взаимодействовать с ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать агента PydanticAI с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать агента [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1),
который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [MCP-сервера ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb).
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
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # замените на соответствующий пакет, если используете другого провайдера LLM
```


## Настройка учетных данных {#setup-credentials}

Далее вам потребуется указать ваш API-ключ Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
инструкции по настройке учетных данных можно найти в [документации PydanticAI](https://ai.pydantic.dev/models/)
:::

Далее определите учетные данные, необходимые для подключения к демонстрационной среде ClickHouse SQL:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## Инициализация MCP Server и агента PydanticAI {#initialize-mcp}

Теперь настройте ClickHouse MCP Server для подключения к песочнице ClickHouse SQL:

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.messages import ToolCallPart, ToolReturnPart

server = MCPServerStdio(
    'uv',
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
agent = Agent('anthropic:claude-sonnet-4-0', mcp_servers=[server])
```


## Задайте вопрос агенту {#ask-agent}

Наконец, вы можете задать вопрос агенту:

```python
async with agent.run_mcp_servers():
    result = await agent.run("Кто создал больше всего PR для ClickHouse?")
    print(result.output)
```

Вы получите ответ, похожий на приведённый ниже:

```response title="Ответ"
На основе данных из GitHub-репозитория ClickHouse, вот топ-контрибьюторов по количеству созданных pull request'ов:

**Топ-контрибьюторы ClickHouse по открытым PR:**

1. **alexey-milovidov** — 3 370 открытых PR
2. **azat** — 1 905 открытых PR
3. **rschu1ze** — 979 открытых PR
4. **alesapin** — 947 открытых PR
5. **tavplubix** — 896 открытых PR
6. **kssenii** — 871 открытый PR
7. **Avogar** — 805 открытых PR
8. **KochetovNicolai** — 700 открытых PR
9. **Algunenano** — 658 открытых PR
10. **kitaisreal** — 630 открытых PR

**Alexey Milovidov** выделяется как безусловно самый активный контрибьютор с более чем 3 370 открытыми pull request'ами, что значительно больше, чем у любого другого участника. Это логично, поскольку Alexey Milovidov является одним из основателей и ведущих разработчиков ClickHouse.

Данные также показывают, что alexey-milovidov очень активен в управлении PR: помимо создания собственных PR, у него 12 818 событий «закрытия» (вероятно, проверка и закрытие PR от других контрибьюторов).

Стоит отметить, что я отфильтровал различные аккаунты роботов и ботов, которые обрабатывают автоматизированные процессы, сосредоточившись на реальных участниках, чтобы дать вам наиболее содержательный ответ о том, кто внёс наибольший вклад в ClickHouse по количеству PR.
```

</VerticalStepper>
