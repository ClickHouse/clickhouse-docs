---
description: '`system.merge_tree_settings` 中的 MergeTree 设置'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表的设置'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局生效的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中进行配置，或者在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

自定义设置 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中为所有 `MergeTree` 表配置该设置的默认值：

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

针对特定表进行设置：

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

通过 `ALTER TABLE ... MODIFY SETTING` 更改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- 重置为全局默认值（取自 system.merge_tree_settings）
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree 设置

{/* 下列设置由位于
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  的脚本自动生成。
  */ }

## adaptive&#95;write&#95;buffer&#95;initial&#95;size

<SettingsInfoBlock type="UInt64" default_value="16384" />

自适应写入缓冲区的初始大小


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加一个隐式约束，只允许有效值（`1` 和 `-1`）。



## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


启用后，将为表中所有数值列添加最小-最大（跳过）索引。



## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}]}/>


启用后，会为表中所有字符串列添加最小-最大（跳过）索引。



## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于允许将分区键或排序键列设置为合并列的新设置。"}]}]}/>


启用后，允许在 CoalescingMergeTree 表中将合并列用作分区键或排序键。



## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

允许针对带有 `is_deleted` 列的 ReplacingMergeTree 执行实验性的 CLEANUP 合并。启用后，可以使用 `OPTIMIZE ... FINAL CLEANUP` 手动
将一个分区中的所有数据片段（part）合并为单个数据片段，并移除所有
已标记为删除的行。

