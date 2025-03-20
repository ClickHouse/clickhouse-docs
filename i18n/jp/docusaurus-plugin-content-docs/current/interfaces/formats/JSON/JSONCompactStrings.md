---
title: JSONCompactStrings
slug: /interfaces/formats/JSONCompactStrings
keywords: [JSONCompactStrings]
input_format: false
output_format: true
alias: []
---

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`JSONCompactStrings`フォーマットは、[JSONStrings](./JSONStrings.md)と異なり、データ行がオブジェクトではなく配列として出力される点が特徴です。

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
                ["42", "hello", "[0,1]"],
                ["43", "hello", "[0,1,2]"],
                ["44", "hello", "[0,1,2,3]"]
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001572097,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## フォーマット設定 {#format-settings}
