---
'description': '在 `system.merge_tree_settings` 中的 MergeTree 设置'
'slug': '/operations/settings/merge-tree-settings'
'title': 'MergeTree 表设置'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局设置的 MergeTree 设置。

可以在服务器配置文件的 `merge_tree` 部分中设置 MergeTree 设置，或者在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

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
## MergeTree settings {#mergetree-settings}
<!-- 以下设置由脚本自动生成，地址为 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

自适应写缓冲区的初始大小
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束，仅允许有效值 (`1` 和 `-1`)。
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用时，将为表的所有数值列添加最小-最大（跳过）索引。
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用时，将为表的所有字符串列添加最小-最大（跳过）索引。
## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting to allow coalescing of partition or sorting key columns."}]}]}/>

启用时，允许在 CoalescingMergeTree 表中使用合并列作为分区或排序键。
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

允许对带有 `is_deleted` 列的 ReplacingMergeTree 进行实验性清理合并。启用后，允许使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有部分合并为单个部分，并删除任何已删除的行。

还允许通过设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 在后台自动执行这样的合并。
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

启用对 MergeTree 排序键的降序排序支持。此设置在时间序列分析和 Top-N 查询中特别有用，允许数据按逆时间顺序存储以优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得在降序查询时可以使用更高效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

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

通过在查询中使用 `ORDER BY time DESC`，将应用 `ReadInOrder`。

**默认值:** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用允许浮点数作为分区键。

可能的值：
- `0` — 不允许使用浮点数分区键。
- `1` — 允许使用浮点数分区键。
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许 Nullable 类型作为主键。
## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Now projections can use _part_offset column."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting, it protects from creating projections with parent part offset column until it is stabilized."}]}]}/>

允许在投影选择查询中使用 `_part_offset` 列。
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Now SMT will remove stale blocking parts from ZooKeeper by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

减少共享合并树表的阻塞部分的后台任务。
仅在 ClickHouse Cloud 中
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

在生产中不要使用此设置，因为尚未准备好。
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting to allow summing of partition or sorting key columns"}]}]}/>

启用时，允许在 SummingMergeTree 表中将求和列用于分区或排序键。
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

拒绝具有相同表达式的主/次索引和排序键
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许从紧凑部分到宽部分的垂直合并。此设置必须在所有副本上具有相同的值。
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，则该副本永远不会合并部分，并始终从其他副本下载合并部分。

可能的值：
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

在变更/替换/分离等操作期间始终复制数据，而不是使用硬链接。
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为真，则在合并时将应用补丁部分。
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用时，将为每个新部分分配唯一部分标识符。
启用前，请检查所有副本是否支持 UUID 版本 4。
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代将等待异步 block_ids_cache 更新的时间。
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为真，INSERT 查询中的数据将存储在队列中，并在后台刷新到表中。
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或变更一步的目标执行时间。如果一步花费的时间过长，可以超出此限制。
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用（默认设置）时，仅当运行需要这些部分的查询时，新的数据部分才会加载到缓存中。

如果启用，`cache_populated_by_fetch` 将导致所有节点在不需要查询触发此操作的情况下，从存储中将新数据部分加载到其缓存中。

**另见**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果不为空，则仅会在抓取后进行预热的文件符合此正则表达式（如果启用 `cache_populated_by_fetch`）。
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
已过时设置，无任何作用。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

