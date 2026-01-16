---
description: '详细介绍 ClickHouse 查询分析器的页面'
keywords: ['分析器']
sidebar_label: '分析器'
slug: /operations/analyzer
title: '分析器'
doc_type: 'reference'
---

# 分析器 \\{#analyzer\\}

在 ClickHouse `24.3` 版本中，新的查询分析器默认启用。
您可以在[此处](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)阅读其工作原理的更多细节。

## 已知不兼容项 \\{#known-incompatibilities\\}

尽管修复了大量 bug 并引入了新的优化，但这也对 ClickHouse 的行为带来了一些不兼容的变更。请阅读以下变更说明，以确定如何为新的 analyzer 重写你的查询。

### 无效查询不再被优化 \\{#invalid-queries-are-no-longer-optimized\\}

之前的查询规划架构会在查询验证步骤之前应用 AST 级别的优化。
这些优化可能将初始查询改写为有效且可执行的形式。

在新的 analyzer 中，查询验证发生在优化步骤之前。
这意味着此前仍然可以执行的无效查询，现在将不再被支持。
在这种情况下，必须手动修正查询。

#### 示例 1 \{#example-1\}

下面的查询在投影列表中使用了列 `number`，但在聚合之后只有 `toString(number)` 可用。
在旧的 analyzer 中，`GROUP BY toString(number)` 会被优化为 `GROUP BY number,`，从而使查询变为有效。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```


#### 示例 2 \{#example-2\}

在这个查询中也会出现相同的问题。列 `number` 在与另一个键一起聚合之后被使用。
之前的查询分析器通过将 `number > 5` 过滤条件从 `HAVING` 子句移动到 `WHERE` 子句来修复这个查询。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

要修正该查询，你应该将所有适用于非聚合列的条件移到 `WHERE` 子句中，以符合标准 SQL 语法：

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```


### 使用无效查询的 `CREATE VIEW` \\{#create-view-with-invalid-query\\}

新的分析器始终会执行类型检查。
此前，可以使用无效的 `SELECT` 查询创建一个 `VIEW`。
然后它会在第一次执行 `SELECT` 或 `INSERT` 时失败（对于 `MATERIALIZED VIEW` 也是如此）。

现在不再允许以这种方式创建 `VIEW`。

#### 示例 \{#example-view\}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```


### 关于 `JOIN` 子句的已知不兼容项 \\{#known-incompatibilities-of-the-join-clause\\}

#### 使用投影中的列进行 `JOIN` \{#join-using-column-from-projection\}

默认情况下，来自 `SELECT` 列表的别名不能用作 `JOIN USING` 的键。

有一个新的设置 `analyzer_compatibility_join_using_top_level_identifier`，启用后会改变 `JOIN USING` 的行为，在解析标识符时，将优先基于 `SELECT` 查询投影列表中的表达式，而不是直接使用左表中的列。

例如：

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

将 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时，连接条件会被解释为 `t1.a + 1 = t2.b`，这与早期版本的行为一致。
结果将会是 `2, 'two'`。
当该设置为 `false` 时，连接条件默认为 `t1.b = t2.b`，查询将返回 `2, 'one'`。
如果 `t1` 中不存在 `b`，查询将失败并报错。


#### 使用 `JOIN USING` 与 `ALIAS`/`MATERIALIZED` 列时的行为变化 \{#changes-in-behavior-with-join-using-and-aliasmaterialized-columns\}

在新的 analyzer 中，在包含 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中使用 `*` 时，这些列默认会包含在结果集中。

例如：

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

在新的 analyzer 中，该查询的结果将包含两个表中的 `id` 列以及 `payload` 列。
相比之下，先前的 analyzer 只有在启用了特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）时才会包含这些 `ALIAS` 列，
并且这些列可能会以不同的顺序出现。

为了确保结果一致且符合预期，尤其是在将旧查询迁移到新的 analyzer 时，建议在 `SELECT` 子句中显式指定列，而不是使用 `*`。


#### 在 `USING` 子句中对列表达式类型修饰符的处理 \{#handling-of-type-modifiers-for-columns-in-using-clause\}

