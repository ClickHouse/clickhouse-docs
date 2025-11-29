---
description: 'Движок таблицы MongoDB — это движок только для чтения, который позволяет считывать данные из удалённой коллекции.'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'Движок таблицы MongoDB'
doc_type: 'reference'
---



# Табличный движок MongoDB {#mongodb-table-engine}

Табличный движок MongoDB — это движок только для чтения, который позволяет читать данные из удалённой коллекции [MongoDB](https://www.mongodb.com/).

Поддерживаются только серверы MongoDB версии 3.6 и выше.
[Seed list (`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) пока не поддерживается.



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

| Параметр      | Описание                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | Адрес сервера MongoDB.                                                                                                                                                                                                              |
| `database`    | Имя удалённой базы данных.                                                                                                                                                                                                          |
| `collection`  | Имя удалённой коллекции.                                                                                                                                                                                                            |
| `user`        | Пользователь MongoDB.                                                                                                                                                                                                               |
| `password`    | Пароль пользователя.                                                                                                                                                                                                                |
| `options`     | Необязательный параметр. Параметры строки подключения MongoDB [options](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options) в формате URL-строки, например: `'authSource=admin&ssl=true'`. |
| `oid_columns` | Разделённый запятыми список столбцов, которые должны интерпретироваться как `oid` в предложении WHERE. По умолчанию `_id`.                                                                                                          |

:::tip
Если вы используете облачный сервис MongoDB Atlas, URL подключения можно получить в разделе «Atlas SQL».
Seed-список(`mongodb**+srv**`) пока не поддерживается, но поддержка будет добавлена в будущих релизах.
:::

Либо вы можете передать URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**Параметры движка**

| Параметр      | Описание                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `uri`         | URI подключения к серверу MongoDB.                                                                                                 |
| `collection`  | Имя коллекции на удалённом сервере.                                                                                                |
| `oid_columns` | Список имён столбцов, разделённых запятыми, которые в предложении WHERE должны интерпретироваться как `oid`. По умолчанию — `_id`. |


## Сопоставление типов {#types-mappings}

| MongoDB                 | ClickHouse                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------ |
| bool, int32, int64      | *любой числовой тип, кроме Decimals*, Boolean, String                                |
| double                  | Float64, String                                                                      |
| date                    | Date, Date32, DateTime, DateTime64, String                                           |
| string                  | String, *любой числовой тип (кроме Decimals), если значение имеет корректный формат* |
| document                | String (как JSON)                                                                    |
| array                   | Array, String (как JSON)                                                             |
| oid                     | String                                                                               |
| binary                  | String, если в столбце; строка в кодировке base64, если в массиве или документе      |
| uuid (binary subtype 4) | UUID                                                                                 |
| *any other*             | String                                                                               |

Если ключ не найден в документе MongoDB (например, имя столбца не совпадает), будет вставлено значение по умолчанию или `NULL` (если столбец допускает значения `NULL`).

### OID {#oid}

Если вы хотите, чтобы `String` обрабатывался как `oid` в условии WHERE, просто укажите имя столбца в последнем аргументе движка таблицы.
Это может понадобиться при выборке записи по столбцу `_id`, который по умолчанию имеет тип `oid` в MongoDB.
Если поле `_id` в таблице имеет другой тип, например `uuid`, необходимо указать пустой `oid_columns`, иначе по умолчанию используется значение `_id` для этого параметра.

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

По умолчанию только `_id` считается столбцом типа `oid`.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --вернёт 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --вернёт 0
```

В этом случае результат будет `0`, потому что ClickHouse не знает, что `another_oid_column` имеет тип данных `oid`, поэтому давайте это исправим:

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

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- теперь вернёт 1
```


## Поддерживаемые предложения {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`).
Такие выражения переводятся в язык запросов MongoDB и выполняются на стороне сервера.
Вы можете отключить все эти ограничения, используя [mongodb&#95;throw&#95;on&#95;unsupported&#95;query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query).
В этом случае ClickHouse пытается преобразовать запрос на основе принципа «best effort», но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда лучше явно указывать тип литерала, потому что Mongo требует строго типизированных фильтров.\
Например, вы хотите отфильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что Mongo не преобразует строку в `Date`, так что вам нужно выполнить преобразование вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это относится к `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::


## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample&#95;mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix).

Создайте таблицу в ClickHouse, которая позволит читать данные из коллекции в MongoDB:

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
-- JSONExtractString не может быть передан в MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Найти все сиквелы «Назад в будущее» с рейтингом > 7.5
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
plot:      Молодой человек случайно переносится на 30 лет в прошлое на машине времени DeLorean, изобретённой его другом, доктором Эмметом Брауном, и должен сделать так, чтобы его родители-старшеклассники встретились и полюбили друг друга, иначе он сам перестанет существовать.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      После визита в 2015 год Марти МакФлай должен снова отправиться в 1955 год, чтобы предотвратить катастрофические изменения в 1985 году... не вмешиваясь при этом в события своего первого путешествия.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Найти топ-3 фильмов по книгам Кормака Маккарти
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─название───────────────┬─рейтинг┐
1. │ Старикам тут не место  │    8.1 │
2. │ Закатный экспресс      │    7.4 │
3. │ Дорога                 │    7.3 │
   └────────────────────────┴────────┘
```


## Диагностика и устранение неполадок {#troubleshooting}
Сгенерированный запрос MongoDB можно увидеть в журналах с уровнем DEBUG.

Подробности реализации приведены в документации [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).
