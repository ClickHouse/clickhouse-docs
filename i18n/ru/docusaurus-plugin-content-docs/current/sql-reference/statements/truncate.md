---
slug: /sql-reference/statements/truncate
sidebar_position: 52
sidebar_label: TRUNCATE
---


# Операции TRUNCATE

## TRUNCATE TABLE {#truncate-table}
``` sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

Удаляет все данные из таблицы. Если опущен параметр `IF EXISTS`, то запрос возвращает ошибку, если таблица не существует.

Запрос `TRUNCATE` не поддерживается для движков таблиц [View](../../engines/table-engines/special/view.md), [File](../../engines/table-engines/special/file.md), [URL](../../engines/table-engines/special/url.md), [Buffer](../../engines/table-engines/special/buffer.md) и [Null](../../engines/table-engines/special/null.md).

Вы можете использовать параметр [alter_sync](/operations/settings/settings#alter_sync) для настройки ожидания выполнения действий на репликах.

Вы можете указать, как долго (в секундах) ждать выполнения запросов `TRUNCATE` на неактивных репликах с помощью параметра [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note    
Если `alter_sync` установлен в `2` и некоторые реплики не активны более указанного времени по параметру `replication_wait_for_inactive_replica_timeout`, то будет выброшено исключение `UNFINISHED`.
:::

## TRUNCATE ALL TABLES {#truncate-all-tables}
``` sql
TRUNCATE ALL TABLES FROM [IF EXISTS] db [ON CLUSTER cluster]
```

Удаляет все данные из всех таблиц в базе данных.

## TRUNCATE DATABASE {#truncate-database}
``` sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

Удаляет все таблицы из базы данных, но сохраняет саму базу данных. Если опущен параметр `IF EXISTS`, то запрос возвращает ошибку, если база данных не существует.

:::note
`TRUNCATE DATABASE` не поддерживается для `Replicated` баз данных. Вместо этого просто `DROP` и `CREATE` базу данных.
:::
