---
title: JSONCompactColumns
slug: /interfaces/formats/JSONCompactColumns
keywords: [JSONCompactColumns]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットでは、すべてのデータが単一のJSON配列として表現されます。

:::note
`JSONCompactColumns` 出力フォーマットは、すべてのデータをメモリ内でバッファリングし、単一のブロックとして出力するため、高いメモリ消費を引き起こす可能性があります。
:::

## 使用例 {#example-usage}

```json
[
	[42, 43, 44],
	["hello", "hello", "hello"],
	[[0,1], [0,1,2], [0,1,2,3]]
]
```

ブロックに存在しないカラムは、デフォルト値で埋められます（ここでは [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定を使用できます）。

## フォーマット設定 {#format-settings}
