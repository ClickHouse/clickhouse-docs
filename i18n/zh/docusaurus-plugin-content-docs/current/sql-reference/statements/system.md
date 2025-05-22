import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SYSTEM 语句

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

重新加载所有 [内部字典](../../sql-reference/dictionaries/index.md)。
默认情况下，内部字典被禁用。
无论内部字典更新的结果如何，总是返回 `Ok.`。

## RELOAD DICTIONARIES {#reload-dictionaries}

重新加载之前成功加载的所有字典。
默认情况下，字典是懒加载的（请参阅 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)），因此它们不是在启动时自动加载，而是在通过 dictGet 函数或从 ENGINE = Dictionary 的表中第一次访问时初始化。`SYSTEM RELOAD DICTIONARIES` 查询重新加载这些字典（LOADED）。
无论字典更新的结果如何，总是返回 `Ok.`。

**语法**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

完全重新加载字典 `dictionary_name`，无论字典的状态是（LOADED / NOT_LOADED / FAILED）。
无论更新字典的结果如何，总是返回 `Ok.`。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

字典的状态可以通过查询 `system.dictionaries` 表进行检查。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
此语句和 `SYSTEM RELOAD MODEL` 仅卸载 catboost 模型。函数 `catboostEvaluate()`
在第一次访问时加载模型，如果它尚未加载。
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

重新加载所有注册的 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions) 或从配置文件中加载其中一个。

**语法**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

重新计算所有 [异步指标](../../operations/system-tables/asynchronous_metrics.md)。由于异步指标是基于设置 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 定期更新的，因此通常不需要使用此语句手动更新它们。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

清除 ClickHouse 的内部 DNS 缓存。有时（对于旧的 ClickHouse 版本），在更改基础设施（更改其他 ClickHouse 服务器的 IP 地址或字典使用的服务器）时，需要使用此命令。

有关更方便（自动）的缓存管理，请参见 disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period 参数。

## DROP MARK CACHE {#drop-mark-cache}

清除标记缓存。

## DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

清除冰山元数据缓存。

## DROP REPLICA {#drop-replica}

使用以下语法删除 `ReplicatedMergeTree` 表的死副本：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

查询将删除 ZooKeeper 中的 `ReplicatedMergeTree` 副本路径。当副本死亡并且无法通过 `DROP TABLE` 从 ZooKeeper 中删除其元数据时，这很有用，因为该表已不存在。它只会删除非活动/过时副本，无法删除本地副本，请使用 `DROP TABLE` 进行删除。`DROP REPLICA` 不会删除任何表，也不从磁盘中删除任何数据或元数据。

第一个命令删除 `database.table` 表的 `'replica_name'` 副本元数据。
第二个命令对数据库中的所有复制表执行相同操作。
第三个命令对本地服务器上的所有复制表执行相同操作。
第四个命令可用于在删除了表的所有其他副本时，删除死副本的元数据。它需要显式指定表路径。必须与创建表时传递给 `ReplicatedMergeTree` 引擎的第一个参数相同。

## DROP DATABASE REPLICA {#drop-database-replica}

使用以下语法删除 `Replicated` 数据库的死副本：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

与 `SYSTEM DROP REPLICA` 类似，但在没有数据库执行 `DROP DATABASE` 时，从 ZooKeeper 中删除 `Replicated` 数据库副本路径。请注意，它不会删除 `ReplicatedMergeTree` 副本（因此您可能还需要 `SYSTEM DROP REPLICA`）。分片和副本名称是在创建数据库时在 `Replicated` 引擎参数中指定的名称。此外，这些名称可以从 `system.clusters` 中的 `database_shard_name` 和 `database_replica_name` 列获取。如果省略 `FROM SHARD` 子句，则 `replica_name` 必须是 `shard_name|replica_name` 格式的完整副本名称。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

清除未压缩数据缓存。
未压缩数据缓存的启用/禁用通过查询/用户/配置文件级别设置 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)。
其大小可以通过服务器级别设置 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) 进行配置。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

清除编译的表达式缓存。
编译的表达式缓存的启用/禁用通过查询/用户/配置文件级别设置 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions)。

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
即使消息队列为空，这也会创建系统表。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

如果您不想刷新所有内容，您可以通过传递它们的名称或目标表来刷新一个或多个单独的日志：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

重新加载 ClickHouse 配置。当配置存储在 ZooKeeper 中时使用。注意，`SYSTEM RELOAD CONFIG` 不会重新加载存储在 ZooKeeper 中的 `USER` 配置，它只会重新加载存储在 `users.xml` 中的 `USER` 配置。要重新加载所有 `USER` 配置，请使用 `SYSTEM RELOAD USERS`

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

正常关闭 ClickHouse（如 `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`）

## KILL {#kill}

