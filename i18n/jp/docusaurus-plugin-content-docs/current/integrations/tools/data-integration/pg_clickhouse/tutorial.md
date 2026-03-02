---
sidebar_label: 'チュートリアル'
description: 'pg_clickhouse を ClickHouse に接続し、ニューヨーク市のタクシーのサンプルデータセットに対してクエリを実行する方法を学びます。'
slug: '/integrations/pg_clickhouse/tutorial'
title: 'pg_clickhouse チュートリアル'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部データラッパー', 'pg_clickhouse', 'extension', 'チュートリアル', 'タクシー']
---

# pg_clickhouse チュートリアル \{#pg_clickhouse-tutorial\}

## 概要 \{#overview\}

本チュートリアルは [ClickHouse tutorial] の流れに従いますが、すべてのクエリを
pg_clickhouse 経由で実行します。

## ClickHouse を起動する \{#start-clickhouse\}

まず、まだ ClickHouse データベースを持っていない場合は作成してください。手早く開始する方法としては、Docker イメージを利用するのが簡単です。

```sh
docker run -d --network host --name clickhouse -p 8123:8123 -p9000:9000 --ulimit nofile=262144:262144 clickhouse
docker exec -it clickhouse clickhouse-client
```


## テーブルを作成する \{#create-a-table\}

[ClickHouse チュートリアル] を参考にして、ニューヨーク市のタクシーデータセットを用いた簡単なデータベースを作成します。

```sql
CREATE DATABASE taxi;
CREATE TABLE taxi.trips
(
    trip_id UInt32,
    vendor_id Enum8(
        '1'      =  1, '2'      =  2, '3'      =  3, '4'      =  4,
        'CMT'    =  5, 'VTS'    =  6, 'DDS'    =  7, 'B02512' = 10,
        'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14,
        ''       = 15
    ),
    pickup_date Date,
    pickup_datetime DateTime,
    dropoff_date Date,
    dropoff_datetime DateTime,
    store_and_fwd_flag UInt8,
    rate_code_id UInt8,
    pickup_longitude Float64,
    pickup_latitude Float64,
    dropoff_longitude Float64,
    dropoff_latitude Float64,
    passenger_count UInt8,
    trip_distance Float64,
    fare_amount Decimal(10, 2),
    extra Decimal(10, 2),
    mta_tax Decimal(10, 2),
    tip_amount Decimal(10, 2),
    tolls_amount Decimal(10, 2),
    ehail_fee Decimal(10, 2),
    improvement_surcharge Decimal(10, 2),
    total_amount Decimal(10, 2),
    payment_type Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    trip_type UInt8,
    pickup FixedString(25),
    dropoff FixedString(25),
    cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    pickup_nyct2010_gid Int8,
    pickup_ctlabel Float32,
    pickup_borocode Int8,
    pickup_ct2010 String,
    pickup_boroct2010 String,
    pickup_cdeligibil String,
    pickup_ntacode FixedString(4),
    pickup_ntaname String,
    pickup_puma UInt16,
    dropoff_nyct2010_gid UInt8,
    dropoff_ctlabel Float32,
    dropoff_borocode UInt8,
    dropoff_ct2010 String,
    dropoff_boroct2010 String,
    dropoff_cdeligibil String,
    dropoff_ntacode FixedString(4),
    dropoff_ntaname String,
    dropoff_puma UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime;
```


## データセットを追加する \{#add-the-data-set\}

次に、データをインポートします：

