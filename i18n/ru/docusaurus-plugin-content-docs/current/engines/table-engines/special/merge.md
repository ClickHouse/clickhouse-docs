---
description: 'Движок `Merge` (не путать с `MergeTree`) не хранит данные сам по себе, но позволяет одновременно читать из любого числа других таблиц.'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Движок таблиц Merge'
---


# Движок таблиц Merge

Движок `Merge` (не путать с `MergeTree`) не хранит данные сам по себе, но позволяет одновременно читать из любого числа других таблиц.

Чтение автоматически параллелизуется. Запись в таблицу не поддерживается. При чтении используются индексы таблиц, которые фактически читаются, если они существуют.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## Параметры движка {#engine-parameters}

### db_name {#db_name}

`db_name` — Возможные значения:
    - имя базы данных,
    - константное выражение, которое возвращает строку с именем базы данных, например, `currentDatabase()`,
    - `REGEXP(expression)`, где `expression` — это регулярное выражение для соответствия именам баз данных.

### tables_regexp {#tables_regexp}

`tables_regexp` — Регулярное выражение для соответствия именам таблиц в указанной БД или БД.

Регулярные выражения — [re2](https://github.com/google/re2) (поддерживает подмножество PCRE), регистронезависимые.
Смотрите примечания об экранировании символов в регулярных выражениях в разделе "match".

## Использование {#usage}

При выборе таблиц для чтения сама таблица `Merge` не выбирается, даже если она соответствует регулярному выражению. Это делается, чтобы избежать циклов.
Возможно создать две таблицы `Merge`, которые будут без конца пытаться читать данные друг друга, но это не лучшая идея.

Типичный способ использования движка `Merge` — работа с большим количеством таблиц `TinyLog`, как с одной таблицей.

## Примеры {#examples}

**Пример 1**

Рассмотрим две базы данных `ABC_corporate_site` и `ABC_store`. Таблица `all_visitors` будет содержать идентификаторы из таблиц `visitors` в обеих базах данных.

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Пример 2**

Предположим, у вас есть старая таблица `WatchLog_old`, и вы решили изменить партиционирование, не перемещая данные в новую таблицу `WatchLog_new`, и вам нужно видеть данные из обеих таблиц.

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

## Виртуальные колонки {#virtual-columns}

- `_table` — Содержит имя таблицы, из которой были прочитаны данные. Тип: [String](../../../sql-reference/data-types/string.md).

    Вы можете задать постоянные условия по `_table` в клаузе `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, где условие по `_table` выполнено, и колонка `_table` действует как индекс.

**См. также**

- [Виртуальные колонки](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- Табличная функция [merge](../../../sql-reference/table-functions/merge.md)
