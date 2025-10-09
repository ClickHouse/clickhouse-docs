---
slug: '/engines/table-engines/integrations/sqlite'
sidebar_label: SQLite
sidebar_position: 185
description: 'Движок позволяет импортировать и экспортировать данные в SQLite и'
title: SQLite
doc_type: reference
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite

<CloudNotSupportedBadge/>

Движок позволяет импортировать и экспортировать данные в SQLite и поддерживает запросы к таблицам SQLite непосредственно из ClickHouse.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2], ...
) ENGINE = SQLite('db_path', 'table')
```

**Параметры движка**

- `db_path` — Путь к файлу SQLite с базой данных.
- `table` — Название таблицы в базе данных SQLite.

## Пример использования {#usage-example}

Показывает запрос, создающий таблицу SQLite:

```sql
SHOW CREATE TABLE sqlite_db.table2;
```

```text
CREATE TABLE SQLite.table2
(
    `col1` Nullable(Int32),
    `col2` Nullable(String)
)
ENGINE = SQLite('sqlite.db','table2');
```

Возвращает данные из таблицы:

```sql
SELECT * FROM sqlite_db.table2 ORDER BY col1;
```

```text
┌─col1─┬─col2──┐
│    1 │ text1 │
│    2 │ text2 │
│    3 │ text3 │
└──────┴───────┘
```

**См. также**

- [SQLite](../../../engines/database-engines/sqlite.md) движок
- [sqlite](../../../sql-reference/table-functions/sqlite.md) табличная функция