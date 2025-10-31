---
'description': '其他函数的Documentation'
'sidebar_label': '其他'
'slug': '/sql-reference/functions/other-functions'
'title': '其他函数'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 其他函数
## hostName {#hostname}

返回执行此函数的主机名称。如果该函数在远程服务器（分布式处理）上执行，则返回远程服务器名称。 如果函数在分布式表的上下文中执行，它将生成一个包含与每个分片相关的值的正常列。否则，它产生一个常量值。

**语法**

```sql
hostName()
```

**返回值**

- 主机名称。[String](../data-types/string.md)。

## getMacro {#getMacro}

返回服务器配置的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分中的命名值。

**语法**

```sql
getMacro(name);
```

**参数**

- `name` — 从 `<macros>` 部分检索的宏名称。[String](/sql-reference/data-types/string)。

**返回值**

- 指定宏的值。[String](../data-types/string.md)。

**示例**

以下是服务器配置文件中 `<macros>` 部分的示例：

```xml
<macros>
    <test>Value</test>
</macros>
```

查询：

```sql
SELECT getMacro('test');
```

结果：

```text
┌─getMacro('test')─┐
│ Value            │
└──────────────────┘
```

相同的值可以通过以下方式检索：

```sql
SELECT * FROM system.macros
WHERE macro = 'test';
```

```text
┌─macro─┬─substitution─┐
│ test  │ Value        │
└───────┴──────────────┘
```

## fqdn {#fqdn}

返回 ClickHouse 服务器的完全限定域名。

**语法**

```sql
fqdn();
```

别名：`fullHostName`，`FQDN`。

**返回值**

- 完全限定域名的字符串。[String](../data-types/string.md)。

**示例**

```sql
SELECT FQDN();
```

结果：

```text
┌─FQDN()──────────────────────────┐
│ clickhouse.ru-central1.internal │
└─────────────────────────────────┘
```

## basename {#basename}

提取字符串最后一个斜杠或反斜杠后的尾部。此函数通常用于从路径中提取文件名。

```sql
basename(expr)
```

**参数**

- `expr` — 类型为 [String](../data-types/string.md) 的值。反斜杠必须进行转义。

**返回值**

包含以下内容的字符串：

- 输入字符串最后一个斜杠或反斜杠后的尾部。如果输入字符串以斜杠或反斜杠结束（例如 `/` 或 `c:\`），则该函数返回空字符串。
- 如果没有斜杠或反斜杠，则返回原始字符串。

**示例**

查询：

```sql
SELECT 'some/long/path/to/file' AS a, basename(a)
```

结果：

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

查询：

```sql
SELECT 'some\\long\\path\\to\\file' AS a, basename(a)
```

结果：

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

查询：

```sql
SELECT 'some-file-name' AS a, basename(a)
```

结果：

```text
┌─a──────────────┬─basename('some-file-name')─┐
│ some-file-name │ some-file-name             │
└────────────────┴────────────────────────────┘
```

## visibleWidth {#visiblewidth}

在将值以文本格式（制表符分隔）输出到控制台时，计算近似宽度。 此函数由系统用于实现 [Pretty formats](../../interfaces/formats.md)。

`NULL` 被表示为对应于 `Pretty` 格式的字符串 `NULL`。

**语法**

```sql
visibleWidth(x)
```

**示例**

查询：

```sql
SELECT visibleWidth(NULL)
```

结果：

```text
┌─visibleWidth(NULL)─┐
│                  4 │
└────────────────────┘
```

## toTypeName {#totypename}

返回传递参数的类型名称。

如果传递 `NULL`，该函数返回类型 `Nullable(Nothing)`，对应于 ClickHouse 的内部 `NULL` 表示。

**语法**

```sql
toTypeName(value)
```

**参数**

- `value` — 任意类型的值。

**返回值**

- 输入值的数据类型名称。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT toTypeName(123);
```

结果：

```response
┌─toTypeName(123)─┐
│ UInt8           │
└─────────────────┘
```

## blockSize {#blockSize}

在 ClickHouse 中，查询以 [blocks](/development/architecture#block)（块）处理。此函数返回调用该函数的块的大小（行数）。

**语法**

```sql
blockSize()
```

**示例**

查询：

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (n UInt8) ENGINE = Memory;

INSERT INTO test
SELECT * FROM system.numbers LIMIT 5;

SELECT blockSize()
FROM test;
```

结果：

```response
   ┌─blockSize()─┐
1. │           5 │
2. │           5 │
3. │           5 │
4. │           5 │
5. │           5 │
   └─────────────┘
```

## byteSize {#bytesize}

返回其参数在内存中未压缩的字节大小的估计值。

**语法**

```sql
byteSize(argument [, ...])
```

**参数**

- `argument` — 值。

**返回值**

- 参数在内存中字节大小的估计值。[UInt64](../data-types/int-uint.md)。

**示例**

对于 [String](../data-types/string.md) 参数，该函数返回字符串长度 + 8（长度）。

查询：

```sql
SELECT byteSize('string');
```

结果：

```text
┌─byteSize('string')─┐
│                 15 │
└────────────────────┘
```

查询：

```sql
CREATE TABLE test
(
    `key` Int32,
    `u8` UInt8,
    `u16` UInt16,
    `u32` UInt32,
    `u64` UInt64,
    `i8` Int8,
    `i16` Int16,
    `i32` Int32,
    `i64` Int64,
    `f32` Float32,
    `f64` Float64
)
ENGINE = MergeTree
ORDER BY key;

INSERT INTO test VALUES(1, 8, 16, 32, 64,  -8, -16, -32, -64, 32.32, 64.64);

SELECT key, byteSize(u8) AS `byteSize(UInt8)`, byteSize(u16) AS `byteSize(UInt16)`, byteSize(u32) AS `byteSize(UInt32)`, byteSize(u64) AS `byteSize(UInt64)`, byteSize(i8) AS `byteSize(Int8)`, byteSize(i16) AS `byteSize(Int16)`, byteSize(i32) AS `byteSize(Int32)`, byteSize(i64) AS `byteSize(Int64)`, byteSize(f32) AS `byteSize(Float32)`, byteSize(f64) AS `byteSize(Float64)` FROM test ORDER BY key ASC FORMAT Vertical;
```

结果：

```text
Row 1:
──────
key:               1
byteSize(UInt8):   1
byteSize(UInt16):  2
byteSize(UInt32):  4
byteSize(UInt64):  8
byteSize(Int8):    1
byteSize(Int16):   2
byteSize(Int32):   4
byteSize(Int64):   8
byteSize(Float32): 4
byteSize(Float64): 8
```

如果该函数有多个参数，则函数将累加其字节大小。

查询：

```sql
SELECT byteSize(NULL, 1, 0.3, '');
```

结果：

```text
┌─byteSize(NULL, 1, 0.3, '')─┐
│                         19 │
└────────────────────────────┘
```

## materialize {#materialize}

将常量转换为包含单个值的完整列。完整列和常量在内存中的表示方式不同。 函数通常会为正常和常量参数执行不同的代码，尽管结果通常应该相同。此函数可用于调试此行为。

**语法**

```sql
materialize(x)
```

**参数**

- `x` — 常量。[Constant](overview.md/#constants)。

**返回值**

- 包含单个值 `x` 的列。

**示例**

在下面的示例中，`countMatches` 函数期望第二个参数为常量。 可以使用 `materialize` 函数将常量转换为完整列来调试此行为，验证该函数对非恒定参数抛出错误。

查询：

```sql
SELECT countMatches('foobarfoo', 'foo');
SELECT countMatches('foobarfoo', materialize('foo'));
```

结果：

```response
2
Code: 44. DB::Exception: Received from localhost:9000. DB::Exception: Illegal type of argument #2 'pattern' of function countMatches, expected constant String, got String
```

## ignore {#ignore}

接受任意参数并无条件返回 `0`。 参数仍在内部进行评估，适用于基准测试等目的。

**语法**

```sql
ignore([arg1[, arg2[, ...]])
```

**参数**

- 接受任意类型的任意数量的参数，包括 `NULL`。

**返回值**

- 返回 `0`。

**示例**

查询：

```sql
SELECT ignore(0, 'ClickHouse', NULL);
```

结果：

```response
┌─ignore(0, 'ClickHouse', NULL)─┐
│                             0 │
└───────────────────────────────┘
```

## sleep {#sleep}

用于在查询执行中引入延迟或暂停。主要用于测试和调试目的。

**语法**

```sql
sleep(seconds)
```

**参数**

- `seconds`: [UInt*](../data-types/int-uint.md) 或 [Float](../data-types/float.md) 暂停查询执行的秒数，最长为 3 秒。可以是浮点值，以指定小数秒。

**返回值**

此函数不返回任何值。

**示例**

此函数不返回任何值。然而，如果您使用 `clickhouse client` 运行该函数，您将看到类似于：

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

该查询将在完成前暂停 2 秒。在此期间，将不会返回任何结果，查询将看起来像是挂起或无响应。

**实现细节**

`sleep()` 函数通常不在生产环境中使用，因为它可能会对查询性能和系统响应性产生负面影响。然而，在以下情况下可能会有用：

1. **测试**：在测试或基准测试 ClickHouse 时，您可能希望模拟延迟或引入暂停，以观察系统在某些条件下的行为。
2. **调试**：如果您需要在特定时间点检查系统的状态或查询的执行状态，可以使用 `sleep()` 引入暂停，从而允许您检查或收集相关信息。
3. **模拟**：在某些情况下，您可能希望模拟发生延迟或暂停的现实场景，例如网络延迟或外部系统依赖。

重要的是，明智地使用 `sleep()` 函数，仅在必要时使用，因为它可能会对 ClickHouse 系统的整体性能和响应性产生影响。

## sleepEachRow {#sleepeachrow}

在结果集中对每一行暂停执行查询指定的秒数。

**语法**

```sql
sleepEachRow(seconds)
```

**参数**

- `seconds`: [UInt*](../data-types/int-uint.md) 或 [Float*](../data-types/float.md) 为结果集中的每一行暂停查询执行的秒数，最长为 3 秒。可以是浮点值，以指定小数秒。

**返回值**

此函数返回与接收的输入值相同的值，而不对其进行修改。

**示例**

```sql
SELECT number, sleepEachRow(0.5) FROM system.numbers LIMIT 5;
```

```response
┌─number─┬─sleepEachRow(0.5)─┐
│      0 │                 0 │
│      1 │                 0 │
│      2 │                 0 │
│      3 │                 0 │
│      4 │                 0 │
└────────┴───────────────────┘
```

但是输出将被延迟，每一行之间有 0.5 秒的暂停。

`sleepEachRow()` 函数主要用于测试和调试目的，类似于 `sleep()` 函数。它允许您在处理每一行时模拟延迟或引入暂停，这在以下场景中可能会很有用：

1. **测试**：在测试或基准测试 ClickHouse 在特定条件下的性能时，您可以使用 `sleepEachRow()` 对处理的每一行模拟延迟或引入暂停。
2. **调试**：如果您需要检查系统的状态或每一行处理的查询执行状态，可以使用 `sleepEachRow()` 引入暂停，以便您可以检查或收集相关信息。
3. **模拟**：在某些情况下，您可能希望模拟在处理每一行时发生延迟或暂停的现实场景，例如处理外部系统或网络延迟时。

与 [`sleep()` 函数](#sleep) 一样，重要的是明智地使用 `sleepEachRow()`，并仅在必要时使用，因为它可能会显著影响 ClickHouse 系统的整体性能和响应性，尤其是在处理大型结果集时。

## currentDatabase {#currentdatabase}

返回当前数据库的名称。 在需要指定数据库的 `CREATE TABLE` 查询的表引擎参数中非常有用。

**语法**

```sql
currentDatabase()
```

**返回值**

- 返回当前数据库名称。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT currentDatabase()
```

结果：

```response
┌─currentDatabase()─┐
│ default           │
└───────────────────┘
```

## currentUser {#currentUser}

返回当前用户的名称。在分布式查询的情况下，返回发起查询的用户的名称。

**语法**

```sql
currentUser()
```

别名：`user()`，`USER()`，`current_user()`。别名不区分大小写。

**返回值**

- 当前用户的名称。[String](../data-types/string.md)。
- 在分布式查询中，发起查询的用户的登录名。[String](../data-types/string.md)。

**示例**

```sql
SELECT currentUser();
```

结果：

```text
┌─currentUser()─┐
│ default       │
└───────────────┘
```

## currentSchemas {#currentschemas}

返回一个单元素数组，包含当前数据库模式的名称。

**语法**

```sql
currentSchemas(bool)
```

别名：`current_schemas`。

**参数**

- `bool`: 布尔值。[Bool](../data-types/boolean.md)。

:::note
布尔参数被忽略。它仅存在于兼容性目的，以与 PostgreSQL 中的 [实现](https://www.postgresql.org/docs/7.3/functions-misc.html) 一致。
:::

**返回值**

- 返回一个单元素数组，包含当前数据库的名称。

**示例**

```sql
SELECT currentSchemas(true);
```

结果：

```response
['default']
```

## colorSRGBToOKLCH {#colorsrgbtoOKLCH}

将 **sRGB** 颜色空间中编码的颜色转换为感知均匀的 **OKLCH** 颜色空间。

如果任何输入通道超出 `[0...255]` 或 gamma 值为非正，则行为为实现定义。

:::note
**OKLCH** 是 OKLab 颜色空间的圆柱形版本。 它的三个坐标是 **L**（亮度范围为 `[0...1]`）、**C**（色度 `>= 0`）和 **H**（色相在度数 `[0...360]`）**。  
OKLab/OKLCH 旨在在保持计算简便的同时感知均匀。
:::

**语法**

```sql
colorSRGBToOKLCH(tuple [, gamma])
```

**参数**

- `tuple` - 三个数值 R、G、B，范围为 `[0...255]`。[Tuple](../data-types/tuple.md)。
- `gamma` - 可选数值。用于线性化 sRGB 的指数，通过对每个通道 `x` 应用 `(x / 255)^gamma`。默认为 `2.2`。

**返回值**

- 类型为 `Tuple(Float64, Float64, Float64)` 的 `tuple`（L, C, H）。

**实现细节**

该转换由三个阶段组成： 

1) sRGB 转 Linear sRGB
2) Linear sRGB 转 OKLab
3) OKLab 转 OKLCH。

