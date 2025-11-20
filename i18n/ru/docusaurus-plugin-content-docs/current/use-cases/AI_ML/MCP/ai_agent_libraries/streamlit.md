---
slug: /use-cases/AI/MCP/ai-agent-libraries/streamlit-agent
sidebar_label: 'Интеграция со Streamlit'
title: 'Как создать AI-агента на ClickHouse с использованием Streamlit'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать веб-агента AI с помощью Streamlit и сервера ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Streamlit', 'Agno', 'AI Agent']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента на ClickHouse с помощью Streamlit

В этом руководстве вы узнаете, как создать веб-агента с AI с помощью [Streamlit](https://streamlit.io/), который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [MCP-сервер ClickHouse](https://github.com/ClickHouse/mcp-clickhouse) и [Agno](https://github.com/agno-agi/agno).

:::note Пример приложения
В этом примере создаётся полноценное веб-приложение с чат-интерфейсом для выполнения запросов к данным в ClickHouse.
Исходный код этого примера можно найти в [репозитории примеров](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
  Необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Вам понадобится API-ключ Anthropic или API-ключ другого провайдера LLM

Выполните следующие шаги для создания приложения Streamlit.

<VerticalStepper headerLevel="h2">


## Установка библиотек {#install-libraries}

Установите необходимые библиотеки, выполнив следующие команды:

```bash
pip install streamlit agno ipywidgets
```


## Создание файла утилит {#create-utilities}

Создайте файл `utils.py` с двумя вспомогательными функциями. Первая — это
асинхронная функция-генератор для обработки потоковых ответов от
агента Agno. Вторая — функция для применения стилей к
приложению Streamlit:

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

Установите API-ключ Anthropic в качестве переменной окружения:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

:::note Использование другого провайдера LLM
Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
инструкции по настройке учетных данных можно найти в [документации Agno "Integrations"](https://docs.agentops.ai/v2/integrations/ag2)
:::


## Импорт необходимых библиотек {#import-libraries}

Начните с создания основного файла приложения Streamlit (например, `app.py`) и добавьте импорты:

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


## Определение функции потоковой передачи агента {#define-agent-function}

Добавьте основную функцию агента, которая подключается к [SQL playground ClickHouse](https://sql.clickhouse.com/) и передаёт ответы в потоковом режиме:

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
                    Вы — ассистент ClickHouse. Помогайте пользователям выполнять запросы и анализировать данные с использованием ClickHouse.
                    - Выполняйте SQL-запросы с помощью инструмента ClickHouse MCP
                    - Представляйте результаты в виде markdown-таблиц, когда это уместно
                    - Делайте вывод кратким, полезным и хорошо отформатированным
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


## Добавление синхронных функций-обёрток {#add-wrapper-functions}

Добавьте вспомогательные функции для обработки асинхронной потоковой передачи данных в Streamlit:

```python
def run_agent_query_sync(message):
    queue = Queue()
    def run():
        asyncio.run(_agent_stream_to_queue(message, queue))
        queue.put(None)  # Сигнал завершения потока
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
st.title("AI-агент на основе ClickHouse")

if st.button("💬 Новый чат"):
  st.session_state.messages = []
  st.rerun()

apply_styles()

if "messages" not in st.session_state:
  st.session_state.messages = []

for message in st.session_state.messages:
  with st.chat_message(message["role"]):
    st.markdown(message["content"])

if prompt := st.chat_input("Чем могу помочь?"):
  st.session_state.messages.append({"role": "user", "content": prompt})
  with st.chat_message("user"):
    st.markdown(prompt)
  with st.chat_message("assistant"):
    response = st.write_stream(run_agent_query_sync(prompt))
  st.session_state.messages.append({"role": "assistant", "content": response})
```


## Запуск приложения {#run-application}

Чтобы запустить веб-приложение AI-агента ClickHouse, выполните
следующую команду в терминале:

```bash
uv run \
  --with streamlit \
  --with agno \
  --with anthropic \
  --with mcp \
  streamlit run app.py --server.headless true
```

Это откроет веб-браузер и перейдет на адрес `http://localhost:8501`, где вы
сможете взаимодействовать с AI-агентом и задавать ему вопросы о примерах наборов данных,
доступных в SQL playground ClickHouse.

</VerticalStepper>
