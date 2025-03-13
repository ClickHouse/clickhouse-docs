---
title: PrettyJSONEachRow
slug: /interfaces/formats/PrettyJSONEachRow
keywords: ['PrettyJSONEachRow', 'PrettyJSONLines', 'PrettyNDJSON']
input_format: false
output_format: true
alias: ['PrettyJSONLines', 'PrettyNDJSON']
---

| Входные данные | Выходные данные | Псевдоним                        |
|----------------|-----------------|----------------------------------|
| ✗              | ✔               | `PrettyJSONLines`, `PrettyNDJSON` |

## Описание {#description}

Отличается от [JSONEachRow](./JSONEachRow.md) только тем, что JSON имеет красивое форматирование с разделителями строк и отступами в 4 пробела.

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