Gamma 在第一阶段使用，即计算线性 sRGB。 为此，我们对 sRGB 值进行归一化，并将其取为 gamma 的幂。 请注意，由于浮点舍入，这缺少了一些精度。 做出这一设计选择是为了能够快速计算不同 gamma 的值，并且由于差异不会显著改变颜色感知。

两个阶段涉及矩阵乘法和三角函数转换。 有关数学的更多详细信息，请参见关于 OKLab 颜色空间的文章：https://bottosson.github.io/posts/OKLab/

为了在 OKLCH 空间中拥有某些颜色的参考，以及它们与 sRGB 颜色的对应关系，请参见 https://OKLCH.com/

**示例**

```sql
SELECT colorSRGBToOKLCH((128, 64, 32), 2.2) AS lch;
```

结果：

```response
┌─lch─────────────────────────────────────────────────────────┐
│ (0.4436238384931984,0.10442699545678624,45.907345481930236) │
└─────────────────────────────────────────────────────────────┘
```

## colorOKLCHToSRGB {#colorOKLCHtosrgb}

将 **OKLCH** 视觉颜色空间中的颜色转换为熟悉的 **sRGB** 颜色空间。

如果 **L** 超出 `[0...1]`，**C** 为负，或 **H** 超出 `[0...360]`，则结果由实现定义。

:::note
**OKLCH** 是 OKLab 颜色空间的圆柱形版本。 它的三个坐标是 **L**（亮度范围为 `[0...1]`）、**C**（色度 `>= 0`）和 **H**（色相在度数 `[0...360]`）**。
OKLab/OKLCH 旨在在保持计算简便的同时感知均匀。
:::

**语法**

```sql
colorOKLCHToSRGB(tuple [, gamma])
```

**参数**

- `tuple` - 三个数值 **L**、**C**、**H**，以元组的形式呈现，其中 **L** 在范围 `[0...1]` 内， **C** `>= 0`，且 **H** 在范围 `[0...360]` 内。[Tuple](../data-types/tuple.md)。
- `gamma` - 可选数值。用于将线性 sRGB 变回 sRGB 的指数，通过对每个通道 `x` 应用 `(x ^ (1 / gamma)) * 255`。默认为 `2.2`。

**返回值**

- 类型为 `Tuple(Float64, Float64, Float64)` 的 `tuple`（R, G, B）。

:::note
此函数返回浮点数，而不是整数值，以避免强制舍入。用户可以自行进行舍入。
:::

**实现细节**

该转换是 `colorSRGBToOKLCH` 的反向：

1) OKLCH 转 OKLab。
2) OKLab 转 Linear sRGB。
3) Linear sRGB 转 sRGB。

第二个参数 gamma 在最后阶段使用。 注意，在计算线性 sRGB 之前，所有三个通道都会在范围 `[0...1]` 剪裁，然后在求 `1 / gamma` 的幂。 若 `gamma` 为 `0`，则 `1 / gamma` 被改为 `1'000'000`。因此，无论输入如何，我们通常都会返回范围在 `[0...255]` 的浮点数。

与 `colorSRGBToOKLCH` 一样，其他两个阶段分别涉及三角函数转换和矩阵乘法。 有关数学的更多详细信息，请参见关于 OKLab 颜色空间的文章：https://bottosson.github.io/posts/oklab/

为了在 OKLCH 空间中拥有某些颜色的参考，以及它们与 sRGB 颜色的对应关系，请参见：https://oklch.com/

**示例**

```sql
SELECT colorOKLCHToSRGB((0.4466, 0.0991, 45.44), 2.2) AS rgb
WITH colorOKLCHToSRGB((0.7, 0.1, 54)) as t SELECT tuple(toUInt8(t.1), toUInt8(t.2), toUInt8(t.3)) AS RGB

```

结果：

```response
┌─rgb──────────────────────────────────────────────────────┐
│ (127.03349738778945,66.06672044472008,37.11802592155851) │
└──────────────────────────────────────────────────────────┘

┌─RGB──────────┐
│ (205,139,97) │
└──────────────┘
```

## isConstant {#isconstant}

返回参数是否为常量表达式。

