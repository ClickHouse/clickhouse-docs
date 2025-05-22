| 输入   | 输出   | 别名                              |
|--------|--------|-----------------------------------|
| ✗      | ✔      | `PrettyJSONLines`, `PrettyNDJSON` |

## 描述 {#description}

仅与 [JSONEachRow](./JSONEachRow.md) 不同的是，JSON 被美化格式化，使用换行符作为分隔符，并且缩进为4个空格。

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
