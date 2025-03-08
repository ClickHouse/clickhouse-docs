---
slug: /operations/server-configuration-parameters/settings
sidebar_position: 57
sidebar_label: 全局服务器设置
description: 本节包含无法在会话或查询级别更改的服务器设置的描述。
keywords: [全局服务器设置]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# 全局服务器设置

本节包含无法在会话或查询级别更改的服务器设置的描述。这些设置存储在 ClickHouse 服务器的 `config.xml` 文件中。有关 ClickHouse 中配置文件的更多信息，请参见 ["配置文件"](/operations/configuration-files)。

其他设置在 "[设置](/operations/settings/overview)" 部分中描述。
在研究这些设置之前，我们建议您阅读 [配置文件](/operations/configuration-files) 部分，并注意替换的使用（`incl` 和 `optional` 属性）。
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

允许使用 jemalloc 内存。

类型：`Bool`

默认值：`1`
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

更新异步指标的周期（以秒为单位）。

类型：`UInt32`

默认值：`120`
## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果该设置在您的环境中默认未启用，您可以根据 ClickHouse 的安装方式，按照以下说明启用或禁用它。

**启用**

要手动开启异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`，其内容如下：

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**禁用**

要禁用 `asynchronous_metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，其内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

更新异步指标的周期（以秒为单位）。

类型：`UInt32`

默认值：`1`
## auth_use_forwarded_address {#auth_use_forwarded_address}

对通过代理连接的客户端使用源地址进行身份验证。

:::note
此设置应谨慎使用，因为转发的地址可以很容易被伪造 - 接受此类身份验证的服务器不应直接访问，而应仅通过受信任的代理访问。
:::

类型：`Bool`

默认值：`0`
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

将用于在后台执行 [Buffer-engine 表](/engines/table-engines/special/buffer) 的刷新操作的最大线程数。

类型：`UInt64`

默认值：`16`
## background_common_pool_size {#background_common_pool_size}

将用于在后台执行各种操作（主要是垃圾收集）的最大线程数，用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。

类型：`UInt64`

默认值：`8`
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

将用于执行分布式发送的最大线程数。

类型：`UInt64`

默认值：`16`
## background_fetches_pool_size {#background_fetches_pool_size}

将用于从另一个副本后台获取数据部分的最大线程数，用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。

类型：`UInt64`

默认值：`16`
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

设置线程数与可以同时执行的后台合并和变更数之间的比例。

