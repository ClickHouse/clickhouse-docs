---
description: '一种表函数，可将按给定结构发送到服务器的数据高效转换并插入到具有另一结构的表中。'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---

# input 表函数 \\{#input-table-function\\}

`input(structure)` —— 一种表函数，用于将按给定结构发送到服务器的数据高效转换后，插入到具有另一种结构的表中。

`structure` —— 发送到服务器的数据结构，格式如下：`'column1_name column1_type, column2_name column2_type, ...'`。
例如：`'id UInt32, name String'`。

此函数只能在 `INSERT SELECT` 查询中使用，并且在一次查询中只能使用一次，但在其他方面的行为与普通表函数相同
（例如，可以在子查询中使用等）。

数据的发送方式可以与普通的 `INSERT` 查询相同，并且可以使用任意可用的[格式](/sql-reference/formats)，
该格式必须在查询末尾指定（这点与普通的 `INSERT SELECT` 不同）。

该函数的主要特性在于，当服务器从客户端接收数据时，会根据 `SELECT` 子句中的表达式列表同时对其进行转换，
并将其插入目标表中，而不会为所有传输的数据创建临时表。

## 示例 \\{#examples\\}

* 假设 `test` 表具有如下结构 `(a String, b String)`，
  而 `data.csv` 中的数据结构不同，为 `(col1 String, col2 Date, col3 Int32)`。将
  `data.csv` 中的数据插入到 `test` 表并同时进行转换的查询如下所示：

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

* 如果 `data.csv` 中的数据具有与表 `test` 相同的结构 `test_structure`，那么这两个查询是等价的：

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
