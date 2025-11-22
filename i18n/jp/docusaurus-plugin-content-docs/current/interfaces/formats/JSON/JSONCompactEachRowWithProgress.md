---
alias: []
description: 'JSONCompactEachRowWithProgress 形式のドキュメント'
input_format: false
keywords: ['JSONCompactEachRowWithProgress']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithProgress
title: 'JSONCompactEachRowWithProgress'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |



## Description {#description}

このフォーマットは、JSONCompactEachRowのコンパクトな行単位出力とストリーミング進捗情報を組み合わせたものです。
メタデータ、個別の行、進捗更新、合計、および例外を、それぞれ別個のJSONオブジェクトとして出力します。値はネイティブ型で表現されます。

主な特徴:

- 最初にカラム名と型を含むメタデータを出力
- 各行は、値の配列を含む"row"キーを持つ個別のJSONオブジェクト
- クエリ実行中の進捗更新を含む(`{"progress":...}`オブジェクトとして)
- 合計と極値をサポート
- 値はネイティブ型を保持(数値は数値として、文字列は文字列として)


## 使用例 {#example-usage}

```sql title="クエリ"
SELECT *
FROM generateRandom('a Array(Int8), d Decimal32(4), c Tuple(DateTime64(3), UUID)', 1, 10, 2)
LIMIT 5
FORMAT JSONCompactEachRowWithProgress
```

```response title="レスポンス"
{"meta":[{"name":"a","type":"Array(Int8)"},{"name":"d","type":"Decimal(9, 4)"},{"name":"c","type":"Tuple(DateTime64(3), UUID)"}]}
{"row":[[-8], 46848.5225, ["2064-06-11 14:00:36.578","b06f4fa1-22ff-f84f-a1b7-a5807d983ae6"]]}
{"row":[[-76], -85331.598, ["2038-06-16 04:10:27.271","2bb0de60-3a2c-ffc0-d7a7-a5c88ed8177c"]]}
{"row":[[-32], -31470.8994, ["2027-07-18 16:58:34.654","1cdbae4c-ceb2-1337-b954-b175f5efbef8"]]}
{"row":[[-116], 32104.097, ["1979-04-27 21:51:53.321","66903704-3c83-8f8a-648a-da4ac1ffa9fc"]]}
{"row":[[], 2427.6614, ["1980-04-24 11:30:35.487","fee19be8-0f46-149b-ed98-43e7455ce2b2"]]}
{"progress":{"read_rows":"5","read_bytes":"184","total_rows_to_read":"5","elapsed_ns":"335771"}}
{"rows_before_limit_at_least":5}
```


## フォーマット設定 {#format-settings}
