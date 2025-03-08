---
slug: /tutorial
sidebar_label: 高级教程
sidebar_position: 0.5
keywords: ['clickhouse', '安装', '教程', '字典', '字典表']
---
import SQLConsoleDetail from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';


# 高级教程

## 本教程的期望内容是什么？ {#what-to-expect-from-this-tutorial}

在本教程中，您将创建一个表并插入一个大型数据集（包含两百万行的 [纽约出租车数据](/getting-started/example-datasets/nyc-taxi.md)）。然后，您将对数据集执行查询，包括如何创建字典并使用它执行 JOIN 的示例。

:::note
本教程假设您可以访问正在运行的 ClickHouse 服务。如果没有，请查看 [快速入门](./quick-start.mdx)。
:::

## 1. 创建新表 {#1-create-a-new-table}

纽约市出租车数据包含数百万次出租车行程的详细信息，列包括接送时间和地点、费用、小费金额、过路费、付款类型等。让我们创建一个表来存储这些数据...

1. 连接到 SQL 控制台

  <SQLConsoleDetail />

  如果您使用的是自管理的 ClickHouse，您可以通过 https://_hostname_:8443/play 连接到 SQL 控制台（请向您的 ClickHouse 管理员确认详细信息）。

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

## 2. 插入数据集 {#2-insert-the-dataset}

现在您已经创建了一个表，让我们添加纽约出租车数据。它存储在 S3 的 CSV 文件中，您可以从那里加载数据。

1. 以下命令从 S3 中的两个不同文件 `trips_1.tsv.gz` 和 `trips_2.tsv.gz` 向您的 `trips` 表插入约 2,000,000 行：
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

2. 等待 `INSERT` 完成 - 下载 150 MB 的数据可能需要一些时间。

    :::note
    `s3` 函数聪明地知道如何解压数据，`TabSeparatedWithNames` 格式告诉 ClickHouse 数据是以制表符分隔，并且跳过每个文件的标题行。
    :::

3. 插入完成后，验证是否成功：
    ```sql
    SELECT count() FROM trips
    ```

    您应该看到大约 2M 行（确切地说是 1,999,657 行）。

    :::note
    请注意，ClickHouse 是多么迅速以及处理了多么少的行以确定计数？您可以在 0.001 秒内获得计数，仅处理了 6 行。
    :::

4. 如果您运行一个需要遍历每一行的查询，您会注意到需要处理的行数显著增加，但运行时间仍然非常快：
    ```sql
    SELECT DISTINCT(pickup_ntaname) FROM trips
    ```

    这个查询需要处理 2M 行并返回 190 个值，但请注意，它在大约 1 秒内完成。`pickup_ntaname` 列表示纽约市出租车行程起始的邻里名称。

## 3. 分析数据 {#3-analyze-the-data}

让我们运行一些查询来分析这 2M 行的数据...

1. 我们将从一些简单的计算开始，比如计算平均小费金额：
    ```sql
    SELECT round(avg(tip_amount), 2) FROM trips
    ```

    响应为：
    ```response
    ┌─round(avg(tip_amount), 2)─┐
    │                      1.68 │
    └───────────────────────────┘
    ```

2. 该查询根据乘客数量计算平均费用：
    ```sql
    SELECT
        passenger_count,
        ceil(avg(total_amount),2) AS average_total_amount
    FROM trips
    GROUP BY passenger_count
    ```

    `passenger_count` 的范围为 0 到 9：
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

3. 这是一个计算每个邻里每日接送次数的查询：
    ```sql
    SELECT
        pickup_date,
        pickup_ntaname,
        SUM(1) AS number_of_trips
    FROM trips
    GROUP BY pickup_date, pickup_ntaname
    ORDER BY pickup_date ASC
    ```

    结果如下所示：
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

4. 该查询计算行程长度并按该值分组结果：
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

    结果如下所示：
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

5. 该查询显示每个邻里按小时分解的接送次数：
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

    结果如下所示：
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

7. 让我们查看前往拉瓜迪亚或 JFK 机场的行程：
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

    响应为：
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

## 4. 创建字典 {#4-create-a-dictionary}

如果您是 ClickHouse 新手，理解 ***字典*** 的工作原理非常重要。简单地说，字典可以被视为存储在内存中的键值对映射。字典的详细信息和所有选项将在教程的最后链接。

1. 让我们看一下如何创建与 ClickHouse 服务中的表关联的字典。该表以及字典将基于一个包含 265 行的 CSV 文件，每一行对应纽约市的一个邻里。这些邻里映射到纽约市的区名（纽约市有 5 个区：布朗克斯、布鲁克林、曼哈顿、皇后区和斯塔顿岛），并且该文件还将纽瓦克机场 (EWR) 算作一个区。

  这是 CSV 文件的一部分（为了清晰以表格形式显示）。该文件中的 `LocationID` 列映射到您 `trips` 表中的 `pickup_nyct2010_gid` 和 `dropoff_nyct2010_gid` 列：

    | LocationID      | Borough |  Zone      | service_zone |
    | ----------- | ----------- |   ----------- | ----------- |
    | 1      | EWR       |  纽瓦克机场   | EWR        |
    | 2    |   皇后区     |   牙买加湾   |      区域   |
    | 3   |   布朗克斯     |  Allerton/Pelham Gardens    |    区域     |
    | 4     |    曼哈顿    |    字母城市  |     黄区    |
    | 5     |  斯塔顿岛      |   阿登高地   |    区域     |

