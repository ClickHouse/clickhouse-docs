---
title: '在 ClickHouse 中处理 JSON'
sidebar_label: '处理 JSON'
slug: /integrations/clickpipes/mongodb/quickstart
description: '通过 ClickPipes 将 MongoDB 中的数据复制到 ClickHouse 时处理 JSON 数据的常见模式'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

# 在 ClickHouse 中处理 JSON {#working-with-json-in-clickhouse}

本指南介绍了通过 ClickPipes 从 MongoDB 复制到 ClickHouse 的 JSON 数据的常见处理模式。

假设我们在 MongoDB 中创建了一个名为 `t1` 的集合，用于跟踪客户订单：

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

MongoDB CDC 连接器使用原生 JSON 数据类型将 MongoDB 文档复制到 ClickHouse 中。ClickHouse 中复制后的表 `t1` 将包含以下一行：

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## 表结构 {#table-schema}

这些复制表使用以下标准表结构：

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

* `_id`: 来自 MongoDB 的主键
* `doc`: 作为 JSON 数据类型复制的 MongoDB 文档
* `_peerdb_synced_at`: 记录该行最近一次同步的时间
* `_peerdb_version`: 跟踪该行的版本；当该行被更新或删除时递增
* `_peerdb_is_deleted`: 标记该行是否已被删除

### ReplacingMergeTree 表引擎 {#replacingmergetree-table-engine}

ClickPipes 使用 `ReplacingMergeTree` 表引擎族将 MongoDB 集合映射为 ClickHouse 中的表。使用该引擎时，更新会被建模为插入一条具有更高版本（`_peerdb_version`）的新文档记录（针对给定主键 `_id`），从而能够以版本化插入的方式高效处理更新、替换和删除操作。

`ReplacingMergeTree` 会在后台异步清理重复数据。要确保同一行不存在重复记录，请使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)。例如：

```sql
SELECT * FROM t1 FINAL;
```

### 处理删除操作 {#handling-deletes}

来自 MongoDB 的删除操作会以新行的形式传播，这些行会在 `_peerdb_is_deleted` 列中被标记为已删除。通常你会希望在查询中过滤掉这些行：

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

你也可以创建行级策略，从而自动过滤已删除的行，而不必在每个查询中都指定过滤条件：

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## 查询 JSON 数据 {#querying-json-data}

你可以直接使用点语法查询 JSON 字段：

```sql title="Query"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="Result"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

在使用点号语法查询 *嵌套对象字段* 时，请务必添加 [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 运算符：

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic 类型 {#dynamic-type}

在 ClickHouse 中，JSON 的每个字段都是 `Dynamic` 类型。Dynamic 类型允许 ClickHouse 在事先不知道具体类型的情况下存储任意类型的值。可以使用 `toTypeName` 函数进行验证：

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

要查看某个字段的实际数据类型，可以使用 `dynamicType` 函数。请注意，在不同行中，同一字段名可能对应不同的数据类型：

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[Regular functions](https://clickhouse.com/docs/sql-reference/functions/regular-functions) 在处理 Dynamic 类型时的行为与处理常规列时相同：

**示例 1：日期解析**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**示例 2：条件逻辑**

```sql title="Query"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="Result"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**示例 3：数组操作**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### 字段类型转换 {#field-casting}

ClickHouse 中的[聚合函数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)不能直接作用于 `dynamic` 类型。例如，如果你尝试在 `dynamic` 类型上直接使用 `sum` 函数，会收到如下错误：

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

要使用聚合函数，请使用 `CAST` 函数或 `::` 语法将字段转换为正确的类型：

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
从 dynamic 类型转换为其底层数据类型（由 `dynamicType` 决定）的操作非常高效，因为 ClickHouse 在内部已经以其底层类型存储了该值。
:::

## 展平 JSON {#flattening-json}

### 普通视图 {#normal-view}

可以在 JSON 表之上创建普通视图，用于封装展平、类型转换和转换逻辑，从而以类似关系型表的方式查询数据。普通视图是轻量级的，因为它们只存储查询本身，而不存储底层数据。例如：

```sql
CREATE VIEW v1 AS
SELECT
    CAST(doc._id, 'String') AS object_id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

该视图将具有以下结构：

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

现在你可以像查询扁平化表一样查询该视图：

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

### 可刷新物化视图 {#refreshable-materialized-view}

可以创建[可刷新物化视图](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)，通过定期调度执行查询，对行进行去重，并将结果存储到一个扁平化的目标表中。每次按计划刷新时，目标表都会被最新的查询结果替换。

这种方法的关键优势在于，使用 `FINAL` 关键字的查询仅在刷新过程中执行一次，因此后续针对目标表的查询无需再使用 `FINAL`。

其缺点是，目标表中的数据最多只能更新到最近一次刷新的时间点。对于许多使用场景而言，从几分钟到几小时不等的刷新间隔，能够在数据新鲜度和查询性能之间取得较好的平衡。

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

CREATE MATERIALIZED VIEW rmv REFRESH EVERY 1 HOUR TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

现在，您可以直接查询表 `flattened_t1`，而无需加上 `FINAL` 修饰符：

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

### 增量物化视图 {#incremental-materialized-view}

如果希望实时访问已扁平化的列，可以创建[增量物化视图](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)。如果表存在频繁更新，则不建议在物化视图中使用 `FINAL` 修饰符，因为每次更新都会触发一次合并操作。相反，可以在该物化视图之上构建一个普通视图，在查询时对数据进行去重。

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic,
    `_peerdb_version` Int64,
    `_peerdb_synced_at` DateTime64(9),
    `_peerdb_is_deleted` Int8
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW imv TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items,
    _peerdb_version,
    _peerdb_synced_at,   
    _peerdb_is_deleted
FROM t1;

CREATE VIEW flattened_t1_final AS
SELECT * FROM flattened_t1 FINAL WHERE _peerdb_is_deleted = 0;
```

现在可以按如下方式查询视图 `flattened_t1_final`：

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1_final
AND shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```
