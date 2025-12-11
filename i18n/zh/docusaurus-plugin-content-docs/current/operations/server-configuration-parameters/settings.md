---
description: '本节介绍服务器设置，即无法在会话或查询级别更改的设置。'
keywords: ['全局服务器设置']
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

# 服务器设置 {#server-settings}

本节介绍服务器设置。这些设置无法在会话级或查询级进行更改。

有关 ClickHouse 中配置文件的更多信息，请参阅 [“Configuration Files”](/operations/configuration-files)。

其他设置在 “[Settings](/operations/settings/overview)” 部分中有说明。
在学习这些设置之前，建议先阅读 [Configuration Files](/operations/configuration-files)
部分，并注意其中替换机制的用法（`incl` 和 `optional` 属性）。

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />在遇到 LOGICAL_ERROR 异常时使服务器崩溃。仅限专家使用。

## access&#95;control&#95;improvements {#access_control_improvements}

访问控制系统中可选改进相关的设置。

| Setting                                         | Description                                                                                                                                                                                                                                                                                  | Default |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 设置没有宽松 ROW POLICY 的用户是否仍然可以使用 `SELECT` 查询读取行。比如，如果有两个用户 A 和 B，并且只为 A 定义了 ROW POLICY，那么如果此设置为 true，用户 B 将看到所有行；如果此设置为 false，用户 B 将看不到任何行。                                                                                                                                                     | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 权限。                                                                                                                                                                                                                                                         | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要授予任何权限，或者是否可以由任意用户执行。如果设为 true，则此查询需要 `GRANT SELECT ON system.<table>`，与非 system 表相同。例外情况：少数 system 表（`tables`、`columns`、`databases`，以及一些常量表如 `one`、`contributors`）仍然对所有人可访问；并且如果授予了某个 `SHOW` 权限（例如 `SHOW USERS`），则对应的 system 表（即 `system.users`）将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要授予任何权限，或者是否可以由任意用户执行。如果设为 true，则此查询需要 `GRANT SELECT ON information_schema.<table>`，与普通表相同。                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 设置在某个 SETTINGS PROFILE 中为某个 setting 定义的约束，是否会取消该 setting 之前约束（在其他 profile 中定义）的效果，包括新约束未设置的字段。同时也会启用 `changeable_in_readonly` 约束类型。                                                                                                                                                          | `true`  |
| `table_engines_require_grant`                   | 设置使用特定表引擎创建表时是否需要权限。                                                                                                                                                                                                                                                                         | `false` |
| `role_cache_expiration_time_seconds`            | 设置某个角色自上次访问以来在 Role Cache 中可被缓存的秒数。                                                                                                                                                                                                                                                          | `600`   |

Example:

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

## access_control_path {#access_control_path} 

ClickHouse 服务器用于存储通过 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参阅**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />当 `groupArray` 中的数组元素数量超过最大限制时要执行的操作：抛出 `throw` 异常，或者丢弃（`discard`）多余的值

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray FUNCTION 的数组元素最大字节大小。该限制在序列化阶段进行检查，以避免状态过大。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

控制是否允许用户更改与不同功能层级相关的设置。

- `0` - 允许更改任何设置（experimental、beta、production）。
- `1` - 仅允许更改 beta 和 production 功能设置。对 experimental 设置的更改会被拒绝。
- `2` - 仅允许更改 production 设置。对 experimental 或 beta 设置的更改会被拒绝。

这等价于对所有 `EXPERIMENTAL` / `BETA` 功能添加只读 CONSTRAINT。

:::note
值为 `0` 表示所有设置都可以被更改。
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />启用或禁用 IMPERSONATE 功能（EXECUTE AS target_user）。

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

除非显式指定 &#39;IDENTIFIED WITH no&#95;password&#39;，否则禁止创建无密码用户。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow&#95;no&#95;password {#allow_no_password}

设置是否允许使用不安全的 `no_password` 密码类型。

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

设置是否允许使用不安全的明文密码类型。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />允许使用 jemalloc 管理内存。

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

允许用于 Iceberg 的磁盘列表

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />如果为 true，则在正常关闭时会刷新异步插入队列

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />在后台实际解析和插入数据所能使用的最大线程数。设置为 0 表示禁用异步插入模式

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

异步加载数据库和表。

* 如果为 `true`，在 ClickHouse 服务器启动后，所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的非系统数据库都会被异步加载。请参阅 `system.asynchronous_loader` 表，以及 `tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何试图访问尚未加载表的查询，都会等待该表完成启动。如果加载任务失败，查询会重新抛出错误（而不是在 `async_load_databases = false` 的情况下关闭整个服务器）。至少有一个查询正在等待的表会以更高优先级加载。对某个数据库执行的 DDL 查询会等待该数据库完成启动。同时也可以考虑通过 `max_waiting_queries` 限制等待中的查询总数。
* 如果为 `false`，服务器启动时会加载所有数据库。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```

## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

系统表的异步加载。如果 `system` 数据库中存在大量日志表和分区片段，则此设置会很有帮助。独立于 `async_load_databases` 设置。

* 如果设置为 `true`，则在 ClickHouse 服务器启动之后，所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的 system 数据库都将异步加载。参见 `system.asynchronous_loader` 表，以及 `tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何试图访问尚未加载的 system 表的查询，都将等待该表完成启动。至少被一个查询等待的表将以更高优先级加载。也可以考虑设置 `max_waiting_queries` 来限制等待查询的总数量。
* 如果设置为 `false`，system 数据库会在服务器启动前完成加载。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />用于更新高开销异步指标的时间间隔（以秒为单位）。

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

用于记录异步插入操作日志的 [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) 系统表的设置。

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

## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果在你的环境中该设置不是默认启用的，则可以根据 ClickHouse 的安装方式，按照下面的说明将其启用或禁用。

**启用**

要手动开启异步指标日志历史记录收集功能 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 文件，并写入以下内容：

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

要禁用 `asynchronous_metric_log` 设置，请创建文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />启用高开销异步指标的计算。

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />使异步指标仅统计 keeper 相关的指标。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />以秒为单位的异步指标更新周期。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

对通过代理连接的客户端，在身份验证时使用其源地址。

:::note
此设置应格外谨慎使用，因为转发地址很容易被伪造——接受此类身份验证的服务器不应被直接访问，而应只能通过受信任的代理进行访问。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />在后台执行 [Buffer 引擎表](/engines/table-engines/special/buffer) 刷新操作时可用的最大线程数。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />在后台对 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表执行各种操作（主要是垃圾回收）时可使用的最大线程数。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行分布式发送的最大线程数。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />在后台为 [*MergeTree 引擎](/engines/table-engines/mergetree-family) 表从其他副本获取数据分区片段时可使用的最大线程数。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

设置线程数量与可并发执行的后台合并（merges）和变更（mutations）操作数量之间的比例。

例如，如果该比例等于 2，且 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 被设置为 16，则 ClickHouse 可以并发执行 32 个后台合并。这之所以可行，是因为后台操作可以被挂起或延后执行。这样可以为较小的合并提供更高的执行优先级。

:::note
你只能在运行时增加该比例。要降低它，必须重启服务器。

与 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置项一样，为了向后兼容，可以从 `default` profile 应用 [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio)。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

用于为后台合并（merge）和变更（mutation）进行调度的策略。可选值为：`round_robin` 和 `shortest_task_first`。

用于选择下一个由后台线程池执行的合并或变更的算法。此策略可在运行时更改，而无需重启服务器。
可以通过 `default` profile 应用，以保持向后兼容性。

可能的取值：

- `round_robin` — 按轮询顺序执行每个并发合并和变更，以避免任务饥饿。较小的合并由于需要合并的块更少，会比大的合并更快完成。
- `shortest_task_first` — 始终优先执行较小的合并或变更。合并和变更会根据其合并后的结果大小分配优先级。结果较小的合并会被严格优先于较大的合并。该策略可确保以尽可能快的速度完成小型分区片段的合并，但在 INSERT 写入压力很大的分区中，可能导致大型合并长期得不到执行（出现无限期饥饿）。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行消息流相关后台任务的最大线程数。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于在后台将 MergeTree 引擎表的数据分区片段移动到其他磁盘或卷的最大线程数。

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

设置用于对 MergeTree 引擎表执行后台合并和变更操作的线程数量。

:::note

* 为了在 ClickHouse 服务器启动时保持向后兼容性，也可以在服务器启动时通过 `default` profile 配置来应用此设置。
* 在运行时，只能增加线程数量。
* 要减少线程数量，必须重启服务器。
* 通过调整此设置，可以管理 CPU 和磁盘负载。
  :::

:::danger
较小的池大小会使用更少的 CPU 和磁盘资源，但后台进程推进得更慢，最终可能会影响查询性能。
:::

在修改该设置之前，请同时查看相关的 MergeTree 设置，例如：

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**示例**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />线程池中可同时执行同一类型任务的线程最大比例。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />用于持续执行复制表、Kafka 流式处理以及 DNS 缓存更新等轻量级周期性操作所能使用的最大线程数。

## backup&#95;log {#backup_log}

用于记录 `BACKUP` 和 `RESTORE` 操作的 [backup&#95;log](../../operations/system-tables/backup_log.md) 系统表的设置。

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

## backup_threads {#backup_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />用于执行 `BACKUP` 请求的最大线程数。

## 备份 {#backups}

与备份相关的设置，在执行 [`BACKUP` 和 `RESTORE`](/operations/backup/overview) 语句时使用。

以下设置可以通过子标签进行配置：

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','确定是否允许在同一主机上并发运行多个备份操作。', 'true'),
    ('allow_concurrent_restores', 'Bool', '确定是否允许在同一主机上并发运行多个恢复操作。', 'true'),
    ('allowed_disk', 'String', '使用 `File()` 进行备份时要使用的磁盘。必须先设置此项才能使用 `File`。', ''),
    ('allowed_path', 'String', '使用 `File()` 进行备份时要使用的路径。必须先设置此项才能使用 `File`。', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', '在比较已收集的元数据后发现不一致时，在进入休眠前尝试收集元数据的次数。', '2'),
    ('collect_metadata_timeout', 'UInt64', '备份期间收集元数据的超时时间（毫秒）。', '600000'),
    ('compare_collected_metadata', 'Bool', '如果为 true，则将收集到的元数据与现有元数据进行比较，以确保它们在备份期间未发生更改。', 'true'),
    ('create_table_timeout', 'UInt64', '恢复期间创建表的超时时间（毫秒）。', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', '在协调备份/恢复过程中遇到版本错误后重试的最大尝试次数。', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最长休眠时间（毫秒）。', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', '在下一次尝试收集元数据之前的最短休眠时间（毫秒）。', '5000'),
    ('remove_backup_files_after_failure', 'Bool', '如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在失败前已复制到备份中的文件；否则将保留已复制的文件不变。', 'true'),
    ('sync_period_ms', 'UInt64', '协调备份/恢复的同步周期（毫秒）。', '5000'),
    ('test_inject_sleep', 'Bool', '测试相关的休眠设置。', 'false'),
    ('test_randomize_order', 'Bool', '如果为 true，则会随机化某些操作的顺序以用于测试。', 'false'),
    ('zookeeper_path', 'String', '使用 `ON CLUSTER` 子句时，在 ZooKeeper 中存储备份和恢复元数据的路径。', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                    | Default               |
| :-------------------------------------------------- | :----- | :------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 决定是否允许在同一主机上并发运行多个备份操作。                                        | `true`                |
| `allow_concurrent_restores`                         | Bool   | 决定是否允许在同一主机上并发运行多个恢复操作。                                        | `true`                |
| `allowed_disk`                                      | String | 使用 `File()` 时备份所用的磁盘。必须设置此设置才能使用 `File`。                       | ``                    |
| `allowed_path`                                      | String | 使用 `File()` 时备份所用的路径。必须设置此设置才能使用 `File`。                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 在比较已收集的元数据后发现不一致时，在进入休眠前尝试重新收集元数据的次数。                          | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 备份期间收集元数据的超时时间（毫秒）。                                            | `600000`              |
| `compare_collected_metadata`                        | Bool   | 若为 true，则将收集到的元数据与现有元数据进行比较，以确保它们在备份期间未发生更改。                   | `true`                |
| `create_table_timeout`                              | UInt64 | 恢复期间创建表的超时时间（毫秒）。                                              | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 在协调备份/恢复过程中遇到 bad version 错误后的最大重试次数。                          | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 在下一次尝试收集元数据之前的最大休眠时间（毫秒）。                                      | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 在下一次尝试收集元数据之前的最小休眠时间（毫秒）。                                      | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | 如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在失败前已复制到备份中的文件，否则将保留这些已复制的文件。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 协调备份/恢复的同步周期（毫秒）。                                              | `5000`                |
| `test_inject_sleep`                                 | Bool   | 用于测试的休眠注入控制。                                                   | `false`               |
| `test_randomize_order`                              | Bool   | 若为 true，则会为了测试目的随机化某些操作的执行顺序。                                  | `false`               |
| `zookeeper_path`                                    | String | 使用 `ON CLUSTER` 子句时，在 ZooKeeper 中存储备份和恢复元数据的路径。                | `/clickhouse/backups` |

该设置的默认配置如下：

```xml
<backups>
    ....
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

