---
slug: /use-cases/AI/MCP/ai-agent-libraries/agno
sidebar_label: 'Agno 통합'
title: 'Agno와 ClickHouse MCP Server로 AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'Agno와 ClickHouse MCP Server로 AI 에이전트를 구축하는 방법을 알아봅니다'
keywords: ['ClickHouse', 'MCP', 'Agno']
show_related_blogs: true
doc_type: 'guide'
---



# Agno와 ClickHouse MCP Server로 AI 에이전트를 구축하는 방법 \{#how-to-build-an-ai-agent-with-agno-and-the-clickhouse-mcp-server\}

이 가이드에서는 [ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호 작용할 수 있는 [Agno](https://github.com/agno-agi/agno) AI 에이전트를 [ClickHouse의 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여 구축하는 방법을 학습합니다.

:::note 예제 노트북
이 예제는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb)에 있는 노트북으로도 제공됩니다.
:::



## 사전 요구 사항 \{#prerequisites\}

- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`이 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

다음 단계는 Python REPL에서 실행하거나 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">


## 라이브러리 설치 \{#install-libraries\}

다음 명령어를 실행하여 Agno 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```


## 자격 증명 설정 \{#setup-credentials\}

다음으로 Anthropic API 키를 입력해야 합니다:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 다른 LLM provider 사용하기
Anthropic API 키가 없고 다른 LLM provider를 사용하려는 경우,
[Agno docs](https://docs.agno.com/concepts/models/introduction)에서 자격 증명 설정 방법을 확인할 수 있습니다.
:::

다음으로 ClickHouse SQL playground에 연결하는 데 필요한 자격 증명을 정의하십시오.

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCP 서버 및 Agno 에이전트 초기화 \{#initialize-mcp-and-agent\}

이제 ClickHouse MCP 서버가 ClickHouse SQL 플레이그라운드를 가리키도록 구성하고
Agno 에이전트를 초기화한 후 질문합니다:

```python
from agno.agent import Agent
from agno.tools.mcp import MCPTools
from agno.models.anthropic import Claude
```

```python
async with MCPTools(command="uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse", env=env, timeout_seconds=60) as mcp_tools:
    agent = Agent(
        model=Claude(id="claude-3-5-sonnet-20240620"),
        markdown=True,
        tools = [mcp_tools]
    )
await agent.aprint_response("What's the most starred project in 2025?", stream=True)
```

```response title="응답"
▰▱▱▱▱▱▱ Thinking...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트는 무엇입니까?                                                                        ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Tool Calls ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ • list_tables(database=github, like=%)                                                                          ┃
┃ • run_select_query(query=SELECT                                                                                 ┃
┃     repo_name,                                                                                                  ┃
┃     SUM(count) AS stars_2025                                                                                    ┃
┃ FROM github.repo_events_per_day                                                                                 ┃
┃ WHERE event_type = 'WatchEvent'                                                                                 ┃
┃     AND created_at >= '2025-01-01'                                                                              ┃
┃     AND created_at < '2026-01-01'                                                                               ┃
┃ GROUP BY repo_name                                                                                              ┃
┃ ORDER BY stars_2025 DESC                                                                                        ┃
┃ LIMIT 1)                                                                                                        ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ Response (34.9s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트에 대한 질문에 답변하려면 ClickHouse 데이터베이스를 쿼리해야 합니다.     ┃
┃ 하지만 그 전에 몇 가지 정보를 수집하고 올바른 데이터를 확인해야 합니다. ┃
┃ 먼저 사용 가능한 데이터베이스와 테이블을 확인하겠습니다. 데이터베이스 목록을 제공해 주셔서 감사합니다.  ┃
┃ "github" 데이터베이스가 있으며, 이는 찾고 있는 정보를 포함할 가능성이 높습니다. 이 데이터베이스의 ┃
┃ 테이블을 확인하겠습니다. 이제 github 데이터베이스의 테이블에 대한 정보를 확보했으므로  ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트에 대한 질문에 답변하기 위해 관련 데이터를 쿼리할 수 있습니다. repo_events_per_day ┃
┃ 테이블을 사용하겠습니다. 이 테이블에는 스타 이벤트(WatchEvents)를 포함한 각 리포지토리의 일일 이벤트 수가 포함되어 있습니다.              ┃
┃                                                                                                                 ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트를 찾기 위한 쿼리를 작성하겠습니다. 쿼리 결과를 바탕으로     ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트에 대한 질문에 답변할 수 있습니다:                                                                ┃
┃                                                                                                                 ┃
┃ 2025년에 가장 많은 스타를 받은 프로젝트는 deepseek-ai/DeepSeek-R1이며, 해당 연도에 84,962개의 스타를 받았습니다.     ┃
┃                                                                                                                 ┃
┃ 이 프로젝트인 DeepSeek-R1은 DeepSeek AI 조직의 AI 관련 리포지토리로 보입니다. 2025년에  ┃
┃ GitHub 커뮤니티에서 상당한 관심과 인기를 얻었으며, 해당 연도에 모든 프로젝트 중 가장 많은 스타를 획득했습니다.    ┃
┃                                                                                                                 ┃
┃ 이 데이터는 데이터베이스에 기록된 GitHub 이벤트를 기반으로 하며, 2025년 동안 특별히 누적된  ┃
┃ 스타(WatchEvents)를 나타낸다는 점에 유의하시기 바랍니다. 전체 수명 주기를 고려하면 이 프로젝트의 총 스타 수는   ┃
┃ 더 높을 수 있습니다.                                                                                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
