---
description: '一种表函数，用于高效地将按给定结构发送到服务器的数据转换并插入到具有另一结构的表中。'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---



# input 表函数

`input(structure)` —— 一种表函数，用于将按指定结构发送到服务器的数据，高效地转换并插入到具有另一种结构的目标表中。

`structure` —— 发送到服务器的数据结构，格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
例如，`'id UInt32, name String'`。

此函数只能在 `INSERT SELECT` 查询中使用，并且在单个查询中只能出现一次，但在其它方面与普通表函数的行为相同
（例如，可以在子查询中使用等）。

数据可以像普通的 `INSERT` 查询一样以任意方式发送，并以任意可用的[格式](/sql-reference/formats)传递，
且必须在查询末尾显式指定该格式（与普通 `INSERT SELECT` 不同）。

此函数的主要特性是：当服务器从客户端接收数据时，会同时根据 `SELECT` 子句中的表达式列表对其进行转换，
并将其插入到目标表中，而不会创建包含所有传输数据的临时表。



## 示例 {#examples}

- 假设 `test` 表的结构为 `(a String, b String)`,而 `data.csv` 中的数据结构为 `(col1 String, col2 Date, col3 Int32)`。将 `data.csv` 中的数据插入到 `test` 表并同时进行转换的查询如下:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- 如果 `data.csv` 包含的数据结构 `test_structure` 与表 `test` 相同,则以下两个查询等效:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
