---
'description': '系统语句的文档'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM 语句'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 系统语句

## 重新加载嵌入式字典 {#reload-embedded-dictionaries}

重新加载所有 [内部字典](../../sql-reference/dictionaries/index.md)。
默认情况下，内部字典是禁用的。
无论内部字典更新的结果如何，始终返回 `Ok.`。

## 重新加载字典 {#reload-dictionaries}

重新加载所有之前成功加载的字典。
默认情况下，字典是惰性加载的（参见 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此它们不会在启动时自动加载，而是在首次通过 dictGet 函数或从 ENGINE = Dictionary 的表中执行 SELECT 时初始化。 `SYSTEM RELOAD DICTIONARIES` 查询重新加载这样的字典 (LOADED)。
无论字典更新的结果如何，始终返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## 重新加载字典 {#reload-dictionary}

完全重新加载字典 `dictionary_name`，而不考虑字典的状态 (LOADED / NOT_LOADED / FAILED)。
无论更新字典的结果如何，始终返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

可以通过查询 `system.dictionaries` 表来检查字典的状态。

```sql
SELECT name, status FROM system.dictionaries;
```

## 重新加载模型 {#reload-models}

:::note
此语句和 `SYSTEM RELOAD MODEL` 仅从 clickhouse-library-bridge 卸载 catboost 模型。如果尚未加载模型，函数 `catboostEvaluate()`
在首次访问时加载该模型。
:::

卸载所有 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## 重新加载模型 {#reload-model}

在 `model_path` 处卸载 CatBoost 模型。

**语法**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## 重新加载函数 {#reload-functions}

从配置文件重新加载所有注册的 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions) 或其中一个。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## 重新加载异步指标 {#reload-asynchronous-metrics}

重新计算所有 [异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标是根据设置 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新的，因此通常不需要使用此语句手动更新它们。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## 删除 DNS 缓存 {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。有时（对于旧版本的 ClickHouse），在更改基础设施（更改另一台 ClickHouse 服务器的 IP 地址或用于字典的服务器）时需要使用此命令。

有关更方便（自动）缓存管理的设置，请参见 disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period 参数。

## 删除标记缓存 {#drop-mark-cache}

清除标记缓存。

## 删除 Iceberg 元数据缓存 {#drop-iceberg-metadata-cache}

清除 iceberg 元数据缓存。

## 删除副本 {#drop-replica}

可以使用以下语法删除 `ReplicatedMergeTree` 表的死副本：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

查询将删除 ZooKeeper 中的 `ReplicatedMergeTree` 副本路径。这在副本死亡且其元数据无法通过 `DROP TABLE` 从 ZooKeeper 中删除时非常有用，因为该表不再存在。它只会删除不活动/过期的副本，不能删除本地副本，请使用 `DROP TABLE` 来执行此操作。 `DROP REPLICA` 不会删除任何表，也不会从磁盘中移除任何数据或元数据。

第一个命令删除 `database.table` 表的 `'replica_name'` 副本的元数据。
第二个命令对数据库中的所有复制表执行相同操作。
第三个命令对本地服务器上的所有复制表执行相同操作。
第四个命令在表的所有其他副本被删除时，删除死副本的元数据。此时必须显式指定表路径。它必须与创建表时传递给 `ReplicatedMergeTree` 引擎的第一个参数相同。

## 删除数据库副本 {#drop-database-replica}

可以使用以下语法删除 `Replicated` 数据库的死副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

类似于 `SYSTEM DROP REPLICA`，但在没有数据库可以执行 `DROP DATABASE` 时，从 ZooKeeper 中删除 `Replicated` 数据库副本路径。请注意，它不会删除 `ReplicatedMergeTree` 副本（因此您可能还需要使用 `SYSTEM DROP REPLICA`）。分片和副本名称是创建数据库时在 `Replicated` 引擎参数中指定的名称。这些名称还可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列中获得。如果省略了 `FROM SHARD` 子句，那么 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。

## 删除未压缩缓存 {#drop-uncompressed-cache}

清除未压缩数据缓存。
未压缩数据缓存通过查询/用户/配置级别设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) 启用/禁用。
其大小可以通过服务器级别设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## 删除已编译表达式缓存 {#drop-compiled-expression-cache}

清除已编译的表达式缓存。
已编译表达式缓存通过查询/用户/配置级别设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) 启用/禁用。

## 删除查询条件缓存 {#drop-query-condition-cache}

清除查询条件缓存。

## 删除查询缓存 {#drop-query-cache}

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

## 刷新日志 {#flush-logs}

将缓冲的日志消息刷新到系统表中，例如 system.query_log。主要用于调试，因为大多数系统表的默认刷新间隔为 7.5 秒。
即使消息队列为空，这也将创建系统表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果您不想刷新所有内容，可以通过传递其名称或目标表来刷新一个或多个单独的日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## 重新加载配置 {#reload-config}

