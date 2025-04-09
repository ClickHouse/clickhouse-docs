---
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表设置'
description: '用于 `system.merge_tree_settings` 中的 MergeTree 设置'
---

系统表 `system.merge_tree_settings` 显示全局设置的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中设置，也可以在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

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

索引标记之间的数据行的最大数目。

默认值：8192。
## index_granularity_bytes {#index_granularity_bytes}

数据粒度的最大大小（以字节为单位）。

默认值：10485760（约 10 MiB）。

若要仅通过行数限制粒度大小，请设置为 0（不推荐）。
## min_index_granularity_bytes {#min_index_granularity_bytes}

允许的数据粒度的最小大小（以字节为单位）。

默认值：1024b。

提供一个保护措施，以防意外创建具有非常低的 index_granularity_bytes 的表。
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

启用或禁用转换，以使用 `index_granularity_bytes` 设置控制粒度大小。在 19.11 版本之前，只有 `index_granularity` 设置用于限制粒度大小。`index_granularity_bytes` 设置在从大行（几十和几百兆字节）表中选择数据时提高了 ClickHouse 性能。如果您有大行表，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

在 ZooKeeper 中存储数据部分头的方法。如果启用，ZooKeeper 将存储更少的数据。有关详细信息，请参见 [这里](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

合并操作所需的最小数据量，以使用对存储磁盘的直接 I/O 访问。
在合并数据部分时，ClickHouse 计算要合并的所有数据的总存储量。
如果总量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 将使用直接 I/O 接口（`O_DIRECT` 选项）读取和写入数据。
如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。

默认值：`10 * 1024 * 1024 * 1024` 字节。
## ttl_only_drop_parts {#ttl_only_drop_parts}

控制 MergeTree 表中是否在相应的 `TTL` 设置下，该部分的所有行都过期时完全删除数据部分。

当 `ttl_only_drop_parts` 禁用（默认情况下），仅删除根据其 TTL 设置过期的行。

当 `ttl_only_drop_parts` 启用时，如果该部分中的所有行都根据其 `TTL` 设置过期，则整个部分将被删除。

默认值：0。
## merge_with_ttl_timeout {#merge_with_ttl_timeout}

重复与删除 TTL 合并的最低延迟（以秒为单位）。

默认值：`14400` 秒（4 小时）。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout}

重复与重新压缩 TTL 合并的最低延迟（以秒为单位）。

默认值：`14400` 秒（4 小时）。
## write_final_mark {#write_final_mark}

启用或禁用在数据部分末尾（最后一个字节之后）写入最终索引标记。

默认值：1。

不要更改，否则会发生严重问题。
## storage_policy {#storage_policy}

存储策略。
## min_bytes_for_wide_part {#min_bytes_for_wide_part}

可以以 `Wide` 格式存储的数据部分的最小字节/行数。
您可以设置这些设置中的一个、两个或都不设置。
## max_compress_block_size {#max_compress_block_size}

压缩到表中之前未压缩数据块的最大大小。
您还可以在全局设置中指定此设置（请参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。
在创建表时指定的值将覆盖该设置的全局值。
## min_compress_block_size {#min_compress_block_size}

写入下一个标记时所需的未压缩数据块的最小大小。
您还可以在全局设置中指定此设置（请参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。
在创建表时指定的值将覆盖该设置的全局值。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

在再次尝试选择合并的部分之前等待的最长时间。如果没有选择部分，则较低的设置将在 `background_schedule_pool` 中经常触发选择任务，这导致在大规模集群中对 ZooKeeper 发出大量请求。

默认值：`60000`
## max_suspicious_broken_parts {#max_suspicious_broken_parts}

如果单个分区中损坏部分的数量超过 `max_suspicious_broken_parts` 值，则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：100。
## parts_to_throw_insert {#parts-to-throw-insert}

如果单个分区中活跃部分的数量超过 `parts_to_throw_insert` 值，`INSERT` 将因 `Too many parts (N). Merges are processing significantly slower than inserts` 异常而中断。

可能的值：

- 任何正整数。

默认值：3000。

