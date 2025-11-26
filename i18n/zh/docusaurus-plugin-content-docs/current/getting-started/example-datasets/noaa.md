---
description: '过去 120 年的 25 亿行气候数据'
sidebar_label: 'NOAA 全球历史气候网络'
slug: /getting-started/example-datasets/noaa
title: 'NOAA 全球历史气候网络'
doc_type: 'guide'
keywords: ['example dataset', 'noaa', 'weather data', 'sample data', 'climate']
---

该数据集包含过去 120 年的气象观测数据。每一行代表某一时刻、某一观测站的一次观测。

更准确地说，根据[该数据的来源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

> GHCN-Daily 是一个包含全球陆地区域每日观测记录的数据集。它包含来自全球各地陆地观测站的测站观测数据，其中大约三分之二仅为降水观测（Menne 等，2012）。GHCN-Daily 是由多个来源的气候记录汇总而成，并统一经过一套质量保证审核流程（Durre 等，2010）。该数据档案包含以下气象要素：

    - 日最高气温
    - 日最低气温
    - 观测时刻的气温
    - 降水量（例如降雨量、融雪量）
    - 降雪量
    - 积雪深度
    - 其他在有数据时提供的要素

下文各节将简要概述如何将该数据集导入 ClickHouse 的步骤。如果你对每个步骤的详细内容感兴趣，建议查阅我们的博文《[探索海量真实世界数据集：ClickHouse 中百年以上的气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)》。



## 下载数据

* 适用于 ClickHouse 的[预先准备好的数据版本](#pre-prepared-data)，已完成清洗、重构和丰富。该数据覆盖 1900 年至 2022 年。
* [下载原始数据](#original-data)并转换为 ClickHouse 所需的格式。希望添加自定义列的用户可以考虑采用这种方式。

### 预处理数据

更具体地说，已经删除了在 NOAA 的质量保证检查中未出现任何错误的行。数据也从“每行一个测量值”重构为“每个站点 ID 和日期一行”，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

这使查询更简单，并确保生成的表更不稀疏。最后，数据还补充了经纬度信息。

这些数据可在以下 S3 位置获取。可以将数据下载到本地文件系统（然后使用 ClickHouse 客户端插入），或者直接插入到 ClickHouse 中（参见 [从 S3 插入数据](#inserting-from-s3)）。

下载：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 原始数据

以下内容详细说明了为将原始数据加载到 ClickHouse 做准备而进行下载和转换的步骤。

#### 下载

要下载原始数据：

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### 数据采样


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

对[格式文档](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)进行总结：

按顺序整理格式说明及各列如下：


* 一个 11 个字符的测站标识代码，本身编码了一些有用的信息
* YEAR/MONTH/DAY = 8 个字符的日期，格式为 YYYYMMDD（例如 19860529 = 1986 年 5 月 29 日）
* ELEMENT = 4 个字符的要素类型指示符，即测量类型。虽然可用的测量类型很多，这里我们选择以下几种：
  * PRCP - 降水量（0.1 毫米）
  * SNOW - 降雪量（毫米）
  * SNWD - 积雪深度（毫米）
  * TMAX - 最高气温（0.1 摄氏度）
  * TAVG - 平均气温（0.1 摄氏度）
  * TMIN - 最低气温（0.1 摄氏度）
  * PSUN - 当日可能日照时长的百分比（百分比）
  * AWND - 日平均风速（0.1 米/秒）
  * WSFG - 阵风峰值风速（0.1 米/秒）
  * WT** = 天气类型，其中 ** 定义具体的天气类型。完整的天气类型列表见此处。
  * DATA VALUE = ELEMENT 的 5 个字符数据值，即该测量的具体数值。
  * M-FLAG = 1 个字符的测量标记。共有 10 种可能取值，其中部分取值表示数据准确性存疑。我们接受此字段设置为 &quot;P&quot;（标识为缺失但视为零）的数据，因为这仅与 PRCP、SNOW 和 SNWD 测量相关。
* Q-FLAG 是测量质量标记，共有 14 种可能取值。我们只关注取值为空的数据，即未在任何质量检查中失败的数据。
* S-FLAG 是观测值的来源标记。对我们的分析没有用处，予以忽略。
* OBS-TIME = 4 个字符的观测时间，采用小时-分钟格式（例如 0700 = 上午 7:00）。在较早的数据中通常不存在。基于我们的用途，我们忽略该字段。

每行一个测量值会在 ClickHouse 中生成一个稀疏的表结构。我们应将其转换为按时间和测站划分的结构，即每个测站每个时间点一行、各测量值作为列。首先，我们将数据集限制为不存在问题的行，即 `qFlag` 等于空字符串的记录。

#### 清洗数据

使用 [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) 我们可以筛选出既表示我们感兴趣的测量值又满足质量要求的行：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

对于超过 26 亿行的数据，这个查询并不算快，因为它需要解析所有文件。在我们的 8 核机器上，这大约需要 160 秒。

### 透视数据

虽然“每行一个测量值”的结构也可以在 ClickHouse 中使用，但会不必要地让后续查询变得复杂。理想情况下，我们需要做到每个站点 ID 和日期对应一行记录，其中每种测量类型及其对应的数值都是一列，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

使用 clickhouse-local 和一个简单的 `GROUP BY`，我们可以将数据重新聚合为这种结构。为控制内存开销，我们一次只处理一个文件。


```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(日期) as 日期,
       anyIf(value, measurement = 'TAVG') as 平均气温,
       anyIf(value, measurement = 'TMAX') as 最高气温,
       anyIf(value, measurement = 'TMIN') as 最低气温,
       anyIf(value, measurement = 'PRCP') as 降水量,
       anyIf(value, measurement = 'SNOW') as 降雪量,
       anyIf(value, measurement = 'SNWD') as 积雪深度,
       anyIf(value, measurement = 'PSUN') as 日照百分比,
       anyIf(value, measurement = 'AWND') as 平均风速,
       anyIf(value, measurement = 'WSFG') as 最大风速,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as 天气类型
FROM file('$i.csv.gz', CSV, 'station_id String, 日期 String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, 日期
ORDER BY station_id, 日期 FORMAT CSV" >> "noaa.csv";
done
```

该查询会生成一个 50GB 的单一文件 `noaa.csv`。

### 丰富数据

数据除了测站 ID（其中包含前缀国家代码）外，没有任何位置信息。理想情况下，每个测站都应该关联有纬度和经度。为此，NOAA 方便地将每个测站的详细信息提供在一个单独的文件 [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file) 中。该文件包含[多列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)，其中有五列对后续分析有用：id、latitude、longitude、elevation 和 name。

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

此查询运行需要几分钟，并会生成一个 6.4 GB 的文件 `noaa_enriched.parquet`。


## 创建表

在 ClickHouse 中使用 ClickHouse 客户端创建一个 MergeTree 表。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均气温（以 0.1 摄氏度为单位）',
   `tempMax` Int32 COMMENT '最高气温（以 0.1 摄氏度为单位）',
   `tempMin` Int32 COMMENT '最低气温（以 0.1 摄氏度为单位）',
   `precipitation` UInt32 COMMENT '降水量（以 0.1 毫米为单位）',
   `snowfall` UInt32 COMMENT '降雪量（毫米）',
   `snowDepth` UInt32 COMMENT '积雪深度（毫米）',
   `percentDailySun` UInt8 COMMENT '当日相对可能日照时数的百分比（百分比）',
   `averageWindSpeed` UInt32 COMMENT '日平均风速（以 0.1 米/秒为单位）',
   `maxWindSpeed` UInt32 COMMENT '最大阵风风速（以 0.1 米/秒为单位）',
   `weatherType` Enum8('正常' = 0, '雾' = 1, '浓雾' = 2, '雷暴' = 3, '小冰雹' = 4, '冰雹' = 5, '冰层' = 6, '尘/灰' = 7, '烟雾/薄雾' = 8, '吹雪/飘雪' = 9, '龙卷风' = 10, '大风' = 11, '水花飞溅' = 12, '薄雾' = 13, '毛毛雨' = 14, '冻毛毛雨' = 15, '雨' = 16, '冻雨' = 17, '雪' = 18, '未知降水' = 19, '地面雾' = 21, '冻雾' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## 向 ClickHouse 插入数据

### 从本地文件插入

可以在 ClickHouse 客户端中按如下方式从本地文件插入数据：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

其中 `<path>` 表示磁盘上本地文件的完整路径。

有关如何提高加载速度，请参见[此处](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)。

### 从 S3 插入数据

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

若要了解如何加快这一过程，请参阅我们的博文：[调优大规模数据加载](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。


## 示例查询

### 历史最高气温

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

5 行结果集。耗时:0.514 秒。已处理 10.6 亿行,4.27 GB(20.6 亿行/秒,8.29 GB/秒)。
```

与截至 2023 年在 [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) 的[官方记录](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)高度一致，令人放心。

### 最佳滑雪度假村

使用一份美国的[滑雪度假村列表](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)及其各自的位置，我们将其与过去 5 年中任一月份降雪量最高的前 1000 个气象站进行关联。对该关联结果按 [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) 排序，并将结果限制为距离小于 20 km 的记录，我们为每个度假村选取排名最靠前的结果，并按总降雪量排序。另外，我们仅保留海拔高于 1800 m 的度假村，将其作为良好滑雪条件的一个粗略指标。


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

返回 5 行。用时:0.750 秒。已处理 6.891 亿行,3.20 GB(918.2 百万行/秒,4.26 GB/秒)。
内存峰值:67.66 MiB。
```


## 致谢 {#credits}

我们谨此感谢 Global Historical Climatology Network 在本数据的整理、清洗和分发方面所做的工作，对此深表谢意。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [indicate subset used following decimal, e.g. Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
