---
sidebar_label: '高级用法'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'ClickHouse Connect 高级用法'
slug: /integrations/language-clients/python/advanced-usage
title: '高级用法'
doc_type: 'reference'
---



# 高级用法 {#advanced-usage}


## Raw API {#raw-api}

对于不需要在 ClickHouse 数据与原生或第三方数据类型和结构之间进行转换的使用场景,ClickHouse Connect 客户端提供了直接使用 ClickHouse 连接的方法。

### 客户端 `raw_query` 方法 {#client-rawquery-method}

`Client.raw_query` 方法允许通过客户端连接直接使用 ClickHouse HTTP 查询接口。返回值是未经处理的 `bytes` 对象。该方法提供了一个便捷的封装,通过简洁的接口实现参数绑定、错误处理、重试和设置管理:

| 参数          | 类型             | 默认值     | 描述                                                                                                                                                    |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query         | str              | _必需_     | 任何有效的 ClickHouse 查询                                                                                                                              |
| parameters    | dict or iterable | _None_     | 参见[参数说明](driver-api.md#parameters-argument)。                                                                                        |
| settings      | dict             | _None_     | 参见[设置说明](driver-api.md#settings-argument)。                                                                                            |
| fmt           | str              | _None_     | 结果字节的 ClickHouse 输出格式。(未指定时 ClickHouse 使用 TSV)                                                                |
| use_database  | bool             | True       | 在查询上下文中使用 ClickHouse Connect 客户端指定的数据库                                                                               |
| external_data | ExternalData     | _None_     | 包含用于查询的文件或二进制数据的 ExternalData 对象。参见[高级查询(外部数据)](advanced-querying.md#external-data) |

调用者需负责处理返回的 `bytes` 对象。注意,`Client.query_arrow` 只是对此方法的一个轻量级封装,使用 ClickHouse 的 `Arrow` 输出格式。

### 客户端 `raw_stream` 方法 {#client-rawstream-method}

`Client.raw_stream` 方法具有与 `raw_query` 方法相同的 API,但返回一个 `io.IOBase` 对象,可用作 `bytes` 对象的生成器/流数据源。该方法目前被 `query_arrow_stream` 方法使用。

### 客户端 `raw_insert` 方法 {#client-rawinsert-method}

`Client.raw_insert` 方法允许通过客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于不对插入数据进行任何处理,因此性能极高。该方法提供了指定设置和插入格式的选项:

| 参数         | 类型                                   | 默认值     | 描述                                                                                 |
| ------------ | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| table        | str                                    | _必需_     | 简单表名或带数据库限定的表名                                          |
| column_names | Sequence[str]                          | _None_     | 插入数据块的列名。如果 `fmt` 参数不包含列名,则为必需   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | _必需_     | 要插入的数据。字符串将使用客户端编码进行编码。                           |
| settings     | dict                                   | _None_     | 参见[设置说明](driver-api.md#settings-argument)。                                |
| fmt          | str                                    | _None_     | `insert_block` 字节的 ClickHouse 输入格式。(未指定时 ClickHouse 使用 TSV) |

调用者需负责确保 `insert_block` 采用指定的格式并使用指定的压缩方法。ClickHouse Connect 将这些原始插入用于文件上传和 PyArrow 表,并将解析工作委托给 ClickHouse 服务器。


## 将查询结果保存为文件 {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法将 ClickHouse 的查询结果直接流式传输到本地文件系统。例如,如果您想将查询结果保存为 CSV 文件,可以使用以下代码:

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # 或 CSV、CSVWithNamesAndTypes、TabSeparated 等
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上述代码会生成一个包含以下内容的 `output.csv` 文件:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同样,您也可以将数据保存为 [TabSeparated](/interfaces/formats/TabSeparated) 等其他格式。有关所有可用格式选项的概述,请参阅[输入和输出数据格式](/interfaces/formats)。


## 多线程、多进程和异步/事件驱动使用场景 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程和事件循环驱动/异步应用程序中表现良好。所有查询和插入处理都在单个线程内执行,因此操作通常是线程安全的。(未来可能会增强底层某些操作的并行处理能力,以克服单线程带来的性能损失,但即使在这种情况下也会保持线程安全。)

由于每个执行的查询或插入分别在其自己的 `QueryContext` 或 `InsertContext` 对象中维护状态,这些辅助对象不是线程安全的,不应在多个处理流之间共享。有关上下文对象的更多讨论,请参阅 [QueryContexts](advanced-querying.md#querycontexts) 和 [InsertContexts](advanced-inserting.md#insertcontexts) 章节。

此外,在同时有两个或更多查询和/或插入"正在执行"的应用程序中,还需要注意两个方面。第一个是与查询/插入关联的 ClickHouse "会话",第二个是 ClickHouse Connect Client 实例使用的 HTTP 连接池。


## AsyncClient 包装器 {#asyncclient-wrapper}

ClickHouse Connect 为常规 `Client` 提供了异步包装器,使其能够在 `asyncio` 环境中使用。

要获取 `AsyncClient` 实例,可以使用 `get_async_client` 工厂函数,该函数接受与标准 `get_client` 相同的参数:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # 输出:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` 具有与标准 `Client` 相同的方法和参数,但在适用时这些方法是协程。在内部,`Client` 中执行 I/O 操作的这些方法被包装在 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

使用 `AsyncClient` 包装器时多线程性能会提升,因为在等待 I/O 操作完成期间,执行线程和 GIL 会被释放。

注意:与常规 `Client` 不同,`AsyncClient` 默认强制将 `autogenerate_session_id` 设为 `False`。

另请参阅:[run_async 示例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。


## 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都在 ClickHouse "会话"的上下文中执行。会话目前用于两个目的:

- 将特定的 ClickHouse 设置与多个查询关联(参见[用户设置](/operations/settings/settings.md))。ClickHouse `SET` 命令用于更改用户会话范围内的设置。
- 跟踪[临时表](/sql-reference/statements/create/table#temporary-tables)。

默认情况下,使用 ClickHouse Connect `Client` 实例执行的每个查询都使用该客户端的会话 ID。使用单个客户端时,`SET` 语句和临时表按预期工作。但是,ClickHouse 服务器不允许在同一会话中执行并发查询(如果尝试,客户端将抛出 `ProgrammingError` 异常)。对于需要执行并发查询的应用程序,请使用以下模式之一:

1. 为每个需要会话隔离的线程/进程/事件处理程序创建单独的 `Client` 实例。这将保留每个客户端的会话状态(临时表和 `SET` 值)。
2. 如果不需要共享会话状态,在调用 `query`、`command` 或 `insert` 时,通过 `settings` 参数为每个查询使用唯一的 `session_id`。
3. 在创建客户端之前设置 `autogenerate_session_id=False` 来禁用共享客户端上的会话(或直接将其传递给 `get_client`)。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # 应始终在创建客户端之前设置此项
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

或者,直接将 `autogenerate_session_id=False` 传递给 `get_client(...)`。

在这种情况下,ClickHouse Connect 不会发送 `session_id`;服务器不会将单独的请求视为属于同一会话。临时表和会话级设置不会在请求之间持久化。


## 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池来处理与服务器的底层 HTTP 连接。默认情况下,所有客户端实例共享同一个连接池,这对于大多数使用场景已经足够。该默认连接池为应用程序使用的每个 ClickHouse 服务器维护最多 8 个 HTTP Keep Alive 连接。

对于大型多线程应用程序,使用独立的连接池可能更合适。可以通过 `pool_mgr` 关键字参数向 `clickhouse_connect.get_client` 主函数提供自定义连接池:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上例所示,多个客户端可以共享一个连接池管理器,也可以为每个客户端创建单独的连接池管理器。有关创建 PoolManager 时可用选项的更多详细信息,请参阅 [`urllib3` 文档](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。