常量表达式是在查询分析期间即知道结果的表达式，即在执行之前。例如，涉及 [literals](../../sql-reference/syntax.md#literals) 的表达式是常量表达式。

此函数主要用于开发、调试和演示。

**语法**

```sql
isConstant(x)
```

**参数**

- `x` — 要检查的表达式。

**返回值**

- 如果 `x` 是常量，则返回 `1`。[UInt8](../data-types/int-uint.md)。
- 如果 `x` 不是常量，则返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT isConstant(x + 1) FROM (SELECT 43 AS x)
```

结果：

```text
┌─isConstant(plus(x, 1))─┐
│                      1 │
└────────────────────────┘
```

查询：

```sql
WITH 3.14 AS pi SELECT isConstant(cos(pi))
```

结果：

```text
┌─isConstant(cos(pi))─┐
│                   1 │
└─────────────────────┘
```

查询：

```sql
SELECT isConstant(number) FROM numbers(1)
```

结果：

```text
┌─isConstant(number)─┐
│                  0 │
└────────────────────┘
```

## hasColumnInTable {#hascolumnintable}

给定数据库名称、表名称和列名称作为常量字符串，如果给定列存在，则返回 1，否则返回 0。

**语法**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**参数**

- `database` : 数据库的名称。[String literal](/sql-reference/syntax#string)
- `table` : 表的名称。[String literal](/sql-reference/syntax#string)
- `column` : 列的名称。[String literal](/sql-reference/syntax#string)
- `hostname` : 要执行检查的远程服务器名称。[String literal](/sql-reference/syntax#string)
- `username` : 远程服务器的用户名。[String literal](/sql-reference/syntax#string)
- `password` : 远程服务器的密码。[String literal](/sql-reference/syntax#string)

**返回值**

- 如果给定列存在，则返回 `1`。
- 否则返回 `0`。

**实现细节**

对于嵌套数据结构中的元素，函数检查列的存在性。对于嵌套数据结构本身，该函数返回 0。

**示例**

查询：

```sql
SELECT hasColumnInTable('system','metrics','metric')
```

```response
1
```

```sql
SELECT hasColumnInTable('system','metrics','non-existing_column')
```

```response
0
```

## hasThreadFuzzer {#hasthreadfuzzer}

返回线程模糊器是否有效。它可以在测试中使用，以防止运行时间过长。

**语法**

```sql
hasThreadFuzzer();
```

## bar {#bar}

构建条形图。

`bar(x, min, max, width)` 绘制宽度与 `(x - min)` 成正比且在 `x = max` 时等于 `width` 个字符的带。

**参数**

- `x` — 要显示的大小。
- `min, max` — 整数常量。值必须适合 `Int64`。
- `width` — 常量，正整数，可以是分数。

该带的绘制精度为符号的八分之一。

示例：

```sql
SELECT
    toHour(EventTime) AS h,
    count() AS c,
    bar(c, 0, 600000, 20) AS bar
FROM test.hits
GROUP BY h
ORDER BY h ASC
```

```text
┌──h─┬──────c─┬─bar────────────────┐
│  0 │ 292907 │ █████████▋         │
│  1 │ 180563 │ ██████             │
│  2 │ 114861 │ ███▋               │
│  3 │  85069 │ ██▋                │
│  4 │  68543 │ ██▎                │
│  5 │  78116 │ ██▌                │
│  6 │ 113474 │ ███▋               │
│  7 │ 170678 │ █████▋             │
│  8 │ 278380 │ █████████▎         │
│  9 │ 391053 │ █████████████      │
│ 10 │ 457681 │ ███████████████▎   │
│ 11 │ 493667 │ ████████████████▍  │
│ 12 │ 509641 │ ████████████████▊  │
│ 13 │ 522947 │ █████████████████▍ │
│ 14 │ 539954 │ █████████████████▊ │
│ 15 │ 528460 │ █████████████████▌ │
│ 16 │ 539201 │ █████████████████▊ │
│ 17 │ 523539 │ █████████████████▍ │
│ 18 │ 506467 │ ████████████████▊  │
│ 19 │ 520915 │ █████████████████▎ │
│ 20 │ 521665 │ █████████████████▍ │
│ 21 │ 542078 │ ██████████████████ │
│ 22 │ 493642 │ ████████████████▍  │
│ 23 │ 400397 │ █████████████▎     │
└────┴────────┴────────────────────┘
```

## transform {#transform}

根据某些元素到其他元素的明确映射转换值。 该函数有两种变体：
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – 要转换的内容。

`array_from` – 用于转换的常量值数组。

`array_to` – 用于将 `from` 中的值转换到的常量值数组。

`default` – 如果 `x` 不等于 `from` 中的任何值，则使用的值。

`array_from` 和 `array_to` 必须具有相同数量的元素。

签名：

对于 `x` 等于 `array_from` 中一个元素的情况，函数返回 `array_to` 中相应的元素，即在同一数组索引处的元素。否则，它返回 `default`。如果在 `array_from` 中存在多个匹配元素，则返回对应于其中第一个的元素。

`transform(T, Array(T), Array(U), U) -> U`

`T` 和 `U` 可以是数字、字符串或日期或日期时间类型。相同的字母（T或U）意味着类型必须是相互兼容的，而不一定相等。 例如，第一个参数可以为 `Int64` 类型，而第二个参数可以为 `Array(UInt16)` 类型。

示例：

```sql
SELECT
    transform(SearchEngineID, [2, 3], ['Yandex', 'Google'], 'Other') AS title,
    count() AS c
FROM test.hits
WHERE SearchEngineID != 0
GROUP BY title
ORDER BY c DESC
```

```text
┌─title─────┬──────c─┐
│ Yandex    │ 498635 │
│ Google    │ 229872 │
│ Other     │ 104472 │
└───────────┴────────┘
```

### transform(x, array_from, array_to) {#transformx-array_from-array_to}

与其他变体类似，但没有 `default` 参数。如果找不到匹配，返回 `x`。

示例：

```sql
SELECT
    transform(domain(Referer), ['yandex.ru', 'google.ru', 'vkontakte.ru'], ['www.yandex', 'example.com', 'vk.com']) AS s,
    count() AS c
FROM test.hits
GROUP BY domain(Referer)
ORDER BY count() DESC
LIMIT 10
```

```text
┌─s──────────────┬───────c─┐
│                │ 2906259 │
│ www.yandex     │  867767 │
│ ███████.ru     │  313599 │
│ mail.yandex.ru │  107147 │
│ ██████.ru      │  100355 │
│ █████████.ru   │   65040 │
│ news.yandex.ru │   64515 │
│ ██████.net     │   59141 │
│ example.com    │   57316 │
└────────────────┴─────────┘
```

## formatReadableDecimalSize {#formatreadabledecimalsize}

给定一个大小（字节数），此函数返回可读的四舍五入大小，带有后缀（KB、MB 等）作为字符串。

此函数的反操作为 [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero) 和 [parseReadableSizeOrNull](#parsereadablesizeornull)。

**语法**

```sql
formatReadableDecimalSize(x)
```

**示例**

查询：

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableDecimalSize(filesize_bytes) AS filesize
```

结果：

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.02 KB   │
│        1048576 │ 1.05 MB   │
│      192851925 │ 192.85 MB │
└────────────────┴────────────┘
```

## formatReadableSize {#formatreadablesize}

给定一个大小（字节数），此函数返回可读的四舍五入大小，带有后缀（KiB、MiB 等）作为字符串。

此函数的反操作为 [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero) 和 [parseReadableSizeOrNull](#parsereadablesizeornull)。

**语法**

```sql
formatReadableSize(x)
```

别名：`FORMAT_BYTES`。

:::note
此函数接受任何数值类型作为输入，但在内部将其强制转换为 Float64。大型值的结果可能不尽如人意。
:::

**示例**

查询：

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableSize(filesize_bytes) AS filesize
```

结果：

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.00 KiB   │
│        1048576 │ 1.00 MiB   │
│      192851925 │ 183.92 MiB │
└────────────────┴────────────┘
```

## formatReadableQuantity {#formatreadablequantity}

给定一个数字，该函数返回带有后缀（千、百万、十亿等）的四舍五入数字作为字符串。

**语法**

```sql
formatReadableQuantity(x)
```

:::note
此函数接受任何数值类型作为输入，但在内部将其强制转换为 Float64。大型值的结果可能不尽如人意。
:::

**示例**

查询：

```sql
SELECT
    arrayJoin([1024, 1234 * 1000, (4567 * 1000) * 1000, 98765432101234]) AS number,
    formatReadableQuantity(number) AS number_for_humans
```

结果：

```text
┌─────────number─┬─number_for_humans─┐
│           1024 │ 1.02 thousand     │
│        1234000 │ 1.23 million      │
│     4567000000 │ 4.57 billion      │
│ 98765432101234 │ 98.77 trillion    │
└────────────────┴───────────────────┘
```

## formatReadableTimeDelta {#formatreadabletimedelta}

给定一个以秒为单位的时间间隔（增量），此函数返回以年/月/天/小时/分钟/秒/毫秒/微秒/纳秒表示的时间增量作为字符串。

**语法**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
此函数接受任何数值类型作为输入，但在内部将其强制转换为 Float64。大型值的结果可能不尽如人意。
:::

**参数**

- `column` — 带有数值时间增量的列。
- `maximum_unit` — 可选。显示的最大单位。
  - 可接受值：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`months`、`years`。
  - 默认值：`years`。
- `minimum_unit` — 可选。显示的最小单位。所有更小的单位将被截断。
  - 可接受值：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`months`、`years`。
  - 如果显式指定的值大于 `maximum_unit`，将抛出异常。
  - 默认值：如果 `maximum_unit` 为 `seconds` 或更大，则为 `seconds`；否则为 `nanoseconds`。

**示例**

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed) AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 3 hours, 25 minutes and 45 seconds                              │
│  432546534 │ 13 years, 8 months, 17 days, 7 hours, 48 minutes and 54 seconds │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes') AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 205 minutes and 45 seconds                                      │
│  432546534 │ 7209108 minutes and 54 seconds                                  │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534.00000006]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes', 'nanoseconds') AS time_delta
```

```text
┌────────────elapsed─┬─time_delta─────────────────────────────────────┐
│                100 │ 1 minute and 40 seconds                        │
│              12345 │ 205 minutes and 45 seconds                     │
│ 432546534.00000006 │ 7209108 minutes, 54 seconds and 60 nanoseconds │
└────────────────────┴────────────────────────────────────────────────┘
```

## parseReadableSize {#parsereadablesize}

给定一个包含字节大小的字符串和 `B`、`KiB`、`KB`、`MiB`、`MB` 等作为单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。  
如果该函数无法解析输入值，将抛出异常。

此函数的反操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSize(x)
```

**参数**

- `x` : 带有 ISO/IEC 80000-13 或十进制字节单位的可读大小 ([String](../../sql-reference/data-types/string.md))。

**返回值**

- 字节数，四舍五入到最接近的整数 ([UInt64](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB']) AS readable_sizes,  
    parseReadableSize(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
└────────────────┴─────────┘
```

## parseReadableSizeOrNull {#parsereadablesizeornull}

给定一个包含字节大小的字符串和 `B`、`KiB`、`KB`、`MiB`、`MB` 等作为单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。  
如果该函数无法解析输入值，则返回 `NULL`。

此函数的反操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSizeOrNull(x)
```

**参数**

- `x` : 带有 ISO/IEC 80000-13 或十进制字节单位的可读大小 ([String](../../sql-reference/data-types/string.md))。

**返回值**

- 字节数，四舍五入到最接近的整数，或者如果无法解析输入，则为 NULL (Nullable([UInt64](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrNull(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │    ᴺᵁᴸᴸ │
└────────────────┴─────────┘
```

## parseReadableSizeOrZero {#parsereadablesizeorzero}

给定一个包含字节大小的字符串和 `B`、`KiB`、`KB`、`MiB`、`MB` 等作为单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。如果该函数无法解析输入值，则返回 `0`。

此函数的反操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSizeOrZero(x)
```

**参数**

- `x` : 带有 ISO/IEC 80000-13 或十进制字节单位的可读大小 ([String](../../sql-reference/data-types/string.md))。

**返回值**

- 字节数，四舍五入到最接近的整数，或者如果无法解析输入，则为 0 ([UInt64](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrZero(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │       0 │
└────────────────┴─────────┘
```

## parseTimeDelta {#parsetimedelta}

解析一系列数字，后跟类似于时间单位的内容。

**语法**

```sql
parseTimeDelta(timestr)
```

**参数**

- `timestr` — 一系列数字，后跟类似于时间单位的内容。

**返回值**

- 一个浮点数，表示秒数。

**示例**

```sql
SELECT parseTimeDelta('11s+22min')
```

```text
┌─parseTimeDelta('11s+22min')─┐
│                        1331 │
└─────────────────────────────┘
```

```sql
SELECT parseTimeDelta('1yr2mo')
```

```text
┌─parseTimeDelta('1yr2mo')─┐
│                 36806400 │
└──────────────────────────┘
```

## least {#least}

返回一个或多个输入参数中最小的参数。 `NULL` 参数被忽略。

**语法**

```sql
least(a, b)
```

:::note
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果一个参数为 `NULL` 则返回 `NULL`。要保留先前的行为，请将设置 `least_greatest_legacy_null_behavior`（默认值：`false`）设置为 `true`。 
:::

## greatest {#greatest}

返回一个或多个输入参数中最大的参数。 `NULL` 参数被忽略。

**语法**

```sql
greatest(a, b)
```

:::note
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果一个参数为 `NULL` 则返回 `NULL`。要保留先前的行为，请将设置 `least_greatest_legacy_null_behavior`（默认值：`false`）设置为 `true`。 
:::

## uptime {#uptime}

返回服务器的运行时间（秒）。 如果在分布式表的上下文中执行，则此函数生成一个包含与每个分片相关值的正常列。否则，它生成一个常量值。

**语法**

```sql
uptime()
```

**返回值**

- 时间值（秒数）。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT uptime() AS Uptime;
```

结果：

```response
┌─Uptime─┐
│  55867 │
└────────┘
```

## version {#version}

返回 ClickHouse 当前版本，以字符串形式表示，格式如下：

- 主版本
- 次版本
- 修订版本
- 上一个稳定版本以来的提交次数。

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

如果在分布式表的上下文中执行，则此函数生成一个包含与每个分片相关值的正常列。否则，它生成一个常量值。

**语法**

```sql
version()
```

**参数**

无。

**返回值**

- ClickHouse 的当前版本。[String](../data-types/string.md)。

**实现细节**

无。

**示例**

查询：

```sql
SELECT version()
```

**结果**：

```response
┌─version()─┐
│ 24.2.1.1  │
└───────────┘
```

## buildId {#buildid}

返回为正在运行的 ClickHouse 服务器二进制文件生成的构建 ID。 如果在分布式表的上下文中执行，则此函数生成一个包含与每个分片相关值的正常列。否则，它生成一个常量值。

**语法**

```sql
buildId()
```

## blockNumber {#blocknumber}

返回包含行的 [block](../../development/architecture.md#block) 的单调递增序列号。 返回的块编号在最佳努力基础上进行更新，即可能并不完全准确。

**语法**

```sql
blockNumber()
```

**返回值**

- 行所在数据块的序列号。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT blockNumber()
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 10
) SETTINGS max_block_size = 2
```

结果：

```response
┌─blockNumber()─┐
│             7 │
│             7 │
└───────────────┘
┌─blockNumber()─┐
│             8 │
│             8 │
└───────────────┘
┌─blockNumber()─┐
│             9 │
│             9 │
└───────────────┘
┌─blockNumber()─┐
│            10 │
│            10 │
└───────────────┘
┌─blockNumber()─┐
│            11 │
│            11 │
└───────────────┘
```

## rowNumberInBlock {#rowNumberInBlock}

返回 `rowNumberInBlock` 处理的每个 [block](../../development/architecture.md#block) 的当前行号。返回的编号在每个块中从 0 开始。

**语法**

```sql
rowNumberInBlock()
```

**返回值**

- 从 0 开始的数据块中的行的序号。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT rowNumberInBlock()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
) SETTINGS max_block_size = 2
```

结果：

```response
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
```

## rowNumberInAllBlocks {#rownumberinallblocks}

返回 `rowNumberInAllBlocks` 处理的每一行的唯一行号。返回的编号从 0 开始。

**语法**

```sql
rowNumberInAllBlocks()
```

**返回值**

- 从 0 开始的数据块中的行的序号。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT rowNumberInAllBlocks()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
)
SETTINGS max_block_size = 2
```

结果：

```response
┌─rowNumberInAllBlocks()─┐
│                      0 │
│                      1 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      4 │
│                      5 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      2 │
│                      3 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      6 │
│                      7 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      8 │
│                      9 │
└────────────────────────┘
```

## normalizeQuery {#normalizequery}

用占位符 `?` 替换字面值、字面值序列和复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）。

**语法**

```sql
normalizeQuery(x)
```

**参数**

- `x` — 字符序列。[String](../data-types/string.md)。

**返回值**

- 带有占位符的字符序列。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT normalizeQuery('[1, 2, 3, x]') AS query;
```

结果：

```result
┌─query────┐
│ [?.., x] │
└──────────┘
```

## normalizeQueryKeepNames {#normalizequerykeepnames}

用占位符 `?` 替换字面值和字面值序列，但不替换复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）。这有助于更好地分析复杂查询日志。

**语法**

```sql
normalizeQueryKeepNames(x)
```

**参数**

- `x` — 字符序列。[String](../data-types/string.md)。

**返回值**

- 带有占位符的字符序列。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT normalizeQuery('SELECT 1 AS aComplexName123'), normalizeQueryKeepNames('SELECT 1 AS aComplexName123');
```

结果：

```result
┌─normalizeQuery('SELECT 1 AS aComplexName123')─┬─normalizeQueryKeepNames('SELECT 1 AS aComplexName123')─┐
│ SELECT ? AS `?`                               │ SELECT ? AS aComplexName123                            │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

## normalizedQueryHash {#normalizedqueryhash}

返回不带字面值的相似查询的相同 64 位哈希值。 有助于分析查询日志。

**语法**

```sql
normalizedQueryHash(x)
```

**参数**

- `x` — 字符序列。[String](../data-types/string.md)。

**返回值**

- 哈希值。[UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz`') != normalizedQueryHash('SELECT 1 AS `abc`') AS res;
```

结果：

```result
┌─res─┐
│   1 │
└─────┘
```

## normalizedQueryHashKeepNames {#normalizedqueryhashkeepnames}

与 [normalizedQueryHash](#normalizedqueryhash) 类似，它返回不带字面值的相似查询的相同 64 位哈希值，但在哈希之前不将复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）替换为占位符。 有助于分析查询日志。

**语法**

```sql
normalizedQueryHashKeepNames(x)
```

**参数**

- `x` — 字符序列。[String](../data-types/string.md)。

**返回值**

- 哈希值。[UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz123`') != normalizedQueryHash('SELECT 1 AS `abc123`') AS normalizedQueryHash;
SELECT normalizedQueryHashKeepNames('SELECT 1 AS `xyz123`') != normalizedQueryHashKeepNames('SELECT 1 AS `abc123`') AS normalizedQueryHashKeepNames;
```

结果：

```result
┌─normalizedQueryHash─┐
│                   0 │
└─────────────────────┘
┌─normalizedQueryHashKeepNames─┐
│                            1 │
└──────────────────────────────┘
```
## neighbor {#neighbor}

<DeprecatedBadge/>

窗口函数提供对给定列的当前行前后指定偏移量的行的访问。

**语法**

```sql
neighbor(column, offset[, default_value])
```

该函数的结果取决于受影响的数据块和数据在块中的顺序。

:::note
仅返回当前处理的数据块内的邻近值。
由于这种容易出错的行为，该函数已被弃用，请使用适当的窗口函数。
:::

在计算 `neighbor()` 时，行的顺序可能与返回给用户的行的顺序不同。
为防止这种情况，您可以创建带有 [ORDER BY](../../sql-reference/statements/select/order-by.md) 的子查询，并在子查询之外调用该函数。

**参数**

- `column` — 列名或标量表达式。
- `offset` — 在 `column` 中查找当前行之前或之前的行的数量。 [Int64](../data-types/int-uint.md)。
- `default_value` — 可选。如果偏移超出块边界，则返回该值。受影响的数据块的数据类型。

**返回值**

- 如果 `offset` 不超出块边界，返回与当前行相距 `offset` 的 `column` 的值。
- 如果 `offset` 超出块边界，则返回 `column` 的默认值或 `default_value`（如果给定）。

:::note
返回类型将是受影响的数据块类型或默认值类型。
:::

**示例**

查询：

```sql
SELECT number, neighbor(number, 2) FROM system.numbers LIMIT 10;
```

结果：

```text
┌─number─┬─neighbor(number, 2)─┐
│      0 │                   2 │
│      1 │                   3 │
│      2 │                   4 │
│      3 │                   5 │
│      4 │                   6 │
│      5 │                   7 │
│      6 │                   8 │
│      7 │                   9 │
│      8 │                   0 │
│      9 │                   0 │
└────────┴─────────────────────┘
```

查询：

```sql
SELECT number, neighbor(number, 2, 999) FROM system.numbers LIMIT 10;
```

结果：

```text
┌─number─┬─neighbor(number, 2, 999)─┐
│      0 │                        2 │
│      1 │                        3 │
│      2 │                        4 │
│      3 │                        5 │
│      4 │                        6 │
│      5 │                        7 │
│      6 │                        8 │
│      7 │                        9 │
│      8 │                      999 │
│      9 │                      999 │
└────────┴──────────────────────────┘
```

此函数可用于计算同比指标值：

查询：

```sql
WITH toDate('2018-01-01') AS start_date
SELECT
    toStartOfMonth(start_date + (number * 32)) AS month,
    toInt32(month) % 100 AS money,
    neighbor(money, -12) AS prev_year,
    round(prev_year / money, 2) AS year_over_year
FROM numbers(16)
```

结果：

```text
┌──────month─┬─money─┬─prev_year─┬─year_over_year─┐
│ 2018-01-01 │    32 │         0 │              0 │
│ 2018-02-01 │    63 │         0 │              0 │
│ 2018-03-01 │    91 │         0 │              0 │
│ 2018-04-01 │    22 │         0 │              0 │
│ 2018-05-01 │    52 │         0 │              0 │
│ 2018-06-01 │    83 │         0 │              0 │
│ 2018-07-01 │    13 │         0 │              0 │
│ 2018-08-01 │    44 │         0 │              0 │
│ 2018-09-01 │    75 │         0 │              0 │
│ 2018-10-01 │     5 │         0 │              0 │
│ 2018-11-01 │    36 │         0 │              0 │
│ 2018-12-01 │    66 │         0 │              0 │
│ 2019-01-01 │    97 │        32 │           0.33 │
│ 2019-02-01 │    28 │        63 │           2.25 │
│ 2019-03-01 │    56 │        91 │           1.62 │
│ 2019-04-01 │    87 │        22 │           0.25 │
└────────────┴───────┴───────────┴────────────────┘
```
## runningDifference {#runningDifference}

计算数据块中两行连续行值之间的差。对于第一行返回 0，对于随后的行返回与前一行的差。

:::note
仅返回当前处理的数据块内的差。
由于这种容易出错的行为，该函数已被弃用，请使用适当的窗口函数。
:::

该函数的结果取决于受影响的数据块和数据在块中的顺序。

在计算 `runningDifference()` 时，行的顺序可能与返回给用户的行的顺序不同。
为防止这种情况，您可以创建带有 [ORDER BY](../../sql-reference/statements/select/order-by.md) 的子查询，并在子查询之外调用该函数。

**语法**

```sql
runningDifference(x)
```

**示例**

查询：

```sql
SELECT
    EventID,
    EventTime,
    runningDifference(EventTime) AS delta
FROM
(
    SELECT
        EventID,
        EventTime
    FROM events
    WHERE EventDate = '2016-11-24'
    ORDER BY EventTime ASC
    LIMIT 5
)
```

结果：

```text
┌─EventID─┬───────────EventTime─┬─delta─┐
│    1106 │ 2016-11-24 00:00:04 │     0 │
│    1107 │ 2016-11-24 00:00:05 │     1 │
│    1108 │ 2016-11-24 00:00:05 │     0 │
│    1109 │ 2016-11-24 00:00:09 │     4 │
│    1110 │ 2016-11-24 00:00:10 │     1 │
└─────────┴─────────────────────┴───────┘
```

请注意，块大小会影响结果。`runningDifference` 的内部状态会在每个新块中重置。

查询：

```sql
SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

结果：

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
┌─number─┬─diff─┐
│  65536 │    0 │
└────────┴──────┘
```

查询：

```sql
set max_block_size=100000 -- default value is 65536!

SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

结果：

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
```
## runningDifferenceStartingWithFirstValue {#runningdifferencestartingwithfirstvalue}

:::note
此函数已弃用（请参见 `runningDifference` 的注释）。
:::

与 [runningDifference](/sql-reference/functions/other-functions#runningDifference) 相同，但返回第一行的值作为第一行的值。
## runningConcurrency {#runningconcurrency}

计算并发事件的数量。每个事件都有一个开始时间和结束时间。开始时间包含在事件中，而结束时间则不包含。具有开始时间和结束时间的列必须具有相同的数据类型。
该函数计算每个事件开始时间的活动（并发）事件的总数。

:::tip
事件必须按升序排列的开始时间。如果不满足此要求，函数会抛出异常。每个数据块都单独处理。如果来自不同数据块的事件重叠，则无法正确处理。
:::

**语法**

```sql
runningConcurrency(start, end)
```

**参数**

- `start` — 事件的开始时间的列。 [Date](../data-types/date.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `end` — 事件的结束时间的列。 [Date](../data-types/date.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 每个事件开始时间的并发事件数量。 [UInt32](../data-types/int-uint.md)

**示例**

考虑以下表：

```text
┌──────start─┬────────end─┐
│ 2021-03-03 │ 2021-03-11 │
│ 2021-03-06 │ 2021-03-12 │
│ 2021-03-07 │ 2021-03-08 │
│ 2021-03-11 │ 2021-03-12 │
└────────────┴────────────┘
```

查询：

```sql
SELECT start, runningConcurrency(start, end) FROM example_table;
```

结果：

```text
┌──────start─┬─runningConcurrency(start, end)─┐
│ 2021-03-03 │                              1 │
│ 2021-03-06 │                              2 │
│ 2021-03-07 │                              3 │
│ 2021-03-11 │                              2 │
└────────────┴────────────────────────────────┘
```
## MACNumToString {#macnumtostring}

将 UInt64 数字解释为大端格式的 MAC 地址。以格式 AA:BB:CC:DD:EE:FF（以冒号分隔的十六进制数字）作为字符串返回相应的 MAC 地址。

**语法**

```sql
MACNumToString(num)
```
## MACStringToNum {#macstringtonum}

与 MACNumToString 相反的函数。如果 MAC 地址格式无效，则返回 0。

**语法**

```sql
MACStringToNum(s)
```
## MACStringToOUI {#macstringtooui}

给定格式为 AA:BB:CC:DD:EE:FF（以冒号分隔的十六进制数字）的 MAC 地址，返回前三区段作为 UInt64 数字。如果 MAC 地址格式无效，则返回 0。

**语法**

```sql
MACStringToOUI(s)
```
## getSizeOfEnumType {#getsizeofenumtype}

返回 [Enum](../data-types/enum.md) 中的字段数量。如果该类型不是 `Enum`，则抛出异常。

**语法**

```sql
getSizeOfEnumType(value)
```

**参数：**

- `value` — 类型为 `Enum` 的值。

**返回值**

- 输入值为 `Enum` 的字段数量。

**示例**

```sql
SELECT getSizeOfEnumType( CAST('a' AS Enum8('a' = 1, 'b' = 2) ) ) AS x
```

```text
┌─x─┐
│ 2 │
└───┘
```
## blockSerializedSize {#blockserializedsize}

返回磁盘上的大小，不考虑压缩。

```sql
blockSerializedSize(value[, value[, ...]])
```

**参数**

- `value` — 任何值。

**返回值**

- 将写入磁盘的值块的字节数（未压缩）。

**示例**

查询：

```sql
SELECT blockSerializedSize(maxState(1)) AS x
```

结果：

```text
┌─x─┐
│ 2 │
└───┘
```
## toColumnTypeName {#tocolumntypename}

返回表示该值的数据类型的内部名称。

**语法**

```sql
toColumnTypeName(value)
```

**参数：**

- `value` — 任何类型的值。

**返回值**

- 用于表示 `value` 的内部数据类型名称。

**示例**

`toTypeName` 和 `toColumnTypeName` 之间的区别：

```sql
SELECT toTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

结果：

```text
┌─toTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime                                            │
└─────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT toColumnTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

结果：

```text
┌─toColumnTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ Const(UInt32)                                             │
└───────────────────────────────────────────────────────────┘
```

示例显示 `DateTime` 数据类型在内部存储为 `Const(UInt32)`。
## dumpColumnStructure {#dumpcolumnstructure}

输出 RAM 中数据结构的详细描述。

```sql
dumpColumnStructure(value)
```

**参数：**

- `value` — 任何类型的值。

**返回值**

- 用于表示 `value` 的列结构的描述。

**示例**

```sql
SELECT dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))
```

```text
┌─dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime, Const(size = 1, UInt32(size = 1))                  │
└──────────────────────────────────────────────────────────────┘
```
## defaultValueOfArgumentType {#defaultvalueofargumenttype}

返回给定数据类型的默认值。

不包括用户设置的自定义列的默认值。

**语法**

```sql
defaultValueOfArgumentType(expression)
```

**参数：**

- `expression` — 任意类型的值或结果为任意类型值的表达式。

**返回值**

- 数字的默认值为 `0`。
- 字符串的默认值为空字符串。
- 对于 [Nullable](../data-types/nullable.md) 的返回值为 `ᴺᵁᴸᴸ`。

**示例**

查询：

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Int8) )
```

