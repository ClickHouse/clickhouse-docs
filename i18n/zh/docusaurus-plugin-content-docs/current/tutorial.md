---
slug: /tutorial
sidebar_label: '高级教程'
title: '高级教程'
description: '学习如何使用纽约市出租车示例数据集在 ClickHouse 中摄取和查询数据。'
sidebar_position: 0.5
keywords: ['clickhouse', '安装', '教程', '字典', '字典表', '示例', '高级', '出租车', '纽约', 'nyc']
show_related_blogs: true
doc_type: 'guide'
---

# 进阶教程 \{#advanced-tutorial\}

## 概述 \{#overview\}

了解如何使用纽约市出租车示例数据集在 ClickHouse 中摄取和查询数据。 

### 前置条件 \{#prerequisites\}

您需要访问正在运行的 ClickHouse 服务才能完成本教程。有关说明,请参阅[快速入门](/get-started/quick-start)指南。

<VerticalStepper>
  ## 创建新表

  纽约市出租车数据集包含数百万次出租车行程的详细信息,其中的列包括小费金额、过路费、支付方式等。创建一个表来存储这些数据。

  1. 连接到 SQL 控制台：
     * 对于 ClickHouse Cloud，从下拉菜单中选择一个服务，然后在左侧导航菜单中选择 **SQL Console**。
     * 对于自托管的 ClickHouse，在 `https://_hostname_:8443/play` 上连接到 SQL 控制台。请向你的 ClickHouse 管理员确认详细信息。

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

  ## 添加数据集

  现在你已经创建了一个表,请从 S3 中的 CSV 文件添加纽约市出租车数据。

  1. 以下命令会将来自 S3 中两个不同文件（`trips_1.tsv.gz` 和 `trips_2.tsv.gz`）的大约 2,000,000 行数据插入到你的 `trips` 表中：

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

  2. 等待 `INSERT` 完成。下载这 150 MB 的数据可能需要一点时间。

  3. 插入完成后，验证是否成功：

     ```sql
     SELECT count() FROM trips
     ```

     此查询应返回 1,999,657 行。

  ## 分析数据

  运行一些查询来分析数据。探索以下示例或尝试你自己的 SQL 查询。

  * 计算平均小费金额：

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

  * 按乘客数量计算平均费用：

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
        `passenger_count` 的取值范围为 0 到 9：

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

  * 计算每天每个社区的上车次数：

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

  * 计算每次行程的时长（单位：分钟），然后按行程时长对结果分组：

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

  * 按一天中的小时统计各社区的上车次数：

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

  7. 检索前往 LaGuardia 或 JFK 机场的行程记录：

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

  ## 创建字典

  字典是一种存储在内存中的键值对映射。有关详细信息，请参阅 [字典](/sql-reference/statements/create/dictionary)

  在你的 ClickHouse 服务中创建一个与表关联的字典。
  该表和字典基于一个 CSV 文件,该文件为纽约市的每个社区包含一行数据。

  这些社区会被映射为纽约市五个行政区（Bronx、Brooklyn、Manhattan、Queens 和 Staten Island）以及纽瓦克机场（EWR）的名称。

  以下是你正在使用的 CSV 文件的摘录,以表格格式显示。文件中的 `LocationID` 列映射到 `trips` 表中的 `pickup_nyct2010_gid` 和 `dropoff_nyct2010_gid` 列:

  | LocationID | 行政区  | 区域                      | service&#95;zone |
  | ---------- | ---- | ----------------------- | ---------------- |
  | 1          | EWR  | 纽瓦克机场                   | EWR              |
  | 2          | 皇后区  | Jamaica Bay             | Boro Zone        |
  | 3          | 布朗克斯 | Allerton/Pelham Gardens | Boro Zone        |
  | 4          | 曼哈顿  | Alphabet City           | Yellow Zone      |
  | 5          | 斯塔滕岛 | Arden Heights           | Boro Zone        |

  1. 运行以下 SQL 命令，用于创建一个名为 `taxi_zone_dictionary` 的字典，并从 S3 中的 CSV 文件为该字典填充数据。该文件的 URL 为 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`。

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
  将 `LIFETIME` 设置为 0 会禁用自动更新，以避免对我们的 S3 存储桶产生不必要的流量。在其他情况下，您可能会以不同方式进行配置。有关详细信息，请参阅[使用 LIFETIME 刷新字典数据](/sql-reference/statements/create/dictionary/lifetime#refreshing-dictionary-data-using-lifetime)。
  :::

  3. 验证其是否生效。下面的查询应该返回 265 行结果，每个社区对应一行：
     ```sql
     SELECT * FROM taxi_zone_dictionary
     ```

  4. 使用 `dictGet` 函数（[或其变体](./sql-reference/functions/ext-dict-functions.md)）从字典中获取值。你需要传入字典的名称、要获取的值对应的列名以及键（在我们的示例中是 `taxi_zone_dictionary` 的 `LocationID` 列）。

     例如，下面的查询将返回 `LocationID` 为 132 的 `Borough`（对应于 JFK 机场）：

     ```sql
     SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
     ```

     JFK 位于 Queens 行政区。请注意，检索该值所需的时间几乎为 0：

     ```response
     ┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
     │ Queens                                          │
     └─────────────────────────────────────────────────┘

     1 rows in set. Elapsed: 0.004 sec.
     ```

  5. 使用 `dictHas` 函数检查某个键是否存在于字典中。例如，下面的查询返回 `1`（在 ClickHouse 中表示“true”）：
     ```sql
     SELECT dictHas('taxi_zone_dictionary', 132)
     ```

  6. The following query returns 0 because 4567 不是字典中 `LocationID` 的任何值:
     ```sql
     SELECT dictHas('taxi_zone_dictionary', 4567)
     ```

  7. 使用 `dictGet` 函数在查询中获取行政区名称。例如：

     ```sql
     SELECT
         count(1) AS total,
         dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
     FROM trips
     WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
     GROUP BY borough_name
     ORDER BY total DESC
     ```

     此查询按行政区汇总了在拉瓜迪亚机场或 JFK 机场结束的出租车行程数量。结果如下所示，可以看到有相当多的行程其上车所在社区未知：

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

  ## 执行 JOIN 操作

  编写一些查询，将 `taxi_zone_dictionary` 与你的 `trips` 表关联起来。

  1. 从一个简单的 `JOIN` 开始，其效果与前面的机场查询类似：

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

     返回结果看起来与 `dictGet` 查询完全相同：

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
     请注意，上述 `JOIN` 查询的结果与之前使用 `dictGetOrDefault` 的查询相同（只是未包含 `Unknown` 值）。在底层实现上，ClickHouse 实际上为 `taxi_zone_dictionary` 字典调用了 `dictGet` 函数，但 `JOIN` 语法对 SQL 开发者来说更为熟悉。
     :::

  2. 此查询返回小费金额最高的 1000 次行程对应的行，然后对每一行与字典执行 inner join：
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
     一般在 ClickHouse 中应尽量避免频繁使用 `SELECT *`。你应该只检索实际需要的列。
     :::
</VerticalStepper>

## 后续步骤 \{#next-steps\}

通过以下文档进一步了解 ClickHouse：

- [ClickHouse 主索引（Primary Index）简介](./guides/best-practices/sparse-primary-indexes.md)：了解 ClickHouse 如何使用稀疏主索引在查询期间高效定位相关数据。 
- [集成外部数据源](/integrations/index.mdx)：查看数据源集成选项，包括文件、Kafka、PostgreSQL、数据管道等多种方式。
- [在 ClickHouse 中可视化数据](./integrations/data-visualization/index.md)：将您常用的 UI/BI 工具连接到 ClickHouse。
- [SQL 参考](./sql-reference/index.md)：浏览 ClickHouse 中用于转换、处理和分析数据的 SQL 函数。