---
slug: '/interfaces/formats/JSON'
description: 'Документация для формата JSON'
title: JSON
keywords: ['JSON']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `JSON` считывает и выводит данные в формате JSON.

Формат `JSON` возвращает следующее:

| Параметр                    | Описание                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | Имена и типы колонок.                                                                                                                                                                                                                    |
| `data`                       | Таблицы данных                                                                                                                                                                                                                                |
| `rows`                       | Общее количество выходных строк.                                                                                                                                                                                                           |
| `rows_before_limit_at_least` | Нижняя оценка количества строк, которые могли бы быть без LIMIT. Выводится только если запрос содержит LIMIT. Эта оценка рассчитывается на основе блоков данных, обработанных в конвейере запросов до трансформации лимита, но затем может быть отброшена трансформацией лимита. Если блоки даже не дошли до трансформации лимита в конвейере запросов, они не участвуют в оценке. |
| `statistics`                 | Статистика, такая как `elapsed`, `rows_read`, `bytes_read`.                                                                                                                                                                                   |
| `totals`                     | Общие значения (при использовании WITH TOTALS).                                                                                                                                                                                                     |
| `extremes`                   | Экстремальные значения (при установке extremes в 1).                                                                                                                                                                                               |

Тип `JSON` совместим с JavaScript. Для обеспечения этого некоторые символы дополнительно экранируются:
- обратный слэш `/` экранируется как `\/`
- альтернативные разрывы строк `U+2028` и `U+2029`, которые ломают некоторые браузеры, экранируются как `\uXXXX`. 
- Символы управления ASCII экранируются: возврат каретки, перевод страницы, перевод строки и горизонтальная табуляция заменяются на `\b`, `\f`, `\n`, `\r`, `\t`, а также оставшиеся байты в диапазоне 00-1F с помощью последовательностей `\uXXXX`. 
- Неверные последовательности UTF-8 заменяются на символ замены �, чтобы выходной текст состоял из действительных последовательностей UTF-8.

Для совместимости с JavaScript целые числа Int64 и UInt64 заключаются в двойные кавычки по умолчанию. 
Чтобы убрать кавычки, вы можете установить параметр конфигурации [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) в `0`.

ClickHouse поддерживает [NULL](/sql-reference/syntax.md), который отображается как `null` в выходном JSON. Чтобы включить значения `+nan`, `-nan`, `+inf`, `-inf` в вывод, установите [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) в `1`.

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

Для формата ввода JSON, если установка [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) установлена на `1`,
типы из метаданных в входных данных будут сравниваться с типами соответствующих колонок из таблицы.

## См. также {#see-also}

- Формат [JSONEachRow](/interfaces/formats/JSONEachRow)
- Установка [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)