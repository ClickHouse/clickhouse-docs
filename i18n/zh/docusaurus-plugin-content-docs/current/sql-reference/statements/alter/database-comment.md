---
'description': '关于 ALTER DATABASE ... MODIFY COMMENT 语句的文档，这些语句允许添加、修改或删除数据库注释。'
'slug': '/sql-reference/statements/alter/database-comment'
'sidebar_position': 51
'sidebar_label': 'ALTER DATABASE ... MODIFY COMMENT'
'title': 'ALTER DATABASE ... MODIFY COMMENT 语句'
'keywords':
- 'ALTER DATABASE'
- 'MODIFY COMMENT'
---


# ALTER DATABASE ... MODIFY COMMENT

添加、修改或删除数据库注释，无论之前是否设置过该注释。注释变更在 [`system.databases`](/operations/system-tables/databases.md) 以及 `SHOW CREATE DATABASE` 查询中均有反映。

## Syntax {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

要创建带有注释的 `DATABASE`：

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'The temporary database';
```

要修改注释：

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
│ new comment on database │
└─────────────────────────┘
```

要删除数据库注释：

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

要验证注释是否已删除：

```sql title="Query"
SELECT comment 
FROM system.databases 
WHERE  name = 'database_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
