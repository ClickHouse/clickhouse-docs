---
slug: /use-cases/AI/MCP/ai-agent-libraries/llamaindex
sidebar_label: 'LlamaIndex 연동'
title: 'ClickHouse MCP Server를 사용하여 LlamaIndex AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server와 상호작용할 수 있는 LlamaIndex AI 에이전트를 구축하는 방법을 설명합니다.'
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

- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`이 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

다음 단계는 Python REPL 또는 스크립트를 통해 실행하실 수 있습니다.

<VerticalStepper headerLevel="h2">


## 라이브러리 설치 \{#install-libraries\}

다음 명령어를 실행하여 필요한 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q llama-index clickhouse-connect llama-index-llms-anthropic llama-index-tools-mcp
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

:::note 다른 LLM 제공업체 사용하기
Anthropic API 키가 없어서 다른 LLM 제공업체를 사용하려는 경우 [LlamaIndex 「LLMs」 문서](https://docs.llamaindex.ai/en/stable/examples/)를 참조하여 자격 증명 설정 방법을 확인할 수 있습니다.
:::


## MCP Server 초기화 \{#initialize-mcp-and-agent\}

이제 ClickHouse MCP Server가 ClickHouse SQL playground를 대상으로 하도록 구성합니다.
이들 Python 함수를 Llama Index 도구로 변환해야 합니다.

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
```


tools = await mcp&#95;tool&#95;spec.to&#95;tool&#95;list&#95;async()

````
## Create an agent {#create-agent}

You're now ready to create an agent that has access to those tools. Set the maximum
number of tool calls in one run to 10. You can modify this parameter if you want:

```python
from llama_index.core.agent import AgentRunner, FunctionCallingAgentWorker

agent_worker = FunctionCallingAgentWorker.from_tools(
    tools=tools,
    llm=llm, verbose=True, max_function_calls=10
)
agent = AgentRunner(agent_worker)
````


## LLM 초기화 \{#create-agent\}

다음 코드를 사용하여 Claude Sonnet 4.0 모델을 초기화합니다.

```python
from llama_index.llms.anthropic import Anthropic
llm = Anthropic(model="claude-sonnet-4-0")
```


## 에이전트 실행 \{#run-agent\}

마지막으로 에이전트에 질문할 수 있습니다:

```python
response = agent.query("가장 인기 있는 리포지토리는 무엇인가요?")
```

응답이 길기 때문에 아래 예시 응답에서는 일부가 생략되었습니다:

```response title="응답"
메모리에 사용자 메시지가 추가되었습니다: 가장 인기 있는 리포지토리는 무엇인가요?
=== LLM 응답 ===
가장 인기 있는 리포지토리를 찾도록 도와드리겠습니다. 먼저 데이터 구조를 파악하기 위해 사용 가능한 데이터베이스와 테이블을 탐색하겠습니다.
=== 함수 호출 ===
함수 호출: list_databases, 인자: {}
=== 함수 출력 ===
meta=None content=[TextContent(type='text', text='amazon\nbluesky\ncountry\ncovid\ndefault\ndns\nenvironmental\nfood\nforex\ngeo\ngit\ngithub\nhackernews\nimdb\nlogs\nmetrica\nmgbench\nmta\nnoaa\nnyc_taxi\nnypd\nontime\nopensky\notel\notel_v2\npypi\nrandom\nreddit\nrubygems\nstackoverflow\nstar_schema\nstock\nsystem\ntw_weather\ntwitter\nuk\nwiki\nwords\nyoutube', annotations=None)] isError=False
=== LLM 응답 ===
리포지토리 데이터가 포함되어 있을 것으로 보이는 `github` 데이터베이스가 있습니다. 해당 데이터베이스의 테이블을 탐색하겠습니다.
=== 함수 호출 ===
함수 호출: list_tables, 인자: {"database": "github"}
=== 함수 출력 ===
...
...
...
=== LLM 응답 ===
GitHub 데이터를 기반으로 **가장 인기 있는 리포지토리는 `sindresorhus/awesome`**이며 **402,292개의 스타**를 받았습니다.

스타 수 기준 상위 10개 인기 리포지토리는 다음과 같습니다:

1. **sindresorhus/awesome** - 402,292개 스타
2. **996icu/996.ICU** - 388,413개 스타
3. **kamranahmedse/developer-roadmap** - 349,097개 스타
4. **donnemartin/system-design-primer** - 316,524개 스타
5. **jwasham/coding-interview-university** - 313,767개 스타
6. **public-apis/public-apis** - 307,227개 스타
7. **EbookFoundation/free-programming-books** - 298,890개 스타
8. **facebook/react** - 286,034개 스타
9. **vinta/awesome-python** - 269,320개 스타
10. **freeCodeCamp/freeCodeCamp** - 261,824개 스타

`sindresorhus/awesome` 리포지토리는 엄선된 목록들의 모음으로, 소프트웨어 개발의 다양한 주제에 걸친 리소스의 포괄적인 디렉토리 역할을 하기 때문에 인기가 높습니다.
```

</VerticalStepper>
