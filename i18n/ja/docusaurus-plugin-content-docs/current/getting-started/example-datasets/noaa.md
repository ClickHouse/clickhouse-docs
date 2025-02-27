---
description: "過去120年間の気候データ25億行"
slug: /getting-started/example-datasets/noaa
sidebar_label: NOAA グローバル歴史気候ネットワーク 
sidebar_position: 1
title: "NOAA グローバル歴史気候ネットワーク"
---

このデータセットには、過去120年間の気象測定値が含まれています。各行は、時点と地点に対する測定値を示しています。

より正確には、[このデータの起源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)に従い、

> GHCN-Dailyは、世界の陸地における日次観測を含むデータセットです。これは、世界中の陸上観測所からの測定値を含み、その約3分の2は降水量の測定のみです（Menne et al., 2012）。GHCN-Dailyは、数多くのソースからの気候記録を統合し、それらを結合し、共通の品質保証レビューにかけられています（Durre et al., 2010）。アーカイブには以下の気象要素が含まれています：

    - 日最高気温
    - 日最低気温
    - 観測時の気温
    - 降水量（すなわち雨、溶けた雪）
    - 降雪量
    - 雪の深さ
    - 利用可能な他の要素

以下のセクションでは、このデータセットをClickHouseに取り込むためのステップについて簡単に説明します。各ステップについてより詳細に読みたい方は、私たちのブログ記事["現実の大規模データセットを探る: ClickHouseにおける100年以上の気象記録"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)をチェックすることをお勧めします。

## データのダウンロード {#downloading-the-data}

