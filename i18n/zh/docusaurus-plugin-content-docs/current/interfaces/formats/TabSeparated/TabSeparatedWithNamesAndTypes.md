---
'description': '带名称和类型的制表符分隔格式的文档'
'keywords':
- 'TabSeparatedWithNamesAndTypes'
'slug': '/interfaces/formats/TabSeparatedWithNamesAndTypes'
'title': '带名称和类型的制表符分隔格式'
---

| 输入 | 输出 | 别名                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 描述 {#description}

与 [`TabSeparated`](./TabSeparated.md) 格式不同，列名写在第一行，而列类型写在第二行。

:::note
- 如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过它们的名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则将跳过未知名称的列。
否则，第一行将被跳过。
- 如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，
输入数据中的类型将与表中相应列的类型进行比较。否则，将跳过第二行。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
