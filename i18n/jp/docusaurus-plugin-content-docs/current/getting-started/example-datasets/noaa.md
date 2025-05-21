---
description: '過去120年間の気候データ2.5億行'
sidebar_label: 'NOAA全球歴史気候ネットワーク'
sidebar_position: 1
slug: /getting-started/example-datasets/noaa
title: 'NOAA全球歴史気候ネットワーク'
---

このデータセットには、過去120年間の気象測定値が含まれています。各行は、特定の時点と地点の測定を表しています。

より正確には、[このデータの出所](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)に従うと、以下のようになります：

> GHCN-Dailyは、全球の陸域での日次観測を含むデータセットです。これは、世界各地の陸上ステーションからのステーションベースの測定値を含んでおり、その約3分の2は降水量測定のみに関するものです（Menne et al.、2012年）。GHCN-Dailyは、さまざまな出典からの気候記録の合成であり、共通の品質保証レビューに従って統合されています（Durre et al.、2010年）。アーカイブには以下の気象要素が含まれています：

    - 日次最高気温
    - 日次最低気温
    - 観測時の気温
    - 降水量（すなわち、雨、融雪）
    - 降雪量
    - 雪の深さ
    - 他の利用可能な要素

以下のセクションでは、このデータセットをClickHouseに取り込む際に関与した手順について簡単に説明します。各手順を詳細に読みたい場合は、私たちのブログ記事「["大規模な実世界データセットを探る：ClickHouseにおける100年以上の気象記録"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)」を参照することをお勧めします。

## データのダウンロード {#downloading-the-data}

