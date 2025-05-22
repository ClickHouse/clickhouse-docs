---
'slug': '/native-protocol/server'
'sidebar_position': 3
'title': '服务器数据包'
'description': '本地协议服务器'
---


# 服务器数据包

| 值     | 名称                              | 描述                                                         |
|--------|----------------------------------|--------------------------------------------------------------|
| 0      | [Hello](#hello)                  | 服务器握手响应                                               |
| 1      | 数据                             | 与 [client data](./client.md#data) 相同                       |
| 2      | [Exception](#exception)          | 查询处理异常                                                |
| 3      | [Progress](#progress)            | 查询进度                                                    |
| 4      | [Pong](#pong)                    | Ping 响应                                                   |
| 5      | [EndOfStream](#end-of-stream)    | 所有数据包已传输                                           |
| 6      | [ProfileInfo](#profile-info)     | 性能数据                                                    |
| 7      | Totals                           | 总值                                                        |
| 8      | Extremes                         | 极端值（最小值、最大值）                                    |
| 9      | TablesStatusResponse             | 对 TableStatus 请求的响应                                   |
| 10     | [Log](#log)                      | 查询系统日志                                                |
| 11     | TableColumns                     | 列描述                                                     |
| 12     | UUIDs                            | 唯一部分 ID 的列表                                          |
| 13     | ReadTaskRequest                  | 字符串（UUID）描述需要下一个任务的请求                  |
| 14     | [ProfileEvents](#profile-events) | 包含服务器的性能事件                                        |

`数据`、`总值`和`极端值`可以被压缩。

## Hello {#hello}

对 [client hello](./client.md#hello) 的响应。

| 字段         | 类型     | 值              | 描述                     |
|--------------|----------|------------------|--------------------------|
| 名称         | 字符串   | `Clickhouse`     | 服务器名称               |
| 主要版本     | UVarInt  | `21`             | 服务器主要版本          |
| 次要版本     | UVarInt  | `12`             | 服务器次要版本          |
| 修订版       | UVarInt  | `54452`          | 服务器修订版            |
| 时区         | 字符串   | `Europe/Moscow`  | 服务器时区               |
| 显示名称     | 字符串   | `Clickhouse`     | 服务器在 UI 中的名称     |
| 补丁版本     | UVarInt  | `3`              | 服务器补丁版本          |


## Exception {#exception}

查询处理期间的服务器异常。

| 字段       | 类型    | 值                                    | 描述                      |
|------------|---------|----------------------------------------|---------------------------|
| 代码       | Int32   | `60`                                   | 见 [ErrorCodes.cpp][codes]。 |
| 名称       | 字符串  | `DB::Exception`                        | 服务器主版本              |
| 消息       | 字符串  | `DB::Exception: 表 X 不存在`            | 服务器次要版本            |
| 堆栈跟踪   | 字符串  | ~                                      | C++ 堆栈跟踪              |
| 嵌套       | 布尔    | `true`                                 | 更多错误                  |

在`嵌套`为`false`之前，可以是连续的异常列表。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "错误代码列表"

## Progress {#progress}

查询执行进度由服务器定期报告。

:::tip
报告的进度为 **增量**。对于总数，在客户端累加。
:::

| 字段       | 类型     | 值       | 描述                 |
|------------|----------|-----------|----------------------|
| 行数       | UVarInt  | `65535`   | 行数                |
| 字节数     | UVarInt  | `871799`  | 字节数               |
| 总行数     | UVarInt  | `0`       | 总行数               |
| 从客户端写入的行 | UVarInt  | `0`      | 从客户端写入的行    |
| 从客户端写入的字节 | UVarInt  | `0`      | 从客户端写入的字节  |

## Pong {#pong}

对 [client ping](./client.md#ping) 的响应，没有数据包体。

## 数据流结束 {#end-of-stream}

不会再发送 **数据** 数据包，查询结果已从服务器完全流式传输到客户端。

没有数据包体。

## Profile info {#profile-info}

| 字段                          | 类型     |
|-------------------------------|----------|
| 行数                          | UVarInt  |
| 块数                          | UVarInt  |
| 字节数                        | UVarInt  |
| 应用限制                      | 布尔     |
| 限制前的行数                  | UVarInt  |
| 限制前计算的行数              | 布尔     |

## Log {#log}

**数据块**，包含服务器日志。

:::tip
编码为 **数据块** 的列，但从未被压缩。
:::

| 列         | 类型     |
|------------|----------|
| 时间       | DateTime |
| 微秒时间   | UInt32   |
| 主机名     | 字符串   |
| 查询 ID    | 字符串   |
| 线程 ID    | UInt64   |
| 优先级     | Int8     |
| 来源       | 字符串   |
| 文本       | 字符串   |

## Profile events {#profile-events}

**数据块**，包含性能事件。

:::tip
编码为 **数据块** 的列，但从未被压缩。

`值` 类型为 `UInt64` 或 `Int64`，取决于服务器修订版。
:::


| 列           | 类型            |
|--------------|-----------------|
| 主机名       | 字符串          |
| 当前时间     | DateTime        |
| 线程 ID      | UInt64          |
| 类型         | Int8            |
| 名称         | 字符串          |
| 值           | UInt64 或 Int64 |
