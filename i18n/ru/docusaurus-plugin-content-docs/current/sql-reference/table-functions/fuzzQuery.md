---
description: 'Вносит случайные изменения в указанную строку запроса.'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---

# Табличная функция fuzzQuery {#fuzzquery-table-function}

Модифицирует указанную строку запроса, внося в неё случайные изменения.

## Синтаксис {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## Аргументы {#arguments}

| Аргумент          | Описание                                                                      |
|-------------------|-------------------------------------------------------------------------------|
| `query`           | (String) — исходный запрос, над которым выполняется фаззинг.                 |
| `max_query_length`| (UInt64) — максимальная длина запроса в процессе фаззинга.                   |
| `random_seed`     | (UInt64) — начальное значение генератора случайных чисел для стабильных результатов. |

## Возвращаемое значение {#returned_value}

Объект таблицы с одним столбцом, содержащим изменённые строки запросов.

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
