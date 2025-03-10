---
slug: /sql-reference/statements/alter/comment
sidebar_position: 51
sidebar_label: COMMENT
---


# ALTER TABLE ... MODIFY COMMENT

Добавляет, изменяет или удаляет комментарий к таблице, независимо от того, был он установлен ранее или нет. Изменение комментария отражается в обеих [system.tables](../../../operations/system-tables/tables.md) и запросе `SHOW CREATE TABLE`.

**Синтаксис**

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Комментарий'
```

**Примеры**

Создание таблицы с комментарием (для получения дополнительной информации см. клаузу [COMMENT](/sql-reference/statements/create/table#comment-clause)):

``` sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'Временная таблица';
```

Изменение комментария к таблице:

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT 'новый комментарий к таблице';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

Вывод нового комментария:

```text
┌─comment────────────────┐
│ новый комментарий к таблице │
└────────────────────────┘
```

Удаление комментария к таблице:

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

Вывод удаленного комментария:

```text
┌─comment─┐
│         │
└─────────┘
```

**Замечания**

Для реплицированных таблиц комментарий может отличаться на разных репликах. Изменение комментария применяется только к одной реплике.

Эта функция доступна с версии 23.9. Она не работает в предыдущих версиях ClickHouse.
