---
'description': '过去120年的25亿行气候数据'
'sidebar_label': 'NOAA 全球历史气候网络'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/noaa'
'title': 'NOAA 全球历史气候网络'
'doc_type': 'reference'
---

该数据集包含过去120年的天气测量数据。每行是一个时间点和站点的测量值。

更准确地说，依据[这些数据的来源](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

> GHCN-Daily是一个包含全球陆地面积日常观测数据的数据集。它包含来自全世界陆地站点的基于站点的测量，约三分之二是仅用于降水测量（Menne et al., 2012）。GHCN-Daily是来自众多来源的气候记录的组合，这些记录合并在一起并进行了统一的质量保证审查（Durre et al., 2010）。存档包括以下气象要素：

    - 日最高气温
    - 日最低气温
    - 观察时的气温
    - 降水量（即，雨、水化雪）
    - 积雪
    - 雪深
    - 其他可用的要素

下面的部分简要概述了将该数据集导入ClickHouse所涉及的步骤。如果您想了解每一步的详细信息，我们建议您查看我们博客中的文章《["探索庞大的现实世界数据集：100年以上的天气记录在ClickHouse中"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)》。

## 下载数据 {#downloading-the-data}

- [预处理版本](#pre-prepared-data)的数据，已清洗、重构和丰富。该数据覆盖1900年至2022年。
- [下载原始数据](#original-data)并转换为ClickHouse所需的格式。希望添加自己列的用户可以考虑此方法。

### 预处理数据 {#pre-prepared-data}

更具体地说，已删除未通过Noaa质量检查的行。数据也已从每行一个测量重构为每个站点id和日期一行，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

这使得查询更简单，并确保结果表结构不那么稀疏。最后，数据还补充了经度和纬度。

该数据可在以下的S3位置获得。您可以将数据下载到本地文件系统（并使用ClickHouse客户端插入），或直接插入到ClickHouse中（请参见[从S3插入](#inserting-from-s3)）。

要下载：

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 原始数据 {#original-data}

以下是下载和转换原始数据以准备加载到ClickHouse中的步骤。

#### 下载 {#download}

要下载原始数据：

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### 采样数据 {#sampling-the-data}

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

总结[格式文档](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)：

总结格式文档和列顺序：

- 一个11位的站点识别码。它本身编码了一些有用的信息
- 年/月/日 = 8位日期，以YYYYMMDD格式表示（例如，19860529 = 1986年5月29日）
- 元素 = 4位元素类型指示符。实际上是测量类型。虽然有许多可用的测量，但我们选择以下：
  - PRCP - 降水（十分之一毫米）
  - SNOW - 积雪（毫米）
  - SNWD - 雪深（毫米）
  - TMAX - 最高气温（十分之一摄氏度）
  - TAVG - 平均气温（十分之一摄氏度）
  - TMIN - 最低气温（十分之一摄氏度）
  - PSUN - 日潜在日照百分比（百分比）
  - AWND - 日平均风速（十分之一米每秒）
  - WSFG - 峰值阵风风速（十分之一米每秒）
  - WT** = 天气类型，其中**定义天气类型。天气类型完整列表在此。
  - 数据值 = 5位数据值对应元素，即测量的值。
  - M-FLAG = 1位测量标志。此标志有10个可能值。其中一些值表明数据准确性可疑。我们接受数据时此值为“P” - 被认为缺失且认为为零，因为这仅与PRCP、SNOW和SNWD测量有关。
- Q-FLAG是测量质量标志，有14个可能值。我们只关注没有值的数据，即没有未通过任何质量保证检查的记录。
- S-FLAG是观察源标志。对我们的分析没有用，予以忽略。
- OBS-TIME = 4字符的观察时间，以小时-分钟格式表示（即0700 = 上午7:00）。在较旧数据中通常不存在。我们为我们的目的忽略这一点。

每行一个测量会导致ClickHouse中的表结构稀疏。我们应将修改转化为每个时间和站点一行，每种测量类型及其相关值为一列。首先，我们将数据集限制为那些没有问题的行，即`qFlag`等于空字符串的行。

#### 清理数据 {#clean-the-data}

使用[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)，我们可以过滤出满足我们关注的测量并符合质量要求的行：

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

在超过26亿行的情况下，由于需要解析所有文件，这不是一个快速的查询。在我们的8核机器上，这大约需要160秒。

### 数据透视 {#pivot-data}

虽然每行的测量结构可以在ClickHouse中使用，但会不必要地复杂化将来的查询。理想情况下，我们需要以每个站点ID和日期一行为单位，每个测量类型及其相关值为一列，即：

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

使用ClickHouse local和简单的`GROUP BY`，我们可以将数据重塑为这种结构。为了限制内存开销，我们按文件逐个处理。

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

此查询生成一个50GB的单个文件`noaa.csv`。

### 丰富数据 {#enriching-the-data}

该数据除了站点ID外没有位置信息，该ID包含一个前缀国家代码。理想情况下，每个站点都应有一个相关联的经度和纬度。为此，NOAA便利地提供了各站点的详细信息，作为一个单独的[ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)。该文件有[多个列](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)，其中有五个对我们未来的分析有用：id、纬度、经度、海拔和名称。

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
该查询运行几分钟并生成一个6.4 GB的文件`noaa_enriched.parquet`。

## 创建表 {#create-table}

在ClickHouse中创建一个MergeTree表（通过ClickHouse客户端）。

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Average temperature (tenths of a degrees C)',
   `tempMax` Int32 COMMENT 'Maximum temperature (tenths of degrees C)',
   `tempMin` Int32 COMMENT 'Minimum temperature (tenths of degrees C)',
   `precipitation` UInt32 COMMENT 'Precipitation (tenths of mm)',
   `snowfall` UInt32 COMMENT 'Snowfall (mm)',
   `snowDepth` UInt32 COMMENT 'Snow depth (mm)',
   `percentDailySun` UInt8 COMMENT 'Daily percent of possible sunshine (percent)',
   `averageWindSpeed` UInt32 COMMENT 'Average daily wind speed (tenths of meters per second)',
   `maxWindSpeed` UInt32 COMMENT 'Peak gust wind speed (tenths of meters per second)',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```

## 插入到ClickHouse {#inserting-into-clickhouse}

### 从本地文件插入 {#inserting-from-local-file}

数据可以按如下方式从本地文件中插入（通过ClickHouse客户端）：

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

其中`<path>`表示本地磁盘上文件的完整路径。

有关如何加快此加载速度的信息，请参见[这里](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)。

### 从S3插入 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```
有关如何加速此过程，请参见我们博客中关于[优化大数据加载](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)的文章。

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

5 rows in set. Elapsed: 0.514 sec. Processed 1.06 billion rows, 4.27 GB (2.06 billion rows/s., 8.29 GB/s.)
```

与[Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)的[记录文件](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)一致，截至2023年。

### 最佳滑雪胜地 {#best-ski-resorts}

利用[滑雪胜地列表](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)和相应的位置信息，我们将这些信息与过去5年中任意月份最多的前1000个天气站匹配。按[geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)对这些连接进行排序，并将结果限制在距离小于20km的情况下，我们选择每个胜地的顶部结果，并按总雪量进行排序。请注意，我们还限制滑雪胜地的高度在1800米以上，作为良好滑雪条件的宽泛指标。

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

5 rows in set. Elapsed: 0.750 sec. Processed 689.10 million rows, 3.20 GB (918.20 million rows/s., 4.26 GB/s.)
Peak memory usage: 67.66 MiB.
```

## 鸣谢 {#credits}

我们要感谢全球历史气候网络在准备、清洗和分发此数据方面的努力。我们非常感谢你们的付出。

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, 和 T.G. Houston, 2012: 《全球历史气候网络 - 日常数据(GHCN-Daily)》，版本3。[使用小数点后指示所用子集，例如版本3.25]。NOAA国家环境信息中心。http://doi.org/10.7289/V5D21VHZ [17/08/2020]
