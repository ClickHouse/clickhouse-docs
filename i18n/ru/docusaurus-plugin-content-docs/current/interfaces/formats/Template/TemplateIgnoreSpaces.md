---
alias: []
description: 'Документация для формата TemplateIgnoreSpaces'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## Description {#description}

Похож на [`Template`], но пропускает пробелы между разделителями и значениями во входном потоке. 
Однако, если строковые форматы содержат пробелы, эти символы ожидаются во входном потоке. 
Также позволяет указывать пустые заполнительные строки (`${}` или `${:None}`), чтобы разделить некоторые разделители на отдельные части, игнорируя пробелы между ними. 
Эти заполнители используются только для пропуска пробелов.
С помощью этого формата возможно читать `JSON`, если значения столбцов имеют одинаковый порядок во всех строках.

:::note
Этот формат подходит только для ввода.
:::

## Example Usage {#example-usage}

Следующий запрос можно использовать для вставки данных из его примера вывода формата [JSON](/interfaces/formats/JSON):

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

## Format Settings {#format-settings}
