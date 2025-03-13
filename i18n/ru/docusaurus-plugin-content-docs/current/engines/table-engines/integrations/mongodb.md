---
slug: /engines/table-engines/integrations/mongodb
sidebar_position: 135
sidebar_label: MongoDB
title: 'MongoDB'
description: 'MongoDB engine is read-only table engine which allows to read data from a remote collection.'
---


# MongoDB

MongoDB engine это колоночный движок таблиц, который позволяет читать данные из удаленной [MongoDB](https://www.mongodb.com/) коллекции.

Поддерживаются только серверы MongoDB версии 3.6 и выше. 
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) пока не поддерживается.

:::note
Если у вас возникли проблемы, пожалуйста, сообщите о них и попробуйте использовать [наследственную реализацию](../../../operations/server-configuration-parameters/settings.md#use_legacy_mongodb_integration).
Имейте в виду, что она устарела и будет удалена в следующих релизах.
:::

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password [, options]);
```

**Параметры движка**

- `host:port` — адрес сервера MongoDB.

- `database` — имя удаленной базы данных.

- `collection` — имя удаленной коллекции.

- `user` — пользователь MongoDB.

- `password` — пароль пользователя.

- `options` — параметры строки подключения MongoDB (опциональный параметр).

:::tip
Если вы используете облачное предложение MongoDB Atlas, URL подключения можно получить из опции 'Atlas SQL'.
Seed list(`mongodb**+srv**`) пока не поддерживается, но будет добавлен в будущих релизах.
:::

Также вы можете просто передать URI:

``` sql
ENGINE = MongoDB(uri, collection);
```

**Параметры движка**

- `uri` — URI для подключения к серверу MongoDB.

- `collection` — имя удаленной коллекции.


## Сопоставление типов {#types-mappings}

| MongoDB            | ClickHouse                                                            |
|--------------------|-----------------------------------------------------------------------|
| bool, int32, int64 | *любой числовой тип*, String                                          |
| double             | Float64, String                                                       |
| date               | Date, Date32, DateTime, DateTime64, String                            |
| string             | String, UUID                                                          |
| document           | String(как JSON)                                                     |
| array              | Array, String(как JSON)                                              |
| oid                | String                                                                |
| binary             | String, если в колонке, строка в base64, если в массиве или документе |
| *любой другой*     | String                                                                |

Если ключ не найден в документе MongoDB (например, имя колонки не совпадает), будет вставлено значение по умолчанию или `NULL` (если колонка допускает значение NULL).

## Поддерживаемые конструкции {#supported-clauses}

Поддерживаются только запросы с простыми выражениями (например, `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`).
Эти выражения переводятся на язык запросов MongoDB и выполняются на стороне сервера.
Вы можете отключить все эти ограничения, установив [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query).
В этом случае ClickHouse попытается преобразовать запрос наилучшим образом, но это может привести к полному сканированию таблицы и обработке на стороне ClickHouse.

:::note
Всегда лучше явно установить тип литерала, поскольку Mongo требует строгую типизацию фильтров.\
Например, если вы хотите фильтровать по `Date`:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

Это не сработает, потому что Mongo не приведет строку к `Date`, поэтому вам нужно привести её вручную:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

Это применимо для `Date`, `Date32`, `DateTime`, `Bool`, `UUID`.

:::


## Пример использования {#usage-example}

Предположим, что в MongoDB загружен набор данных [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix).

Создайте таблицу в ClickHouse, которая позволяет читать данные из коллекции MongoDB:

``` sql
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

``` sql
SELECT count() FROM sample_mflix_table
```

``` text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString не может быть передан в MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Найдите все сиквелы 'Назад в будущее' с рейтингом выше 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Назад в будущее', 'Назад в будущее 2', 'Назад в будущее 3')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Назад в будущее
plot:      Молодой человек случайно отправляется на 30 лет в прошлое на автомобиле времени DeLorean, изобретенном его другом, доктором Эмметом Брауном, и должен убедиться, что его родители в старшей школе объединяются, чтобы спасти собственное существование.
genres:    ['Приключения','Комедия','Научная фантастика']
directors: ['Роберт Земекис']
released:  1985-07-03

Row 2:
──────
title:     Назад в будущее 2
plot:      После визита в 2015 год, Марти МакФлай должен повторить свой визит в 1955 год, чтобы предотвратить катастрофические изменения в 1985 году... не вмешиваясь в свою первую поездку.
genres:    ['Экшн','Приключения','Комедия']
directors: ['Роберт Земекис']
released:  1989-11-22
```

```sql
-- Найти 3 лучших фильма по книгам Кормака Маккарти
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) as rating
FROM sample_mflix_table
WHERE arrayExists(x -> x like 'Кормак Маккарти%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ Нет страны для стариков │    8.1 │
2. │ Закат ограниченный     │    7.4 │
3. │ Дорога               │    7.3 │
   └────────────────────────┴────────┘
```

## Устранение неполадок {#troubleshooting}
Вы можете увидеть сгенерированный запрос MongoDB в логах уровня DEBUG.

Детали реализации можно найти в документациях [mongocxx](https://github.com/mongodb/mongo-cxx-driver) и [mongoc](https://github.com/mongodb/mongo-c-driver).
