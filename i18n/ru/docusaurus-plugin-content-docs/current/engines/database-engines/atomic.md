---
description: 'Движок `Atomic` поддерживает неблокирующее выполнение запросов `DROP TABLE` и `RENAME TABLE`, а также атомарные операции `EXCHANGE TABLES`. Движок базы данных `Atomic` используется по умолчанию.'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic 

Движок `Atomic` поддерживает неблокирующие запросы [`DROP TABLE`](#drop-detach-table) и [`RENAME TABLE`](#rename-table), а также атомарные запросы [`EXCHANGE TABLES`](#exchange-tables). Движок базы данных `Atomic` по умолчанию используется в open-source версии ClickHouse. 

:::note
В ClickHouse Cloud по умолчанию используется [движок базы данных `Shared`](/cloud/reference/shared-catalog#shared-database-engine), который также поддерживает вышеупомянутые операции.
:::



## Создание базы данных

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## Особенности и рекомендации

### UUID таблицы

Каждая таблица в базе данных `Atomic` имеет постоянный идентификатор [UUID](../../sql-reference/data-types/uuid.md) и хранит свои данные в следующем каталоге:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

Где `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` — UUID таблицы.

По умолчанию UUID генерируется автоматически. Однако пользователи могут явно задать UUID при создании таблицы, хотя это не рекомендуется.

Например:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
Вы можете использовать настройку [show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil), чтобы отображать UUID в запросе `SHOW CREATE`.
:::

### RENAME TABLE

Запросы [`RENAME`](../../sql-reference/statements/rename.md) не изменяют UUID и не перемещают данные таблицы. Эти запросы выполняются сразу и не ждут завершения других запросов, использующих таблицу.

### DROP/DETACH TABLE

При использовании `DROP TABLE` данные сразу не удаляются. Движок `Atomic` просто помечает таблицу как удалённую, перемещая её метаданные в `/clickhouse_path/metadata_dropped/` и уведомляя фоновый поток. Задержка перед окончательным удалением данных таблицы задаётся настройкой [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec).
Вы можете указать синхронный режим с помощью модификатора `SYNC`. Для этого используйте настройку [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously). В этом случае `DROP` ожидает завершения выполняющихся `SELECT`, `INSERT` и других запросов, которые используют таблицу. Таблица будет удалена, когда она больше не используется.

### EXCHANGE TABLES/DICTIONARIES

Запрос [`EXCHANGE`](../../sql-reference/statements/exchange.md) атомарно меняет местами таблицы или словари. Например, вместо этой неатомарной операции:

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

можно использовать атомарный вариант:

```sql title="Atomic"
EXCHANGE TABLES новая_таблица AND старая_таблица;
```

### ReplicatedMergeTree в базе данных Atomic

Для таблиц [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) рекомендуется не указывать параметры движка для пути в ZooKeeper и имени реплики. В этом случае будут использоваться параметры конфигурации [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name). Если вы хотите явно задать параметры движка, рекомендуется использовать макрос `{uuid}`. Это гарантирует, что для каждой таблицы в ZooKeeper автоматически генерируются уникальные пути.

### Диск для метаданных

Если в `SETTINGS` указан `disk`, этот диск используется для хранения файлов метаданных таблицы.
Например:

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

Если не указано, по умолчанию используется диск, определённый в `database_disk.disk`.


## См. также {#see-also}

- системная таблица [system.databases](../../operations/system-tables/databases.md)
