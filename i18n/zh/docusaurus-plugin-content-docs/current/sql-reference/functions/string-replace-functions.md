---
'description': 'Documentation for Functions for Replacing in Strings'
'sidebar_label': 'Replacing in Strings'
'sidebar_position': 150
'slug': '/sql-reference/functions/string-replace-functions'
'title': 'Functions for Replacing in Strings'
---




# 字符串替换函数

[通用字符串函数](string-functions.md) 和 [字符串搜索函数](string-search-functions.md) 单独描述。

## overlay {#overlay}

用另一个字符串 `replace` 替换字符串 `input` 的一部分，从基于1的索引 `offset` 开始。

**语法**

```sql
overlay(s, replace, offset[, length])
```

**参数**

- `s`: 字符串类型 [String](../data-types/string.md)。
- `replace`: 字符串类型 [String](../data-types/string.md)。
- `offset`: 整数类型 [Int](../data-types/int-uint.md)（基于1）。如果 `offset` 为负，它是从字符串 `s` 的末尾开始计算的。
- `length`: 可选。整数类型 [Int](../data-types/int-uint.md)。`length` 指定要替换的输入字符串 `s` 中的片段长度。如果未指定 `length`，从 `s` 中删除的字节数等于 `replace` 的长度；否则，删除 `length` 个字节。

**返回值**

- 一个 [String](../data-types/string.md) 数据类型值。

**示例**

```sql
SELECT overlay('My father is from Mexico.', 'mother', 4) AS res;
```

结果：

```text
┌─res──────────────────────┐
│ My mother is from Mexico.│
└──────────────────────────┘
```

```sql
SELECT overlay('My father is from Mexico.', 'dad', 4, 6) AS res;
```

结果：

```text
┌─res───────────────────┐
│ My dad is from Mexico.│
└───────────────────────┘
```

## overlayUTF8 {#overlayutf8}

用另一个字符串 `replace` 替换字符串 `input` 的一部分，从基于1的索引 `offset` 开始。

假定字符串包含有效的 UTF-8 编码文本。如果这一假设被违反，不会抛出异常，结果未定义。

**语法**

```sql
overlayUTF8(s, replace, offset[, length])
```

**参数**

- `s`: 字符串类型 [String](../data-types/string.md)。
- `replace`: 字符串类型 [String](../data-types/string.md)。
- `offset`: 整数类型 [Int](../data-types/int-uint.md)（基于1）。如果 `offset` 为负，它是从输入字符串 `s` 的末尾开始计算的。
- `length`: 可选。整数类型 [Int](../data-types/int-uint.md)。`length` 指定要替换的输入字符串 `s` 中的片段长度。如果未指定 `length`，从 `s` 中删除的字符数等于 `replace` 的长度；否则，删除 `length` 个字符。

**返回值**

- 一个 [String](../data-types/string.md) 数据类型值。

**示例**

```sql
SELECT overlay('Mein Vater ist aus Österreich.', 'der Türkei', 20) AS res;
```

结果：

```text
┌─res───────────────────────────┐
│ Mein Vater ist aus der Türkei.│
└───────────────────────────────┘
```

## replaceOne {#replaceone}

用 `replacement` 字符串替换 `haystack` 中子字符串 `pattern` 的第一次出现。

**语法**

```sql
replaceOne(haystack, pattern, replacement)
```

## replaceAll {#replaceall}

用 `replacement` 字符串替换 `haystack` 中子字符串 `pattern` 的所有出现。

**语法**

```sql
replaceAll(haystack, pattern, replacement)
```

别名: `replace`。

## replaceRegexpOne {#replaceregexpone}

用 `replacement` 字符串替换 `haystack` 中与正则表达式 `pattern` 匹配的子字符串的第一次出现。

`replacement` 可以包含替换 `\0-\9`。
替换 `\1-\9` 对应于第1到第9个捕获组（子匹配），替换 `\0` 对应于整个匹配。

要在 `pattern` 或 `replacement` 字符串中使用字面量的 `\` 字符，请使用 `\` 进行转义。
还要记住字符串字面量需要额外转义。

**语法**

```sql
replaceRegexpOne(haystack, pattern, replacement)
```

**示例**

将 ISO 日期转换为美国格式：

```sql
SELECT DISTINCT
    EventDate,
    replaceRegexpOne(toString(EventDate), '(\\d{4})-(\\d{2})-(\\d{2})', '\\2/\\3/\\1') AS res
FROM test.hits
LIMIT 7
FORMAT TabSeparated
```

结果：

```text
2014-03-17      03/17/2014
2014-03-18      03/18/2014
2014-03-19      03/19/2014
2014-03-20      03/20/2014
2014-03-21      03/21/2014
2014-03-22      03/22/2014
2014-03-23      03/23/2014
```

将字符串复制十次：

```sql
SELECT replaceRegexpOne('Hello, World!', '.*', '\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0') AS res
```

结果：

```text
┌─res────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World! │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## replaceRegexpAll {#replaceregexpall}

