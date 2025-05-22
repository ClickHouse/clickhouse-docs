---
'description': '用于 MergeTree 的设置，这些设置在 `system.merge_tree_settings` 中'
'slug': '/operations/settings/merge-tree-settings'
'title': 'MergeTree 表设置'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

System table `system.merge_tree_settings` 显示全局设置的 MergeTree 设置。

可以在服务器配置文件的 `merge_tree` 部分设置 MergeTree 设置，或者在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

自定义设置 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中配置所有 `MergeTree` 表的默认值：

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

为特定表设置：

```sql
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

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## MergeTree 设置 {#mergetree-settings}
<!-- 以下设置由脚本自动生成，位于
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

自适应写缓冲区的初始大小
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，将为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，仅允许有效值（`1` 和 `-1`）。
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，为表中的所有数值列添加最小最大（跳过）索引。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，为表中的所有字符串列添加最小最大（跳过）索引。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

允许对 ReplacingMergeTree 使用实验性的 CLEANUP 合并，该合并包含 `is_deleted` 列。启用时，允许使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有部分合并为一个部分，并删除任何已删除的行。

还允许启用此类合并在后台自动发生，使用设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`。
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

启用对 MergeTree 排序键的降序排序支持。此设置对于时间序列分析和前 N 查询特别有用，允许数据以反时间顺序存储，以优化查询性能。

启用 `allow_experimental_reverse_key` 后，您可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得对于降序查询，可以使用更有效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

**示例**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- Descending order on 'time' field
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

通过在查询中使用 `ORDER BY time DESC`，应用 `ReadInOrder`。

**默认值：** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用允许使用浮点数作为分区键。

可能的值：
- `0` — 不允许浮点分区键。
- `1` — 允许浮点分区键。
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许 Nullable 类型作为主键。
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Now SMT will remove stale blocking parts from ZooKeeper by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

减少共享合并树表的阻塞部分的后台任务。
仅在 ClickHouse Cloud 中可用。
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

在生产环境中不要使用此设置，因为它尚未准备好。
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting to allow summing of partition or sorting key columns"}]}]}/>

启用后，允许在 SummingMergeTree 表中使用求和列作为分区或排序键。
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

拒绝具有相同表达式的主/次索引和排序键。
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许从紧凑部分到宽部分的垂直合并。该设置必须在所有副本上具有相同的值。
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，此副本从不合并部分，并始终从其他副本下载合并部分。

可能的值：
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

在突变/替换/分离等操作中始终复制数据，而不是使用硬链接。
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则在合并时应用补丁部分。
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用时，将为每个新部分分配一个唯一的部分标识符。
在启用之前，请检查所有副本是否支持 UUID 版本 4。
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代等待 async_block_ids_cache 更新的时间。
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，INSERT 查询中的数据将存储在队列中，并在后台后期刷新到表中。
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或突变的一个步骤的目标执行时间。如果一个步骤需要更长时间，可以超过此限制。
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用（默认设置）时，只有在运行需要这些部分的查询时，新的数据部分才会加载到缓存中。

启用后，`cache_populated_by_fetch` 将导致所有节点从存储加载新数据部分到其缓存中，而无需查询来触发此操作。

