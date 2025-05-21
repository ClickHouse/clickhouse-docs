---
'alias': []
'description': 'JSONColumnsWithMetadata 格式的文档'
'input_format': true
'keywords':
- 'JSONColumnsWithMetadata'
'output_format': true
'slug': '/interfaces/formats/JSONColumnsWithMetadata'
'title': 'JSONColumnsWithMetadata'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONColumns`](./JSONColumns.md) 格式不同的是，它还包含一些元数据和统计信息（类似于 [`JSON`](./JSON.md) 格式）。

:::note
`JSONColumnsWithMetadata` 格式会将所有数据缓冲到内存中，然后作为一个单独的块输出，因此可能会导致高内存消耗。
:::

## 示例用法 {#example-usage}

示例：

```json
{
        "meta":
        [
                {
                        "name": "num",
                        "type": "Int32"
                },
                {
                        "name": "str",
                        "type": "String"
                },

                {
                        "name": "arr",
                        "type": "Array(UInt8)"
                }
        ],

        "data":
        {
                "num": [42, 43, 44],
                "str": ["hello", "hello", "hello"],
                "arr": [[0,1], [0,1,2], [0,1,2,3]]
        },

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.000272376,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

对于 `JSONColumnsWithMetadata` 输入格式，如果设置 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 的值为 `1`，则输入数据中的元数据类型将与表中相应列的类型进行比较。

## 格式设置 {#format-settings}
