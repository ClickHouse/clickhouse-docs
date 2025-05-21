---
alias: []
description: 'JSONColumnsフォーマットのドキュメント'
input_format: true
keywords: ['JSONColumns']
output_format: true
slug: /interfaces/formats/JSONColumns
title: 'JSONColumns'
---

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

:::tip
JSONColumns*フォーマットの出力は、ClickHouseフィールド名を提供し、そのフィールドの各行の内容を示します; 視覚的には、データは左に90度回転されています。
:::

このフォーマットでは、すべてのデータが単一のJSONオブジェクトとして表現されます。

:::note
`JSONColumns`フォーマットはすべてのデータをメモリにバッファリングし、次に単一のブロックとして出力するため、高いメモリ消費につながる可能性があります。
:::

## 使用例 {#example-usage}

例:

```json
{
    "num": [42, 43, 44],
    "str": ["hello", "hello", "hello"],
    "arr": [[0,1], [0,1,2], [0,1,2,3]]
}
```

## フォーマット設定 {#format-settings}

インポート中、未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。
ブロックに存在しないカラムはデフォルト値で埋められます（ここで[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)設定を使用できます）。
