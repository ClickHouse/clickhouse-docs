---
slug: '/interfaces/formats/TemplateIgnoreSpaces'
description: 'Документация для формата TemplateIgnoreSpaces'
title: TemplateIgnoreSpaces
keywords: ['TemplateIgnoreSpaces']
doc_type: reference
input_format: true
output_format: false
---
| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✗     |           |

## Описание {#description}

Похож на [`Template`], но пропускает символы пробела между разделителями и значениями во входном потоке. 
Тем не менее, если форматные строки содержат символы пробела, такие символы будут ожидаться во входном потоке. 
Также позволяет указывать пустые заполнители (`${}` или `${:None}`), чтобы разбить некоторые разделители на отдельные части, чтобы игнорировать пробелы между ними. 
Такие заполнители используются только для пропуска символов пробела.
Можно читать `JSON`, используя этот формат, если значения колонок имеют одинаковый порядок во всех строках.

:::note
Этот формат подходит только для входных данных.
:::

## Пример использования {#example-usage}

Следующий запрос может быть использован для вставки данных из его выходного примера формата [JSON](/interfaces/formats/JSON):

```sql
INSERT INTO table_name 
SETTINGS
    format_template_resultset = '/some/path/resultset.format',
    format_template_row = '/some/path/row.format',
    format_template_rows_between_delimiter = ','
FORMAT TemplateIgnoreSpaces
```

```text title="/some/path/resultset.format"
{${}"meta"${}:${:JSON},${}"data"${}:${}[${data}]${},${}"totals"${}:${:JSON},${}"extremes"${}:${:JSON},${}"rows"${}:${:JSON},${}"rows_before_limit_at_least"${}:${:JSON}${}}
```

```text title="/some/path/row.format"
{${}"SearchPhrase"${}:${}${phrase:JSON}${},${}"c"${}:${}${cnt:JSON}${}}
```

## Настройки формата {#format-settings}