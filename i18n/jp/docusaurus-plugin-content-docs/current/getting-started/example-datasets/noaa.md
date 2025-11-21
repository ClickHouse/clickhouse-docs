---
description: '過去120年間の25億行の気候データ'
sidebar_label: 'NOAA Global Historical Climatology Network'
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['example dataset', 'noaa', 'weather data', 'sample data', 'climate']
---

このデータセットには、過去120年間の気象観測値が含まれています。各行は、ある時点・観測所における1つの観測値です。

より正確には、[このデータの出典](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)によると、次のように説明されています：

> GHCN-Daily は、世界の陸域における日次観測値を含むデータセットです。世界中の陸上観測所における観測値が含まれており、その約3分の2は降水量観測のみに関するものです (Menne et al., 2012)。GHCN-Daily は、複数の情報源からの気候記録を統合し、共通の品質保証レビュー一式を適用して作成された複合データセットです (Durre et al., 2010)。このアーカイブには、以下の気象要素が含まれます：

    - 日最高気温
    - 日最低気温
    - 観測時の気温
    - 降水量（例えば、雨、融雪）
    - 降雪量
    - 積雪深
    - その他、利用可能な要素

以下のセクションでは、このデータセットを ClickHouse に取り込む際に行った手順の概要を説明します。各手順の詳細について知りたい場合は、ブログ記事「[Exploring massive, real-world data sets: 100+ Years of Weather Records in ClickHouse](https://clickhouse.com/blog/real-world-data-noaa-climate-data)」をご覧になることをお勧めします。



## データのダウンロード {#downloading-the-data}

- ClickHouse用に[事前準備されたバージョン](#pre-prepared-data)のデータ。クレンジング、再構造化、エンリッチメントが施されています。このデータは1900年から2022年までをカバーしています。
- [元データをダウンロード](#original-data)し、ClickHouseで必要な形式に変換します。独自のカラムを追加したいユーザーは、このアプローチを検討することをお勧めします。

### 事前準備されたデータ {#pre-prepared-data}

具体的には、NOAAの品質保証チェックに不合格となった行が削除されています。また、データは1行あたり1測定値から、ステーションIDと日付ごとに1行という形式に再構造化されています。例えば、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これによりクエリがシンプルになり、結果のテーブルがより密になります。最後に、データには緯度と経度の情報も追加されています。

このデータは以下のS3ロケーションで利用可能です。データをローカルファイルシステムにダウンロードして(ClickHouseクライアントを使用して挿入)するか、ClickHouseに直接挿入してください([S3からの挿入](#inserting-from-s3)を参照)。

ダウンロードするには:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 元データ {#original-data}

以下では、ClickHouseへのロードに備えて元データをダウンロードし、変換する手順を説明します。

#### ダウンロード {#download}

元データをダウンロードするには:

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

[format documentation](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn) の内容を要約すると、次のようになります。

フォーマット仕様および各列について、順に要約すると次のとおりです。


- 11文字の観測所識別コード。このコード自体に有用な情報がエンコードされています
- YEAR/MONTH/DAY = YYYYMMDD形式の8文字の日付(例: 19860529 = 1986年5月29日)
- ELEMENT = 要素タイプを示す4文字のインジケーター。実質的には測定タイプを表します。利用可能な測定値は多数ありますが、以下を選択します:
  - PRCP - 降水量(0.1mm単位)
  - SNOW - 降雪量(mm)
  - SNWD - 積雪深(mm)
  - TMAX - 最高気温(0.1℃単位)
  - TAVG - 平均気温(0.1℃単位)
  - TMIN - 最低気温(0.1℃単位)
  - PSUN - 日照可能時間に対する日照時間の割合(パーセント)
  - AWND - 日平均風速(0.1m/s単位)
  - WSFG - 最大瞬間風速(0.1m/s単位)
  - WT** = 気象タイプ。**は気象タイプを定義します。気象タイプの完全なリストはこちらを参照してください。
  - DATA VALUE = ELEMENTに対する5文字のデータ値、すなわち測定値です。
  - M-FLAG = 1文字の測定フラグ。10種類の値があります。これらの値の一部はデータ精度に疑問があることを示します。このフラグが「P」に設定されているデータは受け入れます。これは欠測でゼロと推定されることを示し、PRCP、SNOW、SNWDの測定にのみ関連します。
- Q-FLAGは測定品質フラグで、14種類の値があります。空の値を持つデータ、すなわち品質保証チェックに合格したデータのみを対象とします。
- S-FLAGは観測のソースフラグです。本分析では有用ではないため無視します。
- OBS-TIME = 時分形式の4文字の観測時刻(例: 0700 = 午前7時)。通常、古いデータには含まれていません。本分析では無視します。

1行につき1つの測定値という構造では、ClickHouseにおいて疎なテーブル構造になります。時刻と観測所ごとに1行とし、測定値を列として配置する形式に変換する必要があります。まず、問題のない行、すなわち`qFlag`が空文字列である行にデータセットを限定します。

#### データのクリーニング {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用して、対象となる測定値を表し、品質要件を満たす行をフィルタリングできます:

```bash
clickhouse local --query "SELECT count()
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行を超えるため、すべてのファイルを解析する必要があり、高速なクエリではありません。8コアのマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

1行につき1つの測定値という構造はClickHouseで使用できますが、今後のクエリを不必要に複雑にします。理想的には、観測所IDと日付ごとに1行とし、各測定タイプとその値を列として配置する必要があります。すなわち:

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localとシンプルな`GROUP BY`を使用して、データをこの構造に再ピボットできます。メモリオーバーヘッドを抑えるため、一度に1つのファイルずつ処理します。


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

このクエリは50GBの単一ファイル`noaa.csv`を生成します。

### データの拡充 {#enriching-the-data}

このデータには、国コードの接頭辞を含む観測所IDを除いて、位置情報が含まれていません。理想的には、各観測所に緯度と経度が関連付けられている必要があります。これを実現するため、NOAAは各観測所の詳細情報を別ファイル[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として提供しています。このファイルには[複数の列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)が含まれていますが、そのうち5つが今後の分析に有用です:id、latitude、longitude、elevation、nameです。

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

このクエリの実行には数分かかり、6.4GBのファイル`noaa_enriched.parquet`が生成されます。


## テーブルの作成 {#create-table}

ClickHouseでMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（摂氏の10分の1単位）',
   `tempMax` Int32 COMMENT '最高気温（摂氏の10分の1単位）',
   `tempMin` Int32 COMMENT '最低気温（摂氏の10分の1単位）',
   `precipitation` UInt32 COMMENT '降水量（mmの10分の1単位）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '積雪深（mm）',
   `percentDailySun` UInt8 COMMENT '日照率（パーセント）',
   `averageWindSpeed` UInt32 COMMENT '日平均風速（m/sの10分の1単位）',
   `maxWindSpeed` UInt32 COMMENT '最大瞬間風速（m/sの10分の1単位）',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## ClickHouseへのデータ挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

ローカルファイルからのデータ挿入は以下のように実行できます(ClickHouseクライアントから):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

ここで`<path>`はディスク上のローカルファイルへのフルパスを表します。

この読み込みを高速化する方法については[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照してください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

高速化する方法については、[大規模データ読み込みのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事を参照してください。


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

2023年時点で[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)における[公式記録](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と一致しており、信頼性の高い結果となっています。

### 最適なスキーリゾート {#best-ski-resorts}

アメリカ合衆国の[スキーリゾートのリスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれぞれの位置情報を使用し、過去5年間のいずれかの月で最も降雪量が多かった上位1000の気象観測所と結合します。この結合を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満の結果に絞り込んだ上で、リゾートごとに最上位の結果を選択し、総降雪量でソートします。なお、良好なスキー条件の大まかな指標として、標高1800m以上のリゾートに限定しています。


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
ピークメモリ使用量: 67.66 MiB。
```


## クレジット {#credits}

このデータの準備、クレンジング、配布に尽力されたGlobal Historical Climatology Networkの取り組みに謝意を表します。皆様のご尽力に感謝いたします。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [小数点以下に使用したサブセットを記載、例:Version 3.25]。NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
