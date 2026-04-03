---
description: 'Документация о типе данных UUID в ClickHouse'
sidebar_label: 'UUID'
sidebar_position: 24
slug: /sql-reference/data-types/uuid
title: 'UUID'
doc_type: 'reference'
---

# UUID \{#uuid\}

Универсальный уникальный идентификатор (UUID) — это 16-байтовое значение, используемое для идентификации записей. Подробную информацию о UUID см. в статье на [Википедии](https://en.wikipedia.org/wiki/Universally_unique_identifier).

Хотя существуют разные варианты UUID, например UUIDv4 и UUIDv7 (см. [здесь](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)), ClickHouse не проверяет, соответствуют ли вставленные значения UUID какому-либо конкретному варианту.
Внутри ClickHouse UUID рассматриваются как последовательность из 16 случайных байт с [представлением 8-4-4-4-12](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation) на уровне SQL.

Пример значения UUID:

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

UUID по умолчанию состоит из одних нулей. Он используется, например, когда вставляется новая запись, но для столбца с типом UUID не задано значение:

```text
00000000-0000-0000-0000-000000000000
```

:::warning
По историческим причинам UUID сортируются по своей второй половине.

Хотя для значений UUIDv4 это приемлемо, это может ухудшать производительность при использовании столбцов UUIDv7 в определениях первичного индекса (их использование в сортировочных ключах или ключах партиционирования допустимо).
Более конкретно, значения UUIDv7 состоят из временной метки в первой половине и счетчика во второй половине.
Сортировка UUIDv7 в разреженных индексах первичного ключа (то есть по первым значениям каждой гранулы индекса) будет, таким образом, выполняться по полю счетчика.
Если предположить, что UUID сортировались бы по первой половине (временной метке), то на этапе анализа индекса по первичному ключу в начале выполнения запросов ожидается отсечение всех меток во всех, кроме одной, частях.
Однако при сортировке по второй половине (счетчику) ожидается, что как минимум одна метка будет возвращена для всех частей, что приводит к ненужным обращениям к диску.
:::

Пример:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (uuid);

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
SELECT * FROM tab;
```

Результат:

```text
┌─uuid─────────────────────────────────┐
│ 019d2555-7874-7e9d-a284-9b45a0b2f165 │
│ 019d2555-7874-7e9d-a284-9b46c3353be7 │
│ 019d2555-7878-77fc-a36f-4081aa58ec2b │
│ 019d2555-7878-77fc-a36f-40826555fb9b │
│ 019d2555-7870-7432-ba62-5250ac595328 │
│ 019d2555-7870-7432-ba62-5251da22bd19 │
│ 019d2555-786c-73e9-a031-4a7936df7d56 │
│ 019d2555-786c-73e9-a031-4a7a35a9544f │
│ 019d2555-7868-7333-89d1-2bd1639899c3 │
│ 019d2555-7868-7333-89d1-2bd297eb7d42 │
└──────────────────────────────────────┘

```

В качестве обходного решения UUID можно преобразовать в метку времени, извлечённую из второй половины:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (UUIDv7ToDateTime(uuid));
-- Or alternatively:                      [...] PRIMARY KEY (toStartOfHour(UUIDv7ToDateTime(uuid)));

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
INSERT INTO tab SELECT generateUUIDv7() FROM numbers(2);
SELECT * FROM tab;
```

Результат (если вставлены те же данные):


```text
┌─uuid─────────────────────────────────┐
│ 019d2555-7868-7333-89d1-2bd1639899c3 │
│ 019d2555-7868-7333-89d1-2bd297eb7d42 │
│ 019d2555-786c-73e9-a031-4a7936df7d56 │
│ 019d2555-786c-73e9-a031-4a7a35a9544f │
│ 019d2555-7870-7432-ba62-5250ac595328 │
│ 019d2555-7870-7432-ba62-5251da22bd19 │
│ 019d2555-7874-7e9d-a284-9b45a0b2f165 │
│ 019d2555-7874-7e9d-a284-9b46c3353be7 │
│ 019d2555-7878-77fc-a36f-4081aa58ec2b │
│ 019d2555-7878-77fc-a36f-40826555fb9b │
└──────────────────────────────────────┘

```

ORDER BY (UUIDv7ToDateTime(uuid), uuid)


## Генерация UUID \{#generating-uuids\}

ClickHouse предоставляет функцию [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) для генерации случайных UUID версии 4.

## Пример использования \{#usage-example\}

**Пример 1**

Этот пример демонстрирует создание таблицы со столбцом UUID и вставку значения в таблицу.

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1'

SELECT * FROM t_uuid
```

Результат:

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**Пример 2**

В этом примере при вставке записи значение для столбца UUID не указывается, то есть вставляется значение UUID по умолчанию:

```sql
INSERT INTO t_uuid (y) VALUES ('Example 2')

SELECT * FROM t_uuid
```

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
│ 00000000-0000-0000-0000-000000000000 │ Example 2 │
└──────────────────────────────────────┴───────────┘
```


## Ограничения \{#restrictions\}

Тип данных UUID поддерживает только те функции, которые также поддерживает тип данных [String](../../sql-reference/data-types/string.md) (например, [min](/sql-reference/aggregate-functions/reference/min), [max](/sql-reference/aggregate-functions/reference/max) и [count](/sql-reference/aggregate-functions/reference/count)).

Тип данных UUID не поддерживает арифметические операции (например, [abs](/sql-reference/functions/arithmetic-functions#abs)) и агрегатные функции, такие как [sum](/sql-reference/aggregate-functions/reference/sum) и [avg](/sql-reference/aggregate-functions/reference/avg).