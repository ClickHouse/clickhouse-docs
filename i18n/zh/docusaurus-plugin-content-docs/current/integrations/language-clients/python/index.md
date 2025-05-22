import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Python与ClickHouse Connect 的集成
## 简介 {#introduction}

ClickHouse Connect 是一个核心数据库驱动程序，提供与广泛的Python应用程序的互操作性。

- 主要接口是 `Client` 对象，位于 `clickhouse_connect.driver` 包中。该核心包
还包含用于与ClickHouse服务器通信的各种辅助类和实用函数，以及用于高级管理插入和选择查询的 "context" 实现。
- `clickhouse_connect.datatypes` 包提供所有非实验性 ClickHouse 数据类型的基本实现和子类。 其主要功能是将 ClickHouse 数据序列化和反序列化为 ClickHouse "Native" 二进制列式格式，用于实现 ClickHouse 和客户端应用程序之间最有效的传输。
- `clickhouse_connect.cdriver` 包中的 Cython/C 类优化了一些最常用的序列化和反序列化，以显著提高纯 Python 的性能。
- 在 `clickhouse_connect.cc_sqlalchemy` 包中有一个有限的 [SQLAlchemy](https://www.sqlalchemy.org/) 方言，该方言建立在 `datatypes` 和 `dbi` 包之上。 该限制实现主要集中在查询/游标功能上，通常不支持 SQLAlchemy DDL 和 ORM 操作（SQLAlchemy 主要针对 OLTP 数据库，我们建议使用更专业的工具和框架来管理 ClickHouse OLAP 定向数据库。）
- 核心驱动程序和 ClickHouse Connect SQLAlchemy 实现是将 ClickHouse 连接到 Apache Superset 的首选方法。 使用 `ClickHouse Connect` 数据库连接或 `clickhousedb` SQLAlchemy 方言连接字符串。

这些文档截至 beta 版本 0.8.2。

:::note
官方 ClickHouse Connect Python 驱动程序使用 HTTP 协议与 ClickHouse 服务器通信。 
它有一些优点（如更好的灵活性、支持 HTTP 负载均衡、与基于 JDBC 的工具的更好兼容性等）和缺点（如稍低的压缩和性能，以及缺乏对某些复杂特性的支持）。
对于某些用例，您可能会考虑使用其中一个使用本地 TCP 协议的 [Community Python 驱动程序](/interfaces/third-party/client-libraries.md)。
:::
### 需求和兼容性 {#requirements-and-compatibility}

|    Python |   |       平台¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |

¹ClickHouse Connect 已在列出的平台上明确测试。此外，为所有由优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目支持的架构构建了未测试的二进制轮（带 C 优化）。
最后，由于 ClickHouse Connect 也可以作为纯 Python 运行，因此源安装应该适用于任何最近的 Python 安装。

²同样，SQLAlchemy 支持主要限于查询功能。 不支持完整的 SQLAlchemy API。

³ClickHouse Connect 已针对所有当前支持的 ClickHouse 版本进行了测试。 由于它使用 HTTP 协议，它也应该对大多数其他版本的 ClickHouse 正常工作，尽管某些高级数据类型可能存在一些不兼容。

### 安装 {#installation}

通过pip 从 PyPI 安装 ClickHouse Connect：

`pip install clickhouse-connect`

ClickHouse Connect 也可以从源安装：
* `git clone` [GitHub 存储库](https://github.com/ClickHouse/clickhouse-connect)。
* （可选）运行 `pip install cython` 构建和启用 C/Cython 优化。
* `cd` 到项目根目录并运行 `pip install .`。

### 支持政策 {#support-policy}

ClickHouse Connect 目前处于测试阶段，当前的 beta 版本是唯一活跃支持的版本。 请在报告任何问题之前更新到最新版本。 问题应提交到 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues)。 将来发布的 ClickHouse Connect 将保证与发布时的活动支持 ClickHouse 版本兼容（通常是最新的三个 `stable` 和两个最新的 `lts` 版本）。

### 基本用法 {#basic-usage}
### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />
#### 建立连接 {#establish-a-connection}

连接到 ClickHouse 有两个示例：
- 连接到本地主机上的 ClickHouse 服务器。
- 连接到 ClickHouse Cloud 服务。

##### 使用 ClickHouse Connect 客户端实例连接到本地主机上的 ClickHouse 服务器：{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

##### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务：{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用之前收集的连接详细信息。 ClickHouse Cloud 服务要求使用 TLS，因此使用端口 8443。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

#### 与数据库交互 {#interact-with-your-database}

要运行 ClickHouse SQL 命令，请使用客户端的 `command` 方法：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据，请使用客户端的 `insert` 方法，带有二维数组的行和值：

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

***注意：*** 由于可能的参数数量，大多数字段建议使用关键字参数对大多数 API 方法进行调用，大部分都是可选的。

*这里未记录的方法不被视为 API 的一部分，可能会被删除或更改。*
### 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client` 类提供了 Python 应用程序与 ClickHouse 数据库服务器之间的主要接口。 使用 `clickhouse_connect.get_client` 函数获取一个 Client 实例，该实例接受以下参数：
#### 连接参数 {#connection-arguments}

| 参数                 | 类型         | 默认值                       | 描述                                                                                                                                                                                                                                 |
|----------------------|--------------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface            | str          | http                          | 必须是 http 或 https。                                                                                                                                                                                                                |
| host                 | str          | localhost                     | ClickHouse 服务器的主机名或 IP 地址。 如果未设置，将使用 `localhost`。                                                                                                                                                             |
| port                 | int          | 8123 或 8443                  | ClickHouse 的 HTTP 或 HTTPS 端口。 如果未设置，默认值为 8123，或者当 *secure*=*True* 或 *interface*=*https* 时为 8443。                                                                                                        |
| username             | str          | default                       | ClickHouse 用户名。 如果未设置，将使用 `default` ClickHouse 用户。                                                                                                                                                                |
| password             | str          | *&lt;空字符串&gt;*        | *username* 的密码。                                                                                                                                                                                                                   |
| database             | str          | *None*                        | 连接的默认数据库。 如果未设置，ClickHouse Connect 将使用 *username* 的默认数据库。                                                                                                                                              |
| secure               | bool         | False                         | 使用 https/TLS。 这将覆盖从接口或端口参数推断得到的值。                                                                                                                                                                        |
| dsn                  | str          | *None*                        | 标准 DSN（数据源名称）格式的字符串。 如果未另行设置，其他连接值（例如主机或用户）将从该字符串中提取。                                                                                                                               |
| compress             | bool 或 str  | True                          | 为 ClickHouse HTTP 插入和查询结果启用压缩。 请参见 [附加选项（压缩）](#compression)                                                                                                                                                   |
| query_limit          | int          | 0（无限制）                   | 任何 `query` 响应要返回的最大行数。 将其设置为零以返回无限行。 请注意，如果结果未进行流式处理，过大的查询限制可能会导致内存不足异常，因为所有结果都会一次性加载到内存中。                                             |
| query_retries        | int          | 2                             | `query` 请求的最大重试次数。 只有 "可重试" 的 HTTP 响应将被重试。 `command` 或 `insert` 请求不会被驱动程序自动重试，以防止意外的重复请求。                                                                                     |
| connect_timeout      | int          | 10                            | HTTP 连接超时时间（以秒计）。                                                                                                                                                                                                        |
| send_receive_timeout  | int          | 300                           | HTTP 连接的发送/接收超时时间（以秒计）。                                                                                                                                                                                             |
| client_name          | str          | *None*                        | 在 HTTP 用户代理头前面加入的 client_name。 将此设置为在 ClickHouse system.query_log 中跟踪客户端查询。                                                                                                                                       |
| pool_mgr             | obj          | *&lt;default PoolManager&gt;* | 要使用的 `urllib3` 库的 PoolManager。 用于需要多个连接池以不同主机进行连接的高级用例。                                                                                                                                                  |
| http_proxy           | str          | *None*                        | HTTP 代理地址（相当于设置 HTTP_PROXY 环境变量）。                                                                                                                                                                                  |
| https_proxy          | str          | *None*                        | HTTPS 代理地址（相当于设置 HTTPS_PROXY 环境变量）。                                                                                                                                                                               |
| apply_server_timezone| bool         | True                          | 使用服务器时区以获取时区感知的查询结果。  请参见 [时区优先级](#time-zones)。                                                                                                                                                           |
#### HTTPS/TLS 参数 {#httpstls-arguments}

| 参数                | 类型  | 默认值 | 描述                                                                                                                                                                                                                                                                              |
|---------------------|-------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify              | bool  | True    | 如果使用 HTTPS/TLS，验证 ClickHouse 服务器的 TLS/SSL 证书（主机名、过期等）。                                                                                                                                                                                                 |
| ca_cert             | str   | *None*  | 如果 *verify*=*True*，用于验证 ClickHouse 服务器证书的证书颁发机构根文件的路径，格式为 .pem。 如果验证为 False，则忽略。 如果 ClickHouse 服务器证书是由操作系统验证的全球受信任根，则不需要此项。                                                                         |
| client_cert         | str   | *None*  | 包含协议的 PEM 格式的 TLS 客户端证书的文件路径（用于双向 TLS 身份验证）。 文件应包含完整的证书链，包括中间证书。                                                                                                                                                     |
| client_cert_key     | str   | *None*  | 客户端证书的私钥文件路径。 如果私钥未包含在客户端证书密钥文件中，则是必需的。                                                                                                                                                                                                |
| server_host_name    | str   | *None*  | 按其 TLS 证书的 CN 或 SNI 识别的 ClickHouse 服务器主机名。 设置此项以避免通过具有不同主机名的代理或隧道连接时发生 SSL 错误。                                                                                                                  |
| tls_mode            | str   | *None*  | 控制高级 TLS 行为。 `proxy` 和 `strict` 不调用 ClickHouse 双向 TLS 连接，但会发送客户端证书和私钥。 `mutual` 假定使用客户端证书进行 ClickHouse 双向 TLS 身份验证。 *None*/默认行为为 `mutual`。                                       |
#### 设置参数 {#settings-argument}

最后，`get_client` 的 `settings` 参数用于向服务器传递每个客户端请求的其他 ClickHouse 设置。 请注意，在大多数情况下，具有 *readonly*=*1* 访问权限的用户无法更改与查询一起发送的设置，因此 ClickHouse Connect 将在最终请求中丢弃这些设置并记录警告。 以下设置仅适用于 ClickHouse Connect 使用的 HTTP 查询/会话，并未作为通用 ClickHouse 设置记录。

| 设置              | 描述                                                                                                                                                                                              |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 服务器在写入 HTTP 通道之前使用的缓冲区大小（以字节为单位）。                                                                                                                                                                         |
| session_id        | 与服务器上相关查询关联的唯一会话 ID。 临时表所必需。                                                                                                                                                                                          |
| compress          | ClickHouse 服务器是否应压缩 POST 响应数据。 该设置只能用于 "raw" 查询。                                                                                                                                                                            |
| decompress        | 发送到 ClickHouse 服务器的数据是否必须解压缩。 该设置应仅用于 "raw" 插入。                                                                                                                                                                          |
| quota_key         | 与此请求相关联的配额密钥。 请参见 ClickHouse 服务器文档中的配额部分。                                                                                                                                                                               |
| session_check     | 用于检查会话状态。                                                                                                                                                                               |
| session_timeout   | 在指定的会话 ID 的 inactivity 之后，超时时间（秒）。 默认值为 60 秒。                                                                                                                                                                             |
| wait_end_of_query | 在 ClickHouse 服务器上缓冲整个响应。 此设置对于返回摘要信息是必需的，并且在非流式查询时自动设置。                                                                                                                                                    |

有关可以与每个查询一起发送的其他 ClickHouse 设置，请参见 [ClickHouse 文档](/operations/settings/settings.md)。
#### 客户端创建示例 {#client-creation-examples}

- 如果没有任何参数，ClickHouse Connect 客户端将连接到 `localhost` 上的默认 HTTP 端口，使用默认用户和没有密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 连接到安全（https）外部 ClickHouse 服务器：

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- 连接带有会话 ID 和其他自定义连接参数以及 ClickHouse 设置：

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

### 常用方法参数 {#common-method-arguments}

多个客户端方法使用一个或两个通用的 `parameters` 和 `settings` 参数。 这些关键字参数如下所述。
#### 参数参数 {#parameters-argument}

ClickHouse Connect 客户端的 `query*` 和 `command` 方法接受一个可选的 `parameters` 关键字参数，用于将 Python 表达式绑定到 ClickHouse 值表达式。 有两种绑定方式可供选择。
##### 服务器端绑定 {#server-side-binding}

ClickHouse 对于大多数查询值支持 [服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)，绑定值作为 HTTP 查询参数单独发送。 ClickHouse Connect 将在检测到以下形式的绑定表达式时添加适当的查询参数 
`{&lt;name&gt;:&lt;datatype&gt;}`。 对于服务器端绑定，`parameters` 参数应该是一个 Python 字典。

- 使用 Python 字典、DateTime 值和字符串值的服务器端绑定：

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# Generates the following query on the server

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要事项** -- 服务器端绑定仅（由 ClickHouse 服务器）支持 `SELECT` 查询。 它不适用于 `ALTER`、`DELETE`、`INSERT` 或其他类型的查询。 此项在未来可能会更改，请参见 https://github.com/ClickHouse/ClickHouse/issues/42092。
##### 客户端绑定 {#client-side-binding}

ClickHouse Connect 还支持客户端参数绑定，这可以在生成模板化的 SQL 查询中提供更多灵活性。 对于客户端绑定，`parameters` 参数应为字典或序列。 客户端绑定使用 Python ["printf" 风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 字符串格式化进行参数替换。

请注意，与服务器端绑定不同，客户端绑定不适用于数据库标识符，如数据库、表或列名，因为 Python 风格格式化无法区分不同类型的字符串，并且它们需要采用不同的格式（数据库标识符使用反引号或双引号，数据值使用单引号）。

- 使用 Python 字典、DateTime 值和字符串转义的示例：

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# Generates the following query:

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- 使用 Python 序列（元组）、Float64 和 IPv4Address 的示例：

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
  - 如果使用参数值的字典，则在参数名称后附加字符串 `_64`。
```python
query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server side binding with dictionary

parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
#### 设置参数 {#settings-argument-1}

所有关键 ClickHouse Connect 客户端的 "insert" 和 "select" 方法都接受一个可选的 `settings` 关键字参数，用于传递 ClickHouse 服务器的 [用户设置](/operations/settings/settings.md)，用于包含的 SQL 语句。 `settings` 参数应该是一个字典。 每个项应该是一个 ClickHouse 设置名称及其关联值。 请注意，在发送到服务器作为查询参数时，值将转换为字符串。

与客户端级设置一样，ClickHouse Connect 将丢弃服务器标记为 *readonly*=*1* 的任何设置，并附带相关的日志消息。 仅适用于通过 ClickHouse HTTP 接口的查询的设置始终有效。 这些设置在 `get_client` [API](#settings-argument) 下描述。

使用 ClickHouse 设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```

### 客户端 _command_ 方法 {#client-_command_-method}

使用 `Client.command` 方法向 ClickHouse 服务器发送 SQL 查询，这些查询通常不返回数据或返回单个原始值或数组值而不是完整的数据集。 此方法采用以下参数：

| 参数            | 类型              | 默认值    | 描述                                                                                                                                                  |
|-----------------|------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd              | str              | *必需*     | 一个 ClickHouse SQL 语句，返回单个值或单行值。                                                                                                      |                                                                                                                                                                                                                                                                                    |
| parameters       | dict 或 iterable | *无*       | 参见 [参数描述](#parameters-argument)。                                                                                                           |
| data             | str 或 bytes     | *无*       | 要与命令一起包含的可选数据，作为 POST 主体。                                                                                                       |
| settings         | dict             | *无*       | 参见 [设置描述](#settings-argument)。                                                                                                             |
| use_database     | bool             | True       | 使用客户端数据库（在创建客户端时指定）。 False 表示该命令将使用连接用户的默认 ClickHouse 服务器数据库。 |
| external_data    | ExternalData     | *无*       | 一个 ExternalData 对象，包含文件或二进制数据以用于查询。请参见 [高级查询（外部数据）](#external-data)                                               |

- _command_ 可用于 DDL 语句。 如果 SQL "command" 不返回数据，将返回 "查询摘要" 字典。 该字典封装了 ClickHouse 的 X-ClickHouse-Summary 和 X-ClickHouse-Query-Id 头，包括键/值对 `written_rows`、`written_bytes` 和 `query_id`。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_ 也可用于仅返回单行的简单查询：

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```

### 客户端 _query_ 方法 {#client-_query_-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个 "批量" 数据集的主要方式。 它通过 HTTP 利用原生 ClickHouse 格式高效传输大型数据集（最多大约一百万行）。 此方法接受以下参数。

| 参数               | 类型              | 默认值    | 描述                                                                                                                                                                         |
|---------------------|------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必需*     | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                       |
| parameters          | dict 或 iterable | *无*       | 参见 [参数描述](#parameters-argument)。                                                                                                                                      |
| settings            | dict             | *无*       | 参见 [设置描述](#settings-argument)。                                                                                                                                         |
| query_formats       | dict             | *无*       | 用于结果值的数据类型格式规格。 请参见高级用法（读取格式）。                                                                                                                                 |
| column_formats      | dict             | *无*       | 每列的数据类型格式。 请参见高级用法（读取格式）。                                                                                                                                   |
| encoding            | str              | *无*       | 用于将 ClickHouse 字符串列编码为 Python 字符串的编码。 如果未设置，Python 默认使用 `UTF-8`。                                                                                  |
| use_none            | bool             | True       | 对于 ClickHouse 空值使用 Python *None* 类型。 如果 False，则对 ClickHouse 空值使用数据类型默认值（如 0）。 注意：由于性能原因，对于 NumPy/Pandas 默认值为 False。                                |
| column_oriented     | bool             | False      | 将结果作为列的序列返回，而不是行的序列。 有助于将 Python 数据转换为其他列式数据格式。                                                                                             |
| query_tz            | str              | *无*       | `zoneinfo` 数据库中的时区名称。 该时区将应用于查询返回的所有 datetime 或 Pandas 时间戳对象。                                                                                         |
| column_tzs          | dict             | *无*       | 列名称到时区名称的字典。 像 `query_tz`，但允许为不同列指定不同的时区。                                                                                                           |
| use_extended_dtypes  | bool             | True       | 对 ClickHouse NULL 值使用 Pandas 扩展数据类型（如 StringArray），以及 pandas.NA 和 pandas.NaT。 仅适用于 `query_df` 和 `query_df_stream` 方法。                                       |
| external_data       | ExternalData     | *无*       | 一个 ExternalData 对象，包含文件或二进制数据的查询。 请参见 [高级查询（外部数据）](#external-data)                                                                              |
| context             | QueryContext     | *无*       | 可重用的 QueryContext 对象可用于封装上述方法参数。 请参见 [高级查询（QueryContexts）](#querycontexts)。                                                                              |
#### The QueryResult Object {#the-queryresult-object}

基础 `query` 方法返回一个 QueryResult 对象，具有以下公共属性：

- `result_rows` -- 以行的序列形式返回的数据矩阵，每行元素是一个列值的序列。
- `result_columns` -- 以列的序列形式返回的数据矩阵，每列元素是该列的行值序列。
- `column_names` -- 表示 `result_set` 中列名的字符串元组。
- `column_types` -- 表示 `result_columns` 中每列的 ClickHouse 数据类型的 ClickHouseType 实例元组。
- `query_id` -- ClickHouse query_id（用于检查 `system.query_log` 表中的查询）。
- `summary` -- 由 `X-ClickHouse-Summary` HTTP 响应头返回的任何数据。
- `first_item` -- 便捷属性，用于将响应的第一行作为字典检索（键是列名）。
- `first_row` -- 便捷属性以返回结果的第一行。
- `column_block_stream` -- 以列格式的查询结果生成器。此属性不应被直接引用（见下文）。
- `row_block_stream` -- 以行格式的查询结果生成器。此属性不应被直接引用（见下文）。
- `rows_stream` -- 以每次调用返回单行的查询结果生成器。此属性不应被直接引用（见下文）。
- `summary` -- 如 `command` 方法下所述，ClickHouse 返回的摘要信息字典。

`*_stream` 属性返回一个 Python 上下文，可以用作返回数据的迭代器。它们应该仅通过客户端的 `*_stream` 方法间接访问。

有关流式查询结果的完整细节（使用 StreamContext 对象），请参阅 [Advanced Queries (Streaming Queries)](#streaming-queries)。

### Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

主 `query` 方法有三个专用版本：

- `query_np` -- 此版本返回一个 NumPy 数组，而不是 ClickHouse 连接 QueryResult。
- `query_df` -- 此版本返回一个 Pandas DataFrame，而不是 ClickHouse 连接 QueryResult。
- `query_arrow` -- 此版本返回一个 PyArrow 表。它直接使用 ClickHouse 的 `Arrow` 格式，因此仅接受与主 `query` 方法共有的三个参数： `query`、`parameters` 和 `settings`。此外，还有一个额外的参数 `use_strings`，用于确定 Arrow 表是否将 ClickHouse 字符串类型呈现为字符串（如果为 True）或字节（如果为 False）。

### Client Streaming Query Methods {#client-streaming-query-methods}

ClickHouse 连接客户端提供多种方法以流式方式检索数据（实现为 Python 生成器）：

- `query_column_block_stream` -- 以原生 Python 对象的列序列块形式返回查询数据。
- `query_row_block_stream` -- 以原生 Python 对象的行块形式返回查询数据。
- `query_rows_stream` -- 以原生 Python 对象的行序列形式返回查询数据。
- `query_np_stream` -- 将每个 ClickHouse 查询数据块返回为 NumPy 数组。
- `query_df_stream` -- 将每个 ClickHouse 查询数据块返回为 Pandas DataFrame。
- `query_arrow_stream` -- 以 PyArrow RecordBlocks 的形式返回查询数据。

这些方法中的每一个返回一个 `ContextStream` 对象，必须通过 `with` 语句打开以开始消费流。请参阅 [Advanced Queries (Streaming Queries)](#streaming-queries) 获取详细信息和示例。

### Client _insert_ Method {#client-_insert_-method}

对于向 ClickHouse 插入多个记录的常见用例，提供 `Client.insert` 方法。它接受以下参数：

| 参数             | 类型                               | 默认值      | 描述                                                                                                                                                                                      |
|-------------------|-----------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *必填*     | 要插入的 ClickHouse 表。允许使用完整表名（包括数据库）。                                                                                                                                 |
| data              | Sequence of Sequences             | *必填*     | 要插入的数据矩阵，可以是行的序列（每一行为一列值序列），或者是列的序列（每一列为一个行值序列）。                                                                                           |
| column_names      | Sequence of str, or str           | '*'        | 数据矩阵的列名列表。如果使用 '*'，则 ClickHouse 连接将执行 “预查询” 以检索表的所有列名。                                                                                                     |
| database          | str                               | ''         | 插入的目标数据库。如果未指定，则假定为客户端的数据库。                                                                                                                                     |
| column_types      | Sequence of ClickHouseType        | *无*       | ClickHouseType 实例列表。如果未指定 column_types 或 column_type_names，ClickHouse 连接将执行 “预查询” 以检索表的所有列类型。                                                          |
| column_type_names | Sequence of ClickHouse type names | *无*       | ClickHouse 数据类型名称列表。如果未指定 column_types 或 column_type_names，ClickHouse 连接将执行 “预查询” 以检索表的所有列类型。                                                    |
| column_oriented   | bool                              | False      | 如果为 True，则 `data` 参数假定为列的序列（数据将不需要 “透视” 插入）。否则，`data` 被解释为行的序列。                                                                                |
| settings          | dict                              | *无*       | 请参阅 [settings description](#settings-argument)。                                                                                                                                       |
| insert_context    | InsertContext                     | *无*       | 可以使用可重用的 InsertContext 对象来封装上述方法参数。请参阅 [Advanced Inserts (InsertContexts)](#insertcontexts)。                                                                        |

此方法返回一个 "查询摘要" 字典，如 "command" 方法下所描述。如果插入因任何原因失败，将引发异常。

主 `insert` 方法有两个专用版本：

- `insert_df` -- 此方法的第二个参数要求传入一个 Pandas DataFrame 实例，而不是 Python Sequence of Sequences 的 `data` 参数。ClickHouse 连接会自动将 DataFrame 处理为列式数据源，因此不需要或不提供 `column_oriented` 参数。
- `insert_arrow` -- 此方法要求传入 `arrow_table`，而不是 Python Sequence of Sequences 的 `data` 参数。ClickHouse 连接会将 Arrow 表原样传递给 ClickHouse 服务器进行处理，因此除了 `table` 和 `arrow_table` 外，仅提供 `database` 和 `settings` 参数。

*注意:* NumPy 数组是有效的序列序列，可以作为主 `insert` 方法的 `data` 参数使用，因此不需要专用方法。

### File Inserts {#file-inserts}

`clickhouse_connect.driver.tools` 包含 `insert_file` 方法，允许直接从文件系统将数据插入现有的 ClickHouse 表。解析委托给 ClickHouse 服务器。`insert_file` 接受以下参数：

| 参数           | 类型            | 默认值       | 描述                                                                                                                                                                                  |
|-----------------|----------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| client          | Client         | *必填*       | 用于执行插入的 `driver.Client`。                                                                                                                                                    |
| table           | str            | *必填*       | 要插入的 ClickHouse 表。允许使用完整表名（包括数据库）。                                                                                                                               |
| file_path       | str            | *必填*       | 数据文件的本地文件系统路径。                                                                                                                                                        |
| fmt             | str            | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，则假定为 CSVWithNames。                                                                                                      |
| column_names    | Sequence of str| *无*         | 数据文件中列名的列表。对于包含列名的格式，不需要此项。                                                                                                                             |
| database        | str            | *无*         | 表的数据库。如果表名是完全合格的，则该项会被忽略。如果未指定，则插入将使用客户端数据库。                                                                                            |
| settings        | dict           | *无*         | 请参阅 [settings description](#settings-argument)。                                                                                                                                 |
| compression     | str            | *无*         | クリックハウスのContent-Encoding HTTPヘッダーに使用される認識された ClickHouse 圧縮タイプ（zstd、lz4、gzip）。                                                              |

对于数据不一致或日期/时间值格式不寻常的文件，本方法将识别适用于数据导入的设置（如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
### Saving query results as files {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法直接将文件从 ClickHouse 流式传输到本地文件系统。例如，如果您想将查询的结果保存到 CSV 文件，您可以使用以下代码片段：

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

上面的代码生成的 `output.csv` 文件内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

类似地，您可以以 [TabSeparated](/interfaces/formats#tabseparated) 和其他格式保存数据。有关所有可用格式选项的概述，请参见 [Formats for Input and Output Data](/interfaces/formats)。

### Raw API {#raw-api}

对于不需要在 ClickHouse 数据和原生或第三方数据类型和结构之间进行转换的用例，ClickHouse 连接客户端提供了两个直接使用 ClickHouse 连接的方法。

#### Client _raw_query_ Method {#client-_raw_query_-method}

`Client.raw_query` 方法允许使用客户端连接直接使用 ClickHouse HTTP 查询接口。返回值是未处理的 `bytes` 对象。它提供了一个方便的包装器，具有参数绑定、错误处理、重试和设置管理，可以使用最小的接口：

| 参数          | 类型             | 默认值      | 描述                                                                                                                                                                                       |
|---------------|------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *必填*     | 任何有效的 ClickHouse 查询。                                                                                                                                                              |
| parameters    | dict or iterable  | *无*       | 请参阅 [parameters description](#parameters-argument)。                                                                                                                                  |
| settings      | dict             | *无*       | 请参阅 [settings description](#settings-argument)。                                                                                                                                    |
| fmt           | str              | *无*       | ClickHouse 输出格式，返回的字节。(如果未指定，ClickHouse 将使用 TSV)。                                                                                                                 |
| use_database  | bool             | True       | 为查询上下文使用分配给 ClickHouse 连接客户端的数据库。                                                                                                                            |
| external_data | ExternalData     | *无*       | 包含要与查询一起使用的文件或二进制数据的 ExternalData 对象。请参阅 [Advanced Queries (External Data)](#external-data)。                                                              |

处理结果 `bytes` 对象的责任在于调用者。注意，`Client.query_arrow` 只是一个使用 ClickHouse `Arrow` 输出格式的薄包装器。

#### Client _raw_stream_ Method {#client-_raw_stream_-method}

`Client.raw_stream` 方法具有与 `raw_query` 方法相同的 API，但返回一个可以用作 `bytes` 对象的生成器/流源的 `io.IOBase` 对象。它当前被 `query_arrow_stream` 方法使用。

#### Client _raw_insert_ Method {#client-_raw_insert_-method}

`Client.raw_insert` 方法允许使用客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于它不对插入负载进行处理，其性能非常高。该方法提供了选择设置和插入格式的选项：

| 参数            | 类型                                   | 默认值      | 描述                                                                                                                                                                                    |
|-----------------|----------------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table           | str                                    | *必填*     | 简单或数据库合格的表名。                                                                                                                                                                |
| column_names    | Sequence[str]                          | *无*       | 插入块的列名。如果 `fmt` 参数未包含名称，则该项为必填项。                                                                                                                             |
| insert_block    | str, bytes, Generator[bytes], BinaryIO | *必填*     | 要插入的数据。字符串将使用客户端编码进行编码。                                                                                                                                         |
| settings        | dict                                   | *无*       | 请参阅 [settings description](#settings-argument)。                                                                                                                                    |
| fmt             | str                                    | *无*       | 插入块字节的 ClickHouse 输入格式。（如果未指定，ClickHouse 将使用 TSV）。                                                                                                               |

确保 `insert_block` 采用指定格式并使用指定的压缩方法是调用者的责任。ClickHouse 连接使用这些原始插入进行文件上传和 PyArrow 表，将解析委托给 ClickHouse 服务器。

### Utility Classes and Functions {#utility-classes-and-functions}

以下类和函数也被视为 "公共" `clickhouse-connect` API 的一部分，并且与上述文档中的类和方法一样，在次要版本中是稳定的。对这些类和函数的破坏性更改只会在次要（而不是修补）版本中发生，并将在至少一个次要版本中以弃用状态提供。

#### Exceptions {#exceptions}

所有自定义异常（包括在 DB API 2.0 规范中定义的那些）都在 `clickhouse_connect.driver.exceptions` 模块中定义。驱动程序实际检测到的异常将使用这些类型之一。

#### Clickhouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。类似地，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。

### Multithreaded, Multiprocess, and Async/Event Driven Use Cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse 连接在多线程、多进程和事件循环驱动/异步应用程序中运行良好。所有查询和插入处理都在单个线程内进行，因此操作通常是线程安全的。（平行处理某些操作的低级别可能是未来加强的方法，以克服单线程的性能损失，但即使在那种情况下，线程安全性也将得到维护）。

因为每个查询或插入执行各自在其自己的 QueryContext 或 InsertContext 对象中维护状态，因此这些辅助对象不是线程安全的，且不应在多个处理流之间共享。有关上下文对象的附加讨论，请参见以下各节。

此外，在有两个或多个查询和/或插入同时进行的应用程序中，有两个进一步的考虑因素需要牢记。第一个是与查询/插入相关的 ClickHouse "会话"，第二个是 ClickHouse 连接客户端实例使用的 HTTP 连接池。

### AsyncClient wrapper {#asyncclient-wrapper}

自 0.7.16 以来，ClickHouse 连接提供了一个常规 `Client` 的异步包装器，以便可以在 `asyncio` 环境中使用该客户端。

要获取 `AsyncClient` 的实例，可以使用 `get_async_client` 工厂函数，该函数接受与标准 `get_client` 相同的参数：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` 具有与标准 `Client` 相同的方法和参数，但在适用的情况下它们是协程。内部，执行 I/O 操作的 `Client` 方法被包装在 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

使用 `AsyncClient` 包装器时，多线程性能将提高，因为在等待 I/O 操作完成时将释放执行线程和 GIL。

注意：与常规 `Client` 不同，`AsyncClient` 默认强制 `autogenerate_session_id` 为 `False`。

另见：[run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。

### Managing ClickHouse Session Ids {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都在 ClickHouse "会话" 的上下文中发生。目前会话用于两个目的：
- 将特定的 ClickHouse 设置与多个查询相关联（请参见 [user settings](/operations/settings/settings.md)）。 ClickHouse `SET` 命令用于更改用户会话范围内的设置。
- 跟踪 [temporary tables.](/sql-reference/statements/create/table#temporary-tables)

默认情况下，通过 ClickHouse 连接客户端执行的每个查询都使用相同的会话 id，以启用此会话功能。也就是说，`SET` 语句和临时表按预期工作。但是，设计上 ClickHouse 服务器不允许在同一会话内并发查询。因此，ClickHouse 连接应用程序在执行并发查询时有两个选项。

- 为每个执行线程（线程、进程或事件处理程序）创建一个独立的 `Client` 实例，该实例将拥有自己的会话 id。这通常是最佳方法，因为它保存了每个客户端的会话状态。
- 为每个查询使用唯一的会话 id。在不需要临时表或共享会话设置的情况下，这可以避免并发会话问题。（共享设置也可以在创建客户端时提供，但这些是在每个请求中发送的，而不是与会话关联）。唯一的 session_id 可以添加到每个请求的 `settings` 字典中，或者您可以禁用 `autogenerate_session_id` 公共设置：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

在这种情况下 ClickHouse 连接将不会发送任何会话 id，将由 ClickHouse 服务器生成随机会话 id。再说一遍，临时表和会话级设置将不可用。

### Customizing the HTTP Connection Pool {#customizing-the-http-connection-pool}

ClickHouse 连接使用 `urllib3` 连接池来处理与服务器之间的底层 HTTP 连接。默认情况下，所有客户端实例共享相同的连接池，这对大多数用例来说是足够的。此默认池保持最高 8 个 HTTP Keep Alive 连接到应用程序使用的每个 ClickHouse 服务器。

对于大型多线程应用程序，单独的连接池可能更合适。采用 `pool_mgr` 关键字参数的自定义连接池可以提供给主 `clickhouse_connect.get_client` 函数：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上述示例所示，客户端可以共享一个池管理器，或者可以为每个客户端创建一个单独的池管理器。有关创建 PoolManager 时可用选项的详细信息，请参见 [`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。

## Querying Data with ClickHouse Connect: Advanced Usage {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse 连接在 QueryContext 中执行标准查询。QueryContext 包含用于针对 ClickHouse 数据库构建查询的关键结构以及用于将结果处理为 QueryResult 或其他响应数据结构的配置。这包括查询本身、参数、设置、读取格式和其他属性。

可以使用客户端 `create_query_context` 方法获取 QueryContext。此方法接受与核心查询方法相同的参数。然后，此查询上下文可以作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，而不是这些方法的任何或所有其他参数。请注意，方法调用中指定的其他参数将覆盖 QueryContext 的任何属性。

QueryContext 的最清晰用例是使用不同的绑定参数值发送相同的查询。所有参数值可以通过调用 `QueryContext.set_parameters` 方法并传入一个字典来更新，或者通过调用 `QueryContext.set_parameter` 方法和所需的 `key`、`value` 对。

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

注意，QueryContexts 不是线程安全的，但可以通过调用 `QueryContext.updated_copy` 方法在多线程环境中获得副本。

### Streaming Queries {#streaming-queries}

#### Data Blocks {#data-blocks}

ClickHouse 连接将所有来自主 `query` 方法的数据处理为从 ClickHouse 服务器接收的块流。这些块以自定义的 "Native" 格式从 ClickHouse 传输到。这些块是二进制数据的列序列，其中每列包含相同数量的指定数据类型的数据值（作为列式数据库，ClickHouse 以类似的形式存储此数据）。从查询返回的块大小由两个用户设置控制，这些设置可以在多个级别（用户配置文件、用户、会话或查询）中设置。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 块的行数大小限制。默认值 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 块的字节大小的软限制。默认值 1,000,0000。

无论 `preferred_block_size_setting` 如何，每个块的行数不会超过 `max_block_size`。根据查询类型，实际返回的块大小可以是任何大小。例如，覆盖多个分片的分布式表的查询可能包含从每个分片直接检索到的更小块。

使用客户端的 `query_*_stream` 方法时，结果按块一块地返回。ClickHouse 连接仅加载一个块。这允许处理大量数据而无需将大型结果集完全加载到内存中。请注意，应用程序应该准备处理任意数量的块，并且每个块的确切大小无法控制。

#### HTTP Data Buffer for Slow Processing {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果块以显著慢于 ClickHouse 服务器流式传输数据的速率处理，ClickHouse 服务器将关闭连接，导致处理线程中引发异常。某些问题可以通过使用常用的 `http_buffer_size` 设置增加 HTTP 流式缓冲区的缓冲区大小（默认 10 兆字节）来缓解。如果在这种情况下可用内存充足，则较大的 `http_buffer_size` 值应该没问题。如果使用 `lz4` 或 `zstd` 压缩，则缓冲区中的数据将被压缩存储，因此使用这些压缩类型将增加可用总缓冲区。

#### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（如 `query_row_block_stream`）返回一个 ClickHouse `StreamContext` 对象，该对象是一个组合的 Python 上下文/生成器。这是基本用法：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

注意，尝试在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文确保流（在这种情况下是流式 HTTP 响应）将在未消耗所有数据和/或在处理期间引发异常时被正确关闭。此外，StreamContexts 只能使用一次来消耗流。在 StreamContext 退出后尝试使用将产生 `StreamClosedError`。

您可以使用 StreamContext 的 `source` 属性访问父 `QueryResult` 对象，该对象包括列名和类型。

#### Stream Types {#stream-types}

`query_column_block_stream` 方法以原生 Python 数据类型存储的列数据序列返回块。使用上述 `taxi_trips` 查询，返回的数据将是一个列表，其中每个列表元素是另一个列表（或元组），其中包含所有与相关列相关的数据。因此，`block[0]` 将是一个仅包含字符串的元组。列式格式主要用于对列中所有值进行聚合操作，例如累加总费用。

`query_row_block_stream` 方法将块作为一系列行返回，类似于传统关系型数据库。对于出租车行程，返回的数据将是一个列表，其中每个列表元素是表示一行数据的另一个列表。因此，`block[0]` 将包含第一个出租车行程的所有字段（按顺序），而 `block[1]` 将包含第二个出租车行程的所有字段的行，依此类推。行式结果通常用于显示或转换过程。

`query_row_stream` 是一个便捷方法，在迭代流时会自动移动到下一个块。否则，它与 `query_row_block_stream` 相同。

`query_np_stream` 方法将每个块返回为二维 NumPy 数组。内部上，NumPy 数组（通常）以列式存储，因此不需要单独的行或列方法。NumPy 数组的 “形状” 将表示为（列，行）。NumPy 库提供了许多操作 NumPy 数组的方法。请注意，如果查询中所有列共享相同的 NumPy 数据类型，返回的 NumPy 数组也将只有一种数据类型，并且可以在不实际改变其内部结构的情况下进行重塑/旋转。

`query_df_stream` 方法将每个 ClickHouse 块返回为二维 Pandas DataFrame。以下是一个示例，显示 StreamContext 对象可以以延迟方式（但只能使用一次）用作上下文。

最后，`query_arrow_stream` 方法返回 ClickHouse `ArrowStream` 格式的结果，作为一个 pyarrow.ipc.RecordBatchStreamReader，封装在 StreamContext 中。流的每次迭代返回 PyArrow RecordBlock。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

### Read Formats {#read-formats}

读取格式控制从客户端 `query`、`query_np` 和 `query_df` 方法返回的值的数据类型。（`raw_query` 和 `query_arrow` 不会修改来自 ClickHouse 的输入数据，因此格式控制不适用。）例如，如果对 UUID 的读取格式从默认的 `native` 格式更改为替代的 `string` 格式，则 ClickHouse 对 UUID 列的查询将作为字符串值返回（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的数据类型参数可以包含通配符。格式是一个单一的小写字符串。

读取格式可以在多个级别设置：

- 全局使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询配置的数据类型的格式。
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- 对于整个查询，使用可选的 `query_formats` 字典参数。在这种情况下，任何指定数据类型的列（或子列）将使用配置的格式。
```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 对于特定列中的值，使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，以及数据列的格式或一种 ClickHouse 类型名称和查询格式值的二级 "格式" 字典。这种次级字典可用于嵌套列类型，例如元组或映射。
```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 读取格式选项 (Python 类型) {#read-format-options-python-types}

| ClickHouse 类型       | 原生 Python 类型    | 读取格式 | 注释                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Superset 目前不支持较大的无符号 UInt64 值                                                   |
| [U]Int[128,256]       | int                   | string       | Pandas 和 NumPy 的 int 值最多为 64 位，因此这些值可以作为字符串返回                              |
| Float32               | float                 | -            | 所有 Python 浮点数在内部都是 64 位                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouse String 列没有固有编码，因此也用于变长二进制数据        |
| FixedString           | bytes                 | string       | FixedStrings 是固定大小的字节数组，但有时被视为 Python 字符串                              |
| Enum[8,16]            | string                | string, int  | Python 枚举不接受空字符串，因此所有枚举都呈现为字符串或底层整型值。 |
| Date                  | datetime.date         | int          | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。 该值以整型形式可用                              |
| Date32                | datetime.date         | int          | 与 Date 相同，但适用于更广泛的日期范围                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouse 以纪元秒存储 DateTime。 该值以整型形式可用                                   |
| DateTime64            | datetime.datetime     | int          | Python datetime.datetime 的精度限制为微秒。原始 64 位整型值可用               |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP 地址可以作为字符串读取，并且格式正确的字符串可以插入为 IP 地址                |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP 地址可以作为字符串读取，并且格式正确的可以插入为 IP 地址                        |
| Tuple                 | dict or tuple         | tuple, json  | 命名元组默认为字典返回。命名元组也可以作为 JSON 字符串返回              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUID 可以作为按照 RFC 4122 格式化的字符串读取<br/>                                                       |
| JSON                  | dict                  | string       | 默认返回一个 Python 字典。 `string` 格式将返回一个 JSON 字符串                        |
| Variant               | object                | -            | 返回存储该值的 ClickHouse 数据类型对应的 Python 类型                                 |
| Dynamic               | object                | -            | 返回存储该值的 ClickHouse 数据类型对应的 Python 类型                                 |
### 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。该二进制数据与查询字符串一起发送，用于处理数据。 外部数据功能的详细信息在 [这里](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数以利用此功能。 `external_data` 参数的值应为 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数：

| 名称       | 类型              | 描述                                                                                                                                     |
|------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| file_path  | str               | 本地系统路径中读取外部数据的文件路径。需要提供 `file_path` 或 `data` 中的一个                              | 
| file_name  | str               | 外部数据“文件”的名称。如果未提供，将从 `file_path`（去掉扩展名）中确定                            |
| data       | bytes             | 以二进制形式提供的外部数据（而不是从文件中读取）。需要提供 `data` 或 `file_path` 中的一个                                 |
| fmt        | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认值为 `TSV`                                               |
| types      | str or seq of str | 外部数据中列数据类型的列表。如果是字符串，类型应以逗号分隔。需要提供 `types` 或 `structure` 中的一个 |
| structure  | str or seq of str | 数据中列名称 + 数据类型的列表（见示例）。需要提供 `structure` 或 `types` 中的一个                                        |
| mime_type  | str               | 文件数据的可选 MIME 类型。当前 ClickHouse 会忽略此 HTTP 子头                                                          |


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

可以使用 `add_file` 方法将其他外部数据文件添加到初始 ExternalData 对象，该方法接受与构造函数相同的参数。对于 HTTP，所有外部数据都作为 `multi-part/form-data` 文件上传的一部分传输。
### 时区 {#time-zones}
有多种机制将时区应用于 ClickHouse 的 DateTime 和 DateTime64 值。内部，ClickHouse 服务器始终将任何 DateTime 或 DateTime64 对象存储为表示自纪元以来的秒数的无时区数字，纪元为 1970 年 01 月 01 日 00:00:00 UTC 时间。对于 DateTime64 值，表示可以是自纪元以来的毫秒、微秒或纳秒，具体取决于精度。因此，任何时区信息的应用始终发生在客户端。请注意，这涉及到有意义的额外计算，因此在性能关键的应用程序中，建议将 DateTime 类型视为纪元时间戳，除非用于用户显示和转换（例如，Pandas Timestamps 始终是一个 64 位整数，表示纪元纳秒以提高性能）。

在查询中使用时区感知数据类型时——特别是 Python 的 `datetime.datetime` 对象——`clickhouse-connect` 使用以下优先级规则应用客户端时区：

1. 如果查询方法参数 `client_tzs` 为查询指定了，应用特定列的时区。
2. 如果 ClickHouse 列具有时区元数据（即，它是一个像 DateTime64(3, 'America/Denver') 的类型），则应用 ClickHouse 列的时区。 （请注意，此时区元数据不适用于 ClickHouse 版本 23.2 之前的 DateTime 列）
3. 如果查询方法参数 `query_tz` 为查询指定了，应用“查询时区”。
4. 如果为查询或会话应用了时区设置，则应用该时区。 （此功能尚未在 ClickHouse 服务器中发布）
5. 最后，如果客户端的 `apply_server_timezone` 参数设置为 True（默认），则应用 ClickHouse 服务器时区。

请注意，如果基于这些规则应用的时区是 UTC，`clickhouse-connect` 将 _始终_ 返回一个无时区的 Python `datetime.datetime` 对象。如果应用程序代码希望，随后可以将更多时区信息添加到此无时区对象中。
## 使用 ClickHouse Connect 插入数据：高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect 在 InsertContext 中执行所有插入。 InsertContext 包含发送到客户端 `insert` 方法的所有值作为参数。 此外，当最初构造 InsertContext 时，ClickHouse Connect 会获取插入列所需的数据类型，以便高效的原生格式插入。通过重用 InsertContext 进行多次插入，可以避免该“预查询”，并更快速有效地执行插入。

可以使用客户端的 `create_insert_context` 方法获取 InsertContext。该方法的参数与 `insert` 函数相同。请注意，InsertContext 的仅 `data` 属性应在重用时进行修改。这与其旨在为同一表的重复插入新数据提供可重用对象的目的相一致。

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
当前为有限数量的类型实现了写入格式。在大多数情况下，ClickHouse Connect 将尝试通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。例如，如果要插入到 DateTime 列，并且该列的第一个插入值是 Python 整型，ClickHouse Connect 将直接插入该整型值，假设它实际上是一个纪元秒。

在大多数情况下，覆盖数据类型的写入格式是不必要的，但可以在 `clickhouse_connect.datatypes.format` 包中使用相关方法在全局级别执行此操作。
#### 写入格式选项 {#write-format-options}

| ClickHouse 类型       | 原生 Python 类型    | 写入格式 | 注释                                                                                                    |
|-----------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                             |
| UInt64                | int                   |               |                                                                                                             |
| [U]Int[128,256]       | int                   |               |                                                                                                             |
| Float32               | float                 |               |                                                                                                             |
| Float64               | float                 |               |                                                                                                             |
| Decimal               | decimal.Decimal       |               |                                                                                                             |
| String                | string                |               |                                                                                                             |
| FixedString           | bytes                 | string        | 如果作为字符串插入，则额外字节将被设置为零                                              |
| Enum[8,16]            | string                |               |                                                                                                             |
| Date                  | datetime.date         | int           | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。整型类型将被假定为该“纪元日期”值  |
| Date32                | datetime.date         | int           | 与 Date 相同，但适用于更广泛的日期                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouse 以纪元秒存储 DateTime。整型类型将被假定为该“纪元秒”值     |
| DateTime64            | datetime.datetime     | int           | Python datetime.datetime 限制在微秒精度。原始 64 位整型值可用         |
| IPv4                  | `ipaddress.IPv4Address` | string        | 格式正确的字符串可以作为 IPv4 地址插入                                                |
| IPv6                  | `ipaddress.IPv6Address` | string        | 格式正确的字符串可以作为 IPv6 地址插入                                                |
| Tuple                 | dict or tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | 格式正确的字符串可以作为 ClickHouse UUID 插入                                              |
| JSON/Object('json')   | dict                  | string        | 可以将字典或 JSON 字符串插入 JSON 列中（注意 `Object('json')` 已被弃用） |
| Variant               | object                |               | 目前所有变型都作为字符串插入，由 ClickHouse 服务器解析                    |
| Dynamic               | object                |               | 警告 -- 目前对 Dynamic 列的任何插入都被保持为 ClickHouse 字符串              |
## 附加选项 {#additional-options}

ClickHouse Connect 为高级用例提供了许多附加选项
### 全局设置 {#global-settings}

有少量设置在全局范围内控制 ClickHouse Connect 的行为。它们通过顶层 `common` 包访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
这些常见设置 `autogenerate_session_id`、`product_name` 和 `readonly` 应始终在使用 `clickhouse_connect.get_client` 方法创建客户端之前进行修改。创建客户端后更改这些设置不会影响现有客户端的行为。
:::

目前定义了十个全局设置：

| 设置名称               | 默认值   | 选项                     | 描述                                                                                                                                                                                                                                                   |
|-----------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 为每个客户端会话自动生成一个新的 UUID(1) 会话 ID（如果未提供）。如果未提供会话 ID（无论在客户端还是查询级别），ClickHouse 将为每个查询生成随机的内部 ID                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 提供无效或只读设置时要采取的操作（无论是针对客户端会话还是查询）。如果 `drop`，该设置将被忽略；如果 `send`，该设置将被发送到 ClickHouse；如果 `error`，将引发客户端的 ProgrammingError |
| dict_parameter_format   | 'json'  | 'json', 'map'           | 这控制参数化查询是否将 Python 字典转换为 JSON 或 ClickHouse Map 语法。对于插入 JSON 列应使用 `json`，对于 ClickHouse Map 列应使用 `map`                                                               |
| product_name            |         |                         | 传递给 ClickHouse 的查询中用于跟踪使用 ClickHouse Connect 的应用的字符串。应采用形式 &lt;product name;&gl/&lt;product version&gt;                                                                                       |
| max_connection_age      | 600     |                         | HTTP Keep Alive 连接将保持打开/重用的最大秒数。这防止对单个 ClickHouse 节点的连接聚集在负载均衡器/代理后面。默认值为 10 分钟。                                                   |
| readonly                | 0       | 0, 1                    | 对于 19.17 版本之前的隐含“只读” ClickHouse 设置。可以设置为与 ClickHouse “read_only” 值匹配，以允许与非常旧的 ClickHouse 版本一起操作                                                                  |
| use_protocol_version    | True    | True, False             | 使用客户端协议版本。这在 DateTime 时区列中需要，但是在当前版本的 chproxy 中会Break                                                                                                                                  |
| max_error_size          | 1024    |                         | 客户端错误消息中返回的最大字符数。将此设置为 0 以获取完整的 ClickHouse 错误消息。默认为 1024 字符。                                                                                  |
| send_os_user            | True    | True, False             | 将检测到的操作系统用户信息包含在发送至 ClickHouse 的客户端信息中（HTTP User-Agent 字符串）                                                                                                                                                  |
| http_buffer_size        | 10MB    |                         | 用于 HTTP 流式查询的“内存中”缓冲区的大小（以字节为单位）                                                                                                                                                                                     |
### 压缩 {#compression}

ClickHouse Connect 支持 lz4、zstd、brotli 和 gzip 压缩，用于查询结果和插入。请始终铭记  
使用压缩通常涉及网络带宽/传输速度与 CPU 使用之间的权衡（客户端和服务器均如此）。

要接收压缩数据，ClickHouse 服务器 `enable_http_compression` 必须设置为 1，或者用户必须有权限按“每个查询”基础更改设置。

压缩由调用 `clickhouse_connect.get_client` 工厂方法时的 `compress` 参数控制。默认情况下，`compress` 设置为 `True`，这将触发默认压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询，ClickHouse Connect 将在查询中添加 `Accept-Encoding` 头，其中包含 `lz4`、`zstd`、`br`（如果安装了 brotli 库）、`gzip` 和 `deflate` 编码（对于大多数请求，ClickHouse 服务器将以 `zstd` 压缩有效负载返回）。对于插入，默认情况下 ClickHouse Connect 将以 `lz4` 压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法，可以是 `lz4`、`zstd`、`br` 或 `gzip`。然后该方法将用于插入和查询结果（如果 ClickHouse 服务器支持）。所需的 `zstd` 和 `lz4` 压缩库现在默认与 ClickHouse Connect 一起安装。如果指定 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不使用客户端配置中指定的压缩。

我们还建议避免使用 `gzip` 压缩，因为在压缩和解压数据时，它的速度显著慢于其他选项。
### HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 使用 `urllib3` 库添加基本的 HTTP 代理支持。它识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意，使用这些环境变量将适用于使用 `clickhouse_connect.get_client` 方法创建的任何客户端。或者，要为每个客户端进行配置，可以使用 get_client 方法的 `http_proxy` 或 `https_proxy` 参数。有关 HTTP 代理支持的实现详情，请参见 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 Socks 代理，可以将 `urllib3` 的 SOCKSProxyManager 作为 `pool_mgr` 参数传递给 `get_client`。请注意，这将要求直接安装 PySocks 库，或使用 `urllib3` 依赖项的 `[socks]` 选项。
### “旧” JSON 数据类型 {#old-json-data-type}

实验性的 `Object`（或 `Object('json')`）数据类型已被弃用，应该在生产环境中避免使用。   
ClickHouse Connect 继续为该数据类型提供有限的支持以保持向后兼容。请注意，此支持不包括预期返回“顶级”或“父”JSON值作为字典或同等形式的查询，这类查询将导致异常。
### “新” Variant/Dynamic/JSON 数据类型（实验特性） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 提供对新（也是实验性） ClickHouse 类型 Variant、Dynamic 和 JSON 的实验性支持。
#### 使用注意事项 {#usage-notes}
- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。 不支持其他形式的 JSON 数据
- 使用这些类型的查询返回的子列/路径的类型将是子列的类型。
- 请查看 ClickHouse 的主要文档以获取其他使用注意事项
#### 已知局限性: {#known-limitations}
- 在使用之前，这些类型中的每个类型必须在 ClickHouse 设置中启用。
- “新” JSON 类型在 ClickHouse 24.8 版本中可用。
- 由于内部格式更改，`clickhouse-connect` 仅与 ClickHouse 24.7 版本及之后的 Variant 类型兼容。
- 返回的 JSON 对象将仅返回 `max_dynamic_paths` 数量的元素（默认值为 1024）。这将在未来的版本中修复。
- 插入到 `Dynamic` 列中的值将始终是 Python 值的字符串表示。此问题将在未来的版本中修复，修复完成后请参见 https://github.com/ClickHouse/ClickHouse/issues/70395。
- 新类型的实现尚未在 C 代码中优化，因此性能可能比更简单、成熟的数据类型稍慢。
