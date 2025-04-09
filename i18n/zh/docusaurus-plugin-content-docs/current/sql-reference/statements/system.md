---
slug: /sql-reference/statements/system
sidebar_position: 36
sidebar_label: SYSTEM
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM 语句

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有 [内部字典](../../sql-reference/dictionaries/index.md)。  
默认情况下，内部字典是禁用的。  
无论内部字典更新的结果如何，总是返回 `Ok.`。

## RELOAD DICTIONARIES {#reload-dictionaries}

重新加载之前成功加载的所有字典。  
默认情况下，字典是懒加载的（请参见 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此它们不是在启动时自动加载，而是在通过 dictGet 函数或者从 ENGINE = Dictionary 表中首次访问时初始化。`SYSTEM RELOAD DICTIONARIES` 查询重新加载此类字典（已加载）。  
无论字典更新的结果如何，总是返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

无论字典的状态（已加载 / 未加载 / 失败）如何，完全重新加载字典 `dictionary_name`。  
无论更新字典的结果如何，总是返回 `Ok.`。

``` sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来检查字典的状态。

``` sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
此语句和 `SYSTEM RELOAD MODEL` 仅仅从 clickhouse-library-bridge 中卸载 catboost 模型。函数 `catboostEvaluate()` 在首次访问时加载模型（如果尚未加载）。
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

在 `model_path` 卸载 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

重新加载所有注册的 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions) 或从配置文件中加载其中一个。

