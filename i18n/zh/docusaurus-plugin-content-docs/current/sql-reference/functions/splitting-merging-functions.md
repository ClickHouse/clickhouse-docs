---
'description': '有关字符串拆分函数的文档'
'sidebar_label': '拆分字符串'
'sidebar_position': 165
'slug': '/sql-reference/functions/splitting-merging-functions'
'title': '字符串拆分函数'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 字符串拆分函数

## splitByChar {#splitbychar}

根据指定字符将字符串拆分为子字符串。使用一个由恰好一个字符组成的常量字符串 `separator`。
返回所选子字符串的数组。如果分隔符出现在字符串的开头或结尾，或者有多个连续的分隔符，则可能会选择空子字符串。

**语法**

```sql
splitByChar(separator, s[, max_substrings]))
```

**参数**

- `separator` — 分隔符必须是一个单字节字符。 [String](../data-types/string.md).
- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。如果 `max_substrings` > 0，返回的数组将最多包含 `max_substrings` 个子字符串，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

  可能会选择空子字符串的情况：

- 分隔符出现在字符串的开头或结尾；
- 存在多个连续的分隔符；
- 原始字符串 `s` 为空。

:::note
从 ClickHouse v22.11 开始，参数 `max_substrings` 的行为发生了变化。在早期版本中，`max_substrings > 0` 意味着执行 `max_substring` 次拆分，并将剩余的字符串作为列表的最后一个元素返回。
例如，
- 在 v22.10 中： `SELECT splitByChar('=', 'a=b=c=d', 2);` 返回 `['a','b','c=d']`
- 在 v22.11 中： `SELECT splitByChar('=', 'a=b=c=d', 2);` 返回 `['a','b']`

通过设置
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
可以实现类似于 ClickHouse 在 v22.11 之前的行为。
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**示例**

```sql
SELECT splitByChar(',', '1,2,3,abcde');
```

结果：

```text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

根据字符串将字符串拆分为子字符串。它使用一个由多个字符组成的常量字符串 `separator` 作为分隔符。如果字符串 `separator` 为空，则将字符串 `s` 拆分为单个字符的数组。

**语法**

```sql
splitByString(separator, s[, max_substrings]))
```

**参数**

- `separator` — 分隔符。 [String](../data-types/string.md).
- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。当 `max_substrings` > 0 时，返回的子字符串将不超过 `max_substrings`，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

  可能会选择空子字符串的情况：

- 非空分隔符出现在字符串的开头或结尾；
- 存在多个连续的非空分隔符；
- 原始字符串 `s` 为空而分隔符不为空。

:::note
设置 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)（默认值：0）控制在参数 `max_substrings` > 0 时，剩余字符串是否包含在结果数组的最后一个元素中。
:::

**示例**

```sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

结果：

```text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

```sql
SELECT splitByString('', 'abcde');
```

结果：

```text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

根据正则表达式将字符串拆分为子字符串。它使用正则表达式字符串 `regexp` 作为分隔符。如果 `regexp` 为空，则将字符串 `s` 拆分为单个字符的数组。如果没有找到与该正则表达式匹配的内容，则字符串 `s` 不会被拆分。

**语法**

```sql
splitByRegexp(regexp, s[, max_substrings]))
```

**参数**

- `regexp` — 正则表达式。常量。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md).
- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。当 `max_substrings` > 0 时，返回的子字符串将不超过 `max_substrings`，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

可能会选择空子字符串的情况：

- 非空正则表达式匹配出现在字符串的开头或结尾；
- 存在多个连续的非空正则表达式匹配；
- 原始字符串 `s` 为空而正则表达式不为空。

:::note
设置 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)（默认值：0）控制在参数 `max_substrings` > 0 时，剩余字符串是否包含在结果数组的最后一个元素中。
:::

**示例**

```sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

结果：

```text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

```sql
SELECT splitByRegexp('', 'abcde');
```

结果：

