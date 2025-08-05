---
alias: []
description: 'JSONCompactEachRow フォーマットのドキュメント'
input_format: true
keywords:
- 'JSONCompactEachRow'
output_format: true
slug: '/interfaces/formats/JSONCompactEachRow'
title: 'JSONCompactEachRow'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONEachRow`](./JSONEachRow.md) とは異なり、データ行はオブジェクトではなく配列として出力されます。

## 例の使い方 {#example-usage}

例:

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## フォーマット設定 {#format-settings}
