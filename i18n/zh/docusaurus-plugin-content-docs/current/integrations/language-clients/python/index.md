---
'sidebar_label': 'Python'
'sidebar_position': 10
'keywords':
- 'clickhouse'
- 'python'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/python'
'description': 'The ClickHouse Connect project suite for connecting Python to ClickHouse'
'title': 'Python Integration with ClickHouse Connect'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# Python 与 ClickHouse Connect 的集成
## 引言 {#introduction}

ClickHouse Connect 是一个核心数据库驱动程序，提供与各种 Python 应用程序的互操作性。

- 主要接口是 `clickhouse_connect.driver` 包中的 `Client` 对象。该核心包还包含用于与 ClickHouse 服务器通信的各种辅助类和实用程序函数，以及用于高级管理插入和选择查询的“上下文”实现。
- `clickhouse_connect.datatypes` 包提供了所有非实验性 ClickHouse 数据类型的基本实现和子类。其主要功能是将 ClickHouse 数据序列化和反序列化为 ClickHouse 的“原生”二进制列式格式，用于在 ClickHouse 和客户端应用程序之间实现最高效的传输。
- `clickhouse_connect.cdriver` 包中的 Cython/C 类优化了一些最常用的序列化和反序列化，显著改善了纯 Python 的性能。
- 在 `clickhouse_connect.cc_sqlalchemy` 包中有一个有限的 [SQLAlchemy](https://www.sqlalchemy.org/) 方言，这是基于 `datatypes` 和 `dbi` 包构建的。该限制性的实现专注于查询/游标功能，通常不支持 SQLAlchemy DDL 和 ORM 操作。（SQLAlchemy 针对的是 OLTP 数据库，我们建议使用更专业的工具和框架来管理 ClickHouse 面向 OLAP 的数据库。）
- 核心驱动程序和 ClickHouse Connect SQLAlchemy 实现是将 ClickHouse 连接到 Apache Superset 的首选方法。使用 `ClickHouse Connect` 数据库连接或 `clickhousedb` SQLAlchemy 方言连接字符串。

本文件的内容是截至 beta 版本 0.8.2 时的最新信息。

:::note
官方 ClickHouse Connect Python 驱动程序使用 HTTP 协议与 ClickHouse 服务器进行通信。它具有一些优点（如更好的灵活性，支持 HTTP 负载均衡器，与基于 JDBC 的工具的更好兼容性等）和缺点（如压缩和性能略低，以及缺乏对某些复杂特性的支持原生基于 TCP 的协议）。对于某些用例，您可以考虑使用使用原生 TCP 协议的 [社区 Python 驱动程序](/interfaces/third-party/client-libraries.md)。
:::
### 要求和兼容性 {#requirements-and-compatibility}

|    Python |   |       Platform¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |

¹ClickHouse Connect 已在列出的平台上明确测试。此外，为所有由优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目支持的体系结构构建了未经测试的二进制轮子（带C优化）。
最后，由于 ClickHouse Connect 还可以作为纯 Python 运行，因此源安装应适用于任何最近的 Python 安装。

²再次强调，SQLAlchemy 的支持主要限于查询功能。完整的 SQLAlchemy API 不受到支持。

³ClickHouse Connect 已针对所有当前支持的 ClickHouse 版本进行了测试。由于它使用 HTTP 协议，因此它也应该可以正确地与大多数其他版本的 ClickHouse 一起使用，尽管某些高级数据类型可能存在一些不兼容。
### 安装 {#installation}

通过 pip 从 PyPI 安装 ClickHouse Connect：

`pip install clickhouse-connect`

ClickHouse Connect 也可以从源代码安装：
* `git clone` [GitHub 仓库](https://github.com/ClickHouse/clickhouse-connect)。
* （可选）运行 `pip install cython` 以构建并启用 C/Cython 优化。
* `cd` 到项目根目录并运行 `pip install .`
### 支持政策 {#support-policy}

ClickHouse Connect 当前处于 beta 阶段，仅当前的 beta 发布版本处于积极支持之中。请在报告任何问题之前更新到最新版本。问题应在 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues) 中提交。未来版本的 ClickHouse Connect 确保与发布时处于积极支持的 ClickHouse 版本兼容（通常是最近三个“稳定”和最近两个“lts”版本）。
### 基本用法 {#basic-usage}
### 收集连接细节 {#gather-your-connection-details}

<ConnectionDetails />
#### 建立连接 {#establish-a-connection}

有两个示例说明如何连接到 ClickHouse：
- 连接到本地主机上的 ClickHouse 服务器。
- 连接到 ClickHouse Cloud 服务。
##### 使用 ClickHouse Connect 客户端实例连接到本地主机上的 ClickHouse 服务器： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用之前收集的连接细节。 ClickHouse Cloud 服务需要 TLS，因此请使用端口 8443。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### 与您的数据库交互 {#interact-with-your-database}

要运行 ClickHouse SQL 命令，请使用客户端的 `command` 方法：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据，请使用客户端的 `insert` 方法，传入二维数组的行和值：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

要使用 ClickHouse SQL 检索数据，请使用客户端的 `query` 方法：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect 驱动程序 API {#clickhouse-connect-driver-api}

***注意：*** 由于参数数量众多，大多数 API 方法建议传递关键字参数，其中大多数是可选的。

* 此处未记录的方法不被视为 API 的一部分，可能会被移除或更改。*
### 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类提供了 Python 应用程序与 ClickHouse 数据库服务器之间的主要接口。使用 `clickhouse_connect.get_client` 函数获取 Client 实例，该实例接受以下参数：
#### 连接参数 {#connection-arguments}

| 参数               | 类型         | 默认值                       | 描述                                                                                                                                                                                                                                               |
|-------------------|--------------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface         | str          | http                         | 必须为 http 或 https。                                                                                                                                                                                                                             |
| host              | str          | localhost                    | ClickHouse 服务器的主机名或 IP 地址。如果未设置，将使用 `localhost`。                                                                                                                                                                            |
| port              | int          | 8123 或 8443                 | ClickHouse 的 HTTP 或 HTTPS 端口。如果未设置，默认为 8123，或者在 *secure*=*True* 或 *interface*=*https* 时默认为 8443。                                                                                                                         |
| username          | str          | default                      | ClickHouse 用户名。如果未设置，将使用 `default` ClickHouse 用户。                                                                                                                                                                                 |
| password          | str          | *&lt;空字符串&gt;*          | *username* 的密码。                                                                                                                                                                                                                                 |
| database          | str          | *None*                       | 连接的默认数据库。如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                                                    |
| secure            | bool         | False                        | 使用 https/TLS。这将覆盖来自接口或端口参数的推断值。                                                                                                                                                                                           |
| dsn               | str          | *None*                       | 标准 DSN（数据源名称）格式的字符串。如果未另行设置，将从此字符串提取其他连接值（例如主机或用户）。                                                                                                                                                  |
| compress          | bool or str  | True                         | 为 ClickHouse HTTP 插入和查询结果启用压缩。请参见 [附加选项（压缩）](#compression)                                                                                                                                                                |
| query_limit       | int          | 0（无限制）                  | 返回任何 `query` 响应的最大行数。将此设置为零以返回不限制行数。注意，较大的查询限制可能会导致内存不足异常，如果结果未流式输出，因为所有结果都会一次性加载到内存中。                                                                                           |
| query_retries     | int          | 2                            | `query` 请求的最大重试次数。只有“可重试”的 HTTP 响应才会被重试。`command` 或 `insert` 请求不会自动由驱动程序重试，以防止无意中的重复请求。                                                                                                         |
| connect_timeout   | int          | 10                           | HTTP 连接超时时间（秒）。                                                                                                                                                                                                                           |
| send_receive_timeout | int       | 300                          | HTTP 连接的发送/接收超时时间（秒）。                                                                                                                                                                                                                |
| client_name       | str          | *None*                       | prepended 于 HTTP User Agent 标头的 client_name。将其设置为在 ClickHouse system.query_log 中跟踪客户端查询。                                                                                                                                  |
| pool_mgr          | obj          | *&lt;默认池管理器&gt;*      | 要使用的 `urllib3` 库 PoolManager。用于需要多个连接池到不同主机的高级用例。                                                                                                                                                                        |
| http_proxy        | str          | *None*                       | HTTP 代理地址（相当于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                                  |
| https_proxy       | str          | *None*                       | HTTPS 代理地址（相当于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                                               |
| apply_server_timezone | bool    | True                         | 对于时区友好的查询结果，使用服务器时区。请参见 [时区优先级](#time-zones)                                                                                                                                                                         |
#### HTTPS/TLS 参数 {#httpstls-arguments}

| 参数              | 类型  | 默认   | 描述                                                                                                                                                                                                                                            |
|-------------------|-------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify            | bool  | True   | 如果使用 HTTPS/TLS，则验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、到期等）。                                                                                                                                                                   |
| ca_cert           | str   | *None* | 如果 *verify*=*True*，则为用于验证 ClickHouse 服务器证书的证书颁发机构 (CA) 根文件路径，格式为 .pem。如果验证为 False，则忽略。对于系统验证的全球受信任根文件，无需此项。                                                                                                    |
| client_cert       | str   | *None* | TLS 客户端证书的文件路径，格式为 .pem（用于双向 TLS 身份验证）。该文件应包含完整的证书链，包括所有中间证书。                                                                                                                                         |
| client_cert_key   | str   | *None* | 客户端证书的私钥的文件路径。如果客户端证书中未包含私钥，则必需。                                                                                                                                                                                  |
| server_host_name  | str   | *None* | 由 TLS 证书的 CN 或 SNI 标识的 ClickHouse 服务器主机名。设置此项以避免通过具有不同主机名的代理或隧道连接时出现 SSL 错误。                                                                                                                             |
| tls_mode          | str   | *None* | 控制高级 TLS 行为。`proxy` 和 `strict` 不调用 ClickHouse 双向 TLS 连接，但会发送客户端证书和密钥。`mutual` 假设 ClickHouse 进行双向 TLS 认证并使用客户端证书。*None*/默认行为为 `mutual`。                                                                                               |
#### 设置参数 {#settings-argument}

最后，传递给 `get_client` 的 `settings` 参数用于将额外的 ClickHouse 设置传递到服务器，以供每个客户端请求使用。请注意，在大多数情况下，具有 *readonly*=*1* 权限的用户无法更改随查询发送的设置，因此 ClickHouse Connect 将在最终请求中丢弃这些设置并记录警告。以下设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话，并未记录为一般 ClickHouse 设置。

| 设置               | 描述                                                                                                                                                      |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size        | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（以字节为单位）。                                                                                  |
| session_id         | 用于在服务器上关联相关查询的唯一会话 ID。临时表所需。                                                                                                   |
| compress           | ClickHouse 服务器是否应压缩 POST 响应数据。此设置仅应用于“原始”查询。                                                                                    |
| decompress         | 发送到 ClickHouse 服务器的数据是否必须解压缩。此设置仅应用于“原始”插入。                                                                                   |
| quota_key          | 与此请求关联的配额键。请参阅 ClickHouse 服务器文档中的配额。                                                                                                |
| session_check      | 用于检查会话状态。                                                                                                                                      |
| session_timeout    | 在活动不超过会话 ID 指定的秒数后，将超时且不再被视为有效。默认值为 60 秒。                                                                               |
| wait_end_of_query  | 在 ClickHouse 服务器上缓冲整个响应。此设置在返回摘要信息时是必需的，并且在非流查询中自动设置。                                                             |

有关可以随每个查询发送的其他 ClickHouse 设置，请参阅 [ClickHouse 文档](/operations/settings/settings.md)。
#### 客户端创建示例 {#client-creation-examples}

- 没有任何参数，ClickHouse Connect 客户端将连接到 `localhost` 上的默认 HTTP 端口，使用默认用户且不需密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 连接到安全的 (https) 外部 ClickHouse 服务器

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- 使用会话 ID 和其他自定义连接参数及 ClickHouse 设置进行连接。

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com',
                                       user='play',
                                       password='clickhouse',
                                       port=443,
                                       session_id='example_session_1',
                                       connect_timeout=15,
                                       database='github',
                                       settings={'distributed_ddl_task_timeout':300})
client.database
Out[2]: 'github'
```
### 公共方法参数 {#common-method-arguments}

多个客户端方法使用一个或两个公共的 `parameters` 和 `settings` 参数。这些关键字参数如下所述。
#### 参数参数 {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选择的 `parameters` 关键字参数，用于将 Python 表达式绑定到 ClickHouse 值表达式。有两种绑定方式可用。
##### 服务器端绑定 {#server-side-binding}

ClickHouse 支持 [服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters) ，适用于大多数查询值，其中绑定值作为 HTTP 查询参数与查询分开发送。如果 ClickHouse Connect 检测到形式为 `{&lt;name&gt;:&lt;datatype&gt;}` 的绑定表达式，它将添加适当的查询参数。对于服务器端绑定，`parameters` 参数应该是一个 Python 字典。

- 使用 Python 字典、DateTime 值和字符串值的服务器端绑定

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# Generates the following query on the server

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** - 服务器端绑定仅对 `SELECT` 查询（由 ClickHouse 服务器支持）。它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。未来可能会发生变化，参见 https://github.com/ClickHouse/ClickHouse/issues/42092。
##### 客户端绑定 {#client-side-binding}

ClickHouse Connect 还支持客户端参数绑定，这可以在生成模板化 SQL 查询时提供更多灵活性。对于客户端绑定，`parameters` 参数应为字典或序列。客户端绑定使用 Python 的 ["printf" 样式](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 字符串格式化进行参数替换。

请注意，与服务器端绑定不同，客户端绑定不适用于数据库标识符，例如数据库、表或列名，因为 Python 样式格式化无法区分不同类型的字符串，它们需要以不同的方式格式化（数据库标识符用反引号或双引号，数据值用单引号）。

- 使用 Python 字典、DateTime 值和字符串转义的示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# Generates the following query:

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- 使用 Python 序列（元组）、Float64 和 IPv4Address 的示例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# Generates the following query:

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
要绑定 DateTime64 参数（精确到毫秒的 ClickHouse 类型），需要采取两种自定义方法之一：
- 将 Python `datetime.datetime` 值包装在新的 DT64Param 类中，例如：
```python
    query = 'SELECT {p1:DateTime64(3)}'  # Server side binding with dictionary
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client side binding with list 
    parameters=['a string', DT64Param(datetime.now())]
```
  - 如果使用参数值字典，则在参数名称后附加字符串 `_64`
```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server side binding with dictionary
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
#### 设置参数 {#settings-argument-1}

所有主要 ClickHouse Connect 客户端的 “insert” 和 “select” 方法接受一个可选的 `settings` 关键字参数，用于传递 ClickHouse 服务器的 [用户设置](/operations/settings/settings.md) 供包含的 SQL 语句使用。`settings` 参数应为字典。每个项目应为 ClickHouse 设置名称及其关联值。请注意，值在作为查询参数发送到服务器时将被转换为字符串。

与客户端级别设置一样，ClickHouse Connect 将丢弃服务器标记为 *readonly*=*1* 的任何设置，并附有相关日志消息。仅适用于通过 ClickHouse HTTP 接口的查询的设置始终有效。这些设置在 `get_client` [API](#settings-argument) 中进行描述。

使用 ClickHouse 设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### Client _command_ 方法 {#client-_command_-method}

使用 `Client.command` 方法向 ClickHouse 服务器发送 SQL 查询，这些查询通常不返回数据或返回单个原始值或数组值。该方法接受以下参数：

| 参数              | 类型             | 默认     | 描述                                                                                                                                                         |
|-------------------|------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd                | str               | *必填*   | 返回单个值或单行值的 ClickHouse SQL 语句。                                                                                                                 |
| parameters         | dict 或可迭代对象 | *无*     | 请参见 [参数描述](#parameters-argument)。                                                                                                                   |
| data               | str 或字节       | *无*     | 要与命令一起包含的可选数据，作为 POST 主体。                                                                                                               |
| settings           | dict              | *无*     | 请参见 [设置描述](#settings-argument)。                                                                                                                     |
| use_database       | bool              | True     | 使用客户端数据库（在创建客户端时指定）。False 表示该命令将使用连接用户的默认 ClickHouse 服务器数据库。                                                             |
| external_data      | ExternalData      | *无*     | 包含要与查询一起使用的文件或二进制数据的 ExternalData 对象。参见 [高级查询（外部数据）](#external-data)                                                               |

- _command_ 可用于 DDL 语句。如果 SQL “命令”不返回数据，则返回“查询摘要”字典。该字典封装 ClickHouse 的 X-ClickHouse-Summary 和 X-ClickHouse-Query-Id 头，包括 `written_rows`、`written_bytes` 和 `query_id` 的键/值对。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_ 也可用于只返回单行的简单查询

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client _query_ 方法 {#client-_query_-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个“批次”数据集的主要方法。它利用原生 ClickHouse 格式通过 HTTP 高效地传输大型数据集（最多约一百万行）。该方法接受以下参数。

| 参数               | 类型             | 默认     | 描述                                                                                                                                                                     |
|---------------------|------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str               | *必填*   | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                 |
| parameters          | dict 或可迭代对象 | *无*     | 请参见 [参数描述](#parameters-argument)。                                                                                                                                 |
| settings            | dict              | *无*     | 请参见 [设置描述](#settings-argument)。                                                                                                                                 |
| query_formats       | dict              | *无*     | 结果值的数据类型格式规范。参见高级用法（读取格式）                                                                                                                                 |
| column_formats      | dict              | *无*     | 每列的数据类型格式。参见高级用法（读取格式）                                                                                                                                 |
| encoding            | str               | *无*     | 用于将 ClickHouse 字符串列编码为 Python 字符串的编码。如果未设置，Python 默认使用 `UTF-8`。                                                                                                                |
| use_none            | bool              | True     | 对于 ClickHouse null，使用 Python *None* 类型。如果为 False，则使用数据类型默认值（例如 0）表示 ClickHouse null。注意 - 默认情况下，对于 NumPy/Pandas 出于性能原因默认为 False。                           |
| column_oriented     | bool              | False    | 将结果作为列序列返回，而不是行序列。这对于将 Python 数据转换为其他列式数据格式非常有用。                                                                                                                            |
| query_tz            | str               | *无*     | 来自 `zoneinfo` 数据库的时区名称。该时区将应用于查询返回的所有 datetime 或 Pandas Timestamp 对象。                                                                                               |
| column_tzs          | dict              | *无*     | 列名到时区名称的字典。与 `query_tz` 类似，但允许为不同列指定不同的时区。                                                                                                                              |
| use_extended_dtypes | bool              | True     | 使用 Pandas 扩展数据类型（如 StringArray），以及 pandas.NA 和 pandas.NaT 表示 ClickHouse NULL 值。仅适用于 `query_df` 和 `query_df_stream` 方法。                                                                                     |
| external_data       | ExternalData      | *无*     | 包含要与查询一起使用的文件或二进制数据的 ExternalData 对象。参见 [高级查询（外部数据）](#external-data)。                                                                                                           |
| context             | QueryContext      | *无*     | 可重复使用的 QueryContext 对象可以用于封装上述方法参数。请参见 [高级查询（QueryContexts）](#querycontexts)。                                                                                                           |
#### The QueryResult Object {#the-queryresult-object}

基本的 `query` 方法返回一个 QueryResult 对象，具有以下公共属性：

- `result_rows` -- 以行的序列形式返回的数据矩阵，每个行元素是列值的序列。
- `result_columns` -- 以列的序列形式返回的数据矩阵，每个列元素是该列的行值序列。
- `column_names` -- 表示 `result_set` 中列名的字符串元组。
- `column_types` -- 表示 `result_columns` 中每一列的 ClickHouse 数据类型的 ClickHouseType 实例元组。
- `query_id` -- ClickHouse 查询的 query_id （有助于在 `system.query_log` 表中检查查询）。
- `summary` -- 由 `X-ClickHouse-Summary` HTTP 响应头返回的任何数据。
- `first_item` -- 便于以字典形式获取响应的第一行（键为列名）。
- `first_row` -- 返回结果的第一行的便捷属性。
- `column_block_stream` -- 以列导向格式返回查询结果的生成器。该属性不应直接引用（见下文）。
- `row_block_stream` -- 以行导向格式返回查询结果的生成器。该属性不应直接引用（见下文）。
- `rows_stream` -- 返回每次调用的单行查询结果的生成器。该属性不应直接引用（见下文）。
- `summary` -- 如 `command` 方法下所述，由 ClickHouse 返回的摘要信息字典。

`*_stream` 属性返回一个 Python 上下文，可以用作返回数据的迭代器。它们只能通过客户端的 `*_stream` 方法间接访问。

有关流式查询结果的完整详细信息（使用 StreamContext 对象）将在[高级查询（流式查询）](#streaming-queries)中概述。
### Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

主要 `query` 方法有三种专门的版本：

- `query_np` -- 此版本返回 NumPy 数组，而不是 ClickHouse Connect QueryResult。
- `query_df` -- 此版本返回 Pandas 数据框，而不是 ClickHouse Connect QueryResult。
- `query_arrow` -- 此版本返回 PyArrow 表。它直接利用 ClickHouse 的 `Arrow` 格式，因此只接受与主要 `query` 方法共同的三个参数： `query`、`parameters` 和 `settings`。此外，还有一个额外参数 `use_strings` 用于确定 Arrow 表是否将 ClickHouse 字符串类型呈现为字符串（如果为 True）或字节（如果为 False）。
### Client Streaming Query Methods {#client-streaming-query-methods}

ClickHouse Connect 客户端提供多种方法以流式方式检索数据（实现为 Python 生成器）：

- `query_column_block_stream` -- 以原生 Python 对象的列序列形式返回查询数据。
- `query_row_block_stream` -- 以原生 Python 对象的行块形式返回查询数据。
- `query_rows_stream` -- 以原生 Python 对象的行序列形式返回查询数据。
- `query_np_stream` -- 将每个 ClickHouse 查询数据块返回为 NumPy 数组。
- `query_df_stream` -- 将每个 ClickHouse 查询数据块返回为 Pandas 数据框。
- `query_arrow_stream` -- 将查询数据以 PyArrow RecordBlocks 格式返回。

这些方法中的每一个返回一个必须通过 `with` 语句打开的 `ContextStream` 对象，以开始消耗流。有关详细信息和示例，请参见[高级查询（流式查询）](#streaming-queries)。
### Client _insert_ Method {#client-_insert_-method}

对于将多个记录插入 ClickHouse 的常见用例，有 `Client.insert` 方法。它接受以下参数：

| 参数             | 类型                            | 默认值      | 描述                                                                                                                                                                                     |
|-----------------|---------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table           | str                             | *必填*     | 要插入的 ClickHouse 表。允许全表名（包括数据库）。                                                                                                                                       |
| data            | Sequence of Sequences           | *必填*     | 要插入的数据矩阵，可以是一个行的序列，每行是列值的序列，或者是一个列的序列，每列是行值的序列。                                                                                                   |
| column_names    | Sequence of str, or str         | '*'         | 数据矩阵的列名称列表。如果使用 '*'，ClickHouse Connect 将执行一个“预查询”以检索表的所有列名称。                                                                                            |
| database        | str                             | ''          | 插入的目标数据库。如果未指定，将假定为客户端的数据库。                                                                                                                                      |
| column_types    | Sequence of ClickHouseType      | *无*       | ClickHouseType 实例列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行一个“预查询”以检索表的所有列类型。                                                |
| column_type_names | Sequence of ClickHouse 类型名称 | *无*      | ClickHouse 数据类型名称列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行一个“预查询”以检索表的所有列类型。                                          |
| column_oriented | bool                            | False       | 如果为 True，则假定 `data` 参数为列的序列（无需对数据进行“旋转”）。否则，`data` 被解释为行的序列。                                                                                      |
| settings        | dict                            | *无*      | 请参阅 [settings description](#settings-argument)。                                                                                                                                   |
| insert_context  | InsertContext                   | *无*       | 可以使用可重用的 InsertContext 对象来封装上述方法参数。请参阅 [高级插入（InsertContexts）](#insertcontexts)。                                                                           |

此方法返回“查询摘要”字典，如“command”方法下所述。如果插入因任何原因失败，将引发异常。

主要 `insert` 方法有两种专门版本：

- `insert_df` -- 此方法的第二个参数需要一个 Pandas 数据框实例的 `df` 参数，而不是 Python 行的序列 `data` 参数。ClickHouse Connect 自动将数据框处理为列导向的数据源，因此 `column_oriented` 参数不是必需的或可用的。
- `insert_arrow` -- 此方法需要一个 `arrow_table`，而不是 Python 行的序列 `data` 参数。ClickHouse Connect 将 Arrow 表未经修改地传递给 ClickHouse 服务器进行处理，因此除了 `table` 和 `arrow_table` 之外，只有 `database` 和 `settings` 参数可用。

*注意：* NumPy 数组是有效的序列，可用作主要 `insert` 方法的 `data` 参数，因此不需要专门的方法。
### File Inserts {#file-inserts}

`clickhouse_connect.driver.tools` 包含 `insert_file` 方法，允许从文件系统直接插入数据到现有的 ClickHouse 表中。解析工作委托给 ClickHouse 服务器。`insert_file` 接受以下参数：

| 参数          | 类型           | 默认值           | 描述                                                                                                                         |
|--------------|----------------|------------------|------------------------------------------------------------------------------------------------------------------------------|
| client       | Client         | *必填*          | 用于执行插入的 `driver.Client`                                                                                             |
| table        | str            | *必填*          | 要插入的 ClickHouse 表。允许全表名（包括数据库）。                                                                             |
| file_path    | str            | *必填*          | 数据文件的本地文件系统路径                                                                                                   |
| fmt          | str            | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，则默认为 CSVWithNames。                                                |
| column_names | Sequence of str | *无*            | 数据文件中的列名称列表。对于包含列名的格式不是必需的。                                                                        |
| database     | str            | *无*            | 表的数据库。如果表名已完全限定，则被忽略。如果未指定，将使用客户端数据库进行插入。                                            |
| settings     | dict           | *无*            | 请参阅 [settings description](#settings-argument)。                                                                           |
| compression  | str            | *无*            | 用于 Content-Encoding HTTP 头的认可 ClickHouse 压缩类型（zstd、lz4、gzip）。                                                 |

对于数据不一致或日期/时间格式不常见的文件，应用于数据导入的设置（如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）对该方法是可识别的。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
### Saving query results as files {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法直接将文件从 ClickHouse 流式传输到本地文件系统。例如，如果您希望将查询的结果保存到 CSV 文件中，您可以使用以下代码片段：

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # or CSV, or CSVWithNamesAndTypes, or TabSeparated, etc.
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上述代码生成一个名为 `output.csv` 的文件，内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

类似地，您可以将数据以 [TabSeparated](/interfaces/formats#tabseparated) 和其他格式保存。有关所有可用格式选项的概述，参见 [输入和输出数据格式](/interfaces/formats)。
### Raw API {#raw-api}

对于不需要 ClickHouse 数据与本地或第三方数据类型和结构之间进行转换的用例，ClickHouse Connect 客户端提供两种直接使用 ClickHouse 连接的方法。
#### Client _raw_query_ Method {#client-_raw_query_-method}

`Client.raw_query` 方法允许使用客户端连接直接使用 ClickHouse HTTP 查询接口。返回值是未经处理的 `bytes` 对象。它提供了一个便利的包装，具有参数绑定、错误处理、重试和设置管理，使用最小的接口：

| 参数          | 类型               | 默认值     | 描述                                                                                                                     |
|--------------|--------------------|------------|--------------------------------------------------------------------------------------------------------------------------|
| query        | str                | *必填*    | 任何有效的 ClickHouse 查询                                                                                               |
| parameters   | dict 或可迭代对象 | *无*      | 请参阅 [parameters description](#parameters-argument)。                                                                 |
| settings     | dict               | *无*      | 请参阅 [settings description](#settings-argument)。                                                                     |                                                                                                                            |
| fmt          | str                | *无*      | 返回的字节的 ClickHouse 输出格式。（如果未指定，ClickHouse 使用 TSV）                                                    |
| use_database | bool               | True       | 在查询上下文中使用分配给 clickhouse-connect 客户端的数据库                                                                 |
| external_data | ExternalData      | *无*      | 包含文件或二进制数据以与查询一起使用的 ExternalData 对象。请参见 [高级查询（外部数据）](#external-data)  |

处理结果 `bytes` 对象的责任在于调用者。注意 `Client.query_arrow` 仅是一个对该方法的薄包装，使用 ClickHouse 的 `Arrow` 输出格式。
#### Client _raw_stream_ Method {#client-_raw_stream_-method}
`Client.raw_stream` 方法的 API 与 `raw_query` 方法相同，但返回一个 `io.IOBase` 对象，可以用作 `bytes` 对象的生成器/流源。它目前被 `query_arrow_stream` 方法使用。
#### Client _raw_insert_ Method {#client-_raw_insert_-method}

`Client.raw_insert` 方法允许使用客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于它不会处理插入负载，因此性能非常高。该方法提供选择设置和插入格式的选项：

| 参数          | 类型                                    | 默认值     | 描述                                                                                                                |
|--------------|-----------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------|
| table        | str                                     | *必填*    | 简单或数据库限定的表名                                                                                              |
| column_names | Sequence[str]                           | *无*      | 插入块的列名。如果 `fmt` 参数不包括名称，则必填。                                                                    |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *必填*    | 要插入的数据。字符串将使用客户端编码进行编码。                                                                    |
| settings     | dict                                    | *无*      | 请参阅 [settings description](#settings-argument)。                                                                 |                                                                                                                            |
| fmt          | str                                     | *无*      | `insert_block` 字节的 ClickHouse 输入格式。（如果未指定，ClickHouse 使用 TSV）                                        |

调用者负责确保 `insert_block` 具有指定的格式并使用指定的压缩方法。ClickHouse Connect 使用这些原始插入进行文件上传和 PyArrow 表，委托解析给 ClickHouse 服务器。
### Utility Classes and Functions {#utility-classes-and-functions}

以下类和函数也被视为“公共” `clickhouse-connect` API 的一部分，像上面文档中描述的类和方法一样，跨小版本保持稳定。对这些类和函数的破坏性更改只会发生在小版本（而不是补丁版本）中，并且在至少一个小版本中将以弃用状态提供。
#### Exceptions {#exceptions}

所有自定义异常（包括在 DB API 2.0 规范中定义的异常）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序实际检测到的异常将使用其中一种类型。
#### Clickhouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。类似地，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。
### Multithreaded, Multiprocess, and Async/Event Driven Use Cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程和事件循环驱动/异步应用程序中表现良好。所有的查询和插入处理发生在单一线程内，因此操作通常是线程安全的。（在较低级别对某些操作的并行处理是未来可能的增强功能，以克服单线程的性能损失，但即便如此，线程安全将得到保持）。

由于每个查询或插入在其自己 QueryContext 或 InsertContext 对象中维护状态，因此这些辅助对象不具线程安全性，且不应在多个处理流之间共享。有关上下文对象的附加讨论见以下部分。

此外，在同一时间在一个应用程序中有两个或更多查询和/或插入“进行中”，需要注意两个进一步的考虑。第一个是与查询/插入相关的 ClickHouse “会话”，第二个是 ClickHouse Connect 客户端实例使用的 HTTP 连接池。
### AsyncClient wrapper {#asyncclient-wrapper}

自 0.7.16 版本以来，ClickHouse Connect 提供了一个普通 `Client` 的异步包装器，以便可以在 `asyncio` 环境中使用客户端。

要获取 `AsyncClient` 的实例，您可以使用 `get_async_client` 工厂函数，该函数接受与标准 `get_client` 相同的参数：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` 具有与标准 `Client` 相同的方法和参数，但在适用时它们为协程。内部，这些执行 I/O 操作的方法被包裹在 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

使用 `AsyncClient` 包装器时，多线程性能将提高，因为执行线程和 GIL 在等待 I/O 操作完成时将被释放。

注意：与常规 `Client` 不同，`AsyncClient` 默认强制 `autogenerate_session_id` 为 `False`。

另请参见：[run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。
### Managing ClickHouse Session Ids {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都发生在 ClickHouse “会话”的上下文中。当前会话用于两个目的：
- 将特定的 ClickHouse 设置与多个查询相关联（参见 [用户设置](/operations/settings/settings.md)）。 ClickHouse `SET` 命令用于更改用户会话范围内的设置。
- 跟踪 [临时表](/sql-reference/statements/create/table#temporary-tables)

默认情况下，使用 ClickHouse Connect 客户端实例执行的每个查询都使用相同的会话 ID，以启用此会话功能。也就是说，当使用单个 ClickHouse 客户端时，`SET` 语句和临时表工作如预期。然而，ClickHouse 服务器不允许在同一会话内并发查询。因此，ClickHouse Connect 应用程序有两个选项可以执行并发查询。

- 为每个执行线程（线程、进程或事件处理程序）创建一个单独的 `Client` 实例，该实例将有自己的会话 ID。这通常是最好的方法，因为它为每个客户端保留会话状态。
- 为每个查询使用唯一的会话 ID。这在不需要临时表或共享会话设置的情况下避免了并发会话问题。（在创建客户端时也可以提供共享设置，但这些设置将随每个请求发送，并且不与会话相关联）。可以将唯一的 session_id 添加到每个请求的 `settings` 字典中，或者可以禁用常见设置 `autogenerate_session_id`：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

在这种情况下，ClickHouse Connect 将不会发送任何会话 ID，ClickHouse 服务器将生成一个随机的会话 ID。再一次，临时表和会话级设置将不可用。
### Customizing the HTTP Connection Pool {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池来处理与服务器的底层 HTTP 连接。默认情况下，所有客户端实例共享同一连接池，这对于大多数用例来说是足够的。此默认池保持最多与应用程序使用的每个 ClickHouse 服务器的 8 个 HTTP 保持连接。

对于大型多线程应用程序，可能适合单独的连接池。可以作为 `pool_mgr` 关键字参数提供自定义连接池到主要 `clickhouse_connect.get_client` 函数中：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

正如上述示例所示，客户端可以共享一个池管理器，或者可以为每个客户端创建单独的池管理器。有关创建 PoolManager 时可用选项的更多详细信息，请参见 [`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。
## Querying Data with ClickHouse Connect:  Advanced Usage {#querying-data-with-clickhouse-connect--advanced-usage}
### QueryContexts {#querycontexts}

ClickHouse Connect 在 QueryContext 中执行标准查询。QueryContext 包含用于构建针对 ClickHouse 数据库查询的关键结构，以及用于将结果处理为 QueryResult 或其他响应数据结构的配置。这包括查询本身、参数、设置、读取格式和其他属性。

可以使用客户端的 `create_query_context` 方法获取 QueryContext。此方法接受与核心查询方法相同的参数。然后可以将该查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，而不是这些方法的任何或全部其他参数。请注意，调用方法时指定的附加参数将覆盖 QueryContext 的任何属性。

QueryContext 最明确的用例是发送相同的查询，使用不同的绑定参数值。可以通过调用 `QueryContext.set_parameters` 方法并传入一个字典来更新所有参数值，或者可以通过调用 `QueryContext.set_parameter` 方法并传入所需的 `key`、`value` 对来更新任何单个值。

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'
```

请注意，QueryContexts 不是线程安全的，但可以通过调用 `QueryContext.updated_copy` 方法在多线程环境中获得一个副本。
### Streaming Queries {#streaming-queries}
#### Data Blocks {#data-blocks}
ClickHouse Connect 将来自主要 `query` 方法的所有数据处理为从 ClickHouse 服务器接收的数据块流。这些数据块以自定义“原生”格式从 ClickHouse 发送和接收。一个“数据块”只是一个包含指定数据类型相等数量数据值的二进制数据列的序列。（作为一个列式数据库，ClickHouse 以类似的形式存储这些数据。）查询返回的数据块的大小受两个可以在多个级别设置的用户设置的限制（用户配置文件、用户、会话或查询）。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 数据块的行大小限制。默认 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 数据块的字节大小的软限制。默认值为 1,000,0000。

无论 `preferred_block_size_setting` 如何，每个数据块的返回行数都绝不会超过 `max_block_size`。具体查询类型的实际返回数据块大小可以有任何大小。例如，覆盖多个分片的分布式表查询可能包含直接从每个分片检索到的较小数据块。

使用客户端的 `query_*_stream` 方法时，结果按块逐个返回。ClickHouse Connect 仅一次加载一个数据块。这使得在不需要将所有大型结果集加载到内存中的情况下处理大量数据成为可能。请注意，应用程序应该准备处理任意数量的数据块，并且无法控制每个块的确切大小。
#### HTTP Data Buffer for Slow Processing {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果数据块的处理速度显着慢于 ClickHouse 服务器流式传输数据的速度，ClickHouse 服务器将关闭连接，从而导致在处理线程中抛出异常。这种情况的一些缓解措施可以通过使用通用 `http_buffer_size` 设置来增加 HTTP 流式缓冲区的大小（默认大小为 10 兆字节）。如果应用程序有足够的内存可用，较大的 `http_buffer_size` 值在这种情况下应该是安全的。如果使用 `lz4` 或 `zstd` 压缩，缓冲区中的数据将以压缩格式存储，因此使用这些压缩类型将增加可用的整体缓冲区。
#### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（如 `query_row_block_stream`）返回一个 ClickHouse `StreamContext` 对象，这是一个结合的 Python 上下文/生成器。这是基本用法：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

请注意，尝试在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文可以确保流（在这种情况下，是一个流式 HTTP 响应）即使在未消费所有数据和/或处理过程中引发异常的情况下也会正确关闭。此外，StreamContexts 只能用于消耗流一次。在退出后尝试使用 StreamContext 将产生 `StreamClosedError`。

您可以使用 StreamContext 的 `source` 属性访问父 `QueryResult` 对象，其中包含列名和类型。
#### Stream Types {#stream-types}

`query_column_block_stream` 方法以存储为原生 Python 数据类型的列数据序列形式返回数据块。使用上述 `taxi_trips` 查询，返回的数据将是一个列表，其中每个列表元素都是另一个列表（或元组），包含与相关列关联的所有数据。因此，`block[0]` 将是一个只包含字符串的元组。列导向格式主要用于对所有列中的值进行聚合操作，例如汇总总票价。

`query_row_block_stream` 方法以类似传统关系数据库的行序列形式返回数据块。对于出租车行程，返回的数据将是一个列表，其中每个列表元素是代表一行数据的另一个列表。因此，`block[0]` 将包含第一个出租车行程的所有字段（按顺序），`block[1]` 将包含第二个出租车行程的所有字段的一行，依此类推。行导向结果通常用于显示或转化过程。

`query_row_stream` 是一个便捷方法，在通过流迭代时自动移至下一个数据块。否则，它与 `query_row_block_stream` 相同。

`query_np_stream` 方法将每个数据块返回为二维 NumPy 数组。NumPy 数组通常以列的方式存储，因此不需要区分行或列的方法。NumPy 数组的“形状”将表示为（列，行）。NumPy 库提供了许多操纵 NumPy 数组的方法。请注意，如果查询中的所有列共享相同的 NumPy dtype，则返回的 NumPy 数组也将只有一个 dtype，并且可以在不实际更改其内部结构的情况下重新形状/旋转。

`query_df_stream` 方法将每个 ClickHouse 数据块返回为二维 Pandas 数据框。以下示例显示了 StreamContext 对象可一次性作为上下文以延迟的方式使用（但仅一次）。

最后，`query_arrow_stream` 方法将 ClickHouse 的 `ArrowStream` 格式结果返回为 pyarrow.ipc.RecordBatchStreamReader，包装在 StreamContext 中。流的每次迭代返回 PyArrow RecordBlock。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```
### Read Formats {#read-formats}

读取格式控制从客户端的 `query`、`query_np` 和 `query_df` 方法返回的值的数据类型。（`raw_query` 和 `query_arrow` 不修改来自 ClickHouse 的输入数据，因此格式控制不适用。）例如，如果 UUID 的读取格式从默认的 `native` 格式更改为替代的 `string` 格式，ClickHouse 查询的 `UUID` 列将返回为字符串值（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的数据类型参数可以包含通配符。格式是一个单独的小写字符串。

读取格式可以在几个级别上设置：

- 全局使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询配置的数据类型的格式。
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- 对于整个查询，使用可选的 `query_formats` 字典参数。在这种情况下，任何给定数据类型的列（或子列）都将使用配置的格式。
```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 针对特定列中的值，使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，并且格式为数据列或 ClickHouse 类型名称和查询格式值的二级“格式”字典。此二级字典可用于嵌套列类型，例如元组或映射。
```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 读取格式选项（Python 类型） {#read-format-options-python-types}

| ClickHouse 类型        | 原生 Python 类型     | 读取格式     | 备注                                                                                                            |
|-----------------------|-----------------------|--------------|-----------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                 |
| UInt64                | int                   | signed       | Superset 当前不支持大于 UInt64 的无符号值                                                                          |
| [U]Int[128,256]       | int                   | string       | Pandas 和 NumPy 的 int 值最大为 64 位，因此这些可以作为字符串返回                                                  |
| Float32               | float                 | -            | 所有 Python 浮点数内部都是 64 位                                                                                  |
| Float64               | float                 | -            |                                                                                                                 |
| Decimal               | decimal.Decimal       | -            |                                                                                                                 |
| String                | string                | bytes        | ClickHouse String 列没有固有编码，因此它们也被用于可变长度的二进制数据                                          |
| FixedString           | bytes                 | string       | FixedStrings 是固定大小的字节数组，但有时被视为 Python 字符串                                                  |
| Enum[8,16]            | string                | string, int  | Python 枚举不接受空字符串，因此所有枚举都渲染为字符串或底层的整型值。                                             |
| Date                  | datetime.date         | int          | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。这个值可以作为一个 int 获取                                |
| Date32                | datetime.date         | int          | 与 Date 相同，但适用于更广泛范围的日期                                                                              |
| DateTime              | datetime.datetime     | int          | ClickHouse 在纪元秒中存储 DateTime。这个值可以作为一个 int 获取                                                  |
| DateTime64            | datetime.datetime     | int          | Python datetime.datetime 的精度限制在微秒上。原始的 64 位整型值也可用                                            |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP 地址可以作为字符串读取，而且格式正确的字符串可以作为 IP 地址插入                                             |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP 地址可以作为字符串读取，而且格式正确的字符串可以作为 IP 地址插入                                            |
| Tuple                 | dict or tuple         | tuple, json  | 默认情况下，命名元组作为字典返回。命名元组也可以作为 JSON 字符串返回                                              |
| Map                   | dict                  | -            |                                                                                                                 |
| Nested                | Sequence[dict]        | -            |                                                                                                                 |
| UUID                  | uuid.UUID             | string       | UUID 可以作为根据 RFC 4122 格式的字符串读取<br/>                                                               |
| JSON                  | dict                  | string       | 默认返回python字典。`string`格式将返回 JSON 字符串                                                           |
| Variant               | object                | -            | 返回与存储值的 ClickHouse 数据类型匹配的 Python 类型                                                             |
| Dynamic               | object                | -            | 返回与存储值的 ClickHouse 数据类型匹配的 Python 类型                                                             |
### 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。这些二进制数据与查询字符串一起发送，用于处理数据。有关外部数据特性的详细信息，请参见 [这里](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数以利用此功能。`external_data` 参数的值应该是一个 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数：

| 名称       | 类型               | 描述                                                                                                                                                       |
|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 从本地系统路径读取外部数据的文件路径。需要提供 `file_path` 或 `data`                                                                                       |
| file_name | str               | 外部数据“文件”的名称。如果未提供，将从 `file_path` 中确定（不包含扩展名）                                                                                  |
| data      | bytes             | 以二进制形式提供的外部数据（而不是从文件中读取）。需要提供 `data` 或 `file_path`                                                                          |
| fmt       | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认为 `TSV`                                                                                  |
| types     | str or seq of str | 外部数据中列数据类型的列表。如果是字符串，类型应以逗号分隔。需要提供 `types` 或 `structure`                                                                  |
| structure | str or seq of str | 数据中列名 + 数据类型的列表（见示例）。需要提供 `structure` 或 `types`                                                                                   |
| mime_type | str               | 文件数据的可选 MIME 类型。当前 ClickHouse 忽略此 HTTP 子标头                                                                                               |

要发送包含“电影”数据的外部 CSV 文件的查询，并将该数据与已经存在于 ClickHouse 服务器上的 `directors` 表结合：

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

可以使用 `add_file` 方法将其他外部数据文件添加到初始 ExternalData 对象，该方法接受与构造函数相同的参数。对于 HTTP，所有外部数据都作为`multi-part/form-data`文件上传的一部分传输。
### 时区 {#time-zones}
有多种机制可以将时区应用于 ClickHouse 的 DateTime 和 DateTime64 值。内部，ClickHouse 服务器始终将任何 DateTime 或 DateTime64 对象存储为无时区的数字，表示自纪元以来的秒数，即 1970-01-01 00:00:00 UTC 时间。对于 DateTime64 值，表示可以是自纪元以来的毫秒、微秒或纳秒，具体取决于精度。因此，任何时区信息的应用始终发生在客户端。请注意，这涉及到有意义的额外计算，因此在性能关键的应用中，建议将 DateTime 类型视为纪元时间戳，除非用于用户显示和转换（例如，Pandas 时间戳通常是表示纪元纳秒的 64 位整数，以提高性能）。

当在查询中使用有时区感知的数据类型——特别是 Python 的 `datetime.datetime` 对象时—— `clickhouse-connect` 使用以下优先级规则应用客户端侧时区：

1. 如果查询方法参数 `client_tzs` 为查询指定，则应用特定列时区
2. 如果 ClickHouse 列具有时区元数据（即它的类型如 DateTime64(3, 'America/Denver')），则应用 ClickHouse 列时区。（请注意，对于 ClickHouse 版本 23.2 之前的 DateTime 列，此时区元数据不可用）
3. 如果查询方法参数 `query_tz` 为查询指定，则应用“查询时区”。
4. 如果对查询或会话应用了时区设置，则应用该时区。（该功能尚未在 ClickHouse 服务器中发布）
5. 最后，如果客户端参数 `apply_server_timezone` 设置为 True（默认值），则应用 ClickHouse 服务器时区。

请注意，如果根据这些规则应用的时区为 UTC，`clickhouse-connect` 将 _始终_ 返回一个无时区的 Python `datetime.datetime` 对象。如果需要，应用代码可以向此无时区对象添加额外的时区信息。
## 使用 ClickHouse Connect 插入数据：高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect 在 InsertContext 内执行所有插入。InsertContext 包含发送给客户端 `insert` 方法的所有值。此外，当初始构造 InsertContext 时，ClickHouse Connect 会检索高效本地格式插入所需的插入列的数据类型。通过重用 InsertContext 进行多个插入，可以避免此“预查询”，从而更快更有效地执行插入。

InsertContext 可以使用客户端的 `create_insert_context` 方法获取。该方法接受与 `insert` 函数相同的参数。请注意，只有 InsertContexts 的 `data` 属性应为重用而修改。这与其提供一个可重用对象以供对同一表重复插入新数据的一致使用。

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

InsertContexts 包含在插入过程中更新的可变状态，因此它们不是线程安全的。
### 写入格式 {#write-formats}
写入格式目前只对有限数量的类型实现。在大多数情况下，ClickHouse Connect 将尝试通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。例如，如果插入到 DateTime 列中，并且该列的第一个插入值是 Python 整数，则 ClickHouse Connect 将直接插入该整数值，假设它实际上是一个纪元秒。

在大多数情况下，不需要覆盖数据类型的写入格式，但 `clickhouse_connect.datatypes.format` 包中相关方法可用于全局进行此操作。
#### 写入格式选项 {#write-format-options}

| ClickHouse 类型        | 原生 Python 类型     | 写入格式      | 备注                                                                                                              |
|-----------------------|-----------------------|----------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -              |                                                                                                                   |
| UInt64                | int                   |                |                                                                                                                   |
| [U]Int[128,256]       | int                   |                |                                                                                                                   |
| Float32               | float                 |                |                                                                                                                   |
| Float64               | float                 |                |                                                                                                                   |
| Decimal               | decimal.Decimal       |                |                                                                                                                   |
| String                | string                |                |                                                                                                                   |
| FixedString           | bytes                 | string         | 作为字符串插入时，额外的字节将被设置为零                                                                      |
| Enum[8,16]            | string                |                |                                                                                                                   |
| Date                  | datetime.date         | int            | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。int 类型将被假定为该“纪元日期”值                        |
| Date32                | datetime.date         | int            | 与 Date 相同，但适用于更广泛范围的日期                                                                          |
| DateTime              | datetime.datetime     | int            | ClickHouse 将 DateTime 存储在纪元秒中。int 类型将被假定为该“纪元秒”值                                         |
| DateTime64            | datetime.datetime     | int            | Python datetime.datetime 的精度限制在微秒上。原始的 64 位整型值也可用                                          |
| IPv4                  | `ipaddress.IPv4Address` | string         | 格式正确的字符串可以作为 IPv4 地址插入                                                                          |
| IPv6                  | `ipaddress.IPv6Address` | string         | 格式正确的字符串可以作为 IPv6 地址插入                                                                          |
| Tuple                 | dict or tuple         |                |                                                                                                                   |
| Map                   | dict                  |                |                                                                                                                   |
| Nested                | Sequence[dict]        |                |                                                                                                                   |
| UUID                  | uuid.UUID             | string         | 格式正确的字符串可以作为 ClickHouse UUID 插入                                                                     |
| JSON/Object('json')   | dict                  | string         | 可以将字典或 JSON 字符串插入 JSON 列（注意 `Object('json')` 已被弃用）                                      |
| Variant               | object                |                | 目前所有变体都作为字符串插入，并由 ClickHouse 服务器解析                                                        |
| Dynamic               | object                |                | 警告——目前，任何插入到 Dynamic 列中的内容都会作为 ClickHouse 字符串持久化                                      |
## 其他选项 {#additional-options}

ClickHouse Connect 提供了一些其他选项以支持高级用例。
### 全局设置 {#global-settings}

有少量设置控制 ClickHouse Connect 的全局行为。它们从顶级 `common` 包中访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些常见设置 `autogenerate_session_id`，`product_name` 和 `readonly` 应该 _始终_ 在通过 `clickhouse_connect.get_client` 方法创建客户端之前进行修改。在客户端创建后更改这些设置不会影响现有客户端的行为。
:::

当前定义了十个全局设置：

| 设置名称                | 默认值     | 选项                  | 描述                                                                                                                                                                                                                                                          |
|------------------------|------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True      | True, False            | 为每个客户端会话自动生成一个新的 UUID(1) 会话 ID（如果未提供）。如果未提供会话 ID（无论是在客户端还是查询级别），ClickHouse 将为每个查询生成随机的内部 ID                                                                         |
| invalid_setting_action  | 'error'   | 'drop', 'send', 'error' | 当提供无效或只读设置（无论是用于客户端会话还是查询）时采取的操作。如果是 `drop`，则该设置将被忽略；如果是 `send`，则该设置将被发送到 ClickHouse；如果是 `error`，则会引发客户端的 ProgrammingError                               |
| dict_parameter_format   | 'json'    | 'json', 'map'          | 这控制参数化查询是否将 Python 字典转换为 JSON 或 ClickHouse Map 语法。对于 JSON 列的插入应使用 `json`，对于 ClickHouse Map 列应使用 `map`                                                                                             |
| product_name            |           |                       | 作为字符串与查询一起传递给 ClickHouse，用于跟踪使用 ClickHouse Connect 的应用程序。应使用形式 &lt;product name;&gl/&lt;product version&gt;                                                           |
| max_connection_age      | 600       |                       | HTTP Keep Alive 连接保持打开/重用的最大秒数。这可以防止在负载均衡器/代理后产生对单个 ClickHouse 节点的连接。默认为 10 分钟。                                                                                                                            |
| readonly                | 0         | 0, 1                   | 适用于 19.17 之前版本的隐含“只读” ClickHouse 设置。可以将其设置为与 ClickHouse “read_only” 值匹配，以便与非常旧的 ClickHouse 版本进行操作                                                                                                   |
| use_protocol_version    | True      | True, False            | 使用客户端协议版本。这对于 DateTime 时区列是必要的，但会与当前版本的 chproxy 冲突                                                                                                                                                                       |
| max_error_size          | 1024      |                       | 客户端错误消息中返回的最大字符数。要获取完整的 ClickHouse 错误消息，此设置应设置为 0。默认为 1024 个字符。                                                                                                                                            |
| send_os_user            | True      | True, False            | 在发送到 ClickHouse 的客户端信息中包括检测到的操作系统用户（HTTP User-Agent 字符串）                                                                                                                                                              |
| http_buffer_size        | 10MB      |                       | 用于 HTTP 流式查询的“内存”缓冲区的大小（以字节为单位）                                                                                                                                                                                                   |
### 压缩 {#compression}

ClickHouse Connect 支持 lz4、zstd、brotli 和 gzip 对查询结果和插入进行压缩。请始终牢记，使用压缩通常会在网络带宽/传输速度与 CPU 使用（客户端和服务器）之间进行权衡。

要接收压缩数据，ClickHouse 服务器的 `enable_http_compression` 必须设置为 1，或者用户必须有权限在“每个查询”基础上更改该设置。

通过调用 `clickhouse_connect.get_client` 工厂方法时，可以通过 `compress` 参数控制压缩。默认情况下，`compress` 设置为 `True`，这将触发默认的压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询，ClickHouse Connect 将向使用 `query` 客户端方法执行的查询添加 `Accept-Encoding` 头，包含 `lz4`、`zstd`、`br`（如果安装了 brotli 库）、`gzip` 和 `deflate` 编码。（对于大多数请求，ClickHouse 服务器将返回一个 `zstd` 压缩的有效负载。）对于插入，默认情况下 ClickHouse Connect 会使用 `lz4` 压缩压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法，例如 `lz4`、`zstd`、`br` 或 `gzip`。然后将用于插入和查询结果（如果 ClickHouse 服务器支持）。所需的 `zstd` 和 `lz4` 压缩库现在默认随 ClickHouse Connect 安装。如果指定 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不使用客户配置指定的压缩。

我们也不推荐使用 `gzip` 压缩，因为其压缩和解压缩数据的速度显著慢于其他选项。
### HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 使用 `urllib3` 库添加基本的 HTTP 代理支持。它识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意，使用这些环境变量将适用于通过 `clickhouse_connect.get_client` 方法创建的任何客户端。或者，可以通过 `get_client` 方法的 `http_proxy` 或 `https_proxy` 参数来为每个客户端进行配置。有关 HTTP 代理支持的实现详情，请参见 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 Socks 代理，可以将 `urllib3` SOCKSProxyManager 作为 `pool_mgr` 参数发送给 `get_client`。请注意，这需要直接安装 PySocks 库或使用 `urllib3` 依赖项的 `[socks]` 选项。
### “旧” JSON 数据类型 {#old-json-data-type}

实验性的 `Object`（或 `Object('json')`）数据类型已被弃用，并且应避免在生产环境中使用。ClickHouse Connect 继续为该数据类型提供有限的支持，以向后兼容。请注意，此支持不包括期待返回“顶层”或“父” JSON 值作为字典或其等价物的查询，此类查询将导致异常。
### “新” Variant/Dynamic/JSON 数据类型（实验特性） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 提供了对新（也是实验性的）ClickHouse 类型 Variant、Dynamic 和 JSON 的实验支持。
#### 使用说明 {#usage-notes}
- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。其他形式的 JSON 数据不被支持。
- 使用这些类型的查询将返回子列的类型。
- 有关其他使用说明，请参见主要 ClickHouse 文档。
#### 已知限制 {#known-limitations}
- 必须在使用之前在 ClickHouse 设置中启用每种类型。
- “新”的 JSON 类型从 ClickHouse 24.8 版本开始提供。
- 由于内部格式更改，`clickhouse-connect` 仅与 ClickHouse 24.7 版本开始的 Variant 类型兼容。
- 返回的 JSON 对象将仅返回 `max_dynamic_paths` 数量的元素（默认为 1024）。这将在未来的版本中修复。
- 插入 `Dynamic` 列的内容将始终是 Python 值的字符串表示。这将在未来的版本中修复，一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 得到修复。
- 新类型的实现尚未在 C 代码中进行优化，因此性能可能比简单的、成熟的数据类型稍慢。
