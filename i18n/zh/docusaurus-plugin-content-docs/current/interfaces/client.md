---
description: 'ClickHouse 命令行客户端接口的文档'
sidebar_label: 'ClickHouse 客户端'
sidebar_position: 18
slug: /interfaces/client
title: 'ClickHouse 客户端'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse 提供原生命令行客户端，可直接连接到 ClickHouse 服务端执行 SQL 查询。
它同时支持交互模式 (用于实时执行查询) 和批次模式 (用于脚本编写和自动化) 。
查询结果可以显示在终端中，也可以导出到文件，并支持所有 ClickHouse 输出[格式](formats.md)，例如 Pretty、CSV、JSON 等。

客户端会实时反馈查询执行情况，包括进度条、已读取的行数、已处理的字节数以及查询执行时间。
它同时支持[命令行选项](#command-line-options)和[配置文件](#configuration_files)。

## 安装 \{#install\}

要下载 ClickHouse，请运行：

```bash
curl https://clickhouse.com/ | sh
```

如需一并安装，请运行：

```bash
sudo ./clickhouse install
```

有关更多安装选项，请参阅 [Install ClickHouse](../getting-started/install/install.mdx)。

不同版本的客户端和服务器彼此兼容，但某些功能在较旧版本的客户端中可能不可用。建议客户端和服务器使用相同版本。

## 运行 \{#run\}

:::note
如果你只是下载了 ClickHouse 但尚未安装，请使用 `./clickhouse client`，而不要使用 `clickhouse-client`。
:::

要连接到 ClickHouse 服务端，请运行：

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

根据需要指定其他连接详情：

| Option                           | Description                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse 服务端接受连接的端口。默认端口为 9440 (TLS) 和 9000 (无 TLS) 。请注意，ClickHouse 客户端使用的是原生协议，而非 HTTP(S)。 |
| `-s [ --secure ]`                | 是否使用 TLS (通常会自动检测) 。                                                                          |
| `-u [ --user ] <username>`       | 用于连接的数据库用户。默认以 `default` 用户连接。                                                                |
| `--password <password>`          | 数据库用户的密码。您也可以在设置文件中为连接指定密码。如果未指定密码，客户端会提示您输入。                                                 |
| `-c [ --config ] <path-to-file>` | ClickHouse 客户端的设置文件位置；如果该文件不在默认位置之一，请使用此选项。请参阅 [设置文件](#configuration_files)。                  |
| `--connection <name>`            | [设置文件](#connection-credentials)中预先配置的连接详情名称。                                                  |

有关命令行选项的完整列表，请参阅 [命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud \{#connecting-cloud\}

您可以在 ClickHouse Cloud 控制台中查看 ClickHouse Cloud 服务的详细信息。选择要连接的服务，然后点击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 服务连接按钮" />

<br />

<br />

选择 **Native**，即可看到详细信息以及 `clickhouse-client` 命令示例：

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP 连接详细信息" />

### 在配置文件中存储连接信息 \{#connection-credentials\}

您可以在[配置文件](#configuration_files)中存储一个或多个 ClickHouse 服务端的连接信息。

格式如下：

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

有关更多信息，请参见[配置文件](#configuration_files)部分。

:::note
为了突出查询语法，其余示例省略了连接详情 (`--host`、`--port` 等) 。使用这些命令时，请记得补上这些参数。
:::

## 交互模式 \{#interactive-mode\}

### 交互模式的使用 \{#using-interactive-mode\}

要以交互模式运行 ClickHouse，只需执行：

```bash
clickhouse-client
```

这会打开 Read-Eval-Print Loop (REPL) ，您可以在其中开始以交互方式输入 SQL 查询。
连接后，您会看到一个提示符，可在其中输入查询：

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

在交互模式下，默认输出格式为 `PrettyCompact`。
您可以在查询的 `FORMAT` 子句中更改格式，或通过指定 `--format` 命令行选项来设置格式。
要使用 Vertical 格式，您可以使用 `--vertical`，或在查询末尾指定 `\G`。
在这种格式下，每个值都会单独打印在一行中，这对于宽表很方便。

在交互模式下，默认情况下，按下 `Enter` 时会执行您输入的内容。
查询末尾不需要加分号。

您可以使用 `-m, --multiline` 参数启动客户端。
要输入多行查询，请在换行前输入反斜杠 `\`。
按下 `Enter` 后，系统会提示您输入查询的下一行。
要执行查询，请以分号结束并按下 `Enter`。

ClickHouse 客户端基于 `replxx` (类似于 `readline`) ，因此支持常见的键盘快捷键，并会保留历史记录。
默认情况下，历史记录会写入 `~/.clickhouse-client-history`。

要退出客户端，请按 `Ctrl+D`，或者输入以下任一内容来代替查询：

* `exit` 或 `exit;`
* `quit` 或 `quit;`
* `q`、`Q` 或 `:q`
* `logout` 或 `logout;`

### 查询处理信息 \{#processing-info\}

处理查询时，客户端会显示：

1. 进度，默认情况下每秒最多更新 10 次。
   对于执行很快的查询，进度可能还来不及显示。
2. 解析后格式化的查询，用于调试。
3. 按指定格式输出的结果。
4. 结果中的行数、已耗时间以及查询处理的平均速度。
   所有数据量均指未压缩的数据。

您可以按 `Ctrl+C` 取消长时间运行的查询。
不过，您仍需稍等片刻，让服务器中止该请求。
在某些阶段，查询无法取消。
如果您不等待并再次按下 `Ctrl+C`，客户端将退出。

ClickHouse 客户端允许在查询时传递外部数据 (外部临时表) 。
更多信息，请参见 [用于查询处理的外部数据](../engines/table-engines/special/external-data.md) 一节。

### 別名 \{#cli_aliases\}

您可以在 REPL 中使用以下別名：

* `\l` - SHOW DATABASES
* `\d` - SHOW TABLES
* `\c <DATABASE>` - USE DATABASE
* `.` - 重复执行上一条查询

### 键盘快捷键 \{#keyboard_shortcuts\}

* `Alt (Option) + Shift + e` - 用当前查询打开编辑器。可通过环境变量 `EDITOR` 指定要使用的编辑器，默认使用 `vim`。
* `Alt (Option) + #` - 注释当前行。
* `Ctrl + r` - 模糊搜索历史记录。

所有可用键盘快捷键的完整列表见 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)。

:::tip
要在 MacOS 上正确配置 Meta 键 (Option) ：

iTerm2：依次前往 Preferences -&gt; Profile -&gt; Keys -&gt; Left Option key，然后点击 Esc+
:::

## 批次模式 \{#batch-mode\}

### 使用批次模式 \{#using-batch-mode\}

您可以不以交互方式使用 ClickHouse 客户端，而是以批次模式运行它。
在批次模式下，ClickHouse 只执行一条查询，随后立即退出——没有交互式提示，也不会进入循环。

您可以像这样指定单条查询：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

您也可以使用 `--query` 命令行选项：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

您可以通过 `stdin` 提供查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

假设已存在一个表 `messages`，您也可以通过命令行插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

指定 `--query` 时，所有输入都会在一个换行符后追加到该请求后面。

### 将 CSV 文件插入远程 ClickHouse 服务 \{#cloud-example\}

本示例演示如何将示例数据集的 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中现有的 `cell_towers` 表：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### 命令行插入数据示例 \{#more-examples\}

可以通过多种方式从命令行插入数据。
下面的示例使用批次模式将两行 CSV 数据插入 ClickHouse 表中：

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在下面的示例中，`cat <<_EOF` 会启动一个 heredoc，它会读取后续所有内容，直到再次遇到 `_EOF`，然后输出这些内容：

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

在下面的示例中，使用 `cat` 将 file.csv 的内容输出到标准输出 (stdout) ，并通过管道将其作为输入传给 `clickhouse-client`：

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在批次模式下，默认数据[格式](formats.md)为 `TabSeparated`。
如上例所示，您可以在查询的 `FORMAT` 子句中设置该格式。

## 带参数的查询 \{#cli-queries-with-parameters\}

您可以在查询中指定参数，并通过命令行选项为其传递值。
这样可以避免在客户端侧用具体的动态值拼接查询。
例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

也可以在[交互式会话](#interactive-mode)中设置这些参数：

```text
$ clickhouse-client
ClickHouse client version 25.X.X.XXX (official build).

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

Ok.

0 rows in set. Elapsed: 0.000 sec.

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

### 查询语法 \{#cli-queries-with-parameters-syntax\}

在查询中，将要通过命令行参数填入的值按以下格式放在大括号中：

```sql
{<name>:<data type>}
```

| 参数          | 描述                                                                                                                                                                                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | 占位符标识。对应的命令行选项为 `--param_<name> = value`。                                                                                                                                                                                                                                                     |
| `data type` | 参数的[数据类型](../sql-reference/data-types/index.md)。 <br /><br />例如，像 `(integer, ('string', integer))` 这样的数据结构，其数据类型可以是 `Tuple(UInt8, Tuple(String, UInt8))` (您也可以使用其他[integer](../sql-reference/data-types/int-uint.md) 类型) 。 <br /><br />您也可以将表名、数据库名和列名作为参数传递；在这种情况下，需要使用 `Identifier` 作为数据类型。 |

### 示例 \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AI 驱动的 SQL 生成 \{#ai-sql-generation\}

ClickHouse 客户端内置了 AI 辅助功能，可根据自然语言描述生成 SQL 查询。该功能可帮助用户在无需深入了解 SQL 的情况下编写复杂查询。

如果设置了 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 环境变量，AI 辅助功能即可开箱即用。有关更进阶的设置，请参阅[配置](#ai-sql-generation-configuration)部分。

### 用法 \{#ai-sql-generation-usage\}

要使用 AI SQL 生成功能，请在自然语言查询前加上 `??` 前缀：

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI 将：

1. 自动探索你的数据库 schema
2. 根据识别出的表和列生成合适的 SQL
3. 立即执行生成的查询

### 示例 \{#ai-sql-generation-example\}

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

### 配置 \{#ai-sql-generation-configuration\}

AI SQL 生成功能需要在您的 ClickHouse 客户端设置文件中配置 AI 提供商。您可以使用 OpenAI、Anthropic 或任何与 OpenAI 兼容的 API 服务。

#### 基于环境变量的回退机制 \{#ai-sql-generation-fallback\}

如果设置文件中未指定任何 AI 配置，ClickHouse 客户端会自动尝试使用环境变量：

1. 首先检查 `OPENAI_API_KEY` 环境变量
2. 如果未找到，则检查 `ANTHROPIC_API_KEY` 环境变量
3. 如果两者都未找到，AI 功能将被禁用

这样无需设置文件即可快速完成配置：

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 配置文件 \{#ai-sql-generation-configuration-file\}

如需更精细地控制 AI 设置，请在位于以下位置的 ClickHouse 客户端配置文件中进行配置：

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (如果未设置 `XDG_CONFIG_HOME`，则使用 `~/.config/clickhouse/config.xml`)  (XML 格式)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (如果未设置 `XDG_CONFIG_HOME`，则使用 `~/.config/clickhouse/config.yaml`)  (YAML 格式)
* `~/.clickhouse-client/config.xml` (XML 格式，旧版位置)
* `~/.clickhouse-client/config.yaml` (YAML 格式，旧版位置)
* 或使用 `--config-file` 指定自定义位置

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必填：你的 API 密钥（也可通过环境变量设置） -->
            <api_key>your-api-key-here</api_key>

            <!-- 必填：提供商类型（openai、anthropic） -->
            <provider>openai</provider>

            <!-- 要使用的模型（默认值因提供商而异） -->
            <model>gpt-4o</model>

            <!-- 可选：兼容 OpenAI 的服务的自定义 API 端点 -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- schema 探索设置 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成参数 -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- 可选：自定义系统提示 -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 必填：你的 API 密钥（也可通过环境变量设置）
      api_key: your-api-key-here

      # 必填：提供商类型（openai、anthropic）
      provider: openai

      # 要使用的模型
      model: gpt-4o

      # 可选：兼容 OpenAI 的服务的自定义 API 端点
      # base_url: https://openrouter.ai/api

      # 启用 schema 访问 - 允许 AI 查询数据库/表信息
      enable_schema_access: true

      # 生成参数
      temperature: 0.0      # 控制随机性（0.0 = 决定论的）
      max_tokens: 1000      # 最大响应长度
      timeout_seconds: 30   # 请求超时
      max_steps: 10         # schema 探索的最大步数

      # 可选：自定义系统提示
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```
  </TabItem>
</Tabs>

<br />

**使用兼容 OpenAI 的 API (例如 OpenRouter) ：**

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

### 参数 \{#ai-sql-generation-parameters\}

<details>
  <summary>必需参数</summary>

  * `api_key` - AI 服务的 API 密钥。如果已通过环境变量设置，则可省略：
    * OpenAI: `OPENAI_API_KEY`
    * Anthropic: `ANTHROPIC_API_KEY`
    * 注意：配置文件中的 API 密钥优先于环境变量
  * `provider` - AI 提供商：`openai` 或 `anthropic`
    * 如果省略，将根据可用的环境变量自动选择
</details>

<details>
  <summary>模型配置</summary>

  * `model` - 要使用的模型 (默认值：因提供商而异)
    * OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` 等
    * Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` 等
    * OpenRouter: 使用其模型命名方式，例如 `anthropic/claude-3.5-sonnet`
</details>

<details>
  <summary>连接设置</summary>

  * `base_url` - OpenAI 兼容服务的自定义 API 端点 (可选)
  * `timeout_seconds` - 请求超时时间 (秒)  (默认值：`30`)
</details>

<details>
  <summary>Schema 探索</summary>

  * `enable_schema_access` - 允许 AI 探索数据库 schema (默认值：`true`)
  * `max_steps` - schema 探索时工具调用的最大步数 (默认值：`10`)
</details>

<details>
  <summary>生成参数</summary>

  * `temperature` - 控制随机性，0.0 = 确定性，1.0 = 更具创造性 (默认值：`0.0`)
  * `max_tokens` - 响应的最大长度 (以标记数计)  (默认值：`1000`)
  * `system_prompt` - 为 AI 指定的系统提示 (可选)
</details>

### 工作原理 \{#ai-sql-generation-how-it-works\}

AI SQL 生成器采用多步骤流程：

<VerticalStepper headerLevel="list">
  1. **Schema Discovery**

  AI 使用内置工具探索您的数据库：

  * 列出可用的数据库
  * 发现相关数据库中的表
  * 通过 `CREATE TABLE` 语句检查表结构

  2. **Query Generation**

  AI 根据发现的 schema 生成 SQL，以便：

  * 匹配您的自然语言意图
  * 使用正确的表名和列名
  * 应用适当的连接和聚合

  3. **Execution**

  系统会自动执行生成的 SQL 并显示结果
</VerticalStepper>

### 限制 \{#ai-sql-generation-limitations\}

* 需要保持有效的互联网连接
* API 使用受 AI 提供商的速度限制和费用约束
* 复杂查询可能需要多次调整
* AI 仅对 schema 信息具有只读访问权限，无法访问实际数据

### 安全性 \{#ai-sql-generation-security\}

* API 密钥绝不会发送到 ClickHouse 服务端
* AI 只能看到 schema 信息 (表名/列名及其类型) ，无法看到实际数据
* 所有生成的查询都会遵循您现有的数据库权限

## 连接字符串 \{#connection_string\}

### 用法 \{#connection-string-usage\}

ClickHouse 客户端也支持使用与 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) 和 [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 类似的连接字符串连接到 ClickHouse 服务端。其语法如下：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 组成部分 (均为可选)        | 描述                                                                     | 默认值              |
| ------------------ | ---------------------------------------------------------------------- | ---------------- |
| `user`             | 数据库用户名。                                                                | `default`        |
| `password`         | 数据库用户密码。如果指定了 `:` 且密码为空，客户端会提示输入用户密码。                                  | -                |
| `hosts_and_ports`  | 主机及可选端口列表，格式为 `host[:port] [, host:[port]], ...`。                      | `localhost:9000` |
| `database`         | 数据库名称。                                                                 | `default`        |
| `query_parameters` | 键值对列表，格式为 `param1=value1[,&param2=value2], ...`。某些参数无需提供值。参数名称和值区分大小写。 | -                |

### 注意事项 \{#connection-string-notes\}

如果已在连接字符串中指定用户名、密码或数据库，就不能再通过 `--user`、`--password` 或 `--database` 指定，反之亦然。

主机部分既可以是主机名，也可以是 IPv4 或 IPv6 地址。
IPv6 地址应放在 `[]` 中：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。
ClickHouse 客户端会按顺序尝试连接这些主机 (从左到右) 。
连接建立后，将不会再尝试连接其余主机。

连接字符串必须作为 `clickHouse-client` 的第一个参数指定。
除 `--host` 和 `--port` 外，连接字符串还可以与任意数量的其他[命令行选项](#command-line-options)组合使用。

`query_parameters` 允许使用以下键：

| 键                 | 说明                                                                           |
| ----------------- | ---------------------------------------------------------------------------- |
| `secure` (or `s`) | 如果指定，客户端将通过安全连接 (TLS) 连接到服务器。请参阅[命令行选项](#command-line-options)中的 `--secure`。 |

**百分号编码**

以下参数中的非美式 ASCII 字符、空格和特殊字符必须进行[百分号编码](https://en.wikipedia.org/wiki/URL_encoding)：

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 示例 \{#connection_string_examples\}

连接到 `localhost` 的 9000 端口，并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

使用用户 `john` 和密码 `secret` 连接到 `localhost`，主机为 `127.0.0.1`，端口为 `9000`

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

以 `default` 用户连接到 `localhost`，主机 IPV6 地址为 `[::1]`，端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

在多行模式下连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

使用 9000 端口，以用户 `default` 身份连接到 `localhost`。

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost` 的 9000 端口，并默认使用 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

连接到 `localhost` 的 9000 端口，并默认使用连接字符串中指定的 `my_database` 数据库，同时通过简写参数 `s` 使用安全连接。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

使用默认端口、默认用户和默认数据库，连接到默认主机。

```bash
clickhouse-client clickhouse:
```

使用默认端口连接到默认主机，并以用户 `my_user` 身份登录，且不使用密码。

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

使用电子邮件地址作为用户名连接到 `localhost`。`@` 符号会被进行百分号编码，表示为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到以下两台主机中的一台：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## Query ID 格式 \{#query-id-format\}

在交互模式下，ClickHouse 客户端会显示每个查询的 Query ID。默认情况下，ID 的格式如下：

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在设置文件的 `query_id_formats` 标签中指定自定义格式。格式字符串中的 `{query_id}` 占位符会替换为查询 ID。该标签中可包含多个格式字符串。
此功能可用于生成 URL，方便对查询进行性能分析。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

使用上述配置后，查询 ID 将以下列格式显示：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 配置文件 \{#configuration_files\}

ClickHouse 客户端会使用以下位置中第一个存在的文件：

* 通过 `-c [ -C, --config, --config-file ]` 参数指定的文件。
* `./clickhouse-client.[xml|yaml|yml]`
* `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (如果未设置 `XDG_CONFIG_HOME`，则使用 `~/.config/clickhouse/config.[xml|yaml|yml]`)
* `~/.clickhouse-client/config.[xml|yaml|yml]`
* `/etc/clickhouse-client/config.[xml|yaml|yml]`

请参阅 ClickHouse 代码仓库中的示例配置文件：[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value="xml" label="XML" default>
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
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    user: username
    password: 'password'
    secure: true
    openSSL:
      client:
        caConfig: '/etc/ssl/cert.pem'
    ```
  </TabItem>
</Tabs>

## 环境变量选项 \{#environment-variable-options\}

可通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 设置用户名、密码和主机。
如果已指定，命令行参数 `--user`、`--password` 或 `--host`，以及[连接字符串](#connection_string)的优先级都高于环境变量。

## 命令行选项 \{#command-line-options\}

所有命令行选项都可以直接在命令行中指定，也可以在[配置文件](#configuration_files)中将其设为默认值。

### 常规选项 \{#command-line-options-general\}

| 选项                                                  | 说明                                                                         | 默认值                 |
| --------------------------------------------------- | -------------------------------------------------------------------------- | ------------------- |
| `-c [ -C, --config, --config-file ] <path-to-file>` | 如果客户端的配置文件不在默认位置之一，请指定其路径。请参见 [Configuration Files](#configuration_files)。 | -                   |
| `--help`                                            | 打印用法说明并退出。与 `--verbose` 结合使用可显示所有可用选项，包括查询设置。                              | -                   |
| `--history_file <path-to-file>`                     | 包含命令历史记录的文件路径。                                                             | -                   |
| `--history_max_entries`                             | 历史记录文件中的最大条目数。                                                             | `1000000` (100 万)   |
| `--prompt <prompt>`                                 | 指定自定义提示。                                                                   | 服务器的 `display_name` |
| `--verbose`                                         | 增加输出详细程度。                                                                  | -                   |
| `-V [ --version ]`                                  | 打印版本并退出。                                                                   | -                   |

### 连接选项 \{#command-line-options-connection\}

| 选项                                   | 说明                                                                                                                                                                                                                     | 默认值                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `--connection <name>`                | 配置文件中预配置连接详情的名称。请参见[连接凭据](#connection-credentials)。                                                                                                                                                                    | -                                                                                  |
| `-d [ --database ] <database>`       | 选择此连接默认使用的数据库。                                                                                                                                                                                                         | 服务器设置中的当前数据库 (默认为 `default`)                                                       |
| `-h [ --host ] <host>`               | 要连接的 ClickHouse 服务端主机名。可以是主机名，也可以是 IPv4 或 IPv6 地址。您可以通过多次传入该参数来指定多个主机。                                                                                                                                                 | `localhost`                                                                        |
| `--jwt <value>`                      | 使用 JSON Web Token (JWT) 进行身份验证。 <br /><br />服务器 JWT 授权仅在 ClickHouse Cloud 中可用。                                                                                                                                         | -                                                                                  |
| `login`                              | 调用设备授权 OAuth 流，通过 IDP 进行身份验证。 <br /><br />对于 ClickHouse Cloud 主机，OAuth 变量会自动推断；否则必须通过 `--oauth-url`、`--oauth-client-id` 和 `--oauth-audience` 提供。                                                                       | -                                                                                  |
| `--no-warnings`                      | 禁用客户端连接到服务器时显示 `system.warnings` 中警告的功能。                                                                                                                                                                               | -                                                                                  |
| `--no-server-client-version-message` | 禁用客户端连接到服务器时显示服务端与客户端版本不匹配消息的功能。                                                                                                                                                                                       | -                                                                                  |
| `--password <password>`              | 数据库用户的密码。您也可以在配置文件中为连接指定密码。如果未指定密码，客户端会提示您输入。                                                                                                                                                                          | -                                                                                  |
| `--port <port>`                      | 服务器接受连接的端口。默认端口为 9440 (TLS) 和 9000 (非 TLS) 。 <br /><br />注意：客户端使用的是原生协议，而不是 HTTP(S)。                                                                                                                                   | 如果指定了 `--secure`，则为 `9440`，否则为 `9000`。如果主机名以 `.clickhouse.cloud` 结尾，则始终默认为 `9440`。 |
| `-s [ --secure ]`                    | 是否使用 TLS。 <br /><br />连接到端口 9440 (默认安全端口) 或 ClickHouse Cloud 时会自动启用。 <br /><br />您可能需要在[配置文件](#configuration_files)中配置 CA 证书。可用配置项与[服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl)相同。 | 连接到端口 9440 或 ClickHouse Cloud 时自动启用                                                |
| `--ssh-key-file <path-to-file>`      | 包含用于向服务器进行身份验证的 SSH 私钥的文件。                                                                                                                                                                                             | -                                                                                  |
| `--ssh-key-passphrase <value>`       | `--ssh-key-file` 中指定的 SSH 私钥的口令短语。                                                                                                                                                                                     | -                                                                                  |
| `--tls-sni-override <server name>`   | 如果使用 TLS，则在握手过程中传递的服务器名称 (SNI) 。                                                                                                                                                                                       | 通过 `-h` 或 `--host` 提供的主机。                                                          |
| `-u [ --user ] <username>`           | 用于连接的数据库用户。                                                                                                                                                                                                            | `default`                                                                          |

:::note
除了 `--host`、`--port`、`--user` 和 `--password` 选项外，客户端还支持[连接字符串](#connection_string)。
:::

### 查询选项 \{#command-line-options-query\}

| 选项                              | 描述                                                                                                                                                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--param_<name>=<value>`        | 用作[带参数查询](#cli-queries-with-parameters)中参数的替换值。                                                                                                                                                                                                                           |
| `-q [ --query ] <query>`        | 要以批处理模式运行的查询。可多次指定 (`--query "SELECT 1" --query "SELECT 2"`) ，也可只指定一次，并在其中包含多个用分号分隔的查询 (`--query "SELECT 1; SELECT 2;"`) 。在后一种情况下，格式不是 `VALUES` 的 `INSERT` 查询之间必须用空行分隔。 <br /><br />也可以不带参数直接指定单个查询：`clickhouse-client "SELECT 1"` <br /><br />不能与 `--queries-file` 同时使用。 |
| `--queries-file <path-to-file>` | 包含查询的文件路径。`--queries-file` 可指定多次，例如 `--queries-file queries1.sql --queries-file queries2.sql`。 <br /><br />不能与 `--query` 同时使用。                                                                                                                                            |
| `-m [ --multiline ]`            | 如果指定此选项，则允许输入多行查询 (按 Enter 时不会发送查询) 。只有当查询以分号结尾时，才会发送。                                                                                                                                                                                                                    |

### 查询设置 \{#command-line-options-query-settings\}

可以在客户端中通过命令行选项指定查询设置，例如：

```bash
$ clickhouse-client --max_threads 1
```

有关设置的列表，请参见[设置](../operations/settings/settings.md)。

### 格式相关设置 \{#command-line-options-formatting\}

| 设置                         | 说明                                                                                               | 默认值            |
| -------------------------- | ------------------------------------------------------------------------------------------------ | -------------- |
| `-f [ --format ] <format>` | 使用指定格式输出结果。<br /><br />支持的格式列表请参见[输入和输出数据格式](formats.md)。                                        | `TabSeparated` |
| `--pager <command>`        | 将所有输出通过管道传递给此命令语。通常为 `less` (例如使用 `less -S` 显示较宽的结果集) 或类似命令语。                                    | -              |
| `-E [ --vertical ]`        | 使用[垂直格式](/interfaces/formats/Vertical)输出结果。这与 `–-format Vertical` 相同。在这种格式下，每个值都会打印在单独一行，适合显示宽表。 | -              |

### 执行详细信息 \{#command-line-options-execution-details\}

| 选项                               | 说明                                                                                                                                                           | 默认值                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `--enable-progress-table-toggle` | 允许通过按控制键 (空格键) 切换进度表。仅适用于已启用进度表输出的交互模式。                                                                                                                      | `enabled`                        |
| `--hardware-utilization`         | 在进度条中输出硬件利用率信息。                                                                                                                                              | -                                |
| `--memory-usage`                 | 如果指定此选项，则在非交互模式下将内存使用情况输出到 `stderr`。 <br /><br />可能的值： <br />• `none` - 不输出内存使用情况 <br />• `default` - 输出字节数 <br />• `readable` - 以人类可读的格式输出内存使用情况            | -                                |
| `--print-profile-events`         | 输出 `ProfileEvents` 数据包。                                                                                                                                      | -                                |
| `--progress`                     | 输出查询执行进度。 <br /><br />可能的值： <br />• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br />• `err` - 在非交互模式下输出到 `stderr` <br />• `off\|0\|false\|no` - 禁用进度输出           | 交互模式下为 `tty`，非交互 (批次) 模式下为 `off` |
| `--progress-table`               | 在查询执行期间输出显示指标变化的进度表。 <br /><br />可能的值： <br />• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br />• `err` - 在非交互模式下输出到 `stderr` <br />• `off\|0\|false\|no` - 禁用进度表 | 交互模式下为 `tty`，非交互 (批次) 模式下为 `off` |
| `--stacktrace`                   | 输出异常的堆栈跟踪。                                                                                                                                                   | -                                |
| `-t [ --time ]`                  | 在非交互模式下将查询执行时间输出到 `stderr` (用于基准测试) 。                                                                                                                        | -                                |