**另请参见**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
过时设置，不执行任何操作。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查，确保采样列的数据类型或采样表达式是正确的。数据类型必须是无符号的 [整数类型](/sql-reference/data-types/int-uint): `UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：
- `true`  — 启用检查。
- `false` — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在创建表时检查采样列或采样表达式的数据类型。如果您已经有 таблиц с не правильным sampling expression，并且不希望服务器在启动时引发异常，请将 `check_sample_column_is_correct` 设置为 `false`。
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
过时设置，不执行任何操作。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、块哈希和部分的最短时间。
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

从 0 到 x 秒随机均匀分布的值添加到 cleanup_delay_period 以避免因表数量非常大而导致的涌现效应和随后 ZooKeeper 的拒绝服务。
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的建议批处理大小（点是抽象的，但 1 点大约相当于 1 个插入块）。
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />

用于清理过时线程的线程。仅在 ClickHouse Cloud 中可用。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>

在第一次请求时惰性计算列和二级索引的大小，而不是在表初始化时。
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

需要预热标记缓存的列列表（如果启用）。为空表示所有列。
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。紧凑部分中单个条带中写入的最大字节数。
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。紧凑部分中单个条带中写入的最大粒度数。
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。合并期间完全读取到内存的紧凑部分的最大大小。
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许创建包含未在主键中的采样表达式的表。这仅在临时允许服务器使用错误表以实现向后兼容性时需要。
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

标记支持压缩，减少标记文件大小并加快网络传输速度。
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，减少主键文件大小并加快网络传输速度。
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

仅在 inactive data parts 的数量至少达到此阈值时，激活并发部分移除（请参见 `max_part_removal_threads`）。
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为非经典 MergeTree 表（即不为 (Replicated, Shared) MergeTree 的表）创建投影。忽略选项纯粹出于兼容性，这可能导致不正确的答案。否则，如果允许，则在合并投影时，执行的操作是丢弃或重建。因此经典 MergeTree 会忽略此设置。它也控制 `OPTIMIZE DEDUPLICATE`，但对所有 MergeTree 家族成员都有效。类似选项 `lightweight_mutation_projection_mode`，它也是分级的。

可能的值：
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

指定在表声明中未定义的情况下使用的默认压缩编解码器。
列的压缩编解码器选择顺序：
1. 表声明中为列定义的压缩编解码器
2. 在 `default_compression_codec`（此设置）中定义的压缩编解码器
3. 在 `compression` 设置中定义的默认压缩编解码器
默认值：空字符串（未定义）。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并或突变后，使能或禁用在副本上分离数据部分（如果其与其他副本上的数据部分不完全相同）。如果禁用，则删除数据部分。如果您希望稍后分析这些部分，请激活此设置。

此设置适用于启用 [数据复制](/engines/table-engines/mergetree-family/replacingmergetree) 的 `MergeTree` 表。

可能的值：

- `0` — 部分被删除。
- `1` — 部分被分离。
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失副本时，不移除旧的本地部分。

可能的值：
- `true`
- `false`
## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制的 DETACH PARTITION 查询。
## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制的 FETCH PARTITION 查询。
## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制的 FREEZE PARTITION 查询。
## disk {#disk} 

存储磁盘的名称。可以替代存储策略指定。
## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用为每一行持久化列 _block_number。
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并时持久化虚拟列 `_block_number`。
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

在内存中压缩索引粒度的值（如果可能）。
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Added new setting to limit max bytes for min_age_to_force_merge."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应该尊重设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用使用 `index_granularity_bytes` 设置来控制粒度大小的过渡。在版本 19.11 之前，只有 `index_granularity` 设置用于限制粒度大小。`index_granularity_bytes` 设置提高了 ClickHouse 从大行（数十和数百兆字节）表中选择数据时的性能。如果您的表具有大的行，您可以启用此设置以提高 `SELECT` 查询的效率。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

在分区合并为单个部分时，是否使用 CLEANUP 合并来处理 ReplacingMergeTree。这要求启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的值：
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用用于复制合并树表的以 zookeeper 名称前缀的端点 ID。
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

启用使用垂直合并算法。
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果在分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表上启用此设置，则源表和目标表之间的索引和投影必须完全相同。否则，目标表可以包含源表索引和投影的超集。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，合并部分时将估算实际数据部分大小（即排除通过 `DELETE FROM` 删除的行）。请注意，此行为仅在启用此设置后对受 `DELETE FROM` 影响的数据部分触发。

可能的值：
- `true`
- `false`

**另请参见**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 设置。
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

当此设置的值大于零时，只有一个副本会立即开始合并，而其他副本会等待最多该时间来下载结果，而不是在本地进行合并。如果所选副本没有在该时间内完成合并，将回退到标准行为。

可能的值：
- 任何正整数。
## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

用于测试。请勿更改。
## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

用于测试。请勿更改。
## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

保留的已完成变更记录。如果为零，则保留所有记录。
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

强制在合并时通过文件系统缓存读取。
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的部分执行 fsync。显著降低插入性能，不建议与宽部分一起使用。
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

在所有部分操作（写入、重命名等）后对部分目录执行 fsync。
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时设置，不执行任何操作。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时设置，不执行任何操作。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区中的非活动部分数量超出 `inactive_parts_to_delay_insert` 值，则 `INSERT` 将被人工延迟。

:::tip
当服务器无法足够快地清理部分时，这很有用。
:::

可能的值：
- 任何正整数。
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中的非活动部分数量超过 `inactive_parts_to_throw_insert` 值，则 `INSERT` 将中断并出现以下错误：

> "非活动部分太多（N）。清理部分的处理速度明显慢于插入" 异常。

可能的值：
- 任何正整数。
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

索引的标记间的最大数据行数。即多少行对应一个主键值。
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据粒度的最大字节数。

若要通过行数限制粒度大小，请设置为 `0`（不推荐）。
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试周期（以秒为单位）。
## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
过时设置，不执行任何操作。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
过时设置，不执行任何操作。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
过时设置，不执行任何操作。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除 `DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。因此默认值为 `throw`。然而，此选项可以更改行为。使用值 `drop` 或 `rebuild`，删除将适用于投影。`drop` 将删除投影，因此在当前查询中可能会很快，但在未来的查询中可能较慢，因为没有附加投影。`rebuild` 将重建投影，这可能影响当前查询的性能，但对未来的查询可能加快。同时，值得注意的是，这些选项仅适用于部分级别，这意味着未被触及的部分中的投影将保持不变，而不会触发任何操作，如删除或重建。

可能的值：
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，并且与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起，已删除的现有数据部分的行数将在表启动期间计算。请注意，这可能会减慢启动表的加载时间。

可能的值：
- `true`
- `false`

**另请参见**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置。
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

对于后台操作，如合并、突变等。失败以获取表锁的时间（秒）。
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块大小，即要压缩的块的实际大小。
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

标记使用的压缩编码，标记足够小且已缓存，因此默认压缩为 ZSTD(3)。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用时，合并将构建和存储跳过索引的新部分。
否则，可以通过显式的 MATERIALIZE INDEX 创建/存储。
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

仅在 MATERIALIZE TTL 时重新计算 TTL 信息。
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 的检查将仅在相关分区的平均部分大小不大于指定阈值时激活。如果大于指定阈值，则不会延迟或拒绝 INSERT。这允许在单个服务器上拥有数百 TB 的单个表，如果部分成功合并为较大的部分。这样不会影响非活动部分或总部分的阈值。
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

