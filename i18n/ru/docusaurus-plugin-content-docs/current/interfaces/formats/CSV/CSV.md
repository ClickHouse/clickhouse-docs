---
alias: []
description: 'Документация по формату CSV'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---



## Описание {#description}

Формат Comma Separated Values ([RFC](https://tools.ietf.org/html/rfc4180)).
При форматировании строки заключаются в двойные кавычки. Двойная кавычка внутри строки выводится как две двойные кавычки подряд.
Других правил экранирования символов нет.

- Дата и дата-время заключаются в двойные кавычки.
- Числа выводятся без кавычек.
- Значения разделяются символом-разделителем, по умолчанию это `,`. Символ-разделитель задаётся настройкой [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter).
- Строки разделяются символом перевода строки Unix (LF).
- Массивы сериализуются в CSV следующим образом:
  - сначала массив сериализуется в строку как в формате TabSeparated
  - полученная строка выводится в CSV в двойных кавычках.
- Кортежи в формате CSV сериализуются как отдельные столбцы (то есть их вложенность в кортеже теряется).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
По умолчанию разделителем является `,`
Подробнее см. в описании настройки [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter).
:::

При парсинге все значения могут обрабатываться как с кавычками, так и без них. Поддерживаются как двойные, так и одинарные кавычки.

Строки также могут быть представлены без кавычек. В этом случае они парсятся до символа-разделителя или перевода строки (CR или LF).
Однако, в нарушение RFC, при парсинге строк без кавычек начальные и конечные пробелы и табуляции игнорируются.
Поддерживаются следующие типы перевода строки: Unix (LF), Windows (CR LF) и Mac OS Classic (CR LF).

`NULL` форматируется в соответствии с настройкой [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) (значение по умолчанию — `\N`).

Во входных данных значения `ENUM` могут быть представлены как имена или как идентификаторы.
Сначала выполняется попытка сопоставить входное значение с именем ENUM.
Если это не удаётся и входное значение является числом, выполняется попытка сопоставить это число с идентификатором ENUM.
Если входные данные содержат только идентификаторы ENUM, рекомендуется включить настройку [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) для оптимизации парсинга `ENUM`.


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

| Настройка                                                                                                                                                  | Описание                                                                                                        | По умолчанию | Примечания                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                   | Символ, используемый в качестве разделителя в данных CSV.                                                         | `,`     |                                                                                                                                                                                      |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                               | Разрешить строки в одинарных кавычках.                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                               | Разрешить строки в двойных кавычках.                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                               | Пользовательское представление NULL в формате CSV.                                                                          | `\N`    |                                                                                                                                                                                      |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                         | Обрабатывать пустые поля во входных данных CSV как значения по умолчанию.                                                                 | `true`  | Для сложных выражений по умолчанию также необходимо включить [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields). |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                             | Обрабатывать вставляемые значения enum в форматах CSV как индексы enum.                                                         | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)   | Использовать дополнительные настройки и эвристики для определения схемы в формате CSV. Если отключено, все поля будут определены как String. | `true`  |                                                                                                                                                                                      |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                 | При чтении массива (Array) из CSV ожидать, что его элементы были сериализованы во вложенном CSV, а затем помещены в строку.      | `false` |                                                                                                                                                                                      |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                       | Если установлено значение true, символ конца строки в выходном формате CSV будет `\r\n` вместо `\n`.                             | `false` |                                                                                                                                                                                      |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                         | Пропустить указанное количество строк в начале данных.                                                       | `0`     |                                                                                                                                                                                      |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                               | Автоматически определять заголовок с именами и типами в формате CSV.                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                       | Пропустить завершающие пустые строки в конце данных.                                                                      | `false` |                                                                                                                                                                                      |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                         | Удалять пробелы и табуляции в строках CSV без кавычек.                                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter) | Разрешить использование пробела или табуляции в качестве разделителя полей в строках CSV.                                                  | `false` |                                                                                                                                                                                      |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)         | Разрешить переменное количество столбцов в формате CSV, игнорировать лишние столбцы и использовать значения по умолчанию для отсутствующих столбцов.    | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                       | Разрешить установку значения по умолчанию для столбца, когда десериализация поля CSV не удалась из-за некорректного значения.                           | `false` |                                                                                                                                                                                      |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)             | Пытаться определить числа из строковых полей при определении схемы.                                                    | `false` |                                                                                                                                                                                      |
