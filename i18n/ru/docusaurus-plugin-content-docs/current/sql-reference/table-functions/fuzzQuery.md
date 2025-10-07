---
slug: '/sql-reference/table-functions/fuzzQuery'
sidebar_label: fuzzQuery
sidebar_position: 75
description: 'Искажает данную строку запроса случайными вариантами.'
title: fuzzQuery
doc_type: reference
---
# fuzzQuery Табличная Функция

Искажет заданную строку запроса с помощью случайных вариаций.

## Синтаксис {#syntax}

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

## Аргументы {#arguments}

| Аргумент           | Описание                                                                    |
|--------------------|----------------------------------------------------------------------------|
| `query`            | (Строка) - Исходный запрос, над которым будет проводиться искажение.      |
| `max_query_length` | (UInt64) - Максимальная длина, которую может достичь запрос во время искажения. |
| `random_seed`      | (UInt64) - Случайное семя для получения стабильных результатов.             |

## Возвращаемое значение {#returned_value}

Объект таблицы с одной колонкой, содержащей искаженные строки запросов.

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