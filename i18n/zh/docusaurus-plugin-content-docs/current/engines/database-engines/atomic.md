---
'description': '`Atomic` 引擎支持非阻塞的 `DROP TABLE` 和 `RENAME TABLE` 查询，以及原子的 `EXCHANGE
  TABLES` 查询。默认情况下使用 `Atomic` 数据库引擎。'
'sidebar_label': '原子'
'sidebar_position': 10
'slug': '/engines/database-engines/atomic'
'title': '原子'
'doc_type': 'reference'
---


# 原子引擎

`Atomic` 引擎支持非阻塞的 [`DROP TABLE`](#drop-detach-table) 和 [`RENAME TABLE`](#rename-table) 查询，以及原子性的 [`EXCHANGE TABLES`](#exchange-tables) 查询。`Atomic` 数据库引擎是开源 ClickHouse 的默认引擎。

:::note
在 ClickHouse Cloud 中，默认使用 [`Shared` 数据库引擎](/cloud/reference/shared-catalog#shared-database-engine)，也支持上述操作。
:::

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```

## 特性和建议 {#specifics-and-recommendations}

### 表 UUID {#table-uuid}

`Atomic` 数据库中的每个表都有一个持久的 [UUID](../../sql-reference/data-types/uuid.md)，并将其数据存储在以下目录中：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

其中 `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` 是表的 UUID。

默认情况下，UUID 是自动生成的。然而，用户在创建表时可以显式指定 UUID，但不推荐这样做。

例如：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
您可以使用 [show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 设置，在 `SHOW CREATE` 查询中显示 UUID。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) 查询不会修改 UUID 或移动表数据。这些查询会立即执行，并且不会等待其他使用该表的查询完成。

### DROP/DETACH TABLE {#drop-detach-table}

使用 `DROP TABLE` 时，不会移除任何数据。`Atomic` 引擎只是通过将表的元数据移动到 `/clickhouse_path/metadata_dropped/` 来将表标记为已删除，并通知后台线程。在最终删除表数据之前的延迟由 [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 设置指定。
您可以使用 `SYNC` 修饰符指定同步模式。使用 [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 设置来实现。在这种情况下，`DROP` 等待正在运行的 `SELECT`、`INSERT` 和其他使用该表的查询完成。当表不再使用时，将被删除。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) 查询原子性地交换表或字典。例如，您可以使用以下原子操作替代此非原子操作：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
您可以使用一个原子操作：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### 原子数据库中的 ReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

对于 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 表，建议不要为 ZooKeeper 中的路径和副本名称指定引擎参数。在这种情况下，将使用配置参数 [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)。如果您想显式指定引擎参数，建议使用 `{uuid}` 宏。这确保为每个表在 ZooKeeper 中自动生成唯一的路径。

### 元数据磁盘 {#metadata-disk}
当在 `SETTINGS` 中指定 `disk` 时，该磁盘用于存储表的元数据文件。
例如：

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```
如果未指定，将默认使用 `database_disk.disk` 中定义的磁盘。

## 另请参见 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) 系统表
