---
alias: []
description: 'Документация для формата JSONCompactStrings'
input_format: false
keywords: ['JSONCompactStrings']
output_format: true
slug: /interfaces/formats/JSONCompactStrings
title: 'JSONCompactStrings'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Формат `JSONCompactStrings` отличается от [JSONStrings](./JSONStrings.md) только тем, что строки данных выводятся в виде массивов, а не объектов.

## Пример использования {#example-usage}

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

## Настройки формата {#format-settings}
