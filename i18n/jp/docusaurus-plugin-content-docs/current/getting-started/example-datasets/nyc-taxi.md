---
description: "2009年以降のニューヨーク市発の数十億のタクシーおよびハイヤー車両（Uber、Lyftなど）トリップデータ"
slug: /getting-started/example-datasets/nyc-taxi
sidebar_label: ニューヨークタクシーデータ
sidebar_position: 2
title: "ニューヨークタクシーデータ"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ニューヨークタクシーデータは、2009年以降ニューヨーク市で発生した30億件以上のタクシーおよびハイヤー車両（Uber、Lyftなど）のトリップから構成されています。このデータセットは、以下の2つの方法で取得できます：

- S3またはGCSから直接ClickHouse Cloudにデータを挿入する
- 準備されたパーティションをダウンロードする

## tripsテーブルの作成 {#create-the-table-trips}

タクシーの乗車データ用のテーブルを作成することから始めます：

```sql
CREATE TABLE trips (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

## オブジェクトストレージからデータを直接ロードする {#load-the-data-directly-from-object-storage}

データに慣れるために、小さなサブセットを取得しましょう。データはTSVファイルとしてオブジェクトストレージにあり、`s3`テーブル関数を使用してClickHouse Cloudにストリームするのが簡単です。

同じデータがS3とGCSの両方に格納されているので、いずれかのタブを選択してください。

<Tabs groupId="storageVendor">
<TabItem value="gcs" label="GCS" default>

以下のコマンドは、`trips`テーブルにGCSバケットから3つのファイルをストリーミングします（`{0..2}`構文は0、1、2の値のワイルドカードです）：

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

</TabItem>
<TabItem value="s3" label="S3">

以下のコマンドは、`trips`テーブルにS3バケットから3つのファイルをストリーミングします（`{0..2}`構文は0、1、2の値のワイルドカードです）：

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

</TabItem>
</Tabs>

## サンプルクエリ {#sample-queries}

挿入された行数を確認してみましょう：

```sql
SELECT count()
FROM trips;
```

各TSVファイルには約100万行があり、3つのファイルに合計3,000,317行が含まれています。では、いくつかの行を見てみましょう：

```sql
SELECT *
FROM trips
LIMIT 10;
```

ピックアップおよびドロップオフの日付、地理座標、運賃の詳細、ニューヨークの近隣地区などのカラムがあります：

```response
┌────trip_id─┬─────pickup_datetime─┬────dropoff_datetime─┬───pickup_longitude─┬────pickup_latitude─┬──dropoff_longitude─┬───dropoff_latitude─┬─passenger_count─┬─trip_distance─┬─fare_amount─┬─extra─┬─tip_amount─┬─tolls_amount─┬─total_amount─┬─payment_type─┬─pickup_ntaname─────────────────────────────┬─dropoff_ntaname────────────────────────────┐
│ 1200864931 │ 2015-07-01 00:00:13 │ 2015-07-01 00:14:41 │ -73.99046325683594 │ 40.746116638183594 │ -73.97918701171875 │  40.78467559814453 │               5 │          3.54 │        13.5 │   0.5 │          1 │            0 │         15.8 │ CSH          │ Midtown-Midtown South                      │ Upper West Side                            │
│ 1200018648 │ 2015-07-01 00:00:16 │ 2015-07-01 00:02:57 │ -73.78358459472656 │ 40.648677825927734 │ -73.80242919921875 │  40.64767837524414 │               1 │          1.45 │           6 │   0.5 │          0 │            0 │          7.3 │ CRE          │ Airport                                    │ Airport                                    │
│ 1201452450 │ 2015-07-01 00:00:20 │ 2015-07-01 00:11:07 │ -73.98579406738281 │  40.72777557373047 │ -74.00482177734375 │  40.73748779296875 │               5 │          1.56 │         8.5 │   0.5 │       1.96 │            0 │        11.76 │ CSH          │ East Village                               │ West Village                               │
│ 1202368372 │ 2015-07-01 00:00:40 │ 2015-07-01 00:05:46 │ -74.00206756591797 │  40.73833084106445 │ -74.00658416748047 │  40.74875259399414 │               2 │             1 │           6 │   0.5 │          0 │            0 │          7.3 │ CRE          │ West Village                               │ Hudson Yards-Chelsea-Flatiron-Union Square │
│ 1200831168 │ 2015-07-01 00:01:06 │ 2015-07-01 00:09:23 │ -73.98748016357422 │  40.74344253540039 │ -74.00575256347656 │ 40.716793060302734 │               1 │           2.3 │           9 │   0.5 │          2 │            0 │         12.3 │ CSH          │ Hudson Yards-Chelsea-Flatiron-Union Square │ SoHo-TriBeCa-Civic Center-Little Italy     │
│ 1201362116 │ 2015-07-01 00:01:07 │ 2015-07-01 00:03:31 │  -73.9926986694336 │  40.75826644897461 │ -73.98628997802734 │  40.76075744628906 │               1 │           0.6 │           4 │   0.5 │          0 │            0 │          5.3 │ CRE          │ Clinton                                    │ Midtown-Midtown South                      │
│ 1200639419 │ 2015-07-01 00:01:13 │ 2015-07-01 00:03:56 │ -74.00382995605469 │ 40.741981506347656 │ -73.99711608886719 │ 40.742271423339844 │               1 │          0.49 │           4 │   0.5 │          0 │            0 │          5.3 │ CRE          │ Hudson Yards-Chelsea-Flatiron-Union Square │ Hudson Yards-Chelsea-Flatiron-Union Square │
│ 1201181622 │ 2015-07-01 00:01:17 │ 2015-07-01 00:05:12 │  -73.9512710571289 │  40.78261947631836 │ -73.95230865478516 │  40.77476119995117 │               4 │          0.97 │           5 │   0.5 │          1 │            0 │          7.3 │ CSH          │ Upper East Side-Carnegie Hill              │ Yorkville                                  │
│ 1200978273 │ 2015-07-01 00:01:28 │ 2015-07-01 00:09:46 │ -74.00822448730469 │  40.72113037109375 │ -74.00422668457031 │  40.70782470703125 │               1 │          1.71 │         8.5 │   0.5 │       1.96 │            0 │        11.76 │ CSH          │ SoHo-TriBeCa-Civic Center-Little Italy     │ Battery Park City-Lower Manhattan          │
│ 1203283366 │ 2015-07-01 00:01:47 │ 2015-07-01 00:24:26 │ -73.98199462890625 │  40.77289962768555 │ -73.91968536376953 │ 40.766082763671875 │               3 │          5.26 │        19.5 │   0.5 │        5.2 │            0 │           26 │ CSH          │ Lincoln Square                             │ Astoria                                    │
└────────────┴─────────────────────┴─────────────────────┴────────────────────┴────────────────────┴────────────────────┴────────────────────┴─────────────────┴───────────────┴─────────────┴───────┴────────────┴──────────────┴──────────────┴──────────────┴────────────────────────────────────────────┴────────────────────────────────────────────┘
```

いくつかのクエリを実行しましょう。このクエリは、最も頻繁にピックアップされた上位10の近隣地区を示します：

```sql
SELECT
   pickup_ntaname,
   count(*) AS count
