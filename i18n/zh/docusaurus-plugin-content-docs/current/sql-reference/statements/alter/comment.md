---
description: 'ALTER TABLE ... MODIFY COMMENT 语句的文档，说明如何
添加、修改或删除表注释'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---

# ALTER TABLE ... MODIFY COMMENT \{#alter-table-modify-comment\}

添加、修改或删除表注释（无论之前是否设置过）。表注释的更改会同时反映在 [`system.tables`](../../../operations/system-tables/tables.md) 和 `SHOW CREATE TABLE` 查询的结果中。

## 语法 \{#syntax\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## 示例 \{#examples\}

要创建包含注释的表：

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

若要修改表的注释：

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

要查看已修改的注释：

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

要确认注释已被删除：

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

## 注意事项 \{#caveats\}

对于 Replicated 表，不同副本上的注释（comment）可以不同。  
修改注释只会作用于单个副本。

该功能自 23.9 版本起可用。在更早的 ClickHouse 版本中不可用。

## 相关内容 \{#related-content\}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
