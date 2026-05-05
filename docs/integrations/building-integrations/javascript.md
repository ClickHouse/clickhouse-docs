---
sidebar_label: 'JavaScript connector guide'
sidebar_position: 8
keywords: ['clickhouse', 'javascript', 'typescript', 'nodejs', 'connector', 'integration', 'clickhouse-client']
description: 'Guide for building a JavaScript or TypeScript connector or integration on top of ClickHouse'
slug: /integrations/building-integrations/javascript
title: 'JavaScript connector guide'
doc_type: 'guide'
---

# JavaScript connector guide

This guide is for developers building connectors, integrations, and analytics tooling on top of ClickHouse using the official JavaScript client. It covers client setup, connection management, schema discovery, type mapping, querying, and data ingestion patterns.

For the full API reference — including all client options, method signatures, and format details — see the [ClickHouse JS reference](/integrations/javascript). For ingestion and consumption patterns that apply across languages, see the [ingestion patterns](/integrations/building-integrations/ingestion) and [consumption patterns](/integrations/building-integrations/consumption) guides.

## Overview {#overview}

The official JavaScript client ships as two packages:

- `@clickhouse/client` — Node.js and other server-side runtimes (ETL pipelines, API backends, CLI tools, serverless functions on AWS Lambda or similar)
- `@clickhouse/client-web` — browsers (Chrome, Firefox) and Cloudflare Workers

Both packages expose the same API surface. The difference is in the underlying HTTP transport: the Node.js package uses Node's built-in `http`/`https` modules and manages an HTTP keep-alive connection pool; the web package uses the browser Fetch API and defers connection management to the runtime.

The client is written in TypeScript and ships full type definitions. No additional `@types/` package is needed.

## Installation {#installation}

For server-side connectors, ETL pipelines, and API backends:

```sh
npm install @clickhouse/client
```

For browser-based BI dashboards or Cloudflare Workers:

```sh
npm install @clickhouse/client-web
```

TypeScript requires version 4.5 or later. The client uses inline import/export syntax introduced in that release.

## Creating a client {#client-setup}

```typescript
import { createClient } from '@clickhouse/client';

const client = createClient({
  url: process.env.CLICKHOUSE_URL,       // e.g. https://abc123.us-east-1.aws.clickhouse.cloud:8443
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
});
```

For ClickHouse Cloud, always use HTTPS on port 8443. Plaintext HTTP is not accepted. Never hardcode credentials — read them from environment variables or a secrets manager.

For the web client, the import path changes but the API is identical:

```typescript
import { createClient } from '@clickhouse/client-web';
```

TypeScript users can import type definitions directly from the package:

```typescript
import { createClient, type ClickHouseClient, type ResponseJSON } from '@clickhouse/client';
```

## Connection pool (Node.js) {#connection-pool}

The Node.js client manages an HTTP keep-alive connection pool internally. No external pooling library is required. Key settings:

| Option | Default | Notes |
|---|---|---|
| `max_open_connections` | `10` | Maximum simultaneous open sockets. Increase for high-concurrency connectors. |
| `keep_alive.enabled` | `true` | Do not disable. Disabling forces a new TCP handshake per request. |
| `request_timeout` | `300_000` (ms) | Set this above your `max_execution_time` server setting so the client does not abort before ClickHouse finishes. |

```typescript
const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  max_open_connections: 20,
  request_timeout: 120_000,
});
```

Always call `client.close()` when the client is no longer needed to drain the connection pool cleanly.

## Schema discovery {#schema-discovery}

### Listing columns {#list-columns}

Use `system.columns` to enumerate columns for schema browsers, column pickers, or query builders. Prefer `system.columns` over `INFORMATION_SCHEMA.columns` — it exposes ClickHouse-specific metadata like `is_in_sorting_key` that is absent from the standard view.

```typescript
const resultSet = await client.query({
  query: `
    SELECT name, type, is_in_primary_key, is_in_sorting_key
    FROM system.columns
    WHERE database = {database:String}
      AND table = {table:String}
    ORDER BY position
  `,
  query_params: { database: 'my_database', table: 'events' },
  format: 'JSONEachRow',
});

const columns = await resultSet.json<{
  name: string;
  type: string;
  is_in_primary_key: number;
  is_in_sorting_key: number;
}>();
```

