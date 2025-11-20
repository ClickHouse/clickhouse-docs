---
slug: /native-protocol/client
sidebar_position: 2
title: 'Native 协议客户端数据包'
description: 'Native 协议客户端'
doc_type: 'reference'
keywords: ['客户端数据包', 'Native 协议客户端', '协议数据包', '客户端通信', 'TCP 客户端']
---



# 客户端数据包

| value | name              | description    |
|-------|-------------------|----------------|
| 0     | [Hello](#hello)   | 客户端握手开始 |
| 1     | [Query](#query)   | 查询请求       |
| 2     | [Data](#data)     | 数据块         |
| 3     | [Cancel](#cancel) | 取消查询       |
| 4     | [Ping](#ping)     | Ping 请求      |
| 5     | TableStatus       | 表状态请求     |

`Data` 可以被压缩。



## Hello {#hello}

例如，我们使用支持 `54451` 协议版本的 `Go Client` v1.10，需要以 `default` 用户和 `secret` 密码连接到 `default` 数据库。

| field            | type    | value         | description                |
| ---------------- | ------- | ------------- | -------------------------- |
| client_name      | String  | `"Go Client"` | 客户端实现名称 |
| version_major    | UVarInt | `1`           | 客户端主版本号       |
| version_minor    | UVarInt | `10`          | 客户端次版本号       |
| protocol_version | UVarInt | `54451`       | TCP 协议版本       |
| database         | String  | `"default"`   | 数据库名称              |
| username         | String  | `"default"`   | 用户名                   |
| password         | String  | `"secret"`    | 密码                   |

### 协议版本 {#protocol-version}

协议版本是客户端的 TCP 协议版本。

通常它等于最新兼容的服务器修订版本，但不应将两者混淆。

### 默认值 {#defaults}

所有值都应**显式设置**，服务器端没有默认值。
在客户端，使用 `"default"` 数据库、`"default"` 用户名和 `""`（空字符串）密码作为默认值。


## Query（查询）{#query}

| field           | type                       | value      | description               |
| --------------- | -------------------------- | ---------- | ------------------------- |
| query_id        | String                     | `1ff-a123` | 查询 ID，可以是 UUIDv4   |
| client_info     | [ClientInfo](#client-info) | See type   | 客户端相关数据         |
| settings        | [Settings](#settings)      | See type   | 设置列表          |
| secret          | String                     | `secret`   | 服务器间密钥       |
| [stage](#stage) | UVarInt                    | `2`        | 执行到指定查询阶段 |
| compression     | UVarInt                    | `0`        | 禁用=0，启用=1     |
| body            | String                     | `SELECT 1` | 查询文本                |

### Client info（客户端信息）{#client-info}

| field             | type            | description                    |
| ----------------- | --------------- | ------------------------------ |
| query_kind        | byte            | 无=0，初始=1，次级=2 |
| initial_user      | String          | 初始用户                   |
| initial_query_id  | String          | 初始查询 ID               |
| initial_address   | String          | 初始地址                |
| initial_time      | Int64           | 初始时间                   |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | 操作系统用户                        |
| client_hostname   | String          | 客户端主机名                |
| client_name       | String          | 客户端名称                    |
| version_major     | UVarInt         | 客户端主版本号           |
| version_minor     | UVarInt         | 客户端次版本号           |
| protocol_version  | UVarInt         | 客户端协议版本        |
| quota_key         | String          | 配额键                      |
| distributed_depth | UVarInt         | 分布式深度              |
| version_patch     | UVarInt         | 客户端补丁版本号           |
| otel              | Bool            | 是否存在跟踪字段       |
| trace_id          | FixedString(16) | 跟踪 ID                       |
| span_id           | FixedString(8)  | Span ID                        |
| trace_state       | String          | 跟踪状态                  |
| trace_flags       | Byte            | 跟踪标志                  |

### Settings（设置）{#settings}

| field     | type   | value             | description           |
| --------- | ------ | ----------------- | --------------------- |
| key       | String | `send_logs_level` | 设置键        |
| value     | String | `trace`           | 设置值      |
| important | Bool   | `true`            | 是否可忽略 |

编码为列表，空白键和值表示列表结束。

### Stage（阶段）{#stage}

| value | name               | description                                 |
| ----- | ------------------ | ------------------------------------------- |
| 0     | FetchColumns       | 仅获取列类型                     |
| 1     | WithMergeableState | 执行到可合并状态                       |
| 2     | Complete           | 执行到完全完成（应为默认值） |


## 数据 {#data}

| 字段    | 类型                | 描述               |
| ------- | ------------------- | ------------------ |
| info    | BlockInfo           | 编码后的块信息     |
| columns | UVarInt             | 列数量             |
| rows    | UVarInt             | 行数量             |
| columns | [[]Column](#column) | 包含数据的列       |

### 列 {#column}

| 字段  | 类型   | 值              | 描述        |
| ----- | ------ | --------------- | ----------- |
| name  | String | `foo`           | 列名        |
| type  | String | `DateTime64(9)` | 列类型      |
| data  | bytes  | ~               | 列数据      |


## Cancel {#cancel}

无数据包体。服务器应取消查询。


## Ping {#ping}

无数据包正文。服务器应[返回 pong 响应](./server.md#pong)。
