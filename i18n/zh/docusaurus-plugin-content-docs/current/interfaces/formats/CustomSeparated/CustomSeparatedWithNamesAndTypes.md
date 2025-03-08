---
title: '自定义分隔符与名称和类型'
slug: /interfaces/formats/CustomSeparatedWithNamesAndTypes
keywords: ['CustomSeparatedWithNamesAndTypes']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还会打印两行标题，包含列的名称和类型，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过其名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。
否则，将跳过第一行。
:::

:::note
如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，
输入数据中的类型将与表中对应列的类型进行比较。否则，将跳过第二行。
:::
