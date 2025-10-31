---
'description': 'マップ上の場所に関する情報を含む、1億件以上のレコードからなるデータセットで、ショップ、レストラン、公園、遊び場、そして記念碑などが含まれます。'
'sidebar_label': 'Foursquare プレース'
'slug': '/getting-started/example-datasets/foursquare-places'
'title': 'Foursquare プレース'
'keywords':
- 'visualizing'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';

## Dataset {#dataset}

このデータセットは Foursquare により提供されており、[ダウンロード](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)が可能で、Apache 2.0 ライセンスの下で自由に使用できます。

このデータセットには、店舗、レストラン、公園、遊び場、記念碑などの商業的なポイントオブインタレスト (POI) の 1 億件以上のレコードが含まれています。また、これらの場所に関するカテゴリやソーシャルメディア情報などの追加メタデータも含まれています。

## Data exploration {#data-exploration}

データを探索するために、[`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用します。これはフル機能の ClickHouse エンジンを提供する小さなコマンドラインツールですが、ClickHouse Cloud、`clickhouse-client`、または `chDB` を使用することもできます。

以下のクエリを実行して、データが保存されている s3 バケットからデータを選択します：

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

多くのフィールドに `ᴺᵁᴸᴸ` が含まれていることがわかりますので、より使いやすいデータを取得するためにクエリに追加の条件を加えます：

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

以下のクエリを実行して、`DESCRIBE` を使用してデータの自動的に推定されたスキーマを表示します：

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

ディスクにデータを永続化したい場合は、`clickhouse-server` または ClickHouse Cloud を使用できます。

テーブルを作成するには、以下のコマンドを実行します：

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

いくつかのカラムに対して [`LowCardinality`](/sql-reference/data-types/lowcardinality) データ型が使用されていることに注目してください。これにより、データ型の内部表現が辞書エンコードに変更されます。辞書エンコードされたデータで操作することで、多くのアプリケーションの `SELECT` クエリの性能が大幅に向上します。

さらに、2 つの `UInt32` の `MATERIALIZED` カラムである `mercator_x` と `mercator_y` が作成され、緯度/経度座標を [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection) にマッピングし、地図をタイルに簡単にセグメント化します：

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

上記の各カラムで何が起こっているのかを分解してみましょう。

**mercator_x**

このカラムは、経度の値をメルカトル投影の X 座標に変換します：

- `longitude + 180` は経度の範囲を [-180, 180] から [0, 360] に移動します
- 360 で割ることで、これを 0 から 1 の範囲の値に正規化します
- `0xFFFFFFFF`（32 ビット符号なし整数の最大値の16進数）を掛けることで、この正規化された値を 32 ビット整数のフルレンジにスケーリングします

**mercator_y**

このカラムは、緯度の値をメルカトル投影の Y 座標に変換します：

- `latitude + 90` は緯度を [-90, 90] から [0, 180] に移動します
- 360 で割って pi() を掛けることで、三角関数用にラジアンに変換します
- `log(tan(...))` の部分はメルカトル投影の公式のコアです
- `0xFFFFFFFF` を掛けることで、32 ビット整数のフルレンジにスケーリングします

`MATERIALIZED` を指定することで、ClickHouse はデータを `INSERT` する際にこれらのカラムの値を計算し、`INSERT statement` にこれらのカラム（もともとのデータスキーマの一部ではない）を指定する必要がありません。

テーブルは `mortonEncode(mercator_x, mercator_y)` によって順序付けられており、`mercator_x` と `mercator_y` の Z-オーダー空間充填曲線を生成し、地理空間クエリのパフォーマンスを大幅に向上させます。この Z-オーダー曲線の順序付けにより、データが物理的に空間的な近接性によって整理されます：

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

さらに、より高速な検索のために 2 つの `minmax` インデックスも作成されます：

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

ご覧の通り、ClickHouse にはリアルタイムマッピングアプリケーションに必要なすべてのものがあります！

以下のクエリを実行してデータをロードします：

```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```

## Visualizing the data {#data-visualization}

このデータセットで何が可能かを確認するには、[adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219)をチェックしてください。
adsb.exposed は、共同創設者で CTO の Alexey Milovidov によって ADS-B（Automatic Dependent Surveillance-Broadcast）フライトデータを視覚化するために元々構築されました。これは 1000 倍も大きなデータです。会社のハッカソン中に、Alexey はこのツールに Foursquare データを追加しました。

以下には、私たちのお気に入りの視覚化の一部を掲載しますので、お楽しみください。

<Image img={visualization_1} size="md" alt="ヨーロッパにおけるポイントオブインタレストの密度マップ"/>

<Image img={visualization_2} size="md" alt="日本の酒バー"/>

<Image img={visualization_3} size="md" alt="ATM"/>

<Image img={visualization_4} size="md" alt="国ごとに分類されたポイントオブインタレストのあるヨーロッパの地図"/>
