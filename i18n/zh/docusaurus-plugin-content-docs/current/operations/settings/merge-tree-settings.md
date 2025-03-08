---
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表设置'
description: '设置 `system.merge_tree_settings` 中的 MergeTree'
---

系统表 `system.merge_tree_settings` 显示全局设置的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中进行设置，或在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

自定义设置 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中配置所有 `MergeTree` 表的默认值：

``` text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

为特定表设置：

``` sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

使用 `ALTER TABLE ... MODIFY SETTING` 更改特定表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- 重置为全局默认值（来自 system.merge_tree_settings 的值）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## allow_nullable_key {#allow_nullable_key}

允许 Nullable 类型作为主键。

默认值：0。
## index_granularity {#index_granularity}

索引标记之间的数据行的最大数量。

默认值：8192。
## index_granularity_bytes {#index_granularity_bytes}

数据粒度的最大字节大小。

默认值：10485760（大约 10 MiB）。

要仅根据行数限制粒度大小，将其设置为 0（不推荐）。
## min_index_granularity_bytes {#min_index_granularity_bytes}

粒度的最小允许字节大小。

默认值：1024b。

用以防止意外创建具有非常低 index_granularity_bytes 的表。
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

启用或禁用过渡，利用 `index_granularity_bytes` 设置控制粒度大小。在 19.11 版本之前，仅有 `index_granularity` 设置用于限制粒度大小。`index_granularity_bytes` 设置在从大行（数十和数百 MB）的表中选择数据时提升 ClickHouse 性能。如果您有大行的表，可以为这些表启用此设置以提高 `SELECT` 查询的效率。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

ZooKeeper 中数据部分头的存储方法。如果启用，ZooKeeper 存储更少的数据。更多细节请参见 [这里](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

进行合并操作的最小数据量，这对于使用直接 I/O 访问存储磁盘是必需的。 

在合并数据分片时，ClickHouse 计算所有要合并的数据的总存储量。如果该数量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 使用直接 I/O 接口（`O_DIRECT` 选项）读取和写入存储磁盘的数据。

如果 `min_merge_bytes_to_use_direct_io = 0`，则直接 I/O 被禁用。

默认值：`10 * 1024 * 1024 * 1024` 字节。
## ttl_only_drop_parts {#ttl_only_drop_parts}

控制在 MergeTree 表中，当该部分中的所有行根据其 `TTL` 设置已过期时，数据部分是否完全删除。

当 `ttl_only_drop_parts` 被禁用（默认值），仅仅根据 `TTL` 设置过期的行会被移除。

当 `ttl_only_drop_parts` 被启用时，如果该部分中的所有行根据其 `TTL` 设置都已过期，则整个部分将被删除。

默认值：0。
## merge_with_ttl_timeout {#merge_with_ttl_timeout}

在使用删除 TTL 重新进行合并之前的最小延迟（以秒为单位）。

默认值：`14400` 秒（4 小时）。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout}

在使用重新压缩 TTL 重新进行合并之前的最小延迟（以秒为单位）。

默认值：`14400` 秒（4 小时）。
## write_final_mark {#write_final_mark}

启用或禁用在数据部分的末尾（最后一个字节后）写入最终索引标记。

默认值：1。

不要更改，否则将发生不良后果。
## storage_policy {#storage_policy}

存储策略。
## min_bytes_for_wide_part {#min_bytes_for_wide_part}

可以以 `Wide` 格式存储的数据部分的最小字节/行数。
您可以设置一个、两个或都不设置这些设置。
## max_compress_block_size {#max_compress_block_size}

在写入表之前，未压缩数据的最大块大小。 

您还可以在全局设置中指定此设置（请参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值将覆盖此设置的全局值。
## min_compress_block_size {#min_compress_block_size}

在写入下一个标记时所需的未压缩数据的最小块大小。

您还可以在全局设置中指定此设置（请参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。在创建表时指定的值将覆盖此设置的全局值。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

在未选择部分后再次尝试选择要合并的部分之前的最大等待时间。更低的设置将导致在 `background_schedule_pool` 中频繁触发选择任务，这在大规模集群中会产生大量请求到 ZooKeeper。

默认值：`60000`
## max_suspicious_broken_parts {#max_suspicious_broken_parts}

如果单个分区中的损坏部分数量超过 `max_suspicious_broken_parts` 值，则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：100。
## parts_to_throw_insert {#parts-to-throw-insert}

如果单个分区中的活动部分数量超过 `parts_to_throw_insert` 值，则 `INSERT` 被中断，抛出异常 `Too many parts (N). Merges are processing significantly slower than inserts`。

