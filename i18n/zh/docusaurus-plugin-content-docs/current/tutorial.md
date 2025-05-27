---
'slug': '/tutorial'
'sidebar_label': '高级教程'
'title': '高级教程'
'description': '学习如何在 ClickHouse 中使用纽约市出租车示例数据集进行数据摄取和查询。'
'sidebar_position': 0.5
'keywords':
- 'clickhouse'
- 'install'
- 'tutorial'
- 'dictionary'
- 'dictionaries'
- 'example'
- 'advanced'
- 'taxi'
- 'new york'
- 'nyc'
---



# 高级教程

## 概述 {#overview}

了解如何使用纽约市出租车示例数据集在 ClickHouse 中摄取和查询数据。

### 先决条件 {#prerequisites}

您需要访问运行中的 ClickHouse 服务以完成本教程。有关说明，请参见 [快速入门](./quick-start.mdx) 指南。

<VerticalStepper>

## 创建新表 {#create-a-new-table}

纽约市出租车数据集包含有关数百万次出租车的详细信息，列包括小费金额、过路费、支付类型等。创建一个表以存储这些数据。

1. 连接到 SQL 控制台：
- 对于 ClickHouse Cloud，从下拉菜单中选择一个服务，然后在左侧导航菜单中选择 **SQL 控制台**。
- 对于自管理的 ClickHouse，连接到 `https://_hostname_:8443/play` 上的 SQL 控制台。请与您的 ClickHouse 管理员确认详细信息。


2. 在 `default` 数据库中创建以下 `trips` 表：
```sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime;
```

## 添加数据集 {#add-the-dataset}

现在您已经创建了一个表，从 S3 中的 CSV 文件中添加纽约市出租车数据。

1. 以下命令从 S3 中的两个不同文件 `trips_1.tsv.gz` 和 `trips_2.tsv.gz` 将约 2,000,000 行插入到您的 `trips` 表中：

```sql
INSERT INTO trips
SELECT * FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
    'TabSeparatedWithNames', "
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
") SETTINGS input_format_try_infer_datetimes = 0
```

2. 等待 `INSERT` 完成。150 MB 的数据下载可能需要一些时间。


3. 插入完成后，验证是否成功：
```sql
SELECT count() FROM trips
```

    此查询应返回 1,999,657 行。

## 分析数据 {#analyze-the-data}

运行一些查询以分析数据。探索以下示例或尝试您自己的 SQL 查询。

- 计算平均小费金额：
```sql
SELECT round(avg(tip_amount), 2) FROM trips
```
    <details>
    <summary>预期输出</summary>
    <p>
    
```response
┌─round(avg(tip_amount), 2)─┐
│                      1.68 │
└───────────────────────────┘
```

    </p>
    </details>

- 计算基于乘客数量的平均费用：
```sql
SELECT
    passenger_count,
    ceil(avg(total_amount),2) AS average_total_amount
FROM trips
GROUP BY passenger_count
```
    
    <details>
    <summary>预期输出</summary>
    <p>

    `passenger_count` 范围从 0 到 9：

```response
┌─passenger_count─┬─average_total_amount─┐
│               0 │                22.69 │
│               1 │                15.97 │
│               2 │                17.15 │
│               3 │                16.76 │
│               4 │                17.33 │
│               5 │                16.35 │
│               6 │                16.04 │
│               7 │                 59.8 │
│               8 │                36.41 │
│               9 │                 9.81 │
└─────────────────┴──────────────────────┘
```

    </p>
    </details>

- 计算每个社区的每日接送数量：
```sql
SELECT
    pickup_date,
    pickup_ntaname,
    SUM(1) AS number_of_trips
FROM trips
GROUP BY pickup_date, pickup_ntaname
ORDER BY pickup_date ASC
```

    <details>
    <summary>预期输出</summary>
    <p>

```response
┌─pickup_date─┬─pickup_ntaname───────────────────────────────────────────┬─number_of_trips─┐
│  2015-07-01 │ Brooklyn Heights-Cobble Hill                             │              13 │
│  2015-07-01 │ Old Astoria                                              │               5 │
│  2015-07-01 │ Flushing                                                 │               1 │
│  2015-07-01 │ Yorkville                                                │             378 │
│  2015-07-01 │ Gramercy                                                 │             344 │
│  2015-07-01 │ Fordham South                                            │               2 │
│  2015-07-01 │ SoHo-TriBeCa-Civic Center-Little Italy                   │             621 │
│  2015-07-01 │ Park Slope-Gowanus                                       │              29 │
│  2015-07-01 │ Bushwick South                                           │               5 │
```

    </p>
    </details>