还允许通过设置 `min_age_to_force_merge_seconds`、
`min_age_to_force_merge_on_partition_only` 和
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`
使此类合并在后台自动执行。



## allow&#95;experimental&#95;reverse&#95;key

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

启用在 MergeTree 排序键中使用降序排序的功能。此设置对于时间序列分析和 Top-N 查询特别有用，允许以时间倒序方式存储数据，从而优化查询性能。

在启用 `allow_experimental_reverse_key` 之后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这样可以在降序排序的查询中使用更高效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

**示例**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- time 字段按降序排列
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

在查询中使用 `ORDER BY time DESC` 时，会应用 `ReadInOrder`。

**默认值：** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用将浮点数用作分区键的功能。

可能的取值：
- `0` — 不允许使用浮点型分区键。
- `1` — 允许使用浮点型分区键。



## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许将 Nullable 类型用作主键。



## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "现在 projections 可以使用 _part_offset 列。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置，在该功能稳定之前，用于阻止创建包含父数据分片偏移列的 projections。"}]}]}/>


允许在 projections 的 SELECT 查询中使用 `_part_offset` 列。



## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "现在 SMT 默认会从 ZooKeeper 中移除过期的阻塞分片"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "云同步"}]}]}/>


用于减少共享 MergeTree 表中阻塞分片的后台任务。
仅在 ClickHouse Cloud 中可用



## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

请勿在生产环境中使用此设置，因为它尚未准备好。



## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新的设置，允许对分区或排序键列进行汇总"}]}]}/>


启用后，允许在 SummingMergeTree 表中将参与汇总的列用作分区键或排序键。



## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

不允许主/次级索引和排序键使用相同的表达式



## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许从 compact 部分到 wide 部分进行纵向合并。该设置在所有副本上必须保持一致。



## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 
<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Change the behaviour to allow ALTER `column` when they have dependent secondary indices"}]}]}/>


配置是否允许对由二级索引覆盖的列执行 `ALTER` 命令，以及在允许时应采取的操作。默认情况下，允许此类 `ALTER` 命令，并会重建索引。

可能的取值：
- `rebuild`（默认）：对 `ALTER` 命令中涉及的列所影响的所有二级索引进行重建。
- `throw`：通过抛出异常阻止对由二级索引覆盖的列执行任何 `ALTER`。
- `drop`：删除依赖的二级索引。新生成的数据分片将不包含这些索引，需要通过 `MATERIALIZE INDEX` 重新创建。
- `compatibility`：与原始行为一致：对 `ALTER ... MODIFY COLUMN` 使用 `throw`，对 `ALTER ... UPDATE/DELETE` 使用 `rebuild`。
- `ignore`：仅供专家使用。会使索引处于不一致状态，可能导致查询结果不正确。



## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则该副本自身从不合并数据部分，而是始终从其他副本下载已合并的数据部分。

可能的取值：
- true, false



## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

在执行变更/替换/分离等操作时，总是复制数据而不是创建硬链接。



## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


如果为 true，则在合并过程中应用补丁部分



## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用后，系统会为每个新建的 part 分配一个唯一的标识符。
启用前，请确认所有副本均支持 UUID 第 4 版。



## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代在等待 async_block_ids_cache 更新时的最长等待时间



## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，来自 INSERT 查询的数据会先存储在队列中，之后在后台刷新到表中。



## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新增设置"}]}]}/>


以逗号分隔的统计类型列表，会在所有适用的列上自动计算。
支持的统计类型：tdigest、countmin、minmax、uniq。



## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

合并或变更操作中单个步骤的目标执行时间。如果某个步骤耗时更长，则可能超过该目标值。



## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 被禁用（默认设置）时，只有在执行需要这些 part 的查询时，新的数据 part 才会被加载到缓存中。

启用后，`cache_populated_by_fetch` 会使所有节点在出现新的数据 part 时，直接从存储将其加载到本地缓存中，而无需通过查询来触发此操作。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)



## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "新设置"}]}]}/>


:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果该值不为空，则在获取之后（且启用了 `cache_populated_by_fetch` 的情况下），只有与此正则表达式匹配的文件才会被预加载到缓存中。



## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
已弃用的设置，不产生任何效果。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查，用于验证采样列或采样表达式对应列的数据类型是否正确。数据类型必须是无符号的[整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可能的取值：
- `true`  — 启用该检查。
- `false` — 在创建表时禁用该检查。

默认值：`true`。

默认情况下，ClickHouse 服务器会在创建表时检查用于采样或采样表达式的列的数据类型。如果已经存在包含不正确采样表达式的表，并且不希望服务器在启动时抛出异常，请将 `check_sample_column_is_correct` 设置为 `false`。



## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
已废弃的设置，不会产生任何效果。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、数据块哈希和数据分片的最小时间间隔。



## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

向 `cleanup_delay_period` 添加一个在 0 到 x 秒之间均匀分布的随机值，
以避免在表数量非常多的情况下出现惊群效应，以及因此对 ZooKeeper 造成拒绝服务（DoS）。



## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的推荐批大小（point 是抽象单位，但 1 个 point 大致相当于 1 个插入块）。



## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
已废弃的配置项，不执行任何操作。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于延迟计算列和二级索引大小的新配置项"}]}]}/>


在首次请求时再延迟计算列和二级索引的大小，而不是在表初始化时计算。



## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


需要预热到标记缓存中的列列表（在启用时生效）。留空表示所有列



## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。在 compact parts 中单个 stripe 可写入的最大字节数。



## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。在 compact 部分中单个 stripe 内可写入的最大 granule 数量。



## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。用于在合并期间将紧凑部分整体读入内存的最大部分大小。



## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

允许创建采样表达式未包含在主键中的表。仅在为了向后兼容而需要暂时使用定义不正确的表来运行服务器时才需要启用此项。



## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

标记文件支持压缩，可减小文件大小并加速网络传输。



## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

主键支持压缩，以减少主键文件大小并加快网络传输。



## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

仅当非活动数据部件的数量至少达到该值时，才启用并发部件删除（参见 `max_part_removal_threads`）。



## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "不允许创建不一致的 projection"}]}]}/>


是否允许为非经典 MergeTree（即不是 (Replicated, Shared) MergeTree）的表创建 projection。`ignore` 选项仅用于兼容性，可能会导致错误的查询结果。否则，在允许的情况下，需要指定在合并 projection 时的行为，是丢弃还是重建。因此，经典 MergeTree 会忽略此设置。它同样也控制 `OPTIMIZE DEDUPLICATE`，并对所有 MergeTree 系列表引擎生效。与 `lightweight_mutation_projection_mode` 选项类似，该设置为 part 级别。

可能的取值：
- `ignore`
- `throw`
- `drop`
- `rebuild`



## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>


指定当在表定义中未为某个列设置压缩编解码器时要使用的默认压缩编解码器。  
列的压缩编解码器选择顺序如下：
1. 在表定义中为该列设置的压缩编解码器
2. 在 `default_compression_codec`（本设置）中指定的压缩编解码器
3. 在 `compression` 设置中定义的默认压缩编解码器  

默认值：空字符串（未定义）。



## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

在某个副本上执行合并或变更操作（mutation）后，如果某个数据分片与其他副本上的数据分片在字节级不完全一致，此设置用于启用或禁用将该数据分片分离（detach）。如果禁用，则该数据分片会被删除。如果你希望之后分析这类分片，请启用此设置。

该设置适用于启用了
[data replication](/engines/table-engines/mergetree-family/replacingmergetree)
的 `MergeTree` 表。

可能的取值：

- `0` — 分片会被删除。
- `1` — 分片会被分离（detach）。



## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失的副本时不要分离旧的本地分片。

可能的取值：
- `true`
- `false`



## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用用于零拷贝复制的 `DETACH PARTITION` 查询。



## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用针对零拷贝复制的 FETCH PARTITION 查询。



## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制的 FREEZE PARTITION 查询。



## disk {#disk} 


存储磁盘名称。可以作为存储策略的替代项进行指定。



## dynamic_serialization_version {#dynamic_serialization_version} 
<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control Dynamic serialization versions"}]}]}/>


Dynamic 数据类型的序列化版本。用于保证兼容性。

可选值：
- `v1`
- `v2`
- `v3`



## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

启用将每行的 _block_number 列持久化存储。



## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

在合并过程中持久化虚拟列 `_block_number`。



## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

在可能的情况下，对索引粒度的值进行内存压缩



## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新增一个用于为 min_age_to_force_merge 限制最大字节数的设置。"}]}]}/>


用于控制是否让设置 `min_age_to_force_merge_seconds` 和
`min_age_to_force_merge_on_partition_only` 遵循设置
`max_bytes_to_merge_at_max_space_in_pool`。

可能的取值：
- `true`
- `false`



## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用向通过 `index_granularity_bytes` 设置控制粒度大小的模式过渡。在 19.11 版本之前，只能使用 `index_granularity` 设置来限制粒度大小。`index_granularity_bytes` 设置在从包含非常大行（数十到数百兆字节）的表中读取数据时，可以提升 ClickHouse 的性能。如果存在包含非常大行的表，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。



## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>


在将分区合并为单个 part 时，是否对 ReplacingMergeTree 使用 CLEANUP 合并。需要同时启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的取值：
- `true`
- `false`



## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

为复制的 MergeTree 表启用带 ZooKeeper 名称前缀的端点 ID。



## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

启用垂直合并算法。



## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


如果为分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表启用此设置，则源表和目标表的索引与投影必须完全一致。否则，目标表可以包含比源表更多的索引和投影（即为源表索引和投影的超集）。



## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "为 Wide 部分中 Variant 类型子列创建的文件名转义特殊字符"}]}]}/>


为 MergeTree 表的 Wide 部分中 Variant 数据类型子列创建的文件名中的特殊字符进行转义。出于兼容性考虑。



## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在选择要合并的数据部分时，将使用数据部分的估算实际大小（即排除通过 `DELETE FROM` 已被删除的行）。请注意，该行为仅对在启用此设置之后执行的 `DELETE FROM` 所影响的数据部分生效。

可能的取值：
- `true`
- `false`

**另请参阅**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
设置



## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新设置。"}]}]} />

在合并过程中，排除指定的以逗号分隔的 `skip` 索引列表，使其不会被构建和存储。如果
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) 为 false，则此设置不起作用。

被排除的 `skip` 索引仍然可以通过显式执行
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询进行构建和存储，或者在执行 INSERT 时根据
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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- 此设置对 INSERT 操作无影响

-- 在后台合并或通过 OPTIMIZE TABLE FINAL 执行显式合并时，idx_a 将被排除在更新之外

-- 可通过提供列表来排除多个索引
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- 默认设置，合并期间不排除任何索引更新
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

当此设置的值大于 0 时，仅有一个副本会立即开始执行合并，其他副本会在该时间内等待并下载该合并结果，而不是在本地执行合并。如果选定的副本未能在该时间内完成合并，则会回退到标准行为。

可能的取值：
- 任意正整数。



## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试。请勿更改。



## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试。请勿修改。



## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

要保留的已完成 mutation 记录的数量。如果为 0，则保留所有记录。



## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

在合并时强制通过文件系统缓存进行读取



## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的 part 执行 fsync。会显著降低插入性能，不建议与 wide parts 一起使用。



## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

在完成所有分片操作（写入、重命名等）后，对分片目录执行 fsync。



## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
已废弃的设置，不产生任何效果。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
已废弃的设置，不产生任何效果。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区内的非活动数据片段（part）数量超过 `inactive_parts_to_delay_insert` 的值，则 `INSERT` 会被人为减慢。

:::tip
当服务器无法足够快地清理数据片段（part）时，此设置会很有用。
:::

可能的取值：
- 任意正整数。



## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中的非活动 part 数量超过 `inactive_parts_to_throw_insert` 的值，`INSERT` 会被中断，并返回如下错误：

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception.

可能的取值：
- 任意正整数。



## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间的最大数据行数。即有多少行对应一个主键值。



## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据粒度的最大尺寸（单位：字节）。

若仅希望按行数限制粒度大小，可将其设置为 `0`（不推荐）。



## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试间隔（秒）。



## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
已废弃的设置，无任何作用。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
已废弃的设置，无任何作用。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
已废弃的设置，无任何作用。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除（`DELETE`）不适用于带有 projection 的表。这是因为 projection 中的行可能会受到 `DELETE` 操作的影响。因此默认值为 `throw`。不过，可以通过此选项改变该行为。当取值为 `drop` 或 `rebuild` 时，删除操作可以作用于带有 projection 的表。`drop` 会删除该 projection，因此当前查询可能会更快，因为 projection 被删除了，但后续查询可能会变慢，因为不再有 projection 可用。`rebuild` 会重建该 projection，这可能会影响当前查询的性能，但可能会加速后续查询。值得注意的是，这些选项只在 part 级别生效，这意味着未被触及的 part 中的 projection 会保持不变，而不会触发诸如 drop 或 rebuild 等操作。

可选值：
- `throw`
- `drop`
- `rebuild`



## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一同启用，
将在表启动时为现有数据分片计算已删除行的数量。请注意，这可能会减慢表的启动加载过程。

可能的取值：
- `true`
- `false`

**另请参阅**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置



## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

对于合并、变更（mutations）等后台操作，在放弃获取表锁之前等待的秒数。



## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块大小，即实际进行压缩的数据块大小。



## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于 marks 的压缩编码格式。由于 marks 体积较小且会被缓存，因此默认使用 ZSTD(3) 压缩。



## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>


启用该设置后，合并操作会为新的数据分片构建并存储 skip 索引。
否则，它们可以通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
或[在 INSERT 时](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)进行创建/存储。

另请参阅 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) 以实现更精细的控制。



## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

仅在执行 MATERIALIZE TTL 操作时重新计算 TTL 信息



## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 进行“部分过多”检查时，只有在（相关分区中的）平均数据分片大小不超过指定阈值时才会启用该检查。如果平均数据分片大小大于该阈值，则 INSERT 既不会被延迟也不会被拒绝。只要数据分片能够成功合并为更大的分片，这就允许在单台服务器上的单张表中存储数百 TB 的数据。此设置不会影响针对非活跃分片或分片总数的阈值。



## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

在资源池空间充足的情况下，可被合并成单个 part 的所有源 part 的最大总大小（以字节为单位）。该值大致对应自动后台合并任务所能创建的最大 part 大小。（0 表示禁用合并）

可能的取值：

- 任意非负整数。

合并调度器会定期分析各分区中 part 的大小和数量，如果资源池中有足够的空闲资源，就会启动后台合并。合并会持续进行，直到源 part 的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool`（只考虑可用磁盘空间）。



## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

在后台池可用资源处于最小值时，可合并为一个分片的所有分片总大小上限（以字节为单位）。

可能的值：
- 任意正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了即使池中可用磁盘空间不足时，仍然允许参与合并的分片总大小上限。  
这对于减少小分片的数量以及降低出现 `Too many parts` 错误的概率是必要的。  
合并会通过将被合并分片的总大小加倍的方式预先预留（占用）磁盘空间。  
因此，在可用磁盘空间较少时，可能会出现这样一种情况：虽然仍然有剩余空间，但这些空间已经被正在进行的大型合并预留，导致其他合并无法启动，从而使得小分片的数量在每次写入时持续增加。



## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

用于清理旧队列日志、块哈希和数据片段的最长时间间隔。



## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在写入表之前进行压缩时，未压缩数据块在压缩前的最大大小。也可以在全局设置中指定此设置（参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值会覆盖该设置的全局值。



## max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的可并发执行的查询的最大数量。
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。

可能的取值：

* 正整数。
* `0` — 不限制。

默认值：`0`（不限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max&#95;delay&#95;to&#95;insert

<SettingsInfoBlock type="UInt64" default_value="1" />

以秒为单位的数值，用于计算 `INSERT` 的延迟。当单个分区中的活动分片数量超过
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) 的设置值时生效。

可能的取值：

* 任意正整数。

`INSERT` 的延迟（以毫秒为单位）按照下列公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例如，如果某个分区有 299 个活动 part，并且 parts&#95;to&#95;throw&#95;insert
= 300，parts&#95;to&#95;delay&#95;insert = 150，max&#95;delay&#95;to&#95;insert = 1，则 `INSERT` 会被延迟
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
毫秒。

从 23.1 版本开始，公式更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如，如果某个分区有 224 个活动 part，且 parts&#95;to&#95;throw&#95;insert
= 300，parts&#95;to&#95;delay&#95;insert = 150，max&#95;delay&#95;to&#95;insert = 1，
min&#95;delay&#95;to&#95;insert&#95;ms = 10，则 `INSERT` 将被延迟执行 `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

在存在大量未完成 mutation 时，对 MergeTree 表执行变更操作的最大延迟时间（毫秒）。



## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "已弃用的设置"}]}]}/>



此设置已废弃，目前不产生任何效果。
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

在不对文件名进行哈希处理、保持其原样时所允许的最大文件名长度。
仅在启用 `replace_long_file_name_to_hash` 设置时生效。
此设置的值不包含文件扩展名的长度。因此，
建议将其设置为低于最大文件名长度（通常为 255 字节），并预留一定余量，以避免文件系统错误。



## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

如果待修改（删除、添加）的文件数量大于此设置值，则不会执行 ALTER 操作。

可能的取值：

- 任意正整数。

默认值：75



## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

如果待删除文件的数量大于此设置的值，则不执行 ALTER 操作。

可能的取值：
- 任意正整数。



## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>


可以并行刷新（flush）的最大流（列）数量
（在合并场景下，对应于 `max_insert_delayed_streams_for_parallel_write`）。仅对垂直合并（Vertical merge）生效。



## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

当一次未能选出任何数据片段进行合并时，在再次尝试选择要合并的数据片段前的最长等待时间。较低的配置值会更频繁地在 background_schedule_pool 中触发任务选择，这会在大规模集群中导致大量对 ZooKeeper 的请求。



## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
当池中带有 TTL 条目的合并任务数量超过指定值时，不再分配新的带 TTL 的合并任务。这样可以为常规合并保留空闲线程，并避免出现 “Too many parts” 错误。



## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

将每个副本的分片变更次数限制为指定数量。
0 表示对每个副本的变更次数不设上限（执行仍可能受其他设置约束）。



## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
已废弃的设置，目前不起任何作用。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
已废弃的设置，目前不起任何作用。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询中可访问的分区最大数量。

在创建表时指定的设置值，可以在查询级别的设置中进行覆盖。

可能的取值：
- 任意正整数。

你还可以在查询 / 会话 / 配置文件级别，指定查询复杂度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。



## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

如果某个表所有分区中的活动数据片总数超过
`max_parts_in_total` 的值，则会中断 `INSERT` 操作，并抛出 `Too many parts
(N)` 异常。

可能的取值：
- 任意正整数。

表中的数据片数量过多会降低 ClickHouse 查询性能，
并增加 ClickHouse 的启动时间。通常这是由设计不当造成的（例如在选择分区策略时出错，导致分区过小）。



## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

一次可以合并的最大数据分片数量（0 表示禁用）。不会影响 OPTIMIZE FINAL 查询。



## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

失败变更操作允许的最长延后时间。



## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "新增设置，用于在复制队列中允许延后拉取任务。"}]}]}/>


复制拉取任务失败后允许延后的最长时间。



## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "新增设置，用于启用在复制队列中延期执行合并任务。"}]}]}/>


失败的复制合并操作可被延后的最长时间。



## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>


失败复制任务的最长延后时间。当任务不是 fetch、merge 或 mutation 时使用该值。



## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree 表投影的最大数量。



## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制 [replicated](../../engines/table-engines/mergetree-family/replication.md) 获取操作在网络上传输数据的最大速率（以字节每秒为单位）。此设置作用于某个特定表，不同于作用于整个服务器的 [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth) 设置。

