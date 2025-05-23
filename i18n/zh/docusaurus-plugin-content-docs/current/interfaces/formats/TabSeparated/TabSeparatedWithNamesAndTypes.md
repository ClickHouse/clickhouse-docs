---
'description': 'TabSeparatedWithNamesAndTypes 格式的 Documentation'
'keywords':
- 'TabSeparatedWithNamesAndTypes'
'slug': '/interfaces/formats/TabSeparatedWithNamesAndTypes'
'title': 'TabSeparatedWithNamesAndTypes'
---

| Input | Output | Alias                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式不同，列名写在第一行，列类型写在第二行。

:::note
- 如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，则输入数据中的列将根据其名称映射到表中的列，未知名称的列将被跳过，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1。
否则，第一行将被跳过。
- 如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，则输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