```text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

根据空白字符将字符串拆分为子字符串。
返回所选子字符串的数组。

**语法**

```sql
splitByWhitespace(s[, max_substrings]))
```

**参数**

- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。当 `max_substrings` > 0 时，返回的子字符串将不超过 `max_substrings`，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
设置 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)（默认值：0）控制在参数 `max_substrings` > 0 时，剩余字符串是否包含在结果数组的最后一个元素中。
:::

**示例**

```sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

结果：

```text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

根据空白和标点字符将字符串拆分为子字符串。
返回所选子字符串的数组。

**语法**

```sql
splitByNonAlpha(s[, max_substrings]))
```

**参数**

- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。当 `max_substrings` > 0 时，返回的子字符串将不超过 `max_substrings`，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
设置 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)（默认值：0）控制在参数 `max_substrings` > 0 时，剩余字符串是否包含在结果数组的最后一个元素中。
:::

**示例**

```sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

```text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

将数组中列出值的字符串表示连接起来，使用分隔符。`separator` 是一个可选参数：一个常量字符串，默认为空字符串。
返回字符串。

**语法**

```sql
arrayStringConcat(arr\[, separator\])
```

**示例**

```sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

结果：

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

选择从范围 a-z 和 A-Z 的连续字节的子字符串。返回子字符串的数组。

**语法**

```sql
alphaTokens(s[, max_substrings]))
```

别名: `splitByAlpha`

**参数**

- `s` — 要拆分的字符串。 [String](../data-types/string.md).
- `max_substrings` — 可选的 `Int64`，默认为 0。当 `max_substrings` > 0 时，返回的子字符串将不超过 `max_substrings`，否则该函数将返回尽可能多的子字符串。

**返回值**

- 所选子字符串的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
设置 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)（默认值：0）控制在参数 `max_substrings` > 0 时，剩余字符串是否包含在结果数组的最后一个元素中。
:::

**示例**

```sql
SELECT alphaTokens('abca1abc');
```

```text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

从由正则表达式匹配的非重叠子字符串中提取所有组。

**语法**

```sql
extractAllGroups(text, regexp)
```

**参数**

- `text` — [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md).
- `regexp` — 正则表达式。常量。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md).

**返回值**

- 如果该函数找到至少一个匹配组，则返回 `Array(Array(String))` 列，并按 group_id 分组（1 到 N，其中 N 是正则表达式中的捕获组数量）。如果没有匹配组，则返回一个空数组。 [Array](../data-types/array.md)。

**示例**

```sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

结果：

```text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

<DeprecatedBadge/>

将 UTF-8 字符串拆分为 `ngramsize` 个符号的 n-grams。
该函数已被弃用。建议使用 [tokens](#tokens) 和 `ngram` 分词器。
该函数可能在未来某个时间被移除。

**语法**

```sql
ngrams(string, ngramsize)
```

**参数**

- `string` — 字符串。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md).
- `ngramsize` — n-gram 的大小。 [UInt](../data-types/int-uint.md).

**返回值**

- n-grams 的数组。 [Array](../data-types/array.md)([String](../data-types/string.md)).

**示例**

```sql
SELECT ngrams('ClickHouse', 3);
```

结果：

```text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

使用给定的分词器将字符串拆分为标记。
默认分词器使用非字母数字 ASCII 字符作为分隔符。

**参数**

- `value` — 输入字符串。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md).
- `tokenizer` — 要使用的分词器。有效参数为 `default`、`ngram` 和 `noop`。可选，如果未明确设置，则默认为 `default`。 [const String](../data-types/string.md)
- `ngrams` — 仅在参数 `tokenizer` 为 `ngram` 时相关：一个可选参数，定义 n-grams 的长度。如果未明确设置，则默认为 `3`。 [UInt8](../data-types/int-uint.md).

**返回值**

- 从输入字符串生成的标记数组。 [Array](../data-types/array.md).

**示例**

使用默认设置：

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

结果：

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```

使用 ngram 分词器和 ngram 长度 3：

```sql
SELECT tokens('abc def', 'ngram', 3) AS tokens;
```

结果：

```text
┌─tokens──────────────────────────┐
│ ['abc','bc ','c d',' de','def'] │
└─────────────────────────────────┘
```
