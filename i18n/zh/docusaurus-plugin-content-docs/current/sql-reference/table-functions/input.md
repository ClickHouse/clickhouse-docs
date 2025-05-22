
# input 表函数

`input(structure)` - 表函数，允许有效地将发送到服务器的数据（具有给定结构）转换并插入到具有另一种结构的表中。

`structure` - 发送到服务器的数据结构，格式如下：`'column1_name column1_type, column2_name column2_type, ...'`。例如，`'id UInt32, name String'`。

此函数只能在 `INSERT SELECT` 查询中使用一次，但表现得像普通的表函数（例如，它可以在子查询中使用等）。

数据可以通过任何方式发送，就像普通的 `INSERT` 查询，并以任何可用的 [format](/sql-reference/formats) 进行传递，格式必须在查询末尾指定（与普通的 `INSERT SELECT` 不同）。

此函数的主要特征是，当服务器从客户端接收数据时，它会根据 `SELECT` 子句中的表达式列表同时转换数据并插入到目标表中。不会创建包含所有传输数据的临时表。

## 示例 {#examples}

- 假设 `test` 表具有以下结构 `(a String, b String)`，而 `data.csv` 中的数据具有不同的结构 `(col1 String, col2 Date, col3 Int32)`。从 `data.csv` 插入数据到 `test` 表的查询（同时转换）如下所示：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- 如果 `data.csv` 包含与表 `test` 的结构相同的数据 `test_structure`，则这两个查询是相等的：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
