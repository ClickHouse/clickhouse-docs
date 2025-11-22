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

ClickHouse 提供了一个原生命令行客户端，可用于直接向 ClickHouse 服务器执行 SQL 查询。
它支持交互式模式（用于即时执行查询）和批处理模式（用于脚本和自动化）。
查询结果可以在终端中显示或导出到文件，并支持所有 ClickHouse 输出[格式](formats.md)，例如 Pretty、CSV、JSON 等。

该客户端通过进度条，以及已读取的行数、已处理的字节数和查询执行时间，提供关于查询执行的实时反馈。
它同时支持[命令行选项](#command-line-options)和[配置文件](#configuration_files)。


## 安装 {#install}

下载 ClickHouse,请运行:

```bash
curl https://clickhouse.com/ | sh
```

安装 ClickHouse,请运行:

```bash
sudo ./clickhouse install
```

更多安装选项,请参阅 [安装 ClickHouse](../getting-started/install/install.mdx)。

不同版本的客户端和服务器相互兼容,但某些功能可能在旧版本客户端中不可用。建议客户端和服务器使用相同版本。


## 运行 {#run}

:::note
如果您仅下载了 ClickHouse 但未安装,请使用 `./clickhouse client` 而不是 `clickhouse-client`。
:::

要连接到 ClickHouse 服务器,请运行:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

根据需要指定其他连接详细信息:

| 选项                             | 描述                                                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse 服务器接受连接的端口。默认端口为 9440(TLS)和 9000(无 TLS)。请注意,ClickHouse Client 使用原生协议而非 HTTP(S)。 |
| `-s [ --secure ]`                | 是否使用 TLS(通常自动检测)。                                                                                                                                        |
| `-u [ --user ] <username>`       | 要连接的数据库用户。默认以 `default` 用户连接。                                                                                                       |
| `--password <password>`          | 数据库用户的密码。您也可以在配置文件中指定连接密码。如果未指定密码,客户端将提示输入。  |
| `-c [ --config ] <path-to-file>` | ClickHouse Client 配置文件的位置(如果不在默认位置)。请参阅[配置文件](#configuration_files)。                      |
| `--connection <name>`            | [配置文件](#connection-credentials)中预配置连接详细信息的名称。                                                                              |

有关命令行选项的完整列表,请参阅[命令行选项](#command-line-options)。

### 连接到 ClickHouse Cloud {#connecting-cloud}

您的 ClickHouse Cloud 服务的详细信息可在 ClickHouse Cloud 控制台中查看。选择您要连接的服务并点击 **Connect**:

<Image
  img={cloud_connect_button}
  size='md'
  alt='ClickHouse Cloud 服务连接按钮'
/>

<br />
<br />

选择 **Native**,详细信息将显示一个示例 `clickhouse-client` 命令:

<Image
  img={connection_details_native}
  size='md'
  alt='ClickHouse Cloud 原生 TCP 连接详细信息'
/>

### 在配置文件中存储连接信息 {#connection-credentials}

您可以在[配置文件](#configuration_files)中存储一个或多个 ClickHouse 服务器的连接详细信息。

格式如下:

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

有关更多信息,请参阅[配置文件部分](#configuration_files)。

:::note
为了专注于查询语法,其余示例省略了连接详细信息(`--host`、`--port` 等)。请记住在使用命令时添加这些参数。
:::


## 交互模式 {#interactive-mode}

### 使用交互模式 {#using-interactive-mode}

要在交互模式下运行 ClickHouse,只需执行:

```bash
clickhouse-client
```

这将打开读取-求值-输出循环(REPL),您可以在其中交互式地输入 SQL 查询。
连接后,您将看到一个提示符,可以在其中输入查询:

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

在交互模式下,默认输出格式为 `PrettyCompact`。
您可以在查询的 `FORMAT` 子句中更改格式,或通过指定 `--format` 命令行选项来更改。
要使用垂直格式,可以使用 `--vertical` 或在查询末尾指定 `\G`。
在此格式中,每个值都打印在单独的行上,这对于宽表很方便。

在交互模式下,默认情况下按 `Enter` 键时会运行输入的内容。
查询末尾不需要分号。

您可以使用 `-m, --multiline` 参数启动客户端。
要输入多行查询,请在换行前输入反斜杠 `\`。
按 `Enter` 后,系统会提示您输入查询的下一行。
要运行查询,请以分号结束并按 `Enter`。

ClickHouse Client 基于 `replxx`(类似于 `readline`),因此它使用熟悉的键盘快捷键并保留历史记录。
默认情况下,历史记录写入 `~/.clickhouse-client-history`。

要退出客户端,请按 `Ctrl+D`,或输入以下命令之一代替查询:

- `exit` or `exit;`
- `quit` or `quit;`
- `q`, `Q` or `:q`
- `logout` or `logout;`

### 查询处理信息 {#processing-info}

处理查询时,客户端会显示:

1.  进度,默认情况下每秒更新不超过 10 次。
    对于快速查询,进度可能来不及显示。
2.  解析后的格式化查询,用于调试。
3.  指定格式的结果。
4.  结果中的行数、经过的时间以及查询处理的平均速度。
    所有数据量均指未压缩的数据。

您可以通过按 `Ctrl+C` 取消长时间运行的查询。
但是,您仍需要等待一小段时间让服务器中止请求。
在某些阶段无法取消查询。
如果您不等待并第二次按 `Ctrl+C`,客户端将退出。

ClickHouse Client 允许传递外部数据(外部临时表)进行查询。
有关更多信息,请参阅 [查询处理的外部数据](../engines/table-engines/special/external-data.md) 部分。

### 别名 {#cli_aliases}

您可以在 REPL 中使用以下别名:

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 重复上一次查询

### 键盘快捷键 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 使用当前查询打开编辑器。可以通过环境变量 `EDITOR` 指定要使用的编辑器。默认使用 `vim`。
- `Alt (Option) + #` - 注释行。
- `Ctrl + r` - 模糊历史搜索。

所有可用键盘快捷键的完整列表可在 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262) 中找到。

:::tip
要在 MacOS 上配置 meta 键(Option)的正确工作:

iTerm2: 转到 Preferences -> Profile -> Keys -> Left Option key 并点击 Esc+
:::


## 批处理模式 {#batch-mode}

### 使用批处理模式 {#using-batch-mode}

除了以交互方式使用 ClickHouse Client 外,您还可以在批处理模式下运行它。
在批处理模式下,ClickHouse 执行单个查询后立即退出 - 不会出现交互式提示符或循环。

您可以像这样指定单个查询:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

您也可以使用 `--query` 命令行选项:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

您可以通过 `stdin` 提供查询:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

假设存在一个名为 `messages` 的表,您也可以从命令行插入数据:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

当指定 `--query` 时,任何输入都会在换行符后附加到请求中。

### 将 CSV 文件插入到远程 ClickHouse 服务 {#cloud-example}

此示例将示例数据集 CSV 文件 `cell_towers.csv` 插入到 `default` 数据库中的现有表 `cell_towers`:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### 从命令行插入数据的示例 {#more-examples}

从命令行插入数据有多种方法。
下面的示例使用批处理模式将两行 CSV 数据插入到 ClickHouse 表中:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在下面的示例中,`cat <<_EOF` 启动一个 heredoc,它将读取所有内容直到再次遇到 `_EOF`,然后输出:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

在下面的示例中,使用 `cat` 将 file.csv 的内容输出到 stdout,并通过管道传递给 `clickhouse-client` 作为输入:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

在批处理模式下,默认数据[格式](formats.md)为 `TabSeparated`。
您可以在查询的 `FORMAT` 子句中设置格式,如上面的示例所示。


## 带参数的查询 {#cli-queries-with-parameters}

您可以在查询中指定参数，并通过命令行选项传递值。
这样可以避免在客户端对查询进行特定动态值的格式化。
例如：

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

也可以在[交互式会话](#interactive-mode)中设置参数：

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

### 查询语法 {#cli-queries-with-parameters-syntax}

在查询中，将需要通过命令行参数填充的值放在大括号中，格式如下：

```sql
{<name>:<data type>}
```

| 参数        | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | 占位符标识符。对应的命令行选项为 `--param_<name> = value`。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `data type` | 参数的[数据类型](../sql-reference/data-types/index.md)。<br/><br/>例如，像 `(integer, ('string', integer))` 这样的数据结构可以使用 `Tuple(UInt8, Tuple(String, UInt8))` 数据类型（您也可以使用其他[整数](../sql-reference/data-types/int-uint.md)类型）。<br/><br/>也可以将表名、数据库名和列名作为参数传递，此时需要使用 `Identifier` 作为数据类型。 |

### 示例 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI 驱动的 SQL 生成 {#ai-sql-generation}

ClickHouse Client 内置了 AI 辅助功能,可从自然语言描述生成 SQL 查询。此功能帮助用户在无需深入掌握 SQL 知识的情况下编写复杂查询。

如果您设置了 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 环境变量,AI 辅助功能即可开箱即用。有关更高级的配置,请参阅[配置](#ai-sql-generation-configuration)部分。

### 使用方法 {#ai-sql-generation-usage}

要使用 AI SQL 生成功能,请在自然语言查询前添加 `??` 前缀:

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI 将会:

1. 自动探索您的数据库模式
2. 根据发现的表和列生成相应的 SQL
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

AI SQL 生成需要在 ClickHouse Client 配置文件中配置 AI 提供商。您可以使用 OpenAI、Anthropic 或任何与 OpenAI 兼容的 API 服务。

#### 基于环境变量的回退机制 {#ai-sql-generation-fallback}

如果配置文件中未指定 AI 配置,ClickHouse Client 将自动尝试使用环境变量:

1. 首先检查 `OPENAI_API_KEY` 环境变量
2. 如果未找到,则检查 `ANTHROPIC_API_KEY` 环境变量
3. 如果两者都未找到,AI 功能将被禁用


这样就无需配置文件即可快速完成设置：

```bash
# 使用 OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client
```


# 使用 Anthropic

export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 配置文件 {#ai-sql-generation-configuration-file}

如需更精细地控制 AI 设置,可在 ClickHouse 客户端配置文件中进行配置,配置文件位于:

- `$XDG_CONFIG_HOME/clickhouse/config.xml` (or `~/.config/clickhouse/config.xml` if `XDG_CONFIG_HOME` is not set) (XML 格式)
- `$XDG_CONFIG_HOME/clickhouse/config.yaml` (or `~/.config/clickhouse/config.yaml` if `XDG_CONFIG_HOME` is not set) (YAML 格式)
- `~/.clickhouse-client/config.xml` (XML 格式,旧版位置)
- `~/.clickhouse-client/config.yaml` (YAML 格式,旧版位置)
- 或使用 `--config-file` 指定自定义位置

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 必需:您的 API 密钥(或通过环境变量设置) -->
            <api_key>your-api-key-here</api_key>

            <!-- 必需:提供商类型(openai、anthropic) -->
            <provider>openai</provider>

            <!-- 要使用的模型(默认值因提供商而异) -->
            <model>gpt-4o</model>

            <!-- 可选:OpenAI 兼容服务的自定义 API 端点 -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- Schema 探索设置 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 生成参数 -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- 可选:自定义系统提示词 -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```

  </TabItem>
  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 必需:您的 API 密钥(或通过环境变量设置)
      api_key: your-api-key-here

      # 必需:提供商类型(openai、anthropic)
      provider: openai

      # 要使用的模型
      model: gpt-4o

      # 可选:OpenAI 兼容服务的自定义 API 端点
      # base_url: https://openrouter.ai/api

      # 启用 schema 访问 - 允许 AI 查询数据库/表信息
      enable_schema_access: true

      # 生成参数
      temperature: 0.0      # 控制随机性(0.0 = 确定性)
      max_tokens: 1000      # 最大响应长度
      timeout_seconds: 30   # 请求超时时间
      max_steps: 10         # 最大 schema 探索步数

      # 可选:自定义系统提示词
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```

  </TabItem>
</Tabs>

<br />

**使用 OpenAI 兼容 API(例如 OpenRouter):**

```yaml
ai:
  provider: openai # 使用 'openai' 以保持兼容性
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet # 使用 OpenRouter 模型命名
```

**最小配置示例:**


```yaml
# 最小配置 - 使用环境变量存储 API 密钥
ai:
  provider: openai  # 将使用 OPENAI_API_KEY 环境变量
```


# 完全无需配置——自动回退
# （ai 配置段为空或不存在时——将先尝试 OPENAI_API_KEY，然后再尝试 ANTHROPIC_API_KEY）



# 仅重写模型 - 使用环境变量提供 API 密钥

ai:
provider: openai
model: gpt-3.5-turbo

```

### 参数 {#ai-sql-generation-parameters}

<details>
<summary>必需参数</summary>

- `api_key` - 您的 AI 服务 API 密钥。如果已通过环境变量设置,可以省略:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 注意:配置文件中的 API 密钥优先级高于环境变量
- `provider` - AI 提供商:`openai` 或 `anthropic`
  - 如果省略,将根据可用的环境变量自动回退

</details>

<details>
<summary>模型配置</summary>

- `model` - 要使用的模型(默认值:取决于提供商)
  - OpenAI: `gpt-4o`、`gpt-4`、`gpt-3.5-turbo` 等
  - Anthropic: `claude-3-5-sonnet-20241022`、`claude-3-opus-20240229` 等
  - OpenRouter: 使用其模型命名方式,如 `anthropic/claude-3.5-sonnet`

</details>

<details>
<summary>连接设置</summary>

- `base_url` - OpenAI 兼容服务的自定义 API 端点(可选)
- `timeout_seconds` - 请求超时时间(秒)(默认值:`30`)

</details>

<details>
<summary>架构探索</summary>

- `enable_schema_access` - 允许 AI 探索数据库架构(默认值:`true`)
- `max_steps` - 架构探索的最大工具调用步数(默认值:`10`)

</details>

<details>
<summary>生成参数</summary>

- `temperature` - 控制随机性,0.0 = 确定性,1.0 = 创造性(默认值:`0.0`)
- `max_tokens` - 响应的最大令牌长度(默认值:`1000`)
- `system_prompt` - AI 的自定义指令(可选)

</details>

### 工作原理 {#ai-sql-generation-how-it-works}

AI SQL 生成器使用多步骤流程:

<VerticalStepper headerLevel="list">

1. **架构发现**

AI 使用内置工具探索您的数据库
- 列出可用的数据库
- 发现相关数据库中的表
- 通过 `CREATE TABLE` 语句检查表结构

2. **查询生成**

基于发现的架构,AI 生成满足以下条件的 SQL:
- 符合您的自然语言意图
- 使用正确的表名和列名
- 应用适当的连接和聚合

3. **执行**

生成的 SQL 会自动执行并显示结果

</VerticalStepper>

### 限制 {#ai-sql-generation-limitations}

- 需要有效的互联网连接
- API 使用受 AI 提供商的速率限制和费用约束
- 复杂查询可能需要多次优化
- AI 仅对架构信息具有只读访问权限,无法访问实际数据

### 安全性 {#ai-sql-generation-security}

- API 密钥永远不会发送到 ClickHouse 服务器
- AI 仅能看到架构信息(表名/列名和类型),无法访问实际数据
- 所有生成的查询都遵守您现有的数据库权限
```


## 连接字符串 {#connection_string}

### 用法 {#connection-string-usage}

ClickHouse Client 还支持使用类似于 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/)、[PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)、[MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri) 的连接字符串来连接 ClickHouse 服务器。其语法如下:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 组件(均为可选) | 描述                                                                                                                                              | 默认值          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | 数据库用户名。                                                                                                                                       | `default`        |
| `password`               | 数据库用户密码。如果指定了 `:` 但密码为空,客户端将提示输入用户密码。                                   | -                |
| `hosts_and_ports`        | 主机和可选端口的列表 `host[:port] [, host:[port]], ...`。                                                                                     | `localhost:9000` |
| `database`               | 数据库名称。                                                                                                                                           | `default`        |
| `query_parameters`       | 键值对列表 `param1=value1[,&param2=value2], ...`。某些参数不需要值。参数名称和值区分大小写。 | -                |

### 注意事项 {#connection-string-notes}

如果在连接字符串中指定了用户名、密码或数据库,则不能使用 `--user`、`--password` 或 `--database` 指定(反之亦然)。

主机组件可以是主机名或 IPv4 或 IPv6 地址。
IPv6 地址应放在方括号中:

```text
clickhouse://[2001:db8::1234]
```

连接字符串可以包含多个主机。
ClickHouse Client 将按顺序(从左到右)尝试连接这些主机。
建立连接后,不会再尝试连接其余主机。

连接字符串必须指定为 `clickHouse-client` 的第一个参数。
连接字符串可以与任意数量的其他[命令行选项](#command-line-options)组合使用,但 `--host` 和 `--port` 除外。

`query_parameters` 允许使用以下键:

| 键               | 描述                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secure` (或 `s`) | 如果指定,客户端将通过安全连接(TLS)连接到服务器。请参阅[命令行选项](#command-line-options)中的 `--secure`。 |

**百分号编码**

以下参数中的非 US ASCII 字符、空格和特殊字符必须进行[百分号编码](https://en.wikipedia.org/wiki/URL_encoding):

- `user`
- `password`
- `hosts`
- `database`
- `query parameters`

### 示例 {#connection_string_examples}

连接到 `localhost` 的 9000 端口并执行查询 `SELECT 1`。

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

以用户 `john` 和密码 `secret` 连接到主机 `127.0.0.1` 的 9000 端口

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

以 `default` 用户连接到 IPv6 地址为 `[::1]` 的主机的 9000 端口。

```bash
clickhouse-client clickhouse://[::1]:9000
```

以多行模式连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

以用户 `default` 连接到 `localhost` 的 9000 端口。

```bash
clickhouse-client clickhouse://default@localhost:9000

```


# 等同于：

clickhouse-client clickhouse://localhost:9000 --user default

````

连接到 `localhost` 的 9000 端口,默认使用 `my_database` 数据库。

```bash
clickhouse-client clickhouse://localhost:9000/my_database
````


# 等价于：

clickhouse-client clickhouse://localhost:9000 --database my&#95;database

````

连接到 `localhost` 的 9000 端口,默认使用连接字符串中指定的 `my_database` 数据库,并通过简写参数 `s` 启用安全连接。

```bash
clickhouse-client clickhouse://localhost/my_database?s
````


# 等价于：

clickhouse-client clickhouse://localhost/my&#95;database -s

````

使用默认端口、默认用户和默认数据库连接到默认主机。

```bash
clickhouse-client clickhouse:
````

使用默认主机和默认端口，以用户 `my_user`（无密码）进行连接。

```bash
clickhouse-client clickhouse://my_user@
```


# 在 `:` 和 `@` 之间将密码留空，表示会在建立连接之前提示用户输入密码。

clickhouse-client clickhouse://my&#95;user:@

````

使用电子邮件作为用户名连接到 `localhost`。`@` 符号需要进行百分号编码为 `%40`。

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
````

连接到以下两个主机中的任意一个：`192.168.1.15`、`192.168.1.25`。

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## 查询 ID 格式 {#query-id-format}

在交互模式下,ClickHouse 客户端会为每个查询显示查询 ID。默认情况下,ID 格式如下:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

可以在配置文件的 `query_id_formats` 标签中指定自定义格式。格式字符串中的 `{query_id}` 占位符将被替换为实际的查询 ID。该标签内可以包含多个格式字符串。
此功能可用于生成 URL,以便对查询进行性能分析。

**示例**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

使用上述配置后,查询 ID 将以以下格式显示:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 配置文件 {#configuration_files}

ClickHouse 客户端按以下顺序使用第一个存在的文件:

- 通过 `-c [ -C, --config, --config-file ]` 参数指定的文件。
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]`(如果未设置 `XDG_CONFIG_HOME`,则为 `~/.config/clickhouse/config.[xml|yaml|yml]`)
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

请参阅 ClickHouse 代码仓库中的示例配置文件:[`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value='xml' label='XML' default>
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
  <TabItem value='yaml' label='YAML'>
    ```yaml user: username password: 'password' secure: true openSSL: client:
    caConfig: '/etc/ssl/cert.pem' ```
  </TabItem>
</Tabs>


## 环境变量选项 {#environment-variable-options}

可以通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 来设置用户名、密码和主机。
命令行参数 `--user`、`--password` 或 `--host`,或[连接字符串](#connection_string)(如果指定)优先于环境变量。


## 命令行选项 {#command-line-options}

所有命令行选项都可以直接在命令行中指定,或在[配置文件](#configuration_files)中设置为默认值。

### 通用选项 {#command-line-options-general}

| 选项                                              | 描述                                                                                                                                           | 默认值                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `-c [ -C, --config, --config-file ] <path-to-file>` | 客户端配置文件的位置(如果不在默认位置)。请参阅[配置文件](#configuration_files)。 | -                                |
| `--help`                                            | 打印使用说明并退出。与 `--verbose` 结合使用可显示所有可用选项,包括查询设置。                                      | -                                |
| `--history_file <path-to-file>`                     | 包含命令历史记录的文件路径。                                                                                                        | -                                |
| `--history_max_entries`                             | 历史记录文件中的最大条目数。                                                                                                        | `1000000`(100 万)            |
| `--prompt <prompt>`                                 | 指定自定义提示符。                                                                                                                              | 服务器的 `display_name` |
| `--verbose`                                         | 增加输出详细程度。                                                                                                                            | -                                |
| `-V [ --version ]`                                  | 打印版本信息并退出。                                                                                                                               | -                                |

### 连接选项 {#command-line-options-connection}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                | Default                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--connection <name>`           | 配置文件中预配置连接详细信息的名称。请参阅[连接凭据](#connection-credentials)。                                                                                                                                                                                                                                                                           | -                                                                                                                           |
| `-d [ --database ] <database>`  | 选择此连接默认使用的数据库。                                                                                                                                                                                                                                                                                                                                     | 服务器设置中的当前数据库(默认为 `default`)                                                        |
| `-h [ --host ] <host>`          | 要连接的 ClickHouse 服务器的主机名。可以是主机名、IPv4 或 IPv6 地址。可以通过多个参数传递多个主机。                                                                                                                                                                                                                                             | `localhost`                                                                                                                 |
| `--jwt <value>`                 | 使用 JSON Web Token (JWT) 进行身份验证。<br/><br/>服务器 JWT 授权仅在 ClickHouse Cloud 中可用。                                                                                                                                                                                                                                                                                     | -                                                                                                                           |
| `--no-warnings`                 | 禁止在客户端连接到服务器时显示来自 `system.warnings` 的警告。                                                                                                                                                                                                                                                                                                                    | -                                                                                                                           |
| `--password <password>`         | 数据库用户的密码。您也可以在配置文件中为连接指定密码。如果未指定密码,客户端将提示输入。                                                                                                                                                                                                                           | -                                                                                                                           |
| `--port <port>`                 | 服务器接受连接的端口。默认端口为 9440(TLS)和 9000(无 TLS)。<br/><br/>注意:客户端使用原生协议而非 HTTP(S)。                                                                                                                                                                                                                                  | 如果指定了 `--secure` 则为 `9440`,否则为 `9000`。如果主机名以 `.clickhouse.cloud` 结尾,则始终默认为 `9440`。 |
| `-s [ --secure ]`               | 是否使用 TLS。<br/><br/>连接到端口 9440(默认安全端口)或 ClickHouse Cloud 时自动启用。<br/><br/>您可能需要在[配置文件](#configuration_files)中配置 CA 证书。可用的配置设置与[服务器端 TLS 配置](../operations/server-configuration-parameters/settings.md#openssl)相同。 | 连接到端口 9440 或 ClickHouse Cloud 时自动启用                                                               |
| `--ssh-key-file <path-to-file>` | 包含用于服务器身份验证的 SSH 私钥的文件。                                                                                                                                                                                                                                                                                                                                      | -                                                                                                                           |
| `--ssh-key-passphrase <value>`  | `--ssh-key-file` 中指定的 SSH 私钥的密码短语。                                                                                                                                                                                                                                                                                                                          | -                                                                                                                           |
| `-u [ --user ] <username>`      | 要连接的数据库用户名。                                                                                                                                                                                                                                                                                                                                                                           | `default`                                                                                                                   |

:::note
除了 `--host`、`--port`、`--user` 和 `--password` 选项外,客户端还支持[连接字符串](#connection_string)。
:::

### 查询选项 {#command-line-options-query}


| 选项                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--param_<name>=<value>`        | [带参数查询](#cli-queries-with-parameters)的参数替换值。                                                                                                                                                                                                                                                                                                                                                     |
| `-q [ --query ] <query>`        | 在批处理模式下运行的查询。可以多次指定(`--query "SELECT 1" --query "SELECT 2"`)或一次指定多个以分号分隔的查询(`--query "SELECT 1; SELECT 2;"`)。在后一种情况下,格式不是 `VALUES` 的 `INSERT` 查询必须用空行分隔。<br/><br/>也可以不带参数指定单个查询:`clickhouse-client "SELECT 1"` <br/><br/>不能与 `--queries-file` 一起使用。 |
| `--queries-file <path-to-file>` | 包含查询的文件路径。`--queries-file` 可以多次指定,例如 `--queries-file queries1.sql --queries-file queries2.sql`。<br/><br/>不能与 `--query` 一起使用。                                                                                                                                                                                                                                                             |
| `-m [ --multiline ]`            | 如果指定,允许多行查询(按 Enter 键时不发送查询)。查询仅在以分号结束时才会发送。                                                                                                                                                                                                                                                                                                                            |

### 查询设置 {#command-line-options-query-settings}

查询设置可以在客户端中指定为命令行选项,例如:

```bash
$ clickhouse-client --max_threads 1
```

有关设置列表,请参阅[设置](../operations/settings/settings.md)。

### 格式化选项 {#command-line-options-formatting}

| 选项                     | 描述                                                                                                                                                                                                                    | 默认值        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `-f [ --format ] <format>` | 使用指定的格式输出结果。<br/><br/>有关支持的格式列表,请参阅[输入和输出数据格式](formats.md)。                                                                                  | `TabSeparated` |
| `--pager <command>`        | 将所有输出通过管道传递到此命令。通常是 `less`(例如,`less -S` 用于显示宽结果集)或类似命令。                                                                                                                  | -              |
| `-E [ --vertical ]`        | 使用[垂直格式](/interfaces/formats/Vertical)输出结果。这与 `–-format Vertical` 相同。在此格式中,每个值都打印在单独的行上,这在显示宽表时很有帮助。 | -              |

### 执行详情 {#command-line-options-execution-details}


| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | 允许通过按下 Ctrl+Space 组合键来切换进度表。仅适用于已启用进度表打印的交互模式。                                                                                                                                                                                                                                     | `enabled`                                                           |
| `--hardware-utilization`          | 在进度条中打印硬件利用率信息。                                                                                                                                                                                                                                                                                      | -                                                                   |
| `--memory-usage`                  | 如果指定，则在非交互模式下将内存使用情况打印到 `stderr`。<br/><br/>可选值：<br/>• `none` - 不打印内存使用情况 <br/>• `default` - 打印字节数 <br/>• `readable` - 以人类可读的格式打印内存使用情况                                                                                                      | -                                                                   |
| `--print-profile-events`          | 打印 `ProfileEvents` 数据包。                                                                                                                                                                                                                                                                                      | -                                                                   |
| `--progress`                      | 打印查询执行进度。<br/><br/>可选值：<br/>• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br/>• `err` - 在非交互模式下输出到 `stderr` <br/>• `off\|0\|false\|no` - 禁用进度打印                                                                                                                  | 交互模式下为 `tty`，非交互（批处理）模式下为 `off`                  |
| `--progress-table`                | 在查询执行期间打印包含变化指标的进度表。<br/><br/>可选值：<br/>• `tty\|on\|1\|true\|yes` - 在交互模式下输出到终端 <br/>• `err` - 在非交互模式下输出到 `stderr` <br/>• `off\|0\|false\|no` - 禁用进度表                                                                                             | 交互模式下为 `tty`，非交互（批处理）模式下为 `off`                  |
| `--stacktrace`                    | 打印异常的堆栈跟踪。                                                                                                                                                                                                                                                                                               | -                                                                   |
| `-t [ --time ]`                   | 在非交互模式下将查询执行时间打印到 `stderr`（用于基准测试）。                                                                                                                                                                                                                                                     | -                                                                   |
