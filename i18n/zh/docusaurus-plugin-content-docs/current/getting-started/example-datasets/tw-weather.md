---
description: '过去 128 年的 1.31 亿行天气观测数据'
sidebar_label: '台湾历史天气数据集'
slug: /getting-started/example-datasets/tw-weather
title: '台湾历史天气数据集'
doc_type: 'guide'
keywords: ['示例数据集', '天气', '台湾', '示例数据', '气候数据']
---

此数据集包含过去 128 年的历史气象观测数据。每一行代表某一日期时间点和气象站的一条观测记录。

该数据集的来源可在[此处](https://github.com/Raingel/historical_weather)获取，气象站编号列表可在[此处](https://github.com/Raingel/weather_station_list)找到。

> 气象数据集的数据来源包括由中央气象局设立的气象站（测站代码以 C0、C1 和 4 开头），以及隶属于农业委员会的农业气象站（测站代码为上述以外的代码）：

    - StationId
    - MeasuredDate，观测时间
    - StnPres，测站气压
    - SeaPres，海平面气压
    - Td，露点温度
    - RH，相对湿度
    - 其他数据中提供的要素



## 下载数据

* 一个用于 ClickHouse 的[预处理版本](#pre-processed-data)，已经过清洗、重构和增强，时间范围为 1896–2023 年。
* [下载原始数据](#original-raw-data)并转换为 ClickHouse 所需的格式。如果希望添加自定义列，用户可以在此基础上自行探索或完善相应方案。

### 预处理数据

该数据集也已经从“每行一条测量记录”重构为“每个气象站 id 和测量日期一行”，即：

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

可以很容易地进行查询，并可以确认生成的表不那么稀疏；同时，一些元素为 null，是因为在这个气象站中无法对它们进行测量。

此数据集位于以下 Google Cloud Storage 位置。可以将数据集下载到本地文件系统（然后使用 ClickHouse 客户端插入），或者直接插入到 ClickHouse（参见 [Inserting from URL](#inserting-from-url)）。

下载方式：

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz
```


# 可选：验证校验和
md5sum preprocessed_weather_daily_1896_2023.tar.gz
# 校验和应为：11b484f5bd9ddafec5cfb131eb2dd008

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv



# 可选：验证校验和

md5sum daily&#95;weather&#95;preprocessed&#95;1896&#95;2023.csv

# 校验和应为：1132248c78195c43d93f843753881754

````

### 原始数据 {#original-raw-data}

以下详细说明了下载原始数据的步骤,以便您根据需要进行转换和处理。

#### 下载 {#download}

下载原始数据:

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz
````


# 选项：验证校验和
md5sum raw_data_weather_daily_1896_2023.tar.gz
# 校验和应为：b66b9f137217454d655e3004d7d1b51a

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...



# 可选步骤：验证校验和

cat *.csv | md5sum

# 校验和应为：b26db404bf84d4063fac42e576464ce1

````

#### 获取台湾气象站列表 {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv
````


# 选项：将带 BOM 的 UTF-8 转换为无 BOM 的 UTF-8 编码

sed -i &#39;1s/^\xEF\xBB\xBF//&#39; weather&#95;sta&#95;list.csv

```
```


## 创建表结构

使用 ClickHouse 客户端在 ClickHouse 中创建 MergeTree 表。

```bash
CREATE TABLE tw_weather_data (
    StationId String null,
    MeasuredDate DateTime64,
    StnPres Float64 null,
    SeaPres Float64 null,
    Tx Float64 null,
    Td Float64 null,
    RH Float64 null,
    WS Float64 null,
    WD Float64 null,
    WSGust Float64 null,
    WDGust Float64 null,
    Precp Float64 null,
    PrecpHour Float64 null,
    SunShine Float64 null,
    GloblRad Float64 null,
    TxSoil0cm Float64 null,
    TxSoil5cm Float64 null,
    TxSoil10cm Float64 null,
    TxSoil20cm Float64 null,
    TxSoil50cm Float64 null,
    TxSoil100cm Float64 null,
    TxSoil30cm Float64 null,
    TxSoil200cm Float64 null,
    TxSoil300cm Float64 null,
    TxSoil500cm Float64 null,
    VaporPressure Float64 null,
    UVI Float64 null,
    "Cloud Amount" Float64 null,
    EvapA Float64 null,
    Visb Float64 null
)
ENGINE = MergeTree
ORDER BY (MeasuredDate);
```


## 向 ClickHouse 插入数据

### 从本地文件插入

可以在 ClickHouse 客户端中按如下方式从本地文件插入数据：

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

其中 `/path/to` 表示磁盘上本地文件的具体路径。

数据插入 ClickHouse 后，示例响应输出如下：

```response
查询 ID: 90e4b524-6e14-4855-817c-7e6f98fbeabb

完成。
结果集包含 131985329 行。耗时:71.770 秒。已处理 1.3199 亿行,10.06 GB(184 万行/秒,140.14 MB/秒)。
峰值内存使用量:583.23 MiB。
```

### 通过 URL 插入数据

```sql
INSERT INTO tw_weather_data SELECT *
FROM url('https://storage.googleapis.com/taiwan-weather-observaiton-datasets/daily_weather_preprocessed_1896_2023.csv', 'CSVWithNames')

```

若要了解如何加快这一过程，请参阅我们的博客文章：[大规模数据加载调优](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。


## 检查数据行数和大小

1. 来看一下插入了多少行数据：

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 1.3199亿                        │
└─────────────────────────────────┘
```

2. 让我们看看该表占用了多少磁盘空间：

```sql
SELECT
    formatReadableSize(sum(bytes)) AS disk_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size
FROM system.parts
WHERE (`table` = 'tw_weather_data') AND active
```

```response
┌─disk_size─┬─uncompressed_size─┐
│ 2.13 GiB  │ 32.94 GiB         │
└───────────┴───────────────────┘
```


## 示例查询

### Q1：获取指定年份内各气象站的最高露点温度

```sql
SELECT
    StationId,
    max(Td) AS max_td
FROM tw_weather_data
WHERE (year(MeasuredDate) = 2023) AND (Td IS NOT NULL)
GROUP BY StationId

┌─StationId─┬─max_td─┐
│ 466940    │      1 │
│ 467300    │      1 │
│ 467540    │      1 │
│ 467490    │      1 │
│ 467080    │      1 │
│ 466910    │      1 │
│ 467660    │      1 │
│ 467270    │      1 │
│ 467350    │      1 │
│ 467571    │      1 │
│ 466920    │      1 │
│ 467650    │      1 │
│ 467550    │      1 │
│ 467480    │      1 │
│ 467610    │      1 │
│ 467050    │      1 │
│ 467590    │      1 │
│ 466990    │      1 │
│ 467060    │      1 │
│ 466950    │      1 │
│ 467620    │      1 │
│ 467990    │      1 │
│ 466930    │      1 │
│ 467110    │      1 │
│ 466881    │      1 │
│ 467410    │      1 │
│ 467441    │      1 │
│ 467420    │      1 │
│ 467530    │      1 │
│ 466900    │      1 │
└───────────┴────────┘

返回 30 行。用时:0.045 秒。已处理 641 万行,187.33 MB(1.4392 亿行/秒,4.21 GB/秒)。
```

### Q2: 在指定时间范围、字段和气象站条件下获取原始数据

```sql
SELECT
    StnPres,
    SeaPres,
    Tx,
    Td,
    RH,
    WS,
    WD,
    WSGust,
    WDGust,
    Precp,
    PrecpHour
FROM tw_weather_data
WHERE (StationId = 'C0UB10') AND (MeasuredDate >= '2023-12-23') AND (MeasuredDate < '2023-12-24')
ORDER BY MeasuredDate ASC
LIMIT 10
```


```response
┌─StnPres─┬─SeaPres─┬───Tx─┬───Td─┬─RH─┬──WS─┬──WD─┬─WSGust─┬─WDGust─┬─Precp─┬─PrecpHour─┐
│  1029.5 │    ᴺᵁᴸᴸ │ 11.8 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 271 │    5.5 │    275 │ -99.8 │     -99.8 │
│  1029.8 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 289 │    5.5 │    308 │ -99.8 │     -99.8 │
│  1028.6 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 79 │ 2.3 │ 251 │    6.1 │    289 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │   13 │ ᴺᵁᴸᴸ │ 75 │ 4.3 │ 312 │    7.5 │    316 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.1 │ ᴺᵁᴸᴸ │ 89 │ 7.1 │ 310 │   11.6 │    322 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.6 │ ᴺᵁᴸᴸ │ 90 │ 3.1 │ 269 │   10.7 │    295 │ -99.8 │     -99.8 │
│  1027.9 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 89 │ 4.7 │ 296 │    8.1 │    310 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │ 12.2 │ ᴺᵁᴸᴸ │ 94 │ 2.5 │ 246 │    7.1 │    283 │ -99.8 │     -99.8 │
│  1028.4 │    ᴺᵁᴸᴸ │ 12.5 │ ᴺᵁᴸᴸ │ 94 │ 3.1 │ 265 │    4.8 │    297 │ -99.8 │     -99.8 │
│  1028.3 │    ᴺᵁᴸᴸ │ 13.6 │ ᴺᵁᴸᴸ │ 91 │ 1.2 │ 273 │    4.4 │    256 │ -99.8 │     -99.8 │
└─────────┴─────────┴──────┴──────┴────┴─────┴─────┴────────┴────────┴───────┴───────────┘

返回 10 行数据。用时：0.009 秒。处理了 91.70 千行，2.33 MB（9.67 百万行/秒，245.31 MB/秒）
```


## 致谢 {#credits}

我们谨此感谢行政院农业委员会中央气象署及农业气象观测网（测站）在本数据集整理、清理与发布过程中所付出的努力，特此致谢。

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. 用于台湾稻热病早期预警的应用导向深度学习模型. Ecological Informatics 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [13/12/2022]
