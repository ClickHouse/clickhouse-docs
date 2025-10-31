---
slug: '/interfaces/formats/JSONColumnsWithMetadata'
description: 'Документация для формата JSONColumnsWithMetadata'
title: JSONColumnsWithMetadata
keywords: ['JSONColumnsWithMetadata']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Отличается от формата [`JSONColumns`](./JSONColumns.md) тем, что также содержит некоторую метадату и статистику (аналогично формату [`JSON`](./JSON.md)).

:::note
Формат `JSONColumnsWithMetadata` буферизует все данные в памяти и затем выводит их как один блок, поэтому это может привести к высокому потреблению памяти.
:::

## Пример использования {#example-usage}

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
        {
                "num": [42, 43, 44],
                "str": ["hello", "hello", "hello"],
                "arr": [[0,1], [0,1,2], [0,1,2,3]]
        },

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.000272376,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

Для формата ввода `JSONColumnsWithMetadata`, если параметр [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) установлен в `1`,
типы из метаданных во входных данных будут сравниваться с типами соответствующих колонок из таблицы.

## Настройки формата {#format-settings}