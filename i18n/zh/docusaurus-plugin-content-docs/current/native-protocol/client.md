---
'slug': '/native-protocol/client'
'sidebar_position': 2
'title': '原生客户端数据包'
'description': '原生协议客户端'
---


# 客户端数据包

| 值   | 名称               | 描述                    |
|------|--------------------|-------------------------|
| 0    | [Hello](#hello)    | 客户端握手开始         |
| 1    | [Query](#query)    | 查询请求                |
| 2    | [Data](#data)      | 包含数据的块          |
| 3    | [Cancel](#cancel)  | 取消查询                |
| 4    | [Ping](#ping)      | Ping 请求               |
| 5    | TableStatus        | 表状态请求             |

`Data` 可以被压缩。

## Hello {#hello}

例如，我们是 `Go Client` v1.10，支持 `54451` 协议版本，想要连接到 `default` 数据库，使用 `default` 用户和 `secret` 密码。

| 字段              | 类型    | 值            | 描述                        |
|-------------------|---------|----------------|-----------------------------|
| client_name       | 字符串  | `"Go Client"`  | 客户端实现名称             |
| version_major     | UVarInt | `1`            | 客户端主版本               |
| version_minor     | UVarInt | `10`           | 客户端次版本               |
| protocol_version   | UVarInt | `54451`       | TCP协议版本               |
| database           | 字符串  | `"default"`    | 数据库名称                 |
| username           | 字符串  | `"default"`    | 用户名                     |
| password           | 字符串  | `"secret"`     | 密码                       |

### 协议版本 {#protocol-version}

协议版本是客户端的TCP协议版本。

通常它与最新的兼容服务器修订版相同，但不应与之混淆。

### 默认值 {#defaults}

所有值应 **明确设置**，服务器端没有默认值。
在客户端，使用 `"default"` 数据库，`"default"` 用户名和 `""`（空字符串）密码作为默认值。

## 查询 {#query}

| 字段             | 类型                       | 值          | 描述                      |
|------------------|----------------------------|--------------|---------------------------|
| query_id         | 字符串                     | `1ff-a123`   | 查询ID，可以是UUIDv4       |
| client_info      | [ClientInfo](#client-info) | 见类型       | 客户端数据                |
| settings         | [Settings](#settings)      | 见类型       | 设置列表                  |
| secret           | 字符串                     | `secret`     | 服务器间秘密              |
| [stage](#stage)  | UVarInt                    | `2`          | 执行到查询阶段           |
| compression      | UVarInt                    | `0`          | 禁用=0, 启用=1            |
| body             | 字符串                     | `SELECT 1`   | 查询文本                  |

### 客户端信息 {#client-info}

| 字段               | 类型            | 描述                                |
|--------------------|-----------------|-------------------------------------|
| query_kind         | 字节            | None=0, Initial=1, Secondary=2     |
| initial_user       | 字符串          | 初始用户                             |
| initial_query_id   | 字符串          | 初始查询ID                          |
| initial_address    | 字符串          | 初始地址                            |
| initial_time       | Int64           | 初始时间                            |
| interface          | 字节            | TCP=1, HTTP=2                       |
| os_user            | 字符串          | 操作系统用户                        |
| client_hostname    | 字符串          | 客户端主机名                        |
| client_name        | 字符串          | 客户端名称                          |
| version_major      | UVarInt         | 客户端主版本                        |
| version_minor      | UVarInt         | 客户端次版本                        |
| protocol_version    | UVarInt         | 客户端协议版本                     |
| quota_key          | 字符串          | 配额键                              |
| distributed_depth  | UVarInt         | 分布深度                            |
| version_patch      | UVarInt         | 客户端补丁版本                      |
| otel               | 布尔值          | 跟踪字段是否存在                    |
| trace_id           | FixedString(16) | 跟踪ID                              |
| span_id            | FixedString(8)  | Span ID                             |
| trace_state        | 字符串          | 跟踪状态                            |
| trace_flags        | 字节            | 跟踪标志                            |

### 设置 {#settings}

| 字段     | 类型   | 值                    | 描述                       |
|----------|--------|-----------------------|-----------------------------|
| key      | 字符串 | `send_logs_level`     | 设置的键                   |
| value    | 字符串 | `trace`               | 设置的值                   |
| important| 布尔值 | `true`                | 可以被忽略与否             |

编码为列表，空键和值表示列表结束。

### 阶段 {#stage}

| 值   | 名称                 | 描述                                     |
|------|----------------------|------------------------------------------|
| 0    | FetchColumns         | 仅获取列类型                           |
| 1    | WithMergeableState   | 直到合并状态                            |
| 2    | Complete             | 直到完全完成（应为默认）                |

## 数据 {#data}

| 字段     | 类型                | 描述                     |
|----------|---------------------|--------------------------|
| info     | BlockInfo           | 编码的块信息             |
| columns  | UVarInt             | 列计数                   |
| rows     | UVarInt             | 行计数                   |
| columns  | [[]Column](#column) | 包含数据的列             |

### 列 {#column}

| 字段   | 类型   | 值                | 描述         |
|--------|--------|-------------------|--------------|
| name   | 字符串 | `foo`             | 列名称      |
| type   | 字符串 | `DateTime64(9)`   | 列类型      |
| data   | 字节   | ~                 | 列数据      |

## 取消 {#cancel}

无数据包主体。服务器应取消查询。

## Ping {#ping}

无数据包主体。服务器应 [响应 pong](./server.md#pong)。
