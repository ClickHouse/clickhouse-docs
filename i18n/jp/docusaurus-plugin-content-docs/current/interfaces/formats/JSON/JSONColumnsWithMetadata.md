---
title: JSONColumnsWithMetadata
slug: /interfaces/formats/JSONColumnsWithMetadata
keywords: [JSONColumnsWithMetadata]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONColumns`](./JSONColumns.md)フォーマットとは異なり、いくつかのメタデータと統計情報を含んでいます（[`JSON`](./JSON.md)フォーマットに類似しています）。

:::note
`JSONColumnsWithMetadata`フォーマットは、すべてのデータをメモリにバッファリングした後、1つのブロックとして出力するため、高いメモリ消費につながる可能性があります。
:::

## 使用例 {#example-usage}

例:

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

`JSONColumnsWithMetadata`入力フォーマットの場合、設定 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) が `1` に設定されていると、入力データのメタデータにあるタイプがテーブルの対応するカラムのタイプと比較されます。

## フォーマット設定 {#format-settings}
