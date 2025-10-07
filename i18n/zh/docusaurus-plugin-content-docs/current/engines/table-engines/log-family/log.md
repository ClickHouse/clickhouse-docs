---
'description': 'Log 的文档'
'slug': '/engines/table-engines/log-family/log'
'toc_priority': 33
'toc_title': 'Log'
'title': 'Log'
'doc_type': 'reference'
---


# Log

该引擎属于 `Log` 引擎系列。有关 `Log` 引擎的共同属性及其在 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 文章中的差异请参阅。

`Log` 与 [TinyLog](../../../engines/table-engines/log-family/tinylog.md) 的不同之处在于，列文件旁边有一个小的 "marks" 文件。这些标记在每个数据块上写入，包含指示从哪里开始读取文件以跳过指定行数的偏移量。这使得能够在多个线程中读取表数据。
对于并发数据访问，读取操作可以同时进行，而写入操作则会阻塞读取和彼此之间的操作。
`Log` 引擎不支持索引。如果写入表失败，表将损坏，读取将返回错误。`Log` 引擎适合临时数据、只写表以及测试或演示目的。

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

`Log` 引擎通过将每列写入其自己的文件来高效存储数据。对于每个表，Log 引擎在指定的存储路径写入以下文件：

- `<column>.bin`：每列的数据文件，包含序列化和压缩的数据。
`__marks.mrk`：标记文件，存储每个插入的数据块的偏移量和行数。标记用于通过允许引擎在读取时跳过无关的数据块来促进高效查询执行。

### 写入过程 {#writing-process}

当数据写入 `Log` 表时：

1.    数据被序列化并压缩成块。
2.    对于每一列，将压缩的数据附加到其各自的 `<column>.bin` 文件中。
3.    将相应的条目添加到 `__marks.mrk` 文件中，以记录新插入数据的偏移量和行数。

## 读取数据 {#table_engines-log-reading-the-data}

包含标记的文件允许 ClickHouse 并行读取数据。这意味着 `SELECT` 查询返回的行顺序是不可预测的。使用 `ORDER BY` 子句对行进行排序。

## 使用示例 {#table_engines-log-example-of-use}

创建一个表：

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

ClickHouse 在选择数据时使用多个线程。每个线程读取一个独立的数据块，并在完成时独立返回结果行。因此，输出中的行块顺序可能与输入中的相同块顺序不匹配。例如：

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

对结果进行排序（默认升序）：

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