中止 ClickHouse 进程（如 `kill -9 {$ pid_clickhouse-server}`）

## 管理分布式表 {#managing-distributed-tables}

ClickHouse 可以管理 [分布式](../../engines/table-engines/special/distributed.md) 表。当用户向这些表中插入数据时，ClickHouse 首先创建一个应发送到集群节点的数据队列，然后异步发送它。您可以通过 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed) 和 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 查询来管理队列处理。您还可以使用 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 设置以同步方式插入分布式数据。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

在向分布式表插入数据时禁用后台数据分发。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
如果 [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) 被启用（默认），则数据仍然会插入到本地分片。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

强制 ClickHouse 同步将数据发送到集群节点。如果任何节点不可用，ClickHouse 将抛出异常并停止查询执行。您可以重试查询，直到成功为止，这将在所有节点重新上线时发生。

您还可以通过 `SETTINGS` 子句覆盖一些设置，这对于避免某些临时限制（如 `max_concurrent_queries_for_all_users` 或 `max_memory_usage`）可能很有用。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
每个待处理的块都以初始 INSERT 查询的设置存储在磁盘中，因此有时您可能希望覆盖设置。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

在向分布式表插入数据时启用后台数据分发。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

关闭套接字并优雅地终止与指定协议的服务器的现有连接。

但是，如果在 clickhouse-server 配置中未指定相应的协议设置，则此命令将无效。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- 如果指定了 `CUSTOM 'protocol'` 修饰符，则将在服务器配置的协议部分定义的自定义协议被停止。
- 如果指定了 `QUERIES ALL [EXCEPT .. [,..]]` 修饰符，则停止所有协议，除非使用 `EXCEPT` 子句指定。
- 如果指定了 `QUERIES DEFAULT [EXCEPT .. [,..]]` 修饰符，则停止所有默认协议，除非使用 `EXCEPT` 子句指定。
- 如果指定了 `QUERIES CUSTOM [EXCEPT .. [,..]]` 修饰符，则停止所有自定义协议，除非使用 `EXCEPT` 子句指定。

### START LISTEN {#start-listen}

允许在指定协议上建立新的连接。

但是，如果指定端口和协议上的服务器未使用 SYSTEM STOP LISTEN 命令停止，则此命令将无效。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## 管理 MergeTree 表 {#managing-mergetree-tables}

ClickHouse 可以管理 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的后台进程。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

