---
slug: /sql-reference/statements/select/from
sidebar_label: FROM
---


# FROM 子句

`FROM` 子句指定要读取数据的来源：

- [表](../../../engines/table-engines/index.md)
- [子查询](../../../sql-reference/statements/select/index.md) 
- [表函数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 和 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 子句也可以用来扩展 `FROM` 子句的功能。

子查询是另一个 `SELECT` 查询，可以在 `FROM` 子句中用括号指定。

`FROM` 可以包含多个数据源，以逗号分隔，这相当于在它们之间执行 [CROSS JOIN](../../../sql-reference/statements/select/join.md)。

`FROM` 可以选择性地出现在 `SELECT` 子句之前。这是 ClickHouse 对标准 SQL 的特定扩展，使 `SELECT` 语句更容易阅读。示例：

```sql
FROM table
SELECT *
```

## FINAL 修饰符 {#final-modifier}

当指定 `FINAL` 时，ClickHouse 会在返回结果之前完全合并数据。这也会执行在给定表引擎合并期间发生的所有数据转换。

在从使用以下表引擎的表中选择数据时适用：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

带有 `FINAL` 的 `SELECT` 查询是并行执行的。 [max_final_threads](/operations/settings/settings#max_final_threads) 设置限制了使用的线程数量。

### 缺点 {#drawbacks}

使用 `FINAL` 的查询执行速度略慢于不使用 `FINAL` 的类似查询，因为：

- 数据在查询执行过程中被合并。
- 带有 `FINAL` 的查询可能会读取主键列以及查询中指定的列。

由于通常在合并时发生的处理必须在查询时在内存中进行，因此 `FINAL` 需要额外的计算和内存资源。但是，有时使用 `FINAL` 是必要的，以生成准确的结果（因为数据可能尚未完全合并）。它比运行 `OPTIMIZE` 来强制合并更便宜。

作为使用 `FINAL` 的替代方案，某些情况下可以使用不同的查询，假设 `MergeTree` 引擎的后台处理尚未发生，并通过应用聚合来处理（例如，丢弃重复项）。如果您需要在查询中使用 `FINAL` 来获得所需结果，使用它是可以的，但要注意额外的处理要求。

可以使用 [FINAL](../../../operations/settings/settings.md#final) 设置自动将 `FINAL` 应用到查询中的所有表，使用会话或用户配置文件。

### 示例用法 {#example-usage}

使用 `FINAL` 关键字

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

作为查询级设置使用 `FINAL`

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

作为会话级设置使用 `FINAL`

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 实现细节 {#implementation-details}

如果省略 `FROM` 子句，将从 `system.one` 表中读取数据。
`system.one` 表包含确切的一行（这个表的功能与其他 DBMS 中的 DUAL 表相同）。

要执行查询，将从适当的表中提取查询中列出的所有列。任何外部查询不需要的列将被从子查询中丢弃。
如果查询未列出任何列（例如，`SELECT count() FROM t`），那么仍会从表中提取一些列（优先选择最小的列），以计算行数。
