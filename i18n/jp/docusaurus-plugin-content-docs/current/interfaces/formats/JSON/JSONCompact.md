---
alias: []
description: 'JSONCompact形式のドキュメント'
input_format: true
keywords:
- 'JSONCompact'
output_format: true
slug: '/interfaces/formats/JSONCompact'
title: 'JSONCompact'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データ行がオブジェクトではなく配列として出力される点が[JSON](./JSON.md)と異なります。

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
