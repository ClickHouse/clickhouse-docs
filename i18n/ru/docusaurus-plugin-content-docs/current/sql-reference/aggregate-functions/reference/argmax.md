---
description: 'Вычисляет значение `arg` для максимального значения `val`.'
sidebar_position: 109
slug: /sql-reference/aggregate-functions/reference/argmax
title: 'argMax'
---


# argMax

Вычисляет значение `arg` для максимального значения `val`. Если есть несколько строк с равным максимальным значением `val`, то какое из связанных значений `arg` будет возвращено — не детерминировано.
Обе части, `arg` и `max`, ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), они обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают не `Null` значения, если такие доступны.

**Синтаксис**

```sql
argMax(arg, val)
```

**Аргументы**

- `arg` — Аргумент.
- `val` — Значение.

**Возвращаемое значение**

- Значение `arg`, соответствующее максимальному значению `val`.

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

select * from test;
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
│ b            │      3 │ -- argMax = 'b' потому что это первое ненулиевое значение, max(b) взято из другой строки!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- Кортеж a, содержащий только значение `NULL`, не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого значения `NULL`
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- вы можете использовать кортеж и получить оба (все - tuple(*)) столбца для соответствующего max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегированные строки содержат по крайней мере одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, в результате чего получится `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- Есть две строки с b=2, `Tuple` в `Max` позволяет получить не первый `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` можно использовать в `Max`, чтобы не пропускать `NULL` в `Max`
└─────────────────────┘
```

**См. также**

- [Tuple](/sql-reference/data-types/tuple.md)
