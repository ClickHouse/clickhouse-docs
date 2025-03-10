---
slug: /interfaces/http
sidebar_position: 19
sidebar_label: 'HTTP 接口'
---

import PlayUI from '@site/static/images/play.png';

# HTTP 接口

HTTP 接口允许您通过 REST API 以任何编程语言在任何平台上使用 ClickHouse。HTTP 接口比本地接口更有限，但对语言的支持更好。

默认情况下，`clickhouse-server` 在端口 8123 上监听 HTTP（可以在配置中更改）。HTTPS 默认可以在端口 8443 上启用。

如果您发送一个无参数的 `GET /` 请求，它将返回 200 响应代码和在 [http_server_default_response](../operations/server-configuration-parameters/settings.md#http_server_default_response) 中定义的字符串默认值 "Ok."（末尾带换行符）

``` bash
$ curl 'http://localhost:8123/'
Ok.
```

另请参见: [HTTP 响应代码注意事项](#http_response_codes_caveats)。

有时，用户操作系统上可能没有 `curl` 命令。在 Ubuntu 或 Debian 上，运行 `sudo apt install curl`。请参阅此 [文档](https://curl.se/download.html) 在运行示例之前安装它。

Web UI 可以在这里访问: `http://localhost:8123/play`。

Web UI 支持在查询运行时显示进度、查询取消和流式结果。
它还具有显示查询管道图表和图形的秘密功能。

Web UI 旨在为像您这样的专业人士设计。

<img src={PlayUI} alt="ClickHouse Web UI 截图" />

在健康检查脚本中使用 `GET /ping` 请求。此处理程序始终返回 "Ok."（末尾带换行符）。可用版本 18.12.13。另请参见 `/replicas_status` 检查副本的延迟。

``` bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

将请求作为 URL 的 'query' 参数发送，或作为 POST 发送。或者将查询的开头放在 'query' 参数中，其余部分放在 POST 中（稍后我们将解释为什么需要这样）。默认情况下，URL 的大小限制为 1 MiB，可以通过 `http_max_uri_size` 设置进行更改。

如果成功，您将收到 200 响应代码和响应体中的结果。
如果发生错误，您将收到 500 响应代码和响应体中的错误描述文本。

使用 GET 方法时，设定为 'readonly'。换句话说，对于修改数据的查询，您只能使用 POST 方法。您可以在 POST 身体中或 URL 参数中发送查询本身。

示例:

``` bash
$ curl 'http://localhost:8123/?query=SELECT%201'
1

$ wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
1

$ echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

如您所见，`curl` 在空格需要 URL 转义时有些不便。
虽然 `wget` 自行转义所有内容，但我们不建议使用它，因为它在使用 HTTP 1.1 时对保持连接和 Transfer-Encoding: chunked 的支持不好。

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

如果查询的一部分在参数中发送，另一部分在 POST 中，则在这两个数据部分之间插入换行符。
示例（这将不起作用）:

``` bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

默认情况下，数据以 [TabSeparated](formats.md#tabseparated) 格式返回。

您可以使用查询的 FORMAT 子句请求任何其他格式。

此外，您可以使用 'default_format' URL 参数或 'X-ClickHouse-Format' 头指定不同于 TabSeparated 的默认格式。

``` bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

POST 方法的数据传输对于 `INSERT` 查询是必要的。在这种情况下，您可以在 URL 参数中写入查询的开头，并使用 POST 传递要插入的数据。要插入的数据可以是 MySQL 的制表符分隔转储。通过这种方式，`INSERT` 查询替代 MySQL 的 `LOAD DATA LOCAL INFILE`。

**示例**

创建表:

``` bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

使用熟悉的 INSERT 查询进行数据插入:

``` bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

数据可以与查询分开发送:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

您可以指定任意数据格式。'Values' 格式与写入 INSERT INTO t VALUES 时所用的格式相同:

``` bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

要从制表符分隔的转储中插入数据，请指定相应的格式:

``` bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

读取表内容。由于并行查询处理，数据以随机顺序输出:

``` bash
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

删除表。

``` bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

对于成功请求而不返回数据表的情况，将返回空响应体。
## 压缩 {#compression}

您可以使用压缩来减少传输大量数据时的网络流量或创建立即压缩的转储。

在传输数据时，您可以使用内部 ClickHouse 压缩格式。压缩数据具有非标准格式，您需要 `clickhouse-compressor` 程序与之配合使用。它随 `clickhouse-client` 包一起安装。为了提高数据插入的效率，您可以通过使用 [http_native_compression_disable_checksumming_on_decompress](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 设置来禁用服务器端的校验和验证。

如果在 URL 中指定 `compress=1`，则服务器将压缩发送给您的数据。如果在 URL 中指定 `decompress=1`，则服务器将解压缩您使用 `POST` 方法传递的数据。

您还可以选择使用 [HTTP 压缩](https://en.wikipedia.org/wiki/HTTP_compression)。ClickHouse 支持以下 [压缩方法](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

要发送压缩的 `POST` 请求，请附加请求头 `Content-Encoding: compression_method`。
为了让 ClickHouse 压缩响应，启用 [enable_http_compression](../operations/settings/settings.md#enable_http_compression) 设置，并将 `Accept-Encoding: compression_method` 头附加到请求中。您可以在 [http_zlib_compression_level](../operations/settings/settings.md#http_zlib_compression_level) 设置中配置所有压缩方法的数据压缩级别。

:::info
某些 HTTP 客户端可能默认就会解压缩来自服务器的数据（使用 `gzip` 和 `deflate`），即使您正确使用压缩设置，也可能会收到解压缩的数据。
:::

**示例**

``` bash

# 发送压缩数据到服务器
$ echo "SELECT 1" | gzip -c | \
  curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

``` bash

# 接收来自服务器的压缩数据存档
$ curl -vsS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'
$ zcat result.gz
0
1
2
```

```bash

# 从服务器接收压缩数据，并使用 gunzip 接收解压缩的数据
$ curl -sS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## 默认数据库 {#default-database}

您可以使用 'database' URL 参数或 'X-ClickHouse-Database' 头来指定默认数据库。

``` bash
$ echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
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

默认情况下，默认数据库是注册在服务器设置中的数据库。默认情况下，这个数据库叫做 'default'。另外，您也可以始终在表名之前使用点来指定数据库。

用户名和密码可以通过三种方式之一指出：

1.  使用 HTTP 基本认证。示例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2.  在 'user' 和 'password' URL 参数中 (*我们不建议使用这种方法，因为参数可能会被 Web 代理记录并缓存到浏览器*）。示例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3.  使用 'X-ClickHouse-User' 和 'X-ClickHouse-Key' 头。示例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

如果未指定用户名，则使用 `default` 名称。如果未指定密码，则使用空密码。
您还可以使用 URL 参数指定单个查询或整个设置配置文件的任何设置。示例: http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1

有关更多信息，请参见 [设置](/operations/settings/settings) 部分。

``` bash
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

有关其他参数的信息，请参见“SET”部分。
## 在 HTTP 协议中使用 ClickHouse 会话 {#using-clickhouse-sessions-in-the-http-protocol}

您还可以在 HTTP 协议中使用 ClickHouse 会话。为此，您需要在请求中添加 `session_id` GET 参数。您可以使用任何字符串作为会话 ID。默认情况下，会话在 60 秒不活动后终止。要更改此超时（以秒为单位），请修改服务器配置中的 `default_session_timeout` 设置，或在请求中添加 `session_timeout` GET 参数。要检查会话状态，请使用 `session_check=1` 参数。在单个会话内一次只能执行一个查询。

您可以通过 `X-ClickHouse-Progress` 响应头接收有关查询进度的信息。为此，请启用 [send_progress_in_http_headers](../operations/settings/settings.md#send_progress_in_http_headers)。头部序列示例:

``` text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能的头字段:

- `read_rows` — 读取的行数。
- `read_bytes` — 读取的数据量（以字节为单位）。
- `total_rows_to_read` — 要读取的总行数。
- `written_rows` — 写入的行数。
- `written_bytes` — 写入的数据量（以字节为单位）。

如果 HTTP 连接丢失，正在运行的请求不会自动停止。解析和数据格式化在服务器端进行，使用网络可能效率不高。
可选的 'query_id' 参数可以作为查询 ID 发送（任何字符串）。有关更多信息，请参见“设置，替换正在运行的查询”部分。

可选的 'quota_key' 参数可以作为配额键发送（任何字符串）。有关更多信息，请参见“配额”部分。

HTTP 接口允许传递外部数据（外部临时表）进行查询。有关更多信息，请参见“查询处理的外部数据”部分。
## 响应缓冲 {#response-buffering}

您可以在服务器端启用响应缓冲。为此提供了 `buffer_size` 和 `wait_end_of_query` URL 参数。
还可以使用设置 `http_response_buffer_size` 和 `http_wait_end_of_query`。

`buffer_size` 确定要在服务器内存中缓冲的结果字节数。如果结果体大于此阈值，则缓冲区将被写入 HTTP 通道，其余数据将直接发送到 HTTP 通道。

为了确保整个响应被缓冲，请设置 `wait_end_of_query=1`。在这种情况下，未存储在内存中的数据将被缓冲在临时服务器文件中。

示例:

``` bash
$ curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

使用缓冲可以避免在响应代码和 HTTP 头已发送到客户端后发生查询处理错误的情况。在这种情况下，将在响应体的末尾写入错误消息，并且在客户端，错误只能在解析阶段检测到。
## 使用查询参数设置角色 {#setting-role-with-query-parameters}

这是 ClickHouse 24.4 中新增的功能。

在一些特定场景中，首先需要设置授予的角色，然后才能执行语句本身。
然而，无法将 `SET ROLE` 和语句一起发送，因为不允许多语句:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

这将导致错误:

```sql
Code: 62. DB::Exception: Syntax error (不允许多语句)
```

要克服此限制，您可以使用 `role` 查询参数:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

这等效于在语句之前执行 `SET ROLE my_role`。

此外，可以指定多个 `role` 查询参数:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

在这种情况下，`?role=my_role&role=my_other_role` 类似于在语句之前执行 `SET ROLE my_role, my_other_role`。
## HTTP 响应代码注意事项 {#http_response_codes_caveats}

由于 HTTP 协议的限制，HTTP 200 响应代码并不保证查询成功。

以下是一个示例:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: 值传递给 'throwIf' 函数为非零: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

这种行为的原因是 HTTP 协议的特性。HTTP 头首先发送，带有 HTTP 200 代码，随后是 HTTP 主体，然后错误以纯文本形式注入到正文中。
这种行为与使用的格式无关，无论是 `Native`、`TSV` 还是 `JSON`；错误消息始终会在响应流的中间。
您可以通过启用 `wait_end_of_query=1`（[响应缓冲](#response-buffering)）来缓解此问题。在这种情况下，将延迟发送 HTTP 头，直到整个查询解决为止。
然而，这并不能完全解决问题，因为结果仍然必须适合 `http_response_buffer_size`，而其他设置如 `send_progress_in_http_headers` 可能会干扰头的延迟。
捕获所有错误的唯一方法是分析 HTTP 正文，然后再使用所需的格式进行解析。
## 带参数的查询 {#cli-queries-with-parameters}

您可以创建一个带参数的查询，并通过相应的 HTTP 请求参数传递值。有关更多信息，请参见 [CLI 的带参数查询](../interfaces/cli.md#cli-queries-with-parameters)。
### 示例 {#example}

``` bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### URL 参数中的制表符 {#tabs-in-url-parameters}

查询参数是从“转义”格式解析的。这有一些好处，例如可以明确无误地将 null 解析为 `\N`。这意味着制表符字符应该编码为 `\t`（或者 `\` 和制表符）。例如，以下内容在 `abc` 和 `123` 之间包含一个实际的制表符，并且输入字符串被拆分为两个值:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

然而，如果您尝试在 URL 参数中使用 `%09` 编码实际的制表符，则不会正确解析:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: 值 abc	123 无法被解析为查询参数 'arg1' 的字符串，因为没有完全解析: 仅解析了 3 个字节中的 7 个字节: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

如果您使用 URL 参数，您需要将 `\t` 编码为 `%5C%09`。例如:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## 预定义 HTTP 接口 {#predefined_http_interface}

ClickHouse 通过 HTTP 接口支持特定查询。例如，您可以如下将数据写入表:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse 还支持预定义 HTTP 接口，可以帮助您更轻松地与第三方工具集成，例如 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)。

示例:

- 首先，将此部分添加到服务器配置文件:

<!-- -->

``` xml
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

- 您现在可以直接请求 URL 以获取 Prometheus 格式的数据:

<!-- -->

``` bash
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

# HELP "Query" "正在执行的查询数"

# TYPE "Query" counter
"Query" 1


# HELP "Merge" "正在执行的后台合并数"

# TYPE "Merge" counter
"Merge" 0


# HELP "PartMutation" "变更数（ALTER DELETE/UPDATE）"

# TYPE "PartMutation" counter
"PartMutation" 0


# HELP "ReplicatedFetch" "从副本获取的数据部分数"

# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0


# HELP "ReplicatedSend" "发送到副本的数据部分数"

# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

正如示例所示，如果在 config.xml 文件中配置了 `http_handlers`，并且 `http_handlers` 可以包含多个 `rules`。ClickHouse 将匹配接收到的 HTTP 请求到 `rule` 中的预定义类型，并运行第一个匹配的处理程序。然后，ClickHouse 会在匹配成功时执行相应的预定义查询。

现在 `rule` 可以配置 `method`、`headers`、`url` 和 `handler`:
- `method` 负责匹配 HTTP 请求的方法部分。`method` 完全符合 HTTP 协议中 [method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) 的定义。这是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的方法部分。

- `url` 负责匹配 HTTP 请求的 URL 部分。它与 [RE2](https://github.com/google/re2) 的正则表达式兼容。这是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的 URL 部分。

- `headers` 负责匹配 HTTP 请求的头部。这也与 RE2 的正则表达式兼容。这是一个可选配置。如果在配置文件中未定义，则不会匹配 HTTP 请求的头部部分。

- `handler` 包含主要处理部分。现在 `handler` 可以配置 `type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query` 和 `query_param_name`。
    `type` 目前支持三种类型: [predefined_query_handler](#predefined_query_handler)、[dynamic_query_handler](#dynamic_query_handler)、[static](#static)。

    - `query` — 与 `predefined_query_handler` 类型一起使用，处理程序被调用时执行查询。

    - `query_param_name` — 与 `dynamic_query_handler` 类型一起使用，提取并执行与 HTTP 请求参数中的 `query_param_name` 值相对应的值。

    - `status` — 与 `static` 类型一起使用，响应状态代码。

    - `content_type` — 与任意类型一起使用，响应 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)。

    - `http_response_headers` — 与任意类型一起使用，响应头映射。可用于设置内容类型。

    - `response_content` — 与 `static` 类型一起使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中查找内容并发送到客户端。

接下来是不同 `type` 的配置方法。
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` 支持设置 `Settings` 和 `query_params` 的值。您可以在 `predefined_query_handler` 类型中配置 `query`。

`query` 值是 `predefined_query_handler` 的预定义查询，当 HTTP 请求匹配时，ClickHouse 将执行该查询并返回查询结果。这是必需的配置。

以下示例定义了 [max_threads](../operations/settings/settings.md#max_threads) 和 `max_final_threads` 设置的值，然后查询系统表检查这些设置是否成功设置。

:::note
要保留默认的 `handlers`，例如 `query`、`play`、`ping`，请添加 `<defaults/>` 规则。
:::

示例:

``` xml
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

``` bash
$ curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads	2
max_threads	1
```

:::note
在一个 `predefined_query_handler` 中只支持一个 `query`。
:::
### dynamic_query_handler {#dynamic_query_handler}

在 `dynamic_query_handler` 中，查询以 HTTP 请求参数的形式编写。与 `predefined_query_handler` 的不同之处在于，查询是在配置文件中编写的。您可以在 `dynamic_query_handler` 中配置 `query_param_name`。

ClickHouse 提取并执行与 HTTP 请求 URL 中的 `query_param_name` 值相对应的值。`query_param_name` 的默认值是 `/query`。它是一个可选配置。如果在配置文件中没有定义，则参数不传递。

为了尝试此功能，示例定义了 [max_threads](../operations/settings/settings.md#max_threads) 和 `max_final_threads` 的值，并查询这些设置是否成功设置。

示例:

``` xml
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

``` bash
$ curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```
### static {#static}

`static` 可以返回 [content_type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 和 `response_content`。`response_content` 可以返回指定的内容。

示例：

返回一条消息。

``` xml
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
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

`http_response_headers` 可以用于设置内容类型，而不是 `content_type`。

``` xml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

``` bash
$ curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
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

从配置中找到发送给客户端的内容。

``` xml
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

``` bash
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

从文件中找到发送给客户端的内容。

``` xml
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

``` bash
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
## 有效的 JSON/XML 响应于 HTTP 流中的异常 {#valid-output-on-exception-http-streaming}

在 HTTP 运行查询时，如果数据的一部分已经被发送，则可能会发生异常。通常即使在输出数据时使用了某种特定的数据格式，异常也会以纯文本形式发送给客户端，并且输出可能在指定的数据格式方面变得无效。为了防止这种情况，您可以使用设置 `http_write_exception_in_output_format`（默认启用），这将告诉 ClickHouse 在指定格式中写入异常（当前支持 XML 和 JSON* 格式）。

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
