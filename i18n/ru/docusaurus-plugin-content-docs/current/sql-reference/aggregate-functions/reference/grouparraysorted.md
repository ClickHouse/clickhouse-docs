---
description: 'Возвращает массив из первых N элементов, отсортированных по возрастанию.'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
title: 'groupArraySorted'
doc_type: 'reference'
---

# groupArraySorted {#grouparraysorted}

Возвращает массив из первых N элементов в порядке возрастания.

```sql
groupArraySorted(N)(column)
```

**Аргументы**

* `N` – Количество возвращаемых элементов.

* `column` – Значение столбца (Integer, String, Float и другие обобщённые типы).

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

Возвращает все строковые представления всех чисел в столбце:

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
