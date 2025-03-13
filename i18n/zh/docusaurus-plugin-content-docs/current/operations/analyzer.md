---
slug: /operations/analyzer
sidebar_label: 分析器
title: 分析器
description: 关于 ClickHouse 的查询分析器的详细信息
keywords: ['analyzer']
---


# 分析器

## 已知的不兼容性 {#known-incompatibilities}

在 ClickHouse 版本 `24.3` 中，新查询分析器默认启用。尽管修复了许多错误并引入了新的优化，但它也引入了一些 ClickHouse 行为的破坏性变化。请阅读以下更改，以确定如何重新编写查询以适应新的分析器。

### 无效查询不再被优化 {#invalid-queries-are-no-longer-optimized}

之前的查询规划基础设施在查询验证步骤之前应用了 AST 级的优化。优化可以重写初始查询，使其变得有效并可以执行。

在新的分析器中，查询验证在优化步骤之前进行。这意味着之前可以执行的无效查询现在不再受支持。在这种情况下，查询必须手动修复。

**示例 1:**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

以下查询在投影列表中使用 `number` 列，而在聚合后仅有 `toString(number)` 可用。在旧分析器中，`GROUP BY toString(number)` 被优化为 `GROUP BY number`，从而使查询有效。

**示例 2:**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

此查询中出现同样的问题：在使用其他键聚合后，使用了列 `number`。之前的查询分析器通过将 `HAVING` 子句中的 `number > 5` 过滤器移动到 `WHERE` 子句来修复此查询。

为了修复查询，您应该将所有适用于非聚合列的条件移至 `WHERE` 部分，以符合标准 SQL 语法：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW 与无效查询 {#create-view-with-invalid-query}

新的分析器始终执行类型检查。之前，可以使用无效的 `SELECT` 查询创建一个 `VIEW`。然后，它将在第一次 `SELECT` 或 `INSERT`（在 `MATERIALIZED VIEW` 的情况下）时失败。

现在，不再可能创建这样的 `VIEW`。

**示例:**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 子句的已知不兼容性 {#known-incompatibilities-of-the-join-clause}

#### 使用投影中的列进行连接 {#join-using-column-from-projection}

默认情况下，`SELECT` 列表中的别名不能用作 `JOIN USING` 键。

新的设置 `analyzer_compatibility_join_using_top_level_identifier` 启用时，会改变 `JOIN USING` 的行为，优先根据 `SELECT` 查询的投影列表中表达式解析标识符，而不是直接使用左表中的列。

**示例:**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

当 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时，连接条件被解释为 `t1.a + 1 = t2.b`，与早期版本的行为一致。因此，结果将是 `2, 'two'`。当设置为 `false` 时，连接条件默认变为 `t1.b = t2.b`，查询将返回 `2, 'one'`。如果 `b` 在 `t1` 中不存在，查询将失败并出现错误。

#### 使用 `JOIN USING` 和 `ALIAS`/`MATERIALIZED` 列时的行为变化 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

在新的分析器中，在涉及 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中使用 `*` 默认会将这些列包含在结果集中。

**示例:**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

在新的分析器中，此查询的结果将包含来自两个表的 `payload` 列以及 `id`。相比之下，之前的分析器仅在启用了特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）时才会包含这些 `ALIAS` 列，且这些列可能会以不同的顺序出现。

为了确保一致且可预期的结果，特别是在将旧查询迁移到新分析器时，建议在 `SELECT` 子句中明确指定列，而不是使用 `*`。

#### 处理 `USING` 子句中列的类型修饰符 {#handling-of-type-modifiers-for-columns-in-using-clause}

在新的分析器版本中，确定 `USING` 子句中指定的列的共同超类型的规则已标准化，以产生更可预测的结果，尤其在处理 `LowCardinality` 和 `Nullable` 等类型修饰符时。

- `LowCardinality(T)` 和 `T`：当类型为 `LowCardinality(T)` 的列与类型为 `T` 的列连接时，结果共同超类型将为 `T`，有效地丢弃 `LowCardinality` 修饰符。

- `Nullable(T)` 和 `T`：当类型为 `Nullable(T)` 的列与类型为 `T` 的列连接时，结果共同超类型将为 `Nullable(T)`，确保保留可空属性。

**示例:**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

在此查询中，`id` 的共同超类型被确定为 `String`，从 `t1` 中丢弃了 `LowCardinality` 修饰符。

### 投影列名变化 {#projection-column-names-changes}

在计算投影名称时，别名不会被替换。

```sql
SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 0
FORMAT PrettyCompact

   ┌─x─┬─plus(plus(1, 1), 1)─┐
1. │ 2 │                   3 │
   └───┴─────────────────────┘

SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 1
FORMAT PrettyCompact

   ┌─x─┬─plus(x, 1)─┐
1. │ 2 │          3 │
   └───┴────────────┘
```

### 不兼容的函数参数类型 {#incompatible-function-arguments-types}

在新的分析器中，类型推断发生在初始查询分析期间。此更改意味着在短路评估之前会进行类型检查；因此，`if` 函数参数必须始终具有共同超类型。

**示例:**

以下查询因 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not` 而失败：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 异构集群 {#heterogeneous-clusters}

新的分析器显著改变了集群中服务器之间的通信协议。因此，无法在具有不同 `enable_analyzer` 设置值的服务器上运行分布式查询。

### 变更由先前的分析器解释 {#mutations-are-interpreted-by-previous-analyzer}

变更仍在使用旧分析器。这意味着某些新的 ClickHouse SQL 功能不能在变更中使用。例如，`QUALIFY` 子句。状态可以在 [这里](https://github.com/ClickHouse/ClickHouse/issues/61563) 检查。

### 不支持的功能 {#unsupported-features}

新分析器目前不支持的功能列表：

- Annoy 索引。
- 假设索引。工作进行中 [这里](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 窗口视图不受支持。未来不打算支持它。
