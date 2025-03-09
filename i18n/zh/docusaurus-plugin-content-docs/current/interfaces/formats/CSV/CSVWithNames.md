---
title: 'CSVWithNames'
slug: '/interfaces/formats/CSVWithNames'
keywords: ['CSVWithNames']
input_format: true
output_format: true
alias: []
---

| 输入   | 输出   | 别名   |
|--------|--------|--------|
| ✔      | ✔      |        |

## 描述 {#description}

同时打印列名的标题行，类似于 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过其名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则会跳过未知名称的列。
否则，第一行将被跳过。
:::
