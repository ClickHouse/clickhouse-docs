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

## SYSTEM RELOAD EMBEDDED DICTIONARIES \{#reload-embedded-dictionaries\}

重新加载所有[内部字典](../../sql-reference/dictionaries/index.md)。
默认情况下，内部字典处于禁用状态。
无论内部字典更新结果如何，始终返回 `Ok.`。

## SYSTEM RELOAD DICTIONARIES

`SYSTEM RELOAD DICTIONARIES` 查询会重新加载状态为 `LOADED` 的字典（参见 [`system.dictionaries`](/operations/system-tables/dictionaries) 的 `status` 列），即已成功加载过的字典。
默认情况下，字典采用懒加载方式（参见 [dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此它们不会在启动时自动加载，而是在首次访问时才会初始化，例如通过 [`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) 函数，或在对 `ENGINE = Dictionary` 的表执行 `SELECT` 时进行初始化。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY

强制重新加载字典 `dictionary_name`，不论该字典当前处于何种状态（LOADED / NOT&#95;LOADED / FAILED）。
无论字典更新结果如何，始终返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来查看字典状态。

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS

:::note
此语句以及 `SYSTEM RELOAD MODEL` 仅从 clickhouse-library-bridge 中卸载 CatBoost 模型。函数 `catboostEvaluate()`
会在首次访问且模型尚未加载时再加载模型。
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL

从 `model_path` 卸载 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS

从配置文件中重新加载所有已注册的[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)，或仅重新加载其中一个。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS

重新计算所有[异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标会根据设置项 [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md) 定期更新，通常不需要通过此语句手动更新它们。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE \{#drop-dns-cache\}

清除 ClickHouse 的内部 DNS 缓存。有时（在某些较旧版本的 ClickHouse 中），在变更基础设施时（例如更改另一台 ClickHouse 服务器的 IP 地址，或更改字典所使用的服务器）需要使用此命令。

如需更方便（自动）的缓存管理，请参阅 `disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` 参数。

## SYSTEM DROP MARK CACHE \{#drop-mark-cache\}

清空标记缓存。

## SYSTEM DROP ICEBERG METADATA CACHE \{#drop-iceberg-metadata-cache\}

清除 Iceberg 元数据缓存。

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE \{#drop-text-index-dictionary-cache\}

清除文本索引词典缓存。

## SYSTEM DROP TEXT INDEX HEADER CACHE \{#drop-text-index-header-cache\}

清除文本索引头部缓存。

## SYSTEM DROP TEXT INDEX POSTINGS CACHE \{#drop-text-index-postings-cache\}

清除文本索引 postings 缓存。

## SYSTEM DROP TEXT INDEX CACHES \{#drop-text-index-caches\}

清除文本索引头部缓存、字典缓存以及倒排索引缓存。

## SYSTEM DROP REPLICA

可以使用以下语法来删除 `ReplicatedMergeTree` 表的失效副本：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

这些查询会删除 ZooKeeper 中 `ReplicatedMergeTree` 副本的路径。当某个副本已失效且由于表已不存在而无法通过 `DROP TABLE` 从 ZooKeeper 中移除其元数据时，这个功能非常有用。它只会删除不活动/陈旧的副本，不能删除本地副本；若要删除本地副本，请使用 `DROP TABLE`。`DROP REPLICA` 不会删除任何表，也不会从磁盘删除任何数据或元数据。

第一个语句会移除 `database.table` 表中 `'replica_name'` 副本的元数据。
第二个语句会对该数据库中所有复制表执行相同操作。
第三个语句会对本地服务器上的所有复制表执行相同操作。
第四个语句可用于在同一张表的其他所有副本都已被删除时，移除失效副本的元数据。它要求显式指定表路径，该路径必须与在建表时传递给 `ReplicatedMergeTree` 引擎第一个参数的路径完全相同。


## SYSTEM DROP DATABASE REPLICA

可以使用以下语法删除 `Replicated` 类型数据库的失效副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

与 `SYSTEM DROP REPLICA` 类似，但在没有数据库可执行 `DROP DATABASE` 时，从 ZooKeeper 中移除 `Replicated` 数据库副本路径。请注意，它不会移除 `ReplicatedMergeTree` 副本（因此可能还需要执行 `SYSTEM DROP REPLICA`）。分片名和副本名是创建数据库时在 `Replicated` 引擎参数中指定的名称。此外，这些名称可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列中获取。如果缺少 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名。


## SYSTEM DROP UNCOMPRESSED CACHE \{#drop-uncompressed-cache\}

清除未压缩数据缓存。
未压缩数据缓存可通过查询级 / 用户级 / 配置文件级设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 启用或禁用。
其大小可以通过服务器级设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## SYSTEM DROP COMPILED EXPRESSION CACHE \{#drop-compiled-expression-cache\}

清空已编译表达式缓存。
可通过查询 / 用户 / 配置文件级别的设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 来启用或禁用已编译表达式缓存。

## SYSTEM DROP QUERY CONDITION CACHE \{#drop-query-condition-cache\}

清除查询条件缓存。

## SYSTEM DROP QUERY CACHE

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

清除[查询缓存](../../operations/query-cache.md)。
如果指定了标签，则仅删除带有该标签的查询缓存项。


## SYSTEM DROP FORMAT SCHEMA CACHE

清除从 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 加载的模式缓存。

支持的目标：

* Protobuf：从内存中移除导入的 Protobuf 消息定义。
* Files：删除本地存储在 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) 中的缓存模式文件，这些文件是在 `format_schema_source` 设置为 `query` 时生成的。\
  注意：如果未指定目标，将清除这两个缓存。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS

将缓冲的日志消息刷新到 system 表，例如 system.query&#95;log。此功能主要用于调试，因为大多数 system 表的默认刷新间隔为 7.5 秒。
即使消息队列为空，此操作也会创建 system 表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果你不想刷新全部日志，可以通过传递日志名称或目标表来刷新一个或多个日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG

重新加载 ClickHouse 配置。通常在配置存储于 ZooKeeper 时使用。注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它只会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS

重新加载所有访问控制存储，包括：users.xml、本地磁盘访问控制存储、基于 ZooKeeper 的复制访问控制存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN \{#shutdown\}

<CloudNotSupportedBadge/>

以正常方式关闭 ClickHouse（类似执行 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## SYSTEM KILL \{#kill\}

终止 ClickHouse 进程（例如 `kill -9 {$ pid_clickhouse-server}`)

## 管理分布式表 \{#managing-distributed-tables\}

ClickHouse 可以管理[分布式](../../engines/table-engines/special/distributed.md)表。当用户向这些表插入数据时，ClickHouse 首先创建一个队列，其中包含需要发送到集群节点的数据，然后异步发送这些数据。可以使用 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列的处理。也可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### SYSTEM STOP DISTRIBUTED SENDS

在向分布式表插入数据时，停止后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果启用了 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)（默认启用），写入本地分片的数据仍会照常插入。
:::


### SYSTEM FLUSH DISTRIBUTED

强制 ClickHouse 以同步方式将数据发送到集群节点。如果有任何节点不可用，ClickHouse 会抛出异常并停止查询执行。可以反复重试该查询，直到执行成功，即所有节点都已重新上线。

你还可以通过 `SETTINGS` 子句覆盖某些设置，这在需要绕过一些临时限制（例如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`）时很有用。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<分布式表名称> [ON CLUSTER 集群名称] [SETTINGS ...]
```

:::note
每个待处理的块都会按照最初 INSERT 查询中的设置存储到磁盘上，因此有时可能需要覆盖这些设置。
:::


### SYSTEM START DISTRIBUTED SENDS

在向分布式表插入数据时，启用后台数据分发功能。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN

关闭套接字，并优雅地终止在指定端口上、使用指定协议与服务器建立的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则该命令不会起任何作用。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* 如果指定了 `CUSTOM 'protocol'` 修饰符，则会停止服务器配置中 `protocols` 部分定义的、名称为 `'protocol'` 的自定义协议。
* 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则会停止所有协议，除非在 `EXCEPT` 子句中将其排除。
* 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则会停止所有默认协议，除非在 `EXCEPT` 子句中将其排除。
* 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则会停止所有自定义协议，除非在 `EXCEPT` 子句中将其排除。


### SYSTEM START LISTEN

允许在指定协议上建立新的连接。

但是，如果指定端口和协议上的服务器不是通过 SYSTEM STOP LISTEN 命令停止的，则此命令将不会生效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## 管理 MergeTree 表 \{#managing-mergetree-tables\}

ClickHouse 可以对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台进程进行管理。

### SYSTEM STOP MERGES

<CloudNotSupportedBadge />

用于停止 MergeTree 系列表的后台合并操作：

```sql
SYSTEM STOP MERGES [ON CLUSTER 集群名称] [ON VOLUME <卷名称> | [数据库名.]MergeTree系列表名]
```

:::note
即使之前已为所有 MergeTree 表停止了合并，执行 `DETACH / ATTACH` 表操作仍会为该表启动后台合并。
:::


### SYSTEM START MERGES

<CloudNotSupportedBadge />

用于为 MergeTree 系列表启动后台合并：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES

提供了一种机制，可以为 MergeTree 系列表停止根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 在后台删除旧数据。
即使表不存在或该表不是 MergeTree 引擎，也会返回 `Ok.`。当数据库不存在时会返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER 集群名称] [[库名.]MergeTree系列表名]
```


### SYSTEM START TTL MERGES

为 MergeTree 系列表根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 启动后台删除旧数据的操作：
即使表不存在也会返回 `Ok.`。当数据库不存在时会返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER 集群名称] [[数据库.]合并树系列表名]
```


### SYSTEM STOP MOVES

用于根据 [带有 TO VOLUME 或 TO DISK 子句的 TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 停止 MergeTree 系列表的后台数据迁移操作。
即使表不存在也会返回 `Ok.`。当数据库不存在时会返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES

为 MergeTree 系列表提供根据[带有 TO VOLUME 和 TO DISK 子句的 TTL 表表达式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)启动后台数据移动的能力：
即使表不存在也会返回 `Ok.`，当数据库不存在时则返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE

从所有磁盘中删除具有指定名称的冻结备份。关于解冻单独部分，参见 [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
系统解冻，名称为 <backup_name>
```


### SYSTEM WAIT LOADING PARTS

等待表中所有异步加载的数据分片（过时数据分片）都已加载完成。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER 集群名称] [数据库名.]merge_tree_family_表名
```


## 管理 ReplicatedMergeTree 表 \{#managing-replicatedmergetree-tables\}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中与复制相关的后台进程。

### SYSTEM STOP FETCHES

<CloudNotSupportedBadge />

用于停止对 `ReplicatedMergeTree` 系列表中已插入数据分片的后台拉取操作：
无论表引擎类型如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER 集群名称] [[库名.]复制合并树表族表名]
```


