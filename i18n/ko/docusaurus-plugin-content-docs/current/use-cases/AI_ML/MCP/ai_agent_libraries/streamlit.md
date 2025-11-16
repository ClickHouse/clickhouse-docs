---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/streamlit-agent'
'sidebar_label': 'Streamlit 통합'
'title': 'Streamlit과 함께 ClickHouse 기반 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'Streamlit과 ClickHouse MCP 서버를 사용하여 웹 기반 AI 에이전트를 구축하는 방법을 배워보세요.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Streamlit'
- 'Agno'
- 'AI Agent'
'show_related_blogs': true
'doc_type': 'guide'
---


# ClickHouse 지원 AI 에이전트 구축하기 Streamlit로

이 가이드에서는 [Streamlit](https://streamlit.io/)를 사용하여 ClickHouse의 [SQL 플레이그라운드](https://sql.clickhouse.com/)와 [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse) 및 [Agno](https://github.com/agno-agi/agno)를 통해 상호작용할 수 있는 웹 기반 AI 에이전트를 구축하는 방법을 배우게 됩니다. 

:::note 예제 애플리케이션
이 예제는 ClickHouse 데이터를 쿼리하기 위한 채팅 인터페이스를 제공하는 완전한 웹 애플리케이션을 생성합니다.
이 예제의 소스 코드는 [예제 리포지터리](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit)에서 확인할 수 있습니다.
:::

## 전제조건 {#prerequisites}
- 시스템에 Python이 설치되어 있어야 합니다.
  [`uv`](https://docs.astral.sh/uv/getting-started/installation/)도 설치해야 합니다.
- Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

아래 단계를 실행하여 Streamlit 애플리케이션을 생성할 수 있습니다.

<VerticalStepper headerLevel="h2">

## 라이브러리 설치 {#install-libraries}

다음 명령어를 실행하여 필요한 라이브러리를 설치합니다:

```bash
pip install streamlit agno ipywidgets
```

## 유틸리티 파일 생성 {#create-utilities}

두 개의 유틸리티 함수를 포함한 `utils.py` 파일을 생성합니다. 첫 번째는 Agno 에이전트에서 스트림 응답을 처리하기 위한 비동기 함수 생성기입니다. 두 번째는 Streamlit 애플리케이션에 스타일을 적용하는 함수입니다:

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

## 자격 증명 설정 {#setup-credentials}

Anthropic API 키를 환경 변수로 설정합니다:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

:::note 다른 LLM 제공자 사용하기
Anthropic API 키가 없고 다른 LLM 제공자를 사용하려는 경우,
[Agno "통합" 문서](https://docs.agentops.ai/v2/integrations/ag2)에서 자격 증명 설정 방법을 확인할 수 있습니다.
:::

## 필요한 라이브러리 가져오기 {#import-libraries}

주요 Streamlit 애플리케이션 파일(e.g., `app.py`)을 생성하고 가져오기를 추가합니다:

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

## 에이전트 스트리밍 함수 정의 {#define-agent-function}

[ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)에 연결하고 응답을 스트리밍하는 주요 에이전트 함수를 추가합니다:

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

## 동기 래퍼 함수 추가 {#add-wrapper-functions}

Streamlit에서 비동기 스트리밍을 처리하기 위한 헬퍼 함수를 추가합니다:

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

## Streamlit 인터페이스 생성 {#create-interface}

Streamlit UI 구성 요소와 채팅 기능을 추가합니다:

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

## 애플리케이션 실행 {#run-application}

ClickHouse AI 에이전트 웹 애플리케이션을 시작하려면 터미널에서 다음 명령어를 실행할 수 있습니다:

```bash
uv run \
  --with streamlit \
  --with agno \
  --with anthropic \
  --with mcp \
  streamlit run app.py --server.headless true
```

이 명령은 웹 브라우저를 열고 `http://localhost:8501`로 이동하여 AI 에이전트와 상호작용하고 ClickHouse의 SQL 플레이그라운드에서 사용할 수 있는 예제 데이터셋에 대한 질문을 할 수 있습니다.

</VerticalStepper>
