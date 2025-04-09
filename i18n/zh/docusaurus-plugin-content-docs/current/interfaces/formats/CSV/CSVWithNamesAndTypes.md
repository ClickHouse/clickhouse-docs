---
title: 'CSVWithNamesAndTypes'
slug: '/interfaces/formats/CSVWithNamesAndTypes'
keywords: ['CSVWithNamesAndTypes']
input_format: true
output_format: true
alias: []
---

| 输入  | 输出   | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还打印两行带有列名和类型的标题，类似于 [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据的列将根据其名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。否则，第一行将被跳过。
:::

:::note
如果设置 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
