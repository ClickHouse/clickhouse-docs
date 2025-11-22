---
description: 'Выбирает первое встреченное значение столбца.'
sidebar_position: 102
slug: /sql-reference/aggregate-functions/reference/any
title: 'any'
doc_type: 'reference'
---

# any

Выбирает первое встретившееся значение столбца.

:::warning
Поскольку запрос может выполняться в произвольном порядке, результат этой функции недетерминирован.
Если вам нужен произвольный, но детерминированный результат, используйте функции [`min`](../reference/min.md) или [`max`](../reference/max.md).
:::

По умолчанию функция никогда не возвращает NULL, то есть игнорирует значения NULL во входном столбце.
Однако, если функция используется с модификатором `RESPECT NULLS`, она возвращает первое прочитанное значение, независимо от того, является оно NULL или нет.

**Синтаксис**

```sql
any(column) [RESPECT NULLS]
```

Псевдонимы `any(column)` (без `RESPECT NULLS`)

* `any_value`
* [`first_value`](../reference/first_value.md).

Псевдонимы для `any(column) RESPECT NULLS`

* `anyRespectNulls`, `any_respect_nulls`
* `firstValueRespectNulls`, `first_value_respect_nulls`
* `anyValueRespectNulls`, `any_value_respect_nulls`

**Параметры**

* `column`: имя столбца.

**Возвращаемое значение**

Первое встретившееся значение.

:::note
Тип возвращаемого функцией значения совпадает с типом входного аргумента, за исключением LowCardinality, который игнорируется.
Это означает, что при отсутствии входных строк функция вернёт значение по умолчанию для этого типа (0 для целых чисел или Null для столбца Nullable()).
Вы можете использовать комбинатор `-OrNull` ([combinator](../../../sql-reference/aggregate-functions/combinators.md)), чтобы изменить это поведение.
:::

**Особенности реализации**

В некоторых случаях можно полагаться на порядок выполнения.
Это относится к случаям, когда `SELECT` берёт данные из подзапроса, использующего `ORDER BY`.

Когда запрос `SELECT` содержит предложение `GROUP BY` или хотя бы одну агрегатную функцию, ClickHouse (в отличие от MySQL) требует, чтобы все выражения в предложениях `SELECT`, `HAVING` и `ORDER BY` вычислялись из ключей или из агрегатных функций.
Другими словами, каждый столбец, выбираемый из таблицы, должен использоваться либо в ключах, либо внутри агрегатных функций.
Чтобы получить поведение, аналогичное MySQL, вы можете поместить остальные столбцы в агрегатную функцию `any`.

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
