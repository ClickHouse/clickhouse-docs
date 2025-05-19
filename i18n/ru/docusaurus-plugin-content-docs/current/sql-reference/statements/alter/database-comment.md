---
description: 'Документация по командам ALTER DATABASE ... MODIFY COMMENT, 
которые позволяют добавлять, изменять или удалять комментарии к базе данных.'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'Команды ALTER DATABASE ... MODIFY COMMENT'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
---


# ALTER DATABASE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к базе данных, независимо от того, был ли он установлен ранее или нет. Изменение комментария отражается как в [`system.databases`](/operations/system-tables/databases.md), так и в запросе `SHOW CREATE DATABASE`.

## Синтаксис {#syntax}

``` sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Комментарий'
```

## Примеры {#examples}

Чтобы создать `DATABASE` с комментариями:

``` sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'Временная база данных';
```

Чтобы изменить комментарий:

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'новый комментарий к базе данных';
```

Чтобы просмотреть изменённый комментарий:

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ новый комментарий к базе │
└─────────────────────────┘
```

Чтобы удалить комментарий к базе данных:

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

Чтобы убедиться, что комментарий был удалён:

```sql title="Запрос"
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text title="Ответ"
┌─comment─┐
│         │
└─────────┘
```

## Связанный контент {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) клаузула
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
