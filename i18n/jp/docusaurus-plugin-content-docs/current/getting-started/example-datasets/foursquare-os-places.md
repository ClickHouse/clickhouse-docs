---
description: '地図上のショップ、レストラン、公園、遊び場、記念碑などの場所に関する情報を含む、1億件超のレコードからなるデータセット。'
sidebar_label: 'Foursquare places'
slug: /getting-started/example-datasets/foursquare-places
title: 'Foursquare places'
keywords: ['可視化']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## データセット {#dataset}

Foursquare によるこのデータセットは、[ダウンロード](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)
して利用でき、Apache License 2.0 の下で無償で使用できます。

このデータセットには、店舗、レストラン、公園、遊び場、記念碑などの商用のポイント・オブ・インタレスト (POI) の
1 億件以上のレコードが含まれています。さらに、それらの場所に関するカテゴリやソーシャルメディア情報といった
追加のメタデータも含まれています。

## データ探索 {#data-exploration}

データ探索には、[`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を使用します。これはフル機能の ClickHouse エンジンを提供する軽量なコマンドラインツールですが、代わりに
ClickHouse Cloud や `clickhouse-client`、あるいは `chDB` を使用することもできます。

データが保存されている S3 バケットからデータを取得するには、次のクエリを実行します。

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

`ᴺᵁᴸᴸ` になっているフィールドがかなり多いことが分かるので、
より扱いやすいデータを取得できるよう、クエリにいくつか条件を追加します。

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

`DESCRIBE` を使用して、データから自動的に推論されたスキーマを確認するには、次のクエリを実行します。

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

## データを ClickHouse に取り込む {#loading-the-data}

データをディスクに永続化したい場合は、`clickhouse-server`
または ClickHouse Cloud を使用できます。

テーブルを作成するには、次のコマンドを実行します。

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

いくつかのカラムでは [`LowCardinality`](/sql-reference/data-types/lowcardinality)
データ型が使用されていることに注意してください。これは内部的なデータ表現を
辞書エンコード形式に変更します。辞書エンコードされたデータ上で処理を行うことで、
多くのアプリケーションにおいて `SELECT` クエリのパフォーマンスが大幅に向上します。

さらに、2 つの `UInt32` 型の `MATERIALIZED` カラム `mercator_x` と `mercator_y` が作成され、
lat/lon 座標を [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)
にマッピングすることで、地図をタイルに分割しやすくしています。

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

上記で各カラムごとに何が行われているかを分解して説明します。

**mercator&#95;x**

このカラムは、経度をメルカトル図法における X 座標に変換します：

* `longitude + 180` によって、経度の範囲を [-180, 180] から [0, 360] にシフトします
* 360 で割ることで、この値を 0〜1 の範囲に正規化します
* `0xFFFFFFFF`（32 ビット符号なし整数の最大値を表す 16 進数）を掛けることで、この正規化された値を 32 ビット整数の全範囲にスケーリングします

**mercator&#95;y**

このカラムは、緯度をメルカトル図法における Y 座標に変換します：

* `latitude + 90` によって、緯度の範囲を [-90, 90] から [0, 180] にシフトします
* 360 で割り、さらに pi() を掛けることで、三角関数向けにラジアンへ変換します
* `log(tan(...))` の部分がメルカトル図法の中核となる数式です
* `0xFFFFFFFF` を掛けることで、32 ビット整数の全範囲へスケーリングします

`MATERIALIZED` を指定することで、元データのスキーマには含まれないこれらのカラムを `INSERT` 文で明示的に指定しなくても、ClickHouse がデータを `INSERT` する際にこれらのカラムの値を自動的に計算します。

テーブルは `mortonEncode(mercator_x, mercator_y)` によって並び替えられます。これは `mercator_x` と `mercator_y` から Z オーダーの空間充填曲線を生成し、ジオスペーシャルクエリの性能を大幅に向上させます。この Z オーダー曲線による並び替えにより、データは物理的に空間的な近接性に基づいて配置されます。

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

さらに、検索を高速化するために、`minmax` インデックスが 2 つ作成されます。

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

ご覧のとおり、ClickHouse にはリアルタイムマッピングアプリケーションに必要な機能がすべて揃っています。

次のクエリを実行してデータを読み込んでください。

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## データの可視化 {#data-visualization}

このデータセットでどのようなことができるかを知るには、[adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219) を参照してください。
adsb.exposed は、共同創業者兼 CTO の Alexey Milovidov によって、1000 倍の規模がある ADS-B (Automatic Dependent Surveillance-Broadcast) フライトデータを可視化するために最初に構築されました。社内ハッカソンの際に、Alexey がこのツールに Foursquare のデータを追加しました。

以下に、私たちのお気に入りの可視化の一部を掲載します。

<Image img={visualization_1} size="md" alt="ヨーロッパにおける関心地点の密度マップ"/>

<Image img={visualization_2} size="md" alt="日本の日本酒バー"/>

<Image img={visualization_3} size="md" alt="ATM"/>

<Image img={visualization_4} size="md" alt="国別に分類されたヨーロッパの関心地点の地図"/>