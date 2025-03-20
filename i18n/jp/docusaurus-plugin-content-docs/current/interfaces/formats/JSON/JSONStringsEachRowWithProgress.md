---
title: JSONStringsEachRowWithProgress
slug: /interfaces/formats/JSONStringsEachRowWithProgress
keywords: [JSONStringsEachRowWithProgress]
---

## 説明 {#description}

`JSONEachRow`/`JSONStringsEachRow`とは異なり、ClickHouseは進捗情報もJSON値として出力します。

## 使用例 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## フォーマット設定 {#format-settings}
