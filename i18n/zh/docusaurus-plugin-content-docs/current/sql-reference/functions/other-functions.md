import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# 其他函数
## hostName {#hostname}

返回执行此函数的主机名称。如果该函数在远程服务器（分布式处理）上执行，则返回远程服务器名称。如果该函数在分布式表的上下文中执行，则生成一个包含与每个分片相关值的正常列。否则，它会产生一个常量值。

**语法**

```sql
hostName()
```

**返回值**

- 主机名。 [字符串](../data-types/string.md)。

## getMacro {#getMacro}

从服务器配置的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分返回一个命名值。

**语法**

```sql
getMacro(name);
```

**参数**

- `name` — 要从 `<macros>` 部分检索的宏名称。 [字符串](/sql-reference/data-types/string)。

**返回值**

- 指定宏的值。 [字符串](../data-types/string.md)。

**示例**

服务器配置文件中的示例 `<macros>` 部分：

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

可以通过以下方式获取相同的值：

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

别名：`fullHostName`, `FQDN`。

**返回值**

- 完全限定域名的字符串。 [字符串](../data-types/string.md)。

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

提取字符串中最后一个斜杠或反斜杠后的尾部。此函数通常用于从路径中提取文件名。

```sql
basename(expr)
```

**参数**

- `expr` — 类型为 [字符串](../data-types/string.md) 的值。反斜杠必须进行转义。

**返回值**

包含：