- 计算每次旅程的长度（以分钟为单位），然后按旅程长度对结果进行分组：
```sql
SELECT
    avg(tip_amount) AS avg_tip,
    avg(fare_amount) AS avg_fare,
    avg(passenger_count) AS avg_passenger,
    count() AS count,
    truncate(date_diff('second', pickup_datetime, dropoff_datetime)/60) as trip_minutes
FROM trips
WHERE trip_minutes > 0
GROUP BY trip_minutes
ORDER BY trip_minutes DESC
```
    <details>
    <summary>预期输出</summary>
    <p>
    
```response
┌──────────────avg_tip─┬───────────avg_fare─┬──────avg_passenger─┬──count─┬─trip_minutes─┐
│   1.9600000381469727 │                  8 │                  1 │      1 │        27511 │
│                    0 │                 12 │                  2 │      1 │        27500 │
│    0.542166673981895 │ 19.716666666666665 │ 1.9166666666666667 │     60 │         1439 │
│    0.902499997522682 │ 11.270625001192093 │            1.95625 │    160 │         1438 │
│   0.9715789457909146 │ 13.646616541353383 │ 2.0526315789473686 │    133 │         1437 │
│   0.9682692398245518 │ 14.134615384615385 │  2.076923076923077 │    104 │         1436 │
│   1.1022105210705808 │ 13.778947368421052 │  2.042105263157895 │     95 │         1435 │
```
    </p>
    </details>

- 显示每个社区在一天中的每小时接送的数量：
```sql
SELECT
    pickup_ntaname,
    toHour(pickup_datetime) as pickup_hour,
    SUM(1) AS pickups
FROM trips
WHERE pickup_ntaname != ''
GROUP BY pickup_ntaname, pickup_hour
ORDER BY pickup_ntaname, pickup_hour
```
    <details>
    <summary>预期输出</summary>
    <p>

```response
┌─pickup_ntaname───────────────────────────────────────────┬─pickup_hour─┬─pickups─┐
│ Airport                                                  │           0 │    3509 │
│ Airport                                                  │           1 │    1184 │
│ Airport                                                  │           2 │     401 │
│ Airport                                                  │           3 │     152 │
│ Airport                                                  │           4 │     213 │
│ Airport                                                  │           5 │     955 │
│ Airport                                                  │           6 │    2161 │
│ Airport                                                  │           7 │    3013 │
│ Airport                                                  │           8 │    3601 │
│ Airport                                                  │           9 │    3792 │
│ Airport                                                  │          10 │    4546 │
│ Airport                                                  │          11 │    4659 │
│ Airport                                                  │          12 │    4621 │
│ Airport                                                  │          13 │    5348 │
│ Airport                                                  │          14 │    5889 │
│ Airport                                                  │          15 │    6505 │
│ Airport                                                  │          16 │    6119 │
│ Airport                                                  │          17 │    6341 │
│ Airport                                                  │          18 │    6173 │
│ Airport                                                  │          19 │    6329 │
│ Airport                                                  │          20 │    6271 │
│ Airport                                                  │          21 │    6649 │
│ Airport                                                  │          22 │    6356 │
│ Airport                                                  │          23 │    6016 │
│ Allerton-Pelham Gardens                                  │           4 │       1 │
│ Allerton-Pelham Gardens                                  │           6 │       1 │
│ Allerton-Pelham Gardens                                  │           7 │       1 │
│ Allerton-Pelham Gardens                                  │           9 │       5 │
│ Allerton-Pelham Gardens                                  │          10 │       3 │
│ Allerton-Pelham Gardens                                  │          15 │       1 │
│ Allerton-Pelham Gardens                                  │          20 │       2 │
│ Allerton-Pelham Gardens                                  │          23 │       1 │
│ Annadale-Huguenot-Prince's Bay-Eltingville               │          23 │       1 │
│ Arden Heights                                            │          11 │       1 │
```

    </p>
    </details>

    