FROM trips
GROUP BY pickup_ntaname
ORDER BY count DESC
LIMIT 10;
```

結果は以下の通りです：

```response
┌─pickup_ntaname─────────────────────────────┬──count─┐
│ Midtown-Midtown South                      │ 526864 │
│ Hudson Yards-Chelsea-Flatiron-Union Square │ 288797 │
│ West Village                               │ 210436 │
│ Turtle Bay-East Midtown                    │ 197111 │
│ Upper East Side-Carnegie Hill              │ 184327 │
│ Airport                                    │ 151343 │
│ SoHo-TriBeCa-Civic Center-Little Italy     │ 144967 │
│ Murray Hill-Kips Bay                       │ 138599 │
│ Upper West Side                            │ 135469 │
│ Clinton                                    │ 130002 │
└────────────────────────────────────────────┴────────┘
```

このクエリは、乗客数に基づく平均運賃を示します：

```sql
SELECT
   passenger_count,
   avg(total_amount)
FROM trips
GROUP BY passenger_count;
```

```response
┌─passenger_count─┬──avg(total_amount)─┐
│               0 │ 25.226335263065018 │
│               1 │ 15.961279340656672 │
│               2 │ 17.146174183960667 │
│               3 │  17.65380033178517 │
│               4 │ 17.248804201047456 │
│               5 │ 16.353501285179135 │
│               6 │ 15.995094439202836 │
│               7 │ 62.077143805367605 │
│               8 │ 26.120000791549682 │
│               9 │ 10.300000190734863 │
└─────────────────┴────────────────────┘
```

こちらは、乗客数とトリップの距離の相関を示します：

```sql
SELECT
   passenger_count,
   toYear(pickup_datetime) AS year,
   round(trip_distance) AS distance,
   count(*)
