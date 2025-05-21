---
'alias': []
'description': 'JSONCompactEachRow格式的文档'
'input_format': true
'keywords':
- 'JSONCompactEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRow'
'title': 'JSONCompactEachRow'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md) 的不同之处在于，数据行以数组的形式输出，而不是以对象的形式输出。

## 示例用法 {#example-usage}

示例：

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## 格式设置 {#format-settings}