7. 检索到拉瓜迪亚或JFK机场的乘车记录：
```sql
SELECT
    pickup_datetime,
    dropoff_datetime,
    total_amount,
    pickup_nyct2010_gid,
    dropoff_nyct2010_gid,
    CASE
        WHEN dropoff_nyct2010_gid = 138 THEN 'LGA'
        WHEN dropoff_nyct2010_gid = 132 THEN 'JFK'
    END AS airport_code,
    EXTRACT(YEAR FROM pickup_datetime) AS year,
    EXTRACT(DAY FROM pickup_datetime) AS day,
    EXTRACT(HOUR FROM pickup_datetime) AS hour
FROM trips
WHERE dropoff_nyct2010_gid IN (132, 138)
ORDER BY pickup_datetime
```

    <details>
    <summary>预期输出</summary>
    <p>

```response
┌─────pickup_datetime─┬────dropoff_datetime─┬─total_amount─┬─pickup_nyct2010_gid─┬─dropoff_nyct2010_gid─┬─airport_code─┬─year─┬─day─┬─hour─┐
│ 2015-07-01 00:04:14 │ 2015-07-01 00:15:29 │         13.3 │                 -34 │                  132 │ JFK          │ 2015 │   1 │    0 │
│ 2015-07-01 00:09:42 │ 2015-07-01 00:12:55 │          6.8 │                  50 │                  138 │ LGA          │ 2015 │   1 │    0 │
│ 2015-07-01 00:23:04 │ 2015-07-01 00:24:39 │          4.8 │                -125 │                  132 │ JFK          │ 2015 │   1 │    0 │
│ 2015-07-01 00:27:51 │ 2015-07-01 00:39:02 │        14.72 │                -101 │                  138 │ LGA          │ 2015 │   1 │    0 │
│ 2015-07-01 00:32:03 │ 2015-07-01 00:55:39 │        39.34 │                  48 │                  138 │ LGA          │ 2015 │   1 │    0 │
│ 2015-07-01 00:34:12 │ 2015-07-01 00:40:48 │         9.95 │                 -93 │                  132 │ JFK          │ 2015 │   1 │    0 │
│ 2015-07-01 00:38:26 │ 2015-07-01 00:49:00 │         13.3 │                 -11 │                  138 │ LGA          │ 2015 │   1 │    0 │
│ 2015-07-01 00:41:48 │ 2015-07-01 00:44:45 │          6.3 │                 -94 │                  132 │ JFK          │ 2015 │   1 │    0 │
│ 2015-07-01 01:06:18 │ 2015-07-01 01:14:43 │        11.76 │                  37 │                  132 │ JFK          │ 2015 │   1 │    1 │
```

    </p>
    </details>

## 创建字典 {#create-a-dictionary}

字典是存储在内存中的键值对映射。有关详细信息，请参见 [字典](/sql-reference/dictionaries/index.md)。

创建与 ClickHouse 服务中的表相关联的字典。
该表和字典基于包含纽约市每个社区一行的 CSV 文件。

这些社区映射到纽约市五个区（布朗克斯，布鲁克林，曼哈顿，皇后区和斯塔滕岛）的名称，以及纽瓦克机场（EWR）。

以下是您在以表格格式使用的 CSV 文件的摘录。文件中的 `LocationID` 列映射到 `trips` 表中的 `pickup_nyct2010_gid` 和 `dropoff_nyct2010_gid` 列：

  | LocationID      | Borough |  Zone      | service_zone |
  | ----------- | ----------- |   ----------- | ----------- |
  | 1      | EWR       |  纽瓦克机场   | EWR        |
  | 2    |   皇后区     |   牙买加湾   |      区域    |
  | 3   |   布朗克斯     |  阿列顿/佩尔汉姆花园    |    区域     |
  | 4     |    曼哈顿    |    字母城  |     黄区    |
  | 5     |  斯塔滕岛      |   阿登高地   |    区域     |


