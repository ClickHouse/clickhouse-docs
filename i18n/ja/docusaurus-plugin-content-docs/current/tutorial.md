---
slug: /tutorial
sidebar_label: 高度なチュートリアル
sidebar_position: 0.5
keywords: [clickhouse, install, tutorial, dictionary, dictionaries]
---
import SQLConsoleDetail from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';

# 高度なチュートリアル

## このチュートリアルで期待できることは？ {#what-to-expect-from-this-tutorial}

このチュートリアルでは、テーブルを作成し、大規模なデータセット（[ニューヨークのタクシーデータ](/getting-started/example-datasets/nyc-taxi.md)の200万行）を挿入します。そして、そのデータセットに対してクエリを実行し、辞書を作成してそれを使用してJOINを行う方法の例を含めます。

:::note
このチュートリアルは、稼働中の ClickHouse サービスにアクセスできることを前提としています。もしアクセスできない場合は、[クイックスタート](./quick-start.mdx)を確認してください。
:::

## 1. 新しいテーブルの作成 {#1-create-a-new-table}

ニューヨーク市のタクシーデータには、数百万のタクシーライドの詳細が含まれており、ピックアップおよびドロップオフの時間や場所、費用、チップ額、通行料、支払いタイプなどのカラムがあります。このデータを保存するためのテーブルを作成しましょう...

1. SQLコンソールに接続します。

  <SQLConsoleDetail />

  セルフマネージドのClickHouseを使用している場合、SQLコンソールにhttps://_hostname_:8443/playで接続できます（詳細はClickHouse管理者に確認してください）。

2. `default`データベースに以下の`trips`テーブルを作成します：
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

## 2. データセットの挿入 {#2-insert-the-dataset}

テーブルが作成されたので、NYCタクシーデータを追加しましょう。データはS3のCSVファイルにあり、そこからデータをロードできます。

1. 次のコマンドは、S3の2つの異なるファイル`trips_1.tsv.gz`と`trips_2.tsv.gz`から、約200万行を`trips`テーブルに挿入します：
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

2. `INSERT`が完了するまで待ちます - 150 MBのデータをダウンロードするのに少し時間がかかるかもしれません。

    :::note
    `s3`関数はデータを巧妙に解凍することができ、`TabSeparatedWithNames`形式はClickHouseにデータがタブ区切りであることと、各ファイルのヘッダー行をスキップするよう指示します。
    :::

3. 挿入が完了したら、正常に動作したか確認します：
    ```sql
    SELECT count() FROM trips
    ```

    約200万行（正確には1,999,657行）が表示されるはずです。

    :::note
    ClickHouseがカウントを決定するために処理しなければならなかった行数がいかに少なかったかに注目してください。わずか0.001秒でカウントを取得し、わずか6行が処理されました。
    :::

4. すべての行にヒットする必要があるクエリを実行すると、かなり多くの行を処理する必要があることがわかりますが、実行時間は依然として驚異的に速いです：
    ```sql
    SELECT DISTINCT(pickup_ntaname) FROM trips
    ```

    このクエリは200万行を処理して190の値を返さなければならず、約1秒で実行されます。`pickup_ntaname`カラムは、タクシー乗車地点のニューヨーク市内の近隣地域の名前を表します。

## 3. データの分析 {#3-analyze-the-data}

2M行のデータを分析するためにいくつかのクエリを実行しましょう...

1. 平均チップ額を計算するなどの簡単な計算から始めます：
    ```sql
    SELECT round(avg(tip_amount), 2) FROM trips
    ```

    返り値は次のようになります：
    ```response
    ┌─round(avg(tip_amount), 2)─┐
    │                      1.68 │
    └───────────────────────────┘
    ```

2. このクエリは、乗客数に基づいて平均コストを計算します：
    ```sql
    SELECT
        passenger_count,
        ceil(avg(total_amount),2) AS average_total_amount
    FROM trips
    GROUP BY passenger_count
    ```

    `passenger_count`の範囲は0から9です：
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

3. 各近隣地域ごとの日次ピックアップ数を計算するクエリです：
    ```sql
    SELECT
        pickup_date,
        pickup_ntaname,
        SUM(1) AS number_of_trips
    FROM trips
    GROUP BY pickup_date, pickup_ntaname
    ORDER BY pickup_date ASC
    ```

    結果は次のようになります：
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

4. このクエリは、旅行の長さを計算し、その値で結果をグループ化します：
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

    結果は次のようになります：
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

5. このクエリは、各近隣のピックアップ数を日ごとに区切った結果を表示します：
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

    結果は次のようになります：
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

7. ラガーディア空港またはJFKへの乗車を見てみましょう：
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

    返り値は次のようになります：
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

## 4. 辞書の作成 {#4-create-a-dictionary}

ClickHouseに不慣れな方は、***辞書***の仕組みを理解することが重要です。辞書を考えるシンプルな方法は、メモリに保存されるキーと値のペアのマッピングです。辞書の詳細とすべてのオプションは、チュートリアルの最後にリンクされています。

1. ClickHouseサービスのテーブルに関連付けられた辞書を作成する方法を見てみましょう。このテーブルおよび辞書は、NYCの各近隣地域に対して1行の265行を含むCSVファイルに基づいています。近隣地域は、ニューヨーク市の区の名前にマッピングされています（ニューヨーク市には5つの区があります：ブロンクス、ブルックリン、マンハッタン、クイーンズ、スタテンアイランド）、このファイルはニューアーク空港（EWR）を区としてもカウントします。

  CSVファイルの一部です（明確にするために表形式で表示されます）。ファイルの`LocationID`列は、`pickup_nyct2010_gid`および`dropoff_nyct2010_gid`列にマッピングされています：
  
    | LocationID      | Borough |  Zone      | service_zone |
    | ----------- | ----------- |   ----------- | ----------- |
    | 1      | EWR       |  ニューアーク空港   | EWR        |
    | 2    |   クイーンズ     |   ジャマイカ湾   |      Boro Zone   |
    | 3   |   ブロンクス     |  オールリントン/ペルハムガーデン    |    Boro Zone     |
    | 4     |    マンハッタン    |    アルファベットシティ  |     Yellow Zone    |
    | 5     |  スタテンアイランド      |   アーデンハイツ   |    Boro Zone     |

