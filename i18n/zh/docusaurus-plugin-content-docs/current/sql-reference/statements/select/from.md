---
description: 'FROM 子句说明'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM 子句'
doc_type: 'reference'
---

# FROM 子句 {#from-clause}

`FROM` 子句指定要从哪些来源读取数据：

* [表](../../../engines/table-engines/index.md)
* [子查询](../../../sql-reference/statements/select/index.md)
* [表函数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 和 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 子句也可以用来扩展 `FROM` 子句的功能。

子查询是另一个 `SELECT` 查询，可以在 `FROM` 子句中以括号形式指定。

`FROM` 可以包含多个数据源，以逗号分隔，这等价于对这些数据源执行 [CROSS JOIN](../../../sql-reference/statements/select/join.md)。

`FROM` 也可以出现在 `SELECT` 子句之前（可选）。这是 ClickHouse 对标准 SQL 的扩展，使 `SELECT` 语句更易于阅读。例如：

```sql
FROM table
SELECT *
```

## FINAL 修饰符 {#final-modifier}

当指定 `FINAL` 时，ClickHouse 会在返回结果之前对数据进行完全合并。这也会执行给定表引擎在合并过程中会进行的所有数据转换。

在从使用以下表引擎的表中查询数据时适用：

* `ReplacingMergeTree`
* `SummingMergeTree`
* `AggregatingMergeTree`
* `CollapsingMergeTree`
* `VersionedCollapsingMergeTree`

带有 `FINAL` 的 `SELECT` 查询会并行执行。[max&#95;final&#95;threads](/operations/settings/settings#max_final_threads) 设置用于限制所使用的线程数。

### 缺点 {#drawbacks}

使用 `FINAL` 的查询比不使用 `FINAL` 的类似查询执行得稍慢，因为：

* 在查询执行期间需要进行数据合并。
* 带有 `FINAL` 的查询除了查询中指定的列之外，可能还会读取主键列。

`FINAL` 需要额外的计算和内存资源，因为原本应在合并时进行的处理必须在查询时在内存中完成。不过，有时为了生成准确的结果（因为数据可能尚未完全合并）必须使用 FINAL。与运行 `OPTIMIZE` 来强制合并相比，这样做的开销更小。

作为使用 `FINAL` 的替代方案，有时可以通过编写不同的查询来实现：这类查询假设 `MergeTree` 引擎的后台合并过程尚未完成，并通过应用聚合（例如丢弃重复数据）来加以处理。如果需要在查询中使用 `FINAL` 才能获得所需结果，可以这样做，但需要注意由此产生的额外处理开销。

可以使用 [FINAL](../../../operations/settings/settings.md#final) 设置，将 `FINAL` 自动应用到某个会话或用户配置文件中查询的所有表。

### 使用示例 {#example-usage}

使用 `FINAL` 关键字

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

将 `FINAL` 用作查询级别设置

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

将 `FINAL` 作为会话级设置使用

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 实现细节 {#implementation-details}

如果省略 `FROM` 子句，将会从 `system.one` 表中读取数据。
`system.one` 表中只包含一行数据（该表与其他 DBMS 中的 DUAL 表用途相同）。

在执行查询时，查询中列出的所有列都会从相应的表中被提取。对于外层查询不需要的列，会在子查询阶段被丢弃。
如果查询中没有列出任何列（例如 `SELECT count() FROM t`），仍然会从表中提取某一列（优先选择最小的那一列），以便计算行数。
