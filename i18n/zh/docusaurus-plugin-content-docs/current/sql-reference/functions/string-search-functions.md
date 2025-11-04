---
'description': '查找字符串的函数的文档'
'sidebar_label': '字符串搜索'
'slug': '/sql-reference/functions/string-search-functions'
'title': '查找字符串的函数'
'doc_type': 'reference'
---



# 字符串搜索函数

本节中的所有函数默认为区分大小写搜索。区分大小写的搜索通常由单独的函数变体提供。

:::note
不区分大小写的搜索遵循英语的大小写规则。例如，在英语中大写的 `i` 是 `I`，而在土耳其语中是 `İ` - 非英语语言的结果可能会意外。
:::

本节中的函数还假设被搜索的字符串（在本节中称为 `haystack`）和搜索字符串（在本节中称为 `needle`）为单字节编码文本。如果违反此假设，则不会抛出异常，结果是未定义的。使用 UTF-8 编码字符串的搜索通常由单独的函数变体提供。同样，如果使用了 UTF-8 函数变体且输入字符串不是 UTF-8 编码文本，则不会抛出异常，结果是未定义的。请注意，没有进行自动 Unicode 规范化，但您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来实现这一点。

[通用字符串函数](string-functions.md) 和 [字符串替换函数](string-replace-functions.md) 被单独描述。
## position {#position}

返回子字符串 `needle` 在字符串 `haystack` 中的位置（以字节为单位，从 1 开始）。

**语法**

```sql
position(haystack, needle[, start_pos])
```

