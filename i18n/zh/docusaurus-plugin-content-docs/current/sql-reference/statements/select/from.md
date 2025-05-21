---
'description': 'FROM子句的文档'
'sidebar_label': 'FROM'
'slug': '/sql-reference/statements/select/from'
'title': 'FROM子句'
---




# FROM 子句

`FROM` 子句指定了数据读取的来源：

- [表](../../../engines/table-engines/index.md)
- [子查询](../../../sql-reference/statements/select/index.md) 
- [表函数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 和 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 子句也可以用来扩展 `FROM` 子句的功能。

子查询是另一个 `SELECT` 查询，可以在 `FROM` 子句中用括号指定。

`FROM` 可以包含多个数据源，以逗号分隔，这相当于在它们之间执行 [CROSS JOIN](../../../sql-reference/statements/select/join.md)。

`FROM` 可以在 `SELECT` 子句之前出现，这是 ClickHouse 特有的标准 SQL 扩展，使 `SELECT` 语句更易于阅读。例子：

```sql
FROM table
SELECT *
```

## FINAL 修饰符 {#final-modifier}

当指定 `FINAL` 时，ClickHouse 在返回结果之前完全合并数据。这也执行给定表引擎在合并期间进行的所有数据转换。

适用于使用以下表引擎从表中选择数据时：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

带有 `FINAL` 的 `SELECT` 查询是并行执行的。[max_final_threads](/operations/settings/settings#max_final_threads) 设置限制了使用的线程数量。

### 缺点 {#drawbacks}

使用 `FINAL` 的查询执行速度稍慢于不使用 `FINAL` 的类似查询，因为：

- 数据在查询执行期间被合并。
- 带有 `FINAL` 的查询可能会读取主键列以及查询中指定的列。

`FINAL` 需要额外的计算和内存资源，因为通常会在合并时发生的处理必须在查询时在内存中进行。然而，有时使用 `FINAL` 是必要的，以便产生准确的结果（因为数据可能尚未完全合并）。这比运行 `OPTIMIZE` 强制合并的成本要低。

作为使用 `FINAL` 的替代方案，有时可以使用假设 `MergeTree` 引擎的后台过程尚未发生的不同查询，并通过应用聚合来处理（例如，丢弃重复项）。如果在查询中需要使用 `FINAL` 以获得所需结果，这样做是可以的，但要注意所需的额外处理。

可以使用 [FINAL](../../../operations/settings/settings.md#final) 设置自动应用 `FINAL` 到查询中的所有表，使用会话或用户配置文件。

### 示例用法 {#example-usage}

使用 `FINAL` 关键字

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

将 `FINAL` 作为查询级设置使用

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

将 `FINAL` 作为会话级设置使用

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 实施细节 {#implementation-details}

如果省略 `FROM` 子句，则将从 `system.one` 表中读取数据。
`system.one` 表恰好包含一行（该表执行的功能与其他 DBMS 中的 DUAL 表相同）。

要执行查询，查询中列出的所有列都从适当的表中提取。任何外部查询不需要的列都会从子查询中丢弃。
如果查询未列出任何列（例如 `SELECT count() FROM t`），仍然会从表中提取某些列（优先选择最小的列），以计算行数。
