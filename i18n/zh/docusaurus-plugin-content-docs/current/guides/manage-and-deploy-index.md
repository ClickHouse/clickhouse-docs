---
title: '管理与部署概览'
description: '管理与部署概览页'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['deployment', 'management', 'administration', 'operations', 'guides']
---

# 管理与部署

本节包含以下主题：

| 主题                                                                                                 | 描述                                                                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [部署与扩展](/deployment-guides/index)                                                 | 基于 ClickHouse 支持与服务团队向用户提供的建议而构建的可用部署示例。 |
| [存储与计算分离](/guides/separation-storage-compute)                       | 指南：介绍如何使用 ClickHouse 与 S3 实现存储与计算分离的架构。                |
| [容量规划与硬件建议](/guides/sizing-and-hardware-recommendations)            | 指南：讨论针对开源用户的一般硬件、计算、内存和磁盘配置建议。      |
| [配置 ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | 有关如何配置 ClickHouse Keeper 的信息和示例。                                                                   |
| [网络端口](/guides/sre/network-ports)                                                    | ClickHouse 使用的网络端口列表。                                                                                         |
| [分片再均衡](/guides/sre/scaling-clusters)                                           | 关于如何对分片进行再均衡的建议。                                                                                           |
| [ClickHouse 是否支持多区域复制？](/faq/operations/multi-region-replication) | 关于多区域复制的常见问题解答。                                                                                                  |
| [生产环境应使用哪个 ClickHouse 版本？](/faq/operations/production)                  | 关于生产环境中 ClickHouse 版本选择的常见问题解答。                                                                                    |
| [集群发现](/operations/cluster-discovery)                                            | 有关 ClickHouse 集群发现功能的信息和示例。                                                               |
| [监控](/operations/monitoring)                                                          | 有关如何监控 ClickHouse 的硬件资源使用情况和服务器指标的信息。                                |
| [使用 OpenTelemetry 追踪 ClickHouse](/operations/opentelemetry)                            | 有关将 OpenTelemetry 与 ClickHouse 配合使用的信息。                                                                               |
| [配额](/operations/quotas)                                                                  | 有关 ClickHouse 中配额的信息和示例。                                                                                 |
| [与 Zookeeper 的安全通信](/operations/ssl-zookeeper)                             | 指南：介绍如何在 ClickHouse 与 Zookeeper 之间建立安全通信。                                                       |
| [启动脚本](/operations/startup-scripts)                                                | 关于在启动过程中运行启动脚本的示例，对迁移或自动创建 schema 很有用。                         |
| [用于存储数据的外部磁盘](/operations/storing-data)                                   | 有关在 ClickHouse 中配置外部存储的信息和示例。                                                         |
| [内存分配剖析](/operations/allocation-profiling)                                      | 有关使用 jemalloc 进行分配采样和剖析的信息和示例。                                                      |
| [备份与恢复](/operations/backup)                                                      | 指南：介绍如何备份到本地磁盘或外部存储。                                                                          |
| [缓存](/operations/caches)                                                                  | 说明 ClickHouse 中的各种缓存类型。                                                                               |
| [工作负载调度](/operations/workload-scheduling)                                        | 说明 ClickHouse 中的工作负载调度机制。                                                                                   |
| [自主管理升级](/operations/update)                                                    | 执行自主管理升级的指导原则。                                                                                |
| [故障排查](/guides/troubleshooting)                                                    | 各类故障排查技巧。                                                                                                    |
| [使用建议](/operations/tips)                                                     | 各种 ClickHouse 硬件和软件使用建议。                                                                  |
| [分布式 DDL](/sql-reference/distributed-ddl)                                             | 对 `ON CLUSTER` 子句的说明。                                                                                             |