可能的值：

- 任何正整数。

默认值：3000。

为了实现 `SELECT` 查询的最大性能，需要最小化处理的部分数量，请参见 [Merge Tree](../../development/architecture.md#merge-tree)。

在 23.6 之前，此设置设为 300。您可以设置一个更高的不同值，这将减少 `Too many parts` 错误的几率，但同时 `SELECT` 性能可能会下降。此外，在合并问题（例如，由于磁盘空间不足）的情况下，您将比使用原来的 300 更晚地注意到此问题。
## parts_to_delay_insert {#parts-to-delay-insert}

如果单个分区中的活动部分数量超过 `parts_to_delay_insert` 值，则 `INSERT` 人为放缓。

可能的值：

- 任何正整数。

默认值：1000。

ClickHouse 人为延长 `INSERT` 的执行时间（增加 'sleep'），以使后台合并过程能比添加的部分更快地合并部分。
## inactive_parts_to_throw_insert {#inactive-parts-to-throw-insert}

如果单个分区中的非活动部分数量超过 `inactive_parts_to_throw_insert` 值，则 `INSERT` 被中断，并抛出异常 "Too many inactive parts (N). Parts cleaning are processing significantly slower than inserts"。

可能的值：

- 任何正整数。

默认值：0（无限制）。
## inactive_parts_to_delay_insert {#inactive-parts-to-delay-insert}

如果单个分区中的非活动部分数量至少为 `inactive_parts_to_delay_insert` 值，则 `INSERT` 人为放缓。这在服务器未能足够快地清理部分时非常有用。

可能的值：

- 任何正整数。

默认值：0（无限制）。
## max_delay_to_insert {#max-delay-to-insert}

用于计算 `INSERT` 延迟的秒数，如果单个分区中的活动部分数量超过 [parts_to_delay_insert](#parts-to-delay-insert) 值。

可能的值：

- 任何正整数。

默认值：1。

`INSERT` 的延迟（以毫秒为单位）按以下公式计算：
```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果一个分区有 299 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，则 `INSERT` 被延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

从 23.1 版本起，公式已更改为：
```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000) * parts_over_threshold / allowed_parts_over_threshold)
```
例如，如果一个分区有 224 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，min_delay_to_insert_ms = 10，则 `INSERT` 被延迟 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_parts_in_total {#max-parts-in-total}

如果表的所有分区中活动部分的总数量超过 `max_parts_in_total` 值，则 `INSERT` 被中断，并抛出异常 `Too many parts (N)`。

可能的值：

- 任何正整数。

默认值：100000。

表中部分的数量过多会降低 ClickHouse 查询的性能并增加 ClickHouse 启动时间。大多数情况下，这源于设计不当（在选择分区策略时的错误 - 分区过小）。
## simultaneous_parts_removal_limit {#simultaneous-parts-removal-limit}

如果旧部分较多，清理线程将在一次迭代中尝试删除多达 `simultaneous_parts_removal_limit` 个部分。`simultaneous_parts_removal_limit` 设为 `0` 表示无限制。

默认值：0。
## replicated_deduplication_window {#replicated_deduplication-window}

ClickHouse Keeper 存储的最近插入块的数量，用于检查重复项的哈希总和。

可能的值：

- 任何正整数。
- 0（禁用去重）

默认值：1000。

`Insert` 命令创建一个或多个块（部分）。对于 [insert deduplication](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将创建部分的哈希总和写入 ClickHouse Keeper。哈希总和仅存储最近的 `replicated_deduplication_window` 个块。最旧的哈希总和会从 ClickHouse Keeper 中删除。
大量的 `replicated_deduplication_window` 会降低 `Inserts` 的速度，因为它需要比较更多的条目。
哈希总和是从字段名称和类型的组合以及插入部分的数据（字节流）计算得出的。
## non_replicated_deduplication_window {#non-replicated-deduplication-window}

在非复制 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，存储用于检查重复项的哈希总和的最近插入块的数量。

可能的值：

- 任何正整数。
- 0（禁用去重）。

默认值：0。

使用了类似于复制表的去重机制（请参见 [replicated_deduplication_window](#replicated-deduplication-window) 设置）。创建部分的哈希总和写入磁盘上的本地文件。
## replicated_deduplication_window_seconds {#replicated_deduplication-window-seconds}

在 ClickHouse Keeper 中，插入块的哈希总和在此之后将被删除的秒数。

可能的值：

- 任何正整数。

默认值：604800（1 周）。

类似于 [replicated_deduplication_window](#replicated-deduplication-window)，`replicated_deduplication_window_seconds` 指定存储插入去重的块的哈希总和的时间。哈希总和在超过 `replicated_deduplication_window_seconds` 后会从 ClickHouse Keeper 中删除，即使它们少于 `replicated_deduplication_window`。

时间是相对于最近记录的时间，而不是墙时间。如果它是唯一的记录，它将永远存储。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication-window-for-async-inserts}

最近插入的异步块的数量，ClickHouse Keeper 存储哈希总和以检查重复项。

可能的值：

- 任何正整数。
- 0（为异步插入禁用去重）

默认值：10000。

[Async Insert](/operations/settings/settings#async_insert) 命令将在一个或多个块（部分）中缓存。对于 [insert deduplication](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将每个插入的哈希总和写入 ClickHouse Keeper。哈希总和仅存储最近的 `replicated_deduplication_window_for_async_inserts` 个块。最旧的哈希总和将从 ClickHouse Keeper 中删除。
大量的 `replicated_deduplication_window_for_async_inserts` 会降低 `Async Inserts` 的速度，因为它需要比较更多的条目。
哈希总和是从字段名称和类型的组合以及插入的数据（字节流）计算得出的。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication-window-seconds-for-async-inserts}

在 ClickHouse Keeper 中，异步插入的哈希总和在此之后将被删除的秒数。

可能的值：

- 任何正整数。

默认值：604800（1 周）。

与 [replicated_deduplication_window_for_async_inserts](#replicated-deduplication-window-for-async-inserts) 类似，`replicated_deduplication_window_seconds_for_async_inserts` 指定存储异步插入去重的块的哈希总和的时间。哈希总和在超过 `replicated_deduplication_window_seconds_for_async_inserts` 后会从 ClickHouse Keeper 移除，即使它们少于 `replicated_deduplication_window_for_async_inserts`。

时间是相对于最近记录的时间，而不是墙时间。如果它是唯一的记录，它将永远存储。
## use_async_block_ids_cache {#use-async-block-ids-cache}

如果为真，则我们缓存异步插入的哈希总和。

可能的值：

- true，false

默认值：false。

一个包含多个异步插入的块将生成多个哈希总和。当其中一些插入重复时，Keeper 仅会在一个 RPC 中返回一个重复的哈希总和，这将导致不必要的 RPC 重试。此缓存将监视 Keeper 中的哈希总和路径。如果在 Keeper 中观察到更新，缓存将尽快更新，以便我们能够在内存中过滤重复的插入。
## async_block_ids_cache_min_update_interval_ms {#async_block_ids_cache_min_update_interval_ms}

更新 `use_async_block_ids_cache` 的最小间隔（以毫秒为单位）

可能的值：

- 任何正整数。

默认值：100。

通常，`use_async_block_ids_cache` 将在观察到新的 Keeper 路径更新时尽快进行更新。然而，缓存更新可能太频繁，导致负担过重。这个最小间隔防止了缓存更新得过快。请注意，如果我们将此值设置得过长，带有重复插入的块将具有更长的重试时间。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

如果存在非活动副本，ClickHouse Keeper 日志中可以保留的记录数量。超过该数量后，非活动副本变为丢失。

可能的值：

- 任何正整数。

默认值：1000
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep}

在 ZooKeeper 日志中保留约这一数量的最后记录，即使它们已过时。这不会影响表的工作：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：

- 任何正整数。

默认值：10
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建以来的时间超过此阈值，并且部分的大小总和大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本获取合并部分，而不是在本地进行合并。这样做是为了加速非常长的合并。

可能的值：

- 任何正整数。

默认值：3600
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

如果部分的大小总和超过此阈值，并且自复制日志条目创建以来的时间超过 `prefer_fetch_merged_part_time_threshold`，则优先从副本获取合并部分，而不是在本地进行合并。这样做是为了加速非常长的合并。

可能的值：

- 任何正整数。

默认值：10,737,418,240
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

当此设置的值大于零时，仅单个副本立即开始合并，其他副本等待最多该时间量以下载结果，而不进行本地合并。如果所选副本在该时间内未完成合并，则将回退到标准行为。

可能的值：

- 任何正整数。

默认值：0（秒）
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

当此设置的值大于零时，仅在共享存储上合并部分时，如果启用了 `allow_remote_fs_zero_copy_replication`，则只有单个副本立即开始合并。

:::note 零拷贝复制尚未准备好用于生产
在 ClickHouse 22.8 及更高版本中，零拷贝复制默认情况下已禁用。此功能不推荐用于生产环境。
:::

可能的值：

- 任何正整数。

默认值：10800
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

在开始合并时的超时时间（以秒为单位），在此之前 ClickHouse 尝试从分配此合并的副本获取重新压缩的部分。

在大多数情况下，重新压缩工作缓慢，因此我们在此超时到期之前不会开始合并，并尝试从分配此合并的副本获取重新压缩的部分。

可能的值：

- 任何正整数。

默认值：7200
## always_fetch_merged_part {#always_fetch_merged_part}

如果为真，则这个副本永远不会合并部分，并始终从其他副本下载合并部分。

可能的值：

- true，false

默认值：false
## max_suspicious_broken_parts {#max_suspicious_broken_parts-1}

最大损坏部分，如果更多，则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：100
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

所有损坏部分的最大大小，如果更多，则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：1,073,741,824
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

如果修改的文件数（删除、添加）超过此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：75
## max_files_to_remove_in_alter_columns {#max_files_to-remove-in-alter-columns}

如果删除的文件的数量超过此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：50
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts}

如果错误部分与总部分的比例小于此值，则允许启动。

可能的值：

- 浮点数，0.0 - 1.0

默认值：0.5
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host}

限制从端点的并行提取（实际池大小）。

可能的值：

- 任何正整数。

默认值：15
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout-1}

获取部件请求的 HTTP 连接超时时间。如果未明确设置，则从默认配置文件 `http_connection_timeout` 继承。

可能的值：

- 任何正整数。

默认值：从默认配置文件 `http_connection_timeout` 继承（如果未明确设置）。
## replicated_can_become_leader {#replicated_can_become_leader}

如果为真，此节点上的复制表副本将尝试获取领导权。

可能的值：

- true，false

默认值：true
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

ZooKeeper 会话过期检查周期，以秒为单位。

可能的值：

- 任何正整数。

默认值：60
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

在修复丢失的副本时，不删除旧的本地部分。

可能的值：

- true，false

默认值：true
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

获取部分请求的 HTTP 连接超时时间（以秒为单位）。如果未明确设置，则从默认配置文件 [http_connection_timeout](./settings.md#http_connection_timeout) 继承。

可能的值：

- 任何正整数。
- 0 - 使用 `http_connection_timeout` 的值。

默认值：0。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

获取部分请求的 HTTP 发送超时时间（以秒为单位）。如果未明确设置，则从默认配置文件 [http_send_timeout](./settings.md#http_send_timeout) 继承。

可能的值：

- 任何正整数。
- 0 - 使用 `http_send_timeout` 的值。

默认值：0。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

获取部分请求的 HTTP 接收超时时间（以秒为单位）。如果未明确设置，则从默认配置文件 [http_receive_timeout](./settings.md#http_receive_timeout) 继承。

可能的值：

- 任何正整数。
- 0 - 使用 `http_receive_timeout` 的值。

默认值：0。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

限制通过网络进行的 [replicated](../../engines/table-engines/mergetree-family/replication.md) 提取的数据交换的最大速度，以字节每秒为单位。此设置适用于特定表，与 [max_replicated_fetches_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置不同，后者适用于服务器。

您可以限制服务器网络和特定表的网络，但要求表级设置的值必须小于服务器级设置的值。否则，服务器只会考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置的执行并不完美。

可能的值：

- 正整数。
- 0 — 不限制。

默认值：`0`。

**用法**

可用于在复制数据以增加或替换新节点时限制速度。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

限制通过网络进行的 [replicated](../../engines/table-engines/mergetree-family/replication.md) 发送的数据交换的最大速度，以字节每秒为单位。此设置适用于特定表，与 [max_replicated_sends_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置不同，后者适用于服务器。

您可以限制服务器网络和特定表的网络，但要求表级设置的值必须小于服务器级设置的值。否则，服务器只会考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置的执行并不完美。

可能的值：

- 正整数。
- 0 — 不限制。

默认值：`0`。

**用法**

可用于在复制数据以增加或替换新节点时限制速度。
## old_parts_lifetime {#old-parts-lifetime}

存储非活动部分的时间（以秒为单位），以防止在服务器自发重启期间数据丢失。

可能的值：

- 任何正整数。

默认值：480。

在将多个部分合并为新部分后，ClickHouse 将原始部分标记为非活动，并在经过 `old_parts_lifetime` 秒后才能删除它们。非活动部分在未被当前查询使用时被移除，即当部分的 `refcount` 为 1 时。

对于新部分不会调用 `fsync`，因此在某段时间内新部分仅存在于服务器的 RAM（操作系统缓存）中。如果服务器自发重启，则新部分可能会丢失或损坏。为了保护数据，非活动部分不会立即删除。

在启动时，ClickHouse 检查这些部分的完整性。如果合并的部分损坏，ClickHouse 会将非活动部分返回到活动列表，随后再次进行合并。然后，将损坏的部分重命名（添加 `broken_` 前缀），并移动到 `detached` 文件夹。如果合并的部分未损坏，则将原来的非活动部分重命名（添加 `ignored_` 前缀）并移动到 `detached` 文件夹。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（写入数据仅存储在 RAM 中的最大时间），但在对磁盘系统的重负载下，数据的写入可能会更晚。通过实验证明，选择480秒作为 `old_parts_lifetime` 的值，在此时间段内保证新部分会被写入磁盘。
## max_bytes_to_merge_at_max_space_in_pool {#max-bytes-to-merge-at-max-space-in-pool}

可以合并为一个部分的最大总部分大小（以字节为单位），如果有足够的资源可用。
大致对应自动后台合并创建的最大可能部分大小。

可能的值：

- 任何正整数。

默认值：161061273600（150 GB）。

合并计划程序定期分析分区中部分的大小和数量，如果池中有足够的空闲资源，则启动后台合并。合并直到源部分的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

通过 [OPTIMIZE FINAL](../../sql-reference/statements/optimize.md) 发起的合并忽略 `max_bytes_to_merge_at_max_space_in_pool`（仅考虑可用的磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max-bytes-to-merge-at-min-space-in-pool}

在池中可用资源最少的情况下，可以合并为一个部分的最大总部分大小（以字节为单位）。

可能的值：

- 任何正整数。

默认值：1048576（1 MB）

`max_bytes_to_merge_at_min_space_in_pool` 定义尽管缺少可用磁盘空间（在池中），也可合并的部分的最大总大小。这是为了减少小部分的数量，以及发生 `Too many parts` 错误的几率。合并会将磁盘空间加倍总体合并部分的大小。因此，在可用磁盘空间较少的情况下，可能会出现已分配空间的情况，这部分空间已经被正在进行的大型合并占用，因此其他合并无法启动，并且每次插入时小部分数量会增加。
## merge_max_block_size {#merge-max-block-size}

从合并部分读取到内存中的行数。

可能的值：

- 任何正整数。

默认值：8192

合并从部分中按 `merge_max_block_size` 行读取，然后合并并将结果写入新部分。读取的块存放在 RAM 中，因此 `merge_max_block_size` 会影响合并所需的 RAM 大小。因此，对于具有非常宽行的表，合并可能会消耗大量 RAM（例如，如果平均行大小为 100kb，则在合并10个部分时，(100kb * 10 * 8192) ≈ 8GB 的 RAM）。通过减少 `merge_max_block_size`，可以降低合并所需的 RAM，但会减慢合并速度。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number-of-free-entries-in-pool-to-lower-max-size-of-merge}

当池中的空闲条目数量少于指定数量时（或复制队列），开始降低要处理的最大合并大小（或排队）。

这是为了允许小合并进行处理 - 不在池中填充长时间运行的合并。

可能的值：

- 任何正整数。

默认值：8
## number_of_free_entries_in_pool_to_execute_mutation {#number-of-free-entries-in-pool-to-execute-mutation}

当池中的空闲条目数量少于指定数量时，不执行部分变更。

这是为了为常规合并保留空闲线程，并避免出现 "Too many parts"。

可能的值：

- 任何正整数。

默认值：20

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 会抛出异常。
## max_part_loading_threads {#max-part-loading-threads}

启动时读取部分的最大线程数。

可能的值：

- 任何正整数。

默认值：自动（CPU 核心数量）。

在启动过程中，ClickHouse 读取所有表的所有部分（读取具有部分元数据的文件）以在内存中构建所有部分的列表。在某些部分数量很大的系统中，该过程可能需要很长时间，可以通过增加 `max_part_loading_threads`（如果该过程不受 CPU 和磁盘 I/O 限制）来缩短此时间。
```yaml
title: '设置选项'
sidebar_label: '设置选项'
keywords: ['ClickHouse', '设置', '选项']
description: '相应 ClickHouse 的设置选项，提供详细的选项说明和默认值。'
```

## max_partitions_to_read {#max-partitions-to-read}

限制可以在一个查询中访问的最大分区数量。

在创建表时指定的设置值可以通过查询级别的设置进行覆盖。

可能的值：

- 任何正整数。

默认值：-1（无限制）。

您还可以在查询/会话/配置文件级别指定查询复杂性设置 [max_partitions_to_read](query-complexity#max-partitions-to-read)。

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

如果范围内的每个部分都比 `min_age_to_force_merge_seconds` 的值旧，则合并部分。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（请参阅 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：

- 正整数。

默认值：0 — 禁用。

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

是否仅在整个分区上应用 `min_age_to_force_merge_seconds`，而不是在子集上。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（请参阅 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：

- true, false

默认值：false

## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应尊重设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：

- true, false

默认值：false

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

当池中空闲条目的数量少于指定数量时，不要在后台执行优化整个分区（此任务在设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成）。这是为了给常规合并留出空闲线程，避免“部分过多”。

可能的值：

- 正整数。

默认值：25

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应该小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 会抛出异常。

## allow_floating_point_partition_key {#allow_floating_point_partition_key}

允许将浮点数作为分区键。

可能的值：

- 0 — 不允许浮点分区键。
- 1 — 允许浮点分区键。

默认值：`0`。

## check_sample_column_is_correct {#check_sample_column_is_correct}

在创建表时启用检查，以确保用于采样的列的数据类型是正确的。数据类型必须是无符号的 [整数类型](../../sql-reference/data-types/int-uint.md)：`UInt8`, `UInt16`, `UInt32`, `UInt64`。

可能的值：

- true  — 启用检查。
- false — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在创建表时检查用于采样的列的数据类型。如果您已经有表的采样表达式不正确，并且不希望服务器在启动期间引发异常，可以将 `check_sample_column_is_correct` 设置为 `false`。

## min_bytes_to_rebalance_partition_over_jbod {#min-bytes-to-rebalance-partition-over-jbod}

设置在分发新大部分到卷磁盘 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 时启用平衡的最小字节数。

可能的值：

- 正整数。
- 0 — 禁用平衡。

默认值：`0`。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不得小于 [max_bytes_to_merge_at_max_space_in_pool](../../operations/settings/merge-tree-settings.md#max-bytes-to-merge-at-max-space-in-pool) / 1024 的值。否则，ClickHouse 会抛出异常。

## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

启用或禁用在合并或变更后，如果副本上的数据部分与其他副本上的数据部分不是字节相同，则分离数据部分。如果禁用，则删除数据部分。激活此设置以便以后分析这些部分。

该设置适用于启用了 [数据复制](../../engines/table-engines/mergetree-family/replication.md) 的 `MergeTree` 表。

可能的值：

- 0 — 删除部分。
- 1 — 分离部分。

默认值：`0`。

## merge_tree_clear_old_temporary_directories_interval_seconds {#setting-merge-tree-clear-old-temporary-directories-interval-seconds}

设置 ClickHouse 执行清理旧临时目录的间隔，以秒为单位。

可能的值：

- 任何正整数。

默认值：`60` 秒。

## merge_tree_clear_old_parts_interval_seconds {#setting-merge-tree-clear-old-parts-interval-seconds}

设置 ClickHouse 执行清理旧部分、WAL 和变更的间隔，以秒为单位。

可能的值：

- 任何正整数。

默认值：`1` 秒。

## max_concurrent_queries {#max-concurrent-queries}

与 MergeTree 表相关的最大并发执行查询数。查询仍会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：

- 正整数。
- 0 — 无限制。

默认值：`0`（无限制）。

**示例**

``` xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## min_marks_to_honor_max_concurrent_queries {#min-marks-to-honor-max-concurrent-queries}

