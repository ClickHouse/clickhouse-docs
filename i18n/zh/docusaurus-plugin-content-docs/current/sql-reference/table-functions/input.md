---
slug: /sql-reference/table-functions/input
sidebar_position: 95
sidebar_label: input
title: 'input'
description: '表函数，允许有效地将以给定结构发送到服务器的数据转换并插入到具有另一种结构的表中。'
---


# input 表函数

`input(structure)` - 表函数，允许有效地将以给定结构发送到服务器的数据转换并插入到具有另一种结构的表中。

`structure` - 发送到服务器的数据结构，格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
例如，`'id UInt32, name String'`。

此函数仅可以在 `INSERT SELECT` 查询中使用一次，但在其他方面行为与普通表函数相同（例如，可以在子查询中使用等）。

数据可以通过任何方式发送，就像普通的 `INSERT` 查询一样，并且可以使用任何可用的 [format](/sql-reference/formats)，该格式必须在查询末尾指定（与普通的 `INSERT SELECT` 不同）。

此函数的主要特点是，当服务器从客户端接收数据时，它同时根据 `SELECT` 子句中的表达式列表进行转换，并插入到目标表中。不会创建包含所有传输数据的临时表。

**示例**

- 假设 `test` 表的结构为 `(a String, b String)`，
    而 `data.csv` 中的数据具有不同的结构 `(col1 String, col2 Date, col3 Int32)`。将 `data.csv` 中的数据插入 `test` 表并同时进行转换的查询如下：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- 如果 `data.csv` 包含与表 `test` 相同结构 `test_structure` 的数据，则这两个查询是等价的：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
