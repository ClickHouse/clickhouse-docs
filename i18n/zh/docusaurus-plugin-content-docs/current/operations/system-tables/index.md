---
'description': '系统表是什么以及它们的作用概述。'
'keywords':
- 'system tables'
- 'overview'
'pagination_next': 'operations/system-tables/asynchronous_metric_log'
'sidebar_label': '概述'
'sidebar_position': 52
'slug': '/operations/system-tables/'
'title': '系统表'
---



```html
<!-- 本页的目录表是通过 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
从 YAML 前置字段: slug, description, title 自动生成的。

如果您发现错误，请编辑页面本身的 YML 前置字段。
-->

| 页面 | 描述 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | 包含有关 `BACKUP` 和 `RESTORE` 操作的日志条目的系统表。 |
| [system.current_roles](/operations/system-tables/current-roles) | 包含当前用户的活动角色的系统表。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | 包含所有待发送到分片的本地文件信息的系统表。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 包含字典信息的系统表 |
| [system.tables](/operations/system-tables/tables) | 包含服务器已知的每个表的元数据的系统表。 |
| [system.resources](/operations/system-tables/resources) | 关于驻留在本地服务器上的资源的信息的系统表，每个资源一行。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | 包含处理器级别的分析信息的系统表（可以在 `EXPLAIN PIPELINE` 中找到） |
| [system.parts](/operations/system-tables/parts) | 包含MergeTree的部分信息的系统表 |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 包含当前时刻所有活动角色的系统表，包括当前用户的当前角色和给定角色的授予角色 |
| [system.query_views_log](/operations/system-tables/query_views_log) | 包含在运行查询时执行的依赖视图信息的系统表，例如，视图类型或执行时间。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | 包含有关各种 blob 存储操作（如上传和删除）的日志条目的系统表。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | 包含在服务器配置中定义的存储策略和卷信息的系统表。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | 包含所有表中现有数据跳过索引信息的系统表。 |
| [system.settings](/operations/system-tables/settings) | 包含当前用户的会话设置信息的系统表。 |
| [System Tables Overview](/operations/system-tables/overview) | 系统表是什么以及它们为何有用的概述。 |
| [system.table_engine](/operations/system-tables/table_engines) | 包含服务器支持的表引擎及其支持功能描述的系统表。 |
| [system.processes](/operations/system-tables/processes) | 用于实现 `SHOW PROCESSLIST` 查询的系统表。 |
| [system.columns](/operations/system-tables/columns) | 包含所有表中的列信息的系统表 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 包含当前用户的配额使用信息，例如已使用多少配额和剩余多少。 |
| [system.disks](/operations/system-tables/disks) | 包含在服务器配置中定义的磁盘信息的系统表 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | 包含用于 `GraphiteMergeTree` 类型引擎的表的 `graphite_rollup` 参数的信息的系统表。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | 包含所有用户的配额使用信息的系统表。 |
| [system.role_grants](/operations/system-tables/role-grants) | 包含用户和角色的角色授予信息的系统表。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 包含有关异步插入的信息的系统表。每个条目代表一个缓存在异步插入查询中的插入查询。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 包含已执行查询的跟踪跨度信息的系统表。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | 包含 S3Queue 表设置的信息的系统表。自服务器版本 `24.10` 起可用。 |
| [system.query_condition_cache](/operations/system-tables/query_condition_cache) | 显示查询条件缓存内容的系统表。 |
| [system.symbols](/operations/system-tables/symbols) | 对 C++ 专家和 ClickHouse 工程师有用的系统表，包含 `clickhouse` 二进制文件的自省信息。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | 包含在集群上执行的分布式 ddl 查询（使用 ON CLUSTER 子句的查询）的信息的系统表。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | 提供关于数据库对象元数据的几乎标准化的 DBMS-独立视图的系统数据库。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 包含最近异步作业的信息和状态的系统表（例如，正在加载的表）。该表为每个作业包含一行。 |
| [system.database_engines](/operations/system-tables/database_engines) | 包含服务器支持的数据库引擎列表的系统表。 |
| [system.quotas](/operations/system-tables/quotas) | 包含有关配额的信息的系统表。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | 包含 MergeTree 表的分离部分信息的系统表 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | 包含有关 ZooKeeper 服务器请求参数及其响应的信息的系统表。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 包含通过 jemalloc 分配器在不同大小类别（bins）中完成的内存分配信息的系统表，汇总自所有区域。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | 包含缓存的 DNS 记录的信息的系统表。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | 包含执行查询的线程信息的系统表，例如，线程名称、线程启动时间、查询处理持续时间。 |
| [system.latency_log](/operations/system-tables/latency_log) | 包含所有延迟桶的历史记录，定期刷新到磁盘。 |
| [system.merges](/operations/system-tables/merges) | 包含当前正在进行的合并和部分变更的信息的系统表，适用于MergeTree family 表。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 包含来自 `system.events` 表的每个查询的内存和指标值历史记录，定期刷新到磁盘。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | 包含 AzureQueue 表设置的信息的系统表。自服务器版本 `24.10` 起可用。 |
| [system.iceberg_history](/operations/system-tables/iceberg_history) | System iceberg 快照历史 |
| [system.session_log](/operations/system-tables/session_log) | 包含所有成功和失败的登录与登出事件信息的系统表。 |
| [system.scheduler](/operations/system-tables/scheduler) | 包含驻留在本地服务器的调度节点的信息和状态的系统表。 |
| [system.errors](/operations/system-tables/errors) | 包含错误代码及其触发次数的系统表。 |
| [system.licenses](/operations/system-tables/licenses) | 包含位于 ClickHouse 源代码 contrib 目录中的第三方库的许可证的系统表。 |
| [system.user_processes](/operations/system-tables/user_processes) | 包含有关用户内存使用情况和 ProfileEvents 概述的信息的系统表。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 包含当前正在运行的后台获取的信息的系统表。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | 包含支持的数据类型信息的系统表 |
| [system.projections](/operations/system-tables/projections) | 包含所有表中现有投影的信息的系统表。 |
| [system.histogram_metrics](/en/operations/system-tables/histogram_metrics) | 此表包含可以即时计算并以 Prometheus 格式导出的直方图度量信息。始终是最新的。 |
| [system.trace_log](/operations/system-tables/trace_log) | 包含由采样查询分析器收集的堆栈跟踪的系统表。 |
| [system.warnings](/operations/system-tables/system_warnings) | 此表包含有关 ClickHouse 服务器的警告消息。 |
| [system.roles](/operations/system-tables/roles) | 包含有关配置角色的信息的系统表。 |
| [system.users](/operations/system-tables/users) | 包含在服务器上配置的用户帐户列表的系统表。 |
| [system.part_log](/operations/system-tables/part_log) | 包含在 MergeTree family 表中发生的数据部分事件的信息的系统表，例如数据的添加或合并。 |
| [system.replicas](/operations/system-tables/replicas) | 包含驻留在本地服务器的复制表的信息和状态的系统表。适合监控用。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | 包含有关可刷新的物化视图的信息的系统表。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | 包含已执行删除表但尚未进行数据清理的表的信息的系统表 |
| [system.contributors](/operations/system-tables/contributors) | 包含有关贡献者的信息的系统表。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | 包含来自 `system.dropped_tables` 的已删除表部分的信息的系统表 |
| [system.query_log](/operations/system-tables/query_log) | 包含已执行查询的信息的系统表，例如，开始时间、处理持续时间、错误消息。 |
| [system.text_log](/operations/system-tables/text_log) | 包含日志条目的系统表。 |
| [system.functions](/operations/system-tables/functions) | 包含常规和聚合函数信息的系统表。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 包含 `system.asynchronous_metrics` 的历史值的系统表，该值每个时间间隔（默认为一秒）保存一次 |
| [system.moves](/operations/system-tables/moves) | 包含 MergeTree 表正在进行的数据部分移动信息的系统表。每个数据部分移动由一行表示。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | 包含 `latency_log` 使用的桶边界信息的系统表。 |
| [system.databases](/operations/system-tables/databases) | 包含当前用户可用的数据库信息的系统表。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | 包含有关所有配额所有时间段的最大值的信息的系统表。任意数量的行或零可以对应于一个配额。 |
| [system.metrics](/operations/system-tables/metrics) | 包含可以即时计算或具有当前值的指标的系统表。 |
| [system.query_cache](/operations/system-tables/query_cache) | 显示查询缓存内容的系统表。 |
| [system.one](/operations/system-tables/one) | 包含一行和一个 `dummy` UInt8 列且值为 0 的系统表。类似于其他 DBMS 中的 `DUAL` 表。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | 包含队列中待处理异步插入信息的系统表。 |
| [system.time_zones](/operations/system-tables/time_zones) | 包含 ClickHouse 服务器支持的时区列表的系统表。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | 包含关于所有缓存文件模式的信息的系统表。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | 系统表，类似于 `system.numbers`，但读取是并行的且数字可以以任意顺序返回。 |
| [system.metric_log](/operations/system-tables/metric_log) | 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录的系统表，定期刷新到磁盘。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 描述设置配置文件内容的系统表：约束、角色和用户、设置适用的父设置配置文件。 |
| [system.server_settings](/operations/system-tables/server_settings) | 包含有关服务器的全局设置的信息的系统表，这些设置在 `config.xml` 中指定。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 包含有关每个分离表的信息的系统表。 |
| [system.row_policies](/operations/system-tables/row_policies) | 包含特定表的过滤器，以及应使用此行策略的角色和/或用户列表的系统表。 |
| [system.grants](/operations/system-tables/grants) | 显示授予 ClickHouse 用户帐户的特权的系统表。 |
| [system.error_log](/operations/system-tables/system-error-log) | 包含来自 `system.errors` 表的错误值历史的系统表，定期刷新到磁盘。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | 包含有关 MergeTree 表设置的信息的系统表。 |
| [system.numbers](/operations/system-tables/numbers) | 包含一个名为 `number` 的单个 UInt64 列的系统表，该列几乎包含从零开始的所有自然数。 |
| [system.crash_log](/operations/system-tables/crash-log) | 包含有关致命错误的堆栈跟踪信息的系统表。 |
| [system.workloads](/operations/system-tables/workloads) | 包含驻留在本地服务器的工作负载的信息的系统表。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | 包含所有服务器线程的堆栈跟踪的系统表。允许开发人员自省服务器状态。 |
| [system.clusters](/operations/system-tables/clusters) | 包含配置文件中可用的集群和其中定义的服务器的信息的系统表。 |
| [system.events](/operations/system-tables/events) | 包含系统中发生的事件数量的信息的系统表。 |
| [system.mutations](/operations/system-tables/mutations) | 包含 MergeTree 表的变更及其进度的信息的系统表。每个变更命令由一行表示。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 包含有关以前 ClickHouse 版本中的设置更改的信息的系统表。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | 包含 MergeTree 表的部分及其列的信息的系统表。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | 仅在配置了 ZooKeeper 的情况下存在的系统表。显示当前与 ZooKeeper（包括辅助 ZooKeeper）的连接。 |
| [system.dashboards](/operations/system-tables/dashboards) | 包含通过 HTTP 接口访问的 `/dashboard` 页面使用的查询。适用于监控和故障排除。 |
| [system.build_options](/operations/system-tables/build_options) | 包含有关 ClickHouse 服务器构建选项的信息的系统表。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 包含定期在后台计算的指标的系统表。例如，使用的 RAM 数量。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | 包含有关 Kafka 消费者的信息的系统表。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 包含配置的设置配置文件属性的系统表。 |
| [system.zookeeper](/operations/system-tables/zookeeper) | 仅在配置了 ClickHouse Keeper 或 ZooKeeper 的情况下存在的系统表。它展示了配置中定义的 Keeper 集群中的数据。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | 包含有关存储在 ClickHouse Keeper 或 ZooKeeper 中的复制队列任务的信息的系统表，适用于 `ReplicatedMergeTree` 家族的表。 |
```
