---
description: 'Вносит в переданную строку запроса случайные изменения.'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
doc_type: 'reference'
---



# Табличная функция fuzzQuery

Вносит в указанную строку запроса случайные изменения.



## Синтаксис {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```


## Аргументы {#arguments}

| Аргумент           | Описание                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| `query`            | (String) - Исходный запрос, к которому применяется фаззинг.               |
| `max_query_length` | (UInt64) - Максимальная длина, которую может достичь запрос в процессе фаззинга. |
| `random_seed`      | (UInt64) - Начальное значение генератора случайных чисел для получения воспроизводимых результатов. |


## Возвращаемое значение {#returned_value}

Табличный объект с одним столбцом, содержащим изменённые строки запросов.


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
