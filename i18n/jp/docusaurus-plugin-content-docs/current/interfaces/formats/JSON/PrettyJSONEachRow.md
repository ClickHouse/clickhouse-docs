---
alias: ['PrettyJSONLines', 'PrettyNDJSON']
description: 'PrettyJSONLinesフォーマットのドキュメント'
input_format: false
keywords: ['PrettyJSONEachRow', 'PrettyJSONLines', 'PrettyNDJSON']
output_format: true
slug: /interfaces/formats/PrettyJSONEachRow
title: 'PrettyJSONEachRow'
---

| 入力 | 出力 | 別名                             |
|------|------|-----------------------------------|
| ✗    | ✔   | `PrettyJSONLines`, `PrettyNDJSON` |

## 説明 {#description}

[JSONEachRow](./JSONEachRow.md)と異なるのは、JSONが新しい行の区切りと4つのスペースのインデントで整形されている点のみです。

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