### SYSTEM START FETCHES

<CloudNotSupportedBadge />

用于为 `ReplicatedMergeTree` 系列表中已插入的分片启动后台拉取操作。
无论表引擎类型如何，即使表或数据库不存在，也始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS

提供了一种功能，可针对 `ReplicatedMergeTree` 系列表中新插入的数据部分，停止在集群中将其后台发送到其他副本：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS

为 `ReplicatedMergeTree` 系列表中新插入的分片，提供在集群中向其他副本启动后台发送操作的能力：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER 集群名称] [[数据库.]复制表族表名]
```


### SYSTEM STOP REPLICATION QUEUES

用于停止 `ReplicatedMergeTree` 家族表在 Zookeeper 中存储的复制队列里的后台拉取任务。可能的后台任务类型包括：合并（merges）、拉取（fetches）、变更（mutation）、带有 ON CLUSTER 子句的 DDL 语句。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER 集群名称] [[数据库.]复制表族表名]
```


### SYSTEM START REPLICATION QUEUES

用于从存储在 Zookeeper 中、适用于 `ReplicatedMergeTree` 系列表的复制队列中启动后台拉取任务。可能的后台任务类型包括：合并（merges）、拉取（fetches）、变更（mutation）、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER 集群名称] [[数据库.]复制表族表名]
```


### SYSTEM STOP PULLING REPLICATION LOG

停止从复制日志向 `ReplicatedMergeTree` 表的复制队列加载新条目。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG

撤销 `SYSTEM STOP PULLING REPLICATION LOG` 命令的效果。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA

等待 `ReplicatedMergeTree` 表与集群中的其他副本完成同步，但等待时间不会超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

执行此语句后，`[db.]replicated_merge_tree_family_table_name` 会从公共复制日志中获取命令写入其自身的复制队列，然后查询会等待该副本处理所有已获取的命令。支持以下修饰符：

* 使用 `IF EXISTS`（自 25.6 起可用）时，如果表不存在，查询不会抛出错误。这在向集群中添加新副本时非常有用：该副本已经在集群配置中，但仍处于创建和同步该表的过程中。
* 如果指定了 `STRICT` 修饰符，则查询会一直等待，直到复制队列变为空。若复制队列中持续有新条目出现，`STRICT` 版本的查询可能永远不会成功。
* 如果指定了 `LIGHTWEIGHT` 修饰符，则查询只会等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。
  此外，`LIGHTWEIGHT` 修饰符支持可选的 `FROM 'srcReplicas'` 子句，其中 `'srcReplicas'` 是以逗号分隔的源副本名称列表。此扩展通过仅关注源自指定源副本的复制任务，实现更有针对性的同步。
* 如果指定了 `PULL` 修饰符，则查询会从 ZooKeeper 中拉取新的复制队列条目，但不会等待任何条目被处理。


### SYNC DATABASE REPLICA

等待直到指定的[复制数据库](/engines/database-engines/replicated)从其 DDL 队列中应用完所有模式更改。

**语法**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA

允许重新初始化 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态，会将当前状态与作为权威数据源的 ZooKeeper 进行比较，并在需要时向 ZooKeeper 队列中添加任务。
基于 ZooKeeper 数据初始化复制队列的过程与执行 `ATTACH TABLE` 语句时相同。在短时间内，该表将无法执行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA \{#restore-replica\}

在数据（可能）仍然存在但 ZooKeeper 元数据丢失的情况下恢复副本。

仅适用于只读的 `ReplicatedMergeTree` 表。

可以在以下情况下执行该查询：

- ZooKeeper 根路径 `/` 丢失。
- 副本路径 `/replicas` 丢失。
- 单个副本路径 `/replicas/replica_name/` 丢失。

副本会附加在本地发现的分片（parts），并将这些分片的信息发送到 ZooKeeper。
在元数据丢失之前就已存在于副本上的分片，如果未过期，则不会从其他副本重新获取（因此，恢复副本并不意味着需要通过网络重新下载所有数据）。

:::note
所有状态下的分片都会被移动到 `detached/` 目录。数据丢失前处于活动状态（已提交）的分片会被重新附加。
:::

### SYSTEM RESTORE DATABASE REPLICA

在数据（可能）仍然存在但 ZooKeeper 元数据已丢失的情况下恢复副本。

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

可选语法：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**示例**

在多台服务器上创建表。当 ZooKeeper 中的副本元数据丢失后，由于缺少元数据，表会被以只读方式挂载。最后一个查询需要在每个副本上执行。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- 根路径丢失。

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

另一种方法：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```


