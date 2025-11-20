---
description: '過去128年間の1億3100万行の気象観測データ'
sidebar_label: '台湾の歴史的気象データセット'
slug: /getting-started/example-datasets/tw-weather
title: '台湾の歴史的気象データセット'
doc_type: 'guide'
keywords: ['example dataset', 'weather', 'taiwan', 'sample data', 'climate data']
---

このデータセットには、過去128年間の歴史的な気象観測データが含まれています。各行は、ある日時および気象観測所における1回分の観測値を表します。

このデータセットの元データは[こちら](https://github.com/Raingel/historical_weather)にあり、気象観測所番号の一覧は[こちら](https://github.com/Raingel/weather_station_list)で確認できます。

> 気象データセットの情報源には、中央気象局が設置した気象観測所（観測所コードが C0、C1、4 で始まるもの）および、農業委員会に属する農業気象観測所（それ以外の観測所コード）が含まれます。

    - StationId
    - MeasuredDate, the observation time
    - StnPres, the station air pressure
    - SeaPres, the sea level pressure
    - Td, the dew point temperature
    - RH, the relative humidity
    - Other elements where available



## データのダウンロード {#downloading-the-data}

- ClickHouse用に[前処理されたバージョン](#pre-processed-data)のデータで、クリーニング、再構造化、および拡充が行われています。このデータセットは1896年から2023年までをカバーしています。
- [元の生データをダウンロード](#original-raw-data)し、ClickHouseで必要な形式に変換します。独自のカラムを追加したいユーザーは、独自のアプローチを検討または実装することができます。

### 前処理済みデータ {#pre-processed-data}

データセットは、1行あたり1測定値から、気象観測所IDと測定日ごとに1行という形式に再構造化されています。例えば、

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

クエリが容易で、結果のテーブルはスパース性が低くなります。また、この気象観測所では測定できないため、一部の要素がnullになっています。

このデータセットは以下のGoogle Cloud Storageの場所で利用可能です。データセットをローカルファイルシステムにダウンロードして（ClickHouseクライアントで挿入する）か、ClickHouseに直接挿入してください（[URLからの挿入](#inserting-from-url)を参照）。

ダウンロードするには:

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz

```


# オプション: チェックサムを検証する
md5sum preprocessed_weather_daily_1896_2023.tar.gz
# チェックサムは次の値と一致する必要があります: 11b484f5bd9ddafec5cfb131eb2dd008

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv



# オプション: チェックサムを検証する

md5sum daily&#95;weather&#95;preprocessed&#95;1896&#95;2023.csv

# チェックサムは次の値と一致する必要があります: 1132248c78195c43d93f843753881754

````

### 元の生データ {#original-raw-data}

以下では、元の生データをダウンロードし、必要に応じて変換・加工する手順について説明します。

#### ダウンロード {#download}

元の生データをダウンロードするには:

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz
````


# オプション: チェックサムを検証する
md5sum raw_data_weather_daily_1896_2023.tar.gz
# チェックサムは次の値と一致するはずです: b66b9f137217454d655e3004d7d1b51a

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...



# オプション: チェックサムを検証する

cat *.csv | md5sum

# チェックサムは次の値と一致する必要があります: b26db404bf84d4063fac42e576464ce1

````

#### 台湾の気象観測所データを取得する {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv
````


# オプション: UTF-8-BOM を UTF-8 エンコーディングに変換する

sed -i &#39;1s/^\xEF\xBB\xBF//&#39; weather&#95;sta&#95;list.csv

```
```


## テーブルスキーマの作成 {#create-table-schema}

ClickHouse（ClickHouseクライアントから）でMergeTreeテーブルを作成します。

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


## ClickHouseへのデータ挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

ローカルファイルからのデータ挿入は、以下のように実行できます(ClickHouseクライアントから):

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

ここで `/path/to` は、ディスク上のローカルファイルへの具体的なユーザーパスを表します。

ClickHouseへのデータ挿入後のサンプルレスポンス出力は以下の通りです:

```response
Query id: 90e4b524-6e14-4855-817c-7e6f98fbeabb

Ok.
131985329 rows in set. Elapsed: 71.770 sec. Processed 131.99 million rows, 10.06 GB (1.84 million rows/s., 140.14 MB/s.)
Peak memory usage: 583.23 MiB.
```

### URLからの挿入 {#inserting-from-url}

```sql
INSERT INTO tw_weather_data SELECT *
FROM url('https://storage.googleapis.com/taiwan-weather-observaiton-datasets/daily_weather_preprocessed_1896_2023.csv', 'CSVWithNames')

```

これを高速化する方法については、[大規模データロードのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事をご覧ください。


## データ行数とサイズの確認 {#check-data-rows-and-sizes}

1. 挿入された行数を確認してみましょう:

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 131.99 million                  │
└─────────────────────────────────┘
```

2. このテーブルが使用しているディスク容量を確認してみましょう:

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


## サンプルクエリ {#sample-queries}

### Q1: 特定の年における各気象観測所の最高露点温度を取得する {#q1-retrieve-the-highest-dew-point-temperature-for-each-weather-station-in-the-specific-year}

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

### Q2: 特定の期間、フィールド、気象観測所による生データの取得 {#q2-raw-data-fetching-with-the-specific-duration-time-range-fields-and-weather-station}

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

このデータセットの準備、クリーニング、および配布における中央気象署と農業委員会農業気象観測ネットワーク（観測所）の取り組みに謝意を表します。ご尽力に感謝いたします。

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. Application-oriented deep learning model for early warning of rice blast in Taiwan. Ecological Informatics 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [13/12/2022]
