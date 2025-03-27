---
alias: []
description: 'Документация по формату JSON'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `JSON` читает и выводит данные в формате JSON. 

Формат `JSON` возвращает следующее: 

| Параметр                    | Описание                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | Имена столбцов и их типы.                                                                                                                                                                                                                     |
| `data`                       | Таблицы данных                                                                                                                                                                                                                                |
| `rows`                       | Общее количество выходных строк.                                                                                                                                                                                                           |
| `rows_before_limit_at_least` | Минимальное количество строк, которое было бы без LIMIT. Выводится только если запрос содержит LIMIT. Если запрос содержит `GROUP BY`, то rows_before_limit_at_least — это точное количество строк, которое было бы без `LIMIT`. |
| `statistics`                 | Статистика, такая как `elapsed`, `rows_read`, `bytes_read`.                                                                                                                                                                                   |
| `totals`                     | Итоговые значения (при использовании WITH TOTALS).                                                                                                                                                                                                     |
| `extremes`                   | Экстремальные значения (когда экстремумы установлены в 1).                                                                                                                                                                                               |

Тип `JSON` совместим с JavaScript. Для обеспечения этого некоторые символы дополнительно экранируются: 
- слэш `/` экранируется как `\/`
- альтернативные переносы строк `U+2028` и `U+2029`, которые ломают некоторые браузеры, экранируются как `\uXXXX`. 
- ASCII управляющие символы экранируются: возврат каретки, переводы формата, переводы строк и горизонтальные табуляции заменяются на `\b`, `\f`, `\n`, `\r`, `\t`, а также остальные байты в диапазоне 00-1F с использованием последовательностей `\uXXXX`. 
- Неверные последовательности UTF-8 заменяются на символ замены �, так что выходной текст будет состоять из валидных UTF-8 последовательностей. 

Для совместимости с JavaScript целые числа Int64 и UInt64 по умолчанию заключаются в двойные кавычки. 
Чтобы удалить кавычки, вы можете установить параметр конфигурации [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) в `0`.

ClickHouse поддерживает [NULL](/sql-reference/syntax.md), который отображается как `null` в выходном JSON. Для включения значений `+nan`, `-nan`, `+inf`, `-inf` в вывод, установите [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) в `1`.

## Пример использования {#example-usage}

Пример:

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

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
                        "num": 42,
                        "str": "hello",
                        "arr": [0,1]
                },
                {
                        "num": 43,
                        "str": "hello",
                        "arr": [0,1,2]
                },
                {
                        "num": 44,
                        "str": "hello",
                        "arr": [0,1,2,3]
                }
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001137687,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## Настройки формата {#format-settings}

Для формата ввода JSON, если настройка [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) установлена в `1`,
типы из метаданных в входных данных будут сравниваться с типами соответствующих столбцов из таблицы.

## См. также {#see-also}

- формат [JSONEachRow](/interfaces/formats/JSONEachRow)
- настройка [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)
