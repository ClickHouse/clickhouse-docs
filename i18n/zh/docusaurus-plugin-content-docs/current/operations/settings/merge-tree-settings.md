import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

System table `system.merge_tree_settings` 显示全局设置的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中设置，也可以在 `CREATE TABLE` 语句的 `SETTINGS` 子句中单独为每个 `MergeTree` 表指定。

自定义设置 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中为所有 `MergeTree` 表配置默认值：

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
<!-- 下面的设置是由脚本自动生成的，脚本位于 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

自适应写缓冲区的初始大小
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为true，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，以只允许有效值 (`1` 和 `-1`)。
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


当启用时，为表的所有数值列添加最小-最大（跳过）索引。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


当启用时，为表的所有字符串列添加最小-最大（跳过）索引。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

允许针对具有 `is_deleted` 列的 ReplacingMergeTree 进行实验性 CLEANUP 合并。当启用时，允许使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有部分合并为单个部分，并删除任何删除的行。

还允许在后台自动进行此类合并，设置为 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`。
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


启用对 MergeTree 排序键中降序排序的支持。此设置对于时间序列分析和 Top-N 查询特别有用，允许将数据以逆时间顺序存储，以优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得可以使用更有效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder` 来处理降序查询。

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

通过在查询中使用 `ORDER BY time DESC`，则应用 `ReadInOrder`。

**默认值：** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用将浮点数作为分区键。
  
可能的值：
- `0` — 不允许使用浮点数作为分区键。
- `1` — 允许使用浮点数作为分区键。
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许将 Nullable 类型作为主键。
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Now SMT will remove stale blocking parts from ZooKeeper by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


用于减少共享合并树表的阻塞部分的后台任务。
仅在 ClickHouse Cloud 中可用。
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

请勿在生产中使用此设置，因为它尚未准备好。
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting to allow summing of partition or sorting key columns"}]}]}/>


当启用时，允许在 SummingMergeTree 表中使用求和列作为分区或排序键。
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

拒绝具有相同表达式的主/次索引和排序键。
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许从紧凑到宽部分的垂直合并。所有副本上此设置必须具有相同的值。
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为true，则该副本从不合并部分，而是始终从其他副本下载合并部分。

可能的值：
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

在变更/替换/分离等过程中始终复制数据，而不是使用硬链接。
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


如果为true, 合并时会应用补丁部分。
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用后，每个新部分将分配一个唯一的部分标识符。
启用之前，请检查所有副本是否支持 UUID 版本 4。
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

每个插入迭代在更新 async_block_ids_cache 之前等待的时间。
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为true, INSERT 查询中的数据将存储在队列中，并随后在后台刷新到表中。
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或变更单个步骤的目标执行时间。如果某一步骤消耗的时间较长则可以超出此值。
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用（默认设置）时，新数据部分仅在运行需要这些部分的查询时加载到缓存中。

如果启用，则 `cache_populated_by_fetch` 将导致所有节点在没有查询触发的情况下，从存储加载新数据部分到它们的缓存中。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
过时设置，未做任何操作。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

