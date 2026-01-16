---
description: 'Более 150 млн отзывов покупателей о товарах Amazon'
sidebar_label: 'Отзывы покупателей Amazon'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Отзывы покупателей Amazon'
doc_type: 'guide'
keywords: ['отзывы Amazon', 'датасет с отзывами покупателей', 'данные электронной коммерции', 'пример датасета', 'начало работы']
---

Этот датасет содержит более 150 млн отзывов покупателей о товарах Amazon. Данные хранятся в файлах формата Parquet, сжатых алгоритмом Snappy, в AWS S3; общий сжатый объём — 49 ГБ. Далее рассмотрим шаги по загрузке этого датасета в ClickHouse.

:::note
Приведённые ниже запросы выполнялись на **Production**-инстансе ClickHouse Cloud. Для получения дополнительной информации см. раздел
[&quot;Playground specifications&quot;](/getting-started/playground#specifications).
:::

## Загрузка набора данных \\{#loading-the-dataset\\}

1. Не загружая данные в ClickHouse, мы можем обращаться к ним напрямую. Давайте выберем несколько строк, чтобы посмотреть, как они выглядят:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

Строки имеют следующий вид:

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 25.44 million
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 908.18 million
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   case is sturdy and protects as I want
review_body:       I won't count on the waterproof part (I took off the rubber seals at the bottom because the got on my nerves). But the case is sturdy and protects as I want.

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 1.97 million
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 951.21 million
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   One Star
review_body:       Cant use the case because its big for the phone. Waist of money!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 24.80 million
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 524.59 million
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   but overall this case is pretty sturdy and provides good protection for the phone
review_body:       The front piece was a little difficult to secure to the phone at first, but overall this case is pretty sturdy and provides good protection for the phone, which is what I need. I would buy this case again.
```

2. Давайте создадим новую таблицу типа `MergeTree` с именем `amazon_reviews` для хранения этих данных в ClickHouse:

```sql
CREATE DATABASE amazon

CREATE TABLE amazon.amazon_reviews
(
    `review_date` Date,
    `marketplace` LowCardinality(String),
    `customer_id` UInt64,
    `review_id` String,
    `product_id` String,
    `product_parent` UInt64,
    `product_title` String,
    `product_category` LowCardinality(String),
    `star_rating` UInt8,
    `helpful_votes` UInt32,
    `total_votes` UInt32,
    `vine` Bool,
    `verified_purchase` Bool,
    `review_headline` String,
    `review_body` String,
    PROJECTION helpful_votes
    (
        SELECT *
        ORDER BY helpful_votes
    )
)
ENGINE = MergeTree
ORDER BY (review_date, product_category)
```

3. Следующая команда `INSERT` использует табличную функцию `s3Cluster`, которая позволяет обрабатывать несколько файлов S3 параллельно на всех узлах кластера. Мы также используем подстановочный символ (wildcard), чтобы вставить любые файлы, имена которых начинаются с `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
В ClickHouse Cloud имя кластера — `default`. Замените `default` на имя вашего кластера... или используйте табличную функцию `s3` (вместо `s3Cluster`), если кластера у вас нет.
:::

5. Этот запрос выполняется недолго — в среднем около 300 000 строк в секунду. Примерно через 5 минут или около того вы должны увидеть все вставленные строки:

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. Давайте посмотрим, сколько места занимают наши данные:

```sql runnable
SELECT
    disk_name,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate,
    sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1) AND (table = 'amazon_reviews')
GROUP BY disk_name
ORDER BY size DESC
```

Объём исходных данных составлял около 70 ГБ, но после сжатия в ClickHouse они занимают около 30 ГБ.

## Примеры запросов \\{#example-queries\\}

7. Давайте выполним несколько запросов. Ниже приведены 10 наиболее полезных отзывов в этом наборе данных:

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
Этот запрос использует [проекцию](/data-modeling/projections) для повышения производительности.
:::

8. Вот топ‑10 товаров на Amazon по количеству отзывов:

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. Вот средние рейтинги отзывов по месяцам для каждого товара (реальный [вопрос на собеседовании в Amazon](https://datalemur.com/questions/sql-avg-review-ratings)!):

```sql runnable
SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon.amazon_reviews
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20;
```

10. Вот общее число голосов по категориям товаров. Этот запрос выполняется быстро, потому что `product_category` входит в первичный ключ:

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. Найдём товары, в отзывах на которые слово **«awful»** встречается чаще всего. Это большая задача — нужно разобрать более 151 млн строк в поисках одного слова:

```sql runnable settings={'enable_parallel_replicas':1}
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awful') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```

Обратите внимание на время выполнения запроса для такого большого объёма данных. Результаты тоже любопытно почитать!

12. Мы можем выполнить тот же запрос ещё раз, только на этот раз будем искать **awesome** в отзывах:

```sql runnable settings={'enable_parallel_replicas':1}
SELECT 
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awesome') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```
