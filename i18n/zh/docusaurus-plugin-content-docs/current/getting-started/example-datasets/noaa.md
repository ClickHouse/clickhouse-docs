---
description: '过去 120 年的 25 亿行气候数据'
sidebar_label: 'NOAA 全球历史气候网络'
slug: /getting-started/example-datasets/noaa
title: 'NOAA 全球历史气候网络'
doc_type: 'guide'
keywords: ['example dataset', 'noaa', 'weather data', 'sample data', 'climate']
---

此数据集包含过去 120 年的天气观测数据。每一行代表某一时间点和观测站的一条测量记录。

更准确地说，根据[该数据的来源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

> GHCN-Daily 是一个包含全球陆地区域逐日观测记录的数据集。它包含来自全球各地陆地观测站的站点观测数据，其中约三分之二仅为降水观测（Menne 等, 2012）。GHCN-Daily 由众多来源的气候记录汇总合并而成，并统一通过了同一套质量保证审查（Durre 等, 2010）。该档案包括以下气象要素：

    - 每日最高气温
    - 每日最低气温
    - 观测时的气温
    - 降水量（例如雨量、融雪量）
    - 降雪量
    - 积雪深度
    - 其他在可用情况下的要素

以下各节简要概述了将此数据集导入 ClickHouse 所涉及的步骤。如果你希望更详细地了解每个步骤，建议阅读我们的博文《[探索海量真实世界数据集：在 ClickHouse 中分析 100+ 年气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)》。



## 下载数据 {#downloading-the-data}

- 为 ClickHouse 准备的[预处理版本](#pre-prepared-data)数据,已经过清洗、重构和丰富。该数据涵盖 1900 年至 2022 年。
- [下载原始数据](#original-data)并转换为 ClickHouse 所需的格式。希望添加自定义列的用户可以选择这种方法。

### 预处理数据 {#pre-prepared-data}

具体而言,已删除未通过 NOAA 质量保证检查的行。数据结构也已从每行一个测量值重构为每个站点 ID 和日期一行,即:

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

这样查询更简单,并确保生成的表更加紧凑。最后,数据还增加了经纬度信息。

该数据可在以下 S3 位置获取。您可以将数据下载到本地文件系统(并使用 ClickHouse 客户端插入),或直接插入到 ClickHouse(参见[从 S3 插入](#inserting-from-s3))。

下载方式:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 原始数据 {#original-data}

以下详细说明下载和转换原始数据以准备加载到 ClickHouse 的步骤。

#### 下载 {#download}

下载原始数据:

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### 数据采样 {#sampling-the-data}


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

总结一下[格式文档](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

按顺序对格式文档和各列进行总结如下：


- 11 字符的站点标识代码。该代码本身编码了一些有用的信息
- YEAR/MONTH/DAY = 8 字符的日期,采用 YYYYMMDD 格式(例如 19860529 = 1986 年 5 月 29 日)
- ELEMENT = 4 字符的元素类型指示符。实际上就是测量类型。虽然有许多可用的测量类型,但我们选择以下几种:
  - PRCP - 降水量(0.1 毫米)
  - SNOW - 降雪量(毫米)
  - SNWD - 积雪深度(毫米)
  - TMAX - 最高温度(0.1 摄氏度)
  - TAVG - 平均温度(0.1 摄氏度)
  - TMIN - 最低温度(0.1 摄氏度)
  - PSUN - 每日可能日照百分比(百分比)
  - AWND - 日平均风速(0.1 米/秒)
  - WSFG - 峰值阵风风速(0.1 米/秒)
  - WT** = 天气类型,其中 ** 定义具体的天气类型。完整的天气类型列表见此处。
  - DATA VALUE = ELEMENT 的 5 字符数据值,即测量的数值。
  - M-FLAG = 1 字符的测量标志。有 10 个可能的值。其中一些值表示数据准确性存疑。我们接受该标志设置为 "P" 的数据 - 标识为缺失并假定为零,因为这仅与 PRCP、SNOW 和 SNWD 测量相关。
- Q-FLAG 是测量质量标志,有 14 个可能的值。我们只关注空值的数据,即通过了所有质量保证检查的数据。
- S-FLAG 是观测的来源标志。对我们的分析没有用处,因此忽略。
- OBS-TIME = 4 字符的观测时间,采用小时-分钟格式(即 0700 = 上午 7:00)。通常在较旧的数据中不存在。我们在此忽略该字段。

每行一个测量值会导致 ClickHouse 中的稀疏表结构。我们应该转换为每个时间和站点一行,将测量值作为列。首先,我们将数据集限制为没有问题的行,即 `qFlag` 等于空字符串的行。

#### 清理数据 {#clean-the-data}

使用 [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local),我们可以过滤出符合我们关注的测量类型且满足质量要求的行:

```bash
clickhouse local --query "SELECT count()
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

由于有超过 26 亿行,这不是一个快速的查询,因为它涉及解析所有文件。在我们的 8 核机器上,大约需要 160 秒。

### 数据透视 {#pivot-data}

虽然每行一个测量值的结构可以在 ClickHouse 中使用,但它会不必要地使未来的查询复杂化。理想情况下,我们需要每个站点 ID 和日期一行,其中每个测量类型及其关联值都作为一列,即:

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

使用 ClickHouse local 和简单的 `GROUP BY`,我们可以将数据重新透视为这种结构。为了限制内存开销,我们每次处理一个文件。


```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(date) as date,
       anyIf(value, measurement = 'TAVG') as tempAvg,
       anyIf(value, measurement = 'TMAX') as tempMax,
       anyIf(value, measurement = 'TMIN') as tempMin,
       anyIf(value, measurement = 'PRCP') as precipitation,
       anyIf(value, measurement = 'SNOW') as snowfall,
       anyIf(value, measurement = 'SNWD') as snowDepth,
       anyIf(value, measurement = 'PSUN') as percentDailySun,
       anyIf(value, measurement = 'AWND') as averageWindSpeed,
       anyIf(value, measurement = 'WSFG') as maxWindSpeed,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as weatherType
FROM file('$i.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, date
ORDER BY station_id, date FORMAT CSV" >> "noaa.csv";
done
```

该查询生成一个 50GB 的文件 `noaa.csv`。

### 数据增强 {#enriching-the-data}

除了包含国家代码前缀的站点 ID 外,数据中没有位置信息。理想情况下,每个站点都应该关联纬度和经度。为此,NOAA 提供了一个单独的文件 [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file),其中包含每个站点的详细信息。该文件包含[多个列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file),其中五列对后续分析有用:id、latitude、longitude、elevation 和 name。

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

该查询需要几分钟运行时间,生成一个 6.4 GB 的文件 `noaa_enriched.parquet`。


## 创建表 {#create-table}

在 ClickHouse 中创建一个 MergeTree 表(从 ClickHouse 客户端)。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均温度(十分之一摄氏度)',
   `tempMax` Int32 COMMENT '最高温度(十分之一摄氏度)',
   `tempMin` Int32 COMMENT '最低温度(十分之一摄氏度)',
   `precipitation` UInt32 COMMENT '降水量(十分之一毫米)',
   `snowfall` UInt32 COMMENT '降雪量(毫米)',
   `snowDepth` UInt32 COMMENT '积雪深度(毫米)',
   `percentDailySun` UInt8 COMMENT '日照百分比(占可能日照的百分比)',
   `averageWindSpeed` UInt32 COMMENT '日平均风速(十分之一米/秒)',
   `maxWindSpeed` UInt32 COMMENT '最大阵风风速(十分之一米/秒)',
   `weatherType` Enum8('正常' = 0, '雾' = 1, '浓雾' = 2, '雷暴' = 3, '小冰雹' = 4, '冰雹' = 5, '雨凇' = 6, '尘埃/火山灰' = 7, '烟雾/霾' = 8, '吹雪/飘雪' = 9, '龙卷风' = 10, '大风' = 11, '吹浪' = 12, '薄雾' = 13, '毛毛雨' = 14, '冻毛毛雨' = 15, '雨' = 16, '冻雨' = 17, '雪' = 18, '未知降水' = 19, '地面雾' = 21, '冻雾' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## 向 ClickHouse 插入数据 {#inserting-into-clickhouse}

### 从本地文件插入 {#inserting-from-local-file}

可以通过以下方式从本地文件插入数据(从 ClickHouse 客户端执行):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

其中 `<path>` 表示本地文件在磁盘上的完整路径。

有关如何加速数据加载的方法,请参阅[此处](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)。

### 从 S3 插入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

有关如何加速数据加载的方法,请参阅我们关于[优化大规模数据加载](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)的博客文章。


## 示例查询 {#sample-queries}

### 历史最高气温 {#highest-temperature-ever}

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

5 rows in set. Elapsed: 0.514 sec. Processed 1.06 billion rows, 4.27 GB (2.06 billion rows/s., 8.29 GB/s.)
```

该结果与截至 2023 年在 [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) 的[记录数据](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)一致。

### 最佳滑雪度假村 {#best-ski-resorts}

使用美国[滑雪度假村列表](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)及其各自的位置,我们将这些数据与过去 5 年中任意月份降雪量最多的前 1000 个气象站进行关联。通过 [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) 对关联结果进行排序,并将结果限制为距离小于 20 公里的记录,我们为每个度假村选择排名最高的结果,并按总降雪量排序。请注意,我们还将度假村限制为海拔 1800 米以上的地点,作为良好滑雪条件的基本指标。


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

返回 5 行。用时:0.750 秒。已处理 6.891 亿行,3.20 GB(9.182 亿行/秒,4.26 GB/秒)。
峰值内存使用量:67.66 MiB。
```


## 致谢 {#credits}

我们谨此感谢全球历史气候学网络(Global Historical Climatology Network)在准备、清理和分发这些数据方面所做的努力。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [小数点后表示所使用的子集,例如 Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
