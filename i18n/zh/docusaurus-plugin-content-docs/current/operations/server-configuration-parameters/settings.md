---
description: '本节介绍服务器设置，即那些无法在会话级别或查询级别修改的设置。'
keywords: ['全局服务器设置']
sidebar_label: '服务器设置'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: '服务器设置'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 服务器设置

本节介绍服务器级别的设置。这些设置无法在会话或查询级别进行更改。

有关 ClickHouse 中配置文件的更多信息，请参阅 [Configuration Files](/operations/configuration-files) 一节。

其他设置请参阅 [Settings](/operations/settings/overview) 一节。
在学习这些设置之前，我们建议先阅读 [Configuration Files](/operations/configuration-files) 一节，并注意替换机制的用法（`incl` 和 `optional` 属性）。



## abort_on_logical_error {#abort_on_logical_error}

<SettingsInfoBlock type='Bool' default_value='0' />
在发生 LOGICAL_ERROR 异常时使服务器崩溃。仅限专家使用。


## access_control_improvements {#access_control_improvements}

访问控制系统可选改进的设置。

| 设置                                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | 设置没有宽松行策略的用户是否仍可使用 `SELECT` 查询读取行。例如,如果有两个用户 A 和 B,且仅为 A 定义了行策略,那么当此设置为 true 时,用户 B 将看到所有行。当此设置为 false 时,用户 B 将看不到任何行。                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | 设置 `SELECT * FROM system.<table>` 是否需要任何授权以及是否可由任何用户执行。如果设置为 true,则此查询需要 `GRANT SELECT ON system.<table>`,与非系统表相同。例外情况:少数系统表(`tables`、`columns`、`databases` 以及一些常量表如 `one`、`contributors`)仍对所有人可访问;如果授予了 `SHOW` 权限(例如 `SHOW USERS`),则相应的系统表(即 `system.users`)将可访问。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权以及是否可由任何用户执行。如果设置为 true,则此查询需要 `GRANT SELECT ON information_schema.<table>`,与普通表相同。                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | 设置设置配置文件中某个设置的约束是否会取消该设置的先前约束(在其他配置文件中定义)的操作,包括新约束未设置的字段。此设置还会启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | 设置使用特定表引擎创建表是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | 设置角色在角色缓存中存储的时长(自上次访问以来的秒数)。                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

示例:

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

ClickHouse 服务器存储由 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参阅**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)


## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

<SettingsInfoBlock
  type='GroupArrayActionWhenLimitReached'
  default_value='throw'
/>
当 groupArray 中数组元素数量超过限制时执行的操作:`throw` 抛出异常,或 `discard` 丢弃多余的值


## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

<SettingsInfoBlock type='UInt64' default_value='16777215' />
groupArray 函数中数组元素的最大字节大小。此限制在序列化时进行检查,用于避免状态大小过大。


## allow_feature_tier {#allow_feature_tier}

<SettingsInfoBlock type='UInt32' default_value='0' />
控制用户是否可以更改与不同功能层级相关的设置。

- `0` - 允许更改任何设置(实验性、Beta 版、生产版)。
- `1` - 仅允许更改 Beta 版和生产版功能设置。拒绝更改实验性设置。
- `2` - 仅允许更改生产版设置。拒绝更改实验性或 Beta 版设置。

这相当于对所有 `EXPERIMENTAL` / `BETA` 功能设置只读约束。

:::note
值为 `0` 表示可以更改所有设置。
:::


## allow_impersonate_user {#allow_impersonate_user}

<SettingsInfoBlock type='Bool' default_value='0' />
启用/禁用 IMPERSONATE 功能（EXECUTE AS target_user）。


## allow_implicit_no_password {#allow_implicit_no_password}

