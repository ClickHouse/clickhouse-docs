---
'alias':
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'description': 'PrettyJSONEachRow格式的文档'
'input_format': false
'keywords':
- 'PrettyJSONEachRow'
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'output_format': true
'slug': '/interfaces/formats/PrettyJSONEachRow'
'title': 'PrettyJSONEachRow'
---



| 输入  | 输出  | 别名                               |
|-------|--------|-----------------------------------|
| ✗     | ✔      | `PrettyJSONLines`, `PrettyNDJSON` |

## 描述 {#description}

仅与 [JSONEachRow](./JSONEachRow.md) 的不同在于，JSON 采用了漂亮格式，使用换行符作为分隔符，并且缩进为 4 个空格。

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
