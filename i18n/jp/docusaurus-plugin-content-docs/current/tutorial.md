---
slug: /tutorial
sidebar_label: '高度なチュートリアル'
title: '高度なチュートリアル'
description: 'New York City のタクシーのサンプルデータセットを使用して、ClickHouse でデータを取り込み、クエリを実行する方法を学びます。'
sidebar_position: 0.5
keywords: ['clickhouse', 'install', 'tutorial', 'dictionary', 'dictionaries', 'example', 'advanced', 'taxi', 'new york', 'nyc']
show_related_blogs: true
doc_type: 'guide'
---



# 高度なチュートリアル



## Overview {#overview}

ニューヨーク市のタクシーサンプルデータセットを使用して、ClickHouseでデータを取り込み、クエリする方法を学習します。

### Prerequisites {#prerequisites}

このチュートリアルを完了するには、稼働中のClickHouseサービスへのアクセスが必要です。手順については、[クイックスタート](/get-started/quick-start)ガイドを参照してください。

<VerticalStepper>


## 新しいテーブルを作成する {#create-a-new-table}

New York City のタクシーデータセットには、数百万件のタクシー乗車に関する詳細が含まれており、チップ額、通行料、支払い種別などのカラムがあります。このデータを保存するためのテーブルを作成します。

1. SQL コンソールに接続します:
    - ClickHouse Cloud の場合は、ドロップダウンメニューからサービスを選択し、左側のナビゲーションメニューから **SQL Console** を選択します。
    - セルフマネージドの ClickHouse の場合は、`https://_hostname_:8443/play` の SQL コンソールに接続します。詳細は ClickHouse 管理者に確認してください。