在表创建时启用，对采样列或采样表达式的数据类型进行检查。数据类型必须是无符号
[整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：
- `true`  — 启用检查。
- `false` — 在表创建时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在表创建时检查采样列或采样表达式的数据类型。如果您已经有表的采样表达式不正确，并且不希望服务器在启动时引发异常，请将 `check_sample_column_is_correct` 设置为 `false`。
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
已过时设置，无任何作用。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、块哈希和部分的最小周期。
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

从 0 到 x 秒均匀分布的值添加到 cleanup_delay_period，以避免雷击效应和后续的 ZooKeeper DoS（当表的数量非常多时）。
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的首选批量大小（点是抽象的，每个点大致相当于一个插入块）。
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
已过时设置，无任何作用。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>

首选在首次请求时惰性计算列和副索引的大小，而不是在表初始化时计算。
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

预热标记缓存的列列表（如果启用）。为空表示所有列 
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。在紧凑部分写入的单个条带的最大字节数。
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。在紧凑部分写入的单个条带的最大粒度数。
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。在合并期间整体读取的紧凑部分的最大大小。
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许创建主键中不包含采样表达式的表。此设置仅在向后兼容性方面临时允许在错误表上运行服务器。
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

标记支持压缩，减少标记文件大小并加速网络传输。
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，减少主键文件大小并加速网络传输。
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

仅当非活动数据部分的数量至少达到此值时，才激活并发部分删除（参见 'max_part_removal_threads'）。
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为非经典 MergeTree 创建投影，即不是 (Replicated, Shared) MergeTree。忽略选项是出于兼容性，可能导致错误的答案。否则，如果允许，合并投影时的操作是删除还是重建。因此经典的 MergeTree 将忽略此设置。它也控制 `OPTIMIZE DEDUPLICATE`，对所有 MergeTree 家族成员生效。类似于选项 `lightweight_mutation_projection_mode`，它也是部分级别。

可能的值：
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

指定在表声明中未定义的情况下使用的默认压缩编解码器。
列的压缩编解码器选择顺序：
1. 表声明中定义的列的压缩编解码器
2. `default_compression_codec` 中定义的压缩编解码器（此设置）
3. `compression` 设置中定义的默认压缩编解码器
默认值：空字符串（未定义）。
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在合并或变更后，如果副本上的数据部分与其他副本上的数据部分不完全相同，则从副本中分离该数据部分。如果禁用，则删除数据部分。如果希望稍后分析此类部分，请激活此设置。

此设置适用于启用
[数据复制](/engines/table-engines/mergetree-family/replacingmergetree) 的 `MergeTree` 表。

可能的值：

- `0` — 部分已删除。
- `1` — 部分已分离。
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失副本时，不删除旧的本地部分。

可能的值：
- `true`
- `false`
## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用针对零复制复制的 DETACH PARTITION 查询。
## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用针对零复制复制的 FETCH PARTITION 查询。
## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用针对零复制复制的 FREEZE PARTITION 查询。
## disk {#disk} 

存储磁盘的名称。可以代替存储策略指定。
## dynamic_serialization_version {#dynamic_serialization_version} 
<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control Dynamic serialization versions"}]}]}/>

动态数据类型的序列化版本。兼容性所需。

可能的值：
- `v1`
- `v2`
- `v3`
## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

为每行启用持久化列 _block_number。
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并时持久化虚拟列 `_block_number`。
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果可能，压缩内存中的索引粒度值。
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Added new setting to limit max bytes for min_age_to_force_merge."}]}]}/>

如果设置 `min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 应尊重设置 `max_bytes_to_merge_at_max_space_in_pool`。

可能的值：
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用使用 `index_granularity_bytes` 设置控制粒度大小的过渡。在版本 19.11 之前，只有设置 `index_granularity` 用于限制粒度大小。设置 `index_granularity_bytes` 可提高在从包含大行的表中选择数据时的 ClickHouse 性能（数十到数百兆字节）。如果您有大行的表，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

在将分区合并为单个部分时，是否使用清理合并对于 ReplacingMergeTree。需要启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的值：
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用带有 Zookeeper 名称前缀的端点 ID 以用于复制合并树表。
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

启用使用垂直合并算法。
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果此设置在分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表上启用，则源表和目标表之间的索引和投影必须相同。否则，目标表可以具有源表索引和投影的超集。
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用时，将在选择合并部分时使用数据部分的实际大小（即，不包括通过 `DELETE FROM` 已删除的行）。请注意，此行为仅在在启用此设置后执行的 `DELETE FROM` 影响的数据部分上触发。

可能的值：
- `true`
- `false`

**另见**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) 设置
## exclude_materialize_skip_indexes_on_merge {#exclude_materialize_skip_indexes_on_merge} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]}/>

在合并期间排除提供的逗号分隔的跳过索引列表，不会构建和存储它们。如果 
[materialize_skip_indexes_on_merge](#materialize_skip_indexes_on_merge) 为 false，则没有影响。

被排除的跳过索引仍然可以通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询或在插入期间根据 [materialize_skip_indexes_on_insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) 会话设置构建和存储。

示例：

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

当此设置的值大于零时，仅一个副本立即启动合并，而其他副本最多等待该时长以下载结果，而不是在本地进行合并。如果所选择的副本在该时段内未完成合并，则会回退到标准行为。

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

保留多少已完成的变更记录。如果为零，则保留所有。
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

强制合并时通过文件系统缓存读取。
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的部分进行 fsync。显著降低插入性能，不建议在宽部分中使用。
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

在所有部分操作（写入、重命名等）后，对部分目录进行 fsync。
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
已过时设置，无任何作用。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
已过时设置，无任何作用。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区的非活动部分数量超过 `inactive_parts_to_delay_insert` 值，则 `INSERT` 被人造放慢。

:::tip
当服务器无法迅速清理部分时，它是有用的。
:::

可能的值：
- 任何正整数。
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中非活动部分的数量超过 `inactive_parts_to_throw_insert` 值，则 `INSERT` 将因以下错误中断：

> "非活动部分太多（N）。部分清理的处理速度明显慢于插入。" 异常。

可能的值：
- 任何正整数。
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间的数据行的最大数量。即一个主键值对应多少行。
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

字节中数据粒度的最大大小。

要仅通过行数限制粒度大小，请设置为 `0`（不推荐）。
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试周期，以秒为单位。
## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
已过时设置，无任何作用。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
已过时设置，无任何作用。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
已过时设置，无任何作用。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除 `DELETE` 对具有投影的表无效。这是因为投影中的行可能受到 `DELETE` 操作的影响。因此，默认值将为 `throw`。但是，此选项可以更改行为。使用值 `drop` 或 `rebuild` 时，将可以与投影一起工作。`drop` 将删除投影，这样在当前查询中可能会很快，但在未来查询中会很慢，因为没有附加投影。`rebuild` 将重建投影，这可能会影响当前查询的性能，但可能会加速未来查询。好的一点是，这些选项仅在部分级别上工作，这意味着在未触及的部分中的投影将保持完好，而不会触发任何操作，例如删除或重建。

可能的值：
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起启用，则将在表启动期间计算现有数据部分的已删除行数。请注意，这可能使启动表加载变慢。

可能的值：
- `true`
- `false`

**另见**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

用于后台操作（如合并、变更等）。在未能获取表锁之前的秒数。
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块大小，实际压缩的块大小。
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

标记所使用的压缩编码，标记很小且被缓存，因此默认压缩为 ZSTD(3)。
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用时，合并会为新部分构建并存储跳过索引。
否则，可以通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询或 [在插入期间](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) 创建/存储。

另见 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge)，以进行更精细的控制。
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

仅在 MATERIALIZE TTL 时重新计算 ttl 信息。
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 的“太多部分”检查将仅在平均部分大小（在相关分区中）不大于指定阈值时激活。如果大于指定阈值，则 INSERTs 不会被延迟或拒绝。这允许在单个服务器上的单个表中拥有数百 TB 的数据，只要部分已成功合并到更大的部分。这不影响非活动部分或总部分的阈值。
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

要合并为一个部分的最大总部分大小（以字节为单位），前提是有足够的可用资源。大致对应于自动后台合并创建的最大可能部分大小。（0 表示禁用合并）

可能的值：

- 任何非负整数。

合并调度程序定期分析分区中部分的大小和数量，如果池中有足够的可用资源，则开始后台合并。合并发生的时机是源部分的总大小超过 `max_bytes_to_merge_at_max_space_in_pool`。

通过 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool`（仅考虑可用的磁盘空间）。
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

如果在后台池中可用资源最小的情况下，要合并为一个部分的最大总部分大小（以字节为单位）。

可能的值：
- 任何正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了尽管缺乏可用磁盘空间（在池中），仍可合并的最大总部分大小。这是为了减少小部分的数量和“太多部分”错误的机会。
合并在合并的部分的总大小上加倍已占用的磁盘空间。
因此，在可用磁盘空间很少的情况下，可能会出现存在可用空间的情况，但该空间已经被正在进行的大型合并占用，从而导致其他合并无法启动，插入时小部分的数量不断增加。
## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、块哈希和部分的最大周期。
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在压缩以写入表之前未压缩数据块的最大大小。您还可以在全局设置中指定此设置（请参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值将覆盖该设置的全局值。
## max_concurrent_queries {#max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的最大并发执行查询数。
查询仍将受其他 `max_concurrent_queries` 设置的限制。

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

当单个分区中的活动部分数量超过 
[parts_to_delay_insert](#parts_to_delay_insert) 值时，用于计算 `INSERT` 延迟的秒数值。

可能的值：
- 任何正整数。

`INSERT` 的延迟（以毫秒为单位）通过以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
例如，如果一个分区有 299 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，那么 `INSERT` 将延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

从版本 23.1 开始，公式已更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```
例如，如果一个分区有 224 个活动部分，且 parts_to_throw_insert = 300，parts_to_delay_insert = 150，max_delay_to_insert = 1，min_delay_to_insert_ms = 10，那么 `INSERT` 将延迟 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果存在大量未完成变更的最大延迟时间（以毫秒为单位）。
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Obsolete setting"}]}]}/>

已过时设置，无任何作用。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

保持文件名不被哈希化的最大长度。仅在启用设置 `replace_long_file_name_to_hash` 时生效。
该设置的值不包括文件扩展名的长度。因此，建议将其设置为低于最大文件名长度（通常为 255 字节）并留有一定的间隔以避免文件系统错误。
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

如果待修改（删除、添加）的文件数量大于该设置，则不应用 ALTER。

可能的值：

- 任何正整数。

默认值：75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

如果待删除的文件数量大于该设置，则不应用 ALTER。

可能的值：
- 任何正整数。
## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

可以并行刷新（用于合并的列）最大流的数量（合并的最大 insert 延迟流）。仅适用于垂直合并。
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

在未选择到任何部分后，尝试再次选择部分以合并之前的最大等待时间。较低的设置将会在后台调度池中频繁触发选择任务，从而导致在大规模集群中大量请求到 ZooKeeper。
## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
当池中存在超过指定数量的 TTL 条目的合并时，不分配新的带 TTL 的合并。这是为了为常规合并留出空闲线程，避免“部分太多”等问题。
## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每个副本的部分变更数量为指定的数量。零表示每个副本的变更数量没有限制（执行仍可能受到其他设置的约束）。
## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
已过时设置，无任何作用。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
已过时设置，无任何作用。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制一次查询中可以访问的最大分区数。

在创建表时指定的设置值可以通过
查询级别设置进行覆盖。

可能的值：
- 任何正整数。

您也可以在查询/会话/配置文件级别指定查询复杂度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。
## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

如果表的所有分区中的活跃部分总数超过
`max_parts_in_total`值，`INSERT`将中断并抛出`过多部分 (N)` 异常。

可能的值：
- 任何正整数。

表中部分数量过多会降低 ClickHouse 查询的性能并增加 ClickHouse 启动时间。通常这都是由于设计不当（选择分区策略时出现错误 - 分区过小）。
## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

一次可以合并的最大部分数量（0 - 禁用）。不影响
OPTIMIZE FINAL 查询。
## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

失败变更的最大推迟时间。
## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>


失败的复制获取的最大推迟时间。
## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing merge tasks in the replication queue."}]}]}/>


失败的复制合并的最大推迟时间。
## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>


失败的复制任务的最大推迟时间。该值在任务不是获取、合并或变更时使用。
## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

最大 MergeTree 投影的数量。
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每秒以字节为单位进行 [复制](../../engines/table-engines/mergetree-family/replication.md) 获取的数据交换最大速度。该设置适用于特定表，与 [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置不同，该设置适用于服务器。

您可以同时限制服务器网络和特定表的网络，但为此表级设置的值应小于服务器级设置的值。否则，服务器只考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置的遵循并不十分准确。

可能的值：

- 正整数。
- `0` — 不限制。

默认值： `0`.

**用途**

可用于在将数据复制到新节点时限速。
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ClickHouse Keeper 日志中，是否允许有多少条记录，如果有非活跃副本。非活跃副本在超过该数量时会变为丢失。

可能的值：
- 任何正整数。
## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ReplicatedMergeTree 队列中同时允许合并和变更部分的任务数量。
## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

在 ReplicatedMergeTree 队列中同时允许具有 TTL 的合并任务的数量。
## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中同时允许变更部分的任务数量。
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制每秒以字节为单位进行 [复制](../../engines/table-engines/mergetree-family/replacingmergetree) 发送的数据交换最大速度。该设置适用于特定表，与 [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置不同，该设置适用于服务器。

您可以同时限制服务器网络和特定表的网络，但为此表级设置的值应小于服务器级设置的值。否则，服务器只考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置的遵循并不十分准确。

可能的值：

- 正整数。
- `0` — 不限制。

**用途**

可用于在将数据复制到新节点时限速。
## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中损坏的部分数量超过
`max_suspicious_broken_parts` 值，则自动删除被拒绝。

可能的值：
- 任何正整数。
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏部分的最大大小，若超过则拒绝自动删除。

可能的值：
- 任何正整数。
## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 
<SettingsInfoBlock type="UInt64" default_value="32212254720" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>


所有补丁部分中的最大未压缩数据大小（字节）。如果所有补丁部分中的数据量超过此值，轻量级更新将被拒绝。
0 - 不限制。
## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

从合并部分读取到内存的行数。

可能的值：
- 任何正整数。

合并从部分中以 `merge_max_block_size` 行的块读取行，然后合并并将结果写入新部分。读取块存放在RAM中，因此 `merge_max_block_size` 会影响合并所需的RAM大小。
因此，对于行非常宽的表，合并可能消耗大量RAM（如果平均行大小为100kb，则合并10部分时，(100kb * 10 * 8192) = ~ 8GB的RAM）。通过减少 `merge_max_block_size`，可以减少合并所需的RAM量，但会减慢合并速度。
## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

合并操作应该形成的块大小（字节）。默认值与 `index_granularity_bytes` 相同。
## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。 最大部分（紧凑或打包）的大小，以在合并期间预热缓存。
## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

在尝试再次选择要合并的部分之前等待的最短时间。如果选择任务的设置较低，会在背景调度池中频繁触发，从而在大规模集群中导致大量请求到 Zookeeper。
## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

当没有可以合并的部分时，合并选择任务的睡眠时间乘以此因子，当分配了合并时则被除以该因子。
## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于选择合并分配部分的算法。
## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
影响所分配合并的写放大（专家级设置，如果不理解其作用，请勿更改）。适用于 Simple 和 StochasticSimple 合并选择器。
## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

控制逻辑在分区中的部分数量相对何时启动。因子越大，反应越滞后。
## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用启发式选择部分进行合并，该方法从范围的右侧移除部分，如果其大小小于指定比例（0.01）与总大小的比率。适用于 Simple 和 StochasticSimple 合并选择器。
## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一次查看多少部分。
## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。 最大部分总大小，以在合并期间预热缓存。
## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
过时设置，无任何作用。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧部分、WAL 和变更的清理的时间间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理的时间间隔（以秒为单位）。

可能的值：
- 任何正整数。
## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在重复使用重新压缩 TTL 进行合并之前的最小延迟（秒）。
## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在重复使用删除 TTL 进行合并之前的最小延迟（秒）。
## merge_workload {#merge_workload} 


用于调节资源在合并与其他工作负载之间的利用和共享。指定的值用作该表的背景合并的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `merge_workload`。

**另见**
- [工作负载调度](/operations/workload-scheduling.md)
## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

关闭的最小绝对延迟，停止服务请求并在状态检查时不返回正常。
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

是否 `min_age_to_force_merge_seconds` 仅应应用于整个分区，而不是子集上。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- true, false
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在范围内的每个部分的年龄都超过 `min_age_to_force_merge_seconds` 值时进行部分合并。

默认情况下，忽略设置 `max_bytes_to_merge_at_max_space_in_pool`
（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的值：
- 正整数。
## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。用于将完整类型的存储用于数据部分的最小未压缩大小，而不是打包。
## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以存储的宽格式数据部分的最小字节/行数。您可以设置这两个或都不设置。
## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


用于预热新部分的标记缓存和主索引缓存的最小大小（未压缩字节）。
## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新大部分分配在卷磁盘 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 上进行平衡时启用的最小字节数。

可能的值：

- 正整数。
- `0` — 禁用平衡。

**用途**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不得小于 
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) / 1024的值。否则，ClickHouse 会抛出异常。
## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

进行下一个标记时写入所需的未压缩数据块的最小大小。您也可以在全局设置中指定此设置（请参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。在创建表时指定的值会覆盖此设置的全局值。
## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

获取后执行 fsync 的压缩字节最小数量（0 - 禁用）。
## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后执行 fsync 的压缩字节最小数量（0 - 禁用）。
## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

如果单一分区中未合并部分较多，插入 MergeTree 表数据的最小延迟（以毫秒为单位）。
## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

如果有较多尚未完成的变更，变更 MergeTree 表的最小延迟（以毫秒为单位）。
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

执行插入所需的磁盘空间中应保持空闲的最小字节数。如果可用的空闲字节数少于 `min_free_disk_bytes_to_perform_insert` ，则抛出异常并且不执行插入。请注意此设置：
- 考虑到 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定了正（非零）字节数时进行检查。

可能的值：
- 任何正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`， ClickHouse 将在能在更大数量的空闲内存上执行插入的值上进行计数。
:::
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 的最小空闲与总磁盘空间的比率。必须是 0 到 1 之间的浮点值。请注意此设置：
- 考虑到 `keep_free_space_bytes` 设置。
- 不考虑 `INSERT` 操作将写入的数据量。
- 仅在指定了正（非零）比率的情况下进行检查。

可能的值：
- 浮点，0.0 - 1.0

请注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`， ClickHouse 将在能在更大数量的空闲内存上执行插入的值上进行计数。
## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

最小允许的数据粒度大小（以字节为单位）。

提供一种保护机制，防止意外创建 `index_granularity_bytes` 过低的表。
## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

查询读取的最小标记数量，以应用 [max_concurrent_queries](#max_concurrent_queries) 设置。

:::note
查询仍将受到其他 `max_concurrent_queries` 设置的限制。
:::

可能的值：
- 正整数。
- `0` — 禁用（不对查询施加 `max_concurrent_queries` 限制）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

进行合并操作所需的最小数据量，以便使用对存储磁盘的直接 I/O 访问。在合并数据部分时， ClickHouse 计算即将合并的所有数据的总体存储量。如果该量超过 `min_merge_bytes_to_use_direct_io` 字节， ClickHouse 将使用直接 I/O 接口（`O_DIRECT` 选项）读取和写入数据。如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。
## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器可以一次选择的最小数据部分数量（专家级设置，如果不理解其作用，请勿更改）。0 - 禁用。适用于 Simple 和 StochasticSimple 合并选择器。
## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

关闭的最小相对延迟，停止服务请求并在状态检查时不返回正常。
## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

仅在绝对延迟不小于该值时计算相对副本延迟。
## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
过时设置，无任何作用。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约此数量的最后记录，即使它们已经过时。它不影响表的工作：仅用于在清理之前诊断 ZooKeeper 日志。

可能的值：
- 任何正整数。
## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时设置，无任何作用。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整类型的存储来代替打包数据部分的最小行数。
## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

创建宽格式部分的最小行数，而不是紧凑格式。
## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并后执行 fsync 的最小行数（0 - 禁用）。
## mutation_workload {#mutation_workload} 


用于调节资源在变更和其他工作负载之间的利用和共享。指定的值用作该表的背景变更的 `workload` 设置值。如果未指定（空字符串），则使用服务器设置 `mutation_workload`。

**另见**
- [工作负载调度](/operations/workload-scheduling.md)
## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在非复制 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，存储哈希和检查重复项的最近插入块的数量。

可能的值：
- 任何正整数。
- `0`（禁用去重）。

去重机制被采用，类似于复制表（见 [replicated_deduplication_window](#replicated_deduplication_window) 设置）。
创建部分的哈希值写入磁盘的本地文件。
## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


向 SharedJoin 或 SharedSet 通知最新块号。仅在 ClickHouse Cloud 中可用。
## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

当池中的空闲条目少于指定数量时，不要执行部分变更。这样可以为常规合并留出空闲线程，避免“部分过多”错误。

可能的值：
- 任何正整数。

**用途**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则， ClickHouse 将抛出异常。
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

当池中的空闲条目少于指定数量时，不要在后台执行优化整个分区（当设置了 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成的任务）。这样可以为常规合并留出空闲线程，避免“部分过多”错误。

可能的值：
- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 和 [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则， ClickHouse 将抛出异常。
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

当池中少于指定的空闲条目数（或复制队列）时，开始降低处理（或排队）过程中的最大合并大小。
这样可以允许小规模合并处理，而不填满池中的长期运行合并。

可能的值：
- 任何正整数。
## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
如果表中至少有这么多未完成的变更，人工慢下变更的速度。设置为 0 则禁用此选项。
## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表中至少有这么多未完成的变更，则抛出“变更过多”的异常。设置为 0 则禁用此选项。
## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。考虑合并的前 N 个分区。根据可以合并的部分数据量以随机加权的方式选择分区。
## object_serialization_version {#object_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


JSON 数据类型的序列化版本。需要兼容性。

可能的值：
- `v1`
- `v2`
- `v3`

仅 `v3` 版本支持更改共享数据序列化版本。
## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in compact parts"}]}]}/>


紧凑部分 JSON 共享数据序列化的桶数。适用于 `map_with_buckets` 和 `advanced` 共享数据序列化。
## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in wide parts"}]}]}/>


宽部分 JSON 共享数据序列化的桶数。适用于 `map_with_buckets` 和 `advanced` 共享数据序列化。
## object_shared_data_serialization_version {#object_shared_data_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


JSON 数据类型内部共享数据的序列化版本。

可能的值：
- `map` - 以 `Map(String, String)` 形式存储共享数据
- `map_with_buckets` - 将共享数据存储为几个单独的 `Map(String, String)` 列。使用桶可以改善从共享数据读取单个路径的性能。
- `advanced` - 设计用于显著提高从共享数据读取单个路径的性能的共享数据特定序列化方式。
请注意，此序列化增加了磁盘上共享数据的存储大小，因为我们存储了大量额外信息。

`map_with_buckets` 和 `advanced` 序列化的桶数由设置
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part) / [object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part) 来决定。
## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions  for zero level parts"}]}]}/>


此设置允许为在插入期间创建的零级部分指定不同的共享数据的序列化版本。建议不要对零级部分使用 `advanced` 共享数据序列化，因为这会显著增加插入时间。
## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

存储非活跃部分以防止在服务器自发重启期间数据丢失的时间（以秒为单位）。

可能的值：
- 任何正整数。

在将几个部分合并为新部分后， ClickHouse 将原始部分标记为非活跃，并仅在 `old_parts_lifetime` 秒后删除它们。
如果非活跃部分未被当前查询使用，即其部分的 `refcount` 为 1，则移除该部分。

新部分在一段时间内只存在于服务器的RAM中（OS缓存），因此没有为新部分调用 `fsync`。如果服务器自发重启，新部分可能会丢失或损坏。为了保护数据，非活跃部分不会立即删除。

在启动期间， ClickHouse 会检查部分的完整性。如果已合并的部分损坏， ClickHouse 会将非活跃部分返回到活动列表，随后再次对其进行合并。然后，将损坏的部分重命名（添加 `broken_` 前缀）并移动到 `detached` 文件夹。如果合并的部分未损坏，则将原始非活跃部分重命名（添加 `ignored_` 前缀）并移动到 `detached` 文件夹。

默认 `dirty_expire_centisecs` 的值（Linux 内核设置）是 30秒（写入数据仅存储在RAM中的最大时间），但在磁盘系统负载较重的情况下，数据可能会写得更晚。通过实验，选择了480秒的 `old_parts_lifetime` 值，在此期间，新部分会被保证写入磁盘。
## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入期间是否应优化行顺序，以改善新插入表部分的可压缩性。

仅对普通的 MergeTree 引擎表有效。对特殊的 MergeTree 引擎表（例如 CollapsingMergeTree）没有任何作用。

MergeTree 表是（可选）使用 [压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 进行压缩的。
通用压缩编解码器，如 LZ4 和 ZSTD，可以在数据暴露出模式的情况下实现最大压缩率。相同值的长运行通常压缩效果很好。

如果启用此设置， ClickHouse 会尝试以最小化新插入部分中跨列的相同值运行的数量的顺序存储数据。
换句话说，较少的相同值运行意味着单个运行较长，且压缩效果较好。

寻找最佳的行顺序在计算上是不可行的（NP 难题）。
因此， ClickHouse 使用启发式算法快速找到一个行顺序，该行顺序依然改善了原始行顺序的压缩率。

<details markdown="1">

<summary>寻找行顺序的启发式方法</summary>

通常可以自由地洗牌表（或表部分）的行，因为 SQL 将相同表（表部分）以不同的行顺序视为等效。

当为表定义主键时，这种洗牌行的自由度会受到限制。在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制要求表行按列 `C1`, `C2`, ... `Cn` 排序（[聚集索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
结果，行只能在行的“等价类”内进行洗牌，即在其主键列中具有相同值的行。
直观地说，高基数的主键（例如涉及 `DateTime64` 时间戳列的主键）会导致许多小的等价类。类似地，较低基数主键的表会创建少量且较大的等价类。没有主键的表代表了一个跨越所有行的单一等价类的极端情况。

等价类越少、越大，重洗行时的自由度就越高。

应用于每个等价类内的最佳行顺序的启发式方法由 D. Lemire、O. Kaser 在 [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) 提出，并基于按非主键列的升序基数对每个等价类中的行进行排序。

它执行三个步骤：
1. 根据主键列的行值查找所有等价类。
2. 对每个等价类，计算（通常是估计）非主键列的基数。
3. 对于每个等价类，按非主键列基数的升序对行进行排序。

</details>

如果启用，则插入操作会产生额外的 CPU 成本，用于分析和优化新数据的行顺序。根据数据特征，预计 INSERT 操作将花费我们30-50%的时间。
LZ4 或 ZSTD 的压缩率平均提高了 20-40%。

此设置对没有主键或低基数主键的表效果最佳，即只有有限的主键值的表。
涉及 `DateTime64` 类型时间戳的高基数主键，预计不会从此设置中受益。
## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动部分之前/之后等待的时间。
## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

实验性/未完成的功能，用于在分片之间移动部分。不考虑分片表达式。
## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活跃部分数量超过 `parts_to_delay_insert` 值，则 `INSERT` 会被人为延迟。

可能的值：
- 任何正整数。

ClickHouse 人为地延长 `INSERT` 的执行时间（添加“睡眠”），以便后台合并进程可以比添加的部分更快地合并部分。
## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活跃部分数量超过 `parts_to_throw_insert` 值，则 `INSERT` 会被中断，并抛出 `Too many parts (N). Merges are processing significantly slower than inserts` 异常。

可能的值：
- 任何正整数。

为了实现 `SELECT` 查询的最大性能，有必要最小化处理的部分数量，参见 [Merge Tree](/development/architecture#merge-tree)。

在版本 23.6 之前，此设置默认为 300。您可以设置更高的不同值，以降低 `Too many parts` 错误的概率，但同时 `SELECT` 性能可能下降。此外，如果出现合并问题（例如，由于磁盘空间不足），您会比原来的 300 方案更晚注意到。
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果部分大小的总和超过此阈值，并且自复制日志条目创建以来的时间大于 `prefer_fetch_merged_part_time_threshold`，则更倾向于从副本中获取合并部分，而不是在本地进行合并。这是为了加快非常长的合并过程。

可能的值：
- 任何正整数。
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建以来的时间超过此阈值，并且部分大小的总和大于 `prefer_fetch_merged_part_size_threshold`，则更倾向于从副本中获取合并部分，而不是在本地进行合并。这是为了加快非常长的合并过程。

可能的值：
- 任何正整数。
## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
如果为真，则通过在插入、合并、抓取和服务器启动时将标记保存到标记缓存来预热标记缓存。
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为真，则主键索引缓存将通过在插入、合并、抓取和服务器启动时将标记保存到标记缓存来预热。
## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主键压缩块的大小，即要压缩的实际块大小。
## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

主键使用的压缩编码，主键的大小足够小且缓存，因此默认压缩为 ZSTD(3)。
## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
在第一次使用时将主键加载到内存中，而不是在表初始化时。这可以在表数量较多的情况下节省内存。
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

如果主键数据部分的某列的值至少在此比例的次数中发生变化，则跳过将下一个列加载到内存。这允许通过不加载无用的主键列来节省内存使用。
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 _default_ 值与 _all_ 值数量的最小比例。设置此值会导致列使用稀疏序列化进行存储。

如果列是稀疏的（主要包含零），ClickHouse 可以以稀疏格式对其进行编码，并自动优化计算 - 查询期间不需要对数据进行完全解压缩。要启用这种稀疏序列化，请将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果值大于或等于 1.0，则将始终使用正常的完全序列化进行写入。

可能值：

- 在 `0` 和 `1` 之间的浮点数，启用稀疏序列化
- `1.0`（或更高），如果您不想使用稀疏序列化

**示例**

请注意，以下表中的 `s` 列在 95% 的行中是空字符串。在 `my_regular_table` 中，我们不使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

请注意，`my_sparse_table` 中的 `s` 列在磁盘上使用的存储空间更少：

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

您可以查看哪些 `s` 部分是以稀疏序列化方式存储的：

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

仅在 ClickHouse Cloud 中可用。在没有丢弃/替换范围的情况下，尝试再次减少阻塞部分的最小等待时间。较低的设置会频繁触发背景_schedule_pool 中的任务，这会导致在大规模集群中向 ZooKeeper 发出大量请求。
## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

如果大于零，则从基础文件系统刷新数据部分的列表，以检查数据是否在后台更新。仅在表位于只读磁盘上时可以设置（这意味着这是一个只读副本，而数据由另一个副本进行写入）。 
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

当此设置的值大于零时，仅有一个副本会立即启动合并，前提是合并部分在共享存储中。

:::note
零拷贝复制尚未准备好用于生产
在 ClickHouse 版本 22.8 和更高版本中，零拷贝复制默认被禁用。

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

用于零拷贝表的 ZooKeeper 路径，无表信息。
## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

在通过 TTL、突变或合并算法修剪后删除空部分。
## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

不完整实验特性的设置。
## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

在后台删除所有活跃部分所应用的补丁部分。
## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 'max_file_name_length' 字节），则将其替换为 SipHash128。
## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，此节点上的复制表副本将尝试获取领导权。

可能的值：
- `true`
- `false`
## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper 存储的最近插入的块数量，用于检查重复项的哈希值。

可能的值：
- 任何正整数。
- 0（禁用去重）

`Insert` 命令创建一个或多个块（部分）。对于 [insert deduplication](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 将已创建部分的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的 `replicated_deduplication_window` 块。最旧的哈希值会从 ClickHouse Keeper 中删除。

对于 `replicated_deduplication_window` 的较大值会减缓 `Inserts` 的速度，因为需要比较更多的条目。哈希值是通过字段名称和类型的组合以及插入部分的数据（字节流）计算得出的。
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

最近异步插入块的数量，ClickHouse Keeper 用于检查重复项的哈希值。

可能的值：
- 任何正整数。
- 0（禁用 async_inserts 的去重）

[Async Insert](/operations/settings/settings#async_insert) 命令将在一个或多个块（部分）中缓存。在写入复制表时，ClickHouse 将每个插入的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的 `replicated_deduplication_window_for_async_inserts` 块。最旧的哈希值会从 ClickHouse Keeper 中删除。

较高的 `replicated_deduplication_window_for_async_inserts` 值会减缓 `Async Inserts` 的速度，因为需要比较更多的条目。哈希值是通过字段名称和类型的组合以及插入的数据（字节流）计算得出的。
## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

在 ClickHouse Keeper 中删除插入块的哈希值的秒数。

可能的值：
- 任何正整数。

类似于 [replicated_deduplication_window](#replicated_deduplication_window)，`replicated_deduplication_window_seconds` 指定存储插入去重的块哈希值的时间。哈希值在大于 `replicated_deduplication_window_seconds` 后会从 ClickHouse Keeper 中删除，即使它们小于 `replicated_deduplication_window`。

时间是相对于最近记录的时间，而不是墙面时间。如果它是唯一的记录，它将永远存储。
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

在 ClickHouse Keeper 中删除异步插入哈希值的秒数。

可能的值：
- 任何正整数。

类似于 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)，`replicated_deduplication_window_seconds_for_async_inserts` 指定存储异步插入去重的块哈希值的时间。哈希值在大于 `replicated_deduplication_window_seconds_for_async_inserts` 后会从 ClickHouse Keeper 中删除，即使它们小于 `replicated_deduplication_window_for_async_inserts`。

时间是相对于最近记录的时间，而不是墙面时间。如果它是唯一的记录，它将永远存储。
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时的设置，不执行任何操作。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时的设置，不执行任何操作。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
过时的设置，不执行任何操作。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

可以合并在一个 MUTATE_PART 条目中执行的最大突变命令数量（0 表示无限制）
## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，不执行任何操作。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
过时的设置，不执行任何操作。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，不执行任何操作。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，不执行任何操作。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
过时的设置，不执行任何操作。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误部分与总部分数量的比例小于此值 - 允许启动。

可能的值：
- 浮点数，0.0 - 1.0
## search_orphaned_parts_disks {#search_orphaned_parts_disks} 
<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse 在任何 ATTACH 或 CREATE 表时扫描所有磁盘以查找孤立部分，以确保不会遗漏未定义（未包含在策略中的）磁盘上的数据部分。孤立部分源于潜在不安全的存储重新配置，例如，如果某个磁盘被排除在存储策略之外。
此设置通过磁盘的特征限制搜索范围。

可能的值：
- any - 范围不受限制。
- local - 范围仅限于本地磁盘。
- none - 空范围，不进行搜索。
## serialization_info_version {#serialization_info_version} 
<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="default" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "default"},{"label": "New setting"}]}]}/>

写入 `serialization.json` 时使用的序列化信息版本。此设置在集群升级时是兼容性所必需的。

可能的值：
- `DEFAULT`

- `WITH_TYPES`
使用新格式写入，并允许每种类型的序列化版本。这使得像 `string_serialization_version` 这样的设置生效。

在滚动升级期间，将此设置为 `DEFAULT`，以使新服务器生成与旧服务器兼容的数据部分。升级完成后，切换到 `WITH_TYPES` 以启用每种类型的序列化版本。
## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。
仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

停止为共享合并树分配合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

如果分区没有部分，则该分区将在 Keeper 中存储多少秒。
## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

启用对空分区的 Keeper 条目的清理。
## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用协同合并策略。
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

在共享合并树中，未通过 ZooKeeper 监视触发的部分更新的间隔时间（以秒为单位）。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

部分更新的初始退避。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

服务器间 HTTP 连接的超时，仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

服务器间 HTTP 通信的超时，仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在共享合并树的 leader_update_period 上均匀分布添加 0 到 x 秒的值，以避免雷声效应。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

重新检查部分更新领导的最大周期。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

一次 HTTP 请求中，领导者将尝试确认要删除的最大过时部分数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

部分更新的最大退避。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

最大部分更新领导者的数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

最大部分更新领导者的数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与部分删除的最大副本（杀手线程）。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

尝试分配潜在冲突合并的最大副本数量（允许避免合并分配中的冗余冲突）。 0 表示禁用。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max broken parts for SMT, if more - deny automatic detach"}]}]}/>

SMT 最大损坏部分数量，如果超过 - 拒绝自动分离。
## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max size of all broken parts for SMT, if more - deny automatic detach"}]}]}/>

SMT 最大损坏部分的总字节数，如果超过 - 拒绝自动分离。
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

我们存储插入记忆 ID 的时间，以避免在重试插入期间进行错误操作。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调器选举线程运行之间的时间。
## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "2"},{"label": "New setting"}]}]}/>

用于延迟协调器线程的时间变化因子。
## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器与 ZooKeeper 同步以获取新元数据的频率。
## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

协调器可以一次请求的合并数量。
## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器线程运行之间的最大时间。
## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调器应该准备并在工作者中分配的合并条目数量。
## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

合并协调员线程运行之间的最小时间。
## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

合并工作线程在需要立即更新其状态后使用的超时。
## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并工作线程运行之间的时间。
## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

在进行过时部分清理时，有多少副本将进入同一个汇合哈希组。
仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>` 的比率高于设置时，将在合并/突变选择任务中重新加载合并谓词。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

一次调度的取件部分元数据作业数量。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

在本地合并部分后，保持多长时间才能启动包含此部分的新合并。给其他副本一个机会抓取该部分并启动此合并。
仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

本部分的最小大小（以行数计），以推迟在本地合并后立即分配下一个合并。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在本地合并部分后，保持多长时间才能启动包含此部分的新合并。给其他副本一个机会抓取该部分并启动此合并。
仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

在可能的情况下，从领导者读取虚拟部分。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting to fetch parts data from other replicas"}]}]}/>

如果启用，所有副本将尝试从其他已有该部分的副本中获取内存数据（如主键、分区信息等）。
## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

副本将根据后台调度多长时间尝试重新加载其标志。
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用从其他副本的内存缓存请求文件系统缓存提示。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Enable outdated parts v3 by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

对过时部分使用紧凑格式：减少对 Keeper 的负载，提高过时部分的处理。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，过多部分计数将依赖于 Keeper 的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。
## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

应该打包在批处理中的分区发现数量。
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果有大量过时部分，清理线程将尝试在一个迭代中删除最多 `simultaneous_parts_removal_limit` 部分。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

用于测试。请勿更改。
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

用于测试。请勿更改。
## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略的名称。
## string_serialization_version {#string_serialization_version} 
<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="default" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "default"},{"label": "New setting"}]}]}/>