- [前もって準備されたバージョン](#pre-prepared-data)のデータは、ClickHouse用にクレンジングされ、再構築され、強化されています。このデータは1900年から2022年までのものをカバーしています。
- [オリジナルデータをダウンロード](#original-data)し、ClickHouseが必要とする形式に変換します。独自のカラムを追加したいユーザーは、このアプローチを検討することをお勧めします。

### 前もって準備されたデータ {#pre-prepared-data}

より具体的には、Noaaによる品質保証チェックに合格しなかった行は削除されています。データは、1行あたり1つの測定から、ステーションIDおよび日付ごとの行に再構築されています。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリが単純であり、結果のテーブルがスパースでなくなることを保証します。最後に、データは緯度と経度で強化されています。

このデータは以下のS3の場所で入手可能です。データをローカルファイルシステムにダウンロード（ClickHouseクライアントを使用して挿入する）するか、ClickHouseに直接挿入します（[S3からの挿入](#inserting-from-s3)を参照）。

ダウンロードするには：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### オリジナルデータ {#original-data}

以下は、ClickHouseにロードする準備のためのオリジナルデータのダウンロードと変換のステップです。

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

フォーマットドキュメントとカラムを順にまとめると：

 - 11文字のステーション識別コード。これにはいくつかの有用な情報が埋め込まれています。
 - YEAR/MONTH/DAY = YYYYMMDD形式（例：19860529 = 1986年5月29日）の8文字の日付。
 - ELEMENT = 要素タイプを示す4文字インジケーター。実質的には、測定タイプです。多くの測定が利用可能ですが、次のものを選択します。
    - PRCP - 降水量（mmの十分の一）
    - SNOW - 降雪量（mm）
    - SNWD - 雪の深さ（mm）
    - TMAX - 最高気温（摂氏の十分の一）
    - TAVG - 平均気温（摂氏の十分の一）
    - TMIN - 最低気温（摂氏の十分の一）
    - PSUN - 日次の可能な日射の百分率（％）
    - AWND - 平均日次風速（m/sの十分の一）
    - WSFG - 最大突風風速（m/sの十分の一）
    - WT** = 天候タイプ、**が天候タイプを定義します。天候タイプの完全なリストはこちら。
- DATA VALUE = ELEMENTのための5文字のデータ値、すなわち測定値の値。
- M-FLAG = 1文字の測定フラグ。この値は10種類の値を持つ可能性があります。これらの値のいくつかは、データの正確性に疑問を呈示します。これが"P"に設定されているデータは受け入れます－これは、PRCP、SNOW、SNWD測定にのみ関連します。
- Q-FLAGは測定品質フラグで、14の可能な値を持ちます。私たちは、空の値のデータのみを興味深く思っています、すなわち、品質保証チェックに失敗していません。
- S-FLAGは観測のソースフラグで、分析には役に立たず無視されます。
- OBS-TIME = 観測の4文字の時間で、時刻形式（例：0700 = 午前7時）で表されます。通常、古いデータには存在しません。私たちは、これを目的に無視します。

1行あたりの測定は、ClickHouse内でスパーステーブル構造をもたらします。時間ごとに、ステーションごとに行に変換する必要があるため、測定をカラムとして配置します。まず、問題のない行、すなわち`qFlag`が空文字列になる行に限定します。

#### データのクリーンアップ {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用し、興味のある測定を表す行をフィルタリングして品質要件を満たします：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行以上のデータがあり、これによりすべてのファイルを解析するため、迅速なクエリではありません。私たちの8コアのマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

1行あたりの測定構造はClickHouseで使用できますが、将来のクエリを不必要に複雑にします。理想的には、各ステーションIDおよび日付ごとに1行を持ち、各測定タイプと関連する値がカラムになる必要があります。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localを使用し、単純な`GROUP BY`でデータをこの構造に再ピボットできます。メモリオーバーヘッドを制限するため、各ファイルごとにこれを行います。

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

データには、国コードのプレフィックスが含まれるステーションID以外には場所の情報がありません。理想的には、各ステーションに関連付けられた緯度と経度が必要です。これを実現するために、NOAAは各ステーションの詳細を別の[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として便利に提供しています。このファイルには、[いくつかのカラム](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)があり、そのうち5つが今後の分析に役立ちます：ID、緯度、経度、標高、名前。

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
このクエリは数分かかり、6.4 GBファイル`noaa_enriched.parquet`を生成します。

## テーブルの作成 {#create-table}

ClickHouseでMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（摂氏の十分の一）',
   `tempMax` Int32 COMMENT '最高気温（摂氏の十分の一）',
   `tempMin` Int32 COMMENT '最低気温（摂氏の十分の一）',
   `precipitation` UInt32 COMMENT '降水量（mmの十分の一）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '雪の深さ（mm）',
   `percentDailySun` UInt8 COMMENT '日次の日射可能な割合（％）',
   `averageWindSpeed` UInt32 COMMENT '平均日次風速（m/sの十分の一）',
   `maxWindSpeed` UInt32 COMMENT '最大突風風速（m/sの十分の一）',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## ClickHouseへの挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは次のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

ここで、`<path>`はディスク上のローカルファイルのフルパスを示します。

[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照して、データの読み込みを高速化する方法をご覧ください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```

高速化する方法については、[大規模データの読み込みをチューニングする記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)をご覧ください。

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

5行がセットで返されました。経過時間: 0.514秒。1.06億行を処理し、4.27 GB（20.6億行/秒、8.29 GB/秒）。
```

2023年現在、[文書化された記録](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)の[ファーネス・クリーク](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)と一致しているのは心強いことです。

### 最高のスキーリゾート {#best-ski-resorts}

[アメリカ合衆国のスキーリゾートのリスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそのそれぞれの場所を使用し、過去5年間において月ごとに降雪量が最も多かったトップ1000の気象ステーションと隔ててこれらを結合します。この結合において、[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満の結果に限定し、リゾートごとに最高の結果を選択し、全体の雪の量でソートします。良好なスキー条件を示すために、標高が1800m以上のリゾートに制限します。

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

5行がセットで返されました。経過時間: 0.750秒。689.10百万行を処理し、3.20 GB（918.20百万行/秒、4.26 GB/秒）。
ピークメモリ使用量: 67.66 MiB。
```

## クレジット {#credits}

グローバル歴史気候ネットワークがこのデータを準備、クレンジング、配布した努力に感謝したいと思います。私たちはあなたの努力に感謝しています。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [使用したサブセットを小数点以下で示す、例：Version 3.25]。NOAA国立環境情報センター。http://doi.org/10.7289/V5D21VHZ [2020年8月17日]

