---
'alias': []
'description': 'JSONStringsEachRow格式的文档'
'input_format': false
'keywords':
- 'JSONStringsEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONStringsEachRow'
'title': 'JSONStringsEachRow'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md) 的不同之处在于数据字段以字符串格式输出，而不是以类型化的 JSON 值输出。

## 示例用法 {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## 格式设置 {#format-settings}
