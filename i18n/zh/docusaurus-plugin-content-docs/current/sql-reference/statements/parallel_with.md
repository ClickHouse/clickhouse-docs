---
slug: /sql-reference/statements/parallel_with
sidebar_position: 53
sidebar_label: PARALLEL WITH
---


# PARALLEL WITH 子句

允许并行执行多个语句。

## 语法 {#syntax}

``` sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

并行执行语句 `statement1`、`statement2`、`statement3` 等。这些语句的输出将被丢弃。

在许多情况下，并行执行语句可能比按顺序执行相同的语句更快。例如，`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` 可能比 `statement1; statement2; statement3` 要快。

## 示例 {#examples}

并行创建两个表：

``` sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

并行删除两个表：

``` sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 设置 {#settings}

设置 [max_threads](../../operations/settings/settings.md#max_threads) 控制生成多少线程。

## 与 UNION 的比较 {#comparison-with-union}

`PARALLEL WITH` 子句与 [UNION](select/union.md) 有些相似，也是在并行执行它的操作数。然而，两者之间存在一些差异：
- `PARALLEL WITH` 不会返回其操作数执行的任何结果，只能重新抛出任何异常；
- `PARALLEL WITH` 不要求其操作数具有相同的结果列集合；
- `PARALLEL WITH` 可以执行任何语句（不仅限于 `SELECT`）。
