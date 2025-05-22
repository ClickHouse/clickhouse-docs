---
'description': '2.5 billion rows of climate data for the last 120 yrs'
'sidebar_label': 'NOAA Global Historical Climatology Network'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/noaa'
'title': 'NOAA Global Historical Climatology Network'
---



このデータセットには、過去120年間の気象測定値が含まれています。各行は、特定の時点と観測所の測定値を表しています。

より正確には、このデータの[出所](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)に基づいて次のようになります：

> GHCN-Dailyは、世界の陸地での日次観測を含むデータセットです。これは、世界中の地上観測所からの測定値を含み、その約3分の2は降水測定のみです (Menne et al., 2012)。GHCN-Dailyは、数多くのソースからの気象記録の複合体で、統合されて共通の品質保証レビューにかけられています (Durre et al., 2010)。アーカイブには、以下の気象要素が含まれています：

    - 日次最高気温
    - 日次最低気温
    - 観測時の気温
    - 降水量（つまり、雨、融雪）
    - 降雪量
    - 雪の深さ
    - 額外の要素（利用可能な場合）

以下のセクションでは、このデータセットをClickHouseに取り込むために関与したステップの概要を提供します。各ステップについてより詳細に読みたい場合は、私たちのブログ投稿「["ClickHouseにおける100年以上の気象記録の探求"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)」をご覧ください。

## データのダウンロード {#downloading-the-data}

