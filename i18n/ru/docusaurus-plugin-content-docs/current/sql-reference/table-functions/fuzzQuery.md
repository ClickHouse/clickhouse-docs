---
description: 'Возвращает измененную строку запроса с случайными вариациями.'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
---


# Табличная функция fuzzQuery

Возвращает измененную строку запроса с случайными вариациями.

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**Аргументы**

- `query` (Строка) - Исходный запрос, который будет изменен.
- `max_query_length` (UInt64) - Максимальная длина запроса во время процесса изменения.
- `random_seed` (UInt64) - Случайное семя для получения стабильных результатов.

**Возвращаемое значение**

Объект таблицы с единственной колонкой, содержащей измененные строки запросов.

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
