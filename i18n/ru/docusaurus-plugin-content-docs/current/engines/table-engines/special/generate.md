---
description: 'Движок таблицы GenerateRandom генерирует случайные данные для заданной
  схемы таблицы.'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'Движок таблицы GenerateRandom'
doc_type: 'reference'
---



# Движок таблицы GenerateRandom

Движок таблицы GenerateRandom генерирует случайные данные в соответствии с заданной схемой таблицы.

Примеры использования:

- Используйте в тестах для заполнения больших таблиц воспроизводимыми данными.
- Генерируйте случайные входные данные для фаззинговых тестов.



## Использование в ClickHouse Server

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

Параметры `max_array_length` и `max_string_length` задают соответственно максимальную длину всех столбцов типов Array или Map и строк в генерируемых данных.

Движок таблицы `Generate` поддерживает только запросы `SELECT`.

Он поддерживает все [типы данных](../../../sql-reference/data-types/index.md), которые могут храниться в таблице, за исключением `AggregateFunction`.


## Пример

**1.** Создайте таблицу `generate_engine_table`:

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** Выполните запрос:

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
