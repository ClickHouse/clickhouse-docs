---
alias: []
description: 'JSONStringsEachRowフォーマットのドキュメント'
input_format: false
keywords: ['JSONStringsEachRow']
output_format: true
slug: /interfaces/formats/JSONStringsEachRow
title: 'JSONStringsEachRow'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

データフィールドが型付きのJSON値ではなく、文字列で出力される点が[`JSONEachRow`](./JSONEachRow.md)と異なります。

## 使用例 {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## フォーマット設定 {#format-settings}