控制顶级 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 设置为 "with_types" 时有效。
启用时，顶级 `String` 列将使用单独的 `.size` 子列进行序列化，存储字符串长度，而不是内联。这允许真正的 `.size` 子列并可以提高压缩效率。

嵌套的 `String` 类型（例如，内部在 `Nullable`、`LowCardinality`、`Array` 或 `Map`）不受影响，除非它们出现在 `Tuple` 中。

可能的值：

- `DEFAULT` — 使用带内联大小的标准序列化格式。
- `WITH_SIZE_STREAM` — 为顶级 `String` 列使用单独的大小流。
## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

这是表磁盘，路径/端点应指向表数据，而不是数据库数据。仅能为 s3_plain/s3_plain_rewritable/web 设置。
## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

临时目录的存储时间（以秒为单位）。您不应降低此值，因为合并和突变可能无法正常工作，尤其是在该设置值较低的情况下。
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

启动合并并进行重新压缩的超时（以秒为单位）。在此期间，ClickHouse 会尝试从分配了此合并的副本中抓取重新压缩的部分。

在大多数情况下，重新压缩速度较慢，因此在此超时之前我们不会启动合并并尝试从分配了此合并的副本中抓取重新压缩的部分。

可能的值：
- 任何正整数。
## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当该部分的所有行根据其 `TTL` 设置已过期时，数据部分是否完全删除。

