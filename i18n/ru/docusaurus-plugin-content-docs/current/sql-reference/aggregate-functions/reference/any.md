---
description: 'Выбирает первое встретившееся значение колонки.'
sidebar_position: 102
slug: /sql-reference/aggregate-functions/reference/any
title: 'any'
---


# any

Выбирает первое встретившееся значение колонки.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции является недетерминированным.
Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, т.е. игнорирует NULL значения в входной колонке.
Однако, если функция используется с модификатором `RESPECT NULLS`, она возвращает первое значение, независимо от того, является ли оно NULL или нет.

**Синтаксис**

```sql
any(column) [RESPECT NULLS]
```

Псевдонимы `any(column)` (без `RESPECT NULLS`)
- `any_value`
- [`first_value`](../reference/first_value.md).

Псевдонимы для `any(column) RESPECT NULLS`
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**Параметры**
- `column`: Имя колонки.

**Возвращаемое значение**

Первое встретившееся значение.

:::note
Тип возвращаемого значения функции такой же, как и тип входного, за исключением LowCardinality, который отбрасывается.
Это означает, что при отсутствии строк на входе она вернет значение по умолчанию для этого типа (0 для целых чисел или Null для колонки Nullable()).
Вы можете использовать комбинатор `-OrNull` [комбинатор](../../../sql-reference/aggregate-functions/combinators.md), чтобы изменить это поведение.
:::

**Детали реализации**

В некоторых случаях вы можете полагаться на порядок выполнения.
Это касается случаев, когда `SELECT` происходит из подзапроса, который использует `ORDER BY`.

Когда запрос `SELECT` содержит клаузу `GROUP BY` или хотя бы одну агрегатную функцию, ClickHouse (в отличие от MySQL) требует, чтобы все выражения в клаузах `SELECT`, `HAVING` и `ORDER BY` вычислялись из ключей или из агрегатных функций.
Другими словами, каждая колонка, выбранная из таблицы, должна использоваться либо в ключах, либо внутри агрегатных функций.
Чтобы получить поведение, аналогичное MySQL, вы можете поместить другие колонки в агрегатную функцию `any`.

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
