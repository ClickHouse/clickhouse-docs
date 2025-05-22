| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

:::tip
JSONColumns* 格式的输出提供了 ClickHouse 字段名称以及该字段在表中每行的内容；视觉上，数据旋转了 90 度向左。
:::

在此格式中，所有数据表示为单个 JSON 对象。

:::note
`JSONColumns` 格式在内存中缓冲所有数据，然后作为单个块输出，因此可能会导致高内存消耗。
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

在导入期间，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则会跳过未知名称的列。块中不存在的列将用默认值填充（您可以在这里使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）。
