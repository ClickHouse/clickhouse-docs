---
description: 'Dataset with over 100 million records containing information about places on a map, such as shops, 
restaurants, parks, playgrounds, and monuments.'
sidebar_label: 'Foursquare places'
slug: /getting-started/example-datasets/foursquare-places
title: 'Foursquare places'
keywords: ['visualizing']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## Dataset {#dataset}

このFoursquareのデータセットは、[ダウンロード](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)可能で、Apache 2.0ライセンスの下で無料で使用できます。

商業的なポイントオブインタレスト（POI）のレコードが1億を超え、店舗、レストラン、公園、遊び場、モニュメントなどを含みます。また、それらの場所に関するカテゴリやソーシャルメディア情報などの追加メタデータも含まれています。

## Data exploration {#data-exploration}

データを探索するために、[`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使います。これは小さなコマンドラインツールで、全機能のClickHouseエンジンを提供しますが、ClickHouse Cloud、`clickhouse-client`、または`chDB`を使用することもできます。

データが格納されているs3バケットからデータを選択するために、次のクエリを実行します：

```sql title="クエリ"
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*') LIMIT 1
```

```response title="レスポンス"
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

多くのフィールドに`ᴺᵁᴸᴸ`が見られるため、クエリに条件を追加して、より使用可能なデータを取得することができます：

```sql title="クエリ"
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

次のクエリを実行して、`DESCRIBE`を使用してデータの自動推測されたスキーマを表示します：

```sql title="クエリ"
DESCRIBE s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

```response title="レスポンス"
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

データをディスクに永続化したい場合は、`clickhouse-server`またはClickHouse Cloudを使用できます。

テーブルを作成するには、次のコマンドを実行します：

```sql title="クエリ"
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

いくつかのカラムで使用されている[`LowCardinality`](/sql-reference/data-types/lowcardinality)データ型に注意してください。これはデータ型の内部表現を辞書エンコードに変更します。辞書エンコードされたデータを操作することで、多くのアプリケーションにおいて`SELECT`クエリのパフォーマンスが大幅に向上します。

さらに、2つの`UInt32`の`MATERIALIZED`カラム`mercator_x`と`mercator_y`が作成され、緯度/経度の座標を[Web Mercator投影](https://en.wikipedia.org/wiki/Web_Mercator_projection)にマッピングします。これにより地図がタイルに簡単に分割できます：

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

各カラムで何が起きているかを説明しましょう。

**mercator_x**

このカラムは経度の値をMercator投影のX座標に変換します：

- `longitude + 180`は経度範囲を[-180, 180]から[0, 360]にシフトします
- 360で割ることで、この値を0と1の間の値に正規化します
- `0xFFFFFFFF`（最大の32ビット符号なし整数の16進数）でこの正規化された値を32ビット整数の全範囲にスケールします

**mercator_y**

このカラムは緯度の値をMercator投影のY座標に変換します：

- `latitude + 90`は緯度を[-90, 90]から[0, 180]にシフトします
- 360で割り、pi()を掛けて三角関数のためにラジアンに変換します
- `log(tan(...))`部分がMercator投影の公式の核心です
- `0xFFFFFFFF`で32ビット整数の範囲にスケールします

`MATERIALIZED`を指定することで、ClickHouseはデータを`INSERT`する際にこれらのカラムの値を計算しなければなりません。これにより、`INSERT`ステートメントで元のデータスキーマの一部でないこれらのカラムを指定する必要がなくなります。

テーブルは`mortonEncode(mercator_x, mercator_y)`で並べ替えられ、`mercator_x`と`mercator_y`のZ-order空間充填曲線を生成し、地理空間クエリのパフォーマンスを大幅に向上させます。このZ-order曲線による並び替えにより、データが物理的に空間的近接性によって整理されます：

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

より速い検索のために、2つの`minmax`インデックスも作成されます：

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

ご覧のとおり、ClickHouseはリアルタイムマッピングアプリケーションに必要なすべてを備えています！

データをロードするには、次のクエリを実行します：

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## Visualizing the data {#data-visualization}

このデータセットで何ができるかを確認するには、[adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219)をご覧ください。adsb.exposedは元々共同創設者でCTOのAlexey MilovidovによってADS-B（自動依存監視放送）フライトデータを視覚化するために構築されました。これは1000倍大きなデータです。会社のハッカソン中に、AlexeyはFoursquareのデータをこのツールに追加しました。

以下に、私たちのお気に入りの視覚化をいくつか紹介します。お楽しみください。

<Image img={visualization_1} size="md" alt="ヨーロッパのポイントオブインタレストの密度マップ"/>

<Image img={visualization_2} size="md" alt="日本の酒場"/>

<Image img={visualization_3} size="md" alt="ATM"/>

<Image img={visualization_4} size="md" alt="国別に分類されたポイントオブインタレストの地図"/>


