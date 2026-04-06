---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'LlamaIndex 연동'
title: 'MCP 서버를 사용하여 LlamaIndex AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'MCP 서버와 상호작용할 수 있는 LlamaIndex AI 에이전트를 구축하는 방법을 설명합니다.'
keywords: ['ClickHouse', 'MCP', 'LlamaIndex']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP 서버를 사용하여 LlamaIndex AI 에이전트를 구축하는 방법 \{#how-to-build-a-llamaindex-ai-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여
[ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호작용할 수 있는 [LlamaIndex](https://docs.llamaindex.ai) AI 에이전트를 구축하는 방법을 안내합니다.

:::note 예제 노트북
이 예제는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb)의 노트북에서도 확인할 수 있습니다.
:::

## 사전 요구 사항 \{#prerequisites\}

* 시스템에 Python이 설치되어 있어야 합니다.
* 시스템에 `pip`이 설치되어 있어야 합니다.
* Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

다음 단계는 Python REPL 또는 스크립트를 통해 실행하실 수 있습니다.

<VerticalStepper headerLevel="h2">
  ## 라이브러리 설치 \{#install-libraries\}

  다음 명령어를 실행하여 필요한 라이브러리를 설치하십시오:

  ```python
  pip install -q --upgrade pip
  pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
  ```

  ## 자격 증명 설정 \{#setup-credentials\}

  다음으로, Anthropic API 키를 제공해야 합니다:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  :::note 다른 LLM 프로바이더 사용
  Anthropic API 키가 없고 다른 LLM 프로바이더를 사용하려는 경우,
  [LlamaIndex &quot;LLMs&quot; 문서](https://docs.llamaindex.ai/en/stable/examples/)에서 자격 증명 설정 방법을 확인하실 수 있습니다.
  :::

  ## MCP 서버 초기화 \{#initialize-mcp-and-agent\}

  이제 ClickHouse MCP 서버가 ClickHouse SQL 플레이그라운드를 가리키도록 구성하세요.
  이를 Python 함수에서 Llama Index 도구로 변환해야 합니다:

  ```python
  from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

  mcp_client = BasicMCPClient(
      "uv",
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

  mcp_tool_spec = McpToolSpec(
      client=mcp_client,
  )

  tools = await mcp_tool_spec.to_tool_list_async()
  ```

  ## 에이전트 생성 \{#create-agent\}

  이제 해당 도구들에 접근할 수 있는 에이전트를 생성할 준비가 되었습니다. 한 번의 실행에서 최대 도구 호출 횟수를 10으로 설정하십시오. 필요에 따라 이 매개변수를 수정할 수 있습니다:

  ```python
  from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

  agent_worker = FunctionCallingAgentWorker.from_tools(
      tools=tools,
      llm=llm, verbose=True, max_function_calls=10
  )
  agent = AgentRunner(agent_worker)
  ```

  ## LLM 초기화 \{#initialize-llm\}

  다음 코드를 사용하여 Claude Sonnet 4.0 모델을 초기화하십시오:

  ```python
  from llama_index.llms.anthropic import Anthropic
  llm = Anthropic(model="claude-sonnet-4-0")
  ```

  ## 에이전트 실행 \{#run-agent\}

  마지막으로 에이전트에 질문할 수 있습니다:

  ```python
  response = agent.query("What's the most popular repository?")
  ```

  응답이 길기 때문에 아래 예시 응답에서는 일부가 생략되었습니다:

  ```response title="Response"
  Added user message to memory: What's the most popular repository?
  === LLM Response ===
  I'll help you find the most popular repository. Let me first explore the available databases and tables to understand the data structure.
  === Calling Function ===
  Calling function: list_databases with args: {}
  === Function Output ===
  meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
  === LLM Response ===
  I can see there's a `github` database which likely contains repository data. Let me explore the tables in that database.
  === Calling Function ===
  Calling function: list_tables with args: {"database": "github"}
  === Function Output ===
  ...
  ...
  ...
  === LLM Response ===
  Based on the GitHub data, **the most popular repository is `sindresorhus/awesome`** with **402,292 stars**.

  Here are the top 10 most popular repositories by star count:

  1. **sindresorhus/awesome** - 402,292 stars
  2. **996icu/996.ICU** - 388,413 stars  
  3. **kamranahmedse/developer-roadmap** - 349,097 stars
  4. **donnemartin/system-design-primer** - 316,524 stars
  5. **jwasham/coding-interview-university** - 313,767 stars
  6. **public-apis/public-apis** - 307,227 stars
  7. **EbookFoundation/free-programming-books** - 298,890 stars
  8. **facebook/react** - 286,034 stars
  9. **vinta/awesome-python** - 269,320 stars
  10. **freeCodeCamp/freeCodeCamp** - 261,824 stars

  The `sindresorhus/awesome` repository is a curated list of awesome lists, which explains its popularity as it serves as a comprehensive directory of resources across many different topics in software development.
  ```
</VerticalStepper>