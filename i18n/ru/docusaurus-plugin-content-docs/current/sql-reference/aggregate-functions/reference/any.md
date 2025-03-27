---
description: 'Выбирает первое встретившееся значение столбца.'
sidebar_position: 102
slug: /sql-reference/aggregate-functions/reference/any
title: 'any'
---


# any

Выбирает первое встретившееся значение столбца.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции является недетерминированным.
Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, т.е. игнорирует NULL значения в входном столбце.
Однако, если функция используется с модификатором `RESPECT NULLS`, она возвращает первое значение, прочитанное независимо от того, является ли оно NULL или нет.

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
- `column`: Имя столбца.

**Возвращаемое значение**

Первое встретившееся значение.

:::note
Тип возвращаемого значения функции такой же, как и входное, за исключением LowCardinality, который игнорируется.
Это означает, что при отсутствии строк на входе будет возвращено значение по умолчанию этого типа (0 для целых чисел или Null для столбца Nullable()).
Вы можете использовать комбинирующий оператор `-OrNull` [combinator](../../../sql-reference/aggregate-functions/combinators.md) для изменения этого поведения.
:::

**Детали реализации**

В некоторых случаях вы можете полагаться на порядок выполнения.
Это относится к случаям, когда `SELECT` происходит из подзапроса, который использует `ORDER BY`.

Когда запрос `SELECT` имеет оператор `GROUP BY` или хотя бы одну агрегатную функцию, ClickHouse (в отличие от MySQL) требует, чтобы все выражения в операторах `SELECT`, `HAVING` и `ORDER BY` были вычислены из ключей или агрегатных функций.
Иными словами, каждый столбец, выбранный из таблицы, должен использоваться либо в ключах, либо внутри агрегатных функций.
Чтобы получить поведение, подобное MySQL, вы можете заключить другие столбцы в агрегатную функцию `any`.

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
