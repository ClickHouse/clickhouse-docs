---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: 'Integrate Upsonic'
title: 'How to build an AI Agent with Upsonic and the ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Learn how build an AI Agent with Upsonic and the ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---

# How to build an AI Agent with Upsonic and the ClickHouse MCP Server

In this guide you'll learn how to build a [Upsonic](https://github.com/Upsonic/Upsonic/tree/master) AI agent that can interact with 
[ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Example notebook
This example can be found as a notebook in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
- You'll need to have `pip` installed on your system.
- You'll need an OpenAI API key

You can run the following steps either from your Python REPL or via script.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the mcp-agent library by running the following commands:

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```

## Setup credentials {#setup-credentials}

Next, you'll need to provide your OpenAI API key:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

Next, define the credentials needed to connect to the ClickHouse SQL playground:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## Initialize MCP Server and Upsonic agent {#initialize-mcp-and-agent}

Now configure the ClickHouse MCP Server to point at the ClickHouse SQL playground 
and also initialize our agent and ask it a question:

```python
from upsonic import Agent, Task
from upsonic.models.openai import OpenAIResponsesModel
```

```python
class DatabaseMCP:
    """
    MCP server for ClickHouse database operations.
    Provides tools for querying tables and databases
    """
    command="uv"
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ]
    env=env


database_agent = Agent(
    name="Data Analyst",
    role="ClickHouse specialist.",
    goal="Query ClickHouse database and tables and answer questions",
    model=OpenAIResponsesModel(model_name="gpt-5-mini-2025-08-07")
)


task = Task(
    description="Tell me what happened in the UK property market in the 2020s. Use ClickHouse.",
    tools=[DatabaseMCP]
)

# Execute the workflow
workflow_result = database_agent.do(task)
print("\nMulti-MCP Workflow Result:")
print(workflow_result)
```

```response title="Response"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
Found 3 tools from DatabaseMCP
  - list_databases: List available ClickHouse databases
  - list_tables: List available ClickHouse tables in a database, including schema, comment,
row count, and column count.
  - run_select_query: Run a SELECT query in a ClickHouse database
✅ MCP tools discovered via thread

...

[10/10/25 11:26:20] INFO     Starting MCP server 'mcp-clickhouse' with transport 'stdio'                                      server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - Processing request of type ListPromptsRequest
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - Processing request of type ListResourcesRequest
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - Using reasoning model 'gpt-5-mini-2025-08-07' with
'medium' reasoning effort
[INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "list_databases",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Listing all databases
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Found 38 databases
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "list_tables",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Listing tables in database 'uk'
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Found 9 tables
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Calling Tool",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Executing SELECT query: SELECT
count(*) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - Query returned 1 rows
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Query returned 8 rows
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Executing SELECT query: SELECT town, count(*) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - Query returned 10 rows
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Query returned 2 rows
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Executing SELECT query: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Query returned 5 rows
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Summary (TL;DR)
- Based on the UK Price Paid tables in ClickHouse, for transactions recorded in 2025 so far there are 376,633 sales with an average price of
£362,283 and a median price of £281,000. The data appears to include only months Jan–Aug 2025 (so 2025 is incomplete). There are extreme
outliers (min £100, max £127,700,000) that skew the mean.

What I computed (how)
I ran aggregations on the uk.price-paid tables in ClickHouse:
- overall 2025 summary (count, mean, median, min, max) from uk.uk_price_paid_simple_partitioned
- monthly breakdown for 2025 (transactions, mean, median)
- top towns in 2025 by average price (towns with >= 50 transactions)
- year comparison: 2024 vs 2025 (count, mean, median)
- breakdown by property type for 2025 (counts, avg, median) using uk.uk_price_paid

Key numbers (from the dataset)
- Overall 2025 (recorded transactions): transactions = 376,633; mean price = £362,282.66; median price = £281,000; min = £100; max =
£127,700,000.
- By month (2025): (month, transactions, mean price, median price)
  - Jan: 53,927, mean £386,053, median £285,000
  - Feb: 58,740, mean £371,803, median £285,000
  - Mar: 95,274, mean £377,200, median £315,000
  - Apr: 24,987, mean £331,692, median £235,000
  - May: 39,013, mean £342,380, median £255,000
  - Jun: 41,446, mean £334,667, median £268,500
  - Jul: 44,431, mean £348,293, median £277,500
  - Aug: 18,815, mean £364,653, median £292,999
  (Only months 1–8 are present in the dataset.)
- Top towns by average price (2025, towns with ≥50 transactions)
  - TRING: 126 txns, avg £1,973,274
  - BUCKHURST HILL: 98 txns, avg £1,441,331
  - ASCOT: 175 txns, avg £1,300,748
  - RADLETT: 69 txns, avg £1,160,217
  - COBHAM: 115 txns, avg £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON are also in the top 10 (all high-average commuter/affluent towns).
- Year comparison (2024 vs 2025 as recorded)
  - 2024: 859,960 transactions, mean £390,879, median £280,000
  - 2025: 376,633 transactions, mean £362,283, median £281,000
  (2025 counts are much lower because the dataset only includes part of the year.)
- By property type (2025)
  - detached: 85,362 txns, avg £495,714, median £415,000
  - semi-detached: 107,580 txns, avg £319,922, median £270,000
  - flat: 62,975 txns, avg £298,529, median £227,000
  - terraced: 112,832 txns, avg £286,616, median £227,000
  - other: 7,884 txns, avg £1,087,765 (median £315,000) — note small-group and outlier effect

Important caveats and data quality notes
- The dataset appears partial for 2025 (only months Jan–Aug present). Any “2025” totals are not full-year figures.
- Large outliers exist (e.g., max £127.7M, and min £100). These likely include data-entry errors or non-standard records and inflate the
mean. Median is often a more robust measure here.
- “other” property-type averages are unstable due to low/heterogeneous counts and outliers.
- I did not filter by is_new, duration, or other metadata; those filters can change results (for example excluding new-builds or
leaseholds).
- The tables are Price Paid-style transaction records (recorded sales) — they do not directly represent asking prices or valuations.

Suggested next steps (I can run these)
- Clean out obvious outliers (e.g., prices < £10k or > £10M) and recompute averages/medians.
- Produce regional / county / postcode-area summaries and maps.
- Compute month-on-month or rolling 3-month median to show trend through 2025.
- Produce year-on-year (YoY) growth rates by month (e.g., Mar 2025 vs Mar 2024).
- Forecast for full 2025 using simple extrapolation or time-series modelling (but better after deciding how to handle missing
months/outliers).

If you want, I can:
- Re-run the same aggregations after removing extreme outliers and show cleaned results.
- Produce YoY monthly growth and charts (I can return CSV or JSON aggregates you can chart).
Which would you like me to do next?
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - Last aggregator closing, shutting down all persistent
connections...
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - Disconnecting all persistent server connections...
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: Requesting shutdown...
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - All persistent server connections signaled to disconnect.
[INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - Connection manager successfully closed and removed from context
[INFO] 2025-10-10T11:27:52 mcp_agent.mcp_basic_agent - MCPApp cleanup
{
  "data": {
    "progress_action": "Finished",
    "target": "mcp_basic_agent",
    "agent_name": "mcp_application_loop"
  }
}
```

</VerticalStepper>
