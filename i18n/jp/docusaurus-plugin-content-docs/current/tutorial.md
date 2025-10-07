---
'slug': '/tutorial'
'sidebar_label': '高度なチュートリアル'
'title': '高度なチュートリアル'
'description': 'ClickHouseを使用して、ニューヨーク市のタクシーの例のデータセットを取り込み、クエリする方法を学びます。'
'sidebar_position': 0.5
'keywords':
- 'clickhouse'
- 'install'
- 'tutorial'
- 'dictionary'
- 'dictionaries'
- 'example'
- 'advanced'
- 'taxi'
- 'new york'
- 'nyc'
'show_related_blogs': true
'doc_type': 'guide'
---


# 高度なチュートリアル

## 概要 {#overview}

New York Cityのタクシー例データセットを使用して、ClickHouseにデータを取り込み、クエリを実行する方法を学びます。

### 事前条件 {#prerequisites}

このチュートリアルを完了するには、稼働中のClickHouseサービスへのアクセスが必要です。手順については、[クイックスタート](/get-started/quick-start)ガイドを参照してください。

<VerticalStepper>

## 新しいテーブルを作成する {#create-a-new-table}

New York Cityのタクシーデータセットには、チップの金額、通行料、支払い方法などを含む、何百万件ものタクシーライドの詳細が含まれています。このデータを格納するテーブルを作成します。

1. SQLコンソールに接続します：
    - ClickHouse Cloudの場合、ドロップダウンメニューからサービスを選択し、次に左側のナビゲーションメニューから**SQLコンソール**を選択します。
    - セルフマネージドのClickHouseの場合は、`https://_hostname_:8443/play`でSQLコンソールに接続します。詳細についてはClickHouse管理者に確認してください。

2. `default`データベースに次の`trips`テーブルを作成します：
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

テーブルを作成したので、S3にあるCSVファイルからNew York Cityのタクシーデータを追加します。

1. 次のコマンドは、S3にある2つの異なるファイル`trips_1.tsv.gz`と`trips_2.tsv.gz`から、約2,000,000行を`trips`テーブルに挿入します：

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

2. `INSERT`が完了するまで待ちます。150MBのデータがダウンロードされるまでにはしばらく時間がかかる場合があります。

3. 挿入が完了したら、正しく動作したことを確認します：
```sql
SELECT count() FROM trips
```

    このクエリは1,999,657行を返すはずです。

## データを分析する {#analyze-the-data}

データを分析するためにいくつかのクエリを実行します。以下の例を探索するか、自分のSQLクエリを試してみてください。 

- 平均チップ金額を計算します：
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

- 乗客数に基づく平均コストを計算します：
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

    `passenger_count`は0から9の範囲です：

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

- 地域ごとの1日のピックアップ数を計算します：
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

- 各旅行の長さを分単位で計算し、旅行の長さで結果をグループ化します：
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

- 時間帯ごとの地域ごとのピックアップ数を表示します：
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
    
7. LaGuardiaまたはJFK空港へのライドを取得します：
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
    <summary>期待される出力</summary>
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

## 辞書を作成する {#create-a-dictionary}

辞書は、メモリ内に格納されたキーとバリューのペアのマッピングです。詳細については、[辞書](/sql-reference/dictionaries/index.md)を参照してください。

ClickHouseサービス内のテーブルに関連付けられた辞書を作成します。テーブルと辞書は、New York Cityの各地域で1行を含むCSVファイルに基づいています。

地域は、New York Cityの5つの区（Bronx、Brooklyn、Manhattan、Queens、Staten Island）とニューワーク空港（EWR）の名前にマッピングされています。

以下は、テーブル形式で使用しているCSVファイルの抜粋です。ファイル内の`LocationID`列は、`trips`テーブルの`pickup_nyct2010_gid`および`dropoff_nyct2010_gid`列にマッピングされています：

  | LocationID      | Borough |  Zone      | service_zone |
  | ----------- | ----------- |   ----------- | ----------- |
  | 1      | EWR       |  Newark Airport   | EWR        |
  | 2    |   Queens     |   Jamaica Bay   |      Boro Zone   |
  | 3   |   Bronx     |  Allerton/Pelham Gardens    |    Boro Zone     |
  | 4     |    Manhattan    |    Alphabet City  |     Yellow Zone    |
  | 5     |  Staten Island      |   Arden Heights   |    Boro Zone     |