### Parsing type modifiers {#parse-types}

ClickHouse wraps types with `Nullable(T)` and `LowCardinality(T)` modifiers. Strip these before mapping to JavaScript types:

```typescript
function unwrapType(clickhouseType: string): string {
  let t = clickhouseType.trim();
  if (t.startsWith('Nullable(') && t.endsWith(')')) {
    t = t.slice('Nullable('.length, -1);
  }
  if (t.startsWith('LowCardinality(') && t.endsWith(')')) {
    t = t.slice('LowCardinality('.length, -1);
  }
  return t;
}
```

Apply `unwrapType` before passing `type` to your type mapping logic. A column typed `Nullable(LowCardinality(String))` should ultimately map the same as `String`.

## Type mapping {#type-mapping}

### Numeric types {#numeric-types}

When using `JSONEachRow` format, ClickHouse serializes numeric columns as JSON numbers or strings depending on the type:

| ClickHouse type | JavaScript value (JSONEachRow) |
|---|---|
| `Int8`, `Int16`, `Int32` | `number` |
| `UInt8`, `UInt16` | `number` |
| `UInt32` | `number` |
| `Int64`, `UInt64` | `string` (when `output_format_json_quote_64bit_integers=1` is set) or `number` (default — unsafe, see below) |
| `Int128`, `Int256`, `UInt128`, `UInt256` | `string` |
| `Float32`, `Float64` | `number` |
| `Decimal*` | `string` (to preserve precision) |

### The Int64 precision problem {#int64-precision}

This is the most important gotcha when building a JavaScript connector. `JSON.parse()` silently loses precision for integers beyond `Number.MAX_SAFE_INTEGER` (2^53 − 1 = 9,007,199,254,739,991). ClickHouse sends `Int64` and `UInt64` columns as JSON numbers by default, meaning large values are silently corrupted during parsing — with no error thrown.

**Always set `output_format_json_quote_64bit_integers=1` by default in connectors that will run against arbitrary tables.** Users cannot be expected to audit which columns might exceed the safe integer range.

```typescript
const resultSet = await client.query({
  query: 'SELECT id, user_id, event_count FROM events WHERE date = {d:Date}',
  query_params: { d: '2024-01-15' },
  format: 'JSONEachRow',
  clickhouse_settings: {
    output_format_json_quote_64bit_integers: 1,
  },
});
```

With this setting, `Int64`/`UInt64` values arrive as quoted strings (`"18446744073709551615"`). Parse them with `BigInt()` or a BigInt-aware library rather than `Number()`:

```typescript
const rows = await resultSet.json<{ id: string; event_count: string }>();
const eventCount = BigInt(rows[0].event_count);
```

If you need to expose the value to a downstream system that cannot accept `BigInt`, cast the column in SQL first:

```sql
SELECT toString(id) AS id FROM events
```

### Date and time types {#datetime-types}

All date/time types arrive as strings in JSON output:

| ClickHouse type | JSON representation | Notes |
|---|---|---|
| `Date` | `"2024-01-15"` | `YYYY-MM-DD`. No timezone. |
| `Date32` | `"2024-01-15"` | Extended range. No timezone. |
| `DateTime` | `"2024-01-15 12:00:00"` | Server timezone applies if no column-level timezone is set. |
| `DateTime64(n)` | `"2024-01-15 12:00:00.123"` | Fractional seconds to `n` digits. Same timezone behavior. |

Parse `DateTime` and `DateTime64` strings with `new Date()` carefully — JavaScript `Date` parses the value in local time, not UTC. Pass an explicit timezone offset or use a library like `date-fns-tz` or `luxon` when timezone correctness matters:

```typescript
// Ambiguous: JavaScript interprets as local time
const d = new Date('2024-01-15 12:00:00');

// Explicit UTC
const dUtc = new Date('2024-01-15T12:00:00Z');
```

## Querying {#querying}

### Streaming with ResultSet {#streaming}

For large result sets, stream rows one at a time rather than buffering the entire response in memory:

