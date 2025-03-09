slug: '/sql-reference/functions/string-functions'
sidebar_position: 170
sidebar_label: '字符串'
---

import VersionBadge from '@theme/badges/VersionBadge';

# 字符串操作函数

有关在字符串中 [搜索](string-search-functions.md) 和 [替换](string-replace-functions.md) 的函数单独进行了描述。
## empty {#empty}

检查输入字符串是否为空。如果字符串包含至少一个字节，即使该字节是空格或空字节，也被视为非空。

此函数也适用于 [数组](/sql-reference/functions/array-functions#empty) 和 [UUID](uuid-functions.md#empty)。

**语法**

``` sql
empty(x)
```

**参数**

- `x` — 输入值。 [字符串](../data-types/string.md)。

**返回值**

- 为空字符串时返回 `1`，非空字符串时返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT empty('');
```

结果：

```result
┌─empty('')─┐
│         1 │
└───────────┘
```
## notEmpty {#notempty}

检查输入字符串是否非空。如果字符串包含至少一个字节，即使该字节是空格或空字节，也被视为非空。

此函数也适用于 [数组](/sql-reference/functions/array-functions#notempty) 和 [UUID](uuid-functions.md#notempty)。

**语法**

``` sql
notEmpty(x)
```

**参数**

- `x` — 输入值。 [字符串](../data-types/string.md)。

**返回值**

- 非空字符串时返回 `1`，空字符串时返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT notEmpty('text');
```

结果：

```result
┌─notEmpty('text')─┐
│                1 │
└──────────────────┘
```
## length {#length}

返回字符串的字节长度而不是字符或Unicode代码点的数量。该函数也适用于数组。

别名: `OCTET_LENGTH`

**语法**

```sql
length(s)
```

**参数**

- `s` — 输入字符串或数组。 [字符串](../data-types/string)/[数组](../data-types/array)。

**返回值**

- 字符串或数组 `s` 的字节长度。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT length('Hello, world!');
```

结果：

```response
┌─length('Hello, world!')─┐
│                      13 │
└─────────────────────────┘
```

查询：

```sql
SELECT length([1, 2, 3, 4]);
```

结果：

```response
┌─length([1, 2, 3, 4])─┐
│                    4 │
└──────────────────────┘
```
## lengthUTF8 {#lengthutf8}

返回字符串在Unicode代码点中的长度，而不是在字节或字符中。假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

别名：
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**语法**

```sql
lengthUTF8(s)
```

**参数**

- `s` — 包含有效UTF-8编码文本的字符串。 [字符串](../data-types/string.md)。

**返回值**

- 字符串 `s` 在Unicode代码点中的长度。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT lengthUTF8('Здравствуй, мир!');
```

结果：

```response
┌─lengthUTF8('Здравствуй, мир!')─┐
│                             16 │
└────────────────────────────────┘
```
## left {#left}

返回字符串 `s` 的子字符串，指定的 `offset` 从左侧开始。

**语法**

``` sql
left(s, offset)
```

**参数**

- `s` — 计算子字符串的字符串。 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。
- `offset` — 偏移量的字节数。 [(U)Int*](../data-types/int-uint.md)。

**返回值**

- 对于正的 `offset`：返回 `s` 的子字符串，包含 `offset` 个字节，从字符串的左侧开始。
- 对于负的 `offset`：返回 `s` 的子字符串，包含 `length(s) - |offset|` 个字节，从字符串的左侧开始。
- 如果 `length` 为 0，则返回空字符串。

**示例**

查询：

```sql
SELECT left('Hello', 3);
```

结果：

```response
Hel
```

查询：

```sql
SELECT left('Hello', -3);
```

结果：

```response
He
```
## leftUTF8 {#leftutf8}

返回UTF-8编码字符串 `s` 的子字符串，指定的 `offset` 从左侧开始。

**语法**

``` sql
leftUTF8(s, offset)
```

**参数**

- `s` — 计算子字符串的UTF-8编码字符串。 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。
- `offset` — 偏移量的字节数。 [(U)Int*](../data-types/int-uint.md)。

**返回值**

- 对于正的 `offset`：返回 `s` 的子字符串，包含 `offset` 个字节，从字符串的左侧开始。
- 对于负的 `offset`：返回 `s` 的子字符串，包含 `length(s) - |offset|` 个字节，从字符串的左侧开始。
- 如果 `length` 为 0，则返回空字符串。

**示例**

查询：

```sql
SELECT leftUTF8('Привет', 4);
```

结果：

```response
Прив
```

查询：

```sql
SELECT leftUTF8('Привет', -4);
```

结果：

```response
Пр
```
## leftPad {#leftpad}

从左侧用空格或指定的字符串（如有必要可多次填充）填充字符串，直到结果字符串达到指定的 `length`。

**语法**

``` sql
leftPad(string, length[, pad_string])
```

别名: `LPAD`

**参数**

- `string` — 应该被填充的输入字符串。 [字符串](../data-types/string.md)。
- `length` — 结果字符串的长度。 [UInt或Int](../data-types/int-uint.md)。如果值小于输入字符串长度，则输入字符串将缩短为 `length` 个字符。
- `pad_string` — 用于填充输入字符串的字符串。 [字符串](../data-types/string.md)。可选。如果未指定，则对输入字符串进行空格填充。

**返回值**

- 给定长度的左填充字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT leftPad('abc', 7, '*'), leftPad('def', 7);
```

结果：

```result
┌─leftPad('abc', 7, '*')─┬─leftPad('def', 7)─┐
│ ****abc                │     def           │
└────────────────────────┴───────────────────┘
```
## leftPadUTF8 {#leftpadutf8}

从左侧用空格或指定的字符串（如有必要可多次填充）填充字符串，直到结果字符串达到指定的长度。与 [leftPad](#leftpad) 不同，测量字符串长度是按代码点计算的。

**语法**

``` sql
leftPadUTF8(string, length[, pad_string])
```

**参数**

- `string` — 应该被填充的输入字符串。 [字符串](../data-types/string.md)。
- `length` — 结果字符串的长度。 [UInt或Int](../data-types/int-uint.md)。如果值小于输入字符串长度，则输入字符串将缩短为 `length` 个字符。
- `pad_string` — 用于填充输入字符串的字符串。 [字符串](../data-types/string.md)。可选。如果未指定，则对输入字符串进行空格填充。

**返回值**

- 给定长度的左填充字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT leftPadUTF8('абвг', 7, '*'), leftPadUTF8('дежз', 7);
```

结果：

```result
┌─leftPadUTF8('абвг', 7, '*')─┬─leftPadUTF8('дежз', 7)─┐
│ ***абвг                     │    дежз                │
└─────────────────────────────┴────────────────────────┘
```
## right {#right}

返回字符串 `s` 的子字符串，指定的 `offset` 从右侧开始。

**语法**

``` sql
right(s, offset)
```

**参数**

- `s` — 计算子字符串的字符串。 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。
- `offset` — 偏移量的字节数。 [(U)Int*](../data-types/int-uint.md)。

**返回值**

- 对于正的 `offset`：返回 `s` 的子字符串，包含 `offset` 个字节，从字符串的右侧开始。
- 对于负的 `offset`：返回 `s` 的子字符串，包含 `length(s) - |offset|` 个字节，从字符串的右侧开始。
- 如果 `length` 为 0，则返回空字符串。

**示例**

查询：

```sql
SELECT right('Hello', 3);
```

结果：

```response
llo
```

查询：

```sql
SELECT right('Hello', -3);
```

结果：

```response
lo
```
## rightUTF8 {#rightutf8}

返回UTF-8编码字符串 `s` 的子字符串，指定的 `offset` 从右侧开始。

**语法**

``` sql
rightUTF8(s, offset)
```

**参数**

- `s` — 计算子字符串的UTF-8编码字符串。 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。
- `offset` — 偏移量的字节数。 [(U)Int*](../data-types/int-uint.md)。

**返回值**

- 对于正的 `offset`：返回 `s` 的子字符串，包含 `offset` 个字节，从字符串的右侧开始。
- 对于负的 `offset`：返回 `s` 的子字符串，包含 `length(s) - |offset|` 个字节，从字符串的右侧开始。
- 如果 `length` 为 0，则返回空字符串。

**示例**

查询：

```sql
SELECT rightUTF8('Привет', 4);
```

结果：

```response
ивет
```

查询：

```sql
SELECT rightUTF8('Привет', -4);
```

结果：

```response
ет
```
## rightPad {#rightpad}

从右侧用空格或指定的字符串（如有必要可多次填充）填充字符串，直到结果字符串达到指定的 `length`。

**语法**

``` sql
rightPad(string, length[, pad_string])
```

别名: `RPAD`

**参数**

- `string` — 应该被填充的输入字符串。 [字符串](../data-types/string.md)。
- `length` — 结果字符串的长度。 [UInt或Int](../data-types/int-uint.md)。如果值小于输入字符串长度，则输入字符串将缩短为 `length` 个字符。
- `pad_string` — 用于填充输入字符串的字符串。 [字符串](../data-types/string.md)。可选。如果未指定，则对输入字符串进行空格填充。

**返回值**

- 给定长度的填充字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT rightPad('abc', 7, '*'), rightPad('abc', 7);
```

结果：

```result
┌─rightPad('abc', 7, '*')─┬─rightPad('abc', 7)─┐
│ abc****                 │ abc                │
└─────────────────────────┴────────────────────┘
```
## rightPadUTF8 {#rightpadutf8}

从右侧用空格或指定的字符串（如有必要可多次填充）填充字符串，直到结果字符串达到指定的长度。与 [rightPad](#rightpad) 不同，测量字符串长度是按代码点计算的。

**语法**

``` sql
rightPadUTF8(string, length[, pad_string])
```

**参数**

- `string` — 应该被填充的输入字符串。 [字符串](../data-types/string.md)。
- `length` — 结果字符串的长度。 [UInt或Int](../data-types/int-uint.md)。如果值小于输入字符串长度，则输入字符串将缩短为 `length` 个字符。
- `pad_string` — 用于填充输入字符串的字符串。 [字符串](../data-types/string.md)。可选。如果未指定，则对输入字符串进行空格填充。

**返回值**

- 给定长度的填充字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT rightPadUTF8('абвг', 7, '*'), rightPadUTF8('абвг', 7);
```

结果：

```result
┌─rightPadUTF8('абвг', 7, '*')─┬─rightPadUTF8('абвг', 7)─┐
│ абвг***                      │ абвг                    │
└──────────────────────────────┴─────────────────────────┘
```
## compareSubstrings {#comparesubstrings}

按字典顺序比较两个字符串。

**语法**

```sql
compareSubstrings(string1, string2, string1_offset, string2_offset, num_bytes);
```

**参数**

- `string1` — 第一个待比较的字符串。 [字符串](../data-types/string.md)
- `string2` - 第二个待比较的字符串。 [字符串](../data-types/string.md)
- `string1_offset` — 在 `string1` 中开始比较的位置（从零开始）。 [UInt*](../data-types/int-uint.md)。
- `string2_offset` — 在 `string2` 中开始比较的位置（从零开始）。 [UInt*](../data-types/int-uint.md)。
- `num_bytes` — 在两个字符串中要比较的最大字节数。如果 `string_offset` + `num_bytes` 超过输入字符串的结尾，`num_bytes` 将相应减少。 [UInt*](../data-types/int-uint.md)。

**返回值**

- -1 — 如果 `string1`[`string1_offset` : `string1_offset` + `num_bytes`] < `string2`[`string2_offset` : `string2_offset` + `num_bytes`]。
- 0 — 如果 `string1`[`string1_offset` : `string1_offset` + `num_bytes`] = `string2`[`string2_offset` : `string2_offset` + `num_bytes`]。
- 1 — 如果 `string1`[`string1_offset` : `string1_offset` + `num_bytes`] > `string2`[`string2_offset` : `string2_offset` + `num_bytes`]。

**示例**

查询：

```sql
SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result,
```

结果：

```result
┌─result─┐
│      0 │
└────────┘
```
## lower {#lower}

将字符串中的ASCII拉丁符号转换为小写。

**语法**

``` sql
lower(input)
```

别名: `lcase`

**参数**

- `input`: 字符串类型 [字符串](../data-types/string.md)。

**返回值**

- [字符串](../data-types/string.md) 数据类型的值。

**示例**

查询：

```sql
SELECT lower('CLICKHOUSE');
```

```response
┌─lower('CLICKHOUSE')─┐
│ clickhouse          │
└─────────────────────┘
```
## upper {#upper}

将字符串中的ASCII拉丁符号转换为大写。

**语法**

``` sql
upper(input)
```

别名: `ucase`

**参数**

- `input` — 字符串类型 [字符串](../data-types/string.md)。

**返回值**

- [字符串](../data-types/string.md) 数据类型的值。

**示例**

查询：

```sql
SELECT upper('clickhouse');
```

``` response
┌─upper('clickhouse')─┐
│ CLICKHOUSE          │
└─────────────────────┘
```
## lowerUTF8 {#lowerutf8}

将字符串转换为小写，假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

:::note
不会检测语言，例如，对于土耳其语，结果可能不完全正确（i/İ vs. i/I）。如果某个代码点的UTF-8字节序列的大写和小写长度不同（如 `ẞ` 和 `ß`），则该代码点的结果可能不正确。
:::

**语法**

```sql
lowerUTF8(input)
```

**参数**

- `input` — 字符串类型 [字符串](../data-types/string.md)。

**返回值**

- [字符串](../data-types/string.md) 数据类型的值。

**示例**

查询：

```sql
SELECT lowerUTF8('MÜNCHEN') as Lowerutf8;
```

结果：

``` response
┌─Lowerutf8─┐
│ münchen   │
└───────────┘
```
## upperUTF8 {#upperutf8}

将字符串转换为大写，假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

:::note
不会检测语言，例如，对于土耳其语，结果可能不完全正确（i/İ vs. i/I）。如果某个代码点的UTF-8字节序列的大写和小写长度不同（如 `ẞ` 和 `ß`），则该代码点的结果可能不正确。
:::

**语法**

```sql
upperUTF8(input)
```

**参数**

- `input` — 字符串类型 [字符串](../data-types/string.md)。

**返回值**

- [字符串](../data-types/string.md) 数据类型的值。

**示例**

查询：

```sql
SELECT upperUTF8('München') as Upperutf8;
```

结果：

``` response
┌─Upperutf8─┐
│ MÜNCHEN   │
└───────────┘
```
## isValidUTF8 {#isvalidutf8}

如果字节集合构成有效的UTF-8编码文本，则返回 1；否则返回 0。

**语法**

``` sql
isValidUTF8(input)
```

**参数**

- `input` — 字符串类型 [字符串](../data-types/string.md)。

**返回值**

- 如果字节集合构成有效的UTF-8编码文本，则返回 `1`，否则返回 `0`。

查询：

``` sql
SELECT isValidUTF8('\xc3\xb1') AS valid, isValidUTF8('\xc3\x28') AS invalid;
```

结果：

``` response
┌─valid─┬─invalid─┐
│     1 │       0 │
└───────┴─────────┘
```
## toValidUTF8 {#tovalidutf8}

将无效的UTF-8字符替换为 `�` (U+FFFD) 字符。所有连在一起的无效字符都会合并成一个替代字符。

**语法**

``` sql
toValidUTF8(input_string)
```

**参数**

- `input_string` — 任何字节集合，表示为 [字符串](../data-types/string.md) 数据类型对象。

**返回值**

- 一个有效的UTF-8字符串。

**示例**

``` sql
SELECT toValidUTF8('\x61\xF0\x80\x80\x80b');
```

```result
┌─toValidUTF8('a����b')─┐
│ a�b                   │
└───────────────────────┘
```
## repeat {#repeat}

按指定次数与自身连接字符串。

**语法**

``` sql
repeat(s, n)
```

别名: `REPEAT`

**参数**

- `s` — 要重复的字符串。 [字符串](../data-types/string.md)。
- `n` — 重复字符串的次数。 [UInt* 或 Int*](../data-types/int-uint.md)。

**返回值**

一个包含字符串 `s` 重复 `n` 次的字符串。如果 `n` &lt;= 0，函数返回空字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT repeat('abc', 10);
```

结果：

```result
┌─repeat('abc', 10)──────────────┐
│ abcabcabcabcabcabcabcabcabcabc │
└────────────────────────────────┘
```
## space {#space}

连接一个空格(` `)，按指定次数与自身连接。

**语法**

``` sql
space(n)
```

别名: `SPACE`.

**参数**

- `n` — 重复空格的次数。 [UInt* 或 Int*](../data-types/int-uint.md)。

**返回值**

一个包含字符串 ` ` 重复 `n` 次的字符串。如果 `n` &lt;= 0，函数返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

``` sql
SELECT space(3);
```

结果：

``` text
┌─space(3) ────┐
│              │
└──────────────┘
```
## reverse {#reverse}

反转字符串中的字节序列。
## reverseUTF8 {#reverseutf8}

反转字符串中的Unicode代码点序列。假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。
## concat {#concat}

连接给定的参数。

**语法**

``` sql
concat(s1, s2, ...)
```

**参数**

任意类型的值。

非 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md) 类型的参数会使用其默认序列化转换为字符串。由于这会降低性能，因此不建议使用非String/FixedString参数。

**返回值**

由连接参数创建的字符串。

如果任何参数为 `NULL`，函数将返回 `NULL`。

**示例**

查询：

``` sql
SELECT concat('Hello, ', 'World!');
```

结果：

```result
┌─concat('Hello, ', 'World!')─┐
│ Hello, World!               │
└─────────────────────────────┘
```

查询：

```sql
SELECT concat(42, 144);
```

结果：

```result
┌─concat(42, 144)─┐
│ 42144           │
└─────────────────┘
```

:::note `||` 运算符
使用 `||` 运算符进行字符串连接，作为 `concat()` 的简洁替代。例如，`'Hello, ' || 'World!'` 相当于 `concat('Hello, ', 'World!')`。
:::
## concatAssumeInjective {#concatassumeinjective}

与 [concat](#concat) 相似，但假设 `concat(s1, s2, ...) → sn` 是单射。可以用于优化 GROUP BY。

如果函数对不同的参数返回不同的结果，则称该函数为单射。换句话说：不同的参数永远不会产生相同的结果。

**语法**

``` sql
concatAssumeInjective(s1, s2, ...)
```

**参数**

字符串或固定字符串类型的值。

**返回值**

由连接参数创建的字符串。

如果任何参数值为 `NULL`，该函数将返回 `NULL`。

**示例**

输入表：

``` sql
CREATE TABLE key_val(`key1` String, `key2` String, `value` UInt32) ENGINE = TinyLog;
INSERT INTO key_val VALUES ('Hello, ','World',1), ('Hello, ','World',2), ('Hello, ','World!',3), ('Hello',', World!',2);
SELECT * from key_val;
```

```result
┌─key1────┬─key2─────┬─value─┐
│ Hello,  │ World    │     1 │
│ Hello,  │ World    │     2 │
│ Hello,  │ World!   │     3 │
│ Hello   │ , World! │     2 │
└─────────┴──────────┴───────┘
```

``` sql
SELECT concat(key1, key2), sum(value) FROM key_val GROUP BY concatAssumeInjective(key1, key2);
```

结果：

```result
┌─concat(key1, key2)─┬─sum(value)─┐
│ Hello, World!      │          3 │
│ Hello, World!      │          2 │
│ Hello, World       │          3 │
└────────────────────┴────────────┘
```
## concatWithSeparator {#concatwithseparator}

用给定的分隔符连接给定的字符串。

**语法**

``` sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

别名: `concat_ws`

**参数**

- sep — 分隔符。 常量 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。
- exprN — 要连接的表达式。非 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md) 类型的参数会使用其默认序列化转换为字符串。由于这会降低性能，因此不建议使用非String/FixedString参数。

