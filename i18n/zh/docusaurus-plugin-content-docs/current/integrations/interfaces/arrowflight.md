---
description: 'ClickHouse 中 Apache Arrow Flight 接口的相关文档，用于让 Flight SQL 客户端连接到 ClickHouse'
sidebar_label: 'Arrow Flight 接口'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight 接口'
doc_type: 'reference'
---

# Apache Arrow Flight 接口 \{#apache-arrow-flight-interface\}

## 概述 \{#overview\}

ClickHouse 支持 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 协议。这是一种高性能 RPC 框架，可通过 [gRPC](https://grpc.io/) 使用 [Arrow IPC](https://arrow.apache.org/docs/format/Columnar.html#serialization-and-interprocess-communication-ipc) 格式高效传输列式数据。

该实现还支持 [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)，使支持 Flight SQL 协议的 BI 工具和应用程序能够直接查询 ClickHouse。

主要功能：

* 执行 SQL 查询，并以 Apache Arrow 格式返回结果。
* 使用 Arrow 格式将数据插入表中。
* 通过 Flight SQL 命令查询元数据 (目录、schema、表、主键) 。
* 通过 Flight SQL 操作管理会话和设置。
* 支持 TLS 加密以及用户名/密码身份验证。
* 通过 `PollFlightInfo` 增量获取结果。
* 通过 `CancelFlightInfo` 取消查询。

## 启用 Arrow Flight 服务器 \{#enabling-server\}

要启用 Arrow Flight 服务器，请在 ClickHouse 服务端配置中添加 `arrowflight_port` 设置：

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
</clickhouse>
```

启动时，日志中会出现一条消息，确认该接口已启用：

```text
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9090
```

## TLS 配置 \{#tls-configuration\}

要为 Arrow Flight 接口启用 TLS，请配置以下设置项：

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
    <arrowflight>
        <enable_ssl>true</enable_ssl>
        <ssl_cert_file>/path/to/server-cert.pem</ssl_cert_file>
        <ssl_key_file>/path/to/server-key.pem</ssl_key_file>
    </arrowflight>
</clickhouse>
```

启用 TLS 时，客户端必须使用 `grpc+tls://` 而非 `grpc://` 进行连接。

## 身份验证 \{#authentication\}

Arrow Flight 接口支持两种身份验证方法：

### 基本身份验证 \{#basic-auth\}

客户端通过标准 HTTP `Authorization: Basic` 头部信息，使用用户名和密码进行身份验证。身份验证成功后，服务器会在响应头部信息中返回 Bearer 令牌。

### Bearer 令牌身份验证 \{#bearer-auth\}

后续请求可以通过 `Authorization: Bearer <token>` 头部信息使用通过 Basic 身份验证返回的 Bearer 令牌。该令牌每次使用时都会自动刷新，并会根据 `default_session_timeout` 服务器设置过期 (默认值为 60 秒) 。

### Python 示例 \{#auth-python-example\}

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:9090")

# Basic auth returns a bearer token for subsequent calls
token_pair = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token_pair])
```

启用 TLS：

```python
import pyarrow.flight as flight

with open("ca-cert.pem", "rb") as f:
    tls_root_certs = f.read()

client = flight.FlightClient(
    "grpc+tls://localhost:9090",
    tls_root_certs=tls_root_certs,
)

