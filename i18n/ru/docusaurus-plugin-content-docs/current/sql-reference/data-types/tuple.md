---
slug: '/sql-reference/data-types/tuple'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
description: 'Документация для типа данных Tuple в ClickHouse'
title: 'Tuple(T1, T2, ...)'
doc_type: reference
---
# Tuple(T1, T2, ...)

Кортеж элементов, каждый из которых имеет индивидуальный [тип](/sql-reference/data-types). Кортеж должен содержать хотя бы один элемент.

Кортежи используются для временной группировки колонок. Колонки могут быть объединены, когда в запросе используется выражение IN, и для указания определённых формальных параметров лямбда-функций. Для получения более подробной информации смотрите разделы [Операторы IN](../../sql-reference/operators/in.md) и [Функции высшего порядка](/sql-reference/functions/overview#higher-order-functions).

Кортежи могут быть результатом запроса. В этом случае, для текстовых форматов, отличных от JSON, значения разделяются запятыми в скобках. В форматах JSON кортежи выводятся как массивы (в квадратных скобках).

## Создание кортежей {#creating-tuples}

Вы можете использовать функцию для создания кортежа:

```sql
tuple(T1, T2, ...)
```

Пример создания кортежа:

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

Кортеж может содержать единственный элемент.

Пример:

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

Синтаксис `(tuple_element1, tuple_element2)` может быть использован для создания кортежа из нескольких элементов без вызова функции `tuple()`.

Пример:

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## Обнаружение типа данных {#data-type-detection}

При создании кортежей на лету ClickHouse интерпретирует тип аргументов кортежа как наименьшие типы, которые могут хранить предоставленное значение аргумента. Если значение равно [NULL](/operations/settings/formats#input_format_null_as_default), то интерпретируемый тип - это [Nullable](../../sql-reference/data-types/nullable.md).

Пример автоматического определения типа данных:

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## Обращение к элементам кортежа {#referring-to-tuple-elements}

Элементы кортежа могут быть указаны по имени или индексу:

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- by name
SELECT a.2 FROM named_tuples; -- by index
```

Результат:

```text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## Операции сравнения с кортежем {#comparison-operations-with-tuple}

Два кортежа сравниваются, последовательно сравнивая их элементы слева направо. Если элемент первого кортежа больше (меньше) соответствующего элемента второго кортежа, тогда первый кортеж больше (меньше) второго, в противном случае (если оба элемента равны) сравнивается следующий элемент.

Пример:

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

Примеры из реальной жизни:

```sql
CREATE TABLE test
(
    `year` Int16,
    `month` Int8,
    `day` Int8
)
ENGINE = Memory AS
SELECT *
FROM values((2022, 12, 31), (2000, 1, 1));

SELECT * FROM test;

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
│ 2000 │     1 │   1 │
└──────┴───────┴─────┘

SELECT *
FROM test
WHERE (year, month, day) > (2010, 1, 1);

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
└──────┴───────┴─────┘
CREATE TABLE test
(
    `key` Int64,
    `duration` UInt32,
    `value` Float64
)
ENGINE = Memory AS
SELECT *
FROM values((1, 42, 66.5), (1, 42, 70), (2, 1, 10), (2, 2, 0));

SELECT * FROM test;

┌─key─┬─duration─┬─value─┐
│   1 │       42 │  66.5 │
│   1 │       42 │    70 │
│   2 │        1 │    10 │
│   2 │        2 │     0 │
└─────┴──────────┴───────┘

-- Let's find a value for each key with the biggest duration, if durations are equal, select the biggest value

SELECT
    key,
    max(duration),
    argMax(value, (duration, value))
FROM test
GROUP BY key
ORDER BY key ASC;

┌─key─┬─max(duration)─┬─argMax(value, tuple(duration, value))─┐
│   1 │            42 │                                    70 │
│   2 │             2 │                                     0 │
└─────┴───────────────┴───────────────────────────────────────┘
```