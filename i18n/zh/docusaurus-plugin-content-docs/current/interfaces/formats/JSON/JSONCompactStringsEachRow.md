---
'alias': []
'description': 'JSONCompactStringsEachRow 格式的文档'
'input_format': true
'keywords':
- 'JSONCompactStringsEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONCompactStringsEachRow'
'title': 'JSONCompactStringsEachRow'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 的区别在于数据字段以字符串形式输出，而不是以类型化的 JSON 值输出。

## 示例用法 {#example-usage}

示例：

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## 格式设置 {#format-settings}
