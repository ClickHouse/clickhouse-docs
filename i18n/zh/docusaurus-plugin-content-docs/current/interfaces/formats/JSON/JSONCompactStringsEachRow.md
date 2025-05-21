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



| 输入   | 输出   | 别名   |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 的不同之处在于数据字段作为字符串输出，而不是作为类型化的 JSON 值。

## 示例用法 {#example-usage}

示例：

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## 格式设置 {#format-settings}