### SYSTEM RESTART REPLICAS \{#restart-replicas\}

提供了一种为所有 `ReplicatedMergeTree` 表重新初始化 ZooKeeper 会话状态的机制，会将当前状态与作为权威来源的 ZooKeeper 中的状态进行比较，并在需要时向 ZooKeeper 队列中添加任务。

### SYSTEM DROP FILESYSTEM CACHE

用于释放文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE

:::note
开销过大，并且有被误用的潜在风险。
:::

将执行同步系统调用（syscall）。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY

为指定表或所有表加载主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY

卸载指定表或所有表的主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY（卸载主键）
```


## 管理可刷新物化视图 \{#refreshable-materialized-views\}

用于控制[可刷新物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view)所执行后台任务的命令。

在使用这些视图时，请关注 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### SYSTEM REFRESH VIEW

触发指定视图的一次计划外立即刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW \{#wait-view\}

等待当前正在运行的刷新操作完成。如果刷新失败，则抛出异常。如果当前没有刷新在运行，则立即完成；如果之前的刷新失败，则抛出异常。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS

停止指定视图或所有可刷新视图的周期性刷新。如果刷新正在进行中，则一并取消。

如果视图位于 Replicated 或 Shared 数据库中，`STOP VIEW` 只影响当前副本，而 `STOP REPLICATED VIEW` 会影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
系统停止视图
```


### SYSTEM START [REPLICATED] VIEW, START VIEWS

为指定视图或所有可刷新视图开启周期性刷新。不会触发立即刷新。

如果视图位于 Replicated 或 Shared 数据库中，`START VIEW` 会撤销 `STOP VIEW` 的效果，而 `START REPLICATED VIEW` 会撤销 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```

```sql
系统启动视图
```


### SYSTEM CANCEL VIEW

如果当前副本上的指定视图正在刷新，则中断并取消该刷新；否则不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW

等待正在运行的刷新操作完成。如果当前没有刷新在运行，则立即返回。如果最近一次刷新尝试失败，则返回错误。

可以在创建新的可刷新物化视图（未使用 `EMPTY` 关键字）后立即使用，以等待初始刷新完成。

如果该视图位于 Replicated 或 Shared 数据库中，且刷新在其他副本上运行，则会等待该刷新完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
