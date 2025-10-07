---
slug: '/sql-reference/aggregate-functions/reference/argmin'
sidebar_position: 110
description: 'Вычисляет значение `arg` для минимального значения `val`. Если есть'
title: argMin
doc_type: reference
---
# argMin

Вычисляет значение `arg` для минимального значения `val`. Если существует несколько строк с одинаковым максимальным значением `val`, то какое из связанных `arg` будет возвращено, не является детерминированным. Обе части `arg` и `min` ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), они обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают не `Null` значения, если такие доступны.

**Синтаксис**

```sql
argMin(arg, val)
```

**Аргументы**

- `arg` — Аргумент.
- `val` — Значение.

**Возвращаемое значение**

- Значение `arg`, которое соответствует минимальному значению `val`.

Тип: совпадает с типом `arg`.

**Пример**

Входная таблица:

```text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

Запрос:

```sql
SELECT argMin(user, salary) FROM salary
```

Результат:

```text
┌─argMin(user, salary)─┐
│ worker               │
└──────────────────────┘
```

**Расширенный пример**

```sql
CREATE TABLE test
(
    a Nullable(String),
    b Nullable(Int64)
)
ENGINE = Memory AS
SELECT *
FROM VALUES((NULL, 0), ('a', 1), ('b', 2), ('c', 2), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ ᴺᵁᴸᴸ │    0 │
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─min(b)─┐
│ a            │      0 │ -- argMin = a because it the first not `NULL` value, min(b) is from another row!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- you can use `Tuple` and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' is the first not `NULL` value for the min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin returns (NULL,NULL) here because `Tuple` allows to don't skip `NULL` and min(tuple(b, a)) in this case is minimal value for this dataset
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` can be used in `min` to not skip rows with `NULL` values as b.
└─────────────────────┘
```

**См. также**

- [Tuple](/sql-reference/data-types/tuple.md)