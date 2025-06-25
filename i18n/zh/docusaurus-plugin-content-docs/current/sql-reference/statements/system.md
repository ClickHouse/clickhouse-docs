---
'description': 'SYSTEM 语句的文档'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM 语句'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM 语句

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有 [Internal dictionaries](../../sql-reference/dictionaries/index.md)。  
默认情况下，内部字典是禁用的。  
无论内部字典更新的结果如何，总是返回 `Ok.`。

## RELOAD DICTIONARIES {#reload-dictionaries}

重新加载之前成功加载的所有字典。  
默认情况下，字典是懒加载的（见 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此它们不会在启动时自动加载，而是在通过 dictGet 函数或从 ENGINE = Dictionary 的表中执行 SELECT 时首次访问时初始化。  
`SYSTEM RELOAD DICTIONARIES` 查询重新加载这样的字典 (LOADED)。  
无论字典更新的结果如何，总是返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

完全重新加载字典 `dictionary_name`，无论字典的状态（LOADED / NOT_LOADED / FAILED）。  
无论更新字典的结果如何，总是返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来检查字典的状态。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note  
该语句和 `SYSTEM RELOAD MODEL` 仅仅从 clickhouse-library-bridge 中卸载 catboost 模型。函数 `catboostEvaluate()` 在首次访问时加载模型，如果尚未加载。  
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

卸载位于 `model_path` 的 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

