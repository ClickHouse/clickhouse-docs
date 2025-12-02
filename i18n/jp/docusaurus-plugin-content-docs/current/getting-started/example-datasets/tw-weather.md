---
description: '過去128年間の1億3100万行の気象観測データ'
sidebar_label: '台湾の歴史的気象データセット'
slug: /getting-started/example-datasets/tw-weather
title: '台湾の歴史的気象データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', '天気', '台湾', 'サンプルデータ', '気候データ']
---

このデータセットには、過去128年間にわたる歴史的な気象観測値が含まれています。各行は、ある日時と気象観測所における1つの観測値を表します。

このデータセットの元データは[こちら](https://github.com/Raingel/historical_weather)で入手でき、気象観測所番号の一覧は[こちら](https://github.com/Raingel/weather_station_list)にあります。

> 気象データセットの出典には、中央気象局が設置した気象観測所（観測所コードが C0、C1、および 4 で始まるもの）と、農業委員会に属する農業気象観測所（上記以外の観測所コード）が含まれます。

- StationId
    - MeasuredDate, 観測日時
    - StnPres, 観測所の気圧
    - SeaPres, 海面気圧
    - Td, 露点温度
    - RH, 相対湿度
    - その他、利用可能な項目

## データのダウンロード {#downloading-the-data}

- ClickHouse 向けにクリーンアップ、再構成、拡充された[前処理済みデータ](#pre-processed-data)。このデータセットは 1896 年から 2023 年までをカバーします。
- [元の生データをダウンロード](#original-raw-data)し、ClickHouse が要求する形式に変換します。独自のカラムを追加したいユーザーは、このデータを調査したり、自身のアプローチを検討・完成させたりするのに利用できます。

### 前処理済みデータ {#pre-processed-data}

このデータセットは、「測定ごとに 1 行」の形式から、「気象観測所 ID」と「測定日」ごとに 1 行となる形式へと再構成されています。つまり、次のような形です。

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

このデータに対してクエリを実行するのは簡単であり、結果のテーブルはあまりスパースではなく、この観測所では測定されないために `null` になっている要素も含まれます。

このデータセットは、次の Google Cloud Storage の場所で利用できます。データセットをローカルファイルシステムにダウンロードして（ClickHouse クライアントで挿入する）か、[URL からの挿入](#inserting-from-url)を参照して ClickHouse に直接挿入してください。

ダウンロードするには：

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz

# オプション: チェックサムを検証する {#option-validate-the-checksum}
md5sum preprocessed_weather_daily_1896_2023.tar.gz
# チェックサムは次と一致する必要があります: 11b484f5bd9ddafec5cfb131eb2dd008 {#checksum-should-be-equal-to-11b484f5bd9ddafec5cfb131eb2dd008}

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv

# オプション: チェックサムを検証する {#option-validate-the-checksum}
md5sum daily_weather_preprocessed_1896_2023.csv
# チェックサムは次と一致する必要があります: 1132248c78195c43d93f843753881754 {#checksum-should-be-equal-to-1132248c78195c43d93f843753881754}
```


### 元の生データ {#original-raw-data}

以下では、目的に応じて変換や加工を行うための元の生データをダウンロードする手順について説明します。

#### ダウンロード {#download}

元の生データをダウンロードするには：

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz

# オプション: チェックサムの検証 {#option-validate-the-checksum}
md5sum raw_data_weather_daily_1896_2023.tar.gz
# チェックサムは b66b9f137217454d655e3004d7d1b51a と一致する必要があります {#checksum-should-be-equal-to-b66b9f137217454d655e3004d7d1b51a}

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...

# オプション: チェックサムの検証 {#option-validate-the-checksum}
cat *.csv | md5sum
# チェックサムは b26db404bf84d4063fac42e576464ce1 と一致する必要があります {#checksum-should-be-equal-to-b26db404bf84d4063fac42e576464ce1}
```


#### 台湾の気象観測所情報を取得する {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv

# オプション: UTF-8-BOMからUTF-8エンコーディングへ変換 {#option-convert-the-utf-8-bom-to-utf-8-encoding}
sed -i '1s/^\xEF\xBB\xBF//' weather_sta_list.csv
```


## テーブルスキーマの作成 {#create-table-schema}

ClickHouse クライアントから、ClickHouse 上に MergeTree テーブルを作成します。

```bash
CREATE TABLE tw_weather_data (
    StationId String null,
    MeasuredDate DateTime64,
    StnPres Float64 null,
    SeaPres Float64 null,
    Tx Float64 null,
    Td Float64 null,
    RH Float64 null,
    WS Float64 null,
    WD Float64 null,
    WSGust Float64 null,
    WDGust Float64 null,
    Precp Float64 null,
    PrecpHour Float64 null,
    SunShine Float64 null,
    GloblRad Float64 null,
    TxSoil0cm Float64 null,
    TxSoil5cm Float64 null,
    TxSoil10cm Float64 null,
    TxSoil20cm Float64 null,
    TxSoil50cm Float64 null,
    TxSoil100cm Float64 null,
    TxSoil30cm Float64 null,
    TxSoil200cm Float64 null,
    TxSoil300cm Float64 null,
    TxSoil500cm Float64 null,
    VaporPressure Float64 null,
    UVI Float64 null,
    "Cloud Amount" Float64 null,
    EvapA Float64 null,
    Visb Float64 null
)
ENGINE = MergeTree
ORDER BY (MeasuredDate);
```


## ClickHouse への挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは、ClickHouse クライアントから次のようにローカルファイルを利用して挿入できます：

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

ここで `/path/to` は、ディスク上のローカルファイルへの実際のパスを表します。

ClickHouse にデータを挿入した後のサンプルのレスポンス出力は次のとおりです。

```response
Query id: 90e4b524-6e14-4855-817c-7e6f98fbeabb

Ok.
131985329 rows in set. Elapsed: 71.770 sec. Processed 131.99 million rows, 10.06 GB (1.84 million rows/s., 140.14 MB/s.)
Peak memory usage: 583.23 MiB.
```


### URL からのデータ挿入 {#inserting-from-url}

```sql
INSERT INTO tw_weather_data SELECT *
FROM url('https://storage.googleapis.com/taiwan-weather-observaiton-datasets/daily_weather_preprocessed_1896_2023.csv', 'CSVWithNames')

```

これをより高速化する方法の詳細については、[大規模データロードのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事を参照してください。


## データ行数とサイズを確認する {#check-data-rows-and-sizes}

1. 何行挿入されたか確認してみましょう。

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 1億3199万                       │
└─────────────────────────────────┘
```

2. このテーブルが使用しているディスク容量を確認します:

```sql
SELECT
    formatReadableSize(sum(bytes)) AS disk_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size
FROM system.parts
WHERE (`table` = 'tw_weather_data') AND active
```

```response
┌─disk_size─┬─uncompressed_size─┐
│ 2.13 GiB  │ 32.94 GiB         │
└───────────┴───────────────────┘
```


## クエリ例 {#sample-queries}

### Q1: 特定の年における気象観測所ごとの最高露点温度を取得する {#q1-retrieve-the-highest-dew-point-temperature-for-each-weather-station-in-the-specific-year}

```sql
SELECT
    StationId,
    max(Td) AS max_td
FROM tw_weather_data
WHERE (year(MeasuredDate) = 2023) AND (Td IS NOT NULL)
GROUP BY StationId

┌─StationId─┬─max_td─┐
│ 466940    │      1 │
│ 467300    │      1 │
│ 467540    │      1 │
│ 467490    │      1 │
│ 467080    │      1 │
│ 466910    │      1 │
│ 467660    │      1 │
│ 467270    │      1 │
│ 467350    │      1 │
│ 467571    │      1 │
│ 466920    │      1 │
│ 467650    │      1 │
│ 467550    │      1 │
│ 467480    │      1 │
│ 467610    │      1 │
│ 467050    │      1 │
│ 467590    │      1 │
│ 466990    │      1 │
│ 467060    │      1 │
│ 466950    │      1 │
│ 467620    │      1 │
│ 467990    │      1 │
│ 466930    │      1 │
│ 467110    │      1 │
│ 466881    │      1 │
│ 467410    │      1 │
│ 467441    │      1 │
│ 467420    │      1 │
│ 467530    │      1 │
│ 466900    │      1 │
└───────────┴────────┘

30 rows in set. Elapsed: 0.045 sec. Processed 6.41 million rows, 187.33 MB (143.92 million rows/s., 4.21 GB/s.)
```


### Q2: 特定の期間・フィールド・気象観測所を指定した生データの取得 {#q2-raw-data-fetching-with-the-specific-duration-time-range-fields-and-weather-station}

```sql
SELECT
    StnPres,
    SeaPres,
    Tx,
    Td,
    RH,
    WS,
    WD,
    WSGust,
    WDGust,
    Precp,
    PrecpHour
FROM tw_weather_data
WHERE (StationId = 'C0UB10') AND (MeasuredDate >= '2023-12-23') AND (MeasuredDate < '2023-12-24')
ORDER BY MeasuredDate ASC
LIMIT 10
```

```response
┌─StnPres─┬─SeaPres─┬───Tx─┬───Td─┬─RH─┬──WS─┬──WD─┬─WSGust─┬─WDGust─┬─Precp─┬─PrecpHour─┐
│  1029.5 │    ᴺᵁᴸᴸ │ 11.8 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 271 │    5.5 │    275 │ -99.8 │     -99.8 │
│  1029.8 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 289 │    5.5 │    308 │ -99.8 │     -99.8 │
│  1028.6 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 79 │ 2.3 │ 251 │    6.1 │    289 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │   13 │ ᴺᵁᴸᴸ │ 75 │ 4.3 │ 312 │    7.5 │    316 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.1 │ ᴺᵁᴸᴸ │ 89 │ 7.1 │ 310 │   11.6 │    322 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.6 │ ᴺᵁᴸᴸ │ 90 │ 3.1 │ 269 │   10.7 │    295 │ -99.8 │     -99.8 │
│  1027.9 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 89 │ 4.7 │ 296 │    8.1 │    310 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │ 12.2 │ ᴺᵁᴸᴸ │ 94 │ 2.5 │ 246 │    7.1 │    283 │ -99.8 │     -99.8 │
│  1028.4 │    ᴺᵁᴸᴸ │ 12.5 │ ᴺᵁᴸᴸ │ 94 │ 3.1 │ 265 │    4.8 │    297 │ -99.8 │     -99.8 │
│  1028.3 │    ᴺᵁᴸᴸ │ 13.6 │ ᴺᵁᴸᴸ │ 91 │ 1.2 │ 273 │    4.4 │    256 │ -99.8 │     -99.8 │
└─────────┴─────────┴──────┴──────┴────┴─────┴─────┴────────┴────────┴───────┴───────────┘

10行を取得しました。経過時間: 0.009秒。処理済み: 91.70千行、2.33 MB (9.67百万行/秒、245.31 MB/秒)
```


## クレジット {#credits}

本データセットの作成、整備および配布にご尽力いただいた、農業委員会所属の中央気象署ならびに農業気象観測網（観測所）の皆様に感謝申し上げます。皆様のご尽力に深く感謝いたします。

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. Application-oriented deep learning model for early warning of rice blast in Taiwan. Ecological Informatics 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [13/12/2022]