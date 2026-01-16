---
alias: []
description: 'JSONColumnsWithMetadata 形式に関するドキュメント'
input_format: true
keywords: ['JSONColumnsWithMetadata']
output_format: true
slug: /interfaces/formats/JSONColumnsWithMetadata
title: 'JSONColumnsWithMetadata'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

[`JSONColumns`](./JSONColumns.md) フォーマットとは異なり、一部のメタデータおよび統計情報も含まれます（[`JSON`](./JSON.md) フォーマットと同様）。

:::note
`JSONColumnsWithMetadata` フォーマットは、すべてのデータをメモリ内にバッファリングしてから単一のブロックとして出力するため、メモリ消費量が大きくなる可能性があります。
:::

## 使用例 \{#example-usage\}

例：

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

`JSONColumnsWithMetadata` 入力形式では、[`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) の設定が `1` の場合、
入力データ内のメタデータに含まれる型が、テーブル内の対応するカラムの型と比較されます。

## フォーマット設定 \{#format-settings\}