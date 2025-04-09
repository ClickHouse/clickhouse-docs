---
description: 'Более 150 миллионов отзывов клиентов о продуктах Amazon'
sidebar_label: 'Отзывы клиентов Amazon'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Отзывы клиентов Amazon'
---

Этот набор данных содержит более 150 миллионов отзывов клиентов о продуктах Amazon. Данные хранятся в сжатых с помощью snappy файлах формата Parquet в AWS S3 и занимают в сумме 49 ГБ (в сжатом виде). Давайте рассмотрим шаги для их вставки в ClickHouse.

:::note
Запросы ниже были выполнены на **Production** экземпляре [ClickHouse Cloud](https://clickhouse.cloud).
:::
## Загрузка набора данных {#loading-the-dataset}

1. Не вставляя данные в ClickHouse, мы можем выполнить запрос к ним на месте. Давайте получим несколько строк, чтобы увидеть, как они выглядят:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 10
```

Строки выглядят следующим образом:

```response
┌─review_date─┬─marketplace─┬─customer_id─┬─review_id──────┬─product_id─┬─product_parent─┬─product_title────────────────────────────────────────────────┬─product_category───────┬─star_rating─┬─helpful_votes─┬─total_votes─┬─vine──┬─verified_purchase─┬─review_headline─────────────────────────────────────────────────────────────┬─review_body────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│       16452 │ US          │    21080196 │ R17NMVYCQXEEFW │ B00RSI5DJA │      904397429 │ Pilot                                                        │ Digital_Video_Download │           5 │             0 │           0 │ false │ false             │ yes indeed                                                                  │ OMG- i totally see myself get hook on that show if it happen- love it                                                                                                                                                                                      │
│       16452 │ US          │    44158214 │ R3MAPJVO9D0ERG │ B00RSI61PU │      475013967 │ Salem Rogers: Model of the Year 1998                         │ Digital_Video_Download │           5 │             0 │           0 │ false │ false             │ Halarious show!!                                                            │ Loved this pilot episode!! Please pick this up Amazon!!!                                                                                                                                                                                                   │
│       16452 │ US          │     1944630 │ R1Q5YPRE84OVB6 │ B009IU6BIS │      101502671 │ National Lampoon's Christmas Vacation                        │ Digital_Video_Download │           5 │             0 │           0 │ false │ false             │ Classic!                                                                    │ This is a holiday classic. How can you not love it!                                                                                                                                                                                                        │
│       16452 │ US          │    49029010 │ RGDK35TBJJ2ZI  │ B00RSI68V2 │      639602030 │ Table 58                                                     │ Digital_Video_Download │           5 │             2 │           3 │ false │ false             │ Fun for the whole family!!                                                  │ This show is fun! Our family really enjoyed watching the show. I can see this being one of the shows that we watch on Friday nights with our pizza and ice cream. I hope to see more of the show and the great cast of characters.                         │
│       16452 │ US          │    52257958 │ R1R2SEOJT8M14Y │ B00RSGIMUE │      196368495 │ Niko and the Sword of Light                                  │ Digital_Video_Download │           5 │             1 │           2 │ false │ false             │ it's a new kind of avatar. great show. make more.                           │ My 7 year old son and my husband both loved it! It's like avatar the last air bender but with different magical powers. The characters are adorably well developed. The story is interesting.  We hope amazon makes the whole season. We can't wait to see more! │
│       16452 │ US          │    26927978 │ RN0JCPQ6Z4FUB  │ B009ITL7UG │      497741324 │ Lord of the Rings: The Return of the King (Extended Edition) │ Digital_Video_Download │           5 │             0 │           0 │ false │ true              │ Definite must-own for any Tolkien buff who has not yet upgraded to Blu-Ray! │ If you liked the theatrical release and are a fan of Middle-Earth then you should get this.                                                                                                                                                                │
│       16452 │ US          │    19626887 │ R15LDVOU1S1DFB │ B00RSGHGB0 │      576999592 │ Just Add Magic - Season 1                                    │ Digital_Video_Download │           5 │             1 │           1 │ false │ false             │ Great story! So good even my teenage boys said ...                          │ Great story! So good even my teenage boys said this is actually pretty good!!! Can't wait for the next episode.                                                                                                                                            │
│       16452 │ US          │     1439383 │ R2DJVLZM1MVFQH │ B002WEQJ3E │      733651019 │ Six: The Mark Unleashed                                      │ Digital_Video_Download │           1 │             0 │           4 │ false │ false             │ I am now less intelligent for having watched an entire 10 minutes of it     │ I am now less intelligent for having watched an entire 10 minutes of it.  God save my sole as I now must kick out the chair from which I am standing on so that the noose may do its job.  Watch the movie at your own risk.  The screen will suck your brain cells out of your body. │
│       16452 │ US          │    46233181 │ R33W2NB9MCRUFV │ B00RSGFYQE │      464741068 │ Point of Honor                                               │ Digital_Video_Download │           4 │             0 │           0 │ false │ false             │ Give it a chance.                                                           │ Pilots are just what they are...pilots. A chance to see what works and what doesn't and a chance to smooth out the wrinkles. Point of Honor at least stands a fair chance.                                                                                 │
│       16452 │ US          │    19537300 │ R2WGJYESHID0ZF │ B00RSGHQJM │      374287214 │ Down Dog                                                     │ Digital_Video_Download │           5 │             1 │           1 │ false │ false             │ Five Stars                                                                  │ great fun                                                                                                                                                                                                                                                  │
└─────────────┴─────────────┴─────────────┴────────────────┴────────────┴────────────────┴──────────────────────────────────────────────────────────────┴────────────────────────┴─────────────┴───────────────┴─────────────┴───────┴───────────────────┴─────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

2. Теперь определим новую таблицу `MergeTree` под названием `amazon_reviews` для хранения этих данных в ClickHouse:

```sql
CREATE TABLE amazon_reviews
(
    review_date Date,
    marketplace LowCardinality(String),
    customer_id UInt64,
    review_id String,
    product_id String,
    product_parent UInt64,
    product_title String,
    product_category LowCardinality(String),
    star_rating UInt8,
    helpful_votes UInt32,
    total_votes UInt32,
    vine Bool,
    verified_purchase Bool,
    review_headline String,
    review_body String
)
ENGINE = MergeTree
ORDER BY (review_date, product_category);
```

3. Следующая команда `INSERT` использует функцию таблицы `s3Cluster`, которая позволяет обрабатывать несколько файлов S3 параллельно, используя все узлы вашего кластера. Мы также используем подстановочный знак, чтобы вставить любой файл, который начинается с имени `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`:

```sql
INSERT INTO amazon_reviews
SELECT
   *
FROM s3Cluster(
    'default',
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet'
    );
```

:::tip
В ClickHouse Cloud название кластера - `default`. Измените `default` на имя вашего кластера... или используйте функцию таблицы `s3` (вместо `s3Cluster`), если у вас нет кластера.
:::

5. Этот запрос не занимает много времени - в среднем около 300,000 строк в секунду. В течение 5 минут вы должны увидеть все строки вставленными:

```sql
SELECT formatReadableQuantity(count())
FROM amazon_reviews;
```

```response
┌─formatReadableQuantity(count())─┐
│ 150.96 million                  │
└─────────────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

6. Давайте посмотрим, сколько пространства занимает наши данные:

```sql
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
ORDER BY size DESC;
```
Исходные данные занимали около 70Г, но в сжатом виде в ClickHouse они занимают около 30Г:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬──────rows─┬─part_count─┐
│ s3disk    │ 30.05 GiB  │ 70.47 GiB    │       2.35 │ 150957260 │         14 │
└───────────┴────────────┴──────────────┴────────────┴───────────┴────────────┘
```

## Примеры запросов {#example-queries}

7. Давайте выполним несколько запросов... вот 10 самых полезных отзывов в наборе данных:

```sql
SELECT
    product_title,
    review_headline
FROM amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10;
```

Обратите внимание, что запрос обрабатывает все 151M строк, но выполняется за меньшая одной секунды!

```response
┌─product_title────────────────────────────────────────────────────────────────────────────┬─review_headline───────────────────────────────────────────────────────┐
│ Kindle: Amazon's Original Wireless Reading Device (1st generation)                       │ Почему и как Kindle меняет всё                                           │
│ BIC Cristal For Her Ball Pen, 1.0mm, Black, 16ct (MSLP16-Blk)                            │ НАКОНЕЦ!                                                                │
│ The Mountain Kids 100% Cotton Three Wolf Moon T-Shirt                                    │ Двойной функциональный дизайн                                            │
│ Kindle Keyboard 3G, Free 3G + Wi-Fi, 6" E Ink Display                                    │ Kindle против Nook (обновлено)                                         │
│ Kindle Fire HD 7", Dolby Audio, Dual-Band Wi-Fi                                          │ Вы получаете то, за что платите                                          │
│ Kindle Fire (Предыдущее поколение - 1-е)                                                │ Отличное устройство, ЕСЛИ учитывать цену и функцию, с несколькими недостатками │
│ Fifty Shades of Grey: Book One of the Fifty Shades Trilogy (Fifty Shades of Grey Series) │ Написал ли подросток это???                                            │
│ Wheelmate Laptop Steering Wheel Desk                                                     │ Идеально для штурмана Звёздного флота                                   │
│ Kindle Wireless Reading Device (6" Display, U.S. Wireless)                               │ ОСТОРОЖНО с ЗНАЧИТЕЛЬНЫМИ РАЗНИЦАМИ между Kindle 1 и Kindle 2!       │
│ Tuscan Dairy Whole Vitamin D Milk, Gallon, 128 oz                                        │ Сделайте это вашим единственным запасом и хранилищем                   │
└──────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────┘

10 строк в наборе. Время: 0.897 сек. Обработано 150.96 миллионов строк, 15.36 ГБ (168.36 миллиона строк/с., 17.13 ГБ/с.)
```

8. Вот 10 продуктов на Amazon с наибольшим количеством отзывов:

```sql
SELECT
    any(product_title),
    count()
FROM amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

```response
┌─any(product_title)────────────────────────────┬─count()─┐
│ Candy Crush Saga                              │   50051 │
│ The Secret Society® - Hidden Mystery          │   41255 │
│ Google Chromecast HDMI Streaming Media Player │   35977 │
│ Minecraft                                     │   35129 │
│ Bosch Season 1                                │   33610 │
│ Gone Girl: A Novel                            │   33240 │
│ Subway Surfers                                │   32328 │
│ The Fault in Our Stars                        │   30149 │
│ Amazon.com eGift Cards                        │   28879 │
│ Crossy Road                                   │   28111 │
└───────────────────────────────────────────────┴─────────┘

10 строк в наборе. Время: 20.059 сек. Обработано 150.96 миллионов строк, 12.78 ГБ (7.53 миллиона строк/с., 637.25 МБ/с.)
```

9. Вот средние рейтинги отзывов по месяцам для каждого продукта (фактический [вопрос на собеседовании Amazon](https://datalemur.com/questions/sql-avg-review-ratings)!):

```sql
SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20;
```

Он вычисляет все средние значения по месяцам для каждого продукта, но мы вернули только 20 строк:

```response
┌──────month─┬─any(product_title)──────────────────────────────────────────────────────────────────────┬─avg_stars─┐
│ 2015-08-01 │ Mystiqueshapes Girls Ballet Tutu Neon Lime Green                                        │         4 │
│ 2015-08-01 │ Adult Ballet Tutu Yellow                                                                │         5 │
│ 2015-08-01 │ The Way Things Work: An Illustrated Encyclopedia of Technology                          │         5 │
│ 2015-08-01 │ Hilda Boswell's Treasury of Poetry                                                      │         5 │
│ 2015-08-01 │ Treasury of Poetry                                                                      │         5 │
│ 2015-08-01 │ Uncle Remus Stories                                                                     │         5 │
│ 2015-08-01 │ The Book of Daniel                                                                      │         5 │
│ 2015-08-01 │ Berenstains' B Book                                                                     │         5 │
│ 2015-08-01 │ The High Hills (Brambly Hedge)                                                          │       4.5 │
│ 2015-08-01 │ Fuzzypeg Goes to School (The Little Grey Rabbit library)                                │         5 │
│ 2015-08-01 │ Dictionary in French: The Cat in the Hat (Beginner Series)                              │         5 │
│ 2015-08-01 │ Windfallen                                                                              │         5 │
│ 2015-08-01 │ The Monk Who Sold His Ferrari: A Remarkable Story About Living Your Dreams              │         5 │
│ 2015-08-01 │ Illustrissimi: The Letters of Pope John Paul I                                          │         5 │
│ 2015-08-01 │ Social Contract: A Personal Inquiry into the Evolutionary Sources of Order and Disorder │         5 │
│ 2015-08-01 │ Mexico The Beautiful Cookbook: Authentic Recipes from the Regions of Mexico             │       4.5 │
│ 2015-08-01 │ Alanbrooke                                                                              │         5 │
│ 2015-08-01 │ Back to Cape Horn                                                                       │         4 │
│ 2015-08-01 │ Ovett: An Autobiography (Willow books)                                                  │         5 │
│ 2015-08-01 │ The Birds of West Africa (Collins Field Guides)                                         │         4 │
└────────────┴─────────────────────────────────────────────────────────────────────────────────────────┴───────────┘

20 строк в наборе. Время: 43.055 сек. Обработано 150.96 миллионов строк, 13.24 ГБ (3.51 миллиона строк/с., 307.41 МБ/с.)
Пиковое использование памяти: 41.73 GiB.
```

10. Вот общее количество голосов по категориям продуктов. Этот запрос выполняется быстро, потому что `product_category` является частью первичного ключа:

```sql
SELECT
    sum(total_votes),
    product_category
FROM amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
FORMAT PrettyCompactMonoBlock;
```

```response
┌─sum(total_votes)─┬─product_category─────────┐
│        103877874 │ Books                    │
│         25330411 │ Digital_Ebook_Purchase   │
│         23065953 │ Video DVD                │
│         18048069 │ Music                    │
│         17292294 │ Mobile_Apps              │
│         15977124 │ Health & Personal Care   │
│         13554090 │ PC                       │
│         13065746 │ Kitchen                  │
│         12537926 │ Home                     │
│         11067538 │ Beauty                   │
│         10418643 │ Wireless                 │
│          9089085 │ Toys                     │
│          9071484 │ Sports                   │
│          7335647 │ Electronics              │
│          6885504 │ Apparel                  │
│          6710085 │ Video Games              │
│          6556319 │ Camera                   │
│          6305478 │ Lawn and Garden          │
│          5954422 │ Office Products          │
│          5339437 │ Home Improvement         │
│          5284343 │ Outdoors                 │
│          5125199 │ Pet Products             │
│          4733251 │ Grocery                  │
│          4697750 │ Shoes                    │
│          4666487 │ Automotive               │
│          4361518 │ Digital_Video_Download   │
│          4033550 │ Tools                    │
│          3559010 │ Baby                     │
│          3317662 │ Home Entertainment       │
│          2559501 │ Video                    │
│          2204328 │ Furniture                │
│          2157587 │ Musical Instruments      │
│          1881662 │ Software                 │
│          1676081 │ Jewelry                  │
│          1499945 │ Watches                  │
│          1224071 │ Digital_Music_Purchase   │
│           847918 │ Luggage                  │
│           503939 │ Major Appliances         │
│           392001 │ Digital_Video_Games      │
│           348990 │ Personal_Care_Appliances │
│           321372 │ Digital_Software         │
│           169585 │ Mobile_Electronics       │
│            72970 │ Gift Card                │
└──────────────────┴──────────────────────────┘

43 строки в наборе. Время: 0.201 сек. Обработано 150.96 миллионов строк, 754.79 МБ (750.85 миллионов строк/с., 3.75 ГБ/с.)
```

11. Давайте найдем продукты, в отзывах которых слово **"ужасный"** встречается наиболее часто. Это большая задача - нужно обработать более 151M строк в поисках одного слова:

```sql
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon_reviews
WHERE position(review_body, 'awful') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```

Запрос выполняется всего за 4 секунды - что впечатляет - и результаты интересны для чтения:

```response
┌─product_id─┬─any(product_title)───────────────────────────────────────────────────────────────────────┬───avg(star_rating)─┬─count─┐
│ 0345803485 │ Fifty Shades of Grey: Book One of the Fifty Shades Trilogy (Fifty Shades of Grey Series) │ 1.3870967741935485 │   248 │
│ B007J4T2G8 │ Fifty Shades of Grey (Fifty Shades, Book 1)                                              │ 1.4439834024896265 │   241 │
│ B006LSZECO │ Gone Girl: A Novel                                                                       │ 2.2986425339366514 │   221 │
│ B00008OWZG │ St. Anger                                                                                │ 1.6565656565656566 │   198 │
│ B00BD99JMW │ Allegiant (Divergent Trilogy, Book 3)                                                    │ 1.8342541436464088 │   181 │
│ B0000YUXI0 │ Mavala Switzerland Mavala Stop Nail Biting                                               │  4.473684210526316 │   171 │
│ B004S8F7QM │ Cards Against Humanity                                                                   │  4.753012048192771 │   166 │
│ 031606792X │ Breaking Dawn (The Twilight Saga, Book 4)                                                │           1.796875 │   128 │
│ 006202406X │ Allegiant (Divergent Series)                                                             │ 1.4242424242424243 │    99 │
│ B0051VVOB2 │ Kindle Fire (Previous Generation - 1st)                                                  │ 2.7448979591836733 │    98 │
│ B00I3MP3SG │ Pilot                                                                                    │ 1.8762886597938144 │    97 │
│ 030758836X │ Gone Girl                                                                                │            2.15625 │    96 │
│ B0009X29WK │ Precious Cat Ultra Premium Clumping Cat Litter                                           │ 3.0759493670886076 │    79 │
│ B00JB3MVCW │ Noah                                                                                     │ 1.2027027027027026 │    74 │
│ B00BAXFECK │ The Goldfinch: A Novel (Pulitzer Prize for Fiction)                                      │  2.643835616438356 │    73 │
│ B00N28818A │ Amazon Prime Video                                                                       │ 1.4305555555555556 │    72 │
│ B007FTE2VW │ SimCity - Limited Edition                                                                │ 1.2794117647058822 │    68 │
│ 0439023513 │ Mockingjay (The Hunger Games)                                                            │ 2.6417910447761193 │    67 │
│ B000OCEWGW │ Liquid Ass                                                                               │             4.8125 │    64 │
│ B00178630A │ Diablo III - PC/Mac                                                                      │           1.671875 │    64 │
│ B005ZOBNOI │ The Fault in Our Stars                                                                   │  4.316666666666666 │    60 │
│ B00L9B7IKE │ The Girl on the Train: A Novel                                                           │ 2.0677966101694913 │    59 │
│ B003WUYPPG │ Unbroken: A World War II Story of Survival, Resilience, and Redemption                   │  4.620689655172414 │    58 │
│ B0064X7B4A │ Words With Friends                                                                       │ 2.2413793103448274 │    58 │
│ B007S6Y6VS │ Garden of Life Raw Organic Meal                                                          │ 2.8793103448275863 │    58 │
│ B000XUBFE2 │ The Book Thief                                                                           │  4.526315789473684 │    57 │
│ B00006HBUJ │ Star Wars: Episode II - Attack of the Clones (Widescreen Edition)                        │ 2.2982456140350878 │    57 │
│ B0006399FS │ How to Dismantle an Atomic Bomb                                                          │ 1.9821428571428572 │    56 │
│ B003ZSJ212 │ Star Wars: The Complete Saga (Episodes I-VI) (Packaging May Vary) [Blu-ray]              │  2.309090909090909 │    55 │
│ 193700788X │ Dead Ever After (Sookie Stackhouse/True Blood)                                           │ 1.5185185185185186 │    54 │
│ B004FYEZMQ │ Mass Effect 3                                                                            │  2.056603773584906 │    53 │
│ B000CFYAMC │ The Room                                                                                 │ 3.9615384615384617 │    52 │
│ B0012JY4G4 │ Color Oops Hair Color Remover Extra Strength 1 Each                                      │ 3.9019607843137254 │    51 │
│ B0031JK95S │ Garden of Life Raw Organic Meal                                                          │ 3.3137254901960786 │    51 │
│ B00CE18P0K │ Pilot                                                                                    │ 1.7142857142857142 │    49 │
│ B007VTVRFA │ SimCity - Limited Edition                                                                │ 1.2040816326530612 │    49 │
│ 0316015849 │ Twilight (The Twilight Saga, Book 1)                                                     │ 1.8979591836734695 │    49 │
│ B00DR0PDNE │ Google Chromecast HDMI Streaming Media Player                                            │ 2.5416666666666665 │    48 │
│ B000056OWC │ The First Years: 4-Stage Bath System                                                     │ 1.2127659574468086 │    47 │
│ B007IXWKUK │ Fifty Shades Darker (Fifty Shades, Book 2)                                               │ 1.6304347826086956 │    46 │
│ 1892112000 │ To Train Up a Child                                                                      │ 1.4130434782608696 │    46 │
│ 043935806X │ Harry Potter and the Order of the Phoenix (Book 5)                                       │  3.977272727272727 │    44 │
│ B003XF1XOQ │ Mockingjay (Hunger Games Trilogy, Book 3)                                                │  2.772727272727273 │    44 │
│ B00BGO0Q9O │ Fitbit Flex Wireless Wristband with Sleep Function, Black                                │ 1.9318181818181819 │    44 │
│ B0064X7FVE │ The Weather Channel: Forecast, Radar & Alerts                                            │ 1.5116279069767442 │    43 │
│ B0083PWAPW │ Kindle Fire HD 7", Dolby Audio, Dual-Band Wi-Fi                                          │  2.627906976744186 │    43 │
│ B00DD2B52Y │ Spring Breakers                                                                          │ 1.2093023255813953 │    43 │
│ B00192KCQ0 │ Death Magnetic                                                                           │ 3.5714285714285716 │    42 │
│ B004CFA9RS │ Divergent (Divergent Trilogy, Book 1)                                                    │ 3.1219512195121952 │    41 │
│ B0052QYLUM │ Infant Optics DXR-5 Portable Video Baby Monitor                                          │ 2.1463414634146343 │    41 │
└────────────┴──────────────────────────────────────────────────────────────────────────────────────────┴────────────────────┴───────┘

50 строк в наборе. Время: 4.072 сек. Обработано 150.96 миллионов строк, 68.93 ГБ (37.07 миллиона строк/с., 16.93 ГБ/с.)
Пиковое использование памяти: 1.82 GiB.
```

12. Мы можем выполнить тот же запрос снова, за исключением того, что на этот раз мы ищем **замечательный** в отзывах:

```sql
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon_reviews
WHERE position(review_body, 'awesome') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```

```response
┌─product_id─┬─any(product_title)────────────────────────────────────────────────────┬───avg(star_rating)─┬─count─┐
│ B00992CF6W │ Minecraft                                                             │  4.848130353039482 │  4787 │
│ B009UX2YAC │ Subway Surfers                                                        │  4.866720955483171 │  3684 │
│ B00QW8TYWO │ Crossy Road                                                           │  4.935217903415784 │  2547 │
│ B00DJFIMW6 │ Minion Rush: Despicable Me Official Game                              │  4.850450450450451 │  2220 │
│ B00AREIAI8 │ My Horse                                                              │  4.865313653136531 │  2168 │
│ B00I8Q77Y0 │ Flappy Wings (not Flappy Bird)                                        │ 4.8246561886051085 │  2036 │
│ B0054JZC6E │ 101-in-1 Games                                                        │  4.792542016806722 │  1904 │
│ B00G5LQ5MU │ Escape The Titanic                                                    │  4.724673710379117 │  1609 │
│ B0086700CM │ Temple Run                                                            │   4.87636130685458 │  1561 │
│ B009HKL4B8 │ The Sims Freeplay                                                     │  4.763942931258106 │  1542 │
│ B00I6IKSZ0 │ Pixel Gun 3D (Pocket Edition) - multiplayer shooter with skin creator │  4.849894291754757 │  1419 │
│ B006OC2ANS │ BLOOD & GLORY                                                         │ 4.8561538461538465 │  1300 │
│ B00FATEJYE │ Injustice: Gods Among Us (Kindle Tablet Edition)                      │  4.789265982636149 │  1267 │
│ B00B2V66VS │ Temple Run 2                                                          │  4.764705882352941 │  1173 │
│ B00JOT3HQ2 │ Geometry Dash Lite                                                    │  4.909747292418772 │  1108 │
│ B00DUGCLY4 │ Guess The Emoji                                                       │  4.813606710158434 │  1073 │
│ B00DR0PDNE │ Google Chromecast HDMI Streaming Media Player                         │  4.607276119402985 │  1072 │
│ B00FAPF5U0 │ Candy Crush Saga                                                      │  4.825757575757576 │  1056 │
│ B0051VVOB2 │ Kindle Fire (Previous Generation - 1st)                               │  4.600407747196738 │   981 │
│ B007JPG04E │ FRONTLINE COMMANDO                                                    │             4.8125 │   912 │
│ B00PTB7B34 │ Call of Duty®: Heroes                                                 │  4.876404494382022 │   890 │
│ B00846GKTW │ Style Me Girl - Free 3D Fashion Dressup                               │  4.785714285714286 │   882 │
│ B004S8F7QM │ Cards Against Humanity                                                │  4.931034482758621 │   754 │
│ B00FAX6XQC │ DEER HUNTER CLASSIC                                                   │  4.700272479564033 │   734 │
│ B00PSGW79I │ Buddyman: Kick                                                        │  4.888736263736264 │   728 │
│ B00CTQ6SIG │ The Simpsons: Tapped Out                                              │  4.793948126801153 │   694 │
│ B008JK6W5K │ Logo Quiz                                                             │  4.782106782106782 │   693 │
│ B00EDTSKLU │ Geometry Dash                                                         │  4.942028985507246 │   690 │
│ B00CSR2J9I │ Hill Climb Racing                                                     │  4.880059970014993 │   667 │
│ B00CRFAAYC │ Fab Tattoo Artist FREE                                                │  4.907435508345979 │   659 │
│ B005ZXWMUS │ Netflix                                                               │  4.722306525037936 │   659 │
│ B00DHQHQCE │ Battle Beach                                                          │  4.863287250384024 │   651 │
│ B00BGA9WK2 │ PlayStation 4 500GB Console [Old Model]                               │  4.688751926040061 │   649 │
│ B008Y7SMQU │ Logo Quiz - Fun Plus Free                                             │             4.7888 │   625 │
│ B0083PWAPW │ Kindle Fire HD 7", Dolby Audio, Dual-Band Wi-Fi                       │  4.593900481540931 │   623 │
│ B008XG1X18 │ Pinterest                                                             │ 4.8148760330578515 │   605 │
│ B007SYWFRM │ Ice Age Village                                                       │ 4.8566666666666665 │   600 │
│ B00K7WGUKA │ Don't Tap The White Tile (Piano Tiles)                                │  4.922689075630252 │   595 │
│ B00BWYQ9YE │ Kindle Fire HDX 7", HDX Display (Предыдущее поколение - 3-е)           │  4.649913344887349 │   577 │
│ B00IZLM8MY │ High School Story                                                     │  4.840425531914893 │   564 │
│ B004MC8CA2 │ Bible                                                                 │  4.884476534296029 │   554 │
│ B00KNWYDU8 │ Dragon City                                                           │  4.861111111111111 │   540 │
│ B009ZKSPDK │ Survivalcraft                                                         │  4.738317757009346 │   535 │
│ B00A4O6NMG │ My Singing Monsters                                                   │  4.845559845559846 │   518 │
│ B002MQYOFW │ The Hunger Games (Hunger Games Trilogy, Book 1)                       │  4.846899224806202 │   516 │
│ B005ZFOOE8 │ iHeartRadio – Free Music & Internet Radio                             │  4.837301587301587 │   504 │
│ B00AIUUXHC │ Hungry Shark Evolution                                                │  4.846311475409836 │   488 │
│ B00E8KLWB4 │ The Secret Society® - Hidden Mystery                                  │  4.669438669438669 │   481 │
│ B006D1ONE4 │ Where's My Water?                                                     │  4.916317991631799 │   478 │
│ B00G6ZTM3Y │ Terraria                                                              │  4.728421052631579 │   475 │
└────────────┴───────────────────────────────────────────────────────────────────────┴────────────────────┴───────┘

50 строк в наборе. Время: 4.079 сек. Обработано 150.96 миллионов строк, 68.95 ГБ (37.01 миллиона строк/с., 16.90 ГБ/с.)
Пиковое использование памяти: 2.18 GiB.
```
