---
alias: []
description: 'Документация для формата CSV'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
---

## Описание {#description}

Формат значений, разделенных запятыми (Comma Separated Values) ([RFC](https://tools.ietf.org/html/rfc4180)).
При форматировании строки заключаются в двойные кавычки. Двойная кавычка внутри строки выводится как две двойные кавычки подряд. 
Других правил для экранирования символов нет.

- Даты и даты-времена заключаются в двойные кавычки. 
- Числа выводятся без кавычек.
- Значения разделяются символом-разделителем, который по умолчанию равен `,`. Символ-разделитель определяется в настройке [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter). 
- Строки разделяются с использованием символа новой строки Unix (LF). 
- Массивы сериализуются в CSV следующим образом: 
  - сначала массив сериализуется в строку, как в формате TabSeparated
  - Полученная строка выводится в CSV в двойных кавычках.
- Кортежи в формате CSV сериализуются как отдельные столбцы (то есть их вложение в кортеж теряется).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
По умолчанию разделителем является `,`
Смотрите настройку [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) для получения дополнительной информации.
:::

При разборе все значения могут быть разобраны как с кавычками, так и без. Поддерживаются как двойные, так и одинарные кавычки.

Строки также могут быть представлены без кавычек. В этом случае они разбираются до символа-разделителя или новой строки (CR или LF).
Однако, в нарушение RFC, при разборе строк без кавычек игнорируются начальные и конечные пробелы и табуляции.
Символ новой строки поддерживает: Unix (LF), Windows (CR LF) и Mac OS Classic (CR LF).

`NULL` форматируется в соответствии с настройкой [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) (значение по умолчанию — `\N`).

В входных данных значения `ENUM` могут быть представлены как именами, так и идентификаторами.
Сначала мы пытаемся сопоставить входное значение с именем ENUM.
Если не удается, и входное значение является числом, мы пробуем сопоставить это число с идентификатором ENUM.
Если входные данные содержат только идентификаторы ENUM, рекомендуется включить настройку [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) для оптимизации разбора `ENUM`.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

| Настройка                                                                                                                                             | Описание                                                                                                             | По умолчанию | Примечания                                                                                                                                                                                   |
|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                          | символ, который будет считаться разделителем в данных CSV.                                                         | `,`          |                                                                                                                                                                                             |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                      | разрешить строки в одинарных кавычках.                                                                            | `true`       |                                                                                                                                                                                             |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                      | разрешить строки в двойных кавычках.                                                                               | `true`       |                                                                                                                                                                                             |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                      | пользовательское представление NULL в формате CSV.                                                                  | `\N`         |                                                                                                                                                                                             |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                | воспринимать пустые поля во входных данных CSV как значения по умолчанию.                                          | `true`       | Для сложных значений по умолчанию также должна быть включена настройка [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields).      |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                    | воспринимать вставленные значения enum в форматах CSV как индексы enum.                                           | `false`      |                                                                                                                                                                                             |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference) | использовать некоторые ухищрения и эвристику для вывода схемы в формате CSV. Если отключено, все поля будут распознаны как строки. | `true`       |                                                                                                                                                                                             |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                        | при чтении массива из CSV ожидать, что его элементы были сериализованы в вложенный CSV и затем помещены в строку. | `false`      |                                                                                                                                                                                             |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                              | если выставить в true, конец строки в формате CSV будет `\r\n` вместо `\n`.                                       | `false`      |                                                                                                                                                                                             |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                | пропустить указанное количество строк в начале данных.                                                               | `0`          |                                                                                                                                                                                             |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                      | автоматически обнаруживать заголовок с именами и типами в формате CSV.                                           | `true`       |                                                                                                                                                                                             |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)              | пропустить пустые строки в конце данных.                                                                           | `false`      |                                                                                                                                                                                             |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                | обрезать пробелы и табуляции в непереданных строках CSV.                                                           | `true`       |                                                                                                                                                                                             |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter) | Разрешить использованиe пробела или табуляции в качестве разделителя полей в строках CSV.                          | `false`      |                                                                                                                                                                                             |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns) | разрешить переменное количество столбцов в формате CSV, игнорировать лишние столбцы и использовать значения по умолчанию для отсутствующих столбцов. | `false`      |                                                                                                                                                                                             |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)              | Разрешить задать значение по умолчанию для столбца, когда десериализация поля CSV не удалась из-за некорректного значения. | `false`      |                                                                                                                                                                                             |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)    | Попробовать извлечь числа из строковых полей во время вывода схемы.                                               | `false`      |                                                                                                                                                                                             |
