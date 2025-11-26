---
sidebar_label: '生成随机测试数据'
title: '在 ClickHouse 中生成随机测试数据'
slug: /guides/generating-test-data
description: '了解 ClickHouse 中随机测试数据的生成方法'
show_related_blogs: true
doc_type: 'guide'
keywords: ['随机数据', '测试数据']
---



# 在 ClickHouse 中生成随机测试数据

在测试新用例或对实现进行基准测试时，生成随机数据非常有用。
ClickHouse 提供了[用于生成随机数据的丰富函数](/sql-reference/functions/random-functions)，在很多情况下可以避免依赖外部数据生成器。

本指南提供了多个示例，展示如何在 ClickHouse 中根据不同的随机性需求生成随机数据集。



## 简单均匀分布数据集

**使用场景**：快速生成包含随机时间戳和事件类型的用户事件数据集。

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

* `rand() % 10000`：表示对 1 万个用户的均匀分布
* `arrayJoin(...)`：从三种事件类型中随机选择一种
* 时间戳分布在过去 24 小时内

***


## 指数分布

**使用场景**：用于模拟购买金额，其中大多数金额较低，但有少数金额较高。

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

* 在最近一段时间内均匀分布的时间戳
* `randExponential(1/10)` — 大多数结果接近 0，然后整体加上 15 作为最小值（[ClickHouse][1], [ClickHouse][2], [Atlantic.Net][3], [GitHub][4]）

***


## 时间分布的事件（泊松）

**适用场景**：模拟在特定时间段（例如高峰时段）附近集中发生的事件。

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

* 事件在中午前后达到峰值，偏差服从泊松分布

***


## 随时间变化的正态分布

**使用场景**：模拟会随时间变化的系统指标（如 CPU 使用率）。

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

* `usage` 呈昼夜正弦波形变化并叠加随机扰动
* 数值被限定在 [0,100] 区间内

***


## 分类和嵌套数据

**使用场景**：创建具有多值兴趣字段的用户画像。

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

* 长度在 1–3 之间的随机数组
* 每个兴趣对应三个用户分数

:::tip
阅读博客文章 [Generating Random Data in ClickHouse](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse) 以获取更多示例。
:::


## 生成随机表

当与 [`generateRandom`](/sql-reference/table-functions/generate) 表引擎结合使用时，[`generateRandomStructure`](/sql-reference/functions/other-functions#generateRandomStructure) 函数在测试、基准测试或使用任意模式创建模拟数据等场景中尤为有用。

我们先通过使用 `generateRandomStructure` 函数来看看一个随机结构是什么样子：

```sql
SELECT generateRandomStructure(5);
```

你可能会看到类似如下内容：

```response
c1 UInt32, c2 Array(String), c3 DateTime, c4 Nullable(Float64), c5 Map(String, Int16)
```

你也可以使用固定的随机种子，这样每次都会得到相同的结构：

```sql
SELECT generateRandomStructure(3, 42);
```

```response
c1 String, c2 Array(Nullable(Int32)), c3 Tuple(UInt8, Date)
```

现在我们来创建一个真正的表，并向其中填充一些随机数据：

```sql
CREATE TABLE my_test_table
ENGINE = MergeTree
ORDER BY tuple()
AS SELECT * 
FROM generateRandom(
    'col1 UInt32, col2 String, col3 Float64, col4 DateTime',
    1,  -- 数据生成种子
    10  -- 不同随机值数量
)
LIMIT 100;  -- 100 行

-- 步骤 2：查询新表
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

让我们把这两个函数结合起来，生成一个完全随机的数据表。
首先，看看会得到怎样的结构：

```sql
SELECT generateRandomStructure(7, 123) AS structure FORMAT vertical;
```

```response
┌─structure──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal64(7), c2 Enum16('c2V0' = -21744, 'c2V1' = 5380), c3 Int8, c4 UUID, c5 UUID, c6 FixedString(190), c7 Map(Enum16('c7V0' = -19581, 'c7V1' = -10024, 'c7V2' = 27615, 'c7V3' = -10177, 'c7V4' = -19644, 'c7V5' = 3554, 'c7V6' = 29073, 'c7V7' = 28800, 'c7V8' = -11512), Float64) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

现在根据该结构创建表，并使用 `DESCRIBE` 语句查看我们创建的内容：

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