禁止创建无密码用户,除非显式指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password {#allow_no_password}

设置是否允许使用不安全的 no_password 密码类型。

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password {#allow_plaintext_password}

设置是否允许使用明文密码类型(不安全)。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

<SettingsInfoBlock type='Bool' default_value='1' />
允许使用 jemalloc 内存。


## allowed_disks_for_table_engines {#allowed_disks_for_table_engines}

允许用于 Iceberg 的磁盘列表


## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

<SettingsInfoBlock type='Bool' default_value='1' />
如果为 true,则在正常关闭时刷新异步插入队列


## async_insert_threads {#async_insert_threads}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于在后台实际解析和插入数据的最大线程数。设置为零表示禁用异步模式


## async_load_databases {#async_load_databases}

<SettingsInfoBlock type='Bool' default_value='1' />
异步加载数据库和表。

- 如果为 `true`,所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的非系统数据库将在 ClickHouse 服务器启动后异步加载。请参阅 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载完成的表的查询都将等待该表启动。如果加载作业失败,查询将重新抛出错误(而不是像 `async_load_databases = false` 时那样关闭整个服务器)。至少被一个查询等待的表将以更高的优先级加载。对数据库执行的 DDL 查询将等待该数据库启动完成。还应考虑为等待查询的总数设置 `max_waiting_queries` 限制。
- 如果为 `false`,所有数据库将在服务器启动时加载。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database {#async_load_system_database}

<SettingsInfoBlock type='Bool' default_value='0' />
异步加载系统表。当 `system` 数据库中存在大量日志表和数据分区时,此设置非常有用。该设置独立于 `async_load_databases` 设置。

- 如果设置为 `true`,所有使用 `Ordinary`、`Atomic` 和 `Replicated` 引擎的系统数据库将在 ClickHouse 服务器启动后异步加载。请参阅 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的系统表的查询都将等待该表启动完成。至少被一个查询等待的表将以更高优先级加载。还应考虑设置 `max_waiting_queries` 来限制等待查询的总数。
- 如果设置为 `false`,系统数据库将在服务器启动前加载。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='120' />
更新重量级异步指标的时间间隔(以秒为单位)。


## asynchronous_insert_log {#asynchronous_insert_log}

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置,用于记录异步插入操作。

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


## asynchronous_metric_log {#asynchronous_metric_log}

在 ClickHouse Cloud 部署中默认启用。

如果该设置在您的环境中默认未启用,可根据 ClickHouse 的安装方式,按照以下说明进行启用或禁用。

**启用**

要手动启用异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md),请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` 文件,内容如下:

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

要禁用 `asynchronous_metric_log` 设置,请创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`,内容如下:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

<SettingsInfoBlock type='Bool' default_value='0' />
启用重型异步指标的计算。


## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='1' />
更新异步指标的时间周期(以秒为单位)。


## auth_use_forwarded_address {#auth_use_forwarded_address}

对通过代理连接的客户端使用原始地址进行身份验证。

:::note
此设置应格外谨慎使用,因为转发地址很容易被伪造——接受此类身份验证的服务器不应被直接访问,而应仅通过受信任的代理访问。
:::


## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于在后台对 [Buffer 引擎表](/engines/table-engines/special/buffer) 执行刷新操作的最大线程数。


## background_common_pool_size {#background_common_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
用于在后台对 [*MergeTree 引擎](/engines/table-engines/mergetree-family)表执行各种操作(主要是垃圾回收)的最大线程数。


## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于执行分布式发送操作的最大线程数。


## background_fetches_pool_size {#background_fetches_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于在后台从其他副本获取数据分片的最大线程数，适用于 [*MergeTree 引擎](/engines/table-engines/mergetree-family)表。


## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

<SettingsInfoBlock type='Float' default_value='2' />
设置线程数与可并发执行的后台合并和变更操作数之间的比率。

例如,如果该比率为 2 且 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置为 16,则 ClickHouse 可以并发执行 32 个后台合并操作。这是可行的,因为后台操作可以被挂起和延迟。这样做是为了给小型合并操作赋予更高的执行优先级。

:::note
只能在运行时增加此比率。要降低该比率,必须重启服务器。

与 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置一样,为保持向后兼容性,[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) 可以从 `default` 配置文件中应用。
:::


## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

<SettingsInfoBlock type='String' default_value='round_robin' />
后台合并和变更的调度策略。
可选值:`round_robin` 和 `shortest_task_first`。

用于选择后台线程池执行的下一个合并或变更操作的算法。该策略可在运行时更改,无需重启服务器。
为保持向后兼容性,可从 `default` 配置文件中应用。

可选值:

- `round_robin` — 所有并发的合并和变更操作按轮询顺序执行,以确保无饥饿运行。较小的合并会比较大的合并更快完成,因为需要合并的数据块更少。
- `shortest_task_first` — 始终优先执行较小的合并或变更操作。合并和变更操作根据其结果大小分配优先级,较小的合并严格优先于较大的合并。此策略可确保小数据部分以最快速度完成合并,但在 `INSERT` 操作频繁的分区中,可能导致大型合并操作无限期饥饿。


## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于执行消息流后台操作的最大线程数。


## background_move_pool_size {#background_move_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
用于在后台将 *MergeTree 引擎表的数据部分移动到其他磁盘或卷的最大线程数。


## background_pool_size {#background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
设置为使用 MergeTree 引擎的表执行后台合并和变更操作的线程数量。

:::note

- 为保持向后兼容性,此设置也可以在 ClickHouse 服务器启动时从 `default` 配置文件中应用。
- 运行时只能增加线程数量。
- 要减少线程数量,必须重启服务器。
- 通过调整此设置,可以管理 CPU 和磁盘负载。
  :::

:::danger
较小的池大小会占用较少的 CPU 和磁盘资源,但后台进程执行速度会变慢,最终可能影响查询性能。
:::

在更改此设置之前,请同时查看相关的 MergeTree 设置,例如:

- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**示例**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio}

<SettingsInfoBlock type='Float' default_value='0.8' />
线程池中可同时执行同一类型任务的线程数量的最大比例。


## background_schedule_pool_size {#background_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='512' />
用于持续执行轻量级周期性操作的最大线程数,这些操作包括复制表、Kafka 流式传输和 DNS 缓存更新。


## backup_log {#backup_log}

[backup_log](../../operations/system-tables/backup_log.md) 系统表的配置，用于记录 `BACKUP` 和 `RESTORE` 操作。

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

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
用于执行 `BACKUP` 请求的最大线程数。


## backups {#backups}

备份设置，用于执行 [`BACKUP` 和 `RESTORE`](../backup.md) 语句时使用。

可通过以下子标签进行配置：


<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Determines whether multiple backup operations can run concurrently on the same host.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Determines whether multiple restore operations can run concurrently on the same host.', 'true'),
    ('allowed_disk', 'String', 'Disk to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('allowed_path', 'String', 'Path to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Number of attempts to collect metadata before sleeping in case of inconsistency after comparing collected metadata.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Timeout in milliseconds for collecting metadata during backup.', '600000'),
    ('compare_collected_metadata', 'Bool', 'If true, compares the collected metadata with the existing metadata to ensure they are not changed during backup .', 'true'),
    ('create_table_timeout', 'UInt64', 'Timeout in milliseconds for creating tables during restore.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Maximum number of attempts to retry after encountering a bad version error during coordinated backup/restore.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Maximum sleep time in milliseconds before the next attempt to collect metadata.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Minimum sleep time in milliseconds before the next attempt to collect metadata.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'If the `BACKUP` command fails, ClickHouse will try to remove the files already copied to the backup before the failure,  otherwise it will leave the copied files as they are.', 'true'),
    ('sync_period_ms', 'UInt64', 'Synchronization period in milliseconds for coordinated backup/restore.', '5000'),
    ('test_inject_sleep', 'Bool', 'Testing related sleep', 'false'),
    ('test_randomize_order', 'Bool', 'If true, randomizes the order of certain operations for testing purposes.', 'false'),
    ('zookeeper_path', 'String', 'Path in ZooKeeper where backup and restore metadata is stored when using `ON CLUSTER` clause.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->

| 设置                                             | 类型   | 描述                                                                                                                                                                   | 默认值               |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | 确定是否允许在同一主机上并发运行多个备份操作。                                                                                          | `true`                |
| `allow_concurrent_restores`                         | Bool   | 确定是否允许在同一主机上并发运行多个恢复操作。                                                                                         | `true`                |
| `allowed_disk`                                      | String | 使用 `File()` 时备份的目标磁盘。必须设置此项才能使用 `File`。                                                                                       | ``                    |
| `allowed_path`                                      | String | 使用 `File()` 时备份的目标路径。必须设置此项才能使用 `File`。                                                                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | 在比较收集的元数据后发现不一致时,休眠前尝试收集元数据的次数。                                                           | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | 备份期间收集元数据的超时时间(毫秒)。                                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | 如果为 true,则将收集的元数据与现有元数据进行比较,以确保它们在备份期间未被更改。                                                            | `true`                |
| `create_table_timeout`                              | UInt64 | 恢复期间创建表的超时时间(毫秒)。                                                                                                                   | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | 在协调备份/恢复期间遇到版本错误后重试的最大次数。                                                                 | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 下次尝试收集元数据之前的最大休眠时间(毫秒)。                                                                                               | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | 下次尝试收集元数据之前的最小休眠时间(毫秒)。                                                                                               | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | 如果 `BACKUP` 命令失败,ClickHouse 将尝试删除失败前已复制到备份的文件,否则将保留已复制的文件。 | `true`                |
| `sync_period_ms`                                    | UInt64 | 协调备份/恢复的同步周期(毫秒)。                                                                                                        | `5000`                |
| `test_inject_sleep`                                 | Bool   | 与测试相关的休眠                                                                                                                                                         | `false`               |
| `test_randomize_order`                              | Bool   | 如果为 true,则为测试目的随机化某些操作的顺序。                                                                                                     | `false`               |
| `zookeeper_path`                                    | String | 使用 `ON CLUSTER` 子句时,在 ZooKeeper 中存储备份和恢复元数据的路径。                                                                                 | `/clickhouse/backups` |

此设置的默认值为：

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
可以在备份 IO 线程池上调度的最大作业数。
由于当前 S3 备份逻辑的原因,建议将此队列设置为无限制。

:::note
值为 `0`(默认值)表示无限制。
:::


## bcrypt_workfactor {#bcrypt_workfactor}

`bcrypt_password` 身份验证类型的工作因子，该类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。
工作因子定义了计算哈希值和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于需要高频身份验证的应用程序，
由于 bcrypt 在较高工作因子下存在较大的计算开销，
建议考虑使用其他身份验证方法。
:::


## blob_storage_log {#blob_storage_log}

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的配置项。

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


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

重新加载内置字典的时间间隔(以秒为单位)。

ClickHouse 每隔 x 秒重新加载内置字典。这使得可以在不重启服务器的情况下"动态"编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
设置缓存大小与 RAM 最大值的比率。允许在低内存系统上降低缓存大小。


## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

<SettingsInfoBlock type='Double' default_value='0' />
用于测试。


## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

<SettingsInfoBlock type='UInt64' default_value='15' />
服务器根据 cgroups 中相应阈值调整最大允许内存消耗的时间间隔(以秒为单位)。

若要禁用 cgroup 观察器,请将此值设置为 `0`。


## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
设置[编译表达式](../../operations/caches.md)的缓存大小（以元素为单位）。


## compiled_expression_cache_size {#compiled_expression_cache_size}

<SettingsInfoBlock type='UInt64' default_value='134217728' />
设置[编译表达式](../../operations/caches.md)的缓存大小（以字节为单位）。


## compression {#compression}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
如果您刚开始使用 ClickHouse,建议不要修改此配置。
:::

**配置模板**:

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

**`<case>` 字段**:

- `min_part_size` – 数据部分的最小大小。
- `min_part_size_ratio` – 数据部分大小与表大小的比率。
- `method` – 压缩方法。可接受的值:`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 压缩级别。请参阅 [编解码器](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**:

- 如果数据部分匹配某个条件集,ClickHouse 将使用指定的压缩方法。
- 如果数据部分匹配多个条件集,ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据部分不满足任何条件,ClickHouse 将使用 `lz4` 压缩。
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

<SettingsInfoBlock type='String' default_value='fair_round_robin' />
用于调度 CPU 槽位的策略,槽位数量由 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定。该算法用于控制有限的 CPU 槽位如何在并发查询之间分配。调度器可在运行时更改,无需重启服务器。

可能的值:

- `round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询最多分配 `max_threads` 个 CPU 槽位。每个线程占用一个槽位。发生资源竞争时,采用轮询方式向查询授予 CPU 槽位。注意,第一个槽位会被无条件授予,这可能导致不公平现象,当存在大量 `max_threads` = 1 的查询时,会增加 `max_threads` 值较高的查询的延迟。
- `fair_round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询最多分配 `max_threads - 1` 个 CPU 槽位。这是 `round_robin` 的变体,每个查询的第一个线程无需占用 CPU 槽位。这样一来,`max_threads` = 1 的查询不需要任何槽位,因此不会不公平地占用所有槽位。不存在无条件授予的槽位。


## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
允许所有查询运行的查询处理线程的最大数量,不包括从远程服务器检索数据的线程。这不是硬性限制。
当达到该限制时,查询仍将至少获得一个线程来运行。如果有更多线程可用,查询可以在执行期间扩展到所需的线程数量。

:::note
值为 `0`(默认)表示无限制。
:::


## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

<SettingsInfoBlock type='UInt64' default_value='0' />
与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同,但以 CPU 核心数的比率形式设置。


## config_reload_interval_ms {#config_reload_interval_ms}

<SettingsInfoBlock type='UInt64' default_value='2000' />
ClickHouse 重新加载配置并检查新更改的频率


## core_dump {#core_dump}

配置核心转储文件大小的软限制。

:::note
硬限制需通过系统工具进行配置
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption {#cpu_slot_preemption}

<SettingsInfoBlock type='Bool' default_value='0' />
定义 CPU 资源(MASTER THREAD 和 WORKER THREAD)的工作负载调度方式。

- 如果为 `true`(推荐),则根据实际消耗的 CPU 时间进行统计。竞争的工作负载将被分配公平的 CPU 时间。槽位在有限的时间内分配,过期后需要重新请求。在 CPU 资源过载的情况下,槽位请求可能会阻塞线程执行,即可能发生抢占。这确保了 CPU 时间的公平性。
- 如果为 `false`(默认),则根据分配的 CPU 槽位数量进行统计。竞争的工作负载将被分配公平数量的 CPU 槽位。槽位在线程启动时分配,持续持有,并在线程结束执行时释放。为查询执行分配的线程数量只能从 1 增加到 `max_threads`,永远不会减少。这对长时间运行的查询更有利,但可能导致短查询出现 CPU 资源不足。

**示例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
定义工作线程在抢占期间可以等待的毫秒数,
即等待获得另一个 CPU 槽位的时间。超过此超时时间后,如果
线程无法获取新的 CPU 槽位,它将退出,查询将动态缩减
到更少的并发执行线程数。请注意,
主线程永远不会被缩减,但可以被无限期抢占。仅当
启用 `cpu_slot_preemption` 并且为
WORKER THREAD 定义了 CPU 资源时才有意义。

**示例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
定义线程在获取 CPU 时间片后、请求下一个 CPU 时间片之前允许消耗的 CPU 纳秒数。仅在启用 `cpu_slot_preemption` 且为 MASTER THREAD 或 WORKER THREAD 定义了 CPU 资源时生效。

**示例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash_log.md) 系统表的操作设置。

可通过以下子标签配置这些设置:

| 设置                                | 描述                                                                                                                                          | 默认值               | 注意事项                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database`                         | 数据库名称。                                                                                                                                   |                     |                                                                                                                    |
| `table`                            | 系统表名称。                                                                                                                                   |                     |                                                                                                                    |
| `engine`                           | 系统表的 [MergeTree 引擎定义](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table)。                      |                     | 如果已定义 `partition_by` 或 `order_by`,则不能使用此参数。如果未指定,默认使用 `MergeTree`                                          |
| `partition_by`                     | 系统表的[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。                                                     |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `partition_by` 参数                                                 |
| `ttl`                              | 指定表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。                                                |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `ttl` 参数                                                          |
| `order_by`                         | 系统表的[自定义排序键](/engines/table-engines/mergetree-family/mergetree#order_by)。如果已定义 `engine`,则不能使用此参数。                                 |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `order_by` 参数                                                      |
| `storage_policy`                   | 表使用的存储策略名称(可选)。                                                                                                                      |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `storage_policy` 参数                                                |
| `settings`                         | 控制 MergeTree 行为的[附加参数](/engines/table-engines/mergetree-family/mergetree/#settings)(可选)。                                             |                     | 如果为系统表指定了 `engine`,则应在 'engine' 内部直接指定 `settings` 参数                                                      |
| `flush_interval_milliseconds`      | 将数据从内存缓冲区刷新到表的时间间隔。                                                                                                               | `7500`              |                                                                                                                    |
| `max_size_rows`                    | 日志的最大行数。当未刷新的日志数量达到此最大值时,日志将被转储到磁盘。                                                                                  | `1024`              |                                                                                                                    |
| `reserved_size_rows`               | 为日志预分配的内存大小(以行为单位)。                                                                                                                 | `1024`              |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | 行数阈值。达到该阈值时,将在后台启动日志刷新到磁盘的操作。                                                                                             | `max_size_rows / 2` |                                                                                                                    |
| `flush_on_crash`                   | 设置在发生崩溃时是否应将日志转储到磁盘。                                                                                                              | `false`             |                                                                                                                    |

默认服务器配置文件 `config.xml` 包含以下设置部分:

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


## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

此设置指定自定义缓存磁盘(通过 SQL 创建)的缓存路径。
对于自定义磁盘,`custom_cached_disks_base_directory` 的优先级高于 `filesystem_caches_path`(位于 `filesystem_caches_path.xml` 中),
当前者不存在时才会使用后者。
文件系统缓存设置路径必须位于该目录内,
否则将抛出异常并阻止磁盘创建。

:::note
这不会影响在旧版本中创建的磁盘(服务器已升级的情况)。
在这种情况下,不会抛出异常,以确保服务器能够成功启动。
:::

示例:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings)的前缀列表。多个前缀之间必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另请参阅**

- [自定义设置](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

<SettingsInfoBlock type='UInt64' default_value='480' />
已删除表可通过 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复的延迟时间。如果 `DROP TABLE` 使用 `SYNC` 修饰符运行,则忽略此设置。此设置的默认值为 `480`(8 分钟)。


## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

<SettingsInfoBlock type='UInt64' default_value='5' />
当删除表失败时,ClickHouse 将等待此超时时间后再重试该操作。


## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

<SettingsInfoBlock type='UInt64' default_value='16' />
用于删除表操作的线程池大小。


## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

<SettingsInfoBlock type='UInt64' default_value='86400' />
用于清理 `store/` 目录中无用数据的任务参数。设置该任务的调度周期。

:::note
值为 `0` 表示"永不执行"。默认值为 1 天。
:::


## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='3600' />
用于清理 `store/` 目录中垃圾文件的任务参数。如果某个子目录未被 clickhouse-server 使用,且该目录在最近
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)
秒内未被修改,该任务将通过移除所有访问权限来"隐藏"此目录。此功能同样适用于 clickhouse-server 不期望在 `store/` 目录中出现的目录。

:::note
值为 `0` 表示"立即执行"。
:::


## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='2592000' />
用于清理 `store/` 目录中垃圾文件的任务参数。如果某个子目录未被 clickhouse-server 使用,且之前已被"隐藏"(参见 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)),并且该目录在最近 [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改,则该任务将删除此目录。此参数同样适用于 clickhouse-server 不期望在 `store/` 目录中出现的目录。

:::note
值为 `0` 表示"永不删除"。默认值为 30 天。
:::


## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

<SettingsInfoBlock type='Bool' default_value='1' />
允许在 Replicated 数据库中永久分离表


## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables}

<SettingsInfoBlock type='Bool' default_value='0' />
从 Replicated 数据库中删除异常表，而不是将它们移动到单独的本地数据库


## dead_letter_queue {#dead_letter_queue}

用于配置 'dead_letter_queue' 系统表的设置。

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

<SettingsInfoBlock type='String' default_value='default' />
默认数据库名称。


## default_password_type {#default_password_type}

设置在 `CREATE USER u IDENTIFIED BY 'p'` 等查询中自动使用的密码类型。

可接受的值为:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile {#default_profile}

默认设置配置文件。设置配置文件位于 `user_config` 设置所指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```


## default_replica_name {#default_replica_name}

<SettingsInfoBlock type='String' default_value='{replica}' />
ZooKeeper 中的副本名称。

**示例**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path {#default_replica_path}

<SettingsInfoBlock
  type='String'
  default_value='/clickhouse/tables/{uuid}/{shard}'
/>
表在 ZooKeeper 中的路径。

**示例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout {#default_session_timeout}

默认会话超时时间（秒）。

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config {#dictionaries_config}

字典配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 \* 和 ?。

另请参阅：

- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load {#dictionaries_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
字典的延迟加载。

- 如果为 `true`,则每个字典在首次使用时加载。如果加载失败,使用该字典的函数会抛出异常。
- 如果为 `false`,则服务器在启动时加载所有字典。

:::note
服务器在启动时会等待所有字典加载完成后才接受连接
(例外:如果 [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) 设置为 `false`)。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

<SettingsInfoBlock type='UInt64' default_value='1000' />
对于启用了 `background_reconnect` 的失败 MySQL 和 Postgres 字典，重新连接尝试的时间间隔(以毫秒为单位)。


## disable_insertion_and_mutation {#disable_insertion_and_mutation}

<SettingsInfoBlock type='Bool' default_value='0' />
禁用插入/修改/删除查询。如果需要只读节点来防止插入和修改操作影响读取性能,可以启用此设置。即使启用了此设置,仍允许向外部引擎(S3、DataLake、MySQL、PostgreSQL、Kafka 等)执行插入操作。


## disable_internal_dns_cache {#disable_internal_dns_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
禁用内部 DNS 缓存。建议在基础设施频繁变更的系统(如 Kubernetes)中运行 ClickHouse 时使用。


## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下,通过 `HTTP` 代理发起 `HTTPS` 请求时会使用隧道技术(即 `HTTP CONNECT`)。此设置可用于禁用该功能。

**no_proxy**

默认情况下,所有请求都会通过代理。若要对特定主机禁用代理,必须设置 `no_proxy` 变量。
对于列表解析器和远程解析器,可以在 `<proxy>` 子句中设置该变量;对于环境解析器,可以将其设置为环境变量。
该变量支持 IP 地址、域名、子域名以及用于完全绕过的 `'*'` 通配符。前导点会被去除,处理方式与 curl 相同。

**示例**

以下配置会绕过对 `clickhouse.cloud` 及其所有子域名(例如 `auth.clickhouse.cloud`)的代理请求。
同样的规则也适用于 GitLab,即使它带有前导点。`gitlab.com` 和 `about.gitlab.com` 都会绕过代理。

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


## disk_connections_soft_limit {#disk_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
超过此限制的连接生存时间将显著缩短。此限制适用于磁盘连接。


## disk_connections_store_limit {#disk_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='30000' />
超过此限制的连接在使用后会被重置。设置为 0 可关闭连接缓存。此限制应用于磁盘连接。


## disk_connections_warn_limit {#disk_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='10000' />
当正在使用的连接数超过此限制时,将向日志写入警告消息。此限制适用于磁盘连接。


## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

<SettingsInfoBlock type='Bool' default_value='0' />
启用或禁用在表、数据库、表函数和字典的 `SHOW` 和 `SELECT` 查询中显示密钥信息。

希望查看密钥信息的用户还必须启用 [`format_display_secrets_in_show_and_select` 格式设置](../settings/formats#format_display_secrets_in_show_and_select)并具有 [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的值:

- `0` — 禁用。
- `1` — 启用。


## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client}

<SettingsInfoBlock type='Bool' default_value='1' />
缓存服务器是否应用从客户端接收到的限流设置。


## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio}

<SettingsInfoBlock type='Float' default_value='0.1' />
分布式缓存尝试保持空闲连接数量的软限制。当空闲连接数低于
distributed_cache_keep_up_free_connections_ratio * max_connections 时,
最早活动的连接将被关闭,直到连接数高于该限制。


## distributed_ddl {#distributed_ddl}

管理在集群上执行[分布式 DDL 查询](../../sql-reference/distributed-ddl.md)(`CREATE`、`DROP`、`ALTER`、`RENAME`)。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 时有效。

`<distributed_ddl>` 中的可配置设置包括:

| 设置                | 描述                                                                                                                       | 默认值                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | Keeper 中 DDL 查询 `task_queue` 的路径                                                                           |                                        |
| `profile`              | 用于执行 DDL 查询的配置文件                                                                                       |                                        |
| `pool_size`            | 可同时运行的 `ON CLUSTER` 查询数量                                                                           |                                        |
| `max_tasks_in_queue`   | 队列中可容纳的最大任务数                                                                             | `1,000`                                |
| `task_max_lifetime`    | 当节点存在时间超过此值时删除该节点                                                                                | `7 * 24 * 60 * 60`(一周的秒数) |
| `cleanup_delay_period` | 当收到新节点事件且距上次清理已超过 `cleanup_delay_period` 秒时,开始执行清理 | `60` 秒                           |

**示例**

```xml
<distributed_ddl>
    <!-- ZooKeeper 中 DDL 查询队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 此配置文件中的设置将用于执行 DDL 查询 -->
    <profile>default</profile>

    <!-- 控制可同时运行的 ON CLUSTER 查询数量 -->
    <pool_size>1</pool_size>

    <!--
         清理设置(活动任务不会被删除)
    -->

    <!-- 控制任务 TTL(默认 1 周) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理执行频率(以秒为单位) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可容纳的任务数量 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles}

<SettingsInfoBlock type='Bool' default_value='0' />
启用后,ON CLUSTER 查询将保留并使用发起者的用户和角色来在远程分片上执行。这可确保集群中访问控制的一致性,但要求该用户和角色在所有节点上都存在。


## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

<SettingsInfoBlock type='Bool' default_value='1' />
允许将域名解析为 IPv4 地址。


## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

<SettingsInfoBlock type='Bool' default_value='1' />
允许将域名解析为 IPv6 地址。


## dns_cache_max_entries {#dns_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000' />
内部 DNS 缓存最大条目数。


## dns_cache_update_period {#dns_cache_update_period}

<SettingsInfoBlock type='Int32' default_value='15' />
内部 DNS 缓存更新周期(以秒为单位)。


## dns_max_consecutive_failures {#dns_max_consecutive_failures}

<SettingsInfoBlock type='UInt32' default_value='10' />
在从 ClickHouse DNS 缓存中移除主机名之前,允许该主机名连续 DNS 解析失败的最大次数。


## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
用于删除分布式缓存的线程池的大小。


## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
用于删除分布式缓存的线程池的队列大小。


## enable_azure_sdk_logging {#enable_azure_sdk_logging}

<SettingsInfoBlock type='Bool' default_value='0' />
启用 Azure SDK 日志记录


## encryption {#encryption}

配置用于获取密钥的命令,该密钥将被[加密编解码器](/sql-reference/statements/create/table#encryption-codecs)使用。密钥应写入环境变量或在配置文件中设置。

密钥可以是十六进制格式或长度为 16 字节的字符串。

**示例**

从配置文件加载:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥,这样做不安全。您可以将密钥移至安全磁盘上的单独配置文件中,并在 `config.d/` 文件夹中创建指向该配置文件的符号链接。
:::

从配置文件加载十六进制格式的密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量加载密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 设置用于加密的当前密钥,所有指定的密钥均可用于解密。

以上每种方法都可以应用于多个密钥:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 指定用于加密的当前密钥。

此外,用户可以添加 nonce,其长度必须为 12 字节(默认情况下,加密和解密过程使用由零字节组成的 nonce):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

也可以设置为十六进制格式:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
以上所有内容同样适用于 `aes_256_gcm_siv`(但密钥长度必须为 32 字节)。
:::


## error_log {#error_log}

默认情况下处于禁用状态。

**启用**

要手动启用错误历史记录收集 [`system.error_log`](../../operations/system-tables/error_log.md),请创建 `/etc/clickhouse-server/config.d/error_log.xml` 文件,内容如下:

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

要禁用 `error_log` 设置,请创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`,内容如下:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
线程池中可调度的用于解析输入的最大作业数。

:::note
值为 `0` 表示不限制。
:::


## format_schema_path {#format_schema_path}

输入数据模式文件所在目录的路径,例如 [CapnProto](/interfaces/formats/CapnProto) 格式的模式文件。

**示例**

```xml
<!-- 包含各种输入格式模式文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
全局性能分析器的 CPU 时钟计时器周期(以纳秒为单位)。设置为 0 可关闭 CPU 时钟全局性能分析器。建议值:对于单个查询至少为 10000000(每秒 100 次),对于集群级性能分析为 1000000000(每秒 1 次)。


## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
全局性能分析器的实时时钟计时器周期(以纳秒为单位)。设置为 0 可关闭实时时钟全局性能分析器。建议值:单个查询至少为 10000000(每秒 100 次),集群范围的性能分析为 1000000000(每秒一次)。


## google_protos_path {#google_protos_path}

定义包含 Protobuf 类型的 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

向 [Graphite](https://github.com/graphite-project) 发送数据。

配置项:

- `host` – Graphite 服务器地址。
- `port` – Graphite 服务器端口。
- `interval` – 发送间隔,单位为秒。
- `timeout` – 发送数据的超时时间,单位为秒。
- `root_path` – 键名前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送时间段内累积的增量数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

可以配置多个 `<graphite>` 子句。例如,可以用于以不同的间隔发送不同的数据。

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


## graphite_rollup {#graphite_rollup}

Graphite 数据精简配置。

详细信息请参阅 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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


## hsts_max_age {#hsts_max_age}

HSTS 的过期时间(秒)。

:::note
值为 `0` 表示 ClickHouse 禁用 HSTS。如果设置为正数,则启用 HSTS,max-age 为所设置的数值。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
超过此限制的连接生存时间将显著缩短。此限制适用于不属于任何磁盘或存储的 HTTP 连接。


## http_connections_store_limit {#http_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
超过此限制的连接在使用后会被重置。设置为 0 可关闭连接缓存。此限制适用于不属于任何磁盘或存储的 HTTP 连接。


## http_connections_warn_limit {#http_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
当正在使用的连接数超过此限制时,将向日志写入警告消息。此限制适用于不属于任何磁盘或存储的 HTTP 连接。


## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理器。
要添加新的 http 处理器,只需添加一个新的 `<rule>`。
规则按定义顺序从上到下进行检查,
第一个匹配的规则将运行相应的处理器。

以下设置可通过子标签进行配置:

| 子标签               | 定义                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | 用于匹配请求 URL,可使用 'regex:' 前缀进行正则表达式匹配(可选)                                                           |
| `methods`            | 用于匹配请求方法,可使用逗号分隔多个方法(可选)                                                       |
| `headers`            | 用于匹配请求头,匹配每个子元素(子元素名称为请求头名称),可使用 'regex:' 前缀进行正则表达式匹配(可选) |
| `handler`            | 请求处理器                                                                                                                               |
| `empty_query_string` | 检查 URL 中是否不包含查询字符串                                                                                                    |

`handler` 包含以下设置,可通过子标签进行配置:

| 子标签           | 定义                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | 重定向的目标位置                                                                                                                                               |
| `type`             | 支持的类型:static、dynamic_query_handler、predefined_query_handler、redirect                                                                                    |
| `status`           | 与 static 类型配合使用,指定响应状态码                                                                                                                            |
| `query_param_name` | 与 dynamic_query_handler 类型配合使用,提取并执行 HTTP 请求参数中与 `<query_param_name>` 值对应的值                           |
| `query`            | 与 predefined_query_handler 类型配合使用,在调用处理器时执行查询                                                                                     |
| `content_type`     | 与 static 类型配合使用,指定响应的 content-type                                                                                                                           |
| `response_content` | 与 static 类型配合使用,指定发送给客户端的响应内容,当使用前缀 'file://' 或 'config://' 时,从文件或配置中查找内容并发送给客户端 |

除规则列表外,还可以指定 `<defaults/>` 以启用所有默认处理器。

示例:

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


## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求的响应中添加请求头。
`OPTIONS` 方法用于发起 CORS 预检请求。

更多信息请参阅 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

示例:

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


## http_server_default_response {#http_server_default_response}

访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."(末尾带换行符)

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
Iceberg 目录后台线程池的大小


## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
可推送到 Iceberg catalog 线程池队列中的任务数量


## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Iceberg 元数据文件缓存中的最大条目数。设置为零表示禁用缓存。


## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Iceberg 元数据文件缓存策略名称。


## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
Iceberg 元数据缓存的最大字节数。设置为 0 表示禁用。


## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Iceberg 元数据缓存中受保护队列(SLRU 策略下)相对于缓存总大小的比例。


## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

<SettingsInfoBlock type='Bool' default_value='1' />
如果为 true,ClickHouse 不会为 `CREATE VIEW` 查询中的空 SQL 安全语句写入默认值。

:::note
此设置仅在迁移期间必需,将在 24.4 版本中弃用
:::


## include_from {#include_from}

用于替换的文件路径。支持 XML 和 YAML 格式。

更多信息请参阅"[配置文件](/operations/configuration-files)"部分。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
二级索引标记缓存策略名称。


## index_mark_cache_size {#index_mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
索引标记缓存的最大大小。

:::note

值为 `0` 表示禁用。

此设置可在运行时修改并立即生效。
:::


## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.3' />
二级索引标记缓存中受保护队列(SLRU 策略下)相对于缓存总大小的比例。


## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
二级索引未压缩缓存的策略名称。


## index_uncompressed_cache_size {#index_uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
`MergeTree` 索引未压缩块缓存的最大大小。

:::note
值为 `0` 表示禁用。

此设置可在运行时修改并立即生效。
:::


## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
在使用 SLRU 策略时,二级索引未压缩缓存中受保护队列相对于缓存总大小的比例。


## interserver_http_credentials {#interserver_http_credentials}

用于在[复制](../../engines/table-engines/mergetree-family/replication.md)过程中连接到其他服务器的用户名和密码。此外,服务器使用这些凭据对其他副本进行身份验证。
因此,集群中所有副本的 `interserver_http_credentials` 必须相同。

:::note

- 默认情况下,如果省略 `interserver_http_credentials` 配置段,则复制过程中不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据[配置](../../interfaces/cli.md#configuration_files)无关。
- 这些凭据适用于通过 `HTTP` 和 `HTTPS` 进行的复制。
  :::

可以通过以下子标签进行配置:

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`,则即使设置了凭据,也允许其他副本在不进行身份验证的情况下连接。如果为 `false`,则拒绝未经身份验证的连接。默认值:`false`。
- `old` — 包含凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 配置段。

**凭据轮换**

ClickHouse 支持动态的服务器间凭据轮换,无需同时停止所有副本来更新其配置。凭据可以分多个步骤进行更改。

要启用身份验证,请将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这将同时允许带身份验证和不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

配置所有副本后,将 `allow_empty` 设置为 `false` 或删除此设置。这将强制要求使用新凭据进行身份验证。

要更改现有凭据,请将用户名和密码移至 `interserver_http_credentials.old` 配置段,并使用新值更新 `user` 和 `password`。此时,服务器使用新凭据连接到其他副本,并同时接受使用新凭据或旧凭据的连接。

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

当新凭据应用于所有副本后,可以删除旧凭据。


## interserver_http_host {#interserver_http_host}

其他服务器用于访问本服务器的主机名。

如果省略此配置,则其定义方式与 `hostname -f` 命令相同。

当需要绑定到特定网络接口时,此配置非常有用。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port {#interserver_http_port}

用于 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host {#interserver_https_host}

类似于 [`interserver_http_host`](#interserver_http_host),但此主机名用于其他服务器通过 `HTTPS` 协议访问本服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port {#interserver_https_port}

用于 ClickHouse 服务器之间通过 `HTTPS` 交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host {#interserver_listen_host}

限制可在 ClickHouse 服务器之间交换数据的主机。
如果使用了 Keeper,相同的限制也将应用于不同 Keeper 实例之间的通信。

:::note
默认情况下,该值等同于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型:

默认值:


## io_thread_pool_queue_size {#io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
IO 线程池中可调度的最大作业数。

:::note
值为 `0` 表示不限制。
:::


## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log}

<SettingsInfoBlock type='Bool' default_value='0' />
将 jemalloc 的采样分配信息存储在 system.trace_log 中


## jemalloc_enable_background_threads {#jemalloc_enable_background_threads}

<SettingsInfoBlock type='Bool' default_value='1' />
启用 jemalloc 后台线程。Jemalloc 使用后台线程来清理未使用的内存页。禁用该选项可能会导致性能下降。


## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler}

<SettingsInfoBlock type='Bool' default_value='0' />
为所有线程启用 jemalloc 的内存分配分析器。jemalloc 将对内存分配以及已采样分配的释放操作进行采样。可以使用 SYSTEM JEMALLOC FLUSH PROFILE 命令刷新分析数据,以便进行分配分析。采样数据也可以通过配置项 jemalloc_collect_global_profile_samples_in_trace_log 或查询设置 jemalloc_collect_profile_samples_in_trace_log 存储到 system.trace_log 表中。详见[内存分配分析](/operations/allocation-profiling)


## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
当全局峰值内存使用量增加 jemalloc_flush_profile_interval_bytes 字节后,将刷新 jemalloc 性能分析数据


## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded}

<SettingsInfoBlock type='Bool' default_value='0' />
当发生总内存超限错误时，将刷新 jemalloc 性能分析数据


## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
可创建的 jemalloc 后台线程的最大数量,设置为 0 时使用 jemalloc 的默认值


## keep_alive_timeout {#keep_alive_timeout}

<SettingsInfoBlock type='Seconds' default_value='30' />
ClickHouse 在关闭 HTTP 连接之前等待传入请求的秒数。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts}

动态设置。包含 ClickHouse 可能连接到的一组 [Zoo]Keeper 主机。不会公开来自 `<auxiliary_zookeepers>` 的信息


## keeper_multiread_batch_size {#keeper_multiread_batch_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
向支持批处理的 [Zoo]Keeper 发送 MultiRead 请求时的最大批次大小。设置为 0 时将禁用批处理。仅适用于 ClickHouse Cloud。


## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数,以便:

- 将其用作专用本地用户的身份验证器,这些用户指定了 'ldap' 身份验证机制而非 'password'
- 将其用作远程用户目录。

以下设置可通过子标签进行配置:

| 设置                        | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | LDAP 服务器主机名或 IP 地址,此参数为必填项且不能为空。                                                                                                                                                                                                                                                                                                                                                                               |
| `port`                         | LDAP 服务器端口,如果 `enable_tls` 设置为 true,则默认为 636,否则为 `389`。                                                                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | 用于构造绑定 DN 的模板。在每次身份验证尝试期间,通过将模板中的所有 `\{user_name\}` 子串替换为实际用户名来构造最终的 DN。                                                                                                                                                                                                                                                                                                               |
| `user_dn_detection`            | 包含用于检测绑定用户实际用户 DN 的 LDAP 搜索参数的配置段。这主要用于当服务器为 Active Directory 时在搜索过滤器中进行进一步的角色映射。生成的用户 DN 将在允许的任何位置替换 `\{user_dn\}` 子串时使用。默认情况下,用户 DN 设置为等于绑定 DN,但一旦执行搜索,它将更新为实际检测到的用户 DN 值。 |
| `verification_cooldown`        | 成功绑定尝试后的一段时间(以秒为单位),在此期间,用户将被视为对所有后续请求已成功进行身份验证,而无需联系 LDAP 服务器。指定 `0`(默认值)以禁用缓存并强制对每个身份验证请求联系 LDAP 服务器。                                                                                                                    |
| `enable_tls`                   | 用于启用到 LDAP 服务器的安全连接的标志。指定 `no` 表示明文 (`ldap://`) 协议(不推荐)。指定 `yes` 表示 LDAP over SSL/TLS (`ldaps://`) 协议(推荐,默认值)。指定 `starttls` 表示传统 StartTLS 协议(明文 (`ldap://`) 协议,升级到 TLS)。                                                                                                                 |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。可接受的值为:`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`(默认值)。                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。可接受的值为:`never`、`allow`、`try`、`demand`(默认值)。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tls_cert_file`                | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_file`             | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录路径。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | 允许的密码套件(使用 OpenSSL 表示法)。                                                                                                                                                                                                                                                                                                                                                                                                |

设置 `user_dn_detection` 可通过子标签进行配置:

| 设置         | 描述                                                                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | 用于构造 LDAP 搜索的基础 DN 的模板。在 LDAP 搜索期间,通过将模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子串替换为实际用户名和绑定 DN 来构造最终的 DN。                                                                                                        |
| `scope`         | LDAP 搜索的范围。可接受的值为:`base`、`one_level`、`children`、`subtree`(默认值)。                                                                                                                                                                                                                                            |
| `search_filter` | 用于构造 LDAP 搜索的搜索过滤器的模板。在 LDAP 搜索期间,通过将模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串替换为实际用户名、绑定 DN 和基础 DN 来构造最终的过滤器。注意,特殊字符必须在 XML 中正确转义。 |

示例:


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

示例（典型的 Active Directory，已配置用户 DN 检测，用于后续角色映射）：

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

ClickHouse 企业版许可密钥


## listen_backlog {#listen_backlog}

监听套接字的积压队列(待处理连接的队列大小)。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) 的默认值相同。

通常不需要更改此值,原因如下:

- 默认值已经足够大,
- 服务器使用独立线程来接受客户端连接。

因此,即使 `TcpExtListenOverflows`(来自 `nstat`)非零且此计数器在 ClickHouse 服务器上持续增长,也不意味着需要增加此值,原因如下:

- 通常如果 `4096` 不够用,说明 ClickHouse 存在内部扩展性问题,因此最好提交问题报告。
- 这并不意味着服务器稍后能够处理更多连接(即使可以,到那时客户端可能已经离开或断开连接)。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host {#listen_host}

限制可以发送请求的主机。如果希望服务器响应所有主机的请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port {#listen_reuse_port}

允许多个服务器监听同一地址和端口。操作系统会将请求随机路由到其中一个服务器。不建议启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型:

默认值:


## listen_try {#listen_try}

当尝试监听时,如果 IPv6 或 IPv4 网络不可用,服务器不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
用于加载标记的后台池大小


## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
可推送到预取线程池队列中的任务数量


## logger {#logger}

日志消息的位置和格式。

**配置项**:

| 配置项                    | 说明                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | 日志级别。可接受的值:`none`(关闭日志)、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                 |
| `log`                  | 日志文件的路径。                                                                                                                                          |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                    |
| `size`                 | 轮转策略:日志文件的最大大小(字节)。当日志文件大小超过此阈值时,将被重命名并归档,然后创建新的日志文件。 |
| `count`                | 轮转策略:ClickHouse 最多保留的历史日志文件数量。                                                                                        |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 启用。                                                                                                   |
| `console`              | 启用控制台日志输出。设置为 `1` 或 `true` 启用。如果 ClickHouse 未以守护进程模式运行,默认值为 `1`,否则为 `0`。                            |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level`。                                                                                                                 |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                 |
| `use_syslog`           | 同时将日志输出转发到 syslog。                                                                                                                                 |
| `syslog_level`         | 输出到 syslog 的日志级别。                                                                                                                                   |
| `async`                | 当设置为 `true`(默认值)时,日志将异步记录(每个输出通道一个后台线程)。否则将在调用 LOG 的线程内同步记录           |
| `async_queue_max_size` | 使用异步日志时,队列中等待刷新的最大消息数量。超出的消息将被丢弃                       |
| `startup_level`        | 启动级别用于在服务器启动时设置根日志记录器级别。启动完成后,日志级别将恢复为 `level` 设置                                   |
| `shutdown_level`       | 关闭级别用于在服务器关闭时设置根日志记录器级别。                                                                                            |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符来生成最终的文件名(目录部分不支持这些说明符)。

"示例"列显示了在 `2023-07-06 18:32:07` 时的输出。


| 说明符  | 说明                                                                                                      | 示例                         |
| ---- | ------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%` | 字面量 %                                                                                                   | `%`                        |
| `%n` | 换行符                                                                                                     |                            |
| `%t` | 水平 Tab 字符                                                                                               |                            |
| `%Y` | 以十进制表示的年份，例如 2017 年                                                                                     | `2023`                     |
| `%y` | 年份最后 2 位十进制数字（范围 [00,99]）                                                                               | `23`                       |
| `%C` | 年份的前两位数字，作为十进制数（范围 [00,99]）                                                                             | `20`                       |
| `%G` | 四位数的 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅与 `%V` 一起使用时才有意义 | `2023`                     |
| `%g` | [ISO 8601 按周计的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)的最后两位数字，即包含指定周的年份。                  | `23`                       |
| `%b` | 月份缩写名称，例如 Oct（依区域设置而定）                                                                                  | `Jul`                      |
| `%h` | %b 的同义词                                                                                                 | `Jul`                      |
| `%B` | 完整月份名称，例如 October（取决于区域设置）                                                                              | `7 月`                      |
| `%m` | 以十进制表示的月份（范围 [01,12]）                                                                                   | `07`                       |
| `%U` | 一年中的第几周（用十进制数表示）（星期日为一周的第一天）（范围 [00,53]）                                                                | `27`                       |
| `%W` | 一年中的周序号，十进制表示（星期一为一周的第一天）（范围 [00,53]）                                                                   | `27`                       |
| `%V` | ISO 8601 周编号（范围 [01,53]）                                                                                | `27`                       |
| `%j` | 一年中的第几天，以十进制数表示（范围 [001,366]）                                                                           | `187`                      |
| `%d` | 月份中的日，作为零填充的十进制数字（范围 [01,31]）。一位数前补零。                                                                   | `06`                       |
| `%e` | 以空格填充的十进制数形式表示的月份中的日期（范围为 [1,31]）。当为一位数时，前面补一个空格。                                                       | `&nbsp; 6`                 |
| `%a` | 星期的缩写名称，例如 Fri（取决于区域设置）                                                                                 | `周四`                       |
| `%A` | 完整的星期几名称，例如 Friday（取决于区域设置）                                                                             | `星期四`                      |
| `%w` | 以整数表示的星期几，其中星期日为 0（范围为 [0-6]）                                                                           | `4`                        |
| `%u` | 以十进制整数表示的星期几，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                                            | `4`                        |
| `%H` | 以十进制表示的小时数，24 小时制（范围 [00-23]）                                                                           | `18`                       |
| `%I` | 以十进制数表示的小时，12 小时制（范围 [01,12]）                                                                           | `06`                       |
| `%M` | 以十进制数表示的分钟（范围 [00,59]）                                                                                  | `32`                       |
| `%S` | 秒（十进制数，范围 [00,60]）                                                                                      | `07`                       |
| `%c` | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（取决于区域设置）                                                         | `Thu Jul  6 18:32:07 2023` |
| `%x` | 本地化日期表示（依赖于语言环境）                                                                                        | `2023-07-06`               |
| `%X` | 本地化时间表示，例如 18:40:20 或 6:40:20 PM（视区域设置而定）                                                               | `18:32:07`                 |
| `%D` | 短格式的 MM/DD/YY 日期，与 %m/%d/%y 等价                                                                          | `07/06/23`                 |
| `%F` | 短格式 YYYY-MM-DD 日期，与 %Y-%m-%d 等价                                                                         | `2023-07-06`               |
| `%r` | 基于区域设置的本地化 12 小时制时间                                                                                     | `06:32:07 PM`              |
| `%R` | 等同于 &quot;%H:%M&quot;                                                                                   | `18:32`                    |
| `%T` | 等同于 &quot;%H:%M:%S&quot;（ISO 8601 的时间格式）                                                                | `18:32:07`                 |
| `%p` | 本地化的 a.m./p.m. 标识（取决于区域设置）                                                                              | `PM`                       |
| `%z` | 与 UTC 的偏移量，采用 ISO 8601 格式（例如 -0430）；如果时区信息不可用，则留空                                                       | `+0800`                    |
| `%Z` | 取决于区域设置的时区名称或缩写；若无可用的时区信息，则为空字符串                                                                        | `Z AWST `                  |

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

如需只在控制台输出日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**按日志名称覆盖级别**

可以为单个日志名称单独设置日志级别。例如，要屏蔽日志记录器 &quot;Backup&quot; 和 &quot;RBAC&quot; 的所有消息。

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

要同时将日志消息写入 syslog：

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
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                             |
| `hostname` | 发送日志的主机名（可选）。                                                                                                                                                                                              |
| `facility` | syslog 的 [facility 关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用全大写形式，并带有 &quot;LOG&#95;&quot; 前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。默认值：如果指定了 `address`，则为 `LOG_USER`，否则为 `LOG_DAEMON`。 |
| `format`   | 日志消息格式。可选值：`bsd` 和 `syslog`。                                                                                                                                                                               |

**日志格式**

可以指定在控制台日志中输出的日志格式。目前仅支持 JSON。

**示例**

下面是 JSON 日志输出示例：

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "已接收信号 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

若要启用 JSON 日志支持，请使用以下代码片段：

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- 可以按通道单独配置(log、errorlog、console、syslog),也可以为所有通道全局配置(全局配置时省略此项即可)。 -->
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

可以通过修改 `<names>` 标签内的标签值来更改键名。比如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**在 JSON 日志中省略键**

可以通过将属性注释掉来省略日志属性。比如，如果不希望日志输出 `query_id`，可以将 `<query_id>` 标签注释掉。


## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，可以省略此配置。

更多信息请参阅[创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables)章节。

**示例**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
标记缓存策略名称。


## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
预热期间要填充的标记缓存总大小比例。


## mark_cache_size {#mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
标记缓存的最大大小([`MergeTree`](/engines/table-engines/mergetree-family) 系列表的索引)。

:::note
此设置可在运行时修改,并立即生效。
:::


## mark_cache_size_ratio {#mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
标记缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的大小。


## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
启动时用于加载活跃数据分区集合(Active 分区)的线程数。


## max_authentication_methods_per_user {#max_authentication_methods_per_user}

<SettingsInfoBlock type='UInt64' default_value='100' />
单个用户可创建或修改的身份验证方法的最大数量。更改此设置不会影响现有用户。如果超过此设置指定的限制,与身份验证相关的创建/修改查询将失败。非身份验证相关的创建/修改查询将正常执行。

:::note
值为 `0` 表示无限制。
:::


## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器上所有备份操作的最大读取速度(以字节/秒为单位)。设置为 0 表示不限速。


## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果备份 IO 线程池中的**空闲**线程数超过 `max_backup_io_thread_pool_free_size`,ClickHouse 将释放这些空闲线程占用的资源并减小线程池大小。如有需要,可以重新创建线程。


## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
ClickHouse 使用备份 IO 线程池中的线程执行 S3 备份 IO 操作。`max_backups_io_thread_pool_size` 用于限制该线程池中的最大线程数。


## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
构建向量索引时使用的最大线程数。

:::note
值为 `0` 表示使用所有 CPU 核心。
:::


## max_concurrent_insert_queries {#max_concurrent_insert_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
并发插入查询的总数限制。

:::note

值为 `0`(默认)表示不限制。

此设置可在运行时修改并立即生效。正在运行的查询不受影响。
:::


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
并发执行查询总数的限制。注意,还需要考虑 `INSERT` 和 `SELECT` 查询的限制,以及用户的最大查询数限制。

另请参阅:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

值为 `0`(默认)表示无限制。

此设置可在运行时修改并立即生效。已运行的查询不受影响。
:::


## max_concurrent_select_queries {#max_concurrent_select_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
并发执行的 SELECT 查询总数限制。

:::note

值为 `0`(默认值)表示无限制。

此设置可以在运行时修改并立即生效。已在运行的查询不受影响。
:::


## max_connections {#max_connections}

<SettingsInfoBlock type='Int32' default_value='4096' />
服务器最大连接数。


## max_database_num_to_throw {#max_database_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果数据库数量超过此值,服务器将抛出异常。0 表示不限制。


## max_database_num_to_warn {#max_database_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
如果已挂载的数据库数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

<SettingsInfoBlock type='UInt32' default_value='1' />
在 DatabaseReplicated 中副本恢复期间用于创建表的线程数。设置为零表示线程数等于 CPU 核心数。


## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果字典数量超过此值,服务器将抛出异常。

仅统计以下数据库引擎的表:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示不限制。
:::

**示例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
如果已加载的字典数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器从分布式缓存读取数据的最大总速度,以字节/秒为单位。设置为 0 表示不限速。


## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器分布式缓存的最大总写入速度,单位为字节/秒。零表示无限制。


## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

<SettingsInfoBlock type='UInt64' default_value='10000' />
聚合过程中收集的哈希表统计信息允许包含的最大条目数


## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
ALTER TABLE FETCH PARTITION 操作的线程数。


## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
解析输入数据的线程池中保留的最大空闲线程数。


## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
用于解析输入数据的最大线程总数。


## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果 IO 线程池中**空闲**线程的数量超过 `max_io_thread_pool_free_size`，ClickHouse 将释放这些空闲线程占用的资源并减小线程池大小。如有需要，可以重新创建线程。


## max_io_thread_pool_size {#max_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouse 使用 IO 线程池中的线程执行某些 IO 操作(例如与 S3 交互)。`max_io_thread_pool_size` 用于限制线程池中的最大线程数。


## max_keep_alive_requests {#max_keep_alive_requests}

<SettingsInfoBlock type='UInt64' default_value='10000' />
单个 keep-alive 连接允许的最大请求数,达到该数量后,ClickHouse 服务器将关闭该连接。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
本地读取的最大速度（字节/秒）。

:::note
值为 `0` 表示无限制。
:::


## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
本地写入的最大速度,单位为字节/秒。

:::note
值为 `0` 表示无限制。
:::


## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

<SettingsInfoBlock type='UInt64' default_value='0' />限制附加到表的物化视图数量。

:::note
此处仅考虑直接依赖的视图,不考虑基于其他视图创建视图的情况。
:::


## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器上所有合并操作的最大读取速度,以字节/秒为单位。零表示无限制。


## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器上所有 mutation 操作的最大读取速度,单位为字节/秒。零表示无限制。


## max_named_collection_num_to_throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果命名集合的数量超过此值,服务器将抛出异常。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
如果命名集合的数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files {#max_open_files}

可打开文件的最大数量。

:::note
建议在 macOS 上使用此选项,因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
操作系统 CPU 等待时间(OSCPUWaitMicroseconds 指标)与繁忙时间(OSCPUVirtualTimeMicroseconds 指标)之间的最大比率,达到此比率时考虑断开连接。
使用最小和最大比率之间的线性插值来计算断开连接的概率,当达到此比率时概率为 1。详情请参阅[控制服务器 CPU 过载时的行为](/operations/settings/server-overload)。


## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='32' />
启动时用于加载非活动数据分区集合(已过时分区)的线程数。


## max_part_num_to_warn {#max_part_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='100000' />
如果活跃数据分区的数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop {#max_partition_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
对删除分区的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop)(以字节为单位),则无法使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询删除分区。
此设置无需重启 ClickHouse 服务器即可生效。禁用此限制的另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值 `0` 表示可以无限制地删除分区。

此限制不适用于删除表和清空表操作,请参阅 [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
用于并发删除非活动数据分区的线程数。


## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type='UInt64' default_value='86400' />
如果任何待处理的变更操作超过指定的秒数值，
ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type='UInt64' default_value='500' />
当待处理的 mutation 数量超过指定值时,ClickHouse 服务器会向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果前缀反序列化线程池中的**空闲**线程数超过 `max_prefixes_deserialization_thread_pool_free_size`,ClickHouse 将释放这些空闲线程占用的资源并减小线程池大小。必要时可以重新创建线程。


## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouse 使用前缀反序列化线程池中的线程,并行读取 MergeTree 表 Wide 部分中文件前缀的列和子列元数据。`max_prefixes_deserialization_thread_pool_size` 用于限制该线程池中的最大线程数。


## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
读取操作时通过网络进行数据交换的最大速度(以字节/秒为单位)。

:::note
值为 `0`(默认)表示无限制。
:::


## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
写入操作时通过网络进行数据交换的最大速度,单位为字节/秒。

:::note
值为 `0`(默认值)表示无限制。
:::


## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
副本数据拉取时通过网络进行数据交换的最大速度,单位为字节/秒。
设置为 0 表示不限速。


## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
副本发送时网络数据交换的最大速度,单位为字节/秒。
零表示无限制。


## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果复制表的数量超过此值,服务器将抛出异常。

仅统计以下数据库引擎的表:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示不限制。
:::

**示例**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage}

<SettingsInfoBlock type='UInt64' default_value='0' />
服务器允许使用的最大内存量,以字节表示。

:::note
服务器的最大内存消耗还会受到 `max_server_memory_usage_to_ram_ratio` 设置的进一步限制。
:::

特殊情况下,值为 `0`(默认值)表示服务器可以使用所有可用内存(不包括 `max_server_memory_usage_to_ram_ratio` 施加的进一步限制)。


## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.9' />
服务器允许使用的最大内存量,以相对于所有可用内存的比率表示。

例如,值为 `0.9`(默认值)表示服务器最多可使用 90% 的可用内存。

允许在低内存系统上降低内存使用量。
在 RAM 和交换空间较少的主机上,可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置为大于 1。

:::note
服务器的最大内存消耗还会受到 `max_server_memory_usage` 设置的进一步限制。
:::


## max_session_timeout {#max_session_timeout}

最大会话超时时间,以秒为单位。

示例:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw {#max_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果表的数量超过此值,服务器将抛出异常。

以下类型的表不计入:

- view
- remote
- dictionary
- system

仅统计以下数据库引擎中的表:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示不限制。
:::

**示例**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn {#max_table_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='5000' />
如果已附加表的数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop {#max_table_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
对删除表的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop`(以字节为单位),则无法使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询将其删除。

:::note
值为 `0` 表示可以删除所有表而不受任何限制。

此设置无需重启 ClickHouse 服务器即可应用。禁用此限制的另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
用于外部聚合、连接或排序的最大存储空间。超过此限制的查询将失败并抛出异常。

:::note
值为 `0` 表示无限制。
:::

另请参阅:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)


## max_thread_pool_free_size {#max_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
如果全局线程池中**空闲**线程的数量大于
[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size),
则 ClickHouse 将释放部分线程占用的资源,并减小线程池的大小。
如有需要,可以重新创建线程。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size {#max_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
ClickHouse 使用全局线程池中的线程来处理查询。如果没有空闲线程可用于处理查询,则会在线程池中创建新线程。
`max_thread_pool_size` 用于限制线程池中的最大线程数量。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
启动时用于加载非活动数据分区集合(非预期分区)的线程数。


## max_view_num_to_throw {#max_view_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
如果视图数量超过此值,服务器将抛出异常。

仅统计以下数据库引擎的表:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示不限制。
:::

**示例**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn {#max_view_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='10000' />
如果附加视图的数量超过指定值,ClickHouse 服务器将向 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
限制并发等待查询的总数。当所需表正在异步加载时,等待查询的执行会被阻塞(参见
[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases))。

:::note
在检查以下设置所控制的限制时,等待查询不计入统计:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

此修正是为了避免在服务器启动后立即达到这些限制。
:::

:::note

值为 `0`(默认)表示无限制。

此设置可在运行时修改并立即生效。已在运行的查询不受影响。
:::


## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

<SettingsInfoBlock type='Bool' default_value='0' />
后台内存工作进程是否应根据外部来源(如 jemalloc 和 cgroups)的信息来校正内部内存跟踪器


## memory_worker_period_ms {#memory_worker_period_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
后台内存工作线程的执行周期,用于修正内存跟踪器的内存使用量,并在内存使用率较高时清理未使用的页面。如果设置为 0,将根据内存使用来源采用默认值


## memory_worker_use_cgroup {#memory_worker_use_cgroup}

<SettingsInfoBlock type='Bool' default_value='1' />
使用当前 cgroup 的内存使用信息来修正内存跟踪。


## merge_tree {#merge_tree}

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优配置。

有关更多信息,请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload}

<SettingsInfoBlock type='String' default_value='default' />
用于控制合并操作与其他工作负载之间的资源使用和共享方式。指定的值将用作所有后台合并的 `workload` 设置值。可通过 merge tree 设置覆盖此值。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />
设置执行合并和变更操作时允许使用的内存上限。当 ClickHouse 达到设置的限制时,将不再调度新的后台合并或变更操作,但会继续执行已调度的任务。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
`merges_mutations_memory_usage_soft_limit` 的默认值按以下公式计算：
`memory_amount * merges_mutations_memory_usage_to_ram_ratio`。

**另请参阅：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)


## metric_log {#metric_log}

默认情况下处于禁用状态。

**启用**

要手动启用指标历史记录收集 [`system.metric_log`](../../operations/system-tables/metric_log.md),请创建 `/etc/clickhouse-server/config.d/metric_log.xml` 文件,内容如下:

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

要禁用 `metric_log` 设置,请创建文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`,内容如下:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
操作系统 CPU 等待时间(OSCPUWaitMicroseconds 指标)与繁忙时间(OSCPUVirtualTimeMicroseconds 指标)之间的最小比率,用于决定是否断开连接。
使用最小和最大比率之间的线性插值来计算断开连接的概率,在此点概率为 0。有关更多详细信息,请参阅[控制服务器 CPU 过载时的行为](/operations/settings/server-overload)。


## mlock_executable {#mlock_executable}

在启动后执行 `mlockall`,以降低首次查询的延迟,并防止 ClickHouse 可执行文件在高 IO 负载下被换出内存。

:::note
建议启用此选项,但会导致启动时间增加最多几秒钟。
请注意,如果没有 "CAP_IPC_LOCK" 能力,此设置将无法生效。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1024' />
此设置可避免频繁的打开/关闭调用(由于随后的页面错误,这些调用的开销非常大),并允许在多个线程和查询之间重用映射。该设置值表示映射区域的数量(通常等于映射文件的数量)。

可以通过以下系统表中的指标监控映射文件中的数据量:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` 在 [`system.metrics`](/operations/system-tables/metrics)、[`system.metric_log`](/operations/system-tables/metric_log) 中
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` 在 [`system.events`](/operations/system-tables/events)、[`system.processes`](/operations/system-tables/processes)、[`system.query_log`](/operations/system-tables/query_log)、[`system.query_thread_log`](/operations/system-tables/query_thread_log)、[`system.query_views_log`](/operations/system-tables/query_views_log) 中

:::note
映射文件中的数据量不会直接消耗内存,也不会计入查询或服务器的内存使用量——因为这些内存可以像操作系统页面缓存一样被丢弃。当 MergeTree 系列表中的旧数据部分被删除时,缓存会自动清除(文件会被关闭),也可以通过 `SYSTEM DROP MMAP CACHE` 查询手动清除。

此设置可以在运行时修改,并将立即生效。
:::


## mutation_workload {#mutation_workload}

<SettingsInfoBlock type='String' default_value='default' />
用于控制 mutation 与其他工作负载之间的资源使用和共享方式。指定的值将用作所有后台 mutation 的 `workload` 设置值。可通过 merge tree 设置覆盖此配置。

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## mysql_port {#mysql_port}

用于通过 MySQL 协议与客户端通信的端口。

:::note

- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
  :::

**示例**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport}

如果设置为 true,则要求客户端通过 [mysql_port](#mysql_port) 进行安全通信。带有 `--ssl-mode=none` 选项的连接将被拒绝。需配合 [OpenSSL](#openssl) 设置使用。


## openSSL {#openssl}

SSL 客户端/服务器配置。

SSL 支持由 `libpoco` 库提供。可用的配置选项说明请参见 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)。默认值可在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的配置项:


| 选项                            | 描述                                                                                                                                                                                                                                                                     | 默认值                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | PEM 证书对应的私钥文件路径。该文件可以同时包含私钥和证书。                                                                                                                                                                                                                                        |                                                                                            |
| `certificateFile`             | 以 PEM 格式存储的客户端/服务器证书文件路径。如果 `privateKeyFile` 已包含证书，则可以省略此项。                                                                                                                                                                                                            |                                                                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录的路径。如果指向的是文件，则该文件必须为 PEM 格式，并且可以包含多个 CA 证书。如果指向的是目录，则该目录必须为每个 CA 证书包含一个 .pem 文件。文件名是根据 CA 主题名称哈希值进行查找的。详细信息可参见 [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的 man 页面。 |                                                                                            |
| `verificationMode`            | 用于校验节点证书的方法。有关详细信息，请参阅 [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的说明。可选值：`none`、`relaxed`、`strict`、`once`。                                                                                           | `relaxed`                                                                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过该值，则验证将失败。                                                                                                                                                                                                                                           | `9`                                                                                        |
| `loadDefaultCAFile`           | 是否使用 OpenSSL 的内置 CA 证书。ClickHouse 假定内置 CA 证书位于文件 `/etc/ssl/cert.pem`（对应的目录为 `/etc/ssl/certs`），或者位于由环境变量 `SSL_CERT_FILE`（对应目录环境变量为 `SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                          | `true`                                                                                     |
| `cipherList`                  | 受支持的 OpenSSL 加密算法。                                                                                                                                                                                                                                                     | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 一起使用。可接受的值为：`true`、`false`。                                                                                                                                                                                                           | `false`                                                                                    |
| `sessionIdContext`            | 服务器为每个生成的标识符附加的一组唯一的随机字符。字符串长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。建议始终设置此参数，因为无论是服务器缓存会话还是客户端请求缓存，此参数都有助于避免问题。                                                                                                                                                        | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | 服务器缓存的最大会话数。值为 `0` 表示会话数不受限制。                                                                                                                                                                                                                                          | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | 服务器端会话缓存时间（单位：小时）。                                                                                                                                                                                                                                                     | `2`                                                                                        |
| `extendedVerification`        | 如果启用，则验证证书的 CN 或 SAN 是否与对端的主机名匹配。                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1`                | 是否要求 TLSv1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                    | `false`                                                                                    |
| `requireTLSv1_1`              | 需要 TLSv1.1 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                    | `false`                                                                                    |
| `requireTLSv1_2`              | 要求使用 TLSv1.2 连接。可接受的值：`true`、`false`。                                                                                                                                                                                                                                  | `false`                                                                                    |
| `fips`                        | 启用 OpenSSL 的 FIPS 模式。仅当所用库的 OpenSSL 版本支持 FIPS 时才受支持。                                                                                                                                                                                                                   | `false`                                                                                    |
| `privateKeyPassphraseHandler` | 用于获取访问私钥所需口令的类（PrivateKeyPassphraseHandler 的子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                      | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | 用于校验无效证书的类（CertificateHandler 的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | 禁止使用的协议。                                                                                                                                                                                                                                                               |                                                                                            |
| `preferServerCiphers`         | 客户端优先的服务器端密码套件。                                                                                                                                                                                                                                                        | `false`                                                                                    |

**配置示例：**

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
        <!-- 自签名证书使用：<verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 自签名证书使用：<name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry_span_log {#opentelemetry_span_log}

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的配置设置。

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

<SettingsInfoBlock type='UInt64' default_value='1000000' />
操作系统 CPU 繁忙时间的阈值(以微秒为单位,对应 OSCPUVirtualTimeMicroseconds 指标),用于判断 CPU 是否正在执行有效工作。当繁忙时间低于此值时,不会被认定为 CPU 过载。


## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler}

<SettingsInfoBlock type='Int32' default_value='0' />
分布式缓存 TCP 处理器线程的 Linux nice 值。值越小,CPU 优先级越高。

需要 CAP_SYS_NICE 权限,否则不生效。

可选值:-20 至 19。


## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate}

<SettingsInfoBlock type='Int32' default_value='0' />
合并和变更线程的 Linux nice 值。值越低,CPU 优先级越高。

需要 CAP_SYS_NICE 能力,否则不执行任何操作。

可选值:-20 至 19。


## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive}

<SettingsInfoBlock type='Int32' default_value='0' />
ZooKeeper 客户端中发送和接收线程的 Linux nice 值。值越低,CPU 优先级越高。

需要 CAP_SYS_NICE 能力,否则不执行任何操作。

可能的值:-20 至 19。


## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

<SettingsInfoBlock type='Double' default_value='0.15' />
用户空间页面缓存中需要保持空闲的内存限制比例。
类似于 Linux 的 min_free_kbytes 设置。


## page_cache_history_window_ms {#page_cache_history_window_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
已释放内存可被用户空间页面缓存重新使用前的延迟时间。


## page_cache_max_size {#page_cache_max_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
用户空间页缓存的最大大小。设置为 0 可禁用缓存。如果大于 page_cache_min_size,缓存大小将在此范围内持续调整,以在保持总内存使用量低于限制(max_server_memory_usage[_to_ram_ratio])的同时,尽可能使用可用内存。


## page_cache_min_size {#page_cache_min_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
用户空间页缓存的最小大小。


## page_cache_policy {#page_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
用户空间页缓存策略名称。


## page_cache_shards {#page_cache_shards}

<SettingsInfoBlock type='UInt64' default_value='4' />
将用户空间页面缓存分散到指定数量的分片上，以减少互斥锁争用。
实验性功能，通常不会提升性能。


## page_cache_size_ratio {#page_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
用户空间页缓存中受保护队列的大小相对于缓存总大小的比例。


## part_log {#part_log}

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件。例如,添加或合并数据。您可以使用该日志来模拟合并算法并比较它们的特性。您可以可视化合并过程。

事件记录在 [system.part_log](/operations/system-tables/part_log) 表中,而不是单独的文件中。您可以在 `table` 参数中配置此表的名称(见下文)。

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

<SettingsInfoBlock type='UInt64' default_value='30' />
完全删除 SharedMergeTree 数据分片的周期。仅在 ClickHouse Cloud 中可用


## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />
向 kill_delay_period 添加 0 到 x 秒之间的均匀分布随机值,以避免在表数量极大时出现惊群效应及由此导致的 ZooKeeper 拒绝服务问题。仅适用于 ClickHouse Cloud


## parts_killer_pool_size {#parts_killer_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
用于清理共享合并树过期部件的线程数。仅在 ClickHouse Cloud 中可用


## path {#path}

数据目录的路径。

:::note
必须包含尾部斜杠。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port {#postgresql_port}

用于通过 PostgreSQL 协议与客户端通信的端口。

:::note

- 正整数指定要监听的端口号
- 空值用于禁用通过 PostgreSQL 协议与客户端的通信
  :::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

如果设置为 true,则要求客户端通过 [postgresql_port](#postgresql_port) 进行安全通信。带有 `sslmode=disable` 选项的连接将被拒绝。需配合 [OpenSSL](#openssl) 设置使用。


## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
远程对象存储预取操作的后台线程池大小


## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
可推送到预取线程池队列中的任务数量


## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
前缀反序列化线程池中可调度的最大作业数。

:::note
值为 `0` 表示不限制。
:::


## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

<SettingsInfoBlock type='Bool' default_value='0' />
如果设置为 true,ClickHouse 将在启动之前创建所有已配置的 `system.*_log` 表。当启动脚本依赖这些表时,此设置会很有帮助。


## primary_index_cache_policy {#primary_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
主索引缓存策略名称。


## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
预热期间填充主键索引缓存总大小的比例。


## primary_index_cache_size {#primary_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
主索引缓存的最大大小(MergeTree 表引擎系列的索引)。


## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
主索引缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的比例。


## process_query_plan_packet {#process_query_plan_packet}

<SettingsInfoBlock type='Bool' default_value='0' />
此设置允许读取 QueryPlan 数据包。当启用 serialize_query_plan 时,该数据包将在分布式查询中发送。默认禁用此设置,以避免查询计划二进制反序列化过程中的错误可能引发的安全问题。

**示例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log {#processors_profile_log}

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的配置。

<SystemLogParameters />

默认配置如下：

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

公开指标数据供 [Prometheus](https://prometheus.io) 抓取。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。必须以 '/' 开头。
- `port` – `endpoint` 的端口号。
- `metrics` – 公开 [system.metrics](/operations/system-tables/metrics) 表中的指标。
- `events` – 公开 [system.events](/operations/system-tables/events) 表中的指标。
- `asynchronous_metrics` – 公开 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。
- `errors` - 公开自上次服务器重启以来按错误代码分类的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 表中获取。

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

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

定义用于 HTTP 和 HTTPS 请求的代理服务器,目前支持 S3 存储、S3 表函数和 URL 函数。

定义代理服务器有三种方式:

- 环境变量
- 代理列表
- 远程代理解析器

还支持使用 `no_proxy` 为特定主机绕过代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为指定协议配置代理服务器。如果您在系统上设置了这些变量,它应该可以无缝工作。

如果指定协议只有一个代理服务器且该代理服务器不会更改,这是最简单的方法。

**代理列表**

此方法允许您为一个协议指定一个或多个代理服务器。如果定义了多个代理服务器,ClickHouse 会以轮询方式使用不同的代理,在服务器之间平衡负载。如果一个协议有多个代理服务器且代理服务器列表不会更改,这是最简单的方法。

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

在下面的选项卡中选择父字段以查看其子字段:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                         |
| --------- | ---------------------------- |
| `<http>`  | 一个或多个 HTTP 代理的列表   |
| `<https>` | 一个或多个 HTTPS 代理的列表  |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段    | 描述             |
| ------- | ---------------- |
| `<uri>` | 代理的 URI       |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态更改。在这种情况下,您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求,远程解析器应返回代理主机。ClickHouse 将使用以下模板构建代理 URI:`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

在下面的选项卡中选择父字段以查看其子字段:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                       |
| --------- | -------------------------- |
| `<http>`  | 一个或多个解析器的列表\*   |
| `<https>` | 一个或多个解析器的列表\*   |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段         | 描述                           |
| ------------ | ------------------------------ |
| `<resolver>` | 解析器的端点和其他详细信息     |

:::note
您可以有多个 `<resolver>` 元素,但对于指定协议只使用第一个 `<resolver>`。该协议的任何其他 `<resolver>` 元素都会被忽略。这意味着负载均衡(如果需要)应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段                 | 描述                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `<endpoint>`         | 代理解析器的 URI                                                                                                                    |
| `<proxy_scheme>`     | 最终代理 URI 的协议。可以是 `http` 或 `https`。                                                                                     |
| `<proxy_port>`       | 代理解析器的端口号                                                                                                                  |
| `<proxy_cache_time>` | ClickHouse 应缓存来自解析器的值的时间(以秒为单位)。将此值设置为 `0` 会导致 ClickHouse 在每次 HTTP 或 HTTPS 请求时都联系解析器。 |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定:


| 顺序 | 设置                    |
|------|-------------------------|
| 1.   | 远程代理解析器          |
| 2.   | 代理列表                |
| 3.   | 环境变量                |

ClickHouse 会针对请求协议检查优先级最高的解析器类型。如果未定义，
则会检查下一个优先级较高的解析器类型，直到检查到环境变量解析器为止。
这也允许混合使用不同类型的解析器。



## query_cache {#query_cache}

[查询缓存](../query-cache.md) 配置。

以下设置可用:

| 设置                      | 描述                                                                                 | 默认值        |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | 缓存的最大字节数。`0` 表示禁用查询缓存。                                              | `1073741824`  |
| `max_entries`             | 缓存中存储的 `SELECT` 查询结果的最大数量。                                             | `1024`        |
| `max_entry_size_in_bytes` | 可保存到缓存中的 `SELECT` 查询结果的最大字节数。                                       | `1048576`     |
| `max_entry_size_in_rows`  | 可保存到缓存中的 `SELECT` 查询结果的最大行数。                                         | `30000000`    |

:::note

- 设置更改会立即生效。
- 查询缓存的数据分配在 DRAM 中。如果内存不足,请确保为 `max_size_in_bytes` 设置较小的值或完全禁用查询缓存。
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

<SettingsInfoBlock type='String' default_value='SLRU' />
查询条件缓存策略名称。


## query_condition_cache_size {#query_condition_cache_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
查询条件缓存的最大大小。 :::note 此设置可在运行时修改，并立即生效。 :::


## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
查询条件缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的比例。


## query_log {#query_log}

用于记录通过 [log_queries=1](../../operations/settings/settings.md) 设置接收到的查询的配置。

查询会被记录到 [system.query_log](/operations/system-tables/query_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。如果 ClickHouse 服务器更新时查询日志的结构发生了变化,旧结构的表会被重命名,并自动创建新表。

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


## query_masking_rules {#query_masking_rules}

基于正则表达式的规则,在将查询和所有日志消息存储到服务器日志、
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表以及发送到客户端的日志之前应用。这可以防止
SQL 查询中的敏感数据(如姓名、电子邮件、个人标识符或信用卡号)泄漏到日志中。

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

**配置字段**:

| 设置      | 描述                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| `name`    | 规则的名称(可选)                                                              |
| `regexp`  | RE2 兼容的正则表达式(必需)                                                    |
| `replace` | 敏感数据的替换字符串(可选,默认为六个星号)                                     |

掩码规则应用于整个查询(以防止格式错误或无法解析的查询泄漏敏感数据)。

[`system.events`](/operations/system-tables/events) 表包含计数器 `QueryMaskingRulesMatch`,用于记录查询掩码规则匹配的总次数。

对于分布式查询,每个服务器必须单独配置,否则传递到其他节点的子查询将在未掩码的情况下存储。


## query_metric_log {#query_metric_log}

默认情况下处于禁用状态。

**启用**

要手动启用指标历史记录收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md),请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml` 文件,内容如下:

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

要禁用 `query_metric_log` 设置,请创建文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`,内容如下:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log {#query_thread_log}

用于记录查询线程的设置,需配合 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置使用。

查询线程日志记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。当 ClickHouse 服务器更新导致查询线程日志结构发生变化时,旧结构的表会被重命名,并自动创建新表。

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


## query_views_log {#query_views_log}

用于记录与查询相关的视图(实时视图、物化视图等)的设置,需配合 [log_query_views=1](/operations/settings/settings#log_query_views) 设置使用。

查询日志记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中,而非单独的文件。您可以通过 `table` 参数更改表名(见下文)。

<SystemLogParameters />

如果表不存在,ClickHouse 会自动创建。如果 ClickHouse 服务器更新时查询视图日志的结构发生变化,旧结构的表将被重命名,并自动创建新表。

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


## remap_executable {#remap_executable}

用于使用大页(huge pages)重新分配机器代码("text")内存的设置。

:::note
此功能为高度实验性功能。
:::

示例:

```xml
<remap_executable>false</remap_executable>
```


## remote_servers {#remote_servers}

[Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值,请参阅"[配置文件](/operations/configuration-files)"章节。

**另请参阅**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [Replicated 数据库引擎](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

允许在 URL 相关存储引擎和表函数中使用的主机列表。

使用 `\<host\>` XML 标签添加主机时:

- 必须与 URL 中的形式完全一致,因为主机名会在 DNS 解析之前进行检查。例如:`<host>clickhouse.com</host>`
- 如果 URL 中明确指定了端口,则会将 host:port 作为整体进行检查。例如:`<host>clickhouse.com:80</host>`
- 如果指定主机时未指定端口,则允许该主机的任意端口。例如:如果指定了 `<host>clickhouse.com</host>`,则允许 `clickhouse.com:20` (FTP)、`clickhouse.com:80` (HTTP)、`clickhouse.com:443` (HTTPS) 等。
- 如果主机指定为 IP 地址,则按 URL 中指定的形式进行检查。例如:`[2a02:6b8:a::a]`。
- 如果存在重定向且已启用重定向支持,则会检查每个重定向(location 字段)。

例如:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name {#replica_group_name}

Replicated 数据库的副本组名称。

由 Replicated 数据库创建的集群将由同一组内的副本组成。
DDL 查询仅会等待同一组内的副本。

默认为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
用于数据分片拉取请求的 HTTP 连接超时时间。如果未显式设置,则从默认配置文件中的 `http_connection_timeout` 继承。


## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
用于获取数据分片请求的 HTTP 接收超时时间。如果未显式设置,则从默认配置文件的 `http_receive_timeout` 继承。


## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
数据分片拉取请求的 HTTP 发送超时时间。如果未显式设置,则继承自默认配置文件中的 `http_send_timeout`。


## replicated_merge_tree {#replicated_merge_tree}

用于 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优配置。此设置具有更高的优先级。

更多信息请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads}

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
执行 RESTORE 请求时使用的最大线程数。


## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
可缓存的 S3 凭证提供程序的最大数量


## s3_max_redirects {#s3_max_redirects}

<SettingsInfoBlock type='UInt64' default_value='10' />
允许的 S3 重定向跳数上限。


## s3_retry_attempts {#s3_retry_attempts}

<SettingsInfoBlock type='UInt64' default_value='500' />
Aws::Client::RetryStrategy 的配置参数,Aws::Client 会自动执行重试操作,设置为 0 表示不重试


## s3queue_disable_streaming {#s3queue_disable_streaming}

<SettingsInfoBlock type='Bool' default_value='0' />
禁用 S3Queue 中的流式处理,即使表已创建并附加了物化视图


## s3queue_log {#s3queue_log}

`s3queue_log` 系统表的配置。

<SystemLogParameters />

默认配置如下:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send_crash_reports {#send_crash_reports}

用于向 ClickHouse 核心开发团队发送崩溃报告的设置。

强烈建议启用此功能，特别是在预生产环境中。

配置项：

| 配置项                   | 说明                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | 用于启用该功能的布尔标志，默认值为 `true`。设置为 `false` 可禁止发送崩溃报告。                                |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，表示 ClickHouse 中的 bug。此布尔标志用于启用发送此类异常（默认值：`true`）。 |
| `endpoint`            | 您可以自定义用于发送崩溃报告的端点 URL。                                                                         |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path}

<SettingsInfoBlock type='String' default_value='/clickhouse/series' />
Keeper 中用于存储自增序列号的路径,由 `generateSerialID` 函数生成。每个序列将作为该路径下的一个节点。


## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

<SettingsInfoBlock type='Bool' default_value='1' />
如果设置为 true，将在堆栈跟踪中显示内存地址


## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

<SettingsInfoBlock type='Bool' default_value='1' />
如果设置为 true，ClickHouse 将在关闭之前等待正在运行的备份和恢复操作完成。


## shutdown_wait_unfinished {#shutdown_wait_unfinished}

<SettingsInfoBlock type='UInt64' default_value='5' />
等待未完成查询的延迟秒数


## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

<SettingsInfoBlock type='Bool' default_value='0' />
如果设置为 true,ClickHouse 将在关闭之前等待正在运行的查询完成。


## skip_binary_checksum_checks {#skip_binary_checksum_checks}

<SettingsInfoBlock type='Bool' default_value='0' />
跳过 ClickHouse 二进制文件校验和完整性检查


## ssh_server {#ssh_server}

首次连接时,主机密钥的公钥部分将被写入 SSH 客户端的 known_hosts 文件。

主机密钥配置默认为未启用状态。
取消主机密钥配置的注释,并提供相应 SSH 密钥的路径以启用它们:

示例:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
用于模拟物化视图创建延迟的调试参数


## storage_configuration {#storage_configuration}

允许对存储进行多磁盘配置。

存储配置遵循以下结构:

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

### 磁盘配置 {#configuration-of-disks}

`disks` 的配置遵循以下结构:

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

上述子标签定义了 `disks` 的以下配置项:

| 配置项                  | 说明                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | 磁盘名称,必须唯一。                                                         |
| `path`                  | 服务器数据的存储路径(`data` 和 `shadow` 目录)。路径必须以 `/` 结尾 |
| `keep_free_space_bytes` | 磁盘上预留的空闲空间大小。                                                              |

:::note
磁盘的顺序不影响配置。
:::

### 策略配置 {#configuration-of-policies}

上述子标签定义了 `policies` 的以下配置项:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | 卷名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | 位于该卷中的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | 可以驻留在该卷任一磁盘上的数据分片的最大大小。如果合并后的分片大小预期会大于 `max_data_part_size_bytes`，该分片将被写入下一个卷。基本上，此功能允许你将新的 / 较小的分片存储在热（SSD）卷上，当它们达到较大尺寸时将其移动到冷（HDD）卷上。如果策略只有一个卷，请不要使用此选项。                                                                 |
| `move_factor`                | 卷上可用空闲空间所占的比例。如果可用空间变少，数据将开始转移到下一个卷（如果存在）。在转移时，分片按大小从大到小（降序）排序，选择总大小足以满足 `move_factor` 条件的分片；如果所有分片的总大小仍不足，则会移动所有分片。                                                                                                             |
| `perform_ttl_move_on_insert` | 禁用在插入时移动已过期 TTL 的数据。默认情况下（启用时），如果我们插入一段根据“按生命周期迁移”规则已过期的数据，它会立即被移动到该规则中指定的卷 / 磁盘。这在目标卷 / 磁盘较慢（例如 S3）时可能显著减慢插入速度。如果禁用该设置，已过期的数据部分会先写入默认卷，然后立即根据过期 TTL 规则移动到指定的卷。 |
| `load_balancing`             | 磁盘负载均衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | 设置更新所有磁盘可用空间的超时时间（毫秒）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果该磁盘仅由 ClickHouse 使用，并且不会在运行时进行文件系统大小调整，则可以使用 `-1` 值。在所有其他情况下，不推荐这样做，因为最终会导致空间分配不正确。                                                                                                                   |
| `prefer_not_to_merge`        | 禁用在此卷上合并数据分片。注意：这可能有害并导致变慢。当启用此设置时（不要这么做），禁止在该卷上合并数据（这是不利的）。这允许控制 ClickHouse 如何与慢磁盘交互。我们建议完全不要使用此设置。                                                                                                                                                                                       |
| `volume_priority`            | 定义卷被填充的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并且在 1 到 N 的范围内连续覆盖（N 为指定的最大参数值），中间不能有缺失值。                                                                                                                                                                                                                                                                |

对于 `volume_priority`：
- 如果所有卷都设置了该参数，则按指定顺序确定优先级。
- 如果只有 _部分_ 卷设置了该参数，则未设置的卷具有最低优先级。已设置的卷按该参数值确定优先级，其余卷的优先级由它们在配置文件中彼此之间的描述顺序决定。
- 如果 _所有_ 卷都未设置该参数，则按它们在配置文件中的描述顺序确定优先级。
- 各卷的优先级可以不同。



## storage_connections_soft_limit {#storage_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
超过此限制的连接生存时间将显著缩短。此限制适用于存储连接。


## storage_connections_store_limit {#storage_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
超过此限制的连接在使用后会被重置。设置为 0 可关闭连接缓存。此限制应用于存储连接。


## storage_connections_warn_limit {#storage_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
当正在使用的连接数超过此限制时,将向日志写入警告消息。此限制适用于存储连接。


## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

<SettingsInfoBlock type='Bool' default_value='1' />
以 VERSION_FULL_OBJECT_KEY 格式写入磁盘元数据文件。默认启用。此设置已弃用。


## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

<SettingsInfoBlock type='Bool' default_value='1' />
启用后,在创建 SharedSet 和 SharedJoin 时会生成内部 UUID。仅适用于 ClickHouse Cloud


## table_engines_require_grant {#table_engines_require_grant}

如果设置为 true,用户需要获得授权才能使用特定引擎创建表,例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下,为保持向后兼容性,使用特定表引擎创建表时不需要授权,但您可以将此项设置为 true 来改变这一行为。
:::


## tables_loader_background_pool_size {#tables_loader_background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
设置后台池中执行异步加载作业的线程数。
后台池用于在服务器启动后异步加载表，
适用于没有查询等待该表的情况。如果存在大量表，
建议保持后台池中较少的线程数，
以便为并发查询执行预留 CPU 资源。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::


## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
设置前台池中执行加载作业的线程数。前台池用于在服务器开始监听端口之前同步加载表,以及加载等待中的表。前台池的优先级高于后台池。这意味着当前台池中有作业运行时,后台池不会启动任何作业。

:::note
值为 `0` 表示将使用所有可用的 CPU。
:::


## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
单个 TCP 连接在关闭前允许执行的最大查询数。设置为 0 表示不限制查询数量。


## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />
TCP 连接在关闭前的最大存活时间(以秒为单位)。设置为 0 表示连接存活时间不受限制。


## tcp_port {#tcp_port}

通过 TCP 协议与客户端通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure {#tcp_port_secure}

用于与客户端进行安全通信的 TCP 端口。需配合 [OpenSSL](#openssl) 设置使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port {#tcp_ssh_port}

SSH 服务器端口,允许用户通过 PTY 使用嵌入式客户端以交互方式连接并执行查询。

示例:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache {#temporary_data_in_cache}

使用此选项时,临时数据将存储在指定磁盘的缓存中。
在此配置段中,您需要指定类型为 `cache` 的磁盘名称。
在这种情况下,缓存和临时数据将共享同一存储空间,磁盘缓存可以被驱逐以腾出空间存储临时数据。

:::note
配置临时数据存储时只能使用以下选项之一:`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
:::

**示例**

`local_disk` 的缓存和临时数据都将存储在文件系统的 `/tiny_local_cache` 路径下,由 `tiny_local_cache` 管理。

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

<SettingsInfoBlock type='Bool' default_value='0' />
在分布式缓存中存储临时数据。


## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
文本索引字典块缓存的条目数量。设置为零表示禁用缓存。


## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
文本索引字典块缓存策略的名称。


## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
文本索引字典块的缓存大小。设置为零表示禁用缓存。

:::note
此设置可在运行时修改，修改后立即生效。
:::


## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
文本索引字典块缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的大小比例。


## text_index_header_cache_max_entries {#text_index_header_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='100000' />
文本索引头缓存的条目数量上限。设置为零表示禁用缓存。


## text_index_header_cache_policy {#text_index_header_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
文本索引头部缓存策略名称。


## text_index_header_cache_size {#text_index_header_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
文本索引头的缓存大小。设置为零表示禁用。

:::note
此设置可在运行时修改，修改后立即生效。
:::


## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
文本索引头缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的比例。


## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
文本索引倒排列表缓存的大小（以条目数计）。设置为零表示禁用。


## text_index_postings_cache_policy {#text_index_postings_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
文本索引倒排表缓存策略名称。


## text_index_postings_cache_size {#text_index_postings_cache_size}

<SettingsInfoBlock type='UInt64' default_value='2147483648' />
文本索引倒排列表的缓存大小。设置为零表示禁用。

:::note
该设置可在运行时修改,修改后立即生效。
:::


## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
文本索引倒排列表缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的比例。


## text_log {#text_log}

[text_log](/operations/system-tables/text_log) 系统表的配置，用于记录文本消息。

<SystemLogParameters />

此外：

| 设置 | 描述                                                                 | 默认值 |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | 将存储在表中的最大消息级别（默认为 `Trace`）。 | `Trace`       |

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


## thread_pool_queue_size {#thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
全局线程池中可调度的最大作业数。
增加队列大小会导致内存使用量增加。建议将此值设置为与
[`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) 相同。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
当 `local_filesystem_read_method = 'pread_threadpool'` 时,用于从本地文件系统读取数据的线程池中的线程数。


## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
线程池中可调度的本地文件系统读取作业的最大数量。


## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='250' />
当 `remote_filesystem_read_method = 'threadpool'` 时,用于从远程文件系统读取的线程池中的线程数。


## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
可在线程池中调度的从远程文件系统读取数据的最大作业数。


## threadpool_writer_pool_size {#threadpool_writer_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
对象存储写入请求的后台线程池大小


## threadpool_writer_queue_size {#threadpool_writer_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
可推送到后台线程池中处理对象存储写入请求的任务数量


## throw_on_unknown_workload {#throw_on_unknown_workload}

<SettingsInfoBlock type='Bool' default_value='0' />
定义当查询设置 'workload' 访问未知 WORKLOAD 时的行为。

- 如果为 `true`,尝试访问未知工作负载的查询将抛出 RESOURCE_ACCESS_DENIED 异常。在建立 WORKLOAD 层次结构并包含 WORKLOAD default 后,此设置有助于强制所有查询进行资源调度。
- 如果为 `false`(默认值),则为 'workload' 设置指向未知 WORKLOAD 的查询提供无限制访问,且不进行资源调度。这在设置 WORKLOAD 层次结构期间、添加 WORKLOAD default 之前非常重要。

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**另请参阅**

- [工作负载调度](/operations/workload-scheduling.md)


## timezone {#timezone}

服务器时区。

以 IANA 标识符的形式指定 UTC 时区或地理位置(例如 Africa/Abidjan)。

时区用于以下场景:当 DateTime 字段以文本格式输出(打印到屏幕或文件)时,以及从字符串获取 DateTime 时,需要在 String 和 DateTime 格式之间进行转换。此外,如果处理时间和日期的函数在输入参数中未指定时区,则会使用此时区设置。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另请参阅**

- [session_timezone](../settings/settings.md#session_timezone)


## tmp_path {#tmp_path}

本地文件系统上用于存储处理大型查询时产生的临时数据的路径。

:::note

- 配置临时数据存储时只能使用以下选项之一:`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- 路径末尾的斜杠是必需的。
  :::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy {#tmp_policy}

用于临时数据存储的策略。所有带有 `tmp` 前缀的文件将在启动时被删除。

:::note
将对象存储用作 `tmp_policy` 的建议:

- 在每个服务器上使用独立的 `bucket:path`
- 使用 `metadata_type=plain`
- 您可能还需要为此存储桶设置 TTL
  :::

:::note

- 只能使用以下一个选项来配置临时数据存储:`tmp_path`、`tmp_policy`、`temporary_data_in_cache`。
- `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` 将被忽略。
- 策略应该恰好包含 _一个卷_

更多信息请参阅 [MergeTree 表引擎](/engines/table-engines/mergetree-family/mergetree) 文档。
:::

**示例**

当 `/disk1` 已满时,临时数据将存储在 `/disk2` 上。

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


## top_level_domains_list {#top_level_domains_list}

定义要添加的自定义顶级域名列表,其中每个条目的格式为 `<name>/path/to/file</name>`。

例如:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另请参阅:

- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) 及其变体,
  该函数接受自定义 TLD 列表名称,返回域名中从顶级域名到第一个有效子域名的部分。


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
以等于 `total_memory_profiler_sample_probability` 的概率收集大小小于或等于指定值的随机内存分配。0 表示禁用。您可能需要将 'max_untracked_memory' 设置为 0，以使此阈值按预期工作。


## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
以等于 `total_memory_profiler_sample_probability` 的概率收集大小大于或等于指定值的随机内存分配。0 表示禁用。您可能需要将 'max_untracked_memory' 设置为 0，以使此阈值正常工作。


## total_memory_profiler_step {#total_memory_profiler_step}

<SettingsInfoBlock type='UInt64' default_value='0' />
每当服务器内存使用量超过下一个步长值(以字节为单位)时,内存分析器将收集内存分配的堆栈跟踪信息。设置为零表示禁用内存分析器。设置低于几兆字节的值会降低服务器性能。


## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

<SettingsInfoBlock type='Double' default_value='0' />
允许按指定概率收集随机的内存分配和释放操作,并将其写入
[system.trace_log](../../operations/system-tables/trace_log.md) 系统表,
其中 `trace_type` 为 `MemorySample`。
该概率应用于每次分配或释放操作,与分配大小无关。请注意,仅当未跟踪内存量超过未跟踪内存限制(默认值为 `4` MiB)时才会进行采样。如果降低
[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step)
的值,可以降低该限制。您可以将 `total_memory_profiler_step` 设置为 `1` 以实现更精细的采样粒度。

可能的值:

- 正双精度浮点数。
- `0` — 禁用向 `system.trace_log` 系统表写入随机分配和释放操作。


## trace_log {#trace_log}

[trace_log](/operations/system-tables/trace_log) 系统表的操作设置。

<SystemLogParameters />

默认服务器配置文件 `config.xml` 包含以下设置部分:

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


## uncompressed_cache_policy {#uncompressed_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
未压缩缓存策略名称。


## uncompressed_cache_size {#uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
MergeTree 系列表引擎使用的未压缩数据的最大大小(以字节为单位)。

服务器使用一个共享缓存。内存按需分配。当选项 `use_uncompressed_cache` 启用时使用该缓存。

在某些情况下,未压缩缓存对非常短的查询有利。

:::note
值为 `0` 表示禁用。

此设置可以在运行时修改并立即生效。
:::


## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
未压缩缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的比例。


## url_scheme_mappers {#url_scheme_mappers}

用于将缩短或符号化的 URL 前缀转换为完整 URL 的配置。

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

ZooKeeper 中数据分片头的存储方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 系列引擎。可以通过以下方式指定:

**在 `config.xml` 文件的 [merge_tree](#merge_tree) 部分进行全局配置**

ClickHouse 将此设置应用于服务器上的所有表。您可以随时更改此设置。当设置更改时,现有表的行为也会随之改变。

**为每个表单独配置**

创建表时,指定相应的[引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。具有此设置的现有表的行为不会改变,即使全局设置发生变化。

**可选值**

- `0` — 关闭功能。
- `1` — 开启功能。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper),则[复制表](../../engines/table-engines/mergetree-family/replication.md)使用单个 `znode` 以紧凑方式存储数据分片头。如果表包含大量列,此存储方式可以显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后,您无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群服务器上升级 ClickHouse 时需谨慎。不要一次性升级所有服务器。更安全的做法是在测试环境中或仅在集群的少数服务器上测试新版本的 ClickHouse。

已使用此设置存储的数据分片头无法恢复到之前的(非紧凑)表示形式。
:::


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

可执行用户自定义函数配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的相对路径。
- 路径可以包含通配符 \* 和 ?。

另请参阅：

- "[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)"。

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path {#user_defined_path}

存储用户自定义文件的目录。用于 SQL 用户自定义函数 [SQL 用户自定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories {#user_directories}

配置文件中包含以下设置的部分:

- 预定义用户配置文件的路径。
- 存储通过 SQL 命令创建的用户的文件夹路径。
- 存储和复制通过 SQL 命令创建的用户的 ZooKeeper 节点路径。

如果指定了此部分,则不会使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的项,项的顺序表示其优先级(项越靠前优先级越高)。

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

用户、角色、行策略、配额和配置文件也可以存储在 ZooKeeper 中:

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

您还可以定义 `memory` 部分——表示仅在内存中存储信息而不写入磁盘,以及 `ldap` 部分——表示在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为本地未定义用户的远程用户目录,请使用以下设置定义单个 `ldap` 部分:

| 设置  | 描述                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数为必填项且不能为空。                                                                                                                                                                                                                                                            |
| `roles`  | 包含本地定义角色列表的部分,这些角色将分配给从 LDAP 服务器检索的每个用户。如果未指定角色,用户在身份验证后将无法执行任何操作。如果在身份验证时列出的任何角色未在本地定义,则身份验证尝试将失败,就像提供的密码不正确一样。 |

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


## user_files_path {#user_files_path}

用户文件所在目录。用于表函数 [file()](../../sql-reference/table-functions/file.md) 和 [fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path {#user_scripts_path}

用户脚本文件所在的目录。用于可执行用户自定义函数 [可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认值：


## users_config {#users_config}

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 配置文件设置。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information {#validate_tcp_client_information}

<SettingsInfoBlock type='Bool' default_value='0' />
确定接收查询数据包时是否启用客户端信息验证。

默认值为 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
向量相似度索引缓存的条目数量大小。设置为零表示禁用缓存。


## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
向量相似性索引缓存策略名称。


## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
向量相似性索引的缓存大小。设置为零表示禁用。

:::note
该设置可在运行时修改,修改后立即生效。
:::


## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
向量相似度索引缓存中受保护队列(在使用 SLRU 策略时)相对于缓存总大小的大小比例。


## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type='Bool' default_value='1' />
此设置用于指定当 `dictionaries_lazy_load` 为 `false` 时的行为。
(如果 `dictionaries_lazy_load` 为 `true`,则此设置不起作用。)

如果 `wait_dictionaries_load_at_startup` 为 `false`,则服务器
将在启动时开始加载所有字典,并在加载的同时接收连接。
当查询首次使用某个字典时,如果该字典尚未加载完成,查询将等待其加载完成。
将 `wait_dictionaries_load_at_startup` 设置为 `false` 可以使 ClickHouse 启动更快,但某些查询的执行速度可能会变慢
(因为它们需要等待某些字典加载完成)。

如果 `wait_dictionaries_load_at_startup` 为 `true`,则服务器将在启动时等待
所有字典完成加载(无论成功与否),然后才接收任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path {#workload_path}

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**

- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)


## workload_zookeeper_path {#workload_zookeeper_path}

ZooKeeper 节点的路径,用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询。为确保一致性,所有 SQL 定义都作为单个 znode 的值进行存储。默认情况下不使用 ZooKeeper,定义存储在[磁盘](#workload_path)上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**

- [工作负载层次结构](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


## zookeeper {#zookeeper}

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表时使用 ZooKeeper 存储副本的元数据。如果不使用复制表,可以省略此参数部分。

可以通过以下子标签配置这些设置:

| 设置                                        | 描述                                                                                                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | ZooKeeper 端点。可以设置多个端点。例如:`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定尝试连接 ZooKeeper 集群时的节点顺序。 |
| `session_timeout_ms`                       | 客户端会话的最大超时时间,单位为毫秒。                                                                                                                                                                                      |
| `operation_timeout_ms`                     | 单个操作的最大超时时间,单位为毫秒。                                                                                                                                                                                           |
| `root` (可选)                          | 用作 ClickHouse 服务器所使用 znode 的根节点。                                                                                                                                                 |
| `fallback_session_lifetime.min` (可选) | 当主节点不可用时(负载均衡),备用节点 ZooKeeper 会话生命周期的最小限制。单位为秒。默认值:3 小时。                                                                   |
| `fallback_session_lifetime.max` (可选) | 当主节点不可用时(负载均衡),备用节点 ZooKeeper 会话生命周期的最大限制。单位为秒。默认值:6 小时。                                                                   |
| `identity` (可选)                      | ZooKeeper 访问所请求 znode 时所需的用户名和密码。                                                                                                                                                                          |
| `use_compression` (可选)               | 如果设置为 true,则在 Keeper 协议中启用压缩。                                                                                                                                                                                       |

还有 `zookeeper_load_balancing` 设置(可选),用于选择 ZooKeeper 节点选择算法:

| 算法名称                  | 描述                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | 随机选择一个 ZooKeeper 节点。                                                                                       |
| `in_order`                      | 选择第一个 ZooKeeper 节点,如果不可用则选择第二个,依此类推。                                            |
| `nearest_hostname`              | 选择主机名与服务器主机名最相似的 ZooKeeper 节点,通过名称前缀比较主机名。 |
| `hostname_levenshtein_distance` | 与 nearest_hostname 类似,但使用莱文斯坦距离方式比较主机名。                                         |
| `first_or_random`               | 选择第一个 ZooKeeper 节点,如果不可用则从剩余 ZooKeeper 节点中随机选择一个。                |
| `round_robin`                   | 选择第一个 ZooKeeper 节点,如果发生重新连接则选择下一个节点。                                                    |

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
    <!-- 可选。Chroot 后缀。必须存在。 -->
    <root>/path/to/zookeeper/node</root>
    <!-- 可选。ZooKeeper 摘要 ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

- [复制](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)


## zookeeper_log {#zookeeper_log}

[`zookeeper_log`](/operations/system-tables/zookeeper_log) 系统表的配置。

可通过以下子标签进行配置:

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
