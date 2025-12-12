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

# ALTER DATABASE ... MODIFY COMMENT {#alter-database-modify-comment}

Добавляет, изменяет или удаляет комментарий к базе данных, независимо от того, был ли он задан ранее. Изменение комментария отражается как в [`system.databases`](/operations/system-tables/databases.md), так и в результате запроса `SHOW CREATE DATABASE`.

## Синтаксис {#syntax}

```

## Examples {#examples}

To create a `DATABASE` with a comment:

```

## Примеры {#examples}

Чтобы создать базу данных (`DATABASE`) с комментарием:

```

To modify the comment:

```

Чтобы отредактировать комментарий:

```

To view the modified comment:

```

Чтобы просмотреть изменённый комментарий:

```

```

```

To remove the database comment:

```

Чтобы удалить комментарий к базе данных:

```

To verify that the comment was removed:

```

Чтобы убедиться, что комментарий был удалён:

```

```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## См. также {#related-content}

- Предложение [`COMMENT`](/sql-reference/statements/create/table#comment-clause)
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
