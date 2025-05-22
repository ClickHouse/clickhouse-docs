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

| 输入  | 输出  | 别名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 描述 {#description}

在 TabSeparated 格式中，数据按行写入。每行包含由制表符分隔的值。每个值后面都跟一个制表符，除了行中的最后一个值，它后面跟随换行符。假定所有地方均严格采用 Unix 换行符。最后一行也必须在末尾包含换行符。值以文本格式写入，不带引号，且特殊字符已转义。

该格式也可以称为 `TSV`。

`TabSeparated` 格式方便使用自定义程序和脚本处理数据。它在 HTTP 接口以及命令行客户端的批处理模式中默认使用。该格式还允许在不同的数据库管理系统之间转移数据。例如，你可以从 MySQL 获取转储并将其上传到 ClickHouse，反之亦然。

`TabSeparated` 格式支持输出总值（使用 WITH TOTALS时）和极值（当 'extremes' 设置为 1 时）。在这些情况下，总值和极值会在主数据之后输出。主结果、总值和极值之间以空行分隔。示例：

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

整数以十进制形式写入。数字可以在开头包含一个额外的 "+" 字符（在解析时忽略，并且在格式化时不记录）。非负数不能包含负号。在读取时，允许将空字符串解析为零，或（对于有符号类型）将只包含负号的字符串解析为零。不适合相应数据类型的数字可以被解析为不同的数字，而不会出现错误消息。

浮点数以十进制形式写入。小数点作为小数分隔符。支持指数条目，以及 'inf'、'+inf'、'-inf' 和 'nan'。浮点数的条目可以以小数点开头或结尾。在格式化过程中，浮点数可能会丢失精度。在解析过程中，不严格要求读取最近的机器可表示数字。

日期以 YYYY-MM-DD 格式写入，并以相同格式解析，但分隔符可以是任意字符。带时间的日期以格式 `YYYY-MM-DD hh:mm:ss` 写入，并以相同格式解析，但分隔符可以是任意字符。这一切均发生在客户端或服务器启动时的系统时区（取决于格式化数据的是哪一方）。对于带时间的日期，不指定夏令时。因此，如果转储在夏令时中存在时间，转储将不明确匹配数据，解析将选择两种时间中的一种。在读取操作中，不正确的日期和带时间的日期可以自然溢出解析为 null 日期和时间，而不会出现错误消息。

作为例外，如果 Unix 时间戳格式的带时间日期由正好 10 位十进制数字组成，也支持解析。结果不依赖于时区。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串以反斜杠转义的特殊字符输出。输出使用以下转义序列：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析也支持序列 `\a`、`\v` 和 `\xHH`（十六进制转义序列）以及任意 `\c` 序列，其中 `c` 是任意字符（这些序列会被转换为 `c`）。因此，读取数据支持以 `\n` 或 `\` 写入换行符，或作为换行符。例如，字符串 `Hello world` 在单词之间用换行替代空格的格式可以解析为以下任何变体：

```text
Hello\nworld

Hello\
world
```

第二种变体受到支持，因为 MySQL 在写入制表符分隔的转储时使用它。

在传递数据时，使用 TabSeparated 格式需要转义的字符最小集：制表符、换行符 (LF) 和反斜杠。

只有一小部分符号会被转义。你可能会轻易遇到导致终端在输出中出现错误的字符串值。

数组作为用逗号分隔值的列表写入，位于方括号内。数组中的项正常格式化。`Date` 和 `DateTime` 类型用单引号写入。字符串用单引号写入，并与上面相同的转义规则。

[NULL](/sql-reference/syntax.md) 根据设置 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 进行格式化（默认值为 `\N`）。

在输入数据中，ENUM 值可以表示为名称或 id。首先，我们尝试将输入值与 ENUM 名称匹配。如果失败且输入值为数字，我们尝试将此数字与 ENUM id 匹配。如果输入数据仅包含 ENUM id，建议启用设置 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 来优化 ENUM 解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的每个元素作为数组表示。

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

| 设置                                                                                                                                                          | 描述                                                                                                                                                                                                                                    | 默认   |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | 自定义 TSV 格式的 NULL 表示。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式，必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。                                   | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将 TSV 格式中插入的枚举值视为枚举索引。                                                                                                                                                                                         | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些调整和启发式方法推断 TSV 格式的模式。如果禁用，所有字段将被推断为字符串。                                                                                                                                                     | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为 true，TSV 输出格式的行结束符将为 `\r\n` 而不是 `\n`。                                                                                                                                                                 | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为 true，TSV 输入格式的行结束符将为 `\r\n` 而不是 `\n`。                                                                                                                                                                  | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头指定数量的行。                                                                                                                                                                                                  | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测 TSV 格式中的名称和类型的头。                                                                                                                                                                                       | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的尾随空行。                                                                                                                                                                                                        | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许在 TSV 格式中使用可变列数，忽略多余的列，并在缺少的列上使用默认值。                                                                                                                                                    | `false` |