在表创建时启用对采样列或采样表达式的数据类型是否正确的检查。数据类型必须为无符号 [整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：
- `true` — 启用检查。
- `false` — 在表创建时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在表创建时检查采样列或采样表达式的数据类型。如果您已有具有不正确采样表达式的表，并且不希望服务器在启动时引发异常，请将 `check_sample_column_is_correct` 设置为 `false`。
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
过时设置，未做任何操作。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、区块哈希和部分的最小周期。
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 cleanup_delay_period 中均匀分布的值从0到x秒，以避免雷群效应和随后的 ZooKeeper 的 DoS，特别是在表数量非常多的情况下。
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的首选批量大小（点数是抽象的，1个点大约相当于1个插入的区块）。
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />

用于清理过期线程的线程。仅在 ClickHouse Cloud 中可用。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>


在第一次请求时懒惰地计算列和二级索引的大小，而不是在表初始化时计算。
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


要预热标记缓存的列列表（如果启用）。空意味着所有列。
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。写入紧凑部分单个条带的最大字节数。
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。写入紧凑部分单个条带的最大颗粒数。
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。在合并过程中最大化读取紧凑部分的大小。
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许创建带有不在主键中的采样表达式的表。这仅用于临时允许服务器与错误表一起运行，以便向后兼容。
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

标记支持压缩，减少标记文件大小并加快网络传输速度。
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，减少主键文件大小并加快网络传输速度。
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

仅在非活动数据部分的数量至少为此值时，激活并发部分删除（请参见 `max_part_removal_threads`）。
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>


是否允许为非经典 MergeTree 表创建投影，即不是 (Replicated、Shared) MergeTree。忽略选项纯粹是出于兼容性，可能导致不正确的结果。否则，如果允许，在合并投影时执行的操作是删除或重建。因此经典 MergeTree 将忽略此设置。它还同时控制 `OPTIMIZE DEDUPLICATE`，但对所有 MergeTree 家族成员均有影响。与选项 `lightweight_mutation_projection_mode` 类似，它也是分级的。

可能的值：
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>


指定在表声明中未为特定列定义的情况下使用的默认压缩编解码器。
列的压缩编解码器选择顺序：
1. 在表声明中为列定义的压缩编解码器。
2. 在 `default_compression_codec` 中定义的压缩编解码器（此设置）。
3. 在 `compression` 设置中定义的默认压缩编解码器。
默认值：空字符串（未定义）。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在合并或变更后，从副本中分离一个数据部分，如果它与其他副本上的数据部分不完全相同。如果禁用，则数据部分将被移除。如果您希望稍后分析这些部分，请激活此设置。

该设置适用于启用了 [数据复制](/engines/table-engines/mergetree-family/replacingmergetree) 的 `MergeTree` 表。

可能的值：

- `0` — 部分将被移除。
- `1` — 部分将被分离。
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

修复丢失的副本时不要移除旧的本地部分。

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

为每一行启用持久列 _block_number。
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并过程中持久化虚拟列 `_block_number`。
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果可能，压缩内存中的索引粒度值。
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Added new setting to limit max bytes for min_age_to_force_merge."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应该遵循设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用转换以控制粒度大小与 `index_granularity_bytes` 设置。19.11 版本之前，只有用于限制粒度大小的 `index_granularity` 设置。`index_granularity_bytes` 设置可以在从大行的表中选择数据时改善 ClickHouse 的性能。如果您有大行的表，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>


是否在将分区合并到单个部分时使用 CLEANUP 合并以进行 ReplacingMergeTree。需要启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的值：
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

为复制合并树表启用携带 ZooKeeper 名称前缀的端点 ID。
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

启用使用垂直合并算法。
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


如果为分区操作查询的目标表启用此设置（`ATTACH/MOVE/REPLACE PARTITION`），则源表和目标表之间的索引和投影必须完全相同。否则，目标表可以有源表丢失的索引和投影集。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，则在选择要合并的部分时将根据实际数据部分的估计实际大小（即不包括通过 `DELETE FROM` 删除的行）进行选择。请注意，此行为仅会在此设置启用后执行的 `DELETE FROM` 影响的数据部分上触发。

可能的值：
- `true`
- `false`

**另请参阅**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
设置
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

当该设置的值大于零时，仅单个副本立即开始合并，其他副本等待最多此时间，以下载结果，而不是在本地进行合并。如果选择的副本未能在此时间内完成合并，那么将回退至标准行为。

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

保留完成的变更记录的数量。如果为零，则保留所有记录。
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

强制在合并过程中通过文件系统缓存读取数据。
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的部分执行 fsync。这显著降低了插入性能，不建议在宽部分使用。
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

对所有部分操作（写入、重命名等）后执行 fsync 操作到部分目录。
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时设置，未做任何操作。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时设置，未做任何操作。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区的非活动部分数量超过 `inactive_parts_to_delay_insert` 值，则将人为减慢 `INSERT` 操作。

:::tip
这在服务器未能快速清理部分时很有用。
:::

可能的值：
- 任何正整数。
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中非活动部分的数量超过 `inactive_parts_to_throw_insert` 值，`INSERT` 会中断并抛出以下错误：

> "非活动部分过多 (N)。部分清理处理明显慢于插入" 异常。

可能的值：
- 任何正整数。
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间数据行的最大数量。即多少行对应于一个主键值。
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据颗粒的最大字节大小。

要仅通过行数限制颗粒大小，请将其设置为 `0`（不推荐）。
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试周期，以秒为单位。
## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
过时设置，未做任何操作。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
过时设置，未做任何操作。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
过时设置，未做任何操作。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除 `DELETE` 对具有投影的表不起作用。这是因为投影中的行可能会受到 `DELETE` 操作的影响。因此，默认值将为 `throw`。但是，此选项可以更改行为。使用 `drop` 或 `rebuild` 的值，删除将对投影有效。`drop` 将删除投影，因此在当前查询中可能速度较快，但在未来查询中由于没有附加投影可能会较慢。`rebuild` 将重建投影，这可能会影响当前查询的性能，但可能会加速未来的查询。好的一点是，这些选项仅在部分级别有效，这意味着未被触及的部分中的投影将保持完整，而不会触发任何操作，例如删除或重建。

可能的值：
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一同启用，将在表启动时计算现有数据部分的已删除行数。请注意，这可能会减慢表加载启动。

可能的值：
- `true`
- `false`

**另请参阅**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

对于合并、变更等后台操作，尝试获取表锁而失败之前的秒数。
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块的大小，实际要压缩的块的大小。
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

标记所使用的压缩编码，标记小且被缓存，因此默认压缩为 ZSTD(3)。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>


启用时，合并会为新部分构建和存储跳过索引。
否则，可以通过显式 MATERIALIZE INDEX 创建/存储。
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

仅在 MATERIALIZE TTL 时重新计算 ttl 信息。
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 检查“过多部分”的条件，将仅在相关分区的平均部分大小不大于指定阈值时激活。如果大于指定阈值，则将不会延迟或拒绝 INSERT。这允许在单个服务器上拥有数百 TB 的单个表，如果部分成功合并为更大部分。这不影响对非活动部分或总部分的阈值。
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

要合并为一个部分的最大总部分大小（以字节为单位），前提是可用资源足够。大致对应于自动后台合并创建的最大可能部分大小。（0 表示禁用合并）

可能的值：

- 任何非负整数。

合并调度程序定期分析分区中部分的大小和数量，如果池中有足够的空闲资源，则开始后台合并。合并发生，直到源部分的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并忽略 `max_bytes_to_merge_at_max_space_in_pool` （仅考虑空闲磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

在后台池中的最低可用资源下，合并为一个部分的最大总部分大小（以字节为单位）。

可能的值：
- 任何正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义尽管缺乏可用磁盘空间（在池中）而可以合并的部分的最大总大小。这是减少小部分数量和避免 "Too many parts" 错误所必需的。
合并占用磁盘空间，通过加倍总合并部分的大小来预订空间。
因此，在空闲磁盘空间少的情况下，可能会出现一种情况，即有空闲空间，但该空间已被进行中的大规模合并占用，因此其他合并无法开始，导致小部分数量随着每次插入而增长。
## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、区块哈希和部分的最大周期。
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在压缩以写入表之前，未压缩数据块的最大大小。您还可以在全局设置中指定此设置（见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值将覆盖此设置的全局值。
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

用于计算 `INSERT` 延迟的秒值，如果单个分区中活动部分的数量超过 [parts_to_delay_insert](#parts_to_delay_insert) 值。

可能的值：
- 任何正整数。

`INSERT` 的延迟（以毫秒为单位）由以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果一个分区有 299 个活动部分，且 parts_to_throw_insert = 300, parts_to_delay_insert = 150, max_delay_to_insert = 1 则 `INSERT` 将延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

从版本 23.1 开始，公式已更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```
例如，如果一个分区有 224 个活动部分，且 parts_to_throw_insert = 300, parts_to_delay_insert = 150, max_delay_to_insert = 1, min_delay_to_insert_ms = 10，则 `INSERT` 将延迟 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果有许多未完成的变更，最大变更延迟的 MergeTree 表的毫秒数。
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />

为构建 GIN 索引而单个段的最大字节数。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

最大文件名长度，以保持其原样而不进行哈希。
仅在启用设置 `replace_long_file_name_to_hash` 时生效。
该设置的值不包括文件扩展名的长度。因此，建议将其设置为低于最大文件名长度（通常为 255 字节），留有一定的间隔以避免文件系统错误。
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

如果要修改（删除、添加）的文件数量大于此设置，则不应用 ALTER。

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


可同时并行刷新（相对于合并的 max_insert_delayed_streams）的最大流（列）数量。仅适用于垂直合并。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

在未选择任何部分后重复尝试选择部分进行合并之前的最大等待时间。较低的设置将导致在大型集群中频繁触发后台调度池中的选择任务，从而导致大量请求到 ZooKeeper。
## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
当池中的合并与 TTL 条目数量超过指定数量时，不要分配新合并与 TTL。这样可以将空闲线程留给常规合并，并避免 "Too many parts"。
## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每个副本的部分变更数量至指定数量。零表示每个副本的变更数量没有限制（仍可能受到其他设置的约束）。
## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，未做任何操作。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，未做任何操作。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制在一次查询中可以访问的分区数量的最大值。

在创建表时指定的设置值可以通过查询级别设置覆盖。

可能的值：
- 任何正整数。

您还可以在查询/会话/配置级别指定查询复杂程度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。
## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

如果所有分区中活动部分的总数量超过 `max_parts_in_total` 值，`INSERT` 将被中断，抛出 `Too many parts (N)` 异常。

可能的值：
- 任何正整数。

表中大量部分会降低 ClickHouse 查询的性能并增加 ClickHouse 启动时间。最常见的原因是设计错误（选择分区策略时出现错误 - 分区过小）。
## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

可同时合并的部分的最大数量（0 - 禁用）。对 OPTIMIZE FINAL 查询没有影响。
## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

对失败变更的最大推迟时间。
## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>


对失败复制提取的最大推迟时间。
## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing merge tasks in the replication queue."}]}]}/>


对失败复制合并的最大推迟时间。
## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>


对失败复制任务的最大推迟时间。该值在任务不是提取、合并或变更时使用。
## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

合并树投影的最大数量。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制 [replicated](../../engines/table-engines/mergetree-family/replication.md) 提取的网络交换最大速度（以字节每秒为单位）。该设置应用于特定表，不同于 [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置，该设置应用于服务器。

您可以限制服务器网络和特定表的网络，但为此，表级设置的值应小于服务器级设置的值。否则，服务器仅考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置并不会被严格遵循。

可能的值：

- 正整数。
- `0` — 无限。

默认值：`0`。

**用法**

可用于在将数据复制到新节点时限制速度。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果有不活跃副本，ClickHouse Keeper 日志中可能包含多少条记录。当这一数字超过时，不活跃副本会变得丢失。

可能的值：
- 任何正整数。
## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree 队列中允许的合并和变更任务的最大数量。
## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree 队列中允许的具有 TTL 的合并部分任务的最大数量。
## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree 队列中允许的变更部分任务的最大数量。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制 [replicated](/engines/table-engines/mergetree-family/replacingmergetree) 发送的网络交换最大速度（以字节每秒为单位）。该设置应用于特定表，不同于 [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置，该设置应用于服务器。

您可以限制服务器网络和特定表的网络，但为此，表级设置的值应小于服务器级设置的值。否则，服务器仅考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置并不会被严格遵循。

可能的值：

- 正整数。
- `0` — 无限。

**用法**

可用于在将数据复制到新节点时限制速度。
## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中的损坏部分数量超过 `max_suspicious_broken_parts` 值，则自动删除被拒绝。

可能的值：
- 任何正整数。
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏部分的最大大小，如果超过，则拒绝自动删除。

可能的值：
- 任何正整数。
## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

从合并部分读取到内存的行数。

可能的值：
- 任何正整数。

合并从部分中以 `merge_max_block_size` 行块读取行，然后合并并将结果写入新部分。读取的块放置在 RAM 中，因此 `merge_max_block_size` 影响合并所需的 RAM 大小。因此，对于行非常宽的表，合并可能消耗大量 RAM （如果平均行大小为 100kb，那么在合并 10 个部分时，(100kb * 10 * 8192) = ~ 8GB 的 RAM）。通过减少 `merge_max_block_size`，您可以减少合并所需的 RAM，但会延缓合并过程。
## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

合并操作中应该形成的块大小（字节数）。默认值与 `index_granularity_bytes` 相同。
## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。合并时预热缓存的部分（紧凑或打包）的最大大小。
## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

在尝试再次选择要合并的部分之前需要等待的最短时间。如果设置的时间较短，将导致在大规模集群中频繁触发选择任务，从而向 Zookeeper 发出大量请求。
## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

当没有合并内容时，合并选择任务的延迟时间乘以此因子，并在分配合并时除以该因子。
## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

选择用于合并分配的部分的算法。
## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
影响分配合并的写放大（专家级设置，如果您不明白它的作用，请不要更改）。适用于简单和随机简单合并选择器。
## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

控制相对于分区中部分数量的逻辑启动时机。因子越大，反应越迟钝。
## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用用于选择合并部分的启发式方法，该方法从范围的右侧移除小部分，如果它们的大小小于指定比率（0.01）总和的比率。适用于简单和随机简单合并选择器。
## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一次查看多少部分。
## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。合并时要预热缓存的部分的最大总大小。
## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
过时的设置，无任何效果。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧部分、WAL 和变更清理的时间间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理的时间间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，无任何效果。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

重复合并带有重新压缩 TTL 的最小延迟（以秒为单位）。
## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

重复合并带有删除 TTL 的最小延迟（以秒为单位）。
## merge_workload {#merge_workload} 


用于调节合并和其他工作负载之间资源的使用和共享。指定的值用作此表后端合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

关闭、停止处理请求并且在状态检查期间不返回 Ok 的最小绝对延迟。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

是否应仅在整个分区上应用 `min_age_to_force_merge_seconds` 而不是在子集上。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- true，false
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个部分都比 `min_age_to_force_merge_seconds` 的值更旧，则合并部分。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- 正整数。
## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，无任何效果。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整存储类型的数据部分的最小未压缩大小，而不是打包存储。
## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以存储在 `Wide` 格式中的数据部分的最小字节/行数。您可以设置其中一个、两个或者都不设置这些设置。
## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


预热新的部分的标记缓存和主索引缓存的最小大小（未压缩字节）。
## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新大部分分配到磁盘卷 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)  时触发负载均衡的最小字节数。

可能的值：

- 正整数。
- `0` — 禁用平衡。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值应不小于 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) / 1024 的值。否则，ClickHouse 会抛出异常。
## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

写入下一个标记时进行压缩所需的未压缩数据块的最小大小。您还可以在全局设置中指定此设置（见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。在创建表时指定的值会覆盖此设置的全局值。
## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在提取之后进行 fsync 操作所需的最小压缩字节数（0 - 禁用）。
## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在合并之后进行 fsync 操作所需的最小压缩字节数（0 - 禁用）。
## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

如果单个分区中有很多未合并部分，插入数据到 MergeTree 表的最小延迟（以毫秒为单位）。
## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

如果有很多未完成的变更，合并树表的最小变更延迟（以毫秒为单位）。
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

执行插入数据所需的磁盘空间的最小可用字节数。如果可用的自由字节数小于 `min_free_disk_bytes_to_perform_insert`，则会抛出异常，插入操作不会执行。请注意，此设置：
- 考虑了 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将要写入的数据量。
- 仅在指定了正（非零）字节的情况下进行检查。

可能的值：
- 任何正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，ClickHouse 将选择允许在更大数量的可用内存上进行插入的值。
:::
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 所需的最小自由与总磁盘空间的比率。必须是介于 0 和 1 之间的浮点值。请注意，此设置：
- 考虑了 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将要写入的数据量。
- 仅在指定了正（非零）比率的情况下进行检查。

可能的值：
- 浮点数，0.0 - 1.0

请注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`，ClickHouse 将选择允许在更大数量的可用内存上进行插入的值。
## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

最小允许的数据粒度大小（字节）。

用于防止意外创建具有非常低的 `index_granularity_bytes` 的表。
## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

查询读取的最小标记数，用于应用 [max_concurrent_queries](#max_concurrent_queries) 设置。

:::note
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。
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

进行合并操作所需的最小数据量，以便可以对存储磁盘使用直接 I/O 访问。当合并数据部分时，ClickHouse 计算所有要合并的数据的总存储量。如果该总量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 将通过直接 I/O 接口（`O_DIRECT` 选项）读取和写入数据。如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。
## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器一次可以选择合并的最小数据部分数量（专家级设置，如果您不明白它的作用，请不要更改）。0 - 禁用。适用于简单和随机简单合并选择器。
## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

从其他副本关闭的最小延迟，停止处理请求并且在状态检查期间不返回 Ok。
## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

仅当绝对延迟不小于此值时，计算相对副本延迟。
## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
过时的设置，无任何效果。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约这个数量的最后记录，即使它们已经过时。它不影响表的工作：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：
- 任何正整数。
## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，无任何效果。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整存储类型的数据部分所需的最小行数，而不是打包存储。
## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

创建宽格式部分而不是紧凑部分所需的最小行数。
## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并之后进行 fsync 操作所需的最小行数（0 - 禁用）。
## mutation_workload {#mutation_workload} 


用于调节变更和其他工作负载之间资源的使用和共享。指定的值用作此表后端变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在非复制的 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中存储的最新插入块的数量，用于检查重复项的哈希和。

可能的值：
- 任何正整数。
- `0`（禁用去重）。

去重机制类似于复制表（见 [replicated_deduplication_window](#replicated_deduplication_window) 设置）。创建的部分的哈希和写入本地文件。
## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


通知 SharedJoin 或 SharedSet 最新块编号。仅在 ClickHouse Cloud 中可用。
## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

当池中可用的自由条目数量少于指定数量时，请勿执行部分变更。这是为了留出自由线程以供常规合并使用，并避免“部分过多”的错误。

可能的值：
- 任何正整数。

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 会抛出异常。
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

当池中可用的自由条目数量少于指定数量时，请勿在后台执行整个分区的优化（此任务在设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成）。这是为了留出自由线程以供常规合并使用，并避免“部分过多”。

可能的值：
- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 会抛出异常。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或复制队列）中可用的自由条目少于指定数量时，开始降低处理的最大合并大小（或放入队列中）。这是为了允许小型合并处理，而不让池充满长时间运行的合并。

可能的值：
- 任何正整数。
## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
如果表的未完成变更数量至少达到该值，则人为地减慢表的变更速度。设置为 0 时禁用。
## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表的未完成变更数量至少达到该值，则抛出“变更过多”的异常。设置为 0 时禁用。
## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。最多 N 个分区我们将考虑用于合并。随机加权方式选择的分区，其中权重为可以在该分区合并的数据部分数量。
## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

存储非活动部分的时间（以秒为单位），以防止在服务器自发重启期间数据丢失。

可能的值：
- 任何正整数。

在将多个部分合并为新部分后，ClickHouse 将原始部分标记为非活动，并仅在经过 `old_parts_lifetime` 秒后删除它们。如果不活动部分未被当前查询使用，即其 `refcount` 为 1，则会移除这些部分。

在新部分的 `fsync` 未调用的情况下，新部分特定时间内仅存在于服务器的 RAM（操作系统缓存）中。如果服务器自发重启，则新部分可能会丢失或遭到损坏。为了保护数据，非活动部分不会立即删除。

启动时，ClickHouse 检查部分的完整性。如果合并后的部分损坏，则 ClickHouse 将原始的非活动部分返回到活动列表中，并随后再次合并它们。然后，损坏的部分被重命名（添加 `broken_` 前缀）并移动到 `detached` 文件夹中。如果合并后的部分没有损坏，则将原始的非活动部分重命名（添加 `ignored_` 前缀）并移动到 `detached` 文件夹中。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（记录数据仅存储在 RAM 中的最大时间），但在磁盘系统负载重时，数据可以在很晚被写入。经过实验，选择 `old_parts_lifetime` 的值为 480 秒，这段时间内有保证新部分被写入到磁盘中。
## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入期间是否应优化行顺序，以提高新插入表部分的压缩性。

仅对普通 MergeTree 引擎表有效。对于专门的 MergeTree 引擎表（例如 CollapsingMergeTree），无效。

MergeTree 表使用 [压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 进行（可选）压缩。通用压缩编解码器，例如 LZ4 和 ZSTD，在数据暴露模式的情况下实现最大压缩率。相同值的长串通常可以很好地压缩。

如果启用此设置，ClickHouse 尝试以减少新插入部分中相同值运行次数的行顺序存储数据。换句话说，较少的相同值运行意味着单个运行较长并且压缩效果良好。

找到最佳的行顺序在计算上是不可行的（NP 难）。因此，ClickHouse 使用启发式快速找到一种行顺序，该行顺序改进了与原始行顺序相比的压缩比率。

<details markdown="1">

<summary>寻找行顺序的启发式方法</summary>

通常可以自由地对表（或表部分）的行进行洗牌，因为 SQL 认为以不同的行顺序的相同表（表部分）是等效的。

当为表定义主键时，这种行的洗牌自由度受到限制。在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制要求表行按照列 `C1`, `C2`, ... `Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。结果是，行只能在行的"等价类"内重新洗牌，即在主键列中具有相同值的行。直观上说，具有高基数的主键（例如，涉及 `DateTime64` 时间戳列的主键）会导致许多小的等价类。同样，具有低基数的主键的表则创建了几乎所有部分的较少且更大的等价类。没有主键的表表示一个“等价类”的极端情况，跨越所有行。

等价类越少、越大，重新洗牌时的自由度越高。

用于在每个等价类内找到最佳行顺序的启发式方法是 D. Lemire 和 O. Kaser 提出的，在[为更小的索引重新排序列](https://doi.org/10.1016/j.ins.2011.02.002)，并基于将每个等价类中的行按非主键列的升序基数排序。

它执行三个步骤：
1. 根据主键列中的行值查找所有等价类。
2. 对于每个等价类，计算（通常估算）非主键列的基数。
3. 对于每个等价类，以非主键列基数的升序排列行。

</details>

如果启用插入操作，需要额外的 CPU 成本来分析和优化新数据的行顺序。根据数据特性，预计 INSERT 需要多 30-50% 的时间。LZ4 或 ZSTD 的压缩比率平均提高 20-40%。

此设置最适合没有主键或具有低基数主键的表，即主键值只有少数不同的表。具有高基数主键（例如，涉及 `DateTime64` 类型的时间戳的主键）并不期望受益于此设置。
## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动部分之前/之后等待的时间。
## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

实验性/不完整功能，用于在分片之间移动部分。未考虑分片表达式。
## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中活动部分的数量超过 `parts_to_delay_insert` 值，则 `INSERT` 被人为延迟。

可能的值：
- 任何正整数。

ClickHouse 人工延长 `INSERT` 操作（增加 "休眠"），使得后台合并进程可以比添加部分更快地合并部分。
## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中活动部分的数量超过 `parts_to_throw_insert` 值，则 `INSERT` 在抛出“部分过多（N）。合并处理速度明显慢于插入”的异常时被中断。

可能的值：
- 任何正整数。

为了实现 `SELECT` 查询的最大性能，必须最小化处理的部分数量，见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版之前，此设置设为 300。您可以设置更高的不同值，这将减少 `Too many parts` 错误的概率，但同时 `SELECT` 的性能可能会下降。并且在合并问题的情况下（例如，由于磁盘空间不足），您会比使用的原始 300 版本更晚发现它。
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果部分的总大小超过此阈值，并且自复制日志条目创建以来经过的时间超过 `prefer_fetch_merged_part_time_threshold`，则优先从副本中提取合并的部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建以来经过的时间超过此阈值，并且部分的总大小大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本中提取合并的部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
如果为真，则通过在插入、合并、提取和服务器启动时将标记保存到标记缓存来预热标记缓存。
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为真，则通过在插入、合并、提取和服务器启动时将标记保存到标记缓存来预热主索引缓存。
## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主压缩块大小，压缩块的实际大小。
## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

主键使用的压缩编码，由于主键足够小并被缓存，因此默认压缩为 ZSTD(3)。
## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
首次使用时在内存中加载主键，而不是在表初始化时。这可以在存在大量表的情况下节省内存。
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

如果数据部分中主键列的值在此比例内变化，则跳过在内存中加载后续列。这可以通过不加载无用的主键列来节省内存使用。
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 _default_ 值与 _all_ 值的最小比例。设置此值会导致列使用稀疏序列化进行存储。

如果一列是稀疏的（主要包含零），ClickHouse 可以将其编码为稀疏格式并自动优化计算 —— 数据在查询过程中不需要完全解压。要启用此稀疏序列化，需要将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果值大于或等于 1.0，则列将始终使用正常的完全序列化进行写入。

可能的值：

- 在 `0` 和 `1` 之间的浮点数以启用稀疏序列化
- `1.0`（或更大）如果不希望使用稀疏序列化

**示例**

请注意，下面表格中的 `s` 列在 95% 的行中是空字符串。在 `my_regular_table` 中，我们没有使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

请注意，在 `my_sparse_table` 中，`s` 列在磁盘上占用更少的存储空间：

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

您可以通过查看 `system.parts_columns` 表的 `serialization_kind` 列来验证某列是否使用稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

您可以查看哪些部分的 `s` 是使用稀疏序列化存储的：

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


仅在 ClickHouse Cloud 中可用。没有丢弃/替换范围后，再次尝试减少阻塞部分之前要等待的最短时间。较低的设置会频繁触发后台调度池中的任务，这在大规模集群中会导致向 zookeeper 发送大量请求。
## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>


如果大于零 - 刷新底层文件系统中的数据部分列表，以检查数据是否在后台更新。
仅在表位于只读磁盘上时可以设置（这意味着这是一个只读副本，而数据由另一个副本写入）。
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

当此设置的值大于零时，只有单个副本会立即启动合并，如果共享存储上的合并部分，并且启用了 `allow_remote_fs_zero_copy_replication`。

:::note
零拷贝复制尚未准备好用于生产环境
在 ClickHouse 版本 22.8 及更高版本中，默认情况下禁用零拷贝复制。

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

零拷贝表无关信息的 ZooKeeper 路径。
## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

在通过 TTL、变更或合并算法修剪后删除空部分。
## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

不完整实验功能的设置。
## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


在后台删除应用于所有活动部分的补丁部分。
## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名太长（超过 'max_file_name_length' 字节），则将其替换为 SipHash128。
## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，则此节点上的复制表副本将尝试获取领导权。

可能的值：
- `true`
- `false`
## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ClickHouse Keeper 存储的最近插入的块数，以检查重复项的哈希值。

可能的值：
- 任何正整数。
- 0（禁用去重）

`Insert` 命令会创建一个或多个块（部分）。对于[插入去重](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 会将创建部分的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的 `replicated_deduplication_window` 块。最旧的哈希值从 ClickHouse Keeper 中删除。

较大的 `replicated_deduplication_window` 会减慢 `Inserts`，因为需要比较更多条目。哈希值是从字段名称和类型的组合以及插入部分的数据（字节流）计算得出的。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 存储的最近异步插入块数，以检查重复项的哈希值。

可能的值：
- 任何正整数。
- 0（禁用异步插入去重）

[异步插入](/operations/settings/settings#async_insert) 命令将在一个或多个块（部分）中缓存。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在写入复制表时，ClickHouse 会将每个插入的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的 `replicated_deduplication_window_for_async_inserts` 块。最旧的哈希值从 ClickHouse Keeper 中删除。
较大的 `replicated_deduplication_window_for_async_inserts` 会减慢 `异步插入`，因为需要比较更多条目。
哈希值是从字段名称和类型的组合以及插入数据（字节流）计算得出的。
## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

插入块的哈希值从 ClickHouse Keeper 中删除的秒数。

可能的值：
- 任何正整数。

类似于[replicated_deduplication_window](#replicated_deduplication_window)，`replicated_deduplication_window_seconds` 指定存储插入去重哈希值的时间长度。超过 `replicated_deduplication_window_seconds` 的哈希值将从 ClickHouse Keeper 中删除，即使它们少于 `replicated_deduplication_window`。

该时间是相对于最近记录的时间，而不是墙上时间。如果这是唯一的记录，它将被永久存储。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

异步插入的哈希值从 ClickHouse Keeper 中删除的秒数。

可能的值：
- 任何正整数。

类似于[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)，`replicated_deduplication_window_seconds_for_async_inserts` 指定存储异步插入去重哈希值的时间长度。超过 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希值将从 ClickHouse Keeper 中删除，即使它们少于 `replicated_deduplication_window_for_async_inserts`。

该时间是相对于最近记录的时间，而不是墙上时间。如果这是唯一的记录，它将被永久存储。
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无效。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无效。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时设置，无效。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

可以合并并在一个 MUTATE_PART 条目中执行的最大变更命令数（0 表示无限制）。
## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
过时设置，无效。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无效。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误部分与总部分的比率低于此比例 - 允许开始。

可能的值：
- 浮点数，0.0 - 1.0。
## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


在 ZooKeeper 中启用每个副本创建 /metadata 和 /columns 节点。
仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

停止共享合并树的合并分配。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>


启用协调合并策略。
## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


启用将属性写入虚拟部分并在 Keeper 中提交块。
## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


启用过时部分检查。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>


在共享合并树中，在没有被 ZooKeeper 监视触发的情况下更新部分的时间间隔（以秒为单位）。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>


部分更新的初始退避时间。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>


服务器间 HTTP 连接超时。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>


服务器间 HTTP 通信超时。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


在共享合并树的 leader 更新周期中添加 0 到 x 秒之间均匀分布的值，以避免轰动效应。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>


重新检查部分更新的最大时间。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>


最大过时部件数量，leader 将尝试在一次 HTTP 请求中确认删除。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>


部分更新的最大退避时间。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>


部分更新的最大领导者数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>


每个可用区的最大部分更新领导者数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


参与部分删除（杀手线程）的最大副本。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>


尝试分配潜在冲突合并的最大副本数量（允许避免合并分配中的冗余冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max broken parts for SMT, if more - deny automatic detach"}]}]}/>


SMT 的最大损坏部分数量，如果超出 - 拒绝自动分离。
## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max size of all broken parts for SMT, if more - deny automatic detach"}]}]}/>


SMT 最大损坏部分的总大小，如果超出 - 拒绝自动分离。
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>


存储插入记忆化 ID 的时间，以避免在插入重试期间发生错误操作。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>


合并协调员选举线程运行之间的时间。
## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "2"},{"label": "New setting"}]}]}/>


协调员线程延迟的时间变化因子。
## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并协调员与 zookeeper 同步以获取最新元数据的频率。
## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>


协调员可以从 MergerMutator 一次请求的合并数量。
## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并协调员线程运行之间的最大时间。
## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


协调员应准备并分发到工作线程的合并条目数。
## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


合并协调员线程运行之间的最小时间。
## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


如果需要在紧急操作后更新状态，则合并工作线程将使用的超时。
## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并工作线程运行之间的时间。
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate partions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>` 比率高于设置值时，将重新加载合并谓词。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一次调度的获取部分元数据作业数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


在不启动包含此部分的新合并的情况下，保留本地合并部分的时间。为其他副本提供机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>


合并后，以行数为单位推迟分配下一个合并的部分的最小大小。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


在不启动包含此部分的新合并的情况下，保留本地合并部分的时间。为其他副本提供机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


在可能的情况下，从 leader 读取虚拟部分。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting to fetch parts data from other replicas"}]}]}/>


如果启用，所有副本将尝试从其他已存在的副本获取部分内存数据（例如主键、分区信息等）。
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


启用从其他副本的内存缓存请求文件系统缓存提示。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


使用过时部分的紧凑格式：减少对 Keeper 的负载，改善过时部分的处理。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


如果启用，过多部分计数将依赖于 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果有很多过时部分，清理线程将尝试在一次迭代中删除多达 `simultaneous_parts_removal_limit` 个部分。
`simultaneous_parts_removal_limit` 设置为 `0` 意味着无限制。
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

用于测试。请勿更改。
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

用于测试。请勿更改。
## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略的名称。
## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>


这是表盘，路径/端点应指向表数据，而不是指向数据库数据。仅可为 s3_plain/s3_plain_rewritable/web 设置。
## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

暂存/tmp_目录的存储时间（以秒为单位）。您不应降低此值，因为合并和变更可能无法处理设置值过低的情况。
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

尝试获取重压缩部分之前的超时（以秒为单位）。在此期间，ClickHouse 会尝试从分配了此合并的副本中获取重压缩部分。

重压缩在大多数情况下工作缓慢，因此我们不会在此超时之前启动重压缩合并，并尝试从分配了此合并的副本中获取重压缩部分。

可能的值：
- 任何正整数。
## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制当该部分中的所有行根据其 `TTL` 设置过期时，MergeTree 表是否完全删除数据部分。

当 `ttl_only_drop_parts` 被禁用（默认情况下）时，仅根据其 TTL 设置过期的行会被删除。

当 `ttl_only_drop_parts` 被启用时，如果该部分中的所有行根据其 `TTL` 设置过期，则整个部分会被删除。
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

在写入动态子列期间允许使用自适应写入缓冲区，以减少内存使用。
## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，我们缓存异步插入的哈希值。

可能的值：
- `true`
- `false`

一个包含多个异步插入的块将生成多个哈希值。
当一些插入重复时，Keeper 只会在一个 RPC 中返回一个重复的哈希值，这会导致不必要的 RPC 重试。
此缓存将监视 Keeper 中的哈希值路径。如果在 Keeper 中监视到更新，缓存将尽快更新，以便我们能够在内存中过滤重复的插入。
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用变体数据类型中判别器的紧凑二进制序列化模式。
此模式允许在主要是一种变体或有很多 NULL 值的部分中，为存储判别器使用显著更少的内存。
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个部分使用恒定粒度。可以压缩内存中的索引粒度值。这在极大的工作负载和稀疏表中会非常有用。
## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时设置，无效。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中使用小格式（十几个字节）而不是普通格式（几十 KB）来进行部分校验和。在启用之前，请确保所有副本支持新格式。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 中数据部分头的存储方法。如果启用，ZooKeeper 将存储更少的数据。详情，请参见 [这里](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。
## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

使用主键缓存，而不是将所有索引保存在内存中。对于非常大的表，可能会非常有用。
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

激活垂直合并算法所需的最小（近似）未压缩字节大小。
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

激活垂直合并算法所需的最少非主键列数。
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

激活垂直合并算法所需的最小（近似）行数总和。
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，在合并期间从远程文件系统预先提取下一个列的数据。
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭之前，表将等待所需的时间以获取唯一部分（仅存在于当前副本）被其他副本抓取（0 意味着禁用）。
## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
过时设置，无效。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
过时设置，无效。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
过时设置，无效。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时设置，无效。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>


允许在紧凑部分中为每个子流写入标记，而不是为每列写入标记。
这使得有效地从数据部分读取单个子列成为可能。
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

为获得更小的独立范围而推迟删除的最大顶级部分比例。建议不进行更改。
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

将独立过时部分范围拆分为更小子范围的最大递归深度。建议不进行更改。
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用零拷贝复制，则在尝试锁定之前，依据部分大小随机延迟一段时间以进行合并或变更。
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


如果启用零拷贝复制，则在尝试进行合并或变更的锁定之前，随机延迟最多 500 毫秒。
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期，单位为秒。

可能的值：
- 任何正整数。
