---
slug: /sql-reference/table-functions/view
sidebar_position: 210
sidebar_label: view
title: view
description: "将子查询转化为表。该函数实现视图。"
---


# view 表函数

将子查询转化为表。该函数实现视图（请参见 [CREATE VIEW](/sql-reference/statements/create/view)）。生成的表不存储数据，而只存储指定的 `SELECT` 查询。在从表中读取数据时，ClickHouse 执行查询并从结果中删除所有不必要的列。

**语法**

``` sql
view(subquery)
```

**参数**

- `subquery` — `SELECT` 查询。

**返回值**

- 一张表。

**示例**

输入表：

``` text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

查询：

``` sql
SELECT * FROM view(SELECT name FROM months);
```

结果：

``` text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

您可以将 `view` 函数作为 [remote](/sql-reference/table-functions/remote) 和 [cluster](/sql-reference/table-functions/cluster) 表函数的参数使用：

``` sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

``` sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

**另见**

- [View 表引擎](/engines/table-engines/special/view/)
