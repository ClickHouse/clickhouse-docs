---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: 'Claude Agent SDK 통합'
title: 'Claude Agent SDK와 ClickHouse MCP 서버로 AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'Claude Agent SDK와 ClickHouse MCP 서버를 사용하여 AI 에이전트를 구축하는 방법을 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---

# Claude Agent SDK와 ClickHouse MCP 서버로 AI 에이전트를 구축하는 방법 \{#how-to-build-an-ai-agent-with-claude-agent-sdk-and-the-clickhouse-mcp-server\}

이 가이드에서는 [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)를 사용하고 [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)를 통해 [ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)와 상호작용할 수 있는 AI 에이전트를 구축하는 방법을 설명합니다.

:::note 예제 노트북
이 예제는 [예제 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb)에 노트북으로도 제공됩니다.
:::

## 필수 조건 \{#prerequisites\}

* 시스템에 Python이 설치되어 있어야 합니다.
* 시스템에 `pip`가 설치되어 있어야 합니다.
* Anthropic API key가 필요합니다.

다음 단계는 Python REPL 또는 스크립트에서 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">
  ## 라이브러리 설치 \{#install-libraries\}

  다음 명령을 실행하여 Claude Agent SDK 라이브러리를 설치하세요:

  ```python
  pip install -q --upgrade pip
  pip install -q claude-agent-sdk
  pip install -q ipywidgets
  ```

  ## 자격 증명 설정 \{#setup-credentials\}

  다음으로, Anthropic API key를 제공해야 합니다:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  다음으로, ClickHouse SQL 플레이그라운드에 연결하는 데 필요한 자격 증명을 정의합니다:

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## MCP 서버 및 Claude Agent SDK 에이전트 초기화 \{#initialize-mcp-and-agent\}

  이제 ClickHouse MCP 서버가 ClickHouse SQL 플레이그라운드를 가리키도록 구성하고
  에이전트를 초기화한 후 질문하세요:

  ```python
  from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, UserMessage, TextBlock, ToolUseBlock
  ```

  ```python
  options = ClaudeAgentOptions(
      allowed_tools=[
          "mcp__mcp-clickhouse__list_databases",
          "mcp__mcp-clickhouse__list_tables",
          "mcp__mcp-clickhouse__run_select_query",
          "mcp__mcp-clickhouse__run_chdb_select_query"
      ],
      mcp_servers={
          "mcp-clickhouse": {
              "command": "uv",
              "args": [
                  "run",
                  "--with", "mcp-clickhouse",
                  "--python", "3.10",
                  "mcp-clickhouse"
              ],
              "env": env
          }
      }
  )


  async for message in query(prompt="Tell me something interesting about UK property sales", options=options):
      if isinstance(message, AssistantMessage):
          for block in message.content:
              if isinstance(block, TextBlock):
                  print(f"🤖 {block.text}")
              if isinstance(block, ToolUseBlock):
                  print(f"🛠️ {block.name} {block.input}")
      elif isinstance(message, UserMessage):
          for block in message.content:
              if isinstance(block, TextBlock):
                  print(block.text)
  ```

  참고: `for` 블록 내부의 코드는 간결성을 위해 출력을 필터링합니다.

  ```response title="Response"
  🤖 영국 부동산 판매에 대한 흥미로운 정보를 찾기 위해 ClickHouse 데이터베이스를 쿼리하겠습니다.

  먼저 사용 가능한 데이터베이스를 확인하겠습니다:
  🛠️ mcp__mcp-clickhouse__list_databases {}
  🤖 좋습니다! "uk" 데이터베이스가 있습니다. 사용 가능한 테이블을 확인하겠습니다:
  🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
  🤖 완벽합니다! `uk_price_paid` 테이블에는 3천만 건 이상의 부동산 판매 기록이 있습니다. 흥미로운 정보를 찾아보겠습니다:
  🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
  🤖 흥미로운 사실을 발견했습니다: **런던의 베이커 스트리트**(네, 유명한 셜록 홈즈 거리입니다!)는 100건 이상의 판매가 있는 거리 중 가장 큰 가격 범위를 보입니다 - 부동산이 최저 **£2,500**에서 최고 **£594.3 million**에 판매되었으며, 그 차이가 무려 £594 million이 넘습니다!

  베이커 스트리트는 메릴본과 같은 부유한 지역을 지나는 런던에서 가장 명망 있는 주소 중 하나이며, 이 데이터셋에 541건의 판매 기록이 있다는 점을 고려하면 충분히 이해할 수 있습니다.
  ```
</VerticalStepper>