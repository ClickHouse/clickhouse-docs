---
description: 'Позволяет выполнять запросы `SELECT` к данным, хранящимся на удалённом сервере MongoDB.'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
doc_type: 'reference'
---

# Табличная функция MongoDB \{#mongodb-table-function\}

Позволяет выполнять `SELECT`-запросы к данным, хранящимся на удалённом сервере MongoDB.

## Синтаксис \{#syntax\}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

## Аргументы \{#arguments\}

| Аргумент      | Описание                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | Адрес сервера MongoDB.                                                                                               |
| `database`    | Имя удалённой базы данных.                                                                                           |
| `collection`  | Имя удалённой коллекции.                                                                                             |
| `user`        | Пользователь MongoDB.                                                                                                |
| `password`    | Пароль пользователя.                                                                                                 |
| `structure`   | Схема таблицы ClickHouse, возвращаемой этой функцией.                                                                |
| `options`     | Параметры строки подключения MongoDB (необязательный параметр).                                                      |
| `oid_columns` | Список столбцов, разделённых запятыми, которые следует трактовать как `oid` в предложении WHERE. По умолчанию `_id`. |

:::tip
Если вы используете облачный сервис MongoDB Atlas, добавьте следующие параметры:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

Вы также можете подключиться через URI:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| Аргумент      | Описание                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `uri`         | Строка подключения.                                                                                                           |
| `collection`  | Имя удалённой коллекции.                                                                                                      |
| `structure`   | Схема таблицы ClickHouse, возвращаемой этой функцией.                                                                         |
| `oid_columns` | Список столбцов, разделённых запятыми, которые в предложении WHERE должны интерпретироваться как `oid`. По умолчанию — `_id`. |

## Возвращаемое значение \{#returned_value\}

Объект таблицы с теми же столбцами, что и исходная таблица MongoDB.

## Примеры \{#examples\}

Предположим, у нас есть коллекция `my_collection` в базе данных MongoDB `test`, и мы вставляем в неё пару документов:

```sql
db.createUser({user:"test_user",pwd:"password",roles:[{role:"readWrite",db:"test"}]})

db.createCollection("my_collection")

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.9", command: "check-cpu-usage -w 75 -c 90" }
)

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.4", command: "system-check"}
)
```

Выполним запрос к коллекции с помощью табличной функции `mongodb`:

```sql
SELECT * FROM mongodb(
    '127.0.0.1:27017',
    'test',
    'my_collection',
    'test_user',
    'password',
    'log_type String, host String, command String',
    'connectTimeoutMS=10000'
)
```

или:

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```

## См. также \{#related\}

- [Движок таблицы `MongoDB`](engines/table-engines/integrations/mongodb.md)
- [Использование MongoDB в качестве источника словаря](sql-reference/dictionaries/index.md#mongodb)
