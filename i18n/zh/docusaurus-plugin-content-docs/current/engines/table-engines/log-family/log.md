---
'description': 'Log 家族的文档'
'slug': '/engines/table-engines/log-family/log'
'toc_priority': 33
'toc_title': 'Log'
'title': '日志'
---




# Log

该引擎属于 `Log` 引擎系列。请参阅 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 文章中的 `Log` 引擎的共同属性及其差异。

`Log` 与 [TinyLog](../../../engines/table-engines/log-family/tinylog.md) 的不同之处在于，"marks" 的小文件与列文件一起存储。这些标记在每个数据块上写入，并包含指示从哪里开始读取文件的偏移量，以跳过指定数量的行。这使得在多个线程中读取表数据成为可能。
对于并发数据访问，读取操作可以同时进行，而写入操作则会阻塞读取和彼此之间。
`Log` 引擎不支持索引。类似地，如果向表中写入失败，表将损坏，从中读取会返回错误。`Log` 引擎适合用于临时数据、单次写入表以及测试或演示目的。

## 创建表 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 写入数据 {#table_engines-log-writing-the-data}

`Log` 引擎通过将每列写入自己的文件来有效地存储数据。对于每个表，Log 引擎会在指定的存储路径下写入以下文件：

- `<column>.bin`：每列的数据文件，包含序列化和压缩的数据。
- `__marks.mrk`：标记文件，存储每个插入数据块的偏移量和行数。标记用于通过允许引擎在读取时跳过不相关的数据块来促进高效的查询执行。

### 写入过程 {#writing-process}

当数据写入 `Log` 表时：

1. 数据被序列化并压缩成块。
2. 对于每列，压缩数据附加到其各自的 `<column>.bin` 文件中。
3. 在 `__marks.mrk` 文件中添加相应条目，以记录新插入数据的偏移量和行数。

## 读取数据 {#table_engines-log-reading-the-data}

带有标记的文件允许 ClickHouse 并行读取数据。这意味着 `SELECT` 查询以不可预测的顺序返回行。使用 `ORDER BY` 子句对行进行排序。

## 使用示例 {#table_engines-log-example-of-use}

创建表：

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

插入数据：

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 在选择数据时使用多个线程。每个线程读取一个单独的数据块，并在完成时独立返回结果行。因此，输出中行块的顺序可能与输入中相同块的顺序不匹配。例如：

```sql
SELECT * FROM log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

对结果进行排序（默认按升序）：

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
