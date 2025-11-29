---
description: 'Вычисляет значения `arg` и `val` для минимального значения `val`. Если существует несколько строк с одинаковым минимальным значением `val`, то то, какие связанные значения `arg` и `val` будут возвращены, не определено.'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmin
title: 'argAndMin'
doc_type: 'reference'
---

# argAndMin {#argandmin}

Вычисляет значения `arg` и `val` для минимального значения `val`. Если существует несколько строк с одинаковым минимальным значением `val`, то выбор того, какие связанные `arg` и `val` будут возвращены, недетерминирован.
Обе части — `arg` и `val` — ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе при обработке [пропускают значения `Null`](/sql-reference/aggregate-functions/index.md#null-processing) и возвращают значения, отличные от `Null`, если такие значения доступны.

:::note
Единственное отличие от `argMin` заключается в том, что `argAndMin` возвращает и аргумент, и значение.
:::

**Синтаксис**

```sql
argAndMin(arg, val)
```

**Аргументы**

* `arg` — аргумент.
* `val` — значение.

**Возвращаемое значение**

* Значение `arg`, которое соответствует минимальному значению `val`.
* `val` — минимальное значение `val`.

Тип: кортеж, в котором типы элементов соответствуют типам `arg` и `val` соответственно.

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
SELECT argAndMin(user, salary) FROM salary
```

Результат:

```text
┌─argAndMin(user, salary)─┐
│ ('worker',1000)         │
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

SELECT argMin(a,b), argAndMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─argAndMin(a, b)─┬─min(b)─┐
│ a            │ ('a',1)         │      0 │ -- argMin = a, так как это первое значение, отличное от `NULL`; min(b) взято из другой строки!
└──────────────┴─────────────────┴────────┘

SELECT argAndMin(tuple(a), b) FROM test;
┌─argAndMin((a), b)─┐
│ ((NULL),0)        │ -- `Tuple` 'a', содержащий только значение `NULL`, сам не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за данного значения `NULL`
└───────────────────┘

SELECT (argAndMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA──┬─argMinB─┐
│ (NULL,0) │       0 │ -- можно использовать `Tuple` и получить оба столбца (все столбцы — tuple(*)) для соответствующего min(b)
└──────────┴─────────┘

SELECT argAndMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argAndMin(a, b)─┬─min(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, следовательно, результат будет `NULL`
└─────────────────┴────────┘

SELECT argAndMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin(a, (b, a))─┬─min((b, a))─┐
│ ('a',(1,'a'))        │ (0,NULL)    │ -- 'a' — это первое значение, отличное от `NULL`, для min
└──────────────────────┴─────────────┘

SELECT argAndMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin((a, b), (b, a))─┬─min((b, a))─┐
│ ((NULL,0),(0,NULL))       │ (0,NULL)    │ -- argAndMin возвращает ((NULL,0),(0,NULL)), так как `Tuple` позволяет не пропускать `NULL`, и min(tuple(b, a)) в данном случае является минимальным значением для этого набора данных
└───────────────────────────┴─────────────┘

SELECT argAndMin(a, tuple(b)) FROM test;
┌─argAndMin(a, (b))─┐
│ ('a',(1))         │ -- `Tuple` можно использовать в `min`, чтобы не пропускать строки со значениями `NULL` в b.
└───────────────────┘
```

**См. также**

* [argMin](/sql-reference/aggregate-functions/reference/argmin.md)
* [Tuple](/sql-reference/data-types/tuple.md)
