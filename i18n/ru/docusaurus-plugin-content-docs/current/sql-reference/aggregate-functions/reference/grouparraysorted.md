---
description: 'Возвращает массив из первых N элементов, отсортированных по возрастанию.'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
title: 'groupArraySorted'
doc_type: 'reference'
---

# groupArraySorted

Возвращает массив с первыми N элементами в порядке возрастания.

```sql
groupArraySorted(N)(column)
```

**Аргументы**

* `N` – Количество элементов, которые нужно вернуть.

* `column` – Значение (Integer, String, Float и другие обобщённые типы).

**Пример**

Возвращает первые 10 чисел:

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

Возвращает строковые представления всех чисел в столбце:

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
