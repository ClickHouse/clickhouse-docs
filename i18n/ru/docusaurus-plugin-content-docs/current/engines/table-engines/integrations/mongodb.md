---
description: 'Движок MongoDB — это табличный движок, предназначенный только для чтения, который позволяет считывать данные из удалённой коллекции.'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'Табличный движок MongoDB'
doc_type: 'reference'
---



# Движок таблиц MongoDB {#mongodb-table-engine}

Движок MongoDB — это табличный движок только для чтения, который позволяет считывать данные из удалённой коллекции [MongoDB](https://www.mongodb.com/).

Поддерживаются только серверы MongoDB версии v3.6 и новее.
[Список начальных узлов (`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) пока не поддерживается.



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password[, options[, oid_columns]]);
```

**Параметры движка**

| Parameter     | Description                                                                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | Адрес сервера MongoDB.                                                                                                                                                                                                        |
| `database`    | Имя удалённой базы данных.                                                                                                                                                                                                    |
| `collection`  | Имя удалённой коллекции.                                                                                                                                                                                                      |
| `user`        | Пользователь MongoDB.                                                                                                                                                                                                         |
| `password`    | Пароль пользователя.                                                                                                                                                                                                          |
| `options`     | Необязательный параметр. Параметры строки подключения MongoDB ([options](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options)) в формате URL. Например, `'authSource=admin&ssl=true'` |
| `oid_columns` | Список столбцов, разделённых запятыми, которые должны рассматриваться как `oid` в предложении WHERE. По умолчанию `_id`.                                                                                                      |

:::tip
Если вы используете облачный сервис MongoDB Atlas, URL подключения можно получить из пункта &#39;Atlas SQL&#39;.
Seed‑список (`mongodb+srv`) пока не поддерживается, но будет добавлен в будущих релизах.
:::

В качестве альтернативы вы можете передать URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**Параметры движка**

| Параметр      | Описание                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `uri`         | URI подключения к серверу MongoDB.                                                                                   |
| `collection`  | Имя удалённой коллекции.                                                                                             |
| `oid_columns` | Список столбцов, разделённых запятыми, которые в предложении WHERE следует трактовать как `oid`. По умолчанию `_id`. |


## Соответствие типов {#types-mappings}

| MongoDB                 | ClickHouse                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- |
| bool, int32, int64      | *любой числовой тип, кроме Decimals*, Boolean, String                           |
| double                  | Float64, String                                                                 |
| date                    | Date, Date32, DateTime, DateTime64, String                                      |
| string                  | String, *любой числовой тип (кроме Decimals) при корректном формате*            |
| document                | String (в формате JSON)                                                         |
| array                   | Array, String (в формате JSON)                                                  |
| oid                     | String                                                                          |
| binary                  | String, если в столбце; строка в base64-кодировке, если в массиве или документе |
| uuid (binary subtype 4) | UUID                                                                            |
| *any other*             | String                                                                          |

Если ключ не найден в документе MongoDB (например, имя столбца не совпадает), будет вставлено значение по умолчанию или `NULL` (если столбец имеет тип данных Nullable).

### OID {#oid}

Если вы хотите, чтобы `String` интерпретировалась как `oid` в предложении WHERE, укажите имя столбца в последнем аргументе движка таблицы.
Это может быть необходимо при выполнении запроса к записи по столбцу `_id`, который по умолчанию имеет тип `oid` в MongoDB.
Если поле `_id` в таблице имеет другой тип, например `uuid`, необходимо указать пустой `oid_columns`, иначе для этого параметра будет использовано значение по умолчанию (`_id`).

```javascript
db.sample_oid.insertMany([
    {"another_oid_column": ObjectId()},
]);

db.sample_oid.find();
[
    {
        "_id": {"$oid": "67bf6cc44ebc466d33d42fb2"},
        "another_oid_column": {"$oid": "67bf6cc40000000000ea41b1"}
    }
]
```

По умолчанию только `_id` используется как столбец типа `oid`.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

В этом случае выводом будет `0`, потому что ClickHouse не знает, что `another_oid_column` имеет тип данных `oid`, так что давайте это исправим:

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- or

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- will output 1 now
```


## Поддерживаемые конструкции {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`).
Такие выражения транслируются в язык запросов MongoDB и выполняются на стороне сервера.
Вы можете отключить все эти ограничения, используя [mongodb&#95;throw&#95;on&#95;unsupported&#95;query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query).
В этом случае ClickHouse пытается преобразовать запрос максимально возможным образом, но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда лучше явно указывать тип литерала, поскольку Mongo требует строго типизированные фильтры.
Например, вы хотите отфильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что Mongo не приведёт строку к типу `Date`, поэтому вам нужно сделать это вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это относится к `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::


## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample&#95;mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix).

Создайте таблицу в ClickHouse, которая позволит читать данные из коллекции MongoDB:

```sql
CREATE TABLE sample_mflix_table
(
    _id String,
    title String,
    plot String,
    genres Array(String),
    directors Array(String),
    writers Array(String),
    released Date,
    imdb String,
    year String
) ENGINE = MongoDB('mongodb://<USERNAME>:<PASSWORD>@atlas-sql-6634be87cefd3876070caf96-98lxs.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin', 'movies');
```

Запрос:

```sql
SELECT count() FROM sample_mflix_table
```

```text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString cannot be pushed down to MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Find all 'Back to the Future' sequels with rating > 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Back to the Future', 'Back to the Future Part II', 'Back to the Future Part III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Back to the Future
plot:      A young man is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his friend, Dr. Emmett Brown, and must make sure his high-school-age parents unite in order to save his own existence.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985... without interfering with his first trip.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Find top 3 movies based on Cormac McCarthy's books
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ No Country for Old Men │    8.1 │
2. │ The Sunset Limited     │    7.4 │
3. │ The Road               │    7.3 │
   └────────────────────────┴────────┘
```


## Устранение неполадок {#troubleshooting}
Вы можете увидеть сгенерированный запрос MongoDB в логах на уровне DEBUG.

Подробности реализации можно найти в документации по [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).