```sql
INSERT INTO taxi.trips
SELECT * FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
    'TabSeparatedWithNames', "
    trip_id UInt32,
    vendor_id Enum8(
        '1'      =  1, '2'      =  2, '3'      =  3, '4'      =  4,
        'CMT'    =  5, 'VTS'    =  6, 'DDS'    =  7, 'B02512' = 10,
        'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14,
        ''       = 15
    ),
    pickup_date Date,
    pickup_datetime DateTime,
    dropoff_date Date,
    dropoff_datetime DateTime,
    store_and_fwd_flag UInt8,
    rate_code_id UInt8,
    pickup_longitude Float64,
    pickup_latitude Float64,
    dropoff_longitude Float64,
    dropoff_latitude Float64,
    passenger_count UInt8,
    trip_distance Float64,
    fare_amount Decimal(10, 2),
    extra Decimal(10, 2),
    mta_tax Decimal(10, 2),
    tip_amount Decimal(10, 2),
    tolls_amount Decimal(10, 2),
    ehail_fee Decimal(10, 2),
    improvement_surcharge Decimal(10, 2),
    total_amount Decimal(10, 2),
    payment_type Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    trip_type UInt8,
    pickup FixedString(25),
    dropoff FixedString(25),
    cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    pickup_nyct2010_gid Int8,
    pickup_ctlabel Float32,
    pickup_borocode Int8,
    pickup_ct2010 String,
    pickup_boroct2010 String,
    pickup_cdeligibil String,
    pickup_ntacode FixedString(4),
    pickup_ntaname String,
    pickup_puma UInt16,
    dropoff_nyct2010_gid UInt8,
    dropoff_ctlabel Float32,
    dropoff_borocode UInt8,
    dropoff_ct2010 String,
    dropoff_boroct2010 String,
    dropoff_cdeligibil String,
    dropoff_ntacode FixedString(4),
    dropoff_ntaname String,
    dropoff_puma UInt16
") SETTINGS input_format_try_infer_datetimes = 0
```

クエリを実行できることを確認したら、クライアントを終了します。

```sql
SELECT count() FROM taxi.trips;
quit
```


### pg_clickhouse をインストールする \{#install-pg_clickhouse\}

[PGXN] または [GitHub] から pg&#95;clickhouse をビルドしてインストールします。あるいは、[pg&#95;clickhouse image] を使用して Docker コンテナを起動します。このイメージは、pg&#95;clickhouse を Docker の [Postgres image] に単に追加したものです。

```sh
docker run -d --network host --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
```


### pg_clickhouse に接続する \{#connect-pg_clickhouse\}

次に、Postgres に接続します。

```sh
docker exec -it pg_clickhouse psql -U postgres
```

次に、pg&#95;clickhouse を作成します:

```sql
CREATE EXTENSION pg_clickhouse;
```

ClickHouse データベースに対して、ホスト名、ポート、およびデータベース名を指定して外部サーバーを作成します。

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

ここでは、ClickHouse バイナリプロトコルを使用するバイナリドライバを選択しています。HTTP インターフェイスを使用する「http」ドライバを使うこともできます。

次に、PostgreSQL ユーザーを ClickHouse の USER にマッピングします。最も簡単な方法は、現在の PostgreSQL ユーザーを、その外部サーバー上のリモート USER にマッピングすることです。

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
```

`password` オプションを指定することもできます。

次に、taxi テーブルを追加します。リモートの ClickHouse データベースにあるすべてのテーブルを Postgres のスキーマにインポートするだけで済みます。

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```

これでテーブルがインポートされたはずです。[psql] で `\det+` を実行して確認してください:

```pgsql
taxi=# \det+ taxi.*
                                       List of foreign tables
 Schema | Table |  Server  |                        FDW options                        | Description
--------+-------+----------+-----------------------------------------------------------+-------------
 taxi   | trips | taxi_srv | (database 'taxi', table_name 'trips', engine 'MergeTree') | [null]
(1 row)
```

成功しました！ `\d` を使用してすべてのカラムを表示しましょう。


