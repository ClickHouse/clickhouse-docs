---
sidebar_label: '生成随机测试数据'
title: '在 ClickHouse 中生成随机测试数据'
slug: /guides/generating-test-data
description: '了解如何在 ClickHouse 中生成随机测试数据'
show_related_blogs: true
doc_type: 'guide'
keywords: ['random data', 'test data']
---



# 在 ClickHouse 中生成随机测试数据

在测试新用例或对实现进行基准测试时，生成随机数据非常有用。
ClickHouse 提供了[丰富的随机数据生成函数](/sql-reference/functions/random-functions)，在很多情况下无需依赖外部数据生成器。

本指南通过多个示例演示如何在 ClickHouse 中生成满足不同随机性需求的随机数据集。



## 简单均匀分布数据集 {#simple-uniform-dataset}

**使用场景**:快速生成包含随机时间戳和事件类型的用户事件数据集。

```sql
CREATE TABLE user_events (
  event_id UUID,
  user_id UInt32,
  event_type LowCardinality(String),
  event_time DateTime
) ENGINE = MergeTree
ORDER BY event_time;

INSERT INTO user_events
SELECT
  generateUUIDv4() AS event_id,
  rand() % 10000 AS user_id,
  arrayJoin(['click','view','purchase']) AS event_type,
  now() - INTERVAL rand() % 3600*24 SECOND AS event_time
FROM numbers(1000000);
```

- `rand() % 10000`:生成 10000 个用户的均匀分布
- `arrayJoin(...)`:从三种事件类型中随机选择一种
- 时间戳分布在过去 24 小时内

---


## 指数分布 {#exponential-distribution}

**使用场景**:模拟购买金额,其中大部分金额较低,少数金额较高。

```sql
CREATE TABLE purchases (
  dt DateTime,
  customer_id UInt32,
  total_spent Float32
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO purchases
SELECT
  now() - INTERVAL randUniform(1,1_000_000) SECOND AS dt,
  number AS customer_id,
  15 + round(randExponential(1/10), 2) AS total_spent
FROM numbers(500000);
```

- 在最近时间段内均匀分布的时间戳
- `randExponential(1/10)` — 大部分金额接近 0,通过加 15 设置最小值 ([ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4])

---


## 时间分布事件(泊松分布) {#poisson-distribution}

**使用场景**:模拟在特定时段(如高峰时段)集中到达的事件。

```sql
CREATE TABLE events (
  dt DateTime,
  event_type String
) ENGINE = MergeTree
ORDER BY dt;

INSERT INTO events
SELECT
  toDateTime('2022-12-12 12:00:00')
    - ((12 + randPoisson(12)) * 3600) AS dt,
  'click' AS event_type
FROM numbers(200000);
```

- 事件在正午时段达到峰值,偏差服从泊松分布

---


## 时变正态分布 {#time-varying-normal-distribution}

**使用场景**:模拟随时间变化的系统指标(例如 CPU 使用率)。

```sql
CREATE TABLE cpu_metrics (
  host String,
  ts DateTime,
  usage Float32
) ENGINE = MergeTree
ORDER BY (host, ts);

INSERT INTO cpu_metrics
SELECT
  arrayJoin(['host1','host2','host3']) AS host,
  now() - INTERVAL number SECOND AS ts,
  greatest(0.0, least(100.0,
    randNormal(50 + 30*sin(toUInt32(ts)%86400/86400*2*pi()), 10)
  )) AS usage
FROM numbers(10000);
```

- `usage` 遵循日周期正弦波叠加随机波动
- 值限定在 \[0,100] 范围内

---


## 分类和嵌套数据 {#categorical-and-nested-data}

**用例**:创建包含多值兴趣的用户画像。

```sql
CREATE TABLE user_profiles (
  user_id UInt32,
  interests Array(String),
  scores Array(UInt8)
) ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO user_profiles
SELECT
  number AS user_id,
  arrayShuffle(['sports','music','tech'])[1 + rand() % 3 : 1 + rand() % 3] AS interests,
  [rand() % 100, rand() % 100, rand() % 100] AS scores
FROM numbers(20000);
```

- 随机数组长度为 1–3
- 每个用户有三个分数

:::tip
阅读博客文章 [在 ClickHouse 中生成随机数据](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse) 了解更多示例。
:::


## 生成随机表 {#generating-random-tables}

