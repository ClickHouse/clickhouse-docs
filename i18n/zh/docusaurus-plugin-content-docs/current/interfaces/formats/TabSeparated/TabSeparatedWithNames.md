---
'alias':
- 'TSVWithNames'
'description': 'TabSeparatedWithNames格式的文档'
'input_format': true
'keywords':
- 'TabSeparatedWithNames'
'output_format': true
'slug': '/interfaces/formats/TabSeparatedWithNames'
'title': 'TabSeparatedWithNames'
---



| Input | Output | Alias                          |
|-------|--------|--------------------------------|
|     ✔    |     ✔     | `TSVWithNames`, `RawWithNames` |

## Description {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式的不同之处在于列名写在第一行。

在解析时，预计第一行将包含列名。您可以使用列名来确定它们的位置并检查其正确性。

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 的值为 `1`，则输入数据中的列将根据其名称映射到表的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 的值为 `1`，则未知名称的列将被跳过。否则，第一行将被跳过。
:::

## Example Usage {#example-usage}

## Format Settings {#format-settings}
