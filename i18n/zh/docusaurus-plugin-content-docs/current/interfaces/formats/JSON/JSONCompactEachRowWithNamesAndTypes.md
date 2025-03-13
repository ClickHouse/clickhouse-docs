---
title: 'JSONCompactEachRowWithNamesAndTypes'
slug: '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
keywords: ['JSONCompactEachRowWithNamesAndTypes']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同，它还打印了两行表头，包含列名和类型，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 格式。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过它们的名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。
否则，第一行将被跳过。
如果设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，
输入数据中的类型将与表中对应列的类型进行比较。否则，第二行将被跳过。
:::
