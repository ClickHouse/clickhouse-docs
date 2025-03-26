---
description: 'Документация для агрегатных функций'
sidebar_label: 'Агрегатные функции'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: 'Агрегатные функции'
---


# Агрегатные функции

Агрегатные функции работают в [обычном](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) режиме, как ожидают эксперты в области баз данных.

ClickHouse также поддерживает:

- [Параметрические агрегатные функции](/sql-reference/aggregate-functions/parametric-functions), которые принимают другие параметры в дополнение к столбцам.
- [Комбинаторы](/sql-reference/aggregate-functions/combinators), которые изменяют поведение агрегатных функций.

## Обработка NULL значений {#null-processing}

При агрегации все аргументы `NULL` пропускаются. Если агрегация имеет несколько аргументов, она будет игнорировать любую строку, в которой один или несколько из них являются NULL.

Существует исключение из этого правила — функции [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) и их псевдонимы (`any` и `anyLast` соответственно), когда они следуют за модификатором `RESPECT NULLS`. Например, `FIRST_VALUE(b) RESPECT NULLS`.

**Примеры:**

Рассмотрим следующую таблицу:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴺᴺ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴺᴺ │
└───┴──────┘
```

Предположим, вам нужно посчитать сумму значений в столбце `y`:

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

Теперь вы можете использовать функцию `groupArray`, чтобы создать массив из столбца `y`:

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` не включает `NULL` в результирующий массив.

Вы можете использовать [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce), чтобы преобразовать NULL в значение, которое имеет смысл в вашем случае. Например: `avg(COALESCE(column, 0))` использует значение столбца в агрегации или ноль, если это NULL:

```sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

Также вы можете использовать [Tuple](sql-reference/data-types/tuple.md), чтобы обойти поведение пропуска NULL. `Tuple`, содержащий только значение `NULL`, не является `NULL`, поэтому агрегатные функции не будут пропускать эту строку из-за этого значения `NULL`.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

Обратите внимание, что агрегации пропускаются, когда столбцы используются в качестве аргументов для агрегатной функции. Например, [`count`](../../sql-reference/aggregate-functions/reference/count.md) без параметров (`count()`) или с постоянными значениями (`count(1)`) будет считать все строки в блоке (независимо от значения столбца GROUP BY, так как это не аргумент), в то время как `count(column)` вернет только количество строк, где столбец не является NULL.

```sql
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴺᴺ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

И вот пример first_value с `RESPECT NULLS`, где мы видим, что NULL значения учитываются, и он вернет первое прочитанное значение, независимо от того, NULL оно или нет:

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) as range,
    first_value(odd_or_null) as first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) as odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴺᴺ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴺᴺ │
└───────┴───────┴───────────────────┴─────────────────────┘
```
