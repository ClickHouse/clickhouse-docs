---
alias: []
description: 'JSONCompactColumns フォーマットのドキュメント'
input_format: true
keywords:
- 'JSONCompactColumns'
output_format: true
slug: '/interfaces/formats/JSONCompactColumns'
title: 'JSONCompactColumns'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットでは、すべてのデータが単一のJSON配列として表現されます。

:::note
`JSONCompactColumns` 出力フォーマットは、すべてのデータをメモリにバッファリングして、単一のブロックとして出力します。これにより、高いメモリ消費が発生する可能性があります。
:::

## 使用例 {#example-usage}

```json
[
    [42, 43, 44],
    ["hello", "hello", "hello"],
    [[0,1], [0,1,2], [0,1,2,3]]
]
```

ブロックに存在しないカラムは、デフォルト値で埋められます（ここでは [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定を使用できます）

## フォーマット設定 {#format-settings}
