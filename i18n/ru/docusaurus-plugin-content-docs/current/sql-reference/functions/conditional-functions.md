---
slug: /sql-reference/functions/conditional-functions
sidebar_position: 40
sidebar_label: Условные
---


# Условные функции

## if {#if}

Выполняет условную ветвление.

Если условие `cond` оценивается как ненулевое значение, функция возвращает результат выражения `then`. Если `cond` оценивается как ноль или `NULL`, возвращается результат выражения `else`.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет использованием короткой оценки (short-circuit evaluation). Если включено, выражение `then` оценивается только для строк, где `cond` истинно, а выражение `else` - где `cond` ложно. Например, при использовании короткой оценки не возникает исключение деления на ноль при выполнении запроса `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)`.

`then` и `else` должны быть одного типа.

**Синтаксис**

``` sql
if(cond, then, else)
```
Псевдоним: `cond ? then : else` (тернарный оператор)

**Аргументы**

- `cond` – Оцениваемое условие. UInt8, Nullable(UInt8) или NULL.
- `then` – Выражение, возвращаемое, если `condition` истинно.
- `else` – Выражение, возвращаемое, если `condition` ложно или NULL.

**Возвращаемые значения**

Результат либо выражения `then`, либо `else`, в зависимости от условия `cond`.

**Пример**

``` sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

Результат:

``` text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

Позволяет написать оператор [CASE](../../sql-reference/operators/index.md#conditional-expression) более компактно в запросе.

**Синтаксис**

``` sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет использованием короткой оценки. Если включено, выражение `then_i` оценивается только для строк, где `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` истинно, `cond_i` будет оцениваться только для строк, где `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` истинно. Например, при использовании короткой оценки не возникает исключение деления на ноль при выполнении запроса `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)`.

**Аргументы**

Функция принимает `2N+1` параметров:
- `cond_N` — N-е оцениваемое условие, которое определяет, вернется ли `then_N`.
- `then_N` — Результат функции, когда `cond_N` истинно.
- `else` — Результат функции, если ни одно из условий не истинно.

**Возвращаемые значения**

Результат либо любого из выражений `then_N`, либо `else`, в зависимости от условий `cond_N`.

**Пример**

Предположим, эта таблица:

``` text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

``` sql
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

## Прямое использование условий {#using-conditional-results-directly}

Условия всегда возвращают `0`, `1` или `NULL`. Поэтому вы можете использовать результаты условий напрямую, как это:

``` sql
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

## NULL значения в условиях {#null-values-in-conditionals}

Когда в условиях участвуют `NULL` значения, результат также будет `NULL`.

``` sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

Поэтому вы должны аккуратно строить свои запросы, если типы `Nullable`.

Следующий пример демонстрирует это, не добавляя условие равенства в `multiIf`.

``` sql
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
└───────────────┴───────────────────────────────────────────────────────────────┘
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

``` sql
clamp(value, min, max)
```

**Аргументы**

- `value` – Входное значение.
- `min` – Ограничивает нижнюю границу.
- `max` – Ограничивает верхнюю границу.

**Возвращаемые значения**

Если значение меньше минимально допустимого, возвращается минимальное значение; если оно больше максимального, возвращается максимальное значение; в противном случае возвращается текущее значение.

Примеры:

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```
