---
description: 'Вычисляет значение `arg` для максимального значения `val`.'
sidebar_position: 109
slug: /sql-reference/aggregate-functions/reference/argmax
title: 'argMax'
doc_type: 'reference'
---

# argMax

Вычисляет значение `arg` для максимального значения `val`. Если существует несколько строк с одинаковым максимальным `val`, то то, какое из соответствующих значений `arg` будет возвращено, не детерминировано.
Обе части — и `arg`, и `max` — ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) при обработке и возвращают значения, отличные от `Null`, если такие значения имеются.

**Синтаксис**

```sql
argMax(arg, val)
```

**Аргументы**

* `arg` — аргумент.
* `val` — значение.

**Возвращаемое значение**

* Значение `arg`, соответствующее максимальному значению `val`.

Тип: соответствует типу `arg`.

**Пример**

Входная таблица:

```text
┌─пользователь─┬─зарплата─┐
│ директор     │     5000 │
│ менеджер     │     3000 │
│ работник     │     1000 │
└──────────────┴──────────┘
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
│ b            │      3 │ -- argMax = 'b', так как это первое значение, отличное от Null; max(b) взято из другой строки!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- `Tuple`, содержащий только значение `NULL`, сам не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого значения `NULL`
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- можно использовать Tuple и получить оба столбца (все столбцы - tuple(*)) для соответствующего max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, и результат будет `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- Есть две строки с b=2; `Tuple` в `Max` позволяет получить не первый `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` можно использовать в `Max`, чтобы не пропускать значения Null в `Max`
└─────────────────────┘
```

**См. также**

* [Tuple](/sql-reference/data-types/tuple.md)
