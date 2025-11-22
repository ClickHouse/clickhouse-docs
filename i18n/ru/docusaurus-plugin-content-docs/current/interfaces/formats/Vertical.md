---
alias: []
description: 'Документация по формату Vertical'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: 'Vertical'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |



## Описание {#description}

Выводит каждое значение на отдельной строке с указанием имени столбца. Этот формат удобен для вывода одной или нескольких строк, когда каждая строка содержит большое количество столбцов.

Обратите внимание, что [`NULL`](/sql-reference/syntax.md) выводится как `ᴺᵁᴸᴸ`, чтобы было проще отличить строковое значение `NULL` от отсутствия значения. Столбцы JSON выводятся в форматированном виде, а `NULL` выводится как `null`, поскольку это корректное значение JSON, которое легко отличить от `"null"`.


## Пример использования {#example-usage}

Пример:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

Строки не экранируются в формате Vertical:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

Этот формат подходит только для вывода результатов запроса, но не для разбора (извлечения данных для вставки в таблицу).


## Настройки формата {#format-settings}