1. 次のSQLコマンドを実行し、`taxi_zone_dictionary`という名前の辞書を作成し、S3のCSVファイルから辞書をポピュレートします。ファイルのURLは`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`です。
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
  `LIFETIME`を0に設定すると、S3バケットへの不要なトラフィックを避けるために自動更新が無効になります。その他の場合は、異なる設定にすることができます。詳細については、[LIFETIMEを使用した辞書データの更新](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)を参照してください。
  :::

3. 正しく動作したことを確認します。次のクエリは265行を返すはずです。これはそれぞれの地域1行に相当します：
```sql
SELECT * FROM taxi_zone_dictionary
```

4. `dictGet`関数（[またはそのバリエーション](./sql-reference/functions/ext-dict-functions.md)）を使用して、辞書から値を取得します。辞書の名前、取得したい値、およびキー（この例では`taxi_zone_dictionary`の`LocationID`列）を渡します。

    たとえば、次のクエリは、`LocationID`が132である`Borough`を返します（これはJFK空港に対応します）：
```sql
SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
```

    JFKはQueensにあります。値を取得するための時間はほぼ0です：
```response
┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
│ Queens                                          │
└─────────────────────────────────────────────────┘

1 rows in set. Elapsed: 0.004 sec.
```

5. `dictHas`関数を使用して、辞書にキーが存在するかどうかを確認します。たとえば、次のクエリは`1`を返します（ClickHouseでは「true」です）：
```sql
SELECT dictHas('taxi_zone_dictionary', 132)
```

6. 次のクエリは0を返します。なぜなら4567は辞書の`LocationID`の値ではないからです：
```sql
SELECT dictHas('taxi_zone_dictionary', 4567)
```

7. クエリ内で borough の名前を取得するために `dictGet` 関数を使用します。例えば：
```sql
SELECT
    count(1) AS total,
    dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
FROM trips
WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
GROUP BY borough_name
ORDER BY total DESC
```

    このクエリは、LaGuardiaまたはJFK空港で終了するタクシーライドの数を各 borough ごとに合計します。結果は次のようになり、ピックアップ地域が不明の旅行がいくつかあることに注意してください：
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

## ジョインを実行する {#perform-a-join}

`taxi_zone_dictionary`を`trips`テーブルとジョインするクエリを書きます。

1. 前述の空港クエリと同様に機能するシンプルな`JOIN`から始めます：
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

    応答は`dictGet`クエリと同じになります：
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
    上記の`JOIN`クエリの出力は、`dictGetOrDefault`を使用した前のクエリと同じです（ただし、`Unknown`値は含まれていません）。背後では、ClickHouseは実際に`taxi_zone_dictionary`辞書の`dictGet`関数を呼び出していますが、`JOIN`構文はSQL開発者にはより馴染みがあります。
    :::

2. このクエリは、最も高いチップ金額を持つ1000件の旅行の行を返し、各行を辞書と内部ジョインします：
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
        一般的に、ClickHouseでは`SELECT *`をあまり使用しないようにしています。実際に必要なカラムだけを取得するべきです。
        :::

</VerticalStepper>

## 次のステップ {#next-steps}

以下のドキュメントでClickHouseについてさらに学びます：

- [ClickHouseの主インデックスの紹介](./guides/best-practices/sparse-primary-indexes.md)：ClickHouseがクエリの際に関連データを効率的に見つけるためにスパース主インデックスをどのように使用するかを学びます。 
- [外部データソースを統合する](/integrations/index.mdx)：ファイル、Kafka、PostgreSQL、データパイプラインなどを含むデータソースの統合オプションを確認します。
- [ClickHouseでデータを可視化する](./integrations/data-visualization/index.md)：お気に入りのUI/BIツールをClickHouseに接続します。
- [SQLリファレンス](./sql-reference/index.md)：データを変換、処理、分析するためにClickHouseで使用可能なSQL関数を参照します。
