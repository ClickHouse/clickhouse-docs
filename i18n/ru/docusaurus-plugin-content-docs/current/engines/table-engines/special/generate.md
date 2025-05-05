---
description: 'Движок таблиц GenerateRandom генерирует случайные данные для заданной схемы таблицы.'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'Движок таблиц GenerateRandom'
---

Движок таблиц GenerateRandom генерирует случайные данные для заданной схемы таблицы.

Примеры использования:

- Используйте в тестах для заполнения воспроизводимой большой таблицы.
- Генерируйте случайный ввод для тестов на устойчивость.

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

Параметры `max_array_length` и `max_string_length` задают максимальную длину всех массивов или колонок типа map и строк соответственно в сгенерированных данных.

Движок генерации таблиц поддерживает только запросы `SELECT`.

Он поддерживает все [DataTypes](../../../sql-reference/data-types/index.md), которые могут храниться в таблице, кроме `AggregateFunction`.

## Пример {#example}

**1.** Настройте таблицу `generate_engine_table`:

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** Запросите данные:

```sql
SELECT * FROM generate_engine_table LIMIT 3
```

```text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```

## Подробности реализации {#details-of-implementation}

- Не поддерживаются:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - `INSERT`
    - Индексы
    - Репликация
