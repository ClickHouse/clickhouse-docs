---
'alias': []
'description': 'JSONEachRowWithProgress 格式的文档'
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

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) 的不同之处在于，ClickHouse 还将以 JSON 值的形式提供进度信息。

## 示例用法 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## 格式设置 {#format-settings}
