---
description: 'Вычисляет значение `arg` для минимального значения `val`. Если есть несколько
  строк с равным максимальным значением `val`, какое из сопоставленных значений `arg` будет возвращено
  не является детерминистическим.'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
---


# argMin

Вычисляет значение `arg` для минимального значения `val`. Если есть несколько строк с равным максимальным значением `val`, какое из сопоставленных значений `arg` будет возвращено не является детерминистическим. Оба компонента `arg` и `min` ведут себя как [агрегатные функции](/sql-reference/aggregate-functions/index.md), обе [пропускают `NULL`](/sql-reference/aggregate-functions/index.md#null-processing) во время обработки и возвращают не `NULL` значения, если таковые доступны.

**Синтаксис**

```sql
argMin(arg, val)
```

**Аргументы**

- `arg` — Аргумент.
- `val` — Значение.

**Возвращаемое значение**

- Значение `arg`, которое соответствует минимальному значению `val`.

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
│ a            │      0 │ -- argMin = a потому что это первое не `NULL` значение, min(b) из другой строки!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- Кортеж `Tuple`, который содержит только одно значение `NULL`, не является `NULL`, поэтому агрегатные функции не пропустят эту строку из-за этого `NULL` значения
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- вы можете использовать `Tuple` и получить оба (все - tuple(*)) столбца для соответствующего max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- Все агрегированные строки содержат по крайней мере одно значение `NULL` из-за фильтра, поэтому все строки пропускаются, следовательно результат будет `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' является первым не `NULL` значением для min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin возвращает (NULL,NULL) здесь потому что `Tuple` позволяет не пропускать `NULL` и min(tuple(b, a)) в этом случае является минимальным значением для этого набора данных
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` может быть использован в `min`, чтобы не пропускать строки с `NULL` значениями как b.
└─────────────────────┘
```

**Смотрите также**

- [Tuple](/sql-reference/data-types/tuple.md)
