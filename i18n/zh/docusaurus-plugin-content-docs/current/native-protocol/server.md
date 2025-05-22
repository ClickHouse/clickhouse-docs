---
'slug': '/native-protocol/server'
'sidebar_position': 3
'title': '服务器数据包'
'description': '原生协议服务器'
---


# 服务器数据包

| 值     | 名称                             | 描述                                                         |
|-------|----------------------------------|--------------------------------------------------------------|
| 0     | [Hello](#hello)                  | 服务器握手响应                                               |
| 1     | Data                             | 与 [客户端数据](./client.md#data) 相同                          |
| 2     | [Exception](#exception)          | 查询处理异常                                               |
| 3     | [Progress](#progress)            | 查询进度                                                   |
| 4     | [Pong](#pong)                    | Ping 响应                                                  |
| 5     | [EndOfStream](#end-of-stream)    | 所有数据包已传输                                           |
| 6     | [ProfileInfo](#profile-info)     | 性能数据                                                   |
| 7     | Totals                           | 总值                                                       |
| 8     | Extremes                         | 极值（最小值，最大值）                                      |
| 9     | TablesStatusResponse             | 对 TableStatus 请求的响应                                   |
| 10    | [Log](#log)                      | 查询系统日志                                               |
| 11    | TableColumns                     | 列描述                                                     |
| 12    | UUIDs                            | 唯一部分 ID 列表                                           |
| 13    | ReadTaskRequest                  | 字符串（UUID）描述需要下一个任务的请求                     |
| 14    | [ProfileEvents](#profile-events) | 服务器发送的性能事件的数据包                               |

`Data`、`Totals` 和 `Extremes` 可以被压缩。

## Hello {#hello}

对 [客户端 hello](./client.md#hello) 的响应。

| 字段         | 类型    | 值               | 描述                  |
|---------------|---------|-----------------|----------------------|
| name          | 字符串  | `Clickhouse`    | 服务器名称           |
| version_major | UVarInt | `21`            | 服务器主版本         |
| version_minor | UVarInt | `12`            | 服务器次版本         |
| revision      | UVarInt | `54452`         | 服务器修订号         |
| tz            | 字符串  | `Europe/Moscow` | 服务器时区           |
| display_name  | 字符串  | `Clickhouse`    | UI 中的服务器名称    |
| version_patch | UVarInt | `3`             | 服务器补丁版本       |


## Exception {#exception}

查询处理期间的服务器异常。

| 字段       | 类型   | 值                                    | 描述                        |
|-------------|--------|----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | 参见 [ErrorCodes.cpp][codes]。 |
| name        | 字符串 | `DB::Exception`                        | 服务器主要版本              |
| message     | 字符串 | `DB::Exception: 表 X 不存在`           | 服务器次版本                |
| stack_trace | 字符串 | ~                                      | C++ 栈跟踪                  |
| nested      | 布尔   | `true`                                 | 更多错误                    |

可以是连续的异常列表，直到 `nested` 为 `false`。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "错误代码列表"

## Progress {#progress}

服务器定期报告的查询执行进度。

:::tip
进度以 **增量** 形式报告。对于总值，请在客户端进行累积。
:::

| 字段       | 类型    | 值       | 描述             |
|-------------|---------|----------|-------------------|
| rows        | UVarInt | `65535`  | 行数             |
| bytes       | UVarInt | `871799` | 字节数           |
| total_rows  | UVarInt | `0`      | 总行数           |
| wrote_rows  | UVarInt | `0`      | 客户端发送的行数 |
| wrote_bytes | UVarInt | `0`      | 客户端发送的字节数 |

## Pong {#pong}

对 [客户端 ping](./client.md#ping) 的响应，无数据包主体。

## End of stream {#end-of-stream}

不会再发送更多 **Data** 数据包，查询结果已从服务器完全传输到客户端。

无数据包主体。

## Profile info {#profile-info}

| 字段                        | 类型    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | 布尔    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | 布尔    |

## Log {#log}

**数据块**，包含服务器日志。

:::tip
编码为 **数据块** 列的形式，但从不压缩。
:::

| 列        | 类型     |
|-----------|----------|
| time      | DateTime |
| time_micro| UInt32   |
| host_name | 字符串   |
| query_id  | 字符串   |
| thread_id | UInt64   |
| priority  | Int8     |
| source    | 字符串   |
| text      | 字符串   |

## Profile events {#profile-events}

**数据块**，包含性能事件。

:::tip
编码为 **数据块** 列的形式，但从不压缩。

`value` 类型为 `UInt64` 或 `Int64`，具体取决于服务器修订号。
:::

| 列          | 类型            |
|-------------|-----------------|
| host_name   | 字符串          |
| current_time| DateTime        |
| thread_id   | UInt64          |
| type        | Int8            |
| name        | 字符串          |
| value       | UInt64 或 Int64 |
