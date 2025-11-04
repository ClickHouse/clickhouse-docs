---
'description': 'FROM 子句 的文档'
'sidebar_label': 'FROM'
'slug': '/sql-reference/statements/select/from'
'title': 'FROM 子句'
'doc_type': 'reference'
---


# FROM 子句

`FROM` 子句指定要读取数据的源：

- [表](../../../engines/table-engines/index.md)
- [子查询](../../../sql-reference/statements/select/index.md) 
- [表函数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 和 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 子句也可以用于扩展 `FROM` 子句的功能。

子查询是另一种 `SELECT` 查询，可以在 `FROM` 子句内用括号指定。

`FROM` 可以包含多个数据源，用逗号分隔，这相当于对它们执行 [CROSS JOIN](../../../sql-reference/statements/select/join.md)。

`FROM` 可以选择性地出现在 `SELECT` 子句之前。这是 ClickHouse 特有的扩展，使得 `SELECT` 语句更容易阅读。示例：

```sql
FROM table
SELECT *
```

## FINAL 修饰符 {#final-modifier}

当指定 `FINAL` 时，ClickHouse 会在返回结果之前完全合并数据。这也会执行在给定表引擎的合并期间发生的所有数据转换。

在使用以下表引擎从表中选择数据时适用：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

带有 `FINAL` 的 `SELECT` 查询是并行执行的。设置 [max_final_threads](/operations/settings/settings#max_final_threads) 限制了使用的线程数。

### 缺点 {#drawbacks}

使用 `FINAL` 的查询执行速度略慢于不使用 `FINAL` 的类似查询，因为：

- 数据在查询执行期间被合并。
- 带有 `FINAL` 的查询可能会读取除查询中指定的列以外的主键列。

`FINAL` 需要额外的计算和内存资源，因为通常在合并时发生的处理必须在查询时在内存中进行。然而，为了生成准确的结果，有时需要使用 `FINAL`（因为数据可能还没有完全合并）。它的成本低于运行 `OPTIMIZE` 强制合并。

作为使用 `FINAL` 的替代方案，有时可以使用不同的查询，假设 `MergeTree` 引擎的后台进程尚未发生，并通过应用聚合来处理它（例如，丢弃重复项）。如果您需要在查询中使用 `FINAL` 以获得所需的结果，可以这样做，但要注意所需的额外处理。

`FINAL` 可以通过 [FINAL](../../../operations/settings/settings.md#final) 设置自动应用于查询中的所有表，使用会话或用户配置文件。

### 示例用法 {#example-usage}

使用 `FINAL` 关键字

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

将 `FINAL` 作为查询级别设置使用

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

将 `FINAL` 作为会话级别设置使用

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 实现细节 {#implementation-details}

如果省略 `FROM` 子句，则数据将从 `system.one` 表中读取。
`system.one` 表仅包含一行（该表的作用与其他数据库管理系统中的 DUAL 表相同）。

要执行查询，查询中列出的所有列都从适当的表中提取。任何对于外部查询不需要的列会从子查询中剔除。
如果查询未列出任何列（例如，`SELECT count() FROM t`），仍然会从表中提取某一列（优先选择最小的列），以计算行数。
