---
description: 'ClickHouse 命令行客户端文档'
sidebar_label: 'ClickHouse 客户端'
sidebar_position: 17
slug: /interfaces/cli
title: 'ClickHouse 客户端'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse 提供了一个原生命令行客户端，用于直接对 ClickHouse 服务器执行 SQL 查询。
它支持交互模式（用于实时执行查询）和批处理模式（用于脚本和自动化）。
查询结果可以在终端中显示或导出到文件，并支持所有 ClickHouse 输出[格式](formats.md)，例如 Pretty、CSV、JSON 等。

该客户端通过进度条以及已读取行数、已处理字节数和查询执行时间，为查询执行提供实时反馈。
它既支持[命令行选项](#command-line-options)，也支持[配置文件](#configuration_files)。

## 安装 {#install}

若要下载 ClickHouse，请运行：

```bash
curl https://clickhouse.com/ | sh
```

若要一并安装它，请运行：

```bash
sudo ./clickhouse install
```

有关更多安装选项，请参阅 [Install ClickHouse](../getting-started/install/install.mdx)。

不同版本的客户端和服务器之间是兼容的，但某些功能在较旧的客户端中可能不可用。我们建议客户端和服务器使用相同的版本。

## 运行 {#run}

:::note
如果你只是下载了但尚未安装 ClickHouse，请使用 `./clickhouse client` 而不是 `clickhouse-client`。
:::

要连接到 ClickHouse 服务器，请运行：

```bash
$ clickhouse-client --host server

ClickHouse 客户端版本 24.12.2.29（官方构建）。
正在以用户 default 身份连接到 server:9000。
已连接到 ClickHouse 服务器版本 24.12.2。

:)
```

根据需要指定其他连接详细信息：

| Option                           | Description                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse 服务器接受连接的端口。默认端口为 9440（TLS）和 9000（无 TLS）。请注意，ClickHouse Client 使用的是原生协议而非 HTTP(S)。 |
| `-s [ --secure ]`                | 是否使用 TLS（通常会自动检测）。                                                                           |
| `-u [ --user ] <username>`       | 要用于连接的数据库用户。默认情况下以 `default` 用户连接。                                                           |
| `--password <password>`          | 数据库用户的密码。也可以在配置文件中为连接指定密码。如果未指定密码，客户端会提示输入。                                                  |
| `-c [ --config ] <path-to-file>` | ClickHouse Client 配置文件的位置（如果不在任何默认位置）。参见 [配置文件](#configuration_files)。                       |
| `--connection <name>`            | 来自[配置文件](#connection-credentials)的预配置连接详细信息名称。                                               |

有关命令行选项的完整列表，请参阅[命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

ClickHouse Cloud 服务的详细信息可在 ClickHouse Cloud 控制台中查看。选择要连接的服务并点击 **Connect**（连接）：

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud 服务 Connect 按钮"
/>

<br/>

<br/>

选择 **Native**，即可看到包含示例 `clickhouse-client` 命令的连接详情：

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud 原生 TCP 连接详情"
/>

### 在配置文件中存储连接 {#connection-credentials}

你可以在[配置文件](#configuration_files)中保存一个或多个 ClickHouse 服务器的连接信息。

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

有关更多信息，请参阅[配置文件部分](#configuration_files)。

:::note
为了专注于查询语法，其余示例省略了连接详细信息（`--host`、`--port` 等）。在实际使用这些命令时，请记得补充这些参数。
:::

## 交互模式 {#interactive-mode}

### 使用交互式模式 {#using-interactive-mode}

要以交互式模式运行 ClickHouse，只需执行：

```bash
clickhouse-client
```

这将打开 Read-Eval-Print Loop（REPL）交互环境，你可以在其中直接输入 SQL 查询。
连接成功后，你会看到一个提示符，在那里即可输入查询：

```bash
ClickHouse 客户端版本 25.x.x.x
正在以 default 用户身份连接到 localhost:9000。
已连接到 ClickHouse 服务器版本 25.x.x.x

hostname :)
```

在交互模式下，默认输出格式为 `PrettyCompact`。
可以在查询的 `FORMAT` 子句中更改格式，或者通过指定 `--format` 命令行选项进行更改。
要使用 Vertical 格式，可以使用 `--vertical`，或者在查询末尾添加 `\G`。
在这种格式下，每个值都会单独打印在一行上，这对于宽表非常方便。

在交互模式下，默认情况下，按下 `Enter` 后会立即执行当前输入的内容。
查询末尾不需要添加分号。

可以使用 `-m, --multiline` 参数启动客户端。
要输入多行查询，请在换行前输入反斜杠 `\`。
按下 `Enter` 之后，系统会提示输入查询的下一行。
要运行查询，请在末尾添加分号并按 `Enter`。

ClickHouse Client 基于 `replxx`（类似于 `readline`），因此支持常见的键盘快捷键并保留历史记录。
历史记录默认写入 `~/.clickhouse-client-history`。

要退出客户端，请按 `Ctrl+D`，或者在查询位置输入以下之一：

* `exit` 或 `exit;`
* `quit` 或 `quit;`
* `q`、`Q` 或 `:q`
* `logout` 或 `logout;`

### 查询处理信息 {#processing-info}

在处理查询时，客户端会显示：

1.  进度，默认情况下每秒更新不超过 10 次。
    对于执行很快的查询，进度可能来不及显示。
2.  解析后的格式化查询文本，用于调试。
3.  指定格式的查询结果。
4.  结果中的行数、已用时间以及查询处理的平均速度。
    所有数据量均指未压缩数据。

您可以通过按 `Ctrl+C` 来取消一个耗时较长的查询。
但是，仍然需要稍等片刻，以便服务器中止该请求。
在查询执行的某些阶段无法取消查询。
如果您不等待并第二次按下 `Ctrl+C`，客户端将退出。

ClickHouse Client 允许在执行查询时传入外部数据（外部临时表）。
有关更多信息，请参阅[用于查询处理的外部数据](../engines/table-engines/special/external-data.md)一节。

### 别名 {#cli_aliases}

你可以在 REPL 中使用以下别名：

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 重复上一条查询

### 键盘快捷键 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 使用当前查询打开编辑器。可以通过环境变量 `EDITOR` 指定要使用的编辑器，默认使用 `vim`。
- `Alt (Option) + #` - 注释当前行。
- `Ctrl + r` - 模糊搜索历史记录。

包含所有可用键盘快捷键的完整列表请参见 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)。

:::tip
要在 macOS 上正确配置 meta 键（Option）的行为：

iTerm2：依次进入 Preferences -> Profiles -> Keys -> Left Option key，并将其设置为 Esc+。
:::

## 批处理模式 {#batch-mode}

### 使用批处理模式 {#using-batch-mode}

与交互式使用 ClickHouse Client 不同，您可以以批处理模式运行它。
在批处理模式下，ClickHouse 只执行一个查询并立即退出——不会进入交互式提示符或循环。

您可以像这样指定一个单独的查询：

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

你还可以使用 `--query` 命令行选项：

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

您可以通过 `stdin` 输入查询：

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

假设已存在一张名为 `messages` 的表，还可以从命令行插入数据：

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当指定 `--query` 时，所有输入内容都会在一个换行符之后被追加到请求中。

### 向远程 ClickHouse 服务插入 CSV 文件 {#cloud-example}

本示例将示例数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中已存在的 `cell_towers` 表中：

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### 从命令行插入数据的示例 {#more-examples}

可以通过多种方式在命令行中插入数据。
下面的示例使用批量模式将两行 CSV 数据插入到一个 ClickHouse 表中：

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在下面的示例中，`cat <<_EOF` 会开始一个 heredoc，它会读取所有内容，直到再次遇到 `_EOF`，然后将其输出：

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

在下面的示例中，使用 `cat` 将 file.csv 文件的内容输出到标准输出（stdout），并通过管道传递给 `clickhouse-client` 作为输入：

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在批量模式下，默认的数据[格式](formats.md)为 `TabSeparated`。
您可以在查询的 `FORMAT` 子句中设置格式，如上例所示。

## 带参数的查询 {#cli-queries-with-parameters}

你可以在查询中指定参数，并通过命令行选项向其传递参数值。
这样可以避免在客户端使用特定的动态值来格式化查询。
例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

也可以在[交互式会话](#interactive-mode)中设置参数：

```text
$ clickhouse-client
ClickHouse 客户端版本 25.X.X.XXX（官方构建）。

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

完成。

结果集包含 0 行。耗时：0.000 秒。

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

结果集包含 1 行。耗时：0.006 秒。
```

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，将你希望通过命令行参数传入的值用大括号括起来，格式如下：

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | 占位符标识符。对应的命令行选项为 `--param_<name> = value`。                                                                                                                                                                                                                                        |
| `data type` | 参数的[数据类型](../sql-reference/data-types/index.md)。<br /><br />例如，类似 `(integer, ('string', integer))` 的数据结构可以使用 `Tuple(UInt8, Tuple(String, UInt8))` 数据类型（也可以采用其他[整数](../sql-reference/data-types/int-uint.md)类型）。<br /><br />也可以将表名、数据库名和列名作为参数传递，在这种情况下，则需要将其数据类型指定为 `Identifier`。 |

### 示例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## 基于 AI 的 SQL 生成 {#ai-sql-generation}

ClickHouse 客户端内置了 AI 助手，可以根据自然语言描述生成 SQL 查询。此功能可帮助用户在不具备深厚 SQL 知识的情况下编写复杂查询。

如果已设置 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 环境变量，AI 助手即可开箱即用。要进行更高级的配置，请参阅[配置](#ai-sql-generation-configuration)章节。

### 使用方法 {#ai-sql-generation-usage}

要使用 AI SQL 生成功能，请在自然语言查询前添加前缀 `??`：

```bash
:) ?? 显示过去 30 天内有购买记录的所有用户
```

AI 将会：

1. 自动探索您的数据库结构（schema）
2. 基于发现的表和列生成合适的 SQL 查询
3. 立即执行生成的查询

### 示例 {#ai-sql-generation-example}

```bash
:) ?? count orders by product category

正在启动 AI SQL 生成并进行架构发现...
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

✨ SQL 查询生成成功！
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

要使用 AI 生成 SQL，需要在 ClickHouse Client 配置文件中配置一个 AI 提供方。你可以使用 OpenAI、Anthropic，或任意与 OpenAI 兼容的 API 服务。

#### 基于环境变量的回退机制 {#ai-sql-generation-fallback}

如果在配置文件中未指定 AI 配置，ClickHouse Client 将自动尝试使用环境变量：

1. 首先检查 `OPENAI_API_KEY` 环境变量
2. 如果未找到，则检查 `ANTHROPIC_API_KEY` 环境变量
3. 如果两者都未找到，则会禁用 AI 功能

这样无需配置文件即可快速完成设置：

```bash
# 使用 OpenAI {#using-openai}
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# 使用 Anthropic {#using-anthropic}
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 配置文件 {#ai-sql-generation-configuration-file}

若要对 AI 设置进行更精细的控制，请在以下位置的 ClickHouse 客户端配置文件中进行配置：

* `$XDG_CONFIG_HOME/clickhouse/config.xml`（如果未设置 `XDG_CONFIG_HOME`，则为 `~/.config/clickhouse/config.xml`）（XML 格式）
* `$XDG_CONFIG_HOME/clickhouse/config.yaml`（如果未设置 `XDG_CONFIG_HOME`，则为 `~/.config/clickhouse/config.yaml`）（YAML 格式）
* `~/.clickhouse-client/config.xml`（XML 格式，旧版位置）
* `~/.clickhouse-client/config.yaml`（YAML 格式，旧版位置）
* 或使用 `--config-file` 指定自定义位置

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必填：您的 API 密钥（或通过环境变量设置） -->
            <api_key>your-api-key-here</api_key>

            <!-- 必填：提供方类型（openai, anthropic） -->
            <provider>openai</provider>

            <!-- 要使用的模型（默认值因提供方而异） -->
            <model>gpt-4o</model>

            <!-- 可选：用于兼容 OpenAI 的服务的自定义 API 端点 -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- Schema 探索设置 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成参数 -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- 可选：自定义 system prompt -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 必填：您的 API 密钥（或通过环境变量设置）
      api_key: your-api-key-here

      # 必填：提供方类型（openai, anthropic）
      provider: openai

      # 要使用的模型
      model: gpt-4o

      # 可选：用于兼容 OpenAI 的服务的自定义 API 端点
      # base_url: https://openrouter.ai/api

      # 启用 schema 访问 —— 允许 AI 查询数据库/数据表信息
      enable_schema_access: true

      # 生成参数
      temperature: 0.0      # 控制随机性（0.0 = 确定性）
      max_tokens: 1000      # 最大响应长度
      timeout_seconds: 30   # 请求超时时间
      max_steps: 10         # 最大 schema 探索步数

      # 可选：自定义 system prompt
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```
  </TabItem>
</Tabs>

<br />

**使用兼容 OpenAI 的 API（例如 OpenRouter）：**

```yaml
ai:
  provider: openai  # 使用 'openai' 以确保兼容性
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # 使用 OpenRouter 模型命名规范
```

**最小化配置示例：**

```yaml
# 最小配置 - 使用环境变量提供 API 密钥 {#minimal-config-uses-environment-variable-for-api-key}
ai:
  provider: openai  # 将使用 OPENAI_API_KEY 环境变量

# 无配置 - 自动回退 {#no-config-at-all-automatic-fallback}
# (空配置或无 ai 部分 - 将依次尝试 OPENAI_API_KEY 然后 ANTHROPIC_API_KEY) {#empty-or-no-ai-section-will-try-openai_api_key-then-anthropic_api_key}

# 仅覆盖模型 - 使用环境变量提供 API 密钥 {#only-override-model-uses-env-var-for-api-key}
ai:
  provider: openai
  model: gpt-3.5-turbo
```

### 参数 {#ai-sql-generation-parameters}

<details>
<summary>必需参数</summary>

- `api_key` - AI 服务的 API 密钥。如果通过环境变量设置，则可以省略：
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注意：配置文件中的 API 密钥优先于环境变量
- `provider` - AI 提供商：`openai` 或 `anthropic`
  - 如果省略，则会根据可用的环境变量自动选择

</details>

<details>
<summary>模型配置</summary>

- `model` - 要使用的模型（默认：由提供商决定）
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` 等
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` 等
  - OpenRouter: 使用其模型命名方式，如 `anthropic/claude-3.5-sonnet`

</details>

<details>
<summary>连接设置</summary>

- `base_url` - 兼容 OpenAI 的服务所使用的自定义 API 端点（可选）
- `timeout_seconds` - 请求超时时间（秒）（默认：`30`）

</details>

<details>
<summary>Schema 探索</summary>

- `enable_schema_access` - 允许 AI 探索数据库模式（schema）（默认：`true`）
- `max_steps` - Schema 探索时工具调用的最大步数（默认：`10`）

</details>

<details>
<summary>生成参数</summary>

- `temperature` - 控制随机性，0.0 = 输出更确定，1.0 = 更具创造性（默认：`0.0`）
- `max_tokens` - 最大响应长度（以 token 计）（默认：`1000`）
- `system_prompt` - 给 AI 的自定义指令（可选）

</details>

### 工作原理 {#ai-sql-generation-how-it-works}

AI SQL 生成器使用多步骤流程：

<VerticalStepper headerLevel="list">

1. **模式发现**

AI 使用内置工具来探索你的数据库：
- 列出可用的数据库
- 发现相关数据库中的表
- 通过 `CREATE TABLE` 语句检查表结构

2. **查询生成**

基于已发现的模式，AI 生成的 SQL 会：
- 符合你的自然语言意图
- 使用正确的表名和列名
- 应用合适的表连接和聚合

3. **执行**

生成的 SQL 会被自动执行，并显示结果

</VerticalStepper>

### 限制 {#ai-sql-generation-limitations}

- 需要保持有效的网络连接
- API 使用受限于 AI 提供商的速率限制和费用
- 复杂查询可能需要多次优化调整
- AI 只能以只读方式访问架构（schema）信息，无法访问实际数据

### 安全性 {#ai-sql-generation-security}

- API 密钥绝不会发送至 ClickHouse 服务器
- AI 只能访问 schema 信息（表/列名称和类型），而不会接触实际数据
- 所有生成的查询都会遵循您现有的数据库权限

## 连接字符串 {#connection_string}

### 用法 {#connection-string-usage}

ClickHouse Client 还支持使用类似 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 的连接字符串来连接 ClickHouse 服务器。其语法格式如下：

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 组件（均为可选）           | 说明                                                                     | 默认值              |
| ------------------ | ---------------------------------------------------------------------- | ---------------- |
| `user`             | 数据库用户名。                                                                | `default`        |
| `password`         | 数据库用户密码。如果指定了 `:` 且密码为空，客户端会提示输入该用户的密码。                                | -                |
| `hosts_and_ports`  | 主机及可选端口列表：`host[:port] [, host:[port]], ...`。                          | `localhost:9000` |
| `database`         | 数据库名称。                                                                 | `default`        |
| `query_parameters` | 键值对列表：`param1=value1[,&param2=value2], ...`。对于某些参数，可以不指定值。参数名称和值区分大小写。 | -                |

### 注意事项 {#connection-string-notes}

如果在连接字符串中已经指定了用户名、密码或数据库，则不能再通过 `--user`、`--password` 或 `--database` 指定（反之亦然）。

主机部分可以是主机名，或 IPv4 或 IPv6 地址。
IPv6 地址应放在方括号中：

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。
ClickHouse 客户端会按顺序（从左到右）尝试连接这些主机。
一旦连接建立，就不会再尝试连接剩余的主机。

连接字符串必须作为 `clickhouse-client` 的第一个参数指定。
连接字符串可以与任意数量的其他[命令行选项](#command-line-options)组合使用，但不能与 `--host` 和 `--port` 一起使用。

`query_parameters` 支持以下键：

| Key               | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `secure` (or `s`) | 如果指定此键，客户端将通过安全连接（TLS）连接到服务器。请参阅[命令行选项](#command-line-options)中的 `--secure`。 |

**百分号编码**

以下参数中的非 US-ASCII 字符、空格和特殊字符必须进行[百分号编码](https://en.wikipedia.org/wiki/URL_encoding)：

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 示例 {#connection_string_examples}

连接到 `localhost` 的 9000 端口并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

以用户 `john`、密码 `secret` 连接到 `localhost`，主机地址为 `127.0.0.1`，端口为 `9000`

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

以 `default` 用户身份连接到 `localhost`，主机 IPv6 地址为 `[::1]`，端口为 `9000`。

```bash
clickhouse-client clickhouse://[::1]:9000
```

使用多行模式连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

使用端口 9000 以用户 `default` 连接到 `localhost`。

```bash
clickhouse-client clickhouse://default@localhost:9000

# 等同于： {#equivalent-to}
clickhouse-client clickhouse://localhost:9000 --user default
```

连接到 `localhost` 的 9000 端口，并将默认数据库设置为 `my_database`。

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# 等效于： {#equivalent-to}
clickhouse-client clickhouse://localhost:9000 --database my_database
```

连接到 `localhost` 的 9000 端口，默认使用连接字符串中指定的 `my_database` 数据库，并通过简写参数 `s` 启用安全连接。

```bash
clickhouse-client clickhouse://localhost/my_database?s

# 等同于： {#equivalent-to}
clickhouse-client clickhouse://localhost/my_database -s
```

使用默认端口、默认用户和默认数据库连接到默认主机。

```bash
clickhouse-client clickhouse:
```

以用户 `my_user` 且不使用密码的身份，连接到默认主机的默认端口。

```bash
clickhouse-client clickhouse://my_user@

# 在 : 和 @ 之间使用空密码表示在建立连接前提示用户输入密码。 {#using-a-blank-password-between-and-means-to-asking-the-user-to-enter-the-password-before-starting-the-connection}
clickhouse-client clickhouse://my_user:@
```

使用电子邮件地址作为用户名连接到 `localhost`。`@` 符号会被百分号编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

连接到以下任一主机：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## 查询 ID 格式 {#query-id-format}

在交互模式下，ClickHouse 客户端会为每个查询显示其查询 ID。默认情况下，ID 的格式如下：

```sql
查询 ID：927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件的 `query_id_formats` 标签中指定自定义格式。格式字符串中的 `{query_id}` 占位符会被替换为查询 ID。该标签中可以包含多个格式字符串。
此功能可用于生成 URL，以便对查询进行性能分析。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

根据上述配置，查询 ID 将以以下格式显示：

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 配置文件 {#configuration_files}

ClickHouse 客户端会按以下顺序查找，并使用第一个存在的配置文件：

- 通过 `-c [ -C, --config, --config-file ]` 参数指定的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]`（如果未设置 `XDG_CONFIG_HOME`，则为 `~/.config/clickhouse/config.[xml|yaml|yml]`）
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

示例配置文件请参阅 ClickHouse 仓库中的 [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

## 环境变量选项 {#environment-variable-options}

可以通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 设置用户名、密码和主机。
命令行参数 `--user`、`--password` 或 `--host`，或者（如果已指定）[连接字符串](#connection_string) 的优先级高于环境变量。

## 命令行选项 {#command-line-options}

所有命令行选项都可以直接在命令行中指定，也可以在[配置文件](#configuration_files)中设置为默认值。

### 常规选项 {#command-line-options-general}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | 客户端配置文件的路径（如果它不在任何默认路径下）。参见 [Configuration Files](#configuration_files)。 | -                            |
| `--help`                                            | 打印使用帮助摘要并退出。与 `--verbose` 一起使用可显示所有可用选项，包括查询设置。                  | -                            |
| `--history_file <path-to-file>`                     | 命令历史记录文件的路径。                                                                                     | -                            |
| `--history_max_entries`                             | 历史记录文件中允许的最大条目数。                                                                                     | `1000000`（100 万）        |
| `--prompt <prompt>`                                 | 指定自定义提示符。                                                                                                           | 服务器的 `display_name` |
| `--verbose`                                         | 增加输出的详细程度。                                                                                                         | -                            |
| `-V [ --version ]`                                  | 打印版本并退出。                                                                                                            | -                            |

### 连接选项 {#command-line-options-connection}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 配置文件中预先配置的连接名称。参见 [连接凭证](#connection-credentials)。                                                                                                                                                                                                                                                            | -                                                                                                                |
| `-d [ --database ] <database>`   | 选择此连接默认使用的数据库。                                                                                                                                                                                                                                                                                                        | 来自服务器设置的当前数据库（默认是 `default`）                                                                   |
| `-h [ --host ] <host>`           | 要连接的 ClickHouse 服务器的主机名。可以是主机名，也可以是 IPv4 或 IPv6 地址。可以通过多次传入该参数来指定多个主机。                                                                                                                                                                                                                | `localhost`                                                                                                      |
| `--jwt <value>`                  | 使用 JSON Web Token (JWT) 进行身份验证。<br/><br/>服务器端 JWT 授权仅在 ClickHouse Cloud 中可用。                                                                                                                                                                                                                                  | -                                                                                                                |
| `login`                  | 调用设备授权 OAuth 流程，以通过身份提供商（IdP）进行身份验证。<br/><br/>对于 ClickHouse Cloud 主机，OAuth 变量会被自动推断，否则必须通过 `--oauth-url`、`--oauth-client-id` 和 `--oauth-audience` 提供。                                                                                                                                                                                                            | -                                                                                                                |
| `--no-warnings`                  | 在客户端连接到服务器时，不显示来自 `system.warnings` 的警告。                                                                                                                                                                                                                                                                        | -                                                                                                                |
| `--no-server-client-version-message`                  | 在客户端连接到服务器时，抑制服务器与客户端版本不匹配的提示信息。                                                                                                                                                                                                                                                                  | -                                                                                                                |
| `--password <password>`          | 数据库用户的密码。也可以在配置文件中为连接指定密码。如果未指定密码，客户端会提示输入。                                                                                                                                                                                                                                              | -                                                                                                                |
| `--port <port>`                  | 服务器接受连接的端口。默认端口为 9440（TLS）和 9000（非 TLS）。<br/><br/>注意：客户端使用的是原生协议而不是 HTTP(S)。                                                                                                                                                                                                                | 如果指定了 `--secure`，则为 `9440`，否则为 `9000`。当主机名以 `.clickhouse.cloud` 结尾时，始终默认为 `9440`。    |
| `-s [ --secure ]`                | 是否使用 TLS。<br/><br/>在连接到端口 9440（默认安全端口）或 ClickHouse Cloud 时会自动启用。<br/><br/>可能需要在[配置文件](#configuration_files)中配置 CA 证书。可用的配置项与[服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl) 相同。                                           | 在连接到端口 9440 或 ClickHouse Cloud 时自动启用                                                                |
| `--ssh-key-file <path-to-file>`  | 包含用于与服务器进行身份验证的 SSH 私钥的文件。                                                                                                                                                                                                                                                                                    | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file` 中指定的 SSH 私钥的密码短语。                                                                                                                                                                                                                                                                                      | -                                                                                                                |
| `-u [ --user ] <username>`       | 要用于连接的数据库用户。                                                                                                                                                                                                                                                                                                           | `default`                                                                                                        |

:::note
除了 `--host`、`--port`、`--user` 和 `--password` 选项外，客户端还支持[连接字符串](#connection_string)。
:::

### 查询选项 {#command-line-options-query}

| 选项                            | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [带参数查询](#cli-queries-with-parameters) 中某个参数的替换值。                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `-q [ --query ] <query>`        | 在批处理模式下执行的查询。可以多次指定（`--query "SELECT 1" --query "SELECT 2"`），也可以只指定一次并在其中包含多个用分号分隔的查询（`--query "SELECT 1; SELECT 2;"`）。在后一种情况下，所有使用 `VALUES` 以外格式的 `INSERT` 查询之间必须以空行分隔。<br/><br/>也可以在不带选项名的情况下指定单个查询：`clickhouse-client "SELECT 1"` <br/><br/>不能与 `--queries-file` 同时使用。                               |
| `--queries-file <path-to-file>` | 包含查询语句的文件路径。`--queries-file` 可以多次指定，例如：`--queries-file queries1.sql --queries-file queries2.sql`。<br/><br/>不能与 `--query` 同时使用。                                                                                                                                                                                                                                                                                                                                   |
| `-m [ --multiline ]`            | 如果指定该选项，则允许多行查询（按 Enter 键不会立即发送查询）。只有当查询以分号结尾时才会发送。                                                                                                                                                                                                                                                                                                                                                          |

### 查询设置 {#command-line-options-query-settings}

可以在客户端中通过命令行选项指定查询设置，例如：

```bash
$ clickhouse-client --max_threads 1
```

有关所有设置的列表，请参阅[设置](../operations/settings/settings.md)。

### 格式选项 {#command-line-options-formatting}

| 选项                      | 说明                                                                                                                                                                                                                           | 默认值         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 使用指定的格式输出结果。<br/><br/>有关支持的格式列表，请参阅[输入和输出数据的格式](formats.md)。                                                                                                                                | `TabSeparated` |
| `--pager <command>`       | 将所有输出通过管道传给此命令。通常为 `less`（例如使用 `less -S` 来显示较宽的结果集）或类似命令。                                                                                                                                | -              |
| `-E [ --vertical ]`       | 使用 [Vertical 格式](/interfaces/formats/Vertical) 输出结果。等同于 `--format Vertical`。在此格式中，每个值都会单独显示在一行上，便于查看列数较多的表。                                                                          | -              |

### 执行详情 {#command-line-options-execution-details}

| 选项                              | 描述                                                                                                                                                                                                                                                                                                              | 默认值                                                              |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | 启用通过按下 Ctrl+Space 组合键切换进度表。仅在启用了进度表打印的交互模式下生效。                                                                                                                                                                                                                                   | `enabled`                                                           |
| `--hardware-utilization`          | 在进度条中打印硬件利用率信息。                                                                                                                                                                                                                                                                                    | -                                                                   |
| `--memory-usage`                  | 如指定，在非交互模式下将内存使用情况打印到 `stderr`。<br/><br/>可能的取值：<br/>• `none` - 不打印内存使用情况 <br/>• `default` - 打印字节数 <br/>• `readable` - 以人类可读的格式打印内存使用情况                                                                                                                    | -                                                                   |
| `--print-profile-events`          | 打印 `ProfileEvents` 数据包。                                                                                                                                                                                                                                                                                     | -                                                                   |
| `--progress`                      | 打印查询执行进度。<br/><br/>可能的取值：<br/>• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br/>• `err` - 在非交互模式下输出到 `stderr` <br/>• `off\|0\|false\|no` - 禁用进度输出                                                                                                                           | 交互模式下为 `tty`，非交互（批处理）模式下为 `off`                  |
| `--progress-table`                | 在查询执行期间打印包含动态变化指标的进度表。<br/><br/>可能的取值：<br/>• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br/>• `err` - 在非交互模式下输出到 `stderr` <br/>• `off\|0\|false\|no` - 禁用进度表                                                                                                      | 交互模式下为 `tty`，非交互（批处理）模式下为 `off`                  |
| `--stacktrace`                    | 打印异常的堆栈跟踪信息。                                                                                                                                                                                                                                                                                          | -                                                                   |
| `-t [ --time ]`                   | 在非交互模式下将查询执行时间打印到 `stderr`（用于基准测试）。                                                                                                                                                                                                                                                    | -                                                                   |