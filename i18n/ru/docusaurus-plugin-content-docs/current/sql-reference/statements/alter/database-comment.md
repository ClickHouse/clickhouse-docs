---
description: 'Документация по операторам ALTER DATABASE ... MODIFY COMMENT,
которые позволяют добавлять, изменять или удалять комментарии к базе данных.'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'Операторы ALTER DATABASE ... MODIFY COMMENT'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER DATABASE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к базе данных, независимо от того, был ли он задан ранее. Изменение комментария отражается как в [`system.databases`](/operations/system-tables/databases.md), так и в результате запроса `SHOW CREATE DATABASE`.



## Синтаксис

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## Примеры

Чтобы создать базу данных (`DATABASE`) с комментарием:

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'Временная база данных';
```

Чтобы отредактировать комментарий:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'new comment on a database';
```

Чтобы просмотреть изменённый комментарий:

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ новый комментарий к базе данных │
└─────────────────────────┘
```

Чтобы удалить комментарий к базе данных:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

Чтобы убедиться, что комментарий был удалён:

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


## См. также {#related-content}

- Предложение [`COMMENT`](/sql-reference/statements/create/table#comment-clause)
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
