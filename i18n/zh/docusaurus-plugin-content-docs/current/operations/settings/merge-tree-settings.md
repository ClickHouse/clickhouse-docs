---
description: '用于 MergeTree 的设置，这些设置位于 `system.merge_tree_settings` 中'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表的设置'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局设定的 MergeTree 设置。

MergeTree 设置可以在服务器配置文件的 `merge_tree` 部分中进行配置，也可以在每个 `MergeTree` 表的
`CREATE TABLE` 语句中的 `SETTINGS` 子句中单独指定。

以下是自定义设置项 `max_suspicious_broken_parts` 的示例：

在服务器配置文件中为所有 `MergeTree` 表配置默认值：

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

针对特定表的设置：

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

使用 `ALTER TABLE ... MODIFY SETTING` 来更改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree 设置 \{#mergetree-settings\}

{/* 以下设置由脚本自动生成：
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

自适应写入缓冲区的初始大小

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true 时，则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加一个隐式约束，只允许有效值（`1` 和 `-1`）。

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，将为该表的所有数值类型列添加 min-max（跳过）索引。

## add_minmax_index_for_string_columns \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}]}/>

启用该设置后，将为表中的所有字符串列添加最小-最大（跳过）索引。

## add_minmax_index_for_temporal_columns \{#add_minmax_index_for_temporal_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "新设置"}]}]}/>

启用后，将为表中的所有 Date、Date32、Time、Time64、DateTime 和 DateTime64 列添加 min-max（跳过）索引。

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新增设置，允许在分区键或排序键中使用可合并列。"}]}]}/>

启用后，允许在 CoalescingMergeTree 表中将可合并列用作分区键或排序键。

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许对带有 `is_deleted` 列的 ReplacingMergeTree 表执行实验性的 CLEANUP 合并。启用后，可以使用 `OPTIMIZE ... FINAL CLEANUP` 手动将某个分区中的所有分区片段合并为单个分区片段，并移除所有已标记删除的行。

同时也允许通过设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 来在后台自动执行此类合并。

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

启用在 MergeTree 排序键中使用降序排序的支持。此设置对时间序列分析和 Top-N 查询尤为有用，允许数据以逆时间顺序（从新到旧）存储，从而优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序，从而在降序查询中使用更高效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

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

在查询中使用 `ORDER BY time DESC` 时，将会应用 `ReadInOrder` 读取模式。

**默认值：** false


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用浮点数作为分区键。

可选值：

- `0` — 不允许使用浮点数作为分区键。
- `1` — 允许使用浮点数作为分区键。

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许使用 Nullable 类型作为主键。

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "现在投影可以使用 _part_offset 列。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新的设置，在其稳定之前，用于阻止创建包含父 part offset 列的投影。"}]}]}/>

允许在投影的 SELECT 查询中使用 `_part_offset` 列。

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "现在 SMT 将默认从 ZooKeeper 中移除陈旧的阻塞分区片段"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

用于减少共享 MergeTree 表中阻塞分区片段的后台任务。
仅适用于 ClickHouse Cloud

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

不要在生产环境中使用此设置，因为它尚未准备就绪。

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置，允许在分区键或排序键中使用汇总列"}]}]}/>

启用后，允许 SummingMergeTree 表中的汇总列用作分区键或排序键。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

不允许主/次级索引或排序键使用相同的表达式

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许将 compact 分区片段垂直合并为 wide 分区片段。此设置在所有副本上必须为相同的值。

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "更改行为，以便在存在依赖二级索引时允许执行 ALTER `column`"}]}]}/>

配置是否允许对由二级索引关联的列执行 `ALTER` 命令，以及在允许时应采取的操作。默认情况下，允许此类 `ALTER` 命令，并会重建这些索引。

可能的取值：

- `rebuild`（默认）：重建在 `ALTER` 命令中受该列影响的任何二级索引。
- `throw`：通过抛出异常来阻止对由**显式**二级索引关联的列执行任何 `ALTER`。隐式索引不受此限制，将会被重建。
- `drop`：删除依赖的二级索引。新的分区片段将不再包含这些索引，需要通过 `MATERIALIZE INDEX` 来重新创建它们。
- `compatibility`：与原始行为保持一致：对 `ALTER ... MODIFY COLUMN` 执行 `throw`，对 `ALTER ... UPDATE/DELETE` 执行 `rebuild`。
- `ignore`：面向高级用户。它会将索引置于不一致状态，从而可能产生不正确的查询结果。

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则此副本不会在本地合并分区片段，而是始终从其他副本下载已合并的分区片段。

可能的取值：

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

在执行 mutation/replace/detach 等操作时，始终复制数据，而不是创建硬链接。

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则在合并过程中会应用补丁分区片段。

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用该设置后，将为每个新的 part 分配一个唯一的 part 标识符。
在启用之前，请检查所有副本是否支持 UUID 版本 4。

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代等待 async_block_ids_cache 更新的时间长度

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，来自 INSERT 查询的数据会存储在队列中，并稍后在后台刷新到表中。

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting"}]}]}/>

用于在所有适用列上自动计算的统计类型列表，以逗号分隔。
支持的统计类型：tdigest、countmin、minmax、uniq。

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

一次合并或变更操作中单个步骤的目标执行时间（毫秒）。如果某个步骤耗时更长，则可以超过该目标值。

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当禁用 `cache_populated_by_fetch`（默认设置）时，只有在执行需要这些分区片段的查询时，新的数据分区片段才会被加载到文件系统缓存中。

如果启用 `cache_populated_by_fetch`，则所有节点会在无需通过查询触发的情况下，将新的数据分区片段从存储加载到其文件系统缓存中。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果此参数非空，则只有匹配该正则表达式的文件会在获取之后预热到缓存中（前提是已启用 `cache_populated_by_fetch`）。

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

已废弃的设置项，不执行任何操作。

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查，用于验证用于采样或采样表达式的列的数据类型是否正确。数据类型必须是无符号的[整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、`UInt32`、`UInt64` 之一。

可能的取值：

- `true`  — 启用检查。
- `false` — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在创建表时会检查用于采样或采样表达式的列的数据类型。如果您已经有包含不正确采样表达式的表，并且不希望服务器在启动时抛出异常，请将 `check_sample_column_is_correct` 设置为 `false`。

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

已废弃的设置，不起任何作用。

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、数据块哈希和分区片段的最小时间间隔。

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

在 `cleanup_delay_period` 的基础上，额外添加一个从 0 到 x 秒之间的均匀分布随机值，
以避免在存在大量表时出现惊群效应，从而对 ZooKeeper 造成 DoS 攻击。

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的首选批处理大小（point 是一个抽象单位，但 1 个 point 大致等同于 1 个已插入的 block）。

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

已废弃的设置，不再起任何作用。

## columns_and_secondary_indices_sizes_lazy_calculation \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新增用于延迟计算列和索引大小的设置"}]}]}/>

在首次请求时再延迟计算列和二级索引的大小，而不是在表初始化时计算。

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

要预热标记缓存的列列表（如果启用）。留空表示所有列

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。在紧凑分区片段中单个 stripe 可写入的最大字节数。

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。紧凑分区片段中单个 stripe 内可写入的最大 granule 数

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。在合并过程中，为将紧凑分区片段整体预读到内存所允许的该分区片段最大大小。

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建采样表达式未包含在主键中的表。此设置仅用于在存在错误表的情况下，临时允许服务器继续运行，以保持向后兼容性。

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

Marks 支持压缩，从而减小标记文件大小并提高网络传输速度。

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

支持对主键进行压缩，可减小主键文件大小并提高网络传输效率。

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

仅在非活动数据分区片段数量至少达到该阈值时，
才启用并发分区片段删除（参见 `max_part_removal_threads`）。

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为具有非经典 MergeTree 的表（即不是 (Replicated, Shared) MergeTree 的表）创建 projection。`ignore` 选项纯粹用于兼容性，可能导致错误结果。否则，如果允许创建，当合并 projection 时，应执行的操作是 `drop` 还是 `rebuild`。因此经典 MergeTree 会忽略此设置。它同样也控制 `OPTIMIZE DEDUPLICATE`，但会影响所有 MergeTree 家族成员。类似于选项 `lightweight_mutation_projection_mode`，它也是分片（part）级别的设置。

可能的取值：

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

指定在建表语句中未为某个特定列定义压缩编解码器时要使用的默认压缩编解码器。  
列的压缩编解码器的选择顺序如下：

1. 在建表语句中为该列显式定义的压缩编解码器
2. 在 `default_compression_codec`（本设置）中定义的压缩编解码器
3. 在 `compression` 设置中定义的默认压缩编解码器  

默认值：空字符串（未定义）。

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用如下行为：在合并或变更操作后，如果某个数据分区片段与其他副本上的对应分区片段在字节级不完全相同，是否将该分区片段从当前副本分离（detach）。如果禁用该设置，则该数据分区片段会被删除。如果你希望之后分析这类分区片段，请启用此设置。

该设置适用于启用了
[数据复制](/engines/table-engines/mergetree-family/replacingmergetree) 的 `MergeTree` 表。

可能的取值：

- `0` — 分区片段会被删除。
- `1` — 分区片段会被分离（detach）。

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失的副本时不要分离旧的本地分区片段。

可能的取值：

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制的 DETACH PARTITION 查询。

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制中的 FETCH PARTITION 查询。

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

在零拷贝复制场景下禁用 FREEZE PARTITION 查询。

## disk \{#disk\}

存储磁盘的名称。可在此处指定，用于替代存储策略。

## distributed_index_analysis_min_indexes_size_to_activate \{#distributed_index_analysis_min_indexes_size_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1073741824"},{"label": "New setting"}]}]}/>

启用分布式索引分析所需的磁盘上（未压缩）索引的最小大小（data skipping 索引和主键索引）

## distributed_index_analysis_min_parts_to_activate \{#distributed_index_analysis_min_parts_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "10"},{"label": "New setting"}]}]}/>

用于激活分布式索引分析的最小分区片段数量

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "添加用于控制 Dynamic 序列化版本的设置项"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "默认为 Dynamic 启用 v3 序列化版本，以提升序列化/反序列化效果"}]}]}/>

Dynamic 数据类型的序列化版本。用于保持兼容性。

可能的取值：

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用为每一行持久化存储 _block_number 列。

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

在合并操作中持久化存储虚拟列 `_block_number`。

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

在可能的情况下压缩内存中的索引粒度值

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "添加了用于为 min_age_to_force_merge 限制最大字节数的新设置。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}]}/>

指定设置 `min_age_to_force_merge_seconds` 和
`min_age_to_force_merge_on_partition_only` 是否应当遵从设置
`max_bytes_to_merge_at_max_space_in_pool`。

可能的取值：

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用向通过 `index_granularity_bytes` 设置控制 granule 大小的模式进行迁移。在 19.11 版本之前，仅有 `index_granularity` 设置用于限制 granule 大小。`index_granularity_bytes` 设置在从包含大行（每行大小为数十或数百 MB）的表中查询数据时可以提升 ClickHouse 性能。
如果你的表包含大行，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "允许对 ReplacingMergeTree 自动执行 CLEANUP 合并的新设置"}]}]}/>

在将分区合并为单个 part 时，是否对 ReplacingMergeTree 使用 CLEANUP 合并。需要同时启用 `allow_experimental_replacing_merge_with_cleanup`、
`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的取值：

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

为 ReplicatedMergeTree 表启用带有 ZooKeeper 名称前缀的 endpoint ID。

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

启用 Vertical merge 算法。

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果对分区操作类查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表启用此设置，则源表和目标表中的索引与 PROJECTION 必须完全一致。否则，目标表可以拥有源表索引和 PROJECTION 的超集。

## escape_index_filenames \{#escape_index_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Escape non-ascii characters in filenames created for indices"}]}]}/>

在 26.1 之前，我们不会对为二级索引创建的文件名中的特殊字符进行转义，这可能会导致某些索引名称中的字符使分区片段损坏。此选项仅为兼容性而添加。除非你需要读取名称中索引包含非 ASCII 字符的旧分区片段，否则不应更改此设置。

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "对在 Wide 分区片段中为 Variant 类型子列创建的文件名中的特殊字符进行转义"}]}]}/>

对在 MergeTree 表的 Wide 分区片段中为 Variant 数据类型子列创建的文件名中的特殊字符进行转义，用于兼容性。

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在选择要合并的分区片段时，将使用其预估的实际数据大小（即不包括通过 `DELETE FROM` 删除的那些行）。请注意，此行为仅对在启用此设置之后由执行 `DELETE FROM` 影响到的分区片段生效。

可能的取值：

- `true`
- `false`

**另请参阅**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
设置

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新设置。"}]}]} />

在执行合并（merge）时，从构建和存储过程中排除通过逗号分隔列表指定的 skip 索引。若
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) 为 false，则此设置不起作用。

被排除的 skip 索引仍然会通过显式执行
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询，或在 INSERT 操作期间根据
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
会话设置被构建和存储。

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


## execute_merges_on_single_replica_time_threshold \{#execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="0" />

当该设置的值大于 0 时，只有一个副本会立即开始执行 merge，而其他副本会在这段时间内等待下载该 merge 的结果，而不是在本地执行 merge。如果选定的副本未能在该时间内完成 merge，则会回退到标准行为。

可能的取值：

- 任意正整数。

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试，请勿更改。

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试，请勿修改。

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

要保留多少条已完成的 mutation 记录。如果为零，则保留全部记录。

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在合并过程中强制通过文件系统缓存读取

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入产生的分区片段执行 fsync。会显著降低插入操作的性能，不建议在宽分区片段上使用。

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

在完成对分片的所有操作（写入、重命名等）后，对分片目录执行 fsync。

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置已废弃，不产生任何作用。

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

已废弃的设置，无任何效果。

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区内的非活跃分区片段数量超过 `inactive_parts_to_delay_insert` 的值，`INSERT` 操作会被刻意放慢。

:::tip
当服务器无法足够快地清理这些分区片段时，这个设置会很有用。
:::

可能的取值：

- 任意正整数。

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中的非活跃分区片段数量超过 `inactive_parts_to_throw_insert` 的取值，`INSERT` 操作会被中断，并返回如下错误：

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception.

可能的取值：

- 任意正整数。

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记点之间的最大数据行数。即一个主键值所对应的行数上限。

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据 granule 的最大大小（以字节计）。

如果只想按行数限制 granule 的大小，请将其设置为 `0`（不推荐）。

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试周期（单位：秒）。

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

该设置已废弃，不产生任何效果。

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

已废弃的设置，目前不起任何作用。

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

已弃用的设置，不执行任何操作。

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除 `DELETE` 无法用于带有投影（projection）的表。这是因为投影中的行也可能会受到 `DELETE` 操作的影响，因此默认值为 `throw`。不过，可以通过此选项来改变该行为。当取值为 `drop` 或 `rebuild` 时，可以对带有投影的表执行删除操作。`drop` 会删除该投影，因此当前查询可能会更快（因为投影被删除），但之后的查询可能会变慢（因为不再有可用投影）。`rebuild` 会重建该投影，可能会影响当前查询的性能，但可能会加速后续查询。一个好处是，这些选项只在 part 级别生效，这意味着未被触及的 part 中的投影会保持不变，而不会触发诸如 drop 或 rebuild 之类的任何操作。

Possible values:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 同时启用，
将在表启动时为已有数据分区片段计算被删除行的数量。请注意，这可能会减慢表启动和加载的速度。

可能的取值：

- `true`
- `false`

**另请参阅**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

用于合并、变更（mutations）等后台操作。在放弃获取表锁之前等待的秒数。

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块的大小，即实际要压缩的数据块的大小。

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

marks 使用的压缩编码。由于 marks 足够小且会被缓存，因此默认使用 ZSTD(3) 压缩。

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新设置"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储跳过索引。
否则，可以通过显式执行 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
或[在 INSERT 时](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)来创建/存储这些索引。

另请参阅 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) 以进行更细粒度的控制。

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储统计信息。
否则，可以通过显式执行 [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
或[在执行 INSERT 时](/operations/settings/settings.md#materialize_statistics_on_insert)来创建并存储这些统计信息。

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

仅在执行 MATERIALIZE TTL 时重新计算 TTL 信息

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和
`parts_to_throw_insert` 设置的“分区片段过多”检查，仅在相关分区中的平均分区片段大小不超过指定阈值时才会生效。  
如果平均大小大于该阈值，INSERT 语句既不会被延迟，也不会被拒绝。  
如果分区片段能够成功合并成更大的分区片段，则允许在单个服务器上的单个表中存储数百 TB 的数据。  
这不会影响对非活动分区片段或分区片段总数所设置的阈值。

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

在资源充足的情况下，允许将多个分区片段合并为一个分区片段时，这些分区片段的最大总大小（以字节为单位）。大致对应自动后台合并所能创建的最大分区片段大小。（0 表示禁用合并）

可能的取值：

- 任意非负整数。

合并调度器会周期性地分析各分区中分区片段的大小和数量，如果资源池中有足够的空闲资源，则会启动后台合并。合并会持续进行，直到源分区片段的总大小超过 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool`（仅考虑可用磁盘空间）。

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在后台资源池可用资源最少时，允许合并为一个分区片段的分区片段总大小上限（以字节为单位）。

可能的取值：

- 任意正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了在磁盘空间（池中）不足的情况下，仍然允许合并的分区片段的最大总大小。
这对于减少小分区片段的数量以及降低出现 `Too many parts` 错误的概率是必要的。
合并会通过按参与合并的分区片段总大小的两倍来预留磁盘空间。
因此，当可用磁盘空间较小时，可能出现这样一种情况：虽然有空闲空间，但这些空间已经被正在进行的大型合并预留，
导致其他合并无法启动，并且随着每次插入，小分区片段的数量都会增加。

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、数据块哈希以及分区片段的最长时间间隔。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在将数据写入表之前进行压缩时，单个未压缩数据块的最大大小。你也可以在全局设置中指定此设置（参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
设置）。在创建表时指定的值会覆盖该设置的全局值。

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的查询的最大并发执行数。
查询仍然会受其他 `max_concurrent_queries` 设置的限制。

可能的取值：

* 正整数。
* `0` — 不限制。

默认值：`0`（不限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

以秒为单位的取值，当单个分区中的活动分区片段数量超过
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) 的取值时，用于计算 `INSERT` 的延迟。

可能的取值：

* 任意正整数。

`INSERT` 的延迟（毫秒）按以下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例如，如果某个分区有 299 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert = 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1，则 `INSERT` 将被延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

自 23.1 版本起，该公式更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如，当某个分区有 224 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert
= 300、parts&#95;to&#95;delay&#95;insert = 150、max&#95;delay&#95;to&#95;insert = 1、
min&#95;delay&#95;to&#95;insert&#95;ms = 10 时，`INSERT` 会被延迟 `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

当存在大量未完成的 mutation 时，对 MergeTree 表执行 mutation 操作的最大允许延迟（以毫秒为单位）。

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Obsolete setting"}]}]}/>

已废弃的设置，不产生任何效果。

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

在不对文件名进行哈希替换、按原样保留时所允许的最大长度。  
仅当启用了设置 `replace_long_file_name_to_hash` 时生效。  
该设置的取值不包含文件扩展名部分的长度。因此，建议将其设置为略低于文件系统支持的文件名最大长度（通常为 255 字节），并预留一定余量以避免文件系统错误。

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

如果需要修改（删除、添加）的文件数量大于此设置，则不要执行 ALTER。

可能的取值：

- 任意正整数。

默认值：75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

当待删除的文件数量大于此设置值时，不要执行 ALTER 操作。

可能的取值：

- 任意正整数。

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

可并行刷新的流（列）的最大数量（在合并时与 max_insert_delayed_streams_for_parallel_write 类似）。仅在 Vertical 合并中生效。

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

在上次未能选出任何用于合并的分区片段后，重新尝试选择前等待的最长时间。较小的设置值会更频繁地在 `background_schedule_pool` 中触发任务选择，在大规模集群中会导致对 ZooKeeper 的大量请求。

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

当池中带有生存时间 (TTL) 条目的合并任务数量超过指定值时，不再分配新的带有 TTL 的合并任务。这样可以为常规合并保留空闲线程，并避免出现 “Too many parts” 错误。

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

将每个副本的分片变更（part mutation）数量限制为指定的值。
0 表示对每个副本的变更数量不设上限（执行仍可能受其他设置约束）。

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

已废弃的设置，不再起任何作用。

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

此设置已废弃，不执行任何操作。

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询可访问的最大分区数。

在创建表时指定的设置值可以通过
查询级别的设置进行覆盖。

可能的取值：

- 任意正整数。

你也可以在查询 / 会话 / 配置文件级别设置查询复杂度参数 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果一张表所有分区中活动分区片段的总数超过 `max_parts_in_total` 的配置值，`INSERT` 会被中断，并抛出 `Too many parts
(N)` 异常。

可能的取值：

- 任意正整数。

表中分区片段数量过大会降低 ClickHouse 查询性能，并增加 ClickHouse 的启动时间。大多数情况下，这是表设计不当的结果（例如在选择分区策略时出错，导致分区过小）。

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

最大可同时合并的分区片段数量（0 表示禁用）。不影响 OPTIMIZE FINAL 查询。

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

失败的 mutation 操作可被延后的最长时间。

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "新增用于在复制队列中推迟拉取任务的设置。"}]}]}/>

失败的副本拉取操作可被推迟的最⼤时间。

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "新增设置，用于在复制队列中推迟合并任务。"}]}]}/>

失败的复制表合并操作的最大可推迟时间。

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "新增用于在复制队列中延后任务的设置。"}]}]}/>

失败复制任务的最大延后时间。若该任务不是 fetch、merge 或 mutation 任务，则使用该值。

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree PROJECTION 的最大数量。

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的最大速度（以字节/秒为单位），适用于
[replicated](../../engines/table-engines/mergetree-family/replication.md)
fetch 操作。此设置作用于特定表，不同于
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
设置，后者作用于整个服务器。

可以同时限制服务器网络和某个特定表的网络带宽，但为此表级设置的值必须小于服务器级设置的值。否则，服务器只会采用
`max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置并不会被严格精确地执行。

可能的取值：

- 正整数。
- `0` — 不限制。

默认值：`0`。

**用法**

可用于在为新增或替换节点进行数据复制时对速度进行限流。

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

当存在非活动副本时，ClickHouse Keeper 日志中最多可以保留多少条记录。如果记录数超过该值，该非活动副本将被视为丢失。

可能的取值：

- 任意正整数。

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ReplicatedMergeTree 队列中，允许同时存在多少个用于合并和变更分区片段的任务。

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

在 `ReplicatedMergeTree` 队列中，允许同时存在多少个针对带有生存时间 (TTL) 的分区片段的合并任务。

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中允许同时存在的分区片段变更任务数量。

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的最大速度（以每秒字节数计），用于
[replicated](/engines/table-engines/mergetree-family/replacingmergetree)
发送。此设置应用于某个特定表，不同于
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
设置（该设置应用于整个服务器）。

可以同时限制服务器级网络带宽和某个特定表的网络带宽，但为此表级设置的值必须小于
服务器级设置的值。否则，服务器只会考虑
`max_replicated_sends_network_bandwidth_for_server` 设置。

该设置不会被严格精确地遵守。

可能的取值：

- 正整数。
- `0` — 不限制。

**用法**

可用于在复制数据以添加或替换新节点时对速度进行限速。

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中的损坏分区片段数量超过 `max_suspicious_broken_parts` 值，则不会执行自动删除。

可能的取值：

- 任意正整数。

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有可疑损坏分区片段的最大总大小；如果超过该值，则禁止自动删除。

可能的取值：

- 任意正整数。

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

所有补丁分区片段中未压缩数据的最大总大小（以字节为单位）。
如果所有补丁分区片段中的数据量超过该值，将拒绝执行轻量级更新。
0 表示不限制。

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

从参与合并的分区片段中读入内存的行数。

可能的取值：

- 任意正整数。

合并操作会以 `merge_max_block_size` 行为一个块，从各个分区片段中读取数据行，随后合并并将结果写入一个新的分区片段。读取的块会放入 RAM 中，因此，`merge_max_block_size` 会影响合并所需的 RAM 大小。于是，对于行非常宽的表，合并可能会消耗大量 RAM（如果平均行大小为 100kb，那么在合并 10 个分区片段时，
(100kb * 10 * 8192) ≈ 8GB RAM）。通过减小 `merge_max_block_size`，可以减少一次合并所需的 RAM，但会降低合并速度。

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

在合并操作中需要生成的数据块大小（以字节为单位）。默认情况下，
该值与 `index_granularity_bytes` 相同。

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。用于在合并过程中预热缓存的单个 part（compact 或 packed）的最大大小。

## merge_max_dynamic_subcolumns_in_compact_part \{#merge_max_dynamic_subcolumns_in_compact_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "auto"},{"label": "添加一个新设置，用于在合并后限制 Compact 数据部分中动态子列的数量，而不受数据类型中指定参数的影响"}]}]}/>

在合并后，Compact 数据部分中每个列中可创建的动态子列的最大数量。
该设置允许在 Compact 数据部分中控制动态子列的数量，而不受数据类型中指定的动态参数的影响。

例如，如果表中有一个类型为 JSON(max_dynamic_paths=1024) 的列，并且将设置 merge_max_dynamic_subcolumns_in_compact_part 设为 128，
那么在合并到 Compact 数据部分后，此数据部分中的动态路径数量将被减少到 128，并且只有 128 个路径会被写入为动态子列。

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "新增一个设置，用于在合并后限制 Wide 数据部分中每个列的动态子列数量，而不受数据类型中指定参数的影响"}]}]}/>

在合并之后，Wide 数据部分中每个列内可以创建的动态子列的最大数量。  
这有助于在不考虑数据类型中指定的动态参数的情况下，减少在 Wide 数据部分中创建的文件数量。

例如，如果表中有一个类型为 JSON(max_dynamic_paths=1024) 的列，并且将设置 merge_max_dynamic_subcolumns_in_wide_part 设为 128，  
那么在合并到 Wide 数据部分之后，该部分中的动态路径数量会被减少到 128，并且只有 128 条路径会作为动态子列写入。

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

在未选择到任何要合并的分区片段后，再次尝试选择要合并的分区片段前需要等待的最小时间。较低的设置值会更频繁地在 `background_schedule_pool` 中触发选择任务，在大规模集群中会导致向 ZooKeeper 发送大量请求。

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

当没有可执行的合并任务时，merge 选择任务的休眠时间会乘以该系数，而在分配到合并任务时则会除以该系数。

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于为合并任务选择分区片段的算法

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

影响已分配合并任务的写放大（进阶级别设置，如果不了解其作用，请不要更改）。适用于 Simple 和 StochasticSimple merge selector。

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

控制在分区中分区片段数量达到何种程度时激活该逻辑。系数越大，触发就越滞后。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新设置"}]}]}/>

为简单合并选择器启用启发式算法，从而降低合并选择时的最大限制。
这样会增加并发合并的数量，有助于缓解 TOO_MANY_PARTS
错误，但同时也会增加写放大效应。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用用于选择参与合并的分区片段的启发式规则：如果范围右侧分区片段的大小小于总大小 `sum_size` 的指定比例（0.01），则从范围右侧移除这些分区片段。
适用于 Simple 和 StochasticSimple merge selectors。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

控制用于构建下降曲线公式中的指数值。减小该指数会降低合并宽度，从而导致写放大增加；反之亦然。

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

一次需要查看多少个分区片段。

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在合并过程中用于预热缓存的分区片段的最大总大小。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

已废弃的设置，当前不起任何作用。

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行清理旧分区片段、WAL 和 mutation 的时间间隔（单位：秒）。

可能的取值：

- 任意正整数。

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理操作的时间间隔（单位：秒）。

可能的取值：

- 任意正整数。

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，当前不产生任何效果。

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

在重新执行带重压缩生存时间 (TTL) 的合并操作前的最小延迟时间（以秒为单位）。

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

在再次执行带有删除生存时间 (TTL) 的合并前的最小延迟时间（秒）。

## merge_workload \{#merge_workload\}

用于调节合并与其他工作负载之间的资源使用与共享方式。指定的值会作为该表后台合并操作的 `workload` 设置值。如果未指定（空字符串），则使用服务器级设置 `merge_workload` 的值。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于关闭前的最小绝对延迟，在此延迟期间停止处理请求，并在状态检查时不再返回 Ok。

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

是否仅在整个分区上而不在其子集上应用 `min_age_to_force_merge_seconds`。

默认情况下，将忽略设置 `max_bytes_to_merge_at_max_space_in_pool`（参见
`enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

当范围内的每个分区片段的存在时间都大于 `min_age_to_force_merge_seconds` 的值时，执行合并。

默认情况下，会忽略 `max_bytes_to_merge_at_max_space_in_pool` 这个设置
（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- 正整数。

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，目前不起任何作用。

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。以字节为单位的未压缩数据最小大小，达到该大小时对数据分片使用完整存储类型，而不是紧凑存储类型。

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以以 `Wide` 格式存储的数据分片中最小的字节数/行数。你可以只设置其中一个、同时设置两个，或者都不设置。

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置"}]}]}/>

为新分区片段预热 mark 缓存和 primary index 缓存所需的最小未压缩字节数

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新的大型分区片段分布到 JBOD 卷磁盘时启用负载均衡所需的最小字节数。

可能的取值：

- 正整数。
- `0` — 关闭负载均衡。

**用法**

该设置的值不应小于
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024。否则，ClickHouse 会抛出异常。

更多信息请参见 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)。

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "新设置"}]}]}/>

通过启用自适应写入缓冲区，减少包含大量列的表的内存使用。

可能的取值：

- 0 - 不受限制
- 1 - 始终启用

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

写入下一个标记时触发压缩所需的未压缩数据块的最小大小。还可以在全局设置中配置此设置（参见
[min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
设置）。在创建表时指定的值会覆盖该设置的全局配置值。

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在获取后对数据片段执行 fsync 的最小压缩字节数（0 表示禁用）

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

合并后对数据分片执行 fsync 操作所需的最小压缩字节数（0 表示禁用）

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

当单个分区中存在大量尚未合并的分区片段时，向 MergeTree 表插入数据的最小延迟时间（毫秒）。

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

当存在大量未完成的 mutation 时，对 MergeTree 表执行 mutation 的最小延迟（毫秒）。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

为了执行数据插入，磁盘空间中必须保持的最小可用字节数。如果可用的空闲字节数小于
`min_free_disk_bytes_to_perform_insert`，则会抛出异常并且插入不会执行。请注意，该设置：

- 会考虑 `keep_free_space_bytes` 设置的取值。
- 不会考虑即将由 `INSERT` 操作写入的数据量。
- 仅在指定了正数（非零）的字节数时才会进行检查。

可能的取值：

- 任意正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，
ClickHouse 会选择要求更大可用空闲空间的那个配置值来执行插入操作。
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 时所需的最小可用磁盘空间与磁盘总空间的比例。必须是介于 0 和 1 之间的浮点值。注意此设置：

- 会考虑 `keep_free_space_bytes` 设置。
- 不会考虑该 `INSERT` 操作将要写入的数据量。
- 仅在指定了正数（非零）比例时才会进行检查。

可能的取值：

- Float，0.0 - 1.0

注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和
`min_free_disk_bytes_to_perform_insert`，ClickHouse 将采用能够在更大可用磁盘空间上允许执行写入操作的那个值。

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

数据粒度单元允许的最小大小（以字节为单位）。

用于防止因 `index_granularity_bytes` 过小而意外创建表。

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中可用。以完整存储格式而非打包存储格式存储数据 part 的最小 part 级别。

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置"}]}]}/>

以 `Wide` 格式而非 `Compact` 格式创建数据分片所需的最小分片级别。

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

为使 [max&#95;concurrent&#95;queries](#max_concurrent_queries) SETTING 生效，查询需要读取的最少 mark 数量。

:::note
查询仍然会受到其他 `max_concurrent_queries` SETTING 的限制。
:::

可能的取值：

* 正整数。
* `0` — 禁用（不对任何查询应用 `max_concurrent_queries` 限制）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

执行合并操作时启用直接 I/O 访问存储磁盘所需的最小数据量。当合并数据分区片段时，ClickHouse 会计算所有待合并数据的总数据量。如果该数据量超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 会通过直接 I/O 接口（`O_DIRECT` 选项）对存储磁盘进行读写操作。
如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器在一次合并操作中可选取进行合并的最小数据分区片段数量
（专家级设置，如果不理解其作用，请不要修改）。
0 - 表示禁用。适用于 Simple 和 StochasticSimple 合并选择器。

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

相对于其他副本的最小延迟阈值；超过该值时将关闭、停止处理请求，并在状态检查期间不返回 OK。

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

仅当绝对延迟不小于该值时，才计算相对副本延迟。

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

此设置已废弃，当前不起任何作用。

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中大致保留此数量的最新记录，即使它们已经
过时。它不会影响表的正常工作：仅用于在清理前诊断 ZooKeeper
日志。

可能的取值：

- 任意正整数。

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已弃用的设置，不会产生任何效果。

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。为数据 part 使用完整存储类型（而不是打包存储）所需的最小行数

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于创建 `Wide` 格式而不是 `Compact` 格式数据部分的最小行数。

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

对合并后的 part 执行 fsync 所需的最小行数（0 表示禁用）

## mutation_workload \{#mutation_workload\}

用于调节 mutation 与其他工作负载之间的资源使用和共享方式。指定的值会作为该表后台 mutation 的 `workload` SETTING 值。如果未指定（空字符串），则会改为使用服务器级的 `mutation_workload` 设置。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在非副本
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，为检查重复而存储哈希和的、最近插入的块（block）数量。

可能的取值：

- 任意正整数。
- `0`（禁用去重）。

会使用与副本表类似的去重机制（参见
[replicated_deduplication_window](#replicated_deduplication_window) 设置）。
已创建分区片段的哈希和会写入磁盘上的本地文件。

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

将最新的数据块编号通知给 SharedJoin 或 SharedSet。仅适用于 ClickHouse Cloud。

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "新设置"}]}]}/>

控制 `Nullable(T)` 列所使用的序列化方法。

可能的取值：

- basic — 对 `Nullable(T)` 使用标准序列化。

- allow_sparse — 允许 `Nullable(T)` 使用稀疏编码。

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

当池中的空闲条目数小于指定值时，不执行分区片段变更（mutation）。这样可以为常规合并预留空闲线程，并避免出现 "Too many parts" 错误。

可能的值：

- 任意正整数。

**使用说明**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值
应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。
否则，ClickHouse 将抛出异常。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

当池中空闲项的数量小于指定值时，不在后台执行对整个分区的优化（该任务在设置 `min_age_to_force_merge_seconds` 并启用
`min_age_to_force_merge_on_partition_only` 时生成）。这样可以为常规合并保留空闲线程，并避免出现 "Too many parts" 的情况。

可选值：

- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
该设置的值应小于
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。否则，ClickHouse 会抛出异常。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或复制队列）中的空闲条目数少于指定数量时，开始降低要处理的合并（或要放入队列的合并）的最大大小。
这样可以让小规模合并得以执行，避免池被长时间运行的合并任务占满。

可能的取值：

- 任意正整数。

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

如果表中至少有这么多未完成的 mutation，则会人为放慢该表的 mutation 处理速度。
设置为 0 时禁用。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表中未完成的 mutation 数量至少达到该值，则抛出 `Too many mutations` 异常。若设置为 0，则禁用该行为。

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。最多考虑前 N 个分区进行合并。分区以加权随机的方式选择，其中权重为该分区中可参与合并的分区片段数量。

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Enable v3 serialization version for JSON by default to use advanced shared data serialization"}]}]}/>

用于 JSON 数据类型的序列化版本。用于兼容性目的。

可能的取值：

- `v1`
- `v2`
- `v3`

只有 `v3` 版本支持更改共享数据的序列化版本。

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in compact parts"}]}]}/>

用于控制在 Compact 分区片段中进行 JSON 共享数据序列化时使用的 bucket 数量。适用于 `map_with_buckets` 和 `advanced` 共享数据序列化方式。

## object_shared_data_buckets_for_wide_part \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "添加一个设置，用于控制 Wide 分区片段中 JSON 共享数据序列化所用 bucket 的数量"}]}]}/>

Wide 分区片段中用于 JSON 共享数据序列化的 bucket 数量。与 `map_with_buckets` 和 `advanced` 共享数据序列化方式配合使用。

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

用于 JSON 数据类型中共享数据的序列化版本。

可能的取值：

- `map` - 将共享数据存储为 `Map(String, String)`
- `map_with_buckets` - 将共享数据存储为若干独立的 `Map(String, String)` 列。使用分桶可以提升从共享数据中读取单个路径的性能。
- `advanced` - 专门为显著提升从共享数据中读取单个路径而设计的共享数据高级序列化方式。
注意，这种序列化会增加磁盘上共享数据的存储大小，因为会存储大量附加信息。

`map_with_buckets` 和 `advanced` 序列化的分桶数量由设置
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part) 决定。

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "添加一个 setting 来控制零级分区片段的 JSON 序列化版本"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "默认启用用于零级分区片段的 map_with_buckets 共享数据序列化版本"}]}]}/>

此 setting 允许为插入期间创建的零级分区片段中 JSON 类型的共享数据指定不同的序列化版本。
不建议对零级分区片段使用 `advanced` 共享数据序列化版本，因为这可能会显著增加插入耗时。

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

在发生服务器意外重启时，为防止数据丢失，用于保留非活跃分区片段的时间（以秒为单位）。

可能的取值：

- 任意正整数。

在将多个分区片段合并成一个新分区片段后，ClickHouse 会将原始分区片段标记为非活跃状态，并且只会在经过 `old_parts_lifetime` 秒后才删除它们。仅当当前查询未使用这些非活跃分区片段时（即该分区片段的 `refcount` 为 1）才会删除。

对于新的分区片段不会调用 `fsync`，因此在一段时间内，新分区片段仅存在于服务器的 RAM（操作系统缓存）中。如果服务器发生意外重启，新分区片段可能会丢失或损坏。为了保护数据，非活跃分区片段不会被立即删除。

在启动过程中，ClickHouse 会检查分区片段的完整性。如果合并后的分区片段已损坏，ClickHouse 会将非活跃分区片段恢复到活跃列表中，并在稍后再次对其进行合并。然后，损坏的分区片段会被重命名（添加 `broken_` 前缀），并移动到 `detached` 目录。如果合并后的分区片段未损坏，则原始的非活跃分区片段会被重命名（添加 `ignored_` 前缀），并移动到 `detached` 目录。

Linux 内核参数 `dirty_expire_centisecs` 的默认值为 30 秒（写入数据仅保留在 RAM 中的最长时间），但在磁盘系统负载较高时，数据可能会更晚才被写入。通过实验，为 `old_parts_lifetime` 选择了 480 秒这一取值，在该时间内可以保证新分区片段一定会被写入磁盘。

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入期间是否优化行顺序，以提高新插入表分区片段的可压缩性。

仅对普通的 MergeTree 引擎表生效。对专用的 MergeTree 引擎表（例如 CollapsingMergeTree）不起作用。

MergeTree 表（可选）使用[压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)进行压缩。
像 LZ4 和 ZSTD 这样的通用压缩编解码器在数据呈现出模式时可以实现最大压缩率。
相同值的长连续段通常压缩效果很好。

如果启用该设置，ClickHouse 会尝试以一种行顺序存储新插入分区片段中的数据，从而最小化新表分区片段各列中相等值连续段的数量。
换句话说，相等值连续段数量较少意味着单个连续段更长，因而压缩效果更好。

寻找最优行顺序在计算上是不可行的（NP-hard）。
因此，ClickHouse 使用启发式算法快速找到一种行顺序，该顺序仍然可以比原始行顺序更好地改善压缩率。

<details markdown="1">

<summary>用于寻找行顺序的启发式算法</summary>

通常可以任意重排表（或表分区片段）的行，因为在 SQL 中，不同行顺序被视为等价的同一张表（表分区片段）。

当为表定义了主键时，这种重排行的自由度会受到限制。
在 ClickHouse 中，主键 `C1, C2, ..., CN` 会强制表行按照列 `C1`、`C2`、…、`Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
因此，行只能在“等价类”内部进行重排，即在主键列上具有相同值的行。
直观地说，高基数的主键（例如包含 `DateTime64` 时间戳列的主键）会产生很多小的等价类。
同样，低基数主键的表会产生少量且较大的等价类。
没有主键的表则代表极端情况，即只有一个跨越所有行的等价类。

等价类越少且越大，在重新排列行时的自由度就越高。

在每个等价类内寻找最佳行顺序所采用的启发式算法由 D. Lemire 和 O. Kaser 在
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
中提出，其基础是在每个等价类内按非主键列的基数升序对行进行排序。

它执行三个步骤：
1. 基于主键列中的行值找到所有等价类。
2. 对于每个等价类，计算（通常是估计）非主键列的基数。
3. 对于每个等价类，按照非主键列基数的升序对行进行排序。

</details>

如果启用该设置，插入操作会产生额外的 CPU 成本，用于分析和优化新数据的行顺序。
预计 INSERT 操作的耗时会增加 30–50%，具体取决于数据特性。
LZ4 或 ZSTD 的压缩率平均可提升 20–40%。

此设置最适用于没有主键或主键基数较低的表，即只有少量不同主键值的表。
高基数主键（例如包含 `DateTime64` 类型时间戳列的主键）预计不会从此设置中获益。

## part_moves_between_shards_delay_seconds \{#part_moves_between_shards_delay_seconds\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

在分片之间移动分区片段前后需要等待的时间（秒）。

## part_moves_between_shards_enable \{#part_moves_between_shards_enable\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

用于在分片之间移动分区片段的实验性/未完善功能。不考虑分片表达式。

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果单个分区中的活动分区片段数量超过 `parts_to_delay_insert` 的值，则会人为地减慢 `INSERT` 的执行。

可能的取值：

- 任意正整数。

ClickHouse 会人为地延长 `INSERT` 的执行时间（增加“sleep”），以便后台合并进程能够以快于新增速度的速率合并分区片段。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活跃分区片段数量超过 `parts_to_throw_insert` 的取值，`INSERT` 操作会被中断，并抛出 `Too many
parts (N). Merges are processing significantly slower than inserts`
异常。

可能的取值：

- 任意正整数。

为了获得 `SELECT` 查询的最佳性能，需要尽量减少需要处理的分区片段数量，参见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前，此设置的默认值为 300。可以将其设置为更大的值，这会降低出现 `Too many parts`
错误的概率，但同时可能会降低 `SELECT` 的性能。此外，在发生合并问题时（例如由于磁盘空间不足），相比使用原始值 300，您也会更晚察觉到问题。

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果这些分区片段大小的总和超过此阈值，并且自复制日志记录项创建以来的时间大于
`prefer_fetch_merged_part_time_threshold`，则优先从副本获取已合并的分区片段，而不是在本地执行合并。这样可以加速非常耗时的合并过程。

可能的取值：

- 任意正整数。

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）条目创建起经过的时间超过此阈值，并且分区片段大小总和大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本获取已合并的分区片段，而不是在本地执行合并。这样可以加速非常耗时的合并操作。

可能的取值：

- 任意正整数。

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，将在插入、合并、获取数据以及服务器启动时把 marks 保存到 mark cache 中，从而预热 mark cache。

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果为 true，则主键索引
缓存将在插入、合并、
读取以及服务器启动时，通过将标记（marks）保存到标记缓存（mark cache）中来进行预热

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主压缩块大小，即实际要压缩的数据块大小。

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于主键的压缩编码。由于主键足够小且会被缓存，
因此默认使用 ZSTD(3) 压缩。

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

在首次使用时再将主键加载到内存中，而不是在表初始化时加载。  
在存在大量表时，这可以节省内存。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

如果在某个数据部分中，主键某一列的取值变化的比例至少达到该阈值，则跳过在内存中加载其后续列。这样可以通过不加载无用的主键列来节省内存。

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 *default* 值数量与 *all* 值数量的最小比例。将该值设置为某一阈值后，当列中默认值的比例不低于该阈值时，该列将使用稀疏序列化方式进行存储。

如果某列是稀疏的（大部分为零），ClickHouse 可以以稀疏格式对其进行编码并自动优化计算——在查询时数据不需要完全解压缩。要启用这种稀疏序列化，需要将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0。如果该值大于或等于 1.0，则该列始终使用正常的完整序列化方式写入。

可能的取值：

* 介于 `0` 和 `1` 之间的浮点数，用于启用稀疏序列化
* `1.0`（或更大），如果不希望使用稀疏序列化

**示例**

注意下表中的 `s` 列在 95% 的行中都是空字符串。在 `my_regular_table` 中我们不使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

请注意，`my_sparse_table` 中的 `s` 列占用的磁盘存储空间更少：

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

可以通过查看 `system.parts_columns` 表中的 `serialization_kind` 列来检查某个列是否使用了稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

你可以查看 `s` 中哪些分区片段是使用稀疏序列化存储的：

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


## reduce_blocking_parts_sleep_ms \{#reduce_blocking_parts_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在未删除或替换任何范围后，再次尝试减少阻塞分区片段数量前要等待的最短时间。较低的配置值会更频繁地在 background_schedule_pool 中触发任务，这会在大规模集群中导致大量对 ZooKeeper 的请求。

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

如果该值大于零，则会从底层文件系统刷新分区片段列表，以检查数据是否在后台已更新。
只有当表位于只读磁盘上时才能设置此参数（这意味着这是一个只读副本，而数据由另一个副本写入）。

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

刷新统计缓存的时间间隔（秒）。如果设置为 0，则禁用刷新。

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

当此设置的值大于零时，如果合并后的数据分片位于共享存储上，则只有一个副本会立即开始执行合并。

:::note
零拷贝复制尚未准备好用于生产环境
从 ClickHouse 版本 22.8 及更高版本开始，零拷贝复制默认处于禁用状态。

不推荐在生产环境中使用此功能。
:::

可能的取值：

- 任意正整数。

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在转换过程中以兼容模式运行 zero-copy 功能。

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

ZooKeeper 中用于存储与表无关的零拷贝信息的路径。

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

在因生存时间 (TTL)、mutation 或 collapsing 合并算法被裁剪后，移除空的分区片段。

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

此设置用于未完成的实验性功能。

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

在后台删除已应用到所有活动分区片段的补丁分区片段。

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 `max_file_name_length` 字节），则将其替换为对应的 SipHash128 哈希值。

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 `true`，此节点上的复制表副本将尝试成为主副本（leader）。

可能的取值：

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper 会为最近插入的若干数据块存储哈希和，用于检查是否存在重复数据块。

可能的取值：

- 任意正整数。
- 0（禁用去重）

`Insert` 命令会创建一个或多个数据块（分区片段）。对于
[插入去重](../../engines/table-engines/mergetree-family/replication.md)，
在向复制表写入数据时，ClickHouse 会将创建的分区片段的哈希和写入 ClickHouse Keeper。哈希和只会为最近的 `replicated_deduplication_window` 个数据块保存。最旧的数据块的哈希和会从 ClickHouse Keeper 中移除。

当 `replicated_deduplication_window` 的值过大时，会减慢 `Insert` 操作，
因为需要比较的条目更多。哈希和是根据字段名称和类型以及插入分区片段的数据（字节流）的组合计算出来的。

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 会为最近异步插入的若干数据块保存哈希摘要，用于检查是否存在重复数据。

可能的取值：

- 任意正整数。
- 0（对 async_inserts 禁用去重）

[Async Insert](/operations/settings/settings#async_insert) 命令会被缓存到一个或多个数据块（分区片段）中。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在向复制表写入时，ClickHouse 会将每次插入的哈希摘要写入 ClickHouse Keeper。只会为最近的 `replicated_deduplication_window_for_async_inserts` 个数据块存储哈希摘要。最旧的哈希摘要会从 ClickHouse Keeper 中移除。
较大的 `replicated_deduplication_window_for_async_inserts` 值会降低 `Async Inserts` 的速度，因为需要比较更多的条目。
哈希摘要是根据字段名称与类型的组合以及插入数据（字节流）计算得到的。

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

在经过指定的秒数后，已插入数据块的哈希和将从 ClickHouse Keeper 中移除。

可能的取值：

- 任意正整数。

与 [replicated_deduplication_window](#replicated_deduplication_window) 类似，`replicated_deduplication_window_seconds` 指定为插入去重而保留数据块哈希和的时间长度。早于
`replicated_deduplication_window_seconds` 的哈希和会从 ClickHouse Keeper 中删除，
即使它们小于 ` replicated_deduplication_window`。

该时间是相对于最近一条记录的时间，而不是实际时间（wall time）。如果它是唯一的一条记录，则会被永久保留。

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

异步插入的哈希和在经过指定秒数后会从 ClickHouse Keeper 中移除。

可能的值：

- 任意正整数。

与 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) 类似，`replicated_deduplication_window_seconds_for_async_inserts` 指定用于异步插入去重的块哈希和应保留多长时间。早于 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希和将从 ClickHouse Keeper 中移除，即使对应块的数量尚未达到 `replicated_deduplication_window_for_async_inserts` 所指定的上限。

该时间是相对于最新记录的时间，而不是绝对时间（wall time）。如果它是唯一的一条记录，则会被永久保留。

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

此设置已废弃，无任何作用。

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，当前不起任何作用。

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，不再产生任何效果。

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

可以合并并在一个 MUTATE_PART 条目中执行的变更命令数量上限（0 表示不限制）

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不再产生任何效果。

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

已废弃的设置，不再产生任何效果。

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不再产生任何效果。

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，目前不起任何作用。

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已弃用的设置，目前不起任何作用。

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误分区片段占分区片段总数的比例小于该值，则允许启动。

可能的取值：

- Float，0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse 在执行任意 ATTACH 或 CREATE 表操作时，会扫描所有磁盘以查找孤立的分区片段，
以确保不会遗漏位于未定义（未包含在策略中）磁盘上的分区片段。
孤立的分区片段来源于潜在不安全的存储重新配置，例如从存储策略中排除了某个磁盘的情况。
此设置通过磁盘的特征来限定要搜索的磁盘范围。

可能的取值：

- any - 范围不受限制。
- local - 范围仅限于本地磁盘。
- none - 空范围，不执行搜索。

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "更改为支持自定义字符串序列化的较新格式"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "新增设置"}]}]}/>

写入 `serialization.json` 时使用的序列化信息版本。
在集群升级期间，此设置是保持兼容性所必需的。

可能的取值：

- `basic` - 基础格式。
- `with_types` - 带有额外 `types_serialization_versions` 字段的格式，允许为每种类型指定序列化版本。
  这会使诸如 `string_serialization_version` 之类的设置生效。

在滚动升级期间，将其设置为 `basic`，以便新服务器生成
与旧服务器兼容的数据分区片段。升级完成后，
切换为 `WITH_TYPES` 以启用按类型划分的序列化版本。

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>

启用对协调合并任务的重新调度。即使在 `shared_merge_tree_enable_coordinated_merges=0` 的情况下也可能有用，因为这会填充合并协调器的统计信息，并有助于冷启动。

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "减少 Keeper 中的元数据数量。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 同步"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点的功能。  
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

停止为 shared merge tree 分配合并操作。仅在 ClickHouse
Cloud 中可用

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

指定当某个分区没有分区片段时，该分区在 Keeper 中保留的时间（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

启用对空分区的 Keeper 条目的清理。

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

启用协调的合并策略

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

启用向虚拟分区片段写入属性，并在 keeper 中提交数据块

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用对过期分区片段的检查。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

在 shared merge tree 中，未由 ZooKeeper watch 触发的分区片段更新的时间间隔（秒）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

分区片段更新的初始退避时间。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

服务器间 HTTP 连接的超时设置。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

用于服务器之间 HTTP 通信的超时时间。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在 0 到 x 秒范围内为 `shared_merge_tree_leader_update_period` 增加一个均匀分布的随机值，以避免“thundering herd”效应。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

重新检查负责分区片段更新的主节点的最大时间间隔。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

在一次 HTTP 请求中，leader 尝试确认删除的过期分区片段的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

用于分区片段更新的最大退避时间。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

分区片段更新 leader 的最大数量。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

负责更新分区片段的主节点数量上限。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与分区片段删除（killer 线程）的副本最大数量。仅在 ClickHouse Cloud 中提供。

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

尝试分配可能相互冲突的合并任务的最大副本数（用于避免在合并任务分配中出现冗余冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 允许的最大可疑损坏分区片段数，超过该值时将禁止自动执行 detach 操作"}]}]}/>

SMT 允许的最大可疑损坏分区片段数，超过该值时将禁止自动执行 detach 操作。

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 所有损坏分区片段的总大小上限，超过则拒绝自动分离（detach）"}]}]}/>

SMT 所有损坏分区片段的总大小上限，超过则拒绝自动分离（detach）。

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

用于缓存插入 memoization ID 的时长，以在重试插入时避免错误操作。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调器选举线程连续两次运行之间的时间间隔

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "新设置"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "在负载后缩短协调器休眠时间"}]}]}/>

用于调整协调器线程延迟的时间系数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器应当多久与 ZooKeeper 同步一次以获取最新元数据

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

协调器在一次请求中可以向 MergerMutator 请求的合并数量

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器线程两次运行之间的最大时间间隔

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调器应准备并分发到各个工作节点的合并条目数量

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

合并协调器线程两次运行之间的最小时间间隔

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

在执行完即时操作后需要更新其状态时，merge worker 线程所使用的超时时间

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新增设置"}]}]}/>

合并 worker 线程连续两次运行之间的时间间隔

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

用于清理过期分区片段时，同一 rendezvous 哈希组中将包含多少个副本。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` 的比例高于该设置时，将在合并/变更选择任务中重新加载合并谓词。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

一次性要调度的分区片段元数据抓取任务数量。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

在启动包含该分区片段的新合并之前，本地已合并分区片段保留的时间。
为其他副本提供机会来获取该分区片段并启动此合并。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

用于在本地完成合并后，当分区片段大小（以行数计）不小于该值时，推迟为其分配下一次合并任务的最小阈值。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在不启动包含该部件的新合并操作的前提下，本地已合并部件可以保留的时间。
这使其他副本有机会拉取该部件并启动这次合并。
仅在 ClickHouse Cloud 中可用

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

尽可能从 leader 读取虚拟分区片段。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "用于从其他副本获取分区片段内存数据的新设置"}]}]}/>

如果启用，所有副本都会尝试从已经存在该数据的其他副本中获取分区片段的内存数据（例如主键、分区信息等）。

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "新设置"}]}]}/>

控制副本按照后台调度尝试重新加载其标志的时间间隔。

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用从其他副本的内存缓存中请求 FS 缓存提示信息。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "默认启用过期分区片段 v3"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

对过期分区片段使用紧凑格式：降低 Keeper 的负载，提高过期分区片段处理效率。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，“过多分区片段”计数器将依赖 Keeper 中的共享数据，而不是本地副本的状态。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

一个批次中应当包含多少个分区发现操作

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果存在大量过期分区片段，清理线程将在一次迭代中尝试删除最多
`simultaneous_parts_removal_limit` 个分区片段。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示不受限制。

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

仅用于测试。请勿修改该设置。

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于测试。请勿修改。

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略名称

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "变更为使用独立 size 流的新格式"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新增设置"}]}]}/>

控制顶层 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 设为 "with_types" 时生效。
当设置为 `with_size_stream` 时，顶层 `String` 列会使用单独的
`.size` 子列来存储字符串长度，而不是内联存储。这样可以支持真正的 `.size`
子列，并有助于提升压缩效率。

嵌套的 `String` 类型（例如位于 `Nullable`、`LowCardinality`、`Array` 或 `Map` 中）
不受影响，除非它们出现在 `Tuple` 中。

可选值：

- `single_stream` — 使用带内联长度信息的标准序列化格式。
- `with_size_stream` — 为顶层 `String` 列使用独立的 size 流。

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新设置"}]}]}/>

这是用于 table disk 的设置，路径/endpoint 应该指向表数据，而不是数据库数据。仅可用于 s3_plain/s3_plain_rewritable/web。

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

在删除 `tmp_` 目录之前保留的秒数。不要将该值设置得过低，
否则合并（merge）和变更（mutation）操作可能无法正常工作。

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

在开始执行带重压缩的合并之前的超时时间（秒）。在此期间，ClickHouse 会尝试从被指派执行此次带重压缩合并的副本中获取已重压缩的 part。

在大多数情况下，重压缩速度较慢，因此在该超时时间内，我们不会开始执行带重压缩的合并，而是持续尝试从被指派执行此次带重压缩合并的副本中获取已重压缩的 part。

可能的取值：

- 任意正整数。

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当某个分区片段中的所有行都根据其 `TTL` 设置过期时，是否完全删除该分区片段。

当 `ttl_only_drop_parts` 被禁用时（默认），仅删除根据其生存时间 (TTL) 设置已过期的行。

当 `ttl_only_drop_parts` 被启用时，如果某个分区片段中的所有行都根据其 `TTL` 设置过期，则会删除整个分区片段。

## use_adaptive_write_buffer_for_dynamic_subcolumns \{#use_adaptive_write_buffer_for_dynamic_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在写入动态子列时使用自适应写缓冲区，以降低内存占用

## use_async_block_ids_cache \{#use_async_block_ids_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 `true`，则会缓存异步插入的哈希值。

可能的取值：

- `true`
- `false`

一个包含多个异步插入的数据块会生成多个哈希值。
当部分插入是重复时，Keeper 在一次 RPC 中只会返回一个
重复的哈希值，这会导致不必要的 RPC 重试。
该缓存会监听 Keeper 中存放这些哈希值的路径。如果在 Keeper 中检测到更新，
缓存会尽快更新，从而可以在内存中过滤掉重复的插入。

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用 Variant 数据类型中判别器二进制序列化的紧凑模式。
当大多数情况下只使用单一变体或存在大量 NULL 值时，此模式在分区片段中存储判别器时可以显著减少内存占用。

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

始终对整个 part 使用恒定粒度。这样可以压缩保存在内存中的索引粒度值。在针对窄表的超大规模负载场景下可能会很有用。

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

已废弃的设置，无任何作用。

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中为数据片段校验和使用更小的格式（几十字节），而不是通常的格式（几十 KB）。启用前，请确认所有副本都支持这种新格式。

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中存储分区片段头信息的方式。启用后，ZooKeeper 会存储更少的数据。更多细节参见[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

为主键索引使用缓存，
而不是将所有索引保存在内存中。这在处理非常大的表时可能很有用。

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

激活垂直合并算法所需的、参与合并的分区片段的最小（近似）未压缩字节数。

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

激活垂直合并算法所需的最少非主键列数。

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

用于激活 Vertical 合并算法的参与合并分区片段行数的最小（近似）总和。

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新设置"}]}]}/>

如果为 true，则在垂直合并（vertical merge）时对轻量级删除进行优化。

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并过程中会从远程文件系统预取下一列的数据。

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭之前，表会等待指定的时间，以便其他副本拉取仅存在于当前副本上的分区片段（0 表示禁用）。

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

已废弃的设置，不会产生任何效果。

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

已废弃的设置，已不再起任何作用。

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

已废弃的设置，目前不起任何作用。

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

已废弃的设置，无任何作用。

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "默认启用在 Compact 分区片段中为子流写入标记"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置"}]}]}/>

启用后，会在 Compact 分区片段中为每个子流写入标记，而不是为每一列写入标记。
这样可以高效地从数据分区片段中读取单独的子列。

例如，列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 会被序列化为如下子流：

- `t.a`：元组元素 `a` 的 String 数据
- `t.b`：元组元素 `b` 的 UInt32 数据
- `t.c.size0`：元组元素 `c` 的数组大小
- `t.c.null`：元组元素 `c` 的嵌套数组元素的 null 映射
- `t.c`：元组元素 `c` 的嵌套数组元素的 UInt32 数据

启用该设置后，我们会为这 5 个子流中的每一个写入一个标记，这意味着如果需要，我们就能够从粒度（granule）中分别读取每个独立子流的数据。例如，如果我们只想读取子列 `t.c`，我们只会读取
子流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据，而不会读取子流 `t.a` 和 `t.b` 的数据。禁用该设置时，
我们只会为顶层列 `t` 写入一个标记，这意味着我们总是会从粒度（granule）中读取整个列的数据，即使只需要某些子流的数据。

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

为了获得更小且相互独立的范围，在顶层分区片段中允许推迟删除的最大百分比。建议不要修改该设置。

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

用于将彼此独立的过期分区片段区间递归拆分为更小子区间的最大递归层数。建议不要更改。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用了零拷贝复制，在尝试获取锁之前，会根据用于合并或 mutation 的分区片段大小随机等待一段时间

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用了零拷贝复制，在尝试获取合并或变更锁之前，随机休眠一段时间，最长为 500ms。

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查周期（以秒为单位）。

可能的值：

- 任意正整数。