当 `ttl_only_drop_parts` 禁用（默认为）时，仅删除根据其 TTL 设置过期的行。

当 `ttl_only_drop_parts` 启用时，如果该部分的所有行根据其 `TTL` 设置过期，则整个部分会被删除。
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

在写入动态子列时允许使用自适应写入缓冲区，以减少内存使用。
## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，我们缓存异步插入的哈希值。

可能的值：
- `true`
- `false`

一个块包含多个异步插入将生成多个哈希值。
当某些插入重复时，Keeper 将在一个 RPC 中仅返回一个重复的哈希值，这将导致不必要的 RPC 重试。
此缓存将监视 Keeper 中的哈希值路径。如果在 Keeper 中监视到更新，缓存将尽快更新，以便能够在内存中过滤重复的插入。
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用在 Variant 数据类型中的指示符的紧凑二进制序列化模式。
此模式允许在大部分为单一变体或大量 NULL 值的情况下，显著减少存储指示符所需的内存。
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个部分使用恒定粒度。这使得可以在内存中压缩索引粒度的值。对于极大的工作负载（具有稀少表）可能会有所帮助。
## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
过时的设置，不执行任何操作。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中为部分哈希值使用小格式（数十字节），而不是普通格式（数十 KB）。在启用之前，请检查所有副本是否支持新格式。
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

