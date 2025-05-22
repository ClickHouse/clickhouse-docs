---
'description': '将子查询转换为表。该函数实现视图。'
'sidebar_label': '视图'
'sidebar_position': 210
'slug': '/sql-reference/table-functions/view'
'title': '视图'
---


# view 表函数

将子查询转换为一个表。该函数实现了视图（请参见 [CREATE VIEW](/sql-reference/statements/create/view)）。生成的表不存储数据，而仅存储指定的 `SELECT` 查询。在从表中读取数据时，ClickHouse 执行查询并从结果中删除所有不必要的列。

## 语法 {#syntax}

```sql
view(subquery)
```

## 参数 {#arguments}

- `subquery` — `SELECT` 查询。

## 返回值 {#returned_value}

- 一个表。

## 示例 {#examples}

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

您可以将 `view` 函数用作 [remote](/sql-reference/table-functions/remote) 和 [cluster](/sql-reference/table-functions/cluster) 表函数的参数：

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

## 相关 {#related}

- [视图表引擎](/engines/table-engines/special/view/)
