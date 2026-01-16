---
alias: []
description: 'CSV 格式的文档'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---

## 描述 \\{#description\\}

逗号分隔值格式（[RFC](https://tools.ietf.org/html/rfc4180)）。
在格式化时，每行都用双引号括起来。字符串内部的双引号会输出为连续的两个双引号。
没有其他用于转义字符的规则。

* 日期和日期时间用双引号括起来。
* 数字在输出时不带引号。
* 值由分隔符分隔，默认是 `,`。分隔符通过设置 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 定义。
* 行之间使用 Unix 换行符（LF）分隔。
* 数组在 CSV 中按如下方式序列化：
  * 首先，数组按 TabSeparated 格式序列化为字符串；
  * 然后将得到的字符串在 CSV 中以双引号输出。
* CSV 格式中的元组会被序列化为单独的列（即元组中的嵌套结构会丢失）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下，分隔符为 `,`。
有关更多信息，请参阅设置 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)。
:::

在解析时，所有值可以带引号或不带引号进行解析。支持双引号和单引号。

行也可以在没有引号的情况下书写。在这种情况下，将一直解析到分隔符字符或换行符（CR 或 LF）为止。
但是，与 RFC 规范不一致的是，在解析无引号的行时，开头和结尾的空格及制表符会被忽略。
换行符支持：Unix (LF)、Windows (CR LF) 和 Mac OS Classic (CR LF) 类型。

`NULL` 的格式由设置 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 决定（默认值为 `\N`）。

在输入数据中，`ENUM` 值可以表示为名称或 ID。
首先，我们会尝试将输入值与 ENUM 名称匹配。
如果失败并且输入值是数字，则会尝试将该数字与 ENUM ID 匹配。
如果输入数据只包含 ENUM ID，建议启用设置 [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 以优化 `ENUM` 解析。

## 示例用法 \\{#example-usage\\}

## 格式设置 \\{#format-settings\\}

| 设置                                                                                                                                                             | 描述                                                                                                               | 默认值  | 说明                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                           | 在 CSV 数据中视作分隔符的字符。                                                                                    | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                       | 允许使用单引号包裹字符串。                                                                                         | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                       | 允许使用双引号包裹字符串。                                                                                         | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                       | 在 CSV 格式中自定义 NULL 的表示形式。                                                                              | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                                 | 将 CSV 输入中的空字段视为默认值。                                                                                  | `true`  | 对于复杂的默认表达式，还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                                     | 在 CSV 格式中将插入的枚举值视为枚举索引。                                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)           | 使用一些优化和启发式规则来推断 CSV 格式中的 schema（模式）。若禁用，所有字段都会被推断为 String 类型。             | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                         | 从 CSV 读取 Array 时，假定其元素已按嵌套 CSV 方式序列化后再写入为字符串。                                          | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                               | 如果设置为 true，则 CSV 输出格式中的行结束符为 `\r\n` 而不是 `\n`。                                                | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                                 | 跳过数据开头指定数量的行。                                                                                         | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                       | 在 CSV 格式中自动检测包含名称和类型的表头。                                                                        | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                               | 跳过数据末尾的空行。                                                                                               | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                                 | 去除未加引号的 CSV 字符串中的空格和制表符。                                                                        | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)         | 允许在 CSV 字符串中使用空格或制表符作为字段分隔符。                                                                | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)                 | 允许 CSV 格式中的列数可变，忽略多余列，并对缺失列使用默认值。                                                      | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                               | 当 CSV 字段因非法值反序列化失败时，允许为该列设置默认值。                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)                     | 在 schema 推断期间，尝试从字符串字段中推断数字类型。                                                               | `false` |                                                                                                                                                                                              |