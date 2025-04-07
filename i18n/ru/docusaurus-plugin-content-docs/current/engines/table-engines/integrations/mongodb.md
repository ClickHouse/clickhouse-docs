---
description: 'Движок MongoDB — это движок таблиц только для чтения, который позволяет читать данные из удаленной коллекции.'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB'
---


# MongoDB

Движок MongoDB — это движок таблиц только для чтения, который позволяет читать данные из удаленной [MongoDB](https://www.mongodb.com/) коллекции.

Поддерживаются только серверы MongoDB версии 3.6 и выше. 
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) пока не поддерживается.

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

- `host:port` — адрес сервера MongoDB.

- `database` — имя удаленной базы данных.

- `collection` — имя удаленной коллекции.

- `user` — пользователь MongoDB.

- `password` — пароль пользователя.

- `options` — параметры строки подключения MongoDB (необязательный параметр).

- `oid_columns` - Список колонок через запятую, которые должны рассматриваться как `oid` в предложении WHERE. По умолчанию `_id`.

:::tip
Если вы используете облачное предложение MongoDB Atlas, URL подключения можно получить из опции 'Atlas SQL'. 
Seed list(`mongodb**+srv**`) пока не поддерживается, но будет добавлен в будущих релизах.
:::

В качестве альтернативы вы можете передать URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**Параметры движка**

- `uri` — URI подключения к серверу MongoDB.

- `collection` — имя удаленной коллекции.

- `oid_columns` - Список колонок через запятую, которые должны рассматриваться как `oid` в предложении WHERE. По умолчанию `_id`.


## Сопоставление типов {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
|-------------------------|-----------------------------------------------------------------------|
| bool, int32, int64      | *любой числовой тип*, String                                          |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String                                                                |
| document                | String(как JSON)                                                     |
| array                   | Array, String(как JSON)                                              |
| oid                     | String                                                                |
| binary                  | String, если в колонке, строка в формате base64, если в массиве или документе |
| uuid (binary subtype 4) | UUID                                                                  |
| *любой другой*         | String                                                                |

Если ключ не найден в документе MongoDB (например, имя колонки не совпадает), будет вставлено значение по умолчанию или `NULL` (если колонка допускает NULL).

### OID {#oid}

Если вы хотите, чтобы `String` рассматривался как `oid` в предложении WHERE, просто укажите имя колонки в последнем аргументе движка таблицы. 
Это может потребоваться при запросе записи по колонке `_id`, которая по умолчанию имеет тип `oid` в MongoDB. 
Если поле `_id` в таблице имеет другой тип, например `uuid`, необходимо указать пустой `oid_columns`, в противном случае будет использовано значение по умолчанию для этого параметра `_id`.

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

По умолчанию только `_id` рассматривается как колонка `oid`.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; -- вернет 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- вернет 0
```

В этом случае результат будет `0`, потому что ClickHouse не знает, что `another_oid_column` имеет тип `oid`, давайте это исправим:

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- или

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- теперь вернет 1
```

## Поддерживаемые предложения {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`). 
Такие выражения преобразуются в язык запросов MongoDB и выполняются на стороне сервера. 
Вы можете отключить все эти ограничения, используя [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query). 
В этом случае ClickHouse попытается преобразовать запрос на основе лучших усилий, но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда лучше явно задавать тип литерала, потому что Mongo требует строгой типизации фильтров.\
Например, если вы хотите отфильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что Mongo не выполнит преобразование строки в `Date`, поэтому вам нужно будет сделать это вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это применимо для `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::


## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix).

Создайте таблицу в ClickHouse, которая позволяет читать данные из коллекции MongoDB:

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
    year String,
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
-- JSONExtractString не может быть переработан в MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Найдите все сиквелы 'Назад в будущее' с рейтингом выше 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Назад в будущее', 'Назад в будущее Часть II', 'Назад в будущее Часть III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Назад в будущее
plot:      Молодой человек случайно отправляется на 30 лет в прошлое в машине времени DeLorean, изобретенной его другом, доктором Эмметом Брауном, и должен убедиться, что его родители, будучи школьниками, соединятся, чтобы спасти свое существование.
genres:    ['Приключения','Комедия','Научная фантастика']
directors: ['Роберт Земекис']
released:  1985-07-03

Row 2:
──────
title:     Назад в будущее Часть II
plot:      После визита 2015 года, Мартин МакФлай должен повторно посетить 1955 год, чтобы предотвратить катастрофические изменения в 1985 году... не вмешиваясь в свою первую поездку.
genres:    ['Экшен','Приключения','Комедия']
directors: ['Роберт Земекис']
released:  1989-11-22
```

```sql
-- Найти топ 3 фильма на основе книг Кормака Маккарти
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) as rating
FROM sample_mflix_table
WHERE arrayExists(x -> x like 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ Нет страны для стариков │    8.1 │
2. │ Ограниченный закат     │    7.4 │
3. │ Дорога                │    7.3 │
   └────────────────────────┴────────┘
```

## Устранение неполадок {#troubleshooting}
Вы можете увидеть сгенерированный запрос MongoDB в журналах уровня DEBUG.

Подробности реализации можно найти в документациях [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).
