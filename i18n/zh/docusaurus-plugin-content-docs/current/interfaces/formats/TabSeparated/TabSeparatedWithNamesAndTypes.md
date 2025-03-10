---
title: 'TabSeparatedWithNamesAndTypes'
slug: '/interfaces/formats/TabSeparatedWithNamesAndTypes'
keywords: ['TabSeparatedWithNamesAndTypes']
---

| 输入 | 输出 | 别名                                          |
|-------|--------|------------------------------------------------|
| 	✔    | 	✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式不同的是，列名被写入第一行，而列类型则在第二行。

:::note
- 如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 被设置为 `1`，
输入数据的列将根据其名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 被设置为 `1`，则未知名称的列将被跳过。 
否则，将跳过第一行。
- 如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 被设置为 `1`，
输入数据中的类型将与表中相应列的类型进行比较。否则，将跳过第二行。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
