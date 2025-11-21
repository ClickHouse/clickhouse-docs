---
sidebar_label: '驱动程序 API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect 驱动程序 API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect 驱动程序 API'
doc_type: '参考'
---



# ClickHouse Connect 驱动程序 API {#clickhouse-connect-driver-api}

:::note
由于大多数 API 方法包含大量参数(其中大部分为可选参数),建议使用关键字参数进行传递。

_此处未记录的方法不属于 API 的一部分,可能会被移除或修改。_
:::


## 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类提供了 Python 应用程序与 ClickHouse 数据库服务器之间的主要接口。使用 `clickhouse_connect.get_client` 函数获取 Client 实例,该函数接受以下参数:

### 连接参数 {#connection-arguments}

| 参数                | 类型        | 默认值                       | 描述                                                                                                                                                                                                                                           |
| ------------------------ | ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| interface                | str         | http                          | 必须为 http 或 https。                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | ClickHouse 服务器的主机名或 IP 地址。如果未设置,将使用 `localhost`。                                                                                                                                                            |
| port                     | int         | 8123 或 8443                  | ClickHouse HTTP 或 HTTPS 端口。如果未设置,默认为 8123,或在 _secure_=_True_ 或 _interface_=_https_ 时默认为 8443。                                                                                                                             |
| username                 | str         | default                       | ClickHouse 用户名。如果未设置,将使用 `default` ClickHouse 用户。                                                                                                                                                                     |
| password                 | str         | _&lt;empty string&gt;_        | _username_ 的密码。                                                                                                                                                                                                                          |
| database                 | str         | _None_                        | 连接的默认数据库。如果未设置,ClickHouse Connect 将使用 _username_ 的默认数据库。                                                                                                                                 |
| secure                   | bool        | False                         | 使用 HTTPS/TLS。此设置将覆盖从 interface 或 port 参数推断的值。                                                                                                                                                                   |
| dsn                      | str         | _None_                        | 标准 DSN(数据源名称)格式的字符串。如果未另行设置,其他连接值(如 host 或 user)将从此字符串中提取。                                                                                           |
| compress                 | bool 或 str | True                          | 为 ClickHouse HTTP 插入和查询结果启用压缩。请参阅[附加选项(压缩)](additional-options.md#compression)                                                                                                           |
| query_limit              | int         | 0(无限制)                 | 任何 `query` 响应返回的最大行数。将此设置为零以返回无限行。请注意,如果结果未流式传输,较大的查询限制可能会导致内存不足异常,因为所有结果会一次性加载到内存中。 |
| query_retries            | int         | 2                             | `query` 请求的最大重试次数。仅"可重试"的 HTTP 响应会被重试。驱动程序不会自动重试 `command` 或 `insert` 请求,以防止意外的重复请求。                                |
| connect_timeout          | int         | 10                            | HTTP 连接超时时间(秒)。                                                                                                                                                                                                                   |
| send_receive_timeout     | int         | 300                           | HTTP 连接的发送/接收超时时间(秒)。                                                                                                                                                                                                              |
| client_name              | str         | _None_                        | 添加到 HTTP User Agent 标头前面的 client_name。设置此项以在 ClickHouse system.query_log 中跟踪客户端查询。                                                                                                                             |
| pool_mgr                 | obj         | _&lt;default PoolManager&gt;_ | 要使用的 `urllib3` 库 PoolManager。用于需要到不同主机的多个连接池的高级用例。                                                                                                                              |
| http_proxy               | str         | _None_                        | HTTP 代理地址(等同于设置 HTTP_PROXY 环境变量)。                                                                                                                                                                       |
| https_proxy              | str         | _None_                        | HTTPS 代理地址(等同于设置 HTTPS_PROXY 环境变量)。                                                                                                                                                                     |
| apply_server_timezone    | bool        | True                          | 对时区感知的查询结果使用服务器时区。请参阅[时区优先级](advanced-querying.md#time-zones)                                                                                                                                      |
| show_clickhouse_errors   | bool        | True                          | 在客户端异常中包含详细的 ClickHouse 服务器错误消息和异常代码。                                                                                                                                                           |
| autogenerate_session_id  | bool        | _None_                        | 覆盖全局 `autogenerate_session_id` 设置。如果为 True,则在未提供会话 ID 时自动生成 UUID4 会话 ID。                                                                                                                      |
| proxy_path               | str         | &lt;empty string&gt;          | 可选的路径前缀,用于添加到 ClickHouse 服务器 URL 以进行代理配置。                                                                                                                                                                    |
| form_encode_query_params | bool        | False                         | 将查询参数作为表单编码数据在请求正文中发送,而不是作为 URL 参数。对于可能超过 URL 长度限制的大型参数集的查询很有用。                                                                           |
| rename_response_column   | str         | _None_                        | 可选的回调函数或列名映射,用于重命名查询结果中的响应列。                                                                                                                                                        |

### HTTPS/TLS 参数 {#httpstls-arguments}


| 参数        | 类型 | 默认值 | 描述                                                                                                                                                                                                                                                                       |
| ---------------- | ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify           | bool | True    | 使用 HTTPS/TLS 时验证 ClickHouse 服务器 TLS/SSL 证书(主机名、过期时间等)。                                                                                                                                                                                               |
| ca_cert          | str  | _None_  | 当 _verify_=_True_ 时,用于验证 ClickHouse 服务器证书的证书颁发机构根证书文件路径,.pem 格式。如果 verify 为 False 则忽略。如果 ClickHouse 服务器证书是经操作系统验证的全局可信根证书,则无需此参数。 |
| client_cert      | str  | _None_  | TLS 客户端证书文件路径,.pem 格式(用于双向 TLS 身份验证)。该文件应包含完整的证书链,包括所有中间证书。                                                                                                  |
| client_cert_key  | str  | _None_  | 客户端证书私钥文件路径。如果私钥未包含在客户端证书密钥文件中,则此参数为必需。                                                                                                                                             |
| server_host_name | str  | _None_  | ClickHouse 服务器主机名,由其 TLS 证书的 CN 或 SNI 标识。设置此参数可避免通过具有不同主机名的代理或隧道连接时出现 SSL 错误                                                                                            |
| tls_mode         | str  | _None_  | 控制高级 TLS 行为。`proxy` 和 `strict` 不调用 ClickHouse 双向 TLS 连接,但会发送客户端证书和密钥。`mutual` 表示使用客户端证书进行 ClickHouse 双向 TLS 身份验证。_None_/默认行为为 `mutual`                                  |

### Settings 参数 {#settings-argument}

最后,`get_client` 的 `settings` 参数用于在每个客户端请求中向服务器传递额外的 ClickHouse 设置。请注意,在大多数情况下,具有 _readonly_=_1_ 访问权限的用户无法更改随查询发送的设置,因此 ClickHouse Connect 将在最终请求中删除此类设置并记录警告。以下设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话,未作为通用 ClickHouse 设置记录。

| 设置           | 描述                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| buffer_size       | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小(以字节为单位)。                                                                         |
| session_id        | 用于在服务器上关联相关查询的唯一会话 ID。临时表需要此参数。                                                                   |
| compress          | ClickHouse 服务器是否应压缩 POST 响应数据。此设置仅应用于"原始"查询。                                        |
| decompress        | 发送到 ClickHouse 服务器的数据是否必须解压缩。此设置仅应用于"原始"插入。                                         |
| quota_key         | 与此请求关联的配额键。请参阅 ClickHouse 服务器关于配额的文档。                                                                   |
| session_check     | 用于检查会话状态。                                                                                                                                |
| session_timeout   | 会话 ID 标识的会话在超时并不再被视为有效之前的非活动秒数。默认为 60 秒。         |
| wait_end_of_query | 在 ClickHouse 服务器上缓冲整个响应。此设置是返回摘要信息所必需的,并在非流式查询中自动设置。 |
| role              | 用于会话的 ClickHouse 角色。可包含在查询上下文中的有效传输设置。                                                       |

有关可随每个查询发送的其他 ClickHouse 设置,请参阅 [ClickHouse 文档](/operations/settings/settings.md)。

### 客户端创建示例 {#client-creation-examples}

- 不带任何参数时,ClickHouse Connect 客户端将使用默认用户且无密码连接到 `localhost` 上的默认 HTTP 端口:

```python
import clickhouse_connect

```


client = clickhouse&#95;connect.get&#95;client()
print(client.server&#95;version)

# 输出: &#39;22.10.1.98&#39;

````

- 连接到安全的（HTTPS）外部 ClickHouse 服务器

```python
import clickhouse_connect
````


client = clickhouse&#95;connect.get&#95;client(host=&#39;play.clickhouse.com&#39;, secure=True, port=443, user=&#39;play&#39;, password=&#39;clickhouse&#39;)
print(client.command(&#39;SELECT timezone()&#39;))

# 输出：&#39;Etc/UTC&#39;

````

- 使用会话 ID 和其他自定义连接参数及 ClickHouse 设置进行连接。

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


## 客户端生命周期与最佳实践 {#client-lifecycle-and-best-practices}

创建 ClickHouse Connect 客户端是一项开销较大的操作,涉及建立连接、检索服务器元数据以及初始化设置。请遵循以下最佳实践以获得最优性能:

### 核心原则 {#core-principles}

- **复用客户端**: 在应用程序启动时创建一次客户端,并在整个应用程序生命周期内复用
- **避免频繁创建**: 不要为每个查询或请求创建新客户端(这会浪费每次操作数百毫秒)
- **正确清理**: 关闭应用程序时务必关闭客户端以释放连接池资源
- **尽可能共享**: 单个客户端可以通过其连接池处理多个并发查询(参见下文的线程说明)

### 基本模式 {#basic-patterns}

**✅ 推荐做法: 复用单个客户端**

```python
import clickhouse_connect

```


# 仅在启动时创建一次
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')



# 对所有查询复用该客户端
for i in range(1000):
    result = client.query('SELECT count() FROM users')



# 关闭时关闭客户端

client.close()

```

**❌ 错误做法：重复创建客户端**
```


```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### 多线程应用程序 {#multi-threaded-applications}

:::warning
使用会话 ID 时，客户端实例**不是线程安全的**。默认情况下,客户端会自动生成会话 ID,同一会话中的并发查询将引发 `ProgrammingError` 异常。
:::

要在多个线程之间安全地共享客户端:

```python
import clickhouse_connect
import threading

```


# 选项 1：禁用会话（推荐用于共享客户端）
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # 确保线程安全所必需
)

def worker(thread_id):
    # 所有线程现在都可以安全地使用同一个客户端
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()



client.close()

# 输出：

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

````

**会话的替代方案：** 如果需要使用会话（例如用于临时表），请为每个线程创建独立的客户端：

```python
def worker(thread_id):
    # 每个线程获得独立的客户端和隔离的会话
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... 使用临时表 ...
    client.close()
````

### 正确清理资源 {#proper-cleanup}

始终在关闭时关闭客户端。请注意，`client.close()` 仅在客户端拥有自己的连接池管理器时（例如使用自定义 TLS/代理选项创建时）才会释放客户端并关闭池化的 HTTP 连接。对于默认的共享连接池，请使用 `client.close_connections()` 主动清理套接字；否则，连接将通过空闲超时和进程退出自动回收。

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

或使用上下文管理器：

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```

### 何时使用多个客户端 {#when-to-use-multiple-clients}

以下场景适合使用多个客户端：

- **不同的服务器**：每个 ClickHouse 服务器或集群使用一个客户端
- **不同的凭据**：为不同的用户或访问级别使用独立的客户端
- **不同的数据库**：需要操作多个数据库时
- **隔离的会话**：需要为临时表或会话特定设置使用独立会话时
- **线程隔离**：线程需要独立会话时（如上所示）


## 常用方法参数 {#common-method-arguments}

多个客户端方法使用常用的 `parameters` 和 `settings` 参数中的一个或两个。下面将介绍这些关键字参数。

### Parameters 参数 {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数,用于将 Python 表达式绑定到 ClickHouse 值表达式。提供两种绑定方式。

#### 服务器端绑定 {#server-side-binding}

ClickHouse 支持大多数查询值的[服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters),绑定值作为 HTTP 查询参数与查询分开发送。如果 ClickHouse Connect 检测到形式为 `{<name>:<datatype>}` 的绑定表达式,将自动添加相应的查询参数。对于服务器端绑定,`parameters` 参数应为 Python 字典。

- 使用 Python 字典、DateTime 值和字符串值的服务器端绑定

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

这将在服务器上生成以下查询:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
服务器端绑定仅支持(由 ClickHouse 服务器)用于 `SELECT` 查询。不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。这在未来可能会改变;请参阅 https://github.com/ClickHouse/ClickHouse/issues/42092。
:::

#### 客户端绑定 {#client-side-binding}

ClickHouse Connect 还支持客户端参数绑定,在生成模板化 SQL 查询时提供更大的灵活性。对于客户端绑定,`parameters` 参数应为字典或序列。客户端绑定使用 Python ["printf" 风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)字符串格式化进行参数替换。

请注意,与服务器端绑定不同,客户端绑定不适用于数据库标识符,如数据库名、表名或列名,因为 Python 风格的格式化无法区分不同类型的字符串,而它们需要以不同的方式格式化(数据库标识符使用反引号或双引号,数据值使用单引号)。

- 使用 Python 字典、DateTime 值和字符串转义的示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

这将在服务器上生成以下查询:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

- 使用 Python 序列(元组)、Float64 和 IPv4Address 的示例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

这将在服务器上生成以下查询:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
要绑定 DateTime64 参数(具有亚秒精度的 ClickHouse 类型)需要采用以下两种自定义方法之一:

- 将 Python `datetime.datetime` 值包装在新的 DT64Param 类中,例如:

  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 使用字典的服务器端绑定
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # 使用列表的客户端绑定
    parameters=['a string', DT64Param(datetime.now())]
  ```

  - 如果使用参数值字典,请在参数名称后附加字符串 `_64`

  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 使用字典的服务器端绑定

  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### Settings 参数 {#settings-argument-1}

所有 ClickHouse Connect Client 的核心 "insert" 和 "select" 方法都接受一个可选的 `settings` 关键字参数,用于为相应的 SQL 语句传递 ClickHouse 服务器的[用户设置](/operations/settings/settings.md)。`settings` 参数应为字典类型。每个条目应包含一个 ClickHouse 设置名称及其对应的值。请注意,这些值在作为查询参数发送到服务器时会被转换为字符串。

与客户端级别的设置一样,ClickHouse Connect 会丢弃服务器标记为 *readonly*=*1* 的任何设置,并记录相应的日志消息。仅适用于通过 ClickHouse HTTP 接口执行查询的设置始终有效。这些设置在 `get_client` [API](#settings-argument) 中有详细说明。

使用 ClickHouse 设置的示例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## 客户端 `command` 方法 {#client-command-method}

使用 `Client.command` 方法向 ClickHouse 服务器发送通常不返回数据的 SQL 查询,或仅返回单个基本类型值或数组值而非完整数据集的查询。此方法接受以下参数:

| 参数          | 类型             | 默认值     | 描述                                                                                                                                                          |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cmd           | str              | _必需_     | 返回单个值或单行值的 ClickHouse SQL 语句。                                                                                                                     |
| parameters    | dict or iterable | _None_     | 参见[参数说明](#parameters-argument)。                                                                                                                        |
| data          | str or bytes     | _None_     | 可选数据,作为 POST 请求体包含在命令中。                                                                                                                           |
| settings      | dict             | _None_     | 参见[设置说明](#settings-argument)。                                                                                                                          |
| use_database  | bool             | True       | 使用客户端数据库(在创建客户端时指定)。False 表示命令将使用已连接用户的 ClickHouse 服务器默认数据库。                                                              |
| external_data | ExternalData     | _None_     | 包含文件或二进制数据的 `ExternalData` 对象,用于查询。参见[高级查询(外部数据)](advanced-querying.md#external-data)                                              |

### 命令示例 {#command-examples}

#### DDL 语句 {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 创建表
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # 返回包含 query_id 的 QuerySummary 对象



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


# 使用服务端参数

result = client.command(
"SELECT count() FROM system.tables WHERE database = {db:String}",
parameters={"db": "system"}
)

````

#### 带配置的命令 {#commands-with-settings}

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


## 客户端 `query` 方法 {#client-query-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个"批量"数据集的主要方式。它通过 HTTP 使用 ClickHouse 原生格式高效传输大型数据集(最多约一百万行)。此方法接受以下参数:

| 参数                | 类型             | 默认值     | 描述                                                                                                                                                                        |
| ------------------- | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query               | str              | _必需_ | ClickHouse SQL SELECT 或 DESCRIBE 查询语句。                                                                                                                                       |
| parameters          | dict or iterable | _None_     | 参见 [parameters 参数说明](#parameters-argument)。                                                                                                                                |
| settings            | dict             | _None_     | 参见 [settings 参数说明](#settings-argument)。                                                                                                                                    |
| query_formats       | dict             | _None_     | 结果值的数据类型格式化规范。参见高级用法(读取格式)                                                                                             |
| column_formats      | dict             | _None_     | 按列指定的数据类型格式化。参见高级用法(读取格式)                                                                                                                  |
| encoding            | str              | _None_     | 用于将 ClickHouse String 列编码为 Python 字符串的编码方式。如果未设置,Python 默认使用 `UTF-8`。                                                                      |
| use_none            | bool             | True       | 对 ClickHouse NULL 值使用 Python _None_ 类型。如果为 False,则对 ClickHouse NULL 值使用数据类型默认值(如 0)。注意 - 出于性能考虑,NumPy/Pandas 默认为 False。 |
| column_oriented     | bool             | False      | 以列序列而非行序列的形式返回结果。有助于将 Python 数据转换为其他面向列的数据格式。                            |
| query_tz            | str              | _None_     | 来自 `zoneinfo` 数据库的时区名称。此时区将应用于查询返回的所有 datetime 或 Pandas Timestamp 对象。                                     |
| column_tzs          | dict             | _None_     | 列名到时区名称的字典映射。类似于 `query_tz`,但允许为不同列指定不同的时区。                                                    |
| use_extended_dtypes | bool             | True       | 使用 Pandas 扩展数据类型(如 StringArray),以及 pandas.NA 和 pandas.NaT 表示 ClickHouse NULL 值。仅适用于 `query_df` 和 `query_df_stream` 方法。                  |
| external_data       | ExternalData     | _None_     | 包含用于查询的文件或二进制数据的 ExternalData 对象。参见 [高级查询(外部数据)](advanced-querying.md#external-data)                            |
| context             | QueryContext     | _None_     | 可重用的 QueryContext 对象,可用于封装上述方法参数。参见 [高级查询(QueryContexts)](advanced-querying.md#querycontexts)                   |

### 查询示例 {#query-examples}

#### 基本查询 {#basic-query}

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



# 访问列名和类型

print(result.column&#95;names)

# 输出: (&quot;name&quot;, &quot;database&quot;)

print([col&#95;type.name for col&#95;type in result.column&#95;types])

# 输出: [&#39;String&#39;, &#39;String&#39;]

````

#### 访问查询结果 {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# 行式访问（默认）
print(result.result_rows)
# 输出: [[0, "0"], [1, "1"], [2, "2"]]



# 列式访问
print(result.result_columns)
# 输出: [[0, 1, 2], ["0", "1", "2"]]



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

# 输出: (0, &quot;0&quot;)

````

#### 使用客户端参数查询 {#query-with-client-side-parameters}

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


# 服务器端绑定(更安全,SELECT 查询性能更佳)

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
- `summary` -- 由 `X-ClickHouse-Summary` HTTP 响应头返回的任何数据
- `first_item` -- 便捷属性,用于将响应的第一行作为字典检索(键为列名)
- `first_row` -- 便捷属性,用于返回结果的第一行
- `column_block_stream` -- 以列式格式生成查询结果的生成器。不应直接引用此属性(见下文)。
- `row_block_stream` -- 以行式格式生成查询结果的生成器。不应直接引用此属性(见下文)。
- `rows_stream` -- 每次调用生成单行查询结果的生成器。不应直接引用此属性(见下文)。
- `summary` -- 如 `command` 方法中所述,由 ClickHouse 返回的摘要信息字典

`*_stream` 属性返回一个 Python 上下文,可用作返回数据的迭代器。应仅通过客户端的 `*_stream` 方法间接访问这些属性。

流式查询结果的完整详细信息(使用 StreamContext 对象)在[高级查询(流式查询)](advanced-querying.md#streaming-queries)中说明。

```


## 使用 NumPy、Pandas 或 Arrow 处理查询结果 {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect 为 NumPy、Pandas 和 Arrow 数据格式提供了专用的查询方法。有关使用这些方法的详细信息,包括示例、流式处理功能和高级类型处理,请参阅[高级查询(NumPy、Pandas 和 Arrow 查询)](advanced-querying.md#numpy-pandas-and-arrow-queries)。


## 客户端流式查询方法 {#client-streaming-query-methods}

对于流式处理大型结果集，ClickHouse Connect 提供了多种流式方法。详细信息和示例请参阅[高级查询（流式查询）](advanced-querying.md#streaming-queries)。


## 客户端 `insert` 方法 {#client-insert-method}

对于向 ClickHouse 插入多条记录的常见用例,可以使用 `Client.insert` 方法。该方法接受以下参数:

| 参数               | 类型                              | 默认值     | 描述                                                                                                                                                                                          |
| ------------------ | --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table              | str                               | _必需_     | 要插入数据的 ClickHouse 表。允许使用完整的表名(包括数据库)。                                                                                                                                    |
| data               | Sequence of Sequences             | _必需_     | 要插入的数据矩阵,可以是行序列(每行是列值序列),也可以是列序列(每列是行值序列)。                                                                                                                  |
| column_names       | Sequence of str, or str           | '\*'       | 数据矩阵的列名列表。如果使用 '\*',ClickHouse Connect 将执行"预查询"来检索表的所有列名。                                                                                                         |
| database           | str                               | ''         | 插入操作的目标数据库。如果未指定,将使用客户端的数据库。                                                                                                                                         |
| column_types       | Sequence of ClickHouseType        | _None_     | ClickHouseType 实例列表。如果 column_types 和 column_type_names 都未指定,ClickHouse Connect 将执行"预查询"来检索表的所有列类型。                                                                |
| column_type_names  | Sequence of ClickHouse type names | _None_     | ClickHouse 数据类型名称列表。如果 column_types 和 column_type_names 都未指定,ClickHouse Connect 将执行"预查询"来检索表的所有列类型。                                                            |
| column_oriented    | bool                              | False      | 如果为 True,则假定 `data` 参数是列序列(无需"转置"即可插入数据)。否则 `data` 被解释为行序列。                                                                                                    |
| settings           | dict                              | _None_     | 参见 [settings 描述](#settings-argument)。                                                                                                                                                    |
| context            | InsertContext                     | _None_     | 可以使用可重用的 InsertContext 对象来封装上述方法参数。参见 [高级插入 (InsertContexts)](advanced-inserting.md#insertcontexts)                                                                  |
| transport_settings | dict                              | _None_     | 可选的传输层设置字典(HTTP 头等)。                                                                                                                                                              |

此方法返回一个"查询摘要"字典,如"command"方法中所述。如果插入因任何原因失败,将抛出异常。

有关适用于 Pandas DataFrames、PyArrow Tables 和 Arrow 支持的 DataFrames 的专用插入方法,请参见 [高级插入(专用插入方法)](advanced-inserting.md#specialized-insert-methods)。

:::note
NumPy 数组是有效的 Sequence of Sequences,可以用作主 `insert` 方法的 `data` 参数,因此不需要专用方法。
:::

### 示例 {#examples}

以下示例假设存在一个具有模式 `(id UInt32, name String, age UInt8)` 的表 `users`。

#### 基本的面向行插入 {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 行式数据：每个内层列表代表一行记录

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


# 列式数据：每个内部列表表示一列

data = [
[1, 2, 3],  # id 列
[&quot;Alice&quot;, &quot;Bob&quot;, &quot;Joe&quot;],  # name 列
[25, 30, 28],  # age 列
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;], column&#95;oriented=True)

````

#### 使用显式列类型插入数据 {#insert-with-explicit-column-types}

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


# 向特定数据库中的表插入数据

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## 文件插入 {#file-inserts}

如需将文件中的数据直接插入到 ClickHouse 表中,请参阅[高级插入(文件插入)](advanced-inserting.md#file-inserts)。


## 原始 API {#raw-api}

对于需要直接访问 ClickHouse HTTP 接口且无需类型转换的高级使用场景,请参阅[高级用法(原始 API)](advanced-usage.md#raw-api)。


## 实用工具类和函数 {#utility-classes-and-functions}

以下类和函数也被视为"公共"`clickhouse-connect` API 的一部分,与上述文档中的类和方法一样,在次要版本之间保持稳定。这些类和函数的破坏性变更仅会在次要版本(而非补丁版本)发布时发生,并且在至少一个次要版本中以已弃用状态提供。

### 异常 {#exceptions}

所有自定义异常(包括 DB API 2.0 规范中定义的异常)都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序实际检测到的异常将使用其中一种类型。

### ClickHouse SQL 实用工具 {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。同样,`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。


## 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

有关在多线程、多进程和异步/事件驱动应用程序中使用 ClickHouse Connect 的信息,请参阅[高级用法(多线程、多进程和异步/事件驱动用例)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)。


## AsyncClient 包装器 {#asyncclient-wrapper}

有关在 asyncio 环境中使用 AsyncClient 包装器的信息,请参阅[高级用法(AsyncClient 包装器)](advanced-usage.md#asyncclient-wrapper)。


## 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

有关在多线程或并发应用程序中管理 ClickHouse 会话 ID 的信息，请参阅[高级用法（管理 ClickHouse 会话 ID）](advanced-usage.md#managing-clickhouse-session-ids)。


## 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

有关在大型多线程应用程序中自定义 HTTP 连接池的信息,请参阅[高级用法(自定义 HTTP 连接池)](advanced-usage.md#customizing-the-http-connection-pool)。