2. 文件的 URL 是 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`。运行以下 SQL，它创建一个名为 `taxi_zone_dictionary` 的字典，并从 S3 中的 CSV 文件填充字典：
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
  将 `LIFETIME` 设置为 0 意味着这个字典将永远不会与其源更新。这样做是为了不对我们的 S3 存储桶发送不必要的流量，但一般来说，您可以根据需要指定任何生命周期值。

    例如：

    ```sql
    LIFETIME(MIN 1 MAX 10)
    ```
    指定字典在 1 到 10 秒之间的随机时间后更新。（随机时间是必要的，以便在大量服务器上更新时分散字典源的负担。）
  :::

3. 验证是否成功 - 你应该获得 265 行（每个邻里一行）：
    ```sql
    SELECT * FROM taxi_zone_dictionary
    ```

4. 使用 `dictGet` 函数（[或其变体](./sql-reference/functions/ext-dict-functions.md)）从字典中检索值。您传入字典的名称、所需的值和键（在我们的示例中是 `taxi_zone_dictionary` 的 `LocationID` 列）。

    例如，以下查询返回 `LocationID` 为 132 的 `Borough`（如上面所见为 JFK 机场）：
    ```sql
    SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
    ```

    查尔斯在皇后区，注意检索值的时间基本上为 0：
    ```response
    ┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
    │ 皇后区                                          │
    └─────────────────────────────────────────────────┘

    1 rows in set. Elapsed: 0.004 sec.
    ```

5. 使用 `dictHas` 函数查看字典中是否存在键。比如，以下查询返回 1（在 ClickHouse 中为“真”）：
    ```sql
    SELECT dictHas('taxi_zone_dictionary', 132)
    ```

6. 以下查询返回 0，因为 4567 不是字典中的 `LocationID` 的值：
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

    该查询汇总了在拉瓜迪亚或 JFK 机场结束的每个区的出租车行程数量。结果如下所示，并且请注意，有相当多的行程的接送邻里是未知的：
    ```response
    ┌─total─┬─borough_name──┐
    │ 23683 │ Unknown       │
    │  7053 │ 曼哈顿     │
    │  6828 │ 布鲁克林      │
    │  4458 │ 皇后区        │
    │  2670 │ 布朗克斯         │
    │   554 │ 斯塔顿岛 │
    │    53 │ EWR           │
    └───────┴───────────────┘

    7 rows in set. Elapsed: 0.019 sec. Processed 2.00 million rows, 4.00 MB (105.70 million rows/s., 211.40 MB/s.)
    ```

## 5. 执行 JOIN {#5-perform-a-join}

让我们编写一些查询，将 `taxi_zone_dictionary` 与您的 `trips` 表进行连接。

1. 我们可以从一个简单的 JOIN 开始，它在功能上类似于上面之前的机场查询：
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

    响应类似于：
    ```response
    ┌─total─┬─Borough───────┐
    │  7053 │ 曼哈顿     │
    │  6828 │ 布鲁克林      │
    │  4458 │ 皇后区        │
    │  2670 │ 布朗克斯         │
    │   554 │ 斯塔顿岛 │
    │    53 │ EWR           │
    └───────┴───────────────┘

    6 rows in set. Elapsed: 0.034 sec. Processed 2.00 million rows, 4.00 MB (59.14 million rows/s., 118.29 MB/s.)
    ```

    :::note
    请注意，上面的 `JOIN` 查询的输出与之前使用 `dictGetOrDefault` 的查询是相同的（只是 `Unknown` 值不包含在内）。在后台，ClickHouse 实际上调用的是 `taxi_zone_dictionary` 字典的 `dictGet` 函数，但 `JOIN` 语法对 SQL 开发人员来说更为熟悉。
    :::

2. 我们在 ClickHouse 中不常使用 `SELECT *` - 您应该仅检索您实际需要的列！但要找到一个花费很长时间的查询很困难，因此此查询故意选择每一列并返回每一行（除了默认情况下内置的 10,000 行响应最大限制），并且也与字典进行每一行的右连接：
    ```sql
    SELECT *
    FROM trips
    JOIN taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000
    ```

#### 恭喜！ {#congrats}

做得好 - 您完成了本教程，并且希望您对如何使用 ClickHouse 有了更好的理解。以下是您可以做的下一步：

- 阅读 [ClickHouse 中主键的工作原理](./guides/best-practices/sparse-primary-indexes.md) - 这些知识将使您在成为 ClickHouse 专家的旅程中走得更远
- [集成外部数据源](/integrations/index.mdx)，例如文件、Kafka、PostgreSQL、数据管道或大量其他数据源
- [将您最喜欢的 UI/BI 工具](./integrations/data-visualization/index.md) 连接到 ClickHouse
- 查看 [SQL 参考](./sql-reference/index.md) 并浏览各种函数。ClickHouse 拥有一个惊人的函数集合，用于转换、处理和分析数据
- 了解有关 [字典](./sql-reference/dictionaries/index.md) 的更多信息