token_pair = client.authenticate_basic_token("default", "password")
options = flight.FlightCallOptions(headers=[token_pair])
```

## 会话管理 \{#session-management\}

Arrow Flight 接口支持通过自定义 gRPC 元数据头部信息使用 ClickHouse 会话：

| Header                         | Description                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `x-clickhouse-session-id`      | 会话标识符。提供后，多个请求将共享同一会话状态 (临时表、设置) 。                                     |
| `x-clickhouse-session-timeout` | 会话超时 (秒) 。不得超过 `max_session_timeout`。                                  |
| `x-clickhouse-session-check`   | 设置为 `1` 以在不创建会话的情况下检查该会话是否存在。                                          |
| `x-clickhouse-session-close`   | 设置为 `1` 以在请求完成后关闭会话。需要在服务器配置中将 `enable_arrow_close_session` 设为 `true`。 |

:::note
由于 Arrow Flight 通过 HTTP/2 之上的 gRPC 运行，因此元数据头部信息名称区分大小写，且必须严格按示例使用全小写形式 (例如 `x-clickhouse-session-id`，而不是 `X-ClickHouse-Session-Id`) 。这是 [RFC 9113 第 8.2 节](https://www.rfc-editor.org/rfc/rfc9113#section-8.2) 的要求；该规范规定 HTTP/2 字段名只能包含小写字符。这一点与 HTTP/1.1 不同，后者中的头部信息名称不区分大小写。
:::

会话支持通过 `SetSessionOptions` 操作为 ClickHouse 设置持久生效的设置项 (参见 [DoAction](#doaction)) 。

## 服务器配置参考 \{#configuration-reference\}

| 设置项                                                           | 默认值     | 描述                                                      |
| ------------------------------------------------------------- | ------- | ------------------------------------------------------- |
| `arrowflight_port`                                            | —       | Arrow Flight 服务器的端口。仅在指定此设置时，服务器才会启动。                   |
| `arrowflight.enable_ssl`                                      | `false` | 启用 TLS 加密。                                              |
| `arrowflight.ssl_cert_file`                                   | —       | TLS 证书文件的路径。启用 TLS 时必需。                                 |
| `arrowflight.ssl_key_file`                                    | —       | TLS 私钥文件的路径。启用 TLS 时必需。                                 |
| `arrowflight.tickets_lifetime_seconds`                        | `600`   | Flight ticket 过期并清理前的时间 (秒) 。设置为 `0` 可禁用 ticket 自动过期。   |
| `arrowflight.cancel_ticket_after_do_get`                      | `false` | 如果为 `true`，ticket 在被 `DoGet` 消耗后会立即取消，以释放内存。            |
| `arrowflight.poll_descriptors_lifetime_seconds`               | `600`   | poll descriptor 过期前的时间 (秒) 。设置为 `0` 可禁用自动过期。            |
| `arrowflight.cancel_flight_descriptor_after_poll_flight_info` | `false` | 如果为 `true`，poll descriptor 在被 `PollFlightInfo` 消耗后会被取消。 |
| `enable_arrow_close_session`                                  | `true`  | 允许客户端通过 `x-clickhouse-session-close` 头部信息关闭会话。           |
| `default_session_timeout`                                     | `60`    | 默认会话超时时间 (秒) 。同时也控制 Bearer token 的过期时间。                 |
| `max_session_timeout`                                         | `3600`  | 允许的最大会话超时时间 (秒) 。                                       |

## 受支持的 RPC 方法 \{#rpc-methods\}

### GetFlightInfo \{#getflightinfo\}

执行查询，并返回一个 `FlightInfo`，其中包含结果 schema、用于数据提取且附带 ticket 的端点、行数以及字节数。

接受一个 `FlightDescriptor`，其可以是：

* **PATH 描述符**：单部分路径，会被解释为表名。将生成 `SELECT * FROM <table>`。
* **CMD 描述符**：原始 SQL 查询字符串，或序列化后的 Flight SQL protobuf 命令 (参见 [Flight SQL Commands](#flight-sql-commands)) 。

查询会被完整执行，结果存储在服务器端 ticket 中。每个数据块都会生成单独的端点/ticket，使客户端能够并行提取数据。

```python
# Query by table name
descriptor = flight.FlightDescriptor.for_path("my_table")
info = client.get_flight_info(descriptor, options)

# Query by SQL
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM my_table WHERE id > 100"
)
info = client.get_flight_info(descriptor, options)

# Retrieve results
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

### PollFlightInfo \{#pollflightinfo\}

支持对长时间运行的查询进行增量结果检索。与 `GetFlightInfo` 需要等待整个查询完成不同，`PollFlightInfo` 会按块返回结果。

首次调用时，查询会开始执行。响应包括：

* 一个 `FlightInfo`，其中包含当前已可用数据块的端点。
* 用于下一次轮询的 `FlightDescriptor` (如果预计还会有更多结果) 。

