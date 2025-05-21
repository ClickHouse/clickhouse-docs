---
'description': 'Learn how to use projections to improve the performance of queries
  that you run frequently using the UK property dataset, which contains data about
  prices paid for real-estate property in England and Wales'
'sidebar_label': 'UK Property Prices'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/uk-price-paid'
'title': 'The UK property prices dataset'
---



该数据包含英格兰和威尔士房地产的成交价格数据。该数据自1995年开始提供，未压缩的数据集大小约为4 GiB（在ClickHouse中只占约278 MiB）。

- 来源: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 字段说明: https://www.gov.uk/guidance/about-the-price-paid-data
- 包含HM土地注册处数据 © 2021年皇冠版权和数据库权利。该数据根据开放政府许可证v3.0进行授权。

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

我们将使用 `url` 函数将数据流式传输到ClickHouse。我们需要先对一些进入的数据进行预处理，包括：
- 将 `postcode` 拆分为两个不同的列 - `postcode1` 和 `postcode2`，这更有利于存储和查询
- 将 `time` 字段转换为日期，因为它仅包含00:00时间
- 忽略 [UUid](../../sql-reference/data-types/uuid.md) 字段，因为我们在分析中不需要它
- 使用 [transform](../../sql-reference/functions/other-functions.md#transform) 函数将 `type` 和 `duration` 转换为更可读的 `Enum` 字段
- 将 `is_new` 字段从单字符字符串（`Y`/`N`）转换为 [UInt8](/sql-reference/data-types/int-uint) 字段，值为0或1
- 删除最后两列，因为它们的值都是0

`url` 函数会将数据从网页服务器流式传输到您的ClickHouse表中。以下命令将500万行插入到 `uk_price_paid` 表中：

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

等待数据插入 - 这将根据网络速度需要一到两分钟。

## 验证数据 {#validate-data}

让我们通过查看插入了多少行来验证它是否成功：

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

在运行此查询时，数据集有27,450,499行。让我们看看在ClickHouse中表的存储大小：

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

请注意，表的大小仅为221.43 MiB！

## 运行一些查询 {#run-queries}

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

2020年房价发生了什么！但这可能并不奇怪...

### 查询 3. 最昂贵的邻里 {#most-expensive-neighborhoods}

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

## 通过投影加速查询 {#speeding-up-queries-with-projections}

我们可以通过投影加速这些查询。有关此数据集的示例，请参见 ["Projections"](/data-modeling/projections)。

### 在游乐场中测试 {#playground}

该数据集也可在 [在线游乐场](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX) 中获得。
