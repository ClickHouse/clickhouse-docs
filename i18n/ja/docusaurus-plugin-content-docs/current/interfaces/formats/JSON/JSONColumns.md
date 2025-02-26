---
title : JSONColumns
slug: /interfaces/formats/JSONColumns
keywords : [JSONColumns]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

:::tip
JSONColumns* フォーマットの出力は、ClickHouse のフィールド名と、そのフィールドに対するテーブル内の各行の内容を提供します；視覚的には、データは左に90度回転しています。
:::

このフォーマットでは、すべてのデータが単一の JSON オブジェクトとして表現されます。

:::note
`JSONColumns` フォーマットは、すべてのデータをメモリにバッファリングし、単一のブロックとして出力するため、高いメモリ消費を引き起こす可能性があります。
:::

## 使用例 {#example-usage}

例：

```json
{
	"num": [42, 43, 44],
	"str": ["hello", "hello", "hello"],
	"arr": [[0,1], [0,1,2], [0,1,2,3]]
}
```

## フォーマット設定 {#format-settings}

インポート中に、未知の名前のカラムは [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` に設定されている場合はスキップされます。
ブロックに存在しないカラムは、デフォルト値で埋められます（ここで [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定を使用できます）。