与 `replaceRegexpOne` 类似，但替换所有出现的模式。

别名: `REGEXP_REPLACE`。

**示例**

```sql
SELECT replaceRegexpAll('Hello, World!', '.', '\\0\\0') AS res
```

结果：

```text
┌─res────────────────────────┐
│ HHeelllloo,,  WWoorrlldd!! │
└────────────────────────────┘
```

作为例外，如果正则表达式在空子字符串上有效，则替换不会进行多于一次，例如：

```sql
SELECT replaceRegexpAll('Hello, World!', '^', 'here: ') AS res
```

结果：

```text
┌─res─────────────────┐
│ here: Hello, World! │
└─────────────────────┘
```

## regexpQuoteMeta {#regexpquotemeta}

在这些在正则表达式中具有特殊含义的字符前添加反斜杠：` \0`、` \\`、` |`、` (`、` )`、 `^`、` $`、` .`、` [`、` ]`、` ?`、` *`、` +`、` {`、` :`、` -`。

此实现与 re2::RE2::QuoteMeta 略有不同。它将零字节转义为 `\0` 而不是 `\x00`，仅转义所需字符。
有关更多信息，请参见 [RE2](https://github.com/google/re2/blob/master/re2/re2.cc#L473)。

**语法**

```sql
regexpQuoteMeta(s)
```

## format {#format}

使用参数中列出的值（字符串、整数等）格式化 `pattern` 字符串，类似于 Python 中的格式化。模式字符串可以包含用花括号 `{}` 包围的替换字段。未包含在花括号中的任何内容被视为文本并逐字复制到输出中。可以通过两个花括号转义字面量花括号字符：`{{ '{{' }}` 和 `{{ '}}' }}`。字段名称可以是数字（从零开始）或为空（则隐式赋予单调递增的数字）。

**语法**

```sql
format(pattern, s0, s1, ...)
```

**示例**

```sql
SELECT format('{1} {0} {1}', 'World', 'Hello')
```

```result
┌─format('{1} {0} {1}', 'World', 'Hello')─┐
│ Hello World Hello                       │
└─────────────────────────────────────────┘
```

带有隐式数字：

```sql
SELECT format('{} {}', 'Hello', 'World')
```

```result
┌─format('{} {}', 'Hello', 'World')─┐
│ Hello World                       │
└───────────────────────────────────┘
```

## translate {#translate}

使用 `from` 和 `to` 字符串定义的一对一字符映射替换字符串 `s` 中的字符。
`from` 和 `to` 必须是常量 ASCII 字符串。
如果 `from` 和 `to` 的大小相等，`first` 中第1个字符在 `s` 中的每次出现都将被 `to` 的第1个字符替换，`first` 中第2个字符在 `s` 中的每次出现都将被 `to` 的第2个字符替换，依此类推。
如果 `from` 中包含比 `to` 多的字符，则 `from` 末尾没有对应字符的所有字符的所有出现都将从 `s` 中删除。
`s` 中的非 ASCII 字符不会被该函数修改。

**语法**

```sql
translate(s, from, to)
```

**示例**

```sql
SELECT translate('Hello, World!', 'delor', 'DELOR') AS res
```

结果：

```text
┌─res───────────┐
│ HELLO, WORLD! │
└───────────────┘
```

`from` 和 `to` 参数的长度不同：

```sql
SELECT translate('clickhouse', 'clickhouse', 'CLICK') AS res
```

结果：

```text
┌─res───┐
│ CLICK │
└───────┘
```

## translateUTF8 {#translateutf8}

像 [translate](#translate) 但假设 `s`、`from` 和 `to` 是 UTF-8 编码字符串。

**语法**

```sql
translateUTF8(s, from, to)
```

**参数**

- `s`: 字符串类型 [String](../data-types/string.md)。
- `from`: 字符串类型 [String](../data-types/string.md)。
- `to`: 字符串类型 [String](../data-types/string.md)。

**返回值**

- 一个 [String](../data-types/string.md) 数据类型值。

**示例**

查询：

```sql
SELECT translateUTF8('Münchener Straße', 'üß', 'us') AS res;
```

```response
┌─res──────────────┐
│ Munchener Strase │
└──────────────────┘
```

## printf {#printf}

`printf` 函数格式化给定字符串，使用参数中列出的值（字符串、整数、浮点数等），类似于 C++ 中的 printf 函数。格式字符串可以包含以 `%` 字符开头的格式说明符。任何不包含在 `%` 和后续格式说明符中的内容被视为文本并逐字复制到输出。字面量 `%` 字符可以通过 `%%` 转义。

**语法**

```sql
printf(format, arg1, arg2, ...)
```

**示例**

查询：

```sql
select printf('%%%s %s %d', 'Hello', 'World', 2024);
``` 

```response
┌─printf('%%%s %s %d', 'Hello', 'World', 2024)─┐
│ %Hello World 2024                            │
└──────────────────────────────────────────────┘
```
