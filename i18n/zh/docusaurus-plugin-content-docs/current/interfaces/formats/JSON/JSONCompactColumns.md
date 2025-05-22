| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在这种格式中，所有数据作为单个 JSON 数组表示。

:::note
`JSONCompactColumns` 输出格式会将所有数据缓冲在内存中，以便将其作为单个块输出，这可能导致高内存消耗。
:::

## 示例用法 {#example-usage}

```json
[
    [42, 43, 44],
    ["hello", "hello", "hello"],
    [[0,1], [0,1,2], [0,1,2,3]]
]
```

在块中不存在的列将用默认值填充（您可以在此处使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）

## 格式设置 {#format-settings}