ZooKeeper 中的数据部分头部的存储方法。如果启用，ZooKeeper 将存储更少的数据。有关详细信息，请参见 [这里](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。
## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

使用主键索引的缓存，而不是将所有索引保存在内存中。这对于非常大的表可能会很有用。
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并部分可激活垂直合并算法的最小（近似）未压缩字节大小。
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

激活垂直合并算法的最小非主键列数。
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

合并部分可激活垂直合并算法的最小（近似）行数总和。
## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为真，轻量级删除将在垂直合并时进行优化。
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为真，在合并期间会为下一个列从远程文件系统预取数据。
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭之前，表将等待所需的时间，以便唯一部分（仅存在于当前副本上）被其他副本获取（0表示禁用）。
## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
过时的设置，没有任何作用。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
过时的设置，没有任何作用。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
过时的设置，没有任何作用。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
过时的设置，没有任何作用。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Enable writing marks for substreams in compact parts by default"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用在紧凑部分中为每个子流写入标记，而不是为每列写入标记。这使得能够高效地从数据部分读取各个子列。

例如，列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 在以下子流中序列化：
- `t.a` 用于元组元素 `a` 的字符串数据
- `t.b` 用于元组元素 `b` 的 UInt32 数据
- `t.c.size0` 用于元组元素 `c` 的数组大小
- `t.c.null` 用于元组元素 `c` 的嵌套数组元素的空值映射
- `t.c` 用于元组元素 `c` 的嵌套数组元素的 UInt32 数据

启用此设置时，我们将为这五个子流中的每一个写入一个标记，这意味着我们可以在需要时单独从粒度中读取每个子流的数据。例如，如果我们想读取子列 `t.c`，我们将只读取子流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据，而不会读取子流 `t.a` 和 `t.b` 的数据。当此设置禁用时，我们将只为顶级列 `t` 写入一个标记，这意味着即使我们只需要某些子流的数据，我们也会始终从粒度中读取整个列的数据。
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

最大待推迟移除的顶级部分百分比，以获得更小的独立范围。建议不要更改。
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

将过时部分范围分割为更小子范围的最大递归深度。建议不要更改。
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用了零拷贝复制，合并或突变前将根据部分大小随机延迟一定时间尝试锁定。
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用了零拷贝复制，合并或突变前将随机延迟最多 500 毫秒尝试锁定。
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期，单位为秒。

可能的值：
- 任何正整数。
