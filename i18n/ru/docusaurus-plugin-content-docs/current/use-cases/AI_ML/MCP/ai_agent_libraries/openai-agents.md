---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/openai-agents'
'sidebar_label': '集成 OpenAI'
'title': '如何使用 ClickHouse MCP 服务器构建 OpenAI 代理。'
'pagination_prev': null
'pagination_next': null
'description': '了解如何构建一个可以与 ClickHouse MCP 服务器互动的 OpenAI 代理。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'OpenAI'
'show_related_blogs': true
'doc_type': 'guide'
---


# Как создать агента OpenAI с использованием ClickHouse MCP Server

В этом руководстве вы научитесь создавать агента [OpenAI](https://github.com/openai/openai-agents-python), который
может взаимодействовать с [SQL-площадкой ClickHouse](https://sql.clickhouse.com/) с помощью [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример можно найти в виде блокнота в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb).
:::

## Предварительные требования {#prerequisites}
- У вас должна быть установлена Python на вашей системе.
- У вас должна быть установлена `pip` на вашей системе.
- Вам потребуется ключ API OpenAI.

Вы можете выполнить следующие шаги как из вашего Python REPL, так и через скрипт.

<VerticalStepper headerLevel="h2">

## Установка библиотек {#install-libraries}

Установите необходимые библиотеки, запустив следующие команды:

```python
!pip install -q --upgrade pip
!pip install -q openai-agents
```

## Настройка учетных данных {#setup-credentials}

Далее вам нужно будет предоставить ваш ключ API OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

## Инициализация MCP Server и агента OpenAI {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server так, чтобы он указывал на SQL-площадку ClickHouse,
инициализируйте вашего агента OpenAI и задайте ему вопрос:

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """Simple version that just filters important events"""

    # Tool calls
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Tool: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # Handle both string and already-parsed output
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # Handle both dict and list formats
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # Handle list format
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                else:
                    # Fallback - just print the raw output
                    print(f"✅ Result: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # Fallback to raw output if parsing fails
                print(f"✅ Result: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Response: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Response: {str(chunk.item)[:100]}...")

    # Text deltas for streaming
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
        name="Assistant",
        instructions="Use the tools to query ClickHouse and answer questions based on those files.",
        mcp_servers=[server],
    )

    message = "What's the biggest GitHub project so far in 2025?"
    print(f"\n\nRunning: {message}")
    with trace("Biggest project workflow"):
        result = Runner.run_streamed(starting_agent=agent, input=message, max_turns=20)
        async for chunk in result.stream_events():
            simple_render_chunk(chunk)
```

```response title="Response"
Running: What's the biggest GitHub project so far in 2025?
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
The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.💬 Response: The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.
```

</VerticalStepper>
