---
'description': '本节包含服务器设置的描述，即无法在会话或查询级别更改的设置。'
'keywords':
- 'global server settings'
'sidebar_label': '服务器设置'
'sidebar_position': 57
'slug': '/operations/server-configuration-parameters/settings'
'title': '服务器设置'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 服务器设置

本节包含服务器设置的描述。这些设置无法在会话或查询级别更改。

有关 ClickHouse 中配置文件的更多信息，请查看 [""配置文件""](/operations/configuration-files)。

其他设置在 ""[设置](/operations/settings/overview)"" 部分进行了描述。在研究这些设置之前，我们建议您先阅读 [配置文件](/operations/configuration-files) 部分，并注意使用的替换（`incl` 和 `optional` 属性）。

## access_control_improvements {#access_control_improvements} 

访问控制系统的可选改进设置。

| 设置                                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值  |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`    | 设置没有宽松行策略的用户是否仍然可以使用 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且仅对 A 定义了行策略，那么如果此设置为 true，则用户 B 将看到所有行。如果此设置为 false，则用户 B 将看不到任何行。                                                                                                                                                                                                                                                                        | `true`  |
| `on_cluster_queries_require_cluster_grant`    | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `true`  |
| `select_from_system_db_requires_grant`        | 设置 `SELECT * FROM system.<table>` 是否需要任何授权，任何用户都可以执行此操作。如果设置为 true，那么此查询要求 `GRANT SELECT ON system.<table>`，就像普通的非系统表一样。例外情况：少数系统表（`tables`、`columns`、`databases` 和一些常量表如 `one`、`contributors`）仍可供所有人访问；如果授予 `SHOW` 权限（例如 `SHOW USERS`），则相应的系统表（即 `system.users`）将是可访问的。 | `true`  |
| `select_from_information_schema_requires_grant` | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权，任何用户都可以执行此操作。如果设置为 true，那么此查询要求 `GRANT SELECT ON information_schema.<table>`，就像普通表一样。                                                                                                                                                                                                                                                    | `true`  |
| `settings_constraints_replace_previous`       | 设置某个设置的设置配置文件中的约束是否会取消先前约束（在其他配置文件中定义）对该设置的作用，包括未由新约束设置的字段。它还启用 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                                                                         | `true`  |
| `table_engines_require_grant`                 | 设置使用特定表引擎创建表是否需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false` |
| `role_cache_expiration_time_seconds`          | 设置角色在角色缓存中存储的自上次访问以来的秒数。                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `600`   |

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
## access_control_path {#access_control_path} 

ClickHouse 服务器存储通过 SQL 命令创建的用户和角色配置的文件夹路径。

**另请参见**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)
## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />当超过 groupArray 中的最大数组元素大小时要执行的操作：`throw` 异常，或 `discard` 多余的值。
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 函数中每个数组元素的最大字节大小。此限制在序列化时检查，有助于避免大的状态大小。
## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
控制用户是否可以更改与不同功能级别相关的设置。

- `0` - 允许更改任何设置（实验性、测试版、生产）。
- `1` - 仅允许更改测试版和生产功能设置。实验性设置的更改会被拒绝。
- `2` - 仅允许更改生产设置。实验性或测试版设置的更改会被拒绝。

这相当于对所有 `EXPERIMENTAL` / `BETA` 功能设置只读约束。

:::note
值为 `0` 表示可以更改所有设置。
:::
## allow_implicit_no_password {#allow_implicit_no_password} 

禁止创建没有密码的用户，除非明确指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## allow_no_password {#allow_no_password} 

设置是否允许不安全密码类型 no_password。

```xml
<allow_no_password>1</allow_no_password>
```
## allow_plaintext_password {#allow_plaintext_password} 

设置是否允许明文密码类型（不安全）。

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />允许使用 jemalloc 内存。
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />如果为 true，则在优雅关闭时会刷新异步插入队列。
## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />在后台实际解析和插入数据的最大线程数。零表示禁用异步模式。
## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
异步加载数据库和表。

- 如果 `true`，则所有非系统数据库与 `Ordinary`、`Atomic` 和 `Replicated` 引擎将在 ClickHouse 服务器启动后异步加载。请参阅 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的表的查询将确切等待该表启动。如果加载任务失败，查询将重新抛出一个错误（而不是在 `async_load_databases = false` 的情况下关闭整个服务器）。至少有一个查询等待的表将被优先加载。对数据库的 DDL 查询将确切等待该数据库的启动。还可以考虑设置 `max_waiting_queries` 的限制，以限制总等待查询数。
- 如果 `false`，则服务器启动时加载所有数据库。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
异步加载系统表。如果 `system` 数据库中有大量日志表和分片，这将很有帮助。与 `async_load_databases` 设置无关。

- 如果设置为 `true`，则所有与 `Ordinary`、`Atomic` 和 `Replicated` 引擎的系统数据库将在 ClickHouse 服务器启动后异步加载。请参阅 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的系统表的查询将确切等待该表启动。至少有一个查询等待的表将被优先加载。还可以考虑设置 `max_waiting_queries` 设置，以限制总的等待查询数。
- 如果设置为 `false`，则系统数据库在服务器启动之前加载。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />更新重异步指标的时间间隔（以秒为单位）。
## asynchronous_insert_log {#asynchronous_insert_log} 

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置，用于记录异步插入。

<SystemLogParameters/>

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

默认情况下在 ClickHouse Cloud 部署中启用。

如果在您的环境中默认未启用此设置，则可以根据 ClickHouse 的安装方式，按照以下说明启用或禁用它。

**启用**

要手动启用异步 metric 日志历史收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`，并包含以下内容：

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

要禁用 `asynchronous_metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，并包含以下内容：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />启用重异步指标的计算。
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />更新异步指标的时间间隔（以秒为单位）。
## auth_use_forwarded_address {#auth_use_forwarded_address} 

对通过代理连接的客户端使用原始地址进行身份验证。

:::note
此设置需谨慎使用，因为转发地址很容易被伪造 - 接受此类身份验证的服务器不应直接访问，而应仅通过受信任的代理访问。
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于在后台执行 [Buffer-engine tables](/engines/table-engines/special/buffer) 的刷新操作的最大线程数。
## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于在后台执行各种操作（主要是垃圾收集）的最大线程数，适用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行分布式发送的最大线程数。
## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />在后台从另一个副本获取数据片段的最大线程数，适用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
设置线程数与可以并发执行的后台合并和变更数之间的比例。

例如，如果比例等于 2 并且 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置为 16，则 ClickHouse 可以并发执行 32 个后台合并。这是可能的，因为后台操作可以暂停和推迟。这是为了给予小的合并更高的执行优先级。

:::note
您只能在运行时增加此比例。要降低它，您必须重新启动服务器。

与 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置一样，[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) 也可以从 `default` 配置文件应用，以保持向后兼容性。
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
对后台合并和变更的调度执行策略。可能的值有：`round_robin` 和 `shortest_task_first`。

用于选择由后台线程池执行的下一个合并或变更的算法。策略可以在运行时更改，无需重启服务器。
可能从 `default` 配置文件应用以保持向后兼容性。

可能的值：

- `round_robin` — 每个并发合并和变更以轮询方式执行，以确保无饿死操作。较小的合并总是比较大的合并完成得更快，仅仅因为它们要合并的块更少。
- `shortest_task_first` — 始终执行较小的合并或变更。合并和变更根据其结果大小分配优先级。合并较小大小的总是严格优先于更大的合并。此策略确保快速合并小部分，但可能导致在大量 `INSERT` 操作过载的分区中大合并的无限饿死。
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于执行消息流的后台操作的最大线程数。
## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于将数据片段移动到另一个磁盘或卷的最大线程数，适用于 *MergeTree-engine 表的后台操作。
## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
设置用于 MergeTree 引擎表的后台合并和变更的线程数。

:::note
- 此设置也可以通过 `default` 配置文件在 ClickHouse 服务器启动时应用，以保持向后兼容性。
- 仅可在运行时增加线程数。
- 如果要减少线程数，必须重启服务器。
- 通过调整此设置，您可以管理 CPU 和磁盘负载。
:::

:::danger
较小的线程池大小会利用更少的 CPU 和磁盘资源，但后台进程的推进速度较慢，这可能最终会影响查询性能。
:::

在更改此设置之前，也请查看与 MergeTree 相关的设置，例如：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。

**示例**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />用于持续执行一些轻量级周期性操作的最大线程数，适用于复制表、Kafka 流和 DNS 缓存更新。
## backup_log {#backup_log} 

用于记录 `BACKUP` 和 `RESTORE` 操作的 [backup_log](../../operations/system-tables/backup_log.md) 系统表的设置。

<SystemLogParameters/>

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />执行 `BACKUP` 请求的最大线程数。
## backups {#backups} 

用于写入 `BACKUP TO File()` 时的备份设置。

可以通过子标签配置以下设置：

| 设置                                | 描述                                                                                                                                                                    | 默认值  |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | 使用 `File()` 时备份的路径。此设置必须设置才能使用 `File`。路径可以相对于实例目录，也可以是绝对路径。                                                             | `true`  |
| `remove_backup_files_after_failure` | 如果 `BACKUP` 命令失败，ClickHouse 将尝试删除在故障之前已复制到备份的文件，否则将保留已复制的文件。                                                                  | `true`  |

此设置的默认配置为：

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
可以在备份 IO 线程池中调度的最大作业数。由于当前 S3 备份逻辑，建议将此队列保持为无限制。

:::note
值为 `0`（默认）表示无限。
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

用于 bcrypt_password 身份验证类型的工作因子，该类型使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/)。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## blog_storage_log {#blog_storage_log} 

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的设置。

<SystemLogParameters/>

示例：

