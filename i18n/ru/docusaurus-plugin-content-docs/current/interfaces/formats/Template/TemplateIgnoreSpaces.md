---
title: TemplateIgnoreSpaces
slug: /interfaces/formats/TemplateIgnoreSpaces
keywords: ['TemplateIgnoreSpaces']
input_format: true
output_format: false
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Похоже на [`Template`], но пропускает пробелы между разделителями и значениями во входном потоке. 
Однако, если строковые форматы содержат пробелы, эти символы должны быть ожидаемыми во входном потоке. 
Также позволяет указывать пустые заполнители (`${}` или `${:None}`), чтобы разделить разделитель на отдельные части и игнорировать пробелы между ними. 
Такие заполнители используются только для пропуска пробелов.
С помощью этого формата можно читать `JSON`, если значения колонок имеют одинаковый порядок во всех строках.

:::note
Этот формат подходит только для входных данных.
:::

## Пример использования {#example-usage}

Следующий запрос можно использовать для вставки данных из его выходного примера формата [JSON](/interfaces/formats/JSON):

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
