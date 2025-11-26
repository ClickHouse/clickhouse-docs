---
title: '管理与部署概览'
description: '管理与部署概览页面'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['部署', '管理', '管理与维护', '运维', '指南']
---

# 管理与部署

本节包含以下主题：

| Topic                                                                                                 | Description                                                                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | 基于 ClickHouse 支持与服务团队向 ClickHouse 用户提供的建议编写的可行部署示例。 |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | 介绍如何使用 ClickHouse 和 S3 实现存储与计算分离架构的指南。                |
| [Sizing and hardware recommendations'](/guides/sizing-and-hardware-recommendations)            | 概述针对开源用户在硬件、计算、内存和磁盘配置方面的一般性建议的指南。      |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | 有关如何配置 ClickHouse Keeper 的信息和示例。                                                                   |
| [Network ports](/guides/sre/network-ports)                                                    | ClickHouse 使用的网络端口列表。                                                                                         |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | 关于重新平衡分片的建议。                                                                                           |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | 有关多区域复制的常见问题解答。                                                                                                  |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | 有关生产环境中应使用哪个 ClickHouse 版本的常见问题解答。                                                                                    |
| [Cluster Discovery](/operations/cluster-discovery)                                            | 有关 ClickHouse 集群发现功能的信息和示例。                                                               |
| [Monitoring](/operations/monitoring)                                                          | 有关如何监控 ClickHouse 硬件资源使用情况和服务器指标的信息。                                |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | 有关将 OpenTelemetry 与 ClickHouse 结合使用的信息。                                                                               |
| [Quotas](/operations/quotas)                                                                  | 有关 ClickHouse 中配额的信息和示例。                                                                                 |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | 设置 ClickHouse 与 ZooKeeper 之间安全通信的指南。                                                       |
| [Startup Scripts](/operations/startup-scripts)                                                | 演示如何在启动过程中运行启动脚本的示例，可用于迁移或自动创建模式（schema）。                         |
| [External Disks for Storing Data](/operations/storing-data)                                   | 有关在 ClickHouse 中配置外部存储的信息和示例。                                                         |
| [Allocation profiling](/operations/allocation-profiling)                                      | 有关使用 jemalloc 进行内存分配采样和分析的信息和示例。                                                      |
| [Backup and Restore](/operations/backup)                                                      | 将数据备份到本地磁盘或外部存储的指南。                                                                          |
| [Caches](/operations/caches)                                                                  | 说明 ClickHouse 中各种缓存类型的文档。                                                                               |
| [Workload scheduling](/operations/workload-scheduling)                                        | 说明 ClickHouse 中工作负载调度的文档。                                                                                   |
| [Self-managed Upgrade](/operations/update)                                                    | 执行自主管理升级的指南。                                                                                |
| [Troubleshooting](/guides/troubleshooting)                                                    | 各类故障排查技巧。                                                                                                    |
| [Usage Recommendations](/operations/tips)                                                     | 各种 ClickHouse 硬件和软件使用建议。                                                                  |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | 对 `ON CLUSTER` 子句的说明。                                                                                             |