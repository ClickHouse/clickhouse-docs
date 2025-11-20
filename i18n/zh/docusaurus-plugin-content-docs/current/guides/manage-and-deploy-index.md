---
title: '管理与部署概览'
description: '管理与部署概览页'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['deployment', 'management', 'administration', 'operations', 'guides']
---

# 管理和部署

本节包含以下主题：

| 主题                                                                                                 | 描述                                                                                                                       |
|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [部署与扩缩](/deployment-guides/index)                                                                | 基于 ClickHouse Support 和 Services 团队向 ClickHouse 用户提供的建议整理的实际部署示例。                                  |
| [存储与计算分离](/guides/separation-storage-compute)                                                 | 指南，介绍如何使用 ClickHouse 和 S3 实现存储与计算分离的架构。                                                             |
| [规模规划和硬件推荐](/guides/sizing-and-hardware-recommendations)                                    | 指南，讨论面向开源用户的硬件、计算、内存和磁盘配置的一般性建议。                                                           |
| [配置 ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                                      | 有关如何配置 ClickHouse Keeper 的信息和示例。                                                                              |
| [网络端口](/guides/sre/network-ports)                                                                | ClickHouse 使用的网络端口列表。                                                                                            |
| [分片再均衡](/guides/sre/scaling-clusters)                                                           | 关于如何对分片进行再均衡的建议。                                                                                           |
| [ClickHouse 是否支持多区域复制？](/faq/operations/multi-region-replication)                          | 有关多区域复制的常见问题。                                                                                                  |
| [生产环境应使用哪个 ClickHouse 版本？](/faq/operations/production)                                   | 有关生产环境中 ClickHouse 版本选择的常见问题。                                                                              |
| [Cluster Discovery](/operations/cluster-discovery)                                                   | 有关 ClickHouse 集群发现功能的信息和示例。                                                                                 |
| [监控](/operations/monitoring)                                                                      | 有关如何监控 ClickHouse 的硬件资源利用率和服务器指标的信息。                                                              |
| [使用 OpenTelemetry 对 ClickHouse 进行追踪](/operations/opentelemetry)                               | 有关在 ClickHouse 中使用 OpenTelemetry 的信息。                                                                            |
| [配额](/operations/quotas)                                                                          | 有关 ClickHouse 配额的信息和示例。                                                                                        |
| [与 Zookeeper 的安全通信](/operations/ssl-zookeeper)                                                | 在 ClickHouse 与 Zookeeper 之间设置安全通信的指南。                                                                        |
| [启动脚本](/operations/startup-scripts)                                                              | 演示如何在启动期间运行启动脚本的示例，对迁移或自动创建 schema 很有用。                                                     |
| [用于存储数据的外部磁盘](/operations/storing-data)                                                  | 有关在 ClickHouse 中配置外部存储的信息和示例。                                                                             |
| [分配分析](/operations/allocation-profiling)                                                         | 有关使用 jemalloc 进行分配采样和分析的信息和示例。                                                                         |
| [备份与恢复](/operations/backup)                                                                    | 将数据备份到本地磁盘或外部存储的指南。                                                                                    |
| [缓存](/operations/caches)                                                                          | 对 ClickHouse 中各类缓存类型的说明。                                                                                       |
| [工作负载调度](/operations/workload-scheduling)                                                      | 对 ClickHouse 中工作负载调度的说明。                                                                                       |
| [自托管升级](/operations/update)                                                                    | 执行自托管升级的指导原则。                                                                                                 |
| [故障排查](/guides/troubleshooting)                                                                  | 各类故障排查技巧。                                                                                                         |
| [使用建议](/operations/tips)                                                                        | 各类 ClickHouse 硬件和软件使用建议。                                                                                       |
| [分布式 DDL](/sql-reference/distributed-ddl)                                                         | 对 `ON CLUSTER` 子句的说明。                                                                                               |