---
sidebar_label: '高级用法'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: '使用 ClickHouse Connect 的高级用法'
slug: /integrations/language-clients/python/advanced-usage
title: '高级用法'
doc_type: 'reference'
---



# 高级用法 {#advanced-usage}



## 原始 API {#raw-api}

对于不需要在 ClickHouse 数据与原生或第三方数据类型和结构之间进行转换的用例，ClickHouse Connect 客户端提供了直接使用 ClickHouse 连接的相关方法。

### 客户端 `raw_query` 方法 {#client-rawquery-method}

`Client.raw_query` 方法允许通过客户端连接直接使用 ClickHouse HTTP 查询接口。返回值是一个未处理的 `bytes` 对象。它通过一个精简的接口，提供了参数绑定、错误处理、重试以及配置项管理等便捷封装：

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | 任意合法的 ClickHouse 查询                                                                                                                              |
| parameters    | dict or iterable | *None*     | 参见 [parameters description](driver-api.md#parameters-argument)。                                                                                       |
| settings      | dict             | *None*     | 参见 [settings description](driver-api.md#settings-argument)。                                                                                           |
| fmt           | str              | *None*     | 结果字节的 ClickHouse 输出格式。（如果未指定，ClickHouse 默认使用 TSV）                                                                                  |
| use_database  | bool             | True       | 在查询上下文中使用由 ClickHouse Connect 客户端指定的数据库                                                                                               |
| external_data | ExternalData     | *None*     | 一个包含用于查询的文件或二进制数据的 ExternalData 对象。参见 [Advanced Queries (External Data)](advanced-querying.md#external-data)                     |

调用方负责处理返回的 `bytes` 对象。请注意，`Client.query_arrow` 只是对该方法的一个轻量封装，使用 ClickHouse 的 `Arrow` 输出格式。

### 客户端 `raw_stream` 方法 {#client-rawstream-method}
`Client.raw_stream` 方法与 `raw_query` 方法具有相同的 API，但返回一个 `io.IOBase` 对象，可用作 `bytes` 对象的生成器/流源。目前该方法被 `query_arrow_stream` 方法使用。

### 客户端 `raw_insert` 方法 {#client-rawinsert-method}

`Client.raw_insert` 方法允许通过客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于不会对插入负载数据进行任何处理，因此性能非常高。该方法提供选项以指定配置项和插入格式：

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | 简单表名或带数据库限定的表名                                                                 |
| column_names | Sequence[str]                          | *None*     | 插入块的列名。如果 `fmt` 参数中不包含列名，则必填                                             |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | 要插入的数据。字符串将使用客户端编码进行编码。                                                 |
| settings     | dict                                   | *None*     | 参见 [settings description](driver-api.md#settings-argument)。                               |
| fmt          | str                                    | *None*     | `insert_block` 字节的 ClickHouse 输入格式。（如果未指定，ClickHouse 默认使用 TSV）           |

调用方有责任确保 `insert_block` 符合指定格式并使用指定的压缩方式。ClickHouse Connect 在文件上传和 PyArrow Tables 中使用这些原始插入操作，将解析工作委托给 ClickHouse 服务器。



## 将查询结果保存为文件

你可以使用 `raw_stream` 方法以流式方式将查询结果直接从 ClickHouse 写入本地文件系统。例如，如果你想把查询结果保存到一个 CSV 文件中，可以使用如下代码片段：

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

上述代码将生成名为 `output.csv` 的文件，其内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

类似地，你也可以将数据保存为 [TabSeparated](/interfaces/formats/TabSeparated) 等其他格式。要了解所有可用的格式选项概览，请参阅[输入和输出数据的格式](/interfaces/formats)。


## 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程以及事件循环驱动/异步应用程序中表现良好。所有查询和插入的处理都在单个线程中执行，因此操作通常是线程安全的。（在底层对某些操作进行并行处理是未来可能的增强，用于克服单线程带来的性能损耗，但即便在那种情况下也会保持线程安全。）

由于每个被执行的查询或插入分别在其自己的 `QueryContext` 或 `InsertContext` 对象中维护状态，这些辅助对象本身不是线程安全的，不应在多个处理流之间共享。有关上下文对象的更多讨论，请参阅 [QueryContexts](advanced-querying.md#querycontexts) 和 [InsertContexts](advanced-inserting.md#insertcontexts) 小节。

此外，在一个应用程序中，如果同时存在两个或更多“在途”的查询和/或插入，还需要额外考虑两个方面。第一是与查询/插入关联的 ClickHouse“会话”，第二是 ClickHouse Connect Client 实例所使用的 HTTP 连接池。



## AsyncClient 包装器

ClickHouse Connect 基于常规 `Client` 提供了一个异步封装，因此可以在 `asyncio` 环境中使用该客户端。

要获取一个 `AsyncClient` 实例，可以使用工厂函数 `get_async_client`，它接受的参数与标准的 `get_client` 相同：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # 输出：
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` 具有与标准 `Client` 相同的方法和参数，但在适用的情况下这些方法是协程。在内部实现上，这些来自 `Client`、执行 I/O 操作的方法会被包装在一次 [run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

在使用 `AsyncClient` 包装器时，多线程性能会有所提升，因为在等待 I/O 操作完成时，执行线程会让出执行并释放 GIL。

注意：与常规 `Client` 不同，`AsyncClient` 默认会强制将 `autogenerate_session_id` 设为 `False`。

另请参阅：[run&#95;async 示例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。


## 管理 ClickHouse 会话 ID

每个 ClickHouse 查询都会在一个 ClickHouse“会话”的上下文中执行。会话目前用于两个目的：

* 将特定的 ClickHouse 设置关联到多个查询（参见 [user settings](/operations/settings/settings.md)）。ClickHouse 的 `SET` 命令用于在用户会话范围内更改设置。
* 跟踪[临时表](/sql-reference/statements/create/table#temporary-tables)。

默认情况下，每个使用 ClickHouse Connect `Client` 实例执行的查询都会使用该客户端的会话 ID。使用单个客户端时，`SET` 语句和临时表将按预期工作。然而，ClickHouse 服务器不允许在同一会话中并发执行查询（如果尝试，客户端会引发 `ProgrammingError`）。对于需要执行并发查询的应用程序，请使用以下模式之一：

1. 为每个需要会话隔离的线程/进程/事件处理器创建单独的 `Client` 实例。这样可以保留每个客户端的会话状态（临时表和 `SET` 值）。
2. 如果不需要共享会话状态，可在调用 `query`、`command` 或 `insert` 时，通过 `settings` 参数为每个查询使用唯一的 `session_id`。
3. 通过在创建客户端之前设置 `autogenerate_session_id=False`（或将其直接传递给 `get_client`），在共享客户端上禁用会话。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # 必须在创建客户端之前设置
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

或者，将 `autogenerate_session_id=False` 直接传递给 `get_client(...)`。

在这种情况下，ClickHouse Connect 不会发送 `session_id`；服务器不会将单独的请求视为同一会话的一部分。临时表和会话级别的设置不会在不同请求之间保留。


## 自定义 HTTP 连接池

ClickHouse Connect 使用 `urllib3` 连接池来处理与服务器之间的底层 HTTP 连接。默认情况下，所有客户端实例共享同一个连接池，这对于大多数使用场景已经足够。此默认连接池会为应用程序所使用的每个 ClickHouse 服务器维护最多 8 个 HTTP Keep-Alive 连接。

对于大型多线程应用程序，使用独立的连接池可能更为合适。可以通过将自定义连接池作为关键字参数 `pool_mgr` 传递给主函数 `clickhouse_connect.get_client`：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上例所示，客户端可以共享同一个池管理器，也可以为每个客户端创建单独的池管理器。有关创建 `PoolManager` 时可用选项的更多信息，请参阅 [`urllib3` 文档](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。
