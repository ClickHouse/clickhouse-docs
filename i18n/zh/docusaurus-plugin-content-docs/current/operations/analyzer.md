---
description: '详细介绍 ClickHouse 查询分析器的页面'
keywords: ['分析器']
sidebar_label: '分析器'
slug: /operations/analyzer
title: '分析器'
doc_type: 'reference'
---



# 分析器

在 ClickHouse `24.3` 版本中，新的查询分析器默认启用。
您可以在[此处](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)阅读其工作原理的更多细节。



## 已知不兼容项

尽管修复了大量 bug 并引入了新的优化，但这也对 ClickHouse 的行为带来了一些不兼容的变更。请阅读以下变更说明，以确定如何为新的 analyzer 重写你的查询。

### 无效查询不再被优化

之前的查询规划架构会在查询验证步骤之前应用 AST 级别的优化。
这些优化可能将初始查询改写为有效且可执行的形式。

在新的 analyzer 中，查询验证发生在优化步骤之前。
这意味着此前仍然可以执行的无效查询，现在将不再被支持。
在这种情况下，必须手动修正查询。

#### 示例 1

下面的查询在投影列表中使用了列 `number`，但在聚合之后只有 `toString(number)` 可用。
在旧的 analyzer 中，`GROUP BY toString(number)` 会被优化为 `GROUP BY number,`，从而使查询变为有效。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 示例 2

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

要更正该查询，你应将所有适用于非聚合列的条件移到 `WHERE` 子句中，以符合标准 SQL 语法：

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 使用无效查询的 `CREATE VIEW`

新的分析器始终会执行类型检查。
此前，可以使用无效的 `SELECT` 查询创建一个 `VIEW`。
然后它会在第一次执行 `SELECT` 或 `INSERT` 时失败（对于 `MATERIALIZED VIEW` 也是如此）。

现在不再允许以这种方式创建 `VIEW`。

#### 示例

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 子句的已知不兼容性

#### 使用投影中的列进行 `JOIN`

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

#### 使用 `JOIN USING` 与 `ALIAS`/`MATERIALIZED` 列时的行为变化

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


在新的分析器中，此查询的结果将包含两个表中的 `id` 列以及 `payload` 列。
相比之下，旧的分析器只有在启用了特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）时才会包含这些 `ALIAS` 列，
并且这些列的顺序可能会不同。

为确保结果一致且符合预期，尤其是在将旧查询迁移到新的分析器时，建议在 `SELECT` 子句中显式指定列，而不是使用 `*`。

#### 在 `USING` 子句中对列表达式类型修饰符的处理

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

在此查询中，`id` 的共同超类型被确定为 `String`，并丢弃来自 `t1` 的 `LowCardinality` 修饰符。

### 投影列名的变化

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

### 不兼容的函数参数类型

在新的分析器中，类型推断发生在初始查询分析阶段。
这一变更意味着类型检查会在短路求值之前进行；因此，`if` 函数的参数必须始终具有一个公共超类型。

例如，下面的查询会失败，并报错 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 异构集群

新的 analyzer 显著改变了集群中服务器之间的通信协议。因此，无法在 `enable_analyzer` 设置值不同的服务器上运行分布式查询。

### 变更语句仍由旧版 analyzer 解析

变更语句（mutations）仍然使用旧版 analyzer 进行解析。
这意味着某些新的 ClickHouse SQL 功能目前无法用于变更语句中。例如，`QUALIFY` 子句。
可以在[这里](https://github.com/ClickHouse/ClickHouse/issues/61563)查看当前状态。

### 不支持的功能

当前新 analyzer 尚不支持的功能列表如下：

* Annoy 索引。
* Hypothesis 索引。支持仍在开发中，[见此处](https://github.com/ClickHouse/ClickHouse/pull/48381)。
* 不支持 Window View。未来也没有支持的计划。
