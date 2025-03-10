---
slug: /sql-reference/table-functions/sqlite
sidebar_position: 185
sidebar_label: sqlite
title: sqlite
description: "Позволяет выполнять запросы к данным, хранящимся в базе данных SQLite."
---


# Функция таблицы sqlite

Позволяет выполнять запросы к данным, хранящимся в [SQLite](../../engines/database-engines/sqlite.md) базе данных.

**Синтаксис**

```sql
sqlite('db_path', 'table_name')
```

**Аргументы**

- `db_path` — Путь к файлу с базой данных SQLite. [String](../../sql-reference/data-types/string.md).
- `table_name` — Имя таблицы в базе данных SQLite. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Объект таблицы с такими же колонками, как в оригинальной таблице `SQLite`.

**Пример**

Запрос:

``` sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

Результат:

``` text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

**Смотрите также**

- [SQLite](../../engines/table-engines/integrations/sqlite.md) таблица обработчик
