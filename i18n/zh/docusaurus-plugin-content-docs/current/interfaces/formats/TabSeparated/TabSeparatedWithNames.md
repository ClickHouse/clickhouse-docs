---
'alias':
- 'TSVWithNames'
'description': 'TabSeparatedWithNames 格式的文档'
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

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式不同的是，列名在第一行中书写。

在解析过程中，预期第一行包含列名。您可以使用列名来确定它们的位置并检查它们的正确性。

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过其名称映射到表的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。
否则，第一行将被跳过。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
