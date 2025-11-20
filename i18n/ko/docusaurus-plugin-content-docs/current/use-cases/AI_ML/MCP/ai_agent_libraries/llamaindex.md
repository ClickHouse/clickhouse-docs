---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/llamaindex'
'sidebar_label': 'LlamaIndex 통합'
'title': 'ClickHouse MCP 서버를 사용하여 LlamaIndex AI 에이전트 구축 방법.'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse MCP 서버와 상호 작용할 수 있는 LlamaIndex AI 에이전트를 구축하는 방법을 배웁니다.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'LlamaIndex'
'show_related_blogs': true
'doc_type': 'guide'
---


# ClickHouse MCP 서버를 사용하여 LlamaIndex AI 에이전트 구축하는 방법

이 가이드에서는 [ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호작용할 수 있는 [LlamaIndex](https://docs.llamaindex.ai) AI 에이전트를 구축하는 방법을 배웁니다. 이 과정에서 [ClickHouse의 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용합니다.

:::note 예제 노트북
이 예제는 [예제 리포지토리](https://github.com/ClickHouse/examples/blob/main/ai/mcp/llamaindex/llamaindex.ipynb)에서 노트북으로 확인할 수 있습니다.
:::

## 사전 요구사항 {#prerequisites}
- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`가 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공업체의 API 키가 필요합니다.

아래 단계는 Python REPL 또는 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">

## 라이브러리 설치 {#install-libraries}

다음 명령어를 실행하여 필요한 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
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

:::note 다른 LLM 제공업체 사용
Anthropic API 키가 없고 다른 LLM 제공업체를 사용하고 싶다면,
자격 증명을 설정하는 방법은 [LlamaIndex "LLMs" 문서](https://docs.llamaindex.ai/en/stable/examples/)에서 확인할 수 있습니다.
:::

## MCP 서버 초기화 {#initialize-mcp-and-agent}

이제 ClickHouse MCP 서버를 ClickHouse SQL playground를 가리키도록 구성합니다.
Python 함수를 Llama Index 도구로 변환해야 합니다:

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
## 에이전트 생성 {#create-agent}

이제 도구에 접근할 수 있는 에이전트를 생성할 준비가 되었습니다. 한 번의 실행에서 도구 호출의 최대 수를 10으로 설정합니다. 원할 경우 이 매개 변수를 수정할 수 있습니다:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
```

## LLM 초기화 {#initialize-llm}

다음 코드를 사용하여 Claude Sonnet 4.0 모델을 초기화합니다:

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```

## 에이전트 실행 {#run-agent}

마지막으로, 에이전트에게 질문을 할 수 있습니다:

```python
response = agent.query("What's the most popular repository?")
```

응답은 길어질 수 있으므로 예제 응답 아래에서 줄이게 됩니다:

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
