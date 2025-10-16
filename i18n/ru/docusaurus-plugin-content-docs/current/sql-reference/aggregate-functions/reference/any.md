---
slug: '/sql-reference/aggregate-functions/reference/any'
sidebar_position: 102
description: 'Выбирает первое встреченное значение колонки.'
title: any
doc_type: reference
---
# any

Выбирает первое встреченное значение колонки.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции является недетерминированным. Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, т.е. игнорирует значения NULL в входной колонке. Однако если функция используется с модификатором `RESPECT NULLS`, она возвращает первое значение, которое она читает, независимо от того, является ли оно NULL или нет.

**Синтаксис**

```sql
any(column) [RESPECT NULLS]
```

Псевдонимы `any(column)` (без `RESPECT NULLS`)
- `any_value`
- [`first_value`](../reference/first_value.md).

Псевдоним для `any(column) RESPECT NULLS`
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**Параметры**
- `column`: Имя колонки.

**Возвращаемое значение**

Первое встреченное значение.

:::note
Тип возвращаемого значения функции такой же, как и входное, за исключением LowCardinality, который отбрасывается. Это означает, что при отсутствии строк в качестве входных данных она вернет значение по умолчанию этого типа (0 для целых чисел или Null для колонки Nullable()). Вы можете использовать комбинатор `-OrNull` [комбинатор](../../../sql-reference/aggregate-functions/combinators.md), чтобы изменить это поведение.
:::

**Детали реализации**

В некоторых случаях вы можете полагаться на порядок выполнения. Это относится к случаям, когда `SELECT` исходит из подзапроса, который использует `ORDER BY`.

Когда запрос `SELECT` имеет клаузу `GROUP BY` или хотя бы одну агрегатную функцию, ClickHouse (в отличие от MySQL) требует, чтобы все выражения в клаузах `SELECT`, `HAVING` и `ORDER BY` были рассчитаны из ключей или агрегатных функций. Другими словами, каждая колонка, выбираемая из таблицы, должна использоваться либо в ключах, либо внутри агрегатных функций. Чтобы получить поведение, как в MySQL, вы можете поместить другие колонки в агрегатную функцию `any`.

**Пример**

Запрос:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES (NULL), ('Amsterdam'), ('New York'), ('Tokyo'), ('Valencia'), (NULL);

SELECT any(city), anyRespectNulls(city) FROM tab;
```

```response
┌─any(city)─┬─anyRespectNulls(city)─┐
│ Amsterdam │ ᴺᵁᴸᴸ                  │
└───────────┴───────────────────────┘
```