结果：

```text
┌─defaultValueOfArgumentType(CAST(1, 'Int8'))─┐
│                                           0 │
└─────────────────────────────────────────────┘
```

查询：

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Nullable(Int8) ) )
```

结果：

```text
┌─defaultValueOfArgumentType(CAST(1, 'Nullable(Int8)'))─┐
│                                                  ᴺᵁᴸᴸ │
└───────────────────────────────────────────────────────┘
```
## defaultValueOfTypeName {#defaultvalueoftypename}

返回给定类型名称的默认值。

不包括用户设置的自定义列的默认值。

```sql
defaultValueOfTypeName(type)
```

**参数：**

- `type` — 表示类型名称的字符串。

**返回值**

- 数字的默认值为 `0`。
- 字符串的默认值为空字符串。
- 对于 [Nullable](../data-types/nullable.md) 的返回值为 `ᴺᵁᴸᴸ`。

**示例**

查询：

```sql
SELECT defaultValueOfTypeName('Int8')
```

结果：

```text
┌─defaultValueOfTypeName('Int8')─┐
│                              0 │
└────────────────────────────────┘
```

查询：

```sql
SELECT defaultValueOfTypeName('Nullable(Int8)')
```

结果：

```text
┌─defaultValueOfTypeName('Nullable(Int8)')─┐
│                                     ᴺᵁᴸᴸ │
└──────────────────────────────────────────┘
```
## indexHint {#indexhint}

此函数用于调试和内省。它忽略其参数并始终返回 1。参数不会被求值。

但是在索引分析期间，该函数的参数假设不被 `indexHint` 包裹。这使得可以通过相应的条件在索引范围内选择数据，但不再通过此条件进一步过滤。在 ClickHouse 中，索引是稀疏的，使用 `indexHint` 将产生比直接指定相同条件更多的数据。

**语法**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**返回值**

- `1`。 [Uint8](../data-types/int-uint.md)。

**示例**

以下是来自表 [ontime](../../getting-started/example-datasets/ontime.md) 的测试数据示例。

表：

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

该表针对字段 `(FlightDate, (Year, FlightDate))` 创建索引。

创建一个不使用索引的查询：

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouse 处理了整个表（`处理了 4.28 百万行`）。

结果：

```text
┌──────────k─┬─count()─┐
│ 2017-01-01 │   13970 │
│ 2017-01-02 │   15882 │
........................
│ 2017-09-28 │   16411 │
│ 2017-09-29 │   16384 │
│ 2017-09-30 │   12520 │
└────────────┴─────────┘
```

要应用索引，选择一个特定日期：

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

ClickHouse 现在使用索引处理了显著更少的行（`处理了 32.74 千行`）。

结果：

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

现在将表达式 `k = '2017-09-15'` 包裹在函数 `indexHint` 中：

查询：

```sql
SELECT
    FlightDate AS k,
    count()
