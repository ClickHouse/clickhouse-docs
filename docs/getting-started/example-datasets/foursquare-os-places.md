---
description: 'Dataset with over 100 million records containing information about places on a map, such as shops, 
restaurants, parks, playgrounds, and monuments.'
sidebar_label: 'Foursquare places'
slug: /getting-started/example-datasets/foursquare-places
title: 'Foursquare places'
keywords: ['visualizing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## Dataset {#dataset}

This dataset by Foursquare is available to [download](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)
and to use for free under the Apache 2.0 license.

It contains over 100 million records of commercial points-of-interest (POI), 
such as shops, restaurants, parks, playgrounds, and monuments. It also includes
additional metadata about those places, such as categories and social media
information.

## Data exploration {#data-exploration}

For exploring the data we'll use [`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local), a small command-line tool 
that provides the full ClickHouse engine, although you could also use 
ClickHouse Cloud, `clickhouse-client` or even `chDB`.

Run the following query to select the data from the s3 bucket where the data is stored:

```sql title="Query"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*') LIMIT 1
```

```response title="Response"
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

We see that quite a few fields have `ᴺᵁᴸᴸ`, so we can add some additional conditions
to our query to get back more usable data:

```sql title="Query"
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
fsq_category_labels: ['Travel and Transportation > Lodging > Vacation Rental']
placemaker_url:      https://foursquare.com/placemakers/review-place/59b2c754b54618784f259654
geom:                ᴺᵁᴸᴸ
bbox:                (NULL,NULL,NULL,NULL)
```

Run the following query to view the automatically inferred schema of the data using
the `DESCRIBE`:

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

## Loading the data into ClickHouse {#loading-the-data}

If you'd like to persist the data on disk, you can use `clickhouse-server` 
or ClickHouse Cloud. 

To create the table, run the following command: 

```sql title="Query"
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

Take note of the use of the [`LowCardinality`](/sql-reference/data-types/lowcardinality) 
data type for several columns which changes the internal representation of the data
types to be dictionary-encoded. Operating with dictionary encoded data significantly
increases the performance of `SELECT` queries for many applications.

Additionally, two `UInt32` `MATERIALIZED` columns, `mercator_x` and `mercator_y` are created
that map the lat/lon coordinates to the [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)
for easier segmentation of the map into tiles:

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

Let's break down what is happening above for each column.

**mercator_x**

This column converts a longitude value into an X coordinate in the Mercator projection:

- `longitude + 180` shifts the longitude range from [-180, 180] to [0, 360]
- Dividing by 360 normalizes this to a value between 0 and 1
- Multiplying by `0xFFFFFFFF` (hex for maximum 32-bit unsigned integer) scales this normalized value to the full range of a 32-bit integer

**mercator_y**

This column converts a latitude value into a Y coordinate in the Mercator projection:

- `latitude + 90` shifts latitude from [-90, 90] to [0, 180]
- Dividing by 360 and multiplying by pi() converts to radians for the trigonometric functions
- The `log(tan(...))` part is the core of the Mercator projection formula
- multiplying by `0xFFFFFFFF` scales to the full 32-bit integer range

Specifying `MATERIALIZED` makes sure that ClickHouse calculates the values for these 
columns when we `INSERT` the data, without having to specify these columns (which are not
part of the original data schema) in the `INSERT statement.

The table is ordered by `mortonEncode(mercator_x, mercator_y)` which produces a 
Z-order space-filling curve of `mercator_x`, `mercator_y` in order to significantly 
improve geospatial query performance. This Z-order curve ordering ensures data is 
physically organized by spatial proximity:

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

Two `minmax` indices are also created for faster search:

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

As you can see, ClickHouse has absolutely everything you need for real-time
mapping applications!

Run the following query to load the data:

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## Visualizing the data {#data-visualization}

To see what's possible with this dataset, check out [adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219).
adsb.exposed was originally built by co-founder and CTO Alexey Milovidov to visualize ADS-B (Automatic Dependent Surveillance-Broadcast) 
flight data, which is 1000x times larger. During a company hackathon Alexey added the Foursquare data to the tool.

Some of our favourite visualizations are produced here below for you to enjoy.

<Image img={visualization_1} size="md" alt="Density map of points of interest in Europe"/>

<Image img={visualization_2} size="md" alt="Sake bars in Japan"/>

<Image img={visualization_3} size="md" alt="ATMs"/>

<Image img={visualization_4} size="md" alt="Map of Europe with points of interest categorised by country"/>
