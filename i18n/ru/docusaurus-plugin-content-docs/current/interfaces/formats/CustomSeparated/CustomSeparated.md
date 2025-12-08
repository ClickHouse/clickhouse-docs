---
alias: []
description: 'Документация по формату CustomSeparated'
input_format: true
keywords: ['CustomSeparated']
output_format: true
slug: /interfaces/formats/CustomSeparated
title: 'CustomSeparated'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Аналогично формату [Template](../Template/Template.md), но выводит или читает все имена и типы столбцов и использует правило экранирования из настройки [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule), а также разделители из следующих настроек:

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter) 

:::note
Не использует настройки правил экранирования и разделители, определённые в строках формата.
:::

Также существует формат [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md), аналогичный [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md).

## Примеры использования {#example-usage}

### Вставка данных {#inserting-data}

Используйте следующий текстовый файл `football.txt`:

```text
row('2022-04-30';2021;'Sutton United';'Bradford City';1;4),row('2022-04-30';2021;'Swindon Town';'Barrow';2;1),row('2022-04-30';2021;'Tranmere Rovers';'Oldham Athletic';2;0),row('2022-05-02';2021;'Salford City';'Mansfield Town';2;2),row('2022-05-02';2021;'Port Vale';'Newport County';1;2),row('2022-05-07';2021;'Barrow';'Northampton Town';1;3),row('2022-05-07';2021;'Bradford City';'Carlisle United';2;0),row('2022-05-07';2021;'Bristol Rovers';'Scunthorpe United';7;0),row('2022-05-07';2021;'Exeter City';'Port Vale';0;1),row('2022-05-07';2021;'Harrogate Town A.F.C.';'Sutton United';0;2),row('2022-05-07';2021;'Hartlepool United';'Colchester United';0;2),row('2022-05-07';2021;'Leyton Orient';'Tranmere Rovers';0;1),row('2022-05-07';2021;'Mansfield Town';'Forest Green Rovers';2;2),row('2022-05-07';2021;'Newport County';'Rochdale';0;2),row('2022-05-07';2021;'Oldham Athletic';'Crawley Town';3;3),row('2022-05-07';2021;'Stevenage Borough';'Salford City';4;2),row('2022-05-07';2021;'Walsall';'Swindon Town';0;3)
```

Настройте параметры пользовательского разделителя:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.txt' FORMAT CustomSeparated;
```

### Чтение данных {#reading-data}

Настройте параметры пользовательского разделителя:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Считайте данные, используя формат `CustomSeparated`:

```sql
SELECT *
FROM football
FORMAT CustomSeparated
```

Результат будет выведен в настроенном пользовательском формате:

```text
row('2022-04-30';2021;'Sutton United';'Bradford City';1;4),row('2022-04-30';2021;'Swindon Town';'Barrow';2;1),row('2022-04-30';2021;'Tranmere Rovers';'Oldham Athletic';2;0),row('2022-05-02';2021;'Port Vale';'Newport County';1;2),row('2022-05-02';2021;'Salford City';'Mansfield Town';2;2),row('2022-05-07';2021;'Barrow';'Northampton Town';1;3),row('2022-05-07';2021;'Bradford City';'Carlisle United';2;0),row('2022-05-07';2021;'Bristol Rovers';'Scunthorpe United';7;0),row('2022-05-07';2021;'Exeter City';'Port Vale';0;1),row('2022-05-07';2021;'Harrogate Town A.F.C.';'Sutton United';0;2),row('2022-05-07';2021;'Hartlepool United';'Colchester United';0;2),row('2022-05-07';2021;'Leyton Orient';'Tranmere Rovers';0;1),row('2022-05-07';2021;'Mansfield Town';'Forest Green Rovers';2;2),row('2022-05-07';2021;'Newport County';'Rochdale';0;2),row('2022-05-07';2021;'Oldham Athletic';'Crawley Town';3;3),row('2022-05-07';2021;'Stevenage Borough';'Salford City';4;2),row('2022-05-07';2021;'Walsall';'Swindon Town';0;3)
```

## Настройки формата {#format-settings}

Дополнительные настройки:

| Настройка                                                                                                                                                      | Описание                                                                                                                    | Значение по умолчанию |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                       | включает автоматическое определение заголовка с именами и типами, если он присутствует.                                    | `true`                 |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)               | пропускает завершающие пустые строки в конце файла.                                                                        | `false`                |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | допускает переменное число столбцов в формате CustomSeparated, игнорирует лишние столбцы и использует значения по умолчанию для отсутствующих столбцов. | `false`                |