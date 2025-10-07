---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/langchain'
'sidebar_label': 'Сборка Langchain'
'title': 'Как использовать ClickHouse MCP сервер для создания LangChain/LangGraph
  AI API.'
'pagination_prev': null
'pagination_next': null
'description': 'Узнайте, как создать API LangChain/LangGraph AI, который может использовать
  ClickHouse MCP сервер и проводить взаимодействие с SQL playground ClickHouse.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'LangChain'
- 'LangGraph'
'show_related_blogs': true
'doc_type': 'guide'
---
# Как создать AI-агента LangChain/LangGraph с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать AI-агента [LangChain/LangGraph](https://github.com/langchain-ai/langgraph), который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример можно найти в виде ноутбука в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb).
:::

## Предварительные требования {#prerequisites}
- У вас должна быть установлена Python на вашем компьютере.
- У вас должен быть установлен `pip` на вашем компьютере.
- Вам нужен API-ключ Anthropic или API-ключ от другого провайдера LLM.

Вы можете выполнить следующие шаги как из вашего Python REPL, так и из скрипта.

<VerticalStepper headerLevel="h2">

## Установить библиотеки {#install-libraries}

Установите необходимые библиотеки, запустив следующие команды:

```python
!pip install -q --upgrade pip
!pip install -q langchain-mcp-adapters
!pip install -q langgraph
!pip install -q "langchain[anthropic]"
```

## Настроить учетные данные {#setup-credentials}

Затем вам нужно предоставить свой API-ключ Anthropic:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM, 
вы можете найти инструкции по настройке ваших учетных данных в [документации Langchain Providers](https://python.langchain.com/docs/integrations/providers/)
:::

## Инициализировать MCP Server {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server так, чтобы он указывал на SQL-песочницу ClickHouse:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

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
```

## Настроить обработчик потоков {#configure-the-stream-handler}

При работе с Langchain и ClickHouse MCP Server результаты запросов часто возвращаются как потоки данных, а не как один ответ. Для больших наборов данных или сложных аналитических запросов, которые могут потребовать времени для обработки, важно настроить обработчик потоков. Без надлежащей обработки, этот потоковый вывод может быть трудным для работы в вашем приложении.

Настройте обработчик для потокового вывода, чтобы его было легче потреблять:

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
```

## Вызвать агента {#call-the-agent}

Наконец, вызовите вашего агента и спросите его, кто внес больше всего кода в ClickHouse:

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

Вы должны увидеть ответ, подобный приведенному ниже:

```response title="Response"
I'll help you find who has committed the most code to ClickHouse by exploring the available databases and tables to locate git commit data.
🔧 list_databases ✅ I can see there's a `git` database which likely contains git commit information. Let me explore the tables in that database:
🔧 list_tables ✅ Perfect! I can see the `clickhouse_commits` table in the git database contains ClickHouse commit data with 80,644 commits. This table has information about each commit including the author, lines added/deleted, files modified, etc. Let me query this table to find who has committed the most code based on different metrics.
🔧 run_select_query ✅ Let me also look at just the lines added to see who has contributed the most new code:
🔧 run_select_query ✅ Based on the ClickHouse git commit data, **Alexey Milovidov** has committed the most code to ClickHouse by several measures:

## Key Statistics:

1. **Most Total Lines Changed**: Alexey Milovidov with **1,696,929 total lines changed** (853,049 added + 843,880 deleted)
2. **Most Lines Added**: Alexey Milovidov with **853,049 lines added**
3. **Most Commits**: Alexey Milovidov with **15,375 commits**
4. **Most Files Changed**: Alexey Milovidov with **73,529 files changed**

## Top Contributors by Lines Added:

1. **Alexey Milovidov**: 853,049 lines added (15,375 commits)
2. **s-kat**: 541,609 lines added (50 commits) 
3. **Nikolai Kochetov**: 219,020 lines added (4,218 commits)
4. **alesapin**: 193,566 lines added (4,783 commits)
5. **Vitaly Baranov**: 168,807 lines added (1,152 commits)

Alexey Milovidov is clearly the most prolific contributor to ClickHouse, which makes sense as he is one of the original creators and lead developers of the project. His contribution dwarfs others both in terms of total code volume and number of commits, with nearly 16,000 commits and over 850,000 lines of code added to the project.
```

</VerticalStepper>