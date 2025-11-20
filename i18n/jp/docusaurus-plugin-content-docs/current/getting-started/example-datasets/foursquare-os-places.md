---
description: '地図上の店舗、レストラン、公園、遊び場、記念碑などのスポット情報を、1億件以上のレコードで収録したデータセット。'
sidebar_label: 'Foursquare のスポット'
slug: /getting-started/example-datasets/foursquare-places
title: 'Foursquare のスポット'
keywords: ['visualizing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/getting-started/example-datasets/visualization_1.png';
import visualization_2 from '@site/static/images/getting-started/example-datasets/visualization_2.png';
import visualization_3 from '@site/static/images/getting-started/example-datasets/visualization_3.png';
import visualization_4 from '@site/static/images/getting-started/example-datasets/visualization_4.png';


## データセット {#dataset}

Foursquareが提供するこのデータセットは、Apache 2.0ライセンスの下で無料で[ダウンロード](https://docs.foursquare.com/data-products/docs/access-fsq-os-places)および利用が可能です。

このデータセットには、店舗、レストラン、公園、遊び場、モニュメントなどの商業施設や関心地点(POI)の情報が1億件以上収録されています。また、カテゴリやソーシャルメディア情報など、これらの地点に関する追加のメタデータも含まれています。


## データ探索 {#data-exploration}

データを探索するために、完全なClickHouseエンジンを提供する小型のコマンドラインツールである[`clickhouse-local`](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用します。ClickHouse Cloud、`clickhouse-client`、または`chDB`を使用することもできます。

データが保存されているS3バケットからデータを選択するには、以下のクエリを実行します:

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

多くのフィールドが`ᴺᵁᴸᴸ`であることがわかります。より有用なデータを取得するために、クエリに追加の条件を加えることができます:

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
fsq_category_labels: ['旅行・交通 > 宿泊 > バケーションレンタル']
placemaker_url:      https://foursquare.com/placemakers/review-place/59b2c754b54618784f259654
geom:                ᴺᵁᴸᴸ
bbox:                (NULL,NULL,NULL,NULL)
```

`DESCRIBE` を使用して、自動的に推論されたデータのスキーマを表示するには、次のクエリを実行します。

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


## ClickHouseへのデータ読み込み {#loading-the-data}

データをディスクに永続化したい場合は、`clickhouse-server`またはClickHouse Cloudを使用できます。

テーブルを作成するには、以下のコマンドを実行します:

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

複数のカラムで[`LowCardinality`](/sql-reference/data-types/lowcardinality)データ型を使用している点に注目してください。これにより、データ型の内部表現が辞書エンコード形式に変更されます。辞書エンコードされたデータを使用することで、多くのアプリケーションにおいて`SELECT`クエリのパフォーマンスが大幅に向上します。

さらに、2つの`UInt32`型`MATERIALIZED`カラム`mercator_x`と`mercator_y`が作成されており、緯度経度座標を[Webメルカトル図法](https://en.wikipedia.org/wiki/Web_Mercator_projection)にマッピングすることで、地図をタイルに分割しやすくしています:

```sql
mercator_x UInt32 MATERIALIZED 0xFFFFFFFF * ((longitude + 180) / 360),
mercator_y UInt32 MATERIALIZED 0xFFFFFFFF * ((1 / 2) - ((log(tan(((latitude + 90) / 360) * pi())) / 2) / pi())),
```

各カラムで何が行われているかを詳しく見ていきましょう。

**mercator_x**

このカラムは経度の値をメルカトル図法のX座標に変換します:

- `longitude + 180`は経度の範囲を[-180, 180]から[0, 360]にシフトします
- 360で除算することで、この値を0から1の間に正規化します
- `0xFFFFFFFF`(32ビット符号なし整数の最大値を表す16進数)を乗算することで、この正規化された値を32ビット整数の全範囲にスケーリングします

**mercator_y**

このカラムは緯度の値をメルカトル図法のY座標に変換します:

- `latitude + 90`は緯度を[-90, 90]から[0, 180]にシフトします
- 360で除算してpi()を乗算することで、三角関数用のラジアンに変換します
- `log(tan(...))`の部分がメルカトル図法の公式の核心部分です
- `0xFFFFFFFF`を乗算することで、32ビット整数の全範囲にスケーリングします

`MATERIALIZED`を指定することで、データを`INSERT`する際にClickHouseがこれらのカラムの値を自動的に計算します。`INSERT`文でこれらのカラム(元のデータスキーマには含まれていません)を明示的に指定する必要はありません。

テーブルは`mortonEncode(mercator_x, mercator_y)`で順序付けされており、これにより`mercator_x`、`mercator_y`のZ次空間充填曲線が生成され、地理空間クエリのパフォーマンスが大幅に向上します。このZ次曲線による順序付けにより、データが空間的な近接性に基づいて物理的に整理されます:

```sql
ORDER BY mortonEncode(mercator_x, mercator_y)
```

高速検索のために2つの`minmax`インデックスも作成されます:

```sql
INDEX idx_x mercator_x TYPE minmax,
INDEX idx_y mercator_y TYPE minmax
```

ご覧のとおり、ClickHouseにはリアルタイムマッピングアプリケーションに必要なすべての機能が揃っています!

データを読み込むには、以下のクエリを実行します:


```sql
INSERT INTO foursquare_mercator 
SELECT * FROM s3('s3://fsq-os-places-us-east-1/release/dt=2025-04-08/places/parquet/*')
```


## データの可視化 {#data-visualization}

このデータセットで何が可能かを確認するには、[adsb.exposed](https://adsb.exposed/?dataset=Places&zoom=5&lat=52.3488&lng=4.9219)をご覧ください。
adsb.exposedは、共同創業者兼CTOのAlexey Milovidovが、1000倍の規模を持つADS-B(Automatic Dependent Surveillance-Broadcast)
フライトデータを可視化するために開発したものです。社内ハッカソンの際に、AlexeyはこのツールにFoursquareデータを追加しました。

以下に、お気に入りの可視化例をいくつかご紹介します。

<Image
  img={visualization_1}
  size='md'
  alt='ヨーロッパの関心地点の密度マップ'
/>

<Image img={visualization_2} size='md' alt='日本の酒場' />

<Image img={visualization_3} size='md' alt='ATM' />

<Image
  img={visualization_4}
  size='md'
  alt='国別に分類された関心地点を示すヨーロッパの地図'
/>
