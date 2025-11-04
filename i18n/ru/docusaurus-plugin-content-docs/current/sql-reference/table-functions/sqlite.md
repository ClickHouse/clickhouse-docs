---
slug: '/sql-reference/table-functions/sqlite'
sidebar_label: sqlite
sidebar_position: 185
description: 'Позволяет выполнять запросы к данным, хранящимся в базе данных SQLite.'
title: sqlite
doc_type: reference
---
# таблица функции sqlite

Позволяет выполнять запросы к данным, хранящимся в базе данных [SQLite](../../engines/database-engines/sqlite.md).

## Синтаксис {#syntax}

```sql
sqlite('db_path', 'table_name')
```

## Аргументы {#arguments}

- `db_path` — Путь к файлу с базой данных SQLite. [String](../../sql-reference/data-types/string.md).
- `table_name` — Имя таблицы в базе данных SQLite. [String](../../sql-reference/data-types/string.md).

## Возвращаемое значение {#returned_value}

- Объект таблицы с такими же столбцами, как в оригинальной таблице `SQLite`.

## Пример {#example}

Запрос:

```sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

Результат:

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

## Связано {#related}

- [SQLite](../../engines/table-engines/integrations/sqlite.md) движок таблиц