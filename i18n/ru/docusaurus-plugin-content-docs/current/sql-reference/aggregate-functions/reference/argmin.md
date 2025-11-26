---
description: 'Вычисляет значение `arg` для минимального значения `val`. Если существует
  несколько строк с одинаковым минимальным значением `val`, то то, какое из соответствующих
  значений `arg` будет возвращено, не детерминировано.'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
doc_type: 'reference'
---

# argMin

Вычисляет значение `arg` для минимального значения `val`. Если имеется несколько строк с одинаковым значением `val`, являющимся минимальным, то выбор возвращаемого связанного значения `arg` не детерминирован.

Обе части — `arg` и `min` — ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) при обработке и возвращают значения, отличные от `Null`, если такие значения доступны.

**Синтаксис**

```sql
argMin(arg, val)
```

**Аргументы**

* `arg` — аргумент.
* `val` — значение.

**Возвращаемое значение**

* Значение `arg`, соответствующее минимальному значению `val`.

Тип: тот же, что и у `arg`.

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
│ a            │      0 │ -- argMin = a, так как это первое не-`NULL` значение; min(b) взято из другой строки!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- `Tuple`, содержащий только `NULL` значение, сам по себе не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за данного `NULL` значения
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- можно использовать `Tuple` и получить оба (все — tuple(*)) столбца для соответствующего max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно `NULL` значение из-за фильтра, поэтому все строки пропускаются, следовательно, результат будет `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' является первым не-`NULL` значением для min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin возвращает (NULL,NULL), так как `Tuple` позволяет не пропускать `NULL`, и min(tuple(b, a)) в данном случае является минимальным значением для этого набора данных
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` можно использовать в `min`, чтобы не пропускать строки с `NULL` значениями в b.
└─────────────────────┘
```

**См. также**

* [Tuple](/sql-reference/data-types/tuple.md)