```pgsql
taxi=# \d taxi.trips
                                   Foreign table "taxi.trips"
        Column         |           Type           | Collation | Nullable | Default | FDW options
-----------------------+--------------------------+-----------+----------+---------+-------------
 trip_id               | bigint                   |           | not null |         |
 vendor_id             | text                     |           | not null |         |
 pickup_date           | date                     |           | not null |         |
 pickup_datetime       | timestamp with time zone |           | not null |         |
 dropoff_date          | date                     |           | not null |         |
 dropoff_datetime      | timestamp with time zone |           | not null |         |
 store_and_fwd_flag    | smallint                 |           | not null |         |
 rate_code_id          | smallint                 |           | not null |         |
 pickup_longitude      | double precision         |           | not null |         |
 pickup_latitude       | double precision         |           | not null |         |
 dropoff_longitude     | double precision         |           | not null |         |
 dropoff_latitude      | double precision         |           | not null |         |
 passenger_count       | smallint                 |           | not null |         |
 trip_distance         | double precision         |           | not null |         |
 fare_amount           | numeric(10,2)            |           | not null |         |
 extra                 | numeric(10,2)            |           | not null |         |
 mta_tax               | numeric(10,2)            |           | not null |         |
 tip_amount            | numeric(10,2)            |           | not null |         |
 tolls_amount          | numeric(10,2)            |           | not null |         |
 ehail_fee             | numeric(10,2)            |           | not null |         |
 improvement_surcharge | numeric(10,2)            |           | not null |         |
 total_amount          | numeric(10,2)            |           | not null |         |
 payment_type          | text                     |           | not null |         |
 trip_type             | smallint                 |           | not null |         |
 pickup                | character varying(25)    |           | not null |         |
 dropoff               | character varying(25)    |           | not null |         |
 cab_type              | text                     |           | not null |         |
 pickup_nyct2010_gid   | smallint                 |           | not null |         |
 pickup_ctlabel        | real                     |           | not null |         |
 pickup_borocode       | smallint                 |           | not null |         |
 pickup_ct2010         | text                     |           | not null |         |
 pickup_boroct2010     | text                     |           | not null |         |
 pickup_cdeligibil     | text                     |           | not null |         |
 pickup_ntacode        | character varying(4)     |           | not null |         |
 pickup_ntaname        | text                     |           | not null |         |
 pickup_puma           | integer                  |           | not null |         |
 dropoff_nyct2010_gid  | smallint                 |           | not null |         |
 dropoff_ctlabel       | real                     |           | not null |         |
 dropoff_borocode      | smallint                 |           | not null |         |
 dropoff_ct2010        | text                     |           | not null |         |
 dropoff_boroct2010    | text                     |           | not null |         |
 dropoff_cdeligibil    | text                     |           | not null |         |
 dropoff_ntacode       | character varying(4)     |           | not null |         |
 dropoff_ntaname       | text                     |           | not null |         |
 dropoff_puma          | integer                  |           | not null |         |
Server: taxi_srv
FDW options: (database 'taxi', table_name 'trips', engine 'MergeTree')
```

次に、テーブルにクエリを実行します:

```pgsql
 SELECT count(*) FROM taxi.trips;
   count
 ---------
  1999657
 (1 row)
```

クエリがどれほど高速に実行されたかに注目してください。pg&#95;clickhouse は `COUNT()` 集約を含むクエリ全体をプッシュダウンするため、ClickHouse 上で実行され、Postgres 側には単一の行だけが返されます。[EXPLAIN] を使って確認しましょう。

```pgsql
 EXPLAIN select count(*) from taxi.trips;
                    QUERY PLAN
 -------------------------------------------------
  Foreign Scan  (cost=1.00..-0.90 rows=1 width=8)
    Relations: Aggregate on (trips)
 (2 rows)
```

プランのルートに「Foreign Scan」が現れている点に注目してください。これは、クエリ全体が ClickHouse にプッシュダウンされていることを意味します。


## データを分析する \{#analyze-the-data\}

いくつかのクエリを実行してデータを分析します。以下の例を試すか、自分で SQL クエリを実行してみてください。

* 平均チップ額を計算する：

  ```sql
  taxi=# \timing
  Timing is on.
  taxi=# SELECT round(avg(tip_amount), 2) FROM taxi.trips;
   round
  -------
    1.68
  (1 row)

  Time: 9.438 ms
  ```

* 乗客数に基づいて平均料金を計算します：

  ```pgsql
  taxi=# SELECT
          passenger_count,
          avg(total_amount)::NUMERIC(10, 2) AS average_total_amount
      FROM taxi.trips
      GROUP BY passenger_count;
   passenger_count | average_total_amount
  -----------------+----------------------
                 0 |                22.68
                 1 |                15.96
                 2 |                17.14
                 3 |                16.75
                 4 |                17.32
                 5 |                16.34
                 6 |                16.03
                 7 |                59.79
                 8 |                36.40
                 9 |                 9.79
  (10 rows)

  Time: 27.266 ms
  ```

