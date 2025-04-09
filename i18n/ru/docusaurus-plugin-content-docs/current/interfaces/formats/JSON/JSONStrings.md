---
alias: []
description: 'Документация для формата JSONStrings'
input_format: true
keywords: ['JSONStrings']
output_format: true
slug: /interfaces/formats/JSONStrings
title: 'JSONStrings'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

Отличается от формата [JSON](./JSON.md) лишь тем, что поля данных выводятся в виде строк, а не как типизированные значения JSON.

## Example Usage {#example-usage}

Пример:

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

## Format Settings {#format-settings}