- ClickHouse用に事前に準備された[バージョン](#pre-prepared-data)があり、クレンジング、再構造化、強化されています。このデータは1900年から2022年までをカバーしています。
- [元データをダウンロード](#original-data)し、ClickHouseが要求する形式に変換します。独自のカラムを追加したいユーザーはこちらのアプローチを検討するかもしれません。

### 事前に準備されたデータ {#pre-prepared-data}

具体的には、Noaaによる品質保証チェックを通過しなかった行が除去されました。また、データは、1行ごとの測定から、ステーションIDと日付ごとの行へと再構造化されています。すなわち、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリが単純になり、結果のテーブルがよりスパースではなくなることを保証します。最後に、データには緯度と経度が追加されています。

このデータは以下のS3の場所で入手可能です。データをローカルファイルシステムにダウンロードするか（ClickHouseクライアントを使用して挿入）、直接ClickHouseに挿入します（[S3からの挿入](#inserting-from-s3)を参照）。

ダウンロードするには：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 元データ {#original-data}

以下は、ClickHouseにロードする準備のために元データをダウンロードし変換する手順の詳細です。

#### ダウンロード {#download}

元データをダウンロードするには：

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### データのサンプリング {#sampling-the-data}

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

[フォーマットドキュメント](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)によると、

フォーマットドキュメントとカラムを要約すると：

 - 11文字のステーション識別コード。これは有用な情報をエンコードしています。
 - 年/月/日 = YYYYMMDD形式の8文字の日付（例：19860529 = 1986年5月29日）
 - ELEMENT = 要素タイプの4文字インジケーター。実質的に測定タイプです。利用可能な測定が多数ありますが、以下を選択します：
    - PRCP - 降水量（10分の1mm）
    - SNOW - 降雪量（mm）
    - SNWD - 雪の深さ（mm）
    - TMAX - 最高気温（10分の1度C）
    - TAVG - 平均気温（10分の1度C）
    - TMIN - 最低気温（10分の1度C）
    - PSUN - 日々の推定日射量（パーセント）
    - AWND - 平均日風速（10分の1メートル毎秒）
    - WSFG - 最大突風風速（10分の1メートル毎秒）
    - WT** = 天気タイプ、**は天気の種類を示します。天気タイプのフルリストはこちら。
- DATA VALUE = ELEMENTの為の5文字のデータ値、すなわち測定の値。
- M-FLAG = 1文字の測定フラグ。これは10種類の可能な値を持ちます。いくつかの値は疑わしいデータの精度を示します。これはPRCP、SNOW、SNWD測定に関連するため、「P」に設定されているデータを受け入れます。
- Q-FLAGは測定品質フラグで、14種類の可能な値を持ちます。我々は、空の値、すなわち品質保証チェックで失敗しなかったデータのみを関心としています。
- S-FLAGは観測のソースフラグで、分析には有用でないため無視されます。
- OBS-TIME = 観測の時刻で、時分形式の4文字（例：0700 = 午前7時）。一般的に古いデータでは存在しません。私たちの目的では無視します。

1行ごとの測定をすることは、ClickHouseではスパースなテーブル構造を引き起こすことになります。時間とステーションごとの行に変換し、測定をカラムとして持つ必要があります。最初に、`qFlag`が空の文字列と等しい行で、問題がない行のセットを制限します。

#### データのクレンジング {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用して、関心のある測定を示し、品質要件をパスする行をフィルタリングします：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行以上のデータでは、すべてのファイルをパースする必要があるため、このクエリは速くはありません。我々の8コアマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

行ごとの測定構造はClickHouseで使用できますが、今後のクエリが不必要に複雑になります。理想的には、各ステーションIDと日付ごとの行が必要で、各測定タイプと関連する値がカラムとして配置されるべきです。すなわち、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localとシンプルな`GROUP BY`を使用して、データをこの構造にピボット再構造化できます。メモリ使用量を制限するため、ファイルごとにこの操作を行います。

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

このクエリは、1つの50GBサイズのファイル`noaa.csv`を生成します。

### データの強化 {#enriching-the-data}

データには、ステーションIDを除いて位置に関する情報がなく、そのIDは国コードのプレフィックスを含んでいます。理想的には、各ステーションに関連付けられた緯度と経度が必要です。これを実現するために、NOAAは便利なことに各ステーションの詳細を別の[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として提供しています。このファイルには将来の分析に有用な5つのカラム（ID、緯度、経度、標高、名称）があります。

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
このクエリは数分かかり、6.4 GBのファイル`noaa_enriched.parquet`を生成します。

## テーブルの作成 {#create-table}

ClickHouseでMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（10分の1度C）',
   `tempMax` Int32 COMMENT '最高気温（10分の1度C）',
   `tempMin` Int32 COMMENT '最低気温（10分の1度C）',
   `precipitation` UInt32 COMMENT '降水量（10分の1mm）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '雪の深さ（mm）',
   `percentDailySun` UInt8 COMMENT '日々の推定日射量（パーセント）',
   `averageWindSpeed` UInt32 COMMENT '平均日風速（10分の1メートル毎秒）',
   `maxWindSpeed` UInt32 COMMENT '最大突風風速（10分の1メートル毎秒）',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## ClickHouseへの挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは以下のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

ここで、`<path>`はディスク上のローカルファイルへのフルパスを表します。

[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照して、ロードを速める方法をご覧ください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```
ロードを速くする方法については、[大規模データロードの調整に関するブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)を参照してください。

## サンプルクエリ {#sample-queries}

### 最高気温 {#highest-temperature-ever}

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

5行の結果。経過時間: 0.514秒。処理済み行数：10.6億行、容量4.27GB（毎秒2.06億行、毎秒8.29GB）
```

2023年時点での[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)の[記録された気温](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と一致しています。

### 最高のスキーリゾート {#best-ski-resorts}

アメリカの[スキーリゾートのリスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれに対応する場所を使用して、最近5年間で最も降雪のあった上位1000の気象ステーションと結合します。この結合を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満の結果を制限し、各リゾートごとの最上位の結果を選択し、合計降雪量でソートします。スキーに適した条件を広く示すために、標高が1800m以上のリゾートに制限します。

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

5行の結果。経過時間: 0.750秒。689.10百万行を処理、容量3.20GB（918.20百万行/秒、4.26GB/秒）
ピークメモリ使用量: 67.66 MiB。
```

## クレジット {#credits}

グローバル歴史気候ネットワークがこのデータを準備、クレンジング、配布してくれたことに感謝します。本当にありがとうございます。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [利用したサブセットを小数以下で示してください。例：Version 3.25]。NOAA国立環境情報センター。http://doi.org/10.7289/V5D21VHZ [17/08/2020]
