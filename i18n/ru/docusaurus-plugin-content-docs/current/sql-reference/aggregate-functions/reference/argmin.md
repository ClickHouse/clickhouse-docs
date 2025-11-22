---
description: 'Вычисляет значение `arg` для минимального значения `val`. Если существует несколько строк с одинаковым значением `val`, являющимся минимальным, то то, какое из связанных значений `arg` будет возвращено, не детерминировано.'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
doc_type: 'reference'
---

# argMin

Вычисляет значение `arg` для минимального значения `val`. Если существует несколько строк с одинаковым минимальным значением `val`, выбор возвращаемого соответствующего значения `arg` является недетерминированным.
Обе части — и `arg`, и `min` — ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе они [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) при обработке и возвращают значения, отличные от `Null`, если такие значения доступны.

**Синтаксис**

```sql
argMin(arg, val)
```

**Аргументы**

* `arg` — аргумент.
* `val` — значение.

**Возвращаемое значение**

* Значение `arg`, которое соответствует минимальному значению `val`.

Тип: совпадает с типом `arg`.

**Пример**

Входная таблица:

```text
┌─user─────┬─salary─┐
│ директор │   5000 │
│ менеджер  │   3000 │
│ сотрудник   │   1000 │
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
│ a            │      0 │ -- argMin = a, так как это первое значение, отличное от `NULL`, min(b) взято из другой строки!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- `Tuple`, содержащий только значение `NULL`, сам не равен `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого значения `NULL`
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- можно использовать `Tuple` и получить оба столбца (все — tuple(*)) для соответствующего max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, и результат будет `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' является первым значением, отличным от `NULL`, для min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin возвращает (NULL,NULL), потому что `Tuple` позволяет не пропускать `NULL`, и min(tuple(b, a)) в данном случае является минимальным значением для этого набора данных
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` можно использовать в `min`, чтобы не пропускать строки со значениями `NULL` в столбце b.
└─────────────────────┘
```

**См. также**

* [Tuple](/sql-reference/data-types/tuple.md)
