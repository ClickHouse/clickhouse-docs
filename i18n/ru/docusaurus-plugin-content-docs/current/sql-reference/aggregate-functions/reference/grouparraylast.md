---
description: 'Создаёт массив последних значений аргумента.'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
doc_type: 'reference'
---

# groupArrayLast

Синтаксис: `groupArrayLast(max_size)(x)`

Создаёт массив последних по порядку значений аргумента.
Например, `groupArrayLast(1)(x)` эквивалентно `[anyLast(x)]`.

В некоторых случаях можно полагаться на порядок выполнения. Это относится к ситуациям, когда `SELECT` выполняется из подзапроса с `ORDER BY`, если результат подзапроса достаточно невелик.

**Пример**

Запрос:

```sql
SELECT groupArrayLast(2)(number+1) numbers FROM numbers(10)
```

Результат:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

По сравнению с `groupArray`:

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
