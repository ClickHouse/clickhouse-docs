---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/pydantic-ai'
'sidebar_label': 'Сборка PydanticAI'
'title': 'Как создать один из применений ClickHouse MCP сервера PydanticAI драйвера.'
'pagination_prev': null
'pagination_next': null
'description': 'Узнайте, как создать одну из возможностей взаимодействия с ClickHouse
  MCP сервером PydanticAI драйвера.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'PydanticAI'
'show_related_blogs': true
'doc_type': 'guide'
---
# Как создать агента PydanticAI с использованием сервера ClickHouse MCP

В этом руководстве вы узнаете, как создать агента [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1), который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с использованием [сервера MCP ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример можно найти в виде блокнота в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb).
:::

## Предварительные требования {#prerequisites}
- Вам нужно установить Python на ваш компьютер.
- Вам нужно установить `pip` на ваш компьютер.
- Вам нужен ключ API Anthropic или ключ API от другого провайдера LLM.

Вы можете выполнить следующие шаги как в вашем Python REPL, так и через скрипт.

<VerticalStepper headerLevel="h2">

## Установите библиотеки {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```python
!pip install -q --upgrade pip
!pip install -q "pydantic-ai-slim[mcp]"
!pip install -q "pydantic-ai-slim[anthropic]" # replace with the appropriate package if using a different LLM provider
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

:::note Использование другого провайдера LLM
Если у вас нет ключа API Anthropic и вы хотите использовать другого провайдера LLM, вы можете найти инструкции по настройке ваших учетных данных в [документации PydanticAI](https://ai.pydantic.dev/models/).
:::

Затем определите учетные данные, необходимые для подключения к SQL-песочнице ClickHouse:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## Инициализация сервера MCP и агента PydanticAI {#initialize-mcp}

Теперь настройте сервер ClickHouse MCP, чтобы указать на SQL-песочницу ClickHouse:

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

Наконец, вы можете задать агенту вопрос:

```python
async with agent.run_mcp_servers():
    result = await agent.run("Who's done the most PRs for ClickHouse?")
    print(result.output)
```

Вы получите ответ, похожий на следующий:

```response title="Response"
Based on the data from the ClickHouse GitHub repository, here are the top contributors by number of pull requests created:

**Top contributors to ClickHouse by PRs opened:**

1. **alexey-milovidov** - 3,370 PRs opened
2. **azat** - 1,905 PRs opened  
3. **rschu1ze** - 979 PRs opened
4. **alesapin** - 947 PRs opened
5. **tavplubix** - 896 PRs opened
6. **kssenii** - 871 PRs opened
7. **Avogar** - 805 PRs opened
8. **KochetovNicolai** - 700 PRs opened
9. **Algunenano** - 658 PRs opened
10. **kitaisreal** - 630 PRs opened

**Alexey Milovidov** stands out as by far the most active contributor with over 3,370 pull requests opened, which is significantly more than any other contributor. This makes sense as Alexey Milovidov is one of the founders and lead developers of ClickHouse.

The data also shows that alexey-milovidov has been very active in managing PRs, with 12,818 "closed" events (likely reviewing and closing PRs from other contributors) in addition to creating his own PRs.

It's worth noting that I filtered out various robot/bot accounts that handle automated processes, focusing on human contributors to give you the most meaningful answer about who has contributed the most PRs to ClickHouse.
```

</VerticalStepper>