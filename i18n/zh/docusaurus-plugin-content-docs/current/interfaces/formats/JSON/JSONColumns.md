---
'alias': []
'description': 'JSONColumns 格式的文档'
'input_format': true
'keywords':
- 'JSONColumns'
'output_format': true
'slug': '/interfaces/formats/JSONColumns'
'title': 'JSONColumns'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

:::tip
JSONColumns* 格式的输出提供了 ClickHouse 字段名，然后是该字段在表中每行的内容；在视觉上，数据被旋转了 90 度向左。
:::

在这种格式中，所有数据表示为单个 JSON 对象。

:::note
`JSONColumns` 格式将所有数据缓存在内存中，然后作为单个块输出，因此可能导致高内存消耗。
:::

## 示例用法 {#example-usage}

示例：

```json
{
    "num": [42, 43, 44],
    "str": ["hello", "hello", "hello"],
    "arr": [[0,1], [0,1,2], [0,1,2,3]]
}
```

## 格式设置 {#format-settings}

在导入时，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则会跳过未知名称的列。 不在块中的列将填充默认值（您可以在此使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）。
