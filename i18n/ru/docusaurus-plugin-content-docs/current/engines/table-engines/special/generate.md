---
slug: '/engines/table-engines/special/generate'
sidebar_label: GenerateRandom
sidebar_position: 140
description: 'Движок таблицы GenerateRandom генерирует случайные данные для заданной'
title: 'Движок таблиц GenerateRandom'
doc_type: reference
---
Движок таблиц GenerateRandom производит случайные данные для заданной схемы таблицы.

Примеры использования:

- Использовать в тестах для заполнения воспроизводимой большой таблицы.
- Генерировать случайные входные данные для фуззинг-тестов.

## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

Параметры `max_array_length` и `max_string_length` задают максимальную длину всех 
колонок массива или карты и строк соответственно в сгенерированных данных.

Движок генерации таблиц поддерживает только запросы `SELECT`.

Он поддерживает все [DataTypes](../../../sql-reference/data-types/index.md), которые могут быть сохранены в таблице, кроме `AggregateFunction`.

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

- Не поддерживается:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - Индексы
  - Репликация