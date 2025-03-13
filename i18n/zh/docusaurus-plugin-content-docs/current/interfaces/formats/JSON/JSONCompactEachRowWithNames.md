---
title: 'JSONCompactEachRowWithNames'
slug: '/interfaces/formats/JSONCompactEachRowWithNames'
keywords: ['JSONCompactEachRowWithNames']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |


## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同，它还打印包含列名的表头行，类似于 [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 格式。


## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 1，输入数据中的列将根据名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则会跳过未知名称的列。 否则，将跳过第一行。
:::
