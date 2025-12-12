---
slug: /native-protocol/server
sidebar_position: 3
title: '服务器端数据包'
description: '原生协议服务器端'
doc_type: 'reference'
keywords: ['原生协议', 'TCP 协议', '客户端-服务器', '协议规范', '网络']
---

# 服务器数据包 {#server-packets}

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | 服务器握手响应                                                  |
| 1     | Data                             | 与 [client data](./client.md#data) 相同                         |
| 2     | [Exception](#exception)          | 查询处理异常                                                    |
| 3     | [Progress](#progress)            | 查询进度                                                        |
| 4     | [Pong](#pong)                    | Ping 响应                                                       |
| 5     | [EndOfStream](#end-of-stream)    | 所有数据包均已传输                                              |
| 6     | [ProfileInfo](#profile-info)     | 性能分析数据                                                    |
| 7     | Totals                           | 汇总值                                                          |
| 8     | Extremes                         | 极值（最小值、最大值）                                          |
| 9     | TablesStatusResponse             | 对 TableStatus 请求的响应                                       |
| 10    | [Log](#log)                      | 系统查询日志                                                    |
| 11    | TableColumns                     | 列信息                                                          |
| 12    | UUIDs                            | 唯一数据部分 ID 列表                                            |
| 13    | ReadTaskRequest                  | 用于描述需要获取下一个任务的请求的字符串（UUID）               |
| 14    | [ProfileEvents](#profile-events) | 来自服务器的性能统计事件数据包                                  |

`Data`、`Totals` 和 `Extremes` 可以压缩。

## Hello {#hello}

对[客户端 hello](./client.md#hello) 的响应。

| field         | type    | value           | description          |
|---------------|---------|-----------------|----------------------|
| name          | String  | `ClickHouse`    | 服务器名称           |
| version_major | UVarInt | `21`            | 服务器主版本号       |
| version_minor | UVarInt | `12`            | 服务器次版本号       |
| revision      | UVarInt | `54452`         | 服务器修订号         |
| tz            | String  | `Europe/Moscow` | 服务器时区           |
| display_name  | String  | `ClickHouse`    | UI 中显示的服务器名称 |
| version_patch | UVarInt | `3`             | 服务器补丁版本号     |

## 异常 {#exception}

查询处理期间的服务器异常。

| 字段        | 类型   | 值                                      | 描述                         |
|-------------|--------|-----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | 参见 [ErrorCodes.cpp][codes] |
| name        | String | `DB::Exception`                        | 服务器主版本                 |
| message     | String | `DB::Exception: Table X doesn't exist` | 服务器次版本                 |
| stack_trace | String | ~                                      | C++ 堆栈跟踪                 |
| nested      | Bool   | `true`                                 | 更多错误                     |

可以是一个连续的异常列表，直到 `nested` 为 `false` 为止。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "错误代码列表"

## 进度 {#progress}

服务器会定期上报查询执行的进度。

:::tip
进度以**增量**形式上报。若需汇总总量，请在客户端累加。
:::

| field       | type    | value    | description         |
|-------------|---------|----------|---------------------|
| rows        | UVarInt | `65535`  | 行数                |
| bytes       | UVarInt | `871799` | 字节数              |
| total_rows  | UVarInt | `0`      | 总行数              |
| wrote_rows  | UVarInt | `0`      | 来自客户端的行数    |
| wrote_bytes | UVarInt | `0`      | 来自客户端的字节数  |

## Pong {#pong}

对 [客户端 ping](./client.md#ping) 的响应，无数据包正文。

## 流结束 {#end-of-stream}

不再发送任何 **Data** 数据包，查询结果已从服务器完整地流式传输到客户端。

无数据包主体。

## 概要信息 {#profile-info}

| 字段                         | 类型    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## 日志 {#log}

包含服务器日志的 **数据块**。

:::tip
编码为按列存储的 **数据块**，但不会被压缩。
:::

| column     | type     |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |

## Profile events {#profile-events}

包含 **profile events** 的数据块。

:::tip
编码为列式的 **data block**，但不会被压缩。

`value` 的类型是 `UInt64` 或 `Int64`，取决于服务器修订版本。
:::

| column       | type            |
|--------------|-----------------|
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
