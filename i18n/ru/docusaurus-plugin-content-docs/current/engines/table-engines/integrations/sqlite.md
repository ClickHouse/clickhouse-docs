---
description: 'Табличный движок позволяет импортировать данные из и экспортировать в SQLite, а также выполнять запросы к таблицам SQLite напрямую из ClickHouse.'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'Табличный движок SQLite'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблицы SQLite

<CloudNotSupportedBadge/>

Этот движок позволяет выполнять импорт и экспорт данных между ClickHouse и SQLite, а также поддерживает выполнение запросов к таблицам SQLite непосредственно из ClickHouse.



## Создание таблицы {#creating-a-table}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**Параметры движка**

- `db_path` — путь к файлу SQLite с базой данных.
- `table` — имя таблицы в базе данных SQLite.


## Пример использования {#usage-example}

Запрос для отображения структуры таблицы SQLite:

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

Запрос для получения данных из таблицы:

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

- Движок [SQLite](../../../engines/database-engines/sqlite.md)
- Табличная функция [sqlite](../../../sql-reference/table-functions/sqlite.md)
