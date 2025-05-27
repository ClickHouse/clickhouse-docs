---
'description': '字符串搜索函数的文档'
'sidebar_label': '字符串搜索'
'sidebar_position': 160
'slug': '/sql-reference/functions/string-search-functions'
'title': '字符串搜索函数'
---


# 字符串搜索函数

本节中的所有函数默认情况下是区分大小写的。通常通过单独的函数变体提供不区分大小写的搜索。

:::note
不区分大小写的搜索遵循英语的大小写规则。例如，英语中的大写字母 `i` 是 `I`，而在土耳其语中是 `İ` - 对于英语以外的语言，结果可能会出乎意料。
:::

本节中的函数还假定被搜索的字符串（在本节中称为 `haystack`）和搜索字符串（在本节中称为 `needle`）是单字节编码文本。如果违反此假设，则不会抛出异常且结果是未定义的。使用UTF-8编码的字符串的搜索通常由单独的函数变体提供。同样，如果使用了UTF-8函数变体而输入字符串不是UTF-8编码文本，则不会抛出异常且结果是未定义的。请注意，没有执行自动 Unicode 标准化，但您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来做到这一点。

[一般字符串函数](string-functions.md) 和 [字符串替换函数](string-replace-functions.md) 被单独描述。

## position {#position}

返回子字符串 `needle` 在字符串 `haystack` 中的位置（以字节为单位，从 1 开始计数）。

**语法**

```sql
position(haystack, needle[, start_pos])
```

