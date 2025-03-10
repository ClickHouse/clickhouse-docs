---
slug: /sql-reference/aggregate-functions/reference/any
sidebar_position: 102
title: 'any'
description: 'Выбирает первое встретившееся значение колонки.'
---


# any

Выбирает первое встретившееся значение колонки.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции является недетерминированным. 
Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, т.е. игнорирует NULL значения во входной колонке. 
Однако, если функция используется с модификатором `RESPECT NULLS`, она возвращает первое прочитанное значение, независимо от того, является ли оно NULL или нет.

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
- `column`: имя колонки.

**Возвращаемое значение**

Первое встретившееся значение.

:::note
Тип возвращаемого значения функции такой же, как и входной, за исключением LowCardinality, который отбрасывается. 
Это означает, что при отсутствии строк на входе она вернет значение по умолчанию данного типа (0 для целых чисел или Null для колонки Nullable()).
Вы можете использовать компаратор `-OrNull` [combinator](../../../sql-reference/aggregate-functions/combinators.md) для изменения этого поведения.
:::

**Подробности реализации**

В некоторых случаях вы можете полагаться на порядок выполнения. 
Это относится к случаям, когда `SELECT` происходит из подзапроса, использующего `ORDER BY`.

Когда запрос `SELECT` содержит оператор `GROUP BY` или хотя бы одну агрегатную функцию, ClickHouse (в отличие от MySQL) требует, чтобы все выражения в `SELECT`, `HAVING` и `ORDER BY` были рассчитаны из ключей или из агрегатных функций. 
Другими словами, каждая колонка, выбранная из таблицы, должна использоваться либо в ключах, либо внутри агрегатных функций. 
Чтобы получить поведение, подобное в MySQL, вы можете поместить другие колонки в агрегатную функцию `any`.

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
