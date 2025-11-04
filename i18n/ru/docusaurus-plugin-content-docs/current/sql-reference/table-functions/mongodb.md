---
slug: '/sql-reference/table-functions/mongodb'
sidebar_label: mongodb
sidebar_position: 135
description: 'Позволяет выполнять `SELECT` запросы к данным, которые хранятся на'
title: mongodb
doc_type: reference
---
# mongodb Табличная Функция

Позволяет выполнять запросы `SELECT` на данных, которые хранятся на удаленном сервере MongoDB.

## Синтаксис {#syntax}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

## Аргументы {#arguments}

| Аргумент      | Описание                                                                                              |
|---------------|-------------------------------------------------------------------------------------------------------|
| `host:port`   | Адрес сервера MongoDB.                                                                                |
| `database`    | Имя удаленной базы данных.                                                                             |
| `collection`  | Имя удаленной коллекции.                                                                               |
| `user`        | Пользователь MongoDB.                                                                                 |
| `password`    | Пароль пользователя.                                                                                   |
| `structure`   | Схема для таблицы ClickHouse, возвращаемой из этой функции.                                           |
| `options`     | Опции строки подключения MongoDB (необязательный параметр).                                            |
| `oid_columns` | Список столбцов, разделенных запятыми, которые должны обрабатываться как `oid` в операторе WHERE. По умолчанию `_id`. |

:::tip
Если вы используете облачное предложение MongoDB Atlas, пожалуйста, добавьте эти параметры:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```
:::

Вы также можете подключиться по URI:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| Аргумент      | Описание                                                                                              |
|---------------|-------------------------------------------------------------------------------------------------------|
| `uri`         | Строка подключения.                                                                                   |
| `collection`  | Имя удаленной коллекции.                                                                               |
| `structure`   | Схема для таблицы ClickHouse, возвращаемой из этой функции.                                           |
| `oid_columns` | Список столбцов, разделенных запятыми, которые должны обрабатываться как `oid` в операторе WHERE. По умолчанию `_id`. |

## Возвращаемое значение {#returned_value}

Объект таблицы с теми же столбцами, что и у оригинальной таблицы MongoDB.

## Примеры {#examples}

Предположим, у нас есть коллекция с именем `my_collection`, определенная в базе данных MongoDB с именем `test`, и мы вставили несколько документов:

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

Давайте запрашивать коллекцию, используя табличную функцию `mongodb`:

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

## Связанные {#related}

- [Движок таблиц `MongoDB`](engines/table-engines/integrations/mongodb.md)
- [Использование MongoDB в качестве источника словаря](sql-reference/dictionaries/index.md#mongodb)