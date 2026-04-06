---
slug: /use-cases/AI/MCP/ai-agent-libraries/streamlit-agent
sidebar_label: 'Интеграция Streamlit'
title: 'Как создать ИИ-агент на базе ClickHouse с помощью Streamlit'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать веб-ИИ-агента с помощью Streamlit и MCP-сервера ClickHouse'
keywords: ['ClickHouse', 'MCP', 'Streamlit', 'Agno', 'ИИ-агент']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать ИИ-агент на базе ClickHouse с помощью Streamlit \{#how-to-build-a-clickhouse-backed-ai-agent-with-streamlit\}

В этом руководстве вы узнаете, как создать веб-ИИ-агента с использованием [Streamlit](https://streamlit.io/), способного взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/) через [MCP-сервер ClickHouse](https://github.com/ClickHouse/mcp-clickhouse) и [Agno](https://github.com/agno-agi/agno).

:::note Пример приложения
В этом примере создаётся полнофункциональное веб-приложение, предоставляющее чат-интерфейс для выполнения запросов к данным ClickHouse.
Исходный код этого примера вы можете найти в [репозитории examples](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit).
:::

## Предварительные требования \{#prerequisites\}

- В вашей системе должен быть установлен Python.
  Необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Вам потребуется API-ключ Anthropic или API-ключ от другого провайдера LLM

Выполните следующие шаги для создания приложения Streamlit.

<VerticalStepper headerLevel="h2">
  ## Установка библиотек

  Установите необходимые библиотеки, выполнив следующие команды:

  ```bash
  pip install streamlit agno ipywidgets
  ```

  ## Создайте файл утилит

  Создайте файл `utils.py` с двумя вспомогательными функциями. Первая — это
  асинхронный генератор функций для обработки потоковых ответов от
  агента Agno. Вторая — функция для применения стилей к приложению Streamlit:

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

  ## Настройка учетных данных

  Задайте API-ключ Anthropic в качестве переменной окружения:

  ```bash
  export ANTHROPIC_API_KEY="your_api_key_here"
  ```

  :::note Использование другого провайдера LLM
  Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
  инструкции по настройке учетных данных можно найти в [документации Agno «Integrations»](https://docs.agentops.ai/v2/integrations/ag2)
  :::

  ## Импортируйте необходимые библиотеки

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

  ## Определите функцию потоковой передачи агента

  Добавьте основную функцию агента, которая подключается к [SQL-песочнице ClickHouse](https://sql.clickhouse.com/) и осуществляет потоковую передачу ответов:

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

  ## Добавьте синхронные функции-обёртки

  Добавьте вспомогательные функции для обработки асинхронной потоковой передачи в Streamlit:

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

  ## Создайте интерфейс Streamlit

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

  ## Запуск приложения

  Чтобы запустить веб-приложение AI-агента ClickHouse, выполните следующую команду в терминале:

  ```bash
  uv run \
    --with streamlit \
    --with agno \
    --with anthropic \
    --with mcp \
    streamlit run app.py --server.headless true
  ```

  Это откроет ваш веб-браузер и перейдет по адресу `http://localhost:8501`, где вы
  сможете взаимодействовать с вашим AI-агентом и задавать ему вопросы о примерах наборов данных,
  доступных в SQL-песочнице ClickHouse.
</VerticalStepper>