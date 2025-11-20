---
title: '在 ClickHouse 中处理 JSON'
sidebar_label: '处理 JSON'
slug: /integrations/clickpipes/mongodb/quickstart
description: '通过 ClickPipes 将来自 MongoDB 的 JSON 数据复制到 ClickHouse 后进行处理的常见模式'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# 在 ClickHouse 中处理 JSON

本指南介绍了通过 ClickPipes 将 MongoDB 中的 JSON 数据复制到 ClickHouse 时的一些常见使用模式。

假设我们在 MongoDB 中创建了一个集合 `t1` 来跟踪客户订单：

```javascript
db.t1.insertOne({
  "order_id": "ORD-001234",
  "customer_id": 98765,
  "status": "已完成",
  "total_amount": 299.97,
  "order_date": new Date(),
  "shipping": {
    "method": "快递",
    "city": "Seattle",
    "cost": 19.99
  },
  "items": [
    {
      "category": "电子产品",
      "price": 149.99
    },
    {
      "category": "配件",
      "price": 24.99
    }
  ]
})
```

MongoDB CDC 连接器使用原生 JSON 数据类型将 MongoDB 文档复制到 ClickHouse。ClickHouse 中复制得到的表 `t1` 将包含如下行：

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

复制表使用以下标准结构：

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`：来自 MongoDB 的主键
- `doc`：以 JSON 数据类型复制的 MongoDB 文档
- `_peerdb_synced_at`：记录行最后一次同步的时间
- `_peerdb_version`：跟踪行的版本；当行被更新或删除时递增
- `_peerdb_is_deleted`：标记行是否已删除

### ReplacingMergeTree 表引擎 {#replacingmergetree-table-engine}

ClickPipes 使用 `ReplacingMergeTree` 表引擎系列将 MongoDB 集合映射到 ClickHouse 中。使用此引擎时，更新操作被建模为针对给定主键（`_id`）插入文档的新版本（`_peerdb_version`），从而能够高效地将更新、替换和删除操作作为版本化插入来处理。

`ReplacingMergeTree` 在后台异步清除重复项。要保证同一行不存在重复项，请使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)。例如：

```sql
SELECT * FROM t1 FINAL;
```

### 处理删除操作 {#handling-deletes}

来自 MongoDB 的删除操作会作为新行传播，并使用 `_peerdb_is_deleted` 列标记为已删除。通常您需要在查询中过滤掉这些行：

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

您也可以创建行级策略来自动过滤已删除的行，而无需在每个查询中指定过滤条件：

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```


## 查询 JSON 数据 {#querying-json-data}

您可以使用点语法直接查询 JSON 字段:

```sql title="查询"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="结果"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

使用点语法查询_嵌套对象字段_时,请确保添加 [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 运算符:

```sql title="查询"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="结果"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic 类型 {#dynamic-type}

在 ClickHouse 中,JSON 的每个字段都是 `Dynamic` 类型。Dynamic 类型允许 ClickHouse 存储任意类型的值,无需预先知道类型。您可以使用 `toTypeName` 函数验证:

```sql title="查询"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="结果"
┌─type────┐
│ Dynamic │
└─────────┘
```

要检查字段的底层数据类型,可以使用 `dynamicType` 函数。请注意,不同行中的同一字段名可能具有不同的数据类型:

```sql title="查询"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="结果"
┌─type──┐
│ Int64 │
└───────┘
```

[常规函数](https://clickhouse.com/docs/sql-reference/functions/regular-functions)对 Dynamic 类型的处理方式与常规列相同:

**示例 1: 日期解析**

```sql title="查询"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="结果"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**示例 2: 条件逻辑**

```sql title="查询"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="结果"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**示例 3: 数组操作**

```sql title="查询"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="结果"
┌─item_count─┐
│          2 │
└────────────┘
```

### 字段类型转换 {#field-casting}

ClickHouse 中的[聚合函数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)不能直接用于 Dynamic 类型。例如,如果您尝试直接对 Dynamic 类型使用 `sum` 函数,将会得到以下错误:

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

要使用聚合函数,请使用 `CAST` 函数或 `::` 语法将字段转换为相应的类型:

```sql title="查询"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="结果"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
从 Dynamic 类型转换为底层数据类型(由 `dynamicType` 确定)性能非常高,因为 ClickHouse 内部已经以底层类型存储该值。
:::


## 展平 JSON {#flattening-json}

### 普通视图 {#normal-view}

您可以在 JSON 表之上创建普通视图,以封装展平/类型转换/转换逻辑,从而像查询关系表一样查询数据。普通视图是轻量级的,因为它们只存储查询本身,而不存储底层数据。例如:

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

此视图将具有以下结构:

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

现在您可以像查询展平表一样查询该视图:

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

您可以创建[可刷新物化视图](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view),它使您能够调度查询执行以去重行并将结果存储在展平的目标表中。每次按计划刷新时,目标表都会被最新的查询结果替换。

此方法的关键优势在于使用 `FINAL` 关键字的查询仅在刷新期间运行一次,从而无需在目标表的后续查询中使用 `FINAL`。

缺点是目标表中的数据仅与最近一次刷新时一样新。对于许多用例,从几分钟到几小时的刷新间隔在数据新鲜度和查询性能之间提供了良好的平衡。

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

现在您可以直接查询表 `flattened_t1` 而无需使用 `FINAL` 修饰符:

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

如果您想实时访问展平的列,可以创建[增量物化视图](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)。如果您的表有频繁的更新,不建议在物化视图中使用 `FINAL` 修饰符,因为每次更新都会触发合并。相反,您可以通过在物化视图之上构建普通视图来在查询时对数据进行去重。


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
