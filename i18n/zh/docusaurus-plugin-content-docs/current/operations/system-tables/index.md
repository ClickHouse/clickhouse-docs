---
description: '系统表概述及其用途。'
slug: /operations/system-tables/
sidebar_position: 52
sidebar_label: 概述
pagination_next: 'operations/system-tables/asynchronous_metric_log'
title: '系统表'
keywords: ['system tables', 'overview']
---

<!-- 此页面的目录表是通过 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
从 YAML front matter 字段自动生成的：slug，description，title。

如果您发现错误，请编辑页面本身的 YML 前言。 -->

| 页面 | 描述 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | 包含有关 `BACKUP` 和 `RESTORE` 操作的信息的系统表。 |
| [system.current_roles](/operations/system-tables/current-roles) | 包含当前用户活动角色的系统表。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | 包含在队列中待发送到分片的本地文件信息的系统表。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 包含有关字典的信息的系统表。 |
| [system.tables](/operations/system-tables/tables) | 包含服务器已知的每个表的元数据的系统表。 |
| [system.system.resources](/operations/system-tables/resources) | 包含本地服务器上资源信息的系统表，每个资源一行。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | 包含处理器级别的分析信息的系统表（可以在 `EXPLAIN PIPELINE` 中找到）。 |
| [system.parts](/operations/system-tables/parts) |  |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 包含当前所有活动角色的系统表，包括当前用户的当前角色和当前角色的授予角色。 |
| [system.query_views_log](/operations/system-tables/query_views_log) | 包含运行查询时执行的依赖视图信息的系统表，例如，视图类型或执行时间。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | 包含有关各种 blob 存储操作（如上传和删除）信息的系统表。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | 包含服务器配置中定义的存储策略和卷的信息的系统表。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | 包含所有表中现有数据跳过索引的信息的系统表。 |
| [system.settings](/operations/system-tables/settings) | 包含当前用户的会话设置的信息的系统表。 |
| [System Tables Overview](/operations/system-tables/overview) | 系统表的概述及其用途。 |
| [system.table_engines](/operations/system-tables/table_engines) | 包含服务器支持的表引擎及其支持的特性的描述的系统表。 |
| [system.processes](/operations/system-tables/processes) | 用于实现 `SHOW PROCESSLIST` 查询的系统表。 |
| [system.columns](/operations/system-tables/columns) | 包含所有表中列信息的系统表。 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 包含当前用户的配额使用信息的系统表，例如使用了多少配额和剩余多少。 |
| [system.disks](/operations/system-tables/disks) | 包含服务器配置中定义的磁盘信息的系统表。 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | 包含在 `GraphiteMergeTree` 类型引擎中的表中使用的参数 `graphite_rollup` 的信息的系统表。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | 包含所有用户的配额使用信息的系统表。 |
| [system.role_grants](/operations/system-tables/role-grants) | 包含用户和角色的角色授予的系统表。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 包含有关异步插入的信息的系统表。每个条目代表一个缓冲到异步插入查询的插入查询。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 包含执行查询的追踪跨度信息的系统表。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | 包含 S3Queue 表设置的信息的系统表。可从服务器版本 `24.10` 开始使用。 |
| [system.symbols](/operations/system-tables/symbols) | 对于 C++ 专家和 ClickHouse 工程师有用，包含有关 `clickhouse` 二进制文件的自省信息的系统表。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | 包含在集群上执行的分布式 ddl 查询（使用 ON CLUSTER 子句的查询）信息的系统表。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | 系统数据库，提供几乎标准化的数据库管理系统无关的数据库对象元数据视图。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 包含有关最近异步作业的信息和状态的系统表（例如，正在加载的表）。该表包含每个作业的一行。 |
| [system.database_engines](/operations/system-tables/database_engines) | 包含服务器支持的数据库引擎列表的系统表。 |
| [system.quotas](/operations/system-tables/quotas) | 包含配额信息的系统表。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | 包含 MergeTree 表的分离部分信息的系统表。 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | 包含与 ZooKeeper 服务器的请求参数及其响应的信息的系统表。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 包含通过 jemalloc 分配器在不同尺寸类别（bins）中完成的内存分配信息的系统表，聚合自所有区域。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | 包含缓存的 DNS 记录信息的系统表。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | 包含执行查询线程的信息的系统表，例如，线程名称，线程开始时间，查询处理持续时间。 |
| [system.latency_log](/operations/system-tables/latency_log) | 包含所有延迟桶的历史记录，定期刷新到磁盘。 |
| [system.merges](/operations/system-tables/merges) | 包含当前正在处理的 MergeTree 家族表的合并和部分突变信息的系统表。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 包含来自 `system.events` 表中单个查询的内存和指标值历史记录的系统表，定期刷新到磁盘。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | 包含 AzureQueue 表设置的信息的系统表。可从服务器版本 `24.10` 开始使用。 |
| [system.session_log](/operations/system-tables/session_log) | 包含所有成功和失败登录及注销事件的信息的系统表。 |
| [system.scheduler](/operations/system-tables/scheduler) | 包含本地服务器上调度节点的信息和状态的系统表。 |
| [system.errors](/operations/system-tables/errors) | 包含错误代码及其触发次数的系统表。 |
| [system.licenses](/operations/system-tables/licenses) | 包含位于 ClickHouse 源的 contrib 目录中的第三方库许可的系统表。 |
| [system.user_processes](/operations/system-tables/user_processes) | 包含有关用户的内存使用和 ProfileEvents 概览信息的系统表。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 包含当前正在运行的背景抓取信息的系统表。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | 包含已支持数据类型信息的系统表。 |
| [system.processors_profile_log](/operations/system-tables/projections) | 包含所有表中现有投影信息的系统表。 |
| [](/en/operations/system-tables/histogram_metrics) |  |
| [system.trace_log](/operations/system-tables/trace_log) | 包含通过采样查询分析器收集的堆栈跟踪的系统表。 |
| [system.roles](/operations/system-tables/roles) | 包含已配置角色的信息的系统表。 |
| [system.users](/operations/system-tables/users) | 包含在服务器上配置的用户帐户列表的系统表。 |
| [system.part_log](/operations/system-tables/part_log) | 包含 MergeTree 家族表中数据部分发生的事件的信息的系统表，例如添加或合并数据。 |
| [system.replicas](/operations/system-tables/replicas) | 包含本地服务器上驻留的复制表的信息和状态的系统表。对监控很有用。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | 包含可刷新的物化视图的信息的系统表。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | 包含已执行删除表操作但尚未进行数据清理的表的信息的系统表。 |
| [system.contributors](/operations/system-tables/contributors) | 包含有关贡献者的信息的系统表。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | 包含来自 `system.dropped_tables` 的已删除表部分的信息的系统表。 |
| [system.query_log](/operations/system-tables/query_log) | 包含已执行查询的信息的系统表，例如，开始时间，处理持续时间，错误消息。 |
| [system.text_log](/operations/system-tables/text_log) | 包含日志条目的系统表。 |
| [system.functions](/operations/system-tables/functions) | 包含正常和聚合函数的信息的系统表。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 包含 `system.asynchronous_metrics` 的历史值，按时间间隔（默认为一秒）保存的系统表。 |
| [system.moves](/operations/system-tables/moves) | 包含正在进行的 MergeTree 表数据部分移动的信息的系统表。每个数据部分移动由一行表示。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | 包含用于 `latency_log` 的桶边界信息的系统表。 |
| [system.databases](/operations/system-tables/databases) | 包含当前用户可访问的数据库信息的系统表。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | 包含所有配额的所有时间段的最大值信息的系统表。任何行数或零都可以对应于一个配额。 |
| [system.metrics](/operations/system-tables/metrics) | 包含可以立即计算或当前值的指标的系统表。 |
| [system.query_cache](/operations/system-tables/query_cache) | 显示查询缓存内容的系统表。 |
| [system.one](/operations/system-tables/one) | 包含一行、一个 `dummy` UInt8 列且值为 0 的系统表。类似于其他数据库管理系统中的 `DUAL` 表。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | 包含队列中待处理的异步插入信息的系统表。 |
| [system.time_zones](/operations/system-tables/time_zones) | 包含 ClickHouse 服务器支持的时区列表的系统表。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | 包含所有缓存文件架构的信息的系统表。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | 类似于 `system.numbers` 的系统表，但读取是并行的，数字可以以任何顺序返回。 |
| [system.metric_log](/operations/system-tables/metric_log) | 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录的系统表，定期刷新到磁盘。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 描述设置配置的内容的系统表：约束、适用的角色和用户、父设置配置。 |
| [system.server_settings](/operations/system-tables/server_settings) | 包含有关服务器全局设置的信息的系统表，这些设置在 `config.xml` 中指定。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 包含每个分离表的信息的系统表。 |
| [system.row_policies](/operations/system-tables/row_policies) | 包含特定表的过滤器以及应该使用该行策略的角色和/或用户列表的系统表。 |
| [system.grants](/operations/system-tables/grants) | 显示授予 ClickHouse 用户帐户的权限的系统表。 |
| [system.error_log](/operations/system-tables/error_log) | 包含来自 `system.errors` 表的错误值历史记录的系统表，定期刷新到磁盘。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | 包含有关 MergeTree 表设置的信息的系统表。 |
| [system.numbers](/operations/system-tables/numbers) | 包含一个名为 `number` 的单个 UInt64 列，几乎包含所有从零开始的自然数的系统表。 |
| [system.crash_log](/operations/system-tables/crash-log) | 包含有关致命错误堆栈跟踪的信息的系统表。 |
| [system.workloads](/operations/system-tables/workloads) | 包含驻留在本地服务器上的工作负载信息的系统表。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | 包含所有服务器线程堆栈跟踪的系统表。允许开发人员反省服务器状态。 |
| [system.clusters](/operations/system-tables/clusters) | 包含配置文件中可用的集群及其定义的服务器的信息的系统表。 |
| [system.events](/operations/system-tables/events) | 包含系统中发生的事件数量的信息的系统表。 |
| [system.mutations](/operations/system-tables/mutations) | 包含 MergeTree 表的突变及其进展信息的系统表。每个突变命令由一行表示。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 包含以前 ClickHouse 版本中的设置更改的信息的系统表。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | 包含 MergeTree 表的部分和列信息的系统表。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | 仅在配置了 ZooKeeper 时存在。显示当前连接到 ZooKeeper（包括辅助 ZooKeeper）的系统表。 |
| [system.dashboards](/operations/system-tables/dashboards) | 包含通过 HTTP 接口访问的 `/dashboard` 页面使用的查询，有助于监控和故障排除。 |
| [system.build_options](/operations/system-tables/build_options) | 包含有关 ClickHouse 服务器构建选项的信息的系统表。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 包含定期在后台计算的指标的系统表。例如，使用的 RAM 量。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | 包含有关 Kafka 消费者的信息的系统表。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 包含已配置设置配置属性的系统表。 |
| [system.zookeeper](/operations/system-tables/zookeeper) | 仅在配置了 ClickHouse Keeper 或 ZooKeeper 时存在。它暴露数据来自于配置中定义的 Keeper 集群。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | 包含存储在 ClickHouse Keeper 或 ZooKeeper 中的复制队列任务信息的系统表，适用于 `ReplicatedMergeTree` 家族中的表。 |