* 各地区ごとの1日あたりのピックアップ件数を計算します：

  ```pgsql
  taxi=# SELECT
      pickup_date,
      pickup_ntaname,
      SUM(1) AS number_of_trips
  FROM taxi.trips
  GROUP BY pickup_date, pickup_ntaname
  ORDER BY pickup_date ASC LIMIT 10;
   pickup_date |         pickup_ntaname         | number_of_trips
  -------------+--------------------------------+-----------------
   2015-07-01  | Williamsburg                   |               1
   2015-07-01  | park-cemetery-etc-Queens       |               6
   2015-07-01  | Maspeth                        |               1
   2015-07-01  | Stuyvesant Town-Cooper Village |              44
   2015-07-01  | Rego Park                      |               1
   2015-07-01  | Greenpoint                     |               7
   2015-07-01  | Highbridge                     |               1
   2015-07-01  | Briarwood-Jamaica Hills        |               3
   2015-07-01  | Airport                        |             550
   2015-07-01  | East Harlem North              |              32
  (10 rows)

  Time: 30.978 ms
  ```

* 各乗車の所要時間を分単位で計算し、その結果を
  所要時間ごとにグループ化します：

  ```pgsql
  taxi=# SELECT
      avg(tip_amount) AS avg_tip,
      avg(fare_amount) AS avg_fare,
      avg(passenger_count) AS avg_passenger,
      count(*) AS count,
      round((date_part('epoch', dropoff_datetime) - date_part('epoch', pickup_datetime)) / 60) as trip_minutes
  FROM taxi.trips
  WHERE round((date_part('epoch', dropoff_datetime) - date_part('epoch', pickup_datetime)) / 60) > 0
  GROUP BY trip_minutes
  ORDER BY trip_minutes DESC
  LIMIT 5;
        avg_tip      |     avg_fare     |  avg_passenger   | count | trip_minutes
  -------------------+------------------+------------------+-------+--------------
                1.96 |                8 |                1 |     1 |        27512
                   0 |               12 |                2 |     1 |        27500
   0.562727272727273 | 17.4545454545455 | 2.45454545454545 |    11 |         1440
   0.716564885496183 | 14.2786259541985 | 1.94656488549618 |   131 |         1439
    1.00945205479452 | 12.8787671232877 | 1.98630136986301 |   146 |         1438
  (5 rows)

  Time: 45.477 ms
  ```

* 各地区別の乗車数を、1日の各時間ごとに表示します：

  ```pgsql
  taxi=# SELECT
      pickup_ntaname,
      date_part('hour', pickup_datetime) as pickup_hour,
      SUM(1) AS pickups
  FROM taxi.trips
  WHERE pickup_ntaname != ''
  GROUP BY pickup_ntaname, pickup_hour
  ORDER BY pickup_ntaname, date_part('hour', pickup_datetime)
  LIMIT 5;
   pickup_ntaname | pickup_hour | pickups
  ----------------+-------------+---------
   Airport        |           0 |    3509
   Airport        |           1 |    1184
   Airport        |           2 |     401
   Airport        |           3 |     152
   Airport        |           4 |     213
  (5 rows)

  Time: 36.895 ms
  ```

* 表示用タイムゾーンをニューヨークに設定し、LaGuardia 空港または JFK 空港への乗車データを取得します：

  ```pgsql
  taxi=# SET timezone = 'America/New_York';
  SET
  taxi=# SELECT
      pickup_datetime,
      dropoff_datetime,
      total_amount,
      pickup_nyct2010_gid,
      dropoff_nyct2010_gid,
      CASE
          WHEN dropoff_nyct2010_gid = 138 THEN 'LGA'
          WHEN dropoff_nyct2010_gid = 132 THEN 'JFK'
      END AS airport_code,
      EXTRACT(YEAR FROM pickup_datetime) AS year,
      EXTRACT(DAY FROM pickup_datetime) AS day,
      EXTRACT(HOUR FROM pickup_datetime) AS hour
  FROM taxi.trips
  WHERE dropoff_nyct2010_gid IN (132, 138)
  ORDER BY pickup_datetime
  LIMIT 5;
      pickup_datetime     |    dropoff_datetime    | total_amount | pickup_nyct2010_gid | dropoff_nyct2010_gid | airport_code | year | day | hour
  ------------------------+------------------------+--------------+---------------------+----------------------+--------------+------+-----+------
   2015-06-30 20:04:14-04 | 2015-06-30 20:15:29-04 |        13.30 |                 -34 |                  132 | JFK          | 2015 |  30 |   20
   2015-06-30 20:09:42-04 | 2015-06-30 20:12:55-04 |         6.80 |                  50 |                  138 | LGA          | 2015 |  30 |   20
   2015-06-30 20:23:04-04 | 2015-06-30 20:24:39-04 |         4.80 |                -125 |                  132 | JFK          | 2015 |  30 |   20
   2015-06-30 20:27:51-04 | 2015-06-30 20:39:02-04 |        14.72 |                -101 |                  138 | LGA          | 2015 |  30 |   20
   2015-06-30 20:32:03-04 | 2015-06-30 20:55:39-04 |        39.34 |                  48 |                  138 | LGA          | 2015 |  30 |   20
  (5 rows)

  Time: 17.450 ms
  ```

