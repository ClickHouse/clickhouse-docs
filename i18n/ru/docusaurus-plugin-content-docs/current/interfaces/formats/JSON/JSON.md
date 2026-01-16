---
alias: []
description: 'Документация по формату JSON'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| Входной формат | Выходной формат | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |

## Описание \\{#description\\}

Формат `JSON` считывает и выводит данные в формате JSON. 

Формат `JSON` возвращает следующее: 

| Parameter                    | Description                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | Имена и типы столбцов.                                                                                                                                                                                                                     |
| `data`                       | Таблицы с данными.                                                                                                                                                                                                                         |
| `rows`                       | Общее количество выводимых строк.                                                                                                                                                                                                          |
| `rows_before_limit_at_least` | Нижняя оценка количества строк, которое было бы без LIMIT. Выводится только в том случае, если запрос содержит LIMIT. Эта оценка рассчитывается по блокам данных, обработанным в конвейере запроса до преобразования LIMIT, но затем может быть отброшена этим преобразованием. Если блоки даже не дошли до преобразования LIMIT в конвейере запроса, они не участвуют в оценке. |
| `statistics`                 | Статистика, такая как `elapsed`, `rows_read`, `bytes_read`.                                                                                                                                                                                |
| `totals`                     | Итоговые значения (при использовании WITH TOTALS).                                                                                                                                                                                         |
| `extremes`                   | Минимальные и максимальные значения (когда extremes установлено в 1).                                                                                                                                                                      |

Тип `JSON` совместим с JavaScript. Для обеспечения совместимости некоторые символы дополнительно экранируются: 

- косая черта `/` экранируется как `\/`;
- альтернативные переносы строки `U+2028` и `U+2029`, которые вызывают проблемы в некоторых браузерах, экранируются как `\uXXXX`;
- управляющие символы ASCII экранируются: backspace, form feed, line feed, carriage return и горизонтальная табуляция заменяются на `\b`, `\f`, `\n`, `\r`, `\t`, а оставшиеся байты в диапазоне 00-1F — с помощью последовательностей `\uXXXX`;
- некорректные последовательности UTF-8 заменяются символом замены �, так что выходной текст состоит из корректных последовательностей UTF-8. 

Для совместимости с JavaScript целые числа Int64 и UInt64 по умолчанию заключаются в двойные кавычки. 
Чтобы убрать кавычки, можно установить параметр конфигурации [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) в значение `0`.

ClickHouse поддерживает [NULL](/sql-reference/syntax.md), который отображается как `null` в выводе JSON. Чтобы включить вывод значений `+nan`, `-nan`, `+inf`, `-inf`, установите параметр [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) в значение `1`.

## Пример использования \\{#example-usage\\}

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

## Настройки формата \\{#format-settings\\}

Для формата ввода JSON, если настройка [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) установлена в значение `1`,
типы из метаданных во входных данных будут сравниваться с типами соответствующих столбцов таблицы.

## См. также \\{#see-also\\}

- формат [JSONEachRow](/interfaces/formats/JSONEachRow)
- настройка [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)