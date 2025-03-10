---
slug: /interfaces/cli
sidebar_position: 17
sidebar_label: ClickHouse 客户端
title: ClickHouse 客户端
---

import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouse 提供了一个原生命令行客户端，可以直接对 ClickHouse 服务器执行 SQL 查询。它支持交互模式（用于实时查询执行）和批处理模式（用于脚本和自动化）。查询结果可以在终端中显示或导出到文件，支持所有 ClickHouse 输出 [格式](formats.md)，如 Pretty、CSV、JSON 等。

客户端提供有关查询执行的实时反馈，包括进度条、读取的行数、处理的字节和查询执行时间。它支持 [命令行选项](#command-line-options) 和 [配置文件](#configuration_files)。

## 安装 {#install}

要下载 ClickHouse，请运行：

```bash
curl https://clickhouse.com/ | sh
```

如果还想安装它，请运行：
```bash
sudo ./clickhouse install
```

有关更多安装选项，请参见 [安装 ClickHouse](../getting-started/install.md)。

不同的客户端和服务器版本之间是兼容的，但某些功能可能在较旧的客户端中不可用。我们建议客户端和服务器使用相同版本。

## 运行 {#run}

:::note
如果您只下载了但没有安装 ClickHouse，请使用 `./clickhouse client` 而不是 `clickhouse-client`。
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

**`--port <port>`** - ClickHouse 服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。请注意，ClickHouse 客户端使用原生协议，而不是 HTTP(S)。

**`-s [ --secure ]`** - 是否使用 TLS（通常自动检测）。

**`-u [ --user ] <username>`** - 要连接的数据库用户。默认使用 `default` 用户连接。

**`--password <password>`** - 数据库用户的密码。您还可以在配置文件中指定连接的密码。如果未指定密码，客户端会要求输入。

**`-c [ --config ] <path-to-file>`** - ClickHouse 客户端配置文件的位置，如果它不在默认位置之一。有关更多信息，请参见 [配置文件](#configuration_files)。

**`--connection <name>`** - 从配置文件中预配置的连接详细信息的名称。

有关命令行选项的完整列表，请参见 [命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

您的 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。选择您要连接的服务并单击 **Connect**：

<img src={cloud_connect_button}
  class="image"
  alt="ClickHouse Cloud service connect button"
  style={{width: '30em'}} />

<br/><br/>

选择 **Native**，详细信息将显示并带有示例 `clickhouse-client` 命令：

<img src={connection_details_native}
  class="image"
  alt="ClickHouse Cloud Native TCP connection details"
  style={{width: '40em'}} />

### 在配置文件中存储连接 {#connection-credentials}

您可以在 [配置文件](#configuration_files) 中存储一个或多个 ClickHouse 服务器的连接详细信息。

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

有关更多信息，请参见 [配置文件部分](#configuration_files)。

:::note
为了专注于查询语法，其余示例省略连接详细信息（`--host`、`--port` 等）。使用命令时请记得添加它们。
:::

## 批处理模式 {#batch-mode}

您可以选择以批处理模式运行 ClickHouse 客户端，而不是以交互方式使用。

您可以像这样指定单个查询：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

您还可以使用 `--query` 命令行选项：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

您可以在 `stdin` 中提供查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当指定 `--query` 时，任何输入都将在换行符后附加到请求中。

**将 CSV 文件插入到远程 ClickHouse 服务**

此示例将一个示例数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中的现有表 `cell_towers`：

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

在交互模式下，默认输出格式为 `PrettyCompact`。您可以在查询的 `FORMAT` 子句中或通过指定 `--format` 命令行选项来更改格式。要使用垂直格式，您可以使用 `--vertical` 或在查询末尾指定 `\G`。在此格式中，每个值将在单独的行上打印，这对于宽表格很方便。

在批处理模式下，默认数据 [格式](formats.md) 为 `TabSeparated`。您可以在查询的 `FORMAT` 子句中设置格式。

在交互模式下，默认情况下，按下 `Enter` 时输入的内容将被运行。查询末尾不需要分号。

您可以使用 `-m, --multiline` 参数启动客户端。要输入多行查询，在换行符之前输入反斜杠 `\`。按下 `Enter` 后，将被提示输入查询的下一行。要运行查询，请以分号结束并按 `Enter`。

ClickHouse 客户端基于 `replxx`（类似于 `readline`），因此它使用熟悉的键盘快捷键并保留历史记录。历史记录默认写入 `~/.clickhouse-client-history`。

要退出客户端，请按 `Ctrl+D`，或在查询中输入以下之一：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

在处理查询时，客户端显示：

1. 默认情况下，进度每秒更新不超过 10 次。对于快速查询，进度可能没有时间显示。
2. 解析后的格式化查询，以便调试。
3. 以指定格式的结果。
4. 结果中的行数、经过的时间和查询处理的平均速度。所有数据量均指未压缩的数据。

您可以通过按 `Ctrl+C` 来取消长查询。但是，您仍然需要稍等一段时间以便服务器中止请求。在某些阶段无法取消查询。如果您不等待并第二次按 `Ctrl+C`，客户端将退出。

ClickHouse 客户端允许传递外部数据（外部临时表）以供查询。有关更多信息，请参见 [处理查询的外部数据](../engines/table-engines/special/external-data.md)。

## 带参数的查询 {#cli-queries-with-parameters}

您可以在查询中指定参数，并通过命令行选项将值传递给它。这避免了在客户端侧使用特定动态值格式化查询。例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

也可以在交互会话内设置参数：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，将要通过命令行参数填充的值放置在大括号中，格式如下：

```sql
{<name>:<data type>}
```

- `name` — 占位符标识符。相应的命令行选项为 `--param_<name> = value`。
- `data type` — 参数的数据类型。比如，像 `(integer, ('string', integer))` 这样的数据结构可以有 `Tuple(UInt8, Tuple(String, UInt8))` 数据类型（您还可以使用其他 [integer](../sql-reference/data-types/int-uint.md) 类型）。还可以将表名、数据库名和列名作为参数传递，在这种情况下，您需要使用 `Identifier` 作为数据类型。

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

- `Alt (Option) + Shift + e` - 打开带有当前查询的编辑器。可以通过环境变量 `EDITOR` 指定要使用的编辑器。默认使用 `vim`。
- `Alt (Option) + #` - 注释行。
- `Ctrl + r` - 模糊历史搜索。

所有可用键盘快捷键的完整列表请参见 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)。

:::tip
要配置 MacOS 上元键（Option）的正确工作：

iTerm2：转到首选项 -> 配置文件 -> 键 -> 左 Option 键并单击 Esc+
:::

## 连接字符串 {#connection_string}

ClickHouse 客户端还支持使用类似于 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) 和 [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 的连接字符串连接到 ClickHouse 服务器。其语法如下：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**组件**

- `user` - （可选）数据库用户名。默认值：`default`。
- `password` - （可选）数据库用户密码。如果指定了 `:` 且密码为空，客户端将提示输入用户的密码。
- `hosts_and_ports` - （可选）主机和可选端口的列表 `host[:port] [, host:[port]], ...`，默认值：`localhost:9000`。
- `database` - （可选）数据库名称。默认值：`default`。
- `query_parameters` - （可选）键值对列表 `param1=value1[,&param2=value2], ...`。对于某些参数，无需值。参数名称和值区分大小写。

如果在连接字符串中指定了用户名、密码或数据库，则不能使用 `--user`、`--password` 或 `--database`（反之亦然）进行指定。

主机组件可以是主机名或 IPv4 或 IPv6 地址。IPv6 地址应放在方括号中：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。ClickHouse 客户端将根据从左到右的顺序尝试连接到这些主机。建立连接后，将不再尝试连接到其余主机。

连接字符串必须作为 `clickHouse-client` 的第一个参数指定。连接字符串可以与任意其他 [命令行选项](#command-line-options) 结合使用，除了 `--host` 和 `--port`。

以下键允许用于 `query_parameters`：

- `secure` 或缩写 `s`。如果指定，客户端将通过安全连接（TLS）连接到服务器。有关 `--secure` 的更多信息，请参见 [命令行选项](#command-line-options)。

**百分比编码**

`user`、`password`、`hosts`、`database` 和 `query parameters` 中的非美国 ASCII 字符、空格和特殊字符必须进行 [百分比编码](https://en.wikipedia.org/wiki/URL_encoding)。

### 示例 {#connection_string_examples}

连接到 `localhost` 的 9000 端口并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

以用户 `john` 和密码 `secret` 连接到 `localhost`，主机为 `127.0.0.1` 和端口为 `9000`。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

作为 `default` 用户连接到 `localhost`，主机为 IPV6 地址 `[::1]` 和端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

在多行模式下连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

使用 `default` 用户连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://default@localhost:9000


# 等价于:
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost` 的 9000 端口，并默认使用 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# 等价于:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

连接到 `localhost` 的 9000 端口，并在连接字符串中指定 `my_database` 数据库，并使用缩写 `s` 参数进行安全连接。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# 等价于:
clickhouse-client clickhouse://localhost/my_database -s
```

连接到默认主机，使用默认端口、默认用户和默认数据库。

```bash
clickhouse-client clickhouse:
```

连接到默认主机，使用默认端口，以用户 `my_user` 连接且无密码。

```bash
clickhouse-client clickhouse://my_user@


# 在 : 和 @ 之间使用空白密码意味着请求用户输入密码。
clickhouse-client clickhouse://my_user:@
```

使用电子邮件作为用户名连接到 `localhost`，`@` 符号进行百分比编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到两个主机之一：`192.168.1.15`，`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## 查询 ID 格式 {#query-id-format}

在交互模式中，ClickHouse 客户端会为每个查询显示查询 ID。默认情况下，ID 的格式如下：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件中通过 `query_id_formats` 标签指定自定义格式。格式字符串中的 `{query_id}` 占位符将替换为查询 ID。该功能可用于生成 URL，以便更好地分析查询。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

使用上述配置，查询 ID 以以下格式显示：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 配置文件 {#configuration_files}

ClickHouse 客户端使用以下第一个存在的文件：

- 通过 `-c [ -C, --config, --config-file ]` 参数定义的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

有关示例配置文件，请参见 ClickHouse 存储库：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

相同的 YAML 格式配置：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## 命令行选项 {#command-line-options}

所有命令行选项可以直接在命令行中指定，也可以作为 [配置文件](#configuration_files) 中的默认值。

### 一般选项 {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

ClickHouse 客户端的配置文件位置，如果不在默认位置之一。有关更多信息，请参见 [配置文件](#configuration_files)。

**`--help`**

打印使用摘要并退出。与 `--verbose` 组合以显示所有可能的选项，包括查询设置。

**`--history_file <path-to-file>`**

 包含命令历史记录的文件路径。

**`--history_max_entries`**

历史记录文件中条目的最大数量。

默认值：1000000（100 万）

**`--prompt <prompt>`**

指定自定义提示。

默认值：服务器的 `display_name`。

**`--verbose`**

增加输出的详细性。

**`-V [ --version ]`**

打印版本并退出。

### 连接选项 {#command-line-options-connection}

**`--connection <name>`**

预先配置的连接详细信息的名称，从配置文件中获取。请参见 [连接凭据](#connection-credentials)。

**`-d [ --database ] <database>`**

选择用于此连接的默认数据库。

默认值：来自服务器设置的当前数据库（默认值：`default`）。

**`-h [ --host ] <host>`**

要连接的 ClickHouse 服务器的主机名。可以是主机名或 IPv4 或 IPv6 地址。可以通过多个参数传递多个主机。

默认值：localhost

**`--jwt <value>`**

使用 JSON Web Token (JWT) 进行身份验证。

服务器 JWT 授权仅在 ClickHouse Cloud 中可用。

**`--no-warnings`**

在客户端连接到服务器时禁用显示来自 `system.warnings` 的警告。

**`--password <password>`**

数据库用户的密码。您还可以在配置文件中指定连接的密码。如果未指定密码，客户端将要求输入。

**`--port <port>`**

服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。

注意：客户端使用原生协议而不是 HTTP(S)。

默认值：如果指定了 `--secure`，则为 9440，否则为 9000。如果主机名以 `.clickhouse.cloud` 结尾，则始终默认为 9440。

**`-s [ --secure ]`**

是否使用 TLS。

在连接到端口 9440（默认安全端口）或 ClickHouse Cloud 时自动启用。

您可能需要在 [配置文件](#configuration_files) 中配置您的 CA 证书。可用的配置设置与 [服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl) 相同。

**`--ssh-key-file <path-to-file>`**

用于与服务器进行身份验证的 SSH 私钥文件。

**`--ssh-key-passphrase <value>`**

为 `--ssh-key-file` 中指定的 SSH 私钥提供口令。

**`-u [ --user ] <username>`**

要连接的数据库用户。

默认值：default

除了 `--host`、`--port`、`--user` 和 `--password` 选项外，客户端还支持 [连接字符串](#connection_string)。

### 查询选项 {#command-line-options-query}

**`--param_<name>=<value>`**

带参数的 [查询](#cli-queries-with-parameters) 的替代值。

**`-q [ --query ] <query>`**

要以批处理模式运行的查询。可以多次指定（`--query "SELECT 1" --query "SELECT 2"`）或一次多个分号分隔的查询（`--query "SELECT 1; SELECT 2;"`）。在后一种情况下，格式与 `VALUES` 不同的 `INSERT` 查询必须通过空行分隔。

还可以在未提供参数的情况下指定单个查询：
```bash
$ clickhouse-client "SELECT 1"
1
```

不能与 `--queries-file` 一起使用。

**`--queries-file <path-to-file>`**

包含查询的文件路径。可以多次指定 `--queries-file`，例如 `--queries-file  queries1.sql --queries-file  queries2.sql`。

不能与 `--query` 一起使用。

**`-m [ --multiline ]`**

如果指定，则允许多行查询（不会在按下 Enter 时发送查询）。只有在以分号结束时，查询才会被发送。

### 查询设置 {#command-line-options-query-settings}

查询设置可以作为客户端中的命令行选项指定，例如：
```bash
$ clickhouse-client --max_threads 1
```

有关设置列表，请参见 [设置](../operations/settings/settings.md)。

### 格式选项 {#command-line-options-formatting}

**`-f [ --format ] <format>`**

使用指定格式输出结果。

有关支持格式的列表，请参见 [输入和输出数据的格式](formats.md)。

默认值：TabSeparated

**`--pager <command>`**

将所有输出管道传输到该命令。通常是 `less`（例如，`less -S` 以显示宽结果集）或类似的命令。

**`-E [ --vertical ]`**

使用 [垂直格式](../interfaces/formats.md#vertical) 输出结果。这与 `--format Vertical` 相同。在此格式中，每个值都将在单独的行上打印，这在显示宽表时是有用的。

### 执行细节 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

通过按控制键（空格）启用进度表的切换。仅适用于交互模式且启用进度表打印时。

默认值：启用

**`--hardware-utilization`**

在进度条中打印硬件利用率信息。

**`--memory-usage`**

如果指定，在非交互模式下将内存使用情况打印到 `stderr`。

可能值：
- `none` - 不打印内存使用情况
- `default` - 打印字节数
- `readable` - 以人类可读的格式打印内存使用情况

**`--print-profile-events`**

打印 `ProfileEvents` 数据包。

**`--progress`**

打印查询执行的进度。

可能值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度打印

默认值：交互模式为 `tty`，非交互模式（批处理）为 `off`。

**`--progress-table`**

在查询执行期间打印带有变化指标的进度表。

可能值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度表

默认值：交互模式为 `tty`，非交互模式（批处理）为 `off`。

**`--stacktrace`**

打印异常的堆栈跟踪。

**`-t [ --time ]`**

在非交互模式下，将查询执行时间打印到 `stderr`（用于基准测试）。
