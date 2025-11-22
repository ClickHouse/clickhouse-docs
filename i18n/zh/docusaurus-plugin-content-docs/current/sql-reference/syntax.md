---
description: '语法文档'
displayed_sidebar: 'sqlreference'
sidebar_label: '语法'
sidebar_position: 2
slug: /sql-reference/syntax
title: '语法'
doc_type: 'reference'
---

在本节中，我们将介绍 ClickHouse 的 SQL 语法。
ClickHouse 采用基于 SQL 的语法，并在此基础上提供了多种扩展和优化。



## 查询解析 {#query-parsing}

ClickHouse 中有两种类型的解析器:

- _完整 SQL 解析器_(递归下降解析器)。
- _数据格式解析器_(快速流解析器)。

除了 `INSERT` 查询会同时使用两种解析器外,完整 SQL 解析器用于所有其他情况。

让我们看看下面的查询:

```sql
INSERT INTO t VALUES (1, 'Hello, world'), (2, 'abc'), (3, 'def')
```

如前所述,`INSERT` 查询会同时使用两种解析器。
`INSERT INTO t VALUES` 部分由完整解析器解析,
而数据 `(1, 'Hello, world'), (2, 'abc'), (3, 'def')` 则由数据格式解析器(即快速流解析器)解析。

<details>
<summary>启用完整解析器</summary>

