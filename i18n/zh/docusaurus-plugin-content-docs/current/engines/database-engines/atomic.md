---
description: '`Atomic` 引擎支持非阻塞的 `DROP TABLE` 和 `RENAME TABLE` 查询，以及原子性的 `EXCHANGE TABLES` 查询。默认数据库引擎为 `Atomic`。'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic  {#atomic}

`Atomic` 引擎支持非阻塞的 [`DROP TABLE`](#drop-detach-table) 和 [`RENAME TABLE`](#rename-table) 查询，以及原子性的 [`EXCHANGE TABLES`](#exchange-tables) 查询。在开源 ClickHouse 中，默认使用 `Atomic` 数据库引擎。 

:::note
在 ClickHouse Cloud 中，默认使用 [`Shared` 数据库引擎](/cloud/reference/shared-catalog#shared-database-engine)，它同样支持上述操作。
:::



## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## 具体说明和建议 {#specifics-and-recommendations}

### 表 UUID {#table-uuid}

`Atomic` 数据库中的每个表都有一个持久的 [UUID](../../sql-reference/data-types/uuid.md)，其数据存储在以下目录中：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

其中 `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` 是该表的 UUID。

默认情况下，UUID 会自动生成。不过，用户在创建表时也可以显式指定该 UUID，但不推荐这样做。

例如：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
您可以使用 [show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 设置，在 `SHOW CREATE` 查询中显示 UUID。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) 查询不会修改 UUID，也不会移动表数据。此类查询会立即执行，并且不会等待正在使用该表的其他查询完成。

### DROP/DETACH TABLE {#drop-detach-table}

使用 `DROP TABLE` 时，不会立即删除任何数据。`Atomic` 引擎只是通过将表的元数据移动到 `/clickhouse_path/metadata_dropped/` 并通知后台线程，将该表标记为已删除。最终删除表数据前的延迟由 [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 设置指定。
您可以使用 `SYNC` 修饰符指定同步模式，可以通过 [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 设置来实现。在这种情况下，`DROP` 会等待正在运行且使用该表的 `SELECT`、`INSERT` 以及其他查询完成。当表不再被使用时，它将被删除。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) 查询会以原子方式交换表或字典。例如，您可以用它替代如下非原子操作：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

你可以使用一个原子类型：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### 原子数据库中的 ReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

对于 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 表，建议不要在引擎参数中显式指定 ZooKeeper 路径和副本名称。在这种情况下，将使用配置参数 [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)。如果需要显式指定引擎参数，建议使用 `{uuid}` 宏。这样可以确保为 ZooKeeper 中的每个表自动生成唯一路径。

### 元数据磁盘 {#metadata-disk}

当在 `SETTINGS` 中指定了 `disk` 时，将使用该磁盘来存储表的元数据文件。
例如：

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

若未指定，默认使用在 `database_disk.disk` 中定义的磁盘。


## 另请参阅 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) 系统表
