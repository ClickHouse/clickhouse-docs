---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: 'LangChain 통합'
title: 'ClickHouse MCP Server를 사용해 LangChain/LangGraph AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server를 사용하여 ClickHouse의 SQL playground와 상호 작용할 수 있는 LangChain/LangGraph AI 에이전트를 구축하는 방법을 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP Server를 사용하여 LangChain/LangGraph AI 에이전트를 구축하는 방법 \{#how-to-build-a-langchainlanggraph-ai-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [ClickHouse의 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여 [ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호 작용할 수 있는 [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI 에이전트를 구축하는 방법을 알아봅니다.

:::note 예제 노트북
이 예제는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb)에 있는 노트북으로 제공됩니다.
:::

## 사전 준비 사항 \{#prerequisites\}

- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`가 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공업체의 API 키가 필요합니다.

다음 단계는 Python REPL에서 직접 실행하거나 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">
  ## 라이브러리 설치하기

  다음 명령을 실행하여 필요한 라이브러리를 설치하세요:

  ```python
  pip install -q --upgrade pip
  pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
  ```

  ## 자격 증명 설정하기

  다음으로 Anthropic API 키를 제공하십시오:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  :::note 다른 LLM 제공자 사용
  Anthropic API 키가 없고 다른 LLM 제공자를 사용하고자 하는 경우,
  자격 증명 설정 방법은 [Langchain Providers 문서](https://python.langchain.com/docs/integrations/providers/)에서 확인할 수 있습니다.
  :::

  ## MCP 서버 초기화하기

  이제 ClickHouse MCP Server를 ClickHouse SQL 플레이그라운드에 연결하도록 구성하세요:

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

  ## 스트림 핸들러 구성하기

  Langchain과 ClickHouse MCP Server를 사용할 때 쿼리 결과는 단일 응답이 아닌 스트리밍 데이터로 반환되는 경우가 많습니다. 대용량 데이터셋이나 처리 시간이 오래 걸릴 수 있는 복잡한 분석 쿼리의 경우 스트림 핸들러를 구성하는 것이 중요합니다. 적절한 처리가 없으면 이러한 스트리밍 출력을 애플리케이션에서 다루기 어려울 수 있습니다.

  스트리밍된 출력을 더 쉽게 사용할 수 있도록 핸들러를 구성하세요:

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

  ## 에이전트 호출하기

  마지막으로 에이전트를 호출하여 ClickHouse에 가장 많은 코드를 커밋한 사람을 질문하세요:

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

  아래와 유사한 응답을 확인할 수 있습니다:

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