---
description: '语法说明'
sidebar_label: '语法'
sidebar_position: 2
slug: /sql-reference/syntax
title: '语法'
doc_type: 'reference'
---

在本节中，我们将介绍 ClickHouse 的 SQL 语法。
ClickHouse 使用基于 SQL 的语法，但提供了许多扩展和优化。

## 查询解析 {#query-parsing}

ClickHouse 中有两种类型的解析器：

* *完整 SQL 解析器*（递归下降解析器）。
* *数据格式解析器*（快速流式解析器）。

除 `INSERT` 查询以外的所有情况都使用完整 SQL 解析器，而 `INSERT` 查询会同时使用两种解析器。

下面我们来看这个查询：

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

如前所述，`INSERT` 查询会同时使用两类解析器。
`INSERT INTO t VALUES` 片段由完整解析器解析，
而数据 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` 则由数据格式解析器（或快速流式解析器）进行解析。

<details>
  <summary>启用完整解析器</summary>

  也可以通过 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 设置为数据启用完整解析器。

  当将上述设置设为 `1` 时，
  ClickHouse 首先尝试使用快速流式解析器解析这些值。
  如果失败，ClickHouse 会尝试对数据使用完整解析器，将其视为 SQL [表达式](#expressions)。
</details>

数据可以具有任意格式。
当接收到查询时，服务器在 RAM 中最多保留 [max&#95;query&#95;size](../operations/settings/settings.md#max_query_size) 字节的请求数据
（默认 1 MB），其余部分则通过流式解析完成。
这样做是为了避免大型 `INSERT` 查询导致的问题，而这也是在 ClickHouse 中写入数据的推荐方式。

在 `INSERT` 查询中使用 [`Values`](/interfaces/formats/Values) 格式时，
看起来数据的解析方式与 `SELECT` 查询中表达式的解析相同，但实际上并非如此。
`Values` 格式的功能要受更多限制。

本节的其余内容将介绍完整解析器。

:::note
有关格式解析器的更多信息，请参阅 [Formats](../interfaces/formats.md) 章节。
:::

## 空格 {#spaces}

* 在语法结构之间（包括查询的开头和结尾）可以存在任意数量的空白字符。
* 空白字符包括空格、制表符、换行符、回车符和换页符。

## 注释 {#comments}

ClickHouse 支持 SQL 风格和 C 风格的注释：

* SQL 风格的注释以 `--`、`#!` 或 `# ` 开头，并一直到行尾结束。`--` 和 `#!` 之后的空格可以省略。
* C 风格的注释从 `/*` 开始到 `*/` 结束，可以跨多行。同样不需要空格。

## 关键字 {#keywords}

在 ClickHouse 中，关键字是否区分大小写（*case-sensitive* 或 *case-insensitive*）取决于上下文。

当关键字满足以下条件时，它们是 **不区分大小写（case-insensitive）** 的：

* SQL 标准中的关键字。例如，`SELECT`、`select` 和 `SeLeCt` 都是有效的。
* 一些流行 DBMS（如 MySQL 或 Postgres）的实现。例如，`DateTime` 与 `datetime` 等价。

