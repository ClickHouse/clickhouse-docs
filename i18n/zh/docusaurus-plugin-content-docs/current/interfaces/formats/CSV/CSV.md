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



## 描述

逗号分隔值格式（Comma Separated Values，参见 [RFC](https://tools.ietf.org/html/rfc4180)）。
在格式化时，每行都用双引号括起来。字符串内部的双引号在输出时表示为连续两个双引号。
没有其他用于转义字符的规则。

* 日期和日期时间用双引号括起来。
* 数字在输出时不带引号。
* 各值由分隔符字符分隔，默认是 `,`。分隔符字符由设置 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 指定。
* 各行使用 Unix 换行符（LF）分隔。
* 数组在 CSV 中按如下方式序列化：
  * 首先，将数组序列化为字符串，其方式与在 TabSeparated 格式中的序列化相同
  * 然后将得到的字符串在 CSV 中用双引号输出。
* CSV 格式中的元组会被序列化为单独的列（即元组中的嵌套结构会被丢失）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下，分隔符为 `,`。
更多信息参见 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置。
:::

在解析时，所有值可以带引号或不带引号进行解析，双引号和单引号均受支持。

行也可以在不使用引号的情况下书写。在这种情况下，它们会被解析到分隔符字符或换行符（CR 或 LF）为止。
但需要注意的是，与 RFC 规定不符的是，在解析不带引号的行时，开头和结尾的空格与制表符会被忽略。
换行符支持：Unix（LF）、Windows（CR LF）和 Mac OS Classic（CR LF）类型。

`NULL` 的格式由设置 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 确定（默认值为 `\N`）。

在输入数据中，`ENUM` 值可以表示为名称或 ID。
首先，我们会尝试将输入值与 ENUM 名称匹配。
如果失败并且输入值是数字，则会尝试将该数字与 ENUM ID 匹配。
如果输入数据仅包含 ENUM ID，建议启用 [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 设置，以优化 `ENUM` 解析。


## 使用示例 {#example-usage}



## 格式设置 {#format-settings}

| Setting                                                                                                                                                            | 描述                                                                                                               | 默认值 | 说明                                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | 在 CSV 数据中视为分隔符的字符。                                                                                   | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 允许使用单引号括起的字符串。                                                                                       | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 允许使用双引号括起的字符串。                                                                                       | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | 在 CSV 格式中自定义 NULL 的表示形式。                                                                             | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | 将 CSV 输入中的空字段视为默认值。                                                                                 | `true`  | 对于复杂的默认表达式，还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | 在 CSV 格式中将插入的枚举值视为枚举索引。                                                                         | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | 在 CSV 格式的模式推断中使用一些技巧和启发式规则。如果禁用，所有字段都将被推断为 String。                          | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | 从 CSV 读取 Array 时，假定其元素先以嵌套 CSV 序列化，然后再放入字符串中。                                         | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | 如果设置为 true，CSV 输出格式中的行尾将使用 `\r\n` 而不是 `\n`。                                                  | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | 跳过数据开头指定数量的行。                                                                                        | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | 在 CSV 格式中自动检测包含名称和类型的表头。                                                                       | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | 跳过数据末尾尾随的空行。                                                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 去除未加引号的 CSV 字符串中的空格和制表符。                                                                       | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | 允许在 CSV 文本中使用空格或制表符作为字段分隔符。                                                                 | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | 在 CSV 格式中允许列数可变，忽略多余列，对缺失列使用默认值。                                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | 当 CSV 字段因无效值反序列化失败时，允许为该列设置默认值。                                                         | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | 在模式推断时尝试从字符串字段中推断数值类型。                                                                      | `false` |                                                                                                                                                                                              |