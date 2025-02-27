---
title : JSONStringsEachRow
slug: /interfaces/formats/JSONStringsEachRow
keywords : [JSONStringsEachRow]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

[`JSONEachRow`](./JSONEachRow.md) との違いは、データフィールドが型付きJSON値ではなく、文字列として出力される点です。

## 使用例 {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## フォーマットの設定 {#format-settings}
