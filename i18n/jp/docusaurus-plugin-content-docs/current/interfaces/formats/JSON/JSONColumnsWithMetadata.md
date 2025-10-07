---
'alias': []
'description': 'JSONColumnsWithMetadata フォーマットに関するドキュメント'
'input_format': true
'keywords':
- 'JSONColumnsWithMetadata'
'output_format': true
'slug': '/interfaces/formats/JSONColumnsWithMetadata'
'title': 'JSONColumnsWithMetadata'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONColumns`](./JSONColumns.md) 形式とは異なり、いくつかのメタデータと統計を含んでいます（[`JSON`](./JSON.md) 形式に似ています）。

:::note
`JSONColumnsWithMetadata` 形式は、すべてのデータをメモリにバッファリングし、その後単一のブロックとして出力するため、高いメモリ消費を引き起こす可能性があります。
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

`JSONColumnsWithMetadata` 入力形式の場合、設定 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) が `1` に設定されていると、入力データのメタデータからの型が、テーブルの対応するカラムの型と比較されます。

## 形式設定 {#format-settings}
