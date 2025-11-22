---
description: 'Документация по агрегатным функциям'
sidebar_label: 'Агрегатные функции'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: 'Агрегатные функции'
doc_type: 'reference'
---



# Агрегатные функции

Агрегатные функции работают [обычным способом](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial), как этого ожидают специалисты по базам данных.

ClickHouse также поддерживает:

- [Параметрические агрегатные функции](/sql-reference/aggregate-functions/parametric-functions), которые принимают дополнительные параметры помимо столбцов.
- [Комбинаторы](/sql-reference/aggregate-functions/combinators), которые изменяют поведение агрегатных функций.



## Обработка NULL {#null-processing}

При агрегации все аргументы со значением `NULL` пропускаются. Если агрегатная функция принимает несколько аргументов, она игнорирует любую строку, в которой один или несколько из них имеют значение NULL.

Исключением из этого правила являются функции [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) и их псевдонимы (`any` и `anyLast` соответственно) при использовании с модификатором `RESPECT NULLS`. Например, `FIRST_VALUE(b) RESPECT NULLS`.

**Примеры:**

Рассмотрим следующую таблицу:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

Предположим, необходимо просуммировать значения в столбце `y`:

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

Теперь можно использовать функцию `groupArray` для создания массива из столбца `y`:

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

Функция `groupArray` не включает значения `NULL` в результирующий массив.

Можно использовать функцию [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) для преобразования NULL в значение, подходящее для конкретного случая использования. Например, `avg(COALESCE(column, 0))` будет использовать значение столбца в агрегации или ноль, если значение равно NULL:

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

Также можно использовать тип [Tuple](sql-reference/data-types/tuple.md) для обхода поведения пропуска NULL. Кортеж `Tuple`, содержащий только значение `NULL`, сам по себе не является `NULL`, поэтому агрегатные функции не пропустят такую строку из-за этого значения `NULL`.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

Обратите внимание, что агрегация пропускает значения NULL, когда столбцы используются в качестве аргументов агрегатной функции. Например, функция [`count`](../../sql-reference/aggregate-functions/reference/count.md) без параметров (`count()`) или с константными параметрами (`count(1)`) подсчитывает все строки в блоке (независимо от значения столбца GROUP BY, так как он не является аргументом), в то время как `count(column)` возвращает только количество строк, где значение столбца не равно NULL.

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

Ниже приведен пример использования функции first_value с модификатором `RESPECT NULLS`, где видно, что значения NULL учитываются и функция возвращает первое прочитанное значение, независимо от того, является ли оно NULL или нет:


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
