---
description: 'Документация по оператору ALTER TABLE ... MODIFY COMMENT, позволяющему
добавлять, изменять или удалять комментарии к таблице'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---

# ALTER TABLE ... MODIFY COMMENT {#alter-table-modify-comment}

Добавляет, изменяет или удаляет комментарий к таблице, независимо от того, был ли он задан ранее или нет. Изменение комментария отображается как в [`system.tables`](../../../operations/system-tables/tables.md), так и в результате запроса `SHOW CREATE TABLE`.

## Синтаксис {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Примеры {#examples}

Чтобы создать таблицу с комментарием:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

Чтобы изменить комментарий к таблице:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

Чтобы просмотреть обновлённый комментарий:

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

Чтобы удалить комментарий к таблице:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

Чтобы убедиться, что комментарий был удален:

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

## Ограничения {#caveats}

Для таблиц Replicated комментарий может отличаться на разных репликах.
Изменение комментария применяется только к одной реплике.

Эта возможность доступна, начиная с версии 23.9. В предыдущих версиях 
ClickHouse она не работает.

## Связанные материалы {#related-content}

- предложение [`COMMENT`](/sql-reference/statements/create/table#comment-clause)
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
