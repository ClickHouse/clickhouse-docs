---
description: 'Выполняет изменение заданной строки запроса с случайными вариациями.'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
---


# fuzzQuery Табличная Функция

Выполняет изменение заданной строки запроса с случайными вариациями.

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**Аргументы**

- `query` (String) - Исходный запрос, на котором будет выполняться изменение.
- `max_query_length` (UInt64) - Максимальная длина, которую запрос может достигнуть в процессе изменения.
- `random_seed` (UInt64) - Случайное семя для получения стабильных результатов.

**Возвращаемое значение**

Объект таблицы с единственным столбцом, содержащим измененные строки запросов.

## Пример использования {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
