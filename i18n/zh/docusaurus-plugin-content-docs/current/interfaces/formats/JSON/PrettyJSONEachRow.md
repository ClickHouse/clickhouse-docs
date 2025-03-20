---
title: PrettyJSONEachRow
slug: /接口/格式/PrettyJSONEachRow
keywords: ['PrettyJSONEachRow', 'PrettyJSONLines', 'PrettyNDJSON']
input_format: false
output_format: true
alias: ['PrettyJSONLines', 'PrettyNDJSON']
---

| 输入 | 输出 | 别名                              |
|------|------|-----------------------------------|
| ✗    | ✔    | `PrettyJSONLines`, `PrettyNDJSON` |

## 描述 {#description}

仅与 [JSONEachRow](./JSONEachRow.md) 不同的是，JSON 采用漂亮的格式，使用换行符和 4 个空格缩进。

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


