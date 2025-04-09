---
description: 'Документация для условных функций'
sidebar_label: 'Условные'
sidebar_position: 40
slug: /sql-reference/functions/conditional-functions
title: 'Условные функции'
---


# Условные функции

## if {#if}

Выполняет условную ветвление.

Если условие `cond` оценивается в ненулевое значение, функция возвращает результат выражения `then`. Если `cond` оценивается в ноль или `NULL`, то возвращается результат выражения `else`.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли краткая оценка. Если включена, выражение `then` оценивалось только для строк, где `cond` равно `true`, а выражение `else` - для строк, где `cond` равно `false`. Например, при краткой оценке исключение деления на ноль не выбрасывается при выполнении запроса `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)`.

`then` и `else` должны быть похожими по типу.

**Синтаксис**

```sql
if(cond, then, else)
```
Псевдоним: `cond ? then : else` (тернарный оператор)

**Аргументы**

- `cond` – Оцениваемое условие. UInt8, Nullable(UInt8) или NULL.
- `then` – Выражение, возвращаемое, если `condition` истинно.
- `else` – Выражение, возвращаемое, если `condition` ложно или NULL.

**Возвращаемые значения**

Результат любого из выражений `then` или `else`, в зависимости от условия `cond`.

**Пример**

```sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

Результат:

```text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

Позволяет записывать оператор [CASE](../../sql-reference/operators/index.md#conditional-expression) компактнее в запросе.

**Синтаксис**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли краткая оценка. Если включена, выражение `then_i` оценивается только для строк, где `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` равно `true`, `cond_i` будет оцениваться только для строк, где `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` равно `true`. Например, при краткой оценке исключение деления на ноль не выбрасывается при выполнении запроса `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)`.

**Аргументы**

Функция принимает `2N+1` параметров:
- `cond_N` — N-е оцениваемое условие, которое управляет тем, будет ли возвращено `then_N`.
- `then_N` — Результат функции, когда `cond_N` истинно.
- `else` — Результат функции, если ни одно из условий не истинно.

**Возвращаемые значения**

Результат любого из выражений `then_N` или `else`, в зависимости от условий `cond_N`.

**Пример**

Предположим, есть такая таблица:

```text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT

┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

## Использование условных результатов напрямую {#using-conditional-results-directly}

Условные функции всегда возвращают `0`, `1` или `NULL`. Поэтому вы можете использовать условные результаты напрямую вот так:

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```

## NULL-значения в условных функциях {#null-values-in-conditionals}

Когда в условных выражениях участвуют значения `NULL`, результат также будет `NULL`.

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

Поэтому вам следует осторожно составлять свои запросы, если типы являются `Nullable`.

Следующий пример демонстрирует это, не добавляя условие равенства в `multiIf`.

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

## greatest {#greatest}

Возвращает наибольшее значение из списка значений. Все члены списка должны быть сопоставимыми по типу.

Примеры:

```sql
SELECT greatest(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

:::note
Возвращаемый тип - Float64, так как UInt8 должен быть повышен до 64 бит для сравнения.
:::

```sql
SELECT greatest(['hello'], ['there'], ['world'])
```
```response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

```sql
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─greatest(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                       2023-05-12 01:16:59.000 │
└──―──────────────────────────────────────────────────────────────────────────┘
```

:::note
Возвращаемый тип - DateTime64, так как DateTime32 должен быть повышен до 64 бит для сравнения.
:::

## least {#least}

Возвращает наименьшее значение из списка значений. Все члены списка должны быть сопоставимыми по типу.

Примеры:

```sql
SELECT least(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

:::note
Возвращаемый тип - Float64, так как UInt8 должен быть повышен до 64 бит для сравнения.
:::

```sql
SELECT least(['hello'], ['there'], ['world'])
```
```response
┌─least(['hello'], ['there'], ['world'])─┐
│ ['hello']                              │
└────────────────────────────────────────┘
```

```sql
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─least(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                    2023-05-12 01:16:59.000 │
└────────────────────────────────────────────────────────────────────────────┘
```

:::note
Возвращаемый тип - DateTime64, так как DateTime32 должен быть повышен до 64 бит для сравнения.
:::

## clamp {#clamp}

Ограничивает возвращаемое значение между A и B.

**Синтаксис**

```sql
clamp(value, min, max)
```

**Аргументы**

- `value` – Входное значение.
- `min` – Ограничение нижней границы.
- `max` – Ограничение верхней границы.

**Возвращаемые значения**

Если значение меньше минимального, возвращается минимальное значение; если больше максимального, возвращается максимальное значение; в противном случае возвращается текущее значение.

Примеры:

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```

## Оператор CASE {#case-statement}

Выражение CASE в ClickHouse предоставляет условную логику, аналогичную оператору SQL CASE. Оно оценивает условия и возвращает значения на основе первого совпадающего условия.

ClickHouse поддерживает две формы CASE:

1. `CASE WHEN ... THEN ... ELSE ... END`
<br/>
Эта форма позволяет полную гибкость и реализуется внутри с помощью функции [multiIf](/sql-reference/functions/conditional-functions#multiif). Каждое условие оценивается независимо, и выражения могут включать не константные значения.

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- преобразуется в
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 строк в наборе. Время: 0.002 сек.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
<br/>
Эта более компактная форма оптимизирована для сопоставления значений констант и использует `caseWithExpression()` внутри.

Например, следующее является допустимым:

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- преобразуется в

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 строки в наборе. Время: 0.002 сек.
```

Эта форма также не требует, чтобы возвращаемые выражения были константами.

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- преобразуется в

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 строки в наборе. Время: 0.001 сек.
```

### Замечания  {#caveats}

ClickHouse определяет тип результата выражения CASE (или его внутреннего эквивалента, например `multiIf`) до оценки любых условий. Это важно, когда возвращаемые выражения отличаются по типу, например, разные временные зоны или числовые типы.

- Тип результата выбирается на основе наибольшего совместимого типа среди всех ветвей.
- После выбора этого типа все другие ветви неявно приводятся к нему - даже если их логика никогда не будет выполнена во время выполнения.
- Для типов, таких как DateTime64, где временная зона является частью сигнатуры типа, это может привести к неожиданному поведению: первая встреченная временная зона может быть использована для всех ветвей, даже если другие ветви указывают на разные временные зоны.

Например, ниже все строки возвращают временную метку в часовом поясе первой соответствующей ветви, т.е. `Asia/Kolkata`

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- преобразуется в

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 строки в наборе. Время: 0.011 сек.
```

Здесь ClickHouse видит несколько типов `DateTime64(3, <timezone>)`. Он выводит общий тип как `DateTime64(3, 'Asia/Kolkata'`, так как это первый, который он видит, неявно приводя другие ветви к этому типу.

Это можно решить, преобразовав в строку, чтобы сохранить предполагаемое форматирование временной зоны:

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- преобразуется в

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 строки в наборе. Время: 0.002 сек.
```
