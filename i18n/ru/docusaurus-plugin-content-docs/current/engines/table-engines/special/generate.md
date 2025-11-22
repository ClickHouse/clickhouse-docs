---
description: 'Движок таблицы GenerateRandom генерирует случайные данные в соответствии с заданной схемой таблицы.'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'Движок таблицы GenerateRandom'
doc_type: 'reference'
---



# Движок таблицы GenerateRandom

Движок таблицы GenerateRandom генерирует случайные данные для заданной схемы таблицы.

Примеры использования:

- Использование в тестах для заполнения больших таблиц воспроизводимыми данными.
- Генерация случайных входных данных для фаззинг‑тестов.



## Использование в ClickHouse Server {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

Параметры `max_array_length` и `max_string_length` задают максимальную длину всех
столбцов типа Array или Map и строк соответственно в генерируемых данных.

Движок таблиц GenerateRandom поддерживает только запросы `SELECT`.

Он поддерживает все [типы данных](../../../sql-reference/data-types/index.md), которые могут храниться в таблице, за исключением `AggregateFunction`.


## Пример {#example}

**1.** Создайте таблицу `generate_engine_table`:

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


## Детали реализации {#details-of-implementation}

- Не поддерживается:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - Индексы
  - Репликация