- ClickHouse用にクリーンアップ、再構成、強化された[事前準備されたバージョン](#pre-prepared-data)があります。このデータは1900年から2022年までをカバーしています。
- [オリジナルデータをダウンロード](#original-data)し、ClickHouseが要求する形式に変換します。独自のカラムを追加したいユーザーは、このアプローチを検討するかもしれません。

### 事前準備されたデータ {#pre-prepared-data}

より具体的には、Noaaによる品質保証チェックで失敗しなかった行が削除されています。データは、行ごとの測定から、ステーションIDと日付ごとの行に再構成されています。つまり、次のようになります。

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリが簡単で、結果のテーブルがスパースでないことを保証します。最後に、データには緯度と経度が追加されています。

このデータは、以下のS3ロケーションで入手可能です。データをローカルファイルシステムにダウンロードして（ClickHouseクライアントを使用して挿入することができます）、または直接ClickHouseに挿入します（[S3からの挿入を参照](#inserting-from-s3)）。

ダウンロードするには：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### オリジナルデータ {#original-data}

以下は、ClickHouseにロードする準備のためにオリジナルデータをダウンロードして変換する手順を示しています。

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

[フォーマットのドキュメント](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)を要約すると：

フォーマットドキュメントとカラムを順番に要約すると：

 - 11文字のステーション識別コード。この中に一部有用な情報がエンコードされています。
 - YEAR/MONTH/DAY = YYYYMMDD形式の8文字の日付（例：19860529 = 1986年5月29日）
 - ELEMENT = 要素タイプの4文字インジケーター。事実上、測定タイプです。利用可能な多くの測定値がありますが、以下のものを選択します：
    - PRCP - 降水量（1/10 mm）
    - SNOW - 降雪量（mm）
    - SNWD - 雪の深さ（mm）
    - TMAX - 最高気温（1/10 ℃）
    - TAVG - 平均気温（1/10 ℃）
    - TMIN - 最低気温（1/10 ℃）
    - PSUN - 日次可能日照率（パーセント）
    - AWND - 日次平均風速（1/10秒メートル）
    - WSFG - ピーク突風風速（1/10秒メートル）
    - WT** = 天候タイプ **は天候タイプを示します。天候タイプの完全なリストはこちら。
- DATA VALUE = ELEMENT用の5文字データ値すなわち測定値の値。
- M-FLAG = 測定フラグ（1文字）。これは10の可能な値があります。これらの値の一部は、データの精度に疑問があることを示します。この値が「P」に設定されているデータを受け入れます。これは、PRCP、SNOW、SNWD測定にのみ関連します。
- Q-FLAGは測定品質フラグで、14の可能な値があります。我々は、空の値データすなわち、品質保証チェックで失敗しなかったもののデータにだけ興味があります。
- S-FLAGは観測のソースフラグです。我々の分析には役立たないため無視します。
- OBS-TIME = 観測時間を表す4文字（時分）形式のデータ（例：0700 =午前7時）。通常、古いデータには存在しません。我々の目的には無視します。

行ごとの測定では、ClickHouseでスパースなテーブル構造が生じることになります。時刻と観測所ごとの行に変換し、測定をカラムとして持つようにする必要があります。まず、データセットを問題のない行に制限します。つまり、`qFlag`が空の文字列である行に制限します。

#### データのクリーニング {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用して、興味のある測定を表す行をフィルタリングし、品質要件を通過させることができます：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億以上の行があるため、すべてのファイルを解析する必要があるため、このクエリは遅いものです。我々の8コアのマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

行ごとの測定構造をClickHouseに使用することはできますが、将来のクエリを不必要に複雑にします。理想的には、各測定タイプと関連する値をカラムにする、ステーションIDと日付ごとの行が必要です。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localを使用して単純な`GROUP BY`によって、データをこの構造に再ピボットできます。メモリのオーバーヘッドを制限するために、1ファイルずつこれを行います。

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

このクエリは、単一の50GBファイル`noaa.csv`を生成します。

### データの強化 {#enriching-the-data}

データには、観測所ID以外には位置を示すものがありません。このIDには、国コードのプレフィックスが含まれています。理想的には、各観測所には緯度と経度が関連付けられている必要があります。この目的のために、NOAAは各観測所の詳細を、別の[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として便利に提供しています。このファイルには、我々の将来の分析に役立つ5つのカラムがあります：id、緯度、経度、高度、名前。

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
このクエリは数分かかり、6.4GBのファイル`noaa_enriched.parquet`を生成します。

## テーブルの作成 {#create-table}

ClickHouse内にMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（1/10℃）',
   `tempMax` Int32 COMMENT '最高気温（1/10℃）',
   `tempMin` Int32 COMMENT '最低気温（1/10℃）',
   `precipitation` UInt32 COMMENT '降水量（1/10 mm）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '雪の深さ（mm）',
   `percentDailySun` UInt8 COMMENT '日次可能日照率（パーセント）',
   `averageWindSpeed` UInt32 COMMENT '日次平均風速（1/10秒メートル）',
   `maxWindSpeed` UInt32 COMMENT 'ピーク突風風速（1/10秒メートル）',
   `weatherType` Enum8('通常' = 0, '霧' = 1, '濃霧' = 2, '雷' = 3, '小さな雹' = 4, '雹' = 5, '氷霧' = 6, '塵/灰' = 7, '煙/霞' = 8, '吹雪' = 9, '竜巻' = 10, '強風' = 11, '吹き上げる霧' = 12, '霧雨' = 13, '凍結霧雨' = 14, '雨' = 15, '凍結雨' = 16, '雪' = 17, '不明な降水' = 18, '地面霧' = 21, '凍結霧' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## ClickHouseへの挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは、次のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

`<path>`は、ディスク上のローカルファイルへの完全なパスを表します。

このロードを高速化する方法は、[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照してください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```
これを高速化する方法については、[大規模データのロードの調整に関するブログ投稿](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)を参照してください。

## サンプルクエリ {#sample-queries}

### 過去最高気温 {#highest-temperature-ever}

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

5行が設定されました。経過: 0.514秒。処理された行: 10.6億、4.27 GB（20.6億行/s, 8.29 GB/s）。
```

2023年時点での[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)による[記録された記録](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と一貫性があります。

### 最高のスキーリゾート {#best-ski-resorts}

スキーリゾートの[リスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれぞれの場所を利用して、過去5年間に月ごとに最も雪が降ったトップ1000の気象観測所と結合します。この結合を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満の結果に制限し、各リゾートごとにトップの結果を選択し、これを総降雪量でソートします。さらに、リゾートは、良好なスキー条件の広い指標として1800m以上のものに制限します。

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

5行が設定されました。経過: 0.750秒。処理された行: 689.1百万、3.20 GB（918.20百万行/s, 4.26 GB/s）。
ピークメモリ使用量: 67.66 MiB。
```

## クレジット {#credits}

このデータの準備、クリーンアップ、および配布におけるグローバル歴史気候ネットワークの努力に感謝します。あなた方の努力に感謝します。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [十進法の後に使用されたサブセットを示します，例如: Version 3.25] NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [2020年8月17日]
