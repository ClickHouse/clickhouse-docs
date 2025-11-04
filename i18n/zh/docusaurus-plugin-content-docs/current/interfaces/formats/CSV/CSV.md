---
'alias': []
'description': 'CSV 格式的文档'
'input_format': true
'keywords':
- 'CSV'
'output_format': true
'slug': '/interfaces/formats/CSV'
'title': 'CSV'
'doc_type': 'reference'
---

## 描述 {#description}

逗号分隔值格式（[RFC](https://tools.ietf.org/html/rfc4180)）。 
在格式化时，行被双引号括起来。字符串内部的双引号输出为两个连续的双引号。 
没有其他字符转义规则。

- 日期和日期时间用双引号括起来。
- 数字不加引号输出。
- 值由分隔符字符分隔，默认为 `,`。分隔符字符在设置中定义为 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)。 
- 行使用 Unix 换行符 (LF) 分隔。 
- 数组在 CSV 中序列化如下： 
  - 首先，数组按 TabSeparated 格式序列化为字符串
  - 结果字符串以双引号输出到 CSV 中。
- CSV 格式中的元组被序列化为单独的列（即，元组内的嵌套被丢失）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下，分隔符为 `,` 
有关更多信息，请参见 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置。
:::

在解析时，所有值都可以选择带引号或不带引号解析。支持双引号和单引号。

行也可以不带引号排列。在这种情况下，它们会解析到分隔符字符或换行符（CR 或 LF）。
然而，违反 RFC 的情况是，当不带引号解析行时，前导和尾随的空格和制表符会被忽略。
换行符支持：Unix (LF)、Windows (CR LF) 和 Mac OS Classic (CR LF) 类型。

`NULL` 的格式按照设置 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 进行（默认值为 `\N`）。

在输入数据中，`ENUM` 值可以表示为名称或 id。 
首先，我们尝试将输入值与 ENUM 名称匹配。 
如果失败且输入值是数字，我们会尝试将该数字与 ENUM id 匹配。
如果输入数据仅包含 ENUM ids，建议启用设置 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 来优化 `ENUM` 解析。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                            | 描述                                                                                                            | 默认    | 备注                                                                                                                                                                                        |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | 被视为 CSV 数据中分隔符的字符。                                                                                | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 允许单引号的字符串。                                                                                          | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 允许双引号的字符串。                                                                                          | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 格式中自定义 NULL 表示。                                                                                   | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | 将 CSV 输入中的空字段视为默认值。                                                                              | `true`  | 对于复杂的默认表达式，还必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。                     | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | 将 CSV 格式中的枚举值视为枚举索引。                                                                            | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | 使用一些技巧和启发式方法推断 CSV 格式中的模式。如果禁用，所有字段将被推断为字符串。                         | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | 当从 CSV 读取数组时，期待其元素被序列化为嵌套的 CSV，然后放入字符串中。                                      | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | 如果设置为 true，CSV 输出格式中的行尾将为 `\r\n` 而不是 `\n`。                                            | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | 跳过数据开头指定数量的行。                                                                                    | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | 自动检测 CSV 格式中的带有名称和类型的头。                                                                    | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | 跳过数据结尾的空行。                                                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 修剪非引号 CSV 字符串中的空格和制表符。                                                                        | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | 允许在 CSV 字符串中使用空格或制表符作为字段分隔符。                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | 允许 CSV 格式中的列数可变，忽略多余的列并在缺少列时使用默认值。                                            | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | 允许在 CSV 字段反序列化因坏值失败时为列设置默认值。                                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | 尝试在模式推断时从字符串字段推断数字。                                                                        | `false` |                                                                                                                                                                                              |