为了实现 `SELECT` 查询的最大性能，有必要尽量减少处理的部分数量，请参见 [Merge Tree](../../development/architecture.md#merge-tree)。

在 23.6 之前，此设置为 300。您可以设置一个更高的不同值，它将降低 `Too many parts` 错误的概率，但同时 `SELECT` 性能可能下降。此外，在合并问题（例如，由于磁盘空间不足）情况下，您会比使用原始的 300 更晚注意到。
## parts_to_delay_insert {#parts-to-delay-insert}

如果单个分区中活跃部分的数量超过 `parts_to_delay_insert` 值，则 `INSERT` 人为地减缓。

可能的值：

- 任何正整数。

默认值：1000。

ClickHouse 人为地执行 `INSERT` 更长时间（添加“睡眠”），以便背景合并过程能比添加部分更快地合并部分。
## inactive_parts_to_throw_insert {#inactive-parts-to-throw-insert}

如果单个分区中非活动部分的数量超过 `inactive_parts_to_throw_insert` 值，`INSERT` 将因 “Too many inactive parts (N). Parts cleaning are processing significantly slower than inserts” 异常而中断。

可能的值：

- 任何正整数。

默认值：0（无限制）。
## inactive_parts_to_delay_insert {#inactive-parts-to-delay-insert}

如果单个分区中表的非活动部分数量至少达到 `inactive_parts_to_delay_insert` 值，则 `INSERT` 将人为地减缓。当服务器无法快速清理部分时很有用。

可能的值：

- 任何正整数。

默认值：0（无限制）。
## max_delay_to_insert {#max-delay-to-insert}

在单个分区中活跃部分数量超过 [parts_to_delay_insert](#parts-to-delay-insert) 值时，用于计算 `INSERT` 延迟的秒数。

可能的值：

- 任何正整数。

默认值：1。

`INSERT` 的延迟（以毫秒为单位）通过公式计算：
```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果一个分区有 299 个活跃部分，parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，则 `INSERT` 延迟为 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

自 23.1 版本开始，公式已更改为：
```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000) * parts_over_threshold / allowed_parts_over_threshold)
```
例如，如果一个分区有 224 个活跃部分，parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，min_delay_to_insert_ms = 10，则 `INSERT` 延迟为 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_parts_in_total {#max-parts-in-total}

如果表的所有分区中活跃部分的总数量超过 `max_parts_in_total` 值，`INSERT` 将因 `Too many parts (N)` 异常而中断。

可能的值：

- 任何正整数。

默认值：100000。

表中过多的部分会降低 ClickHouse 查询的性能并增加 ClickHouse 启动时间。通常这源于设计不当（选择分区策略时的错误 - 分区过小）。
## simultaneous_parts_removal_limit {#simultaneous-parts-removal-limit}

如果有许多过时部分，清理线程将在一次迭代中尝试删除最多 `simultaneous_parts_removal_limit` 个部分。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。

默认值：0。
## replicated_deduplication_window {#replicated_deduplication-window}

ClickHouse Keeper 存储的最近插入的块的数量，用于检查重复项的哈希和。

可能的值：

- 任何正整数。
- 0（禁用去重）

默认值：1000。

`Insert` 命令创建一个或多个块（部分）。对于 [insert deduplication](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将创建部分的哈希和写入 ClickHouse Keeper。哈希和仅存储最近的 `replicated_deduplication_window` 块。最旧的哈希和会从 ClickHouse Keeper 中移除。
大量的 `replicated_deduplication_window` 会降低 `Inserts` 的速度，因为它需要比较更多的条目。
哈希和是通过字段名称、类型以及插入部分的数据（字节流）计算得出的。
## non_replicated_deduplication_window {#non-replicated-deduplication-window}

在非复制 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中最近插入的块的数量，用于存储哈希和以检查重复项。

可能的值：

- 任何正整数。
- 0（禁用去重）。

默认值：0。

使用的去重机制类似于复制表（请参见 [replicated_deduplication_window](#replicated-deduplication-window) 设置）。创建部分的哈希和被写入到磁盘的本地文件中。
## replicated_deduplication_window_seconds {#replicated_deduplication-window-seconds}

在此时间段后，从 ClickHouse Keeper 中移除插入块的哈希和的秒数。

可能的值：

- 任何正整数。

默认值：604800（1 周）。

类似于 [replicated_deduplication_window](#replicated-deduplication-window)，`replicated_deduplication_window_seconds` 指定了用于插入去重存储哈希和的时间长度。超过 `replicated_deduplication_window_seconds` 的哈希和将从 ClickHouse Keeper 中移除，即使它们少于 `replicated_deduplication_window`。

时间是相对于最近记录的时间，而不是墙时。如果仅有一条记录，则将永远存储。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication-window-for-async-inserts}

最近异步插入的块的数量，ClickHouse Keeper 存储哈希和以检查重复项。

可能的值：

- 任何正整数。
- 0（禁用异步插入去重）

默认值：10000。

[Async Insert](/operations/settings/settings#async_insert) 命令将在一个或多个块（部分）中缓存。对于 [insert deduplication](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将每个插入的哈希和写入 ClickHouse Keeper。哈希和仅存储最近的 `replicated_deduplication_window_for_async_inserts` 块。最旧的哈希和会从 ClickHouse Keeper 中移除。
大量的 `replicated_deduplication_window_for_async_inserts` 会降低 `Async Inserts` 的速度，因为它需要比较更多的条目。
哈希和是通过字段名称、类型及插入数据（字节流）计算得出的。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication-window-seconds-for-async-inserts}

在此时间段后，从 ClickHouse Keeper 中移除异步插入的哈希和的秒数。

可能的值：

- 任何正整数。

默认值：604800（1 周）。

类似于 [replicated_deduplication_window_for_async_inserts](#replicated-deduplication-window-for-async-inserts)，`replicated_deduplication_window_seconds_for_async_inserts` 指定了用于异步插入去重存储哈希和的时间长度。超过 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希和将从 ClickHouse Keeper 中移除，即使它们少于 `replicated_deduplication_window_for_async_inserts`。

时间是相对于最近记录的时间，而不是墙时。如果仅有一条记录，则将永远存储。
## use_async_block_ids_cache {#use-async-block-ids-cache}

如果为真，我们缓存异步插入的哈希和。

可能的值：

- true, false

默认值：false。

带有多个异步插入的块将生成多个哈希和。当某些插入重复时，keeper 将只在一次 RPC 中返回一个重复的哈希和，这将造成不必要的 RPC 重试。此缓存将监视 Keeper 中的哈希和路径。如果在 Keeper 中监视到更新，缓存将在尽可能快的时间内更新，以便能够在内存中过滤重复插入。
## async_block_ids_cache_min_update_interval_ms {#async_block_ids_cache_min_update_interval_ms}

更新 `use_async_block_ids_cache` 的最小间隔（以毫秒为单位）

可能的值：

- 任何正整数。

默认值：100。

通常，`use_async_block_ids_cache` 在监视的 keeper 路径中发生更新时立即更新。然而，缓存更新可能过于频繁，从而造成沉重负担。该最小间隔防止缓存更新得过快。请注意，如果我们将此值设置得过长，则重复插入的块将有更长的重试时间。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

如果有非活动副本，ClickHouse Keeper 日志中可以保留多少条记录。当此数量超过时，非活动副本将变为丢失状态。

可能的值：

- 任何正整数。

默认值：1000
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep}

在 ZooKeeper 日志中，即使过时，也要保留大约这个数量的最后记录。它不会影响表的工作：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：

- 任何正整数。

默认值：10
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建以来的时间超过此阈值，并且部分的大小总和大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本提取合并的部分，而不是在本地合并。这是为了加快非常长的合并。

可能的值：

- 任何正整数。

默认值：3600
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

如果部分的大小总和超过此阈值，并且自复制日志条目创建以来的时间大于 `prefer_fetch_merged_part_time_threshold`，则优先从副本提取合并的部分，而不是在本地合并。这是为了加快非常长的合并。

可能的值：

- 任何正整数。

默认值：10,737,418,240
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

当此设置的值大于零时，只有单个副本会立即开始合并，而其他副本会等待长达该时间的时间，以下载结果，而不是在本地合并。如果所选副本在该时间内未完成合并，则会回退到标准行为。

可能的值：

- 任何正整数。

默认值：0（秒）
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

当此设置的值大于零时，仅当合并的部分在共享存储上，并且启用了 `allow_remote_fs_zero_copy_replication` 时，单个副本会立即开始合并。

:::note Zero-copy replication is not ready for production
在 ClickHouse 版本 22.8 及更高版本中，默认情况下禁用零拷贝复制。 不建议在生产中使用此功能。
:::

可能的值：

- 任何正整数。

默认值：

10800
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

在启动重新压缩合并之前的超时时间（以秒为单位）。在此期间，ClickHouse 尝试从分配此合并的副本中获取重新压缩的部分。

重新压缩在大多数情况下速度较慢，因此我们不会在此超时之前启动重新压缩合并，而是尝试从被分配此重新压缩的副本中获取重新压缩的部分。

可能的值：

- 任何正整数。

默认值：7200
## always_fetch_merged_part {#always_fetch_merged_part}

如果为真，则此副本永远不合并部分，而是始终从其他副本下载合并的部分。

可能的值：

- true, false

默认值：false
## max_suspicious_broken_parts {#max_suspicious_broken_parts-1}

最大损坏部分，如果超过则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：100
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}


最大所有损坏部分的大小，如果超过则拒绝自动删除。

可能的值：

- 任何正整数。

默认值：1,073,741,824
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

如果用于修改（删除、添加）的文件数量超过此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：75
## max_files_to_remove_in_alter_columns {#max_files_to-remove-in-alter-columns}

如果要删除的文件数量超过此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：50
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts}

如果损坏部分与总部分的比例小于此值，则允许启动。

可能的值：

- 浮点数，0.0 - 1.0

默认值：0.5
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host}

限制来自端点的并行获取（实际池大小）。

可能的值：

- 任何正整数。

默认值：15
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout-1}

部分获取请求的 HTTP 连接超时。如果未显式设置，继承自默认配置文件 `http_connection_timeout`。

可能的值：

- 任何正整数。

默认值：如果未显式设置，则继承自默认配置文件 `http_connection_timeout`。
## replicated_can_become_leader {#replicated_can_become_leader}

如果为真，则此节点上的复制表副本将尝试获取领导权限。

可能的值：

- true, false

默认值：true
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

ZooKeeper 会话过期检查周期，以秒为单位。

可能的值：

- 任何正整数。

默认值：60
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

在修复失去的副本时，不要删除旧的本地部分。

可能的值：

- true, false

默认值：true
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

部分获取请求的 HTTP 连接超时（以秒为单位）。如果未显式设置，继承自默认配置文件 [http_connection_timeout](./settings.md#http_connection_timeout)。

可能的值：

- 任何正整数。
- 0 - 使用 `http_connection_timeout` 的值。

默认值：0。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

部分获取请求的 HTTP 发送超时（以秒为单位）。如果未显式设置，继承自默认配置文件 [http_send_timeout](./settings.md#http_send_timeout)。

可能的值：

- 任何正整数。
- 0 - 使用 `http_send_timeout` 的值。

默认值：0。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

获取部分请求的 HTTP 接收超时（以秒为单位）。如果未显式设置，继承自默认配置文件 [http_receive_timeout](./settings.md#http_receive_timeout)。

可能的值：

- 任何正整数。
- 0 - 使用 `http_receive_timeout` 的值。

默认值：0。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

限制用于 [replicated](../../engines/table-engines/mergetree-family/replication.md) 获取的数据交换最大速度（以字节每秒为单位）。此设置适用于特定表，而不是 [max_replicated_fetches_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置，该设置适用于服务器。

您可以限制服务器网络和特定表的网络，但为此，表级设置的值应小于服务器级设置的值。否则，服务器只考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置的遵循并不完全准确。

可能的值：

- 正整数。
- 0 — 无限制。

默认值：`0`。

**用法**

可用于在复制数据以添加或替换新节点时限速。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

限制用于 [replicated](../../engines/table-engines/mergetree-family/replication.md) 发送的数据交换最大速度（以字节每秒为单位）。此设置适用于特定表，而不是 [max_replicated_sends_network_bandwidth_for_server](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置，该设置适用于服务器。

您可以限制服务器网络和特定表的网络，但为此，表级设置的值应小于服务器级设置的值。否则，服务器只考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置的遵循并不完全准确。

可能的值：

- 正整数。
- 0 — 无限制。

默认值：`0`。

**用法**

可用于在复制数据以添加或替换新节点时限速。
## old_parts_lifetime {#old-parts-lifetime}

存储非活动部分以保护数据免于在自发服务器重启期间丢失的时间（以秒为单位）。

可能的值：

- 任何正整数。

默认值：480。

在将多个部分合并为新部分后，ClickHouse 将原始部分标记为非活动，只有在经过 `old_parts_lifetime` 秒后才会删除。
如果当前查询未使用非活动部分，即 `refcount` 为 1，则将删除非活动部分。

`fsync` 并不针对新部分调用，因此在某些时候，新部分仅存在于服务器的 RAM（操作系统缓存）中。如果服务器自发重启，新部分可能会丢失或损坏。
为了保护数据，非活动部分不会立即被删除。

在启动过程中，ClickHouse 检查部分的完整性。
如果合并后的部分损坏，ClickHouse 会将非活动部分恢复到活动列表中，然后再次合并它们。然后，损坏的部分将被重命名（添加前缀 `broken_`）并移动到 `detached` 文件夹。
如果合并后的部分没有损坏，则会将原始非活动部分重命名（添加前缀 `ignored_`）并移动到 `detached` 文件夹。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（写入的数据仅存储在 RAM 中的最长时间），但在磁盘系统负载较重的情况下，数据可能会写入得更晚。实验上，选择了 480 秒作为 `old_parts_lifetime`，在此期间保证新部分能够写入磁盘。
## max_bytes_to_merge_at_max_space_in_pool {#max-bytes-to-merge-at-max-space-in-pool}

如果资源足够，可以合并为一个部分的最大总大小（以字节为单位）。
大致对应于通过自动后台合并创建的最大可能部分大小。

可能的值：

- 任何正整数。

默认值：161061273600（150 GB）。

合并调度程序定期分析分区中部分的大小和数量，如果池中有足够的可用资源，它将启动后台合并。
合并发生，直到源部分的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

通过 [OPTIMIZE FINAL](../../sql-reference/statements/optimize.md) 启动的合并忽略 `max_bytes_to_merge_at_max_space_in_pool`（仅考虑可用磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max-bytes-to-merge-at-min-space-in-pool}

在后台池中可用资源最少时，合并为一个部分的最大总大小（以字节为单位）。

可能的值：

- 任何正整数。

默认值：1048576（1 MB）

`max_bytes_to_merge_at_min_space_in_pool` 定义了尽管缺少可用磁盘空间（在池中），仍可合并的部分的最大总大小。这是为了减少小部分的数量及 `Too many parts` 错误的机会。
合并占用磁盘空间，双倍总合并部分的大小。因此，在可用磁盘空间很小的情况下，可能会出现这样一种情况，即有空闲空间，但该空间已被正在进行的大规模合并预定，因此其他合并无法启动，且每次插入的小部分数量不断增加。
## merge_max_block_size {#merge-max-block-size}

从合并部分读取到内存的行数。

可能的值：

- 任何正整数。

默认值：8192

合并从每个部分读取的行数以 `merge_max_block_size` 为块，然后合并并将结果写入新部分。读取块放置在 RAM 中，因此 `merge_max_block_size` 会影响合并所需的 RAM 大小。因此，对于宽行表，合并可能消耗大量 RAM（如果平均行大小为 100kb，则在合并 10 个部分时，(100kb * 10 * 8192) = ~ 8GB 的 RAM）。通过减少 `merge_max_block_size`，可以减少合并所需的 RAM，但会减慢合并速度。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number-of-free-entries-in-pool-to-lower-max-size-of-merge}

当池中（或复制队列）可用条目的数量少于指定数量时，开始降低要处理的最大合并大小（或排队的最大合并大小）。
这是为了允许小合并进行 - 不填满池长时间运行的合并。

可能的值：

- 任何正整数。

默认值：8
## number_of_free_entries_in_pool_to_execute_mutation {#number-of-free-entries-in-pool-to-execute-mutation}

当池中可用条目的数量少于指定数量时，不执行部分变更。
这是为了为常规合并留出空闲线程，避免 “Too many parts”。

可能的值：

- 任何正整数。

默认值：20

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 将抛出异常。
## max_part_loading_threads {#max-part-loading-threads}

在 ClickHouse 启动时读取部分的最大线程数。

可能的值：

- 任何正整数。

默认值：auto（CPU 核心数）。

在启动时，ClickHouse 读取所有表的所有部分（读取部分的元数据信息文件），以便在内存中构建所有部分的列表。在某些系统中，大量部分的这一过程可能会耗时较长，可以通过增加 `max_part_loading_threads` 来缩短时间（如果此过程不是 CPU 和磁盘 I/O 限定的）。

## max_partitions_to_read {#max-partitions-to-read}

限制一个查询中可以访问的最大分区数量。

在创建表时指定的设定值可以通过查询级别的设置进行覆盖。

可能的值：

- 任何正整数。

默认值：-1（无限制）。

您还可以在查询/会话/配置文件级别指定查询复杂度设置 [max_partitions_to_read](query-complexity#max-partitions-to-read)。
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

如果范围内的每个部分都比 `min_age_to_force_merge_seconds` 的值要旧，则合并部分。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool` （参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：

