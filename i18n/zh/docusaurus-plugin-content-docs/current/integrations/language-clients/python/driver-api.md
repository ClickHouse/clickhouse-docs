---
sidebar_label: '驱动 API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect 驱动程序 API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect 驱动程序 API'
doc_type: 'reference'
---

# ClickHouse Connect 驱动 API {#clickhouse-connect-driver-api}

:::note
考虑到大多数 API 方法都可能接受大量参数，而且大部分都是可选参数，建议使用关键字参数进行传递。

*此处未记录的方法不视为 API 的一部分，可能会被移除或更改。*
:::

## 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类为 Python 应用程序与 ClickHouse 数据库服务器之间提供主要接口。使用 `clickhouse_connect.get_client` 函数获取一个 Client 实例，该实例接受以下参数：

### Connection arguments {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | 必须为 http 或 https。                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | ClickHouse 服务器的主机名或 IP 地址。如果未设置，将使用 `localhost`。                                                                                                                                                                                 |
| port                     | int         | 8123 or 8443                  | ClickHouse 的 HTTP 或 HTTPS 端口。如果未设置，默认端口为 8123；如果 *secure*=*True* 或 *interface*=*https*，则默认端口为 8443。                                                                                                                        |
| username                 | str         | default                       | ClickHouse 用户名。如果未设置，将使用 `default` ClickHouse 用户。                                                                                                                                                                                    |
| password                 | str         | *&lt;empty string&gt;*        | *username* 对应的密码。                                                                                                                                                                                                                               |
| database                 | str         | *None*                        | 该连接的默认数据库。如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                                                  |
| secure                   | bool        | False                         | 使用 HTTPS/TLS。此参数会覆盖从 interface 或 port 参数推断出的值。                                                                                                                                                                                    |
| dsn                      | str         | *None*                        | 符合标准 DSN（Data Source Name，数据源名称）格式的字符串。如果其他连接参数（例如 host 或 user）未设置，将从该字符串中提取。                                                                                                                          |
| compress                 | bool or str | True                          | 为 ClickHouse HTTP 插入和查询结果启用压缩。参见 [Additional Options (Compression)](additional-options.md#compression)                                                                                                                                |
| query_limit              | int         | 0 (unlimited)                 | 单次 `query` 响应返回的最大行数。将该值设置为 0 表示返回的行数不受限制。注意，如果未以流式方式获取结果，而是一次性将所有结果加载到内存中，过大的返回行数限制可能会导致内存不足异常。                                                                |
| query_retries            | int         | 2                             | `query` 请求的最大重试次数。仅会重试“可重试”的 HTTP 响应。为了避免产生意外的重复请求，驱动程序不会自动重试 `command` 或 `insert` 请求。                                                                                                              |
| connect_timeout          | int         | 10                            | HTTP 连接超时时间，单位为秒。                                                                                                                                                                                                                        |
| send_receive_timeout     | int         | 300                           | HTTP 连接的发送/接收超时时间，单位为秒。                                                                                                                                                                                                              |
| client_name              | str         | *None*                        | 会作为前缀添加到 HTTP User Agent 头部的 client_name。设置该值以便在 ClickHouse 的 system.query_log 中跟踪客户端查询。                                                                                                                                |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 要使用的 `urllib3` 库 PoolManager。适用于需要针对不同主机使用多个连接池的高级用例。                                                                                                                                                                  |
| http_proxy               | str         | *None*                        | HTTP 代理地址（等价于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                                    |
| https_proxy              | str         | *None*                        | HTTPS 代理地址（等价于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                                                  |
| apply_server_timezone    | bool        | True                          | 对具备时区信息的查询结果使用服务器时区。参见 [Timezone Precedence](advanced-querying.md#time-zones)                                                                                                                                                   |
| show_clickhouse_errors   | bool        | True                          | 在客户端异常中包含详细的 ClickHouse 服务器错误信息和异常代码。                                                                                                                                                                                       |
| autogenerate_session_id  | bool        | *None*                        | 覆盖全局 `autogenerate_session_id` 设置。如果为 True，在未显式提供会话 ID 时自动生成 UUID4 会话 ID。                                                                                                                                                 |
| proxy_path               | str         | &lt;empty string&gt;          | 为代理配置添加到 ClickHouse 服务器 URL 的可选路径前缀。                                                                                                                                                                                              |
| form_encode_query_params | bool        | False                         | 将查询参数作为表单编码数据放入请求体，而不是 URL 参数。对于参数数量较多、可能超出 URL 长度限制的查询场景非常有用。                                                                                                                                  |
| rename_response_column   | str         | *None*                        | 可选的回调函数或列名映射，用于在查询结果中重命名响应列。                                                                                                                                                                                             |

### HTTPS/TLS 参数 {#httpstls-arguments}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | 使用 HTTPS/TLS 时，验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、到期时间等）。                                                                                                                                                                                                   |
| ca_cert          | str  | *None*  | 如果 *verify*=*True*，则指定用于验证 ClickHouse 服务器证书的证书颁发机构（CA）根证书文件路径，格式为 .pem。如果 verify 为 False，则忽略本参数。如果 ClickHouse 服务器证书的根证书已作为全局信任根证书由操作系统信任，则无需设置本参数。                                          |
| client_cert      | str  | *None*  | TLS 客户端证书文件路径，格式为 .pem（用于双向 TLS 认证）。文件应包含完整的证书链，包括所有中间证书。                                                                                                                                                                              |
| client_cert_key  | str  | *None*  | 客户端证书对应的私钥文件路径。如果私钥未包含在客户端证书文件中，则必须设置此参数。                                                                                                                                                                                               |
| server_host_name | str  | *None*  | 由其 TLS 证书中的 CN 或 SNI 标识的 ClickHouse 服务器主机名。当通过使用不同主机名的代理或隧道进行连接时，为避免 SSL 错误，请设置该参数。                                                                                                                                              |
| tls_mode         | str  | *None*  | 控制高级 TLS 行为。`proxy` 和 `strict` 不会发起 ClickHouse 双向 TLS 连接，但会发送客户端证书和私钥。`mutual` 假定使用客户端证书进行 ClickHouse 双向 TLS 认证。*None*/默认行为等同于 `mutual`。                                               |

### Settings 参数 {#settings-argument}

最后，`get_client` 的 `settings` 参数用于为每个客户端请求向服务器传递额外的 ClickHouse 设置。请注意，在大多数情况下，具有 *readonly*=*1* 访问权限的用户无法更改随查询发送的设置，因此 ClickHouse Connect 会在最终请求中丢弃此类设置并记录警告日志。下列设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话，在通用的 ClickHouse 设置文档中并未单独说明。

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（字节）。                                                                                                 |
| session_id        | 用于在服务器上关联相关查询的唯一会话 ID。临时表需要此参数。                                                                                                     |
| compress          | ClickHouse 服务器是否应压缩 POST 响应数据。此设置只应用于 “raw” 查询。                                                                                          |
| decompress        | 发送到 ClickHouse 服务器的数据是否必须被解压缩。此设置只应用于 “raw” 插入。                                                                                    |
| quota_key         | 与此请求关联的配额键。请参阅 ClickHouse 服务器关于配额的文档。                                                                                                  |
| session_check     | 用于检查会话状态。                                                                                                                                                |
| session_timeout   | 由 session ID 标识的会话在被视为超时并不再有效之前允许的不活动时间（秒）。默认为 60 秒。                                                                         |
| wait_end_of_query | 在 ClickHouse 服务器端缓冲整个响应。此设置是返回摘要信息所必需的，并会在非流式查询中自动设置。                                                                  |
| role              | 会话中要使用的 ClickHouse 角色。属于有效的传输层设置，可包含在查询上下文中。                                                                                    |

关于可以随每个查询一起发送的其他 ClickHouse 设置，请参阅 [ClickHouse 文档](/operations/settings/settings.md)。

### 客户端创建示例 {#client-creation-examples}

* 在不提供任何参数的情况下，ClickHouse Connect 客户端会通过默认 HTTP 端口连接到 `localhost`，使用默认用户且不使用密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

* 连接到启用 HTTPS 的外部 ClickHouse 服务器

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

* 通过会话 ID 以及其他自定义连接参数和 ClickHouse 设置进行连接。

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='play.clickhouse.com',
    user='play',
    password='clickhouse',
    port=443,
    session_id='example_session_1',
    connect_timeout=15,
    database='github',
    settings={'distributed_ddl_task_timeout':300},
)
print(client.database)
# Output: 'github'
```


## 客户端生命周期与最佳实践 {#client-lifecycle-and-best-practices}

创建 ClickHouse Connect 客户端是一个开销较大的操作，涉及建立连接、获取服务器元数据以及初始化设置。请遵循以下最佳实践以获得更佳性能：

### 核心原则 {#core-principles}

- **复用客户端**：在应用启动时创建客户端，并在整个应用生命周期内复用
- **避免频繁创建**：不要为每个查询或请求都创建一个新的客户端（这会为每次操作浪费数百毫秒）
- **正确清理**：在应用关闭时务必关闭客户端，以释放连接池资源
- **尽可能共享**：单个客户端可以通过其连接池处理大量并发查询（参见下文的线程说明）

### 基本模式 {#basic-patterns}

**✅ 推荐做法：复用单个客户端**

```python
import clickhouse_connect

# Create once at startup
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# Reuse for all queries
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# Close on shutdown
client.close()
```

**❌ 不佳做法：反复创建客户端**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### 多线程应用程序 {#multi-threaded-applications}

:::warning
在使用 session ID 时，客户端实例**不是线程安全的**。默认情况下，客户端会自动生成 session ID，在同一个 session 中并发执行查询会抛出 `ProgrammingError` 异常。
:::

要在多个线程之间安全地共享一个客户端：

```python
import clickhouse_connect
import threading

# Option 1: Disable sessions (recommended for shared clients)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Required for thread safety
)