可以合并为一个部分的最大总部分大小（以字节为单位），如果有足够的资源可用。大致与由自动后台合并创建的最大可能部分大小相对应。（0 表示将禁用合并）

可能的值：

- 任何非负整数。

合并调度器定期分析分区中的部分大小和数量，如果池中有足够的免费资源，它会启动后台合并。当源部分的总大小大于 `max_bytes_to_merge_at_max_space_in_pool` 时，合并就会发生。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 启动的合并将忽略 `max_bytes_to_merge_at_max_space_in_pool`（仅考虑可用的磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

以可用资源最少的后台池合并为一个部分时的最大总部分大小（以字节为单位）。

可能的值：
- 任何正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义可以合并的最大总大小，尽管缺少可用磁盘空间（在池中）。这是为了减少小部分的数量以及避免 “非活动部分太多” 错误。
合并会通过将所有合并部分大小加倍来预定磁盘空间。
因此，在可用磁盘空间较少的情况下，可能会出现这样的情况，即存在空闲空间，但此空间已被正在进行的大型合并预定，因此其他合并无法启动，非活动部分的数量随着每次插入而增加。
## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、块哈希和部分的最长时间。
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在写入表之前压缩未压缩数据块的最大大小。您还可以在全局设置中指定此设置（请参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。创建表时指定的值会覆盖此设置的全局值。
## max_concurrent_queries {#max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的最大并发执行查询数量。
查询仍将受到其他 `max_concurrent_queries` 设置的限制。

可能的值：
- 正整数。
- `0` — 没有限制。