## Dictionary を作成する \{#create-a-dictionary\}

ClickHouse サービス内のテーブルに関連付けられた Dictionary を作成します。
テーブルと Dictionary は、ニューヨーク市の各地区（neighborhood）ごとに 1 行を持つ CSV ファイルに基づいています。

これらの地区は、ニューヨーク市の 5 つの行政区（Bronx, Brooklyn, Manhattan, Queens, Staten Island）および Newark Airport (EWR) にマッピングされています。

以下は、使用している CSV ファイルの一部をテーブル形式で示したものです。
ファイル内の `LocationID` カラムは、trips テーブル内の `pickup_nyct2010_gid` カラムおよび `dropoff_nyct2010_gid` カラムと対応しています:

| LocationID | Borough       |  Zone                   | service_zone |
  | ---------: | ------------- | ----------------------- | ------------ |
  |          1 | EWR           | Newark Airport          | EWR          |
  |          2 | Queens        | Jamaica Bay             | Boro Zone    |
  |          3 | Bronx         | Allerton/Pelham Gardens | Boro Zone    |
  |          4 | Manhattan     | Alphabet City           | Yellow Zone  |
  |          5 | Staten Island | Arden Heights           | Boro Zone    |

1.  引き続き Postgres 上で、`clickhouse_raw_query` 関数を使用して
    ClickHouse の [dictionary] `taxi_zone_dictionary` を作成し、
    S3 上の CSV ファイルから Dictionary を読み込みます:

    ```sql
    SELECT clickhouse_raw_query($$
        CREATE DICTIONARY taxi.taxi_zone_dictionary (
            LocationID Int64 DEFAULT 0,
            Borough String,
            zone String,
            service_zone String
        )
        PRIMARY KEY LocationID
        SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
        LIFETIME(MIN 0 MAX 0)
        LAYOUT(HASHED_ARRAY())
    $$, 'host=localhost dbname=taxi');
    ```

    :::note
    `LIFETIME` を 0 に設定すると、自動更新が無効になり、S3 バケットへの
    不要なトラフィックを避けることができます。別のケースでは、異なる値を
    設定することもあります。詳細については、[Refreshing dictionary data using
    LIFETIME](/sql-reference/statements/create/dictionary/lifetime#refreshing-dictionary-data-using-lifetime) を参照してください。
    :::

    2.  次に、これをインポートします:

    ```sql
    IMPORT FOREIGN SCHEMA taxi LIMIT TO (taxi_zone_dictionary)
    FROM SERVER taxi_srv INTO taxi;
    ```

    3.  クエリできることを確認します:

    ```pgsql
    taxi=# SELECT * FROM taxi.taxi_zone_dictionary limit 3;
     LocationID |  Borough  |                     Zone                      | service_zone
    ------------+-----------+-----------------------------------------------+--------------
             77 | Brooklyn  | East New York/Pennsylvania Avenue             | Boro Zone
            106 | Brooklyn  | Gowanus                                       | Boro Zone
            103 | Manhattan | Governor's Island/Ellis Island/Liberty Island | Yellow Zone
    (3 rows)
    ```

    4.  問題なく動作していることが確認できました。次に `dictGet` 関数を使用して、
        クエリ内で borough の名前を取得します。このクエリでは、
        LaGuardia か JFK のいずれかの空港で終了するタクシー乗車数を、
        borough ごとに集計します:

    ```pgsql
    taxi=# SELECT
            count(1) AS total,
            COALESCE(NULLIF(dictGet(
                'taxi.taxi_zone_dictionary', 'Borough',
                toUInt64(pickup_nyct2010_gid)
            ), ''), 'Unknown') AS borough_name
        FROM taxi.trips
        WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
        GROUP BY borough_name
        ORDER BY total DESC;
     total | borough_name
    -------+---------------
     23683 | Unknown
      7053 | Manhattan
      6828 | Brooklyn
      4458 | Queens
      2670 | Bronx
       554 | Staten Island
        53 | EWR
    (7 rows)

    Time: 66.245 ms
    ```

    このクエリは、LaGuardia か JFK のいずれかの空港で終了するタクシー乗車数を、
    borough ごとに集計します。pickup 側の地区が不明な乗車がかなり多いことに
    注目してください。

## 結合を実行する \{#perform-a-join\}

`taxi_zone_dictionary` と `trips` テーブルを結合するクエリをいくつか作成します。

1.  まずは、上の空港に関するクエリと同様に動作する、シンプルな `JOIN` から始めます:

    ```pgsql
    taxi=# SELECT
        count(1) AS total,
        "Borough"
    FROM taxi.trips
    JOIN taxi.taxi_zone_dictionary
      ON trips.pickup_nyct2010_gid = toUInt64(taxi.taxi_zone_dictionary."LocationID")
    WHERE pickup_nyct2010_gid > 0
      AND dropoff_nyct2010_gid IN (132, 138)
    GROUP BY "Borough"
    ORDER BY total DESC;
     total | borough_name
    -------+---------------
      7053 | Manhattan
      6828 | Brooklyn
      4458 | Queens
      2670 | Bronx
       554 | Staten Island
        53 | EWR
    (6 rows)

    Time: 48.449 ms
    ```

    :::note
    上記の `JOIN` クエリの出力は、（「Unknown」値が含まれていない点を除き）上で示した
    `dictGet` クエリと同じであることに注意してください。内部的には、ClickHouse は実際には
    `taxi_zone_dictionary` Dictionary に対して `dictGet` 関数を呼び出していますが、
    `JOIN` 構文の方が SQL 開発者にはより馴染みがあります。
    :::

    ```pgsql
    taxi=# explain SELECT
            count(1) AS total,
            "Borough"
        FROM taxi.trips
        JOIN taxi.taxi_zone_dictionary
          ON trips.pickup_nyct2010_gid = toUInt64(taxi.taxi_zone_dictionary."LocationID")
        WHERE pickup_nyct2010_gid > 0
          AND dropoff_nyct2010_gid IN (132, 138)
        GROUP BY "Borough"
        ORDER BY total DESC;
                                  QUERY PLAN
    -----------------------------------------------------------------------
     Foreign Scan  (cost=1.00..5.10 rows=1000 width=40)
       Relations: Aggregate on ((trips) INNER JOIN (taxi_zone_dictionary))
    (2 rows)
    Time: 2.012 ms
    ```

2.  このクエリは、チップ額が最も高い 1000 件のトリップについて行を返し、その後、
    各行ごとに Dictionary と内部結合を行います:

    ```sql
    taxi=# SELECT *
    FROM taxi.trips
    JOIN taxi.taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi.taxi_zone_dictionary."LocationID"
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000;
    ```

:::note
一般的に、PostgreSQL と ClickHouse では `SELECT *` の使用は避けます。
実際に必要なカラムだけを取得すべきです。
:::

[tutorial]: /tutorial "ClickHouse 上級チュートリアル"

[psql]: https://www.postgresql.org/docs/current/app-psql.html
    "PostgreSQL クライアントアプリケーション: psql"

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html
    "SQL コマンド: EXPLAIN"

[dictionary]: /sql-reference/statements/create/dictionary

[PGXN]: https://pgxn.org/dist/pg_clickhouse "PGXN 上の pg_clickhouse"

[GitHub]: https://github.com/ClickHouse/pg_clickhouse/releases
    "GitHub 上の pg_clickhouse リリース"

[pg_clickhouse image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "GitHub 上の pg_clickhouse OCI イメージ"

[Postgres image]: https://hub.docker.com/_/postgres
    "Docker Hub 上の Postgres OCI イメージ"

[Refreshing dictionary data using LIFETIME]: /sql-reference/statements/create/dictionary/lifetime#refreshing-dictionary-data-using-lifetime
    "ClickHouse ドキュメント: LIFETIME を使用した Dictionary データの更新"