---
description: 'Позволяет выполнять запросы к данным, хранящимся в базе данных SQLite.'
sidebar_label: 'sqlite'
sidebar_position: 185
slug: /sql-reference/table-functions/sqlite
title: 'sqlite'
---


# Функция Таблицы sqlite

Позволяет выполнять запросы к данным, хранящимся в базе данных [SQLite](../../engines/database-engines/sqlite.md).

**Синтаксис**

```sql
sqlite('db_path', 'table_name')
```

**Аргументы**

- `db_path` — Путь к файлу с базой данных SQLite. [String](../../sql-reference/data-types/string.md).
- `table_name` — Имя таблицы в базе данных SQLite. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Объект таблицы с теми же колонками, что и в оригинальной таблице `SQLite`.

**Пример**

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

**Смотрите Также**

- Движок таблиц [SQLite](../../engines/table-engines/integrations/sqlite.md)
