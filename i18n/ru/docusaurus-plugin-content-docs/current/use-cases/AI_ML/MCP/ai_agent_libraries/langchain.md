---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: 'Интеграция с LangChain'
title: 'Как создать агента ИИ LangChain/LangGraph с помощью MCP-сервера ClickHouse.'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать агента ИИ LangChain/LangGraph, который может взаимодействовать с SQL-песочницей ClickHouse с помощью MCP-сервера ClickHouse.'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать ИИ-агента LangChain/LangGraph с использованием MCP-сервера ClickHouse \{#how-to-build-a-langchainlanggraph-ai-agent-using-clickhouse-mcp-server\}

В этом руководстве вы узнаете, как создать ИИ-агента [LangChain/LangGraph](https://github.com/langchain-ai/langgraph),
который может взаимодействовать с [SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [MCP-сервер ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb).
:::

## Предварительные требования \{#prerequisites\}

- На вашей системе должен быть установлен Python.
- На вашей системе должен быть установлен `pip`.
- Вам понадобится ключ API Anthropic или ключ API от другого поставщика LLM.

Вы можете выполнить следующие шаги либо в интерактивной консоли Python (REPL), либо с помощью скрипта.

<VerticalStepper headerLevel="h2">
  ## Установка библиотек

  Установите необходимые библиотеки, выполнив следующие команды:

  ```python
  pip install -q --upgrade pip
  pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
  ```

  ## Настройка учетных данных

  Далее необходимо указать ваш API-ключ Anthropic:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  :::note Использование другого провайдера LLM
  Если у вас нет API-ключа Anthropic и вы хотите использовать другого провайдера LLM,
  инструкции по настройке учетных данных см. в [документации Langchain Providers](https://python.langchain.com/docs/integrations/providers/)
  :::

  ## Инициализация MCP-сервера

  Теперь настройте ClickHouse MCP-сервер для подключения к песочнице ClickHouse SQL:

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

  ## Настройка обработчика потоков

  При работе с Langchain и ClickHouse MCP Server результаты запросов часто
  возвращаются в виде потоковых данных, а не единым ответом. Для больших наборов данных или
  сложных аналитических запросов, обработка которых может занять время, важно настроить
  обработчик потока. Без надлежащей обработки работа с таким потоковым выводом в вашем приложении может быть затруднена.

  Настройте обработчик для потокового вывода, чтобы упростить его обработку:

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

  ## Вызов агента

  Наконец, вызовите агента и спросите его, кто внёс больше всего кода в ClickHouse:

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

  Вы должны увидеть ответ, аналогичный приведенному ниже:

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