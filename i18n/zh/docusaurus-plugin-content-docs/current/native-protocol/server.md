---
'slug': '/native-protocol/server'
'sidebar_position': 3
'title': '服务器数据包'
'description': '原生协议服务器'
'doc_type': 'reference'
---


# 服务器数据包

| 值    | 名称                               | 描述                                                          |
|-------|------------------------------------|---------------------------------------------------------------|
| 0     | [Hello](#hello)                   | 服务器握手响应                                                |
| 1     | Data                              | 与 [客户端数据](./client.md#data) 相同                             |
| 2     | [Exception](#exception)           | 查询处理异常                                                 |
| 3     | [Progress](#progress)             | 查询进度                                                     |
| 4     | [Pong](#pong)                     | Ping 响应                                                    |
| 5     | [EndOfStream](#end-of-stream)     | 所有数据包已传输                                            |
| 6     | [ProfileInfo](#profile-info)      | 性能分析数据                                                 |
| 7     | Totals                            | 总值                                                         |
| 8     | Extremes                          | 极端值（最小值，最大值）                                       |
| 9     | TablesStatusResponse              | 对 TableStatus 请求的响应                                     |
| 10    | [Log](#log)                       | 查询系统日志                                                 |
| 11    | TableColumns                      | 列描述                                                       |
| 12    | UUIDs                             | 唯一部分 ID 列表                                             |
| 13    | ReadTaskRequest                   | 字符串（UUID）描述请求需要的下一个任务                       |
| 14    | [ProfileEvents](#profile-events)  | 来自服务器的性能事件数据包                                   |

`Data`、`Totals` 和 `Extremes` 可以被压缩。

## Hello {#hello}

对 [客户端 hello](./client.md#hello) 的响应。

| 字段         | 类型     | 值               | 描述                   |
|--------------|----------|------------------|-----------------------|
| name         | String   | `Clickhouse`     | 服务器名称             |
| version_major| UVarInt  | `21`             | 服务器主版本           |
| version_minor| UVarInt  | `12`             | 服务器次版本           |
| revision     | UVarInt  | `54452`          | 服务器修订号           |
| tz           | String   | `Europe/Moscow`  | 服务器时区             |
| display_name | String   | `Clickhouse`     | 用户界面的服务器名称   |
| version_patch| UVarInt  | `3`              | 服务器补丁版本         |

## Exception {#exception}

查询处理期间的服务器异常。

| 字段         | 类型      | 值                                 | 描述                        |
|--------------|-----------|------------------------------------|-----------------------------|
| code         | Int32     | `60`                               | 参见 [ErrorCodes.cpp][codes]。 |
| name         | String    | `DB::Exception`                    | 服务器主要版本             |
| message      | String    | `DB::Exception: Table X doesn't exist` | 服务器次版本               |
| stack_trace  | String    | ~                                  | C++ 堆栈跟踪               |
| nested       | Bool      | `true`                             | 更多错误                   |

可以是连续的异常列表，直到 `nested` 为 `false`。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "错误代码列表"

## Progress {#progress}

由服务器定期报告的查询执行进度。

:::tip
进度以 **增量** 的形式报告。对于总计，请在客户端进行累积。
:::

| 字段         | 类型     | 值       | 描述                   |
|--------------|----------|----------|-----------------------|
| rows         | UVarInt  | `65535`  | 行数                  |
| bytes        | UVarInt  | `871799` | 字节数                |
| total_rows   | UVarInt  | `0`      | 总行数                |
| wrote_rows   | UVarInt  | `0`      | 客户端发送的行数       |
| wrote_bytes  | UVarInt  | `0`      | 客户端发送的字节数     |

## Pong {#pong}

对 [客户端 ping](./client.md#ping) 的响应，没有数据包正文。

## End of stream {#end-of-stream}

将不再发送 **Data** 数据包，查询结果已完全从服务器流向客户端。

没有数据包正文。

## Profile info {#profile-info}

| 字段                        | 类型      |
|-----------------------------|-----------|
| rows                        | UVarInt   |
| blocks                      | UVarInt   |
| bytes                       | UVarInt   |
| applied_limit               | Bool      |
| rows_before_limit           | UVarInt   |
| calculated_rows_before_limit| Bool      |

## Log {#log}

**数据块**包含服务器日志。

:::tip
编码为 **数据块** 的列，但永远不会被压缩。
:::

| 列名       | 类型      |
|------------|-----------|
| time       | DateTime  |
| time_micro | UInt32    |
| host_name  | String    |
| query_id   | String    |
| thread_id  | UInt64    |
| priority   | Int8      |
| source     | String    |
| text       | String    |

## Profile events {#profile-events}

**数据块**包含性能事件。

:::tip
编码为 **数据块** 的列，但永远不会被压缩。

`value` 类型为 `UInt64` 或 `Int64`，具体取决于服务器修订号。
:::

| 列名       | 类型               |
|------------|--------------------|
| host_name  | String             |
| current_time| DateTime         |
| thread_id  | UInt64             |
| type       | Int8               |
| name       | String             |
| value      | UInt64 或 Int64    |
