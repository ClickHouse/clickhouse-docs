---
'description': '字符串搜索的函数的文档'
'sidebar_label': '字符串搜索'
'sidebar_position': 160
'slug': '/sql-reference/functions/string-search-functions'
'title': '字符串搜索的函数'
---


# 字符串搜索函数

本节中的所有函数默认区分大小写进行搜索。通常，通过单独的函数变体提供不区分大小写的搜索。

:::note
不区分大小写的搜索遵循英语的大小写规则。例如，英语中大写的 `i` 是 `I`，而在土耳其语中则是 `İ` — 其他语言的结果可能出乎意料。
:::

本节中的函数还假设被搜索的字符串（在本节中称为 `haystack`）和搜索字符串（在本节中称为 `needle`）是单字节编码文本。如果这一假设被违反，则不会抛出异常，结果是未定义的。使用 UTF-8 编码字符串的搜索通常通过单独的函数变体提供。同样，如果使用了 UTF-8 函数变体并且输入字符串不是 UTF-8 编码文本，则不会抛出异常，结果是未定义的。请注意，不执行自动 Unicode 规范化，然而，您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来实现。

[通用字符串函数](string-functions.md) 和 [替换字符串的函数](string-replace-functions.md) 被单独描述。
## position {#position}

返回子字符串 `needle` 在字符串 `haystack` 中的位置（以字节为单位，从 1 开始）。

**语法**

```sql
position(haystack, needle[, start_pos])
```

