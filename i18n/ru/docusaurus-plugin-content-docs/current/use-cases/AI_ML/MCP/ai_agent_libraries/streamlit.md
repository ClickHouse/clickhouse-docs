---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/streamlit-agent'
'sidebar_label': '集成 Streamlit'
'title': '如何使用 Streamlit 构建 ClickHouse 支持的 AI 代理'
'pagination_prev': null
'pagination_next': null
'description': '学习如何使用 Streamlit 和 ClickHouse MCP 服务器构建基于 Web 的 AI 代理'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Streamlit'
- 'Agno'
- 'AI Agent'
'show_related_blogs': true
'doc_type': 'guide'
---


# Как создать AI-агента на базе ClickHouse с помощью Streamlit

В этом руководстве вы научитесь создавать веб-агента на базе ИИ, используя [Streamlit](https://streamlit.io/), который может взаимодействовать с [SQL-площадкой ClickHouse](https://sql.clickhouse.com/) с помощью [Сервера MCP ClickHouse](https://github.com/ClickHouse/mcp-clickhouse) и [Agno](https://github.com/agno-agi/agno).

:::note Пример приложения
Этот пример создает полноценное веб-приложение, которое предоставляет интерфейс чата для выполнения запросов к данным ClickHouse.
Исходный код этого примера вы можете найти в [репозитории примеров](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit).
:::

## Предварительные условия {#prerequisites}
- У вас должна быть установлена Python на вашем компьютере.
  Вам также необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/).
- Вам нужен API-ключ Anthropic или API-ключ от другого провайдера LLM.

Вы можете выполнить следующие шаги для создания вашего приложения Streamlit.

<VerticalStepper headerLevel="h2">

## Установка библиотек {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```bash
pip install streamlit agno ipywidgets
```

## Создание файла утилит {#create-utilities}

Создайте файл `utils.py` с двумя утилитными функциями. Первая — это
асинхронный генератор функций для обработки потоковых ответов от 
агента Agno. Вторая — это функция для применения стилей к приложению Streamlit:

```python title="utils.py"
import streamlit as st
from agno.run.response import RunEvent, RunResponse

async def as_stream(response):
    async for chunk in response:
        if isinstance(chunk, RunResponse) and isinstance(chunk.content, str):
            if chunk.event == RunEvent.run_response:
                yield chunk.content

def apply_styles():
    st.markdown("""
  <style>
  hr.divider {
  background-color: white;
  margin: 0;
  }
  </style>
  <hr class='divider' />""", unsafe_allow_html=True)
```

## Настройка учетных данных {#setup-credentials}

Установите ваш API-ключ Anthropic как переменную окружения:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
вы можете найти инструкции по настройке ваших учетных данных в [документации Agno "Интеграции"](https://docs.agentops.ai/v2/integrations/ag2).
:::

## Импорт необходимых библиотек {#import-libraries}

Начните с создания вашего основного файла приложения Streamlit (например, `app.py`) и добавьте импорты:

```python
from utils import apply_styles

import streamlit as st
from textwrap import dedent

from agno.models.anthropic import Claude
from agno.agent import Agent
from agno.tools.mcp import MCPTools
from agno.storage.json import JsonStorage
from agno.run.response import RunEvent, RunResponse
from mcp.client.stdio import stdio_client, StdioServerParameters

from mcp import ClientSession

import asyncio
import threading
from queue import Queue
```

## Определение функции потокового агента {#define-agent-function}

Добавьте основную функцию агента, которая подключается к [SQL-площадке ClickHouse](https://sql.clickhouse.com/) и потоково отправляет ответы:

```python
async def stream_clickhouse_agent(message):
    env = {
            "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
            "CLICKHOUSE_PORT": "8443",
            "CLICKHOUSE_USER": "demo",
            "CLICKHOUSE_PASSWORD": "",
            "CLICKHOUSE_SECURE": "true"
        }

    server_params = StdioServerParameters(
        command="uv",
        args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
        ],
        env=env
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            mcp_tools = MCPTools(timeout_seconds=60, session=session)
            await mcp_tools.initialize()
            agent = Agent(
                model=Claude(id="claude-3-5-sonnet-20240620"),
                tools=[mcp_tools],
                instructions=dedent("""\
                    You are a ClickHouse assistant. Help users query and understand data using ClickHouse.
                    - Run SQL queries using the ClickHouse MCP tool
                    - Present results in markdown tables when relevant
                    - Keep output concise, useful, and well-formatted
                """),
                markdown=True,
                show_tool_calls=True,
                storage=JsonStorage(dir_path="tmp/team_sessions_json"),
                add_datetime_to_instructions=True, 
                add_history_to_messages=True,
            )
            chunks = await agent.arun(message, stream=True)
            async for chunk in chunks:
                if isinstance(chunk, RunResponse) and chunk.event == RunEvent.run_response:
                    yield chunk.content
```

## Добавление синхронных оберток {#add-wrapper-functions}

Добавьте вспомогательные функции для обработки асинхронного потока в Streamlit:

```python
def run_agent_query_sync(message):
    queue = Queue()
    def run():
        asyncio.run(_agent_stream_to_queue(message, queue))
        queue.put(None)  # Sentinel to end stream
    threading.Thread(target=run, daemon=True).start()
    while True:
        chunk = queue.get()
        if chunk is None:
            break
        yield chunk

async def _agent_stream_to_queue(message, queue):
    async for chunk in stream_clickhouse_agent(message):
        queue.put(chunk)
```

## Создание интерфейса Streamlit {#create-interface}

Добавьте компоненты пользовательского интерфейса Streamlit и функциональность чата:

```python
st.title("A ClickHouse-backed AI agent")

if st.button("💬 New Chat"):
  st.session_state.messages = []
  st.rerun()

apply_styles()

if "messages" not in st.session_state:
  st.session_state.messages = []

for message in st.session_state.messages:
  with st.chat_message(message["role"]):
    st.markdown(message["content"])

if prompt := st.chat_input("What is up?"):
  st.session_state.messages.append({"role": "user", "content": prompt})
  with st.chat_message("user"):
    st.markdown(prompt)
  with st.chat_message("assistant"):
    response = st.write_stream(run_agent_query_sync(prompt))
  st.session_state.messages.append({"role": "assistant", "content": response})
```

## Запуск приложения {#run-application}

Чтобы запустить ваше веб-приложение AI-агента ClickHouse, вы можете выполнить
следующую команду в терминале:

```bash
uv run \
  --with streamlit \
  --with agno \
  --with anthropic \
  --with mcp \
  streamlit run app.py --server.headless true
```

Это откроет ваш веб-браузер и перенаправит вас на `http://localhost:8501`, где вы
можете взаимодействовать с вашим AI-агентом и задавать ему вопросы о примерах наборов данных,
доступных на SQL-площадке ClickHouse.

</VerticalStepper>
