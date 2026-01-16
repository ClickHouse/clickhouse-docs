---
slug: /about-us/cloud
sidebar_label: '云服务'
sidebar_position: 10
description: 'ClickHouse Cloud'
title: 'ClickHouse Cloud'
keywords: ['ClickHouse Cloud', '云数据库', '托管式 ClickHouse', 'Serverless 数据库', '云 OLAP']
doc_type: 'reference'
---

# ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud 是由广受欢迎的开源 OLAP 数据库 ClickHouse 的原始作者打造的云服务。
您可以通过[开始免费试用](https://console.clickhouse.cloud/signUp)来体验 ClickHouse Cloud。

## ClickHouse Cloud 的优势 \{#clickhouse-cloud-benefits\}

下面介绍使用 ClickHouse Cloud 的部分优势：

* **价值实现速度快**：无需为集群进行容量规划和扩缩容，即刻开始构建。
* **无缝扩展**：自动扩缩容可根据波动的工作负载进行调整，无需为峰值使用量预留过多资源。
* **Serverless 运维**：我们为您处理容量规划、扩缩容、安全性、可靠性与升级，您可以专注于业务。
* **透明定价**：只需为实际使用付费，并可通过资源预留和扩缩容控制来管理成本。
* **总体拥有成本**：以最佳性价比和极低的运维开销运行您的工作负载。
* **广泛的生态系统**：支持您使用偏好的数据连接器、可视化工具，以及 SQL 和各类语言客户端。

{/*
  ## OSS 与 ClickHouse Cloud 对比                           

  | Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
  |--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
  | **Deployment modes**           | ClickHouse 提供灵活的部署选项，您可以自行管理开源版本，或选择在云端托管部署。对于本地文件，可使用无需服务器的 ClickHouse Local；也可以使用 chDB 将 ClickHouse 直接嵌入到您的应用程序中。                                                                                                  | ✅               | ✅                 |
  | **Storage**                    | 作为开源与云托管产品，ClickHouse 支持在共享磁盘和 shared-nothing 架构中进行部署。                                                                                                                                                                               | ✅               | ✅                 |
  | **Monitoring and alerting**    | 针对服务状态进行监控与告警对于确保最佳性能，以及主动检测和排查潜在问题至关重要。                                                                                                                                      | ✅               | ✅                 |
  | **ClickPipes**                 | ClickPipes 是 ClickHouse 的托管摄取流水线，可让您将外部数据源（如数据库、API 和流式服务）无缝接入 ClickHouse Cloud，免去管理流水线、自定义作业或 ETL 流程的负担，并支持各种规模的工作负载。 | ❌               | ✅                 |
  | **Pre-built integrations**     | ClickHouse 提供预构建的集成能力，可将 ClickHouse 连接到常见工具和服务，如数据湖、SQL 与语言客户端、可视化库等。                                                                                                                          | ❌               | ✅                 |
  | **SQL console**                | SQL 控制台提供快速、直观的方式来连接、探索和查询 ClickHouse 数据库，具备流畅的界面、查询编辑器、数据导入工具、可视化功能、协作能力以及由 GenAI 驱动的 SQL 辅助功能。                                                                 | ❌               | ✅                 |
  | **Compliance**                 | ClickHouse Cloud 的合规涵盖 CCPA、EU-US DPF、GDPR、HIPAA、ISO 27001、ISO 27001 SoA、PCI DSS、SOC2。ClickHouse Cloud 在安全性、可用性、处理完整性和机密性等方面的流程均通过独立审计。详情参见：trust.clickhouse.com。                                   | ❌               | ✅                 |
  | **Enterprise-grade security**  | 支持高级安全特性，例如 SSO、多因素认证、基于角色的访问控制（RBAC）、通过 Private Link 与 Private Service Connect 提供的私有且安全的连接、IP 过滤、客户管理的加密密钥（CMEK）等。                              | ❌               | ✅                 |
  | **Scaling and optimization**   | 可根据工作负载无缝向上或向下扩展，支持水平与垂直扩展。借助自动备份、复制和高可用性，ClickHouse 为用户提供最佳资源分配。                                                                               | ❌               | ✅                 |
  | **Support services**           | 我们一流的支持服务与开源社区资源，可为您选择的任意部署模型提供全面支持。                                                                                                                                                                         | ❌               | ✅                 |
  | **Database upgrades**          | 定期进行数据库升级对于构建强健的安全态势，以及获取最新特性与性能改进至关重要。                                                                                                                                                                | ❌               | ✅                 |
  | **Backups**                    | 备份与恢复功能可确保数据持久性，并在发生中断或其他故障时支持平滑恢复。                                                                                                                                                                     | ❌               | ✅                 |
  | **Compute-compute separation** | 用户可以在独立于存储的前提下扩展计算资源，使团队与工作负载能够共享同一存储，同时保持各自独立的计算资源。这能确保某一工作负载的性能不会干扰另一工作负载，从而提升灵活性、性能与成本效率。         | ❌               | ✅                 |
  | **Managed services**           | 借助云托管服务，团队可以专注于业务成果、加速产品上市，而无需操心 ClickHouse 的容量规划、部署和维护等运维开销。                                                                                                   | ❌               | ✅                 |
  */ }


## ClickHouse Cloud 使用的是哪个版本的 ClickHouse？ \\{#what-version-of-clickhouse-does-clickhouse-cloud-use\\}

ClickHouse Cloud 会定期将您的服务升级到包含修复、新特性和性能改进的较新版本。在开源社区发布一个核心数据库版本之后，我们会在云端预发布环境中进行额外验证，这通常需要 6–8 周时间，然后才会推送到生产环境。版本发布会按云服务提供商、服务类型和区域分阶段逐步进行。

您可以通过订阅特定发布通道来指定 ClickHouse Cloud 服务的升级节奏。例如，我们提供 [“Fast” 发布通道](/manage/updates#fast-release-channel-early-upgrades)，允许您在常规发布节奏之前订阅更新，同时还提供 [“Slow” 发布通道](/manage/updates#slow-release-channel-deferred-upgrades) 以及其他更细粒度的延迟升级调度选项。

有关 ClickHouse Cloud 升级流程（包括向后兼容性保证）的概览，请参阅 [Upgrades](/manage/updates) 参考文档。