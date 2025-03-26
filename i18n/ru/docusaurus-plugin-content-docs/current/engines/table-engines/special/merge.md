---
description: 'Двигатель `Merge` (не путать с `MergeTree`) сам по себе не хранит данные, но позволяет одновременно читать данные из любого количества других таблиц.'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Двигатель таблицы Merge'
---


# Двигатель таблицы Merge

Двигатель `Merge` (не путать с `MergeTree`) сам по себе не хранит данные, но позволяет одновременно читать данные из любого количества других таблиц.

Чтение автоматически параллелизуется. Запись в таблицу не поддерживается. При чтении используются индексы таблиц, которые на самом деле читаются, если они существуют.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## Параметры двигателя {#engine-parameters}

### db_name {#db_name}

`db_name` — Возможные значения:
    - имя базы данных,
    - константное выражение, возвращающее строку с именем базы данных, например, `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` является регулярным выражением для соответствия именам БД.

### tables_regexp {#tables_regexp}

`tables_regexp` — Регулярное выражение для соответствия именам таблиц в указанной БД или БД.

Регулярные выражения — [re2](https://github.com/google/re2) (поддерживает подмножество PCRE), чувствительны к регистру. См. примечания о экранировании символов в регулярных выражениях в разделе "соответствие".

## Использование {#usage}

При выборе таблиц для чтения сама таблица `Merge` не выбирается, даже если она соответствует регулярному выражению. Это сделано для предотвращения зацикливания. Возможно создание двух таблиц `Merge`, которые будут безконечно пытаться читать данные друг у друга, но это плохая идея.

Типичный способ использования двигателя `Merge` — это работа с большим количеством таблиц `TinyLog`, как если бы это была одна таблица.

## Примеры {#examples}

**Пример 1**

Рассмотрим две базы данных `ABC_corporate_site` и `ABC_store`. Таблица `all_visitors` будет содержать ID из таблиц `visitors` в обеих базах данных.

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Пример 2**

Предположим, у вас есть старая таблица `WatchLog_old`, и вы решили изменить партиционирование без перемещения данных в новую таблицу `WatchLog_new`, и вам нужно видеть данные из обеих таблиц.

```sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

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

- `_table` — Содержит имя таблицы, из которой были прочитаны данные. Тип: [String](../../../sql-reference/data-types/string.md).

    Вы можете установить постоянные условия на `_table` в условии `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, где условие на `_table` удовлетворяется, так что столбец `_table` действует как индекс.

**См. также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- Функция таблицы [merge](../../../sql-reference/table-functions/merge.md)
