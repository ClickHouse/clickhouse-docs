---
'description': '语法的文档'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '语法'
'sidebar_position': 2
'slug': '/sql-reference/syntax'
'title': '语法'
---

在本节中，我们将查看 ClickHouse 的 SQL 语法。  
ClickHouse 使用基于 SQL 的语法，但提供了许多扩展和优化。

## 查询解析 {#query-parsing}

ClickHouse 中有两种类型的解析器：
- _全 SQL 解析器_（递归下降解析器）。
- _数据格式解析器_（快速流解析器）。

除 `INSERT` 查询外，所有情况下都使用全 SQL 解析器，`INSERT` 查询同时使用两个解析器。

让我们检查下面的查询：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

如前所述，`INSERT` 查询使用了两个解析器。  
`INSERT INTO t VALUES` 片段由全解析器解析，  
而数据 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` 则由数据格式解析器，即快速流解析器解析。

<details>
<summary>启用全解析器</summary>

您也可以通过使用 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 设置来启用数据的全解析器。

当上述设置为 `1` 时，  
ClickHouse 首先尝试使用快速流解析器解析值。  
如果失败，ClickHouse 尝试对数据使用全解析器，将其视为 SQL [表达式](#expressions)。 
</details>

数据可以具有任何格式。  
当接收到查询时，服务器在内存中计算请求的最多 [max_query_size](../operations/settings/settings.md#max_query_size) 字节  
（默认情况下为 1 MB），其余部分通过流解析。  
这是为了避免大 `INSERT` 查询可能出现的问题，这是推荐的向 ClickHouse 插入数据的方法。

在 `INSERT` 查询中使用 [`Values`](../interfaces/formats.md/#data-format-values) 格式时，  
看起来数据的解析方式与在 `SELECT` 查询中的表达式相同，但其实并非如此。  
`Values` 格式要有限得多。

该部分的其余内容涵盖全解析器。

:::note
有关格式解析器的更多信息，请参阅 [Formats](../interfaces/formats.md) 部分。
:::

## 空格 {#spaces}

- 在语法结构之间（包括查询的开始和结束）可以有任意数量的空白符号。  
- 空白符号包括空格、制表符、换行符、回车符和换页符。

## 注释 {#comments}

ClickHouse 支持 SQL 风格和 C 风格的注释：

- SQL 风格的注释以 `--`、`#!` 或 `# ` 开头，并持续到行末。`--` 和 `#!` 后的空格可以省略。  
- C 风格的注释从 `/*` 到 `*/`，可以是多行的。也不需要空格。

## 关键词 {#keywords}

ClickHouse 中的关键词在上下文中可以是 _区分大小写_ 或 _不区分大小写_。

当关键词对应于时，它们是 **不区分大小写** 的：

- SQL 标准。例如，`SELECT`、`select` 和 `SeLeCt` 都是有效的。
- 一些流行的 DBMS（MySQL 或 Postgres）中的实现。例如，`DateTime` 与 `datetime` 相同。

:::note
您可以在 [system.data_type_families](/operations/system-tables/data_type_families) 表中查看数据类型名称是否区分大小写。
:::

与标准 SQL 相比，所有其他关键词（包括函数名称）都是 **区分大小写** 的。

