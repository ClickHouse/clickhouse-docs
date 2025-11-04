---
slug: '/sql-reference/aggregate-functions/reference/argmax'
sidebar_position: 109
description: 'Выдает значение `arg` для максимального `val` значения.'
title: argMax
doc_type: reference
---
# argMax

Вычисляет значение `arg` для максимального значения `val`. Если существует несколько строк с одинаковым значением `val`, которое является максимальным, какое из связанных `arg` будет возвращено, не является детерминированным. Обе части `arg` и `max` ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают значения, отличные от `Null`, если таковые доступны.

**Синтаксис**

```sql
argMax(arg, val)
```

**Аргументы**

- `arg` — Аргумент.
- `val` — Значение.

**Возвращаемое значение**

- Значение `arg`, соответствующее максимальному значению `val`.

Тип: соответствует типу `arg`.

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
SELECT argMax(user, salary) FROM salary;
```

Результат:

```text
┌─argMax(user, salary)─┐
│ director             │
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
FROM VALUES(('a', 1), ('b', 2), ('c', 2), (NULL, 3), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │    3 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─max(b)─┐
│ b            │      3 │ -- argMax = 'b' because it the first not Null value, max(b) is from another row!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- you can use Tuple and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- There are two rows with b=2, `Tuple` in the `Max` allows to get not the first `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` can be used in `Max` to not skip Nulls in `Max`
└─────────────────────┘
```

**Смотрите также**

- [Tuple](/sql-reference/data-types/tuple.md)