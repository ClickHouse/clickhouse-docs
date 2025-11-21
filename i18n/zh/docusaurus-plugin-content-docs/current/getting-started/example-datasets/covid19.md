---
description: 'COVID-19 Open-Data 是一个大型开源数据库，包含 COVID-19 流行病学数据以及人口统计、经济状况和政府应对等相关因素'
sidebar_label: 'COVID-19 开放数据'
slug: /getting-started/example-datasets/covid19
title: 'COVID-19 Open-Data'
keywords: ['COVID-19 数据', '流行病学数据', '健康数据集', '示例数据集', '入门']
doc_type: 'guide'
---

COVID-19 Open-Data 旨在构建最大规模的 COVID-19 流行病学数据库，并提供一组强大而全面的协变量。它包含与人口统计、经济、流行病学、地理、健康、住院、人员流动、政府应对措施、天气等相关的、来自公开渠道且已授权的开放数据。

详细信息见 GitHub [此处](https://github.com/GoogleCloudPlatform/covid-19-open-data)。

将这些数据导入 ClickHouse 非常容易……

:::note
以下命令是在 [ClickHouse Cloud](https://clickhouse.cloud) 的 **生产** 实例上执行的。您也可以轻松在本地环境中运行它们。
:::

1. 我们先来看一下这些数据的样子：

```sql
DESCRIBE url(
    'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
    'CSVWithNames'
);
```

该 CSV 文件有 10 列：

```response
┌─name─────────────────┬─type─────────────┐
│ date                 │ Nullable(Date)   │
│ location_key         │ Nullable(String) │
│ new_confirmed        │ Nullable(Int64)  │
│ new_deceased         │ Nullable(Int64)  │
│ new_recovered        │ Nullable(Int64)  │
│ new_tested           │ Nullable(Int64)  │
│ cumulative_confirmed │ Nullable(Int64)  │
│ cumulative_deceased  │ Nullable(Int64)  │
│ cumulative_recovered │ Nullable(Int64)  │
│ cumulative_tested    │ Nullable(Int64)  │
└──────────────────────┴──────────────────┘

返回了 10 行数据。耗时：0.745 秒。
```

2. 现在来查看几行数据：

```sql
SELECT *
FROM url('https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv')
LIMIT 100;
```

请注意，`url` 函数可以轻松从 CSV 文件中读取数据：


```response
┌─c1─────────┬─c2───────────┬─c3────────────┬─c4───────────┬─c5────────────┬─c6─────────┬─c7───────────────────┬─c8──────────────────┬─c9───────────────────┬─c10───────────────┐
│ date       │ location_key │ new_confirmed │ new_deceased │ new_recovered │ new_tested │ cumulative_confirmed │ cumulative_deceased │ cumulative_recovered │ cumulative_tested │
│ 2020-04-03 │ AD           │ 24            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 466                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-04 │ AD           │ 57            │ 0            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 523                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-05 │ AD           │ 17            │ 4            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 540                  │ 21                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-06 │ AD           │ 11            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 551                  │ 22                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-07 │ AD           │ 15            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 566                  │ 24                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-08 │ AD           │ 23            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 589                  │ 26                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
└────────────┴──────────────┴───────────────┴──────────────┴───────────────┴────────────┴──────────────────────┴─────────────────────┴──────────────────────┴───────────────────┘
```

3. 现在我们已经了解了数据的格式，接下来创建一个表：

```sql
CREATE TABLE covid19 (
    date Date,
    location_key LowCardinality(String),
    new_confirmed Int32,
    new_deceased Int32,
    new_recovered Int32,
    new_tested Int32,
    cumulative_confirmed Int32,
    cumulative_deceased Int32,
    cumulative_recovered Int32,
    cumulative_tested Int32
)
ENGINE = MergeTree
ORDER BY (location_key, date);
```

4. 以下命令将整个数据集插入 `covid19` 表：

```sql
INSERT INTO covid19
   SELECT *
   FROM
      url(
        'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
        CSVWithNames,
        'date Date,
        location_key LowCardinality(String),
        new_confirmed Int32,
        new_deceased Int32,
        new_recovered Int32,
        new_tested Int32,
        cumulative_confirmed Int32,
        cumulative_deceased Int32,
        cumulative_recovered Int32,
        cumulative_tested Int32'
    );
```

5. 这个过程很快——来看一下插入了多少行：

```sql
SELECT formatReadableQuantity(count())
FROM covid19;
```

```response
┌─formatReadableQuantity(count())─┐
│ 1253万                          │
└─────────────────────────────────┘
```

6. 我们来看一下记录的 Covid-19 病例总数：

```sql
SELECT formatReadableQuantity(sum(new_confirmed))
FROM covid19;
```

```response
┌─formatReadableQuantity(sum(new_confirmed))─┐
│ 13.9亿                                      │
└────────────────────────────────────────────┘
```


7. 你会注意到有很多日期上的值为 0——要么是周末，要么是并非每天都上报数据的日期。我们可以使用窗口函数来对新增病例的每日平均值进行平滑处理：

```sql
SELECT
   AVG(new_confirmed) OVER (PARTITION BY location_key ORDER BY date ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS cases_smoothed,
   new_confirmed,
   location_key,
   date
FROM covid19;
```

8. 此查询用于确定每个地区的最新值。由于并非所有国家每天都有上报数据，因此不能使用 `max(date)`，而是通过 `ROW_NUMBER` 取出最后一行：

```sql
WITH latest_deaths_data AS
   ( SELECT location_key,
            date,
            new_deceased,
            new_confirmed,
            ROW_NUMBER() OVER (PARTITION BY location_key ORDER BY date DESC) AS rn
     FROM covid19)
SELECT location_key,
       date,
       new_deceased,
       new_confirmed,
       rn
FROM latest_deaths_data
WHERE rn=1;
```

9. 我们可以使用 `lagInFrame` 来计算每天新增病例的 `LAG` 值。在此查询中，我们按位置 `US_DC` 进行过滤：

```sql
SELECT
   new_confirmed - lagInFrame(new_confirmed,1) OVER (PARTITION BY location_key ORDER BY date) AS confirmed_cases_delta,
   new_confirmed,
   location_key,
   date
FROM covid19
WHERE location_key = 'US_DC';
```

返回结果如下：

```response
┌─confirmed_cases_delta─┬─new_confirmed─┬─location_key─┬───────date─┐
│                     0 │             0 │ US_DC        │ 2020-03-08 │
│                     2 │             2 │ US_DC        │ 2020-03-09 │
│                    -2 │             0 │ US_DC        │ 2020-03-10 │
│                     6 │             6 │ US_DC        │ 2020-03-11 │
│                    -6 │             0 │ US_DC        │ 2020-03-12 │
│                     0 │             0 │ US_DC        │ 2020-03-13 │
│                     6 │             6 │ US_DC        │ 2020-03-14 │
│                    -5 │             1 │ US_DC        │ 2020-03-15 │
│                     4 │             5 │ US_DC        │ 2020-03-16 │
│                     4 │             9 │ US_DC        │ 2020-03-17 │
│                    -1 │             8 │ US_DC        │ 2020-03-18 │
│                    24 │            32 │ US_DC        │ 2020-03-19 │
│                   -26 │             6 │ US_DC        │ 2020-03-20 │
│                    15 │            21 │ US_DC        │ 2020-03-21 │
│                    -3 │            18 │ US_DC        │ 2020-03-22 │
│                     3 │            21 │ US_DC        │ 2020-03-23 │
```

10. 此查询计算每天新增病例的百分比变化，并在结果集中包含一个简单的列，用于标记是 `increase` 还是 `decrease`：

```sql
WITH confirmed_lag AS (
  SELECT
    *,
    lagInFrame(new_confirmed) OVER(
      PARTITION BY location_key
      ORDER BY date
    ) AS confirmed_previous_day
  FROM covid19
),
confirmed_percent_change AS (
  SELECT
    *,
    COALESCE(ROUND((new_confirmed - confirmed_previous_day) / confirmed_previous_day * 100), 0) AS percent_change
  FROM confirmed_lag
)
SELECT
  date,
  new_confirmed,
  percent_change,
  CASE
    WHEN percent_change > 0 THEN '增加'
    WHEN percent_change = 0 THEN '无变化'
    ELSE '减少'
  END AS trend
FROM confirmed_percent_change
WHERE location_key = 'US_DC';
```

结果如下所示。


```response
┌───────date─┬─new_confirmed─┬─percent_change─┬─trend─────┐
│ 2020-03-08 │             0 │            nan │ 下降  │
│ 2020-03-09 │             2 │            inf │ 上升  │
│ 2020-03-10 │             0 │           -100 │ 下降  │
│ 2020-03-11 │             6 │            inf │ 上升  │
│ 2020-03-12 │             0 │           -100 │ 下降  │
│ 2020-03-13 │             0 │            nan │ 下降  │
│ 2020-03-14 │             6 │            inf │ 上升  │
│ 2020-03-15 │             1 │            -83 │ 下降  │
│ 2020-03-16 │             5 │            400 │ 上升  │
│ 2020-03-17 │             9 │             80 │ 上升  │
│ 2020-03-18 │             8 │            -11 │ 下降  │
│ 2020-03-19 │            32 │            300 │ 上升  │
│ 2020-03-20 │             6 │            -81 │ 下降  │
│ 2020-03-21 │            21 │            250 │ 上升  │
│ 2020-03-22 │            18 │            -14 │ 下降  │
│ 2020-03-23 │            21 │             17 │ 上升  │
│ 2020-03-24 │            46 │            119 │ 上升  │
│ 2020-03-25 │            48 │              4 │ 上升  │
│ 2020-03-26 │            36 │            -25 │ 下降  │
│ 2020-03-27 │            37 │              3 │ 上升  │
│ 2020-03-28 │            38 │              3 │ 上升  │
│ 2020-03-29 │            59 │             55 │ 上升  │
│ 2020-03-30 │            94 │             59 │ 上升  │
│ 2020-03-31 │            91 │             -3 │ 下降  │
│ 2020-04-01 │            67 │            -26 │ 下降  │
│ 2020-04-02 │           104 │             55 │ 上升  │
│ 2020-04-03 │           145 │             39 │ 上升  │
```

:::note
正如 [GitHub 仓库](https://github.com/GoogleCloudPlatform/covid-19-open-data) 中提到的那样，自 2022 年 9 月 15 日起，该数据集已不再更新。
:::
