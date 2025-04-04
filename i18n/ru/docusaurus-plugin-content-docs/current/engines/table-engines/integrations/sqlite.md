---
description: 'Движок позволяет импортировать и экспортировать данные в SQLite и поддерживает запросы к таблицам SQLite напрямую из ClickHouse.'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite

<CloudNotSupportedBadge/>

Движок позволяет импортировать и экспортировать данные в SQLite и поддерживает запросы к таблицам SQLite напрямую из ClickHouse.

## Создание Таблицы {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**Параметры Движка**

- `db_path` — Путь к файлу SQLite с базой данных.
- `table` — Имя таблицы в базе данных SQLite.

## Пример Использования {#usage-example}

Показывает запрос на создание таблицы SQLite:

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

**Смотрите Также**

- [SQLite](../../../engines/database-engines/sqlite.md) движок
- [sqlite](../../../sql-reference/table-functions/sqlite.md) табличная функция
