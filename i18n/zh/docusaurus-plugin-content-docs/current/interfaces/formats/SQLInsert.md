---
title: 'SQLInsert'
slug: /interfaces/formats/SQLInsert
keywords: ['SQLInsert']
input_format: false
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

以 `INSERT INTO table (columns...) VALUES (...), (...) ...;` 语句的序列输出数据。

## 示例用法 {#example-usage}

示例：

```sql
SELECT number AS x, number + 1 AS y, 'Hello' AS z FROM numbers(10) FORMAT SQLInsert SETTINGS output_format_sql_insert_max_batch_size = 2
```

```sql
INSERT INTO table (x, y, z) VALUES (0, 1, 'Hello'), (1, 2, 'Hello');
INSERT INTO table (x, y, z) VALUES (2, 3, 'Hello'), (3, 4, 'Hello');
INSERT INTO table (x, y, z) VALUES (4, 5, 'Hello'), (5, 6, 'Hello');
INSERT INTO table (x, y, z) VALUES (6, 7, 'Hello'), (7, 8, 'Hello');
INSERT INTO table (x, y, z) VALUES (8, 9, 'Hello'), (9, 10, 'Hello');
```

要读取此格式输出的数据，可以使用 [MySQLDump](../formats/MySQLDump.md) 输入格式。

## 格式设置 {#format-settings}

| 设置                                                                                                                                | 描述                                           | 默认值   |
|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|-----------|
| [`output_format_sql_insert_max_batch_size`](../../operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)    | 一个 INSERT 语句中的最大行数。                     | `65505`   |
| [`output_format_sql_insert_table_name`](../../operations/settings/settings-formats.md/#output_format_sql_insert_table_name)            | 输出 INSERT 查询中表的名称。                     | `'table'` |
| [`output_format_sql_insert_include_column_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) | 在 INSERT 查询中包含列名。                       | `true`    |
| [`output_format_sql_insert_use_replace`](../../operations/settings/settings-formats.md/#output_format_sql_insert_use_replace)          | 使用 REPLACE 语句而不是 INSERT。                 | `false`   |
| [`output_format_sql_insert_quote_names`](../../operations/settings/settings-formats.md/#output_format_sql_insert_quote_names)          | 使用 "\`" 字符引用列名。                          | `true`    |