可以同时限制服务器网络带宽和特定表的网络带宽，但表级别设置的值必须小于服务器级别的值。否则，服务器只会考虑 `max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置在实际执行时并非完全精确。

可能的取值：

- 正整数。
- `0` — 不受限制。

默认值：`0`。

**用法**

可用于在向新节点复制数据（添加或替换节点）时对复制速度进行限流。



## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果存在非活动副本，ClickHouse Keeper 日志中最多可以保留多少条记录。  
当日志记录数超过该值时，非活动副本将被视为丢失。

可能的取值：
- 任意正整数。



## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

`ReplicatedMergeTree` 队列中允许同时存在的合并和变更分片任务数。



## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

在 ReplicatedMergeTree 队列中，允许同时执行多少个带有 TTL 的数据部分合并任务。



## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中，允许同时存在多少个对数据部件进行变更的任务。



## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行副本数据交换的最大速度（以字节/秒为单位），适用于
[replicated](/engines/table-engines/mergetree-family/replacingmergetree)
发送。该设置作用于特定表，不同于
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
设置（作用于服务器级别）。

可以同时限制服务器整体网络带宽和某个特定表的网络带宽，但为此表级别设置的值
必须小于服务器级别的设置值。否则，服务器只会采用
`max_replicated_sends_network_bandwidth_for_server` 设置。

该限制并非严格精确地执行。

可能的取值：

- 正整数。
- `0` — 不限制。

**使用说明**

可用于在复制数据以添加或替换新节点时对带宽进行限速（节流）。



## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中的损坏数据片段数量超过 `max_suspicious_broken_parts` 的值，则不会执行自动删除。

可能的取值：
- 任意正整数。



## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏分片的最大总大小，若超过此值，则禁止自动删除。

可能的取值：
- 任意正整数。



## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 
<SettingsInfoBlock type="UInt64" default_value="32212254720" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>


所有补丁部分中未压缩数据的最大总大小（字节）。
如果所有补丁部分中的数据量超过该值，将拒绝轻量级更新。
0 - 无限制。



## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

从参与合并的各个数据部分中读取到内存中的行数。

可能的取值：
- 任意正整数。

合并操作会按每次 `merge_max_block_size` 行的块大小，从各个数据部分读取行，
然后将其合并并把结果写入一个新的数据部分。读取的块会放在 RAM 中，
因此 `merge_max_block_size` 会影响合并所需的 RAM 大小。
因此，对于行非常宽的表，合并可能会消耗大量 RAM
（如果平均每行大小为 100KB，则在合并 10 个部分时，
(100KB * 10 * 8192) ≈ 8GB RAM）。通过减小 `merge_max_block_size`，
可以减少一次合并所需的 RAM，但会减慢合并速度。



## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

在合并操作中应形成的块的大小（字节数）。默认情况下，
其值与 `index_granularity_bytes` 相同。



## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。在合并过程中用于预热缓存的单个分片（compact 或 packed 类型）的最大大小。



## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part} 
<SettingsInfoBlock type="UInt64Auto" default_value="auto" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "新增设置，用于在合并后限制 Wide 数据部分中的动态子列数量，而不受数据类型中指定参数的影响"}]}]}/>


在合并后，每个 Wide 数据部分中每一列允许创建的动态子列的最大数量。
这可以在不考虑数据类型中指定的动态参数的情况下，减少 Wide 数据部分中创建的文件数量。

例如，如果表有一个类型为 `JSON(max_dynamic_paths=1024)` 的列，且将 `merge_max_dynamic_subcolumns_in_wide_part` 设置为 128，
那么在合并到 Wide 数据部分后，该部分中的动态路径数量将被减小到 128，并且只有 128 个路径会作为动态子列写入。



## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

在未选中任何数据片段用于合并后，再次尝试选择要合并的数据片段之前等待的最短时间。将该值设置得更低会更频繁地在 `background_schedule_pool` 中触发选择任务，这会在大型集群中导致向 ZooKeeper 发起大量请求。



## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

当没有可合并的数据时，合并选择任务的休眠时间会乘以该系数；当分配到合并任务时，则会除以该系数。



## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于选择要分配参与合并的数据部分的算法



## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
影响已分配合并任务的写入放大（专家级设置，如果不理解其作用，请不要修改）。适用于 Simple 和 StochasticSimple 合并选择器



## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

控制该逻辑相对于分区中数据块数量在何时开始生效。系数越大，触发反应就越滞后。



## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

启用用于选择要合并分片的启发式算法：如果某些分片位于区间右侧，且其大小小于总大小 sum_size 的指定比例（0.01），则将其移除。  
适用于 `Simple` 和 `StochasticSimple` 合并选择器。



## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

一次要同时查看的分片数量。



## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。合并期间为预热缓存而加载的所有数据分片的最大总大小。



## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
已废弃的配置，不执行任何操作。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧 parts、WAL 和 mutations 清理的时间间隔（以秒为单位）。

可能的取值：
- 任意正整数。



## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

以秒为单位设置 ClickHouse 清理旧临时目录的时间间隔。

可能的值：
- 任意正整数。



## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，不再产生任何效果。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在再次执行带有重新压缩 TTL 的合并前的最小延迟时间（以秒为单位）。



## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

在重新执行带有 DELETE TTL 的合并操作前需要等待的最小时间（秒）。



## merge_workload {#merge_workload} 


用于调节合并操作与其他工作负载之间的资源使用和共享方式。指定的值会作为此表后台合并的 `workload` 设置值。如果未指定（为空字符串），则使用服务器设置 `merge_workload` 的值。

**另请参阅**
- [工作负载调度](/operations/workload-scheduling.md)



## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在关闭前的最小绝对延迟时间；在此期间停止处理请求，并在状态检查时不返回 OK。



## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` 是否仅应用于整个分区，而不应用于分区内的部分数据。