1. 运行以下 SQL 命令，该命令创建一个名为 `taxi_zone_dictionary` 的字典，并从 S3 的 CSV 文件中填充字典。文件的 URL 是 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`。
```sql
CREATE DICTIONARY taxi_zone_dictionary
(
  `LocationID` UInt16 DEFAULT 0,
  `Borough` String,
  `Zone` String,
  `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED_ARRAY())
```

  :::note
  将 `LIFETIME` 设置为 0 禁用自动更新，以避免不必要的流量到我们的 S3 存储桶。在其他情况下，您可以根据需要进行不同配置。有关详细信息，请参见 [使用 LIFETIME 刷新字典数据](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)。
  :::

3. 验证它是否有效。以下查询应返回 265 行，也就是说每个社区一行：
```sql
SELECT * FROM taxi_zone_dictionary
```

4. 使用 `dictGet` 函数（[或其变体](./sql-reference/functions/ext-dict-functions.md)）从字典中检索一个值。您需要传入字典名称、所需值和键（在本示例中是 `taxi_zone_dictionary` 的 `LocationID` 列）。

    例如，以下查询返回 `LocationID` 为 132 的 `Borough`，这对应于 JFK 机场：
```sql
SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
```

    JFK 位于皇后区。请注意，检索值的时间几乎为 0：
```response
┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
│ Queens                                          │
└─────────────────────────────────────────────────┘

1 rows in set. Elapsed: 0.004 sec.
```

5. 使用 `dictHas` 函数查看字典中是否存在某个键。例如，以下查询返回 `1`（在 ClickHouse 中表示“true”）：
```sql
SELECT dictHas('taxi_zone_dictionary', 132)
```

6. 以下查询返回 0，因为 4567 不是字典中 `LocationID` 的值：
```sql
SELECT dictHas('taxi_zone_dictionary', 4567)
```

7. 使用 `dictGet` 函数在查询中检索一个区的名称。例如：
```sql
SELECT
    count(1) AS total,
    dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
FROM trips
WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
GROUP BY borough_name
ORDER BY total DESC
```

    此查询对在拉瓜迪亚或 JFK 机场结束的每个区的出租车乘车数量进行汇总。结果看起来如下，并请注意有许多乘车记录的接送社区是未知的：
```response
┌─total─┬─borough_name──┐
│ 23683 │ Unknown       │
│  7053 │ Manhattan     │
│  6828 │ Brooklyn      │
│  4458 │ Queens        │
│  2670 │ Bronx         │
│   554 │ Staten Island │
│    53 │ EWR           │
└───────┴───────────────┘

7 rows in set. Elapsed: 0.019 sec. Processed 2.00 million rows, 4.00 MB (105.70 million rows/s., 211.40 MB/s.)
```


## 执行连接 {#perform-a-join}

编写一些查询，将 `taxi_zone_dictionary` 与您的 `trips` 表连接。

1. 从一个简单的 `JOIN` 开始，其功能类似于上述机场查询：
```sql
SELECT
    count(1) AS total,
    Borough
FROM trips
JOIN taxi_zone_dictionary ON toUInt64(trips.pickup_nyct2010_gid) = taxi_zone_dictionary.LocationID
WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
GROUP BY Borough
ORDER BY total DESC
```

    响应看起来与使用 `dictGet` 的查询相同：
```response
┌─total─┬─Borough───────┐
│  7053 │ Manhattan     │
│  6828 │ Brooklyn      │
│  4458 │ Queens        │
│  2670 │ Bronx         │
│   554 │ Staten Island │
│    53 │ EWR           │
└───────┴───────────────┘

6 rows in set. Elapsed: 0.034 sec. Processed 2.00 million rows, 4.00 MB (59.14 million rows/s., 118.29 MB/s.)
```

    :::note
    请注意，上述 `JOIN` 查询的输出与使用 `dictGetOrDefault` 的查询相同（不同之处在于没有包含 `Unknown` 的值）。在后台，ClickHouse 实际上是在为 `taxi_zone_dictionary` 字典调用 `dictGet` 函数，但 `JOIN` 语法对 SQL 开发者来说更为熟悉。
    :::

2. 此查询返回 1000 次小费金额最高的乘车记录的行，然后对每行与字典执行内部连接：
```sql
SELECT *
FROM trips
JOIN taxi_zone_dictionary
    ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
WHERE tip_amount > 0
ORDER BY tip_amount DESC
LIMIT 1000
```
        :::note
        通常，我们避免在 ClickHouse 中频繁使用 `SELECT *`。您应仅检索实际需要的列。然而，出于示例目的，此查询较慢。
        :::

</VerticalStepper>

## 后续步骤 {#next-steps}

通过以下文档进一步了解 ClickHouse：

- [ClickHouse 中的主索引介绍](./guides/best-practices/sparse-primary-indexes.md)：了解 ClickHouse 如何使用稀疏主索引来有效定位查询中的相关数据。
- [集成外部数据源](/integrations/index.mdx)：回顾数据源集成选项，包括文件、Kafka、PostgreSQL、数据管道等。
- [在 ClickHouse 中可视化数据](./integrations/data-visualization/index.md)：将您喜欢的 UI/BI 工具连接到 ClickHouse。
- [SQL 参考](./sql-reference/index.md)：浏览 ClickHouse 中可用于转换、处理和分析数据的 SQL 函数。
