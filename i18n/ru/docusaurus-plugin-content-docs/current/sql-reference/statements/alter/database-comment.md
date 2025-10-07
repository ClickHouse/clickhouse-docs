---
slug: '/sql-reference/statements/alter/database-comment'
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
sidebar_position: 51
description: 'Документация о команде ALTER DATABASE ... MODIFY COMMENT, позволяет'
title: 'Команды ALTER DATABASE ... MODIFY COMMENT'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: reference
---
# ALTER DATABASE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к базе данных, независимо от того, был ли он установлен ранее или нет. Изменение комментария отражается как в [`system.databases`](/operations/system-tables/databases.md), так и в запросе `SHOW CREATE DATABASE`.

## Syntax {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

Чтобы создать `DATABASE` с комментарием:

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'The temporary database';
```

Чтобы изменить комментарий:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'new comment on a database';
```

Чтобы просмотреть измененный комментарий:

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

Чтобы удалить комментарий к базе данных:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

Чтобы проверить, что комментарий был удален:

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

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) оператор
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)