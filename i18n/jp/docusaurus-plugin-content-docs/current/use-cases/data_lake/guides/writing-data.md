---
title: 'オープンテーブル形式へのデータの書き込み'
sidebar_label: 'データレイクへの書き込み'
slug: /use-cases/data-lake/getting-started/writing-data
sidebar_position: 4
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/accelerating-analytics
pagination_next: null
description: 'ClickHouseからオブジェクトストレージ内のIcebergテーブルにデータを書き戻し、長期保存と下流システムでの利用に備えます。'
keywords: ['データレイク', 'レイクハウス', '書き込み', 'iceberg', 'リバースETL', 'INSERT INTO', 'IcebergS3']
doc_type: 'guide'
---

前のガイドでは、オープンテーブル形式をそのままクエリし、高速な分析のためにデータをMergeTreeに取り込みました。多くのアーキテクチャでは、データは逆方向にも流れる必要があります。つまり、ClickHouseからレイクハウス形式へデータを書き戻す必要があります。これを必要とする代表的なシナリオは、次の 2 つです。

* **長期ストレージへのオフロード** - データはリアルタイム分析レイヤーとしてClickHouseに取り込まれ、ダッシュボードや運用レポートを支えます。データがリアルタイム用途の保持期間を過ぎたら、相互運用可能な形式で、耐久性が高くコスト効率に優れた長期保存を実現するために、オブジェクトストレージ内のIcebergに書き出すことができます。
* **リバースETL** - ClickHouse内で実行した変換、集約、エンリッチメントによって、下流ツールや他チームが利用する派生データセットが生成されます。これらの結果をIcebergテーブルに書き込むことで、より広範なデータエコシステム全体で利用できるようになります。

どちらの場合も、`INSERT INTO SELECT` を使用すると、ClickHouseテーブルからオブジェクトストレージに保存されたIcebergテーブルへデータを移動できます。

:::note
オープンテーブル形式への書き込みは、現在 **Icebergテーブルのみ** をサポートしています。Delta Lakeテーブルの部分的なサポートは現在開発中です。テーブルはカタログ管理されていてはなりません。
:::

## ソースデータセットを準備する \{#prepare-source\}

このガイドでは、[UK Price Paid](/getting-started/example-datasets/uk-price-paid) データセット (イングランドおよびウェールズにおけるすべての住宅用不動産取引の公開記録) を使用します。

### MergeTreeテーブルを作成してデータを投入する \{#create-source-table\}

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

公開されているCSVソースからテーブルに直接データを投入します。

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

30906560 rows in set. Elapsed: 59.852 sec. Processed 30.91 million rows, 5.41 GB (516.39 thousand rows/s., 90.40 MB/s.)
Peak memory usage: 485.15 MiB.
```

## Iceberg テーブルにデータを書き込む \{#write-iceberg\}

### Iceberg テーブルを作成する \{#create-iceberg-table\}

Iceberg にデータを書き込むには、[`IcebergS3` テーブルエンジン](/engines/table-engines/integrations/iceberg) を使用してテーブルを作成します。

スキーマは、MergeTree のソースと比べて簡略化する必要がある点に注意してください。ClickHouse は Iceberg や基盤となる Parquet ファイルよりも豊富な型システムをサポートしているため、`Enum`、`LowCardinality`、`UInt8` などの型は Iceberg ではサポートされておらず、互換性のある型にマッピングする必要があります。

```sql
CREATE TABLE uk.uk_iceberg
(
    price UInt32,
    date Date,
    postcode1 String,
    postcode2 String,
    type UInt32,
    is_new UInt32,
    duration UInt32,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_price_paid/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```

### データの一部を挿入する \{#insert-subset\}

`INSERT INTO SELECT` を使用して、MergeTree テーブルのデータを Iceberg テーブルに書き込みます。この例では、ロンドンのトランザクションのみを書き込みます。

```sql
SET allow_experimental_insert_into_iceberg = 1;

INSERT INTO uk.uk_iceberg SELECT *
FROM uk.uk_price_paid
WHERE town = 'LONDON'

2346741 rows in set. Elapsed: 1.419 sec. Processed 30.91 million rows, 153.43 MB (21.78 million rows/s., 108.15 MB/s.)
Peak memory usage: 371.60 MiB.
```

### Icebergテーブルをクエリする \{#query-iceberg\}

データは現在、オブジェクトストレージにIceberg形式で保存されており、ClickHouse や Iceberg を読み取れる他の任意のツールからクエリできます。

```sql
SELECT
    locality,
    count()
FROM uk.uk_iceberg
WHERE locality != ''
GROUP BY locality
ORDER BY count() DESC
LIMIT 10

┌─locality────┬─count()─┐
│ LONDON      │  896796 │
│ WALTHAMSTOW │    8610 │
│ LEYTON      │    3525 │
│ CHINGFORD   │    3133 │
│ HORNSEY     │    2794 │
│ STREATHAM   │    2760 │
│ WOOD GREEN  │    2443 │
│ ACTON       │    2155 │
│ LEYTONSTONE │    2102 │
│ EAST HAM    │    2085 │
└─────────────┴─────────┘

10 rows in set. Elapsed: 0.329 sec. Processed 457.86 thousand rows, 2.62 MB (1.39 million rows/s., 7.95 MB/s.)
Peak memory usage: 12.19 MiB.
```

## 集計結果を書き込む \{#write-aggregates\}

Iceberg テーブルは、生の行の保存に限られません。集計や変換の出力、つまり ClickHouse 内で実行される ETL プロセスの結果も保持できます。これは、事前計算したサマリーをレイクハウスに公開し、後続の処理で利用できるようにする場合に有用です。

### 集計結果用のIcebergテーブルを作成する \{#create-aggregate-table\}

```sql
CREATE TABLE uk.uk_avg_town
(
    price Float64,
    town String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_avg_town/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```

### 集計データの挿入 \{#insert-aggregates\}

町ごとの平均不動産価格を計算し、その結果を直接 Iceberg に書き込みます：

```sql
INSERT INTO uk.uk_avg_town SELECT
    avg(price) AS price,
    town
FROM uk.uk_price_paid
GROUP BY town

1173 rows in set. Elapsed: 0.480 sec. Processed 30.91 million rows, 185.44 MB (64.34 million rows/s., 386.05 MB/s.)
Peak memory usage: 4.18 MiB.
```

### 集計済みテーブルをクエリする \{#query-aggregates\}

これで、他のツールや別の ClickHouse インスタンスから、この事前計算済みのデータセットを読み取れるようになりました。

```sql
SELECT
    town,
    price
FROM uk.uk_avg_town
ORDER BY price DESC
LIMIT 10

┌─town───────────────┬──────────────price─┐
│ GATWICK            │ 28232811.583333332 │
│ THORNHILL          │             985000 │
│ VIRGINIA WATER     │  984633.2938574939 │
│ CHALFONT ST GILES  │  863347.7280187573 │
│ COBHAM             │    775251.47313278 │
│ PURFLEET-ON-THAMES │           772651.8 │
│ BEACONSFIELD       │  746052.9327405858 │
│ ESHER              │  686708.4969745865 │
│ KESTON             │  654541.1774842045 │
│ GERRARDS CROSS     │  639109.4084023251 │
└────────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.210 sec.
```