重新加载 ClickHouse 配置。当配置存储在 ZooKeeper 中时使用。请注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它仅重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## 重新加载用户 {#reload-users}

重新加载所有访问存储，包括：users.xml、本地磁盘访问存储、在 ZooKeeper 中复制的访问存储。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## 关闭 {#shutdown}

<CloudNotSupportedBadge/>

正常关闭 ClickHouse（如 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## 杀死 {#kill}

中止 ClickHouse 进程（如 `kill -9 {$ pid_clickhouse-server}`）

## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理 [分布式](../../engines/table-engines/special/distributed.md) 表。当用户向这些表插入数据时，ClickHouse 首先创建一个数据队列，该数据队列应该发送到集群节点，然后异步发送。您可以使用 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列处理。您还可以通过 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置同步插入分布式数据。

### 停止分发发送 {#stop-distributed-sends}

禁用在向分布式表插入数据时的后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) 处于启用状态（默认为启用），数据将仍然插入到本地分片。
:::

### 刷新分发 {#flush-distributed}

强制 ClickHouse 同步发送数据到集群节点。如果任何节点不可用，ClickHouse 会抛出异常并停止查询执行。您可以重试查询，直到成功，这将在所有节点恢复在线时发生。

您还可以通过 `SETTINGS` 子句覆盖某些设置，这对于避免某些临时限制（如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`）很有用。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个待处理块都以最初 INSERT 查询的设置存储在磁盘中，因此有时您可能希望覆盖设置。
:::

### 启动分发发送 {#start-distributed-sends}

启用向分布式表插入数据时的后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### 停止监听 {#stop-listen}

关闭套接字并优雅地终止与指定端口和指定协议的服务器的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则此命令将无效。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符，则将停止在服务器配置的协议部分定义的具有指定名称的自定义协议。
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则将停止所有协议，除非使用 `EXCEPT` 子句指定。
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则将停止所有默认协议，除非使用 `EXCEPT` 子句指定。
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则将停止所有自定义协议，除非使用 `EXCEPT` 子句指定。

### 启动监听 {#start-listen}

允许在指定协议上建立新的连接。

但是，如果未使用 SYSTEM STOP LISTEN 命令停止指定端口和协议上的服务器，则此命令将无效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台进程。

### 停止合并 {#stop-merges}

<CloudNotSupportedBadge/>

提供停止 MergeTree 家族中表的后台合并的可能性：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` 表将在停止所有 MergeTree 表合并的情况下仍会启动后台合并。
:::

### 启动合并 {#start-merges}

<CloudNotSupportedBadge/>

提供启动 MergeTree 家族中表的后台合并的可能性：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### 停止 TTL 合并 {#stop-ttl-merges}

提供停止根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 在 MergeTree 家族中表中后台删除旧数据的可能性：
即使表不存在或表没有 MergeTree 引擎，仍返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### 启动 TTL 合并 {#start-ttl-merges}

提供根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 在 MergeTree 家族中表中后台删除旧数据的可能性：
即使表不存在，仍返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### 停止移动 {#stop-moves}

