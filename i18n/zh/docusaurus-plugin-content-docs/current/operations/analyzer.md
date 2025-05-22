---
'description': '页面详细描述了 ClickHouse 查询分析器'
'keywords':
- 'analyzer'
'sidebar_label': '分析器'
'slug': '/operations/analyzer'
'title': '分析器'
---


# Analyzer

## Known incompatibilities {#known-incompatibilities}

在 ClickHouse 版本 `24.3` 中，新查询分析器默认启用。
尽管修复了大量错误并引入了新的优化，但它也引入了一些ClickHouse行为的重大变化。请阅读以下更改，以确定如何重写您的查询以适应新分析器。

### Invalid queries are no longer optimized {#invalid-queries-are-no-longer-optimized}

以前的查询规划基础设施在查询验证步骤之前应用 AST 级别的优化。
优化可以重写初始查询，使其有效并可以执行。

在新的分析器中，查询验证在优化步骤之前进行。
这意味着以前可以执行的无效查询现在不再被支持。
在这种情况下，必须手动修复查询。

**示例 1：**

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

以下查询在投影列表中使用了列 `number`，而在聚合后仅 `toString(number)` 可用。
在旧分析器中，`GROUP BY toString(number)` 被优化为 `GROUP BY number，` 使查询有效。

**示例 2：**

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

在这个查询中也出现了同样的问题：在与另一个键聚合后使用列 `number`。
以前的查询分析器通过将 `number > 5` 过滤器从 `HAVING` 子句移动到 `WHERE` 子句来修复此查询。

要修复查询，您应该将所有适用于非聚合列的条件移动到 `WHERE` 部分，以符合标准 SQL 语法：
```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### CREATE VIEW with invalid query {#create-view-with-invalid-query}

新分析器始终执行类型检查。
以前，可以使用无效的 `SELECT` 查询创建 `VIEW`。然后它会在第一次 `SELECT` 或 `INSERT`（在 `MATERIALIZED VIEW` 的情况下）时失败。

现在，不再可能创建这样的 `VIEW`。

**示例：**

```sql
CREATE TABLE source (data String) ENGINE=MergeTree ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### Known incompatibilities of the `JOIN` clause {#known-incompatibilities-of-the-join-clause}

#### Join using column from projection {#join-using-column-from-projection}

`SELECT` 列表中的别名默认不能用作 `JOIN USING` 键。

启用新设置 `analyzer_compatibility_join_using_top_level_identifier` 后，将改变 `JOIN USING` 的行为，更倾向于根据来自 `SELECT` 查询的投影列表中的表达式解析标识符，而不是直接使用左表中的列。

**示例：**

```sql
SELECT a + 1 AS b, t2.s
FROM Values('a UInt64, b UInt64', (1, 1)) AS t1
JOIN Values('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

当 `analyzer_compatibility_join_using_top_level_identifier` 设置为 `true` 时，连接条件被解释为 `t1.a + 1 = t2.b`，与早期版本的行为匹配。因此，结果将是 `2, 'two'`。
当设置为 `false` 时，连接条件默认为 `t1.b = t2.b`，查询将返回 `2, 'one'`。
如果 `b` 不在 `t1` 中，查询将因错误而失败。

#### Changes in behavior with `JOIN USING` and `ALIAS`/`MATERIALIZED` columns {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

在新的分析器中，在涉及 `ALIAS` 或 `MATERIALIZED` 列的 `JOIN USING` 查询中使用 `*` 默认情况下会将这些列包含在结果集中。

**示例：**

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

在新的分析器中，此查询的结果将包括来自两个表的 `payload` 列和 `id`。相比之下，之前的分析器仅在启用特定设置（`asterisk_include_alias_columns` 或 `asterisk_include_materialized_columns`）时才会包括这些 `ALIAS` 列，且列可能以不同顺序出现。

为了确保一致和预期的结果，特别是在将旧查询迁移到新分析器时，建议在 `SELECT` 子句中明确指定列，而不是使用 `*`。

#### Handling of Type Modifiers for columns in `USING` Clause {#handling-of-type-modifiers-for-columns-in-using-clause}

在新版本的分析器中，确定 `USING` 子句中指定的列的共同超类型的规则已被标准化，以产生更可预测的结果，特别是在处理诸如 `LowCardinality` 和 `Nullable` 等类型修饰符时。

- `LowCardinality(T)` 和 `T`：当一个 `LowCardinality(T)` 类型的列与一个 `T` 类型的列连接时，结果的共同超类型将是 `T`，有效地丢弃 `LowCardinality` 修饰符。

- `Nullable(T)` 和 `T`：当一个 `Nullable(T)` 类型的列与一个 `T` 类型的列连接时，结果的共同超类型将是 `Nullable(T)`，确保可空属性被保留。

**示例：**

```sql
SELECT id, toTypeName(id) FROM Values('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN Values('id String', ('b')) AS t2
USING (id);
```

在这个查询中，`id` 的共同超类型被确定为 `String`，丢弃了来自 `t1` 的 `LowCardinality` 修饰符。

### Projection column names changes {#projection-column-names-changes}

在计算投影名称时，别名不被替换。

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

### Incompatible function arguments types {#incompatible-function-arguments-types}

在新的分析器中，类型推断发生在初始查询分析期间。
这一变化意味着类型检查在短路评估之前完成；因此，`if` 函数的参数必须始终具有共同的超类型。

**示例：**

以下查询失败，出现 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`：

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### Heterogeneous clusters {#heterogeneous-clusters}

新分析器显著改变了集群中服务器之间的通信协议。因此，无法在具有不同 `enable_analyzer` 设置值的服务器上运行分布式查询。

### Mutations are interpreted by previous analyzer {#mutations-are-interpreted-by-previous-analyzer}

变更仍在使用旧分析器。
这意味着某些新的 ClickHouse SQL 功能无法在变更中使用。例如，`QUALIFY` 子句。
状态可以在 [此处](https://github.com/ClickHouse/ClickHouse/issues/61563) 检查。

### Unsupported features {#unsupported-features}

新分析器当前不支持的功能列表：

- Annoy 索引。
- Hypothesis 索引。正在进行中的工作 [在这里](https://github.com/ClickHouse/ClickHouse/pull/48381)。
- 不支持窗口视图。未来也没有支持计划。
