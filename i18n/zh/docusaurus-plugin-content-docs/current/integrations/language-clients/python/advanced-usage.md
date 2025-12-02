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

对于不需要在 ClickHouse 数据与原生或第三方数据类型和结构之间进行转换的用例，ClickHouse Connect 客户端提供了直接访问 ClickHouse 连接的方法。

### Client `raw_query` 方法 {#client-rawquery-method}

`Client.raw_query` 方法允许通过客户端连接直接使用 ClickHouse HTTP 查询接口。其返回值是未处理的 `bytes` 对象。它通过一个精简接口提供了参数绑定、错误处理、重试以及 settings 配置管理等便捷封装：

| 参数          | 类型             | 默认值     | 说明                                                                                                                                                    |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | 任意有效的 ClickHouse 查询                                                                                                                              |
| parameters    | dict or iterable | *None*     | 参见 [parameters description](driver-api.md#parameters-argument)。                                                                                       |
| settings      | dict             | *None*     | 参见 [settings description](driver-api.md#settings-argument)。                                                                                           |
| fmt           | str              | *None*     | 生成的字节数据所使用的 ClickHouse 输出格式。（如果未指定，ClickHouse 使用 TSV）                                                                         |
| use_database  | bool             | True       | 在查询上下文中使用由 ClickHouse Connect 客户端指定的数据库                                                                                              |
| external_data | ExternalData     | *None*     | 一个包含要在查询中使用的文件或二进制数据的 ExternalData 对象。参见 [Advanced Queries (External Data)](advanced-querying.md#external-data)              |

调用方有责任处理返回的 `bytes` 对象。请注意，`Client.query_arrow` 只是此方法的一个轻量封装，使用 ClickHouse 的 `Arrow` 输出格式。

### Client `raw_stream` 方法 {#client-rawstream-method}

`Client.raw_stream` 方法与 `raw_query` 方法具有相同的 API，但返回一个 `io.IOBase` 对象，可用作 `bytes` 对象的生成器/流式数据源。目前它由 `query_arrow_stream` 方法使用。

### Client `raw_insert` 方法 {#client-rawinsert-method}

`Client.raw_insert` 方法允许通过客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于它不会对插入数据负载做任何处理，因此性能非常高。该方法提供选项用于指定设置和插入格式：

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | 简单表名或带数据库前缀的完整表名                                                            |
| column_names | Sequence[str]                          | *None*     | 插入数据块的列名。如果 `fmt` 参数中未包含列名，则此参数为必需                               |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | 要插入的数据。字符串会使用客户端编码进行编码。                                              |
| settings     | dict                                   | *None*     | 参见 [settings 描述](driver-api.md#settings-argument)。                                     |
| fmt          | str                                    | *None*     | `insert_block` 字节数据的 ClickHouse 输入格式（Input Format）。（如果未指定，ClickHouse 使用 TSV） |

调用方有责任确保 `insert_block` 符合指定的格式并使用指定的压缩方式。ClickHouse Connect 在文件上传和 PyArrow 表中使用这些原始插入操作，将解析工作委托给 ClickHouse 服务器。

## 将查询结果保存为文件 {#saving-query-results-as-files}

可以使用 `raw_stream` 方法将数据以文件形式直接从 ClickHouse 流式写入本地文件系统。例如，若要将查询结果保存为 CSV 文件，可以使用以下代码片段：

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

上述代码会生成一个名为 `output.csv` 的文件，内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同样，你也可以将数据保存为 [TabSeparated](/interfaces/formats/TabSeparated) 以及其他格式。有关所有可用格式选项的概览，请参阅 [输入和输出数据的格式](/interfaces/formats)。


## 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程以及事件循环驱动/异步应用中表现良好。所有查询和插入处理都在单个线程中执行，因此操作通常是线程安全的。（在底层对部分操作进行并行处理是未来可能的增强方向，以克服单线程带来的性能损失，但即便在那种情况下也会保持线程安全。）

由于每个查询或插入操作分别在其自身的 `QueryContext` 或 `InsertContext` 对象中维护状态，这些辅助对象本身并非线程安全，不应在多个处理流之间共享。有关上下文对象的更多讨论，请参见 [QueryContexts](advanced-querying.md#querycontexts) 和 [InsertContexts](advanced-inserting.md#insertcontexts) 章节。

此外，在一个应用中如果同时存在两个或更多并发进行的查询和/或插入操作，还需要注意另外两个方面。第一是与查询/插入相关联的 ClickHouse“会话”，第二是 ClickHouse Connect Client 实例所使用的 HTTP 连接池。

## AsyncClient 封装器 {#asyncclient-wrapper}

ClickHouse Connect 为常规 `Client` 提供了一个异步封装，因此可以在 `asyncio` 环境中使用该客户端。

要获取 `AsyncClient` 的实例，可以使用 `get_async_client` 工厂函数，它接受的参数与标准的 `get_client` 相同：

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

`AsyncClient` 具有与标准 `Client` 相同的方法和参数，但在适用时这些方法是协程。在内部，来自 `Client` 的这些执行 I/O 操作的方法被包装在一次 [run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

在使用 `AsyncClient` 封装器时，多线程性能会提高，因为在等待 I/O 操作完成期间，执行线程和 GIL 会被释放。

注意：与常规的 `Client` 不同，`AsyncClient` 会强制将 `autogenerate_session_id` 的默认值设为 `False`。

另请参阅：[run&#95;async 示例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。


## 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都会在一个 ClickHouse “会话”的上下文中执行。会话目前用于两个目的：

* 将特定的 ClickHouse 设置与多个查询关联（参见[用户设置](/operations/settings/settings.md)）。ClickHouse 的 `SET` 命令用于在用户会话的作用域内更改设置。
* 跟踪[临时表](/sql-reference/statements/create/table#temporary-tables)。

默认情况下，每个使用 ClickHouse Connect `Client` 实例执行的查询都会使用该 `Client` 的会话 ID。在仅使用单个 `Client` 时，`SET` 语句和临时表会按预期工作。然而，ClickHouse 服务器不允许在同一会话中并发执行查询（如果尝试，并发查询的 `Client` 会抛出 `ProgrammingError`）。对于需要执行并发查询的应用程序，请使用以下方案之一：

1. 为每个需要会话隔离的线程 / 进程 / 事件处理器创建单独的 `Client` 实例。这将保留每个 `Client` 的会话状态（临时表和 `SET` 值）。
2. 如果不需要共享会话状态，在调用 `query`、`command` 或 `insert` 时，通过 `settings` 参数为每个查询使用唯一的 `session_id`。
3. 通过在创建 `Client` 之前设置 `autogenerate_session_id=False`（或直接传给 `get_client`），在共享 `Client` 上禁用会话。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

或者，将 `autogenerate_session_id=False` 直接传递给 `get_client(...)`。

在这种情况下，ClickHouse Connect 不会发送 `session_id`；服务器不会将各个请求视为同一会话的一部分。临时表和会话级别的设置不会在请求之间保留。


## 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池来处理与服务器的底层 HTTP 连接。默认情况下，所有客户端实例共享同一个连接池，这对于大多数使用场景已经足够。这个默认连接池会针对应用程序使用的每个 ClickHouse 服务器最多维护 8 个 HTTP Keep-Alive 连接。

对于大型多线程应用程序，使用单独的连接池可能更为合适。可以通过在主要函数 `clickhouse_connect.get_client` 中提供关键字参数 `pool_mgr` 来传入自定义连接池：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上例所示，客户端可以共享同一个池管理器，也可以为每个客户端单独创建一个池管理器。有关创建 `PoolManager` 时可用选项的更多信息，请参阅 [`urllib3` 文档](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。
