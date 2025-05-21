---
'alias':
- 'TSV'
'description': 'TSV 格式的文档'
'input_format': true
'keywords':
- 'TabSeparated'
- 'TSV'
'output_format': true
'slug': '/interfaces/formats/TabSeparated'
'title': 'TabSeparated'
---



| 输入  | 输出   | 别名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 描述 {#description}

在TabSeparated格式中，数据按行写入。每一行包含用制表符分隔的值。每个值后面都跟随一个制表符，除了行中的最后一个值，它后面跟随的是换行符。严格假定所有地方都是Unix换行符。最后一行也必须在末尾包含一个换行符。值以文本格式写入，不带引号，并且特殊字符需转义。

此格式也可称为`TSV`。

`TabSeparated`格式便于使用自定义程序和脚本处理数据。它是HTTP接口和命令行客户端批处理模式中的默认格式。此格式还支持在不同数据库管理系统之间转移数据。例如，您可以从MySQL获取转储并上传到ClickHouse，反之亦然。

`TabSeparated`格式支持输出总值（使用WITH TOTALS时）和极值（当'extremes'设置为1时）。在这些情况下，总值和极值会在主要数据之后输出。主要结果、总值和极值之间用空行分隔。示例：

```sql
SELECT EventDate, count() AS c FROM test.hits GROUP BY EventDate WITH TOTALS ORDER BY EventDate FORMAT TabSeparated

2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

## 数据格式化 {#tabseparated-data-formatting}

整数以十进制形式写入。数字可以在开头包含一个额外的“+”字符（解析时忽略，在格式化时不记录）。非负数字不能包含负号。在读取时，允许将空字符串解析为零，或（对于有符号类型）只包含负号的字符串解析为零。不符合相应数据类型的数字可能会被解析为其他数字，而不会出现错误信息。

浮点数以十进制形式写入。点用作小数分隔符。支持指数条目，以及'inf'、'+inf'、'-inf'和'nan'。浮点数条目可以以小数点开始或结束。
在格式化过程中，浮点数可能会失去精度。
在解析过程中，不严格要求读取最近的机器可表示数字。

日期以YYYY-MM-DD格式写入，并以相同格式解析，但可以使用任何字符作为分隔符。
带时间的日期以`YYYY-MM-DD hh:mm:ss`格式写入，并以相同格式解析，但可以使用任何字符作为分隔符。
所有这些都发生在客户端或服务器启动时的系统时区（取决于哪个格式化数据）。对于带时间的日期，没有指定夏令时。因此，如果转储中有夏令时期间的时间，转储与数据不完全匹配，解析将选择两个时间之一。
在读取操作中，不正确的日期和带时间的日期可以自然溢出解析为null日期和时间，而不会出现错误信息。

作为例外，支持将带时间的日期解析为Unix时间戳格式，如果它恰好由10个十进制数字组成。结果不依赖于时区。格式`YYYY-MM-DD hh:mm:ss`和`NNNNNNNNNN`会自动区分。

字符串输出时会带有反斜杠转义的特殊字符。输出使用以下转义序列：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析也支持序列`\a`、`\v`和`\xHH`（十六进制转义序列）以及任何`\c`序列，其中`c`为任意字符（这些序列被转换为`c`）。因此，读取数据支持以下格式：换行符可以写成`\n`或`\`，或作为换行符。例如，字符串`Hello world`之间用换行代替空格可以用以下任何变体解析：

```text
Hello\nworld

Hello\
world
```

第二种变体得到支持，因为MySQL在写入制表符分隔的转储时使用了它。

在以TabSeparated格式传递数据时，您需要转义的字符的最小集合：制表符、换行符（LF）和反斜杠。

仅有一小部分符号会被转义。您可能会轻易碰到您的终端在输出中会损坏的字符串值。

数组以用方括号括起来的逗号分隔值列表的形式写入。数组中的数字项格式化为正常格式。`Date`和`DateTime`类型用单引号括起来。字符串用单引号括起来，转义规则与上述相同。

[NULL](/sql-reference/syntax.md)根据设置[format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)格式化（默认值为`\N`）。

在输入数据中，ENUM值可以表示为名称或id。首先，我们会尝试将输入值匹配到ENUM名称。如果失败且输入值是数字，则我们会尝试将该数字匹配到ENUM id。
如果输入数据仅包含ENUM id，建议启用设置[input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)以优化ENUM解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md)结构的每个元素被表示为一个数组。

例如：

```sql
CREATE TABLE nestedt
(
    `id` UInt8,
    `aux` Nested(
        a UInt8,
        b String
    )
)
ENGINE = TinyLog
```
```sql
INSERT INTO nestedt Values ( 1, [1], ['a'])
```
```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                          | 描述                                                                                                                                                                                                                                     | 默认值  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV格式中的自定义NULL表示。                                                                                                                                                                                                         | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将TSV输入中的空字段视为默认值。对于复杂的默认表达式，必须启用[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。                                               | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将插入的enum值在TSV格式中视为enum索引。                                                                                                                                                                                                 | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些技巧和启发式方法推断TSV格式中的模式。如果禁用，所有字段将被推断为字符串。                                                                                                                                                           | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为true，TSV输出格式中的行末将为`\r\n`而不是`\n`。                                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为true，TSV输入格式中的行末将为`\r\n`而不是`\n`。                                                                                                                                                                               | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开始时指定的行数。                                                                                                                                                                                                                   | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测TSV格式中的头部及其名称和类型。                                                                                                                                                                                                  | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的尾部空行。                                                                                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许在TSV格式中存在可变数量的列，忽略额外的列，并在缺失列上使用默认值。                                                                                                                                                            | `false` |
