---
description: '关于 ClickHouse 中 AggregateFunction 数据类型的文档，该类型用于存储聚合函数的中间计算状态'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 类型'
doc_type: 'reference'
---



# AggregateFunction 数据类型



## 描述 {#description}

ClickHouse 中的所有[聚合函数](/sql-reference/aggregate-functions)都有
一个特定于实现的中间状态，该状态可以被序列化为
`AggregateFunction` 数据类型并存储在表中。通常通过
[物化视图](../../sql-reference/statements/create/view.md)来实现这一点。

有两个与 `AggregateFunction` 类型常用的聚合函数[组合器](/sql-reference/aggregate-functions/combinators)：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器，当将其作为后缀添加到聚合函数名称后时，会生成 `AggregateFunction` 的中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合函数组合器，用于从中间状态中获取聚合的最终结果。



## 语法

```sql
AggregateFunction(聚合函数名, 参数类型...)
```

**参数**

* `aggregate_function_name` - 聚合函数的名称。如果该函数是参数化聚合函数，则还需要同时指定其参数。
* `types_of_arguments` - 聚合函数参数的类型。

例如：

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```


## 使用方法

### 数据插入

要向包含 `AggregateFunction` 类型列的表中插入数据，可以使用 `INSERT SELECT` 语句，并结合聚合函数以及
[`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器。

例如，要向类型为 `AggregateFunction(uniq, UInt64)` 和
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 的列中插入数据，可以使用如下带有该组合器的聚合函数。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 相比，`uniqState` 和 `quantilesState`
（附加了 `-State` 组合器）返回的是状态而不是最终值。
换句话说，它们返回的是 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值在所有 ClickHouse 输出
格式中都具有特定于实现的二进制表示。

如果您通过 `SELECT` 查询将数据导出为例如 `TabSeparated` 格式，
则可以使用 `INSERT` 查询将该导出结果重新导入。

### 数据查询

从 `AggregatingMergeTree` 表中查询数据时，使用 `GROUP BY` 子句，
并使用与插入数据时相同的聚合函数，但要使用
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合器。

附加了 `-Merge` 组合器的聚合函数接收一组状态，将它们合并，
并返回完整数据聚合的结果。

例如，下面两个查询返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## 使用示例 {#usage-example}

参见 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎描述。



## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用聚合函数组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  组合器。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合器。
