---
description: '位于 `system.merge_tree_settings` 中的 MergeTree 表设置'
slug: /operations/settings/merge-tree-settings
title: 'MergeTree 表的设置'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

系统表 `system.merge_tree_settings` 显示全局配置的 MergeTree 设置。

可以在服务器配置文件的 `merge_tree` 部分中设置 MergeTree 参数，也可以在 `CREATE TABLE` 语句的 `SETTINGS` 子句中为每个 `MergeTree` 表单独指定。

以下示例演示如何自定义设置 `max_suspicious_broken_parts`：

在服务器配置文件中为所有 `MergeTree` 表配置该设置的默认值：

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

使用 `ALTER TABLE ... MODIFY SETTING` 更改某个表的设置：

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- 重置为全局默认值(取自 system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## MergeTree 设置 {#mergetree-settings}

<!-- 以下设置由以下脚本自动生成:
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size}

<SettingsInfoBlock type='UInt64' default_value='16384' />

自适应写缓冲区的初始大小


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

<SettingsInfoBlock type='Bool' default_value='0' />

如果为 true,则为 CollapsingMergeTree 或 VersionedCollapsingMergeTree 表的 `sign` 列添加隐式约束,以仅允许有效值(`1` 和 `-1`)。


## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新增设置" }]
    }
  ]}
/>

启用后,将为表的所有数值列添加 min-max(跳过)索引。


## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

启用后,将为表中的所有字符串列添加 min-max(跳过)索引。


## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.6" },
        { label: "0" },
        {
          label:
            "新增设置,允许对分区键或排序键列进行合并操作。"
        }
      ]
    }
  ]}
/>

启用后,允许将 CoalescingMergeTree 表中的合并列用于分区键或排序键。


## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

允许对带有 `is_deleted` 列的 ReplacingMergeTree 执行实验性 CLEANUP 合并。启用后,可以使用 `OPTIMIZE ... FINAL CLEANUP` 手动将分区中的所有数据部分合并为单个部分,并移除所有已删除的行。

