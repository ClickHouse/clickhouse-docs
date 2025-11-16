---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/agno'
'sidebar_label': 'Agno 통합하기'
'title': 'Agno와 ClickHouse MCP 서버로 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'Agno와 ClickHouse MCP 서버로 AI 에이전트를 구축하는 방법을 배우십시오.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Agno'
'show_related_blogs': true
'doc_type': 'guide'
---


# Agno와 ClickHouse MCP 서버로 AI 에이전트 구축하기

이 가이드에서는 [Agno](https://github.com/agno-agi/agno) AI 에이전트를 구축하는 방법을 배울 수 있으며, 이 에이전트는 [ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)와 상호작용할 수 있습니다. 이를 위해 [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)를 사용합니다.

:::note 예제 노트북
이 예제는 [예제 리포지토리](https://github.com/ClickHouse/examples/blob/main/ai/mcp/agno/agno.ipynb)에서 노트북으로 찾아볼 수 있습니다.
:::

## 전제 조건 {#prerequisites}
- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`가 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

다음 단계는 Python REPL 또는 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">

## 라이브러리 설치 {#install-libraries}

다음 명령을 실행하여 Agno 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q agno
pip install -q ipywidgets
```

## 자격 증명 설정 {#setup-credentials}

다음으로, Anthropic API 키를 제공해야 합니다:

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 다른 LLM 제공자 사용하기
Anthropic API 키가 없고 다른 LLM 제공자를 사용하려면,
자격 증명 설정 방법에 대한 안내를 [Agno 문서](https://docs.agno.com/concepts/models/introduction)에서 찾을 수 있습니다.
:::

다음으로, ClickHouse SQL 플레이그라운드와 연결하기 위해 필요한 자격 증명을 정의합니다:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCP 서버 및 Agno 에이전트 초기화 {#initialize-mcp-and-agent}

이제 ClickHouse MCP 서버를 ClickHouse SQL 플레이그라운드를 가리키도록 구성하고 Agno 에이전트를 초기화하여 질문을 해봅니다:

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

```response title="Response"
▰▱▱▱▱▱▱ Thinking...
┏━ Message ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                                                 ┃
┃ What's the most starred project in 2025?                                                                        ┃
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
┃ To answer your question about the most starred project in 2025, I'll need to query the ClickHouse database.     ┃
┃ However, before I can do that, I need to gather some information and make sure we're looking at the right data. ┃
┃ Let me check the available databases and tables first.Thank you for providing the list of databases. I can see  ┃
┃ that there's a "github" database, which is likely to contain the information we're looking for. Let's check the ┃
┃ tables in this database.Now that we have information about the tables in the github database, we can query the  ┃
┃ relevant data to answer your question about the most starred project in 2025. We'll use the repo_events_per_day ┃
┃ table, which contains daily event counts for each repository, including star events (WatchEvents).              ┃
┃                                                                                                                 ┃
┃ Let's create a query to find the most starred project in 2025:Based on the query results, I can answer your     ┃
┃ question about the most starred project in 2025:                                                                ┃
┃                                                                                                                 ┃
┃ The most starred project in 2025 was deepseek-ai/DeepSeek-R1, which received 84,962 stars during that year.     ┃
┃                                                                                                                 ┃
┃ This project, DeepSeek-R1, appears to be an AI-related repository from the DeepSeek AI organization. It gained  ┃
┃ significant attention and popularity among the GitHub community in 2025, earning the highest number of stars    ┃
┃ for any project during that year.                                                                               ┃
┃                                                                                                                 ┃
┃ It's worth noting that this data is based on the GitHub events recorded in the database, and it represents the  ┃
┃ stars (WatchEvents) accumulated specifically during the year 2025. The total number of stars for this project   ┃
┃ might be higher if we consider its entire lifespan.                                                             ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

</VerticalStepper>
