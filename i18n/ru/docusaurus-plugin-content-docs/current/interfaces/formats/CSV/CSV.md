---
alias: []
description: 'Документация о формате CSV'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---



## Описание

Формат значений, разделённых запятыми (Comma Separated Values, [RFC](https://tools.ietf.org/html/rfc4180)).
При форматировании строки (записи) заключаются в двойные кавычки. Двойная кавычка внутри строки выводится как две двойные кавычки подряд.
Других правил экранирования символов нет.

* Значения типа Date и DateTime заключаются в двойные кавычки.
* Числа выводятся без кавычек.
* Значения разделяются символом-разделителем, который по умолчанию равен `,`. Символ-разделитель задаётся настройкой [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter).
* Строки (записи) разделяются с использованием символа перевода строки Unix (LF).
* Массивы сериализуются в CSV следующим образом:
  * сначала массив сериализуется в строку так же, как и в формате TabSeparated;
  * полученная строка выводится в CSV в двойных кавычках.
* Кортежи в формате CSV сериализуются как отдельные столбцы (то есть их вложенность внутри кортежа теряется).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
По умолчанию разделителем является `,`
Дополнительные сведения см. в настройке [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter).
:::

При разборе все значения могут обрабатываться как в кавычках, так и без них. Поддерживаются как двойные, так и одиночные кавычки.

Строки также могут быть записаны без кавычек. В этом случае они разбираются до символа-разделителя или символа перевода строки (CR или LF).
Однако в нарушение RFC при разборе строк без кавычек начальные и конечные пробелы и табуляции игнорируются.
Поддерживаются следующие виды перевода строки: Unix (LF), Windows (CR LF) и Mac OS Classic (CR LF).

`NULL` форматируется в соответствии с настройкой [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation) (значение по умолчанию — `\N`).

Во входных данных значения типа `ENUM` могут быть представлены как именами, так и идентификаторами.
Сначала выполняется попытка сопоставить входное значение с именем ENUM.
Если это не удаётся и входное значение является числом, выполняется попытка сопоставить это число с идентификатором ENUM.
Если во входных данных содержатся только идентификаторы ENUM, рекомендуется включить настройку [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) для оптимизации разбора `ENUM`.


## Пример использования {#example-usage}



## Настройки формата {#format-settings}

| Параметр                                                                                                                                                          | Описание                                                                                                           | По умолчанию | Примечания                                                                                                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | символ, который будет рассматриваться как разделитель в данных CSV.                                               | `,`          |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | разрешать строки в одинарных кавычках.                                                                            | `true`       |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | разрешать строки в двойных кавычках.                                                                              | `true`       |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | пользовательское представление значения NULL в формате CSV.                                                        | `\N`         |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | рассматривать пустые поля во входных данных CSV как значения по умолчанию.                                        | `true`       | Для сложных выражений по умолчанию параметр [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) также должен быть включён. | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | рассматривать вставляемые значения ENUM в формате CSV как индексы ENUM.                                           | `false`      |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | использовать некоторые оптимизации и эвристики для вывода схемы в формате CSV. Если отключено, все поля будут определены как строки (`String`). | `true`       |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | при чтении `Array` из CSV ожидать, что его элементы были сериализованы во вложенном CSV и затем помещены в строку. | `false`      |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | если установлено в `true`, конец строки в выходном формате CSV будет `\r\n` вместо `\n`.                           | `false`      |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | пропускать указанное количество строк в начале данных.                                                             | `0`          |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | автоматически определять заголовок с именами и типами в формате CSV.                                               | `true`       |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | пропускать пустые строки в конце данных.                                                                           | `false`      |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | обрезать пробелы и символы табуляции в строках CSV, не заключённых в кавычки.                                     | `true`       |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | разрешать использовать пробел или табуляцию как разделитель полей в строках CSV.                                  | `false`      |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | разрешать переменное количество столбцов в формате CSV, игнорировать лишние столбцы и использовать значения по умолчанию для отсутствующих. | `false`      |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | разрешать устанавливать значение по умолчанию для столбца, если десериализация поля CSV завершилась неудачей из‑за некорректного значения. | `false`      |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | пытаться выводить числовые значения из строковых полей при выводе схемы.                                           | `false`      |                                                                                                                                                                                              |