---
description: '过去 120 年的 25 亿行气候数据'
sidebar_label: 'NOAA 全球历史气候网络'
slug: /getting-started/example-datasets/noaa
title: 'NOAA 全球历史气候网络'
doc_type: 'guide'
keywords: ['示例数据集', 'noaa', '天气数据', '样本数据', '气候']
---

此数据集包含过去 120 年的天气观测数据。每一行代表某一时刻、某一观测站的一条测量记录。

更具体地，根据[该数据的来源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

> GHCN-Daily 是一个覆盖全球陆地区域的逐日观测数据集。它包含来自全球各地陆地观测站的站点观测记录，其中约三分之二仅包含降水测量（Menne 等，2012）。GHCN-Daily 是由众多来源的气候记录合并而成的复合数据集，并经过了一套统一的质量保证审查流程（Durre 等，2010）。该档案包含如下气象要素：

- 每日最高气温
    - 每日最低气温
    - 观测时刻的气温
    - 降水量（例如雨水、融雪）
    - 降雪量
    - 积雪深度
    - 其他（如有）气象要素

下面各节将简要概述把该数据集导入 ClickHouse 所涉及的步骤。如果您有兴趣更详细地了解每个步骤，建议阅读我们的博文《[探索海量真实世界数据集：在 ClickHouse 中分析 100+ 年天气记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)》。

## 下载数据 {#downloading-the-data}

- 一个适用于 ClickHouse 的[预先准备好的版本](#pre-prepared-data)数据，已完成清洗、重组和富化。该数据覆盖 1900 年至 2022 年。
- [下载原始数据](#original-data)并转换为 ClickHouse 所需的格式。希望添加自定义列的用户可以考虑采用这种方式。

### 预先准备的数据 {#pre-prepared-data}

更具体地说，已经移除了所有在 NOAA 的质量检查中未出现任何失败的行。数据也从“每行一个观测值”重构为“每个测站 ID 与日期对应一行”，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

这使得查询更简单，并确保生成的表不那么稀疏。最后，数据还被补充了纬度和经度信息。

这些数据可以在以下 S3 位置获取。可以选择将数据下载到本地文件系统（然后使用 ClickHouse 客户端插入），或者直接插入到 ClickHouse 中（参见 [Inserting from S3](#inserting-from-s3)）。

下载：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```


### 原始数据 {#original-data}

下面将说明下载并转换原始数据，以便将其加载到 ClickHouse 的步骤。

#### 下载 {#download}

下载原始数据：

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

以下内容总结自[格式文档](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

按顺序对格式说明及各列进行概述：


- 一个 11 个字符的测站识别码。本身编码了一些有用的信息。
- YEAR/MONTH/DAY = 8 个字符的日期，格式为 YYYYMMDD（例如 19860529 = 1986 年 5 月 29 日）
- ELEMENT = 4 个字符的要素类型指示符，本质上是测量类型。可用的测量项很多，我们选择以下几种：
  - PRCP - 降水量（单位：0.1 毫米）
  - SNOW - 降雪量（毫米）
  - SNWD - 积雪深度（毫米）
  - TMAX - 最高气温（单位：0.1 摄氏度）
  - TAVG - 平均气温（单位：0.1 摄氏度）
  - TMIN - 最低气温（单位：0.1 摄氏度）
  - PSUN - 每日可能日照时数的百分比（百分数）
  - AWND - 日平均风速（单位：0.1 米/秒）
  - WSFG - 阵风极大风速（单位：0.1 米/秒）
  - WT** = 天气类型，其中 ** 用于标识具体的天气类型。完整天气类型列表见此处。
  - DATA VALUE = ELEMENT 的 5 个字符数据值，即对应的测量值。
  - M-FLAG = 1 个字符的测量标志（Measurement Flag）。共有 10 种可能取值，其中部分取值表示数据精度存疑。我们接受该字段为 "P" 的数据——表示识别为缺失但假定为 0，因为这仅与 PRCP、SNOW 和 SNWD 测量相关。
- Q-FLAG 是测量质量标志（measurement quality flag），共有 14 种可能取值。我们只关心该字段为空值（空字符串）的数据，即未在任何质量检查中失败的数据。
- S-FLAG 是观测来源标志。对我们的分析没有用处，予以忽略。
- OBS-TIME = 4 个字符的观测时间，小时-分钟格式（例如 0700 = 上午 7:00）。在较早的数据中通常不存在。我们在此场景中忽略该字段。

每行一个测量值会在 ClickHouse 中产生稀疏的表结构。我们应当转换为每个时间点和测站一行的形式，将各测量项作为列。首先，我们将数据集限制为没有问题的行，即 `qFlag` 等于空字符串的记录。

#### 清洗数据 {#clean-the-data}

使用 [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)，我们可以筛选出代表感兴趣测量数据并满足质量要求的行：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

由于数据量超过 26 亿行，这个查询执行得并不快，因为需要解析所有文件。在我们的 8 核机器上，这大约需要 160 秒。


### 透视数据 {#pivot-data}

虽然“每行一条测量记录”的结构也可以在 ClickHouse 中使用，但会让后续查询不必要地变得复杂。理想情况下，我们希望每个站点 ID 和日期对应一行，其中每种测量类型及其对应的数值都是单独的一列，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

使用 ClickHouse local 和一个简单的 `GROUP BY`，我们可以将数据重新透视为这种结构。为控制内存开销，我们一次只处理一个文件。

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

此查询会生成一个 50GB 的单个文件 `noaa.csv`。


### 丰富数据 {#enriching-the-data}

这些数据除了包含前缀为国家代码的站点 ID 外，不包含任何其他位置信息。理想情况下，每个站点都应关联有纬度和经度。为此，NOAA 贴心地将每个站点的详细信息单独提供在一个 [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file) 文件中。该文件包含[多列数据](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)，其中有五列对后续分析很有用：id、latitude、longitude、elevation 和 name。

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

此查询运行需要几分钟时间，并生成一个大小为 6.4 GB 的文件 `noaa_enriched.parquet`。


## 创建表 {#create-table}

使用 ClickHouse 客户端在 ClickHouse 中创建一个 MergeTree 表。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT '平均气温（十分之一摄氏度）',
   `tempMax` Int32 COMMENT '最高气温（十分之一摄氏度）',
   `tempMin` Int32 COMMENT '最低气温（十分之一摄氏度）',
   `precipitation` UInt32 COMMENT '降水量（十分之一毫米）',
   `snowfall` UInt32 COMMENT '降雪量（毫米）',
   `snowDepth` UInt32 COMMENT '积雪深度（毫米）',
   `percentDailySun` UInt8 COMMENT '日照百分比（百分比）',
   `averageWindSpeed` UInt32 COMMENT '日平均风速（十分之一米/秒）',
   `maxWindSpeed` UInt32 COMMENT '最大阵风风速（十分之一米/秒）',
   `weatherType` Enum8('正常' = 0, '雾' = 1, '浓雾' = 2, '雷暴' = 3, '小冰雹' = 4, '冰雹' = 5, '雨凇' = 6, '尘埃/火山灰' = 7, '烟雾/霾' = 8, '吹雪/飘雪' = 9, '龙卷风' = 10, '大风' = 11, '浪花飞溅' = 12, '薄雾' = 13, '毛毛雨' = 14, '冻毛毛雨' = 15, '雨' = 16, '冻雨' = 17, '雪' = 18, '未知降水' = 19, '地面雾' = 21, '冻雾' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## 向 ClickHouse 写入数据 {#inserting-into-clickhouse}

### 从本地文件插入 {#inserting-from-local-file}

在 ClickHouse 客户端中，可以按如下方式从本地文件插入数据：

```sql
INSERT INTO noaa FROM INFILE '<路径>/noaa_enriched.parquet'
```

其中 `<path>` 表示磁盘上本地文件的完整路径。

有关如何加快加载速度，请参见[此处](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)。


### 从 S3 中导入数据 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

如需了解如何加快这一过程，请参阅我们的博文：[优化大规模数据加载](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。


## 查询示例 {#sample-queries}

### 有史以来的最高气温 {#highest-temperature-ever}

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

令人放心的是，其与截至 2023 年 [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) 的[官方记录](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)高度一致。


### 最佳滑雪胜地 {#best-ski-resorts}

使用这份[美国滑雪胜地列表](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)及其各自位置，将其与过去 5 年中任意单月降雪量最高的前 1000 个气象站进行关联。按 [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) 对关联结果排序，并将距离限制在 20 公里以内，从中为每个滑雪胜地选取距离最近的一条记录，然后按总降雪量排序。注意，我们还将滑雪胜地限制在海拔 1800 米以上，将其作为良好滑雪条件的一个粗略指标。

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

返回 5 行。用时:0.750 秒。处理了 6.891 亿行,3.20 GB(9.182 亿行/秒,4.26 GB/秒)。
峰值内存用量:67.66 MiB。
```


## 致谢 {#credits}

我们谨此感谢全球历史气候学网络（Global Historical Climatology Network）在本数据的整理、清洗和分发过程中所作出的贡献。非常感谢你们的付出。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [请在小数点后标明所使用的子集，例如 Version 3.25]。NOAA National Centers for Environmental Information。http://doi.org/10.7289/V5D21VHZ [17/08/2020]