可调度到 Backups IO 线程池中的作业的最大数量。鉴于当前的 S3 备份逻辑，建议将此队列大小设置为无限制。

:::note
值为 `0`（默认）表示无限制。
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

`bcrypt_password` 认证类型的工作因子（work factor），该类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。
工作因子决定了计算哈希值以及验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于身份验证频率较高的应用，
请考虑采用其他身份验证方法，因为在较高工作因子下，
bcrypt 的计算开销会显著增加。
:::

## blob&#95;storage&#95;log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的相关设置。

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

## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

内置字典重新加载的时间间隔（秒）。

ClickHouse 每隔 x 秒会重新加载一次内置字典。这样可以在无需重启服务器的情况下“实时”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />将缓存大小设置为 RAM 的最大占比。可在低内存系统上减小缓存大小。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />用于测试。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

以秒为单位的时间间隔，在此期间服务器允许的最大内存使用量会根据 cgroups 中对应的阈值进行调整。

要禁用 cgroup 观察器，将该值设置为 `0`。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />设置用于[编译表达式](../../operations/caches.md)的缓存大小（以元素个数计）。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" /> 设置 [已编译表达式](../../operations/caches.md) 的缓存大小（以字节为单位）。

## compression {#compression}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果你刚开始使用 ClickHouse，我们建议不要修改该配置。
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
你可以配置多个 `<case>` 段。
:::

**满足条件时的操作**：

* 如果一个数据分片满足某个条件集，ClickHouse 使用指定的压缩方法。
* 如果一个数据分片满足多个条件集，ClickHouse 使用第一个匹配的条件集。

:::note
如果某个数据分片不满足任何条件，ClickHouse 使用 `lz4` 压缩。
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

## concurrent_threads_scheduler {#concurrent_threads_scheduler} 

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

由 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定的 CPU 插槽调度策略。该算法用于控制在受限数量的 CPU 插槽下，如何在并发查询之间进行分配。调度器可以在运行时更改，而无需重启服务器。

可能的取值：

- `round_robin` — 每个 `use_concurrency_control` = 1 的查询最多分配 `max_threads` 个 CPU 插槽，每个线程一个插槽。在发生竞争时，CPU 插槽按轮询方式（round-robin）分配给各个查询。注意，第一个插槽是无条件授予的，这在存在大量 `max_threads` = 1 的查询时，可能导致 `max_threads` 较大的查询受到不公平对待并产生更高的延迟。
- `fair_round_robin` — 每个 `use_concurrency_control` = 1 的查询最多分配 `max_threads - 1` 个 CPU 插槽。这是 `round_robin` 的一种变体，它不要求每个查询的第一个线程必须占用一个 CPU 插槽。这样，`max_threads` = 1 的查询不需要任何插槽，也就不会不公平地占用全部插槽。不会无条件授予任何插槽。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

允许用于运行所有查询的最大查询处理线程总数，不包括用于从远程服务器获取数据的线程。该值不是严格的硬限制。如果达到该限制，查询仍然至少会获得一个线程来运行。如果在执行期间有更多线程可用，查询可以按需扩展到期望的线程数。

:::note
值为 `0`（默认）表示无限制。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同，但按 CPU 核心数的比例来表示。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

ClickHouse 重新加载配置并检查是否存在新变更的时间间隔

## core&#95;dump {#core_dump}

配置 core dump 文件大小的软限制。

:::note
硬限制通过系统工具配置。
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## cpu&#95;slot&#95;preemption {#cpu_slot_preemption}

<SettingsInfoBlock type="Bool" default_value="0" />

定义如何在 CPU 资源（MASTER THREAD 和 WORKER THREAD）上进行工作负载调度。

* 如果为 `true`（推荐），计量基于实际消耗的 CPU 时间。会为相互竞争的工作负载分配公平数量的 CPU 时间。slot 会在有限的一段时间内被分配，到期后需要重新请求。在 CPU 资源过载时，请求 slot 可能会阻塞线程执行，即可能发生抢占。这能够保证 CPU 时间使用上的公平性。
* 如果为 `false`（默认），计量基于分配的 CPU slot 数量。会为相互竞争的工作负载分配公平数量的 CPU slot。线程启动时分配一个 slot，在线程执行期间持续持有，在线程结束执行时释放。用于执行查询的线程数只能从 1 增加到 `max_threads`，且不会减少。这种方式对长时间运行的查询更有利，但可能导致短查询出现 CPU 资源饥饿。

**Example**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

它定义了在抢占期间工作线程最多可以等待多少毫秒，即等待分配到另一个 CPU slot 的时间。超过该超时时间后，如果线程仍未能获取新的 CPU slot，则会退出，该查询会被动态缩减为更少数量的并发执行线程。注意主线程不会被缩减，但可能会被无限期抢占。只有在启用了 `cpu_slot_preemption` 且为 WORKER THREAD 定义了 CPU 资源时，此设置才有意义。

**示例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

该参数定义了线程在获取一个 CPU 插槽后到需要再次请求 CPU 插槽之前允许消耗的 CPU 纳秒数。仅当启用了 `cpu_slot_preemption` 且为 MASTER THREAD 或 WORKER THREAD 定义了 CPU 资源时才生效。

**示例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)

## crash&#95;log {#crash_log}

