---
'description': '本节包含服务器设置的描述，即不能在会话或查询级别更改的设置。'
'keywords':
- 'global server settings'
'sidebar_label': '服务器设置'
'sidebar_position': 57
'slug': '/operations/server-configuration-parameters/settings'
'title': '服务器设置'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# 服务器设置

本节包含服务器设置的描述。这些是不能在会话或查询级别更改的设置。

有关 ClickHouse 中配置文件的更多信息，请参见["配置文件"](/operations/configuration-files)。

其他设置描述在""[设置](/operations/settings/overview)""节中。在学习设置之前，建议您先阅读[配置文件](/operations/configuration-files)部分，并注意替换的使用（`incl` 和 `optional` 属性）。

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />在 LOGICAL_ERROR 异常时使服务器崩溃。仅适用于专家。

## access_control_improvements {#access_control_improvements} 

对访问控制系统的可选改进的设置。

| 设置                                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 默认值  |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`       | 设置没有允许行策略的用户是否仍然可以使用 `SELECT` 查询读取行。例如，如果有两个用户 A 和 B，并且仅为 A 定义了一行策略，则如果该设置为 true，用户 B 将看到所有行。如果该设置为 false，用户 B 将看不到任何行。                                                                                                                                                                                                                                                             | `true`  |
| `on_cluster_queries_require_cluster_grant`       | 设置 `ON CLUSTER` 查询是否需要 `CLUSTER` 授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `true`  |
| `select_from_system_db_requires_grant`           | 设置 `SELECT * FROM system.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则该查询需要 `GRANT SELECT ON system.<table>`，就像对非系统表一样。例外情况：一些系统表（如 `tables`、`columns`、`databases` 和一些常量表如 `one`、`contributors`）仍然可以被所有人访问；如果授予了 `SHOW` 权限（例如 `SHOW USERS`），那么相应的系统表（即 `system.users`）也将可访问。 | `true`  |
| `select_from_information_schema_requires_grant`  | 设置 `SELECT * FROM information_schema.<table>` 是否需要任何授权，并且可以由任何用户执行。如果设置为 true，则该查询需要 `GRANT SELECT ON information_schema.<table>`，就像普通表一样。                                                                                                                                                                                                                                                                                   | `true`  |
| `settings_constraints_replace_previous`          | 设置某设置的设置文件中的约束是否取消对该设置的先前约束（在其他文件中定义）的行为，包括未被新约束设置的字段。它还启用了 `changeable_in_readonly` 约束类型。                                                                                                                                                                                                                                                                                                        | `true`  |
| `table_engines_require_grant`                    | 设置是否使用特定表引擎创建表需要授权。                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `false` |
| `role_cache_expiration_time_seconds`             | 设置角色存储在角色缓存中的最大访问时间（秒）。                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `600`   |

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

**另见**