别名：
- `position(needle IN haystack)`

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md) 或 [Enum](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [String](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于1）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 如果找到子字符串，返回以字节为单位的起始位置，并从 1 开始计数。 [UInt64](../data-types/int-uint.md)。
- 如果未找到子字符串，则返回 0。 [UInt64](../data-types/int-uint.md)。

如果子字符串 `needle` 是空的，适用以下规则：
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

带有空 `needle` 子字符串的示例：

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

类似于 [position](#position)，但参数 `haystack` 和 `locate` 交换。

该函数的行为依赖于 ClickHouse 的版本：
- 在版本 < v24.3 中，`locate` 是 `position` 函数的别名，并接受参数 `(haystack, needle[, start_pos])`。
- 在版本 >= 24.3 中，`locate` 是一个单独的函数（为了更好地兼容 MySQL），并接受参数 `(needle, haystack[, start_pos])`。可以使用设置 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) 恢复之前的行为。

**语法**

```sql
locate(needle, haystack[, start_pos])
```

## positionCaseInsensitive {#positioncaseinsensitive}

[Position](#position) 的不区分大小写变体。

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

类似于 [position](#position)，但假定 `haystack` 和 `needle` 是UTF-8编码字符串。

**示例**

函数 `positionUTF8` 正确地将字符 `ö`（由两个点表示）视为一个Unicode代码点：

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

类似于 [positionUTF8](#positionutf8)，但执行不区分大小写的搜索。

## multiSearchAllPositions {#multisearchallpositions}

类似于 [position](#position)，但返回多个 `needle` 子字符串在 `haystack` 字符串中的位置数组（以字节为单位，从 1 开始计数）。

:::note
所有 `multiSearch*()` 函数仅支持最多 2<sup>8</sup> 个 needle。
:::

**语法**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，返回以字节为单位的起始位置数组，并从 1 开始计数。
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

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，返回以字节为单位的起始位置数组，并从 1 开始计数。
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

类似于 [multiSearchAllPositions](#multisearchallpositions)，但假定 `haystack` 和 `needle` 子字符串是 UTF-8 编码字符串。

**语法**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 在其中执行搜索的 UTF-8 编码字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，返回以字节为单位的起始位置数组，并从 1 开始计数。
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

- `haystack` — 在其中执行搜索的 UTF-8 编码字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，返回以字节为单位的起始位置数组，并从 1 开始计数。
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

类似于 [`position`](#position)，但返回一个 `haystack` 字符串中与多个 `needle` 字符串匹配的最左侧偏移。

函数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) 和 [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) 提供该函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与多个 `needle` 字符串匹配的最左侧偏移。
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

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与多个 `needle` 字符串匹配的最左侧偏移。
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

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 是 UTF-8 字符串。

**语法**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与多个 `needle` 字符串匹配的最左侧偏移。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `hello world` 中与给定的 needles 匹配的最左侧偏移。

查询：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

结果：

```response
2
```

## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 是 UTF-8 字符串并且忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中与多个 `needle` 字符串匹配的最左侧偏移，忽略大小写。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `HELLO WORLD` 中与给定的 needles 匹配的最左侧偏移。

查询：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

结果：

```response
2
```

## multiSearchFirstIndex {#multisearchfirstindex}

返回字符串 `haystack` 中最左侧找到的 needle<sub>i</sub> 的索引 `i` （从 1 开始），否则返回 0。

函数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) 和 [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) 提供该函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 最左侧找到的 needle 的索引（从 1 开始）。否则返回 0，如果没有匹配。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中最左侧找到的 needle<sub>i</sub> 的索引 `i` （从 1 开始），否则返回 0。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 最左侧找到的 needle 的索引（从 1 开始）。否则返回 0，如果没有匹配。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中最左侧找到的 needle<sub>i</sub> 的索引 `i` （从 1 开始），否则返回 0。假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 最左侧找到的 needle 的索引（从 1 开始）。否则返回 0，如果没有匹配。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中最左侧找到的 needle<sub>i</sub> 的索引 `i` （从 1 开始），否则返回 0。假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 最左侧找到的 needle 的索引（从 1 开始）。否则返回 0，如果没有匹配。 [UInt8](../data-types/int-uint.md)。

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

如果至少有一个字符串 needle<sub>i</sub> 匹配字符串 `haystack` 则返回 1；否则返回 0。

函数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) 和 [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) 提供该函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个匹配。
- 0，如果没有至少一个匹配。

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

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个不区分大小写的匹配。
- 0，如果没有至少一个不区分大小写的匹配。

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

类似于 [multiSearchAny](#multisearchany)，但假定 `haystack` 和 `needle` 子字符串是 UTF-8 编码字符串。

**语法**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个匹配。
- 0，如果没有至少一个匹配。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查字中是否有字母 `C` ('\x43') 或 `H` ('\x48')。

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

**语法**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的 UTF-8 字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个不区分大小写的匹配。
- 0，如果没有至少一个不区分大小写的匹配。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查字中是否有不区分大小写的字母 `h`（`\x68`）。

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

匹配基于 UTF-8，例如 `.` 匹配 Unicode 代码点 `¥`，其在 UTF-8 中使用两个字节表示。正则表达式不得包含空字节。如果 haystack 或 pattern 不是有效的 UTF-8，则行为是未定义的。

与 re2 的默认行为不同，`.` 匹配换行符。要禁用此功能，可以在模式前加上 `(?-s)`。

如果您只想在字符串中搜索子字符串，可以使用 [like](#like) 或 [position](#position) 等函数，它们比此函数快得多。

**语法**

```sql
match(haystack, pattern)
```

别名：`haystack REGEXP pattern 运营者`

## multiMatchAny {#multimatchany}

类似于 `match`，但如果至少有一个模式匹配，则返回 1；否则返回 0。

:::note
`multi[Fuzzy]Match*()` 函数系列使用（Vectorscan）[https://github.com/VectorCamp/vectorscan] 库。因此，它们仅在 ClickHouse 编译时支持 vectorScan 时才能启用。

要关闭所有使用 hyperscan 的函数，请使用设置 `SET allow_hyperscan = 0;`。

由于 vectorscan 的限制，`haystack` 字符串的长度必须小于 2<sup>32</sup> 字节。

Hyperscan 通常容易受到正则表达式拒绝服务（ReDoS）攻击（例如，见（这里）[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、（这里）[https://doi.org/10.1007/s10664-021-10033-1] 和（这里）[https://doi.org/10.1145/3236024.3236027]）。建议用户仔细检查提供的模式。
:::

如果您只想在字符串中搜索多个子字符串，可以使用函数 [multiSearchAny](#multisearchany)，它比此函数快得多。

**语法**

```sql
multiMatchAny(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## multiMatchAnyIndex {#multimatchanyindex}

类似于 `multiMatchAny`，但返回与 `haystack` 匹配的任意索引。

**语法**

```sql
multiMatchAnyIndex(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## multiMatchAllIndices {#multimatchallindices}

类似于 `multiMatchAny`，但返回与 `haystack` 匹配的所有索引的数组，顺序可以是任意的。

**语法**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## multiFuzzyMatchAny {#multifuzzymatchany}

类似于 `multiMatchAny`，但如果有任何模式与 `haystack` 匹配，且在常量 [编辑距离](https://en.wikipedia.org/wiki/Edit_distance) 内，则返回 1。此函数依赖于 [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) 库的实验性特性，对于某些极端情况可能会比较慢。性能取决于编辑距离值和使用的模式，但始终相比于非模糊变体更昂贵。

:::note
`multiFuzzyMatch*()` 函数系列由于 hyperscan 的限制不支持 UTF-8 正则表达式（将其视为字节序列）。
:::

**语法**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

类似于 `multiFuzzyMatchAny`，但返回在常量编辑距离内与 `haystack` 匹配的任意索引。

**语法**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

类似于 `multiFuzzyMatchAny`，但返回在常量编辑距离内与 `haystack` 匹配的所有索引的数组，顺序可以是任意的。

**语法**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```

## extract {#extract}

返回字符串中正则表达式的第一个匹配项。
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

如果正则表达式有捕获组，则该函数将输入字符串与第一个捕获组匹配。

**语法**

```sql
extract(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 正则表达式在 haystack 字符串中的第一个匹配。 [String](../data-types/string.md)。

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

返回字符串中正则表达式的所有匹配项的数组。如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

关于子模式的行为与函数 [`extract`](#extract) 相同。

**语法**

```sql
extractAll(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 正则表达式在 haystack 字符串中的匹配项数组。 [Array](../data-types/array.md)([String](../data-types/string.md))。

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

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，第一个数组包含匹配第一个组的所有片段，第二个数组包含匹配第二个组的片段，等等。

此函数比 [extractAllGroupsVertical](#extractallgroupsvertical) 慢。

**语法**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会引发异常。 [String](../data-types/string.md)。

**返回值**

- 匹配的数组数组。 [Array](../data-types/array.md)。

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

用给定的正则表达式匹配给定输入字符串的所有组，返回匹配的数组数组。

**语法**

```sql
extractGroups(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会引发异常。 [String](../data-types/string.md)。

**返回值**

- 匹配的数组数组。 [Array](../data-types/array.md)。

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

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，其中每个数组包含来自每个组的匹配片段。片段按照在 `haystack` 中出现的顺序进行分组。

**语法**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每组用括号括起来。如果 `pattern` 不包含组，则会引发异常。 [String](../data-types/string.md)。

**返回值**

- 匹配的数组数组。 [Array](../data-types/array.md)。

:::note
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回一个空数组。
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

- `%` 表示任意数量的任意字符（包括零个字符）。
- `_` 表示单个任意字符。
- `\` 用于转义字面值 `%`、`_` 和 `\`。

匹配基于 UTF-8，例如 `_` 匹配 Unicode 代码点 `¥`，其在 UTF-8 中使用两个字节表示。

如果 haystack 或 LIKE 表达式不是有效的 UTF-8，则行为是未定义的。

没有自动 Unicode 标准化，您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数。

要与字面量的 `%`、`_` 和 `\`（这些是 LIKE 元字符）匹配，在前面加上反斜杠：`\%`、`\_` 和 `\\`。
如果反斜杠在后面带有与 `%`、`_` 或 `\` 不同的字符，则其特殊含义将失效（即被逐字解释）。
请注意，ClickHouse 要求字符串中的反斜杠 [也要被转义](../syntax.md#string)，因此您实际上需要写 `\\%`、`\\_` 和 `\\\\`。

对于形如 `%needle%` 的 LIKE 表达式，函数的速度与 `position` 函数一样快。
所有其他 LIKE 表达式在内部被转换为正则表达式，并以与函数 `match` 类似的性能执行。

**语法**

```sql
like(haystack, pattern)
```

别名：`haystack LIKE pattern`（运算符）

## notLike {#notlike}

类似于 `like`，但否定结果。

别名：`haystack NOT LIKE pattern`（运算符）

## ilike {#ilike}

类似于 `like`，但执行不区分大小写搜索。

别名：`haystack ILIKE pattern`（运算符）

## notILike {#notilike}

类似于 `ilike`，但否定结果。

别名：`haystack NOT ILIKE pattern`（运算符）

## ngramDistance {#ngramdistance}

计算 `haystack` 字符串和 `needle` 字符串之间的 4-gram 距离。为此，它计算两个多重集之间的对称差，并按其基数之和进行标准化。返回一个在 0 和 1 之间的 [Float32](/sql-reference/data-types/float) 值。结果越小，字符串之间的相似度越高。

函数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
ngramDistance(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 在 0 和 1 之间的值，表示两个字符串之间的相似性。 [Float32](/sql-reference/data-types/float)

**实现细节**

如果常量 `needle` 或 `haystack` 参数超过 32Kb 大小，则此函数将引发异常。如果任何非常量的 `haystack` 或 `needle` 参数超过 32Kb 大小，则距离总是 1。

**示例**

两个字符串越相似，结果越接近 0（完全相同）。

查询：

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

结果：

```response
0.06666667
```

两个字符串之间的相似度越低，结果越大。

查询：

```sql
SELECT ngramDistance('ClickHouse','House');
```

结果：

```response
0.5555556
```

## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

提供 [ngramDistance](#ngramdistance) 的不区分大小写变体。

**语法**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 在 0 和 1 之间的值，表示两个字符串之间的相似性。 [Float32](/sql-reference/data-types/float)

**示例**

使用 [ngramDistance](#ngramdistance)，大小写的差异会影响相似性值：

查询：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

结果：

```response
0.71428573
```

使用 [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive)，大小写被忽视，因此两个仅在大小写上有差异的相同字符串现在将返回较低的相似性值：

查询：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

结果：

```response
0
```

## ngramDistanceUTF8 {#ngramdistanceutf8}

提供 [ngramDistance](#ngramdistance) 的 UTF-8 变体。假定 `needle` 和 `haystack` 字符串是 UTF-8 编码的字符串。

**语法**

```sql
ngramDistanceUTF8(haystack, needle)
```

**参数**

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 在 0 和 1 之间的值，表示两个字符串之间的相似性。 [Float32](/sql-reference/data-types/float)

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

提供 [ngramDistanceUTF8](#ngramdistanceutf8) 的不区分大小写变体。

**语法**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 在 0 和 1 之间的值，表示两个字符串之间的相似性。 [Float32](/sql-reference/data-types/float)

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

类似于 `ngramDistance`，但计算 `needle` 字符串和 `haystack` 字符串之间的非对称差，即 needle 的 n-grams 数量减去共同的 n-grams 数量，并按 needle n-grams 的数量进行标准化。返回一个在 0 和 1 之间的 [Float32](/sql-reference/data-types/float) 值。结果越大，表明 `needle` 更可能存在于 `haystack` 中。此函数对于模糊字符串搜索非常有用。另请参见函数 [`soundex`](../../sql-reference/functions/string-functions#soundex)。

函数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
ngramSearch(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 在 0 和 1 之间的值，表示 `needle` 存在于 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

**实现细节**

:::note
UTF-8 变体使用 3-gram 距离。这些不是完全公正的 n-gram 距离。我们使用 2 字节哈希对 n-gram 进行哈希，然后计算这些哈希表之间的（非）对称差 – 可能会发生冲突。在 UTF-8 不区分大小写格式中，我们不使用公正的 `tolower` 函数 – 我们将每个代码点字节的第 5 位（从零开始）和第零字节的第一位设为零（如果字节超过一个）– 这适用于拉丁字母和大多数西里尔字母。
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

提供了一种不区分大小写的 [ngramSearch](#ngramsearch) 变体。

**语法**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 存在于 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，表示 `needle` 在 `haystack` 中的可能性越大。

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

提供了一种 UTF-8 变体的 [ngramSearch](#ngramsearch)，假设 `needle` 和 `haystack` 是 UTF-8 编码的字符串。

**语法**

```sql
ngramSearchUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 存在于 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，表示 `needle` 在 `haystack` 中的可能性越大。

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

提供了一种不区分大小写的 [ngramSearchUTF8](#ngramsearchutf8) 变体。

**语法**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 存在于 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，表示 `needle` 在 `haystack` 中的可能性越大。

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

返回子字符串 `needle` 在字符串 `haystack` 中出现的次数。

函数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) 和 [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) 分别提供不区分大小写和不区分大小写 + UTF-8 的变体。

**语法**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（1 基础）。 [无符号整数](../data-types/int-uint.md)。可选。

**返回值**

- 出现的次数。 [无符号整数](../data-types/int-uint.md)。

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

返回子字符串 `needle` 在字符串 `haystack` 中出现的次数。忽略大小写。

**语法**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（1 基础）。 [无符号整数](../data-types/int-uint.md)。可选。

**返回值**

- 出现的次数。 [无符号整数](../data-types/int-uint.md)。

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

返回子字符串 `needle` 在字符串 `haystack` 中出现的次数。忽略大小写并假设 `haystack` 是 UTF8 字符串。

**语法**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（1 基础）。 [无符号整数](../data-types/int-uint.md)。可选。

**返回值**

- 出现的次数。 [无符号整数](../data-types/int-uint.md)。

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

返回在 `haystack` 中与 `pattern` 匹配的正则表达式的数量。

**语法**

```sql
countMatches(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

**返回值**

- 匹配的数量。 [无符号整数](../data-types/int-uint.md)。

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

返回在 `haystack` 中与模式匹配的正则表达式的数量，类似于 [`countMatches`](#countmatches)，但匹配忽略大小写。

**语法**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

**返回值**

- 匹配的数量。 [无符号整数](../data-types/int-uint.md)。

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

提取 `haystack` 中与正则表达式模式匹配且对应于正则组索引的第一个字符串。

**语法**

别名：`REGEXP_EXTRACT(haystack, pattern[, index])`。

**参数**

- `haystack` — 要在其中与正则表达式模式匹配的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 字符串，正则表达式，必须是常量。 [字符串](../data-types/string.md)。
- `index` – 大于或等于 0 的整数，默认值为 1。它表示要提取哪个正则组。 [无符号整数或整数](../data-types/int-uint.md)。可选。

**返回值**

`pattern` 可能包含多个正则组，`index` 指示要提取哪个正则组。索引为 0 意味着匹配整个正则表达式。 [字符串](../data-types/string.md)。

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
字符串的子序列是通过删除零个或多个元素而不改变剩余元素的顺序从给定字符串衍生出的序列。


**语法**

```sql
hasSubsequence(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

与 [hasSubsequence](#hassubsequence) 相似，但进行不区分大小写的搜索。

**语法**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

与 [hasSubsequence](#hassubsequence) 相似，但假设 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**语法**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

与 [hasSubsequenceUTF8](#hassubsequenceutf8) 相似，但进行不区分大小写的搜索。

**语法**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 `needle` 是 `haystack` 的子序列，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

如果给定的令牌存在于 `haystack` 中，则返回 1，否则返回 0。

**语法**

```sql
hasToken(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符（或 `haystack` 的边界）之间的最大长度子字符串。

**返回值**

- 如果令牌存在于 `haystack` 中，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

查询：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

如果给定的令牌存在，则返回 1，如果不存在则返回 0，如果令牌形式不正确则返回 null。

**语法**

```sql
hasTokenOrNull(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符（或 `haystack` 的边界）之间的最大长度子字符串。

**返回值**

- 如果令牌存在于 `haystack` 中，返回 1；如果不存在，则返回 0；如果令牌形式不正确，则返回 null。

**实现细节**

令牌必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

如果 `hasToken` 因格式不正确的令牌而抛出错误，`hasTokenOrNull` 将针对格式不正确的令牌返回 `null`。

查询：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

如果给定的令牌存在于 `haystack` 中，则返回 1，否则返回 0。忽略大小写。

**语法**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符（或 `haystack` 的边界）之间的最大长度子字符串。

**返回值**

- 如果令牌存在于 `haystack` 中，返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

查询：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitivedornull}

如果给定的令牌存在于 `haystack` 中，则返回 1，否则返回 0。忽略大小写并在令牌形式不正确时返回 null。

**语法**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符（或 `haystack` 的边界）之间的最大长度子字符串。

**返回值**

- 如果令牌存在于 `haystack` 中，返回 1；如果令牌不存在，则返回 0；如果令牌格式不正确，则返回 [`null`](../data-types/nullable.md) 。 [UInt8](../data-types/int-uint.md)。

**实现细节**

令牌必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

如果 `hasTokenCaseInsensitive` 因格式不正确的令牌而抛出错误，`hasTokenCaseInsensitiveOrNull` 将针对格式不正确的令牌返回 `null`。

查询：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
