---
title: 'Working with JSON in ClickHouse'
sidebar_label: 'Working with JSON'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'Common patterns for working with JSON data replicated from MongoDB to ClickHouse via ClickPipes'
doc_type: explanation
---

# Working with JSON in ClickHouse

This guide provides common patterns for working with JSON data replicated from MongoDB to ClickHouse via ClickPipes.

Suppose we created a collection `t1` in MongoDB to track customer orders:

```javascript
db.t1.insertOne({
  "order_id": "ORD-001234",
  "customer_id": 98765,
  "status": "completed",
  "total_amount": 299.97,
  "order_date": new Date(),
  "shipping": {
    "method": "express",
    "city": "Seattle",
    "cost": 19.99
  },
  "items": [
    {
      "category": "electronics",
      "price": 149.99
    },
    {
      "category": "accessories",
      "price": 24.99
    }
  ]
})
```

MongoDB CDC Connector replicates MongoDB documents to ClickHouse using the native JSON data type. The replicated table `t1` in ClickHouse will contain the following row:

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
_full_document:     {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## Table schema {#table-schema}

The replicated tables use this standard schema:

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ _full_document     │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: Primary key from MongoDB
- `_full_document`: MongoDB document replicated as JSON data type
- `_peerdb_synced_at`: Records when the row was last synced
- `_peerdb_version`: Tracks the version of the row; incremented when the row is updated or deleted
- `_peerdb_is_deleted`: Marks whether the row is deleted

### ReplacingMergeTree table engine {#replacingmergetree-table-engine}

ClickPipes maps MongoDB collections into ClickHouse using the `ReplacingMergeTree` table engine family. With this engine, updates are modeled as inserts with a newer version (`_peerdb_version`) of the document for a given primary key (`_id`), enabling efficient handling of updates, replaces, and deletes as versioned inserts. 

`ReplacingMergeTree` clears out duplicates asynchronously in the background. To guarantee the absence of duplicates for the same row, use the [`FINAL` modifier](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier). For example:

```sql
SELECT * FROM t1 FINAL;
```

### Handling deletes {#handling-deletes}

Deletes from MongoDB are propagated as new rows marked as deleted using the `_peerdb_is_deleted` column. You typically want to filter these out in your queries:

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

You can also create a row-level policy to automatically filter out deleted rows instead of specifying the filter in each query:

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## Querying JSON data {#querying-json-data}

You can directly query JSON fields using dot syntax:

```sql title="Query"
SELECT
    _full_document.order_id,
    _full_document.shipping.method
FROM t1;
```

```shell title="Result"
┌─_full_document.order_id─┬─_full_document.shipping.method─┐
│ ORD-001234              │ express                        │
└─────────────────────────┴────────────────────────────────┘
```

When querying _nested object fields_ using dot syntax, make sure to add the [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) operator:

```sql title="Query"
SELECT _full_document.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic type {#dynamic-type}

In ClickHouse, each field in JSON has `Dynamic` type. Dynamic type allows ClickHouse to store values of any type without knowing the type in advance. You can verify this with the `toTypeName` function:

```sql title="Query"
SELECT toTypeName(_full_document.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

To examine the underlying data type(s) for a field, you can check with the `dynamicType` function. Note that it's possible to have different data types for the same field name in different rows:

```sql title="Query"
SELECT dynamicType(_full_document.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[Regular functions](https://clickhouse.com/docs/sql-reference/functions/regular-functions) work for dynamic type just like they do for regular columns:

**Example 1: Date parsing**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(_full_document.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**Example 2: Conditional logic**

```sql title="Query"
SELECT multiIf(
    _full_document.total_amount < 100, 'less_than_100',
    _full_document.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="Result"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**Example 3: Array operations**

```sql title="Query"
SELECT length(_full_document.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### Field casting {#field-casting}

[Aggregation functions](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators) in ClickHouse don't work with dynamic type directly. For example, if you attempt to directly use the `sum` function on a dynamic type, you get the following error:

```sql
SELECT sum(_full_document.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

To use aggregation functions, cast the field to the appropriate type with the `CAST` function or `::` syntax:

```sql title="Query"
SELECT sum(_full_document.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
Casting from dynamic type to the underlying data type (determined by `dynamicType`) is very performant, as ClickHouse already stores the value in its underlying type internally.
:::

## Flattening JSON {#flattening-json}

### Normal view {#normal-view}

You can create normal views on top of the JSON table to encapsulate flattening/casting/transformation logic in order to query data similar to a relational table. Normal views are lightweight as they only store the query itself, not the underlying data. For example:

```sql
CREATE VIEW v1 AS
SELECT
    CAST(_full_document._id, 'String') AS object_id,
    CAST(_full_document.order_id, 'String') AS order_id,
    CAST(_full_document.customer_id, 'Int64') AS customer_id,
    CAST(_full_document.status, 'String') AS status,
    CAST(_full_document.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(_full_document.order_date, 3), 'DATETIME(3)') AS order_date,
    _full_document.^shipping AS shipping_info,
    _full_document.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

This view will have the following schema:

```shell
┌─name────────────┬─type───────────┐
│ object_id       │ String         │
│ order_id        │ String         │
│ customer_id     │ Int64          │
│ status          │ String         │
│ total_amount    │ Decimal(18, 2) │
│ order_date      │ DateTime64(3)  │
│ shipping_info   │ JSON           │
│ items           │ Dynamic        │
└─────────────────┴────────────────┘
```

You can now query the view similar to how you would query a flattened table:

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM v1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```

### Refreshable materialized view {#refreshable-materialized-view}

You can also create [Refreshable Materialized Views](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view), which enable you to schedule query execution for deduplicating rows and storing the results in a flattened destination table. With each scheduled refresh, the destination table is replaced with the latest query results.

The key advantage of this method is that the query using the `FINAL` keyword runs only once during the refresh, eliminating the need for subsequent queries on the destination table to use `FINAL`.

However, a drawback is that the data in the destination table is only as up-to-date as the most recent refresh. For many use cases, refresh intervals ranging from several minutes to a few hours provide a good balance between data freshness and query performance.

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW mv1 REFRESH EVERY 1 HOUR TO flattened_t1 AS
SELECT 
    CAST(_full_document._id, 'String') AS _id,
    CAST(_full_document.order_id, 'String') AS order_id,
    CAST(_full_document.customer_id, 'Int64') AS customer_id,
    CAST(_full_document.status, 'String') AS status,
    CAST(_full_document.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(_full_document.order_date, 3), 'DATETIME(3)') AS order_date,
    _full_document.^shipping AS shipping_info,
    _full_document.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

You can now query the table `flattened_t1` directly without the `FINAL` modifier:

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```
