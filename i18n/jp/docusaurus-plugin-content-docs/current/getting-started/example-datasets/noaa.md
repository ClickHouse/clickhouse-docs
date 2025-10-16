---
'description': '過去120年間の気候データの2.5億行'
'sidebar_label': 'NOAA Global Historical Climatology Network '
'sidebar_position': 1
'slug': '/getting-started/example-datasets/noaa'
'title': 'NOAA Global Historical Climatology Network'
'doc_type': 'reference'
---

このデータセットには、過去120年間の天候測定値が含まれています。各行は、特定の時点と観測所における測定値です。

より正確には、このデータの[出所](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)によると：

> GHCN-Dailyは、全球の陸地での日々の観測を含むデータセットです。地球上の陸上観測所からの測定を含み、その約3分の2は降水測定のみ（Menne et al., 2012）です。GHCN-Dailyは、数多くのソースからの気候記録を統合したもので、共通の品質保証審査を受けています（Durre et al., 2010）。アーカイブには、次の気象要素が含まれます：

    - 日最高気温
    - 日最低気温
    - 観測時の気温
    - 降水量（雨、融解した雪を含む）
    - 降雪量
    - 雪の深さ
    - 利用可能な他の要素

以下のセクションでは、このデータセットをClickHouseに取り込むための手順を簡単に説明します。各ステップについてより詳細に読みたい方は、[「大規模で実世界のデータセットを探索する: ClickHouseにおける100年以上の天候記録」](https://clickhouse.com/blog/real-world-data-noaa-climate-data)というブログ投稿をご覧になることをお勧めします。

## データのダウンロード {#downloading-the-data}

- クレンジング、再構成、強化されたClickHouse用の[事前準備されたバージョン](#pre-prepared-data)。このデータは1900年から2022年をカバーしています。
- [オリジナルデータをダウンロード](#original-data)し、ClickHouseに必要なフォーマットに変換します。自分の列を追加したいユーザーは、このアプローチを検討することをお勧めします。

### 事前準備されたデータ {#pre-prepared-data}

より具体的には、Noaaによる品質保証チェックに失敗した行は削除されています。また、データは1行あたりの測定から、ステーションIDと日付ごとの行へと再構成されています。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリが簡単で、結果のテーブルがよりスパースにならないようにします。最後に、データには緯度と経度も追加されています。

このデータは次のS3の位置にあります。データをローカルファイルシステムにダウンロードするか（ClickHouseクライアントを使用して挿入）、ClickHouseに直接挿入します（[S3からの挿入](#inserting-from-s3)を参照）。

ダウンロードするには：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### オリジナルデータ {#original-data}

以下には、ClickHouseにロードする準備としてオリジナルデータをダウンロードし変換する手順が詳述されています。

#### ダウンロード {#download}

オリジナルデータをダウンロードするには：

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

[フォーマットドキュメント](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)の要約：

フォーマットドキュメントとカラムの概要：

- 11文字の観測所識別コード。これは有用な情報をいくつかエンコードしています。
- YEAR/MONTH/DAY = YYYYMMDD形式の8文字の日付（例：19860529 = 1986年5月29日）
- ELEMENT = 要素タイプの4文字インジケータ。実質的には測定タイプです。多くの測定値が利用可能ですが、以下を選択します：
  - PRCP - 降水量（十分の1mm）
  - SNOW - 降雪量（mm）
  - SNWD - 雪の深さ（mm）
  - TMAX - 最高気温（十分の1度C）
  - TAVG - 平均気温（十分の1度C）
  - TMIN - 最低気温（十分の1度C）
  - PSUN - 可能な日照のパーセント（パーセント）
  - AWND - 平均日風速（十分の1メートル毎秒）
  - WSFG - 最高瞬間風速（十分の1メートル毎秒）
  - WT** = 気象タイプで、**は気象タイプを定義します。気象タイプの完全なリストはここです。
  - DATA VALUE = ELEMENTのための5文字のデータ値、すなわち測定値の値。
  - M-FLAG = 1文字の測定フラグ。これは10の可能な値を持ちます。これらの値のいくつかはデータ精度に疑問があることを示します。私たちは、PRCP、SNOW、およびSNWD測定にのみ関連する「P」に設定されているデータを受け入れます。
- Q-FLAGは測定の品質フラグで、14の可能な値があります。私たちは、値が空であるデータ、つまり品質保証チェックに失敗しなかったデータのみを関心があります。
- S-FLAGは観測のソースフラグ。私たちの分析には役立たないので無視します。
- OBS-TIME = 観測時刻を時間-分形式の4文字（すなわち0700 = 午前7時）で示します。通常、古いデータには存在しません。私たちの目的には無視します。

1行ごとの測定は、ClickHouseにおいてスパーステーブル構造を引き起こします。私たちは、`qFlag`が空文字列に等しい行のみに制限することで、時間とステーションごとの行に変換する必要があります。

#### データのクリーンアップ {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用して、関心のある測定を表す行をフィルタリングし、品質要求を満たします：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億以上の行があるため、すべてのファイルを解析する必要があるので、このクエリは速くありません。私たちの8コアのマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

行ごとの測定構造はClickHouseで使用できますが、将来のクエリを不必要に複雑にします。理想的には、各測定タイプと関連する値がカラムである、ステーションIDと日付ごとの行が必要です。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localを使用し、シンプルな`GROUP BY`を使用して、データをこの構造に再ピボットします。メモリオーバーヘッドを制限するため、1ファイルずつ実行します。

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

このクエリにより、単一の50GBファイル `noaa.csv` が生成されます。

### データの強化 {#enriching-the-data}

データには観測所IDを除いて場所に関する情報がなく、国コードを含むプレフィックスが含まれています。理想的には、各観測所にはそれに関連する緯度と経度が必要です。これを達成するために、NOAAは各観測所の詳細を別の[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として便利に提供しています。このファイルには、私たちの今後の分析に有用な5つのカラムが含まれています：ID、緯度、経度、高度、および名前です。

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
このクエリは数分かかり、6.4GBのファイル `noaa_enriched.parquet` を生成します。

## テーブルの作成 {#create-table}

ClickHouseでMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Average temperature (tenths of a degrees C)',
   `tempMax` Int32 COMMENT 'Maximum temperature (tenths of degrees C)',
   `tempMin` Int32 COMMENT 'Minimum temperature (tenths of degrees C)',
   `precipitation` UInt32 COMMENT 'Precipitation (tenths of mm)',
   `snowfall` UInt32 COMMENT 'Snowfall (mm)',
   `snowDepth` UInt32 COMMENT 'Snow depth (mm)',
   `percentDailySun` UInt8 COMMENT 'Daily percent of possible sunshine (percent)',
   `averageWindSpeed` UInt32 COMMENT 'Average daily wind speed (tenths of meters per second)',
   `maxWindSpeed` UInt32 COMMENT 'Peak gust wind speed (tenths of meters per second)',
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

ここで、`<path>` はディスク上のローカルファイルへの完全パスを表します。

この読み込みをスピードアップする方法については[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)をご覧ください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```
これをスピードアップする方法については、[大規模データロードの調整](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ投稿をご覧ください。

## サンプルクエリ {#sample-queries}

### 史上最高気温 {#highest-temperature-ever}

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

2023年時点での[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)における[記録された記録](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と一致しています。

### 最高のスキーリゾート {#best-ski-resorts}

アメリカの[スキーリゾートのリスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれぞれの場所を使用し、過去5年間の各月で最も多くの観測があった上位1000の気象観測所とこれを結合します。この結合を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)で並べ替え、距離が20km未満の結果に制限し、リゾートごとに上位の結果を選択し、これを総降雪量で並べ替えます。また、スキーコンディションの良い指標として1800m以上のリゾートに制限しています。

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

5 rows in set. Elapsed: 0.750 sec. Processed 689.10 million rows, 3.20 GB (918.20 million rows/s., 4.26 GB/s.)
Peak memory usage: 67.66 MiB.
```

## クレジット {#credits}

Global Historical Climatology Networkが、このデータを準備し、クレンジングし、配布している努力に感謝します。あなたの努力に感謝します。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [小数点以下に使用されたサブセットを示す、例：Version 3.25]。NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
