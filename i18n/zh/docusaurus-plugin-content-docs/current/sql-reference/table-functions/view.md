---
description: '将子查询转换为一张表。该函数实现视图功能。'
sidebar_label: '视图'
sidebar_position: 210
slug: /sql-reference/table-functions/view
title: '视图'
doc_type: 'reference'
---

# view 表函数 \\{#view-table-function\\}

将子查询转换为一张表。该函数用于实现视图（参见 [CREATE VIEW](/sql-reference/statements/create/view)）。生成的表本身不存储数据，而只保存指定的 `SELECT` 查询。从该表读取时，ClickHouse 会执行该查询，并从结果中丢弃所有不需要的列。

## 语法 \\{#syntax\\}

```sql
view(subquery)
```

## 参数 \\{#arguments\\}

- `subquery` — `SELECT` 查询。

## 返回值 \\{#returned_value\\}

- 一张表。

## 示例 \\{#examples\\}

输入表：

```text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

查询：

```sql
SELECT * FROM view(SELECT name FROM months);
```

结果：

```text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

您可以将 `view` 函数作为 [remote](/sql-reference/table-functions/remote) 和 [cluster](/sql-reference/table-functions/cluster) 表函数的参数使用：

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

## 相关内容 \\{#related\\}

- [View 表引擎](/engines/table-engines/special/view/)