例如，如果比例等于 2，而 [`background_pool_size`](#background_pool_size) 设置为 16，则 ClickHouse 可以同时执行 32 个后台合并。这是可能的，因为后台操作可以被暂停和推迟。这是为了给小合并提供更高的执行优先级。

:::note
您只能在运行时增加此比例。要降低它，您必须重启服务器。

与 [`background_pool_size`](#background_pool_size) 设置类似，[`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio) 可从 `default` 配置文件应用，以保持向后兼容。
:::

类型：`Float`

默认值：`2`
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

用于调度后台合并和变更的策略。可能的值为：`round_robin` 和 `shortest_task_first`。

用于选择由后台线程池执行的下一个合并或变更的算法。策略可以在运行时进行更改，而无需重启服务器。
可以从 `default` 配置文件应用，以保持向后兼容。

可能的值：

- `round_robin` — 每个并发合并和变更按轮询顺序执行，以确保无饥饿操作。较小的合并比大合并完成得更快，只是因为它们合并的区块较少。
- `shortest_task_first` — 始终执行较小的合并或变更。合并和变更根据其结果大小分配优先级。较小的合并严格优先于较大的。这一策略确保了较小部分的最快合并，但可能导致在被 `INSERT`s 严重过载的分区中大合并无限饥饿。

类型：String

默认值：`round_robin`
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

将用于执行消息流的后台操作的最大线程数。

类型：UInt64

默认值：`16`
## background_move_pool_size {#background_move_pool_size}

将用于将数据部分移动到另一个磁盘或卷的最大线程数，用于 *MergeTree-engine 表。

类型：UInt64

默认值：`8`
## background_schedule_pool_size {#background_schedule_pool_size}

将用于持续执行某些轻量级周期操作（用于复制表、Kafka 流处理和 DNS 缓存更新）的最大线程数。

类型：UInt64

默认值：`512`
## backups {#backups}

备份设置，用于执行 `BACKUP TO File()` 操作时。

可以通过子标签配置以下设置：

| 设置                                 | 描述                                                                                                                                                                              | 默认值   |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                       | 使用 `File()` 备份时的路径。此设置必须被设置以使用 `File`。该路径可以相对于实例目录，也可以是绝对路径。                                                                   | `true`  |
| `remove_backup_files_after_failure`  | 如果 `BACKUP` 命令失败，ClickHouse 将尝试移除在失败之前已复制到备份中的文件，否则将保留已复制的文件。                                                                        | `true`  |

此设置的默认配置为：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backup_threads {#backup_threads}

执行 `BACKUP` 请求的最大线程数。

类型：`UInt64`

默认值：`16`
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

可以在备份 IO 线程池中调度的最大作业数。建议将此队列保持为无限制，这是因为当前的 S3 备份逻辑。

:::note
值 `0`（默认）表示无限制。
:::

类型：`UInt64`

默认值：`0`
## bcrypt_workfactor {#bcrypt_workfactor}

用于 bcrypt_password 认证类型的工作因子，使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。

默认值：`12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

设置缓存大小与 RAM 的最大比例。允许在内存较低的系统上降低缓存大小。

类型：`Double`

默认值：`0.5`
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

允许运行所有查询的最大查询处理线程数，不包括从远程服务器检索数据的线程。这不是硬限制。如果达到限制，查询仍将获得至少一个线程来运行。如果在执行过程中有更多线程可用，查询可以提升到所需的线程数。

:::note
值 `0`（默认）表示无限制。
:::

类型：`UInt64`

默认值：`0`
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同，但与核心的比例。

类型：`UInt64`

默认值：`0`
## concurrent_threads_scheduler {#concurrent_threads_scheduler}

用于调度由 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定的 CPU 槽的策略。用于管理并发查询中有限 CPU 槽如何分配的算法。调度程序可以在运行时更改，而无需重启服务器。

类型：String

默认值：`round_robin`

可能的值：

- `round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询分配最多 `max_threads` 个 CPU 槽。每个线程一个插槽。在争用情况下，CPU 槽按照轮询方式授予查询。请注意，第一个槽无条件授予，这可能导致在有大量 `max_threads` = 1 的查询存在时，使具有高 `max_threads` 的查询不公平且延迟增加。
- `fair_round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询分配最多 `max_threads - 1` 个 CPU 槽。`round_robin` 的变体，不要求每个查询的第一个线程占用一个 CPU 槽。这样，`max_threads` = 1 的查询不需要任何插槽，因此不会不公平地占用所有插槽。没有插槽被无条件授予。
## default_database {#default_database}

默认数据库名称。

类型：`String`

默认值：`default`
## disable_internal_dns_cache {#disable_internal_dns_cache}

禁用内部 DNS 缓存。建议在 Kubernetes 等基础设施经常变化的系统中操作 ClickHouse。

类型：`Bool`

默认值：`0`
## dns_cache_max_entries {#dns_cache_max_entries}

内部 DNS 缓存的最大条目数。

类型：`UInt64`

默认值：`10000`
## dns_cache_update_period {#dns_cache_update_period}

内部 DNS 缓存更新周期（以秒为单位）。

类型：`Int32`

默认值：`15`
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

在将主机从 ClickHouse DNS 缓存中删除之前，最大的连续解析失败次数。

类型：`UInt32`

默认值：`10`
## index_mark_cache_policy {#index_mark_cache_policy}

索引标记缓存策略名称。

类型：`String`

默认值：`SLRU`
## index_mark_cache_size {#index_mark_cache_size}

索引标记的缓存的最大大小。

:::note

值 `0` 表示禁用。

此设置可以在运行时修改，并将立即生效。
:::

类型：`UInt64`

默认值：`0`
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

索引标记缓存中受保护队列的大小（对于 SLRU 策略），相对于缓存的总大小。

类型：`Double`

默认值：`0.5`
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

未压缩索引缓存策略名称。

类型：`String`

默认值：`SLRU`
## index_uncompressed_cache_size {#index_uncompressed_cache_size}

未压缩的 `MergeTree` 索引块的缓存的最大大小。

:::note
值 `0` 表示禁用。

此设置可以在运行时修改，并将立即生效。
:::

类型：`UInt64`

默认值：`0`
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

未压缩索引缓存中受保护队列的大小（对于 SLRU 策略），相对于缓存的总大小。

类型：`Double`

默认值：`0.5`
## skipping_index_cache_policy {#skipping_index_cache_policy}

跳过索引缓存策略名称。

类型：`String`

默认值：`SLRU`
## skipping_index_cache_size {#skipping_index_cache_size}

跳过索引的缓存大小。零表示禁用。

:::note
此设置可以在运行时修改，并将立即生效。
:::

类型：`UInt64`

默认值：`5368709120` (= 5 GiB)
## skipping_index_cache_size_ratio {#skipping_index_cache_size_ratio}

跳过索引缓存中受保护队列的大小（对于 SLRU 策略），相对于缓存的总大小。

类型：`Double`

默认值：`0.5`
## skipping_index_cache_max_entries {#skipping_index_cache_max_entries}

跳过索引缓存中最多的条目数。

类型：`UInt64`

默认值：`10000000`
## io_thread_pool_queue_size {#io_thread_pool_queue_size}

可以在 IO 线程池中调度的最大作业数。

:::note
值 `0` 表示无限制。
:::

类型：`UInt64`

默认值：`10000`
## mark_cache_policy {#mark_cache_policy}

标记缓存策略名称。

类型：`String`

默认值：`SLRU`
## mark_cache_size {#mark_cache_size}

[`MergeTree`](/engines/table-engines/mergetree-family) 表家族的标记（索引）的最大缓存大小。

:::note
此设置可以在运行时修改，并将立即生效。
:::

类型：`UInt64`

默认值：`5368709120`
## mark_cache_size_ratio {#mark_cache_size_ratio}

标记缓存中受保护队列的大小（对于 SLRU 策略），相对于缓存的总大小。

类型：`Double`

默认值：`0.5`
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

所有备份在服务器上的最大读取速度（以字节每秒计）。零表示无限制。

类型：`UInt64`

默认值：`0`
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

如果备份 IO 线程池中 **空闲** 线程的数量超过 `max_backup_io_thread_pool_free_size`，ClickHouse将释放被空闲线程占用的资源并减少池的大小。如有必要，线程可以再次创建。

类型：`UInt64`

默认值：`0`
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse 使用备份 IO 线程池中的线程执行 S3 备份 IO 操作。`max_backups_io_thread_pool_size` 限制池中最大线程数。

类型：`UInt64`

默认值：`1000`
## max_concurrent_queries {#max_concurrent_queries}

同时执行的查询总数的限制。请注意，对于 `INSERT` 和 `SELECT` 查询的限制，以及用户的查询最大数量也必须考虑。

另请参见：
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note

值 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::

类型：`UInt64`

默认值：`0`
## max_concurrent_insert_queries {#max_concurrent_insert_queries}

同时插入查询总数的限制。

:::note

值 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::

类型：`UInt64`

默认值：`0`
## max_concurrent_select_queries {#max_concurrent_select_queries}

同时选择查询总数的限制。

:::note

值 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::

类型：`UInt64`

默认值：`0`
## max_waiting_queries {#max_waiting_queries}

并发等待查询的总数限制。
在所需表异步加载期间，正在等待的查询的执行被阻止（请参见 [`async_load_databases`](#async_load_databases)。

:::note
等待查询不计入检查由以下设置控制的限制：

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

此更正是为了避免在服务器启动后触碰这些限制。
:::

:::note

值 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::

类型：`UInt64`

默认值：`0`
## max_connections {#max_connections}

最大的服务器连接数。

类型：`Int32`

默认值：`1024`
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

如果 IO 线程池中 **空闲** 线程的数量超过 `max_io_thread_pool_free_size`，ClickHouse 将释放被空闲线程占用的资源并减少池的大小。如有必要，线程可以再次创建。

类型：`UInt64`

默认值：`0`
## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse 使用 IO 线程池中的线程执行某些 IO 操作（例如，与 S3 互动）。`max_io_thread_pool_size` 限制池中最大线程数。

类型：`UInt64`

默认值：`100`
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

本地读取的最大速度（以字节每秒计）。

:::note
值 `0` 表示无限制。
:::

类型：`UInt64`

默认值：`0`
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

本地写入的最大速度（以字节每秒计）。

:::note
值 `0` 表示无限制。
:::

类型：`UInt64`

默认值：`0`
## max_partition_size_to_drop {#max_partition_size_to_drop}

删除分区的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop)（以字节为单位），您将无法使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询删除分区。
该设置不需要重启 ClickHouse 服务器以应用。另一个禁用限制的方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值 `0` 表示您可以不受限制地删除分区。

这个限制不会限制删除表和截断表，参见 [max_table_size_to_drop](#max_table_size_to_drop)
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

类型：`UInt64`

默认值：`50`
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

通过网络读取的数据交换的最大速度（以字节每秒计）。

:::note
值 `0`（默认）表示无限制。
:::

类型：`UInt64`

默认值：`0`
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

通过网络写入的数据交换的最大速度（以字节每秒计）。

:::note
值 `0`（默认）表示无限制。
:::

类型：`UInt64`

默认值：`0`
## max_server_memory_usage {#max_server_memory_usage}

总内存使用量的限制。
默认的 [`max_server_memory_usage`](#max_server_memory_usage) 值计算为 `memory_amount * max_server_memory_usage_to_ram_ratio`。

:::note
值 `0`（默认）表示无限制。
:::

类型：`UInt64`

默认值：`0`
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

与 [`max_server_memory_usage`](#max_server_memory_usage) 相同，但与物理 RAM 的比例。允许在内存较低的系统上降低内存使用。

在内存和交换空间不足的主机上，您可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置得大于 1。

:::note
值 `0` 表示无限制。
:::

类型：`Double`

默认值：`0.9`
## max_build_vector_similarity_index_thread_pool_size {#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size}

用于构建向量索引的最大线程数。

:::note
值 `0` 表示所有核心。
:::

类型：`UInt64`

默认值：`16`
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

服务器的最大允许内存消耗通过 cgroups 中的相应阈值进行调整的时间间隔（以秒为单位）。

要禁用 cgroup 观察者，请将此值设置为 `0`。

见设置：
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)。

类型：`UInt64`

默认值：`15`
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

通过 cgroups 指定的服务器进程内存消耗的“硬”阈值，超过此阈值后服务器的最大内存消耗将调整为阈值值。

见设置：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

类型：`Double`

默认值：`0.95`
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

通过 cgroups 指定的服务器进程内存消耗的“软”阈值，超过此阈值后 jemalloc 中的区域将被清除。

见设置：
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_watcher_soft_limit_ratio)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)

类型：`Double`

默认值：`0.9`
## max_database_num_to_warn {#max_database_num_to_warn}

如果附加的数据库数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

默认值：`1000`
## max_table_num_to_warn {#max_table_num_to_warn}

如果附加的表数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

默认值：`5000`
## max_view_num_to_warn {#max_view_num_to_warn}

如果附加的视图数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

类型：`UInt64`

默认值：`10000`
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

如果附加的字典数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

类型：`UInt64`

默认值：`1000`
## max_part_num_to_warn {#max_part_num_to_warn}

如果活动部分的数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

类型：`UInt64`

默认值：`100000`
## max_table_num_to_throw {#max_table_num_to_throw}

如果表的数量大于此值，服务器将抛出异常。

不计算以下表：
- 视图
- 远程
- 字典
- 系统

仅计算用于数据库引擎的表：
- 原子
- 普通
- 复制
- 懒加载

:::note
值 `0` 表示没有限制。
:::

**示例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

类型：`UInt64`

默认值：`0`
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

如果复制表的数量大于此值，服务器将抛出异常。

仅计算用于数据库引擎的表：
- 原子
- 普通
- 复制
- 懒加载

:::note
值 `0` 表示没有限制。
:::

**示例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

类型：`UInt64`

默认值：`0`
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

如果字典的数量大于此值，服务器将抛出异常。

仅计算用于数据库引擎的表：
- 原子
- 普通
- 复制
- 懒加载

:::note
值 `0` 表示没有限制。
:::

**示例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

类型：`UInt64`

默认值：`0`
## max_view_num_to_throw {#max_view_num_to_throw}

如果视图的数量大于此值，服务器将抛出异常。

仅计算用于数据库引擎的表：
- 原子
- 普通
- 复制
- 懒加载

:::note
值 `0` 表示没有限制。
:::

**示例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

类型：`UInt64`

默认值：`0`
## max_database_num_to_throw {#max-table-num-to-throw}

如果数据库的数量大于此值，服务器将抛出异常。

:::note
值 `0`（默认）表示没有限制。
:::

**示例**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

类型：`UInt64`

默认值：`0`
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

用于外部聚合、连接或排序所使用的最大存储量。
超过此限制的查询将失败并抛出异常。

:::note
值 `0` 表示无限制。
:::

另请参见：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

类型：`UInt64`

默认值：`0`
## max_thread_pool_free_size {#max_thread_pool_free_size}

如果全局线程池中 **空闲** 线程的数量大于 [`max_thread_pool_free_size`](#max_thread_pool_free_size)，则 ClickHouse 释放占用了一些线程的资源，并减少池的大小。如有必要，线程可以再次创建。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

类型：`UInt64`

默认值：`0`
## max_thread_pool_size {#max_thread_pool_size}

ClickHouse 使用全局线程池中的线程处理查询。如果没有空闲线程来处理查询，则在池中创建一个新线程。`max_thread_pool_size` 限制池中最大线程数。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

类型：`UInt64`

默认值：`10000`

## mmap_cache_size {#mmap_cache_size}

设置映射文件的缓存大小（以字节为单位）。此设置允许避免频繁的打开/关闭调用（由于随之而来的页面错误而代价高昂），并且可以从多个线程和查询中重用映射。设置值是映射区域的数量（通常等于映射文件的数量）。

可以通过以下系统表中的以下指标监控映射文件中的数据量：

| 系统表                                                                                                                                                                                                                                                                                                                                                       | 指标                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) 和 [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` 和 `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
映射文件中的数据量不会直接消耗内存，并且在查询或服务器内存使用中不会被计算 —— 因为此内存可以像操作系统页面缓存一样被丢弃。在 MergeTree 系列表中，删除旧分区时，缓存会自动被丢弃（文件将关闭），也可以通过 `SYSTEM DROP MMAP CACHE` 查询手动丢弃。

此设置可以在运行时修改，并会立即生效。
:::

类型: `UInt64`

默认: `1000`
## restore_threads {#restore_threads}

执行 RESTORE 请求的最大线程数。

类型: UInt64

默认: `16`
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

如果设置为 true，将在堆栈跟踪中显示地址。

类型: `Bool`

默认: `1`
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

如果设置为 true，ClickHouse 将等待正在运行的查询完成后再关闭。

类型: `Bool`

默认: `0`
## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true，则用户在创建特定引擎的表时需要授权，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，创建特定表引擎的表时会忽略授权，但您可以通过将其设置为 true 来改变此行为。
:::

类型: `Bool`

默认: `false`
## temporary_data_in_cache {#temporary_data_in_cache}

使用此选项，临时数据将在特定磁盘的缓存中存储。
在此部分中，应指定类型为 `cache` 的磁盘名称。
在这种情况下，缓存和临时数据将共享相同的空间，同时可以释放磁盘缓存以创建临时数据。

:::note
只能使用一个选项来配置临时数据存储： `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
:::

**示例**

`local_disk` 的缓存和临时数据将存储在文件系统中的 `/tiny_local_cache`，由 `tiny_local_cache` 管理。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <local_disk>
                <type>local</type>
                <path>/local_disk/</path>
            </local_disk>

            <!-- highlight-start -->
            <tiny_local_cache>
                <type>cache</type>
                <disk>local_disk</disk>
                <path>/tiny_local_cache/</path>
                <max_size_rows>10M</max_size_rows>
                <max_file_segment_size>1M</max_file_segment_size>
                <cache_on_write_operations>1</cache_on_write_operations>
            </tiny_local_cache>
            <!-- highlight-end -->
        </disks>
    </storage_configuration>

    <!-- highlight-start -->
    <temporary_data_in_cache>tiny_local_cache</temporary_data_in_cache>
    <!-- highlight-end -->
</clickhouse>
```

类型: `String`

默认: ""
## thread_pool_queue_size {#thread_pool_queue_size}

允许在全局线程池中调度的最大作业数。增加队列大小会导致更大的内存使用。建议将此值保持等于 [`max_thread_pool_size`](#max_thread_pool_size)。

:::note
值为 `0` 意味着无限制。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

类型: UInt64

默认: `10000`
## tmp_policy {#tmp_policy}

临时数据存储的策略。有关更多信息，请参见 [MergeTree 表引擎](/engines/table-engines/mergetree-family/mergetree) 文档。

:::note
- 只能使用一个选项来配置临时数据存储： `tmp_path`, `tmp_policy`, `temporary_data_in_cache`。
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` 被忽略。
- 策略应具有确切的 *一个卷*，并包含 *本地* 磁盘。
:::

**示例**

当 `/disk1` 充满时，临时数据将存储在 `/disk2` 上。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk1>
                <path>/disk1/</path>
            </disk1>
            <disk2>
                <path>/disk2/</path>
            </disk2>
        </disks>

        <policies>
            <!-- highlight-start -->
            <tmp_two_disks>
                <volumes>
                    <main>
                        <disk>disk1</disk>
                        <disk>disk2</disk>
                    </main>
                </volumes>
            </tmp_two_disks>
            <!-- highlight-end -->
        </policies>
    </storage_configuration>

    <!-- highlight-start -->
    <tmp_policy>tmp_two_disks</tmp_policy>
    <!-- highlight-end -->
</clickhouse>
```
类型: String

默认: ""
## uncompressed_cache_policy {#uncompressed_cache_policy}

未压缩缓存策略名称。

类型: String

默认: `SLRU`
## uncompressed_cache_size {#uncompressed_cache_size}

用于 MergeTree 系列表的未压缩数据的最大缓存大小（以字节为单位）。

服务器共享一个缓存。按需分配内存。如果启用了选项 `use_uncompressed_cache`，则将使用此缓存。

未压缩缓存在个别情况下对非常短的查询是有利的。

:::note
值为 `0` 意味着禁用。

此设置可以在运行时修改，并会立即生效。
:::

类型: UInt64

默认: `0`
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

未压缩缓存中受保护队列的大小（在 SLRU 策略下），与缓存的总大小的比例。

类型: Double

默认: `0.5`
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

重新加载内置字典的间隔（以秒为单位）。

ClickHouse 每 x 秒重新加载内置字典。这使得可以在不重启服务器的情况下“动态”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

类型: UInt64

默认: `3600`
## compression {#compression}

针对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse，不建议更改此设置。
:::

**配置模板**：

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>` 字段**：

- `min_part_size` – 数据分区的最小大小。
- `min_part_size_ratio` – 数据分区大小与表大小的比例。
- `method` – 压缩方法。可接受的值： `lz4`, `lz4hc`, `zstd`,`deflate_qpl`。
- `level` – 压缩级别。请参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**当条件满足时的操作**：

- 如果数据分区匹配设置的条件，ClickHouse 将使用指定的压缩方法。
- 如果数据分区匹配多个条件集，ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据分区没有满足任何条件，ClickHouse 将使用 `lz4` 压缩。
:::

**示例**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```
## encryption {#encryption}

配置用于 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 的密钥获取命令。密钥（或密钥）应写入环境变量或配置文件中。

密钥可以是十六进制或字符串，长度为 16 字节。

**示例**

从配置加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥。这不安全。您可以将密钥移到安全磁盘上的单独配置文件中，并在 `config.d/` 文件夹中放置该配置文件的符号链接。
:::

从配置加载，当密钥为十六进制时：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量加载密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 设置当前加密密钥，所有指定的密钥可以用于解密。

这些方法可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 显示当前的加密密钥。

此外，用户可以添加 nonce，必须为 12 字节（默认情况下，加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以以十六进制设置：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上述所有内容同样适用 `aes_256_gcm_siv`（但密钥必须为 32 字节）。
:::
## error_log {#error_log}

默认情况下是禁用的。

**启用**

要手动开启错误历史收集 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**禁用**

要禁用 `error_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

自定义设置的前缀列表。前缀必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另见**

- [自定义设置](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

配置核心转储文件大小的软限制。

:::note
硬限制通过系统工具配置。
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

默认: `1073741824`
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

删除表期间可以使用 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复的延迟时间。如果以 `SYNC` 修饰符运行 `DROP TABLE`，则该设置将被忽略。
此设置的默认值为 `480`（8 分钟）。

默认: `480`
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

清理 `store/` 目录中的垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且该目录在过去的 
[`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec) 秒内未被修改，则该任务将通过
移除所有访问权限来“隐藏”该目录。它也适用于 clickhouse-server 不期望在 `store/` 内看到的目录。

:::note
值为 `0` 意味着“立即”。
:::

默认: `3600`（1小时）
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

清理 `store/` 目录中的垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且之前已被“隐藏”
（请参见 [database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec)），并且该目录在过去的 
[`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改，则该任务将删除该目录。
它也适用于 clickhouse-server 不期望在 `store/` 内看到的目录。

:::note
值为 `0` 意味着“从不”。默认值对应于 30 天。
:::

默认: `2592000`（30 天）。
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

在表删除失败的情况下，ClickHouse 将等待此超时时间后重试操作。

类型: [`UInt64`](../../sql-reference/data-types/int-uint.md)

默认: `5`
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

用于删除表的线程池大小。

类型: [`UInt64`](../../sql-reference/data-types/int-uint.md)

默认: `16`
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

清理 `store/` 目录中的垃圾的任务参数。
设置任务的调度周期。

:::note
值为 `0` 意味着“从不”。默认值对应于 1 天。
:::

默认: `86400`（1天）。
## default_profile {#default_profile}

默认设置配置文件。设置配置文件位于 `user_config` 设置指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```
## default_replica_path {#default_replica_path}

ZooKeeper 中表的路径。

**示例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_replica_name {#default_replica_name}

ZooKeeper 中的副本名称。

**示例**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## dictionaries_config {#dictionaries_config}

字典的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

可执行用户定义函数的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}

字典的延迟加载。

- 如果为 `true`，则每个字典在首次使用时加载。如果加载失败，正在使用该字典的函数将抛出异常。
- 如果为 `false`，则服务器在启动时加载所有字典。

:::note
服务器将在启动时等待所有字典完成加载后再接受任何连接（例外：如果 [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup) 设置为 `false`）。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## format_schema_path {#format_schema_path}

包含输入数据方案的目录路径，如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的方案。

**示例**

```xml
<!-- 包含各种输入格式的模式文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

将数据发送到 [Graphite](https://github.com/graphite-project)。

设置：

- `host` – Graphite 服务器。
- `port` – Graphite 服务器上的端口。
- `interval` – 发送间隔，单位为秒。
- `timeout` – 发送数据的超时时间，单位为秒。
- `root_path` – 键的前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送在指定时间段内累积的数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以使用此功能在不同时间间隔发送不同的数据。

**示例**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```
## graphite_rollup {#graphite_rollup}

用于 Graphite 的数据稀疏设置。

有关更多详细信息，请参见 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

**示例**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```
## google_protos_path {#google_protos_path}

定义包含 Protobuf 类型的 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理程序。
要添加新的 http 处理程序，只需添加一个新的 `<rule>`。
规则按定义的自上而下进行检查，第一个匹配将执行处理程序。

可以通过子标签配置以下设置：

| 子标签             | 定义                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 匹配请求 URL，您可以使用 'regex:' 前缀来使用正则表达式匹配（可选）                                                           |
| `methods`            | 匹配请求方法，您可以使用逗号分隔多个方法匹配（可选）                                                       |
| `headers`            | 匹配请求头，匹配每个子元素（子元素名称是头部名称），您可以使用 'regex:' 前缀来使用正则表达式匹配（可选） |
| `handler`            | 请求处理程序                                                                                                                               |
| `empty_query_string` | 检查 URL 中没有查询字符串                                                                                                    |

`handler` 包含以下设置，可以通过子标签进行配置：

| 子标签           | 定义                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | 重定向位置                                                                                                                                               |
| `type`             | 支持的类型：static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    | 
| `status`           | 与 static 类型一起使用，响应状态码                                                                                                                            |
| `query_param_name` | 与 dynamic_query_handler 类型一起使用，从 HTTP 请求参数中提取并执行对应于 `<query_param_name>` 值的内容                             |
| `query`            | 与 predefined_query_handler 类型一起使用，当调用处理程序时执行查询                                                                                     |
| `content_type`     | 与 static 类型一起使用，响应内容类型                                                                                                                           |
| `response_content` | 与 static 类型一起使用，发送给客户端的响应内容，当使用 'file://' 或 'config://' 前缀时，从文件或配置中查找内容并发送给客户端 |

同时，可以指定 `<defaults/>` 列表，指定启用所有默认处理程序。

示例：

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```
## http_port/https_port {#http_porthttps_port}

通过 HTTP(s) 连接服务器的端口。

- 如果指定了 `https_port`，则必须配置 [OpenSSL](#openssl)。
- 如果指定了 `http_port`，则忽略 OpenSSL 配置，即使已设置。

**示例**

```xml
<https_port>9999</https_port>
```
## http_server_default_response {#http_server_default_response}

访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."（末尾带换行符）

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求中添加响应头。
`OPTIONS` 方法用于进行 CORS 预检请求。

有关更多信息，请参见 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

示例：

```xml
<http_options_response>
        <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
        </header>
        <header>
            <name>Access-Control-Allow-Headers</name>
            <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
        </header>
        <header>
            <name>Access-Control-Allow-Methods</name>
            <value>POST, GET, OPTIONS</value>
        </header>
        <header>
            <name>Access-Control-Max-Age</name>
            <value>86400</value>
        </header>
    </http_options_response>
```
## hsts_max_age {#hsts_max_age}

HSTS 的过期时间（以秒为单位）。

:::note
值为 `0` 意味着 ClickHouse 禁用 HSTS。如果您设置了一个正数，则将启用 HSTS，max-age 是您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

在启动后执行 `mlockall` 以降低首次查询延迟，并防止在高 IO 负载下将 clickhouse 可执行文件换出。

:::note
建议启用此选项，但会导致启动时间增加几秒。请注意，该设置在没有 "CAP_IPC_LOCK" 权限的情况下将不起作用。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

包含替换文件的路径。支持 XML 和 YAML 格式。

有关更多信息，请参见 "[配置文件](/operations/configuration-files)"。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

对可以在 ClickHouse 服务器之间交换数据的主机的限制。
如果使用 Keeper，则同样的限制将适用于不同 Keeper 实例之间的通信。

:::note
默认值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认：
## interserver_http_port {#interserver_http_port}

在 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

其他服务器可用于访问此服务器的主机名。

如果省略，则以与 `hostname -f` 命令相同的方式定义。

适用于打破与特定网络接口的依赖。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

在 ClickHouse 服务器之间通过 `HTTPS` 交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host)，但是此主机名可通过其他服务器在 `HTTPS` 上传访此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
```
## interserver_http_credentials {#interserver_http_credentials}

在 [复制](../../engines/table-engines/mergetree-family/replication.md) 期间用于连接其他服务器的用户名和密码。此外，服务器使用这些凭据验证其他副本。
因此，`interserver_http_credentials` 必须在一个集群中的所有副本中保持一致。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制期间不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭据适用于通过 `HTTP` 和 `HTTPS` 进行的复制。
:::

以下设置可以通过子标签进行配置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`，则允许其他副本在设置了凭据的情况下连接时不进行身份验证。如果为 `false`，则拒绝未经身份验证的连接。默认：`false`。
- `old` — 包含在凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭据轮换**

ClickHouse 支持动态的 interserver 凭据轮换，而无需同时停止所有副本以更新其配置。可以通过多步更改凭据。

要启用身份验证，请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这允许具有和不具有身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置所有副本后，将 `allow_empty` 设置为 `false` 或移除此设置。这样就强制要求使用新凭据进行身份验证。

要更改现有凭据，请将用户名和密码移至 `interserver_http_credentials.old` 部分，并用新值更新 `user` 和 `password`。此时，服务器使用新凭据连接到其他副本，并接受新的或旧的凭据进行连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

当新的凭据应用于所有副本时，可以删除旧的凭据。
## keep_alive_timeout {#keep_alive_timeout}

ClickHouse 等待传入请求的秒数，在关闭连接之前。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## max_keep_alive_requests {#max_keep_alive_requests}

通过单个保持活动连接的最大请求数，直到 ClickHouse 服务器关闭。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数：
- 将它们用作具有指定“ldap”身份验证机制的专用本地用户的身份验证器，而不是“password”
- 将它们用作远程用户目录。

以下设置可以通过子标签进行配置：

| 设置                           | 描述                                                                                                                                                                                                                                                                                                                                                                                                                       |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数是强制性的，不能为空。                                                                                                                                                                                                                                                                                                                                                                      |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认值为 636，否则为 389。                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | 用于构建绑定的 DN 的模板。结果 DN 将在每次身份验证尝试时通过用实际用户名替换模板中的所有 `\{user_name\}` 子字符串来构造。                                                                                                                                                                                                                                                                                         |
| `user_dn_detection`            | 用于检测所绑定用户的实际用户 DN 的 LDAP 搜索参数部分。这主要用于当服务器为活动目录时用于后的角色映射的搜索过滤器。所得到的用户 DN 将在允许的地方替换 `\{user_dn\}` 子字符串。默认情况下，用户 DN 被设置为等于绑定 DN，但一旦执行搜索，它将用实际检测到的用户 DN 值更新。                                                |
| `verification_cooldown`        | 在成功绑定尝试后的时间段（以秒为单位），此期间假定用户对于所有连续请求均已成功验证，而不需联系 LDAP 服务器。指定 `0`（默认）以禁用缓存，并强制对每个身份验证请求联系 LDAP 服务器。                                                                                                                                                                               |
| `enable_tls`                   | 触发与 LDAP 服务器建立安全连接的标志。指定 `no` 以纯文本 (`ldap://`) 协议（不推荐）。指定 `yes` 以 LDAP 通过 SSL/TLS (`ldaps://`) 协议（推荐，默认）。指定 `starttls` 以用于传统 StartTLS 协议（未加密的 (`ldap://`) 协议，升级为 TLS）。                                                                                    |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。接受的值为：`ssl2`，`ssl3`，`tls1.0`，`tls1.1`，`tls1.2`（默认）。                                                                                                                                                                                                                                                                                            |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。接受的值为：`never`，`allow`，`try`，`demand`（默认）。                                                                                                                                                                                                                                                                                                                             |
| `tls_cert_file`                | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tls_key_file`                 | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tls_ca_cert_file`             | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录的路径。                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_cipher_suite`             | 允许的密码套件（采用 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                 |

设置 `user_dn_detection` 可以通过子标签进行配置：

| 设置             | 描述                                                                                                                                                                                                                                                                                                                                                                                                    |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | 用于构建 LDAP 搜索的基础 DN 的模板。结果 DN 将在 LDAP 搜索期间通过用实际用户名和绑定 DN 替换模板中的所有 `\{user_name\}` 和 `\{bind_dn\}` 子字符串来构造。                                                                                                                                                                                            |
| `scope`          | LDAP 搜索的范围。接受的值为：`base`，`one_level`，`children`，`subtree`（默认）。                                                                                                                                                                                                                                                                                     |
| `search_filter`  | 用于构建 LDAP 搜索的搜索过滤器的模板。结果过滤器将在 LDAP 搜索期间通过用实际用户名、绑定 DN 和基础 DN 替换模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子字符串来构造。注意，特殊字符必须在 XML 中正确转义。                                                                                                 |

示例：

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

示例（配置用户 DN 检测的典型 Active Directory 以供进一步角色映射）：

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```
## listen_host {#listen_host}

请求可以来自的主机的限制。如果希望服务器响应所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

如果在尝试监听时 IPv6 或 IPv4 网络不可用，则服务器将不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

允许多个服务器在同一地址:端口上进行监听。请求将由操作系统路由到随机服务器。建议不要启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认：
## listen_backlog {#listen_backlog}

监听套接字的待处理连接的队列大小（回溯）。默认值 `4096` 与 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的值相同。

通常此值不需要更改，因为：
- 默认值大到足够，
- 服务器接受客户端连接时有单独的线程。

因此，即使你的 `TcpExtListenOverflows`（来自 `nstat`）不为零，并且这个计数器在 ClickHouse 服务器上增长，这也并不意味着需要增加这个值，因为：
- 通常，如果 `4096` 不够，这表明某种内部 ClickHouse 扩展问题，因此最好报告一个问题。
- 这并不意味着服务器可以处理更多的连接（即使它可以，到那时客户端可能已经消失或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

日志消息的位置和格式。

**键**：

| 键                       | 描述                                                                                                                                                                         |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | 日志级别。可接受值：`none`（关闭日志），`fatal`，`critical`，`error`，`warning`，`notice`，`information`，`debug`，`trace`，`test`                                  |
| `log`                     | 日志文件的路径。                                                                                                                                                           |
| `errorlog`                | 错误日志文件的路径。                                                                                                                                                     |
| `size`                    | 轮换策略：日志文件的最大字节大小。一旦日志文件大小超过此阈值，它将被重命名和归档，并创建一个新的日志文件。                                                              |
| `count`                   | 轮换策略：Clickhouse 保留的历史日志文件的最多数量。                                                                                                                      |
| `stream_compress`         | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                                    |
| `console`                 | 不将日志消息写入日志文件，而是在控制台中打印它们。设置为 `1` 或 `true` 以启用。如果 Clickhouse 不以守护进程模式运行，则默认值为 `1`，否则为 `0`。 |
| `console_log_level`       | 控制台输出的日志级别。默认为 `level`。                                                                                                                                  |
| `formatting`              | 控制台输出的日志格式。目前，只支持 `json`                                                                                                                                    |
| `use_syslog`              | 也将日志输出转发到 syslog。                                                                                                                                                  |
| `syslog_level`            | 记录到 syslog 的日志级别。                                                                                                                                                  |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符用于结果文件名（目录部分不支持它们）。

“示例”列显示在 `2023-07-06 18:32:07` 时的输出。

| 说明符    | 描述                                                                                                         | 示例                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | 字面意义%                                                                                                           | `%`                        |
| `%n`         | 换行符                                                                                                  |                          |
| `%t`         | 水平制表符                                                                                            |                          |
| `%Y`         | 年作为十进制数字，例如 2017                                                                                 | `2023`                     |
| `%y`         | 年的最后两位数字作为十进制数字（范围 [00,99]）                                                           | `23`                       |
| `%C`         | 年的前两位数字作为十进制数字（范围 [00,99]）                                                          | `20`                       |
| `%G`         | 四位数 [ISO 8601 周为基础的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅与 `%V` 一起使用 | `2023`       |
| `%g`         | 年的最后两位数字 [ISO 8601 周为基础的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。                         | `23`         |
| `%b`         | 缩写的月份名称，例如 Oct（与地区相关）                                                                 | `Jul`                      |
| `%h`         | %b 的同义词                                                                                                       | `Jul`                      |
| `%B`         | 完整的月份名称，例如 October（与地区相关）                                                                    | `July`                     |
| `%m`         | 月份作为十进制数字（范围 [01,12]）                                                                           | `07`                       |
| `%U`         | 一年中的周数作为十进制数字（周日是一周的第一天）（范围 [00,53]）                          | `27`                       |
| `%W`         | 一年中的周数作为十进制数字（周一是一周的第一天）（范围 [00,53]）                          | `27`                       |
| `%V`         | ISO 8601 周番号（范围 [01,53]）                                                                                | `27`                       |
| `%j`         | 一年中的天数作为十进制数字（范围 [001,366]）                                                               | `187`                      |
| `%d`         | 月份中的天数作为零填充的十进制数字（范围 [01,31]）。单个数字前面填充零。                 | `06`                       |
| `%e`         | 月份中的天数作为空格填充的十进制数字（范围 [1,31]）。单个数字前面填充空格。              | `&nbsp; 6`                 |
| `%a`         | 缩写的星期几名称，例如 Fri（与地区相关）                                                               | `Thu`                      |
| `%A`         | 完整的星期几名称，例如 Friday（与地区相关）                                                                   | `Thursday`                 |
| `%w`         | 星期几作为一个整数，其中星期日为 0（范围 [0-6]）                                                          | `4`                        |
| `%u`         | 星期几作为十进制数字，其中周一为 1（ISO 8601 格式）（范围 [1-7]）                                      | `4`                        |
| `%H`         | 小时作为十进制数字，24 小时制（范围 [00-23]）                                                             | `18`                       |
| `%I`         | 小时作为十进制数字，12 小时制（范围 [01,12]）                                                             | `06`                       |
| `%M`         | 分钟作为十进制数字（范围 [00,59]）                                                                          | `32`                       |
| `%S`         | 秒作为十进制数字（范围 [00,60]）                                                                          | `07`                       |
| `%c`         | 标准的日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（与地区相关）                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | 本地化的日期表示（与地区相关）                                                                    | `07/06/23`                 |
| `%X`         | 本地化的时间表示，例如 18:40:20 或 6:40:20 PM（与地区相关）                                       | `18:32:07`                 |
| `%D`         | 简短的 MM/DD/YY 日期，相当于 %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | 简短的 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | 本地化的 12 小时制时间（与地区相关）                                                                     | `06:32:07 PM`              |
| `%R`         | 相当于 "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | 相当于 "%H:%M:%S"（ISO 8601 时间格式）                                                                 | `18:32:07`                 |
| `%p`         | 本地化的上午或下午标识（与地区相关）                                                               | `PM`                       |
| `%z`         | 以 ISO 8601 格式的 UTC 偏移（例如 -0430），或者如果没有时区信息则没有字符 | `+0800`                    |
| `%Z`         | 与地区相关的时区名称或缩写，或如果没有时区信息则没有字符     | `Z AWST `                  |

**示例**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

只在控制台中打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按级别覆盖**

可以覆盖单个日志名称的日志级别。例如，要静音所有 "Backup" 和 "RBAC" 日志记录器的消息：

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

要将日志消息额外写入 syslog：

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`<syslog>` 的键：

| 键        | 描述                                                                                                                                                                                                                                                    |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                                             |
| `hostname` | 要从中发送日志的主机的名称（可选）。                                                                                                                                                                                                                |
| `facility` | syslog [设施关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须以大写字母和 "LOG_" 前缀指定，例如 `LOG_USER`，`LOG_DAEMON`，`LOG_LOCAL3` 等。如果指定了 `address`，默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可能的值：`bsd` 和 `syslog.`                                                                                                                                                                                                           |

**日志格式**

您可以指定将在控制台日志中输出的日志格式。目前，仅支持 JSON。

**示例**

这是一个 JSON 日志输出的示例：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

要启用 JSON 日志支持，请使用以下代码片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**重命名 JSON 日志的键**

可以通过更改 `<names>` 标签内的标签值来修改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**省略 JSON 日志的键**

可以通过注释掉该属性来省略日志属性。例如，如果您不想让日志打印 `query_id`，可以注释掉 `<query_id>` 标签。

## send_crash_reports {#send_crash_reports}

设置用于通过 [Sentry](https://sentry.io) 向 ClickHouse 核心开发团队选择性发送崩溃报告。

特别是在预生产环境中启用此功能是非常受欢迎的。

服务器需要通过 IPv4 访问公共互联网（在撰写时 Sentry 不支持 IPv6），以使该功能正常工作。

键：

| 键                     | 描述                                                                                                                                                          |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 布尔标志，用于启用该功能，默认值为 `false`。设置为 `true` 以允许发送崩溃报告。                                                                                  |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，这是 ClickHouse 中的一个错误。此布尔标志启用将此异常发送到 Sentry（默认值：`false`）。                                           |
| `endpoint`            | 您可以覆盖发送崩溃报告的 Sentry 端点 URL。可以是单独的 Sentry 账户或您自托管的 Sentry 实例。使用 [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk) 语法。 |
| `anonymize`           | 避免将服务器主机名附加到崩溃报告中。                                                                                                                       |
| `http_proxy`          | 配置用于发送崩溃报告的 HTTP 代理。                                                                                                                         |
| `debug`               | 将 Sentry 客户端设置为调试模式。                                                                                                                                |
| `tmp_path`            | 临时崩溃报告状态的文件系统路径。                                                                                                                             |
| `environment`         | 指定 ClickHouse 服务器运行的环境的任意名称。它将在每个崩溃报告中提到。默认值为 `test` 或 `prod`，具体取决于 ClickHouse 的版本。                               |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

主机密钥的公用部分将在首次连接时写入 SSH 客户端侧的 known_hosts 文件。

主机密钥配置默认情况下是无效的。
取消注释主机密钥配置，并提供相应 SSH 密钥的路径以激活它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

SSH 服务器的端口，允许用户使用嵌入式客户端通过 PTY 连接并以交互方式执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

允许多磁盘配置的存储。

存储配置遵循以下结构：

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```
### 磁盘的配置 {#configuration-of-disks}

`disks` 的配置遵循以下结构：

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

上面的子标签定义了 `disks` 的以下设置：

| 设置                      | 描述                                                                                                 |
|--------------------------|------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`          | 磁盘的名称，应是唯一的。                                                                                 |
| `path`                   | 服务器数据将要存储的路径（`data` 和 `shadow` 目录）。应以 `/` 结束。                                  |
| `keep_free_space_bytes`  | 磁盘上保留的空闲空间大小。                                                                                |

:::note
磁盘的顺序无关紧要。
:::
### 策略的配置 {#configuration-of-policies}

上面的子标签定义了 `policies` 的以下设置：

| 设置                              | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                   | 策略的名称。策略名称必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`                   | 卷名。卷名必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `disk`                            | 位于卷内的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `max_data_part_size_bytes`        | 此卷中可以驻留在任何磁盘上的数据块的最大大小。如果合并结果预计块大小超过 `max_data_part_size_bytes`，该块将写入下一个卷。基本上，此功能允许您在热点（SSD）卷上存储新/小块并在它们达到较大大小时将它们移动到冷（HDD）卷。如果策略只有一个卷，则请勿使用此选项。                                                                                                                               |
| `move_factor`                     | 卷上可用的剩余空间的比例。如果空间减少，数据将开始转移到下一个卷（如果有）。在转移过程中，块按大小从大到小（降序）排序，并选择总大小足以满足 `move_factor` 条件的块，如果所有块的总大小不足，那么将移动所有块。                                                                                                                                                                                                                                                                                                                 |
| `perform_ttl_move_on_insert`      | 插入时禁用移动过期 TTL 的数据。默认情况下（如果启用），如果我们插入的某个数据片段根据生命规则已经过期，它将立即移动到移动规则中指定的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），这可能会显著减慢插入速度。如果禁用，则过期数据部分会写入默认卷，然后立即移动到规则中指定的过期 TTL 卷。                                                                                                                                                                              |
| `load_balancing`                  | 磁盘平衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `least_used_ttl_ms`               | 设置更新所有磁盘上可用空间的超时时间（以毫秒为单位）（`0` - 始终更新，`-1` - 永不更新，默认值为 `60000`）。注意，如果磁盘仅由 ClickHouse 使用，并且不会在运行时被文件系统动态调整大小，您可以使用 `-1` 值。在所有其他情况下，不推荐使用，因为它最终会导致空间分配不正确。                                                                                                                             |
| `prefer_not_to_merge`             | 禁用对本卷数据的合并。注意：这可能是有害的，并可能导致性能下降。当启用此设置时（请勿这样做），在此卷上禁止合并数据（这不好）。这允许您控制 ClickHouse 如何与慢磁盘交互。我们建议根本不使用此选项。                                                                                                                                                                                                                                                         |
| `volume_priority`                 | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并覆盖从 1 到 N 的范围（N 是指定的最大参数值），且没有间隙。                                                                                                                                                                                                                                                                                                                                                                        |

对于 `volume_priority`：
- 如果所有卷都有此参数，则按指定顺序进行优先级排序。
- 如果只有 _部分_ 卷具有此参数，则没有此参数的卷的优先级最低。具有此参数的卷按标签值进行优先级排序，其余的优先级由配置文件中相对位置的描述顺序决定。
- 如果 _没有_ 卷具有此参数，则其顺序由配置文件中描述的顺序决定。
- 卷的优先级可能不相同。
## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，可以省略。

有关更多信息，请参见[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

数据库复制的副本组名称。

由复制数据库创建的集群将由同组中的副本组成。
DDL 查询只会等待同组中的副本。

默认值为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```

类型：字符串

默认值： ""
## remap_executable {#remap_executable}

设置使用大页面重新分配机器代码（"文本"）的内存。

默认值： `false`

:::note
此功能高度实验性。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

最大打开文件数。

:::note
我们建议在 macOS 中使用此选项，因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

最大会话超时，以秒为单位。

默认值： `3600`

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_size_to_drop {#max_table_size_to_drop}

删除表的限制。

如果一个 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop`（以字节为单位），您无法使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询删除它。

:::note
值为 `0` 意味着您可以无限制地删除所有表。

此设置不需要重新启动 ClickHouse 服务器以应用。禁用限制的另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

默认值： 50 GB。
## background_pool_size {#background_pool_size}

设置执行后台合并和变更的线程数，适用于具有 MergeTree 引擎的表。

:::note
- 此设置也可以在 ClickHouse 服务器启动时应用于 `default` 配置文件设置，以实现向后兼容性。
- 您只能在运行时增加线程数。
- 要减少线程数，您必须重新启动服务器。
- 调整此设置时，您管理 CPU 和磁盘负载。
:::

:::danger
较小的池大小利用的 CPU 和磁盘资源较少，但是后台进程的进展较慢，可能最终影响查询性能。
:::

在更改它之前，请还查看相关的 MergeTree 设置，例如：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge)。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation)。

**示例**

```xml
<background_pool_size>16</background_pool_size>
```

类型：

默认值： 16。
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

设置用于执行合并和变更操作的内存限制。
如果 ClickHouse 达到设定的限制，它将不会调度任何新的后台合并或变更操作，但将继续执行已经调度的任务。

:::note
值为 `0` 意味着无限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

默认为 `merges_mutations_memory_usage_soft_limit` 值是通过 `memory_amount * merges_mutations_memory_usage_to_ram_ratio` 计算得出的。

**另见：**

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

默认值： `0.5`。
## async_load_databases {#async_load_databases}

异步加载数据库和表。

- 如果为 `true`，所有具有 `Ordinary`、`Atomic` 和 `Replicated` 引擎的非系统数据库将在 ClickHouse 服务器启动后异步加载。请参见 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的表的查询将等待该表启动。如果负载作业失败，查询将重新抛出错误（而不是在 `async_load_databases = false` 的情况下关闭整个服务器）。至少有一个查询等待的表将以更高优先级加载。数据库上的 DDL 查询将只等待该数据库启动。同时考虑为总等待查询数设置限制 `max_waiting_queries`。
- 如果为 `false`，所有数据库将在服务器启动时加载。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```

默认值： `false`。
## async_load_system_database {#async_load_system_database}

系统表的异步加载。如果 `system` 数据库中有大量日志表和部分数据，这非常有用。与 `async_load_databases` 设置无关。

- 如果设置为 `true`，所有具有 `Ordinary`、`Atomic` 和 `Replicated` 引擎的系统数据库将在 ClickHouse 服务器启动后异步加载。请参见 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的系统表的查询将等待该表启动。至少有一个查询等待的表将以更高优先级加载。同时考虑设置 `max_waiting_queries` 限制等待查询的总数。
- 如果设置为 `false`，系统数据库将在服务器启动之前加载。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```

默认值： `false`。
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

设置在前台池中执行加载作业的线程数。前台池用于在服务器启动之前同步加载表，并用于加载等待中的表。前台池的优先级高于后台池。这意味着在前台池中有作业正在运行时，后台池中不会启动任何作业。

:::note
值为 `0` 意味着将使用所有可用的 CPU。
:::

默认值： `0`
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

设置在后台池中执行异步加载作业的线程数。后台池用于在服务器启动后异步加载表，以防没有查询在等待该表。如果有许多表，建议保持后台池中的线程数较低。这将保留 CPU 资源以便于并发查询执行。

:::note
值为 `0` 意味着将使用所有可用的 CPU。
:::

默认值： `0`
## merge_tree {#merge_tree}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的微调。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

默认情况下，此功能被禁用。

**启用**

要手动打开指标历史收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**禁用**

要禁用 `metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

默认情况下，此功能被禁用。

**启用**

要手动打开延迟历史收集 [`system.latency_log`](../../operations/system-tables/latency_log.md)，请创建 `/etc/clickhouse-server/config.d/latency_log.xml`，内容如下：

``` xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**禁用**

要禁用 `latency_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_latency_log.xml`，内容如下：

``` xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

用于 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的微调。此设置的优先级更高。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的设置。

<SystemLogParameters/>

示例：

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>    
</opentelemetry_span_log>
```
```

## openSSL {#openssl}

SSL 客户端/服务器配置。

通过 `libpoco` 库提供对 SSL 的支持。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中解释。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的密钥：

| 选项                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                | 默认值                                      |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `privateKeyFile`              | PEM 证书的私钥文件路径。该文件可以同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                                            |                                           |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 包含证书，则可以省略它。                                                                                                                                                                                                                                                                                                                           |                                           |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录路径。如果此指向一个文件，它必须是 PEM 格式，并且可以包含多个 CA 证书。如果此指向一个目录，必须包含每个 CA 证书的一个 .pem 文件。文件名通过 CA 主体名称的哈希值查找。详细信息可以在 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的手册页中找到。 |                                           |
| `verificationMode`            | 检查节点证书的方法。详细信息在 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述中。可能的值：`none`, `relaxed`, `strict`, `once`。                                                                                                                                                                                                   | `relaxed`                                 |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设定值，验证将失败。                                                                                                                                                                                                                                                                                                                                                          | `9`                                       |
| `loadDefaultCAFile`           | 是否使用内置的 OpenSSL CA 证书。ClickHouse 假设内置的 CA 证书位于文件 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`）中，或在环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                                                               | `true`                                    |
| `cipherList`                  | 支持的 OpenSSL 加密方式。                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH` |
| `cacheSessions`               | 启用或禁用缓存会话。必须与 `sessionIdContext` 一起使用。可接受的值：`true`, `false`。                                                                                                                                                                                                                                                                                                                       | `false`                                   |
| `sessionIdContext`            | 服务器为每个生成的标识符附加的唯一随机字符集。字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终建议使用此参数，因为它有助于避免诸如服务器缓存会话和客户端请求缓存的问题。                                                                                                                                                                               | `$\{application.name\}`                   |
| `sessionCacheSize`            | 服务器缓存的会话最大数。值为 `0` 意味着无限制的会话。                                                                                                                                                                                                                                                                                                                                                            | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | 服务器缓存会话的时间（以小时为单位）。                                                                                                                                                                                                                                                                                                                                                                         | `2`                                       |
| `extendedVerification`        | 如果启用，验证证书 CN 或 SAN 是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                | `false`                                   |
| `requireTLSv1`                | 要求使用 TLSv1 连接。可接受的值：`true`, `false`。                                                                                                                                                                                                                                                                                                                                                              | `false`                                   |
| `requireTLSv1_1`              | 要求使用 TLSv1.1 连接。可接受的值：`true`, `false`。                                                                                                                                                                                                                                                                                                                                                            | `false`                                   |
| `requireTLSv1_2`              | 要求使用 TLSv1.2 连接。可接受的值：`true`, `false`。                                                                                                                                                                                                                                                                                                                                                            | `false`                                   |
| `fips`                        | 激活 OpenSSL FIPS 模式。如果库的 OpenSSL 版本支持 FIPS，则支持此模式。                                                                                                                                                                                                                                                                                                                                             | `false`                                   |
| `privateKeyPassphraseHandler` | 请求访问私钥的密码的类（PrivateKeyPassphraseHandler 子类）。例如： `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                                                                      | `KeyConsoleHandler`                       |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                         | `RejectCertificateHandler`                |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                 |                                           |
| `preferServerCiphers`         | 客户端首选的服务器密码。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                   |

**设置示例：**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- 用于自签名：<verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 用于自签名：<name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件的日志。例如，添加或合并数据。您可以使用日志来模拟合并算法并比较其特性。您可以可视化合并过程。

查询被记录在 [system.part_log](/operations/system-tables/part_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中配置此表的名称（见下文）。

<SystemLogParameters/>

**示例**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```
## path {#path}

数据目录的路径。

:::note
尾部斜杠是必需的。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的设置。

<SystemLogParameters/>

默认设置为：

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```
## Prometheus {#prometheus}

暴露指标数据以供 [Prometheus](https://prometheus.io) 抓取。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。从 '/' 开始。
- `port` – `endpoint` 的端口。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表中暴露指标。
- `events` – 从 [system.events](/operations/system-tables/events) 表中暴露指标。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前指标值。
- `errors` - 暴露自上次服务器重启以来发生的错误数量，按错误代码分类。这些信息也可以从 [system.errors](/operations/system-tables/errors) 获取。

**示例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query-log}

用于记录通过 [log_queries=1](../../operations/settings/settings.md) 设置接收的查询的设置。

查询记录在 [system.query_log](/operations/system-tables/query_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询日志的结构发生变化，旧结构的表将被重命名，同时自动创建新表。

**示例**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```
## query_metric_log {#query_metric_log}

默认情况下禁用。

**启用**

要手动开启指标历史记录收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**禁用**

要禁用 `query_metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[查询缓存](../query-cache.md) 配置。

可用设置如下：

| 设置                       | 描述                                                                                                                        | 默认值           |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------|
| `max_size_in_bytes`       | 最大缓存大小（以字节为单位）。`0` 意味着查询缓存被禁用。                                                                     | `1073741824`     |
| `max_entries`             | 缓存中存储的 `SELECT` 查询结果的最大数量。                                                                                     | `1024`           |
| `max_entry_size_in_bytes` | 可以在缓存中保存的 `SELECT` 查询结果的最大字节大小。                                                                         | `1048576`        |
| `max_entry_size_in_rows`  | 可以在缓存中保存的 `SELECT` 查询结果的最大行数。                                                                             | `30000000`       |

:::note
- 更改的设置将立即生效。
- 查询缓存的数据是在 DRAM 中分配的。如果内存不足，请确保为 `max_size_in_bytes` 设置一个较小的值或完全禁用查询缓存。
:::

**示例**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```
## query_thread_log {#query_thread_log}

用于记录通过 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置接收的查询线程的设置。

查询记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询线程日志的结构发生变化，旧结构的表将被重命名，同时自动创建新表。

**示例**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```
## query_views_log {#query_views_log}

用于记录由通过 [log_query_views=1](/operations/settings/settings#log_query_views) 设置接收的查询所依赖的视图（实时视图、物化视图等）的设置。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是在单独的文件中。您可以在 `table` 参数中更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在更新 ClickHouse 服务器时查询视图日志的结构发生变化，旧结构的表将被重命名，同时自动创建新表。

**示例**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```
## text_log {#text_log}

用于记录文本消息的 [text_log](/operations/system-tables/text_log) 系统表的设置。

<SystemLogParameters/>

此外：

| 设置   | 描述                                                                                                                                 | 默认值         |
|--------|--------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `level` | 存储在表中的最大消息级别（默认值为 `Trace`）。                                                                                       | `Trace`         |

**示例**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```
## trace_log {#trace_log}

用于记录 [trace_log](/operations/system-tables/trace_log) 系统表操作的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置节：

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```
## asynchronous_insert_log {#asynchronous_insert_log}

用于记录异步插入的 [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置。

<SystemLogParameters/>

**示例**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```
## crash_log {#crash_log}

用于记录 [crash_log](../../operations/system-tables/crash-log.md) 系统表操作的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置节：

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

此设置指定自定义（从 SQL 创建的）缓存磁盘的缓存路径。`custom_cached_disks_base_directory` 在自定义磁盘上优先级高于 `filesystem_caches_path`（在 `filesystem_caches_path.xml` 中找到），如果前者不存在则使用后者。文件系统缓存设置路径必须位于该目录内，否则会抛出异常，阻止磁盘被创建。

:::note
这不会影响在较旧版本中创建的磁盘，因其服务器进行了升级。在这种情况下，不会抛出异常，以允许服务器顺利启动。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

用于记录 `BACKUP` 和 `RESTORE` 操作的 [backup_log](../../operations/system-tables/backup_log.md) 系统表的设置。

<SystemLogParameters/>

**示例**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```
## blog_storage_log {#blog_storage_log}

用于 [`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的设置。

<SystemLogParameters/>

示例：

```xml
<blob_storage_log>
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by> 
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
```

## query_masking_rules {#query_masking_rules}

基于正则表达式的规则，将应用于查询以及在将其存储到服务器日志之前的所有日志消息， 
[`system.query_log`](/operations/system-tables/query_log)， [`system.text_log`](/operations/system-tables/text_log)， [`system.processes`](/operations/system-tables/processes) 表，以及发送到客户端的日志。这可以防止敏感数据泄露，例如名称、电子邮件、个人标识符或信用卡号码等 SQL 查询到日志中。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置字段**：

| 设置       | 描述                                                                         |
|-----------|-------------------------------------------------------------------------------|
| `name`    | 规则的名称（可选）                                                         |
| `regexp`  | 兼容 RE2 的正则表达式（必需）                                             |
| `replace` | 替换敏感数据的字符串（可选，默认 - 六个星号）                             |

掩码规则应用于整个查询（以防止通过格式错误/无法解析的查询泄漏敏感数据）。

[`system.events`](/operations/system-tables/events) 表有一个计数器 `QueryMaskingRulesMatch`，表示查询掩码规则匹配的总数。

对于分布式查询，每个服务器必须单独配置，否则，传递给其他节点的子查询将不带掩码存储。
## remote_servers {#remote_servers}

用于配置 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性值，请参见 “[配置文件](/operations/configuration-files)” 部分。

**另见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [复制数据库引擎](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

添加 `<host>` XML 标签时：
- 应该与 URL 中完全相同，因为在 DNS 解析之前会检查该名称。例如：`<host>clickhouse.com</host>`
- 如果在 URL 中明确指定了端口，则会整体检查 host:port。例如：`<host>clickhouse.com:80</host>`
- 如果未指定端口，则允许该主机的任何端口。例如：如果指定了 `<host>clickhouse.com</host>`，则允许 `clickhouse.com:20`（FTP），`clickhouse.com:80`（HTTP），`clickhouse.com:443`（HTTPS）等。
- 如果主机指定为 IP 地址，则会按 URL 中指定的进行检查。例如：`[2a02:6b8:a::a]`。
- 如果存在重定向并且启用了重定向支持，则会检查每个重定向（location 字段）。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

服务器的时区。

以 IANA 标识符的形式指定 UTC 时区或地理位置（例如，Africa/Abidjan）。

时区对于在输出到文本格式（打印到屏幕或文件）时在字符串和日期时间格式之间的转换是必要的，以及在从字符串获取日期时间时。此外，如果函数未收到输入参数中的时区，则在处理时间和日期的函数中也会使用时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另见**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

与客户端通过 TCP 协议通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

与客户端进行安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

与客户端通过 MySQL 协议通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

与客户端通过 PostgreSQL 协议通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

本地文件系统中存储大型查询的临时数据的路径。

:::note
- 只能使用一个选项来配置临时数据存储：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 必须带有尾部斜杠。
:::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

用于将缩短或符号 URL 前缀转换为完整 URL 的配置。

示例：

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```
## user_files_path {#user_files_path}

用户文件的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)， [fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

用户脚本文件的目录。用于可执行用户自定义函数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认：
## user_defined_path {#user_defined_path}

用户自定义文件的目录。用于 SQL 用户自定义函数 [SQL User Defined Functions](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 设置配置文件。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information}

确定在接收到查询数据包时是否启用客户端信息验证。

默认情况下，它是 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## access_control_improvements {#access_control_improvements}

访问控制系统的可选改进设置。

| 设置                                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 默认  |
|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| `users_without_row_policies_can_read_rows` | 设置没有权限行策略的用户是否仍然可以使用 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B 并且仅为 A 定义了行策略，则如果此设置为 true，用户 B 将看到所有行。如果此设置为 false，则用户 B 将看不到任何行。                                                                                                                                                                                                                                                  | `true`  |
| `on_cluster_queries_require_cluster_grant` | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`  |
| `select_from_system_db_requires_grant`     | 设置 `SELECT * FROM system.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则该查询需要 `GRANT SELECT ON system.<table>`，与非系统表相同。例外：一些系统表（`tables`、`columns`、`databases` 和一些常量表如 `one`、`contributors`）仍然对所有人可访问；如果授予了 `SHOW` 权限（例如 `SHOW USERS`），则相应的系统表（即 `system.users`）将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则该查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                                                                                                           | `true`  |
| `settings_constraints_replace_previous`     | 设置某个设置的配置文件中的约束是否将取消对该设置的先前约束（在其他配置文件中定义）的操作，包括未被新约束设置的字段。还启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                       | `true`  |
| `table_engines_require_grant`              | 设置使用特定表引擎创建表时是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `false` |
| `role_cache_expiration_time_seconds`       | 设置角色在角色缓存中存储的最后访问时间以来的秒数。                                                                                                                                                                                                                                                                                                                                                                                                                                               | `600`   |

示例：

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```
## s3queue_log {#s3queue_log}

`s3queue_log` 系统表的设置。

<SystemLogParameters/>

默认设置为：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

此设置允许指定 `dictionaries_lazy_load` 为 `false` 时的行为。
（如果 `dictionaries_lazy_load` 为 `true`，则此设置不影响任何内容。）

如果 `wait_dictionaries_load_at_startup` 为 `false`，则服务器将在启动时开始加载所有字典，并将并行接收连接。
当查询第一次使用某个字典时，如果字典尚未加载，则查询将等待直到字典加载完成。
将 `wait_dictionaries_load_at_startup` 设置为 `false` 可以使 ClickHouse 启动更快，但是某些查询可能会运行得更慢
（因为它们将不得不等待某些字典被加载）。

如果 `wait_dictionaries_load_at_startup` 为 `true`，那么服务器将在启动时等待
所有字典完成加载（成功或失败）后再接收任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

默认：true
## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。 ClickHouse 在使用复制表时使用 ZooKeeper 存储副本的元数据。如果未使用复制表，则可以省略此参数部分。

可以通过子标签配置以下设置：

| 设置                                     | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                   | ZooKeeper 端点。您可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定尝试连接到 ZooKeeper 集群时的节点顺序。                                                                                                                                                                                                                                                                                                                                         |
| `session_timeout_ms`                    | 客户端会话的最大超时（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `operation_timeout_ms`                  | 单个操作的最大超时（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `root`（可选）                          | ClickHouse 服务器使用的 znodes 根的 znode。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.min` （可选） | 当主节点不可用时，备用节点的 zookeeper 会话的最小存活时间（负载均衡）。以秒为单位设置。默认值：3 小时。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.max` （可选） | 当主节点不可用时，备用节点的 zookeeper 会话的最大存活时间（负载均衡）。以秒为单位设置。默认值：6 小时。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `identity`（可选）                      | 访问请求的 znodes 时 ZooKeeper 要求的用户和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `use_compression`（可选）               | 如果设置为 true，则启用 Keeper 协议中的压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

还有 `zookeeper_load_balancing` 设置（可选），可以让您选择 ZooKeeper 节点选择的算法：

| 算法名称                      | 描述                                                                                                                     |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `random`                      | 随机选择一个 ZooKeeper 节点。                                                                                           |
| `in_order`                    | 选择第一个 ZooKeeper 节点，如果不可用则选择第二个，以此类推。                                                          |
| `nearest_hostname`            | 选择与服务器主机名最相似的 ZooKeeper 节点，主机名与名称前缀进行比较。                                                  |
| `hostname_levenshtein_distance` | 与 nearest_hostname 类似，但以 levenshtein 距离的方式比较主机名。                                                   |
| `first_or_random`             | 选择第一个 ZooKeeper 节点，如果不可用，则随机选择剩余的一个 ZooKeeper 节点。                                          |
| `round_robin`                 | 选择第一个 ZooKeeper 节点，如果重新连接，则选择下一个。                                                                |

**示例配置**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- 可选。Chroot 后缀。必须存在。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 可选。Zookeeper 摘要 ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另见**

- [复制](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据部分头的存储方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分全局**

ClickHouse 将对此服务器上的所有表使用此设置。您可以随时更改设置。已有表在设置更改时会改变其行为。

**对于每个表**

创建表时，指定相应的 [引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。即使全局设置更改，带有此设置的现有表的行为也不会改变。

**可选值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [复制](../../engines/table-engines/mergetree-family/replication.md) 表使用单个 `znode` 紧凑存储数据部分的头。如果表包含许多列，则此存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群中的服务器上升级 ClickHouse 时请小心。不要一次升级所有服务器。最好在测试环境中测试 ClickHouse 的新版本，或者在集群中的少数服务器上进行升级。

已经使用此设置存储的数据部分头无法恢复到其先前（非紧凑）表示。
:::

类型：UInt8

默认：0
## distributed_ddl {#distributed_ddl}

管理在集群上执行 [分布式 ddl 查询](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 的情况下工作。

`<distributed_ddl>` 中的可配置设置包括：

| 设置                 | 描述                                                                                                               | 默认值                         |
|----------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------|
| `path`               | DDL 查询的 `task_queue` 在 Keeper 中的路径                                                                        |                                |
| `profile`            | 用于执行 DDL 查询的配置文件                                                                                     |                                |
| `pool_size`          | 可以同时运行多少个 `ON CLUSTER` 查询                                                                              |                                |
| `max_tasks_in_queue` | 队列中可以包含的最大任务数                                                                                        | `1,000`                        |
| `task_max_lifetime`  | 如果节点的年龄超过该值，则删除节点。                                                                              | `7 * 24 * 60 * 60`（一周的秒数） |
| `cleanup_delay_period` | 如果最后一次清理距离现在没有超过 `cleanup_delay_period` 秒，在接收到新的节点事件后开始清理。                  | `60` 秒                       |

**示例**

```xml
<distributed_ddl>
    <!-- 在 ZooKeeper 中 DDL 查询任务队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 将使用此配置文件的设置执行 DDL 查询 -->
    <profile>default</profile>

    <!-- 控制可以同时运行的 ON CLUSTER 查询数量。 -->
    <pool_size>1</pool_size>

    <!--
         清理设置（活动任务将不会被删除）
    -->

    <!-- 控制任务的生存时间（默认 1 周） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理频率（以秒为单位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可以存在的任务数量 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

ClickHouse 服务器存储通过 SQL 命令创建的用户和角色配置的路径。

**另见**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)

类型：字符串

默认：`/var/lib/clickhouse/access/`。
## allow_plaintext_password {#allow_plaintext_password}

设置是否允许明文密码类型（不安全）。

默认：`1`（允许 authType plaintext_password）

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

设置是否允许不安全的无密码密码类型。

默认：`1`（允许 authType no_password）

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

禁止在未明确指定 'IDENTIFIED WITH no_password' 的情况下创建无密码用户。

默认：`1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

默认会话超时时间（以秒为单位）。

默认：`60`

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

设置在像 `CREATE USER u IDENTIFIED BY 'p'` 的查询中自动设置的密码类型。

接受的值为：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
```yaml
title: '用户目录'
sidebar_label: '用户目录'
keywords: ['用户', '目录', '配置']
description: '用户目录配置部分，包含相关设置。'
```

## user_directories {#user_directories}

配置文件的部分，包含以下设置：
- 预定义用户的配置文件路径。
- 通过 SQL 命令创建的用户存储的文件夹路径。
- 通过 SQL 命令创建的用户存储和复制的 ZooKeeper 节点路径（实验性）。

如果指定了此部分，则将不会使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 的路径。

`user_directories` 部分可以包含任意数量的项，项的顺序表示其优先级（项越高优先级越高）。

**示例**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

用户、角色、行策略、配额和配置文件也可以存储在 ZooKeeper 中：

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

您还可以定义 `memory` 部分——表示仅在内存中存储信息，不写入磁盘，以及 `ldap` 部分——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器作为未在本地定义的用户的远程用户目录，请定义一个具有以下设置的单一 `ldap` 部分：

| 设置     | 描述                                                                                                                                                                                                                                                                                                                                                                      |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | 在 `ldap_servers` 配置部分中定义的一个 LDAP 服务器名称。此参数是必需的，不能为空。                                                                                                                                                                                                                                                                                      |
| `roles`  | 包含将被分配给从 LDAP 服务器检索到的每个用户的本地定义角色的列表的部分。如果未指定角色，用户在身份验证后将无法执行任何操作。如果在身份验证时列出的任何角色未在本地定义，则身份验证尝试将失败，仿佛提供的密码不正确。                                                                                                                                                                                             |

**示例**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```
## top_level_domains_list {#top_level_domains_list}

定义要添加的自定义顶级域的列表，其中每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 及其变体，
接受自定义 TLD 列表名称，返回包含顶级子域的域的部分，直到第一个显著子域。
## total_memory_profiler_step {#total_memory_profiler_step}

设置每个峰值分配步骤的堆栈跟踪内存大小（以字节为单位）。数据存储在 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表中，`query_id` 等于空字符串。

默认值： `4194304`。
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

允许收集随机分配和取消分配，并以指定的概率将它们写入 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表中，`trace_type` 等于 `MemorySample`。该概率适用于每次分配或取消分配，而不管分配的大小。请注意，只有当未跟踪的内存量超过未跟踪内存限制（默认值为 `4` MiB）时，才会进行采样。如果 [total_memory_profiler_step](#total_memory_profiler_step) 降低，则可以降低该值。您可以将 `total_memory_profiler_step` 设置为 `1` 以获得额外精细的采样。

可能的值：

- 正整数。
- `0` — 禁用在 `system.trace_log` 系统表中写入随机分配和取消分配。

默认值： `0`。
## compiled_expression_cache_size {#compiled_expression_cache_size}

设置 [已编译表达式](../../operations/caches.md) 的缓存大小（以字节为单位）。

默认值： `134217728`。
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

设置 [已编译表达式](../../operations/caches.md) 的元素缓存大小。

默认值： `10000`。
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

启用或禁用在 `SHOW` 和 `SELECT` 查询中显示表、数据库、表函数和字典的秘密。

希望查看秘密的用户还必须开启 [`format_display_secrets_in_show_and_select` 格式设置](../settings/formats#format_display_secrets_in_show_and_select) 和拥有 [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的值：

- `0` — 禁用。
- `1` — 启用。

默认值： `0`
## proxy {#proxy}

为 HTTP 和 HTTPS 请求定义代理服务器，当前支持 S3 存储、S3 表函数和 URL 函数。

定义代理服务器有三种方式：
- 环境变量
- 代理列表
- 远程代理解析器。

使用 `no_proxy` 也支持为特定主机绕过代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为给定协议指定代理服务器。如果您在系统中设置，该代理服务器应可以无缝工作。

如果给定协议只有一个代理服务器并且该代理服务器不变，这是最简单的方法。

**代理列表**

这种方法允许您为一个协议指定一个或多个代理服务器。如果定义了多个代理服务器，则 ClickHouse 将以轮询的方式使用不同的代理，平衡服务器之间的负载。如果为一个协议有多个代理服务器且代理服务器列表不变，这是最简单的方法。

**配置模板**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
在以下选项卡中选择一个父字段以查看其子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段     | 描述                           |
|-----------|---------------------------------|
| `<http>`  | 一个或多个 HTTP 代理的列表     |
| `<https>` | 一个或多个 HTTPS 代理的列表    |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段   | 描述           |
|---------|------------------|
| `<uri>` | 代理的 URI     |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态变化。在这种情况下，您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。ClickHouse 将使用以下模板形成代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**配置模板**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

在以下选项卡中选择一个父字段以查看其子项：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段    | 描述                        |
|----------|------------------------------|
| `<http>` | 一个或多个解析器的列表*     |
| `<https>` | 一个或多个解析器的列表*    |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段       | 描述                                   |
|------------|----------------------------------------|
| `<resolver>` | 解析器的端点及其他详细信息           |

:::note
您可以拥有多个 `<resolver>` 元素，但仅使用给定协议的第一个 `<resolver>`。该协议的任何其他 `<resolver>` 元素将被忽略。这意味着负载均衡（如有需要）应该由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段               | 描述                                                                                                                                                                        |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析器的 URI                                                                                                                                                          |
| `<proxy_scheme>`    | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                                                           |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                                                                        |
| `<proxy_cache_time>` | 解析器的值应该被 ClickHouse 缓存的秒数。将此值设置为 `0` 会导致 ClickHouse 为每个 HTTP 或 HTTPS 请求联系解析器。                                             |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置                |
|-------|----------------------|
| 1.    | 远程代理解析器      |
| 2.    | 代理列表            |
| 3.    | 环境变量            |

ClickHouse 将为请求协议检查最高优先级的解析器类型。如果未定义，将检查下一个优先级的解析器类型，直到检索环境解析器。这也允许可以混合使用解析器类型。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，使用隧道（即 `HTTP CONNECT`）通过 `HTTP` 代理发起 `HTTPS` 请求。该设置可用于禁用它。

**no_proxy**

默认情况下，所有请求都将通过代理。为了在特定主机上禁用该功能，必须设置 `no_proxy` 变量。
可以在 `<proxy>` 子句内为列表和远程解析器设置，并作为环境变量用于环境解析器。
它支持 IP 地址、域、子域以及用于完全绕过的 `'*'` 通配符。前导点会被移除，就像 curl 一样。

**示例**

以下配置绕过对 `clickhouse.cloud` 及其所有子域（例如 `auth.clickhouse.cloud`）的代理请求。
对于 GitLab 也是如此，尽管它有前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

附加到表的物化视图数量限制。

:::note
此处仅考虑直接依赖的视图，创建一个视图在另一个视图上不被视为依赖。
:::

默认值： `0`。
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

如果设置为 `true`，则在格式化查询中，修改操作将被括起来。这使得格式化的修改查询解析起来不那么模糊。

类型： `Bool`

默认值： `0`
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

如果为 true，ClickHouse 不会在 `CREATE VIEW` 查询中为空的 SQL 安全声明写入默认值。

:::note
此设置在迁移期间是必要的，在 24.4 版本后将变得过时。
:::

类型： `Bool`

默认值： `1`
## merge_workload {#merge_workload}

用于调节资源在合并和其他工作负载之间的利用和共享。指定的值用作所有后台合并的 `workload` 设置值。可以被合并树设置覆盖。

类型： `String`

默认值： `default`

**另见**
- [工作负载调度](/operations/workload-scheduling.md)
## mutation_workload {#mutation_workload}

用于调节资源在变更和其他工作负载之间的利用和共享。指定的值用作所有后台变更的 `workload` 设置值。可以被合并树设置覆盖。

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

类型： `String`

默认值： `default`
## throw_on_unknown_workload {#throw_on_unknown_workload}

定义对未知工作负载访问时的行为，查询设置为 'workload'。

- 如果为 `true`，将从尝试访问未知工作负载的查询中抛出 RESOURCE_ACCESS_DENIED 异常。这有助于在确定工作负载层级并包含工作负载默认值后，强制所有查询进行资源调度。
- 如果为 `false`（默认值），提供给指向未知工作负载的查询的 'workload' 设置将不进行资源调度，提供无限制访问。这在设置工作负载层次结构、添加工作负载默认值之前是重要的。

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

类型： String

默认值： false

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```
## workload_path {#workload_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

ZooKeeper 节点的路径，用作所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的存储。为了保证一致性，所有 SQL 定义都存储为此单个 znode 的值。默认情况下不使用 ZooKeeper，定义存储在 [磁盘](#workload_path) 上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另见**
- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## use_legacy_mongodb_integration {#use_legacy_mongodb_integration}

使用遗留的 MongoDB 集成实现。已弃用。

类型： `Bool`

默认值： `true`。
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

用户可以使用或更改的身份验证方法的最大数量。
更改此设置不会影响现有用户。如果创建/更改与身份验证相关的查询超过此设置中指定的限制，则会失败。
非身份验证的创建/更改查询将成功。

:::note
值为 `0` 表示无限制。
:::

类型： `UInt64`

默认值： `100`
## allow_feature_tier {#allow_feature_tier}

控制用户是否可以更改与不同功能层相关的设置。

- `0` - 允许对任何设置进行更改（实验性、测试、生产）。
- `1` - 仅允许对测试和生产功能设置进行更改。拒绝对实验性设置的更改。
- `2` - 仅允许对生产设置进行更改。拒绝对实验性或测试设置的更改。

这相当于对所有 `EXPERIMENTAL` / `BETA` 功能施加了只读约束。

:::note
值为 `0` 表示可以更改所有设置。
:::

类型： `UInt32`

默认值： `0`
