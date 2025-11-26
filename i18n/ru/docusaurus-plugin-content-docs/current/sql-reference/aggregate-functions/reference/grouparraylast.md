---
description: 'Создаёт массив из последних значений аргумента.'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
doc_type: 'reference'
---

# groupArrayLast

Синтаксис: `groupArrayLast(max_size)(x)`

Создаёт массив из последних значений аргумента.
Например, `groupArrayLast(1)(x)` эквивалентен `[anyLast (x)]`.

В некоторых случаях вы всё ещё можете полагаться на порядок выполнения. Это относится к случаям, когда оператор `SELECT` получает данные из подзапроса, использующего `ORDER BY`, если результат подзапроса достаточно мал.

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
