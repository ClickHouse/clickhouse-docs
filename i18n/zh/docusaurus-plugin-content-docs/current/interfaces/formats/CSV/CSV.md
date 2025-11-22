---
alias: []
description: 'CSV 格式文档'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---



## 描述 {#description}

逗号分隔值格式（[RFC](https://tools.ietf.org/html/rfc4180)）。
格式化时,行用双引号括起来。字符串内的双引号会输出为连续的两个双引号。
没有其他字符转义规则。

- 日期和日期时间用双引号括起来。
- 数字输出时不带引号。
- 值之间用分隔符分隔,默认为 `,`。分隔符在设置 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 中定义。
- 行使用 Unix 换行符(LF)分隔。
- 数组在 CSV 中的序列化方式如下:
  - 首先,数组按照 TabSeparated 格式序列化为字符串
  - 生成的字符串用双引号括起来输出到 CSV。
- CSV 格式中的元组被序列化为单独的列(即元组中的嵌套结构会丢失)。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下,分隔符为 `,`
有关更多信息,请参阅 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置。
:::

解析时,所有值都可以带引号或不带引号。支持双引号和单引号。

行也可以不带引号。在这种情况下,解析会进行到分隔符或换行符(CR 或 LF)为止。
但是,与 RFC 规范不同的是,在解析不带引号的行时,前导和尾随的空格及制表符会被忽略。
支持的换行符类型包括:Unix(LF)、Windows(CR LF)和 Mac OS Classic(CR LF)。

`NULL` 根据设置 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 进行格式化(默认值为 `\N`)。

在输入数据中,`ENUM` 值可以表示为名称或 ID。
首先,尝试将输入值与 ENUM 名称匹配。
如果匹配失败且输入值是数字,则尝试将该数字与 ENUM ID 匹配。
如果输入数据仅包含 ENUM ID,建议启用设置 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 以优化 `ENUM` 解析。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

| 设置                                                                                                                                                  | 描述                                                                                                        | 默认值 | 备注                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                   | CSV 数据中用作分隔符的字符。                                                         | `,`     |                                                                                                                                                                                      |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                               | 允许使用单引号括起字符串。                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                               | 允许使用双引号括起字符串。                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                               | CSV 格式中 NULL 的自定义表示形式。                                                                          | `\N`    |                                                                                                                                                                                      |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                         | 将 CSV 输入中的空字段视为默认值。                                                                 | `true`  | 对于复杂的默认表达式,还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                             | 将 CSV 格式中插入的枚举值视为枚举索引。                                                         | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)   | 使用一些调整和启发式方法来推断 CSV 格式的架构。如果禁用,所有字段将被推断为 String 类型。 | `true`  |                                                                                                                                                                                      |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                 | 从 CSV 读取 Array 时,期望其元素以嵌套 CSV 格式序列化后放入字符串中。      | `false` |                                                                                                                                                                                      |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                       | 如果设置为 true,CSV 输出格式中的行尾将使用 `\r\n` 而不是 `\n`。                             | `false` |                                                                                                                                                                                      |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                         | 跳过数据开头指定数量的行。                                                       | `0`     |                                                                                                                                                                                      |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                               | 自动检测 CSV 格式中包含名称和类型的标题行。                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                       | 跳过数据末尾的空行。                                                                      | `false` |                                                                                                                                                                                      |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                         | 去除非引号 CSV 字符串中的空格和制表符。                                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter) | 允许在 CSV 字符串中使用空格或制表符作为字段分隔符。                                                  | `false` |                                                                                                                                                                                      |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)         | 允许 CSV 格式中的列数可变,忽略多余的列并对缺失的列使用默认值。    | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                       | 当 CSV 字段因错误值反序列化失败时,允许为列设置默认值。                           | `false` |                                                                                                                                                                                      |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)             | 在架构推断时尝试从字符串字段推断数字。                                                    | `false` |                                                                                                                                                                                      |
