---
description: '介绍 ClickHouse 查询分析器的页面'
keywords: ['analyzer']
sidebar_label: '分析器'
slug: /operations/analyzer
title: '分析器'
doc_type: 'reference'
---



# Analyzer

在 ClickHouse `24.3` 版本中，新的查询分析器（Analyzer）默认已启用。
你可以在[此处](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)阅读其工作原理的更多详细信息。



## 已知不兼容性 {#known-incompatibilities}

尽管修复了大量错误并引入了新的优化功能,但同时也在 ClickHouse 行为中引入了一些破坏性变更。请阅读以下变更内容,以确定如何针对新分析器重写您的查询。

### 无效查询不再被优化 {#invalid-queries-are-no-longer-optimized}

先前的查询规划基础设施在查询验证步骤之前应用 AST 级别的优化。
优化过程可以将初始查询重写为有效且可执行的形式。

在新分析器中,查询验证在优化步骤之前进行。
这意味着以前可以执行的无效查询现在不再受支持。
在这种情况下,必须手动修复查询。

#### 示例 1 {#example-1}

以下查询在投影列表中使用列 `number`,而聚合后只有 `toString(number)` 可用。
在旧分析器中,`GROUP BY toString(number)` 被优化为 `GROUP BY number`,使查询有效。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 示例 2 {#example-2}

此查询中出现相同的问题。列 `number` 在使用另一个键进行聚合后被使用。
先前的查询分析器通过将 `number > 5` 过滤条件从 `HAVING` 子句移动到 `WHERE` 子句来修复此查询。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

要修复查询,您应该将所有应用于非聚合列的条件移动到 `WHERE` 部分,以符合标准 SQL 语法:

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 使用无效查询的 `CREATE VIEW` {#create-view-with-invalid-query}

新分析器始终执行类型检查。
以前,可以使用无效的 `SELECT` 查询创建 `VIEW`。
然后它会在第一次 `SELECT` 或 `INSERT`(在 `MATERIALIZED VIEW` 的情况下)时失败。

不再可能以这种方式创建 `VIEW`。

#### 示例 {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 子句的已知不兼容性 {#known-incompatibilities-of-the-join-clause}

#### 使用投影列的 `JOIN` {#join-using-column-from-projection}

默认情况下,`SELECT` 列表中的别名不能用作 `JOIN USING` 键。

新设置 `analyzer_compatibility_join_using_top_level_identifier` 启用后,会改变 `JOIN USING` 的行为,优先根据 `SELECT` 查询投影列表中的表达式解析标识符,而不是直接使用左表中的列。

例如:

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

当 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时,连接条件被解释为 `t1.a + 1 = t2.b`,与早期版本的行为一致。
结果将是 `2, 'two'`。
当设置为 `false` 时,连接条件默认为 `t1.b = t2.b`,查询将返回 `2, 'one'`。
如果 `t1` 中不存在 `b`,查询将失败并报错。

#### `JOIN USING` 与 `ALIAS`/`MATERIALIZED` 列的行为变更 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

在新分析器中,在涉及 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中使用 `*` 将默认在结果集中包含这些列。

例如:

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```


在新分析器中,此查询的结果将包含来自两个表的 `payload` 列和 `id` 列。

相比之下,旧分析器仅在启用特定设置(`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`)时才会包含这些 `ALIAS` 列,
且列可能以不同的顺序出现。

为确保获得一致且符合预期的结果,特别是在将旧查询迁移到新分析器时,建议在 `SELECT` 子句中显式指定列名,而不是使用 `*`。

#### `USING` 子句中列的类型修饰符处理 {#handling-of-type-modifiers-for-columns-in-using-clause}

在新版本的分析器中,用于确定 `USING` 子句中指定列的公共超类型的规则已经标准化,以产生更可预测的结果,
特别是在处理 `LowCardinality` 和 `Nullable` 等类型修饰符时。

- `LowCardinality(T)` 和 `T`:当类型为 `LowCardinality(T)` 的列与类型为 `T` 的列进行连接时,结果的公共超类型将是 `T`,即丢弃 `LowCardinality` 修饰符。
- `Nullable(T)` 和 `T`:当类型为 `Nullable(T)` 的列与类型为 `T` 的列进行连接时,结果的公共超类型将是 `Nullable(T)`,确保保留可空属性。

例如:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

在此查询中,`id` 的公共超类型被确定为 `String`,丢弃了来自 `t1` 的 `LowCardinality` 修饰符。

### 投影列名称变更 {#projection-column-names-changes}

在计算投影名称时,别名不会被替换。

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

在新分析器中,类型推断发生在初始查询分析阶段。
这一变化意味着类型检查在短路求值之前完成;因此,`if` 函数的参数必须始终具有公共超类型。

例如,以下查询失败并显示 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 异构集群 {#heterogeneous-clusters}

新分析器显著改变了集群中服务器之间的通信协议。因此,无法在具有不同 `enable_analyzer` 设置值的服务器上运行分布式查询。

### Mutation 由旧分析器解释 {#mutations-are-interpreted-by-previous-analyzer}

Mutation 仍在使用旧分析器。
这意味着某些新的 ClickHouse SQL 功能无法在 mutation 中使用。例如,`QUALIFY` 子句。
可以在[此处](https://github.com/ClickHouse/ClickHouse/issues/61563)查看状态。

### 不支持的功能 {#unsupported-features}

新分析器当前不支持的功能列表如下:

- Annoy 索引。
- Hypothesis 索引。正在进行的工作在[此处](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 不支持窗口视图。未来没有支持计划。
