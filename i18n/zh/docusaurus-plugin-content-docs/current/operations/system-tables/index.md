---
'description': '系统表的概述以及它们的用途。'
'keywords':
- 'system tables'
- 'overview'
'pagination_next': 'operations/system-tables/asynchronous_metric_log'
'sidebar_label': '概述'
'sidebar_position': 52
'slug': '/operations/system-tables/'
'title': '系统表'
---

| 页面 | 描述 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | 包含有关 `BACKUP` 和 `RESTORE` 操作的信息的系统表。 |
| [system.current_roles](/operations/system-tables/current-roles) | 包含当前用户的活动角色的系统表。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | 包含关于本地文件的信息，这些文件在等待发送到分片的队列中。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 包含关于字典的信息的系统表。 |
| [system.tables](/operations/system-tables/tables) | 包含服务器已知的每个表的元数据的系统表。 |
| [system.resources](/operations/system-tables/resources) | 包含驻留在本地服务器上的资源信息的系统表，为每个资源提供一行。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | 包含在处理器级别上的性能分析信息的系统表（可以在 `EXPLAIN PIPELINE` 中找到）。 |
| [system.parts](/operations/system-tables/parts) | 包含有关 MergeTree 部分信息的系统表。 |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 包含当前时刻所有活动角色的信息的系统表，包括当前用户的当前角色和当前角色的授予角色。 |
| [system.query_views_log](/operations/system-tables/query_views_log) | 包含执行查询时执行的依赖视图的信息的系统表，例如视图类型或执行时间。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | 包含有关各种 Blob 存储操作（如上传和删除）的信息的系统表。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | 包含在服务器配置中定义的存储策略和卷的信息的系统表。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | 包含所有表中现有数据跳过索引的信息的系统表。 |
| [system.settings](/operations/system-tables/settings) | 包含当前用户会话设置的信息的系统表。 |
| [System Tables Overview](/operations/system-tables/overview) | 概述系统表是什么以及它们的用途。 |
| [system.table_engine](/operations/system-tables/table_engines) | 包含服务器支持的表引擎及其支持的功能描述的系统表。 |
| [system.processes](/operations/system-tables/processes) | 用于实现 `SHOW PROCESSLIST` 查询的系统表。 |
| [system.columns](/operations/system-tables/columns) | 包含所有表中列的信息的系统表。 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 包含当前用户的配额使用情况的信息的系统表，例如已使用的配额和剩余的配额。 |
| [system.disks](/operations/system-tables/disks) | 包含在服务器配置中定义的磁盘的信息的系统表。 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | 包含在 `GraphiteMergeTree` 类型引擎的表中使用的 `graphite_rollup` 参数的信息的系统表。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | 包含所有用户的配额使用情况的信息的系统表。 |
| [system.role_grants](/operations/system-tables/role-grants) | 包含用户和角色的角色授权的系统表。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 包含关于异步插入的信息的系统表。每条记录表示缓冲到异步插入查询中的插入查询。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 包含已执行查询的跟踪跨度信息的系统表。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | 包含 S3Queue 表的设置的信息的系统表。可从服务器版本 `24.10` 开始使用。 |
| [system.query_condition_cache](/operations/system-tables/query_condition_cache) | 展示查询条件缓存内容的系统表。 |
| [system.symbols](/operations/system-tables/symbols) | 对于 C++ 专家和 ClickHouse 工程师有用的系统表，包含有关 `clickhouse` 二进制文件的内部信息。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | 包含在集群上执行的分布式 DDL 查询（使用 ON CLUSTER 子句的查询）信息的系统表。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | 系统数据库提供了一种几乎标准化的与数据库对象元数据无关的视图。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 包含有关和最近异步作业状态的系统表（例如，对于正在加载的表）。每个作业都有一行。 |
| [system.database_engines](/operations/system-tables/database_engines) | 包含服务器支持的数据库引擎列表的系统表。 |
| [system.quotas](/operations/system-tables/quotas) | 包含有关配额的信息的系统表。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | 包含有关 MergeTree 表的分离部分的信息的系统表。 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | 包含请求 ZooKeeper 服务器的参数和响应的信息的系统表。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 包含通过 jemalloc 分配器在不同大小类别（bins）中执行的内存分配的信息的系统表，从所有 arena 汇总。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | 包含缓存 DNS 记录的信息的系统表。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | 包含执行查询的线程信息的系统表，例如线程名称、线程开始时间、查询处理持续时间。 |
| [system.latency_log](/operations/system-tables/latency_log) | 包含所有延迟桶的历史记录，定期刷新到磁盘。 |
| [system.merges](/operations/system-tables/merges) | 包含当前正在处理的 MergeTree 家族表的合并和部分变更的信息的系统表。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 包含来自表 `system.events` 的单个查询的内存和度量值的历史记录，定期刷新到磁盘。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | 包含 AzureQueue 表的设置的信息的系统表。可从服务器版本 `24.10` 开始使用。 |
| [system.iceberg_history](/operations/system-tables/iceberg_history) | 包含系统冰山快照历史记录的系统表。 |
| [system.session_log](/operations/system-tables/session_log) | 包含所有成功和失败登录及登出事件的信息的系统表。 |
| [system.scheduler](/operations/system-tables/scheduler) | 包含驻留在本地服务器上的调度节点的信息和状态的系统表。 |
| [system.errors](/operations/system-tables/errors) | 包含错误代码及其触发次数的系统表。 |
| [system.licenses](/operations/system-tables/licenses) | 包含位于 ClickHouse 源代码的 contrib 目录中的第三方库的许可证的系统表。 |
| [system.user_processes](/operations/system-tables/user_processes) | 包含用户的内存使用和 ProfileEvents 概述的信息的系统表。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 包含当前正在运行的后台抓取的信息的系统表。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | 包含有关受支持数据类型的信息的系统表。 |
| [system.projections](/operations/system-tables/projections) | 包含所有表中现有投影的信息的系统表。 |
| [system.histogram_metrics](/en/operations/system-tables/histogram_metrics) | 此表包含可以立即计算并以 Prometheus 格式导出的直方图度量。它始终是最新的。 |
| [system.trace_log](/operations/system-tables/trace_log) | 包含由采样查询分析器收集的堆栈跟踪的系统表。 |
| [system.warnings](/operations/system-tables/system_warnings) | 此表包含有关 ClickHouse 服务器的警告消息。 |
| [system.roles](/operations/system-tables/roles) | 包含已配置角色的信息的系统表。 |
| [system.users](/operations/system-tables/users) | 包含在服务器上配置的用户帐户列表的系统表。 |
| [system.part_log](/operations/system-tables/part_log) | 包含与 MergeTree 家族表中的数据部分（例如，添加或合并数据）相关的事件的信息的系统表。 |
| [system.replicas](/operations/system-tables/replicas) | 包含驻留在本地服务器上的复制表的信息和状态的系统表。对于监控非常有用。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | 包含有关可刷新的物化视图的信息的系统表。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | 包含已执行 DROP TABLE 的表的信息，但尚未执行数据清理的系统表。 |
| [system.contributors](/operations/system-tables/contributors) | 包含有关贡献者的信息的系统表。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | 包含来自 `system.dropped_tables` 的已删除表的 MergeTree 部分的信息的系统表。 |
| [system.query_log](/operations/system-tables/query_log) | 包含已执行查询的信息的系统表，例如开始时间、处理持续时间、错误消息。 |
| [system.text_log](/operations/system-tables/text_log) | 包含日志记录条目的系统表。 |
| [system.functions](/operations/system-tables/functions) | 包含普通和聚合函数信息的系统表。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 包含 `system.asynchronous_metrics` 的历史值的系统表，这些值每个时间间隔（默认每秒一次）保存一次。 |
| [system.moves](/operations/system-tables/moves) | 包含有关正在进行的 MergeTree 表数据部分移动的信息的系统表。每个数据部分移动由一行表示。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | 包含由 `latency_log` 使用的桶边界的信息的系统表。 |
| [system.databases](/operations/system-tables/databases) | 包含当前用户可用的数据库的信息的系统表。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | 包含所有配额所有区间的最大值的信息的系统表。任意数量的行或零可以对应于一个配额。 |
| [system.metrics](/operations/system-tables/metrics) | 包含可以立即计算或具有当前值的度量信息的系统表。 |
| [system.query_cache](/operations/system-tables/query_cache) | 显示查询缓存内容的系统表。 |
| [system.one](/operations/system-tables/one) | 包含一行只有一个 `dummy` UInt8 列的系统表，该列的值为 0。类似于其他 DBMS 中的 `DUAL` 表。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | 包含队列中待处理异步插入的信息的系统表。 |
| [system.time_zones](/operations/system-tables/time_zones) | 包含 ClickHouse 服务器支持的时区列表的系统表。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | 包含有关所有缓存文件架构的信息的系统表。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | 系统表类似于 `system.numbers`，但读取是并行化的，并且数字可以以任何顺序返回。 |
| [system.metric_log](/operations/system-tables/metric_log) | 包含来自表 `system.metrics` 和 `system.events` 的度量值历史记录的系统表，定期刷新到磁盘。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 描述设置文件的内容的系统表：约束、适用设置的角色和用户、父设置文件。 |
| [system.server_settings](/operations/system-tables/server_settings) | 包含有关服务器的全局设置的信息的系统表，这些设置在 `config.xml` 中指定。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 包含每个分离表的信息的系统表。 |
| [system.row_policies](/operations/system-tables/row_policies) | 包含针对特定表的过滤器，以及应使用此行策略的角色和/或用户列表的系统表。 |
| [system.grants](/operations/system-tables/grants) | 显示授予 ClickHouse 用户帐户的权限的系统表。 |
| [system.error_log](/operations/system-tables/system-error-log) | 包含来自表 `system.errors` 的错误值历史记录的系统表，定期刷新到磁盘。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | 包含有关 MergeTree 表的设置的信息的系统表。 |
| [system.numbers](/operations/system-tables/numbers) | 包含一个名为 `number` 的单个 UInt64 列的系统表，该列包含几乎所有从零开始的自然数。 |
| [system.crash_log](/operations/system-tables/crash-log) | 包含有关致命错误的堆栈跟踪的信息的系统表。 |
| [system.workloads](/operations/system-tables/workloads) | 包含驻留在本地服务器上的工作负载的信息的系统表。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | 包含所有服务器线程的堆栈跟踪的系统表。允许开发者检查服务器状态。 |
| [system.clusters](/operations/system-tables/clusters) | 包含配置文件中可用集群及其定义的服务器的信息的系统表。 |
| [system.events](/operations/system-tables/events) | 包含系统中发生的事件数量的信息的系统表。 |
| [system.mutations](/operations/system-tables/mutations) | 包含 MergeTree 表的变更及其进度的信息的系统表。每个变更命令由一行表示。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 包含以前 ClickHouse 版本中设置更改的信息的系统表。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | 包含 MergeTree 表的部分和列的信息的系统表。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | 仅在配置了 ZooKeeper 时存在的系统表。显示当前到 ZooKeeper 的连接（包括辅助的 ZooKeeper）。 |
| [system.dashboards](/operations/system-tables/dashboards) | 包含通过 HTTP 接口可访问的 `/dashboard` 页面使用的查询。用于监控和故障排除。 |
| [system.build_options](/operations/system-tables/build_options) | 包含有关 ClickHouse 服务器构建选项的信息的系统表。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 包含在后台定期计算的度量信息的系统表。例如，使用的 RAM 量。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | 包含关于 Kafka 消费者的信息的系统表。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 包含配置设置文件的属性的系统表。 |
| [system.zookeeper](/operations/system-tables/zookeeper) | 仅在 ClickHouse Keeper 或 ZooKeeper 配置时存在的系统表。它暴露来自配置中的 Keeper 集群的数据。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | 包含来自 ClickHouse Keeper 或 ZooKeeper 中存储的复制队列任务的信息的系统表，适用于 `ReplicatedMergeTree` 家族的表。 |