您也可以通过 [`input_format_values_interpret_expressions`](../operations/settings/settings-formats.md#input_format_values_interpret_expressions) 设置来为数据启用完整解析器。

当该设置设为 `1` 时,
ClickHouse 会首先尝试使用快速流解析器解析值。
如果失败,ClickHouse 会尝试对数据使用完整解析器,将其视为 SQL [表达式](#expressions)。

</details>

数据可以是任何格式。
当接收到查询时,服务器会在 RAM 中计算不超过 [max_query_size](../operations/settings/settings.md#max_query_size) 字节的请求内容
(默认为 1 MB),其余部分采用流式解析。
这样可以避免大型 `INSERT` 查询出现问题,这也是在 ClickHouse 中插入数据的推荐方式。

在 `INSERT` 查询中使用 [`Values`](/interfaces/formats/Values) 格式时,
数据的解析可能看起来与 `SELECT` 查询中的表达式解析相同,但实际上并非如此。
`Values` 格式的限制要多得多。

本节的其余部分将介绍完整解析器。

:::note
有关格式解析器的更多信息,请参阅 [格式](../interfaces/formats.md) 部分。
:::


## 空格 {#spaces}

- 语法结构之间(包括查询的开头和结尾)可以包含任意数量的空格字符。
- 空格字符包括空格、制表符、换行符、回车符和换页符。


## 注释 {#comments}

ClickHouse 支持 SQL 风格和 C 风格的注释:

- SQL 风格的注释以 `--`、`#!` 或 `# ` 开头,一直延续到行尾。`--` 和 `#!` 后面的空格可以省略。
- C 风格的注释从 `/*` 开始到 `*/` 结束,可以跨多行。同样不需要空格。


## 关键字 {#keywords}

ClickHouse 中的关键字可以是 _区分大小写_ 或 _不区分大小写_,具体取决于上下文。

关键字在以下情况下 **不区分大小写**:

- SQL 标准。例如,`SELECT`、`select` 和 `SeLeCt` 都是有效的。
- 某些流行数据库管理系统(MySQL 或 Postgres)的实现。例如,`DateTime` 与 `datetime` 相同。

:::note
您可以在 [system.data_type_families](/operations/system-tables/data_type_families) 表中检查数据类型名称是否区分大小写。
:::

与标准 SQL 不同,所有其他关键字(包括函数名称)都 **区分大小写**。

此外,关键字不是保留字。
它们仅在相应的上下文中被视为关键字。
如果使用与关键字同名的[标识符](#identifiers),请将其用双引号或反引号括起来。

例如,如果表 `table_name` 有一个名为 `"FROM"` 的列,则以下查询是有效的:

```sql
SELECT "FROM" FROM table_name
```


## 标识符 {#identifiers}

标识符包括:

- 集群、数据库、表、分区和列名称。
- [函数](#functions)。
- [数据类型](../sql-reference/data-types/index.md)。
- [表达式别名](#expression-aliases)。

标识符可以带引号或不带引号,但推荐使用不带引号的形式。

不带引号的标识符必须匹配正则表达式 `^[a-zA-Z_][0-9a-zA-Z_]*$`,且不能与[关键字](#keywords)相同。

下表列出了有效和无效标识符的示例:

| 有效标识符                              | 无效标识符                    |
| ---------------------------------------------- | -------------------------------------- |
| `xyz`, `_internal`, `Id_with_underscores_123_` | `1x`, `tom@gmail.com`, `äußerst_schön` |

如果要使用与关键字相同的标识符,或在标识符中使用其他符号,请使用双引号或反引号将其括起来,例如 `"id"`、`` `id` ``。

:::note
带引号标识符的转义规则同样适用于字符串字面量。详情请参阅[字符串](#string)。
:::


## 字面量 {#literals}

在 ClickHouse 中,字面量是直接在查询中表示的值。
换句话说,它是在查询执行期间不会改变的固定值。

字面量可以是:

- [字符串](#string)
- [数值](#numeric)
- [复合](#compound)
- [`NULL`](#null)
- [Heredocs](#heredoc)(自定义字符串字面量)

我们将在下面的章节中更详细地介绍每一种类型。

### 字符串 {#string}

字符串字面量必须用单引号括起来。不支持双引号。

转义可以通过以下方式实现:

- 使用前置单引号,其中单引号字符 `'`(且仅此字符)可以转义为 `''`,或
- 使用前置反斜杠,配合下表中列出的支持的转义序列。

:::note
反斜杠会失去其特殊含义,即如果它位于下面列出的字符以外的字符之前,则会被按字面意义解释。
:::

| 支持的转义                       | 描述                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `\xHH`                                 | 8 位字符规范,后跟任意数量的十六进制数字(H)。 |
| `\N`                                   | 保留,不执行任何操作(例如 `SELECT 'a\Nb'` 返回 `ab`)                |
| `\a`                                   | 警报                                                                   |
| `\b`                                   | 退格                                                               |
| `\e`                                   | 转义字符                                                        |
| `\f`                                   | 换页                                                               |
| `\n`                                   | 换行                                                               |
| `\r`                                   | 回车                                                         |
| `\t`                                   | 水平制表符                                                          |
| `\v`                                   | 垂直制表符                                                            |
| `\0`                                   | 空字符                                                          |
| `\\`                                   | 反斜杠                                                               |
| `\'`(或 `''`)                         | 单引号                                                            |
| `\"`                                   | 双引号                                                            |
| `` ` ``                                | 反引号                                                                |
| `\/`                                   | 正斜杠                                                           |
| `\=`                                   | 等号                                                              |
| ASCII 控制字符(c &lt;= 31)。 |                                                                         |

:::note
在字符串字面量中,您至少需要使用转义码 `\'`(或:`''`)和 `\\` 来转义 `'` 和 `\`。
:::

### 数值 {#numeric}

数值字面量按以下方式解析:

- 如果字面量以减号 `-` 为前缀,则跳过该标记,并在解析后对结果取反。
- 数值字面量首先使用 [strtoull](https://en.cppreference.com/w/cpp/string/byte/strtoul) 函数解析为 64 位无符号整数。
  - 如果值以 `0b` 或 `0x`/`0X` 为前缀,则该数字分别解析为二进制或十六进制。
  - 如果值为负且绝对值大于 2<sup>63</sup>,则返回错误。
- 如果不成功,则接下来使用 [strtod](https://en.cppreference.com/w/cpp/string/byte/strtof) 函数将该值解析为浮点数。
- 否则,返回错误。

字面量值会被转换为该值适合的最小类型。
例如:

- `1` 被解析为 `UInt8`
- `256` 被解析为 `UInt16`。

:::note 重要
宽度超过 64 位的整数值(`UInt128`、`Int128`、`UInt256`、`Int256`)必须转换为更大的类型才能正确解析:

```sql
-170141183460469231731687303715884105728::Int128
340282366920938463463374607431768211455::UInt128
-57896044618658097711785492504343953926634992332820282019728792003956564819968::Int256
115792089237316195423570985008687907853269984665640564039457584007913129639935::UInt256
```

这会绕过上述算法,并使用支持任意精度的例程来解析整数。

否则,字面量将被解析为浮点数,因此会因截断而导致精度损失。
:::

有关更多信息,请参阅[数据类型](../sql-reference/data-types/index.md)。

数值字面量中的下划线 `_` 会被忽略,可用于提高可读性。

支持以下数值字面量:


| 数值字面量                           | 示例                                        |
| ----------------------------------------- | ----------------------------------------------- |
| **整数**                              | `1`, `10_000_000`, `18446744073709551615`, `01` |
| **小数**                              | `0.1`                                           |
| **指数表示法**                  | `1e100`, `-1e-100`                              |
| **浮点数**                | `123.456`, `inf`, `nan`                         |
| **十六进制**                                   | `0xc0fe`                                        |
| **SQL 标准兼容的十六进制字符串**    | `x'c0fe'`                                       |
| **二进制**                                | `0b1101`                                        |
| **SQL 标准兼容的二进制字符串** | `b'1101'`                                       |

:::note
不支持八进制字面量,以避免解释时出现意外错误。
:::

### 复合类型 {#compound}

数组使用方括号构造 `[1, 2, 3]`。元组使用圆括号构造 `(1, 'Hello, world!', 2)`。
从技术上讲,这些不是字面量,而是分别使用数组创建运算符和元组创建运算符的表达式。
数组必须至少包含一个元素,元组必须至少包含两个元素。

:::note
当元组出现在 `SELECT` 查询的 `IN` 子句中时,属于特殊情况。
查询结果可以包含元组,但元组不能保存到数据库中(使用 [Memory](../engines/table-engines/special/memory.md) 引擎的表除外)。
:::

### NULL {#null}

`NULL` 用于表示值缺失。
要在表字段中存储 `NULL`,该字段必须是 [Nullable](../sql-reference/data-types/nullable.md) 类型。

:::note
关于 `NULL` 需要注意以下几点:

- 根据数据格式(输入或输出)的不同,`NULL` 可能有不同的表示形式。有关更多信息,请参阅[数据格式](/interfaces/formats)。
- `NULL` 的处理较为复杂。例如,如果比较操作的至少一个参数是 `NULL`,则该操作的结果也是 `NULL`。乘法、加法和其他操作同样如此。建议阅读每个操作的相关文档。
- 在查询中,可以使用 [`IS NULL`](/sql-reference/functions/functions-for-nulls#isNull) 和 [`IS NOT NULL`](/sql-reference/functions/functions-for-nulls#isNotNull) 运算符以及相关函数 `isNull` 和 `isNotNull` 来检查 `NULL`。
  :::

### Heredoc {#heredoc}

[heredoc](https://en.wikipedia.org/wiki/Here_document) 是一种定义字符串(通常是多行)的方法,同时保持原始格式。
heredoc 被定义为自定义字符串字面量,放置在两个 `$` 符号之间。

例如:

```sql
SELECT $heredoc$SHOW CREATE VIEW my_view$heredoc$;

┌─'SHOW CREATE VIEW my_view'─┐
│ SHOW CREATE VIEW my_view   │
└────────────────────────────┘
```

:::note

- 两个 heredoc 之间的值按"原样"处理。
  :::

:::tip

- 可以使用 heredoc 嵌入 SQL、HTML 或 XML 代码片段等。
  :::


## 定义和使用查询参数 {#defining-and-using-query-parameters}

查询参数允许您编写包含抽象占位符而非具体标识符的通用查询。
当执行带有查询参数的查询时,
所有占位符都会被解析并替换为实际的查询参数值。

定义查询参数有两种方式:

- `SET param_<name>=<value>`
- `--param_<name>='<value>'`

使用第二种方式时,它作为参数在命令行中传递给 `clickhouse-client`,其中:

- `<name>` 是查询参数的名称。
- `<value>` 是其值。

查询参数可以在查询中使用 `{<name>: <datatype>}` 进行引用,其中 `<name>` 是查询参数名称,`<datatype>` 是其要转换到的数据类型。

<details>
<summary>使用 SET 命令的示例</summary>

例如,以下 SQL 定义了名为 `a`、`b`、`c` 和 `d` 的参数——每个参数具有不同的数据类型:

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

如果您使用 `clickhouse-client`,参数以 `--param_name=value` 的形式指定。例如,以下参数名为 `message`,并以 `String` 类型获取:

```bash
clickhouse-client --param_message='hello' --query="SELECT {message: String}"

hello
```

如果查询参数表示数据库、表、函数或其他标识符的名称,请使用 `Identifier` 作为其类型。例如,以下查询从名为 `uk_price_paid` 的表中返回行:

```sql
SET param_mytablename = "uk_price_paid";
SELECT * FROM {mytablename:Identifier};
```

</details>

:::note
查询参数不是可以在任意 SQL 查询的任意位置使用的通用文本替换。
它们主要设计用于在 `SELECT` 语句中代替标识符或字面量。
:::


## 函数 {#functions}

函数调用的写法是一个标识符后跟圆括号中的参数列表(参数列表可以为空)。
与标准 SQL 不同的是,即使参数列表为空,圆括号也是必需的。
例如:

```sql
now()
```

函数还包括:

- [常规函数](/sql-reference/functions/overview)。
- [聚合函数](/sql-reference/aggregate-functions)。

某些聚合函数可以包含两个用括号括起来的参数列表。例如:

```sql
quantile (0.9)(x)
```

这些聚合函数称为"参数化"函数,
第一个列表中的参数称为"参数"。

:::note
无参数的聚合函数语法与常规函数相同。
:::


## 运算符 {#operators}

在查询解析过程中,运算符会根据其优先级和结合性转换为相应的函数。

例如,表达式

```text
1 + 2 * 3 + 4
```

会被转换为

```text
plus(plus(1, multiply(2, 3)), 4)`
```


## 数据类型和数据库表引擎 {#data-types-and-database-table-engines}

在 `CREATE` 查询中,数据类型和表引擎的写法与标识符或函数相同。
换句话说,它们可以包含括号中的参数列表,也可以不包含。

更多信息请参阅以下章节:

- [数据类型](/sql-reference/data-types/index.md)
- [表引擎](/engines/table-engines/index.md)
- [CREATE](/sql-reference/statements/create/index.md)。


## 表达式 {#expressions}

表达式可以是以下任意一种:

- 函数
- 标识符
- 字面量
- 运算符的应用
- 括号中的表达式
- 子查询
- 星号

表达式还可以包含[别名](#expression-aliases)。

表达式列表是由逗号分隔的一个或多个表达式。
函数和运算符可以将表达式作为参数。

常量表达式是指其结果在查询分析阶段(即执行之前)就已确定的表达式。
例如,对字面量进行运算的表达式就是常量表达式。


## 表达式别名 {#expression-aliases}

别名是查询中为[表达式](#expressions)定义的用户自定义名称。

```sql
expr AS alias
```

上述语法的各部分说明如下。

| 语法部分 | 描述                                                                                                                                       | 示例                                                                 | 注释                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AS`           | 用于定义别名的关键字。在 `SELECT` 子句中,您可以不使用 `AS` 关键字为表名或列名定义别名。 | `SELECT table_name_alias.column_name FROM table_name table_name_alias`. | 在 [CAST](/sql-reference/functions/type-conversion-functions#cast) 函数中,`AS` 关键字具有不同的含义。请参阅该函数的说明。 |
| `expr`         | ClickHouse 支持的任意表达式。                                                                                                           | `SELECT column_name * 2 AS double FROM some_table`                      |                                                                                                                                                             |
| `alias`        | `expr` 的名称。别名应符合[标识符](#identifiers)语法规范。                                                               | `SELECT "table t".column_name FROM table_name AS "table t"`.            |                                                                                                                                                             |

### 使用说明 {#notes-on-usage}

- 别名在查询或子查询中是全局的,您可以在查询的任意位置为任意表达式定义别名。例如:

```sql
SELECT (1 AS n) + 2, n
```

- 别名在子查询内部和子查询之间不可见。例如,执行以下查询时,ClickHouse 会生成异常 `Unknown identifier: num`:

```sql
SELECT (SELECT sum(b.a) + num FROM b) - a.a AS num FROM a
```

- 如果在子查询的 `SELECT` 子句中为结果列定义了别名,这些列在外层查询中可见。例如:

```sql
SELECT n + m FROM (SELECT 1 AS n, 2 AS m)
```

- 请注意与列名或表名相同的别名。考虑以下示例:

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

在上述示例中,我们声明了包含列 `b` 的表 `t`。
然后,在选择数据时,我们定义了 `sum(b) AS b` 别名。
由于别名是全局的,
ClickHouse 将表达式 `argMax(a, b)` 中的字面量 `b` 替换为表达式 `sum(b)`。
这种替换导致了异常。

:::note
您可以通过将 [prefer_column_name_to_alias](/operations/settings/settings#prefer_column_name_to_alias) 设置为 `1` 来更改此默认行为。
:::


## 星号 {#asterisk}

在 `SELECT` 查询中,星号可以替代表达式。
有关更多信息,请参阅 [SELECT](/sql-reference/statements/select/index.md#asterisk) 章节。
