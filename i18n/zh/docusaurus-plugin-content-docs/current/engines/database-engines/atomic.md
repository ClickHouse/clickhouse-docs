---
'description': '`Atomic` 引擎支持非阻塞的 `DROP TABLE` 和 `RENAME TABLE` 查询，以及原子的 `EXCHANGE
  TABLES` 查询。默认情况下使用 `Atomic` 数据库引擎。'
'sidebar_label': '原子'
'sidebar_position': 10
'slug': '/engines/database-engines/atomic'
'title': '原子'
---


# Atomic 

`Atomic` 引擎支持非阻塞的 [`DROP TABLE`](#drop-detach-table) 和 [`RENAME TABLE`](#rename-table) 查询，并且支持原子性 [`EXCHANGE TABLES`](#exchange-tables) 查询。 `Atomic` 数据库引擎是默认使用的引擎。

:::note
在 ClickHouse Cloud 中，默认使用的是 `Replicated` 数据库引擎。
:::

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## 具体事项和推荐 {#specifics-and-recommendations}

### 表 UUID {#table-uuid}

`Atomic` 数据库中的每个表都有一个持久的 [UUID](../../sql-reference/data-types/uuid.md)，并将其数据存储在以下目录中：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

其中 `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` 是表的 UUID。

默认情况下，UUID 是自动生成的。然而，用户可以在创建表时显式指定 UUID，但这并不推荐。

例如：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
您可以使用 [show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 设置，通过 `SHOW CREATE` 查询显示 UUID。 
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) 查询不会修改 UUID 或移动表数据。这些查询立即执行，不会等待其他使用该表的查询完成。

### DROP/DETACH TABLE {#drop-detach-table}

使用 `DROP TABLE` 时，不会删除任何数据。 `Atomic` 引擎仅通过将元数据移动到 `/clickhouse_path/metadata_dropped/` 来标记表为已删除，并通知后台线程。在最终删除表数据之前的延迟由 [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 设置指定。
您可以使用 `SYNC` 修饰符指定同步模式。使用 [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 设置来实现这一点。在这种情况下，`DROP` 会等待使用该表的正在运行的 `SELECT`、`INSERT` 和其他查询完成。表在未被使用时将被删除。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) 查询以原子方式交换表或字典。例如，您可以替换以下非原子操作：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
您可以使用原子操作：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### ReplicatedMergeTree 在 Atomic 数据库中 {#replicatedmergetree-in-atomic-database}

对于 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 表，建议不要为 ZooKeeper 中的路径和副本名称指定引擎参数。在这种情况下，将使用配置参数 [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)。如果您想显式指定引擎参数，建议使用 `{uuid}` 宏。这确保在 ZooKeeper 中为每个表自动生成唯一的路径。

## 另见 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) 系统表