**返回值**

由连接参数创建的字符串。

如果任何参数值为 `NULL`，该函数将返回 `NULL`。

**示例**

``` sql
SELECT concatWithSeparator('a', '1', '2', '3', '4')
```

结果：

```result
┌─concatWithSeparator('a', '1', '2', '3', '4')─┐
│ 1a2a3a4                                      │
└──────────────────────────────────────────────┘
```
## concatWithSeparatorAssumeInjective {#concatwithseparatorassumeinjective}

与 `concatWithSeparator` 类似，但假设 `concatWithSeparator(sep, expr1, expr2, expr3...) → result` 是单射。可以用于优化 GROUP BY。

如果函数对不同的参数返回不同的结果，则称该函数为单射。换句话说：不同的参数永远不会产生相同的结果。
## substring {#substring}

返回字符串 `s` 的子字符串，该子字符串始于指定字节索引 `offset`。字节计数从 1 开始。如果 `offset` 为 0，将返回空字符串。如果 `offset` 为负，则子字符串从字符串末尾的 `pos` 个字符开始，而不是从开头开始。可选参数 `length` 指定返回的子字符串的最大字节数。

**语法**

```sql
substring(s, offset[, length])
```

别名：
- `substr`
- `mid`
- `byteSlice`

**参数**

- `s` — 要计算子字符串的字符串。 [字符串](../data-types/string.md)、[固定字符串](../data-types/fixedstring.md) 或 [枚举](../data-types/enum.md)
- `offset` — 子字符串在 `s` 中的起始位置。 [(U)Int*](../data-types/int-uint.md)。
- `length` — 子字符串的最大长度。 [(U)Int*](../data-types/int-uint.md)。可选。

