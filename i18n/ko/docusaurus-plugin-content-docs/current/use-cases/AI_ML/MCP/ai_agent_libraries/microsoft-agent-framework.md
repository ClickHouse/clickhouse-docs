---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/microsoft-agent-framework'
'sidebar_label': 'Microsoft Agent Framework 통합하기'
'title': 'Microsoft Agent Framework와 ClickHouse MCP 서버로 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'Microsoft Agent Framework와 ClickHouse MCP 서버를 사용하여 AI 에이전트를 구축하는 방법을
  배워보세요.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Microsoft'
'show_related_blogs': true
'doc_type': 'guide'
---


# Microsoft Agent Framework 및 ClickHouse MCP 서버로 AI 에이전트 구축하기

이 안내서에서는 [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) AI 에이전트를 구축하여 [ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)와 [ClickHouse의 MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)와 상호작용하는 방법을 배웁니다.

:::note 예제 노트북
이 예제는 [예제 레포지토리](https://github.com/ClickHouse/examples/blob/main/ai/mcp/microsoft-agent-framework/microsoft-agent-framework.ipynb)에서 노트북으로 찾을 수 있습니다.
:::

## 필수 조건 {#prerequisites}
- 시스템에 Python이 설치되어 있어야 합니다.
- 시스템에 `pip`가 설치되어 있어야 합니다.
- OpenAI API 키가 필요합니다.

다음 단계는 Python REPL 또는 스크립트를 통해 실행할 수 있습니다.

<VerticalStepper headerLevel="h2">

## 라이브러리 설치 {#install-libraries}

다음 명령어를 실행하여 Microsoft Agent Framework 라이브러리를 설치합니다:

```python
pip install -q --upgrade pip
pip install -q agent-framework --pre
pip install -q ipywidgets
```

## 자격 증명 설정 {#setup-credentials}

다음으로 OpenAI API 키를 제공해야 합니다:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

다음으로 ClickHouse SQL 플레이그라운드에 연결하는 데 필요한 자격 증명을 정의합니다:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCP 서버 및 Microsoft Agent Framework 에이전트 초기화 {#initialize-mcp-and-agent}

이제 ClickHouse MCP 서버를 ClickHouse SQL 플레이그라운드를 가리키도록 구성하고, 우리의 에이전트를 초기화하고 질문을 합니다:

```python
from agent_framework import ChatAgent, MCPStdioTool
from agent_framework.openai import OpenAIResponsesClient
```

```python
clickhouse_mcp_server = MCPStdioTool(
    name="clickhouse",
    command="uv",
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ],
    env=env
)


async with ChatAgent(
    chat_client=OpenAIResponsesClient(model_id="gpt-5-mini-2025-08-07"),
    name="HousePricesAgent",
    instructions="You are a helpful assistant that can help query a ClickHouse database",
    tools=clickhouse_mcp_server,
) as agent:
    query = "Tell me about UK property prices over the last five years"
    print(f"User: {query}")
    async for chunk in agent.run_stream(query):
        print(chunk.text, end="", flush=True)
    print("\n\n")
```

이 스크립트를 실행한 결과는 아래와 같습니다:

```response title="Response"
User: Tell me about UK property prices over the last five years
I looked at monthly UK sold-price records in the uk.uk_price_paid_simple_partitioned table for the last five years (toStartOfMonth(date), from Oct 2020 → Aug 2025). Summary and key points:

What I measured
- Metrics: monthly median price, mean price, and transaction count (price paid records).
- Period covered: months starting 2020-10-01 through 2025-08-01 (last five years from today).

High-level findings
- Median price rose from £255,000 (2020-10) to £294,500 (2025-08) — an increase of about +15.4% over five years.
  - Equivalent compound annual growth rate (CAGR) for the median ≈ +2.9% per year.
- Mean price fell slightly from about £376,538 (2020-10) to £364,653 (2025-08) — a decline of ≈ −3.2% over five years.
  - Mean-price CAGR ≈ −0.6% per year.
- The divergence (median up, mean slightly down) suggests changes in the mix of transactions (fewer very-high-value sales or other compositional effects), since the mean is sensitive to outliers while the median is not.

Notable patterns and events in the data
- Strong rises in 2020–2021 (visible in both median and mean), consistent with the post‑pandemic / stamp‑duty / demand-driven market surge seen in that period.
- Peaks in mean prices around mid‑2022 (mean values ~£440k), then a general softening through 2022–2023 and stabilisation around 2023–2024.
- Some months show large volatility or unusual counts (e.g., June 2021 and June 2021 had very high transaction counts; March 2025 shows a high median but April–May 2025 show lower counts). Recent months (mid‑2025) have much lower transaction counts in the table — this often indicates incomplete reporting for the most recent months and means recent monthly figures should be treated cautiously.

Example datapoints (from the query)
- 2020-10: median £255,000, mean £376,538, transactions 89,125
- 2022-08: mean peak ~£441,209 (median ~£295,000)
- 2025-03: median ~£314,750 (one of the highest medians)
- 2025-08: median £294,500, mean £364,653, transactions 18,815 (low count — likely incomplete)

Caveats
- These are transaction prices (Price Paid dataset) — actual house “values” may differ.
- Mean is sensitive to composition and outliers. Changes in the types of properties sold (e.g., mix of flats vs detached houses, regional mix) will affect mean and median differently.
- Recent months can be incomplete; months with unusually low transaction counts should be treated with caution.
- This is a national aggregate — regional differences can be substantial.

If you want I can:
- Produce a chart of median and mean over time.
- Compare year-on-year or compute CAGR for a different start/end month.
- Break the analysis down by region/county/town, property type (flat, terraced, semi, detached), or by price bands.
- Show a table of top/bottom regions for price growth over the last 5 years.

Which follow-up would you like?

```

</VerticalStepper>
