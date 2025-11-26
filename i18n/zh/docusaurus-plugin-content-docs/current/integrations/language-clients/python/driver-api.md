---
sidebar_label: '驱动程序 API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect 驱动程序 API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect 驱动程序 API'
doc_type: 'reference'
---



# ClickHouse Connect 驱动 API {#clickhouse-connect-driver-api}

:::note
鉴于可能的参数数量众多且大部分为可选参数，建议在大多数 API 方法中通过关键字参数传递参数。

*本页未记录的方法不视为 API 的一部分，可能会被移除或更改。*
:::



## 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类为 Python 应用程序与 ClickHouse 数据库服务器之间提供主要接口。使用 `clickhouse_connect.get_client` 函数获取一个 Client 实例，它接受以下参数：

### 连接参数 {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | 必须为 http 或 https。                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | ClickHouse 服务器的主机名或 IP 地址。如果未设置，将使用 `localhost`。                                                                                                                                                                                 |
| port                     | int         | 8123 or 8443                  | ClickHouse 的 HTTP 或 HTTPS 端口。如果未设置，将默认为 8123；如果 *secure*=*True* 或 *interface*=*https*，则默认为 8443。                                                                                                                             |
| username                 | str         | default                       | ClickHouse 用户名。如果未设置，将使用 ClickHouse 的 `default` 用户。                                                                                                                                                                                 |
| password                 | str         | *&lt;empty string&gt;*        | *username* 对应的密码。                                                                                                                                                                                                                               |
| database                 | str         | *None*                        | 此连接的默认数据库。如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                                                  |
| secure                   | bool        | False                         | 使用 HTTPS/TLS。这会覆盖从 interface 或 port 参数推断出的值。                                                                                                                                                                                        |
| dsn                      | str         | *None*                        | 标准 DSN（Data Source Name，数据源名称）格式的字符串。如果其他连接值（如 host 或 user）未设置，将从此字符串中提取。                                                                                                                                  |
| compress                 | bool or str | True                          | 为 ClickHouse HTTP 插入及查询结果启用压缩。参见 [Additional Options (Compression)](additional-options.md#compression)                                                                                                                                |
| query_limit              | int         | 0 (unlimited)                 | 任意 `query` 响应返回的最大行数。将其设置为 0 以返回不受限制的行数。请注意，如果结果未以流式方式获取，较大的 query_limit 可能会在一次性将所有结果加载到内存时导致内存不足异常。                                                                        |
| query_retries            | int         | 2                             | `query` 请求的最大重试次数。只有“可重试”的 HTTP 响应才会被重试。为了防止产生意外的重复请求，`command` 或 `insert` 请求不会由驱动自动重试。                                                                                                           |
| connect_timeout          | int         | 10                            | HTTP 连接超时时间（秒）。                                                                                                                                                                                                                            |
| send_receive_timeout     | int         | 300                           | HTTP 连接的发送/接收超时时间（秒）。                                                                                                                                                                                                                 |
| client_name              | str         | *None*                        | 预先添加到 HTTP User-Agent 请求头中的 client_name。设置此值以便在 ClickHouse 的 system.query_log 中追踪客户端查询。                                                                                                                                  |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 要使用的 `urllib3` 库 PoolManager。适用于需要针对不同主机使用多个连接池的高级场景。                                                                                                                                                                 |
| http_proxy               | str         | *None*                        | HTTP 代理地址（等同于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                                    |
| https_proxy              | str         | *None*                        | HTTPS 代理地址（等同于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                                                  |
| apply_server_timezone    | bool        | True                          | 对带时区的查询结果使用服务器时区。参见 [Timezone Precedence](advanced-querying.md#time-zones)                                                                                                                                                        |
| show_clickhouse_errors   | bool        | True                          | 在客户端异常中包含详细的 ClickHouse 服务器错误消息和异常代码。                                                                                                                                                                                       |
| autogenerate_session_id  | bool        | *None*                        | 覆盖全局 `autogenerate_session_id` 设置。如果为 True，当未提供会话 ID 时自动生成 UUID4 会话 ID。                                                                                                                                                     |
| proxy_path               | str         | &lt;empty string&gt;          | 在 ClickHouse 服务器 URL 前添加的可选路径前缀，用于代理配置。                                                                                                                                                                                        |
| form_encode_query_params | bool        | False                         | 将查询参数作为表单编码数据放在请求体中发送，而不是作为 URL 参数。对于参数集较大、可能会超出 URL 长度限制的查询很有用。                                                                                                                              |
| rename_response_column   | str         | *None*                        | 可选的回调函数或列名映射，用于在查询结果中重命名响应列。                                                                                                                                                                                             |

### HTTPS/TLS 参数 {#httpstls-arguments}



| Parameter                | Type | Default | Description                                                                                                                               |
| ------------------------ | ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| verify                   | bool | True    | 如果使用 HTTPS/TLS，用于验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、过期时间等）。                                                                                |
| ca&#95;cert              | str  | *None*  | 当 *verify*=*True* 时，用于验证 ClickHouse 服务器证书的证书颁发机构（CA）根证书文件路径，格式为 .pem。如果 *verify* 为 False，则会被忽略。如果 ClickHouse 服务器证书是由操作系统信任的全局根证书，则不需要此设置。 |
| client&#95;cert          | str  | *None*  | 指向 .pem 格式的 TLS 客户端证书（用于双向 TLS 认证）的文件路径。文件应包含完整的证书链，包括任意中间证书。                                                                             |
| client&#95;cert&#95;key  | str  | *None*  | 客户端证书对应私钥的文件路径。如果私钥未包含在客户端证书密钥文件中，则必须设置此项。                                                                                                |
| server&#95;host&#95;name | str  | *None*  | ClickHouse 服务器主机名，由其 TLS 证书中的 CN 或 SNI 标识。通过具有不同主机名的代理或隧道进行连接时，为避免 SSL 错误，请设置此参数。                                                         |
| tls&#95;mode             | str  | *None*  | 控制高级 TLS 行为。`proxy` 和 `strict` 不会发起 ClickHouse 双向 TLS 连接，但会发送客户端证书和私钥。`mutual` 假定使用客户端证书进行 ClickHouse 双向 TLS 认证。*None*/默认行为为 `mutual`。    |

### Settings argument

最后，`get_client` 的 `settings` 参数用于在每个客户端请求中向服务器传递额外的 ClickHouse 设置。请注意，在大多数情况下，具有 *readonly*=*1* 访问权限的用户不能更改随查询发送的设置，因此 ClickHouse Connect 会在最终请求中忽略此类设置并记录警告。以下设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话，在 ClickHouse 通用设置文档中未列出。

| Setting                       | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| buffer&#95;size               | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（字节数）。                   |
| session&#95;id                | 用于在服务器上关联相关查询的唯一会话 ID。临时表需要此参数。                             |
| compress                      | ClickHouse 服务器是否应压缩 POST 响应数据。此设置仅应在 &quot;raw&quot; 查询中使用。 |
| decompress                    | 发送至 ClickHouse 服务器的数据是否必须解压缩。此设置仅应在 &quot;raw&quot; 插入中使用。  |
| quota&#95;key                 | 与此请求关联的配额键。请参阅 ClickHouse 服务器关于配额的文档。                       |
| session&#95;check             | 用于检查会话状态。                                                   |
| session&#95;timeout           | 会话 ID 标识的会话在被视为超时并不再有效之前的空闲秒数。默认为 60 秒。                     |
| wait&#95;end&#95;of&#95;query | 在 ClickHouse 服务器上缓冲整个响应。此设置是返回汇总信息所必需的，并会在非流式查询中自动设置。       |
| role                          | 会话中使用的 ClickHouse 角色。是一个有效的传输设置参数，可以包含在查询上下文中。              |

有关可随每个查询发送的其他 ClickHouse 设置，请参阅[ClickHouse 文档](/operations/settings/settings.md)。

### Client creation examples

* 不带任何参数时，ClickHouse Connect 客户端将使用默认用户且无密码连接到 `localhost` 上的默认 HTTP 端口：

```python
import clickhouse_connect
```


client = clickhouse&#95;connect.get&#95;client()
print(client.server&#95;version)

# 输出：&#39;22.10.1.98&#39;

````

- 连接到安全的（HTTPS）外部 ClickHouse 服务器

```python
import clickhouse_connect
````


client = clickhouse&#95;connect.get&#95;client(host=&#39;play.clickhouse.com&#39;, secure=True, port=443, user=&#39;play&#39;, password=&#39;clickhouse&#39;)
print(client.command(&#39;SELECT timezone()&#39;))

# 输出: &#39;Etc/UTC&#39;

````

- 使用会话 ID 和其他自定义连接参数以及 ClickHouse 设置进行连接。

```python
import clickhouse_connect
````


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

# 输出：'github'

```

```


## 客户端生命周期与最佳实践

创建一个 ClickHouse Connect 客户端是一项开销较大的操作，涉及建立连接、检索服务器元数据以及初始化相关设置。请遵循以下最佳实践以获得更优性能：

### 核心原则

* **复用客户端**：在应用程序启动时创建客户端，并在整个应用程序生命周期内复用
* **避免频繁创建**：不要为每个查询或请求创建一个新客户端（这会为每次操作额外浪费数百毫秒）
* **正确清理**：在关闭应用时务必关闭客户端，以释放连接池资源
* **尽可能共享**：单个客户端可以通过其连接池处理大量并发查询（参见下文线程相关说明）

### 基本模式

**✅ 推荐做法：复用单个客户端**

```python
import clickhouse_connect
```


# 在应用启动时创建一次
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')



# 所有查询复用同一个客户端
for i in range(1000):
    result = client.query('SELECT count() FROM users')



# 在关闭时关闭客户端

client.close()

```

**❌ 错误做法:重复创建客户端**
```


```python
# 错误示例:创建 1000 个客户端会产生高昂的初始化开销
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### 多线程应用程序

:::warning
在使用 session ID 时，客户端实例**不是线程安全的**。默认情况下，客户端会自动生成一个 session ID，在同一 session 内并发执行查询会触发 `ProgrammingError`。
:::

要在多个线程之间安全地共享同一个客户端实例：

```python
import clickhouse_connect
import threading
```


# 选项 1：禁用会话（推荐在共享客户端时使用）
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # 为实现线程安全所必需
)

def worker(thread_id):
    # 现在所有线程都可以安全地使用同一个 client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()



client.close()

# 输出：

# 线程 0: 0

# 线程 7: 7

# 线程 1: 1

# 线程 9: 9

# 线程 4: 4

# 线程 2: 2

# 线程 8: 8

# 线程 5: 5

# 线程 6: 6

# 线程 3: 3

````

**会话的替代方案：** 如果需要使用会话（例如用于临时表），请为每个线程创建单独的客户端：

```python
def worker(thread_id):
    # 每个线程拥有独立的客户端和隔离的会话
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... 使用临时表 ...
    client.close()
````

### 正确清理

在关闭程序时务必关闭客户端。请注意，只有当客户端拥有自己的连接池管理器时（例如使用自定义 TLS/代理选项创建时），`client.close()` 才会释放客户端资源并关闭池化的 HTTP 连接。对于默认的共享连接池，请使用 `client.close_connections()` 主动清理套接字；否则，连接会通过空闲过期机制以及在进程退出时自动回收。

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

### 何时使用多个客户端

在以下场景下适合使用多个客户端：

* **不同服务器**：每个 ClickHouse 服务器或集群使用一个客户端
* **不同凭证**：为不同用户或访问级别分别创建客户端
* **不同数据库**：当你需要同时操作多个数据库时
* **隔离会话**：当你需要为临时表或会话级设置使用独立会话时
* **按线程隔离**：当各线程需要独立会话时（如上所示）


## 通用方法参数

多个客户端方法会使用一个或两个通用的 `parameters` 和 `settings` 参数。下面对这些关键字参数进行说明。

### Parameters 参数

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数，用于将 Python 表达式绑定到 ClickHouse 的值表达式。提供两种绑定方式。

#### 服务器端绑定

对于大多数查询值，ClickHouse 支持[服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)，其中绑定值作为 HTTP 查询参数，与查询本身分开发送。如果 ClickHouse Connect 检测到形如 `{<name>:<datatype>}` 的绑定表达式，则会自动添加相应的查询参数。对于服务器端绑定，`parameters` 参数应为一个 Python 字典。

* 使用 Python 字典、DateTime 值和字符串值进行服务器端绑定

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

这将在服务器上生成以下查询：

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
服务器端绑定仅在 `SELECT` 查询中由 ClickHouse 服务器支持。它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。未来可能会有所变化；参见 [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092)。
:::

#### 客户端绑定

ClickHouse Connect 也支持客户端参数绑定，这在生成模板化 SQL 查询时可以提供更大的灵活性。对于客户端绑定，`parameters` 参数应为字典或序列。客户端绑定使用 Python [&quot;printf&quot; 风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 的字符串格式化进行参数替换。

请注意，与服务器端绑定不同，客户端绑定不适用于诸如数据库、表或列名等数据库标识符，因为 Python 风格的格式化无法区分不同类型的字符串，而这些字符串需要以不同的方式格式化（数据库标识符使用反引号或双引号，数据值使用单引号）。

* 使用 Python 字典、DateTime 值和字符串转义的示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

这将在服务器端生成如下查询：

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

这会在服务器上生成如下查询：

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
要绑定 DateTime64 参数（具有子秒级精度的 ClickHouse 类型），需要采用以下两种自定义方法之一：

* 将 Python `datetime.datetime` 值封装到新的 `DT64Param` 类实例中，例如：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 使用字典在服务端绑定
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # 使用列表在客户端绑定
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * 如果使用参数值字典，请在参数名后追加后缀字符串 `_64`
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 使用字典在服务端绑定
  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### Settings 参数 {#settings-argument-1}

所有 ClickHouse Connect Client 的核心 "insert" 和 "select" 方法都接受一个可选的 `settings` 关键字参数,用于为相应的 SQL 语句传递 ClickHouse 服务器[用户设置](/operations/settings/settings.md)。`settings` 参数应为字典类型。每个条目应包含一个 ClickHouse 设置名称及其对应的值。注意,这些值在作为查询参数发送到服务器时会被转换为字符串。

与客户端级别设置一样,ClickHouse Connect 会丢弃服务器标记为 *readonly*=*1* 的任何设置,并记录相应的日志消息。仅适用于通过 ClickHouse HTTP 接口执行查询的设置始终有效。这些设置在 `get_client` [API](#settings-argument) 中有详细说明。

使用 ClickHouse 设置的示例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## 客户端 `command` 方法

使用 `Client.command` 方法向 ClickHouse 服务器发送 SQL 查询，这些查询通常不返回结果集，或者只返回单个基础类型值或数组值，而不是完整的数据集。该方法接收以下参数：

| Parameter         | Type             | Default    | Description                                                                                 |
| ----------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------- |
| cmd               | str              | *Required* | 返回单个值或单行多列值的 ClickHouse SQL 语句。                                                             |
| parameters        | dict or iterable | *None*     | 参见 [parameters 说明](#parameters-argument)。                                                   |
| data              | str or bytes     | *None*     | 可选数据，作为 POST 请求体随命令一起发送。                                                                    |
| settings          | dict             | *None*     | 参见 [settings 说明](#settings-argument)。                                                       |
| use&#95;database  | bool             | True       | 使用客户端配置的数据库（在创建 client 时指定）。False 表示命令将使用当前连接用户在 ClickHouse 服务器上的默认数据库。                     |
| external&#95;data | ExternalData     | *None*     | 一个包含文件或二进制数据、可在查询中使用的 `ExternalData` 对象。参见 [高级查询（外部数据）](advanced-querying.md#external-data) |

### 命令示例

#### DDL 语句

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 创建一个表
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # 返回带有 query_id 的 QuerySummary



# 显示表定义
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# 输出：
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()
# SETTINGS index_granularity = 8192



# 删除表

client.command(&quot;DROP TABLE test&#95;command&quot;)

````

#### 返回单个值的简单查询 {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 单值结果
count = client.command("SELECT count() FROM system.tables")
print(count)
# 输出：151



# 服务器版本

version = client.command(&quot;SELECT version()&quot;)
print(version)

# 输出: &quot;25.8.2.29&quot;

````

#### 带参数的命令 {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 使用客户端参数

table_name = "system"
result = client.command(
"SELECT count() FROM system.tables WHERE database = %(db)s",
parameters={"db": table_name}
)


# 使用服务器端参数

result = client.command(
"SELECT count() FROM system.tables WHERE database = {db:String}",
parameters={"db": "system"}
)

````

#### 带设置的命令 {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# 使用特定设置执行命令

result = client.command(
"OPTIMIZE TABLE large_table FINAL",
settings={"optimize_throw_if_noop": 1}
)

```

```


## Client `query` 方法

`Client.query` 方法是从 ClickHouse 服务器检索单个“批次”数据集的主要方式。它通过 HTTP 使用 ClickHouse 的 Native 格式高效传输大型数据集（最多约一百万行）。该方法接受以下参数：

| Parameter                   | Type             | Default    | Description                                                                                                                   |
| --------------------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| query                       | str              | *Required* | ClickHouse SQL 的 SELECT 或 DESCRIBE 查询。                                                                                        |
| parameters                  | dict or iterable | *None*     | 参见 [parameters 说明](#parameters-argument)。                                                                                     |
| settings                    | dict             | *None*     | 参见 [settings 说明](#settings-argument)。                                                                                         |
| query&#95;formats           | dict             | *None*     | 结果值的数据类型格式规范。参见高级用法（读取格式）。                                                                                                    |
| column&#95;formats          | dict             | *None*     | 按列定义的数据类型格式。参见高级用法（读取格式）。                                                                                                     |
| encoding                    | str              | *None*     | 用于将 ClickHouse String 列解码为 Python 字符串时使用的编码方式。如果未设置，Python 默认使用 `UTF-8`。                                                      |
| use&#95;none                | bool             | True       | 对 ClickHouse 的 NULL 使用 Python 的 *None* 类型。若为 False，则对 ClickHouse 的 NULL 使用数据类型默认值（例如 0）。注意：出于性能原因，在 NumPy/Pandas 中默认值为 False。 |
| column&#95;oriented         | bool             | False      | 将结果作为列序列而不是行序列返回。对于将 Python 数据转换为其他列式数据格式非常有用。                                                                                |
| query&#95;tz                | str              | *None*     | 来自 `zoneinfo` 数据库的时区名称。该时区会应用于查询返回的所有 datetime 或 Pandas Timestamp 对象。                                                         |
| column&#95;tzs              | dict             | *None*     | 列名到时区名的字典。类似于 `query_tz`，但允许为不同列指定不同的时区。                                                                                      |
| use&#95;extended&#95;dtypes | bool             | True       | 对 ClickHouse 的 NULL 值使用 Pandas 扩展 dtypes（如 StringArray），以及 pandas.NA 和 pandas.NaT。仅适用于 `query_df` 和 `query_df_stream` 方法。     |
| external&#95;data           | ExternalData     | *None*     | 包含供查询使用的文件或二进制数据的 ExternalData 对象。参见 [高级查询（External Data）](advanced-querying.md#external-data)                                |
| context                     | QueryContext     | *None*     | 可复用的 QueryContext 对象，可用于封装上述方法参数。参见 [高级查询（QueryContexts）](advanced-querying.md#querycontexts)                                 |

### 查询示例

#### 基本查询

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 简单的 SELECT 查询
result = client.query("SELECT name, database FROM system.tables LIMIT 3")



# 按行访问结果
for row in result.result_rows:
    print(row)
# 输出：
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')



# 获取列名和类型

print(result.column&#95;names)

# 输出：(&quot;name&quot;, &quot;database&quot;)

print([col&#95;type.name for col&#95;type in result.column&#95;types])

# 输出：[&#39;String&#39;, &#39;String&#39;]

````

#### 访问查询结果 {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# 按行访问（默认）
print(result.result_rows)
# 输出: [[0, "0"], [1, "1"], [2, "2"]]



# 按列访问
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]



# 命名结果(字典列表)

for row_dict in result.named_results():
print(row_dict)

# 输出:

# {"number": 0, "str": "0"}

# {"number": 1, "str": "1"}

# {"number": 2, "str": "2"}


# 第一行作为字典

print(result.first_item)

# 输出: {"number": 0, "str": "0"}


# 第一行作为元组

print(result.first&#95;row)

# 输出：(0, &quot;0&quot;)

````

#### 使用客户端参数进行查询 {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 使用字典参数（printf 风格）

query = "SELECT \* FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)


# 使用元组参数

query = &quot;SELECT * FROM system.tables WHERE database = %s LIMIT %s&quot;
parameters = (&quot;system&quot;, 5)
result = client.query(query, parameters=parameters)

````

#### 使用服务器端参数进行查询 {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 服务器端绑定（更安全，SELECT 查询性能更佳）

query = "SELECT \* FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)

````

#### 使用设置进行查询 {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# 在查询中传递 ClickHouse 设置

result = client.query(
"SELECT sum(number) FROM numbers(1000000)",
settings={
"max_block_size": 100000,
"max_execution_time": 30
}
)

```

### `QueryResult` 对象 {#the-queryresult-object}

基础 `query` 方法返回一个 `QueryResult` 对象,该对象具有以下公共属性:

- `result_rows` -- 以行序列形式返回的数据矩阵,每个行元素是一个列值序列。
- `result_columns` -- 以列序列形式返回的数据矩阵,每个列元素是该列的行值序列
- `column_names` -- 表示 `result_set` 中列名的字符串元组
- `column_types` -- ClickHouseType 实例的元组,表示 `result_columns` 中每列的 ClickHouse 数据类型
- `query_id` -- ClickHouse 查询 ID(用于在 `system.query_log` 表中检查查询)
- `summary` -- `X-ClickHouse-Summary` HTTP 响应头返回的任何数据
- `first_item` -- 便捷属性,用于将响应的第一行作为字典检索(键为列名)
- `first_row` -- 便捷属性,用于返回结果的第一行
- `column_block_stream` -- 以列导向格式生成查询结果的生成器。不应直接引用此属性(见下文)。
- `row_block_stream` -- 以行导向格式生成查询结果的生成器。不应直接引用此属性(见下文)。
- `rows_stream` -- 每次调用生成单行查询结果的生成器。不应直接引用此属性(见下文)。
- `summary` -- 如 `command` 方法中所述,ClickHouse 返回的摘要信息字典

`*_stream` 属性返回一个 Python 上下文,可用作返回数据的迭代器。只应通过客户端 `*_stream` 方法间接访问这些属性。

流式查询结果的完整详细信息(使用 StreamContext 对象)在[高级查询(流式查询)](advanced-querying.md#streaming-queries)中概述。

```


## 通过 NumPy、Pandas 或 Arrow 获取查询结果 {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect 为 NumPy、Pandas 和 Arrow 数据格式提供了专用的查询方法。有关使用这些方法的详细信息，包括示例、流式处理能力以及高级类型处理，请参阅 [高级查询（NumPy、Pandas 和 Arrow 查询）](advanced-querying.md#numpy-pandas-and-arrow-queries)。



## 客户端流式查询方法 {#client-streaming-query-methods}

对于需要流式处理的大型结果集，ClickHouse Connect 提供了多种流式查询方式。详细说明和示例请参阅 [高级查询（流式查询）](advanced-querying.md#streaming-queries)。



## Client `insert` 方法

对于向 ClickHouse 插入多条记录这一常见用例，可以使用 `Client.insert` 方法。该方法接受以下参数：

| Parameter                 | Type                              | Default     | Description                                                                                                          |
| ------------------------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| table                     | str                               | *Required*  | 要插入数据的 ClickHouse 表。允许使用完整的表名（包括数据库名）。                                                                               |
| data                      | Sequence of Sequences             | *Required*  | 要插入的数据矩阵，可以是按行的序列（每一项为一行，每一行是一个列值序列），也可以是按列的序列（每一项为一列，每一列是一个行值序列）。                                                   |
| column&#95;names          | Sequence of str, or str           | &#39;*&#39; | 数据矩阵对应的 column&#95;names 列表。如果使用 &#39;*&#39;，ClickHouse Connect 将执行一次“预查询”（pre-query）以获取该表的所有列名。                     |
| database                  | str                               | &#39;&#39;  | 插入的目标数据库。如果未指定，则默认使用该客户端配置的数据库。                                                                                      |
| column&#95;types          | Sequence of ClickHouseType        | *None*      | ClickHouseType 实例列表。如果既未指定 column&#95;types 也未指定 column&#95;type&#95;names，ClickHouse Connect 将执行一次“预查询”以获取该表的所有列类型。 |
| column&#95;type&#95;names | Sequence of ClickHouse type names | *None*      | ClickHouse 数据类型名称列表。如果既未指定 column&#95;types 也未指定 column&#95;type&#95;names，ClickHouse Connect 将执行一次“预查询”以获取该表的所有列类型。 |
| column&#95;oriented       | bool                              | False       | 如果为 True，则认为 `data` 参数是按列的序列（因此不需要进行“转置”来插入数据）。否则 `data` 将被解释为按行的序列。                                                 |
| settings                  | dict                              | *None*      | 参见[设置说明](#settings-argument)。                                                                                        |
| context                   | InsertContext                     | *None*      | 可以使用可复用的 InsertContext 对象来封装上述方法参数。参见 [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts)      |
| transport&#95;settings    | dict                              | *None*      | 可选的传输层设置字典（HTTP 头等）。                                                                                                 |

该方法会返回一个“查询摘要”（query summary）字典，如在 “command” 方法中所述。如果插入因任何原因失败，会抛出异常。

对于配合 Pandas DataFrame、PyArrow Table 和基于 Arrow 的 DataFrame 使用的专用插入方法，参见 [Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods)。

:::note
NumPy 数组是一个合法的 Sequence of Sequences，可以作为主 `insert` 方法的 `data` 参数，因此不需要专用方法。
:::

### 示例

下面的示例假定已存在表 `users`，其 schema 为 `(id UInt32, name String, age UInt8)`。

#### 基本按行插入

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 行式数据：每个内层列表代表一行

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;])

````

#### 按列插入 {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 列式数据：每个内部列表代表一列

data = [
[1, 2, 3],  # id 列
[&quot;Alice&quot;, &quot;Bob&quot;, &quot;Joe&quot;],  # name 列
[25, 30, 28],  # age 列
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;], column&#95;oriented=True)

````

#### 使用显式列类型插入 {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 当你想避免向服务器发送 DESCRIBE 查询时，这种方式很有用

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
column&#95;type&#95;names=[&quot;UInt32&quot;, &quot;String&quot;, &quot;UInt8&quot;],
)

````

#### 插入到指定数据库 {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]
````


# 向特定数据库的表中插入数据

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## 文件插入 {#file-inserts}

要将文件中的数据直接插入到 ClickHouse 表中，请参阅 [高级插入（文件插入）](advanced-inserting.md#file-inserts)。



## 原始 API {#raw-api}

如需在不进行类型转换的情况下直接通过 HTTP 接口访问 ClickHouse，用于满足更高级的使用场景，请参阅[高级用法（原始 API）](advanced-usage.md#raw-api)。



## 实用类和函数 {#utility-classes-and-functions}

以下类和函数也被视为 `clickhouse-connect` 的公共 API 一部分，并且与上文记录的类和方法一样，在各个小版本发布之间保持稳定。对这些类和函数的破坏性更改只会在小版本（而非补丁版本）发布时出现，并且至少会以弃用状态在一个后续小版本中继续提供。

### 异常 {#exceptions}

所有自定义异常（包括 DB API 2.0 规范中定义的异常）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动实际检测到的异常将使用这些类型之一。

### ClickHouse SQL 实用工具 {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建并转义 ClickHouse SQL 查询。类似地，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。



## 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

若要了解在多线程、多进程和异步/事件驱动应用中使用 ClickHouse Connect 的相关信息，请参阅 [高级用法（多线程、多进程和异步/事件驱动用例）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)。



## AsyncClient 封装器 {#asyncclient-wrapper}

如需了解在 asyncio 环境中使用 AsyncClient 封装器的更多信息，请参阅[高级用法（AsyncClient 封装器）](advanced-usage.md#asyncclient-wrapper)。



## 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

若要了解在多线程或并发应用程序中管理 ClickHouse 会话 ID 的相关信息，请参阅 [高级用法（管理 ClickHouse 会话 ID）](advanced-usage.md#managing-clickhouse-session-ids)。



## 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

如需了解如何为大型多线程应用程序自定义 HTTP 连接池，请参阅[高级用法（自定义 HTTP 连接池）](advanced-usage.md#customizing-the-http-connection-pool)。