应用 [max_concurrent_queries](#max-concurrent-queries) 设置所需的查询最小标记数量。请注意，查询仍会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：

- 正整数。
- 0 — 禁用（`max_concurrent_queries` 限制不应用于任何查询）。

默认值：`0`（限制从未应用）。

**示例**

``` xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

列中默认值数量与所有值数量的最小比例。设置此值会导致列使用稀疏序列化进行存储。

如果列是稀疏的（主要包含零），ClickHouse 可以以稀疏格式对其进行编码并自动优化计算 - 数据在查询期间不需要完全解压缩。要启用这种稀疏序列化，请将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果值大于或等于 1.0，则列将始终采用正常的全序列化进行写入。

可能的值：

- 在 0 和 1 之间的浮动值以启用稀疏序列化。
- 1.0（或更大）如果您不想使用稀疏序列化。

默认值：`0.9375`

**示例**

请注意，以下表中的 `s` 列在 95% 的行中为空字符串。在 `my_regular_table` 中我们不使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

```sql
CREATE TABLE my_regular_table
(
    `id` UInt64,
    `s` String
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO my_regular_table
SELECT
    number AS id,
    number % 20 = 0 ? toString(number): '' AS s
FROM
    numbers(10000000);


CREATE TABLE my_sparse_table
(
    `id` UInt64,
    `s` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS ratio_of_defaults_for_sparse_serialization = 0.95;

INSERT INTO my_sparse_table
SELECT
    number,
    number % 20 = 0 ? toString(number): ''
FROM
    numbers(10000000);
```

请注意，在 `my_sparse_table` 中的 `s` 列在磁盘上使用的存储空间更少：

```sql
SELECT table, name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns
WHERE table LIKE 'my_%_table';
```

```response
┌─table────────────┬─name─┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ my_regular_table │ id   │              37790741 │                75488328 │
│ my_regular_table │ s    │               2451377 │                12683106 │
│ my_sparse_table  │ id   │              37790741 │                75488328 │
│ my_sparse_table  │ s    │               2283454 │                 9855751 │
└──────────────────┴──────┴───────────────────────┴─────────────────────────┘
```

您可以通过查看 `system.parts_columns` 表的 `serialization_kind` 列来验证列是否使用稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

您可以看到 `s` 的哪些部分是使用稀疏序列化存储的：

```response
┌─column─┬─serialization_kind─┐
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
└────────┴────────────────────┘
```

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash}

如果列的文件名太长（超过 `max_file_name_length` 字节），则将其替换为 SipHash128。默认值：`false`。

## max_file_name_length {#max_file_name_length}

在不哈希的情况下保持为原样的文件名的最大长度。仅在启用设置 `replace_long_file_name_to_hash` 时生效。该设置的值不包括文件扩展名的长度。因此，建议将其设置低于最大文件名长度（通常为 255 字节），并留有一些余量以避免文件系统错误。默认值：127。

## allow_experimental_block_number_column {#allow_experimental_block_number_column}

在合并时保留虚拟列 `_block_number`。

默认值：false。

## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

如果启用，将在选择合并部分时使用估计的实际数据部分大小（即，不包括通过 `DELETE FROM` 删除的行）。请注意，此行为仅对受在启用此设置后执行的 `DELETE FROM` 影响的数据部分触发。

可能的值：

- true, false

默认值：false

**另见**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 设置

## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起启用，则在表启动期间将计算现有数据部分的已删除行计数。请注意，可能会导致启动表加载变慢。

可能的值：

- true, false

默认值：false

**另见**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

启用变体数据类型中判别器的二进制序列化紧凑模式。
此模式允许在大多数为一个变体或大量 NULL 值的部分中显著减少存储判别器所需的内存。

默认值：true

## merge_workload {#merge_workload}

用于调节资源在合并和其他工作负载之间的利用和共享。指定的值用作此表的后台合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

默认值：空字符串

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

## mutation_workload {#mutation_workload}

用于调节资源在变更和其他工作负载之间的利用和共享。指定的值用作此表的后台变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

默认值：空字符串

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

### optimize_row_order {#optimize_row_order}

控制在插入期间是否应优化行顺序，以提高新插入表部分的压缩性。

仅对普通 MergeTree 引擎表有效。对专业化的 MergeTree 引擎表（例如 CollapsingMergeTree）无效。

MergeTree 表可以选择使用 [压缩编解码器](../../sql-reference/statements/create/table.md#column_compression_codec) 进行压缩。
通用压缩编解码器，如 LZ4 和 ZSTD 在数据暴露出模式时能够实现最大压缩率。
长时间重复相同值的行通常压缩效果很好。

如果启用此设置，ClickHouse 尝试将新插入部分中的数据存储为行顺序，以最小化新表部分各列中相同值序列的数量。
换句话说，较少且较长的相同值序列意味着各个序列很长并且压缩效果好。

寻找最佳行顺序在计算上是不可行的（NP 难问题）。
因此，ClickHouse 使用启发式方法快速找到行顺序，该顺序仍然比原始行顺序提高压缩率。

<details markdown="1">

<summary>寻找行顺序的启发式方法</summary>

通常可以自由地重排表（或表部分）的行，因为 SQL 将在不同的行顺序中视为相同的表（表部分）等价。

当为表定义主键时，这种重排行的自由度受到限制。
在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制要求按列 `C1`, `C2`, ... `Cn` 排序表行（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
因此，行只能在行的“等价类”内重排，即在主键列中具有相同值的行。
直觉上，具有高基数的主键，例如涉及 `DateTime64` 时间戳列的主键，会导致许多小等价类。
同样，具有低基数主键的表会创建少而大型等价类。
没有主键的表表示所有行跨越的单一等价类的极端情况。

等价类越少且越大，重新安排行时的自由度就越高。

在每个等价类中寻找最佳行顺序的启发式方法是 D. Lemire, O. Kaser 在 [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) 中提出的，它基于按非主键列的升序基数对每个等价类中的行进行排序。
它执行三个步骤：
1. 根据主键列中的行值查找所有等价类。
2. 对于每个等价类，计算（通常是估计）非主键列的基数。
3. 对于每个等价类，按升序的非主键列基数对行进行排序。

</details>

如果启用，插入操作将产生额外的 CPU 成本，以分析和优化新数据的行顺序。
根据数据特征，INSERT 操作预计会延长 30-50% 的时间。
LZ4 或 ZSTD 的压缩率平均提高 20-40%。

该设置最好适用于没有主键或低基数主键的表，即仅具有少量不同主键值的表。
高基数主键，例如涉及 `DateTime64` 类型的时间戳列，预计不会从此设置中受益。

## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode}

默认情况下，轻量级删除 `DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。因此，默认值将是 `throw`。
然而，此选项可以改变行为。通过将值设置为 `drop` 或 `rebuild`，删除将适用于投影。`drop` 将删除投影，因此在当前查询中可能很快，因为投影被删除，但在未来的查询中可能较慢，因为没有附加的投影。
`rebuild` 将重建投影，这可能会影响当前查询的性能，但可能会加快未来查询的速度。一个好处是这些选项仅在部分级别工作，这意味着未触及的部分中的投影将保持完整，而不会触发任何操作，例如删除或重建。

可能的值：

- throw, drop, rebuild

默认值：throw

## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

是否允许为非经典的 MergeTree 创建投影，即不是 (Replicated, Shared) MergeTree。忽略选项完全是为了兼容性，可能会导致不正确的答案。否则，如果允许，合并投影时的操作是什么，要么删除，要么重建。因此，经典 MergeTree 将忽略此设置。
它也控制 `OPTIMIZE DEDUPLICATE`，但对所有 MergeTree 家族成员都有影响。类似于选项 `lightweight_mutation_projection_mode`，它也是部分级别。

可能的值：

- ignore, throw, drop, rebuild

默认值：throw

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

在插入数据时，磁盘空间中应保持的最小自由字节数。如果可用的自由字节数少于 `min_free_disk_bytes_to_perform_insert`，则抛出异常并且不执行插入。请注意，此设置：
- 考虑 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定的字节数为正（非零）时检查。

可能的值：

- 任何正整数。

默认值：0 字节。

注意，如果同时指定 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，ClickHouse 将根据允许在更大自由内存量上执行插入的值进行计算。

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

执行 `INSERT` 所需的最小自由与总磁盘空间比例。必须是介于 0 和 1 之间的浮动值。请注意，此设置：
- 考虑 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定了正（非零）比例时检查。

可能的值：

- 浮动值，0.0 - 1.0

默认值：0.0

注意，如果同时指定 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`，ClickHouse 将根据允许在更大自由内存量上执行插入的值进行计算。

## allow_experimental_reverse_key {#allow_experimental_reverse_key}

启用对 MergeTree 排序键的降序排序支持。此设置对时间序列分析和 Top-N 查询特别有用，允许将数据按反时间顺序存储以优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得可以使用更高效的 `ReadInOrder` 优化，而不是针对降序查询的 `ReadInReverseOrder`。

**示例**

```sql
CREATE TABLE example
(
    time DateTime,
    key Int32,
    value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- 'time' 字段的降序
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

通过在查询中使用 `ORDER BY time DESC`，应用了 `ReadInOrder`。

**默认值：** false

## cache_populated_by_fetch {#cache_populated_by_fetch}

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 禁用（默认设置）时，仅当运行需要这些部分的查询时，新的数据部分才会加载到缓存中。

如果启用，则 `cache_populated_by_fetch` 会导致所有节点无需查询即可从存储加载新的数据部分到缓存中。

默认值：false

**另见**

- [ignore_cold_parts_seconds](settings.md/#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](settings.md/#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](settings.md/#cache_warmer_threads)

## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

如果为 true，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，仅允许有效值（`1` 和 `-1`）。

默认值：false

## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

启用后，将为表的所有数值列添加最小-最大（跳过）索引。

默认值：false。

## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

启用后，将为表的所有字符串列添加最小-最大（跳过）索引。

默认值：false。

## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

启用后，合并构建并存储新部分的跳过索引。

默认值：true

## assign_part_uuids {#assign_part_uuids}

启用后，将为每个新部分分配唯一的部分标识符。在启用之前，请检查所有副本是否支持 UUID 版本 4。

默认值：0。

