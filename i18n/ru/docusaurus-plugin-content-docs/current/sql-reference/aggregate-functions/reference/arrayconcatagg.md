---
description: 'Документация для функции array_concat_agg'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/array_concat_agg
title: 'array_concat_agg'
---


# array_concat_agg
- Псевдоним для `groupArrayArray`. Функция нечувствительна к регистру.

**Пример**

```text
SELECT *
FROM t

```

Запрос:

```sql
┌           ┐
│[1,2,3]    │
│[4,5]      │
│[6]        │
└           ┘

```
┌ ─a───────────── ┌
│ [1,2,3,4,5,6]   │
└ ─────────────── └