2. `default` データベース内に、次の `trips` テーブルを作成します:
    ```sql
    CREATE TABLE trips
    (
        `trip_id` UInt32,
        `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
        `pickup_date` Date,
        `pickup_datetime` DateTime,
        `dropoff_date` Date,
        `dropoff_datetime` DateTime,
        `store_and_fwd_flag` UInt8,
        `rate_code_id` UInt8,
        `pickup_longitude` Float64,
        `pickup_latitude` Float64,
        `dropoff_longitude` Float64,
        `dropoff_latitude` Float64,
        `passenger_count` UInt8,
        `trip_distance` Float64,
        `fare_amount` Float32,
        `extra` Float32,
        `mta_tax` Float32,
        `tip_amount` Float32,
        `tolls_amount` Float32,
        `ehail_fee` Float32,
        `improvement_surcharge` Float32,
        `total_amount` Float32,
        `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
        `trip_type` UInt8,
        `pickup` FixedString(25),
        `dropoff` FixedString(25),
        `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
        `pickup_nyct2010_gid` Int8,
        `pickup_ctlabel` Float32,
        `pickup_borocode` Int8,
        `pickup_ct2010` String,
        `pickup_boroct2010` String,
        `pickup_cdeligibil` String,
        `pickup_ntacode` FixedString(4),
        `pickup_ntaname` String,
        `pickup_puma` UInt16,
        `dropoff_nyct2010_gid` UInt8,
        `dropoff_ctlabel` Float32,
        `dropoff_borocode` UInt8,
        `dropoff_ct2010` String,
        `dropoff_boroct2010` String,
        `dropoff_cdeligibil` String,
        `dropoff_ntacode` FixedString(4),
        `dropoff_ntaname` String,
        `dropoff_puma` UInt16
    )
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(pickup_date)
    ORDER BY pickup_datetime;
    ```



## データセットを追加する {#add-the-dataset}

テーブルを作成したので、S3 内の CSV ファイルからニューヨーク市タクシーデータを追加します。

1. 次のコマンドは、S3 内の 2 つのファイル `trips_1.tsv.gz` と `trips_2.tsv.gz` から、約 2,000,000 行を `trips` テーブルに挿入します:

    ```sql
    INSERT INTO trips
    SELECT * FROM s3(
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
        'TabSeparatedWithNames', "
        `trip_id` UInt32,
        `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
        `pickup_date` Date,
        `pickup_datetime` DateTime,
        `dropoff_date` Date,
        `dropoff_datetime` DateTime,
        `store_and_fwd_flag` UInt8,
        `rate_code_id` UInt8,
        `pickup_longitude` Float64,
        `pickup_latitude` Float64,
        `dropoff_longitude` Float64,
        `dropoff_latitude` Float64,
        `passenger_count` UInt8,
        `trip_distance` Float64,
        `fare_amount` Float32,
        `extra` Float32,
        `mta_tax` Float32,
        `tip_amount` Float32,
        `tolls_amount` Float32,
        `ehail_fee` Float32,
        `improvement_surcharge` Float32,
        `total_amount` Float32,
        `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
        `trip_type` UInt8,
        `pickup` FixedString(25),
        `dropoff` FixedString(25),
        `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
        `pickup_nyct2010_gid` Int8,
        `pickup_ctlabel` Float32,
        `pickup_borocode` Int8,
        `pickup_ct2010` String,
        `pickup_boroct2010` String,
        `pickup_cdeligibil` String,
        `pickup_ntacode` FixedString(4),
        `pickup_ntaname` String,
        `pickup_puma` UInt16,
        `dropoff_nyct2010_gid` UInt8,
        `dropoff_ctlabel` Float32,
        `dropoff_borocode` UInt8,
        `dropoff_ct2010` String,
        `dropoff_boroct2010` String,
        `dropoff_cdeligibil` String,
        `dropoff_ntacode` FixedString(4),
        `dropoff_ntaname` String,
        `dropoff_puma` UInt16
    ") SETTINGS input_format_try_infer_datetimes = 0
    ```

2. `INSERT` が完了するまで待ちます。150 MB のデータをダウンロードするため、少し時間がかかる場合があります。

3. 挿入が完了したら、次のクエリで成功したことを確認します:
    ```sql
    SELECT count() FROM trips
    ```

    このクエリは 1,999,657 行を返すはずです。



## データの分析 {#analyze-the-data}

データを分析するためにいくつかのクエリを実行します。以下の例を参照するか、独自のSQLクエリを試してください。

- 平均チップ額を計算する:

  ```sql
  SELECT round(avg(tip_amount), 2) FROM trips
  ```

    <details>
  <summary>期待される出力</summary>
  <p>
  
  ```response
  ┌─round(avg(tip_amount), 2)─┐
  │                      1.68 │
  └───────────────────────────┘
  ```

    </p>
  </details>

- 乗客数に基づいて平均料金を計算する:

  ```sql
  SELECT
      passenger_count,
      ceil(avg(total_amount),2) AS average_total_amount
  FROM trips
  GROUP BY passenger_count
  ```

    <details>
  <summary>期待される出力</summary>
  <p>

  `passenger_count`の範囲は0から9です:

  ```response
  ┌─passenger_count─┬─average_total_amount─┐
  │               0 │                22.69 │
  │               1 │                15.97 │
  │               2 │                17.15 │
  │               3 │                16.76 │
  │               4 │                17.33 │
  │               5 │                16.35 │
  │               6 │                16.04 │
  │               7 │                 59.8 │
  │               8 │                36.41 │
  │               9 │                 9.81 │
  └─────────────────┴──────────────────────┘
  ```

    </p>
  </details>

- 地区ごとの1日あたりの乗車回数を計算する:

  ```sql
  SELECT
      pickup_date,
      pickup_ntaname,
      SUM(1) AS number_of_trips
  FROM trips
  GROUP BY pickup_date, pickup_ntaname
  ORDER BY pickup_date ASC
  ```

    <details>
  <summary>期待される出力</summary>
  <p>

  ```response
  ┌─pickup_date─┬─pickup_ntaname───────────────────────────────────────────┬─number_of_trips─┐
  │  2015-07-01 │ Brooklyn Heights-Cobble Hill                             │              13 │
  │  2015-07-01 │ Old Astoria                                              │               5 │
  │  2015-07-01 │ Flushing                                                 │               1 │
  │  2015-07-01 │ Yorkville                                                │             378 │
  │  2015-07-01 │ Gramercy                                                 │             344 │
  │  2015-07-01 │ Fordham South                                            │               2 │
  │  2015-07-01 │ SoHo-TriBeCa-Civic Center-Little Italy                   │             621 │
  │  2015-07-01 │ Park Slope-Gowanus                                       │              29 │
  │  2015-07-01 │ Bushwick South                                           │               5 │
  ```

    </p>
  </details>

- 各乗車の長さを分単位で計算し、乗車時間ごとに結果をグループ化する:
  ```sql
  SELECT
      avg(tip_amount) AS avg_tip,
      avg(fare_amount) AS avg_fare,
      avg(passenger_count) AS avg_passenger,
      count() AS count,
      truncate(date_diff('second', pickup_datetime, dropoff_datetime)/60) as trip_minutes
  FROM trips
  WHERE trip_minutes > 0
  GROUP BY trip_minutes
  ORDER BY trip_minutes DESC
  ```
    <details>
  <summary>期待される出力</summary>
  <p>



    ```response
    ┌──────────────avg_tip─┬───────────avg_fare─┬──────avg_passenger─┬──count─┬─trip_minutes─┐
    │   1.9600000381469727 │                  8 │                  1 │      1 │        27511 │
    │                    0 │                 12 │                  2 │      1 │        27500 │
    │    0.542166673981895 │ 19.716666666666665 │ 1.9166666666666667 │     60 │         1439 │
    │    0.902499997522682 │ 11.270625001192093 │            1.95625 │    160 │         1438 │
    │   0.9715789457909146 │ 13.646616541353383 │ 2.0526315789473686 │    133 │         1437 │
    │   0.9682692398245518 │ 14.134615384615385 │  2.076923076923077 │    104 │         1436 │
    │   1.1022105210705808 │ 13.778947368421052 │  2.042105263157895 │     95 │         1435 │
    ```
    </p>
    </details>

- 各地域における時間帯別の配車回数を表示する：

  ```sql
  SELECT
      pickup_ntaname,
      toHour(pickup_datetime) as pickup_hour,
      SUM(1) AS pickups
  FROM trips
  WHERE pickup_ntaname != ''
  GROUP BY pickup_ntaname, pickup_hour
  ORDER BY pickup_ntaname, pickup_hour
  ```

    <details>
  <summary>期待される出力</summary>
  <p>

  ```response
  ┌─pickup_ntaname───────────────────────────────────────────┬─pickup_hour─┬─pickups─┐
  │ Airport                                                  │           0 │    3509 │
  │ Airport                                                  │           1 │    1184 │
  │ Airport                                                  │           2 │     401 │
  │ Airport                                                  │           3 │     152 │
  │ Airport                                                  │           4 │     213 │
  │ Airport                                                  │           5 │     955 │
  │ Airport                                                  │           6 │    2161 │
  │ Airport                                                  │           7 │    3013 │
  │ Airport                                                  │           8 │    3601 │
  │ Airport                                                  │           9 │    3792 │
  │ Airport                                                  │          10 │    4546 │
  │ Airport                                                  │          11 │    4659 │
  │ Airport                                                  │          12 │    4621 │
  │ Airport                                                  │          13 │    5348 │
  │ Airport                                                  │          14 │    5889 │
  │ Airport                                                  │          15 │    6505 │
  │ Airport                                                  │          16 │    6119 │
  │ Airport                                                  │          17 │    6341 │
  │ Airport                                                  │          18 │    6173 │
  │ Airport                                                  │          19 │    6329 │
  │ Airport                                                  │          20 │    6271 │
  │ Airport                                                  │          21 │    6649 │
  │ Airport                                                  │          22 │    6356 │
  │ Airport                                                  │          23 │    6016 │
  │ Allerton-Pelham Gardens                                  │           4 │       1 │
  │ Allerton-Pelham Gardens                                  │           6 │       1 │
  │ Allerton-Pelham Gardens                                  │           7 │       1 │
  │ Allerton-Pelham Gardens                                  │           9 │       5 │
  │ Allerton-Pelham Gardens                                  │          10 │       3 │
  │ Allerton-Pelham Gardens                                  │          15 │       1 │
  │ Allerton-Pelham Gardens                                  │          20 │       2 │
  │ Allerton-Pelham Gardens                                  │          23 │       1 │
  │ Annadale-Huguenot-Prince's Bay-Eltingville               │          23 │       1 │
  │ Arden Heights                                            │          11 │       1 │
  ```

    </p>
  </details>



7. LaGuardia または JFK 空港への乗車データを取得します:
    ```sql
    SELECT
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
    FROM trips
    WHERE dropoff_nyct2010_gid IN (132, 138)
    ORDER BY pickup_datetime
    ```

    <details>
    <summary>想定される出力</summary>
    <p>

    ```response
    ┌─────pickup_datetime─┬────dropoff_datetime─┬─total_amount─┬─pickup_nyct2010_gid─┬─dropoff_nyct2010_gid─┬─airport_code─┬─year─┬─day─┬─hour─┐
    │ 2015-07-01 00:04:14 │ 2015-07-01 00:15:29 │         13.3 │                 -34 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:09:42 │ 2015-07-01 00:12:55 │          6.8 │                  50 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:23:04 │ 2015-07-01 00:24:39 │          4.8 │                -125 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:27:51 │ 2015-07-01 00:39:02 │        14.72 │                -101 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:32:03 │ 2015-07-01 00:55:39 │        39.34 │                  48 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:34:12 │ 2015-07-01 00:40:48 │         9.95 │                 -93 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:38:26 │ 2015-07-01 00:49:00 │         13.3 │                 -11 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:41:48 │ 2015-07-01 00:44:45 │          6.3 │                 -94 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 01:06:18 │ 2015-07-01 01:14:43 │        11.76 │                  37 │                  132 │ JFK          │ 2015 │   1 │    1 │
    ```

    </p>
    </details>



## 辞書を作成する

辞書は、メモリ内に保存されるキーと値のペアのマッピングです。詳細については [Dictionaries](/sql-reference/dictionaries/index.md) を参照してください。

ClickHouse サービス内のテーブルに関連付けられた辞書を作成します。
テーブルと辞書は、ニューヨーク市内の各地区ごとの行を含む CSV ファイルに基づいています。

各地区は、ニューヨーク市の 5 つの行政区（Bronx、Brooklyn、Manhattan、Queens、Staten Island）および Newark Airport (EWR) に対応付けられています。

以下は、使用している CSV ファイルの一部をテーブル形式で示したものです。ファイル内の `LocationID` 列は、`trips` テーブル内の `pickup_nyct2010_gid` 列および `dropoff_nyct2010_gid` 列に対応付けられています。

| LocationID | Borough       | Zone                    | service&#95;zone |
| ---------- | ------------- | ----------------------- | ---------------- |
| 1          | EWR           | Newark Airport          | EWR              |
| 2          | Queens        | Jamaica Bay             | Boro Zone        |
| 3          | Bronx         | Allerton/Pelham Gardens | Boro Zone        |
| 4          | Manhattan     | Alphabet City           | Yellow Zone      |
| 5          | Staten Island | Arden Heights           | Boro Zone        |

1. 次の SQL コマンドを実行します。`taxi_zone_dictionary` という名前の辞書を作成し、S3 上の CSV ファイルから辞書を読み込みます。ファイルの URL は `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv` です。

```sql
CREATE DICTIONARY taxi_zone_dictionary
(
  `LocationID` UInt16 DEFAULT 0,
  `Borough` String,
  `Zone` String,
  `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED_ARRAY())
