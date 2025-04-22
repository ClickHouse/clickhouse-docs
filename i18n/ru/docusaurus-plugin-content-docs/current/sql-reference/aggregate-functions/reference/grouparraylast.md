---
description: 'Создает массив последних значений аргумента.'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
---


# groupArrayLast

Синтаксис: `groupArrayLast(max_size)(x)`

Создает массив последних значений аргумента. Например, `groupArrayLast(1)(x)` эквивалентно `[anyLast (x)]`.

В некоторых случаях вы все еще можете полагаться на порядок выполнения. Это относится к случаям, когда `SELECT` происходит из подзапроса, который использует `ORDER BY`, если результат подзапроса достаточно мал.

**Пример**

Запрос:

```sql
select groupArrayLast(2)(number+1) numbers from numbers(10)
```

Результат:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

В сравнении с `groupArray`:

```sql
select groupArray(2)(number+1) numbers from numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
