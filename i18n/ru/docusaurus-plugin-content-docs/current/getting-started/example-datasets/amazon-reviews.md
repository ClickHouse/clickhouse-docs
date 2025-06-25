description: 'Более 150 миллионов отзывов клиентов о продуктах Amazon'
sidebar_label: 'Отзывы клиентов Amazon'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Отзывы клиентов Amazon'
```

Этот набор данных содержит более 150 миллионов отзывов клиентов о продуктах Amazon. Данные находятся в файлах формата Parquet сжатых с помощью snappy, расположенных в AWS S3, общий размер которых составляет 49 ГБ (сжатый). Давайте пройдем через шаги, чтобы вставить эти данные в ClickHouse.

:::note
Запросы ниже были выполнены на **Production** экземпляре ClickHouse Cloud. Для получения дополнительных сведений смотрите
["Спецификации песочницы"](/getting-started/playground#specifications).
:::

## Загрузка набора данных {#loading-the-dataset}

1. Не вставляя данные в ClickHouse, мы можем выполнить запрос прямо на месте. Давайте извлечем несколько строк, чтобы увидеть, как они выглядят:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

Строки выглядят следующим образом:

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 25.44 миллионов
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 908.18 миллионов
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
customer_id:       1974568 -- 1.97 миллионов
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 951.21 миллионов
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
customer_id:       24803564 -- 24.80 миллионов
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 524.59 миллионов
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

2. Давайте определим новую таблицу `MergeTree` с именем `amazon_reviews`, чтобы сохранить эти данные в ClickHouse:

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

3. Следующая команда `INSERT` использует функцию таблицы `s3Cluster`, которая позволяет обрабатывать несколько файлов S3 параллельно, используя все узлы вашего кластера. Мы также используем шаблон, чтобы вставить любой файл, который начинается с имени `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
В ClickHouse Cloud название кластера — `default`. Измените `default` на название вашего кластера...или используйте функцию таблицы `s3` (вместо `s3Cluster`), если у вас нет кластера.
:::

5. Этот запрос не занимает много времени — в среднем около 300,000 строк в секунду. В течение примерно 5 минут вы должны увидеть вставленные все строки:

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. Давайте посмотрим, сколько места занимает наш набор данных:

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

Исходные данные занимали около 70 ГБ, но в ClickHouse они занимают около 30 ГБ.


## Примеры запросов {#example-queries}

7. Давайте выполним несколько запросов. Вот 10 самых полезных отзывов в наборе данных:

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
Этот запрос использует [проекцию](/data-modeling/projections) для ускорения производительности.
:::

8. Вот 10 продуктов на Amazon с наибольшим количеством отзывов:

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. Вот средние рейтинги отзывов по месяцам для каждого продукта (это фактический [вопрос на собеседовании в Amazon](https://datalemur.com/questions/sql-avg-review-ratings)!):

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

10. Вот общее количество голосов по категориям продуктов. Этот запрос выполняется быстро, потому что `product_category` находится в первичном ключе:

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. Давайте найдем продукты, в отзывах о которых чаще всего встречается слово **"ужасно"**. Это большая задача — необходимо разобрать более 151 миллиона строк, чтобы найти одно слово:

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

Обратите внимание на время запроса для такого большого объема данных. Результаты также окажутся увлекательными!

12. Мы можем выполнить тот же запрос снова, но на этот раз будем искать **замечательно** в отзывах:

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
