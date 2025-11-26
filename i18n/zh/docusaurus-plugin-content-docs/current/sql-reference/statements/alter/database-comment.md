---
description: '关于 ALTER DATABASE ... MODIFY COMMENT 语句的文档，用于添加、修改或删除数据库注释。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT 语句'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER DATABASE ... MODIFY COMMENT

添加、修改或删除数据库注释（无论之前是否已设置）。注释的变更会同时体现在 [`system.databases`](/operations/system-tables/databases.md) 表和 `SHOW CREATE DATABASE` 查询中。



## 语法

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 示例

要创建带注释的 `DATABASE`：

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT '临时数据库';
```

如需修改注释：

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'new comment on a database';
```

要查看修改后的注释：

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ 数据库上的新注释 │
└─────────────────────────┘
```

要移除数据库注释：

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

要确认注释已被移除：

```sql title="Query"
SELECT comment 
FROM system.databases 
WHERE  name = 'database_with_comment';
```

```text title="Response"
┌─注释─┐
│      │
└──────┘
```


## 相关内容 {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
