---
'description': 'ClickHouse 命令行客户端接口的文档'
'sidebar_label': 'ClickHouse 客户端'
'sidebar_position': 17
'slug': '/interfaces/cli'
'title': 'ClickHouse 客户端'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouse 提供了一种原生命令行客户端，可以直接在 ClickHouse 服务器上执行 SQL 查询。它支持交互模式（用于实时查询执行）和批处理模式（用于脚本和自动化）。查询结果可以在终端中显示或导出到文件，支持所有 ClickHouse 输出 [格式](formats.md)，例如 Pretty、CSV、JSON 等。

客户端提供实时反馈，显示查询执行的进度条，以及读取的行数、处理的字节数和查询执行时间。它支持 [命令行选项](#command-line-options) 和 [配置文件](#configuration_files)。

## 安装 {#install}

要下载 ClickHouse，请运行：

```bash
curl https://clickhouse.com/ | sh
```

要安装它，请运行：
```bash
sudo ./clickhouse install
```

有关更多安装选项，请参见 [安装 ClickHouse](../getting-started/install/install.mdx)。

不同的客户端和服务器版本是相互兼容的，但某些功能可能在较旧的客户端中不可用。我们建议使用相同的版本进行客户端和服务器操作。

## 运行 {#run}

:::note
如果你只下载但未安装 ClickHouse，请使用 `./clickhouse client` 而不是 `clickhouse-client`。
:::

要连接到 ClickHouse 服务器，请运行：

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

根据需要指定其他连接详细信息：

**`--port <port>`** - ClickHouse 服务器接受连接的端口。默认端口为 9440 (TLS) 和 9000 (无 TLS)。请注意，ClickHouse Client 使用原生协议而不是 HTTP(S)。

**`-s [ --secure ]`** - 是否使用 TLS（通常会自动检测）。

**`-u [ --user ] <username>`** - 以哪个数据库用户连接。默认以 `default` 用户连接。

**`--password <password>`** - 数据库用户的密码。你还可以在配置文件中指定连接密码。如果未指定密码，客户端会要求输入。

**`-c [ --config ] <path-to-file>`** - ClickHouse Client 配置文件的路径，如果它不在默认位置。请参见 [配置文件](#configuration_files)。

**`--connection <name>`** - 配置文件中预定义连接详细信息的名称。

有关完整的命令行选项列表，请参见 [命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

你的 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。选择你要连接的服务并点击 **Connect**：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud service connect button"
/>

<br/><br/>

选择 **Native**，并将显示详细信息以及示例 `clickhouse-client` 命令：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP connection details"
/>

### 在配置文件中存储连接 {#connection-credentials}

你可以在 [配置文件](#configuration_files) 中存储一个或多个 ClickHouse 服务器的连接详细信息。

格式如下：
```xml
<config>
    <connections_credentials>
        <name>default</name>
        <hostname>hostname</hostname>
        <port>9440</port>
        <secure>1</secure>
        <user>default</user>
        <password>password</password>
    </connections_credentials>
</config>
```

有关更多信息，请参阅 [配置文件部分](#configuration_files)。

:::note
为了集中注意查询语法，其余的示例省略了连接详细信息（`--host`、`--port` 等）。在使用命令时请记得添加它们。
:::

## 批处理模式 {#batch-mode}

你可以将 ClickHouse Client 以批处理模式运行，而不是以交互模式运行。

你可以像这样指定单个查询：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

你还可以使用 `--query` 命令行选项：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

你可以在 `stdin` 上提供一个查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当 `--query` 被指定时，任何输入都会在换行之后附加到请求中。

**将 CSV 文件插入远程 ClickHouse 服务**

此示例是将样本数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中已存在的表 `cell_towers` 中：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**更多插入数据的示例**

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

## 注意事项 {#notes}

在交互模式下，默认输出格式为 `PrettyCompact`。你可以在查询的 `FORMAT` 子句中更改格式，或通过指定 `--format` 命令行选项来更改格式。要使用垂直格式，可以使用 `--vertical` 或在查询末尾指定 `\G`。在此格式中，每个值在单独的一行上打印，这对于宽表非常方便。

在批处理模式下，默认数据 [格式](formats.md) 为 `TabSeparated`。你可以在查询的 `FORMAT` 子句中设置格式。

在交互模式下，默认情况下按下 `Enter` 键时会运行所输入的内容。查询末尾不需要使用分号。

你可以使用 `-m, --multiline` 参数启动客户端。要输入多行查询，请在换行之前输入反斜杠 `\`。按下 `Enter` 后，会提示你输入查询的下一行。要运行查询，必须以分号结束并按下 `Enter`。

ClickHouse Client 基于 `replxx`（类似于 `readline`），因此使用熟悉的键盘快捷键并保持历史记录。历史记录默认写入 `~/.clickhouse-client-history`。

要退出客户端，按 `Ctrl+D`，或在查询中输入以下任意命令：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

在处理查询时，客户端展示：

1.  进度，默认每秒更新不超过 10 次。对于快速查询，可能没有时间显示进度。
2.  解析后的格式化查询，以供调试。
3.  以指定格式显示结果。
4.  结果中的行数，经过的时间，以及查询处理的平均速度。所有数据量指的是未压缩的数据。

你可以通过按下 `Ctrl+C` 来取消一个长时间运行的查询。然而，你还是需要等一会儿，服务器才能中止请求。在某些阶段，无法取消查询。如果你不等而按下 `Ctrl+C` 第二次，客户端将退出。

ClickHouse Client 允许传递外部数据（外部临时表）以进行查询。有关更多信息，请参见 [用于查询处理的外部数据部分](../engines/table-engines/special/external-data.md)。

## 带参数的查询 {#cli-queries-with-parameters}

你可以在查询中指定参数，并使用命令行选项传递值。这避免了在客户端侧对具有特定动态值的查询进行格式化。例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

也可以在交互会话中设置参数：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，以以下格式将要使用命令行参数填充的值放在大括号中：

```sql
{<name>:<data type>}
```

- `name` - 占位符标识符。相应的命令行选项为 `--param_<name> = value`。
- `data type` - 参数的 [数据类型](../sql-reference/data-types/index.md)。例如，结构为 `(integer, ('string', integer))` 的数据可以具有 `Tuple(UInt8, Tuple(String, UInt8))` 数据类型（你也可以使用其他 [整数](../sql-reference/data-types/int-uint.md) 类型）。还可以将表名称、数据库名称和列名称作为参数传递，在这种情况下，你需要将 `Identifier` 作为数据类型。

### 示例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## 别名 {#cli_aliases}

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 重复上一个查询

## 键盘快捷键 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 用当前查询打开编辑器。可以通过环境变量 `EDITOR` 指定要使用的编辑器。默认使用 `vim`。
- `Alt (Option) + #` - 注释行。
- `Ctrl + r` - 模糊历史搜索。

所有可用键盘快捷键的完整列表可在 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) 中找到。

:::tip
要在 MacOS 上配置元键（Option）的正确工作：

iTerm2：转到偏好设置 -> 配置文件 -> 键 -> 左 Option 键，单击 Esc+
:::

## 连接字符串 {#connection_string}

ClickHouse Client 还支持使用类似 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 的连接字符串连接到 ClickHouse 服务器。它的语法如下：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**组成部分**

- `user` - （可选）数据库用户名。默认值：`default`。
- `password` - （可选）数据库用户密码。如果指定了 `:` 且密码为空，客户端将提示输入用户的密码。
- `hosts_and_ports` - （可选）主机和可选端口的列表 `host[:port] [, host:[port]], ...`。默认值：`localhost:9000`。
- `database` - （可选）数据库名称。默认值：`default`。
- `query_parameters` - （可选）键值对列表 `param1=value1[,&param2=value2], ...`。对于某些参数，不需要提供值。参数名称和值区分大小写。

如果连接字符串中已指定用户名、密码或数据库，则无法通过 `--user`、`--password` 或 `--database` 指定（反之亦然）。

主机组件可以是主机名或 IPv4 或 IPv6 地址。IPv6 地址应放在方括号内：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。ClickHouse Client 将按顺序尝试连接这些主机（从左到右）。建立连接后，不再尝试连接剩余的主机。

连接字符串必须作为 `clickHouse-client` 的第一个参数指定。连接字符串可以与任意其他 [命令行选项](#command-line-options) 组合，但不能与 `--host` 和 `--port` 组合。

允许的 `query_parameters` 键包括：

- `secure` 或简写 `s`。如果指定，客户端将通过安全连接（TLS）连接到服务器。请参见 [命令行选项](#command-line-options) 中的 `--secure`。

**百分比编码**

在 `user`、`password`、`hosts`、`database` 和 `query parameters` 中，非美国 ASCII 字符、空格和特殊字符必须进行 [百分比编码](https://en.wikipedia.org/wiki/URL_encoding)。

### 示例 {#connection_string_examples}

连接到 `localhost`，端口为 9000，并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

连接到 `localhost`，用户名为 `john`，密码为 `secret`，主机为 `127.0.0.1`，端口为 `9000`。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

连接到 `localhost`，作为 `default` 用户，主机使用 IPv6 地址 `[::1]`，端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

连接到 `localhost`，端口为 9000，以多行模式连接。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

连接到 `localhost`，端口为 9000，以用户 `default` 身份连接。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost`，端口为 9000 并默认到 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

连接到 `localhost`，端口为 9000 并在连接字符串中指定 `my_database` 数据库的安全连接，使用简短的 `s` 参数。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

连接到默认主机，使用默认端口、默认用户和默认数据库。

```bash
clickhouse-client clickhouse:
```

连接到默认主机，使用默认端口，作为用户 `my_user` 且不需要密码。

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

连接到 `localhost`，使用电子邮件作为用户名。`@` 符号经过百分比编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到两个主机之一：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## 查询 ID 格式 {#query-id-format}

在交互模式下，ClickHouse Client 会为每个查询显示查询 ID。默认情况下，ID 的格式如下：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件中通过 `query_id_formats` 标签指定自定义格式。格式字符串中的 `{query_id}` 占位符将替换为查询 ID。标签内允许多个格式字符串。
此功能可用于生成 URL，以便更方便地分析查询。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

使用上述配置，查询的 ID 以以下格式显示：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 配置文件 {#configuration_files}

ClickHouse Client 使用以下文件中第一个存在的文件：

- 使用 `-c [ -C, --config, --config-file ]` 参数定义的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

请参见 ClickHouse 仓库中的示例配置文件：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

示例 XML 语法：

```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```

相同配置的 YAML 格式：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## 命令行选项 {#command-line-options}

所有命令行选项都可以直接在命令行上指定或作为 [配置文件](#configuration_files) 中的默认值。

### 一般选项 {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

客户端配置文件的位置，如果它不在默认位置。请参见 [配置文件](#configuration_files)。

**`--help`**

打印用法摘要并退出。与 `--verbose` 组合可显示所有可能的选项，包括查询设置。

**`--history_file <path-to-file>`**

包含命令历史的文件路径。

**`--history_max_entries`**

历史文件中条目的最大数量。

默认值：1000000（100 万）

**`--prompt <prompt>`**

指定自定义提示符。

默认值：服务器的 `display_name`。

**`--verbose`**

提高输出详细级别。

**`-V [ --version ]`**

打印版本并退出。

### 连接选项 {#command-line-options-connection}

**`--connection <name>`**

来自配置文件中预配置的连接详细信息的名称。请参见 [连接凭据](#connection-credentials)。

**`-d [ --database ] <database>`**

选择此连接的默认数据库。

默认值：来自服务器设置的当前数据库（默认为 `default`）。

**`-h [ --host ] <host>`**

要连接的 ClickHouse 服务器的主机名。可以是主机名或 IPv4 或 IPv6 地址。可以通过多个参数传递多个主机。

默认值：localhost

**`--jwt <value>`**

使用 JSON Web Token (JWT) 进行身份验证。

服务器 JWT 授权仅在 ClickHouse Cloud 中可用。

**`--no-warnings`**

禁用在客户端连接到服务器时从 `system.warnings` 显示警告。

**`--password <password>`**

数据库用户的密码。你可以在配置文件中指定连接的密码。如果不指定密码，客户端会要求输入。

**`--port <port>`**

服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。

注意：客户端使用原生协议，而非 HTTP(S)。

默认值：如果指定了 `--secure`，则为 9440，否则为 9000。如果主机名以 `.clickhouse.cloud` 结尾，则始终默认值为 9440。

**`-s [ --secure ]`**

是否使用 TLS。

在连接到 9440 端口（默认安全端口）或 ClickHouse Cloud 时会自动启用。

你可能需要在 [配置文件](#configuration_files) 中配置你的 CA 证书。可用的配置设置与 [服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl) 相同。

**`--ssh-key-file <path-to-file>`**

包含用于与服务器进行身份验证的 SSH 私钥的文件。

**`--ssh-key-passphrase <value>`**

指定在 `--ssh-key-file` 中的 SSH 私钥的密码短语。

**`-u [ --user ] <username>`**

以哪个数据库用户身份连接。

默认值：default

客户端还支持通过 [连接字符串](#connection_string) 代替 `--host`、`--port`、`--user` 和 `--password` 选项。

### 查询选项 {#command-line-options-query}

**`--param_<name>=<value>`**

带参数的 [查询](#cli-queries-with-parameters) 的参数的替代值。

**`-q [ --query ] <query>`**

在批处理模式下运行的查询。可以多次指定（`--query "SELECT 1" --query "SELECT 2"`），或一次指定多个用分号分隔的查询（`--query "SELECT 1; SELECT 2;"`）。在后一种情况下，除 `VALUES` 以外格式的 `INSERT` 查询必须用空行分隔。

单个查询也可以在没有参数的情况下指定：
```bash
$ clickhouse-client "SELECT 1"
1
```

不能与 `--queries-file` 一起使用。

**`--queries-file <path-to-file>`**

包含查询的文件路径。可以多次指定 `--queries-file`，例如 `--queries-file  queries1.sql --queries-file  queries2.sql`。

不能与 `--query` 一起使用。

**`-m [ --multiline ]`**

如果指定，允许多行查询（在按 Enter 时不发送查询）。仅在以分号结束时发送查询。

### 查询设置 {#command-line-options-query-settings}

查询设置可以作为客户端中的命令行选项指定，例如：
```bash
$ clickhouse-client --max_threads 1
```

请参见 [设置](../operations/settings/settings.md) 获取设置列表。

### 格式化选项 {#command-line-options-formatting}

**`-f [ --format ] <format>`**

使用指定格式输出结果。

有关支持格式的列表，请参阅 [输入和输出数据的格式](formats.md)。

默认值：TabSeparated

**`--pager <command>`**

将所有输出管道传输到该命令。通常为 `less`（例如，`less -S` 展示宽结果集）或类似。

**`-E [ --vertical ]`**

使用 [垂直格式](../interfaces/formats.md#vertical) 输出结果。这与 `--format Vertical` 相同。在此格式中，每个值在单独的一行上打印，这在显示宽表时很有帮助。

### 执行详情 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

通过按下控制键（空格）启用切换进度表。仅适用于启用进度表打印的交互模式。

默认值：启用

**`--hardware-utilization`**

在进度条中打印硬件利用率信息。

**`--memory-usage`**

如果指定，在非交互模式下将内存使用情况打印到 `stderr`。

可能的值：
- `none` - 不打印内存使用情况
- `default` - 打印字节数
- `readable` - 以可读格式打印内存使用情况

**`--print-profile-events`**

打印 `ProfileEvents` 数据包。

**`--progress`**

打印查询执行进度。

可能的值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度打印

默认值：交互模式下为 `tty`，非交互（批处理）模式下为 `off`。

**`--progress-table`**

在查询执行期间打印包含变化指标的进度表。

可能的值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度表

默认值：交互模式下为 `tty`，非交互（批处理）模式下为 `off`。

**`--stacktrace`**

打印异常的堆栈跟踪。

**`-t [ --time ]`**

在非交互模式下将查询执行时间打印到 `stderr` （用于基准测试）。
