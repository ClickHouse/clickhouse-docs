---
title : JSONCompactEachRow
slug: /interfaces/formats/JSONCompactEachRow
keywords : [JSONCompactEachRow]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データ行がオブジェクトではなく配列として出力される点で、[`JSONEachRow`](./JSONEachRow.md)とは異なります。

## 使用例 {#example-usage}

例:

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## フォーマット設定 {#format-settings}


