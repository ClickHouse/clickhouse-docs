---
description: '過去120年間の25億行の気候データ'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'noaa', '気象データ', 'サンプルデータ', '気候']
---

このデータセットには、過去120年間の気象観測値が含まれます。各行は、ある時点と観測所における1つの観測値を表します。

より正確には、[このデータの出典](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)によると次のように説明されています。

> GHCN-Daily は、世界の陸域における日次観測値を含むデータセットです。世界中の陸上観測所からの観測値を含み、そのおよそ 3 分の 2 は降水量観測のみです (Menne et al., 2012)。GHCN-Daily は、複数のソースから得られた気候記録を統合し、共通の一連の品質保証レビューを実施した複合データセットです (Durre et al., 2010)。アーカイブには、以下の気象要素が含まれます。

    - 日最高気温
    - 日最低気温
    - 観測時の気温
    - 降水量（雨、融雪など）
    - 降雪量
    - 積雪深
    - 利用可能な場合はその他の要素

以下のセクションでは、このデータセットを ClickHouse に取り込む際に行った手順の概要を簡単に説明します。各手順についてさらに詳しく知りたい場合は、ブログ記事「[大規模な実データセットの探索: ClickHouse における100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)」をご覧ください。



## データのダウンロード

* ClickHouse 用に[事前に用意されたバージョン](#pre-prepared-data)のデータ。クレンジング、再構成、および付加情報の付与が行われています。このデータは 1900 年から 2022 年までをカバーしています。
* [オリジナルのデータをダウンロード](#original-data)し、ClickHouse が必要とする形式に変換します。独自のカラムを追加したいユーザーは、この方法を検討するとよいでしょう。

### 事前準備済みデータ

具体的には、NOAA の品質保証チェックで一度も失敗しなかった行が削除されています。また、1 行あたり 1 件の計測値という形式から、ステーション ID と日付ごとに 1 行という形式に再構成されています。つまり、次のようになります。

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリがより簡単になり、結果のテーブルが疎になりにくくなることを保証します。最後に、このデータには緯度・経度情報によるエンリッチも行われています。

このデータは、以下の S3 ロケーションで利用できます。データをローカルファイルシステムにダウンロードして（ClickHouse クライアントを使ってインサートする）、または ClickHouse に直接インサートしてください（[Inserting from S3](#inserting-from-s3) を参照）。

ダウンロード手順:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 元データ

以下では、ClickHouse へのロードに備えて、元データをダウンロードおよび変換する手順を説明します。

#### ダウンロード

元データをダウンロードするには、以下の手順を実行します。

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### データのサンプリング


```bash
$ clickhouse-local --query "SELECT * FROM '2021.csv.gz' LIMIT 10" --format PrettyCompact
┌─c1──────────┬───────c2─┬─c3───┬──c4─┬─c5───┬─c6───┬─c7─┬───c8─┐
│ AE000041196 │ 20210101 │ TMAX │ 278 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ PRCP │   0 │ D    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ TAVG │ 214 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMAX │ 266 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMIN │ 178 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ PRCP │   0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TAVG │ 217 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMAX │ 262 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMIN │ 155 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TAVG │ 202 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
└─────────────┴──────────┴──────┴─────┴──────┴──────┴────┴──────┘
```

[フォーマットのドキュメント](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)の内容をまとめると、次のとおりです。

フォーマット仕様と各列について、順に要約します。


* 11 文字の観測所識別コード。これ自体にいくつかの有用な情報がエンコードされています
* YEAR/MONTH/DAY = YYYYMMDD 形式の 8 文字の日付（例: 19860529 = 1986 年 5 月 29 日）
* ELEMENT = 要素種別を示す 4 文字の識別子。実質的には測定種別です。多くの測定項目がありますが、本ガイドでは次を選択します:
  * PRCP - 降水量（0.1 mm 単位）
  * SNOW - 降雪量（mm）
  * SNWD - 積雪深（mm）
  * TMAX - 最高気温（0.1 ℃ 単位）
  * TAVG - 平均気温（0.1 ℃ 単位）
  * TMIN - 最低気温（0.1 ℃ 単位）
  * PSUN - 1 日の可能日照時間に対する日照時間の割合（パーセント）
  * AWND - 日平均風速（0.1 m/s 単位）
  * WSFG - 最大瞬間風速（0.1 m/s 単位）
  * WT** = Weather Type（天候種別）を表し、** が具体的な天候タイプを定義します。天候タイプの完全な一覧はここにあります。
  * DATA VALUE = ELEMENT のデータ値を表す 5 文字。すなわち測定値そのもの。
  * M-FLAG = 1 文字の Measurement Flag。10 通りの値があり、その一部はデータ精度に問題がある可能性を示します。本ガイドでは、この値が &quot;P&quot;（missing presumed zero と識別される。PRCP、SNOW、SNWD の測定にのみ関連）に設定されているデータも受け入れます。
* Q-FLAG は測定の品質フラグで、14 通りの値があります。品質保証チェックに一つも失敗していない、すなわち値が空であるデータにのみ関心があります。
* S-FLAG は観測のソースフラグです。本分析には有用ではないため無視します。
* OBS-TIME = 観測時刻を表す 4 文字の時刻（時・分）形式（例: 0700 = 午前 7:00）。古いデータには通常含まれていません。本ガイドの目的ではこれも無視します。

1 行につき 1 件の測定値という形式だと、ClickHouse ではスパースなテーブル構造になってしまいます。時刻と観測所ごとに 1 行とし、各測定値を列として保持する形式に変換すべきです。まず、`qFlag` が空文字列に等しい行、すなわち問題のない行にデータセットを絞り込みます。

#### データのクリーンアップ

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を使用して、関心のある測定を表す行をフィルタリングし、品質要件を満たす行のみを抽出できます:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行以上あるため、すべてのファイルをパースする必要があり、このクエリは高速ではありません。8コアのマシンでは、実行に約160秒かかります。

### データのピボット

1行ごとに測定値を持つ構造も ClickHouse で利用できますが、将来のクエリを不必要に複雑にしてしまいます。理想的には、ステーション ID と日付ごとに1行とし、各測定タイプとその値をそれぞれ列として持つ形にする必要があります。つまり、次のような形です。

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse local とシンプルな `GROUP BY` を用いて、データをこの構造にピボットし直すことができます。メモリ使用量の増加を抑えるため、これを 1 ファイルずつ処理します。


```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(date) as date,
       anyIf(value, measurement = 'TAVG') as tempAvg,
       anyIf(value, measurement = 'TMAX') as tempMax,
       anyIf(value, measurement = 'TMIN') as tempMin,
       anyIf(value, measurement = 'PRCP') as precipitation,
       anyIf(value, measurement = 'SNOW') as snowfall,
       anyIf(value, measurement = 'SNWD') as snowDepth,
       anyIf(value, measurement = 'PSUN') as percentDailySun,
       anyIf(value, measurement = 'AWND') as averageWindSpeed,
       anyIf(value, measurement = 'WSFG') as maxWindSpeed,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as weatherType
FROM file('$i.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, date
ORDER BY station_id, date FORMAT CSV" >> "noaa.csv";
done
```

このクエリは、1 つの 50GB ファイル `noaa.csv` を生成します。

### データの拡張

このデータには、観測所 ID 以外に位置情報を示すものがなく、その ID には国コードを表すプレフィックスが含まれています。理想的には、各観測所には緯度と経度が紐づいていることが望まれます。これを実現するために、NOAA は各観測所の詳細を、別ファイル [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file) として提供しています。このファイルには[複数の列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)がありますが、今後の分析で有用なのは 5 つの列（id、latitude、longitude、elevation、name）です。

```bash
wget http://noaa-ghcn-pds.s3.amazonaws.com/ghcnd-stations.txt
```

```bash
clickhouse local --query "WITH stations AS (SELECT id, lat, lon, elevation, splitByString(' GSN ',name)[1] as name FROM file('ghcnd-stations.txt', Regexp, 'id String, lat Float64, lon Float64, elevation Float32, name String'))
SELECT station_id,
       date,
       tempAvg,
       tempMax,
       tempMin,
       precipitation,
       snowfall,
       snowDepth,
       percentDailySun,
       averageWindSpeed,
       maxWindSpeed,
       weatherType,
       tuple(lon, lat) as location,
       elevation,
       name
FROM file('noaa.csv', CSV,
          'station_id String, date Date32, tempAvg Int32, tempMax Int32, tempMin Int32, precipitation Int32, snowfall Int32, snowDepth Int32, percentDailySun Int8, averageWindSpeed Int32, maxWindSpeed Int32, weatherType UInt8') as noaa LEFT OUTER
         JOIN stations ON noaa.station_id = stations.id INTO OUTFILE 'noaa_enriched.parquet' FORMAT Parquet SETTINGS format_regexp='^(.{11})\s+(\-?\d{1,2}\.\d{4})\s+(\-?\d{1,3}\.\d{1,4})\s+(\-?\d*\.\d*)\s+(.*)\s+(?:[\d]*)'" 
```

このクエリの実行には数分ほどかかり、6.4 GB のファイル `noaa_enriched.parquet` が生成されます。


## テーブルの作成

ClickHouse クライアントから、ClickHouse 上に MergeTree テーブルを作成します。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（摂氏0.1度単位）',
   `tempMax` Int32 COMMENT '最高気温（摂氏0.1度単位）',
   `tempMin` Int32 COMMENT '最低気温（摂氏0.1度単位）',
   `precipitation` UInt32 COMMENT '降水量（0.1mm単位）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '積雪深（mm）',
   `percentDailySun` UInt8 COMMENT '日照率（可能日照時間に対する割合、%）',
   `averageWindSpeed` UInt32 COMMENT '日平均風速（0.1m/s単位）',
   `maxWindSpeed` UInt32 COMMENT '最大瞬間風速（0.1m/s単位）',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## ClickHouse への挿入

### ローカルファイルからの挿入

データは次のようにローカルファイルから挿入できます（ClickHouse クライアントから実行します）。

```sql
INSERT INTO noaa FROM INFILE '<パス>/noaa_enriched.parquet'
```

ここで `<path>` は、ディスク上のローカルファイルへのフルパスを表します。

この読み込み処理を高速化する方法については[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照してください。

### S3 からのデータ挿入

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

高速化の方法については、[大規模データ読み込みのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事をご覧ください。


## サンプルクエリ

### 過去最高気温

```sql
SELECT
    tempMax / 10 AS maxTemp,
    location,
    name,
    date
FROM blogs.noaa
WHERE tempMax > 500
ORDER BY
    tempMax DESC,
    date ASC
LIMIT 5

┌─maxTemp─┬─location──────────┬─name───────────────────────────────────────────┬───────date─┐
│    56.7 │ (-116.8667,36.45) │ CA GREENLAND RCH                               │ 1913-07-10 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-08-20 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-09-18 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-07-17 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-09-04 │
└─────────┴───────────────────┴────────────────────────────────────────────────┴────────────┘

5 rows in set. Elapsed: 0.514 sec. Processed 1.06 billion rows, 4.27 GB (2.06 billion rows/s., 8.29 GB/s.)
```

2023年時点で[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)における[記録上の最高気温](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と、安心できるほどよく一致しています。

### 最高のスキーリゾート

アメリカ合衆国の[スキーリゾート一覧](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれぞれの位置情報を用いて、過去5年間のいずれかの月で観測値（降雪量）が最も多かった上位1000の気象観測所と結合します。この結合結果を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満のものに結果を制限した上で、リゾートごとに最も近い観測所を選択し、それを総降雪量でソートします。なお、良好なスキーコンディションのおおまかな指標として、標高1800m以上のリゾートに限定しています。


```sql
SELECT
   resort_name,
   total_snow / 1000 AS total_snow_m,
   resort_location,
   month_year
FROM
(
   WITH resorts AS
       (
           SELECT
               resort_name,
               state,
               (lon, lat) AS resort_location,
               'US' AS code
           FROM url('https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv', CSVWithNames)
       )
   SELECT
       resort_name,
       highest_snow.station_id,
       geoDistance(resort_location.1, resort_location.2, station_location.1, station_location.2) / 1000 AS distance_km,
       highest_snow.total_snow,
       resort_location,
       station_location,
       month_year
   FROM
   (
       SELECT
           sum(snowfall) AS total_snow,
           station_id,
           any(location) AS station_location,
           month_year,
           substring(station_id, 1, 2) AS code
       FROM noaa
       WHERE (date > '2017-01-01') AND (code = 'US') AND (elevation > 1800)
       GROUP BY
           station_id,
           toYYYYMM(date) AS month_year
       ORDER BY total_snow DESC
       LIMIT 1000
   ) AS highest_snow
   INNER JOIN resorts ON highest_snow.code = resorts.code
   WHERE distance_km < 20
   ORDER BY
       resort_name ASC,
       total_snow DESC
   LIMIT 1 BY
       resort_name,
       station_id
)
ORDER BY total_snow DESC
LIMIT 5

┌─resort_name──────────┬─total_snow_m─┬─resort_location─┬─month_year─┐
│ Sugar Bowl, CA       │        7.799 │ (-120.3,39.27)  │     201902 │
│ Donner Ski Ranch, CA │        7.799 │ (-120.34,39.31) │     201902 │
│ Boreal, CA           │        7.799 │ (-120.35,39.33) │     201902 │
│ Homewood, CA         │        4.926 │ (-120.17,39.08) │     201902 │
│ Alpine Meadows, CA   │        4.926 │ (-120.22,39.17) │     201902 │
└──────────────────────┴──────────────┴─────────────────┴────────────┘

5行のセット。経過時間: 0.750秒。処理済み: 6億8910万行、3.20 GB (9億1820万行/秒、4.26 GB/秒)
ピークメモリ使用量: 67.66 MiB
```


## 謝辞 {#credits}

本データの整備、前処理、および配布にご尽力いただいた Global Historical Climatology Network に深く感謝いたします。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3.［使用したサブセットを小数点以下に続けて明記してください。例: Version 3.25］NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ ［17/08/2020］