提供根据 [TTL 表表达式使用 TO VOLUME 或 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 在 MergeTree 家族中表中后台移动数据的可能性：
即使表不存在，仍返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### 启动移动 {#start-moves}

提供根据 [TTL 表达式使用 TO VOLUME 和 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 在 MergeTree 家族中表中后台移动数据的可能性：
即使表不存在，仍返回 `Ok.`。当数据库不存在时返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### 系统解冻 {#query_language-system-unfreeze}

从所有磁盘中清除具有指定名称的已冻结备份。有关解冻单独部分的信息，请参见 [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### 等待加载部分 {#wait-loading-parts}

等待直到表的所有异步加载数据部分（过时的数据部分）变为已加载。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中与后台复制相关的进程。

### 停止获取 {#stop-fetches}

<CloudNotSupportedBadge/>

提供停止 `ReplicatedMergeTree` 家族表的新插入部分的后台获取的可能性：
无论表引擎如何，即使表或数据库不存在，始终返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 启动获取 {#start-fetches}

<CloudNotSupportedBadge/>

提供启动 `ReplicatedMergeTree` 家族表的新插入部分的后台获取的可能性：
无论表引擎如何，即使表或数据库不存在，始终返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 停止复制发送 {#stop-replicated-sends}

提供停止向集群中的其他副本发送新插入部分的后台发送的可能性：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 启动复制发送 {#start-replicated-sends}

提供启动向集群中的其他副本发送新插入部分的后台发送的可能性：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 停止复制队列 {#stop-replication-queues}

提供停止从存储在 ZooKeeper 中的复制队列中的后台获取任务的可能性，这些任务可用于 `ReplicatedMergeTree` 家族表。可能的后台任务类型 - 合并、获取、变更、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 启动复制队列 {#start-replication-queues}

提供启动从存储在 ZooKeeper 中的复制队列中的后台获取任务的可能性，这些任务可用于 `ReplicatedMergeTree` 家族表。可能的后台任务类型 - 合并、获取、变更、带有 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 停止拉取复制日志 {#stop-pulling-replication-log}

停止从 `ReplicatedMergeTree` 表的复制日志加载新条目到复制队列中。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 启动拉取复制日志 {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### 同步副本 {#sync-replica}

等待 `ReplicatedMergeTree` 表与集群中的其他副本同步，但不超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

在运行此语句后，`[db.]replicated_merge_tree_family_table_name` 从公共复制日志中获取命令到其自己的复制队列中，然后查询等待直到副本处理所有获取的命令。支持以下修饰符：

- 如果指定了 `STRICT` 修饰符，则查询将等待复制队列为空。 `STRICT` 版本在复制队列中不断出现新条目时可能永远不会成功。
- 如果指定了 `LIGHTWEIGHT` 修饰符，则查询仅等待处理 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目。
  此外，LIGHTWEIGHT 修饰符支持可选的 FROM 'srcReplicas' 子句，其中 'srcReplicas' 是以逗号分隔的源副本名称列表。此扩展允许通过仅关注来自指定源副本的复制任务，实现更有针对性的同步。
- 如果指定了 `PULL` 修饰符，则查询将从 ZooKeeper 中提取新的复制队列条目，但不会等待任何东西被处理。

### 同步数据库副本 {#sync-database-replica}

等待指定的 [复制数据库](/engines/database-engines/replicated) 应用该数据库的 DDL 队列中的所有模式更改。

**语法**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### 重启副本 {#restart-replica}

提供重新初始化 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，将当前状态与 ZooKeeper 作为真实来源进行比较，并在需要时将任务添加到 ZooKeeper 队列。
基于 ZooKeeper 数据初始化复制队列的方式与 `ATTACH TABLE` 语句的方式相同。在短时间内，表将无法进行任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### 还原副本 {#restore-replica}

如果数据 [可能] 存在但 ZooKeeper 元数据丢失，则还原副本。

仅在只读 `ReplicatedMergeTree` 表上工作。

可以在以下情况下执行查询：

- ZooKeeper 根目录 `/` 丢失。
- 副本路径 `/replicas` 丢失。
- 单个副本路径 `/replicas/replica_name/` 丢失。

副本附加本地找到的部分，并将有关它们的信息发送到 ZooKeeper。
在元数据丢失之前存在于副本上的部分不会从其他部分重新获取，如果未过时（因此副本恢复并不意味着需要通过网络重新下载所有数据）。

:::note
所有状态的部分都移动到 `detached/` 文件夹。数据丢失之前处于活动状态的部分（已提交）将被附加。
:::

**语法**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

备用语法：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**示例**

在多台服务器上创建表。在 ZooKeeper 中丢失副本的元数据之后，表将作为只读附加，因为缺少元数据。最后的查询需要在每个副本上执行。

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

### 重启副本 {#restart-replicas}

提供重新初始化所有 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，将当前状态与 ZooKeeper 进行比较，并在需要时将任务添加到 ZooKeeper 队列。

### 删除文件系统缓存 {#drop-filesystem-cache}

允许删除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### 同步文件缓存 {#sync-file-cache}

:::note
这太繁重并且有滥用的潜力。
:::

将执行同步系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### 加载主键 {#load-primary-key}

加载给定表或所有表的主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### 卸载主键 {#unload-primary-key}

卸载给定表或所有表的主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## 管理可刷新的物化视图 {#refreshable-materialized-views}

控制由 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 执行的后台任务的命令。

在使用它们时，请注意 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### 刷新视图 {#refresh-view}

触发给定视图的即时非计划刷新。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### 刷新视图 {#refresh-view-1}

等待当前正在运行的刷新完成。如果刷新失败，则抛出异常。如果没有刷新正在进行，立即完成，如果先前的刷新失败则抛出异常。

### 停止 [复制] 视图，停止视图 {#stop-view-stop-views}

禁用给定视图或所有可刷新的视图的定期刷新。如果刷新正在进行，也取消它。

如果视图在复制或共享数据库中，`STOP VIEW` 仅影响当前副本，而 `STOP REPLICATED VIEW` 会影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### 启动 [复制] 视图，启动视图 {#start-view-start-views}

启用给定视图或所有可刷新的视图的定期刷新。不会触发即时刷新。

如果视图在复制或共享数据库中，`START VIEW` 会撤销 `STOP VIEW` 的效果，而 `START REPLICATED VIEW` 会撤销 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### 取消视图 {#cancel-view}

如果当前副本的给定视图正在进行刷新，则中断并取消它。否则不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### 系统等待视图 {#system-wait-view}

等待运行中的刷新完成。如果没有刷新正在进行，立即返回。如果最新的刷新尝试失败，报告错误。

可以在创建新的可刷新的物化视图（无 EMPTY 关键字）之后立即使用，以等待初始刷新完成。

如果视图在复制或共享数据库中，且刷新正在另一副本上进行，等待该刷新的完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
