---
slug: /sql-reference/table-functions/mongodb
sidebar_position: 135
sidebar_label: mongodb
title: 'mongodb'
description: 'Позволяет выполнять `SELECT` запросы к данным, хранящимся на удаленном сервере MongoDB.'
---


# Функция таблицы mongodb

Позволяет выполнять `SELECT` запросы к данным, хранящимся на удаленном сервере MongoDB.

**Синтаксис**

``` sql
mongodb(host:port, database, collection, user, password, structure [, options])
```

**Аргументы**

- `host:port` — Адрес сервера MongoDB.

- `database` — Имя удаленной базы данных.

- `collection` — Имя удаленной коллекции.

- `user` — Пользователь MongoDB.

- `password` — Пароль пользователя.

- `structure` - Схема для таблицы ClickHouse, возвращаемой этой функцией.

- `options` - Параметры строки подключения к MongoDB (необязательный параметр).

:::tip
Если вы используете облачное предложение MongoDB Atlas, пожалуйста, добавьте эти параметры:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

Кроме того, можно подключиться по URI:
``` sql
mongodb(uri, collection, structure)
```
**Аргументы**

- `uri` — Строка подключения.

- `collection` — Имя удаленной коллекции.

- `structure` — Схема для таблицы ClickHouse, возвращаемой этой функцией.

**Возвращаемое значение**

Объект таблицы с теми же колонками, что и у оригинальной таблицы MongoDB.


**Примеры**

Предположим, у нас есть коллекция с именем `my_collection`, определенная в базе данных MongoDB с именем `test`, и мы вставляем пару документов:

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

Давайте сделаем запрос к коллекции, используя функцию таблицы `mongodb`:

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
- [Использование MongoDB в качестве источника для словарей](sql-reference/dictionaries/index.md#mongodb)
