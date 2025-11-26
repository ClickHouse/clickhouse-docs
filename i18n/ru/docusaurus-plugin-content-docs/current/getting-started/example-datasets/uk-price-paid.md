---
description: 'Узнайте, как использовать проекции для повышения производительности часто выполняемых запросов с использованием набора данных о недвижимости Великобритании, который содержит данные о ценах покупки объектов недвижимости в Англии и Уэльсе'
sidebar_label: 'Цены на недвижимость в Великобритании'
slug: /getting-started/example-datasets/uk-price-paid
title: 'Набор данных о ценах на недвижимость в Великобритании'
doc_type: 'guide'
keywords: ['пример набора данных', 'недвижимость Великобритании', 'пример данных', 'недвижимость', 'начало работы']
---

Эти данные содержат информацию о ценах покупки объектов недвижимости в Англии и Уэльсе. Данные доступны с 1995 года, а размер набора данных в несжатом виде составляет около 4 GiB (в ClickHouse они будут занимать всего около 278 MiB).

- Источник: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- Описание полей: https://www.gov.uk/guidance/about-the-price-paid-data
- Содержит данные HM Land Registry © Crown copyright and database right 2021. Эти данные распространяются по лицензии Open Government Licence v3.0.



## Создайте таблицу

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```


## Предобработка и вставка данных

Мы будем использовать функцию `url` для потоковой загрузки данных в ClickHouse. Нам нужно предварительно обработать часть входящих данных, в том числе:

* разделить `postcode` на два отдельных столбца — `postcode1` и `postcode2`, что лучше для хранения и выполнения запросов
* преобразовать поле `time` в дату, поскольку в нём всегда указано время 00:00
* игнорировать поле [UUid](../../sql-reference/data-types/uuid.md), потому что оно нам не нужно для анализа
* преобразовать `type` и `duration` в более читаемые поля типа `Enum` с использованием функции [transform](../../sql-reference/functions/other-functions.md#transform)
* преобразовать поле `is_new` из строкового значения из одного символа (`Y`/`N`) в поле типа [UInt8](/sql-reference/data-types/int-uint) со значениями 0 или 1
* отбросить последние два столбца, так как оба имеют одинаковое значение (0)

Функция `url` в потоковом режиме передаёт данные с веб-сервера в вашу таблицу ClickHouse. Следующая команда вставляет 5 миллионов строк в таблицу `uk_price_paid`:

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

Дождитесь, пока данные будут записаны — это может занять одну‑две минуты в зависимости от скорости сети.


## Проверка данных

Убедимся, что всё прошло успешно, посмотрев, сколько строк было вставлено:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

На момент выполнения этого запроса набор данных содержал 27 450 499 строк. Посмотрим, сколько места на диске занимает эта таблица в ClickHouse:

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

Обратите внимание: размер таблицы — всего 221,43 MiB!


## Выполним несколько запросов

Выполним несколько запросов, чтобы проанализировать данные:

### Запрос 1. Средняя цена по годам

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80
)
FROM uk.uk_price_paid
GROUP BY year
ORDER BY year
```

### Запрос 2. Средняя цена по годам в Лондоне

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100
)
FROM uk.uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

Что-то произошло с ценами на жильё в 2020 году! Но это вряд ли стало неожиданностью...

### Запрос 3. Самые дорогие районы

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```


## Ускорение запросов с помощью проекций {#speeding-up-queries-with-projections}

Мы можем ускорить эти запросы с помощью проекций. См. раздел [«Проекции»](/data-modeling/projections) с примерами для этого набора данных.

### Протестируйте это в Playground {#playground}

Этот набор данных также доступен в [Online Playground](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX).
