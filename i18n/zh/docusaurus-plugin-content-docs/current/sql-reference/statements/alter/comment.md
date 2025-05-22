
# ALTER TABLE ... MODIFY COMMENT

添加、修改或删除表注释，无论之前是否设置过。注释更改将在 [`system.tables`](../../../operations/system-tables/tables.md) 和 `SHOW CREATE TABLE` 查询中反映出来。

## Syntax {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

创建带注释的表：

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

修改表注释：

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

查看修改后的注释：

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

删除表注释：

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

验证注释是否被删除：

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

对于复制表，不同的副本上的注释可能不同。修改注释仅适用于单个副本。

该功能自版本 23.9 起可用。在之前的 ClickHouse 版本中无法使用。

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
