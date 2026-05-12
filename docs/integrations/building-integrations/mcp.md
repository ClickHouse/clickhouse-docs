---
sidebar_label: 'MCP integration guide'
sidebar_position: 4
keywords: ['clickhouse', 'MCP', 'model context protocol', 'AI', 'agent', 'LLM', 'connector', 'integration']
description: 'Best practices for integrating ClickHouse with AI agents and LLM-powered tools using the Model Context Protocol'
slug: /integrations/building-integrations/mcp
title: 'MCP integration guide'
doc_type: 'guide'
---

# MCP integration guide

Model Context Protocol (MCP) is an open standard that lets AI agents and LLM-powered tools discover and invoke capabilities exposed by a server. For ClickHouse integrations, MCP is the right surface when your integration is **AI-native** — meaning an agent or LLM is driving the queries — rather than a traditional BI tool, ETL pipeline, or application making programmatic requests.

| Integration type | Recommended surface |
|---|---|
| BI tool / query builder | JDBC or HTTP API |
| ETL / data pipeline | HTTP API or JDBC |
| AI agent / LLM assistant | Remote MCP server |
| IDE coding assistant | Local MCP server (stdio) or remote MCP |
| Data catalog with AI features | Remote MCP server alongside existing HTTP/JDBC |

## Connecting to ClickHouse via MCP {#connecting}

### ClickHouse Cloud built-in remote MCP server {#mcp-cloud}

ClickHouse Cloud includes a fully managed remote MCP server. It requires no infrastructure to deploy and authenticates via OAuth 2.0.

**Endpoint:**

```text
https://mcp.clickhouse.cloud/mcp
```

**Transport:** Streamable HTTP (MCP standard)

**Authentication:** OAuth 2.0 — the MCP client initiates a browser-based OAuth flow using ClickHouse Cloud credentials on first connect.

**Capabilities:** 13 read-only tools across querying, schema discovery, service management, backups, ClickPipes, and billing. All tools are annotated with `readOnlyHint: true`.

Enable it per service in the ClickHouse Cloud console under **Connect → MCP**. Once enabled, point any MCP client at the endpoint above. See the [remote MCP setup guide](/use-cases/AI/MCP/remote_mcp) for IDE-specific configuration steps.

If your integration targets ClickHouse Cloud users, this is the fastest path to MCP connectivity — recommend it over building your own server.

### Open-source MCP server for self-hosted ClickHouse {#mcp-oss}

For integrations that must support self-hosted ClickHouse instances, use the [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse) open-source server as a starting point. It exposes three core tools (`run_query`, `list_databases`, `list_tables`) and supports both local stdio and remote HTTP/SSE transports.

## Building a custom MCP server {#mcp-build}

Build a custom MCP server when you need tools or behavior that neither the Cloud server nor the open-source server provides — for example, domain-specific query templates, write operations under controlled conditions, or integration with your own auth system.

### Choose the right transport {#mcp-transport}

| Transport | Use when |
|---|---|
| **stdio** | Local dev tools (Claude Code, Cursor, VS Code Copilot). No network exposure. |
| **Streamable HTTP** | Cloud-deployed servers, multi-tenant services, load-balanced deployments. The MCP standard transport for remote servers. |
| **SSE** (legacy) | Legacy MCP clients that predate Streamable HTTP. Prefer Streamable HTTP for new servers. |

For remote servers, Streamable HTTP is the current standard. Design stateless request handlers — do not store session state in memory, as load balancers will distribute requests across instances.

### Authentication {#mcp-auth}

| Scenario | Recommended approach |
|---|---|
| User-facing (human authenticates) | OAuth 2.0 with PKCE — consistent with ClickHouse Cloud's own approach |
| Service-to-service (agent authenticates) | Static Bearer token via `Authorization` header; rotate regularly |
| Development / local-only | Disable auth; never in production |

Always require authentication for any remotely accessible MCP server. The `/health` endpoint is the only route that should remain unauthenticated (for orchestrator probes).

## Consumption best practices {#consumption}

The following practices apply to any MCP server that exposes ClickHouse query capabilities to an AI agent.

### Design read-only tools by default {#mcp-readonly}

Annotate every tool with `readOnlyHint: true` in its MCP metadata unless writes are explicitly part of your design. This signals to MCP hosts that the tool has no side effects, enabling better agent planning.

**`readOnlyHint` is advisory only** — it informs the LLM host but is not enforced at the protocol level. Apply server-side enforcement as well:

- Connect to ClickHouse with a **read-only user** (no INSERT, ALTER, DROP grants)
- Validate that query strings begin with `SELECT` or `WITH` before execution
- Use ClickHouse's `readonly` session setting as a secondary guard:

```sql
SET readonly = 1;
SELECT ...
```

If your server must support writes (e.g., agent-driven INSERT), expose write tools under a separate, explicitly named operation, require an additional confirmation parameter, and log every invocation.

### Apply resource limits to all queries {#mcp-limits}

Agents can generate unbounded queries. Always enforce limits to prevent runaway execution. The most reliable approach is to set them on the ClickHouse user — they apply regardless of what the agent sends:

```sql
ALTER USER mcp_user SETTINGS
    max_execution_time = 30,
    max_result_rows = 10000,
    max_bytes_to_read = 1073741824;
```

Or enforce per-query via HTTP parameters:

```bash
curl --user "mcp_user:password" \
     "https://host:8443/?max_execution_time=30&max_result_rows=10000" \
     --data "SELECT ..."
```