```typescript
const resultSet = await client.query({
  query: 'SELECT user_id, event_name, created_at FROM events WHERE date = {d:Date}',
  query_params: { d: '2024-01-15' },
  format: 'JSONEachRow',
  clickhouse_settings: { output_format_json_quote_64bit_integers: 1 },
});

try {
  for await (const rows of resultSet.stream<{ user_id: string; event_name: string; created_at: string }>()) {
    for (const row of rows) {
      // process row
    }
  }
} catch (err) {
  // Handle streaming errors — see the HTTP 200 on error section below
  throw err;
} finally {
  // Always close the ResultSet if you exit the loop early
  await resultSet.close();
}
```

Always consume the full stream or call `resultSet.close()`. If you break out of the loop early without closing, the underlying socket is held open and the connection pool is exhausted.

### Buffered query for small results {#buffered}

For small result sets (schema queries, metadata, configuration lookups), buffer the full response with `resultSet.json()`:

```typescript
const resultSet = await client.query({
  query: 'SELECT name, engine FROM system.tables WHERE database = {db:String}',
  query_params: { db: 'my_database' },
  format: 'JSONEachRow',
});

const tables = await resultSet.json<{ name: string; engine: string }>();
```

Do not use `.json()` for large or unbounded queries — it loads the entire response into memory.

### Parameterized queries {#parameterized}

Always use `query_params` with `{name:Type}` placeholders in the SQL string. Never concatenate user input into the query string.

```typescript
const resultSet = await client.query({
  query: `
    SELECT user_id, sum(revenue) AS total
    FROM events
    WHERE event_name = {event:String}
      AND created_at >= {from:DateTime}
      AND created_at < {to:DateTime}
    GROUP BY user_id
    ORDER BY total DESC
    LIMIT {limit:UInt32}
  `,
  query_params: {
    event: 'purchase',
    from: '2024-01-01 00:00:00',
    to: '2024-02-01 00:00:00',
    limit: 100,
  },
  format: 'JSONEachRow',
});
```

### Query tagging {#tagging}

Set a `query_id` on every query for traceability in `system.query_log`. Use `log_comment` to attach feature-level context:

```typescript
const resultSet = await client.query({
  query: 'SELECT region, sum(revenue) FROM sales GROUP BY region',
  format: 'JSONEachRow',
  query_id: `dashboard-revenue-${requestId}`,
  clickhouse_settings: {
    log_comment: 'connector:dashboard-revenue',
  },
});
```

If you retry after a timeout, reuse the same `query_id`. ClickHouse will return the result of the already-running query rather than executing it a second time.

### Handling the HTTP 200 on error {#http-200-error}

ClickHouse begins streaming the response body and sends `HTTP 200` before it knows whether the query will succeed. If an error occurs mid-stream, it is appended to the response body — the HTTP status code stays 200.

The JS client detects errors in the response body and throws a `ClickHouseError` in both buffered and streaming paths. For streaming queries, this means the error may surface after some rows have already been processed:

```typescript
import { ClickHouseError } from '@clickhouse/client';

const resultSet = await client.query({
  query: 'SELECT * FROM events',
  format: 'JSONEachRow',
});

try {
  for await (const rows of resultSet.stream()) {
    for (const row of rows) {
      // process rows — an error may be thrown at any iteration
    }
  }
} catch (err) {
  if (err instanceof ClickHouseError) {
    console.error(`ClickHouse error ${err.code}: ${err.message}`);
  } else {
    throw err;
  }
} finally {
  await resultSet.close();
}
```

## Inserting data {#inserts}

### Stream insert {#stream-insert}

For large batches in Node.js, pipe a `Readable` stream directly into the insert. This avoids buffering the entire batch in memory:

```typescript
import { Readable } from 'stream';

const rows = [
  { user_id: 'alice', event_name: 'login', created_at: '2024-01-15 12:00:00' },
  { user_id: 'bob', event_name: 'signup', created_at: '2024-01-15 12:01:00' },
  // ...more rows
];

await client.insert({
  table: 'events',
  values: Readable.from(rows),
  format: 'JSONEachRow',
});
```

### Array insert {#array-insert}

For smaller batches where you already have data in memory, pass an array directly:

```typescript
await client.insert({
  table: 'events',
  values: [
    { user_id: 'alice', event_name: 'login', created_at: '2024-01-15 12:00:00' },
    { user_id: 'bob', event_name: 'signup', created_at: '2024-01-15 12:01:00' },
  ],
  format: 'JSONObjectEachRow',
});
```

