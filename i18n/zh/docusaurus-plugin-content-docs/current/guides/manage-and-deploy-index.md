---
title: '管理和部署概览'
description: '管理和部署概览页面'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['deployment', 'management', 'administration', 'operations', 'guides']
---

# 管理与部署

本节包含以下主题：

| 主题                                                                                                 | 描述                                                                                                                               |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [部署与扩展](/deployment-guides/index)                                                              | 基于 ClickHouse 支持与服务团队向 ClickHouse 用户提供的建议整理的可用部署示例。                                                     |
| [存储与计算分离](/guides/separation-storage-compute)                                               | 指南：介绍如何使用 ClickHouse 和 S3 实现存储与计算分离架构。                                                                       |
| [容量规划与硬件建议](/guides/sizing-and-hardware-recommendations)                                  | 指南：讨论针对开源用户在硬件、计算、内存和磁盘配置方面的一般性推荐。                                                               |
| [配置 ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                                     | 有关如何配置 ClickHouse Keeper 的信息与示例。                                                                                     |
| [网络端口](/guides/sre/network-ports)                                                              | ClickHouse 使用的网络端口列表。                                                                                                   |
| [分片再平衡](/guides/sre/scaling-clusters)                                                         | 关于分片再平衡的建议。                                                                                                            |
| [ClickHouse 是否支持多区域复制？](/faq/operations/multi-region-replication)                         | 有关多区域复制的常见问题解答。                                                                                                     |
| [生产环境应使用哪个 ClickHouse 版本？](/faq/operations/production)                                 | 有关生产环境应使用哪个 ClickHouse 版本的常见问题解答。                                                                            |
| [集群发现](/operations/cluster-discovery)                                                          | 有关 ClickHouse 集群发现功能的信息与示例。                                                                                        |
| [监控](/operations/monitoring)                                                                    | 有关如何监控 ClickHouse 的硬件资源使用情况和服务器指标的信息。                                                                   |
| [使用 OpenTelemetry 跟踪 ClickHouse](/operations/opentelemetry)                                   | 有关将 OpenTelemetry 与 ClickHouse 配合使用的信息。                                                                               |
| [配额](/operations/quotas)                                                                        | 有关 ClickHouse 配额的信息与示例。                                                                                                |
| [与 Zookeeper 的安全通信](/operations/ssl-zookeeper)                                              | 设置 ClickHouse 与 Zookeeper 之间安全通信的指南。                                                                                 |
| [启动脚本](/operations/startup-scripts)                                                            | 在启动期间运行启动脚本的示例，对迁移或自动创建表结构非常有用。                                                                    |
| [用于存储数据的外部磁盘](/operations/storing-data)                                                | 有关在 ClickHouse 中配置外部存储的信息与示例。                                                                                    |
| [内存分配分析](/operations/allocation-profiling)                                                  | 有关使用 jemalloc 进行分配采样和分析的信息与示例。                                                                                |
| [备份与恢复](/operations/backup)                                                                  | 有关备份到本地磁盘或外部存储的指南。                                                                                              |
| [缓存](/operations/caches)                                                                        | 对 ClickHouse 中各种缓存类型的说明。                                                                                              |
| [工作负载调度](/operations/workload-scheduling)                                                   | 对 ClickHouse 中工作负载调度的说明。                                                                                              |
| [自管理升级](/operations/update)                                                                  | 有关执行自管理升级的指南。                                                                                                        |
| [故障排查](/guides/troubleshooting)                                                                | 各类故障排查技巧。                                                                                                                |
| [使用建议](/operations/tips)                                                                       | 各类 ClickHouse 硬件和软件使用建议。                                                                                              |
| [分布式 DDL](/sql-reference/distributed-ddl)                                                      | 对 `ON CLUSTER` 子句的说明。                                                                                                      |