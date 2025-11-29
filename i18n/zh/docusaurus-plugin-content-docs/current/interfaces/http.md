---
description: 'ClickHouse HTTP 接口的文档。该接口提供 REST API，可从任意平台和编程语言访问 ClickHouse'
sidebar_label: 'HTTP 接口'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP 接口'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP 接口 {#http-interface}



## 前置条件 {#prerequisites}

要完成本文中的示例，你需要：
- 一个处于运行状态的 ClickHouse 服务器实例
- 已安装 `curl`。在 Ubuntu 或 Debian 上，运行 `sudo apt install curl`，或参阅此[文档](https://curl.se/download.html)获取安装说明。



## 概览 {#overview}

HTTP 接口以 REST API 的形式提供服务，让你可以在任何平台、使用任何编程语言来使用 ClickHouse。HTTP 接口相比原生接口功能更有限，但对各类编程语言有更好的支持。

默认情况下，`clickhouse-server` 监听以下端口：

* 端口 8123：HTTP
* 端口 8443：可启用 HTTPS

如果在没有任何参数的情况下发出 `GET /` 请求，会返回 200 状态码以及字符串 &quot;Ok.&quot;：

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; 是在 [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) 中定义的默认值，可根据需要进行修改。

另请参阅：[HTTP 响应码注意事项](#http_response_codes_caveats)。


## Web 用户界面 {#web-ui}

ClickHouse 提供了一个 Web 用户界面，可通过以下地址访问：

```text
http://localhost:8123/play
```

Web UI 支持在查询运行期间显示进度、取消查询以及对结果进行流式输出。
它还有一个隐藏功能，用于展示查询管线的图表和可视化。

成功执行查询后，会出现一个下载按钮，允许你以多种格式下载查询结果，包括 CSV、TSV、JSON、JSONLines、Parquet、Markdown，或 ClickHouse 支持的任意自定义格式。下载功能使用查询缓存高效地获取结果，而无需重新执行查询。即使 UI 只显示了多页结果中的一页，它也会下载完整的结果集。

Web UI 专为像你这样的专业用户设计。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI 截图" />

在健康检查脚本中使用 `GET /ping` 请求。此处理程序始终返回 “Ok.”（末尾带有换行符）。从 18.12.13 版本起可用。另请参阅 `/replicas_status` 用于检查副本延迟。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## 通过 HTTP/HTTPS 查询 {#querying}

要通过 HTTP/HTTPS 执行查询，有三种方式：

* 将请求作为 URL 的 `query` 参数发送
* 使用 POST 方法
* 在 `query` 参数中发送查询的开头部分，其余部分通过 POST 发送

:::note
URL 的长度默认限制为 1 MiB，可通过 `http_max_uri_size` 设置进行修改。
:::

如果请求成功，会返回状态码 200，并在响应体中包含结果。
如果发生错误，会返回状态码 500，并在响应体中包含错误描述文本。

使用 GET 的请求是“只读”的。这意味着对于修改数据的查询，只能使用 POST 方法。
查询语句本身既可以放在 POST 请求体中，也可以放在 URL 参数中。下面来看一些示例。

在下面的示例中，使用 curl 发送查询 `SELECT 1`。请注意空格的 URL 编码：`%20`。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

在本示例中，wget 使用 `-nv`（非详细输出）和 `-O-` 参数将结果输出到终端。
在这种情况下，无需对空格进行 URL 编码：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

在本示例中，我们将原始 HTTP 请求通过管道送入 netcat：

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

可以看到，`curl` 命令有些不便，因为空格必须进行 URL 编码。
虽然 `wget` 会自行对所有内容进行转义，但我们不推荐使用它，因为在使用 keep-alive 和 `Transfer-Encoding: chunked` 的 HTTP/1.1 连接中，它的表现并不好。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

如果查询的一部分通过参数传递，另一部分通过 POST 发送，这两部分数据之间会被插入一个换行符。
例如，下面这样将不起作用：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: 语法错误：位置 0 失败：SEL
ECT 1
，期望的关键字：SHOW TABLES、SHOW DATABASES、SELECT、INSERT、CREATE、ATTACH、RENAME、DROP、DETACH、USE、SET、OPTIMIZE.，e.what() = DB::Exception
```

默认情况下，数据以 [`TabSeparated`](/interfaces/formats/TabSeparated) 格式返回。

在查询中使用 `FORMAT` 子句可以请求其他格式。例如：

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

可以通过 `default_format` URL 参数或 `X-ClickHouse-Format` 请求头来指定一个不同于 `TabSeparated` 的默认格式。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

你可以使用 POST 方法发送参数化查询。参数通过花括号加参数名和类型来指定，例如 `{name:Type}`。参数值通过对应的 `param_name` 传递：

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## 通过 HTTP/HTTPS 执行 INSERT 查询 {#insert-queries}

在执行 `INSERT` 查询时，需要使用用于传输数据的 `POST` 方法。在这种情况下，可以在 URL 参数中写入查询的开头部分，并使用 POST 传递要插入的数据。要插入的数据可以是例如来自 MySQL 的制表符分隔导出数据。通过这种方式，`INSERT` 查询可以替代 MySQL 中的 `LOAD DATA LOCAL INFILE`。

### 示例 {#examples}

创建一张表：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

要使用熟悉的 `INSERT` 查询插入数据：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

如果要将数据与查询分开发送：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

可以指定任意数据格式。例如，可以指定 `Values` 格式，它与执行 `INSERT INTO t VALUES` 时使用的格式相同：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

要从制表符分隔的转储文件中插入数据，请指定对应的格式：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

要查看该表的内容：

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
由于并行查询处理，数据的输出顺序是随机的
:::

要删除该表：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

对于成功但不返回数据表的请求，将返回空响应体。


## 压缩 {#compression}

压缩可用于在传输大量数据时减少网络流量，也可用于创建直接以压缩形式保存的转储文件。

在传输数据时，可以使用 ClickHouse 的内部压缩格式。压缩后的数据采用非标准格式，必须使用 `clickhouse-compressor` 程序进行处理。该程序默认随 `clickhouse-client` 包一起安装。 

为提高数据写入效率，可以通过 [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 设置禁用服务端在解压时的校验和验证。

如果在 URL 中指定 `compress=1`，服务端会压缩发送给客户端的数据。如果在 URL 中指定 `decompress=1`，服务端会解压通过 `POST` 方法传入的数据。

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

要让 ClickHouse 压缩响应，请在请求中添加 `Accept-Encoding: compression_method` 请求头。 

可以使用 [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 设置为所有压缩方法配置数据压缩级别。

:::info
某些 HTTP 客户端可能会默认解压来自服务器的数据（例如使用 `gzip` 和 `deflate` 时），因此即使正确配置了压缩设置，仍有可能收到已解压的数据。
:::



## 示例 {#examples-compression}

要向服务器发送压缩后的数据：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

要从服务器接收压缩的数据归档：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

从服务器接收压缩数据，并使用 gunzip 解压得到原始数据：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## 默认数据库 {#default-database}

你可以使用 `database` URL 参数或 `X-ClickHouse-Database` 请求头来指定默认数据库。

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

默认情况下，服务器设置中登记的数据库会被用作默认数据库。开箱即用时，该数据库名为 `default`。另外，你也可以通过在表名前加上“数据库名.” 的方式来显式指定要使用的数据库。


## 认证 {#authentication}

可以通过以下三种方式之一指定用户名和密码：

1. 使用 HTTP Basic 认证。

例如：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. 在 URL 的 `user` 和 `password` 参数中

:::warning
我们不建议使用此方法，因为这些参数可能会被 web 代理记录，并缓存到浏览器中
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

如果未指定用户名，则使用 `default` 用户名。如果未指定密码，则使用空密码。
你还可以使用 URL 参数，为单个查询的处理或整个设置配置文件指定任意设置。

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

如需了解更多信息，请参见：

* [设置](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## 在 HTTP 协议中使用 ClickHouse 会话 {#using-clickhouse-sessions-in-the-http-protocol}

你也可以在 HTTP 协议中使用 ClickHouse 会话。为此，需要在请求中添加 `session_id` `GET` 参数。你可以使用任意字符串作为会话 ID。

默认情况下，会话在 60 秒无活动后终止。要更改此超时时间（以秒为单位），请在服务器配置中修改 `default_session_timeout` 设置，或在请求中添加 `session_timeout` `GET` 参数。

要检查会话状态，请使用 `session_check=1` 参数。同一会话在任意时刻只能执行一个查询。

你可以在 `X-ClickHouse-Progress` 响应头中获取查询进度信息。为此，请启用 [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)。

下面是一个报文头顺序示例：

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

可能的头部字段为：

| Header field         | Description  |
| -------------------- | ------------ |
| `read_rows`          | 已读取的行数。      |
| `read_bytes`         | 已读取的数据量（字节）。 |
| `total_rows_to_read` | 将要读取的总行数。    |
| `written_rows`       | 已写入的行数。      |
| `written_bytes`      | 已写入的数据量（字节）。 |
| `elapsed_ns`         | 查询运行时间（纳秒）。  |
| `memory_usage`       | 查询使用的内存（字节）。 |

当 HTTP 连接丢失时，正在运行的请求不会自动停止。解析和数据格式化在服务器端执行，此时通过网络传输数据可能并不高效。

支持以下可选参数：

| Parameters             | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | 可作为查询 ID 传递（任意字符串）。[`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | 可作为配额键传递（任意字符串）。[“配额 (Quotas)”](/operations/quotas)                                               |

HTTP 接口允许传递外部数据（外部临时表）用于查询。更多信息请参见[“用于查询处理的外部数据”](/engines/table-engines/special/external-data)。


## 响应缓冲 {#response-buffering}

可以在服务端启用响应缓冲。为此可使用以下 URL 参数：

* `buffer_size`
* `wait_end_of_query`

可以使用以下设置：

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` 用于指定在服务器内存中对结果进行缓冲的字节数。如果结果体大于此阈值，当前缓冲内容会被写入 HTTP 通道，其余数据将直接发送到 HTTP 通道。

要确保整个响应都被缓冲，请设置 `wait_end_of_query=1`。在这种情况下，未存储在内存中的数据会缓存在服务器的临时文件中。

例如：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
使用缓冲可以避免出现这样一种情况：在已经向客户端发送响应状态码和 HTTP 头之后，查询处理才发生错误。在这种情况下，错误消息会被写入响应正文的末尾，而在客户端只能在解析阶段才能检测到该错误。
:::


## 使用查询参数设置角色 {#setting-role-with-query-parameters}

该功能在 ClickHouse 24.4 中引入。

在某些特定场景下，可能需要在执行语句本身之前先设置已授予的角色。
但是，无法同时发送 `SET ROLE` 和该语句，因为不支持多语句：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上面的命令会报错：

```sql
代码:62. DB::Exception:语法错误(不允许使用多条语句)
```

要规避这一限制，请改用 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

这相当于在该语句前执行 `SET ROLE my_role`。

此外，也可以指定多个 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

在这种情况下，`?role=my_role&role=my_other_role` 与在执行该语句之前运行 `SET ROLE my_role, my_other_role` 的效果类似。


## HTTP 响应状态码注意事项 {#http_response_codes_caveats}

由于 HTTP 协议的限制，HTTP 200 响应状态码并不能保证查询一定成功。

下面是一个示例：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   正在尝试连接 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
代码: 395. DB::Exception: 传递给 'throwIf' 函数的值为非零值: 执行 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))' 时发生错误
```

出现这种行为的原因在于 HTTP 协议的特性。HTTP 首先会发送状态码为 200 的 HTTP 头部，然后是 HTTP body，接着错误会作为纯文本被注入到 body 中。

这种行为与所使用的格式无关，无论是 `Native`、`TSV` 还是 `JSON`，错误信息始终会出现在响应流的中间部分。

你可以通过开启 `wait_end_of_query=1`（[响应缓冲](#response-buffering)）来缓解这个问题。在这种情况下，HTTP 头部的发送会被推迟到整个查询完成之后。然而，这并不能完全解决问题，因为结果仍然必须放入 [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) 限制之内，并且像 [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers) 这样的其他设置可能会干扰头部发送的延迟。

:::tip
捕获所有错误的唯一方法，是在使用所需格式进行解析之前，先分析 HTTP body。
:::

在 ClickHouse 中，此类异常在 `http_write_exception_in_output_format=0`（默认）时，无论使用哪种格式（例如 `Native`、`TSV`、`JSON` 等），其异常格式都是一致的。这使得在客户端解析并提取错误消息变得更加容易。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<错误信息>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

其中 `<TAG>` 是一个 16 字节的随机标记，与在响应头 `X-ClickHouse-Exception-Tag` 中发送的标记相同。
`<error message>` 是实际的异常信息（其精确长度可在 `<message_length>` 中找到）。上述整个异常块的大小最多为 16 KiB。

下面是一个 `JSON` 格式的示例。

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

下面是一个类似的示例，不过使用 `CSV` 格式

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0
```


**异常**
rumfyutuqkncbgau
Code: 395. DB::Exception: 传递给 &#39;throwIf&#39; 函数的值为非零：在执行 &#39;FUNCTION throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8) :: 1) -&gt; throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8)) UInt8 : 0&#39; 时。(FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
**异常**

```
```


## 参数化查询 {#cli-queries-with-parameters}

可以创建参数化查询，并通过相应 HTTP 请求中的参数为其传递值。欲了解更多信息，请参阅[CLI 参数化查询](../interfaces/cli.md#cli-queries-with-parameters)。

### 示例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URL 参数中的制表符 {#tabs-in-url-parameters}

查询参数是从“转义”格式中解析的。这样做有一些好处，比如可以将空值明确地解析为 `\N`。这意味着制表符应编码为 `\t`（或 `\` 加一个制表符）。例如，下面的字符串在 `abc` 和 `123` 之间包含一个实际的制表符，输入字符串会被拆分成两个值：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

但是，如果你尝试在 URL 参数中使用 `%09` 来编码一个实际的 Tab 字符，它将无法被正确解析：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
代码:457. DB::Exception:查询参数 'arg1' 的值 abc    123 无法解析为 String 类型,原因是解析不完整:7 字节中仅解析了 3 字节:abc。(BAD_QUERY_PARAMETER)(版本 23.4.1.869(官方构建))
```

如果您使用 URL 参数，则需要将 `\t` 编码为 `%5C%09`。例如：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 预定义的 HTTP 接口 {#predefined_http_interface}

ClickHouse 通过 HTTP 接口支持特定查询。例如，可以通过以下方式向表中写入数据：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse 还支持预定义 HTTP 接口（Predefined HTTP Interface），可以帮助你更轻松地与第三方工具集成，比如 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)。下面来看一个示例。

首先，将以下配置段添加到你的服务器配置文件中。

`http_handlers` 被配置为包含多个 `rule`。ClickHouse 会将收到的 HTTP 请求与 `rule` 中预定义的类型进行匹配，并运行第一个匹配到的处理器。如果匹配成功，ClickHouse 随后会执行对应的预定义查询。

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

现在可以直接通过该 URL 请求 Prometheus 格式的数据：


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
# HELP "Query" "Number of executing queries" {#help-query-number-of-executing-queries}
# TYPE "Query" counter {#type-query-counter}
"Query" 1
```


# HELP "Merge" "后台正在执行的合并数量" {#help-merge-number-of-executing-background-merges}
# TYPE "Merge" counter {#type-merge-counter}
"Merge" 0



# HELP "PartMutation" "Mutation 操作次数（ALTER DELETE/UPDATE）" {#help-partmutation-number-of-mutations-alter-deleteupdate}
# TYPE "PartMutation" counter {#type-partmutation-counter}
"PartMutation" 0



# HELP "ReplicatedFetch" "正在从副本拉取的数据分片数量" {#help-replicatedfetch-number-of-data-parts-being-fetched-from-replica}
# TYPE "ReplicatedFetch" counter {#type-replicatedfetch-counter}
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;正在发送到副本的数据分片数量&quot; {#help-replicatedsend-number-of-data-parts-being-sent-to-replicas}

# TYPE &quot;ReplicatedSend&quot; counter {#type-replicatedsend-counter}

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
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) 的定义。此为可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的方法部分。

- `url` 负责匹配 HTTP 请求的 URL 部分(路径和查询字符串)。
  如果 `url` 以 `regex:` 为前缀,则需使用 [RE2](https://github.com/google/re2) 正则表达式。
  此为可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的 URL 部分。

- `full_url` 与 `url` 相同,但包含完整的 URL,即 `schema://host:port/path?query_string`。
  注意,ClickHouse 不支持"虚拟主机",因此 `host` 为 IP 地址(而非 `Host` 头的值)。

- `empty_query_string` - 确保请求中不包含查询字符串(`?query_string`)

- `headers` 负责匹配 HTTP 请求的头部分。它兼容 RE2 正则表达式。此为可选配置。如果在配置文件中未定义,则不会匹配 HTTP 请求的头部分。

- `handler` 包含主要的处理逻辑。

  它可以具有以下 `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  以及以下参数:
  - `query` — 与 `predefined_query_handler` 类型配合使用,在调用处理程序时执行查询。
  - `query_param_name` — 与 `dynamic_query_handler` 类型配合使用,提取并执行 HTTP 请求参数中与 `query_param_name` 值对应的值。
  - `status` — 与 `static` 类型配合使用,指定响应状态码。
  - `content_type` — 与任何类型配合使用,指定响应的 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)。
  - `http_response_headers` — 与任何类型配合使用,指定响应头映射。也可用于设置内容类型。
  - `response_content` — 与 `static` 类型配合使用,指定发送给客户端的响应内容。当使用前缀 'file://' 或 'config://' 时,从文件或配置中查找内容并发送给客户端。
  - `user` - 执行查询的用户(默认用户为 `default`)。
    **注意**,无需为此用户指定密码。

接下来将讨论不同 `type` 的配置方法。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` 支持设置 `Settings` 和 `query_params` 值。您可以在 `predefined_query_handler` 类型中配置 `query`。

`query` 值是 `predefined_query_handler` 的预定义查询,当 HTTP 请求匹配时由 ClickHouse 执行并返回查询结果。此为必需配置。

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
在一个 `predefined_query_handler` 中仅支持一个 `query`。
:::

### dynamic&#95;query&#95;handler {#dynamic_query_handler}

在 `dynamic_query_handler` 中，查询通过 HTTP 请求参数传递。不同之处在于，在 `predefined_query_handler` 中，查询是写在配置文件中的。`query_param_name` 可以在 `dynamic_query_handler` 中进行配置。

ClickHouse 会从 HTTP 请求的 URL 中提取并执行对应于 `query_param_name` 的值。`query_param_name` 的默认值是 `/query`。这是一个可选配置。如果在配置文件中没有定义，则不会传入该参数。

要测试此功能，下面的示例会设置 [`max_threads`](../operations/settings/settings.md#max_threads) 和 `max_final_threads` 的值，并通过查询验证这些设置是否成功生效。

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

### static {#static}

`static` 可以返回 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 和 `response_content`。其中，`response_content` 用于返回指定的内容。

例如，要返回消息 &quot;Say Hi!&quot;：

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

在发送给客户端的配置中查找内容。

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

要在发送给客户端的文件中查找内容：


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
$ sudo echo "<html><body>相对路径文件</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>绝对路径文件</body></html>" > $user_files_path/absolute_path_file.html
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
<html><body>绝对路径文件</body></html>
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
<html><body>相对路径文件</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` 会将请求以 `302` 状态码重定向到 `location`

例如，下面展示了如何在 ClickHouse Play 中自动将用户设置为 `play`：

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

ClickHouse 允许配置自定义的 HTTP 响应头，这些响应头可以应用于任何可配置的处理程序。可以通过 `http_response_headers` 设置这些响应头，该设置接受表示响应头名称及其值的键值对。此功能对于实现自定义安全响应头、CORS 策略，或在 ClickHouse HTTP 接口中统一满足其他 HTTP 响应头需求特别有用。

例如，可以为以下内容配置响应头：

* 常规查询端点
* Web UI
* 健康检查。

也可以指定 `common_http_response_headers`。这些设置将应用于配置中定义的所有 HTTP 处理程序。

这些响应头会包含在每个已配置处理程序的 HTTP 响应中。

在下面的示例中，每个服务器响应都将包含两个自定义响应头：`X-My-Common-Header` 和 `X-My-Custom-Header`。

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>通用标头</X-My-Common-Header>
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


## 在 HTTP 流式传输期间出现异常时返回合法的 JSON/XML 响应 {#valid-output-on-exception-http-streaming}

当通过 HTTP 执行查询时，即便部分数据已经发送，仍然可能会抛出异常。通常情况下，异常会以纯文本的形式发送给客户端。
即便使用了特定的数据格式来输出数据，发生这种情况时，输出结果在该数据格式规范上可能变为不合法。
为避免这种情况，可以通过设置 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)（默认禁用），让 ClickHouse 按指定格式写出异常（当前支持 XML 和 JSON* 格式）。

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

    "exception": "代码: 395. DB::Exception: 传递给 'throwIf' 函数的值为非零值: 执行 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1' 时。(FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (版本 23.8.1.1)"
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