后续使用返回的描述符再次调用时，会检索到更多块。当没有更多数据可用时，响应中将不再包含下一个描述符。

:::note
当前实现会一直阻塞，直到有数据块可用，而不是在没有数据时立即返回。
:::

### GetSchema \{#getschema\}

返回查询结果的 Arrow schema，而无需执行完整的查询。接受与 `GetFlightInfo` 相同的 描述符 类型。

```python
descriptor = flight.FlightDescriptor.for_command(
    "SELECT 1 AS x, 'hello' AS y"
)
schema_result = client.get_schema(descriptor, options)
schema = schema_result.schema
print(schema)  # x: int32, y: string
```

### DoGet \{#doget\}

获取给定 ticket 的数据。接受以下任一项：

* 由 `GetFlightInfo` 或 `PollFlightInfo` 返回的 ticket。
* 将原始 SQL 查询字符串作为 ticket 值。

```python
# Using a ticket from GetFlightInfo
reader = client.do_get(endpoint.ticket, options)
table = reader.read_all()

# Using a raw SQL query as ticket
ticket = flight.Ticket("SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket, options)
table = reader.read_all()
```

### DoPut \{#doput\}

将数据发送到 ClickHouse。接收一个 `FlightDescriptor` 和 Arrow 记录批次流。

**按表名插入** (PATH 描述符) ：

```python
schema = pa.schema([("id", pa.int64()), ("name", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3]), pa.array(["Alice", "Bob", "Charlie"])],
    schema=schema,
)

descriptor = flight.FlightDescriptor.for_path("my_table")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**使用 SQL 插入** (CMD 描述符) ：

```python
descriptor = flight.FlightDescriptor.for_command(
    "INSERT INTO my_table FORMAT Arrow"
)
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**通过 Flight SQL `CommandStatementUpdate` 执行 DDL/DML 语句：**

Flight SQL 客户端使用 `CommandStatementUpdate` 执行 DDL/DML 语句 (CREATE、INSERT、ALTER 等) 。响应中包含受影响的行数。

**通过 Flight SQL `CommandStatementIngest` 进行批量摄取：**

仅支持追加到现有表 (`TABLE_NOT_EXIST_OPTION_FAIL` + `TABLE_EXISTS_OPTION_APPEND`) 。此命令不支持目录和临时表。

:::note
数据传输仅接受 `Arrow` 格式。在 SQL 中指定其他格式 (例如 `FORMAT JSON`) 会导致错误。
:::

### DoAction \{#doaction\}

执行命名操作。支持以下操作：

#### CancelFlightInfo \{#cancelflightinfo\}

取消与 `FlightInfo` 关联的正在运行中的查询。查询 ID 从 `FlightInfo` 的 `app_metadata` 字段中提取。还会取消与该查询相关联的所有轮询描述符。

```python
# Start a long-running query via PollFlightInfo, then cancel it
cancel_request = flight.CancelFlightInfoRequest(info)
result = client.cancel_flight_info(cancel_request, options)
# result.status is CancelStatus.CANCELLED if successful
```

#### SetSessionOptions \{#setsessionoptions\}

为当前会话设置 ClickHouse 服务端设置项。需要先通过 `x-clickhouse-session-id` 请求头设置会话 ID。

支持的值类型：string、boolean、integer、double 以及字符串列表。

如果设置名称未知，则返回错误 `INVALID_NAME`。如果值无法解析，则返回错误 `INVALID_VALUE`。

#### GetSessionOptions \{#getsessionoptions\}

返回当前会话中的所有 ClickHouse 设置及其值。返回一个从设置名称到字符串值的映射 (内部会查询 `system.settings`) 。

## Flight SQL 命令 \{#flight-sql-commands\}

