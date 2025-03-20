---
slug: /sql-reference/functions/logical-functions
sidebar_position: 110
sidebar_label: Логические
---


# Логические функции

Ниже приведенные функции выполняют логические операции над аргументами произвольных числовых типов. Они возвращают либо 0, либо 1 как [UInt8](../data-types/int-uint.md) или, в некоторых случаях, `NULL`.

Ноль как аргумент считается `ложным`, ненулевые значения считаются `истинными`.

## and {#and}

Вычисляет логическое конъюнкцию двух или более значений.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли оценка с коротким замыканием. Если включено, `val_i` оценивается только если `(val_1 AND val_2 AND ... AND val_{i-1})` является `истинным`. Например, при оценке с коротким замыканием исключение деления на ноль не выбрасывается при выполнении запроса `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)`.

**Синтаксис**

``` sql
and(val1, val2...)
```

Псевдоним: [Оператор AND](../../sql-reference/operators/index.md#logical-and-operator).

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `0`, если хотя бы один аргумент оценивается как `ложный`,
- `NULL`, если ни один аргумент не оценивается как `ложный` и хотя бы один аргумент является `NULL`,
- `1`, в противном случае.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

``` sql
SELECT and(0, 1, -2);
```

Результат:

``` text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

С `NULL`:

``` sql
SELECT and(NULL, 1, 10, -2);
```

Результат:

``` text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

Вычисляет логическую дисъюнкцию двух или более значений.

Настройка [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) управляет тем, используется ли оценка с коротким замыканием. Если включено, `val_i` оценивается только если `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` является `истинным`. Например, при оценке с коротким замыканием исключение деления на ноль не выбрасывается при выполнении запроса `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)`.

**Синтаксис**

``` sql
or(val1, val2...)
```

Псевдоним: [Оператор OR](../../sql-reference/operators/index.md#logical-or-operator).

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, если хотя бы один аргумент оценивается как `истинный`,
- `0`, если все аргументы оцениваются как `ложные`,
- `NULL`, если все аргументы оцениваются как `ложные` и хотя бы один аргумент является `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

``` sql
SELECT or(1, 0, 0, 2, NULL);
```

Результат:

``` text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

С `NULL`:

``` sql
SELECT or(0, NULL);
```

Результат:

``` text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

Вычисляет логическую отрицание значения.

**Синтаксис**

``` sql
not(val);
```

Псевдоним: [Оператор отрицания](../../sql-reference/operators/index.md#logical-negation-operator).

**Аргументы**

- `val` — Значение. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, если `val` оценивается как `ложный`,
- `0`, если `val` оценивается как `истинный`,
- `NULL`, если `val` является `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

``` sql
SELECT NOT(1);
```

Результат:

``` test
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

Вычисляет логическую исключающую дисъюнкцию двух или более значений. Для более чем двух входных значений функция сначала вычисляет xor для первых двух значений, а затем вычисляет xor результата с третьим значением и т.д.

**Синтаксис**

``` sql
xor(val1, val2...)
```

**Аргументы**

- `val1, val2, ...` — Список из как минимум двух значений. [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Nullable](../data-types/nullable.md).

**Возвращаемое значение**

- `1`, для двух значений: если одно из значений оценивается как `ложное`, а другое — как `истинное`,
- `0`, для двух значений: если оба значения оцениваются как `ложные` или оба как `истинные`,
- `NULL`, если хотя бы одно из входных значений `NULL`.

Тип: [UInt8](../../sql-reference/data-types/int-uint.md) или [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md)).

**Пример**

``` sql
SELECT xor(0, 1, 1);
```

Результат:

``` text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
