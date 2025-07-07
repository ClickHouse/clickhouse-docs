---
'description': '在 `system.merge_tree_settings` 中的 MergeTree 设置'
'slug': '/operations/settings/merge-tree-settings'
'title': 'MergeTree 表设置'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示了全局设置的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分设置，也可以在 `CREATE TABLE` 语句的 `SETTINGS` 子句中单独为每个 `MergeTree` 表指定。

定制设置 `max_suspicious_broken_parts` 的示例：

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
## MergeTree settings {#mergetree-settings}
<!-- 以下设置是由脚本自动生成的，文件地址为 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

自适应写入缓冲区的初始大小
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，以仅允许有效值（`1` 和 `-1`）。
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用时，会为表的所有数值列添加最小-最大（跳过）索引。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用时，会为表的所有字符串列添加最小-最大（跳过）索引。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

允许使用 `is_deleted` 列的 ReplacingMergeTree 的实验性清理合并。启用时，允许使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有部分合并为单一部分，并删除任何已删除行。

还允许通过设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 在后台自动进行此类合并。
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

启用在 MergeTree 排序键中支持降序排序。此设置对于时间序列分析和 Top-N 查询特别有用，允许数据按逆时间顺序存储，以优化查询性能。

启用 `allow_experimental_reverse_key` 后，您可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得在降序查询中可以使用更有效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

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

通过在查询中使用 `ORDER BY time DESC`，应用了 `ReadInOrder`。

**默认值：** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许浮点数作为分区键。

可能的值：
- `0` — 不允许浮点分区键。
- `1` — 允许浮点分区键。
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许 Nullable 类型作为主键。
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Now SMT will remove stale blocking parts from ZooKeeper by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

减少共享合并树表的阻塞部分的后台任务。仅在 ClickHouse Cloud 中可用
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

请勿在生产中使用此设置，因为它尚未准备好。
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting to allow summing of partition or sorting key columns"}]}]}/>

启用时，允许在 SummingMergeTree 表中的求和列用于分区或排序键。
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

拒绝具有相同表达式的主索引/辅助索引和排序键。
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许从紧凑部分到宽部分的垂直合并。此设置必须在所有副本上具有相同的值。
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，则此副本从不合并部分，而是始终从其他副本下载合并后的部分。

可能的值：
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

在变更/替换/分离等操作中始终复制数据而不是硬链接。
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为真，则在合并时应用补丁部分。
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用时，将为每个新部分分配唯一的部分标识符。在启用之前，请检查所有副本是否支持 UUID 版本 4。
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代将等待 async_block_ids_cache 更新的时间。
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，则来自 INSERT 查询的数据存储在队列中，稍后在后台刷新到表中。
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或变更一步的目标执行时间。如果一步所需时间较长，则可以超出此时间。
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当禁用 `cache_populated_by_fetch`（默认设置）时，仅当执行需要这些部分的查询时，新数据部分才会加载到缓存中。

如果启用，`cache_populated_by_fetch` 将导致所有节点将新数据部分从存储加载到其缓存中，而无需查询作为触发此操作的条件。

