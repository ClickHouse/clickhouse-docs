---
slug: /sql-reference/aggregate-functions/reference/argmax
sidebar_position: 109
title: 'argMax'
description: 'Calculates the `arg` value for a maximum `val` value.'
---


# argMax

Вычисляет значение `arg` для максимального значения `val`. Если существует несколько строк с одинаковым максимумом `val`, то какое из связанных значений `arg` будет возвращено, не поддается детерминизму. Оба значения, `arg` и `max`, работают как [агрегирующие функции](/sql-reference/aggregate-functions/index.md), они оба [пропускают `Null`](/sql-reference/aggregate-functions/index.md#null-processing) при обработке и возвращают значения не равные `Null`, если такие доступны.

**Синтаксис**

``` sql
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

``` text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

Запрос:

``` sql
SELECT argMax(user, salary) FROM salary;
```

Результат:

``` text
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
│ ᴺᵁᴸᴸ │ ᴺᵈᴼᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─max(b)─┐
│ b            │      3 │ -- argMax = 'b', так как это первое ненулевое значение, max(b) из другой строки!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- Кортеж a, содержащий только значение `NULL`, не является `NULL`, поэтому агрегирующие функции не пропускают эту строку из-за этого значения `NULL`
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- вы можете использовать Кортеж и получить оба (все - кортеж(*)) столбца для соответствующего max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегируемые строки содержат хотя бы одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, следовательно, результат будет `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- Существует две строки с b=2, `Tuple` в `Max` позволяет получить не первое значение `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` может быть использован в `Max`, чтобы не пропускать Null в `Max`
└─────────────────────┘
```

**Смотрите также**

- [Tuple](/sql-reference/data-types/tuple.md)