:::note
可以在 [system.data&#95;type&#95;families](/operations/system-tables/data_type_families) 表中检查某个数据类型名称是否区分大小写。
:::

与标准 SQL 相比，其他所有关键字（包括函数名）都是 **区分大小写（case-sensitive）** 的。

此外，关键字不是保留字。
只有在对应的上下文中才会被视为关键字。
如果使用与关键字同名的[标识符](#identifiers)，请使用双引号或反引号将其括起来。

例如，如果表 `table_name` 中存在一个名为 `"FROM"` 的列，则下面的查询是有效的：

```sql
SELECT "FROM" FROM table_name
```

## 标识符 {#identifiers}

标识符包括：

* 集群、数据库、表、分区和列名。
* [函数](#functions)。
* [数据类型](../sql-reference/data-types/index.md)。
* [表达式别名](#expression-aliases)。

标识符可以带引号或不带引号，但推荐使用不带引号的形式。

未带引号的标识符必须匹配正则表达式 `^[a-zA-Z_][0-9a-zA-Z_]*$`，且不能与[关键字](#keywords)相同。
参见下表，了解有效和无效标识符示例：

| 有效标识符                                     | 无效标识符                        |
|------------------------------------------------|-----------------------------------|
| `xyz`, `_internal`, `Id_with_underscores_123_` | `1x`, `tom@gmail.com`, `äußerst_schön` |

如果需要使用与关键字相同的标识符，或者想在标识符中使用其他符号，请使用双引号或反引号将其括起来，例如 `"id"`、`` `id` ``。

:::note
对带引号标识符进行转义的规则同样适用于字符串字面量。有关更多信息，请参阅 [String](#string)。
:::

## 字面量 {#literals}

在 ClickHouse 中，字面量是指在查询中直接出现的值。
换句话说，它是在查询执行期间不会改变的固定值。

字面量可以是：

* [字符串](#string)
* [数值](#numeric)
* [复合字面量](#compound)
* [`NULL`](#null)
* [Heredocs](#heredoc)（自定义字符串字面量）

我们将在下文的章节中对每一类进行更详细的介绍。

### String {#string}

字符串字面量必须用单引号包裹。不支持双引号。

转义可以通过以下任一方式实现：

* 使用重复单引号，其中单引号字符 `'`（且仅此字符）可以通过 `''` 进行转义，或
* 使用前置反斜杠以及下表中列出的受支持转义序列。

:::note
如果反斜杠出现在下表未列出的字符前面，则反斜杠会失去其特殊含义，即会被按字面值解释。
:::

| Supported Escape                    | Description                                                             |
|-------------------------------------|-------------------------------------------------------------------------|
| `\xHH`                              | 8 位字符表示形式，后接任意数量的十六进制数字 (H)。                     |
| `\N`                                | 保留，不执行任何操作（例如 `SELECT 'a\Nb'` 返回 `ab`）                  |
| `\a`                                | 提示音（警报）                                                          |
| `\b`                                | 退格                                                                   |
| `\e`                                | 转义字符                                                               |
| `\f`                                | 换页                                                                   |
| `\n`                                | 换行                                                                   |
| `\r`                                | 回车                                                                   |
| `\t`                                | 水平制表符                                                             |
| `\v`                                | 垂直制表符                                                             |
| `\0`                                | 空字符                                                                 |
| `\\`                                | 反斜杠                                                                 |
| `\'` (or `''`)                    | 单引号                                                                 |
| `\"`                                | 双引号                                                                 |
| `` ` ``                             | 反引号                                                                 |
| `\/`                                | 正斜杠                                                                 |
| `\=`                                | 等号                                                                   |
| ASCII control characters (c &lt;= 31). | ASCII 控制字符（c &lt;= 31）。                                      |

:::note
在字符串字面量中，至少需要使用转义码 `\'`（或：`''`）和 `\\` 来转义 `'` 和 `\`。
:::

### Numeric {#numeric}

数值字面量按如下方式解析：

* 如果字面量前有减号 `-`，则会先跳过该符号，在完成解析后对结果取相反数。
* 数值字面量首先会使用 [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 函数按 64 位无符号整数进行解析。
  * 如果值以 `0b` 或 `0x`/`0X` 为前缀，则分别解析为二进制或十六进制数。
  * 如果值为负数且其绝对值大于 2<sup>63</sup>，则会返回错误。
* 如果上述解析失败，则会使用 [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 函数将该值解析为浮点数。
* 否则，返回错误。

字面量值会被转换为可容纳该值的最小类型。
例如：

* `1` 会被解析为 `UInt8`
* `256` 会被解析为 `UInt16`。

:::note 重要
位宽大于 64 位的整数类型（`UInt128`、`Int128`、`UInt256`、`Int256`）必须显式转换为更大的类型才能被正确解析：

```sql
-170141183460469231731687303715884105728::Int128
340282366920938463463374607431768211455::UInt128
-57896044618658097711785492504343953926634992332820282019728792003956564819968::Int256
115792089237316195423570985008687907853269984665640564039457584007913129639935::UInt256
```

这会绕过上述算法，改用支持任意精度的函数来解析整数。

否则，该字面量将被解析为浮点数，因此会因为截断而导致精度损失。
:::

更多信息，请参阅[数据类型](../sql-reference/data-types/index.md)。

数字字面量中的下划线 `_` 会被忽略，可以用于提高可读性。

支持以下数值字面量：

| 数值字面量                 | 示例                                              |
| --------------------- | ----------------------------------------------- |
| **整数**                | `1`, `10_000_000`, `18446744073709551615`, `01` |
| **小数**                | `0.1`                                           |
| **指数表示法**             | `1e100`, `-1e-100`                              |
| **浮点数**               | `123.456`, `inf`, `nan`                         |
| **十六进制**              | `0xc0fe`                                        |
| **兼容 SQL 标准的十六进制字符串** | `x'c0fe'`                                       |
| **二进制**               | `0b1101`                                        |
| **兼容 SQL 标准的二进制字符串**  | `b'1101'`                                       |

:::note
不支持八进制字面量，以避免在解释时出现意外错误。
:::

### 复合类型 {#compound}

数组使用方括号构造 `[1, 2, 3]`。元组使用圆括号构造 `(1, 'Hello, world!', 2)`。
从技术上讲，这些并不是字面量，而是分别带有数组创建运算符和元组创建运算符的表达式。
数组必须至少包含一个元素，元组必须至少包含两个元素。

:::note
当元组出现在 `SELECT` 查询的 `IN` 子句中时，属于另一种情况。
查询结果中可以包含元组，但元组不能保存到数据库中（使用 [Memory](../engines/table-engines/special/memory.md) 引擎的表除外）。
:::

### NULL {#null}

`NULL` 用于表示某个值缺失。
要在表字段中存储 `NULL`，该字段的数据类型必须是 [Nullable](../sql-reference/data-types/nullable.md)。

:::note
关于 `NULL`，需要注意以下几点：

* 根据数据格式（输入或输出）的不同，`NULL` 可能有不同的表示形式。更多信息请参阅 [数据格式](/interfaces/formats)。
* `NULL` 的处理较为复杂。例如，如果比较运算中的任一参数为 `NULL`，则该运算的结果也为 `NULL`。乘法、加法和其他运算同样如此。建议查阅各个运算的文档说明。
* 在查询中，可以使用 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isNull) 和 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isNotNull) 运算符，以及相关函数 `isNull` 和 `isNotNull` 来检查 `NULL`。
  :::

### Heredoc {#heredoc}

[Heredoc](https://en.wikipedia.org/wiki/Here_document) 是一种用于定义字符串（通常为多行字符串）的方法，并且能够保留其原始格式。
Heredoc 被定义为一种自定义字符串字面量，置于两个 `$` 符号之间。

例如：

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note

* 两个 heredoc 之间的值会被按原样（as-is）处理。
  :::

:::tip

* 你可以使用 heredoc 来嵌入 SQL、HTML、XML 等代码片段。
  :::

## 定义和使用查询参数 {#defining-and-using-query-parameters}

查询参数允许编写包含抽象占位符而不是具体标识符的通用查询。
当执行带有查询参数的查询时，
所有占位符都会被解析并替换为实际的查询参数值。

有两种方式定义查询参数：

* `SET param_<name>=<value>`
* `--param_<name>='<value>'`

使用第二种方式时，它作为参数在命令行中传递给 `clickhouse-client`，其中：

* `<name>` 是查询参数的名称。
* `<value>` 是其值。

可以在查询中使用 `{<name>: <datatype>}` 来引用查询参数，其中 `<name>` 是查询参数名，`<datatype>` 是其要转换成的数据类型。

<details>
  <summary>使用 SET 命令的示例</summary>

  例如，下面的 SQL 定义了名为 `a`、`b`、`c` 和 `d` 的参数——每个都有不同的数据类型：

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

  如果使用 `clickhouse-client`，参数以 `--param_name=value` 的形式指定。例如，下面的参数名为 `message`，并以 `String` 类型获取：

  ```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

  如果查询参数表示数据库、表、函数或其他标识符的名称，请将其类型设置为 `Identifier`。例如，下面的查询会返回名为 `uk_price_paid` 的表中的行：

  ```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```
</details>

:::note
查询参数并不是一种可以在任意 SQL 查询中任意位置使用的通用文本替换机制。
它们主要用于在 `SELECT` 语句中替代标识符或字面量。
:::

## 函数 {#functions}

函数调用的写法是：在标识符后面加上一对圆括号，其中包含参数列表（可以为空）。
与标准 SQL 不同，括号是必需的，即使参数列表为空也是如此。
例如：

```sql
now()
```

还有：

* [常规函数](/sql-reference/functions/overview)。
* [聚合函数](/sql-reference/aggregate-functions)。

某些聚合函数在括号中可以包含两个参数列表。例如：

```sql
quantile (0.9)(x) 
```

这些聚合函数称为“参数化”函数，
第一个参数列表中的实参称为“参数”。

:::note
不带参数的聚合函数的语法与常规函数相同。
:::

## 运算符 {#operators}

在查询解析阶段，运算符会根据其优先级和结合性被转换为对应的函数。

例如，表达式

```text
1 + 2 * 3 + 4
```

会被转换为

```text
plus(plus(1, multiply(2, 3)), 4)`
```

## 数据类型和数据库表引擎 {#data-types-and-database-table-engines}

`CREATE` 查询中的数据类型和表引擎的写法与标识符或函数相同。
换句话说，它们可以带或不带括号中的参数列表。

更多信息，请参阅以下部分：

* [数据类型](/sql-reference/data-types/index.md)
* [表引擎](/engines/table-engines/index.md)
* [CREATE](/sql-reference/statements/create/index.md)

## 表达式 {#expressions}

表达式可以是以下任意一种：

* 函数
* 标识符
* 字面量
* 运算符的使用
* 用括号括起来的表达式
* 子查询
* 星号

它也可以包含一个[别名](#expression-aliases)。

表达式列表是由一个或多个用逗号分隔的表达式构成。
函数和运算符则可以将表达式作为参数。

常量表达式是指其结果在查询分析期间（即执行之前）就已知的表达式。
例如，基于字面量的表达式就是常量表达式。

## 表达式别名 {#expression-aliases}

别名是在查询中为一个[表达式](#expressions)指定的用户自定义名称。

```sql
expr AS alias
```

上面语法各个部分的说明如下。

| 语法部分    | 描述                                                       | 示例                                                                      | 备注                                                                                              |
| ------- | -------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `AS`    | 用于定义别名的关键字。在 `SELECT` 子句中，可以在不使用 `AS` 关键字的情况下为表名或列名定义别名。 | `SELECT table_name_alias.column_name FROM table_name table_name_alias`. | 在 [CAST](/sql-reference/functions/type-conversion-functions#cast) 函数中，`AS` 关键字有另一层含义。请参见该函数的说明。 |
| `expr`  | 任意 ClickHouse 支持的表达式。                                    | `SELECT column_name * 2 AS double FROM some_table`                      |                                                                                                 |
| `alias` | `expr` 的名称。别名必须符合 [标识符](#identifiers) 语法规则。              | `SELECT "table t".column_name FROM table_name AS "table t"`.            |                                                                                                 |

### 使用说明 {#notes-on-usage}

* 在一个查询或子查询中，别名是全局有效的，你可以在查询的任意部分为任意表达式定义别名。例如：

```sql
SELECT (1 AS n) + 2, n`.
```

* 别名在子查询内部以及子查询之间是不可见的。例如，在执行下面的查询时，ClickHouse 会抛出异常 `Unknown identifier: num`：

```sql
`SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a`
```

* 如果在子查询的 `SELECT` 子句中为结果列定义了别名，这些列在外部查询中是可见的。例如：

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)`.
```

* 在使用与列名或表名相同的别名时要小心。来看下面的示例：

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

在前面的示例中，我们声明了一个包含列 `b` 的表 `t`。
然后，在查询数据时，我们定义了别名 `sum(b) AS b`。
由于别名是全局的，
ClickHouse 将表达式 `argMax(a, b)` 中的标识符 `b` 替换为了表达式 `sum(b)`。
这种替换导致了异常。

:::note
你可以通过将 [prefer&#95;column&#95;name&#95;to&#95;alias](/operations/settings/settings#prefer_column_name_to_alias) 设置为 `1` 来更改这一默认行为。
:::

## Asterisk {#asterisk}

在 `SELECT` 查询中，可以使用星号代替表达式。\
有关更多信息，请参阅 [SELECT](/sql-reference/statements/select/index.md#asterisk) 一节。