- 正整数。

默认值：0 — 禁用。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

是否仅应对整个分区应用 `min_age_to_force_merge_seconds`，而不是对子集应用。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool` （参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：

- true，false

默认值：false
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应该遵循设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：

- true，false

默认值：false
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

当池中可用的空闲条目少于指定数量时，不在后台执行优化整个分区的操作（当设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成的此任务）。这是为了给常规合并留出空闲线程，避免出现“分区太多”。

可能的值：

- 正整数。

默认值：25

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse会抛出异常。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge}

在将分区合并为单个部分时，是否使用 CLEANUP 合并用于 ReplacingMergeTree。在启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 的情况下需要执行。

可能的值：

- true，false

默认值：false
## allow_floating_point_partition_key {#allow_floating_point_partition_key}

启用允许浮点数作为分区键。

可能的值：

- 0 — 不允许浮点分区键。
- 1 — 允许浮点分区键。

默认值：`0`。
## check_sample_column_is_correct {#check_sample_column_is_correct}

在创建表时启用检查，以确保用于采样的列的数据类型正确。数据类型必须是无符号的 [整数类型](../../sql-reference/data-types/int-uint.md)： `UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：

- true  — 检查已启用。
- false — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse服务器在创建表时检查用于采样的列的数据类型。如果您已经有具有不正确采样表达式的表，并且不希望服务器在启动期间引发异常，则将 `check_sample_column_is_correct` 设置为 `false`。
## min_bytes_to_rebalance_partition_over_jbod {#min-bytes-to-rebalance-partition-over-jbod}

