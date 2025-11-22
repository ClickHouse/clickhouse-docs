---
description: 'Документация по операторам ALTER DATABASE ... MODIFY COMMENT,
позволяющим добавлять, изменять или удалять комментарии базы данных.'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'Операторы ALTER DATABASE ... MODIFY COMMENT'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER DATABASE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к базе данных, независимо от того, был ли комментарий установлен ранее или нет. Изменение комментария отражается как в [`system.databases`](/operations/system-tables/databases.md), так и в результате запроса `SHOW CREATE DATABASE`.



## Синтаксис {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## Примеры {#examples}

Создание базы данных `DATABASE` с комментарием:

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'Временная база данных';
```

Изменение комментария:

```sql
ALTER DATABASE database_with_comment
MODIFY COMMENT 'новый комментарий к базе данных';
```

Просмотр изменённого комментария:

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

Удаление комментария базы данных:

```sql
ALTER DATABASE database_with_comment
MODIFY COMMENT '';
```

Проверка удаления комментария:

```sql title="Запрос"
SELECT comment
FROM system.databases
WHERE  name = 'database_with_comment';
```

```text title="Ответ"
┌─comment─┐
│         │
└─────────┘
```


## Связанный контент {#related-content}

- Предложение [`COMMENT`](/sql-reference/statements/create/table#comment-clause)
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
