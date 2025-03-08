---
slug: /sql-reference/aggregate-functions/reference/array_concat_agg
sidebar_position: 111
---


# array_concat_agg 
- Псевдоним для `groupArrayArray`. Функция не чувствительна к регистру.

**Пример**

```text
SELECT *
FROM t

┌─a───────┐
│ [1,2,3] │
│ [4,5]   │
│ [6]     │
└─────────┘

```

Запрос:

```sql
SELECT array_concat_agg(a) AS a
FROM t

┌─a─────────────┐
│ [1,2,3,4,5,6] │
└───────────────┘
```
