---
description: 'Узнайте, как использовать проекции для повышения производительности запросов, которые вы запускаете часто, используя набор данных о ценах на недвижимость в Великобритании, содержащий данные о ценах, уплаченных за недвижимость в Англии и Уэльсе.'
sidebar_label: 'Цены на недвижимость в Великобритании'
sidebar_position: 1
slug: /getting-started/example-datasets/uk-price-paid
title: 'Набор данных о ценах на недвижимость в Великобритании'
---

Эти данные содержат цены, уплаченные за недвижимость в Англии и Уэльсе. Данные доступны с 1995 года, размер набора данных в не сжатом виде составляет около 4 GiB (что займет лишь около 278 MiB в ClickHouse).

- Источник: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- Описание полей: https://www.gov.uk/guidance/about-the-price-paid-data
- Содержит данные HM Land Registry © Королевские авторские права и право на базу данных 2021 года. Эти данные лицензированы согласно Лицензии открытого правительства версии 3.0.

## Создание таблицы {#create-table}

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

## Предобработка и вставка данных {#preprocess-import-data}

Мы будем использовать функцию `url`, чтобы передать данные в ClickHouse. Сначала нам нужно предобработать некоторые входящие данные, которые включают:
- разделение `postcode` на два разных столбца — `postcode1` и `postcode2`, что лучше для хранения и запросов
- преобразование поля `time` в дату, так как оно содержит только время 00:00
- игнорирование поля [UUid](../../sql-reference/data-types/uuid.md), так как нам не нужно его для анализа
- преобразование `type` и `duration` в более читаемые поля `Enum` с помощью функции [transform](../../sql-reference/functions/other-functions.md#transform)
- преобразование поля `is_new` из строки с одним символом (`Y`/`N`) в поле [UInt8](/sql-reference/data-types/int-uint) с 0 или 1
- удаление последних двух столбцов, так как они все имеют одно и то же значение (равное 0)

Функция `url` передает данные с веб-сервера в вашу таблицу ClickHouse. Следующая команда вставляет 5 миллионов строк в таблицу `uk_price_paid`:

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

Подождите, пока данные будут вставлены — это займет минуту или две в зависимости от скорости сети.

## Проверка данных {#validate-data}

Давайте проверим, все ли сработало, посмотрев, сколько строк было вставлено:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

На момент выполнения этого запроса в наборе данных было 27,450,499 строк. Давайте посмотрим, каков размер таблицы в ClickHouse:

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

Обратите внимание, что размер таблицы составляет всего 221.43 MiB!

## Выполнение некоторых запросов {#run-queries}

Давайте выполнем некоторые запросы для анализа данных:

### Запрос 1. Средняя цена за год {#average-price}

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

### Запрос 2. Средняя цена за год в Лондоне {#average-price-london}

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

Что-то произошло с ценами на жилье в 2020 году! Но это, вероятно, не удивительно...

### Запрос 3. Самые дорогие районы {#most-expensive-neighborhoods}

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

Мы можем ускорить эти запросы с помощью проекций. См. ["Проекции"](/data-modeling/projections) для примеров с этим набором данных.

### Протестируйте это в Площадке {#playground}

Набор данных также доступен в [Онлайн Площадке](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX).
