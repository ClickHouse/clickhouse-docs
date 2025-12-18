---
slug: '/examples/aggregate-function-combinators/avgState'
title: 'avgState'
description: 'avgState 组合器使用示例'
keywords: ['avg', '状态', '组合器', '示例', 'avgState']
sidebar_label: 'avgState'
doc_type: 'reference'
---

# avgState {#avgState}

## 描述 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) 组合器
可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg)
函数，用于生成 `AggregateFunction(avg, T)` 类型的中间状态，其中
`T` 是指定的平均值类型。

## 示例用法 {#example-usage}

在这个示例中，我们将演示如何将 `AggregateFunction` 类型与 `avgState` 函数结合使用来聚合网站流量数据。

首先创建网站流量数据的源表：

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Page response time in milliseconds
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

创建用于存储平均响应时间的汇总表。请注意，`avg` 不能使用 `SimpleAggregateFunction` 类型，因为它需要维护更复杂的状态（求和与计数）。因此我们使用 `AggregateFunction` 类型：

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Stores the state needed for avg calculation
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

创建一个增量物化视图，使其在有新数据插入时充当触发器，并将中间状态数据存储到前面定义的目标表中：

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Using -State combinator
FROM raw_page_views
GROUP BY page_id, page_name;
```

向源表插入一些初始数据，从而在磁盘上生成一个数据部分（part）：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

再写入一些数据，以在磁盘上创建第二个数据分片：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

查看目标表 `page_performance`：

```sql
SELECT 
    page_id,
    page_name,
    avg_response_time,
    toTypeName(avg_response_time)
FROM page_performance
```

```response
┌─page_id─┬─page_name─┬─avg_response_time─┬─toTypeName(avg_response_time)──┐
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Contact   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

请注意，`avg_response_time` 列的类型是 `AggregateFunction(avg, UInt32)`，
它存储的是中间状态信息。还要注意，`avg_response_time` 的行数据对我们
没有用处，并且我们会看到一些奇怪的文本字符，比如 `�, n, F, }`。这是终端
试图将二进制数据按文本形式显示造成的结果。造成这种情况的原因是，`AggregateFunction` 类型以
二进制格式存储其状态，该格式经过优化以实现高效存储和计算，而不是为了
便于人类阅读。这个二进制状态包含了计算平均值所需的全部信息。

要利用它，请使用 `Merge` 组合器：

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

现在我们得到了正确的平均值：

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 另请参阅 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