同时允许通过设置 `min_age_to_force_merge_seconds`、`min_age_to_force_merge_on_partition_only` 和 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` 来启用此类合并在后台自动执行。


## allow_experimental_reverse_key {#allow_experimental_reverse_key}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

启用 MergeTree 排序键中降序排序的支持。此设置对于时间序列分析和 Top-N 查询特别有用,允许以逆时间顺序存储数据以优化查询性能。

启用 `allow_experimental_reverse_key` 后,可以在 MergeTree 表的 `ORDER BY` 子句中定义降序排序。这使得降序查询可以使用更高效的 `ReadInOrder` 优化,而不是 `ReadInReverseOrder`。

**示例**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- 对 'time' 字段使用降序
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

通过在查询中使用 `ORDER BY time DESC`,将应用 `ReadInOrder` 优化。

**默认值:** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key}

<SettingsInfoBlock type='Bool' default_value='0' />

允许将浮点数用作分区键。

可能的值：

- `0` — 不允许浮点数分区键。
- `1` — 允许浮点数分区键。


## allow_nullable_key {#allow_nullable_key}

<SettingsInfoBlock type='Bool' default_value='0' />

允许使用 Nullable 类型作为主键。


## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "1" },
        { label: "现在投影可以使用 _part_offset 列。" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.5" },
        { label: "0" },
        {
          label:
            "新增设置,在该功能稳定之前,防止创建包含父数据分片偏移列的投影。"
        }
      ]
    }
  ]}
/>

允许在投影的 SELECT 查询中使用 '\_part_offset' 列。


## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "1" },
        {
          label:
            "现在 SMT 默认会从 ZooKeeper 中移除过时的阻塞部分"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud 同步" }]
    }
  ]}
/>

用于减少共享合并树表中阻塞部分的后台任务。
仅在 ClickHouse Cloud 中可用


## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

请勿在生产环境中使用此设置,因为该功能尚未完善。


## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "0" },
        {
          label:
            "新增设置,允许对分区键或排序键列进行求和"
        }
      ]
    }
  ]}
/>

启用后,允许将 SummingMergeTree 表中的求和列用于分区键或排序键。


## allow_suspicious_indices {#allow_suspicious_indices}

<SettingsInfoBlock type='Bool' default_value='0' />

拒绝使用相同表达式的主索引/二级索引和排序键


## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

允许从 Compact 部分垂直合并到 Wide 部分。此设置在所有副本上必须保持相同的值。


## alter_column_secondary_index_mode {#alter_column_secondary_index_mode}

<SettingsInfoBlock
  type='AlterColumnSecondaryIndexMode'
  default_value='rebuild'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.12" },
        { label: "rebuild" },
        {
          label:
            "更改行为,允许在列具有依赖的二级索引时执行 ALTER `column` 操作"
        }
      ]
    }
  ]}
/>

配置是否允许修改被二级索引覆盖的列的 `ALTER` 命令,以及允许时应采取的操作。默认情况下,允许此类 `ALTER` 命令并重建索引。

可能的值:

- `rebuild`(默认值):重建 `ALTER` 命令中受该列影响的所有二级索引。
- `throw`:通过抛出异常来阻止对被二级索引覆盖的列执行任何 `ALTER` 操作。
- `drop`:删除依赖的二级索引。新数据分区将不包含这些索引,需要使用 `MATERIALIZE INDEX` 重新创建。
- `compatibility`:匹配原始行为:对 `ALTER ... MODIFY COLUMN` 执行 `throw`,对 `ALTER ... UPDATE/DELETE` 执行 `rebuild`。
- `ignore`:仅供专家使用。将使索引处于不一致状态,可能导致错误的查询结果。


## always_fetch_merged_part {#always_fetch_merged_part}

<SettingsInfoBlock type='Bool' default_value='0' />

如果为 true，此副本将不会合并数据分片，而是始终从其他副本下载已合并的数据分片。

可能的值：

- true, false


## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks}

<SettingsInfoBlock type='Bool' default_value='0' />

在执行变更(mutation)、替换(replace)、分离(detach)等操作时,始终复制数据而不使用硬链接。


## apply_patches_on_merge {#apply_patches_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

如果为 true,则在合并时应用补丁部分


## assign_part_uuids {#assign_part_uuids}

<SettingsInfoBlock type='Bool' default_value='0' />

启用后，将为每个新数据分片分配唯一标识符。
启用前，请确认所有副本均支持 UUID 版本 4。


## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms}

<SettingsInfoBlock type='Milliseconds' default_value='100' />

每次插入迭代等待 async_block_ids_cache 更新的等待时长


## async_insert {#async_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

如果为 true，INSERT 查询的数据会存储在队列中，随后在后台刷写到表中。


## auto_statistics_types {#auto_statistics_types}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "新设置" }]
    }
  ]}
/>

以逗号分隔的统计类型列表,用于在所有合适的列上自动计算。
支持的统计类型:tdigest、countmin、minmax、uniq。


## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms}

<SettingsInfoBlock type='Milliseconds' default_value='50' />

执行单个合并或变更步骤的目标时间。如果单个步骤执行时间较长，则可以超过此值


## cache_populated_by_fetch {#cache_populated_by_fetch}

<SettingsInfoBlock type='Bool' default_value='0' />

:::note
此设置仅适用于 ClickHouse Cloud。
:::

当 `cache_populated_by_fetch` 禁用时(默认设置),新数据分片仅在执行需要这些分片的查询时才会加载到缓存中。

如果启用 `cache_populated_by_fetch`,则所有节点会主动从存储中将新数据分片加载到缓存中,无需通过查询来触发此操作。

**另请参阅**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)


## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.6" }, { label: "" }, { label: "新设置" }]
    }
  ]}
/>

:::note
此设置仅适用于 ClickHouse Cloud。
:::

如果不为空,则仅将匹配此正则表达式的文件在获取后预热到缓存中(前提是已启用 `cache_populated_by_fetch`)。


## check_delay_period {#check_delay_period}

<SettingsInfoBlock type="UInt64" default_value="60" />
已废弃的设置,无任何作用。
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

在创建表时启用检查,以验证用于采样的列或采样表达式的数据类型是否正确。数据类型必须是以下无符号[整数类型](/sql-reference/data-types/int-uint)之一:`UInt8`、`UInt16`、`UInt32`、`UInt64`。

可选值:

- `true` — 启用检查。
- `false` — 在创建表时禁用检查。

默认值:`true`。

默认情况下,ClickHouse 服务器在创建表时会检查用于采样的列或采样表达式的数据类型。如果您已有包含不正确采样表达式的表,且不希望服务器在启动时抛出异常,请将 `check_sample_column_is_correct` 设置为 `false`。


## clean_deleted_rows {#clean_deleted_rows}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
已废弃的设置,无任何作用。
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

清理旧队列日志、数据块哈希值和数据分片的最小时间间隔。


## cleanup_delay_period_random_add {#cleanup_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />

向 cleanup_delay_period 添加 0 到 x 秒之间的均匀分布随机值，以避免在表数量极大时出现惊群效应，从而导致 ZooKeeper 遭受拒绝服务攻击。


## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration}

<SettingsInfoBlock type='UInt64' default_value='150' />

后台清理的首选批处理大小（点是抽象单位，1 个点大约相当于 1 个已插入的数据块）。


## cleanup_threads {#cleanup_threads}

<SettingsInfoBlock type="UInt64" default_value="128" />
已废弃的设置,无任何作用。
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "用于延迟计算列和索引大小的新设置"}]}]}/>

在首次请求时延迟计算列和二级索引大小,而非在表初始化时计算。


## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache}

用于预热标记缓存的列列表(如果启用)。空值表示所有列


## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='134217728' />

仅在 ClickHouse Cloud 中可用。紧凑数据部分（compact parts）中单个条带（stripe）可写入的最大字节数


## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='128' />

仅在 ClickHouse Cloud 中可用。紧凑数据部分中单个条带可写入的最大颗粒数


## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part}

<SettingsInfoBlock type='UInt64' default_value='16777216' />

仅在 ClickHouse Cloud 中可用。合并时将紧凑部分完整读入内存的最大字节数。


## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key}

<SettingsInfoBlock type='Bool' default_value='0' />

允许创建采样表达式不在主键中的表。此设置仅用于临时允许服务器运行不符合规范的表，以保持向后兼容性。


## compress_marks {#compress_marks}

<SettingsInfoBlock type='Bool' default_value='1' />

标记支持压缩，可减小标记文件大小并加快网络传输速度。


## compress_primary_key {#compress_primary_key}

<SettingsInfoBlock type='Bool' default_value='1' />

主键支持压缩，可减小主键文件大小并加快网络传输速度。


## concurrent_part_removal_threshold {#concurrent_part_removal_threshold}

<SettingsInfoBlock type='UInt64' default_value='100' />

仅当非活动数据部分的数量至少达到此值时,才会激活并发部分删除功能(参见 'max_part_removal_threads')。


## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

<SettingsInfoBlock
  type='DeduplicateMergeProjectionMode'
  default_value='throw'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "24.8" },
        { label: "throw" },
        { label: "不允许创建不一致的投影" }
      ]
    }
  ]}
/>

是否允许为非经典 MergeTree 表创建投影,即非 (Replicated, Shared) MergeTree 表。ignore 选项纯粹是为了兼容性而存在,可能会导致错误的查询结果。如果允许创建投影,则需指定合并投影时的操作:删除(drop)或重建(rebuild)。经典 MergeTree 会忽略此设置。该设置同时控制 `OPTIMIZE DEDUPLICATE` 操作,并对所有 MergeTree 系列成员生效。与 `lightweight_mutation_projection_mode` 选项类似,该设置也是分区级别的。

可能的值:

- `ignore`
- `throw`
- `drop`
- `rebuild`


## default_compression_codec {#default_compression_codec}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "" }, { label: "新增设置" }]
    }
  ]}
/>

指定当表声明中未为特定列定义压缩编解码器时所使用的默认压缩编解码器。
列的压缩编解码器选择顺序:

1. 表声明中为该列定义的压缩编解码器
2. `default_compression_codec` 中定义的压缩编解码器(本设置)
3. `compression` 设置中定义的默认压缩编解码器
   默认值:空字符串(未定义)。


## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

启用或禁用在合并或变更后,当副本上的数据部分与其他副本上的数据部分字节不完全一致时,将其分离。如果禁用此设置,则会删除该数据部分。如果您希望稍后分析此类部分,请启用此设置。

此设置适用于已启用[数据复制](/engines/table-engines/mergetree-family/replacingmergetree)的 `MergeTree` 表。

可能的值:

- `0` — 删除数据部分。
- `1` — 分离数据部分。


## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

<SettingsInfoBlock type='Bool' default_value='1' />

修复丢失副本时不删除旧的本地数据部分。

可能的值：

- `true`
- `false`


## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

禁用零拷贝复制的 DETACH PARTITION 查询。


## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

禁用零拷贝复制的 FETCH PARTITION 查询。


## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

禁用零拷贝复制的 FREEZE PARTITION 查询。


## disk {#disk}

存储磁盘的名称。可以指定此参数来代替存储策略。


## dynamic_serialization_version {#dynamic_serialization_version}

<SettingsInfoBlock
  type='MergeTreeDynamicSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "添加用于控制 Dynamic 序列化版本的设置" }
      ]
    }
  ]}
/>

Dynamic 数据类型的序列化版本。用于保证兼容性。

可选值：

- `v1`
- `v2`
- `v3`


## enable_block_number_column {#enable_block_number_column}

<SettingsInfoBlock type='Bool' default_value='0' />

为每行启用持久化 \_block_number 列。


## enable_block_offset_column {#enable_block_offset_column}

<SettingsInfoBlock type='Bool' default_value='0' />

在合并时持久化虚拟列 `_block_number`。


## enable_index_granularity_compression {#enable_index_granularity_compression}

<SettingsInfoBlock type='Bool' default_value='1' />

如果可能,在内存中压缩索引粒度值


## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "新设置" }]
    },
    {
      id: "row-2",
      items: [
        { label: "25.1" },
        { label: "0" },
        {
          label:
            "新增设置用于限制 min_age_to_force_merge 的最大字节数。"
        }
      ]
    }
  ]}
/>

设置 `min_age_to_force_merge_seconds` 和
`min_age_to_force_merge_on_partition_only` 是否应遵守设置
`max_bytes_to_merge_at_max_space_in_pool`。

可能的值:

- `true`
- `false`


## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

启用或禁用通过 `index_granularity_bytes` 设置控制颗粒大小的过渡机制。在 19.11 版本之前,仅有 `index_granularity` 设置用于限制颗粒大小。当从包含大行数据(数十到数百兆字节)的表中查询数据时,`index_granularity_bytes` 设置可以提升 ClickHouse 的性能。如果您的表包含大行数据,可以为这些表启用此设置以提高 `SELECT` 查询的效率。


## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.3" },
        { label: "0" },
        {
          label:
            "新增设置,允许 ReplacingMergeTree 自动执行清理合并"
        }
      ]
    }
  ]}
/>

是否在将分区合并为单个部分时对 ReplacingMergeTree 使用 CLEANUP 合并。需要启用 `allow_experimental_replacing_merge_with_cleanup`、`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only`。

可能的值:

- `true`
- `false`


## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix}

<SettingsInfoBlock type='Bool' default_value='0' />

为 Replicated MergeTree 表启用带有 ZooKeeper 名称前缀的端点 ID。


## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm}

<SettingsInfoBlock type='UInt64' default_value='1' />

启用垂直合并算法的使用。


## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

如果为分区操作查询(`ATTACH/MOVE/REPLACE PARTITION`)的目标表启用此设置,则源表和目标表之间的索引和投影必须完全一致。否则,目标表可以包含源表索引和投影的超集。


## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "1" },
        {
          label:
            "对 Wide 部分中 Variant 类型子列文件名的特殊符号进行转义"
        }
      ]
    }
  ]}
/>

对 MergeTree 表 Wide 部分中 Variant 数据类型子列文件名的特殊符号进行转义。用于保持兼容性。


## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

<SettingsInfoBlock type='Bool' default_value='0' />

启用后,在选择要合并的数据分区时,将使用数据分区的估算实际大小(即排除通过 `DELETE FROM` 已删除的行)。请注意,此行为仅对启用此设置后执行的 `DELETE FROM` 所影响的数据分区生效。

可能的值:

- `true`
- `false`

**另请参阅**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
  设置


## exclude_materialize_skip_indexes_on_merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "新增设置。" }]
    }
  ]}
/>

排除指定的逗号分隔跳数索引列表,使其在合并期间不被构建和存储。如果 [materialize_skip_indexes_on_merge](#materialize_skip_indexes_on_merge) 为 false,则此设置无效。

被排除的跳数索引仍会通过显式的 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) 查询或在 INSERT 期间被构建和存储,具体取决于 [materialize_skip_indexes_on_insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert) 会话设置。

示例:

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- 此设置对 INSERT 操作无效

-- idx_a 将在后台合并或通过 OPTIMIZE TABLE FINAL 显式合并期间被排除更新

-- 可以通过提供列表来排除多个索引
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- 默认设置,合并期间不排除任何索引更新
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='0' />

当此设置的值大于零时,仅有一个副本会立即开始合并,其他副本将等待最多该时长以下载合并结果,而不是在本地执行合并。如果所选副本在该时长内未完成合并,则回退到标准行为。

可能的值:

- 任意正整数。


## fault_probability_after_part_commit {#fault_probability_after_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

用于测试。请勿修改。


## fault_probability_before_part_commit {#fault_probability_before_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

用于测试。请勿修改。


## finished_mutations_to_keep {#finished_mutations_to_keep}

<SettingsInfoBlock type='UInt64' default_value='100' />

保留已完成的变更(mutation)记录的数量。如果设置为零,则保留所有记录。


## force_read_through_cache_for_merges {#force_read_through_cache_for_merges}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

强制合并操作使用直读式文件系统缓存


## fsync_after_insert {#fsync_after_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

对每个插入的数据部分执行 fsync 操作。会显著降低插入性能,不建议与宽列数据部分一起使用。


## fsync_part_directory {#fsync_part_directory}

<SettingsInfoBlock type='Bool' default_value='0' />

在所有数据分区操作(写入、重命名等)之后对分区目录执行 fsync。


## in_memory_parts_enable_wal {#in_memory_parts_enable_wal}

<SettingsInfoBlock type="Bool" default_value="1" />
已废弃的设置,无任何作用。
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
已废弃的设置,无任何作用。
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

如果表中单个分区的非活动数据部分数量超过 `inactive_parts_to_delay_insert` 值,`INSERT` 操作将被人为延迟。

:::tip
当服务器无法及时清理数据部分时,此设置非常有用。
:::

可能的值:

- 任意正整数。


## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

如果单个分区中的非活动数据部分数量超过 `inactive_parts_to_throw_insert` 值,`INSERT` 操作将被中断并抛出以下错误:

> "Too many inactive parts (N). Parts cleaning are processing significantly
> slower than inserts" exception."

可能的值:

- 任意正整数。


## index_granularity {#index_granularity}

<SettingsInfoBlock type='UInt64' default_value='8192' />

索引标记之间的最大数据行数，即每个主键值对应的行数。


## index_granularity_bytes {#index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

数据颗粒的最大字节大小。

若仅按行数限制颗粒大小,请设置为 `0`(不推荐)。


## initialization_retry_period {#initialization_retry_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

表初始化的重试周期(秒)。


## kill_delay_period {#kill_delay_period}

<SettingsInfoBlock type="UInt64" default_value="30" />
已废弃的设置,不执行任何操作。
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
已废弃的设置,不执行任何操作。
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
已废弃的设置,不执行任何操作。
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

默认情况下,轻量级删除 `DELETE` 不支持带有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。因此默认值为 `throw`。但是,此选项可以改变该行为。当值为 `drop` 或 `rebuild` 时,删除操作将支持投影。`drop` 会删除投影,因此当前查询可能会很快(因为投影被删除),但后续查询会变慢(因为没有投影)。`rebuild` 会重建投影,这可能会影响当前查询的性能,但可能会加快后续查询的速度。这些选项的优点是仅在数据分片级别生效,这意味着数据分片中未受影响的投影将保持完整,而不会触发删除或重建等操作。

可能的值:

- `throw`
- `drop`
- `rebuild`


## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

如果与 [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 一起启用,
将在表启动时计算现有数据部分的已删除行数。注意:这可能会降低表启动加载的速度。

可能的值:

- `true`
- `false`

**另请参阅**

- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) 设置


## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations}

<SettingsInfoBlock type='Seconds' default_value='120' />

用于后台操作(如合并、mutation 等)获取表锁的超时时间(秒)。如果在指定时间内无法获取表锁,操作将失败。


## marks_compress_block_size {#marks_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

标记压缩块大小,表示要压缩的数据块的实际大小。


## marks_compression_codec {#marks_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

标记文件使用的压缩编码。由于标记文件体积较小且会被缓存,因此默认压缩方式为 ZSTD(3)。


## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "新设置" }]
    }
  ]}
/>

启用后,合并操作会为新数据部分构建并存储跳数索引。
否则,可以通过显式执行 [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
或[在 INSERT 期间](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)创建/存储跳数索引。

另请参阅 [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) 以实现更精细的控制。


## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only}

<SettingsInfoBlock type='Bool' default_value='0' />

仅在执行 MATERIALIZE TTL 时重新计算 TTL 信息


## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

根据 'parts_to_delay_insert' 和 'parts_to_throw_insert' 进行的"过多数据分片"检查仅在平均分片大小(在相关分区中)不大于指定阈值时才会激活。如果平均分片大小大于指定阈值,INSERT 操作将既不会被延迟也不会被拒绝。这使得在单个服务器的单个表中存储数百 TB 的数据成为可能,前提是这些分片能够成功合并为更大的分片。此设置不影响非活动分片或总分片数的阈值。


## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='161061273600' />

当有足够资源可用时,可合并为单个数据部分的最大总大小(以字节为单位)。该值大致对应于自动后台合并所能创建的最大数据部分大小。(设置为 0 表示禁用合并)

可能的值:

- 任意非负整数。

合并调度器会定期分析分区中数据部分的大小和数量,当池中有足够的空闲资源时,会启动后台合并。合并将持续进行,直到源数据部分的总大小超过 `max_bytes_to_merge_at_max_space_in_pool`。

由 [OPTIMIZE FINAL](/sql-reference/statements/optimize) 发起的合并会忽略 `max_bytes_to_merge_at_max_space_in_pool` 参数(仅考虑可用磁盘空间)。


## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

在后台池资源最少时,允许合并为单个数据分区的最大总大小(以字节为单位)。

可能的值:

- 任意正整数。

`max_bytes_to_merge_at_min_space_in_pool` 定义了即使磁盘空间不足(池中),仍可合并的数据分区的最大总大小。
此设置用于减少小分区的数量,降低出现 `Too many parts` 错误的概率。
合并操作会预留相当于合并分区总大小两倍的磁盘空间。
因此,当可用磁盘空间较少时,可能出现以下情况:虽然存在空闲空间,但该空间已被正在进行的大型合并操作预留,
导致其他合并操作无法启动,小分区的数量随每次插入而不断增加。


## max_cleanup_delay_period {#max_cleanup_delay_period}

<SettingsInfoBlock type='UInt64' default_value='300' />

清理旧队列日志、块哈希值和数据分片的最大周期。


## max_compress_block_size {#max_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

在压缩写入表之前,未压缩数据块的最大大小。您也可以在全局设置中指定此设置
(参见 [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
设置)。创建表时指定的值会覆盖此设置的全局值。


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

与 MergeTree 表相关的最大并发执行查询数。
查询仍会受到其他 `max_concurrent_queries` 设置的限制。

可能的值:

- 正整数。
- `0` — 无限制。

默认值:`0`(无限制)。

**示例**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert {#max_delay_to_insert}

<SettingsInfoBlock type='UInt64' default_value='1' />

该值以秒为单位,用于计算 `INSERT` 延迟。当单个分区中的活跃数据部分数量超过 [parts_to_delay_insert](#parts_to_delay_insert) 值时,将使用此值进行计算。

可能的值:

- 任意正整数。

`INSERT` 的延迟(以毫秒为单位)按以下公式计算:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

例如,如果一个分区有 299 个活跃数据部分,且 parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1,则 `INSERT` 将延迟 `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000` 毫秒。

从版本 23.1 开始,公式已更改为:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

例如,如果一个分区有 224 个活跃数据部分,且 parts_to_throw_insert = 300、parts_to_delay_insert = 150、max_delay_to_insert = 1、min_delay_to_insert_ms = 10,则 `INSERT` 将延迟 `max( 10, 1 * 1000 * (224 - 150 + 1) / (300 - 150) ) = 500` 毫秒。


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />

当存在大量未完成的 mutation 操作时,MergeTree 表执行 mutation 的最大延迟时间(毫秒)


## max_digestion_size_per_segment {#max_digestion_size_per_segment}

<SettingsInfoBlock type='UInt64' default_value='268435456' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "268435456" },
        { label: "已废弃设置" }
      ]
    }
  ]}
/>


已废弃的设置,无任何作用。

## max_file_name_length {#max_file_name_length}

<SettingsInfoBlock type='UInt64' default_value='127' />

文件名保持原样而不进行哈希处理的最大长度。
仅在启用 `replace_long_file_name_to_hash` 设置时生效。
此设置的值不包含文件扩展名的长度。因此,
建议将其设置为低于最大文件名长度(通常为 255
字节)并预留一定空间,以避免文件系统错误。


## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='75' />

如果需要修改(删除、添加)的文件数量超过此设置值,则不执行 ALTER 操作。

可选值:

- 任意正整数。

默认值:75


## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='50' />

如果待删除的文件数量超过此设置值,则不会执行 ALTER 操作。

可选值:

- 任意正整数。


## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write}

<SettingsInfoBlock type='UInt64' default_value='40' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "40" }, { label: "新设置" }]
    }
  ]}
/>

可并行刷新的最大流（列）数量
（类似于合并操作中的 max_insert_delayed_streams_for_parallel_write）。仅适用于垂直合并。


## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />

在未选择到任何分区后，再次尝试选择要合并的分区之前等待的最长时间。较低的设置会频繁触发 background_schedule_pool 中的选择任务，从而在大规模集群中向 ZooKeeper 发送大量请求


## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool}

<SettingsInfoBlock type='UInt64' default_value='2' />
当池中带有 TTL 条目的合并数量超过指定值时,不再分配新的 TTL 合并。这样做是为了给常规合并保留空闲线程,避免出现 \"Too many parts\" 错误


## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica}

<SettingsInfoBlock type='UInt64' default_value='0' />

限制每个副本的数据分片变更(mutation)操作数量至指定值。
零表示对每个副本的变更操作数量不设限制(但执行仍可能受其他设置约束)。


## max_part_loading_threads {#max_part_loading_threads}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
已废弃的设置,无任何作用。
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
已废弃的设置,无任何作用。
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

限制单个查询中可访问的分区数量上限。

创建表时指定的设置值可通过查询级别设置进行覆盖。

可能的值:

- 任意正整数。

您还可以在查询/会话/配置文件级别指定查询复杂度设置 [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)。


## max_parts_in_total {#max_parts_in_total}

<SettingsInfoBlock type='UInt64' default_value='100000' />

如果表的所有分区中活跃数据部分的总数超过 `max_parts_in_total` 值,`INSERT` 操作将被中断并抛出 `Too many parts (N)` 异常。

可选值:

- 任意正整数。

表中存在大量数据部分会降低 ClickHouse 查询性能并增加 ClickHouse 启动时间。这通常是由于设计不当导致的(选择分区策略时的错误 - 分区过小)。


## max_parts_to_merge_at_once {#max_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='100' />

一次可以合并的数据分片的最大数量(0 表示禁用)。不影响 OPTIMIZE FINAL 查询。


## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />

失败的 mutation 操作的最大延迟时间。


## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "新增设置,用于启用复制队列中数据拉取任务的延迟功能。"
        }
      ]
    }
  ]}
/>

复制数据拉取失败时的最大延迟时间。


## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "新增设置,用于在复制队列中延迟合并任务。"
        }
      ]
    }
  ]}
/>

失败的副本合并的最大延迟时间。


## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "300000" },
        {
          label:
            "新增设置以启用复制队列中任务的延迟功能。"
        }
      ]
    }
  ]}
/>

失败的复制任务的最大延迟时间。当任务不是 fetch、merge 或 mutation 操作时使用此值。


## max_projections {#max_projections}

<SettingsInfoBlock type='UInt64' default_value='25' />

MergeTree 投影的最大数量。


## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

限制[复制](../../engines/table-engines/mergetree-family/replication.md)获取操作的网络数据交换最大速度,单位为字节/秒。此设置应用于特定表,与应用于服务器的[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)设置不同。

您可以同时限制服务器网络和特定表的网络带宽,但表级设置的值应小于服务器级设置的值。否则,服务器仅考虑`max_replicated_fetches_network_bandwidth_for_server`设置。

该设置不会被完全精确地遵循。

可能的值:

- 正整数。
- `0` — 无限制。

默认值:`0`。

**用法**

可用于在复制数据以添加或替换新节点时限制速度。


## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

<SettingsInfoBlock type='UInt64' default_value='1000' />

当存在不活跃副本时,ClickHouse Keeper 日志中可保留的记录数量。当记录数超过此值时,不活跃的副本将被标记为丢失。

可选值:

- 任意正整数。


## max_replicated_merges_in_queue {#max_replicated_merges_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1000' />

在 ReplicatedMergeTree 队列中允许同时执行的合并和变更数据分区任务的数量。


## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1' />

在 ReplicatedMergeTree 队列中允许同时执行的带 TTL 数据分片合并任务的数量。


## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue}

<SettingsInfoBlock type='UInt64' default_value='8' />

ReplicatedMergeTree 队列中允许同时执行的数据分片变更任务数量。


## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

限制[复制](/engines/table-engines/mergetree-family/replacingmergetree)发送时网络数据交换的最大速度,单位为字节/秒。此设置应用于特定表,与应用于服务器的 [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth) 设置不同。

您可以同时限制服务器网络和特定表的网络带宽,但表级设置的值应小于服务器级设置的值。否则,服务器仅考虑 `max_replicated_sends_network_bandwidth_for_server` 设置。

该设置不会被完全精确地遵循。

可能的值:

- 正整数。
- `0` — 无限制。

**用法**

可用于在复制数据以添加或替换新节点时限制速度。


## max_suspicious_broken_parts {#max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='100' />

如果单个分区中损坏数据分片的数量超过 `max_suspicious_broken_parts` 值,将禁止自动删除。

可选值:

- 任意正整数。


## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

所有损坏数据分区的最大字节数，超过此值将禁止自动删除。

可能的值：

- 任意正整数。


## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches}

<SettingsInfoBlock type='UInt64' default_value='32212254720' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32212254720" },
        { label: "新设置" }
      ]
    }
  ]}
/>

所有补丁部分中数据的最大未压缩大小(以字节为单位)。
如果所有补丁部分中的数据量超过此值,则轻量级更新将被拒绝。
0 表示无限制。


## merge_max_block_size {#merge_max_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8192' />

从待合并的数据部分读取到内存中的行数。

可能的值：

- 任意正整数。

合并操作以 `merge_max_block_size` 行为单位从数据部分读取行，然后合并并将结果写入新的数据部分。读取的数据块会被放置在内存中，因此 `merge_max_block_size` 会影响合并所需的内存大小。因此，对于包含非常宽的行的表，合并操作可能会消耗大量内存（例如，如果平均行大小为 100kb，那么在合并 10 个数据部分时，(100kb _ 10 _ 8192) = ~ 8GB 内存）。通过降低 `merge_max_block_size`，可以减少合并所需的内存量，但会降低合并速度。


## merge_max_block_size_bytes {#merge_max_block_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

合并操作中数据块应包含的字节数。默认值与 `index_granularity_bytes` 相同。


## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "1073741824" },
        { label: "Cloud sync" }
      ]
    }
  ]}
/>

仅在 ClickHouse Cloud 中可用。合并期间用于预热缓存的数据部分(compact 或 packed)的最大大小。


## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "auto" },
        {
          label:
            "新增设置以限制合并后 Wide 部分中的动态子列数量,不受数据类型中指定参数的限制"
        }
      ]
    }
  ]}
/>

合并后 Wide 数据部分中每列可创建的动态子列的最大数量。
此设置允许减少 Wide 数据部分中创建的文件数量,不受数据类型中指定的动态参数限制。

例如,如果表中有一个 JSON(max_dynamic_paths=1024) 类型的列,且 merge_max_dynamic_subcolumns_in_wide_part 设置为 128,
则合并到 Wide 数据部分后,该部分中的动态路径数量将减少到 128,仅有 128 个路径会作为动态子列写入。


## merge_selecting_sleep_ms {#merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />

在未选择到任何数据分区后,再次尝试选择要合并的分区之前需要等待的最短时间。设置较低的值会导致 background_schedule_pool 中频繁触发选择任务,在大规模集群中会向 ZooKeeper 发送大量请求


## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor}

<SettingsInfoBlock type='Float' default_value='1.2' />

当没有需要合并的数据时，合并选择任务的休眠时间将乘以此系数；当分配合并任务时，休眠时间将除以此系数


## merge_selector_algorithm {#merge_selector_algorithm}

<ExperimentalBadge />
<SettingsInfoBlock type='MergeSelectorAlgorithm' default_value='Simple' />

用于选择数据分片进行合并分配的算法


## merge_selector_base {#merge_selector_base}

<SettingsInfoBlock type='Float' default_value='5' />
影响已分配合并的写入放大系数（专家级设置，如不了解其作用请勿修改）。适用于 Simple 和 StochasticSimple 合并选择器


## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor}

<SettingsInfoBlock type='UInt64' default_value='0' />

控制该逻辑相对于分区中数据部分数量的触发时机。该因子越大,触发反应越延迟。


## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right}

<SettingsInfoBlock type='Bool' default_value='1' />

启用用于选择合并分区的启发式算法,当分区大小小于总大小的指定比例(0.01)时,从范围右侧移除这些分区。
适用于 Simple 和 StochasticSimple 合并选择器


## merge_selector_window_size {#merge_selector_window_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />

一次检查的数据部分数量。


## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='16106127360' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "16106127360" },
        { label: "云端同步" }
      ]
    }
  ]}
/>

仅在 ClickHouse Cloud 中可用。合并期间用于预热缓存的数据分片总大小上限。


## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds}

<SettingsInfoBlock type="UInt64" default_value="2592000" />
已废弃的设置,无任何作用。
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

设置 ClickHouse 执行旧数据分片、WAL 和变更清理的时间间隔(以秒为单位)。

可能的值:

- 任意正整数。


## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds}

<SettingsInfoBlock type='UInt64' default_value='60' />

设置 ClickHouse 清理旧临时目录的时间间隔(以秒为单位)。

可选值:

- 任意正整数。


## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached}

<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

重复执行带重新压缩 TTL 的合并操作前的最小延迟秒数。


## merge_with_ttl_timeout {#merge_with_ttl_timeout}

<SettingsInfoBlock type='Int64' default_value='14400' />

重复执行带删除 TTL 的合并操作前的最小延迟秒数。


## merge_workload {#merge_workload}

用于调节合并操作与其他工作负载之间的资源使用和共享方式。指定的值将作为此表后台合并的 `workload` 设置值。如果未指定(空字符串),则使用服务器设置 `merge_workload`。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## min_absolute_delay_to_close {#min_absolute_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='0' />

关闭前的最小绝对延迟时间。在此期间停止处理请求，且状态检查时不返回 Ok。


## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

<SettingsInfoBlock type='Bool' default_value='0' />

`min_age_to_force_merge_seconds` 是否仅应用于整个分区而不应用于子集。

默认情况下,忽略 `max_bytes_to_merge_at_max_space_in_pool` 设置(参见 `enable_max_bytes_limit_for_min_age_to_force_merge`)。

可能的值:

- true, false


## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />

如果范围内的每个数据部分的存在时间都超过 `min_age_to_force_merge_seconds` 的值,则合并这些数据部分。

默认情况下,忽略 `max_bytes_to_merge_at_max_space_in_pool` 设置
(参见 `enable_max_bytes_limit_for_min_age_to_force_merge`)。

可能的值:

- 正整数。


## min_bytes_for_compact_part {#min_bytes_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。数据部分使用完整存储类型(而非打包存储类型)所需的最小未压缩字节大小


## min_bytes_for_wide_part {#min_bytes_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

数据部分能够以 `Wide` 格式存储的最小字节数/行数。您可以设置其中一项、两项或都不设置。


## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

预热新数据部分的标记缓存和主索引缓存的最小大小(未压缩字节)


## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod}

<SettingsInfoBlock type='UInt64' default_value='0' />

设置在 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 卷磁盘间分配新的大数据分片时启用均衡的最小字节数。

可能的值:

- 正整数。
- `0` — 禁用均衡。

**用法**

`min_bytes_to_rebalance_partition_over_jbod` 设置的值不应小于 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) / 1024 的值。否则,ClickHouse 将抛出异常。


## min_compress_block_size {#min_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

写入下一个标记时需要压缩的未压缩数据块的最小大小。您也可以在全局设置中指定此设置
(参见 [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
设置)。创建表时指定的值会覆盖此设置的全局值。


## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch}

<SettingsInfoBlock type='UInt64' default_value='0' />

获取数据分片后执行 fsync 操作所需的最小压缩字节数(0 表示禁用)


## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

合并后对数据分区执行 fsync 操作所需的最小压缩字节数(0 表示禁用)


## min_delay_to_insert_ms {#min_delay_to_insert_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

当单个分区中存在大量未合并部分时,向 MergeTree 表插入数据的最小延迟(毫秒)。


## min_delay_to_mutate_ms {#min_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

当存在大量未完成的 mutation 操作时,MergeTree 表执行 mutation 的最小延迟(毫秒)


## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

执行数据插入操作所需的磁盘最小可用空间字节数。如果可用空闲字节数少于
`min_free_disk_bytes_to_perform_insert`,则会抛出异常,
插入操作将不会执行。请注意此设置:

- 会将 `keep_free_space_bytes` 设置纳入考量。
- 不会将 `INSERT` 操作即将写入的数据量纳入考量。
- 仅在指定正数(非零)字节数时才会进行检查

可能的值:

- 任意正整数。

:::note
如果同时指定了 `min_free_disk_bytes_to_perform_insert` 和 `min_free_disk_ratio_to_perform_insert`,
ClickHouse 将采用能够在更大可用空间下执行插入操作的值。
:::


## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

<SettingsInfoBlock type='Float' default_value='0' />

执行 `INSERT` 操作所需的最小可用磁盘空间与总磁盘空间的比率。必须是 0 到 1 之间的浮点数值。请注意此设置：

- 会将 `keep_free_space_bytes` 设置纳入考虑。
- 不会将 `INSERT` 操作将要写入的数据量纳入考虑。
- 仅在指定正值(非零)比率时才会进行检查

可能的值:

- 浮点数,0.0 - 1.0

请注意,如果同时指定了 `min_free_disk_ratio_to_perform_insert` 和 `min_free_disk_bytes_to_perform_insert`,ClickHouse 将采用能够在更大可用磁盘空间下执行插入操作的值。


## min_index_granularity_bytes {#min_index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='1024' />

数据颗粒允许的最小字节大小。

用于防止意外创建 `index_granularity_bytes` 值过低的表。


## min_level_for_full_part_storage {#min_level_for_full_part_storage}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

仅在 ClickHouse Cloud 中可用。使用完整存储类型而非打包存储的最小数据分区级别


## min_level_for_wide_part {#min_level_for_wide_part}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "新增设置" }]
    }
  ]}
/>

创建 `Wide` 格式数据分区（而非 `Compact` 格式）所需的最小分区级别。


## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

查询需要读取的最小标记数,达到此阈值后才会应用 [max_concurrent_queries](#max_concurrent_queries) 设置。

:::note
查询仍会受到其他 `max_concurrent_queries` 设置的限制。
:::

可能的值:

- 正整数。
- `0` — 禁用(所有查询均不应用 `max_concurrent_queries` 限制)。

**示例**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

合并操作使用直接 I/O 访问存储磁盘所需的最小数据量。在合并数据分区时,ClickHouse 会计算所有待合并数据的总存储量。如果该数据量超过 `min_merge_bytes_to_use_direct_io` 字节,ClickHouse 将使用直接 I/O 接口(`O_DIRECT` 选项)向存储磁盘读写数据。如果 `min_merge_bytes_to_use_direct_io = 0`,则禁用直接 I/O。


## min_parts_to_merge_at_once {#min_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='0' />

合并选择器一次可选择合并的数据部分的最小数量
(专家级设置,如不理解其作用请勿修改)。
0 - 禁用。适用于 Simple 和 StochasticSimple 合并选择器。


## min_relative_delay_to_close {#min_relative_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='300' />

与其他副本相比的最小延迟阈值。当达到此阈值时,副本将关闭、停止处理请求,并在状态检查时不返回 Ok。


## min_relative_delay_to_measure {#min_relative_delay_to_measure}

<SettingsInfoBlock type='UInt64' default_value='120' />

仅当绝对延迟不小于此值时,才计算相对副本延迟。


## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership}

<SettingsInfoBlock type="UInt64" default_value="120" />
已废弃的设置,无任何作用。
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

在 ZooKeeper 日志中保留约此数量的最新记录,即使这些记录已过时。此设置不影响表的运行:仅用于在清理前诊断 ZooKeeper 日志。

可选值:

- 任意正整数。


## min_rows_for_compact_part {#min_rows_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

仅在 ClickHouse Cloud 中可用。使用完整存储类型而非压缩存储来存储数据部分所需的最小行数


## min_rows_for_wide_part {#min_rows_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='0' />

创建 `Wide` 格式数据部分（而非 `Compact` 格式）所需的最小行数。


## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

合并后对数据分区执行 fsync 的最小行数(0 表示禁用)


## mutation_workload {#mutation_workload}

用于调节 mutation 与其他工作负载之间的资源使用和共享方式。指定的值将作为该表后台 mutation 的 `workload` 设置值。如果未指定(空字符串),则使用服务器设置 `mutation_workload`。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## non_replicated_deduplication_window {#non_replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='0' />

在非复制的 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中,为检查重复项而存储哈希和的最近插入块数量。

可能的值:

- 任意正整数。
- `0`(禁用去重)。

使用与复制表类似的去重机制(参见 [replicated_deduplication_window](#replicated_deduplication_window) 设置)。创建的数据部分的哈希和会写入磁盘上的本地文件。


## notify_newest_block_number {#notify_newest_block_number}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

向 SharedJoin 或 SharedSet 通知最新的块编号。仅在 ClickHouse Cloud 中可用。


## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation}

<SettingsInfoBlock type='UInt64' default_value='20' />

当池中的空闲条目数少于指定数量时,不执行数据分片的变更操作。这样做是为了给常规合并操作保留空闲线程,并避免出现"Too many parts"(分片过多)错误。

可能的值:

- 任意正整数。

**用法**

`number_of_free_entries_in_pool_to_execute_mutation` 设置的值应小于 [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

- [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio) 的值。
  否则,ClickHouse 将抛出异常。


## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

<SettingsInfoBlock type='UInt64' default_value='25' />

当池中的空闲条目数少于指定数量时,不在后台执行整个分区的优化(此任务在设置 `min_age_to_force_merge_seconds` 并启用 `min_age_to_force_merge_on_partition_only` 时生成)。这是为了给常规合并保留空闲线程,避免出现"Too many parts"错误。

可能的值:

- 正整数。

`number_of_free_entries_in_pool_to_execute_optimize_entire_partition` 设置的值应小于
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

- [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio)
  的值。否则,ClickHouse 将抛出异常。


## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge}

<SettingsInfoBlock type='UInt64' default_value='8' />

当池(或复制队列)中的空闲条目数少于指定数量时,开始降低要处理(或放入队列)的合并操作的最大大小。
这样做是为了允许小型合并操作得以处理,避免长时间运行的合并操作占满池。

可能的值:

- 任意正整数。


## number_of_mutations_to_delay {#number_of_mutations_to_delay}

<SettingsInfoBlock type='UInt64' default_value='500' />
当表中至少有指定数量的未完成变更操作时,会人为降低该表变更操作的执行速度。设置为 0 时禁用此功能


## number_of_mutations_to_throw {#number_of_mutations_to_throw}

<SettingsInfoBlock type='UInt64' default_value='1000' />

如果表中至少有这么多未完成的变更操作，则抛出 'Too many mutations' 异常。设置为 0 时禁用此限制


## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

仅在 ClickHouse Cloud 中可用。最多考虑排名前 N 的分区进行合并。分区通过随机加权方式选择,权重为该分区中可合并的数据部分数量。


## object_serialization_version {#object_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "添加控制 JSON 序列化版本的设置" }
      ]
    }
  ]}
/>

JSON 数据类型的序列化版本。兼容性所需。

可选值:

- `v1`
- `v2`
- `v3`

仅 `v3` 版本支持更改共享数据序列化版本。


## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "8" },
        {
          label:
            "添加用于控制 Compact 部分中 JSON 序列化共享数据存储桶数量的设置"
        }
      ]
    }
  ]}
/>

Compact 部分中 JSON 共享数据序列化的存储桶数量。适用于 `map_with_buckets` 和 `advanced` 共享数据序列化方式。


## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='32' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32" },
        {
          label:
            "添加设置项以控制 Wide 部分中 JSON 序列化共享数据的存储桶数量"
        }
      ]
    }
  ]}
/>

Wide 部分中 JSON 共享数据序列化的存储桶数量。适用于 `map_with_buckets` 和 `advanced` 共享数据序列化方式。


## object_shared_data_serialization_version {#object_shared_data_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        { label: "添加控制 JSON 序列化版本的设置" }
      ]
    }
  ]}
/>

JSON 数据类型中共享数据的序列化版本。

可选值：

- `map` - 将共享数据存储为 `Map(String, String)` 类型
- `map_with_buckets` - 将共享数据存储为多个独立的 `Map(String, String)` 列。使用分桶可提升从共享数据中读取单个路径的性能。
- `advanced` - 共享数据的特殊序列化方式，旨在显著提升从共享数据中读取单个路径的性能。
  注意：此序列化方式会增加共享数据在磁盘上的存储大小，因为需要存储大量额外信息。

`map_with_buckets` 和 `advanced` 序列化方式的分桶数量由以下设置决定：
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part)。


## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        {
          label:
            "添加用于控制零级部分 JSON 序列化版本的设置"
        }
      ]
    }
  ]}
/>

此设置用于指定插入操作期间创建的零级部分中 JSON 类型共享数据的序列化版本。
建议不要对零级部分使用 `advanced` 共享数据序列化,因为这可能会显著增加插入时间。


## old_parts_lifetime {#old_parts_lifetime}

<SettingsInfoBlock type='Seconds' default_value='480' />

存储非活动数据分片的时间(以秒为单位),用于防止服务器意外重启时的数据丢失。

可能的值:

- 任意正整数。

将多个数据分片合并为一个新分片后,ClickHouse 会将原始分片标记为非活动状态,并仅在 `old_parts_lifetime` 秒后删除它们。
如果非活动分片未被当前查询使用,即分片的 `refcount` 为 1,则会被移除。

新分片不会调用 `fsync`,因此在一段时间内新分片仅存在于服务器的 RAM(操作系统缓存)中。如果服务器意外重启,新分片可能会丢失或损坏。为了保护数据,非活动分片不会立即删除。

在启动期间,ClickHouse 会检查数据分片的完整性。如果合并后的分片已损坏,ClickHouse 会将非活动分片返回到活动列表,并稍后再次合并它们。然后,损坏的分片会被重命名(添加 `broken_` 前缀)并移动到 `detached` 文件夹。如果合并后的分片未损坏,则原始非活动分片会被重命名(添加 `ignored_` 前缀)并移动到 `detached` 文件夹。

默认的 `dirty_expire_centisecs` 值(Linux 内核设置)为 30 秒(写入数据仅存储在 RAM 中的最长时间),但在磁盘系统负载较重的情况下,数据可能会延迟更长时间才写入。经过实验,为 `old_parts_lifetime` 选择了 480 秒的值,在此期间可以保证新分片被写入磁盘。


## optimize_row_order {#optimize_row_order}

<SettingsInfoBlock type='Bool' default_value='0' />

控制在插入数据时是否优化行顺序，以提高新插入表部分的可压缩性。

仅对普通 MergeTree 引擎表生效。对特殊的 MergeTree 引擎表（例如 CollapsingMergeTree）不起作用。

MergeTree 表可以（可选）使用[压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)进行压缩。
如果数据呈现出规律性模式，通用压缩编解码器（如 LZ4 和 ZSTD）可以达到最高的压缩率。相同值的长序列通常具有非常好的压缩效果。

如果启用此设置，ClickHouse 会尝试以最小化新表部分各列中相等值序列数量的行顺序来存储新插入部分的数据。
换句话说，相等值序列数量越少，意味着单个序列越长，压缩效果越好。

寻找最优行顺序在计算上是不可行的（NP 困难问题）。
因此，ClickHouse 使用启发式算法快速找到一个相对于原始行顺序仍能提高压缩率的行顺序。

<details markdown="1">

<summary>寻找行顺序的启发式算法</summary>

通常可以自由地打乱表（或表部分）的行顺序，因为 SQL 认为不同行顺序的同一表（表部分）是等价的。

当为表定义主键时，这种打乱行的自由度会受到限制。在 ClickHouse 中，主键 `C1, C2, ..., CN` 强制表行按列 `C1`、`C2`、...、`Cn` 排序（[聚簇索引](https://en.wikipedia.org/wiki/Database_index#Clustered)）。
因此，行只能在"等价类"内打乱，即主键列具有相同值的行。
直观地说，高基数的主键（例如包含 `DateTime64` 时间戳列的主键）会产生许多小的等价类。同样，具有低基数主键的表会产生少量大的等价类。没有主键的表代表了一个极端情况，即包含所有行的单个等价类。

等价类越少、越大，重新打乱行时的自由度就越高。

用于在每个等价类中找到最佳行顺序的启发式算法由 D. Lemire 和 O. Kaser 在
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
中提出，基于按非主键列的基数升序对每个等价类中的行进行排序。

该算法执行三个步骤:

1. 根据主键列中的行值查找所有等价类。
2. 对于每个等价类，计算（通常是估算）非主键列的基数。
3. 对于每个等价类，按非主键列基数升序对行进行排序。

</details>

如果启用，插入操作会产生额外的 CPU 开销来分析和优化新数据的行顺序。根据数据特征，INSERT 操作预计会延长 30-50% 的时间。
LZ4 或 ZSTD 的压缩率平均提高 20-40%。

此设置最适合没有主键或具有低基数主键的表，即只有少量不同主键值的表。
高基数主键（例如包含 `DateTime64` 类型的时间戳列）预计不会从此设置中受益。


## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='30' />

在分片之间移动数据分区前后的等待时间。


## part_moves_between_shards_enable {#part_moves_between_shards_enable}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='0' />

实验性/不完整功能，用于在分片之间移动数据部分。不考虑分片表达式。


## parts_to_delay_insert {#parts_to_delay_insert}

<SettingsInfoBlock type='UInt64' default_value='1000' />

如果单个分区中的活跃数据部分数量超过 `parts_to_delay_insert` 值,`INSERT` 操作将被人为延迟。

可能的值:

- 任意正整数。

ClickHouse 会人为地延长 `INSERT` 的执行时间(添加"休眠"),以便后台合并进程能够以快于数据部分添加的速度进行合并。


## parts_to_throw_insert {#parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='3000' />

如果单个分区中的活跃数据部分数量超过 `parts_to_throw_insert` 值,`INSERT` 操作将被中断并抛出 `Too many parts (N). Merges are processing significantly slower than inserts` 异常。

可选值:

- 任意正整数。

为了实现 `SELECT` 查询的最佳性能,需要最小化处理的数据部分数量,详见 [Merge Tree](/development/architecture#merge-tree)。

在 23.6 版本之前,此设置的默认值为 300。您可以设置更高的值,这将降低出现 `Too many parts` 错误的概率,但同时 `SELECT` 性能可能会下降。此外,如果出现合并问题(例如磁盘空间不足),相比使用原始值 300,您会更晚发现该问题。


## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

如果数据分片大小总和超过此阈值,且自复制日志条目创建以来的时间大于
`prefer_fetch_merged_part_time_threshold`,则优先从副本获取已合并的分片,
而不是在本地执行合并。这样做是为了加速非常耗时的合并操作。

可选值:

- 任意正整数。


## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='3600' />

如果自复制日志(ClickHouse Keeper 或 ZooKeeper)条目创建以来经过的时间超过此阈值,且数据分片大小总和大于 `prefer_fetch_merged_part_size_threshold`,则优先从副本获取已合并的分片,而不是在本地执行合并。这可以加速耗时较长的合并操作。

可选值:

- 任意正整数。


## prewarm_mark_cache {#prewarm_mark_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
如果设置为 true,标记缓存将在插入、合并、数据拉取以及服务器启动时通过保存标记到缓存中来进行预热


## prewarm_primary_key_cache {#prewarm_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

如果为 true,则主索引缓存将在插入、合并、拉取数据以及服务器启动时通过将标记保存到标记缓存中来进行预热


## primary_key_compress_block_size {#primary_key_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

主键压缩块大小,即待压缩块的实际大小。


## primary_key_compression_codec {#primary_key_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

主键使用的压缩编码。由于主键足够小且会被缓存,
因此默认压缩方式为 ZSTD(3)。


## primary_key_lazy_load {#primary_key_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
在首次使用时将主键加载到内存中,而非在表初始化时加载。当存在大量表时,这可以节省内存。


## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns}

<SettingsInfoBlock type='Float' default_value='0.9' />

如果数据部分中主键列的值变化次数至少达到此比率,则跳过在内存中加载后续列。这样可以避免加载主键中不必要的列,从而节省内存使用。


## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type='Float' default_value='0.9375' />

列中_默认_值数量与_所有_值数量的最小比率。设置此值将使列采用稀疏序列化方式存储。

如果列是稀疏的(主要包含零值),ClickHouse 可以使用稀疏格式对其进行编码并自动优化计算 - 查询期间数据无需完全解压缩。要启用稀疏序列化,请将 `ratio_of_defaults_for_sparse_serialization` 设置为小于 1.0 的值。如果该值大于或等于 1.0,则列将始终使用常规的完整序列化方式写入。

可能的值:

- 介于 `0` 和 `1` 之间的浮点数,用于启用稀疏序列化
- `1.0`(或更大),如果不想使用稀疏序列化

**示例**

请注意,以下表中的 `s` 列在 95% 的行中为空字符串。在 `my_regular_table` 中我们不使用稀疏序列化,而在 `my_sparse_table` 中我们将 `ratio_of_defaults_for_sparse_serialization` 设置为 0.95:

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

请注意,`my_sparse_table` 中的 `s` 列在磁盘上占用的存储空间更少:

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

您可以通过查看 `system.parts_columns` 表的 `serialization_kind` 列来验证列是否使用了稀疏编码:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

您可以看到 `s` 的哪些部分使用了稀疏序列化存储:

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

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5000" }, { label: "Cloud sync" }]
    }
  ]}
/>

仅在 ClickHouse Cloud 中可用。当没有数据范围被删除或替换时,再次尝试减少阻塞部分之前需要等待的最短时间。设置较低的值会频繁触发 background_schedule_pool 中的任务,从而在大规模集群中向 ZooKeeper 发送大量请求


## refresh_parts_interval {#refresh_parts_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "0" }, { label: "新增设置" }]
    }
  ]}
/>

如果该值大于零,则从底层文件系统刷新数据部分列表,以检查数据是否已在后台更新。
仅当表位于只读磁盘上时才能设置此参数(这意味着该副本为只读副本,而数据正由另一个副本写入)。


## refresh_statistics_interval {#refresh_statistics_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.11" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

统计信息缓存的刷新间隔,以秒为单位。如果设置为 0,则禁用刷新功能。


## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='10800' />

当此设置的值大于零时,如果合并部分位于共享存储上,则仅由单个副本立即启动合并。

:::note
零拷贝复制尚未达到生产就绪状态
在 ClickHouse 22.8 及更高版本中,零拷贝复制默认为禁用状态。

不建议在生产环境中使用此功能。
:::

可能的值:

- 任意正整数。


## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

在转换过程中以兼容模式运行零拷贝功能。


## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path}

<ExperimentalBadge />
<SettingsInfoBlock type='String' default_value='/clickhouse/zero_copy' />

用于存储零拷贝表无关信息的 ZooKeeper 路径。


## remove_empty_parts {#remove_empty_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

在数据分区被 TTL、mutation 或折叠合并算法清理后,移除空数据分区。


## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='1' />

此设置用于尚未完成的实验性功能。


## remove_unused_patch_parts {#remove_unused_patch_parts}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "新设置" }]
    }
  ]}
/>

在后台移除已应用于所有活跃数据分区的补丁分区。


## replace_long_file_name_to_hash {#replace_long_file_name_to_hash}

<SettingsInfoBlock type='Bool' default_value='1' />

如果列的文件名过长(超过 'max_file_name_length' 字节),则将其替换为 SipHash128


## replicated_can_become_leader {#replicated_can_become_leader}

<SettingsInfoBlock type='Bool' default_value='1' />

如果设置为 true，该节点上的复制表副本将尝试获取 leader 角色。

可能的值：

- `true`
- `false`


## replicated_deduplication_window {#replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "10000" },
        { label: "提高默认值" }
      ]
    }
  ]}
/>

ClickHouse Keeper 存储哈希值以检查重复项的最近插入块数量。

可能的值:

- 任意正整数。
- 0(禁用去重)

`Insert` 命令会创建一个或多个块(部分)。对于[插入去重](../../engines/table-engines/mergetree-family/replication.md),在写入复制表时,ClickHouse 会将创建的部分的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的 `replicated_deduplication_window` 个块。最旧的哈希值会从 ClickHouse Keeper 中删除。

`replicated_deduplication_window` 的值过大会降低 `Inserts` 的速度,因为需要比较更多的条目。哈希值是根据字段名称和类型的组合以及插入部分的数据(字节流)计算得出的。


## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='10000' />

ClickHouse Keeper 为检查重复项而存储哈希值的最近异步插入块的数量。

可能的值:

- 任意正整数。
- 0(禁用异步插入的去重功能)

[异步插入](/operations/settings/settings#async_insert)命令会被缓存到一个或多个块(分区)中。对于[插入去重](/engines/table-engines/mergetree-family/replication),
当写入复制表时,ClickHouse 会将每次插入的哈希值写入 ClickHouse Keeper。哈希值仅存储最近的
`replicated_deduplication_window_for_async_inserts` 个块。最旧的哈希值会从 ClickHouse Keeper 中删除。
较大的 `replicated_deduplication_window_for_async_inserts` 值会降低
`异步插入`的速度,因为需要比较更多的条目。
哈希值是根据字段名称和类型的组合以及插入的数据(字节流)计算得出的。


## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.10" },
        { label: "3600" },
        { label: "降低默认值" }
      ]
    }
  ]}
/>

从 ClickHouse Keeper 中移除已插入数据块哈希值的时间间隔(秒)。

可能的值:

- 任意正整数。

与 [replicated_deduplication_window](#replicated_deduplication_window) 类似,
`replicated_deduplication_window_seconds` 指定用于插入去重的数据块哈希值的存储时长。超过
`replicated_deduplication_window_seconds` 时间的哈希值将从 ClickHouse Keeper 中移除,
即使它们的数量少于 `replicated_deduplication_window`。

该时间是相对于最新记录的时间,而非墙上时钟时间。如果只有一条记录,则将永久保存。


## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='604800' />

异步插入的哈希和在经过指定秒数后从 ClickHouse Keeper 中移除。

可能的值:

- 任意正整数。

与 [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts) 类似,
`replicated_deduplication_window_seconds_for_async_inserts` 指定了异步插入去重时数据块哈希和的存储时长。超过 `replicated_deduplication_window_seconds_for_async_inserts` 时间的哈希和将从 ClickHouse Keeper 中移除,即使它们的数量少于 `replicated_deduplication_window_for_async_inserts` 设定的值。

该时间是相对于最新记录的时间,而非实际时钟时间。如果只有一条记录,则将永久存储。


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置,无任何作用。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置,无任何作用。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
已废弃的设置,无任何作用。
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

可以合并并在单个 MUTATE_PART 条目中执行的变更命令的最大数量(0 表示无限制)


## replicated_max_parallel_fetches {#replicated_max_parallel_fetches}

<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
已废弃的设置,无任何作用。
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
已废弃的设置,无任何作用。
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

如果错误数据分片与总数据分片数量的比率小于此值,则允许启动。

Possible values:

- 浮点数,0.0 - 1.0


## search_orphaned_parts_disks {#search_orphaned_parts_disks}

<SettingsInfoBlock type='SearchOrphanedPartsDisks' default_value='any' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "any" }, { label: "新设置" }]
    }
  ]}
/>

ClickHouse 在执行任何 ATTACH 或 CREATE 表操作时会扫描所有磁盘以查找孤立数据分区,
以避免遗漏位于未定义磁盘(未包含在存储策略中)上的数据分区。
孤立数据分区源于潜在不安全的存储重新配置,例如某个磁盘从存储策略中被移除。
此设置根据磁盘特征限制搜索范围。

可能的值:

- any - 不限制范围。
- local - 仅限本地磁盘。
- none - 空范围,不执行搜索


## serialization_info_version {#serialization_info_version}

<SettingsInfoBlock
  type='MergeTreeSerializationInfoVersion'
  default_value='with_types'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_types" },
        {
          label:
            "更改为支持自定义字符串序列化的新格式"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.10" }, { label: "basic" }, { label: "新增设置" }]
    }
  ]}
/>

写入 `serialization.json` 时使用的序列化信息版本。
在集群升级期间需要此设置以保持兼容性。

可能的值：

- `basic` - 基本格式。
- `with_types` - 包含额外 `types_serialization_versions` 字段的格式，允许为每种类型指定序列化版本。
  这使得 `string_serialization_version` 等设置能够生效。

在滚动升级期间，应将此设置为 `basic`，以便新服务器生成与旧服务器兼容的数据部分。升级完成后，切换到 `WITH_TYPES` 以启用按类型指定的序列化版本。


## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "新设置" }]
    },
    {
      id: "row-2",
      items: [{ label: "25.8" }, { label: "0" }, { label: "新设置" }]
    },
    {
      id: "row-3",
      items: [{ label: "25.7" }, { label: "0" }, { label: "新设置" }]
    },
    {
      id: "row-4",
      items: [{ label: "25.6" }, { label: "0" }, { label: "新设置" }]
    },
    {
      id: "row-5",
      items: [{ label: "25.10" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

激活协调合并任务的重新调度。即使 shared_merge_tree_enable_coordinated_merges=0 时也很有用,因为这会填充合并协调器的统计信息并有助于冷启动。


## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "0" },
        { label: "减少 Keeper 中的元数据量。" }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "1" }, { label: "云同步" }]
    }
  ]}
/>

在 ZooKeeper 中为每个副本创建 /metadata 和 /columns 节点。
仅适用于 ClickHouse Cloud


## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment}

<SettingsInfoBlock type='Bool' default_value='0' />

停止为共享合并树分配合并任务。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "86400" }, { label: "New setting" }]
    }
  ]}
/>

当分区没有数据部分时，在 keeper 中保留的秒数。


## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

启用空分区 Keeper 条目的自动清理。


## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

启用协调合并策略


## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

启用将属性写入虚拟部分并在 Keeper 中提交数据块


## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

启用过时数据分区检查。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "3600" }, { label: "Cloud sync" }]
    }
  ]}
/>

共享合并树中数据分片更新的时间间隔（秒），用于在未被 ZooKeeper 监视触发时进行更新。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='50' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "50" }, { label: "新设置" }]
    }
  ]}
/>

数据分片更新的初始退避间隔。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "100" }, { label: "新增设置" }]
    }
  ]}
/>

服务器间 HTTP 连接超时时间。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10000" }, { label: "Cloud sync" }]
    }
  ]}
/>

服务器间 HTTP 通信的超时时间。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

向 shared_merge_tree_leader_update_period 添加 0 到 x 秒之间的均匀分布随机值,以避免惊群效应。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds}

<SettingsInfoBlock type='UInt64' default_value='30' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "30" }, { label: "Cloud sync" }]
    }
  ]}
/>

重新检查数据分片更新领导权的最大时间间隔。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once}

<SettingsInfoBlock type='UInt64' default_value='1000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000" }, { label: "Cloud sync" }]
    }
  ]}
/>

领导节点在单个 HTTP 请求中尝试确认删除的过期数据部分的最大数量。仅在 ClickHouse Cloud 中可用。


## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "5000" }, { label: "New setting" }]
    }
  ]}
/>

数据分片更新的最大退避时间。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total}

<SettingsInfoBlock type='UInt64' default_value='6' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "6" }, { label: "Cloud sync" }]
    }
  ]}
/>

数据分片更新领导者的最大数量。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "2" }, { label: "Cloud sync" }]
    }
  ]}
/>

数据分片更新领导者的最大数量。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

参与数据分片删除的最大副本数(killer 线程)。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range}

<SettingsInfoBlock type='UInt64' default_value='5' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5" }, { label: "Cloud sync" }]
    }
  ]}
/>

尝试分配可能存在冲突的合并操作的最大副本数(避免合并分配中的冗余冲突)。设置为 0 表示禁用此功能。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        { label: "SharedMergeTree 的最大损坏分区数,超过此值将禁止自动分离" }
      ]
    }
  ]}
/>

SharedMergeTree 的最大损坏分区数,超过此值将禁止自动分离.


## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        {
          label:
            "SMT 所有损坏分区的最大字节数,超过此值将拒绝自动分离"
        }
      ]
    }
  ]}
/>

SMT 所有损坏分区的最大字节数,超过此值将拒绝自动分离.


## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds}

<SettingsInfoBlock type='Int64' default_value='1800' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1800" }, { label: "云同步" }]
    }
  ]}
/>

存储插入去重 ID 的时长,用于在插入重试时避免错误操作。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "30000" }, { label: "新增设置" }]
    }
  ]}
/>

合并协调器选举线程的运行间隔时间


## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor}

<BetaBadge />
<SettingsInfoBlock type='Float' default_value='1.1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.5" },
        { label: "1.100000023841858" },
        { label: "新增设置" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "1.100000023841858" },
        { label: "降低负载后协调器休眠时间" }
      ]
    }
  ]}
/>

协调器线程延迟的时间调整因子


## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "新设置" }]
    }
  ]}
/>

合并协调器与 ZooKeeper 同步以获取最新元数据的频率


## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='20' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "20" }, { label: "New setting" }]
    }
  ]}
/>

协调器一次可以向 MergerMutator 请求的合并数量


## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

合并协调器线程两次运行之间的最大时间间隔


## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

协调器应准备并分发给各工作节点的合并条目数量


## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

合并协调器线程两次运行之间的最小时间间隔


## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

合并工作线程在执行即时操作后需要更新其状态时使用的超时时间


## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "新增设置" }]
    }
  ]}
/>

合并工作线程的运行间隔时间


## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "2" }, { label: "新设置" }]
    }
  ]}
/>

用于清理过期数据分区时,同一 rendezvous 哈希组中包含的副本数量。
仅在 ClickHouse Cloud 中可用。


## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations}

<SettingsInfoBlock type='Float' default_value='0.5' />

当 `<仅用于 mutation 的候选分区（无法合并的分区）>/<用于 mutation 的候选分区>` 比率高于此设置值时，将在合并/mutation 选择任务中重新加载合并谓词。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size}

<SettingsInfoBlock type='UInt64' default_value='32' />

一次调度的数据分片元数据获取作业数量。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

在启动包含此数据分片的新合并操作之前,保留本地已合并数据分片的时间。这为其他副本提供了获取该数据分片并启动合并的机会。
仅在 ClickHouse Cloud 中可用。


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000000" }, { label: "Cloud sync" }]
    }
  ]}
/>

数据部分在本地合并后，推迟分配下一次合并所需的最小大小（以行数计）。仅在 ClickHouse Cloud 中可用。


## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

在不启动包含此数据分片的新合并操作之前,保留本地已合并数据分片的时间。这使其他副本有机会获取该数据分片并启动此合并操作。
仅在 ClickHouse Cloud 中可用


## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

在可能的情况下从 leader 节点读取虚拟部分。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "0" },
        { label: "用于从其他副本获取部分(part)数据的新设置" }
      ]
    }
  ]}
/>

如果启用,所有副本将尝试从已存在该数据的其他副本获取部分(part)的内存数据(如主键、分区信息等)。


## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms}

<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "30000" }, { label: "New setting" }]
    }
  ]}
/>

副本按照后台调度重新加载其标志的频率。


## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

启用从其他副本的内存缓存请求文件系统缓存提示。仅适用于 ClickHouse Cloud


## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "1" },
        { label: "默认启用过时数据分区 v3" }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "云同步" }]
    }
  ]}
/>

对过时数据分区使用紧凑格式:降低 Keeper 负载,提升过时数据分区的处理性能。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

如果启用，过多分区计数器将依赖 Keeper 中的共享数据,而非本地副本状态。仅在 ClickHouse Cloud 中可用


## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

每个批次中打包的分区发现操作数量


## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />

如果存在大量过时的数据分区,清理线程会在单次迭代中尝试删除最多 `simultaneous_parts_removal_limit` 个数据分区。
将 `simultaneous_parts_removal_limit` 设置为 `0` 表示无限制。


## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

用于测试。请勿修改。


## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />

用于测试。请勿修改。


## storage_policy {#storage_policy}

<SettingsInfoBlock type='String' default_value='default' />

存储磁盘策略名称


## string_serialization_version {#string_serialization_version}

<SettingsInfoBlock
  type='MergeTreeStringSerializationVersion'
  default_value='with_size_stream'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_size_stream" },
        { label: "更改为带独立大小流的新格式" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "single_stream" },
        { label: "新增设置" }
      ]
    }
  ]}
/>

控制顶层 `String` 列的序列化格式。

此设置仅在 `serialization_info_version` 设置为 "with_types" 时生效。
启用后,顶层 `String` 列将通过独立的 `.size` 子列存储字符串长度,而非内联方式。这样可以使用真实的 `.size` 子列,并提高压缩效率。

嵌套的 `String` 类型(例如位于 `Nullable`、`LowCardinality`、`Array` 或 `Map` 内部的)不受影响,但出现在 `Tuple` 中时除外。

可选值:

- `single_stream` — 使用内联大小的标准序列化格式。
- `with_size_stream` — 为顶层 `String` 列使用独立的大小流。


## table_disk {#table_disk}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "0" }, { label: "新设置" }]
    }
  ]}
/>

这是表磁盘,路径/端点应指向表数据,而非数据库数据。仅可为 s3_plain/s3_plain_rewritable/web 设置。


## temporary_directories_lifetime {#temporary_directories_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />

保留 tmp\_ 临时目录的时长(秒)。不应降低此值,因为较低的设置值可能导致合并(merge)和变更(mutation)操作无法正常执行。


## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

<SettingsInfoBlock type='Seconds' default_value='7200' />

开始重新压缩合并之前的超时时间(以秒为单位)。在此期间,ClickHouse 会尝试从被分配执行此重新压缩合并的副本获取已重新压缩的数据分片。

在大多数情况下,重新压缩执行速度较慢,因此在超时之前不会启动重新压缩合并,而是尝试从被分配执行此重新压缩合并的副本获取已重新压缩的数据分片。

可能的值:

- 任意正整数。


## ttl_only_drop_parts {#ttl_only_drop_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

控制当 MergeTree 表中某个数据分区的所有行都根据其 `TTL` 设置过期时,是否完全删除该数据分区。

当 `ttl_only_drop_parts` 被禁用时(默认情况下),仅删除根据 TTL 设置已过期的行。

当 `ttl_only_drop_parts` 被启用时,如果某个数据分区中的所有行都根据其 `TTL` 设置过期,则删除整个数据分区。


## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns}

<SettingsInfoBlock type='Bool' default_value='1' />

允许在写入动态子列时使用自适应写入缓冲区以降低内存使用量


## use_async_block_ids_cache {#use_async_block_ids_cache}

<SettingsInfoBlock type='Bool' default_value='1' />

如果为 true，则缓存异步插入的哈希值。

可能的值：

- `true`
- `false`

包含多个异步插入的数据块会生成多个哈希值。
当部分插入重复时，Keeper 在单次 RPC 调用中只会返回一个
重复的哈希值，这会导致不必要的 RPC 重试。
此缓存会监视 Keeper 中的哈希值路径。当在
Keeper 中监测到更新时，缓存会尽快更新，从而能够
在内存中过滤重复的插入操作。


## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

<SettingsInfoBlock type='Bool' default_value='1' />

启用 Variant 数据类型中判别器的二进制序列化紧凑模式。
当数据主要为单一变体或包含大量 NULL 值时,此模式可显著减少数据分片中存储判别器所需的内存。


## use_const_adaptive_granularity {#use_const_adaptive_granularity}

<SettingsInfoBlock type='Bool' default_value='0' />

始终对整个数据部分使用恒定粒度。这允许压缩内存中的索引粒度值。在处理窄表的超大规模工作负载时,此设置可能很有用。


## use_metadata_cache {#use_metadata_cache}

<SettingsInfoBlock type="Bool" default_value="0" />
已废弃的设置,无任何作用。
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

在 ZooKeeper 中使用小格式(数十字节)存储数据分片的校验和,而非普通格式(数十 KB)。启用前请确认所有副本均支持新格式。


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

<SettingsInfoBlock type='Bool' default_value='1' />

ZooKeeper 中数据分片头部的存储方式。启用后,ZooKeeper 存储的数据量会减少。详细信息请参阅[此处](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper)。


## use_primary_key_cache {#use_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "新增设置" }]
    }
  ]}
/>

使用主键索引缓存，而不是将所有索引保存在内存中。适用于超大规模表


## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate}

<SettingsInfoBlock type='UInt64' default_value='0' />

激活垂直合并算法所需的合并部分的最小（近似）未压缩大小（以字节为单位）。


## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate}

<SettingsInfoBlock type='UInt64' default_value='11' />

激活垂直合并算法所需的非主键列的最小数量。


## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate}

<SettingsInfoBlock type='UInt64' default_value='131072' />

激活垂直合并算法所需的合并部分的最小(近似)总行数。


## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "1" }, { label: "新设置" }]
    }
  ]}
/>

如果为 true，则在垂直合并时优化轻量级删除。


## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch}

<SettingsInfoBlock type='Bool' default_value='1' />

如果为 true，则在合并过程中对下一列从远程文件系统预取数据


## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

在关闭表之前,将等待指定的时间以便其他副本获取唯一数据分片(仅存在于当前副本的分片)(设置为 0 表示禁用此功能)。


## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync}

<SettingsInfoBlock type="UInt64" default_value="104857600" />
已废弃的设置,无任何作用。
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
已废弃的设置,无任何作用。
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
已废弃的设置,无任何作用。
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
已废弃的设置,无任何作用。
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "默认启用为 Compact 部分中的子流写入标记"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "新增设置"}]}]}/>

在 Compact 部分中为每个子流写入标记,而不是为每个列写入标记。
这样可以高效地从数据部分读取单个子列。

例如,列 `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` 被序列化为以下子流:

- `t.a` 用于元组元素 `a` 的 String 数据
- `t.b` 用于元组元素 `b` 的 UInt32 数据
- `t.c.size0` 用于元组元素 `c` 的数组大小
- `t.c.null` 用于元组元素 `c` 的嵌套数组元素的空值映射
- `t.c` 用于元组元素 `c` 的嵌套数组元素的 UInt32 数据

启用此设置后,将为这 5 个子流分别写入标记,这意味着可以根据需要从颗粒中单独读取每个子流的数据。例如,如果需要读取子列 `t.c`,将只读取子流 `t.c.size0`、`t.c.null` 和 `t.c` 的数据,而不会读取子流 `t.a` 和 `t.b` 的数据。禁用此设置后,将仅为顶级列 `t` 写入标记,这意味着即使只需要某些子流的数据,也将始终从颗粒中读取整个列的数据。


## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio}

<SettingsInfoBlock type='Float' default_value='0.05' />

为获得更小的独立范围而推迟移除的顶层数据分片的最大百分比。不建议修改此设置。


## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times}

<SettingsInfoBlock type='UInt64' default_value='5' />

将独立的过期数据分区范围拆分为更小子范围的最大递归深度。建议不要更改。


## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

如果启用了零拷贝复制，则在尝试加锁前会根据数据分区大小随机休眠一段时间，以用于合并或变更操作


## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

如果启用了零拷贝复制，在尝试对合并或变更操作加锁之前，将随机休眠最多 500 毫秒。


## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

ZooKeeper 会话过期检查周期,单位为秒。

可能的值:

- 任意正整数。
