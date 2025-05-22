import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouse 提供了一个原生的命令行客户端，可直接对 ClickHouse 服务器执行 SQL 查询。它支持交互模式（用于实时查询执行）和批处理模式（用于脚本和自动化）。查询结果可以在终端中显示，也可以导出到文件，支持所有 ClickHouse 输出 [格式](formats.md)，如 Pretty、CSV、JSON 等。

客户端在查询执行时提供实时反馈，包括进度条、读取的行数、处理的字节数和查询执行时间。它支持 [命令行选项](#command-line-options) 和 [配置文件](#configuration_files)。

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

不同的客户端和服务器版本之间是兼容的，但某些功能可能在较旧的客户端中不可用。我们建议客户端和服务器使用相同版本。

## 运行 {#run}

:::note
如果您仅下载了但未安装 ClickHouse，请使用 `./clickhouse client` 而不是 `clickhouse-client`。
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

**`--port <port>`** - ClickHouse 服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。请注意，ClickHouse 客户端使用的是原生协议，而不是 HTTP(S)。

**`-s [ --secure ]`** - 是否使用 TLS（通常自动检测）。

**`-u [ --user ] <username>`** - 以哪个数据库用户进行连接。默认情况下以 `default` 用户连接。

**`--password <password>`** - 数据库用户的密码。您也可以在配置文件中为连接指定密码。如果未指定密码，客户端会提示您输入。

**`-c [ --config ] <path-to-file>`** - ClickHouse 客户端的配置文件的位置，如果它不在默认位置之一。请参见 [配置文件](#configuration_files)。

**`--connection <name>`** - 配置文件中预配置的连接详细信息的名称。

有关命令行选项的完整列表，请参见 [命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

您的 ClickHouse Cloud 服务的详细信息可在 ClickHouse Cloud 控制台中找到。选择要连接的服务，然后单击 **连接**：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud service connect button"
/>

<br/><br/>

选择 **Native**，并将显示详细信息及示例 `clickhouse-client` 命令：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP connection details"
/>

### 将连接存储在配置文件中 {#connection-credentials}

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

有关更多信息，请参阅 [配置文件部分](#configuration_files)。

:::note
为了集中精力在查询语法上，其余示例省略了连接详细信息（`--host`、`--port` 等）。请记得在使用命令时添加这些参数。
:::

## 批处理模式 {#batch-mode}

您可以以批处理模式运行 ClickHouse 客户端，而不是以交互方式使用它。

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

您可以在 `stdin` 上提供查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当指定 `--query` 时，任何输入都会在换行符后附加到请求中。

**将 CSV 文件插入远程 ClickHouse 服务**

此示例正在将示例数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中的现有表 `cell_towers`：

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

## 注释 {#notes}

在交互模式下，默认输出格式为 `PrettyCompact`。您可以在查询的 `FORMAT` 子句中更改格式，或通过指定 `--format` 命令行选项来更改格式。要使用垂直格式，可以使用 `--vertical` 或在查询末尾指定 `\G`。在此格式下，每个值打印在单独的行上，这对宽表很方便。

在批处理模式下，默认的数据 [格式](formats.md) 为 `TabSeparated`。您可以在查询的 `FORMAT` 子句中设置格式。

在交互模式下，默认情况下，无论输入什么，在按下 `Enter` 时运行。查询末尾不需要分号。

您可以使用 `-m, --multiline` 参数启动客户端。要输入多行查询，请在换行符之前输入反斜杠 `\`。在您按下 `Enter` 后，系统会提示您输入查询的下一行。要运行查询，请以分号结束它并按 `Enter`。

ClickHouse 客户端基于 `replxx`（类似于 `readline`），因此它使用熟悉的键盘快捷方式并保留历史。历史默认写入 `~/.clickhouse-client-history`。

要退出客户端，请按 `Ctrl+D`，或输入以下任一内容代替查询：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

在处理查询时，客户端显示：

1.  进度，默认情况下每秒更新不超过 10 次。对于快速查询，进度可能没有时间显示。
2.  解析后的格式化查询，供调试使用。
3.  指定格式的结果。
4.  结果中的行数、经过的时间和查询处理的平均速度。所有数据量均指未压缩数据。

您可以通过按 `Ctrl+C` 取消长查询。但您仍需稍等，服务器才会中止请求。在某些阶段无法取消查询。如果未等候而第二次按 `Ctrl+C`，客户端将退出。

ClickHouse 客户端允许传递外部数据（外部临时表）进行查询。有关更多信息，请参见 [查询处理的外部数据](../engines/table-engines/special/external-data.md) 部分。

## 带参数的查询 {#cli-queries-with-parameters}

您可以在查询中指定参数，并通过命令行选项传递值。这避免了在客户端侧格式化带有特定动态值的查询。例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

在交互会话中还可以设置参数：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，将您希望使用命令行参数填充的值放在大括号中，格式如下：

```sql
{<name>:<data type>}
```

- `name` — 占位符标识符。对应的命令行选项是 `--param_<name> = value`。
- `data type` — 参数的 [数据类型](../sql-reference/data-types/index.md)。例如，数据结构如 `(integer, ('string', integer))` 的数据类型可以是 `Tuple(UInt8, Tuple(String, UInt8))`（也可以使用其他 [整数](../sql-reference/data-types/int-uint.md) 类型）。还可以将表名、数据库名和列名作为参数传递，在这种情况下，您需要使用 `Identifier` 作为数据类型。

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
- `.` - 重复最后一个查询

## 键盘快捷方式 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 打开当前查询的编辑器。可以使用环境变量 `EDITOR` 指定要使用的编辑器。默认使用 `vim`。
- `Alt (Option) + #` - 注释行。
- `Ctrl + r` - 模糊历史搜索。

所有可用键盘快捷方式的完整列表可以在 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) 中找到。

:::tip
要配置 Meta 键（Option）在 MacOS 上的正确工作：

iTerm2: 转到 Preferences -> Profile -> Keys -> Left Option key，点击 Esc+
:::

## 连接字符串 {#connection_string}

ClickHouse 客户端还支持使用类似于 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 的连接字符串连接到 ClickHouse 服务器。它具有以下语法：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**组件**

- `user` - （可选）数据库用户名。默认值：`default`。
- `password` - （可选）数据库用户密码。如果指定了 `:` 且密码为空，客户端会提示输入用户的密码。
- `hosts_and_ports` - （可选）主机列表和可选端口 `host[:port] [, host:[port]], ...`。默认值：`localhost:9000`。
- `database` - （可选）数据库名称。默认值：`default`。
- `query_parameters` - （可选）键值对列表 `param1=value1[,&param2=value2], ...`。对于某些参数，不需要值。参数名称和词法内容区分大小写。

如果在连接字符串中指定了用户名、密码或数据库，则不能使用 `--user`、`--password` 或 `--database` 指定（反之亦然）。

主机组件可以是主机名或 IPv4 或 IPv6 地址。IPv6 地址应放在方括号中：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。ClickHouse 客户端将按顺序尝试连接这些主机（从左到右）。一旦建立连接，将不再尝试连接其余主机。

连接字符串必须指定为 `clickHouse-client` 的第一个参数。连接字符串可以与任意其他 [命令行选项](#command-line-options) 结合使用，除 `--host` 和 `--port`。

`query_parameters` 允许以下键：

- `secure` 或缩写为 `s`。如果指定，客户端将通过安全连接（TLS）连接到服务器。请参见 [命令行选项](#command-line-options) 中的 `--secure`。

**百分比编码**

`user`、`password`、`hosts`、`database` 和 `query parameters` 中的非美国 ASCII、空格和特殊字符必须进行 [百分比编码](https://en.wikipedia.org/wiki/URL_encoding)。

### 示例 {#connection_string_examples}

连接到 `localhost` 的 9000 端口并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

连接到 `localhost` 作为用户 `john`，密码为 `secret`，主机为 `127.0.0.1`，端口为 `9000`

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

连接到 `localhost` 作为 `default` 用户，主机是 IPV6 地址的 `localhost`，端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

在多行模式下连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

以用户 `default` 连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost` 的 9000 端口并默认包含 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

以连接字符串指定的 `my_database` 数据库连接到 `localhost` 的 9000 端口，并使用缩写参数 `s` 进行安全连接。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

连接到默认主机，使用默认端口、默认用户和默认数据库。

```bash
clickhouse-client clickhouse:
```

连接到默认主机，使用默认端口，作为用户 `my_user`，且没有密码。

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

使用电子邮件作为用户名连接到 `localhost`。`@` 符号被百分比编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到两个主机之一：`192.168.1.15`，`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## 查询 ID 格式 {#query-id-format}

在交互模式下，ClickHouse 客户端会为每个查询显示查询 ID。默认情况下，ID 格式如下：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件中通过 `query_id_formats` 标签指定自定义格式。格式字符串中的 `{query_id}` 占位符将替换为查询 ID。该标签内允许多个格式字符串。
此功能可用于生成 URL 以便于查询分析。

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

ClickHouse 客户端会使用以下第一个现有文件：

- 使用 `-c [ -C, --config, --config-file ]` 参数定义的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

有关示例配置文件，请参见 ClickHouse 存储库中的 [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)。

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

以 YAML 格式表示的相同配置：

```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## 命令行选项 {#command-line-options}

所有命令行选项都可以在命令行中直接指定，或在 [配置文件](#configuration_files) 中作为默认值指定。

### 通用选项 {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

客户端的配置文件位置，如果不在默认位置之一。请参见 [配置文件](#configuration_files)。

**`--help`**

打印用法摘要并退出。与 `--verbose` 结合使用以显示所有可能选项，包括查询设置。

**`--history_file <path-to-file>`**

包含命令历史的文件路径。

**`--history_max_entries`**

历史文件中最大条目数。

默认值：1000000（100 万）

**`--prompt <prompt>`**

指定自定义提示。

默认值：服务器的 `display_name`。

**`--verbose`**

增加输出详细程度。

**`-V [ --version ]`**

打印版本并退出。

### 连接选项 {#command-line-options-connection}

**`--connection <name>`**

配置文件中预配置的连接详细信息的名称。请参见 [连接凭证](#connection-credentials)。

**`-d [ --database ] <database>`**

选择此连接的默认数据库。

默认值：来自服务器设置的当前数据库（默认值为 `default`）。

**`-h [ --host ] <host>`**

要连接的 ClickHouse 服务器的主机名。可以是主机名或 IPv4 或 IPv6 地址。可以通过多个参数传递多个主机。

默认值：localhost

**`--jwt <value>`**

使用 JSON Web Token (JWT) 进行身份验证。

服务器 JWT 授权仅在 ClickHouse Cloud 中可用。

**`--no-warnings`**

在客户端连接到服务器时禁用显示来自 `system.warnings` 的警告。

**`--password <password>`**

数据库用户的密码。您也可以在配置文件中为连接指定密码。如果未指定密码，客户端会提示您输入。

**`--port <port>`**

服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。

注意：客户端使用的是原生协议，而不是 HTTP(S)。

默认值：如果指定了 `--secure`，则为 9440，否则为 9000。如果主机名以 `.clickhouse.cloud` 结尾，则始终默认到 9440。

**`-s [ --secure ]`**

是否使用 TLS。

在连接到 9440 端口（默认安全端口）或 ClickHouse Cloud 时自动启用。

您可能需要在 [配置文件](#configuration_files) 中配置 CA 证书。可用的配置设置与 [服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl) 相同。

**`--ssh-key-file <path-to-file>`**

包含用于与服务器进行身份验证的 SSH 私钥的文件。

**`--ssh-key-passphrase <value>`**

在 `--ssh-key-file` 中指定的 SSH 私钥的密码短语。

**`-u [ --user ] <username>`**

要连接的数据库用户。

默认值：default

除了 `--host`、`--port`、`--user` 和 `--password` 选项外，客户端还支持 [连接字符串](#connection_string)。

### 查询选项 {#command-line-options-query}

**`--param_<name>=<value>`**

参数的值替代 [带参数的查询](#cli-queries-with-parameters) 的值。

**`-q [ --query ] <query>`**

在批处理模式下运行的查询。可以多次指定（`--query "SELECT 1" --query "SELECT 2"`）或一次指定多个以分号分隔的查询（`--query "SELECT 1; SELECT 2;"`）。在后者的情况下，格式不为 `VALUES` 的 `INSERT` 查询必须用空行分隔。

可以不带参数指定单个查询：
```bash
$ clickhouse-client "SELECT 1"
1
```

不能与 `--queries-file` 一起使用。

**`--queries-file <path-to-file>`**

包含查询的文件路径。可以多次指定 `--queries-file`，例如 `--queries-file queries1.sql --queries-file queries2.sql`。

不能与 `--query` 一起使用。

**`-m [ --multiline ]`**

如果指定，允许多行查询（在 Enter 上不发送查询）。查询仅在以分号结束时发送。

### 查询设置 {#command-line-options-query-settings}

查询设置可以作为客户端中的命令行选项指定，例如：
```bash
$ clickhouse-client --max_threads 1
```

有关设置的列表，请参见 [设置](../operations/settings/settings.md)。

### 格式选项 {#command-line-options-formatting}

**`-f [ --format ] <format>`**

使用指定格式输出结果。

有关支持的格式列表，请参见 [输入和输出数据的格式](formats.md)。

默认值：TabSeparated

**`--pager <command>`**

将所有输出通过该命令管道。通常使用 `less`（例如，`less -S` 用于显示宽结果集）或类似工具。

**`-E [ --vertical ]`**

使用 [垂直格式](../interfaces/formats.md#vertical) 输出结果。这与 `–-format Vertical` 相同。在此格式下，每个值打印在单独的行上，这对于显示宽表非常有帮助。

### 执行详细信息 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

通过按下控制键（空格）启用切换进度表。仅适用于启用进度表打印的交互模式。

默认值：启用

**`--hardware-utilization`**

打印进度条中的硬件利用率信息。

**`--memory-usage`**

如果指定，打印内存使用情况到 `stderr` 的非交互模式。

可能的值：
- `none` - 不打印内存使用情况
- `default` - 打印字节数
- `readable` - 以人类可读的格式打印内存使用情况

**`--print-profile-events`**

打印 `ProfileEvents` 数据包。

**`--progress`**

打印查询执行的进度。

可能的值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度打印

默认值：交互模式为 `tty`，非交互（批处理）模式为 `off`。

**`--progress-table`**

在查询执行期间打印带变化指标的进度表。

可能的值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度表

默认值：交互模式为 `tty`，非交互（批处理）模式为 `off`。

**`--stacktrace`**

打印异常的堆栈跟踪。

**`-t [ --time ]`**

在非交互模式下将查询执行时间打印到 `stderr`（用于基准测试）。