### Batch sizing {#batch-size}

Every `INSERT` creates a new on-disk data part. ClickHouse merges parts asynchronously. If inserts arrive faster than merges complete, the active part count in a partition crosses the default threshold (300 parts) and ClickHouse raises `Too many parts`.

Target **10,000–100,000 rows per insert**. Never insert one row at a time.

```typescript
async function insertBatch(rows: EventRow[]): Promise<void> {
  await client.insert({
    table: 'events',
    values: rows,
    format: 'JSONEachRow',
  });
}

// Accumulate rows before calling insertBatch
const BATCH_SIZE = 50_000;
let batch: EventRow[] = [];

for (const row of rowSource) {
  batch.push(row);
  if (batch.length >= BATCH_SIZE) {
    await insertBatch(batch);
    batch = [];
  }
}
if (batch.length > 0) {
  await insertBatch(batch);
}
```

### Idempotent inserts {#deduplication}

Pass `insert_deduplication_token` to make inserts safe to retry. ClickHouse deduplicates inserts with the same token within a configurable window:

```typescript
await client.insert({
  table: 'events',
  values: rows,
  format: 'JSONEachRow',
  clickhouse_settings: {
    insert_deduplication_token: 'pipeline-job-2024-01-15-batch-001',
  },
});
```

Use a deterministic token derived from the batch contents or job identifier. If you retry the same insert after a timeout, use the same token — ClickHouse will skip the duplicate rather than writing the rows twice.

## Web client limitations {#web-limitations}

The web client (`@clickhouse/client-web`) has constraints imposed by the browser Fetch API:

- **No streaming inserts.** The Fetch API does not support streaming request bodies in all browsers. Use array inserts only, and keep batch sizes small.
- **No connection pool.** The browser manages connections. `max_open_connections` has no effect.
- **CORS.** Browser-direct connections to ClickHouse Cloud require CORS to be configured. Add the allowed origins in the ClickHouse Cloud console before enabling browser-direct access.
- **Read-heavy workloads only.** The web client is well-suited for BI dashboards, query editors, and data exploration tools. It is not suitable for high-throughput ingestion.

**Never expose ClickHouse credentials in browser-side code.** Even with CORS configured, credentials embedded in a browser bundle are visible to any user of the page. For write-heavy workloads, or any workload where the ClickHouse user has elevated privileges, proxy all ClickHouse traffic through your backend.

## Error handling {#error-handling}

Catch `ClickHouseError` for ClickHouse-specific errors. The `code` property contains the ClickHouse error code string, which is stable across server versions and suitable for programmatic handling:

```typescript
import { createClient, ClickHouseError } from '@clickhouse/client';

async function runQuery(sql: string): Promise<unknown[]> {
  try {
    const resultSet = await client.query({ query: sql, format: 'JSONEachRow' });
    return await resultSet.json();
  } catch (err) {
    if (err instanceof ClickHouseError) {
      switch (err.code) {
        case 'UNKNOWN_TABLE':
        case 'UNKNOWN_DATABASE':
          throw new Error(`Schema not found: ${err.message}`);
        case 'ACCESS_DENIED':
        case 'READONLY':
          // Do not retry — the user lacks permission
          throw new Error(`Permission denied: ${err.message}`);
        default:
          // Transient or unknown: eligible for retry
          throw err;
      }
    }
    // Network-level error: eligible for retry
    throw err;
  }
}
```

Retry strategy:

- **Retry** on network-level errors (`ECONNREFUSED`, `ETIMEDOUT`, socket errors) with exponential backoff and jitter.
- **Retry** on `ClickHouseError` when the code suggests a transient condition (e.g., server overload). Reuse the same `query_id` on retried inserts.
- **Do not retry** on `UNKNOWN_TABLE`, `UNKNOWN_DATABASE`, `ACCESS_DENIED`, `READONLY`, or syntax errors. These will not resolve on their own.

A minimal exponential backoff helper:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 200,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        !(err instanceof ClickHouseError) ||
        !['ACCESS_DENIED', 'READONLY', 'UNKNOWN_TABLE', 'UNKNOWN_DATABASE'].includes(err.code ?? '');
      if (!isRetryable || attempt === maxAttempts) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('unreachable');
}
```