在新版本的分析器中，用于确定 `USING` 子句中指定列的公共超类型的规则已被统一，以产生更加可预测的结果，
尤其是在处理 `LowCardinality` 和 `Nullable` 等类型修饰符时。

* `LowCardinality(T)` 和 `T`：当类型为 `LowCardinality(T)` 的列与类型为 `T` 的列进行联接时，得到的公共超类型将是 `T`，`LowCardinality` 修饰符会被舍弃。
* `Nullable(T)` 和 `T`：当类型为 `Nullable(T)` 的列与类型为 `T` 的列进行联接时，得到的公共超类型将是 `Nullable(T)`，从而确保可为空属性被保留。

例如：

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

在此查询中，`id` 的共同超类型被确定为 `String`，同时舍弃 `t1` 上的 `LowCardinality` 修饰符。


### 投影列名的变化 \{#projection-column-names-changes\}

在计算投影的列名时，不会替换别名。

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


### 不兼容的函数参数类型 \{#incompatible-function-arguments-types\}

在新的分析器中，会在初始查询分析阶段执行类型推断。
这意味着类型检查会在短路求值之前进行；因此，`if` 函数的参数必须始终具有一个公共超类型。

例如，下面的查询会失败，并报错 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```


### 异构集群 \\{#heterogeneous-clusters\\}

新的 analyzer 显著改变了集群中服务器之间的通信协议。因此，无法在 `enable_analyzer` 设置值不同的服务器上运行分布式查询。

### 变更语句仍由旧版 analyzer 解析 \\{#mutations-are-interpreted-by-previous-analyzer\\}

变更语句（mutations）仍然使用旧版 analyzer 进行解析。
这意味着某些新的 ClickHouse SQL 功能目前无法用于变更语句中。例如，`QUALIFY` 子句。
可以在[这里](https://github.com/ClickHouse/ClickHouse/issues/61563)查看当前状态。

### 不支持的功能 \\{#unsupported-features\\}

当前新 analyzer 尚不支持的功能列表如下：

- Annoy 索引。
- Hypothesis 索引。支持仍在开发中，[见此处](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 不支持 Window View。未来也没有支持的计划。

## Cloud Migration \\{#cloud-migration\\}

我们正在为当前仍禁用新查询分析器的所有实例启用该功能，以支持新的特性和性能优化。此变更将强制执行更严格的 SQL 作用域规则，要求用户手动更新不符合规范的查询。

### 迁移流程 \{#migration-workflow\}

1. 通过在 `system.query_log` 中使用 `normalized_query_hash` 进行过滤来定位该查询：

```sql
SELECT query 
FROM clusterAllReplicas(default, system.query_log)
WHERE normalized_query_hash='{hash}' 
LIMIT 1 
SETTINGS skip_unavailable_shards=1
```

2. 启用 Analyzer 后，通过添加以下设置来运行该查询。

```sql
SETTINGS
    enable_analyzer=1,
    analyzer_compatibility_join_using_top_level_identifier=1
```

3. 重构并验证查询结果，确保其与禁用分析器时生成的输出一致。

请参考我们在内部测试过程中遇到的最常见不兼容性问题。


### 未知表达式标识符 \\{#unknown-expression-identifier\\}

错误：`Unknown expression identifier ... in scope ... (UNKNOWN_IDENTIFIER)`。异常代码：47

原因：依赖非标准、宽松历史行为的查询（例如在过滤条件中引用计算出的别名、存在歧义的子查询投影，或“动态”的 CTE 作用域）现在会被正确识别为无效并立即拒绝。   

解决方案：按如下方式更新你的 SQL 写法：

- 过滤逻辑：如果是对结果集进行过滤，将逻辑从 WHERE 移到 HAVING；如果是对源数据进行过滤，则在 WHERE 中重复该表达式。
- 子查询作用域：在子查询中显式选出外层查询所需的所有列。
- JOIN 键：如果键是别名，则在 ON 中使用完整表达式，而不是 USING。
- 在外层查询中，应引用子查询 / CTE 本身的别名，而不是引用其内部的表。

### GROUP BY 中的非聚合列 \{#non-aggregated-columns-in-group-by\}

错误：`Column ... is not under aggregate function and not in GROUP BY keys (NOT_AN_AGGREGATE)`。异常代码：215

原因：旧的 analyzer 允许在 SELECT 中引用未出现在 GROUP BY 子句中的列（通常会选取任意值）。新的 analyzer 遵循标准 SQL：SELECT 列表中的每一列必须要么是聚合列，要么是分组键。

解决方法：将该列包裹在 `any()`、`argMax()` 等聚合函数中，或将其添加到 GROUP BY 中。

```sql
/* ORIGINAL QUERY */
-- device_id is ambiguous
SELECT user_id, device_id FROM table GROUP BY user_id

