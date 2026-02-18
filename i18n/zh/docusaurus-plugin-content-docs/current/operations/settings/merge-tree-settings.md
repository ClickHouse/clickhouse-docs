---
description: '`system.merge_tree_settings` 中的 MergeTree 设置项'
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

自定义配置 `max_suspicious_broken_parts` 设置的示例：

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

使用 `ALTER TABLE ... MODIFY SETTING` 修改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree 设置 \{#mergetree-settings\}

{/* 下列设置由位于以下地址的脚本自动生成：
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

自适应写缓冲区的初始大小

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

若为 true，则会为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加一个隐式约束，只允许取值为 `1` 或 `-1`。

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，将为表中所有数值列添加最小-最大（跳过）索引。

## add_minmax_index_for_string_columns \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}]}/>

启用后，会为该表的所有字符串列添加最小-最大（跳过型）索引。

## add_minmax_index_for_temporal_columns \{#add_minmax_index_for_temporal_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "New setting"}]}]}/>

启用后，会为表中所有 Date、Date32、Time、Time64、DateTime 和 DateTime64 列添加 min-max（跳过）索引。

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "用于允许对分区键或排序键中的列进行合并的新设置。"}]}]}/>

启用后，允许在 CoalescingMergeTree 表中将可合并列用作分区键或排序键。

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

允许对带有 `is_deleted` 列的 ReplacingMergeTree 执行实验性的 CLEANUP 合并。启用后，可以使用 `OPTIMIZE ... FINAL CLEANUP` 手动将某个分区中的所有分区片段合并为单个分区片段，并删除其中所有已标记为删除的行。

还允许通过以下设置，使此类合并在后台自动执行：
`min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`。

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

启用对 MergeTree 排序键中降序排列的支持。此设置对时间序列分析和 Top-N 查询特别有用，允许以时间倒序方式存储数据，从而优化查询性能。

启用 `allow_experimental_reverse_key` 后，可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排列。这使得在处理降序查询时，可以使用更高效的 `ReadInOrder` 优化，而不是 `ReadInReverseOrder`。

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

在查询中使用 `ORDER BY time DESC` 时，将会应用 `ReadInOrder`。

**默认值：** false


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用使用浮点数作为分区键的功能。

可能的值：

- `0` — 不允许使用浮点数分区键。
- `1` — 允许使用浮点数分区键。

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许将 Nullable 类型作为主键。

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "现在投影可以使用 `_part_offset` 列。"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新的设置，用于在该功能稳定之前，阻止创建包含父 part 偏移列的投影。"}]}]}/>

允许在针对投影的 SELECT 查询中使用 `_part_offset` 列。

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "现在 SMT 会默认从 ZooKeeper 中移除陈旧的阻塞分区片段"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

用于减少共享 MergeTree 表中阻塞分区片段的后台任务。
仅在 ClickHouse Cloud 中可用

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

请勿在生产环境中使用此设置，因为它尚未准备就绪。

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新增设置，允许在分区键或排序键中使用汇总列"}]}]}/>

启用后，允许在 SummingMergeTree 表中将汇总列用作分区键或排序键。

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

拒绝具有完全相同表达式的主/二级索引和排序键

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许将 compact 分区片段垂直合并为 wide 分区片段。所有副本上的此设置必须取相同的值。

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "更改行为以允许在存在依赖二级索引时执行 ALTER `column`"}]}]}/>

配置是否允许修改由二级索引覆盖的列的 `ALTER` 命令，以及在允许时应采取的操作。默认情况下，允许此类 `ALTER` 命令，并会重建这些索引。

可能的取值：

- `rebuild`（默认）：重建在该 `ALTER` 命令中受相应列影响的所有二级索引。
- `throw`：通过抛出异常，阻止对由**显式**二级索引覆盖的列执行任何 `ALTER` 操作。隐式索引不受此限制，将被重建。
- `drop`：删除依赖的二级索引。新的分区片段将不再包含这些索引，需要通过执行 `MATERIALIZE INDEX` 来重新创建它们。
- `compatibility`：与原始行为保持一致：对 `ALTER ... MODIFY COLUMN` 使用 `throw`，对 `ALTER ... UPDATE/DELETE` 使用 `rebuild`。
- `ignore`：仅供高级用户使用。它会让索引保持在不一致的状态，可能导致不正确的查询结果。

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则该副本自身不会合并分区片段，而是始终从其他副本下载已合并的分区片段。

可能的取值：

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

在执行数据变更（mutation）、替换（replace）、分离（detach）等操作时，总是复制数据而不使用硬链接。

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新设置"}]}]}/>

如果为 true，则在合并过程中应用 patch 分区片段。

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，将为每个新分片分配一个唯一的分片标识符。
在启用之前，请检查所有副本均支持 UUID 版本 4。

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

每次插入迭代在等待 async_block_ids_cache 更新时的等待时长

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，来自 INSERT 查询的数据会先存入队列，然后由后台刷新写入表中。

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新设置"}]}]}/>

在所有适用列上自动计算的统计类型的逗号分隔列表。
支持的统计类型：tdigest、countmin、minmax、uniq。

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

一次合并或变更操作中单个步骤的目标执行时间（毫秒）。如果某个步骤耗时更长，则可能会超过该目标。

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当禁用 `cache_populated_by_fetch`（默认设置）时，新的数据分区片段只有在执行需要这些分区片段的查询时，才会被加载到文件系统缓存中。

如果启用 `cache_populated_by_fetch`，则所有节点会在无需查询触发的情况下，将新的数据分区片段从存储加载到其文件系统缓存中。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果不为空，则只有与该正则表达式匹配的文件会在 fetch 操作之后被预热到缓存中（前提是已启用 `cache_populated_by_fetch`）。

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

已弃用的设置，不起任何作用。

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查，用于验证用于采样或采样表达式的列的数据类型是否正确。该数据类型必须是以下无符号
[整数类型](/sql-reference/data-types/int-uint)：`UInt8`、`UInt16`、
`UInt32`、`UInt64`。

可选值：

- `true`  — 启用检查。
- `false` — 在创建表时禁用检查。

默认值：`true`。

默认情况下，ClickHouse 服务器在创建表时会检查用于采样或采样表达式的列的数据类型。如果你已经有采样表达式不正确的表，并且不希望服务器在启动时抛出异常，请将 `check_sample_column_is_correct` 设置为 `false`。

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="从不" />

已废弃的设置，不执行任何操作。

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

用于清理旧队列日志、数据块哈希和分区片段的最小时间间隔。

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

在 `cleanup_delay_period` 的基础上额外添加一个从 0 到 x 秒之间均匀分布的随机值，
以避免在存在大量表时出现“惊群效应”，并防止因此对 ZooKeeper 造成拒绝服务（DoS）攻击。

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

后台清理的首选批量大小（point 是一个抽象单位，但 1 个 point 大致相当于 1 个插入的 block）。

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

已废弃的设置，目前不起任何作用。

## clone_replica_zookeeper_create_get_part_batch_size \{#clone_replica_zookeeper_create_get_part_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "100"},{"label": "New setting"}]}]}/>

在克隆副本时，用于 ZooKeeper multi-create get-part 请求的批处理大小。

## columns_and_secondary_indices_sizes_lazy_calculation \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于在首次请求时延迟计算列和二级索引大小的新设置"}]}]}/>

在首次请求时才延迟计算列和二级索引的大小，而不是在表初始化时计算。

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

要为其预热标记缓存（mark cache）的列列表（如果已启用）。为空表示所有列。

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

仅在 ClickHouse Cloud 中可用。compact 分区片段中单个 stripe 的最大写入字节数。

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

仅在 ClickHouse Cloud 中可用。在紧凑型分区片段中写入单个 stripe 时允许的最大 granule 数量

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

仅在 ClickHouse Cloud 中可用。在合并过程中，将紧凑分区片段整体读入内存时允许的最大大小。

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许创建采样表达式不在主键中的表。仅在为了向后兼容而需要暂时允许运行包含配置不正确表的服务器时使用。

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

Marks 支持压缩，有助于减小标记文件大小并加快网络传输。

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许对主键进行压缩，以减小主键文件大小并加快网络传输。

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

仅当不活动的数据分区片段数量至少达到该阈值时，才启用并发分区片段删除（参见 `max_part_removal_threads`）。

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

是否允许为使用非经典 MergeTree 引擎（即不是 ReplicatedMergeTree 或 SharedMergeTree）的表创建 PROJECTION。`ignore` 选项纯粹用于兼容性，可能会导致不正确的结果。否则，如果允许，在合并 PROJECTION 时应执行何种操作：丢弃还是重建。因此，经典 MergeTree 将忽略此设置。它同样也控制 `OPTIMIZE DEDUPLICATE`，并对所有 MergeTree 系列表引擎生效。与选项 `lightweight_mutation_projection_mode` 类似，它也是 part 级别的设置。

可能的取值：

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

指定在表定义中某个列未单独指定压缩 codec 时要使用的默认压缩 codec。
为列选择压缩 codec 的顺序为：

1. 在表定义中为该列显式指定的压缩 codec
2. 在 `default_compression_codec`（本 SETTING）中指定的压缩 codec
3. 在 `compression` 设置中指定的默认压缩 codec  

默认值：空字符串（表示未定义）。

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在合并或变更（mutation）操作之后，如果某个副本上的数据分区片段在字节级与其他副本上的数据分区片段不完全相同，则将其分离（detach）。如果关闭该设置，则会删除该数据分区片段。若希望之后对这些分区片段进行分析，请开启此设置。

该设置适用于启用了
[data replication](/engines/table-engines/mergetree-family/replacingmergetree)
的 `MergeTree` 表。

可能的取值：

- `0` — 分区片段会被删除。
- `1` — 分区片段会被分离（detached）。

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

在修复丢失的副本时，不要分离旧的本地分区片段。

可能的值：

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

在零拷贝复制中禁用 DETACH PARTITION 查询。

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

禁用零拷贝复制中的 FETCH PARTITION 查询。

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

禁用用于零拷贝复制的 FREEZE PARTITION 查询。

## disk \{#disk\}

存储磁盘的名称。可以作为 `storage policy` 的替代进行指定。

## distributed_index_analysis_min_indexes_bytes_to_activate \{#distributed_index_analysis_min_indexes_bytes_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1073741824"},{"label": "新设置"}]}]}/>

用于激活分布式索引分析的磁盘上（未压缩）数据跳过索引和主键索引的最小大小

## distributed_index_analysis_min_parts_to_activate \{#distributed_index_analysis_min_parts_to_activate\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "10"},{"label": "New setting"}]}]}/>

触发分布式索引分析所需的最小分区片段数量

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "新增用于控制 Dynamic 序列化版本的设置"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "默认为 Dynamic 启用 v3 序列化版本，以改进序列化/反序列化效果"}]}]}/>

Dynamic 数据类型的序列化版本。用于确保兼容性。

可选值：

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用对每一行的 `_block_number` 列进行持久化存储。

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

在合并过程中将虚拟列 `_block_number` 持久化。

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

在可能的情况下在内存中压缩索引粒度值

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "1"},{"label": "默认情况下，即使使用 min_age_to_force_merge_seconds 也限制 part 大小"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新增设置，用于限制 min_age_to_force_merge 的最大字节数。"}]}, {"id": "row-3","items": [{"label": "25.1"},{"label": "0"},{"label": "新设置"}]}]}/>

用于控制设置 `min_age_to_force_merge_seconds` 和
`min_age_to_force_merge_on_partition_only` 是否遵循设置
`max_bytes_to_merge_at_max_space_in_pool`。

可能的取值：

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用向通过 `index_granularity_bytes` 设置控制粒度大小的迁移。在 19.11 版本之前，只能使用 `index_granularity` 设置来限制粒度大小。`index_granularity_bytes` 设置在从包含大行（数十到数百兆字节）的表中读取数据时，可以提升 ClickHouse 的性能。  
如果您有包含大行的表，可以为这些表启用此设置，以提高 `SELECT` 查询的效率。

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

在将分区合并为单个 part 时，是否对 ReplacingMergeTree 使用 CLEANUP 合并。需要同时启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可选值：

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

为 ReplicatedMergeTree 表启用带有 ZooKeeper 名称前缀的 endpoint ID。

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

启用 Vertical 合并算法。

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

如果对分区操作查询（`ATTACH/MOVE/REPLACE PARTITION`）的目标表启用了此设置，则源表和目标表中的索引与投影必须完全一致。否则，目标表可以包含源表索引和投影的超集。

## escape_index_filenames \{#escape_index_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "在为索引创建的文件名中对非 ASCII 字符进行转义"}]}]}/>

在 26.1 之前，我们不会对为二级索引创建的文件名中的特殊字符进行转义，这可能会导致某些索引名称中的字符生成损坏的分区片段。此更改纯粹是出于兼容性考虑。除非需要读取名称中包含使用非 ASCII 字符的索引的旧分区片段，否则不应修改此设置。

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "对 Wide 分区片段中 Variant 类型子列生成的文件名中的特殊字符进行转义"}]}]}/>

对 MergeTree 表 Wide 分区片段中 Variant 数据类型子列生成的文件名中的特殊字符进行转义。用于兼容性考虑。

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在选择要合并的分区片段时，将使用数据分区片段的估算实际大小（即不包含通过 `DELETE FROM` 已删除的那些行）。请注意，仅对在该设置启用之后执行的 `DELETE FROM` 所影响的数据分区片段，才会触发此行为。

可选值：

- `true`
- `false`

**另请参阅**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
设置

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

在执行合并时，排除提供的以逗号分隔的 skip 索引列表，使其不会被构建和存储。如果
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) 为 false，则此设置无效。

被排除的 skip 索引在以下情况下仍然会被构建和存储：显式执行
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询，或在执行 INSERT 时，根据
[materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
会话设置而定。

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

当此设置的值大于零时，只有一个副本会立即开始执行合并，其他副本会在该时间段内等待下载合并结果，而不是在本地执行合并。如果选定的副本未能在该时间内完成合并，则会恢复为标准行为。

可能的取值：

- 任意正整数。

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试。请勿更改。

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

仅用于测试。请勿修改。

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

要保留的已完成 mutation 记录数量。如果为零，则保留所有记录。

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

强制在合并过程中通过文件系统缓存读取

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

对每个插入的分区片段执行 fsync 操作。会显著降低插入性能，不建议在宽分区片段上启用。

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

在完成所有数据分片（part）操作（写入、重命名等）后，对数据分片目录执行 fsync。

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置已废弃，无任何作用。

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

已废弃的设置，不起任何作用。

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中某个分区内的不活跃分区片段数量超过 `inactive_parts_to_delay_insert` 的值，则会人为减慢 `INSERT` 的速度。

:::tip
在服务器无法足够快地清理分区片段时，这非常有用。
:::

可能的取值：

- 任意正整数。

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果单个分区中的非活跃分区片段数量超过 `inactive_parts_to_throw_insert` 的值，`INSERT` 操作会被中断，并出现以下错误：

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" 异常。

可能的取值：

- 任意正整数。

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

索引标记之间的最大数据行数。即一个主键值对应的行数上限。

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

数据粒度（granule）的最大大小，单位为字节。

如果只想通过行数限制粒度大小，将其设置为 `0`（不推荐）。

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

表初始化的重试间隔，单位为秒。

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

已废弃的设置，当前不起任何作用。

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

已废弃的设置，不起任何作用。

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

已废弃的设置，目前不起任何作用。

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下，轻量级删除 `DELETE` 不适用于包含 projection 的表。这是因为 projection 中的行也可能会受到 `DELETE` 操作的影响，因此默认值为 `throw`。不过，可以通过该选项改变这一行为。当取值为 `drop` 或 `rebuild` 时，删除操作也可以应用于带有 projection 的表。`drop` 会删除 projection，因此在当前查询中，由于 projection 被删除，执行可能会更快，但由于后续查询不再有 projection 可用，可能会变慢。`rebuild` 会重建 projection，这可能会影响当前查询的性能，但可能会加速后续查询。一个好处是，这些选项只在 part 级别生效，这意味着未被触及的 part 中的 projection 会保持不变，不会触发诸如 drop 或 rebuild 之类的任何操作。

可能的取值：

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一同启用，
将在表启动时为现有数据分区片段计算已删除行的数量。请注意，这可能会减慢表启动时的加载过程。

可能的取值：

- `true`
- `false`

**另请参阅**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

后台合并、变更等操作在放弃获取表锁之前的等待时间（秒）。

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

标记压缩块的大小，即实际进行压缩的数据块大小。

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于 marks 的压缩编码。由于 marks 体积较小并且会被缓存，因此默认使用 ZSTD(3) 压缩。

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新设置"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储跳过索引。
否则，可以通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
或[在 INSERT 操作期间](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)来创建/存储它们。

另请参阅 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) 以获得更细粒度的控制。

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

启用后，合并操作会为新的分区片段构建并存储统计信息。
否则，可以通过显式执行 [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
或[在 INSERT 时](/operations/settings/settings.md#materialize_statistics_on_insert) 创建/存储这些统计信息。

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

仅在执行 MATERIALIZE TTL 时重新计算生存时间 (TTL) 信息。

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

根据 `parts_to_delay_insert` 和 `parts_to_throw_insert` 进行的“分区片段过多”检查，仅在相关分区中的平均分区片段大小不大于指定阈值时才会生效。如果平均大小大于该阈值，则 INSERT 不会被延迟或拒绝。只要分区片段能够成功合并为更大的分区片段，就可以在单个服务器上的一张表中存储数百 TB 级的数据。该设置不会影响对非活跃分区片段或分区片段总数的阈值。

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

在资源充足的情况下，可合并为一个分区片段的多个分区片段总大小（以字节为单位）的最大值。大致对应由自动后台合并产生的分区片段的最大可能大小。（0 表示将禁用合并）

可选值：

- 任意非负整数。

合并调度器会定期分析各分区中分区片段的大小和数量，如果池中有足够的空闲资源，就会启动后台合并。合并会持续执行，直到源分区片段的总大小大于 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 触发的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool`（只考虑可用磁盘空间）。

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

在后台池可用资源最少的情况下，可以合并为一个分区片段的最大分区片段总大小（以字节为单位）。

可能的取值：

- 任意正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了在（池中）磁盘可用空间不足时，仍然允许参与合并的分区片段的最大总大小。
这样做是为了减少小分区片段的数量以及出现 `Too many parts` 错误的概率。
合并操作会预先为磁盘空间做预留，预留量为待合并分区片段总大小的两倍。
因此，在可用磁盘空间较少时，可能出现这样一种情况：名义上仍有可用空间，但这些空间已被正在进行的大型合并占用，导致其他合并无法启动，小分区片段数量会随着每次写入而不断增加。

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

清理旧队列日志、块哈希和分区片段的最长时间间隔。

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在将数据写入表之前进行压缩时，未压缩数据块的最大大小。您也可以在全局设置中指定该设置（参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size) 设置）。在创建表时指定的值会覆盖该全局设置中的值。

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

与 MergeTree 表相关的查询的最大并发执行数量。
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。

可能的值：

* 正整数。
* `0` — 不限制。

默认值：`0`（不限制）。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

以秒为单位的数值，用于在单个分区中的活动分区片段数量超过
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert) 的数值时计算 `INSERT` 的延迟。

可能的取值：

* 任意正整数。

`INSERT` 的延迟（以毫秒为单位）按如下公式计算：

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例如，如果一个分区有 299 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert
= 300，parts&#95;to&#95;delay&#95;insert = 150，max&#95;delay&#95;to&#95;insert = 1，则 `INSERT` 将被延迟
`pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
毫秒。

从 23.1 版本开始，公式更改为：

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如，如果一个分区有 224 个活跃分区片段，并且 parts&#95;to&#95;throw&#95;insert
= 300，parts&#95;to&#95;delay&#95;insert = 150，max&#95;delay&#95;to&#95;insert = 1，
min&#95;delay&#95;to&#95;insert&#95;ms = 10，则 `INSERT` 语句将被延迟 `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

当存在大量未完成的 mutation 时，MergeTree 表执行 mutation 的最大延迟时间（毫秒）

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Obsolete setting"}]}]}/>

已废弃的设置，不会产生任何效果。

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

在不对文件名进行哈希、保持其原样时允许的最大文件名长度。
仅在启用 `replace_long_file_name_to_hash` 设置时生效。
该设置的值不包含文件扩展名的长度。因此，建议将其设置为略低于最大文件名长度（通常为 255 字节），并预留一定余量以避免文件系统错误。

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

如果需要修改（删除、添加）的文件数量大于此设置的值，则不执行 ALTER。

可能的取值：

- 任意正整数。

默认值：75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

如果要删除的文件数量超过此 SETTING，则不要执行 ALTER。

可能的取值：

- 任意正整数。

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

可并行刷新的最大数据流（列）数量（作为针对合并操作的 `max_insert_delayed_streams_for_parallel_write` 的对应设置）。仅对垂直合并（Vertical merges）生效。

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

在未选中任何分区片段进行合并后，再次尝试选择要合并的分区片段之前的最长等待时间。较小的数值会更频繁地在 `background_schedule_pool` 中触发任务选择，从而在大规模集群中产生大量对 ZooKeeper 的请求。

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

当合并池中带有生存时间 (TTL) 的合并操作数量超过指定值时，不再分配新的 TTL 合并。这样可以为常规合并保留空闲线程，并避免出现 “Too many parts” 错误。

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

将每个副本上的数据 part 变更（mutation）数量限制为指定值。
0 表示对每个副本的变更数量不设限制（执行仍可能受其他 SETTING 约束）。

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

已废弃的设置，目前不起任何作用。

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

已废弃的设置，目前不起任何作用。

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询中可以访问的最大分区数量。

在创建表时指定的设置值可以通过
查询级别的设置进行重写。

可能的取值：

- 任意正整数。

还可以在查询 / 会话 / 配置文件级别，将 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
指定为一个查询复杂度设置。

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果一个表所有分区中的活动分区片段总数超过
`max_parts_in_total` 的值，则会中断 `INSERT` 操作，并抛出 `Too many parts
(N)` 异常。

可能的取值：

- 任意正整数。

表中存在大量分区片段会降低 ClickHouse 查询性能，
并增加 ClickHouse 的启动时间。多数情况下，这是由于表设计不当造成的
（例如在选择分区策略时出错——分区划分过小）。

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

一次可合并的分区片段的最大数量（0 表示禁用）。不影响
OPTIMIZE FINAL 查询。

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

失败的 mutation 操作可被延迟执行的最长时间。

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "添加了一个新设置，可在复制队列中延迟拉取任务。"}]}]}/>

失败的复制拉取任务的最大延迟时间。

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing merge tasks in the replication queue."}]}]}/>

失败的副本合并任务可被推迟的最⻓时间。

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "新增设置，用于允许在复制队列中推迟任务执行。"}]}]}/>

失败的复制任务的最长延迟时间。如果该任务不是 fetch、merge 或 mutation，则使用此值。

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

MergeTree 表 PROJECTION 的最大数量。

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的最大速度（以字节/秒为单位），适用于
[replicated](../../engines/table-engines/mergetree-family/replication.md)
fetch 拉取操作。此设置作用于特定表，而
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
设置作用于整个服务器。

你可以同时限制服务器级网络带宽和某个特定表的网络带宽，但为此表级别设置的值
必须小于服务器级别的值。否则服务器只会考虑
`max_replicated_fetches_network_bandwidth_for_server` 设置。

该设置的执行无法做到完全精确。

可能的值：

- 正整数。
- `0` — 不限制。

默认值：`0`。

**用法**

可用于在复制数据以添加或替换新节点时对速度进行限速。

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果存在不活跃副本，ClickHouse Keeper 日志中最多可以保留多少条记录。当记录数量超过该值时，不活跃副本将被视为已丢失。

可能的取值：

- 任意正整数。

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

在 ReplicatedMergeTree 队列中允许同时进行的分区片段合并和变更任务的数量上限。

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

在 ReplicatedMergeTree 队列中，同时允许多少个带生存时间 (TTL) 的分区片段合并任务。

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

在 ReplicatedMergeTree 队列中，最多允许同时存在多少个针对分区片段的变更任务。

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制通过网络进行数据交换的最大速度（以字节/秒为单位），用于
[replicated](/engines/table-engines/mergetree-family/replacingmergetree)
发送。该设置作用于特定表，不同于
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
设置，它作用于整个服务器。

可以同时限制服务器级别的网络带宽以及某个特定表的网络带宽，但
为此表级设置的取值必须小于
服务器级设置的取值。否则服务器只会考虑
`max_replicated_sends_network_bandwidth_for_server` 设置。

该设置在执行时并非完全精确。

可能的取值：

- 正整数。
- `0` — 不限制。

**用法**

可用于在为新增或替换节点复制数据时限制速度。

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

如果单个分区中损坏的分区片段数量超过 `max_suspicious_broken_parts` 的值，则不允许自动删除。

可能的取值：

- 任意正整数。

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

所有损坏分区片段的总大小上限，若超过该值，则不允许自动删除。

可能的取值：

- 任意正整数。

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "新设置"}]}]}/>

所有补丁分区片段中未压缩数据的最大数据量（以字节为单位）。
如果所有补丁分区片段中的数据量超过该值，则会拒绝轻量级更新。
0 表示不限制。

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

从参与合并的分区片段中读取到内存中的行数。

可能的值：

- 任意正整数。

合并操作会以每块 `merge_max_block_size` 行的方式从分区片段中读取数据块，然后
将其合并并将结果写入一个新的分区片段。读取的数据块被放入 RAM 中，
因此 `merge_max_block_size` 会影响执行合并所需的 RAM 大小。
因此，对于行非常宽的表，合并可能会消耗大量 RAM
（如果平均每行大小为 100 KB，那么在合并 10 个分区片段时，
(100 KB * 10 * 8192) ≈ 8 GB RAM）。通过减小 `merge_max_block_size`，
可以降低合并所需的 RAM 占用，但会减慢合并速度。

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

在合并操作中，每个数据块应形成的大小（字节数）。默认情况下，该值与 `index_granularity_bytes` 相同。

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在合并过程中用于预热缓存的 part（compact 或 packed）的最大字节数。

## merge_max_dynamic_subcolumns_in_compact_part \{#merge_max_dynamic_subcolumns_in_compact_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "auto"},{"label": "Add a new setting to limit number of dynamic subcolumns in Compact part after merge regardless the parameters specified in the data type"}]}]}/>

在合并后，Compact 数据 part 中每个列中最多可以创建的动态子列数量。
它允许在 Compact 数据 part 中控制动态子列的数量，而不受数据类型中指定的动态参数的影响。

例如，如果表中有一个类型为 `JSON(max_dynamic_paths=1024)` 的列，并且 `merge_max_dynamic_subcolumns_in_compact_part` 设置为 128，
那么在合并到 Compact 数据 part 之后，该 part 中的动态路径数量将被减少到 128，并且只会有 128 条路径被写入为动态子列。

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "添加一个新的设置，用于在合并后限制 Wide 数据部分中动态子列的数量，而不受数据类型中指定参数的影响"}]}]}/>

在合并后，Wide 数据部分中每一列可以创建的动态子列的最大数量。
这样可以减少在 Wide 数据部分中创建的文件数量，而不受数据类型中指定的动态参数影响。

例如，如果表中有一个类型为 JSON(max_dynamic_paths=1024) 的列，并且将设置 merge_max_dynamic_subcolumns_in_wide_part 设为 128，
那么在合并生成 Wide 数据部分后，该部分中的动态路径数量将减少到 128，并且只会有 128 条路径被写入为动态子列。

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

在未选中任何分区片段进行合并后，再次尝试选择要合并的分区片段之前需要等待的最短时间。将该设置调得更低会更频繁地在 `background_schedule_pool` 中触发选择任务，从而在大规模集群中产生大量对 ZooKeeper 的请求。

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

当没有可执行的合并任务时，合并选择任务的休眠时间会乘以此系数；当分配到合并任务时，则会将休眠时间除以此系数。

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

用于为合并任务选择分区片段的算法

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

影响已分配合并操作的写放大效应（专家级设置，如果你不清楚其作用，请勿更改）。适用于 Simple 和 StochasticSimple 合并选择器。

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

控制该逻辑相对于分区中分区片段数量的触发时机。系数越大，反应就会越滞后。

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

为简单的 merge selector 启用启发式算法，以降低单次合并时可选择的分区片段数量上限。
这样做会增加并发合并的数量，有助于缓解 TOO_MANY_PARTS 错误，但同时也会增加写放大。

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用用于选择参与合并的分区片段的启发式算法：如果区间右侧分区片段的大小小于 sum_size 的指定比例（0.01），则从右侧将其移除。  
适用于 Simple 和 StochasticSimple 合并选择器。

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

控制在构建下降曲线公式时所使用的指数值。减小该指数会减小合并跨度，从而导致写放大增加，反之亦然。

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

每次要查看多少个分区片段。

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。在合并期间用于预热缓存的分区片段最大总大小。

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

已废弃的设置，不起任何作用。

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧分区片段、WAL 和变更记录清理操作的时间间隔（以秒为单位）。

可能的取值：

- 任意正整数。

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

设置 ClickHouse 执行旧临时目录清理操作的时间间隔（以秒为单位）。

可能的取值：

- 任意正整数。

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，当前不起任何作用。

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

在使用重新压缩生存时间 (TTL) 进行合并时，重新执行该合并前的最小延迟时间（以秒为单位）。

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

在再次执行带删除生存时间 (TTL) 的合并操作前的最小延迟时间（秒）。

## merge_workload \{#merge_workload\}

用于调节合并操作与其他工作负载之间的资源使用与共享方式。指定的值会作为该表后台合并的 `workload` 设置值。如果未指定（空字符串），则会使用服务器设置 `merge_workload`。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于关闭、停止提供请求服务并在状态检查期间不再返回 Ok 的最小绝对延迟。

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

`min_age_to_force_merge_seconds` 是否只应用于整个分区，而不应用于其中的子集。

默认情况下，将忽略 `max_bytes_to_merge_at_max_space_in_pool` 设置（参见
`enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果范围内的每个分区片段的存续时间都超过 `min_age_to_force_merge_seconds` 的值，则对其进行合并。

默认情况下，会忽略 `max_bytes_to_merge_at_max_space_in_pool` 设置（参见 `enable_max_bytes_limit_for_min_age_to_force_merge`）。

可能的取值：

- 正整数。

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，目前不起任何作用。

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。以字节为单位的最小未压缩大小，当达到该大小时，将对数据 part 使用完整类型的存储方式，而不是打包类型的存储方式。

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

可以以 `Wide` 格式存储的数据分片中字节数/行数的最小值。可以只设置其中一个、同时设置这两个，或者都不设置。

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置"}]}]}/>

为新分区片段预热 mark cache 和 primary index cache 所需的最小数据量（未压缩字节数）

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在将新的大型分区片段分布到卷内磁盘（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)）时启用负载均衡所需的最小字节数。

可能的取值：

- 正整数。
- `0` — 禁用负载均衡。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不应小于
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024。否则，ClickHouse 会抛出异常。

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "新设置"}]}]}/>

允许通过使用自适应写入缓冲区来降低包含大量列的表的内存占用。

可能的取值：

- 0 - 不受限制
- 1 - 始终启用

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

写入下一个标记时执行压缩所需的未压缩数据块的最小大小。也可以在全局设置中配置此参数（参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size) 设置）。在创建表时指定的值会覆盖此参数的全局值。

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在获取后对分片部分执行 fsync 所需的最小压缩字节数（0 表示禁用）

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在合并后对数据部分执行 fsync 的最小压缩字节数（0 表示禁用）

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

当单个分区中存在大量尚未合并的分区片段时，向 MergeTree 表插入数据的最小延迟时间（毫秒）。

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

当存在大量未完成的 mutation 时，MergeTree 表执行 mutation 的最小延迟（毫秒）

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

为执行插入操作，磁盘空间中必须保留的最小空闲字节数。如果可用空闲字节数小于
`min_free_disk_bytes_to_perform_insert`，则会抛出异常且不会执行插入操作。请注意，此设置：

- 会考虑 `keep_free_space_bytes` 设置。
- 不会考虑 `INSERT` 操作将要写入的数据量。
- 仅在指定为正数（非零）的字节数时才会被检查。

可能的取值：

- 任何正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`，
ClickHouse 将使用其中能够在更大可用磁盘空闲空间阈值下允许执行插入操作的那个值。
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

执行 `INSERT` 时，磁盘空闲空间占总空间的最小比例。必须是 0 到 1 之间的浮点值。注意，该设置：

- 会考虑 `keep_free_space_bytes` 设置。
- 不会考虑 `INSERT` 操作将要写入的数据量。
- 仅在指定为正数（非零）比例时才会进行检查。

可能的取值：

- Float，0.0 - 1.0

注意，如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和
`min_free_disk_bytes_to_perform_insert`，ClickHouse 将采用能够在更大空闲
磁盘空间条件下允许执行插入操作的那个值。

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

数据粒度允许的最小大小（以字节为单位）。

用于防止因将 `index_granularity_bytes` 设得过小而意外创建表。

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

仅在 ClickHouse Cloud 中可用。将数据 part 的存储从打包类型切换为完整类型所需的最小 part 等级。

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新设置"}]}]}/>

用于以 `Wide` 格式而非 `Compact` 格式创建数据分片的最小 part 级别。

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

查询在应用 [max&#95;concurrent&#95;queries](#max_concurrent_queries) 设置前需要读取的最小 mark 数。

:::note
查询仍然会受到其他 `max_concurrent_queries` 设置的限制。
:::

可能的值：

* 正整数。
* `0` — 禁用（`max_concurrent_queries` 限制不会应用于任何查询）。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

在合并操作中启用直接 I/O 访问存储磁盘所需的最小数据量。合并数据分区片段时，ClickHouse 会计算所有待合并数据的总存储大小。如果该大小超过 `min_merge_bytes_to_use_direct_io` 字节，ClickHouse 会使用直接 I/O 接口（`O_DIRECT` 选项）从存储磁盘读取和写入数据。  
如果 `min_merge_bytes_to_use_direct_io = 0`，则禁用直接 I/O。

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

合并选择器每次可选择合并的最小数据分区片段数量
（专家级设置，如果不了解其作用，请不要更改）。
0 表示禁用。适用于 Simple 和 StochasticSimple 合并选择器。

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

相对于其他副本的最小延迟，用于关闭、停止处理请求，并在状态检查期间不再返回 Ok。

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

仅在绝对延迟不小于该值时，才计算相对副本延迟。

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

此设置已废弃，当前不起任何作用。

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留大约此数量的最新记录，即使它们已经过时。  
这不会影响表的正常运行：仅用于在清理前对 ZooKeeper 日志进行诊断。

可能的取值：

- 任意正整数。

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不产生任何效果。

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。对数据 part 使用完整（宽）存储格式而非打包格式时所需的最小行数。

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于创建 `Wide` 格式而非 `Compact` 格式数据部分的最小行数。

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

合并后对数据部分执行 fsync 所需的最小行数（0 表示禁用）

## mutation_workload \{#mutation_workload\}

用于调节变更（mutation）与其他工作负载之间的资源使用和共享方式。指定的值会作为该表后台变更的 `workload` 设置项的值。如果未指定（空字符串），则使用服务器设置 `mutation_workload` 的值。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在非副本
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，为检查重复而存储其哈希和的最近插入数据块数量。

可能的取值：

- 任意正整数。
- `0`（禁用去重）。

使用了与副本表类似的去重机制（参见
[replicated_deduplication_window](#replicated_deduplication_window) 设置）。
已创建分区片段的哈希和会被写入磁盘上的本地文件。

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

是否将最新数据块编号通知给 SharedJoin 或 SharedSet。仅在 ClickHouse Cloud 中可用。

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "New setting"}]}]}/>

控制 `Nullable(T)` 列所使用的序列化方法。

可选值：

- basic — 对 `Nullable(T)` 使用标准序列化。

- allow_sparse — 允许 `Nullable(T)` 使用稀疏编码。

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

当线程池中空闲条目的数量小于指定值时，不执行分区片段变更操作（part mutation）。这样可以为常规合并保留空闲线程，并避免触发 "Too many parts" 错误。

可能的取值：

- 任意正整数。

**使用说明**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) 与

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 比例的乘积。否则，ClickHouse 将抛出异常。

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

当线程池中的空闲条目数小于指定数量时，将不会在后台执行整个分区的优化（此任务在设置 `min_age_to_force_merge_seconds` 并启用
`min_age_to_force_merge_on_partition_only` 时生成）。这样可以为常规合并保留空闲线程，并避免出现 “Too many parts”。

可能的取值：

- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
设置的值应小于
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。
否则，ClickHouse 会抛出异常。

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

当池（或副本队列）中空闲条目的数量小于指定值时，开始降低要处理的合并的最大大小（或放入队列的最大大小）。
这样可以让小型合并得以执行，避免池被长时间运行的合并任务填满。

可能的取值：

- 任意正整数。

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

如果某张表中未完成的 mutation 数量至少达到该值，将会人为减慢该表的 mutation 执行速度。
设置为 0 时禁用。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果表中至少有这么多未完成的 mutation，则抛出 “Too many mutations”
异常。设置为 0 时禁用。

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

仅在 ClickHouse Cloud 中可用。最多会考虑前 N 个分区进行合并。以随机加权的方式选择分区，其中权重为该分区内可被合并的分区片段数量。

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "添加一个设置以控制 JSON 序列化版本"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "默认将 JSON 的序列化版本设置为 v3，以便使用高级共享数据序列化"}]}]}/>

JSON 数据类型的序列化版本。为兼容性所必需。

可选值：

- `v1`
- `v2`
- `v3`

只有版本 `v3` 支持更改共享数据序列化版本。

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "新增用于控制 Compact 分区片段中 JSON 共享数据序列化所用桶数量的设置"}]}]}/>

指定 Compact 分区片段中 JSON 共享数据序列化所使用的桶数量。适用于 `map_with_buckets` 和 `advanced` 两种共享数据序列化方式。

## 宽分区片段中共享数据的桶数量 \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "添加一个设置，用于控制宽分区片段中 JSON 序列化时共享数据的桶数量"}]}]}/>

宽分区片段中用于 JSON 格式共享数据序列化的桶数量。与 `map_with_buckets` 和 `advanced` 共享数据序列化方式配合使用。

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

用于 JSON 数据类型中共享数据的序列化版本。

可能的取值：

- `map` - 将共享数据存储为 `Map(String, String)`
- `map_with_buckets` - 将共享数据存储为多个独立的 `Map(String, String)` 列。使用 buckets 可以提升从共享数据中读取单个路径时的性能。
- `advanced` - 针对共享数据的特殊序列化方式，旨在显著提升从共享数据中读取单个路径时的性能。
请注意，这种序列化会增加磁盘上共享数据的存储大小，因为我们会存储大量的附加信息。

`map_with_buckets` 和 `advanced` 序列化所使用的 bucket 数量由以下设置决定：
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)。

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "添加一个设置，用于控制 zero level 分区片段的 JSON 序列化版本"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "默认为 zero level 分区片段启用 map_with_buckets 共享数据序列化版本"}]}]}/>

此设置允许为在插入期间创建的 zero level 分区片段，指定 JSON 类型中共享数据的不同序列化版本。
不建议对 zero level 分区片段使用 `advanced` 共享数据序列化方式，因为这可能会显著增加插入时间。

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

为防止服务器意外重启导致数据丢失，用于保留非活动分区片段的时间（以秒为单位）。

可能的取值：

- 任意正整数。

在将多个分区片段合并为一个新的分区片段后，ClickHouse 会将原始分区片段标记为非活动状态，并且只会在经过 `old_parts_lifetime` 秒后才删除它们。
如果当前查询没有使用这些非活动分区片段（即该分区片段的 `refcount` 为 1），则会将其移除。

不会对新分区片段调用 `fsync`，因此在一段时间内，新分区片段仅存在于服务器的 RAM（操作系统缓存）中。如果服务器发生意外重启，新分区片段可能会丢失或损坏。为保护数据，非活动分区片段不会被立即删除。

在启动时，ClickHouse 会检查分区片段的完整性。如果合并后的分区片段已损坏，ClickHouse 会将非活动分区片段重新放回活动列表，并在稍后再次对其进行合并。随后，损坏的分区片段会被重命名（添加 `broken_` 前缀）并移动到 `detached` 目录。如果合并后的分区片段未损坏，则原始的非活动分区片段会被重命名（添加 `ignored_` 前缀）并移动到 `detached` 目录。

默认的 `dirty_expire_centisecs` 值（Linux 内核设置）为 30 秒（写入数据仅保存在 RAM 中的最长时间），但在磁盘子系统负载较重的情况下，数据写入可能会晚得多。通过实验，对于 `old_parts_lifetime` 选择了 480 秒这一取值，在该时间内可以保证新的分区片段已经写入磁盘。

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在插入期间是否优化行顺序，以提高新插入表分区片段的压缩率。

仅对普通 MergeTree 引擎表生效。对专用 MergeTree 引擎表（例如 CollapsingMergeTree）不起作用。

MergeTree 表（可选地）使用[压缩 codec](/sql-reference/statements/create/table#column_compression_codec) 进行压缩。
通用压缩 codec（例如 LZ4 和 ZSTD）在数据呈现出明显模式时可以实现较高的压缩率。
相同值的长序列通常压缩效果非常好。

如果启用此设置，ClickHouse 会尝试以一种行顺序将新插入分区片段中的数据存储起来，使新表分区片段的列之间相同值序列的数量最小化。
换句话说，相同值序列数量较少意味着单个序列较长，从而压缩效果更好。

寻找最优行顺序在计算上是不可行的（NP-困难）。
因此，ClickHouse 使用启发式方法快速找到一种仍然比原始行顺序具有更高压缩率的行顺序。

<details markdown="1">

<summary>用于寻找行顺序的启发式方法</summary>

通常可以任意打乱表（或表分区片段）中的行顺序，因为 SQL 认为不同行顺序下的同一张表（或表分区片段）是等价的。

当为表定义了主键时，这种打乱行顺序的自由会受到限制。
在 ClickHouse 中，主键 `C1, C2, ..., CN` 要求表行按列 `C1`、`C2`、...、`Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
因此，行只能在“等价类”内部进行重排，即主键列值相同的行。
直观来看，高基数主键（例如包含 `DateTime64` 时间戳列的主键）会产生许多较小的等价类。
同样地，低基数主键的表会产生较少且较大的等价类。
没有主键的表则表示极端情况：只有一个跨越所有行的等价类。

等价类越少且越大，在重新打乱行顺序时自由度就越高。

用于在每个等价类内寻找最佳行顺序的启发式方法由 D. Lemire、O. Kaser 在
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
中提出，其基于按非主键列的基数升序对每个等价类内的行进行排序。

该方法分三步执行：
1. 基于主键列中的行值查找所有等价类。
2. 对每个等价类，计算（通常是估算）非主键列的基数。
3. 对每个等价类，按非主键列基数升序对行进行排序。

</details>

如果启用此设置，插入操作会产生额外的 CPU 开销，以分析和优化新数据的行顺序。
预计 INSERT 的耗时会增加 30–50%，具体取决于数据特性。
LZ4 或 ZSTD 的压缩率平均可提高 20–40%。

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

如果单个分区中的活动分区片段数量超过 `parts_to_delay_insert` 的值，
则会人为减慢 `INSERT` 的执行速度。

可能的取值：

- 任意正整数。

ClickHouse 会人为延长执行 `INSERT` 的时间（添加 “sleep”），以便后台合并进程能够以快于新分区片段产生速度的速率进行合并。

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

如果单个分区中的活跃分区片段数量超过 `parts_to_throw_insert` 的值，`INSERT` 操作会被中断，并抛出 `Too many
parts (N). Merges are processing significantly slower than inserts`
异常。

可能的取值：

- 任意正整数。

为了实现 `SELECT` 查询的最佳性能，需要尽量减少需要处理的分区片段数量，参见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前，该设置为 300。你可以设置一个更高的值，这将降低出现 `Too many parts`
错误的概率，但同时 `SELECT` 的性能可能会下降。此外，在发生合并问题（例如由于磁盘空间不足）时，相比原来的 300，你会更晚注意到问题。

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

如果分区片段大小之和超过此阈值，并且自复制日志条目创建时间起经过的时间大于
`prefer_fetch_merged_part_time_threshold`，则优先从副本获取已合并的分区片段，
而不是在本地执行合并。这样可以加速执行时间非常长的合并操作。

可能的取值：

- 任意正整数。

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

如果自复制日志（ClickHouse Keeper 或 ZooKeeper）中该记录创建以来经过的时间超过此阈值，并且分区片段大小之和大于 `prefer_fetch_merged_part_size_threshold`，则优先从副本拉取已合并分区片段，而不是在本地执行合并。这样可以加速耗时很长的合并操作。

可能的取值：

- 任意正整数。

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则会在插入、合并、获取以及服务器启动时将标记保存到标记缓存中，以此预热标记缓存

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新设置"}]}]}/>

如果为 true，则主索引缓存会在插入、合并、读取以及服务器启动时，通过将 marks 保存到 mark 缓存来进行预热。

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

主键压缩块的大小，即实际进行压缩的数据块大小。

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

用于主键的压缩编码。由于主键足够小且会被缓存，因此默认使用 ZSTD(3) 进行压缩。

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

在首次使用时才将主键加载到内存中，而不是在表初始化时加载。当存在大量表时，这样可以节省内存。

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

如果在某个数据部分中，主键某一列的值发生变化的次数至少达到该比例，则跳过将其后续列加载到内存中。这样可以通过不加载不必要的主键列来节省内存。

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

列中 *默认* 值数量与 *所有* 值数量之比的最小值。设置该参数后，该列将采用稀疏序列化方式进行存储。

如果一列是稀疏的（大部分为零），ClickHouse 可以用稀疏格式对其进行编码并自动优化计算——在查询期间无需对数据进行完全解压。要启用这种稀疏序列化，需要将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0 的值。如果该值大于或等于 1.0，则该列将始终以常规的完整序列化方式写入。

可能的取值：

* 介于 `0` 和 `1` 之间的 Float 值，用于启用稀疏序列化
* 如果不想使用稀疏序列化，则设置为 `1.0`（或更大）

**示例**

注意下列表中的 `s` 列在 95% 的行中都是空字符串。在 `my_regular_table` 中我们不使用稀疏序列化，而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95：

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

请注意，`my_sparse_table` 中的 `s` 列所占的磁盘存储空间更少：

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

您可以通过查看 `system.parts_columns` 表的 `serialization_kind` 列，来确认某列是否使用了稀疏编码：

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

你可以查看 `s` 中哪些分区片段是通过稀疏序列化方式存储的：

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

仅在 ClickHouse Cloud 中可用。在未删除或替换任何范围后，再次尝试减少阻塞分区片段之前需要等待的最短时间。将该设置值调得更低会在 background_schedule_pool 中更频繁地触发任务，从而在大规模集群中导致大量对 ZooKeeper 的请求。

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "一个新的设置"}]}]}/>

如果该值大于零，则会从底层文件系统刷新数据分区片段列表，以检查底层数据是否已更新。
该参数只能在表位于只读磁盘上时设置（这意味着这是一个只读副本，实际写入由另一个副本执行）。

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "300"},{"label": "Enable statistics cache"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

刷新统计缓存的时间间隔（秒）。设置为 0 时，将禁用刷新。

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

当该设置的值大于零时，如果合并后的分片位于共享存储上，则只有单个副本会立即开始执行合并。

:::note
零拷贝复制尚未达到生产可用的成熟度。
在 ClickHouse 22.8 及更高版本中，零拷贝复制默认是禁用的。

不推荐在生产环境中使用此功能。
:::

可能的取值：

- 任意正整数。

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

在转换期间以兼容模式运行零拷贝功能。

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

用于存储与表无关的零拷贝信息的 ZooKeeper 路径。

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

在被生存时间 (TTL)、变更 (mutation) 或折叠合并算法裁剪后，移除空的分区片段。

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

用于尚未完成的实验性特性的设置。

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新设置"}]}]}/>

在后台删除已应用到所有活动分区片段的补丁分区片段。

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果列的文件名过长（超过 `max_file_name_length` 字节），则将其替换为 SipHash128。

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，此节点上的复制表副本将尝试成为 leader。

可能的取值：

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

ClickHouse Keeper 为最近插入的若干数据块存储哈希和，用于检查重复，本设置用于控制这些数据块的数量。

可能的取值：

- 任意正整数。
- 0（禁用去重）

`Insert` 命令会创建一个或多个数据块（分区片段）。对于
[插入去重](../../engines/table-engines/mergetree-family/replication.md)，
在向复制表写入数据时，ClickHouse 会将创建的分区片段的哈希和写入 ClickHouse Keeper。仅为最近插入的 `replicated_deduplication_window` 个数据块存储哈希和。最旧的哈希和会从 ClickHouse Keeper 中移除。

较大的 `replicated_deduplication_window` 值会减慢 `Insert` 操作，因为需要比较的条目更多。哈希和是根据字段名和类型的组合以及所插入分区片段的数据（字节流）计算出来的。

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse Keeper 会为最近异步插入的若干数据块存储哈希和，用于检查是否存在重复插入。

可能的取值：

- 任意正整数。
- 0（为 `async_inserts` 禁用去重）

[Async Insert](/operations/settings/settings#async_insert) 命令会被缓存为一个或多个数据块（分区片段）。对于[插入去重](/engines/table-engines/mergetree-family/replication)，在写入复制表时，ClickHouse 会将每次插入的哈希和写入 ClickHouse Keeper。仅为最近的 `replicated_deduplication_window_for_async_inserts` 个数据块存储哈希和。最旧的哈希和会从 ClickHouse Keeper 中删除。
较大的 `replicated_deduplication_window_for_async_inserts` 值会减慢 `Async Inserts`，因为它需要比较更多条目。
哈希和是根据字段名称、类型的组合以及插入数据（字节流）计算得出的。

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

在指定秒数之后，插入数据块的哈希和将从 ClickHouse Keeper 中移除。

可能的取值：

- 任意正整数。

与 [replicated_deduplication_window](#replicated_deduplication_window) 类似，
`replicated_deduplication_window_seconds` 指定为了插入去重而保存数据块哈希和的时间长度。
早于 `replicated_deduplication_window_seconds` 的哈希和会从 ClickHouse Keeper 中删除，
即使它们对应的时间间隔小于 `replicated_deduplication_window`。

该时间是相对于最近一条记录的时间，而不是墙钟时间。如果它是唯一的一条记录，则会被永久保留。

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

异步插入的哈希和在从 ClickHouse Keeper 中移除前保留的秒数。

可能的值：

- 任意正整数。

类似于 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts)，`replicated_deduplication_window_seconds_for_async_inserts` 指定用于异步插入去重的数据块哈希和应当保存多长时间。早于 `replicated_deduplication_window_seconds_for_async_inserts` 的哈希和会从 ClickHouse Keeper 中删除，即使对应的数据块数量小于 `replicated_deduplication_window_for_async_inserts`。

该时间是相对于最近一条记录的时间，而不是物理时间（wall time）。如果它是唯一的一条记录，则会被永久保留。

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，不再起任何作用。

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，目前不起任何作用。

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

已废弃的设置，不产生任何效果。

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

可合并在一起并在单个 MUTATE_PART 条目中执行的最大变更命令数量（0 表示不限制）

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已弃用的设置，无任何作用。

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

已废弃的设置，当前不起任何作用。

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，不再产生任何作用。

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，当前不起任何作用。

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

已废弃的设置，已无任何作用。

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误分区片段与分区片段总数的比例小于该值，则允许启动。

可能的取值范围：

- Float，0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse 在执行任意 ATTACH 或 CREATE 表操作时会扫描所有磁盘以查找孤立分区片段，
以避免位于未定义（未包含在策略中）的磁盘上的数据分区片段被遗漏。
孤立分区片段通常源于可能不安全的存储重新配置操作，例如某个磁盘被从存储策略中移除。
此设置通过磁盘的特征来限定要搜索的磁盘范围。

可能的取值：

- any - 范围不受限制。
- local - 范围仅限本地磁盘。
- none - 空范围，不进行搜索。

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Change to the newer format allowing custom string serialization"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "New setting"}]}]}/>

写入 `serialization.json` 时使用的序列化信息版本。
为保证集群升级过程中的兼容性，此设置是必需的。

可选值如下：

- `basic` - 基本格式。
- `with_types` - 带有额外 `types_serialization_versions` 字段的格式，允许为每种类型设置序列化版本。
这会使诸如 `string_serialization_version` 之类的设置生效。

在滚动升级期间，将其设置为 `basic`，以便新服务器生成
与旧服务器兼容的分区片段。升级完成后，
切换到 `WITH_TYPES` 以启用按类型的序列化版本。

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>

启用对协调合并任务的重新调度。即使在 shared_merge_tree_enable_coordinated_merges=0 时也可能有用，因为这会填充合并协调器的统计信息，并有助于冷启动。

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "减少 Keeper 中的元数据量。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud 同步"}]}]}/>

启用在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

停止为 shared merge tree 分配合并和变更任务。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

指定当某个分区没有分区片段时，它在 Keeper 中保留的时间（秒）。

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

启用清理空分区的 Keeper 条目。

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置项"}]}]}/>

启用协调合并策略

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "新增设置"}]}]}/>

启用在虚拟分区片段中写入属性，并在 keeper 中提交数据块

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

启用对过期分区片段的检查。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

在共享 MergeTree 表中，不通过 ZooKeeper watch 监听触发时，用于更新分区片段的时间间隔（秒）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

分区片段更新的初始退避间隔。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

服务器之间 HTTP 连接的超时时间。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

用于服务器间 HTTP 通信的超时时间。仅适用于 ClickHouse Cloud。

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

为 `shared_merge_tree_leader_update_period` 添加一个在 0 到 x 秒之间均匀分布的随机值，以避免惊群效应。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

重新检查负责分区片段更新的 leader 角色的最长时间间隔。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

在单个 HTTP 请求中，主节点尝试确认可删除的过期分区片段的最大数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "新设置"}]}]}/>

分区片段更新的最大退避时间。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

分区片段更新 leader 的最大个数。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

分区片段更新主节点的最大数量。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

参与分区片段删除（清理线程，killer thread）的最大副本数量。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

尝试分配可能产生冲突的合并操作的最大副本数（用于避免在合并分配过程中出现冗余冲突）。0 表示禁用。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 中可疑损坏分区片段的最大数量，超过该值则拒绝自动 DETACH"}]}]}/>

SMT 中可疑损坏分区片段的最大数量，超过该值则拒绝自动 DETACH。

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "SMT 中所有损坏分区片段的最大总大小，超过该值则禁止自动执行 detach 操作"}]}]}/>

SMT 中所有损坏分区片段的最大总大小，超过该值则禁止自动执行 detach 操作。

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

用于在重试插入操作时避免执行错误操作的 insert 记忆化 ID 的保存时长。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

合并协调器选举线程连续两次运行之间的时间间隔

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Lower coordinator sleep time after load"}]}]}/>

协调器线程延迟时间的变化系数

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "新设置"}]}]}/>

合并协调器与 ZooKeeper 同步以获取最新元数据的时间间隔。

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "新设置"}]}]}/>

协调器一次最多可以向 MergerMutator 请求的合并次数

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并协调器线程两次运行之间的最大间隔时间

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

协调器需要准备并在各个 worker 之间分发的合并任务数量

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新设置"}]}]}/>

合并协调器线程两次执行之间的最小时间间隔

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

在执行立即操作后需要更新其状态时，merge worker 线程使用的超时时间。

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

合并 worker 线程两次运行之间的时间间隔

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

在清理过期分区片段时，同一 rendezvous 哈希组中将包含多少个副本。
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

当 `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` 的比值高于该设置值时，会在 merge/mutate 选取任务中重新加载 merge predicate。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

一次性调度的获取分区片段元数据作业数量。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

在开始包含此分区片段的新合并之前，保留本地合并产生的分区片段的时间。  
这可以为其他副本留出时间，以获取该分区片段并启动合并。  
仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

用于在本地合并某个分区片段后，推迟为其分配下一次合并任务的最小分区片段大小（按行数计）。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

在不启动包含该部分的新合并操作的前提下，本地已合并数据部分保留的时间。
这样可以让其他副本有机会拉取该部分并启动合并。
仅在 ClickHouse Cloud 中可用

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

在可能的情况下从 leader 副本读取虚拟分区片段。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "用于从其他副本获取分区片段内存数据的新设置"}]}]}/>

启用后，所有副本都会尝试从已存在该数据的其他副本中获取分区片段的内存数据（例如主键、分区信息等）。

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "新设置"}]}]}/>

根据后台调度，副本尝试重新加载其标志的时间间隔。

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

允许从其他副本的内存缓存中请求 FS 缓存提示信息。仅在 ClickHouse Cloud 中可用

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "默认启用过时分区片段 v3"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud 同步"}]}]}/>

对过时分区片段使用紧凑格式：降低 Keeper 负载，提升过时分区片段处理效率。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

如果启用，该“过多分区片段”计数器将依赖 Keeper 中的共享数据，而不是本地副本状态。仅在 ClickHouse Cloud 中可用。

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

应将多少个分区发现打包为一个批次进行处理

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果存在大量过期的分区片段，清理线程将在一次迭代中尝试删除最多
`simultaneous_parts_removal_limit` 个分区片段。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

仅用于测试，请勿更改。

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅用于测试。请勿更改。

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

存储磁盘策略的名称

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "更改为带有独立长度信息的较新格式"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "新设置"}]}]}/>

控制顶层 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 被设置为 "with_types" 时生效。
当设置为 `with_size_stream` 时，顶层 `String` 列会使用单独的
`.size` 子列来存储字符串长度，而不是内联存储。这样可以使用真正的 `.size`
子列，并有助于提升压缩效率。

嵌套的 `String` 类型（例如在 `Nullable`、`LowCardinality`、`Array` 或 `Map` 中）
不会受到影响，除非它们出现在 `Tuple` 中。

可能的取值：

- `single_stream` — 使用带有内联长度信息的标准序列化格式。
- `with_size_stream` — 为顶层 `String` 列使用单独的大小数据流。

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

这是表级磁盘，其路径/endpoint 应该指向表数据，而不是数据库数据。仅可用于 s3_plain/s3_plain_rewritable/web。

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

保留以 tmp_ 开头的临时目录的时间长度（秒）。不建议将该值设置得过低，否则合并（merge）和变更（mutation）操作可能无法正常进行。

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

在开始带重新压缩的合并之前的超时时间（以秒为单位）。在这段时间内，ClickHouse 会尝试从负责该重新压缩合并的副本中获取已重新压缩的 part。

在大多数情况下，重新压缩的速度较慢，因此在超时到期之前，我们不会开始带重新压缩的合并，而是尝试从负责该重新压缩合并的副本中获取已重新压缩的 part。

可能的取值：

- 任意正整数。

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在 MergeTree 表中，当某个分区片段中的所有行都根据其 `TTL` 设置过期时，是否完全删除该分区片段。

当 `ttl_only_drop_parts` 被禁用（默认）时，只会删除根据其生存时间 (TTL) 设置已过期的行。

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
该缓存会监视 Keeper 中哈希值的路径。如果在 Keeper 中监听到更新，
缓存会尽快进行更新，从而可以在内存中过滤掉重复插入。

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

为 Variant 数据类型中判别器的二进制序列化启用紧凑模式。
当主要只有一个 variant 被使用，或存在大量 NULL 值时，
此模式可以在分区片段中存储判别器时显著减少内存占用。

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

始终为整个 part 使用固定的粒度。这可以将索引粒度的值压缩存储在内存中。在针对列数较少表的超大规模负载场景中，这可能会很有用。

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

已废弃的设置，不起任何作用。

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中为 part 校验和使用更紧凑的小型格式（几十字节），而非常规格式（几十 KB）。启用前，请确认所有副本都已支持该新格式。

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中存储分区片段头部信息的方式。启用后，ZooKeeper 会存储更少的数据。更多详情参见[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

对主键索引使用缓存，
而不是在内存中保存所有索引。对于非常大的表可能会很有用。

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于触发垂直合并算法的合并分区片段中未压缩数据的大致最小字节数。

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

激活垂直合并（Vertical merge）算法所需的最少非主键列数。

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

启用 Vertical 合并算法所需的、正在合并的分区片段中行数的最小（近似）总和。

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

如果为 true，则会在纵向合并过程中优化轻量级删除。

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，则在合并过程中会从远程文件系统预取下一列的数据

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

在关闭前，表会等待指定的时间，以便其他副本拉取仅存在于当前副本上的唯一分区片段；设置为 0 表示禁用该行为。

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

已废弃的设置，不起任何作用。

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

已废弃的设置，当前不起任何作用。

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

已废弃的设置，当前不起任何作用。

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

已废弃的设置，不再起任何作用。

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "默认启用为紧凑分区片段中的子流写入标记"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置"}]}]}/>

启用后，会对每个子流（substream）写入标记，而不是对 Compact 分区片段中的每一列写入标记。
这样可以高效地从数据分区片段中读取单独的子列（subcolumn）。

例如，列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 会被序列化为以下子流：

- `t.a`：元组元素 `a` 的 String 数据
- `t.b`：元组元素 `b` 的 UInt32 数据
- `t.c.size0`：元组元素 `c` 的数组大小
- `t.c.null`：元组元素 `c` 的嵌套数组元素的 null 映射
- `t.c`：元组元素 `c` 的嵌套数组元素的 UInt32 数据

启用此设置后，我们会为这 5 个子流中的每一个写入一个标记，这意味着如果需要，我们就能够从粒度（granule）中分别读取每个单独子流的数据。  
例如，如果我们只想读取子列 `t.c`，我们将仅读取子流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据，而不会读取子流 `t.a` 和 `t.b` 的数据。  
当此设置被禁用时，我们只会为顶层列 `t` 写入一个标记，这意味着即使我们只需要某些子流的数据，也总是会从粒度中读取整列数据。

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

为了获得更小且相互独立的范围，最多可延后删除的顶层分区片段所占比例。建议不要修改该设置。

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

用于将彼此独立的过时分区片段范围拆分为更小子范围的最大递归层数。建议不要更改。

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

如果启用了 zero copy 复制，则在尝试获取锁之前，会根据用于 merge 或 mutation 的分区片段大小随机休眠一段时间。

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

如果启用了 zero copy 复制，则在尝试获取用于合并或 mutation 的锁之前，随机休眠一段时间，最长为 500ms。

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

ZooKeeper 会话过期检查的周期，以秒为单位。

可能的取值：

- 任意正整数。