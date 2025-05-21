---
'description': 'Documentation for Functions for Searching in Strings'
'sidebar_label': 'Searching in Strings'
'sidebar_position': 160
'slug': '/sql-reference/functions/string-search-functions'
'title': 'Functions for Searching in Strings'
---




# 字符串搜索函数

本节中的所有函数默认按大小写敏感搜索。通常，通过单独的函数变体提供不区分大小写的搜索。

:::note
不区分大小写的搜索遵循英语的大小写规则。例如，英语中大写的 `i` 是 `I`，而在土耳其语中是 `İ` —— 对于英语以外的语言，结果可能会出乎意料。
:::

本节中的函数还假设被搜索的字符串（在本节中称为 `haystack`）和搜索字符串（在本节中称为 `needle`）是单字节编码文本。如果违反此假设，则不会抛出异常，结果是未定义的。使用 UTF-8 编码字符串的搜索通常通过单独的函数变体提供。同样，如果使用了 UTF-8 函数变体并且输入字符串不是 UTF-8 编码文本，则不会抛出异常，结果是未定义的。请注意，没有自动的 Unicode 规范化执行，但可以使用
[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来实现。

[常规字符串函数](string-functions.md) 和 [字符串替换函数](string-replace-functions.md) 单独描述。
## position {#position}

返回子字符串 `needle` 在字符串 `haystack` 中的位置（以字节为单位，从 1 开始）。

**语法**

```sql
position(haystack, needle[, start_pos])
```

别名：
- `position(needle IN haystack)`

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md) 或 [Enum](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[String](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中搜索开始的位置（基于 1）。[UInt](../data-types/int-uint.md)。可选。

**返回值**

- 如果找到子字符串，则返回以字节为单位的起始位置，从 1 开始计数。[UInt64](../data-types/int-uint.md)。
- 如果未找到子字符串，则返回 0。[UInt64](../data-types/int-uint.md)。

如果子字符串 `needle` 为空，则适用以下规则：
- 如果未指定 `start_pos`：返回 `1`
- 如果 `start_pos = 0`：返回 `1`
- 如果 `start_pos >= 1` 且 `start_pos <= length(haystack) + 1`：返回 `start_pos`
- 否则：返回 `0`

相同的规则也适用于函数 `locate`、`positionCaseInsensitive`、`positionUTF8` 和 `positionCaseInsensitiveUTF8`。

**示例**

查询：

```sql
SELECT position('Hello, world!', '!');
```

结果：

```text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

带有 `start_pos` 参数的示例：

查询：

```sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

结果：

```text
┌─position('Hello, world!', 'o', 1)─┬─position('Hello, world!', 'o', 7)─┐
│                                 5 │                                 9 │
└───────────────────────────────────┴───────────────────────────────────┘
```

`needle IN haystack` 语法的示例：

查询：

```sql
SELECT 6 = position('/' IN s) FROM (SELECT 'Hello/World' AS s);
```

结果：

```text
┌─equals(6, position(s, '/'))─┐
│                           1 │
└─────────────────────────────┘
```

使用空 `needle` 子字符串的示例：

查询：

```sql
SELECT
    position('abc', ''),
    position('abc', '', 0),
    position('abc', '', 1),
    position('abc', '', 2),
    position('abc', '', 3),
    position('abc', '', 4),
    position('abc', '', 5)
```

结果：

```text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```
## locate {#locate}

类似于 [position](#position)，但参数 `haystack` 和 `locate` 互换。

此函数的行为取决于 ClickHouse 的版本：
- 在版本 < v24.3 中，`locate` 是函数 `position` 的别名，接受参数 `(haystack, needle[, start_pos])`。
- 在版本 >= 24.3 中，`locate` 是一个独立的函数（为了更好的与 MySQL 的兼容性），接受参数 `(needle, haystack[, start_pos])`。可以使用设置 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) 来恢复先前的行为。

**语法**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

不区分大小写的 [position](#position) 变体。

**示例**

查询：

```sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

结果：

```text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```
## positionUTF8 {#positionutf8}

类似于 [position](#position)，但假设 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**示例**

函数 `positionUTF8` 正确地将字符 `ö`（由两个点表示）视为单个 Unicode 代码点：

查询：

```sql
SELECT positionUTF8('Motörhead', 'r');
```

结果：

```text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```
## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

类似于 [positionUTF8](#positionutf8)，但不区分大小写搜索。
## multiSearchAllPositions {#multisearchallpositions}

类似于 [position](#position)，但返回 `haystack` 字符串中多个 `needle` 子字符串的位置数组（以字节为单位，从 1 开始）。

:::note
所有 `multiSearch*()` 函数仅支持最多 2<sup>8</sup> 个 needles。
:::

**语法**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位的起始位置数组，从 1 开始计数。
- 如果未找到子字符串，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

结果：

```text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```
## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

类似于 [multiSearchAllPositions](#multisearchallpositions)，但忽略大小写。

**语法**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位的起始位置数组，从 1 开始计数。
- 如果未找到子字符串，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchAllPositionsCaseInsensitive('ClickHouse',['c','h']);
```

结果：

```response
["1","6"]
```
## multiSearchAllPositionsUTF8 {#multisearchallpositionsutf8}

类似于 [multiSearchAllPositions](#multisearchallpositions)，但假设 `haystack` 和 `needle` 子字符串是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 编码字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位的起始位置数组，从 1 开始计数。
- 如果未找到子字符串，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，查找 `C` (`\x43`) 和 `H` (`\x48`) 的位置。

查询：

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

结果：

```response
["1","6"]
```
## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

类似于 [multiSearchAllPositionsUTF8](#multisearchallpositionsutf8)，但忽略大小写。

**语法**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 编码字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位的起始位置数组，从 1 开始计数。
- 如果未找到子字符串，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，查找 `c` (`\x63`) 和 `h` (`\x68`) 的位置。

查询：

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

结果：

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

类似于 [`position`](#position)，但返回在 `haystack` 字符串中与任何多个 `needle` 字符串匹配的最左偏移量。

函数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) 和 [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitivutf8) 提供此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与任意多个 `needle` 字符串匹配的最左偏移量。
- 如果没有匹配，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchFirstPosition('Hello World',['llo', 'Wor', 'ld']);
```

结果：

```response
3
```
## multiSearchFirstPositionCaseInsensitive {#multisearchfirstpositioncaseinsensitive}

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与任意多个 `needle` 字符串匹配的最左偏移量。
- 如果没有匹配，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchFirstPositionCaseInsensitive('HELLO WORLD',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstPositionUTF8 {#multisearchfirstpositionutf8}

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 为 UTF-8 字符串。

**语法**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与任意多个 `needle` 字符串匹配的最左偏移量。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `hello world` 中与任意给定 `needle` 匹配的最左偏移量。

查询：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 为 UTF-8 字符串，并且忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与任意多个 `needle` 字符串匹配的最左偏移量，忽略大小写。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `HELLO WORLD` 中与任意给定 `needle` 匹配的最左偏移量。

查询：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

返回字符串 `haystack` 中左侧找到的第一个 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。

函数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) 和 [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) 提供此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 左侧找到的第一个 `needle` 的索引（从 1 开始）。如果没有匹配，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT multiSearchFirstIndex('Hello World',['World','Hello']);
```

结果：

```response
1
```
## multiSearchFirstIndexCaseInsensitive {#multisearchfirstindexcaseinsensitive}

返回字符串 `haystack` 中左侧找到的第一个 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 左侧找到的第一个 `needle` 的索引（从 1 开始）。如果没有匹配，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT multiSearchFirstIndexCaseInsensitive('hElLo WoRlD',['World','Hello']);
```

结果：

```response
1
```
## multiSearchFirstIndexUTF8 {#multisearchfirstindexutf8}

返回字符串 `haystack` 中左侧找到的第一个 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假设 `haystack` 和 `needle` 为 UTF-8 编码字符串。

**语法**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。[Array](../data-types/array.md)。

**返回值**

- 左侧找到的第一个 `needle` 的索引（从 1 开始）。如果没有匹配，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

给定 `Hello World` 作为 UTF-8 字符串，查找 UTF-8 字符串 `Hello` 和 `World` 的第一个索引。

查询：

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

结果：

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

返回字符串 `haystack` 中左侧找到的第一个 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假设 `haystack` 和 `needle` 为 UTF-8 编码字符串。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 左侧找到的第一个 `needle` 的索引（从 1 开始）。如果没有匹配，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

给定 `HELLO WORLD` 作为 UTF-8 字符串，查找 UTF-8 字符串 `hello` 和 `world` 的第一个索引。

查询：

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

结果：

```response
1
```
## multiSearchAny {#multisearchany}

如果至少有一个字符串 `needle`<sub>i</sub> 与字符串 `haystack` 匹配，则返回 1， 否则返回 0。

函数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) 和 [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) 提供此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 如果至少有一个匹配，则返回 1。
- 如果没有至少一个匹配，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchAny('ClickHouse',['C','H']);
```

结果：

```response
1
```
## multiSearchAnyCaseInsensitive {#multisearchanycaseinsensitive}

类似于 [multiSearchAny](#multisearchany)，但忽略大小写。

**语法**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 如果至少有一个不区分大小写的匹配，则返回 1。
- 如果没有至少一个不区分大小写的匹配，则返回 0。

**示例**

查询：

```sql
SELECT multiSearchAnyCaseInsensitive('ClickHouse',['c','h']);
```

结果：

```response
1
```
## multiSearchAnyUTF8 {#multisearchanyutf8}

类似于 [multiSearchAny](#multisearchany)，但假设 `haystack` 和 `needle` 子字符串是 UTF-8 编码的字符串。

*语法**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 如果至少有一个匹配，则返回 1。
- 如果没有至少一个匹配，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查单词中是否有字母 `C` ('\x43') 或 `H` ('\x48')。

查询：

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

结果：

```response
1
```
## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

类似于 [multiSearchAnyUTF8](#multisearchanyutf8)，但忽略大小写。

*语法**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 如果至少有一个不区分大小写的匹配，则返回 1。
- 如果没有至少一个不区分大小写的匹配，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查单词中是否有字母 `h`(`\x68`)，忽略大小写。

查询：

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

结果：

```response
1
```
## match {#match}

返回字符串 `haystack` 是否匹配正则表达式 `pattern`，使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax)。

匹配是基于 UTF-8 的，例如，`.` 匹配 Unicode 代码点 `¥`，它在 UTF-8 中使用两个字节表示。正则表达式中不能包含空字节。如果 `haystack` 或 `pattern` 无效 UTF-8，则行为是未定义的。

与 re2 的默认行为不同，`.` 匹配换行符。要禁用此功能，可以在模式前加上 `(?-s)`。

如果您只是想在字符串中搜索子字符串，可以使用 [like](#like) 或 [position](#position) 等函数代替——这些函数的速度比此函数快得多。

**语法**

```sql
match(haystack, pattern)
```

别名：`haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

类似于 `match`，但如果至少有一个模式匹配，则返回 1，否则返回 0。

:::note
`multi[Fuzzy]Match*()` 函数系列使用 (Vectorscan)[https://github.com/VectorCamp/vectorscan] 库。因此，只有在 ClickHouse 使用 Vectorscan 支持编译时才启用。

要禁用所有使用 hyperscan 的函数，请使用设置 `SET allow_hyperscan = 0;`。

由于 vectorscan 的限制，`haystack` 字符串的长度必须小于 2<sup>32</sup> 字节。

Hyperscan 通常容易受到正则表达式拒绝服务（ReDoS）攻击的影响（例如，参见 (here)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(here)[https://doi.org/10.1007/s10664-021-10033-1] 和 (here)[https://doi.org/10.1145/3236024.3236027]）。建议用户仔细检查提供的模式。
:::

如果您只是想在字符串中搜索多个子字符串，可以使用 [multiSearchAny](#multisearchany) 函数代替——它的速度比此函数快得多。

**语法**

```sql
multiMatchAny(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAnyIndex {#multimatchanyindex}

类似于 `multiMatchAny`，但返回与 `haystack` 匹配的任何索引。

**语法**

```sql
multiMatchAnyIndex(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAllIndices {#multimatchallindices}

类似于 `multiMatchAny`，但返回与 `haystack` 中的所有索引匹配的数组，以任意顺序。

**语法**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

类似于 `multiMatchAny`，但如果任何模式在一个固定的 [编辑距离](https://en.wikipedia.org/wiki/Edit_distance) 内与 `haystack` 匹配，则返回 1。此函数依赖于 [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) 库的实验特性，并且在某些极端情况下可能较慢。性能取决于编辑距离值和所使用的模式，但总会比非模糊变体更昂贵。

:::note
`multiFuzzyMatch*()` 函数系列由于 hyperscan 的限制，不支持 UTF-8 正则表达式（将它们视为字节序列）。
:::

**语法**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

类似于 `multiFuzzyMatchAny`，但返回在固定编辑距离内与 `haystack` 匹配的任何索引。

**语法**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

类似于 `multiFuzzyMatchAny`，但返回在固定编辑距离内与 `haystack` 匹配的所有索引数组，以任意顺序。

**语法**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## extract {#extract}

返回字符串中正则表达式的第一个匹配项。
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

如果正则表达式有捕获组，则函数将输入字符串与第一个捕获组进行匹配。

**语法**

```sql
extract(haystack, pattern)
```

*参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 第一个匹配正则表达式的 `haystack` 字符串。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT extract('number: 1, number: 2, number: 3', '\\d+') AS result;
```

结果：

```response
┌─result─┐
│ 1      │
└────────┘
```
## extractAll {#extractall}

返回字符串中正则表达式的所有匹配项数组。如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

关于子模式的行为与函数 [`extract`](#extract) 中的相同。

**语法**

```sql
extractAll(haystack, pattern)
```

*参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- `haystack` 字符串中正则表达式匹配项的数组。[Array](../data-types/array.md)([String](../data-types/string.md))。

**示例**

查询：

```sql
SELECT extractAll('number: 1, number: 2, number: 3', '\\d+') AS result;
```

结果：

```response
┌─result────────┐
│ ['1','2','3'] │
└───────────────┘
```
## extractAllGroupsHorizontal {#extractallgroupshorizontal}

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，其中第一个数组包含所有匹配第一个组的片段，第二个数组包含匹配第二个组的片段，依此类推。

此函数比 [extractAllGroupsVertical](#extractallgroupsvertical) 慢。

**语法**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配项的数组数组。[Array](../data-types/array.md)。

:::note
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回一个空数组的数组。
:::

**示例**

```sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

结果：

```text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```
## extractGroups {#extractgroups}

用给定的正则表达式匹配给定输入字符串的所有组，返回匹配项的数组数组。

**语法**

```sql
extractGroups(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配项的数组数组。[Array](../data-types/array.md)。

**示例**

```sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

结果：

```text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```
## extractAllGroupsVertical {#extractallgroupsvertical}

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，其中每个数组包含来自每个组的匹配片段。片段按在 `haystack` 中的出现顺序分组。

**语法**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配项的数组数组。[Array](../data-types/array.md)。

:::note
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空数组。
:::

**示例**

```sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

结果：

```text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## like {#like}

返回字符串 `haystack` 是否匹配 LIKE 表达式 `pattern`。

LIKE 表达式可以包含普通字符和以下元符号：

- `%` 表示任意数量的任意字符（包括零字符）。
- `_` 表示单个任意字符。
- `\` 用于转义文字 `%`、`_` 和 `\`。

匹配基于 UTF-8，e.g. `_` 匹配 Unicode 代码点 `¥`，使用两个字节在 UTF-8 表示。

如果 `haystack` 或 LIKE 表达式不是有效的 UTF-8，则行为未定义。

没有自动的 Unicode 规范化执行，您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数实现。

要匹配文字 `%`、`_` 和 `\`（这些是 LIKE 元字符），请在它们前面加上反斜线：`\%`、`\_` 和 `\\`。如果反斜线前的字符不同于 `%`、`_` 或 `\` ，则反斜线失去了其特殊意义（即被逐字解释）。请注意，ClickHouse 还要求字符串中的反斜线 [也要被引号包围](../syntax.md#string)，因此您实际上需要写成 `\\%`、`\\_` 和 `\\\\`。

对于形式为 `%needle%` 的 LIKE 表达式，此函数的速度与 `position` 函数一样快。
所有其他 LIKE 表达式都被内部转换为正则表达式并以类似于 `match` 函数的性能执行。

**语法**

```sql
like(haystack, pattern)
```

别名：`haystack LIKE pattern`（运算符）
## notLike {#notlike}

类似于 `like`，但否定结果。

别名：`haystack NOT LIKE pattern`（运算符）
## ilike {#ilike}

类似于 `like`，但进行不区分大小写的搜索。

别名：`haystack ILIKE pattern`（运算符）
## notILike {#notilike}

类似于 `ilike`，但否定结果。

别名：`haystack NOT ILIKE pattern`（运算符）
## ngramDistance {#ngramdistance}

计算 `haystack` 字符串与 `needle` 字符串之间的 4-gram 距离。为此，它计算两个 4-gram 多重集之间的对称差异，并按其基数之和进行规范化。返回一个介于 0 和 1 之间的 [Float32](/sql-reference/data-types/float)。结果越小，字符串之间越相似。

函数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
ngramDistance(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串相似度的介于 0 和 1 之间的值。[Float32](/sql-reference/data-types/float)

**实现细节**

如果常量 `needle` 或 `haystack` 参数的大小超过 32Kb，将抛出异常。如果任何非常量 `haystack` 或 `needle` 参数的大小超过 32Kb，则距离始终为 1。

**示例**

两个字符串越相似，其结果越接近 0（相同）。

查询：

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

结果：

```response
0.06666667
```

两个字符串之间的相似度越低，其结果就会越大。


查询：

```sql
SELECT ngramDistance('ClickHouse','House');
```

结果：

```response
0.5555556
```
## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

提供不区分大小写的 [ngramDistance](#ngramdistance) 变体。

**语法**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串相似度的介于 0 和 1 之间的值。[Float32](/sql-reference/data-types/float)

**示例**

使用 [ngramDistance](#ngramdistance) 时，大小写差异会影响相似度值：

查询：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

结果：

```response
0.71428573
```

使用 [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) 时，大小写被忽略，因此两个仅因大小写不同的相同字符串将返回一个低相似度值：

查询：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

结果：

```response
0
```
## ngramDistanceUTF8 {#ngramdistanceutf8}

提供 [ngramDistance](#ngramdistance) 的 UTF-8 变体。假设 `needle` 和 `haystack` 字符串是 UTF-8 编码的字符串。

**语法**

```sql
ngramDistanceUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串相似度的介于 0 和 1 之间的值。[Float32](/sql-reference/data-types/float)

**示例**

查询：

```sql
SELECT ngramDistanceUTF8('abcde','cde');
```

结果：

```response
0.5
```
## ngramDistanceCaseInsensitiveUTF8 {#ngramdistancecaseinsensitiveutf8}

提供不区分大小写的 [ngramDistanceUTF8](#ngramdistanceutf8) 变体。

**语法**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串相似度的介于 0 和 1 之间的值。[Float32](/sql-reference/data-types/float)

**示例**

查询：

```sql
SELECT ngramDistanceCaseInsensitiveUTF8('abcde','CDE');
```

结果：

```response
0.5
```
## ngramSearch {#ngramsearch}

类似于 `ngramDistance`，但计算 `needle` 字符串和 `haystack` 字符串之间的非对称差。即，从 needle 中的 n-gram 数量减去公共 n-gram 数量，按 needle n-gram 数量进行规范化。返回一个介于 0 和 1 之间的 [Float32](/sql-reference/data-types/float)。结果越大，`needle` 出现在 `haystack` 中的可能性越大。此函数用于模糊字符串搜索。另请参阅函数 [`soundex`](../../sql-reference/functions/string-functions#soundex)。

函数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
ngramSearch(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 表示 `needle` 出现在 `haystack` 中的可能性的介于 0 和 1 之间的值。[Float32](/sql-reference/data-types/float)

**实现细节**

:::note
UTF-8 变体使用 3-gram 距离。这些并不是完全公平的 n-gram 距离。我们使用 2 字节哈希来哈希 n-gram，然后计算这些哈希表之间的（非）对称差异——可能会发生碰撞。使用 UTF-8 不区分大小写格式时，我们不使用公平的 `tolower` 函数——我们将每个代码点字节的第 5 位（从零开始）和第零字节的第一个位清零（如果字节大于 1）——这对拉丁字母和大多数西里尔字母有效。
:::

**示例**

查询：

```sql
SELECT ngramSearch('Hello World','World Hello');
```

结果：

```response
0.5
```
## ngramSearchCaseInsensitive {#ngramsearchcaseinsensitive}

提供一个不区分大小写的 [ngramSearch](#ngramsearch) 变体。

**语法**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越高。

**示例**

查询：

```sql
SELECT ngramSearchCaseInsensitive('Hello World','hello');
```

结果：

```response
1
```
## ngramSearchUTF8 {#ngramsearchutf8}

提供一个 [ngramSearch](#ngramsearch) 的 UTF-8 变体，其中 `needle` 和 `haystack` 假定为 UTF-8 编码的字符串。

**语法**

```sql
ngramSearchUTF8(haystack, needle)
```

**参数**

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越高。

**示例**

查询：

```sql
SELECT ngramSearchUTF8('абвгдеёжз', 'гдеёзд');
```

结果：

```response
0.5
```
## ngramSearchCaseInsensitiveUTF8 {#ngramsearchcaseinsensitiveutf8}

提供一个不区分大小写的 [ngramSearchUTF8](#ngramsearchutf8) 变体，其中 `needle` 和 `haystack`。

**语法**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越高。

**示例**

查询：

```sql
SELECT ngramSearchCaseInsensitiveUTF8('абвГДЕёжз', 'АбвгдЕЁжз');
```

结果：

```response
0.57142854
```
## countSubstrings {#countsubstrings}

返回子字符串 `needle` 在字符串 `haystack` 中出现的频率。

函数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) 和 [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) 分别提供不区分大小写和不区分大小写 + UTF-8 的变体。

**语法**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1 的索引）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现次数。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT countSubstrings('aaaa', 'aa');
```

结果：

```text
┌─countSubstrings('aaaa', 'aa')─┐
│                             2 │
└───────────────────────────────┘
```

带有 `start_pos` 参数的示例：

```sql
SELECT countSubstrings('abc___abc', 'abc', 4);
```

结果：

```text
┌─countSubstrings('abc___abc', 'abc', 4)─┐
│                                      1 │
└────────────────────────────────────────┘
```
## countSubstringsCaseInsensitive {#countsubstringscaseinsensitive}

返回子字符串 `needle` 在字符串 `haystack` 中出现的频率。 忽略大小写。

**语法**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1 的索引）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现次数。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT countSubstringsCaseInsensitive('AAAA', 'aa');
```

结果：

```text
┌─countSubstringsCaseInsensitive('AAAA', 'aa')─┐
│                                            2 │
└──────────────────────────────────────────────┘
```

带有 `start_pos` 参数的示例：

查询：

```sql
SELECT countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4);
```

结果：

```text
┌─countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4)─┐
│                                                           2 │
└─────────────────────────────────────────────────────────────┘
```
## countSubstringsCaseInsensitiveUTF8 {#countsubstringscaseinsensitiveutf8}

返回子字符串 `needle` 在字符串 `haystack` 中出现的频率。 忽略大小写，并假定 `haystack` 是 UTF8 字符串。

**语法**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 要搜索的 UTF-8 字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1 的索引）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现次数。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА');
```

结果：

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА')─┐
│                                                                  4 │
└────────────────────────────────────────────────────────────────────┘
```

带有 `start_pos` 参数的示例：

查询：

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13);
```

结果：

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13)─┐
│                                                                      2 │
└────────────────────────────────────────────────────────────────────────┘
```
## countMatches {#countmatches}

返回 `haystack` 中与 `pattern` 匹配的正则表达式的数量。

**语法**

```sql
countMatches(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

**返回值**

- 匹配的数量。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT countMatches('foobar.com', 'o+');
```

结果：

```text
┌─countMatches('foobar.com', 'o+')─┐
│                                2 │
└──────────────────────────────────┘
```

```sql
SELECT countMatches('aaaa', 'aa');
```

结果：

```text
┌─countMatches('aaaa', 'aa')────┐
│                             2 │
└───────────────────────────────┘
```
## countMatchesCaseInsensitive {#countmatchescaseinsensitive}

返回 `haystack` 中与 `pattern` 匹配的正则表达式的数量，类似于 [`countMatches`](#countmatches)，但匹配时忽略大小写。

**语法**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

**返回值**

- 匹配的数量。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT countMatchesCaseInsensitive('AAAA', 'aa');
```

结果：

```text
┌─countMatchesCaseInsensitive('AAAA', 'aa')────┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## regexpExtract {#regexpextract}

提取 `haystack` 中与正则表达式模式匹配的第一个字符串，并对应于正则表达式组索引。

**语法**

```sql
regexpExtract(haystack, pattern[, index])
```

别名：`REGEXP_EXTRACT(haystack, pattern[, index])`。

**参数**

- `haystack` — 要匹配正则表达式模式的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 字符串，正则表达式，必须是常量。 [字符串](../data-types/string.md)。
- `index` – 一个大于或等于 0 的整数，默认为 1。它表示要提取的正则表达式组。 [UInt 或 Int](../data-types/int-uint.md)。 可选。

**返回值**

`pattern` 可能包含多个正则表达式组，`index` 表示要提取的正则表达式组。 0 表示匹配整个正则表达式。 [字符串](../data-types/string.md)。

**示例**

```sql
SELECT
    regexpExtract('100-200', '(\\d+)-(\\d+)', 1),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 2),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 0),
    regexpExtract('100-200', '(\\d+)-(\\d+)');
```

结果：

```text
┌─regexpExtract('100-200', '(\\d+)-(\\d+)', 1)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 2)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 0)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)')─┐
│ 100                                          │ 200                                          │ 100-200                                      │ 100                                       │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┘
```
## hasSubsequence {#hassubsequence}

如果 `needle` 是 `haystack` 的子序列，则返回 1，否则返回 0。
字符串的子序列是可以通过删除零个或多个元素而不改变剩余元素的顺序，从给定字符串中派生出的序列。

**语法**

```sql
hasSubsequence(haystack, needle)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，则为 1；否则为 0。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT hasSubsequence('garbage', 'arg');
```

结果：

```text
┌─hasSubsequence('garbage', 'arg')─┐
│                                1 │
└──────────────────────────────────┘
```
## hasSubsequenceCaseInsensitive {#hassubsequencecaseinsensitive}

与 [hasSubsequence](#hassubsequence) 相似，但不区分大小写地搜索。

**语法**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，则为 1；否则为 0。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT hasSubsequenceCaseInsensitive('garbage', 'ARG');
```

结果：

```text
┌─hasSubsequenceCaseInsensitive('garbage', 'ARG')─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```
## hasSubsequenceUTF8 {#hassubsequenceutf8}

与 [hasSubsequence](#hassubsequence) 相似，但假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**语法**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**参数**

- `haystack` — 要搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，则为 1；否则为 0。 [UInt8](../data-types/int-uint.md)。

查询：

**示例**

```sql
select hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

结果：

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

与 [hasSubsequenceUTF8](#hassubsequenceutf8) 相似，但不区分大小写地搜索。

**语法**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack` — 要搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，则为 1；否则为 0。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
select hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

结果：

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasToken {#hastoken}

如果给定的令牌在 `haystack` 中存在，则返回 1；否则返回 0。

**语法**

```sql
hasToken(haystack, token)
```

**参数**

- `haystack`: 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 两个非字母数字 ASCII 字符之间（或 `haystack` 的边界）最大长度的子字符串。

**返回值**

- 如果令牌在 `haystack` 中存在，则为 1；否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。 支持 tokenbf_v1 索引专用。

**示例**

查询：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

如果给定的令牌存在，则返回 1；如果不存在则返回 0，如果令牌格式不正确则返回 null。

**语法**

```sql
hasTokenOrNull(haystack, token)
```

**参数**

- `haystack`: 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 两个非字母数字 ASCII 字符之间（或 `haystack` 的边界）最大长度的子字符串。

**返回值**

- 如果令牌在 `haystack` 中存在，则为 1；如果不存在则返回 0；如果令牌格式不正确则返回 [`null`](../data-types/nullable.md)。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。 支持 tokenbf_v1 索引专用。

**示例**

在 `hasToken` 对格式不正确的令牌抛出错误的情况下，`hasTokenOrNull` 返回 `null`。

查询：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

如果给定的令牌在 `haystack` 中存在，则返回 1；否则返回 0。 忽略大小写。

**语法**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**参数**

- `haystack`: 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 两个非字母数字 ASCII 字符之间（或 `haystack` 的边界）最大长度的子字符串。

**返回值**

- 如果令牌在 `haystack` 中存在，则为 1；否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。 支持 tokenbf_v1 索引专用。

**示例**

查询：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

如果给定的令牌在 `haystack` 中存在，则返回 1；否则返回 0。 忽略大小写，并在令牌格式不正确时返回 null。

**语法**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**参数**

- `haystack`: 要搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 两个非字母数字 ASCII 字符之间（或 `haystack` 的边界）最大长度的子字符串。

**返回值**

- 如果令牌在 `haystack` 中存在，则为 1；如果令牌不存在则返回 0；否则如果令牌格式不正确则返回 [`null`](../data-types/nullable.md)。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。 支持 tokenbf_v1 索引专用。

**示例**

在 `hasTokenCaseInsensitive` 对格式不正确的令牌抛出错误的情况下，`hasTokenCaseInsensitiveOrNull` 返回 `null`。

查询：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