默认情况下，将忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（参见
`enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：
- true, false



## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个数据部分的存在时间都超过 `min_age_to_force_merge_seconds` 的值，则对这些数据部分执行合并。

默认情况下，会忽略对 `max_bytes_to_merge_at_max_space_in_pool` 的设置
（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：
- 正整数。



## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已弃用的设置，不产生任何效果。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。以字节为单位指定最小未压缩大小，
用于对数据部分使用完整类型的存储，而不是打包存储方式。



## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

以 `Wide` 格式存储的数据片段所需的最小字节数或行数。可以只设置其中一项、同时设置两项，或都不设置。



## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


为新数据部分预热标记缓存和主索引缓存所需的最小大小（未压缩字节数）



## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新的大数据片段（part）分布到卷中的磁盘（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）时，启用重新平衡所需的最小字节数。

可能的取值：

- 正整数。
- `0` — 禁用重新平衡。

**使用说明**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不应小于
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024 的值。否则，ClickHouse 会抛出异常。



## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在写入下一个标记（mark）时触发压缩所需的未压缩数据块的最小大小。也可以在全局设置中指定该参数（参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。在创建表时为该参数指定的值会覆盖其全局设置值。



## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在拉取后对数据片段执行 fsync 所需的最小压缩字节数（0 表示禁用）



## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在合并后对数据分片执行 fsync 的最小压缩字节数（0 表示禁用）



## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

当单个分区中存在大量未合并的部分时，向 MergeTree 表插入数据的最小延迟（以毫秒为单位）。



## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在存在大量未完成 mutation 的情况下，对 MergeTree 表执行 mutation 的最小延迟时间（毫秒）。



## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

为执行插入操作，磁盘上必须保持的最小空闲字节数。如果当前可用空闲字节数小于
`min_free_disk_bytes_to_perform_insert`，则会抛出异常，并且不会执行插入操作。注意该设置：
- 会考虑 `keep_free_space_bytes` 设置。
- 不会考虑此次 `INSERT` 操作将要写入的数据量。
- 仅在将其设置为正数（非零）字节数时才会进行检查。

可能的取值：
- 任意正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，
ClickHouse 会采用其中要求可用空间更大的那个值。
:::



## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 时，磁盘可用空间与磁盘总空间的最小比例。必须是介于 0 和 1 之间的浮点值。注意，该设置：
- 会考虑 `keep_free_space_bytes` 设置。
- 不会考虑此次 `INSERT` 操作将要写入的数据量。
- 仅在指定了正的（非零）比例时才会进行检查。

可能的取值：
- Float，0.0 - 1.0

注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和
`min_free_disk_bytes_to_perform_insert`，ClickHouse 将以其中要求可用磁盘空间更大的那个值为准。



## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

数据粒度单元允许的最小大小（字节）。

用于防止因 `index_granularity_bytes` 设置过低而意外创建表。



## min_level_for_full_part_storage {#min_level_for_full_part_storage} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


仅在 ClickHouse Cloud 中可用。对数据 part 使用完整存储类型（而非打包存储）所需的最小 part 级别。



## min_level_for_wide_part {#min_level_for_wide_part} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


将数据部件创建为 `Wide` 格式（而非 `Compact` 格式）所需的最小部件级别。



## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

查询在应用 [max&#95;concurrent&#95;queries](#max_concurrent_queries) 设置前需要读取的最小 mark 数量。

:::note
查询仍然会受其他 `max_concurrent_queries` 设置的限制。
:::

可能的取值：

* 正整数。
* `0` — 禁用（`max_concurrent_queries` 限制不应用到任何查询）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

在合并操作中启用对存储磁盘直接 I/O 访问所需的最小数据量。合并数据分片时，ClickHouse 会计算所有待合并数据的总数据量。如果该数据量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 就会使用直接 I/O 接口（`O_DIRECT` 选项）从存储磁盘读取并向其写入数据。  
如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。



## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器在一次合并中可以选择的最少数据分片数量
（高级参数，如果不了解其作用，请不要修改）。
0 - 表示禁用。适用于 Simple 和 StochasticSimple 合并选择器。



## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

与其他副本相比，在本副本关闭、停止处理请求并在状态检查中不再返回 Ok 之前所允许的最小延迟。



## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

仅在绝对延迟不小于该值时，才计算副本的相对延迟。



## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
已弃用的设置，不产生任何效果。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约这么多条最近的记录，即使它们已经过时。  
这不会影响表的正常工作：仅用于在清理前对 ZooKeeper 日志进行诊断。

可能的取值：
- 任何正整数。



## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，不再产生任何效果。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。将数据部分使用完整类型存储而非打包类型存储时所需的最小行数。



## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

将数据部分创建为 `Wide` 格式而非 `Compact` 格式时所需的最小行数。



## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在合并后对数据分片执行 fsync 所需的最小行数（0 表示禁用）



## mutation_workload {#mutation_workload} 

用于调节变更（mutation）与其他工作负载之间的资源使用和共享方式。指定的值会用作该表后台变更操作的 `workload` 设置值。如果未指定（空字符串），则会使用服务器级设置 `mutation_workload`。

**另请参阅**
- [工作负载调度](/operations/workload-scheduling.md)



## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在非副本
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，为检查重复数据而存储哈希和的最近插入数据块的数量。

可能的取值：
- 任意正整数。
- `0`（禁用去重）。

使用的去重机制与副本表类似（参见
[replicated_deduplication_window](#replicated_deduplication_window) 设置）。
已创建数据部分的哈希和会写入磁盘上的本地文件。



## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


将最新块编号通知到 SharedJoin 或 SharedSet。仅在 ClickHouse Cloud 中可用。



## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

当池中空闲条目的数量小于指定值时，不执行数据分片变更（part mutation）。这样可以为常规合并保留空闲线程，并避免出现“Too many parts”错误。

可能的取值：
- 任意正整数。

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的乘积。否则，ClickHouse 将抛出异常。



## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

当池中空闲条目的数量少于指定值时，将不会在后台执行整个分区的优化（此任务会在设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成）。这样可以为常规合并保留空闲线程，并避免出现"Too many parts"的情况。

可能的值：
- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的乘积。否则，ClickHouse 会抛出异常。



## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或复制队列）中的空闲条目数量小于指定值时，开始降低可处理的合并的最大大小（或放入队列的合并的最大大小）。
这样可以让较小的合并任务得以及时执行，避免池被长时间运行的合并任务占满。

可能的值：
- 任意正整数。



## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
如果表中未完成的 mutation 数量至少达到该值，则会人工减慢该表的 mutation 执行速度。
设置为 0 时禁用。



## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表中未完成的 mutation 数量至少达到该值，则抛出 “Too many mutations” 异常。设置为 0 时禁用。



## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


仅在 ClickHouse Cloud 中可用。最多会考虑前 N 个分区用于合并。分区的选择采用加权随机方式，其中权重为该分区中可合并的数据分片数量。



## object_serialization_version {#object_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


用于 JSON 数据类型的序列化版本。用于保证兼容性。

可能的取值：
- `v1`
- `v2`
- `v3`

只有版本 `v3` 支持更改共享数据的序列化版本。



## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in compact parts"}]}]}/>


在 Compact 部分中用于 JSON 共享数据序列化的桶（bucket）数量。适用于 `map_with_buckets` 和 `advanced` 两种共享数据序列化方式。



## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "添加用于控制宽部件中 JSON 共享数据序列化所用桶数量的设置"}]}]}/>


宽部件中用于 JSON 共享数据序列化的桶数量。适用于 `map_with_buckets` 和 `advanced` 类型的共享数据序列化方式。



## object_shared_data_serialization_version {#object_shared_data_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


用于 JSON 数据类型中共享数据的序列化版本。

可选值：
- `map` - 将共享数据存储为 `Map(String, String)`
- `map_with_buckets` - 将共享数据存储为多个独立的 `Map(String, String)` 列。使用 bucket 可以提高从共享数据中读取单个路径的性能。
- `advanced` - 专门为共享数据设计的高级序列化方式，旨在显著提升从共享数据中读取单个路径的效率。
请注意，这种序列化会增加共享数据在磁盘上的存储大小，因为会存储大量额外信息。

`map_with_buckets` 和 `advanced` 序列化方式的 bucket 数量由以下设置确定：
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)。



## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "新增用于控制零级 part 的 JSON 序列化版本的设置"}]}]}/>


此设置允许为在插入过程中创建的零级 part 的 JSON 类型中的共享数据指定不同的序列化版本。
不建议对零级 part 使用 `advanced` 共享数据序列化，因为这可能会显著增加插入耗时。



## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

在服务器意外重启的情况下，为防止数据丢失而保留非活动数据片段的时间（以秒为单位）。

可能的取值：
- 任意正整数。

在将多个数据片段合并为一个新的数据片段后，ClickHouse 会将原始数据片段标记为非活动状态，并仅在经过 `old_parts_lifetime` 秒后才删除它们。只有当当前查询不再使用这些非活动数据片段时（即该数据片段的 `refcount` 为 1），它们才会被删除。

对于新的数据片段不会调用 `fsync`，因此在一段时间内，新数据片段只存在于服务器的 RAM（操作系统缓存）中。如果服务器意外重启，新数据片段可能会丢失或损坏。为保护数据，非活动数据片段不会被立即删除。

在启动时，ClickHouse 会检查数据片段的完整性。如果合并后的数据片段已损坏，ClickHouse 会将非活动数据片段重新加入到活动列表中，并在之后再次对其进行合并。随后，损坏的数据片段会被重命名（添加 `broken_` 前缀）并移动到 `detached` 目录。如果合并后的数据片段未损坏，则原始的非活动数据片段会被重命名（添加 `ignored_` 前缀）并移动到 `detached` 目录。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（写入数据仅存储在 RAM 中的最长时间），但在磁盘系统负载较高的情况下，数据可能会更晚才被写入。通过实验，为 `old_parts_lifetime` 选择了 480 秒这个值，在该时间内可以保证新的数据片段被写入磁盘。



## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入时是否优化行顺序，以提高新插入表分片的可压缩性。

仅对普通的 MergeTree 引擎表生效。对专用的 MergeTree 引擎表（例如 CollapsingMergeTree）不起作用。

MergeTree 表（可选地）会使用[压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)进行压缩。
像 LZ4 和 ZSTD 这样的通用压缩编解码器，如果数据呈现出明显模式，则可以实现最大压缩率。
相同值的长连续区间通常压缩效果很好。

如果启用了此设置，ClickHouse 会尝试在新插入的分片中，以一种行顺序来存储数据，从而最小化新表分片各列中的相同值连续区间的数量。
换句话说，相同值连续区间数量少意味着单个区间长度较长，因而更易压缩。

寻找最优行顺序在计算上是不可行的（NP 难问题）。
因此，ClickHouse 使用启发式方法快速找到一种仍能较原始行顺序改善压缩率的行顺序。

<details markdown="1">

<summary>用于寻找行顺序的启发式方法</summary>

一般来说，可以任意重排表（或表分片）的行，因为在 SQL 中，不同行顺序的相同表（表分片）是等价的。

当为表定义了主键时，这种重排行的自由度会受到限制。
在 ClickHouse 中，一个主键 `C1, C2, ..., CN` 强制要求表的行按列 `C1`、`C2`、...、`Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
结果是，行只能在“等价类”内部重排，也就是说，只能在主键列取值相同的行之间重排。
直观上，高基数主键（例如涉及 `DateTime64` 时间戳列的主键）会产生很多小的等价类。
同样，低基数主键的表会产生较少且较大的等价类。
没有主键的表代表极端情况：只有一个跨越所有行的等价类。

