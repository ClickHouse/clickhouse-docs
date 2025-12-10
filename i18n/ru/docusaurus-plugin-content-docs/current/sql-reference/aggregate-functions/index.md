---
description: 'Справочник по агрегатным функциям'
sidebar_label: 'Агрегатные функции'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: 'Агрегатные функции'
doc_type: 'reference'
---

# Агрегатные функции {#aggregate-functions}

Агрегатные функции работают [стандартным](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) образом, привычным для специалистов по базам данных.

ClickHouse также поддерживает:

* [Параметрические агрегатные функции](/sql-reference/aggregate-functions/parametric-functions), которые, помимо столбцов, принимают дополнительные параметры.
* [Комбинаторы](/sql-reference/aggregate-functions/combinators), которые изменяют поведение агрегатных функций.

## Обработка NULL {#null-processing}

При агрегации все аргументы со значением `NULL` пропускаются. Если агрегатная функция имеет несколько аргументов, она игнорирует любую строку, в которой один или несколько из них равны NULL.

Из этого правила есть исключение — функции [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) и их псевдонимы (соответственно `any` и `anyLast`), когда используется модификатор `RESPECT NULLS`. Например, `FIRST_VALUE(b) RESPECT NULLS`.

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

Предположим, вам нужно просуммировать значения в столбце `y`:

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

Вы можете использовать [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce), чтобы заменить NULL значением, которое имеет смысл в вашем варианте использования. Например: `avg(COALESCE(column, 0))` будет использовать значение столбца при агрегации или ноль, если значение равно NULL:

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

Также вы можете использовать [Tuple](sql-reference/data-types/tuple.md), чтобы обойти поведение пропуска значений `NULL`. `Tuple`, который содержит только значение `NULL`, сам по себе не является `NULL`, поэтому агрегатные функции не будут пропускать эту строку из‑за этого значения `NULL`.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

Обратите внимание, что агрегации пропускаются, когда столбцы используются как аргументы агрегатной функции. Например, [`count`](../../sql-reference/aggregate-functions/reference/count.md) без параметров (`count()`) или с константными (`count(1)`) будет считать все строки в блоке (независимо от значения столбца в `GROUP BY`, так как он не является аргументом), тогда как `count(column)` вернет только количество строк, где `column` не равно `NULL`.

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

И вот пример функции first&#95;value с `RESPECT NULLS`, где мы видим, что входные значения NULL учитываются, и будет возвращено первое встретившееся значение, независимо от того, является оно NULL или нет:

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS диапазон,
    first_value(odd_or_null) AS первый,
    first_value(odd_or_null) IGNORE NULLS AS первый_игнорируя_NULL,
    first_value(odd_or_null) RESPECT NULLS AS первый_с_учётом_NULL
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─диапазон─┬─первый─┬─первый_игнорируя_NULL─┬─первый_с_учётом_NULL─┐
│ 0_4      │     1  │                     1  │                ᴺᵁᴸᴸ │
│ 1_9      │     5  │                     5  │                   5  │
│ 2_14     │    11  │                    11  │                ᴺᵁᴸᴸ │
└──────────┴────────┴────────────────────────┴──────────────────────┘
```