/* FIXED QUERY */
SELECT user_id, any(device_id) FROM table GROUP BY user_id
-- OR
SELECT user_id, device_id FROM table GROUP BY user_id, device_id
```


### 重复的 CTE 名称 \{#duplicate-cte-names\}

错误：`CTE with name ... already exists (MULTIPLE_EXPRESSIONS_FOR_ALIAS)`。异常代码：179

原因：旧的分析器允许定义多个具有相同名称的公共表表达式（WITH ...），后定义的会遮蔽先前的。而新的分析器为避免这种歧义，禁止出现同名的 CTE。

解决方案：将重复的 CTE 重命名为唯一名称。

```sql
/* ORIGINAL QUERY */
WITH 
  data AS (SELECT 1 AS id), 
  data AS (SELECT 2 AS id) -- Redefined
SELECT * FROM data;

/* FIXED QUERY */
WITH 
  raw_data AS (SELECT 1 AS id), 
  processed_data AS (SELECT 2 AS id)
SELECT * FROM processed_data;
```


### 有歧义的列标识符 \{#ambiguous-column-identifiers\}

错误：`JOIN [JOIN TYPE] ambiguous identifier ... (AMBIGUOUS_IDENTIFIER)` 异常代码：207

原因：查询在 `JOIN` 中引用了一个在多个表中都存在的列名，但没有指定所属的源表。旧的分析器通常会基于内部逻辑猜测列，而新的分析器则要求显式指定名称。

解决方案：使用 `table_alias.column_name` 的形式对列进行完全限定。

```sql
/* ORIGINAL QUERY */
SELECT table1.ID AS ID FROM table1, table2 WHERE ID...

/* FIXED QUERY */
SELECT table1.ID AS ID_RENAMED FROM table1, table2 WHERE ID_RENAMED...
```


### FINAL 的无效使用 \{#invalid-usage-of-final\}

错误：`Table expression modifiers FINAL are not supported for subquery...` 或 `Storage ... doesn't support FINAL` (`UNSUPPORTED_METHOD`)。异常代码：1, 181

原因：FINAL 是用于表存储引擎（特别是 [Shared]ReplacingMergeTree）的修饰符。新的 analyzer 会在以下情况下拒绝使用 FINAL：

* 子查询或派生表（例如：FROM (SELECT ...) FINAL）。
* 不支持 FINAL 的表引擎（例如：SharedMergeTree）。

解决方案：仅在子查询内部的源表上使用 FINAL；如果引擎不支持 FINAL，则移除该修饰符。

```sql
/* ORIGINAL QUERY */
SELECT * FROM (SELECT * FROM my_table) AS subquery FINAL ...

/* FIXED QUERY */
SELECT * FROM (SELECT * FROM my_table FINAL) AS subquery ...
```


### `countDistinct()` 函数大小写敏感性问题 \\{#countdistinct-case-insensitivity\\}

错误：`Function with name countdistinct does not exist (UNKNOWN_FUNCTION)`。异常代码：46

原因：在新的 analyzer 中，函数名区分大小写并且采用严格映射。`countdistinct`（全小写）不再会被自动解析。

解决方法：使用标准的 `countDistinct`（camelCase）或 ClickHouse 特有的 `uniq`。