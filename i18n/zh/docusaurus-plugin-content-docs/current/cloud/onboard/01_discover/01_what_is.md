---
slug: /cloud/overview
title: '简介'
description: '了解什么是 ClickHouse Cloud、它相较于开源版的优势，以及这一全托管分析平台的关键特性'
keywords: ['clickhouse cloud', '什么是 clickhouse cloud', 'clickhouse cloud 概览', 'clickhouse cloud 功能']
hide_title: true
doc_type: 'guide'
---



## 什么是 ClickHouse Cloud？ {#what-is-clickhouse-cloud}

ClickHouse Cloud 是由 ClickHouse 的最初创建者打造的全托管云服务，
而 ClickHouse 本身是速度最快、最流行的开源列式联机分析处理数据库。

在 ClickHouse Cloud 中，基础设施、运维、扩缩容和日常运营都由平台代管，
因此你可以专注于对你最重要的事情——更快速地为你的组织和客户创造价值。



## 使用 ClickHouse Cloud 的优势 {#benefits-of-clickhouse-cloud}

与开源版本相比，ClickHouse Cloud 具有以下主要优势：

- **快速实现价值**：无需规划和扩展集群规模，即可立即开始构建。
- **无缝扩展**：自动伸缩适配波动的工作负载，无需为峰值使用量进行过度预留。
- **无服务器运维模式**：我们负责容量规划、伸缩、安全性、可靠性和升级，你可以专注于业务。
- **透明定价**：按实际使用量付费，并可通过资源预留和伸缩控制管理成本。
- **总体拥有成本更低**：具备出色的价格 / 性能比，且管理开销较低。
- **广泛生态系统**：可无缝集成你常用的数据连接器、可视化工具、SQL 以及各类语言客户端。



## OSS 与 ClickHouse Cloud 对比 {#oss-vs-clickhouse-cloud}

| Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
| **Deployment modes**           | ClickHouse 提供使用开源自主管理或云上托管部署的灵活性。使用 ClickHouse local 可在无服务器的情况下操作本地文件，使用 chDB 可将 ClickHouse 直接嵌入到你的应用中。                                                                                                                              | ✅               | ✅                 |
| **Storage**                    | 作为同时支持开源和云托管的产品，ClickHouse 可以部署在共享磁盘和无共享（shared-nothing）架构中。                                                                                                                                                                                           | ✅               | ✅                 |
| **Monitoring and alerting**    | 针对服务状态进行监控与告警，对于确保最佳性能以及主动发现和分级处理潜在问题至关重要。                                                                                                                                                                                                                  | ✅               | ✅                 |
| **ClickPipes**                 | ClickPipes 是 ClickHouse 托管的摄取管道，可让你无缝将外部数据源（如数据库、API 和流式服务）连接到 ClickHouse Cloud，免去管理管道、自定义作业或 ETL 流程的工作。它支持各种规模的工作负载。                                                                                                          | ❌               | ✅                 |
| **Pre-built integrations**     | ClickHouse 提供预构建的集成，可将 ClickHouse 连接到数据湖、SQL 与语言客户端、可视化库等常用工具和服务。                                                                                                                                                                                              | ❌               | ✅                 |
| **SQL console**                | SQL 控制台提供一种快速、直观的方式来连接、探索和查询 ClickHouse 数据库，具备现代化界面、查询交互、数据导入工具、可视化、协作功能，以及由 GenAI 驱动的 SQL 辅助能力。                                                                                                                              | ❌               | ✅                 |
| **Compliance**                 | ClickHouse Cloud 的合规认证包括 CCPA、EU-US DPF、GDPR、HIPAA、ISO 27001、ISO 27001 SoA、PCI DSS、SOC2。ClickHouse Cloud 在安全性、可用性、处理完整性和机密性方面的流程均通过独立审计。详情见：trust.clickhouse.com。                                                 | ❌               | ✅                 |
| **Enterprise-grade security**  | 支持企业级安全特性，如 SSO、多因素认证、基于角色的访问控制（RBAC）、通过 Private Link 和 Private Service Connect 提供的私有且安全的连接、IP 过滤、客户管理的加密密钥（CMEK）等。                                                                                                   | ❌               | ✅                 |
| **Scaling and optimization**   | 可根据工作负载无缝向上或向下扩展，支持水平和垂直伸缩。借助自动备份、复制和高可用能力，ClickHouse 为用户提供最佳的资源分配。                                                                                                                                                                      | ❌               | ✅                 |
| **Support services**           | 我们一流的支持服务与开源社区资源可覆盖你选择的任何部署模型。                                                                                                                                                                                                                                           | ❌               | ✅                 |
| **Database upgrades**          | 定期进行数据库升级，对于构建稳健的安全态势以及获取最新功能和性能改进至关重要。                                                                                                                                                                                                                         | ❌               | ✅                 |
| **Backups**                    | 备份与恢复功能可确保数据持久性，并在发生故障或其他中断时支持平滑恢复。                                                                                                                                                                                                                                   | ❌               | ✅                 |
| **Compute-compute separation** | 用户可以将计算资源与存储解耦并独立伸缩，使不同团队和工作负载共享同一存储但保持各自独立的计算资源。这确保一个工作负载的性能不会干扰另一个，从而提升灵活性、性能和成本效率。                                                                                                                        | ❌               | ✅                 |
| **Managed services**           | 借助云托管服务，团队可以专注于业务成果并加速产品上线，而无需为 ClickHouse 的容量规划、部署和运维开销操心。                                                                                                                                                                                             | ❌               | ✅                 |