从配置文件重新加载所有注册的 [executable user defined functions](/sql-reference/functions/udf#executable-user-defined-functions) 或其中之一。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有 [asynchronous metrics](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标是基于设置 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新的，因此通常不需要使用此语句手动更新它们。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。有时（对于旧版本的 ClickHouse），在更改基础架构（更改另一个 ClickHouse 服务器的 IP 地址或字典所使用的服务器）时，需要使用此命令。

有关更方便的（自动）缓存管理，请参见 disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period 参数。

## DROP MARK CACHE {#drop-mark-cache}

清除标记缓存。

## DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

清除冰山元数据缓存。

## DROP REPLICA {#drop-replica}

可以使用以下语法删除 `ReplicatedMergeTree` 表的死副本：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

查询将删除 ZooKeeper 中的 `ReplicatedMergeTree` 副本路径。这在副本已死亡并且其元数据无法通过 `DROP TABLE` 从 ZooKeeper 中删除（因为不再有该表）的情况下非常有用。它只会删除非活动/过期的副本，无法删除本地副本，请使用 `DROP TABLE` 来执行此操作。`DROP REPLICA` 不会删除任何表，也不会从磁盘中删除任何数据或元数据。

第一个删除 `database.table` 表的 `'replica_name'` 副本的元数据。  
第二个对数据库中所有复制表执行相同操作。  
第三个对本地服务器上所有复制表执行相同操作。  
第四个在删除所有其他副本后，有助于删除损坏副本的元数据。它要求显式指定表路径。它必须与在创建表时传递给 `ReplicatedMergeTree` 引擎的第一个参数相同。

## DROP DATABASE REPLICA {#drop-database-replica}

可以使用以下语法删除 `Replicated` 数据库的死副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

类似于 `SYSTEM DROP REPLICA`，但在没有数据库来运行 `DROP DATABASE` 时，从 ZooKeeper 中删除 `Replicated` 数据库副本路径。请注意，它不会删除 `ReplicatedMergeTree` 副本（因此您可能需要 `SYSTEM DROP REPLICA`）。分片和副本名称是创建数据库时在 `Replicated` 引擎参数中指定的名称。这些名称也可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列获取。如果缺少 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。  
未压缩数据缓存的启用/禁用通过查询/用户/配置文件级设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 进行控制。  
其大小可以使用服务器级设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除编译表达式缓存。  
编译表达式缓存的启用/禁用通过查询/用户/配置文件级设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 进行控制。

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

清除查询条件缓存。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Clears the [query cache](../../operations/query-cache.md).
If a tag is specified, only query cache entries with the specified tag are deleted.

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Clears cache for schemas loaded from [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Supported formats:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

将缓冲的日志消息刷新到系统表，例如 system.query_log。主要用于调试，因为大多数系统表的默认刷新间隔为 7.5 秒。  
即使消息队列为空，这也将创建系统表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果您不想刷新所有内容，可以通过传递其名称或目标表来刷新一个或多个单独的日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。用于在配置存储在 ZooKeeper 中时。请注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它只会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

重新加载所有访问存储，包括：users.xml、本地磁盘访问存储、复制（在 ZooKeeper 中）访问存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常关闭 ClickHouse（如 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## KILL {#kill}

中止 ClickHouse 进程（如 `kill -9 {$ pid_clickhouse-server}`）

## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理 [distributed](../../engines/table-engines/special/distributed.md) 表。用户将数据插入这些表时，ClickHouse 首先创建一个应发送到集群节点的数据队列，然后异步发送。您可以通过 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列处理。您还可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在向分布式表插入数据时，禁用后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note  
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)（默认情况下），数据仍会插入到本地分片。  
:::

### FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 同步发送数据到集群节点。如果任何节点不可用，ClickHouse 将引发异常并停止查询执行。您可以重试查询，直到它成功，所有节点重新上线后将会成功。

您还可以通过 `SETTINGS` 子句覆盖某些设置，这在避免某些临时限制时非常有用，例如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note  
每个待处理块都以初始 INSERT 查询中的设置存储在磁盘中，因此有时您可能希望覆盖设置。  
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

在向分布式表插入数据时，启用后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

关闭套接字并优雅地终止与指定端口和协议的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则此命令将无效。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符，将停止在服务器配置的协议部分中定义的具有指定名称的自定义协议。  
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则会停止所有协议，除非用 `EXCEPT` 子句指定。  
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则会停止所有默认协议，除非用 `EXCEPT` 子句指定。  
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则会停止所有自定义协议，除非用 `EXCEPT` 子句指定。  

### START LISTEN {#start-listen}

允许在指定协议上建立新连接。

但是，如果在指定端口和协议上的服务器未使用 SYSTEM STOP LISTEN 命令停止，则此命令将无效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台过程。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

提供停止 MergeTree 系列表的后台合并的功能：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note  
`DETACH / ATTACH` 表将即使在所有 MergeTree 表的合并被停止的情况下，仍然为表开始后台合并。  
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

提供为 MergeTree 系列表启动后台合并的功能：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

提供停止根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除 MergeTree 系列表中的旧数据的功能：  
即使表不存在或表没有 MergeTree 引擎，也返回 `Ok.`。 当数据库不存在时返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

提供启动根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除 MergeTree 系列表中的旧数据的功能：  
即使表不存在，也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

提供停止根据 [TTL 表表达式与 TO VOLUME 或 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动 MergeTree 系列表中的数据的功能：  
即使表不存在，也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

提供启动根据 [TTL 表表达式与 TO VOLUME 和 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动 MergeTree 系列表中的数据的功能：  
即使表不存在，也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除具有指定名称的冻结备份。有关取消冻结单个部分的更多信息，请参见 [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

等待所有异步加载的表数据部分（过时的数据部分）加载完成。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中的后台复制相关过程。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

提供停止为 `ReplicatedMergeTree` 系列表的插入部分进行后台提取的功能：  
无论表引擎如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

提供开始为 `ReplicatedMergeTree` 系列表的插入部分进行后台提取的功能：  
无论表引擎如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

提供停止针对 `ReplicatedMergeTree` 系列表的新插入部分进行后台发送到集群中其他副本的功能：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

提供开始针对 `ReplicatedMergeTree` 系列表的新插入部分进行后台发送到集群中其他副本的功能：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

提供停止从存储在 Zookeeper 中的复制队列中提取后台提取任务的功能，适用于 `ReplicatedMergeTree` 系列表。可能的后台任务类型 - 合并、提取、变更、DDL 语句及其 ON CLUSTER 子句：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

提供启动从存储在 Zookeeper 中的复制队列中提取后台提取任务的功能，适用于 `ReplicatedMergeTree` 系列表。可能的后台任务类型 - 合并、提取、变更、DDL 语句及其 ON CLUSTER 子句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止从 `ReplicatedMergeTree` 表中的复制日志加载新条目到复制队列。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

等待 `ReplicatedMergeTree` 表与集群中的其他副本同步，但不超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

运行此语句后，`[db.]replicated_merge_tree_family_table_name` 从通用复制日志获取命令到其自身的复制队列中，然后查询等待直至副本处理所有提取的命令。支持以下修饰符：

- 使用 `IF EXISTS`（自 25.6 版本以来可用），如果表不存在，则查询不会抛出错误。这在将新副本添加到集群时非常有用，当它已是集群配置的一部分，但仍在创建和同步表的过程中。  
- 如果指定了 `STRICT` 修饰符，则查询会等待复制队列变为空。如果不断有新条目出现在复制队列中，则 `STRICT` 版本可能永远不会成功。  
- 如果指定了 `LIGHTWEIGHT` 修饰符，则查询仅等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。  
  此外，LIGHTWEIGHT 修饰符支持一个可选的 FROM 'srcReplicas' 子句，其中 'srcReplicas' 是源副本名称的以逗号分隔的列表。该扩展允许通过仅关注源副本中发起的复制任务来实现更有针对性的同步。  
- 如果指定了 `PULL` 修饰符，则查询将从 ZooKeeper 中提取新的复制队列条目，但不等待任何处理。

### SYNC DATABASE REPLICA {#sync-database-replica}

等待指定的 [replicated database](/engines/database-engines/replicated) 应用来自该数据库的 DDL 队列中的所有模式更改。

**语法**  
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

提供重新初始化 `ReplicatedMergeTree` 表的 Zookeeper 会话状态的功能，将当前状态与 Zookeeper 作为真相源进行比较，如有必要，向 Zookeeper 队列添加任务。  
基于 ZooKeeper 数据的复制队列初始化的方式与 `ATTACH TABLE` 语句相同。在短时间内，表将无法执行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

如果数据 [可能] 存在但 Zookeeper 元数据丢失，恢复一个副本。

仅在只读 `ReplicatedMergeTree` 表上有效。

在以下情况下，可以执行查询：

- ZooKeeper 根目录 `/` 丢失。  
- 副本路径 `/replicas` 丢失。  
- 单个副本路径 `/replicas/replica_name/` 丢失。

副本附加本地找到的部分，并将有关它们的信息发送到 Zookeeper。  
在元数据丢失之前，副本上存在的部分不会从其他部分重新提取，如果未过时（因此副本恢复并不意味着重新下载所有数据）。  

:::note  
所有状态的部分都移动到 `detached/` 文件夹。在数据丢失之前处于活动状态的部分（已提交）被附加。  
:::

**语法**  
```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

替代语法：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**示例**

在多个服务器上创建一个表。副本在 ZooKeeper 中的元数据丢失后，表将作为只读附加，因为元数据缺失。最后一个查询需要在每个副本上执行。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

另一种方法：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

提供重新初始化所有 `ReplicatedMergeTree` 表的 Zookeeper 会话状态的功能，将当前状态与 Zookeeper 作为真相源进行比较，如有必要，向 Zookeeper 队列添加任务。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

允许删除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note  
这非常繁重，且有滥用的潜力。  
:::

将执行同步系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

加载给定表或所有表的主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### UNLOAD PRIMARY KEY {#unload-primary-key}

卸载给定表或所有表的主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## 管理可刷新的物化视图 {#refreshable-materialized-views}

控制由 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 执行的后台任务的命令。

在使用它们时，请关注 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### REFRESH VIEW {#refresh-view}

触发给定视图的立即非计划刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

等待当前运行的刷新完成。如果刷新失败，则引发异常。如果没有刷新正在进行，则立即完成，如果之前的刷新失败则抛出异常。

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

禁用给定视图或所有可刷新的视图的定期刷新。如果刷新正在进行，则也取消该刷新。

如果视图在 Replicated 或 Shared 数据库中，`STOP VIEW` 仅影响当前副本，而 `STOP REPLICATED VIEW` 影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```  
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

启用给定视图或所有可刷新的视图的定期刷新。不会触发立即刷新。

如果视图在 Replicated 或 Shared 数据库中，`START VIEW` 撤消 `STOP VIEW` 的效果，`START REPLICATED VIEW` 撤消 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```  
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

如果当前副本的给定视图上正在进行刷新，请中断并取消它。否则不进行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

等待正在进行的刷新完成。如果没有刷新正在进行，则立即返回。如果最新的刷新尝试失败，则报告错误。

可以在创建新可刷新的物化视图（不带 EMPTY 关键字）后立即使用，以等待初始刷新的完成。

如果视图在 Replicated 或 Shared 数据库中，且刷新在其他副本上进行，则等待该刷新完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
