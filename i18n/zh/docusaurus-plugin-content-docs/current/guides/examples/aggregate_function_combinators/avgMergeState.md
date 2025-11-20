---
slug: '/examples/aggregate-function-combinators/avgMergeState'
title: 'avgMergeState'
description: 'avgMergeState 组合器的使用示例'
keywords: ['avg', 'MergeState', 'combinator', 'examples', 'avgMergeState']
sidebar_label: 'avgMergeState'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# avgMergeState {#avgMergeState}


## 描述 {#description}

[`MergeState`](/sql-reference/aggregate-functions/combinators#-state) 组合器可应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，用于合并 `AverageFunction(avg, T)` 类型的部分聚合状态，并返回新的中间聚合状态。


## 使用示例 {#example-usage}

`MergeState` 组合器在多级聚合场景中特别有用,适用于需要合并预聚合状态并将其保持为状态(而非最终化)以便进一步处理的情况。为了说明这一点,我们将通过一个示例来演示如何将单个服务器性能指标转换为跨多个层级的分层聚合:服务器层级 → 区域层级 → 数据中心层级。

首先创建一个表来存储原始数据:

```sql
CREATE TABLE raw_server_metrics
(
    timestamp DateTime DEFAULT now(),
    server_id UInt32,
    region String,
    datacenter String,
    response_time_ms UInt32
)
ENGINE = MergeTree()
ORDER BY (region, server_id, timestamp);
```

接下来创建服务器层级的聚合目标表,并定义一个增量物化视图作为插入触发器:

```sql
CREATE TABLE server_performance
(
    server_id UInt32,
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (region, server_id);

CREATE MATERIALIZED VIEW server_performance_mv
TO server_performance
AS SELECT
    server_id,
    region,
    datacenter,
    avgState(response_time_ms) AS avg_response_time
FROM raw_server_metrics
GROUP BY server_id, region, datacenter;
```

对区域层级和数据中心层级执行相同的操作:

```sql
CREATE TABLE region_performance
(
    region String,
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY (datacenter, region);

CREATE MATERIALIZED VIEW region_performance_mv
TO region_performance
AS SELECT
    region,
    datacenter,
    avgMergeState(avg_response_time) AS avg_response_time
FROM server_performance
GROUP BY region, datacenter;

-- 数据中心层级表和物化视图

CREATE TABLE datacenter_performance
(
    datacenter String,
    avg_response_time AggregateFunction(avg, UInt32)
)
ENGINE = AggregatingMergeTree()
ORDER BY datacenter;

CREATE MATERIALIZED VIEW datacenter_performance_mv
TO datacenter_performance
AS SELECT
      datacenter,
      avgMergeState(avg_response_time) AS avg_response_time
FROM region_performance
GROUP BY datacenter;
```

然后向源表插入示例原始数据:

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 120),
    (now(), 101, 'us-east', 'dc1', 130),
    (now(), 102, 'us-east', 'dc1', 115),
    (now(), 201, 'us-west', 'dc1', 95),
    (now(), 202, 'us-west', 'dc1', 105),
    (now(), 301, 'eu-central', 'dc2', 145),
    (now(), 302, 'eu-central', 'dc2', 155);
```

接下来为每个层级编写三个查询:


<Tabs>
  <TabItem value="Service level" label="服务级" default>
    ```sql
    SELECT
        server_id,
        region,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM server_performance
    GROUP BY server_id, region
    ORDER BY region, server_id;
    ```

    ```response
    ┌─server_id─┬─region─────┬─avg_response_ms─┐
    │       301 │ eu-central │             145 │
    │       302 │ eu-central │             155 │
    │       101 │ us-east    │             125 │
    │       102 │ us-east    │             115 │
    │       201 │ us-west    │              95 │
    │       202 │ us-west    │             105 │
    └───────────┴────────────┴─────────────────┘
    ```
  </TabItem>

  <TabItem value="Regional level" label="区域级">
    ```sql
    SELECT
        region,
        datacenter,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM region_performance
    GROUP BY region, datacenter
    ORDER BY datacenter, region;
    ```

    ```response
    ┌─region─────┬─datacenter─┬────avg_response_ms─┐
    │ us-east    │ dc1        │ 121.66666666666667 │
    │ us-west    │ dc1        │                100 │
    │ eu-central │ dc2        │                150 │
    └────────────┴────────────┴────────────────────┘
    ```
  </TabItem>

  <TabItem value="Datacenter level" label="数据中心级">
    ```sql
    SELECT
        datacenter,
        avgMerge(avg_response_time) AS avg_response_ms
    FROM datacenter_performance
    GROUP BY datacenter
    ORDER BY datacenter;
    ```

    ```response
    ┌─datacenter─┬─avg_response_ms─┐
    │ dc1        │             113 │
    │ dc2        │             150 │
    └────────────┴─────────────────┘
    ```
  </TabItem>
</Tabs>

我们可以插入更多数据：

```sql
INSERT INTO raw_server_metrics (timestamp, server_id, region, datacenter, response_time_ms) VALUES
    (now(), 101, 'us-east', 'dc1', 140),
    (now(), 201, 'us-west', 'dc1', 85),
    (now(), 301, 'eu-central', 'dc2', 135);
```

让我们再来检查一次数据中心级别的性能。请注意，整个聚合链是如何自动更新的：

```sql
SELECT
    datacenter,
    avgMerge(avg_response_time) AS avg_response_ms
FROM datacenter_performance
GROUP BY datacenter
ORDER BY datacenter;
```

```response
┌─datacenter─┬────avg_response_ms─┐
│ dc1        │ 112.85714285714286 │
│ dc2        │                145 │
└────────────┴────────────────────┘
```


## 另请参阅 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
