---
slug: '/sql-reference/aggregate-functions/reference/grouparraylast'
sidebar_position: 142
description: 'Создает массив значений последних аргументов.'
title: groupArrayLast
doc_type: reference
---
# groupArrayLast

Синтаксис: `groupArrayLast(max_size)(x)`

Создает массив последних значений аргументов. Например, `groupArrayLast(1)(x)` эквивалентно `[anyLast (x)]`.

В некоторых случаях вы все еще можете полагаться на порядок выполнения. Это относится к случаям, когда `SELECT` поступает из подзапроса, использующего `ORDER BY`, если результат подзапроса достаточно мал.

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

В отличие от `groupArray`:

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```