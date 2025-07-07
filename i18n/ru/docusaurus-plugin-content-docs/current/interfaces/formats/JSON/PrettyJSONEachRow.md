---
alias: ['PrettyJSONLines', 'PrettyNDJSON']
description: 'Документация по формату PrettyJSONLines'
input_format: false
keywords: ['PrettyJSONEachRow', 'PrettyJSONLines', 'PrettyNDJSON']
output_format: true
slug: /interfaces/formats/PrettyJSONEachRow
title: 'PrettyJSONEachRow'
---

| Входные данные | Выходные данные | Псевдоним                        |
|----------------|-----------------|-----------------------------------|
| ✗              | ✔               | `PrettyJSONLines`, `PrettyNDJSON` |

## Описание {#description}

Отличается от [JSONEachRow](./JSONEachRow.md) только тем, что JSON форматируется с отступами в 4 пробела и разделителями в виде новых строк.

## Пример использования {#example-usage}

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

## Настройки формата {#format-settings}
