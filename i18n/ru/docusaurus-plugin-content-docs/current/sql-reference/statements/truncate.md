---
description: 'Документация для операторов TRUNCATE'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'Операторы TRUNCATE'
---


# Операторы TRUNCATE

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

Удаляет все данные из таблицы. Когда условие `IF EXISTS` опущено, запрос возвращает ошибку, если таблица не существует.

Запрос `TRUNCATE` не поддерживается для движков таблиц [View](../../engines/table-engines/special/view.md), [File](../../engines/table-engines/special/file.md), [URL](../../engines/table-engines/special/url.md), [Buffer](../../engines/table-engines/special/buffer.md) и [Null](../../engines/table-engines/special/null.md).

Вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync), чтобы настроить ожидание выполнения действий на репликах.

Вы можете указать, сколько времени (в секундах) ждать, пока неактивные реплики выполнят запросы `TRUNCATE`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note    
Если `alter_sync` установлен на `2` и некоторые реплики неактивны более времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, то выбрасывается исключение `UNFINISHED`.
:::

## TRUNCATE ALL TABLES {#truncate-all-tables}
```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

Удаляет все данные из всех таблиц в базе данных.

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

Удаляет все таблицы из базы данных, но сохраняет саму базу данных. Когда условие `IF EXISTS` опущено, запрос возвращает ошибку, если база данных не существует.

:::note
`TRUNCATE DATABASE` не поддерживается для `Replicated` баз данных. Вместо этого просто `DROP` и `CREATE` базу данных.
:::
