---
description: 'JSONStringsEachRowWithProgress 形式のドキュメント'
keywords: ['JSONStringsEachRowWithProgress']
slug: /interfaces/formats/JSONStringsEachRowWithProgress
title: 'JSONStringsEachRowWithProgress'
doc_type: 'reference'
---



## 説明 {#description}

`JSONEachRow`/`JSONStringsEachRow` と異なり、ClickHouse は進捗情報も JSON 形式で出力します。



## 使用例

```json
{"row":{"num":42,"str":"こんにちは","arr":[0,1]}}
{"row":{"num":43,"str":"こんにちは","arr":[0,1,2]}}
{"row":{"num":44,"str":"こんにちは","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```


## 書式設定 {#format-settings}
