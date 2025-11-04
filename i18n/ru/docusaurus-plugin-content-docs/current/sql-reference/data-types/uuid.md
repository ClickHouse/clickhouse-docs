---
slug: '/sql-reference/data-types/uuid'
sidebar_label: UUID
sidebar_position: 24
description: 'Документация для типа данных UUID в ClickHouse'
title: UUID
doc_type: reference
---
# UUID

Универсальный уникальный идентификатор (UUID) — это значение размером 16 байт, используемое для идентификации записей. Для подробной информации о UUID см. [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier).

Существуют различные варианты UUID (см. [здесь](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)), но ClickHouse не проверяет, чтобы вставляемые UUID соответствовали какому-либо конкретному варианту. UUID внутренне воспринимаются как последовательность из 16 случайных байтов с представлением [8-4-4-4-12](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation) на уровне SQL.

Пример значения UUID:

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

По умолчанию UUID равен всем нулевым значениям. Он используется, например, когда новая запись вставляется, но значение для колонки UUID не указано:

```text
00000000-0000-0000-0000-000000000000
```

По историческим причинам UUID сортируются по их второй половине. Поэтому UUID не следует использовать напрямую в первичном ключе, ключе сортировки или ключе партиции таблицы.

Пример:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY uuid;
```

Результат:

```text
┌─uuid─────────────────────────────────┐
│ 36a0b67c-b74a-4640-803b-e44bb4547e3c │
│ 3a00aeb8-2605-4eec-8215-08c0ecb51112 │
│ 3fda7c49-282e-421a-85ab-c5684ef1d350 │
│ 16ab55a7-45f6-44a8-873c-7a0b44346b3e │
│ e3776711-6359-4f22-878d-bf290d052c85 │
│                [...]                 │
│ 9eceda2f-6946-40e3-b725-16f2709ca41a │
│ 03644f74-47ba-4020-b865-be5fd4c8c7ff │
│ ce3bc93d-ab19-4c74-b8cc-737cb9212099 │
│ b7ad6c91-23d6-4b5e-b8e4-a52297490b56 │
│ 06892f64-cc2d-45f3-bf86-f5c5af5768a9 │
└──────────────────────────────────────┘
```

В качестве обходного пути UUID можно преобразовать в тип с интуитивно понятным порядком сортировки.

Пример с преобразованием в UInt128:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY toUInt128(uuid);
```

Результат:

```sql
┌─uuid─────────────────────────────────┐
│ 018b81cd-aca1-4e9c-9e56-a84a074dc1a8 │
│ 02380033-c96a-438e-913f-a2c67e341def │
│ 057cf435-7044-456a-893b-9183a4475cea │
│ 0a3c1d4c-f57d-44cc-8567-60cb0c46f76e │
│ 0c15bf1c-8633-4414-a084-7017eead9e41 │
│                [...]                 │
│ f808cf05-ea57-4e81-8add-29a195bde63d │
│ f859fb5d-764b-4a33-81e6-9e4239dae083 │
│ fb1b7e37-ab7b-421a-910b-80e60e2bf9eb │
│ fc3174ff-517b-49b5-bfe2-9b369a5c506d │
│ fece9bf6-3832-449a-b058-cd1d70a02c8b │
└──────────────────────────────────────┘
```

## Генерация UUID {#generating-uuids}

ClickHouse предоставляет функцию [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) для генерации случайных значений UUID версии 4.

## Пример использования {#usage-example}

**Пример 1**

В этом примере демонстрируется создание таблицы с колонкой UUID и вставка значения в таблицу.

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

В этом примере значение колонки UUID не указывается при вставке записи, т.е. вставляется значение UUID по умолчанию:

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

## Ограничения {#restrictions}

Тип данных UUID поддерживает только функции, которые также поддерживаются для типа данных [String](../../sql-reference/data-types/string.md) (например, [min](/sql-reference/aggregate-functions/reference/min), [max](/sql-reference/aggregate-functions/reference/max) и [count](/sql-reference/aggregate-functions/reference/count)).

Тип данных UUID не поддерживается арифметическими операциями (например, [abs](/sql-reference/functions/arithmetic-functions#abs)) или агрегатными функциями, такими как [sum](/sql-reference/aggregate-functions/reference/sum) и [avg](/sql-reference/aggregate-functions/reference/avg).