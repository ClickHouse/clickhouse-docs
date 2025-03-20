---
title: 'JSONCompactStringsEachRowWithNames'
slug: '/interfaces/formats/JSONCompactStringsEachRowWithNames'
keywords: ['JSONCompactStringsEachRowWithNames']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同的是，它还打印带有列名的标题行，类似于 [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) 格式。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据的列将通过其名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，将跳过未知名称的列。
否则，第一行将被跳过。
:::
