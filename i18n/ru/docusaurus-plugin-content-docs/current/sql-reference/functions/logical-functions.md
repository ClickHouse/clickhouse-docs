---
description: 'Документация для Логических Функций'
sidebar_label: 'Логические'
sidebar_position: 110
slug: /sql-reference/functions/logical-functions
title: 'Логические Функции'
---


# Логические Функции

Ниже представленные функции выполняют логические операции над аргументами произвольных числовых типов. Они возвращают либо 0, либо 1 в виде [UInt8](../data-types/int-uint.md) или, в некоторых случаях, `NULL`.

Ноль как аргумент считается `false`, ненулевые значения считаются `true`.

## and {#and}

Вычисляет логическое сопряжение двух и более значений.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли оценка с коротким замыканием. Если включено, `val_i` вычисляется только если `(val_1 AND val_2 AND ... AND val_{i-1})` является `true`. Например, при использовании короткого замыкания исключение деления на ноль не выбрасывается при выполнении запроса `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)`.

**Синтаксис**

```sql
and(val1, val2...)
```

Псевдоним: [Оператор AND](../../sql-reference/operators/index.md#logical-and-operator).

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `0`, если хотя бы один аргумент оценивается как `false`,
- `NULL`, если ни один аргумент не оценивается как `false` и хотя бы один аргумент равен `NULL`,
- `1` в противном случае.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT and(0, 1, -2);
```

Результат:

```text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

С `NULL`:

```sql
SELECT and(NULL, 1, 10, -2);
```

Результат:

```text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

Вычисляет логическое дизъюнкцию двух и более значений.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли оценка с коротким замыканием. Если включено, `val_i` вычисляется только если `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` является `true`. Например, при использовании короткого замыкания исключение деления на ноль не выбрасывается при выполнении запроса `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)`.

**Синтаксис**

```sql
or(val1, val2...)
```

Псевдоним: [Оператор OR](../../sql-reference/operators/index.md#logical-or-operator).

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, если хотя бы один аргумент оценивается как `true`,
- `0`, если все аргументы оцениваются как `false`,
- `NULL`, если все аргументы оцениваются как `false` и хотя бы один аргумент равен `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT or(1, 0, 0, 2, NULL);
```

Результат:

```text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

С `NULL`:

```sql
SELECT or(0, NULL);
```

Результат:

```text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

Вычисляет логическую отрицательность значения.

**Синтаксис**

```sql
not(val);
```

Псевдоним: [Оператор Отрицания](../../sql-reference/operators/index.md#logical-negation-operator).

**Аргументы**

- `val` — Значение. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, если `val` оценивается как `false`,
- `0`, если `val` оценивается как `true`,
- `NULL`, если `val` равен `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT NOT(1);
```

Результат:

```text
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

Вычисляет логическую исключающую дизъюнкцию двух и более значений. Для более чем двух входных значений функция сначала вычисляет исключающую дизъюнкцию первых двух значений, затем результат XOR с третьим значением и так далее.

**Синтаксис**

```sql
xor(val1, val2...)
```

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, для двух значений: если одно из значений оценивается как `false`, а другое — нет,
- `0`, для двух значений: если оба значения оцениваются как `false` или оба как `true`,
- `NULL`, если хотя бы одно из входных значений равно `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT xor(0, 1, 1);
```

Результат:

```text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
