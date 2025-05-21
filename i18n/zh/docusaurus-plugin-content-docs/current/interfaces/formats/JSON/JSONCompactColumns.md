---
'alias': []
'description': 'JSONCompactColumns格式的文档'
'input_format': true
'keywords':
- 'JSONCompactColumns'
'output_format': true
'slug': '/interfaces/formats/JSONCompactColumns'
'title': 'JSONCompactColumns'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在此格式中，所有数据都表示为一个单独的 JSON 数组。

:::note
`JSONCompactColumns` 输出格式会将所有数据缓冲到内存中，以作为单个块输出，这可能导致高内存消耗。
:::

## 示例用法 {#example-usage}

```json
[
    [42, 43, 44],
    ["hello", "hello", "hello"],
    [[0,1], [0,1,2], [0,1,2,3]]
]
```

在块中不存在的列将使用默认值填充（您可以在这里使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）

## 格式设置 {#format-settings}