```

:::note
`LIFETIME` を 0 に設定すると、自動更新が無効になり、S3 バケットへの不要なトラフィックを避けられます。ほかのケースでは、別の値に設定してもかまいません。詳細については、[LIFETIME を使用したディクショナリデータの更新](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) を参照してください。
:::

3. 動作を検証します。次のクエリは 265 行、つまり各 neighborhood ごとに 1 行を返すはずです:
   ```sql
   SELECT * FROM taxi_zone_dictionary
   ```

4. `dictGet` 関数（[およびそのバリエーション](./sql-reference/functions/ext-dict-functions.md)）を使用して、ディクショナリから値を取得します。ディクショナリ名、取得したい値、キー（この例では `taxi_zone_dictionary` の `LocationID` 列）を引数として渡します。

   例えば、次のクエリは `LocationID` が 132 の `Borough` を返します。これは JFK 空港に対応しています:

   ```sql
   SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
   ```

   JFK は Queens にあります。値の取得時間が実質的に 0 であることに注目してください:

   ```response
   ┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
   │ Queens                                          │
   └─────────────────────────────────────────────────┘

   1 rows in set. Elapsed: 0.004 sec.
   ```

5. `dictHas` 関数を使用して、ディクショナリ内にキーが存在するかを確認します。例えば、次のクエリは `1`（ClickHouse における「true」）を返します:
   ```sql
   SELECT dictHas('taxi_zone_dictionary', 132)
   ```

6. 次のクエリは 0 を返します。これは、4567 がディクショナリ内の `LocationID` の値として存在しないためです:
   ```sql
   SELECT dictHas('taxi_zone_dictionary', 4567)
   ```

7. クエリ内で `dictGet` 関数を使って Borough 名（行政区名）を取得します。例えば:
   ```sql
   SELECT
       count(1) AS total,
       dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
   FROM trips
   WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
   GROUP BY borough_name
   ORDER BY total DESC
   ```


このクエリは、LaGuardia か JFK のいずれかの空港で終了するタクシー乗車の件数を区ごとに集計します。結果は次のようになり、乗車地点の地区が不明な乗車がかなり多いことに注目してください。

```response
┌─total─┬─borough_name──┐
│ 23683 │ Unknown       │
│  7053 │ Manhattan     │
│  6828 │ Brooklyn      │
│  4458 │ Queens        │
│  2670 │ Bronx         │
│   554 │ Staten Island │
│    53 │ EWR           │
└───────┴───────────────┘