FROM ontime
WHERE indexHint(k = '2017-09-15')
GROUP BY k
ORDER BY k ASC
```

ClickHouse 以与之前相同的方式使用索引（`处理了 32.74 千行`）。
在生成结果时未使用表达式 `k = '2017-09-15'`。
在示例中，`indexHint` 函数允许查看相邻日期。

结果：

```text
┌──────────k─┬─count()─┐
│ 2017-09-14 │    7071 │
│ 2017-09-15 │   16428 │
│ 2017-09-16 │    1077 │
│ 2017-09-30 │    8167 │
└────────────┴─────────┘
```
## replicate {#replicate}

创建一个仅包含单一值的数组。

:::note
此函数用于 [arrayJoin](/sql-reference/functions/array-join) 的内部实现。
:::

**语法**

```sql
replicate(x, arr)
```

**参数**

- `x` — 填充结果数组的值。
- `arr` — 一个数组。 [Array](../data-types/array.md)。

**返回值**

一个与 `arr` 相同长度的数组，填充值 `x`。 [Array](../data-types/array.md)。

**示例**

查询：

```sql
SELECT replicate(1, ['a', 'b', 'c']);
```

结果：

```text
┌─replicate(1, ['a', 'b', 'c'])─┐
│ [1,1,1]                       │
└───────────────────────────────┘
```
## revision {#revision}

返回当前 ClickHouse [server revision](../../operations/system-tables/metrics#revision) 。

**语法**

```sql
revision()
```

**返回值**

- 当前 ClickHouse 服务器修订版。 [UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT revision();
```

结果：

```response
┌─revision()─┐
│      54485 │
└────────────┘
```
## filesystemAvailable {#filesystemavailable}

返回托管数据库持久性的文件系统中的可用空间。返回的值总是小于总可用空间（[filesystemUnreserved](#filesystemunreserved)），因为有部分空间被操作系统保留。

**语法**

```sql
filesystemAvailable()
```

**返回值**

- 以字节为单位的剩余可用空间。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT formatReadableSize(filesystemAvailable()) AS "Available space";
```

结果：

```text
┌─Available space─┐
│ 30.75 GiB       │
└─────────────────┘
```
## filesystemUnreserved {#filesystemunreserved}

返回托管数据库持久性的文件系统中的总可用空间。（之前叫做 `filesystemFree`）。另见 [`filesystemAvailable`](#filesystemavailable)。

**语法**

```sql
filesystemUnreserved()
```

**返回值**

- 以字节为单位的可用空间。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT formatReadableSize(filesystemUnreserved()) AS "Free space";
```

结果：

```text
┌─Free space─┐
│ 32.39 GiB  │
└────────────┘
```
## filesystemCapacity {#filesystemcapacity}

返回文件系统的容量（以字节为单位）。需要为数据目录配置 [path](../../operations/server-configuration-parameters/settings.md#path)。

**语法**

```sql
filesystemCapacity()
```

**返回值**

- 文件系统的容量，以字节为单位。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT formatReadableSize(filesystemCapacity()) AS "Capacity";
```

结果：

```text
┌─Capacity──┐
│ 39.32 GiB │
└───────────┘
```
## initializeAggregation {#initializeaggregation}

基于单个值计算聚合函数的结果。此函数可用于初始化与组合器 [-State](/sql-reference/aggregate-functions/combinators#-state) 相关的聚合函数。您可以创建聚合函数的状态并将其插入到类型为 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 的列中，或将初始化过的聚合用作默认值。

**语法**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**参数**

- `aggregate_function` — 要初始化的聚合函数的名称。 [String](../data-types/string.md)。
- `arg` — 聚合函数的参数。

**返回值**

- 传递给函数的每一行的聚合结果。

返回类型与作为第一个参数传递给 `initializeAggregation` 的函数的返回类型相同。

**示例**

查询：

```sql
SELECT uniqMerge(state) FROM (SELECT initializeAggregation('uniqState', number % 3) AS state FROM numbers(10000));
```

结果：

```text
┌─uniqMerge(state)─┐
│                3 │
└──────────────────┘
```

查询：

```sql
SELECT finalizeAggregation(state), toTypeName(state) FROM (SELECT initializeAggregation('sumState', number % 3) AS state FROM numbers(5));
```

结果：

```text
┌─finalizeAggregation(state)─┬─toTypeName(state)─────────────┐
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
│                          2 │ AggregateFunction(sum, UInt8) │
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
└────────────────────────────┴───────────────────────────────┘
```

使用 `AggregatingMergeTree` 表引擎和 `AggregateFunction` 列的示例：

```sql
CREATE TABLE metrics
(
    key UInt64,
    value AggregateFunction(sum, UInt64) DEFAULT initializeAggregation('sumState', toUInt64(0))
)
ENGINE = AggregatingMergeTree
ORDER BY key
```

```sql
INSERT INTO metrics VALUES (0, initializeAggregation('sumState', toUInt64(42)))
```

**另请参见**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayReduce)
## finalizeAggregation {#finalizeaggregation}

给定聚合函数的状态，此函数返回聚合结果（或在使用 [-State](/sql-reference/aggregate-functions/combinators#-state) 组合器时的最终状态）。

**语法**

```sql
finalizeAggregation(state)
```

**参数**

- `state` — 聚合状态。 [AggregateFunction](/sql-reference/data-types/aggregatefunction)。

**返回值**

- 被聚合的值。

:::note
返回类型等于任何被聚合类型的类型。
:::

**示例**

查询：

```sql
SELECT finalizeAggregation(( SELECT countState(number) FROM numbers(10)));
```

结果：

```text
┌─finalizeAggregation(_subquery16)─┐
│                               10 │
└──────────────────────────────────┘
```

查询：

```sql
SELECT finalizeAggregation(( SELECT sumState(number) FROM numbers(10)));
```

结果：

```text
┌─finalizeAggregation(_subquery20)─┐
│                               45 │
└──────────────────────────────────┘
```

请注意，`NULL` 值被忽略。

查询：

```sql
SELECT finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]));
```

结果：

```text
┌─finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]))─┐
│                                                          2 │
└────────────────────────────────────────────────────────────┘
```

组合示例：

查询：

```sql
WITH initializeAggregation('sumState', number) AS one_row_sum_state
SELECT
    number,
    finalizeAggregation(one_row_sum_state) AS one_row_sum,
    runningAccumulate(one_row_sum_state) AS cumulative_sum
FROM numbers(10);
```

结果：

```text
┌─number─┬─one_row_sum─┬─cumulative_sum─┐
│      0 │           0 │              0 │
│      1 │           1 │              1 │
│      2 │           2 │              3 │
│      3 │           3 │              6 │
│      4 │           4 │             10 │
│      5 │           5 │             15 │
│      6 │           6 │             21 │
│      7 │           7 │             28 │
│      8 │           8 │             36 │
│      9 │           9 │             45 │
└────────┴─────────────┴────────────────┘
```

**另请参见**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayReduce)
- [initializeAggregation](#initializeaggregation)
## runningAccumulate {#runningaccumulate}

为数据块的每一行累积聚合函数的状态。

:::note
该状态在每个新数据块中重置。
由于这种容易出错的行为，该函数已被弃用，请使用适当的窗口函数。
:::

**语法**

```sql
runningAccumulate(agg_state[, grouping]);
```

**参数**

- `agg_state` — 聚合函数的状态。 [AggregateFunction](/sql-reference/data-types/aggregatefunction)。
- `grouping` — 分组键。可选。如果改变 `grouping` 值，则重置函数的状态。它可以是任何已定义相等运算符的 [支持数据类型](../data-types/index.md)。

**返回值**

- 每个结果行包含从 0 到当前行的所有输入行的聚合函数结果。 `runningAccumulate` 在每个新数据块或 `grouping` 值更改时重置状态。

类型取决于使用的聚合函数。

**示例**

考虑如何使用 `runningAccumulate` 查找数字的累积和，没有分组和有分组。

查询：

```sql
SELECT k, runningAccumulate(sum_k) AS res FROM (SELECT number AS k, sumState(k) AS sum_k FROM numbers(10) GROUP BY k ORDER BY k);
```

结果：

```text
┌─k─┬─res─┐
│ 0 │   0 │
│ 1 │   1 │
│ 2 │   3 │
│ 3 │   6 │
│ 4 │  10 │
│ 5 │  15 │
│ 6 │  21 │
│ 7 │  28 │
│ 8 │  36 │
│ 9 │  45 │
└───┴─────┘
```

子查询生成从 `0` 到 `9` 的每一个数字的 `sumState`。`sumState` 返回 [sum](../../sql-reference/aggregate-functions/reference/sum.md) 函数的状态，该状态包含一个数字的总和。

整个查询执行以下操作：

1. 对于第一行，`runningAccumulate` 取 `sumState(0)` 并返回 `0`。
2. 对于第二行，该函数合并 `sumState(0)` 和 `sumState(1)`，结果为 `sumState(0 + 1)`，返回 `1` 作为结果。
3. 对于第三行，该函数合并 `sumState(0 + 1)` 和 `sumState(2)`，结果为 `sumState(0 + 1 + 2)`，返回 `3` 作为结果。
4. 在块结束之前，操作不断重复。

以下示例展示了 `grouping` 参数的用法：

查询：

```sql
SELECT
    grouping,
    item,
    runningAccumulate(state, grouping) AS res
