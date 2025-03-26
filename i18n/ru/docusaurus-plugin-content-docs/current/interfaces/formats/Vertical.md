---
alias: []
description: 'Документация для вертикального формата'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: 'Вертикальный'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Выводит каждое значение на отдельной строке с указанным именем столбца. Этот формат удобен для печати всего одной или нескольких строк, если каждая строка состоит из большого количества столбцов. 
[`NULL`](/sql-reference/syntax.md) выводится как `ᴺᵁᴸᴸ`.

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

Строки не экранируются в вертикальном формате:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

Этот формат подходит только для вывода результата запроса, но не для парсинга (извлечения данных для вставки в таблицу).

## Настройки формата {#format-settings}