```xml
<blob_storage_log>
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval} 

重新加载内置字典的时间间隔（以秒为单位）。

ClickHouse 每个 x 秒钟重新加载内置字典。这使得可以在不重启服务器的情况下“即时”编辑字典。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />设置缓存大小与 RAM 最大比例。允许在内存不足的系统上降低缓存大小。
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />用于测试目的。
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />
指定根据 cgroups 的服务器进程的内存使用的“硬”阈值，超过该阈值后，服务器的最大内存使用量将调整到该阈值。

请参阅设置：
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
指定根据 cgroups 的服务器进程的内存使用的“软”阈值，超过该阈值后将清空 jemalloc 中的区域。

请参阅设置：
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
服务器允许的最大内存使用量在 cgroups 中根据相应阈值进行调整的时间间隔（以秒为单位）。

要禁用 cgroup 观察器，请将此值设置为 `0`。

请参阅设置：
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)。
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />设置 [编译表达式](../../operations/caches.md) 的缓存大小（以元素为单位）。
## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />设置 [编译表达式](../../operations/caches.md) 的缓存大小（以字节为单位）。
## compression {#compression} 

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
我们建议在刚开始使用 ClickHouse 时不要更改此设置。
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

- `min_part_size` – 数据片段的最小大小。
- `min_part_size_ratio` – 数据片段大小与表大小的比率。
- `method` – 压缩方法。可接受的值：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 压缩级别。查看 [编码](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**：

- 如果数据片段与设置的条件匹配，ClickHouse 将使用指定的压缩方法。
- 如果数据片段与多个条件集匹配，ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据片段没有满足条件，ClickHouse 将使用 `lz4` 压缩。
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

<SettingsInfoBlock type="String" default_value="round_robin" />
对由 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定的 CPU 插槽执行调度的策略。用于管理有限 CPU 插槽数量如何在并发查询中分配的算法。调度程序可以在运行时更改，无需重启服务器。

可能的值：

- `round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询分配最多 `max_threads` 个 CPU 插槽。每个线程一个插槽。在竞争中，CPU 插槽以轮询方式授予查询。请注意，第一个插槽无条件给予，这可能导致不公平和高 `max_threads` 查询在大量查询中（`max_threads` = 1）时的延迟增加。
- `fair_round_robin` — 每个设置了 `use_concurrency_control` = 1 的查询分配最多 `max_threads - 1` 个 CPU 插槽。`round_robin` 的变体，不需要为每个查询的第一个线程分配 CPU 插槽。这样 `max_threads` = 1 的查询无需任何插槽，不能不公平地分配所有插槽。没有插槽无条件授予。
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
运行所有查询所允许的最大查询处理线程数（不包括从远程服务器检索数据的线程）。这不是一个硬限制。如果超过该限制，查询仍将获得至少一个线程来运行。查询可以在执行过程中根据可用线程的更多数量进行扩展。

:::note
值为 `0`（默认）表示无限制。
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同，但按核心比率。
## config_reload_interval_ms {#config_reload_interval_ms}

<SettingsInfoBlock type="UInt64" default_value="2000" />
ClickHouse 重新加载配置并检查新更改的频率

## core_dump {#core_dump}

配置核心转储文件大小的软限制。

:::note
硬限制通过系统工具配置。
:::

**示例**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## crash_log {#crash_log}

[crash_log](../../operations/system-tables/crash-log.md)系统表操作的设置。

<SystemLogParameters/>

默认服务器配置文件`config.xml`包含以下设置部分：

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

该设置指定自定义（从 SQL 创建）缓存磁盘的缓存路径。
`custom_cached_disks_base_directory` 对自定义磁盘的优先级高于 `filesystem_caches_path`（在`filesystem_caches_path.xml`中找到），如果前者不存在，则使用后者。
文件系统缓存设置路径必须位于该目录内，否则将引发异常，阻止磁盘的创建。

:::note
这不会影响在服务器升级后的旧版本中创建的磁盘。
在这种情况下，不会引发异常，以允许服务器成功启动。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## custom_settings_prefixes {#custom_settings_prefixes}

