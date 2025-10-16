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
'description': 'ClickHouse Connect 项目套件用于将 Python 连接到 ClickHouse'
'title': 'Python 与 ClickHouse Connect 的集成'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Python 与 ClickHouse Connect 的集成
## 简介 {#introduction}

ClickHouse Connect 是一个核心数据库驱动程序，提供了与广泛 Python 应用程序的互操作性。

- 主要接口是 `clickhouse_connect.driver` 包中的 `Client` 对象。该核心包还包括各种辅助类和用于与 ClickHouse 服务器通信的实用函数，以及用于插入和选择查询的高级管理的 “context” 实现。
- `clickhouse_connect.datatypes` 包提供所有非实验性 ClickHouse 数据类型的基本实现和子类。其主要功能是将 ClickHouse 数据序列化和反序列化为 ClickHouse “原生” 二进制列式格式，用于实现 ClickHouse 和客户端应用程序之间的高效传输。
- `clickhouse_connect.cdriver` 包中的 Cython/C 类优化了一些最常见的序列化和反序列化，以显著提高纯 Python 的性能。
- 在 `clickhouse_connect.cc_sqlalchemy` 包中有一个有限的 [SQLAlchemy](https://www.sqlalchemy.org/) 方言，它是基于 `datatypes` 和 `dbi` 包构建的。这个受限的实现专注于查询/游标功能，通常不支持 SQLAlchemy 的 DDL 和 ORM 操作。（SQLAlchemy 针对 OLTP 数据库，我们建议使用更专业的工具和框架来管理 ClickHouse OLAP 导向的数据库。）
- 核心驱动程序和 ClickHouse Connect SQLAlchemy 实现是将 ClickHouse 连接到 Apache Superset 的首选方法。使用 `ClickHouse Connect` 数据库连接，或 `clickhousedb` SQLAlchemy 方言连接字符串。

该文档是基于 beta 版本 0.8.2 的当前状态。

:::note
官方 ClickHouse Connect Python 驱动程序使用 HTTP 协议与 ClickHouse 服务器进行通信。
它有一些优点（例如更好的灵活性、支持 HTTP 负载均衡器、与基于 JDBC 的工具的更好兼容性等）和缺点（例如压缩和性能稍低，以及不支持原生基于 TCP 协议的一些复杂功能）。
对于某些用例，您可以考虑使用使用原生基于 TCP 协议的 [社区 Python 驱动程序](/interfaces/third-party/client-libraries.md)。
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

¹ClickHouse Connect 已明确测试与所列平台的兼容性。此外，为所有由优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目支持的架构构建了未经测试的二进制轮（带 C 优化）。
最后，由于 ClickHouse Connect 还可以作为纯 Python 运行，因此源安装在任何最近的 Python 安装上都应该适用。

² SQLAlchemy 的支持再次主要限于查询功能。完整的 SQLAlchemy API 不受支持。

³ClickHouse Connect 已针对所有当前支持的 ClickHouse 版本进行测试。由于它使用 HTTP 协议，因此它在大多数其他版本的 ClickHouse 上也应能正确工作，尽管某些高级数据类型可能存在某些不兼容性。
### 安装 {#installation}

通过 pip 从 PyPI 安装 ClickHouse Connect：

`pip install clickhouse-connect`

ClickHouse Connect 也可以从源代码安装：
* `git clone` [GitHub 仓库](https://github.com/ClickHouse/clickhouse-connect)。
* （可选）运行 `pip install cython` 以构建和启用 C/Cython 优化。
* `cd` 到项目根目录并运行 `pip install .`
### 支持政策 {#support-policy}

ClickHouse Connect 目前处于 beta 版本，只有当前的 beta 版本受到积极支持。在报告任何问题之前，请更新到最新版本。问题应提交到 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues)。未来版本的 ClickHouse Connect 保证与发布时的积极支持的 ClickHouse 版本兼容（通常是最近三个 `stable` 和两个最近的 `lts` 版本）。
### 基本用法 {#basic-usage}
### 收集您的连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />
#### 建立连接 {#establish-a-connection}

有两个示例展示了如何连接到 ClickHouse：
- 连接到 localhost 上的 ClickHouse 服务器。
- 连接到 ClickHouse Cloud 服务。
##### 使用 ClickHouse Connect 客户端实例连接到 localhost 上的 ClickHouse 服务器： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用之前收集的连接详细信息。 ClickHouse Cloud 服务需要 TLS，因此使用端口 8443。
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

要插入批量数据，请使用客户端的 `insert` 方法，搭配一个二维数组的行和值：

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

***注意：*** 由于可能的参数数量，建议对大多数 API 方法传递关键字参数，其中大多数都是可选的。

*此处未记录的方法不被视为 API的一部分，可能会被移除或更改。*
### 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类提供了 Python 应用程序与 ClickHouse 数据库服务器之间的主要接口。使用 `clickhouse_connect.get_client` 函数获取 Client 实例，该函数接受以下参数：
#### 连接参数 {#connection-arguments}

| 参数                   | 类型        | 默认                        | 描述                                                                                                                                                                                                                                         |
|-----------------------|-------------|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                         | 必须是 http 或 https。                                                                                                                                                                                                                      |
| host                  | str         | localhost                    | ClickHouse 服务器的主机名或 IP 地址。如果未设置，将使用 `localhost`。                                                                                                                                                                    |
| port                  | int         | 8123 或 8443                 | ClickHouse HTTP 或 HTTPS 端口。 如果未设置，将默认为 8123，或者如果 *secure*=*True* 或 *interface*=*https*，则默认为 8443。                                                                                                           |
| username              | str         | default                      | ClickHouse 用户名。如果未设置，将使用 `default` ClickHouse 用户。                                                                                                                                                                       |
| password              | str         | *&lt;空字符串&gt;*           | *username* 的密码。                                                                                                                                                                                                                        |
| database              | str         | *None*                       | 连接的默认数据库。如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                                      |
| secure                | bool        | False                        | 使用 https/TLS。此设置将覆盖从接口或端口参数推断的值。                                                                                                                                                                               |
| dsn                   | str         | *None*                       | 标准 DSN（数据源名称）格式的字符串。如果未另外设置，将从此字符串中提取其他连接值（例如主机或用户）。                                                                                                                                  |
| compress              | bool or str | True                         | 为 ClickHouse HTTP 插入和查询结果启用压缩。见 [附加选项 （压缩）](#compression)                                                                                                                        |
| query_limit           | int         | 0（无限制）                  | 对于任何 `query` 响应返回的最大行数。将其设置为零以返回无限行。请注意，较大的查询限制可能会导致内存溢出异常，如果结果未进行流式传输，因为所有结果都一次性加载到内存中。                                                                 |
| query_retries         | int         | 2                            | `query` 请求的最大重试次数。只有“可重试”的 HTTP 响应才会被重试。`command` 或 `insert` 请求不会被驱动程序自动重试，以防止意外的重复请求。                                                                                          |
| connect_timeout       | int         | 10                           | HTTP 连接超时时间（秒）。                                                                                                                                                                                                                   |
| send_receive_timeout  | int         | 300                          | HTTP 连接的发送/接收超时时间（秒）。                                                                                                                                                                                                        |
| client_name           | str         | *None*                       | client_name 预先添加到 HTTP 用户代理头中。设置此项以跟踪 ClickHouse system.query_log 中的客户端查询。                                                                                                                                 |
| pool_mgr              | obj         | *&lt;默认 PoolManager&gt;* | 要使用的 `urllib3` 库 PoolManager。适用于需要多个连接池访问不同主机的高级用例。                                                                                                                                                                       |
| http_proxy            | str         | *None*                       | HTTP 代理地址（相当于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                      |
| https_proxy           | str         | *None*                       | HTTPS 代理地址（相当于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                                    |
| apply_server_timezone | bool        | True                         | 对于时区感知的查询结果使用服务器时区。见 [时区优先级](#time-zones)                                                                                                                                                                         |
#### HTTPS/TLS 参数 {#httpstls-arguments}

| 参数               | 类型 | 默认    | 描述                                                                                                                                                                                                                                                                                             |
|--------------------|------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify             | bool | True    | 如果使用 HTTPS/TLS，则验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、过期等）。                                                                                                                                                                                                                |
| ca_cert            | str  | *None*  | 如果 *verify*=*True*，则验证 ClickHouse 服务器证书的根证书的文件路径，格式为 .pem。如果验证为 False，则忽略此项。如果 ClickHouse 服务器证书是被操作系统验证的全球可信根，则不需要此项。                                                                                                               |
| client_cert        | str  | *None*  | 用于 TLS 客户端证书的文件路径，格式为 .pem（用于双向 TLS 认证）。该文件应包含完整的证书链，包括任何中间证书。                                                                                                                                                                                |
| client_cert_key    | str  | *None*  | 客户端证书的私钥文件路径。如果私钥不包含在客户端证书密钥文件中，则为必需项。                                                                                                                                                                                                  |
| server_host_name   | str  | *None*  | 由其 TLS 证书的 CN 或 SNI 确定的 ClickHouse 服务器主机名。设置此项以避免在通过具有不同主机名的代理或隧道连接时出现 SSL 错误。                                                                                                                                                                |
| tls_mode           | str  | *None*  | 控制高级 TLS 行为。`proxy` 和 `strict` 不调用 ClickHouse 的双向 TLS 连接，但会发送客户端证书和密钥。`mutual` 假设 ClickHouse 使用客户端证书的双向 TLS 认证。*None*/默认行为为 `mutual`                                                               |
#### 设置参数 {#settings-argument}

最后，传递给 `get_client` 的 `settings` 参数用于在每个客户端请求中向服务器传递额外的 ClickHouse 设置。请注意，在大多数情况下，具有 *readonly*=*1* 访问权限的用户无法更改随查询发送的设置，因此 ClickHouse Connect 将在最终请求中丢弃此类设置并记录警告。以下设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话，且未按一般 ClickHouse 设置进行文档化。

| 设置               | 描述                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（以字节为单位）。                                                                                                                                      |
| session_id        | 用于在服务器上关联相关查询的唯一会话 ID。临时表为必需。                                                                                                                                                          |
| compress          | ClickHouse 服务器是否应压缩 POST 响应数据。此设置仅应用于“原始”查询。                                                                                                                                           |
| decompress        | 发送到 ClickHouse 服务器的数据是否必须被解压缩。此设置仅应用于“原始”插入。                                                                                                                                      |
| quota_key         | 与此请求相关的配额键。请参见 ClickHouse 服务器有关配额的文档。                                                                                                                                              |
| session_check     | 用于检查会话状态。                                                                                                                                         |
| session_timeout   | 在被识别的会话 ID 超时并不再被视为有效之前的不活动秒数。默认为 60 秒。                                                                                                                                                |
| wait_end_of_query | 在 ClickHouse 服务器上缓冲整个响应。此设置在返回汇总信息时是必需的，在非流式查询中会自动设置。                                                                                                                       |

有关可以通过每个查询发送的其他 ClickHouse 设置，请参见 [ClickHouse 文档](/operations/settings/settings.md)。
#### 客户端创建示例 {#client-creation-examples}

- 在没有任何参数的情况下，ClickHouse Connect 客户端将连接到 `localhost` 上的默认 HTTP 端口，使用默认用户且无需密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 连接到安全（https）外部 ClickHouse 服务器

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- 连接时使用会话 ID 和其他自定义连接参数及 ClickHouse 设置。

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

几个客户端方法使用一个或两个常见的 `parameters` 和 `settings` 参数。以下描述这些关键字参数。
#### 参数参数 {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数，用于将 Python 表达式绑定到 ClickHouse 值表达式。可用两种类型的绑定。
##### 服务器端绑定 {#server-side-binding}

ClickHouse 支持 [服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)，用于大多数查询值，其中绑定值与查询分开作为 HTTP 查询参数发送。如果 ClickHouse Connect 检测到形式为 `{<name>:<datatype>}` 的绑定表达式，将添加相应的查询参数。对于服务器端绑定，`parameters` 参数应为 Python 字典。

- 使用 Python 字典、DateTime 值和字符串值的服务器端绑定

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# Generates the following query on the server

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- 服务器端绑定仅支持（由 ClickHouse 服务器）对于 `SELECT` 查询。它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。这一点在未来可能会改变，请见 https://github.com/ClickHouse/ClickHouse/issues/42092。
##### 客户端绑定 {#client-side-binding}

ClickHouse Connect 还支持客户端参数绑定，这可以允许在生成模板化 SQL 查询时提供更大的灵活性。对于客户端绑定，`parameters` 参数应为字典或序列。客户端绑定使用 Python 的 ["printf" 风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 字符串格式化进行参数替换。

请注意，与服务器端绑定不同，客户端绑定不适用于数据库标识符，例如数据库、表或列名，因为 Python 风格的格式化无法区分不同类型的字符串，它们需要进行不同的格式化（数据库标识符使用反引号或双引号，数据值使用单引号）。

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
绑定 DateTime64 参数（具有亚秒精度的 ClickHouse 类型）需要两种自定义方法之一：
- 将 Python `datetime.datetime` 值包装在新的 DT64Param 类中，例如
```python
query = 'SELECT {p1:DateTime64(3)}'  # Server side binding with dictionary
parameters={'p1': DT64Param(dt_value)}

query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client side binding with list 
parameters=['a string', DT64Param(datetime.now())]
```
  - 如果使用参数值的字典，请在参数名称后附加字符串 `_64`
```python
query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server side binding with dictionary

parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
#### 设置参数 {#settings-argument-1}

所有关键的 ClickHouse Connect 客户端 “insert” 和 “select” 方法接受一个可选的 `settings` 关键字参数，以传递 ClickHouse 服务器 [用户设置](/operations/settings/settings.md) 给包含的 SQL 语句。`settings` 参数应为字典。每个项目应为 ClickHouse 设置名称及其关联值。请注意，当作为查询参数发送到服务器时，值将被转换为字符串。

与客户端级设置一样，ClickHouse Connect 将丢弃服务器标记为 *readonly*=*1* 的任何设置，并附带日志消息。仅适用于通过 ClickHouse HTTP 接口进行查询的设置始终有效。这些设置在 `get_client` [API](#settings-argument) 下进行描述。

使用 ClickHouse 设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### 客户端 `command` 方法 {#client-command-method}

使用 `Client.command` 方法将 SQL 查询发送到 ClickHouse 服务器，这些查询通常不返回数据或返回单个原始值或数组值，而不是完整的数据集。此方法接受以下参数：

| 参数           | 类型             | 默认       | 描述                                                                                                                                                     |
|----------------|------------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd            | str              | *必需*     | 一个 ClickHouse SQL 语句，返回单个值或一行值。                                                                                                                                         |
| parameters      | dict or iterable  | *无*       | 见 [参数描述](#parameters-argument)。                                                                                                                    |
| data            | str or bytes     | *无*       | 可选数据，作为 POST 正文包含在命令中。                                                                                                                                               |
| settings        | dict             | *无*       | 见 [设置描述](#settings-argument)。                                                                                                                                               |
| use_database    | bool             | True        | 使用客户端数据库（在创建客户端时指定）。False 意味着命令将使用连接用户的默认 ClickHouse 服务器数据库。                                   |
| external_data   | ExternalData     | *无*       | 包含文件或二进制数据的 ExternalData 对象，用于查询。见 [高级查询（外部数据）](#external-data)。                                                 |

- `_command_` 可用于 DDL 语句。如果 SQL “命令”没有返回数据，则返回一个“查询摘要”字典。该字典封装了 ClickHouse X-ClickHouse-Summary 和 X-ClickHouse-Query-Id 头，包括键/值对 `written_rows`、`written_bytes` 和 `query_id`。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- `_command_` 还可以用于仅返回单行的简单查询

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### 客户端 `query` 方法 {#client-query-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个 “批次” 数据集的主要方式。它利用 HTTP 的原生 ClickHouse 格式高效地传输大型数据集（最多约一百万行）。此方法接受以下参数。

| 参数               | 类型             | 默认       | 描述                                                                                                                                                                         |
|---------------------|------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必需*     | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                      |
| parameters          | dict or iterable  | *无*       | 见 [参数描述](#parameters-argument)。                                                                                                                                       |
| settings            | dict              | *无*       | 见 [设置描述](#settings-argument)。                                                                                                                                        |
| query_formats       | dict              | *无*       | 结果值的数据类型格式说明。见高级用法（读取格式）                                                                                                                             |
| column_formats      | dict              | *无*       | 每列的数据类型格式。见高级用法（读取格式）                                                                                                                                 |
| encoding            | str               | *无*       | 用于将 ClickHouse 字符串列编码为 Python 字符串的编码。如果未设置，Python 默认使用 `UTF-8`。                                                                                      |
| use_none            | bool              | True        | 对于 ClickHouse 空值使用 Python *None* 类型。如果 False，则对 ClickHouse 空值使用数据类型默认值（例如 0）。注意 - 由于性能原因，NumPy/Pandas 默认情况下将此设置为 False。                     |
| column_oriented     | bool              | False       | 以列的序列返回结果，而不是行的序列。这有助于将 Python 数据转换为其他列式数据格式。                                                                                                |
| query_tz            | str               | *无*       | 来自 `zoneinfo` 数据库的时区名称。此时区将应用于所有由查询返回的日期时间或 Pandas 时间戳对象。                                                                                    |
| column_tzs          | dict              | *无*       | 列名与时区名称的字典。与 `query_tz` 相似，但允许为不同列指定不同的时区。                                                                                                         |
| use_extended_dtypes | bool              | True        | 使用 Pandas 扩展数据类型（如 StringArray），以及 pandas.NA 和 pandas.NaT 作为 ClickHouse NULL 值。仅适用于 `query_df` 和 `query_df_stream` 方法。                                  |
| external_data       | ExternalData     | *无*       | 包含文件或二进制数据的 ExternalData 对象，用于查询。见 [高级查询（外部数据）](#external-data)。                                                                                     |
| context             | QueryContext     | *无*       | 可重用的 QueryContext 对象可用于封装上述方法参数。见 [高级查询（QueryContexts）](#querycontexts)。                                                                                |
#### The QueryResult object {#the-queryresult-object}

基础 `query` 方法返回一个 QueryResult 对象，具有以下公共属性：

- `result_rows` -- 以行序列的形式返回的数据矩阵，每行元素是列值的序列。
- `result_columns` -- 以列序列的形式返回的数据矩阵，每列元素是该列的行值序列。
- `column_names` -- 表示 `result_set` 中列名的字符串元组。
- `column_types` -- 表示 `result_columns` 中每列的 ClickHouse 数据类型的 ClickHouseType 实例的元组。
- `query_id` -- ClickHouse 的 query_id（对于检查 `system.query_log` 表中的查询非常有用）。
- `summary` -- 由 `X-ClickHouse-Summary` HTTP 响应头返回的任意数据。
- `first_item` -- 方便属性，用于将响应的第一行作为字典检索（键为列名）。
- `first_row` -- 返回结果的第一行的方便属性。
- `column_block_stream` -- 以列为导向格式生成查询结果的生成器。该属性不应被直接引用（见下文）。
- `row_block_stream` -- 以行为导向格式生成查询结果的生成器。该属性不应被直接引用（见下文）。
- `rows_stream` -- 生成每次调用返回一行查询结果的生成器。该属性不应被直接引用（见下文）。
- `summary` -- 如在 `command` 方法下所述，由 ClickHouse 返回的汇总信息字典。

`*_stream` 属性返回一个 Python 上下文，可用作返回数据的迭代器。它们只能通过 Client 的 `*_stream` 方法间接访问。

使用 StreamContext 对象流式查询结果的完整细节在 [Advanced Queries (Streaming Queries)](#streaming-queries) 中进行了概述。

### Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

主 `query` 方法有三种专用版本：

- `query_np` -- 此版本返回一个 NumPy 数组，而不是 ClickHouse Connect QueryResult。
- `query_df` -- 此版本返回一个 Pandas DataFrame，而不是 ClickHouse Connect QueryResult。
- `query_arrow` -- 此版本返回一个 PyArrow 表。它直接使用 ClickHouse 的 `Arrow` 格式，因此仅接受与主 `query` 方法共同的三个参数： `query`，`parameters` 和 `settings`。此外，还有一个额外参数 `use_strings`，用于确定 Arrow 表是否将 ClickHouse 的字符串类型渲染为字符串（如果为 True）或字节（如果为 False）。

### Client streaming query methods {#client-streaming-query-methods}

ClickHouse Connect 客户端提供多种方法以流的形式检索数据（实现为 Python 生成器）：

- `query_column_block_stream` -- 以块形式将查询数据返回为列的序列，使用原生 Python 对象。
- `query_row_block_stream` -- 将查询数据作为行块返回，使用原生 Python 对象。
- `query_rows_stream` -- 将查询数据返回为行的序列，使用原生 Python 对象。
- `query_np_stream` -- 将每个 ClickHouse 查询数据块作为 NumPy 数组返回。
- `query_df_stream` -- 将每个 ClickHouse 查询数据块返回为 Pandas DataFrame。
- `query_arrow_stream` -- 将查询数据以 PyArrow RecordBlocks 返回。

这些方法中的每一个都返回一个 `ContextStream` 对象，必须通过 `with` 语句打开以开始消费流。有关详细信息和示例，请参见 [Advanced Queries (Streaming Queries)](#streaming-queries)。

### Client `insert` method {#client-insert-method}

对于将多个记录插入 ClickHouse 的常见用例，有 `Client.insert` 方法。它接受以下参数：

| 参数              | 类型                             | 默认值          | 描述                                                                                                                                                         |
|-------------------|----------------------------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                              | *必需*          | 要插入的 ClickHouse 表。允许使用完整的表名（包括数据库）。                                                                                                    |
| data              | 序列的序列                      | *必需*          | 要插入的数据矩阵，可以是每行是列值序列的行序列，或是每列是行值序列的列序列。                                                                                    |
| column_names      | str 的序列或 str                | '*'             | 数据矩阵的列名列表。如果使用 '*'，ClickHouse Connect 将执行“预查询”以检索表的所有列名。                                                                    |
| database          | str                              | ''              | 插入的目标数据库。如果未指定，将假定使用客户端的数据库。                                                                                                       |
| column_types      | ClickHouseType 的序列           | *无*            | ClickHouseType 实例的列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行“预查询”以检索表的所有列类型。                     |
| column_type_names | ClickHouse 类型名的序列         | *无*            | ClickHouse 数据类型名称的列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行“预查询”以检索表的所有列类型。                   |
| column_oriented   | bool                             | False           | 如果为 True，则 `data` 参数被视为列的序列（且不需要进行“透视”以插入数据）。否则，`data` 被解释为行的序列。                                                  |
| settings          | dict                             | *无*            | 参见 [settings description](#settings-argument)。                                                                                                          |
| insert_context    | InsertContext                    | *无*            | 可重用的 InsertContext 对象可用于封装上述方法参数。参见 [Advanced Inserts (InsertContexts)](#insertcontexts)。                                               |

该方法返回一个“查询摘要”字典，如 "command" 方法下所述。如果因为任何原因插入失败，将引发异常。

主 `insert` 方法有两个专用版本：

- `insert_df` -- 此方法的第二个参数要求一个 Pandas DataFrame 实例作为 `df` 参数，而不是 Python 的序列的序列的 `data` 参数。ClickHouse Connect 会自动将 DataFrame 处理为列导向数据源，因此 `column_oriented` 参数不需要也不可用。
- `insert_arrow` -- 此方法需要一个 `arrow_table`，而不是 Python 的序列的序列的 `data` 参数。ClickHouse Connect 将箭头表不做修改地传递给 ClickHouse 服务器进行处理，因此除了 `table` 和 `arrow_table` 外，只有 `database` 和 `settings` 参数可用。

*注意：* NumPy 数组是有效的序列的序列，可以用作主 `insert` 方法的 `data` 参数，因此不需要专用方法。

### File Inserts {#file-inserts}

`clickhouse_connect.driver.tools` 包含 `insert_file` 方法，允许直接从文件系统插入数据到现有的 ClickHouse 表。解析工作委托给 ClickHouse 服务器。`insert_file` 接受以下参数：

| 参数          | 类型            | 默认值         | 描述                                                                                                                                                   |
|---------------|-----------------|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| client        | Client          | *必需*          | 用于执行插入的 `driver.Client`                                                                                                                        |
| table         | str             | *必需*          | 要插入的 ClickHouse 表。允许使用完整的表名（包括数据库）。                                                                                                |
| file_path     | str             | *必需*          | 数据文件的本地文件系统路径                                                                                                                               |
| fmt           | str             | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，默认为 CSVWithNames。                                                                             |
| column_names  | str 的序列     | *无*            | 数据文件中的列名列表。对于包含列名的格式不需要。                                                                                                         |
| database      | str             | *无*            | 表的数据库。如果表名称是完全限定的，则忽略。如未指定，则插入将使用客户端数据库。                                                                         |
| settings      | dict            | *无*            | 参见 [settings description](#settings-argument)。                                                                                                      |
| compression   | str             | *无*            | 用于 Content-Encoding HTTP 响应头的认可的 ClickHouse 压缩类型（zstd，lz4，gzip）。                                                                       |

对于具有不一致数据或日期/时间值格式异常的文件，适用于数据导入的设置（例如 `input_format_allow_errors_num`）被此方法识别。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
### Saving query results as files {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法直接将文件从 ClickHouse 流式传输到本地文件系统。例如，如果您想将查询结果保存到 CSV 文件中，可以使用以下代码片段：

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

上面的代码生成一个名为 `output.csv` 的文件，内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同样，您可以以 [TabSeparated](/interfaces/formats#tabseparated) 和其他格式保存数据。有关所有可用格式选项的概述，请参见 [Formats for Input and Output Data](/interfaces/formats)。

### Raw API {#raw-api}

对于不需要 ClickHouse 数据与本地或第三方数据类型和结构之间转换的用例，ClickHouse Connect 客户端提供了两个用于直接使用 ClickHouse 连接的方法。

#### Client `raw_query` Method {#client_raw_query_method}

`Client.raw_query` 方法允许直接使用 ClickHouse HTTP 查询接口，使用客户端连接。返回值是未经处理的 `bytes` 对象。它提供了一个方便的封装，具有参数绑定、错误处理、重试和使用简洁接口的设置管理：

| 参数          | 类型             | 默认值          | 描述                                                                                                                               |
|---------------|------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *必需*          | 任何有效的 ClickHouse 查询                                                                                                          |
| parameters    | dict 或可迭代对象 | *无*            | 参见 [parameters description](#parameters-argument)。                                                                              |
| settings      | dict             | *无*            | 参见 [settings description](#settings-argument)。                                                                                  |
| fmt           | str              | *无*            | 返回字节的 ClickHouse 输出格式。（如果未指定，ClickHouse 使用 TSV）                                                                  |
| use_database  | bool             | True            | 在查询上下文中使用 ClickHouse Connect 客户端分配的数据库                                                                                      |
| external_data | ExternalData     | *无*            | 一个包含文件或二进制数据的 ExternalData 对象，以便与查询一起使用。请参见 [Advanced Queries (External Data)](#external-data)。 |

处理返回的 `bytes` 对象是调用方的责任。注意，`Client.query_arrow` 只是一个围绕此方法的薄包装，使用 ClickHouse 的 `Arrow` 输出格式。

#### Client `raw_stream` Method {#client_raw_stream_method}

`Client.raw_stream` 方法与 `raw_query` 方法具有相同的 API，但返回一个 `io.IOBase` 对象，可用作 `bytes` 对象的生成器/流源。它目前由 `query_arrow_stream` 方法使用。

#### Client `raw_insert` Method {#client_raw_insert_method}

`Client.raw_insert` 方法允许直接插入 `bytes` 对象或使用客户端连接的 `bytes` 对象生成器。由于不对插入负载进行处理，因此性能非常高。该方法提供了指定设置和插入格式的选项：

| 参数             | 类型                                   | 默认值         | 描述                                                                                     |
|------------------|----------------------------------------|-----------------|------------------------------------------------------------------------------------------|
| table            | str                                    | *必需*          | 简单或数据库限定的表名称                                                                |
| column_names     | Sequence[str]                          | *无*            | 插入块的列名。如果 `fmt` 参数不包括名称，则必需。                                         |
| insert_block     | str、bytes、Generator[bytes]、BinaryIO | *必需*          | 要插入的数据。字符串将以客户端编码进行编码。                                             |
| settings         | dict                                   | *无*            | 参见 [settings description](#settings-argument)。                                          |
| fmt              | str                                    | *无*            | ClickHouse 的 `insert_block` 字节的输入格式。（如果未指定，ClickHouse 使用 TSV）           |

确保 `insert_block` 是指定格式并使用特定压缩方法是调用方的责任。ClickHouse Connect 使用这些原始插入进行文件上传和 PyArrow 表，并将解析委托给 ClickHouse 服务器。

### Utility classes and functions {#utility-classes-and-functions}

以下类和函数也被视为“公共” `clickhouse-connect` API 的一部分，并且与上述文档中的类和方法一样，在小版本更新中是稳定的。对这些类和函数的重大更改只会在小版本（而不是补丁）发布时发生，并且在至少一个小版本发布中将以弃用状态提供。

#### Exceptions {#exceptions}

所有自定义异常（包括在 DB API 2.0 规范中定义的异常）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序检测到的异常将使用这些类型中的一种。

#### Clickhouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。同样，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。

### Multithreaded, multiprocess, and async/event driven use cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程和事件循环驱动/异步应用程序中表现良好。所有查询和插入处理都发生在单个线程内，因此操作通常是线程安全的。（低级别的某些操作的并行处理可能是未来的增强功能，以克服单线程的性能损失，
但是即使在那种情况下也会保持线程安全）。

由于每个查询或插入执行都会在其自己的 QueryContext 或 InsertContext 对象中维护状态，因此这些辅助对象不是线程安全的，且不应在多个处理流之间共享。有关上下文对象的额外讨论，请参见以下部分。

此外，在具有两个或多个 "正在进行" 的查询和/或插入的应用程序中，需要牢记两个进一步的考虑因素。第一个是与查询/插入关联的 ClickHouse “会话”，第二个是 ClickHouse Connect 客户端实例使用的 HTTP 连接池。

### Asyncclient wrapper {#asyncclient-wrapper}

自 0.7.16 起，ClickHouse Connect 提供了一个异步包装，覆盖常规的 `Client`，因此可以在 `asyncio` 环境中使用客户端。

要获取 `AsyncClient` 的实例，可以使用 `get_async_client` 工厂函数，接受与标准 `get_client` 相同的参数：

```python
import asyncio

import clickhouse_connect

async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)

asyncio.run(main())
```

`AsyncClient` 具有与标准 `Client` 相同的方法和相同的参数，但在适用时是协程。内部，`Client` 中执行 I/O 操作的方法被包装在一个 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

使用 `AsyncClient` 包装器时，多线程性能将提高，因为在等待 I/O 操作完成时将释放执行线程和 GIL。

注意：与常规 `Client` 不同，`AsyncClient` 默认强制 `autogenerate_session_id` 为 `False`。

另请参见：[run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。

### Managing ClickHouse Session Ids {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都在 ClickHouse “会话”的上下文中发生。会话目前有两个用途：
- 将特定的 ClickHouse 设置与多个查询关联（参见 [user settings](/operations/settings/settings.md)）。使用 ClickHouse 的 `SET` 命令更改用户会话范围的设置。
- 跟踪 [temporary tables.](/sql-reference/statements/create/table#temporary-tables)

默认情况下，使用 ClickHouse Connect 客户端实例执行的每个查询都使用相同的会话 ID，以启用该会话功能。即，当使用单一 ClickHouse 客户端时，`SET` 语句和临时表的工作都如预期般正常。然而，设计上 ClickHouse 服务器不允许在同一会话内进行并发查询。因此，对于将执行并发查询的 ClickHouse Connect 应用程序，有两个选择。

- 为将具有自己会话 ID 的每个执行线程（线程、进程或事件处理程序）创建一个单独的 `Client` 实例。这通常是最佳方法，因为它保留了每个客户端的会话状态。
- 为每个查询使用唯一的会话 ID。在临时表或共享会话设置不需要的情况下，这可避免并发会话问题。（创建客户端时，也可以提供共享设置，但这些设置与会话无关，而是与每个请求一起发送）。唯一的 session_id 可以添加到每个请求的 `settings` 字典中，或者您可以禁用 `autogenerate_session_id` 通用设置：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

在这种情况下，ClickHouse Connect 将不发送任何会话 ID，ClickHouse 服务器将生成随机会话 ID。再次说明，临时表和会话级别设置将不可用。

### Customizing the HTTP connection pool {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池处理与服务器的基础 HTTP 连接。默认情况下，所有客户端实例共享相同的连接池，这对于大多数用例足够。此默认池维护最多 8 个 HTTP Keep Alive 连接到应用程序使用的每个 ClickHouse 服务器。

对于大型多线程应用程序，可能需要单独的连接池。可以将自定义连接池作为 `pool_mgr` 关键字参数提供给主 `clickhouse_connect.get_client` 函数：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上例所示，客户端可以共享一个池管理器，或为每个客户端创建一个单独的池管理器。有关创建 PoolManager 时可用选项的更多详细信息，请参见 [`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。

## Querying data with ClickHouse Connect:  Advanced usage {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse Connect 在 QueryContext 中执行标准查询。QueryContext 包含用于构建针对 ClickHouse 数据库查询的关键结构，以及用于将结果处理为 QueryResult 或其他响应数据结构的配置。包括查询本身、参数、设置、读取格式和其他属性。

可以使用客户端的 `create_query_context` 方法获取 QueryContext。此方法接受与核心查询方法相同的参数。然后可以将此查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，而不需要提供任何或全部其他参数。请注意，为方法调用指定的其他参数将覆盖 QueryContext 的任何属性。

QueryContext 的最清晰用例是在发送相同查询但不同绑定参数值时。可以通过调用 `QueryContext.set_parameters` 方法并传递一个字典来更新所有参数值，或通过调用 `QueryContext.set_parameter` 方法及所需的 `key`、`value` 对来更新单个值。

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

### Streaming queries {#streaming-queries}

#### Data blocks {#data-blocks}

ClickHouse Connect 将来自主 `query` 方法的所有数据处理为从 ClickHouse 服务器接收的块流。这些块以自定义的 "Native" 格式在 ClickHouse 之间传输。“块”只是相同数据类型的二进制数据列的序列。（作为列式数据库，ClickHouse 以类似的形式存储这些数据。）从查询返回的块的大小由两个用户设置控制，可以在多个级别设置（用户配置文件、用户、会话或查询）。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 块大小（以行为单位）的限制。默认值为 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 块大小（以字节为单位）的软限制。默认值为 1,000,0000。

无论 `preferred_block_size_setting` 如何，每个块的行数永远不会超过 `max_block_size`。具体查询返回的实际块可以是任意大小。例如，覆盖多个分片的分布式表的查询可能包含直接从每个分片检索的小块。

使用客户端的 `query_*_stream` 方法时，结果按块返回。ClickHouse Connect 仅加载一个块。这样可以处理大量数据，而无需将大量结果集全部加载到内存中。请注意，应用程序应准备处理任意数量的块，并且每个块的确切大小无法控制。

#### HTTP data buffer for slow processing {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果块的处理速度显著慢于 ClickHouse 服务器流式传输数据的速度，ClickHouse 服务器将关闭连接，导致处理线程中抛出异常。通过使用通用的 `http_buffer_size` 设置增加 HTTP 流式缓冲区的缓冲区大小（默认值为 10 兆字节），可以减轻一些。
在这种情况下，如果应用程序有足够的内存，使用大的 `http_buffer_size` 值应该是安全的。如果使用 `lz4` 或 `zstd` 压缩，则缓冲区中的数据会被压缩，因此使用这些压缩类型将增加可用的整体缓冲区。

#### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（如 `query_row_block_stream`）返回一个 ClickHouse `StreamContext` 对象，它是一个结合的 Python 上下文/生成器。这是基本的用法：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

请注意，尝试在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文可确保即使没有消耗所有数据和/或在处理过程中出现异常，流（在这种情况下是流式的 HTTP 响应）也会被正确关闭。此外，StreamContexts 只能使用一次来消费流。在退出后尝试使用 StreamContext 将产生 `StreamClosedError`。

可以使用 StreamContext 的 `source` 属性访问父 `QueryResult` 对象，其中包含列名和类型。

#### Stream types {#stream-types}

`query_column_block_stream` 方法将块作为存储为原生 Python 数据类型的列数据序列返回。使用上述的 `taxi_trips` 查询，返回的数据将是一个列表，其中每个元素是一个列表（或元组），包含关联列的所有数据。因此，`block[0]` 将是一个仅包含字符串的元组。列导向格式最常用于对列中所有值进行聚合操作，例如总计车费。

`query_row_block_stream` 方法将块作为行序列返回，类似于传统关系数据库。对于 taxi trips，返回的数据将是一个列表，其中每个元素是另一个列表，表示一行数据。因此，`block[0]` 将包含第一辆出租车行程的所有字段（按顺序），`block[1]` 将包含第二辆出租车行程的所有字段，以此类推。行导向的结果通常用于显示或转换过程。

`query_row_stream` 是一个方便的方法，在迭代流时会自动移动到下一个块。否则，它与 `query_row_block_stream` 完全相同。

`query_np_stream` 方法将每个块作为二维 NumPy 数组返回。在内部，NumPy 数组（通常）按列存储，因此不需要单独的行或列方法。NumPy 数组的“形状”将表示为（列，行）。NumPy 库提供了许多操作 NumPy 数组的方法。请注意，如果查询中的所有列共享相同的 NumPy 数据类型，则返回的 NumPy 数组也只会有一个数据类型，并且可以在不实际更改其内部结构的情况下重新塑造/旋转。

`query_df_stream` 方法将每个 ClickHouse 块返回为二维 Pandas DataFrame。以下是一个示例，显示 StreamContext 对象可以以延迟的方式作为上下文使用（但只能使用一次）。

最后，`query_arrow_stream` 方法返回 ClickHouse `ArrowStream` 格式的结果，包装在 StreamContext 中为 pyarrow.ipc.RecordBatchStreamReader。流的每次迭代返回 PyArrow RecordBlock。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

### Read formats {#read-formats}

读取格式控制从客户端的 `query`、`query_np` 和 `query_df` 方法返回的值的数据类型。（`raw_query` 和 `query_arrow` 不会修改来自 ClickHouse 的输入数据，因此格式控制不适用。）例如，如果将 UUID 的读取格式从默认的 `native` 格式更改为可选的 `string` 格式，则 ClickHouse 的 UUID 列查询将返回字符串值（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的“数据类型”参数可以包括通配符。格式是一个单一的小写字符串。

读取格式可以在多个级别设置：

- 全局设置，使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制配置数据类型的格式，以适用于所有查询。
  
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```

- 针对整个查询，使用可选的 `query_formats` 字典参数。在这种情况下，任何列（或子列）的指定数据类型会使用配置的格式。

```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

- 针对特定列中的值，使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，以及数据列的格式或第二级 “格式” 字典，ClickHouse 类型名称和查询格式值。此二级字典可用于嵌套列类型，例如元组或图。 

```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 读取格式选项（Python 类型） {#read-format-options-python-types}

| ClickHouse 类型        | 原生 Python 类型       | 读取格式      | 备注                                                                                                             |
|-----------------------|-----------------------|---------------|-----------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                                 |
| UInt64                | int                   | signed        | Superset 目前不支持大的无符号 UInt64 值                                                                          |
| [U]Int[128,256]       | int                   | string        | Pandas 和 NumPy 的整数值最多为 64 位，因此这些可以作为字符串返回                                               |
| Float32               | float                 | -             | 所有 Python 浮点数内部均为 64 位                                                                                 |
| Float64               | float                 | -             |                                                                                                                 |
| Decimal               | decimal.Decimal       | -             |                                                                                                                 |
| String                | string                | bytes         | ClickHouse 的字符串列没有固有编码，因此也用于可变长度的二进制数据                                               |
| FixedString           | bytes                 | string        | FixedStrings 是固定大小的字节数组，但有时被视为 Python 字符串                                                |
| Enum[8,16]            | string                | string, int   | Python 枚举不接受空字符串，因此所有枚举以字符串或底层整数值呈现。                                              |
| Date                  | datetime.date         | int           | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。此值作为整数可用                                        |
| Date32                | datetime.date         | int           | 与 Date 相同，但用于更广泛的日期范围                                                                              |
| DateTime              | datetime.datetime     | int           | ClickHouse 以纪元秒存储 DateTime。此值作为整数可用                                                              |
| DateTime64            | datetime.datetime     | int           | Python datetime.datetime 的精度限制为微秒。原始 64 位整数值可用                                                  |
| IPv4                  | `ipaddress.IPv4Address` | string        | IP 地址可以作为字符串读取，格式正确的字符串可作为 IP 地址插入                                                  |
| IPv6                  | `ipaddress.IPv6Address` | string        | IP 地址可以作为字符串读取，格式正确的字符串可以作为 IP 地址插入                                                |
| Tuple                 | dict or tuple         | tuple, json   | 命名元组默认以字典形式返回。命名元组也可以作为 JSON 字符串返回                                                  |
| Map                   | dict                  | -             |                                                                                                                 |
| Nested                | Sequence[dict]        | -             |                                                                                                                 |
| UUID                  | uuid.UUID             | string        | UUID 可以根据 RFC 4122 格式作为字符串读取<br/>                                                                 |
| JSON                  | dict                  | string        | 默认返回一个 Python 字典。`string` 格式将返回一个 JSON 字符串                                                  |
| Variant               | object                | -             | 返回与存储值的 ClickHouse 数据类型相匹配的 Python 类型                                                           |
| Dynamic               | object                | -             | 返回与存储值的 ClickHouse 数据类型相匹配的 Python 类型                                                           |

### 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。此二进制数据与查询字符串一起发送，以用于处理数据。有关外部数据特性的详细信息请参见 [这里](/engines/table-engines/special/external-data.md)。客户端 `query*` 方法接受可选的 `external_data` 参数以利用此功能。`external_data` 参数的值应该是 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数：

| 名称       | 类型              | 描述                                                                                                                                                        |
|------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path  | str               | 要从中读取外部数据的本地系统路径上的文件路径。必须提供 `file_path` 或 `data` 中的一个                                                                                     | 
| file_name  | str               | 外部数据“文件”的名称。如果未提供，将根据 `file_path`（不带扩展名）确定                                                                                         |
| data       | bytes             | 二进制形式的外部数据（而不是从文件中读取）。必须提供 `data` 或 `file_path` 中的一个                                                                          |
| fmt        | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认为 `TSV`                                                                                   |
| types      | str or seq of str | 外部数据中列数据类型的列表。如果是字符串，则类型应由逗号分隔。必须提供 `types` 或 `structure` 中的一个                                                               |
| structure  | str or seq of str | 数据中列名 + 数据类型的列表（请参见示例）。必须提供 `structure` 或 `types` 中的一个                                                                          |
| mime_type  | str               | 文件数据的可选 MIME 类型。当前 ClickHouse 忽略此 HTTP 子头                                                                                                  |

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

可以使用 `add_file` 方法将其他外部数据文件添加到初始 ExternalData 对象，该方法接受与构造函数相同的参数。对于 HTTP，所有外部数据作为 `multi-part/form-data` 文件上传的一部分进行传输。

### 时区 {#time-zones}

有多种机制可将时区应用于 ClickHouse DateTime 和 DateTime64 值。内部的 ClickHouse 服务器始终将任何 DateTime 或 DateTime64 对象存储为表示自纪元以来的无时区的数字，即 1970-01-01 00:00:00 UTC 时间。对于 DateTime64 值，表示可以是自纪元以来的毫秒、微秒或纳秒，具体取决于精度。因此，任何时区信息的应用总是在客户端进行。请注意，这涉及到有意义的额外计算，因此在性能关键的应用程序中，建议将 DateTime 类型视为纪元时间戳，除用户显示和转换之外（例如，Pandas 时间戳总是表示纪元纳秒的 64 位整数，以提高性能）。

在查询中使用时区感知数据类型时 - 特别是 Python 的 `datetime.datetime` 对象 -- `clickhouse-connect` 使用以下优先规则来应用客户端时区：

1. 如果为查询指定了查询方法参数 `client_tzs`，则应用特定列的时区。
2. 如果 ClickHouse 列具有时区元数据（即这是类型 DateTime64(3, 'America/Denver')），则应用 ClickHouse 列的时区。（请注意，该时区元数据在 ClickHouse 版本 23.2 之前对 `clickhouse-connect` 不可用）
3. 如果为查询指定了查询方法参数 `query_tz`，则应用“查询时区”。
4. 如果在查询或会话中应用了时区设置，则应用该时区。（此功能尚未在 ClickHouse 服务器中发布）
5. 最后，如果客户端 `apply_server_timezone` 参数已设置为 True（默认值），则应用 ClickHouse 服务器时区。

请注意，如果根据这些规则应用的时区为 UTC，`clickhouse-connect` 将 _始终_ 返回一个无时区的 Python `datetime.datetime` 对象。如果需要，可以通过应用程序代码向该无时区对象添加额外的时区信息。

## 使用 ClickHouse Connect 插入数据：高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContexts {#insertcontexts}

ClickHouse Connect 在 InsertContext 内执行所有插入。InsertContext 包含发送到客户端 `insert` 方法的所有值。此外，当最初构造 InsertContext 时，ClickHouse Connect 检索执行高效本机格式插入所需的插入列的数据类型。通过重用 InsertContext 进行多次插入，可以避免这个“预查询”，并且插入执行得更快、更高效。

可以使用客户端 `create_insert_context` 方法获取 InsertContext。该方法接受与 `insert` 函数相同的参数。请注意，仅应修改 InsertContexts 的 `data` 属性以进行重用。这与其提供一个可重复使用对象以将新数据重复插入同一表的预期用途一致。

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data=test_data)
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

目前，写入格式仅针对有限数量的类型实现。在大多数情况下，ClickHouse Connect 将尝试通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。例如，如果插入到 DateTime 列，而且该列的第一个插入值是 Python 整数，ClickHouse Connect 将直接插入该整数值，假设它实际上是一个纪元秒。

在大多数情况下，覆盖数据类型的写入格式不必要，但 `clickhouse_connect.datatypes.format` 包中的相关方法可以在全局级别使用。

#### 写入格式选项 {#write-format-options}

| ClickHouse 类型        | 原生 Python 类型       | 写入格式       | 备注                                                                                                  |
|-----------------------|-----------------------|----------------|-------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -              |                                                                                                       |
| UInt64                | int                   |                |                                                                                                       |
| [U]Int[128,256]       | int                   |                |                                                                                                       |
| Float32               | float                 |                |                                                                                                       |
| Float64               | float                 |                |                                                                                                       |
| Decimal               | decimal.Decimal       |                |                                                                                                       |
| String                | string                |                |                                                                                                       |
| FixedString           | bytes                 | string         | 如果作为字符串插入，额外的字节将被设置为零                                                         |
| Enum[8,16]            | string                |                |                                                                                                       |
| Date                  | datetime.date         | int            | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。整数类型将假定为此“纪元日期”值           |
| Date32                | datetime.date         | int            | 与 Date 相同，但用于更广泛的日期范围                                                                |
| DateTime              | datetime.datetime     | int            | ClickHouse 以纪元秒存储 DateTime。整数类型将假定为此“纪元秒”值                                   |
| DateTime64            | datetime.datetime     | int            | Python datetime.datetime 的精度限制为微秒。原始 64 位整数值可用                                   |
| IPv4                  | `ipaddress.IPv4Address` | string         | 格式正确的字符串可以作为 IPv4 地址插入                                                             |
| IPv6                  | `ipaddress.IPv6Address` | string         | 格式正确的字符串可以作为 IPv6 地址插入                                                             |
| Tuple                 | dict or tuple         |                |                                                                                                       |
| Map                   | dict                  |                |                                                                                                       |
| Nested                | Sequence[dict]        |                |                                                                                                       |
| UUID                  | uuid.UUID             | string         | 格式正确的字符串可以作为 ClickHouse UUID 插入                                                      |
| JSON/Object('json')   | dict                  | string         | 可以将字典或 JSON 字符串插入到 JSON 列中（注意 `Object('json')` 已弃用）                            |
| Variant               | object                |                | 目前所有变体都作为字符串插入，并由 ClickHouse 服务器解析                                           |
| Dynamic               | object                |                | 警告 -- 目前向动态列插入的任何内容都会以 ClickHouse 字符串形式保留                                   |

## 附加选项 {#additional-options}

ClickHouse Connect 为高级用例提供了一些附加选项

### 全局设置 {#global-settings}

有少量设置可以全局控制 ClickHouse Connect 的行为。它们可以从顶层 `common` 包访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些公共设置 `autogenerate_session_id`、`product_name` 和 `readonly` 应 _始终_ 在使用 `clickhouse_connect.get_client` 方法创建客户端之前进行修改。创建客户端后更改这些设置不会影响现有客户端的行为。
:::

当前定义了十个全局设置：

| 设置名称                  | 默认值  | 选项                   | 描述                                                                                                                                                                                                                     |
|-------------------------|--------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True   | True, False           | 自动生成每个客户端会话的新 UUID(1) 会话 ID（如果没有提供）。如果没有提供会话 ID（无论是在客户端还是查询级别），ClickHouse 将为每个查询生成随机内部 ID                                                                  |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 当提供无效或只读设置（无论是针对客户端会话还是查询）时要采取的操作。如果是 `drop`，则该设置将被忽略；如果是 `send`，则该设置将发送到 ClickHouse；如果是 `error`，则将引发客户端侧的 ProgrammingError                       |
| dict_parameter_format   | 'json'  | 'json', 'map'         | 这控制参数化查询将 Python 字典转换为 JSON 还是 ClickHouse Map 语法。`json` 应用于 JSON 列的插入，`map` 应用于 ClickHouse Map 列                                                                               |
| product_name            |        |                       | 一个字符串，随着查询传递给 ClickHouse Connect 以跟踪使用 ClickHouse Connect 的应用程序。应采用 `<product_name>/<product_version>` 的形式                                                                 |
| max_connection_age      | 600    |                       | 最大 HTTP Keep Alive 连接保持开放/重用的秒数。这可以防止在负载均衡器/代理后面集中连接在单个 ClickHouse 节点上。默认为 10 分钟。                                                                                 |
| readonly                | 0      | 0, 1                   | 适用于 19.17 之前版本的隐含“只读” ClickHouse 设置。可以设置为匹配 ClickHouse “read_only” 值，以允许与非常旧的 ClickHouse 版本操作                                                                              |
| use_protocol_version    | True   | True, False           | 使用客户端协议版本。这对于 DateTime 时区列是必需的，但与当前版本的 chproxy 不兼容                                                                                                                                    |
| max_error_size          | 1024   |                       | 客户端错误消息中返回的最大字符数。将此设置为 0 以获取完整的 ClickHouse 错误消息。默认为 1024 个字符。                                                                                                             |
| send_os_user            | True   | True, False           | 在发送到 ClickHouse 的客户端信息中包含检测到的操作系统用户（HTTP User-Agent 字符串）                                                                                                                                 |
| http_buffer_size        | 10MB   |                       | 用于 HTTP 流查询的“内存中”缓冲区的大小（以字节为单位）                                                                                                                                                                  |

### 压缩 {#compression}

ClickHouse Connect 支持 lz4、zstd、brotli 和 gzip 压缩，适用于查询结果和插入。始终记住，使用压缩通常涉及在网络带宽/传输速度与 CPU 使用之间的权衡（无论是在客户端还是服务器上）。

要接收压缩数据，ClickHouse 服务器 `enable_http_compression` 必须设置为 1，或者用户必须有权限在“每查询”基础上更改该设置。

压缩由调用 `clickhouse_connect.get_client` 工厂方法时的 `compress` 参数控制。默认情况下，`compress` 设置为 `True`，这将触发默认的压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询，ClickHouse Connect 将添加 `Accept-Encoding` 头，带有 `lz4`、`zstd`、`br`（如果安装了 brotli 库则为 brotli）、`gzip` 和 `deflate` 编码，在使用 `query` 客户端方法执行的查询中（间接地，`query_np` 和 `query_df`）。对于大多数请求，ClickHouse 服务器将以 `zstd` 压缩负载返回。对于插入，默认情况下，ClickHouse Connect 将使用 `lz4` 压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法之一，`lz4`、`zstd`、`br` 或 `gzip`。然后将对插入和查询结果（如果 ClickHouse 服务器支持）都使用该方法。所需的 `zstd` 和 `lz4` 压缩库现在默认与 ClickHouse Connect 一起安装。如果指定了 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不使用客户端配置指定的压缩。

我们还建议不要使用 `gzip` 压缩，因为它在压缩和解压缩数据时显著比其他选项要慢。

### HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 使用 `urllib3` 库添加基本的 HTTP 代理支持。它识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意，使用这些环境变量将适用于任何使用 `clickhouse_connect.get_client` 方法创建的客户端。或者，可以使用 `http_proxy` 或 `https_proxy` 参数来为每个客户端进行配置。有关 HTTP 代理支持实现的详细信息，请参阅 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 Socks 代理，您可以将 `urllib3` 的 SOCKSProxyManager 作为 `pool_mgr` 参数发送到 `get_client`。请注意，这需要安装 PySocks 库，无论是直接安装还是通过 `urllib3` 依赖的 `[socks]` 选项。

### “旧” JSON 数据类型 {#old-json-data-type}

实验性 `Object`（或 `Object('json')`）数据类型已被弃用，并应避免在生产环境中使用。ClickHouse Connect 继续为该数据类型提供有限支持，以实现向后兼容性。请注意，此支持不包括期望返回“顶层”或“父级” JSON 值作为字典或等效内容的查询，这样的查询将导致异常。

### “新” Variant/Dynamic/JSON 数据类型（实验特性） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 提供对新（也是实验性）ClickHouse 类型 Variant、Dynamic 和 JSON 的实验性支持。

#### 使用备注 {#usage-notes}

- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。其他形式的 JSON 数据不被支持。
- 使用子列/路径的查询将返回子列的类型。
- 有关其他使用备注，请参阅主 ClickHouse 文档。

#### 已知限制 {#known-limitations}

- 必须在使用之前在 ClickHouse 设置中启用每种类型。
- “新” JSON 类型从 ClickHouse 24.8 发布开始可用。
- 由于内部格式的变化，`clickhouse-connect` 仅与 ClickHouse 24.7 发布后的 Variant 类型兼容。
- 返回的 JSON 对象仅返回 `max_dynamic_paths` 数量的元素（默认为 1024）。这将在未来的发布中修复。
- 插入到 `Dynamic` 列的内容将始终为 Python 值的字符串表示。此问题将在未来的发布中修复，一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 得到解决。
- 对新类型的实现尚未在 C 代码中优化，因此性能可能比简单、成熟的数据类型要慢一些。
