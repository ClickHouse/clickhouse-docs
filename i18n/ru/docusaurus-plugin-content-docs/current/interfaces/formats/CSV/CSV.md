---
title: CSV
slug: /interfaces/formats/CSV
keywords: ['CSV']
input_format: true
output_format: true
alias: []
---

## Описание {#description}

Формат значений, разделенных запятыми (Comma Separated Values) ([RFC](https://tools.ietf.org/html/rfc4180)).
При форматировании строки заключаются в двойные кавычки. Двойная кавычка внутри строки выводится как две двойные кавычки подряд.
Нет других правил для экранирования символов.

- Даты и даты-время заключаются в двойные кавычки.
- Числа выводятся без кавычек.
- Значения разделяются символом-разделителем, который по умолчанию равен `,`. Символ-разделитель определяется в настройке [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter).
- Строки разделяются с использованием перевода строки Unix (LF).
- Массивы сериализуются в CSV следующим образом:
  - сначала массив сериализуется в строку, как в формате TabSeparated
  - Результирующая строка выводится в CSV в двойных кавычках.
- Кортежи в формате CSV сериализуются как отдельные колонки (то есть их вложенность в кортеже теряется).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
По умолчанию символ разделителя равен `,`.
Смотрите настройку [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) для получения дополнительной информации.
:::

При разборе все значения могут быть разобраны с кавычками или без. Поддерживаются оба варианта: двойные и одинарные кавычки.

Строки также могут быть оформлены без кавычек. В этом случае они разбираются до символа-разделителя или перевода строки (CR или LF).
Однако, в нарушение RFC, при разборе строк без кавычек игнорируются начальные и конечные пробелы и табуляции.
Перевод строки поддерживает: Unix (LF), Windows (CR LF) и Mac OS Classic (CR LF).

`NULL` форматируется в соответствии с настройкой [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) (значение по умолчанию - `\N`).

В входных данных значения `ENUM` могут быть представлены как именами, так и идентификаторами.
Сначала мы пытаемся сопоставить входное значение с именем ENUM.
Если это не удается и входное значение является числом, мы пытаемся сопоставить это число с идентификатором ENUM.
Если входные данные содержат только идентификаторы ENUM, рекомендуется включить настройку [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number), чтобы оптимизировать разбор `ENUM`.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

| Настройка                                                                                                                                                            | Описание                                                                                                        | Значение по умолчанию | Примечания                                                                                                                                                                                        |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                      | символ, который будет считаться разделителем в данных CSV.                                                     | `,`                   |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                  | разрешить строки в одинарных кавычках.                                                                         | `true`                |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                  | разрешить строки в двойных кавычках.                                                                          | `true`                |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                  | пользовательское представление NULL в формате CSV.                                                               | `\N`                  |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                            | считать пустые поля в входном CSV как значения по умолчанию.                                                   | `true`                | Для сложных значений по умолчанию настройка [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) также должна быть включена. | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                                | считать вставленные значения ENUM в формате CSV как индексы ENUM.                                             | `false`               |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)      | использовать некоторые усовершенствования и эвристики для вывода схемы в формате CSV. Если отключено, все поля будут считаться строками. | `true`                |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                    | при чтении массива из CSV ожидать, что его элементы были сериализованы в виде вложенного CSV и затем помещены в строку.      | `false`               |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                          | если установлено в true, конец строки в формате CSV будет `\r\n`, а не `\n`.                                   | `false`               |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | пропустить указанное количество строк в начале данных.                                                           | `0`                   |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | автоматически обнаруживать заголовок с именами и типами в формате CSV.                                         | `true`                |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                          | пропустить завершающие пустые строки в конце данных.                                                            | `false`               |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                            | обрезать пробелы и табуляции в незаключенных в кавычки строках CSV.                                          | `true`                |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)  | Разрешить использовать пробел или табуляцию в качестве разделителя полей в строках CSV.                          | `false`               |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)            | разрешить переменное количество колонок в формате CSV, игнорировать дополнительные колонки и использовать значения по умолчанию для отсутствующих колонок. | `false`               |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                          | Разрешить установить значение по умолчанию для колонки, когда десериализация поля CSV не удалась из-за неправильного значения.   | `false`               |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)                | Попытаться определить числа из строковых полей при выводе схемы.                                               | `false`               |                                                                                                                                                                                              |
