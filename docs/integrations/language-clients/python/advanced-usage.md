---
sidebar_label: 'Advanced Usage'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'Advanced Usage with ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-usage
title: 'Advanced Usage'
doc_type: 'reference'
---

# Advanced Usage {#advanced-usage}

## Raw API {#raw-api}

For use cases which do not require transformation between ClickHouse data and native or third party data types and structures, the ClickHouse Connect client provides methods for direct usage of the ClickHouse connection.

### Client `raw_query` method {#client-rawquery-method}

The `Client.raw_query` method allows direct usage of the ClickHouse HTTP query interface using the client connection. The return value is an unprocessed `bytes` object. It offers a convenient wrapper with parameter binding, error handling, retries, and settings management using a minimal interface:

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | Any valid ClickHouse query                                                                                                                              |
| parameters    | dict or iterable | *None*     | See [parameters description](driver-api.md#parameters-argument).                                                                                        |
| settings      | dict             | *None*     | See [settings description](driver-api.md#settings-argument).                                                                                            |
| fmt           | str              | *None*     | ClickHouse Output Format for the resulting bytes. (ClickHouse uses TSV if not specified)                                                                |
| use_database  | bool             | True       | Use the ClickHouse Connect client-assigned database for the query context                                                                               |
| external_data | ExternalData     | *None*     | An ExternalData object containing file or binary data to use with the query. See [Advanced Queries (External Data)](advanced-querying.md#external-data) |

It is the caller's responsibility to handle the resulting `bytes` object. Note that the `Client.query_arrow` is just a thin wrapper around this method using the ClickHouse `Arrow` output format.

### Client `raw_stream` method {#client-rawstream-method}
The `Client.raw_stream` method has the same API as the `raw_query` method, but returns an `io.IOBase` object which can be used as a generator/stream source of `bytes` objects. It is currently utilized by the `query_arrow_stream` method.

### Client `raw_insert` method {#client-rawinsert-method}

The `Client.raw_insert` method allows direct inserts of `bytes` objects or `bytes` object generators using the client connection. Because it does no processing of the insert payload, it is highly performant. The method provides options to specify settings and insert format:

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | Either the simple or database qualified table name                                          |
| column_names | Sequence[str]                          | *None*     | Column names for the insert block. Required if the `fmt` parameter does not include names   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | Data to insert. Strings will be encoded with the client encoding.                           |
| settings     | dict                                   | *None*     | See [settings description](driver-api.md#settings-argument).                                |
| fmt          | str                                    | *None*     | ClickHouse Input Format of the `insert_block` bytes. (ClickHouse uses TSV if not specified) |

It is the caller's responsibility to ensure that the `insert_block` is in the specified format and uses the specified compression method. ClickHouse Connect uses these raw inserts for file uploads and PyArrow Tables, delegating parsing to the ClickHouse server.

## Saving query results as files {#saving-query-results-as-files}

You can stream files directly from ClickHouse to the local file system using the `raw_stream` method. For example, if you'd like to save the results of a query to a CSV file, you could use the following code snippet:

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # or CSV, or CSVWithNamesAndTypes, or TabSeparated, etc.
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

The code above yields an `output.csv` file with the following content:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

Similarly, you could save data in [TabSeparated](/interfaces/formats/TabSeparated) and other formats. See [Formats for Input and Output Data](/interfaces/formats) for an overview of all available format options.

## Multithreaded, multiprocess, and async/event driven use cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect works well in multithreaded, multiprocess, and event-loop-driven/asynchronous applications. All query and insert processing occurs within a single thread, so operations are generally thread-safe. (Parallel processing of some operations at a low level is a possible future enhancement to overcome the performance penalty of a single thread, but even in that case thread safety will be maintained.)

Because each query or insert executed maintains state in its own `QueryContext` or `InsertContext` object, respectively, these helper objects are not thread-safe, and they should not be shared between multiple processing streams. See the additional discussion about context objects in the [QueryContexts](advanced-querying.md#querycontexts) and [InsertContexts](advanced-inserting.md#insertcontexts) sections.

Additionally, in an application that has two or more queries and/or inserts "in flight" at the same time, there are two further considerations to keep in mind. The first is the ClickHouse "session" associated with the query/insert, and the second is the HTTP connection pool used by ClickHouse Connect Client instances.

## AsyncClient wrapper {#asyncclient-wrapper}

ClickHouse Connect provides an async wrapper over the regular `Client`, so that it is possible to use the client in an `asyncio` environment.

To get an instance of the `AsyncClient`, you can use the `get_async_client` factory function, which accepts the same parameters as the standard `get_client`:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # Output:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` has the same methods with the same parameters as the standard `Client`, but they are coroutines when applicable. Internally, these methods from the `Client` that perform I/O operations are wrapped in a [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) call.

Multithreaded performance will increase when using the `AsyncClient` wrapper, as the execution threads and the GIL will be released while waiting for I/O operations to complete.

Note: Unlike the regular `Client`, the `AsyncClient` enforces `autogenerate_session_id` to be `False` by default.

See also: [run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).

## Managing ClickHouse session IDs {#managing-clickhouse-session-ids}

Each ClickHouse query occurs within the context of a ClickHouse "session". Sessions are currently used for two purposes:
- To associate specific ClickHouse settings with multiple queries (see the [user settings](/operations/settings/settings.md)). The ClickHouse `SET` command is used to change the settings for the scope of a user session.
- To track [temporary tables.](/sql-reference/statements/create/table#temporary-tables)

By default, each query executed with a ClickHouse Connect `Client` instance uses that client's session ID. `SET` statements and temporary tables work as expected when using a single client. However, the ClickHouse server does not allow concurrent queries within the same session (the client will raise a `ProgrammingError` if attempted). For applications that execute concurrent queries, use one of the following patterns:
1. Create a separate `Client` instance for each thread/process/event handler that needs session isolation. This preserves per-client session state (temporary tables and `SET` values).
2. Use a unique `session_id` for each query via the `settings` argument when calling `query`, `command`, or `insert`, if you do not require shared session state.
3. Disable sessions on a shared client by setting `autogenerate_session_id=False` before creating the client (or pass it directly to `get_client`).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

Alternatively, pass `autogenerate_session_id=False` directly to `get_client(...)`.

In this case ClickHouse Connect does not send a `session_id`; the server does not treat separate requests as belonging to the same session. Temporary tables and session-level settings will not persist across requests.

## Customizing the HTTP connection pool {#customizing-the-http-connection-pool}

ClickHouse Connect uses `urllib3` connection pools to handle the underlying HTTP connection to the server. By default, all client instances share the same connection pool, which is sufficient for the majority of use cases. This default pool maintains up to 8 HTTP Keep Alive connections to each ClickHouse server used by the application.

For large multi-threaded applications, separate connection pools may be appropriate. Customized connection pools can be provided as the `pool_mgr` keyword argument to the main `clickhouse_connect.get_client` function:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

As demonstrated by the above example, clients can share a pool manager, or a separate pool manager can be created for each client. For more details on the options available when creating a PoolManager, see the [`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior).