- [访问控制和账户管理](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />在 groupArray 中超出最大数组元素大小时执行的操作：`throw` 异常或 `discard` 额外值。

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />groupArray 函数的最大数组元素大小（以字节为单位）。此限制在序列化时检查，以帮助避免大型状态大小。

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
控制用户是否可以更改与不同功能级别有关的设置。

- `0` - 允许对任何设置进行更改（实验、测试、生产）。
- `1` - 仅允许对测试和生产功能设置进行更改。对实验性设置的更改被拒绝。
- `2` - 仅允许对生产设置进行更改。对实验或测试设置的更改被拒绝。

这相当于对所有 `EXPERIMENTAL` / `BETA` 功能设置只读约束。

:::note
值为 `0` 意味着可以更改所有设置。
:::

## allow_implicit_no_password {#allow_implicit_no_password} 

禁止创建没有密码的用户，除非显式指定 'IDENTIFIED WITH no_password'。

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow_no_password {#allow_no_password} 

设置是否允许不安全的无密码类型。

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

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

允许与 Iceberg 配合使用的磁盘列表。

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />如果为 true，则在优雅关闭时刷新异步插入队列。

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />实际解析和插入数据的最大线程数。零表示禁用异步模式。

## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
异步加载数据库和表。

- 如果为 `true`，在 ClickHouse 服务器启动后，所有具有 `Ordinary`、`Atomic` 和 `Replicated` 引擎的非系统数据库将异步加载。请参阅 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的表的查询将会等待确切的表启动。如果加载作业失败，查询将重新抛出错误（而不是在 `async_load_databases = false` 的情况下关闭整个服务器）。至少有一个查询在等待的表将以更高的优先级加载。对数据库的 DDL 查询将等待确切的数据库启动。还可以考虑设置 `max_waiting_queries` 的限制以限制总等待查询的数量。
- 如果为 `false`，则在服务器启动时加载所有数据库。

**示例**

```xml
<async_load_databases>true</async_load_databases>
```

## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
异步加载系统表。如果 `system` 数据库中有大量日志表和分片，这将很有帮助。独立于 `async_load_databases` 设置。

- 如果设置为 `true`，在 ClickHouse 服务器启动后，所有具有 `Ordinary`、`Atomic` 和 `Replicated` 引擎的系统数据库将异步加载。请参见 `system.asynchronous_loader` 表、`tables_loader_background_pool_size` 和 `tables_loader_foreground_pool_size` 服务器设置。任何尝试访问尚未加载的系统表的查询将会等待确切的表启动。至少一个查询在等待的表将以更高的优先级加载。还可以考虑设置 `max_waiting_queries` 设置以限制总等待查询的数量。
- 如果设置为 `false`，在服务器启动之前加载系统数据库。

**示例**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />更新重异步指标的周期（以秒为单位）。

## asynchronous_insert_log {#asynchronous_insert_log} 

[asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) 系统表的设置，用于日志记录异步插入。

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

如果您所在环境中未默认启用此设置，具体取决于 ClickHouse 的安装方式，您可以按以下说明启用或禁用它。

**启用**

要手动打开异步指标日志历史记录收集 [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md)，创建 `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml`，内容如下：

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

要禁用 `asynchronous_metric_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml`，内容如下：

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />启用重异步指标的计算。

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />更新异步指标的周期（以秒为单位）。

## auth_use_forwarded_address {#auth_use_forwarded_address} 

对通过代理连接的客户端使用源地址进行身份验证。

:::note
该设置应小心使用，因为转发地址很容易被伪造 - 直接访问接受此类身份验证的服务器是不应当的，而应仅通过可信的代理访问。
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />将用于在后台执行 [Buffer-engine tables](/engines/table-engines/special/buffer) 刷新操作的最大线程数。

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />将用于在后台对各种操作（主要是垃圾收集）执行的最大线程数，用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />将用于执行分布式发送的最大线程数。

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />将用于从另一副本获取数据部分的最大线程数，用于 [*MergeTree-engine](/engines/table-engines/mergetree-family) 表。

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
设置线程数与可以并发执行的后台合并和变更数量之间的比率。

例如，如果此比率等于 2，并且 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置为 16，则 ClickHouse 可以同时执行 32 次后台合并。这是可能的，因为后台操作可以被挂起和推迟。这是为了给小型合并更高的执行优先级。

:::note
您只能在运行时增加此比率。要降低它，必须重新启动服务器。

与 [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) 设置相同，[`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) 可以从 `default` 配置文件中应用，以保持向后兼容。
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
对后台合并和变更的调度执行策略。可能的值为：`round_robin` 和 `shortest_task_first`。

算法用于选择由后台线程池执行的下一个合并或变更。策略可以在运行时更改，而无需重新启动服务器。可以从 `default` 配置文件中应用，以保持向后兼容。

可能的值：

- `round_robin` - 每个并发合并和变更以轮换顺序执行，以确保不会饿死操作。较小的合并通常会比较大的合并完成得更快，因为它们需要合并的块较少。
- `shortest_task_first` - 始终执行较小的合并或变更。合并和变更根据其结果大小分配优先级。较小的合并优先于较大的合并。此策略可确保小部分的快速合并，但可能导致严重的分区中较大合并的长期饥饿。

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />将用于为消息流执行后台操作的最大线程数。

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />将用于将数据部分移至另一个磁盘或卷的最大线程数，用于 *MergeTree-engine 表，在后台进行。

## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
设置用于执行 MergeTree 引擎表的后台合并和变更的线程数。

:::note
- 此设置也可以在服务器启动时从 `default` 配置文件计算，以确保向后兼容。
- 您只能在运行时增加线程数。
- 要降低线程数，必须重新启动服务器。
- 通过调整此设置，您可以管理 CPU 和磁盘负载。
:::

:::danger
较小的池大小会减少 CPU 和磁盘资源的使用，但后台进程的推进速度较慢，这可能最终影响查询性能。
:::

在更改之前，请还查看与合并树相关的其他设置，例如：
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge)。
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation)。
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**示例**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />池中可以同时执行相同类型的任务的最大线程比率。

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />将用于不断执行一些轻量级定期操作的最大线程数，这些操作适用于复制表、Kafka 流和 DNS 缓存更新。

## backup_log {#backup_log} 

用于[backup_log](../../operations/system-tables/backup_log.md) 系统表的设置，用于记录 `BACKUP` 和 `RESTORE` 操作。

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

执行 `BACKUP TO File()` 时使用的备份设置。

以下设置可以通过子标签进行配置：

| 设置                               | 描述                                                                                                                                                                     | 默认值  |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | 使用 `File()` 备份的路径。此设置必须设置才能使用 `File`。路径可以相对于实例目录，或者可以是绝对路径。                                                                     | `true`  |
| `remove_backup_files_after_failure` | 如果 `BACKUP` 命令失败，ClickHouse 将尝试删除已复制到备份中的文件，或者在失败之前，它将保持已复制的文件不变。                                                        | `true`  |

默认情况下，此设置配置为：

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
值 `0`（默认）意味着无限制。
:::

## bcrypt_workfactor {#bcrypt_workfactor} 

使用 [Bcrypt 算法](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/) 的 `bcrypt_password` 身份验证类型的工作因子。工作因子定义计算哈希和验证密码所需的计算量和时间。

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
对于高频身份验证的应用程序，请考虑使用其他身份验证方法，因为 bcrypt 在更高的工作因子下的计算开销。
:::

## blob_storage_log {#blob_storage_log} 

[`blob_storage_log`](../system-tables/blob_storage_log.md) 系统表的设置。

<SystemLogParameters/>

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

重载内置字典的时间间隔（以秒为单位）。

ClickHouse 每 x 秒重新加载内置字典。这使得在不重新启动服务器的情况下"动态"编辑字典成为可能。

**示例**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />设置缓存大小与 RAM 最大比率。在低内存系统上允许降低缓存大小。

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />用于测试目的。

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
服务器的最大允许内存消耗在 cgroups 中的阈值调整的持续时间（以秒为单位）。

要禁用 cgroup 观察者，请将此值设置为 `0`。

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />设置 [已编译表达式](../../operations/caches.md) 的缓存大小（以元素为单位）。

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />设置 [已编译表达式](../../operations/caches.md) 的缓存大小（以字节为单位）。

## compression {#compression} 

适用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 引擎表的数据压缩设置。

:::note
建议在您刚开始使用 ClickHouse 时不要更改此设置。
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

- `min_part_size` – 数据部分的最小大小。
- `min_part_size_ratio` – 数据部分大小与表大小的比率。
- `method` – 压缩方法。可接受的值：`lz4`、`lz4hc`、`zstd`、`deflate_qpl`。
- `level` – 压缩级别。请参见 [Codecs](/sql-reference/statements/create/table#general-purpose-codecs)。

:::note
您可以配置多个 `<case>` 部分。
:::

**满足条件时的操作**：

- 如果数据部分符合设置的条件，ClickHouse 将使用指定的压缩方法。
- 如果数据部分符合多个条件集，ClickHouse 将使用第一个匹配的条件集。

:::note
如果数据部分不满足条件，ClickHouse 将使用 `lz4` 压缩。
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
对 `concurrent_threads_soft_limit_num` 和 `concurrent_threads_soft_limit_ratio_to_cores` 指定的 CPU 槽调度的执行策略。用于治理在并发查询中分配有限数量的 CPU 槽的算法。调度程序可以在运行时更改，而不需要重新启动服务器。

可能的值：

- `round_robin` - 每个设置 `use_concurrency_control` = 1 的查询分配最多 `max_threads` 个 CPU 槽。每个线程一个槽。如果出现争用，CPU 槽以轮换方式授予查询。请注意，第一个槽是无条件授予的，这可能导致不公平和增加具有高 `max_threads` 的查询的延迟。
- `fair_round_robin` - 每个设置 `use_concurrency_control` = 1 的查询分配最多 `max_threads - 1` 个 CPU 槽。此轮换的变体不要求每个查询的第一个线程占用一个 CPU 槽。这样，具有 `max_threads` = 1 的查询不需要任何槽，并且无法不公平地分配所有槽。没有槽是无条件授予的。

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
允许所有查询运行的最大查询处理线程数，不包括从远程服务器获取数据的线程。这不是硬限制。如果达到该限制，查询仍将获得至少一个线程来运行。查询可以在执行过程中升级到所需的线程数，如果有更多线程可用。

:::note
值为 `0` （默认值）表示无限制。
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />与 [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) 相同，但与核心的比率。

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />ClickHouse 将多长时间重新加载配置并检查新更改。

## core_dump {#core_dump} 

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

## cpu_slot_preemption {#cpu_slot_preemption} 

<SettingsInfoBlock type="Bool" default_value="0" />
定义 CPU 资源（主线程和工作线程）的工作负载调度方式。

- 如果为 `true`（推荐），根据实际消耗的 CPU 时间进行计算。将为竞争工作负载分配公平数量的 CPU 时间。为有限时间分配的插槽在到期后需要重新请求。如果 CPU 资源超载，请求插槽可能会阻塞线程执行，即可能发生抢占。这确保了 CPU 时间的公平性。
- 如果为 `false`（默认），则根据分配的 CPU 槽数量进行计算。将为竞争工作负载分配公平数量的 CPU 槽。线程启动时分配一个插槽，持续保持，直到线程结束执行。为查询执行分配的线程数可能仅从 1 增加到 `max_threads`，而不能减少。这对长时间运行的查询更有利，可能导致短查询的 CPU 资源不足。

**示例**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
它定义了一个工作线程在抢占期间可以等待多少毫秒，即在等待授予另一个 CPU 槽期间。如果在此超时后线程无法获得新的 CPU 槽，则将退出，并且查询动态地降低并发执行线程的数量。请注意，主线程永远不会下调，但可以无限期抢占。仅在启用 `cpu_slot_preemption` 且为工作线程定义 CPU 资源时才有意义。

**示例**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

## cpu_slot_quantum_ns {#cpu_slot_quantum_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />
它定义了线程在获得 CPU 槽后可以消耗多少 CPU 纳秒，并在此之前应请求另一个 CPU 槽。仅在启用 `cpu_slot_preemption` 且为主线程或工作线程定义 CPU 资源时才有意义。

**示例**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**另见**
- [工作负载调度](/operations/workload-scheduling.md)

## crash_log {#crash_log} 

[crash_log](../../operations/system-tables/crash_log.md) 系统表操作的设置。

<SystemLogParameters/>

默认服务器配置文件 `config.xml` 包含以下设置部分：

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

此设置指定用于自定义（从 SQL 创建的）缓存磁盘的缓存路径。
`custom_cached_disks_base_directory` 对自定义磁盘优先于 `filesystem_caches_path`（在 `filesystem_caches_path.xml` 中找到）。
如果前者不存在，将使用后者。
文件系统缓存设置路径必须位于该目录内，
否则将抛出异常以阻止磁盘创建。

:::note
这不会影响为其升级了服务器的旧版本创建的磁盘。
在这种情况下，不会抛出异常，以允许服务器成功启动。
:::

示例：

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## custom_settings_prefixes {#custom_settings_prefixes} 

[自定义设置](/operations/settings/query-level#custom_settings) 的前缀列表。前缀必须用逗号分隔。

**示例**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**另见**

- [自定义设置](/operations/settings/query-level#custom_settings)

## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
删除表的过程中，可以使用 [`UNDROP`](/sql-reference/statements/undrop.md) 语句恢复被删除的表的延迟。如果 `DROP TABLE` 以 `SYNC` 修饰符运行，则此设置将被忽略。
该设置的默认值为 `480`（8分钟）。

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />在删除表失败的情况下，ClickHouse 将在重试操作之前等待此超时。

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />用于删除表的线程池大小。

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
清理 `store/` 目录中的垃圾的任务参数。
设置该任务的调度周期。

:::note
值 `0` 表示"从不"。默认值对应于 1 天。
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
清理 `store/` 目录中的垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且该目录在过去的 [`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) 秒内未被修改，则该任务将通过
删除所有访问权限来"隐藏"该目录。它也适用于 clickhouse-server 不希望在 `store/` 中看到的目录。

:::note
值 `0` 表示"立即"。
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
清理 `store/` 目录垃圾的任务参数。
如果某个子目录未被 clickhouse-server 使用，并且之前处于 "隐藏" 状态
(参见 [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
并且该目录在过去的
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) 秒内未被修改，任务将会删除此目录。
它也适用于 clickhouse-server 预计不会在 `store/` 内部看到的目录。

:::note
值为 `0` 意味着 "从不"。默认值对应于 30 天。
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />允许在副本数据库中永久分离表
## dead_letter_queue {#dead_letter_queue} 

用于 "dead_letter_queue" 系统表的设置。

<SystemLogParameters/>

默认设置为：

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
## default_password_type {#default_password_type} 

设置在 `CREATE USER u IDENTIFIED BY 'p'` 查询中自动设置的密码类型。

接受的值有：
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile} 

默认设置配置文件。设置配置文件位于 `user_config` 设置指定的文件中。

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

默认会话超时时间，以秒为单位。

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config} 

字典的配置文件路径。

路径：

- 指定绝对路径或相对服务器配置文件的路径。
- 路径可以包含通配符 \* 和 ?。

另请参见：
- "[Dictionaries](../../sql-reference/dictionaries/index.md)".

**示例**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />
字典的懒加载。

- 如果 `true`，则每个字典在第一次使用时加载。如果加载失败，使用字典的函数将抛出异常。
- 如果 `false`，则服务器在启动时加载所有字典。

:::note
服务器在启动时将等待，直到所有字典完成加载，然后才能接收任何连接
(例外：如果 [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) 设置为 `false`)。
:::

**示例**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />启用 `background_reconnect` 的失败 MySQL 和 Postgres 字典重连尝试的间隔（以毫秒为单位）。
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
禁用所有插入/更改/删除查询。如果需要只读节点以防止插入和更改影响读取性能，则将启用此设置。
## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />禁用内部 DNS 缓存。建议在基础设施经常变更的系统（如 Kubernetes）中运行 ClickHouse 时使用。
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

默认情况下，使用隧道（即 `HTTP CONNECT`）通过 `HTTP` 代理进行 `HTTPS` 请求。可以使用此设置禁用它。

**no_proxy**

默认情况下，所有请求将通过代理。为了对特定主机禁用代理，必须设置 `no_proxy` 变量。
可以在 `<proxy>` 子句中为列出和远程解析器设定，并作为环境变量用于环境解析器。
它支持 IP 地址、域、子域和 `'*'` 通配符进行完全绕过。前导点将被去除，像 curl 一样。

**示例**

以下配置绕过对 `clickhouse.cloud` 及其所有子域（例如，`auth.clickhouse.cloud`）的代理请求。
同样适用于 GitLab，尽管它有一个前导点。`gitlab.com` 和 `about.gitlab.com` 将绕过代理。

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

<SettingsInfoBlock type="UInt64" default_value="5000" />超过此限制的连接有明显更短的生存时间。限制适用于磁盘连接。
## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />超过此限制的连接使用后会重置。设置为 0 以关闭连接缓存。限制适用于磁盘连接。
## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />如果正在使用的连接数量超过此限制，将在日志中写入警告消息。限制适用于磁盘连接。
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
启用或禁用在 `SHOW` 和 `SELECT` 查询中显示表、数据库、表函数和字典的秘密。

希望查看秘密的用户还必须
启用 [`format_display_secrets_in_show_and_select` 格式设置](../settings/formats#format_display_secrets_in_show_and_select)
并拥有 [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 特权。

可能的值：

- `0` — 禁用。
- `1` — 启用。
## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />缓存服务器是否应应用从客户端接收到的限流设置。
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />分布式缓存将尝试保持空闲的活动连接数量的软限制。当空闲连接数量低于 distributed_cache_keep_up_free_connections_ratio * max_connections 时，将关闭活动最老的连接，直到数量超过限制。
## distributed_ddl {#distributed_ddl} 

管理在集群上执行 [分布式 ddl 查询](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`)。
仅在启用 [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) 的情况下工作。

`<distributed_ddl>` 中的可配置设置包括：

| 设置                   | 描述                                                                                                                                      | 默认值                               |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| `path`                 | DDL 查询的 `task_queue` 在 Keeper 中的路径                                                                                              |                                      |
| `profile`              | 用于执行 DDL 查询的配置文件                                                                                                            |                                      |
| `pool_size`            | 同时可以运行多少个 `ON CLUSTER` 查询                                                                                                       |                                      |
| `max_tasks_in_queue`   | 队列中可以存在的最大任务数量。                                                                                                          | `1,000`                              |
| `task_max_lifetime`    | 如果节点的年龄超过此值，则删除节点。                                                                                                  | `7 * 24 * 60 * 60` （一周的秒数）     |
| `cleanup_delay_period` | 在接收到新节点事件后，清理在上次清理未发生超过 `cleanup_delay_period` 秒后开始。                                                       | `60` 秒                              |

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
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />允许解析名字为 ipv4 地址。
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />允许解析名字为 ipv6 地址。
## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />内部 DNS 缓存最大条目数。
## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />内部 DNS 缓存更新周期（以秒为单位）。
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />在将主机名从 ClickHouse DNS 缓存中删除之前，解析主机名的最大 DNS 失败次数。
## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />用于删除分布式缓存的线程池大小。
## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />用于删除分布式缓存的线程池队列大小。
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />启用来自 Azure sdk 的日志记录。
## encryption {#encryption} 

配置用于 [encryption codecs](/sql-reference/statements/create/table#encryption-codecs) 的密钥获取命令。密钥（或密钥）应写入环境变量或在配置文件中设置。

密钥可以是十六进制或者长度为 16 字节的字符串。

**示例**

从配置加载：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
不建议在配置文件中存储密钥。这不安全。您可以将密钥移动到安全磁盘的单独配置文件中，并将该配置文件的符号链接放入 `config.d/` 文件夹中。
:::

从配置加载，当密钥是十六进制时：

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

此处 `current_key_id` 设置用于加密的当前密钥，所有指定的密钥可用于解密。

这些方法中的每一个都可以应用于多个密钥：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

此处 `current_key_id` 显示当前的加密密钥。

此外，用户可以添加需要 12 字节长度的 nonce（默认情况下加密和解密过程使用由零字节组成的 nonce）：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

或者可以设置为十六进制：

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
上述所有内容均适用于 `aes_256_gcm_siv` （但密钥必须为 32 字节长）。
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

要禁用 `error_log` 设置，您应该创建以下文件 `/etc/clickhouse-server/config.d/disable_error_log.xml`，内容如下：

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
可以在解析输入时调度的最大作业数量。

:::note
值为 `0` 意味着无限制。
:::
## format_schema_path {#format_schema_path} 

输入数据模式的目录路径，例如 [CapnProto](../../interfaces/formats.md#capnproto) 格式的模式。

**示例**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />全局剖析器的 CPU 时钟计时器周期（以纳秒为单位）。设置为 0 以关闭 CPU 时钟全局剖析器。推荐值至少为 10000000（每秒 100 次）用于单个查询或 1000000000（每秒一次）用于集群范围的剖析。
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />全局剖析器的实际时钟计时器周期（以纳秒为单位）。设置为 0 以关闭实际时钟全局剖析器。推荐值至少为 10000000（每秒 100 次）用于单个查询或 1000000000（每秒一次）用于集群范围的剖析。
## google_protos_path {#google_protos_path} 

定义一个目录，包含用于 Protobuf 类型的 proto 文件。

示例：

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite} 

将数据发送到 [Graphite](https://github.com/graphite-project)。

设置：

- `host` – Graphite 服务器。
- `port` – Graphite 服务器的端口。
- `interval` – 发送间隔，以秒为单位。
- `timeout` – 发送数据的超时时间，以秒为单位。
- `root_path` – 键的前缀。
- `metrics` – 从 [system.metrics](/operations/system-tables/metrics) 表发送数据。
- `events` – 从 [system.events](/operations/system-tables/events) 表发送在时间段内累积的增量数据。
- `events_cumulative` – 从 [system.events](/operations/system-tables/events) 表发送累积数据。
- `asynchronous_metrics` – 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表发送数据。

您可以配置多个 `<graphite>` 子句。例如，您可以用来在不同的间隔发送不同的数据。

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

用于 Graphite 的数据精简设置。

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

HSTS 的过期时间，以秒为单位。

:::note
值为 `0` 意味着 ClickHouse 禁用 HSTS。如果您设置一个正数，HSTS 将启用，并且 max-age 为您设置的数字。
:::

**示例**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />超过此限制的连接有明显更短的生存时间。限制适用于不属于任何磁盘或存储的 http 连接。
## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />超过此限制的连接使用后会重置。设置为 0 以关闭连接缓存。限制适用于不属于任何磁盘或存储的 http 连接。
## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />如果正在使用的连接数量超过此限制，将在日志中写入警告消息。限制适用于不属于任何磁盘或存储的 http 连接。
## http_handlers {#http_handlers} 

允许使用自定义 HTTP 处理程序。
要添加新的 http 处理程序，只需添加一个新的 `<rule>`。
规则按照定义的从上到下检查，
第一个匹配项将运行处理程序。

可以通过子标签配置以下设置：

| 子标签               | 定义                                                                                                                                                               |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 要匹配请求 URL，您可以使用 'regex:' 前缀来使用正则表达式匹配（可选）                                                                                                   |
| `methods`            | 要匹配请求方法，您可以使用逗号分隔多个方法匹配（可选）                                                                                                                            |
| `headers`            | 要匹配请求头，匹配每个子元素（子元素名称是头名称），您可以使用 'regex:' 前缀来使用正则表达式匹配（可选）                                                                  |
| `handler`            | 请求处理程序                                                                                                                                                       |
| `empty_query_string` | 检查 URL 中是否没有查询字符串                                                                                                                                            |

`handler` 包含以下设置，可以通过子标签进行配置：

| 子标签               | 定义                                                                                                                                                          |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | 重定向的位置                                                                                                                                                   |
| `type`               | 支持的类型：static、dynamic_query_handler、predefined_query_handler、redirect                                                                                   |
| `status`             | 与静态类型一起使用，响应状态代码                                                                                                                                 |
| `query_param_name`   | 与 dynamic_query_handler 类型一起使用，从 HTTP 请求参数中提取并执行与 `<query_param_name>` 值相对应的值                                                                                |
| `query`              | 与 predefined_query_handler 类型一起使用，调用处理程序时执行查询                                                                                                   |
| `content_type`       | 与静态类型一起使用，响应内容类型                                                                                                                                  |
| `response_content`   | 与静态类型一起使用，发送到客户端的响应内容，当使用前缀 'file://' 或 'config://' 时，从文件或配置中查找内容发送到客户端                                                    |

您可以指定默认处理程序的 `<defaults/>` 列表，以启用所有默认处理程序。

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

用于在 `OPTIONS` HTTP 请求中添加响应头。
`OPTIONS` 方法用于发出 CORS 预检请求。

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

在访问 ClickHouse HTTP(s) 服务器时默认显示的页面。
默认值为 "Ok."（末尾带换行符）

**示例**

访问 `http://localhost: http_port` 时打开 `https://tabix.io/`。

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />冰山目录的后台池大小
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入冰山目录池的任务数量
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />冰山元数据文件缓存的最大条目数。零表示禁用。
## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

冰山元数据缓存策略名称。
## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

冰山元数据缓存的最大大小（以字节为单位）。零表示禁用。
## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

冰山元数据缓存中受保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
如果为 true，ClickHouse 在 `CREATE VIEW` 查询中不写入空 SQL 安全语句的默认值。

:::note
此设置仅在迁移期间是必要的，并将在 24.4 中变得过时
:::
## include_from {#include_from} 

替换文件的路径。支持 XML 和 YAML 格式。

有关更多信息，请参见 “[Configuration files](/operations/configuration-files)” 部分。

**示例**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引标记缓存策略名称。
## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
最大索引标记的缓存大小。

:::note

值为 `0` 表示禁用。

该设置可以在运行时修改，并将立即生效。
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />二级索引标记缓存中受保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />二级索引未压缩缓存策略名称。
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
`MergeTree` 索引未压缩块的最大缓存大小。

:::note
值为 `0` 表示禁用。

该设置可以在运行时修改，并将立即生效。
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />二级索引未压缩缓存中受保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。
## interserver_http_credentials {#interserver_http_credentials} 

在 [复制](../../engines/table-engines/mergetree-family/replication.md) 期间，用于连接到其他服务器的用户名和密码。此外，服务器使用这些凭据来验证其他副本。
因此 `interserver_http_credentials` 必须对集群中的所有副本相同。

:::note
- 默认情况下，如果省略 `interserver_http_credentials` 部分，则在复制期间不使用身份验证。
- `interserver_http_credentials` 设置与 ClickHouse 客户端凭据 [配置](../../interfaces/cli.md#configuration_files) 无关。
- 这些凭据适用于通过 `HTTP` 和 `HTTPS` 进行复制。
:::

可以通过子标签配置以下设置：

- `user` — 用户名。
- `password` — 密码。
- `allow_empty` — 如果为 `true`，则其他副本可以在设置凭据的情况下无需身份验证连接。如果为 `false`，则拒绝未经身份验证的连接。默认值：`false`。
- `old` — 包含在凭据轮换期间使用的旧 `user` 和 `password`。可以指定多个 `old` 部分。

**凭据轮换**

ClickHouse 支持动态的 interserver 凭据轮换，而无需同时停止所有副本以更新其配置。凭据可以分步更改。

要启用身份验证，将 `interserver_http_credentials.allow_empty` 设置为 `true` 并添加凭据。这允许带身份验证和不带身份验证的连接。

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

在配置所有副本后，将 `allow_empty` 设置为 `false` 或者删除此设置。这使得使用新凭据强制身份验证。

要更改现有凭据，将用户名和密码移动到 `interserver_http_credentials.old` 部分，并使用新值更新 `user` 和 `password`。此时服务器使用新凭据连接到其他副本，并接受使用新或旧凭据的连接。

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

当新凭据应用到所有副本时，可以删除旧凭据。
## interserver_http_host {#interserver_http_host} 

其他服务器可用于访问此服务器的主机名。

如果省略，将采用与 `hostname -f` 命令相同的定义。

适合摆脱特定网络接口。

**示例**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_http_port {#interserver_http_port} 

用于在 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_https_host {#interserver_https_host} 

类似于 [`interserver_http_host`](#interserver_http_host)，不过这个主机名可供其他服务器通过 `HTTPS` 访问此服务器。

**示例**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port} 

用于通过 `HTTPS` 在 ClickHouse 服务器之间交换数据的端口。

**示例**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host} 

限制可以在 ClickHouse 服务器之间交换数据的主机。
如果使用 Keeper，则该限制将适用于不同 Keeper 实例之间的通信。

:::note
默认情况下，值与 [`listen_host`](#listen_host) 设置相等。
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
可以在 IO 线程池上调度的最大作业数量。

:::note
值为 `0` 意味着无限制。
:::
## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />将 jemalloc 的采样分配存储在 system.trace_log 中。
## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />启用 jemalloc 后台线程。Jemalloc 使用后台线程来清理未使用的内存页。禁用它可能导致性能下降。
## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />为所有线程启用 jemalloc 的分配剖析器。Jemalloc 将采样分配和所有采样分配的去分配。
可以使用系统命令 SYSTEM JEMALLOC FLUSH PROFILE 进行配置分析。
样本也可以使用配置 jemalloc_collect_global_profile_samples_in_trace_log 或查询设置 jemalloc_collect_profile_samples_in_trace_log 存储在 system.trace_log 中。
参见 [Allocation Profiling](/operations/allocation-profiling)。
## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />在全局峰值内存占用增加到 jemalloc_flush_profile_interval_bytes 后，将进行 jemalloc 剖析刷新。
## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

在发生总内存超限错误时将进行 jemalloc 剖析刷新。
## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

要创建的 jemalloc 后台线程的最大数量，设置为 0 使用 jemalloc 的默认值。
## keep_alive_timeout {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
ClickHouse 在关闭连接之前，等待 HTTP 协议的传入请求的秒数。

**示例**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_hosts {#keeper_hosts} 

动态设置。包含 ClickHouse 可以潜在连接的一组 [Zoo]Keeper 主机。不会公开来自 ``<auxiliary_zookeepers>`` 的信息。
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
支持批处理的多读请求到 [Zoo]Keeper 的最大批处理大小。如果设置为 0，则禁用批处理。仅在 ClickHouse Cloud 中可用。
## ldap_servers {#ldap_servers}

在此列出 LDAP 服务器及其连接参数，以便：
- 用作专用本地用户的身份验证者，这些用户指定了 "ldap" 认证机制，而不是 "password"
- 用作远程用户目录。

以下设置可以通过子标签进行配置：

| 设置                            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                   |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | LDAP 服务器的主机名或 IP，此参数是必需的，不能为空。                                                                                                                                                                                                                                                                                                                                                                   |
| `port`                         | LDAP 服务器端口，如果 `enable_tls` 设置为 true，默认是 636，否则为 389。                                                                                                                                                                                                                                                                                                                                            |
| `bind_dn`                      | 用于构建绑定的 DN 的模板。在每次身份验证尝试中，生成的 DN 将通过用实际用户名替换模板中的所有 `\{user_name\}` 子字符串来构造。                                                                                                                                                                                                                                                                                             |
| `user_dn_detection`            | 包含 LDAP 搜索参数的部分，用于检测已绑定用户的实际用户 DN。这主要在 Active Directory 服务器的搜索过滤器中用于进一步的角色映射。生成的用户 DN 将在允许替换 `\{user_dn\}` 子字符串时使用。默认情况下，用户 DN 设置为等于绑定 DN，但一旦执行搜索，它将被实际检测到的用户 DN 值更新。                                             |
| `verification_cooldown`        | 成功绑定尝试后的一段时间（以秒为单位），在该时间段内，用户将被假定为成功认证，用于所有后续请求，而无需联系 LDAP 服务器。指定 `0`（默认值）来禁用缓存，并强制在每次身份验证请求时联系 LDAP 服务器。                                                                                                                                                |
| `enable_tls`                   | 触发与 LDAP 服务器的安全连接的标志。指定 `no` 以使用明文 (`ldap://`) 协议（不推荐）。指定 `yes` 以使用基于 SSL/TLS 的 LDAP (`ldaps://`) 协议（推荐，默认）。指定 `starttls` 以使用旧版 StartTLS 协议（明文（`ldap://`）协议，升级到 TLS）。                                                                                                    |
| `tls_minimum_protocol_version` | SSL/TLS 的最低协议版本。接受的值包括：`ssl2`、`ssl3`、`tls1.0`、`tls1.1`、`tls1.2`（默认）。                                                                                                                                                                                                                                                                                                                 |
| `tls_require_cert`             | SSL/TLS 对等证书验证行为。接受的值包括：`never`、`allow`、`try`、`demand`（默认）。                                                                                                                                                                                                                                                                                                                            |
| `tls_cert_file`                | 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tls_key_file`                 | 证书密钥文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_file`             | CA 证书文件的路径。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tls_ca_cert_dir`              | 包含 CA 证书的目录的路径。                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_cipher_suite`             | 允许的密码套件（以 OpenSSL 表示法）。                                                                                                                                                                                                                                                                                                                                                                               |

设置 `user_dn_detection` 可以通过子标签进行配置：

| 设置          | 描述                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`     | 用于构建 LDAP 搜索的基本 DN 的模板。在 LDAP 搜索过程中，生成的 DN 通过替换模板中所有 `\{user_name\}` 和 `\{bind_dn\}` 子字符串与实际用户名和绑定 DN 构建。                                                                                                                                                                                                                                  |
| `scope`       | LDAP 搜索的范围。接受的值包括：`base`、`one_level`、`children`、`subtree`（默认）。                                                                                                                                                                                                                                                                                                                     |
| `search_filter`| 用于构建 LDAP 搜索的搜索过滤器的模板。在 LDAP 搜索过程中，生成的过滤器通过替换模板中所有 `\{user_name\}`、`\{bind_dn\}` 和 `\{base_dn\}` 子字符串与实际用户名、绑定 DN 和基本 DN 构建。请注意，特殊字符必须在 XML 中正确转义。                                                                                                      |

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

示例（典型的 Active Directory，配置了用户 DN 检测以方便进一步的角色映射）：

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

ClickHouse 企业版的许可密钥
## listen_backlog {#listen_backlog}

监听套接字的回放（挂起连接的队列大小）。默认值 `4096` 等于 linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)) 的值。

通常情况下，此值无需更改，因为：
- 默认值足够大,
- 为接受客户的连接，服务器有单独的线程。

因此，即使你的 `TcpExtListenOverflows`（来自 `nstat`）非零，并且该计数器在 ClickHouse 服务器上增加，这并不意味着需要增加该值，因为：
- 通常，如果 `4096` 不够，它显示了某些内部 ClickHouse 扩展问题，因此最好报告一个问题。
- 这并不意味着服务器可以处理更多的连接（即使可以，在那时客户也可能已经离开或断开连接）。

**示例**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host}

限制请求可以来自的主机。如果你希望服务器回答所有请求，请指定 `::`。

示例：

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port}

允许多个服务器监听相同的地址：端口。请求将由操作系统随机路由到一个服务器。启用此设置不推荐。

**示例**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

类型：

默认：
## listen_try {#listen_try}

如果在尝试监听时 IPv6 或 IPv4 网络不可用，服务器将不会退出。

**示例**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

<SettingsInfoBlock type="UInt64" default_value="50" />用于加载标记的后台池大小
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推送到预取池的任务数量
## logger {#logger}

日志消息的位置和格式。

**键**：

| 键                      | 描述                                                                                                                                                             |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | 日志级别。可接受的值：`none`（关闭日志），`fatal`、`critical`、`error`、`warning`、`notice`、`information`、`debug`、`trace`、`test`                      |
| `log`                  | 日志文件的路径。                                                                                                                                                 |
| `errorlog`             | 错误日志文件的路径。                                                                                                                                             |
| `size`                 | 旋转策略：日志文件最大大小（以字节为单位）。一旦日志文件大小超过此阈值，它将被重命名并归档，并创建一个新的日志文件。                                            |
| `count`                | 旋转策略：Clickhouse 最多保留多少历史日志文件。                                                                                                                  |
| `stream_compress`      | 使用 LZ4 压缩日志消息。设置为 `1` 或 `true` 以启用。                                                                                                          |
| `console`              | 启用控制台日志记录。设置为 `1` 或 `true` 以启用。如果 Clickhouse 不以守护进程模式运行，则默认为 `1`，否则为 `0`。                                                |
| `console_log_level`    | 控制台输出的日志级别。默认为 `level`。                                                                                                                             |
| `formatting.type`      | 控制台输出的日志格式。目前仅支持 `json`                                                                                                                            |
| `use_syslog`           | 也将日志输出转发到 syslog。                                                                                                                                     |
| `syslog_level`         | 发送到 syslog 的日志级别。                                                                                                                                      |
| `async`                | 当设置为 `true`（默认）时，日志将异步发生（每个输出通道一个后台线程）。否则，它将在调用 LOG 的线程内记录                                                         |
| `async_queue_max_size` | 使用异步日志时，等待刷新的最大消息数。额外消息将被丢弃                                                                                                        |
| `startup_level`        | 启动级别用于在服务器启动时设置根记录器级别。启动后，日志级别将恢复为 `level` 设置                                                                            |
| `shutdown_level`       | 关闭级别用于在服务器关闭时设置根记录器级别。                                                                                                                   |

**日志格式说明符**

`log` 和 `errorLog` 路径中的文件名支持以下格式说明符，用于生成的文件名（目录部分不支持它们）。

“示例” 列显示 `2023-07-06 18:32:07` 的输出。

| 说明符    | 描述                                                                                                   | 示例                    |
|-----------|--------------------------------------------------------------------------------------------------------|------------------------|
| `%%`      | 字面 %                                                                                                 | `%`                    |
| `%n`      | 新行字符                                                                                                |                        |
| `%t`      | 水平制表符                                                                                             |                        |
| `%Y`      | 四位数年份，以十进制数字表示，例如 2017                                                                | `2023`                 |
| `%y`      | 年份的最后两位数字，以十进制数字表示（范围 [00,99]）                                                  | `23`                   |
| `%C`      | 年份的前两位数字，以十进制数字表示（范围 [00,99]）                                                   | `20`                   |
| `%G`      | 四位数 [ISO 8601 周为基础的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。通常仅在与 `%V` 一起使用时有用 | `2023`                 |
| `%g`      | 年份的最后两位数字的 [ISO 8601 周为基准的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，即包含指定周的年份。                    | `23`                   |
| `%b`      | 缩写的月份名称，例如 Oct（与区域设定相关）                                                             | `Jul`                  |
| `%h`      | %b 的同义词                                                                                             | `Jul`                  |
| `%B`      | 完整的月份名称，例如 October（与区域设定有关）                                                        | `July`                 |
| `%m`      | 以十进制数字表示的月份（范围 [01,12]）                                                                | `07`                  |
| `%U`      | 以十进制数字表示的年份周（星期天是周的第一天）（范围 [00,53]）                                          | `27`                  |
| `%W`      | 以十进制数字表示的年份周（星期一是周的第一天）（范围 [00,53]）                                          | `27`                  |
| `%V`      | ISO 8601 周号（范围 [01,53]）                                                                           | `27`                  |
| `%j`      | 以十进制数字表示的年份中的天数（范围 [001,366]）                                                       | `187`                  |
| `%d`      | 以零填充的十进制数字表示的月份中的天数（范围 [01,31]）。单个数字前面填充零。                             | `06`                   |
| `%e`      | 以空格填充的十进制数字表示的月份中的天数（范围 [1,31]）。单个数字前面填充空格。                         | `&nbsp; 6`             |
| `%a`      | 缩写的星期几名称，例如 Fri（与区域设定相关）                                                           | `Thu`                  |
| `%A`      | 完整的星期几名称，例如 Friday（与区域设定相关）                                                       | `Thursday`             |
| `%w`      | 星期几作为整数，其中星期天为 0（范围 [0-6]）                                                           | `4`                    |
| `%u`      | 星期几作为十进制数字，其中星期一为 1（ISO 8601 格式）（范围 [1-7]）                                    | `4`                    |
| `%H`      | 以十进制数字表示的小时，24 小时制（范围 [00-23]）                                                      | `18`                   |
| `%I`      | 以十进制数字表示的小时，12 小时制（范围 [01,12]）                                                      | `06`                   |
| `%M`      | 以十进制数字表示的分钟（范围 [00,59]）                                                                | `32`                   |
| `%S`      | 以十进制数字表示的秒数（范围 [00,60]）                                                                | `07`                   |
| `%c`      | 标准日期和时间字符串，例如 Sun Oct 17 04:41:13 2010（与区域设定相关）                                   | `Thu Jul  6 18:32:07 2023` |
| `%x`      | 本地化日期表示（与区域设定相关）                                                                       | `07/06/23`             |
| `%X`      | 本地化时间表示，例如 18:40:20 或 6:40:20 PM（与区域设定相关）                                            | `18:32:07`             |
| `%D`      | 短格式 MM/DD/YY 日期，相当于 %m/%d/%y                                                                   | `07/06/23`             |
| `%F`      | 短格式 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                    | `2023-07-06`           |
| `%r`      | 本地化的 12 小时制时间（与区域设定相关）                                                                 | `06:32:07 PM`          |
| `%R`      | 等同于 "%H:%M"                                                                                           | `18:32`                |
| `%T`      | 等同于 "%H:%M:%S"（ISO 8601 时间格式）                                                                  | `18:32:07`             |
| `%p`      | 本地化的上午或下午标识（与区域设定相关）                                                                 | `PM`                   |
| `%z`      | ISO 8601 格式的 UTC 偏移（例如 -0430），或如果未提供时区信息则不显示字符                              | `+0800`                |
| `%Z`      | 与区域相关的时区名称或缩写，如果时区信息不可用则不显示字符                                            | `Z AWST`                |

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

要仅在控制台打印日志消息：

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**每级覆盖**

个别日志名称的日志级别可以被覆盖。例如，要静音所有 "Backup" 和 "RBAC" 日志记录器的消息。

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

| 键          | 描述                                                                                                                                                                                                                                                     |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`    | syslog 的地址，格式为 `host\[:port\]`。如果省略，则使用本地守护进程。                                                                                                                                                                               |
| `hostname`   | 发送日志的主机名称（可选）。                                                                                                                                                                                                                             |
| `facility`   | syslog [设施关键字](https://en.wikipedia.org/wiki/Syslog#Facility)。必须大写并以 "LOG_" 前缀开头，例如 `LOG_USER`、`LOG_DAEMON`、`LOG_LOCAL3` 等。如果指定了 `address`，默认值为 `LOG_USER`，否则为 `LOG_DAEMON`。                                                           |
| `format`     | 日志消息格式。可能的值：`bsd` 和 `syslog.`                                                                                                                                                                                                                |

**日志格式**

可以指定将在控制台日志中输出的日志格式。目前，仅支持 JSON。

**示例**

以下是 JSON 日志的输出示例：

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

**重命名 JSON 日志的键**

可以通过更改 `<names>` 标签内的标签值来修改键名称。例如，要将 `DATE_TIME` 改为 `MY_DATE_TIME`，可以使用 `<date_time>MY_DATE_TIME</date_time>`。

**省略 JSON 日志的键**

可以通过注释掉属性来省略日志属性。例如，如果不希望日志打印 `query_id`，可以注释掉 `<query_id>` 标签。
## macros {#macros}

用于复制表的参数替代。

如果不使用复制表，则可以省略。

有关更多信息，请参见 [创建复制表](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables) 部分。

**示例**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />标记缓存策略名称。
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

<SettingsInfoBlock type="Double" default_value="0.95" />在预热过程中填充标记缓存的总大小比例。
## mark_cache_size {#mark_cache_size}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
标记缓存的最大大小（`MergeTree`(/engines/table-engines/mergetree-family) 家族的索引）。

:::note
此设置可以在运行时修改，并将立即生效。
:::
## mark_cache_size_ratio {#mark_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />标记缓存中受保护队列的大小（在 SLRU 策略的情况下），相对于缓存的总大小。
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="64" />为启动时加载活动数据部分集（活动部分）所使用的线程数。
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

<SettingsInfoBlock type="UInt64" default_value="100" />
可以创建或修改为的用户的最大身份验证方法数。
更改此设置不会影响现有用户。如果超出此设置所指定的限制，将导致与身份验证相关的创建/修改查询失败。
非身份验证的创建/修改查询将成功。

:::note
值为 `0` 表示无限制。
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有备份的最大读取速度（以字节每秒计）。零表示无限制。
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="0" />如果备份 IO 线程池中 **闲置** 线程的数量超过 `max_backup_io_thread_pool_free_size`，ClickHouse 将释放被闲置线程占用的资源并减少池大小。如果需要，可以再次创建线程。
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
并发插入查询的总数限制。

:::note
值为 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::
## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />
并发执行查询的总数限制。请注意，`INSERT` 和 `SELECT` 查询的限制，以及用户的最大查询数也必须考虑。

另请参见：
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note
值为 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::
## max_concurrent_select_queries {#max_concurrent_select_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />
并发选择查询的总数限制。

:::note
值为 `0`（默认）表示无限制。

此设置可以在运行时修改，并将立即生效。已经在运行的查询将保持不变。
:::
## max_connections {#max_connections}

<SettingsInfoBlock type="Int32" default_value="4096" />最大服务器连接数。
## max_database_num_to_throw {#max_database_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />如果数据库数量大于此值，服务器将抛出异常。0 表示没有限制。
## max_database_num_to_warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果附加的数据库数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

<SettingsInfoBlock type="UInt32" default_value="1" />在 DatabaseReplicated 中进行副本恢复时创建表的线程数。零表示线程数等于核心数量。
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />
如果字典的数量超过此值，服务器将抛出异常。

仅统计数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 表示没有限制。
:::

**示例**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果附加的字典数量超过指定值，ClickHouse 服务器将向 `system.warnings` 表添加警告消息。

**示例**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器从分布式缓存读取的最大总速度（以字节每秒计）。零表示无限制。
## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />服务器向分布式缓存写入的最大总速度（以字节每秒计）。零表示无限制。
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

<SettingsInfoBlock type="UInt64" default_value="10000" />允许在聚合期间收集的哈希表统计信息的条目数量。
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />ALTER TABLE FETCH PARTITION 的线程数。
## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
保持在解析输入的线程池中等待的最大闲置线程数。
## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
用于解析输入的最大线程总数。
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果 IO 线程池中的 **闲置** 线程数超过 `max_io_thread_pool_free_size`，ClickHouse 将释放被闲置线程占用的资源并减少池的大小。如果必要，可以再次创建线程。
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse 使用 IO 线程池中的线程来执行一些 IO 操作（例如，与 S3 交互）。`max_io_thread_pool_size` 限制池中的最大线程数。
## max_keep_alive_requests {#max_keep_alive_requests} 

通过单个持久连接的最大请求数，直到 ClickHouse 服务器将其关闭。

**示例**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
本地读取的最大速度，以字节/秒为单位。

:::note
值为 `0` 意味着无限制。
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
本地写入的最大速度，以字节/秒为单位。

:::note
值为 `0` 意味着无限制。
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
附加到表的物化视图数量的限制。

:::note
这里只考虑直接依赖的视图，创建一个视图的基础上另一个视图不在此统计内。
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有合并操作的最大读取速度，以字节/秒为单位。零表示无限制。
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />服务器上所有变更操作的最大读取速度，以字节/秒为单位。零表示无限制。
## max_named_collection_num_to_throw {#max_named_collection_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果命名集合的数量超过此值，服务器将抛出异常。

:::note
值为 `0` 意味着没有限制。
:::

**示例**
```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```
## max_named_collection_num_to_warn {#max_named_collection_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果命名集合的数量超过指定的值，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```
## max_open_files {#max_open_files} 

打开文件的最大数量。

:::note
我们建议在 macOS 上使用此选项，因为 `getrlimit()` 函数返回的值不正确。
:::

**示例**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
考虑到丢弃连接的最大操作系统 CPU 等待 (OSCPUWaitMicroseconds 指标) 与繁忙 (OSCPUVirtualTimeMicroseconds 指标) 的比率。使用最小和最大比率之间的线性插值来计算概率，此时概率为 1。
有关更多详细信息，请参见 [在服务器 CPU 超载时控制行为](/operations/settings/server-overload)。
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />在启动时加载非活动数据部分（过时部分）的线程数。
## max_part_num_to_warn {#max_part_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="100000" />
如果活动部分的数量超过指定的值，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
删除分区的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 [`max_partition_size_to_drop`](#max_partition_size_to_drop) （以字节为单位），则无法使用 [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) 查询来删除分区。
此设置不要求重启 ClickHouse 服务器即可生效。另一种禁用限制的方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件。

:::note
值为 `0` 意味着可以不受任何限制地删除分区。

此限制不限制删除表和截断表，详见 [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**示例**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />用于并发移除非活动数据部分的线程数。
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
如果任何待处理的变更超过指定的秒数，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="500" />
如果待处理的变更数量超过指定的值，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```
## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果前缀反序列化线程池中的 **闲置** 线程数量超过 `max_prefixes_deserialization_thread_pool_free_size`，ClickHouse 将释放被闲置线程占用的资源并减少池的大小。如果必要，可以再次创建线程。
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse 使用来自前缀反序列化线程池的线程来并行读取 MergeTree 中的列和子列的文件前缀的元数据。`max_prefixes_deserialization_thread_pool_size` 限制池中的最大线程数量。
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
读取时通过网络的数据交换最大速度，以字节/秒为单位。

:::note
值为 `0`（默认）意味着没有限制。
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
写入时通过网络的数据交换最大速度，以字节/秒为单位。

:::note
值为 `0`（默认）意味着没有限制。
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />通过网络的数据交换最大速度，以字节/秒为单位用于复制抓取。零表示没有限制。
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />通过网络的数据交换最大速度，以字节/秒为单位用于复制发送。零表示没有限制。
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果复制表的数量超过此值，服务器将抛出异常。

仅计算数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 意味着没有限制。
:::

**示例**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```
## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />
服务器允许使用的最大内存量，以字节为单位。

:::note
服务器的最大内存消耗还受到 `max_server_memory_usage_to_ram_ratio` 设置的限制。
:::

作为特例，值为 `0`（默认）意味着服务器可以使用所有可用内存（不包括 `max_server_memory_usage_to_ram_ratio` 所施加的进一步限制）。
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
服务器允许使用的最大内存量，以相对于所有可用内存的比例表示。

例如，值为 `0.9`（默认）意味着服务器可以使用可用内存的 90%。

允许在低内存系统上降低内存使用量。
在 RAM 和交换空间较少的主机上，您可能需要将 [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) 设置为大于 1。

:::note
服务器的最大内存消耗还受到 `max_server_memory_usage` 设置的限制。
:::
## max_session_timeout {#max_session_timeout} 

最大会话超时，以秒为单位。

示例：

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果表的数量超过此值，服务器将抛出异常。

以下表不计入：
- view
- remote
- dictionary
- system

仅计算数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 意味着没有限制。
:::

**示例**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```
## max_table_num_to_warn {#max_table_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="5000" />
如果附加的表数量超过指定的值，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
删除表的限制。

如果 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的大小超过 `max_table_size_to_drop` （以字节为单位），则无法使用 [`DROP`](../../sql-reference/statements/drop.md) 查询或 [`TRUNCATE`](../../sql-reference/statements/truncate.md) 查询来删除它。

:::note
值为 `0` 意味着可以毫无限制地删除所有表。

此设置不要求重启 ClickHouse 服务器即可生效。另一种方法是创建 `<clickhouse-path>/flags/force_drop_table` 文件来禁用限制。
:::

**示例**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
可用于外部聚合、连接或排序的存储的最大量。
超过此限制的查询将失败并抛出异常。

:::note
值为 `0` 意味着无限制。
:::

另请参见：
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
如果全局线程池中的 **闲置** 线程数大于 [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size)，则 ClickHouse 将释放某些线程占用的资源，并减少池的大小。如果需要，可以再次创建线程。

**示例**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse 使用全局线程池中的线程来处理查询。如果没有闲置线程处理查询，则会在池中创建新线程。`max_thread_pool_size` 限制池中的最大线程数。

**示例**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />加载非活动数据部分（意外部分）时的线程数。
## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
如果视图的数量超过此值，服务器将抛出异常。

仅计算数据库引擎的表：
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
值为 `0` 意味着没有限制。
:::

**示例**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```
## max_view_num_to_warn {#max_view_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
如果附加的视图数量超过指定的值，ClickHouse 服务器将在 `system.warnings` 表中添加警告消息。

**示例**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
并发等待查询的总数限制。
在所需表异步加载时，等待查询的执行将被阻塞（见 [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)。

:::note
当检查以下设置控制的限制时，等待查询不被计入：

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

此修正是为了避免在服务器启动后立即达到这些限制。
:::

:::note

值为 `0`（默认）意味着没有限制。

此设置可以在运行时进行修改，并会立即生效。已运行的查询将保持不变。
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
后台内存工作线程是否应该根据来自外部源（如 jemalloc 和 cgroups）的信息来校正内部内存跟踪器。
## memory_worker_period_ms {#memory_worker_period_ms} 

校正内存使用情况并在更高内存使用期间清理未使用页面的后台内存工作线程的滴答周期。如果设置为 0，将根据内存使用源使用默认值。
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

使用当前 cgroup 内存使用信息来校正内存跟踪。
## merge_tree {#merge_tree} 

用于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的精细调优。

有关更多信息，请参阅 MergeTreeSettings.h 头文件。

**示例**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
用于调节合并和其他工作负载之间资源的利用和共享。指定的值作为所有后台合并的 `workload` 设置值。可以被合并树设置覆盖。

**另请参阅**
- [Workload Scheduling](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
设置用于执行合并和变更操作的最大内存限制。
如果 ClickHouse 达到设定的限制，将不会调度任何新的后台合并或变更操作，但会继续执行已调度的任务。

:::note
值为 `0` 意味着无限制。
:::

**示例**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
默认的 `merges_mutations_memory_usage_soft_limit` 值计算为 `memory_amount * merges_mutations_memory_usage_to_ram_ratio`。

**另请参阅:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

默认禁用。

**启用**

要手动启用指标历史收集 [`system.metric_log`](../../operations/system-tables/metric_log.md)，请创建 `/etc/clickhouse-server/config.d/metric_log.xml`，内容如下：

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
考虑丢弃连接的操作系统 CPU 等待 (OSCPUWaitMicroseconds 指标) 和繁忙 (OSCPUVirtualTimeMicroseconds 指标) 时间的最小比率。使用最小和最大比率之间的线性插值来计算概率，此时概率为 0。
有关更多详细信息，请参见 [在服务器 CPU 超载时控制行为](/operations/settings/server-overload)。
## mlock_executable {#mlock_executable} 

在启动后执行 `mlockall` 以降低首次查询延迟，并防止在高 IO 负载下将 ClickHouse 可执行文件分页出。

:::note
建议启用此选项，但将导致启动时间增加最多几秒。
请注意，此设置在没有 "CAP_IPC_LOCK" 能力时无法工作。
:::

**示例**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
该设置有助于避免频繁的打开/关闭调用（由于后续的缺页错误而极其耗时），并重用来自多个线程和查询的映射。设置值是映射区域的数量（通常等于映射文件的数量）。

可以在以下系统表中监控映射文件中的数据量，并获取以下指标：

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` 在 [`system.metrics`](/operations/system-tables/metrics)，[`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` 在 [`system.events`](/operations/system-tables/events)，[`system.processes`](/operations/system-tables/processes)，[`system.query_log`](/operations/system-tables/query_log)，[`system.query_thread_log`](/operations/system-tables/query_thread_log)，[`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
映射文件中的数据量不会直接消耗内存且不会计入查询或服务器内存使用情况，因为这块内存可以像操作系统页面缓存那样被丢弃。该缓存会在 MergeTree 表中删除旧部分时自动丢弃（文件关闭），也可以通过 `SYSTEM DROP MMAP CACHE` 查询手动丢弃。

此设置可以在运行时进行修改，并会立即生效。
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
用于调节变更和其他工作负载之间资源的利用和共享。指定的值作为所有后台变更的 `workload` 设置值。可以被合并树设置覆盖。

**另请参阅**
- [Workload Scheduling](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

使用 MySQL 协议与客户端进行通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用与客户端通过 MySQL 协议的通信。
:::

**示例**

```xml
<mysql_port>9004</mysql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport} 

如果设置为 true，则需要与客户端通过 [mysql_port](#mysql_port) 进行安全通信。连接选项 `--ssl-mode=none` 将被拒绝。与 [OpenSSL](#openssl) 设置一起使用。
## openSSL {#openssl} 

SSL客户端/服务器配置。

支持SSL的是`libpoco`库。可用的配置选项在[SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h)中进行了解释。默认值可以在[SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp)中找到。

服务器/客户端设置的密钥：

| 选项                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 默认值                                     |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | 包含PEM证书的秘密密钥的文件路径。该文件可以同时包含密钥和证书。                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | 客户端/服务器证书文件的PEM格式路径。如果`privateKeyFile`中包含证书，则可以省略此项。                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | 包含受信任CA证书的文件或目录路径。如果指向一个文件，则该文件必须是PEM格式，并可以包含多个CA证书。如果指向一个目录，则必须包含每个CA证书的一个.pem文件。文件名通过CA主体名称哈希值查找。详细信息可以在[SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html)的手册页中找到。 |                                            |
| `verificationMode`            | 检查节点证书的方法。详细信息在[Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h)类的描述中。可能的值：`none`、`relaxed`、`strict`、`once`。                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | 验证链的最大长度。如果证书链长度超过设定值，验证将失败。                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | 是否使用OpenSSL的内置CA证书。ClickHouse假设内置CA证书在文件`/etc/ssl/cert.pem`（或目录`/etc/ssl/certs`）中，或者在环境变量`SSL_CERT_FILE`（或`SSL_CERT_DIR`）指定的文件（或目录）中。                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | 支持的OpenSSL加密方式。                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | 启用或禁用会话缓存。必须与`sessionIdContext`结合使用。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | 服务器附加到每个生成标识符的唯一随机字符集。字符串长度不得超过`SSL_MAX_SSL_SESSION_ID_LENGTH`。此参数始终建议使用，因为它有助于避免服务器缓存会话和客户端请求缓存时出现的问题。                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | 服务器缓存的最大会话数。值为`0`表示无限会话。                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | 在服务器上缓存会话的时间（小时）。                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | 如果启用，验证证书的CN或SAN是否与对等主机名匹配。                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | 要求连接使用TLSv1。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | 要求连接使用TLSv1.1。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | 要求连接使用TLSv1.2。可接受的值：`true`、`false`。                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | 激活OpenSSL FIPS模式。如果库的OpenSSL版本支持FIPS，则受支持。                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | 请求访问私钥的密码的类（PrivateKeyPassphraseHandler子类）。例如：`<privateKeyPassphraseHandler>`、`<name>KeyFileHandler</name>`、`<options><password>test</password></options>`、`</privateKeyPassphraseHandler>`。                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | 用于验证无效证书的类（CertificateHandler的子类）。例如：`<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`。                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | 不允许使用的协议。                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | 客户端偏好的服务器加密方式。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
## opentelemetry_span_log {#opentelemetry_span_log} 

[`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md)系统表的设置。

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />考虑CPU在执行有用工作时，OS CPU繁忙时间（OSCPUVirtualTimeMicroseconds指标）的阈值，如果繁忙时间低于该值则不考虑CPU过载。
## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />分布式缓存TCP处理器的线程的Linux优先级值。较低的值意味着更高的CPU优先级。

需要CAP_SYS_NICE能力，否则无效。

可能值：-20至19。
## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />合并和变异线程的Linux优先级值。较低的值意味着更高的CPU优先级。

需要CAP_SYS_NICE能力，否则无效。

可能值：-20至19。
## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />ZooKeeper客户端中发送和接收线程的Linux优先级值。较低的值意味着更高的CPU优先级。

需要CAP_SYS_NICE能力，否则无效。

可能值：-20至19。
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />从用户空间页面缓存保持空闲的内存限制的比例。类似于Linux的min_free_kbytes设置。
## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />释放的内存可供用户空间页面缓存使用的延迟。
## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />用户空间页面缓存的最大大小。设置为0禁用缓存。如果大于page_cache_min_size，缓存大小将在此范围内连续调整，以使用大部分可用内存，同时保持总内存使用低于限制（max_server_memory_usage[_to_ram_ratio]）。
## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />用户空间页面缓存的最小大小。
## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />用户空间页面缓存策略的名称。
## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />在多个分片上划分用户空间页面缓存以减少互斥锁争用。实验性，可能不会提高性能。
## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />用户空间页面缓存中被保护队列的大小相对于缓存的总大小。
## part_log {#part_log} 

与[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)相关的事件的日志记录。例如，添加或合并数据。您可以使用日志模拟合并算法并比较其特性。您可以可视化合并过程。

查询记录在[system.part_log](/operations/system-tables/part_log)表中，而不是在单独的文件中。您可以在`table`参数中配置此表的名称（见下文）。

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

<SettingsInfoBlock type="UInt64" default_value="30" />完全移除SharedMergeTree部件的周期。仅在ClickHouse Cloud中可用。
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />为kill_delay_period添加均匀分布的值，范围从0到x秒，以避免雷电集群效应，并且在表数量非常大时避免ZooKeeper的后续拒绝服务。仅在ClickHouse Cloud中可用。
## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />用于清理过期共享合并树线程的线程。仅在ClickHouse Cloud中可用。
## path {#path} 

包含数据的目录的路径。

:::note
尾随斜杠是必需的。
:::

**示例**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

通过PostgreSQL协议与客户端通信的端口。

:::note
- 正整数指定要监听的端口号
- 空值用于禁用通过PostgreSQL协议与客户端的通信。
:::

**示例**

```xml
<postgresql_port>9005</postgresql_port>
```
## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

如果设置为true，则要求客户端通过[postgresql_port](#postgresql_port)进行安全通信。将拒绝使用选项`sslmode=disable`的连接。与[OpenSSL](#openssl)设置一起使用。
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />远程对象存储的预获取的后台池的大小。
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推送到预获取池的任务数量。
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
可以在前缀反序列化线程池上调度的最大作业数量。

:::note
值为`0`表示无限制。
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
如果为true，ClickHouse将在启动前创建所有配置的`system.*_log`表。如果一些启动脚本依赖于这些表，这可能会很有帮助。
## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />主索引缓存策略名称。
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />在预热期间填充的标记缓存的总大小比例。
## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />用于主索引的缓存的最大大小（MergeTree系列表的索引）。
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />主索引缓存中被保护队列的大小（在使用SLRU策略的情况下）相对于缓存的总大小。
## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
此设置允许读取QueryPlan数据包。该数据包在启用了serialize_query_plan时为分布式查询发送。
默认情况下禁用，以避免由查询计划二进制反序列化中的错误可能引发的安全问题。

**示例**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
## processors_profile_log {#processors_profile_log} 

[`processors_profile_log`](../system-tables/processors_profile_log.md)系统表的设置。

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

暴露指标数据以便从[Prometheus](https://prometheus.io)抓取。

设置：

- `endpoint` – Prometheus服务器抓取指标的HTTP端点。以'/'开头。
- `port` – `endpoint`的端口。
- `metrics` – 暴露来自[system.metrics](/operations/system-tables/metrics)表的指标。
- `events` – 暴露来自[system.events](/operations/system-tables/events)表的指标。
- `asynchronous_metrics` – 暴露来自[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)表的当前指标值。
- `errors` - 暴露自上次服务器重启以来发生的错误数量以及错误代码。此信息也可以从[system.errors](/operations/system-tables/errors)中获得。

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

检查（将`127.0.0.1`替换为您的ClickHouse服务器的IP地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```
## proxy {#proxy} 

为HTTP和HTTPS请求定义代理服务器，目前由S3存储、S3表函数和URL函数支持。

有三种方法可以定义代理服务器：
- 环境变量
- 代理列表
- 远程代理解析器。

支持使用`no_proxy`绕过特定主机的代理服务器。

**环境变量**

`http_proxy`和`https_proxy`环境变量允许您为给定协议指定代理服务器。如果您在系统中设置了它，它应该能够无缝工作。

这是最简单的方法，如果给定协议仅有一个代理服务器且该代理服务器不会变化。

**代理列表**

这种方法允许您为一个协议指定一个或多个代理服务器。如果定义了多个代理服务器，ClickHouse将在轮询的基础上使用不同的代理，以在服务器之间均衡负载。如果一个协议有多个代理服务器且代理服务器列表不变，这是一种最简单的方法。

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
在下面的选项卡中选择父字段以查看其子级：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段     | 描述                             |
|-----------|----------------------------------|
| `<http>`  | 一个或多个HTTP代理的列表        |
| `<https>` | 一个或多个HTTPS代理的列表       |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段   | 描述          |
|---------|----------------------|
| `<uri>` | 代理的URI         |

  </TabItem>
</Tabs>

**远程代理解析器**

代理服务器可能会动态更改。在这种情况下，您可以定义解析器的端点。ClickHouse向该端点发送一个空的GET请求，远程解析器应该返回代理主机。ClickHouse将使用以下模板形成代理URI：`\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

在下面的选项卡中选择父字段以查看其子级：

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| 字段    | 描述                       |
|----------|---------------------------|
| `<http>` | 一个或多个解析器的列表*   |
| `<https>` | 一个或多个解析器的列表*   |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| 字段       | 描述                                   |
|-------------|---------------------------------------|
| `<resolver>` | 解析器的端点及其他详细信息           |

:::note
您可以有多个`<resolver>`元素，但只使用给定协议的第一个`<resolver>`。该协议的任何其他`<resolver>`元素将被忽略。这意味着负载均衡（如有需要）应由远程解析器实现。
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| 字段               | 描述                                                                                                                                                                            |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | 代理解析器的URI                                                                                                                                                          |
| `<proxy_scheme>`    | 最终代理URI的协议。可以是`http`或`https`。                                                                                                                             |
| `<proxy_port>`      | 代理解析器的端口号                                                                                                                                                     |
| `<proxy_cache_time>` | 解析器返回的值应被ClickHouse缓存的时间（以秒为单位）。将此值设置为`0`将导致ClickHouse在每次HTTP或HTTPS请求时都与解析器联系。 |

  </TabItem>
</Tabs>

**优先级**

代理设置按以下顺序确定：

| 顺序 | 设置                |
|-------|--------------------|
| 1.    | 远程代理解析器     |
| 2.    | 代理列表            |
| 3.    | 环境变量          |

ClickHouse将检查请求协议的最高优先级解析器类型。如果未定义，它将检查下一个最高优先级的解析器类型，直到达到环境解析器。这也允许使用解析器类型的混合。

## query_cache {#query_cache} 

[查询缓存](../query-cache.md)配置。

可用的设置：

| 设置                     | 描述                                                                            | 默认值       |
|---------------------------|--------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | 最大缓存大小（字节）。`0`表示查询缓存被禁用。                                  | `1073741824`  |
| `max_entries`             | 缓存中存储的`SELECT`查询结果的最大数量。                                      | `1024`        |
| `max_entry_size_in_bytes` | 要保存到缓存中的`SELECT`查询结果的最大大小（字节）。                        | `1048576`     |
| `max_entry_size_in_rows`  | 要保存到缓存中的`SELECT`查询结果的最大行数。                                 | `30000000`    |

:::note
- 更改的设置立即生效。
- 查询缓存的数据在DRAM中分配。如果内存稀缺，请确保为`max_size_in_bytes`设置较小的值或完全禁用查询缓存。
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
此设置可以在运行时修改并会立即生效。
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />查询条件缓存中被保护队列的大小（在使用SLRU策略的情况下）相对于缓存的总大小。
## query_log {#query_log} 

用于记录通过[log_queries=1](../../operations/settings/settings.md)设置接收到的查询。

查询记录在[system.query_log](/operations/system-tables/query_log)表中，而不是在单独的文件中。您可以在`table`参数中更改此表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse将创建它。如果在ClickHouse服务器更新时查询日志的结构发生变化，旧结构的表将被重命名，并自动创建新表。

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

基于正则表达式的规则，这些规则将在将查询和所有日志消息存储在服务器日志中之前应用，包括
[`system.query_log`](/operations/system-tables/query_log)、[`system.text_log`](/operations/system-tables/text_log)、[`system.processes`](/operations/system-tables/processes)表和发送到客户端的日志。这允许防止
SQL查询中的敏感数据泄漏，例如姓名、电子邮件、个人标识符或信用卡号码。

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

| 设置       | 描述                                                                       |
|-----------|---------------------------------------------------------------------------|
| `name`    | 规则的名称（可选）                                                       |
| `regexp`  | 兼容RE2的正则表达式（强制）                                             |
| `replace` | 敏感数据的替代字符串（可选，默认 - 六个星号）                       |

掩码规则应用于整个查询（以防止敏感数据从格式错误/不可解析的查询中泄漏）。

[`system.events`](/operations/system-tables/events)表具有计数器`QueryMaskingRulesMatch`，它的值是查询掩码规则匹配的总数。

对于分布式查询，每个服务器都必须单独配置，否则，传递给其他节点的子查询将被存储而不进行掩码。

## query_metric_log {#query_metric_log} 

默认情况下禁用。

**启用**

要手动打开[`system.query_metric_log`](../../operations/system-tables/query_metric_log.md)的度量历史记录收集，请创建`/etc/clickhouse-server/config.d/query_metric_log.xml`，并包含以下内容：

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

若要禁用`query_metric_log`设置，您应创建以下文件`/etc/clickhouse-server/config.d/disable_query_metric_log.xml`，并包含以下内容：

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

用于记录通过[log_query_threads=1](/operations/settings/settings#log_query_threads)设置接收到的查询线程的设置。

查询记录在[system.query_thread_log](/operations/system-tables/query_thread_log)表中，而不是在单独的文件中。您可以在`table`参数中更改此表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse将创建它。如果在ClickHouse服务器更新时查询线程日志的结构发生变化，旧结构的表将被重命名，并自动创建新表。

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

用于记录视图（实时的、物化的等）的设置，依赖于接收到的 [log_query_views=1](/operations/settings/settings#log_query_views) 设置。

查询记录在 [system.query_views_log](/operations/system-tables/query_views_log) 表中，而不是在单独的文件中。您可以通过 `table` 参数更改表的名称（见下文）。

<SystemLogParameters/>

如果表不存在，ClickHouse 将创建它。如果查询视图日志的结构在更新 ClickHouse 服务器时发生了变化，则旧结构的表会被重命名，并自动创建一个新表。

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

用于重新分配内存以处理机器代码（“文本”）的设置，使用大页。

:::note
此功能高度实验性。
:::

示例：

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers} 

用于配置 [Distributed](../../engines/table-engines/special/distributed.md) 表引擎和 `cluster` 表函数使用的集群。

**示例**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

有关 `incl` 属性的值，请参见 “[配置文件](/operations/configuration-files)” 部分。

**另见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts} 

允许在与 URL 相关的存储引擎和表函数中使用的主机列表。

通过 `\<host\>` XML 标签添加主机时：
- 必须完全按照 URL 中的格式指定，因为名称在 DNS 解析前会被检查。例如：`<host>clickhouse.com</host>`
- 如果在 URL 中明确指定了端口，则整个 host:port 会被检查。例如：`<host>clickhouse.com:80</host>`
- 如果不带端口指定主机，则允许该主机的任何端口。例如：如果指定 `<host>clickhouse.com</host>`，则 `clickhouse.com:20`（FTP）、`clickhouse.com:80`（HTTP）、`clickhouse.com:443`（HTTPS）等都是允许的。
- 如果主机指定为 IP 地址，则根据 URL 中指定的格式进行检查。例如：`[2a02:6b8:a::a]`。
- 如果存在重定向并且启用了对重定向的支持，则检查每个重定向（位置字段）。

例如：

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

数据库 Replicated 的副本组名称。

由 Replicated 数据库创建的集群将由同一组中的副本组成。
DDL 查询只会等待同一组中的副本。

默认情况下为空。

**示例**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />获取分区请求的 HTTP 连接超时。 如果未明确设置，则继承自默认配置文件 `http_connection_timeout`。
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />获取分区请求的 HTTP 接收超时。 如果未明确设置，则继承自默认配置文件 `http_receive_timeout`。
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />获取分区请求的 HTTP 发送超时。 如果未明确设置，则继承自默认配置文件 `http_send_timeout`。
## replicated_merge_tree {#replicated_merge_tree} 

[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 中表的微调设置。 此设置具有更高的优先级。

有关更多信息，请参见 MergeTreeSettings.h 头文件。

**示例**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />执行 RESTORE 请求的最大线程数量。
## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />允许的 S3 重定向跳数的最大数量。
## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="100" />Aws::Client::RetryStrategy 的设置，Aws::Client 会自己重试，0 意味着不重试。
## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />即使表已创建并且附加了物化视图，也禁用 S3Queue 中的流处理。
## s3queue_log {#s3queue_log} 

`s3queue_log` 系统表的设置。

<SystemLogParameters/>

默认设置为：

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

在生产前环境中启用此功能非常重要。

键：

| 键                     | 描述                                                                                                                          |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `enabled`              | 启用此功能的布尔标志，默认为 `true`。设置为 `false` 以避免发送崩溃报告。                                                       |
| `send_logical_errors`  | `LOGICAL_ERROR` 类似于 `assert`，是 ClickHouse 中的一个错误。此布尔标志启用发送该异常（默认：`true`）。                |
| `endpoint`             | 可以覆盖发送崩溃报告的端点 URL。                                                                                             |

**推荐用法**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
Keeper 中的路径，带有由 `generateSerialID` 函数生成的自增编号。每个序列将是该路径下的一个节点。
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />如果设置为 true，将在堆栈跟踪中显示地址。
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />如果设置为 true，ClickHouse 将在关闭之前等待正在运行的备份和恢复完成。
## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />等待未完成查询的延迟（以秒为单位）。
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />如果设置为 true，ClickHouse 将在关闭之前等待正在运行的查询完成。
## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />跳过 ClickHouse 二进制校验和完整性检查。
## ssh_server {#ssh_server} 

主机密钥的公钥部分将写入 SSH 客户端侧的 known_hosts 文件中，首次连接时。

主机密钥配置默认情况下是非活动的。
取消注释主机密钥配置，并提供相应 SSH 密钥的路径以激活它们：

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

允许多磁盘存储配置。

存储配置遵循以下结构：

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
### Configuration of disks {#configuration-of-disks}

`disks` 的配置遵循下列结构：

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

| 设置                   | 描述                                                                                           |
|------------------------|------------------------------------------------------------------------------------------------|
| `<disk_name_N>`        | 磁盘的名称，应该是唯一的。                                                                     |
| `path`                 | 服务器数据将存储的路径（`data` 和 `shadow` 目录）。应该以 `/` 结尾。                      |
| `keep_free_space_bytes`| 保留磁盘上的空闲空间大小。                                                                     |

:::note
磁盘的顺序无关紧要。
:::
### Configuration of policies {#configuration-of-policies}

上述子标签为 `policies` 定义了以下设置：

| 设置                       | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`            | 策略名称。策略名称必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`            | 卷名称。卷名称必须是唯一的。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                     | 位于卷内的磁盘。                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes` | 该卷中任何磁盘上可以存在的数据块的最大大小。如果合并结果的块大小预期大于 `max_data_part_size_bytes`，则该块将写入下一个卷。基本上，此功能允许您在热（SSD）卷上存储新的/小块，然后在它们达到较大尺寸时将它们移动到冷（HDD）卷。如果策略只有一个卷，则请勿使用此选项。                                                                                                           |
| `move_factor`              | 卷上可用的空闲空间的份额。如果空间减少，数据将开始转移到下一个卷（如果有）。在传输中，块根据大小从大到小（降序）排序，并选择总大小足以满足 `move_factor` 条件的块，如果所有块的总大小不足，则所有块将被移动。                                                                                                             |
| `perform_ttl_move_on_insert` | 禁用在插入时移动过期 TTL 的数据。默认情况下（如果启用），如果我们插入的数据已根据生存时间移动规则过期，则它会立即移动到指定的卷/磁盘。如果目标卷/磁盘较慢（例如 S3），则这会显著减慢插入速度。如果禁用，过期数据部分将写入默认卷，然后立即移动到指定的过期 TTL 的规则中。 |
| `load_balancing`             | 磁盘平衡策略，`round_robin` 或 `least_used`。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | 设置超时（以毫秒为单位），以更新所有磁盘的可用空间（`0` - 始终更新，`-1` - 从不更新，默认值为 `60000`）。注意，如果仅通过 ClickHouse 使用磁盘，并且不会受到文件系统动态调整的影响，则可以使用 `-1` 值。在所有其他情况下，这不推荐使用，因为最终会导致空间分配不正确。                                                                                                                   |
| `prefer_not_to_merge`        | 禁用在该卷上合并数据块的功能。注意：这可能会导致性能下降并造成问题。当启用此设置时（请勿启用此项），会禁止在该卷上合并数据（这不好）。这可以控制 ClickHouse 如何与慢速磁盘交互。我们推荐根本不使用此设置。                                                                                                                                                                                               |
| `volume_priority`            | 定义填充卷的优先级（顺序）。值越小，优先级越高。参数值必须是自然数并覆盖从 1 到 N（N 是指定的最大参数值）之间的范围，且无缺口。                                                                                                                                                                                                                                                                                                                                                                                                |

对于 `volume_priority`：
- 如果所有卷都有此参数，则按指定顺序进行优先级排序。
- 如果只有 _某些_ 卷有此参数，则没有该参数的卷的优先级最低。具有此参数的卷根据标签值进行优先排序，其余的优先级则根据配置文件中相对描述的顺序确定。
- 如果 _没有_ 卷提供此参数，则其顺序由配置文件中的描述顺序决定。
- 卷的优先级可能不相同。
## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />超出此限制的连接的存活时间显著缩短。该限制适用于存储连接。
## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />超出此限制的连接在使用后会重置。设置为 0 禁用连接缓存。该限制适用于存储连接。
## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />如果使用中的连接数量高于此限制，会将警告消息写入日志。该限制适用于存储连接。
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />以 VERSION_FULL_OBJECT_KEY 格式写入磁盘元数据文件。默认启用。此设置已弃用。
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />如果启用，则在创建 SharedSet 和 SharedJoin 时生成内部 UUID。仅适用于 ClickHouse Cloud。
## table_engines_require_grant {#table_engines_require_grant} 

如果设置为 true，则用户需要获得授权才能创建具有特定引擎的表，例如 `GRANT TABLE ENGINE ON TinyLog to user`。

:::note
默认情况下，为了向后兼容，创建带有特定表引擎的表会忽略授权，但您可以通过将此设置为 true 来改变此行为。
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
设置在后台池中执行异步加载作业的线程数量。后台池用于在服务器启动后异步加载表，当没有查询等待该表时。如果表的数量很多，保持后台池中的线程数量较低将是有利的。这样可以为并发查询执行保留 CPU 资源。

:::note
值为 `0` 意味着将使用所有可用 CPU。
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
设置在前台池中执行加载作业的线程数量。前台池用于在服务器开始监听端口之前同步加载表以及加载需要等待的表。前台池的优先级高于后台池。这意味着在前台池中有作业运行时，后台池中不会开始作业。

:::note
值为 `0` 意味着将使用所有可用 CPU。
:::
## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />每个 TCP 连接允许的最大查询数量，在此之后关闭连接。设置为 0 以允许无限制查询。
## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />TCP 连接的最大生存时间（以秒为单位），在此之后关闭连接。设置为 0 以允许无限制连接生存时间。
## tcp_port {#tcp_port} 

用于通过 TCP 协议与客户端通信的端口。

**示例**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure} 

用于与客户端安全通信的 TCP 端口。与 [OpenSSL](#openssl) 设置一起使用。

**默认值**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port} 

SSH 服务器的端口，允许用户连接并通过嵌入式客户端以交互方式执行查询。

示例：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache} 

使用此选项，临时数据将存储在特定磁盘的缓存中。
在此部分，您应该指定类型为 `cache` 的磁盘名称。
在这种情况下，缓存和临时数据将共享同一空间，并且磁盘缓存可以被驱逐以创建临时数据。

:::note
只能使用一个选项来配置临时数据存储：`tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
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
## temporary_data_in_distributed_cache {#temporary_data_in_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />在分布式缓存中存储临时数据。
## text_log {#text_log} 

用于记录文本消息的 [text_log](/operations/system-tables/text_log) 系统表设置。

<SystemLogParameters/>

此外：

| 设置   | 描述                                                                                                                                                                                                 | 默认值         |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `level`| 最大消息级别（默认 `Trace`），将被存储在表中。                                                                                                                                                      | `Trace`        |

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
全局线程池中可以调度的最大作业数量。增加队列大小会导致更高的内存使用。建议将此值设置为 [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size)。

:::note
值为 `0` 意味着无限制。
:::

**示例**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />在 `local_filesystem_read_method = 'pread_threadpool'` 时，从本地文件系统读取的线程池中的线程数量。
## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以在本地文件系统读取线程池中调度的最大作业数量。
## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />在 `remote_filesystem_read_method = 'threadpool'` 时，从远程文件系统读取的线程池中线程数量。
## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以在远程文件系统读取线程池中调度的最大作业数量。
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />写入请求到对象存储的后台池大小。
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />可以推入对象存储的写请求后台池的任务数。
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
定义访问设置为 'workload' 的未知工作负载时的行为。

- 如果 `true`，将从尝试访问未知工作负载的查询中抛出 RESOURCE_ACCESS_DENIED 异常。对所有在建立 WORKLOAD 层次结构并包含 WORKLOAD 默认后，强制执行资源调度十分有用。
- 如果 `false`（默认），提供对未定义工作负载的查询无限制访问，而不进行资源调度。这在设置 WORKLOAD 层次结构，以便在添加 WORKLOAD 默认之前是重要的。

**示例**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**另见**
- [工作负载调度](/operations/workload-scheduling.md)
## timezone {#timezone} 

服务器的时区。

指定为 IANA 的 UTC 时区或地理位置标识符（例如，Africa/Abidjan）。

时区在将字符串和 DateTime 格式之间转换时是必需的，当 DateTime 字段以文本格式（在屏幕上或文件中打印）输出，并且在从字符串获取 DateTime 时。此外，当未在输入参数中接收时，时区在使用时间和日期的函数中使用。

**示例**

```xml
<timezone>Asia/Istanbul</timezone>
```

**另见**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

在本地文件系统上存储临时数据的路径，以用于处理大查询。

:::note
- 只能使用一个选项来配置临时数据存储：`tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- 尾部斜杠是强制性的。
:::

**示例**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 


用于存储临时数据的策略。所有以 `tmp` 前缀的文件将在启动时被删除。

:::note
对将对象存储用作 `tmp_policy` 的建议：
- 在每个服务器上使用单独的 `bucket:path`
- 使用 `metadata_type=plain`
- 您可能还希望为此存储桶设置 TTL
:::

:::note
- 只能使用一个选项来配置临时数据存储：`tmp_path`，`tmp_policy`，`temporary_data_in_cache`。
- `move_factor`、`keep_free_space_bytes`、`max_data_part_size_bytes` 被忽略。
- 策略应该正好有 *一个卷*。

有关更多信息，请参见 [MergeTree 表引擎](/engines/table-engines/mergetree-family/mergetree) 文档。
:::

**示例**

当 `/disk1` 已满时，临时数据将存储在 `/disk2` 中。

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

定义要添加的自定义顶级域名的列表，其中每个条目的格式为 `<name>/path/to/file</name>`。

例如：

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

另见：
- 函数 [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) 及其变体，
  接受自定义 TLD 列表名称，返回包含顶级子域的域名部分，直到第一个显著子域。
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />收集大小小于或等于指定值的随机分配，概率等于 `total_memory_profiler_sample_probability`。值为 0 时禁用。您可能希望将 'max_untracked_memory' 设置为 0，使此阈值按预期工作。
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />收集大小大于或等于指定值的随机分配，概率等于 `total_memory_profiler_sample_probability`。值为 0 时禁用。您可能希望将 'max_untracked_memory' 设置为 0，使此阈值按预期工作。
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />每当服务器内存使用量大于每个字节数的下一个步骤时，内存分析器将收集分配堆栈跟踪。零表示禁用内存分析器。值低于几兆字节将减慢服务器。
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
允许收集随机分配和去分配，并将其写入 [system.trace_log](../../operations/system-tables/trace_log.md) 系统表，`trace_type` 等于 `MemorySample` ，其指定的概率。概率适用于每个分配或去分配，而不考虑分配的大小。请注意，采样仅在未跟踪的内存量超过未跟踪内存限制时发生（默认值为 `4` MiB）。如果 [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) 降低，则可以降低该值。您可以将其设置为 `total_memory_profiler_step` 为 `1` 以进行额外细致的采样。

可能的值：

- 正的双精度。
- `0` — 禁用在 `system.trace_log` 系统表中写入随机分配和去分配。
## trace_log {#trace_log} 

用于 [trace_log](/operations/system-tables/trace_log) 系统表操作的设置。

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
MergeTree 家族表引擎使用的未压缩数据的最大大小（以字节为单位）。

服务器共享一个缓存。根据需求进行内存分配。启用 `use_uncompressed_cache` 选项时，将使用该缓存。

未压缩缓存在单个情况下对非常短的查询是有利的。

:::note
值为 `0` 意味着禁用。

此设置可以在运行时修改，并会立即生效。
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />未压缩缓存中保护队列的大小（在 SLRU 策略下）相对于缓存的总大小。
## url_scheme_mappers {#url_scheme_mappers} 

用于将缩短的或符号的 URL 前缀转换为完整 URL 的配置。

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

在 ZooKeeper 中存储数据部分头的方式。此设置仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family) 系列。可以全局指定：

**全面应用于 `config.xml` 文件的 [merge_tree](#merge_tree) 部分**

ClickHouse 为服务器上的所有表使用该设置。您可以随时更改该设置。当设置发生变化时，现有表的行为也会发生变化。

**适用于每个表**

创建表时，指定相应的 [引擎设置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。现有表的行为不会因此设置而改变，即使全局设置发生变化。

**可能的值**

- `0` — 功能已关闭。
- `1` — 功能已开启。

如果 [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper)，则 [replicated](../../engines/table-engines/mergetree-family/replication.md) 表将通过使用单个 `znode` 紧凑地存储数据部分的头。如果表包含许多列，此存储方法显著减少存储在 ZooKeeper 中的数据量。

:::note
应用 `use_minimalistic_part_header_in_zookeeper = 1` 后，您无法将 ClickHouse 服务器降级到不支持此设置的版本。在集群的服务器上升级 ClickHouse 时需谨慎。请勿一次性升级所有服务器。建议在测试环境或者仅在集群的几台服务器上测试新版本的 ClickHouse。

已使用此设置存储的数据部分头不能恢复到以前的（非紧凑）表示形式。
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

可执行用户定义函数的配置文件路径。

路径：

- 指定绝对路径或相对于服务器配置文件的路径。
- 路径可以包含通配符 * 和 ?。

另见：
- "[可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。"

**示例**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

用户定义文件的目录。用于 SQL 用户定义函数 [SQL 用户定义函数](/sql-reference/functions/udf)。

**示例**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

包含以下设置的配置文件部分：
- 预定义用户的配置文件路径。
- 存储由 SQL 命令创建的用户的文件夹路径。
- 存储和复制由 SQL 命令创建的用户的 ZooKeeper 节点路径（实验性）。

如果指定了此部分，则将不使用 [users_config](/operations/server-configuration-parameters/settings#users_config) 和 [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) 中的路径。

`user_directories` 部分可以包含任意数量的项目，项目的顺序表示它们的优先级（项目越高，优先级越高）。

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

用户、角色、行策略、配额和配置文件也可以存储在 ZooKeeper 中：

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

您还可以定义部分 `memory` — 意味着仅在内存中存储信息，不写入磁盘，以及 `ldap` — 意味着在 LDAP 服务器上存储信息。

要将 LDAP 服务器添加为远程用户目录，以存储未在本地定义的用户，请定义单个 `ldap` 部分，并设置以下内容：

| 设置       | 描述                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | 在 `ldap_servers` 配置部分中定义的 LDAP 服务器名称之一。此参数是必需的，不能为空。                                                                                                                                                                                                                                                            |
| `roles`    | 一个包含将分配给从 LDAP 服务器检索到的每个用户的本地定义角色的列表的部分。如果未指定角色，则用户在身份验证后将无法执行任何操作。如果在身份验证时列出的任何角色未在本地定义，则身份验证尝试将失败，像是提供的密码不正确。 |

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

用户文件的目录。用于表函数 [file()](../../sql-reference/table-functions/file.md)、[fileCluster()](../../sql-reference/table-functions/fileCluster.md)。

**示例**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

用户脚本文件的目录。用于可执行的用户定义函数 [可执行用户定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。

**示例**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

类型：

默认：
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

<SettingsInfoBlock type="Bool" default_value="0" />确定在接收到查询数据包时是否启用客户端信息验证。

默认情况下，它是 `false`：

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />向量相似性索引的缓存大小（以条目计）。零表示禁用。
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />向量相似性索引缓存策略名称。
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />向量相似性索引的缓存大小。零表示禁用。

:::note
此设置可以在运行时修改，并将立即生效。
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />向量相似性索引缓存中受保护队列的大小（在 SLRU 策略下）相对于缓存的总大小。
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
此设置允许指定当 `dictionaries_lazy_load` 为 `false` 时的行为。
（如果 `dictionaries_lazy_load` 为 `true`，此设置将不影响任何内容。）

如果 `wait_dictionaries_load_at_startup` 为 `false`，则服务器会在启动时开始加载所有字典，并且在加载期间将接收连接。
当查询首次使用字典时，如果字典尚未加载，查询将会等待字典加载完成。
将 `wait_dictionaries_load_at_startup` 设置为 `false` 可以让 ClickHouse 启动更快，但某些查询可能会执行得更慢（因为它们将不得不等待某些字典加载）。

如果 `wait_dictionaries_load_at_startup` 为 `true`，那么服务器将在启动时等待所有字典完成加载（无论成功与否）后再接收任何连接。

**示例**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

用作存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的目录。默认情况下使用服务器工作目录下的 `/workload/` 文件夹。

**示例**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**另见**
- [工作负载层次](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

用于存储所有 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的 ZooKeeper 节点路径。为了确保一致性，所有 SQL 定义都作为此单一 znode 的值存储。默认情况下不使用 ZooKeeper，定义存储在 [disk](#workload_path)。

**示例**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**另见**
- [工作负载层次](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

包含允许 ClickHouse 与 [ZooKeeper](http://zookeeper.apache.org/) 集群交互的设置。ClickHouse 在使用复制表时使用 ZooKeeper 存储副本的元数据。如果未使用复制表，则可以省略此参数部分。

可以通过子标签配置以下设置：

| 设置                                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                    | ZooKeeper 端点。您可以设置多个端点。例如，`<node index="1"><host>example_host</host><port>2181</port></node>`。`index` 属性指定尝试连接到 ZooKeeper 集群时的节点顺序。                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                      | 客户端会话的最大超时（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                    | 单个操作的最大超时（以毫秒为单位）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root`（可选）                             | 用作 ClickHouse 服务器使用的 znodes 根的 znode。                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min`（可选）  | 在主服务器不可用时，备用节点的 ZooKeeper 会话的最小生命周期限制（负载均衡）。以秒为单位设置。默认：3 小时。                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max`（可选）  | 在主服务器不可用时，备用节点的 ZooKeeper 会话的最大生命周期限制（负载均衡）。以秒为单位设置。默认：6 小时。                                                                                                                                                                                                                                                                                                                                                              |
| `identity`（可选）                       | ZooKeeper 访问请求的 znodes 所需的用户和密码。                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression`（可选）                | 如果设置为 true，则启用 Keeper 协议中的压缩。                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

还有 `zookeeper_load_balancing` 设置（可选），允许您选择 ZooKeeper 节点选择的算法：

| 算法名称                    | 描述                                                                                                                    |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------|
| `random`                    | 随机选择一个 ZooKeeper 节点。                                                                                           |
| `in_order`                  | 选择第一个 ZooKeeper 节点，如果不可用则选择第二个，以此类推。                                                          |
| `nearest_hostname`          | 选择与服务器主机名最相似的 ZooKeeper 节点，主机名通过名称前缀进行比较。                                               |
| `hostname_levenshtein_distance` | 类似于 nearest_hostname，但以 levenshtein 距离方式比较主机名。                                                       |
| `first_or_random`           | 选择第一个 ZooKeeper 节点，如果不可用则随机选择剩余的一个 ZooKeeper 节点。                                           |
| `round_robin`               | 选择第一个 ZooKeeper 节点，如果重新连接，则选择下一个节点。                                                             |

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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**另见**

- [复制](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper 程序员指南](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ClickHouse 与 Zookeeper 之间的可选安全通信](/operations/ssl-zookeeper)
