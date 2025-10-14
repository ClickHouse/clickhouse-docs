---
'description': 'ClickHouse 命令行客户端接口的文档'
'sidebar_label': 'ClickHouse 客户端'
'sidebar_position': 17
'slug': '/interfaces/cli'
'title': 'ClickHouse 客户端'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouse 提供了一个本地命令行客户端，用于直接在 ClickHouse 服务器上执行 SQL 查询。它支持交互模式（用于实时查询执行）和批处理模式（用于脚本和自动化）。查询结果可以在终端中显示或导出到文件，支持所有 ClickHouse 输出 [格式](formats.md)，例如 Pretty、CSV、JSON 等。

客户端提供实时反馈，包括查询执行进度、已读取行数、处理的字节数和查询执行时间。它支持 [命令行选项](#command-line-options) 和 [配置文件](#configuration_files)。

## 安装 {#install}

要下载 ClickHouse，请运行：

```bash
curl https://clickhouse.com/ | sh
```

要同时安装它，请运行：
```bash
sudo ./clickhouse install
```

请参见 [安装 ClickHouse](../getting-started/install/install.mdx) 以获取更多安装选项。

不同的客户端和服务器版本之间是兼容的，但某些功能可能在较旧的客户端中不可用。我们建议客户端和服务器使用相同版本。

## 运行 {#run}

:::note
如果您只下载了但未安装 ClickHouse，请使用 `./clickhouse client` 而不是 `clickhouse-client`。
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

**`--port <port>`** - ClickHouse 服务器接受连接的端口。默认端口为 9440（TLS）和 9000（非 TLS）。请注意，ClickHouse 客户端使用原生协议而非 HTTP(S)。

**`-s [ --secure ]`** - 是否使用 TLS（通常自动检测）。

**`-u [ --user ] <username>`** - 以数据库用户身份连接。默认连接为 `default` 用户。

**`--password <password>`** - 数据库用户的密码。您也可以在配置文件中为连接指定密码。如果不指定密码，客户端会询问您输入。

**`-c [ --config ] <path-to-file>`** - ClickHouse 客户端配置文件的位置，如果它不在默认位置之一。请参见 [配置文件](#configuration_files)。

**`--connection <name>`** - 配置文件中预配置的连接详细信息的名称。

有关命令行选项的完整列表，请参见 [命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

您的 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。选择您想要连接的服务，然后单击 **连接**：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud 服务连接按钮"
/>

<br/><br/>

选择 **原生**，然后显示详细信息和示例 `clickhouse-client` 命令：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud 原生 TCP 连接详细信息"
/>

### 在配置文件中存储连接 {#connection-credentials}

您可以在 [配置文件](#configuration_files) 中存储一个或多个 ClickHouse 服务器的连接详细信息。

其格式如下：
```xml
<config>
    <connections_credentials>
        <connection>
            <name>default</name>
            <hostname>hostname</hostname>
            <port>9440</port>
            <secure>1</secure>
            <user>default</user>
            <password>password</password>
            <!-- <history_file></history_file> -->
            <!-- <history_max_entries></history_max_entries> -->
            <!-- <accept-invalid-certificate>false</accept-invalid-certificate> -->
            <!-- <prompt></prompt> -->
        </connection>
    </connections_credentials>
</config>
```

请参见 [关于配置文件的部分](#configuration_files) 以获得更多信息。

:::note
为了集中注意力于查询语法，其余示例省略了连接详细信息（`--host`、`--port` 等）。请记住在使用命令时添加它们。
:::

## 批处理模式 {#batch-mode}

您可以选择以批处理模式运行 ClickHouse 客户端，而不是交互式使用。

可以像这样指定单个查询：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

您还可以使用 `--query` 命令行选项：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

您可以通过 `stdin` 提供查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当指定了 `--query` 时，任何输入都将在换行后附加到请求中。

**将 CSV 文件插入远程 ClickHouse 服务**

此示例将一个示例数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中的现有表 `cell_towers` 中：

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

在交互模式下，默认输出格式为 `PrettyCompact`。您可以通过查询的 `FORMAT` 子句或指定 `--format` 命令行选项来更改格式。要使用垂直格式，您可以使用 `--vertical` 或在查询末尾指定 `\G`。在这种格式中，每个值都打印在单独的行上，这对于宽表非常方便。

在批处理模式下，默认数据 [格式](formats.md) 为 `TabSeparated`。您可以在查询的 `FORMAT` 子句中设置格式。

在交互模式中，默认情况下，无论输入什么内容，按 `Enter` 时都会执行。查询末尾不需要分号。

您可以使用 `-m, --multiline` 参数启动客户端。要输入多行查询，请在换行符之前输入反斜杠 `\`。按 `Enter` 后，系统将提示您输入查询的下一行。要运行查询，请以分号结束并按 `Enter`。

ClickHouse 客户端基于 `replxx`（类似于 `readline`），因此使用熟悉的键盘快捷键并且保留历史记录。历史记录默认写入 `~/.clickhouse-client-history`。

要退出客户端，请按 `Ctrl+D`，或输入以下之一作为查询：`exit`、`quit`、`logout`、`exit;`、`quit;`、`logout;`、`q`、`Q`、`:q`。

在处理查询时，客户端显示：

1.  进度，默认情况下每秒更新不超过 10 次。对于快速查询，可能没有时间显示进度。
2.  解析后的格式化查询，用于调试。
3.  以指定格式的结果。
4.  结果中的行数、已用时间和查询处理的平均速度。所有数据量均指未压缩数据。

您可以通过按 `Ctrl+C` 来取消长查询。但是，您仍然需要等待一小会儿，让服务器终止请求。在某些阶段无法取消查询。如果您不等待并再次按 `Ctrl+C`，客户端将退出。

ClickHouse 客户端允许传递外部数据（外部临时表）以进行查询处理。有关更多信息，请参阅 [查询处理的外部数据](../engines/table-engines/special/external-data.md) 一节。

## 带参数的查询 {#cli-queries-with-parameters}

您可以在查询中指定参数，通过命令行选项传递值。这样可以避免在客户端侧格式化带有特定动态值的查询。例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

还可以在交互会话中设置参数：
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，将您希望使用命令行参数填充的值放在大括号中，如下格式：

```sql
{<name>:<data type>}
```

- `name` — 占位符标识符。对应的命令行选项为 `--param_<name>=value`。
- `data type` — 参数的 [数据类型](../sql-reference/data-types/index.md)。例如，结构如 `(integer, ('string', integer))` 可以具有 `Tuple(UInt8, Tuple(String, UInt8))` 数据类型（您也可以使用其他 [整数](../sql-reference/data-types/int-uint.md) 类型）。参数还可以传递表名、数据库名和列名，此时您需要使用 `Identifier` 作为数据类型。

### 示例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AI 驱动的 SQL 生成 {#ai-sql-generation}

ClickHouse 客户端包括内置的 AI 辅助功能，可以根据自然语言描述生成 SQL 查询。此功能帮助用户在不深入了解 SQL 的情况下编写复杂查询。

如果设置了 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 环境变量，AI 辅助功能可以开箱即用。有关更高级的配置，请参阅 [配置](#ai-sql-generation-configuration) 部分。

### 使用 {#ai-sql-generation-usage}

要使用 AI SQL 生成，请在自然语言查询前加上 `??`：

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI 将会：
1. 自动探索您的数据库模式
2. 基于发现的表和列生成适当的 SQL
3. 立即执行生成的查询

### 示例 {#ai-sql-generation-example}

```bash
:) ?? count orders by product category

Starting AI SQL generation with schema discovery...
──────────────────────────────────────────────────

🔍 list_databases
   ➜ system, default, sales_db

🔍 list_tables_in_database
   database: sales_db
   ➜ orders, products, categories

🔍 get_schema_for_table
   database: sales_db
   table: orders
   ➜ CREATE TABLE orders (order_id UInt64, product_id UInt64, quantity UInt32, ...)

✨ SQL query generated successfully!
──────────────────────────────────────────────────

SELECT 
    c.name AS category,
    COUNT(DISTINCT o.order_id) AS order_count
FROM sales_db.orders o
JOIN sales_db.products p ON o.product_id = p.product_id
JOIN sales_db.categories c ON p.category_id = c.category_id
GROUP BY c.name
ORDER BY order_count DESC
```

### 配置 {#ai-sql-generation-configuration}

AI SQL 生成需要在 ClickHouse 客户端配置文件中配置一个 AI 提供者。您可以使用 OpenAI、Anthropic 或任何兼容 OpenAI 的 API 服务。

#### 基于环境的后备 {#ai-sql-generation-fallback}

如果在配置文件中未指定 AI 配置，ClickHouse 客户端将自动尝试使用环境变量：

1. 首先检查 `OPENAI_API_KEY` 环境变量
2. 如果未找到，则检查 `ANTHROPIC_API_KEY` 环境变量
3. 如果两者都未找到，则 AI 特性将被禁用

这允许在没有配置文件的情况下快速设置：
```bash

# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client


# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 配置文件 {#ai-sql-generation-configuration-file}

为了更好地控制 AI 设置，请在您的 ClickHouse 客户端配置文件中进行配置，位置如下：
- `~/.clickhouse-client/config.xml`（XML 格式）
- `~/.clickhouse-client/config.yaml`（YAML 格式）
- 或使用 `--config-file` 指定自定义路径

**XML 格式示例：**

```xml
<config>
    <ai>
        <!-- Required: Your API key (or set via environment variable) -->
        <api_key>your-api-key-here</api_key>

        <!-- Required: Provider type (openai, anthropic) -->
        <provider>openai</provider>

        <!-- Model to use (defaults vary by provider) -->
        <model>gpt-4o</model>

        <!-- Optional: Custom API endpoint for OpenAI-compatible services -->
        <!-- <base_url>https://openrouter.ai/api</base_url> -->

        <!-- Schema exploration settings -->
        <enable_schema_access>true</enable_schema_access>

        <!-- Generation parameters -->
        <temperature>0.0</temperature>
        <max_tokens>1000</max_tokens>
        <timeout_seconds>30</timeout_seconds>
        <max_steps>10</max_steps>

        <!-- Optional: Custom system prompt -->
        <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
    </ai>
</config>
```

**YAML 格式示例：**

```yaml
ai:
  # Required: Your API key (or set via environment variable)
  api_key: your-api-key-here

  # Required: Provider type (openai, anthropic)
  provider: openai

  # Model to use
  model: gpt-4o

  # Optional: Custom API endpoint for OpenAI-compatible services
  # base_url: https://openrouter.ai/api

  # Enable schema access - allows AI to query database/table information
  enable_schema_access: true

  # Generation parameters
  temperature: 0.0      # Controls randomness (0.0 = deterministic)
  max_tokens: 1000      # Maximum response length
  timeout_seconds: 30   # Request timeout
  max_steps: 10         # Maximum schema exploration steps

  # Optional: Custom system prompt
  # system_prompt: |
  #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
  #   Focus on performance and use ClickHouse-specific optimizations.
  #   Always return executable SQL without explanations.
```

**使用兼容 OpenAI 的 API（例如 OpenRouter）：**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**最小配置示例：**

```yaml

# Minimal config - uses environment variable for API key
ai:
  provider: openai  # Will use OPENAI_API_KEY env var


# No config at all - automatic fallback

# (Empty or no ai section - will try OPENAI_API_KEY then ANTHROPIC_API_KEY)


# Only override model - uses env var for API key
ai:
  provider: openai
  model: gpt-3.5-turbo
```

### 参数 {#ai-sql-generation-parameters}

**必需参数：**
- `api_key` - 您的 AI 服务的 API 密钥。如果通过环境变量设置，则可以省略：
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注意：配置文件中的 API 密钥优先于环境变量
- `provider` - AI 提供者：`openai` 或 `anthropic`
  - 如果省略，将基于可用的环境变量使用自动后备

**模型配置：**
- `model` - 要使用的模型（默认：特定于提供者）
  - OpenAI: `gpt-4o`、`gpt-4`、`gpt-3.5-turbo` 等。
  - Anthropic: `claude-3-5-sonnet-20241022`、`claude-3-opus-20240229` 等。
  - OpenRouter：使用其模型命名，如 `anthropic/claude-3.5-sonnet`

**连接设置：**
- `base_url` - OpenAI 兼容服务的自定义 API 端点（可选）
- `timeout_seconds` - 请求超时时间（默认：`30`）

**模式探索：**
- `enable_schema_access` - 允许 AI 探索数据库模式（默认：`true`）
- `max_steps` - 模式探索的最大工具调用步骤（默认：`10`）

**生成参数：**
- `temperature` - 控制随机性，0.0 = 确定性，1.0 = 创造性（默认：`0.0`）
- `max_tokens` - 最大响应长度（以令牌计算，默认：`1000`）
- `system_prompt` - AI 的自定义指令（可选）

### 工作原理 {#ai-sql-generation-how-it-works}

AI SQL 生成器使用多步过程：

1. **模式发现**：AI 使用内置工具探索您的数据库：
- 列出可用的数据库 - 在相关数据库中发现表 - 通过 `CREATE TABLE` 语句检查表结构

2. **查询生成**：根据发现的模式，AI 生成 SQL：
- 符合您的自然语言意图 - 使用正确的表和列名称 - 应用适当的连接和聚合
3. **执行**：生成的 SQL 被自动执行并显示结果

### 限制 {#ai-sql-generation-limitations}

- 需要活跃的互联网连接
- API 的使用受限于速度限制和 AI 提供者的费用
- 复杂查询可能需要多次调整
- AI 只能访问模式信息，没有实际数据的读取权限

### 安全性 {#ai-sql-generation-security}

- API 密钥从不发送给 ClickHouse 服务器
- AI 仅查看模式信息（表/列名称和类型），而不查看实际数据
- 所有生成的查询均遵循您现有的数据库权限

## 别名 {#cli_aliases}

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 重复上一个查询

## 键盘快捷键 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 使用当前查询打开编辑器。可以使用环境变量 `EDITOR` 指定要使用的编辑器。默认使用 `vim`。
- `Alt (Option) + #` - 注释行。
- `Ctrl + r` - 模糊历史搜索。

完整的键盘快捷键列表可在 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) 上查看。

:::tip
要配置 MacOS 上元键（Option）的正确工作：

iTerm2: 转到首选项 -> 配置文件 -> 键 -> 左 Option 键并单击 Esc+
:::

## 连接字符串 {#connection_string}

ClickHouse 客户端还支持使用与 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 类似的连接字符串连接到 ClickHouse 服务器。它的语法如下：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**组件**

- `user` - （可选）数据库用户名。默认：`default`。
- `password` - （可选）数据库用户密码。如果指定了 `:` 且密码为空，客户端将提示输入用户密码。
- `hosts_and_ports` - （可选）主机和可选端口的列表 `host[:port] [, host:[port]], ...`。默认：`localhost:9000`。
- `database` - （可选）数据库名称。默认：`default`。
- `query_parameters` - （可选）键值对列表 `param1=value1[,&param2=value2], ...`。对于某些参数，不需要值。参数名称和值是大小写敏感的。

如果在连接字符串中指定了用户名、密码或数据库，则不能通过 `--user`、`--password` 或 `--database` 指定（反之亦然）。

主机组件可以是主机名或 IPv4 或 IPv6 地址。IPv6 地址应放在方括号中：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。ClickHouse 客户端将按顺序（从左到右）尝试连接这些主机。建立连接后，不再尝试连接其余主机。

连接字符串必须作为 `clickHouse-client` 的第一个参数指定。连接字符串可以与其他任意 [命令行选项](#command-line-options) 组合，除了 `--host` 和 `--port`。

允许的 `query_parameters` 键如下：

- `secure` 或简写 `s`。如果指定，客户端将通过安全连接（TLS）连接到服务器。请参见 [命令行选项](#command-line-options) 中的 `--secure`。

**百分比编码**

在 `user`、`password`、`hosts`、`database` 和 `query parameters` 中，非美国 ASCII、空格和特殊字符必须 [百分比编码](https://en.wikipedia.org/wiki/URL_encoding)。

### 示例 {#connection_string_examples}

连接到端口 9000 的 `localhost` 并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

连接到 `localhost`，作为用户 `john` 使用密码 `secret`，主机为 `127.0.0.1`，端口为 `9000`。

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

作为 `default` 用户连接到 `localhost`，主机为 IPV6 地址 `[::1]`，端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

在多行模式下连接到端口 9000 的 `localhost`。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

作为用户 `default` 连接到 `localhost`，使用端口 9000。

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost`，端口为 9000，默认为 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

连接到 `localhost`，端口为 9000，并默认为在连接字符串中指定的 `my_database` 数据库，使用安全连接，使用简写参数 `s`。

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

连接到默认主机，使用默认端口、默认用户和默认数据库。

```bash
clickhouse-client clickhouse:
```

连接到默认主机，使用默认端口，作为用户 `my_user` 并且没有密码。

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

连接到 `localhost`，使用电子邮件作为用户名。`@` 符号被百分比编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到两个主机之一：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## 查询 ID 格式 {#query-id-format}

在交互模式下，ClickHouse 客户端会为每个查询显示查询 ID。默认情况下，ID 格式如下：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件中的 `query_id_formats` 标签中指定自定义格式。格式字符串中的 `{query_id}` 占位符将被查询 ID 替换。该标签内允许多个格式字符串。
此功能可用于生成 URL，以便于对查询进行分析。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

按照上述配置，查询的 ID 将显示如下格式：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 配置文件 {#configuration_files}

ClickHouse 客户端使用以下文件中存在的第一个文件：

- 使用 `-c [ -C, --config, --config-file ]` 参数定义的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

请参见 ClickHouse 存储库中的示例配置文件：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

XML 语法示例：

```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <host>hostname</host>
    <connections_credentials>
      <connection>
        <name>cloud</name>
        <hostname>abc.clickhouse.cloud</hostname>
        <user>username</user>
        <password>password</password>
      </connection>
    </connections_credentials>
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
connections_credentials:
  connection:
    - name: cloud
      hostname: abc.clickhouse.cloud
      user: username
      password: 'password'
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## 客户端配置解析 {#config_resolution}

客户端的配置遵循以下模式：

1. 通过 [命令行选项](#command-line-options) 传递的参数优先级最高。
2. 对于未通过命令行传递的参数，将使用 [环境变量选项](#environment-variable-options)。
3. 其他连接选项将从配置文件中 `connections_credentials` 键下一个或多个 `connection` 对象中提取，其中 `connection.name` 与连接名称匹配。该名称由 `--connection` 的值、根 `connection` 参数、`--host` 选项或根 `host` 参数或 "default" 决定。所有与该名称匹配的 `connections` 将按照出现顺序进行评估。每个 `connection` 对象中支持的键如下：
    *   `name`
    *   `hostname`
    *   `port`
    *   `secure`
    *   `user`
    *   `password`
    *   `database`
    *   `history_file`
    *   `history_max_entries`
    *   `accept-invalid-certificate`
    *   `prompt`
4.  最后，设置在配置的根级别的参数将适用。
    这些包括：
    *   `connection`
    *   `secure` 和 `no-secure`
    *   `bind_host`
    *   `host`
    *   `port`
    *   `user`
    *   `password`
    *   `database`
    *   `history_file`
    *   `history_max_entries`
    *   `accept-invalid-certificate`
    *   `prompt`
    *   `jwt`
    *   `ssh-key-file`
    *   `ssh-key-passphrase`
    *   `ask-password`

## 其他配置参数 {#additional_configuration}

这些额外参数也可以在配置的根级别设置，并不会被其他方式覆盖：

*   `quota_key`
*   `compression`
*   `connect_timeout`
*   `send_timeout`
*   `receive_timeout`
*   `tcp_keep_alive_timeout`
*   `handshake_timeout_ms`
*   `sync_request_timeout`
*   `tcp_port`
*   `tcp_port_secure`

### 安全连接 {#secure_connections}

`openSSL` 对象确定 TLS 加密和身份验证行为。
有关详细信息，请参见
[OpenSSL](https://clickhouse.com/docs/operations/server-configuration-parameters/settings#openssl)。

`openSSL` 对象和其他参数还影响是否使用安全连接的确定，如下所述：

*   如果传递了 `--secure` 或设置了根或 `connection` 配置参数 `secure`，则连接将使用加密。
*   如果传递了 `--no-secure` 或根 `no-secure` 参数为真，则连接不会加密。
*   如果主机名解析为 `clickhouse.cloud` 的子域，则连接将使用加密。
*   如果 [端口](https://clickhouse.com/docs/guides/sre/network-ports) 解析为原生协议 SSL/TLS 端口 `9440`，则连接将使用加密。

## 环境变量选项 {#environment-variable-options}

用户名、密码和主机可以通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 设置。
命令行参数 `--user`、`--password` 或 `--host`，或 [连接字符串](#connection_string)（如果指定）优先于环境变量。

## 命令行选项 {#command-line-options}

所有命令行选项可以直接在命令行中指定，或作为 [配置文件](#configuration_files) 中的默认值。

### 一般选项 {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

客户端配置文件的位置，如果它不在默认位置之一。请参见 [配置文件](#configuration_files)。

**`--help`**

打印使用摘要并退出。可与 `--verbose` 结合使用，以显示所有可能的选项，包括查询设置。

**`--history_file <path-to-file>`**

包含命令历史记录的文件路径。

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

配置文件中预配置的连接详细信息的名称。请参见 [连接凭据](#connection-credentials)。

**`-d [ --database ] <database>`**

选择要默认用于此连接的数据库。

默认值：来自服务器设置的当前数据库（默认是 `default`）。

**`-h [ --host ] <host>`**

要连接的 ClickHouse 服务器的主机名。可以是主机名或 IPv4 或 IPv6 地址。可以通过多个参数传递多个主机。

默认值：localhost

**`--login`**

调用设备授权 OAuth 流程以通过 IDP 进行身份验证。对于 ClickHouse Cloud 主机，OAuth 变量会被推断，否则必须通过 `--oauth-url`、`--oauth-client-id` 和 `--oauth-audience` 提供。

**`--jwt <value>`**

使用 JSON Web Token (JWT) 进行身份验证。

服务器 JWT 授权仅在 ClickHouse Cloud 中可用。

**`--no-warnings`**

禁用在客户端连接到服务器时显示来自 `system.warnings` 的警告。

**`--password <password>`**

数据库用户的密码。您可以在配置文件中为连接指定密码。如果不指定密码，客户端将询问您输入。

**`--port <port>`**

服务器接受连接的端口。默认端口为 9440（TLS）和 9000（非 TLS）。

注意：客户端使用原生协议而非 HTTP(S)。

默认值：如果指定了 `--secure` 为 9440，否则为 9000。如果主机名以 `.clickhouse.cloud` 结尾，则始终默认为 9440。

**`-s [ --secure ]`**

是否使用 TLS。

在连接到端口 9440（默认安全端口）或 ClickHouse Cloud 时自动启用。

您可能需要在 [配置文件](#configuration_files) 中配置 CA 证书。可用的配置设置与 [服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl) 相同。

**`--ssh-key-file <path-to-file>`**

用于与服务器进行身份验证的 SSH 私钥的文件。

**`--ssh-key-passphrase <value>`**

指定的 SSH 私钥的密码，在 `--ssh-key-file` 中。

**`-u [ --user ] <username>`**

以此数据库用户身份连接。

默认值：default

客户端还支持 [连接字符串](#connection_string)，可以替代 `--host`、`--port`、`--user` 和 `--password` 选项。

### 查询选项 {#command-line-options-query}

**`--param_<name>=<value>`**

带有参数的 [查询](#cli-queries-with-parameters) 的替代值。

**`-q [ --query ] <query>`**

要在批处理模式下运行的查询。可以多次指定（例如 `--query "SELECT 1" --query "SELECT 2"`），或用多个分号分隔的查询一次指定（如 `--query "SELECT 1; SELECT 2;"`）。在后一情况下，格式为非 `VALUES` 的 `INSERT` 查询必须用空行分隔。

也可以在不带参数的情况下指定单个查询：
```bash
$ clickhouse-client "SELECT 1"
1
```

不能与 `--queries-file` 同时使用。

**`--queries-file <path-to-file>`**

包含查询的文件路径。可以多次指定 `--queries-file`，例如 `--queries-file queries1.sql --queries-file queries2.sql`。

不能与 `--query` 同时使用。

**`-m [ --multiline ]`**

如果指定，允许多行查询（不会在 Enter 时发送查询）。查询仅在以分号结束时发送。

### 查询设置 {#command-line-options-query-settings}

查询设置可以作为客户端的命令行选项指定，例如：
```bash
$ clickhouse-client --max_threads 1
```

请参见 [设置](../operations/settings/settings.md) 获取设置列表。

### 格式选项 {#command-line-options-formatting}

**`-f [ --format ] <format>`**

使用指定的格式输出结果。

请参见 [输入和输出数据的格式](formats.md) 获取受支持格式的列表。

默认值：TabSeparated

**`--pager <command>`**

将所有输出通过此命令管道。通常为 `less`（例如 `less -S` 显示宽结果集）或类似命令。

**`-E [ --vertical ]`**

使用 [垂直格式](../interfaces/formats.md#vertical) 输出结果。这与 `--format Vertical` 相同。在这种格式中，每个值都打印在单独的行上，这在显示宽表时是有帮助的。

### 执行详细信息 {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

通过按下控制键（空格）启用进度表的切换。仅适用于交互模式且启用了进度表打印的情况下。

默认值：启用

**`--hardware-utilization`**

在进度条中打印硬件使用信息。

**`--memory-usage`**

如果指定，在非交互模式下将内存使用情况打印到 `stderr`。

可能值：
- `none` - 不打印内存使用情况
- `default` - 打印字节数
- `readable` - 以人类可读格式打印内存使用情况

**`--print-profile-events`**

打印 `ProfileEvents` 数据包。

**`--progress`**

打印查询执行进度。

可能值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度打印

默认值：在交互模式下为 `tty`，在非交互（批处理）模式下为 `off`。

**`--progress-table`**

在查询执行过程中打印包含变化指标的进度表。

可能值：
- `tty|on|1|true|yes` - 在交互模式下输出到终端
- `err` - 在非交互模式下输出到 `stderr`
- `off|0|false|no` - 禁用进度表

默认值：在交互模式下为 `tty`，在非交互（批处理）模式下为 `off`。

**`--stacktrace`**

打印异常的堆栈跟踪。

**`-t [ --time ]`**

在非交互模式下打印查询执行时间到 `stderr`（用于基准测试）。
