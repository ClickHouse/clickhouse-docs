---
description: "The new setting allow_asynchronous_read_from_io_pool_for_merge_tree allows the number of reading threads (streams) to be higher than the number of threads in the rest of the query execution pipeline."
date: 2023-03-01
---

# Synchronous data reading

Normally the [max_threads](https://clickhouse.com/docs/en/operations/settings/settings/#settings-max_threads) setting [controls](https://clickhouse.com/company/events/query-performance-introspection) the number of parallel reading threads and parallel query processing threads:

![Untitled scene](https://user-images.githubusercontent.com/97666923/212138072-5410b684-d00d-4218-93c5-6f49523928a5.png)

The data is read 'in order', column after column, from disk.

### Asynchronous data reading
The new setting [allow_asynchronous_read_from_io_pool_for_merge_tree](https://github.com/ClickHouse/ClickHouse/pull/43260) allows the number of reading threads (streams) to be higher than the number of threads in the rest of the query execution pipeline to **speed up cold queries on low-CPU ClickHouse Cloud services**, and to **increase performance for I/O bound queries**.
When the setting is enabled, then the amount of reading threads is controlled by the [max_streams_for_merge_tree_reading](https://github.com/ClickHouse/ClickHouse/pull/43260) setting:

![Untitled scene](https://user-images.githubusercontent.com/97666923/212138124-82efba35-7948-4c16-8c44-cba5f0c5c5ae.png)

The data is read asynchronously, in parallel from different columns.

Note that there is also the [max_streams_to_max_threads_ratio](https://github.com/ClickHouse/ClickHouse/pull/43260) setting for configuring the ratio between the number of reading threads (streams) and the number of threads in the rest of the query execution pipeline. However, in benchmarks it did not help as much as the `max_streams_for_merge_tree_reading` setting

### What about optimize_read_in_order?

With the [optimize_read_in_order optimization](https://clickhouse.com/docs/en/sql-reference/statements/select/order-by/#optimization-of-data-reading), ClickHouse can [skip](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) resorting data in memory if the queries sort order reflects the physical order of data on disk, **but that requires reading the data in order (in contrast to asynchronous reading)**:

![Untitled scene](https://user-images.githubusercontent.com/97666923/212138180-1a4e29d5-43f1-4bfa-a1d6-df2824417508.png)

### optimize_read_in_order has precedence over asynchronous reading

When ClickHouse sees that `optimize_read_in_order optimization` can be applied, then the `allow_asynchronous_read_from_io_pool_for_merge_tree` setting will be ignored / disabled.

### Example demonstrating all of the above

- Create and load the [UK Property Price Paid table](https://clickhouse.com/docs/en/getting-started/example-datasets/uk-price-paid)

- Check set value of max_threads (by default the amount of CPU cores that ClickHouse sees on the node executing the query
```
SELECT getSetting('max_threads');


┌─getSetting('max_threads')─┐
│                        10 │
└───────────────────────────┘
```

- Check query pipeline with default amount of threads for both reading and processing the data
```
EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid;

┌─explain──────────────────────┐
│ (Expression)                 │
│ ExpressionTransform × 10     │
│   (ReadFromMergeTree)        │
│   MergeTreeThread × 10 0 → 1 │
└──────────────────────────────┘
```

- Check query pipeline with 60 async reading threads and default amount of threads for the rest of the query execution pipeline
```
EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
SETTINGS
    allow_asynchronous_read_from_io_pool_for_merge_tree = 1,
    max_streams_for_merge_tree_reading = 60;


┌─explain────────────────────────┐
│ (Expression)                   │
│ ExpressionTransform × 10       │
│   (ReadFromMergeTree)          │
│   Resize 60 → 10               │
│     MergeTreeThread × 60 0 → 1 │
└────────────────────────────────┘
```

- Check query pipeline with 20 threads for both reading and processing the data
```
EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
SETTINGS
    max_threads = 20;


┌─explain──────────────────────┐
│ (Expression)                 │
│ ExpressionTransform × 20     │
│   (ReadFromMergeTree)        │
│   MergeTreeThread × 20 0 → 1 │
└──────────────────────────────┘
```

- Check query pipeline with 60 async reading threads and 20 threads for the rest of the query execution pipeline
```
EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
SETTINGS
    max_threads = 20,
    allow_asynchronous_read_from_io_pool_for_merge_tree = 1,
    max_streams_for_merge_tree_reading = 60;


┌─explain────────────────────────┐
│ (Expression)                   │
│ ExpressionTransform × 20       │
│   (ReadFromMergeTree)          │
│   Resize 60 → 20               │
│     MergeTreeThread × 60 0 → 1 │
└────────────────────────────────┘
```

- Check query pipeline with 60 async reading threads and 20 threads for the rest of the query execution pipeline
when `optimize_read_in_order optimization` can be applied
```
EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
ORDER BY postcode1, postcode2
SETTINGS
    max_threads = 20,
    allow_asynchronous_read_from_io_pool_for_merge_tree= 1,
    max_streams_for_merge_tree_reading= 60;


┌─explain───────────────────────────┐
│ (Expression)                      │
│ ExpressionTransform               │
│   (Sorting)                       │
│   MergingSortedTransform 20 → 1   │
│     (Expression)                  │
│     ExpressionTransform × 20      │
│       (ReadFromMergeTree)         │
│       MergeTreeInOrder × 20 0 → 1 │
└───────────────────────────────────┘


-- note that this is equivalent to disabling allow_asynchronous_read_from_io_pool_for_merge_tree

EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
ORDER BY postcode1, postcode2
SETTINGS
    max_threads = 20,
    allow_asynchronous_read_from_io_pool_for_merge_tree = 0,
    max_streams_for_merge_tree_reading = 0;


┌─explain───────────────────────────┐
│ (Expression)                      │
│ ExpressionTransform               │
│   (Sorting)                       │
│   MergingSortedTransform 20 → 1   │
│     (Expression)                  │
│     ExpressionTransform × 20      │
│       (ReadFromMergeTree)         │
│       MergeTreeInOrder × 20 0 → 1 │
└───────────────────────────────────┘

-- note that you can enforce allow_asynchronous_read_from_io_pool_for_merge_tree by disabling optimize_read_in_order

EXPLAIN PIPELINE
SELECT *
FROM uk_price_paid
ORDER BY
    postcode1 ASC,
    postcode2 ASC
SETTINGS
    max_threads = 20,
    allow_asynchronous_read_from_io_pool_for_merge_tree = 1,
    max_streams_for_merge_tree_reading = 60,
    optimize_read_in_order = 0;


┌─explain──────────────────────────────┐
│ (Expression)                         │
│ ExpressionTransform                  │
│   (Sorting)                          │
│   MergingSortedTransform 20 → 1      │
│     MergeSortingTransform × 20       │
│       (Expression)                   │
│       ExpressionTransform × 20       │
│         (ReadFromMergeTree)          │
│         Resize 60 → 20               │
│           MergeTreeThread × 60 0 → 1 │
└──────────────────────────────────────┘


```

