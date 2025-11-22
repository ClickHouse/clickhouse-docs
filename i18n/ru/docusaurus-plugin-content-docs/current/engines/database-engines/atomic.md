---
description: '`Atomic` поддерживает неблокирующие запросы `DROP TABLE` и `RENAME TABLE`, а также атомарные запросы `EXCHANGE TABLES`. По умолчанию используется движок базы данных `Atomic`.'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic 

Движок базы данных `Atomic` поддерживает неблокирующие запросы [`DROP TABLE`](#drop-detach-table) и [`RENAME TABLE`](#rename-table), а также атомарные запросы [`EXCHANGE TABLES`](#exchange-tables). По умолчанию в open-source ClickHouse используется движок базы данных `Atomic`. 

:::note
В ClickHouse Cloud по умолчанию используется [движок базы данных `Shared`](/cloud/reference/shared-catalog#shared-database-engine), который также поддерживает указанные выше операции.
:::



## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## Особенности и рекомендации {#specifics-and-recommendations}

### UUID таблицы {#table-uuid}

Каждая таблица в базе данных `Atomic` имеет постоянный [UUID](../../sql-reference/data-types/uuid.md) и хранит свои данные в следующем каталоге:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

Где `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` — это UUID таблицы.

По умолчанию UUID генерируется автоматически. Однако пользователи могут явно указать UUID при создании таблицы, хотя это не рекомендуется.

Например:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
Вы можете использовать настройку [show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) для отображения UUID в запросе `SHOW CREATE`.
:::

### RENAME TABLE {#rename-table}

Запросы [`RENAME`](../../sql-reference/statements/rename.md) не изменяют UUID и не перемещают данные таблицы. Эти запросы выполняются немедленно и не ожидают завершения других запросов, использующих таблицу.

### DROP/DETACH TABLE {#drop-detach-table}

При использовании `DROP TABLE` данные не удаляются. Движок `Atomic` просто помечает таблицу как удалённую, перемещая её метаданные в `/clickhouse_path/metadata_dropped/` и уведомляя фоновый поток. Задержка перед окончательным удалением данных таблицы задаётся настройкой [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec).
Вы можете указать синхронный режим с помощью модификатора `SYNC`. Для этого используйте настройку [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously). В этом случае `DROP` ожидает завершения выполняющихся запросов `SELECT`, `INSERT` и других запросов, использующих таблицу. Таблица будет удалена, когда она не используется.

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

Запрос [`EXCHANGE`](../../sql-reference/statements/exchange.md) атомарно меняет местами таблицы или словари. Например, вместо этой неатомарной операции:

```sql title="Неатомарная"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

можно использовать атомарную:

```sql title="Атомарная"
EXCHANGE TABLES new_table AND old_table;
```

### ReplicatedMergeTree в базе данных Atomic {#replicatedmergetree-in-atomic-database}

Для таблиц [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) рекомендуется не указывать параметры движка для пути в ZooKeeper и имени реплики. В этом случае будут использоваться параметры конфигурации [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name). Если вы хотите явно указать параметры движка, рекомендуется использовать макрос `{uuid}`. Это обеспечивает автоматическую генерацию уникальных путей для каждой таблицы в ZooKeeper.

### Диск метаданных {#metadata-disk}

Когда параметр `disk` указан в `SETTINGS`, диск используется для хранения файлов метаданных таблицы.
Например:

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

Если не указано, по умолчанию используется диск, определённый в `database_disk.disk`.


## См. также {#see-also}

- Системная таблица [system.databases](../../operations/system-tables/databases.md)
