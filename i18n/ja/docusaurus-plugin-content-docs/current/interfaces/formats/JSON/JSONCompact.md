---
title: JSONCompact
slug: /interfaces/formats/JSONCompact
keywords: [JSONCompact]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データ行がオブジェクトではなく配列として出力される点で、[JSON](./JSON.md)とは異なります。

## 使用例 {#example-usage}

```json
{
        "meta":
        [
                {
                        "name": "num",
                        "type": "Int32"
                },
                {
                        "name": "str",
                        "type": "String"
                },
                {
                        "name": "arr",
                        "type": "Array(UInt8)"
                }
        ],

        "data":
        [
                [42, "hello", [0,1]],
                [43, "hello", [0,1,2]],
                [44, "hello", [0,1,2,3]]
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001222069,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## フォーマット設定 {#format-settings}
