---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: 'PydanticAI 연동'
title: 'ClickHouse MCP Server를 사용하여 PydanticAI 에이전트를 구현하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server와 상호 작용할 수 있는 PydanticAI 에이전트를 구현하는 방법을 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server를 사용하여 PydanticAI 에이전트를 구축하는 방법 \{#how-to-build-a-pydanticai-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [ClickHouse의 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여
[ClickHouse의 SQL playground](https://sql.clickhouse.com/)와 상호작용할 수 있는 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) 에이전트를 구축하는 방법을 설명합니다.

:::note 예제 노트북
이 예제는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb)에 노트북으로 제공됩니다.
:::



## 사전 요구 사항 \{#prerequisites\}

- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`이 설치되어 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공업체의 API 키가 필요합니다.

다음 단계는 Python REPL에서 실행하거나 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">


## 라이브러리 설치 \{#install-libraries\}

다음 명령을 실행하여 필수 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # replace with the appropriate package if using a different LLM provider
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

:::note 다른 LLM 공급자 사용하기
Anthropic API 키가 없어서 다른 LLM 공급자를 사용하려는 경우,
[PydanticAI 문서](https://ai.pydantic.dev/models/)에서 자격 증명 설정 방법을 확인할 수 있습니다.
:::

다음으로, ClickHouse SQL playground에 연결하는 데 필요한 자격 증명을 정의합니다:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCP Server와 PydanticAI 에이전트 초기화 \{#initialize-mcp\}

이제 ClickHouse MCP Server가 ClickHouse SQL playground를 사용하도록 설정합니다:

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.messages import ToolCallPart, ToolReturnPart

server = MCPServerStdio(
    'uv',
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
agent = Agent('anthropic:claude-sonnet-4-0', mcp_servers=[server])
```


## 에이전트에 질문하기 \{#ask-agent\}

마지막으로 에이전트에 질문할 수 있습니다:

```python
async with agent.run_mcp_servers():
    result = await agent.run("Who's done the most PRs for ClickHouse?")
    print(result.output)
```

You'll get back a similar response as below:

```response title="Response"
Based on the data from the ClickHouse GitHub repository, here are the top contributors by number of pull requests created:

**Top contributors to ClickHouse by PRs opened:**

1. **alexey-milovidov** - 3,370 PRs opened
2. **azat** - 1,905 PRs opened
3. **rschu1ze** - 979 PRs opened
4. **alesapin** - 947 PRs opened
5. **tavplubix** - 896 PRs opened
6. **kssenii** - 871 PRs opened
7. **Avogar** - 805 PRs opened
8. **KochetovNicolai** - 700 PRs opened
9. **Algunenano** - 658 PRs opened
10. **kitaisreal** - 630 PRs opened

**Alexey Milovidov** stands out as by far the most active contributor with over 3,370 pull requests opened, which is significantly more than any other contributor. This makes sense as Alexey Milovidov is one of the founders and lead developers of ClickHouse.

The data also shows that alexey-milovidov has been very active in managing PRs, with 12,818 "closed" events (likely reviewing and closing PRs from other contributors) in addition to creating his own PRs.

It's worth noting that I filtered out various robot/bot accounts that handle automated processes, focusing on human contributors to give you the most meaningful answer about who has contributed the most PRs to ClickHouse.
```

</VerticalStepper>