7 rows in set. Elapsed: 0.019 sec. Processed 2.00 million rows, 4.00 MB (105.70 million rows/s., 211.40 MB/s.)
```


## 結合を実行する {#perform-a-join}

`taxi_zone_dictionary`と`trips`テーブルを結合するクエリを記述します。

1.  上記の空港クエリと同様に動作するシンプルな`JOIN`から始めます：

    ```sql
    SELECT
        count(1) AS total,
        Borough
    FROM trips
    JOIN taxi_zone_dictionary ON toUInt64(trips.pickup_nyct2010_gid) = taxi_zone_dictionary.LocationID
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY Borough
    ORDER BY total DESC
    ```

    レスポンスは`dictGet`クエリと同一になります：

    ```response
    ┌─total─┬─Borough───────┐
    │  7053 │ Manhattan     │
    │  6828 │ Brooklyn      │
    │  4458 │ Queens        │
    │  2670 │ Bronx         │
    │   554 │ Staten Island │
    │    53 │ EWR           │
    └───────┴───────────────┘

    6 rows in set. Elapsed: 0.034 sec. Processed 2.00 million rows, 4.00 MB (59.14 million rows/s., 118.29 MB/s.)
    ```

    :::note
    上記の`JOIN`クエリの出力は、`dictGetOrDefault`を使用した前のクエリと同じであることに注意してください（`Unknown`値が含まれていない点を除く）。内部的には、ClickHouseは`taxi_zone_dictionary`ディクショナリに対して実際に`dictGet`関数を呼び出していますが、`JOIN`構文はSQL開発者にとってより馴染み深いものです。
    :::

2.  このクエリは、チップ額が最も高い1000件の乗車データの行を返し、各行とディクショナリの内部結合を実行します：
    ```sql
    SELECT *
    FROM trips
    JOIN taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000
    ```
        :::note
        一般的に、ClickHouseでは`SELECT *`の頻繁な使用は避けるべきです。実際に必要な列のみを取得してください。
        :::

</VerticalStepper>


## 次のステップ {#next-steps}

ClickHouse についてさらに学ぶには、以下のドキュメントを参照してください：

- [ClickHouse におけるプライマリインデックス入門](./guides/best-practices/sparse-primary-indexes.md): ClickHouse がスパースなプライマリインデックスを使用して、クエリ時に関連するデータを効率的に特定する仕組みを解説します。 
- [外部データソースとの統合](/integrations/index.mdx): ファイル、Kafka、PostgreSQL、データパイプラインなどを含む、さまざまなデータソース統合オプションを確認します。
- [ClickHouse でデータを可視化する](./integrations/data-visualization/index.md): お好みの UI/BI ツールを ClickHouse に接続する方法を説明します。
- [SQL リファレンス](./sql-reference/index.md): データの変換、処理、分析に利用できる ClickHouse の SQL 関数を参照できます。
