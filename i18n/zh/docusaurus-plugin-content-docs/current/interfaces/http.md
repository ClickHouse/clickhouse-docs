---
description: 'ClickHouse 中 HTTP 接口的文档，该接口提供用于从任意平台和编程语言访问 ClickHouse 的 REST API'
sidebar_label: 'HTTP 接口'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP 接口'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP 接口



## 前置条件 {#prerequisites}

本文示例需要满足以下条件:

- 拥有一个正在运行的 ClickHouse 服务器实例
- 已安装 `curl`。在 Ubuntu 或 Debian 系统上,运行 `sudo apt install curl`,或参考此[文档](https://curl.se/download.html)获取安装说明。


## 概述 {#overview}

HTTP 接口允许您通过 REST API 的形式,在任何平台上使用任何编程语言来使用 ClickHouse。HTTP 接口的功能相比原生接口更为有限,但具有更好的编程语言支持。

默认情况下,`clickhouse-server` 监听以下端口:

- 端口 8123 用于 HTTP
- 端口 8443 用于 HTTPS(可启用)

如果您发起一个不带任何参数的 `GET /` 请求,将返回 200 响应码以及字符串 "Ok.":

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." 是在 [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) 中定义的默认值,可根据需要进行修改。

另请参阅:[HTTP 响应码注意事项](#http_response_codes_caveats)。


## Web 用户界面 {#web-ui}

ClickHouse 包含一个 Web 用户界面,可通过以下地址访问:

```text
http://localhost:8123/play
```

Web 用户界面支持在查询运行时显示进度、取消查询以及结果流式传输。
它还有一个隐藏功能,可以显示查询管道的图表和图形。

成功执行查询后,会出现一个下载按钮,允许您以多种格式下载查询结果,包括 CSV、TSV、JSON、JSONLines、Parquet、Markdown 或 ClickHouse 支持的任何自定义格式。下载功能使用查询缓存来高效检索结果,无需重新执行查询。即使界面仅显示多页结果中的单个页面,它也会下载完整的结果集。

Web 用户界面专为像您这样的专业人士设计。

<Image img={PlayUI} size='md' alt='ClickHouse Web 用户界面截图' />

在健康检查脚本中使用 `GET /ping` 请求。此处理程序始终返回 "Ok."(末尾带有换行符)。从版本 18.12.13 开始可用。另请参阅 `/replicas_status` 以检查副本的延迟。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## 通过 HTTP/HTTPS 查询 {#querying}

通过 HTTP/HTTPS 查询有三种方式:

- 将请求作为 URL 的 'query' 参数发送
- 使用 POST 方法
- 在 'query' 参数中发送查询的开头部分,其余部分使用 POST 发送

:::note
URL 的大小默认限制为 1 MiB,可以通过 `http_max_uri_size` 设置进行更改。
:::

如果成功,您将收到 200 响应代码以及响应体中的结果。
如果发生错误,您将收到 500 响应代码以及响应体中的错误描述文本。

使用 GET 的请求是"只读"的。这意味着对于修改数据的查询,您只能使用 POST 方法。
您可以在 POST 正文或 URL 参数中发送查询本身。让我们看一些示例。

在下面的示例中,使用 curl 发送查询 `SELECT 1`。注意空格使用了 URL 编码:`%20`。

```bash title="命令"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="响应"
1
```

在此示例中,wget 使用 `-nv`(非详细)和 `-O-` 参数将结果输出到终端。
在这种情况下,不需要对空格使用 URL 编码:

```bash title="命令"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

在此示例中,我们将原始 HTTP 请求通过管道传递给 netcat:

```bash title="命令"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="响应"
HTTP/1.0 200 OK
X-ClickHouse-Summary: {"read_rows":"1","read_bytes":"1","written_rows":"0","written_bytes":"0","total_rows_to_read":"1","result_rows":"0","result_bytes":"0","elapsed_ns":"4505959","memory_usage":"1111711"}
Date: Tue, 11 Nov 2025 18:16:01 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
Access-Control-Expose-Headers: X-ClickHouse-Query-Id,X-ClickHouse-Summary,X-ClickHouse-Server-Display-Name,X-ClickHouse-Format,X-ClickHouse-Timezone,X-ClickHouse-Exception-Code,X-ClickHouse-Exception-Tag
X-ClickHouse-Server-Display-Name: MacBook-Pro.local
X-ClickHouse-Query-Id: ec0d8ec6-efc4-4e1d-a14f-b748e01f5294
X-ClickHouse-Format: TabSeparated
X-ClickHouse-Timezone: Europe/London
X-ClickHouse-Exception-Tag: dngjzjnxkvlwkeua

1
```

如您所见,`curl` 命令有些不便,因为空格必须进行 URL 转义。
虽然 `wget` 会自动转义所有内容,但我们不建议使用它,因为在使用 keep-alive 和 Transfer-Encoding: chunked 时,它在 HTTP 1.1 上运行不佳。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

如果查询的一部分在参数中发送,另一部分在 POST 中发送,则会在这两个数据部分之间插入换行符。
例如,以下操作将无法正常工作:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

默认情况下,数据以 [`TabSeparated`](/interfaces/formats/TabSeparated) 格式返回。

在查询中使用 `FORMAT` 子句可以请求任何其他格式。例如:

```bash title="命令"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1, 2, 3 FORMAT JSON'
```


```response title="Response"
{
    "meta":
    [
        {
            "name": "1",
            "type": "UInt8"
        },
        {
            "name": "2",
            "type": "UInt8"
        },
        {
            "name": "3",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "1": 1,
            "2": 2,
            "3": 3
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.000515,
        "rows_read": 1,
        "bytes_read": 1
    }
}
```

您可以使用 `default_format` URL 参数或 `X-ClickHouse-Format` 请求头来指定 `TabSeparated` 以外的默认格式。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

你可以将 POST 方法与参数化查询一起使用。参数通过使用花括号括起参数名称和类型来指定，例如 `{name:Type}`。参数值通过 `param_name` 传递：

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## 通过 HTTP/HTTPS 执行 INSERT 查询 {#insert-queries}

执行 `INSERT` 查询时必须使用 `POST` 方法传输数据。此时,您可以在 URL 参数中编写查询的开头部分,并使用 POST 传递要插入的数据。要插入的数据可以是例如来自 MySQL 的制表符分隔转储文件。通过这种方式,`INSERT` 查询可以替代 MySQL 中的 `LOAD DATA LOCAL INFILE`。

### 示例 {#examples}

创建表:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

使用常规的 `INSERT` 查询插入数据:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

将数据与查询分开发送:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

可以指定任何数据格式。例如,可以指定 'Values' 格式,该格式与编写 `INSERT INTO t VALUES` 时使用的格式相同:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

要从制表符分隔的转储文件中插入数据,请指定相应的格式:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

读取表内容:

```bash
$ curl 'http://localhost:8123/?query=SELECT%20a%20FROM%20t'
7
8
9
10
11
12
1
2
3
4
5
6
```

:::note
由于并行查询处理,数据以随机顺序输出
:::

删除表:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

对于不返回数据表的成功请求,将返回空响应体。


## 压缩 {#compression}

压缩可用于在传输大量数据时减少网络流量,或用于创建即时压缩的转储文件。

在传输数据时,您可以使用 ClickHouse 内部压缩格式。压缩后的数据采用非标准格式,需要使用 `clickhouse-compressor` 程序来处理。该程序默认随 `clickhouse-client` 软件包一起安装。

要提高数据插入效率,可以使用 [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 设置来禁用服务器端校验和验证。

如果在 URL 中指定 `compress=1`,服务器将压缩发送给您的数据。如果在 URL 中指定 `decompress=1`,服务器将解压缩您通过 `POST` 方法传递的数据。

您也可以选择使用 [HTTP 压缩](https://en.wikipedia.org/wiki/HTTP_compression)。ClickHouse 支持以下[压缩方法](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

要发送压缩的 `POST` 请求,请添加请求头 `Content-Encoding: compression_method`。

要让 ClickHouse 压缩响应,请在请求中添加 `Accept-Encoding: compression_method` 头。

您可以使用 [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 设置为所有压缩方法配置数据压缩级别。

:::info
某些 HTTP 客户端可能默认解压缩来自服务器的数据(使用 `gzip` 和 `deflate`),即使您正确使用了压缩设置,也可能会收到解压缩后的数据。
:::


## 示例 {#examples-compression}

向服务器发送压缩数据:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

从服务器接收压缩数据归档:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

从服务器接收压缩数据,使用 gunzip 获取解压后的数据:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## 默认数据库 {#default-database}

您可以使用 `database` URL 参数或 `X-ClickHouse-Database` 请求头来指定默认数据库。

```bash
echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

默认情况下,将使用服务器配置中注册的数据库作为默认数据库。在默认配置下,该数据库名为 `default`。此外,您也可以在表名前使用点号来指定数据库。


## 身份验证 {#authentication}

用户名和密码可以通过以下三种方式指定:

1. 使用 HTTP 基本身份验证。

例如:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. 在 `user` 和 `password` URL 参数中

:::warning
不推荐使用此方法,因为参数可能会被 Web 代理记录并缓存在浏览器中
:::

例如:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 使用 'X-ClickHouse-User' 和 'X-ClickHouse-Key' 请求头

例如:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

如果未指定用户名,则使用 `default` 名称。如果未指定密码,则使用空密码。
您还可以使用 URL 参数来指定处理单个查询的任何设置或整个设置配置文件。

例如:

```text
http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1
```

```bash
$ echo 'SELECT number FROM system.numbers LIMIT 10' | curl 'http://localhost:8123/?' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

更多信息请参阅:

- [设置](/operations/settings/settings)
- [SET](/sql-reference/statements/set)


## 在 HTTP 协议中使用 ClickHouse 会话 {#using-clickhouse-sessions-in-the-http-protocol}

您也可以在 HTTP 协议中使用 ClickHouse 会话。为此，需要在请求中添加 `session_id` `GET` 参数。会话 ID 可以使用任意字符串。

默认情况下，会话在 60 秒无活动后终止。要更改此超时时间(以秒为单位)，可修改服务器配置中的 `default_session_timeout` 设置，或在请求中添加 `session_timeout` `GET` 参数。

要检查会话状态，请使用 `session_check=1` 参数。单个会话中一次只能执行一个查询。

您可以在 `X-ClickHouse-Progress` 响应头中获取查询进度信息。为此，需启用 [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)。

以下是响应头序列的示例：

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

可能的响应头字段包括：

| 响应头字段           | 描述                        |
| -------------------- | --------------------------- |
| `read_rows`          | 已读取的行数。              |
| `read_bytes`         | 已读取的数据量(以字节为单位)。 |
| `total_rows_to_read` | 需要读取的总行数。          |
| `written_rows`       | 已写入的行数。              |
| `written_bytes`      | 已写入的数据量(以字节为单位)。 |
| `elapsed_ns`         | 查询运行时间(以纳秒为单位)。 |
| `memory_usage`       | 查询使用的内存(以字节为单位)。 |

如果 HTTP 连接断开，正在运行的请求不会自动停止。解析和数据格式化在服务器端执行，因此使用网络可能效率不高。

存在以下可选参数：

| 参数                   | 描述                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | 可作为查询 ID 传递(任意字符串)。[`replace_running_query`](/operations/settings/settings#replace_running_query)        |
| `quota_key` (optional) | 可作为配额键传递(任意字符串)。["Quotas"](/operations/quotas)                                                             |

HTTP 接口允许传递外部数据(外部临时表)用于查询。有关更多信息，请参阅["查询处理的外部数据"](/engines/table-engines/special/external-data)。


## 响应缓冲 {#response-buffering}

可以在服务器端启用响应缓冲。为此提供了以下 URL 参数:

- `buffer_size`
- `wait_end_of_query`

可以使用以下设置:

- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` 决定在服务器内存中缓冲的结果字节数。如果结果主体大于此阈值,缓冲区会被写入 HTTP 通道,剩余数据则直接发送到 HTTP 通道。

要确保整个响应被缓冲,请设置 `wait_end_of_query=1`。在这种情况下,未存储在内存中的数据将被缓冲到临时服务器文件中。

例如:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
使用缓冲可以避免在响应代码和 HTTP 头已发送到客户端之后才发生查询处理错误的情况。在这种情况下,错误消息会写入响应主体的末尾,而在客户端,错误只能在解析阶段被检测到。
:::


## 使用查询参数设置角色 {#setting-role-with-query-parameters}

此功能在 ClickHouse 24.4 中新增。

在特定场景下,可能需要在执行语句之前先设置已授予的角色。
然而,由于不允许使用多语句,因此无法同时发送 `SET ROLE` 和查询语句:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上述命令将导致错误:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

要解决此限制,可以使用 `role` 查询参数:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

这等同于在执行语句之前先执行 `SET ROLE my_role`。

此外,还可以指定多个 `role` 查询参数:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

在这种情况下,`?role=my_role&role=my_other_role` 的效果等同于在执行语句之前先执行 `SET ROLE my_role, my_other_role`。


## HTTP 响应码注意事项 {#http_response_codes_caveats}

由于 HTTP 协议的限制,HTTP 200 响应码并不能保证查询成功执行。

以下是一个示例:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

这种行为的原因在于 HTTP 协议的本质。HTTP 头部首先发送,其中包含 HTTP 状态码 200,随后发送 HTTP 正文,然后错误以纯文本形式注入到正文中。

这种行为与使用的格式无关,无论是 `Native`、`TSV` 还是 `JSON`,错误消息始终会出现在响应流的中间。

您可以通过启用 `wait_end_of_query=1`([响应缓冲](#response-buffering))来缓解此问题。在这种情况下,HTTP 头部的发送会延迟到整个查询执行完成。然而,这并不能完全解决问题,因为结果仍然必须在 [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) 范围内,并且其他设置如 [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers) 可能会干扰头部的延迟发送。

:::tip
捕获所有错误的唯一方法是在使用所需格式解析 HTTP 正文之前先对其进行分析。
:::

当 `http_write_exception_in_output_format=0`(默认值)时,ClickHouse 中的此类异常具有如下一致的异常格式,无论使用哪种格式(例如 `Native`、`TSV`、`JSON` 等)。这使得在客户端解析和提取错误消息变得容易。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

其中 `<TAG>` 是一个 16 字节的随机标签,与在 `X-ClickHouse-Exception-Tag` 响应头中发送的标签相同。
`<error message>` 是实际的异常消息(确切长度可以在 `<message_length>` 中找到)。上述整个异常块最大可达 16 KiB。

以下是 `JSON` 格式的示例

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+JSON"
...
{
    "meta":
    [
        {
            "name": "sleepEachRow(0.001)",
            "type": "UInt8"
        },
        {
            "name": "throwIf(equals(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        },
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        }
__exception__
dmrdfnujjqvszhav
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 dmrdfnujjqvszhav
__exception__
```

以下是类似的 `CSV` 格式示例

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

```


**异常**
rumfyutuqkncbgau
代码：395。DB::Exception: 传递给 &#39;throwIf&#39; 函数的值为非零：在执行 &#39;FUNCTION throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8) :: 1) -&gt; throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8)) UInt8 : 0&#39; 时。(FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
**异常**

```
```


## 带参数的查询 {#cli-queries-with-parameters}

您可以创建带参数的查询,并通过相应的 HTTP 请求参数传递参数值。更多信息请参阅 [CLI 带参数的查询](../interfaces/cli.md#cli-queries-with-parameters)。

### 示例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URL 参数中的制表符 {#tabs-in-url-parameters}

查询参数按"转义"格式解析。这样做有一些好处,例如可以明确地将空值解析为 `\N`。这意味着制表符应编码为 `\t`(或 `\` 加一个制表符)。例如,以下示例在 `abc` 和 `123` 之间包含一个实际的制表符,输入字符串被分割为两个值:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

但是,如果您尝试在 URL 参数中使用 `%09` 编码实际的制表符,将无法正确解析:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

如果您使用 URL 参数,需要将 `\t` 编码为 `%5C%09`。例如:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 预定义 HTTP 接口 {#predefined_http_interface}

ClickHouse 支持通过 HTTP 接口执行特定查询。例如,可以按以下方式向表中写入数据:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse 还支持预定义 HTTP 接口,可以帮助您更轻松地与第三方工具(如 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter))集成。下面我们来看一个示例。

首先,将以下配置添加到服务器配置文件中。

`http_handlers` 配置包含多个 `rule`。ClickHouse 会将接收到的 HTTP 请求与 `rule` 中的预定义类型进行匹配,并运行第一个匹配的规则对应的处理程序。匹配成功后,ClickHouse 将执行相应的预定义查询。

```yaml title="config.xml"
<http_handlers>
<rule>
<url>/predefined_query</url>
<methods>POST,GET</methods>
<handler>
<type>predefined_query_handler</type>
<query>SELECT * FROM system.metrics LIMIT 5 FORMAT Template SETTINGS format_template_resultset = 'prometheus_template_output_format_resultset', format_template_row = 'prometheus_template_output_format_row', format_template_rows_between_delimiter = '\n'</query>
</handler>
</rule>
<rule>...</rule>
<rule>...</rule>
</http_handlers>
```

现在可以直接请求该 URL 以获取 Prometheus 格式的数据:


```bash
$ curl -v 'http://localhost:8123/predefined_query'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /predefined_query HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Tue, 28 Apr 2020 08:52:56 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< X-ClickHouse-Server-Display-Name: i-mloy5trc
< Transfer-Encoding: chunked
< X-ClickHouse-Query-Id: 96fe0052-01e6-43ce-b12a-6b7370de6e8a
< X-ClickHouse-Format: Template
< X-ClickHouse-Timezone: Asia/Shanghai
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
# HELP "Query" "Number of executing queries"
# TYPE "Query" counter
"Query" 1
```


# HELP "Merge" "正在执行的后台合并任务数"
# TYPE "Merge" counter
"Merge" 0



# HELP "PartMutation" "变更操作次数（ALTER DELETE/UPDATE）"
# TYPE "PartMutation" counter
"PartMutation" 0



# HELP "ReplicatedFetch" "从副本获取的数据部分数量"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;正在发送到副本的数据分片数量&quot;

# TYPE &quot;ReplicatedSend&quot; counter

&quot;ReplicatedSend&quot; 0

* 与主机 localhost 的连接 #0 保持打开

* 与主机 localhost 的连接 #0 保持打开

```

`http_handlers` 的配置选项工作方式如下。

`rule` 可以配置以下参数:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

下面将逐一讨论这些参数:

- `method` 负责匹配 HTTP 请求的方法部分。`method` 完全符合 HTTP 协议中 [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) 的定义。这是一个可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的方法部分。

- `url` 负责匹配 HTTP 请求的 URL 部分(路径和查询字符串)。
  如果 `url` 以 `regex:` 为前缀,则使用 [RE2](https://github.com/google/re2) 正则表达式。
  这是一个可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的 URL 部分。

- `full_url` 与 `url` 相同,但包含完整的 URL,即 `schema://host:port/path?query_string`。
  注意,ClickHouse 不支持"虚拟主机",因此 `host` 是 IP 地址(而不是 `Host` 请求头的值)。

- `empty_query_string` - 确保请求中没有查询字符串(`?query_string`)

- `headers` 负责匹配 HTTP 请求的请求头部分。它兼容 RE2 正则表达式。这是一个可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的请求头部分。

- `handler` 包含主要的处理逻辑。

  它可以具有以下 `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  以及以下参数:
  - `query` — 与 `predefined_query_handler` 类型一起使用,在调用处理器时执行查询。
  - `query_param_name` — 与 `dynamic_query_handler` 类型一起使用,提取并执行 HTTP 请求参数中与 `query_param_name` 值对应的值。
  - `status` — 与 `static` 类型一起使用,响应状态码。
  - `content_type` — 与任何类型一起使用,响应 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)。
  - `http_response_headers` — 与任何类型一起使用,响应头映射。也可用于设置内容类型。
  - `response_content` — 与 `static` 类型一起使用,发送给客户端的响应内容,当使用前缀 'file://' 或 'config://' 时,从文件或配置中查找内容并发送给客户端。
  - `user` - 执行查询的用户(默认用户为 `default`)。
    **注意**,您无需为此用户指定密码。

接下来将讨论不同 `type` 的配置方法。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` 支持设置 `Settings` 和 `query_params` 值。您可以在 `predefined_query_handler` 类型中配置 `query`。

`query` 值是 `predefined_query_handler` 的预定义查询,当 HTTP 请求匹配时由 ClickHouse 执行并返回查询结果。这是必需的配置。

以下示例定义了 [`max_threads`](../operations/settings/settings.md#max_threads) 和 [`max_final_threads`](/operations/settings/settings#max_final_threads) 设置的值,然后查询系统表以检查这些设置是否成功设置。

:::note
要保留默认的 `handlers`,例如 `query`、`play`、`ping`,请添加 `<defaults/>` 规则。
:::

例如:
```


```yaml
<http_handlers>
<rule>
<url><![CDATA[regex:/query_param_with_url/(?P<name_1>[^/]+)]]></url>
<methods>GET</methods>
<headers>
<XXX>TEST_HEADER_VALUE</XXX>
<PARAMS_XXX><![CDATA[regex:(?P<name_2>[^/]+)]]></PARAMS_XXX>
</headers>
<handler>
<type>predefined_query_handler</type>
<query>
SELECT name, value FROM system.settings
WHERE name IN ({name_1:String}, {name_2:String})
</query>
</handler>
</rule>
<defaults/>
</http_handlers>
```

```bash
curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads    2
max_threads    1
```

:::note
一个 `predefined_query_handler` 中只支持一个 `query`。
:::

### dynamic_query_handler {#dynamic_query_handler}

在 `dynamic_query_handler` 中,查询以 HTTP 请求参数的形式编写。与 `predefined_query_handler` 的区别在于,后者的查询在配置文件中编写。可以在 `dynamic_query_handler` 中配置 `query_param_name`。

ClickHouse 会提取并执行 HTTP 请求 URL 中与 `query_param_name` 值对应的参数值。`query_param_name` 的默认值为 `/query`。这是一个可选配置项。如果配置文件中未定义,则不会传入该参数。

为了演示此功能,以下示例定义了 [`max_threads`](../operations/settings/settings.md#max_threads) 和 `max_final_threads` 的值,并查询这些设置是否成功设置。

示例:

```yaml
<http_handlers>
<rule>
<headers>
<XXX>TEST_HEADER_VALUE_DYNAMIC</XXX>    </headers>
<handler>
<type>dynamic_query_handler</type>
<query_param_name>query_param</query_param_name>
</handler>
</rule>
<defaults/>
</http_handlers>
```

```bash
curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```

### static {#static}

`static` 可以返回 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 和 `response_content`。`response_content` 可以返回指定的内容。

例如,要返回消息 "Say Hi!":

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #highlight-next-line
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

可以使用 `http_response_headers` 来设置内容类型,而不是使用 `content_type`。


```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                #begin-highlight
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #end-highlight
                <response_content>你好!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

```bash
curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /hi HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 402 Payment Required
< Date: Wed, 29 Apr 2020 03:51:26 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

从发送给客户端的配置中获取内容。

```yaml
<get_config_static_handler><![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]></get_config_static_handler>

<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_config_static_handler</url>
            <handler>
                <type>static</type>
                <response_content>config://get_config_static_handler</response_content>
            </handler>
        </rule>
</http_handlers>
```

```bash
$ curl -v  -H 'XXX:xxx' 'http://localhost:8123/get_config_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_config_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:01:24 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

要查看从文件发送给客户端的内容：


```yaml
<http_handlers>
<rule>
<methods>GET</methods>
<headers><XXX>xxx</XXX></headers>
<url>/get_absolute_path_static_handler</url>
<handler>
<type>static</type>
<content_type>text/html; charset=UTF-8</content_type>
<http_response_headers>
<ETag>737060cd8c284d8af7ad3082f209582d</ETag>
</http_response_headers>
<response_content>file:///absolute_path_file.html</response_content>
</handler>
</rule>
<rule>
<methods>GET</methods>
<headers><XXX>xxx</XXX></headers>
<url>/get_relative_path_static_handler</url>
<handler>
<type>static</type>
<content_type>text/html; charset=UTF-8</content_type>
<http_response_headers>
<ETag>737060cd8c284d8af7ad3082f209582d</ETag>
</http_response_headers>
<response_content>file://./relative_path_file.html</response_content>
</handler>
</rule>
</http_handlers>
```

```bash
$ user_files_path='/var/lib/clickhouse/user_files'
$ sudo echo "<html><body>Relative Path File</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Absolute Path File</body></html>" > $user_files_path/absolute_path_file.html
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_absolute_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_absolute_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:16 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Absolute Path File</body></html>
* Connection #0 to host localhost left intact
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_relative_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_relative_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:31 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` 将执行 `302` 重定向至 `location`

例如,以下是如何为 ClickHouse play 自动将用户设置为 `play` 的方法:

```xml
<clickhouse>
    <http_handlers>
        <rule>
            <methods>GET</methods>
            <url>/play</url>
            <handler>
                <type>redirect</type>
                <location>/play?user=play</location>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP 响应头 {#http-response-headers}

ClickHouse 允许您配置自定义 HTTP 响应头,可应用于任何类型的可配置处理器。这些响应头通过 `http_response_headers` 设置进行配置,该设置接受表示响应头名称及其值的键值对。此功能特别适用于在 ClickHouse HTTP 接口中实现自定义安全响应头、CORS 策略或其他 HTTP 响应头需求。

例如,您可以为以下内容配置响应头:

- 常规查询端点
- Web UI
- 健康检查

还可以指定 `common_http_response_headers`,这些响应头将应用于配置中定义的所有 HTTP 处理器。

配置的响应头将包含在每个处理器的 HTTP 响应中。

在下面的示例中,每个服务器响应都将包含两个自定义响应头:`X-My-Common-Header` 和 `X-My-Custom-Header`。

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>通用响应头</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>确实是自定义的</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP 流式传输期间异常时的有效 JSON/XML 响应 {#valid-output-on-exception-http-streaming}

当通过 HTTP 执行查询时,如果部分数据已经发送,可能会发生异常。通常异常会以纯文本形式发送到客户端。
即使使用了特定的数据格式来输出数据,输出也可能因不符合指定的数据格式而变得无效。
为了防止这种情况,您可以使用设置 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)(默认禁用),该设置将指示 ClickHouse 以指定格式写入异常(目前支持 XML 和 JSON\* 格式)。

示例:

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>3)+from+system.numbers+format+JSON+settings+max_block_size=1&http_write_exception_in_output_format=1'
{
    "meta":
    [
        {
            "name": "number",
            "type": "UInt64"
        },
        {
            "name": "throwIf(greater(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "number": "0",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "1",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "2",
            "throwIf(greater(number, 2))": 0
        }
    ],

    "rows": 3,

    "exception": "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)"
}
```

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>2)+from+system.numbers+format+XML+settings+max_block_size=1&http_write_exception_in_output_format=1'
<?xml version='1.0' encoding='UTF-8' ?>
<result>
    <meta>
        <columns>
            <column>
                <name>number</name>
                <type>UInt64</type>
            </column>
            <column>
                <name>throwIf(greater(number, 2))</name>
                <type>UInt8</type>
            </column>
        </columns>
    </meta>
    <data>
        <row>
            <number>0</number>
            <field>0</field>
        </row>
        <row>
            <number>1</number>
            <field>0</field>
        </row>
        <row>
            <number>2</number>
            <field>0</field>
        </row>
    </data>
    <rows>3</rows>
    <exception>Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)</exception>
</result>
```
