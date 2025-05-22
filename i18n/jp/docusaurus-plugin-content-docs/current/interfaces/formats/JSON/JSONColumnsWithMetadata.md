---
'alias': []
'description': 'JSONColumnsWithMetadata フォーマットのドキュメント'
'input_format': true
'keywords':
- 'JSONColumnsWithMetadata'
'output_format': true
'slug': '/interfaces/formats/JSONColumnsWithMetadata'
'title': 'JSONColumnsWithMetadata'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONColumns`](./JSONColumns.md) フォーマットとは異なり、メタデータと統計情報も含まれており（[`JSON`](./JSON.md) フォーマットに似ています）、これが特徴です。

:::note
`JSONColumnsWithMetadata` フォーマットは、すべてのデータをメモリにバッファし、その後単一のブロックとして出力するため、高いメモリ消費を引き起こす可能性があります。
:::

## 使用例 {#example-usage}

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

`JSONColumnsWithMetadata` 入力フォーマットに対して、設定 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) が `1` に設定されている場合、入力データのメタデータから取得したタイプが、テーブルの対応するカラムのタイプと比較されます。

## フォーマット設定 {#format-settings}
