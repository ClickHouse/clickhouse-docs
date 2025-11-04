---
'description': 'ALTER TABLE ... MODIFY COMMENT 的文档，允许添加、修改或删除表注释'
'sidebar_label': 'ALTER TABLE ... MODIFY COMMENT'
'sidebar_position': 51
'slug': '/sql-reference/statements/alter/comment'
'title': 'ALTER TABLE ... MODIFY COMMENT'
'keywords':
- 'ALTER TABLE'
- 'MODIFY COMMENT'
'doc_type': 'reference'
---


# ALTER TABLE ... MODIFY COMMENT

添加、修改或删除表注释，无论之前是否设置过。注释的更改反映在 [`system.tables`](../../../operations/system-tables/tables.md) 和 `SHOW CREATE TABLE` 查询中。

## Syntax {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

要创建带有注释的表：

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

要修改表注释：

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

要查看修改后的注释：

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment────────────────┐
│ new comment on a table │
└────────────────────────┘
```

要删除表注释：

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

要验证注释是否已被删除：

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## Caveats {#caveats}

对于副本表，不同副本上的注释可能不同。修改注释仅适用于单一副本。

该功能自 23.9 版本起可用。在之前的 ClickHouse 版本中无法使用。

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
