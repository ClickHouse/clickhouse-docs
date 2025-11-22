---
description: 'Позволяет выполнять запросы к данным, хранящимся в базе данных SQLite.'
sidebar_label: 'sqlite'
sidebar_position: 185
slug: /sql-reference/table-functions/sqlite
title: 'sqlite'
doc_type: 'reference'
---



# Табличная функция SQLite

Позволяет выполнять запросы к данным, хранящимся в базе данных [SQLite](../../engines/database-engines/sqlite.md).



## Синтаксис {#syntax}

```sql
sqlite('db_path', 'table_name')
```


## Аргументы {#arguments}

- `db_path` — путь к файлу с базой данных SQLite. [String](../../sql-reference/data-types/string.md).
- `table_name` — имя таблицы в базе данных SQLite. [String](../../sql-reference/data-types/string.md).


## Возвращаемое значение {#returned_value}

- Табличный объект с теми же столбцами, что и в исходной таблице `SQLite`.


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


## Связанные материалы {#related}

- Движок таблиц [SQLite](../../engines/table-engines/integrations/sqlite.md)
