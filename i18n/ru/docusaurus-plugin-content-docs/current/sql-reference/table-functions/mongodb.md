---
description: 'Позволяет выполнять запросы `SELECT` к данным, которые хранятся на удалённом сервере MongoDB.'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
---


# Функция Таблицы mongodb

Позволяет выполнять запросы `SELECT` к данным, которые хранятся на удалённом сервере MongoDB.

**Синтаксис**

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

**Аргументы**

- `host:port` — Адрес сервера MongoDB.

- `database` — Имя удалённой базы данных.

- `collection` — Имя удалённой коллекции.

- `user` — Пользователь MongoDB.

- `password` — Пароль пользователя.

- `structure` - Схема для таблицы ClickHouse, возвращаемой из этой функции.

- `options` - Опции строки подключения MongoDB (опциональный параметр).

- `oid_columns` - Список столбцов через запятую, которые должны рассматриваться как `oid` в предложении WHERE. По умолчанию `_id`.

:::tip
Если вы используете облачное решение MongoDB Atlas, пожалуйста, добавьте эти опции:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```
:::

Вы также можете подключиться по URI:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

**Аргументы**

- `uri` — Строка подключения.

- `collection` — Имя удалённой коллекции.

- `structure` — Схема для таблицы ClickHouse, возвращаемой из этой функции.

- `oid_columns` - Список столбцов через запятую, которые должны рассматриваться как `oid` в предложении WHERE. По умолчанию `_id`.

**Возвращаемое значение**

Объект таблицы с теми же столбцами, что и у оригинальной таблицы MongoDB.


**Примеры**

Предположим, у нас есть коллекция с именем `my_collection`, определённая в базе данных MongoDB с именем `test`, и мы вставили несколько документов:

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

Давайте запросим коллекцию, используя функцию таблицы `mongodb`:

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

**См. также**

- [Движок таблицы `MongoDB`](engines/table-engines/integrations/mongodb.md)
- [Использование MongoDB в качестве источника словаря](sql-reference/dictionaries/index.md#mongodb)
