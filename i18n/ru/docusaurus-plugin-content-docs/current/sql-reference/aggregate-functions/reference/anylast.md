---
description: 'Выбирает последнее встреченное значение столбца.'
sidebar_position: 105
slug: /sql-reference/aggregate-functions/reference/anylast
title: 'anyLast'
---


# anyLast

Выбирает последнее встреченное значение столбца.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции является недетерминированным. Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, т.е. игнорирует значения NULL в входном столбце. Однако, если функция используется с модификатором `RESPECT NULLS`, она возвращает первое прочитанное значение, независимо от того, является ли оно NULL или нет.

**Синтаксис**

```sql
anyLast(column) [RESPECT NULLS]
```

Псевдоним `anyLast(column)` (без `RESPECT NULLS`)
- [`last_value`](../reference/last_value.md).

Псевдонимы для `anyLast(column) RESPECT NULLS`
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**Параметры**
- `column`: Имя столбца.

**Возвращаемое значение**

- Последнее встреченное значение.

**Пример**

Запрос:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES ('Amsterdam'),(NULL),('New York'),('Tokyo'),('Valencia'),(NULL);

SELECT anyLast(city), anyLastRespectNulls(city) FROM tab;
```

```response
┌─anyLast(city)─┬─anyLastRespectNulls(city)─┐
│ Valencia      │ ᴺᵁᴸᴸ                      │
└───────────────┴───────────────────────────┘
```
