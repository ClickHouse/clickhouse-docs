---
description: 'ClickHouse 中 AggregateFunction 数据类型的文档，其用于存储聚合函数的中间状态'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 类型'
doc_type: 'reference'
---

# AggregateFunction 数据类型 {#aggregatefunction-type}

## 描述 {#description}

ClickHouse 中的所有[聚合函数](/sql-reference/aggregate-functions)都有一个特定于实现的中间状态，可以序列化为
`AggregateFunction` 数据类型并存储在表中。这通常通过
[物化视图](../../sql-reference/statements/create/view.md) 来实现。

有两个常与 `AggregateFunction` 类型搭配使用的聚合函数[组合器](/sql-reference/aggregate-functions/combinators)：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器，将其附加到聚合函数名后时，会生成 `AggregateFunction` 的中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合函数组合器，用于从中间状态中获取聚合的最终结果。

## 语法 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

* `aggregate_function_name` - 聚合函数的名称。如果该函数是参数化的，则还需要指定其参数。
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


## 使用方法 {#usage}

### 数据插入 {#data-insertion}

要向包含 `AggregateFunction` 类型列的表中插入数据，可以使用 `INSERT SELECT` 语句，结合聚合函数以及
[`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器。

例如，如果要向类型为 `AggregateFunction(uniq, UInt64)` 和
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 的列中插入数据，则需要使用以下带有组合器的聚合函数。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 相比，`uniqState` 和 `quantilesState`
（追加了 `-State` 组合器）返回的是状态，而不是最终值。
换句话说，它们返回的是 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值在所有 ClickHouse 输出格式中
都有与具体实现相关的二进制表示。

有一个特殊的会话级别设置 `aggregate_function_input_format`，允许从输入值构建状态。
它支持以下格式：

* `state` - 带有序列化状态的二进制字符串（默认）。
  如果你使用 `SELECT` 查询将数据导出成例如 `TabSeparated` 格式，
  那么这个导出结果可以通过 `INSERT` 查询重新加载回去。
* `value` - 该格式要求聚合函数参数的单个值，或者在参数为多个时，一个包含这些值的元组；这些值会被反序列化以构造相应的状态
* `array` - 该格式要求一个值的 Array，如上面 `value` 选项所述；数组中的所有元素会被聚合以形成状态


### 数据选择 {#data-selection}

从 `AggregatingMergeTree` 表中查询数据时，使用 `GROUP BY` 子句，
并使用与插入数据时相同的聚合函数，但要使用
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合器。

在聚合函数后附加 `-Merge` 组合器时，该函数会接收一组状态值，对其进行合并，
并返回完整数据聚合的结果。

例如，下面这两个查询将返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## 使用示例 {#usage-example}

参见 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎描述。

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  组合器。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合器。