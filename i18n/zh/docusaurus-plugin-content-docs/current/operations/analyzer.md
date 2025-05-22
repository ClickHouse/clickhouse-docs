---
'description': '页面详细信息关于 ClickHouse 查询分析器'
'keywords':
- 'analyzer'
'sidebar_label': '分析器'
'slug': '/operations/analyzer'
'title': '分析器'
---


# 分析器

## 已知不兼容性 {#known-incompatibilities}

在ClickHouse版本 `24.3` 中，新的查询分析器默认启用。
尽管修复了大量错误并引入了新的优化，它也引入了一些会破坏ClickHouse行为的变更。请阅读以下变更以确定如何为新的分析器重写查询。

### 无效查询不再被优化 {#invalid-queries-are-no-longer-optimized}

之前的查询规划基础设施在查询验证步骤之前应用AST级别的优化。
优化可以重写初始查询，使其变为有效且可以执行。

在新的分析器中，查询验证发生在优化步骤之前。
这意味着先前可以执行的无效查询现在不再受到支持。
在这种情况下，查询必须手动修复。

**示例 1：**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

以下查询在投影列表中使用列 `number`，而在聚合后仅可用 `toString(number)`。
在旧分析器中，`GROUP BY toString(number)` 被优化为 `GROUP BY number,`，使查询有效。

**示例 2：**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

在此查询中也出现了相同的问题：在使用另一个键聚合后，列 `number` 被使用。
之前的查询分析器通过将 `number > 5` 过滤器从 `HAVING` 子句移动到 `WHERE` 子句来修复此查询。

要修复查询，您应该将所有适用于非聚合列的条件移动到 `WHERE` 部分，以符合标准SQL语法：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW 具有无效查询 {#create-view-with-invalid-query}

新的分析器始终执行类型检查。
之前，可以创建一个具有无效 `SELECT` 查询的 `VIEW`。在首次 `SELECT` 或 `INSERT`（在 `MATERIALIZED VIEW` 的情况下）时会失败。

现在，不再可以创建这样的 `VIEW`。

**示例：**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 子句的已知不兼容性 {#known-incompatibilities-of-the-join-clause}

#### 使用投影中的列进行连接 {#join-using-column-from-projection}

默认情况下，不能使用 `SELECT` 列表中的别名作为 `JOIN USING` 键。

一个新的设置 `analyzer_compatibility_join_using_top_level_identifier`，启用时，会改变 `JOIN USING` 的行为，以优先基于 `SELECT` 查询的投影列表中的表达式来解析标识符，而不是直接使用左表中的列。

**示例：**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

当 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时，连接条件被解释为 `t1.a + 1 = t2.b`，与早期版本的行为相匹配。因此，结果将是 `2, 'two'`。
当该设置为 `false` 时，连接条件默认为 `t1.b = t2.b`，查询将返回 `2, 'one'`。
如果 `b` 不在 `t1` 中，则查询将因错误而失败。

#### 使用 `JOIN USING` 和 `ALIAS`/`MATERIALIZED` 列的行为变化 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

在新的分析器中，在涉及 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中，使用 `*` 默认会在结果集中包括这些列。

**示例：**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

在新的分析器中，此查询的结果将包括来自两个表的 `payload` 列和 `id`。相比之下，之前的分析器仅在启用了特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）时才会包括这些 `ALIAS` 列，且列可能按不同顺序出现。

为了确保一致且预期的结果，尤其是在将旧查询迁移到新分析器时，建议在 `SELECT` 子句中明确指定列，而不是使用 `*`。

#### 在 `USING` 子句中处理列的类型修饰符 {#handling-of-type-modifiers-for-columns-in-using-clause}

在新的分析器版本中，确定 `USING` 子句中指定的列的共同超类型的规则已标准化，以产生更可预测的结果，特别是在处理诸如 `LowCardinality` 和 `Nullable` 的类型修饰符时。

- `LowCardinality(T)` 和 `T`：当类型为 `LowCardinality(T)` 的列与类型为 `T` 的列连接时，结果的共同超类型将为 `T`，有效地丢弃 `LowCardinality` 修饰符。

- `Nullable(T)` 和 `T`：当类型为 `Nullable(T)` 的列与类型为 `T` 的列连接时，结果的共同超类型将为 `Nullable(T)`，确保 nullable 属性得到保留。

**示例：**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

在此查询中，`id` 的共同超类型被确定为 `String`，丢弃了来自 `t1` 的 `LowCardinality` 修饰符。

### 投影列名变化 {#projection-column-names-changes}

在计算投影名称时，不会替换别名。

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
这一变化意味着类型检查在短路评估之前进行；因此，`if` 的函数参数必须始终具有共同超类型。

**示例：**

以下查询失败，提示 `对于类型 Array(UInt8)、String，没有超类型，因为它们中的一些是 Array 而其他不是`：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 异构集群 {#heterogeneous-clusters}

新的分析器显著改变了集群内服务器之间的通信协议。因此，无法在具有不同 `enable_analyzer` 设置值的服务器上运行分布式查询。

### 变更由之前的分析器解释 {#mutations-are-interpreted-by-previous-analyzer}

变更仍使用旧分析器。
这意味着某些新的 ClickHouse SQL 特性无法在变更中使用。例如，`QUALIFY` 子句。
状态可以在 [这里](https://github.com/ClickHouse/ClickHouse/issues/61563) 检查。

### 不支持的特性 {#unsupported-features}

新分析器当前不支持的特性列表：

- Annoy 索引。
- 假设索引。正在进行中的工作 [在这里](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 窗口视图不受支持。未来没有支持它的计划。
