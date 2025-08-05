---
alias: []
description: 'JSONStrings形式のドキュメント'
input_format: true
keywords:
- 'JSONStrings'
output_format: true
slug: '/interfaces/formats/JSONStrings'
title: 'JSONStrings'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データフィールドが型付きのJSON値ではなく文字列として出力される以外は、[JSON](./JSON.md)フォーマットと異なります。

## 使用例 {#example-usage}

例:

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
                {
                        "num": "42",
                        "str": "hello",
                        "arr": "[0,1]"
                },
                {
                        "num": "43",
                        "str": "hello",
                        "arr": "[0,1,2]"
                },
                {
                        "num": "44",
                        "str": "hello",
                        "arr": "[0,1,2,3]"
                }
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001403233,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## フォーマット設定 {#format-settings}