- 输入字符串中最后一个斜杠或反斜杠后的尾部。如果输入字符串以斜杠或反斜杠结尾（例如 `/` 或 `c:\`），则函数返回空字符串。
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

计算在文本格式（制表符分隔）下输出值时的近似宽度。此函数由系统用于实现 [Pretty formats](../../interfaces/formats.md)。

`NULL` 在 `Pretty` 格式中表示为对应于 `NULL` 的字符串。

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

如果传递 `NULL`，则函数返回类型 `Nullable(Nothing)`，对应于 ClickHouse 的内部 `NULL` 表示。

**语法**

```sql
toTypeName(value)
```

**参数**

- `value` — 任意类型的值。

**返回值**

- 输入值的数据类型名称。 [字符串](../data-types/string.md)。

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

在 ClickHouse 中，查询是以 [块](/development/architecture#block)（块）进行处理的。此函数返回调用函数的块的大小（行数）。

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

返回其参数在内存中未压缩字节大小的估计值。

**语法**

```sql
byteSize(argument [, ...])
```

**参数**

- `argument` — 值。

**返回值**

- 参数在内存中的字节大小估计值。 [UInt64](../data-types/int-uint.md)。

**示例**

对于 [字符串](../data-types/string.md) 参数，该函数返回字符串长度 + 9（终止零 + 长度）。

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

如果该函数有多个参数，则该函数会累计它们的字节大小。

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

将常量转换为包含单个值的完整列。完整列和常量在内存中表示不同。函数通常对正常和常量参数执行不同的代码，尽管结果通常应该相同。此函数可用于调试此行为。

**语法**

```sql
materialize(x)
```

**参数**

- `x` — 常量。 [常量](overview.md/#constants)。

**返回值**

- 包含单个值 `x` 的列。

**示例**

在下面的示例中，`countMatches` 函数期望一个常量的第二个参数。可以使用 `materialize` 函数将常量转换为完整列以调试此行为，验证该函数对非恒定参数抛出错误。

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

接受任意参数，并无条件返回 `0`。参数仍会在内部被评估，因此对基准测试等情况非常有用。

**语法**

```sql
ignore([arg1[, arg2[, ...]])
```

**参数**

- 接受任意类型的任意数量参数，包括 `NULL`。

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

- `seconds`: [UInt*](../data-types/int-uint.md) 或 [Float](../data-types/float.md) 暂停查询执行的秒数，最多 3 秒。可以是浮点值以指定小数秒。

**返回值**

此函数不返回任何值。

**示例**

此函数不返回任何值。但是，如果您使用 `clickhouse client` 运行该函数，您会看到类似以下内容：

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

这个查询在完成之前会暂停 2 秒。在此期间，不会返回任何结果，查询将看起来像是挂起或未响应。

**实现细节**

`sleep()` 函数通常不在生产环境中使用，因为它可能会对查询性能和系统响应产生负面影响。然而，它在以下情况下可能会很有用：

1. **测试**：在测试或基准测试 ClickHouse 时，您可能希望模拟延迟或引入暂停，以观察系统在某些条件下的表现。
2. **调试**：如果您需要在特定时间检查系统的状态或查询的执行，可以使用 `sleep()` 引入暂停，允许您检查或收集相关信息。
3. **模拟**：在某些情况下，您可能希望模拟在处理外部系统或网络延迟时发生的真实场景。

谨慎使用 `sleep()` 函数，仅在必要时使用，因为它可能会对您的 ClickHouse 系统的整体性能和响应性产生影响。

## sleepEachRow {#sleepeachrow}

在结果集中，每个行执行查询时暂停指定的秒数。

**语法**

```sql
sleepEachRow(seconds)
```

**参数**

- `seconds`: [UInt*](../data-types/int-uint.md) 或 [Float*](../data-types/float.md) 每行在结果集中暂停查询执行的秒数，最多 3 秒。可以是浮点值以指定小数秒。

**返回值**

该函数返回接收到的相同输入值，而不修改它们。

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

但是输出将被延迟，每行之间暂停 0.5 秒。

`sleepEachRow()` 函数主要用于测试和调试目的，与 `sleep()` 函数类似。它允许您模拟延迟或在每行的处理过程中引入暂停，适用于以下场景：

1. **测试**：在特定条件下测试或基准测试 ClickHouse 的性能时，您可以使用 `sleepEachRow()` 模拟处理每一行时的延迟或引入暂停。
2. **调试**：如果您需要检查处理的每一行的系统状态或查询执行，可以使用 `sleepEachRow()` 引入暂停，允许您检查或收集相关信息。
3. **模拟**：在某些情况下，您可能希望模拟处理每一行时发生的真实场景中的延迟或暂停，例如处理外部系统或网络延迟。

与 [`sleep()` 函数](#sleep) 一样，谨慎使用 `sleepEachRow()`，仅在必要时使用，因为它可能显著影响您的 ClickHouse 系统的整体性能和响应性，尤其是在处理大型结果集时。

## currentDatabase {#currentdatabase}

返回当前数据库的名称。在 `CREATE TABLE` 查询中指定数据库时非常有用。

**语法**

```sql
currentDatabase()
```

**返回值**

- 返回当前数据库名称。 [字符串](../data-types/string.md)。

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

别名：`user()`, `USER()`, `current_user()`。别名不区分大小写。

**返回值**

- 当前用户的名称。 [字符串](../data-types/string.md)。
- 在分布式查询中，发起查询的用户的登录名。 [字符串](../data-types/string.md)。

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

返回一个只有一个元素的数组，包含当前数据库模式的名称。

**语法**

```sql
currentSchemas(bool)
```

别名：`current_schemas`。

**参数**

- `bool`: 布尔值。 [布尔](../data-types/boolean.md)。

:::note
布尔参数会被忽略。它仅存在于与 PostgreSQL 中此函数的 [实现](https://www.postgresql.org/docs/7.3/functions-misc.html) 兼容的原因。
:::

**返回值**

- 返回一个只有一个元素的数组，包含当前数据库的名称。

**示例**

```sql
SELECT currentSchemas(true);
```

结果：

```response
['default']
```

## isConstant {#isconstant}

返回参数是否为常量表达式。

常量表达式是结果在查询分析期间已知的表达式，即在执行之前。例如，对于 [literals](../../sql-reference/syntax.md#literals) 的表达式是常量表达式。

此函数主要用于开发、调试和演示。

**语法**

```sql
isConstant(x)
```

**参数**

- `x` — 要检查的表达式。

**返回值**

- 如果 `x` 是常量，则返回 `1`。 [UInt8](../data-types/int-uint.md)。
- 如果 `x` 不是常量，则返回 `0`。 [UInt8](../data-types/int-uint.md)。

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

给定数据库名称、表名称和列名称作为常量字符串，如果给定的列存在则返回 1，否则返回 0。

**语法**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**参数**

- `database` : 数据库名称。 [字符串字面量](/sql-reference/syntax#string)
- `table` : 表名称。 [字符串字面量](/sql-reference/syntax#string)
- `column` : 列名称。 [字符串字面量](/sql-reference/syntax#string)
- `hostname` : 执行检查的远程服务器名称。 [字符串字面量](/sql-reference/syntax#string)
- `username` : 远程服务器的用户名。 [字符串字面量](/sql-reference/syntax#string)
- `password` : 远程服务器的密码。 [字符串字面量](/sql-reference/syntax#string)

**返回值**

- 如果给定列存在，则返回 `1`。
- 否则返回 `0`。

**实现细节**

对于嵌套数据结构中的元素，函数检查列的存在性。对于嵌套数据结构本身，函数返回 0。

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

返回线程模糊测试是否有效。它可用于测试以防止运行时间过长。

**语法**

```sql
hasThreadFuzzer();
```

## bar {#bar}

构建条形图。

`bar(x, min, max, width)` 画出一种带宽与 `(x - min)` 成比例且当 `x = max` 时等于 `width` 个字符的带。

**参数**

- `x` — 要显示的大小。
- `min, max` — 整数常量。值必须适合 `Int64`。
- `width` — 常量，正整数，可以是小数。

带的绘制精度为符号的八分之一。

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

根据一些元素的显式定义的映射转换值。有两个变体的函数：
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – 要转换的内容。

`array_from` – 常量值数组，以进行转换。

`array_to` – 常量值数组，将 'from' 中的值转换为。

`default` – 如果 'x' 不等于 'from' 中的任何值，则使用哪个值。

`array_from` 和 `array_to` 必须有相同数量的元素。

签名：

对于 `x` 等于 `array_from` 中的某个元素，函数返回 `array_to` 中相应的元素，即相同数组索引处的元素。否则，它返回 `default`。如果存在多个匹配的 `array_from` 元素，则返回对应于第一个元素的元素。

`transform(T, Array(T), Array(U), U) -> U`

`T` 和 `U` 可以是数字、字符串或日期或日期时间类型。相同的字母（T 或 U）意味着类型必须是互相兼容的，而不一定相等。例如，第一个参数可以是 `Int64` 类型，而第二个参数可以是 `Array(UInt16)` 类型。

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

类似于另一个变体，但没有 'default' 参数。如果无法找到匹配项，则返回 `x`。

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

给定大小（字节数），此函数返回可读的、四舍五入的大小，带后缀（KB、MB 等）作为字符串。

此函数的反向操作是 [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero) 和 [parseReadableSizeOrNull](#parsereadablesizeornull)。

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

给定大小（字节数），此函数返回可读的、四舍五入的大小，带后缀（KiB、MiB 等）作为字符串。

此函数的反向操作是 [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero) 和 [parseReadableSizeOrNull](#parsereadablesizeornull)。

**语法**

```sql
formatReadableSize(x)
```

别名：`FORMAT_BYTES`。

:::note
此函数接受任何数字类型作为输入，但内部会将其转换为 Float64。对大值的结果可能不够理想。
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

给定一个数字，此函数返回带有后缀（千、百万、十亿等）作为字符串的四舍五入数字。

**语法**

```sql
formatReadableQuantity(x)
```

:::note
此函数接受任何数字类型作为输入，但内部会将其转换为 Float64。对大值的结果可能不够理想。
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

给定时间间隔（δ）以秒为单位，返回带年/月/日/小时/分钟/秒/毫秒/微秒/纳秒的时间间隔作为字符串。

**语法**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
此函数接受任何数字类型作为输入，但内部会将其转换为 Float64。对大值的结果可能不够理想。
:::

**参数**

- `column` — 带有数字时间间隔的列。
- `maximum_unit` — 可选。最大单位以显示。
  - 可接受的值：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`months`、`years`。
  - 默认值：`years`。
- `minimum_unit` — 可选。最小单位以显示。所有较小的单位都会被截断。
  - 可接受的值：`nanoseconds`、`microseconds`、`milliseconds`、`seconds`、`minutes`、`hours`、`days`、`months`、`years`。
  - 如果显式指定的值大于 `maximum_unit`，则会抛出异常。
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

给定一个包含字节大小的字符串以及 `B`、`KiB`、`KB`、`MiB`、`MB` 等单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。  
如果该函数无法解析输入值，则会抛出异常。

此函数的反向操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSize(x)
```

**参数**

- `x` : 具有 ISO/IEC 80000-13 或十进制字节单位的可读大小 ([字符串](../../sql-reference/data-types/string.md))。

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

给定一个包含字节大小的字符串以及 `B`、`KiB`、`KB`、`MiB`、`MB` 等单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。  
如果该函数无法解析输入值，则返回 `NULL`。

此函数的反向操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSizeOrNull(x)
```

**参数**

- `x` : 具有 ISO/IEC 80000-13 或十进制字节单位的可读大小 ([字符串](../../sql-reference/data-types/string.md))。

**返回值**

- 字节数，四舍五入到最接近的整数，或者如果无法解析输入则返回 NULL（Nullable([UInt64](../../sql-reference/data-types/int-uint.md))）。

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

给定一个包含字节大小的字符串以及 `B`、`KiB`、`KB`、`MiB`、`MB` 等单位（即 [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) 或十进制字节单位），此函数返回相应的字节数。如果该函数无法解析输入值，则返回 `0`。

此函数的反向操作为 [formatReadableSize](#formatreadablesize) 和 [formatReadableDecimalSize](#formatreadabledecimalsize)。

**语法**

```sql
parseReadableSizeOrZero(x)
```

**参数**

- `x` : 具有 ISO/IEC 80000-13 或十进制字节单位 ([字符串](../../sql-reference/data-types/string.md))。

**返回值**

- 字节数，四舍五入到最接近的整数，或者如果无法解析输入则返回 0 ([UInt64](../../sql-reference/data-types/int-uint.md))。

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

解析一个数字序列后跟类似时间单位的内容。

**语法**

```sql
parseTimeDelta(timestr)
```

**参数**

- `timestr` — 一个数字序列后跟类似时间单位的内容。

**返回值**

- 带有秒数的浮点数。

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

返回一个或多个输入参数中的最小参数。 `NULL` 参数会被忽略。

**语法**

```sql
least(a, b)
```

:::note
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果其中一个参数为 `NULL` 则返回 `NULL`。要保持之前的行为，请将设置 `least_greatest_legacy_null_behavior` （默认值：`false`）设置为 `true`。
:::

## greatest {#greatest}

返回一个或多个输入参数中的最大参数。 `NULL` 参数会被忽略。

**语法**

```sql
greatest(a, b)
```

:::note
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果其中一个参数为 `NULL` 则返回 `NULL`。要保持之前的行为，请将设置 `least_greatest_legacy_null_behavior` （默认值：`false`）设置为 `true`。
:::

## uptime {#uptime}

返回服务器的运行时间（以秒为单位）。如果在分布式表的上下文中执行，则此函数生成一个与每个分片相关的正常列的值。否则，它会产生一个常量值。

**语法**

```sql
uptime()
```

**返回值**

- 时间值，以秒为单位。 [UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT uptime() as Uptime;
```

结果：

```response
┌─Uptime─┐
│  55867 │
└────────┘
```

## version {#version}

返回 ClickHouse 的当前版本，格式为：

- 主版本
- 次版本
- 修补版本
- 自上一个稳定版本以来的提交次数。

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

如果在分布式表的上下文中执行，则此函数生成一个与每个分片相关的正常列的值。否则，它会产生一个常量值。

**语法**

```sql
version()
```

**参数**

无。

**返回值**

- 当前 ClickHouse 的版本。 [字符串](../data-types/string)。

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

返回由编译器生成的运行 ClickHouse 服务器二进制文件的构建 ID。如果在分布式表的上下文中执行，则此函数生成一个与每个分片相关的正常列的值。否则，它会产生一个常量值。

**语法**

```sql
buildId()
```

## blockNumber {#blocknumber}

返回包含行的 [块](../../development/architecture.md#block) 的单调递增序列号。返回的块编号是基于最佳努力更新的，即可能不完全准确。

**语法**

```sql
blockNumber()
```

**返回值**

- 行所在数据块的序列号。 [UInt64](../data-types/int-uint.md)。

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

返回每个通过 `rowNumberInBlock` 处理的 [块](../../development/architecture.md#block) 的当前行编号。返回的数字从每个块的 0 开始。

**语法**

```sql
rowNumberInBlock()
```

**返回值**

- 从 0 开始的数据块中的行的序号。 [UInt64](../data-types/int-uint.md)。

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

返回每行通过 `rowNumberInAllBlocks` 处理的唯一行编号。返回的数字从 0 开始。

**语法**

```sql
rowNumberInAllBlocks()
```

**返回值**

- 从 0 开始的数据块中的行的序号。 [UInt64](../data-types/int-uint.md)。

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

用占位符 `?` 替换文字、文字序列和复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）。

**语法**

```sql
normalizeQuery(x)
```

**参数**

- `x` — 字符序列。 [字符串](../data-types/string.md)。

**返回值**

- 带有占位符的字符序列。 [字符串](../data-types/string.md)。

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

用占位符 `?` 替换文字、文字序列，但不替换复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）。这有助于更好地分析复杂查询日志。

**语法**

```sql
normalizeQueryKeepNames(x)
```

**参数**

- `x` — 字符序列。 [字符串](../data-types/string.md)。

**返回值**

- 带有占位符的字符序列。 [字符串](../data-types/string.md)。

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

返回没有文字值的相似查询的相同 64 位哈希值。对分析查询日志有帮助。

**语法**

```sql
normalizedQueryHash(x)
```

**参数**

- `x` — 字符序列。 [字符串](../data-types/string.md)。

**返回值**

- 哈希值。 [UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

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

类似于 [normalizedQueryHash](#normalizedqueryhash)，它返回没有文字值的相似查询的相同 64 位哈希值，但在哈希之前不将复杂别名（包含空格、超过两个数字或至少 36 字节长，如 UUID）替换为占位符。对分析查询日志有帮助。

**语法**

```sql
normalizedQueryHashKeepNames(x)
```

**参数**

- `x` — 字符序列。 [字符串](../data-types/string.md)。

**返回值**

- 哈希值。 [UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

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

提供对当前行的某一列的指定偏移之前或之后的行的访问的窗口函数。

**语法**

```sql
neighbor(column, offset[, default_value])
```

函数的结果取决于影响的数据块和数据在块中的顺序。

:::note
仅在当前处理的数据块内返回邻居。由于这种容易出错的行为，函数已被弃用，请使用适当的窗口函数代替。
:::

在计算 `neighbor()` 的过程中，行的顺序可能与返回给用户的行的顺序不同。为避免这种情况，可以创建带有 [ORDER BY](../../sql-reference/statements/select/order-by.md) 的子查询，并在子查询外部调用该函数。

**参数**

- `column` — 列名或标量表达式。
- `offset` — 在 `column` 中查找当前行之前或之后的行数。 [Int64](../data-types/int-uint.md)。
- `default_value` — 可选。 如果偏移超出块边界，则返回的值。类型为影响的数据块的类型。

**返回值**

- 当前行的 `column` 值与 `offset` 距离，如果 `offset` 不在块边界外。
- 如果 `offset` 超出块边界，则返回 `column` 的默认值或 `default_value`（如果提供）。

:::note
返回类型将是受影响的数据块的类型或默认值的类型。
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

此函数可用于计算年比年指标值：

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

计算数据块中两个连续行值之间的差。对于第一行返回 0，对于后续行返回与前一行的差。

:::note
仅在当前处理的数据块内返回差异。由于这种容易出错的行为，函数已被弃用，请使用适当的窗口函数代替。
:::

函数的结果取决于影响的数据块和数据在块中的顺序。

在计算 `runningDifference()` 的过程中，行的顺序可能与返回给用户的行的顺序不同。为避免这种情况，可以创建带有 [ORDER BY](../../sql-reference/statements/select/order-by.md) 的子查询，并在子查询外部调用该函数。

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

请注意，块大小会影响结果。 `runningDifference` 的内部状态会在每个新块上重置。

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
此函数已被弃用（请参见 `runningDifference` 的注释）。
:::

与 [runningDifference](/sql-reference/functions/other-functions#runningDifference) 相同，但将第一行的值作为第一行上的值返回。

## runningConcurrency {#runningconcurrency}

计算并发事件的数量。每个事件都有一个开始时间和结束时间。开始时间包括在事件内，而结束时间不包括在内。具有开始时间和结束时间的列必须属于相同的数据类型。该函数计算每个事件开始时间的总活动（并发）事件数量。

:::tip
事件必须按升序排列开始时间。如果违反此要求，函数将引发异常。每个数据块单独处理。如果来自不同数据块的事件重叠，则不能正确处理。
:::

**语法**

```sql
runningConcurrency(start, end)
```

**参数**

- `start` — 事件的开始时间的列。 [日期](../data-types/date.md)、[日期时间](../data-types/datetime.md) 或 [日期时间64](../data-types/datetime64.md)。
- `end` — 事件的结束时间的列。 [日期](../data-types/date.md)、[日期时间](../data-types/datetime.md) 或 [日期时间64](../data-types/datetime64.md)。

**返回值**

- 每个事件开始时间的并发事件数量。 [UInt32](../data-types/int-uint.md)。

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

将 UInt64 数字解释为大端格式的 MAC 地址。以字符串格式返回相应的 MAC 地址，格式为 AA:BB:CC:DD:EE:FF（十六进制形式的带冒号分隔数字）。

**语法**

```sql
MACNumToString(num)
```
## MACStringToNum {#macstringtonum}

MACNumToString 的逆函数。如果 MAC 地址格式无效，则返回 0。

**语法**

```sql
MACStringToNum(s)
```
## MACStringToOUI {#macstringtooui}

给定格式为 AA:BB:CC:DD:EE:FF（十六进制形式的带冒号分隔数字）的 MAC 地址，返回前面三个八位字节作为 UInt64 数字。如果 MAC 地址格式无效，则返回 0。

**语法**

```sql
MACStringToOUI(s)
```
## getSizeOfEnumType {#getsizeofenumtype}

返回 [Enum](../data-types/enum.md) 中字段的数量。
如果类型不是 `Enum`，则抛出异常。

**语法**

```sql
getSizeOfEnumType(value)
```

**参数:**

- `value` — `Enum` 类型的值。

**返回值**

- 具有 `Enum` 输入值的字段数量。

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

返回不考虑压缩的磁盘大小。

```sql
blockSerializedSize(value[, value[, ...]])
```

**参数**

- `value` — 任何值。

**返回值**

- 写入磁盘的值块的字节数，不包括压缩。

**示例**

查询:

```sql
SELECT blockSerializedSize(maxState(1)) as x
```

结果:

```text
┌─x─┐
│ 2 │
└───┘
```
## toColumnTypeName {#tocolumntypename}

返回表示值的数据类型的内部名称。

**语法**

```sql
toColumnTypeName(value)
```

**参数:**

- `value` — 任何类型的值。

**返回值**

- 用于表示 `value` 的内部数据类型名称。

**示例**

`toTypeName` 和 `toColumnTypeName` 的区别:

```sql
SELECT toTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

结果:

```text
┌─toTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime                                            │
└─────────────────────────────────────────────────────┘
```

查询:

```sql
SELECT toColumnTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

结果:

```text
┌─toColumnTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ Const(UInt32)                                             │
└───────────────────────────────────────────────────────────┘
```

示例显示 `DateTime` 数据类型内部存储为 `Const(UInt32)`。
## dumpColumnStructure {#dumpcolumnstructure}

输出 RAM 中数据结构的详细描述

```sql
dumpColumnStructure(value)
```

**参数:**

- `value` — 任何类型的值。

**返回值**

- 用于表示 `value` 的列结构描述。

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

**参数:**

- `expression` — 任意类型的值或产生任意类型值的表达式。

**返回值**

- 数字为 `0`。
- 字符串为空字符串。
- `ᴺᵁᴸᴸ` 对于 [Nullable](../data-types/nullable.md)。

**示例**

查询:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Int8) )
```

结果:

```text
┌─defaultValueOfArgumentType(CAST(1, 'Int8'))─┐
│                                           0 │
└─────────────────────────────────────────────┘
```

查询:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Nullable(Int8) ) )
```

结果:

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

**参数:**

- `type` — 表示类型名称的字符串。

**返回值**

- 数字为 `0`。
- 字符串为空字符串。
- `ᴺᵁᴸᴸ` 对于 [Nullable](../data-types/nullable.md)。

**示例**

查询:

```sql
SELECT defaultValueOfTypeName('Int8')
```

结果:

```text
┌─defaultValueOfTypeName('Int8')─┐
│                              0 │
└────────────────────────────────┘
```

查询:

```sql
SELECT defaultValueOfTypeName('Nullable(Int8)')
```

结果:

```text
┌─defaultValueOfTypeName('Nullable(Int8)')─┐
│                                     ᴺᵁᴸᴸ │
└──────────────────────────────────────────┘
```
## indexHint {#indexhint}

此函数用于调试和自省。它会忽略其参数并始终返回 1。参数不会被评估。

但在索引分析过程中，此函数的参数假定不被 `indexHint` 包围。这使得可以选择索引范围内的数据，但不需通过该条件进一步过滤。ClickHouse 中的索引是稀疏的，使用 `indexHint` 将返回比直接指定相同条件更多的数据。

**语法**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**返回值**

- `1`。[Uint8](../data-types/int-uint.md)。

**示例**

以下是来自表 [ontime](../../getting-started/example-datasets/ontime.md) 的测试数据示例。

表:

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

该表在字段 `(FlightDate, (Year, FlightDate))` 上有索引。

创建一个不使用索引的查询:

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouse 处理了整个表 (`Processed 4.28 million rows`)。

结果:

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

要应用索引，选择特定日期:

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

ClickHouse 现在使用索引处理的行数显著减少 (`Processed 32.74 thousand rows`)。

结果:

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

现在将表达式 `k = '2017-09-15'` 包裹在函数 `indexHint` 中:

查询:

```sql
SELECT
    FlightDate AS k,
    count()
FROM ontime
WHERE indexHint(k = '2017-09-15')
GROUP BY k
ORDER BY k ASC
```

ClickHouse 以与之前相同的方式使用索引 (`Processed 32.74 thousand rows`)。
生成结果时未使用表达式 `k = '2017-09-15'`。
在示例中，`indexHint` 函数允许查看相邻日期。

结果:

```text
┌──────────k─┬─count()─┐
│ 2017-09-14 │    7071 │
│ 2017-09-15 │   16428 │
│ 2017-09-16 │    1077 │
│ 2017-09-30 │    8167 │
└────────────┴─────────┘
```
## replicate {#replicate}

创建一个只包含单个值的数组。

:::note
此函数用于 [arrayJoin](/sql-reference/functions/array-join) 的内部实现。
:::

**语法**

```sql
replicate(x, arr)
```

**参数**

- `x` — 填充结果数组的值。
- `arr` — 数组。[Array](../data-types/array.md)。

**返回值**

与 `arr` 长度相同的数组，填充值 `x`。[Array](../data-types/array.md)。

**示例**

查询:

```sql
SELECT replicate(1, ['a', 'b', 'c']);
```

结果:

```text
┌─replicate(1, ['a', 'b', 'c'])─┐
│ [1,1,1]                       │
└───────────────────────────────┘
```
## revision {#revision}

返回当前 ClickHouse [服务器修订号](../../operations/system-tables/metrics#revision)。

**语法**

```sql
revision()
```

**返回值**

- 当前 ClickHouse 服务器修订号。[UInt32](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT revision();
```

结果:

```response
┌─revision()─┐
│      54485 │
└────────────┘
```
## filesystemAvailable {#filesystemavailable}

返回承载数据库持久性的文件系统中自由空间的数量。返回的值始终小于总自由空间 ([filesystemUnreserved](#filesystemunreserved))，因为操作系统保留了一部分空间。

**语法**

```sql
filesystemAvailable()
```

**返回值**

- 可用的剩余空间量（以字节为单位）。[UInt64](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT formatReadableSize(filesystemAvailable()) AS "Available space";
```

结果:

```text
┌─Available space─┐
│ 30.75 GiB       │
└─────────────────┘
```
## filesystemUnreserved {#filesystemunreserved}

返回承载数据库持久性的文件系统中的总自由空间量。（以前称为 `filesystemFree`）。另请参见 [`filesystemAvailable`](#filesystemavailable)。

**语法**

```sql
filesystemUnreserved()
```

**返回值**

- 自由空间的数量（以字节为单位）。[UInt64](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT formatReadableSize(filesystemUnreserved()) AS "Free space";
```

结果:

```text
┌─Free space─┐
│ 32.39 GiB  │
└────────────┘
```
## filesystemCapacity {#filesystemcapacity}

返回以字节为单位的文件系统容量。需要配置到数据目录的 [path](../../operations/server-configuration-parameters/settings.md#path)。

**语法**

```sql
filesystemCapacity()
```

**返回值**

- 文件系统的容量（以字节为单位）。[UInt64](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT formatReadableSize(filesystemCapacity()) AS "Capacity";
```

结果:

```text
┌─Capacity──┐
│ 39.32 GiB │
└───────────┘
```
## initializeAggregation {#initializeaggregation}

根据单个值计算聚合函数的结果。此函数可用于初始化带有组合器 [-State](/sql-reference/aggregate-functions/combinators#-state) 的聚合函数。您可以创建聚合函数的状态并将其插入类型为 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 的列中，或将初始化的聚合用作默认值。

**语法**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**参数**

- `aggregate_function` — 要初始化的聚合函数名称。[String](../data-types/string.md)。
- `arg` — 聚合函数的参数。

**返回值**

- 每一行传递给函数的聚合结果。

返回类型与 `initializeAggregation` 作为第一个参数所接受的函数的返回类型相同。

**示例**

查询:

```sql
SELECT uniqMerge(state) FROM (SELECT initializeAggregation('uniqState', number % 3) AS state FROM numbers(10000));
```

结果:

```text
┌─uniqMerge(state)─┐
│                3 │
└──────────────────┘
```

查询:

```sql
SELECT finalizeAggregation(state), toTypeName(state) FROM (SELECT initializeAggregation('sumState', number % 3) AS state FROM numbers(5));
```

结果:

```text
┌─finalizeAggregation(state)─┬─toTypeName(state)─────────────┐
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
│                          2 │ AggregateFunction(sum, UInt8) │
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
└────────────────────────────┴───────────────────────────────┘
```

在 `AggregatingMergeTree` 表引擎和 `AggregateFunction` 列的示例:

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

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
## finalizeAggregation {#finalizeaggregation}

给定聚合函数的状态，此函数返回聚合的结果（或在使用 [-State](/sql-reference/aggregate-functions/combinators#-state) 组合器时返回最终状态）。

**语法**

```sql
finalizeAggregation(state)
```

**参数**

- `state` — 聚合的状态。[AggregateFunction](../data-types/aggregatefunction)。

**返回值**

- 被聚合的值/值。

:::note
返回类型与被聚合的任何类型相等。
:::

**示例**

查询:

```sql
SELECT finalizeAggregation(( SELECT countState(number) FROM numbers(10)));
```

结果:

```text
┌─finalizeAggregation(_subquery16)─┐
│                               10 │
└──────────────────────────────────┘
```

查询:

```sql
SELECT finalizeAggregation(( SELECT sumState(number) FROM numbers(10)));
```

结果:

```text
┌─finalizeAggregation(_subquery20)─┐
│                               45 │
└──────────────────────────────────┘
```

请注意，`NULL` 值会被忽略。

查询:

```sql
SELECT finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]));
```

结果:

```text
┌─finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]))─┐
│                                                          2 │
└────────────────────────────────────────────────────────────┘
```

组合示例:

查询:

```sql
WITH initializeAggregation('sumState', number) AS one_row_sum_state
SELECT
    number,
    finalizeAggregation(one_row_sum_state) AS one_row_sum,
    runningAccumulate(one_row_sum_state) AS cumulative_sum
FROM numbers(10);
```

结果:

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

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
- [initializeAggregation](#initializeaggregation)
## runningAccumulate {#runningaccumulate}

对数据块中每一行的聚合函数状态进行累积。

:::note
对于每个新的数据块，状态会被重置。
由于这种容易出错的行为，函数已被弃用，请改用适当的窗口函数。
:::

**语法**

```sql
runningAccumulate(agg_state[, grouping]);
```

**参数**

- `agg_state` — 聚合函数的状态。[AggregateFunction](../data-types/aggregatefunction)。
- `grouping` — 分组键。可选。如果 `grouping` 值发生变化，则函数的状态会被重置。可以是任何支持的数据类型，这些数据类型定义了相等操作符。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 每行结果包含聚合函数的结果，累积到当前行之前的所有输入行的结果。`runningAccumulate` 在每个新的数据块或在 `grouping` 值变化时重置状态。

返回类型取决于使用的聚合函数。

**示例**

考虑如何使用 `runningAccumulate` 找到不分组和分组情况下数字的累计总和。

查询:

```sql
SELECT k, runningAccumulate(sum_k) AS res FROM (SELECT number as k, sumState(k) AS sum_k FROM numbers(10) GROUP BY k ORDER BY k);
```

结果:

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

子查询生成每个数字 `0` 到 `9` 的 `sumState`。`sumState` 返回包含单个数字和的 [sum](../../sql-reference/aggregate-functions/reference/sum.md) 函数状态。

整个查询如下：

1. 对于第一行，`runningAccumulate` 取 `sumState(0)` 并返回 `0`。
2. 对于第二行，函数将 `sumState(0)` 和 `sumState(1)` 进行合并，得到 `sumState(0 + 1)`，返回 `1` 作为结果。
3. 对于第三行，函数合并 `sumState(0 + 1)` 与 `sumState(2)`，得到 `sumState(0 + 1 + 2)`，返回 `3` 作为结果。
4. 直到块结束，这些操作重复进行。

以下示例显示 `groupping` 参数的使用：

查询:

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

结果:

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

如您所见，`runningAccumulate` 分别为每组行合并状态。
## joinGet {#joinget}

该函数让您能够像从 [字典](../../sql-reference/dictionaries/index.md) 一样从表中提取数据。使用指定的连接键从 [Join](../../engines/table-engines/special/join.md#creating-a-table) 表中获取数据。

:::note
仅支持使用 `ENGINE = Join(ANY, LEFT, <join_keys>)` 语句创建的表。
:::

**语法**

```sql
joinGet(join_storage_table_name, `value_column`, join_keys)
```

**参数**

- `join_storage_table_name` — 指定要搜索的位置的 [标识符](/sql-reference/syntax#identifiers)。
- `value_column` — 表中包含所需数据的列的名称。
- `join_keys` — 键的列表。

:::note
标识符在默认数据库中进行查找（请参阅配置文件中的 `default_database` 设置）。要覆盖默认数据库，请使用 `USE db_name` 或通过分隔符 `db_name.db_table` 指定数据库和表，如示例所示。
:::

**返回值**

- 返回与键列表对应的值列表。

:::note
如果某个键在源表中不存在，则根据表创建过程中设置的 [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) 返回 `0` 或 `null`。
有关 `join_use_nulls` 的更多信息，请参阅 [Join 操作](../../engines/table-engines/special/join.md)。
:::

**示例**

输入表:

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

查询:

```sql
SELECT number, joinGet(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

结果:

```text
   ┌─number─┬─joinGet('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                  0 │
2. │      1 │                                                 11 │
3. │      2 │                                                 12 │
4. │      3 │                                                  0 │
   └────────┴────────────────────────────────────────────────────┘
```

在表创建过程中可以使用设置 `join_use_nulls` 来改变当源表中不存在键时返回的内容。

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

查询:

```sql
SELECT number, joinGet(db_test.id_val_nulls, 'val', toUInt32(number)) from numbers(4);
```

结果:

```text
   ┌─number─┬─joinGet('db_test.id_val_nulls', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
   └────────┴──────────────────────────────────────────────────────────┘
```
## joinGetOrNull {#joingetornull}

像 [joinGet](#joinget) 一样但当键缺失时返回 `NULL` 而不是返回默认值。

**语法**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**参数**

- `join_storage_table_name` — 指定要搜索的位置的 [标识符](/sql-reference/syntax#identifiers)。
- `value_column` — 表中包含所需数据的列的名称。
- `join_keys` — 键的列表。

:::note
标识符在默认数据库中进行查找（请参阅配置文件中的 `default_database` 设置）。要覆盖默认数据库，请使用 `USE db_name` 或通过分隔符 `db_name.db_table` 指定数据库和表，如示例所示。
:::

**返回值**

- 返回与键列表对应的值列表。

:::note
如果某个键在源表中不存在，则返回该键的 `NULL`。
:::

**示例**

输入表:

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

查询:

```sql
SELECT number, joinGetOrNull(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

结果:

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

评估一个外部 catboost 模型。[CatBoost](https://catboost.ai) 是 Yandex 开发的开源梯度提升库，用于机器学习。
接受 catboost 模型的路径和模型参数（特征）。返回 Float64。

**语法**

```sql
catboostEvaluate(path_to_model, feature_1, feature_2, ..., feature_n)
```

**示例**

```sql
SELECT feat1, ..., feat_n, catboostEvaluate('/path/to/model.bin', feat_1, ..., feat_n) AS prediction
FROM data_table
```

**前提条件**

1. 构建 catboost 评估库

在评估 catboost 模型之前，必须使 `libcatboostmodel.<so|dylib>` 库可用。请参阅 [CatBoost 文档](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html) 了解如何编译它。

接下来，在 ClickHouse 配置中指定 `libcatboostmodel.<so|dylib>` 的路径：

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

出于安全和隔离的原因，模型评估不会在服务器进程中运行，而是在 clickhouse-library-bridge 进程中运行。
在首次执行 `catboostEvaluate()` 时，如果库桥进程尚未运行，服务器将启动该流程。这两个进程通过 HTTP 接口进行通信。默认情况下，使用端口 `9012`。可以通过以下方式指定其他端口 - 这在端口 `9012` 已分配给其他服务时非常有用。

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. 使用 libcatboost 训练 catboost 模型

有关如何从训练数据集训练 catboost 模型，请参阅 [训练和应用模型](https://catboost.ai/docs/features/training.html#training)。
## throwIf {#throwif}

如果参数 `x` 为 true，则抛出异常。

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

结果:

```text
↙ Progress: 0.00 rows, 0.00 B (0.00 rows/s., 0.00 B/s.) Received exception from server (version 19.14.1):
Code: 395. DB::Exception: Received from localhost:9000. DB::Exception: Too many.
```
## identity {#identity}

返回其参数。用于调试和测试。允许取消使用索引，并获取完全扫描的查询性能。当查询分析可能使用索引时，分析器会忽略 `identity` 函数中的所有内容。还禁用了常量折叠。

**语法**

```sql
identity(x)
```

**示例**

查询:

```sql
SELECT identity(42);
```

结果:

```text
┌─identity(42)─┐
│           42 │
└──────────────┘
```
## getSetting {#getsetting}

返回当前 [自定义设置](/operations/settings/query-level#custom_settings) 的值。

**语法**

```sql
getSetting('custom_setting');
```

**参数**

- `custom_setting` — 设置名称。[String](../data-types/string.md)。

**返回值**

- 设置的当前值。

**示例**

查询:

```sql
SET custom_a = 123;
SELECT getSetting('custom_a');
```

结果:

```text
123
```

**另请参见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## getSettingOrDefault {#getsettingordefault}

返回当前 [自定义设置](/operations/settings/query-level#custom_settings) 的值或在当前配置文件中没有设置自定义设置时返回第二个参数中指定的默认值。

**语法**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**参数**

- `custom_setting` — 设置名称。[String](../data-types/string.md)。
- `default_value` — 如果未设置 custom_setting，则返回的值。该值可以是任何数据类型或 Null。

**返回值**

- 设置的当前值或如果未设置，则为 default_value。

**示例**

查询:

```sql
SELECT getSettingOrDefault('custom_undef1', 'my_value');
SELECT getSettingOrDefault('custom_undef2', 100);
SELECT getSettingOrDefault('custom_undef3', NULL);
```

结果:

```text
my_value
100
NULL
```

**另请参见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## isDecimalOverflow {#isdecimaloverflow}

检查 [Decimal](../data-types/decimal.md) 值是否超出其精度或超出指定的精度。

**语法**

```sql
isDecimalOverflow(d, [p])
```

**参数**

- `d` — 值。[Decimal](../data-types/decimal.md)。
- `p` — 精度。可选。如果省略，则使用第一个参数的初始精度。此参数可以在从/到另一个数据库或文件迁移数据时提供帮助。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- `1` — Decimal 值的数字超过其精度所允许的位数，
- `0` — Decimal 值满足指定的精度。

**示例**

查询:

```sql
SELECT isDecimalOverflow(toDecimal32(1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(1000000000, 0)),
       isDecimalOverflow(toDecimal32(-1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(-1000000000, 0));
```

结果:

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

- 位数。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

:::note
对于 `Decimal` 值，会考虑它们的比例：计算结果在其底层整数类型 `(value * scale)` 上。例如：`countDigits(42) = 2`，`countDigits(42.000) = 5`，`countDigits(0.04200) = 4`。也就是说，您可以通过 `countDecimal(x) > 18` 检查 `Decimal64` 的溢出。这是 [isDecimalOverflow](#isdecimaloverflow) 的慢变体。
:::

**示例**

查询:

```sql
SELECT countDigits(toDecimal32(1, 9)), countDigits(toDecimal32(-1, 9)),
       countDigits(toDecimal64(1, 18)), countDigits(toDecimal64(-1, 18)),
       countDigits(toDecimal128(1, 38)), countDigits(toDecimal128(-1, 38));
```

结果:

```text
10    10    19    19    39    39
```
## errorCodeToName {#errorcodetoname}

- 错误代码的文本名称。[LowCardinality(String)](../data-types/lowcardinality.md)。

**语法**

```sql
errorCodeToName(1)
```

结果:

```text
UNSUPPORTED_METHOD
```
## tcpPort {#tcpport}

返回此服务器侦听的 [native interface](../../interfaces/tcp.md) TCP 端口号。
如果在分布式表环境中执行，则此函数生成带有每个分片相关值的普通列。否则，它生成一个常量值。

**语法**

```sql
tcpPort()
```

**参数**

- 无。

**返回值**

- TCP 端口号。[UInt16](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT tcpPort();
```

结果:

```text
┌─tcpPort()─┐
│      9000 │
└───────────┘
```

**另请参见**

- [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)
## currentProfiles {#currentprofiles}

返回当前用户的当前 [设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 列表。

命令 [SET PROFILE](/sql-reference/functions/other-functions#currentprofiles) 可以用来更改当前设置配置文件。如果未使用 `SET PROFILE` 命令，该函数返回当前用户定义中指定的配置文件（参见 [CREATE USER](/sql-reference/statements/create/user)）。

**语法**

```sql
currentProfiles()
```

**返回值**

- 当前用户设置配置文件列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledProfiles {#enabledprofiles}

返回分配给当前用户的设置配置文件，包括明确和隐式分配的配置文件。显式分配的配置文件与 [currentProfiles](#currentprofiles) 函数返回的配置文件相同。隐式分配的配置文件包括已分配配置文件的父配置文件，通过授权角色分配的配置文件，通过自己的设置分配的配置文件，以及主默认配置文件（请参见主服务器配置文件中的 `default_profile` 部分）。

**语法**

```sql
enabledProfiles()
```

**返回值**

- 启用的设置配置文件列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultProfiles {#defaultprofiles}

返回在当前用户定义中指定的所有配置文件（参见 [CREATE USER](/sql-reference/statements/create/user) 语句）。

**语法**

```sql
defaultProfiles()
```

**返回值**

- 默认设置配置文件列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## currentRoles {#currentroles}

返回分配给当前用户的角色。可以通过 [SET ROLE](/sql-reference/statements/set-role) 语句更改角色。如果未执行 `SET ROLE` 语句，则函数 `currentRoles` 的返回结果与 `defaultRoles` 相同。

**语法**

```sql
currentRoles()
```

**返回值**

- 当前用户的当前角色列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledRoles {#enabledroles}

返回当前角色的名称，以及分配给某些当前角色的角色。

**语法**

```sql
enabledRoles()
```

**返回值**

- 当前用户的启用角色列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultRoles {#defaultroles}

返回默认情况下当前用户登录时启用的角色。这些角色最初是分配给当前用户的所有角色（请参阅 [GRANT](../../sql-reference/statements/grant.md#select)），但可以通过 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 语句进行更改。

**语法**

```sql
defaultRoles()
```

**返回值**

- 当前用户的默认角色列表。[Array](../data-types/array.md)([String](../data-types/string.md)).
## getServerPort {#getserverport}

返回服务器端口号。当端口未被服务器使用时，抛出异常。

**语法**

```sql
getServerPort(port_name)
```

**参数**

- `port_name` — 服务器端口的名称。[String](/sql-reference/data-types/string). 可能的值：

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

- 服务器端口的数字。[UInt16](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT getServerPort('tcp_port');
```

结果:

```text
┌─getServerPort('tcp_port')─┐
│ 9000                      │
└───────────────────────────┘
```
## queryID {#queryid}

返回当前查询的 ID。查询的其他参数可以通过 `query_id` 从 [system.query_log](../../operations/system-tables/query_log.md) 表中提取。

与 [initialQueryID](#initialqueryid) 函数相比，`queryID` 在不同分片上可能返回不同的结果（见示例）。

**语法**

```sql
queryID()
```

**返回值**

- 当前查询的 ID。[String](../data-types/string.md)

**示例**

查询:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT queryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果:

```text
┌─count()─┐
│ 3       │
└─────────┘
```
## initialQueryID {#initialqueryid}

返回初始当前查询的 ID。查询的其他参数可以通过 `initial_query_id` 从 [system.query_log](../../operations/system-tables/query_log.md) 表中提取。

与 [queryID](/sql-reference/functions/other-functions#queryid) 函数相比，`initialQueryID` 在不同分片上返回相同的结果（见示例）。

**语法**

```sql
initialQueryID()
```

**返回值**

- 初始当前查询的 ID。[String](../data-types/string.md)

**示例**

查询:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果:

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## initialQueryStartTime {#initialquerystarttime}

返回初始当前查询的开始时间。

`initialQueryStartTime` 在不同分片上返回相同的结果（见示例）。

**语法**

```sql
initialQueryStartTime()
```

**返回值**

- 初始当前查询的开始时间。[DateTime](../data-types/datetime.md)

**示例**

查询:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryStartTime() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

结果:

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## partitionID {#partitionid}

计算 [分区 ID](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)。

:::note
此函数很慢，不应该在大量行上调用。
:::

**语法**

```sql
partitionID(x[, y, ...]);
```

**参数**

- `x` — 要返回分区 ID 的列。
- `y, ...` — 要返回分区 ID 的剩余 N 列（可选）。

**返回值**

- 行所属的分区 ID。[String](../data-types/string.md)。

**示例**

查询:

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

结果:

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

返回在分布式查询中处理部分数据的分片索引。索引从 `1` 开始。
如果查询未分布，则返回常量值 `0`。

**语法**

```sql
shardNum()
```

**返回值**

- 分片索引或常量 `0`。[UInt32](../data-types/int-uint.md)。

**示例**

在以下示例中，使用两个分片的配置。查询在每个分片上执行 [system.one](../../operations/system-tables/one.md) 表。

查询:

```sql
CREATE TABLE shard_num_example (dummy UInt8)
    ENGINE=Distributed(test_cluster_two_shards_localhost, system, one, dummy);
SELECT dummy, shardNum(), shardCount() FROM shard_num_example;
```

结果:

```text
┌─dummy─┬─shardNum()─┬─shardCount()─┐
│     0 │          2 │            2 │
│     0 │          1 │            2 │
└───────┴────────────┴──────────────┘
```

**另请参见**

- [分布式表引擎](../../engines/table-engines/special/distributed.md)
## shardCount {#shardcount}

返回分布式查询的总分片数。
如果查询未分布，则返回常量值 `0`。

**语法**

```sql
shardCount()
```

**返回值**

- 总分片数或 `0`。[UInt32](../data-types/int-uint.md)。

**另请参见**

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

查询:

```sql
SELECT getOSKernelVersion();
```

结果:

```text
┌─getOSKernelVersion()────┐
│ Linux 4.15.0-55-generic │
└─────────────────────────┘
```
## zookeeperSessionUptime {#zookeepersessionuptime}

返回当前 ZooKeeper 会话的运行时间（以秒为单位）。

**语法**

```sql
zookeeperSessionUptime()
```

**参数**

- 无。

**返回值**

- 当前 ZooKeeper 会话的运行时间（以秒为单位）。[UInt32](../data-types/int-uint.md)。

**示例**

查询:

```sql
SELECT zookeeperSessionUptime();
```

结果:

```text
┌─zookeeperSessionUptime()─┐
│                      286 │
└──────────────────────────┘
```
## generateRandomStructure {#generaterandomstructure}

生成随机的表结构，格式为 `column1_name column1_type, column2_name column2_type, ...`。

**语法**

```sql
generateRandomStructure([number_of_columns, seed])
```

**参数**

- `number_of_columns` — 结果表结构中的所需列数。如果设置为 0 或 `Null`，列数将随机确定为 1 到 128。默认值：`Null`。
- `seed` - 用于生成稳定结果的随机种子。如果未指定种子或将其设置为 `Null`，则生成随机种子。

所有参数必须为常量。

**返回值**

- 随机生成的表结构。[String](../data-types/string.md)。

**示例**

查询:

```sql
SELECT generateRandomStructure()
```

结果:

```text
┌─generateRandomStructure()─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal32(5), c2 Date, c3 Tuple(LowCardinality(String), Int128, UInt64, UInt16, UInt8, IPv6), c4 Array(UInt128), c5 UInt32, c6 IPv4, c7 Decimal256(64), c8 Decimal128(3), c9 UInt256, c10 UInt64, c11 DateTime │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询:

```sql
SELECT generateRandomStructure(1)
```

结果:

```text
┌─generateRandomStructure(1)─┐
│ c1 Map(UInt256, UInt16)    │
└────────────────────────────┘
```

查询:

```sql
SELECT generateRandomStructure(NULL, 33)
```

结果:

```text
┌─generateRandomStructure(NULL, 33)─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 DateTime, c2 Enum8('c2V0' = 0, 'c2V1' = 1, 'c2V2' = 2, 'c2V3' = 3), c3 LowCardinality(Nullable(FixedString(30))), c4 Int16, c5 Enum8('c5V0' = 0, 'c5V1' = 1, 'c5V2' = 2, 'c5V3' = 3), c6 Nullable(UInt8), c7 String, c8 Nested(e1 IPv4, e2 UInt8, e3 UInt16, e4 UInt16, e5 Int32, e6 Map(Date, Decimal256(70))) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**注意**: 复杂类型（数组、元组、映射、嵌套）的最大嵌套深度限制为 16。

此函数可以与 [generateRandom](../../sql-reference/table-functions/generate.md) 一起使用，以生成完全随机的表。
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

查询:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

结果:

```text
@0xf96402dd754d0eb7;

struct Message
{
    column1 @0 : Data;
    column2 @1 : UInt32;
    column3 @2 : List(Data);
}
```

查询:

```sql
SELECT structureToCapnProtoSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

结果:

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

查询:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

结果:

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

查询:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

结果:

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    uint32 column2 = 2;
    repeated bytes column3 = 3;
}
```

查询:

```sql
SELECT structureToProtobufSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

结果:

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

查询:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

结果:

```text
syntax = "proto3";

message Root
{
    bytes column1 = 1;
    uint32 column2 = 2;
}
```
## formatQuery {#formatquery}

返回给定 SQL 查询的格式化版本，可能是多行。

如果查询不规范，则抛出异常。可以使用 `formatQueryOrNull()` 函数以返回 `NULL` 作为替代。

**语法**

```sql
formatQuery(query)
formatQueryOrNull(query)
```

**参数**

- `query` - 要格式化的 SQL 查询。[String](../data-types/string.md)

**返回值**

- 格式化查询。[String](../data-types/string.md)。

**示例**

查询:

```sql
SELECT formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

结果:

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

如果查询格式不正确，则会抛出异常。要返回 `NULL`，可以使用 `formatQuerySingleLineOrNull()` 函数。

**语法**

```sql
formatQuerySingleLine(query)
formatQuerySingleLineOrNull(query)
```

**参数**

- `query` - 要格式化的 SQL 查询。 [String](../data-types/string.md)

**返回值**

- 格式化后的查询。 [String](../data-types/string.md)。

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

- `variant` — Variant 列。 [Variant](../data-types/variant.md)。
- `type_name` — 要提取的变体类型名称。 [String](../data-types/string.md)。
- `default_value` - 如果变体中没有指定类型的变体，则使用的默认值。可以是任意类型。可选。

**返回值**

- 具有指定类型的 `Variant` 列的子列。

**示例**

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

- `variant` — Variant 列。 [Variant](../data-types/variant.md)。

**返回值**

- Enum8 列，每行的变体类型名称。

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

使用 [这篇文章](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a) 中描述的公式。假设处理组和对照组的大小相同。返回一个组所需的样本量（即整个实验所需的样本量是返回值的两倍）。

**参数**

- `baseline` — 基线转化率。 [Float](../data-types/float.md)。
- `mde` — 检测到的最小效果（MDE），以百分比点表示（例如，对于基线转化率 0.25，MDE 0.03 表示期望变更为 0.25 ± 0.03）。 [Float](../data-types/float.md)。
- `power` — 测试所需的统计功效（1 - 类型 II 错误的概率）。 [Float](../data-types/float.md)。
- `alpha` — 测试所需的显著性水平（类型 I 错误的概率）。 [Float](../data-types/float.md)。

**返回值**

一个命名的 [Tuple](../data-types/tuple.md)，包含 3 个元素：

- `"minimum_sample_size"` — 所需的样本量。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 在返回的所需样本量下不可检测的值范围的下限（即所有小于或等于 `"detect_range_lower"` 的值都是使用提供的 `alpha` 和 `power` 可检测的）。计算公式为 `baseline - mde`。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 在返回的所需样本量下不可检测的值范围的上限（即所有大于或等于 `"detect_range_upper"` 的值都是使用提供的 `alpha` 和 `power` 可检测的）。计算公式为 `baseline + mde`。 [Float64](../data-types/float.md)。

**示例**

以下查询计算基线转化率为 25%、MDE 为 3%、显著性水平为 5% 且所需统计功效为 80%的 A/B 测试所需的样本量：

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

```sql
minSampleSizeContinous(baseline, sigma, mde, power, alpha)
```

别名：`minSampleSizeContinous`

使用 [这篇文章](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a) 中描述的公式。假设处理组和对照组的大小相同。返回一个组所需的样本量（即整个实验所需的样本量是返回值的两倍）。还假设处理组和对照组中的测试指标方差相等。

**参数**

- `baseline` — 指标的基线值。 [Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `sigma` — 指标的基线标准差。 [Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `mde` — 检测到的最小效果（MDE），以基线值的百分比表示（例如，对于基线值 112.25，MDE 0.03 表示期望变更为 112.25 ± 112.25\*0.03）。 [Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `power` — 测试所需的统计功效（1 - 类型 II 错误的概率）。 [Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。
- `alpha` — 测试所需的显著性水平（类型 I 错误的概率）。 [Integer](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。

**返回值**

一个命名的 [Tuple](../data-types/tuple.md)，包含 3 个元素：

- `"minimum_sample_size"` — 所需的样本量。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 在返回的所需样本量下不可检测的值范围的下限（即所有小于或等于 `"detect_range_lower"` 的值都是使用提供的 `alpha` 和 `power` 可检测的）。计算公式为 `baseline * (1 - mde)`。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 在返回的所需样本量下不可检测的值范围的上限（即所有大于或等于 `"detect_range_upper"` 的值都是使用提供的 `alpha` 和 `power` 可检测的）。计算公式为 `baseline * (1 + mde)`。 [Float64](../data-types/float.md)。

**示例**

以下查询计算基线值为 112.25、标准差为 21.1、MDE 为 3%、显著性水平为 5% 且所需统计功效为 80% 的指标的 A/B 测试所需的样本量：

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

别名：`connection_id`。

**参数**

无。

**返回值**

当前连接 ID。 [UInt64](../data-types/int-uint.md)。

**实现细节**

此函数在调试场景中或 MySQL 处理程序的内部用途中特别有用。它是为与 [MySQL 的 `CONNECTION_ID` 函数](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_connection-id) 兼容而创建的。通常在生产查询中不使用。

**示例**

查询：

```sql
SELECT connectionId();
```

```response
0
```
## getClientHTTPHeader {#getclienthttpheader}

获取 HTTP 头的值。

如果没有该头或当前请求不是通过 HTTP 接口进行的，则该函数返回空字符串。某些 HTTP 头（例如，`Authentication` 和 `X-ClickHouse-*`）是受限的。

该函数需要设置 `allow_get_client_http_header` 启用。出于安全原因，该设置默认未启用，因为某些头（例如，`Cookie`）可能包含敏感信息。

对于此函数，HTTP 头是区分大小写的。

如果该函数在分布式查询的上下文中使用，则仅在发起节点上返回非空结果。
## showCertificate {#showcertificate}

如果当前服务器的安全套接字层（SSL）证书已配置，则显示有关其的信息。有关如何配置 ClickHouse 以使用 OpenSSL 证书验证连接的更多信息，请参见 [Configuring SSL-TLS](/guides/sre/configuring-ssl)。

**语法**

```sql
showCertificate()
```

**返回值**

- 与配置的 SSL 证书相关的键值对地图。 [Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md))。

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

返回 [LowCardinality](../data-types/lowcardinality.md) 列中值在字典中的位置。位置从 1 开始。由于 LowCardinality 具有每个部分的字典，因此该函数可能会在不同的部分中返回相同值的不同位置。

**语法**

```sql
lowCardinalityIndices(col)
```

**参数**

- `col` — 低基数列。 [LowCardinality](../data-types/lowcardinality.md)。

**返回值**

- 当前部分字典中值的位置。 [UInt64](../data-types/int-uint.md)。

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

返回 [LowCardinality](../data-types/lowcardinality.md) 列的字典值。如果块的大小小于或大于字典大小，结果将被截断或用默认值扩展。由于 LowCardinality 具有每个部分的字典，因此该函数可能会在不同的部分中返回不同的字典值。

**语法**

```sql
lowCardinalityIndices(col)
```

**参数**

- `col` — 低基数列。 [LowCardinality](../data-types/lowcardinality.md)。

**返回值**

- 字典键。 [UInt64](../data-types/int-uint.md)。

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

返回 [config](/operations/configuration-files) 中的 `display_name` 的值，或者如果未设置，则返回服务器的完全合格域名 (FQDN)。

**语法**

```sql
displayName()
```

**返回值**

- 配置中 `display_name` 的值或服务器 FQDN（如果未设置）。 [String](../data-types/string.md)。

**示例**

在 `config.xml` 中可以设置 `display_name`。以配置为 'production' 的服务器为例：

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
此函数是实验性功能集的一部分。通过将此设置添加到配置中来启用实验性事务支持：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见页面 [Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)。
:::

**语法**

```sql
transactionID()
```

**返回值**

- 返回由 `start_csn`、`local_tid` 和 `host_id` 组成的元组。 [Tuple](../data-types/tuple.md)。

- `start_csn`: 全局顺序号，表示此事务开始时看到的最新提交时间戳。 [UInt64](../data-types/int-uint.md)。
- `local_tid`: 每个事务在特定 `start_csn` 内由此主机启动的唯一局部顺序号。 [UInt64](../data-types/int-uint.md)。
- `host_id`: 启动此事务的主机的 UUID。 [UUID](../data-types/uuid.md)。

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
此函数是实验性功能集的一部分。通过将此设置添加到配置中来启用实验性事务支持：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见页面 [Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)。
:::

**语法**

```sql
transactionLatestSnapshot()
```

**返回值**

- 返回一个事务的最新快照（CSN）。 [UInt64](../data-types/int-uint.md)

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

返回可用于某些运行中的 [transaction](/guides/developer/transactional#transactions-commit-and-rollback) 的最旧快照（提交序列号）。

:::note
此函数是实验性功能集的一部分。通过将此设置添加到配置中来启用实验性事务支持：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

有关更多信息，请参见页面 [Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)。
:::

**语法**

```sql
transactionOldestSnapshot()
```

**返回值**

- 返回一个事务的最旧快照（CSN）。 [UInt64](../data-types/int-uint.md)

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

接受一个表表达式或标识符及一个常量字符串作为子列名称，并返回从表达式中提取的请求的子列。

**语法**

```sql
getSubcolumn(col_name, subcol_name)
```

**参数**

- `col_name` — 表表达式或标识符。 [Expression](../syntax.md/#expressions), [Identifier](../syntax.md/#identifiers)。
- `subcol_name` — 子列的名称。 [String](../data-types/string.md)。

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
此函数仅供开发人员使用。
:::

**语法**

```sql
getTypeSerializationStreams(col)
```

**参数**

- `col` — 列或数据类型的字符串表示形式，从中检测数据类型。

**返回值**

- 返回包含所有序列化子流路径的数组。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

接受一个常量字符串参数并返回该名称的全局变量值。此函数旨在与 MySQL 兼容，对于 ClickHouse 的正常操作并不需要或有用。仅定义了几个虚拟全局变量。

**语法**

```sql
globalVariable(name)
```

**参数**

- `name` — 全局变量名称。 [String](../data-types/string.md)。

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

返回指定数据库中最大表名称长度。

**语法**

```sql
getMaxTableNameLengthForDatabase(database_name)
```

**参数**

- `database_name` — 指定数据库的名称。 [String](../data-types/string.md)。

**返回值**

- 返回最大表名称的长度。

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

返回服务器设置之一的当前值。

**语法**

```sql
getServerSetting('server_setting');
```

**参数**

- `server_setting` — 设置名称。 [String](../data-types/string.md)。

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

- `merge_tree_setting` — 设置名称。 [String](../data-types/string.md)。

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