**另请参见**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果不为空，则仅与此正则表达式匹配的文件在获取后会预热到缓存中（如果启用 `cache_populated_by_fetch`）。
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
过时设置，不执行任何操作。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用在表创建时检查采样列或采样表达式的数据类型是否正确。数据类型必须为无符号的
[整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：
- `true`  — 启用检查。
- `false` — 在表创建时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在表创建时检查采样列或采样表达式的数据类型。如果您已经有带有不正确采样表达式的表，并且不希望服务器在启动时引发异常，请将 `check_sample_column_is_correct` 设置为 `false`。
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
过时设置，不执行任何操作。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、块哈希和部分的最小时间。
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

将从 0 到 x 秒的均匀分布值添加到 cleanup_delay_period，以避免骤然集中效应和随后的 ZooKeeper 的拒绝服务。
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的首选批量大小（点是抽象的，但 1 点大约相当于 1 个插入的块）。
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />

用于清理过时线程的线程。仅在 ClickHouse Cloud 中可用。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>

在第一次请求时懒惰地计算列和辅助索引大小，而不是在表初始化时。
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

要预热标记缓存的列列表（如果启用）。为空表示所有列。
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。紧凑部分中单个条带中写入的最大字节数。
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。紧凑部分中单个条带中写入的最大粒度数。
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。合并期间读取的紧凑部分的最大大小，读取到内存中。
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许创建一个主键中不包含采样表达式的表。这仅在暂时允许与错误表一起运行服务器以实现向后兼容时需要。
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

标记支持压缩，减少标记文件大小并加快网络传输。
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，减少主键文件大小并加快网络传输。
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

仅在不活跃数据部分数量至少为此时，激活并发部分移除（见 ‘max_part_removal_threads’）。
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为非经典的 MergeTree 创建投影，即不是（Replicated, Shared）MergeTree。忽略选项仅出于兼容性，这可能导致不正确的答案。否则，如果允许，合并投影时是什么操作，是删除还是重建。因此经典的 MergeTree 将忽略此设置。它还控制 `OPTIMIZE DEDUPLICATE`，但对所有 MergeTree 家族成员都有影响。与选项 `lightweight_mutation_projection_mode` 类似， 它也是分级的。

可能的值：
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

指定如果在表声明中没有为特定列定义压缩编解码器，则使用的默认压缩编解码器。
列的压缩编解码器选择顺序：
1. 在表声明中为列定义的压缩编解码器
2. 在 `default_compression_codec` 中定义的压缩编解码器（此设置）
3. 在 `compression` 设置中定义的默认压缩编解码器
默认值：空字符串（未定义）。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并或变更后，如果其不与其他副本上的数据部分字节相同，则启用或禁用副本上数据部分的分离。如果禁用，则会移除数据部分。如果您希望稍后分析此类部分，请启用此设置。

该设置适用于启用
[数据复制](/engines/table-engines/mergetree-family/replacingmergetree)的 `MergeTree` 表。

可能的值：

- `0` — 部分会被移除。
- `1` — 部分会被分离。
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失的副本时，不移除旧的本地部分。

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

启用为每行持久化列 _block_number。
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并时持久化虚拟列 `_block_number`。
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果可能，则在内存中压缩索引粒度的值。
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Added new setting to limit max bytes for min_age_to_force_merge."}]}]}/>

如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应尊重设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用过渡以通过 `index_granularity_bytes` 设置控制粒度大小。在 19.11 版本之前，只有 `index_granularity` 设置用于限制粒度大小。`index_granularity_bytes` 设置改善了 ClickHouse 在选择来自大行（数十和数百兆字节）表的数据时的性能。如果您有大行的表，可以为该表启用此设置，以提高 `SELECT` 查询的提效。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

是否在将分区合并为单一部分时对 ReplacingMergeTree 使用清理合并。要求启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的值：
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

为复制的合并树表启用带有 Zookeeper 名称前缀的端点 ID。
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

启用使用垂直合并算法。
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果在分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表上启用了此设置，则源表和目标表之间的索引和投影必须是相同的。否则，目标表可以具有源表的索引和投影的超集。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，将在选择合并部分时，使用估计的实际数据部分大小（即，排除通过 `DELETE FROM` 已删除的行）。请注意，这种行为仅在此设置启用后执行的 `DELETE FROM` 影响的数据部分触发。

可能的值：
- `true`
- `false`

**另请参见**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 设置
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

当此设置的值大于零时，仅单个副本立即开始合并，其他副本最多等待该时段下载结果，而不是进行本地合并。如果选择的副本在此段时间内未完成合并，则回退到标准行为。

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

要保留的关于已完成变更的记录数量。如果为零，则保留所有记录。
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

强制在合并时通过文件系统缓存读取数据。
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的部分执行 fsync。这会显著降低插入性能，不建议与宽部分一起使用。
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

对所有部分操作后（写入、重命名等）执行 fsync。
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时设置，不执行任何操作。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时设置，不执行任何操作。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果某个表单个分区中的不活跃部分数量超过 `inactive_parts_to_delay_insert` 值，则 `INSERT` 会被人工放慢。

:::tip
当服务器无法快速清理部分时，这很有用。
:::

可能的值：
- 任何正整数。
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果某个分区中的不活跃部分数量超过 `inactive_parts_to_throw_insert` 值， `INSERT` 将中断并产生以下错误：

> "不活跃部分过多（N）。部分清理处理显著慢于插入" 异常。

可能的值：
- 任何正整数。
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间的最大数据行数。即多少行对应一个主键值。
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

字节为单位的数据粒度的最大大小。

要仅通过行数限制粒度大小，请设置为 `0`（不推荐）。
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试时间，单位为秒。
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

默认情况下，轻量级删除 `DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。所以默认值为 `throw`。然而，此选项可以更改此行为。通过将值设置为 `drop` 或 `rebuild`，删除将在投影上工作。`drop` 将删除投影，因此在当前查询中可能很快，但在未来查询中可能会很慢，因为没有附加的投影。`rebuild` 将重建投影，这可能会影响当前查询的性能，但可能会加快未来查询的速度。一个好处是这些选项只会在部分级别上工作，这意味着未受影响的部分中的投影将保持完整，而不会触发任何类似删除或重建的操作。

可能的值：
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起启用，则将在表启动时计算现有数据部分的已删除行数。请注意，这可能会减慢表加载的启动时间。

可能的值：
- `true`
- `false`

**另请参见**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

用于后台操作，如合并、变更等。 在失败获取表锁之前的时间（以秒为单位）。
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块大小，实际要压缩的块的大小。
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

标记所使用的压缩编码，标记足够小且被缓存，因此默认压缩为 ZSTD(3)。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用时，合并构建并存储跳过索引以便于新部分的生成。否则，它们可以通过显式的 MATERIALIZE INDEX 创建/存储。
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

仅在 MATERIALIZE TTL 时重新计算 TTL 信息。
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 的 "过多部分" 检查仅在相关分区的平均部分大小不大于指定的阈值时有效。如果大于指定的阈值，则不会延迟或拒绝 INSERT。这允许在单台服务器上拥有数百 TB 的单个表，只要部分成功合并为更大的部分。这不会影响不活跃部分或总部分的阈值。
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

可合并为一部分的最大总部分大小（以字节为单位），如果有足够的资源可用。大致对应自动后台合并创建的最大可能部分大小。（0 表示禁用合并）

可能的值：

- 任何非负整数。

合并调度程序定期分析分区中的部分数量和大小，如果池中有足够的空闲资源，则启动后台合并。合并将持续直到源部分的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 启动的合并忽略 `max_bytes_to_merge_at_max_space_in_pool` （仅考虑可用磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

可合并为一部分的最大总部分大小（以字节为单位），与后台池中的最低资源可用。

可能的值：
- 任何正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了尽管可用磁盘空间不足，但仍可合并的部分的最大总大小（在池中）。这对于减少小部分的数量和 `Too many parts` 错误的发生是必要的。
合并使用合并部分大小的两倍来记录磁盘空间。
因此，在可用磁盘空间不足的情况下，可能出现可用空间的情况，但该空间已经被正在进行的大型合并预定，其他合并无法启动，随着每次插入小部分数量增加。
## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、块哈希和部分的最长时间。
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在写入表之前压缩的未经压缩数据块的最大大小。您也可以在全局设置中指定此设置（请参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值会覆盖此设置的全局值。
## max_concurrent_queries {#max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关联的最大并发执行查询数。查询仍然会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：
- 正整数。
- `0` — 无限制。

默认值：`0`（无限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```
## max_delay_to_insert {#max_delay_to_insert} 
<SettingsInfoBlock type="UInt64" default_value="1" />

在计算 `INSERT` 延迟时使用的值（单位为秒），如果单个分区中活动部分的数量超过 [parts_to_delay_insert](#parts_to_delay_insert) 值。

可能的值：
- 任何正整数。

`INSERT` 的延迟（以毫秒为单位）通过以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果分区有 299 个活动部分，而 parts_to_throw_insert = 300， parts_to_delay_insert = 150， max_delay_to_insert = 1， `INSERT` 被延迟为 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
毫秒。

从 23.1 版本开始，公式已更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```
例如，如果分区有 224 个活动部分，而 parts_to_throw_insert = 300， parts_to_delay_insert = 150， max_delay_to_insert = 1， min_delay_to_insert_ms = 10， `INSERT` 被延迟为 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果有很多未完成的变更，则 MergeTree 表的最大变更延迟（以毫秒为单位）。
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />

构建 GIN 索引时每个段的最大字节数。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

要保留如此大小的文件名而不进行哈希的最大长度。仅在启用设置 `replace_long_file_name_to_hash` 时生效。此设置的值不包括文件扩展名的长度。因此，建议将其设置在最大文件名长度（通常为 255 字节）以下，并留有一些间隙以避免文件系统错误。
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

如果用于修改（删除、添加）的文件数大于此设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

如果文件数大于此设置，则不适用删除的 ALTER。

可能的值：
- 任何正整数。
## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

可以并行刷新（合并时）的最大流（列）的数量（类似于 max_insert_delayed_streams_for_parallel_write）。仅适用于垂直合并。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

在尝试重新选择要合并的部分时，等待的最大时间。如果设置过小，将导致背景任务池中频繁触发选择任务，从而对大型集群中的 zookeeper 发出大量请求。
## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
当池中存在超过指定数量的带有 TTL 条目的合并时，不为新的带有 TTL 的合并分配线程。这是为了为常规合并保留空闲线程，并避免 "Too many parts"。
## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每个副本的部分变更数量。零表示每个副本对变更的数量没有限制（执行仍可能受其他设置的限制）。
## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，不执行任何操作。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
过时设置，不执行任何操作。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制在一次查询中可以访问的分区的最大数量。

在创建表时指定的设置值可以通过查询级设置覆盖。

可能的值：
- 任何正整数。

您还可以在查询/会话/配置级别指定查询复杂性设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。
## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

如果表的所有分区中活动部分的总数超过 `max_parts_in_total` 值， `INSERT` 将被中断，并出现 `Too many parts (N)` 异常。

可能的值：
- 任何正整数。

表中的大量部分会降低 ClickHouse 查询的性能并增加 ClickHouse 的启动时间。这通常是设计不当（选择分区策略时的错误 - 分区过小）的结果。
## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

可以一次合并的最大部分数（0 - 禁用）。不影响 OPTIMIZE FINAL 查询。
## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

失败变更的最大推迟时间。
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

失败的复制任务的最大推迟时间。如果任务不是抓取、合并或变更，则使用该值。
## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

最大合并树投影数。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每秒以字节为单位的 [replicated](../../engines/table-engines/mergetree-family/replication.md) 抓取的数据交换的最大速度。此设置适用于特定表，与适用于服务器的 [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置不同。

您可以限制服务器网络和特定表的网络，但为此表级设置的值应小于服务器级设置的值。否则，服务器仅考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置并未完全准确遵循。

可能的值：

- 正整数。
- `0` — 无限。

默认值：`0`。

**用法**

可以在将数据复制到新节点以添加或替换时用于限制速度。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果存在非活动副本，ClickHouse Keeper 日志中可以保留的记录数。超过此数字，将会丢失一个非活动副本。

可能的值：
- 任何正整数。
## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ReplicatedMergeTree 队列中允许的合并和变更部分的任务数量。
## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

ReplicatedMergeTree 队列中允许的与 TTL 相关的合并部分任务数量。
## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

ReplicatedMergeTree 队列中允许的变更部分的任务数量。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每秒以字节为单位的 [replicated](/engines/table-engines/mergetree-family/replacingmergetree) 发送的数据交换的最大速度。此设置适用于特定表，与适用于服务器的 [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置不同。

您可以限制服务器网络和特定表的网络，但为此表级设置的值应小于服务器级设置的值。否则，服务器仅考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置并未完全准确遵循。

可能的值：

- 正整数。
- `0` — 无限。

**用法**

可以在将数据复制到新节点以添加或替换时用于限制速度。
## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中的损坏部分数量超过 `max_suspicious_broken_parts` 值，则拒绝自动删除。

可能的值：
- 任何正整数。
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏部分的最大大小，如果超过则拒绝自动删除。

可能的值：
- 任何正整数。
## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

从合并的部分读取到内存中的行数。

可能的值：
- 任何正整数。

合并从部分中以 `merge_max_block_size` 行的块读取行，然后合并并将结果写入新部分。读取的块存放在 RAM 中，因而 `merge_max_block_size` 会影响合并所需 RAM 的大小。因此，对于非常宽的行的表，合并可能会消耗大量 RAM（如果平均行大小为 100kb，则在合并 10 个部分时，(100kb * 10 * 8192) = ~ 8GB 的 RAM）。通过减少 `merge_max_block_size`，可以减少合并所需的 RAM，但会降低合并速度。
## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

合并操作应形成的块的字节数。默认值与 `index_granularity_bytes` 相同。
## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。合并过程中预热缓存的部分（紧凑型或打包型）的最大大小。
## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

在没有选定部分后尝试再次选择部分以进行合并之前的最小等待时间。较低的设置将导致在大型集群中频繁触发后台调度池中的选择任务，这会导致大量对 Zookeeper 的请求。
## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

当没有可以合并的部分时，合并选择任务的睡眠时间乘以该因子，当分配了合并任务时则除以该因子。
## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于选择部分进行合并分配的算法。
## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />

影响分配合并的写放大（专家级设置，如不理解其作用请勿更改）。适用于简单和随机简单合并选择器。
## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

控制逻辑在分区中相对于部分数量的启动时机。因子越大，反应就越滞后。
## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用选择合并部分的启发式方法，从范围的右侧移除其大小小于指定比例（0.01）的部分。适用于简单和随机简单合并选择器。
## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一次查看的部分数量。
## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。合并过程中预热缓存的部分的最大总字节数。
## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
过时设置，未执行任何操作。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧部分、WAL 和变更的清理的秒数间隔。

可能的值：
- 任何正整数。
## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理的秒数间隔。

可能的值：
- 任何正整数。
## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，未执行任何操作。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在重复带有重新压缩 TTL 的合并之前的最小延迟（秒）。
## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在重复带有删除 TTL 的合并之前的最小延迟（秒）。
## merge_workload {#merge_workload} 

用于调节合并与其他工作负载之间的资源利用和共享。指定的值被用作此表的后台合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

关闭、停止服务请求并在状态检查时不返回 Ok 的最小绝对延迟。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

是否应仅在整个分区上应用 `min_age_to_force_merge_seconds`，而不是在子集上。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（请参阅 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- true, false
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个部分均超过 `min_age_to_force_merge_seconds` 的值，则合并部分。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（请参阅 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- 正整数。
## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，未执行任何操作。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。用于完整类型存储的数据部分的最小未压缩大小，而不是打包类型。
## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以存储在 `Wide` 格式中的数据部分的最小字节/行数。可以设置一个、两个或都不设置这些设置。
## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

预热标记缓存和新部分主索引缓存的最小大小（未压缩字节）。
## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

设置平衡时的最小字节数，以使新的大型部分能够在 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 磁盘上分配。

可能的值：

- 正整数。
- `0` — 禁用平衡。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不应小于 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 的值/ 1024。否则，ClickHouse 将抛出异常。
## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

写入下一个标记时进行压缩所需的未压缩数据块的最小大小。也可以在全局设置中指定此设置（请参阅 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。创建表时指定的值将覆盖该设置的全局值。
## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

获取后进行 fsync 的最小压缩字节数（0 - 禁用）。
## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后进行 fsync 的最小压缩字节数（0 - 禁用）。
## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

合并树表中插入数据的最小延迟（毫秒），如果单个分区中有很多未合并的部分。
## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

合并树表中变更的最小延迟（毫秒），如果存在大量未完成的变更。
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

插入数据所需的磁盘空间中的最小可用字节数。如果可用的空闲字节数少于 `min_free_disk_bytes_to_perform_insert`，则将抛出异常，且不执行插入。请注意，此设置：
- 考虑了 `keep_free_space_bytes` 设置。
- 不考虑将通过 `INSERT` 操作写入的数据量。
- 仅在指定的字节数为正（非零）时检查。

可能的值：
- 任何正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，ClickHouse 将计算允许在更大空闲内存中执行插入的值。
:::
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 所需的最小可用与总磁盘空间比率。必须是介于 0 和 1 之间的浮点值。请注意，此设置：
- 考虑了 `keep_free_space_bytes` 设置。
- 不考虑将通过 `INSERT` 操作写入的数据量。
- 仅在指定的比率为正（非零）时检查。

可能的值：
- 浮点数，0.0 - 1.0

请注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`，ClickHouse 将计算允许在更大空闲内存中执行插入的值。
## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

允许的数据颗粒的最小字节数。

提供了对意外创建具有非常低 `index_granularity_bytes` 的表的保护措施。
## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

应用 [max_concurrent_queries](#max_concurrent_queries) 设置时，查询读取的最小标记数量。

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

执行合并操作所需的最小数据量，用于直接 I/O 访问存储磁盘。当合并数据部分时，ClickHouse 计算所有要合并的数据的总存储量。如果该容量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 将通过直接 I/O 接口（`O_DIRECT` 选项）来读取和写入数据。如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。
## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器可以一次选择合并的最小数据部分数量（专家级设置，如不理解其作用请勿更改）。0 - 禁用。适用于简单和随机简单合并选择器。
## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

来自其他副本的最小延迟，以关闭、停止服务请求并在状态检查时不返回 Ok。
## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

仅在绝对延迟不小于该值的情况下计算相对副本延迟。
## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
过时设置，未执行任何操作。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约这些数量的最后记录，即使它们是过时的。它对表的工作没有影响：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：
- 任何正整数。
## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，未执行任何操作。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整类型存储的数据部分的最小行数，而不是打包类型。
## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

以宽格式创建部分而不是紧凑部分的最小行数。
## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后执行 fsync 的最小行数（0 - 禁用）。
## mutation_workload {#mutation_workload} 

用于调节变更与其他工作负载之间的资源利用和共享。指定的值被用作此表的后台变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)
## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

非复制 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中最近插入的块的数量，用于存储 hash 和检查重复项。

可能的值：
- 任何正整数。
- `0`（禁用去重）。

使用的去重机制与复制表相似（请参阅 [replicated_deduplication_window](#replicated_deduplication_window) 设置）。创建部分的哈希和写入到磁盘上的本地文件中。
## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

通知共享连接或共享集合的最新块编号。仅在 ClickHouse Cloud 中可用。
## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

当池中的可用空闲条目少于指定数量时，不执行部分变更。这样做是为了留出空闲线程用于常规合并，避免 "Too many parts" 错误。

可能的值：
- 任何正整数。

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 将抛出异常。
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

当池中的可用空闲条目少于指定数量时，不在后台执行优化整个分区的任务（当设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成此任务）。这样做是为了留出空闲线程用于常规合并，避免 "Too many parts" 错误。

可能的值：
- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 将抛出异常。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或复制队列）中的可用空闲条目少于指定数量时，开始降低处理（或放入队列的）合并的最大大小。这是为了允许小型合并进行处理，不填充池以进行长时间运行的合并。

可能的值：
- 任何正整数。
## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
如果表中至少存在那么多未完成的变更，则人工减慢表的变更速度。若设为 0 则禁用。
## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表中至少存在那么多未完成的变更，则抛出 "Too many mutations" 异常。若设为 0 则禁用。
## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。我们将考虑合并的最多 N 个分区。随机加权选择的分区，其中权重是可以合并的该分区中的数据部分数量。
## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

存储非活动部分的时间（以秒为单位），以保护数据不因服务器自发重启而丢失。

可能的值：
- 任何正整数。

在将几个部分合并为一个新部分后，ClickHouse 将原始部分标记为非活动，仅在 `old_parts_lifetime` 秒后删除。非活动部分在不被当前查询使用时被移除，即如果部分的 `refcount` 为 1。

在启动时，ClickHouse 会检查部分的完整性。如果合并部分损坏，ClickHouse 将把非活动部分返回到活动列表，稍后再次合并它们。然后，损坏的部分被重命名（添加前缀 `broken_`）并移动到 `detached` 文件夹。如果合并部分未损坏，那么原始非活动部分将被重命名（添加前缀 `ignored_`）并移动到 `detached` 文件夹。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）是 30 秒（写入数据仅存储在 RAM 中的最大时间），但在磁盘系统负载过重时，数据写入很晚。经过实验，选择了 480 秒作为 `old_parts_lifetime` 的值，在此期间新部分确保被写入磁盘。
## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入时是否应优化行的顺序，以提高新插入表部分的可压缩性。

仅对普通的 MergeTree 引擎表有效。对专用 MergeTree 引擎表（例如 CollapsingMergeTree）无效。

MergeTree 表使用 [压缩编码器](/sql-reference/statements/create/table#column_compression_codec) 进行压缩，压缩编解码器（如 LZ4 和 ZSTD）如果数据有模式，则可以达到最大压缩率。长重复的相同值通常能很好地压缩。

如果启用此设置，ClickHouse 会尝试以一种行顺序来存储新插入部分中的数据，使得新表部分各列之间长值重复的数量最小。换句话说，较少的等值运行意味着单个运行较长且压缩效果良好。

在查找最佳行顺序时是计算不可行的（NP 难），因此，ClickHouse 使用启发式方法迅速查找仍能提高压缩率的行顺序。

<details markdown="1">

<summary>查找行顺序的启发式方法</summary>

通常，可以自由地对表（或表的一部分）进行打乱，因为 SQL 认为不同的行顺序的相同表（部分）是等效的。

当为表定义了主键时，这种打乱的自由度受到限制。在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制要求表行按列 `C1`、`C2`、... `Cn` 排序（[聚集索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。因此，行只能在行的 "等价类" 内进行打乱，即在主键列中具有相同值的行。直觉是，具有高基数的主键（比如涉及 `DateTime64` 时间戳列的主键）会导致许多小的等价类。相反，具有低基数主键的表则创建少量且大的等价类。没有主键的表是一个极端情况，代表一个跨度所有行的单一等价类。

等价类越少，越大，重新打乱行的自由度就越高。

应用于查找每个等价类内最佳行顺序的启发式方法由 D. Lemire, O. Kaser 提出的 [调换列以缩小索引](https://doi.org/10.1016/j.ins.2011.02.002)，基于按非主键列的升序基数对每个等价类中的行进行排序。

它执行两个步骤：
1. 根据主键列中的行值找到所有等价类。
2. 对每个等价类，计算（通常估计）非主键列的基数。
3. 对于每个等价类，按升序非主键列基数的顺序对行进行排序。

</details>

如果启用，插入操作将增加额外的 CPU 成本，以分析和优化新数据的行顺序。根据数据特征，INSERT 操作预计将花费 30% 到 50% 的时间。
LZ4 或 ZSTD 的压缩率平均提高 20% 到 40%。

此设置最适合没有主键或具有低基数主键的表，即只有少量不同主键值的表。具有高基数主键的表（例如涉及 `DateTime64` 类型的时间戳列的）预计不会受益于此设置。
## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动部分之前/之后等待的时间。
## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

移动部分之间的分片的实验性/不完整功能。未考虑分片表达式。
## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活动部分数量超过 `parts_to_delay_insert` 值，则人工放慢 `INSERT` 操作。

可能的值：
- 任何正整数。

ClickHouse 会人为延长 `INSERT` 操作（增加 'sleep'），以便后台合并进程可以比添加的速度更快地合并部分。
## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活动部分数量超过 `parts_to_throw_insert` 值，则 `INSERT` 被打断，并抛出 `Too many parts (N). Merges are processing significantly slower than inserts` 异常。

可能的值：
- 任何正整数。

为了达到 `SELECT` 查询的最佳性能，必须尽量减少处理的部分数量，参见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前，此设置被设置为 300。您可以设置更高的不同值，它会减少出现 `Too many parts` 错误的概率，但同时 `SELECT` 性能可能会降低。此外，如果合并出现问题（例如，由于磁盘空间不足），您会比使用原始 300 发现得更晚。
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果部分的大小总和超过此阈值，并且从复制日志条目创建的时间大于 `prefer_fetch_merged_part_time_threshold`，则更倾向于从副本中提取合并部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

如果从复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建后的时间超过该阈值，并且部分的大小总和超过 `prefer_fetch_merged_part_size_threshold`，则更倾向于从副本中提取合并部分，而不是在本地进行合并。这是为了加速非常长的合并。

可能的值：
- 任何正整数。
## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
如果为真，标记缓存将通过在插入、合并、抓取和服务器启动时保存标记到标记缓存来进行预热。
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为真，主索引缓存将通过在插入、合并、抓取和服务器启动时保存标记到标记缓存来进行预热。
## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主压缩块大小，用于压缩的实际块大小。
## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

主使用的压缩编码，主键较小并已缓存，因此默认压缩为 ZSTD(3)。
## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
首次使用时加载主键而不是在表初始化时加载。在存在大量表的情况下，可以节省内存。
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

如果数据部分中主键列的某个值变化的比例至少达到此比率，则跳过将后续列加载到内存中。这使得通过不加载无用的主键列来节省内存使用。
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 _default_ 值与 _all_ 值的最小比例。设置此值会使列以稀疏序列化的方式存储。

如果某列是稀疏的（大多数是零），ClickHouse 可以以稀疏格式进行编码，并自动优化计算 - 数据在查询时不需要完全解压。要启用这种稀疏序列化，请将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果该值大于或等于 1.0，则列将始终使用正常的完整序列化进行写入。

可能的值：

- 在 `0` 和 `1` 之间的浮点数以启用稀疏序列化
- `1.0`（或更大）如果您不想使用稀疏序列化

**示例**

注意以下表中的 `s` 列在 95% 的行中都是空字符串。在 `my_regular_table` 中，我们不使用稀疏序列化，而在 `my_sparse_table` 中，我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

注意 `my_sparse_table` 中的 `s` 列在磁盘上使用的存储空间更少：

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

仅在 ClickHouse Cloud 中可用。未丢弃/替换任何范围后，尝试再次减少阻塞部分前的最小等待时间。较低的设置会频繁触发后台调度池中的任务，从而导致在大规模集群中出现大量请求到 zookeeper。

## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

如果大于零 - 刷新来自底层文件系统的数据部分列表，以检查数据是否在内部已经更新。仅当表位于只读磁盘上时（这意味着这是一个只读副本，而数据由另一个副本写入）才能设置。

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

当该设置的值大于零时，只有单个副本在合并部分存储在共享存储上并且启用了 `allow_remote_fs_zero_copy_replication` 时，立即启动合并。

:::note
零拷贝复制尚未准备好用于生产
在 ClickHouse 22.8 及更高版本中，默认情况下禁用零拷贝复制。

不建议在生产中使用此功能。
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

零拷贝表独立信息的 ZooKeeper 路径。

## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

在被 TTL、突变或合并算法修剪后，移除空部分。

## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

不完整实验功能的设置。

## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

在后台移除应用于所有活动部分的补丁部分。

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 'max_file_name_length' 字节），则将其替换为 SipHash128。

## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则此节点上的复制作副本将尝试获得领导权。

可能的值：
- `true`
- `false`

## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

ClickHouse Keeper 存储的用于检查重复项的最近插入块的数量的哈希值。

可能的值：
- 任何正整数。
- 0（禁用去重）。

`Insert` 命令会创建一个或多个块（部分）。对于[插入去重](../../engines/table-engines/mergetree-family/replication.md)，在写入复制作表时，ClickHouse 会将创建部分的哈希值写入 ClickHouse Keeper。哈希值仅存储最新的 `replicated_deduplication_window` 块。最旧的哈希值会从 ClickHouse Keeper 中移除。

较大的 `replicated_deduplication_window` 会降低 `Inserts` 的速度，因为需要比较更多条目。哈希值是根据字段名称、类型和插入部分数据（字节流）组成计算的。

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 存储的用于检查重复项的最近异步插入块的数量的哈希值。

可能的值：
- 任何正整数。
- 0（禁用异步插入的去重）。

[异步插入](/operations/settings/settings#async_insert)命令将被缓存到一个或多个块（部分）。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在写入复制作表时，ClickHouse 会将每个插入的哈希值写入 ClickHouse Keeper。哈希值仅存储最新的 `replicated_deduplication_window_for_async_inserts` 块。最旧的哈希值会从 ClickHouse Keeper 中移除。
较大的 `replicated_deduplication_window_for_async_inserts` 会降低 `异步插入` 的速度，因为需要比较更多条目。
哈希值是根据字段名称、类型和插入（字节流）数据的组成计算的。

## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

ClickHouse Keeper 中移除插入块的哈希值的秒数。

可能的值：
- 任何正整数。

与[replicated_deduplication_window](#replicated_deduplication_window)相似，`replicated_deduplication_window_seconds` 指定存储用于插入去重的块的哈希值的时间。超过 `replicated_deduplication_window_seconds` 的哈希值将从 ClickHouse Keeper 中移除，即使它们少于 `replicated_deduplication_window`。

该时间是相对于最近记录的时间，而不是墙面时间。如果它是唯一的记录，它将永远存储。

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

ClickHouse Keeper 中移除异步插入哈希值的秒数。

可能的值：
- 任何正整数。

与[replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)相似，`replicated_deduplication_window_seconds_for_async_inserts` 指定存储用于异步插入去重的块的哈希值的时间。超过 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希值将从 ClickHouse Keeper 中移除，即使它们少于 `replicated_deduplication_window_for_async_inserts`。

该时间是相对于最近记录的时间，而不是墙面时间。如果它是唯一的记录，它将永远存储。

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过期设置，不执行任何操作。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过期设置，不执行任何操作。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过期设置，不执行任何操作。

## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

在一个 MUTATE_PART 条目中可以合并的最大突变命令数（0 表示无限制）。

## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过期设置，不执行任何操作。

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
过期设置，不执行任何操作。

## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过期设置，不执行任何操作。

## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过期设置，不执行任何操作。

## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过期设置，不执行任何操作。

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误部分与总部分的比例小于此，允许开始。

可能的值：
- 浮点数，0.0 - 1.0。

## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。仅在 ClickHouse Cloud 中可用。

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

启用在虚拟部分中写入属性并在 Keeper 中提交块。

## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用过期部分检查。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

在共享合并树中，不被 ZooKeeper 监视触发的部分更新的间隔（以秒为单位）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

部分更新的初始退避。仅在 ClickHouse Cloud 中可用。

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

在共享合并树领导者更新周期中添加均匀分布的 0 到 x 秒的值，以避免冲击效应。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

重新检查部分更新的领导权的最长时间。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

领导者尝试确认移除的最大过期部分数量，一次 HTTP 请求中。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

部分更新的最大退避。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

最大的部分更新领导者数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

每个可用区的最大部分更新领导者数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与部分删除（杀手线程）的最大副本数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

每个部分范围尝试分配潜在冲突合并的最大副本数量（允许避免合并分配中的冗余冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max broken parts for SMT, if more - deny automatic detach"}]}]}/>

对于 SMT 的最大破损部分，如果超过，拒绝自动分离。

## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max size of all broken parts for SMT, if more - deny automatic detach"}]}]}/>

最大破损部分总大小，如果超过，拒绝自动分离。

## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

我们存储插入记忆化 ID 的时间，以避免在插入重试期间发生错误操作。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调器选举线程运行之间的时间。

## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "2"},{"label": "New setting"}]}]}/>

协调线程延迟的时间变化因子。

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器多久应与 ZooKeeper 同步以获取新元数据。

## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

协调器可以一次向 MergerMutator 请求的合并数量。

## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器线程运行之间的最长时间。

## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调器应准备并分配给工作线程的合并条目数量。

## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

合并协调器线程运行之间的最小时间。

## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

如果需要在立即操作后更新其状态，合并工作线程将使用的超时。

## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并工作线程运行之间的时间。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>` 的比例高于设置时，将重新加载合并谓词。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一次调度的获取部分元数据作业数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

在不启动包含此部分的新合并的情况下，保持本地合并部分的时间。为其他副本提供机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

本地合并后，推迟分配下一个合并的部分的最小大小（以行数为单位）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在不启动包含此部分的新合并的情况下，保持本地合并部分的时间。为其他副本提供机会获取该部分并启动此合并。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

在可能的情况下从领导者读取虚拟部分。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting to fetch parts data from other replicas"}]}]}/>

如果启用，所有副本尝试从其他副本中获取部分内存数据（如主键、分区信息等）。

## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用请求来自其他副本的内存缓存中的文件系统缓存提示。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

对过时部分使用紧凑格式：减少对 Keeper 的负载，改善对过时部分的处理。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，过多部分计数将依赖于 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。

## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果存在大量过期部分，清理线程将在一次迭代中尝试删除最多 `simultaneous_parts_removal_limit` 个部分。
将 `simultaneous_parts_removal_limit` 设置为 `0` 意味着无限制。

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

这是表磁盘，路径/端点应指向表数据，而不是数据库数据。仅可为 s3_plain/s3_plain_rewritable/web 设置。

## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

保持 tmp_- 目录的秒数。您不应降低此值，因为合并和突变可能无法在此设置的低值下工作。

## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

在启动合并与重压缩之前的超时（以秒为单位）。在此期间，ClickHouse 尝试从分配该合并的副本中获取重新压缩的部分。

在大多数情况下，重新压缩运行缓慢，因此我们在超时之前不会启动重压缩的合并，并尝试从分配该合并的副本中获取重新压缩的部分。

可能的值：
- 任何正整数。

## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制当该部分中所有行根据其 `TTL` 设置过期时，MergeTree 表中数据部分是否完全丢弃。

当 `ttl_only_drop_parts` 被禁用（默认情况下），仅根据其 TTL 设置过期的行被移除。

当 `ttl_only_drop_parts` 启用时，如果该部分中所有行根据其 `TTL` 设置过期，则整个部分将被丢弃。

## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许在写入动态子列时使用自适应写入缓冲区以减少内存使用。

## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则缓存异步插入的哈希值。

可能的值：
- `true`
- `false`

一个包含多个异步插入的块将生成多个哈希值。当某些插入重复时，Keeper 仅在一个 RPC 中返回一个重复的哈希值，这将导致不必要的 RPC 重试。此缓存将监视 Keeper 中的哈希值路径。如果在 Keeper 中监视到更新，缓存将尽快更新，以便我们能够在内存中筛选重复的插入。

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用变体数据类型中鉴别符的紧凑模式二进制序列化。此模式允许在存在大多数只有一个变体或许多 NULL 值时，显著减少存储鉴别符所需的内存。

## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个部分使用恒定粒度。它使得可以在内存中压缩索引粒度的值。在面对极大工作负载和稀薄表时可能非常有用。

## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
过期设置，不执行任何操作。

## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中使用小格式（几十字节）的部分检查和普通格式（几十 KB）相比。启用之前请检查所有副本是否支持新格式。

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 中数据部分头的存储方法。如果启用，ZooKeeper 存储更少的数据。详细信息，请参见[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。

## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

对于主索引使用缓存，而不是将所有索引保存在内存中。这对于非常大的表可能会很有用。

## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

激活垂直合并算法所需的最小（近似）未压缩大小（以字节为单位）。

## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

激活垂直合并算法所需的最小非 PK 列数。

## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

激活垂直合并算法所需的最小（近似）合并部分的行数总和。

## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并过程中使用远程文件系统的预取数据。

## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭之前，表将等待一段所需时间，以便其他副本获取唯一部分（仅存在于当前副本）（0表示禁用）。

## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
过期设置，不执行任何操作。

## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
过期设置，不执行任何操作。

## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
过期设置，不执行任何操作。

## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
过期设置，不执行任何操作。

## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用每个子流写入标记，而不是在压缩部分中每列写入标记。它能够有效地从数据部分读取单个子列。

## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

为获得更小的独立范围而推迟移除的顶级部分的最大百分比。建议不要更改。

## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

最大递归深度，将独立的过期部分范围拆分为较小的子范围。建议不要更改。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用零拷贝复制，则在尝试根据合并或突变的部分大小进行锁定之前，随机休眠一段时间。

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用零拷贝复制，则在尝试进行合并或突变的锁定之前，随机休眠最长 500 毫秒。

## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期，单位为秒。

可能的值：
- 任何正整数。
