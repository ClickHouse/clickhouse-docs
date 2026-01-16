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

| Вход | Выход | Алиас |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание \\{#description\\}

Аналогично формату [`Template`], но пропускает пробельные символы между разделителями и значениями во входном потоке. 
Однако если в строках формата присутствуют пробельные символы, эти символы будут ожидаться во входном потоке. 
Также позволяет указывать пустые плейсхолдеры (`${}` или `${:None}`), чтобы разделить один разделитель на отдельные части и игнорировать пробелы между ними. 
Такие плейсхолдеры используются только для пропуска пробельных символов.
Можно читать данные в формате `JSON` с использованием этого формата, если значения столбцов имеют один и тот же порядок во всех строках.

:::note
Этот формат предназначен только для ввода.
:::

## Пример использования \\{#example-usage\\}

Следующий запрос можно использовать для вставки данных из приведённого выше примера вывода в формате [JSON](/interfaces/formats/JSON):

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

## Параметры форматирования \\{#format-settings\\}