等价类越少、规模越大，在重新洗牌行时的自由度就越高。

在每个等价类中用于寻找最佳行顺序的启发式方法由 D. Lemire、O. Kaser 在
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) 中提出，
其基于按非主键列的基数升序对每个等价类内的行进行排序。

该方法包含三个步骤：
1. 基于主键列中的行值找到所有等价类。
2. 对每个等价类，计算（通常是估算）非主键列的基数。
3. 对每个等价类，按照非主键列基数的升序对行进行排序。

</details>

如果启用此设置，插入操作会额外消耗 CPU 以分析并优化新数据的行顺序。
根据数据特性，预计 INSERT 操作耗时会增加 30-50%。
LZ4 或 ZSTD 的压缩率平均可提升 20-40%。

该设置最适用于没有主键或低基数主键的表，即只有少量不同主键值的表。
高基数主键（例如涉及 `DateTime64` 类型时间戳列的主键）预计不会从该设置中获益。



## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动数据部件前后需要等待的时间。



## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

用于在分片之间移动数据分片（parts）的实验性/尚未完善的功能。不会考虑分片表达式。



## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活跃 part 数量超过 `parts_to_delay_insert` 的值，`INSERT` 操作会被有意放慢。

可能的取值：
- 任意正整数。

ClickHouse 会人为地延长执行 `INSERT` 的时间（添加 `sleep` 延时），以便后台合并进程可以以快于新 part 生成速度的节奏合并这些 part。



## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活动 part 数量超过
`parts_to_throw_insert` 的取值，`INSERT` 会被中断，并抛出 `Too many
parts (N). Merges are processing significantly slower than inserts`
异常。

可能的取值：
- 任意正整数。

为了在执行 `SELECT` 查询时获得最佳性能，需要尽量减少被处理的 part 数量，参见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前，该设置的默认值为 300。您可以将其设置为更高的值，以降低触发 `Too many parts`
错误的概率，但同时可能会降低 `SELECT` 的性能。此外，如果出现合并问题（例如由于磁盘空间不足），相比原先默认的 300，您会更晚察觉到该问题。




## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果各个数据部分的大小之和超过该阈值，并且自复制日志条目创建以来的时间大于 `prefer_fetch_merged_part_time_threshold`，则优先从副本获取已合并的数据部分，而不是在本地执行合并。这样可以加速耗时较长的合并操作。

可能的取值：
- 任意正整数。



## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

如果从复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建起经过的时间超过此阈值，并且这些 part 的大小总和大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本拉取已合并的 part，而不是在本地执行合并。这样可以加速耗时很长的合并过程。

可能的取值：
- 任意正整数。



## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
如果设置为 true，则会在插入、合并、拉取以及服务器启动时，通过将标记保存到标记缓存中来预热标记缓存。



## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为 true，则会在插入、合并、获取以及服务器启动时，将 marks 保存到 mark cache 中，以预热主键索引缓存。



## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主压缩块的大小，即实际进行压缩的数据块大小。



## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于主键数据的压缩编解码器。由于主键通常足够小且会被缓存，因此默认压缩编解码器为 ZSTD(3)。



## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
在首次使用时才将主键加载到内存中，而不是在表初始化期间加载。
在存在大量表的情况下，这可以节省内存。



## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

如果在某个数据片段中，主键某一列的取值发生变化的次数占比至少达到该比例，则跳过在内存中加载其后续列。这样可以通过不加载主键中不必要的列来节省内存占用。



## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization

<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 *默认* 值数量与 *所有* 值数量的最小比率。将此值设置为特定数值后，该列将使用稀疏序列化方式进行存储。

如果一列是稀疏的（大部分值为零），ClickHouse 可以将其编码为稀疏格式并自动优化计算——在查询期间，无需对数据进行完全解压缩。要启用稀疏序列化，需要将 `ratio_of_defaults_for_sparse_serialization`
设置为小于 1.0。若该值大于或等于 1.0，则该列始终会以常规的完整序列化方式写入。

可能的取值范围：

* 在 `0` 和 `1` 之间的浮点数，用于启用稀疏序列化
* 如果不希望使用稀疏序列化，则设置为 `1.0`（或更大）

**示例**

