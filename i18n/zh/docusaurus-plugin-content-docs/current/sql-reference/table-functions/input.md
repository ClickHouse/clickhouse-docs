---
'description': '表函数，允许有效地将以给定结构发送到服务器的数据转换并插入到具有另一结构的表中。'
'sidebar_label': '输入'
'sidebar_position': 95
'slug': '/sql-reference/table-functions/input'
'title': '输入'
---


# input 表函数

`input(structure)` - 表函数，允许有效地将以给定结构发送到服务器的数据转换并插入到另一种结构的表中。

`structure` - 发送到服务器的数据结构，格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
例如，`'id UInt32, name String'`。

此函数仅可在 `INSERT SELECT` 查询中使用一次，但行为类似于普通表函数（例如，可以在子查询中使用等）。

数据可以通过任何方式发送，就像普通的 `INSERT` 查询一样，并可以通过查询末尾指定的任何可用 [format](/sql-reference/formats) 传递（与普通的 `INSERT SELECT` 不同）。

此函数的主要特点是，当服务器从客户端接收数据时，它会根据 `SELECT` 子句中的表达式列表同时转换数据并插入目标表。不会创建包含所有传输数据的临时表。

## 示例 {#examples}

- 假设 `test` 表具有以下结构 `(a String, b String)`，而 `data.csv` 中的数据具有不同结构 `(col1 String, col2 Date, col3 Int32)`。将 `data.csv` 中的数据插入 `test` 表并同时进行转换的查询如下所示：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- 如果 `data.csv` 包含与表 `test` 相同结构的 `test_structure` 数据，那么这两个查询是等价的：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
