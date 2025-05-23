---
'slug': '/examples/aggregate-function-combinators/avgState'
'title': 'avgState'
'description': '使用 avgState 组合器的示例'
'keywords':
- 'avg'
- 'state'
- 'combinator'
- 'examples'
- 'avgState'
'sidebar_label': 'avgState'
---


# avgState {#avgState}

## 描述 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，以生成 `AggregateFunction(avg, T)` 类型的中间状态，其中 `T` 是用于计算平均值的指定类型。

## 示例用法 {#example-usage}

在这个例子中，我们将看看如何使用 `AggregateFunction` 类型，以及 `avgState` 函数来聚合网站流量数据。

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

创建一个聚合表来存储平均响应时间。请注意，`avg` 不能使用 `SimpleAggregateFunction` 类型，因为它需要一个复杂的状态（一个总和和一个计数）。因此，我们使用 `AggregateFunction` 类型：

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

创建一个增量物化视图，它将作为新数据的插入触发器，并将中间状态数据存储在上述定义的目标表中：

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

向源表插入一些初始数据，在磁盘上创建一个分区片段：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

插入更多数据以在磁盘上创建第二个分区片段：

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

检查目标表 `page_performance`：

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

请注意，`avg_response_time` 列的类型为 `AggregateFunction(avg, UInt32)`，并存储中间状态信息。同样要注意，`avg_response_time` 的行数据对我们没有用处，我们看到一些奇怪的文本字符，比如 `�, n, F, }`。这是终端尝试将二进制数据显示为文本的结果。原因在于 `AggregateFunction` 类型以一种为高效存储和计算而优化的二进制格式存储其状态，而不是为了人类的可读性。这个二进制状态包含计算平均值所需的所有信息。

为了使用它，可以使用 `Merge` 组合器：

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

现在我们看到了正确的平均值：

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 另见 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
