---
description: '用于 MergeTree 的设置，位于 `system.merge_tree_settings` 中'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表的设置'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局生效的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中进行全局配置，或者在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

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

使用 `ALTER TABLE ... MODIFY SETTING` 命令更改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## MergeTree 设置 {#mergetree-settings}

{/* 以下设置由以下脚本自动生成：
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

自适应写入缓冲区的初始大小

## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则会为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加一个隐式约束，只允许有效值（`1` 和 `-1`）。

## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，将为该表的所有数值型列添加最小-最大（跳过）索引。

## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，将为该表中所有字符串列添加最小-最大（跳过）索引。

## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于允许在分区键或排序键中使用 coalescing 列的新设置。"}]}]}/>

启用后，允许在 CoalescingMergeTree 表的分区键或排序键中使用 coalescing 列。

## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许在带有 `is_deleted` 列的 ReplacingMergeTree 中使用实验性的 CLEANUP 合并操作。启用后，可以使用 `OPTIMIZE ... FINAL CLEANUP` 手动将某个分区中的所有分区片段合并为一个分区片段，并删除其中所有被标记为删除的行。

还允许通过 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 这些设置，在后台自动执行此类合并。

## allow&#95;experimental&#95;reverse&#95;key {#allow_experimental_reverse_key}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

启用在 MergeTree 排序键中对降序排序的支持。此 SETTING 尤其适用于时间序列分析和 Top-N 查询，允许以逆时间顺序存储数据，从而优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这样，对于降序查询即可使用更高效的 `ReadInOrder` 优化，而无需使用 `ReadInReverseOrder`。

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

在查询中使用 `ORDER BY time DESC` 时，会启用 `ReadInOrder`。

**默认值：** false

## allow_floating_point_partition_key {#allow_floating_point_partition_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用浮点数作为分区键。

可能的取值：

- `0` — 不允许使用浮点数作为分区键。
- `1` — 允许使用浮点数作为分区键。

## allow_nullable_key {#allow_nullable_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许 Nullable 类型作为主键。

## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "现在投影可以使用 _part_offset 列。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新的设置，在功能稳定之前，会阻止创建包含父 part 偏移列的投影。"}]}]}/>

允许在针对投影的 SELECT 查询中使用 '_part_offset' 列。

## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "现在 SMT 将默认从 ZooKeeper 中移除陈旧的阻塞分区片段"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

用于减少共享 MergeTree 表中阻塞分区片段的后台任务。
仅在 ClickHouse Cloud 中可用。

## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

不要在生产环境中使用此设置，因为该设置尚未成熟。

## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置，允许在分区键或排序键中使用可求和列"}]}]}/>

启用后，允许在 SummingMergeTree 表中将可求和的列用作分区键或排序键。

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

禁止主/次级索引和排序键使用相同的表达式

## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许将紧凑分区片段纵向合并为宽分区片段。此设置在所有副本上必须保持相同取值。

## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "更改行为以允许在存在依赖二级索引时对 `column` 执行 ALTER 操作"}]}]}/>

配置是否允许对由二级索引覆盖的列执行 `ALTER` 命令，以及在允许时应采取的处理方式。默认情况下，允许此类 `ALTER` 命令，并会重建索引。

可能的取值：

- `rebuild`（默认）：重建在 `ALTER` 命令中受该列影响的所有二级索引。
- `throw`：通过抛出异常阻止对由二级索引覆盖的列执行任何 `ALTER`。
- `drop`：删除依赖的二级索引。新的分区片段将不再包含这些索引，需通过 `MATERIALIZE INDEX` 重新创建。
- `compatibility`：与原有行为一致：对 `ALTER ... MODIFY COLUMN` 执行 `throw`，对 `ALTER ... UPDATE/DELETE` 执行 `rebuild`。
- `ignore`：供专家使用。会使索引保持在不一致状态，可能导致查询结果不正确。

## always_fetch_merged_part {#always_fetch_merged_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则该副本将从不自行合并分区片段，而是始终从其他副本下载已合并的分区片段。

可能的取值：

- true, false

## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 

<SettingsInfoBlock type="Bool" default_value="0" />

在执行 mutations/replaces/detaches 等操作时，始终复制数据，而非创建硬链接。

## apply_patches_on_merge {#apply_patches_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则在合并时应用补丁分区片段。

## assign_part_uuids {#assign_part_uuids} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，将为每个新 part 分配一个唯一的 part 标识符。
在启用之前，请检查所有副本均支持 UUID 版本 4。

## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代在等待 async_block_ids_cache 更新时所等待的时间

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，来自 INSERT 查询的数据会先存储在队列中，随后在后台写入表中。

## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新设置"}]}]}/>

以逗号分隔的统计类型列表，用于在所有适用的列上自动计算。
支持的统计类型：tdigest、countmin、minmax、uniq。

## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或变更操作中单个步骤的目标执行时间（毫秒）。如果某个步骤耗时更长，则可能会超过该目标时间。

## cache_populated_by_fetch {#cache_populated_by_fetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用时（默认设置），新的数据分区片段
只会在执行需要这些分区片段的查询时才会被加载到文件系统缓存中。

如果启用 `cache_populated_by_fetch`，则会导致所有节点从存储中加载
新的数据分区片段到其文件系统缓存中，而无需通过查询来触发此操作。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "新设置"}]}]}/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果该设置不为空，则只有匹配此正则表达式的文件会在获取之后被预热到缓存中（前提是已启用 `cache_populated_by_fetch`）。

## check_delay_period {#check_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="60" />

已弃用的设置，不再产生任何效果。

## check_sample_column_is_correct {#check_sample_column_is_correct} 

<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查，用于验证用于采样或采样表达式的列的数据类型是否正确。该数据类型必须是以下无符号[整数类型](/sql-reference/data-types/int-uint)之一：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的值：

- `true`  — 启用检查。
- `false` — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器会在创建表时检查用于采样或采样表达式的列的数据类型。如果你已经有包含不正确采样表达式的表，并且不希望服务器在启动期间抛出异常，请将 `check_sample_column_is_correct` 设置为 `false`。

## clean_deleted_rows {#clean_deleted_rows} 

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

已弃用的设置，不执行任何操作。

## cleanup_delay_period {#cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

执行清理旧队列日志、块哈希和分区片段操作的最小时间间隔。

## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

为 `cleanup_delay_period` 添加从 0 到 x 秒的均匀分布随机值，
以避免在表数量非常多的情况下出现惊群效应，并随之对 ZooKeeper 造成 DoS。

## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 

<SettingsInfoBlock type="UInt64" default_value="150" />

用于后台清理的首选批次大小（“点”是一个抽象单位，但 1 个点大致相当于 1 个已插入的数据块）。

## cleanup_threads {#cleanup_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

已废弃的设置，没有任何效果。

## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于按需延迟计算列和索引大小的新设置"}]}]}/>

在首次请求时按需延迟计算列和二级索引的大小，而不是在表初始化时计算。

## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

用于预热标记缓存的列列表（如果已启用）。为空则表示所有列。

## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。在紧凑分区片段中单个 stripe 的最大写入字节数。

## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。在 compact 分区片段中，单个 stripe 内可写入的最大 granule 数量。

## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。指定在合并过程中，可以整体读入内存的紧凑分区片段的最大大小。

## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建采样表达式不在主键中的表。仅在需要为了向后兼容而暂时运行包含错误表结构的服务器时使用此设置。

## compress_marks {#compress_marks} 

<SettingsInfoBlock type="Bool" default_value="1" />

标记支持压缩，这可以减小标记文件大小并加快网络传输。

## compress_primary_key {#compress_primary_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，以减小主键文件大小并加快网络传输。

## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

仅当非活动的数据分区片段数量至少达到该值时，才启用并发分区片段移除（参见 `max_part_removal_threads`）。

## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为使用非经典 MergeTree（即不是 (Replicated, Shared) MergeTree）的表创建 projection。`ignore` 选项纯粹是为了兼容性，可能会导致错误的结果。否则，如果允许，则需指定在合并 projection 时采取的操作，是 `drop` 还是 `rebuild`。因此，经典 MergeTree 会忽略此设置。它同样会控制 `OPTIMIZE DEDUPLICATE`，并对所有 MergeTree 系列成员生效。与选项 `lightweight_mutation_projection_mode` 类似，它也是 part 级别的设置。

可能的值：

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "新设置"}]}]}/>

指定当在表声明中未为特定列定义压缩编解码器时要使用的默认压缩编解码器。
为列选择压缩编解码器的顺序如下：

1. 在表声明中为该列定义的压缩编解码器
2. 在 `default_compression_codec`（此设置）中定义的压缩编解码器
3. 在 `compression` 设置中定义的默认压缩编解码器

默认值：空字符串（未定义）。

## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用以下行为：当副本在执行合并或变更（mutation）后，如果某个数据分区片段在字节级与其他副本上的对应分区片段不完全一致，则将其分离（detach）。如果禁用该设置，则该数据分区片段会被删除。如果需要之后对这些分区片段进行分析，请启用此设置。

该设置适用于启用了
[数据复制](/engines/table-engines/mergetree-family/replacingmergetree)
的 `MergeTree` 表。

可能的取值：

- `0` — 分区片段会被删除。
- `1` — 分区片段会被分离。

## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失的副本时不移除旧的本地分区片段。

可能的取值：

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

禁用针对零拷贝复制的 DETACH PARTITION 查询。

## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制中的 FETCH PARTITION 查询。

## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

禁用用于零拷贝复制的 FREEZE PARTITION 查询。

## disk {#disk} 

存储磁盘名称。可以用来替代 storage policy 进行指定。

## dynamic_serialization_version {#dynamic_serialization_version} 

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control Dynamic serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Enable v3 serialization version for Dynamic by default for better serialization/deserialization"}]}]}/>

Dynamic 数据类型的序列化版本，为兼容性所必需。

可能的取值：

- `v1`
- `v2`
- `v3`

## enable_block_number_column {#enable_block_number_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用为每行持久化存储 `_block_number` 列。

## enable_block_offset_column {#enable_block_offset_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

在合并过程中持久化虚拟列 `_block_number`。

## enable_index_granularity_compression {#enable_index_granularity_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果可能，在内存中压缩索引粒度的值

## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "添加了新的设置，用于限制 min_age_to_force_merge 的最大字节数。"}]}]}/>

用于控制 `min_age_to_force_merge_seconds` 和
`min_age_to_force_merge_on_partition_only` 是否遵循
`max_bytes_to_merge_at_max_space_in_pool` 设置。

可能的取值：

- `true`
- `false`

## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用向通过 `index_granularity_bytes` SETTING 控制粒度大小的模式过渡。在 19.11 版本之前，只能通过 `index_granularity` SETTING 限制粒度大小。`index_granularity_bytes` SETTING 在从包含大行（数十到数百兆字节）的表中选择数据时可以提升 ClickHouse 的性能。  
如果你的表包含大行，可以为这些表启用此 SETTING，以提高 `SELECT` 查询的效率。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

是否在将分区合并为单个 part 时，对 ReplacingMergeTree 使用 CLEANUP 合并。需要同时启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的取值：

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 

<SettingsInfoBlock type="Bool" default_value="0" />

为 ReplicatedMergeTree 表启用带有 ZooKeeper 名称前缀的 endpoint id。

## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 

<SettingsInfoBlock type="UInt64" default_value="1" />

启用 Vertical 合并算法。

## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表启用该设置，则源表与目标表之间的索引和投影必须完全相同。否则，目标表可以包含源表索引和投影的超集。

## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "对在宽格式分区片段中为 Variant 类型子列创建的文件名中的特殊符号进行转义"}]}]}/>

对在 MergeTree 表的宽格式分区片段中为 Variant 数据类型子列创建的文件名中的特殊符号进行转义。用于满足兼容性要求。

## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在选择要合并的分区片段时，将使用根据估算得到的实际分区片段大小（即排除那些通过 `DELETE FROM` 已被删除的行）。请注意，只有在启用此设置之后执行的 `DELETE FROM` 所影响的分区片段，才会触发此行为。

可能的取值：

- `true`
- `false`

**另请参阅**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
设置

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

在合并过程中，不会构建和存储提供的以逗号分隔的 skip 索引列表中指定的索引。如果
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) 为 false，则此设置无效。

被排除的 skip 索引仍然可以通过显式的
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询构建和存储，或者在执行 INSERT 时，根据
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
会话设置进行构建和存储。

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

当此设置值大于 0 时，只有一个副本会立即开始执行合并，其他副本则在该时间阈值内等待下载合并结果，而不是在本地执行合并。如果选定的副本在这段时间内未完成合并，则会恢复为标准行为。

可能的取值：

- 任意正整数。

## fault_probability_after_part_commit {#fault_probability_after_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

用于测试。请勿修改。

## fault_probability_before_part_commit {#fault_probability_before_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试。不要更改。

## finished_mutations_to_keep {#finished_mutations_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="100" />

要保留多少条已完成的 mutation 记录。如果为零，则保留所有记录。

## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在合并时强制通过文件系统缓存读取数据

## fsync_after_insert {#fsync_after_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入产生的分区片段执行 fsync。会显著降低写入性能，不建议与宽分区片段一起使用。

## fsync_part_directory {#fsync_part_directory} 

<SettingsInfoBlock type="Bool" default_value="0" />

在所有 part 操作（写入、重命名等）完成后，对 part 目录执行 fsync。

## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 

<SettingsInfoBlock type="Bool" default_value="1" />

已废弃的设置，目前不起任何作用。

## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 

<SettingsInfoBlock type="Bool" default_value="0" />

此设置已废弃，不执行任何操作。

## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中某个分区里的非活跃分区片段数量超过 `inactive_parts_to_delay_insert` 的值，`INSERT` 操作会被人为减速。

:::tip
当服务器无法足够快地清理这些分区片段时，此设置非常有用。
:::

可能的取值：

- 任意正整数。

## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中的非活动分区片段数量超过
`inactive_parts_to_throw_insert` 的值，`INSERT` 将会被中断，并返回如下错误：

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception."

可能的取值：

- 任意正整数。

## index_granularity {#index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间允许的最大数据行数。即一个主键值对应多少行。

## index_granularity_bytes {#index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据粒度的最大大小（以字节为单位）。

若只按行数限制粒度大小，将其设置为 `0`（不推荐）。

## initialization_retry_period {#initialization_retry_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试间隔，单位为秒。

## kill_delay_period {#kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

已弃用的设置，无任何作用。

## kill_delay_period_random_add {#kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

已弃用的设置，不会产生任何效果。

## kill_threads {#kill_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

已弃用的设置，不会产生任何效果。

## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，带有 projection 的表无法使用轻量级删除 `DELETE`。这是因为 projection 中的行也可能会受到 `DELETE` 操作的影响，因此默认值为 `throw`。不过，可以通过此设置改变该行为。当该设置的值为 `drop` 或 `rebuild` 时，就可以对带有 projection 的表执行删除操作。

`drop` 会删除对应的 projection，因此当前这次查询在删除 projection 后可能会执行得很快，但由于之后不再有可用的 projection，后续查询可能会变慢。`rebuild` 会重建 projection，这可能会影响当前查询的性能，但有助于提升后续查询的速度。

一个好处是，这些选项只在 part 级别生效，这意味着未被本次操作触及到的 part 中的 projection 将保持不变，不会触发诸如 drop 或 rebuild 等操作。

可能的取值：

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起启用，
将在表启动时计算已有数据分区片段中被删除行的数量。请注意，这可能会减慢表加载和启动的速度。

可能的取值：

- `true`
- `false`

**另请参阅**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置

## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 

<SettingsInfoBlock type="Seconds" default_value="120" />

适用于合并、变更等后台操作。在放弃获取表锁前等待的秒数。

## marks_compress_block_size {#marks_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块大小，即要压缩的数据块的实际大小。

## marks_compression_codec {#marks_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于 marks 的压缩编码。由于 marks 体积很小且会被缓存，因此
默认压缩方式为 ZSTD(3)。

## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储 skip 索引。
否则，它们可以通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
或[在执行 INSERT 时](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)创建/存储。

另请参阅 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) 以进行更细粒度的控制。

## materialize_statistics_on_merge {#materialize_statistics_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储统计信息。
否则，可以通过显式执行 [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
或[在 INSERT 时](/operations/settings/settings.md#materialize_statistics_on_insert) 来创建和存储这些统计信息。

## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

仅在执行 MATERIALIZE TTL 时重新计算 TTL 信息

## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 进行的 “too many parts” 检查，仅当（相关分区中的）平均分区片段大小不超过指定阈值时才会生效。若平均大小大于该阈值，则这些 INSERT 既不会被延迟也不会被拒绝。只要分区片段能够成功合并为更大的分区片段，就可以在单个服务器上的单个表中存储数百 TB 的数据。此设置不会影响针对非活动分区片段或分区片段总数的阈值。

## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

在资源充足的情况下，允许合并为一个分区片段的源分区片段的最大总大小（以字节为单位）。大致对应于自动后台合并所能创建的分区片段的最大可能大小。（0 表示禁用合并）

可能的取值：

- 任意非负整数。

合并调度器会定期分析各分区中分区片段的大小和数量，如果资源池中有足够的空闲资源，就会启动后台合并。合并会持续进行，直到源分区片段的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool`（只考虑可用磁盘空间）。

## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在后台资源池可用资源处于最小值时，允许合并为一个分区片段的所有分区片段总大小（以字节为单位）的最大值。

可能的取值：

- 任意正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了在（池中）可用磁盘空间不足的情况下，仍然允许合并的分区片段总大小上限。
这对于减少小分区片段的数量，以及降低触发 `Too many parts` 错误的概率是必要的。
合并操作会通过将待合并分区片段的总大小加倍的方式预占磁盘空间。
因此，在可用磁盘空间较少时，可能会出现这样一种情况：虽然仍有剩余空间，但这些空间已经被正在进行的大型合并预占，导致其他合并无法启动，并且小分区片段的数量会随着每次插入而不断增长。

## max_cleanup_delay_period {#max_cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="300" />

用于清理旧队列日志、块哈希和分区片段的最长时间间隔。

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在写入表时进行压缩之前，未压缩数据块的最大大小。也可以在全局设置中指定该设置（参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值会覆盖该设置的全局值。

## max&#95;concurrent&#95;queries {#max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的并发执行查询的最大数量。
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。

可能的取值：

* 正整数。
* `0` — 不限制。

默认值：`0`（不限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## max&#95;delay&#95;to&#95;insert {#max_delay_to_insert}

<SettingsInfoBlock type="UInt64" default_value="1" />

以秒为单位的数值，当单个分区中的活动分区片段数量超过
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) 值时，用于计算 `INSERT` 的延迟。

可能的取值：

* 任何正整数。

`INSERT` 的延迟（以毫秒为单位）通过以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例如，如果某个分区有 299 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert = 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1，则 `INSERT` 会被延迟
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
毫秒。

自 23.1 版本起，公式更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如，如果某个分区有 224 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert
= 300，parts&#95;to&#95;delay&#95;insert = 150，max&#95;delay&#95;to&#95;insert = 1，
min&#95;delay&#95;to&#95;insert&#95;ms = 10，则 `INSERT` 会被延迟 `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。

## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

在 MergeTree 表存在大量未完成 mutation 时，允许执行新的 mutation 的最大延迟时间（毫秒）。

## max_digestion_size_per_segment {#max_digestion_size_per_segment} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "已废弃的设置"}]}]}/>

已废弃的设置，不再产生任何效果。

## max_file_name_length {#max_file_name_length} 

<SettingsInfoBlock type="UInt64" default_value="127" />

在不对文件名进行哈希处理时，允许保留原始文件名的最大长度。
仅当启用了 `replace_long_file_name_to_hash` SETTING 时才会生效。
此 SETTING 的取值不包含文件扩展名的长度。因此，建议将其设置为略低于文件名的最大长度（通常为 255 字节），并预留一定余量以避免文件系统错误。

## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="75" />

如果需要修改（删除、添加）的文件数量大于此设置的值，则不执行 ALTER。

可能的取值：

- 任意正整数。

默认值：75

## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="50" />

如果待删除文件的数量大于此设置值，则不要执行 ALTER 操作。

可能的取值：

- 任意正整数。

## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "新增设置"}]}]}/>

可以并行刷写的流（列）的最大数量（用于合并的 `max_insert_delayed_streams_for_parallel_write` 的对应参数）。仅对 Vertical 合并生效。

## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

在未选择到任何分区片段进行合并后，再次尝试选择要合并的分区片段前所等待的最长时间。较低的参数值会更频繁地在
background_schedule_pool 中触发选择任务，这在大规模集群中会导致大量对 ZooKeeper 的请求。

## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="2" />

当线程池中带有生存时间 (TTL) 的合并任务数量超过指定值时，不再分配新的 TTL 合并任务。这样可以为常规合并保留空闲线程，并避免出现 “Too many parts” 错误。

## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 

<SettingsInfoBlock type="UInt64" default_value="0" />

将每个副本的数据分片变更（part mutation）数量限制为指定数值。
设为 0 表示对每个副本的变更数量不作限制（但执行仍可能受其他设置约束）。

## max_part_loading_threads {#max_part_loading_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

已废弃的设置，无任何效果。

## max_part_removal_threads {#max_part_removal_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

已弃用的设置，不再产生任何效果。

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询中可访问的最大分区数量。

在创建表时指定的该设置值可以通过查询级别的设置进行覆盖。

可能的取值：

- 任意正整数。

你也可以在查询 / 会话 / 配置文件级别指定查询复杂度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。

## max_parts_in_total {#max_parts_in_total} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果一个表所有分区中的活动分区片段总数超过
`max_parts_in_total` 的值，`INSERT` 会被中断，并抛出 `Too many parts
(N)` 异常。

可能的取值：

- 任意正整数。

表中分区片段数量过多会降低 ClickHouse 查询性能，并增加 ClickHouse 启动时间。大多数情况下，这是设计不当导致的（例如在选择分区策略时出错——分区划分得过小）。

## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="100" />

一次可以合并的分区片段的最大数量（0 表示禁用）。不影响 OPTIMIZE FINAL 查询。

## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

失败的 mutation 最⻓延迟时间（毫秒）。

## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>

在复制中失败的 fetch 操作可被延后处理的最长时间。

## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "新增用于在复制队列中推迟合并任务的设置。"}]}]}/>

失败的复制合并任务允许被推迟的最长时间。

## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>

失败复制任务允许被延后的最长时间。如果该任务不是 fetch、merge 或 mutation，则使用此值。

## max_projections {#max_projections} 

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree 表中 PROJECTION 的最大数量。

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在网络上进行数据交换时的最大速度（以字节/秒为单位），适用于
[replicated](../../engines/table-engines/mergetree-family/replication.md)
复制拉取操作。该设置作用于特定表，不同于
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
这一作用于服务器级别的设置。

可以同时限制服务器级网络带宽和某个特定表的网络带宽，但在这种情况下，
表级设置的值必须小于服务器级设置的值。否则，服务器只会采用
`max_replicated_fetches_network_bandwidth_for_server` 这一设置。

该设置不会被严格精确地遵守。

可选值：

- 正整数。
- `0` — 不限制。

默认值：`0`。

**用法**

可用于在向新节点复制数据以进行添加或替换时对速度进行限速。

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

当存在非活动副本时，ClickHouse Keeper 日志中最多可以包含多少条记录。  
当记录数量超过该数值时，非活动副本将被视为丢失。

可能的取值：

- 任意正整数。

## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ReplicatedMergeTree 队列中，允许同时存在多少个用于合并和变更分区片段的任务。

## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1" />

在 `ReplicatedMergeTree` 队列中，允许同时进行的带有生存时间 (TTL) 的分区片段合并任务的最大数量。

## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中，允许同时存在多少个变更分区片段的任务。

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的最大速度（以字节/秒计），用于
[副本表](/engines/table-engines/mergetree-family/replacingmergetree)
发送。此设置作用于特定表，不同于
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
设置，它是作用在服务器级别。

可以同时限制服务器网络和特定表的网络带宽，但为此需要使表级
设置的值小于服务器级别的值。否则，服务器只会考虑
`max_replicated_sends_network_bandwidth_for_server` 这个设置。

该设置不会被完全精确地遵守。

可能的取值：

- 正整数。
- `0` — 不限速。

**用法**

可用于在向新节点复制数据以进行添加或替换时对速度进行限流。

## max_suspicious_broken_parts {#max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中的损坏的分区片段数量超过 `max_suspicious_broken_parts` 的值，将会禁止自动删除。

可能的取值：

- 任意正整数。

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有可疑损坏分区片段允许的最大总大小，超过该值时将禁止自动删除。

可能的取值：

- 任意正整数。

## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "新设置"}]}]}/>

所有补丁分区片段中数据的未压缩大小上限（以字节为单位）。
如果所有补丁分区片段中的未压缩数据总量超过该值，则会拒绝执行轻量级更新。
0 - 不限制。

## merge_max_block_size {#merge_max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

从参与合并的分区片段中读入内存的行数。

可能的取值：

- 任意正整数。

在合并过程中，会以每块包含 `merge_max_block_size` 行的方式从分区片段中读取数据，
然后进行合并，并将结果写入一个新的分区片段。读取的块会放入 RAM 中，
因此，`merge_max_block_size` 会影响合并所需的内存占用。
因此，对于行非常宽的表，合并可能会消耗大量内存
（如果平均行大小为 100kb，那么在合并 10 个分区片段时，
(100kb * 10 * 8192) ≈ 8GB 的 RAM）。通过减小 `merge_max_block_size`，
可以降低一次合并所需的内存，但会减慢合并速度。

## merge_max_block_size_bytes {#merge_max_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

合并操作中要形成的数据块大小（以字节为单位）。默认值与 `index_granularity_bytes` 相同。

## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在合并过程中用于预热缓存的数据部分（compact 或 packed）的最大大小。

## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part} 

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "添加一个新设置，用于限制在合并后 Wide 数据部分中可创建的动态子列数量，而不考虑在数据类型中指定的参数"}]}]}/>

用于限制在合并后 Wide 数据部分中，每个列可创建的动态子列的最大数量。
这有助于在不受数据类型中指定的动态参数影响的情况下，减少在 Wide 数据部分中创建的文件数量。

例如，如果表中有一个类型为 JSON(max_dynamic_paths=1024) 的列，并且将 merge_max_dynamic_subcolumns_in_wide_part 设置为 128，
那么在合并到 Wide 数据部分后，该部分中的动态路径数量将减少到 128，并且只有 128 条路径会被写入为动态子列。

## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

在未选择到任何分区片段进行合并后，再次尝试选择要合并的分区片段之前需要等待的最短时间。较小的取值会更频繁地在 background_schedule_pool 中触发选择任务，从而在大规模集群中导致大量对 ZooKeeper 的请求。

## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 

<SettingsInfoBlock type="Float" default_value="1.2" />

当当前没有可合并的数据时，合并选择任务的休眠时间会乘以该系数；当分配到合并任务时，休眠时间则会除以该系数。

## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于选择参与合并任务的分区片段的算法

## merge_selector_base {#merge_selector_base} 

<SettingsInfoBlock type="Float" default_value="5" />

影响已安排合并操作的写放大效应（专家级配置，除非完全理解其作用，否则不要更改）。适用于 Simple 和 StochasticSimple 合并选择器。

## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 

<SettingsInfoBlock type="UInt64" default_value="0" />

控制该逻辑相对于分区中分区片段数量的触发时机。因子越大，响应就越滞后。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once {#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

为 simple merge selector 启用启发式算法，以降低合并选择时的最大限制。
这将增加并发合并的数量，有助于缓解 TOO_MANY_PARTS 错误，但同时也会提高写放大效应。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 

<SettingsInfoBlock type="Bool" default_value="1" />

启用在选择要合并的分区片段时使用的启发式算法：如果范围右侧的分区片段大小小于 sum_size 的指定比例（0.01），则将其移除。
适用于 Simple 和 StochasticSimple 合并选择器。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent {#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

控制在构建下降曲线公式中所使用的指数值。降低该指数会减小单次合并的宽度，从而增加写放大效应，反之亦然。

## merge_selector_window_size {#merge_selector_window_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

一次最多要同时查看多少个分区片段。

## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。用于在合并期间预热缓存的分区片段总大小上限。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

已废弃的设置，不执行任何操作。

## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧分区片段、WAL 和变更清理操作的时间间隔（以秒为单位）。

可能的取值：

- 任意正整数。

## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行清理旧临时目录的时间间隔（以秒为单位）。

可能的取值：

- 任意正整数。

## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，当前不起任何作用。

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

在重新压缩生存时间 (TTL) 的合并操作再次执行前的最小延迟（以秒为单位）。

## merge_with_ttl_timeout {#merge_with_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

再次执行带删除生存时间 (TTL) 的合并操作前的最小延迟时间（秒）。

## merge_workload {#merge_workload} 

用于调节合并操作与其他工作负载之间的资源使用和共享方式。指定的值将作为此表后台合并的 `workload` setting 值。如果未指定（空字符串），则将使用服务器设置中的 `merge_workload` setting。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## min_absolute_delay_to_close {#min_absolute_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在关闭、停止处理请求并在状态检查期间不再返回 Ok 之前的最小绝对延迟时间。

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` 是否应仅应用于整个分区，而不应用于分区的子集。

默认情况下，会忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（参见
`enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- true, false

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个分区片段的已存在时间都大于 `min_age_to_force_merge_seconds` 的值，则合并这些分区片段。

默认情况下，会忽略 `max_bytes_to_merge_at_max_space_in_pool` 这个 setting
（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- 正整数。

## min_bytes_for_compact_part {#min_bytes_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

此设置已废弃，目前不起任何作用。

## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。以字节为单位指定未压缩数据部分的最小大小，达到该大小时将对数据部分使用 full 类型存储而非 packed 类型存储。

## min_bytes_for_wide_part {#min_bytes_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以存储为 `Wide` 格式的数据部分的最小字节数/行数。可以只设置其中一个、同时设置两者，或者都不设置。

## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

为新分区片段预热标记缓存和主索引缓存时所需的最小大小（未压缩字节数）

## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新的大型分区片段分布到卷磁盘 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 时启用均衡所需的最小字节数。

可能的取值：

- 正整数。
- `0` — 禁用均衡。

**使用说明**

`min_bytes_to_rebalance_partition_over_jbod` 设置项的值不应小于
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 的值。否则，ClickHouse 将抛出异常。

## min_columns_to_activate_adaptive_write_buffer {#min_columns_to_activate_adaptive_write_buffer} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "新设置"}]}]}/>

允许通过为包含大量列的表使用自适应写入缓冲区来减少内存使用。

可能的取值：

- 0 - 不限制
- 1 - 始终启用

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在写入下一个标记时，为触发压缩所需的未压缩数据块的最小大小。你也可以在全局设置中指定此设置
（参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
设置）。在创建表时指定的值会覆盖该设置的全局值。

## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在获取（fetch）后，对数据部分执行 `fsync` 所需的最小压缩字节数（0 表示禁用）

## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在合并后对分片执行 fsync 所需的最小压缩后字节数（0 表示禁用）

## min_delay_to_insert_ms {#min_delay_to_insert_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

当单个分区中存在大量尚未合并的分区片段时，向 MergeTree 表插入数据的最小时延（毫秒）。

## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

当存在大量未完成的 mutation 时，对 MergeTree 表执行 mutation 的最小延迟（毫秒）

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

为了执行插入操作，磁盘空间中必须保持的最小可用字节数。如果当前可用的空闲字节数小于
`min_free_disk_bytes_to_perform_insert`，则会抛出异常且插入不会执行。注意此设置：

- 会考虑 `keep_free_space_bytes` 设置的影响。
- 不会考虑本次 `INSERT` 操作将要写入的数据量。
- 仅在指定了一个正（非零）字节数时才会进行检查。

可能的取值：

- 任意正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，
ClickHouse 会选择那个能在更大可用磁盘空闲空间范围内允许执行插入操作的值。
:::

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 时，可用磁盘空间与磁盘总空间的最小比值。必须是 0 到 1 之间的浮点数。注意此设置：

- 会将 `keep_free_space_bytes` 设置纳入考虑。
- 不会考虑本次 `INSERT` 操作将要写入的数据量。
- 仅在指定了正值（非零）比率时才会进行检查。

可能的取值：

- 浮点数，0.0 - 1.0

注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和
`min_free_disk_bytes_to_perform_insert`，ClickHouse 将采用能够在可用磁盘空间更大时仍允许执行
`INSERT` 的那个取值进行判断。

## min_index_granularity_bytes {#min_index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

数据粒块允许的最小大小（以字节为单位）。

用于防止意外创建 `index_granularity_bytes` 过小的表。

## min_level_for_full_part_storage {#min_level_for_full_part_storage} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置"}]}]}/>

仅在 ClickHouse Cloud 中可用。指定将数据部件从打包存储切换为完整存储类型所需的最小部件级别。

## min_level_for_wide_part {#min_level_for_wide_part} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

以 `Wide` 格式而非 `Compact` 格式创建数据部件所需的最小部件层级。

## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

查询在应用 [max&#95;concurrent&#95;queries](#max_concurrent_queries) 设置时需要读取的最小标记数。

:::note
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。
:::

可能的取值：

* 正整数。
* `0` — 禁用（`max_concurrent_queries` 限制不应用于任何查询）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

在执行合并操作时，为使用直接 I/O 访问存储磁盘所需的最小数据量。合并数据分区片段时，ClickHouse 会计算所有待合并数据的总数据量。如果该数据量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 会使用直接 I/O 接口（`O_DIRECT` 选项）从存储磁盘读取和写入数据。  
如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。

## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器在单次操作中可选择合并的数据分区片段的最小数量
（专家级设置，如果不清楚其作用，请勿修改）。
0 - 表示禁用。适用于 Simple 和 StochasticSimple 合并选择器。

## min_relative_delay_to_close {#min_relative_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="300" />

相对于其他副本的最小允许延迟。当本副本落后于其他副本超过该延迟时，会主动关闭并停止对外提供服务，在状态检查期间不再返回 Ok。

## min_relative_delay_to_measure {#min_relative_delay_to_measure} 

<SettingsInfoBlock type="UInt64" default_value="120" />

仅当绝对延迟不小于该值时，才计算相对副本延迟。

## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 

<SettingsInfoBlock type="UInt64" default_value="120" />

已废弃的设置，不起任何作用。

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约这么多条最新记录，即使它们已经
过时。这不会影响表的正常工作：仅用于在清理前诊断 ZooKeeper
日志。

可能的取值：

- 任意正整数。

## min_rows_for_compact_part {#min_rows_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不再起任何作用。

## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。为数据 part 使用完整存储类型而非打包存储类型时所需的最小行数。

## min_rows_for_wide_part {#min_rows_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

以 `Wide` 格式（而不是 `Compact`）创建数据部分所需的最小行数。

## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在合并后，对数据部分执行 fsync 所需的最小行数（0 表示禁用）

## mutation_workload {#mutation_workload} 

用于调节 mutation 与其他工作负载之间的资源使用与共享方式。指定的值将作为此表后台 mutation 的 `workload` 设置项的值。如果未指定（空字符串），则使用服务器级别的 `mutation_workload` 设置项。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## non_replicated_deduplication_window {#non_replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="0" />

在非副本
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，为检查重复而存储哈希和的最近插入数据块的数量。

可能的取值：

- 任意正整数。
- `0`（禁用去重）。

使用了类似于副本表的去重机制（参见
[replicated_deduplication_window](#replicated_deduplication_window) 设置）。
已创建分区片段的哈希和会被写入磁盘上的本地文件。

## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

通知 SharedJoin 或 SharedSet 最新的区块号。仅适用于 ClickHouse Cloud。

## nullable_serialization_version {#nullable_serialization_version} 

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "新设置"}]}]}/>

控制 `Nullable(T)` 列所使用的序列化方式。

可选值：

- basic — 对 `Nullable(T)` 使用标准序列化方式。

- allow_sparse — 允许 `Nullable(T)` 使用稀疏编码。

## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 

<SettingsInfoBlock type="UInt64" default_value="20" />

当池中空闲条目的数量少于指定值时，不执行分区片段变更操作。这样可以为常规合并保留空闲线程，并避免出现“Too many parts”错误。

可能的取值：

- 任意正整数。

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的乘积。否则，ClickHouse 将抛出异常。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 

<SettingsInfoBlock type="UInt64" default_value="25" />

当线程池中空闲条目数小于指定值时，不在后台执行对整个分区的优化（此任务会在设置 `min_age_to_force_merge_seconds` 并启用
`min_age_to_force_merge_on_partition_only` 时生成）。这样可以为常规合并保留空闲线程，并避免触发 "Too many parts"。

可能的值：

- 正整数。

The value of the `number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
setting should be less than the value of the
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
Otherwise, ClickHouse throws an exception。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 

<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或复制队列）中的空闲条目数少于指定值时，开始降低要处理的合并（或放入队列的合并）的最大大小。
这样可以让小规模合并得以执行，避免池被长时间运行的大合并占满。

可能的取值：

- 任意正整数。

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="500" />

如果某个表中未完成的 mutation 数量至少达到该值，则会人为减慢该表的 mutation 执行速度。
设置为 0 时禁用。

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

当表中未完成的 mutation 数达到该值时，将抛出 "Too many mutations" 异常。设置为 0 时禁用。

## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。最多会考虑前 N 个分区用于合并。分区以加权随机方式选择，其中权重为该分区中可被合并的分区片段数量。

## object_serialization_version {#object_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Enable v3 serialization version for JSON by default to use advanced shared data serialization"}]}]}/>

JSON 数据类型的序列化版本。用于兼容性目的。

可选值：

- `v1`
- `v2`
- `v3`

只有版本 `v3` 支持更改共享数据的序列化版本。

## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "添加用于控制紧凑分区片段中 JSON 共享数据序列化桶数量的设置"}]}]}/>

指定紧凑分区片段中 JSON 共享数据序列化的桶数量。与 `map_with_buckets` 和 `advanced` 共享数据序列化方式配合使用。

## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "新增一个设置，用于控制 Wide 分区片段中 JSON 共享数据序列化使用的桶数量"}]}]}/>

用于控制在 Wide 分区片段中对 JSON 共享数据进行序列化时使用的桶数量。与 `map_with_buckets` 和 `advanced` 类型的共享数据序列化方式配合使用。

## object_shared_data_serialization_version {#object_shared_data_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

JSON 数据类型中共享数据的序列化版本。

可选值：

- `map` - 将共享数据存储为 `Map(String, String)`
- `map_with_buckets` - 将共享数据存储为若干独立的 `Map(String, String)` 列。使用 bucket 可以提升从共享数据中读取单独路径的性能。
- `advanced` - 为共享数据设计的专用序列化格式，可显著提升从共享数据中读取单独路径的性能。
请注意，这种序列化会增加磁盘上共享数据的存储大小，因为会存储大量附加信息。

`map_with_buckets` 和 `advanced` 序列化所使用的 bucket 数量由以下设置决定：
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)。

## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "添加一个设置，用于控制零级分区片段的 JSON 序列化版本"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "默认启用用于零级分区片段的 map_with_buckets 共享数据序列化版本"}]}]}/>

此设置允许为在插入过程中创建的零级分区片段，指定 JSON 类型中共享数据的不同序列化版本。
不建议对零级分区片段使用 `advanced` 共享数据序列化方式，因为这可能会显著增加插入时间。

## old_parts_lifetime {#old_parts_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="480" />

为防止在服务器意外重启时发生数据丢失，用于保留非活动分区片段的时间（以秒为单位）。

可能的取值：

- 任意正整数。

在将多个分区片段合并为一个新分区片段后，ClickHouse 会将原始分区片段标记为非活动状态，并且仅在经过 `old_parts_lifetime` 秒后才删除它们。
如果当前查询不再使用这些非活动分区片段（即该分区片段的 `refcount` 为 1），则会将其移除。

对于新分区片段不会调用 `fsync`，因此在一段时间内，新分区片段只存在于服务器的 RAM（操作系统缓存）中。如果服务器发生意外重启，新分区片段可能会丢失或损坏。为了保护数据，非活动分区片段不会被立即删除。

在启动过程中，ClickHouse 会检查分区片段的完整性。如果合并后的分区片段已损坏，ClickHouse 会将这些非活动分区片段恢复到活动列表中，并在之后重新对它们进行合并。随后，损坏的分区片段会被重命名（添加 `broken_` 前缀）并移动到 `detached` 目录。如果合并后的分区片段未损坏，则原始的非活动分区片段会被重命名（添加 `ignored_` 前缀）并移动到 `detached` 目录。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（表示已写入数据仅保留在 RAM 中的最长时间），但在磁盘系统负载较高时，数据实际写入可能会大幅延后。根据实验结果，将 `old_parts_lifetime` 设置为 480 秒，在此时间内可以保证新分区片段被写入磁盘。

## optimize_row_order {#optimize_row_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入期间是否优化行顺序，以提升新插入表分区片段的可压缩性。

仅对普通的 MergeTree 引擎表有效。对专用的 MergeTree 引擎表（例如 CollapsingMergeTree）无效。

MergeTree 表可以（可选）使用[压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)进行压缩。
像 LZ4 和 ZSTD 这样的通用压缩编解码器，如果数据能够呈现一定的模式，就能获得更高的压缩率。
较长的相同值序列通常具有很好的压缩效果。

如果启用该设置，ClickHouse 会尝试在新插入的分区片段中，以一种行顺序来存储数据，从而最小化新表分区片段各列中相同值序列的数量。
换句话说，相同值序列数量越少，单个序列就越长，从而压缩效果越好。

寻找最优行顺序在计算上是不可行的（NP-困难问题）。
因此，ClickHouse 使用启发式方法快速找到一种仍然比原始行顺序具有更好压缩率的行顺序。

<details markdown="1">

<summary>用于寻找行顺序的启发式方法</summary>

通常情况下，可以自由重排表（或表分区片段）中的行，
因为 SQL 认为不同行顺序下的同一张表（表分区片段）是等价的。

当为表定义了主键时，这种重排行的自由度会受到限制。
在 ClickHouse 中，一个主键 `C1, C2, ..., CN` 会强制表行按列 `C1`、`C2`、...、`Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
结果是，行只能在“等价类”内部进行重排，
即那些在其主键列中具有相同值的行。
直观来说，高基数的主键（例如包含 `DateTime64` 时间戳列的主键）会产生许多很小的等价类。
相反，低基数主键的表会产生少量且较大的等价类。没有主键的表代表一种极端情况，
即所有行都属于同一个等价类。

等价类越少且越大，在重新排列行时的自由度就越高。

在每个等价类内部，为找到最佳行顺序而使用的启发式方法由 D. Lemire、O. Kaser 在
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
中提出，其方法是基于按照非主键列的基数升序，对每个等价类中的行进行排序。

该方法分三步：
1. 基于主键列中的行值，找到所有等价类。
2. 对每个等价类，计算（通常是估算）非主键列的基数。
3. 对每个等价类，按非主键列基数的升序对行进行排序。

</details>

如果启用该设置，插入操作会产生额外的 CPU 开销，用于分析并优化新数据的行顺序。
预计 INSERT 操作所需时间会视数据特性增加 30–50%。
LZ4 或 ZSTD 的压缩率平均可提升 20–40%。

该设置最适合没有主键或主键基数较低的表，
即仅有少数不同主键值的表。
高基数主键（例如包含 `DateTime64` 类型时间戳列的主键）
预计不会从该设置中受益。

## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动分区片段前后需要等待的时间。

## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

用于在分片之间移动分区片段的实验性/尚未完善功能。不会考虑分片表达式的影响。

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活跃分区片段数量超过 `parts_to_delay_insert` 的数值，`INSERT` 会被人为地减慢。

可能的取值：

- 任意正整数。

ClickHouse 会人为地延长 `INSERT` 的执行时间（增加 “sleep”），以便后台合并进程能够以快于新增分区片段的速度合并这些分区片段。

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中活动分区片段的数量超过 `parts_to_throw_insert` 的值，则会中断 `INSERT`，并抛出 `Too many
parts (N). Merges are processing significantly slower than inserts` 异常。

可能的取值：

- 任意正整数。

为了在执行 `SELECT` 查询时获得最佳性能，需要将需要处理的分区片段数量最小化，参见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前，该设置为 300。可以将其设置为更大的值，这将降低出现 `Too many parts`
错误的概率，但同时可能会降低 `SELECT` 的性能。另外，如果发生合并问题（例如由于磁盘空间不足），相较于原先的 300，发现问题的时间也会更晚。

## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果分区片段大小之和超过此阈值，并且自创建复制日志条目以来经过的时间大于
`prefer_fetch_merged_part_time_threshold`，则优先从副本获取已合并的分区片段，
而不是在本地执行合并。这样可以加速非常耗时的合并操作。

可能的取值：

- 任意正整数。

## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）中该条目创建起经过的时间超过此阈值，并且这些分区片段大小的总和
大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本获取
已合并的分区片段，而不是在本地执行合并操作。这样可以加速处理耗时很长的合并。

可能的取值：

- 任意正整数。

## prewarm_mark_cache {#prewarm_mark_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则会在插入、合并、获取以及服务器启动时将标记保存到 `mark cache`，从而对 `mark cache` 进行预热。

## prewarm_primary_key_cache {#prewarm_primary_key_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为 true，则会在插入、合并、获取数据以及服务器启动时，将 marks 保存到 mark cache 中，从而预热 primary index 缓存。

## primary_key_compress_block_size {#primary_key_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主压缩块大小，即实际进行压缩的数据块大小。

## primary_key_compression_codec {#primary_key_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于主键的压缩编码。由于主键足够小且会被缓存，因此默认使用 ZSTD(3) 进行压缩。

## primary_key_lazy_load {#primary_key_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />

在首次使用时才将主键加载到内存中，而不是在表初始化时就加载。对于存在大量表的场景，这可以节省内存。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 

<SettingsInfoBlock type="Float" default_value="0.9" />

如果在某个数据部分中，主键某列的值发生变化的次数占比至少达到该比例，则在内存中跳过加载其后续列。这样可以通过不加载主键中无用的列来节省内存。

## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type="Float" default_value="0.9375" />

列中*默认*值数量与*所有*值数量的最小比例。设置该值后，列将使用稀疏
序列化方式进行存储。

如果某列是稀疏的（大部分为 0），ClickHouse 可以将其编码为稀疏格式，并自动优化
计算——在查询期间数据不需要完全解压。要启用这种稀疏序列化，请将
`ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。若该值大于或等于
1.0，则列将始终使用常规的完整序列化方式写入。

可能的取值：

* `0` 到 `1` 之间的浮点数，用于启用稀疏序列化
* 若不希望使用稀疏序列化，则设置为 `1.0`（或更大）

**示例**

请注意，下列表中的 `s` 列在 95% 的行中都是空字符串。在 `my_regular_table`
中不使用稀疏序列化，而在 `my_sparse_table` 中将
`ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

注意，`my_sparse_table` 中的 `s` 列占用的磁盘存储空间更少：

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

你可以通过查看 `system.parts_columns` 表中的 `serialization_kind` 列，来检查某个列是否使用稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

可以查看 `s` 中哪些分区片段是采用稀疏序列化方式存储的：

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

仅在 ClickHouse Cloud 中可用。在未删除或替换任何范围的情况下，再次尝试减少阻塞分区片段数量前需要等待的最短时间。较低的参数值会更频繁地在 `background_schedule_pool` 中触发任务，从而在大规模集群中产生大量对 ZooKeeper 的请求。

## refresh_parts_interval {#refresh_parts_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

如果该值大于 0，则会从底层文件系统刷新分区片段列表，以检查数据是否已在底层更新。
仅当表位于只读磁盘上时才可以设置该值（这意味着这是一个只读副本，而数据由另一个副本写入）。

## refresh_statistics_interval {#refresh_statistics_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

刷新统计信息缓存的时间间隔（以秒为单位）。如果设置为 0，则刷新将被禁用。

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="10800" />

当该设置的值大于 0 且合并后的部分位于共享存储上时，只有一个副本会立即开始执行合并。

:::note
零拷贝复制尚未准备好用于生产环境。
在 ClickHouse 22.8 及更高版本中，零拷贝复制默认处于禁用状态。

不推荐在生产环境中使用此功能。
:::

可能的取值：

- 任意正整数。

## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在转换过程中以兼容模式运行零拷贝功能。

## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

用于存储与表无关的零拷贝信息的 ZooKeeper 路径。

## remove_empty_parts {#remove_empty_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

在分区片段被生存时间 (TTL)、mutation 或 collapsing 合并算法清理后，移除空分区片段。

## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

针对尚未完成的实验性功能的设置。

## remove_unused_patch_parts {#remove_unused_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新设置"}]}]}/>

在后台删除已对所有活跃分区片段生效的补丁分区片段。

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 `max_file_name_length` 字节），则会将其替换为 SipHash128。

## replicated_can_become_leader {#replicated_can_become_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 `true`，此节点上的复制表副本将尝试成为 leader。

可能的取值：

- `true`
- `false`

## replicated_deduplication_window {#replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper 为最近插入的一定数量的数据块保存
哈希和，用于检查是否存在重复数据。

可能的取值：

- 任意正整数。
- 0（禁用去重）

`Insert` 命令会创建一个或多个数据块（分区片段）。在
[插入去重](../../engines/table-engines/mergetree-family/replication.md)
过程中，向复制表写入数据时，ClickHouse 会将
创建出的分区片段的哈希和写入 ClickHouse Keeper。只会为最近的
`replicated_deduplication_window` 个数据块存储哈希和。最早的哈希和会
从 ClickHouse Keeper 中移除。

将 `replicated_deduplication_window` 设置为较大的数值会减慢插入操作，
因为需要比较的记录更多。哈希和是根据字段名称和类型的组合以及插入
分区片段的数据（字节流）计算得出的。

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 为最近异步插入的若干数据块保存哈希值，用于检查重复。

可能的取值：

- 任意正整数。
- 0（对 `async_inserts` 禁用去重）

[Async Insert](/operations/settings/settings#async_insert) 命令的数据会被缓存为一个或多个数据块（分区片段）。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在向复制表写入时，ClickHouse 会将每次插入的哈希值写入 ClickHouse Keeper。哈希值仅对最近的 `replicated_deduplication_window_for_async_inserts` 个数据块进行存储。最早的哈希值会从 ClickHouse Keeper 中移除。
较大的 `replicated_deduplication_window_for_async_inserts` 值会降低异步插入的速度，因为需要比较更多条目。
哈希值是根据字段名称和类型的组合，以及插入数据（字节流）计算得到的。

## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

插入数据块的哈希和在从 ClickHouse Keeper 中被删除前保留的秒数。

可能的取值：

- 任意正整数。

类似于 [replicated_deduplication_window](#replicated_deduplication_window)，
`replicated_deduplication_window_seconds` 用于指定为插入去重而存储数据块哈希和的时长。早于
`replicated_deduplication_window_seconds` 的哈希和会从 ClickHouse Keeper 中删除，
即使它们仍小于 `replicated_deduplication_window`。

该时间是相对于最新记录的时间点，而不是物理时间。如果仅有这一条记录，则会被永久保存。

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="604800" />

异步插入的哈希值在 ClickHouse Keeper 中保留的时间（以秒为单位），超过该时间后将被移除。

可能的取值：

- 任意正整数。

与 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) 类似，
`replicated_deduplication_window_seconds_for_async_inserts` 指定为异步插入去重而存储数据块哈希值的时间窗口长度。早于
`replicated_deduplication_window_seconds_for_async_inserts` 的哈希值会从 ClickHouse Keeper 中移除，
即使其对应的块数尚未达到 `replicated_deduplication_window_for_async_inserts` 的数量限制。

该时间是相对于最新一条记录的时间，而不是实际时间。如果它是唯一的记录，则会被永久保存。

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，不再产生任何效果。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

已弃用的设置，不会产生任何效果。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

此设置已废弃，目前不起任何作用。

## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

可合并并在单个 MUTATE_PART 条目中执行的变更命令的最大数量（0 表示不限制）

## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不再起任何作用。

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 

<SettingsInfoBlock type="UInt64" default_value="15" />

已废弃的设置，无任何作用。

## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，目前不起任何作用。

## replicated_max_parallel_sends {#replicated_max_parallel_sends} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，目前不起任何作用。

## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

已弃用的设置，对系统行为没有任何影响。

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 

<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误的分区片段占分区片段总数的比例小于该值，则允许启动。

可能的取值：

- Float，0.0 - 1.0

## search_orphaned_parts_disks {#search_orphaned_parts_disks} 

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "新设置"}]}]}/>

ClickHouse 在执行任何 ATTACH 或 CREATE 表操作时都会扫描所有磁盘以查找孤立分区片段，
以避免在未在策略中定义（未包含在策略中的）磁盘上遗漏数据分区片段。
孤立分区片段通常源自潜在不安全的存储重新配置，例如某个磁盘被从存储策略中移除。
此设置通过磁盘的特征来限制要搜索的磁盘范围。

可选值：

- any - 范围不受限制。
- local - 范围仅限本地磁盘。
- none - 空范围，不进行搜索。

## serialization_info_version {#serialization_info_version} 

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Change to the newer format allowing custom string serialization"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "New setting"}]}]}/>

写入 `serialization.json` 时使用的序列化信息版本。
在集群升级期间，此设置是确保兼容性所必需的。

可选值：

- `basic` - 基本格式。
- `with_types` - 带有额外 `types_serialization_versions` 字段的格式，可为每种类型指定单独的序列化版本。
  这会使诸如 `string_serialization_version` 之类的设置生效。

在滚动升级期间，将其设置为 `basic`，使新服务器生成与旧服务器兼容的数据分区片段。升级完成后，切换为 `with_types` 以启用按类型划分的序列化版本。

## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置"}]}]}/>

启用对协调合并任务的重新调度。即使在
shared_merge_tree_enable_coordinated_merges=0 时，这也会很有用，因为它会为合并协调器收集统计信息，
并有助于缓解冷启动问题。

## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "减少 Keeper 中的元数据量。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 同步"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 

<SettingsInfoBlock type="Bool" default_value="0" />

停止为 shared merge tree 分配合并任务。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "新设置"}]}]}/>

当分区没有分区片段时，在 Keeper 中保留该分区的时间（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新设置"}]}]}/>

启用清理空分区的 Keeper 条目。

## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用协调合并策略

## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

启用将属性写入虚拟分区片段并在 keeper 中提交块

## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用对过期分区片段的检查。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

在 shared merge tree 中，在未被 ZooKeeper watch 触发的情况下，用于更新分区片段的时间间隔（秒）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "新设置"}]}]}/>

用于分区片段更新的初始退避间隔。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

用于服务器间 HTTP 连接的超时设置。仅适用于 ClickHouse Cloud

## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

用于服务器之间 HTTP 通信的超时时间。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud 同步"}]}]}/>

为 shared_merge_tree_leader_update_period 追加一个在 0 到 x 秒之间均匀分布的随机值，以避免惊群效应。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud 同步"}]}]}/>

用于重新检查负责分区片段更新的主节点的最长时间间隔。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

leader 节点在一次 HTTP 请求中尝试确认可删除的过期分区片段的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "新设置"}]}]}/>

分区片段更新的最大退避时间。仅适用于 ClickHouse Cloud

## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

分区片段更新 leader 的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

负责分区片段更新的 leader 的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与执行分区片段删除（killer 线程）的副本的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

用于尝试分配可能产生冲突的合并任务的最大副本数（可避免在合并任务分配中出现多余冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 允许的可疑损坏分区片段最大数量，超过该数量则拒绝自动分离"}]}]}/>

SMT 允许的可疑损坏分区片段最大数量，超过该数量则拒绝自动分离。

## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 所有损坏分区片段的最大总大小，若超过该值，将禁止自动执行 detach 操作"}]}]}/>

SMT 所有损坏分区片段的最大总大小，若超过该值，将禁止自动执行 detach 操作。

## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

指定在插入重试期间，为避免错误操作而保留插入记忆化 ID 的时长。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调器选举线程连续两次运行之间的时间间隔

## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "在负载之后降低协调器休眠时间"}]}]}/>

用于调整协调器线程延迟时间的系数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器与 ZooKeeper 同步以获取最新元数据的时间间隔

## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

协调器一次可向 MergerMutator 发起的合并请求数量

## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器线程两次运行之间的最长时间间隔

## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调器需要准备并分发给各个 worker 的合并条目数量

## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

合并协调器线程两次运行之间的最小间隔时间

## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

在执行即时操作后需要更新其状态时，merge worker 线程所使用的超时时间

## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并 worker 线程两次执行之间的时间间隔

## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "新设置"}]}]}/>

用于清理过期分区片段时，同一个 rendezvous 哈希分组中将包含多少个副本。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 

<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` 的比率高于该设置值时，会在 merge/mutate 选择任务中重新加载合并谓词。该设置仅在 ClickHouse Cloud 中可用

## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />

一次性调度的用于获取分区片段元数据的任务数量。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

在启动包含该分区片段的新合并之前，保留本地已合并分区片段的时长。
这为其他副本提供机会，以获取该分区片段并发起相应的合并操作。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

用于在本地合并完成后推迟为其立即分配下一次合并任务的分区片段最小大小（以行数计）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在启动包含该数据部分的新合并之前，本地已合并数据部分可保留的时间。为其他副本提供机会来获取该数据部分并启动相同的合并操作。
仅在 ClickHouse Cloud 中可用

## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

尽可能从 leader 读取虚拟分区片段。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "用于从其他副本获取分区片段数据的新设置"}]}]}/>

如果启用，所有副本都会尝试从已存在该数据的其他副本中获取分区片段的内存数据（例如主键、分区信息等）。

## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

根据后台任务调度，副本尝试重新加载其标志的时间间隔。

## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用从其他副本的内存缓存中请求文件系统（FS）缓存提示的功能。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "默认启用过期分区片段 v3"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

对过期分区片段使用紧凑格式：可减少对 Keeper 的负载，并改进
过期分区片段的处理。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，此“过多分区片段”计数器将依赖 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

应将多少个分区发现操作打包为一个批次

## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果存在大量过期的分区片段，清理线程会在一次迭代中最多尝试删除
`simultaneous_parts_removal_limit` 个分区片段。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。

## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

仅用于测试。请勿更改。

## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

仅用于测试，请勿修改。

## storage_policy {#storage_policy} 

<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略的名称

## string_serialization_version {#string_serialization_version} 

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Change to the newer format with separate sizes"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "New setting"}]}]}/>

控制顶层 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 被设置为 "with_types" 时生效。
当设置为 `with_size_stream` 时，顶层 `String` 列会使用单独的
`.size` 子列来存储字符串长度，而不是内联存储。这样可以支持真正的 `.size`
子列，并可能提升压缩效率。

嵌套的 `String` 类型（例如在 `Nullable`、`LowCardinality`、`Array` 或 `Map` 中）
不受影响，除非它们出现在 `Tuple` 中。

可能的取值：

- `single_stream` — 使用带内联长度的标准序列化格式。
- `with_size_stream` — 为顶层 `String` 列使用单独的长度流。

## table_disk {#table_disk} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

这是 `table_disk` 设置，其路径/端点应指向表数据，而不是数据库数据。仅可用于 s3_plain/s3_plain_rewritable/web。

## temporary_directories_lifetime {#temporary_directories_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

保留 tmp_- 目录的时间（秒）。不要将该值设置得过低，因为在该值过小的情况下，合并和变更操作可能无法正常执行。

## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 

<SettingsInfoBlock type="Seconds" default_value="7200" />

在开始执行带重压缩的合并之前的超时时间（秒）。在这段时间内，ClickHouse 会尝试从被指派执行该带重压缩合并任务的副本获取已重压缩的数据分片。

在大多数情况下，重压缩过程较慢，因此在超时之前，我们不会启动带重压缩的合并操作，而是会尝试从被指派执行该带重压缩合并任务的副本获取已重压缩的数据分片。

可能的取值：

- 任意正整数。

## ttl_only_drop_parts {#ttl_only_drop_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当某个分区片段中的所有行根据其 `TTL` 设置已过期时，是否完整删除该数据分区片段。

当 `ttl_only_drop_parts` 被禁用（默认）时，只会移除根据其生存时间 (TTL) 设置已过期的行。

当 `ttl_only_drop_parts` 被启用时，如果某个分区片段中的所有行都已根据其 `TTL` 设置过期，则会删除整个分区片段。

## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

允许在写入动态子列时使用自适应写缓冲区，以减少内存占用

## use_async_block_ids_cache {#use_async_block_ids_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 `true`，则会缓存异步插入的哈希值。

可能的取值：

- `true`
- `false`

一个包含多个异步插入的块会生成多个哈希值。
当某些插入是重复时，Keeper 在一次 RPC 中只会返回一个
重复的哈希值，这会导致不必要的 RPC 重试。
该缓存会监视 Keeper 中哈希值所在的路径。如果在 Keeper 中检测到更新，
缓存会尽快更新，这样就可以在内存中过滤掉重复的插入。

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

为 Variant 数据类型中的判别标记启用二进制序列化的紧凑模式。
当大多数情况下只使用单一变体或存在大量 NULL 值时，
此模式可以显著减少在分区片段中存储判别标记所需的内存。

## use_const_adaptive_granularity {#use_const_adaptive_granularity} 

<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个 part 使用固定的 granularity。这样可以在内存中压缩索引 granularity 的值。在超大规模负载且表结构较“窄”的场景下，这可能会很有用。

## use_metadata_cache {#use_metadata_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

已废弃的设置，不再产生任何效果。

## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中对数据分片的校验和使用较小的格式（数十字节），而不是普通格式（数十 KB）。在启用该设置之前，请确认所有副本均支持新格式。

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中存储分区片段头信息的方式。若启用，ZooKeeper 会存储更少的数据。详细信息请参见[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。

## use_primary_key_cache {#use_primary_key_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

对主键索引使用缓存，
而不是将所有索引都保存在内存中。对于非常大的表很有用。

## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="0" />

启用垂直合并算法所需的、参与合并的分区片段未压缩数据的最小（近似）字节数。

## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="11" />

用于激活垂直合并算法的非主键列最小数量。

## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

用于触发 Vertical 合并算法的
被合并分区片段中行数总和的最小（近似）值。

## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则会在垂直合并过程中优化轻量级删除。

## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并过程中会为下一列预取来自远程文件系统的数据。

## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭前，表会等待指定的时间，让唯一的分区片段（仅存在于当前副本上）被其他副本拉取（0 表示禁用）。

## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

已废弃的设置，不再产生任何作用。

## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="100" />

已废弃的设置，目前不起任何作用。

## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

已弃用的设置，不再起任何作用。

## write_final_mark {#write_final_mark} 

<SettingsInfoBlock type="Bool" default_value="1" />

此设置已废弃，无任何作用。

## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "默认在 Compact 分区片段中为子数据流写入标记"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置"}]}]}/>

启用后，将在 Compact 分区片段中为每个子数据流单独写入标记，而不是为每一列写入标记。
这样可以高效地从数据分区片段中读取单个子列。

例如，列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 会被序列化为以下子数据流：

- `t.a`：元组元素 `a` 的 String 数据
- `t.b`：元组元素 `b` 的 UInt32 数据
- `t.c.size0`：元组元素 `c` 的数组大小
- `t.c.null`：元组元素 `c` 的嵌套数组元素的空值映射
- `t.c`：元组元素 `c` 的嵌套数组元素的 UInt32 数据

当启用此设置时，我们会为上述 5 个子数据流中的每一个写入一个标记，这意味着如果需要，
可以从粒度中分别读取每个子数据流的数据。例如，如果只想读取子列 `t.c`，则只会读取
子数据流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据，而不会读取子数据流 `t.a` 和 `t.b` 的数据。禁用此设置时，
我们只会为顶层列 `t` 写入一个标记，这意味着即使只需要某些子数据流的数据，也总是会从粒度中读取整列数据。

## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 

<SettingsInfoBlock type="Float" default_value="0.05" />

为了获得更小且相互独立的范围，允许延迟删除的顶层分区片段的最大比例。建议不要修改该设置。

## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 

<SettingsInfoBlock type="UInt64" default_value="5" />

用于将独立的过期分区片段范围拆分为更小子范围的最大递归深度。建议不要更改。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用了零拷贝复制，则在尝试加锁之前，会根据用于合并或变更操作的分区片段大小随机休眠一段时间

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用了零拷贝复制，则在尝试获取合并或 mutation 的锁之前随机休眠一段时间，最长可达 500 ms。

## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期（单位：秒）。

可能的取值：

- 任意正整数。