提供停止 MergeTree 家族表的后台合并的可能性：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` 表将启动该表的后台合并，即使在之前所有 MergeTree 表的合并被停止的情况下。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

提供启动 MergeTree 家族表的后台合并的可能性：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

提供停止根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除旧数据的可能性，适用于 MergeTree 家族表：
即使表不存在或表没有 MergeTree 引擎，也返回 `Ok.`。如果数据库不存在，则返回错误：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

提供启动根据 [TTL 表达式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 删除旧数据的可能性，适用于 MergeTree 家族表：
即使表不存在，也返回 `Ok.`。如果数据库不存在，则返回错误：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

提供停止根据 [TTL 表达式与 TO VOLUME 或 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动数据的可能性，适用于 MergeTree 家族表：
即使表不存在，也返回 `Ok.`。如果数据库不存在，则返回错误：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

提供启动根据 [TTL 表达式与 TO VOLUME 和 TO DISK 子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) 移动数据的可能性，适用于 MergeTree 家族表：
即使表不存在，也返回 `Ok.`。如果数据库不存在，则返回错误：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

从所有磁盘中清除指定名称的冻结备份。有关解冻单个部分的更多信息，请参见 [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

等待所有异步加载的数据部分（过时数据部分）加载完成。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## 管理 ReplicatedMergeTree 表 {#managing-replicatedmergetree-tables}

ClickHouse 可以管理 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表中的后台复制相关进程。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

提供停止 ReplicatedMergeTree 家族表插入部分的后台提取的可能性：
无论表引擎如何，即使表或数据库不存在，也总是返回 `Ok.`。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

提供启动 ReplicatedMergeTree 家族表插入部分的后台提取的可能性：
无论表引擎如何，即使表或数据库不存在，也总是返回 `Ok.`。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

提供停止 ReplicatedMergeTree 家族表中新插入部分到集群中其他副本的后台发送的可能性：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

提供启动 ReplicatedMergeTree 家族表中新插入部分到集群中其他副本的后台发送的可能性：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

提供停止 ReplicatedMergeTree 家族表中存储在 ZooKeeper 中的复制队列中的后台提取任务的可能性。可能的后台任务类型 - 合并、提取、变异、带 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

提供启动 ReplicatedMergeTree 家族表中存储在 ZooKeeper 中的复制队列中的后台提取任务的可能性。可能的后台任务类型 - 合并、提取、变异、带 ON CLUSTER 子句的 DDL 语句：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

停止从 `ReplicatedMergeTree` 表的复制日志加载新条目到复制队列。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

取消 `SYSTEM STOP PULLING REPLICATION LOG`。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

等待直到 `ReplicatedMergeTree` 表与集群中的其他副本同步，但不超过 `receive_timeout` 秒。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

运行此语句后，`[db.]replicated_merge_tree_family_table_name` 从公共复制日志中提取命令到其自己的复制队列，然后查询等待直到副本处理所有提取的命令。支持以下修饰符：

 - 如果指定了 `STRICT` 修饰符，则查询将等待复制队列变为空。`STRICT` 版本如果复制队列中不断出现新条目，则可能永远不会成功。
 - 如果指定了 `LIGHTWEIGHT` 修饰符，则查询仅等待 `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` 和 `DROP_PART` 条目被处理。
   此外，LIGHTWEIGHT 修饰符支持可选的 FROM 'srcReplicas' 子句，其中 'srcReplicas' 是来源副本名称的以逗号分隔的列表。此扩展可通过专注于来自指定源副本的复制任务实现更有针对性的同步。
 - 如果指定了 `PULL` 修饰符，则查询从 ZooKeeper 中提取新的复制队列条目，但不等待任何内容被处理。

### SYNC DATABASE REPLICA {#sync-database-replica}

等待指定的 [复制数据库](/engines/database-engines/replicated) 应用该数据库的所有模式更改。

**语法**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

提供重新初始化 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，将当前状态与 Zookeeper 作为事实来源进行比较，并在需要时将任务添加到 Zookeeper 队列。
基于 ZooKeeper 数据初始化复制队列的过程与 `ATTACH TABLE` 语句相同。在短时间内，表将不可用于任何操作。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

如果数据 [可能] 存在但 ZooKeeper 元数据丢失，则恢复副本。

仅在只读的 `ReplicatedMergeTree` 表上工作。

在以下情况下可以执行查询：

  - ZooKeeper 根目录 `/` 丢失。
  - 副本路径 `/replicas` 丢失。
  - 单个副本路径 `/replicas/replica_name/` 丢失。

副本附加本地找到的部分，并将有关它们的信息发送到 ZooKeeper。
在元数据丢失之前存在于副本中的部分如果没有过时，则不从其他部分重提取（因此副本恢复并不意味着从网络重新下载所有数据）。

:::note
所有状态的部分都被移动到 `detached/` 文件夹。数据丢失之前处于活动状态（已提交）的部分被附加。
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

在多个服务器上创建表。在 ZooKeeper 中缺少副本的元数据后，该表将以只读方式附加，因为元数据缺失。最后一个查询需要在每个副本上执行。

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

提供重新初始化所有 `ReplicatedMergeTree` 表的 ZooKeeper 会话状态的可能性，将当前状态与 Zookeeper 作为事实来源进行比较，并在需要时将任务添加到 Zookeeper 队列。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

允许删除文件系统缓存。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
这太重了，并且有滥用的潜力。
:::

将执行同步系统调用。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

为给定表或所有表加载主键。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### UNLOAD PRIMARY KEY {#unload-primary-key}

为给定表或所有表卸载主键。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## 管理可刷新的物化视图 {#refreshable-materialized-views}

控制 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 执行的后台任务的命令

在使用它们时请注意 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)。

### REFRESH VIEW {#refresh-view}

触发给定视图的即时非计划刷新的执行。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

等待当前正在运行的刷新完成。如果刷新失败，则抛出异常。如果没有正在运行的刷新，则立即完成，如果上一个刷新失败则抛出异常。

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

禁用给定视图或所有可刷新的视图的周期性刷新。如果刷新正在进行中，则也取消该刷新。

如果视图在复制或共享数据库中，`STOP VIEW` 仅影响当前副本，而 `STOP REPLICATED VIEW` 影响所有副本。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

启用给定视图或所有可刷新的视图的周期性刷新。不触发即时刷新。

如果视图在复制或共享数据库中，`START VIEW` 撤消 `STOP VIEW` 的效果，而 `START REPLICATED VIEW` 撤消 `STOP REPLICATED VIEW` 的效果。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

如果当前副本的给定视图正在进行刷新，则中断并取消它。否则不执行任何操作。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

等待运行中的刷新的完成。如果没有正在运行的刷新，则立即返回。如果最新的刷新尝试失败，则报告错误。

可以在创建新的可刷新的物化视图（不带 EMPTY 关键字）后立即使用，以等待初始刷新的完成。

如果视图在复制或共享数据库中，并且刷新在其他副本上运行，则等待该刷新的完成。

```sql
SYSTEM WAIT VIEW [db.]name
```
