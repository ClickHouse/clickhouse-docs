---
title: TabSeparated
slug: /interfaces/formats/TabSeparated
keywords: ['TabSeparated', 'TSV']
input_format: true
output_format: true
alias: ['TSV']
---

| 输入 | 输出 | 别名  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## 描述 {#description}

在 TabSeparated 格式中，数据按行写入。每一行包含由制表符分隔的值。每个值后面都有一个制表符，除了行中的最后一个值，最后一个值后跟一个换行符。严格来说，假定在任何地方都使用 Unix 换行符。最后一行也必须在末尾包含换行符。值以文本格式写入，不使用引号包围，并且特殊字符需要转义。

此格式也可用名称 `TSV`。

`TabSeparated` 格式便于使用自定义程序和脚本处理数据。它在 HTTP 接口和命令行客户端的批处理模式下默认使用。此格式还允许在不同的数据库管理系统之间传输数据。例如，您可以从 MySQL 获取转储并将其上传到 ClickHouse，反之亦然。

`TabSeparated` 格式支持输出总值（使用 WITH TOTALS 时）和极值（当 'extremes' 设置为 1 时）。在这些情况下，总值和极值会在主数据之后输出。主结果、总值和极值之间用空行分隔。示例：

``` sql
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

## 数据格式 {#tabseparated-data-formatting}

整数以十进制形式写入。数字可以在开头包含一个额外的 "+" 字符（在解析时被忽略，格式化时不记录）。非负数字不能包含负号。读取时，允许将空字符串解析为零，或者（对于有符号类型）仅由负号组成的字符串解析为零。无法适应相应数据类型的数字可能会被解析为不同的数字，而不会显示错误信息。

浮点数以十进制形式写入。句点用作小数分隔符。支持指数条目以及 'inf'，'+inf'，'-inf' 和 'nan'。浮点数条目可以以小数点开始或结束。在格式化时，浮点数可能会失去精度。在解析时，不严格要求读取最近的机器可表示数字。

日期以 YYYY-MM-DD 格式写入，并以相同格式解析，但可以使用任意字符作为分隔符。带有时间的日期以 `YYYY-MM-DD hh:mm:ss` 格式写入，并以相同格式解析，但可以使用任意字符作为分隔符。这一切都发生在客户端或服务器启动时的系统时区内（取决于哪个格式化数据）。对于带有时间的日期，不指定夏令时。因此，如果转储中包含夏令时的时间，则该转储不明确匹配数据，解析将选择两个时间之一。在读取操作中，不正确的日期和带有时间的日期可以通过自然溢出解析或作为空值日期和时间解析，而不会显示错误信息。

作为例外，如果 Unix 时间戳格式的日期和时间恰好由 10 个十进制数字组成，则也支持日期和时间的解析。其结果不依赖于时区。格式 `YYYY-MM-DD hh:mm:ss` 和 `NNNNNNNNNN` 会自动区分。

字符串以反斜杠转义的特殊字符输出。输出使用以下转义序列：`\b`，`\f`，`\r`，`\n`，`\t`，`\0`，`\'`，`\\`。解析还支持序列 `\a`，`\v` 和 `\xHH`（十六进制转义序列）以及任何 `\c` 序列，其中 `c` 是任意字符（这些序列被转换为 `c`）。因此，读取数据支持的格式中，一行可以表示为 `\n` 或 `\`，或作为换行符。例如，字符串 `Hello world` 在单词之间用换行符而不是空格，可以解析为以下任意变体：

``` text
Hello\nworld

Hello\
world
```

第二个变体是支持的，因为 MySQL 在编写制表符分隔的转储时使用它。

在以 TabSeparated 格式传递数据时，您需要转义的字符的最小集合：制表符、换行符（LF）和反斜杠。

只有一小部分符号被转义。您可能会轻易遇到在输出中会损坏的字符串值。

数组以方括号中的逗号分隔值列表写入。数组中的数字项按常规格式化。`Date` 和 `DateTime` 类型以单引号写入。字符串以单引号写入，并遵循上述相同的转义规则。

[NULL](/sql-reference/syntax.md) 的格式根据设置 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 进行格式化（默认值为 `\N`）。

在输入数据中，ENUM 值可以表示为名称或 ID。首先，我们尝试将输入值匹配到 ENUM 名称。如果失败且输入值是数字，我们尝试将该数字匹配到 ENUM ID。如果输入数据仅包含 ENUM ID，建议启用设置 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) 以优化 ENUM 解析。

每个 [Nested](/sql-reference/data-types/nested-data-structures/index.md) 结构的元素表示为数组。

例如：

``` sql
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
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 格式中的自定义 NULL 表示。                                                                                                                                                                                                      | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | 将 TSV 输入中的空字段视为默认值。对于复杂的默认表达式，必须也启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | 将 TSV 格式中插入的枚举值视为枚举索引。                                                                                                                                                                                     | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | 使用一些调整和启发式方法来推断 TSV 格式中的架构。如果禁用，所有字段将被推断为字符串。                                                                                                                             | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | 如果设置为 true，则 TSV 输出格式的行结束符将是 `\r\n` 而不是 `\n`。                                                                                                                                                            | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | 如果设置为 true，则 TSV 输入格式的行结束符将是 `\r\n` 而不是 `\n`。                                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 跳过数据开头指定数量的行。                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | 自动检测 TSV 格式中的带名称和类型的头。                                                                                                                                                                                | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 跳过数据末尾的尾随空行。                                                                                                                                                                                                  | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | 允许在 TSV 格式中具有可变数量的列，忽略额外列并对缺失列使用默认值。                                                                                                                                | `false` |
