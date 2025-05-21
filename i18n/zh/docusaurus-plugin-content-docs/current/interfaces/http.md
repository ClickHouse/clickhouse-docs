---
'description': 'ClickHouse中用于提供REST API访问的HTTP接口文档，可从任何平台和编程语言访问ClickHouse'
'sidebar_label': 'HTTP接口'
'sidebar_position': 15
'slug': '/interfaces/http'
'title': 'HTTP Interface'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP 接口

## 先决条件 {#prerequisites}

在本文中的示例中，您需要：
- 拥有一个正在运行的 ClickHouse 服务器实例
- 安装 `curl`。在 Ubuntu 或 Debian 上，运行 `sudo apt install curl` 或参考此 [文档](https://curl.se/download.html) 以获取安装说明。

## 概述 {#overview}

HTTP 接口让您可以在任何平台上通过任何编程语言以 REST API 的形式使用 ClickHouse。HTTP 接口的功能比原生接口更有限，但它的语言支持更好。

默认情况下，`clickhouse-server` 在以下端口监听：
- HTTP 的 8123 端口
- HTTPS 的 8443 端口可以启用

如果您进行 `GET /` 请求而不带任何参数，将返回 200 响应代码以及字符串 "Ok."：

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." 是在 [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) 中定义的默认值，并可以根据需要更改。

另请参见：[HTTP 响应代码注意事项](#http_response_codes_caveats)。

## Web 用户界面 {#web-ui}

ClickHouse 包含一个 web 用户界面，可以通过以下地址访问：

```text
http://localhost:8123/play`
```

Web UI 支持在查询运行时显示进度、查询取消和结果流传输。
它还有一个秘密功能，用于显示查询管道的图表和图形。

Web UI 是为像您这样的专业人士设计的。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI 截图" />

在健康检查脚本中使用 `GET /ping` 请求。此处理程序始终返回 "Ok."（最后带有换行符）。在版本 18.12.13 中可用。另请参见 `/replicas_status` 以检查副本的延迟。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

## 通过 HTTP/HTTPS 查询 {#querying}

通过 HTTP/HTTPS 查询有三种选择：
- 将请求作为 URL 的 'query' 参数发送
- 使用 POST 方法。
- 在 'query' 参数中发送查询的开头，其余部分使用 POST 发送

:::note
默认情况下，URL 的大小限制为 1 MiB，这可以通过 `http_max_uri_size` 设置更改。
:::

如果成功，您将收到 200 响应代码和响应体中的结果。
如果发生错误，您将收到 500 响应代码和响应体中的错误描述文本。

使用 GET 的请求是“只读”的。这意味着对于修改数据的查询，您只能使用 POST 方法。
您可以将查询本身发送到 POST 的主体中或 URL 参数中。让我们来看一些示例。

在以下示例中，使用 curl 发送查询 `SELECT 1`。请注意空格的 URL 编码：`%20`。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

在这个例子中，使用 wget 结合 `-nv`（非详细）和 `-O-` 参数将结果输出到终端。
在这种情况下，不需要对空格进行 URL 编码：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

在这个示例中，我们将原始 HTTP 请求管道到 netcat：

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

正如你所看到的，`curl` 命令在空格需要 URL 转义这一点上有些不方便。
尽管 `wget` 自行转义所有内容，但我们不推荐使用它，因为在使用 Keep-Alive 和 Transfer-Encoding: chunked 时它在 HTTP 1.1 中表现不佳。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

如果查询的一部分在参数中发送，另一部分在 POST 中发送，这两部分数据之间会插入一个换行符。
例如，这样做是行不通的：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

默认情况下，数据以 [`TabSeparated`](formats.md#tabseparated) 格式返回。

在查询中使用 `FORMAT` 子句请求其他格式。例如：

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

您可以使用 `default_format` URL 参数或 `X-ClickHouse-Format` 头部来指定除 `TabSeparated` 以外的默认格式。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

## 通过 HTTP/HTTPS 插入查询 {#insert-queries}

通过 `POST` 方法传输数据对于 `INSERT` 查询是必要的。在这种情况下，您可以在 URL 参数中编写查询的开头，并使用 POST 传递要插入的数据。要插入的数据可以是来自 MySQL 的制表符分隔转储。以这种方式，`INSERT` 查询替代了 MySQL 的 `LOAD DATA LOCAL INFILE`。

### 示例 {#examples}

创建一个表：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

使用熟悉的 `INSERT` 查询插入数据：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

单独发送数据而不带查询：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

可以指定任何数据格式。例如，可以指定与 `INSERT INTO t VALUES` 相同格式的 `Values` 格式：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

要从制表符分隔的转储中插入数据，指定相应的格式：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

读取表内容：

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
由于并行查询处理，数据以随机顺序输出。
:::

要删除表：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

对于成功的请求，如果不返回数据表，则会返回一个空的响应体。

## 压缩 {#compression}

在传输大量数据时，可以使用压缩来减少网络流量，或用于创建立即压缩的转储。

在传输数据时，您可以使用内部 ClickHouse 压缩格式。压缩数据具有非标准格式，需要使用 `clickhouse-compressor` 程序来处理它。它会与 `clickhouse-client` 包默认安装。

要提高数据插入的效率，请使用 [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 设置禁用服务器端校验和验证。

如果您在 URL 中指定 `compress=1`，则服务器将压缩发送给您的数据。如果您在 URL 中指定 `decompress=1`，则服务器将解压您通过 POST 方法传递的数据。

您还可以选择使用 [HTTP 压缩](https://en.wikipedia.org/wiki/HTTP_compression)。ClickHouse 支持以下 [压缩方法](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

要发送压缩的 `POST` 请求，请在请求头中添加 `Content-Encoding: compression_method`。

为了让 ClickHouse 压缩响应，请使用 [`enable_http_compression`](../operations/settings/settings.md#enable_http_compression) 设置以启用压缩，并在请求中附加 `Accept-Encoding: compression_method` 头。

您可以使用 [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 设置配置所有压缩方法的数据压缩级别。

:::info
某些 HTTP 客户端可能默认会解压来自服务器的数据（使用 `gzip` 和 `deflate`），即使您正确使用了压缩设置，您也可能会获得解压后的数据。
:::

## 示例 {#examples-compression}

向服务器发送压缩数据：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

从服务器接收压缩数据归档：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

从服务器接收压缩数据，使用 gunzip 接收解压数据：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## 默认数据库 {#default-database}

您可以使用 `database` URL 参数或 `X-ClickHouse-Database` 头来指定默认数据库。

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

默认情况下，注册在服务器设置中的数据库作为默认数据库使用。开箱即用，这个数据库称为 `default`。另外，您可以始终在表名之前指定数据库，用一个点分隔。

## 身份验证 {#authentication}

用户名和密码可以通过三种方式之一指明：

1. 使用 HTTP 基本身份验证。

例如：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. 在 `user` 和 `password` URL 参数中

:::warning
我们不推荐使用此方法，因为该参数可能会被 Web 代理记录并缓存在浏览器中。
:::

例如：

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 使用 'X-ClickHouse-User' 和 'X-ClickHouse-Key' 头部

例如：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

如果未指定用户名，则使用 `default` 名称。如果未指定密码，则使用空密码。
您还可以使用 URL 参数来指定任何设置以处理单个查询或整个配置文件的设置。

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

有关更多信息，请参见：
- [设置](/operations/settings/settings)
- [SET](/sql-reference/statements/set)

## 在 HTTP 协议中使用 ClickHouse 会话 {#using-clickhouse-sessions-in-the-http-protocol}

您还可以在 HTTP 协议中使用 ClickHouse 会话。为此，您需要在请求中添加 `session_id` `GET` 参数。您可以将任何字符串用作会话 ID。

默认情况下，在 60 秒不活动后会话将终止。要更改此超时（以秒为单位），请修改服务器配置中的 `default_session_timeout` 设置，或在请求中添加 `session_timeout` `GET` 参数。

要检查会话状态，请使用 `session_check=1` 参数。在单个会话中仅能执行一个查询。

您可以在 `X-ClickHouse-Progress` 响应头中接收关于查询进度的信息。要做到这一点，请启用 [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)。

以下是头部顺序的示例：

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能的头部字段包括：

| 头部字段             | 描述                               |
|----------------------|-----------------------------------|
| `read_rows`          | 读取的行数。                      |
| `read_bytes`         | 读取的数据量（以字节为单位）。   |
| `total_rows_to_read` | 要读取的总行数。                  |
| `written_rows`       | 已写入的行数。                    |
| `written_bytes`      | 写入的数据量（以字节为单位）。   |

如果 HTTP 连接丢失，正在运行的请求不会自动停止。解析和数据格式化在服务器端进行，使用网络可能会无效。

以下是存在的可选参数：

| 参数                  | 描述                                     |
|-----------------------|------------------------------------------|
| `query_id`（可选）   | 可以作为查询 ID 传递（任何字符串）。[`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key`（可选）  | 可以作为配额键传递（任何字符串）。["配额"](/operations/quotas) |

HTTP 接口允许为查询传递外部数据（外部临时表）。有关更多信息，请参见 ["用于查询处理的外部数据"](/engines/table-engines/special/external-data)。

## 响应缓冲 {#response-buffering}

可以在服务器端启用响应缓冲。为此提供以下 URL 参数：
- `buffer_size`
- `wait_end_of_query`

可以使用以下设置：
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` 确定要缓冲在服务器内存中的结果字节数。如果结果体大于此阈值，则缓冲会写入 HTTP 通道，剩余的数据会直接发送到 HTTP 通道。

为了确保整个响应都被缓冲，设置 `wait_end_of_query=1`。在这种情况下，未存储在内存中的数据将在临时服务器文件中缓冲。

例如：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
使用缓冲可以避免在响应代码和 HTTP 头部已经发送到客户端后发生查询处理错误的情况。在这种情况下，错误消息会写在响应体的末尾，并且在客户端只能在解析阶段检测到此错误。
:::

## 使用查询参数设置角色 {#setting-role-with-query-parameters}

此功能在 ClickHouse 24.4 中添加。

在特定情况下，执行语句之前可能需要先设置授予的角色。
但是，无法将 `SET ROLE` 和语句一起发送，因为不允许多语句：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上述命令会导致错误：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

要克服此限制，请改为使用 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

这相当于在语句之前执行 `SET ROLE my_role`。

此外，可以指定多个 `role` 查询参数：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

在这种情况下，`?role=my_role&role=my_other_role` 的效果与在语句之前执行 `SET ROLE my_role, my_other_role` 相同。

## HTTP 响应代码注意事项 {#http_response_codes_caveats}

由于 HTTP 协议的限制，HTTP 200 响应代码并不保证查询成功。

这里是一个例子：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

这种行为的原因是 HTTP 协议的性质。HTTP 首先发送带有 HTTP 代码 200 的头部，随后是 HTTP 体，然后错误作为纯文本插入到体中。

这种行为与使用的格式无关，无论是 `Native`、`TSV` 还是 `JSON`；错误消息总是会出现在响应流的中间。

您可以通过启用 `wait_end_of_query=1` 来缓解这个问题（[响应缓冲](#response-buffering)）。在这种情况下，HTTP 头的发送会延迟到整个查询解决后。然而，这并没有完全解决问题，因为结果仍然必须适应 [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)，并且像 [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers) 这样的其他设置可能会干扰头的延迟。

:::tip
捕获所有错误的唯一方法是在解析之前分析 HTTP 体，并使用所需格式进行处理。
:::

## 带参数的查询 {#cli-queries-with-parameters}

您可以创建带参数的查询，并通过相应的 HTTP 请求参数传递它们的值。有关更多信息，请参见 [CLI 的带参数查询](../interfaces/cli.md#cli-queries-with-parameters)。

### 示例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URL 参数中的制表符 {#tabs-in-url-parameters}

查询参数以“转义”格式解析。这有一些好处，例如可以明确解析 null 作为 `\N`。这意味着制表符应编码为 `\t`（或 `\` 和一个制表符）。例如，以下内容在 `abc` 和 `123` 之间包含一个实际的制表符，输入字符串被分为两个值：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

然而，如果您尝试使用 `%09` 在 URL 参数中编码实际制表符，则它将无法正确解析：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

如果您使用 URL 参数，您需要将 `\t` 编码为 `%5C%09`。例如：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```

## 预定义的 HTTP 接口 {#predefined_http_interface}

ClickHouse 通过 HTTP 接口支持特定查询。例如，您可以按如下方式向表中写入数据：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse 还支持一个预定义的 HTTP 接口，这可以帮助您更轻松地与 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter) 等第三方工具集成。让我们来看一个例子。

首先，将此部分添加到您的服务器配置文件中。

`http_handlers` 配置为包含多个 `rule`。 ClickHouse 将收到的 HTTP 请求与 `rule` 中的预定义类型进行匹配，首先匹配的规则运行处理器。然后 ClickHouse 会执行相应的预定义查询（如果匹配成功）。

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

您现在可以直接请求 Prometheus 格式的数据的 URL：

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
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

`http_handlers` 的配置选项如下工作。

`rule` 可以配置以下参数：
- `method`
- `headers`
- `url`
- `handler`

下面讨论了每一个：

  - `method` 负责匹配 HTTP 请求的方法部分。 `method` 完全符合 [`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) 的定义。它是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的方法部分。

  - `url` 负责匹配 HTTP 请求的 URL 部分。它与 [RE2](https://github.com/google/re2) 的正则表达式兼容。它是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的 URL 部分。

  - `headers` 负责匹配 HTTP 请求的头部部分。它与 RE2 的正则表达式兼容。它是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的头部部分。

  - `handler` 包含主要处理部分。现在 `handler` 可以配置 `type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query` 和 `query_param_name`。 `type` 当前支持三种类型：[`predefined_query_handler`](#predefined_query_handler)、[`dynamic_query_handler`](#dynamic_query_handler)、[`static`](#static)。

    - `query` —— 用于 `predefined_query_handler` 类型，当处理程序被调用时执行查询。
    - `query_param_name` —— 与 `dynamic_query_handler` 类型一起使用，从 HTTP 请求参数中提取并执行与 `query_param_name` 值对应的值。
    - `status` —— 与 `static` 类型一起使用，响应状态码。
    - `content_type` —— 与任何类型一起使用，响应 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)。
    - `http_response_headers` —— 与任何类型一起使用，响应头映射。也可用于设置内容类型。
    - `response_content` —— 与 `static` 类型一起使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中查找内容发送给客户端。

不同 `type` 的配置方法接下来进行讨论。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` 支持设置 `Settings` 和 `query_params` 值。您可以在 `predefined_query_handler` 类型中配置 `query`。

`query` 值是 `predefined_query_handler` 的预定义查询，当 HTTP 请求匹配时由 ClickHouse 执行并返回查询结果。这是必须的配置。

以下示例定义了 [`max_threads`](../operations/settings/settings.md#max_threads) 和 [`max_final_threads`](/operations/settings/settings#max_final_threads) 设置的值，然后查询系统表以检查这些设置是否成功设置。

:::note
为了保持默认的 `handlers` 如 `query`、`play`、`ping`，请添加 `<defaults/>` 规则。
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

:::note
在一个 `predefined_query_handler` 中，仅支持一个 `query`。
:::

### dynamic_query_handler {#dynamic_query_handler}

在 `dynamic_query_handler` 中，查询以 HTTP 请求的参数形式编写。与 `predefined_query_handler` 的不同之处在于查询是在配置文件中编写的。可以在 `dynamic_query_handler` 中配置 `query_param_name`。

ClickHouse 从 HTTP 请求的 URL 中提取并执行与 `query_param_name` 值对应的值。默认值为 `/query`。这是一个可选配置。如果在配置文件中未定义，则不会传递该参数。

要尝试此功能，以下示例定义了 [`max_threads`](../operations/settings/settings.md#max_threads) 和 `max_final_threads` 的值，并查询这些设置是否成功设置。

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

`static` 可以返回 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 和 `response_content`。 `response_content` 可以返回指定的内容。

例如，要返回消息 "Say Hi!"：

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

`http_response_headers` 可用于设置内容类型，而不是 `content_type`。

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

从配置中查找内容并发送给客户端。

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

从文件中查找内容并发送给客户端：

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```

## 在 HTTP 流中异常时的有效 JSON/XML 响应 {#valid-output-on-exception-http-streaming}

在通过 HTTP 执行查询时，当部分数据已经发送时可能会发生异常。通常，异常会以纯文本形式发送给客户端。
即使使用某种特定数据格式输出数据，输出也可能在指定数据格式方面无效。
为了防止这种情况，您可以使用设置 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)（默认启用），这将告诉 ClickHouse 按指定格式写入异常（当前支持 XML 和 JSON 格式）。

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
