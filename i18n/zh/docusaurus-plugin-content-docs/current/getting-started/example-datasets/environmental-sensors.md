---
description: '来自 Sensor.Community 的超过 200 亿条数据记录，这是一个由社区贡献者驱动的全球传感器网络，致力于创建开放环境数据。'
sidebar_label: '环境传感器数据'
slug: /getting-started/example-datasets/environmental-sensors
title: '环境传感器数据'
doc_type: 'guide'
keywords: ['环境传感器', 'Sensor.Community', '空气质量数据', '环境数据', '快速入门']
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/) 是一个由贡献者驱动的全球传感器网络，用于创建开放环境数据。数据由分布在全球各地的传感器采集。任何人都可以购买一个传感器，并将其放置在任意位置。用于下载数据的 API 位于 [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs) 上，数据在 [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/) 许可下免费提供。

:::important
该数据集包含超过 200 亿条记录，因此除非你的资源能够处理这样的数据量，否则请谨慎直接复制粘贴下面的命令。下面的命令是在 [ClickHouse Cloud](https://clickhouse.cloud) 的一个 **生产** 实例上执行的。
:::

1. 数据存放在 S3 中，因此我们可以使用 `s3` 表函数从文件创建一张表。我们也可以直接在其上查询这些数据。在尝试将数据插入 ClickHouse 之前，先看几行数据：

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

数据存储在 CSV 文件中，但使用分号作为分隔符。行数据如下所示：


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

2. 我们将在 ClickHouse 中使用以下 `MergeTree` 表来存储数据：


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

3. ClickHouse Cloud 服务中有一个名为 `default` 的集群。我们将使用 `s3Cluster` 表函数，它会在集群中的各个节点上并行读取 S3 文件。（如果你没有集群，只需使用 `s3` 函数并去掉集群名称。）

此查询会运行一段时间——未压缩的数据量约为 1.67 TB：

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

这是返回结果——显示了行数和处理速度。其写入速度超过每秒 600 万行！

```response
返回 0 行。耗时：3419.330 秒。已处理 206.9 亿行，1.67 TB（605 万行/秒，488.52 MB/秒）
```

4. 让我们看看 `sensors` 表需要多少磁盘存储空间：

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

1.67T 被压缩到仅 310 GiB，共计 206.9 亿行：

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. 既然数据已经导入 ClickHouse，让我们开始分析。请注意，随着部署的传感器数量不断增加，数据量也会随时间增长：

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

我们可以在 SQL Console 中创建图表来可视化结果：

<Image img={no_events_per_day} size="md" alt="每天的事件数量" />

6. 此查询用于统计过于炎热且潮湿的天数：

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

下面是结果的可视化：


<Image img={sensors_02} size="md" alt="炎热潮湿的天气"/>