---
'slug': '/native-protocol/client'
'sidebar_position': 2
'title': '本地客户端数据包'
'description': '本地协议客户端'
'doc_type': 'reference'
---


# 客户端数据包

| value | name              | description            |
|-------|-------------------|------------------------|
| 0     | [Hello](#hello)   | 客户端握手开始         |
| 1     | [Query](#query)   | 查询请求               |
| 2     | [Data](#data)     | 带有数据的块           |
| 3     | [Cancel](#cancel) | 取消查询               |
| 4     | [Ping](#ping)     | Ping 请求              |
| 5     | TableStatus       | 表状态请求             |

`Data` 可以被压缩。

## Hello {#hello}

例如，我们是 `Go Client` v1.10，支持 `54451` 协议版本，并希望连接到 `default` 数据库，使用 `default` 用户和 `secret` 密码。

| field            | type    | value         | description                |
|------------------|---------|---------------|----------------------------|
| client_name      | String  | `"Go Client"` | 客户端实现名称            |
| version_major    | UVarInt | `1`           | 客户端主版本              |
| version_minor    | UVarInt | `10`          | 客户端次版本              |
| protocol_version | UVarInt | `54451`       | TCP 协议版本              |
| database         | String  | `"default"`   | 数据库名称                |
| username         | String  | `"default"`   | 用户名                    |
| password         | String  | `"secret"`    | 密码                      |

### 协议版本 {#protocol-version}

协议版本是客户端的 TCP 协议版本。

通常它等于最新兼容的服务器版本，但不应与其混淆。

### 默认值 {#defaults}

所有值应 **明确设置**，服务器端没有默认值。
在客户端，使用 `"default"` 数据库、`"default"` 用户名和 `""`（空字符串）作为默认值。

## 查询 {#query}

| field           | type                       | value      | description               |
|-----------------|----------------------------|------------|---------------------------|
| query_id        | String                     | `1ff-a123` | 查询 ID，可以是 UUIDv4    |
| client_info     | [ClientInfo](#client-info) | 见类型     | 有关客户端的数据          |
| settings        | [Settings](#settings)      | 见类型     | 设置列表                  |
| secret          | String                     | `secret`   | 服务器间秘密              |
| [stage](#stage) | UVarInt                    | `2`        | 在查询阶段执行          |
| compression     | UVarInt                    | `0`        | 禁用=0，启用=1           |
| body            | String                     | `SELECT 1` | 查询文本                  |

### 客户端信息 {#client-info}

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | 初始用户                      |
| initial_query_id  | String          | 初始查询 ID                   |
| initial_address   | String          | 初始地址                      |
| initial_time      | Int64           | 初始时间                      |
| interface         | byte            | TCP=1, HTTP=2                 |
| os_user           | String          | 操作系统用户                  |
| client_hostname   | String          | 客户端主机名                  |
| client_name       | String          | 客户端名称                    |
| version_major     | UVarInt         | 客户端主版本                  |
| version_minor     | UVarInt         | 客户端次版本                  |
| protocol_version  | UVarInt         | 客户端协议版本                |
| quota_key         | String          | 配额键                        |
| distributed_depth | UVarInt         | 分布深度                      |
| version_patch     | UVarInt         | 客户端补丁版本                |
| otel              | Bool            | 追踪字段是否存在              |
| trace_id          | FixedString(16) | 追踪 ID                       |
| span_id           | FixedString(8)  | Span ID                        |
| trace_state       | String          | 追踪状态                      |
| trace_flags       | Byte            | 追踪标志                      |

### 设置 {#settings}

| field     | type   | value             | description           |
|-----------|--------|-------------------|-----------------------|
| key       | String | `send_logs_level` | 设置的键              |
| value     | String | `trace`           | 设置的值              |
| important | Bool   | `true`            | 可以忽略与否          |

以列表编码，空键和空值表示列表的结束。

### 阶段 {#stage}

| value | name               | description                                 |
|-------|--------------------|---------------------------------------------|
| 0     | FetchColumns       | 仅获取列类型                               |
| 1     | WithMergeableState | 直到可合并状态                             |
| 2     | Complete           | 直到完全完整（应为默认）                   |

## 数据 {#data}

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | 编码块信息        |
| columns | UVarInt             | 列计数            |
| rows    | UVarInt             | 行计数            |
| columns | [[]Column](#column) | 带数据的列        |

### 列 {#column}

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | 列名称      |
| type  | String | `DateTime64(9)` | 列类型      |
| data  | bytes  | ~               | 列数据      |

## 取消 {#cancel}

没有数据包主体。服务器应取消查询。

## Ping {#ping}

没有数据包主体。服务器应 [以 pong 响应](./server.md#pong)。
