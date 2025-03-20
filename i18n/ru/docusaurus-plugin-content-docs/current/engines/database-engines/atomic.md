---
slug: /engines/database-engines/atomic
sidebar_label: Atomic
sidebar_position: 10
title: 'Atomic'
description: 'Движок `Atomic` поддерживает неблокирующие запросы `DROP TABLE` и `RENAME TABLE`, а также атомарные запросы `EXCHANGE TABLES`. Движок базы данных `Atomic` используется по умолчанию.'
---


# Atomic 

Движок `Atomic` поддерживает неблокирующие [`DROP TABLE`](#drop-detach-table) и [`RENAME TABLE`](#rename-table) запросы, а также атомарные [`EXCHANGE TABLES`](#exchange-tables) запросы. Движок базы данных `Atomic` используется по умолчанию. 

:::note
В ClickHouse Cloud по умолчанию используется движок базы данных `Replicated`.
:::

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## Специфика и рекомендации {#specifics-and-recommendations}

### UUID таблицы {#table-uuid}

Каждая таблица в базе данных `Atomic` имеет постоянный [UUID](../../sql-reference/data-types/uuid.md) и хранит свои данные в следующем каталоге:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

Где `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` - это UUID таблицы.

По умолчанию UUID генерируется автоматически. Однако пользователи могут явно указать UUID при создании таблицы, хотя это не рекомендуется.

Например:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
Вы можете использовать настройку [show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil), чтобы отобразить UUID с помощью запроса `SHOW CREATE`. 
:::

### RENAME TABLE {#rename-table}

Запросы [`RENAME`](../../sql-reference/statements/rename.md) не изменяют UUID и не перемещают данные таблицы. Эти запросы выполняются немедленно и не ждут завершения других запросов, использующих таблицу.

### DROP/DETACH TABLE {#drop-detach-table}

При использовании `DROP TABLE` данные не удаляются. Движок `Atomic` просто помечает таблицу как удаленную, перемещая её метаданные в `/clickhouse_path/metadata_dropped/`, и уведомляет фоновый поток. Задержка перед окончательным удалением данных таблицы задается настройкой [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec).
Вы можете указать синхронный режим, используя модификатор `SYNC`. Для этого используйте настройку [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously). В этом случае `DROP` ожидает завершения работающих запросов `SELECT`, `INSERT` и других запросов, использующих таблицу. Таблица будет удалена, когда она не используется.

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

Запрос [`EXCHANGE`](../../sql-reference/statements/exchange.md) атомарно меняет местами таблицы или словари. Например, вместо этой атомарной операции:

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
вы можете использовать атомарную:

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### ReplicatedMergeTree в атомарной базе данных {#replicatedmergetree-in-atomic-database}

Для таблиц [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) рекомендуется не указывать параметры движка для пути в ZooKeeper и имени реплики. В этом случае будут использоваться параметры конфигурации [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name). Если вы хотите явно указать параметры движка, рекомендуется использовать макрос `{uuid}`. Это гарантирует, что уникальные пути автоматически генерируются для каждой таблицы в ZooKeeper.

## Смотрите также {#see-also}

- [system.databases](../../operations/system-tables/databases.md) системная таблица