默认值：`0`（无限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```
## max_delay_to_insert {#max_delay_to_insert} 
<SettingsInfoBlock type="UInt64" default_value="1" />

用于计算 `INSERT` 延迟的秒数，如果单个分区中的活动部分数量超过 [parts_to_delay_insert](#parts_to_delay_insert) 值。

可能的值：
- 任何正整数。

`INSERT` 的延迟（以毫秒为单位）通过以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果分区有 299 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，则 `INSERT` 延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

从版本 23.1 开始，公式已更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如，如果分区中有 224 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，min_delay_to_insert_ms = 10，则 `INSERT` 延迟为 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果有大量未完成的突变，合并树表的最大突变延迟（毫秒）。
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />

每个段最大消化字节数，以构建 GIN 索引。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

文件名的最大长度，以保持其原样而不进行哈希。仅在启用设置 `replace_long_file_name_to_hash` 时生效。
此设置的值不包括文件扩展名的长度。因此，建议将其设置为低于最大文件名长度（通常为 255 字节），并留有一些空间，以避免文件系统错误。
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

如果要修改文件（删除、添加）的数量大于此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

如果要删除的文件数量大于此设置，则不应用 ALTER。

可能的值：
- 任何正整数。
## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

可以并行冲刷的最大流（列）数量（合并的 max_insert_delayed_streams_for_parallel_write 的类比）。仅对垂直合并有效。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

在没有选择到合并的部分后，重新尝试选择部分的最大等待时间。在大型集群中，较低的设置将频繁触发后台调度池中的选择任务，这会导致对 ZooKeeper 发出大量请求。
## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
当池中合并带有 TTL 条目的数量超过指定数量时，不要为新的带有 TTL 的合并分配新的合并。这是为了为常规合并留出空闲线程，避免 "非活动部分太多" 错误。
## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每个副本的部分变更数为指定数目。零表示每个副本的变更数量没有限制（执行仍然会受到其他设置的约束）。
## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，不执行任何操作。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，不执行任何操作。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制一次查询中可以访问的最大分区数量。

在创建表时指定的设置值可以通过查询级别的设置进行覆盖。

可能的值：
- 任何正整数。

您还可以在查询/会话/配置文件级别指定查询复杂度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。
## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

如果表中所有分区中的活动部分总数超过 `max_parts_in_total` 值，则 `INSERT` 被中断并抛出 `Too many parts (N)` 异常。

可能的值：
- 任何正整数。

表中大量部分会降低 ClickHouse 查询性能，并增加 ClickHouse 启动时间。通常这是由于错误设计导致的（选择分区策略时的错误 - 分区过小）。
## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

可以一次合并的最大部分量（0 - 禁用）。不影响 OPTIMIZE FINAL 查询。
## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

对失败突变的最大推迟时间。
## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>

对失败的复制提取的最大推迟时间。
## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing merge tasks in the replication queue."}]}]}/>

对失败的复制合并的最大推迟时间。
## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>

对失败的复制任务的最大推迟时间。该值在任务不是提取、合并或突变时使用。
## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

合并树投影的最大数量。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制从网络以字节每秒的速度进行数据交换的最大速度，用于 [replicated](../../engines/table-engines/mergetree-family/replication.md) 获取。这一设置适用于特定的表，不同于[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)设置，该设置适用于服务器。

您可以限制服务器的网络和特定表的网络，但为此表级设置的值应小于服务器级的值。否则，服务器仅考虑`max_replicated_fetches_network_bandwidth_for_server`设置。

该设置不能严格执行。

可能的值：

- 正整数。
- `0` — 无限。

默认值：`0`。

**使用**

可用于在复制数据以添加或替换新节点时限速。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ClickHouse Keeper 日志中可以包含多少条记录，如果有非活动副本。当超过该数量时，非活动副本将变得丢失。

可能的值：
- 任何正整数。
## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ReplicatedMergeTree 队列中允许同时合并和变更操作的任务数量。
## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

在 ReplicatedMergeTree 队列中允许同时进行的带有 TTL 的合并任务数量。
## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中允许同时进行的变更部分的任务数量。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制从网络以字节每秒的速度进行数据交换的最大速度，用于 [replicated](/engines/table-engines/mergetree-family/replacingmergetree) 发送。该设置适用于特定的表，不同于[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)设置，该设置适用于服务器。

您可以限制服务器的网络和特定表的网络，但为此表级设置的值应小于服务器级的值。否则，服务器仅考虑`max_replicated_sends_network_bandwidth_for_server`设置。

该设置不能严格执行。

可能的值：

- 正整数。
- `0` — 无限。

**使用**

可用于在复制数据以添加或替换新节点时限速。
## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中损坏部分的数量超过 `max_suspicious_broken_parts` 值，则不允许自动删除。

可能的值：
- 任何正整数。
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏部分的最大大小，如果更多，则拒绝自动删除。

可能的值：
- 任何正整数。
## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

从合并的部分中读取到内存中的行数量。

可能的值：
- 任何正整数。

合并操作从部分中以 `merge_max_block_size` 行的块读取行，然后进行合并并将结果写入新部分。读取的块放在内存中，因此`merge_max_block_size` 影响合并所需的内存大小。因此，对于行非常宽的表，合并可能会消耗大量的内存（如果平均行大小为 100kb，那么在合并 10 个部分时，(100kb * 10 * 8192) ≈ 8GB 的内存）。通过减少 `merge_max_block_size`，您可以减少合并所需的内存，但会减慢合并速度。
## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

合并操作应该形成的块的字节数。默认为与 `index_granularity_bytes` 相同的值。
## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。合并时预热缓存的部分（紧凑或打包）的最大大小。
## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

在没有选择到任何部分后，尝试再次选择要合并的部分前的最小等待时间。较低的设置将导致在大规模集群中频繁触发后台选择任务，造成大量请求到 zookeeper。
## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

当没有内容可合并时，合并选择任务的睡眠时间乘以此因子，而当分配了合并时进行除以此因子。
## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

选择用于分配合并的部分的算法。
## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
影响分配的合并的写放大（专家级设置，若您不理解其作用，请勿更改）。适用于 Simple 和 StochasticSimple 合并选择器。
## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

控制逻辑启动的距离分区中的部分数量。因子越大，反应越迟钝。
## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用合并选择部分的启发式，当从右侧范围移除部分时，如果其大小小于指定比例（0.01）之和。适用于 Simple 和 StochasticSimple 合并选择器。
## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一次查看多少部分。
## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。合并时用于预热缓存的部分的最大总大小。
## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
过时设置，无效。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧部分、WAL 和变更清理的间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理的间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

重复具有重新压缩 TTL 的合并前的最小延迟（以秒为单位）。
## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

重复具有删除 TTL 的合并前的最小延迟（以秒为单位）。
## merge_workload {#merge_workload} 

用于调节在合并与其他工作负载之间如何利用和共享资源。指定的值用作该表的后台合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

关闭的最小绝对延迟，停止服务请求，并在状态检查时不返回 Ok。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

指示 `min_age_to_force_merge_seconds` 是否仅应适用于整个分区，而不是子集。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（请参见`enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- true, false
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个部分的年代都在 `min_age_to_force_merge_seconds` 的值之前，则合并部分。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`
（请参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- 正整数。
## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整类型存储数据部分所需的最小未压缩大小（以字节为单位），而不是打包。
## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据部分存储在 `Wide` 格式中的最小字节/行数。您可以设置这些设置中的一个、两个或都不设置。
## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

在新部分上预热标记缓存和主索引缓存的最小大小（未压缩字节）。
## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

设置当在卷磁盘 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 上分发新大件时启用平衡的最小字节数。

可能的值：

- 正整数。
- `0` — 禁用平衡。

**使用**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不得小于[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) / 1024 的值。否则，ClickHouse 会引发异常。
## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

执行下一个标记写入时所需的未压缩数据的最小块大小。您也可以在全局设置中指定此设置（请参见[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)设置）。在创建表时指定的值将覆盖该设置的全局值。
## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

获取后进行 fsync 的最小压缩字节数（0 - 禁用）。
## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后进行 fsync 的最小压缩字节数（0 - 禁用）。
## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在单个分区中如果有许多未合并的部分，则插入数据到 MergeTree 表的最小延迟（以毫秒为单位）。
## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在有许多未完成变更时，对 MergeTree 表进行变更的最小延迟（以毫秒为单位）。
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在插入数据之前，磁盘空间中应有的最小空闲字节数。如果可用的空闲字节数少于 `min_free_disk_bytes_to_perform_insert`，则会引发异常，并且插入操作不会执行。注意，此设置：
- 考虑到 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定了正（非零）字节数时检查。

可能的值：
- 任何正整数。

:::note
如果同时指定 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，ClickHouse 将根据能允许更大空闲内存的值进行计算。
:::
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 的最小自由与总磁盘空间的比率。必须是 0 到 1 之间的浮点值。注意，此设置：
- 考虑到 `keep_free_space_bytes` 设置。
- 不考虑将通过 `INSERT` 操作写入的数据量。
- 仅在指定了正（非零）比率时检查。

可能的值：
- 浮动值，0.0 - 1.0

注意，如果同时指定 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`，ClickHouse 将根据能允许更大空闲内存的值进行计算。
## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

