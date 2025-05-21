---
'alias': []
'description': 'CSV格式的文档'
'input_format': true
'keywords':
- 'CSV'
'output_format': true
'slug': '/interfaces/formats/CSV'
'title': 'CSV'
---



## 描述 {#description}

逗号分隔值格式 ([RFC](https://tools.ietf.org/html/rfc4180))。格式化时，行用双引号括起来。字符串内部的双引号输出为连续的两个双引号。
没有其他转义字符的规则。

- 日期和日期时间用双引号括起来。
- 数字不加引号输出。
- 值用分隔符字符分隔，默认分隔符是 `,`。分隔符字符在设置 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 中定义。
- 行使用 Unix 行结束符 (LF) 分隔。
- 数组在 CSV 中序列化如下：
  - 首先，数组序列化为字符串，如 TabSeparated 格式。
  - 结果字符串用双引号输出到 CSV 中。
- CSV 格式的元组作为单独的列序列化（即，元组中的嵌套信息丢失）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
默认情况下，分隔符是 `,`
有关更多信息，请参见设置 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)。
:::

在解析时，所有值可以用引号或不带引号的方式解析。支持双引号和单引号。

行也可以没有引号。在这种情况下，它们会解析到分隔符字符或行结束符（CR 或 LF）。
但是，违反 RFC 的情况下，当不使用引号解析行时，前导和尾随的空格和制表符将被忽略。
行结束符支持：Unix (LF)、Windows (CR LF) 和 Mac OS Classic (CR LF) 类型。

`NULL` 的格式化是根据设置 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 进行的（默认值为 `\N`）。

在输入数据中，`ENUM` 值可以表示为名称或 ID。
首先，我们尝试将输入值与 ENUM 名称匹配。
如果匹配失败且输入值为数字，我们尝试将该数字与 ENUM ID 匹配。
如果输入数据仅包含 ENUM ID，建议启用设置 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 来优化 `ENUM` 解析。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                            | 描述                                                                                                           | 默认    | 备注                                                                                                                                                                                           |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | 被视为 CSV 数据中的分隔符的字符。                                                                               | `,`     |                                                                                                                                                                                               |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 允许使用单引号的字符串。                                                                                       | `true`  |                                                                                                                                                                                               |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 允许使用双引号的字符串。                                                                                       | `true`  |                                                                                                                                                                                               |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 格式中的自定义 NULL 表示。                                                                                  | `\N`    |                                                                                                                                                                                               |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | 将 CSV 输入中的空字段视为默认值。                                                                               | `true`  | 对于复杂的默认表达式，必须启用 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | 将 CSV 格式中的插入 enum 值视为 enum 索引。                                                                    | `false` |                                                                                                                                                                                               |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | 在 CSV 格式中使用一些调整和启发式方法推断架构。如果禁用，所有字段将被推断为字符串。                                   | `true`  |                                                                                                                                                                                               |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | 读取 CSV 中的数组时，期望其元素以嵌套 CSV 的形式序列化后放入字符串中。                                         | `false` |                                                                                                                                                                                               |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | 如果设置为 true，则 CSV 输出格式中的行结束符将是 `\r\n` 而不是 `\n`。                                          | `false` |                                                                                                                                                                                               |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | 跳过数据开头指定数量的行。                                                                                     | `0`     |                                                                                                                                                                                               |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | 自动检测 CSV 格式中的头部名称和类型。                                                                        | `true`  |                                                                                                                                                                                               |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | 跳过数据末尾的空行。                                                                                           | `false` |                                                                                                                                                                                               |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 修剪非引号 CSV 字符串中的空格和制表符。                                                                         | `true`  |                                                                                                                                                                                               |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | 允许在 CSV 字符串中使用空格或制表符作为字段分隔符。                                                           | `false` |                                                                                                                                                                                               |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | 允许 CSV 格式中的可变列数，忽略额外列，并在缺少列时使用默认值。                                              | `false` |                                                                                                                                                                                               |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | 允许在 CSV 字段反序列化失败时设置默认值。                                                                        | `false` |                                                                                                                                                                                               |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | 在架构推断时尝试从字符串字段推断数字。                                                                           | `false` |                                                                                                                                                                                               |
