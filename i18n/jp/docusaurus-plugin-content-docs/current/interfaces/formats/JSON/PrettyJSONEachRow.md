---
title: PrettyJSONEachRow
slug: /interfaces/formats/PrettyJSONEachRow
keywords: [PrettyJSONEachRow, PrettyJSONLines, PrettyNDJSON]
input_format: false
output_format: true
alias: ['PrettyJSONLines', 'PrettyNDJSON']
---

| 入力 | 出力 | エイリアス                           |
|------|------|--------------------------------------|
| ✗    | ✔    | `PrettyJSONLines`, `PrettyNDJSON`  |

## 説明 {#description}

[JSONEachRow](./JSONEachRow.md) とは異なり、JSONが整形され、新しい行の区切りと4スペースのインデントが使用されています。

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
