---
'description': 'JSONStringsEachRowWithProgress 格式的文档'
'keywords':
- 'JSONStringsEachRowWithProgress'
'slug': '/interfaces/formats/JSONStringsEachRowWithProgress'
'title': 'JSONString每行进度'
'doc_type': 'reference'
---

## 描述 {#description}

与 `JSONEachRow`/`JSONStringsEachRow` 不同的是，ClickHouse 还将以 JSON 值的形式提供进度信息。

## 示例用法 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## 格式设置 {#format-settings}
