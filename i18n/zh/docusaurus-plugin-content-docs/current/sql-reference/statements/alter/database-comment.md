---
description: '关于 ALTER DATABASE ... MODIFY COMMENT 语句的文档，用于添加、修改或删除数据库注释。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT 语句'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---

# ALTER DATABASE ... MODIFY COMMENT {#alter-database-modify-comment}

添加、修改或删除数据库注释（无论之前是否已设置）。注释的变更会同时体现在 [`system.databases`](/operations/system-tables/databases.md) 表和 `SHOW CREATE DATABASE` 查询中。

## 语法 {#syntax}

```

## Examples {#examples}

To create a `DATABASE` with a comment:

```

## 示例 {#examples}

要创建带注释的 `DATABASE`：

```

To modify the comment:

```

如需修改注释：

```

To view the modified comment:

```

要查看修改后的注释：

```

```

```

To remove the database comment:

```

要移除数据库注释：

```

To verify that the comment was removed:

```

要确认注释已被移除：

```

```

```text title="Response"
┌─注释─┐
│      │
└──────┘
```

## 相关内容 {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