FROM
(
    SELECT
        toInt8(number / 4) AS grouping,
        number AS item,
        sumState(number) AS state
    FROM numbers(15)
    GROUP BY item
    ORDER BY item ASC
);
```

结果：

```text
┌─grouping─┬─item─┬─res─┐
│        0 │    0 │   0 │
│        0 │    1 │   1 │
│        0 │    2 │   3 │
│        0 │    3 │   6 │
│        1 │    4 │   4 │
│        1 │    5 │   9 │
│        1 │    6 │  15 │
│        1 │    7 │  22 │
│        2 │    8 │   8 │
│        2 │    9 │  17 │
│        2 │   10 │  27 │
│        2 │   11 │  38 │
│        3 │   12 │  12 │
│        3 │   13 │  25 │
│        3 │   14 │  39 │
└──────────┴──────┴─────┘
```

可见，`runningAccumulate` 为每组行分别合并状态。
## joinGet {#joinget}

该函数允许您以与从 [dictionary](../../sql-reference/dictionaries/index.md) 相同的方式从表中提取数据。通过指定的连接键从 [Join](../../engines/table-engines/special/join.md#creating-a-table) 表中获取数据。

:::note
仅支持使用 `ENGINE = Join(ANY, LEFT, <join_keys>)` 语句创建的表。
:::

**语法**

```sql
joinGet(join_storage_table_name, `value_column`, join_keys)
```

**参数**

- `join_storage_table_name` — 一个 [identifier](/sql-reference/syntax#identifiers)，指示搜索的位置。
- `value_column` — 包含所需数据的表的列名。
- `join_keys` — 键的列表。

:::note
在默认数据库中搜索标识符（请参见配置文件中的 `default_database` 设置）。要覆盖默认数据库，请使用 `USE db_name` 或通过分隔符 `db_name.db_table` 指定数据库和表，如示例中所示。
:::

**返回值**

- 返回与键列表对应的值列表。

:::note
如果源表中不存在某个键，则根据创建表时的 [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) 设置返回 `0` 或 `null`。
有关 `join_use_nulls` 的更多信息，请参见 [Join 操作](../../engines/table-engines/special/join.md)。
:::

**示例**

输入表：

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

查询：

```sql
SELECT number, joinGet(db_test.id_val, 'val', toUInt32(number)) FROM numbers(4);
```

结果：

```text
   ┌─number─┬─joinGet('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                  0 │
2. │      1 │                                                 11 │
3. │      2 │                                                 12 │
4. │      3 │                                                  0 │
   └────────┴────────────────────────────────────────────────────┘
```

在创建表时，可以使用设置 `join_use_nulls` 来改变如果源表中没有键时返回的行为。

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val_nulls(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id) SETTINGS join_use_nulls=1;
INSERT INTO db_test.id_val_nulls VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val_nulls;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

查询：

```sql
SELECT number, joinGet(db_test.id_val_nulls, 'val', toUInt32(number)) FROM numbers(4);
```

结果：

```text
   ┌─number─┬─joinGet('db_test.id_val_nulls', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
   └────────┴──────────────────────────────────────────────────────────┘
```
## joinGetOrNull {#joingetornull}

与 [joinGet](#joinget) 相似，但在缺失键时返回 `NULL` 而不是返回默认值。

**语法**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**参数**

- `join_storage_table_name` — 一个 [identifier](/sql-reference/syntax#identifiers)，指示搜索的位置。
- `value_column` — 包含所需数据的表的列名。
- `join_keys` — 键的列表。

:::note
在默认数据库中搜索标识符（请参见配置文件中的 `default_database` 设置）。要覆盖默认数据库，请使用 `USE db_name` 或通过分隔符 `db_name.db_table` 指定数据库和表，如示例中所示。
:::

**返回值**

- 返回与键列表对应的值列表。

:::note
如果源表中不存在某个键，则为该键返回 `NULL`。
:::

**示例**

输入表：

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

查询：

```sql
SELECT number, joinGetOrNull(db_test.id_val, 'val', toUInt32(number)) FROM numbers(4);
```

结果：

```text
   ┌─number─┬─joinGetOrNull('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
   └────────┴──────────────────────────────────────────────────────────┘
```
## catboostEvaluate {#catboostevaluate}

<CloudNotSupportedBadge/>

:::note
此函数在 ClickHouse Cloud 中不可用。
:::

评估外部 catboost 模型。[CatBoost](https://catboost.ai) 是 Yandex 开发的开源梯度提升库，用于机器学习。接受指向 catboost 模型及模型参数（特征）的路径。返回 Float64。

**语法**

```sql
catboostEvaluate(path_to_model, feature_1, feature_2, ..., feature_n)
```

**示例**

```sql
SELECT feat1, ..., feat_n, catboostEvaluate('/path/to/model.bin', feat_1, ..., feat_n) AS prediction
FROM data_table
```

**先决条件**

1. 构建 catboost 评估库

在评估 catboost 模型之前，必须提供 `libcatboostmodel.<so|dylib>` 库。请参见 [CatBoost 文档](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html) 了解如何编译它。

接下来，在 ClickHouse 配置中指定 `libcatboostmodel.<so|dylib>` 的路径：

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

出于安全和隔离的原因，模型评估不会在服务器进程中运行，而是在 clickhouse-library-bridge 进程中运行。
在第一次执行 `catboostEvaluate()` 时，如果该库桥接进程尚未运行，则服务器会启动该进程。这两个进程
通过 HTTP 接口进行通信。默认情况下使用端口 `9012`。可以通过以下方式指定其他端口 - 如果端口 `9012` 已经分配给其他服务，则此功能十分有用。

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. 使用 libcatboost 训练 catboost 模型

请参见 [训练和应用模型](https://catboost.ai/docs/features/training.html#training) 了解如何从训练数据集训练 catboost 模型。
## throwIf {#throwif}

如果参数 `x` 为真则抛出异常。

**语法**

```sql
throwIf(x[, message[, error_code]])
```

**参数**

- `x` - 要检查的条件。
- `message` - 提供自定义错误消息的常量字符串。可选。
- `error_code` - 提供自定义错误代码的常量整数。可选。

要使用 `error_code` 参数，配置参数 `allow_custom_error_code_in_throwif` 必须启用。

**示例**

```sql
SELECT throwIf(number = 3, 'Too many') FROM numbers(10);
```

结果：

```text
↙ Progress: 0.00 rows, 0.00 B (0.00 rows/s., 0.00 B/s.) Received exception from server (version 19.14.1):
Code: 395. DB::Exception: Received from localhost:9000. DB::Exception: Too many.
```
## identity {#identity}

返回它的参数。用于调试和测试。取消使用索引，并获取全扫描的查询性能。当查询分析以判断是否使用索引时，分析器会忽略 `identity` 函数中的所有内容。同时禁用常量折叠。

**语法**

```sql
identity(x)
```

**示例**

查询：

```sql
SELECT identity(42);
```

结果：

```text
┌─identity(42)─┐
│           42 │
└──────────────┘
```
## getSetting {#getsetting}

返回 [自定义设置](/operations/settings/query-level#custom_settings) 的当前值。

**语法**

```sql
getSetting('custom_setting');
```

**参数**

- `custom_setting` — 设置名称。 [String](../data-types/string.md)。

**返回值**

- 设置的当前值。

**示例**

查询：

```sql
SET custom_a = 123;
SELECT getSetting('custom_a');
```

结果：

```text
123
```

**另请参见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## getSettingOrDefault {#getsettingordefault}

返回 [自定义设置](/operations/settings/query-level#custom_settings) 的当前值，或者如果当前配置文件中未设置自定义配置，则返回第二个参数中指定的默认值。

**语法**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**参数**

- `custom_setting` — 设置名称。 [String](../data-types/string.md)。
- `default_value` — 如果未设置 custom_setting 的值，则返回的值。值可以是任何数据类型或 Null。

**返回值**

- 设置的当前值或如果未设置，则返回 default_value。

**示例**

查询：

```sql
SELECT getSettingOrDefault('custom_undef1', 'my_value');
SELECT getSettingOrDefault('custom_undef2', 100);
SELECT getSettingOrDefault('custom_undef3', NULL);
```

结果：

```text
my_value
100
NULL
```

**另请参见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## isDecimalOverflow {#isdecimaloverflow}

检查 [Decimal](../data-types/decimal.md) 值是否超出其精度或指定精度之外。

**语法**

```sql
isDecimalOverflow(d, [p])
```

**参数**

- `d` — 值。 [Decimal](../data-types/decimal.md)。
- `p` — 精度。可选。如果省略，则使用第一个参数的初始精度。此参数在从/向另一个数据库或文件迁移数据时可能会有用。 [UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- `1` — Decimal 值的数字超过其精度允许的数量，
- `0` — Decimal 值满足指定的精度。

**示例**

查询：

```sql
SELECT isDecimalOverflow(toDecimal32(1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(1000000000, 0)),
       isDecimalOverflow(toDecimal32(-1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(-1000000000, 0));
```

结果：

```text
1    1    1    1
```
## countDigits {#countdigits}

返回表示值所需的小数位数。

**语法**

```sql
countDigits(x)
```

**参数**

- `x` — [Int](../data-types/int-uint.md) 或 [Decimal](../data-types/decimal.md) 值。

**返回值**

- 位数。 [UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

:::note
对于 `Decimal` 值，考虑它们的规模：在基础整数类型上计算结果，即 `(value * scale)`。例如： `countDigits(42) = 2`， `countDigits(42.000) = 5`， `countDigits(0.04200) = 4`。即您可以通过 `countDecimal(x) > 18` 来检查 `Decimal64` 的小数溢出。这是 [isDecimalOverflow](#isdecimaloverflow) 的慢变体。
:::

**示例**

查询：

```sql
SELECT countDigits(toDecimal32(1, 9)), countDigits(toDecimal32(-1, 9)),
       countDigits(toDecimal64(1, 18)), countDigits(toDecimal64(-1, 18)),
       countDigits(toDecimal128(1, 38)), countDigits(toDecimal128(-1, 38));
```

结果：

```text
10    10    19    19    39    39
```
## errorCodeToName {#errorcodetoname}

- 错误代码的文本名称。 [LowCardinality(String)](../data-types/lowcardinality.md)。

**语法**

```sql
errorCodeToName(1)
```

结果：

```text
UNSUPPORTED_METHOD
```
## tcpPort {#tcpport}

返回此服务器监听的 [native interface](../../interfaces/tcp.md) TCP 端口号。
如果在分布式表的上下文中执行，则该函数生成与每个分片相关的正常列。否则，它产生一个常量值。

**语法**

```sql
tcpPort()
```

**参数**

- 无。

**返回值**

- TCP 端口号。 [UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT tcpPort();
```

结果：

```text
┌─tcpPort()─┐
│      9000 │
└───────────┘
```

**另请参见**

- [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)
## currentProfiles {#currentprofiles}

返回当前用户的当前 [设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 列表。

可以使用命令 [SET PROFILE](/sql-reference/functions/other-functions#currentprofiles) 来更改当前设置配置文件。如果未使用命令 `SET PROFILE`，则该函数返回当前用户定义的配置文件（请参见 [CREATE USER](/sql-reference/statements/create/user)）。

**语法**

```sql
currentProfiles()
```

**返回值**

- 当前用户设置配置文件的列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledProfiles {#enabledprofiles}

返回当前用户显式和隐式分配的设置配置文件。显式分配的配置文件与 [currentProfiles](#currentprofiles) 函数返回的相同。隐式分配的配置文件包括其他分配的配置文件的父配置文件、通过授予角色分配的配置文件、通过其自身设置分配的配置文件以及主要默认配置文件（请参见主服务器配置文件中的 `default_profile` 部分）。

**语法**

```sql
enabledProfiles()
```

**返回值**

- 启用的设置配置文件列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultProfiles {#defaultprofiles}

返回当前用户定义的所有配置文件（请参见 [CREATE USER](/sql-reference/statements/create/user) 语句）。

**语法**

```sql
defaultProfiles()
```

**返回值**

- 默认设置配置文件的列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## currentRoles {#currentroles}

返回分配给当前用户的角色。角色可以通过 [SET ROLE](/sql-reference/statements/set-role) 语句进行更改。如果未使用 `SET ROLE` 语句，则函数 `currentRoles` 返回与 `defaultRoles` 相同的结果。

**语法**

```sql
currentRoles()
```

**返回值**

- 当前用户的当前角色列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledRoles {#enabledroles}

返回当前角色和授予某些当前角色的角色的名称。

**语法**

```sql
enabledRoles()
```

**返回值**

- 当前用户启用的角色列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultRoles {#defaultroles}

返回当前用户登录时默认启用的角色。最初，这些角色是授予当前用户的所有角色（请参见 [GRANT](../../sql-reference/statements/grant.md#select)），但可以通过 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 语句进行更改。

**语法**

```sql
defaultRoles()
```

**返回值**

- 当前用户的默认角色列表。 [Array](../data-types/array.md)([String](../data-types/string.md)).
## getServerPort {#getserverport}

返回服务器端口号。当端口未被服务器使用时，抛出异常。

**语法**

```sql
getServerPort(port_name)
```

**参数**

- `port_name` — 服务器端口的名称。 [String](/sql-reference/data-types/string)。可能的值：

  - 'tcp_port'
  - 'tcp_port_secure'
  - 'http_port'
  - 'https_port'
  - 'interserver_http_port'
  - 'interserver_https_port'
  - 'mysql_port'
  - 'postgresql_port'
  - 'grpc_port'
  - 'prometheus.port'

**返回值**

- 服务器端口号。 [UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT getServerPort('tcp_port');
```

结果：

```text
┌─getServerPort('tcp_port')─┐
│ 9000                      │
└───────────────────────────┘
```
## queryID {#queryid}

返回当前查询的 ID。查询的其他参数可以通过 `query_id` 从 [system.query_log](../../operations/system-tables/query_log.md) 表中提取。

与 [initialQueryID](#initialqueryid) 函数相比，`queryID` 在不同分片上可能返回不同的结果（请参见示例）。

**语法**

```sql
queryID()
```

**返回值**

- 当前查询的 ID。 [String](../data-types/string.md)

**示例**

查询：

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT queryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果：

```text
┌─count()─┐
│ 3       │
└─────────┘
```
## initialQueryID {#initialqueryid}

返回初始当前查询的 ID。查询的其他参数可以通过 `initial_query_id` 从 [system.query_log](../../operations/system-tables/query_log.md) 表中提取。

与 [queryID](/sql-reference/functions/other-functions#queryid) 函数相比，`initialQueryID` 在不同分片上返回相同的结果（请参见示例）。

**语法**

```sql
initialQueryID()
```

**返回值**

- 初始当前查询的 ID。 [String](../data-types/string.md)

**示例**

查询：

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果：

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## initialQueryStartTime {#initialquerystarttime}

返回初始当前查询的开始时间。

`initialQueryStartTime` 在不同分片上返回相同的结果（请参见示例）。

**语法**

```sql
initialQueryStartTime()
```

**返回值**

- 初始当前查询的开始时间。 [DateTime](../data-types/datetime.md)

**示例**

查询：

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryStartTime() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果：

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## partitionID {#partitionid}

计算 [partition ID](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)。

:::note
此函数较慢，不应在大量行上调用。
:::

**语法**

```sql
partitionID(x[, y, ...]);
```

**参数**

- `x` — 要返回分区 ID 的列。
- `y,...` — 剩余的 N 列（可选）。

**返回值**

- 行所属的分区 ID。 [String](../data-types/string.md).

**示例**

查询：

```sql
DROP TABLE IF EXISTS tab;

CREATE TABLE tab
(
  i int,
  j int
)
ENGINE = MergeTree
PARTITION BY i
ORDER BY tuple();

INSERT INTO tab VALUES (1, 1), (1, 2), (1, 3), (2, 4), (2, 5), (2, 6);

SELECT i, j, partitionID(i), _partition_id FROM tab ORDER BY i, j;
```

结果：

```response
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 1 │ 1 │ 1              │ 1             │
│ 1 │ 2 │ 1              │ 1             │
│ 1 │ 3 │ 1              │ 1             │
└───┴───┴────────────────┴───────────────┘
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 2 │ 4 │ 2              │ 2             │
│ 2 │ 5 │ 2              │ 2             │
│ 2 │ 6 │ 2              │ 2             │
└───┴───┴────────────────┴───────────────┘
```
## shardNum {#shardnum}

返回处理分布式查询中数据部分的分片索引。索引从 `1` 开始。
如果查询不是分布式的，则返回常量值 `0`。

**语法**

```sql
shardNum()
```

**返回值**

- 分片索引或常量 `0`。[UInt32](../data-types/int-uint.md)。

**示例**

在以下示例中，使用了两个分片的配置。在每个分片上执行 [system.one](../../operations/system-tables/one.md) 表的查询。

查询：

```sql
CREATE TABLE shard_num_example (dummy UInt8)
    ENGINE=Distributed(test_cluster_two_shards_localhost, system, one, dummy);
SELECT dummy, shardNum(), shardCount() FROM shard_num_example;
```

结果：

```text
┌─dummy─┬─shardNum()─┬─shardCount()─┐
│     0 │          2 │            2 │
│     0 │          1 │            2 │
└───────┴────────────┴──────────────┘
```

**另请参阅**

- [分布式表引擎](../../engines/table-engines/special/distributed.md)

## shardCount {#shardcount}

返回分布式查询的分片总数。
如果查询不是分布式的，则返回常量值 `0`。

**语法**

```sql
shardCount()
```

**返回值**

- 总分片数或 `0`。[UInt32](../data-types/int-uint.md)。

**另请参阅**

- [shardNum()](#shardnum) 函数示例也包含 `shardCount()` 函数调用。

## getOSKernelVersion {#getoskernelversion}

返回当前操作系统内核版本的字符串。

**语法**

```sql
getOSKernelVersion()
```

**参数**

- 无。

**返回值**

- 当前操作系统内核版本。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT getOSKernelVersion();
```

结果：

```text
┌─getOSKernelVersion()────┐
│ Linux 4.15.0-55-generic │
└─────────────────────────┘
```

## zookeeperSessionUptime {#zookeepersessionuptime}

返回当前 ZooKeeper 会话的运行时间（秒）。

**语法**

```sql
zookeeperSessionUptime()
```

**参数**

- 无。

**返回值**

- 当前 ZooKeeper 会话的运行时间（秒）。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT zookeeperSessionUptime();
```

结果：

```text
┌─zookeeperSessionUptime()─┐
│                      286 │
└──────────────────────────┘
```

## generateRandomStructure {#generaterandomstructure}

生成随机表结构，格式为 `column1_name column1_type, column2_name column2_type, ...`。

**语法**

```sql
generateRandomStructure([number_of_columns, seed])
```

**参数**

- `number_of_columns` — 结果表结构中所需的列数。如果设置为 0 或 `Null`，列数将随机在 1 到 128 之间。默认值：`Null`。
- `seed` - 随机种子，以生成稳定的结果。如果种子未指定或设置为 `Null`，则随机生成。

所有参数必须为常量。

**返回值**

- 随机生成的表结构。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT generateRandomStructure()
```

结果：

```text
┌─generateRandomStructure()─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal32(5), c2 Date, c3 Tuple(LowCardinality(String), Int128, UInt64, UInt16, UInt8, IPv6), c4 Array(UInt128), c5 UInt32, c6 IPv4, c7 Decimal256(64), c8 Decimal128(3), c9 UInt256, c10 UInt64, c11 DateTime │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT generateRandomStructure(1)
```

结果：

```text
┌─generateRandomStructure(1)─┐
│ c1 Map(UInt256, UInt16)    │
└────────────────────────────┘
```

查询：

```sql
SELECT generateRandomStructure(NULL, 33)
```

结果：

```text
┌─generateRandomStructure(NULL, 33)─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 DateTime, c2 Enum8('c2V0' = 0, 'c2V1' = 1, 'c2V2' = 2, 'c2V3' = 3), c3 LowCardinality(Nullable(FixedString(30))), c4 Int16, c5 Enum8('c5V0' = 0, 'c5V1' = 1, 'c5V2' = 2, 'c5V3' = 3), c6 Nullable(UInt8), c7 String, c8 Nested(e1 IPv4, e2 UInt8, e3 UInt16, e4 UInt16, e5 Int32, e6 Map(Date, Decimal256(70))) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**注意**: 复杂类型（Array, Tuple, Map, Nested）的最大嵌套深度限制为 16。

该函数可以与 [generateRandom](../../sql-reference/table-functions/generate.md) 一起使用，以生成完全随机的表。

## structureToCapnProtoSchema {#structure_to_capn_proto_schema}

将 ClickHouse 表结构转换为 CapnProto 模式。

**语法**

```sql
structureToCapnProtoSchema(structure)
```

**参数**

- `structure` — 表结构，格式为 `column1_name column1_type, column2_name column2_type, ...`。
- `root_struct_name` — CapnProto 模式中的根结构名称。默认值 - `Message`；

**返回值**

- CapnProto 模式。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

结果：

```text
@0xf96402dd754d0eb7;

struct Message
{
    column1 @0 : Data;
    column2 @1 : UInt32;
    column3 @2 : List(Data);
}
```

查询：

```sql
SELECT structureToCapnProtoSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

结果：

```text
@0xd1c8320fecad2b7f;

struct Message
{
    struct Column1
    {
        union
        {
            value @0 : Data;
            null @1 : Void;
        }
    }
    column1 @0 : Column1;
    struct Column2
    {
        element1 @0 : UInt32;
        element2 @1 : List(Data);
    }
    column2 @1 : Column2;
    struct Column3
    {
        struct Entry
        {
            key @0 : Data;
            value @1 : Data;
        }
        entries @0 : List(Entry);
    }
    column3 @2 : Column3;
}
```

查询：

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

结果：

```text
@0x96ab2d4ab133c6e1;

struct Root
{
    column1 @0 : Data;
    column2 @1 : UInt32;
}
```

## structureToProtobufSchema {#structure_to_protobuf_schema}

将 ClickHouse 表结构转换为 Protobuf 模式。

**语法**

```sql
structureToProtobufSchema(structure)
```

**参数**

- `structure` — 表结构，格式为 `column1_name column1_type, column2_name column2_type, ...`。
- `root_message_name` — Protobuf 模式中的根消息名称。默认值 - `Message`；

**返回值**

- Protobuf 模式。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

结果：

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    uint32 column2 = 2;
    repeated bytes column3 = 3;
}
```

查询：

```sql
SELECT structureToProtobufSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

结果：

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    message Column2
    {
        uint32 element1 = 1;
        repeated bytes element2 = 2;
    }
    Column2 column2 = 2;
    map<string, bytes> column3 = 3;
}
```

查询：

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

结果：

```text
syntax = "proto3";

message Root
{
    bytes column1 = 1;
    uint32 column2 = 2;
}
```

## formatQuery {#formatquery}

返回给定 SQL 查询的格式化版本，可能是多行的。

如果查询格式不正确，则抛出异常。要返回 `NULL`，可以使用函数 `formatQueryOrNull()`。

**语法**

```sql
formatQuery(query)
formatQueryOrNull(query)
```

**参数**

- `query` - 需要格式化的 SQL 查询。[String](../data-types/string.md)

**返回值**

- 格式化后的查询。[String](../data-types/string.md)。

**示例**

```sql
SELECT formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

结果：

```result
┌─formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT
    a,
    b
FROM tab
WHERE (a > 3) AND (b < 3)            │
└───────────────────────────────────────────────────────────────┘
```

## formatQuerySingleLine {#formatquerysingleline}

与 formatQuery() 类似，但返回的格式化字符串不包含换行符。

如果查询格式不正确，则抛出异常。要返回 `NULL`，可以使用函数 `formatQuerySingleLineOrNull()`。

**语法**

```sql
formatQuerySingleLine(query)
formatQuerySingleLineOrNull(query)
```

**参数**

- `query` - 需要格式化的 SQL 查询。[String](../data-types/string.md)

**返回值**

- 格式化后的查询。[String](../data-types/string.md)。

**示例**

```sql
SELECT formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

结果：

```result
┌─formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT a, b FROM tab WHERE (a > 3) AND (b < 3)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## variantElement {#variantelement}

从 `Variant` 列中提取指定类型的列。

**语法**

```sql
variantElement(variant, type_name, [, default_value])
```

**参数**

- `variant` — Variant 列。[Variant](../data-types/variant.md)。
- `type_name` — 要提取的变体类型的名称。[String](../data-types/string.md)。
- `default_value` - 如果变体没有指定类型的变体时使用的默认值。可以是任何类型。可选。

**返回值**

- 指定类型的 `Variant` 列的子列。

**示例**

查询：

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

## variantType {#varianttype}

返回 `Variant` 列每行的变体类型名称。如果行包含 NULL，则返回 `'None'`。

**语法**

```sql
variantType(variant)
```

**参数**

- `variant` — Variant 列。[Variant](../data-types/variant.md)。

**返回值**

- 每行的变体类型名称的 Enum8 列。

**示例**

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```

```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```

## minSampleSizeConversion {#minsamplesizeconversion}

计算比较两个样本中转化率（比例）的 A/B 测试所需的最小样本量。

**语法**

```sql
minSampleSizeConversion(baseline, mde, power, alpha)
```

使用 [这篇文章](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a) 中描述的公式。假设处理组和对照组的大小相等。返回一个组所需的样本大小（即整个实验所需的样本大小是返回值的两倍）。

**参数**

- `baseline` — 基线转化率。[Float](../data-types/float.md)。
- `mde` — 最小可检测效应（MDE），单位为百分点（例如，对于基线转化率 0.25，MDE 0.03 表示期望变化为 0.25 ± 0.03）。[Float](../data-types/float.md)。
- `power` — 测试所需的统计功效（1 - II类错误的概率）。[Float](../data-types/float.md)。
- `alpha` — 测试所需的显著性水平（I类错误的概率）。[Float](../data-types/float.md)。

**返回值**

一个命名的 [Tuple](../data-types/tuple.md)，包含 3 个元素：

- `"minimum_sample_size"` — 所需样本大小。[Float64](../data-types/float.md)。
- `"detect_range_lower"` — 无法用返回的所需样本大小检测到的值范围的下界（即，所有小于或等于 `"detect_range_lower"` 的值都可以用提供的 `alpha` 和 `power` 检测到）。计算为 `baseline - mde`。[Float64](../data-types/float.md)。
- `"detect_range_upper"` — 无法用返回的所需样本大小检测到的值范围的上界（即，所有大于或等于 `"detect_range_upper"` 的值都可以用提供的 `alpha` 和 `power` 检测到）。计算为 `baseline + mde`。[Float64](../data-types/float.md)。

**示例**

以下查询计算基线转化率为 25%、MDE 为 3%、显著性水平为 5%和所需统计功效为 80% 的 A/B 测试所需的样本大小：

```sql
SELECT minSampleSizeConversion(0.25, 0.03, 0.80, 0.05) AS sample_size;
```

结果：

```text
┌─sample_size───────────────────┐
│ (3396.077603219163,0.22,0.28) │
└───────────────────────────────┘
```

## minSampleSizeContinuous {#minsamplesizecontinuous}

计算比较两个样本中连续指标均值的 A/B 测试所需的最小样本量。

**语法**

别名: `minSampleSizeContinous`

使用 [这篇文章](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a) 中描述的公式。假设处理组和对照组的大小相等。返回一个组所需的样本大小（即整个实验所需的样本大小是返回值的两倍）。还假设处理和对照组中测试指标的方差相等。

**参数**

- `baseline` — 指标的基线值。[Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `sigma` — 指标的基线标准差。[Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `mde` — 最小可检测效应（MDE），单位为基线值的百分比（例如，对于基线值 112.25，MDE 0.03 表示期望变化为 112.25 ± 112.25\*0.03）。[Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `power` — 测试所需的统计功效（1 - II类错误的概率）。[Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `alpha` — 测试所需的显著性水平（I类错误的概率）。[Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。

**返回值**

一个命名的 [Tuple](../data-types/tuple.md)，包含 3 个元素：

- `"minimum_sample_size"` — 所需样本大小。[Float64](../data-types/float.md)。
- `"detect_range_lower"` — 无法用返回的所需样本大小检测到的值范围的下界（即，所有小于或等于 `"detect_range_lower"` 的值都可以用提供的 `alpha` 和 `power` 检测到）。计算为 `baseline * (1 - mde)`。[Float64](../data-types/float.md)。
- `"detect_range_upper"` — 无法用返回的所需样本大小检测到的值范围的上界（即，所有大于或等于 `"detect_range_upper"` 的值都可以用提供的 `alpha` 和 `power` 检测到）。计算为 `baseline * (1 + mde)`。[Float64](../data-types/float.md)。

**示例**

以下查询计算基线值为 112.25、标准差为 21.1、MDE 为 3%、显著性水平为 5%和所需统计功效为 80% 的 A/B 测试所需的样本大小：

```sql
SELECT minSampleSizeContinous(112.25, 21.1, 0.03, 0.80, 0.05) AS sample_size;
```

结果：

```text
┌─sample_size───────────────────────────┐
│ (616.2931945826209,108.8825,115.6175) │
└───────────────────────────────────────┘
```

## connectionId {#connectionid}

检索提交当前查询的客户端的连接 ID，并将其作为 UInt64 整数返回。

**语法**

```sql
connectionId()
```

别名: `connection_id`。

**参数**

无。

**返回值**

当前连接 ID。[UInt64](../data-types/int-uint.md)。

**实现细节**

此函数在调试场景或 MySQL 处理程序的内部目的中最为有用。它是为了兼容 [MySQL 的 `CONNECTION_ID` 函数](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_connection-id) 而创建的。通常不在生产查询中使用。

**示例**

查询：

```sql
SELECT connectionId();
```

结果：

```response
0
```

## getClientHTTPHeader {#getclienthttpheader}

获取 HTTP 头的值。

如果没有这样的头，或者当前请求不是通过 HTTP 接口执行的，则该函数返回一个空字符串。
某些 HTTP 头（例如 `Authentication` 和 `X-ClickHouse-*`）是受限的。

该函数需要启用设置 `allow_get_client_http_header`。
出于安全原因，默认情况下未启用该设置，因为某些头（例如 `Cookie`）可能包含敏感信息。

对于此函数，HTTP 头是区分大小写的。

如果该函数在分布式查询的上下文中使用，则仅在发起节点上返回非空结果。

## showCertificate {#showcertificate}

如果当前服务器的安全套接字层 (SSL) 证书已被配置，则显示有关该证书的信息。有关如何配置 ClickHouse 使用 OpenSSL 证书验证连接的更多信息，请参见 [配置 SSL-TLS](/guides/sre/configuring-ssl)。

**语法**

```sql
showCertificate()
```

**返回值**

- 与配置的 SSL 证书相关的键值对的映射。[Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md))。

**示例**

查询：

```sql
SELECT showCertificate() FORMAT LineAsString;
```

结果：

```response
{'version':'1','serial_number':'2D9071D64530052D48308473922C7ADAFA85D6C5','signature_algo':'sha256WithRSAEncryption','issuer':'/CN=marsnet.local CA','not_before':'May  7 17:01:21 2024 GMT','not_after':'May  7 17:01:21 2025 GMT','subject':'/CN=chnode1','pkey_algo':'rsaEncryption'}
```

## lowCardinalityIndices {#lowcardinalityindices}

返回 [LowCardinality](../data-types/lowcardinality.md) 列中值在字典中的位置。位置从 1 开始。由于 LowCardinality 每个分片有字典，因此该函数可能会返回同一值在不同分片中的不同位置。

**语法**

```sql
lowCardinalityIndices(col)
```

**参数**

- `col` — 低基数列。[LowCardinality](../data-types/lowcardinality.md)。

**返回值**

- 当前分片中值在字典中的位置。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- create two parts:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityIndices(s) FROM test;
```

结果：

```response
   ┌─s──┬─lowCardinalityIndices(s)─┐
1. │ ab │                        1 │
2. │ cd │                        2 │
3. │ ab │                        1 │
4. │ ab │                        1 │
5. │ df │                        3 │
   └────┴──────────────────────────┘
    ┌─s──┬─lowCardinalityIndices(s)─┐
 6. │ ef │                        1 │
 7. │ cd │                        2 │
 8. │ ab │                        3 │
 9. │ cd │                        2 │
10. │ ef │                        1 │
    └────┴──────────────────────────┘
```

## lowCardinalityKeys {#lowcardinalitykeys}

返回 [LowCardinality](../data-types/lowcardinality.md) 列的字典值。如果数据块小于或大于字典大小，结果将被截断或使用默认值扩展。由于 LowCardinality 每个分片有字典，因此该函数可能在不同分片中返回不同的字典值。

**语法**

```sql
lowCardinalityKeys(col)
```

**参数**

- `col` — 低基数列。[LowCardinality](../data-types/lowcardinality.md)。

**返回值**

- 字典键。[UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- create two parts:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityKeys(s) FROM test;
```

结果：

```response
   ┌─s──┬─lowCardinalityKeys(s)─┐
1. │ ef │                       │
2. │ cd │ ef                    │
3. │ ab │ cd                    │
4. │ cd │ ab                    │
5. │ ef │                       │
   └────┴───────────────────────┘
    ┌─s──┬─lowCardinalityKeys(s)─┐
 6. │ ab │                       │
 7. │ cd │ ab                    │
 8. │ ab │ cd                    │
 9. │ ab │ df                    │
10. │ df │                       │
    └────┴───────────────────────┘
```

## displayName {#displayname}

返回 [config](/operations/configuration-files) 中的 `display_name` 值，或者如果未设置则返回服务器的完全限定域名 (FQDN)。

**语法**

```sql
displayName()
```

**返回值**

- 从配置中获取的 `display_name` 值或服务器 FQDN（如果未设置）。[String](../data-types/string.md)。

**示例**

`display_name` 可以在 `config.xml` 中设置。以配置为 'production' 的服务器为例：

```xml
<!-- It is the name that will be shown in the clickhouse-client.
     By default, anything with "production" will be highlighted in red in query prompt.
-->
<display_name>production</display_name>
```

查询：

```sql
SELECT displayName();
```

结果：

```response
┌─displayName()─┐
│ production    │
└───────────────┘
```

## transactionID {#transactionid}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

返回 [transaction](/guides/developer/transactional#transactions-commit-and-rollback) 的 ID。

:::note
此函数是实验性功能的一部分。通过将此设置添加到配置中来启用实验性事务支持：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见 [事务性的 (ACID) 支持](/guides/developer/transactional#transactions-commit-and-rollback) 页面。
:::

**语法**

```sql
transactionID()
```

**返回值**

- 返回一个包含 `start_csn`、`local_tid` 和 `host_id` 的元组。[Tuple](../data-types/tuple.md)。

- `start_csn`: 全局顺序号，事务开始时看到的最新提交时间戳。[UInt64](../data-types/int-uint.md)。
- `local_tid`: 针对特定的 `start_csn`，由该主机启动的每个事务唯一的本地顺序号。[UInt64](../data-types/int-uint.md)。
- `host_id`: 启动此事务的主机的 UUID。[UUID](../data-types/uuid.md)。

**示例**

查询：

```sql
BEGIN TRANSACTION;
SELECT transactionID();
ROLLBACK;
```

结果：

```response
┌─transactionID()────────────────────────────────┐
│ (32,34,'0ee8b069-f2bb-4748-9eae-069c85b5252b') │
└────────────────────────────────────────────────┘
```

## transactionLatestSnapshot {#transactionlatestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

返回可供读取的 [transaction](/guides/developer/transactional#transactions-commit-and-rollback) 的最新快照（提交序列号）。

:::note
此函数是实验性功能的一部分。通过将此设置添加到配置中来启用实验性事务支持：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见 [事务性的（ACID）支持](/guides/developer/transactional#transactions-commit-and-rollback) 页面。
:::

**语法**

```sql
transactionLatestSnapshot()
```

**返回值**

- 返回事务的最新快照（CSN）。[UInt64](../data-types/int-uint.md)

**示例**

查询：

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

结果：

```response
┌─transactionLatestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```

## transactionOldestSnapshot {#transactionoldestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

返回某个正在运行的 [transaction](/guides/developer/transactional#transactions-commit-and-rollback) 可见的最旧快照（提交序列号）。

:::note
此函数是实验性功能的一部分。通过将此设置添加到配置中来启用实验性事务支持：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见 [事务性的 (ACID) 支持](/guides/developer/transactional#transactions-commit-and-rollback) 页面。
:::

**语法**

```sql
transactionOldestSnapshot()
```

**返回值**

- 返回事务的最旧快照（CSN）。[UInt64](../data-types/int-uint.md)

**示例**

查询：

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

结果：

```response
┌─transactionOldestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```

## getSubcolumn {#getsubcolumn}

接受一个表表达式或标识符以及常量字符串（包含子列的名称），并返回从该表达式提取的请求的子列。

**语法**

```sql
getSubcolumn(col_name, subcol_name)
```

**参数**

- `col_name` — 表表达式或标识符。[Expression](../syntax.md/#expressions)、[Identifier](../syntax.md/#identifiers)。
- `subcol_name` — 子列的名称。[String](../data-types/string.md)。

**返回值**

- 返回提取的子列。

**示例**

查询：

```sql
CREATE TABLE t_arr (arr Array(Tuple(subcolumn1 UInt32, subcolumn2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT getSubcolumn(arr, 'subcolumn1'), getSubcolumn(arr, 'subcolumn2') FROM t_arr;
```

结果：

```response
   ┌─getSubcolumn(arr, 'subcolumn1')─┬─getSubcolumn(arr, 'subcolumn2')─┐
1. │ [1,2]                           │ ['Hello','World']               │
2. │ [3,4,5]                         │ ['This','is','subcolumn']       │
   └─────────────────────────────────┴─────────────────────────────────┘
```

## getTypeSerializationStreams {#gettypeserializationstreams}

枚举数据类型的流路径。

:::note
此函数旨在供开发人员使用。
:::

**语法**

```sql
getTypeSerializationStreams(col)
```

**参数**

- `col` — 列或字符串形式的数据类型，从中将检测数据类型。

**返回值**

- 返回一个包含所有序列化子流路径的数组。[Array](../data-types/array.md)([String](../data-types/string.md))。

**示例**

查询：

```sql
SELECT getTypeSerializationStreams(tuple('a', 1, 'b', 2));
```

结果：

```response
   ┌─getTypeSerializationStreams(('a', 1, 'b', 2))─────────────────────────────────────────────────────────────────────────┐
1. │ ['{TupleElement(1), Regular}','{TupleElement(2), Regular}','{TupleElement(3), Regular}','{TupleElement(4), Regular}'] │
   └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT getTypeSerializationStreams('Map(String, Int64)');
```

结果：

```response
   ┌─getTypeSerializationStreams('Map(String, Int64)')────────────────────────────────────────────────────────────────┐
1. │ ['{ArraySizes}','{ArrayElements, TupleElement(keys), Regular}','{ArrayElements, TupleElement(values), Regular}'] │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## globalVariable {#globalvariable}

接受一个常量字符串参数，并返回具有该名称的全局变量的值。此函数是为了与 MySQL 兼容而设计的，并不适合 ClickHouse 的正常操作。只定义了少数几个虚拟全局变量。

**语法**

```sql
globalVariable(name)
```

**参数**

- `name` — 全局变量名称。[String](../data-types/string.md)。

**返回值**

- 返回变量 `name` 的值。

**示例**

查询：

```sql
SELECT globalVariable('max_allowed_packet');
```

结果：

```response
┌─globalVariable('max_allowed_packet')─┐
│                             67108864 │
└──────────────────────────────────────┘
```

## getMaxTableNameLengthForDatabase {#getmaxtablenamelengthfordatabase}

返回指定数据库中表名的最大长度。

**语法**

```sql
getMaxTableNameLengthForDatabase(database_name)
```

**参数**

- `database_name` — 指定数据库的名称。[String](../data-types/string.md)。

**返回值**

- 返回最大表名长度。

**示例**

查询：

```sql
SELECT getMaxTableNameLengthForDatabase('default');
```

结果：

```response
┌─getMaxTableNameLengthForDatabase('default')─┐
│                                         206 │
└─────────────────────────────────────────────┘
```

## getServerSetting {#getserversetting}

返回当前服务器设置之一的当前值。

**语法**

```sql
getServerSetting('server_setting');
```

**参数**

- `server_setting` — 设置名称。[String](../data-types/string.md)。

**返回值**

- 服务器设置的当前值。

**示例**

```sql
SELECT getServerSetting('allow_use_jemalloc_memory');
```

结果：

```text
┌─getServerSetting('allow_use_jemalloc_memory')─┐
│ true                                          │
└───────────────────────────────────────────────┘
```

## getMergeTreeSetting {#getmergetreesetting}

返回合并树设置之一的当前值。

**语法**

```sql
getMergeTreeSetting('merge_tree_setting');
```

**参数**

- `merge_tree_setting` — 设置名称。[String](../data-types/string.md)。

**返回值**

- 合并树设置的当前值。

**示例**

```sql
SELECT getMergeTreeSetting('index_granularity');
```

结果：

```text
┌─getMergeTree(index_granularity')─┐
│                     8192         │
└──────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
