---
description: '本节介绍服务器级设置，即无法在会话或查询级别更改的设置。'
keywords: ['global server settings']
sidebar_label: '服务器设置'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: '服务器设置'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 服务器设置 \{#server-settings\}

本节说明服务器设置。这些设置无法在会话或查询级别进行更改。

有关 ClickHouse 中配置文件的更多信息，请参阅 [“Configuration Files”](/operations/configuration-files)。

其他设置在 “[Settings](/operations/settings/overview)” 部分中进行了说明。
在学习这些设置之前，建议先阅读 [Configuration Files](/operations/configuration-files)
部分，并注意替换用法（`incl` 和 `optional` 属性）。

## abort_on_logical_error \{#abort_on_logical_error\}

<SettingsInfoBlock type="Bool" default_value="0" />在发生 LOGICAL_ERROR 异常时让服务器崩溃。仅供专家使用。

## access_control_improvements \{#access_control_improvements\}

用于可选增强访问控制系统的设置。

| Setting                                         | Description                                                                                                                                                                                                                                                                                 | Default |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 设置没有宽松 ROW POLICY 的用户是否仍然可以通过 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且只为 A 定义了 ROW POLICY，那么当此设置为 `true` 时，用户 B 将能看到所有行；当此设置为 `false` 时，用户 B 将看不到任何行。                                                                                                                                             | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 权限。                                                                                                                                                                                                                                                        | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何权限，还是可以由任意用户执行。如果设置为 `true`，则该查询需要 `GRANT SELECT ON system.<table>`，与非 system 表相同。例外情况：部分 system 表（`tables`、`columns`、`databases`，以及一些常量表，如 `one`、`contributors`）仍对所有人可访问；并且如果授予了某个 `SHOW` 权限（例如 `SHOW USERS`），则相应的 system 表（即 `system.users`）将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何权限，还是可以由任意用户执行。如果设置为 `true`，则该查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 设置在某个 SETTINGS PROFILE 中针对某个设置定义的约束，是否会覆盖该设置上先前的约束（这些先前约束定义在其他 profile 中），包括新约束未显式设置的字段。该选项还会启用 `changeable_in_readonly` 约束类型。                                                                                                                                                              | `true`  |
| `table_engines_require_grant`                   | 设置在使用特定表引擎创建表时，是否需要相应权限。                                                                                                                                                                                                                                                                    | `false` |
| `role_cache_expiration_time_seconds`            | 设置角色自上次访问以来在 Role Cache 中保存的时间（秒）。                                                                                                                                                                                                                                                          | `600`   |

示例：

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```


## access_control_path \{#access_control_path\}

ClickHouse 服务器用于存储通过 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参阅**

- [访问控制与账户管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached \{#aggregate_function_group_array_action_when_limit_is_reached\}

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />当 groupArray 中的数组元素数量达到上限时要执行的操作：抛出 `throw` 异常，或丢弃（`discard`）多余的值

## aggregate_function_group_array_max_element_size \{#aggregate_function_group_array_max_element_size\}

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 函数的最大数组元素大小（字节）。该限制在序列化时检查，有助于避免状态大小过大。

## allow_feature_tier \{#allow_feature_tier\}

<SettingsInfoBlock type="UInt32" default_value="0" />

控制用户是否可以更改与不同功能层级相关的设置。

- `0` - 允许更改任意设置（experimental、beta、production）。
- `1` - 仅允许更改 beta 和 production 功能设置。对 experimental 设置的更改会被拒绝。
- `2` - 仅允许更改 production 设置。对 experimental 或 beta 设置的更改会被拒绝。

这相当于对所有 `EXPERIMENTAL` / `BETA` 功能设置设置只读 CONSTRAINT。

:::note
值为 `0` 表示所有设置都可以被更改。
:::

## allow_impersonate_user \{#allow_impersonate_user\}

<SettingsInfoBlock type="Bool" default_value="0" />启用或禁用 IMPERSONATE（EXECUTE AS target_user）功能。

## allow_implicit_no_password \{#allow_implicit_no_password\}

禁止在未显式指定 &#39;IDENTIFIED WITH no&#95;password&#39; 的情况下创建无密码的 USER。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password \{#allow_no_password\}

指定是否允许使用不安全的 no&#95;password 密码类型。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password \{#allow_plaintext_password\}

设置是否允许使用不安全的明文密码类型。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory \{#allow_use_jemalloc_memory\}

<SettingsInfoBlock type="Bool" default_value="1" />允许使用 jemalloc 进行内存分配。

## allowed_disks_for_table_engines \{#allowed_disks_for_table_engines\}

可用于 Iceberg 的磁盘列表

## async_insert_queue_flush_on_shutdown \{#async_insert_queue_flush_on_shutdown\}

<SettingsInfoBlock type="Bool" default_value="1" />如果为 true，则在优雅关闭时会刷新异步插入队列

## async_insert_threads \{#async_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="16" />后台用于实际解析和插入数据的最大线程数。0 表示禁用异步插入模式

## async_load_databases \{#async_load_databases\}

<SettingsInfoBlock type="Bool" default_value="1" />

异步加载数据库和表。

* 如果为 `true`，在 ClickHouse 服务器启动后，所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的非系统数据库都会被异步加载。参见 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的表的查询都会一直等待该表启动完成。如果加载任务失败，查询会重新抛出错误（而不是在 `async_load_databases = false` 的情况下关闭整个服务器）。至少有一个查询正在等待的表会以更高优先级加载。对某个数据库执行 DDL 查询时，会一直等待该数据库启动完成。同时建议设置 `max_waiting_queries` 来限制等待查询的总数量。
* 如果为 `false`，所有数据库会在服务器启动时加载。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database \{#async_load_system_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

系统表的异步加载。如果 `system` 数据库中包含大量日志表和分区片段，此设置会非常有用。该设置独立于 `async_load_databases`。

* 如果设置为 `true`，在 ClickHouse 服务器启动之后，所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的 system 数据库都会被异步加载。参见 `system.asynchronous_loader` 表，以及 `tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的系统表的查询都会等待该表完成启动。至少有一个查询在等待的表会以更高优先级加载。同时也可以考虑设置 `max_waiting_queries` 参数以限制等待查询的总数。
* 如果设置为 `false`，system 数据库会在服务器启动前完成加载。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s \{#asynchronous_heavy_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="120" />更新高开销异步指标的时间间隔（秒）。

## asynchronous_insert_log \{#asynchronous_insert_log\}

用于记录异步插入日志的 [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 系统表相关设置。

<SystemLogParameters />

**示例**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```


## asynchronous_metric_log \{#asynchronous_metric_log\}

在 ClickHouse Cloud 部署中默认启用。

如果在当前环境中该设置不是默认启用的，则根据 ClickHouse 的安装方式，你可以按照下面的步骤来启用或禁用它。

**启用**

要手动开启异步指标日志历史记录的采集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 文件并写入以下内容：

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**禁用**

要禁用 `asynchronous_metric_log` 设置，应创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，其内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics \{#asynchronous_metrics_enable_heavy_metrics\}

<SettingsInfoBlock type="Bool" default_value="0" />启用对开销较大的异步指标的计算。

## asynchronous_metrics_keeper_metrics_only \{#asynchronous_metrics_keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />仅让异步指标计算 Keeper 相关指标。

## asynchronous_metrics_update_period_s \{#asynchronous_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="1" />用于更新异步指标的时间周期（以秒为单位）。

## auth_use_forwarded_address \{#auth_use_forwarded_address\}

对通过代理连接的客户端，在身份验证时使用其源地址。

:::note
此设置应慎重使用，因为转发地址很容易被伪造——接受此类身份验证的服务器不应被直接访问，而应仅通过受信任的代理访问。
:::

## background_buffer_flush_schedule_pool_size \{#background_buffer_flush_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />用于在后台对 [Buffer 引擎表](/engines/table-engines/special/buffer) 执行刷新操作的最大线程数。

## background_common_pool_size \{#background_common_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />用于在后台对 [*MergeTree 引擎](/engines/table-engines/mergetree-family) 表执行各种操作（主要是垃圾回收）的最大线程数。

## background_distributed_schedule_pool_size \{#background_distributed_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行分布式发送操作的最大线程数。

## background_fetches_pool_size \{#background_fetches_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />在后台从其他副本获取 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表的数据分区片段时可使用的最大线程数。

## background_merges_mutations_concurrency_ratio \{#background_merges_mutations_concurrency_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

设置可并发执行的后台合并与变更（merges 和 mutations）数量与线程数之间的比值。

例如，如果该比值等于 2，并且 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 被设置为 16，那么 ClickHouse 可以同时执行 32 个后台合并。这之所以可行，是因为后台操作可以被挂起和延后。这样可以使较小的合并获得更高的执行优先级。

:::note
只能在运行时增加此比值。若要降低它，则必须重启服务器。

与 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置类似，为了向后兼容，可以从 `default` profile 应用 [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio)。
:::

## background_merges_mutations_scheduling_policy \{#background_merges_mutations_scheduling_policy\}

<SettingsInfoBlock type="String" default_value="round_robin" />

用于对后台合并（merge）和变更操作（mutation）进行调度的策略。可选值为：`round_robin` 和 `shortest_task_first`。

用于从后台线程池中选择下一个要执行的合并或变更的算法。该策略可以在运行时更改，无需重启服务器。
可以通过 `default` profile 应用，以保持向后兼容性。

可选值：

- `round_robin` — 所有并发合并和变更按轮询顺序执行，以确保不会出现“饥饿”情况。较小的合并由于需要合并的数据块更少，通常会比较大的合并更快完成。
- `shortest_task_first` — 始终优先执行较小的合并或变更。合并和变更会根据其结果大小被分配优先级。结果较小的合并会被严格优先于较大的合并。该策略能够以尽可能快的速度完成小分区片段的合并，但在被大量 `INSERT` 操作严重压载的分区中，可能会导致大型合并长期处于饥饿状态。

## background_message_broker_schedule_pool_size \{#background_message_broker_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行消息流后台操作所能使用的最大线程数。

## background_move_pool_size \{#background_move_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />在后台将数据分区片段移动到其他磁盘或卷时可使用的最大线程数，适用于 *MergeTree 引擎表*。

## background_pool_size \{#background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

设置用于对 MergeTree 引擎表执行后台合并和变更操作的线程数量。

:::note

* 为了在 ClickHouse 服务器启动时保持向后兼容性，此设置也可以通过 `default` profile 配置在服务器启动时生效。
* 只能在运行时增加线程数量。
* 若要减少线程数量，必须重启服务器。
* 通过调整此设置，可以控制 CPU 和磁盘负载。
  :::

:::danger
较小的线程池大小会占用更少的 CPU 和磁盘资源，但后台进程推进得更慢，最终可能影响查询性能。
:::

在更改该设置之前，请同时查看相关的 MergeTree 设置，例如：

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**示例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_log \{#background_schedule_pool_log\}

包含所有通过各类后台线程池执行的后台任务的信息。

```xml
<background_schedule_pool_log>
    <database>system</database>
    <table>background_schedule_pool_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <!-- Only tasks longer than duration_threshold_milliseconds will be logged. Zero means log everything -->
    <duration_threshold_milliseconds>0</duration_threshold_milliseconds>
</background_schedule_pool_log>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio \{#background_schedule_pool_max_parallel_tasks_per_type_ratio\}

<SettingsInfoBlock type="Float" default_value="0.8" />线程池中可用于同时执行同一类型任务的线程的最大比例。

## background_schedule_pool_size \{#background_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="512" />用于持续执行副本表、Kafka 流式处理以及 DNS 缓存更新等轻量级周期性操作时所能使用的最大线程数。

## backup_log \{#backup_log\}

用于 [backup&#95;log](../../operations/system-tables/backup_log.md) 系统表的设置，用于记录 `BACKUP` 和 `RESTORE` 操作。

<SystemLogParameters />

**示例**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```


## backup_threads \{#backup_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />执行 `BACKUP` 请求时使用的最大线程数。

## backups \{#backups\}

备份相关设置，用于执行 [`BACKUP` 和 `RESTORE`](/operations/backup/overview) 语句时使用。

以下设置可以通过子标签进行配置：

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','确定是否允许在同一主机上并发运行多个备份操作。', 'true'),
    ('allow_concurrent_restores', 'Bool', '确定是否允许在同一主机上并发运行多个恢复操作。', 'true'),
    ('allowed_disk', 'String', '使用 `File()` 时备份所用的磁盘。必须设置此参数才能使用 `File`。', ''),
    ('allowed_path', 'String', '使用 `File()` 时备份所用的路径。必须设置此参数才能使用 `File`。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '在比较已收集的元数据发现存在不一致时，在进入休眠前尝试重新收集元数据的次数。', '2'),
    ('collect_metadata_timeout', 'UInt64', '备份期间收集元数据的超时时间（毫秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', '为 true 时，将收集到的元数据与现有元数据进行比较，以确保它们在备份期间未被更改。', 'true'),
    ('create_table_timeout', 'UInt64', '恢复期间创建表的超时时间（毫秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '在协调备份/恢复期间遇到 bad version 错误后重试的最大次数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最大休眠时间（毫秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最小休眠时间（毫秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在失败前已复制到备份中的文件；否则将保留这些已复制的文件不变。', 'true'),
    ('sync_period_ms', 'UInt64', '协调备份/恢复的同步周期（毫秒）。', '5000'),
    ('test_inject_sleep', 'Bool', '与测试相关的休眠时间。', 'false'),
    ('test_randomize_order', 'Bool', '为 true 时，出于测试目的随机化某些操作的执行顺序。', 'false'),
    ('zookeeper_path', 'String', '使用 `ON CLUSTER` 子句时，在 ZooKeeper 中存储备份和恢复元数据的路径。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                  | Default               |
| :-------------------------------------------------- | :----- | :----------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 决定是否允许在同一主机上并发运行多个备份操作。                                      | `true`                |
| `allow_concurrent_restores`                         | Bool   | 决定是否允许在同一主机上并发运行多个恢复操作。                                      | `true`                |
| `allowed_disk`                                      | String | 使用 `File()` 进行备份时备份到的磁盘。必须设置此配置项才能使用 `File`。                 | ``                    |
| `allowed_path`                                      | String | 使用 `File()` 进行备份时备份到的路径。必须设置此配置项才能使用 `File`。                 | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 在比较收集到的元数据发现不一致时，进入休眠前尝试重新收集元数据的次数。                          | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 备份过程中收集元数据的超时时间（毫秒）。                                         | `600000`              |
| `compare_collected_metadata`                        | Bool   | 如果为 true，则会将收集到的元数据与现有元数据进行比较，以确保它们在备份期间未被更改。                | `true`                |
| `create_table_timeout`                              | UInt64 | 恢复过程中创建表的超时时间（毫秒）。                                           | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 在协同备份/恢复过程中遇到 bad version 错误后允许重试的最大次数。                      | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 在下一次尝试收集元数据之前的最长休眠时间（毫秒）。                                    | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 在下一次尝试收集元数据之前的最短休眠时间（毫秒）。                                    | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | 如果 `BACKUP` 命令失败，ClickHouse 会尝试删除在失败前已复制到备份中的文件，否则会保留已复制的文件。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 协同备份/恢复的同步周期（毫秒）。                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | 用于测试的休眠注入。                                                   | `false`               |
| `test_randomize_order`                              | Bool   | 如果为 true，会随机化某些操作的顺序，用于测试目的。                                 | `false`               |
| `zookeeper_path`                                    | String | 使用 `ON CLUSTER` 子句时，在 ZooKeeper 中存储备份和恢复元数据的路径。              | `/clickhouse/backups` |

此配置默认设置为：

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size \{#backups_io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

可在 Backups IO 线程池中调度的作业最大数量。由于当前的 S3 备份逻辑，建议将此队列保持为无限。

:::note
值为 `0`（默认）表示无限制。
:::

## bcrypt_workfactor \{#bcrypt_workfactor\}

用于 `bcrypt_password` 认证类型的工作因子，该认证类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。
工作因子决定了计算哈希值和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于需要频繁进行身份验证的应用程序，
由于在较高工作因子下 bcrypt 的计算开销较大，
请考虑采用其他身份验证方法。
:::


## blob_storage_log \{#blob_storage_log\}

用于 [`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的相关设置。

<SystemLogParameters />

示例：

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## builtin_dictionaries_reload_interval \{#builtin_dictionaries_reload_interval\}

以秒为单位指定重新加载内置字典的时间间隔。

ClickHouse 每隔 x 秒重新加载内置字典，这样就可以在无需重启服务器的情况下“即时”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio \{#cache_size_to_ram_max_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />设置缓存大小与 RAM 最大值的比例。可在低内存系统上减少缓存占用。

## cannot_allocate_thread_fault_injection_probability \{#cannot_allocate_thread_fault_injection_probability\}

<SettingsInfoBlock type="Double" default_value="0" />用于测试。

## cgroups_memory_usage_observer_wait_time \{#cgroups_memory_usage_observer_wait_time\}

<SettingsInfoBlock type="UInt64" default_value="15" />

以秒为单位的时间间隔，在此期间服务器允许的最大内存使用量会根据 cgroups 中对应的阈值进行调整。

要禁用 cgroups 观察器，将此值设为 `0`。

## compiled_expression_cache_elements_size \{#compiled_expression_cache_elements_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />设置[已编译表达式](../../operations/caches.md)缓存的大小（以元素个数计）。

## compiled_expression_cache_size \{#compiled_expression_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />设置用于[编译表达式](../../operations/caches.md)的缓存大小（单位：字节）。

## 压缩 \{#compression\}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse，建议不要更改此配置。
:::

**配置模板**：

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**`<case>` 字段**：

* `min_part_size` – 数据分片的最小大小。
* `min_part_size_ratio` – 数据分片大小与表大小的比例。
* `method` – 压缩方法。可接受的值：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
* `level` – 压缩级别。参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
你可以配置多个 `<case>` 部分。
:::

**当条件满足时的操作**：

* 如果数据分片满足某个条件集合，ClickHouse 使用指定的压缩方法。
* 如果数据分片满足多个条件集合，ClickHouse 使用第一个匹配的条件集合。

:::note
如果数据分片不满足任何条件，ClickHouse 使用 `lz4` 压缩。
:::

**示例**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```


## concurrent_threads_scheduler \{#concurrent_threads_scheduler\}

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

针对由 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定的 CPU 插槽的调度策略。该算法用于控制在并发查询之间如何分配数量受限的 CPU 插槽。调度器可以在运行时更改而无需重启服务器。

可能的取值：

- `round_robin` — 每个 `use_concurrency_control` = 1 的查询最多分配 `max_threads` 个 CPU 插槽，每个线程一个插槽。当发生竞争时，CPU 插槽会以轮询方式分配给各个查询。注意，第一个插槽是无条件授予的，这可能会导致不公平，并在存在大量 `max_threads` = 1 的查询时，增加具有较大 `max_threads` 的查询的延迟。
- `fair_round_robin` — 每个 `use_concurrency_control` = 1 的查询最多分配 `max_threads - 1` 个 CPU 插槽。这是 `round_robin` 的一种变体，它不为每个查询的第一个线程分配 CPU 插槽。这样，`max_threads` = 1 的查询不需要任何插槽，也就无法不公平地独占所有插槽。不会无条件授予任何插槽。

## concurrent_threads_soft_limit_num \{#concurrent_threads_soft_limit_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

允许用于运行所有查询的最大查询处理线程数（不包括用于从远程服务器获取数据的线程）。这不是一个硬性上限。如果达到该限制，查询仍然至少会获得一个线程来运行。如果在执行期间有更多线程可用，查询可以扩展到所需的线程数。

:::note
值为 `0`（默认）表示不限制。
:::

## concurrent_threads_soft_limit_ratio_to_cores \{#concurrent_threads_soft_limit_ratio_to_cores\}

<SettingsInfoBlock type="UInt64" default_value="0" />与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同，但以 CPU 核心数量的比例形式指定。

## config-file \{#config-file\}

<SettingsInfoBlock type="String" default_value="config.xml" />指定服务器配置文件。

## config_reload_interval_ms \{#config_reload_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse 重新加载配置并检查新变更的时间间隔

## core_dump \{#core_dump\}

配置核心转储（core dump）文件大小的软限制。

:::note
硬限制需通过系统工具进行设置
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption \{#cpu_slot_preemption\}

<SettingsInfoBlock type="Bool" default_value="0" />

定义如何对 CPU 资源（MASTER THREAD 和 WORKER THREAD）进行工作负载调度。

* 当为 `true`（推荐）时，核算基于实际消耗的 CPU 时间。会为相互竞争的工作负载分配公平的 CPU 时间。Slot（槽位）会在有限时间内被分配，到期后需要重新请求。在 CPU 资源过载的情况下，请求 slot 可能会阻塞线程执行，即可能发生抢占，从而确保 CPU 时间使用的公平性。
* 当为 `false`（默认）时，核算基于分配的 CPU slot 数量。会为相互竞争的工作负载分配公平数量的 CPU slot。线程启动时分配一个 slot，在线程执行期间持续持有，并在线程结束执行时释放。为查询执行分配的线程数量只能从 1 增加到 `max_threads`，且不会减少。对此长时间运行的查询更有利，但可能导致短查询出现 CPU 资源饥饿。

**示例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms \{#cpu_slot_preemption_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

该设置定义了工作线程在抢占期间最多可以等待的时间（毫秒），即在等待被授予新的 CPU 槽位时的等待时长。超时后，如果线程仍无法获取新的 CPU 槽位，它将退出，该查询的并发执行线程数会被动态缩减为更低的数量。需要注意的是，主线程的并发度永远不会被缩减，但可能会被无限期抢占。仅当启用了 `cpu_slot_preemption` 且为 WORKER THREAD 定义了 CPU 资源时，该设置才有意义。

**示例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns \{#cpu_slot_quantum_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

定义线程在获取一个 CPU 插槽后，到需要再次请求 CPU 插槽之前被允许消耗的 CPU 纳秒数。仅当启用了 `cpu_slot_preemption` 且为 MASTER THREAD 或 WORKER THREAD 定义了 CPU 资源时才起作用。

**示例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)


## crash_log \{#crash_log\}

用于配置 [crash&#95;log](../../operations/system-tables/crash_log.md) system 表的设置。

可以通过子标签配置以下参数：

| Setting                            | Description                                                                                                            | Default             | Note                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `database`                         | 数据库名称。                                                                                                                 |                     |                                                                         |
| `table`                            | system 表的名称。                                                                                                           |                     |                                                                         |
| `engine`                           | system 表的 [MergeTree 引擎定义](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | 如果定义了 `partition_by` 或 `order_by`，则不能使用。如果未指定，则默认选择 `MergeTree`         |
| `partition_by`                     | system 表的[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                                 |                     | 如果为 system 表指定了 `engine`，则应直接在 &#39;engine&#39; 内指定 `partition_by` 参数   |
| `ttl`                              | 指定表的 [生存时间 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。                       |                     | 如果为 system 表指定了 `engine`，则应直接在 &#39;engine&#39; 内指定 `ttl` 参数            |
| `order_by`                         | system 表的[自定义排序键](/engines/table-engines/mergetree-family/mergetree#order_by)。如果定义了 `engine`，则不能使用。                    |                     | 如果为 system 表指定了 `engine`，则应直接在 &#39;engine&#39; 内指定 `order_by` 参数       |
| `storage_policy`                   | 表要使用的存储策略名称（可选）。                                                                                                       |                     | 如果为 system 表指定了 `engine`，则应直接在 &#39;engine&#39; 内指定 `storage_policy` 参数 |
| `settings`                         | 控制 MergeTree 行为的[附加参数](/engines/table-engines/mergetree-family/mergetree/#settings)（可选）。                               |                     | 如果为 system 表指定了 `engine`，则应直接在 &#39;engine&#39; 内指定 `settings` 参数       |
| `flush_interval_milliseconds`      | 将缓冲区中的内存数据刷新到表的时间间隔。                                                                                                   | `7500`              |                                                                         |
| `max_size_rows`                    | 日志的最大行数。当未刷新的日志数量达到 `max_size_rows` 时，日志会被写入磁盘。                                                                        | `1024`              |                                                                         |
| `reserved_size_rows`               | 为日志预分配的内存大小（按行数计）。                                                                                                     | `1024`              |                                                                         |
| `buffer_size_rows_flush_threshold` | 行数阈值。如果达到该阈值，则会在后台触发将日志刷新到磁盘的操作。                                                                                       | `max_size_rows / 2` |                                                                         |
| `flush_on_crash`                   | 是否在发生崩溃时将日志写入磁盘。                                                                                                       | `false`             |                                                                         |

默认的服务器配置文件 `config.xml` 包含以下设置部分：

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```


## custom_cached_disks_base_directory \{#custom_cached_disks_base_directory\}

此设置用于指定自定义（通过 SQL 创建的）缓存磁盘的缓存路径。
对于自定义磁盘，`custom_cached_disks_base_directory` 的优先级高于 `filesystem_caches_path`（定义在 `filesystem_caches_path.xml` 中），
如果前者不存在，则使用后者。
文件系统缓存的配置路径必须位于该目录之内，
否则将抛出异常，阻止磁盘被创建。

:::note
这不会影响那些在旧版本中创建、其后升级服务器的磁盘。
在这种情况下，不会抛出异常，以便服务器可以成功启动。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes \{#custom_settings_prefixes\}

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。前缀之间必须以逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参阅**

* [自定义设置](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec \{#database_atomic_delay_before_drop_table_sec\}

<SettingsInfoBlock type="UInt64" default_value="480" />

在此延迟期间，可以使用 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复已删除的表。如果 `DROP TABLE` 以带有 `SYNC` 修饰符的方式执行，则会忽略该设置。
此设置的默认值为 `480`（8 分钟）。

## database_catalog_drop_error_cooldown_sec \{#database_catalog_drop_error_cooldown_sec\}

<SettingsInfoBlock type="UInt64" default_value="5" />如果删除表失败，ClickHouse 会在等待该超时时间后再重试此操作。

## database_catalog_drop_table_concurrency \{#database_catalog_drop_table_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行表删除操作的线程池大小。

## database_catalog_unused_dir_cleanup_period_sec \{#database_catalog_unused_dir_cleanup_period_sec\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

清理 `store/` 目录中垃圾的任务参数。
用于设置该任务的调度周期。

:::note
值为 `0` 表示“从不清理”。默认值对应 1 天。
:::

## database_catalog_unused_dir_hide_timeout_sec \{#database_catalog_unused_dir_hide_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

用于控制清理 `store/` 目录中垃圾数据任务的参数。
如果某个子目录未被 clickhouse-server 使用，且在最近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒内没有被修改，则该任务会通过移除所有访问权限来“隐藏”该目录。对于 clickhouse-server 在 `store/` 中不期望存在的目录（即预期之外的目录），此参数同样生效。

:::note
取值为 `0` 表示“立即”。
:::

## database_catalog_unused_dir_rm_timeout_sec \{#database_catalog_unused_dir_rm_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

用于清理 `store/` 目录中垃圾内容的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且之前被“隐藏”
（参见 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)），
并且该目录在过去 [`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改，则该任务会删除此目录。
它同样适用于 clickhouse-server 不期望在 `store/` 中出现的目录。

:::note
取值为 `0` 表示“从不”。默认值对应 30 天。
:::

## database_replicated_allow_detach_permanently \{#database_replicated_allow_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="1" />允许在 Replicated 数据库中永久地分离表

## database_replicated_drop_broken_tables \{#database_replicated_drop_broken_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />从 Replicated 数据库中删除意外出现的表，而不是将它们移动到单独的本地数据库中

## dead_letter_queue \{#dead_letter_queue\}

用于配置 &#39;dead&#95;letter&#95;queue&#39; 系统表。

<SystemLogParameters />

默认配置为：

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database \{#default_database\}

<SettingsInfoBlock type="String" default_value="default" />默认数据库名。

## default_password_type \{#default_password_type\}

设置在执行类似 `CREATE USER u IDENTIFIED BY 'p'` 这样的查询时自动使用的密码类型。

可接受的值为：

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile \{#default_profile\}

默认的设置配置文件。设置配置文件定义在由 `user_config` 设置指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```


## default_replica_name \{#default_replica_name\}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 中的副本名称。

**示例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path \{#default_replica_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

该表在 ZooKeeper 中的路径。

**示例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout \{#default_session_timeout\}

默认会话超时时间，单位为秒。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config \{#dictionaries_config\}

用于字典的配置文件路径。

路径：

* 指定绝对路径，或相对于服务器配置文件的路径。
* 路径可以包含通配符 * 和 ?。

另请参阅：

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load \{#dictionaries_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

字典的懒加载。

* 如果为 `true`，则每个字典会在首次使用时才加载。如果加载失败，使用该字典的函数会抛出异常。
* 如果为 `false`，则服务器会在启动时加载所有字典。

:::note
服务器在启动时会等待所有字典加载完成后，才会接收任何连接
（例外情况：如果将 [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) 设置为 `false`）。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionaries_lib_path \{#dictionaries_lib_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/dictionaries_lib/" />

存放字典库的目录。

**示例**

```xml
<dictionaries_lib_path>/var/lib/clickhouse/dictionaries_lib/</dictionaries_lib_path>
```


## dictionary_background_reconnect_interval \{#dictionary_background_reconnect_interval\}

<SettingsInfoBlock type="UInt64" default_value="1000" />对启用了 `background_reconnect` 的、连接失败的 MySQL 和 Postgres 字典进行重新连接尝试的时间间隔（以毫秒为单位）。

## disable_insertion_and_mutation \{#disable_insertion_and_mutation\}

<SettingsInfoBlock type="Bool" default_value="0" />

禁用 insert/alter/delete 查询。如果需要只读节点以避免插入和 mutation 影响读取性能，则会启用此设置。即使启用了该设置，仍允许向外部引擎（S3、DataLake、MySQL、PostrgeSQL、Kafka 等）执行插入操作。

## disable_internal_dns_cache \{#disable_internal_dns_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />禁用内部 DNS 缓存。建议在基础设施经常变动的系统（例如 Kubernetes）中运行 ClickHouse 时使用。

## disable_tunneling_for_https_requests_over_http_proxy \{#disable_tunneling_for_https_requests_over_http_proxy\}

默认情况下，在通过 `HTTP` 代理发起 `HTTPS` 请求时，会使用隧道（即 `HTTP CONNECT`）。可以通过此设置来禁用该行为。

**no&#95;proxy**

默认情况下，所有请求都会经过代理。若要对特定主机禁用代理，必须设置 `no_proxy` 变量。
它可以在 list 解析器和 remote 解析器的 `<proxy>` 子句中设置，也可以作为 environment 解析器的环境变量进行设置。
它支持 IP 地址、域名、子域名，以及用于完全绕过代理的 `'*'` 通配符。前导点会像 curl 一样被去除。

**示例**

下面的配置会绕过发往 `clickhouse.cloud` 及其所有子域（例如 `auth.clickhouse.cloud`）的代理请求。
同样的规则适用于 GitLab，即使它带有前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```


## disk_connections_hard_limit \{#disk_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />当在创建时达到此限制时会抛出异常。将其设置为 0 可关闭硬限制。该限制适用于磁盘连接数。

## disk_connections_soft_limit \{#disk_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="5000" />超出该限制的连接的存活时间会显著缩短。该限制适用于磁盘连接。

## disk_connections_store_limit \{#disk_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="10000" />超过此限制的连接在使用后会被重置。将该值设置为 0 可关闭连接缓存。该限制适用于磁盘连接。

## disk_connections_warn_limit \{#disk_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="8000" />如果正在使用的连接数超过此限制，将在日志中记录警告信息。该限制适用于磁盘连接。

## display_secrets_in_show_and_select \{#display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在针对表、数据库、表函数和字典执行的 `SHOW` 和 `SELECT` 查询中显示机密信息。

若要查看机密信息，用户还必须开启
[`format_display_secrets_in_show_and_select` 格式 SETTING](../settings/formats#format_display_secrets_in_show_and_select)，
并且具有
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的取值：

- `0` — 禁用。
- `1` — 启用。

## distributed_cache_apply_throttling_settings_from_client \{#distributed_cache_apply_throttling_settings_from_client\}

<SettingsInfoBlock type="Bool" default_value="1" />缓存服务器是否应采用从客户端接收的限流设置。

## distributed_cache_keep_up_free_connections_ratio \{#distributed_cache_keep_up_free_connections_ratio\}

<SettingsInfoBlock type="Float" default_value="0.1" />分布式缓存尝试保持的空闲连接数量的软限制。当空闲连接数低于 distributed_cache_keep_up_free_connections_ratio * max_connections 时，将按最近活动时间最早的顺序关闭连接，直到空闲连接数重新高于该限制。

## distributed_ddl \{#distributed_ddl\}

管理在集群上执行[分布式 DDL 查询](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。
仅在启用了 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时有效。

`<distributed_ddl>` 中可配置的设置包括：

| Setting                | Description                                                     | Default Value             |
| ---------------------- | --------------------------------------------------------------- | ------------------------- |
| `path`                 | 在 Keeper 中为 DDL 查询的 `task_queue` 指定的路径                          |                           |
| `profile`              | 用于执行 DDL 查询的 profile                                            |                           |
| `pool_size`            | 可同时运行的 `ON CLUSTER` 查询数量                                        |                           |
| `max_tasks_in_queue`   | 队列中可以存在的最大任务数。                                                  | `1,000`                   |
| `task_max_lifetime`    | 如果节点存在时间超过该值则将其删除。                                              | `7 * 24 * 60 * 60`（一周的秒数） |
| `cleanup_delay_period` | 在收到新节点事件后开始清理，如果距离上次清理的时间少于 `cleanup_delay_period` 秒，则不会执行本次清理。 | `60` 秒                    |

**示例**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl.cleanup_delay_period \{#distributed_ddl.cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />在接收到新节点事件后，如果距离上一次清理已有至少 `<cleanup_delay_period>` 秒，则开始执行清理。

## distributed_ddl.max_tasks_in_queue \{#distributed_ddl.max_tasks_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />队列中允许存在的最大任务数。

## distributed_ddl.path \{#distributed_ddl.path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/ddl/" />在 Keeper 中用于 DDL 查询的 `<task_queue>` 路径

## distributed_ddl.pool_size \{#distributed_ddl.pool_size\}

<SettingsInfoBlock type="Int32" default_value="1" />可同时运行的 `<ON CLUSTER>` 查询数量

## distributed_ddl.profile \{#distributed_ddl.profile\}

用于执行 DDL 查询的配置文件

## distributed_ddl.replicas_path \{#distributed_ddl.replicas_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/replicas/" />Keeper 中副本 `<task_queue>` 的路径

## distributed_ddl.task_max_lifetime \{#distributed_ddl.task_max_lifetime\}

<SettingsInfoBlock type="UInt64" default_value="604800" />当节点存在时间超过该值时将其删除。

## distributed_ddl_use_initial_user_and_roles \{#distributed_ddl_use_initial_user_and_roles\}

<SettingsInfoBlock type="Bool" default_value="0" />如果启用，ON CLUSTER 查询在远程分片上执行时将保留并使用发起该查询的用户及其角色。这可以确保整个集群中访问控制的一致性，但要求该用户和角色在所有节点上都已创建。

## dns_allow_resolve_names_to_ipv4 \{#dns_allow_resolve_names_to_ipv4\}

<SettingsInfoBlock type="Bool" default_value="1" />允许将主机名解析为 IPv4 地址。

## dns_allow_resolve_names_to_ipv6 \{#dns_allow_resolve_names_to_ipv6\}

<SettingsInfoBlock type="Bool" default_value="1" />允许将主机名解析为 IPv6 地址。

## dns_cache_max_entries \{#dns_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS 缓存的最大记录数。

## dns_cache_update_period \{#dns_cache_update_period\}

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS 缓存的更新周期（秒）。

## dns_max_consecutive_failures \{#dns_max_consecutive_failures\}

<SettingsInfoBlock type="UInt32" default_value="5" />

在连续失败达到该次数后，将停止进一步尝试更新主机名的 DNS 缓存。相关信息仍会保留在 DNS 缓存中。零表示不限制。

**另请参阅**

- [`SYSTEM DROP DNS CACHE`](../../sql-reference/statements/system#drop-dns-cache)

## drop_distributed_cache_pool_size \{#drop_distributed_cache_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />用于清理分布式缓存的线程池大小。

## drop_distributed_cache_queue_size \{#drop_distributed_cache_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />用于清理分布式缓存的线程池的队列大小。

## enable_azure_sdk_logging \{#enable_azure_sdk_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />启用 Azure SDK 的日志记录功能

## 加密 \{#encryption\}

配置用于获取密钥的命令，该密钥将被 [encryption codecs](/sql-reference/statements/create/table#encryption-codecs) 使用。密钥（或多个密钥）应通过环境变量提供，或在配置文件中进行设置。

密钥可以是十六进制值，或者是长度为 16 字节的字符串。

**示例**

从配置中加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议将密钥存储在配置文件中，这样不够安全。可以将密钥移到安全磁盘上的单独配置文件中，然后在 `config.d/` 目录下为该配置文件创建一个符号链接。
:::

从配置中加载（当密钥以十六进制表示时）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量中加载密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

此处，`current_key_id` 用于设置当前加密所用的密钥，而所有指定的密钥都可用于解密。

这些方法中的每一种都可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里的 `current_key_id` 显示了当前用于加密的密钥。

此外，用户可以添加一个 nonce，其长度必须为 12 字节（默认情况下，加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

也可以使用十六进制表示：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上述所有内容同样适用于 `aes_256_gcm_siv`（但密钥长度必须为 32 字节）。
:::


## error_log \{#error_log\}

默认处于禁用状态。

**启用**

要手动启用错误历史记录收集 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**禁用**

要禁用 `error_log` 设置，需要创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，其内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## filesystem_caches_path \{#filesystem_caches_path\}

此设置指定缓存路径。

**示例**

```xml
<filesystem_caches_path>/var/lib/clickhouse/filesystem_caches/</filesystem_caches_path>
```


## format_parsing_thread_pool_queue_size \{#format_parsing_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

用于解析输入时，可以在线程池中调度的最大任务数。

:::note
值为 `0` 表示无限制。
:::

## format_schema_path \{#format_schema_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/format_schemas/" />

输入数据 schema 所在目录的路径，例如用于 [CapnProto](/interfaces/formats/CapnProto) 格式的 schema。

**示例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>/var/lib/clickhouse/format_schemas/</format_schema_path>
```


## format_schema_path \{#format_schema_path\}

包含输入数据 schema 的目录路径，例如用于 [CapnProto](/interfaces/formats/CapnProto) 格式的 schema。

**示例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns \{#global_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />全局 profiler 的 CPU 时钟定时周期（单位：纳秒）。将该值设置为 0 可关闭全局 CPU 时钟 profiler。推荐取值：针对单个查询至少为 10000000（每秒 100 次），针对集群范围的 profiling 至少为 1000000000（每秒 1 次）。

## global_profiler_real_time_period_ns \{#global_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />全局 profiler 的实时时钟计时周期（单位：纳秒）。将该值设为 0 可关闭实时时钟全局 profiler。对于单个查询，推荐至少设置为 10000000（每秒 100 次）；对于集群级 profiling，推荐设置为 1000000000（每秒一次）。

## google_protos_path \{#google_protos_path\}

<SettingsInfoBlock type="String" default_value="/usr/share/clickhouse/protos/" />

指定包含 Protobuf 类型所用 proto 文件的目录。

**示例**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## google_protos_path \{#google_protos_path\}

定义包含 Protobuf 类型所用 .proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite \{#graphite\}

将数据发送到 [Graphite](https://github.com/graphite-project)。

配置项：

* `host` – Graphite 服务器。
* `port` – Graphite 服务器上的端口。
* `interval` – 发送间隔（秒）。
* `timeout` – 发送数据的超时时间（秒）。
* `root_path` – 键的前缀。
* `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
* `events` – 从 [system.events](/operations/system-tables/events) 表发送在时间段内累积的增量数据。
* `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
* `asynchronous_metrics` – 从 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

你可以配置多个 `<graphite>` 配置块。例如，可以用它来以不同的时间间隔发送不同的数据。

**示例**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```


## graphite_rollup \{#graphite_rollup\}

用于对 Graphite 数据进行抽稀处理的设置。

更多详细信息，请参阅 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

**示例**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```


## hdfs.libhdfs3_conf \{#hdfs.libhdfs3_conf\}

指定 libhdfs3 配置文件所在的正确路径。

## hsts_max_age \{#hsts_max_age\}

HSTS 的失效时间（秒）。

:::note
值为 `0` 表示 ClickHouse 禁用 HSTS。若设置为正数，则会启用 HSTS，且 `max-age` 为所设置的数值。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit \{#http_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />当达到此限制时，尝试创建时会抛出异常。将该值设置为 0 可关闭硬限制。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http_connections_soft_limit \{#http_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />超过此限制的连接其存活时间会显著缩短。该限制适用于不隶属于任何磁盘或存储的 HTTP 连接。

## http_connections_store_limit \{#http_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />超出该限制的连接在使用后将被重置。设置为 0 可关闭连接缓存功能。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http_connections_warn_limit \{#http_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />如果在用连接数高于此限制，将向日志写入警告消息。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http_handlers \{#http_handlers\}

允许使用自定义 HTTP 处理器。
要添加新的 http 处理器，只需添加一个新的 `<rule>`。
规则会按照定义的顺序从上到下进行检查，
第一个匹配项会执行对应的处理器。

以下设置可以通过子标签进行配置：

| Sub-tags             | Definition                                                      |
| -------------------- | --------------------------------------------------------------- |
| `url`                | 用于匹配请求 URL，可以使用 &#39;regex:&#39; 前缀启用正则匹配（可选）                   |
| `methods`            | 用于匹配请求方法，可以使用逗号分隔多个方法（可选）                                       |
| `headers`            | 用于匹配请求头，匹配每个子元素（子元素名称为请求头名称），可以使用 &#39;regex:&#39; 前缀启用正则匹配（可选） |
| `handler`            | 请求处理器                                                           |
| `empty_query_string` | 检查 URL 中不存在查询字符串                                                |

`handler` 包含以下设置，可通过子标签进行配置：

| Sub-tags           | Definition                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `url`              | 重定向的目标地址                                                                                        |
| `type`             | 支持的类型：static、dynamic&#95;query&#95;handler、predefined&#95;query&#95;handler、redirect            |
| `status`           | 与 static 类型一起使用，响应状态码                                                                           |
| `query_param_name` | 与 dynamic&#95;query&#95;handler 类型一起使用，从 HTTP 请求参数中提取并执行与 `<query_param_name>` 值对应的参数值          |
| `query`            | 与 predefined&#95;query&#95;handler 类型一起使用，在处理器被调用时执行查询                                          |
| `content_type`     | 与 static 类型一起使用，响应的 content-type                                                                |
| `response_content` | 与 static 类型一起使用，发送给客户端的响应内容；当使用 &#39;file://&#39; 或 &#39;config://&#39; 前缀时，将从文件或配置中读取内容并发送给客户端 |

除了规则列表，你还可以指定 `<defaults/>`，用于启用所有默认处理器。

示例：

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```


## http_options_response \{#http_options_response\}

用于为 `OPTIONS` HTTP 请求的响应添加头部。
`OPTIONS` 方法用于发起 CORS 预检请求。

更多信息，请参阅 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

示例：

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```


## http_server_default_response \{#http_server_default_response\}

默认情况下，在访问 ClickHouse HTTP(s) 服务器时显示的页面。
默认值为 &quot;Ok.&quot;（末尾带有换行符）

**示例**

在访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size \{#iceberg_catalog_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg catalog 后台线程池的大小

## iceberg_catalog_threadpool_queue_size \{#iceberg_catalog_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />iceberg catalog 线程池队列中可排队的最大任务数

## iceberg_metadata_files_cache_max_entries \{#iceberg_metadata_files_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />iceberg 元数据文件缓存的最大条目数。0 表示禁用。

## iceberg_metadata_files_cache_policy \{#iceberg_metadata_files_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg 元数据文件缓存策略名称。

## iceberg_metadata_files_cache_size \{#iceberg_metadata_files_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg 元数据缓存的最大容量（字节）。0 表示禁用。

## iceberg_metadata_files_cache_size_ratio \{#iceberg_metadata_files_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在 iceberg 元数据缓存中，受保护队列（在使用 SLRU 策略时）的大小占缓存总大小的比例。

## ignore_empty_sql_security_in_create_view_query \{#ignore_empty_sql_security_in_create_view_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果为 true，ClickHouse 不会为 `CREATE VIEW` 查询中空的 `SQL SECURITY` 语句写入默认值。

:::note
此设置仅在迁移期间需要使用，并将在 24.4 中被废弃。
:::

## include_from \{#include_from\}

<SettingsInfoBlock type="String" default_value="/etc/metrika.xml" />

包含替换项的文件路径。支持 XML 和 YAML 格式。

有关更多信息，请参阅[配置文件](/operations/configuration-files)一节。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## include_from \{#include_from\}

包含替换内容的文件路径。支持 XML 和 YAML 两种格式。

有关更多信息，请参阅 [Configuration files](/operations/configuration-files) 章节。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy \{#index_mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引标记缓存策略的名称。

## index_mark_cache_size \{#index_mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

索引标记缓存的最大容量。

:::note

值为 `0` 表示禁用。

该设置可以在运行时修改，并会立即生效。
:::

## index_mark_cache_size_ratio \{#index_mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.3" />在二级索引标记缓存中，受保护队列的大小占该缓存总大小的比例（在使用 SLRU 策略时）。

## index_uncompressed_cache_policy \{#index_uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引未压缩缓存的策略名称。

## index_uncompressed_cache_size \{#index_uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

缓存未压缩 `MergeTree` 索引数据块的最大大小。

:::note
值为 `0` 表示禁用。

此设置可以在运行时修改，并会立即生效。
:::

## index_uncompressed_cache_size_ratio \{#index_uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在使用 SLRU 策略时，二级索引未压缩缓存中受保护队列的大小占缓存总大小的比例。

## interserver_http_credentials \{#interserver_http_credentials\}

在[复制](../../engines/table-engines/mergetree-family/replication.md)期间用于连接到其他服务器的用户名和密码。此外，服务器还会使用这些凭证对其他副本进行身份验证。
因此，集群中所有副本的 `interserver_http_credentials` 必须相同。

:::note

* 默认情况下，如果省略了 `interserver_http_credentials` 部分，则在复制期间不使用身份验证。
* `interserver_http_credentials` 设置与 ClickHouse 客户端凭证[配置](../../interfaces/cli.md#configuration_files)无关。
* 这些凭证在通过 `HTTP` 和 `HTTPS` 进行复制时通用。
  :::

可以通过子标签配置以下设置：

* `user` — 用户名。
* `password` — 密码。
* `allow_empty` — 如果为 `true`，则即使设置了凭证，也允许其他副本在不进行身份验证的情况下连接。如果为 `false`，则拒绝不带身份验证的连接。默认值：`false`。
* `old` — 包含在凭证轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭证轮换**

ClickHouse 支持在无需同时停止所有副本以更新配置的情况下，动态轮换服务器间凭证。可以通过多个步骤更改凭证。

要启用身份验证，请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭证。这样可以同时允许带身份验证和不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置好所有副本后，将 `allow_empty` 设为 `false`，或移除该设置。这样会强制必须使用新的凭证进行认证。

要更改现有凭证，请将用户名和密码移动到 `interserver_http_credentials.old` 部分，并将 `user` 和 `password` 更新为新值。此时，服务器会使用新凭证连接到其他副本，但同时也会接受使用新旧任一凭证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

当新凭证已应用到所有副本后，即可删除旧凭证。


## interserver_http_host \{#interserver_http_host\}

其他服务器可用于访问此服务器的主机名。

如果省略，该值将以与 `<hostname -f>` 命令相同的方式进行定义。

有助于避免绑定到某个特定的网络接口。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_host \{#interserver_http_host\}

可供其他服务器访问此服务器所使用的主机名。

如果省略，则与执行 `hostname -f` 命令时的确定方式相同。

适用于摆脱对某个特定网络接口依赖的场景。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port \{#interserver_http_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于 ClickHouse 服务器之间数据交换的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_port \{#interserver_http_port\}

在 ClickHouse 服务器之间进行数据交换的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host \{#interserver_https_host\}

与 `<interserver_http_host>` 类似，不同之处在于该主机名可用于让其他服务器通过 `<HTTPS>` 访问本服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_host \{#interserver_https_host\}

类似于 [`interserver_http_host`](#interserver_http_host)，但此主机名供其他服务器通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port \{#interserver_https_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在 ClickHouse 服务器之间通过 `<HTTPS>` 进行数据交换所使用的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_port \{#interserver_https_port\}

用于 ClickHouse 服务器之间通过 `HTTPS` 进行数据交换的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host \{#interserver_listen_host\}

对允许在 ClickHouse 服务器之间交换数据的主机进行限制。
如果使用 Keeper，则相同的限制也会应用于不同 Keeper 实例之间的通信。

:::note
默认情况下，该值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认值：


## io_thread_pool_queue_size \{#io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

可在 IO 线程池中调度的最大任务数。

:::note
值为 `0` 表示不限制。
:::

## jemalloc_collect_global_profile_samples_in_trace_log \{#jemalloc_collect_global_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />将 jemalloc 采样到的内存分配记录存储到 system.trace_log 中

## jemalloc_enable_background_threads \{#jemalloc_enable_background_threads\}

<SettingsInfoBlock type="Bool" default_value="1" />启用 jemalloc 后台线程。jemalloc 使用后台线程来清理未使用的内存页。禁用该功能可能会导致性能下降。

## jemalloc_enable_global_profiler \{#jemalloc_enable_global_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />为所有线程启用 jemalloc 的分配分析器。jemalloc 将对分配进行采样，并对已采样分配的所有释放操作进行采样。
可以使用 SYSTEM JEMALLOC FLUSH PROFILE 刷新分析数据，以用于分配分析。
采样数据也可以通过配置 jemalloc_collect_global_profile_samples_in_trace_log，或通过查询设置 jemalloc_collect_profile_samples_in_trace_log 存储在 system.trace_log 中。
参见 [Allocation Profiling](/operations/allocation-profiling)。

## jemalloc_flush_profile_interval_bytes \{#jemalloc_flush_profile_interval_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />当全局峰值内存使用量在上一次刷新基础上增加了 jemalloc_flush_profile_interval_bytes 后，将刷新 jemalloc profile

## jemalloc_flush_profile_on_memory_exceeded \{#jemalloc_flush_profile_on_memory_exceeded\}

<SettingsInfoBlock type="Bool" default_value="0" />当出现总内存超限错误时，会刷新 jemalloc profile

## jemalloc_max_background_threads_num \{#jemalloc_max_background_threads_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />要创建的 jemalloc 后台线程最大数量，将其设为 0 时使用 jemalloc 的默认值

## keep_alive_timeout \{#keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

ClickHouse 在关闭 HTTP 连接之前等待传入请求的时间（秒）。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts \{#keeper_hosts\}

动态设置项。包含 ClickHouse 可能连接的一组 [Zoo]Keeper 主机，不会暴露来自 `<auxiliary_zookeepers>` 的信息。

## keeper_multiread_batch_size \{#keeper_multiread_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

向支持批量操作的 [Zoo]Keeper 发起 MultiRead 请求时的最大批量大小。若设置为 0，则禁用批处理。仅在 ClickHouse Cloud 中可用。

## keeper_server.socket_receive_timeout_sec \{#keeper_server.socket_receive_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper 套接字接收超时。

## keeper_server.socket_send_timeout_sec \{#keeper_server.socket_send_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Keeper 套接字发送超时时间（秒）。

## ldap_servers \{#ldap_servers\}

在此列出 LDAP 服务器及其连接参数，以便：

- 将它们用作特定本地用户的认证器，这些用户在身份验证机制中指定为 `ldap` 而不是 `password`
- 将它们用作远程用户目录。

可以通过子标签配置以下设置：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数为必填项且不能为空。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认值为 636，否则为 `389`。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 用于构造绑定 DN 的 Template。最终 DN 将在每次认证尝试期间，通过将模板中的所有 `\{user_name\}` 子串替换为实际用户名来构造。                                                                                                                                                                                                                               |
| `user_dn_detection`            | 用于检测已绑定用户实际用户 DN 的 LDAP 搜索参数部分。当服务器是 Active Directory 时，这主要用于在后续角色映射的搜索过滤器中使用。得到的用户 DN 将在允许的位置用于替换 `\{user_dn\}` 子串。默认情况下，用户 DN 设置为与 bind DN 相同，但一旦执行搜索，它会更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 在一次成功绑定尝试之后，在指定的秒数时间段内，对于所有连续请求，都会假定用户已成功认证，而无需联系 LDAP 服务器。指定 `0`（默认）以禁用缓存，并强制对每次认证请求都联系 LDAP 服务器。                                                                                                                  |
| `enable_tls`                   | 用于启用与 LDAP 服务器安全连接的标志。指定 `no` 使用明文 (`ldap://`) 协议（不推荐）。指定 `yes` 使用基于 SSL/TLS 的 LDAP (`ldaps://`) 协议（推荐，也是默认）。指定 `starttls` 使用传统的 StartTLS 协议（先使用明文 (`ldap://`) 协议，再升级为 TLS）。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS 的最小协议版本。可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS 对端证书验证行为。可接受的值为：`never`、`allow`、`try`、`demand`（默认）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 证书密钥文件路径。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 允许的密码套件（OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 设置可以通过子标签进行配置：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | 用于构造 LDAP 搜索基础 DN 的模板。最终 DN 将在 LDAP 搜索期间，通过将模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子串替换为实际用户名和 bind DN 来构造。                                                                                                       |
| `scope`         | LDAP 搜索范围。可接受的值为：`base`、`one_level`、`children`、`subtree`（默认）。                                                                                                                                                                                                                                       |
| `search_filter` | 用于构造 LDAP 搜索过滤器的模板。最终过滤器将在 LDAP 搜索期间，通过将模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串替换为实际用户名、bind DN 和 base DN 来构造。注意，特殊字符必须在 XML 中正确转义。  |

示例：

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

示例（典型的 Active Directory，已配置用于后续角色映射的用户 DN 检测）：

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```


## license_file \{#license_file\}

ClickHouse 企业版许可证文件内容

## license_public_key_for_testing \{#license_public_key_for_testing\}

许可演示用公钥，仅供 CI 使用

## listen_backlog \{#listen_backlog\}

<SettingsInfoBlock type="UInt32" default_value="4096" />

监听套接字的 backlog（待处理连接队列大小）。默认值 `<4096>` 与 Linux 5.4+ 的默认值相同。

通常无需更改此值，因为：

* 默认值已经足够大；
* 服务器使用单独线程来接受客户端连接。

因此，即使你在 ClickHouse 服务器上看到 `<TcpExtListenOverflows>`（来自 `<nstat>`）为非零且该计数器在增加，也不意味着需要增大该值，因为：

* 通常如果 `<4096>` 不够，说明存在某些 ClickHouse 内部扩展性问题，更合适的做法是报告一个问题。
* 这并不意味着服务器之后就能处理更多连接（即使可以，到那时客户端可能已经离开或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_backlog \{#listen_backlog\}

监听套接字的 backlog（待处理连接队列大小）。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的默认值相同。

通常不需要更改该值，因为：

* 默认值已经足够大，
* 接收客户端连接由服务器中的单独线程负责。

因此，即使你在 `nstat` 中看到 ClickHouse 服务器的 `TcpExtListenOverflows` 为非零且该计数器在增长，也不意味着需要增大该值，因为：

* 通常如果 `4096` 不够，这表明 ClickHouse 内部存在扩展性问题，因此最好提交一个 issue 报告问题。
* 这并不意味着服务器之后可以处理更多连接（即使可以，到那时客户端可能已经消失或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host \{#listen_host\}

限制允许来自哪些主机的请求。如果希望服务器接受来自所有主机的请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port \{#listen_reuse_port\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许多个服务器监听同一地址和端口（address:port）。操作系统会将请求随机路由到某一台服务器。不推荐启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```


## listen_reuse_port \{#listen_reuse_port\}

允许多个服务器在同一地址和端口（address:port）上监听。请求将由操作系统随机分发到某个服务器。不建议启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认值：


## listen_try \{#listen_try\}

<SettingsInfoBlock type="Bool" default_value="0" />

在尝试开始监听时，如果 IPv6 或 IPv4 网络不可用，服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```


## listen_try \{#listen_try\}

在尝试监听时，即使 IPv6 或 IPv4 网络不可用，服务器也不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size \{#load_marks_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />用于加载标记的后台线程池大小

## load_marks_threadpool_queue_size \{#load_marks_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />可加入预取线程池队列的最大任务数

## logger \{#logger\}

日志消息的位置和格式。

**键**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 日志级别。可接受的值：`none`（关闭日志），`fatal`，`critical`，`error`，`warning`，`notice`，`information`，`debug`，`trace`，`test`                 |
| `log`                  | 日志文件的路径。                                                                                                                                          |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                    |
| `size`                 | 日志轮转策略：日志文件的最大大小（字节）。当日志文件大小超过该阈值时，会被重命名并归档，并创建一个新的日志文件。 |
| `rotation`             | 日志轮转策略：控制何时轮转日志文件。轮转可以基于大小、时间或两者的组合。例如：100M、daily、100M,daily。当日志文件超过指定大小或达到指定时间间隔时，会被重命名并归档，并创建一个新的日志文件。 |
| `count`                | 日志轮转策略：ClickHouse 最多保留多少个历史日志文件。                                                                                        |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                   |
| `console`              | 启用向控制台输出日志。设置为 `1` 或 `true` 以启用。如果 ClickHouse 不以守护进程模式运行，默认值为 `1`，否则为 `0`。                            |
| `console_log_level`    | 控制台输出的日志级别。默认与 `level` 相同。                                                                                                                 |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                 |
| `use_syslog`           | 同时将日志输出转发到 syslog。                                                                                                                                 |
| `syslog_level`         | 输出到 syslog 时使用的日志级别。                                                                                                                                   |
| `async`                | 当为 `true`（默认）时，日志记录将异步进行（每个输出通道一个后台线程）。否则将在线程内（调用 LOG 的线程）进行日志记录。           |
| `async_queue_max_size` | 使用异步日志记录时，队列中等待刷新的最大消息数量。超出的消息将被丢弃。                       |
| `startup_level`        | 启动级别用于在服务器启动时设置根 logger 的级别。启动完成后，日志级别会恢复为 `level` 设置。                                   |
| `shutdown_level`       | 关闭级别用于在服务器关闭时设置根 logger 的级别。                                                                                            |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名部分支持以下格式说明符，用于生成最终的文件名（目录部分不支持这些说明符）。

“Example” 列展示的是在 `2023-07-06 18:32:07` 时的输出。

| 格式说明符 | 说明                                                                                                     | 示例                         |
| ----- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| `%%`  | 字面百分号                                                                                                  | `%`                        |
| `%n`  | 换行符                                                                                                    |                            |
| `%t`  | 水平制表符                                                                                                  |                            |
| `%Y`  | 以十进制表示的年份，例如 2017 年                                                                                    | `2023`                     |
| `%y`  | 年份后 2 位数字，十进制数（取值范围 [00,99]）                                                                           | `23`                       |
| `%C`  | 年份前两位数字，以十进制表示（范围 [00,99]）                                                                             | `20`                       |
| `%G`  | 四位数的 [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常只在配合 `%V` 使用时才有意义。 | `2023`                     |
| `%g`  | [ISO 8601 周日期年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的后两位数字，即包含指定周的年份。                  | `23`                       |
| `%b`  | 缩写的月份名称，如 Oct（取决于区域设置）                                                                                 | `Jul`                      |
| `%h`  | 与 %b 等同                                                                                                | `Jul`                      |
| `%B`  | 完整的月份名称，例如 October（依区域设置而定）                                                                            | `July`                     |
| `%m`  | 月份的十进制表示（范围 [01,12]）                                                                                   | `07`                       |
| `%U`  | 一年中的第几周，用十进制数字表示（星期日是一周的第一天）（范围 [00,53]）                                                               | `27`                       |
| `%W`  | 一年中的周数，以十进制表示（星期一为一周的第一天）（范围 [00,53]）                                                                  | `27`                       |
| `%V`  | ISO 8601 周编号（范围 [01,53]）                                                                               | `27`                       |
| `%j`  | 一年中的第几天，以十进制数表示（范围 [001,366]）                                                                          | `187`                      |
| `%d`  | 当月日期，使用零填充的十进制数表示（范围 [01,31]）。一位数前补零。                                                                  | `06`                       |
| `%e`  | 以空格填充的十进制数表示的月份日期（范围 [1,31]）。一位数前面补一个空格。                                                               | `&nbsp; 6`                 |
| `%a`  | 缩写的星期几名称，例如 Fri（取决于区域设置）                                                                               | `Thu`                      |
| `%A`  | 完整星期名称，例如 Friday（取决于语言环境）                                                                              | `Thursday`                 |
| `%w`  | 将星期表示为整数，其中星期日为 0（取值范围为 [0-6]）                                                                         | `4`                        |
| `%u`  | 以十进制数字表示的星期，其中星期一为 1（符合 ISO 8601 格式）（范围 [1-7]）                                                         | `4`                        |
| `%H`  | 以十进制数字表示的小时，24 小时制（范围 [00-23]）                                                                         | `18`                       |
| `%I`  | 以十进制表示的小时数，12 小时制（范围 [01,12]）                                                                          | `06`                       |
| `%M`  | 以十进制数表示的分钟（范围 [00,59]）                                                                                 | `32`                       |
| `%S`  | 以十进制数表示的秒数（取值范围 [00,60]）                                                                               | `07`                       |
| `%c`  | 标准日期时间字符串，例如 Sun Oct 17 04:41:13 2010（取决于区域设置）                                                         | `Thu Jul  6 18:32:07 2023` |
| `%x`  | 本地化日期格式（依赖于区域设置）                                                                                       | `2023/07/06`               |
| `%X`  | 本地化的时间表示形式，例如 18:40:20 或 6:40:20 PM（取决于区域设置）                                                           | `18:32:07`                 |
| `%D`  | 短格式 MM/DD/YY 日期，与 %m/%d/%y 等价                                                                          | `07/06/23`                 |
| `%F`  | 短格式 YYYY-MM-DD 日期，与 %Y-%m-%d 等价                                                                        | `2023-07-06`               |
| `%r`  | 本地化的 12 小时制时间（取决于区域设置）                                                                                 | `06:32:07 PM`              |
| `%R`  | 等价于 &quot;%H:%M&quot;                                                                                  | `18:32`                    |
| `%T`  | 等同于 &quot;%H:%M:%S&quot;（ISO 8601 时间格式）                                                                | `18:32:07`                 |
| `%p`  | 本地化的上午/下午标记（取决于语言环境）                                                                                   | `PM`                       |
| `%z`  | 以 ISO 8601 格式表示的相对于 UTC 的偏移量（例如 -0430），若时区信息不可用，则不输出任何字符                                               | `+0800`                    |
| `%Z`  | 依赖区域设置的时区名称或缩写；如果时区信息不可用，则不输出任何字符                                                                      | `Z AWST `                  |

**示例**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

若要仅在控制台输出日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按级别覆盖**

可以为单个日志名称单独覆盖日志级别。例如，可静音来自日志记录器 &quot;Backup&quot; 和 &quot;RBAC&quot; 的所有消息。

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

要额外将日志消息写入 syslog：

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

`&lt;syslog&gt;` 的键：

| Key        | Description                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，将使用本地守护进程。                                                                                                                                                             |
| `hostname` | 日志发送方的主机名（可选）。                                                                                                                                                                                             |
| `facility` | syslog [facility keyword](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写，并以 &quot;LOG&#95;&quot; 作为前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。默认值：如果指定了 `address`，则为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可选值：`bsd` 和 `syslog.`                                                                                                                                                                               |

**Log formats**

可以指定输出到控制台的日志格式。目前仅支持 JSON。

**Example**

下面是一个 JSON 日志输出示例：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

要启用 JSON 日志支持，请使用以下配置片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**为 JSON 日志重命名键**

可以通过修改 `<names>` 标签内的标签值来更改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**在 JSON 日志中省略键**

可以通过将属性注释掉来省略日志属性。例如，如果不希望日志输出 `query_id`，可以将 `<query_id>` 标签注释掉。


## logger.async \{#logger.async\}

<SettingsInfoBlock type="Bool" default_value="1" />当为 `<true>`（默认）时，日志记录将以异步方式执行（每个输出通道对应一个后台线程）。否则，将在调用 LOG 的线程中执行日志记录。

## logger.async_queye_max_size \{#logger.async_queye_max_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />使用异步日志时，队列中可保留、等待刷新到存储的日志消息的最大数量。超出的消息将被丢弃。

## logger.console \{#logger.console\}

<SettingsInfoBlock type="Bool" default_value="0" />启用将日志输出到控制台。将其设置为 `<1>` 或 `<true>` 以启用。如果 ClickHouse 不以守护进程模式运行，则默认值为 `<1>`，否则为 `<0>`。

## logger.console_log_level \{#logger.console_log_level\}

<SettingsInfoBlock type="String" default_value="trace" />控制台日志输出级别。默认为 `<level>`。

## logger.count \{#logger.count\}

<SettingsInfoBlock type="UInt64" default_value="1" />日志轮转策略：最多保留多少个 ClickHouse 历史日志文件。

## logger.errorlog \{#logger.errorlog\}

错误日志文件的路径。

## logger.formatting.type \{#logger.formatting.type\}

<SettingsInfoBlock type="String" default_value="json" />控制台输出的日志格式。目前仅支持 `<json>` 格式。

## logger.level \{#logger.level\}

<SettingsInfoBlock type="String" default_value="trace" />日志级别。可选值：`<none>`（关闭日志）、`<fatal>`、`<critical>`、`<error>`、`<warning>`、`<notice>`、`<information>`、`<debug>`、`<trace>`、`<test>`。

## logger.log \{#logger.log\}

日志文件路径。

## logger.rotation \{#logger.rotation\}

<SettingsInfoBlock type="String" default_value="100M" />轮转策略：用于控制何时对日志文件进行轮转。轮转可以基于大小、时间，或两者的组合。例如：100M、daily、100M,daily。当日志文件超过指定大小或达到指定时间间隔时，会被重命名并归档，并创建一个新的日志文件。

## logger.shutdown_level \{#logger.shutdown_level\}

关闭级别用于指定服务器关闭时根记录器的级别。

## logger.size \{#logger.size\}

<SettingsInfoBlock type="String" default_value="100M" />轮换策略：日志文件的最大大小，以字节为单位。超过该阈值后，日志文件会被重命名并归档，并创建一个新的日志文件。

## logger.startup_level \{#logger.startup_level\}

启动级别用于在服务器启动时设置根 logger 的日志级别。服务器启动完成后，日志级别会恢复为 `<level>` 设置中指定的级别。

## logger.stream_compress \{#logger.stream_compress\}

<SettingsInfoBlock type="Bool" default_value="0" />使用 LZ4 压缩日志消息。将此参数设置为 `<1>` 或 `<true>` 以启用。

## logger.syslog_level \{#logger.syslog_level\}

<SettingsInfoBlock type="String" default_value="trace" />记录到 syslog 的日志级别。

## logger.use_syslog \{#logger.use_syslog\}

<SettingsInfoBlock type="Bool" default_value="0" />还会将日志输出转发到 syslog。

## macros \{#macros\}

用于复制表的参数替换项。

如果不使用复制表，则可以省略。

更多信息，参见章节[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)。

**示例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy \{#mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />标记缓存策略名称。

## mark_cache_prewarm_ratio \{#mark_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />在预热期间要填充的 mark 缓存总大小的比例。

## mark_cache_size \{#mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

用于存储标记（[`MergeTree`](/engines/table-engines/mergetree-family) 表族的索引）的缓存的最大容量。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## mark_cache_size_ratio \{#mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在标记缓存中（在使用 SLRU 策略时）受保护队列的大小，占该缓存总大小的比例。

## max_active_parts_loading_thread_pool_size \{#max_active_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />用于在启动时加载活动分区片段（Active）的线程数。

## max_authentication_methods_per_user \{#max_authentication_methods_per_user\}

<SettingsInfoBlock type="UInt64" default_value="100" />

为单个用户可创建或修改配置的身份验证方法的最大数量。
更改此设置不会影响现有用户。如果创建或修改与身份验证相关的查询超过此设置中指定的上限，这些查询将会失败。
与身份验证无关的创建或修改查询不会受到影响，并会成功执行。

:::note
值为 `0` 表示无限制。
:::

## max_backup_bandwidth_for_server \{#max_backup_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有备份操作的最大读取速度（以字节/秒为单位）。0 表示不限制。

## max_backups_io_thread_pool_free_size \{#max_backups_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />如果备份 IO 线程池中**空闲**线程的数量超过 `max_backup_io_thread_pool_free_size`，ClickHouse 会释放这些空闲线程占用的资源，并缩减线程池大小。必要时会重新创建线程。

## max_backups_io_thread_pool_size \{#max_backups_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse 使用 Backups IO 线程池中的线程来进行 S3 备份的 IO 操作。`max_backups_io_thread_pool_size` 用于限制该线程池中的最大线程数。

## max_build_vector_similarity_index_thread_pool_size \{#max_build_vector_similarity_index_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

用于构建向量索引时可使用的最大线程数。

:::note
值为 `0` 表示使用所有 CPU 核心。
:::

## max_concurrent_insert_queries \{#max_concurrent_insert_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制并发 `INSERT` 查询的总数。

:::note

值为 `0`（默认）表示不受限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询不会被更改。
:::

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

对并发执行的查询总数的限制。请注意，还必须同时考虑对 `INSERT` 和 `SELECT` 查询的限制，以及对用户最大查询数量的限制。

另请参阅：

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

值为 `0`（默认）表示无限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询不会受到影响。
:::

## max_concurrent_select_queries \{#max_concurrent_select_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

对并发执行的 SELECT 查询总数的限制。

:::note

值为 `0`（默认）表示不限。

此设置可以在运行时修改，并会立即生效。已在运行中的查询不会受到影响。
:::

## max_connections \{#max_connections\}

<SettingsInfoBlock type="Int32" default_value="4096" />服务器允许的最大连接数。

## max_database_num_to_throw \{#max_database_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />如果数据库数量大于该值，服务器将抛出异常。0 表示无限制。

## max_database_num_to_warn \{#max_database_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果已附加的数据库数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size \{#max_database_replicated_create_table_thread_pool_size\}

<SettingsInfoBlock type="UInt32" default_value="1" />在 DatabaseReplicated 中用于在副本恢复期间创建表的线程数量。当设置为 0 时，线程数量等于 CPU 核心数。

## max_dictionary_num_to_throw \{#max_dictionary_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果字典数量超过该值，服务器将抛出异常。

仅统计以下数据库引擎的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不做限制。
:::

**示例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max_dictionary_num_to_warn \{#max_dictionary_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果已挂载的字典数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server \{#max_distributed_cache_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上从分布式缓存读取数据的总最大速度（字节/秒）。0 表示无限制。

## max_distributed_cache_write_bandwidth_for_server \{#max_distributed_cache_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上分布式缓存的最大总写入带宽，单位为字节/秒。0 表示不限制。

## max_entries_for_hash_table_stats \{#max_entries_for_hash_table_stats\}

<SettingsInfoBlock type="UInt64" default_value="10000" />聚合时收集的哈希表统计信息中允许的最大条目数

## max_fetch_partition_thread_pool_size \{#max_fetch_partition_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />用于执行 ALTER TABLE FETCH PARTITION 的线程数量。

## max_format_parsing_thread_pool_free_size \{#max_format_parsing_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

在线程池中为解析输入而保留的空闲备用线程的最大数量。

## max_format_parsing_thread_pool_size \{#max_format_parsing_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

最大可用于解析输入的线程总数。

## max_io_thread_pool_free_size \{#max_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果 IO 线程池中**空闲**线程的数量超过 `max_io_thread_pool_free_size`，ClickHouse 会释放由空闲线程占用的资源并缩小线程池大小。如有需要，可以重新创建线程。

## max_io_thread_pool_size \{#max_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse 使用 IO 线程池中的线程来执行部分 IO 操作（例如与 S3 交互）。`max_io_thread_pool_size` 用于限制 IO 线程池中的最大线程数。

## max_keep_alive_requests \{#max_keep_alive_requests\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

在被 ClickHouse 服务器关闭之前，通过单个 keep-alive 连接所能处理的最大请求数。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server \{#max_local_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

本地读取的最大速率，单位为字节/秒。

:::note
值为 `0` 表示无限制。
:::

## max_local_write_bandwidth_for_server \{#max_local_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

本地写入的最大速率，单位为字节/秒。

:::note
值为 `0` 表示无限制。
:::

## max_materialized_views_count_for_table \{#max_materialized_views_count_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制可附加到单个表的 materialized view 数量。

:::note
此处仅统计直接依赖的视图，基于其他视图再创建视图的情况不计入。
:::

## max_merges_bandwidth_for_server \{#max_merges_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有合并操作的最大读取带宽（字节/秒）。0 表示无限制。

## max_mutations_bandwidth_for_server \{#max_mutations_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有 mutation 操作的最大读取带宽，单位为字节每秒。0 表示不限制。

## max_named_collection_num_to_throw \{#max_named_collection_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果命名集合的数量大于该值，服务器将抛出异常。

:::note
值为 `0` 表示不做限制。
:::

**示例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn \{#max_named_collection_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果命名集合的数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files \{#max_open_files\}

<SettingsInfoBlock type="UInt64" default_value="0" />

打开文件的最大数量。

:::note
我们建议在 macOS 上使用该选项，因为 getrlimit() 函数返回的值不正确。
:::

## max_open_files \{#max_open_files\}

最大允许打开的文件数。

:::note
我们建议在 macOS 上使用该选项，因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection \{#max_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

用于决定是否断开连接的操作系统 CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之比的最大值。通过在最小与最大比值之间进行线性插值来计算概率，在该比值处概率为 1。
更多细节参见[在服务器 CPU 过载时控制行为](/operations/settings/server-overload)。

## max_outdated_parts_loading_thread_pool_size \{#max_outdated_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />在启动时用于加载非活动（过时）分区片段的线程数。

## max_part_num_to_warn \{#max_part_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果活动分区片段的数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

删除分区的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop)（以字节为单位），则无法使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询删除分区。
此设置生效不需要重启 ClickHouse 服务器。禁用该限制的另一种方式是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值 `0` 表示可以不受任何限制地删除分区。

该限制不适用于 drop table 和 truncate table 操作，参见 [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop)
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size \{#max_parts_cleaning_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />用于并发移除不活跃数据分区片段的线程数。

## max_pending_mutations_execution_time_to_warn \{#max_pending_mutations_execution_time_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

如果任意一个挂起的 mutation 的执行时间超过指定的秒数阈值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn \{#max_pending_mutations_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="500" />

如果待处理的 mutation 数量超过指定的值，ClickHouse 服务器会向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size \{#max_prefixes_deserialization_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果前缀反序列化线程池中**空闲**线程的数量超过 `max_prefixes_deserialization_thread_pool_free_size`，ClickHouse 将释放这些空闲线程占用的资源，并缩小线程池的大小。必要时可以重新创建线程。

## max_prefixes_deserialization_thread_pool_size \{#max_prefixes_deserialization_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse 使用前缀反序列化线程池中的线程，并行读取 MergeTree 中 Wide 分区片段文件前缀里的列和子列元数据。`max_prefixes_deserialization_thread_pool_size` 用于限制该线程池中的最大线程数。

## max_remote_read_network_bandwidth_for_server \{#max_remote_read_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于读取时网络数据交换的最大速率（以字节/秒为单位）。

:::note
值为 `0`（默认）表示无限制。
:::

## max_remote_write_network_bandwidth_for_server \{#max_remote_write_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

写入数据时通过网络进行数据交换的最大速度，单位为字节/秒。

:::note
值为 `0`（默认）表示不限制。
:::

## max_replicated_fetches_network_bandwidth_for_server \{#max_replicated_fetches_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />用于副本抓取的网络数据交换最大速度，单位为字节/秒。0 表示无限制。

## max_replicated_sends_network_bandwidth_for_server \{#max_replicated_sends_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />副本发送时通过网络进行数据交换的最大速率，单位为字节/秒。0 表示不限制。

## max_replicated_table_num_to_throw \{#max_replicated_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果复制表的数量大于该值，服务器将抛出异常。

仅统计使用以下数据库引擎的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不作限制。
:::

**示例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage \{#max_server_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

服务器允许使用的最大内存，以字节为单位。

:::note
服务器的最大内存使用量还会受到 `max_server_memory_usage_to_ram_ratio` 的进一步限制。
:::

作为一种特殊情况，值为 `0`（默认）表示服务器可以使用除 `max_server_memory_usage_to_ram_ratio` 施加的进一步限制外的全部可用内存。

## max_server_memory_usage_to_ram_ratio \{#max_server_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.9" />

服务器允许使用的最大内存量，以占全部可用内存的比例表示。

例如，值为 `0.9`（默认）意味着服务器最多可以使用 90% 的可用内存。

可用于在低内存系统上降低内存使用。
在 RAM 和 swap 容量都较小的主机上，可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置为大于 1 的值。

:::note
服务器的最大内存消耗还会受到 `max_server_memory_usage` SETTING 的进一步限制。
:::

## max_session_timeout \{#max_session_timeout\}

最大会话超时时长（以秒为单位）。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw \{#max_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果表的数量大于该值，服务器将抛出异常。

下列类型的表不计入该数量：

* view
* remote
* dictionary
* system

只统计以下数据库引擎的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不做限制。
:::

**示例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn \{#max_table_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

如果已挂载的表数量超过指定值，ClickHouse 服务器会在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

删除表的限制条件。

如果某个 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop`（以字节为单位），则不能使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询删除该表。

:::note
值为 `0` 表示可以在没有任何限制的情况下删除所有表。

使此设置生效不需要重启 ClickHouse 服务器。禁用该限制的另一种方式是创建 `<clickhouse-path>/flags/force_drop_table` 文件。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size \{#max_temporary_data_on_disk_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

可用于外部聚合、JOIN 或排序的最大存储空间。
超过此限制的查询将因为抛出异常而失败。

:::note
值为 `0` 表示不限制。
:::

另请参阅：

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size \{#max_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果全局线程池（Global Thread pool）中的**空闲**线程数大于 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)，则 ClickHouse 会释放部分线程占用的资源，并减少线程池大小。如有需要，可以重新创建线程。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size \{#max_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse 使用全局线程池中的线程来处理查询。如果没有空闲线程可以处理某个查询，则会在池中创建一个新线程。`max_thread_pool_size` 用于限制池中的最大线程数。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size \{#max_unexpected_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />启动时用于加载非活跃意外分区片段的线程数量。

## max_view_num_to_throw \{#max_view_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果 VIEW 的数量超过该值，服务器将抛出异常。

仅统计以下数据库引擎中的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不做限制。
:::

**示例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn \{#max_view_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

如果附加的视图数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries \{#max_waiting_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

对同时处于等待状态的查询总数的限制。
当所需表正在异步加载时（参见 [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)），处于等待状态的查询将被阻塞执行。

:::note
在检查由以下设置控制的限制时，不会统计等待中的查询：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

做此调整是为了避免在服务器启动后立即触及这些限制。
:::

:::note

值为 `0`（默认）表示不限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询将保持不变。
:::

## memory_worker_correct_memory_tracker \{#memory_worker_correct_memory_tracker\}

<SettingsInfoBlock type="Bool" default_value="0" />

后台内存工作线程是否应根据 jemalloc、cgroups 等外部来源的信息来校正内部内存跟踪器。

## memory_worker_period_ms \{#memory_worker_period_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

后台内存工作线程的轮询周期，用于修正 memory tracker 的内存使用量，并在高内存使用期间清理未使用的内存页。若设置为 0，则将使用默认值，该默认值取决于内存使用来源。

## memory_worker_purge_dirty_pages_threshold_ratio \{#memory_worker_purge_dirty_pages_threshold_ratio\}

<SettingsInfoBlock type="Double" default_value="0.2" />

相对于 ClickHouse 服务器可用内存的 jemalloc 脏页阈值比例。当脏页大小超过该比例时，后台内存工作线程会强制回收脏页。若设置为 0，则禁用强制回收。

## memory_worker_use_cgroup \{#memory_worker_use_cgroup\}

<SettingsInfoBlock type="Bool" default_value="1" />根据当前 cgroup 的内存使用信息修正内存跟踪。

## merge_tree \{#merge_tree\}

针对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的微调设置。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload \{#merge_workload\}

<SettingsInfoBlock type="String" default_value="default" />

用于调节合并任务与其他工作负载之间的资源使用和共享方式。指定的值会作为所有后台合并的 `workload` 设置值，可被 MergeTree 的设置覆盖。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit \{#merges_mutations_memory_usage_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在执行 merge 和 mutation 操作时允许使用的 RAM 上限。
当 ClickHouse 达到设置的上限时，将不会再调度新的后台 merge 或 mutation 操作，但会继续执行已经调度的任务。

:::note
值为 `0` 表示不限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio \{#merges_mutations_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />

默认的 `merges_mutations_memory_usage_soft_limit` 值通过 `memory_amount * merges_mutations_memory_usage_to_ram_ratio` 计算得出。

**另请参阅：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log \{#metric_log\}

默认情况下为禁用。

**启用**

要手动开启指标历史数据收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml` 文件，并填入以下内容：

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**禁用**

要禁用 `metric_log` 设置，请创建如下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection \{#min_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

OS CPU 等待时间（`OSCPUWaitMicroseconds` 指标）与忙碌时间（`OSCPUVirtualTimeMicroseconds` 指标）之间的最小比值，用于判定是否应当断开连接。通过在最小比值和最大比值之间进行线性插值来计算概率，在该最小比值时概率为 0。
更多详情参见 [在服务器 CPU 过载时控制行为](/operations/settings/server-overload)。

## mlock_executable \{#mlock_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

在启动后执行 `<mlockall>`，以降低首次查询的延迟，并防止在高 IO 负载下 ClickHouse 可执行文件被换出内存。

:::note
建议启用此选项，但这会导致启动时间最多增加几秒。请注意，如果没有 CAP&#95;IPC&#95;LOCK capability，此设置将无法生效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable \{#mlock_executable\}

在启动后执行 `mlockall`，以降低首次查询的延迟，并防止 ClickHouse 可执行文件在高 IO 负载下被换出到磁盘。

:::note
建议启用此选项，但这会使启动时间增加最多几秒钟。
请注意，如果没有授予 &quot;CAP&#95;IPC&#95;LOCK&quot; 权限，此 SETTING 将无法生效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable_min_total_memory_amount_bytes \{#mlock_executable_min_total_memory_amount_bytes\}

<SettingsInfoBlock type="UInt64" default_value="5000000000" />执行 `<mlockall>` 所需的最小总内存阈值

## mmap_cache_size \{#mmap_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

此设置可以避免频繁进行打开/关闭调用（由于随之而来的缺页异常，这类调用代价很高），并允许在多个线程和查询之间复用映射。该设置的值表示映射区域的数量（通常等于被映射文件的数量）。

可以通过以下系统表中的如下指标监控映射文件中的数据量：

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` 位于 [`system.metrics`](/operations/system-tables/metrics)、[`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` 位于 [`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
映射文件中的数据量不会直接消耗内存，也不会计入查询或服务器的内存使用量——因为这部分内存可以像操作系统页缓存一样被丢弃。当 MergeTree 系列表中旧的分区片段被删除时，缓存会自动被丢弃（文件被关闭），也可以通过 `SYSTEM DROP MMAP CACHE` 查询手动丢弃。

此设置可以在运行时修改，并会立即生效。
:::

## mutation_workload \{#mutation_workload\}

<SettingsInfoBlock type="String" default_value="default" />

用于调节变更（mutation）与其他工作负载之间的资源使用与共享方式。指定的值会作为所有后台变更操作的 `workload` 设置值。可以通过 MergeTree 的设置进行覆盖。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## mysql_port \{#mysql_port\}

用于通过 MySQL 协议与客户端进行通信的端口。

:::note

* 正整数表示要监听的端口号
* 空值用于禁用通过 MySQL 协议与客户端的通信。
  :::

**示例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport \{#mysql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为 true，则要求客户端必须通过 [mysql_port](/operations/server-configuration-parameters/settings#mysql_port) 进行安全通信。使用 `--ssl-mode=none` 选项的连接将被拒绝。将其与 [OpenSSL](/operations/server-configuration-parameters/settings#openssl) 设置配合使用。

## mysql_require_secure_transport \{#mysql_require_secure_transport\}

当设置为 true 时，要求客户端必须通过 [mysql_port](#mysql_port) 使用安全连接进行通信。使用选项 `--ssl-mode=none` 的连接将被拒绝。应与 [OpenSSL](#openssl) 相关设置配合使用。

## oom_score \{#oom_score\}

<SettingsInfoBlock type="Int32" default_value="0" />在 Linux 系统上，此设置可用于控制 OOM killer 的行为。

## openSSL \{#openssl\}

SSL 客户端/服务器配置。

对 SSL 的支持由 `libpoco` 库提供。可用的配置选项说明见 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)。默认值可在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端配置的键：

| 参数                            | 说明                                                                                                                                                                                                                                                                         | 默认值                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 证书对应私钥文件的路径。该文件可以同时包含私钥和证书。                                                                                                                                                                                                                                            |                                                                                            |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 已包含证书，则可以省略该选项。                                                                                                                                                                                                                   |                                                                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录的路径。如果该路径指向文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。如果该路径指向目录，则该目录中必须为每个 CA 证书包含一个 .pem 文件。文件名将根据 CA 主题名的哈希值进行查找。更多详细信息可参见 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的 man 手册。 |                                                                                            |
| `verificationMode`            | 用于验证节点证书的方式。详细信息参见 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可选值：`none`、`relaxed`、`strict`、`once`。                                                                                                   | `relaxed`                                                                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设置的值，则验证将失败。                                                                                                                                                                                                                                             | `9`                                                                                        |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定这些内置 CA 证书位于 `/etc/ssl/cert.pem` 文件（或 `/etc/ssl/certs` 目录）中，或者位于由环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                    | `true`                                                                                     |
| `cipherList`                  | 受支持的 OpenSSL 加密套件。                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | 启用或禁用会话缓存功能。必须与 `sessionIdContext` 配合使用。可接受的取值：`true`、`false`。                                                                                                                                                                                                             | `false`                                                                                    |
| `sessionIdContext`            | 一组唯一的随机字符，服务器会将其追加到每个生成的标识符后面。字符串长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终建议设置此参数，因为无论是服务器缓存会话还是客户端请求缓存，它都有助于避免问题。                                                                                                                                                         | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | 服务器可缓存的最大会话数。值为 `0` 表示会话数不受限制。                                                                                                                                                                                                                                             | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 会话在服务器上的缓存时间（单位：小时）。                                                                                                                                                                                                                                                       | `2`                                                                                        |
| `extendedVerification`        | 如果启用，则验证证书的 CN 或 SAN 是否与对端主机名一致。                                                                                                                                                                                                                                           | `false`                                                                                    |
| `requireTLSv1`                | 必须使用 TLSv1 连接。可选值：`true`、`false`。                                                                                                                                                                                                                                          | `false`                                                                                    |
| `requireTLSv1_1`              | 要求使用 TLSv1.1 连接。可接受的取值：`true`、`false`。                                                                                                                                                                                                                                     | `false`                                                                                    |
| `requireTLSv1_2`              | 要求使用 TLSv1.2 连接。可接受的取值：`true`、`false`。                                                                                                                                                                                                                                     | `false`                                                                                    |
| `fips`                        | 启用 OpenSSL 的 FIPS 模式。仅当该库使用的 OpenSSL 版本支持 FIPS 时才可用。                                                                                                                                                                                                                       | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 用于请求访问私钥所需口令的类（PrivateKeyPassphraseHandler 的子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                          | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                    | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 禁止使用的协议。                                                                                                                                                                                                                                                                   |                                                                                            |
| `preferServerCiphers`         | 以客户端优先级为准的服务器密码套件。                                                                                                                                                                                                                                                         | `false`                                                                                    |

**设置示例：**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## openSSL.client.caConfig \{#openssl.client.caconfig\}

包含受信任 CA 证书的文件或目录路径。  
如果该路径指向一个文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。  
如果该路径指向一个目录，则该目录中必须为每个 CA 证书提供一个 .pem 文件。  
文件名将根据 CA 主题名的哈希值进行查找。  
更多详情请参见 [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/) 的 man 手册页。

## openSSL.client.cacheSessions \{#openssl.client.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />启用或禁用会话缓存功能。必须与 `<sessionIdContext>` 配合使用。可接受的值：`<true>`、`<false>`。

## openSSL.client.certificateFile \{#openssl.client.certificatefile\}

以 PEM 格式存储的客户端/服务器证书文件路径。如果 `<privateKeyFile>` 中已包含证书，则可以省略此项。

## openSSL.client.cipherList \{#openssl.client.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />支持的 OpenSSL 加密套件。

## openSSL.client.disableProtocols \{#openssl.client.disableprotocols\}

禁止使用的协议。

## openSSL.client.extendedVerification \{#openssl.client.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />如果启用，则验证证书的 CN 或 SAN 是否与对端的主机名一致。

## openSSL.client.fips \{#openssl.client.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />启用 OpenSSL FIPS 模式。仅当库所使用的 OpenSSL 版本支持 FIPS 时才受支持。

## openSSL.client.invalidCertificateHandler.name \{#openssl.client.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />用于验证无效证书的类（CertificateHandler 的子类）。例如：`<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`。

## openSSL.client.loadDefaultCAFile \{#openssl.client.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />决定是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定内置 CA 证书位于文件 `</etc/ssl/cert.pem>`（或目录 `</etc/ssl/certs>`）中，或者位于由环境变量 `<SSL_CERT_FILE>`（或 `<SSL_CERT_DIR>`）指定的文件（或目录）中。

## openSSL.client.preferServerCiphers \{#openssl.client.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />客户端是否优先采用服务器端的密码套件。

## openSSL.client.privateKeyFile \{#openssl.client.privatekeyfile\}

PEM 证书私钥文件的路径。该文件可以同时包含私钥和证书。

## openSSL.client.privateKeyPassphraseHandler.name \{#openssl.client.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />用于获取访问私钥所需口令的类（PrivateKeyPassphraseHandler 子类）。例如：`<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.client.requireTLSv1 \{#openssl.client.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />要求使用 TLSv1 连接。允许的取值：`<true>`、`<false>`。

## openSSL.client.requireTLSv1_1 \{#openssl.client.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />要求使用 TLSv1.1 协议的连接。可接受的取值：`<true>`、`<false>`。

## openSSL.client.requireTLSv1_2 \{#openssl.client.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />要求使用 TLSv1.2 连接。可接受的值：`<true>`、`<false>`。

## openSSL.client.verificationDepth \{#openssl.client.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />证书验证链的最大长度。如果证书链长度超过设置的值，则验证将失败。

## openSSL.client.verificationMode \{#openssl.client.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />用于验证节点证书的方式。详细信息参见 [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可选值：`<none>`、`<relaxed>`、`<strict>`、`<once>`。

## openSSL.server.caConfig \{#openssl.server.caconfig\}

包含受信任 CA 证书的文件或目录的路径。如果指向一个文件，则该文件必须是 PEM 格式，并且可以包含多个 CA 证书。如果指向一个目录，则该目录必须为每个 CA 证书包含一个 .pem 文件。文件名是根据 CA 主题名称的哈希值进行查找的。更多细节请参阅 [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/) 的 man 页面。

## openSSL.server.cacheSessions \{#openssl.server.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />启用或禁用会话缓存。必须与 `<sessionIdContext>` 配合使用。可接受的值：`<true>`、`<false>`。

## openSSL.server.certificateFile \{#openssl.server.certificatefile\}

PEM 格式的客户端或服务器证书文件路径。如果 `<privateKeyFile>` 中已包含证书，则可以省略。

## openSSL.server.cipherList \{#openssl.server.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />支持的 OpenSSL 加密算法。

## openSSL.server.disableProtocols \{#openssl.server.disableprotocols\}

禁止使用的协议。

## openSSL.server.extendedVerification \{#openssl.server.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />若启用，将验证证书的 CN 或 SAN 是否与对端主机名匹配。

## openSSL.server.fips \{#openssl.server.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />启用 OpenSSL 的 FIPS 模式。仅当该库所使用的 OpenSSL 版本支持 FIPS 时才受支持。

## openSSL.server.invalidCertificateHandler.name \{#openssl.server.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />用于验证无效证书的类（CertificateHandler 的子类）。例如：`<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`。

## openSSL.server.loadDefaultCAFile \{#openssl.server.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />决定是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定内置 CA 证书位于文件 `</etc/ssl/cert.pem>`（或目录 `</etc/ssl/certs>`）中，或者位于由环境变量 `<SSL_CERT_FILE>`（或 `<SSL_CERT_DIR>`）指定的文件（或目录）中。

## openSSL.server.preferServerCiphers \{#openssl.server.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />使用客户端偏好的服务器端加密套件。

## openSSL.server.privateKeyFile \{#openssl.server.privatekeyfile\}

PEM 证书私钥文件的路径。该文件可以同时包含私钥和证书。

## openSSL.server.privateKeyPassphraseHandler.name \{#openssl.server.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />用于请求输入访问私钥所需口令的类（PrivateKeyPassphraseHandler 子类）。例如：`<<privateKeyPassphraseHandler>>`、`<<name>KeyFileHandler</name>>`、`<<options><password>test</password></options>>`、`<</privateKeyPassphraseHandler>>`

## openSSL.server.requireTLSv1 \{#openssl.server.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />要求使用 TLSv1 连接。可选值：`<true>`、`<false>`。

## openSSL.server.requireTLSv1_1 \{#openssl.server.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />是否要求使用 TLSv1.1 连接。可接受的值：`<true>`、`<false>`。

## openSSL.server.requireTLSv1_2 \{#openssl.server.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />是否要求使用 TLSv1.2 连接。可接受的取值：`<true>`、`<false>`。

## openSSL.server.sessionCacheSize \{#openssl.server.sessioncachesize\}

<SettingsInfoBlock type="UInt64" default_value="20480" />服务器缓存的最大会话数。值为 0 表示会话数不受限制。

## openSSL.server.sessionIdContext \{#openssl.server.sessionidcontext\}

<SettingsInfoBlock type="String" default_value="application.name" />服务器附加到每个生成的会话标识符上的一组唯一随机字符。字符串长度不得超过 `<SSL_MAX_SSL_SESSION_ID_LENGTH>`。始终建议设置此参数，因为无论服务器是否缓存会话，还是客户端是否请求缓存，它都有助于避免相关问题。

## openSSL.server.sessionTimeout \{#openssl.server.sessiontimeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />会话在服务器端的缓存时长（以小时为单位）。

## openSSL.server.verificationDepth \{#openssl.server.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />验证链的最大长度。如果证书链的长度超过该值，则验证将失败。

## openSSL.server.verificationMode \{#openssl.server.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />用于校验节点证书的方法。详情参见 [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的说明。可选值：`<none>`、`<relaxed>`、`<strict>`、`<once>`。

## opentelemetry_span_log \{#opentelemetry_span_log\}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的设置。

<SystemLogParameters />

示例：

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```


## os_collect_psi_metrics \{#os_collect_psi_metrics\}

<SettingsInfoBlock type="Bool" default_value="1" />启用从 /proc/pressure/ 文件采集 PSI 指标。

## os_cpu_busy_time_threshold \{#os_cpu_busy_time_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />操作系统 CPU 忙碌时间（OSCPUVirtualTimeMicroseconds 指标）的阈值，单位为微秒。仅当忙碌时间超过该值时，才认为 CPU 在执行有用工作；如果忙碌时间低于该值，则不会认为 CPU 处于过载状态。

## os_threads_nice_value_distributed_cache_tcp_handler \{#os_threads_nice_value_distributed_cache_tcp_handler\}

<SettingsInfoBlock type="Int32" default_value="0" />

分布式缓存 TCP 处理器线程使用的 Linux nice 值。数值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则该设置不会生效（no-op）。

可选值范围：-20 到 19。

## os_threads_nice_value_merge_mutate \{#os_threads_nice_value_merge_mutate\}

<SettingsInfoBlock type="Int32" default_value="0" />

用于合并（merge）和变更（mutation）线程的 Linux nice 值。数值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不会生效。

可能的取值范围：-20 到 19。

## os_threads_nice_value_zookeeper_client_send_receive \{#os_threads_nice_value_zookeeper_client_send_receive\}

<SettingsInfoBlock type="Int32" default_value="0" />

ZooKeeper 客户端中用于发送和接收线程的 Linux nice 值。值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 能力，否则不会产生任何效果。

可能的取值范围：-20 到 19。

## page_cache_free_memory_ratio \{#page_cache_free_memory_ratio\}

<SettingsInfoBlock type="Double" default_value="0.15" />在用户态页缓存中预留为空闲的内存限制比例。类似于 Linux 的 min_free_kbytes 设置。

## page_cache_history_window_ms \{#page_cache_history_window_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />在释放的内存可以被用户空间页缓存重新使用前需要等待的延迟时间。

## page_cache_max_size \{#page_cache_max_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />用户态页面缓存的最大容量。设置为 0 可禁用该缓存。如果该值大于 page_cache_min_size，则缓存大小会在该范围内持续调整，在保持总内存使用量低于限制（max_server_memory_usage[_to_ram_ratio]）的前提下尽可能多地使用可用内存。

## page_cache_min_size \{#page_cache_min_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />用户态页缓存的最小大小。

## page_cache_policy \{#page_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />用户空间页缓存策略名称。

## page_cache_shards \{#page_cache_shards\}

<SettingsInfoBlock type="UInt64" default_value="4" />将用户态 page cache 拆分为相应数量的分片（shard），以减少互斥锁争用。属于实验性功能，一般不太可能带来性能提升。

## page_cache_size_ratio \{#page_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />用户态页面缓存中受保护队列的大小，占该缓存总大小的比例。

## part_log \{#part_log\}

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的日志事件，例如添加或合并数据。可以使用该日志来模拟合并算法并比较它们的特性，也可以将合并过程可视化。

查询会记录在 [system.part&#95;log](/operations/system-tables/part_log) 表中，而不是单独的文件中。可以在 `table` 参数中配置该表的名称（见下文）。

<SystemLogParameters />

**示例**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```


## parts_kill_delay_period \{#parts_kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

用于在 SharedMergeTree 中彻底移除分区片段的时间间隔。仅在 ClickHouse Cloud 中可用。

## parts_kill_delay_period_random_add \{#parts_kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

为 `kill_delay_period` 附加一个在 0 到 x 秒之间均匀分布的随机值，以避免在存在大量表的情况下产生“惊群效应”，从而对 ZooKeeper 造成后续 DoS 攻击。仅在 ClickHouse Cloud 中可用。

## parts_killer_pool_size \{#parts_killer_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />

用于清理共享 MergeTree 过期分区片段的线程数。仅在 ClickHouse Cloud 中可用。

## path \{#path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/" />

包含数据的目录的路径。

:::note
末尾的斜杠是必需的。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```


## path \{#path\}

包含数据的目录路径。

:::note
必须以斜杠结尾。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port \{#postgresql_port\}

用于与客户端通过 PostgreSQL 协议进行通信的端口。

:::note

* 正整数表示要监听的端口号。
* 为空时将禁用通过 PostgreSQL 协议与客户端的通信。
  :::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport \{#postgresql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为 true，则必须通过 [postgresql_port](/operations/server-configuration-parameters/settings#postgresql_port) 与客户端进行安全通信。带有 `<sslmode=disable>` 选项的连接将被拒绝。将其与 [OpenSSL](/operations/server-configuration-parameters/settings#openssl) 设置配合使用。

## postgresql_require_secure_transport \{#postgresql_require_secure_transport\}

当设置为 true 时，要求通过 [postgresql_port](#postgresql_port) 与客户端进行加密通信。带有 `sslmode=disable` 选项的连接将被拒绝。请结合 [OpenSSL](#openssl) 设置一起使用。

## prefetch_threadpool_pool_size \{#prefetch_threadpool_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />用于处理远程对象存储预取操作的后台线程池大小

## prefetch_threadpool_queue_size \{#prefetch_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入预取线程池的任务数量上限

## prefixes_deserialization_thread_pool_thread_pool_queue_size \{#prefixes_deserialization_thread_pool_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

前缀反序列化线程池中可调度的最大任务数。

:::note
值为 `0` 表示无限制。
:::

## prepare_system_log_tables_on_startup \{#prepare_system_log_tables_on_startup\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，ClickHouse 会在启动之前创建所有已配置的 `system.*_log` 表。如果某些启动脚本依赖这些表，这会很有用。

## primary_index_cache_policy \{#primary_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />主索引缓存策略的名称。

## primary_index_cache_prewarm_ratio \{#primary_index_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />预热期间要填充的 mark 缓存大小占其总大小的比例。

## primary_index_cache_size \{#primary_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />主键索引缓存的最大容量（MergeTree 系列表的主键索引）。

## primary_index_cache_size_ratio \{#primary_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在主索引缓存中，受保护队列的大小（在使用 SLRU 策略时）相对于缓存总大小的比例。

## process_query_plan_packet \{#process_query_plan_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

此设置允许读取 QueryPlan 数据包。该数据包在启用 `serialize_query_plan` 时会在分布式查询中发送。
为避免由于查询计划二进制反序列化中的缺陷而可能引发的安全问题，该设置默认禁用。

**示例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log \{#processors_profile_log\}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的设置。

<SystemLogParameters />

默认设置如下：

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```


## prometheus \{#prometheus\}

对 [Prometheus](https://prometheus.io) 暴露可供抓取的指标数据。

设置：

* `endpoint` – Prometheus 服务器用于抓取指标的 HTTP endpoint。必须以 &#39;/&#39; 开头。
* `port` – `endpoint` 使用的端口。
* `metrics` – 暴露来自 [system.metrics](/operations/system-tables/metrics) 表的指标。
* `events` – 暴露来自 [system.events](/operations/system-tables/events) 表的指标。
* `asynchronous_metrics` – 暴露来自 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表的当前指标值。
* `errors` - 暴露自上次服务器重启以来按错误代码统计的错误数量。该信息也可以从 [system.errors](/operations/system-tables/errors) 中获取。

**示例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

检查（将 `127.0.0.1` 替换为 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```


## prometheus.keeper_metrics_only \{#prometheus.keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />导出 keeper 相关的指标

## proxy \{#proxy\}

为 HTTP 和 HTTPS 请求定义代理服务器，目前 S3 存储、S3 表函数和 URL 函数均支持该设置。

有三种方式定义代理服务器：

* 环境变量
* 代理列表
* 远程代理解析器。

还可以使用 `no_proxy` 为特定主机绕过代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许你为给定协议指定
代理服务器。如果你已经在系统上进行了设置，它应当可以直接正常工作。

如果某个协议只有一个代理服务器，并且该代理服务器不会变更，这是最简单的方式。

**代理列表**

这种方式允许你为某个协议指定一个或多个
代理服务器。如果定义了多个代理服务器，
ClickHouse 会以轮询的方式使用不同的代理，从而在服务器之间平衡
负载。如果某个协议有多个代理服务器且代理服务器列表不会变化，这是最简单的方式。

**配置模板**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

在下方的选项卡中选择父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 字段        | 说明                |
    | --------- | ----------------- |
    | `<http>`  | 一个或多个 HTTP 代理的列表  |
    | `<https>` | 一个或多个 HTTPS 代理的列表 |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | 字段      | 说明      |
    | ------- | ------- |
    | `<uri>` | 代理的 URI |
  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态变化。在这种情况下，可以定义一个解析器的 endpoint。ClickHouse 会向该 endpoint 发送一个空的 GET 请求，远程解析器应返回代理主机名。ClickHouse 将使用该主机名按以下模板构造代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**配置模板**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

在下方选项卡中选择一个父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 字段        | 描述                  |
    | --------- | ------------------- |
    | `<http>`  | 一个或多个 resolver 的列表* |
    | `<https>` | 一个或多个 resolver 的列表* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | 字段           | 描述                    |
    | ------------ | --------------------- |
    | `<resolver>` | resolver 的端点及其他相关详细信息 |

    :::note
    可以包含多个 `<resolver>` 元素，但对于给定协议，只有第一个
    `<resolver>` 会被使用。该协议下的任何其他 `<resolver>`
    元素都会被忽略。这意味着（如有需要）负载均衡应由远端的 resolver 实现。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | 字段                   | 描述                                                                                                |
    | -------------------- | ------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | 代理 resolver 的 URI                                                                                 |
    | `<proxy_scheme>`     | 最终代理 URI 的协议，可以是 `http` 或 `https`。                                                                |
    | `<proxy_port>`       | 代理 resolver 的端口号                                                                                  |
    | `<proxy_cache_time>` | resolver 返回的值在 ClickHouse 中应被缓存的秒数。将此值设为 `0` 会使 ClickHouse 在每次 HTTP 或 HTTPS 请求时都向该 resolver 发起请求。 |
  </TabItem>
</Tabs>

**优先级**

代理设置的生效顺序如下：

| 顺序 | 设置            |
| -- | ------------- |
| 1. | 远程代理 resolver |
| 2. | 代理列表          |
| 3. | 环境变量          |


ClickHouse 会根据请求协议，先检查优先级最高的解析器类型。如果未定义，
则会依次检查下一个优先级的解析器类型，直到检查到 environment 解析器为止。
这也意味着可以混合使用不同类型的解析器。

## query_cache \{#query_cache\}

[查询缓存](../query-cache.md)的配置。

可用的配置项如下：

| Setting                   | Description                       | Default Value |
| ------------------------- | --------------------------------- | ------------- |
| `max_size_in_bytes`       | 缓存的最大容量（字节）。`0` 表示禁用查询缓存。         | `1073741824`  |
| `max_entries`             | 缓存中可存储的 `SELECT` 查询结果的最大数量。       | `1024`        |
| `max_entry_size_in_bytes` | 可保存到缓存中的 `SELECT` 查询结果在字节数上的最大大小。 | `1048576`     |
| `max_entry_size_in_rows`  | 可保存到缓存中的 `SELECT` 查询结果在行数上的最大行数。  | `30000000`    |

:::note

* 修改后的配置会立即生效。
* 查询缓存的数据分配在 DRAM 中。如果内存紧张，请确保为 `max_size_in_bytes` 设置较小的值，或者完全禁用查询缓存。
  :::

**示例**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```


## query_cache.max_entries \{#query_cache.max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1024" />缓存中可存储的 SELECT 查询结果的最大数量。

## query_cache.max_entry_size_in_bytes \{#query_cache.max_entry_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />可保存到缓存中的 SELECT 查询结果的最大大小（字节）。

## query_cache.max_entry_size_in_rows \{#query_cache.max_entry_size_in_rows\}

<SettingsInfoBlock type="UInt64" default_value="30000000" />可写入缓存的 SELECT 查询结果的最大行数。

## query_cache.max_size_in_bytes \{#query_cache.max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />最大缓存大小（字节）。0 表示禁用查询缓存。

## query_condition_cache_policy \{#query_condition_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />查询条件缓存策略的名称。

## query_condition_cache_size \{#query_condition_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

查询条件缓存的最大容量。
:::note
此设置可以在运行时修改，并会立即生效。
:::

## query_condition_cache_size_ratio \{#query_condition_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />查询条件缓存中受保护队列的大小（在采用 SLRU 策略时），相对于缓存总大小的比例。

## query_log \{#query_log\}

在启用 [log&#95;queries=1](../../operations/settings/settings.md) 设置时，用于记录接收到的查询。

查询会被写入 [system.query&#95;log](/operations/system-tables/query_log) 表中，而不是单独的文件。可以通过 `table` 参数（见下文）更改该表的名称。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在更新 ClickHouse 服务器时查询日志的结构发生了变化，旧结构的表会被重命名，并自动创建一个具有新结构的新表。

**示例**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```


## query_masking_rules \{#query_masking_rules\}

基于正则表达式的规则，在将查询以及所有日志消息写入服务器日志、
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表，以及发送给客户端的日志之前生效。这样可以防止 SQL 查询中的名称、电子邮件地址、个人身份标识符或信用卡号等敏感数据泄露到日志中。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置字段**：

| Setting   | Description              |
| --------- | ------------------------ |
| `name`    | 规则名称（可选）                 |
| `regexp`  | 兼容 RE2 的正则表达式（必需）        |
| `replace` | 用于敏感数据的替换字符串（可选，默认是六个星号） |

掩码规则会应用到整个查询（以防止格式错误/不可解析的查询中泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表中包含计数器 `QueryMaskingRulesMatch`，用于记录查询掩码规则命中的总次数。

对于分布式查询，每个服务器都必须单独配置，否则传递到其他节点的子查询将会在未掩码的情况下被存储。


## query_metric_log \{#query_metric_log\}

默认情况下处于禁用状态。

**启用**

要手动启用指标历史数据收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件，并写入以下内容：

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**禁用**

要禁用 `query_metric_log` 设置，应创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，其内容如下：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log \{#query_thread_log\}

用于记录在启用 [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 设置时接收的查询线程的日志。

查询会被记录到 [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) 表中，而不是单独的文件。你可以通过 `table` 参数更改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在升级 ClickHouse 服务器时查询线程日志的结构发生了变化，则会将旧结构的表重命名，并自动创建一个新表。

**示例**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```


## query_views_log \{#query_views_log\}

用于记录视图（live、materialized 等）日志的设置，其生效取决于接收到的启用了 [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 设置的查询。

查询会记录在 [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) 表中，而不是单独的文件中。可以通过 `table` 参数（见下文）更改该表的名称。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在 ClickHouse 服务器升级时查询视图日志的结构发生了变化，则旧结构的表会被重命名，并自动创建一个新表。

**示例**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```


## remap_executable \{#remap_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

用于使用 huge pages 为机器代码（&quot;text&quot; 段）重新映射内存的设置。

:::note
该功能目前处于高度实验性阶段。
:::

**示例**

```xml
<remap_executable>false</remap_executable>
```


## remap_executable \{#remap_executable\}

用于通过大页内存重新映射机器代码（“text”）所使用内存的设置。

:::note
此功能处于高度实验阶段。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```


## remote_servers \{#remote_servers\}

用于 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

关于 `incl` 属性的值，请参见“[Configuration files](/operations/configuration-files)”一节。

**另请参阅**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts \{#remote_url_allow_hosts\}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

在使用 `\<host\>` xml 标签添加主机时：

* 必须与 URL 中的写法完全一致，因为会在 DNS 解析之前检查名称。例如：`<host>clickhouse.com</host>`
* 如果在 URL 中显式指定了端口，则会将 host:port 作为整体进行检查。例如：`<host>clickhouse.com:80</host>`
* 如果主机未指定端口，则该主机上的任意端口都被允许。例如：如果指定了 `<host>clickhouse.com</host>`，则 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等都是允许的。
* 如果主机被指定为 IP 地址，则会按照 URL 中的写法进行检查。例如：`[2a02:6b8:a::a]`。
* 如果存在重定向且启用了重定向支持，则每一次重定向（Location 字段）都会被检查。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name \{#replica_group_name\}

用于 Replicated 数据库的副本组名称。

通过 Replicated 数据库创建的集群由同一组内的副本组成。
DDL 查询只会等待同一组内的副本完成。

默认为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />用于数据分片拉取请求的 HTTP 连接超时时间。如果未显式设置，则继承自默认 profile `http_connection_timeout`。

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />用于 fetch part 请求的 HTTP 接收超时时间。若未显式设置，则从默认 profile 的 `http_receive_timeout` 继承。

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="秒" default_value="0" />用于数据分片拉取请求的 HTTP 发送超时时间。若未显式设置，则继承默认配置档案 `http_send_timeout` 的值。

## replicated_merge_tree \{#replicated_merge_tree\}

用于对 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表进行微调的设置。此设置具有更高优先级。

更多信息请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads \{#restore_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />用于执行 RESTORE 请求的最大线程数。

## s3_credentials_provider_max_cache_size \{#s3_credentials_provider_max_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />可缓存的 S3 凭证提供者最大数量

## s3_max_redirects \{#s3_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />S3 重定向允许的最大跳转次数。

## s3_retry_attempts \{#s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="500" />用于 Aws::Client::RetryStrategy 的设置，Aws::Client 会自行执行重试；0 表示不进行重试

## s3queue_disable_streaming \{#s3queue_disable_streaming\}

<SettingsInfoBlock type="Bool" default_value="0" />即使已创建表并附加了物化视图，也在 S3Queue 中禁用流式处理。

## s3queue_log \{#s3queue_log\}

`s3queue_log` 系统表的相关设置。

<SystemLogParameters />

默认设置为：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send_crash_reports \{#send_crash_reports\}

用于配置向 ClickHouse 核心开发团队发送崩溃报告的相关设置。

尤其是在预生产环境中启用此功能，我们将深表感谢。

Keys:

| Key                   | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `enabled`             | 启用该功能的布尔标志，默认为 `true`。将其设置为 `false` 可避免发送崩溃报告。                                   |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，表示 ClickHouse 中的一个 bug。此布尔标志用于启用发送这类异常（默认值：`true`）。 |
| `endpoint`            | 可以覆盖用于发送崩溃报告的 endpoint URL。                                                      |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path \{#series_keeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Keeper 中的路径，其中包含由 `generateSerialID` FUNCTION 生成的自增编号。每个序列都会作为该路径下的一个节点。

## show_addresses_in_stack_traces \{#show_addresses_in_stack_traces\}

<SettingsInfoBlock type="Bool" default_value="1" />当设置为 true 时，将在堆栈跟踪中显示地址

## shutdown_wait_backups_and_restores \{#shutdown_wait_backups_and_restores\}

<SettingsInfoBlock type="Bool" default_value="1" />当设置为 true 时，ClickHouse 会在关闭前等待所有正在进行的备份和恢复操作完成。

## shutdown_wait_unfinished \{#shutdown_wait_unfinished\}

<SettingsInfoBlock type="UInt64" default_value="5" />等待未完成查询的时间（秒）

## shutdown_wait_unfinished_queries \{#shutdown_wait_unfinished_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />当设置为 true 时，ClickHouse 会在关闭前等待正在运行的查询完成。

## skip_binary_checksum_checks \{#skip_binary_checksum_checks\}

<SettingsInfoBlock type="Bool" default_value="0" />跳过对 ClickHouse 二进制文件的校验和完整性检查

## skip_check_for_incorrect_settings \{#skip_check_for_incorrect_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则不会检查服务器设置是否正确。

**示例**

```xml
<skip_check_for_incorrect_settings>1</skip_check_for_incorrect_settings>
```


## ssh_server \{#ssh_server\}

主机密钥的公钥部分将在首次连接时
被写入 SSH 客户端的 known&#95;hosts 文件中。

主机密钥配置默认处于未启用状态。
取消注释主机密钥配置，并提供对应 SSH 密钥的路径以启用它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms \{#startup_mv_delay_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />用于模拟物化视图创建延迟的调试用参数

## startup_scripts.throw_on_error \{#startup_scripts.throw_on_error\}

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为 true，则在脚本执行期间发生错误时，服务器将不会启动。

## storage_configuration \{#storage_configuration\}

支持多磁盘存储配置。

存储配置的结构如下：

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```


### 磁盘配置 \{#configuration-of-disks\}

`disks` 的配置遵循如下结构：

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

上述子标签为 `disks` 定义了以下设置：

| Setting                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `<disk_name_N>`         | 磁盘名称，必须唯一。                                    |
| `path`                  | 用于存储服务器数据（`data` 和 `shadow` 目录）的路径，应以 `/` 结尾。 |
| `keep_free_space_bytes` | 以字节为单位的磁盘预留空闲空间大小。                            |

:::note
磁盘的定义顺序无关紧要。
:::


### 策略配置 \{#configuration-of-policies\}

上述子标签为 `policies` 定义了以下设置：

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | 卷名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | 位于该卷中的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `max_data_part_size_bytes`   | 可以驻留在该卷任意磁盘上的数据分区片段的最大大小。如果一次合并后预计生成的分区片段大小会大于 `max_data_part_size_bytes`，则该分区片段会被写入下一个卷。该功能基本上允许先将新的 / 较小的分区片段存储在热（SSD）卷上，并在它们达到较大尺寸时将其移动到冷（HDD）卷。如果策略只有一个卷，请不要使用此选项。                                                                 |
| `move_factor`                | 卷上可用空闲空间的占比。当可用空闲空间低于该占比时，将开始向下一个卷（如果存在）迁移数据。迁移时，会按分区片段大小从大到小（降序）排序，并选择其总大小足以满足 `move_factor` 条件的分区片段；如果所有分区片段的总大小仍不足以满足条件，则会迁移所有分区片段。                                                                                                             |
| `perform_ttl_move_on_insert` | 禁用在插入时移动已过期生存时间 (TTL) 的数据。默认情况下（启用时），如果插入的数据片段已根据生存时间迁移规则过期，则会立即将其移动到该迁移规则中指定的卷 / 磁盘。如果目标卷 / 磁盘较慢（例如 S3），这可能会显著降低插入性能。如果禁用，则过期的数据部分会先写入默认卷，然后再根据过期生存时间 (TTL) 的规则立即移动到指定卷。 |
| `load_balancing`             | 磁盘负载均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `least_used_ttl_ms`          | 设置更新所有磁盘可用空间的超时时间（毫秒）（`0` 表示始终更新，`-1` 表示从不更新，默认值为 `60000`）。注意，如果磁盘仅由 ClickHouse 使用，并且不会进行在线的文件系统大小调整，可以使用值 `-1`。在所有其他情况下不推荐这样做，因为最终会导致空间分配不正确。                                                                                                                   |
| `prefer_not_to_merge`        | 禁用在该卷上合并数据分区片段。注意：这具有潜在危害，并可能导致性能下降。启用该设置时（不建议这样做），禁止在该卷上合并数据（这是不利的）。这使得可以控制 ClickHouse 如何与慢磁盘交互。我们建议完全不要使用此设置。                                                                                                                                                                                       |
| `volume_priority`            | 定义卷被填充的优先级（顺序）。值越小，优先级越高。该参数的取值必须为自然数，并且在 1 到 N 的范围内连续覆盖（N 为指定的最大参数值），中间不能有缺失。                                                                                                                                                                                                                                                               |

对于 `volume_priority`：

- 如果所有卷都有该参数，则按指定顺序确定优先级。
- 如果只有 _部分_ 卷有该参数，则未设置该参数的卷优先级最低。已设置该参数的卷按标签值确定优先级，其余卷之间的优先级由它们在配置文件中的描述顺序决定。
- 如果 _没有_ 卷设置该参数，则它们的顺序由配置文件中的描述顺序决定。
- 各卷的优先级可以不同。

## storage_connections_hard_limit \{#storage_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />当达到该限制时，在尝试创建时会抛出异常。将其设置为 0 可关闭硬性限制。该限制适用于存储连接数。

## storage_connections_soft_limit \{#storage_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />超过此限制的连接，其存活时间会显著缩短。该限制适用于存储连接。

## storage_connections_store_limit \{#storage_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />超过此限制的连接在使用后会被重置。将其设置为 0 可关闭连接缓存。该限制适用于存储引擎连接。

## storage_connections_warn_limit \{#storage_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />如果正在使用的连接数超过此限制，将在日志中记录警告信息。该限制适用于存储使用的连接。

## storage_metadata_write_full_object_key \{#storage_metadata_write_full_object_key\}

<SettingsInfoBlock type="Bool" default_value="1" />使用 VERSION_FULL_OBJECT_KEY 格式写入磁盘元数据文件。默认开启。该设置已弃用。

## storage_shared_set_join_use_inner_uuid \{#storage_shared_set_join_use_inner_uuid\}

<SettingsInfoBlock type="Bool" default_value="1" />启用后，在创建 SharedSet 和 SharedJoin 时会生成内部 UUID。仅适用于 ClickHouse Cloud。

## table_engines_require_grant \{#table_engines_require_grant\}

如果设置为 true，用户在使用特定引擎创建表时需要事先授予相应的权限，例如：`GRANT TABLE ENGINE ON TinyLog TO user`。

:::note
默认情况下，为了保持向后兼容性，使用特定表引擎创建表会忽略权限检查，不过你可以将此项设置为 true 来改变该行为。
:::

## tables_loader_background_pool_size \{#tables_loader_background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在后台线程池中执行异步加载任务的线程数量。后台线程池用于在服务器启动后，在没有查询等待该表时异步加载表。如果表很多，将后台线程池中的线程数保持在较低值可能更有利，这样可以为并发查询执行预留 CPU 资源。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::

## tables_loader_foreground_pool_size \{#tables_loader_foreground_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在前台线程池中执行加载任务的线程数。前台线程池用于在服务器开始监听端口之前同步加载表，以及加载需要等待完成的表。前台线程池优先级高于后台线程池。这意味着只要前台线程池中仍有任务在运行，后台线程池中就不会启动新的任务。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::

## tcp_close_connection_after_queries_num \{#tcp_close_connection_after_queries_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />在关闭连接之前，每个 TCP 连接允许的最大查询次数。设置为 0 表示不限制查询次数。

## tcp_close_connection_after_queries_seconds \{#tcp_close_connection_after_queries_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 连接在被关闭前的最大存续时间（秒）。设置为 0 表示连接存续时间不限。

## tcp_port \{#tcp_port\}

使用 TCP 协议与客户端通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure \{#tcp_port_secure\}

用于与客户端进行安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置配合使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port \{#tcp_ssh_port\}

SSH 服务器使用的端口，允许用户通过 PTY 使用嵌入式客户端以交互方式连接并执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache \{#temporary_data_in_cache\}

使用此选项时，临时数据将存储在指定磁盘的缓存中。
在本节中，应指定类型为 `cache` 的磁盘名称。
在这种情况下，缓存和临时数据将共享同一空间，并且在需要时可以通过淘汰磁盘缓存来为临时数据腾出空间。

:::note
只能使用以下选项之一来配置临时数据存储：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
:::

**示例**

`local_disk` 的缓存和临时数据都将存储在文件系统上的 `/tiny_local_cache` 中，由 `tiny_local_cache` 进行管理。

```xml
<clickhouse>
<storage_configuration>
<disks>
<local_disk>
<type>local</type>
<path>/local_disk/</path>
</local_disk>

<!-- highlight-start -->
<tiny_local_cache>
<type>cache</type>
<disk>local_disk</disk>
<path>/tiny_local_cache/</path>
<max_size_rows>10M</max_size_rows>
<max_file_segment_size>1M</max_file_segment_size>
<cache_on_write_operations>1</cache_on_write_operations>
</tiny_local_cache>
<!-- highlight-end -->
</disks>
</storage_configuration>

<!-- highlight-start -->
<temporary_data_in_cache>tiny_local_cache</temporary_data_in_cache>
<!-- highlight-end -->
</clickhouse>
```


## temporary_data_in_distributed_cache \{#temporary_data_in_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />将临时数据存储在分布式缓存中。

## text_index_dictionary_block_cache_max_entries \{#text_index_dictionary_block_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />文本索引字典块缓存的最大条目数量。设置为 0 表示禁用该缓存。

## text_index_dictionary_block_cache_policy \{#text_index_dictionary_block_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引字典块缓存策略的名称。

## text_index_dictionary_block_cache_size \{#text_index_dictionary_block_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />文本索引字典块缓存大小。0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_dictionary_block_cache_size_ratio \{#text_index_dictionary_block_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />文本索引字典块缓存中（采用 SLRU 策略时）受保护队列大小与该缓存总大小的比例。

## text_index_header_cache_max_entries \{#text_index_header_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="100000" />文本索引头缓存的大小（以条目数计）。值为 0 表示禁用。

## text_index_header_cache_policy \{#text_index_header_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引头部缓存策略的名称。

## text_index_header_cache_size \{#text_index_header_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />文本索引头缓存的大小。为 0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_header_cache_size_ratio \{#text_index_header_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />文本索引头部缓存中受保护队列（在使用 SLRU 策略时）的大小相对于缓存总大小的比例。

## text_index_postings_cache_max_entries \{#text_index_postings_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />文本索引倒排列表缓存的大小（按条目数计）。设置为 0 表示禁用。

## text_index_postings_cache_policy \{#text_index_postings_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引倒排列表缓存策略名称。

## text_index_postings_cache_size \{#text_index_postings_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="2147483648" />文本索引 posting 列表的缓存大小。0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_postings_cache_size_ratio \{#text_index_postings_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在文本索引 posting 列表缓存中（在使用 SLRU 策略时），受保护队列大小与缓存总大小的比例。

## text_log \{#text_log\}

用于配置 [text&#95;log](/operations/system-tables/text_log) 系统表以记录文本消息的相关设置。

<SystemLogParameters />

此外：

| Setting | Description                 | Default Value |
| ------- | --------------------------- | ------------- |
| `level` | 将被写入表中的最大消息级别（默认为 `Trace`）。 | `Trace`       |

**示例**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```


## thread_pool_queue_size \{#thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

可在全局线程池中调度的任务最大数量。增大队列大小会导致更高的内存占用。建议将此值设置为与 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) 相同。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size \{#threadpool_local_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />当 `local_filesystem_read_method = 'pread_threadpool'` 时，用于从本地文件系统读取数据的线程池中的线程数量。

## threadpool_local_fs_reader_queue_size \{#threadpool_local_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />用于从本地文件系统读取数据的线程池中可调度的最大作业数量。

## threadpool_remote_fs_reader_pool_size \{#threadpool_remote_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />当 `remote_filesystem_read_method = 'threadpool'` 时，用于从远程文件系统读取的线程池中的线程数量。

## threadpool_remote_fs_reader_queue_size \{#threadpool_remote_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />用于从远程文件系统读取的线程池中可调度任务的最大数量。

## threadpool_writer_pool_size \{#threadpool_writer_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />用于处理向对象存储发送写入请求的后台线程池大小

## threadpool_writer_queue_size \{#threadpool_writer_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />可推送到用于对象存储写请求的后台线程池中的最大任务数

## throw_on_unknown_workload \{#throw_on_unknown_workload\}

<SettingsInfoBlock type="Bool" default_value="0" />

定义在通过查询设置项 `workload` 访问未知 WORKLOAD 时的行为。

* 如果为 `true`，则对于尝试访问未知 WORKLOAD 的查询会抛出 RESOURCE&#95;ACCESS&#95;DENIED 异常。在建立 WORKLOAD 层级并包含 WORKLOAD default 之后，这对于强制所有查询都进行资源调度非常有用。
* 如果为 `false`（默认），则对 `workload` 设置项指向未知 WORKLOAD 的查询提供不受限的访问（不进行资源调度）。这在配置 WORKLOAD 层级且尚未添加 WORKLOAD default 之前非常重要。

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)


## timezone \{#timezone\}

服务器的时区设置。

指定为表示 UTC 时区或地理位置的 IANA 标识符（例如 Africa/Abidjan）。

在将 DateTime 字段以文本格式输出（打印到屏幕或写入文件）以及从字符串解析 DateTime 时，时区是 String 与 DateTime 格式之间进行转换所必需的。此外，对于处理时间和日期、且未在输入参数中显式指定时区的函数，也会使用该时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参阅**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp_path \{#tmp_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/tmp/" />

本地文件系统中用于存储处理大型查询时临时数据的路径。

:::note

* 配置临时数据存储时，这三个选项中只能选择一个：tmp&#95;path、tmp&#95;policy、temporary&#95;data&#95;in&#95;cache。
* 路径末尾的斜杠不可省略。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_path \{#tmp_path\}

用于在处理大查询时存储临时数据的本地文件系统路径。

:::note

* 配置临时数据存储时，这几个选项中只能使用一个：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
* 路径末尾必须带有斜杠。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy \{#tmp_policy\}

用于存放临时数据的存储策略。所有以 `tmp` 作为前缀的文件会在启动时被删除。

:::note
将对象存储用于 `tmp_policy` 时的建议：

* 在每台服务器上使用独立的 `bucket:path`
* 使用 `metadata_type=plain`
* 还可以为该 bucket 设置生存时间 (TTL)
  :::

:::note

* 只能使用以下一个选项来配置临时数据存储：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` 会被忽略。
* 策略必须且只能包含 *一个 volume（卷）*

更多信息请参阅 [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) 文档。
:::

**示例**

当 `/disk1` 已满时，临时数据将会存储到 `/disk2` 上。

```xml
<clickhouse>
<storage_configuration>
<disks>
<disk1>
<path>/disk1/</path>
</disk1>
<disk2>
<path>/disk2/</path>
</disk2>
</disks>

<policies>
<!-- highlight-start -->
<tmp_two_disks>
<volumes>
<main>
<disk>disk1</disk>
<disk>disk2</disk>
</main>
</volumes>
</tmp_two_disks>
<!-- highlight-end -->
</policies>
</storage_configuration>

<!-- highlight-start -->
<tmp_policy>tmp_two_disks</tmp_policy>
<!-- highlight-end -->
</clickhouse>
```


## top_level_domains_list \{#top_level_domains_list\}

定义要添加的自定义顶级域名列表，其中每个条目都采用格式 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参阅：

* 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 及其变体，
  该函数接受一个自定义 TLD 列表的名称，并返回域名中从顶级子域直至第一个重要子域在内的部分。


## top_level_domains_path \{#top_level_domains_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/top_level_domains/" />

包含顶级域名的目录。

**示例**

```xml
<top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path>
```


## total_memory_profiler_sample_max_allocation_size \{#total_memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />以概率 `total_memory_profiler_sample_probability` 收集大小小于或等于指定值的随机内存分配。0 表示禁用。你可能需要将 `max_untracked_memory` 设置为 0，才能使该阈值按预期生效。

## total_memory_profiler_sample_min_allocation_size \{#total_memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />以 `total_memory_profiler_sample_probability` 的概率收集大小大于或等于指定值的随机内存分配。0 表示禁用。可以将 'max_untracked_memory' 设置为 0，以便该阈值按预期生效。

## total_memory_profiler_step \{#total_memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="0" />每当服务器内存使用量（以字节计）超过下一个步长阈值时，内存分析器都会收集当前分配操作的堆栈跟踪。值为 0 表示禁用内存分析器。将该值设置为低于数兆字节会减慢服务器。

## total_memory_tracker_sample_probability \{#total_memory_tracker_sample_probability\}

<SettingsInfoBlock type="Double" default_value="0" />

允许随机采样内存分配和释放，并将这些事件按指定概率写入 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表中，此时 `trace_type` 等于 `MemorySample`。该概率作用于每一次内存分配或释放操作，而不考虑分配大小。注意，只有在未跟踪内存量超过未跟踪内存限制时才会进行采样（默认值为 `4` MiB）。如果降低 [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step)，则该未跟踪内存限制也会随之降低。可以将 `total_memory_profiler_step` 设置为 `1` 以获得更加精细的采样粒度。

Possible values:

- 正的双精度浮点数。
- `0` — 禁用向 `system.trace_log` 系统表写入随机内存分配和释放记录。

## trace_log \{#trace_log\}

[trace&#95;log](/operations/system-tables/trace_log) 系统表操作的相关设置。

<SystemLogParameters />

默认的服务器配置文件 `config.xml` 中包含以下设置部分：

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```


## uncompressed_cache_policy \{#uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />未压缩缓存策略的名称。

## uncompressed_cache_size \{#uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

用于 MergeTree 系列表引擎的未压缩数据的最大容量（以字节为单位）。

服务器使用一个共享缓存。内存在需要时按需分配。只有在启用 `use_uncompressed_cache` 选项时才会使用该缓存。

在某些情况下，对于非常短的查询，未压缩缓存更有优势。

:::note
值为 `0` 表示禁用。

此设置可以在运行时修改，并会立即生效。
:::

## uncompressed_cache_size_ratio \{#uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在未压缩缓存中（在采用 SLRU 策略时）受保护队列的大小，相对于该缓存总大小的比例。

## url_scheme_mappers \{#url_scheme_mappers\}

用于将缩写或符号形式的 URL 前缀映射为完整 URL 的配置。

示例：

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```


## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

在 ZooKeeper 中存储数据分区片段头信息的方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以通过以下方式指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分中进行全局设置**

ClickHouse 会对服务器上的所有表使用该设置。可以在任何时间更改此设置。现有表在设置更改后会改变其行为。

**为每个表单独设置**

在创建表时指定相应的[引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。已有表在设置了该参数后，其行为不会因全局设置的更改而改变。

**可能的取值**

- `0` — 关闭该功能。
- `1` — 打开该功能。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则[复制](../../engines/table-engines/mergetree-family/replication.md)表会使用单个 `znode` 以紧凑方式存储分区片段的头信息。如果表包含很多列，这种存储方式可以显著减少存储在 ZooKeeper 中的数据量。

:::note
在应用 `use_minimalistic_part_header_in_zookeeper = 1` 之后，不能将 ClickHouse 服务器降级到不支持该设置的版本。在集群中升级 ClickHouse 时需要格外小心。不要一次性升级所有服务器。更安全的做法是在测试环境中，或仅在集群中的少量服务器上先测试新的 ClickHouse 版本。

已经按该设置存储的数据分区片段头信息无法恢复到之前（非紧凑）的表示形式。
:::

## user_defined_executable_functions_config \{#user_defined_executable_functions_config\}

可执行用户自定义函数的配置文件路径。

路径：

* 指定绝对路径，或相对于服务器配置文件的路径。
* 路径可以包含通配符 * 和 ?。

另请参阅：

* “[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)”。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path \{#user_defined_path\}

存放用户自定义文件的目录。供 SQL 用户自定义函数 [SQL User Defined Functions](/sql-reference/functions/udf) 使用。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories \{#user_directories\}

包含以下设置的配置文件部分：

* 预定义用户配置文件的路径。
* 通过 SQL 命令创建的用户所在文件夹的路径。
* 通过 SQL 命令创建并在 ZooKeeper 中复制的用户节点路径。

如果配置了此部分，则不会使用 [users&#95;config](/operations/server-configuration-parameters/settings#users_config) 和 [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的项，项的顺序表示它们的优先级（越靠上的项优先级越高）。

**示例**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

用户、角色、行策略、配额和配置文件同样可以存储在 ZooKeeper 中：

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

你也可以定义 `memory` 节——表示只在内存中存储信息，不写入磁盘，以及 `ldap` 节——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为远程用户目录（用于那些未在本地定义的用户），请定义一个包含以下设置的 `ldap` 节：

| Setting  | Description                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| `server` | 在 `ldap_servers` 配置节中定义的 LDAP 服务器名称之一。此参数为必填项，且不能为空。                                                               |
| `roles`  | 包含本地定义角色列表的配置节，这些角色将被分配给从 LDAP 服务器检索到的每个用户。如果未指定任何角色，用户在完成认证后将无法执行任何操作。如果列出的任一角色在认证时尚未在本地定义，则认证尝试将失败，就像提供了错误的密码一样。 |

**示例**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```


## user_files_path \{#user_files_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_files/" />

用户文件所在的目录。用于表函数 [file()](/sql-reference/table-functions/file)、[fileCluster()](/sql-reference/table-functions/fileCluster)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_files_path \{#user_files_path\}

存放用户文件的目录，供表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md) 使用。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path \{#user_scripts_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_scripts/" />

存放用户脚本文件的目录。用于可执行用户自定义函数 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```


## user_scripts_path \{#user_scripts_path\}

包含用户脚本文件的目录。供 Executable 用户定义函数使用，参见 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认值：


## users_config \{#users_config\}

指向包含以下内容的文件的路径：

* 用户配置。
* 访问权限。
* 设置配置文件。
* 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information \{#validate_tcp_client_information\}

<SettingsInfoBlock type="Bool" default_value="0" />确定在接收到查询数据包时，是否启用客户端信息验证。

默认情况下，该值为 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries \{#vector_similarity_index_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />向量相似度索引缓存的大小（按条目数量计）。设置为 0 表示禁用。

## vector_similarity_index_cache_policy \{#vector_similarity_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />向量相似度索引缓存策略的名称。

## vector_similarity_index_cache_size \{#vector_similarity_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />向量相似度索引缓存的大小。为 0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## vector_similarity_index_cache_size_ratio \{#vector_similarity_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />在向量相似度索引缓存中，受保护队列（在使用 SLRU 策略时）的大小与该缓存总大小的比例。

## wait_dictionaries_load_at_startup \{#wait_dictionaries_load_at_startup\}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置用于指定在 `dictionaries_lazy_load` 为 `false` 时的行为。
（如果 `dictionaries_lazy_load` 为 `true`，此设置不会产生任何影响。）

如果 `wait_dictionaries_load_at_startup` 为 `false`，则服务器会在启动时开始加载所有字典，
并在加载的同时并行接受连接。
当某个字典在查询中首次被使用时，如果该字典尚未加载完成，则该查询会等待字典加载完成。
将 `wait_dictionaries_load_at_startup` 设置为 `false` 可以使 ClickHouse 启动得更快，但某些查询可能会执行得更慢
（因为它们必须等待某些字典加载完成）。

如果 `wait_dictionaries_load_at_startup` 为 `true`，则服务器在启动时会等待所有字典完成加载
（无论成功与否）之后才会接受任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path \{#workload_path\}

用作存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认情况下，使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**

* [工作负载层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload_zookeeper_path \{#workload_zookeeper_path\}

指向 ZooKeeper 节点的路径，用作所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的存储位置。为确保一致性，所有 SQL 定义都作为这个单一 znode 的值进行存储。默认情况下不会使用 ZooKeeper，而是将定义存储在[磁盘](#workload_path)上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**

* [工作负载层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper \{#zookeeper\}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表时会使用 ZooKeeper 存储副本的元数据。如果不使用复制表，则可以省略本节参数。

以下设置可以通过子标签进行配置：

| Setting                                    | Description                                                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定在尝试连接到 ZooKeeper 集群时节点的顺序。 |
| `session_timeout_ms`                       | 客户端会话的最大超时时间（毫秒）。                                                                                                                   |
| `operation_timeout_ms`                     | 单个操作的最大超时时间（毫秒）。                                                                                                                    |
| `root` (optional)                          | 作为 ClickHouse 服务器所使用各 znode 的根 znode。                                                                                               |
| `fallback_session_lifetime.min` (optional) | 当主节点不可用时（负载均衡），到回退节点的 ZooKeeper 会话的最小存活时间下限。以秒为单位设置。默认值：3 小时。                                                                       |
| `fallback_session_lifetime.max` (optional) | 当主节点不可用时（负载均衡），到回退节点的 ZooKeeper 会话的最大存活时间上限。以秒为单位设置。默认值：6 小时。                                                                       |
| `identity` (optional)                      | ZooKeeper 访问所请求 znode 所需的用户和密码。                                                                                                     |
| `use_compression` (optional)               | 如果设置为 true，则在 Keeper 协议中启用压缩。                                                                                                       |

还有一个可选的 `zookeeper_load_balancing` 设置，可用于选择 ZooKeeper 节点选择算法：

| Algorithm Name                  | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `random`                        | 随机选择一个 ZooKeeper 节点。                                |
| `in_order`                      | 选择第一个 ZooKeeper 节点，如果它不可用则选择第二个，依此类推。               |
| `nearest_hostname`              | 选择主机名与服务器主机名最相似的 ZooKeeper 节点，主机名按名称前缀进行比较。         |
| `hostname_levenshtein_distance` | 与 `nearest_hostname` 类似，但按 Levenshtein 距离方式比较主机名。   |
| `first_or_random`               | 选择第一个 ZooKeeper 节点，如果它不可用则从剩余的 ZooKeeper 节点中随机选择一个。 |
| `round_robin`                   | 选择第一个 ZooKeeper 节点，如果发生重连则选择下一个。                    |

**配置示例**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

* [复制](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)


## zookeeper_log \{#zookeeper_log\}

Settings for the [`zookeeper_log`](/operations/system-tables/zookeeper_log) system table.

The following settings can be configured by sub-tags:

<SystemLogParameters />

**Example**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