**返回值**

一个包含 `s` 的子字符串，长度为 `length`，从索引 `offset` 开始。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT 'database' AS db, substr(db, 5), substr(db, 5, 1)
```

结果：

```result
┌─db───────┬─substring('database', 5)─┬─substring('database', 5, 1)─┐
│ database │ base                     │ b                           │
└──────────┴──────────────────────────┴─────────────────────────────┘
```
## substringUTF8 {#substringutf8}

返回字符串 `s` 的子字符串，该子字符串始于指定的字节索引 `offset` 以处理Unicode代码点。字节计数从1开始。如果 `offset` 为0，则返回空字符串。如果 `offset` 为负，则子字符串从字符串末尾的 `pos` 个字符开始，而不是从开头开始。可选参数 `length` 指定返回的子字符串的最大字节数。

假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

**语法**

```sql
substringUTF8(s, offset[, length])
```

**参数**

- `s` — 要计算子字符串的字符串。 [字符串](../data-types/string.md)、[固定字符串](../data-types/fixedstring.md) 或 [枚举](../data-types/enum.md)
- `offset` — 子字符串在 `s` 中的起始位置。 [(U)Int*](../data-types/int-uint.md)。
- `length` — 子字符串的最大长度。 [(U)Int*](../data-types/int-uint.md)。可选。

**返回值**

包含 `s` 的子字符串，长度为 `length`，从索引 `offset` 开始。

**实现细节**

假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

**示例**

```sql
SELECT 'Täglich grüßt das Murmeltier.' AS str,
       substringUTF8(str, 9),
       substringUTF8(str, 9, 5)