def worker(thread_id):
    # All threads can now safely use the same client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# Output:
# Thread 0: 0
# Thread 7: 7
# Thread 1: 1
# Thread 9: 9
# Thread 4: 4
# Thread 2: 2
# Thread 8: 8
# Thread 5: 5
# Thread 6: 6
# Thread 3: 3
```

**会话的替代方式：** 如果你需要会话（例如用于临时表），请为每个线程创建一个独立的客户端：

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```


### 正确的清理方式 {#proper-cleanup}

在关闭程序时务必关闭客户端。注意，仅当客户端拥有其连接池管理器时（例如使用自定义 TLS/代理选项创建时），`client.close()` 才会释放客户端资源并关闭连接池中的 HTTP 连接。对于默认的共享连接池，请使用 `client.close_connections()` 主动清理套接字；否则，连接会通过空闲过期机制以及在进程退出时自动回收。

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

或者使用上下文管理器：

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```


### 何时使用多个客户端 {#when-to-use-multiple-clients}

以下场景适合使用多个客户端：

- **不同服务器**：每个 ClickHouse 服务器或集群使用一个客户端
- **不同凭据**：为不同用户或访问级别使用单独的客户端
- **不同数据库**：当你需要操作多个数据库时
- **隔离会话**：当你需要为临时表或会话级设置使用单独会话时
- **按线程隔离**：当各线程需要独立会话时（如上所示）

## 常用方法参数 {#common-method-arguments}

有些客户端方法会使用通用的 `parameters` 和 `settings` 参数中的一个或两个。下面对这些关键字参数进行说明。

### Parameters argument {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数，用于将 Python 表达式绑定到 ClickHouse 的值表达式。提供两种绑定方式。

#### 服务器端绑定 {#server-side-binding}

ClickHouse 支持对大多数查询值进行[服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)，其中绑定值作为 HTTP 查询参数，与查询本身单独发送。如果 ClickHouse Connect 检测到形如 `{<name>:<datatype>}` 的绑定表达式，则会添加相应的查询参数。对于服务器端绑定，`parameters` 参数应为一个 Python 字典。

* 使用 Python 字典、DateTime 值和字符串值进行服务器端绑定

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

这会在服务器上生成如下查询：

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
服务器端绑定仅在 ClickHouse 服务器对 `SELECT` 查询的处理中受到支持。它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。将来这一行为可能会有所变化；详情参见 [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092)。
:::


#### 客户端绑定 {#client-side-binding}

ClickHouse Connect 也支持客户端参数绑定，这在生成模板化 SQL 查询时可以提供更大的灵活性。对于客户端绑定，`parameters` 参数应为字典或序列。客户端绑定使用 Python [&quot;printf&quot; 风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 字符串格式进行参数替换。

请注意，与服务端绑定不同，客户端绑定不适用于数据库标识符，例如数据库、表或列名，因为 Python 风格的格式化无法区分不同类型的字符串，而这些字符串需要以不同的方式进行格式化（数据库标识符使用反引号或双引号，数据值使用单引号）。

* 使用 Python Dictionary、DateTime 值和字符串转义的示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

这会在服务器端生成如下查询：

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

* 使用 Python 序列（元组）、Float64 和 IPv4Address 的示例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

这会在服务器端生成如下查询：

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
要绑定 DateTime64 参数（具有子秒级精度的 ClickHouse 类型），需要采用以下两种自定义方式之一：

* 将 Python 的 `datetime.datetime` 值包装为新的 DT64Param 类实例，例如：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 使用字典进行服务端绑定
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # 使用列表进行客户端绑定 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * 如果使用参数值字典，请在参数名后追加字符串 `_64`
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 使用字典进行服务端绑定

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Settings 参数 {#settings-argument-1}

所有主要的 ClickHouse Connect 客户端 `insert` 和 `select` 方法都接受一个可选的 `settings` 关键字参数，用于为其中包含的 SQL 语句传递 ClickHouse 服务器的[用户设置](/operations/settings/settings.md)。`settings` 参数应为一个字典。每个条目应包含一个 ClickHouse 设置名称及其对应的值。请注意，这些值在作为查询参数发送到服务器时会被转换为字符串。

与客户端级别的设置一样，ClickHouse Connect 会忽略任何被服务器标记为 *readonly*=*1* 的设置，并记录相应的日志信息。仅适用于通过 ClickHouse HTTP 接口执行查询的设置始终被视为有效。相关设置在 `get_client` [API](#settings-argument) 一节中有说明。

使用 ClickHouse 设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Client `command` 方法 {#client-command-method}

使用 `Client.command` 方法向 ClickHouse 服务器发送 SQL 查询，这类查询通常不返回数据，或者只返回一个基础类型或数组类型的单个值，而不是完整的数据集。此方法接收以下参数：

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | 返回单个值或单行值的 ClickHouse SQL 语句。                                                                                                                    |
| parameters    | dict or iterable | *None*     | 参见 [parameters 说明](#parameters-argument)。                                                                                                                |
| data          | str or bytes     | *None*     | 可选数据，作为 POST 请求体随命令一起发送。                                                                                                                   |
| settings      | dict             | *None*     | 参见 [settings 说明](#settings-argument)。                                                                                                                    |
| use_database  | bool             | True       | 使用客户端数据库（在创建客户端时指定）。设为 False 时，命令将使用已连接用户在 ClickHouse 服务器上的默认数据库。                                              |
| external_data | ExternalData     | *None*     | 一个 `ExternalData` 对象，包含要与查询一起使用的文件或二进制数据。参见 [高级查询（外部数据）](advanced-querying.md#external-data)                             |

### 命令示例 {#command-examples}

#### DDL 语句 {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create a table
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Returns QuerySummary with query_id

# Show table definition
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Output:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()

# Drop table
client.command("DROP TABLE test_command")
```


