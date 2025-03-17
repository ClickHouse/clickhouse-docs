---
slug: /sql-reference/aggregate-functions/reference/argmin
sidebar_position: 110
title: 'argMin'
description: 'Calculates the `arg` value for a minimum `val` value. If there are multiple rows with equal `val` being the maximum, which of the associated `arg` is returned is not deterministic.'
---


# argMin

Вычисляет значение `arg` для минимального значения `val`. Если есть несколько строк с одинаковым значением `val`, которое является максимальным, какое из связанных значений `arg` будет возвращено, не детерминировано. Оба компонента `arg` и `min` ведут себя как [агрегирующие функции](/sql-reference/aggregate-functions/index.md), они оба [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают не `Null` значения, если такие доступны.

**Синтаксис**

``` sql
argMin(arg, val)
```

**Аргументы**

- `arg` — Аргумент.
- `val` — Значение.

**Возвращаемое значение**

- Значение `arg`, соответствующее минимальному значению `val`.

Тип: соответствует типу `arg`.

**Пример**

Входная таблица:

``` text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

Запрос:

``` sql
SELECT argMin(user, salary) FROM salary
```

Результат:

``` text
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

select * from test;
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
│ a            │      0 │ -- argMin = a, потому что это первое не `NULL` значение, min(b) из другой строки!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- Кортеж a, содержащий только значение `NULL`, не считается `NULL`, поэтому агрегирующие функции не пропускают эту строку из-за этого значения `NULL`
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- вы можете использовать `Tuple` и получить оба (все - tuple(*)) столбца для соответствующего max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, в результате чего результат будет `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' является первым не `NULL` значением для min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin возвращает (NULL,NULL) здесь, потому что `Tuple` позволяет не пропускать `NULL`, а min(tuple(b, a)) в этом случае является минимальным значением для данного набора данных
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` может быть использован в `min`, чтобы не пропускать строки со значениями `NULL` как b.
└─────────────────────┘
```

**Смотрите также**

- [Tuple](/sql-reference/data-types/tuple.md)