数据粒度的最小允许大小（以字节为单位）。

提供一种保护措施，以防止意外创建具有非常低 `index_granularity_bytes` 的表。
## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

查询读取的最小标记数以应用[max_concurrent_queries](#max_concurrent_queries) 设置。

:::note
查询仍将受到其他 `max_concurrent_queries` 设置的限制。
:::

可能的值：
- 正整数。
- `0` — 禁用（不对任何查询应用 `max_concurrent_queries` 限制）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

合并操作所需的最小数据量，以便使用直接 I/O 访问存储磁盘。合并数据部分时，ClickHouse 计算所有待合并数据的总存储量。如果此量超过 `min_merge_bytes_to_use_direct_io` 字节，则 ClickHouse 使用直接 I/O 接口（`O_DIRECT` 选项）读取和写入数据。如果 `min_merge_bytes_to_use_direct_io = 0`，则直接 I/O 被禁用。
## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

可以一次合并选择器选择的最小数据部分量（专家级设置，若您不理解其作用，请勿更改）。0 - 禁用。适用于 Simple 和 StochasticSimple 合并选择器。
## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

来自其他副本的最小延迟以关闭、停止服务请求并在状态检查时不返回 Ok。
## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

仅在绝对延迟不小于此值的情况下计算相对副本延迟。
## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
过时设置，无效。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留约此数量的最新记录，即使它们已经过时。它不会影响表的工作：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：
- 任何正整数。
## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整类型存储数据部分所需的最小行数，而不是打包。
## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

创建宽格式部分所需的最小行数，而不是紧凑格式。
## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后进行 fsync 的最小行数（0 - 禁用）。
## mutation_workload {#mutation_workload} 

用于调节在变更与其他工作负载之间如何利用和共享资源。指定的值用作该表的后台变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在非复制 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，存储的最新插入块的数量，以检查重复内容的哈希和。

可能的值：
- 任何正整数。
- `0`（禁用去重）。

使用了一种去重机制，类似于复制表（请参见[replicated_deduplication_window](#replicated_deduplication_window) 设置）。
创建的部分的哈希和写入磁盘上的本地文件。
## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

通知最新块编号给 SharedJoin 或 SharedSet。仅在 ClickHouse Cloud 中可用。
## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

当池中可用的空闲条目少于指定数量时，不执行部分变更。这是为了为常规合并保留空闲线程，并避免“部分过多”的错误。

可能的值：
- 任何正整数。

**使用**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)的值。否则，ClickHouse 将引发异常。
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

当池中可用的空闲条目少于指定数量时，不执行后台优化整个分区（此任务在设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成）。这是为了保留空闲线程用于常规合并，以避免“部分过多”。

可能的值：
- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)的值。否则，ClickHouse 将引发异常。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

当池中可用的空闲条目少于指定数量时（或复制队列），开始降低最大合并大小以处理（或放入队列）。这是为了允许小规模合并处理，不填充整个池满是长时间运行的合并。

可能的值：
- 任何正整数。
## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
如果表至少有那么多未完成的变更，则人为减慢表的变更。设置为 0 时禁用。
## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表至少有那么多未完成的变更，则抛出“变更过多”的异常。设置为 0 时禁用。
## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。最多考虑合并的前 N 个分区。随机加权选择分区，其中权重为该分区中可以合并的数据部分的数量。
## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

在保护数据免于在自发服务器重启期间丢失的情况下，存储非活动部分的时间（以秒为单位）。

可能的值：
- 任何正整数。

在将多个部分合并为一个新部分后，ClickHouse 将原始部分标记为非活动，并且仅在经过 `old_parts_lifetime` 秒后删除它们。
如果当前查询未使用非活动部分，即如果部分的`refcount` 为 1，则将删除非活动部分。

对于新部分，不会调用 `fsync`，因此在一段时间内，新部分仅存在于服务器的 RAM 中（操作系统缓存）。如果服务器自发重启，则新部分可能会丢失或损坏。为了保护数据，非活动部分不会立即删除。

在启动时，ClickHouse 检查部分的完整性。如果合并的部分损坏，ClickHouse 会将非活动部分返回到活动列表，稍后再进行合并。然后，损坏的部分被重命名（前缀为 `broken_`）并移到 `detached` 文件夹中。如果合并的部分没有损坏，则原始的非活动部分被重命名（前缀为 `ignored_`）并移到 `detached` 文件夹中。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（写入数据仅存储在 RAM 中的最长时间），但在对磁盘系统的重负载下，数据可能会延迟写入。从经验上看，为 `old_parts_lifetime` 选择了 480 秒的值，在此期间一个新部分被保证写入磁盘。
## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

在插入期间控制行顺序的优化，以提高新插入表部分的压缩率。