FROM trips
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;
```

結果の最初の部分は以下の通りです：

```response
┌─passenger_count─┬─year─┬─distance─┬─count()─┐
│               1 │ 2015 │        1 │  748644 │
│               1 │ 2015 │        2 │  521602 │
│               1 │ 2015 │        3 │  225077 │
│               2 │ 2015 │        1 │  144990 │
│               1 │ 2015 │        4 │  134782 │
│               1 │ 2015 │        0 │  127284 │
│               2 │ 2015 │        2 │  106411 │
│               1 │ 2015 │        5 │   72725 │
│               5 │ 2015 │        1 │   59343 │
│               1 │ 2015 │        6 │   53447 │
│               2 │ 2015 │        3 │   48019 │
│               3 │ 2015 │        1 │   44865 │
│               6 │ 2015 │        1 │   39409 │
```

## 準備されたパーティションのダウンロード {#download-of-prepared-partitions}

:::note
以下の手順は、元のデータセットに関する情報と、セルフマネージドのClickHouseサーバー環境に準備されたパーティションをロードするための方法を提供します。
:::

https://github.com/toddwschneider/nyc-taxi-data 及び http://tech.marksblogg.com/billion-nyc-taxi-rides-redshift.html を参照し、データセットの説明とダウンロード手順を確認してください。

ダウンロードすると、約227GBの未圧縮データがCSVファイルで得られます。ダウンロードには、1Gbitの接続で約1時間かかります（s3.amazonaws.comからの並行ダウンロードは、少なくとも1Gbitチャンネルの半分を回復します）。
一部のファイルは完全にダウンロードされない可能性があります。ファイルサイズを確認し、疑わしいものは再ダウンロードしてください。

```bash
$ curl -O https://datasets.clickhouse.com/trips_mergetree/partitions/trips_mergetree.tar

# チェックサムを検証
$ md5sum trips_mergetree.tar

# チェックサムは以下と等しい必要があります: f3b8d469b41d9a82da064ded7245d12c
$ tar xvf trips_mergetree.tar -C /var/lib/clickhouse # ClickHouseデータディレクトリへのパス
$ # 解凍したデータの権限を確認し、必要に応じて修正
$ sudo service clickhouse-server restart
$ clickhouse-client --query "select count(*) from datasets.trips_mergetree"
```

:::info
以下のクエリを実行する場合は、完全なテーブル名 `datasets.trips_mergetree` を使用する必要があります。
:::

## 単一サーバー上の結果 {#results-on-single-server}

Q1:

```sql
SELECT cab_type, count(*) FROM trips_mergetree GROUP BY cab_type;
```

0.490秒。

Q2:

```sql
SELECT passenger_count, avg(total_amount) FROM trips_mergetree GROUP BY passenger_count;
```

1.224秒。

Q3:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, count(*) FROM trips_mergetree GROUP BY passenger_count, year;
```