```

```response
Täglich grüßt das Murmeltier.	grüßt das Murmeltier.	grüßt
```
## substringIndex {#substringindex}

返回字符串 `s` 在 `count` 次出现分隔符 `delim` 之前的子字符串，如同在Spark或MySQL中一样。

**语法**

```sql
substringIndex(s, delim, count)
```
别名: `SUBSTRING_INDEX`

**参数**

- s — 要提取子字符串的字符串。 [字符串](../data-types/string.md)。
- delim — 分隔符字符。 [字符串](../data-types/string.md)。
- count — 在提取子字符串之前要计数的分隔符出现的次数。如果计数为正，则返回最后一个分隔符左侧的所有内容（从左计数）。如果计数为负，则返回最后一个分隔符右侧的所有内容（从右计数）。 [UInt 或 Int](../data-types/int-uint.md)

**示例**

``` sql
SELECT substringIndex('www.clickhouse.com', '.', 2)
```

结果：
```sql
┌─substringIndex('www.clickhouse.com', '.', 2)─┐
│ www.clickhouse                               │
└──────────────────────────────────────────────┘
```
## substringIndexUTF8 {#substringindexutf8}

返回字符串 `s` 在 `count` 次出现分隔符 `delim` 之前的子字符串，专门针对Unicode代码点。

假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

**语法**

```sql
substringIndexUTF8(s, delim, count)
```

**参数**

- `s` — 要提取子字符串的字符串。 [字符串](../data-types/string.md)。
- `delim` — 分隔符字符。 [字符串](../data-types/string.md)。
- `count` — 在提取子字符串之前要计数的分隔符出现的次数。如果计数为正，则返回最后一个分隔符左侧的所有内容（从左计数）。如果计数为负，则返回最后一个分隔符右侧的所有内容（从右计数）。 [UInt 或 Int](../data-types/int-uint.md)

**返回值**

在 `count` 次出现 `delim` 之前的子字符串 [字符串](../data-types/string.md) 的 `s`。

**实现细节**

假设字符串包含有效的UTF-8编码文本。如果该假设被违反，则不会抛出异常，结果是未定义的。

**示例**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

如果 `s` 非空且不以字符 `c` 结尾，则将字符 `c` 附加到字符串 `s`。

**语法**

```sql
appendTrailingCharIfAbsent(s, c)
```
## convertCharset {#convertcharset}

返回将字符串 `s` 从编码 `from` 转换为编码 `to` 的结果。

**语法**

```sql
convertCharset(s, from, to)
```
## base58Encode {#base58encode}

使用 [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) 中的“比特币”字母表对字符串进行编码。

**语法**

```sql
base58Encode(plaintext)
```

**参数**

- `plaintext` — [字符串](../data-types/string.md) 列或常量。

**返回值**

- 一个包含参数编码值的字符串。 [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。

**示例**

``` sql
SELECT base58Encode('Encoded');
```

结果：

```result
┌─base58Encode('Encoded')─┐
│ 3dc8KtHrwM              │
└─────────────────────────┘
```
## base58Decode {#base58decode}

接受一个字符串，并使用 [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) 编码方案中的“比特币”字母表对其进行解码。

**语法**

```sql
base58Decode(encoded)
```

**参数**

- `encoded` — [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。如果该字符串不是有效的 Base58 编码值，则抛出异常。

**返回值**

- 一个包含参数解码值的字符串。 [字符串](../data-types/string.md)。

**示例**

``` sql
SELECT base58Decode('3dc8KtHrwM');
```

结果：

```result
┌─base58Decode('3dc8KtHrwM')─┐
│ Encoded                    │
└────────────────────────────┘
```
## tryBase58Decode {#trybase58decode}

像 `base58Decode` 但在出错时返回空字符串。

**语法**

```sql
tryBase58Decode(encoded)
```

**参数**

- `encoded`: [字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。如果该字符串不是有效的 Base58 编码值，在出错时返回空字符串。

**返回值**

- 一个包含参数解码值的字符串。

**示例**

查询：

```sql
SELECT tryBase58Decode('3dc8KtHrwM') as res, tryBase58Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base64Encode {#base64encode}

根据 [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) 将字符串或固定字符串编码为Base64。

别名: `TO_BASE64`.

**语法**

```sql
base64Encode(plaintext)
```

**参数**

- `plaintext` — [字符串](../data-types/string.md) 列或常量。

**返回值**

- 一个包含参数编码值的字符串。

**示例**

``` sql
SELECT base64Encode('clickhouse');
```

结果：

```result
┌─base64Encode('clickhouse')─┐
│ Y2xpY2tob3VzZQ==           │
└────────────────────────────┘
```

## base64URLEncode {#base64urlencode}

将URL（String或FixedString）编码为base64，并进行URL特定的修改，遵循[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5)。

**语法**

```sql
base64URLEncode(url)
```

**参数**

- `url` — [String](../data-types/string.md) 列或常量。

**返回值**

- 包含参数编码值的字符串。

**示例**

``` sql
SELECT base64URLEncode('https://clickhouse.com');
```

结果：

```result
┌─base64URLEncode('https://clickhouse.com')─┐
│ aHR0cDovL2NsaWNraG91c2UuY29t              │
└───────────────────────────────────────────┘
```
## base64Decode {#base64decode}

接受一个字符串并将其从base64解码，遵循[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4)。在发生错误时抛出异常。

别名：`FROM_BASE64`。

**语法**

```sql
base64Decode(encoded)
```

**参数**

- `encoded` — [String](../data-types/string.md) 列或常量。如果字符串不是有效的Base64编码值，则会抛出异常。

**返回值**

- 包含参数解码值的字符串。

**示例**

``` sql
SELECT base64Decode('Y2xpY2tob3VzZQ==');
```

结果：

```result
┌─base64Decode('Y2xpY2tob3VzZQ==')─┐
│ clickhouse                       │
└──────────────────────────────────┘
```
## base64URLDecode {#base64urldecode}

接受一个base64编码的URL，并根据[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5)对其进行解码，进行URL特定的修改。在发生错误时抛出异常。

**语法**

```sql
base64URLDecode(encodedUrl)
```

**参数**

- `encodedURL` — [String](../data-types/string.md) 列或常量。如果字符串不是有效的Base64编码值，并且带有URL特定的修改，则会抛出异常。

**返回值**

- 包含参数解码值的字符串。

**示例**

``` sql
SELECT base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t');
```

结果：

```result
┌─base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t')─┐
│ https://clickhouse.com                          │
└─────────────────────────────────────────────────┘
```
## tryBase64Decode {#trybase64decode}

像 `base64Decode`，但在发生错误时返回空字符串。

**语法**

```sql
tryBase64Decode(encoded)
```

**参数**

- `encoded` — [String](../data-types/string.md) 列或常量。如果字符串不是有效的Base64编码值，则返回空字符串。

**返回值**

- 包含参数解码值的字符串。

**示例**

查询：

```sql
SELECT tryBase64Decode('RW5jb2RlZA==') as res, tryBase64Decode('invalid') as res_invalid;
```

```response
┌─res────────┬─res_invalid─┐
│ clickhouse │             │
└────────────┴─────────────┘
```
## tryBase64URLDecode {#trybase64urldecode}

像 `base64URLDecode`，但在发生错误时返回空字符串。

**语法**

```sql
tryBase64URLDecode(encodedUrl)
```

**参数**

- `encodedURL` — [String](../data-types/string.md) 列或常量。如果字符串不是有效的Base64编码值，并且带有URL特定的修改，则返回空字符串。

**返回值**

- 包含参数解码值的字符串。

**示例**

查询：

```sql
SELECT tryBase64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t') as res, tryBase64Decode('aHR0cHM6Ly9jbGlja') as res_invalid;
```

```response
┌─res────────────────────┬─res_invalid─┐
│ https://clickhouse.com │             │
└────────────────────────┴─────────────┘
```
## endsWith {#endswith}

返回字符串 `str` 是否以 `suffix` 结尾。

**语法**

```sql
endsWith(str, suffix)
```
## endsWithUTF8 {#endswithutf8}

返回字符串 `str` 是否以 `suffix` 结尾，`endsWithUTF8` 与 `endsWith` 的区别在于 `endsWithUTF8` 通过UTF-8字符来匹配 `str` 和 `suffix`。

**语法**

```sql
endsWithUTF8(str, suffix)
```

**示例**

``` sql
SELECT endsWithUTF8('中国', '\xbd'), endsWith('中国', '\xbd')
```

结果：

```result
┌─endsWithUTF8('中国', '½')─┬─endsWith('中国', '½')─┐
│                        0 │                    1 │
└──────────────────────────┴──────────────────────┘
```
## startsWith {#startswith}

返回字符串 `str` 是否以 `prefix` 开头。

**语法**

```sql
startsWith(str, prefix)
```

**示例**

``` sql
SELECT startsWith('Spider-Man', 'Spi');
```
## startsWithUTF8 {#startswithutf8}

<VersionBadge minVersion='23.8' />

返回字符串 `str` 是否以 `prefix` 开头，`startsWithUTF8` 与 `startsWith` 的区别在于 `startsWithUTF8` 通过UTF-8字符来匹配 `str` 和 `suffix`。

**示例**

``` sql
SELECT startsWithUTF8('中国', '\xe4'), startsWith('中国', '\xe4')
```

结果：

```result
┌─startsWithUTF8('中国', '⥩─┬─startsWith('中国', '⥩─┐
│                          0 │                      1 │
└────────────────────────────┴────────────────────────┘
```
## trim {#trim}

删除字符串开头或结尾处的指定字符。如果没有特别说明，函数将删除空格（ASCII字符32）。

**语法**

``` sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**参数**

- `trim_character` — 要修剪的字符。 [String](../data-types/string.md)。
- `input_string` — 要修剪的字符串。 [String](../data-types/string.md)。

**返回值**

无前导和/或尾部指定字符的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT trim(BOTH ' ()' FROM '(   Hello, world!   )');
```

结果：

```result
┌─trim(BOTH ' ()' FROM '(   Hello, world!   )')─┐
│ Hello, world!                                 │
└───────────────────────────────────────────────┘
```
## trimLeft {#trimleft}

删除字符串开头处连续出现的空格（ASCII字符32）。

**语法**

``` sql
trimLeft(input_string[, trim_characters])
```

别名：`ltrim`。

**参数**

- `input_string` — 要修剪的字符串。 [String](../data-types/string.md)。
- `trim_characters` — 要修剪的字符。 可选。 [String](../data-types/string.md)。如果未指定，则使用 `' '` （单空格）作为修剪字符。

**返回值**

无前导常规空格的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT trimLeft('     Hello, world!     ');
```

结果：

```result
┌─trimLeft('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## trimRight {#trimright}

删除字符串结尾处连续出现的空格（ASCII字符32）。

**语法**

``` sql
trimRight(input_string[, trim_characters])
```

别名：`rtrim`。

**参数**

- `input_string` — 要修剪的字符串。 [String](../data-types/string.md)。
- `trim_characters` — 要修剪的字符。 可选。 [String](../data-types/string.md)。如果未指定，则使用 `' '` （单空格）作为修剪字符。

**返回值**

无尾部常规空格的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT trimRight('     Hello, world!     ');
```

结果：

```result
┌─trimRight('     Hello, world!     ')─┐
│      Hello, world!                   │
└──────────────────────────────────────┘
```
## trimBoth {#trimboth}

从字符串的两端删除连续出现的空格（ASCII字符32）。

**语法**

``` sql
trimBoth(input_string[, trim_characters])
```

别名：`trim`。

**参数**

- `input_string` — 要修剪的字符串。 [String](../data-types/string.md)。
- `trim_characters` — 要修剪的字符。 可选。 [String](../data-types/string.md)。如果未指定，则使用 `' '` （单空格）作为修剪字符。

**返回值**

无前导和尾部常规空格的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT trimBoth('     Hello, world!     ');
```

结果：

```result
┌─trimBoth('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## CRC32 {#crc32}

返回字符串的CRC32校验和，使用CRC-32-IEEE 802.3多项式和初始值`0xffffffff`（zlib实现）。

结果类型为UInt32。
## CRC32IEEE {#crc32ieee}

返回字符串的CRC32校验和，使用CRC-32-IEEE 802.3多项式。

结果类型为UInt32。
## CRC64 {#crc64}

返回字符串的CRC64校验和，使用CRC-64-ECMA多项式。

结果类型为UInt64。
## normalizeUTF8NFC {#normalizeutf8nfc}

将字符串转换为[NFC标准化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)，假设字符串是有效的UTF8编码文本。

**语法**

``` sql
normalizeUTF8NFC(words)
```

**参数**

- `words` — UTF8编码的输入字符串。 [String](../data-types/string.md)。

**返回值**

- 转换为NFC标准化形式的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT length('â'), normalizeUTF8NFC('â') AS nfc, length(nfc) AS nfc_len;
```

结果：

```result
┌─length('â')─┬─nfc─┬─nfc_len─┐
│           2 │ â   │       2 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFD {#normalizeutf8nfd}

将字符串转换为[NFD标准化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)，假设字符串是有效的UTF8编码文本。

**语法**

``` sql
normalizeUTF8NFD(words)
```

**参数**

- `words` — UTF8编码的输入字符串。 [String](../data-types/string.md)。

**返回值**

- 转换为NFD标准化形式的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT length('â'), normalizeUTF8NFD('â') AS nfd, length(nfd) AS nfd_len;
```

结果：

```result
┌─length('â')─┬─nfd─┬─nfd_len─┐
│           2 │ â   │       3 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFKC {#normalizeutf8nfkc}

将字符串转换为[NFKC标准化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)，假设字符串是有效的UTF8编码文本。

**语法**

``` sql
normalizeUTF8NFKC(words)
```

**参数**

- `words` — UTF8编码的输入字符串。 [String](../data-types/string.md)。

**返回值**

- 转换为NFKC标准化形式的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT length('â'), normalizeUTF8NFKC('â') AS nfkc, length(nfkc) AS nfkc_len;
```

结果：

```result
┌─length('â')─┬─nfkc─┬─nfkc_len─┐
│           2 │ â    │        2 │
└─────────────┴──────┴──────────┘
```
## normalizeUTF8NFKD {#normalizeutf8nfkd}

将字符串转换为[NFKD标准化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)，假设字符串是有效的UTF8编码文本。

**语法**

``` sql
normalizeUTF8NFKD(words)
```

**参数**

- `words` — UTF8编码的输入字符串。 [String](../data-types/string.md)。

**返回值**

- 转换为NFKD标准化形式的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT length('â'), normalizeUTF8NFKD('â') AS nfkd, length(nfkd) AS nfkd_len;
```

结果：

```result
┌─length('â')─┬─nfkd─┬─nfkd_len─┐
│           2 │ â    │        3 │
└─────────────┴──────┴──────────┘
```
## encodeXMLComponent {#encodexmlcomponent}

转义在XML中具有特殊含义的字符，以便它们可以随后放入XML文本节点或属性中。

以下字符被替换：`<`、`&`、`>`、`"`、`'`。
另请参阅[XML和HTML字符实体引用列表](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references)。

**语法**

``` sql
encodeXMLComponent(x)
```

**参数**

- `x` — 输入字符串。 [String](../data-types/string.md)。

**返回值**

- 转义后的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT encodeXMLComponent('Hello, "world"!');
SELECT encodeXMLComponent('<123>');
SELECT encodeXMLComponent('&clickhouse');
SELECT encodeXMLComponent('\'foo\'');
```

结果：

```result
Hello, &quot;world&quot;!
&lt;123&gt;
&amp;clickhouse
&apos;foo&apos;
```
## decodeXMLComponent {#decodexmlcomponent}

取消转义XML中具有特殊含义的子字符串。这些子字符串是：`&quot;` `&amp;` `&apos;` `&gt;` `&lt;`

此函数还将数字字符引用替换为Unicode字符。 支持十进制（如`&#10003;`）和十六进制（`&#x2713;`）形式。

**语法**

``` sql
decodeXMLComponent(x)
```

**参数**

- `x` — 输入字符串。 [String](../data-types/string.md)。

**返回值**

- 取消转义的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT decodeXMLComponent('&apos;foo&apos;');
SELECT decodeXMLComponent('&lt; &#x3A3; &gt;');
```

结果：

```result
'foo'
< Σ >
```
## decodeHTMLComponent {#decodehtmlcomponent}

取消转义HTML中具有特殊含义的子字符串。例如：`&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` 等。

此函数还将数字字符引用替换为Unicode字符。 支持十进制（如`&#10003;`）和十六进制（`&#x2713;`）形式。

**语法**

``` sql
decodeHTMLComponent(x)
```

**参数**

- `x` — 输入字符串。 [String](../data-types/string.md)。

**返回值**

- 取消转义的字符串。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT decodeHTMLComponent(''CH');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

结果：

```result
'CH'
I♥ClickHouse'
```
## extractTextFromHTML {#extracttextfromhtml}

此函数从HTML或XHTML中提取纯文本。

它并不完全符合HTML、XML或XHTML规格，但实现合理准确且快速。规则如下：

1. 跳过注释。例如：`<!-- test -->`。注释必须以`-->`结束。不允许嵌套注释。
注意：像`<!-->`和`<!--->`这样的结构在HTML中不是有效的注释，但它们会被其他规则跳过。
2. CDATA将逐字粘贴。注意：CDATA是特定于XML/XHTML的，并在“尽力而为”的基础上进行处理。
3. `script`和`style`元素及其所有内容被移除。注意：假定结束标签不能出现在内容中。例如，在JS字符串字面量中必须像`"<\/script>"`一样转义。
注意：在`script`或`style`内部可以有注释和CDATA，因此不会在CDATA内部搜索结束标签。例如：`<script><![CDATA[</script>]]></script>`。但是，它们仍会在注释内部被搜索。有时变得复杂：`<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`。
注意：`script`和`style`可以是XML命名空间的名称，因此它们不被视为通常的`script`或`style`元素。例如：`<script:a>Hello</script:a>`。
注意：结束标签名称后的空格是可能的：`</script >`，但结束标签之前则不可以：`< / script>`。
4. 跳过没有内部内容的其他标签或类似标签的元素。例如：`<a>.</a>`。
注意：预计此HTML是非法的：`<a test=">"></a>`。
注意：还跳过像标签一样的内容：`<>`、`<!>`等。
注意：没有结束的标签将跳过到输入的末尾：`<hello   `
5. HTML和XML实体不被解码。必须由单独的函数处理。
6. 文本中的空格被压缩或按照特定规则插入。
    - 开头和结尾的空格被移除。
    - 连续的空格被压缩。
    - 但是如果文本由其他元素分隔且没有空格，则会插入空格。
    - 这可能导致不自然的示例：`Hello<b>world</b>`，`Hello<!-- -->world` - HTML中没有空格，但函数插入了它。还考虑：`Hello<p>world</p>`，`Hello<br>world`。这种行为在数据分析中是合理的，例如将HTML转换为单词集合。
7. 还注意，正确处理空格需要支持`<pre></pre>`和CSS的`display`及`white-space`属性。

**语法**

``` sql
extractTextFromHTML(x)
```

**参数**

- `x` — 输入文本。 [String](../data-types/string.md)。

**返回值**

- 提取的文本。 [String](../data-types/string.md)。

**示例**

第一个示例包含几个标签和一个注释，并显示空格处理。
第二个示例显示CDATA和script标签处理。
第三个示例从通过[url](../../sql-reference/table-functions/url.md)函数接收的完整HTML响应中提取文本。

``` sql
SELECT extractTextFromHTML(' <p> A text <i>with</i><b>tags</b>. <!-- comments --> </p> ');
SELECT extractTextFromHTML('<![CDATA[The content within <b>CDATA</b>]]> <script>alert("Script");</script>');
SELECT extractTextFromHTML(html) FROM url('http://www.donothingfor2minutes.com/', RawBLOB, 'html String');
```

结果：

```result
A text with tags .
The content within <b>CDATA</b>
Do Nothing for 2 Minutes 2:00 &nbsp;
```
## ascii {#ascii}

返回字符串 `s` 第一个字符的ASCII码点（作为Int32）。

如果`s`为空，则结果为0。如果第一个字符不是ASCII字符或不属于UTF-16的拉丁-1补充范围，则结果未定义。

**语法**

```sql
ascii(s)
```
## soundex {#soundex}

返回字符串的[Soundex码](https://en.wikipedia.org/wiki/Soundex)。

**语法**

```sql
soundex(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)

**返回值**

- 输入值的Soundex码。 [String](../data-types/string.md)

**示例**

``` sql
select soundex('aksel');
```

结果：

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```
## punycodeEncode {#punycodeencode}

返回字符串的[Punycode](https://en.wikipedia.org/wiki/Punycode)表示。
字符串必须为UTF8编码，否则行为未定义。

**语法**

``` sql
punycodeEncode(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)

**返回值**

- 输入值的Punycode表示。 [String](../data-types/string.md)

**示例**

``` sql
select punycodeEncode('München');
```

结果：

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```
## punycodeDecode {#punycodedecode}

返回[Punycode](https://en.wikipedia.org/wiki/Punycode)编码字符串的UTF8编码纯文本。
如果给定无效的Punycode编码字符串，则会抛出异常。

**语法**

``` sql
punycodeEncode(val)
```

**参数**

- `val` — Punycode编码字符串。 [String](../data-types/string.md)

**返回值**

- 输入值的纯文本。 [String](../data-types/string.md)

**示例**

``` sql
select punycodeDecode('Mnchen-3ya');
```

结果：

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```
## tryPunycodeDecode {#trypunycodedecode}

像 `punycodeDecode`，但如果未提供有效的Punycode编码字符串，则返回空字符串。
## idnaEncode {#idnaencode}

根据[国际化域名在应用程序中的机制](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications)（IDNA）机制返回域名的ASCII表示（ToASCII算法）。
输入字符串必须为UTF编码且可转换为ASCII字符串，否则将抛出异常。
注意：未执行百分号解码或制表符、空格或控制字符的修剪。

**语法**

```sql
idnaEncode(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)

**返回值**

- 输入值的IDNA机制下的ASCII表示。 [String](../data-types/string.md)

**示例**

``` sql
select idnaEncode('straße.münchen.de');
```

结果：

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```
## tryIdnaEncode {#tryidnaencode}

像 `idnaEncode`，但在发生错误时返回空字符串，而不是抛出异常。
## idnaDecode {#idnadecode}

根据[国际化域名在应用程序中的机制](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications)（IDNA）机制返回域名的Unicode（UTF-8）表示（ToUnicode算法）。
在发生错误时（例如，输入无效），返回输入字符串。
注意，重复应用`idnaEncode()`和`idnaDecode()`可能不会返回原始字符串，因为会出现大小写规范化问题。

**语法**

```sql
idnaDecode(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)

**返回值**

- 输入值的IDNA机制下的Unicode（UTF-8）表示。 [String](../data-types/string.md)

**示例**

``` sql
select idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

结果：

```result
┌─idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de')─┐
│ straße.münchen.de                             │
└───────────────────────────────────────────────┘
```
## byteHammingDistance {#bytehammingdistance}

计算两个字节字符串之间的[汉明距离](https://en.wikipedia.org/wiki/Hamming_distance)。

**语法**

```sql
byteHammingDistance(string1, string2)
```

**示例**

``` sql
SELECT byteHammingDistance('karolin', 'kathrin');
```

结果：

``` text
┌─byteHammingDistance('karolin', 'kathrin')─┐
│                                         3 │
└───────────────────────────────────────────┘
```

别名：`mismatches`
## stringJaccardIndex {#stringjaccardindex}

计算两个字节字符串之间的[杰卡德相似性指数](https://en.wikipedia.org/wiki/Jaccard_index)。

**语法**

```sql
stringJaccardIndex(string1, string2)
```

**示例**

``` sql
SELECT stringJaccardIndex('clickhouse', 'mouse');
```

结果：

``` text
┌─stringJaccardIndex('clickhouse', 'mouse')─┐
│                                       0.4 │
└───────────────────────────────────────────┘
```
## stringJaccardIndexUTF8 {#stringjaccardindexutf8}

与[stringJaccardIndex](#stringjaccardindex)类似，但适用于UTF8编码的字符串。
## editDistance {#editdistance}

计算两个字节字符串之间的[编辑距离](https://en.wikipedia.org/wiki/Edit_distance)。

**语法**

```sql
editDistance(string1, string2)
```

**示例**

``` sql
SELECT editDistance('clickhouse', 'mouse');
```

结果：

``` text
┌─editDistance('clickhouse', 'mouse')─┐
│                                   6 │
└─────────────────────────────────────┘
```

别名：`levenshteinDistance`
## editDistanceUTF8 {#editdistanceutf8}

计算两个UTF8字符串之间的[编辑距离](https://en.wikipedia.org/wiki/Edit_distance)。

**语法**

```sql
editDistanceUTF8(string1, string2)
```

**示例**

``` sql
SELECT editDistanceUTF8('我是谁', '我是我');
```

结果：

``` text
┌─editDistanceUTF8('我是谁', '我是我')──┐
│                                   1 │
└─────────────────────────────────────┘
```

别名：`levenshteinDistanceUTF8`
## damerauLevenshteinDistance {#dameraulevenshteindistance}

计算两个字节字符串之间的[Damerau-Levenshtein距离](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)。

**语法**

```sql
damerauLevenshteinDistance(string1, string2)
```

**示例**

``` sql
SELECT damerauLevenshteinDistance('clickhouse', 'mouse');
```

结果：

``` text
┌─damerauLevenshteinDistance('clickhouse', 'mouse')─┐
│                                                 6 │
└───────────────────────────────────────────────────┘
```
## jaroSimilarity {#jarosimilarity}

计算两个字节字符串之间的[Jaro相似性](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity)。

**语法**

```sql
jaroSimilarity(string1, string2)
```

**示例**

``` sql
SELECT jaroSimilarity('clickhouse', 'click');
```

结果：

``` text
┌─jaroSimilarity('clickhouse', 'click')─┐
│                    0.8333333333333333 │
└───────────────────────────────────────┘
```
## jaroWinklerSimilarity {#jarowinklersimilarity}

计算两个字节字符串之间的[Jaro-Winkler相似性](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity)。

**语法**

```sql
jaroWinklerSimilarity(string1, string2)
```

**示例**

``` sql
SELECT jaroWinklerSimilarity('clickhouse', 'click');
```

结果：

``` text
┌─jaroWinklerSimilarity('clickhouse', 'click')─┐
│                           0.8999999999999999 │
└──────────────────────────────────────────────┘
```
## initcap {#initcap}

将每个单词的首字母转换为大写，其他字母转换为小写。单词是由非字母数字字符分隔的字母数字字符序列。

:::note
由于 `initCap` 仅将每个单词的首字母转换为大写，因此您可能会观察到包含撇号或大写字母的单词出现意外行为。例如：

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

将返回

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

这是已知行为，目前没有计划修复。
:::

**语法**

```sql
initcap(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)。

**返回值**

- `val` 中每个单词首字母转换为大写。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT initcap('building for fast');
```

结果：

```text
┌─initcap('building for fast')─┐
│ Building For Fast            │
└──────────────────────────────┘
```
## initcapUTF8 {#initcaputf8}

与[initcap](#initcap)类似，`initcapUTF8`将每个单词的首字母转换为大写，其他字母转换为小写。假设字符串包含有效的UTF-8编码文本。
如果违反了这一假设，则不会抛出异常，结果是未定义的。

:::note
此函数无法检测语言，例如，对于土耳其语，结果可能不完全正确（i/İ与i/I）。
如果UTF-8字节序列的长度在大小写之间不同，则该代码点的结果可能不正确。
:::

**语法**

```sql
initcapUTF8(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)。

**返回值**

- `val` 中每个单词首字母转换为大写。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT initcapUTF8('не тормозит');
```

结果：

```text
┌─initcapUTF8('не тормозит')─┐
│ Не Тормозит                │
└────────────────────────────┘
```
## firstLine {#firstline}

返回多行字符串中的第一行。

**语法**

```sql
firstLine(val)
```

**参数**

- `val` — 输入值。 [String](../data-types/string.md)

**返回值**

- 输入值的第一行，如果没有行分隔符，则返回整个值。 [String](../data-types/string.md)

**示例**

```sql
select firstLine('foo\nbar\nbaz');
```

结果：

```result
┌─firstLine('foo\nbar\nbaz')─┐
│ foo                        │
└────────────────────────────┘
```
## stringCompare {#stringcompare}

比较两个字符串的字典序。

**语法**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**参数**

- `string1` — 要比较的第一个字符串。 [String](../data-types/string.md)
- `string2` - 要比较的第二个字符串。[String](../data-types/string.md)
- `string1_offset` — 在 `string1` 中开始比较的位置（零基础）所对应的正数。可选。
- `string2_offset` — 在 `string2` 中开始比较的位置（零基础）所对应的正数。可选。
- `num_bytes` — 在两个字符串中要比较的最大字节数。如果 `string_offset` + `num_bytes` 超过输入字符串的结尾，则 `num_bytes` 将相应减少。

**返回值**

- -1 — 如果 `string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] 且 `string1_offset` < len(`string1`) 且 `string2_offset` < len(`string2`)。
如果 `string1_offset` >= len(`string1`) 且 `string2_offset` < len(`string2`)。
- 0 — 如果 `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] 且 `string1_offset` < len(`string1`) 且 `string2_offset` < len(`string2`)。
如果 `string1_offset` >= len(`string1`) 且 `string2_offset` >= len(`string2`)。
- 1 — 如果 `string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] 且 `string1_offset` < len(`string1`) 且 `string2_offset` < len(`string2`)。
如果 `string1_offset` < len(`string1`) 且 `string2_offset` >= len(`string2`)。

**示例**

```sql
SELECT
    stringCompare('alice', 'bob', 0, 0, 3) as result1,
    stringCompare('alice', 'alicia', 0, 0, 3) as result2,
    stringCompare('bob', 'alice', 0, 0, 3) as result3
```
结果：
```result
   ┌─result1─┬─result2─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```

```sql
SELECT
    stringCompare('alice', 'alicia') as result2,
    stringCompare('alice', 'alice') as result1,
    stringCompare('bob', 'alice') as result3
```
结果：
```result
   ┌─result2─┬─result1─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
