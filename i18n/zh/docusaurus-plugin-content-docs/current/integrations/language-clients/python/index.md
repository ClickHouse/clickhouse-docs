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
'description': 'ClickHouse Connect项目套件用于将Python连接到ClickHouse'
'title': 'Python与ClickHouse Connect的集成'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Python 与 ClickHouse Connect 的集成
## 介绍 {#introduction}

ClickHouse Connect 是一个核心数据库驱动程序，提供与多种 Python 应用程序的互操作性。

- 主要接口是位于 `clickhouse_connect.driver` 包中的 `Client` 对象。该核心包还包含多种用于与 ClickHouse 服务器通信的辅助类和实用函数，及用于高级管理插入和选择查询的“上下文”实现。
- `clickhouse_connect.datatypes` 包提供了所有非实验性 ClickHouse 数据类型的基础实现和子类。其主要功能是将 ClickHouse 数据序列化和反序列化为 ClickHouse “Native” 二进制列式格式，以实现 ClickHouse 与客户端应用程序之间最高效的传输。
- `clickhouse_connect.cdriver` 包中的 Cython/C 类优化了一些最常用的序列化和反序列化，以显著提高纯 Python 的性能。
- 包 `clickhouse_connect.cc_sqlalchemy` 中有一个有限的 [SQLAlchemy](https://www.sqlalchemy.org/) 方言，该方言基于 `datatypes` 和 `dbi` 包构建。这个受限的实现专注于查询/游标功能，并且通常不支持 SQLAlchemy 的 DDL 和 ORM 操作。（SQLAlchemy 主要面向 OLTP 数据库，我们建议使用更专业的工具和框架来管理 ClickHouse 面向 OLAP 的数据库。）
- 核心驱动程序和 ClickHouse Connect SQLAlchemy 实现是将 ClickHouse 连接到 Apache Superset 的首选方法。使用 `ClickHouse Connect` 数据库连接或 `clickhousedb` SQLAlchemy 方言连接字符串。

本文件是截至 beta 版本 0.8.2 时的最新文档。

:::note
官方的 ClickHouse Connect Python 驱动程序使用 HTTP 协议与 ClickHouse 服务器进行通信。它具有一些优势（如更好的灵活性、HTTP 负载均衡器支持、更好地与基于 JDBC 的工具兼容等）和劣势（如稍低的压缩率和性能，以及对某些复杂功能的原生基于 TCP 协议的支持不足）。对于某些用例，您可以考虑使用 [社区 Python 驱动程序](/interfaces/third-party/client-libraries.md)，它们使用原生的基于 TCP 的协议。
:::
### 要求和兼容性 {#requirements-and-compatibility}

|    Python |   |       平台¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |


¹ClickHouse Connect 已明确针对列出的平台进行测试。此外，未经过测试的二进制轮（带有 C 优化）也为优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目构建的所有架构提供。最后，由于 ClickHouse Connect 也可以作为纯 Python 运行，因此源代码安装应在任何较新的 Python 安装上工作。

²再次强调，SQLAlchemy 的支持主要限于查询功能。完整的 SQLAlchemy API 不受支持。

³ClickHouse Connect 已在所有当前支持的 ClickHouse 版本上进行测试。由于它使用 HTTP 协议，因此它也应能正确处理大多数其他版本的 ClickHouse，尽管某些高级数据类型可能会存在一些不兼容性。
### 安装 {#installation}

通过 pip 从 PyPI 安装 ClickHouse Connect：

`pip install clickhouse-connect`

也可以从源代码安装 ClickHouse Connect：
* `git clone` [GitHub 仓库](https://github.com/ClickHouse/clickhouse-connect)。
* （可选）运行 `pip install cython` 来构建和启用 C/Cython 优化。
* `cd` 到项目根目录并运行 `pip install .`
### 支持政策 {#support-policy}

ClickHouse Connect 目前处于 beta 阶段，仅当前 beta 版本获得积极支持。在报告任何问题之前，请更新到最新版本。问题应在 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues) 中提交。未来版本的 ClickHouse Connect 保证在发布时与当时主动支持的 ClickHouse 版本兼容（通常是最新的三版 `stable` 和最新的两版 `lts` 发布）。
### 基本用法 {#basic-usage}
### 获取连接详情 {#gather-your-connection-details}

<ConnectionDetails />
#### 建立连接 {#establish-a-connection}

以下展示了两个连接到 ClickHouse 的示例：
- 连接到本地的 ClickHouse 服务器。
- 连接到 ClickHouse Cloud 服务。
##### 使用 ClickHouse Connect 客户端实例连接到本地的 ClickHouse 服务器： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用之前收集的连接详情。 ClickHouse Cloud 服务需要 TLS，因此请使用端口 8443。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### 与数据库交互 {#interact-with-your-database}

要运行 ClickHouse SQL 命令，可以使用客户端的 `command` 方法：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据，可以使用客户端的 `insert` 方法，该方法接受一个二维数组的行和数值：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

要使用 ClickHouse SQL 检索数据，可以使用客户端的 `query` 方法：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect 驱动程序 API {#clickhouse-connect-driver-api}

***注意：*** 鉴于可能的参数数量，建议针对大多数 API 方法传递关键字参数，其中大多数是可选的。

*此处未记录的方法不被视为 API 的一部分，可能会被删除或更改。*
### 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类提供了 Python 应用程序与 ClickHouse 数据库服务器之间的主要接口。使用 `clickhouse_connect.get_client` 函数获取 Client 实例，该函数接受以下参数：
#### 连接参数 {#connection-arguments}

| 参数                 | 类型         | 默认                           | 描述                                                                                                                                                                                                                                                            |
|-----------------------|--------------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str          | http                          | 必须是 http 或 https。                                                                                                                                                                                                                                     |
| host                  | str          | localhost                     | ClickHouse 服务器的主机名或 IP 地址。如果未设置，将使用 `localhost`。                                                                                                                                                                                        |
| port                  | int          | 8123 或 8443                  | ClickHouse HTTP 或 HTTPS 端口。如果未设置，将默认为 8123，或者在 *secure*=*True* 或 *interface*=*https* 时默认为 8443。                                                                                                                             |
| username              | str          | default                       | ClickHouse 用户名。如果未设置，将使用 `default` 的 ClickHouse 用户。                                                                                                                                                                                     |
| password              | str          | *&lt;空字符串&gt;*          | *username* 的密码。如果未设置，则为空。                                                                                                                                                                                                                     |
| database              | str          | *None*                        | 连接的默认数据库。如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                                                         |
| secure                | bool         | False                         | 使用 https/TLS。此设置将覆盖接口或端口参数推断的值。                                                                                                                                                                                                      |
| dsn                   | str          | *None*                        | 标准 DSN（数据源名称）格式的字符串。如果未设置，将从该字符串提取其他连接值（如主机或用户）。                                                                                                                                                                 |
| compress              | bool 或 str  | True                          | 为 ClickHouse HTTP 插入和查询结果启用压缩。请参见 [附加选项 (压缩)](#compression)。                                                                                                                                                                         |
| query_limit           | int          | 0 (无限制)                    | 对于任何 `query` 响应的最大行数。将其设置为零以返回无限行。请注意，较大的查询限制可能导致内存溢出异常，因为所有结果一次性加载到内存中。                                                                                                   |
| query_retries         | int          | 2                             | `query` 请求的最大重试次数。仅“可重试”的 HTTP 响应将被重试。`command` 或 `insert` 请求不会被驱动程序自动重试，以防止意外重复请求。                                                                                                                |
| connect_timeout       | int          | 10                            | HTTP 连接超时时间（以秒为单位）。                                                                                                                                                                                                                          |
| send_receive_timeout  | int          | 300                           | HTTP 连接的发送/接收超时时间（以秒为单位）。                                                                                                                                                                                                             |
| client_name           | str          | *None*                        | HTTP 用户代理头中前缀的 client_name。设置此项可在 ClickHouse system.query_log 中跟踪客户端查询。                                                                                                                                                    |
| pool_mgr              | obj          | *&lt;default PoolManager&gt;* | 要使用的 `urllib3` 库的 PoolManager。用于需要多个到不同主机的连接池的高级用例。                                                                                                                                                                        |
| http_proxy            | str          | *None*                        | HTTP 代理地址（相当于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                                           |
| https_proxy           | str          | *None*                        | HTTPS 代理地址（相当于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                                                         |
| apply_server_timezone | bool         | True                          | 对于时区感知的查询结果使用服务器时区。请参见 [时区优先级](#time-zones)。                                                                                                                                                                              |
#### HTTPS/TLS 参数 {#httpstls-arguments}

| 参数              | 类型  | 默认   | 描述                                                                                                                                                                                                                                                                    |
|------------------|-------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool  | True   | 如果使用 HTTPS/TLS，则验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、过期等）。                                                                                                                                                                                                 |
| ca_cert          | str   | *None* | 如果 *verify*=*True*，则验证 ClickHouse 服务器证书的文件路径，格式为 .pem。如果 verify 为 False，则忽略此项。如果 ClickHouse 服务器证书是操作系统验证的全球受信任的根证书，则不需要此项。                                                                                  |
| client_cert      | str   | *None* | TLS 客户端证书的文件路径，格式为 .pem（用于互相 TLS 认证）。该文件应包含完整的证书链，包括任何中间证书。                                                                                                                                        |
| client_cert_key  | str   | *None* | 客户端证书的私钥文件路径。如果私钥未包含在客户端证书密钥文件中，则需要此项。                                                                                                                                                                                              |
| server_host_name | str   | *None* | ClickHouse 服务器主机名，如其 TLS 证书的 CN 或 SNI 所识别。设置此项以避免在通过与不同主机名的代理或隧道连接时出现 SSL 错误。                                                                                                                |
| tls_mode         | str   | *None* | 控制高级 TLS 行为。`proxy` 和 `strict` 不会调用 ClickHouse 互相 TLS 连接，但会发送客户端证书和密钥。`mutual` 假定 ClickHouse 互相 TLS 身份验证使用客户端证书。*None*/默认行为为 `mutual`。                                                                                                  |
#### 设置参数 {#settings-argument}

最后，`get_client` 的 `settings` 参数用于为每个客户端请求传递额外的 ClickHouse 设置。请注意，在大多数情况下，具有 *readonly*=*1* 访问权限的用户无法修改随查询发送的设置，因此 ClickHouse Connect 会在最终请求中删除这些设置并记录警告。以下设置仅适用于通过 ClickHouse Connect 使用的 HTTP 查询/会话，并未作为通用 ClickHouse 设置记录。

| 设置             | 描述                                                                                                                                                   |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（以字节为单位）。                                                                                       |
| session_id        | 一个唯一的会话 ID，用于在服务器上关联相关的查询。临时表必需。                                                                                             |
| compress          | ClickHouse 服务器是否应压缩 POST 响应数据。此设置仅应用于“原始”查询。                                                                                      |
| decompress        | 发送到 ClickHouse 服务器的数据是否必须被解压缩。此设置仅应用于“原始”插入。                                                                                  |
| quota_key         | 与该请求相关的配额键。有关配额的详细信息，请参见 ClickHouse 服务器文档。                                                                                       |
| session_check     | 用于检查会话状态。                                                                                                                                     |
| session_timeout   | 在指定的会话 ID 被认定为超时并不再被视为有效之前的不活动秒数。默认为 60 秒。                                                                               |
| wait_end_of_query | 在 ClickHouse 服务器上缓冲完整响应。此设置是返回摘要信息所必需的，且在非流式查询时会自动设置。                                                                                            |

有关可以随每个查询发送的其他 ClickHouse 设置，请参见 [ClickHouse 文档](/operations/settings/settings.md)。
#### 客户端创建示例 {#client-creation-examples}

- 不带任何参数的 ClickHouse Connect 客户端将连接到 `localhost` 的默认 HTTP 端口，使用默认用户并且没有密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 连接到安全（https）的外部 ClickHouse 服务器

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- 使用会话 ID 及其他自定义连接参数和 ClickHouse 设置进行连接。

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
### 常见方法参数 {#common-method-arguments}

多个客户端方法使用一个或两个常见的 `parameters` 和 `settings` 参数。以下描述了这些关键字参数。
#### 参数参数 {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数，该参数用于将 Python 表达式绑定到 ClickHouse 值表达式。有两种绑定方式可用。
##### 服务器端绑定 {#server-side-binding}

ClickHouse 支持大多数查询值的 [服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)，绑定值作为 HTTP 查询参数与查询分开发送。如果 ClickHouse Connect 检测到形如 `{&lt;name&gt;:&lt;datatype&gt;}` 的绑定表达式，将添加适当的查询参数。对于服务器端绑定，`parameters` 参数应为一个 Python 字典。

- 使用 Python 字典的服务器端绑定，DateTime 值和字符串值

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# Generates the following query on the server

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- 服务器端绑定仅支持 `SELECT` 查询。它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。未来此情况可能会发生变化，请参考 https://github.com/ClickHouse/ClickHouse/issues/42092。
##### 客户端绑定 {#client-side-binding}

ClickHouse Connect 还支持客户端参数绑定，这可以在生成模板化的 SQL 查询时提供更多灵活性。对于客户端绑定，`parameters` 参数应为字典或序列。客户端绑定使用 Python 的 [“printf”样式](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 字符串格式化来进行参数替代。

请注意，与服务器端绑定不同，客户端绑定不适用于数据库标识符，例如数据库、表或列名，因为 Python 样式格式化无法区分不同类型的字符串，且它们需要以不同方式格式化（数据库标识符使用反引号或双引号，数据值使用单引号）。

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
要绑定 DateTime64 参数（具有亚秒精度的 ClickHouse 类型），需要采用两种自定义方法之一：
- 将 Python `datetime.datetime` 值包装在新的 DT64Param 类中，例如：
```python
query = 'SELECT {p1:DateTime64(3)}'  # Server side binding with dictionary
parameters={'p1': DT64Param(dt_value)}

query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client side binding with list 
parameters=['a string', DT64Param(datetime.now())]
```
  - 如果使用参数值的字典，请在参数名称后附加字符串 `_64`。
```python
query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server side binding with dictionary

parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
#### 设置参数 {#settings-argument-1}

所有关键 ClickHouse Connect 客户端的“insert”和“select”方法均接受一个可选的 `settings` 关键字参数，用于传递 ClickHouse 服务器的 [用户设置](/operations/settings/settings.md)，用于包含的 SQL 语句。`settings` 参数应为一个字典。每个条目应是 ClickHouse 设置名称及其关联值。请注意，当作为查询参数发送到服务器时，值将被转换为字符串。

与客户端级设置一样，ClickHouse Connect 将删除服务器标记为 *readonly*=*1* 的任何设置，并附带日志消息。仅适用于通过 ClickHouse HTTP 接口的查询的设置始终有效。那些设置在 `get_client` [API](#settings-argument) 下描述。

使用 ClickHouse 设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### 客户端 _command_ 方法 {#client-_command_-method}

使用 `Client.command` 方法向 ClickHouse 服务器发送 SQL 查询，这些查询通常不返回数据或返回单个原始值或数组值。此方法接受以下参数：

| 参数           | 类型              | 默认      | 描述                                                                                                                                                   |
|---------------|-------------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str               | *必需*    | 返回单个值或一行值的 ClickHouse SQL 语句。                                                                                                          |
| parameters    | dict 或可迭代类型 | *None*    | 请参见 [参数描述](#parameters-argument)。                                                                                                           |
| data          | str 或 bytes      | *None*    | 要与命令一起包含的可选数据，作为 POST 请求正文。                                                                                                     |
| settings      | dict              | *None*    | 请参见 [设置描述](#settings-argument)。                                                                                                             |
| use_database  | bool              | True      | 使用客户端数据库（创建客户端时指定）。如果为 False，则命令将使用连接用户的默认 ClickHouse 服务器数据库。                                                                        |
| external_data | ExternalData      | *None*    | 包含用于查询的文件或二进制数据的 ExternalData 对象。有关更多信息，请参见 [高级查询（外部数据）](#external-data)。                          |

- _command_ 可用于 DDL 语句。如果 SQL “命令”不返回数据，则返回“查询摘要”字典。此字典封装了 ClickHouse X-ClickHouse-Summary 和 X-ClickHouse-Query-Id 头，包括键/值对 `written_rows`、`written_bytes` 和 `query_id`。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_ 也可以用于仅返回单行的简单查询

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### 客户端 _query_ 方法 {#client-_query_-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个“批量”数据集的主要方法。它通过 HTTP 采用原生 ClickHouse 格式有效地传输大数据集（最多约一百万行）。此方法接受以下参数。

| 参数               | 类型              | 默认       | 描述                                                                                                                                                                           |
|---------------------|-------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str               | *必需*     | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                       |
| parameters          | dict 或可迭代类型 | *None*     | 请参见 [参数描述](#parameters-argument)。                                                                                                                                     |
| settings            | dict               | *None*     | 请参见 [设置描述](#settings-argument)。                                                                                                                                       |
| query_formats       | dict               | *None*     | 结果值的数据类型格式规范。请参见高级用法 (读取格式)                                                                                                                        |
| column_formats      | dict               | *None*     | 每列的数据类型格式。请参见高级用法 (读取格式)                                                                                                                             |
| encoding            | str                | *None*     | 用于将 ClickHouse 字符串列编码为 Python 字符串的编码。如果未设置，Python 默认为 `UTF-8`。                                                                                     |
| use_none            | bool               | True       | 对于 ClickHouse 空值使用 Python *None* 类型。如果为 False，则对 ClickHouse 空值使用数据类型默认值（例如 0）。注意 - 出于性能原因，对 NumPy/Pandas 默认为 False。                  |
| column_oriented     | bool               | False      | 将结果作为列的序列返回，而不是行的序列。对于将 Python 数据转换为其他列式数据格式非常有用。                                                                                   |
| query_tz            | str                | *None*     | 来自 `zoneinfo` 数据库的时区名称。此时区将应用于查询返回的所有日期时间或 Pandas Timestamp 对象。                                                                              |
| column_tzs          | dict               | *None*     | 列名称与时区名称的字典。与 `query_tz` 类似，但允许为不同列指定不同的时区。                                                                                                       |
| use_extended_dtypes | bool               | True       | 对 ClickHouse NULL 值使用 Pandas 扩展数据类型（如 StringArray）和 pandas.NA 和 pandas.NaT。仅适用于 `query_df` 和 `query_df_stream` 方法。                                     |
| external_data       | ExternalData       | *None*     | 包含用于查询的文件或二进制数据的 ExternalData 对象。有关更多信息，请参见 [高级查询（外部数据）](#external-data)。                                                        |
| context             | QueryContext       | *None*     | 可重用的 QueryContext 对象可以用于封装上述方法参数。请参见 [高级查询（QueryContexts）](#querycontexts)。                                                        |
#### The QueryResult Object {#the-queryresult-object}

基本的 `query` 方法返回一个 QueryResult 对象，具有以下公共属性：

- `result_rows` -- 以行的序列形式返回的数据矩阵，每行元素为列值的序列。
- `result_columns` -- 以列的序列形式返回的数据矩阵，每列元素为该列的行值序列。
- `column_names` -- 一个元组，包含 `result_set` 中的列名字符串。
- `column_types` -- 一个 ClickHouseType 实例的元组，表示 `result_columns` 中每列的 ClickHouse 数据类型。
- `query_id` -- ClickHouse 的 query_id（用于检查 `system.query_log` 表中的查询）。
- `summary` -- `X-ClickHouse-Summary` HTTP 响应头返回的任何数据。
- `first_item` -- 一个便捷属性，用于以字典形式检索响应的第一行（键为列名）。
- `first_row` -- 返回结果的第一行的便捷属性。
- `column_block_stream` -- 返回以列为导向格式的查询结果的生成器。该属性不应直接引用（见下文）。
- `row_block_stream` -- 返回以行为导向格式的查询结果的生成器。该属性不应直接引用（见下文）。
- `rows_stream` -- 返回查询结果的生成器，每次调用产生一行。该属性不应直接引用（见下文）。
- `summary` -- 如 `command` 方法下所述，ClickHouse 返回的摘要信息字典。

`*_stream` 属性返回一个 Python 上下文，可以用作返回数据的迭代器。应该仅通过 Client 的 `*_stream` 方法间接访问。

有关流查询结果的完整详细信息（使用 StreamContext 对象），请参见 [Advanced Queries (Streaming Queries)](#streaming-queries)。
### Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

主要的 `query` 方法有三个专用版本：

- `query_np` -- 此版本返回一个 NumPy 数组，而不是 ClickHouse Connect 的 QueryResult。
- `query_df` -- 此版本返回一个 Pandas 数据框，而不是 ClickHouse Connect 的 QueryResult。
- `query_arrow` -- 此版本返回一个 PyArrow 表。它直接利用 ClickHouse 的 `Arrow` 格式，因此仅接受与主 `query` 方法的三个参数相同的参数： `query`、`parameters` 和 `settings`。此外，还有一个额外参数 `use_strings`，用于确定 Arrow 表是否将 ClickHouse 字符串类型呈现为字符串（如果为 True）或字节（如果为 False）。
### Client Streaming Query Methods {#client-streaming-query-methods}

ClickHouse Connect 客户端提供多种以流形式检索数据的方法（实现为 Python 生成器）：

- `query_column_block_stream` -- 作为列序列返回查询数据的块，使用原生 Python 对象。
- `query_row_block_stream` -- 作为行块返回查询数据，使用原生 Python 对象。
- `query_rows_stream` -- 作为行序列返回查询数据，使用原生 Python 对象。
- `query_np_stream` -- 将每个 ClickHouse 数据块返回为 NumPy 数组。
- `query_df_stream` -- 将每个 ClickHouse 数据块返回为 Pandas 数据框。
- `query_arrow_stream` -- 以 PyArrow RecordBlocks 返回查询数据。

每个方法返回一个 `ContextStream` 对象，必须通过 `with` 语句打开以开始消费流。有关详细信息和示例，请参见 [Advanced Queries (Streaming Queries)](#streaming-queries)。
### Client _insert_ Method {#client-_insert_-method}

对于将多个记录插入 ClickHouse 的常见用例，有 `Client.insert` 方法。它接受以下参数：

| 参数             | 类型                              | 默认值         | 描述                                                                                                                                                                                   |
|-------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *必填*      | 要插入的 ClickHouse 表。允许指定完整的表名（包括数据库名）。                                                                                                   |
| data              | Sequence of Sequences             | *必填*      | 要插入的数据矩阵，可以是行的序列，每一行是列值的序列，也可以是列的序列，每一列是行值的序列。                   |
| column_names      | Sequence of str, or str           | '*'        | 数据矩阵的列名列表。如果使用 '*'，ClickHouse Connect 将执行一个“预查询”以检索该表的所有列名。                          |
| database          | str                               | ''         | 插入的目标数据库。如果未指定，则假定使用客户端的数据库。                                                                                             |
| column_types      | Sequence of ClickHouseType        | *无*       | ClickHouseType 实例的列表。如果未指定 `column_types` 或 `column_type_names`，ClickHouse Connect 将执行一个“预查询”以检索该表的所有列类型。  |
| column_type_names | Sequence of ClickHouse 类型名     | *无*       | ClickHouse 数据类型名称的列表。如果未指定 `column_types` 或 `column_type_names`，ClickHouse Connect 将执行一个“预查询”以检索该表的所有列类型。 |
| column_oriented   | bool                              | False      | 如果为 True，则假定 `data` 参数为列的序列（并且不需要“透视”插入数据）。否则 `data` 被解释为行的序列。              |
| settings          | dict                              | *无*       | 参见 [settings description](#settings-argument)。                                                                                                                                               |
| insert_context    | InsertContext                     | *无*       | 可重用的 InsertContext 对象可以用来封装上述方法参数。 参见 [Advanced Inserts (InsertContexts)](#insertcontexts)                                              |

此方法返回一个“查询摘要”字典，如 "command" 方法下所述。如果插入由于任何原因失败，将引发异常。

主 `insert` 方法有两个专用版本：

- `insert_df` -- 此方法的第二个参数要求一个 Pandas 数据框实例，而不是 Python 的 Sequences of Sequences `data` 参数。ClickHouse Connect 会自动将数据框处理为列导向数据源，因此不需要 `column_oriented` 参数也不可用。
- `insert_arrow` -- 此方法要求一个 `arrow_table` 作为 Python 的 Sequence of Sequences `data` 参数。ClickHouse Connect 会将 Arrow 表未修改地传递给 ClickHouse 服务器进行处理，因此仅除了 `table` 和 `arrow_table` 参数之外，`database` 和 `settings` 参数也可用。

*注意：* NumPy 数组是有效的 Sequences of Sequences，可以作为主 `insert` 方法的 `data` 参数，因此不需要专用方法。
### File Inserts {#file-inserts}

`clickhouse_connect.driver.tools` 包含 `insert_file` 方法，该方法允许直接从文件系统将数据插入到现有的 ClickHouse 表中。解析工作委托给 ClickHouse 服务器。`insert_file` 接受以下参数：

| 参数          | 类型            | 默认值           | 描述                                                                                                                 |
|--------------|-----------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *必填*            | 执行插入操作的 `driver.Client`                                                                              |
| table        | str             | *必填*            | 要插入的 ClickHouse 表。允许指定完整的表名（包括数据库名）。                                 |
| file_path    | str             | *必填*            | 数据文件的本地文件系统路径                                                                                |
| fmt          | str             | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，则默认假设为 CSVWithNames                         |
| column_names | Sequence of str | *无*               | 数据文件中的列名列表。对于包含列名的格式来说不需要                                |
| database     | str             | *无*               | 表的数据库。如果未指定，则将忽略（如果表已完全限定）。                                                       |
| settings     | dict            | *无*               | 参见 [settings description](#settings-argument)。                                                                             |
| compression  | str             | *无*               | 为内容编码 HTTP 标头使用的已识别 ClickHouse 压缩类型（zstd、lz4、gzip）                        |

对于不一致的数据或日期/时间值格式不寻常的文件，此方法识别适用于数据导入的设置（如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
### Saving query results as files {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法直接从 ClickHouse 流式传输文件到本地文件系统。例如，如果您想将查询的结果保存为 CSV 文件，可以使用以下代码片段：

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

同样，您可以将数据保存为 [TabSeparated](/interfaces/formats#tabseparated) 和其他格式。请参阅 [Formats for Input and Output Data](/interfaces/formats) 以获取所有可用格式选项的概述。
### Raw API {#raw-api}

对于不需要 ClickHouse 数据与本地或第三方数据类型和结构间转换的用例，ClickHouse Connect 客户端提供了直接使用 ClickHouse 连接的两个方法。
#### Client _raw_query_ Method {#client-_raw_query_-method}

`Client.raw_query` 方法允许使用客户端连接直接使用 ClickHouse HTTP 查询接口。返回值是未处理的 `bytes` 对象。它提供了一个方便的包装，具有参数绑定、错误处理、重试和使用最小接口的设置管理：

| 参数         | 类型             | 默认值    | 描述                                                                                                                           |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *必填*     | 任何有效的 ClickHouse 查询                                                                                                            |
| parameters    | dict 或 iterable | *无*       | 参见 [parameters description](#parameters-argument)。                                                                                   |
| settings      | dict             | *无*       | 参见 [settings description](#settings-argument)。                                                                                       |                                                                                                                                                |
| fmt           | str              | *无*       | 结果字节的 ClickHouse 输出格式。  (ClickHouse 如果未指定则使用 TSV)                                             |
| use_database  | bool             | True       | 使用分配给查询上下文的 ClickHouse Connect 客户端数据库                                                             |
| external_data | ExternalData     | *无*       | 一个 ExternalData 对象，包含用于查询的文件或二进制数据。 参见 [Advanced Queries (External Data)](#external-data)  |

处理结果的 `bytes` 对象的责任在于调用者。请注意，`Client.query_arrow` 只是一个对该方法的薄包装，使用 ClickHouse 的 `Arrow` 输出格式。
#### Client _raw_stream_ Method {#client-_raw_stream_-method}

`Client.raw_stream` 方法具有与 `raw_query` 方法相同的 API，但返回一个 `io.IOBase` 对象，可用作 `bytes` 对象的生成器/流源。它当前由 `query_arrow_stream` 方法使用。
#### Client _raw_insert_ Method {#client-_raw_insert_-method}

`Client.raw_insert` 方法允许使用客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于它不处理插入负载，因此性能非常高。该方法提供选项来指定设置和插入格式：

| 参数          | 类型                                   | 默认值    | 描述                                                                                  |
|--------------|----------------------------------------|------------|----------------------------------------------------------------------------------------------|
| table        | str                                    | *必填*     | 简单或数据库充分合格的表名                                           |
| column_names | Sequence[str]                          | *无*       | 插入块的列名。如果 `fmt` 参数不包括名称，则为必填项   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *必填*     | 要插入的数据。字符串将使用客户端编码。                          |
| settings     | dict                                   | *无*       | 参见 [settings description](#settings-argument)。                                              |                                                                                                                                                |
| fmt          | str                                    | *无*       | `insert_block` 字节的 ClickHouse 输入格式。  (ClickHouse 如果未指定则使用 TSV) |

调用者负责确保 `insert_block` 的格式符合规定并使用所指定的压缩方法。ClickHouse Connect 使用这些原始插入用于文件上传和 PyArrow 表，将解析委托给 ClickHouse 服务器。
### Utility Classes and Functions {#utility-classes-and-functions}

以下类和函数也被视为“公共” `clickhouse-connect` API 的一部分，它们与上述文档记录的类和方法一样，在小版本之间保持稳定。对这些类和函数的重大更改只会在小版本发布（而不是补丁发布时）发生，并且将以弃用状态至少提供一个小版本。
#### Exceptions {#exceptions}

所有自定义异常（包括在 DB API 2.0 规范中定义的那些）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序实际检测到的异常将使用这些类型之一。
#### Clickhouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。同样，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。
### Multithreaded, Multiprocess, and Async/Event Driven Use Cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程和事件循环驱动/异步应用程序中表现良好。所有查询和插入处理都在单个线程内进行，因此操作通常是线程安全的。（将来可能会增强某些操作的低级并行处理以克服单线程的性能损失，但即使在那种情况下也会保持线程安全）。

由于每个查询或插入都在其自己的 QueryContext 或 InsertContext 对象中保持状态，因此这些帮助对象不是线程安全的，且不应在多个处理流之间共享。有关上下文对象的附加讨论请参见后面的部分。

此外，在同时有两个或更多查询和/或插入“在飞行中”的应用程序中，还需考虑两个额外问题。第一个是与查询/插入相关的 ClickHouse “会话”，第二个是由 ClickHouse Connect 客户端实例使用的 HTTP 连接池。
### AsyncClient wrapper {#asyncclient-wrapper}

自 0.7.16 起，ClickHouse Connect 提供对常规 `Client` 的异步包装，因此可以在 `asyncio` 环境中使用客户端。

要获取 `AsyncClient` 的实例，您可以使用 `get_async_client` 工厂函数，其接受与标准 `get_client` 相同的参数：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` 的方法与标准 `Client` 相同，但在适用时，它们是协程。内部，这些执行 I/O 操作的 `Client` 方法被包装在 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

在使用 `AsyncClient` 包装器时，多线程性能将提高，因为在等待 I/O 操作完成时，执行线程和 GIL 将被释放。

注意：与常规的 `Client` 不同，默认情况下，`AsyncClient` 强制 `autogenerate_session_id` 为 `False`。

另请参见：[run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。
### Managing ClickHouse Session Ids {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都在 ClickHouse “会话”的上下文中进行。目前，会话用于两个目的：
- 将特定 ClickHouse 设置与多个查询关联（见 [user settings](/operations/settings/settings.md)）。使用 ClickHouse 的 `SET` 命令可以更改用户会话范围内的设置。
- 跟踪 [temporary tables.](/sql-reference/statements/create/table#temporary-tables)

默认情况下，使用 ClickHouse Connect 客户端实例执行的每个查询使用相同的会话 ID 以启用此会话功能。也就是说，当使用单个 ClickHouse 客户端时，`SET` 语句和临时表的工作如预期那样。然而，根据设计，ClickHouse 服务器不允许在同一会话中并发查询。
因此，ClickHouse Connect 应用程序在执行并发查询时有两个选项。

- 为每个执行线程（线程、进程或事件处理程序）创建一个单独的 `Client` 实例，这样每个实例将拥有自己的会话 ID。这通常是最佳做法，因为它为每个客户端保留会话状态。
- 为每个查询使用唯一的会话 ID。在临时表或共享会话设置不需要的情况下，这可以避免并发会话问题。（创建客户端时也可以提供共享设置，但这些设置会随每个请求发送，并且不与会话关联）。唯一的 session_id 可以添加到每个请求的 `settings` 字典中，也可以禁用 `autogenerate_session_id` 通用设置：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

在这种情况下，ClickHouse Connect 不会发送任何会话 ID，ClickHouse 服务器将生成一个随机会话 ID。再一次，临时表和会话级设置将不可用。
### Customizing the HTTP Connection Pool {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池处理与服务器的基础 HTTP 连接。默认情况下，所有客户端实例共享同一连接池，这对于大多数用例来说是足够的。该默认池最多维护 8 个与应用程序使用的每个 ClickHouse 服务器的 HTTP Keep Alive 连接。

对于大型多线程应用程序，可能需要单独的连接池。可以将自定义连接池作为 `pool_mgr` 关键字参数提供给主 `clickhouse_connect.get_client` 函数：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上述示例所示，客户端可以共享一个池管理器，也可以为每个客户端创建一个单独的池管理器。有关创建 PoolManager 时可用选项的更多详细信息，请参阅 [`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。
## Querying Data with ClickHouse Connect:  Advanced Usage {#querying-data-with-clickhouse-connect--advanced-usage}
### QueryContexts {#querycontexts}

ClickHouse Connect 在 QueryContext 中执行标准查询。QueryContext 包含用于构建针对 ClickHouse 数据库的查询的关键结构，以及用于处理结果到 QueryResult 或其他响应数据结构的配置。这包含查询本身、参数、设置、读取格式和其他属性。

可以使用客户端的 `create_query_context` 方法获取一个 QueryContext。该方法接受与核心查询方法相同的参数。然后可以将此查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，而不是这些方法的任意或所有其他参数。请注意，为方法调用指定的其他参数将覆盖 QueryContext 的任何属性。

QueryContext 的最清晰用例是以不同的绑定参数值发送相同的查询。通过调用 `QueryContext.set_parameters` 方法并传入字典，可以更新所有参数值，或通过调用 `QueryContext.set_parameter` 并传入所需的 `key` 和 `value` 对来更新任何单一值。

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

请注意，QueryContexts 不是线程安全的，但可以通过调用 `QueryContext.updated_copy` 方法在多线程环境中获得副本。
### Streaming Queries {#streaming-queries}
#### Data Blocks {#data-blocks}

ClickHouse Connect 将来自 ClickHouse 服务器的所有数据从主要的 `query` 方法处理为一系列数据块流。这些块以自定义的“原生”格式进行传输，往返于 ClickHouse。一个“块”只是二进制数据的列序列，其中每列包含指定数据类型的相同数量的数据值。（作为列式数据库，ClickHouse 以类似的形式存储这些数据。）返回的查询块的大小由两个用户设置控制，可以在多个级别（用户档案、用户、会话或查询）设置。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行中块的大小限制。默认值为 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 块的字节大小软限制。默认值为 1,000,0000。

无论 `preferred_block_size_setting` 设置如何，每个块的行数永远不会超过 `max_block_size`。根据查询类型，返回的实际块可以是任意大小。例如，覆盖多个分片的分布式表查询可能包含直接从每个分片检索到的较小块。

使用 Client 的 `query_*_stream` 方法时，结果按块逐块返回。ClickHouse Connect 仅一次加载一个块。这允许处理大量数据，而无需将所有大结果集加载到内存中。请注意，应用程序应准备处理任意数量的块，并且每个块的确切大小不可控。
#### HTTP Data Buffer for Slow Processing {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果块的处理速度明显慢于 ClickHouse 服务器流数据的速度，ClickHouse 服务器将关闭连接，从而导致处理线程中抛出异常。通过使用通用的 `http_buffer_size` 设置，可以提高 HTTP 流式传输缓冲区的大小（默认为 10 兆字节），从而缓解部分问题。如果应用程序有足够的内存，那么大 `http_buffer_size` 值在这种情况下应该是可以的。使用 `lz4` 或 `zstd` 压缩时，缓冲区中的数据将被压缩存储，因此使用这些压缩类型将增加可用的总体缓冲区。
#### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（如 `query_row_block_stream`）返回一个 ClickHouse `StreamContext` 对象，它是一个组合的 Python 上下文/生成器。这是基本用法：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

请注意，试图在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文确保流（在这种情况下是流式 HTTP 响应）将被正确关闭，即使并非所有数据都被消费和/或在处理过程中引发异常。此外，StreamContexts 只能使用一次以消费流。尝试在退出后使用 StreamContext 会产生 `StreamClosedError`。

您可以使用 StreamContext 的 `source` 属性访问父 `QueryResult` 对象，其中包含列名和类型。
#### Stream Types {#stream-types}

`query_column_block_stream` 方法以作为本地 Python 数据类型存储的列数据序列返回块。使用上述 `taxi_trips` 查询，返回的数据将是一个列表，其中每个列表元素是另一个列表（或元组），包含与该列相关的所有数据。因此 `block[0]` 将是一个仅包含字符串的元组。列导向格式通常用于对列中所有值进行聚合操作，例如加总所有车费。

`query_row_block_stream` 方法以行序列返回块，类似于传统的关系数据库。对于出租车行程，返回的数据将是一个列表，其中每个列表元素是另一个列表，表示一行数据。因此 `block[0]` 将包含第一辆出租车行程的所有字段（按顺序），`block[1]` 将包含第二辆出租车行程的所有字段的行，以此类推。行导向结果通常用于显示或转换过程。

`query_row_stream` 是一个便捷方法，在遍历流时自动移动到下一个块。否则，它与 `query_row_block_stream` 相同。

`query_np_stream` 方法将每个块返回为二维 NumPy 数组。内部，NumPy 数组通常以列的形式存储，因此无需区分行或列的方法。NumPy 数组的“形状”将表示为（列，行）。NumPy 库提供许多操作 NumPy 数组的方法。请注意，如果查询中的所有列共享相同的 NumPy dtype，则返回的 NumPy 数组也将仅具有一个 dtype，并且可以在不实际更改其内部结构的情况下进行重塑/旋转。

`query_df_stream` 方法将每个 ClickHouse 块返回为二维 Pandas 数据框。以下示例显示，StreamContext 对象可以以延迟方式（但仅一次）用作上下文。

最后，`query_arrow_stream` 方法将 ClickHouse `ArrowStream` 格式的结果返回为 pyarrow.ipc.RecordBatchStreamReader，包装在 StreamContext 中。流的每次迭代返回 PyArrow RecordBlock。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```
### Read Formats {#read-formats}

读取格式控制从客户端的 `query`、`query_np` 和 `query_df` 方法返回的值的数据类型。（`raw_query` 和 `query_arrow` 不会修改 ClickHouse 的传入数据，因此不适用格式控制。）例如，如果 UUID 的读取格式从默认的 `native` 格式更改为替代的 `string` 格式，则 ClickHouse UUID 列的查询将以字符串值返回（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的“数据类型”参数可以包含通配符。格式是一个小写字符串。

读取格式可以在多个级别设置：

- 全局设置，使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询的配置数据类型的格式。
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- 针对整个查询，使用可选的 `query_formats` 字典参数。在这种情况下，任何指定数据类型（或子列）的列将使用配置格式。
```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 针对特定列中的值，使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，格式为数据列或 ClickHouse 类型名称和查询格式值的第二级“格式”字典。此二级字典可用于嵌套列类型，如元组或映射。
```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 读取格式选项（Python 类型） {#read-format-options-python-types}

| ClickHouse 类型       | 原生 Python 类型    | 读取格式  | 注释                                                                                                        |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                             |
| UInt64                | int                   | signed       | Superset 目前不处理大 unsigned UInt64 值                                                                  |
| [U]Int[128,256]       | int                   | string       | Pandas 和 NumPy 的 int 值最大为 64 位，因此这些可以作为字符串返回                                          |
| Float32               | float                 | -            | 所有 Python 浮点数在内部都是 64 位                                                                          |
| Float64               | float                 | -            |                                                                                                             |
| Decimal               | decimal.Decimal       | -            |                                                                                                             |
| String                | string                | bytes        | ClickHouse 的 String 列没有固有的编码，因此它们也用于可变长度的二进制数据                                      |
| FixedString           | bytes                 | string       | FixedStrings 是固定大小的字节数组，但有时被视为 Python 字符串                                              |
| Enum[8,16]            | string                | string, int  | Python 枚举不接受空字符串，因此所有枚举都呈现为字符串或底层的 int 值。                                       |
| Date                  | datetime.date         | int          | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。该值可用作 int                                     |
| Date32                | datetime.date         | int          | 与日期相同，但适用于更广泛的日期范围                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouse 将 DateTime 存储为纪元秒。该值可用作 int                                                       |
| DateTime64            | datetime.datetime     | int          | Python 的 datetime.datetime 限于微秒精度。原始 64 位 int 值可用                                             |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP 地址可以作为字符串读取，正确格式化的字符串可以作为 IP 地址插入                                           |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP 地址可以作为字符串读取，正确格式化的可以作为 IP 地址插入                                               |
| Tuple                 | dict or tuple         | tuple, json  | 命名元组默认为字典返回。命名元组也可以作为 JSON 字符串返回                                                |
| Map                   | dict                  | -            |                                                                                                             |
| Nested                | Sequence[dict]        | -            |                                                                                                             |
| UUID                  | uuid.UUID             | string       | UUID 可以作为格式化为 RFC 4122 的字符串读取<br/>                                                          |
| JSON                  | dict                  | string       | 默认返回一个 Python 字典。`string` 格式将返回一个 JSON 字符串                                                |
| Variant               | object                | -            | 返回与存储的 ClickHouse 数据类型匹配的 Python 类型                                                         |
| Dynamic               | object                | -            | 返回与存储的 ClickHouse 数据类型匹配的 Python 类型                                                         |
### 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。此二进制数据与查询字符串一起发送，以用于处理数据。关于
外部数据功能的详细信息请参见 [这里](/engines/table-engines/special/external-data.md)。客户端 `query*` 方法接受一个可选的 `external_data` 参数
以利用此功能。`external_data` 参数的值应为一个 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数
接受以下参数：

| 名称       | 类型              | 描述                                                                                                                                       |
|------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| file_path  | str               | 本地系统路径上要读取外部数据的文件路径。需要提供 `file_path` 或 `data` 中的一个                                                             | 
| file_name  | str               | 外部数据“文件”的名称。如果未提供，将根据 `file_path`（不带扩展名）确定                                                                    |
| data       | bytes             | 以二进制形式提供的外部数据（而不是从文件读取）。需要提供 `data` 或 `file_path` 中的一个                                                     |
| fmt        | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认为 `TSV`                                                                      |
| types      | str or seq of str | 外部数据中列数据类型的列表。如果是字符串，则应以逗号分隔。需要提供 `types` 或 `structure` 中的一个                                         |
| structure  | str or seq of str | 数据中列名称 + 数据类型的列表（请参见示例）。需要提供 `structure` 或 `types` 中的一个                                                       |
| mime_type  | str               | 文件数据的可选 MIME 类型。当前 ClickHouse 忽略此 HTTP 子头                                                                                            |

要发送包含“电影”数据的外部 CSV 文件的查询，并将该数据与 ClickHouse 服务器上已存在的 `directors` 表结合：

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

可以使用 `add_file` 方法将其他外部数据文件添加到初始 ExternalData 对象，该方法接受与构造函数相同的参数。 对于 HTTP，所有外部数据作为 
`multi-part/form-data` 文件上传的一部分传输。
### 时区 {#time-zones}
有多种机制将时区应用于 ClickHouse DateTime 和 DateTime64 值。内部，ClickHouse 服务器始终将任何 DateTime 或 DateTime64
对象存储为表示自纪元以来的秒数的无时区数字，即 1970-01-01 00:00:00 UTC 时间。对于 DateTime64 值，表示可以是自纪元以来的毫秒、微秒 
或纳秒，具体取决于精度。因此，任何时区信息的应用始终在客户端进行。请注意，这涉及到有意义的
额外计算，因此在性能关键的应用程序中，建议在用户显示和转换（例如，Pandas 时间戳）外，将 DateTime 类型视为纪元时间戳。

在查询中使用时区感知数据类型时 - 特别是 Python 的 `datetime.datetime` 对象 - `clickhouse-connect` 应用客户端侧时区，使用以下
优先级规则：

1. 如果查询的 `client_tzs` 方法参数为指定，为特定列应用特定时区
2. 如果 ClickHouse 列具有时区元数据（即，它的类型是 DateTime64(3, 'America/Denver')），则应用 ClickHouse 列时区。（请注意
此时区元数据在 ClickHouse 版本 23.2 之前的 DateTime 列不适用）
3. 如果查询的 `query_tz` 方法参数为指定，则应用“查询时区”。
4. 如果对查询或会话应用了时区设置，则应用该时区。 （此功能尚未在 ClickHouse 服务器上发布）
5. 最后，如果客户端 `apply_server_timezone` 参数设置为 True（默认情况），则应用 ClickHouse 服务器时区。

请注意，如果根据这些规则应用的时区是 UTC，`clickhouse-connect` 将 _始终_ 返回一个无时区的 Python `datetime.datetime` 对象。如果需要，应用代码可以向该无时区对象添加额外的时区信息。
## 使用 ClickHouse Connect 插入数据：高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect 在 InsertContext 内执行所有插入。InsertContext 包含作为参数发送到
客户端 `insert` 方法的所有值。此外，当最初构造 InsertContext 时，ClickHouse Connect 检索插入列所需的数据类型
以实现高效的原生格式插入。通过重用 InsertContext 进行多个插入，可以避免这个“预查询”，并使插入更快、更高效。

可以使用客户端 `create_insert_context` 方法获取 InsertContext。该方法接受与 
`insert` 函数相同的参数。仅 InsertContexts 的 `data` 属性应为重用而修改。这与其为相同表的多次插入提供可重用对象的预期目的相一致。

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
当前仅为有限数量的类型实现了写入格式。在大多数情况下，ClickHouse Connect 将尝试
通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。
例如，如果插入到 DateTime 列，并且该列的第一个插入值是一个 Python 整数，ClickHouse
Connect 将直接插入整数值，假设它实际上是一个纪元秒。

在大多数情况下，无需覆盖数据类型的写入格式，但可以使用 `clickhouse_connect.datatypes.format` 包中的相关方法在全局范围内这样做。
#### 写入格式选项 {#write-format-options}

| ClickHouse 类型       | 原生 Python 类型    | 写入格式   | 注释                                                                                                           |
|-----------------------|-----------------------|---------------|----------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                                |
| UInt64                | int                   |               |                                                                                                                |
| [U]Int[128,256]       | int                   |               |                                                                                                                |
| Float32               | float                 |               |                                                                                                                |
| Float64               | float                 |               |                                                                                                                |
| Decimal               | decimal.Decimal       |               |                                                                                                                |
| String                | string                |               |                                                                                                                |
| FixedString           | bytes                 | string        | 如果作为字符串插入，其他字节将设置为零                                                                                     |
| Enum[8,16]            | string                |               |                                                                                                                |
| Date                  | datetime.date         | int           | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。 int 类型将被视为该“纪元日期”值                                                           |
| Date32                | datetime.date         | int           | 与日期相同，但适用于更广泛的日期范围                                                                              |
| DateTime              | datetime.datetime     | int           | ClickHouse 将 DateTime 存储为纪元秒。 int 类型将被视为该“纪元秒”值                                               |
| DateTime64            | datetime.datetime     | int           | Python 的 datetime.datetime 限于微秒精度。原始 64 位 int 值可用                                                      |
| IPv4                  | `ipaddress.IPv4Address` | string        | 可以将正确格式化的字符串插入为 IPv4 地址                                                                                           |
| IPv6                  | `ipaddress.IPv6Address` | string        | 可以将正确格式化的字符串插入为 IPv6 地址                                                                                           |
| Tuple                 | dict or tuple         |               |                                                                                                                |
| Map                   | dict                  |               |                                                                                                                |
| Nested                | Sequence[dict]        |               |                                                                                                                |
| UUID                  | uuid.UUID             | string        | 可以将正确格式化的字符串插入为 ClickHouse UUID                                                                            |
| JSON/Object('json')   | dict                  | string        | 可以向 JSON 列插入字典或 JSON 字符串（请注意，`Object('json')` 已弃用）                                                 |
| Variant               | object                |               | 目前所有变体都作为字符串插入并由 ClickHouse 服务器解析                                                                      |
| Dynamic               | object                |               | 警告 - 目前对 Dynamic 列的所有插入都作为 ClickHouse 字符串持久化                                                     |
## 其他选项 {#additional-options}

ClickHouse Connect 提供了一些额外选项以支持高级用例
### 全局设置 {#global-settings}

有少量设置可以全局控制 ClickHouse Connect 的行为。它们可以从顶级 `common` 包访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些常见设置 `autogenerate_session_id`、`product_name` 和 `readonly` 应 _始终_ 在使用 `clickhouse_connect.get_client` 方法创建客户端之前进行更改。 在创建客户端后更改这些设置不会影响现有客户端的行为。
:::

目前定义了十个全局设置：

| 设置名称                      | 默认值 | 选项                  | 描述                                                                                                                                                                                                                             |
|-------------------------------|---------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id       | True    | True, False            | 为每个客户端会话自动生成新的 UUID(1) 会话 ID（如果未提供）。如果未提供会话 ID（无论是客户端级别还是查询级别），ClickHouse 将为每个查询生成随机内部 ID                                                                         |
| invalid_setting_action        | 'error' | 'drop', 'send', 'error' | 提供无效或只读设置（无论是针对客户端会话还是查询）时的处理方式。如果为 `drop`，该设置将被忽略；如果为 `send`，则该设置将发送到 ClickHouse；如果为 `error`，则会引发客户端编程错误                         |
| dict_parameter_format         | 'json'  | 'json', 'map'           | 这控制了参数化查询将 Python 字典转换为 JSON 还是 ClickHouse Map 语法。应该对 JSON 列的插入使用 `json`，对 ClickHouse Map 列使用 `map`                                                                                     |
| product_name                  |         |                        | 作为字符串传递给 ClickHouse 的查询，用于跟踪使用 ClickHouse Connect 的应用程序。格式应为 &lt;产品名称;&gl/&lt;产品版本&gt;                                                                     |
| max_connection_age            | 600     |                        | HTTP Keep Alive 连接保持打开/重用的最长秒数。这可以防止在负载均衡器/代理后对单个 ClickHouse 节点进行连接的挤压。 默认为 10 分钟。                                                                                             |
| readonly                      | 0       | 0, 1                   | 对于 19.17 之前的版本隐含“只读” ClickHouse 设置。可以设置为与 ClickHouse 的“只读”值匹配的设置，以允许与非常老的 ClickHouse 版本一起操作                                                                                |
| use_protocol_version          | True    | True, False            | 使用客户端协议版本。这对于 DateTime 时区列是必需的，但会与当前版本的 chproxy 冲突                                                                                                                                                         |
| max_error_size                | 1024    |                        | 客户端错误消息中返回的最大字符数。将此设置为 0 以获取完整的 ClickHouse 错误消息。默认为 1024 个字符。                                                                                                                                         |
| send_os_user                  | True    | True, False            | 在发送到 ClickHouse 的客户端信息中包含检测到的操作系统用户（HTTP User-Agent 字符串）                                                                                                                                                  |
| http_buffer_size              | 10MB    |                        | 用于 HTTP 流式查询的“内存中”缓冲区的大小（以字节为单位）                                                                                                                                                                 |
### 压缩 {#compression}

ClickHouse Connect 支持 lz4、zstd、brotli 和 gzip 压缩，适用于查询结果和插入。始终记住
使用压缩通常涉及在网络带宽/传输速度与 CPU 使用率（客户端和服务器）之间的权衡。

要接收压缩数据，ClickHouse 服务器的 `enable_http_compression` 必须设置为 1，或者用户必须有
权限在“每个查询”的基础上更改该设置。

压缩通过调用 `clickhouse_connect.get_client` 工厂方法时的 `compress` 参数进行控制。
默认情况下，`compress` 设置为 `True`，这将触发默认的压缩设置。在使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询中，
ClickHouse Connect 将添加 `Accept-Encoding` 头，包含 `lz4`、`zstd`、`br`（如果安装了 brotli 库）、`gzip` 和 `deflate` 编码（并且间接通过 `query_np` 和 `query_df`）。
（对于大多数请求，ClickHouse 服务器将返回带有 `zstd` 压缩有效负载的响应。）对于插入，默认情况下 ClickHouse Connect 将使用 `lz4` 压缩压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法，如 `lz4`、`zstd`、`br` 或
`gzip`。该方法将用于插入和查询结果（如果 ClickHouse 服务器支持）。所需的 `zstd` 和 `lz4` 压缩库现已与 ClickHouse Connect 一起默认安装。如果指定了 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不使用客户端配置指定的压缩。

我们还建议不要使用 `gzip` 压缩，因为它在压缩和解压缩数据时显著比其他方法慢。
### HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 添加了基本的 HTTP 代理支持，使用 `urllib`3` 库。它识别标准的 `HTTP_PROXY` 和
`HTTPS_PROXY` 环境变量。请注意，使用这些环境变量将适用于使用 `clickhouse_connect.get_client` 方法创建的任何客户端。或者，您可以使用 
`http_proxy` 或 `https_proxy` 参数为每个客户端配置。在 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 的实现 HTTP 代理支持的详细信息 
文档。

要使用 Socks 代理，您可以发送 `urllib3` SOCKSProxyManager，作为 `pool_mgr` 参数传递给 `get_client`。请注意
这需要安装 PySocks 库，或者通过 `[socks]` 选项为 `urllib3` 依赖项安装。
### "旧" JSON 数据类型 {#old-json-data-type}

实验性的 `Object`（或 `Object('json')`）数据类型已弃用，应避免在生产环境中使用。
ClickHouse Connect 继续为该数据类型提供有限的支持，以保持向后兼容性。请注意，此支持不包括预期返回“顶层”或“父级”的 JSON 值作为字典或等效的查询，这些查询将导致异常。
### "新" Variant/Dynamic/JSON 数据类型（实验性功能） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 提供对新的（也是实验性的）ClickHouse 类型 Variant、Dynamic 和 JSON 的实验性支持。
#### 使用注意事项 {#usage-notes}
- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。其他形式的 JSON 数据不受支持。
- 使用这些类型的查询将返回子列的类型。
- 请参阅主 ClickHouse 文档以获得其他使用注意事项
#### 已知限制 {#known-limitations}
- 在使用之前，必须在 ClickHouse 设置中启用每种类型。
- “新” JSON 类型从 ClickHouse 24.8 版本开始可用。
- 由于内部格式更改，`clickhouse-connect` 仅与从 ClickHouse 24.7 版本开始的 Variant 类型兼容。
- 返回的 JSON 对象将仅返回 `max_dynamic_paths` 数量的元素（默认值为 1024）。这个问题将在未来的版本中修复。
- 对 Dynamic 列的插入将始终是 Python 值的字符串表示形式。这个问题将在未来的版本中修复，一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 被修复。
- 新类型的实现尚未在 C 代码中优化，因此性能可能会比简单和成熟的数据类型稍慢。
