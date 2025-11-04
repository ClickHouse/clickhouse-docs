---
'description': 'SYSTEM 语句的文档'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM 语句'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM Statements

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有 [内部字典](../../sql-reference/dictionaries/index.md)。 默认情况下，内部字典被禁用。 无论内部字典更新结果如何，始终返回 `Ok.`。

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

重新加载之前成功加载的所有字典。 默认情况下，字典是懒加载的 (参见 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load))，因此它们不会在启动时自动加载，而是在通过 dictGet 函数或从 ENGINE = Dictionary 的表中 SELECT 时首次访问时被初始化。 `SYSTEM RELOAD DICTIONARIES` 查询重新加载这些字典 (LOADED)。 无论字典更新结果如何，始终返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

完全重新加载字典 `dictionary_name`，不论字典的状态（LOADED / NOT_LOADED / FAILED）。 无论字典更新结果如何，始终返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来检查字典的状态。

```sql
SELECT name, status FROM system.dictionaries;
```

## SYSTEM RELOAD MODELS {#reload-models}

:::note
此语句及 `SYSTEM RELOAD MODEL` 仅从 clickhouse-library-bridge 卸载 catboost 模型。 函数 `catboostEvaluate()` 在首次访问时加载模型（如果尚未加载）。
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD MODEL {#reload-model}

卸载位于 `model_path` 的 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## SYSTEM RELOAD FUNCTIONS {#reload-functions}

重新加载所有注册的 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions) 或从配置文件中重新加载其中之一。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有 [异步指标](../../operations/system-tables/asynchronous_metrics.md)。 由于异步指标会根据设置 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新，因此通常不需要使用此语句手动更新它们。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## SYSTEM DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。有时（对于旧版 ClickHouse），在更改基础架构（更改其他 ClickHouse 服务器的 IP 地址或字典使用的服务器）时，有必要使用此命令。

要更便捷（自动）地管理缓存，请查看 `disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` 参数。

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

清除标记缓存。

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

清除冰山元数据缓存。

## SYSTEM DROP REPLICA {#drop-replica}

可以使用以下语法删除 `ReplicatedMergeTree` 表的死副本：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

查询将从 ZooKeeper 中移除 `ReplicatedMergeTree` 副本路径。 当副本死亡且其元数据无法通过 `DROP TABLE` 从 ZooKeeper 中移除（因为该表再也不存在）时，便是有用的。它只会删除非活动/过时的副本，并且无法删除本地副本，请使用 `DROP TABLE` 来处理。 `DROP REPLICA` 不会删除任何表，也不会从磁盘上移除任何数据或元数据。

第一个将删除 `database.table` 表的 `'replica_name'` 副本元数据。 第二个对数据库中的所有复制表执行相同操作。 第三个对本地服务器上的所有复制表执行相同操作。 第四个用于在删除了表的所有其他副本时，移除死副本的元数据。它要求显式指定表路径。它必须与创建表时传递给 `ReplicatedMergeTree` 引擎的第一个参数相同。

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

可以使用以下语法删除 `Replicated` 数据库的死副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

与 `SYSTEM DROP REPLICA` 相似，但当没有数据库来运行 `DROP DATABASE` 时，从 ZooKeeper 中移除 `Replicated` 数据库副本路径。 请注意，它并不会移除 `ReplicatedMergeTree` 副本（所以您可能也需要 `SYSTEM DROP REPLICA`）。 分片和副本名称是创建数据库时在 `Replicated` 引擎参数中指定的名称。此外，这些名称可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列中获得。如果缺少 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。

## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。未压缩数据缓存通过查询/用户/配置文件级别设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 启用/禁用。其大小可以通过服务器级别设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除编译表达式缓存。 编译表达式缓存通过查询/用户/配置文件级别设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 启用/禁用。

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

