---
slug: '/engines/table-engines/integrations/mongodb'
sidebar_label: MongoDB
sidebar_position: 135
description: 'MongoDB движок — это TABLE только для чтения, которая позволяет читать'
title: MongoDB
doc_type: guide
---
# MongoDB

Движок MongoDB — это движок таблиц только для чтения, который позволяет считывать данные из удаленной [MongoDB](https://www.mongodb.com/) коллекции.

Поддерживаются только серверы MongoDB v3.6+.
Список начальных узлов (`mongodb+srv`) пока не поддерживается.

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

| Параметр      | Описание                                                                                                                                                                                |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host:port`   | Адрес сервера MongoDB.                                                                                                                                                                 |
| `database`    | Название удаленной базы данных.                                                                                                                                                         |
| `collection`  | Название удаленной коллекции.                                                                                                                                                           |
| `user`        | Пользователь MongoDB.                                                                                                                                                                   |
| `password`    | Пароль пользователя.                                                                                                                                                                    |
| `options`     | Необязательно. Строка подключения MongoDB [параметров](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options) в формате URL. Например, `'authSource=admin&ssl=true'` |
| `oid_columns` | Список столбцов, разделенных запятыми, которые должны обрабатываться как `oid` в условии WHERE. По умолчанию это `_id`.                                                                  |

:::tip
Если вы используете облачное предложение MongoDB Atlas, URL для подключения можно получить из опции 'Atlas SQL'.
Список начальных узлов (`mongodb**+srv**`) пока не поддерживается, но будет добавлен в будущих релизах.
:::

Кроме того, вы можете передать URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**Параметры движка**

| Параметр      | Описание                                                                                          |
|---------------|---------------------------------------------------------------------------------------------------|
| `uri`         | URI подключения к серверу MongoDB.                                                                |
| `collection`  | Название удаленной коллекции.                                                                      |
| `oid_columns` | Список столбцов, разделенных запятыми, которые должны обрабатываться как `oid` в условии WHERE. По умолчанию это `_id`. |

## Сопоставление типов {#types-mappings}

| MongoDB                    | ClickHouse                                                           |
|----------------------------|----------------------------------------------------------------------|
| bool, int32, int64         | *любой числовой тип за исключением Decimals*, Boolean, String        |
| double                     | Float64, String                                                      |
| date                       | Date, Date32, DateTime, DateTime64, String                           |
| string                     | String, *любой числовой тип (за исключением Decimals), если отформатирован правильно* |
| document                   | String (в формате JSON)                                              |
| array                      | Array, String (в формате JSON)                                       |
| oid                        | String                                                               |
| binary                     | String, если в колонке, строка в формате base64, если в массиве или документе |
| uuid (подтип двоичного 4) | UUID                                                                 |
| *любой другой*            | String                                                               |

Если ключ не найден в документе MongoDB (например, название столбца не совпадает), будет вставлено значение по умолчанию или `NULL` (если столбец допускает значение NULL).

### OID {#oid}

Если вы хотите, чтобы `String` обрабатывался как `oid` в условии WHERE, просто укажите название столбца в последнем аргументе движка таблицы.
Это может быть необходимо, когда вы запрашиваете запись по столбцу `_id`, который по умолчанию имеет тип `oid` в MongoDB.
Если поле `_id` в таблице имеет другой тип, например `uuid`, вы должны указать пустой `oid_columns`, в противном случае будет использоваться значение по умолчанию для этого параметра `_id`.

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

По умолчанию только `_id` обрабатывается как столбец `oid`.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

В этом случае вывод будет `0`, потому что ClickHouse не знает, что `another_oid_column` имеет тип `oid`, так что исправим это:

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

## Поддерживаемые операторы {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`).
Такие выражения переводятся на язык запросов MongoDB и выполняются на стороне сервера.
Вы можете отключить все эти ограничения, используя [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query).
В этом случае ClickHouse пытается преобразовать запрос с наилучшей попыткой, но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда лучше явно устанавливать тип литерала, поскольку Mongo требует строгой типизации фильтров.\
Например, вы хотите фильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что Mongo не преобразует строку в `Date`, поэтому вам придется сделать это вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это применяется к `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::

## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix)

Создайте таблицу в ClickHouse, которая позволяет считывать данные из коллекции MongoDB:

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
Вы можете увидеть сгенерированный запрос MongoDB в журналах на уровне DEBUG.

Сведения о реализации можно найти в документации [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).