---
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: TinyLog
---


# TinyLog

该引擎属于日志引擎家族。请参见 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 以获取日志引擎的共有属性及其差异。

此表引擎通常使用写一次（write-once）的方法：一次性写入数据，然后根据需要读取多次。例如，您可以使用 `TinyLog` 类型的表来存储以小批量处理的中间数据。请注意，存储大量小表的数据效率不高。

查询以单一流方式执行。换句话说，该引擎适用于相对较小的表（最多约 1,000,000 行）。如果您有许多小表，使用此表引擎是有意义的，因为它比 [Log](../../../engines/table-engines/log-family/log.md) 引擎更简单（需要打开的文件更少）。

## 特性 {#characteristics}

- **结构更简单**：与 Log 引擎不同，TinyLog 不使用标记文件。这减少了复杂性，但也限制了对大数据集的性能优化。
- **单流查询**：对 TinyLog 表的查询以单一流执行，使其适合相对较小的表，通常最多 1,000,000 行。
- **小表高效**：TinyLog 引擎的简单性使其在管理许多小表时具有优势，因为它相比 Log 引擎需要更少的文件操作。

与 Log 引擎不同，TinyLog 不使用标记文件。这减少了复杂性，但也限制了对较大数据集的性能优化。

## 创建表 {#table_engines-tinylog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

有关 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述，请参见相关文档。

## 写入数据 {#table_engines-tinylog-writing-the-data}

`TinyLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询，ClickHouse 会将数据块附加到表文件的末尾，逐列写入数据。

对于每个表，ClickHouse 写入文件：

- `<column>.bin`：每列的数据文件，包含序列化和压缩的数据。

`TinyLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。

## 使用示例 {#table_engines-tinylog-example-of-use}

创建表：

``` sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

插入数据：

``` sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用两个 `INSERT` 查询在 `<column>.bin` 文件内部创建了两个数据块。

ClickHouse 使用单一流选择数据。因此，输出中行块的顺序与输入中相同块的顺序一致。例如：

``` sql
SELECT * FROM tiny_log_table
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