2. ファイルのURLは`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`です。次のSQLを実行して、`taxi_zone_dictionary`という名前の辞書を作成し、S3のCSVファイルから辞書をポピュレートします：
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
  `LIFETIME`を0に設定すると、この辞書はそのソースから更新されなくなります。これは、S3バケットへの不必要なトラフィックを送らないために使用されますが、一般的には、お好みのライフタイム値を指定できます。

    例えば：

    ```sql
    LIFETIME(MIN 1 MAX 10)
    ```
    は、辞書が1秒から10秒の間のランダムな時間で更新されることを指定します。（ランダムな時間は、大規模な数のサーバーでアップデート時の辞書ソースへの負荷を分散するために必要です。）
  :::

3. 正常に動作したか確認します - 265行（各近隣地域の1行）が得られるはずです：
    ```sql
    SELECT * FROM taxi_zone_dictionary
    ```

4. `dictGet`関数を使用して（[その変種](./sql-reference/functions/ext-dict-functions.md)でも）、辞書から値を取得します。辞書の名前、取得したい値、およびキーを渡します（この例では、`taxi_zone_dictionary`の`LocationID`列です）。

    例えば、次のクエリは、`LocationID`が132の`Borough`を返します（これは上で見たようにJFK空港です）：
    ```sql
    SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
    ```

    JFKはクイーンズにあり、値を取得する時間はほぼ0です：
    ```response
    ┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
    │ Queens                                          │
    └─────────────────────────────────────────────────┘

    1行の結果. 経過時間: 0.004秒.
    ```

5. `dictHas`関数を使用して、キーが辞書に存在するかどうかを確認します。例えば、次のクエリは1を返します（ClickHouseでは「true」です）：
    ```sql
    SELECT dictHas('taxi_zone_dictionary', 132)
    ```

6. 次のクエリは、4567が辞書の`LocationID`の値でないため0を返します：
    ```sql
    SELECT dictHas('taxi_zone_dictionary', 4567)
    ```

7. クエリ内で辞書の地域名を取得するために`dictGet`関数を使用します。例えば：
    ```sql
    SELECT
        count(1) AS total,
        dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
    FROM trips
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY borough_name
    ORDER BY total DESC
    ```

    このクエリは、ラガーディアまたはJFK空港で終わるタクシーライドの各区の数を合計します。結果は以下のようになり、ピックアップ近隣地域が不明な旅行がかなりあることに注目してください：
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

    7行の結果. 経過時間: 0.019秒. 処理された行数: 200万行, サイズ: 4.00 MB (105.70百万行/sec, 211.40 MB/sec.)
    ```

## 5. JOINの実行 {#5-perform-a-join}

`taxi_zone_dictionary`と`trips`テーブルをJOINするクエリを書きましょう。

1. 以前の空港クエリと同様に動作する簡単なJOINから始めることができます：
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

    返り値は馴染みのあるものです：
    ```response
    ┌─total─┬─Borough───────┐
    │  7053 │ Manhattan     │
    │  6828 │ Brooklyn      │
    │  4458 │ Queens        │
    │  2670 │ Bronx         │
    │   554 │ Staten Island │
    │    53 │ EWR           │
    └───────┴───────────────┘

    6行の結果. 経過時間: 0.034秒. 処理された行数: 200万行, サイズ: 4.00 MB (59.14百万行/sec, 118.29 MB/sec.)
    ```

    :::note
    上記の`JOIN`クエリの出力は、`dictGetOrDefault`を使用した前のクエリと同じ（ただし、`Unknown`の値は含まれていません）ことに注目してください。実際には、ClickHouseは`taxi_zone_dictionary`辞書に対して`dictGet`関数を呼び出していますが、`JOIN`構文はSQL開発者にとって馴染みやすいものです。
    :::

2. ClickHouseでは`SELECT *`を頻繁に使用しません - 実際に必要なカラムのみを取得するべきです！しかし、遅いクエリを見つけるのは難しいので、このクエリは故意にすべてのカラムを選択し、辞書に対して各行との右JOINを行います（ただし、デフォルトで応答には10,000行の最大制限があります）：
    ```sql
    SELECT *
    FROM trips
    JOIN taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000
    ```

#### おめでとうございます！ {#congrats}

うまくいきました - チュートリアルを終了しました。ClickHouseの使用方法についての理解が深まったことを願っています。次に何をすべきかのオプションは以下の通りです：

- [ClickHouseにおける主キーの仕組み](./guides/best-practices/sparse-primary-indexes.md)を読む - この知識はClickHouseの専門家になるための旅を大きく前進させるでしょう
- [Kafka、PostgreSQL、データパイプラインなど、さまざまな外部データソースを統合する](/integrations/index.mdx)
- [お気に入りのUI/BIツール](./integrations/data-visualization/index.md)をClickHouseに接続する
- [SQLリファレンス](./sql-reference/index.md)を確認し、さまざまな関数を閲覧する。ClickHouseには、データの変換、処理、分析のための素晴らしい関数のコレクションがあります
- [辞書についてさらに学ぶ](/sql-reference/dictionaries/index.md)
