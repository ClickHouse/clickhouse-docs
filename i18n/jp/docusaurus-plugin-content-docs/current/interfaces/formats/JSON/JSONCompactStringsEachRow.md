---
alias: []
description: 'JSONCompactStringsEachRow フォーマットのドキュメント'
input_format: true
keywords: ['JSONCompactStringsEachRow']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRow
title: 'JSONCompactStringsEachRow'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) とは異なり、データフィールドが型付きの JSON 値としてではなく、文字列として出力されることが特徴です。

## 使用例 {#example-usage}

例:

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## フォーマット設定 {#format-settings}
