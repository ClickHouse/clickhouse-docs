---
description: 'PARALLEL WITH 子句说明'
sidebar_label: 'PARALLEL WITH 子句'
sidebar_position: 53
slug: /sql-reference/statements/parallel_with
title: 'PARALLEL WITH 子句'
doc_type: 'reference'
---



# PARALLEL WITH 子句

可用于并行执行多条语句。



## 语法 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

并行执行语句 `statement1`、`statement2`、`statement3` 等。这些语句的输出会被丢弃。

在许多情况下,并行执行语句比顺序执行相同的语句更快。例如,`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` 通常比 `statement1; statement2; statement3` 更快。


## 示例 {#examples}

并行创建两个表：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

并行删除两个表：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```


## 设置 {#settings}

设置项 [max_threads](../../operations/settings/settings.md#max_threads) 用于控制生成的线程数量。


## 与 UNION 的比较 {#comparison-with-union}

`PARALLEL WITH` 子句与 [UNION](select/union.md) 有些相似,后者也会并行执行其操作数。但两者存在以下差异:

- `PARALLEL WITH` 不返回其操作数的执行结果,仅在发生异常时重新抛出异常;
- `PARALLEL WITH` 不要求其操作数具有相同的结果列集;
- `PARALLEL WITH` 可以执行任意语句(不仅限于 `SELECT`)。
