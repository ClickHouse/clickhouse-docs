---
sidebar_label: 'Python'
sidebar_position: 10
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'ClickHouse Connect项目套件，用于将Python连接到ClickHouse'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Python与ClickHouse Connect的集成
## 介绍 {#introduction}

ClickHouse Connect是一个核心数据库驱动程序，提供与广泛Python应用程序的互操作性。

- 主要接口是`Client`对象，在`clickhouse_connect.driver`包中。该核心包还包括用于与ClickHouse服务器通信的各种帮助类和工具函数，以及用于高级插入和查询管理的“上下文”实现。
- `clickhouse_connect.datatypes`包提供了所有非实验性ClickHouse数据类型的基本实现和子类。它的主要功能是将ClickHouse数据序列化和反序列化为ClickHouse“原生”二进制列式格式，用于实现ClickHouse与客户端应用程序之间的最高效传输。
- `clickhouse_connect.cdriver`包中的Cython/C类优化了最常见的序列化和反序列化，以显著提高纯Python的性能。
- 在`clickhouse_connect.cc_sqlalchemy`包中，有一个有限的[SQLAlchemy](https://www.sqlalchemy.org/)方言，这是基于`datatypes`和`dbi`包构建的。这个受限的实现专注于查询/游标功能，通常不支持SQLAlchemy的DDL和ORM操作。（SQLAlchemy主要面向OLTP数据库，我们建议使用更专门的工具和框架来管理面向OLAP的ClickHouse数据库。）
- 核心驱动程序和ClickHouse Connect SQLAlchemy实现是将ClickHouse连接到Apache Superset的首选方法。使用`ClickHouse Connect`数据库连接，或`clickhousedb` SQLAlchemy方言连接字符串。

此文档适用于当前的beta版本0.8.2。

:::note
官方ClickHouse Connect Python驱动程序使用HTTP协议与ClickHouse服务器通信。
它具有一些优点（例如更好的灵活性、支持HTTP负载均衡器、更好地与基于JDBC的工具兼容等）和缺点（例如略低的压缩和性能，缺乏对某些原生TCP协议复杂特性的支持）。
对于某些用例，您可以考虑使用[社区Python驱动程序](/interfaces/third-party/client-libraries.md)，这些驱动程序使用原生的TCP协议。
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

¹ClickHouse Connect已在列出的平台上明确测试。此外，未经测试的二进制轮（具有C优化）适用于所有通过优秀的[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)项目支持的体系结构。
最后，由于ClickHouse Connect也可以作为纯Python运行，源代码安装应适用于任何较新的Python安装。

²再次强调，SQLAlchemy的支持主要限于查询功能。完整的SQLAlchemy API不受支持。

³ClickHouse Connect已在所有当前支持的ClickHouse版本上进行了测试。由于它使用HTTP协议，因此它也应在大多数其他版本的ClickHouse上正常工作，尽管可能与某些高级数据类型存在一些不兼容性。
### 安装 {#installation}

通过pip从PyPI安装ClickHouse Connect：

`pip install clickhouse-connect`

ClickHouse Connect也可以从源代码安装：
* `git clone` [GitHub仓库](https://github.com/ClickHouse/clickhouse-connect)。
* （可选）运行`pip install cython`以构建并启用C/Cython优化。
* `cd`到项目根目录并运行`pip install .`

### 支持政策 {#support-policy}

ClickHouse Connect目前处于beta阶段，目前仅支持当前beta版本。在报告任何问题之前，请更新到最新版本。问题应在[GitHub项目](https://github.com/ClickHouse/clickhouse-connect/issues)中报告。将来发布的ClickHouse Connect版本保证与发布时的活动支持的ClickHouse版本兼容（通常是最近的三个“稳定”和两个最近的“LTS”版本）。
### 基本用法 {#basic-usage}
### 收集您的连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />
#### 建立连接 {#establish-a-connection}

展示了两个连接ClickHouse的示例：
- 连接到本地主机上的ClickHouse服务器。
- 连接到ClickHouse云服务。
##### 使用ClickHouse Connect客户端实例连接本地主机上的ClickHouse服务器： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### 使用ClickHouse Connect客户端实例连接ClickHouse云服务： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用前面收集的连接详细信息。ClickHouse云服务需要TLS，因此使用端口8443。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### 与数据库交互 {#interact-with-your-database}

要运行ClickHouse SQL命令，请使用客户端的`command`方法：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据，请使用客户端`insert`方法和二维数组的行和值：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

要使用ClickHouse SQL检索数据，请使用客户端的`query`方法：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect驱动API {#clickhouse-connect-driver-api}

***注:*** 鉴于大多数API方法可能的参数数量（大多数是可选的），建议传递关键字参数。

*此处未文档化的方法不被视为API的一部分，可能会被移除或更改。*
### 客户端初始化 {#client-initialization}

`clickhouse_connect.driver.client`类提供了Python应用程序与ClickHouse数据库服务器之间的主要接口。使用`clickhouse_connect.get_client`函数获取Client实例，该实例接受以下参数：
#### 连接参数 {#connection-arguments}

| 参数                   | 类型         | 默认值                       | 描述                                                                                                                                                                                                                                            |
|-----------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                          | 必须是http或https。                                                                                                                                                                                                                                 |
| host                  | str         | localhost                     | ClickHouse服务器的主机名或IP地址。如果未设置，将使用`localhost`。                                                                                                                                                                        |
| port                  | int         | 8123或8443                   | ClickHouse HTTP或HTTPS端口。如果未设置，将默认为8123，或在*secure*=*True*或*interface*=*https*时默认为8443。                                                                                                                              |
| username              | str         | default                       | ClickHouse用户名。如果未设置，将使用`default` ClickHouse用户。                                                                                                                                                                      |
| password              | str         | *&lt;空字符串&gt;*          | *username*的密码。                                                                                                                                                                                                                                   |
| database              | str         | *None*                        | 连接的默认数据库。如果未设置，ClickHouse Connect将使用*username*的默认数据库。                                                                                                                                                            |
| secure                | bool        | False                         | 使用https/TLS。这将覆盖从接口或端口参数推断的值。                                                                                                                                                                   |
| dsn                   | str         | *None*                        | 标准DSN（数据源名称）格式的字符串。如果未另行设置，其他连接值（例如主机或用户）将从此字符串提取。                                                                                                                     |
| compress              | bool or str | True                          | 启用ClickHouse HTTP插入和查询结果的压缩。请参见[附加选项（压缩）](#compression)。                                                                                                                                                                          |
| query_limit           | int         | 0（无限制）                  | 任何`query`响应的最大行数。如果将其设置为零，将返回无限行。请注意，较大的查询限制可能会导致内存不足异常，因为所有结果都在一次加载到内存中。                                                      |
| query_retries         | int         | 2                             | `query`请求的最大重试次数。仅“可重试”的HTTP响应将被重试。`command`或`insert`请求不会自动由驱动程序重试，以防止意外的重复请求。                                                                                                          |
| connect_timeout       | int         | 10                            | HTTP连接超时时间（秒）。                                                                                                                                                                                                                    |
| send_receive_timeout  | int         | 300                           | HTTP连接的发送/接收超时时间（秒）。                                                                                                                                                                                               |
| client_name           | str         | *None*                        | 在HTTP用户代理标头中添加的client_name。设置此项以跟踪ClickHouse系统的query_log中的客户端查询。                                                                                                                                          |
| pool_mgr              | obj         | *&lt;默认PoolManager&gt;* | 要使用的`urllib3`库PoolManager。适用于需要多个连接池连接到不同主机的高级用例。                                                                                                                                         |
| http_proxy            | str         | *None*                        | HTTP代理地址（相当于设置HTTP_PROXY环境变量）。                                                                                                                                                                        |
| https_proxy           | str         | *None*                        | HTTPS代理地址（相当于设置HTTPS_PROXY环境变量）。                                                                                                                                                                      |
| apply_server_timezone | bool        | True                          | 对于时区感知的查询结果使用服务器时区。请参见[时区优先级](#time-zones)。                                                                                                                                                          |
#### HTTPS/TLS参数 {#httpstls-arguments}

| 参数              | 类型   | 默认值 | 描述                                                                                                                                                                                                                                                                               |
|------------------|--------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool   | True    | 如果使用HTTPS/TLS，则验证ClickHouse服务器TLS/SSL证书（主机名、过期等）。                                                                                                                                                                                                             |
| ca_cert          | str    | *None*  | 如果*verify*=*True*，则用于验证ClickHouse服务器证书的根证书的文件路径，以.pem格式。 如果verify为False，则忽略此项。如果ClickHouse服务器证书是操作系统验证的全局信任根，则不需要此项。                                                     |
| client_cert      | str    | *None*  | 用于互操作TLS身份验证的TLS客户端证书的文件路径，以.pem格式。该文件应包含完整的证书链，包括任何中间证书。                                                                                                                                                              |
| client_cert_key  | str    | *None*  | 客户端证书的私钥文件路径。如果私钥未包含在客户端证书密钥文件中，则需要此项。                                                                                                                                                                                                 |
| server_host_name | str    | *None*  | ClickHouse服务器主机名，根据其TLS证书的CN或SNI进行识别。设置此项以避免通过不同主机名的代理或隧道连接时发生SSL错误。                                                                                                                                                             |
| tls_mode         | str    | *None*  | 控制高级TLS行为。`proxy`和`strict`不调用ClickHouse互操作TLS连接，但会发送客户端证书和密钥。`mutual`假设使用客户端证书进行ClickHouse互操作TLS身份验证。*None*/默认行为为`mutual`。                                                                 |
#### 设置参数 {#settings-argument}

最后，`get_client`的`settings`参数用于将额外的ClickHouse设置传递给每个客户端请求。请注意，在大多数情况下，具有*readonly*=*1*访问权限的用户无法更改与查询一起发送的设置，因此ClickHouse Connect将在最终请求中丢弃此类设置并记录警告。以下设置仅适用于通过ClickHouse Connect使用的HTTP查询/会话，而未记录为一般ClickHouse设置。

| 设置               | 描述                                                                                                                                                                       |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse服务器在写入HTTP通道之前使用的缓冲区大小（以字节为单位）。                                                                                                                 |
| session_id        | 关联服务器上相关查询的唯一会话ID。临时表需要。                                                                                                                                                      |
| compress          | ClickHouse服务器是否应压缩POST响应数据。此设置仅应用于“原始”查询。                                                                                                                    |
| decompress        | 发送到ClickHouse服务器的数据是否必须被解压缩。此设置应仅用于“原始”插入。                                                                                                                  |
| quota_key         | 与此请求相关联的配额键。有关配额的详细信息，请参阅ClickHouse服务器文档。                                                                                                                  |
| session_check     | 用于检查会话状态。                                                                                                                                                                                         |
| session_timeout   | 在被识别的会话ID超时并且不再被视为有效之前的非活动秒数。默认为60秒。                                                                                                          |
| wait_end_of_query | 在ClickHouse服务器上缓冲整个响应。此设置需要返回摘要信息，并在非流式查询时自动设置。|

有关可以与每个查询一起发送的其他ClickHouse设置，请参阅[ClickHouse文档](/operations/settings/settings.md)。
#### 客户端创建示例 {#client-creation-examples}

- 如果没有任何参数，ClickHouse Connect客户端将连接到`localhost`上的默认HTTP端口，使用默认用户和没有密码：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 连接到安全的（https）外部ClickHouse服务器

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- 使用会话ID和其他自定义连接参数以及ClickHouse设置进行连接。

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

几个客户端方法使用一个或两个公共`parameters`和`settings`参数。这些关键字参数如下所述。
#### 参数参数 {#parameters-argument}

ClickHouse Connect Client的`query*`和`command`方法接受一个可选的`parameters`关键字参数，用于将Python表达式绑定到ClickHouse值表达式。提供两种类型的绑定。
##### 服务器端绑定 {#server-side-binding}

ClickHouse支持[服务器端绑定](/interfaces/cli.md#cli-queries-with-parameters)大多数查询值，其中绑定值与查询分开发送，作为HTTP查询参数。ClickHouse Connect将添加适当的查询参数，如果它检测到形式为`{&lt;name&gt;:&lt;datatype&gt;}`的绑定表达式。对于服务器端绑定，`parameters`参数应该是一个Python字典。

- 使用Python字典、DateTime值和字符串值的服务器端绑定示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# 在服务器上生成以下查询

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要提示** -- 服务器端绑定仅在ClickHouse服务器的`SELECT`查询中支持。它不适用于`ALTER`、`DELETE`、`INSERT`或其他类型的查询。将来此项可能会更改，见 https://github.com/ClickHouse/ClickHouse/issues/42092。
##### 客户端绑定 {#client-side-binding}

ClickHouse Connect还支持客户端绑定参数，这可以在生成模板化SQL查询时提供更多灵活性。对于客户端绑定，`parameters`参数应为字典或序列。客户端绑定使用Python的["printf"风格](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)字符串格式化进行参数替换。

请注意，与服务器端绑定不同，客户端绑定不适用于数据库标识符，例如数据库、表或列名，因为Python样式格式化无法区分不同类型的字符串，并且需要以不同的方式格式化（数据库标识符的反引号或双引号，数据值的单引号）。

- 与Python字典、DateTime值和字符串转义的示例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# 生成以下查询：

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- 使用Python序列（元组）、Float64和IPv4地址的示例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# 生成以下查询：

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254'
```

:::note
要绑定带有亚秒精度的DateTime64参数（ClickHouse类型），需要采用两种自定义方法之一：
- 将Python `datetime.datetime`值包装在新的DT64Param类中，例如
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 使用字典的服务器端绑定
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # 使用列表的客户端绑定 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - 如果使用参数值字典，则将字符串`_64`附加到参数名称
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 使用字典的服务器端绑定
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::
#### 设置参数 {#settings-argument-1}

所有关键的ClickHouse Connect Client的`insert`和`select`方法都接受一个可选的`settings`关键字参数，以传递ClickHouse服务器[用户设置](/operations/settings/settings.md)到包含的SQL语句中。`settings`参数应为字典。每个项应为一个ClickHouse设置名称及其相关的值。请注意，值在作为查询参数发送到服务器时会被转换为字符串。

与客户端级别的设置一样，ClickHouse Connect将在记录日志的消息中丢弃服务器标记为*readonly*=*1*的任何设置。通过ClickHouse HTTP接口仅适用于查询的设置总是有效的。此类设置在`get_client`的[API](#settings-argument)下有所描述。

使用ClickHouse设置的示例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### 客户端 _command_ 方法 {#client-_command_-method}

使用`Client.command`方法向ClickHouse服务器发送通常不返回数据或返回单个原始或数组值的SQL查询。此方法接受以下参数：

| 参数             | 类型             | 默认值    | 描述                                                                                                                                                   |
|------------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd              | str              | *必填*   | 一个ClickHouse SQL语句，返回单个值或一行值。                                                                                                                                                          |
| parameters       | dict或可迭代对象 | *无*     | 请参见[参数描述](#parameters-argument)。                                                                                                           |
| data             | str或bytes       | *无*     | 包含POST主体的可选数据。                                                                                                                                            |
| settings         | dict             | *无*     | 请参见[设置描述](#settings-argument)。                                                                                                               |
| use_database     | bool             | True       | 使用客户端数据库（在创建客户端时指定）。False意味着命令将使用连接用户的默认ClickHouse服务器数据库。                                                      |
| external_data    | ExternalData     | *无*     | 包含要用于查询的文件或二进制数据的ExternalData对象。请参见[高级查询（外部数据）](#external-data)。                                                                                          |

- _command_可以用于DDL语句。如果SQL“命令”不返回数据，则会返回一个“查询摘要”字典。此字典封装ClickHouse X-ClickHouse-Summary和X-ClickHouse-Query-Id头，包括键/值对`written_rows`、`written_bytes`和`query_id`。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_也可以用于仅返回单行的简单查询

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client _query_ 方法 {#client-_query_-method}

`Client.query` 方法是从 ClickHouse 服务器检索单个“批量”数据集的主要方式。它利用 HTTP 通过原生 ClickHouse 格式高效传输大数据集（最多约一百万行）。此方法接受以下参数。

| 参数                 | 类型              | 默认值      | 描述                                                                                                                                                                           |
|---------------------|------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必需*     | ClickHouse SQL SELECT 或 DESCRIBE 查询。                                                                                                                                      |
| parameters          | dict 或 iterable  | *无*      | 请参见 [parameters description](#parameters-argument)。                                                                                                                       |
| settings            | dict             | *无*      | 请参见 [settings description](#settings-argument)。                                                                                                                          |                                                                                                                                                  |
| query_formats       | dict             | *无*      | 结果值的数据类型格式规范。请参见高级用法（读取格式）。                                                                                                                                                           |
| column_formats      | dict             | *无*      | 每列的数据类型格式。请参见高级用法（读取格式）。                                                                                                                                                      |
| encoding            | str              | *无*      | 用于将 ClickHouse 字符串列编码为 Python 字符串的编码。如果未设置，Python 默认为 `UTF-8`。                                                                                          |
| use_none            | bool             | True       | 将 Python 的 *None* 类型用于 ClickHouse null。如果为 False，则对 ClickHouse null 使用数据类型默认值（如 0）。注意 - 对于性能原因，NumPy/Pandas 的默认值为 False。                           |
| column_oriented     | bool             | False      | 将结果作为列的序列返回，而不是行的序列。对将 Python 数据转换为其他列式数据格式很有帮助。                                                                                          |
| query_tz            | str              | *无*      | `zoneinfo` 数据库中的时区名称。此时区将应用于查询返回的所有 datetime 或 Pandas Timestamp 对象。                                                                                   |
| column_tzs          | dict             | *无*      | 列名称到时区名称的字典。与 `query_tz` 类似，但允许为不同列指定不同的时区。                                                                                                          |
| use_extended_dtypes | bool             | True       | 使用 Pandas 扩展数据类型（如 StringArray），并使用 pandas.NA 和 pandas.NaT 表示 ClickHouse NULL 值。仅适用于 `query_df` 和 `query_df_stream` 方法。                                         |
| external_data       | ExternalData     | *无*      | 包含文件或二进制数据的 ExternalData 对象，可与查询一起使用。请参见 [Advanced Queries (External Data)](#external-data)。                                                           |
| context             | QueryContext     | *无*      | 可重用的 QueryContext 对象可用于封装上述方法参数。请参见 [Advanced Queries (QueryContexts)](#querycontexts)。                                                                    |
#### The QueryResult Object {#the-queryresult-object}

基本的 `query` 方法返回一个 QueryResult 对象，具有以下公共属性：

- `result_rows` -- 以行的序列形式返回的数据矩阵，每个行元素是列值的序列。
- `result_columns` -- 以列的序列形式返回的数据矩阵，每个列元素是该列的行值序列。
- `column_names` -- 表示 `result_set` 中列名称的字符串元组。
- `column_types` -- 表示 `result_columns` 中每列的 ClickHouse 数据类型的 ClickHouseType 实例元组。
- `query_id` -- ClickHouse query_id（有助于在 `system.query_log` 表中检查查询）。
- `summary` -- `X-ClickHouse-Summary` HTTP 响应头返回的任何数据。
- `first_item` -- 用于将响应的第一行作为字典（键为列名）检索的便捷属性。
- `first_row` -- 返回结果的第一行的便捷属性。
- `column_block_stream` -- 以列式格式返回查询结果的生成器。此属性不应直接引用（见下文）。
- `row_block_stream` -- 以行式格式返回查询结果的生成器。此属性不应直接引用（见下文）。
- `rows_stream` -- 返回查询结果的生成器，每次调用返回一行。此属性不应直接引用（见下文）。
- `summary` -- 如 `command` 方法下所述，由 ClickHouse 返回的摘要信息字典。

`*_stream` 属性返回一个 Python 上下文，可以用作返回数据的迭代器。它们仅应通过 Client `*_stream` 方法间接访问。

有关使用 StreamContext 对象流式查询结果的完整细节，请参见 [Advanced Queries (Streaming Queries)](#streaming-queries)。
### 使用 NumPy、Pandas 或 Arrow 消耗查询结果 {#consuming-query-results-with-numpy-pandas-or-arrow}

主要 `query` 方法有三个专用版本：

- `query_np` -- 此版本返回一个 NumPy 数组，而不是 ClickHouse Connect QueryResult。
- `query_df` -- 此版本返回一个 Pandas DataFrame，而不是 ClickHouse Connect QueryResult。
- `query_arrow` -- 此版本返回一个 PyArrow 表。它直接使用 ClickHouse `Arrow` 格式，因此仅接受与主要 `query` 方法共有的三个参数：`query`、`parameters` 和 `settings`。此外，还有额外参数 `use_strings`，该参数决定 Arrow 表是否将 ClickHouse 字符串类型呈现为字符串（如果为 True）或字节（如果为 False）。

### Client 流式查询方法 {#client-streaming-query-methods}

ClickHouse Connect 客户端提供多种方法以流式检索数据（实现为 Python 生成器）：

- `query_column_block_stream` -- 以块形式将查询数据作为列的序列返回，使用原生 Python 对象。
- `query_row_block_stream` -- 以块形式将查询数据作为行返回，使用原生 Python 对象。
- `query_rows_stream` -- 以序列形式返回查询数据作为行，使用原生 Python 对象。
- `query_np_stream` -- 将每个 ClickHouse 查询数据块作为 NumPy 数组返回。
- `query_df_stream` -- 将每个 ClickHouse 查询数据块作为 Pandas DataFrame 返回。
- `query_arrow_stream` -- 以 PyArrow RecordBlocks 返回查询数据。

这些方法中的每一个返回一个 `ContextStream` 对象，必须通过 `with` 语句打开才能开始消耗流。有关详情和示例，请参见 [Advanced Queries (Streaming Queries)](#streaming-queries)。

### Client _insert_ 方法 {#client-_insert_-method}

对于将多个记录插入 ClickHouse 的常见用例，有 `Client.insert` 方法。它接受以下参数：

| 参数                 | 类型                              | 默认值      | 描述                                                                                                                                                                           |
|---------------------|-----------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table               | str                               | *必需*     | 要插入的 ClickHouse 表。允许使用全表名（包括数据库）。                                                                                                                       |
| data                | Sequence of Sequences             | *必需*     | 要插入的数据矩阵，可以是行的序列，每行是列值的序列，或列的序列，每列是行值的序列。                                                                                          |
| column_names        | Sequence of str, or str           | '*'        | 数据矩阵的列名列表。如果使用 '*'，则 ClickHouse Connect 将执行一个“预查询”以检索表的所有列名。                                                                                |
| database            | str                               | ''         | 插入的目标数据库。如果未指定，则假定使用客户端数据库。                                                                                                                        |
| column_types        | Sequence of ClickHouseType        | *无*      | ClickHouseType 实例的列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行一个“预查询”以检索表的所有列类型。                                      |
| column_type_names   | Sequence of ClickHouse type names | *无*      | ClickHouse 数据类型名称的列表。如果未指定 column_types 或 column_type_names，ClickHouse Connect 将执行一个“预查询”以检索表的所有列类型。                                      |
| column_oriented     | bool                              | False      | 如果为 True，则假定 `data` 参数是列的序列（无需对数据进行“透视”）。否则，`data` 被解释为行的序列。                                                                           |
| settings            | dict                              | *无*      | 请参见 [settings description](#settings-argument)。                                                                                                                          |
| insert_context      | InsertContext                     | *无*      | 可重用的 InsertContext 对象可用于封装上述方法参数。请参见 [Advanced Inserts (InsertContexts)](#insertcontexts)。                                                               |

此方法返回一个“查询摘要”字典，如“command”方法下所述。 如果插入因任何原因失败，将引发异常。

主要 `insert` 方法有两个专用版本：

- `insert_df` -- 此方法的第二个参数需要一个 Pandas DataFrame 实例，替代 Python Sequence of Sequences `data` 参数。ClickHouse Connect 会自动将 DataFrame 作为列式数据源处理，因此不需要 `column_oriented` 参数。
- `insert_arrow` -- 此方法需要一个 `arrow_table`，而不是 Python Sequence of Sequences `data` 参数。ClickHouse Connect 将不经过修改地将 Arrow 表传递给 ClickHouse 服务器进行处理，因此除了 `table` 和 `arrow_table` 之外，仅可以使用 `database` 和 `settings` 参数。

*注意：* NumPy 数组是有效的序列的序列，可以用作主要 `insert` 方法的 `data` 参数，因此不需要专用方法。

### 文件插入 {#file-inserts}

`clickhouse_connect.driver.tools` 包含 `insert_file` 方法，允许直接从文件系统将数据插入现有 ClickHouse 表。解析委托给 ClickHouse 服务器。`insert_file` 接受以下参数：

| 参数               | 类型              | 默认值            | 描述                                                                                                                                    |
|---------------------|------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| client              | Client           | *必需*            | 用于执行插入的 `driver.Client`                                                                                                        |
| table               | str              | *必需*            | 要插入的 ClickHouse 表。允许使用全表名（包括数据库）。                                                                                  |
| file_path           | str              | *必需*            | 数据文件的本地文件系统路径                                                                                                             |
| fmt                 | str              | CSV, CSVWithNames | 文件的 ClickHouse 输入格式。如果未提供 `column_names`，则假定为 CSVWithNames。                                                           |
| column_names        | Sequence of str  | *无*              | 数据文件中列名的列表。对于包括列名的格式不是必需的                                                                                       |
| database            | str              | *无*              | 表的数据库。如果表的全名已指定，则会被忽略。如果未指定，插入将使用客户端数据库。                                                        |
| settings            | dict             | *无*              | 请参见 [settings description](#settings-argument)。                                                                                        |
| compression         | str              | *无*              | 识别的 ClickHouse 压缩类型（zstd, lz4, gzip），用于 Content-Encoding HTTP 头。                                                           |

对于具有不一致数据或日期/时间值格式不寻常的文件，适用于数据导入的设置（如 `input_format_allow_errors_num` 和 `input_format_allow_errors_num`）被此方法识别。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### 将查询结果保存为文件 {#saving-query-results-as-files}

您可以使用 `raw_stream` 方法直接从 ClickHouse 流式传输文件到本地文件系统。例如，如果您想将查询结果保存到 CSV 文件中，可以使用以下代码片段：

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # 或 CSV，或 CSVWithNamesAndTypes，或 TabSeparated等。
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上面的代码生成一个 `output.csv` 文件，其内容如下：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同样，您可以以 [TabSeparated](/interfaces/formats#tabseparated) 和其他格式保存数据。请参见 [Formats for Input and Output Data](/interfaces/formats) 获取所有可用格式选项的概述。

### 原始 API {#raw-api}

对于不需要在 ClickHouse 数据与原生或第三方数据类型和结构之间进行转换的用例，ClickHouse Connect 客户端提供了两种方法直接使用 ClickHouse 连接。
#### Client _raw_query_ 方法 {#client-_raw_query_-method}

`Client.raw_query` 方法允许直接使用 ClickHouse HTTP 查询接口，使用客户端连接。返回值是未经处理的 `bytes` 对象。它提供了一个参数绑定、错误处理、重试和设置管理的便捷包装，使用最小接口：

| 参数                 | 类型              | 默认值      | 描述                                                                                                                                                             |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必需*     | 任何有效的 ClickHouse 查询                                                                                                                                     |
| parameters          | dict 或 iterable  | *无*      | 请参见 [parameters description](#parameters-argument)。                                                                                                       |
| settings            | dict             | *无*      | 请参见 [settings description](#settings-argument)。                                                                                                           |                                                                                                                                       |
| fmt                 | str              | *无*      | 结果字节的 ClickHouse 输出格式（如果未指定，ClickHouse 将使用 TSV）。                                                                                          |
| use_database        | bool             | True       | 使用 ClickHouse Connect 客户端分配的数据库作为查询上下文                                                                                                        |
| external_data       | ExternalData     | *无*      | 包含文件或二进制数据的 ExternalData 对象，可与查询一起使用。请参见 [Advanced Queries (External Data)](#external-data)。                                       |

由调用者负责处理结果的 `bytes` 对象。请注意，`Client.query_arrow` 只是一个使用 ClickHouse `Arrow` 输出格式的薄包装器。

#### Client _raw_stream_ 方法 {#client-_raw_stream_-method}

`Client.raw_stream` 方法的 API 与 `raw_query` 方法相同，但返回一个 `io.IOBase` 对象，可以用作 `bytes` 对象的生成器/流源。它当前被 `query_arrow_stream` 方法使用。

#### Client _raw_insert_ 方法 {#client-_raw_insert_-method}

`Client.raw_insert` 方法允许通过客户端连接直接插入 `bytes` 对象或 `bytes` 对象生成器。由于不对插入有效负载进行任何处理，因此性能非常高。该方法提供了指定设置和插入格式的选项：

| 参数                | 类型                                   | 默认值      | 描述                                                                                                                             |
|---------------------|----------------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------|
| table               | str                                    | *必需*     | 简单或数据库合格的表名                                                                                                          |
| column_names        | Sequence[str]                          | *无*      | 插入块的列名。如果 `fmt` 参数不包括名称，则为必需。                                                                             |
| insert_block        | str, bytes, Generator[bytes], BinaryIO | *必需*     | 要插入的数据。字符串将使用客户端编码进行编码。                                                                                    |
| settings            | dict                                   | *无*      | 请参见 [settings description](#settings-argument)。                                                                               |                                                                                                                                       |
| fmt                 | str                                    | *无*      | 插入块字节的 ClickHouse 输入格式（如果未指定，ClickHouse 将使用 TSV）。                                                            |

由调用者负责确保 `insert_block` 格式正确并使用指定的压缩方法。ClickHouse Connect 使用这些原始插入进行文件上传和 PyArrow 表，委托解析给 ClickHouse 服务器。

### 实用类和函数 {#utility-classes-and-functions}

以下类和函数也被视为“公共” `clickhouse-connect` API 的一部分，并且与上述记录的类和方法一样，在小版本发布中保持稳定。对这些类和函数的重大更改只会发生在小版本（而不是补丁）发布中，并将以已弃用状态提供至少一个小版本。

#### 异常 {#exceptions}

所有自定义异常（包括 DB API 2.0 规范中定义的异常）都定义在 `clickhouse_connect.driver.exceptions` 模块中。驱动程序实际检测到的异常将使用其中一种类型。

#### Clickhouse SQL 实用工具 {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 模块中的函数和 DT64Param 类可用于正确构建和转义 ClickHouse SQL 查询。类似地，`clickhouse_connect.driver.parser` 模块中的函数可用于解析 ClickHouse 数据类型名称。

### 多线程、多进程和异步/事件驱动用例 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect 在多线程、多进程和事件循环驱动/异步应用程序中表现良好。所有查询和插入处理都在单个线程内进行，因此操作通常是线程安全的。（在较低级别并行处理某些操作的可能未来增强，一旦克服单线程的性能惩罚，但即使那样，线程安全性将被保持）。

由于每个查询或插入执行在其各自的 QueryContext 或 InsertContext 对象中维护状态，因此这些辅助对象不是线程安全的，不应在多个处理流之间共享。有关上下文对象的附加讨论，请参见以下部分。

此外，在有两个或更多查询和/或插入“同时进行”的应用程序中，还需考虑两个进一步的事项。第一个是与查询/插入关联的 ClickHouse “会话”，第二个是 ClickHouse Connect 客户端实例使用的 HTTP 连接池。

### AsyncClient 包装器 {#asyncclient-wrapper}

自 0.7.16 起，ClickHouse Connect 提供了一个常规 `Client` 的异步包装器，可以在 `asyncio` 环境中使用客户端。

要获得 `AsyncClient` 的一个实例，您可以使用 `get_async_client` 工厂函数，该函数接受与标准 `get_client` 相同的参数：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` 的方法和参数与标准 `Client` 相同，但在适用时它们是协程。这些执行 I/O 操作的 Client 方法在内部包装在 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 调用中。

使用 `AsyncClient` 包装器时，多线程性能将提高，因为执行线程和 GIL 在等待 I/O 操作完成时将被释放。

请注意：与常规 `Client` 不同，`AsyncClient` 默认将 `autogenerate_session_id` 强制设为 `False`。

另见：[run_async 示例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。

### 管理 ClickHouse 会话 ID {#managing-clickhouse-session-ids}

每个 ClickHouse 查询都在 ClickHouse “会话”的上下文中发生。会话当前用于两个目的：

- 将特定 ClickHouse 设置与多个查询关联（请参见 [user settings](/operations/settings/settings.md)）。 ClickHouse `SET` 命令用于更改用户会话范围的设置。
- 跟踪 [temporary tables.](/sql-reference/statements/create/table#temporary-tables)

默认情况下，使用 ClickHouse Connect 客户端实例执行的每个查询使用相同的会话 ID，以启用此会话功能。也就是说，`SET` 语句和临时表工作在使用单个 ClickHouse 客户端时按预期工作。然而，出于设计原因，ClickHouse 服务器不允许在同一会话中并发查询。因此，对于执行并发查询的 ClickHouse Connect 应用程序，有两种选择。

- 为每个执行线程（线程、进程或事件处理程序）创建单独的 `Client` 实例，以便每个实例都将有自己的会话 ID。一般来说，这是最佳方法，因为它为每个客户端保留了会话状态。
- 对于每个查询使用唯一的会话 ID。在不需要临时表或共享会话设置的情况下，这能避免并发会话问题。（创建客户端时也可以提供共享设置，但这些设置与每个请求发送，而不是与会话关联）。唯一的 session_id 可以添加到每个请求的 `settings` 字典中，或者可以禁用 `autogenerate_session_id` 通用设置：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # 此设置应始终在创建客户端之前设置
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

在这种情况下，ClickHouse Connect 将不发送任何会话 ID，ClickHouse 服务器将生成随机会话 ID。再次，临时表和会话级设置将不可用。

### 自定义 HTTP 连接池 {#customizing-the-http-connection-pool}

ClickHouse Connect 使用 `urllib3` 连接池来处理与服务器的底层 HTTP 连接。默认情况下，所有客户端实例共享同一个连接池，这对于大多数用例是足够的。此默认池维护对应用程序使用的每个 ClickHouse 服务器最多 8 个 HTTP Keep Alive 连接。

对于大型多线程应用程序，单独的连接池可能是合适的。可以作为 `pool_mgr` 关键字参数提供自定义连接池，以传递给主要的 `clickhouse_connect.get_client` 函数：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

如上示例所示，客户端可以共享一个池管理器，或者为每个客户端创建一个单独的池管理器。有关创建 PoolManager 时可用选项的更多详细信息，请参见 [`urllib3` 文档](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)。

## 使用 ClickHouse Connect 查询数据：高级用法 {#querying-data-with-clickhouse-connect--advanced-usage}
### QueryContexts {#querycontexts}

ClickHouse Connect 在 QueryContext 内部执行标准查询。QueryContext 包含用于构建查询的关键结构，以及用于将结果处理成 QueryResult 或其他响应数据结构所使用的配置。这包括查询本身、参数、设置、读取格式和其他属性。

可以使用客户端的 `create_query_context` 方法获取 QueryContext。此方法接受与核心查询方法相同的参数。然后可以将此查询上下文作为 `context` 关键字参数传递给 `query`、`query_df` 或 `query_np` 方法，而无需任何其他参数。请注意，指定的其他参数将覆盖 QueryContext 的任何属性。

QueryContext 最清晰的使用案例是使用不同的绑定参数值发送相同的查询。可以通过使用字典调用 `QueryContext.set_parameters` 方法更新所有参数值，或者可以通过调用 `QueryContext.set_parameter` 来更新任何单个值，具体值由 `key` 和 `value` 对组成。

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

### 流式查询 {#streaming-queries}
#### 数据块 {#data-blocks}
ClickHouse Connect 通过从 ClickHouse 服务器接收数据块的流，处理所有来自主 `查询` 方法的数据。这些数据块以自定义“本机”格式在 ClickHouse 之间传输。一个“数据块”只是二进制数据列的序列，其中每一列都包含相同数量的指定数据类型的数据值。 （作为列式数据库，ClickHouse 以类似的形式存储这些数据。）来自查询的数据块的大小受两个用户设置的控制，这些设置可以在多个级别（用户配置文件、用户、会话或查询）中设置。它们是：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行数限制的块大小。默认值 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- 块大小的软限制（以字节为单位）。默认值 1,000,0000。

无论 `preferred_block_size_setting` 如何，每个块的行数都不会超过 `max_block_size`。根据查询的类型，返回的实际块大小可以是任何值。例如，覆盖多个分片的分布式表的查询可能包含直接从每个分片检索的小块。

使用客户端的 `query_*_stream` 方法时，结果按块返回。ClickHouse Connect 仅一次加载一个块。这允许处理大量数据，而不需要将整个大结果集加载到内存中。请注意，应用程序应该准备好处理任意数量的块，且每个块的确切大小无法控制。
#### 处理缓慢的 HTTP 数据缓冲区 {#http-data-buffer-for-slow-processing}

由于 HTTP 协议的限制，如果块的处理速度远低于 ClickHouse 服务器的流数据速度，ClickHouse 服务器将关闭连接，导致处理线程中抛出异常。通过使用公共的 `http_buffer_size` 设置增加 HTTP 流缓冲区的缓冲区大小（默认为 10 兆字节），可以减轻一些问题。如果有足够的可用内存，较大的 `http_buffer_size` 值在这种情况下应该是可行的。
如果使用 `lz4` 或 `zstd` 压缩，则缓冲区中的数据以压缩形式存储，因此使用这些压缩类型将增加可用的总体缓冲区。
#### StreamContexts {#streamcontexts}

每个 `query_*_stream` 方法（如 `query_row_block_stream`）返回一个 ClickHouse `StreamContext` 对象，这是一个组合的 Python 上下文/生成器。这是基本用法：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <处理每行的 Python 旅行数据>
```

请注意，尝试在没有 `with` 语句的情况下使用 StreamContext 将引发错误。使用 Python 上下文确保即使未消耗所有数据和/或处理过程中引发异常，流（在本例中是一个流式 HTTP 响应）也会被正确关闭。此外，StreamContexts 只能使用一次以消耗流。在退出之后尝试使用 StreamContext 会产生 `StreamClosedError`。

可以使用 StreamContext 的 `source` 属性来访问父 `QueryResult` 对象，其中包括列名和类型。
#### 流类型 {#stream-types}

`query_column_block_stream` 方法将块作为一系列存储为本机 Python 数据类型的列数据返回。使用上述 `taxi_trips` 查询，返回的数据将是一个列表，其中每个元素都是另一个列表（或元组），包含与关联列的所有数据。因此 `block[0]` 将是一个仅包含字符串的元组。列导向格式最常用于对列中所有值进行聚合操作，例如加总总费用。

`query_row_block_stream` 方法将块作为行的序列返回，类似于传统关系数据库。对于出租车行程，返回的数据将是一个列表，其中每个列表元素代表一行数据。因此 `block[0]` 将包含第一辆出租车行程的所有字段（按顺序），`block[1]` 将包含第二辆出租车行程的所有字段的一行，依此类推。行导向结果通常用于显示或转换过程。

`query_row_stream` 是一个便利方法，在遍历流时自动移动到下一个块。否则，它与 `query_row_block_stream` 相同。

`query_np_stream` 方法以二维 NumPy 数组的形式返回每个块。在内部，NumPy 数组通常以列的形式存储，因此不需要明确的行或列方法。NumPy 数组的“形状”将表示为（列，行）。NumPy 库提供了多种处理 NumPy 数组的方法。请注意，如果查询中的所有列共享相同的 NumPy dtype，则返回的 NumPy 数组也将只有一个 dtype，并且可以在不实际更改其内部结构的情况下重新调整/旋转。

`query_df_stream` 方法将每个 ClickHouse 块作为二维 Pandas DataFrame 返回。以下是一个示例，显示 StreamContext 对象可以以延迟的方式用作上下文（但只能使用一次）。

最后，`query_arrow_stream` 方法将 ClickHouse `ArrowStream` 格式的结果作为 pyarrow.ipc.RecordBatchStreamReader 返回，封装在 StreamContext 中。流的每次迭代返回 PyArrow RecordBlock。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <处理 pandas DataFrame>
```
### 读取格式 {#read-formats}

读取格式控制从客户端 `query`、`query_np` 和 `query_df` 方法返回的值的数据类型。 （`raw_query` 和 `query_arrow` 不会修改来自 ClickHouse 的传入数据，因此不适用格式控制。）例如，如果 UUID 的读取格式从默认的 `native` 格式更改为替代的 `string` 格式，则通过 ClickHouse 查询的 `UUID` 列将返回字符串值（使用标准的 8-4-4-4-12 RFC 1422 格式），而不是 Python UUID 对象。

任何格式化函数的“数据类型”参数可以包括通配符。格式是一个单一的小写字符串。

读取格式可设置在多个级别：

- 全局使用 `clickhouse_connect.datatypes.format` 包中定义的方法。这将控制所有查询配置数据类型的格式。
```python
from clickhouse_connect.datatypes.format import set_read_format


# 同时将 IPv6 和 IPv4 值作为字符串返回
set_read_format('IPv*', 'string')


# 将所有日期类型返回为基础的纪元秒或纪元天
set_read_format('Date*', 'int')
```
- 整个查询，使用可选的 `query_formats` 字典参数。在这种情况下，任何指定数据类型的列（或子列）将使用配置的格式。
```python

# 将任何 UUID 列作为字符串返回
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 对特定列中的值，使用可选的 `column_formats` 字典参数。键是 ClickHouse 返回的列名，格式是数据列的格式或 ClickHouse 类型名称及查询格式值的第二级“格式”字典。此二级字典可用于诸如元组或映射之类的嵌套列类型。
```python

# 将 `dev_address` 列中的 IPv6 值作为字符串返回
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 读取格式选项（Python 类型） {#read-format-options-python-types}

| ClickHouse 类型       | 本机 Python 类型    | 读取格式 | 注释                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | 超集当前不支持处理大无符号 UInt64 值                                                   |
| [U]Int[128,256]       | int                   | string       | Pandas 和 NumPy 的 int 值最多为 64 位，因此可以将这些作为字符串返回                              |
| Float32               | float                 | -            | 所有 Python float 在内部均为 64 位                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouse 字符串列没有固有编码，因此它们也用于可变长度二进制数据        |
| FixedString           | bytes                 | string       | FixedStrings 是固定大小的字节数组，但有时被视为 Python 字符串                              |
| Enum[8,16]            | string                | string, int  | Python 枚举不接受空字符串，因此所有枚举都呈现为字符串或底层的 int 值。 |
| Date                  | datetime.date         | int          | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。 该值作为 int 可用                              |
| Date32                | datetime.date         | int          | 同 Date，但适用于更广泛的日期范围                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouse 将 DateTime 存储在纪元秒中。 该值作为 int 可用                                   |
| DateTime64            | datetime.datetime     | int          | Python datetime.datetime 限制为微秒精度。 原始 64 位 int 值可用               |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP 地址可以作为字符串读取，并且正确格式化的字符串可以作为 IP 地址插入                |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP 地址可以作为字符串读取，并且适当格式化的字符串可以作为 IP 地址插入                        |
| Tuple                 | dict 或 tuple         | tuple, json  | 默认情况下命名元组作为字典返回。 也可以将命名元组作为 JSON 字符串返回              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUID 可以作为 RFC 4122 格式的字符串读取<br/>                                                       |
| JSON                  | dict                  | string       | 默认情况下返回 Python 字典。 `string` 格式将返回 JSON 字符串                        |
| Variant               | object                | -            | 返回与点击屋存储的值的 ClickHouse 数据类型匹配的 Python 类型                                 |
| Dynamic               | object                | -            | 返回与 ClickHouse 数据类型存储的值匹配的 Python 类型                                 |
### 外部数据 {#external-data}

ClickHouse 查询可以接受任何 ClickHouse 格式的外部数据。此二进制数据与查询字符串一起发送，以供处理数据。 外部数据功能的详细信息见 [这里](/engines/table-engines/special/external-data.md)。客户端的 `query*` 方法接受一个可选的 `external_data` 参数，以利用此功能。`external_data` 参数的值应为 `clickhouse_connect.driver.external.ExternalData` 对象。该对象的构造函数接受以下参数：

| 名称      | 类型              | 描述                                                                                                                                     |
|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 从本地系统路径读取外部数据的文件路径。需要 `file_path` 或 `data` 中的任意一个                               | 
| file_name | str               | 外部数据“文件”的名称。如果未提供，将根据 `file_path`（不带扩展名）确定                            |
| data      | bytes             | 以二进制形式存在的外部数据（而不是从文件读取）。需要 `data` 或 `file_path` 中的任意一个                                 |
| fmt       | str               | 数据的 ClickHouse [输入格式](/sql-reference/formats.mdx)。默认为 `TSV`                                               |
| types     | str 或 str 的序列 | 外部数据中列数据类型的列表。如果是字符串，则类型应以逗号分隔。需要 `types` 或 `structure` 中的任意一个 |
| structure | str 或 str 的序列 | 数据中列名称 + 数据类型的列表（见示例）。需要 `structure` 或 `types` 中的任意一个                                        |
| mime_type | str               | 文件数据的可选 MIME 类型。目前 ClickHouse 会忽略此 HTTP 子头                                                          |

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

可以使用 `add_file` 方法将额外的外部数据文件添加到初始 ExternalData 对象，该方法与构造函数具有相同的参数。对于 HTTP，所有外部数据作为 `multi-part/form-data` 文件上传的一部分传输。
### 时区 {#time-zones}
有多种机制可以将时区应用于 ClickHouse 的 DateTime 和 DateTime64 值。在内部，ClickHouse 服务器始终将 DateTime 或 DateTime64 对象存储为表示自纪元（1970 年 01 月 01 日 00:00:00 UTC 时间）以来的秒数的无时区数字。对于 DateTime64 值，表示可以是自纪元以来的毫秒、微秒或纳秒，具体取决于精度。因此，任何时区信息的应用总是发生在客户端。请注意，这涉及重要的额外计算，因此在性能关键的应用程序中，建议将 DateTime 类型视为纪元时间戳，除非用于用户显示和转换（例如，Pandas 时间戳总是表示为表示纪元纳秒的 64 位整数以提高性能）。

在查询中使用时区感知的数据类型时——特别是 Python 的 `datetime.datetime` 对象——`clickhouse-connect` 应用客户端的时区，遵循以下优先级规则：

1. 如果为查询指定了查询方法参数 `client_tzs`，则应用特定列的时区
2. 如果 ClickHouse 列具有时区元数据（即它是 DateTime64(3, 'America/Denver') 等类型），则应用 ClickHouse 列的时区。（请注意，此时区元数据在 ClickHouse 版本 23.2 之前的 DateTime 列中对 clickhouse-connect 不可用）
3. 如果为查询指定了查询方法参数 `query_tz`，则应用“查询时区”。
4. 如果对查询或会话应用了时区设置，则应用该时区。（此功能尚未在 ClickHouse 服务器中发布）
5. 最后，如果将客户端的 `apply_server_timezone` 参数设置为 True（默认），则应用 ClickHouse 服务器时区。

请注意，如果根据这些规则应用的时区是 UTC，`clickhouse-connect` 将 _始终_ 返回无时区的 Python `datetime.datetime` 对象。如果需要，可以通过应用程序代码向此无时区对象添加额外的时区信息。
## 使用 ClickHouse Connect 插入数据：高级用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect 在 InsertContext 内执行所有插入。InsertContext 包含作为参数发送给客户端 `insert` 方法的所有值。此外，在最初构造 InsertContext 时，ClickHouse Connect 检索插入所需列的数据类型，以便高效的本机格式插入。通过重用 InsertContext 进行多次插入，可以避免这个“预查询”，从而更快、更有效地执行插入。

可以使用客户端的 `create_insert_context` 方法获取 InsertContext。该方法接受与 `insert` 函数相同的参数。请注意，仅应修改 InsertContexts 的 `data` 属性以便重复使用。这与其作为同一表中新数据的重复插入提供可重用对象的预期用途相一致。

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
写入格式目前仅针对有限数量的类型实现。在大多数情况下，ClickHouse Connect 会通过检查第一个（非空）数据值的类型来自动确定列的正确写入格式。例如，如果插入到一个 DateTime 列，并且该列的第一个插入值是 Python 整数，ClickHouse Connect 将直接插入该整数值，假设它实际上是一个纪元秒。

在大多数情况下，无需覆盖数据类型的写入格式，但可以使用 `clickhouse_connect.datatypes.format` 包中的相关方法在全局级别执行此操作。
#### 写入格式选项 {#write-format-options}

| ClickHouse 类型       | 本机 Python 类型    | 写入格式 | 注释                                                                                                    |
|-----------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                             |
| UInt64                | int                   |               |                                                                                                             |
| [U]Int[128,256]       | int                   |               |                                                                                                             |
| Float32               | float                 |               |                                                                                                             |
| Float64               | float                 |               |                                                                                                             |
| Decimal               | decimal.Decimal       |               |                                                                                                             |
| String                | string                |               |                                                                                                             |
| FixedString           | bytes                 | string        | 如果作为字符串插入，则额外的字节将设置为零                                              |
| Enum[8,16]            | string                |               |                                                                                                             |
| Date                  | datetime.date         | int           | ClickHouse 将日期存储为自 1970 年 01 月 01 日以来的天数。 int 类型将被假设为此“纪元日期”值  |
| Date32                | datetime.date         | int           | 同 Date，但适用于更广泛的日期范围                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouse 将 DateTime 以纪元秒为单位存储。 int 类型将被假设为此“纪元秒”值     |
| DateTime64            | datetime.datetime     | int           | Python datetime.datetime 限制为微秒精度。原始的 64 位 int 值可用         |
| IPv4                  | `ipaddress.IPv4Address` | string        | 正确格式化的字符串可以作为 IPv4 地址插入                                                |
| IPv6                  | `ipaddress.IPv6Address` | string        | 正确格式化的字符串可以作为 IPv6 地址插入                                                |
| Tuple                 | dict 或 tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | 正确格式化的字符串可以作为 ClickHouse UUID 插入                                              |
| JSON/Object('json')   | dict                  | string        | 可以将字典或 JSON 字符串插入 JSON 列（注意 `Object('json')` 已弃用） |
| Variant               | object                |               | 目前所有变体都作为字符串插入并由 ClickHouse 服务器解析                    |
| Dynamic               | object                |               | 警告 — 目前将任何插入到动态列的数据持久化为 ClickHouse 字符串              |
## 其他选项 {#additional-options}

ClickHouse Connect 提供了一些额外的选项以应对高级用例
### 全局设置 {#global-settings}

有少量设置可以全局控制 ClickHouse Connect 行为。它们通过顶层的 `common` 包进行访问：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
在使用 `clickhouse_connect.get_client` 方法创建客户端之前，这些常见的设置 `autogenerate_session_id`、`product_name` 和 `readonly` _始终_ 应该进行修改。客户端创建后更改这些设置不会影响现有客户端的行为。
:::

目前定义了十个全局设置：

| 设置名称            | 默认值 | 选项                 | 描述                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 自动生成每个客户端会话的新 UUID(1) 会话 ID（如果未提供）。如果未提供会话 ID（无论是在客户端还是查询级别），ClickHouse 将为每个查询生成随机的内部 ID                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 当提供无效或只读设置时采取的操作（无论是针对客户端会话还是查询）。如果 `drop`，则该设置将被忽略；如果 `send`，则该设置将发送到 ClickHouse；如果 `error`，则会引发客户端的 ProgrammingError |
| dict_parameter_format   | 'json'  | 'json', 'map'           | 这控制参数化查询是将 Python 字典转换为 JSON 还是 ClickHouse 映射语法。`json` 应该用于插入到 JSON 列中，`map` 用于 ClickHouse 映射列                                                               |
| product_name            |         |                         | 一个与查询一起传递给 ClickHouse Connect的字符串，用于跟踪使用 ClickHouse Connect 的应用程序。格式应为 &lt;产品名称;&gl/&lt;产品版本&gt;                                                                                       |
| max_connection_age      | 600     |                         | HTTP Keep Alive 连接将保持打开/重用的最长秒数。这可以防止在负载均衡器/代理后面对单个 ClickHouse 节点的连接集中。默认为 10 分钟。                                                   |
| readonly                | 0       | 0, 1                    | 对于 19.17 版本之前的 ClickHouse 的隐含 "只读" 设置。可以进行设置以匹配 ClickHouse 的 "read_only" 值，从而在与非常老旧的 ClickHouse 版本的配合使用中允许操作                                                                  |
| use_protocol_version    | True    | True, False             | 使用客户端协议版本。此项对于 DateTime 时区列是必需的，但会与当前版本的 chproxy 冲突                                                                                                                                  |
| max_error_size          | 1024    |                         | 最大字符数，将返回在客户端错误消息中的字符数。将此设置为 0 以获取完整的 ClickHouse 错误消息。默认为 1024个字符。                                                                                  |
| send_os_user            | True    | True, False             | 在发送给 ClickHouse 的客户端信息中包含检测到的操作系统用户（HTTP User-Agent 字符串）                                                                                                                                                  |
| http_buffer_size        | 10MB    |                         | 用于 HTTP 流查询的 "内存中" 缓冲区的大小（以字节为单位）                                                                                                                                                                                     |
### 压缩 {#compression}

ClickHouse Connect 支持 lz4、zstd、brotli 和 gzip 压缩，适用于查询结果和插入。始终记住，使用压缩通常涉及网络带宽/传输速度与 CPU 使用（在客户端和服务器上的两者）之间的权衡。

要接收压缩数据，ClickHouse 服务器的 `enable_http_compression` 必须设置为 1，或者用户必须拥有以“每个查询”的基础更改设置的权限。

压缩由调用 `clickhouse_connect.get_client` 工厂方法时的 `compress` 参数控制。默认情况下，`compress` 设置为 `True`，这将触发默认压缩设置。对于使用 `query`、`query_np` 和 `query_df` 客户端方法执行的查询，ClickHouse Connect 将向使用 `query` 客户端方法执行的查询添加 `Accept-Encoding` 头，包含 `lz4`、`zstd`、`br`（如果安装了 brotli 库）、`gzip` 和 `deflate` 编码。 （对于大多数请求，ClickHouse 服务器将返回一个 `zstd` 压缩的负载。）对于插入，默认情况下，ClickHouse Connect 将使用 `lz4` 压缩插入块，并发送 `Content-Encoding: lz4` HTTP 头。

`get_client` 的 `compress` 参数也可以设置为特定的压缩方法，如 `lz4`、`zstd`、`br` 或 `gzip`。该方法将用于插入和查询结果（如果 ClickHouse 服务器支持）。所需的 `zstd` 和 `lz4` 压缩库现在默认与 ClickHouse Connect 一起安装。如果指定了 `br`/brotli，则必须单独安装 brotli 库。

请注意，`raw*` 客户端方法不使用客户端配置指定的压缩。

我们还建议不要使用 `gzip` 压缩，因为与其他选项相比，它在压缩和解压缩数据时显著较慢。

### HTTP 代理支持 {#http-proxy-support}

ClickHouse Connect 使用 `urllib3` 库增加了基本的 HTTP 代理支持。它识别标准的 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。请注意，使用这些环境变量将适用于使用 `clickhouse_connect.get_client` 方法创建的任何客户端。或者，要对每个客户端进行配置，可以使用 `http_proxy` 或 `https_proxy` 参数传递给 `get_client` 方法。有关 HTTP 代理支持实现的详细信息，请参见 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 文档。

要使用 SOCKS 代理，可以将 `urllib3` 的 SOCKSProxyManager 作为 `pool_mgr` 参数传递给 `get_client`。请注意，这需要单独安装 PySocks 库，或者使用 `urllib3` 依赖项的 `[socks]` 选项。

### “旧” JSON 数据类型 {#old-json-data-type}

实验性的 `Object`（或 `Object('json')`）数据类型已被弃用，不应在生产环境中使用。ClickHouse Connect 仍然提供对该数据类型的有限支持，以实现向后兼容性。请注意，此支持不包括预期返回“顶层”或“父级”JSON值作为字典或等效形式的查询，此类查询将导致异常。

### “新” 变体/动态/JSON 数据类型（实验特性） {#new-variantdynamicjson-datatypes-experimental-feature}

从 0.8.0 版本开始，`clickhouse-connect` 提供对新的（也是实验性的）ClickHouse 类型 Variant、Dynamic 和 JSON 的实验性支持。

#### 使用说明 {#usage-notes}
- JSON 数据可以作为 Python 字典或包含 JSON 对象 `{}` 的 JSON 字符串插入。不支持其他形式的 JSON 数据。
- 使用这些类型的子列/路径的查询将返回子列的类型。
- 有关其他使用说明，请参见 ClickHouse 的主要文档。

#### 已知限制: {#known-limitations}
- 在使用之前，必须在 ClickHouse 设置中启用每种类型。
- “新” JSON 类型自 ClickHouse 24.8 版本开始提供。
- 由于内部格式的变化，`clickhouse-connect` 仅与从 ClickHouse 24.7 版本开始的变体类型兼容。
- 返回的 JSON 对象将仅返回 `max_dynamic_paths` 数量的元素（默认为 1024）。这将于未来的版本中修复。
- 对 `Dynamic` 列的插入将始终是 Python 值的字符串表示形式。此问题将在未来的版本中修复，一旦 https://github.com/ClickHouse/ClickHouse/issues/70395 被修复。
- 新类型的实现尚未在 C 代码中进行优化，因此性能可能比更简单、成熟的数据类型稍慢。
