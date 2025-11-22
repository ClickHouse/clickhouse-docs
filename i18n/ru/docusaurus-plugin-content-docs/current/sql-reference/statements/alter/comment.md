---
description: 'Документация по ALTER TABLE ... MODIFY COMMENT, которая позволяет
добавлять, изменять или удалять комментарии таблицы'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к таблице, независимо от того, был ли он установлен ранее или нет. Изменение комментария отражается как в [`system.tables`](../../../operations/system-tables/tables.md), так и в выводе запроса `SHOW CREATE TABLE`.



## Синтаксис {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## Примеры {#examples}

Создание таблицы с комментарием:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'Временная таблица';
```

Изменение комментария таблицы:

```sql
ALTER TABLE table_with_comment
MODIFY COMMENT 'новый комментарий к таблице';
```

Просмотр изменённого комментария:

```sql title="Запрос"
SELECT comment
FROM system.tables
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Результат"
┌─comment─────────────────────┐
│ новый комментарий к таблице │
└─────────────────────────────┘
```

Удаление комментария таблицы:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

Проверка удаления комментария:

```sql title="Запрос"
SELECT comment
FROM system.tables
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Результат"
┌─comment─┐
│         │
└─────────┘
```


## Ограничения {#caveats}

Для реплицируемых таблиц комментарий может отличаться на разных репликах.
Изменение комментария применяется только к одной реплике.

Функция доступна начиная с версии 23.9. В предыдущих версиях ClickHouse она не работает.


## Связанное содержимое {#related-content}

- Предложение [`COMMENT`](/sql-reference/statements/create/table#comment-clause)
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
