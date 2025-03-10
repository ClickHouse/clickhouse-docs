---
slug: /engines/table-engines/special/generate
sidebar_position: 140
sidebar_label:  Генерация случайных данных
title: "Генерация случайных данных с помощью таблицы"
description: "Движок таблицы GenerateRandom создает случайные данные для заданной схемы таблицы."
---

Движок таблицы GenerateRandom создает случайные данные для заданной схемы таблицы.

Примеры использования:

- Используйте в тестах для заполнения воспроизводимой крупной таблицы.
- Генерируйте случайное входное значение для тестов на fuzzing.

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

``` sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

Параметры `max_array_length` и `max_string_length` задают максимальную длину всех
колонок массивов или отображений и строк соответственно в сгенерированных данных.

Движок генерации таблицы поддерживает только запросы `SELECT`.

Он поддерживает все [DataTypes](../../../sql-reference/data-types/index.md), которые могут храниться в таблице, кроме `AggregateFunction`.

## Пример {#example}

**1.** Настройте таблицу `generate_engine_table`:

``` sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** Запросите данные:

``` sql
SELECT * FROM generate_engine_table LIMIT 3
```

``` text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```

## Детали реализации {#details-of-implementation}

- Не поддерживается:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - `INSERT`
    - Индексы
    - Репликация