此外，关键词不是保留字。  
它们仅在相应的上下文中被视为保留字。  
如果您使用与关键词同名的 [标识符](#identifiers)，请将它们用双引号或反引号括起来。

例如，如果表 `table_name` 有一个名称为 `"FROM"` 的列，以下查询是有效的：

```sql
SELECT "FROM" FROM table_name
```

## 标识符 {#identifiers}

标识符是：

- 集群、数据库、表、分区和列名称。
- [函数](#functions)。
- [数据类型](../sql-reference/data-types/index.md)。
- [表达式别名](#expression-aliases)。

标识符可以是带引号的或不带引号的，尽管后者更可取。

不带引号的标识符必须匹配正则表达式 `^[a-zA-Z_][0-9a-zA-Z_]*$`，并且不能等于 [关键词](#keywords)。  
请参阅下表以查看有效和无效标识符的示例：

| 有效标识符                              | 无效标识符                            |
|----------------------------------------|------------------------------------|
| `xyz`、`_internal`、`Id_with_underscores_123_` | `1x`、`tom@gmail.com`、`äußerst_schön` |

如果您想使用与关键词相同的标识符或者想在标识符中使用其他符号，请使用双引号或反引号将其引起来，例如，`"id"`、`` `id` ``。

:::note
对于带引号的标识符的转义规则同样适用于字符串文字。有关详细信息，请参见 [String](#string)。
:::

## 文 literals {#literals}

在 ClickHouse 中，字面量是直接在查询中表示的值。  
换句话说，它是一个在查询执行过程中不改变的固定值。

字面量可以是：
- [字符串](#string)
- [数字](#numeric)
- [复合型](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc)（自定义字符串字面量）

我们将在下面的部分中更详细地查看每一个。

### 字符串 {#string}

字符串字面量必须用单引号括起来。不支持双引号。

转义方式为：

- 使用前单引号，单引号字符 `'`（仅此字符）可以转义为 `''`，或
- 使用前反斜杠，并结合下面列出的支持的转义序列。

:::note
反斜杠失去其特殊含义，即如果它位于其他字符前，则被解释为字面意思。
:::

| 支持的转义                  | 描述                                                              |
|---------------------------|------------------------------------------------------------------|
| `\xHH`                    | 后面跟任意数量十六进制数字 (H) 的 8 位字符规格。                     | 
| `\N`                      | 保留的，不执行任何操作（例如，`SELECT 'a\Nb'` 返回 `ab`）               |
| `\a`                      | 警报                                                              |
| `\b`                      | 退格                                                              |
| `\e`                      | 转义字符                                                            |
| `\f`                      | 换页符                                                            |
| `\n`                      | 换行符                                                            |
| `\r`                      | 回车符                                                            |
| `\t`                      | 水平制表符                                                          |
| `\v`                      | 垂直制表符                                                          |
| `\0`                      | 空字符                                                            |
| `\\`                      | 反斜杠                                                            |
| `\'`（或 ` '' `）         | 单引号                                                            |
| `\"`                      | 双引号                                                            |
| `` ` ``                   | 反引号                                                            |
| `\/`                      | 斜杠                                                              |
| `\=`                      | 等号                                                              |
| ASCII 控制字符 (c &lt;= 31)。 |                                                                  |

:::note
在字符串字面量中，您需要使用转义码 `\'`（或：`''`）和 `\\` 转义至少 `'` 和 `\`。
:::

### 数字 {#numeric}

数字字面量解析如下：

- 首先，作为 64 位有符号数，使用 [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 函数。  
- 如果不成功，则作为 64 位无符号数，使用 [strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 函数。  
- 如果仍然不成功，则作为浮点数，使用 [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 函数。  
- 否则，返回错误。

字面值将被转换为适合该值的最小类型。
例如：
- `1` 被解析为 `UInt8`
- `256` 被解析为 `UInt16`。 

有关更多信息，请参见 [数据类型](../sql-reference/data-types/index.md)。

数字字面量中的下划线 `_` 会被忽略，可以用于提高可读性。

支持的数字字面量如下：

| 数字字面量                           | 示例                                            |
|-----------------------------------|------------------------------------------------|
| **整数**                          | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **十进制**                        | `0.1`                                         |
| **指数记法**                      | `1e100`、`-1e-100`                            |
| **浮点数**                        | `123.456`、`inf`、`nan`                       |
| **十六进制**                      | `0xc0fe`                                      |
| **符合 SQL 标准的十六进制字符串** | `x'c0fe'`                                     |
| **二进制**                        | `0b1101`                                      |
| **符合 SQL 标准的二进制字符串**   | `b'1101'`                                     |

:::note
不支持八进制字面量以避免意外的解释错误。
:::

### 复合型 {#compound}

数组用方括号构造 `[1, 2, 3]`。元组用圆括号构造 `(1, 'Hello, world!', 2)`。  
从技术上讲，这些不是字面量，而是分别带有数组创建操作符和元组创建操作符的表达式。  
数组必须至少包含一个项目，元组必须至少有两个项目。

:::note
在 `SELECT` 查询的 `IN` 子句中出现元组时有一种特殊情况。  
查询结果可以包括元组，但元组不能保存到数据库（使用 [Memory](../engines/table-engines/special/memory.md) 引擎的表除外）。
:::

### NULL {#null}

`NULL` 用于指示值缺失。  
要在表字段中存储 `NULL`，该字段必须属于 [Nullable](../sql-reference/data-types/nullable.md) 类型。

:::note
关于 `NULL`，需要注意以下几点：

- 根据数据格式（输入或输出），`NULL` 可能有不同的表示形式。有关更多信息，请参见 [数据格式](/interfaces/formats)。
- `NULL` 的处理方式很微妙。例如，如果比较操作的至少一个参数是 `NULL`，则该操作的结果也为 `NULL`。乘法、加法和其他操作也是如此。我们建议为每个操作阅读文档。
- 在查询中，您可以使用 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isnull) 和 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isnotnull) 操作符及相关函数 `isNull` 和 `isNotNull` 来检查 `NULL`。
:::

### Heredoc {#heredoc}

[ heredoc ](https://en.wikipedia.org/wiki/Here_document) 是一种定义字符串（通常是多行），同时保持原始格式的方式。  
Heredoc 被定义为自定义字符串字面量，放置在两个 `$` 符号之间。

例如：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 在两个 heredocs 之间的值按原样处理。
:::

:::tip
- 您可以使用 heredoc 嵌入 SQL、HTML 或 XML 代码的片段等。
:::

## 定义和使用查询参数 {#defining-and-using-query-parameters}

查询参数允许您编写通用查询，包含抽象占位符而不是具体标识符。  
执行带有查询参数的查询时，  
所有占位符都被解析并替换为实际的查询参数值。

有两种方法可以定义查询参数：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

使用第二种变体时，它作为参数传递给 `clickhouse-client`，命令行中的格式如下：
- `<name>` 是查询参数的名称。
- `<value>` 是其值。

可以在查询中使用 `{<name>: <datatype>}` 引用查询参数，其中 `<name>` 是查询参数名称，`<datatype>` 是转换后的数据类型。

<details>
<summary>使用 SET 命令的示例</summary>

例如，以下 SQL 定义了名称为 `a`、`b`、`c` 和 `d` 的参数 - 每个参数具有不同的数据类型：

```sql
SET param_a = 13;
SET param_b = 'str';
SET param_c = '2022-08-04 18:30:53';
SET param_d = {'10': [11, 12], '13': [14, 15]};

SELECT
   {a: UInt32},
   {b: String},
   {c: DateTime},
   {d: Map(String, Array(UInt8))};

13    str    2022-08-04 18:30:53    {'10':[11,12],'13':[14,15]}
```
</details>

<details>
<summary>使用 clickhouse-client 的示例</summary>

如果您使用 `clickhouse-client`，参数应指定为 `--param_name=value`。例如，以下参数名称为 `message`，并作为 `String` 检索：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

如果查询参数表示数据库、表、函数或其他标识符的名称，请将其类型设置为 `Identifier`。例如，以下查询从名为 `uk_price_paid` 的表中返回行：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
查询参数不是一般的文本替换，不能在任意 SQL 查询的任意位置使用。  
它们主要设计用于在 `SELECT` 语句中替换标识符或字面量。
:::

## 函数 {#functions}

函数调用的写法与带有参数列表（可能为空）的标识符相同。  
与标准 SQL 不同的是，即使参数列表为空，括号也是必需的。  
例如：

```sql
now()
```

此外，还有：
- [普通函数](/sql-reference/functions/overview)。
- [聚合函数](/sql-reference/aggregate-functions)。

某些聚合函数可以在括号中包含两个参数列表。例如：

```sql
quantile (0.9)(x) 
```

这些聚合函数称为 "参数化" 函数，  
第一个列表中的参数叫做 "参数"。

:::note
不带参数的聚合函数的语法与普通函数的语法相同。
:::

## 操作符 {#operators}

操作符在查询解析过程中被转换为其对应的函数，考虑到优先级和结合性。

例如，表达式 

```text
1 + 2 * 3 + 4
```

被转换为 

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## 数据类型和数据库表引擎 {#data-types-and-database-table-engines}

在 `CREATE` 查询中，数据类型和表引擎的书写方式与标识符或函数相同。  
换句话说，它们可能包含也可能不包含参数列表。

有关更多信息，请参见以下部分：
- [数据类型](/sql-reference/data-types/index.md)
- [表引擎](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 表达式 {#expressions}

表达式可以是以下内容： 
- 函数
- 标识符
- 字面量
- 操作符的应用
- 括号中的表达式
- 子查询
- 或星号。

它也可以包含 [别名](#expression-aliases)。

表达式列表是由一个或多个用逗号分隔的表达式。  
函数和操作符可以将表达式作为参数。

## 表达式别名 {#expression-aliases}

别名是查询中为 [表达式](#expressions) 定义的用户自定义名称。

```sql
expr AS alias
```

上面的语法部分在下面解释。

| 语法部分 | 描述                                                                                                                               | 示例                                                                  | 备注                                                                                                                           |
|----------|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `AS`     | 用于定义别名的关键字。您可以在 `SELECT` 子句中为表名或列名定义别名，而无需使用 `AS` 关键字。                   | `SELECT table_name_alias.column_name FROM table_name table_name_alias`。| 在 [CAST](/sql-reference/functions/type-conversion-functions#cast) 函数中，`AS` 关键字有其他的含义。请参阅该函数的描述。 |
| `expr`   | ClickHouse 支持的任何表达式。                                                                                                            | `SELECT column_name * 2 AS double FROM some_table`                       |                                                                                                                               |
| `alias`  | `expr` 的名称。别名应符合 [标识符](#identifiers) 语法。                                                                                   | `SELECT "table t".column_name FROM table_name AS "table t"`。           |                                                                                                                               |

### 用法说明 {#notes-on-usage}

- 别名对于查询或子查询是全局的，您可以在查询的任何部分为任何表达式定义别名。例如：

```sql
SELECT (1 AS n) + 2, n`.
```

- 别名在子查询和子查询之间不可见。例如，在执行以下查询时，ClickHouse 会生成异常 `Unknown identifier: num`：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- 如果在子查询的 `SELECT` 子句中为结果列定义了别名，这些列在外部查询中可见。例如：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- 注意使用与列或表名称相同的别名。让我们考虑以下示例：

```sql
CREATE TABLE t
(
    a Int,
    b Int
)
ENGINE = TinyLog();

SELECT
    argMax(a, b),
    sum(b) AS b
FROM t;

Received exception from server (version 18.14.17):
Code: 184. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: Aggregate function sum(b) is found inside another aggregate function in query.
```

在前面的示例中，我们声明了表 `t` 及其列 `b`。  
然后，在选择数据时，我们定义了别名 `sum(b) AS b`。  
由于别名是全局的，  
ClickHouse 将表达式 `argMax(a, b)` 中的字面量 `b` 替换为表达式 `sum(b)`。  
此替换导致了异常。

:::note
您可以通过将 [prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias) 设置为 `1` 来更改此默认行为。
:::

## 星号 {#asterisk}

在 `SELECT` 查询中，星号可以替换表达式。  
有关更多信息，请参阅 [SELECT](/sql-reference/statements/select/index.md#asterisk) 部分。
