---
description: 'Документация для ALTER TABLE ... MODIFY COMMENT, которая позволяет 
добавлять, изменять или удалять комментарии к таблицам'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
---


# ALTER TABLE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к таблице, независимо от того, 
был он установлен ранее или нет. Изменение комментария отражается как в 
[`system.tables`](../../../operations/system-tables/tables.md), так и в 
запросе `SHOW CREATE TABLE`.

## Синтаксис {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Комментарий'
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
COMMENT 'Временная таблица';
```

Чтобы изменить комментарий таблицы:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'новый комментарий к таблице';
```

Чтобы просмотреть изменённый комментарий:

```sql title="Запрос"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Ответ"
┌─comment────────────────┐
│ новый комментарий к таблице │
└────────────────────────┘
```

Чтобы удалить комментарий таблицы:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

Чтобы проверить, что комментарий был удалён:

```sql title="Запрос"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Ответ"
┌─comment─┐
│         │
└─────────┘
```

## Замечания {#caveats}

Для реплицируемых таблиц комментарий может отличаться на разных репликах. 
Изменение комментария применяется к одной реплике.

Эта функция доступна с версии 23.9. Она не работает в предыдущих версиях 
ClickHouse.

## Связанный контент {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) клаузула
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
