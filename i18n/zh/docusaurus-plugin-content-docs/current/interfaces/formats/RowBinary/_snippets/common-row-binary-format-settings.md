---
{}
---

<!-- Note: This snippet is reused in any file it is imported by -->

以下设置适用于所有 `RowBinary` 类型格式。

| 设置                                                                                                                                              | 描述                                                                                                                                                                                                                                         | 默认值 |
|--------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_binary_max_string_size`](/operations/settings/settings-formats.md/#format_binary_max_string_size)                                           | RowBinary 格式中 String 允许的最大大小。                                                                                                                                                                                                | `1GiB`  |
| [`output_format_binary_encode_types_in_binary_format`](/operations/settings/formats#input_format_binary_decode_types_in_binary_format) | 允许使用 [`binary encoding`](/sql-reference/data-types/data-types-binary-encoding.md) 在头部写入类型，而不是在 [`RowBinaryWithNamesAndTypes`](../RowBinaryWithNamesAndTypes.md) 输出格式中使用类型名称的字符串。 | `false` |
| [`input_format_binary_decode_types_in_binary_format`](/operations/settings/formats#input_format_binary_decode_types_in_binary_format)   | 允许使用 [`binary encoding`](/sql-reference/data-types/data-types-binary-encoding.md) 在头部读取类型，而不是在 [`RowBinaryWithNamesAndTypes`](../RowBinaryWithNamesAndTypes.md) 输入格式中使用类型名称的字符串。     | `false` |
| [`output_format_binary_write_json_as_string`](/operations/settings/settings-formats.md/#output_format_binary_write_json_as_string)                   | 允许在 [`RowBinary`](../RowBinary.md) 输出格式中将 [`JSON`](/sql-reference/data-types/newjson.md) 数据类型的值作为 `JSON` [String](/sql-reference/data-types/string.md) 值写入。                     | `false` |
| [`input_format_binary_read_json_as_string`](/operations/settings/settings-formats.md/#input_format_binary_read_json_as_string)                       | 允许在 [`RowBinary`](../RowBinary.md) 输入格式中将 [`JSON`](/sql-reference/data-types/newjson.md) 数据类型的值作为 `JSON` [String](/sql-reference/data-types/string.md) 值读取。                               | `false` |
