---
'description': 'ALTER TABLE ... MODIFY COMMENT 文档，允许添加、修改或删除表注释'
'sidebar_label': '修改表格 ... 注释'
'sidebar_position': 51
'slug': '/sql-reference/statements/alter/comment'
'title': 'ALTER TABLE ... MODIFY COMMENT'
'keywords':
- 'ALTER TABLE'
- 'MODIFY COMMENT'
---




# ALTER TABLE ... MODIFY COMMENT

添加、修改或删除表注释，无论之前是否设置过。注释更改反映在 [`system.tables`](../../../operations/system-tables/tables.md) 和 `SHOW CREATE TABLE` 查询中。

## 语法 {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## 示例 {#examples}

要创建一个带注释的表：

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

要验证注释是否已删除：

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

## 注意事项 {#caveats}

对于 Replicated 表，不同副本上的注释可能不同。修改注释只适用于单个副本。

该功能自版本 23.9 开始可用。在之前的 ClickHouse 版本中不支持此功能。

## 相关内容 {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