#### 返回单个值的简单查询 {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Single value result
count = client.command("SELECT count() FROM system.tables")
print(count)
# Output: 151

# Server version
version = client.command("SELECT version()")
print(version)
# Output: "25.8.2.29"
```


#### 包含参数的命令 {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using client-side parameters
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# Using server-side parameters
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```


#### 包含设置的命令 {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Client `query` 方法 {#client-query-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个“批次”数据集的主要方式。它通过 HTTP 使用 ClickHouse 原生格式来高效传输大型数据集（可达约一百万行）。该方法接受以下参数：

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                          |
| parameters          | dict or iterable | *None*     | 参见 [parameters 参数说明](#parameters-argument)。                                                                                                                                 |
| settings            | dict             | *None*     | 参见 [settings 参数说明](#settings-argument)。                                                                                                                                     |
| query_formats       | dict             | *None*     | 结果值的数据类型格式化规范。参见高级用法（读取格式）。                                                                                                                             |
| column_formats      | dict             | *None*     | 按列的数据类型格式化规范。参见高级用法（读取格式）。                                                                                                                               |
| encoding            | str              | *None*     | 用于将 ClickHouse String 列编码为 Python 字符串的编码。如果未设置，Python 默认为 `UTF-8`。                                                                                        |
| use_none            | bool             | True       | 对 ClickHouse null 使用 Python 的 *None* 类型。如果为 False，则对 ClickHouse null 使用数据类型默认值（例如 0）。注意：出于性能原因，在 NumPy/Pandas 中默认值为 False。          |
| column_oriented     | bool             | False      | 将结果作为列序列而不是行序列返回。对于将 Python 数据转换为其他面向列的数据格式很有帮助。                                                                                         |
| query_tz            | str              | *None*     | 来自 `zoneinfo` 数据库的时区名称。该时区将应用于查询返回的所有 datetime 或 Pandas Timestamp 对象。                                                                                |
| column_tzs          | dict             | *None*     | 从列名到时区名的字典。类似于 `query_tz`，但允许为不同列指定不同的时区。                                                                                                           |
| use_extended_dtypes | bool             | True       | 对 ClickHouse 的 NULL 值使用 Pandas 扩展 dtypes（如 StringArray），以及 pandas.NA 和 pandas.NaT。仅适用于 `query_df` 和 `query_df_stream` 方法。                                  |
| external_data       | ExternalData     | *None*     | 包含用于该查询的文件或二进制数据的 ExternalData 对象。参见 [高级查询（外部数据）](advanced-querying.md#external-data)                                                              |
| context             | QueryContext     | *None*     | 可复用的 QueryContext 对象，可用于封装上述方法参数。参见 [高级查询（QueryContexts）](advanced-querying.md#querycontexts)                                                          |

### 查询示例 {#query-examples}

#### 基本查询 {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Simple SELECT query
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# Access results as rows
for row in result.result_rows:
    print(row)
# Output:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')

# Access column names and types
print(result.column_names)
# Output: ("name", "database")
print([col_type.name for col_type in result.column_types])
# Output: ['String', 'String']
```


#### 获取查询结果 {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# Row-oriented access (default)
print(result.result_rows)
# Output: [[0, "0"], [1, "1"], [2, "2"]]

# Column-oriented access
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]

# Named results (list of dictionaries)
for row_dict in result.named_results():
    print(row_dict)
# Output: 
# {"number": 0, "str": "0"}
# {"number": 1, "str": "1"}
# {"number": 2, "str": "2"}

# First row as dictionary
print(result.first_item)
# Output: {"number": 0, "str": "0"}

# First row as tuple
print(result.first_row)
# Output: (0, "0")
```


#### 使用客户端参数的查询 {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using dictionary parameters (printf-style)
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# Using tuple parameters
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```


#### 带服务端参数的查询 {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### 使用设置的查询 {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Pass ClickHouse settings with the query
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```


### `QueryResult` 对象 {#the-queryresult-object}

基本的 `query` 方法会返回一个带有以下公共属性的 `QueryResult` 对象：

- `result_rows` -- 以行序列形式返回数据的矩阵，其中每个行元素本身是一个列值序列。
- `result_columns` -- 以列序列形式返回数据的矩阵，其中每个列元素本身是该列所有行值的序列。
- `column_names` -- 一个字符串元组，表示 `result_set` 中的列名
- `column_types` -- 一个 ClickHouseType 实例的元组，表示 `result_columns` 中每一列对应的 ClickHouse 数据类型
- `query_id` -- ClickHouse 的 query_id（可用于在 `system.query_log` 表中检查该查询）
- `summary` -- 由 `X-ClickHouse-Summary` HTTP 响应头返回的任意数据
- `first_item` -- 一个便捷属性，用于将响应的首行作为字典获取（键为列名）
- `first_row` -- 一个便捷属性，用于返回结果的首行
- `column_block_stream` -- 以列式格式生成查询结果的生成器。该属性不应被直接引用（见下文）。
- `row_block_stream` -- 以行式格式生成查询结果的生成器。该属性不应被直接引用（见下文）。
- `rows_stream` -- 生成查询结果的生成器，每次调用返回一行。该属性不应被直接引用（见下文）。
- `summary` -- 如在 `command` 方法中所述，由 ClickHouse 返回的摘要信息字典

`*_stream` 属性返回一个 Python 上下文（Context），可作为返回数据的迭代器使用。它们只应通过 Client 的 `*_stream` 方法间接访问。

关于流式查询结果（使用 StreamContext 对象）的完整说明，详见 [高级查询（流式查询）](advanced-querying.md#streaming-queries)。

## 使用 NumPy、Pandas 或 Arrow 获取查询结果 {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect 为 NumPy、Pandas 和 Arrow 数据格式提供了专门的查询方法。有关使用这些方法的详细信息（包括示例、流式处理能力以及高级类型处理），请参阅[高级查询（NumPy、Pandas 和 Arrow 查询）](advanced-querying.md#numpy-pandas-and-arrow-queries)。

## 客户端流式查询方法 {#client-streaming-query-methods}

对于需要以流式方式处理的大型结果集，ClickHouse Connect 提供了多种流式处理方式。有关详细信息和示例，请参见 [高级查询（流式查询）](advanced-querying.md#streaming-queries)。

## Client `insert` 方法 {#client-insert-method}

对于向 ClickHouse 插入多条记录的常见场景，可以使用 `Client.insert` 方法。它接受以下参数：

| 参数               | 类型                             | 默认值     | 说明                                                                                                                                                                                          |
|--------------------|----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                              | *Required* | 要插入数据的 ClickHouse 表。允许使用完整表名（包括数据库名）。                                                                                                                                |
| data               | Sequence of Sequences            | *Required* | 要插入的数据矩阵，可以是按行组织的序列（Sequence of rows，每一行是列值的序列），也可以是按列组织的序列（Sequence of columns，每一列是行值的序列）。                                            |
| column_names       | Sequence of str, or str          | '*'        | 数据矩阵的 column_names 列表。如果使用 `'*'`，ClickHouse Connect 会执行一次“预查询”，以获取该表的所有列名。                                                                                     |
| database           | str                              | ''         | 插入目标数据库。如果未指定，则使用该 Client 默认的数据库。                                                                                                                                    |
| column_types       | Sequence of ClickHouseType       | *None*     | ClickHouseType 实例列表。如果既未指定 column_types 也未指定 column_type_names，ClickHouse Connect 会执行一次“预查询”，以获取该表的所有列类型。                                                 |
| column_type_names  | Sequence of ClickHouse type names| *None*     | ClickHouse 数据类型名称列表。如果既未指定 column_types 也未指定 column_type_names，ClickHouse Connect 会执行一次“预查询”，以获取该表的所有列类型。                                             |
| column_oriented    | bool                             | False      | 如果为 True，则认为 `data` 参数是按列组织的序列（Sequence of columns，插入数据时无需进行“透视”转换）。否则，`data` 会被解释为按行组织的序列（Sequence of rows）。                                |
| settings           | dict                             | *None*     | 参见 [settings description](#settings-argument)。                                                                                                                                              |
| context            | InsertContext                    | *None*     | 可以使用可复用的 InsertContext 对象来封装上述方法参数。参见 [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts)                                                          |
| transport_settings | dict                             | *None*     | 可选的传输层级设置字典（HTTP 头等）。                                                                                                                                                         |

该方法返回一个“查询摘要”字典，其格式与 "command" 方法中描述的一致。如果插入因任何原因失败，将抛出异常。

对于与 Pandas DataFrame、PyArrow Table 以及基于 Arrow 的 DataFrame 一起使用的专用插入方法，参见 [Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods)。

:::note
NumPy array 是一个有效的 Sequence of Sequences，可以作为主 `insert` 方法的 `data` 参数使用，因此不需要单独的专用方法。
:::

### 示例 {#examples}

以下示例假设已存在一张名为 `users` 的表，其表结构为 `(id UInt32, name String, age UInt8)`。

#### 基本行式插入 {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Row-oriented data: each inner list is a row
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```


#### 按列插入 {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Column-oriented data: each inner list is a column
data = [
    [1, 2, 3],  # id column
    ["Alice", "Bob", "Joe"],  # name column
    [25, 30, 28],  # age column
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```


#### 使用显式列类型插入数据 {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Useful when you want to avoid a DESCRIBE query to the server
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    column_type_names=["UInt32", "String", "UInt8"],
)
```


#### 插入到特定数据库 {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# Insert into a table in a specific database
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```


## 文件插入 {#file-inserts}

关于直接从文件向 ClickHouse 表中插入数据，请参阅[高级插入（文件插入）](advanced-inserting.md#file-inserts)。

## 原始 API {#raw-api}

对于需要在不进行类型转换的情况下直接访问 ClickHouse HTTP 接口的高级用例，请参阅[高级用法（原始 API）](advanced-usage.md#raw-api)。

## 实用类和函数 {#utility-classes-and-functions}

下列类和函数也被视为 `clickhouse-connect` “公共” API 的一部分，并且与上文文档中介绍的类和方法一样，在小版本发布之间保持稳定。对这些类和函数的不兼容变更只会在小版本（非补丁版本）发布时引入，并且会在至少一个小版本中以弃用状态提供。

### 异常 {#exceptions}

所有自定义异常（包括 DB API 2.0 规范中定义的异常）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序实际检测到的异常都属于这些类型之一。

### ClickHouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构造和转义 ClickHouse SQL 查询。类似地，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型的名称。

## 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

如需了解在多线程、多进程以及异步/事件驱动应用中使用 ClickHouse Connect 的相关信息，请参阅[高级用法（多线程、多进程和异步/事件驱动用例）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)。

## AsyncClient 包装器 {#asyncclient-wrapper}

有关在 asyncio 环境中使用 AsyncClient 包装器的说明，请参见 [高级用法（AsyncClient 包装器）](advanced-usage.md#asyncclient-wrapper)。

## 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

如需了解在多线程或并发应用中管理 ClickHouse 会话 ID 的相关信息，请参阅[高级用法（管理 ClickHouse 会话 ID）](advanced-usage.md#managing-clickhouse-session-ids)。

## 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

如需了解在大型多线程应用程序中如何自定义 HTTP 连接池，请参阅[高级用法（自定义 HTTP 连接池）](advanced-usage.md#customizing-the-http-connection-pool)。