当 `CMD` 描述符包含序列化的 [Flight SQL protobuf](https://arrow.apache.org/docs/format/FlightSql.html) 消息时，ClickHouse 处理以下命令：

### 通过 GetFlightInfo / GetSchema 支持的命令 \{#flightsql-getflightinfo\}

| 命令                      | 说明                                                       |
| ----------------------- | -------------------------------------------------------- |
| `CommandStatementQuery` | 执行任意 SQL 查询。                                             |
| `CommandGetSqlInfo`     | 获取服务器元数据 (名称、版本、Arrow 版本、功能) 。                           |
| `CommandGetCatalogs`    | 列出目录。返回空结果 (ClickHouse 不使用目录) 。                          |
| `CommandGetDbSchemas`   | 列出数据库。支持可选的 `db_schema_filter_pattern` (SQL `LIKE` 模式) 。 |
| `CommandGetTables`      | 列出表。支持按 schema、表名和表类型筛选，并可选择是否包含 schema。                 |
| `CommandGetTableTypes`  | 列出表引擎类型 (来自 `system.table_engines`) 。                    |
| `CommandGetPrimaryKeys` | 获取指定表的主键列。                                               |

### 通过 DoPut 支持的命令 \{#flightsql-doput\}

| Command                  | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `CommandStatementUpdate` | 执行 DDL/DML 文 (CREATE、INSERT、ALTER 等) 。返回受影响的行数。 |
| `CommandStatementIngest` | 将 Arrow 数据批量插入现有表中。仅支持追加模式。                     |

### 尚未实现 \{#flightsql-not-implemented\}

| 命令                               | 状态                    |
| -------------------------------- | --------------------- |
| `CommandGetCrossReference`       | 尚未实现                  |
| `CommandGetExportedKeys`         | 尚未实现                  |
| `CommandGetImportedKeys`         | 尚未实现                  |
| `CommandStatementSubstraitPlan`  | 不支持 (Substrait 不受支持)  |
| `CommandPreparedStatementQuery`  | 尚未实现                  |
| `CommandPreparedStatementUpdate` | 尚未实现                  |

## 完整示例 \{#complete-example\}

```python
import pyarrow as pa
import pyarrow.flight as flight

# Connect and authenticate
client = flight.FlightClient("grpc://localhost:9090")
token = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token])

# Insert data using DoPut with a PATH descriptor
schema = pa.schema([("id", pa.uint32()), ("value", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3], type=pa.uint32()), pa.array(["a", "b", "c"])],
    schema=schema,
)
descriptor = flight.FlightDescriptor.for_path("test")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()

# Query data using GetFlightInfo + DoGet
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM test ORDER BY id"
)
info = client.get_flight_info(descriptor, options)
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

输出：

```text
   id value
0   1     a
1   2     b
2   3     c
```

## 数据格式 \{#data-format\}

所有数据都以 Apache Arrow IPC 格式传输。仅支持 `Arrow` 格式；如果指定其他 ClickHouse 格式 (例如 `FORMAT JSON`、`FORMAT CSV`) ，则会报错。

序列化时，ClickHouse 数据类型会映射为 Arrow 类型。设置 `output_format_arrow_unsupported_types_as_binary` 用于控制是否将不受支持的 ClickHouse 类型序列化为二进制 blob。

## 兼容性 \{#compatibility\}

Arrow Flight 接口兼容任何支持 Arrow Flight 或 Arrow Flight SQL 协议的客户端或工具，包括：

* Python (`pyarrow`)
* Java (`org.apache.arrow.flight`)
* C++ (`arrow::flight`)
* Go (`apache/arrow/go`)
* ADBC (Arrow Database Connectivity) 驱动
* DBeaver 以及其他支持 Flight SQL 的工具

如果你的工具有原生 ClickHouse 连接器 (例如 JDBC、ODBC、原生协议) ，应优先使用该连接器，除非因性能或格式兼容性而明确需要 Arrow Flight。

## 客户端 ArrowFlight 功能 \{#client-side\}

ClickHouse 也可以充当 Flight 客户端，从外部 Arrow Flight 服务器读取数据。请参阅：

* [ArrowFlight 表引擎](/engines/table-engines/integrations/arrowflight)
* [arrowFlight 表函数](/sql-reference/table-functions/arrowflight)

## 另请参见 \{#see-also\}

* [Apache Arrow Flight 规范](https://arrow.apache.org/docs/format/Flight.html)
* [Apache Arrow Flight SQL 规范](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse 中的 Arrow 格式](/interfaces/formats/Arrow)