---
alias: []
description: 'JSONColumnsWithMetadata 格式说明文档'
input_format: true
keywords: ['JSONColumnsWithMetadata']
output_format: true
slug: /interfaces/formats/JSONColumnsWithMetadata
title: 'JSONColumnsWithMetadata'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONColumns`](./JSONColumns.md) 格式的区别在于，它还包含一些元数据和统计信息（类似于 [`JSON`](./JSON.md) 格式）。

:::note
`JSONColumnsWithMetadata` 格式会将所有数据缓存在内存中，然后以单个数据块输出，因此可能会导致较高的内存占用。
:::

## 使用示例 {#example-usage}

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

对于 `JSONColumnsWithMetadata` 输入格式，如果将 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 设置为 `1`，则会将输入数据中元数据中的类型与表中对应列的类型进行比较。


## 格式设置 {#format-settings}