2.104秒。

Q4:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, round(trip_distance) AS distance, count(*)
FROM trips_mergetree
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;
```

3.593秒。

以下のサーバーが使用されました：

Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz 2基、物理コア合計16、RAM 128 GiB、8x6 TB HDでRAID-5構成

実行時間は3回の実行の中で最良のものです。ただし、2回目の実行から、クエリはファイルシステムキャッシュからデータを読み取ります。これ以降のキャッシュは発生せず、各実行でデータは読み出され、処理されます。

三台のサーバーでのテーブルの作成：

各サーバーで：

```sql
CREATE TABLE default.trips_mergetree_third ( trip_id UInt32,  vendor_id Enum8('1' = 1, '2' = 2, 'CMT' = 3, 'VTS' = 4, 'DDS' = 5, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14),  pickup_date Date,  pickup_datetime DateTime,  dropoff_date Date,  dropoff_datetime DateTime,  store_and_fwd_flag UInt8,  rate_code_id UInt8,  pickup_longitude Float64,  pickup_latitude Float64,  dropoff_longitude Float64,  dropoff_latitude Float64,  passenger_count UInt8,  trip_distance Float64,  fare_amount Float32,  extra Float32,  mta_tax Float32,  tip_amount Float32,  tolls_amount Float32,  ehail_fee Float32,  improvement_surcharge Float32,  total_amount Float32,  payment_type_ Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),  trip_type UInt8,  pickup FixedString(25),  dropoff FixedString(25),  cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),  pickup_nyct2010_gid UInt8,  pickup_ctlabel Float32,  pickup_borocode UInt8,  pickup_boroname Enum8('' = 0, 'Manhattan' = 1, 'Bronx' = 2, 'Brooklyn' = 3, 'Queens' = 4, 'Staten Island' = 5),  pickup_ct2010 FixedString(6),  pickup_boroct2010 FixedString(7),  pickup_cdeligibil Enum8(' ' = 0, 'E' = 1, 'I' = 2),  pickup_ntacode FixedString(4),  pickup_ntaname Enum16('' = 0, 'Airport' = 1, 'Allerton-Pelham Gardens' = 2, 'Annadale-Huguenot-Prince\'s Bay-Eltingville' = 3, 'Arden Heights' = 4, 'Astoria' = 5, 'Auburndale' = 6, 'Baisley Park' = 7, 'Bath Beach' = 8, 'Battery Park City-Lower Manhattan' = 9, 'Bay Ridge' = 10, 'Bayside-Bayside Hills' = 11, 'Bedford' = 12, 'Bedford Park-Fordham North' = 13, 'Bellerose' = 14, 'Belmont' = 15, 'Bensonhurst East' = 16, 'Bensonhurst West' = 17, 'Borough Park' = 18, 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel' = 19, 'Briarwood-Jamaica Hills' = 20, 'Brighton Beach' = 21, 'Bronxdale' = 22, 'Brooklyn Heights-Cobble Hill' = 23, 'Brownsville' = 24, 'Bushwick North' = 25, 'Bushwick South' = 26, 'Cambria Heights' = 27, 'Canarsie' = 28, 'Carroll Gardens-Columbia Street-Red Hook' = 29, 'Central Harlem North-Polo Grounds' = 30, 'Central Harlem South' = 31, 'Charleston-Richmond Valley-Tottenville' = 32, 'Chinatown' = 33, 'Claremont-Bathgate' = 34, 'Clinton' = 35, 'Clinton Hill' = 36, 'Co-op City' = 37, 'College Point' = 38, 'Corona' = 39, 'Crotona Park East' = 40, 'Crown Heights North' = 41, 'Crown Heights South' = 42, 'Cypress Hills-City Line' = 43, 'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill' = 44, 'Douglas Manor-Douglaston-Little Neck' = 45, 'Dyker Heights' = 46, 'East Concourse-Concourse Village' = 47, 'East Elmhurst' = 48, 'East Flatbush-Farragut' = 49, 'East Flushing' = 50, 'East Harlem North' = 51, 'East Harlem South' = 52, 'East New York' = 53, 'East New York (Pennsylvania Ave)' = 54, 'East Tremont' = 55, 'East Village' = 56, 'East Williamsburg' = 57, 'Eastchester-Edenwald-Baychester' = 58, 'Elmhurst' = 59, 'Elmhurst-Maspeth' = 60, 'Erasmus' = 61, 'Far Rockaway-Bayswater' = 62, 'Flatbush' = 63, 'Flatlands' = 64, 'Flushing' = 65, 'Fordham South' = 66, 'Forest Hills' = 67, 'Fort Greene' = 68, 'Fresh Meadows-Utopia' = 69, 'Ft. Totten-Bay Terrace-Clearview' = 70, 'Georgetown-Marine Park-Bergen Beach-Mill Basin' = 71, 'Glen Oaks-Floral Park-New Hyde Park' = 72, 'Glendale' = 73, 'Gramercy' = 74, 'Grasmere-Arrochar-Ft. Wadsworth' = 75, 'Gravesend' = 76, 'Great Kills' = 77, 'Greenpoint' = 78, 'Grymes Hill-Clifton-Fox Hills' = 79, 'Hamilton Heights' = 80, 'Hammels-Arverne-Edgemere' = 81, 'Highbridge' = 82, 'Hollis' = 83, 'Homecrest' = 84, 'Hudson Yards-Chelsea-Flatiron-Union Square' = 85, 'Hunters Point-Sunnyside-West Maspeth' = 86, 'Hunts Point' = 87, 'Jackson Heights' = 88, 'Jamaica' = 89, 'Jamaica Estates-Holliswood' = 90, 'Kensington-Ocean Parkway' = 91, 'Kew Gardens' = 92, 'Kew Gardens Hills' = 93, 'Kingsbridge Heights' = 94, 'Laurelton' = 95, 'Lenox Hill-Roosevelt Island' = 96, 'Lincoln Square' = 97, 'Lindenwood-Howard Beach' = 98, 'Longwood' = 99, 'Lower East Side' = 100, 'Madison' = 101, 'Manhattanville' = 102, 'Marble Hill-Inwood' = 103, 'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville' = 104, 'Maspeth' = 105, 'Melrose South-Mott Haven North' = 106, 'Middle Village' = 107, 'Midtown-Midtown South' = 108, 'Midwood' = 109, 'Morningside Heights' = 110, 'Morrisania-Melrose' = 111, 'Mott Haven-Port Morris' = 112, 'Mount Hope' = 113, 'Murray Hill' = 114, 'Murray Hill-Kips Bay' = 115, 'New Brighton-Silver Lake' = 116, 'New Dorp-Midland Beach' = 117, 'New Springville-Bloomfield-Travis' = 118, 'North Corona' = 119, 'North Riverdale-Fieldston-Riverdale' = 120, 'North Side-South Side' = 121, 'Norwood' = 122, 'Oakland Gardens' = 123, 'Oakwood-Oakwood Beach' = 124, 'Ocean Hill' = 125, 'Ocean Parkway South' = 126, 'Old Astoria' = 127, 'Old Town-Dongan Hills-South Beach' = 128, 'Ozone Park' = 129, 'Park Slope-Gowanus' = 130, 'Parkchester' = 131, 'Pelham Bay-Country Club-City Island' = 132, 'Pelham Parkway' = 133, 'Pomonok-Flushing Heights-Hillcrest' = 134, 'Port Richmond' = 135, 'Prospect Heights' = 136, 'Prospect Lefferts Gardens-Wingate' = 137, 'Queens Village' = 138, 'Queensboro Hill' = 139, 'Queensbridge-Ravenswood-Long Island City' = 140, 'Rego Park' = 141, 'Richmond Hill' = 142, 'Ridgewood' = 143, 'Rikers Island' = 144, 'Rosedale' = 145, 'Rossville-Woodrow' = 146, 'Rugby-Remsen Village' = 147, 'Schuylerville-Throgs Neck-Edgewater Park' = 148, 'Seagate-Coney Island' = 149, 'Sheepshead Bay-Gerritsen Beach-Manhattan Beach' = 150, 'SoHo-TriBeCa-Civic Center-Little Italy' = 151, 'Soundview-Bruckner' = 152, 'Soundview-Castle Hill-Clason Point-Harding Park' = 153, 'South Jamaica' = 154, 'South Ozone Park' = 155, 'Springfield Gardens North' = 156, 'Springfield Gardens South-Brookville' = 157, 'Spuyten Duyvil-Kingsbridge' = 158, 'St. Albans' = 159, 'Stapleton-Rosebank' = 160, 'Starrett City' = 161, 'Steinway' = 162, 'Stuyvesant Heights' = 163, 'Stuyvesant Town-Cooper Village' = 164, 'Sunset Park East' = 165, 'Sunset Park West' = 166, 'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill' = 167, 'Turtle Bay-East Midtown' = 168, 'University Heights-Morris Heights' = 169, 'Upper East Side-Carnegie Hill' = 170, 'Upper West Side' = 171, 'Van Cortlandt Village' = 172, 'Van Nest-Morris Park-Westchester Square' = 173, 'Washington Heights North' = 174, 'Washington Heights South' = 175, 'West Brighton' = 176, 'West Concourse' = 177, 'West Farms-Bronx River' = 178, 'West New Brighton-New Brighton-St. George' = 179, 'West Village' = 180, 'Westchester-Unionport' = 181, 'Westerleigh' = 182, 'Whitestone' = 183, 'Williamsbridge-Olinville' = 184, 'Williamsburg' = 185, 'Windsor Terrace' = 186, 'Woodhaven' = 187, 'Woodlawn-Wakefield' = 188, 'Woodside' = 189, 'Yorkville' = 190, 'park-cemetery-etc-Bronx' = 191, 'park-cemetery-etc-Brooklyn' = 192, 'park-cemetery-etc-Manhattan' = 193, 'park-cemetery-etc-Queens' = 194, 'park-cemetery-etc-Staten Island' = 195),  dropoff_puma UInt16) ENGINE = MergeTree(pickup_date, pickup_datetime, 8192);
```

ソースサーバーで：

```sql
CREATE TABLE trips_mergetree_x3 AS trips_mergetree_third ENGINE = Distributed(perftest, default, trips_mergetree_third, rand());
```

次のクエリはデータを再分配します：

```sql
INSERT INTO trips_mergetree_x3 SELECT * FROM trips_mergetree;
```

これには2454秒を要します。

三台のサーバーで：

Q1: 0.212秒。
Q2: 0.438秒。
Q3: 0.733秒。
Q4: 1.241秒。

驚きはありません。クエリは線形にスケールします。

140台のサーバークラスターからの結果もあります：

Q1: 0.028秒。
Q2: 0.043秒。
Q3: 0.051秒。
Q4: 0.072秒。

この場合、クエリ処理時間は主にネットワーク遅延によって決定されます。
クラスターが位置するデータセンターとは異なる場所にあるクライアントでクエリを実行したため、約20msの遅延が加わりました。

## サマリー {#summary}

| サーバー数 | Q1    | Q2    | Q3    | Q4    |
|---------|-------|-------|-------|-------|
| 1, E5-2650v2          | 0.490 | 1.224 | 2.104 | 3.593 |
| 3, E5-2650v2          | 0.212 | 0.438 | 0.733 | 1.241 |
| 1, AWS c5n.4xlarge    | 0.249 | 1.279 | 1.738 | 3.527 |
| 1, AWS c5n.9xlarge    | 0.130 | 0.584 | 0.777 | 1.811 |
| 3, AWS c5n.9xlarge    | 0.057 | 0.231 | 0.285 | 0.641 |
| 140, E5-2650v2        | 0.028 | 0.043 | 0.051 | 0.072 |