设置在将新大型部分分配到卷磁盘 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 时启用平衡的最小字节数。

可能的值：

- 正整数。
- 0 — 禁用平衡。

默认值：`0`。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不应小于 [max_bytes_to_merge_at_max_space_in_pool](../../operations/settings/merge-tree-settings.md#max-bytes-to-merge-at-max-space-in-pool) / 1024 的值。否则，ClickHouse会抛出异常。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

启用或禁用在合并或变更后，如果副本上的数据部分与其他副本上的数据部分不完全相同，则将其分离。如果禁用，数据部分将被移除。如果您希望稍后分析这些部分，请激活此设置。

此设置适用于启用了 [数据复制](../../engines/table-engines/mergetree-family/replication.md) 的 `MergeTree` 表。

可能的值：

- 0 — 部分被移除。
- 1 — 部分被分离。

默认值：`0`。
## merge_tree_clear_old_temporary_directories_interval_seconds {#setting-merge-tree-clear-old-temporary-directories-interval-seconds}

设置ClickHouse执行清理旧临时目录的时间间隔（以秒为单位）。

可能的值：

- 任何正整数。

默认值：`60` 秒。
## merge_tree_clear_old_parts_interval_seconds {#setting-merge-tree-clear-old-parts-interval-seconds}

设置ClickHouse执行清理旧部分、WAL和变更的时间间隔（以秒为单位）。

可能的值：

- 任何正整数。

默认值：`1` 秒。
## max_concurrent_queries {#max-concurrent-queries}

与MergeTree表相关的同时执行的查询的最大数量。查询仍会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：

- 正整数。
- 0 — 无限制。

默认值：`0`（没有限制）。

**示例**

``` xml
<max_concurrent_queries>50</max_concurrent_queries>
```
## min_marks_to_honor_max_concurrent_queries {#min-marks-to-honor-max-concurrent-queries}

应用 [max_concurrent_queries](#max-concurrent-queries) 设置所需的查询读取的最小标记数量。请注意，查询仍会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：

- 正整数。
- 0 — 禁用（`max_concurrent_queries`的限制适用于无查询）。

默认值：`0`（限制永不应用）。

**示例**

``` xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

列中 _default_ 值与 _all_ 值的最小比例。设置此值会导致列使用稀疏序列化存储。

如果列是稀疏的（主要包含零），ClickHouse 可以以稀疏格式对其进行编码并自动优化计算 - 数据在查询时不需要完全解压。要启用此稀疏序列化，定义 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果值大于或等于 1.0，则列将始终使用正常的完整序列化进行写入。

可能的值：

- 0 到 1 之间的浮动值以启用稀疏序列化
- 1.0（或更大）如果您不希望使用稀疏序列化

默认值：`0.9375`

**示例**

注意下面表格中的 `s` 列在 95% 的行中是空字符串。在 `my_regular_table` 中，我们不使用稀疏序列化，而在 `my_sparse_table` 中，我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

注意 `my_sparse_table` 中的 `s` 列在磁盘上使用了更少的存储空间：

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
如果列的文件名过长（超过 `max_file_name_length` 字节），则将其替换为 SipHash128。默认值：`false`。
## max_file_name_length {#max_file_name_length}

保持文件名为原样而不进行哈希的最大长度。仅在启用设置 `replace_long_file_name_to_hash` 时生效。此设置的值不包括文件扩展名的长度。因此，建议将其设置为低于最大文件名长度（通常为 255 字节）且有一定间隔，以避免文件系统错误。默认值：127。
## allow_experimental_block_number_column {#allow_experimental_block_number_column}

在合并时持久化虚拟列 `_block_number`。

默认值：false。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

如果启用，选择合并部分时将使用估计的实际数据部分大小（即，不包括通过 `DELETE FROM` 删除的行）。请注意，此行为仅在启用此设置后执行的 `DELETE FROM` 影响的数据部分中触发。

可能的值：

- true，false

默认值：false

**另请参见**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 设置
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

如果在启用 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 的同时启用，则在表开始时将计算现有数据部分的已删除行数。请注意，这可能会降低表启动时的加载速度。

可能的值：

- true，false

默认值：false

**另请参见**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

启用对于变体数据类型的指标的紧凑模式进行二进制序列化。
此模式可以在主要只有一个变体或大量 NULL 值时显著减少存储指标的内存。

默认值：true
## merge_workload {#merge_workload}

用于调节资源在合并和其他工作负载之间的利用和共享。指定的值用于此表的后台合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

默认值：空字符串

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## mutation_workload {#mutation_workload}

用于调节资源在变更和其他工作负载之间的利用和共享。指定的值用于此表的后台变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

默认值：空字符串

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
### optimize_row_order {#optimize_row_order}

控制在插入时是否应优化行顺序以提高新插入表部分的可压缩性。

仅对普通的 MergeTree 引擎表有效。对专用的 MergeTree 引擎表（例如 CollapsingMergeTree）无效。

MergeTree 表通过 [压缩编解码器](../../sql-reference/statements/create/table.md#column_compression_codec)（可选）进行压缩。
通用的压缩编解码器如 LZ4 和 ZSTD 如果数据暴露模式时，会达到最大压缩率。
相同值的连续序列通常压缩得很好。

如果启用此设置，ClickHouse 会尝试以最小化新插入表部分跨列的相同值连续序列的方式存储新数据。
换句话说，相同值的连续序列越少，个别序列越长，压缩效果越好。

查找最佳行顺序在计算上是不可行的（NP 难）。
因此，ClickHouse 使用启发式方法快速查找一个行顺序，这仍然改善了原始行顺序的压缩率。

<details markdown="1">

<summary>查找行顺序的启发式方法</summary>

一般来说，可以自由地对表（或表部分）进行行的洗牌，因为 SQL 将同一表（表部分）视为等价于不同的行顺序。

当为表定义主键时，对行洗牌的自由度会受到限制。
在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制表行按照列 `C1`，`C2`，... `Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
因此，行只能在行的“等价类”中进行洗牌，即主键列中具有相同值的行。
直观地说，高基数的主键，例如涉及 `DateTime64` 时间戳列的主键，将导致许多小的等价类。
同样，低基数的主键创建了少而大的等价类。
没有主键的表代表了一个跨所有行的单个等价类的极端情况。

等价类越少越大，重新洗牌的自由度越高。

用于寻找每个等价类内最佳行顺序的启发式建议来自 D. Lemire 和 O. Kaser 在 [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) 中的研究，并基于对每个等价类中非主键列的行按升序基数进行排序。
它执行三个步骤：
1. 基于主键列中的行值查找所有等价类。
2. 对于每个等价类，计算（通常是估算）非主键列的基数。
3. 对于每个等价类，按非主键列基数的升序对行进行排序。

</details>

如果启用，插入操作会增加额外的 CPU 成本来分析和优化新数据的行顺序。
插入预计将比正常情况需多花费 30-50% 的时间，具体取决于数据特征。
LZ4 或 ZSTD 的压缩率平均提高 20-40%。

此设置最适合没有主键或低基数主键的表，即只有少数不同主键值的表。
高基数主键，例如涉及 `DateTime64` 类型的时间戳列，预计不会从此设置中受益。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode}

默认情况下，轻量级删除 `DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。因此，默认值将是 `throw`。
但是，此选项可以改变该行为。使用 `drop` 或 `rebuild` 的值时，删除将适用于投影。`drop` 会删除投影，因此在当前查询中可能很快，因为投影被删除，但在未来的查询中可能较慢，因为没有附加投影。
`rebuild` 会重建投影，这可能会影响当前查询的性能，但可能提高未来查询的性能。好处是这些选项仅在部分级别工作，这意味着未被触及的部分中的投影将保持不变，而不会触发任何操作，例如删除或重建。

可能的值：

- throw，drop，rebuild

默认值：throw
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

是否允许为非经典MergeTree（即非（Replicated, Shared）MergeTree）创建投影表。忽略选项纯属兼容性，可能导致结果不正确。否则，如果允许合并投影时采取何种操作，删除或重建。经典的 MergeTree 将忽略此设置。
它还控制 `OPTIMIZE DEDUPLICATE`，影响所有 MergeTree 系列成员。与选项 `lightweight_mutation_projection_mode` 类似，它也是部分级别的。

可能的值：

- ignore，throw，drop，rebuild

默认值：throw
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

在插入数据时，磁盘空间中应有的最小可用字节数。如果可用空闲字节数小于 `min_free_disk_bytes_to_perform_insert`，则会抛出异常并且不会执行插入。请注意，此设置：
- 考虑 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定正整数时检查

可能的值：

- 任何正整数。

默认值：0 字节。

请注意，如果同时指定 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，ClickHouse 将依赖于能够在更大空闲内存量上进行插入的值。
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

执行 `INSERT` 所需的最小自由与总磁盘空间的比例。必须是 0 和 1 之间的浮动值。请注意，此设置：
- 考虑 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定正小数时检查

可能的值：

- 浮动，0.0 - 1.0

默认值：0.0

请注意，如果同时指定 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`，ClickHouse 将依赖于能够在更大空闲内存量上进行插入的值。
## allow_experimental_reverse_key {#allow_experimental_reverse_key}

启用在 MergeTree 排序键中支持降序排序。这一设置对于时间序列分析和 Top-N 查询特别有用，允许数据按逆时间顺序存储，以优化查询性能。

启用 `allow_experimental_reverse_key` 后，您可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得可以对于降序查询使用更为高效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

**示例**

```sql
CREATE TABLE example
(
    time DateTime,
    key Int32,
    value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- 对 'time' 字段进行降序
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

通过在查询中使用 `ORDER BY time DESC`，应用了 `ReadInOrder`。

**默认值：** false
## cache_populated_by_fetch {#cache_populated_by_fetch}

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用（默认设置）时，仅当运行需要这些部分的查询时，新数据部分才会加载到缓存中。

如果启用，`cache_populated_by_fetch` 将导致所有节点在不需要查询触发此操作的情况下，从存储加载新数据部分到它们的缓存中。

默认值：false

**另请参见**

- [ignore_cold_parts_seconds](settings.md/#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](settings.md/#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](settings.md/#cache_warmer_threads)
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

如果为 true，将为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，仅允许有效值（`1` 和 `-1`）。

默认值：false
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

启用时，将为表的所有数值列添加最小-最大（跳过）索引。

默认值：false。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

启用时，将为表的所有字符串列添加最小-最大（跳过）索引。

默认值：false。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

启用时，合并构建并存储新部分的跳过索引。

默认值：true
## assign_part_uuids {#assign_part_uuids}

启用时，将为每个新部分分配唯一的部分标识符。在启用之前，请检查所有副本是否支持 UUID 版本 4。

默认值：0。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup}

允许用于 ReplacingMergeTree 的实验性 CLEANUP 合并，带有 `is_deleted` 列。启用时，允许使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有部分合并为一个部分，并删除任何已删除的行。

还允许在后台自动发生此类合并，使用设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`。

默认值：false
