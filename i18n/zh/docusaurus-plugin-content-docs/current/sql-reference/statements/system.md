---
description: 'SYSTEM 语句文档'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM 语句'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM 语句



## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有[内部字典](../../sql-reference/dictionaries/index.md)。
默认情况下，内部字典处于禁用状态。
无论内部字典更新结果如何，始终返回 `Ok.`。


## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

重新加载所有之前已成功加载的字典。
默认情况下,字典采用延迟加载方式(参见 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)),因此不会在启动时自动加载,而是在首次通过 dictGet 函数访问或从 ENGINE = Dictionary 的表中执行 SELECT 查询时才进行初始化。`SYSTEM RELOAD DICTIONARIES` 查询会重新加载这些已加载的字典(LOADED)。
无论字典更新结果如何,始终返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

完全重新加载字典 `dictionary_name`,无论字典处于何种状态(LOADED / NOT_LOADED / FAILED)。
无论字典更新结果如何,始终返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来检查字典的状态。

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
此语句和 `SYSTEM RELOAD MODEL` 仅从 clickhouse-library-bridge 中卸载 CatBoost 模型。如果模型尚未加载,函数 `catboostEvaluate()` 会在首次访问时加载该模型。
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL {#reload-model}

重新加载位于 `model_path` 的 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS {#reload-functions}

从配置文件中重新加载所有已注册的[可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)或其中某一个函数。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有[异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标会基于配置项 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新,通常无需使用此语句手动更新。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。在更改基础设施时(例如更改另一个 ClickHouse 服务器的 IP 地址或字典所使用的服务器),有时需要使用此命令(适用于旧版本的 ClickHouse)。

如需更便捷的(自动)缓存管理,请参阅 `disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` 参数。


## SYSTEM DROP MARK CACHE {#drop-mark-cache}

清除标记缓存。


## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

清除 Iceberg 元数据缓存。


## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

清空文本索引字典缓存。


## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

清除文本索引头部缓存。


## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

清除文本索引倒排缓存。


## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

清除文本索引头缓存、字典缓存和倒排索引缓存。


## SYSTEM DROP REPLICA {#drop-replica}

可以使用以下语法删除 `ReplicatedMergeTree` 表的失效副本:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

这些查询将删除 ZooKeeper 中的 `ReplicatedMergeTree` 副本路径。当副本已失效且其元数据无法通过 `DROP TABLE` 从 ZooKeeper 中删除时(因为该表已不存在),此操作非常有用。它只会删除非活动/过期的副本,不能删除本地副本,删除本地副本请使用 `DROP TABLE`。`DROP REPLICA` 不会删除任何表,也不会从磁盘中删除任何数据或元数据。

第一种语法删除 `database.table` 表的 `'replica_name'` 副本的元数据。
第二种语法对数据库中的所有复制表执行相同操作。
第三种语法对本地服务器上的所有复制表执行相同操作。
第四种语法用于在表的所有其他副本都已删除时删除失效副本的元数据。它需要显式指定表路径。该路径必须与创建表时传递给 `ReplicatedMergeTree` 引擎第一个参数的路径相同。


## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

可以使用以下语法删除 `Replicated` 数据库的失效副本:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

与 `SYSTEM DROP REPLICA` 类似,但用于在无法运行 `DROP DATABASE` 的情况下从 ZooKeeper 中删除 `Replicated` 数据库副本路径。请注意,该命令不会删除 `ReplicatedMergeTree` 副本(因此您可能还需要使用 `SYSTEM DROP REPLICA`)。分片名称和副本名称是创建数据库时在 `Replicated` 引擎参数中指定的名称。这些名称也可以从 `system.clusters` 表的 `database_shard_name` 和 `database_replica_name` 列中获取。如果省略 `FROM SHARD` 子句,则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。
未压缩数据缓存通过查询/用户/配置文件级别的设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 启用或禁用。
其大小可通过服务器级别的设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 配置。


## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除已编译的表达式缓存。
已编译的表达式缓存通过查询/用户/配置文件级别的设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 启用或禁用。


## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

清空查询条件缓存。


## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

清空[查询缓存](../../operations/query-cache.md)。
如果指定了标签,则仅删除带有指定标签的查询缓存条目。


## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

清除从 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 加载的架构缓存。

支持的目标:

- Protobuf: 从内存中移除已导入的 Protobuf 消息定义。
- Files: 删除本地存储在 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 中的缓存架构文件,这些文件在 `format_schema_source` 设置为 `query` 时生成。
  注意:如果未指定目标,则清除两个缓存。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

将缓冲的日志消息刷新到系统表中,例如 system.query_log。主要用于调试,因为大多数系统表的默认刷新间隔为 7.5 秒。
即使消息队列为空,该命令也会创建系统表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果不想刷新所有日志,可以通过指定日志名称或目标表来刷新一个或多个特定的日志:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。用于配置存储在 ZooKeeper 中的场景。注意：`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，仅会重新加载存储在 `users.xml` 中的 `USER` 配置。若要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

重新加载所有访问存储，包括：users.xml、本地磁盘访问存储、复制访问存储（位于 ZooKeeper 中）。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge />

正常关闭 ClickHouse（类似 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）


## SYSTEM KILL {#kill}

中止 ClickHouse 进程(类似 `kill -9 {$ pid_clickhouse-server}`)


## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理[分布式](../../engines/table-engines/special/distributed.md)表。当用户向这些表插入数据时,ClickHouse 首先创建一个待发送到集群节点的数据队列,然后异步发送。您可以使用 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列处理。您还可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置来同步插入分布式数据。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在向分布式表插入数据时禁用后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)(默认启用),数据仍会插入到本地分片。
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 同步向集群节点发送数据。如果任何节点不可用,ClickHouse 会抛出异常并停止查询执行。您可以重试查询直到成功,当所有节点恢复在线时查询将会成功。

您还可以通过 `SETTINGS` 子句覆盖某些设置,这对于规避某些临时限制(如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`)很有用。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个待处理的数据块都使用初始 INSERT 查询的设置存储在磁盘上,因此有时您可能需要覆盖这些设置。
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

在向分布式表插入数据时启用后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

关闭套接字并优雅地终止指定端口上使用指定协议与服务器的现有连接。

但是,如果在 clickhouse-server 配置中未指定相应的协议设置,此命令将不起作用。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符,将停止服务器配置的协议部分中定义的具有指定名称的自定义协议。
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符,将停止所有协议,除非在 `EXCEPT` 子句中指定例外。
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符,将停止所有默认协议,除非在 `EXCEPT` 子句中指定例外。
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符,将停止所有自定义协议,除非在 `EXCEPT` 子句中指定例外。

### SYSTEM START LISTEN {#start-listen}

允许在指定协议上建立新连接。

但是,如果未使用 SYSTEM STOP LISTEN 命令停止指定端口和协议上的服务器,此命令将不起作用。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台进程。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge />

停止 MergeTree 系列表的后台合并:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
即使之前已为所有 MergeTree 表停止了合并,`DETACH / ATTACH` 表操作也会启动该表的后台合并。
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

启动 MergeTree 系列表的后台合并:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 停止 MergeTree 系列表的后台删除旧数据操作:
即使表不存在或表不是 MergeTree 引擎,也会返回 `Ok.`。当数据库不存在时返回错误:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 启动 MergeTree 系列表的后台删除旧数据操作:
即使表不存在也会返回 `Ok.`。当数据库不存在时返回错误:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

根据 [带有 TO VOLUME 或 TO DISK 子句的 TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 停止 MergeTree 系列表的后台数据移动操作:
即使表不存在也会返回 `Ok.`。当数据库不存在时返回错误:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

根据 [带有 TO VOLUME 和 TO DISK 子句的 TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 启动 MergeTree 系列表的后台数据移动操作:
即使表不存在也会返回 `Ok.`。当数据库不存在时返回错误:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除具有指定名称的冻结备份。有关解冻单独分区的更多信息,请参阅 [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

等待表的所有异步加载数据分区(过时的数据分区)完成加载。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中与后台复制相关的进程。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

提供停止 `ReplicatedMergeTree` 系列表中已插入数据分片的后台拉取功能:
无论表引擎如何,即使表或数据库不存在,也始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

提供启动 `ReplicatedMergeTree` 系列表中已插入数据分片的后台拉取功能:
无论表引擎如何,即使表或数据库不存在,也始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

提供停止向集群中其他副本发送 `ReplicatedMergeTree` 系列表中新插入数据分片的后台发送功能:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

提供启动向集群中其他副本发送 `ReplicatedMergeTree` 系列表中新插入数据分片的后台发送功能:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

提供停止从存储在 Zookeeper 中的复制队列执行 `ReplicatedMergeTree` 系列表的后台任务的功能。可能的后台任务类型包括:合并、拉取、变更、带有 ON CLUSTER 子句的 DDL 语句:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

提供启动从存储在 Zookeeper 中的复制队列执行 `ReplicatedMergeTree` 系列表的后台任务的功能。可能的后台任务类型包括:合并、拉取、变更、带有 ON CLUSTER 子句的 DDL 语句:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止将新条目从复制日志加载到 `ReplicatedMergeTree` 表的复制队列中。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

等待 `ReplicatedMergeTree` 表与集群中的其他副本同步,但不超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

运行此语句后,`[db.]replicated_merge_tree_family_table_name` 从公共复制日志中拉取命令到其自己的复制队列,然后查询等待副本处理所有已拉取的命令。支持以下修饰符:


- 使用 `IF EXISTS`(自 25.6 版本起可用),如果表不存在,查询不会抛出错误。这在向集群添加新副本时很有用,此时副本已是集群配置的一部分,但仍在创建和同步表的过程中。
- 如果指定了 `STRICT` 修饰符,则查询会等待复制队列变为空。如果复制队列中不断出现新条目,`STRICT` 版本可能永远无法成功。
- 如果指定了 `LIGHTWEIGHT` 修饰符,则查询仅等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。
  此外,LIGHTWEIGHT 修饰符支持可选的 FROM 'srcReplicas' 子句,其中 'srcReplicas' 是以逗号分隔的源副本名称列表。此扩展通过仅关注来自指定源副本的复制任务,实现更有针对性的同步。
- 如果指定了 `PULL` 修饰符,则查询从 ZooKeeper 拉取新的复制队列条目,但不等待任何条目被处理。

### SYNC DATABASE REPLICA {#sync-database-replica}

等待指定的[复制数据库](/engines/database-engines/replicated)应用该数据库 DDL 队列中的所有模式变更。

**语法**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

提供为 `ReplicatedMergeTree` 表重新初始化 Zookeeper 会话状态的功能,将当前状态与作为权威来源的 Zookeeper 进行比较,并在需要时向 Zookeeper 队列添加任务。
基于 ZooKeeper 数据的复制队列初始化方式与 `ATTACH TABLE` 语句相同。在短时间内,该表将无法进行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

如果数据[可能]存在但 Zookeeper 元数据丢失,则恢复副本。

仅适用于只读的 `ReplicatedMergeTree` 表。

可以在以下情况后执行查询:

- ZooKeeper 根路径 `/` 丢失。
- 副本路径 `/replicas` 丢失。
- 单个副本路径 `/replicas/replica_name/` 丢失。

副本会附加本地找到的数据分片并将相关信息发送到 Zookeeper。
如果元数据丢失前副本上存在的数据分片未过时,则不会从其他副本重新获取(因此副本恢复不意味着通过网络重新下载所有数据)。

:::note
所有状态的数据分片都会移动到 `detached/` 文件夹。数据丢失前处于活动状态(已提交)的数据分片会被附加。
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

如果数据[可能]存在但 Zookeeper 元数据丢失,则恢复副本。

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

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- 根路径丢失。

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**语法**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

替代语法:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**示例**

在多个服务器上创建表。在 ZooKeeper 中副本的元数据丢失后,由于元数据缺失,该表将以只读方式附加。最后一个查询需要在每个副本上执行。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- 根路径丢失。

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

另一种方式:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

提供为所有 `ReplicatedMergeTree` 表重新初始化 Zookeeper 会话状态的功能,将当前状态与作为权威来源的 Zookeeper 进行比较,并在需要时向 Zookeeper 队列添加任务


### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

删除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
此操作开销较大,存在被误用的风险。
:::

将执行 sync 系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

加载指定表或所有表的主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

卸载指定表或所有表的主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## 管理可刷新物化视图 {#refreshable-materialized-views}

用于控制[可刷新物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view)执行的后台任务的命令

使用这些命令时,请留意 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) 表。

### SYSTEM REFRESH VIEW {#refresh-view}

触发指定视图的即时非计划刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

等待当前正在运行的刷新完成。如果刷新失败,则抛出异常。如果没有刷新正在运行,则立即完成;如果上一次刷新失败,则抛出异常。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

禁用指定视图或所有可刷新视图的定期刷新。如果刷新正在进行中,也会将其取消。

如果视图位于 Replicated 或 Shared 数据库中,`STOP VIEW` 仅影响当前副本,而 `STOP REPLICATED VIEW` 影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

启用指定视图或所有可刷新视图的定期刷新。不会触发即时刷新。

如果视图位于 Replicated 或 Shared 数据库中,`START VIEW` 撤销 `STOP VIEW` 的效果,而 `START REPLICATED VIEW` 撤销 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

如果当前副本上指定视图的刷新正在进行中,则中断并取消该刷新。否则不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

等待正在运行的刷新完成。如果没有刷新正在运行,则立即返回。如果最近一次刷新尝试失败,则报告错误。

可以在创建新的可刷新物化视图(不使用 EMPTY 关键字)后立即使用此命令,以等待初始刷新完成。

如果视图位于 Replicated 或 Shared 数据库中,且刷新正在另一个副本上运行,则等待该刷新完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
