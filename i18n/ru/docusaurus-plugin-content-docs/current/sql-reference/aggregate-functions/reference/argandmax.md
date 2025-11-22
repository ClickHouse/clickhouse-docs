---
description: 'Вычисляет значения `arg` и `val` для максимального значения `val`. Если существует несколько строк с одинаковым максимальным значением `val`, то то, какие связанные значения `arg` и `val` будут возвращены, является недетерминированным.'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmax
title: 'argAndMax'
doc_type: 'reference'
---

# argAndMax

Вычисляет значения `arg` и `val` для максимального значения `val`. Если существует несколько строк с одинаковым максимальным значением `val`, то какая из соответствующих пар `arg` и `val` будет возвращена — недетерминировано.
Обе части — `arg` и `max` — ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают не-`Null` значения, если доступны не-`Null` значения.

:::note
Единственное отличие от `argMax` состоит в том, что `argAndMax` возвращает как аргумент, так и значение.
:::

**Синтаксис**

```sql
argAndMax(arg, val)
```

**Аргументы**

* `arg` — аргумент.
* `val` — значение.

**Возвращаемое значение**

* Значение `arg`, соответствующее максимальному значению `val`.
* `val` — максимальное значение `val`

Тип: кортеж, соответствующий типам `arg` и `val`.

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
SELECT argAndMax(user, salary) FROM salary;
```

Результат:

```text
┌─argAndMax(user, salary)─┐
│ ('director',5000)       │
└─────────────────────────┘
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

SELECT argMax(a, b), argAndMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─argAndMax(a, b)─┬─max(b)─┐
│ b            │ ('b',2)         │      3 │ -- argMax = b, потому что это первое значение, отличное от NULL, max(b) взято из другой строки!
└──────────────┴─────────────────┴────────┘

SELECT argAndMax(tuple(a), b) FROM test;
┌─argAndMax((a), b)─┐
│ ((NULL),3)        │-- `Tuple`, содержащий только значение `NULL`, сам не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого значения `NULL`
└───────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA──┬─argMaxB─┐
│ (NULL,3) │       3 │ -- можно использовать Tuple и получить оба (все - tuple(*)) столбца для соответствующего max(b)
└──────────┴─────────┘

SELECT argAndMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argAndMax(a, b)─┬─max(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │-- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, следовательно, результат будет `NULL`
└─────────────────┴────────┘

SELECT argAndMax(a, (b,a)) FROM test;
┌─argAndMax(a, (b, a))─┐
│ ('c',(2,'c'))        │ -- Есть две строки с b=2, использование `Tuple` в `Max` позволяет получить не первый `arg`
└──────────────────────┘

SELECT argAndMax(a, tuple(b)) FROM test;
┌─argAndMax(a, (b))─┐
│ ('b',(2))         │ -- `Tuple` можно использовать в `Max`, чтобы не пропускать значения NULL в `Max`
└───────────────────┘
```

**См. также**

- [argMax](/sql-reference/aggregate-functions/reference/argmax.md)
- [Tuple](/sql-reference/data-types/tuple.md)