[`generateRandomStructure`](/sql-reference/functions/other-functions#generateRandomStructure) 函数与 [`generateRandom`](/sql-reference/table-functions/generate) 表引擎结合使用时特别有用,可用于测试、性能基准测试或创建具有任意模式的模拟数据。

首先,让我们使用 `generateRandomStructure` 函数来看看随机结构是什么样的:

```sql
SELECT generateRandomStructure(5);
```

您可能会看到类似这样的结果:

```response
c1 UInt32, c2 Array(String), c3 DateTime, c4 Nullable(Float64), c5 Map(String, Int16)
```

您也可以使用种子值来每次获得相同的结构:

```sql
SELECT generateRandomStructure(3, 42);
```

```response
c1 String, c2 Array(Nullable(Int32)), c3 Tuple(UInt8, Date)
```

现在让我们创建一个实际的表并用随机数据填充它:

```sql
CREATE TABLE my_test_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT *
FROM generateRandom(
    'col1 UInt32, col2 String, col3 Float64, col4 DateTime',
    1,  -- 数据生成的种子值
    10  -- 不同随机值的数量
)
LIMIT 100;  -- 100 行

-- 步骤 2: 查询您的新表
SELECT * FROM my_test_table LIMIT 5;
```

```response
┌───────col1─┬─col2──────┬─────────────────────col3─┬────────────────col4─┐
│ 4107652264 │ &b!M-e;7  │  1.0013455832230728e-158 │ 2059-08-14 19:03:26 │
│  652895061 │ Dj7peUH{T │   -1.032074207667996e112 │ 2079-10-06 04:18:16 │
│ 2319105779 │ =D[       │    -2.066555415720528e88 │ 2015-04-26 11:44:13 │
│ 1835960063 │ _@}a      │  -1.4998020545039013e110 │ 2063-03-03 20:36:55 │
│  730412674 │ _}!       │ -1.3578492992094465e-275 │ 2098-08-23 18:23:37 │
└────────────┴───────────┴──────────────────────────┴─────────────────────┘
```

让我们结合这两个函数来创建一个完全随机的表。
首先,查看我们将获得什么结构:

```sql
SELECT generateRandomStructure(7, 123) AS structure FORMAT vertical;
```

```response
┌─structure──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal64(7), c2 Enum16('c2V0' = -21744, 'c2V1' = 5380), c3 Int8, c4 UUID, c5 UUID, c6 FixedString(190), c7 Map(Enum16('c7V0' = -19581, 'c7V1' = -10024, 'c7V2' = 27615, 'c7V3' = -10177, 'c7V4' = -19644, 'c7V5' = 3554, 'c7V6' = 29073, 'c7V7' = 28800, 'c7V8' = -11512), Float64) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

现在使用该结构创建表,并使用 `DESCRIBE` 语句查看我们创建的内容:

```sql
CREATE TABLE fully_random_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT *
FROM generateRandom(generateRandomStructure(7, 123), 1, 10)
LIMIT 1000;

DESCRIBE TABLE fully_random_table;
```


```response
   ┌─name─┬─type─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
1. │ c1   │ Decimal(18, 7)                                                                                                                                                           │              │                    │         │                  │                │
2. │ c2   │ Enum16('c2V0' = -21744, 'c2V1' = 5380)                                                                                                                                   │              │                    │         │                  │                │
3. │ c3   │ Int8                                                                                                                                                                     │              │                    │         │                  │                │
4. │ c4   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
5. │ c5   │ UUID                                                                                                                                                                     │              │                    │         │                  │                │
6. │ c6   │ FixedString(190)                                                                                                                                                         │              │                    │         │                  │                │
7. │ c7   │ Map(Enum16('c7V4' = -19644, 'c7V0' = -19581, 'c7V8' = -11512, 'c7V3' = -10177, 'c7V1' = -10024, 'c7V5' = 3554, 'c7V2' = 27615, 'c7V7' = 28800, 'c7V6' = 29073), Float64) │              │                    │         │                  │                │
   └──────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

查看第一行，作为生成数据的示例：

```sql
SELECT * FROM fully_random_table LIMIT 1 FORMAT vertical;
```

```response
第 1 行:
──────
c1: 80416293882.257732 -- 804.2 亿
c2: c2V1
c3: -84
c4: 1a9429b3-fd8b-1d72-502f-c051aeb7018e
c5: 7407421a-031f-eb3b-8571-44ff279ddd36
c6: g̅b�&��rҵ���5C�\�|��H�>���l'V3��R�[��=3�G�LwVMR*s緾/2�J.���6#��(�h>�lە��L^�M�:�R�9%d�ž�zv��W����Y�S��_no��BP+��u��.0��UZ!x�@7:�nj%3�Λd�S�k>���w��|�&��~
c7: {'c7V8':-1.160941256852442}
```
