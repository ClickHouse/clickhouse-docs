---
slug: '/sql-reference/statements/alter/comment'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
description: 'Документация для ALTER TABLE ... MODIFY COMMENT, которая позволяет'
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: reference
---
# ALTER TABLE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к таблице, независимо от того, был ли он установлен ранее или нет. Изменение комментария отражается как в [`system.tables`](../../../operations/system-tables/tables.md), так и в запросе `SHOW CREATE TABLE`.

## Syntax {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

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

Чтобы просмотреть измененный комментарий:

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

## Caveats {#caveats}

Для реплицируемых таблиц комментарий может отличаться на разных репликах. Изменение комментария применяется только к одной реплике.

Эта функция доступна с версии 23.9. Она не работает в предыдущих версиях ClickHouse.

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) оператор
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)