**语法**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有 [异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标是基于设置 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新，因此通常不需要通过此语句手动更新它们。

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。有时（对于旧版 ClickHouse），在更改基础设施（更改另一个 ClickHouse 服务器的 IP 地址或用于字典的服务器）时，需要使用此命令。

有关更方便（自动）的缓存管理，请参见 disable_internal_dns_cache, dns_cache_max_entries, dns_cache_update_period 参数。

## DROP MARK CACHE {#drop-mark-cache}

清除标记缓存。

## DROP REPLICA {#drop-replica}

使用以下语法可以删除 `ReplicatedMergeTree` 表的死副本：

``` sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

查询将删除 ZooKeeper 中的 `ReplicatedMergeTree` 副本路径。当副本死掉且其元数据无法通过 `DROP TABLE` 从 ZooKeeper 中删除（因为该表不再存在）时，这一点尤其有用。它只会删除非活动的、过时的副本，无法删除本地副本，请使用 `DROP TABLE` 来处理。`DROP REPLICA` 不会删除任何表，也不会从磁盘中移除任何数据或元数据。

第一个查询删除 `'replica_name'` 副本的 `database.table` 表的元数据。  
第二个查询对数据库中的所有复制表执行相同操作。  
第三个查询对本地服务器上的所有复制表执行相同操作。  
第四个查询在删除了表的所有其他副本时如何使用以删除死副本的元数据。它要求明确指定表路径，必须与在创建表时传递给 `ReplicatedMergeTree` 引擎的第一个参数相同。

## DROP DATABASE REPLICA {#drop-database-replica}

使用以下语法可以删除 `Replicated` 数据库的死副本：

``` sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

类似于 `SYSTEM DROP REPLICA`，但在没有要执行 `DROP DATABASE` 的数据库时，从 ZooKeeper 中移除 `Replicated` 数据库副本路径。请注意，它不会删除 `ReplicatedMergeTree` 副本（因此您可能还需要 `SYSTEM DROP REPLICA`）。分片和副本名称是在创建数据库时在 `Replicated` 引擎参数中指定的名称。此外，可以通过 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列获取这些名称。如果省略了 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。  
未压缩数据缓存的启用/禁用可以通过查询/用户/文件级别设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 进行配置。  
其大小可以通过服务器级别设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除已编译表达式缓存。  
已编译表达式缓存的启用/禁用可以通过查询/用户文件级别设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 进行配置。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

清除 [查询缓存](../../operations/query-cache.md)。  
如果指定了标签，则仅删除具有指定标签的查询缓存条目。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

清除从 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 加载的模式的缓存。

支持的格式：

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

如果不想刷新所有内容，可以通过传递它们的名称或目标表来刷新一个或多个单独的日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。用于在 ZooKeeper 中存储配置时。请注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，仅会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

重新加载所有访问存储，包括：users.xml、本地磁盘访问存储、在 ZooKeeper 中复制的访问存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常关闭 ClickHouse（如 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## KILL {#kill}

终止 ClickHouse 进程（如 `kill -9 {$ pid_clickhouse-server}`）

## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理 [分布式](../../engines/table-engines/special/distributed.md) 表。当用户向这些表插入数据时，ClickHouse 首先创建要发送到集群节点的数据队列，然后异步发送。  
您可以通过 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询管理队列处理。您还可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在向分布式表插入数据时，禁用后台数据分发。

``` sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)（默认），数据将仍然插入到本地分片。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 同步将数据发送到集群节点。如果有任何节点不可用，ClickHouse 将抛出异常并停止查询执行。您可以重试查询，直到它成功，这将在所有节点重新上线时发生。

您还可以通过 `SETTINGS` 子句覆盖某些设置，这可能对于避免一些临时限制（如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`）很有用。

``` sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个待处理块都按照初始 INSERT 查询的设置存储在磁盘中，因此这就是有时您可能需要覆盖设置的原因。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

在向分布式表插入数据时，启用后台数据分发。

``` sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

关闭套接字，并优雅地终止与指定端口和指定协议的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则此命令将无效。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符，则将停止在服务器配置的协议部分中定义的具有指定名称的自定义协议。
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则停止所有协议，除非使用 `EXCEPT` 子句另行指定。
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则停止所有默认协议，除非使用 `EXCEPT` 子句另行指定。
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则停止所有自定义协议，除非使用 `EXCEPT` 子句另行指定。

### START LISTEN {#start-listen}

允许在指定协议上建立新连接。

但是，如果未通过 SYSTEM STOP LISTEN 命令停止指定端口和协议的服务器，则此命令将无效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台进程。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

提供了停止 MergeTree 家族表的后台合并的可能性：

``` sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` 表将启动表的后台合并，即使之前已停止所有 MergeTree 表的合并。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

提供了启动 MergeTree 家族表的后台合并的可能性：

``` sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

提供了停止 MergeTree 家族表的根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除旧数据的后台进程的可能性：  
即使表不存在或表没有 MergeTree 引擎，也会返回 `Ok.`；  
当数据库不存在时返回错误：

``` sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

提供了启动 MergeTree 家族表的根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除旧数据的后台进程的可能性：  
即使表不存在，也会返回 `Ok.`；  
当数据库不存在时返回错误：

``` sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

提供了停止 MergeTree 家族表根据 [TTL 表达式和 TO VOLUME 或 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动数据的后台进程的可能性：  
即使表不存在，也会返回 `Ok.`；  
当数据库不存在时返回错误：

``` sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

提供了启动 MergeTree 家族表根据 [TTL 表达式和 TO VOLUME 与 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动数据的后台进程的可能性：  
即使表不存在，也会返回 `Ok.`；  
当数据库不存在时返回错误：

``` sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除指定名称的冻结备份。有关解冻单个部分的更多信息，请参见 [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

``` sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

等待直到表的所有异步加载数据部分（过时数据部分）被加载。

``` sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中的后台复制相关进程。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

提供了停止为 `ReplicatedMergeTree` 家族表插入部分的后台获取的可能性：  
无论表引擎如何，甚至当表或数据库不存在时，总是返回 `Ok.`。

``` sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

提供了启动为 `ReplicatedMergeTree` 家族表插入部分的后台获取的可能性：  
无论表引擎如何，甚至当表或数据库不存在时，总是返回 `Ok.`。

``` sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

提供了停止将新插入部分的后台发送到集群中其他副本的可能性：

``` sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

提供了启动将新插入部分的后台发送到集群中其他副本的可能性：

``` sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

提供了停止从 Zookeeper 中存储的复制队列中后台获取任务的可能性，该任务适用于 `ReplicatedMergeTree` 家族表。可能的后台任务类型 - 合并、获取、变更、带有 ON CLUSTER 子句的 DDL 语句：

``` sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

提供了启动从 Zookeeper 中存储的复制队列中后台获取任务的可能性，该任务适用于 `ReplicatedMergeTree` 家族表。可能的后台任务类型 - 合并、获取、变更、带有 ON CLUSTER 子句的 DDL 语句：

``` sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止从 `ReplicatedMergeTree` 表的复制日志中加载新条目到复制队列。

``` sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

``` sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

等待 `ReplicatedMergeTree` 表与集群中的其他副本同步，但不超过 `receive_timeout` 秒。

``` sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

执行此语句后，`[db.]replicated_merge_tree_family_table_name` 从公共复制日志中提取命令到其自己的复制队列，然后查询等待副本处理所有提取的命令。支持以下修饰符：

- 如果指定了 `STRICT` 修饰符，则查询等待复制队列变为空。如果 `STRICT` 版本在复制队列中不断出现新条目，则可能永远无法成功。
- 如果指定了 `LIGHTWEIGHT` 修饰符，则查询仅等待处理 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目。   
  此外，LIGHTWEIGHT 修饰符支持可选的 FROM 'srcReplicas' 子句，其中 'srcReplicas' 是源副本名称的逗号分隔列表。此扩展允许通过仅关注来自指定源副本的复制任务来实现更有针对性的同步。
- 如果指定了 `PULL` 修饰符，则查询从 ZooKeeper 中提取新的复制队列条目，但不等待任何内容被处理。

### SYNC DATABASE REPLICA {#sync-database-replica}

等待指定的 [复制数据库](/engines/database-engines/replicated) 应用该数据库的所有架构变更。

**语法**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

提供了重新初始化 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，将当前状态与 ZooKeeper 作为真实来源进行比较，并在需要时将任务添加到 ZooKeeper 队列中。  
基于 ZooKeeper 数据初始化复制队列的过程与 `ATTACH TABLE` 语句相同。暂时表将不适用于任何操作。

``` sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

如果数据 [可能] 存在但 ZooKeeper 元数据丢失，则恢复副本。

仅在只读 `ReplicatedMergeTree` 表上有效。

可以在以下情况下执行查询：

- ZooKeeper 根 `/` 丢失。
- 副本路径 `/replicas` 丢失。
- 单独副本路径 `/replicas/replica_name/` 丢失。

副本附加本地找到的部分，并将有关它们的信息发送到 ZooKeeper。  
在元数据丢失之前，在副本上存在的部分在没有过期的情况下不会从其他部分重新获取（因此副本恢复并不是意味着重新下载所有数据）。

:::note
所有状态的部分都被移动到 `detached/` 文件夹。数据丢失之前处于活动状态的部分（已提交）被附加。
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

在多个服务器上创建表。当副本的元数据在 ZooKeeper 中丢失时，表将作为只读附加，因为元数据丢失。最后一个查询需要在每个副本上执行。

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

### RESTART REPLICAS {#restart-replicas}

提供了重新初始化所有 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，实现状态与 ZooKeeper 作为真实来源进行比较，并在需要时将任务添加到 ZooKeeper 队列中。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

允许删除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
这很重，并且可能被滥用。
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

控制 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 执行的后台任务的命令。

在使用它们时请关注 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### REFRESH VIEW {#refresh-view}

立即触发给定视图的调度外刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

等待读取当前运行的刷新完成。如果刷新失败，则抛出异常。如果没有刷新正在运行，则立即完成，并在上一个刷新失败的情况下抛出异常。

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

禁用给定视图或所有可刷新的视图的周期性刷新。如果有刷新正在进行中，也取消它。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START VIEW, START VIEWS {#start-view-start-views}

启用给定视图或所有可刷新的视图的周期性刷新。不会触发立即的刷新。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

如果给定视图正在进行中刷新，则中断并取消它。否则什么也不做。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

等待正在进行的刷新完成。如果没有刷新正在进行，则立即返回。如果最后一次刷新尝试失败，则报告错误。

可在创建新的可刷新的物化视图后（无 EMPTY 关键字）使用，以等待初始刷新的完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
