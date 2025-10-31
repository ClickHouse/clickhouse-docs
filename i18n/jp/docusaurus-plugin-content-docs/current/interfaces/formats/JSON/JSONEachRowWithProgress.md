---
'alias': []
'description': 'JSONEachRowWithProgress フォーマットのドキュメント'
'input_format': false
'keywords':
- 'JSONEachRowWithProgress'
'output_format': true
'slug': '/interfaces/formats/JSONEachRowWithProgress'
'title': 'JSONEachRowWithProgress'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

[`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) とは異なり、ClickHouse は JSON 値として進行状況情報も生成します。

## 例の使用法 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## フォーマット設定 {#format-settings}
