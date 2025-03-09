---
description: '过去120年中2.5亿行气候数据'
slug: /getting-started/example-datasets/noaa
sidebar_label: NOAA全球历史气候网络
sidebar_position: 1
title: 'NOAA全球历史气候网络'
---

此数据集包含过去120年的天气测量。每一行都是某一时刻和某个站点的测量。

更准确地说，根据[这些数据的来源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily是一个包含全球陆地区域每日观测数据的数据集。它包含来自全球地面站点的基于站点的测量，其中约三分之二的数据仅用于降水测量（Menne et al., 2012）。GHCN-Daily是来自众多来源的气候记录的综合体，这些记录经过合并并接受了一套常见的质量保证审查（Durre et al., 2010）。档案包括以下气象要素：

    - 每日最高温度
    - 每日最低温度
    - 观测时的温度
    - 降水量（即雨水、融化雪）
    - 降雪量
    - 雪深
    - 其他可用要素

下面的部分简要概述了将此数据集导入ClickHouse所涉及的步骤。如果您有兴趣详细阅读每个步骤，建议查看我们博客的文章 ["探索大规模的现实世界数据集：ClickHouse中的100年气象记录"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)。

## 下载数据 {#downloading-the-data}

- 适用于ClickHouse的[预准备版本](#pre-prepared-data)，该数据经过清洗、重构和丰富。该数据覆盖1900年至2022年。
- [下载原始数据](#original-data)并转换为ClickHouse所需的格式。希望添加自己列的用户可以探索此方法。

### 预准备数据 {#pre-prepared-data}

更具体地说，已删除未通过Noaa的任何质量保证检查的行。数据的结构也从每行一个测量重构为每个站点ID和日期一行，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

这样查询更简单，并确保结果表的稀疏程度降低。最后，数据还经过了纬度和经度的丰富。

此数据可在以下S3位置获取。您可以将数据下载到本地文件系统（并使用ClickHouse客户端插入）或直接插入到ClickHouse中（请参见[从S3插入](#inserting-from-s3)）。

要下载：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 原始数据 {#original-data}

以下详细说明下载和转换原始数据的步骤，以准备加载到ClickHouse中。

#### 下载 {#download}

要下载原始数据：

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

总结[格式文档](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

总结格式文档和列的顺序：

 - 11个字符的站点识别码。它本身编码了一些有用的信息
 - 年/月/日 = 8个字符的日期，格式为YYYYMMDD（例如19860529 = 1986年5月29日）
 - ELEMENT = 4个字符表示要素类型的指示符。实际上是测量类型。虽然可用的测量项很多，但我们选择以下内容：
    - PRCP - 降水（十分之一毫米）
    - SNOW - 降雪（毫米）
    - SNWD - 雪深（毫米）
    - TMAX - 最高温度（十分之一摄氏度）
    - TAVG - 平均温度（十分之一摄氏度）
    - TMIN - 最低温度（十分之一摄氏度）
    - PSUN - 每日可能阳光的百分比（百分比）
    - AWND - 平均每日风速（十分米每秒）
    - WSFG - 峰值阵风风速（十分米每秒）
    - WT** = 天气类型，其中**定义天气类型。这里是天气类型的完整列表。
- DATA VALUE = 5个字符的数据值，表示ELEMENT的值即测量值。
- M-FLAG = 1个字符的测量标志。这有10个可能的值。这些值中的一些表明数据准确性存疑。我们接受将此设置为"P"的数据-标识为缺失且假设为零，因为这只与PRCP、SNOW和SNWD的测量相关。
- Q-FLAG是测量质量标志，有14个可能值。我们只对空值感兴趣，即没有未通过任何质量保证检查。
- S-FLAG是观测的来源标志。对我们的分析没有用处，因此被忽略。
- OBS-TIME = 4个字符的观测时间，以小时-分钟格式（即0700 = 上午7:00）。在较老的数据中通常不存在。我们在此目的上忽略它。

每一行测量将导致ClickHouse中稀疏的表结构。我们应该转换为每个时间和站点一行，测量作为列。首先，我们限制数据集到那些没有问题的行，即`qFlag`等于空字符串的行。

#### 清洗数据 {#clean-the-data}

使用[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)我们可以过滤代表感兴趣测量并符合我们的质量要求的行：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

拥有超过26亿行，由于涉及解析所有文件，这不是一个快速的查询。在我们的8核机器上，大约需要160秒。

### 透视数据 {#pivot-data}

虽然每行测量结构可以与ClickHouse一起使用，但这会不必要地使未来查询复杂。理想情况下，我们需要每个站点ID和日期一行，其中每个测量类型和相关值是列，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

使用ClickHouse local和一个简单的`GROUP BY`，我们可以将数据重构为这种结构。为了限制内存开销，我们一次处理一个文件。

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

此查询生成一个单一的50GB文件`noaa.csv`。

### 丰富数据 {#enriching-the-data}

数据除了站点ID外没有地点的指示，站点ID包括前缀国家代码。理想情况下，每个站点都应与其关联的纬度和经度。为此，NOAA提供了每个站点的详细信息作为单独的[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)文件。该文件具有[多个列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)，其中五个对我们未来的分析有用：id、纬度、经度、高程和名称。

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
此查询运行几分钟并生成一个6.4 GB的文件`noaa_enriched.parquet`。

## 创建表 {#create-table}

在ClickHouse中创建一个MergeTree表（从ClickHouse客户端）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均温度（十分之一摄氏度）',
   `tempMax` Int32 COMMENT '最高温度（十分之一摄氏度）',
   `tempMin` Int32 COMMENT '最低温度（十分之一摄氏度）',
   `precipitation` UInt32 COMMENT '降水量（十分之一毫米）',
   `snowfall` UInt32 COMMENT '降雪量（毫米）',
   `snowDepth` UInt32 COMMENT '雪深（毫米）',
   `percentDailySun` UInt8 COMMENT '每日可能阳光的百分比（百分比）',
   `averageWindSpeed` UInt32 COMMENT '平均每日风速（十分米每秒）',
   `maxWindSpeed` UInt32 COMMENT '峰值阵风风速（十分米每秒）',
   `weatherType` Enum8('正常' = 0, '雾' = 1, '浓雾' = 2, '雷电' = 3, '小冰雹' = 4, '冰雹' = 5, '冰霜' = 6, '尘土/灰烬' = 7, '烟雾/雾霾' = 8, '风吹/漂移雪' = 9, '龙卷风' = 10, '大风' = 11, '吹风喷雾' = 12, '薄雾' = 13, '细雨' = 14, '冰雨' = 15, '降雨' = 16, '冰冻雨' = 17, '降雪' = 18, '未知降水' = 19, '地面雾' = 21, '冰冻雾' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## 插入到ClickHouse {#inserting-into-clickhouse}

### 从本地文件插入 {#inserting-from-local-file}

可以通过以下方式从本地文件插入数据（来自ClickHouse客户端）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

其中`<path>`代表磁盘上本地文件的完整路径。

请参见[此处](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)以加速此加载。

### 从S3插入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```
有关如何加速此操作，请参见我们博客文章[调优大数据加载](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。

## 示例查询 {#sample-queries}

### 有史以来最高温度 {#highest-temperature-ever}

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

结果与[记录](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)中在[炉灶溪](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)处的文件保持一致，截至2023年。

### 最佳滑雪胜地 {#best-ski-resorts}

使用美国的[滑雪胜地列表](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)及其各自位置，我们将其与过去5年中任意一个月降雪量最多的前1000个气象站进行连接。按[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)进行排序，并限制结果中距离小于20km的记录，选择每个度假胜地的最佳结果，并按总降雪量进行排序。请注意，我们还将度假胜地限制在海拔超过1800米的条件下，作为良好滑雪条件的一个广泛指标。

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

5 行结果。耗时: 0.750 秒。处理689.10百万行，3.20 GB (918.20百万行/s., 4.26 GB/s.)
峰值内存使用: 67.66 MiB。
```

## 感谢 {#credits}

我们要感谢全球历史气候网络为准备、清洗和分发这些数据所做的努力。我们对此表示感谢。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, 和 T.G. Houston, 2012: 全球历史气候网络 - 每日 (GHCN-Daily)，版本3。[指示使用的子集, 例如.Version 3.25]。NOAA国家环境信息中心。 http://doi.org/10.7289/V5D21VHZ [2020年8月17日]

