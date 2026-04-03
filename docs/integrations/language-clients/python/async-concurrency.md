---
sidebar_label: 'Async and concurrency'
sidebar_position: 4

keywords: ['clickhouse', 'python', 'async', 'threading', 'concurrency', 'session']
description: 'Async client, threading, sessions, and connection pooling in clickhouse-connect'
slug: /integrations/language-clients/python/async-concurrency
title: 'Async and concurrency'
doc_type: 'guide'
---

# Async and Concurrency {#async-and-concurrency}

This page covers the AsyncClient, thread safety, session management, shared client patterns, and connection pool configuration.

## AsyncClient {#asyncclient}

ClickHouse Connect provides a native async client built on [aiohttp](https://docs.aiohttp.org/) for asyncio applications. It performs true async I/O without blocking the event loop.

```bash
pip install clickhouse-connect[async]
```

### Creating an async client {#creating-an-async-client}

Use `get_async_client` to create an async client. It accepts the same connection parameters as `get_client`, plus a few async-specific options:

| Parameter                  | Type  | Default | Description                        |
|----------------------------|-------|---------|------------------------------------|
| `connector_limit`          | int   | 100     | Maximum total connections          |
| `connector_limit_per_host` | int   | 20      | Maximum connections per host       |
| `keepalive_timeout`        | float | 30.0    | Idle connection timeout in seconds |

```python
import asyncio
import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client(
        host="localhost",
        connector_limit=50,
        connector_limit_per_host=10,
    )

    result = await client.query("SELECT name FROM system.databases LIMIT 3")
    print(result.result_rows)

    await client.close()


asyncio.run(main())
```

### Async context manager {#async-context-manager}

```python
async with await clickhouse_connect.get_async_client(host="localhost") as client:
    result = await client.query("SELECT 1")
```

### Available methods {#async-methods}

`AsyncClient` has the same methods as the synchronous `Client`, but as coroutines:

```python
result = await client.query("SELECT ...")
df = await client.query_df("SELECT ...")
arrow_table = await client.query_arrow("SELECT ...")
summary = await client.insert("table", data, column_names=[...])
summary = await client.insert_df("table", df)
summary = await client.insert_arrow("table", arrow_table)
raw = await client.raw_query("SELECT ...")
value = await client.command("SELECT count() FROM ...")
```

Streaming methods return `StreamContext` objects that support `async with` and `async for`:

```python
async with await client.query_rows_stream("SELECT * FROM large_table") as stream:
    async for row in stream:
        process(row)
```

### Key differences from the sync client {#async-differences}

- **No session IDs by default.** `autogenerate_session_id` defaults to `False` for AsyncClient because concurrent async queries within the same ClickHouse session are not allowed.
- **No `pool_mgr` parameter.** The async client uses aiohttp's connection pooling, configured via `connector_limit`, `connector_limit_per_host`, and `keepalive_timeout`.

See also: [run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).

## Thread safety {#thread-safety}

All query and insert processing within a single client occurs in a single thread, so operations are generally thread-safe. However, there are important constraints around sessions.

### The session problem {#session-problem}

By default, each sync `Client` has an auto-generated session ID. ClickHouse does not allow concurrent queries within the same session. If two threads use the same client at the same time, you will get a `ProgrammingError`.

### Sharing a client across threads {#sharing-a-client}

To safely share a single client across threads, disable session ID generation:

```python
import clickhouse_connect
import threading

client = clickhouse_connect.get_client(
    host="localhost",
    autogenerate_session_id=False,
)

def worker(thread_id):
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")

threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
```

Without sessions, temporary tables and `SET` statements will not persist across requests.

### When you need sessions {#when-you-need-sessions}

If you need session state (temporary tables, session-level settings), use one of these patterns:

1. **One client per thread.** Each client gets its own session.

```python
def worker():
    client = clickhouse_connect.get_client(host="localhost")
    client.command("CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory")
    # ... use temp table ...
    client.close()
```

2. **Per-query session IDs.** Pass a unique `session_id` in the `settings` argument for each query.

```python
client.query(
    "SELECT ...",
    settings={"session_id": f"session_{threading.current_thread().ident}"},
)
```

### Context objects are not thread-safe {#context-thread-safety}

`QueryContext` and `InsertContext` objects are stateful and must not be shared between threads. Use `QueryContext.updated_copy()` to get a thread-safe copy if needed.

## Managing session IDs {#managing-session-ids}

Each ClickHouse query runs within a session. Sessions are used for:

- Associating ClickHouse settings with multiple queries via `SET`.
- Tracking temporary tables.

By default, sync clients auto-generate a UUID session ID. You can control this behavior:

```python
# Disable auto-generated sessions globally
from clickhouse_connect import common
common.set_setting("autogenerate_session_id", False)

# Or per client
client = clickhouse_connect.get_client(autogenerate_session_id=False)
```

Without a session ID, the server treats each request independently. Temporary tables and session-level settings will not persist.

## Customizing the HTTP connection pool {#customizing-the-http-connection-pool}

The sync client uses `urllib3` connection pools. By default, all clients share a single pool with up to 8 Keep-Alive connections per ClickHouse host.

For high-concurrency applications, you can provide a custom pool:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool)
```

Multiple clients can share the same pool manager, or each client can have its own. See the [urllib3 documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior) for all available options.

The `max_connection_age` global setting (default 600 seconds) controls how long a connection is reused before being recycled. This prevents connection pinning behind a load balancer:

```python
from clickhouse_connect import common
common.set_setting("max_connection_age", 300)  # Recycle after 5 minutes
```

## When to use multiple clients {#when-to-use-multiple-clients}

Multiple clients are appropriate for:

- **Different servers**: One client per ClickHouse server or cluster.
- **Different credentials**: Separate clients for different users or access levels.
- **Different databases**: When working with multiple databases simultaneously.
- **Isolated sessions**: When threads need independent temporary tables or session settings.

For most applications, a single client with `autogenerate_session_id=False` and a shared connection pool is sufficient.

## Client lifecycle {#client-lifecycle}

Creating a client involves establishing a connection, fetching server metadata, and initializing settings. Reuse clients rather than creating new ones per query.

```python
# Good: create once, reuse
client = clickhouse_connect.get_client(host="localhost")
for i in range(1000):
    client.query("SELECT count() FROM events")
client.close()
```

Always close clients on shutdown. Use a context manager for automatic cleanup:

```python
with clickhouse_connect.get_client(host="localhost") as client:
    result = client.query("SELECT 1")
```

`client.close()` disposes the client and closes pooled connections when the client owns its pool (custom TLS or proxy configurations). For the default shared pool, use `client.close_connections()` to proactively clear sockets.
