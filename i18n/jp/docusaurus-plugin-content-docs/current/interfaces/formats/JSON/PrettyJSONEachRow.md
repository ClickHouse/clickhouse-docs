---
'alias':
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'description': 'PrettyJSONEachRow フォーマットのドキュメント'
'input_format': false
'keywords':
- 'PrettyJSONEachRow'
- 'PrettyJSONLines'
- 'PrettyNDJSON'
'output_format': true
'slug': '/interfaces/formats/PrettyJSONEachRow'
'title': 'PrettyJSONEachRow'
---



| Input | Output | Alias                             |
|-------|--------|-----------------------------------|
| ✗     | ✔      | `PrettyJSONLines`, `PrettyNDJSON` |

## 説明 {#description}

[JSONEachRow](./JSONEachRow.md) とは異なり、JSONが新しい行区切りと4つのスペースのインデントできれいにフォーマットされています。

## 使用例 {#example-usage}

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

## フォーマット設定 {#format-settings}
