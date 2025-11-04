---
'description': '将子查询转换为一个 TABLE。此功能实现了 视图。'
'sidebar_label': '视图'
'sidebar_position': 210
'slug': '/sql-reference/table-functions/view'
'title': '视图'
'doc_type': 'reference'
---


# view Table Function

将子查询转换为一个表。该函数实现视图 (参见 [CREATE VIEW](/sql-reference/statements/create/view))。生成的表不存储数据，而只存储指定的 `SELECT` 查询。当从该表读取时，ClickHouse 执行查询并删除结果中所有不必要的列。

## Syntax {#syntax}

```sql
view(subquery)
```

## Arguments {#arguments}

- `subquery` — `SELECT` 查询。

## Returned value {#returned_value}

- 一个表。

## Examples {#examples}

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

## Related {#related}

- [View Table Engine](/engines/table-engines/special/view/)