10,000 rows is a practical ceiling for agent-readable results — LLMs cannot meaningfully process millions of rows and large results inflate token usage. Design tool descriptions to guide agents toward aggregating queries rather than full table scans.

### Expose focused schema discovery tools {#mcp-schema-tools}

Agents need to understand the data model before they can write useful queries. Provide dedicated tools for schema discovery rather than expecting agents to write raw `system.*` queries. Good tool design:

- A `list_tables` tool that returns table name, engine, row count estimate, and a brief description from `system.tables.comment`
- A `describe_table` tool that returns column names, types (with Nullable/LowCardinality wrappers stripped), and `is_in_sorting_key` to help the agent write efficient filtered queries
- Exclude `system`, `information_schema`, and `INFORMATION_SCHEMA` databases from all schema tools

```python
Tool(
    name="describe_table",
    description=(
        "Return the columns of a ClickHouse table with their types and whether "
        "each column is part of the sorting key. Use this before writing a query "
        "to understand the available fields and which columns are efficient to filter on."
    ),
    annotations={"readOnlyHint": True}
)
```

### Write tool descriptions that constrain agent behavior {#mcp-descriptions}

Tool descriptions are read by the LLM to decide how and when to invoke a tool. Vague descriptions lead to over-use and inefficient queries. Be specific about what the tool does, what good input looks like, and what its limits are:

```python
# Too vague — agent will generate full table scans
Tool(
    name="run_query",
    description="Run a SQL query."
)

# Better — agent understands constraints and ClickHouse SQL idioms
Tool(
    name="run_select_query",
    description=(
        "Execute a read-only SELECT query against ClickHouse. "
        "Use aggregation functions (count(), sum(), avg()) rather than returning raw rows when possible. "
        "Results are limited to 10,000 rows. "
        "Always include a WHERE clause or LIMIT to avoid full table scans. "
        "Use toDate() and toDateTime() for date literals, not quoted strings. "
        "Use count() not COUNT(*) — ClickHouse function names are lowercase."
    ),
    annotations={"readOnlyHint": True}
)
```

Include ClickHouse SQL specifics in descriptions: function name casing (`count()` not `COUNT(*)`), date literal functions (`toDate()`, `toDateTime()`), and the fact that identifiers are case-sensitive.

### Size results for LLM context {#mcp-result-size}

LLM context windows are finite and token usage scales with result size. Design tools to return summaries, not raw data dumps:

- Return aggregates when the agent's question can be answered with counts, sums, or averages
- Cap raw row results at 100–500 rows for display tools; use the 10,000 row limit only for data export tools
- Include row count metadata alongside results so the agent knows when results were truncated
- For schema tools, return column descriptions not full table DDL

### Guard against prompt injection {#mcp-injection}

Query results returned by your MCP server flow back into the LLM's context. If a ClickHouse table contains user-generated text, that text could carry adversarial instructions targeting the agent.

Mitigations:
- **Limit result size** — small result sets reduce the attack surface
- **Return structured data** — parse `JSONEachRow` server-side before passing to the agent; avoid returning raw string columns that could contain markdown or instruction-like text directly into the agent's context
- **Sanitize schema names** — when returning database, table, or column names, strip or escape characters that could be interpreted as markdown formatting or instructions

### Identify your MCP server in query logs {#mcp-observability}

Set `User-Agent` and `log_comment` on all queries issued by your MCP server, exactly as you would for any integration. This makes it possible to distinguish agent-driven queries from human queries in `system.query_log` and attribute cost and performance to specific tools:

```python
params = {
    "log_comment": f"mcp:{tool_name}/session:{session_id}",
    "query_id": request_id,
    "max_execution_time": "30",
    "max_result_rows": "10000",
}
headers = {
    "User-Agent": "MyMCPServer/1.0 (ClickHouse MCP)",
    "X-ClickHouse-Query-Id": request_id,
}
```

Query performance by tool:

```sql
SELECT
    extract(log_comment, 'mcp:([^/]+)') AS tool_name,
    count() AS calls,
    avg(query_duration_ms) AS avg_ms,
    sum(read_rows) AS total_rows_read,
    countIf(exception != '') AS errors
FROM system.query_log
WHERE http_user_agent LIKE 'MyMCPServer%'
  AND event_time > now() - INTERVAL 1 DAY
  AND type = 'QueryFinish'
GROUP BY tool_name
ORDER BY calls DESC;
```

## MCP checklist {#mcp-checklist}

- [ ] Using ClickHouse Cloud? Enable the built-in MCP server rather than building your own
- [ ] Remote server uses Streamable HTTP transport with stateless request handlers
- [ ] All tools annotated with `readOnlyHint: true` unless writes are explicitly required
- [ ] Server-side enforcement: read-only ClickHouse user + `SELECT`/`WITH` SQL prefix validation
- [ ] `max_execution_time`, `max_result_rows`, and `max_bytes_to_read` set on the ClickHouse user
- [ ] Dedicated schema discovery tools (`list_tables`, `describe_table`) that return sorting key info
- [ ] Tool descriptions specify aggregation preference, result limits, and ClickHouse SQL idioms
- [ ] Result size designed for LLM context: summaries and aggregates over raw row dumps
- [ ] `query_id` and `log_comment` set on every MCP-issued query
- [ ] Prompt injection mitigations: structured data, result size limits, sanitized schema names
