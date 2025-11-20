---
description: 'Набор данных с более чем 100 миллионами записей, содержащих информацию о местах на карте: магазинах, ресторанах, парках, детских площадках и памятниках.'
sidebar_label: 'Foursquare places'
slug: /getting-started/example-datasets/foursquare-places
title: 'Foursquare places'
keywords: ['визуализация']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';


## Набор данных {#dataset}

Этот набор данных от Foursquare доступен для [скачивания](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)
и бесплатного использования по лицензии Apache 2.0.

Он содержит более 100 миллионов записей о коммерческих объектах (POI),
таких как магазины, рестораны, парки, детские площадки и памятники. Также включены
дополнительные метаданные об этих местах, такие как категории и информация
из социальных сетей.


## Исследование данных {#data-exploration}

Для исследования данных мы будем использовать [`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — небольшую утилиту командной строки,
которая предоставляет полный движок ClickHouse, хотя вы также можете
использовать ClickHouse Cloud, `clickhouse-client` или даже `chDB`.

Запустите следующий запрос для выбора данных из S3-бакета, в котором хранятся данные:

```sql title="Запрос"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*') LIMIT 1
```

```response title="Ответ"
Row 1:
──────
fsq_place_id:        4e1ef76cae60cd553dec233f
name:                @VirginAmerica In-flight Via @Gogo
latitude:            37.62120111687914
longitude:           -122.39003793803701
address:             ᴺᵁᴸᴸ
locality:            ᴺᵁᴸᴸ
region:              ᴺᵁᴸᴸ
postcode:            ᴺᵁᴸᴸ
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             US
date_created:        2011-07-14
date_refreshed:      2018-07-05
date_closed:         2018-07-05
tel:                 ᴺᵁᴸᴸ
website:             ᴺᵁᴸᴸ
email:               ᴺᵁᴸᴸ
facebook_id:         ᴺᵁᴸᴸ
instagram:           ᴺᵁᴸᴸ
twitter:             ᴺᵁᴸᴸ
fsq_category_ids:    ['4bf58dd8d48988d1f7931735']
fsq_category_labels: ['Travel and Transportation > Transport Hub > Airport > Plane']
placemaker_url:      https://foursquare.com/placemakers/review-place/4e1ef76cae60cd553dec233f
geom:                �^��a�^@Bσ���
bbox:                (-122.39003793803701,37.62120111687914,-122.39003793803701,37.62120111687914)
```

Мы видим, что довольно много полей содержат `ᴺᵁᴸᴸ`, поэтому мы можем добавить дополнительные условия
к нашему запросу, чтобы получить более полезные данные:

```sql title="Запрос"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
   WHERE address IS NOT NULL AND postcode IS NOT NULL AND instagram IS NOT NULL LIMIT 1
```


```response
Row 1:
──────
fsq_place_id:        59b2c754b54618784f259654
name:                Villa 722
latitude:            ᴺᵁᴸᴸ
longitude:           ᴺᵁᴸᴸ
address:             Gijzenveldstraat 75
locality:            Zutendaal
region:              Limburg
postcode:            3690
admin_region:        ᴺᵁᴸᴸ
post_town:           ᴺᵁᴸᴸ
po_box:              ᴺᵁᴸᴸ
country:             ᴺᵁᴸᴸ
date_created:        2017-09-08
date_refreshed:      2020-01-25
date_closed:         ᴺᵁᴸᴸ
tel:                 ᴺᵁᴸᴸ
website:             https://www.landal.be
email:               ᴺᵁᴸᴸ
facebook_id:         522698844570949 -- 522.70 trillion
instagram:           landalmooizutendaal
twitter:             landalzdl
fsq_category_ids:    ['56aa371be4b08b9a8d5734e1']
fsq_category_labels: ['Путешествия и транспорт > Размещение > Аренда жилья на время отпуска']
placemaker_url:      https://foursquare.com/placemakers/review-place/59b2c754b54618784f259654
geom:                ᴺᵁᴸᴸ
bbox:                (NULL,NULL,NULL,NULL)
```

Выполните следующий запрос, чтобы просмотреть автоматически определённую схему данных с помощью команды `DESCRIBE`:

```sql title="Query"
DESCRIBE s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

```response title="Response"
    ┌─name────────────────┬─type────────────────────────┬
 1. │ fsq_place_id        │ Nullable(String)            │
 2. │ name                │ Nullable(String)            │
 3. │ latitude            │ Nullable(Float64)           │
 4. │ longitude           │ Nullable(Float64)           │
 5. │ address             │ Nullable(String)            │
 6. │ locality            │ Nullable(String)            │
 7. │ region              │ Nullable(String)            │
 8. │ postcode            │ Nullable(String)            │
 9. │ admin_region        │ Nullable(String)            │
10. │ post_town           │ Nullable(String)            │
11. │ po_box              │ Nullable(String)            │
12. │ country             │ Nullable(String)            │
13. │ date_created        │ Nullable(String)            │
14. │ date_refreshed      │ Nullable(String)            │
15. │ date_closed         │ Nullable(String)            │
16. │ tel                 │ Nullable(String)            │
17. │ website             │ Nullable(String)            │
18. │ email               │ Nullable(String)            │
19. │ facebook_id         │ Nullable(Int64)             │
20. │ instagram           │ Nullable(String)            │
21. │ twitter             │ Nullable(String)            │
22. │ fsq_category_ids    │ Array(Nullable(String))     │
23. │ fsq_category_labels │ Array(Nullable(String))     │
24. │ placemaker_url      │ Nullable(String)            │
25. │ geom                │ Nullable(String)            │
26. │ bbox                │ Tuple(                     ↴│
    │                     │↳    xmin Nullable(Float64),↴│
    │                     │↳    ymin Nullable(Float64),↴│
    │                     │↳    xmax Nullable(Float64),↴│
    │                     │↳    ymax Nullable(Float64)) │
    └─────────────────────┴─────────────────────────────┘
```


## Загрузка данных в ClickHouse {#loading-the-data}

Если вы хотите сохранить данные на диске, можно использовать `clickhouse-server`
или ClickHouse Cloud.

Чтобы создать таблицу, выполните следующую команду:

```sql title="Запрос"
CREATE TABLE foursquare_mercator
(
    fsq_place_id String,
    name String,
    latitude Float64,
    longitude Float64,
    address String,
    locality String,
    region LowCardinality(String),
    postcode LowCardinality(String),
    admin_region LowCardinality(String),
    post_town LowCardinality(String),
    po_box LowCardinality(String),
    country LowCardinality(String),
    date_created Nullable(Date),
    date_refreshed Nullable(Date),
    date_closed Nullable(Date),
    tel String,
    website String,
    email String,
    facebook_id String,
    instagram String,
    twitter String,
    fsq_category_ids Array(String),
    fsq_category_labels Array(String),
    placemaker_url String,
    geom String,
    bbox Tuple(
        xmin Nullable(Float64),
        ymin Nullable(Float64),
        xmax Nullable(Float64),
        ymax Nullable(Float64)
    ),
    category LowCardinality(String) ALIAS fsq_category_labels[1],
    mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
    mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
    INDEX idx_x mercator_x TYPE minmax,
    INDEX idx_y mercator_y TYPE minmax
)
ORDER BY mortonEncode(mercator_x, mercator_y)
```

Обратите внимание на использование типа данных [`LowCardinality`](/sql-reference/data-types/lowcardinality)
для нескольких столбцов, который изменяет внутреннее представление типов данных
на словарно-кодированное. Работа со словарно-кодированными данными значительно
повышает производительность запросов `SELECT` во многих приложениях.

Кроме того, создаются два столбца `UInt32` `MATERIALIZED` — `mercator_x` и `mercator_y`,
которые преобразуют координаты широты/долготы в [проекцию Web Mercator](https://en.wikipedia.org/wiki/Web_Mercator_projection)
для упрощения сегментации карты на тайлы:

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

Разберём, что происходит в каждом столбце.

**mercator_x**

Этот столбец преобразует значение долготы в координату X в проекции Mercator:

- `longitude + 180` сдвигает диапазон долготы с [-180, 180] на [0, 360]
- Деление на 360 нормализует это значение в диапазон от 0 до 1
- Умножение на `0xFFFFFFFF` (шестнадцатеричное представление максимального 32-битного беззнакового целого числа) масштабирует это нормализованное значение на полный диапазон 32-битного целого числа

**mercator_y**

Этот столбец преобразует значение широты в координату Y в проекции Mercator:

- `latitude + 90` сдвигает широту с [-90, 90] на [0, 180]
- Деление на 360 и умножение на pi() преобразует значение в радианы для тригонометрических функций
- Часть `log(tan(...))` является ядром формулы проекции Mercator
- Умножение на `0xFFFFFFFF` масштабирует значение на полный диапазон 32-битного целого числа

Указание `MATERIALIZED` гарантирует, что ClickHouse вычисляет значения для этих
столбцов при выполнении `INSERT` данных, без необходимости указывать эти столбцы (которые не
являются частью исходной схемы данных) в операторе `INSERT`.

Таблица упорядочена по `mortonEncode(mercator_x, mercator_y)`, что создаёт
Z-образную заполняющую пространство кривую для `mercator_x`, `mercator_y` с целью значительного
повышения производительности геопространственных запросов. Такое упорядочивание по Z-кривой обеспечивает
физическую организацию данных по пространственной близости:

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

Также создаются два индекса `minmax` для ускорения поиска:

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

Как видите, ClickHouse имеет всё необходимое для приложений
картографирования в реальном времени!

Выполните следующий запрос для загрузки данных:


```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```


## Визуализация данных {#data-visualization}

Чтобы увидеть, что можно сделать с этим набором данных, посетите [adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219).
adsb.exposed был изначально создан сооснователем и техническим директором Алексеем Миловидовым для визуализации данных полётов ADS-B (Automatic Dependent Surveillance-Broadcast),
объём которых в 1000 раз больше. Во время корпоративного хакатона Алексей добавил в инструмент данные Foursquare.

Ниже представлены некоторые из наших любимых визуализаций для вашего ознакомления.

<Image
  img={visualization_1}
  size='md'
  alt='Карта плотности точек интереса в Европе'
/>

<Image img={visualization_2} size='md' alt='Сакэ-бары в Японии' />

<Image img={visualization_3} size='md' alt='Банкоматы' />

<Image
  img={visualization_4}
  size='md'
  alt='Карта Европы с точками интереса, классифицированными по странам'
/>
