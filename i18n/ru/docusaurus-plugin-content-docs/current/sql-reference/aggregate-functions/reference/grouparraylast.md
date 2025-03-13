---
slug: /sql-reference/aggregate-functions/reference/grouparraylast
sidebar_position: 142
title: 'groupArrayLast'
description: 'Создает массив последних значений аргументов.'
---


# groupArrayLast

Синтаксис: `groupArrayLast(max_size)(x)`

Создает массив последних значений аргументов.  
Например, `groupArrayLast(1)(x)` эквивалентно `[anyLast (x)]`.

В некоторых случаях вы все еще можете полагаться на порядок выполнения. Это касается случаев, когда `SELECT` происходит из подзапроса, использующего `ORDER BY`, если результат подзапроса достаточно мал.

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
