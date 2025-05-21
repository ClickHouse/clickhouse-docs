description: '過去128年間の131百万行の気象観測データ'
sidebar_label: '台湾の歴史的気象データセット'
sidebar_position: 1
slug: /getting-started/example-datasets/tw-weather
title: '台湾の歴史的気象データセット'
```

このデータセットは、過去128年間の歴史的な気象観測の測定値を含んでいます。各行は、日時と気象観測所のポイントに対する測定を示しています。

このデータセットの起源は[こちら](https://github.com/Raingel/historical_weather)で確認でき、気象観測所の番号のリストは[こちら](https://github.com/Raingel/weather_station_list)で見つけることができます。

> 気象データセットのソースには、中央気象局が設立した気象観測所（ステーションコードはC0、C1、および4で始まります）と、農業委員会に所属する農業気象観測所（上記以外のステーションコード）が含まれます：

- StationId
- MeasuredDate、観測時間
- StnPres、ステーション気圧 
- SeaPres、海面気圧
- Td、露点温度
- RH、相対湿度
- 利用可能なその他の要素

## データのダウンロード {#downloading-the-data}

- ClickHouse用の[前処理されたバージョン](#pre-processed-data)は、クリーンアップされ、再構造化され、強化されています。このデータセットは1896年から2023年までのデータをカバーしています。
- [オリジナルの生データをダウンロード](#original-raw-data)し、ClickHouseが必要とする形式に変換します。独自のカラムを追加したいユーザーは、独自のアプローチを探索または完成させることが望まれます。

### 前処理されたデータ {#pre-processed-data}

データセットは、1行の測定値から気象観測所IDと測定日ごとに1行に再構造化されています。すなわち、

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

クエリを実行しやすく、結果のテーブルはスパースが少なく、一部の要素はこの気象観測所で測定できないため、nullになります。

このデータセットは、以下のGoogle Cloud Storageの場所で入手可能です。データセットをローカルファイルシステムにダウンロードするか（ClickHouseクライアントを介して挿入）、ClickHouseに直接挿入します（[URLからの挿入](#inserting-from-url)を参照）。

ダウンロードするには：

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz


# オプション：チェックサムの検証
md5sum preprocessed_weather_daily_1896_2023.tar.gz

# チェックサムは次の通りであるべき：11b484f5bd9ddafec5cfb131eb2dd008

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv


# オプション：チェックサムの検証
md5sum daily_weather_preprocessed_1896_2023.csv

# チェックサムは次の通りであるべき：1132248c78195c43d93f843753881754
```

### オリジナルの生データ {#original-raw-data}

以下は、オリジナルの生データをダウンロードして、変換及び変形するための手順に関する詳細です。

#### ダウンロード {#download}

オリジナルの生データをダウンロードするには：

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz


# オプション：チェックサムの検証
md5sum raw_data_weather_daily_1896_2023.tar.gz

# チェックサムは次の通りであるべき：b66b9f137217454d655e3004d7d1b51a

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...


# オプション：チェックサムの検証
cat *.csv | md5sum

# チェックサムは次の通りであるべき：b26db404bf84d4063fac42e576464ce1
```

#### 台湾の気象観測所を取得 {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv


# オプション：UTF-8-BOMをUTF-8エンコーディングに変換
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

データは、次のようにローカルファイルから挿入できます（ClickHouseクライアントから）：

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

ここで、`/path/to`はディスク上のローカルファイルへの特定のユーザーパスを表します。

データをClickHouseに挿入した後のサンプルレスポンス出力は次の通りです：

```response
Query id: 90e4b524-6e14-4855-817c-7e6f98fbeabb

Ok.
131985329行がセットにあります。経過時間: 71.770秒。131.99百万行処理、10.06 GB (1.84百万行/秒、140.14 MB/秒)。
ピークメモリ使用量: 583.23 MiB。
```

### URLからの挿入 {#inserting-from-url}

```sql
INSERT INTO tw_weather_data SELECT *
FROM url('https://storage.googleapis.com/taiwan-weather-observaiton-datasets/daily_weather_preprocessed_1896_2023.csv', 'CSVWithNames')
```

この処理を迅速化する方法は、[大規模なデータローディングの調整](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)に関するブログ記事を参照してください。

## データ行とサイズの確認 {#check-data-rows-and-sizes}

1. 挿入された行数を確認しましょう：

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 131.99百万                         │
└─────────────────────────────────┘
```

2. このテーブルに使用されているディスクスペースを確認しましょう：

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

### Q1: 特定の年の各気象観測所の最高露点温度を取得 {#q1-retrieve-the-highest-dew-point-temperature-for-each-weather-station-in-the-specific-year}

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

30行がセットにあります。経過時間: 0.045秒。6.41百万行処理、187.33 MB (143.92百万行/秒、4.21 GB/秒)。
```

### Q2: 特定の期間、フィールドおよび気象観測所を用いて生データを取得 {#q2-raw-data-fetching-with-the-specific-duration-time-range-fields-and-weather-station}

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

10行がセットにあります。経過時間: 0.009秒。91.70千行処理、2.33 MB (9.67百万行/秒、245.31 MB/秒)。
```

## 謝辞 {#credits}

このデータセットの準備、クリーンアップ、配布に関して、中央気象局および農業委員会の農業気象観測ネットワーク（ステーション）の努力に感謝します。あなたの努力に感謝します。

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. 台湾における稲のいもち病の早期警告のためのアプリケーション指向の深層学習モデル。エコロジカルインフォマティクス 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [2022年12月13日]
