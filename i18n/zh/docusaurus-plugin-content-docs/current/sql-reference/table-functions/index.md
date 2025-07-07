---
'description': 'Table Functions 的文档'
'sidebar_label': '表函数'
'sidebar_position': 1
'slug': '/sql-reference/table-functions/'
'title': '表函数'
---


# 表函数

表函数是构造表的方法。

## 用法 {#usage}

表函数可以在 `SELECT` 查询的 [`FROM`](../../sql-reference/statements/select/from.md) 子句中使用。例如，您可以使用 `file` 表函数从本地机器上的文件中 `SELECT` 数据。

```bash
echo "1, 2, 3" > example.csv
```
```text
./clickhouse client
:) SELECT * FROM file('example.csv')
┌─c1─┬─c2─┬─c3─┐
│  1 │  2 │  3 │
└────┴────┴────┘
```

您也可以使用表函数创建仅在当前查询中可用的临时表。例如：

```sql title="Query"
SELECT * FROM generateSeries(1,5);
```
```response title="Response"
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

查询完成时，表将被删除。

表函数可以作为创建表的一种方式，使用以下语法：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

例如：

```sql title="Query"
CREATE TABLE series AS generateSeries(1, 5);
SELECT * FROM series;
```

```response
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

最后，表函数可以用于向表中 `INSERT` 数据。例如，我们可以再次使用 `file` 表函数将之前示例中创建的表的内容写入磁盘上的文件：

```sql
INSERT INTO FUNCTION file('numbers.csv', 'CSV') SELECT * FROM series;
```

```bash
cat numbers.csv
1
2
3
4
5
```

:::note
如果 [allow_ddl](/operations/settings/settings#allow_ddl) 设置被禁用，您无法使用表函数。
:::
