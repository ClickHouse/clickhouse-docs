---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk'
'sidebar_label': 'Claude Agent SDK 통합'
'title': 'Claude Agent SDK와 ClickHouse MCP 서버로 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'Claude Agent SDK와 ClickHouse MCP 서버로 AI 에이전트를 구축하는 방법을 배워보세요'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Claude'
'show_related_blogs': true
'doc_type': 'guide'
---


# AI 에이전트를 Claude Agent SDK 및 ClickHouse MCP 서버로 구축하는 방법

이 가이드에서는 [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) AI 에이전트를 구축하는 방법을 배웁니다. 이 에이전트는 [ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)와 상호작용할 수 있으며, [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)를 사용합니다.

:::note 예제 노트북
이 예제는 [예제 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb)에서 노트북으로 확인할 수 있습니다.
:::

## 사전 요구 사항 {#prerequisites}
- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`가 설치되어 있어야 합니다.
- Anthropic API 키가 필요합니다.

다음 단계는 Python REPL 또는 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">

## 라이브러리 설치 {#install-libraries}

다음 명령을 실행하여 Claude Agent SDK 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q claude-agent-sdk
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

다음, ClickHouse SQL 플레이그라운드에 연결하는 데 필요한 자격 증명을 정의합니다:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCP 서버 및 Claude Agent SDK 에이전트 초기화 {#initialize-mcp-and-agent}

이제 ClickHouse MCP 서버를 ClickHouse SQL 플레이그라운드를 가리키도록 구성하고, 우리의 에이전트를 초기화하여 질문을 합니다:

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

`for` 블록 내의 코드는 간결성을 위해 출력을 필터링하고 있습니다.

```response title="Response"
🤖 I'll query the ClickHouse database to find something interesting about UK property sales.

Let me first see what databases are available:
🛠️ mcp__mcp-clickhouse__list_databases {}
🤖 Great! There's a "uk" database. Let me see what tables are available:
🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
🤖 Perfect! The `uk_price_paid` table has over 30 million property sales records. Let me find something interesting:
🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
🤖 Here's something fascinating: **Baker Street in London** (yes, the famous Sherlock Holmes street!) has the largest price range of any street with over 100 sales - properties sold for as low as **£2,500** and as high as **£594.3 million**, a staggering difference of over £594 million!

This makes sense given Baker Street is one of London's most prestigious addresses, running through wealthy areas like Marylebone, and has had 541 recorded sales in this dataset.
```

</VerticalStepper>
