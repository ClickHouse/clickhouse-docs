---
slug: /use-cases/AI/MCP/ai-agent-libraries/openai-agents
sidebar_label: 'OpenAI 통합'
title: 'ClickHouse MCP Server를 사용하여 OpenAI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server와 상호 작용할 수 있는 OpenAI 에이전트를 구축하는 방법을 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'OpenAI']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server를 사용하여 OpenAI 에이전트를 구축하는 방법 \{#how-to-build-an-openai-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [ClickHouse의 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여 [ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호 작용할 수 있는 [OpenAI](https://github.com/openai/openai-agents-python) 에이전트를 구축하는 방법을 설명합니다.

:::note 예제 노트북
이 예제는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb)에 있는 노트북으로도 제공됩니다.
:::



## 사전 요구 사항 \{#prerequisites\}

- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`이 설치되어 있어야 합니다.
- OpenAI API 키가 필요합니다.

다음 단계는 Python REPL에서 실행하거나 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">


## 라이브러리 설치 \{#install-libraries\}

다음 명령을 실행하여 필요한 라이브러리를 설치하십시오:

```python
pip install -q --upgrade pip
pip install -q openai-agents
```


## 자격 증명 설정 \{#setup-credentials\}

다음으로 OpenAI API 키를 입력해야 합니다:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```


## MCP Server와 OpenAI 에이전트 초기화 \{#initialize-mcp-and-agent\}

이제 ClickHouse MCP Server가 ClickHouse SQL playground를 가리키도록 구성한 다음,
OpenAI 에이전트를 초기화하고 질문을 해보십시오:

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


```response title="응답"
실행 중: 2025년 현재까지 가장 큰 GitHub 프로젝트는 무엇인가요?
🔧 도구: list_databases({})
✅ 결과: amazon
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
🔧 도구: list_tables({"database":"github"})
✅ 결과: {
  "database": "github",
  "name": "actors_per_repo",
  "comment": "",
  "columns": [
    {
      "...
🔧 도구: run_select_query({"query":"SELECT repo_name, MAX(stars) FROM github.top_repos_mv"})
✅ 결과: {
  "status": "error",
  "message": "쿼리 실패: HTTPDriver for https://sql-clickhouse.clickhouse....
🔧 도구: run_select_query({"query":"SELECT repo_name, stars FROM github.top_repos ORDER BY stars DESC LIMIT 1"})
✅ 결과: {
  "repo_name": "sindresorhus/awesome",
  "stars": 402893
}...
스타 수 기준으로 2025년 가장 큰 GitHub 프로젝트는 402,893개의 스타를 보유한 "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)"입니다.💬 응답: 스타 수 기준으로 2025년 가장 큰 GitHub 프로젝트는 402,893개의 스타를 보유한 "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)"입니다.
```

</VerticalStepper>
