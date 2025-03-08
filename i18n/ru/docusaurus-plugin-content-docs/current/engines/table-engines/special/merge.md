---
slug: /engines/table-engines/special/merge
sidebar_position: 30
sidebar_label: Merge
title: 'Merge Table Engine'
description: 'The `Merge` engine (not to be confused with `MergeTree`) does not store data itself, but allows reading from any number of other tables simultaneously.'
---


# Merge Table Engine

Движок `Merge` (не путать с `MergeTree`) не хранит данные сам по себе, а позволяет одновременно читать из любого количества других таблиц.

Чтение автоматически параллелизовано. Запись в таблицу не поддерживается. При чтении используются индексы таблиц, которые фактически считываются, если они существуют.

## Creating a Table {#creating-a-table}

``` sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## Engine Parameters {#engine-parameters}

### db_name {#db_name}

`db_name` — Возможные значения:
    - имя базы данных,
    - константное выражение, возвращающее строку с именем базы данных, например, `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` — регулярное выражение для поиска имен БД.

### tables_regexp {#tables_regexp}

`tables_regexp` — Регулярное выражение для поиска имен таблиц в указанной БД или БД.

Регулярные выражения — [re2](https://github.com/google/re2) (поддерживает подмножество PCRE), чувствительны к регистру.
Смотрите примечания о экранировании символов в регулярных выражениях в разделе "match".

## Usage {#usage}

При выборе таблиц для чтения сама таблица `Merge` не выбирается, даже если она соответствует регулярному выражению. Это сделано для предотвращения циклов.
Возможно создать две таблицы `Merge`, которые будут бесконечно пытаться читать данные друг друга, но это не хорошая идея.

Типичный способ использования движка `Merge` — работа с большим количеством таблиц `TinyLog` так, как если бы это была одна таблица.

## Examples {#examples}

**Example 1**

Рассмотрим две базы данных `ABC_corporate_site` и `ABC_store`. Таблица `all_visitors` будет содержать идентификаторы из таблиц `visitors` в обеих базах данных.

``` sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Example 2**

Предположим, у вас есть старая таблица `WatchLog_old` и вы решили изменить партиционирование, не перемещая данные в новую таблицу `WatchLog_new`, и вам нужно видеть данные из обеих таблиц.

``` sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

SELECT * FROM WatchLog;
```

``` text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## Virtual Columns {#virtual-columns}

- `_table` — Содержит имя таблицы, из которой были считаны данные. Тип: [String](../../../sql-reference/data-types/string.md).

    Вы можете установить постоянные условия для `_table` в условии `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, для которых условие по `_table` удовлетворено, поэтому колонка `_table` действует как индекс.

**See Also**

- [Virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) функция таблицы
