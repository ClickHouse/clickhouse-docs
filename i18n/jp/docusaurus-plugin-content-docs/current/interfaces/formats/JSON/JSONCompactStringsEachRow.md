---
title: JSONCompactStringsEachRow
slug: /interfaces/formats/JSONCompactStringsEachRow
keywords: [JSONCompactStringsEachRow]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) とは異なり、データフィールドは型付きJSON値ではなく、文字列として出力されます。

## 使用例 {#example-usage}

例:

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## フォーマット設定 {#format-settings}
