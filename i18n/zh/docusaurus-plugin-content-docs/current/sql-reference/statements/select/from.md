---
description: 'FROM 子句说明'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM 子句'
doc_type: 'reference'
---



# FROM 子句

`FROM` 子句指定要读取数据的源：

* [表](../../../engines/table-engines/index.md)
* [子查询](../../../sql-reference/statements/select/index.md)
* [表函数](/sql-reference/table-functions)

还可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 和 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 子句来扩展 `FROM` 子句的功能。

子查询是另一个 `SELECT` 查询，可以用括号括起来写在 `FROM` 子句中。

`FROM` 可以包含多个数据源，用逗号分隔，这等价于对这些数据源执行 [CROSS JOIN](../../../sql-reference/statements/select/join.md)。

`FROM` 还可以选择性地出现在 `SELECT` 子句之前。这是 ClickHouse 对标准 SQL 的一种扩展，使 `SELECT` 语句更易阅读。例如：

```sql
FROM table
SELECT *
```


## FINAL 修饰符 {#final-modifier}

当指定 `FINAL` 时,ClickHouse 会在返回结果之前完全合并数据。这也会执行给定表引擎在合并过程中发生的所有数据转换。

它适用于从使用以下表引擎的表中查询数据:

- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

带有 `FINAL` 的 `SELECT` 查询会并行执行。[max_final_threads](/operations/settings/settings#max_final_threads) 设置用于限制使用的线程数。

### 缺点 {#drawbacks}

使用 `FINAL` 的查询执行速度比不使用 `FINAL` 的类似查询稍慢,原因如下:

- 数据在查询执行期间进行合并。
- 带有 `FINAL` 的查询除了读取查询中指定的列之外,还可能读取主键列。

`FINAL` 需要额外的计算和内存资源,因为通常在合并时发生的处理必须在查询时于内存中进行。然而,为了产生准确的结果,有时必须使用 FINAL(因为数据可能尚未完全合并)。相比运行 `OPTIMIZE` 强制合并,使用 FINAL 的成本更低。

作为使用 `FINAL` 的替代方案,有时可以使用不同的查询方式,这些查询假设 `MergeTree` 引擎的后台进程尚未执行,并通过应用聚合来处理(例如,去除重复项)。如果您需要在查询中使用 `FINAL` 以获得所需的结果,这样做是可以的,但要注意所需的额外处理开销。

可以使用 [FINAL](../../../operations/settings/settings.md#final) 设置,通过会话或用户配置文件自动将 `FINAL` 应用于查询中的所有表。

### 使用示例 {#example-usage}

使用 `FINAL` 关键字

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

将 `FINAL` 用作查询级设置

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

将 `FINAL` 用作会话级设置

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```


## 实现细节 {#implementation-details}

如果省略 `FROM` 子句,将从 `system.one` 表中读取数据。
`system.one` 表恰好包含一行(该表的作用与其他数据库管理系统中的 DUAL 表相同)。

执行查询时,查询中列出的所有列都会从相应的表中提取。子查询中不需要用于外部查询的列会被丢弃。
如果查询未列出任何列(例如 `SELECT count() FROM t`),仍会从表中提取某个列(优先选择最小的列),以便计算行数。
