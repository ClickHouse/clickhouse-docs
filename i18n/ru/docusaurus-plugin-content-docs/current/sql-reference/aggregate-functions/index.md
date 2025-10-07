---
slug: '/sql-reference/aggregate-functions/'
sidebar_label: 'Агрегатные функции'
sidebar_position: 33
description: 'Документация для Агрегатные функции'
title: 'Агрегатные функции'
doc_type: reference
---
# Агрегатные функции

Агрегатные функции работают в [обычном](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) режиме, как ожидает от них сообщество экспертов по базам данных.

ClickHouse также поддерживает:

- [Параметрические агрегатные функции](/sql-reference/aggregate-functions/parametric-functions), которые принимают другие параметры в дополнение к колонкам.
- [Комбинаторы](/sql-reference/aggregate-functions/combinators), которые изменяют поведение агрегатных функций.

## Обработка NULL {#null-processing}

Во время агрегации все `NULL` аргументы пропускаются. Если агрегация имеет несколько аргументов, она будет игнорировать любую строку, в которой один или более из них равны NULL.

Существует исключение из этого правила, которым являются функции [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) и их синонимы (`any` и `anyLast` соответственно), когда за ними следует модификатор `RESPECT NULLS`. Например, `FIRST_VALUE(b) RESPECT NULLS`.

**Примеры:**

Рассмотрим эту таблицу:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

Допустим, вам нужно подсчитать значения в колонке `y`:

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

Теперь вы можете использовать функцию `groupArray`, чтобы создать массив из колонки `y`:

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` не включает `NULL` в результирующий массив.

Вы можете использовать [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce), чтобы преобразовать NULL в значение, которое имеет смысл в вашем случае. Например: `avg(COALESCE(column, 0))` будет использовать значение колонки в агрегации или ноль, если NULL:

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

Также вы можете использовать [Tuple](sql-reference/data-types/tuple.md), чтобы обойти поведение пропуска NULL. `Tuple`, который содержит только значение `NULL`, не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого `NULL` значения.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

Обратите внимание, что агрегации пропускаются, когда колонки используются в качестве аргументов для агрегатной функции. Например, [`count`](../../sql-reference/aggregate-functions/reference/count.md) без параметров (`count()`) или с постоянными значениями (`count(1)`) будет считать все строки в блоке (независимо от значения колонки GROUP BY, так как она не является аргументом), в то время как `count(column)` вернет только количество строк, где колонка не равна NULL.

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
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

И вот пример функции first_value с `RESPECT NULLS`, где мы можем увидеть, что входные значения NULL обрабатываются, и будет возвращено первое считанное значение, независимо от того, является ли оно NULL или нет:

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```