---
description: "過去120年間の気象データ25億行"
slug: /getting-started/example-datasets/noaa
sidebar_label: NOAAグローバル歴史気候ネットワーク 
sidebar_position: 1
title: "NOAAグローバル歴史気候ネットワーク"
---

このデータセットには、過去120年間の天候測定値が含まれています。各行は、特定の時点および観測所に対する測定値です。

より正確には、[このデータの起源に従って](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Dailyは、世界の陸地における日次観測を含むデータセットです。これは、世界中の陸上観測所からの測定に基づいており、その約3分の2は降水量の測定のみに関係しています（Menne et al., 2012）。GHCN-Dailyは、多くのソースからの気候記録の合成であり、一緒にマージされ、共通の品質保証レビューを受けました（Durre et al., 2010）。アーカイブには、以下の気象要素が含まれています：

    - 日次最大気温
    - 日次最小気温
    - 観測時の温度
    - 降水量（すなわち、雨、融雪）
    - 降雪量
    - 雪の深さ
    - 利用可能な他の要素

以下のセクションでは、このデータセットをClickHouseに取り込むために関与した手順の概要を簡単に説明します。各ステップについて詳細に読みたい場合は、私たちのブログ記事「["大規模なリアルワールドデータセットを探る: ClickHouseにおける100年以上の気象記録"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)」を参照することをお勧めします。

## データのダウンロード {#downloading-the-data}

- ClickHouse用にクリーンアップ、再構成、強化されたデータの[事前準備されたバージョン](#pre-prepared-data)。このデータは1900年から2022年までをカバーしています。
- [オリジナルのデータをダウンロード](#original-data)し、ClickHouseが必要とするフォーマットに変換します。独自のカラムを追加したいユーザーは、このアプローチを検討するかもしれません。

### 事前準備されたデータ {#pre-prepared-data}

より具体的には、Noaaの品質保証チェックに失敗しなかった行が削除されています。また、データは行ごとの測定から、各観測所IDと日付ごとの行に再構成されました。すなわち、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリがシンプルになり、結果として得られるテーブルがスパースになりにくくなります。最終的に、データには緯度と経度も追加されています。

このデータは以下のS3ロケーションで入手可能です。データをローカルファイルシステムにダウンロード（そしてClickHouseクライアントを使用して挿入）するか、ClickHouseに直接挿入します（[S3からの挿入](#inserting-from-s3)を参照）。

ダウンロードするには：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### オリジナルデータ {#original-data}

以下に、ClickHouseにロードするためのオリジナルデータをダウンロードし、変換する手順を詳述します。

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

フォーマットドキュメントとカラムの概要：

 - 11文字の観測所識別コード。これ自体は有用な情報をエンコードしています。
 - YEAR/MONTH/DAY = YYYYMMDD形式の8文字の日付（例：19860529 = 1986年5月29日）
 - ELEMENT = 要素タイプの4文字指標。実質的に測定タイプです。多くの測定値がありますが、以下を選択します：
    - PRCP - 降水量（十分の1ミリメートル）
    - SNOW - 降雪量（ミリメートル）
    - SNWD - 雪の深さ（ミリメートル）
    - TMAX - 最大気温（十分の1度）
    - TAVG - 平均気温（十分の1度）
    - TMIN - 最小気温（十分の1度）
    - PSUN - 日次の可能な日差しの割合（パーセント）
    - AWND - 平均日次風速（十分の1メートル毎秒）
    - WSFG - 最大突風風速（十分の1メートル毎秒）
    - WT** = 天候タイプ、ここで**は天候タイプを定義します。天候タイプの完全なリストはこちらです。
- DATA VALUE = ELEMENTの5文字データ値、すなわち測定値の値。
- M-FLAG = 1文字の測定フラグ。これは10の可能な値があります。これらの値のいくつかは、データの正確性に疑問を呈します。"P"に設定されたデータを受け入れます - 雨量がゼロと見なされていることが確認されていますが、これはPRCP、SNOW、およびSNWDの測定にのみ関連しています。
- Q-FLAGは測定の品質フラグで、14の可能な値があります。私たちは、空の値のデータのみを関心に持ちます。すなわち、これは品質保証チェックに失敗していません。
- S-FLAGは観測のソースフラグです。私たちの分析には役立たず無視します。
- OBS-TIME = 時刻観測の4文字（時：分）形式の時間（すなわち、0700 =午前7時）。これは、古いデータには通常存在しません。私たちの目的には無視します。

1行ごとの測定は、ClickHouseでスパースなテーブル構造を生成します。私たちは時間と駅ごとの行に変換し、測定値をカラムにしなければなりません。まず、`qFlag`が空の文字列に等しい行のみを制限します。

#### データのクリーニング {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を使用すると、関心のある測定を表す行をフィルタリングし、品質要件を満たすことができます：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行を超えるため、これはすべてのファイルを解析するため、迅速なクエリではありません。私たちの8コアマシンでは、約160秒かかります。

### データのピボット {#pivot-data}

1行ごとの構造は、ClickHouseで使用できますが、今後のクエリを不必要に複雑にすることになります。理想的には、各観測所IDと日付ごとの行が必要で、それぞれの測定タイプと関連値がカラムとして存在する形です。すなわち、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse localを使用し、シンプルな `GROUP BY` を用いることで、データをこの構造に再ピボットすることができます。メモリオーバーヘッドを制限するため、1ファイルずつ行います。

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

このクエリは単一の50GBファイル `noaa.csv` を生成します。

### データの強化 {#enriching-the-data}

データは観測所ID以外のロケーション情報を持っていませんが、観測所IDには国コードのプレフィックスが含まれています。理想的には、各観測所に関連する緯度と経度が必要です。これを実現するために、NOAAは各観測所の詳細を別の[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)として便利に提供しています。このファイルには、私たちの将来の分析に有用な5つのカラム（ID、緯度、経度、標高、名前）が含まれています。

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
このクエリは数分かかり、6.4 GBのファイル `noaa_enriched.parquet` を生成します。

## テーブル作成 {#create-table}

ClickHouse内でMergeTreeテーブルを作成します（ClickHouseクライアントから）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（十分の1度）',
   `tempMax` Int32 COMMENT '最大気温（十分の1度）',
   `tempMin` Int32 COMMENT '最小気温（十分の1度）',
   `precipitation` UInt32 COMMENT '降水量（十分の1ミリメートル）',
   `snowfall` UInt32 COMMENT '降雪量（ミリメートル）',
   `snowDepth` UInt32 COMMENT '雪の深さ（ミリメートル）',
   `percentDailySun` UInt8 COMMENT '日次の可能な日差しの割合（パーセント）',
   `averageWindSpeed` UInt32 COMMENT '平均日次風速（十分の1メートル毎秒）',
   `maxWindSpeed` UInt32 COMMENT '最大突風風速（十分の1メートル毎秒）',
   `weatherType` Enum8('通常' = 0, '霧' = 1, '大霧' = 2, '雷' = 3, '小さい雹' = 4, '雹' = 5, '氷' = 6, 'ほこり/灰' = 7, '煙/靄' = 8, '吹雪/吹飛ばされた雪' = 9, '竜巻' = 10, '強風' = 11, '飛び散る霧' = 12, '霧雨' = 13, '凍った霧雨' = 14, '雨' = 15, '凍った雨' = 16, '雪' = 17, '不明な降水量' = 18, '地面霧' = 21, '凍結霧' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```

## ClickHouseへのデータの挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは次のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

ここで、`<path>`はディスクのローカルファイルへのフルパスを表します。

[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照して、この読み込みを加速する方法を確認してください。

### S3からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```
この読み込みを加速する方法は、[大規模なデータ読み込みのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)についてのブログ記事を参照してください。

## サンプルクエリ {#sample-queries}

### これまでの最高気温 {#highest-temperature-ever}

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

5行のセット。経過時間: 0.514秒。処理行数: 10.6億行、4.27GB (2.06億行/秒, 8.29GB/秒)
```

[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)における[記録された最高気温](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と一致しているのは、安心です（2023年時点）。

### 最高のスキーリゾート {#best-ski-resorts}

[アメリカ合衆国のスキーリゾートのリスト](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)と、それぞれの場所を使用して、過去5年間において最も降雪があった上位1000の気象観測所と結合し、[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満の結果に制限します。リゾートごとの上位結果を選択し、総降雪量でソートします。なお、スキー条件の良い指標として、1800m以上のリゾートに制限しています。

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

5行のセット。経過時間: 0.750秒。処理行数: 6.89億行、3.20GB (918.20万行/秒, 4.26GB/秒)
ピークメモリ使用量: 67.66 MiB。
```

## クレジット {#credits}

私たちは、データの準備、クリーニング、配布におけるグローバル歴史気候ネットワークの努力を認識したいと思います。あなたの努力に感謝します。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [小数点以下のサブセットを指定してください。例：バージョン3.25]。NOAA国立環境情報センター。http://doi.org/10.7289/V5D21VHZ [17/08/2020]
