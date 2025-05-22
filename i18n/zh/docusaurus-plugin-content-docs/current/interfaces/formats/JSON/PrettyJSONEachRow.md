---
'alias':
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'description': 'PrettyJSONLines 格式的文档'
'input_format': false
'keywords':
- 'PrettyJSONEachRow'
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'output_format': true
'slug': '/interfaces/formats/PrettyJSONEachRow'
'title': 'PrettyJSONEachRow'
---

| 输入  | 输出  | 别名                             |
|-------|--------|-----------------------------------|
| ✗     | ✔      | `PrettyJSONLines`, `PrettyNDJSON` |

## 描述 {#description}

与 [JSONEachRow](./JSONEachRow.md) 的区别仅在于 JSON 是使用换行符和4个空格缩进进行美化格式化的。

## 示例用法 {#example-usage}

```json
{
    "num": "42",
    "str": "hello",
    "arr": [
        "0",
        "1"
    ],
    "tuple": {
        "num": 42,
        "str": "world"
    }
}
{
    "num": "43",
    "str": "hello",
    "arr": [
        "0",
        "1",
        "2"
    ],
    "tuple": {
        "num": 43,
        "str": "world"
    }
}
```

## 格式设置 {#format-settings}