仅对普通的 MergeTree 引擎表有效。对专业的 MergeTree 引擎表（例如，CollapsingMergeTree）无效。

MergeTree 表（可选地）使用 [压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 进行压缩。通用压缩编解码器如 LZ4 和 ZSTD 在数据展现出模式时能够达到最大的压缩率。长时间的相同值通常具有很好的压缩效果。

如果启用此设置，ClickHouse 会尝试将新插入部分中的数据存储为一种行顺序，以最小化列中等值运行的数量。换句话说，少量同值运行意味着单个运行较长，因而更加适合压缩。

寻找最佳行顺序在计算上是不可行的（ NP 难）。因此，ClickHouse使用启发式方法快速找到一种行顺序，这种顺序仍能改善相对于原始行顺序的压缩率。

<details markdown="1">

<summary>寻找行顺序的启发式方法</summary>

通常，我们可以自由地打乱表（或表部分）的行，因为 SQL 认为以不同的行顺序的同一表（或表部分）是等效的。

当为表定义主键时，打乱行的自由度受到限制。在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制按照列 `C1`，`C2`，...`Cn` 排序表行（[聚集索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。因此，行只能在“等价类”内打乱，即在其主键列中具有相同值的行。
直觉上，具有高基数的主键，例如涉及 `DateTime64` 时间戳列的主键，导致许多小的等价类。类似地，具有低基数的主键的表会产生较少而大的等价类。没有主键的表代表了一个极端案例，即一个跨越所有行的单一等价类。

等价类越少且越大，重新打乱行的自由度就越高。

应用于在每个等价类内找到最佳行顺序的启发式方法是 D. Lemire 和 O. Kaser 提出的，在 [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) 中，并基于对每个等价类中的行按非主键列的升序基数进行排序。

它执行三步：
1. 找到所有基于主键列中的行值的等价类。
2. 对于每个等价类，计算（通常是估计）非主键列的基数。
3. 对于每个等价类，按非主键列基数的升序对行进行排序。

</details>

如果启用，插入操作将增加额外的 CPU 成本，以分析和优化新数据的行顺序。根据数据特性的不同，预计 INSERT 操作会花费 30-50% 更长的时间。 
LZ4 或 ZSTD 的压缩率平均提高 20-40%。

此设置对没有主键或低基数主键的表效果最佳，即仅有少数不同主键值的表。高基数主键，如涉及 `DateTime64` 类型的时间戳列的，不预计会从此设置中获益。
## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动部分之前/之后的等待时间。
## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

实验性/不完整功能，用于在分片之间移动部分。不考虑分片表达式。
## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活动部分数量超过 `parts_to_delay_insert` 值，则 `INSERT` 将被人为减慢。

可能的值：
- 任何正整数。

ClickHouse 人为地执行更长时间的 `INSERT`（添加“睡眠”），以使后台合并过程能够比添加的部分更快地进行合并。
## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活动部分数量超过 `parts_to_throw_insert` 值，则 `INSERT` 将被中断，并抛出“部分太多（N）。合并处理明显比插入慢”异常。

可能的值：
- 任何正整数。

为了实现 `SELECT` 查询的最大性能，必须最小化处理的部分数量，详见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 之前，此设置设置为 300。您可以设置更高的不同值，这将减少 `Too many parts` 错误的概率，但同时 `SELECT` 的性能可能会下降。此外，在合并问题（例如，由于磁盘空间不足）时，您会比使用原始的 300 更晚发现这一点。
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果部分大小的总和超过此阈值，并且自复制日志条目创建以来的时间超过 `prefer_fetch_merged_part_time_threshold`，则更倾向于从副本中获取合并的部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建以来的时间超过此阈值，并且部分大小的总和大于 `prefer_fetch_merged_part_size_threshold`，则更倾向于从副本中获取合并的部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
如果为真，标记缓存将通过在插入、合并、获取和服务器启动时保存标记到标记缓存中进行预热。
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为真，主索引缓存将通过在插入、合并、获取和服务器启动时保存标记到标记缓存中进行预热。
## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主键压缩块大小，实际压缩块的大小。
## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

主键使用的压缩编码，由于主键足够小且被缓存，因此默认压缩为 ZSTD(3)。
## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
第一次使用时加载主键到内存，而不是在表初始化时加载。在存在大量表的情况下，这可以节省内存。
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

如果数据部分中主键列的值至少在这个比率范围内发生变化，则跳过加载下一个列到内存。这允许通过不加载不必要的主键列来节省内存使用。
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 _default_ 值的最小比例与 _all_ 值的数量之比。设置此值将使列使用稀疏序列化存储。

如果列是稀疏的（主要包含零），ClickHouse 可以以稀疏格式对其进行编码并自动优化计算 - 在查询期间数据不需要完全解压缩。要启用这种稀疏序列化，请将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果该值大于或等于 1.0，则列将始终使用正常的完全序列化进行写入。

可能的值：

- 在 `0` 和 `1` 之间的浮点数以启用稀疏序列化
- `1.0` （或更大）如果您不想使用稀疏序列化

**示例**

注意以下表中的 `s` 列在 95% 的行中是空字符串。在 `my_regular_table` 中我们不使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

注意 `my_sparse_table` 中的 `s` 列使用的磁盘存储空间更少：

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

您可以查看 `s` 的哪些部分是使用稀疏序列化存储的：

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
## reduce_blocking_parts_sleep_ms {#reduce_blocking_parts_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在未丢弃/替换任何范围后，尝试减少阻塞部分之前的最小等待时间。较低的设置将频繁触发后台调度池中的任务，这会导致在大规模集群中对 zookeeper 发送大量请求。
## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

如果大于零 - 刷新来自底层文件系统的数据部分列表，以检查数据是否在后台更新。仅当表位于只读磁盘上（这意味着这是一个只读副本，而数据正在由另一个副本写入）时，可以进行设置。
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

当此设置的值大于零时，仅单个副本立即启动合并，如果共享存储上的合并部分并且 `allow_remote_fs_zero_copy_replication` 启用。

:::note
零拷贝复制尚未准备好投入生产
在 ClickHouse 版本 22.8 及更高版本中，零拷贝复制默认是禁用的。

不建议在生产环境中使用此功能。
:::

可能的值：
- 任何正整数。
## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

在转换过程中以兼容模式运行零拷贝。
## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>
<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

用于零拷贝表独立信息的 ZooKeeper 路径。
## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

在通过 TTL、变更或崩溃合并算法修剪后删除空部分。
## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

用于未完成实验特性的设置。
## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

在后台移除应用于所有活动部分的补丁部分。
## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 'max_file_name_length' 字节），则将其替换为 SipHash128
## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则此节点上的副本将尝试获取领导权。

可能的值：
- `true`
- `false`
## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ClickHouse Keeper 存储用于检查重复项的最近插入块的数量的哈希值。

可能的值：
- 任何正整数。
- 0（禁用去重）

`Insert` 命令创建一个或多个块（部分）。对于 [插入去重](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将创建的部分的哈希值写入 ClickHouse Keeper。哈希值仅存储最近 `replicated_deduplication_window` 块的哈希值。最旧的哈希值会从 ClickHouse Keeper 删除。

`replicated_deduplication_window` 的大值会减慢 `Inserts`，因为需要比较更多条目。哈希值是从字段名称和类型的组合以及插入部分的数据（字节流）计算得出的。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 存储用于检查重复项的最近异步插入块的数量的哈希值。

可能的值：
- 任何正整数。
- 0（禁用异步插入的去重）

[Async Insert](/operations/settings/settings#async_insert) 命令将在一个或多个块（部分）中缓存。对于 [插入去重](/engines/table-engines/mergetree-family/replication)，在写入复制表时，ClickHouse 将每次插入的哈希值写入 ClickHouse Keeper。哈希值仅存储最近 `replicated_deduplication_window_for_async_inserts` 块的哈希值。最旧的哈希值会从 ClickHouse Keeper 删除。

大量的 `replicated_deduplication_window_for_async_inserts` 会减慢 `Async Inserts`，因为需要比较更多条目。哈希值是从字段名称和类型的组合以及插入的数据（字节流）计算得出的。
## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

插入块的哈希值从 ClickHouse Keeper 删除的时间（以秒为单位）。

可能的值：
- 任何正整数。

类似于 [replicated_deduplication_window](#replicated_deduplication_window)，`replicated_deduplication_window_seconds` 指定为插入去重存储哈希值的时间。超过 `replicated_deduplication_window_seconds` 的哈希值将从 ClickHouse Keeper 中删除，即使它们少于 `replicated_deduplication_window`。

时间相对于最近记录的时间，而不是墙时。如果这是唯一的记录，它将永远保存。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

异步插入的哈希值从 ClickHouse Keeper 删除的时间（以秒为单位）。

可能的值：
- 任何正整数。

类似于 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)，`replicated_deduplication_window_seconds_for_async_inserts` 指定为异步插入去重存储哈希值的时间。超过 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希值将从 ClickHouse Keeper 中删除，即使它们少于 `replicated_deduplication_window_for_async_inserts`。

时间相对于最近记录的时间，而不是墙时。如果这是唯一的记录，它将永远保存。
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无任何作用。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无任何作用。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无任何作用。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

可以在一个 MUTATE_PART 条目中合并并执行的最大变更命令数（0 表示无限制）。
## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
过时设置，无任何作用。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误部分与总部分的比例小于此值 - 允许开始。

可能的值：
- 浮点，0.0 - 1.0
## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

停止为共享合并树分配合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用协调合并策略。
## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

启用在虚拟部分中写入属性并在 keeper 中提交块。
## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用过时部分检查。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

在共享合并树中未被 ZooKeeper 监视的部分更新的时间间隔（以秒为单位）。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

部分更新的初始后退时间。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

服务器间 HTTP 连接的超时。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

服务器间 HTTP 通信的超时。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在共享合并树领导更新周期中添加 0 到 x 秒的均匀分布值，以避免出现“雷同效应”。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

最大重新检查领导权间隔。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

在一次 HTTP 请求中，最大过时部分数量的领导者将尝试确认移除。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

部分更新的最大后退时间。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

最大部分更新领导者数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

最大每个可用区的部分更新领导者数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与部分删除（清理线程）的最大副本。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

尝试分配潜在冲突合并的最大副本（允许避免冗余的合并分配冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max broken parts for SMT, if more - deny automatic detach"}]}]}/>

SMT 的最大损坏部分数，如果更多则禁止自动分离。
## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max size of all broken parts for SMT, if more - deny automatic detach"}]}]}/>

最大所有损坏部分的总大小，如果更多则禁止自动分离。
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

我们存储插入记忆化 ID 的时间，以避免在插入重试期间发生错误操作。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调员选举线程的运行间隔。
## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "2"},{"label": "New setting"}]}]}/>

协调员线程延迟的时间改变因子。
## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调员与 zookeeper 同步以获取新元数据的频率。
## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

协调员可以一次从 MergerMutator 请求的合并数量。
## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调员线程的最大运行间隔。
## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调员应该准备并分配给工作者的合并条目数。
## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

合并协调员线程的最小运行间隔。
## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

如果需要在立即操作后更新状态，合并工作线程将使用的超时。
## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并工作线程的运行间隔。
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>` 比例高于设置时，将在合并/变更选择任务中重新加载合并谓词。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一次调度提取部分元数据工作数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

保持本地合并部分的时间，而不启动包含该部分的新合并。让其他副本有机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

合并后推迟分配下一次合并的部分的最小大小（以行为单位）。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

保持本地合并部分的时间，而不启动包含该部分的新合并。允许其他副本有机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

当可能时从领导者读取虚拟部分。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting to fetch parts data from other replicas"}]}]}/>

如果启用，所有副本将尝试从其他已存在的副本中获取内存中部分数据（如主键、分区信息等）。
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

允许从其他副本中的内存缓存请求 FS 缓存提示。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

对过时部分使用压缩格式：减少对 Keeper 的负载，改善过时部分的处理。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，过多的部分计数将依赖于 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果有很多过时部分，清理线程将在一次迭代中尝试删除最多 `simultaneous_parts_removal_limit` 部分。 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

测试用。请勿更改。
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

测试用。请勿更改。
## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略的名称。
## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

这是表磁盘，路径/端点应指向表数据，而不是数据库数据。仅可设置为 s3_plain/s3_plain_rewritable/web。
## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

保留 tmp_-目录的时间（以秒为单位）。您不应降低此值，因为低设置可能导致合并和变更无法正常工作。
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

在开始合并与重新压缩之前的超时（以秒为单位）。在此期间，ClickHouse 尝试从分配了该重新压缩合并的副本中获取重新压缩的部分。

在大多数情况下，重新压缩工作速度较慢，因此我们不会在超时之前启动重新压缩的合并，而是尝试从分配了该重新压缩合并的副本中获取重新压缩的部分。

可能的值：
- 任何正整数。
## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当该部分中的所有行根据其 `TTL` 设置过期时，数据部分是否完全丢弃。

当 `ttl_only_drop_parts` 禁用（默认情况下）时，仅移除根据其 TTL 设置过期的行。

当 `ttl_only_drop_parts` 启用时，如果该部分中的所有行根据其 `TTL` 设置过期，则整个部分将被丢弃。
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许在写入动态子列时使用自适应写入缓冲区，以减少内存使用。
## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，我们缓存异步插入的哈希值。

可能的值：
- `true`
- `false`

一个包含多个异步插入的块将生成多个哈希值。当一些插入被重复时，keeper 只有在一个 RPC 中返回一个重复的哈希值，这将导致不必要的 RPC 重试。此缓存将监视 Keeper 中的哈希值路径。如果在 Keeper 中监视到更新，则缓存将尽快更新，以便我们能够过滤内存中的重复插入。
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

为 Variant 数据类型中的区分符启用二进制压缩序列化模式。此模式允许在主要是一个变体或有大量 NULL 值时，显著减少存储区分符的内存使用。
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

始终为整个部分使用恒定粒度。允许在内存中压缩索引粒度的值。在处理极大工作负载和细表时可能有用。
## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时设置，无任何作用。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中使用较小的格式（几十字节）作为部分校验和，而不是普通格式（几十 KB）。在启用之前，请检查所有副本是否支持新格式。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 中数据部分头的存储方法。如果启用，ZooKeeper 存储更少的数据。有关详细信息，请参见 [此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。
## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

使用主键的缓存，代替将所有索引保存在内存中。对于非常大的表可能会有用。
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

激活 Vertical merge 算法的合并部分中最小（近似）未压缩字节大小。
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

激活 Vertical merge 算法的非主键列的最小数量。
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

激活 Vertical merge 算法的合并部分中最小（近似）行数之和。
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并时将从远程文件系统预取下一列的数据。
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭之前，表将等待所需的时间，以便从其他副本获取唯一部分（仅存在于当前副本中）（0 表示禁用）。
## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
过时设置，无任何作用。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
过时设置，无任何作用。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
过时设置，无任何作用。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时设置，无任何作用。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用按每个子流而不是每个列在压缩部分中写入标记。这允许高效地从数据部分读取单个子列。
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

为了获得较小的独立范围，最大推迟移除的顶级部分比例。建议不更改。
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

将独立的过时部分范围分割成更小子范围的最大递归深度。建议不更改。
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用零拷贝复制，在尝试锁定合并或变更时，根据部分大小随机睡眠一段时间。
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用零拷贝复制，在尝试锁定合并或变更之前，随机睡眠最多 500 毫秒。
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期，以秒为单位。

可能的值：
- 任何正整数。
