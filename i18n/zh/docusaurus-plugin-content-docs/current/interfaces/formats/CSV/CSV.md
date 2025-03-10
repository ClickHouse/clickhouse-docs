---
title: 'CSV'
slug: /interfaces/formats/CSV
keywords: ['CSV']
input_format: true
output_format: true
alias: []
---

## 描述 {#description}

逗号分隔值格式（[RFC](https://tools.ietf.org/html/rfc4180)）。当格式化时，行用双引号括起来。字符串内的双引号将输出为两个连续的双引号。
没有其他转义字符的规则。

- 日期和日期时间用双引号括起来。
- 数字不带引号输出。
- 值通过分隔符字符分隔，默认是 `,`。分隔符字符在设置 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 中定义。
- 行使用Unix换行符（LF）分隔。
- 数组在CSV中序列化如下：
  - 首先，数组按TabSeparated格式序列化为字符串
  - 结果字符串在CSV中用双引号输出。
- CSV格式中的元组序列化为单独的列（也就是说，它们在元组中的嵌套关系丢失）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下，分隔符是 `,`。
有关更多信息，请参见 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置。
:::

在解析时，所有值都可以带引号或不带引号进行解析。支持双引号和单引号。

行也可以不带引号排列。在这种情况下，它们会解析到分隔符字符或换行符（CR或LF）。
然而，违反RFC时，在无引号的行解析中，前导和尾随空格及制表符会被忽略。
换行符支持：Unix（LF），Windows（CR LF）和Mac OS Classic（CR LF）类型。

`NULL` 根据设置 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 格式化（默认值为 `\N`）。

在输入数据中，`ENUM` 值可以表示为名称或ID。
首先，我们尝试将输入值匹配到ENUM名称。
如果失败，并且输入值是一个数字，我们会尝试将该数字匹配到ENUM ID。
如果输入数据只包含ENUM ID，建议启用设置 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 以优化 `ENUM` 解析。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                                   | 描述                                                                                                        | 默认    | 备注                                                                                                                                                                                        |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                            | 被视为CSV数据分隔符的字符。                                                                                 | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                        | 允许使用单引号的字符串。                                                                                     | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                        | 允许使用双引号的字符串。                                                                                     | `true`  |                                                                                                                                                                                              |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                       | CSV格式中的自定义NULL表示。                                                                                   | `\N`    |                                                                                                                                                                                              |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                                  | 将CSV输入中的空字段视为默认值。                                                                                | `true`  | 对于复杂的默认表达式，必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。                                      |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                                      | 将CSV格式中的插入的枚举值视为枚举索引。                                                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)          | 使用一些技巧和启发式方法来推断CSV格式的模式。如果禁用，所有字段将被推断为字符串。                                     | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                          | 在从CSV读取数组时，期望其元素以嵌套CSV的形式序列化并放入字符串中。                                               | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                                | 如果设置为true，CSV输出格式中的行尾将为 `\r\n` 而不是 `\n`。                                                    | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                                  | 跳过数据开头指定数量的行。                                                                                   | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                        | 自动检测CSV格式中的带名称和类型的头部。                                                                      | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                                  | 跳过数据末尾的空行。                                                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                                  | 修剪非引号CSV字符串中的空格和制表符。                                                                          | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)          | 允许在CSV字符串中使用空格或制表符作为字段分隔符。                                                              | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)                  | 允许CSV格式中的可变列数，忽略多余的列，并在缺失列时使用默认值。                                              | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                                  | 允许在CSV字段反序列化时错误值出现时设置默认值到列。                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)                      | 在模式推断时尝试从字符串字段推断数字。                                                                       | `false` |                                                                                                                                                                                              |
