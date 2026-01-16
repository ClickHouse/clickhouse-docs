---
description: 'ClickHouse 中 HTTP 接口的文档，介绍如何通过 REST API 从任意平台和编程语言访问 ClickHouse'
sidebar_label: 'HTTP 接口'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP 接口'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP 接口 \{#http-interface\}

## 前提条件 \\{#prerequisites\\}

要完成本文中的示例，你需要：

- 一个正在运行的 ClickHouse 服务器实例
- 已安装 `curl`。在 Ubuntu 或 Debian 上，运行 `sudo apt install curl`，或参阅此[文档](https://curl.se/download.html)获取安装说明。

## 概述 \{#overview\}

HTTP 接口以 REST API 的形式，让你可以在任意平台上、通过任意编程语言使用 ClickHouse。与原生接口相比，HTTP 接口的功能更有限，但它对各类语言的支持更好。

默认情况下，`clickhouse-server` 监听以下端口：

* 8123 端口用于 HTTP
* 8443 端口用于 HTTPS（可启用）

如果你在不带任何参数的情况下发起 `GET /` 请求，将返回 200 响应码以及字符串 &quot;Ok.&quot;:

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; 是在 [`http_server_default_response`](../../operations/server-configuration-parameters/settings.md#http_server_default_response) 中定义的默认值，可根据需要进行更改。

另请参阅：[HTTP 响应码注意事项](#http_response_codes_caveats)。


## Web 用户界面 \{#web-ui\}

ClickHouse 提供了一个 Web 用户界面，可以通过以下地址进行访问：

```text
http://localhost:8123/play
```

Web UI 支持在查询运行期间显示进度、取消查询以及结果流式传输。
它还有一个用于展示查询管线图表和可视化的隐藏功能。

成功执行查询后，会出现一个下载按钮，允许你以多种格式下载查询结果，包括 CSV、TSV、JSON、JSONLines、Parquet、Markdown，或 ClickHouse 支持的任意自定义格式。下载功能使用查询缓存高效获取结果，而无需重新执行查询。即使 UI 只显示了多页结果中的一页，它也会下载完整的结果集。

Web UI 专为像你这样的专业人士设计。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI screenshot" />

在健康检查脚本中使用 `GET /ping` 请求。此处理器始终返回 &quot;Ok.&quot;（末尾带换行符）。从 18.12.13 版本起可用。另请参阅 `/replicas_status` 以检查副本延迟。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## 通过 HTTP/HTTPS 查询 \{#querying\}

要通过 HTTP/HTTPS 执行查询，有三种方式：

* 将请求作为 URL 的 `query` 参数发送
* 使用 POST 方法
* 在 `query` 参数中发送查询的开头部分，其余部分通过 POST 发送

:::note
URL 的大小默认限制为 1 MiB，可以通过 `http_max_uri_size` 设置进行更改。
:::

如果请求成功，将收到 200 响应码，查询结果包含在响应体中。
如果发生错误，将收到 500 响应码，错误描述文本包含在响应体中。

使用 GET 的请求是“只读”的。也就是说，对于会修改数据的查询，只能使用 POST 方法。
查询本身既可以放在 POST 请求体中，也可以放在 URL 参数中。下面来看一些示例。

在下面的示例中，使用 curl 发送查询 `SELECT 1`。请注意空格使用 URL 编码：`%20`。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

在此示例中，使用 wget 配合 `-nv`（non-verbose，非详细输出）和 `-O-` 参数将结果输出到终端。
在这种情况下，无需对空格进行 URL 编码：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

在此示例中，我们通过管道将一个原始 HTTP 请求传递给 netcat：

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
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

如你所见，`curl` 命令有些不便，因为空格必须进行 URL 转义。
虽然 `wget` 会自行对所有内容进行转义，但我们不建议使用它，因为在使用 keep-alive 和 Transfer-Encoding: chunked 时，它在 HTTP/1.1 上的表现并不好。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

如果查询的一部分通过参数发送，另一部分通过 POST 正文发送，这两部分数据之间会插入一个换行符。
例如，下面这种方式将无法工作：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

默认情况下，数据会以 [`TabSeparated`](/interfaces/formats/TabSeparated) 格式返回。

在查询中使用 `FORMAT` 子句可以请求其他任意格式。例如：

```bash title="command"
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

可以使用 `default_format` URL 参数或 `X-ClickHouse-Format` 请求头来指定一个不同于 `TabSeparated` 的默认格式。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

可以在使用 POST 方法时执行参数化查询。参数通过花括号指定参数名和类型，例如 `{name:Type}`。参数值通过 `param_name` 参数传递：

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## 通过 HTTP/HTTPS 执行 INSERT 查询 \\{#insert-queries\\}

用于传输数据的 `POST` 方法是执行 `INSERT` 查询所必需的。在这种情况下，你可以在 URL 参数中写入查询的开头部分，并使用 POST 传递要插入的数据。要插入的数据例如可以是来自 MySQL 的制表符分隔导出数据。通过这种方式，`INSERT` 查询可以替代 MySQL 中的 `LOAD DATA LOCAL INFILE`。

### 示例 \{#examples\}

要创建一张表：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

可以使用常见的 `INSERT` 查询来插入数据：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

若要将数据与查询分开发送：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

可以指定任意数据格式。例如，可以指定 &#39;Values&#39; 格式，它与执行 `INSERT INTO t VALUES` 时使用的格式相同：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

要从制表符分隔的转储文件中插入数据，请指定相应的格式：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

读取表的内容：

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
由于并行处理查询，数据的输出顺序是随机的。
:::

要删除该表：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

对于成功但不返回数据表的请求，将返回一个空的响应体。


## 压缩 \\{#compression\\}

在传输大量数据或创建会立即被压缩的转储文件时，可以使用压缩来减少网络流量。

在传输数据时，可以使用 ClickHouse 的内部压缩格式。压缩数据使用非标准格式，需要使用 `clickhouse-compressor` 程序来处理。该程序默认随 `clickhouse-client` 软件包一起安装。 

为提高数据写入效率，可以通过 [`http_native_compression_disable_checksumming_on_decompress`](../../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 设置来禁用服务器端在解压缩时的校验和验证。

如果在 URL 中指定 `compress=1`，服务器会压缩发送给客户端的数据。如果在 URL 中指定 `decompress=1`，服务器会对通过 `POST` 方法传入的数据进行解压缩。

也可以选择使用 [HTTP 压缩](https://en.wikipedia.org/wiki/HTTP_compression)。ClickHouse 支持以下[压缩方法](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

要发送压缩的 `POST` 请求，请在请求头中添加 `Content-Encoding: compression_method`。

为了让 ClickHouse 对响应进行压缩，请在请求中添加 `Accept-Encoding: compression_method` 头。 

可以使用 [`http_zlib_compression_level`](../../operations/settings/settings.md#http_zlib_compression_level) 设置来为所有压缩方法配置数据压缩级别。

:::info
某些 HTTP 客户端可能会默认解压缩来自服务器的数据（例如使用 `gzip` 和 `deflate`），因此即使正确使用了压缩设置，也可能会接收到已解压缩的数据。
:::

## 示例 \{#examples-compression\}

向服务器发送压缩数据：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

要从服务器获取压缩的数据存档：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

要从服务器接收压缩数据，并通过 gunzip 解压获取原始数据：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## 默认数据库 \{#default-database\}

可以使用 `database` URL 参数或 `X-ClickHouse-Database` 请求头来指定默认数据库。

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

默认情况下，会使用在服务器设置中注册的数据库作为默认数据库。系统默认提供的数据库名为 `default`。或者，你也可以在表名前加上“数据库名.” 来显式指定要使用的数据库。


## 身份验证 \{#authentication\}

可以通过三种方式之一来指定用户名和密码：

1. 使用 HTTP 基本身份验证。

例如：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. 在 `user` 和 `password` URL 参数中

:::warning
我们不建议使用此方法，因为这些参数可能会被 Web 代理服务器记录，并被浏览器缓存。
:::

例如：

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 使用 &#39;X-ClickHouse-User&#39; 和 &#39;X-ClickHouse-Key&#39; 请求头

例如：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

如果未指定用户名，则会使用名为 `default` 的用户。如果未指定密码，则使用空密码。
你还可以使用 URL 参数为处理单个查询或整个设置配置文件指定任意设置。

例如：

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

更多信息请参阅：

* [设置](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## 在 HTTP 协议中使用 ClickHouse 会话 \{#using-clickhouse-sessions-in-the-http-protocol\}

还可以在 HTTP 协议中使用 ClickHouse 会话。为此，需要在请求中添加 `session_id` `GET` 参数。可以使用任意字符串作为会话 ID。

默认情况下，会话在 60 秒无活动后终止。要更改此超时时间（单位为秒），请在服务器配置中修改 `default_session_timeout` 设置，或者在请求中添加 `session_timeout` `GET` 参数。

要检查会话状态，请使用 `session_check=1` 参数。单个会话在任意时刻只能执行一个查询。

可以在 `X-ClickHouse-Progress` 响应头中获取查询进度信息。为此，请启用 [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers)。

下面是一个响应头序列示例：

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

可能的头字段为：

| Header field         | Description  |
| -------------------- | ------------ |
| `read_rows`          | 已读取的行数。      |
| `read_bytes`         | 已读取的数据量（字节）。 |
| `total_rows_to_read` | 将要读取的总行数。    |
| `written_rows`       | 已写入的行数。      |
| `written_bytes`      | 已写入的数据量（字节）。 |
| `elapsed_ns`         | 查询运行时间（纳秒）。  |
| `memory_usage`       | 查询使用的内存（字节）。 |

如果 HTTP 连接丢失，正在运行的请求不会自动停止。解析和数据格式化在服务器端执行，此时通过网络传输可能效率不高。

存在以下可选参数：

| Parameters             | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | 可作为查询 ID 传入（任意字符串）。[`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | 可作为配额键传入（任意字符串）。[Quotas](/operations/quotas)                                                      |

HTTP 接口允许为查询传递外部数据（外部临时表）。有关更多信息，参见[“查询处理的外部数据”](/engines/table-engines/special/external-data)。


## 响应缓冲 \{#response-buffering\}

可以在服务端启用响应缓冲。为此提供了以下 URL 参数：

* `buffer_size`
* `wait_end_of_query`

可以使用以下设置：

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` 决定在服务器内存中缓冲的结果字节数。如果结果体大于此阈值，缓冲区中的内容会写入 HTTP 通道，剩余数据将直接发送到 HTTP 通道。

若要确保整个响应都被缓冲，请设置 `wait_end_of_query=1`。在这种情况下，未存储在内存中的数据将缓存在服务器的临时文件中。

例如：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
使用缓冲可以避免在 HTTP 状态码和响应头已经发送给客户端之后才发生查询处理错误的情况。在这种情况下，错误消息会被写入响应体末尾，客户端只能在解析响应时才能发现该错误。
:::


## 通过查询参数设置角色 \{#setting-role-with-query-parameters\}

此功能在 ClickHouse 24.4 中引入。

在某些特定场景下，在执行语句本身之前，可能需要先设置授予的角色。
然而，由于不支持多语句执行，无法将 `SET ROLE` 与该语句一并发送：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上述命令会报错：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

为了解决这一限制，请改用 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

这等同于在该语句执行前执行 `SET ROLE my_role`。

此外，还可以指定多个 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

在这种情况下，`?role=my_role&role=my_other_role` 的效果类似于在执行该语句之前先执行 `SET ROLE my_role, my_other_role`。


## HTTP 响应状态码注意事项 \{#http_response_codes_caveats\}

由于 HTTP 协议的限制，HTTP 200 响应状态码并不能保证查询成功执行。

下面是一个示例：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

这种行为的原因在于 HTTP 协议的特性。HTTP 头部会先以 200 的 HTTP 状态码发送，随后发送 HTTP body，然后错误会作为纯文本被注入到 body 中。

这种行为与所使用的格式无关，无论是 `Native`、`TSV` 还是 `JSON`，错误信息始终会出现在响应流的中间。

可以通过启用 `wait_end_of_query=1`（[Response Buffering](#response-buffering)）来缓解这个问题。在这种情况下，HTTP 头部的发送会延迟到整个查询完成之后。然而，这并不能完全解决问题，因为结果仍然必须被完整容纳在 [`http_response_buffer_size`](../../operations/settings/settings.md#http_response_buffer_size) 所限制的大小之内，而且诸如 [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers) 之类的其他设置可能会影响头部发送的延迟。

:::tip
捕获所有错误的唯一方法，是在使用所需格式解析之前先分析 HTTP body。
:::

在 ClickHouse 中，此类异常在 `http_write_exception_in_output_format=0`（默认）时，无论使用哪种格式（例如 `Native`、`TSV`、`JSON` 等），其异常格式都如下面所示且保持一致，这使得在客户端解析和提取错误消息变得更加容易。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

其中 `<TAG>` 是一个 16 字节的随机标记，与响应头 `X-ClickHouse-Exception-Tag` 中发送的标记相同。
`<error message>` 是实际的异常消息（其精确长度可从 `<message_length>` 中获得）。如上所述，整个异常块的大小最多可达 16 KiB。

下面是一个 `JSON` 格式的示例

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

下面是一个类似的示例，不过采用 `CSV` 格式


```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

__exception__
rumfyutuqkncbgau
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
__exception__
```


## 带参数的查询 \\{#cli-queries-with-parameters\\}

可以创建带参数的查询，并通过相应的 HTTP 请求参数传递这些参数的值。要了解更多信息，请参阅 [CLI 中的带参数查询](../../interfaces/cli.md#cli-queries-with-parameters)。

### 示例 \{#example-3\}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```


### URL 参数中的制表符 \{#tabs-in-url-parameters\}

查询参数会从“转义”的格式中解析出来。这样做有一些好处，例如可以将 null 明确地解析为 `\N`。这意味着制表符应编码为 `\t`（或 `\` 加一个制表符）。例如，下面的示例在 `abc` 和 `123` 之间包含一个实际的制表符，输入字符串会被拆分成两个值：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

但是，如果你在 URL 参数中尝试使用 `%09` 来编码一个实际的 Tab 字符，它是不会被正确解析的：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

如果使用 URL 参数，需要将 `\t` 编码为 `%5C%09`。例如：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 预定义 HTTP 接口 \{#predefined_http_interface\}

ClickHouse 通过 HTTP 接口支持特定类型的查询。例如，可以通过以下方式向表中写入数据：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse 还支持预定义 HTTP 接口，这有助于更轻松地与第三方工具集成，例如 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)。下面来看一个示例。

首先，在服务器配置文件中添加以下配置段。

`http_handlers` 被配置为包含多条 `rule`。ClickHouse 会将接收到的 HTTP 请求与 `rule` 中预定义的类型进行匹配，由第一个匹配成功的规则运行其处理程序。匹配成功后，ClickHouse 将执行该规则中对应的预定义查询。

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

现在，您可以直接请求此 URL，以 Prometheus 格式获取数据：

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

# HELP "Merge" "Number of executing background merges"
# TYPE "Merge" counter
"Merge" 0

# HELP "PartMutation" "Number of mutations (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0

# HELP "ReplicatedFetch" "Number of data parts being fetched from replica"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0

# HELP "ReplicatedSend" "Number of data parts being sent to replicas"
# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

`http_handlers` 的配置选项含义如下。

`rule` 可以配置以下参数：

* `method`
* `headers`
* `url`
* `full_url`
* `handler`

每个参数将在下文分别说明：


- `method` 负责匹配 HTTP 请求中的 method 部分。`method` 完全符合 HTTP 协议中 [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) 的定义。这是一个可选配置项。如果在配置文件中未定义，则不会对 HTTP 请求的 method 部分进行匹配。

- `url` 负责匹配 HTTP 请求中 URL 部分（path 和 query string）。
  如果 `url` 以 `regex:` 作为前缀，则按 [RE2](https://github.com/google/re2) 的正则表达式进行匹配。
  这是一个可选配置项。如果在配置文件中未定义，则不会对 HTTP 请求的 URL 部分进行匹配。

- `full_url` 与 `url` 类似，但包含完整的 URL，即 `schema://host:port/path?query_string`。
  注意，ClickHouse 不支持 "virtual hosts"，因此 `host` 是 IP 地址（而不是 `Host` 头中的值）。

- `empty_query_string` — 确保请求中没有 query string（`?query_string`）

- `headers` 负责匹配 HTTP 请求中的 header 部分。它兼容 RE2 的正则表达式。这是一个可选配置项。
  如果在配置文件中未定义，则不会对 HTTP 请求的 header 部分进行匹配。

- `handler` 包含主要的处理逻辑。

  它可以具有以下 `type`：
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  以及以下参数：
  - `query` — 与 `predefined_query_handler` 类型一起使用，在调用 handler 时执行查询。
  - `query_param_name` — 与 `dynamic_query_handler` 类型一起使用，从 HTTP 请求参数中提取并执行与 `query_param_name` 对应的参数值。
  - `status` — 与 `static` 类型一起使用，响应状态码。
  - `content_type` — 可与任意类型一起使用，响应的 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)。
  - `http_response_headers` — 可与任意类型一起使用，响应头映射（map）。也可用于设置 content type。
  - `response_content` — 与 `static` 类型一起使用，要发送给客户端的响应内容。当使用前缀 `file://` 或 `config://` 时，从文件或配置中读取内容并发送给客户端。
  - `user` - 用于执行查询的用户（默认用户为 `default`）。
    **注意**，无需为该用户指定密码。

不同 `type` 的配置方式将在下文进行介绍。

### predefined&#95;query&#95;handler \\{#predefined&#95;query&#95;handler\\}

`predefined_query_handler` 支持设置 `Settings` 和 `query_params` 的值。你可以在 `predefined_query_handler` 类型中配置 `query`。

`query` 的值是 `predefined_query_handler` 的预定义查询，当某个 HTTP 请求被匹配时，该查询会由 ClickHouse 执行，并返回查询结果。这是一个必需的配置。

以下示例定义了 [`max_threads`](../../operations/settings/settings.md#max_threads) 和 [`max_final_threads`](../../operations/settings/settings.md#max_final_threads) 这两个设置项的值，然后查询系统表来检查这些设置项是否已成功生效。

:::note
要保留 `query`、`play`、`ping` 等默认 `handlers`，请添加 `<defaults/>` 规则。
:::

例如：

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


#### 虚拟参数 `_request_body` \\{#virtual-param-request-body\\}

除了 URL 参数、请求头和查询参数之外，`predefined_query_handler` 还支持一个特殊的虚拟参数 `_request_body`。
它包含原始的 HTTP 请求体（字符串形式）。
这使你可以创建灵活的 REST API，在查询中接收任意数据格式并进行处理。

例如，你可以使用 `_request_body` 实现一个 REST 端点，在 POST 请求中接收 JSON 数据并将其插入到表中：

```yaml
<http_handlers>
    <rule>
        <methods>POST</methods>
        <url>/api/events</url>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                INSERT INTO events (id, data)
                SELECT {id:UInt32}, {_request_body:String}
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

之后即可向此端点发送数据：

```bash
curl -X POST 'http://localhost:8123/api/events?id=123' \
  -H 'Content-Type: application/json' \
  -d '{"user": "john", "action": "login", "timestamp": "2024-01-01T10:00:00Z"}'
```

:::note
每个 `predefined_query_handler` 仅支持一个 `query`。
:::


### dynamic&#95;query&#95;handler \{#dynamic_query_handler\}

在 `dynamic_query_handler` 中，查询语句以 HTTP 请求参数的形式编写。不同之处在于，在 `predefined_query_handler` 中，查询语句是写在配置文件里的。可以在 `dynamic_query_handler` 中配置 `query_param_name`。

ClickHouse 会从 HTTP 请求的 URL 中提取并执行与 `query_param_name` 值对应的内容。`query_param_name` 的默认值是 `/query`。这是一个可选配置。如果在配置文件中没有定义该项，则不会在 URL 中传递此参数。

为了体验此功能，下面的示例定义了 [`max_threads`](../../operations/settings/settings.md#max_threads) 和 `max_final_threads` 的值，并通过查询验证这些设置是否已成功生效。

示例：

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


### static \{#static\}

`static` 可用于返回 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 和 `response_content`。其中，`response_content` 会返回指定的内容。

例如，要返回消息 “Say Hi!”：

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

可以使用 `http_response_headers` 来设置内容类型，而无需使用 `content_type`。

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
                <response_content>Say Hi!</response_content>
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

从配置中读取内容并返回给客户端。

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

若要在发送给客户端的文件中查找内容：

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


### redirect \{#redirect\}

`redirect` 会执行一次到 `location` 的 `302` 重定向。

例如，下面展示了如何在 ClickHouse play 中自动为 `play` 添加 set user：

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


## HTTP 响应头 \{#http-response-headers\}

ClickHouse 允许配置自定义 HTTP 响应头，这些响应头可以应用到任何可配置的处理程序上。可以使用 `http_response_headers` 来设置这些响应头，该设置接收表示响应头名称及其值的键值对。此功能对于在 ClickHouse 的 HTTP 接口中统一实现自定义安全响应头、CORS 策略或其他任何 HTTP 响应头需求特别有用。

例如，可以为以下内容配置响应头：

* 常规查询端点
* Web UI
* 健康检查

也可以指定 `common_http_response_headers`。这些设置将应用于配置中定义的所有 HTTP 处理程序。

对于每一个已配置的处理程序，这些响应头都会包含在 HTTP 响应中。

在下面的示例中，每个服务器响应都会包含两个自定义响应头：`X-My-Common-Header` 和 `X-My-Custom-Header`。

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>Common header</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>Custom indeed</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP 流式传输过程中异常的有效 JSON/XML 响应 \{#valid-output-on-exception-http-streaming\}

在通过 HTTP 执行查询时，即使部分数据已经发送，仍有可能发生异常。通常，异常会以纯文本形式发送给客户端。
这意味着即便使用了某种特定的数据格式来输出数据，输出结果也可能在该数据格式的语义上变得无效。
为避免这种情况，可以使用 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) 设置（默认禁用），该设置会指示 ClickHouse 按指定格式写出异常信息（当前支持 XML 和 JSON* 格式）。

示例：

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
