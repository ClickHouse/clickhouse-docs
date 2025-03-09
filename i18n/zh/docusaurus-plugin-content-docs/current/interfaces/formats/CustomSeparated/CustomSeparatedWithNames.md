---
title: CustomSeparatedWithNames
slug: /interfaces/formats/CustomSeparatedWithNames
keywords: ['CustomSeparatedWithNames']
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

此外，还会打印带有列名称的表头行，类似于 [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 的值为 `1`，输入数据的列将根据其名称映射到表中的列， 
如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 的值为 `1`，则将跳过未知名称的列。
否则，第一行将被跳过。
:::
