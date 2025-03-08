---
slug: /sql-reference/table-functions/fuzzQuery
sidebar_position: 75
sidebar_label: fuzzQuery
title: "fuzzQuery"
description: "Вносит случайные вариации в заданную строку запроса."
---


# Функция таблицы fuzzQuery

Вносит случайные вариации в заданную строку запроса.

``` sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**Аргументы**

- `query` (String) - Исходный запрос, на который будет проведено фуззирование.
- `max_query_length` (UInt64) - Максимальная длина, которую может иметь запрос в процессе фуззирования.
- `random_seed` (UInt64) - Случайное семя для получения стабильных результатов.

**Возвращаемое значение**

Объект таблицы с одной колонкой, содержащей измененные строки запроса.

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
