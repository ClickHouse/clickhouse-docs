---
'title': '在 ClickHouse 中处理 JSON'
'sidebar_label': '处理 JSON'
'slug': '/integrations/clickpipes/mongodb/quickstart'
'description': '从 MongoDB 通过 ClickPipes 复制到 ClickHouse 的 JSON 数据的常见模式'
'doc_type': 'guide'
---


# 在 ClickHouse 中使用 JSON

本指南提供了从 MongoDB 通过 ClickPipes 复制到 ClickHouse 的 JSON 数据的常见模式。

假设我们在 MongoDB 中创建了一个集合 `t1` 来跟踪客户订单：

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

MongoDB CDC Connector 使用原生 JSON 数据类型将 MongoDB 文档复制到 ClickHouse。 在 ClickHouse 中复制的表 `t1` 将包含以下行：

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## 表模式 {#table-schema}

复制的表使用以下标准模式：

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: 来自 MongoDB 的主键
- `doc`: 作为 JSON 数据类型复制的 MongoDB 文档
- `_peerdb_synced_at`: 记录最后一次同步行的时间
- `_peerdb_version`: 跟踪行的版本；在行被更新或删除时递增
- `_peerdb_is_deleted`: 标记行是否已删除

### ReplacingMergeTree 表引擎 {#replacingmergetree-table-engine}

ClickPipes 使用 `ReplacingMergeTree` 表引擎系列将 MongoDB 集合映射到 ClickHouse。 使用此引擎，更新被建模为插入具有更新版本 (`_peerdb_version`) 的文档，用于给定的主键 (`_id`)，使得针对版本化插入的更新、替换和删除能够高效处理。

`ReplacingMergeTree` 会在后台异步清除重复项。 为了确保同一行没有重复项，请使用 [`FINAL` modifier](/sql-reference/statements/select/from#final-modifier)。例如：

```sql
SELECT * FROM t1 FINAL;
```

### 处理删除 {#handling-deletes}

来自 MongoDB 的删除操作以使用 `_peerdb_is_deleted` 列标记为已删除的新行传播。 您通常希望在查询中过滤掉这些行：

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

您还可以创建行级策略以自动过滤掉已删除的行，而不是在每个查询中指定过滤器：

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## 查询 JSON 数据 {#querying-json-data}

您可以使用点语法直接查询 JSON 字段：

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

当使用点语法查询 _嵌套对象字段_ 时，请确保添加 [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 运算符：

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### 动态类型 {#dynamic-type}

在 ClickHouse 中，JSON 中的每个字段都有 `Dynamic` 类型。 动态类型允许 ClickHouse 存储任何类型的值，而无需提前知道类型。 您可以使用 `toTypeName` 函数验证这一点：

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

要检查字段的底层数据类型，可以使用 `dynamicType` 函数。 请注意，在不同的行中，同一字段名称可以具有不同的数据类型：

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[常规函数](https://clickhouse.com/docs/sql-reference/functions/regular-functions) 适用于动态类型，就像它们适用于常规列一样：

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

[聚合函数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators) 在 ClickHouse 中无法直接与动态类型一起使用。 例如，如果您尝试直接在动态类型上使用 `sum` 函数，您将获得以下错误：

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

要使用聚合函数，请通过 `CAST` 函数或 `::` 语法将字段转换为适当的类型：

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
从动态类型转换为底层数据类型（由 `dynamicType` 决定）是非常高效的，因为 ClickHouse 已经在其内部以底层类型存储值。
:::

## 扁平化 JSON {#flattening-json}

### 正常视图 {#normal-view}

您可以在 JSON 表上创建正常视图，以封装扁平化/转换逻辑，以便像查询关系表一样查询数据。 正常视图是轻量级的，因为它们仅存储查询本身，而不存储底层数据。 例如：

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

此视图将具有以下模式：

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

您现在可以像查询扁平化表一样查询该视图：

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

### 可刷新的物化视图 {#refreshable-materialized-view}

您可以创建 [可刷新的物化视图](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)，这些视图使您能够安排查询执行以去重行，并将结果存储在扁平化目标表中。 每次安排的刷新时，目标表将被最新的查询结果替换。

此方法的一个主要优势是使用 `FINAL` 关键字的查询在刷新期间只运行一次，从而消除了在目标表上使用 `FINAL` 的后续查询的需要。

一个缺点是目标表中的数据仅在最近刷新时是最新的。 对于许多用例，几分钟到几小时的刷新间隔在数据新鲜度和查询性能之间提供了良好的平衡。

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

您现在可以直接查询表 `flattened_t1` 而无需 `FINAL` 修饰符：

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

如果您想实时访问扁平化列，您可以创建 [增量物化视图](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)。 如果您的表有频繁更新，不推荐在物化视图中使用 `FINAL` 修饰符，因为每次更新都会触发合并。 相反，您可以通过在物化视图上构建正常视图在查询时去重数据。

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

您现在可以按如下方式查询视图 `flattened_t1_final`：

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
