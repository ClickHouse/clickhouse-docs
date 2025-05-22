| 输入  | 输出  | 别名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 描述 {#description}

在 TabSeparated 格式中，数据按行写入。每行包含用制表符分隔的值。每个值后面跟一个制表符，除了行中的最后一个值，最后一个值后面跟换行符。假定在各处严格使用 Unix 换行符。最后一行也必须在末尾包含一个换行符。值以文本格式写入，没有封闭的引号，特殊字符则进行转义。

此格式也可称为 `TSV`。

`TabSeparated` 格式适合使用自定义程序和脚本处理数据。它在 HTTP 接口中默认使用，并且在命令行客户端的批处理模式中使用。此格式还允许在不同的 DBMS 之间传输数据。例如，您可以从 MySQL 获取转储并上传到 ClickHouse，反之亦然。

`TabSeparated` 格式支持输出总值（使用 WITH TOTALS 时）和极值（当 'extremes' 设置为 1 时）。在这些情况下，总值和极值将在主数据之后输出。主要结果、总值和极值相互之间用空行分隔。例如：

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

整数以十进制形式写入。数字可以在开头包含一个额外的 "+" 字符（解析时忽略，格式化时不记录）。非负数不能包含负号。在读取时，允许将空字符串解析为零，或者（对于有符号类型）仅由减号组成的字符串解析为零。不适合相应数据类型的数字可能会被解析为不同的数字，而不会产生错误消息。

浮点数以十进制形式写入。句点用作小数分隔符。支持指数条目，以及 'inf'、'+inf'、'-inf' 和 'nan'。浮点数条目可以以小数点开头或结尾。
在格式化过程中，浮点数可能会失去精度。
在解析过程中，不严格要求读取最接近机器可表示的数字。

日期以 YYYY-MM-DD 格式写入，并以相同格式解析，但可以使用任何字符作为分隔符。
带有时间的日期以 `YYYY-MM-DD hh:mm:ss` 格式写入并以相同格式解析，但可以使用任何字符作为分隔符。
所有这些发生在客户端或服务器启动时的系统时区（取决于哪个格式化数据）。对于带有时间的日期，不指定夏令时。因此，如果转储中的时间处于夏令时，转储不明确匹配数据，解析将选择两个时间中的一个。
在读取操作中，不正确的日期和带时间的日期可以通过自然溢出或作为无效日期和时间进行解析，而不会产生错误消息。

作为例外，带时间的日期在 Unix 时间戳格式中也受到支持，如果其恰好由 10 位十进制数字组成。结果不依赖于时区。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串以反斜杠转义的特殊字符输出。输出使用以下转义序列：`\b`、`\f`、`\r`、`\n`、`\t`、`\0`、`\'`、`\\`。解析也支持序列 `\a`、`\v` 和 `\xHH`（十六进制转义序列）以及任何 `\c` 序列，其中 `c` 是任何字符（这些序列被转换为 `c`）。因此，读取数据支持将换行符写为 `\n` 或 `\`，或者作为换行符。例如，字符串 `Hello world`，单词之间的换行符而不是空格，可以用以下任意变体解析：

```text
Hello\nworld

Hello\
world
```

第二种变体受到支持，因为 MySQL 在写入制表符分隔的转储时使用它。

在以 TabSeparated 格式传输数据时，您需要转义的最小字符集：制表符、换行符（LF）和反斜杠。

仅有少量符号会被转义。您可能很容易遇到终端在输出中会破坏的字符串值。

数组以方括号中的逗号分隔值列表写入。数组中的数字项正常格式化。`Date` 和 `DateTime` 类型用单引号写入。字符串用单引号写入，并遵循上述相同的转义规则。

[NULL](/sql-reference/syntax.md) 根据设置 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 进行格式化（默认值为 `\N`）。

在输入数据中，ENUM 值可以作为名称或 ID 进行表示。首先，我们尝试将输入值与 ENUM 名称匹配。如果失败并且输入值是一个数字，我们会尝试将该数字与 ENUM ID 匹配。
如果输入数据仅包含 ENUM ID，则建议启用设置 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 以优化 ENUM 解析。

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的每个元素都表示为一个数组。

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

| 设置                                                                                                                                                          | 描述                                                                                                                                                                                                                                    | 默认 |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 格式中自定义 NULL 表示。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式，也必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将 TSV 格式中插入的枚举值视为枚举索引。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些技巧和启发式方法推断 TSV 格式中的模式。如果禁用，则所有字段将被推断为字符串。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为 true，则 TSV 输出格式中的行结束将为 `\r\n` 而不是 `\n`。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为 true，则 TSV 输入格式中的行结束将为 `\r\n` 而不是 `\n`。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头的指定行数。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测 TSV 格式中的名称和类型的表头。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的多余空行。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许 TSV 格式中列数可变，忽略多余的列并在缺失列中使用默认值。                                                                                                                                | `false` |