清除查询条件缓存。

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Clears the [query cache](../../operations/query-cache.md).
If a tag is specified, only query cache entries with the specified tag are deleted.

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Clears cache for schemas loaded from [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Supported targets:
- Protobuf: Removes imported Protobuf message definitions from memory.
- Files: Deletes cached schema files stored locally in the [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), generated when `format_schema_source` is set to `query`.
Note: If no target is specified, both caches are cleared.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```

## SYSTEM FLUSH LOGS {#flush-logs}

将缓冲的日志消息刷新到系统表，例如 system.query_log。 主要用于调试，因为大多数系统表的默认刷新间隔为 7.5 秒。即使消息队列为空，这也将创建系统表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果您不想刷新所有内容，可以通过传递其名称或目标表来刷新一个或多个单独的日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## SYSTEM RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。 当配置存储在 ZooKeeper 中时使用。 注意 `SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它只会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD USERS {#reload-users}

重新加载所有访问存储，包括： users.xml、本地磁盘访问存储、在 ZooKeeper 中复制的访问存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

正常关闭 ClickHouse（如 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## SYSTEM KILL {#kill}

中止 ClickHouse 进程（如 `kill -9 {$pid_clickhouse-server}`）

## Managing Distributed Tables {#managing-distributed-tables}

ClickHouse 可以管理 [分布式](../../engines/table-engines/special/distributed.md) 表。当用户向这些表插入数据时，ClickHouse 首先创建一个待发送到集群节点的数据队列，然后异步发送数据。可以使用 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询管理队列处理。您还可以使用 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在插入数据到分布式表时，禁用后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)（默认），数据仍然将插入到本地分片。
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 同步发送数据到集群节点。如果任何节点不可用，ClickHouse 将抛出异常并停止查询执行。您可以在查询成功之前重试，直到所有节点重新上线。

您也可以通过 `SETTINGS` 子句覆盖一些设置，这可能有助于避免某些临时限制，如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个待处理的块都以初始 INSERT 查询的设置存储在磁盘上，因此，有时您可能希望覆盖设置。
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

在插入数据到分布式表时，启用后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

关闭套接字并优雅地终止与指定协议的服务器上的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则此命令将无效。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符，则定义在服务器配置的协议部分中的自定义协议将被停止。
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则除非在 `EXCEPT` 子句中指定的协议之外停止所有协议。
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则除非在 `EXCEPT` 子句中指定的协议之外停止所有默认协议。
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则除非在 `EXCEPT` 子句中指定的协议之外停止所有自定义协议。

### SYSTEM START LISTEN {#start-listen}

允许在指定协议上建立新的连接。

但是，如果在未使用 SYSTEM STOP LISTEN 命令停止指定端口和协议的服务器，则此命令将无效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Managing MergeTree Tables {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台处理进程。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

提供停止 MergeTree 系列表的后台合并的可能性：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` 表将即使在先前停止所有 MergeTree 表的合并时也会启动表的后台合并。
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge/>

提供启动 MergeTree 系列表的后台合并的可能性：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

提供停止 MergeTree 系列表根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 背景删除旧数据的可能性：即使表不存在，也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

提供启动 MergeTree 系列表根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 背景删除旧数据的可能性：即使表不存在也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

提供停止 MergeTree 系列表根据 [TTL 表表达式与 TO VOLUME 或 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 背景移动数据的可能性：即使表不存在也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

提供启动 MergeTree 系列表根据 [TTL 表表达式与 TO VOLUME 和 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 背景移动数据的可能性：即使表不存在也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除指定名称的冻结备份。有关解冻单独部分的更多信息，请参见 [ALTER TABLE table_name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

等待所有异步加载的表数据部分（过时数据部分）被加载完成。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Managing ReplicatedMergeTree Tables {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中的与后台复制相关的进程。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

提供停止 `ReplicatedMergeTree` 系列表的插入部分的后台提取的可能性：无论表引擎如何，即使表或数据库不存在，始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

提供启动 `ReplicatedMergeTree` 系列表的插入部分的后台提取的可能性：无论表引擎如何，即使表或数据库不存在，始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

提供停止 `ReplicatedMergeTree` 系列表的新插入部分以发送到集群中其他副本的后台发送的可能性：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

提供启动 `ReplicatedMergeTree` 系列表的新插入部分以发送到集群中其他副本的后台发送的可能性：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

提供停止从存储在 ZooKeeper 中的复制队列中提取后台任务的可能性，适用于 `ReplicatedMergeTree` 系列表。可能的背景任务类型 - 合并、提取、变更、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

提供启动从存储在 ZooKeeper 中的复制队列中提取后台任务的可能性，适用于 `ReplicatedMergeTree` 系列表。可能的背景任务类型 - 合并、提取、变更、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止从 `ReplicatedMergeTree` 表的复制日志中加载新条目到复制队列。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

等待 `ReplicatedMergeTree` 表与集群中的其他副本同步，但不超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

在运行此语句后，`[db.]replicated_merge_tree_family_table_name` 从共同的复制日志提取命令到其自己的复制队列，然后查询等待副本处理所有提取的命令。支持以下修饰符：

- 使用 `IF EXISTS`（自 25.6 起可用）时，如果表不存在，查询不会引发错误。 当向集群添加新副本时，这很有用，当它已经是集群配置的一部分，但仍处于创建和同步表的过程中。
- 如果指定了 `STRICT` 修饰符，则查询会等待复制队列变为空。在新条目不断出现在复制队列的情况下，`STRICT` 版本可能永远不会成功。
- 如果指定了 `LIGHTWEIGHT` 修饰符，查询仅等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。此外，LIGHTWEIGHT 修饰符支持可选的 FROM 'srcReplicas' 子句，其中 'srcReplicas' 是源副本名称的逗号分隔列表。此扩展允许更具针对性的同步，仅关注来自指定源副本的复制任务。
- 如果指定了 `PULL` 修饰符，查询将从 ZooKeeper 提取新的复制队列条目，但不会等待任何处理。

### SYNC DATABASE REPLICA {#sync-database-replica}

等待指定的 [复制数据库](/engines/database-engines/replicated) 从该数据库的 DDL 队列应用所有模式更改。

**语法**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

提供对 `ReplicatedMergeTree` 表重新初始化 Zookeeper 会话状态的可能性，将当前状态与 Zookeeper 作为真实数据源进行比较，如有必要，将任务添加到 Zookeeper 队列。基于 ZooKeeper 数据的复制队列初始化与 `ATTACH TABLE` 语句的过程相同。在短时间内，该表将无法进行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

如果数据 [可能] 存在但 Zookeeper 元数据丢失，则恢复副本。

仅适用于只读的 `ReplicatedMergeTree` 表。

可能在以下情况下执行查询：

- 丢失 ZooKeeper 根 `/`。
- 丢失副本路径 `/replicas`。
- 丢失单个副本路径 `/replicas/replica_name/`。

副本附加本地找到的部分，并将其信息发送到 Zookeeper。在元数据丢失之前存在于副本的部分如果没有过期则不会从其他部分重新提取（因此副本恢复并不意味着通过网络重新下载所有数据）。

:::note
所有状态的部分移至 `detached/` 文件夹。在数据丢失之前处于活动状态（已提交）的部分将被附加。
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

如果数据 [可能] 存在但 Zookeeper 元数据丢失，则恢复副本。

**语法**

```sql
SYSTEM RESTORE DATABASE REPLICA repl_db [ON CLUSTER cluster]
```

**示例**

```sql
CREATE DATABASE repl_db 
ENGINE=Replicated("/clickhouse/repl_db", shard1, replica1);

CREATE TABLE repl_db.test_table (n UInt32)
ENGINE = ReplicatedMergeTree
ORDER BY n PARTITION BY n % 10;

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- root loss.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**语法**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

替代语法：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**示例**

在多台服务器上创建表。 在 ZooKeeper 中丢失副本的元数据后，缺少元数据的表将作为只读附加。最后的查询需要在每个副本上执行。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

另一种方式：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

提供重新初始化所有 `ReplicatedMergeTree` 表的 Zookeeper 会话状态的可能性，将当前状态与 Zookeeper 作为真实数据源进行比较，如果需要，将任务添加到 Zookeeper 队列。

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

允许丢弃文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
这太重且可能被滥用。
:::

将执行同步系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

加载给定表或所有表的主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

卸载给定表或所有表的主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## Managing Refreshable Materialized Views {#refreshable-materialized-views}

控制 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 中的后台任务的命令。

在使用它们时，请注意 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### SYSTEM REFRESH VIEW {#refresh-view}

触发给定视图的立即非计划刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

等待当前正在进行的刷新完成。如果刷新失败，将抛出异常。如果没有刷新正在进行，立即完成，如果先前的刷新失败则抛出异常。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

禁用给定视图或所有可刷新的视图的定期刷新。 如果刷新正在进行，也取消它。

如果视图位于复制或共享数据库中，`STOP VIEW` 仅影响当前副本，而 `STOP REPLICATED VIEW` 影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

启用给定视图或所有可刷新的视图的定期刷新。 不会触发立即刷新。

如果视图位于复制或共享数据库中，`START VIEW` 会恢复 `STOP VIEW` 的效果，而 `START REPLICATED VIEW` 会恢复 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

如果当前副本的给定视图正在进行刷新，则中断并取消它。 否则不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

等待正在进行的刷新完成。如果没有刷新正在进行，即时返回。如果最近的刷新尝试失败，报告错误。

可以在创建新的可刷新的物化视图（不带 EMPTY 关键字）后立即使用，等待初始刷新完成。

如果视图位于复制或共享数据库中，并且刷新在另一个副本上运行，则等待该刷新完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
