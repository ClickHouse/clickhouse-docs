---
description: 'コントリビューター主導のグローバル・センサーネットワークである Sensor.Community が生成するオープンな環境データの、200 億件以上のレコード。'
sidebar_label: '環境センサー・データ'
slug: /getting-started/example-datasets/environmental-sensors
title: '環境センサー・データ'
doc_type: 'guide'
keywords: ['environmental sensors', 'Sensor.Community', 'air quality data', 'environmental data', 'getting started']
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/) は、オープンな環境データを作成する、コントリビューター主導のグローバルなセンサーネットワークです。データは世界中のセンサーから収集されています。誰でもセンサーを購入し、好きな場所に設置できます。データをダウンロードするための API は [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs) で公開されており、データは [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/) のもとで自由に利用できます。

:::important
このデータセットには 200 億件を超えるレコードがあるため、以下のコマンドをそのままコピー＆ペーストする前に、お使いの環境がその規模のデータ量を扱えるかどうかに注意してください。以下のコマンドは、[ClickHouse Cloud](https://clickhouse.cloud) の **Production** インスタンス上で実行されたものです。
:::

1. データは S3 に格納されているため、`s3` テーブル関数を使ってファイルからテーブルを作成できます。また、その場でデータをクエリすることもできます。ClickHouse に挿入してみる前に、いくつか行を確認してみましょう。

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

データは CSV ファイルですが、区切り文字としてセミコロンを使用しています。行は次のようになっています。


```response
┌─sensor_id─┬─sensor_type─┬─location─┬────lat─┬────lon─┬─timestamp───────────┬──pressure─┬─altitude─┬─pressure_sealevel─┬─temperature─┐
│      9119 │ BMP180      │     4594 │ 50.994 │  7.126 │ 2019-06-01T00:00:00 │    101471 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        19.9 │
│     21210 │ BMP180      │    10762 │ 42.206 │ 25.326 │ 2019-06-01T00:00:00 │     99525 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        19.3 │
│     19660 │ BMP180      │     9978 │ 52.434 │ 17.056 │ 2019-06-01T00:00:04 │    101570 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        15.3 │
│     12126 │ BMP180      │     6126 │ 57.908 │  16.49 │ 2019-06-01T00:00:05 │ 101802.56 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        8.07 │
│     15845 │ BMP180      │     8022 │ 52.498 │ 13.466 │ 2019-06-01T00:00:05 │    101878 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │          23 │
│     16415 │ BMP180      │     8316 │ 49.312 │  6.744 │ 2019-06-01T00:00:06 │    100176 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        14.7 │
│      7389 │ BMP180      │     3735 │ 50.136 │ 11.062 │ 2019-06-01T00:00:06 │     98905 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        12.1 │
│     13199 │ BMP180      │     6664 │ 52.514 │  13.44 │ 2019-06-01T00:00:07 │ 101855.54 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │       19.74 │
│     12753 │ BMP180      │     6440 │ 44.616 │  2.032 │ 2019-06-01T00:00:07 │     99475 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │          17 │
│     16956 │ BMP180      │     8594 │ 52.052 │  8.354 │ 2019-06-01T00:00:08 │    101322 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        17.2 │
└───────────┴─────────────┴──────────┴────────┴────────┴─────────────────────┴───────────┴──────────┴───────────────────┴─────────────┘
```

2. ClickHouse にデータを保存するために、次の `MergeTree` テーブルを使用します。


```sql
CREATE TABLE sensors
(
    sensor_id UInt16,
    sensor_type Enum('BME280', 'BMP180', 'BMP280', 'DHT22', 'DS18B20', 'HPM', 'HTU21D', 'PMS1003', 'PMS3003', 'PMS5003', 'PMS6003', 'PMS7003', 'PPD42NS', 'SDS011'),
    location UInt32,
    lat Float32,
    lon Float32,
    timestamp DateTime,
    P1 Float32,
    P2 Float32,
    P0 Float32,
    durP1 Float32,
    ratioP1 Float32,
    durP2 Float32,
    ratioP2 Float32,
    pressure Float32,
    altitude Float32,
    pressure_sealevel Float32,
    temperature Float32,
    humidity Float32,
    date Date MATERIALIZED toDate(timestamp)
)
ENGINE = MergeTree
ORDER BY (timestamp, sensor_id);
```

3. ClickHouse Cloud サービスには、`default` という名前のクラスタがあります。クラスタ内のノードから S3 ファイルを並列に読み取る `s3Cluster` テーブル関数を使用します。（クラスタがない場合は、`s3` 関数のみを使用し、クラスタ名は指定しないでください。）

このクエリの実行には時間がかかります。非圧縮データで約 1.67T あります。

```sql
INSERT INTO sensors
    SELECT *
    FROM s3Cluster(
        'default',
        'https://clickhouse-public-datasets.s3.amazonaws.com/sensors/monthly/*.csv.zst',
        'CSVWithNames',
        $$ sensor_id UInt16,
        sensor_type String,
        location UInt32,
        lat Float32,
        lon Float32,
        timestamp DateTime,
        P1 Float32,
        P2 Float32,
        P0 Float32,
        durP1 Float32,
        ratioP1 Float32,
        durP2 Float32,
        ratioP2 Float32,
        pressure Float32,
        altitude Float32,
        pressure_sealevel Float32,
        temperature Float32,
        humidity Float32 $$
    )
SETTINGS
    format_csv_delimiter = ';',
    input_format_allow_errors_ratio = '0.5',
    input_format_allow_errors_num = 10000,
    input_format_parallel_parsing = 0,
    date_time_input_format = 'best_effort',
    max_insert_threads = 32,
    parallel_distributed_insert_select = 1;
```

こちらがレスポンスです。行数と処理速度が表示されています。1 秒あたり 600 万行を超える速度で取り込まれています！

```response
0 行が返されました。経過時間: 3419.330 秒。処理済み: 206.9 億行、1.67 TB (605 万行/秒、488.52 MB/秒)
```

4. `sensors` テーブルにどれくらいのディスク容量が必要か確認してみましょう：

```sql
SELECT
    disk_name,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate,
    sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1) AND (table = 'sensors')
GROUP BY
    disk_name
ORDER BY size DESC;
```

1.67T は 310 GiB まで圧縮されており、行数は 206.9 億行です。

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. ClickHouse にデータが取り込まれたので、ここから分析してみましょう。より多くのセンサーが導入されるにつれて、時間の経過とともにデータ量が増えていることに注目してください。

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

SQL Console で結果を可視化するチャートを作成できます：

<Image img={no_events_per_day} size="md" alt="1 日あたりのイベント数" />

6. このクエリは、過度に暑くて湿度の高い日の数をカウントします：

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

結果を可視化すると、次のようになります。


<Image img={sensors_02} size="md" alt="暑くて蒸し暑い日"/>