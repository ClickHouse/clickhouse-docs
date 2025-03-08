---
title: JSON
slug: /interfaces/formats/JSON
keywords: ['JSON']
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

Формат `JSON` считывает и выводит данные в формате JSON.

Формат `JSON` возвращает следующее:

| Параметр                     | Описание                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | Имена колонок и их типы.                                                                                                                                                                                                                 |
| `data`                       | Таблицы данных                                                                                                                                                                                                                          |
| `rows`                       | Общее количество выходных строк.                                                                                                                                                                                                          |
| `rows_before_limit_at_least` | Минимальное количество строк, которое было бы без LIMIT. Выводится только если запрос содержит LIMIT. Если запрос содержит `GROUP BY`, rows_before_limit_at_least - это точное количество строк, которое было бы без `LIMIT`. |
| `statistics`                 | Статистика, такая как `elapsed`, `rows_read`, `bytes_read`.                                                                                                                                                                           |
| `totals`                     | Итоговые значения (при использовании WITH TOTALS).                                                                                                                                                                                     |
| `extremes`                   | Экстремальные значения (при установке extremes в 1).                                                                                                                                                                                   |

Тип `JSON` совместим с JavaScript. Для обеспечения этого некоторые символы дополнительно экранируются:
- слэш `/` экранируется как `\/`
- альтернативные переносы строк `U+2028` и `U+2029`, которые нарушают работу некоторых браузеров, экранируются как `\uXXXX`.
- Символы управления ASCII экранируются: возврат табуляции, форма, новая строка, возврат каретки и горизонтальная табуляция заменяются на `\b`, `\f`, `\n`, `\r`, `\t`, а также оставшиеся байты в диапазоне 00-1F с использованием последовательностей `\uXXXX`.
- Неправильные последовательности UTF-8 заменяются на символ замены �, чтобы текст вывода состоял из правильных последовательностей UTF-8.

Для совместимости с JavaScript, целые числа Int64 и UInt64 по умолчанию заключаются в двойные кавычки. Чтобы убрать кавычки, вы можете установить параметр конфигурации [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) в `0`.

ClickHouse поддерживает [NULL](/sql-reference/syntax.md), который отображается как `null` в JSON-выводе. Чтобы включить значения `+nan`, `-nan`, `+inf`, `-inf` в вывод, установите [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) в `1`.

## Example Usage {#example-usage}

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

## Format Settings {#format-settings}

Для формата ввода JSON, если настройка [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) установлена в `1`, типы из метаданных во входных данных будут сравниваться с типами соответствующих колонок из таблицы.

## See Also {#see-also}

- Формат [JSONEachRow](/interfaces/formats/JSONEachRow)
- Настройка [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)
