---
slug: /sql-reference/syntax
sidebar_position: 2
sidebar_label: 语法
title: 语法
displayed_sidebar: sqlreference
---

在本节中，我们将查看 ClickHouse 的 SQL 语法。  
ClickHouse 使用基于 SQL 的语法，但提供了一些扩展和优化。

## 查询解析 {#query-parsing}

ClickHouse 中有两种类型的解析器：
- _全 SQL 解析器_（递归下降解析器）。
- _数据格式解析器_（快速流解析器）。

全 SQL 解析器在所有情况下使用，除了使用 `INSERT` 查询的场景，该查询同时使用两个解析器。

让我们检查下面的查询：

``` sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

如前所述，`INSERT` 查询使用了两个解析器。  
`INSERT INTO t VALUES` 片段由全解析器解析，  
数据 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` 由数据格式解析器或快速流解析器解析。

<details>
<summary>开启全解析器</summary>

您也可以通过使用 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 设置来为数据开启全解析器。

当上述设置设置为 `1` 时，  
ClickHouse 首先尝试使用快速流解析器解析值。  
如果失败，ClickHouse 将尝试将数据使用全解析器解析，将其视为 SQL [表达式](#expressions)。
</details>

数据可以有任何格式。  
当查询被接收时，服务器在内存中计算不超过 [max_query_size](../operations/settings/settings.md#max_query_size) 字节的请求  
（默认值为 1 MB），其余部分会使用流解析。  
这是为了避免出现大 `INSERT` 查询的问题，这是在 ClickHouse 中插入数据的推荐方式。

在 `INSERT` 查询中使用 [`Values`](../interfaces/formats.md/#data-format-values) 格式时，  
看起来数据的解析与 `SELECT` 查询中的表达式相同，但情况并非如此。  
`Values` 格式受到很大限制。

本节其余部分涵盖全解析器。

:::note
有关格式解析器的更多信息，请参见 [格式](../interfaces/formats.md) 部分。
:::

## 空格 {#spaces}

- 在语法结构之间（包括查询的开始和结束）可以有任意数量的空格符号。  
- 空格符号包括空格、制表符、换行符、回车符和换页符。

## 注释 {#comments}

ClickHouse 支持 SQL 风格和 C 风格的注释：

- SQL 风格的注释以 `--`、`#!` 或 `# ` 开头，并持续到行尾。在 `--` 和 `#!` 后的空格可以省略。
- C 风格的注释从 `/*` 开始，以 `*/` 结束，可以是多行的。空格也是不需要的。

## 关键字 {#keywords}

ClickHouse 中的关键字可以是_区分大小写的_或_不区分大小写的_，这取决于上下文。

关键字在与以下内容对应时是 **不区分大小写的**：

- SQL 标准。例如，`SELECT`、`select` 和 `SeLeCt` 都是有效的。
- 一些流行的 DBMS（如 MySQL 或 Postgres）的实现。例如，`DateTime` 与 `datetime` 是相同的。

:::note
您可以查看 [system.data_type_families](/operations/system-tables/data_type_families) 表来检查数据类型名称是否区分大小写。
:::

与标准 SQL 相比，所有其他关键字（包括函数名称）都是 **区分大小写的**。

而且，关键字不是被保留的。  
它们仅在相应的上下文中被如此对待。  
如果您使用与关键字同名的 [标识符](#identifiers)，请将它们用双引号或反引号括起来。

例如，如果表 `table_name` 有一个名为 `"FROM"` 的列，则以下查询是有效的：

```sql
SELECT "FROM" FROM table_name
```

## 标识符 {#identifiers}

标识符是：

- 集群、数据库、表、分区和列名称。
- [函数](#functions)。
- [数据类型](../sql-reference/data-types/index.md)。
- [表达式别名](#expression-aliases)。

标识符可以是带引号的或不带引号的，尽管后者更受欢迎。

不带引号的标识符必须匹配正则表达式 `^[a-zA-Z_][0-9a-zA-Z_]*$`，且不能等于 [关键字](#keywords)。  
请参见下表，了解有效和无效标识符的示例：

| 有效标识符                                  | 无效标识符                          |
|----------------------------------------------|--------------------------------------|
| `xyz`、`_internal`、`Id_with_underscores_123_` | `1x`、`tom@gmail.com`、`äußerst_schön` |

如果您想使用与关键字相同的标识符或希望在标识符中使用其他符号，请使用双引号或反引号引用它，例如，`"id"`、`` `id` ``。

:::note
对带引号的标识符在转义时适用的相同规则也适用于字符串文字。有关更多详细信息，参见 [字符串](#string)。
:::

## 文本常量 {#literals}

在 ClickHouse 中，文本常量是直接在查询中表示的值。  
换句话说，它是一个在查询执行期间不会改变的固定值。

文本常量可以是：
- [字符串](#string)
- [数字](#numeric)
- [复合](#compound)
- [`NULL`](#null)
- [Heredoc](#heredoc)（自定义字符串文字）

我们在下面的各节中将更详细地查看这些内容。

### 字符串 {#string}

字符串常量必须用单引号括起来。不支持双引号。

转义通过以下方式工作：

- 使用前置的单引号，单引号字符 `'`（且只有此字符）可转义为 `''`，或
- 使用前置反斜杠和以下列出的支持转义序列。

:::note
如果反斜杠前面是除下面列出之外的其他字符，反斜杠将失去其特殊含义，即按字面意义解释。
:::

| 支持的转义                    | 描述                                                              |
|-----------------------------|------------------------------------------------------------------|
| `\xHH`                      | 8 位字符规格，其后跟任意数量的十六进制数字 (H)。                      | 
| `\N`                        | 保留，不执行任何操作（例如，`SELECT 'a\Nb'` 返回 `ab`）               |
| `\a`                        | 响铃                                                              |
| `\b`                        | 退格                                                              |
| `\e`                        | 转义字符                                                          |
| `\f`                        | 换页                                                              |
| `\n`                        | 换行                                                              |
| `\r`                        | 回车                                                              |
| `\t`                        | 水平制表符                                                        |
| `\v`                        | 垂直制表符                                                        |
| `\0`                        | 空字符                                                            |
| `\\`                        | 反斜杠                                                            |
| `\'`（或 ` '' `）              | 单引号                                                            |
| `\"`                        | 双引号                                                            |
| `` ` ``                     | 反引号                                                            |
| `\/`                        | 正斜杠                                                          |
| `\=`                        | 等于号                                                            |
| ASCII 控制字符 (c &lt;= 31)。 |                                                                  |

:::note
在字符串常量中，您需要使用转义代码 `\'`（或：`''`）和 `\\` 转义至少 `'` 和 `\`。
:::

### 数字 {#numeric}

数字常量的解析如下：

- 首先，作为 64 位有符号数字，使用 [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 函数。
- 如果失败，则作为 64 位无符号数字，使用 [strtoll](https://en.cppreference.com/w/cpp/string/byte/strtol) 函数。
- 如果仍然失败，则作为浮点数，使用 [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 函数。
- 否则，将返回错误。

文字符号的值被转换为可以容纳该值的最小类型。  
例如：
- `1` 解析为 `UInt8`
- `256` 解析为 `UInt16`。

有关更多信息，请参见 [数据类型](../sql-reference/data-types/index.md)。

数字常量中的下划线 `_` 会被忽略，可用于提高可读性。

支持以下数字常量：

| 数字常量                             | 示例                                        |
|--------------------------------------|-------------------------------------------|
| **整数**                             | `1`、`10_000_000`、`18446744073709551615`、`01` |
| **小数**                             | `0.1`                                       |
| **指数表示法**                       | `1e100`、`-1e-100`                        |
| **浮点数**                           | `123.456`、`inf`、`nan`                    |
| **十六进制**                         | `0xc0fe`                                   |
| **与 SQL 标准兼容的十六进制字符串**   | `x'c0fe'`                                  |
| **二进制**                           | `0b1101`                                   |
| **与 SQL 标准兼容的二进制字符串**    | `b'1101'`                                  |

:::note
为避免意外的解析错误，不支持八进制常量。
:::

### 复合 {#compound}

数组用方括号构造 `[1, 2, 3]`。元组用圆括号构造 `(1, 'Hello, world!', 2)`。  
从技术上讲，这些不是常量，而是分别使用数组创建运算符和元组创建运算符的表达式。  
数组必须至少包含一个项目，且元组必须至少有两个项目。

:::note
在 `SELECT` 查询的 `IN` 子句中存在不同的情况。  
查询结果可以包括元组，但元组不能保存到数据库中（除了使用 [Memory](../engines/table-engines/special/memory.md) 引擎的表）。
:::

### NULL {#null}

`NULL` 用于表示缺失的值。  
要在表字段中存储 `NULL`，该字段必须为 [Nullable](../sql-reference/data-types/nullable.md) 类型。

:::note
关于 `NULL` 值有以下几点要注意：

- 根据数据格式（输入或输出），`NULL` 可能有不同的表示。有关更多信息，请参见 [数据格式](/interfaces/formats)。
- `NULL` 处理是微妙的。例如，如果比较操作的至少一个参数为 `NULL`，该操作的结果也为 `NULL`。乘法、加法和其他操作也是如此。我们建议查看每个操作的文档。
- 在查询中，您可以使用 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isnull) 和 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isnotnull) 操作符以及相关函数 `isNull` 和 `isNotNull` 检查 `NULL`。
:::

### Heredoc {#heredoc}

[heredoc](https://en.wikipedia.org/wiki/Here_document) 是一种定义字符串（通常是多行），同时保持原始格式的方式。  
Heredoc 被定义为自定义字符串常量，放置在两个 `$` 符号之间。

例如：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note
- 位于两个 heredoc 之间的值被“原样”处理。
:::

:::tip
- 您可以使用 heredoc 嵌入 SQL、HTML 或 XML 代码等片段。
:::

## 定义和使用查询参数 {#defining-and-using-query-parameters}

查询参数允许您编写通用查询，这些查询包含抽象占位符而不是具体标识符。  
当带有查询参数的查询被执行时，  
所有占位符都会被解析并替换为实际的查询参数值。

有两种定义查询参数的方法：

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

在使用第二种变体时，它会作为参数传递给 `clickhouse-client` 的命令行，其中：
- `<name>` 是查询参数的名称。
- `<value>` 是其值。

可以通过 `{<name>: <datatype>}` 在查询中引用查询参数，其中 `<name>` 是查询参数的名称，`<datatype>` 是要转换的类型。

<details>
<summary>使用 SET 命令的示例</summary>

例如，以下 SQL 定义了名为 `a`、`b`、`c` 和 `d` 的参数，每个参数具有不同的数据类型：

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

13	str	2022-08-04 18:30:53	{'10':[11,12],'13':[14,15]}
```
</details>

<details>
<summary>使用 clickhouse-client 的示例</summary>

如果您使用 `clickhouse-client`，参数以 `--param_name=value` 形式指定。例如，以下参数的名称为 `message`，并以 `String` 类型获取：

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

如果查询参数表示数据库、表、函数或其他标识符的名称，请使用 `Identifier` 作为其类型。例如，以下查询从名为 `uk_price_paid` 的表返回行：

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
查询参数不是在任意 SQL 查询的任意位置使用的通用文本替换。  
它们主要旨在在 `SELECT` 语句中替代标识符或常量。
:::

## 函数 {#functions}

函数调用的写法类似于标识符，后面跟一个参数列表（可能为空）。  
与标准 SQL 不同的是，即使参数列表为空，也要求使用括号。  
例如：

```sql
now()
```

还有：
- [普通函数](/sql-reference/functions/overview)。
- [聚合函数](/sql-reference/aggregate-functions)。

某些聚合函数可以在括号中包含两个参数列表。例如：

```sql
quantile (0.9)(x) 
```

这些聚合函数称为“参数化”函数，  
第一个列表中的参数称为“参数”。

:::note
没有参数的聚合函数的语法与普通函数相同。
:::

## 运算符 {#operators}

运算符在查询解析过程中转换为相应的函数，同时考虑它们的优先级和结合性。

例如，表达式 

```text
1 + 2 * 3 + 4
```

被转换为 

```
plus(plus(1, multiply(2, 3)), 4)`
```

## 数据类型和数据库表引擎 {#data-types-and-database-table-engines}

在 `CREATE` 查询中，数据类型和表引擎的写法与标识符或函数相同。  
换句话说，它们可以包含参数列表，也可以不包含参数列表。

有关更多信息，请参见以下部分：
- [数据类型](/sql-reference/data-types/index.md)
- [表引擎](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。

## 表达式 {#expressions}

表达式可以是以下内容： 
- 一个函数
- 一个标识符
- 一个常量
- 运算符的应用
- 括号中的表达式
- 一个子查询
- 或者一个星号。

它也可以包含 [别名](#expression-aliases)。

表达式的列表是一个或多个用逗号分隔的表达式。  
函数和运算符反过来可以有表达式作为参数。

## 表达式别名 {#expression-aliases}

别名是查询中 [表达式](#expressions) 的用户定义名称。

``` sql
expr AS alias
```

上述语法的各个部分在下文中解释。

| 语法部分  | 描述                                                                                                                                  | 示例                                                                 | 备注                                                                                                                                               |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `AS`      | 定义别名的关键字。您可以在 `SELECT` 子句中定义表名或列名的别名，而无需使用 `AS` 关键字。| `SELECT table_name_alias.column_name FROM table_name table_name_alias`。 | 在 [CAST](/sql-reference/functions/type-conversion-functions#cast) 函数中，`AS` 关键字具有另一个含义。请参阅该函数的描述。                          |
| `expr`    | ClickHouse 支持的任何表达式。                                                                                                         | `SELECT column_name * 2 AS double FROM some_table`                   |                                                                                                                                                 |
| `alias`   | `expr` 的名称。别名应遵循 [标识符](#identifiers) 的语法。                                                                                         | `SELECT "table t".column_name FROM table_name AS "table t"`。       |                                                                                                                                                 |

### 使用注意事项 {#notes-on-usage}

- 别名在查询或子查询中是全局的，您可以在查询的任何部分为任何表达式定义别名。例如：

```sql
SELECT (1 AS n) + 2, n`.
```

- 别名在子查询和子查询之间不可见。例如，当执行以下查询时，ClickHouse 会生成异常 `Unknown identifier: num`：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

- 如果在子查询的 `SELECT` 子句中为结果列定义了别名，则这些列在外部查询中是可见的。例如：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

- 对于与列或表名相同的别名要小心。考虑以下示例：

``` sql
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

在上述示例中，我们声明了表 `t`，其中包含列 `b`。  
然后，在选择数据时，我们定义了 `sum(b) AS b` 别名。  
由于别名是全局的，  
ClickHouse 将表达式 `argMax(a, b)` 中的文字 `b` 替换为表达式 `sum(b)`。  
这种替换导致了异常的发生。

:::note
您可以通过将 [prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias) 设置为 `1` 来改变此默认行为。
:::

## 星号 {#asterisk}

在 `SELECT` 查询中，星号可以替代表达式。  
有关更多信息，请参见 [SELECT](/sql-reference/statements/select/index.md#asterisk) 部分。
