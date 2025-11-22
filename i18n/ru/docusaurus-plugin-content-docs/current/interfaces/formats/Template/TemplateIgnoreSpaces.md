---
alias: []
description: 'Документация по формату TemplateIgnoreSpaces'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |



## Описание {#description}

Аналогичен [`Template`], но пропускает пробельные символы между разделителями и значениями во входном потоке.
Однако если строки формата содержат пробельные символы, эти символы должны присутствовать во входном потоке.
Также позволяет указывать пустые заполнители (`${}` или `${:None}`) для разделения разделителя на отдельные части, чтобы игнорировать пробелы между ними.
Такие заполнители используются только для пропуска пробельных символов.
С помощью этого формата можно читать `JSON`, если значения столбцов имеют одинаковый порядок во всех строках.

:::note
Этот формат подходит только для входных данных.
:::


## Пример использования {#example-usage}

Следующий запрос можно использовать для вставки данных из вывода в формате [JSON](/interfaces/formats/JSON):

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
