---
'description': 'TinyLog 的文档'
'slug': '/engines/table-engines/log-family/tinylog'
'toc_priority': 34
'toc_title': 'TinyLog'
'title': 'TinyLog'
'doc_type': 'reference'
---


# TinyLog

该引擎属于日志引擎家族。有关日志引擎的共同属性及其差异，请参见 [Log Engine Family](../../../engines/table-engines/log-family/index.md)。

此表引擎通常采用一次写入的方法：一次性写入数据，然后根据需要读取多次。例如，您可以使用 `TinyLog` 类型的表来处理小批量的中间数据。请注意，将数据存储在大量小表中效率较低。

查询在单个流中执行。换句话说，这个引擎旨在用于相对较小的表（最多约 1,000,000 行）。如果您有许多小表，可使用此表引擎，因为它比 [Log](../../../engines/table-engines/log-family/log.md) 引擎更简单（需要打开的文件更少）。

## Characteristics {#characteristics}

- **更简单的结构**：与 Log 引擎不同，TinyLog 不使用标记文件。这减少了复杂性，但也限制了对大数据集的性能优化。
- **单流查询**：对 TinyLog 表的查询在单个流中执行，适用于相对较小的表，通常最多 1,000,000 行。
- **对小表高效**：TinyLog 引擎的简单性使其在管理许多小表时具有优势，因为与 Log 引擎相比，它需要更少的文件操作。

与 Log 引擎不同，TinyLog 不使用标记文件。这减少了复杂性，但也限制了对更大数据集的性能优化。

## 创建表 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 写入数据 {#table_engines-tinylog-writing-the-data}

`TinyLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询，ClickHouse 会将数据块附加到表文件的末尾，逐列写入。

对于每个表，ClickHouse 写入文件：

- `<column>.bin`：每列的数据文件，包含序列化和压缩的数据。

`TinyLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。

## 用法示例 {#table_engines-tinylog-example-of-use}

创建表：

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

插入数据：

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 使用单个流选择数据。结果是输出中行块的顺序与输入中相同块的顺序一致。例如：

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
