---
description: '了解如何使用投影来提升经常运行的查询性能，示例基于英国房产数据集，该数据集包含英格兰和威尔士房地产成交价格数据'
sidebar_label: '英国房产价格'
slug: /getting-started/example-datasets/uk-price-paid
title: '英国房产价格数据集'
doc_type: 'guide'
keywords: ['示例数据集', '英国房产', '示例数据', '房地产', '入门']
---

该数据集包含英格兰和威尔士房地产的成交价格信息。该数据自 1995 年起提供，未压缩形式的数据集大小约为 4 GiB（在 ClickHouse 中仅约为 278 MiB）。

- 数据来源: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 字段说明: https://www.gov.uk/guidance/about-the-price-paid-data
- 包含 HM Land Registry 数据 © Crown copyright and database right 2021。本数据依据 Open Government Licence v3.0 授权许可使用。

## 创建数据表 {#create-table}

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

## 预处理并插入数据 {#preprocess-import-data}

我们将使用 `url` 函数将数据流式写入 ClickHouse。首先需要对部分传入数据进行预处理，包括：

* 将 `postcode` 拆分为两个不同的列——`postcode1` 和 `postcode2`，这样在存储和查询方面更高效
* 将 `time` 字段转换为日期类型，因为它只包含 00:00 的时间
* 忽略 [UUID](../../sql-reference/data-types/uuid.md) 字段，因为我们不需要它进行分析
* 使用 [transform](../../sql-reference/functions/other-functions.md#transform) 函数将 `type` 和 `duration` 转换为更易读的 `Enum` 字段
* 将 `is_new` 字段从单字符字符串（`Y`/`N`）转换为取值为 0 或 1 的 [UInt8](/sql-reference/data-types/int-uint) 字段
* 删除最后两列，因为它们的值都相同（均为 0）

`url` 函数会将数据从 Web 服务器流式传输到 ClickHouse 表中。以下命令会向 `uk_price_paid` 表中插入 500 万行数据：

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

等待数据插入完成；根据网络速度，这可能需要一到两分钟。

## 验证数据 {#validate-data}

通过查看插入了多少行来验证是否生效：

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

在运行此查询时，数据集包含 27,450,499 行。我们来看一下该表在 ClickHouse 中占用的存储空间：

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

请注意，这张表的大小只有 221.43 MiB！

## 运行一些查询 {#run-queries}

我们来运行一些查询来分析数据：

### 查询 1：各年份的平均价格 {#average-price}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80
)
FROM uk.uk_price_paid
GROUP BY year
ORDER BY year
```

### 查询 2：伦敦每年的平均价格 {#average-price-london}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100
)
FROM uk.uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

2020 年房价发生了点变化！不过这大概不算什么意外……

### 查询 3：最昂贵的街区 {#most-expensive-neighborhoods}

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

## 使用投影（Projections）加速查询 {#speeding-up-queries-with-projections}

我们可以通过使用投影（Projections）来加速这些查询。参见[《投影（Projections）》](/data-modeling/projections)以查看针对该数据集的示例。

### 在 Playground 中测试 {#playground}

该数据集也可在 [在线 Playground](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX) 中使用。