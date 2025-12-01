---
description: '過去120年間の25億行の気候データ'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'noaa', '気象データ', 'サンプルデータ', '気候']
---

このデータセットには、過去120年間の気象観測データが含まれています。各行は、ある時点・ある観測所での1つの観測値を表します。

より正確には、このデータの[出典](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)によると次のとおりです。

> GHCN-Daily は、世界の陸域での毎日の観測値を含むデータセットです。世界中の陸上観測所による観測値を含んでおり、その約3分の2は降水量のみの観測値です (Menne et al., 2012)。GHCN-Daily は、数多くの情報源からの気候記録を統合し、共通の品質保証チェック一式 (Durre et al., 2010) を適用したコンポジットなデータセットです。このアーカイブには、次の気象要素が含まれます。

- 日最高気温
    - 日最低気温
    - 観測時の気温
    - 降水量（雨、融雪など）
    - 降雪量
    - 積雪深
    - 利用可能な場合のその他の要素

The sections below give a brief overview of the steps that were involved in bringing this dataset into ClickHouse. If you're interested in reading about each step in more detail, we recommend to take a look at our blog post titled ["Exploring massive, real-world data sets: 100+ Years of Weather Records in ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).

## データのダウンロード {#downloading-the-data}

- ClickHouse 向けに[事前に用意されたデータ](#pre-prepared-data)。クレンジングや再構造化、拡張が行われており、1900 年から 2022 年までをカバーしています。
- [元データをダウンロード](#original-data)して、ClickHouse に必要な形式へ変換します。独自のカラムを追加したいユーザーは、このアプローチを検討するとよいでしょう。

### 事前処理済みデータ {#pre-prepared-data}

より具体的には、NOAA による品質保証チェックで一度も失敗しなかった行は削除されています。また、データは 1 行につき 1 測定値という構造から、station id と日付ごとに 1 行という構造に再編成されています。つまり、

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

これはクエリをより簡単にし、結果のテーブルが疎になりにくくなるようにします。さらに、データには緯度・経度情報も付加されています。

このデータは次の S3 ロケーションで利用できます。データをローカルファイルシステムにダウンロードして（ClickHouse クライアントを使って挿入する）、または ClickHouse に直接挿入します（[S3 からの挿入](#inserting-from-s3) を参照）。

ダウンロードするには:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```


### 元データ {#original-data}

以下では、ClickHouse にロードするための準備として、元データをダウンロードおよび変換する手順を説明します。

#### ダウンロード {#download}

元データをダウンロードするには、次の手順を行います。

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

[フォーマットのドキュメント](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)の要約:

フォーマット仕様および各列の内容を順番にまとめると次のとおりです。


- 11 文字の観測所識別コード。これ自体にいくつか有用な情報がエンコードされています。
- YEAR/MONTH/DAY = YYYYMMDD 形式の 8 文字の日付（例: 19860529 = 1986 年 5 月 29 日）。
- ELEMENT = 要素タイプを示す 4 文字の指標。実質的には測定タイプを表します。利用可能な測定は多数ありますが、ここでは次を選択します:
  - PRCP - 降水量（0.1 mm 単位）
  - SNOW - 降雪量（mm）
  - SNWD - 積雪深（mm）
  - TMAX - 最高気温（0.1 ℃ 単位）
  - TAVG - 平均気温（0.1 ℃ 単位）
  - TMIN - 最低気温（0.1 ℃ 単位）
  - PSUN - 1 日あたりの可能日照時間に対する日照の割合（パーセント）
  - AWND - 1 日平均風速（0.1 m/s 単位）
  - WSFG - 突風時の最大風速（0.1 m/s 単位）
  - WT** = Weather Type。** が天気の種類を表します。天気の種類の完全な一覧はこちらを参照してください。
  - DATA VALUE = ELEMENT に対する 5 文字のデータ値、すなわち測定値。
  - M-FLAG = 1 文字の Measurement Flag。取り得る値は 10 種類あります。このうちいくつかはデータ精度に疑義があることを示します。ここでは、この値が "P"（missing presumed zero、欠測だが 0 と推定）に設定されているデータも受け入れます。これは PRCP、SNOW、SNWD の測定にのみ関連するためです。
- Q-FLAG は測定の品質フラグで、取り得る値は 14 種類あります。ここでは値が空、すなわちどの品質保証チェックにも失敗していないデータのみに関心があります。
- S-FLAG は観測のソースフラグです。今回の分析には有用ではないため無視します。
- OBS-TIME = 観測時刻を表す 4 文字の時刻（時分）情報（例: 0700 = 午前 7:00）。古いデータには存在しないことが一般的です。本ガイドではこれも無視します。

1 行あたり 1 件の測定値とする形式では、ClickHouse ではスパースなテーブル構造になってしまいます。時刻と観測所ごとに 1 行とし、測定値を列として持つ形式に変換する必要があります。まず、問題のない行、すなわち `qFlag` が空文字列に等しい行にデータセットを絞り込みます。

#### データをクリーンアップする {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を使用して、関心のある測定値を表し、かつ品質要件を満たす行だけが残るようにフィルタリングできます。

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26億行以上あるため、すべてのファイルをパースするこのクエリは高速ではありません。8コアのマシンでは、完了までに約160秒かかります。


### データのピボット {#pivot-data}

1 行に 1 つの計測値を持つ構造も ClickHouse で利用できますが、将来のクエリを不必要に複雑にしてしまいます。理想的には、各 station id と日付ごとに 1 行とし、各計測タイプとその値がそれぞれ列になる形が望ましいです。つまり、次のようなイメージです。

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse local とシンプルな `GROUP BY` を使うことで、データをこの構造にピボットし直せます。メモリのオーバーヘッドを抑えるため、これを 1 ファイルずつ実行します。

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

このクエリにより、サイズが 50GB の単一ファイル `noaa.csv` が生成されます。


### データの拡充 {#enriching-the-data}

現在のデータには、国コードのプレフィックスを含むステーション ID 以外に位置情報に関する情報がありません。本来であれば、各ステーションには緯度と経度が紐づいていることが望ましいです。これを実現するために、NOAA は各ステーションの詳細を別ファイルとして提供しており、それが [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file) です。このファイルには[複数の列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)があり、そのうち今後の分析で有用なのは 5 つの列、すなわち id、latitude、longitude、elevation、name です。

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

このクエリは実行に数分かかり、サイズ 6.4 GB の `noaa_enriched.parquet` ファイルを生成します。


## テーブルの作成 {#create-table}

ClickHouse クライアントから、ClickHouse 上に MergeTree テーブルを作成します。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均気温（0.1℃単位）',
   `tempMax` Int32 COMMENT '最高気温（0.1℃単位）',
   `tempMin` Int32 COMMENT '最低気温（0.1℃単位）',
   `precipitation` UInt32 COMMENT '降水量（0.1mm単位）',
   `snowfall` UInt32 COMMENT '降雪量（mm）',
   `snowDepth` UInt32 COMMENT '積雪深（mm）',
   `percentDailySun` UInt8 COMMENT '日照率（可能日照時間に対する割合、%）',
   `averageWindSpeed` UInt32 COMMENT '日平均風速（0.1m/s単位）',
   `maxWindSpeed` UInt32 COMMENT '最大瞬間風速（0.1m/s単位）',
   `weatherType` Enum8('通常' = 0, '霧' = 1, '濃霧' = 2, '雷' = 3, '小雹' = 4, '雹' = 5, '雨氷' = 6, '砂塵/火山灰' = 7, '煙霧/霞' = 8, '地吹雪/吹き溜まり' = 9, '竜巻' = 10, '強風' = 11, '飛沫' = 12, '靄' = 13, '霧雨' = 14, '凍結霧雨' = 15, '雨' = 16, '凍雨' = 17, '雪' = 18, '不明な降水' = 19, '地霧' = 21, '凍霧' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## ClickHouse へのデータ挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは、ClickHouse クライアントから次のようにローカルファイルから挿入できます：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

ここで `<path>` は、ローカルディスク上のファイルへの完全なパスを表します。

この読み込みを高速化する方法については[こちら](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)を参照してください。


### S3 からの挿入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

データロードを高速化する方法については、[大規模データロードのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事を参照してください。


## サンプルクエリ {#sample-queries}

### 観測史上最高気温 {#highest-temperature-ever}

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

5行。経過時間: 0.514秒。処理: 10.6億行、4.27 GB (20.6億行/秒、8.29 GB/秒)
```

2023 年時点での [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) における[記録上の最高気温](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)と比べても、安心できるほどよく一致しています。


### 最高のスキーリゾート {#best-ski-resorts}

アメリカ合衆国の[スキーリゾート一覧](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)とそれぞれの所在地を用い、過去5年間のいずれかの月における降雪量が最大だった上位1000件の気象観測所と結合します。この結合結果を[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)でソートし、距離が20km未満のものに絞り込んだうえで、リゾートごとに最上位の結果を選択し、それらを合計降雪量で並べ替えます。なお、良好なスキーコンディションの大まかな指標として、標高1800m以上のリゾートのみに制限しています。

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

5行のデータセット。経過時間: 0.750秒。処理行数: 6億8910万行、3.20 GB (9億1820万行/秒、4.26 GB/秒)
ピークメモリ使用量: 67.66 MiB。
```


## 謝辞 {#credits}

このデータの作成、整備および配布に尽力された Global Historical Climatology Network の皆様に感謝いたします。皆様のご尽力に深く感謝申し上げます。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [使用したサブセットを小数点以下で示すこと（例: Version 3.25）]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]