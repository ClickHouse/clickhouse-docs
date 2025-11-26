---
alias: []
description: 'SQLInsert 格式文档'
input_format: false
keywords: ['SQLInsert']
output_format: true
slug: /interfaces/formats/SQLInsert
title: 'SQLInsert'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 描述 {#description}

以一系列 `INSERT INTO table (columns...) VALUES (...), (...) ...;` 语句的形式输出数据。



## 使用示例

示例：

```sql
SELECT number AS x, number + 1 AS y, 'Hello' AS z FROM numbers(10) FORMAT SQLInsert SETTINGS output_format_sql_insert_max_batch_size = 2
```

```sql
INSERT INTO table (x, y, z) VALUES (0, 1, '你好'), (1, 2, '你好');
INSERT INTO table (x, y, z) VALUES (2, 3, '你好'), (3, 4, '你好');
INSERT INTO table (x, y, z) VALUES (4, 5, '你好'), (5, 6, '你好');
INSERT INTO table (x, y, z) VALUES (6, 7, '你好'), (7, 8, '你好');
INSERT INTO table (x, y, z) VALUES (8, 9, '你好'), (9, 10, '你好');
```

可以使用 [MySQLDump](../formats/MySQLDump.md) 输入格式来读取此格式输出的数据。


## 格式设置 {#format-settings}

| 设置                                                                                                                                    | 描述                                               | 默认值    |
|----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|-----------|
| [`output_format_sql_insert_max_batch_size`](../../operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)    | 单个 INSERT 语句中的最大行数。                   | `65505`   |
| [`output_format_sql_insert_table_name`](../../operations/settings/settings-formats.md/#output_format_sql_insert_table_name)            | 输出 INSERT 查询中使用的表名。                   | `'table'` |
| [`output_format_sql_insert_include_column_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) | 在 INSERT 查询中包含列名。                       | `true`    |
| [`output_format_sql_insert_use_replace`](../../operations/settings/settings-formats.md/#output_format_sql_insert_use_replace)          | 使用 REPLACE 语句而不是 INSERT。                 | `false`   |
| [`output_format_sql_insert_quote_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_quote_names)          | 使用 "\`" 字符为列名加引号。                     | `true`    |
