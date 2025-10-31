---
'description': '過去128年間の気象観測データの131百万行'
'sidebar_label': '台湾の歴史的気象データセット'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/tw-weather'
'title': '台湾の歴史的気象データセット'
'doc_type': 'reference'
---

このデータセットには、過去128年間の気象観測データが含まれています。各行は、特定の日付、時間、および気象観測所の測定値を示しています。

このデータセットの起源については、[こちら](https://github.com/Raingel/historical_weather)で確認でき、気象観測所の番号リストは[こちら](https://github.com/Raingel/weather_station_list)で見つけることができます。

> 気象データセットのソースには、中央気象局が設立した気象観測所（ステーションコードはC0、C1、4で始まる）や農業委員会に属する農業気象観測所（上記以外のステーションコード）が含まれています：

    - StationId
    - MeasuredDate：観測時間
    - StnPres：観測所の気圧
    - SeaPres：海面気圧
    - Td：露点温度
    - RH：相対湿度
    - その他の要素（利用可能な場合）

## データのダウンロード {#downloading-the-data}

- [前処理済みバージョン](#pre-processed-data)のデータは、ClickHouse用にクリーンナップ、再構築、強化されたものです。このデータセットは1896年から2023年までの年をカバーしています。
- [元の生データをダウンロード](#original-raw-data)し、ClickHouseが必要とするフォーマットに変換します。独自のカラムを追加したいユーザーは、自分のアプローチを探求または完成させることをお勧めします。

### 前処理済みデータ {#pre-processed-data}

データセットは、行ごとの測定から、気象観測所IDおよび測定日ごとの行への再構築が行われています。すなわち、

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

クエリが容易で、結果のテーブルがスパースが少なく、一部の要素がこの気象観測所で測定できないためにnullであることを確認できます。

このデータセットは、以下のGoogle CloudStorageの場所で利用可能です。データセットをローカルファイルシステムにダウンロードするか（ClickHouseクライアントを使用して挿入）、直接ClickHouseに挿入してください（[URLからの挿入](#inserting-from-url)を参照）。

ダウンロード方法：

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz


# Option: Validate the checksum
md5sum preprocessed_weather_daily_1896_2023.tar.gz

# Checksum should be equal to: 11b484f5bd9ddafec5cfb131eb2dd008

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv


# Option: Validate the checksum
md5sum daily_weather_preprocessed_1896_2023.csv

# Checksum should be equal to: 1132248c78195c43d93f843753881754
```

### 元の生データ {#original-raw-data}

元の生データをダウンロードして変換および変容するためのステップに関する詳細は以下の通りです。

#### ダウンロード {#download}

元の生データをダウンロードするには：

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz


# Option: Validate the checksum
md5sum raw_data_weather_daily_1896_2023.tar.gz

# Checksum should be equal to: b66b9f137217454d655e3004d7d1b51a

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...


# Option: Validate the checksum
cat *.csv | md5sum

# Checksum should be equal to: b26db404bf84d4063fac42e576464ce1
```

#### 台湾の気象観測所を取得 {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv


# Option: Convert the UTF-8-BOM to UTF-8 encoding
sed -i '1s/^\xEF\xBB\xBF//' weather_sta_list.csv
```

## テーブルスキーマの作成 {#create-table-schema}

ClickHouseでMergeTreeテーブルを作成します（ClickHouseクライアントから）。

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

## ClickHouseへの挿入 {#inserting-into-clickhouse}

### ローカルファイルからの挿入 {#inserting-from-local-file}

データは以下のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

ここで、`/path/to`はディスク上のローカルファイルへの特定のユーザーパスを表します。

データをClickHouseに挿入した後のサンプルレスポンス出力は以下の通りです：

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
これを高速化する方法については、[大規模データのロードのチューニング](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事をご覧ください。

## データ行とサイズの確認 {#check-data-rows-and-sizes}

1. 挿入された行数を確認しましょう：

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 131.99 million                  │
└─────────────────────────────────┘
```

2. このテーブルのディスクスペースの使用量を確認しましょう：

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

### Q1: 特定の年における各気象観測所の露点温度の最高値を取得 {#q1-retrieve-the-highest-dew-point-temperature-for-each-weather-station-in-the-specific-year}

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

### Q2: 特定の期間における生データの取得、フィールドおよび気象観測所 {#q2-raw-data-fetching-with-the-specific-duration-time-range-fields-and-weather-station}

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

10 rows in set. Elapsed: 0.009 sec. Processed 91.70 thousand rows, 2.33 MB (9.67 million rows/s., 245.31 MB/s.)
```

## クレジット {#credits}

このデータセットの準備、クリーンナップ、配布に関して、中央気象局および農業委員会の農業気象観測ネットワーク（ステーション）の努力に感謝の意を表します。あなたの努力に感謝します。

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. Application-oriented deep learning model for early warning of rice blast in Taiwan. Ecological Informatics 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [13/12/2022]
