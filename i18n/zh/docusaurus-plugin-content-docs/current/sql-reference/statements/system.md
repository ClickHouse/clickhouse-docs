---
description: 'SYSTEM 语句文档'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM 语句'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SYSTEM 语句 {#system-statements}

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有[内部字典](../../sql-reference/dictionaries/index.md)。
默认情况下，内部字典处于禁用状态。
无论内部字典更新结果如何，此命令始终返回 `Ok.`。

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

`SYSTEM RELOAD DICTIONARIES` 查询会重新加载状态为 `LOADED` 的字典（参见 [`system.dictionaries`](/operations/system-tables/dictionaries) 的 `status` 列），即此前已成功加载的字典。
默认情况下，字典采用延迟加载方式（参见 [dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此不会在启动时自动加载，而是在第一次访问时才初始化，例如通过调用 [`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) 函数，或在对 `ENGINE = Dictionary` 的表执行 `SELECT` 查询时加载。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

完全重新加载名为 `dictionary_name` 的字典，不论其当前状态（LOADED / NOT&#95;LOADED / FAILED）如何。
无论更新字典的结果如何，该语句始终返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来查看字典的状态。

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
此语句和 `SYSTEM RELOAD MODEL` 仅会从 clickhouse-library-bridge 中卸载 CatBoost 模型。函数 `catboostEvaluate()`
会在首次访问某个尚未加载的模型时自动加载该模型。
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

从配置文件重新加载所有已注册的[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)或某一个。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有[异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标会根据设置项 [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md) 定期更新，通常无需使用该语句手动触发更新。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。在更改基础设施时（例如更改另一台 ClickHouse 服务器或字典所用服务器的 IP 地址），有时（对于较老的 ClickHouse 版本）需要使用此命令。

若需要更方便的（自动）缓存管理，请参阅 `disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` 参数。

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

清空标记缓存。

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

清除 Iceberg 元数据缓存。

## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

清除文本索引头缓存、字典缓存和倒排索引缓存。

如果你想单独清除其中某一个缓存，可以运行

- `SYSTEM DROP TEXT INDEX HEADER CACHE`,
- `SYSTEM DROP TEXT INDEX DICTIONARY CACHE`, 或
- `SYSTEM DROP TEXT INDEX POSTINGS CACHE`

## SYSTEM DROP REPLICA {#drop-replica}

可以使用以下语法删除 `ReplicatedMergeTree` 表的失效副本:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

这些查询将在 ZooKeeper 中移除 `ReplicatedMergeTree` 副本路径。当某个副本已经失效且由于对应的表已经不存在而无法通过 `DROP TABLE` 从 ZooKeeper 中删除其元数据时，这非常有用。它只会删除非活跃/陈旧的副本，无法删除本地副本，如需删除本地副本请使用 `DROP TABLE`。`DROP REPLICA` 不会删除任何表，也不会从磁盘移除任何数据或元数据。

第一个查询会移除 `database.table` 表中 `'replica_name'` 副本的元数据。
第二个查询会对数据库中所有复制表执行相同的操作。
第三个查询会对本地服务器上的所有复制表执行相同的操作。
第四个查询用于在某个表的所有其他副本都已被删除后，移除失效副本的元数据。它要求显式指定表路径，该路径必须与创建表时传递给 `ReplicatedMergeTree` 引擎第一个参数的路径相同。

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

可以使用以下语句删除 `Replicated` 数据库的失效副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

类似于 `SYSTEM DROP REPLICA`，但用于在没有数据库可执行 `DROP DATABASE` 时，从 ZooKeeper 中移除 `Replicated` 数据库副本的路径。请注意，它不会移除 `ReplicatedMergeTree` 副本（因此可能还需要执行 `SYSTEM DROP REPLICA`）。分片名称和副本名称是在创建数据库时于 `Replicated` 引擎参数中指定的名称。此外，也可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列获取这些名称。如果缺少 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。  
未压缩数据缓存可以在查询/USER/配置文件级别通过 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 设置启用或禁用。  
其大小可以通过服务器级别的设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除编译表达式缓存。
可以通过查询、用户或配置文件级别的设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 启用或禁用编译表达式缓存。

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

清空查询条件缓存。

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

清空[查询缓存](../../operations/query-cache.md)。
如果指定了标签，则只删除具有该标签的查询缓存项。

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

清除从 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 加载的 schema 缓存。

支持的缓存类型：

* Protobuf：从内存中移除已导入的 Protobuf 消息定义。
* Files：删除本地存储在 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 中的 schema 缓存文件，这些文件是在 `format_schema_source` 设置为 `query` 时生成的。
  注意：如果未指定目标类型，则会清除这两种缓存。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

将缓冲的日志消息刷新到 system 数据库中的表，例如 system.query&#95;log。该命令主要用于调试，因为大多数 system 表的默认刷新间隔为 7.5 秒。
即使消息队列为空，此操作也会创建 system 表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果您不想刷新所有日志，可以通过传入日志的名称或其目标表来刷新一个或多个日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。在配置存储于 ZooKeeper 时使用。注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它只会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

重新加载所有访问控制存储，包括：users.xml、本地磁盘访问存储，以及在 ZooKeeper 中的复制访问存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

正常关闭 ClickHouse 服务器（类似于 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## SYSTEM KILL {#kill}

中止 ClickHouse 进程（类似于执行 `kill -9 {$ pid_clickhouse-server}`）

## SYSTEM INSTRUMENT {#instrument}

使用 ClickHouse 在构建时启用 `ENABLE_XRAY=1` 后可用的 LLVM XRay 功能来管理插桩点。
这使您能够在生产环境中进行调试和性能分析，而无需修改源代码，并且只带来极小的开销。
当未添加任何插桩点时，性能损耗可以忽略不计，因为它只是在长度超过 200 条指令的函数入口和出口处额外增加一次跳转到附近地址的指令。

### SYSTEM INSTRUMENT ADD {#instrument-add}

添加一个新的检测点。已插桩的函数可以在 [`system.instrumentation`](../../operations/system-tables/instrumentation.md) 系统表中查看。可以为同一个函数添加多个处理器（handler），它们会按照添加检测点的顺序依次执行。
要插桩的函数可以从 [`system.symbols`](../../operations/system-tables/symbols.md) 系统表中收集。

可以为函数添加三种不同类型的处理器：

**语法**

```sql
SYSTEM INSTRUMENT ADD FUNCTION HANDLER [PARAMETERS]
```

其中 `FUNCTION` 可以是任意函数或其子字符串，例如 `QueryMetricLog::startQuery`，而处理器则是下列选项之一

#### LOG {#instrument-add-log}

在函数的 `ENTRY` 或 `EXIT` 时，输出作为参数提供的文本及其堆栈追踪信息。

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' LOG ENTRY 'this is a log printed at entry'
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' LOG EXIT 'this is a log printed at exit'
```


#### SLEEP {#instrument-add-sleep}

在 `ENTRY` 或 `EXIT` 时休眠固定时长（秒）：

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' SLEEP ENTRY 0.5
```

或者使用在指定最小值和最大值之间均匀分布的随机秒数，并用空格分隔最小值和最大值：

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' SLEEP ENTRY 0 1
```


#### PROFILE {#instrument-add-profile}

测量函数在 `ENTRY` 与 `EXIT` 之间执行所耗费的时间。
分析结果存储在 [`system.trace_log`](../../operations/system-tables/trace_log.md) 表中，并且可以转换为
[Chrome 事件跟踪格式](../../operations/system-tables/trace_log.md#chrome-event-trace-format)。

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' PROFILE
```


### SYSTEM INSTRUMENT REMOVE {#instrument-remove}

用于移除单个检测点：

```sql
SYSTEM INSTRUMENT REMOVE ID
```

使用 `ALL` 参数移除所有检测点：

```sql
SYSTEM INSTRUMENT REMOVE ALL
```

来自子查询的 ID 集合：

```sql
SYSTEM INSTRUMENT REMOVE (SELECT id FROM system.instrumentation WHERE handler = 'log')
```

或所有与给定的 function&#95;name 匹配的插桩点：

```sql
SYSTEM INSTRUMENT REMOVE 'QueryMetricLog::startQuery'
```

插桩点信息可以从 [`system.instrumentation`](../../operations/system-tables/instrumentation.md) 系统表中获取。


## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理[分布式](../../engines/table-engines/special/distributed.md)表。当用户向这些表插入数据时，ClickHouse 会先创建一个需发送到集群节点的数据队列，然后再异步发送这些数据。可以使用 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列的处理。也可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在向分布式表插入数据时禁用后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)（默认设置），数据仍然会被插入到本地分片中。
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 以同步方式将数据发送到集群节点。若有任何节点不可用，ClickHouse 会抛出异常并停止执行该查询。你可以反复重试该查询，直到其成功，也就是当所有节点都重新在线时。

你也可以通过 `SETTINGS` 子句覆盖某些设置，这在规避一些临时限制时很有用，例如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个挂起的数据块都会按照最初 INSERT 查询中的设置存储到磁盘上，因此有时你可能需要覆盖这些设置。
:::


### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

开启在向分布式表插入数据时的后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN {#stop-listen}

关闭套接字，并优雅地终止在指定端口上使用指定协议与服务器建立的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则该命令不会产生任何效果。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* 如果指定了 `CUSTOM 'protocol'` 修饰符，则会停止服务器配置中 `protocols` 部分定义的、具有该名称的自定义协议。
* 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则会停止所有协议，除非在 `EXCEPT` 子句中明确排除。
* 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则会停止所有默认协议，除非在 `EXCEPT` 子句中明确排除。
* 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则会停止所有自定义协议，除非在 `EXCEPT` 子句中明确排除。


### SYSTEM START LISTEN {#start-listen}

允许在指定协议上建立新的连接。

但是，如果指定端口和协议上的服务器不是通过 SYSTEM STOP LISTEN 命令停止的，则此命令不会产生任何效果。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以控制在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表上运行的后台进程。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge />

用于停止 MergeTree 系列表的后台合并操作：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
即使之前已为所有 MergeTree 表停止合并，执行 `DETACH / ATTACH` 表操作仍会为该表启动后台合并。
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

用于为 MergeTree 系列表启动后台合并操作：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

提供根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 停止对 MergeTree 系列表中旧数据进行后台删除的功能：
即使表不存在或表不是 MergeTree 引擎表也会返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES {#start-ttl-merges}

用于为 MergeTree 系列表根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 启动后台旧数据删除操作：
即使表不存在也会返回 `Ok.`。当数据库不存在时则返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES {#stop-moves}

允许为 MergeTree 家族中的表停止根据[带有 TO VOLUME 或 TO DISK 子句的 TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)执行的后台数据移动：
即使表不存在也返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES {#start-moves}

用于为 MergeTree 系列中的表，根据 [带有 TO VOLUME 和 TO DISK 子句的生存时间 (TTL) 表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 启动后台数据移动操作：
即使表不存在也会返回 `Ok.`。当数据库不存在时则返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除具有指定名称的冻结备份。关于解冻单个分区片段的更多信息，请参阅 [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```


### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

等待直到表中所有正在异步加载的数据分区片段（过时的数据分区片段）都加载完成。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中与复制相关的后台进程。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

用于停止 `ReplicatedMergeTree` 系列表中已插入分区片段的后台拉取操作。
无论表引擎类型如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

用于为 `ReplicatedMergeTree` 系列表中已插入的分区片段启动后台拉取操作：
无论表引擎类型如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

提供一种机制，用于在集群中停止将新插入的分区片段以后台方式发送到其他副本，适用于 `ReplicatedMergeTree` 系列表：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

用于在集群中为 `ReplicatedMergeTree` 系列表的新插入分区片段启动到其他副本的后台发送任务：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

用于停止针对 `ReplicatedMergeTree` 系列表、存储在 ZooKeeper 中的复制队列里的后台拉取任务。可能的后台任务类型包括：合并（merges）、拉取（fetches）、变更（mutations）、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

用于从 `ReplicatedMergeTree` 系列表在 Zookeeper 中存储的复制队列中启动后台拉取任务。可能的后台任务类型包括：合并、拉取、变更、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止从复制日志向 `ReplicatedMergeTree` 表的复制队列加载新的记录。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

撤销 `SYSTEM STOP PULLING REPLICATION LOG` 的效果。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA {#sync-replica}

该语句会等待 `ReplicatedMergeTree` 表与集群中的其他副本完成同步，但等待时间不会超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

运行此语句后，`[db.]replicated_merge_tree_family_table_name` 会将公共复制日志中的命令拉取到其自身的复制队列中，然后查询会一直等待，直到该副本处理完所有已拉取的命令。支持以下修饰符：

* 使用 `IF EXISTS`（自 25.6 起可用）时，如果表不存在，查询不会抛出错误。这在向集群中添加新副本时非常有用，即当该副本已经是集群配置的一部分，但仍在创建和同步表的过程中。
* 如果指定了 `STRICT` 修饰符，则查询会等待复制队列变为空。如果复制队列中持续有新条目出现，`STRICT` 版本可能永远不会成功。
* 如果指定了 `LIGHTWEIGHT` 修饰符，则查询只会等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。
  此外，LIGHTWEIGHT 修饰符支持可选的 FROM &#39;srcReplicas&#39; 子句，其中 &#39;srcReplicas&#39; 是以逗号分隔的源副本名称列表。此扩展通过仅关注来自指定源副本的复制任务，实现更有针对性的同步。
* 如果指定了 `PULL` 修饰符，则查询会从 ZooKeeper 中拉取新的复制队列条目，但不会等待处理这些条目。


### SYNC DATABASE REPLICA {#sync-database-replica}

等待直到指定的 [replicated database](/engines/database-engines/replicated)从该数据库的 DDL 队列中应用完所有 schema 更改。

**语法**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA {#restart-replica}

用于为 `ReplicatedMergeTree` 表重新初始化 ZooKeeper 会话状态，会将当前状态与以 ZooKeeper 为权威数据源的状态进行比较，并在需要时向 ZooKeeper 队列中添加任务。
基于 ZooKeeper 数据初始化复制队列的过程与执行 `ATTACH TABLE` 语句时相同。在短时间内，该表将无法执行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA {#restore-replica}

在数据可能仍然存在但 ZooKeeper 元数据丢失时恢复一个副本。

仅适用于只读状态的 `ReplicatedMergeTree` 表。

可以在以下情况下执行该查询：

- ZooKeeper 根 `/` 丢失。
- 副本路径 `/replicas` 丢失。
- 单个副本路径 `/replicas/replica_name/` 丢失。

副本会在本地附加找到的分区片段，并将其信息发送到 ZooKeeper。
在元数据丢失前已经存在于该副本上的分区片段，如果没有过期，则不会从其他副本重新获取（因此恢复副本并不意味着需要通过网络重新下载所有数据）。

:::note
所有状态的分区片段都会被移动到 `detached/` 目录中。数据丢失前处于活动状态（已提交）的分区片段会被重新附加。
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

当数据[可能]仍然存在但 ZooKeeper 元数据已丢失时，用于恢复数据库副本。

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

在多个服务器上创建一张表。当 ZooKeeper 中副本的元数据丢失时，由于缺少元数据，此时该表会被附加为只读表。最后一个查询需要在每个副本上执行。

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

用于为所有 `ReplicatedMergeTree` 表重新初始化 Zookeeper 会话状态，会将当前状态与作为权威来源的 Zookeeper 状态进行比较，并在需要时向 Zookeeper 队列添加任务

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

用于清除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
其代价较高，并且存在被误用的风险。
:::

这会执行 sync 系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

为指定表或所有表加载主键数据。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

为指定的表或所有表卸载主键缓存。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## 管理可刷新materialized view {#refreshable-materialized-views}

用于控制[可刷新materialized view](../../sql-reference/statements/create/view.md#refreshable-materialized-view)后台任务的命令。

在使用它们时，请关注[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### SYSTEM REFRESH VIEW {#refresh-view}

触发一次对指定 VIEW 的计划外立即刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

等待当前正在进行的刷新操作完成。如果刷新失败，则抛出异常。如果当前没有刷新在运行，则立即返回；如果上一次刷新失败，同样会抛出异常。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

禁用指定 VIEW 或所有支持刷新的 VIEW 的周期性刷新。如果刷新正在进行中，也会同时将其取消。

如果 VIEW 位于 Replicated 或 Shared 数据库中，`STOP VIEW` 只影响当前副本，而 `STOP REPLICATED VIEW` 会影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

为指定的 VIEW 或所有可刷新 VIEW 启用定期刷新。不会立即触发刷新。

如果该 VIEW 位于 Replicated 或 Shared 数据库中，`START VIEW` 会撤销 `STOP VIEW` 的效果，而 `START REPLICATED VIEW` 会撤销 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```


### SYSTEM CANCEL VIEW {#cancel-view}

如果当前副本上的指定 VIEW 正在刷新，则中断并取消该刷新；否则，不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW {#system-wait-view}

等待正在运行的刷新完成。如果当前没有刷新在运行，则立即返回。如果最近一次刷新尝试失败，则会报错。

可以在创建新的可刷新materialized view（未使用 `EMPTY` 关键字）之后立刻使用，以等待初始刷新完成。

如果该 VIEW 位于 Replicated 或 Shared 数据库中，并且刷新正在另一副本上运行，则会等待该刷新完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