别名：
- `position(needle IN haystack)`

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md) 或 [Enum](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [String](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1）。 [UInt](../data-types/int-uint.md)。 可选。

**返回值**

- 如果找到子字符串，则返回以字节为单位且从 1 开始的起始位置。 [UInt64](../data-types/int-uint.md)。
- 如果未找到子字符串，则返回 0。 [UInt64](../data-types/int-uint.md)。

如果子字符串 `needle` 为空，则适用以下规则：
- 如果未指定 `start_pos`：返回 `1`
- 如果 `start_pos = 0`：返回 `1`
- 如果 `start_pos >= 1` 且 `start_pos <= length(haystack) + 1`：返回 `start_pos`
- 否则：返回 `0`

相同规则也适用于函数 `locate`、`positionCaseInsensitive`、`positionUTF8` 和 `positionCaseInsensitiveUTF8`。

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

类似于 [position](#position)，但参数 `haystack` 和 `locate` 交换位置。

此函数的行为取决于 ClickHouse 的版本：
- 在版本 < v24.3 中，`locate` 是函数 `position` 的别名，接受参数 `(haystack, needle[, start_pos])`。
- 在版本 >= 24.3 中，`locate` 是一个独立的函数（为了更好地与 MySQL 兼容），接受参数 `(needle, haystack[, start_pos])`。可以使用设置 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) 恢复之前的行为。

**语法**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

[Position](#position) 的不区分大小写版本。

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

类似于 [position](#position)，但假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**示例**

函数 `positionUTF8` 正确将字符 `ö`（由两个点表示）计为一个 Unicode 代码点：

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
所有 `multiSearch*()` 函数最多仅支持 2<sup>8</sup> 个 `needle`。
:::

**语法**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位且从 1 开始的起始位置的数组。
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

- 如果找到子字符串，则返回以字节为单位且从 1 开始的起始位置的数组。
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

类似于 [multiSearchAllPositions](#multisearchallpositions)，但假定 `haystack` 和 `needle` 子字符串是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 编码的字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — UTF-8 编码的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位且从 1 开始的起始位置的数组。
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

- `haystack` — UTF-8 编码的字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — UTF-8 编码的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果找到子字符串，则返回以字节为单位且从 1 开始的起始位置的数组。
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

类似于 [`position`](#position)，但返回在 `haystack` 字符串中匹配任意多个 `needle` 字符串的最左偏移量。

函数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) 和 [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) 提供了此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中匹配任意多个 `needle` 字符串的最左偏移量。
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
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中匹配任意多个 `needle` 字符串的最左偏移量。
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

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假定 `haystack` 和 `needle` 是 UTF-8 字符串。

**语法**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中匹配任意多个 `needle` 字符串的最左偏移量。
- 如果没有匹配，则返回 0。

**示例**

在 UTF-8 字符串 `hello world` 中，查找任意给定 `needle` 的最左偏移量。

查询：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

类似于 [`multiSearchFirstPosition`](#multisearchfirstposition)，但假定 `haystack` 和 `needle` 是 UTF-8 字符串并忽略大小写。

**语法**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串。 [Array](../data-types/array.md)。

**返回值**

- 在 `haystack` 字符串中匹配任意多个 `needle` 字符串的最左偏移量，忽略大小写。
- 如果没有匹配，则返回 0。

**示例**

在 UTF-8 字符串 `HELLO WORLD` 中，查找任意给定 `needle` 的最左偏移量。

查询：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

结果：

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

返回字符串 `haystack` 中找到的最左 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。

函数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) 和 [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) 提供了不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 找到的最左 `needle` 的索引（从 1 开始）。否则，如果没有匹配，则返回 0。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中找到的最左 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 找到的最左 `needle` 的索引（从 1 开始）。否则，如果没有匹配，则返回 0。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中找到的最左 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。 [Array](../data-types/array.md)

**返回值**

- 找到的最左 `needle` 的索引（从 1 开始）。否则，如果没有匹配，则返回 0。 [UInt8](../data-types/int-uint.md)。

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

返回字符串 `haystack` 中找到的最左 `needle`<sub>i</sub> 的索引 `i`（从 1 开始），否则返回 0。假定 `haystack` 和 `needle` 是 UTF-8 编码的字符串。忽略大小写。

**语法**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 字符串数组。 [Array](../data-types/array.md)。

**返回值**

- 找到的最左 `needle` 的索引（从 1 开始）。否则，如果没有匹配，则返回 0。 [UInt8](../data-types/int-uint.md)。

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

如果至少有一个字符串 `needle`<sub>i</sub> 与字符串 `haystack` 匹配，则返回 1，否则返回 0。

函数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) 和 [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) 提供了不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — 执行搜索的字符串。 [String](../data-types/string.md)。
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果至少有一个匹配，则返回 1。
- 如果没有匹配，则返回 0。

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
- `needle` — 要搜索的子字符串。 [Array](../data-types/array.md)

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

类似于 [multiSearchAny](#multisearchany)，但假定 `haystack` 和 `needle` 子字符串是 UTF-8 编码的字符串。

**语法**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**参数**

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串。 [Array](../data-types/array.md)。

**返回值**

- 如果至少有一个匹配，则返回 1。
- 如果没有至少一个匹配，则返回 0。

**示例**

给定 `ClickHouse` 作为 UTF-8 字符串，检查单词中是否有字母 `C`（`\x43`）或 `H`（`\x48`）。

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

- `haystack` — UTF-8 字符串，在其中执行搜索。 [String](../data-types/string.md)。
- `needle` — 要搜索的 UTF-8 子字符串。 [Array](../data-types/array.md)

**返回值**

- 如果至少有一个不区分大小写的匹配，则返回 1。
- 如果没有至少一个不区分大小写的匹配，则返回 0。

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
## hasAnyTokens {#hasanytokens}

:::note
此函数仅在设置 [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index) 被启用时可以使用。
:::

如果至少有一个字符串 `needle`<sub>i</sub> 与 `input` 列匹配，则返回 1，否则返回 0。

**语法**

```sql
hasAnyTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**参数**

- `input` — 输入列。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `needles` — 要搜索的令牌。最多支持 64 个令牌。 [Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
列 `input` 必须具有 [文本索引][../../engines/table-engines/mergetree-family/invertedindexes.md]。
:::

`input` 字符串由索引定义中的分词器进行分词。

每个 `needle` 数组元素 token<sub>i</sub> 被视为一个单一的令牌，即不再进一步分词。
例如，如果您想用索引 `tokenizer = ngrams(5)` 搜索 `ClickHouse`，提供这些 needles: `['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`。
要生成这些 needles，您可以使用 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数。
重复的令牌是无效的，例如，`['ClickHouse', 'ClickHouse']` 与 `['ClickHouse']` 是相同的。

**返回值**

- 如果至少有一个匹配，则返回 1。
- 否则返回 0。

**示例**

查询：

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAnyTokens(msg, ['a', 'd']);
```

结果：

```response
3
```

**使用 `tokens` 函数生成针**

查询：

```sql
SELECT count() FROM table WHERE hasAnyTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

结果：

```response
3
```
## hasAllTokens {#hasalltokens}

:::note
此函数仅在设置 [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index) 被启用时可以使用。
:::

类似于 [hasAnyTokens](#hasanytokens)，只有在所有字符串 `needle`<sub>i</sub> 与 `input` 列匹配时才返回 1，否则返回 0。

**语法**

```sql
hasAllTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**参数**

- `input` — 输入列。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `needles` — 要搜索的令牌。最多支持 64 个令牌。 [Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
列 `input` 必须具有 [文本索引][../../engines/table-engines/mergetree-family/invertedindexes.md]。
:::

`input` 字符串由索引定义中的分词器进行分词。

每个 `needle` 数组元素 token<sub>i</sub> 被视为一个单一的令牌，即不再进一步分词。
例如，如果您想用索引 `tokenizer = ngrams(5)` 搜索 `ClickHouse`，提供这些 needles: `['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`。
要生成这些 needles，您可以使用 [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 函数。
重复的令牌是无效的，例如，`['ClickHouse', 'ClickHouse']` 与 `['ClickHouse']` 是相同的。

**返回值**

- 如果所有 needle 匹配，则返回 1。
- 否则返回 0。

**示例**

查询：

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAllTokens(msg, ['a', 'd']);
```

结果：

```response
1
```

**使用 `tokens` 函数生成针**

查询：

```sql
SELECT count() FROM table WHERE hasAllTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

结果：

```response
1
```
## match {#match}

返回字符串 `haystack` 是否与正则表达式 `pattern` 匹配，[re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax)。

匹配是基于 UTF-8 的，例如 `.` 匹配 Unicode 代码点 `¥`，其在 UTF-8 中使用两个字节表示。正则表达式中不得包含空字节。如果 haystack 或模式不是有效 UTF-8，则行为是未定义的。

与 re2 的默认行为不同，`.` 匹配换行符。要禁用此功能，请在模式前添加 `(?-s)`。

如果您只想在字符串中查找子字符串，可以使用函数 [like](#like) 或 [position](#position)，它们的速度比此函数快得多。

**语法**

```sql
match(haystack, pattern)
```

别名：`haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

类似于 `match`，但如果至少有一个模式匹配，则返回 1，否则返回 0。

:::note
`multi[Fuzzy]Match*()` 函数系列使用 (Vectorscan)[https://github.com/VectorCamp/vectorscan] 库。因此，它们仅在 ClickHouse 被编译为支持 vectorscan 时启用。

要关闭所有使用 hyperscan 的函数，请使用设置 `SET allow_hyperscan = 0;`。

由于 vectorscan 的限制，`haystack` 字符串的长度必须小于 2<sup>32</sup> 字节。

Hyperscan 通常容易受到正则表达式拒绝服务（ReDoS）攻击（例如，请参见 (here)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(here)[https://doi.org/10.1007/s10664-021-10033-1] 和 (here)[https://doi.org/10.1145/3236024.3236027]）。建议用户仔细检查提供的模式。
:::

如果您只想在字符串中搜索多个子字符串，可以使用函数 [multiSearchAny](#multisearchany)，它的速度比此函数快得多。

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

类似于 `multiMatchAny`，但返回所有匹配 `haystack` 的索引数组，顺序无关。

**语法**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

类似于 `multiMatchAny`，但如果任何模式在某个常量 [编辑距离](https://en.wikipedia.org/wiki/Edit_distance) 内匹配 `haystack`，则返回 1。此函数依赖于 [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) 库的实验性功能，并且对于某些极端情况可能很慢。性能依赖于编辑距离值和使用的模式，但始终比非模糊变体更昂贵。

:::note
`multiFuzzyMatch*()` 函数系列不支持 UTF-8 正则表达式（因为它将其视为字节序列），这受到 hyperscan 的限制。
:::

**语法**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

类似于 `multiFuzzyMatchAny`，但返回在常量编辑距离内与 `haystack` 匹配的任何索引。

**语法**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

类似于 `multiFuzzyMatchAny`，但返回在常量编辑距离内与 `haystack` 匹配的所有索引的数组，顺序无关。

**语法**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## extract {#extract}

返回字符串中正则表达式的第一个匹配。
如果 `haystack` 不匹配 `pattern` 正则表达式，则返回空字符串。 

如果正则表达式有捕获组，函数将输入字符串与第一个捕获组匹配。

**语法**

```sql
extract(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 采用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 在 haystack 字符串中正则表达式的第一个匹配。 [String](../data-types/string.md)。

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

与子模式的行为与函数 [`extract`](#extract) 相同。

**语法**

```sql
extractAll(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 采用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。

**返回值**

- 在 haystack 字符串中正则表达式的匹配数组。 [Array](../data-types/array.md)([String](../data-types/string.md))。

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

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，其中第一个数组包含所有匹配第一个组的片段，第二个数组匹配第二组，依此类推。

此函数比 [extractAllGroupsVertical](#extractallgroupsvertical) 速度慢。

**语法**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 采用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。 [String](../data-types/string.md)。

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

使用给定的正则表达式匹配给定输入字符串的所有组，返回匹配的数组数组。

**语法**

```sql
extractGroups(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 采用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。 [String](../data-types/string.md)。

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

使用 `pattern` 正则表达式匹配 `haystack` 字符串的所有组。返回一个数组的数组，其中每个数组包含来自每个组的匹配片段。片段按 `haystack` 中的出现顺序分组。

**语法**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**参数**

- `haystack` — 输入字符串。 [String](../data-types/string.md)。
- `pattern` — 采用 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。必须包含组，每个组用括号括起来。如果 `pattern` 不包含组，则会抛出异常。 [String](../data-types/string.md)。

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

LIKE 表达式可以包含正常字符和以下元符号：

- `%` 表示任意数量的任意字符（包括零个字符）。
- `_` 表示单个任意字符。
- `\` 用于转义字面量 `%`、`_` 和 `\`。

匹配是基于 UTF-8 的，例如 `_` 匹配 Unicode 代码点 `¥`，其在 UTF-8 中使用两个字节表示。

如果 haystack 或 LIKE 表达式不是有效的 UTF-8，则行为是未定义的。

没有进行自动 Unicode 规范化，您可以使用 [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 函数来实现这一点。

要匹配字面 `%`、`_` 和 `\`（即 LIKE 元字符），请在它们前面加上一个反斜杠：`\%`、`\_` 和 `\\`。
如果反斜杠前附加的字符不是 `%`、`_` 或 `\\`，则反斜杠失去其特殊含义（即被字面解释）。
请注意，ClickHouse 还需要将字符串中的反斜杠 [进行转义](../syntax.md#string)，因此您实际上需要写 `\\%`、`\\_` 和 `\\\\`。

对于 `%needle%` 形式的 LIKE 表达式，该函数的速度与 `position` 函数相同。
所有其他 LIKE 表达式内部转换为正则表达式，并以与 `match` 函数相似的性能执行。

**语法**

```sql
like(haystack, pattern)
```

别名：`haystack LIKE pattern` (操作符)
## notLike {#notlike}

类似于 `like`，但否定结果。

别名：`haystack NOT LIKE pattern` (操作符)
## ilike {#ilike}

类似于 `like`，但不区分大小写进行搜索。

别名：`haystack ILIKE pattern` (操作符)
## notILike {#notilike}

类似于 `ilike`，但否定结果。

别名：`haystack NOT ILIKE pattern` (操作符)
## ngramDistance {#ngramdistance}

计算 `haystack` 字符串和 `needle` 字符串之间的 4-gram 距离。为此，它计算两个 4-grams 的对称差，并通过它们的基数总和进行归一化。返回一个 [Float32](/sql-reference/data-types/float)，范围在 0 到 1 之间。结果越小，字符串之间越相似。

函数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8) 和 [`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) 提供不区分大小写和/或 UTF-8 的变体。

**语法**

```sql
ngramDistance(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 0 到 1 之间的值表示两个字符串之间的相似度。 [Float32](/sql-reference/data-types/float)

**实现细节**

如果常量 `needle` 或 `haystack` 参数超过 32Kb，则此函数将抛出异常。如果任何非常量 `haystack` 或 `needle` 参数超过 32Kb，则距离总是返回 1。

**示例**

两个字符串越相似，结果值越接近 0（完全相同）。

查询：

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

结果：

```response
0.06666667
```

两个字符串越不相似，结果值越大。
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

- `haystack`：第一个比较字符串。 [String literal](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。 [String literal](/sql-reference/syntax#string)

**返回值**

- 0 到 1 之间的值表示两个字符串之间的相似度。 [Float32](/sql-reference/data-types/float)

**示例**

使用 [ngramDistance](#ngramdistance) 时，大小写的不同会影响相似度值：

查询：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

结果：

```response
0.71428573
```

使用 [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) 时，大小写被忽略，因此仅在大小写不同的两个相同字符串现在将返回一个低的相似度值：

查询：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

结果：

```response
0
```

## ngramDistanceUTF8 {#ngramdistanceutf8}

提供了一个 UTF-8 变体的 [ngramDistance](#ngramdistance)。假设 `needle` 和 `haystack` 字符串为 UTF-8 编码的字符串。

**语法**

```sql
ngramDistanceUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串之间相似度的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

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

提供了一个不区分大小写的 [ngramDistanceUTF8](#ngramdistanceutf8) 变体。

**语法**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示两个字符串之间相似度的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

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

类似于 `ngramDistance` ，但计算 `needle` 字符串和 `haystack` 字符串之间的非对称差异，即 n-gram 的数量来自 needle 减去共同的 n-gram 数量，再根据 `needle` 的 n-gram 数量进行归一化。返回一个值在 0 和 1 之间的 [Float32](/sql-reference/data-types/float)。结果越大，`needle` 出现在 `haystack` 中的可能性越大。此函数对于模糊字符串搜索很有用。也可以参考函数 [`soundex`](../../sql-reference/functions/string-functions#soundex)。

函数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) 提供了此函数的不区分大小写和/或 UTF-8 变体。

**语法**

```sql
ngramSearch(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示 `needle` 在 `haystack` 中的可能性的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

**实现细节**

:::note
UTF-8 变体使用 3-gram 距离。这些并不是完全公平的 n-gram 距离。我们使用 2 字节哈希来哈希 n-gram，然后计算这些哈希表之间的（非）对称差异 - 可能会发生哈希冲突。对于不区分大小写的 UTF-8 格式，我们不使用公平的 `tolower` 函数 - 我们将每个代码点字节的第 5 位（从零开始）以及如果字节大于一个的第零字节的第一位置零 - 这适用于拉丁字母和大多数西里尔字母。
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

提供了一个不区分大小写的 [ngramSearch](#ngramsearch) 变体。

**语法**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**参数**

- `haystack`：第一个比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示 `needle` 在 `haystack` 中的可能性的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 出现在 `haystack` 中的可能性越大。

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

提供了一个 UTF-8 变体的 [ngramSearch](#ngramsearch)，假设 `needle` 和 `haystack` 为 UTF-8 编码的字符串。

**语法**

```sql
ngramSearchUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示 `needle` 在 `haystack` 中的可能性的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 出现在 `haystack` 中的可能性越大。

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

提供了一个不区分大小写的 [ngramSearchUTF8](#ngramsearchutf8) 变体。

**语法**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack`：第一个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)
- `needle`：第二个 UTF-8 编码的比较字符串。 [字符串文字](/sql-reference/syntax#string)

**返回值**

- 表示 `needle` 在 `haystack` 中的可能性的值，范围为 0 到 1。 [Float32](/sql-reference/data-types/float)

结果越大，`needle` 出现在 `haystack` 中的可能性越大。

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

函数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) 和 [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) 提供了此函数的不区分大小写和不区分大小写 + UTF-8 变体。

**语法**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1）。 [UInt](../data-types/int-uint.md)。 可选。

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

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1）。 [UInt](../data-types/int-uint.md)。 可选。

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

- `haystack` — 进行搜索的 UTF-8 字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `needle` — 要搜索的子字符串。 [字符串](../data-types/string.md)。
- `start_pos` – 在 `haystack` 中开始搜索的位置（基于 1）。 [UInt](../data-types/int-uint.md)。 可选。

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

返回字符串 `haystack` 中与 `pattern` 匹配的正则表达式的数量。

此函数的行为取决于 ClickHouse 版本：
- 在版本 < v25.6 时，`countMatches` 会在第一个空匹配处停止计数，即使模式接受。
- 在版本 >= 25.6 时，`countMatches` 会在出现空匹配时继续执行。
  可以使用设置 [count_matches_stop_at_empty_match = true](/operations/settings/settings#count_matches_stop_at_empty_match) 恢复遗留行为。

**语法**

```sql
countMatches(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 带有 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

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

返回字符串 `haystack` 中与模式匹配的正则表达式的数量，类似于 [`countMatches`](#countmatches)，但匹配时忽略大小写。

**语法**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**参数**

- `haystack` — 要搜索的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 带有 [re2 正则表达式语法](https://github.com/google/re2/wiki/Syntax) 的正则表达式。 [字符串](../data-types/string.md)。

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

提取在 `haystack` 中与正则表达式模式匹配并对应于正则表达式组索引的第一个字符串。

**语法**

```sql
regexpExtract(haystack, pattern[, index])
```

别名：`REGEXP_EXTRACT(haystack, pattern[, index])`。

**参数**

- `haystack` — 要匹配正则表达式模式的字符串。 [字符串](../data-types/string.md)。
- `pattern` — 字符串，正则表达式，必须是常量。 [字符串](../data-types/string.md)。
- `index` – 整数，取值大于或等于 0，默认值为 1。它表示要提取的正则表达式组。 [UInt 或 Int](../data-types/int-uint.md)。 可选。

**返回值**

`pattern` 可能包含多个正则表达式组，`index` 指示要提取的正则表达式组。索引 0 意味着匹配整个正则表达式。 [字符串](../data-types/string.md)。

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

如果 `needle` 是 `haystack` 的子序列，则返回 1， 否则返回 0。
字符串的子序列是可以由给定字符串派生的序列，通过删除零或多个元素而不更改剩余元素的顺序。
**语法**

```sql
hasSubsequence(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 needle 是 haystack 的子序列，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

类似于 [hasSubsequence](#hassubsequence)，但不区分大小写搜索。

**语法**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 [字符串](../data-types/string.md)。

**返回值**

- 如果 needle 是 haystack 的子序列，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

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

类似于 [hasSubsequence](#hassubsequence)，但假设 `haystack` 和 `needle` 为 UTF-8 编码的字符串。

**语法**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 needle 是 haystack 的子序列，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

查询：

**示例**

```sql
SELECT hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

结果：

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

类似于 [hasSubsequenceUTF8](#hassubsequenceutf8)，但不区分大小写搜索。

**语法**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**参数**

- `haystack` — 进行搜索的字符串。 UTF-8 编码的 [字符串](../data-types/string.md)。
- `needle` — 要搜索的子序列。 UTF-8 编码的 [字符串](../data-types/string.md)。

**返回值**

- 如果 needle 是 haystack 的子序列，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

结果：

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasToken {#hastoken}

如果给定的 token 存在于 haystack 中，则返回 1，否则返回 0。

**语法**

```sql
hasToken(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符之间的最大长度子字符串（或 haystack 的边界）。

**返回值**

- 如果 token 存在于 haystack 中，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

Token 必须是常量字符串。受 tokenbf_v1 索引特殊化支持。

**示例**

查询：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

如果给定的 token 存在，则返回 1，如果不存在，则返回 0，如果 token 格式不正确，则返回 null。

**语法**

```sql
hasTokenOrNull(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符之间的最大长度子字符串（或 haystack 的边界）。

**返回值**

- 如果 token 存在于 haystack 中，则返回 1，如果不存在，则返回 0；如果 token 格式不正确，则返回 [`null`](../data-types/nullable.md)。 [UInt8](../data-types/int-uint.md)。

**实现细节**

Token 必须是常量字符串。受 tokenbf_v1 索引特殊化支持。

**示例**

如果 `hasToken` 对格式不正确的 token 抛出错误，`hasTokenOrNull` 则返回格式不正确的 token 对应的 `null`。

查询：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

如果给定的 token 存在于 haystack 中，则返回 1，否则返回 0。 忽略大小写。

**语法**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符之间的最大长度子字符串（或 haystack 的边界）。

**返回值**

- 如果 token 存在于 haystack 中，则返回 1，否则返回 0。 [UInt8](../data-types/int-uint.md)。

**实现细节**

Token 必须是常量字符串。受 tokenbf_v1 索引特殊化支持。

**示例**

查询：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

如果给定的 token 存在于 haystack 中，则返回 1，否则返回 0。 忽略大小写，并在 token 格式不正确时返回 null。

**语法**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**参数**

- `haystack`：进行搜索的字符串。 [字符串](../data-types/string.md) 或 [枚举](../data-types/enum.md)。
- `token`：两个非字母数字 ASCII 字符之间的最大长度子字符串（或 haystack 的边界）。

**返回值**

- 如果 token 存在于 haystack 中，则返回 1，如果 token 不存在，则返回 0，否则如果 token 格式不正确，则返回 [`null`](../data-types/nullable.md)。 [UInt8](../data-types/int-uint.md)。

**实现细节**

Token 必须是常量字符串。受 tokenbf_v1 索引特殊化支持。

**示例**

如果 `hasTokenCaseInsensitive` 对格式不正确的 token 抛出错误，`hasTokenCaseInsensitiveOrNull` 则返回格式不正确的 token 对应的 `null`。

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
