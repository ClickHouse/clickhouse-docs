---
title: 'TabSeparatedWithNames'
slug: /interfaces/formats/TabSeparatedWithNames
keywords: ['TabSeparatedWithNames']
input_format: true
output_format: true
alias: ['TSVWithNames']
---

| 输入 | 输出 | 别名                          |
|-------|--------|--------------------------------|
| 	✔    | 	✔     | `TSVWithNames`, `RawWithNames` |

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式不同的是，列名被写在第一行。

在解析过程中，第一行预计包含列名。您可以使用列名来确定它们的位置并检查其正确性。

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据中的列将通过其名称映射到表的列上，若设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则具有未知名称的列将被跳过。否则，第一行将被跳过。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
