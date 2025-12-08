---
description: 'PARALLEL WITH 子句文档'
sidebar_label: 'PARALLEL WITH'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH 子句'
doc_type: 'reference'
---

# PARALLEL WITH 子句 {#parallel-with-clause}

允许并行执行多个语句。

## 语法 {#syntax}

```sql
语句1 PARALLEL WITH 语句2 [PARALLEL WITH 语句3 ...]
```

并行执行语句 `statement1`、`statement2`、`statement3` 等，其输出会被丢弃。

在许多情况下，并行执行语句可能比按顺序执行相同的一组语句更快。例如，`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` 往往比 `statement1; statement2; statement3` 更快。

## 示例 {#examples}

并行创建两个表：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

同时删除两个表：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 设置 {#settings}

[max_threads](../../operations/settings/settings.md#max_threads) 设置用于控制要启动的线程数。

## 与 UNION 的比较 {#comparison-with-union}

`PARALLEL WITH` 子句与 [UNION](select/union.md) 有些相似，`UNION` 也会并行执行其操作数。但它们之间存在一些差异：
- `PARALLEL WITH` 不会返回其操作数执行产生的任何结果，如果出现异常，它只能重新抛出该异常；
- `PARALLEL WITH` 不要求其操作数具有相同的一组结果列；
- `PARALLEL WITH` 可以执行任意语句（不仅仅是 `SELECT`）。
