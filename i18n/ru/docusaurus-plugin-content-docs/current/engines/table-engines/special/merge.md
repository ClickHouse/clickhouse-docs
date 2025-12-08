---
description: 'Табличный движок `Merge` (не путать с `MergeTree`) сам не хранит данные, а позволяет одновременно читать из любого количества других таблиц.'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Табличный движок Merge'
doc_type: 'reference'
---

# Движок таблицы Merge {#merge-table-engine}

Движок `Merge` (не путать с `MergeTree`) сам не хранит данные, но позволяет одновременно читать из любого количества других таблиц.

Чтение автоматически распараллеливается. Запись в таблицу не поддерживается. При чтении используются индексы таблиц, из которых фактически производится чтение, если они есть.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## Параметры движка {#engine-parameters}

### `db_name` {#db_name}

`db_name` — возможные значения:
    - имя базы данных,
    - константное выражение, которое возвращает строку с именем базы данных, например `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` — регулярное выражение для сопоставления имен баз данных.

### `tables_regexp` {#tables_regexp}

`tables_regexp` — регулярное выражение для сопоставления имен таблиц в указанной БД или нескольких БД.

Регулярные выражения обрабатываются библиотекой [re2](https://github.com/google/re2) (поддерживает подмножество PCRE) и чувствительны к регистру.
См. примечания об экранировании символов в регулярных выражениях в разделе «match».

## Использование {#usage}

При выборе таблиц для чтения сама таблица `Merge` не выбирается, даже если она подходит под регулярное выражение. Это сделано, чтобы избежать циклов.
Можно создать две таблицы `Merge`, которые будут бесконечно пытаться читать данные друг друга, но это не лучшая идея.

Типичный сценарий использования движка `Merge` — работа с большим количеством таблиц `TinyLog` так, как будто это одна таблица.

## Примеры {#examples}

**Пример 1**

Рассмотрим две базы данных `ABC_corporate_site` и `ABC_store`. Таблица `all_visitors` будет содержать идентификаторы из таблиц `visitors` обеих баз данных.

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Пример 2**

Предположим, у вас есть старая таблица `WatchLog_old`, вы решили изменить способ секционирования, при этом не перенося данные в новую таблицу `WatchLog_new`, и вам нужно просматривать данные из обеих таблиц.

```sql
CREATE TABLE WatchLog_old(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
ORDER BY (date, UserId, EventType);

INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
PARTITION BY date
ORDER BY (UserId, EventType)
SETTINGS index_granularity=8192;

INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog AS WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

SELECT * FROM WatchLog;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## Виртуальные столбцы {#virtual-columns}

- `_table` — имя таблицы, из которой были прочитаны данные. Тип: [String](../../../sql-reference/data-types/string.md).

    Если отфильтровать по `_table` (например, `WHERE _table='xyz'`), будут прочитаны только те таблицы, которые удовлетворяют условию фильтрации.

- `_database` — имя базы данных, из которой были прочитаны данные. Тип: [String](../../../sql-reference/data-types/string.md).

**См. также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- Табличная функция [merge](../../../sql-reference/table-functions/merge.md)
