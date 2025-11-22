---
description: 'Табличный движок MongoDB — это движок только для чтения, который позволяет считывать данные из удалённой коллекции.'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'Табличный движок MongoDB'
doc_type: 'reference'
---



# Табличный движок MongoDB

Табличный движок MongoDB — это движок только для чтения, который позволяет читать данные из удалённой коллекции [MongoDB](https://www.mongodb.com/).

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

| Параметр      | Описание                                                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | Адрес сервера MongoDB.                                                                                                                                                                                   |
| `database`    | Имя удалённой базы данных.                                                                                                                                                                               |
| `collection`  | Имя удалённой коллекции.                                                                                                                                                                                 |
| `user`        | Пользователь MongoDB.                                                                                                                                                                                    |
| `password`    | Пароль пользователя.                                                                                                                                                                                     |
| `options`     | Необязательный параметр. [Параметры](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options) строки подключения MongoDB в виде строки в формате URL. Например: `'authSource=admin&ssl=true'` |
| `oid_columns` | Список столбцов через запятую, которые должны обрабатываться как `oid` в секции WHERE. По умолчанию: `_id`.                                                                                          |

:::tip
Если вы используете облачное решение MongoDB Atlas, URL подключения можно получить из опции 'Atlas SQL'.
Список начальных узлов (`mongodb**+srv**`) пока не поддерживается, но будет добавлен в будущих версиях.
:::

Альтернативно можно передать URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**Параметры движка**

| Параметр      | Описание                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `uri`         | URI подключения к серверу MongoDB.                                                                     |
| `collection`  | Имя удалённой коллекции.                                                                               |
| `oid_columns` | Список столбцов через запятую, которые должны обрабатываться как `oid` в секции WHERE. По умолчанию: `_id`. |


## Соответствие типов {#types-mappings}

| MongoDB                 | ClickHouse                                                                       |
| ----------------------- | -------------------------------------------------------------------------------- |
| bool, int32, int64      | _любой числовой тип, кроме Decimals_, Boolean, String                            |
| double                  | Float64, String                                                                  |
| date                    | Date, Date32, DateTime, DateTime64, String                                       |
| string                  | String, _любой числовой тип (кроме Decimals) при корректном форматировании_      |
| document                | String (как JSON)                                                                |
| array                   | Array, String (как JSON)                                                         |
| oid                     | String                                                                           |
| binary                  | String, если в столбце; строка в кодировке base64, если в массиве или документе  |
| uuid (binary subtype 4) | UUID                                                                             |
| _любой другой_          | String                                                                           |

Если ключ не найден в документе MongoDB (например, имя столбца не совпадает), будет вставлено значение по умолчанию или `NULL` (если столбец допускает значения NULL).

### OID {#oid}

Если вы хотите, чтобы `String` обрабатывался как `oid` в условии WHERE, укажите имя столбца в последнем аргументе движка таблицы.
Это может потребоваться при запросе записи по столбцу `_id`, который по умолчанию имеет тип `oid` в MongoDB.
Если поле `_id` в таблице имеет другой тип, например `uuid`, необходимо указать пустой `oid_columns`, иначе будет использовано значение по умолчанию для этого параметра — `_id`.

```javascript
db.sample_oid.insertMany([{ another_oid_column: ObjectId() }])

db.sample_oid.find()
;[
  {
    _id: { $oid: "67bf6cc44ebc466d33d42fb2" },
    another_oid_column: { $oid: "67bf6cc40000000000ea41b1" }
  }
]
```

По умолчанию только `_id` обрабатывается как столбец типа `oid`.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; -- вернёт 1
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- вернёт 0
```

В этом случае результат будет `0`, поскольку ClickHouse не знает, что `another_oid_column` имеет тип `oid`. Исправим это:

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

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- теперь вернёт 1
```


## Поддерживаемые операторы {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`).
Такие выражения преобразуются в язык запросов MongoDB и выполняются на стороне сервера.
Вы можете отключить все эти ограничения с помощью настройки [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query).
В этом случае ClickHouse попытается преобразовать запрос насколько это возможно, но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда рекомендуется явно указывать тип литерала, поскольку MongoDB требует строго типизированных фильтров.\
Например, если необходимо отфильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что MongoDB не приведет строку к типу `Date`, поэтому необходимо выполнить приведение типа вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это относится к типам `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::


## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix)

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

-- Найти все продолжения 'Назад в будущее' с рейтингом > 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Back to the Future', 'Back to the Future Part II', 'Back to the Future Part III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Строка 1:
─────────
title:     Back to the Future
plot:      Молодой человек случайно отправляется на 30 лет в прошлое на путешествующем во времени DeLorean, изобретённом его другом, доктором Эмметом Брауном, и должен убедиться, что его родители школьного возраста объединятся, чтобы спасти его собственное существование.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Строка 2:
─────────
title:     Back to the Future Part II
plot:      После посещения 2015 года Марти Макфлай должен повторить свой визит в 1955 год, чтобы предотвратить катастрофические изменения в 1985 году... не вмешиваясь в своё первое путешествие.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Найти топ-3 фильма по книгам Кормака Маккарти
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

Сгенерированный запрос MongoDB можно просмотреть в логах уровня DEBUG.

Детали реализации можно найти в документации [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).