[自定义设置](/operations/settings/query-level#custom_settings)的前缀列表。前缀必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另见**

- [自定义设置](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

<SettingsInfoBlock type="UInt64" default_value="480" />
丢弃表后可以使用 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复的延迟。如果 `DROP TABLE` 以 `SYNC` 修饰符运行，则该设置被忽略。
该设置的默认值为 `480`（8 分钟）。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

<SettingsInfoBlock type="UInt64" default_value="5" />如果表删除失败，ClickHouse 在重试操作之前将等待此超时。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

<SettingsInfoBlock type="UInt64" default_value="16" />用于删除表的线程池的大小。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

<SettingsInfoBlock type="UInt64" default_value="86400" />
清理 `store/` 目录中的垃圾的任务参数。
设置任务的调度周期。

:::note
值为 `0` 意味着“从不”。默认值对应 1 天。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

<SettingsInfoBlock type="UInt64" default_value="3600" />
清理 `store/` 目录中的垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且该目录在最后 [`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒内未被修改，则任务将通过移除所有访问权限来“隐藏”该目录。它也适用于 clickhouse-server 不期望在 `store/` 中看到的目录。

:::note
值为 `0` 意味着“立即”。
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

<SettingsInfoBlock type="UInt64" default_value="2592000" />
清理 `store/` 目录中的垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且它之前被“隐藏”（见 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)），并且该目录在最近 [`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改，则任务将删除该目录。
它也适用于 clickhouse-server 不期望在 `store/` 中看到的目录。

:::note
值为 `0` 意味着“从不”。默认值对应 30 天。
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

<SettingsInfoBlock type="Bool" default_value="1" />允许在复制数据库中永久分离表。

## default_database {#default_database}

<SettingsInfoBlock type="String" default_value="default" />默认数据库名称。

## default_password_type {#default_password_type}

设置在查询中自动设置的密码类型，例如 `CREATE USER u IDENTIFIED BY 'p'`。

接受的值为：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## default_profile {#default_profile}

默认设置配置文件。设置配置文件位于设置 `user_config` 指定的文件中。

**示例**

```xml
<default_profile>default</default_profile>
```

## default_replica_name {#default_replica_name}

<SettingsInfoBlock type="String" default_value="{replica}" />
ZooKeeper 中的副本名称。

**示例**

```xml
<default_replica_name>{replica}</default_replica_name>
```

## default_replica_path {#default_replica_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
ZooKeeper 中表的路径。

**示例**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```

## default_session_timeout {#default_session_timeout}

默认会话超时，单位为秒。

```xml
<default_session_timeout>60</default_session_timeout>
```

## dictionaries_config {#dictionaries_config}

字典的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[字典](../../sql-reference/dictionaries/index.md)"。

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## dictionaries_lazy_load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />
字典的懒加载。

- 如果 `true`，则每个字典在第一次使用时加载。如果加载失败，使用字典的函数将引发异常。
- 如果 `false`，则服务器在启动时加载所有字典。

:::note
服务器将在启动时等待所有字典加载完成后再接收任何连接（例外：如果 [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) 设置为 `false`）。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

<SettingsInfoBlock type="UInt64" default_value="1000" />启用背景重连的 MySQL 和 Postgres 字典的重连尝试间隔（毫秒）。

## disable_insertion_and_mutation {#disable_insertion_and_mutation}

<SettingsInfoBlock type="Bool" default_value="0" />
禁用所有插入/更改/删除查询。如果有人需要只读节点以防止插入和变更影响读取性能，将启用此设置。

## disable_internal_dns_cache {#disable_internal_dns_cache}

<SettingsInfoBlock type="Bool" default_value="0" />禁用内部 DNS 缓存。建议在基础设施更改频繁的系统中（如 Kubernetes）操作 ClickHouse。

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

默认情况下，隧道（即 `HTTP CONNECT`）用于通过 `HTTP` 代理进行 `HTTPS` 请求。可以使用此设置禁用它。

**no_proxy**

默认情况下，所有请求都会通过代理。为了对特定主机禁用它，必须设置 `no_proxy` 变量。
它可以在 `<proxy>` 子句中设置，适用于列表和远程解析程序，作为环境解析程序的环境变量。
它支持 IP 地址、域名、子域名和 `'*'` 通配符以完全绕过。前导点会被剥离，和 curl 的行为一致。

**示例**

以下配置绕过对 `clickhouse.cloud` 及其所有子域（例如 `auth.clickhouse.cloud`）的代理请求。
同样适用于 GitLab，尽管它有一个前导点。 `gitlab.com` 和 `about.gitlab.com` 都将绕过代理。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />超出此限制的连接其生存时间会显著缩短。该限制适用于磁盘连接。

## disk_connections_store_limit {#disk_connections_store_limit}

<SettingsInfoBlock type="UInt64" default_value="30000" />超出此限制的连接在使用后会重置。设置为 0 以关闭连接缓存。该限制适用于磁盘连接。

## disk_connections_warn_limit {#disk_connections_warn_limit}

<SettingsInfoBlock type="UInt64" default_value="10000" />如果使用中的连接数高于此限制，则会将警告消息写入日志。该限制适用于磁盘连接。

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

<SettingsInfoBlock type="Bool" default_value="0" />
启用或禁用在 `SHOW` 和 `SELECT` 查询中显示表、数据库、表函数和字典的秘密。

希望查看秘密的用户还必须具有 [`format_display_secrets_in_show_and_select` 格式设置](../settings/formats#format_display_secrets_in_show_and_select) 和 [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的值：

- `0` — 禁用。
- `1` — 启用。

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio}

<SettingsInfoBlock type="Float" default_value="0.1" />分布式缓存尝试保持空闲的活动连接的软限制数量。当空闲连接数量低于 distributed_cache_keep_up_free_connections_ratio * max_connections 时，将关闭活动时间最久的连接，直到数量超过限制。

## distributed_ddl {#distributed_ddl}

管理在集群上执行 [分布式 DDL 查询](../../sql-reference/distributed-ddl.md) (`CREATE`、`DROP`、`ALTER`、`RENAME`)。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 的情况下工作。

在 `<distributed_ddl>` 中可以配置的设置包括：

| 设置                    | 描述                                                                                                                             | 默认值                              |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `path`                  | Keeper 中 DDL 查询的 `task_queue` 路径                                                                                          |                                     |
| `profile`               | 执行 DDL 查询时使用的配置文件                                                                                                    |                                     |
| `pool_size`             | 可以同时运行的 `ON CLUSTER` 查询数量                                                                                              |                                     |
| `max_tasks_in_queue`    | 队列中可以存在的最大任务数。                                                                                                     | `1,000`                             |
| `task_max_lifetime`     | 如果节点的年龄大于此值，则删除节点。                                                                                              | `7 * 24 * 60 * 60` (一周的秒数)   |
| `cleanup_delay_period`  | 接收到新节点事件后开始清理，如果上次清理未在 `cleanup_delay_period` 秒之前完成。                                                | `60` 秒                             |

**示例**

```xml
<distributed_ddl>
    <!-- 在 ZooKeeper 中 DDL 查询队列的路径 -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- 将使用此配置文件中的设置执行 DDL 查询 -->
    <profile>default</profile>

    <!-- 控制可以同时运行的 ON CLUSTER 查询数量。 -->
    <pool_size>1</pool_size>

    <!--
         清理设置（活动任务不会被删除）
    -->

    <!-- 控制任务 TTL（默认 1 周） -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- 控制清理应执行的频率（以秒为单位） -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- 控制队列中可以存在的最大任务数 -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

<SettingsInfoBlock type="Bool" default_value="1" />允许将名称解析为 IPv4 地址。

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

<SettingsInfoBlock type="Bool" default_value="1" />允许将名称解析为 IPv6 地址。

## dns_cache_max_entries {#dns_cache_max_entries}

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS 缓存的最大条目数。

## dns_cache_update_period {#dns_cache_update_period}

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS 缓存的更新时间间隔（秒）。

## dns_max_consecutive_failures {#dns_max_consecutive_failures}

<SettingsInfoBlock type="UInt32" default_value="10" />在从 ClickHouse DNS 缓存中删除主机名之前，最大 DNS 解析失败次数。

## enable_azure_sdk_logging {#enable_azure_sdk_logging}

<SettingsInfoBlock type="Bool" default_value="0" />启用 Azure SDK 的日志记录。

## encryption {#encryption}

配置用于 [加密编解码器](/sql-reference/statements/create/table#encryption-codecs) 的命令以获取密钥。密钥（或密钥）应写入环境变量或设置在配置文件中。

密钥可以是十六进制或长度为 16 字节的字符串。

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
不推荐在配置文件中存储密钥。这并不安全。您可以将密钥移动到安全磁盘上的单独配置文件中，并将该配置文件的符号链接放入`config.d/`文件夹中。
:::

从配置加载，当密钥为十六进制时：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

从环境变量加载密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 设置当前的加密密钥，所有指定的密钥可以用于解密。

这些方法均可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

这里 `current_key_id` 显示当前的加密密钥。

用户还可以添加 nonce，必须为 12 字节长（默认情况下，加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以用十六进制设置：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上述所有内容也适用于 `aes_256_gcm_siv`（但密钥必须为 32 字节长）。
:::

## error_log {#error_log}

默认情况下禁用。

**启用**

要手动开启错误历史收集 [`system.error_log`](../../operations/system-tables/error_log.md)，请创建 `/etc/clickhouse-server/config.d/error_log.xml`，内容如下：

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

要禁用 `error_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## format_schema_path {#format_schema_path}

输入数据模式的目录路径，例如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的模式。

**示例**

```xml
<!-- 包含各种输入格式模式文件的目录。 -->
<format_schema_path>format_schemas/</format_schema_path>
```

## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

<SettingsInfoBlock type="UInt64" default_value="0" />全局分析器的 CPU 时钟计时器周期（以纳秒为单位）。设置为 0 值以关闭 CPU 时钟全局分析器。推荐值至少为 10000000（每秒 100 次），对于集群范围的分析推荐至少为 1000000000（每秒一次）。

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

<SettingsInfoBlock type="UInt64" default_value="0" />全局分析器的实际时钟计时器周期（以纳秒为单位）。设置为 0 值以关闭实际时钟全局分析器。推荐值至少为 10000000（每秒 100 次），对于集群范围的分析推荐至少为 1000000000（每秒一次）。

## google_protos_path {#google_protos_path}

定义包含 Protobuf 类型的 proto 文件的目录。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## graphite {#graphite}

将数据发送到 [Graphite](https://github.com/graphite-project)。

设置：

- `host` – Graphite 服务器。
- `port` – Graphite 服务器上的端口。
- `interval` – 发送间隔，单位秒。
- `timeout` – 发送数据的超时，单位秒。
- `root_path` – 键的前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送累计时间段的数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累计数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以为以不同间隔发送不同数据而使用这些子句。

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

为 Graphite 减少数据的设置。

有关更多详细信息，请参见 [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md)。

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

HSTS 的过期时间（以秒为单位）。

:::note
值为 `0` 意味着 ClickHouse 禁用 HSTS。如果您设置了一个正数，则 HSTS 将被启用，max-age 为您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## http_connections_soft_limit {#http_connections_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="100" />超出此限制的连接其生存时间会显著缩短。该限制适用于不属于任何磁盘或存储的 http 连接。

## http_connections_store_limit {#http_connections_store_limit}

<SettingsInfoBlock type="UInt64" default_value="5000" />超出此限制的连接在使用后会重置。设置为 0 以关闭连接缓存。该限制适用于不属于任何磁盘或存储的 http 连接。

## http_connections_warn_limit {#http_connections_warn_limit}

<SettingsInfoBlock type="UInt64" default_value="1000" />如果使用中的连接数高于此限制，则会将警告消息写入日志。该限制适用于不属于任何磁盘或存储的 http 连接。

## http_handlers {#http_handlers}

允许使用自定义 HTTP 处理程序。
要添加新的 http 处理程序，只需添加一个新的 `<rule>`。
规则按定义的从上到下检查，
第一个匹配的规则将运行处理程序。

可以通过子标签配置以下设置：

| 子标签               | 定义                                                                                                                                                          |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 匹配请求 URL，您可以使用 'regex:' 前缀使用正则表达式匹配（可选）                                                                                           |
| `methods`            | 匹配请求方法，您可以使用逗号分隔多个方法匹配（可选）                                                                                                         |
| `headers`            | 匹配请求头，匹配每个子元素（子元素名称为头名称），您可以使用 'regex:' 前缀使用正则表达式匹配（可选）                                                             |
| `handler`            | 请求处理程序                                                                                                                                                   |
| `empty_query_string` | 检查 URL 中没有查询字符串                                                                                                                                   |

`handler` 包含以下设置，可以通过子标签配置：

| 子标签               | 定义                                                                                                                                                          |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 重定向位置                                                                                                                                                    |
| `type`               | 支持的类型：static、dynamic_query_handler、predefined_query_handler、redirect                                                                                  |
| `status`             | 与 static 类型一起使用，响应状态码                                                                                                                           |
| `query_param_name`   | 与 dynamic_query_handler 类型一起使用，从 HTTP 请求参数中提取并执行与 `<query_param_name>` 值对应的值                                                               |
| `query`              | 与 predefined_query_handler 类型一起使用，当调用处理程序时执行查询                                                                                                   |
| `content_type`       | 与 static 类型一起使用，响应内容类型                                                                                                                           |
| `response_content`   | 与 static 类型一起使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中找到内容发送到客户端                                   |

您可以指定 `<defaults/>`，来启用所有默认处理程序以及规则列表。

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

## http_options_response {#http_options_response}

用于在 `OPTIONS` HTTP 请求中添加头到响应中的设置。
`OPTIONS` 方法在进行 CORS 预检请求时使用。

有关更多信息，请参见 [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS)。

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

## http_server_default_response {#http_server_default_response}

访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."（结尾带换行符）

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

<SettingsInfoBlock type="UInt64" default_value="50" />冰山目录后台池的大小。

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入冰山目录池的任务数量。

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries}

<SettingsInfoBlock type="UInt64" default_value="1000" />冰山元数据文件缓存中条目的最大大小。零表示禁用。

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />冰山元数据缓存策略名称。

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />冰山元数据缓存的最大大小（以字节为单位）。零表示禁用。

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />冰山元数据缓存中受到保护的队列大小（在 SLRU 策略的情况下）与缓存总大小的比例。
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
如果为真，ClickHouse 不会为 `CREATE VIEW` 查询中的空 SQL 安全语句写入默认值。

:::note
此设置仅在迁移期间是必需的，并将在 24.4 版本中变得过时。
:::
## include_from {#include_from} 

替换文件的路径。支持 XML 和 YAML 格式。

有关更多信息，请参见 "[配置文件](/operations/configuration-files)" 部分。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引标记缓存策略名称。
## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
索引标记缓存的最大大小。

:::note

值为 `0` 意味着禁用。

此设置可以在运行时修改，并将立即生效。
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />二级索引标记缓存中受保护队列的大小（在 SLRU 策略情况下）与缓存总大小的比例。
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引未压缩缓存策略名称。
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` 索引未压缩块的缓存最大大小。

:::note
值为 `0` 意味着禁用。

此设置可以在运行时修改，并将立即生效。
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />二级索引未压缩缓存中受保护队列的大小（在 SLRU 策略情况下）与缓存总大小的比例。
## interserver_http_credentials {#interserver_http_credentials} 

在 [复制](../../engines/table-engines/mergetree-family/replication.md) 期间连接其他服务器时使用的用户名和密码。此外，服务器使用这些凭证对其他副本进行身份验证。
因此，`interserver_http_credentials` 必须在集群中的所有副本中相同。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制期间不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭证 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭证适用于通过 `HTTP` 和 `HTTPS` 的复制。
:::

可以通过子标签配置以下设置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`，则即使设置了凭证，也允许其他副本在没有身份验证的情况下连接。如果为 `false`，则拒绝未提供身份验证的连接。默认值：`false`。
- `old` — 包含在凭证轮换过程中使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭证轮换**

ClickHouse 支持动态的服务器间凭证轮换，无需同时停止所有副本以更新其配置。可以分几步更改凭证。

要启用身份验证，将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭证。这允许进行身份验证和不进行身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

配置所有副本后，将 `allow_empty` 设置为 `false` 或移除此设置。这样便使得使用新凭证的身份验证变为强制。

要更改现有凭证，将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时服务器使用新凭证连接其他副本，并接受新旧凭证的连接。

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

当新凭证应用到所有副本后，可以删除旧凭证。
## interserver_http_host {#interserver_http_host} 

其他服务器可以用来访问此服务器的主机名。

如果省略，则按 `hostname -f` 命令的方式定义。

适用于摆脱特定网络接口。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_https_host {#interserver_https_host} 

与 [`interserver_http_host`](#interserver_http_host) 类似，不同之处在于此主机名可以被其他服务器用于通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port} 

ClickHouse 服务器之间通过 `HTTPS` 交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

在 ClickHouse 服务器之间交换数据的主机限制。
如果使用 Keeper，则相同限制将适用于不同 Keeper 实例之间的通信。

:::note
默认情况下，值等于 [`listen_host`](#listen_host) 设置。
:::

**示例**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

类型：

默认：
## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
IO 线程池中可以调度的最大作业数。

:::note
值为 `0` 意味着无限制。
:::
## keep_alive_timeout {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
ClickHouse 等待 HTTP 协议中传入请求的秒数，在关闭连接之前。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
支持批处理的 MultiRead 请求的最大批次大小。如果设置为 0，则禁用批处理。仅在 ClickHouse Cloud 中可用。
## latency_log {#latency_log} 

默认情况下禁用。

**启用**

要手动打开延迟历史记录收集 [`system.latency_log`](../../operations/system-tables/latency_log.md)，请创建 `/etc/clickhouse-server/config.d/latency_log.xml`，内容如下：

```xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**禁用**

要禁用 `latency_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_latency_log.xml`，内容如下：

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers} 

在此处列出 LDAP 服务器及其连接参数，以便于：
- 将它们用作具有 'ldap' 身份验证机制而不是 'password' 的专用本地用户的身份验证者。
- 将它们用作远程用户目录。

可以通过子标签配置以下设置：

| 设置                           | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                       | LDAP 服务器主机名或 IP，该参数是必需的且不能为空。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `port`                       | LDAP 服务器端口，如果 `enable_tls` 设置为 true，则默认为 636，否则为 389。                                                                                                                                                                                                                                                                                                                                                                                  |
| `bind_dn`                    | 用于构造绑定的 DN 的模板。在每次身份验证尝试期间，结果 DN 将通过将模板中的所有 `\{user_name\}` 子串替换为实际用户名来构造。                                                                                                                                                                                                                                                                                    |
| `user_dn_detection`          | 包含用于检测绑定用户的实际用户 DN 的 LDAP 搜索参数的部分。这主要用于在 Active Directory 服务器上进行角色映射的搜索过滤器中。生成的用户 DN 将在允许的地方替换 `\{user_dn\}` 子串。默认情况下，用户 DN 设置为等于绑定 DN，但一旦执行搜索，它将更新为检测到的实际用户 DN 值。                                                                                 |
| `verification_cooldown`      | 成功绑定尝试后，用户将被视为在所有后续请求中成功认证的时限（单位：秒），此期间无需联系 LDAP 服务器。指定 `0`（默认）以禁用缓存，并在每次身份验证请求中强制联系 LDAP 服务器。                                                                                                                                                                                                                                            |
| `enable_tls`                 | 触发与 LDAP 服务器的安全连接的标志。为纯文本 (`ldap://`) 协议指定 `no`（不推荐）。为通过 SSL/TLS (`ldaps://`) 协议的 LDAP 指定 `yes`（推荐，默认值）。为 传统的 StartTLS 协议（纯文本 (`ldap://`）协议，并升级到 TLS）指定 `starttls`。                                                                                                                 |
| `tls_minimum_protocol_version`| SSL/TLS 的最低协议版本。接受的值有：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。                                                                                                                                                                                                                                                                                                        |
| `tls_require_cert`          | SSL/TLS 对等证书验证行为。接受的值有：`never`、`allow`、`try`、`demand`（默认）。                                                                                                                                                                                                                                                                                                                                  |
| `tls_cert_file`             | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_key_file`              | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_ca_cert_file`          | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_ca_cert_dir`           | 包含 CA 证书的目录的路径。                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_cipher_suite`          | 允许的密码套件（以 OpenSSL 符号表示）。                                                                                                                                                                                                                                                                                                                                                                                  |

设置 `user_dn_detection` 可以通过子标签进行配置：

| 设置          | 描述                                                                                                                                                                                                                                                                                                                                    |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`     | 用于构造 LDAP 搜索的基本 DN 的模板。结果 DN 将通过将模板中的所有 `\{user_name\}` 和 '\{bind_dn\}' 子串替换为实际用户名称和绑定 DN 来构造。                                                                                                                                                                                           |
| `scope`       | LDAP 搜索的范围。接受的值有：`base`、`one_level`、`children`、`subtree`（默认）。                                                                                                                                                                                                                                                         |
| `search_filter`| 用于构造 LDAP 搜索的搜索过滤器的模板。结果过滤器将通过将模板中的所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子串替换为实际用户名、绑定 DN 和基本 DN 来构造。请注意，在 XML 中必须正确转义特殊字符。                                                                                                                          |

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

示例（典型 Active Directory 配置用户 DN 检测以进行进一步角色映射）：

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

ClickHouse 企业版的许可证密钥
## listen_backlog {#listen_backlog} 

监听套接字的待处理连接的回退队列大小。默认值 `4096` 与 Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4) 的值相同。

通常不需要更改此值，因为：
- 默认值足够大，
- 服务器为接受客户端连接而有单独的线程。

因此，即使您在 ClickHouse 服务器上看到 `TcpExtListenOverflows`（来自 `nstat`）的值非零，并且该计数器增长，这也不意味着需要增加此值，因为：
- 通常，如果 `4096` 不够，表示 ClickHouse 内部扩展存在问题，最好报告此问题。
- 这并不意味着服务器将来可以处理更多连接（即使可以，在那时客户端可能已经消失或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host} 

请求可以来自的主机限制。如果希望服务器响应所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port} 

允许多个服务器监听相同的地址：端口。请求将由操作系统随机路由到一个服务器。不建议启用此设置。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认：
## listen_try {#listen_try} 

当尝试监听时，如果 IPv6 或 IPv4 网络不可用，服务器将不退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />标记加载的后台线程池大小
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入预取池的任务数量
## logger {#logger}

日志消息的位置和格式。

**键**：

| 键                       | 描述                                                                                                                                                                               |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | 日志级别。可接受的值：`none`（关闭日志）、`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                                        |
| `log`                     | 日志文件的路径。                                                                                                                                                                   |
| `errorlog`                | 错误日志文件的路径。                                                                                                                                                               |
| `size`                    | 轮换策略：日志文件的最大大小（以字节为单位）。一旦日志文件大小超过此阈值，它将被重命名并归档，并创建一个新的日志文件。                                                                    |
| `count`                   | 轮换策略：Clickhouse最多保留多少个历史日志文件。                                                                                                                                   |
| `stream_compress`         | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                                                  |
| `console`                 | 不将日志消息写入日志文件，而是在控制台中打印。设置为 `1` 或 `true` 以启用。如果 Clickhouse 不以守护进程模式运行，则默认为 `1`，否则为 `0`。                    |
| `console_log_level`       | 控制台输出的日志级别。默认为 `level`。                                                                                                                                                 |
| `formatting`              | 控制台输出的日志格式。目前仅支持 `json`。                                                                                                                                               |
| `use_syslog`              | 还将日志输出转发到 syslog。                                                                                                                                                          |
| `syslog_level`            | 写入 syslog 的日志级别。                                                                                                                                                            |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符生成的结果文件名（目录部分不支持它们）。

"示例"列显示在 `2023-07-06 18:32:07` 时的输出。

| 说明符    | 描述                                                                                                               | 示例                    |
|------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`       | 字面量 %                                                                                                         | `%`                      |
| `%n`       | 换行符                                                                                                          |                          |
| `%t`       | 水平制表符                                                                                                    |                          |
| `%Y`       | 作为十进制数的年份，例如 2017                                                                                  | `2023`                   |
| `%y`       | 年份的最后 2 位数字，以十进制数表示（范围 [00,99]）                                                             | `23`                     |
| `%C`       | 作为十进制数的年份的前两位数字（范围 [00,99]）                                                                | `20`                     |
| `%G`       | 四位数 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常与 `%V` 一起使用 | `2023`                   |
| `%g`       | 年份的最后 2 位数字的 [ISO 8601 基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。      | `23`                     |
| `%b`       | 缩写的月份名称，例如 Oct（受区域设置影响）                                                                 | `Jul`                    |
| `%h`       | `%b` 的同义词                                                                                                    | `Jul`                    |
| `%B`       | 全月名称，例如 October（受区域设置影响）                                                                         | `July`                   |
| `%m`       | 作为十进制数的月份（范围 [01,12]）                                                                               | `07`                     |
| `%U`       | 作为十进制数的年份中的周数（周日为一周的第一天）（范围 [00,53]）                                              | `27`                     |
| `%W`       | 作为十进制数的年份中的周数（周一为一周的第一天）（范围 [00,53]）                                              | `27`                     |
| `%V`       | ISO 8601 周编号（范围 [01,53]）                                                                                  | `27`                     |
| `%j`       | 作为十进制数的年份中的日数（范围 [001,366]）                                                                     | `187`                    |
| `%d`       | 作为零填充的十进制数字的月份中的日期（范围 [01,31]）。单个数字前面用零填充。                                     | `06`                     |
| `%e`       | 作为空格填充的十进制数字的月份中的日期（范围 [1,31]）。单个数字前面用空格填充。                               | `&nbsp; 6`               |
| `%a`       | 缩写的星期几名称，例如 Fri（受区域设置影响）                                                                     | `Thu`                    |
| `%A`       | 全星期几名称，例如 Friday（受区域设置影响）                                                                     | `Thursday`               |
| `%w`       | 星期几作为整数，周日为 0（范围 [0-6]）                                                                         | `4`                      |
| `%u`       | 星期几作为十进制数字，周一为 1（ISO 8601 格式）（范围 [1-7]）                                                   | `4`                      |
| `%H`       | 作为十进制数字的小时，24 小时制（范围 [00-23]）                                                               | `18`                     |
| `%I`       | 作为十进制数字的小时，12 小时制（范围 [01,12]）                                                               | `06`                     |
| `%M`       | 作为十进制数字的分钟（范围 [00,59]）                                                                           | `32`                     |
| `%S`       | 作为十进制数字的秒（范围 [00,60]）                                                                               | `07`                     |
| `%c`       | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（受区域设置影响）                                           | `Thu Jul  6 18:32:07 2023` |
| `%x`       | 本地化的日期表示（受区域设置影响）                                                                               | `07/06/23`                |
| `%X`       | 本地化的时间表示，例如 18:40:20 或 6:40:20 PM（受区域设置影响）                                                  | `18:32:07`               |
| `%D`       | 短 MM/DD/YY 日期，相当于 %m/%d/%y                                                                                 | `07/06/23`               |
| `%F`       | 短 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                               | `2023-07-06`             |
| `%r`       | 本地化的 12 小时制时间（受区域设置影响）                                                                          | `06:32:07 PM`            |
| `%R`       | 相当于 "%H:%M"                                                                                                   | `18:32`                  |
| `%T`       | 相当于 "%H:%M:%S"（ISO 8601 时间格式）                                                                            | `18:32:07`               |
| `%p`       | 本地化的上午或下午标记（受区域设置影响）                                                                          | `PM`                     |
| `%z`       | 以 ISO 8601 格式表示的 UTC 偏移（例如 -0430），如果没有时区信息，则不显示任何字符                                 | `+0800`                  |
| `%Z`       | 依赖于区域设置的时区名称或缩写，如果没有时区信息，则不显示任何字符                                                | `Z AWST `                |

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

要仅在控制台中打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**每级别覆盖**

可以覆盖单个日志名称的日志级别。例如，要静音日志记录器 "Backup" 和 "RBAC" 的所有消息。

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

要将日志消息额外写入 syslog：

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

`<syslog>` 的键：

| 键        | 描述                                                                                                                                                                                                                                |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                           |
| `hostname` | 发送日志的主机名称（可选）。                                                                                                                                                                                                        |
| `facility` | syslog [facility 关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须使用大写字母并带有 "LOG_" 前缀，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。如果指定了 `address`，则默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。               |
| `format`   | 日志消息格式。可能的值：`bsd` 和 `syslog`。                                                                                                                                                                                         |

**日志格式**

您可以指定将输出到控制台日志中的日志格式。目前只支持 JSON。

**示例**

这是 JSON 日志输出的示例：

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

要启用 JSON 日志支持，请使用以下代码段：

```xml
<logger>
    <formatting>
        <type>json</type>
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

通过更改 `<names>` 标签中的标签值可以修改键名。例如，要将 `DATE_TIME` 更改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**为 JSON 日志省略键**

可以通过注释掉属性来省略日志属性。例如，如果您不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。

## macros {#macros}

用于复制表的参数替换。

如果不使用复制表，可以省略此项。

有关更多信息，请参见 [创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />标记缓存策略名称。
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />预热期间填充标记缓存的总大小的比例。
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
用于标记的缓存的最大大小（[`MergeTree`](/engines/table-engines/mergetree-family) 表系列的索引）。

:::note
此设置可以在运行时修改并立即生效。
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在标记缓存中保护队列的大小（在 SLRU 策略的情况下）相对于缓存的总大小。
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />启动时加载活动数据部分集（活动部分）的线程数。
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
用户可以创建或更改的认证方法的最大数量。
更改此设置不会影响现有用户。如果创建/更改涉及身份验证的查询超过此设置指定的限制，则查询将失败。
非身份验证的创建/更改查询将成功。

:::note
值为 `0` 表示无限制。
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有备份的最大读取速度（以字节每秒为单位）。零意味着无限制。
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />如果备份 IO 线程池中的 **空闲** 线程的数量超过 `max_backup_io_thread_pool_free_size`，ClickHouse 将释放被空闲线程占用的资源，并减少池的大小。必要时可以重新创建线程。
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse 使用备份 IO 线程池中的线程进行 S3 备份 IO 操作。`max_backups_io_thread_pool_size` 限制池中的最大线程数。
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
用于构建向量索引的最大线程数。

:::note
值为 `0` 表示所有核心。
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
对并发插入查询的总数的限制。

:::note

值为 `0`（默认值）表示无限制。

此设置可以在运行时修改并立即生效。已经在运行的查询将保持不变。
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
对并发执行查询的总数量的限制。请注意，还必须考虑对 `INSERT` 和 `SELECT` 查询的限制，以及每个用户的最大查询数量。

另请参阅：
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

值为 `0`（默认值）表示无限制。

此设置可以在运行时修改并立即生效。已经在运行的查询将保持不变。
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
对并发选择查询的总数量的限制。

:::note

值为 `0`（默认值）表示无限制。

此设置可以在运行时修改并立即生效。已经在运行的查询将保持不变。
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />最大服务器连接数。
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />如果数据库数量大于此值，则服务器将抛出异常。0 表示无限制。
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果附加的数据库数量超过指定值，Clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />在 DatabaseReplicated 中进行副本恢复时创建表的线程数量。零表示线程数等于核心数。
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果字典数量大于此值，服务器将抛出异常。

仅考虑数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示无限制。
:::

**示例**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果附加的字典数量超过指定值，Clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />在聚合过程中允许收集的哈希表统计信息条目的数量
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 的线程数。
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果 IO 线程池中的 **空闲** 线程数量超过 `max_io_thread_pool_free_size`，ClickHouse 将释放被空闲线程占用的资源，并减少池的大小。必要时可以重新创建线程。
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse 使用 IO 线程池中的线程进行某些 IO 操作（例如与 S3 交互）。`max_io_thread_pool_size` 限制池中的最大线程数。
## max_keep_alive_requests {#max_keep_alive_requests} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
通过单个保持连接最大请求数量，直到 ClickHouse 服务器将其关闭。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
本地读取的最大速度（以字节每秒为单位）。

:::note
值为 `0` 表示无限制。
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
本地写入的最大速度（以字节每秒为单位）。

:::note
值为 `0` 表示无限制。
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
附加到表的物化视图数量的限制。

:::note
这里只考虑直接依赖的视图，并且不考虑在另一个视图上创建一个视图。
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有合并的最大读取速度（以字节每秒为单位）。零意味着无限制。
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有变更的最大读取速度（以字节每秒为单位）。零意味着无限制。
## max_open_files {#max_open_files} 

最大打开文件的数量。

:::note
我们建议在 macOS 中使用此选项，因为 `getrlimit()` 函数返回不正确的值。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
考虑丢弃连接的 OS CPU 等待（OSCPUWaitMicroseconds 指标）与忙碌（OSCPUVirtualTimeMicroseconds 指标）时间的最大比率。使用最小值和最大值之间的线性插值来计算概率，该点的概率为 1。
有关详细信息，请参阅 [控制服务器 CPU 超载时的行为](/operations/settings/server-overload)。
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />启动时加载不活动数据部分集（过时部分）的线程数。
## max_part_num_to_warn {#max_part_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="100000" />
如果活动部分的数量超过指定值，Clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
对删除分区的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop)（以字节为单位），则无法使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询删除分区。
此设置不需要重启 ClickHouse 服务器即可应用。另一种禁用限制的方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值为 `0` 表示您可以在没有任何限制的情况下删除分区。

该限制不限制删除表和截断表，请参阅 [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)。
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />用于并发删除不活动数据部分的线程数。
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
如果任何待处理的变更超过指定的值（以秒为单位），Clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="500" />
如果待处理的变更数量超过指定值，Clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果前缀反序列化线程池中的 **空闲** 线程数量超过 `max_prefixes_deserialization_thread_pool_free_size`，ClickHouse 将释放被空闲线程占用的资源并减少池的大小。必要时可以重新创建线程。
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse 使用前缀反序列化线程池中的线程并行读取来自 MergeTree 的 wide 部分的列和子列的元数据。`max_prefixes_deserialization_thread_pool_size` 限制池中的最大线程数。
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
读取时通过网络的数据交换最大速度（以字节每秒为单位）。

:::note
值为 `0`（默认值）表示无限制。
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
写入时通过网络的数据交换最大速度（以字节每秒为单位）。

:::note
值为 `0`（默认值）表示无限制。
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />用于复制提取的数据交换的最大网络速度（以字节每秒为单位）。零意味着无限制。
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />用于复制发送的数据交换的最大网络速度（以字节每秒为单位）。零意味着无限制。
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果复制表的数量超过该值，服务器将抛出异常。

仅考虑数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示无限制。
:::

**示例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```
## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
服务器允许使用的最大内存量，以字节为单位表示。

:::note
服务器的最大内存消耗受到 `max_server_memory_usage_to_ram_ratio` 设置的进一步限制。
:::

作为特例，值为 `0`（默认值）表示服务器可以使用所有可用内存（不包括 `max_server_memory_usage_to_ram_ratio` 限制的进一步限制）。
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
服务器允许使用的最大内存量，以所有可用内存的比例表示。

例如，值为 `0.9`（默认值）表示服务器可以使用可用内存的 90%。

允许在低内存系统上降低内存使用。在内存和交换空间较小的主机上，可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置为大于 1。

:::note
服务器的最大内存消耗受到 `max_server_memory_usage` 设置的进一步限制。
:::
## max_session_timeout {#max_session_timeout} 

最大会话超时时间，单位为秒。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果表的数量大于此值，服务器将抛出异常。

以下表格不计入：
- view
- remote
- dictionary
- system

仅计算以下数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示没有限制。
:::

**示例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
如果附加表的数量超过指定值，clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
删除表的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop`（以字节为单位），您将无法使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询来删除它。

:::note
值为 `0` 表示您可以在没有任何限制的情况下删除所有表。

此设置无需重启 ClickHouse 服务器即可生效。禁用限制的另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
用于外部聚合、连接或排序的最大存储量。
超出该限制的查询将因异常而失败。

:::note
值为 `0` 表示无限制。
:::

另请参见：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果全局线程池中的 **空闲** 线程数量大于 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)，则 ClickHouse 将释放一些线程占用的资源，线程池的大小会减少。如有必要，可以再次创建线程。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse 使用全局线程池中的线程来处理查询。如果没有空闲线程处理查询，则会在池中创建新线程。 `max_thread_pool_size` 限制池中线程的最大数量。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于在启动时加载不活跃的数据部分（意外部分）的线程数量。

## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果视图的数量大于此值，服务器将抛出异常。

仅计算以下数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示没有限制。
:::

**示例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
如果附加视图的数量超过指定值，clickhouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
并发等待查询的总数量的限制。
在所需表格异步加载期间，正在等待的查询的执行将被阻塞（请参见 [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)）。

:::note
在检查以下设置控制的限制时，不计入等待查询：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

此更正是为了避免在服务器启动后立即达到这些限制。
:::

:::note

值为 `0`（默认）表示无限制。

此设置可以在运行时修改，并会立即生效。已经在运行的查询将保持不变。
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
是否应根据来自外部源（如 jemalloc 和 cgroups）的信息，修正后台内存工作器的内部内存跟踪器。
## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />
修正内存跟踪器内存使用情况并在内存使用量较高时清理未使用页面的后台内存工作器的滴答周期。如果设置为 0，则将根据内存使用源使用默认值。
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />使用当前 cgroup 内存使用信息来修正内存跟踪。
## merge_tree {#merge_tree} 

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的微调。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
用于调节资源在合并和其他工作负载之间的利用和共享。指定的值被用作所有后台合并的 `workload` 设置值。可以通过合并树设置覆盖。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
设置用于执行合并和变更操作的RAM使用的限制。
如果 ClickHouse 达到设置的限制，则不会调度新的后台合并或变更操作，但将继续执行已经调度的任务。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
默认的 `merges_mutations_memory_usage_soft_limit` 值是根据 `memory_amount * merges_mutations_memory_usage_to_ram_ratio` 计算得出的。

**另请参见：**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage软限制](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log {#metric_log} 

默认情况下禁用。

**启用**

要手动开启指标历史收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml`，内容如下：

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

要禁用 `metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
操作系统 CPU 等待（OSCPUWaitMicroseconds 指标）与忙碌（OSCPUVirtualTimeMicroseconds 指标）时间之间的最小比率，用于考虑中断连接。通过在最小和最大比率之间进行线性插值来计算概率，这个点的概率为 0。
有关详细信息，请参见 [控制服务器 CPU 过载时的行为](/operations/settings/server-overload)。
## mlock_executable {#mlock_executable} 

在启动后执行 `mlockall`，以降低首次查询延迟并防止在高 IO 负载下将 ClickHouse 可执行文件分页。

:::note
建议启用此选项，但会导致启动时间增加几个秒。
请注意，在没有 "CAP_IPC_LOCK" 权限的情况下，此设置将无法工作。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
设置映射文件的缓存大小（以字节为单位）。此设置可避免频繁的打开/关闭调用（由于随后的页面错误而非常昂贵），并重用来自多个线程和查询的映射。设置值是映射区域的数量（通常等于映射文件的数量）。

可以在以下系统表中监控映射文件中的数据量，并使用以下指标：

| 系统表                                                                                                                                                                                                                                                                                                                                                       | 指标                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) 和 [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` 和 `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
映射文件中的数据量不会直接消耗内存，并且不计入查询或服务器内存使用情况——因为这部分内存可以像操作系统页面缓存一样被丢弃。在 MergeTree 家族的表中，旧部分被删除时，缓存会自动丢弃（文件关闭），也可以通过 `SYSTEM DROP MMAP CACHE` 查询手动丢弃。

此设置可以在运行时修改，并会立即生效。
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
用于调节资源在变更和其他工作负载之间的利用和共享。指定的值被用作所有后台变更的 `workload` 设置值。可以通过合并树设置覆盖。

**另请参见**
- [工作负载调度](/operations/workload-scheduling.md)

## mysql_port {#mysql_port} 

通过 MySQL 协议与客户端通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```

## openSSL {#openssl} 

SSL 客户端/服务器配置。

SSL 支持由 `libpoco` 库提供。可用的配置选项在 [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h) 中做了解释。默认值可以在 [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp) 中找到。

服务器/客户端设置的键：

| 选项                        | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 默认值                              |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | PEM 证书的密钥文件路径。该文件可能同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                                                |                                            |
| `certificateFile`             | 客户端/服务器证书文件的 PEM 格式路径。如果 `privateKeyFile` 包含证书，您可以省略它。                                                                                                                                                                                                                                                                                                                               |                                            |
| `caConfig`                    | 包含受信任 CA 证书的文件或目录路径。如果指向文件，则必须是 PEM 格式并且可以包含多个 CA 证书。如果指向目录，则必须包含每个 CA 证书的一个 .pem 文件。文件名是通过 CA 主题名称的哈希值查找的。详细信息请参阅 [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html) 的手册页。                                           |                                            |
| `verificationMode`            | 检查节点证书的方法。详细信息见 [上下文](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h) 类的描述。可能的值： `none`、 `relaxed`、 `strict`、 `once`。                                                                                                                                                                                                   | `relaxed`                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链的长度超过设定值，则验证将失败。                                                                                                                                                                                                                                                                                                                                                       | `9`                                        |
| `loadDefaultCAFile`           | 是否使用用于 OpenSSL 的内置 CA 证书。ClickHouse 假设内置 CA 证书位于文件 `/etc/ssl/cert.pem`（相应地目录为 `/etc/ssl/certs`）或在环境变量 `SSL_CERT_FILE`（相应地为 `SSL_CERT_DIR`）指定的文件（相应地为目录）中。                                                                                                                                                                          | `true`                                     |
| `cipherList`                  | 支持的 OpenSSL 加密。                                                                                                                                                                                                                                                                                                                                                                                                                                               | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与 `sessionIdContext` 一起使用。可接受值： `true`、 `false`。                                                                                                                                                                                                                                                                                                                                     | `false`                                    |
| `sessionIdContext`            | 服务器附加到每个生成的标识符的随机字符集。字符串长度不得超过 `SSL_MAX_SSL_SESSION_ID_LENGTH`。强烈建议使用此参数，因为它有助于避免出现缓存会话时的各类问题。                                                                                                                                                                                                                                                 | `$\{application.name\}`                      |
| `sessionCacheSize`            | 服务器缓存的会话的最大数量。值为 `0` 表示无限制的会话。                                                                                                                                                                                                                                                                                                                                                                                 | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | 服务器上会话缓存的时间（以小时为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                          | `2`                                        |
| `extendedVerification`        | 如果启用，验证证书 CN 或 SAN 是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1`                | 要求 TLSv1 连接。可接受值： `true`、 `false`。                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`                                    |
| `requireTLSv1_1`              | 要求 TLSv1.1 连接。可接受值： `true`、 `false`。                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1_2`              | 要求 TLSv1.2 连接。可接受值： `true`、 `false`。                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `fips`                        | 激活 OpenSSL FIPS 模式。仅在库的 OpenSSL 版本支持 FIPS 时受支持。                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `privateKeyPassphraseHandler` | 请求访问私钥的短语的类（PrivateKeyPassphraseHandler 子类）。例如： `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`。                                                                                                                                                                                                            | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler 的子类）。例如： `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` 。                                                                                                                                                                                                                                                                               | `RejectCertificateHandler`                 |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                            |
| `preferServerCiphers`         | 客户端优先的服务器密码。                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`                                    |

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
        <!-- 使用自签名证书时： <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- 使用自签名证书时： <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md) 系统表的设置。

<SystemLogParameters/>

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />被视为 CPU 做有用工作的操作系统 CPU 忙碌时间的阈值（OSCPUVirtualTimeMicroseconds 指标），如果忙碌时间低于此值，则不会认为存在 CPU 过载。

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />保持用户空间页面缓存中空闲的内存限制的比例。类似于 Linux min_free_kbytes 设置。

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />释放的内存可以在用户空间页面缓存中使用之前的延迟。

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />用户空间页面缓存的最大大小。设置为 0 以禁用缓存。如果大于 page_cache_min_size，缓存大小将在此范围内持续调整，以使用大部分可用内存，同时保持总内存使用低于限制（max_server_memory_usage[_to_ram_ratio]）。

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />用户空间页面缓存的最小大小。

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />用户空间页面缓存策略名称。

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />将用户空间页面缓存划分为这么多的分片，以减少互斥锁争用。实验性，不太可能提高性能。
## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />用户空间页面缓存中受保护队列的大小与缓存的总大小的比例。

## part_log {#part_log} 

记录与 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 相关的事件，例如添加或合并数据。您可以使用日志模拟合并算法并比较它们的特性。您可以可视化合并过程。

查询记录在 [system.part_log](/operations/system-tables/part_log) 表中，而不是单独的文件中。您可以在 `table` 参数中配置该表的名称（见下文）。

<SystemLogParameters/>

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
SharedMergeTree 完全删除 parts 的延迟周期。仅适用于 ClickHouse Cloud。

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
从 0 到 x 秒均匀分布的值添加到 kill_delay_period，以避免在非常大量表的情况下产生的争用效应和随后的 ZooKeeper 拒绝服务。仅适用于 ClickHouse Cloud。

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
用于清理共享合并树过期线程的线程数。仅适用于 ClickHouse Cloud。

## path {#path} 

数据目录的路径。

:::note
尾随斜杠是强制性的。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

通过 PostgreSQL 协议与客户端通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过 MySQL 协议与客户端的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />远程对象存储的预读取后台池的大小。

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入预读取池的任务数量。

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
可以在前缀反序列化线程池中调度的最大作业数。

:::note
值为 `0` 意味着无限制。
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
如果为 true，ClickHouse 在启动之前创建所有配置的 `system.*_log` 表。如果某些启动脚本依赖于这些表，这可能会有帮助。

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />主索引缓存策略名称。

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />在预热期间要填充的标记缓存的总大小的比例。

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />主索引（MergeTree 表的索引）缓存的最大大小。

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />主索引缓存（在 SLRU 策略的情况下）的受保护队列的大小与缓存的总大小的比例。

## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
此设置允许读取 QueryPlan 数据包。这个数据包在启用 serialize_query_plan 时作为分布式查询发送。
默认禁用以避免查询计划二进制反序列化中的潜在安全问题，可能由错误引起。

**示例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
## processors_profile_log {#processors_profile_log} 

[`processors_profile_log`](../system-tables/processors_profile_log.md) 系统表的设置。

<SystemLogParameters/>

默认设置为：

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

暴露供 [Prometheus](https://prometheus.io) 抓取的指标数据。

设置：

- `endpoint` – prometheus 服务器抓取指标的 HTTP 端点，从 '/' 开始。
- `port` – `endpoint` 的端口。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表中暴露指标。
- `events` – 从 [system.events](/operations/system-tables/events) 表中暴露指标。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前指标值。
- `errors` - 暴露自上次服务器重启以来按错误代码发生的错误数量。这些信息也可以从 [system.errors](/operations/system-tables/errors) 获取。

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

定义用于 HTTP 和 HTTPS 请求的代理服务器，目前被 S3 存储、S3 表函数和 URL 函数支持。

有三种定义代理服务器的方法：
- 环境变量
- 代理列表
- 远程代理解析器。

还支持使用 `no_proxy` 跳过特定主机的代理服务器。

**环境变量**

`http_proxy` 和 `https_proxy` 环境变量允许您为给定协议指定一个代理服务器。如果您在系统上设置了它，应该可以无缝工作。

这是最简单的方法，如果给定协议仅有一个代理服务器，并且该代理服务器不变。

**代理列表**

此方法允许您为协议指定一个或多个代理服务器。如果定义了多个代理服务器，ClickHouse 将以轮询方式使用不同的代理，平衡服务器之间的负载。如果某个协议有多个代理服务器且代理服务器列表不变化，则这是最简单的方法。

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
选择下方选项卡中的父字段，以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段      | 描述                              |
|-----------|----------------------------------|
| `<http>`  | 一个或多个 HTTP 代理的列表       |
| `<https>` | 一个或多个 HTTPS 代理的列表      |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段    | 描述             |
|--------|------------------|
| `<uri>` | 代理的 URI      |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态更改。在这种情况下，您可以定义解析器的端点。ClickHouse 向该端点发送一个空的 GET 请求，远程解析器应返回代理主机。ClickHouse 将使用以下模板形成代理 URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

选择下方选项卡中的父字段，以查看其子字段：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段     | 描述                               |
|----------|-----------------------------------|
| `<http>` | 一个或多个解析器的列表*          |
| `<https>` | 一个或多个解析器的列表*         |

  </TabItem>
  <TabItem value="http_https" label="<http> 和 <https>">

| 字段        | 描述                                      |
|------------|------------------------------------------|
| `<resolver>` | 解析器的端点及其他详细信息              |

:::note
可以有多个 `<resolver>` 元素，但仅使用第一个给定协议的 `<resolver>`。该协议的任何其他 `<resolver>` 元素将被忽略。这意味着负载均衡（如果需要）应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段               | 描述                                                                                                                              |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析器的 URI                                                                                                                  |
| `<proxy_scheme>`    | 最终代理 URI 的协议，可以是 `http` 或 `https`。                                                                                     |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                               |
| `<proxy_cache_time>` | 以秒为单位的时间，ClickHouse 应从解析器缓存值。将此值设置为 `0` 会导致 ClickHouse 在每次 HTTP 或 HTTPS 请求时联系解析器。 |

  </TabItem>
</Tabs>

**优先级**

代理设置的确定顺序如下所示：

| 顺序 | 设置                 |
|-------|------------------------|
| 1.    | 远程代理解析器       |
| 2.    | 代理列表             |
| 3.    | 环境变量             |

ClickHouse 将检查请求协议的最高优先级解析器类型。如果未定义，它将检查下一个最高优先级的解析器类型，直到到达环境解析器。这允许混合使用解析器类型。

## query_cache {#query_cache} 

[查询缓存](../query-cache.md) 配置。

以下设置可用：

| 设置                       | 描述                                                                               | 默认值          |
|---------------------------|------------------------------------------------------------------------------------|-----------------|
| `max_size_in_bytes`       | 最大缓存大小（以字节为单位）。`0` 表示禁用查询缓存。                                   | `1073741824`    |
| `max_entries`             | 存储在缓存中的最大 `SELECT` 查询结果数量。                                           | `1024`          |
| `max_entry_size_in_bytes` | 可保存到缓存中的 `SELECT` 查询结果的最大字节大小。                                  | `1048576`       |
| `max_entry_size_in_rows`  | 可保存到缓存中的 `SELECT` 查询结果的最大行数。                                     | `30000000`      |

:::note
- 更改后的设置会立即生效。
- 查询缓存的数据在 DRAM 中分配。如果内存稀缺，请确保为 `max_size_in_bytes` 设置较小的值或完全禁用查询缓存。
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

<SettingsInfoBlock type="String" default_value="SLRU" />查询条件缓存策略名称。

## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />
查询条件缓存的最大大小。
:::note
此设置可以在运行时修改，将立即生效。
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />查询条件缓存（在 SLRU 策略的情况下）中受保护队列的大小与缓存的总大小的比例。

## query_log {#query_log} 

使用 [log_queries=1](../../operations/settings/settings.md) 设置记录接收到的查询。

查询记录在 [system.query_log](/operations/system-tables/query_log) 表中，而不是单独的文件中。您可以在 `table` 参数中更改该表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询日志的结构发生变化，旧结构的表将被重命名，并自动创建新表。

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

基于正则表达式的规则，将应用于查询和所有日志消息，然后存储在服务器日志中，
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes) 表中以及发送到客户端的日志中。这可以防止敏感数据泄露，例如姓名、电子邮件、个人标识符或信用卡号码。

**示例**

```xml
<query_masking_rules>
    <rule>
        <name>隐藏社会安全号</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**配置信息字段**：

| 设置     | 描述                                                              |
|----------|-------------------------------------------------------------------|
| `name`   | 规则名称（可选）                                                  |
| `regexp` | 兼容 RE2 的正则表达式（必填）                                    |
| `replace`| 敏感数据的替代字符串（可选，默认为六个星号）                    |

遮蔽规则适用于整个查询（以防止从损坏/无法解析的查询中泄露敏感数据）。

[`system.events`](/operations/system-tables/events) 表中有计数器 `QueryMaskingRulesMatch`，表示查询遮蔽规则匹配的总体数量。

对于分布式查询，每个服务器必须单独配置，否则，传递给其他节点的子查询将不进行遮蔽。

## query_metric_log {#query_metric_log} 

默认情况下禁用。

**启用**

要手动启动指标历史记录收集 [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)，请创建 `/etc/clickhouse-server/config.d/query_metric_log.xml`，内容如下：

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

要禁用 `query_metric_log` 设置，您应创建以下文件 `/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，内容如下：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## query_thread_log {#query_thread_log} 

设置记录通过 [log_query_threads=1](/operations/settings/settings#log_query_threads) 设置接收到的查询线程。

查询记录在 [system.query_thread_log](/operations/system-tables/query_thread_log) 表中，而不是单独的文件中。您可以在 `table` 参数中更改该表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询线程日志的结构发生变化，旧结构的表将被重命名，并自动创建新表。

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

设置记录依赖于通过 [log_query_views=1](/operations/settings/settings#log_query_views) 设置接收到的查询的视图（实时、物化等）。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是单独的文件中。您可以在 `table` 参数中更改该表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果在 ClickHouse 服务器更新时查询视图日志的结构发生变化，旧结构的表将被重命名，并自动创建新表。

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

用于通过大页重新分配机器代码（“文本”的）内存的设置。

:::note
此功能高度实验性。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers} 

用于 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数的集群配置。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值，请参见“[配置文件](/operations/configuration-files)”部分。

**另请参阅**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [集群发现](../../operations/cluster-discovery.md)
- [复制的数据库引擎](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts} 

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

添加带有 `\<host\>` xml 标签的主机时：
- 应该完全按照 URL 中的方式指定，因为名称在 DNS 解析之前会被检查。例如：`<host>clickhouse.com</host>`
- 如果在 URL 中明确指定了端口，则会整体检查 host:port。例如：`<host>clickhouse.com:80</host>`
- 如果指定了没有端口的主机，则允许该主机的任何端口。例如：如果指定了 `<host>clickhouse.com</host>`，则允许 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等。
- 如果主机指定为 IP 地址，则将根据 URL 中指定的内容进行检查。例如：`[2a02:6b8:a::a]`。
- 如果存在重定向并启用了对重定向的支持，则检查每个重定向（位置字段）。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

数据库复制的副本组名称。

复制数据库创建的集群将由同一组中的副本组成。
DDL 查询仅会等待同一组中的副本。

默认值为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />用于分片提取请求的 HTTP 连接超时。如果未显式设置，则从默认配置文件 `http_connection_timeout` 继承。

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />提取分片请求的 HTTP 接收超时。如果未显式设置，则从默认配置文件 `http_receive_timeout` 继承。

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />用于分片提取请求的 HTTP 发送超时。如果未显式设置，则从默认配置文件 `http_send_timeout` 继承。

## replicated_merge_tree {#replicated_merge_tree} 

用于指定 [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中的表的微调设置。此设置的优先级更高。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />执行 RESTORE 请求的最大线程数。

## s3queue_log {#s3queue_log} 

`s3queue_log` 系统表的设置。

<SystemLogParameters/>

默认设置如下：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## send_crash_reports {#send_crash_reports} 

发送崩溃报告到 ClickHouse 核心开发团队的设置。

启用此功能，尤其在生产准备环境中，非常受到欢迎。

键：

| 键                     | 描述                                                                                                                                     |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | 布尔标志以启用该功能，默认值为 `true`。设置为 `false` 以避免发送崩溃报告。                                                                 |
| `send_logical_errors` | `LOGICAL_ERROR` 类似于 `assert`，它是 ClickHouse 中的一个错误。此布尔标志启用发送此类异常（默认值：`true`）。                                   |
| `endpoint`            | 您可以覆盖用于发送崩溃报告的端点 URL。                                                                                                 |

**推荐使用**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
Keeper 中具有自动增量编号的路径，由 `generateSerialID` 函数生成。每个系列都将在此路径下成为一个节点。

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />如果设置为真，将在堆栈跟踪中显示地址。

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />如果设置为 true，ClickHouse 将等待正在运行的备份和恢复完成后再关闭。

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />等待未完成查询的延迟时间（以秒为单位）。

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为真，ClickHouse 将等待正在运行的查询完成后再关闭。

## ssh_server {#ssh_server} 

主机密钥的公共部分将在首次连接时写入 SSH 客户端的 known_hosts 文件。

主机密钥配置默认情况下是非活动的。
取消注释主机密钥配置，并提供各自 ssh 密钥的路径以激活它们：

示例：

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />调试参数以模拟物化视图创建延迟。

## storage_configuration {#storage_configuration} 

允许对存储进行多磁盘配置。

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

`disks` 的配置遵循下述结构：

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

上述子标签为 `disks` 定义以下设置：

| 设置                     | 描述                                                                                      |
|-------------------------|-------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | 磁盘的名称，应该是唯一的。                                                                |
| `path`                  | 服务器数据将存储的路径（`data` 和 `shadow` 目录）。应以 `/` 结尾                       |
| `keep_free_space_bytes` | 磁盘上保留的自由空间大小。                                                                |

:::note
磁盘的顺序无关紧要。
:::
### 策略配置 {#configuration-of-policies}

上面的子标签定义了 `policies` 的以下设置：

| 设置                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | 策略的名称。策略名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `volume_name_N`              | 卷的名称。卷名称必须唯一。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `disk`                       | 位于卷内的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `max_data_part_size_bytes`   | 可以在此卷的任何磁盘上驻留的数据块的最大大小。如果合并结果的块大小预期大于 `max_data_part_size_bytes`，则该块将写入下一个卷。基本上，此功能允许您将新的小块存储在热（SSD）卷上，并在它们达到大尺寸时将其移动到冷（HDD）卷。如果策略只有一个卷，请不要使用此选项。                                                                                    |
| `move_factor`                | 卷上可用的空闲空间的份额。如果空间变少，数据将开始转移到下一个卷（如果有）。为了转移，按大小从大到小（降序）对数据块进行排序，并选择总大小足够满足 `move_factor` 条件的数据块，如果所有数据块的总大小不足，则移动所有数据块。                                                                                                                 |
| `perform_ttl_move_on_insert` | 禁用在插入时移动过期的 TTL 数据。默认情况下（如果启用），如果我们插入一段根据生命周期规则已经过期的数据，它会立即移动到移动规则指定的卷/磁盘。这可能会显著减慢插入速度，尤其是在目标卷/磁盘较慢（例如 S3）的情况下。如果禁用，过期的数据部分将写入默认卷，然后立即移动到过期 TTL 规则指定的卷。                                                      |
| `load_balancing`             | 磁盘平衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `least_used_ttl_ms`          | 设置更新所有磁盘上可用空间的超时（以毫秒为单位）（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。请注意，如果磁盘仅由 ClickHouse 使用，并且在运行时不会被文件系统调整大小，则可以使用 `-1` 值。在所有其他情况下不建议使用，因为这最终会导致空间分配不正确。                                                                           |
| `prefer_not_to_merge`        | 禁用在此卷上合并数据块。注意：这可能有害，并可能导致性能下降。当启用此设置时（请勿这样做），在此卷上合并数据是被禁止的（这很糟糕）。这允许控制 ClickHouse 与慢磁盘的交互。我们建议根本不要使用此选项。                                                                                                                                                                                                                  |
| `volume_priority`            | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数，并覆盖从 1 到 N（N 为指定的最大参数值）的范围，没有缺口。                                                                                                                                                                                                                                                                                                                                      |

关于 `volume_priority`：
- 如果所有卷都具有此参数，将按指定顺序进行优先处理。
- 如果只有某些卷具有此参数，则没有此参数的卷优先级最低。具有此参数的卷将根据标签值优先处理，其余的优先级根据在配置文件中的描述顺序相对确定。
- 如果没有卷指定此参数，顺序由配置文件中的描述顺序确定。
- 卷的优先级可能不相同。

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />超出此限制的连接的生存时间显著缩短。该限制适用于存储连接。

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />超出此限制的连接在使用后重置。设置为0以关闭连接缓存。该限制适用于存储连接。

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />如果使用中的连接数量高于此限制，则警告信息将写入日志。该限制适用于存储连接。

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="0" />使用 VERSION_FULL_OBJECT_KEY 格式写入磁盘元数据文件。

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />如果启用，在创建 SharedSet 和 SharedJoin 时会生成内部 UUID。仅适用于 ClickHouse Cloud。

## table_engines_require_grant {#table_engines_require_grant} 

如果设置为 true，用户需要授权才能创建具有特定引擎的表，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，使用特定表引擎创建表时会忽略授权，但您可以通过将其设置为 true 来更改此行为。
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
设置在后台池中执行异步加载作业的线程数。后台池用于在服务器启动后异步加载表，以防没有查询在等待表。如果表的数量较多，建议保持后台池中的线程数较低，以保留 CPU 资源用于并发查询执行。

:::note
值为 `0` 表示将使用所有可用 CPU。
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
设置在前台池中执行加载作业的线程数。前台池用于在服务器启动后监听端口之前的同步加载表，以及对等待加载的表进行加载。前台池的优先级高于后台池。这意味着在前台池中有作业正在运行时，后台池中的作业不会启动。

:::note
值为 `0` 表示将使用所有可用 CPU。
:::

## tcp_port {#tcp_port} 

用于通过 TCP 协议与客户端通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_port_secure {#tcp_port_secure} 

用於与客户端进行安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## tcp_ssh_port {#tcp_ssh_port} 

SSH 服务器的端口，允许用户通过嵌入式客户端使用 PTY 连接并交互式执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## temporary_data_in_cache {#temporary_data_in_cache} 

使用此选项，临时数据将在特定磁盘上存储在缓存中。
在本节中，您应该指定类型为 `cache` 的磁盘名称。
在这种情况下，缓存和临时数据将共享相同的空间，磁盘缓存可以被驱逐以创建临时数据。

:::note
只能使用一个选项来配置临时数据存储： `tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
:::

**示例**

`local_disk` 的缓存和临时数据将存储在文件系统的 `/tiny_local_cache` 中，由 `tiny_local_cache` 管理。

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

## text_log {#text_log} 

用于记录文本消息的 [text_log](/operations/system-tables/text_log) 系统表的设置。

<SystemLogParameters/>

此外：

| 设置   | 描述                                                                                                                                                                                                       | 默认值         |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `level` | 记录在表中的最大消息级别（默认 `Trace`）。                                                                                                                                                                | `Trace`         |

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

<SettingsInfoBlock type="UInt64" default_value="10000" />
全局线程池中可以调度的作业最大数量。增加队列大小会增加内存使用。建议将此值保持与 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size) 相等。

:::note
值为 `0` 表示无限制。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />用于对对象存储执行写请求的后台池的大小。

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推送到对象存储写请求的后台池中的作业数量。

## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
定义在访问未知 WORKLOAD 时使用查询设置 'workload' 的行为。

- 如果为 `true`，则在尝试访问未知工作负载的查询中抛出 RESOURCE_ACCESS_DENIED 异常。用于在建立 WORKLOAD 层次结构并包含 WORKLOAD 默认设置后强制所有查询的资源调度。
- 如果为 `false`（默认），则提供对指向未知工作负载的查询的无限制访问，而无需资源调度。这在设置 WORKLOAD 层次结构时很重要，在添加 WORKLOAD 默认设置之前。

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

## timezone {#timezone} 

服务器的时区。

指定为 IANA 标识符，用于 UTC 时区或地理位置（例如，Africa/Abidjan）。

时区在将 DateTime 字段输出为文本格式（打印到屏幕或文件）和从字符串中获取 DateTime 时对于 String 和 DateTime 格式之间的转换是必要的。此外，当函数在未接收输入参数时的输入参数中没有时区时，时区也将用于处理时间和日期的函数。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另见**

- [session_timezone](../settings/settings.md#session_timezone)

## tmp_path {#tmp_path} 

用于存储大查询处理的临时数据的本地文件系统路径。

:::note
- 只能使用一个选项来配置临时数据存储： `tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- 尾部斜杠是必需的。
:::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp_policy {#tmp_policy} 

用于存储临时数据的策略。有关更多信息，请参阅 [MergeTree 表引擎](/engines/table-engines/mergetree-family/mergetree) 文档。

:::note
- 只能使用一个选项来配置临时数据存储： `tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- `move_factor`，`keep_free_space_bytes`，`max_data_part_size_bytes` 被忽略。
- 策略必须具有 *一个本地* 磁盘的 *一个卷*。
:::

**示例**

当 `/disk1` 满时，临时数据将存储在 `/disk2`。

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

定义要添加的自定义顶级域的列表，其中每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 和其变体，
  接受自定义的 TLD 列表名称，返回包含顶级子域的域名部分，直到第一个显著子域。

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />以与 `total_memory_profiler_sample_probability` 相同的概率收集小于或等于指定值的随机分配。0 意味禁用。您可能需要将 'max_untracked_memory' 设置为 0，以使这个阈值按预期工作。

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />以与 `total_memory_profiler_sample_probability` 相同的概率收集大于或等于指定值的随机分配。0 意味禁用。您可能需要将 'max_untracked_memory' 设置为 0，以使这个阈值按预期工作。

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />每当服务器内存使用量超出每个字节的下一个步骤时，内存分析器将收集分配堆栈跟踪。零表示禁用内存分析器。几兆字节以下的值会减慢服务器速度。

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
允许收集随机分配和撤销，并以 `MemorySample` 的 `trace_type` 写入 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表，概率为指定值。该概率适用于每个分配或撤销，无论分配的大小如何。请注意，采样仅在未跟踪内存超过未跟踪内存限制时发生（默认值为 `4` MiB）。如果 [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) 降低，可能会降低此值。您可以将 `total_memory_profiler_step` 设置为 `1` 进行额外细粒度采样。

可能的值：

- 正整数。
- `0` — 禁用在 `system.trace_log` 系统表中写入随机分配和撤销。

## trace_log {#trace_log} 

用于操作 [trace_log](/operations/system-tables/trace_log) 系统表的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置部分：

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

<SettingsInfoBlock type="String" default_value="SLRU" />未压缩缓存策略名称。

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
用于 MergeTree 家族的表引擎的未压缩数据的最大大小（以字节为单位）。

服务器有一个共享缓存。内存会根据需要分配。如果启用选项 `use_uncompressed_cache`，则会使用缓存。

未压缩缓存对于个别情况下的非常短查询是有利的。

:::note
值为 `0` 意味禁用。

此设置可以在运行时修改，并将立即生效。
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />在未压缩缓存中保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。

## url_scheme_mappers {#url_scheme_mappers} 

配置用于将缩短或符号 URL 前缀转换为完整 URL 的设置。

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

ZooKeeper 中数据部分头的存储方法。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 家族。可以全局指定：

**在 `config.xml` 的 [merge_tree](#merge_tree) 部分**

ClickHouse 对服务器上的所有表使用该设置。可以随时更改此设置。现有的表在设置更改时会改变其行为。

**对于每个表**

在创建表时，指定相应的 [引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。具有此设置的现有表的行为不会因全局设置的更改而改变。

**可能的值**

- `0` — 功能关闭。
- `1` — 功能开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表紧凑地使用单个 `znode` 来存储数据部分的头部。如果表包含许多列，则此存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您无法将 ClickHouse 服务器降级到不支持此设置的版本。在对集群中的服务器升级时，请小心。不要一次性升级所有服务器。在测试环境或集群中的少数服务器上测试新版本的 ClickHouse 更安全。

已使用此设置存储的数据部分头无法恢复到之前（非紧凑）表示。
:::

## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

用户自定义函数的可执行配置文件的路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[可执行用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)".

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## user_defined_path {#user_defined_path} 

包含用户定义文件的目录。用于 SQL 用户定义函数 [SQL 用户定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## user_directories {#user_directories} 

配置文件的部分，包含设置：
- 包含预定义用户的配置文件的路径。
- 存储 SQL 命令创建的用户的文件夹路径。
- 在实验性中，存储经过 SQL 命令创建并复制的用户的 ZooKeeper 节点路径。

如果指定此部分，则将不使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的条目，条目顺序表示其优先级（条目越高，优先级越高）。

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

用户，角色，行策略，配额和配置文件也可以存储在 ZooKeeper 中：

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

您还可以定义部分 `memory` — 指仅在内存中存储信息，而不写入磁盘，以及 `ldap` — 意味在 LDAP 服务器上存储信息。

要添加 LDAP 服务器作为未在本地定义的用户的远程目录，请定义一个具有以下设置的单一 `ldap` 部分：

| 设置    | 描述                                                                                                                                                                                                                                                                                |
|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server` | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是强制性的，不能为空。                                                                                                                                                                                                 |
| `roles`  | 定义的一组本地角色的部分，将分配给从 LDAP 服务器检索的每个用户。如果未指定任何角色，则用户在身份验证后无法执行任何操作。如果身份验证时列出的任何角色在本地未定义，则身份验证尝试将失败，就像提供的密码错误一样。 |

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

包含用户文件的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)， [fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user_scripts_path {#user_scripts_path} 

包含用户脚本文件的目录。用于可执行用户定义函数 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

**类型：**

**默认：**

## users_config {#users_config} 

包含以下内容的文件路径：

- 用户配置。
- 访问权限。
- 设置配置文件。
- 配额设置。

**示例**

```xml
<users_config>users.xml</users_config>
```

## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />确定查询数据包接收时是否启用客户端信息的验证。

默认情况下，设置为 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />矢量相似度索引缓存中条目的大小。零表示禁用。

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />矢量相似度索引缓存策略名称。

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />矢量相似度索引的缓存大小。零表示禁用。

:::note
此设置可以在运行时修改，并将立即生效。
::: 

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />矢量相似度索引缓存中受保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
此设置允许指定当 `dictionaries_lazy_load` 为 `false` 时的行为。
（如果 `dictionaries_lazy_load` 为 `true`，则此设置不影响任何内容。）

如果 `wait_dictionaries_load_at_startup` 为 `false`，则服务器将在启动时开始加载所有字典，并在加载的同时接收连接。
当在查询中首次使用字典时，如果字典尚未加载，查询将会等待字典加载完成。
将 `wait_dictionaries_load_at_startup` 设置为 `false` 可以使 ClickHouse 启动得更快，但某些查询可能会执行得更慢
（因为它们必须等待某些字典加载完成）。

如果 `wait_dictionaries_load_at_startup` 为 `true`，则服务器将在启动时等待
直到所有字典完成加载（成功或失败）后才会接收任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认情况下使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另请参阅**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

指向 ZooKeeper 节点的路径，该节点用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询。为了保持一致性，所有 SQL 定义都存储为此单一 znode 的值。默认情况下不使用 ZooKeeper，定义存储在 [disk](#workload_path) 上。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另请参阅**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 使用 ZooKeeper 来存储副本的元数据，当使用复制表时。如果不使用复制表，则可以省略此参数部分。

可以通过子标签配置以下设置：

| 设置                                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | ZooKeeper 端点。可以设置多个端点。例如：`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定在尝试连接到 ZooKeeper 集群时的节点顺序。                                                                                                                                                                                                                                                                                                                                                             |
| `session_timeout_ms`                    | 客户端会话的最大超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                  | 单个操作的最大超时时间（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `root` (可选)                           | 用作 ClickHouse 服务器使用的 znodes 根的 znode。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (可选)  | 当主节点不可用时，备用节点的 ZooKeeper 会话的最短生命周期限制（负载均衡）。以秒为单位设置。默认值：3 小时。                                                                                                                                                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.max` (可选)  | 当主节点不可用时，备用节点的 ZooKeeper 会话的最长生命周期限制（负载均衡）。以秒为单位设置。默认值：6 小时。                                                                                                                                                                                                                                                                                                                                                                        |
| `identity` (可选)                       | ZooKeeper 访问所请求 znodes 所需的用户和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `use_compression` (可选)                | 如果设置为 true，则在 Keeper 协议中启用压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

还有 `zookeeper_load_balancing` 设置（可选），让您选择 ZooKeeper 节点选择算法：

| 算法名称                      | 描述                                                                                                                               |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `random`                  | 随机选择一个 ZooKeeper 节点。                                                                                                                |
| `in_order`                | 选择第一个 ZooKeeper 节点，如果不可用则选择第二个，以此类推。                                                                                               |
| `nearest_hostname`        | 选择主机名与服务器主机名最相似的 ZooKeeper 节点，主机名与名称前缀进行比较。                                                                   |
| `hostname_levenshtein_distance` | 与 nearest_hostname 相似，但以 levenshtein 距离方式比较主机名。                                                                                 |
| `first_or_random`         | 选择第一个 ZooKeeper 节点，如果不可用，则随机选择其余的 ZooKeeper 节点。                                                                        |
| `round_robin`             | 选择第一个 ZooKeeper 节点，如果发生重新连接，则选择下一个。                                                                                        |

**示例配置**

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
    <!-- 可选。Zookeeper Digest ACL 字符串。 -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另请参阅**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 和 ZooKeeper 之间的可选安全通信](/operations/ssl-zookeeper)