别名：
- `position(needle IN haystack)`

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md) 或 [Enum](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[String](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（以 1 为基数）。[UInt](../data-types/int-uint.md)。可选。

**返回值**

- 如果找到子字符串，则返回以字节为单位、从 1 开始的起始位置。[UInt64](../data-types/int-uint.md)。
- 如果未找到子字符串，则返回 0。[UInt64](../data-types/int-uint.md)。

如果子字符串 `needle` 为空，适用以下规则：
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

带 `start_pos` 参数的示例：

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

使用 `needle IN haystack` 语法的示例：

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

像 [position](#position) 但交换了参数 `haystack` 和 `locate`。

此函数的行为取决于 ClickHouse 的版本：
- 在版本 < v24.3 中，`locate` 是 `position` 函数的别名，并接受参数 `(haystack, needle[, start_pos])`。
- 在版本 >= 24.3 中，`locate` 是一个独立的函数（为了更好的与 MySQL 兼容），接受参数 `(needle, haystack[, start_pos])`。可以使用设置 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) 恢复先前的行为。

**语法**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

[例如](#position) 的不区分大小写变体。

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

函数 `positionUTF8` 正确将字符 `ö`（由两个点表示）计算为单个 Unicode 代码点：

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

类似于 [positionUTF8](#positionutf8)，但不区分大小写地搜索。
## multiSearchAllPositions {#multisearchallpositions}

类似于 [position](#position)，但返回一个数组，其中包含多个 `needle` 子字符串在 `haystack` 字符串中的位置（以字节为单位，从 1 开始）。

:::note
所有 `multiSearch*()` 函数仅支持最多 2<sup>8</sup> 个针。
:::

**语法**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回起始位置的数组，以字节为单位，从 1 开始。
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

像 [multiSearchAllPositions](#multisearchallpositions)，但忽略大小写。

**语法**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回起始位置的数组，以字节为单位，从 1 开始。
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

- `haystack` — 进行搜索的 UTF-8 编码字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回起始位置的数组，以字节为单位，从 1 开始。
- 如果未找到子字符串，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，查找 `C`（`\x43`）和 `H`（`\x48`）的位置。

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

- `haystack` — 进行搜索的 UTF-8 编码字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 编码子字符串。[Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回起始位置的数组，以字节为单位，从 1 开始。
- 如果未找到子字符串，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，查找 `c`（`\x63`）和 `h`（`\x68`）的位置。

查询：

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

结果：

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

像 [`position`](#position)，但返回 `haystack` 字符串中匹配多个 `needle` 字符串的最左边偏移量。

函数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) 和 [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) 提供此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。[Array](../data-types/array.md)。

**返回值**

- 找到匹配多个 `needle` 字符串的 `haystack` 字符串的最左边偏移量。
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

像 [`multiSearchFirstPosition`](#multisearchfirstposition) 但忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到匹配多个 `needle` 字符串的 `haystack` 字符串的最左边偏移量。
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

像 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 是 UTF-8 字符串。

**语法**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到匹配多个 `needle` 字符串的 `haystack` 字符串的最左边偏移量。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `hello world` 中与给定针匹配的最左边的偏移量。

查询：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

像 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假设 `haystack` 和 `needle` 是 UTF-8 字符串并忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到匹配多个 `needle` 字符串的 `haystack` 字符串的最左边偏移量，忽略大小写。
- 如果没有匹配，则返回 0。

**示例**

查找 UTF-8 字符串 `HELLO WORLD` 中与给定针匹配的最左边的偏移量。

查询：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

返回字符串 `haystack` 中最左边找到的 needle<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。

函数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) 和 [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到的最左边的 needle 的索引（从 1 开始）。如果没有找到，则返回 0。[UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中最左边找到的 needle<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到的最左边的 needle 的索引（从 1 开始）。如果没有找到，则返回 0。[UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中最左边找到的 needle<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假设 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到的最左边的 needle 的索引（从 1 开始）。如果没有找到，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

给定 `Hello World` 作为 UTF-8 字符串，找到 UTF-8 字符串 `Hello` 和 `World` 的第一个索引。

查询：

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

结果：

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

返回字符串 `haystack` 中最左边找到的 needle<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假设 `haystack` 和 `needle` 是 UTF-8 编码的字符串。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。[Array](../data-types/array.md)。

**返回值**

- 找到的最左边的 needle 的索引（从 1 开始）。如果没有找到，则返回 0。[UInt8](../data-types/int-uint.md)。

**示例**

给定 `HELLO WORLD` 作为 UTF-8 字符串，找到 UTF-8 字符串 `hello` 和 `world` 的第一个索引。

查询：

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

结果：

```response
1
```
## multiSearchAny {#multisearchany}

如果至少有一个字符串 needle<sub>i</sub> 与字符串 `haystack` 匹配，则返回 1，否则返回 0。

函数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) 和 [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

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

像 [multiSearchAny](#multisearchany)，但忽略大小写。

**语法**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的子字符串数组。[Array](../data-types/array.md)。

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

类似于 [multiSearchAny](#multisearchany)，但假设 `haystack` 和 `needle` 子字符串是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个匹配。
- 0，如果没有至少一个匹配。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查单词中是否包含字母 `C`（'\x43'）或 `H`（'\x48'）。

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

- `haystack` — 进行搜索的 UTF-8 字符串。[String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串数组。[Array](../data-types/array.md)。

**返回值**

- 1，如果至少有一个不区分大小写的匹配。
- 0，如果没有至少一个不区分大小写的匹配。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查单词中是否有字母 `h`（`\x68`），忽略大小写。

查询：

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

结果：

```response
1
```
## match {#match}

返回字符串 `haystack` 是否与正则表达式 `pattern` 匹配，使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax)。

匹配基于 UTF-8，例如，`.` 匹配 Unicode 代码点 `¥`，该代码点在 UTF-8 中使用两个字节表示。正则表达式中不得包含空字节。如果 haystack 或 pattern 不是有效的 UTF-8，则行为未定义。

与 re2 的默认行为不同，`.` 匹配换行符。要禁用此功能，可在模式前添加 `(?-s)`。

如果您只想在字符串中搜索子字符串，可以使用 [like](#like) 或 [position](#position) 函数，它们的性能比此函数快得多。

**语法**

```sql
match(haystack, pattern)
```

别名：`haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

像 `match` 但如果至少有一个模式匹配，则返回 1，否则返回 0。

:::note
`multi[Fuzzy]Match*()` 函数族使用 (Vectorscan)[https://github.com/VectorCamp/vectorscan] 库。因此，它们仅在 ClickHouse 编译时启用了对 vectorscan 的支持。

要关闭所有使用 hyperscan 的函数，请使用设置 `SET allow_hyperscan = 0;`。

由于 vectorscan 的限制，haystack 字符串的长度必须小于 2<sup>32</sup> 字节。

Hyperscan 通常容易受到正则表达式拒绝服务（ReDoS）攻击（例如，请参见 (here)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]，(here)[https://doi.org/10.1007/s10664-021-10033-1] 和 (here)[https://doi.org/10.1145/3236024.3236027]）。建议用户仔细检查提供的模式。
:::

如果您只想在字符串中搜索多个子字符串，可以使用函数 [multiSearchAny](#multisearchany)，因为它的性能比此函数更快。

**语法**

```sql
multiMatchAny(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAnyIndex {#multimatchanyindex}

像 `multiMatchAny` 但返回与 haystack 匹配的任何索引。

**语法**

```sql
multiMatchAnyIndex(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAllIndices {#multimatchallindices}

像 `multiMatchAny` 但返回与 haystack 匹配的所有索引的数组，顺序任意。

**语法**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

像 `multiMatchAny` 但如果任何模式在一个恒定的 [编辑距离](https://en.wikipedia.org/wiki/Edit_distance) 内与 haystack 匹配，则返回 1。此函数依赖于 [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) 库的实验特性，在某些极端情况下可能会缓慢。性能取决于编辑距离值和使用的模式，但总是比非模糊变体贵得多。

:::note
`multiFuzzyMatch*()` 函数族不支持 UTF-8 正则表达式（将其视为字节序列），由于 hyperscan 的限制。
:::

**语法**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

像 `multiFuzzyMatchAny` 但返回在恒定编辑距离内与 haystack 匹配的任何索引。

**语法**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

像 `multiFuzzyMatchAny` 但返回与 haystack 匹配的所有索引的数组，顺序任意，距离为常数。

**语法**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## extract {#extract}

返回字符串中正则表达式的第一个匹配。如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

如果正则表达式具有捕获组，则该函数会将输入字符串与第一个捕获组进行匹配。

**语法**

```sql
extract(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 在 haystack 字符串中，第一个匹配的正则表达式。[String](../data-types/string.md)。

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

返回字符串中正则表达式的所有匹配数组。如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。

与子模式相关的行为与 [`extract`](#extract) 函数相同。

**语法**

```sql
extractAll(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 在 haystack 字符串中，正则表达式的匹配数组。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

使 `haystack` 字符串的所有组与 `pattern` 正则表达式相匹配。返回一个数组的数组，其中第一个数组包含与第一个组匹配的所有片段，第二个数组 - 与第二组匹配，等等。

此函数比 [extractAllGroupsVertical](#extractallgroupsvertical) 慢。

**语法**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配的数组的数组。[Array](../data-types/array.md)。

:::note
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空数组的数组。
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

使用给定正则表达式与给定输入字符串匹配所有组，返回匹配的数组的数组。

**语法**

```sql
extractGroups(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配的数组的数组。[Array](../data-types/array.md)。

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

使用 `pattern` 正则表达式与 `haystack` 字符串的所有组进行匹配。返回一个数组的数组，其中每个数组包括来自每个组的匹配片段。片段按 `haystack` 中的出现顺序分组。

**语法**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。[String](../data-types/string.md)。
- `pattern` — 使用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。[String](../data-types/string.md)。

**返回值**

- 匹配的数组的数组。[Array](../data-types/array.md)。

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

- `%` 表示任意数量的任意字符（包括零个字符）。
- `_` 表示一个任意字符。
- `\` 用于转义字面量 `%`、`_` 和 `\`。

匹配基于 UTF-8，例如，`_` 匹配 Unicode 代码点 `¥`，该代码点在 UTF-8 中使用两个字节表示。

如果 haystack 或 LIKE 表达式不是有效的 UTF-8，则行为未定义。

不执行自动 Unicode 规范化，您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来实现这一点。

要匹配字面量 `%`、`_` 和 `\`（它们是 LIKE 元字符），请在其前面加上反斜杠：`\%`、`\_` 和 `\\`。
如果反斜杠前面的字符与 `%`、`_` 或 `\` 不同，则反斜杠失去特殊含义（即被字面解释）。
请注意，ClickHouse 要求字符串中的反斜杠 [也被引用](../syntax.md#string)，所以您实际上需要写 `\\%`、`\\_` 和 `\\\\`。

对于形如 `%needle%` 的 LIKE 表达式，此函数的速度与 `position` 函数相同。
所有其他 LIKE 表达式在内部转换为正则表达式，并以与 `match` 函数类似的性能执行。

**语法**

```sql
like(haystack, pattern)
```

别名：`haystack LIKE pattern`（运算符）
## notLike {#notlike}

像 `like` 但否定结果。

别名：`haystack NOT LIKE pattern`（运算符）
## ilike {#ilike}

像 `like` 但不区分大小写。

别名：`haystack ILIKE pattern`（运算符）
## notILike {#notilike}

像 `ilike` 但否定结果。

别名：`haystack NOT ILIKE pattern`（运算符）
## ngramDistance {#ngramdistance}

计算 `haystack` 字符串和 `needle` 字符串之间的 4-gram 距离。为此，它计算两个多集的 4-gram 的对称差，并通过它们的基数之和进行归一化。返回一个介于 0 和 1 之间的 [Float32](/sql-reference/data-types/float) 值。结果越小，字符串之间越相似。

函数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 变体。

**语法**

```sql
ngramDistance(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示两个字符串之间的相似性。[Float32](/sql-reference/data-types/float)

**实施细节**

如果常量 `needle` 或 `haystack` 参数超过 32Kb，函数将抛出异常。如果任何非常量的 `haystack` 或 `needle` 参数超过 32Kb，则距离始终为 1。

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

两个字符串之间的相似性越低，结果就越大。

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

- `haystack`: 第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示两个字符串之间的相似性。[Float32](/sql-reference/data-types/float)

**示例**

使用 [ngramDistance](#ngramdistance) 时，大小写的差异会影响相似性值：

查询：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

结果：

```response
0.71428573
```

使用 [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) 时，大小写被忽略，因此两个仅在大小写上不同的相同字符串现在将返回一个较低的相似性值：

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

- `haystack`: 第一个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示两个字符串之间的相似性。[Float32](/sql-reference/data-types/float)

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

- `haystack`: 第一个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示两个字符串之间的相似性。[Float32](/sql-reference/data-types/float)

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

像 `ngramDistance` 但计算 `needle` 字符串与 `haystack` 字符串之间的非对称差，即从针中减去公共的 n-gram 数，并通过 `needle` n-gram 数进行归一化。返回一个介于 0 和 1 之间的 [Float32](/sql-reference/data-types/float) 值。结果越大，`needle` 越可能出现在 `haystack` 中。此函数对模糊字符串搜索非常有用。另请参阅函数 [`soundex`](../../sql-reference/functions/string-functions#soundex)。

函数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 变体。

**语法**

```sql
ngramSearch(haystack, needle)
```

**参数**

- `haystack`: 第一个比较字符串。[String literal](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。[String literal](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。[Float32](/sql-reference/data-types/float)

**实施细节**

:::note
UTF-8 变体使用 3-gram 距离。这些并不是完全公平的 n-gram 距离。我们使用 2 字节哈希来散列 n-gram，然后计算这些哈希表之间的（非）对称差 — 可能会发生冲突。使用 UTF-8 不区分大小写格式时，我们不使用公平的 `tolower` 函数，而是将每个代码点字节的第 5 位（从零开始）和多个字节的第 0 位的第 1 位归零 — 这适用于拉丁字母和几乎所有西里尔字母。
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

- `haystack`: 第一个比较字符串。 [字符串字面量](/sql-reference/syntax#string)
- `needle`: 第二个比较字符串。 [字符串字面量](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越大。

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

提供一个 UTF-8 版本的 [ngramSearch](#ngramsearch)，其中 `needle` 和 `haystack` 被假定为 UTF-8 编码字符串。

**语法**

```sql
ngramSearchUTF8(haystack, needle)
```

**参数**

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [字符串字面量](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [字符串字面量](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越大。

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

- `haystack`: 第一个 UTF-8 编码的比较字符串。 [字符串字面量](/sql-reference/syntax#string)
- `needle`: 第二个 UTF-8 编码的比较字符串。 [字符串字面量](/sql-reference/syntax#string)

**返回值**

- 介于 0 和 1 之间的值，表示 `needle` 在 `haystack` 中的可能性。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 在 `haystack` 中的可能性就越大。

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

函数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) 和 [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) 分别提供不区分大小写和不区分大小写 + UTF-8 的此函数变体。

**语法**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 搜索开始时 `haystack` 中的位置（以 1 为基准）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现的次数。 [UInt64](../data-types/int-uint.md)。

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

返回子字符串 `needle` 在字符串 `haystack` 中出现的次数。 忽略大小写。

**语法**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 搜索开始时 `haystack` 中的位置（以 1 为基准）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现的次数。 [UInt64](../data-types/int-uint.md)。

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

返回子字符串 `needle` 在字符串 `haystack` 中出现的次数。 忽略大小写，并假设 `haystack` 是 UTF8 字符串。

**语法**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**参数**

- `haystack` — UTF-8 字符串，搜索将进行。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 搜索开始时 `haystack` 中的位置（以 1 为基准）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 出现的次数。 [UInt64](../data-types/int-uint.md)。

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

返回在 `haystack` 中模式 `pattern` 的正则表达式匹配数量。

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

返回在 haystack 中的模式的正则表达式匹配数量，类似于 [`countMatches`](#countmatches)，但匹配时忽略大小写。

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

提取在 `haystack` 中与正则表达式模式匹配的第一个字符串，并对应到正则表达式组索引。

**语法**

别名：`REGEXP_EXTRACT(haystack, pattern[, index])`。

**参数**

- `haystack` — 字符串，其中将匹配正则表达式模式。 [字符串](../data-types/string.md)。
- `pattern` — 字符串，正则表达式，必须是常量。 [字符串](../data-types/string.md)。
- `index` – 一个大于或等于 0 的整数，默认值为 1。它表示要提取哪个正则表达式组。 [UInt 或 Int](../data-types/int-uint.md)。 可选。

**返回值**

`pattern` 可能包含多个正则表达式组，`index` 指示要提取哪个正则表达式组。 0 的索引表示匹配整个正则表达式。 [字符串](../data-types/string.md)。

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
字符串的子序列是通过删除一个或多个元素而不改变剩余元素的顺序从给定字符串派生的序列。

**语法**

```sql
hasSubsequence(haystack, needle)
```

**参数**

- `haystack` — 搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 1，如果 needle 是 haystack 的子序列，0 否则。 [UInt8](../data-types/int-uint.md)。

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

- `haystack` — 搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 1，如果 needle 是 haystack 的子序列，0 否则。 [UInt8](../data-types/int-uint.md)。

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

- `haystack` — 搜索的字符串。 UTF-8 编码 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码 [字符串](../data-types/string.md)。

**返回值**

- 1，如果 needle 是 haystack 的子序列，0 否则。 [UInt8](../data-types/int-uint.md)。

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

- `haystack` — 搜索的字符串。 UTF-8 编码 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码 [字符串](../data-types/string.md)。

**返回值**

- 1，如果 needle 是 haystack 的子序列，0 否则。 [UInt8](../data-types/int-uint.md)。

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

如果给定的标记出现在 `haystack` 中，则返回 1，否则返回 0。

**语法**

```sql
hasToken(haystack, token)
```

**参数**

- `haystack`: 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 在两个非字母数字 ASCII 字符（或 `haystack` 边界）之间的最大长度子字符串。

**返回值**

- 1，如果标记在 haystack 中存在，0 否则。 [UInt8](../data-types/int-uint.md)。

**实现细节**

标记必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

查询：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```

## hasTokenOrNull {#hastokenornull}

如果给定的标记存在，则返回 1，如果不存在，则返回 0，如果标记格式错误，则返回 null。

**语法**

```sql
hasTokenOrNull(haystack, token)
```

**参数**

- `haystack`: 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 在两个非字母数字 ASCII 字符（或 `haystack` 边界）之间的最大长度子字符串。

**返回值**

- 1，如果标记在 haystack 中存在；如果不存，则返回 0，如果标记格式错误，则返回 null。

**实现细节**

标记必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

如果 `hasToken` 对格式错误的标记抛出错误，则 `hasTokenOrNull` 对格式错误的标记返回 `null`。

查询：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```

## hasTokenCaseInsensitive {#hastokencaseinsensitive}

如果给定的标记在 `haystack` 中存在，则返回 1，否则返回 0。忽略大小写。

**语法**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**参数**

- `haystack`: 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 在两个非字母数字 ASCII 字符（或 `haystack` 边界）之间的最大长度子字符串。

**返回值**

- 1，如果标记在 haystack 中存在，0 否则。 [UInt8](../data-types/int-uint.md)。

**实现细节**

标记必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

查询：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```

## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitivedornull}

如果给定的标记在 `haystack` 中存在，则返回 1，否则返回 0。忽略大小写，并在标记格式错误时返回 null。

**语法**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**参数**

- `haystack`: 搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`: 在两个非字母数字 ASCII 字符（或 `haystack` 边界）之间的最大长度子字符串。

**返回值**

- 1，如果标记在 haystack 中存在，0 如果标记不存在，否则 [`null`](../data-types/nullable.md) 如果标记格式错误。 [UInt8](../data-types/int-uint.md)。

**实现细节**

标记必须是常量字符串。由 tokenbf_v1 索引特化支持。

**示例**

如果 `hasTokenCaseInsensitive` 对格式错误的标记抛出错误，则 `hasTokenCaseInsensitiveOrNull` 对格式错误的标记返回 `null`。

查询：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