注意下表中的 `s` 列在 95% 的行中都是空字符串。在 `my_regular_table` 中我们不使用稀疏序列化，而在
`my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为
0.95：

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

您可以通过查看 `system.parts_columns` 表中的 `serialization_kind` 列，来验证某列是否使用稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

您可以通过稀疏序列化查看 `s` 中哪些部分被存储：

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


仅在 ClickHouse Cloud 中可用。表示在没有任何范围被删除或替换的情况下，再次尝试减少阻塞部分之前需要等待的最短时间。较低的配置值会更频繁地触发 `background_schedule_pool` 中的任务，从而在大规模集群中产生大量发往 ZooKeeper 的请求。



## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>


如果该值大于零，则会从底层文件系统刷新数据部件列表，以检查数据是否在后台已被更新。
只有当表位于只读磁盘上时（这意味着这是一个只读副本，而数据由另一个副本写入）时，才能设置此参数。



## refresh_statistics_interval {#refresh_statistics_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>


刷新统计信息缓存的时间间隔（以秒为单位）。若设置为 0，则将禁用缓存刷新。



## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

当该设置的值大于零时，如果合并后的数据部件位于共享存储上，则只有一个副本会立即执行该合并。

:::note
零拷贝复制尚未准备好用于生产环境。
在 ClickHouse 版本 22.8 及更高版本中，零拷贝复制默认是禁用的。

不建议在生产环境中使用此功能。
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

在通过 TTL、变更（mutation）或折叠合并（collapsing merge）算法清理后，删除空的分片（parts）。



## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

针对尚未完成的实验性功能的设置。



## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


在后台删除已应用到所有活动数据片段的补丁片段。



## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果列对应的文件名过长（超过 `max_file_name_length` 字节），则将其替换为 SipHash128。



## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则此节点上的复制表副本会尝试竞争成为 leader。

可能的取值：
- `true`
- `false`



## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>


ClickHouse Keeper 为最近插入的若干数据块保存哈希值，用于检查是否存在重复。

可能的取值：
- 任意正整数。
- 0（禁用去重）

`Insert` 命令会创建一个或多个数据块（parts）。对于[插入去重](../../engines/table-engines/mergetree-family/replication.md)，在写入复制表时，ClickHouse 会将创建的各个 part 的哈希值写入 ClickHouse Keeper。仅为最近的 `replicated_deduplication_window` 个数据块保存哈希值。最早的哈希值会从 ClickHouse Keeper 中移除。

将 `replicated_deduplication_window` 设置为较大的数值会减慢 `Insert` 操作，因为需要比较的条目更多。哈希值是根据字段名称与类型的组合以及插入的 part 数据（字节流）计算得到的。



## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

此设置指定 ClickHouse Keeper 为最近异步插入的多少个数据块保存哈希和，用于检查是否存在重复。

可能的取值：
- 任意正整数。
- 0（对 `async_inserts` 禁用去重）

[Async Insert](/operations/settings/settings#async_insert) 命令会被缓存在一个或多个数据块（part）中。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在写入复制表时，ClickHouse 会将每次插入的哈希和写入 ClickHouse Keeper。仅为最近的 `replicated_deduplication_window_for_async_inserts` 个数据块存储哈希和。较旧的哈希和会从 ClickHouse Keeper 中删除。
较大的 `replicated_deduplication_window_for_async_inserts` 会减慢 `Async Inserts` 的速度，因为需要比较更多的条目。
哈希和是根据字段名和类型的组合以及插入的数据本身（字节流）计算得到的。



## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>


插入的数据块的哈希和在被从 ClickHouse Keeper 中移除之前所经过的秒数。

可能的取值：
- 任意正整数。

与 [replicated_deduplication_window](#replicated_deduplication_window) 类似，
`replicated_deduplication_window_seconds` 指定为插入去重而保存数据块哈希和的时间长度。早于
`replicated_deduplication_window_seconds` 的哈希和会从 ClickHouse Keeper 中移除，
即使它们小于 `replicated_deduplication_window`。

该时间是相对于最新一条记录的时间，而不是物理时间（wall time）。如果这是唯一的一条记录，则会一直被保存。



## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

在经过指定秒数后，异步插入（async inserts）的哈希值将会从 ClickHouse Keeper 中移除。

可能的取值：
- 任意正整数。

与 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) 类似，`replicated_deduplication_window_seconds_for_async_inserts` 用于指定在异步插入去重中保存数据块哈希值的时间窗口。早于 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希值会从 ClickHouse Keeper 中移除，即使当前保存的哈希值数量仍少于 `replicated_deduplication_window_for_async_inserts` 所配置的块数窗口。

该时间是相对于最新记录的时间，而不是实际墙上时间（wall time）。如果只有这一条记录，它将会被永久保留。



## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置，无任何效果。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置，无任何效果。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置，无任何效果。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

在一个 MUTATE_PART 条目中可合并并一同执行的变更命令的最大数量（0 表示不限制）



## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，无任何作用。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
已废弃的设置，无任何作用。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，无任何作用。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，无任何作用。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置，无任何作用。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误 part 数量占 part 总数的比例小于该值，则允许启动。

可能的取值：
- Float，0.0 - 1.0



## search_orphaned_parts_disks {#search_orphaned_parts_disks} 
<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>


ClickHouse 在执行任何 ATTACH 或 CREATE TABLE 操作时都会扫描所有磁盘上的孤立数据分片（orphaned parts），
以避免遗漏位于未定义（未包含在策略中的）磁盘上的数据分片。
孤立数据分片通常源于潜在不安全的存储重配置操作，例如将某个磁盘从 storage policy 中移除。
该设置通过磁盘特征来限定需要搜索的磁盘范围。

可能的取值：
- any - 范围不受限制。
- local - 范围仅限本地磁盘。
- none - 空范围，不进行搜索。



## serialization_info_version {#serialization_info_version} 
<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "更改为允许自定义字符串序列化的较新格式"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "新增设置"}]}]}/>


写入 `serialization.json` 时使用的序列化信息版本。
在集群升级期间，此设置是保持兼容性的必要条件。

可能的取值：
- `basic` - 基本格式。
- `with_types` - 带有额外 `types_serialization_versions` 字段的格式，允许为每种类型设置单独的序列化版本。
这使得诸如 `string_serialization_version` 之类的设置能够生效。

在滚动升级期间，将其设置为 `basic`，以便新服务器生成的
数据分片与旧服务器兼容。升级完成后，
切换为 `with_types` 以启用逐类型的序列化版本。



## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>


启用对协调合并任务的重新调度。即使在 `shared_merge_tree_enable_coordinated_merges=0` 时也依然有用，因为这会收集合并协调器的统计信息，并有助于缓解冷启动问题。



## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "减少 Keeper 中的元数据量。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "云同步"}]}]}/>


允许在 ZooKeeper 中为每个副本单独创建 /metadata 和 /columns 节点。
仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

停止为 shared merge tree 分配合并任务。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>


在 Keeper 中保留不包含任何数据部分（part）的分区的时间（秒）。



## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>


启用自动清理空分区的 Keeper 条目。



## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>


启用协调的合并策略



## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


启用将属性写入虚拟数据片段，并在 keeper 中提交数据块



## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


启用对过期分片的检查。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>


在共享 MergeTree 中未由 ZooKeeper 监视触发时，用于更新数据分片的时间间隔（以秒为单位）。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>


数据分片更新的初始退避时间。仅在 ClickHouse Cloud 中提供



## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>


用于服务器间 HTTP 连接的超时设置。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>


用于服务器之间 HTTP 通信的超时设置。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


在 0 到 x 秒之间均匀随机选取一个值，并将其加到 shared_merge_tree_leader_update_period 上，以避免惊群效应（thundering herd effect）。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>


用于重新检查负责数据片段更新的主节点的最长时间间隔。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>


leader 在一次 HTTP 请求中尝试确认可删除的过期部件的最大数量。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>


数据部分更新的最大退避时长。仅在 ClickHouse Cloud 中可用



## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>


分片更新 leader 的数量上限。仅在 ClickHouse Cloud 中可用



## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>


part 更新 leader 的最大数量。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


参与数据 part 删除（清理线程）的最大副本数。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>


尝试分配可能存在冲突的合并任务的最大副本数（用于避免在合并任务分配中出现重复冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用



## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 中可疑损坏的数据部分数量上限，若超过该值则禁止自动分离"}]}]}/>


SMT 中可疑损坏的数据部分数量上限，若超过该值则禁止自动分离。



## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 所有损坏数据部分的最大总大小；超过该值时，将禁止自动分离"}]}]}/>


SMT 所有损坏数据部分的最大总大小；超过该值时，将禁止自动分离。



## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>


插入记忆化 ID 的保留时长，用于在重试插入时避免出现不正确的操作。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>


合并协调器选举线程连续两次运行之间的时间间隔



## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>
<SettingsInfoBlock type="Float" default_value="1.1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "在负载后降低协调器休眠时间"}]}]}/>


用于调整协调器线程延迟的时间因子



## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并协调器与 ZooKeeper 同步以获取最新元数据的时间间隔



## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>


协调器一次可以向 MergerMutator 请求的合并操作数量



## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并协调器线程两次运行之间的最大时间间隔



## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


协调器需准备并分发到各 worker 的合并项数量



## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


合并协调器线程两次执行之间的最小时间间隔



## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


在执行立即操作后需要更新其状态时，merge worker 线程使用的超时时间。



## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


合并工作线程两次运行之间的时间间隔



## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>


用于清理过期分片时，会将多少副本分配到同一个 Rendezvous 哈希分组中。
仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` 的比例高于该设置值时，将在合并/变更选择任务中重新加载合并谓词。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

