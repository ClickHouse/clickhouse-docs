---
'description': '页面详细介绍 ClickHouse 查询分析器'
'keywords':
- 'analyzer'
'sidebar_label': '分析器'
'slug': '/operations/analyzer'
'title': '分析器'
'doc_type': 'reference'
---


# 分析器

在 ClickHouse 版本 `24.3` 中，新的查询分析器默认启用。
您可以在[这里](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)阅读关于其工作原理的更多细节。

## 已知的不兼容性 {#known-incompatibilities}

尽管修复了大量错误并引入了新的优化，但它也在 ClickHouse 的行为中引入了一些重大变化。请阅读以下更改，以确定如何重写您的查询以适应新的分析器。

### 无效查询不再被优化 {#invalid-queries-are-no-longer-optimized}

以前的查询规划基础设施在查询验证步骤之前进行了 AST 级别的优化。
优化可以将初始查询重写为有效且可执行的。

在新的分析器中，查询验证发生在优化步骤之前。
这意味着以前可以执行的无效查询现在不再受支持。
在这种情况下，必须手动修复查询。

#### 示例 1 {#example-1}

以下查询在投影列表中使用列 `number`，而在聚合后仅可用 `toString(number)`。
在旧分析器中，`GROUP BY toString(number)` 被优化为 `GROUP BY number,`，使查询有效。

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 示例 2 {#example-2}

同样的问题出现在此查询中。列 `number` 在与其他键聚合后被使用。
以前的查询分析器通过将 `HAVING` 子句中的 `number > 5` 过滤器移动到 `WHERE` 子句来修复此查询。

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

要修复查询，您应该将所有适用于非聚合列的条件移动到 `WHERE` 部分，以符合标准 SQL 语法：

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 用无效查询创建视图 {#create-view-with-invalid-query}

新的分析器始终执行类型检查。
以前，可以使用无效的 `SELECT` 查询创建 `VIEW`。
然后在第一次 `SELECT` 或 `INSERT`（在 `MATERIALIZED VIEW` 的情况下）时失败。

现在不再可能以这种方式创建 `VIEW`。

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

#### 使用投影中的列进行 `JOIN` {#join-using-column-from-projection}

默认情况下，不能将 `SELECT` 列表中的别名用作 `JOIN USING` 键。

新的设置 `analyzer_compatibility_join_using_top_level_identifier` 在启用时，改变了 `JOIN USING` 的行为，以优先根据 `SELECT` 查询的投影列表中的表达式解析标识符，而不是直接使用左表中的列。

例如：

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

将 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时，连接条件被解释为 `t1.a + 1 = t2.b`，与早期版本的行为保持一致。
结果将是 `2, 'two'`。
当设置为 `false` 时，连接条件默认为 `t1.b = t2.b`，查询将返回 `2, 'one'`。
如果 `b` 不在 `t1` 中，查询将失败并出现错误。

#### 使用 `JOIN USING` 和 `ALIAS`/`MATERIALIZED` 列的行为变化 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

在新的分析器中，在涉及 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中使用 `*` 会默认将这些列包含在结果集中。

例如：

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

在新的分析器中，此查询的结果将包括 `payload` 列以及来自两个表的 `id`。
相比之下，之前的分析器仅在启用特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）的情况下才会包括这些 `ALIAS` 列，并且列可能会以不同的顺序出现。

为了确保一致和预期的结果，特别是在将旧查询迁移到新的分析器时，建议在 `SELECT` 子句中明确指定列，而不是使用 `*`。

#### 处理 `USING` 子句中列的类型修饰符 {#handling-of-type-modifiers-for-columns-in-using-clause}

在新的分析器版本中，确定 `USING` 子句中指定的列的公共超类型的规则已标准化，以产生更可预测的结果，特别是在处理类型修饰符如 `LowCardinality` 和 `Nullable` 时。

- `LowCardinality(T)` 和 `T`：当一个类型为 `LowCardinality(T)` 的列与一个类型为 `T` 的列连接时，结果的公共超类型将是 `T`，有效丢弃 `LowCardinality` 修饰符。
- `Nullable(T)` 和 `T`：当一个类型为 `Nullable(T)` 的列与一个类型为 `T` 的列连接时，结果的公共超类型将是 `Nullable(T)`，确保可空属性得以保留。

例如：

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

在此查询中，`id` 的公共超类型被确定为 `String`，丢弃了来自 `t1` 的 `LowCardinality` 修饰符。

### 投影列名变化 {#projection-column-names-changes}

在计算投影名时，别名不会被替换。

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

在新的分析器中，类型推断发生在初始查询分析期间。
此更改意味着类型检查在短路评估之前进行；因此，`if` 函数的参数必须始终具有公共超类型。

例如，以下查询会失败并出现 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 异构集群 {#heterogeneous-clusters}

新的分析器显著改变了集群中服务器之间的通信协议。因此，无法在具有不同 `enable_analyzer` 设置值的服务器上运行分布式查询。

### 变更由先前的分析器解释 {#mutations-are-interpreted-by-previous-analyzer}

变更仍然使用旧的分析器。
这意味着某些新的 ClickHouse SQL 特性无法在变更中使用。例如，`QUALIFY` 子句。
可以在[这里](https://github.com/ClickHouse/ClickHouse/issues/61563)检查状态。

### 不支持的特性 {#unsupported-features}

新的分析器目前不支持的特性列表如下：

- Annoy 索引。
- Hypothesis 索引。正在进行中的工作[在这里](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 不支持窗口视图。未来没有计划支持。
