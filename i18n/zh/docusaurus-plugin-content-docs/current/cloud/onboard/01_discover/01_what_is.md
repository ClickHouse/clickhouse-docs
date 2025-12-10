---
slug: /cloud/overview
title: '简介'
description: '了解 ClickHouse Cloud 是什么、相较于开源版的优势，以及这款完全托管的分析平台的关键特性'
keywords: ['clickhouse cloud', '什么是 clickhouse cloud', 'clickhouse cloud 概览', 'clickhouse cloud 功能']
hide_title: true
doc_type: 'guide'
---

## 什么是 ClickHouse Cloud？ {#what-is-clickhouse-cloud}

ClickHouse Cloud 是由 ClickHouse 的原始创建团队打造的、完全托管的云服务，而 ClickHouse 是目前最快、最流行的开源列式联机分析处理数据库。

使用 Cloud 时，基础设施、维护、扩缩容和运维都由平台代为处理，因此你可以专注于对你最重要的事情——更快速地为你的组织和客户创造价值。

## ClickHouse Cloud 的优势 {#benefits-of-clickhouse-cloud}

与开源版本相比，ClickHouse Cloud 具有以下主要优势：

- **快速实现价值**：无需为集群进行容量规划和扩缩容，即可立即开始构建。
- **无缝扩展**：自动扩缩容可适应变化的工作负载，无需为峰值用量进行过度预留。
- **无服务器运维**：我们负责容量规划、扩缩容、安全性、可靠性以及升级，您只需专注于使用。
- **透明定价**：只为实际使用量付费，并可通过资源预留和扩缩容控制管理成本。
- **总体拥有成本更低**：具备优秀的价格/性能比，并显著降低管理开销。
- **广泛的生态系统**：可继续使用您熟悉的数据连接器、可视化工具、SQL 以及各类多语言客户端。

## 自管理 ClickHouse 与 ClickHouse Cloud 的比较 {#oss-vs-clickhouse-cloud}

| Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
| **Deployment modes**           | ClickHouse 提供使用开源版本进行自管理或在云中部署的灵活性。对于无需服务器的本地文件，可以使用 ClickHouse local，或者使用 chDB 将 ClickHouse 直接嵌入到你的应用程序中。                                                                                                                                            | ✅               | ✅                 |
| **Storage**                    | 作为同时提供开源与云托管的产品，ClickHouse 可部署在共享磁盘（shared-disk）和无共享（shared-nothing）架构中。                                                                                                                                                                                                | ✅               | ✅                 |
| **Monitoring and alerting**    | 对服务状态进行监控和告警对于确保最佳性能以及主动检测和分级处理潜在问题至关重要。                                                                                                                                                                                                                               | ✅               | ✅                 |
| **ClickPipes**                 | ClickPipes 是 ClickHouse 的托管摄取流水线，可让你将外部数据源（如数据库、API 和流式服务）无缝连接到 ClickHouse Cloud，免除管理流水线、自定义作业或 ETL 流程的负担。它支持各种规模的工作负载。                                                                                                            | ❌               | ✅                 |
| **Pre-built integrations**     | ClickHouse 提供预构建集成，可将 ClickHouse 连接到常用工具和服务，例如数据湖、SQL 和语言客户端、可视化库等。                                                                                                                                                                                                 | ❌               | ✅                 |
| **SQL console**                | SQL 控制台提供一种快速、直观的方式来连接、探索和查询 ClickHouse 数据库，具备简洁流畅的界面与查询体验、数据导入工具、可视化、协作功能以及由 GenAI 驱动的 SQL 辅助能力。                                                                                                                                        | ❌               | ✅                 |
| **Compliance**                 | ClickHouse Cloud 的合规性包括 CCPA、EU-US DPF、GDPR、HIPAA、ISO 27001、ISO 27001 SoA、PCI DSS、SOC2。ClickHouse Cloud 在安全性、可用性、处理完整性和机密性方面的流程均通过独立审计。详情见：trust.clickhouse.com。                                                  | ❌               | ✅                 |
| **Enterprise-grade security**  | 支持企业级安全特性，如 SSO、多因素认证、基于角色的访问控制（RBAC）、通过 Private Link 与 Private Service Connect 的私有安全连接、IP 过滤、客户管理的加密密钥（CMEK）等。                                                                                                                              | ❌               | ✅                 |
| **Scaling and optimization**   | 可根据工作负载无缝扩容或缩容，支持横向和纵向扩展。借助自动备份、复制和高可用性，ClickHouse 为用户提供最佳的资源分配。                                                                                                                                                                                       | ❌               | ✅                 |
| **Support services**           | 我们一流的支持服务以及开源社区资源，可为你选择的任意部署模型提供保障。                                                                                                                                                                                                                                      | ❌               | ✅                 |
| **Database upgrades**          | 定期进行数据库升级对于建立稳健的安全态势以及获取最新功能和性能改进至关重要。                                                                                                                                                                                                                                | ❌               | ✅                 |
| **Backups**                    | 备份与恢复功能可确保数据持久性，并在中断或其他故障发生时支持平滑恢复。                                                                                                                                                                                                                                      | ❌               | ✅                 |
| **Compute-compute separation** | 用户可以在不受存储限制的情况下独立扩展计算资源，从而使团队和工作负载共享同一存储的同时仍能保有各自专用的计算资源。这确保一个工作负载的性能不会干扰另一个工作负载，从而增强灵活性、性能和成本效率。                                                                     | ❌               | ✅                 |
| **Managed services**           | 借助云托管服务，团队可以专注于业务成果并加速产品上市，而无需操心 ClickHouse 的容量规划、部署和维护等运维开销。                                                                                                                                                                                             | ❌               | ✅                 |