每次调度的获取分片元数据任务数量。仅在 ClickHouse Cloud 中可用



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


在不启动包含该数据部分的新合并操作的前提下，保留本地已合并数据部分的时间。
这会为其他副本提供时间来获取该数据部分并启动相应的合并操作。
仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>


在本地合并完成后，用于推迟立即为其分配下一次合并任务的数据部分最小大小（按行数计）。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


在启动包含该数据片段的新合并之前，保留本地已合并数据片段的时间。这样可以让其他副本有机会拉取该数据片段并启动相同的合并操作。
仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


在可能的情况下，从主节点读取虚拟数据分片。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "用于从其他副本中获取数据片段内存数据的新设置"}]}]}/>


如果启用，所有副本都会尝试从已存在相应数据的其他副本中获取数据片段的内存数据（例如主键、分区信息等）。



## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>


副本根据后台计划任务尝试重新加载其标志的时间间隔。



## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


启用从其他副本的内存缓存中请求文件系统缓存提示。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "默认启用 outdated parts v3"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>


对 outdated parts 使用紧凑格式：降低 Keeper 负载，改善 outdated parts 的处理。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


启用后，“过多数据片段计数器”将依赖 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。



## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>


一次批处理中应包含多少个分区发现操作



## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果存在大量过期的数据片段，清理线程会在一次迭代中尝试最多删除
`simultaneous_parts_removal_limit` 个数据片段。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示不设上限。



## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

仅用于测试。请不要更改。



## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅用于测试。请勿修改。



## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略名称



## string_serialization_version {#string_serialization_version} 
<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Change to the newer format with separate sizes"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "New setting"}]}]}/>


控制顶层 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 设置为 "with_types" 时生效。
启用后，顶层 `String` 列会使用单独的 `.size`
子列来存储字符串长度，而不是内联存储。这样可以启用实际的 `.size`
子列，并有助于提升压缩效率。

嵌套的 `String` 类型（例如位于 `Nullable`、`LowCardinality`、`Array` 或 `Map` 内）
不会受到影响，除非它们出现在 `Tuple` 中。

可能的取值：

- `single_stream` — 使用带内联长度信息的标准序列化格式。
- `with_size_stream` — 为顶层 `String` 列使用单独的大小流（size stream）。



## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>


这是表级磁盘，路径/端点应指向表数据，而不是数据库数据。只能用于 s3_plain/s3_plain_rewritable/web。



## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

保留以 `tmp_` 为前缀的目录的时间（以秒为单位）。不建议将此值设置得过低，
否则在该设置值过小时，合并（merge）和变更（mutation）操作可能无法正常工作。



## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

在开始执行带重新压缩的合并之前的超时时间（秒）。在此期间，ClickHouse 会尝试从被指派执行该带重新压缩合并任务的副本中获取已重新压缩的分片。

在大多数情况下，重新压缩较为耗时，因此在该超时时间结束前不会启动带重新压缩的合并，而是优先尝试从被指派执行此带重新压缩合并任务的副本中获取已重新压缩的分片。

可能的取值：
- 任意正整数。



## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当某个数据片段（part）中的所有行都根据其 `TTL` 设置过期时，该数据片段是否会被整体删除。

当 `ttl_only_drop_parts` 被禁用（默认）时，只会删除基于其 `TTL` 设置已过期的行。

当 `ttl_only_drop_parts` 被启用时，如果某个数据片段中的所有行都根据其 `TTL` 设置过期，则整个数据片段会被删除。



## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

允许在写入动态子列时使用自适应写缓冲区，以减少内存占用



## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则会缓存异步插入的哈希和。

可能的取值：
- `true`
- `false`

一个包含多个异步插入的块会生成多个哈希和。
当部分插入是重复时，Keeper 在一次 RPC 中只会返回一个
重复的哈希和，这会导致不必要的 RPC 重试。
该缓存会监听 Keeper 中哈希和路径上的变更。如果在 Keeper 中检测到更新，
缓存会尽快更新，从而可以在内存中过滤掉重复的插入。



## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

为 `Variant` 数据类型中判别器的二进制序列化启用紧凑模式。
当某个数据分片（part）中主要只有单一变体或包含大量 `NULL` 值时，此模式可以显著减少存储判别器所需的内存。



## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个 part 使用固定 granularity。这样可以减少存储索引 granularity 所需的内存。在规模极大且表非常“窄”的工作负载下可能会有用。



## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
已弃用的设置，对行为无任何影响。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中为数据分片校验和使用更精简的格式（几十字节），而不是普通格式（几十 KB）。在启用之前，请确认所有副本都支持新格式。



## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中存储数据分片头信息的方式。启用后，ZooKeeper 将存储更少的数据。详细信息请参阅[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。



## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

对主键索引使用缓存，
而不是将所有索引都保存在内存中。对于非常大的表，这会很有用



## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

在合并数据片段时触发垂直合并算法所需的未压缩数据的大致最小大小（以字节为单位）。



## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

用于激活 Vertical 合并算法的最小非主键列数量。



## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

激活 Vertical 合并算法所需的合并数据部分中行数的（近似）最小总和。



## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>


如果为 true，则会在垂直合并过程中对轻量级删除进行优化。



## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并过程中会为下一列预取来自远程文件系统的数据。



## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭前，表会等待指定的时间，以便其他副本从当前副本拉取其独有的数据分片（仅存在于当前副本的分片）（0 表示禁用该等待机制）。



## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
已废弃的设置项，不执行任何操作。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
已废弃的设置项，不执行任何操作。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
已废弃的设置项，不执行任何操作。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
已废弃的设置项，不执行任何操作。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "默认启用在 Compact 部分中为子流写入标记"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置"}]}]}/>


启用后，将在 Compact 部分中为每个子流写入标记，而不是为每个列写入标记。
这使得可以高效地从数据部分中读取单独的子列。

例如，列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 会被序列化为如下子流：
- `t.a`：元组元素 `a` 的 String 数据
- `t.b`：元组元素 `b` 的 UInt32 数据
- `t.c.size0`：元组元素 `c` 的数组大小
- `t.c.null`：元组元素 `c` 的嵌套数组元素的空值映射
- `t.c`：元组元素 `c` 的嵌套数组元素的 UInt32 数据

当启用该设置时，我们会为这 5 个子流中的每一个写入标记，这意味着如果需要，我们就能够从粒度中分别读取每个独立子流的数据。例如，如果我们只想读取子列 `t.c`，则只会读取子流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据，而不会读取子流 `t.a` 和 `t.b` 的数据。当禁用该设置时，我们只会为顶层列 `t` 写入一个标记，这意味着即使只需要某些子流的数据，也始终会从粒度中读取整个列的数据。



## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

为获得更小且相互独立的区间，允许推迟删除的顶层数据片段的最大百分比。通常不建议修改该设置。



## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

用于将彼此独立的过期 part 范围递归拆分为更小子范围的最大深度。建议不要修改。



## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用了零拷贝复制功能，则会在尝试加锁之前，根据参与合并或变更（mutation）的数据分片大小随机休眠一段时间。



## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


如果启用了零拷贝复制，在尝试获取合并或变更操作的锁之前，将随机休眠一段时间（最长 500 ms）。



## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查的时间间隔（秒）。

可能的取值：
- 任意正整数。

