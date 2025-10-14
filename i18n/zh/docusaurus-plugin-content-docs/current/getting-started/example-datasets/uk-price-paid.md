---
'description': '了解如何使用投影来提高您频繁运行的查询性能，使用包含关于英格兰和威尔士房地产价格的数据的UK property数据集'
'sidebar_label': 'UK Property Prices'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/uk-price-paid'
'title': '英国房地产价格数据集'
'doc_type': 'tutorial'
---

这份数据包含了在英格兰和威尔士支付的房地产价格。数据自1995年以来可用，未压缩形式的数据集大小约为4 GiB（在 ClickHouse 中仅占约 278 MiB）。

- 来源: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 字段描述: https://www.gov.uk/guidance/about-the-price-paid-data
- 包含 HM 土地注册处数据 © 皇冠版权和数据库权利 2021。该数据根据开放政府许可证 v3.0 授予许可。

## 创建表 {#create-table}

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

我们将使用 `url` 函数将数据流式传输到 ClickHouse。我们需要首先预处理一些进入的数据，包括：
- 将 `postcode` 切分为两个不同的列 - `postcode1` 和 `postcode2`，这样更有利于存储和查询
- 将 `time` 字段转换为日期，因为它仅包含 00:00 时间
- 忽略 [UUid](../../sql-reference/data-types/uuid.md) 字段，因为我们在分析中不需要它
- 使用 [transform](../../sql-reference/functions/other-functions.md#transform) 函数将 `type` 和 `duration` 转换为更易读的 `Enum` 字段
- 将 `is_new` 字段从单字符字符串（`Y`/`N`）转换为 [UInt8](/sql-reference/data-types/int-uint) 字段，其值为 0 或 1
- 删除最后两列，因为它们的值都是相同的（即 0）

`url` 函数将数据从网页服务器流式传输到您的 ClickHouse 表中。以下命令将 500 万行插入到 `uk_price_paid` 表中：

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

等待数据插入 - 这可能需要一两分钟，具体取决于网络速度。

## 验证数据 {#validate-data}

让我们通过查看插入了多少行来验证操作是否成功：

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

在运行此查询时，数据集包含 27,450,499 行。让我们看看 ClickHouse 中表的存储大小：

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

注意表的大小仅为 221.43 MiB！

## 执行一些查询 {#run-queries}

让我们运行一些查询来分析数据：

### 查询 1. 每年的平均价格 {#average-price}

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

### 查询 2. 伦敦每年的平均价格 {#average-price-london}

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

2020 年的房价发生了什么变化！但这可能并不令人惊讶...

### 查询 3. 最昂贵的社区 {#most-expensive-neighborhoods}

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

## 使用投影加速查询 {#speeding-up-queries-with-projections}

我们可以使用投影来加速这些查询。有关该数据集的示例，请参见 ["Projections"](/data-modeling/projections)。

### 在游乐场中测试 {#playground}

该数据集在 [在线游乐场](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX) 中也可用。