[crash&#95;log](../../operations/system-tables/crash_log.md) 系统表操作的相关设置。

以下设置可以通过子标签进行配置：

| Setting                            | Description                                                                                                       | Default             | Note                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------ |
| `database`                         | 数据库名称。                                                                                                            |                     |                                                                    |
| `table`                            | 系统表名称。                                                                                                            |                     |                                                                    |
| `engine`                           | 系统表的 [MergeTree 引擎定义](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。 |                     | 如果定义了 `partition_by` 或 `order_by`，则不能使用该参数。如果未指定，则默认选择 `MergeTree` |
| `partition_by`                     | 系统表的[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                                 |                     | 如果为系统表指定了 `engine`，则必须在 &#39;engine&#39; 内直接指定 `partition_by` 参数   |
| `ttl`                              | 指定表的[生存时间 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。                   |                     | 如果为系统表指定了 `engine`，则必须在 &#39;engine&#39; 内直接指定 `ttl` 参数            |
| `order_by`                         | 系统表的[自定义排序键](/engines/table-engines/mergetree-family/mergetree#order_by)。如果定义了 `engine`，则不能使用该参数。                 |                     | 如果为系统表指定了 `engine`，则必须在 &#39;engine&#39; 内直接指定 `order_by` 参数       |
| `storage_policy`                   | 表所使用的存储策略名称（可选）。                                                                                                  |                     | 如果为系统表指定了 `engine`，则必须在 &#39;engine&#39; 内直接指定 `storage_policy` 参数 |
| `settings`                         | 控制 MergeTree 行为的[附加参数](/engines/table-engines/mergetree-family/mergetree/#settings)（可选）。                          |                     | 如果为系统表指定了 `engine`，则必须在 &#39;engine&#39; 内直接指定 `settings` 参数       |
| `flush_interval_milliseconds`      | 将数据从内存缓冲区刷写到表的时间间隔。                                                                                               | `7500`              |                                                                    |
| `max_size_rows`                    | 日志的最大行数。当未刷新的日志数量达到 `max_size_rows` 时，日志会被写入磁盘。                                                                   | `1024`              |                                                                    |
| `reserved_size_rows`               | 为日志预分配的内存行数。                                                                                                      | `1024`              |                                                                    |
| `buffer_size_rows_flush_threshold` | 行数阈值。如果达到该阈值，则会在后台触发将日志刷写到磁盘。                                                                                     | `max_size_rows / 2` |                                                                    |
| `flush_on_crash`                   | 设置在发生崩溃时是否需要将日志写入磁盘。                                                                                              | `false`             |                                                                    |

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

## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

此设置用于指定自定义（通过 SQL 创建的）缓存磁盘的缓存路径。
对于自定义磁盘，`custom_cached_disks_base_directory` 的优先级高于 `filesystem_caches_path`（定义在 `filesystem_caches_path.xml` 中），
如果前者未配置，则会使用后者。
文件系统缓存的路径配置必须位于该目录之内，
否则将抛出异常，阻止磁盘被创建。

:::note
这不会影响在旧版本中已创建、且随后升级服务器时保留的磁盘。
在这种情况下，为了使服务器能够成功启动，将不会抛出异常。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。这些前缀必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参阅**

* [自定义设置](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />

在此延迟时间内，可以使用 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复已删除的表。如果 `DROP TABLE` 使用 `SYNC` 修饰符运行，则该设置将被忽略。
此设置的默认值为 `480`（8 分钟）。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />如果删除表失败，ClickHouse 会在等待该超时时间后重新尝试该操作。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行删除表操作的线程池大小。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

用于清理 `store/` 目录中无用数据的任务参数。
设置该任务的调度周期。

:::note
值为 `0` 表示“从不”。默认值对应 1 天。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

用于清理 `store/` 目录中无用数据的任务参数。
如果某个子目录未被 clickhouse-server 使用，且该目录在过去
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒内未被修改，则该任务会通过
移除所有访问权限来“隐藏”该目录。对于 clickhouse-server 不期望出现在 `store/` 内的目录，同样适用。

:::note
取值为 `0` 表示“立即”。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

用于控制清理 `store/` 目录中垃圾任务的参数。
如果某个子目录未被 clickhouse-server 使用，并且之前已被“隐藏”
（参见 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)），
且该目录在最近
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改，则该任务会删除此目录。
这同样适用于 clickhouse-server 不期望在 `store/` 中看到的目录。

:::note
取值为 `0` 表示“从不删除”。默认值对应 30 天。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />允许在 Replicated 数据库中永久分离（detach）表

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />将 Replicated 数据库中出现的非预期表直接删除，而不是将它们移动到单独的本地数据库中

## dead&#95;letter&#95;queue {#dead_letter_queue}

&#39;dead&#95;letter&#95;queue&#39; 系统表的设置。

<SystemLogParameters />

默认设置如下：

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```

## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />默认数据库名称。

## default&#95;password&#95;type {#default_password_type}

设置在 `CREATE USER u IDENTIFIED BY 'p'` 这类查询中自动使用的密码类型。

可接受的值为：

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## default&#95;profile {#default_profile}

默认的 SETTINGS PROFILE。SETTINGS PROFILE 位于由 `user_config` SETTING 指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```

## default&#95;replica&#95;name {#default_replica_name}

<SettingsInfoBlock type="String" default_value="{replica}" />

ZooKeeper 中的副本名称。

**示例**

```xml
<default_replica_name>{replica}</default_replica_name>
```

## default&#95;replica&#95;path {#default_replica_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

ZooKeeper 中表的路径。

**示例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```

## default&#95;session&#95;timeout {#default_session_timeout}

默认会话超时时长，单位为秒。

```xml
<default_session_timeout>60</default_session_timeout>
```

## dictionaries&#95;config {#dictionaries_config}

字典配置文件的路径。

路径：

* 指定绝对路径或相对于服务器配置文件的相对路径。
* 路径中可以包含通配符 * 和 ?。

另请参阅：

* “[Dictionaries](../../sql-reference/dictionaries/index.md)”。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

按需（惰性）加载字典。

* 如果为 `true`，则每个字典在首次使用时才会加载。如果加载失败，使用该字典的函数会抛出异常。
* 如果为 `false`，则服务器会在启动时加载所有字典。

:::note
服务器在启动时会等待所有字典加载完成之后，才会开始接收任何连接
（例外情况：如果 [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) 被设置为 `false`）。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />启用 `background_reconnect` 时，对失败的 MySQL 和 Postgres 字典进行重连尝试的时间间隔（毫秒）。

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

禁用 insert/alter/delete 查询。如果需要将某些节点设置为只读，以避免插入和变更操作影响读取性能，可以启用此设置。即使启用了此设置，仍然允许向外部引擎（S3、DataLake、MySQL、PostrgeSQL、Kafka 等）执行插入操作。

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />禁用内部 DNS 缓存。建议在基础设施经常变动的系统（例如 Kubernetes）中运行 ClickHouse 时禁用该选项。

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，会使用隧道（即 `HTTP CONNECT`）通过 `HTTP` 代理发送 `HTTPS` 请求。可以通过此设置将其禁用。

**no&#95;proxy**

默认情况下，所有请求都会通过代理。若要对特定主机禁用代理，必须设置 `no_proxy` 变量。
它可以在 list 和 remote 解析器的 `<proxy>` 子句中设置，也可以作为 environment 解析器的环境变量来设置。
它支持 IP 地址、域名、子域名，以及用于完全跳过代理的 `'*'` 通配符。前导点会被去除，其行为与 curl 相同。

**Example**

下面的配置会绕过对 `clickhouse.cloud` 及其所有子域名（例如 `auth.clickhouse.cloud`）的代理请求。
对于 GitLab 也是同样的效果，即使它带有前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

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

## disk_connections_hard_limit {#disk_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />如果在创建时达到此限制，将会抛出异常。将其设为 0 可关闭硬性限制。该限制适用于磁盘连接数。

## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />超过此限制的连接，其存活时间会显著缩短。该限制适用于磁盘连接。

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />超过该上限的连接在使用后会被重置。将其设置为 0 可关闭连接缓存。该限制适用于磁盘连接。

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="8000" />如果正在使用的连接数超过该限制，将在日志中记录警告信息。该限制适用于磁盘连接。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在针对表、数据库、表函数和字典执行的 `SHOW` 和 `SELECT` 查询结果中显示机密信息。

希望查看机密信息的用户还必须启用
[`format_display_secrets_in_show_and_select` 格式设置](../settings/formats#format_display_secrets_in_show_and_select)
并具备
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的取值：

- `0` — 禁用。
- `1` — 启用。

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />缓存服务器是否应应用客户端传来的限流设置。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分布式缓存尝试保持的空闲连接数量的软限制。当空闲连接数低于 distributed_cache_keep_up_free_connections_ratio * max_connections 时，将关闭空闲时间最长的连接，直到空闲连接数重新高于该限制。

## distributed&#95;ddl {#distributed_ddl}

在集群上管理执行[分布式 DDL 查询](../../sql-reference/distributed-ddl.md)（`CREATE`、`DROP`、`ALTER`、`RENAME`）。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时生效。

`<distributed_ddl>` 中可配置的参数包括：

| Setting                | Description                                            | Default Value             |
| ---------------------- | ------------------------------------------------------ | ------------------------- |
| `path`                 | Keeper 中用于 DDL 查询 `task_queue` 的路径                     |                           |
| `profile`              | 执行 DDL 查询所使用的 profile                                  |                           |
| `pool_size`            | 可以同时运行的 `ON CLUSTER` 查询数量                              |                           |
| `max_tasks_in_queue`   | 队列中允许存在的最大任务数量                                         | `1,000`                   |
| `task_max_lifetime`    | 如果节点存在时间超过该值，则将其删除                                     | `7 * 24 * 60 * 60`（一周的秒数） |
| `cleanup_delay_period` | 收到新节点事件后，如果自上次清理以来已过去至少 `cleanup_delay_period` 秒，则开始清理 | `60` 秒                    |

**示例**

```xml
<distributed_ddl>
    <!-- ZooKeeper 中 DDL 查询队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 执行 DDL 查询时将使用此配置文件中的设置 -->
    <profile>default</profile>

    <!-- 控制可同时运行的 ON CLUSTER 查询数量 -->
    <pool_size>1</pool_size>

    <!--
         清理设置(活动任务不会被删除)
    -->

    <!-- 控制任务生存时间 (TTL)(默认为 1 周) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理执行频率(单位:秒) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可容纳的任务数量 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />如果启用，`ON CLUSTER` 查询将在远程分片上保留并使用发起查询的用户及其角色来执行。这样可确保整个集群内访问控制的一致性，但要求该用户及其角色在所有节点上都已存在。

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />允许将主机名解析为 IPv4 地址。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />允许将主机名解析为 IPv6 地址。

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS 缓存的最大条目数。

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS 缓存的更新周期（以秒为单位）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />在将主机名从 ClickHouse 的 DNS 缓存中移除之前，该主机名允许发生的连续 DNS 解析失败的最大次数。

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于删除分布式缓存的线程池的大小。

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />用于清理分布式缓存的线程池的队列大小。

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />启用 Azure SDK 的日志记录功能

## encryption {#encryption}

配置用于获取密钥的命令，该密钥将被 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 使用。密钥（或多个密钥）应通过环境变量提供，或在配置文件中进行设置。

密钥可以是十六进制格式，或者是长度为 16 字节的字符串。

**示例**

从配置文件加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥，这样不安全。你可以将密钥移到安全磁盘上的单独配置文件中，并在 `config.d/` 文件夹中为该配置文件创建一个符号链接。
:::

当密钥为十六进制格式时，从配置中加载：

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

在此，`current_key_id` 用于设置加密所用的当前密钥，而所有指定的密钥都可用于解密。

以下这些方法都可以用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 表示当前用于加密的密钥。

此外，用户可以添加长度必须为 12 字节的 nonce（默认情况下，加密和解密过程使用由零字节构成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

也可以设置为十六进制：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
上面提到的所有内容同样适用于 `aes_256_gcm_siv`（但密钥长度必须为 32 字节）。
:::

## error&#95;log {#error_log}

默认情况下处于禁用状态。

**启用**

要手动启用错误历史记录收集功能 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml` 文件，并写入以下内容：

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

要禁用 `error_log` 设置，你需要创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

在用于解析输入的线程池队列中可排队的任务的最大数量。

:::note
值为 `0` 表示无限制。
:::

## format&#95;schema&#95;path {#format_schema_path}

输入数据 schema 所在目录的路径，例如 [CapnProto](/interfaces/formats/CapnProto) 格式的 schema 目录。

**示例**

```xml
<!-- 包含各种输入格式架构文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />全局分析器的 CPU 时钟计时器周期（单位为纳秒）。将该值设置为 0 可关闭 CPU 时钟全局分析器。对于单个查询，推荐值至少为 10000000（每秒 100 次）；对于集群范围的分析，则推荐 1000000000（每秒一次）。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />全局 profiler 的实时时钟计时器周期（单位：纳秒）。将该值设置为 0 可关闭实时时钟全局 profiler。推荐值：单个查询至少使用 10000000（每秒 100 次），集群范围 profiling 使用 1000000000（每秒 1 次）。

## google&#95;protos&#95;path {#google_protos_path}

定义一个目录，用于存放 Protobuf 类型的 proto 文件。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## graphite {#graphite}

向 [Graphite](https://github.com/graphite-project) 发送数据。

设置：

* `host` – Graphite 服务器。
* `port` – Graphite 服务器上的端口。
* `interval` – 发送间隔（秒）。
* `timeout` – 发送数据的超时时间（秒）。
* `root_path` – 键的前缀。
* `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
* `events` – 从 [system.events](/operations/system-tables/events) 表发送在指定时间段内累积的增量数据。
* `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
* `asynchronous_metrics` – 从 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

可以配置多个 `<graphite>` 配置块。例如，可以使用它以不同的时间间隔发送不同的数据。

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

## graphite&#95;rollup {#graphite_rollup}

用于对 Graphite 数据进行降采样（汇总）的设置。

更多详情，参见 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

## hsts&#95;max&#95;age {#hsts_max_age}

HSTS 的有效期（以秒为单位）。

:::note
值为 `0` 表示 ClickHouse 将禁用 HSTS。若设置为正数，则会启用 HSTS，且 `max-age` 即为你设置的数值。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## http_connections_hard_limit {#http_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />当达到此限制时，尝试创建新的 http 连接会抛出异常。将其设置为 0 可关闭此硬限制。该限制适用于不属于任何磁盘或存储的 http 连接。

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />超过此限制的连接其存活时间会明显缩短。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />超过此限制的连接在使用后将会被重置。将其设置为 0 可关闭连接缓存。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />如果正在使用的连接数超过此限制，将把警告消息写入日志。该限制适用于不属于任何磁盘或存储的 HTTP 连接。

## http&#95;handlers {#http_handlers}

允许使用自定义 HTTP 处理器。
要添加新的 HTTP 处理器，只需添加一个新的 `<rule>`。
规则会按照定义的顺序自上而下进行检查，
第一个匹配项会运行对应的处理器。

以下设置可以通过子标签进行配置：

| Sub-tags             | Definition                                                              |
| -------------------- | ----------------------------------------------------------------------- |
| `url`                | 用于匹配请求 URL，可以使用前缀 &#39;regex:&#39; 进行正则匹配（可选）                           |
| `methods`            | 用于匹配请求方法，可以使用逗号分隔多个要匹配的方法（可选）                                           |
| `headers`            | 用于匹配请求头，对每个子元素进行匹配（子元素名称为 header 名称），可以使用前缀 &#39;regex:&#39; 进行正则匹配（可选） |
| `handler`            | 请求处理器                                                                   |
| `empty_query_string` | 检查 URL 中是否没有查询字符串                                                       |

`handler` 包含以下设置，这些设置可以通过子标签进行配置：

| Sub-tags           | Definition                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `url`              | 重定向目标地址                                                                                        |
| `type`             | 支持的类型：static、dynamic&#95;query&#95;handler、predefined&#95;query&#95;handler、redirect           |
| `status`           | 与 static 类型一起使用，响应状态码                                                                          |
| `query_param_name` | 与 dynamic&#95;query&#95;handler 类型一起使用，从 HTTP 请求参数中提取并执行与 `<query_param_name>` 对应的参数值          |
| `query`            | 与 predefined&#95;query&#95;handler 类型一起使用，在处理器被调用时执行查询                                         |
| `content_type`     | 与 static 类型一起使用，响应的 content-type                                                               |
| `response_content` | 与 static 类型一起使用，发送给客户端的响应内容；当使用前缀 &#39;file://&#39; 或 &#39;config://&#39; 时，从文件或配置中读取内容并发送给客户端 |

除了规则列表以外，你还可以指定 `<defaults/>`，用于启用所有默认处理器。

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

## http&#95;options&#95;response {#http_options_response}

用于在 `OPTIONS` HTTP 请求的响应中添加响应头。
`OPTIONS` 方法用于发起 CORS 预检请求。

更多信息，参见 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

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

## http&#95;server&#95;default&#95;response {#http_server_default_response}

当你访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 “Ok.”（末尾带有换行符）

**示例**

当访问 `http://localhost: http_port` 时，将打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Iceberg catalog 的后台线程池大小

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入 Iceberg catalog 线程池队列中的任务数量上限

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />iceberg 元数据文件缓存中允许的最大条目数。0 表示禁用。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Iceberg 元数据文件缓存策略名称。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />iceberg 元数据缓存的最大容量（字节）。设为 0 表示禁用。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />表示在使用 SLRU 策略时，iceberg 元数据缓存中受保护队列大小相对于缓存总大小的比例。

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

如果设置为 true，ClickHouse 不会为 `CREATE VIEW` 查询中空的 SQL SECURITY 子句写入默认值。

:::note
此设置仅在迁移期间需要，并将在 24.4 版本中被废弃。
:::

## include&#95;from {#include_from}

包含替换项的文件路径。支持 XML 和 YAML 两种格式。

有关更多信息，请参阅“[配置文件](/operations/configuration-files)”章节。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引标记缓存策略的名称。

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

索引标记缓存的最大容量。

:::note

值为 `0` 表示禁用。

此设置可以在运行时修改，并会立即生效。
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />在二级索引标记缓存中，受保护队列（在使用 SLRU 策略时）的大小相对于缓存总大小的比例。

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引未压缩缓存策略的名称。

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

未压缩 `MergeTree` 索引数据块缓存的最大容量。

:::note
值为 `0` 表示禁用。

此设置可以在运行时修改，并会立即生效。
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />二级索引未压缩缓存中受保护队列（在使用 SLRU 策略时）的大小占该缓存总大小的比例。

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

在[复制](../../engines/table-engines/mergetree-family/replication.md)期间用于连接其他服务器的用户名和密码。此外，服务器还会使用这些凭证对其他副本进行身份验证。
因此，一个集群中所有副本的 `interserver_http_credentials` 必须相同。

:::note

* 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制过程中不使用身份验证。
* `interserver_http_credentials` 设置与 ClickHouse 客户端凭证的[配置](../../interfaces/cli.md#configuration_files)无关。
* 这些凭证在通过 `HTTP` 和 `HTTPS` 进行复制时通用。
  :::

可以通过子标签配置以下设置：

* `user` — 用户名。
* `password` — 密码。
* `allow_empty` — 如果为 `true`，则即使设置了凭证，也允许其他副本在没有身份验证的情况下进行连接。如果为 `false`，则拒绝未进行身份验证的连接。默认值：`false`。
* `old` — 包含在凭证轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭证轮换**

ClickHouse 支持在无需同时停止所有副本来更新其配置的情况下，动态轮换 interserver 凭证。可以通过多个步骤更改凭证。

要启用身份验证，请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭证。这样既允许带身份验证的连接，也允许不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置完所有副本之后，将 `allow_empty` 设置为 `false`，或者删除该 setting。这样会强制必须使用新凭证进行身份验证。

要更改现有凭证，请将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时，服务器会使用新凭证连接到其他副本，同时接受使用新旧凭证进行的连接。

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

## interserver&#95;http&#95;host {#interserver_http_host}

可被其他服务器用来访问本服务器的主机名。

如果未设置，则与执行 `hostname -f` 命令得到的主机名相同。

有助于取消对特定网络接口的依赖。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver&#95;http&#95;port {#interserver_http_port}

用于 ClickHouse 服务器之间数据交换的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```

## interserver&#95;https&#95;host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host)，但该主机名可以被其他服务器用于通过 `HTTPS` 访问本服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

用于在 ClickHouse 服务器之间通过 `HTTPS` 协议交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

限制可在 ClickHouse 服务器之间交换数据的主机。
如果使用 Keeper，该限制同样适用于不同 Keeper 实例之间的通信。

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

## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

可在 IO 线程池中调度的任务的最大数量。

:::note
值为 `0` 表示无限制。
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />在 system.trace_log 中存储 jemalloc 的采样内存分配记录

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />启用 jemalloc 后台线程。Jemalloc 使用后台线程清理空闲内存页。禁用该功能可能会导致性能下降。

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />为所有线程启用 jemalloc 的分配分析器。Jemalloc 将对内存分配进行采样，并对已采样分配的所有释放操作进行采样。
可以使用 SYSTEM JEMALLOC FLUSH PROFILE 刷新分析数据，用于分配分析。
采样数据也可以通过配置项 jemalloc_collect_global_profile_samples_in_trace_log，或通过查询设置 jemalloc_collect_profile_samples_in_trace_log 存储到 system.trace_log 中。
参见 [Allocation Profiling](/operations/allocation-profiling)

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />当全局峰值内存使用量相较之前增加了 jemalloc_flush_profile_interval_bytes 后，将执行一次 jemalloc profile 刷新操作

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />在发生总内存超限错误时将刷新 jemalloc profile

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />要创建的 jemalloc 后台线程数上限，将其设为 0 以使用 jemalloc 的默认值

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

ClickHouse 在关闭连接之前，等待 HTTP 协议传入请求的时间（以秒为单位）。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```

## keeper_hosts {#keeper_hosts} 

动态设置。包含 ClickHouse 可能连接的一组 [Zoo]Keeper 主机。不会暴露 `<auxiliary_zookeepers>` 中的信息。

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

针对支持批处理的 [Zoo]Keeper 的 MultiRead 请求的最大单次批量大小。若设置为 0，则禁用批处理。仅在 ClickHouse Cloud 中可用。

## ldap_servers {#ldap_servers} 

在此列出 LDAP 服务器及其连接参数，以便：

- 将其用作特定本地用户的认证服务，这些用户的认证机制配置为 `ldap` 而不是 `password`
- 将其用作远程用户目录。

可以通过子标签配置以下设置：

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器主机名或 IP，此参数为必填项且不能为空。                                                                                                                                                                                                                                                                                                                                                             |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认值为 636，否则为 `389`。                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                      | 用于构造绑定 DN 的模板。最终 DN 会在每次认证尝试时，将模板中所有 `\{user_name\}` 子串替换为实际用户名后构造而成。                                                                                                                                                                                                                                                                                               |
| `user_dn_detection`            | 用于检测绑定用户实际用户 DN 的 LDAP 搜索参数部分。当服务器为 Active Directory 时，主要在搜索过滤器中用于后续角色映射。最终的用户 DN 会在允许的地方用于替换 `\{user_dn\}` 子串。默认情况下，用户 DN 被设置为等于 bind DN，但一旦执行搜索后，会更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 在成功绑定尝试之后的一段时间（以秒为单位），在此期间将假定用户对所有连续请求都已成功认证，而无需联系 LDAP 服务器。指定 `0`（默认值）可禁用缓存，并在每次认证请求时都强制联系 LDAP 服务器。                                                                                                                  |
| `enable_tls`                   | 控制是否使用到 LDAP 服务器的安全连接的标志。指定 `no` 以使用明文（`ldap://`）协议（不推荐）。指定 `yes` 以使用基于 SSL/TLS 的 LDAP（`ldaps://`）协议（推荐，默认值）。指定 `starttls` 以使用传统的 StartTLS 协议（明文 `ldap://` 协议，再升级为 TLS）。                                                                                                               |
| `tls_minimum_protocol_version` | SSL/TLS 的最小协议版本。可接受的值为：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认值）。                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`             | SSL/TLS 对端证书验证行为。可接受的值为：`never`、`allow`、`try`、`demand`（默认值）。                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                | 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                 | 证书密钥文件路径。                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | CA 证书文件路径。                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | 允许的密码套件（OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                                              |

`user_dn_detection` 设置可以通过子标签进行配置：

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | 用于构造 LDAP 搜索基准 DN 的模板。最终 DN 会在 LDAP 搜索期间，将模板中所有 `\{user_name\}` 和 `\{bind_dn\}` 子串替换为实际用户名和 bind DN 后构造而成。                                                                                                       |
| `scope`         | LDAP 搜索的范围。可接受的值为：`base`、`one_level`、`children`、`subtree`（默认值）。                                                                                                                                                                                                                                       |
| `search_filter` | 用于构造 LDAP 搜索过滤器的模板。最终过滤器会在 LDAP 搜索期间，将模板中所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串替换为实际用户名、bind DN 和 base DN 后构造而成。注意，必须在 XML 中正确转义特殊字符。  |

Example:

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

示例（典型的 Active Directory，并已配置用户 DN 检测，用于后续角色映射）：

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

## license_key {#license_key} 

ClickHouse 企业版许可证密钥

## listen&#95;backlog {#listen_backlog}

监听套接字的 backlog（待处理连接的队列大小）。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 中的默认值相同。

通常不需要更改此值，因为：

* 默认值已经足够大，
* 服务器有单独的线程用于接受客户端连接。

因此，即使你在 ClickHouse 服务器上看到 `TcpExtListenOverflows`（来自 `nstat`）为非零且该计数器持续增长，这也并不意味着需要增大该值，因为：

* 通常如果 `4096` 不够，这表明存在某种 ClickHouse 内部扩展性问题，因此最好提交一个 issue。
* 这并不意味着服务器之后可以处理更多连接（即使可以，到那时客户端可能已经离开或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```

## listen&#95;host {#listen_host}

限制允许向服务器发送请求的主机。如果希望服务器接受来自所有主机的请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

允许多个服务器监听同一地址:端口。操作系统会将请求随机路由到某个服务器。不建议启用该设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认值：

## listen&#95;try {#listen_try}

在尝试监听时，如果 IPv6 或 IPv4 网络不可用，服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```

## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />用于加载标记的后台线程池大小

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入预取池的任务最大数量

## logger {#logger} 

日志消息的位置和格式。

**键**：

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 日志级别。可接受的值：`none`（关闭日志）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                   |
| `log`                  | 日志文件的路径。                                                                                                                                                    |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                                |
| `size`                 | 日志轮转策略：日志文件的最大大小（字节）。当日志文件大小超过此阈值时，会被重命名并归档，然后创建一个新的日志文件。                                                 |
| `count`                | 日志轮转策略：最多保留的历史日志文件数量。                                                                                                                          |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                               |
| `console`              | 启用将日志输出到控制台。设置为 `1` 或 `true` 以启用。如果 ClickHouse 不以守护进程模式运行，默认值为 `1`，否则为 `0`。                                              |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level` 的值。                                                                                                                        |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                                          |
| `use_syslog`           | 另外将日志输出转发到 syslog。                                                                                                                                       |
| `syslog_level`         | 输出到 syslog 时使用的日志级别。                                                                                                                                    |
| `async`                | 当为 `true`（默认）时，日志记录将以异步方式进行（每个输出通道一个后台线程）。否则将在调用 LOG 的线程中进行日志记录。                                              |
| `async_queue_max_size` | 使用异步日志记录时，队列中最多保留的待刷新消息数量。超出的消息将被丢弃。                                                                                           |
| `startup_level`        | 启动级别用于在服务器启动时设置根 logger 的级别。启动完成后，日志级别会恢复为 `level` 设置的值。                                                                    |
| `shutdown_level`       | 关闭级别用于在服务器关闭时设置根 logger 的级别。                                                                                                                   |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符，用于生成最终的文件名（目录部分不支持这些说明符）。

“Example” 列显示的是在 `2023-07-06 18:32:07` 时的输出。

| 说明符  | 描述                                                                                                           | 示例                         |
| ---- | ------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `%%` | 字面量 %                                                                                                        | `%`                        |
| `%n` | 换行符                                                                                                          |                            |
| `%t` | 水平制表符                                                                                                        |                            |
| `%Y` | 以十进制表示的年份，例如 2017                                                                                            | `2023`                     |
| `%y` | 年份最后两位的十进制数（范围 [00,99]）                                                                                      | `23`                       |
| `%C` | 年份的前 2 位数字（十进制，范围 [00,99]）                                                                                   | `20`                       |
| `%G` | 四位数的 [ISO 8601 以周为基础的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含所指定周的年份。通常只在与 `%V` 搭配使用时才有意义。 | `2023`                     |
| `%g` | [ISO 8601 周历年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 的后 2 位数字，即包含指定周的年份。                       | `23`                       |
| `%b` | 缩写的月份名称，例如 Oct（取决于语言环境）                                                                                      | `7月`                       |
| `%h` | %b 的同义词                                                                                                      | `Jul`                      |
| `%B` | 完整月份名称，例如 October（取决于区域设置）                                                                                   | `7 月`                      |
| `%m` | 月份的十进制表示（范围为 [01,12]）                                                                                        | `07`                       |
| `%U` | 一年中的第几周，用十进制数字表示（星期日为一周的第一天）（范围 [00,53]）                                                                     | `27`                       |
| `%W` | 一年中的周序号（十进制数，星期一为一周的第一天）（范围 [00,53]）                                                                         | `27`                       |
| `%V` | ISO 8601 周编号（范围 [01,53]）                                                                                     | `27`                       |
| `%j` | 一年中的第几天，以十进制数字表示（范围为 [001,366]）                                                                              | `187`                      |
| `%d` | 以零填充的十进制数字表示的月份中的日期（范围 [01,31]）。一位数前补零。                                                                      | `06`                       |
| `%e` | 月份中的日期，表示为带前导空格的十进制数（范围 [1,31]）。一位数前面用一个空格填充。                                                                | `&nbsp; 6`                 |
| `%a` | 星期缩写名称，例如 Fri（因本地化设置而异）                                                                                      | `周四`                       |
| `%A` | 完整的星期名称，例如 Friday（取决于区域设置）                                                                                   | `星期四`                      |
| `%w` | 用整数表示的星期几，其中星期日为 0（取值范围为 0–6）                                                                                | `4`                        |
| `%u` | 用十进制数字表示星期几，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                                                  | `4`                        |
| `%H` | 小时，24 小时制，以十进制数字表示（范围 [00-23]）                                                                               | `18`                       |
| `%I` | 表示小时的十进制数，12 小时制（范围 [01,12]）                                                                                 | `06`                       |
| `%M` | 分钟（十进制数，范围 [00,59]）                                                                                          | `32`                       |
| `%S` | 以十进制数表示的秒数（范围 [00,60]）                                                                                       | `07`                       |
| `%c` | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（取决于区域设置）                                                              | `Thu Jul  6 18:32:07 2023` |
| `%x` | 本地化日期格式（取决于区域设置）                                                                                             | `07/06/23`                 |
| `%X` | 本地化的时间表示形式，例如 18:40:20 或 6:40:20 PM（取决于区域设置）                                                                 | `18:32:07`                 |
| `%D` | 简写的 MM/DD/YY 日期格式，等同于 %m/%d/%y                                                                               | `2023/07/06`               |
| `%F` | 简短的 YYYY-MM-DD 日期格式，与 %Y-%m-%d 等价                                                                            | `2023-07-06`               |
| `%r` | 本地化的 12 小时制时间（因区域设置而异）                                                                                       | `06:32:07 PM`              |
| `%R` | 等同于 &quot;%H:%M&quot;                                                                                        | `18:32`                    |
| `%T` | 等价于 &quot;%H:%M:%S&quot;（ISO 8601 时间格式）                                                                      | `18:32:07`                 |
| `%p` | 根据语言环境本地化的 a.m./p.m. 标记                                                                                      | `PM`                       |
| `%z` | 与 UTC 的偏移量，采用 ISO 8601 格式（例如 -0430）；如果时区信息不可用，则不包含任何字符                                                       | `+0800`                    |
| `%Z` | 与区域设置相关的时区名称或缩写；如果时区信息不可用，则不输出任何字符                                                                           | `Z AWST `                  |

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

要仅在控制台输出日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按级别覆盖**

可以单独覆盖特定日志记录器的日志级别。例如，要静默日志记录器 &quot;Backup&quot; 和 &quot;RBAC&quot; 的所有消息。

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

要将日志消息同时写入 syslog：

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

`<syslog>` 的配置项：

| Key        | Description                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                           |
| `hostname` | 发送日志的主机名（可选）。                                                                                                                                                                            |
| `facility` | syslog 的[facility 关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写，并以 `LOG_` 为前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。默认值：如果指定了 `address`，则为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可选值：`bsd` 和 `syslog`。                                                                                                                                                             |

**日志格式**

可以指定在控制台日志中输出的日志格式。目前仅支持 JSON。

**示例**

下面是一个输出 JSON 日志的示例：

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

要启用 JSON 日志支持，请使用以下代码片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- 可按通道单独配置(log、errorlog、console、syslog),或为所有通道全局配置(省略此项即可)。 -->
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

可以通过修改 `<names>` 标签中的标签内容来更改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**在 JSON 日志中省略键**

可以通过将属性注释掉来省略日志属性。例如，如果不希望日志打印 `query_id`，可以将 `<query_id>` 标签注释掉。

## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，可以省略。

更多信息，参见[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)一节。

**示例**

```xml
<macros incl="macros" optional="true" />
```

## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />mark cache 策略名称。

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />在预热期间要填充的 mark cache 总大小的比例。

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

最大缓存大小，用于 `MergeTree` 表引擎族的标记（索引）（参见 [/engines/table-engines/mergetree-family](/engines/table-engines/mergetree-family)）。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在采用 SLRU 策略时，mark 缓存中受保护队列的大小占缓存总大小的比例。

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />在启动时用于加载活动分区片段集合的线程数。

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

为单个用户创建或修改时允许的最大身份验证方法数量。
更改该设置不会影响现有用户。如果创建或修改与身份验证相关的查询超出该设置中指定的上限，将会失败。
与身份验证无关的创建或修改查询仍会成功。

:::note
值为 `0` 表示无限制。
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有备份的最大读取带宽（字节/秒）。0 表示无限制。

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />如果 Backups IO 线程池中**空闲**线程的数量超过 `max_backup_io_thread_pool_free_size`，ClickHouse 会释放这些空闲线程占用的资源并减少线程池的大小。如有必要，可以重新创建这些线程。

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse 使用备份 IO 线程池中的线程来执行 S3 备份 IO 操作。`max_backups_io_thread_pool_size` 用于限制该线程池中的最大线程数。

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

用于构建向量索引时可使用的最大线程数。

:::note
值为 `0` 表示使用所有 CPU 核心。
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制同时执行的 INSERT 查询总数。

:::note

值为 `0`（默认）表示不限制。

该设置可在运行时修改，并会立即生效。已在运行中的查询将不受影响。
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

对并发执行的查询总数的限制。请注意，还必须同时考虑对 `INSERT` 和 `SELECT` 查询的限制，以及对每个用户的最大查询数限制。

另请参阅：

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

值为 `0`（默认）表示不限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询不会受到影响。
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

对并发执行的 `SELECT` 查询总数的限制。

:::note

值为 `0`（默认）表示不做限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询将保持不变。
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />服务器允许的最大连接数。

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />如果数据库的数量大于该值，服务器将抛出异常。0 表示不限。

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果已附加的数据库数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />在 DatabaseReplicated 中用于在副本恢复期间创建表的线程数。设置为 0 表示线程数等于 CPU 核心数。

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果字典数量超过该值，服务器将抛出异常。

仅统计以下数据库引擎的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不作限制。
:::

**示例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

## max&#95;dictionary&#95;num&#95;to&#95;warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果已挂载字典的数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器从分布式缓存读取数据的最大总带宽（字节/秒）。0 表示不限制。

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器写入分布式缓存的最大总带宽（字节/秒）。0 表示无限制。

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />在聚合过程中收集的哈希表统计信息中允许包含的最大条目数

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />用于执行 ALTER TABLE FETCH PARTITION 的线程数。

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

用于解析输入的线程池中可保留的最大空闲备用线程数。

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

用于解析输入的最大线程总数。

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果 IO 线程池中**空闲**线程的数量大于 `max_io_thread_pool_free_size`，ClickHouse 将释放这些空闲线程占用的资源，并缩减线程池的大小。必要时会重新创建线程。

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse 使用 IO 线程池中的线程执行某些 IO 操作（例如与 S3 的交互）。`max_io_thread_pool_size` 用于限制线程池中的线程最大数量。

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

单个 keep-alive 连接在被 ClickHouse 服务器关闭之前所能处理的最大请求数量。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

最大本地读取速度，单位为字节/秒。

:::note
值为 `0` 表示无限制。
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

服务器本地写入的最大速度，以字节/秒为单位。

:::note
值为 `0` 表示无限制。
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

限制附加到单个表的 materialized view 数量。

:::note
这里只统计直接依赖该表的视图，不包括在其他视图之上再创建视图的情况。
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有合并操作的最大读取速率（字节/秒）。数值 0 表示不限制。

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有 mutation 的最大读取速率，以字节/秒为单位。0 表示无限制。

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果命名集合的数量超过该值，服务器将抛出异常。

:::note
值为 `0` 表示不作限制。
:::

**示例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```

## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果命名集合的数量超过该值，ClickHouse 服务器会在 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```

## max&#95;open&#95;files {#max_open_files}

最大打开文件数。

:::note
我们建议在 macOS 上使用此选项，因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```

## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

用于在考虑是否断开连接时，限制操作系统 CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间的最大比率。通过在最小和最大比率之间进行线性插值来计算概率，在该比率点时概率为 1。
更多信息参见 [在服务器 CPU 过载时控制行为](/operations/settings/server-overload)。

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />在启动时用于加载处于非活动状态的数据分区片段（过期分区片段）的线程数。

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

如果活动分区片段的数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中记录警告信息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

删除分区的大小限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop)（字节），则不能使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询来删除分区。
应用此设置不需要重启 ClickHouse 服务器。禁用该限制的另一种方式是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值 `0` 表示可以在没有任何限制的情况下删除分区。

该限制不影响 DROP TABLE 和 TRUNCATE TABLE 操作，参见 [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop)
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />用于并发清理非活动数据分区片段的线程数。

## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />

如果任意处于等待执行状态的 mutation 的执行时间超过指定的秒数，ClickHouse 服务器会向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```

## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

如果待处理的 mutation 数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表中添加警告信息。

**示例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

如果前缀反序列化线程池中的**空闲**线程数超过 `max_prefixes_deserialization_thread_pool_free_size`，ClickHouse 将释放这些空闲线程占用的资源并缩减线程池大小。如有需要，可以重新创建线程。

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse 使用前缀反序列化线程池中的线程，从 MergeTree 中的 Wide 格式分区片段的文件前缀中并行读取列和子列的元数据。`max_prefixes_deserialization_thread_pool_size` 用于限制该线程池中的最大线程数。

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

读取时通过网络进行数据交换的最大速度，单位为字节/秒。

:::note
值为 `0`（默认）表示不限制。
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

写入时服务器通过网络进行数据交换的最大速度，以字节每秒为单位。

:::note
值为 `0`（默认）表示无限制。
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />副本拉取时通过网络进行数据交换的最大速度（以字节/秒计）。0 表示不受限制。

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />用于副本数据发送时，通过网络进行数据交换的最大速率（以字节/秒计）。零表示无限制。

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果复制表的数量超过该值，服务器将抛出异常。

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
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

服务器允许使用的最大内存量，以字节为单位。

:::note
服务器的最大内存使用量还会受到 `max_server_memory_usage_to_ram_ratio` 的进一步限制。
:::

作为一个特殊情况，值为 `0`（默认）表示服务器可以使用所有可用内存，但仍受 `max_server_memory_usage_to_ram_ratio` 施加的进一步限制。

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

服务器允许使用的最大内存量，以可用总内存的比例表示。

例如，值为 `0.9`（默认）表示服务器可以使用 90% 的可用内存。

可用于在内存较小的系统上降低内存占用。
在 RAM 和交换空间（swap）较少的主机上，可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置为大于 1 的值。

:::note
服务器的最大内存使用量还会受到 `max_server_memory_usage` SETTING 的进一步限制。
:::

## max&#95;session&#95;timeout {#max_session_timeout}

最大会话超时时间（秒）。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果表数量大于该值，服务器将抛出异常。

下列表不会被计入统计：

* view
* remote
* dictionary
* system

仅统计以下数据库引擎中的表：

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
值为 `0` 表示不设限制。
:::

**示例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max&#95;table&#95;num&#95;to&#95;warn {#max_table_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="5000" />

如果已附加的表数量超过指定的数值，ClickHouse 服务器会向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

删除表的限制。

如果某个 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop`（以字节为单位），则无法使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询将其删除。

:::note
`0` 表示可以在没有任何限制的情况下删除所有表。

使该设置在 ClickHouse 服务器中生效不需要重启。禁用此限制的另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

可用于外部聚合、连接或排序的最大磁盘空间。
超过此限制的查询将抛出异常并失败。

:::note
值为 `0` 表示不限制。
:::

另请参阅：

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果全局线程池中**空闲**线程的数量大于 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)，则 ClickHouse 会释放部分线程所占用的资源，并缩小线程池的大小。如有需要，可以重新创建线程。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse 使用全局线程池中的线程来处理查询。如果没有空闲线程可用于处理查询，则会在池中创建一个新线程。`max_thread_pool_size` 用于限制池中的最大线程数量。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />在启动时用于加载处于非活动状态的意外分区片段集合的线程数量。

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

如果 VIEW 的数量超过该值，服务器将抛出异常。

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
<max_view_num_to_throw>400</max_view_num_to_throw>
```

## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

如果已附加的 VIEW 数量超过指定值，ClickHouse 服务器会向 `system.warnings` 表写入警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

对同时处于等待状态的查询总数的限制。
当所需的表以异步方式加载时（参见 [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)），等待中的查询执行会被阻塞。

:::note
在检查由以下设置控制的限制时，不会统计等待中的查询：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

进行此调整是为了避免在服务器启动后立刻触及这些限制。
:::

:::note

值为 `0`（默认）表示不限制。

此设置可以在运行时修改，并会立即生效。已在运行中的查询将保持不变。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

后台内存工作线程是否应根据来自 jemalloc、cgroups 等外部来源的信息来校正内部内存跟踪器。

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

后台内存 worker 的执行周期，用于在内存使用较高时修正内存跟踪器的内存用量，并清理未使用的页。如果设置为 0，则会根据内存使用来源使用默认值。

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />根据当前 cgroup 的内存使用信息校正内存跟踪。

## merge&#95;tree {#merge_tree}

针对 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优。

有关更多信息，请参阅头文件 MergeTreeSettings.h。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

用于调节合并与其他工作负载之间的资源使用和共享方式。指定的值会作为所有后台合并的 `workload` 设置项的取值。可以通过 MergeTree 的设置进行覆盖。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在执行合并（merge）和变更（mutation）操作时允许使用的 RAM 上限。
如果 ClickHouse 达到该限制，它将不会再调度任何新的后台合并或变更操作，但会继续执行已经调度的任务。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

默认的 `merges_mutations_memory_usage_soft_limit` 值按照如下公式计算：`memory_amount * merges_mutations_memory_usage_to_ram_ratio`。

**另请参阅：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

默认情况下处于禁用状态。

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

要禁用 `metric_log` 配置项，需要创建如下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

在考虑断开连接时，操作系统 CPU 等待时间（OSCPUWaitMicroseconds 指标）与忙碌时间（OSCPUVirtualTimeMicroseconds 指标）之间的最小比值。通过在最小和最大比值之间进行线性插值来计算概率，在该最小比值处概率为 0。
更多详细信息，参见[控制服务器 CPU 过载时的行为](/operations/settings/server-overload)。

## mlock&#95;executable {#mlock_executable}

在启动后执行 `mlockall`，以降低首个查询的延迟，并防止在高 IO 负载下 ClickHouse 可执行文件被换出（分页到磁盘）。

:::note
建议启用此选项，但这会使启动时间增加最多几秒钟。
请注意，如果没有 “CAP&#95;IPC&#95;LOCK” 能力，此 SETTING 将不会生效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

此设置用于避免频繁的 open/close 调用（由于随之而来的缺页异常开销非常高），并允许在多个线程和查询之间复用映射。该设置的值表示已映射区域的数量（通常等于已映射文件的数量）。

可以通过以下系统表中的相关指标监控已映射文件中的数据量：

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` 位于 [`system.metrics`](/operations/system-tables/metrics)、[`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` 位于 [`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
已映射文件中的数据量不会直接消耗内存，并且不会计入查询或服务器的内存使用中——因为这部分内存可以像操作系统页缓存一样被丢弃。当 MergeTree 系列的表中旧的分区片段被删除时，此缓存会自动被丢弃（文件会被关闭），也可以通过执行 `SYSTEM DROP MMAP CACHE` 查询手动丢弃。

此设置可以在运行时修改，并会立即生效。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

用于调节在 mutation 与其他工作负载之间如何使用和共享资源。指定的值会作为所有后台 mutation 的 `workload` SETTING 的取值。可以通过 MergeTree 设置进行覆盖。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

用于通过 MySQL 协议与客户端进行通信的端口。

:::note

* 正整数表示要监听的端口号。
* 留空表示禁用通过 MySQL 协议与客户端的通信。
  :::

**示例**

```xml
<mysql_port>9004</mysql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport} 

如果设置为 `true`，则要求通过 [mysql_port](#mysql_port) 与客户端进行安全通信。带有 `--ssl-mode=none` 选项的连接将被拒绝。应与 [OpenSSL](#openssl) 设置配合使用。

## openSSL {#openssl} 

SSL 客户端/服务器配置。

对 SSL 的支持由 `libpoco` 库提供。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中进行了说明。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

用于服务器/客户端设置的键：

| 选项                            | 说明                                                                                                                                                                                                                                                                       | 默认值                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 证书私钥所在文件的路径。该文件可以同时包含私钥和证书。                                                                                                                                                                                                                                          |                                                                                            |
| `certificateFile`             | PEM 格式的客户端/服务器证书文件路径。如果 `privateKeyFile` 已包含该证书，则可以省略此项。                                                                                                                                                                                                                 |                                                                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录的路径。若指向文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。若指向目录，则该目录中必须为每个 CA 证书提供一个 .pem 文件。文件名是根据 CA subject 名称的哈希值进行查找的。更多细节可参见 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的 man 手册。 |                                                                                            |
| `verificationMode`            | 用于校验节点证书的方式。详细信息请参见 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的说明。可能的取值：`none`、`relaxed`、`strict`、`once`。                                                                                              | `relaxed`                                                                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设定值，则验证会失败。                                                                                                                                                                                                                                            | `9`                                                                                        |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定内置 CA 证书位于文件 `/etc/ssl/cert.pem`（或目录 `/etc/ssl/certs`），或者位于由环境变量 `SSL_CERT_FILE`（或 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                       | `true`                                                                                     |
| `cipherList`                  | OpenSSL 支持的加密算法。                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 配合使用。可接受的取值：`true`、`false`。                                                                                                                                                                                                             | `false`                                                                                    |
| `sessionIdContext`            | 服务器为每个生成的标识符附加的一组唯一的随机字符。该字符串的长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。始终建议配置此参数，因为无论是服务器缓存会话还是客户端请求缓存会话，它都有助于避免相关问题。                                                                                                                                                      | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | 服务器缓存的最大会话数量。值为 `0` 表示会话数量无限制。                                                                                                                                                                                                                                           | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 会话在服务器上的缓存时间（小时）。                                                                                                                                                                                                                                                        | `2`                                                                                        |
| `extendedVerification`        | 如果启用该选项，请验证证书的 CN 或 SAN 是否与对端主机名一致。                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1`                | 要求 TLSv1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                        | `false`                                                                                    |
| `requireTLSv1_1`              | 是否要求使用 TLSv1.1 连接。可接受的取值：`true`、`false`。                                                                                                                                                                                                                                 | `false`                                                                                    |
| `requireTLSv1_2`              | 是否要求使用 TLSv1.2 连接。可取值：`true`、`false`。                                                                                                                                                                                                                                    | `false`                                                                                    |
| `fips`                        | 启用 OpenSSL FIPS 模式。仅当库使用的 OpenSSL 版本支持 FIPS 时才受支持。                                                                                                                                                                                                                       | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 用于请求访问私钥口令的类（PrivateKeyPassphraseHandler 的子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                          | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                  | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 禁止使用的协议。                                                                                                                                                                                                                                                                 |                                                                                            |
| `preferServerCiphers`         | 服务器端采用客户端首选的密码套件。                                                                                                                                                                                                                                                        | `false`                                                                                    |

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
        <!-- 用于自签名证书: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 用于自签名证书: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的相关设置。

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

## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />操作系统 CPU 忙碌时间的阈值（单位：微秒，对应 OSCPUVirtualTimeMicroseconds 指标），用于判定 CPU 是否在执行实际有用的工作。如果忙碌时间低于该值，则不会认为存在 CPU 过载。

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

分布式缓存 TCP 处理器线程的 Linux nice 值。值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不会产生任何效果。

取值范围：-20 到 19。

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

用于合并和变更操作线程的 Linux nice 值。值越低表示 CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不起作用。

可能的取值范围：-20 到 19。

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

用于 ZooKeeper 客户端中发送和接收线程的 Linux nice 值。值越低，CPU 优先级越高。

需要 CAP_SYS_NICE 权限，否则不生效。

可选值范围：-20 到 19。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />指定在用户空间页缓存中需要保持空闲的内存在整体内存上限中的比例。类似于 Linux 的 `min_free_kbytes` 设置。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />在释放的内存可被用户空间页缓存重新使用之前的延迟时间。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />用户空间页面缓存的最大容量。设置为 0 可禁用该缓存。如果该值大于 `page_cache_min_size`，则缓存大小会在此范围内动态调整，在尽可能利用可用内存的同时，保证总内存使用低于限制值（`max_server_memory_usage[_to_ram_ratio]`）。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />用户空间页缓存的最小大小。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />用户态页缓存策略名称。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />将用户态页缓存按指定数量的分片进行划分，以减少互斥锁争用。实验性功能，不太可能带来性能提升。

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />用户空间页缓存中受保护队列的大小，占该缓存总大小的比例。

## part&#95;log {#part_log}

与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的日志事件，例如添加或合并数据。可以使用该日志来模拟合并算法并比较其特性，也可以对合并过程进行可视化。

查询会记录在 [system.part&#95;log](/operations/system-tables/part_log) 表中，而不是单独的文件。可以通过 `table` 参数配置该表的名称（见下文）。

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

## parts_kill_delay_period {#parts_kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

在 SharedMergeTree 中彻底删除分区片段前等待的时间间隔。仅在 ClickHouse Cloud 中可用。

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

向 `kill_delay_period` 添加从 0 到 x 秒之间均匀分布的随机值，以避免在存在非常大量表的情况下出现惊群效应，从而对 ZooKeeper 造成 DoS。仅在 ClickHouse Cloud 中可用。

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

用于在 shared merge tree 中执行过期清理的线程数。仅在 ClickHouse Cloud 中可用

## path {#path}

包含数据的目录路径。

:::note
路径末尾必须带斜杠。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql&#95;port {#postgresql_port}

用于通过 PostgreSQL 协议与客户端通信的端口。

:::note

* 正整数指定要监听的端口号
* 留空则会禁用通过 PostgreSQL 协议与客户端的通信。
  :::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```

## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

如果设置为 true，则客户端必须通过 [postgresql_port](#postgresql_port) 使用安全通信。带有 `sslmode=disable` 选项的连接将被拒绝。请结合 [OpenSSL](#openssl) 相关设置一起使用。

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />用于处理远程对象存储预取的后台线程池大小

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可推送到预取线程池中的最大任务数

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

可调度到前缀反序列化线程池中的任务的最大数量。

:::note
值为 `0` 表示不限制。
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，ClickHouse 会在启动前创建所有已配置的 `system.*_log` 表。如果某些启动脚本依赖这些表，这会很有用。

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />主索引缓存策略的名称。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />在预热阶段应填充的标记缓存总大小的比例。

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />主索引（MergeTree 系列表的索引）缓存的最大大小。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在主索引缓存中，受保护队列（在采用 SLRU 策略时）的大小与缓存总大小之比。

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

该设置允许读取 QueryPlan 数据包。在启用 serialize&#95;query&#95;plan 时，对分布式查询会发送此数据包。
默认情况下为禁用状态，以避免在查询计划二进制反序列化存在缺陷时可能导致的安全问题。

**示例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```

## processors&#95;profile&#95;log {#processors_profile_log}

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

## prometheus {#prometheus}

为 [Prometheus](https://prometheus.io) 提供可被抓取的指标数据。

Settings:

* `endpoint` – Prometheus 服务器用于抓取指标的 HTTP endpoint，必须以 &#39;/&#39; 开头。
* `port` – `endpoint` 所在的端口。
* `metrics` – 暴露来自 [system.metrics](/operations/system-tables/metrics) 表的指标。
* `events` – 暴露来自 [system.events](/operations/system-tables/events) 表的指标。
* `asynchronous_metrics` – 暴露来自 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表的当前指标值。
* `errors` - 暴露自上次服务器重启以来按错误码统计的错误次数。该信息同样可以从 [system.errors](/operations/system-tables/errors) 中获取。

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

## proxy {#proxy}

为 HTTP 和 HTTPS 请求定义代理服务器，目前 S3 存储、S3 表函数和 URL 函数已支持该功能。

定义代理服务器有三种方式：

* 环境变量
* 代理列表
* 远程代理解析器

还可以通过使用 `no_proxy` 为特定主机跳过代理服务器。

**Environment variables**

`http_proxy` 和 `https_proxy` 环境变量允许为给定协议指定
代理服务器。如果已在系统中设置，它通常可以直接生效，无需额外配置。

如果某个协议只有一个代理服务器且该代理服务器不会变更，
这是最简单的方式。

**Proxy lists**

这种方式允许为某个协议指定一个或多个
代理服务器。如果定义了多个代理服务器，
ClickHouse 会以轮询（round-robin）的方式使用不同代理，从而在服务器之间
平衡负载。如果某个协议存在多个代理服务器且代理服务器列表不会变更，
这是最简单的方式。

**Configuration template**

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

在下方选项卡中选择父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description       |
    | --------- | ----------------- |
    | `<http>`  | 一个或多个 HTTP 代理的列表  |
    | `<https>` | 一个或多个 HTTPS 代理的列表 |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field   | Description |
    | ------- | ----------- |
    | `<uri>` | 代理的 URI     |
  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态变化。在这种情况下，可以定义解析器的端点（endpoint）。ClickHouse 会向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。ClickHouse 随后会根据以下模板将其组装成代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

在下方的选项卡中选择一个父字段以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | 字段        | 描述           |
    | --------- | ------------ |
    | `<http>`  | 一个或多个解析器的列表* |
    | `<https>` | 一个或多个解析器的列表* |
  </TabItem>

  <TabItem value="http_https" label="<http> 和 <https>">
    | 字段           | 描述            |
    | ------------ | ------------- |
    | `<resolver>` | 解析器的端点和其他详细信息 |

    :::note
    可以包含多个 `<resolver>` 元素，但对于给定协议，只会使用第一个
    `<resolver>`。该协议的其他任何 `<resolver>` 元素都会被忽略。这意味着，如果需要负载均衡，则应由远程解析器来实现。
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | 字段                   | 描述                                                                                     |
    | -------------------- | -------------------------------------------------------------------------------------- |
    | `<endpoint>`         | 代理解析器的 URI                                                                             |
    | `<proxy_scheme>`     | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                     |
    | `<proxy_port>`       | 代理解析器的端口号                                                                              |
    | `<proxy_cache_time>` | 从解析器获取的值在 ClickHouse 中应被缓存的时间（秒）。将此值设置为 `0` 会导致 ClickHouse 在每次 HTTP 或 HTTPS 请求时都联系解析器。 |
  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置      |
| -- | ------- |
| 1. | 远程代理解析器 |
| 2. | 代理列表    |
| 3. | 环境变量    |

ClickHouse 将根据请求协议检查优先级最高的解析器类型。若未定义该解析器类型，
则会继续检查下一个优先级最高的解析器类型，直到使用 environment 解析器。
这也允许混合使用不同类型的解析器。

## query&#95;cache {#query_cache}

[Query cache](../query-cache.md) 配置。

可用的设置如下：

| Setting                   | Description                              | Default Value |
| ------------------------- | ---------------------------------------- | ------------- |
| `max_size_in_bytes`       | 以字节为单位的最大缓存大小。`0` 表示禁用查询缓存。              | `1073741824`  |
| `max_entries`             | 缓存中可存储的 `SELECT` 查询结果的最大数量。              | `1024`        |
| `max_entry_size_in_bytes` | 以字节为单位的、可缓存在查询缓存中的单个 `SELECT` 查询结果的最大大小。 | `1048576`     |
| `max_entry_size_in_rows`  | 可缓存在查询缓存中的单个 `SELECT` 查询结果的最大行数。         | `30000000`    |

:::note

* 修改后的设置会立即生效。
* 查询缓存的数据分配在 DRAM 中。如果内存紧张，请确保为 `max_size_in_bytes` 设置较小的值，或完全禁用查询缓存。
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

## query_condition_cache_policy {#query_condition_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />查询条件缓存策略的名称。

## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

查询条件缓存的最大容量。
:::note
此设置可以在运行时修改，并会立即生效。
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在使用 SLRU 策略时，查询条件缓存中受保护队列的大小占缓存总大小的比例。

## query&#95;log {#query_log}

用于在启用 [log&#95;queries=1](../../operations/settings/settings.md) 设置时记录接收到的查询。

查询会被记录到 [system.query&#95;log](/operations/system-tables/query_log) 表中，而不是单独的文件。可以通过 `table` 参数更改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在更新 ClickHouse 服务器时 query log 的结构发生了变化，则旧结构的表会被重命名，并自动创建一个新表。

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

## query&#95;masking&#95;rules {#query_masking_rules}

基于正则表达式的规则，会在将查询以及所有日志消息写入服务器日志、[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表，以及发送给客户端的日志之前应用。这样可以防止来自 SQL 查询的敏感数据（例如姓名、电子邮件、个人标识符或信用卡号）泄漏到日志中。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>隐藏 SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置字段**：

| Setting   | Description               |
| --------- | ------------------------- |
| `name`    | 规则名称（可选）                  |
| `regexp`  | 与 RE2 兼容的正则表达式（必需）        |
| `replace` | 用于替换敏感数据的字符串（可选，默认值为六个星号） |

掩码规则会应用到整个查询（用于防止因格式错误或无法解析的查询泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表包含名为 `QueryMaskingRulesMatch` 的计数器，用于统计查询掩码规则被匹配的总次数。

对于分布式查询，必须分别在每个服务器上进行配置，否则传递给其他节点的子查询将会在未进行掩码的情况下存储。

## query&#95;metric&#95;log {#query_metric_log}

默认禁用。

**启用**

要手动开启指标历史记录收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件，并写入以下内容：

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

要禁用 `query_metric_log` 设置，请创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，并写入如下内容：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;thread&#95;log {#query_thread_log}

用于在启用 [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads) 设置时记录接收到的查询线程的设置。

查询会被记录到 [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) 表中，而不是单独的文件中。可以通过 `table` 参数（见下文）修改该表的名称。

<SystemLogParameters />

如果该表不存在，ClickHouse 会自动创建它。如果在更新 ClickHouse 服务器时查询线程日志的结构发生了变化，则旧结构的表会被重命名，并自动创建一个新表。

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

## query&#95;views&#95;log {#query_views_log}

用于记录视图（live、materialized 等）日志的设置，其行为取决于在 [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views) 设置开启时接收到的查询。

查询会记录在 [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) 表中，而不是单独的文件中。可以在 `table` 参数中修改该表的名称（见下文）。

<SystemLogParameters />

如果该表不存在，ClickHouse 会创建它。如果在更新 ClickHouse 服务器时 query views 日志的结构发生了变化，则具有旧结构的表会被重命名，并自动创建一个新表。

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

## remap&#95;executable {#remap_executable}

用于使用 huge pages 重新分配机器代码（“text”）内存的设置项。

:::note
该功能仍处于高度实验性阶段。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```

## remote&#95;servers {#remote_servers}

由 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的取值，请参阅“[Configuration files](/operations/configuration-files)”一节。

**另请参阅**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

在通过 `\<host\>` XML 标签添加主机时：

* 必须与 URL 中的写法完全一致，因为会在 DNS 解析之前先检查名称。例如：`<host>clickhouse.com</host>`
* 如果在 URL 中显式指定了端口，则会将 host:port 作为一个整体进行检查。例如：`<host>clickhouse.com:80</host>`
* 如果主机未指定端口，则该主机上的任意端口都被允许。例如：如果指定了 `<host>clickhouse.com</host>`，则 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等都被允许。
* 如果主机以 IP 地址的形式指定，则会按 URL 中的写法进行检查。例如：`[2a02:6b8:a::a]`。
* 如果存在重定向并且启用了对重定向的支持，则每一次重定向（Location 字段）都会被检查。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica&#95;group&#95;name {#replica_group_name}

用于 Replicated 数据库的副本组名称。

由 Replicated 数据库创建的集群将由同一副本组中的副本组成。
DDL 查询只会等待同一副本组内的副本。

默认为空。

**示例**

```xml
<replica_group_name>备份</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />用于通过 HTTP 拉取数据 part 的连接超时时间。如果未显式设置，则继承默认 profile 中的 `http_connection_timeout`。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />用于处理 part 拉取请求的 HTTP 接收超时时间。如果未显式设置，则继承默认 profile 中的 `http_receive_timeout`。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />用于分片数据获取请求的 HTTP 发送超时时间。如果未显式设置，则继承默认 profile 中的 `http_send_timeout`。

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

用于对 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中的表进行精细调优。此 SETTING 的优先级更高。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />用于执行 RESTORE 请求的最大线程数。

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />可缓存的 S3 凭证提供程序的最大数量

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />S3 重定向允许的最大跳数。

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />为 Aws::Client::RetryStrategy 配置的重试次数，Aws::Client 会自行执行重试，0 表示不重试

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />即使已创建表并已附加物化视图，也在 S3Queue 中禁用流式处理

## s3queue&#95;log {#s3queue_log}

`s3queue_log` 系统表的设置。

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

## send&#95;crash&#95;reports {#send_crash_reports}

用于将崩溃报告发送给 ClickHouse 核心开发团队的设置。

建议在预生产环境中启用该功能。

键：

| Key                   | Description                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| `enabled`             | 用于启用该功能的布尔开关，默认值为 `true`。将其设置为 `false` 可避免发送崩溃报告。                               |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，表示 ClickHouse 中的一个 bug。此布尔开关用于启用发送此类异常（默认：`true`）。 |
| `endpoint`            | 可以自定义用于发送崩溃报告的 endpoint URL。                                                    |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Keeper 中带有自增编号的路径，由 `generateSerialID` 函数生成。每个 series 都将作为该路径下的一个节点。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />当设置为 true 时，将在堆栈跟踪中显示地址。

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />如果设置为 true，ClickHouse 会在关闭前等待正在运行的备份和恢复操作完成。

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />以秒为单位等待未完成查询结束的时间

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为 true，ClickHouse 将在关闭前等待正在运行的查询完成。

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />跳过 ClickHouse 二进制文件校验和完整性检查

## ssh&#95;server {#ssh_server}

在首次连接时，主机密钥的公钥部分会被写入 SSH 客户端一侧的 known&#95;hosts 文件。

主机密钥配置默认处于未启用状态。
取消注释主机密钥配置，并提供对应 ssh 密钥的路径以启用它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />用于模拟物化视图创建延迟的调试参数

## storage&#95;configuration {#storage_configuration}

允许进行多磁盘存储配置。

存储配置遵循以下结构：

```xml
<storage_configuration>
    <disks>
        <!-- 配置 -->
    </disks>
    <policies>
        <!-- 配置 -->
    </policies>
</storage_configuration>
```

### 磁盘配置 {#configuration-of-disks}

`disks` 的配置遵循如下所示的结构：

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

上面的子标签为 `disks` 定义了如下设置：

| Setting                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `<disk_name_N>`         | 磁盘的名称，必须唯一。                                   |
| `path`                  | 用于存储服务器数据（`data` 和 `shadow` 目录）的路径，应以 `/` 结尾。 |
| `keep_free_space_bytes` | 磁盘上预留空闲空间的大小。                                 |

:::note
磁盘的先后顺序无关紧要。
:::

### 策略配置 {#configuration-of-policies}

上面的子标签为 `policies` 定义了以下设置：

| 设置                         | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | volume 名称。volume 名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `disk`                       | 位于该 volume 内部的 disk。                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `max_data_part_size_bytes`   | 此 volume 中任意 disk 上可以存放的数据分片的最大大小。如果合并结果预期产生的数据分片会大于 `max_data_part_size_bytes`，该分片将被写入下一个 volume。该特性本质上允许你将新的 / 较小的数据分片存放在热（SSD）volume 上，并在它们达到较大尺寸时将其移动到冷（HDD）volume。若策略只包含一个 volume，请不要使用此选项。                                                                                                           |
| `move_factor`                | volume 中可用空闲空间的占比。如果可用空间变少，数据将开始传输到下一个 volume（如果存在）。在传输时，数据分片会按大小从大到小（降序）排序，并选择其总大小足以满足 `move_factor` 条件的数据分片；如果所有数据分片的总大小仍不足以满足条件，则会移动所有数据分片。                                                                                                                                                                         |
| `perform_ttl_move_on_insert` | 禁用在插入时移动已过期生存时间 (TTL) 的数据。默认情况下（启用时），如果插入的数据根据“按生命周期移动”规则已经过期，它会立即被移动到该规则指定的 volume / disk。在目标 volume / disk 较慢的情况下（例如 S3），这会显著降低插入性能。如果禁用，则已过期的数据部分会先写入默认 volume，然后再根据针对已过期生存时间 (TTL) 的规则立即移动到指定 volume。                                                                           |
| `load_balancing`             | disk 负载均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `least_used_ttl_ms`          | 设置用于刷新所有 disk 上可用空间信息的超时时间（毫秒）（`0` 表示始终更新，`-1` 表示从不更新，默认值为 `60000`）。注意，如果该 disk 仅由 ClickHouse 使用，且不会在运行时进行文件系统在线扩容或缩容，则可以使用 `-1`。在其他所有情况下不建议这样做，因为最终会导致错误的空间分配。                                                                                                                                                          |
| `prefer_not_to_merge`        | 禁用在此 volume 上对数据分区片段进行合并。注意：这可能有害并导致性能下降。当启用此设置时（不建议启用），禁止在该 volume 上执行数据合并（这是不利的）。这提供了一种控制 ClickHouse 如何与慢速 disk 交互的手段。我们建议完全不要使用此设置。                                                                                                                                                                                                             |
| `volume_priority`            | 定义填充 volume 的优先级（顺序）。数值越小，优先级越高。参数值必须是自然数，并且在 1 到 N（N 为指定的最大参数值）范围内连续无空缺。                                                                                                                                                                                                                                                                                                                             |

对于 `volume_priority`：

- 如果所有 volume 都具有此参数，则按指定顺序确定优先级。
- 如果只有 _部分_ volume 具有此参数，则不具有该参数的 volume 优先级最低。具有该参数的 volume 按标签值确定优先级，其余 volume 的优先级由它们在配置文件中的相对描述顺序决定。
- 如果 _没有_ 任何 volume 被赋予此参数，则它们的顺序由其在配置文件中的描述顺序决定。
- volume 之间的优先级可以不同，不要求相同。

## storage_connections_hard_limit {#storage_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />在达到该限制后，后续的创建尝试会抛出异常。将其设为 0 可关闭硬性限制。此限制适用于存储的连接数。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />超过此限制的连接的存活时间会显著缩短。该限制适用于存储连接。

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />超过此限制的连接在使用后会被重置。将其设置为 0 可关闭连接缓存。该限制适用于存储引擎连接。

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />当正在使用的连接数超过该限制时，将在日志中记录警告消息。该限制适用于存储的连接。

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />以 VERSION_FULL_OBJECT_KEY 格式写入磁盘元数据文件。默认启用。该设置已弃用。

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />启用后，在创建 SharedSet 和 SharedJoin 时会生成内部 UUID。仅限 ClickHouse Cloud

## table_engines_require_grant {#table_engines_require_grant} 

如果设置为 true，用户在使用特定引擎创建表时需要先被授予相应权限，例如：`GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了保持向后兼容性，使用特定表引擎创建表时会忽略权限检查，不过您可以通过将此设置为 true 来改变这一行为。
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在后台线程池中执行异步加载任务的线程数量。后台线程池用于在服务器启动后，在没有查询等待该表的情况下异步加载表。如果表很多，适当降低后台线程池中的线程数量可能会更有利，这样可以为并发查询执行保留 CPU 资源。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

设置在前台线程池中执行加载任务的线程数量。前台线程池用于在服务器开始监听端口之前同步加载表，以及加载那些需要等待其加载完成的表。前台线程池的优先级高于后台线程池。这意味着，只要前台线程池中仍有任务在运行，后台线程池中就不会启动任何任务。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />在关闭 TCP 连接之前允许的最大查询次数。设置为 0 表示不限制查询次数。

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 连接在关闭前的最⻓存活时间（秒）。将其设置为 0 表示连接的存活时间不受限制。

## tcp&#95;port {#tcp_port}

用于通过 TCP 协议与客户端进行通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

用于与客户端进行安全通信的 TCP 端口。请与 [OpenSSL](#openssl) 设置搭配使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## tcp&#95;ssh&#95;port {#tcp_ssh_port}

SSH 服务器使用的端口，允许用户通过 PTY 使用嵌入式客户端以交互方式连接并执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

使用此选项时，临时数据将存储在特定磁盘的缓存中。
在本节中，需要指定一个类型为 `cache` 的磁盘名称。
在这种情况下，缓存和临时数据将共享同一空间，并且可以通过驱逐磁盘缓存来为临时数据腾出空间。

:::note
临时数据存储只能从以下选项中选择一种进行配置：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
:::

**示例**

`local_disk` 的缓存和临时数据都会存储在文件系统上的 `/tiny_local_cache` 中，由 `tiny_local_cache` 进行管理。

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

## temporary_data_in_distributed_cache {#temporary_data_in_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />将临时数据存储在分布式缓存中。

## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />文本索引字典块缓存的大小（按条目数量计）。为 0 表示禁用。

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引字典块缓存策略的名称。

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />文本索引字典块的缓存大小。0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在采用 SLRU 策略时，文本索引字典块缓存中受保护队列的大小相对于缓存总大小的比例。

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />文本索引头缓存的大小（按条目数计）。设置为 0 表示禁用。

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引头部缓存策略名称。

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />文本索引头缓存的大小。设置为 0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在采用 SLRU 策略时，文本索引头部缓存中受保护队列的大小，相对于该缓存总大小的比例。

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />文本索引 posting 列表的缓存大小（按条目数计）。将其设为 0 表示禁用。

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />文本索引 posting 列表缓存策略的名称。

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />用于文本索引倒排列表的缓存大小。零表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在文本索引的倒排列表缓存中，受保护队列（在采用 SLRU 策略时）的大小占缓存总大小的比例。

## text&#95;log {#text_log}

用于记录文本消息的 [text&#95;log](/operations/system-tables/text_log) 系统表相关设置。

<SystemLogParameters />

此外：

| Setting | Description                  | Default Value |
| ------- | ---------------------------- | ------------- |
| `level` | 表中将会存储的最大消息级别（默认值为 `Trace`）。 | `Trace`       |

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

## thread&#95;pool&#95;queue&#95;size {#thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

可在全局线程池（Global Thread pool）中排队调度的作业最大数量。增大队列大小会增加内存占用。建议将该值设置为与 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) 相同。

:::note
值为 `0` 表示不设上限。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />当 `local_filesystem_read_method = 'pread_threadpool'` 时，用于从本地文件系统读取数据的线程池的线程数。

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />用于从本地文件系统读取数据的线程池中可排队的最大任务数。

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />当 `remote_filesystem_read_method = 'threadpool'` 时，用于从远程文件系统读取数据的线程池中的线程数。

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />用于从远程文件系统读取数据的线程池中可调度的最大任务数量。

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />用于处理向对象存储写入请求的后台线程池大小

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />能够推送到用于处理对象存储写入请求的后台线程池中的最大任务数

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

定义在通过查询设置 `workload` 访问未知 WORKLOAD 时的行为。

* 如果为 `true`，在查询尝试访问未知 WORKLOAD 时会抛出 RESOURCE&#95;ACCESS&#95;DENIED 异常。在建立包含默认 WORKLOAD 的 WORKLOAD 层级之后，可用它来强制所有查询都进行资源调度。
* 如果为 `false`（默认），则对其 `workload` 查询设置指向未知 WORKLOAD 的查询，在没有资源调度的情况下提供无限制访问。这在设置 WORKLOAD 层级、且尚未添加默认 WORKLOAD 期间非常重要。

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**另请参阅**

* [工作负载调度](/operations/workload-scheduling.md)

## timezone {#timezone}

服务器的时区。

指定为表示 UTC 时区或地理位置的 IANA 标识符（例如 Africa/Abidjan）。

在将 DateTime 字段输出为文本格式（打印到屏幕或写入文件）以及从字符串解析为 DateTime 时，需要使用时区在 String 与 DateTime 格式之间进行转换。此外，在处理时间和日期的函数的输入参数中未指定时区时，也会使用该时区。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参阅**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tmp&#95;path {#tmp_path}

本地文件系统上的路径，用于在处理大型查询时存储临时数据。

:::note

* 临时数据存储只能通过以下选项之一进行配置：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
* 路径末尾必须带有斜杠。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp&#95;policy {#tmp_policy}

用于临时数据存储的策略。所有以 `tmp` 前缀命名的文件都会在启动时被删除。

:::note
将对象存储用作 `tmp_policy` 时的建议：

* 在每台服务器上使用独立的 `bucket:path`
* 使用 `metadata_type=plain`
* 还可以考虑为此 bucket 设置生存时间 (TTL)
  :::

:::note

* 只能使用一个选项来配置临时数据存储：`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
* `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` 将被忽略。
* 策略必须且只能包含 *一个卷（volume）*

更多信息，参见 [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) 文档。
:::

**示例**

当 `/disk1` 已满时，临时数据将会存储在 `/disk2` 上。

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

## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

定义要添加的自定义顶级域名列表，其中每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参阅：

* 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 及其变体，
  它接受一个自定义的 TLD 列表名称，并返回域名中从顶级子域名开始直至第一个关键子域名的那一部分。

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />以概率 `total_memory_profiler_sample_probability` 收集大小小于或等于指定值的随机内存分配。0 表示禁用。可能需要将 `max_untracked_memory` 设置为 0，才能使该阈值按预期生效。

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />以概率 `total_memory_profiler_sample_probability` 随机抽样收集大小大于或等于指定值的内存分配。0 表示禁用。您可能需要将 `max_untracked_memory` 设置为 0，才能使该阈值按预期生效。

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />每当服务器的内存使用量（以字节为单位）超过下一个步长阈值时，内存分析器都会收集分配时的堆栈跟踪。零表示禁用内存分析器。将该值设置为低于几兆字节会降低服务器性能。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

用于随机采样内存分配和释放操作，并以指定的概率将这些事件写入 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表中，记录为 `trace_type` 等于 `MemorySample` 的条目。该概率作用于每一次分配或释放操作，与分配大小无关。请注意，只有当未跟踪内存的数量超过未跟踪内存限制时（默认值为 `4` MiB）才会进行采样。如果 [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) 被调低，则该限制也可以被降低。可以将 `total_memory_profiler_step` 设置为 `1` 以获得更精细的采样。

可能的取值：

- 正的双精度浮点数。
- `0` — 禁用将随机的内存分配和释放写入 `system.trace_log` 系统表。

## trace&#95;log {#trace_log}

[trace&#95;log](/operations/system-tables/trace_log) 系统表操作的相关设置。

<SystemLogParameters />

默认的服务器配置文件 `config.xml` 包含如下设置部分：

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

## 未压缩缓存策略 {#uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />未压缩缓存策略名称。

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

MergeTree 家族中的表引擎用于存储未压缩数据的最大缓存大小（以字节为单位）。

服务器上只有一个共享缓存。内存按需分配。仅当启用了 `use_uncompressed_cache` 选项时才会使用该缓存。

在某些情况下，对于非常短的查询，使用未压缩缓存更有优势。

:::note
值为 `0` 表示禁用。

此设置可以在运行时修改，并会立即生效。
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在未压缩缓存中，采用 SLRU 策略时受保护队列的大小，相对于该缓存总大小的比例。

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

用于将简写或符号化的 URL 前缀映射为完整 URL 的配置。

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

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

在 ZooKeeper 中存储数据分区片段头信息的方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 系列。可以通过以下方式指定：

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分中进行全局设置**

ClickHouse 会对该服务器上的所有表使用此设置。你可以在任意时间更改此设置。现有表在设置更改后会改变其行为。

**针对每个表分别设置**

在创建表时，指定相应的 [engine setting](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。已经存在的表在使用该设置后，其行为不会随全局设置的变化而改变。

**可能的取值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则[复制](../../engines/table-engines/mergetree-family/replication.md)表会使用单个 `znode` 以紧凑方式存储数据分区片段头信息。如果表包含大量列，这种存储方式可以显著减少在 ZooKeeper 中存储的数据量。

:::note
在应用 `use_minimalistic_part_header_in_zookeeper = 1` 之后，你无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群中的服务器上升级 ClickHouse 时请务必小心。不要一次性升级所有服务器。更安全的做法是先在测试环境中，或者在集群中的少量服务器上测试新的 ClickHouse 版本。

已经使用此设置存储的数据分区片段头信息无法恢复为之前的（非紧凑）表示形式。
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

可执行用户自定义函数配置文件的路径。

路径：

* 可以指定绝对路径，或相对于服务器配置文件的相对路径。
* 路径可以包含通配符 * 和 ?。

另请参阅：

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## user&#95;defined&#95;path {#user_defined_path}

包含用户自定义文件的目录，供 SQL 用户自定义函数 [SQL User Defined Functions](/sql-reference/functions/udf) 使用。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## user&#95;directories {#user_directories}

配置文件中包含以下设置的部分：

* 预定义用户配置文件的路径。
* 通过 SQL 命令创建的用户所存储的文件夹路径。
* 通过 SQL 命令创建并进行副本同步的用户在 ZooKeeper 中的节点路径。

如果指定了此部分，则不会使用 [users&#95;config](/operations/server-configuration-parameters/settings#users_config) 和 [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的条目，条目的顺序表示其优先级（条目越靠前，优先级越高）。

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

用户、角色、行级策略、配额和配置文件也可以存储在 ZooKeeper 中：

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

You can also define sections `memory` — means storing information only in memory, without writing to disk, and `ldap` — means storing information on an LDAP server.

To add an LDAP server as a remote user directory of users that are not defined locally, define a single `ldap` section with the following settings:

| 设置项      | 描述                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `server` | 在 `ldap_servers` 配置段中定义的 LDAP 服务器名称之一。该参数为必填项，不能为空。                                                                    |
| `roles`  | 包含本地已定义角色列表的配置段，这些角色会分配给从 LDAP 服务器获取到的每个用户。如果未指定任何角色，用户在完成认证后将无法执行任何操作。如果在认证时，列表中的任意角色尚未在本地定义，则本次认证将失败，其表现与提供了错误密码时相同。 |

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

## user&#95;files&#95;path {#user_files_path}

存放用户文件的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

包含用户脚本文件的目录。供 Executable 用户自定义函数使用，参见 [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认值：

## users&#95;config {#users_config}

包含以下内容的文件路径：

* 用户配置
* 访问权限
* SETTINGS PROFILE 配置
* QUOTA 设置

**示例**

```xml
<users_config>users.xml</users_config>
```

## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />用于控制在接收到查询数据包时，是否启用客户端信息验证。

默认值为 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />向量相似度索引缓存的大小（按条目数计）。0 表示禁用。

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />向量相似度索引缓存策略的名称。

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />向量相似度索引缓存大小。将其设为 0 表示禁用。

:::note
此设置可以在运行时修改，并会立即生效。
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />向量相似度索引缓存中受保护队列（在使用 SLRU 策略时）的大小占整个缓存大小的比例。

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置用于指定在 `dictionaries_lazy_load` 为 `false` 时的行为。
（如果 `dictionaries_lazy_load` 为 `true`，则此设置不会产生任何影响。）

如果 `wait_dictionaries_load_at_startup` 为 `false`，则服务器会在启动时开始加载所有字典，并在加载的同时并行接受连接。
当某个字典在查询中第一次被使用时，如果该字典尚未加载完成，则该查询会等待字典加载完成。
将 `wait_dictionaries_load_at_startup` 设为 `false` 可以让 ClickHouse 启动得更快，但某些查询可能会执行得更慢
（因为它们必须等待部分字典完成加载）。

如果 `wait_dictionaries_load_at_startup` 为 `true`，则服务器会在启动时等待
直至所有字典完成加载（无论成功或失败）之后，才会接受任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

## workload&#95;path {#workload_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**

* [Workload 层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

ZooKeeper 节点的路径，用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询。为保证一致性，所有 SQL 定义都作为这一单个 znode 的值进行存储。默认情况下不使用 ZooKeeper，定义会存储在[磁盘](#workload_path)上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**

* [Workload 层次结构](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表时，会使用 ZooKeeper 存储副本的元数据。如果不使用复制表，可以省略本节参数。

以下设置可以通过子标签进行配置：

| Setting                                    | Description                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定在尝试连接 ZooKeeper 集群时节点的顺序。 |
| `session_timeout_ms`                       | 客户端会话的最大超时时间，单位为毫秒。                                                                                                                |
| `operation_timeout_ms`                     | 单次操作的最大超时时间，单位为毫秒。                                                                                                                 |
| `root` (optional)                          | 作为 ClickHouse 服务器所使用 znodes 根路径的 znode。                                                                                            |
| `fallback_session_lifetime.min` (optional) | 当主节点不可用（负载均衡）时，到备用节点的 ZooKeeper 会话生命周期的最小限制。以秒为单位设置。默认值：3 小时。                                                                      |
| `fallback_session_lifetime.max` (optional) | 当主节点不可用（负载均衡）时，到备用节点的 ZooKeeper 会话生命周期的最大限制。以秒为单位设置。默认值：6 小时。                                                                      |
| `identity` (optional)                      | ZooKeeper 访问所请求 znode 所需的用户和密码。                                                                                                    |
| `use_compression` (optional)               | 如果设置为 true，则在 Keeper 协议中启用压缩。                                                                                                      |

还有一个可选的 `zookeeper_load_balancing` 设置，用于选择 ZooKeeper 节点选择算法：

| Algorithm Name                  | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `random`                        | 随机选择一个 ZooKeeper 节点。                               |
| `in_order`                      | 选择第一个 ZooKeeper 节点，如果不可用则选择第二个，依此类推。               |
| `nearest_hostname`              | 选择主机名与服务器主机名最相似的 ZooKeeper 节点，主机名按名称前缀进行比较。        |
| `hostname_levenshtein_distance` | 与 `nearest_hostname` 类似，但使用 Levenshtein 距离方式比较主机名。 |
| `first_or_random`               | 选择第一个 ZooKeeper 节点，如果不可用则从剩余的 ZooKeeper 节点中随机选择一个。 |
| `round_robin`                   | 选择第一个 ZooKeeper 节点，如果发生重连则选择下一个。                   |

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
    <!-- 可选。Chroot 后缀。该路径必须存在。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 可选。Zookeeper digest ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

* [复制](../../engines/table-engines/mergetree-family/replication.md)
* [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)

## zookeeper&#95;log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 系统表的相关设置。

可以通过子标签配置以下参数：

<SystemLogParameters />

**示例**

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
