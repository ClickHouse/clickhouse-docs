---
slug: /about-us/cloud
sidebar_label: '云服务'
sidebar_position: 10
description: 'ClickHouse Cloud'
title: 'ClickHouse Cloud'
keywords: ['ClickHouse Cloud', 'cloud database', 'managed ClickHouse', 'serverless database', 'cloud OLAP']
doc_type: 'reference'
---



# ClickHouse Cloud

ClickHouse Cloud 是由广受欢迎的开源 OLAP 数据库 ClickHouse 的原始创建团队推出的云端产品。
你可以通过[开始免费试用](https://console.clickhouse.cloud/signUp)来体验 ClickHouse Cloud。



## ClickHouse Cloud 优势 {#clickhouse-cloud-benefits}

使用 ClickHouse Cloud 的主要优势包括：

- **快速创造价值**：无需规划集群规模和扩展策略，即可立即开始构建应用。
- **无缝弹性伸缩**：自动扩缩容功能可根据工作负载动态调整，无需为峰值使用量预留过多资源。
- **无服务器运维**：规模调整、扩展、安全、可靠性和升级等运维工作由我们负责，您可专注于核心业务。
- **透明计费**：按实际使用量付费,支持资源预留和扩展控制。
- **总体拥有成本低**：业界领先的性价比和极低的管理开销。
- **丰富的生态系统**：兼容您常用的数据连接器、可视化工具、SQL 客户端和各类编程语言客户端。


<!--
## 开源版与 ClickHouse Cloud 对比 {#oss-vs-clickhouse-cloud}

| 功能                        | 优势                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
| **部署模式**           | ClickHouse 提供灵活的部署选择,可以使用开源版本自行管理,也可以部署到云端。使用 ClickHouse Local 可在无需服务器的情况下处理本地文件,或使用 chDB 将 ClickHouse 直接嵌入到您的应用程序中。                                                                                                  | ✅               | ✅                 |
| **存储**                    | 作为开源和云托管产品,ClickHouse 可以部署在共享磁盘和无共享(Shared-Nothing)架构中。                                                                                                                                                                                                                                               | ✅               | ✅                 |
| **监控和告警**    | 对服务状态进行监控和告警对于确保最佳性能以及主动检测和分类潜在问题至关重要。                                                                                                                                      | ✅               | ✅                 |
| **ClickPipes**                 | ClickPipes 是 ClickHouse 的托管式数据摄取管道,允许您无缝连接外部数据源(如数据库、API 和流式服务)到 ClickHouse Cloud,无需管理管道、自定义作业或 ETL 流程。它支持各种规模的工作负载。 | ❌               | ✅                 |
| **预构建集成**     | ClickHouse 提供预构建集成,可将 ClickHouse 连接到流行的工具和服务,如数据湖、SQL 和语言客户端、可视化库等。                                                                                                                          | ❌               | ✅                 |
| **SQL 控制台**                | SQL 控制台提供了一种快速、直观的方式来连接、探索和查询 ClickHouse 数据库,具有简洁的界面、查询功能、数据导入工具、可视化、协作功能以及由生成式 AI 驱动的 SQL 辅助。                                                                 | ❌               | ✅                 |
| **合规性**                 | ClickHouse Cloud 合规性包括 CCPA、EU-US DPF、GDPR、HIPAA、ISO 27001、ISO 27001 SoA、PCI DSS、SOC2。ClickHouse Cloud 的安全性、可用性、处理完整性和机密性流程均经过独立审计。详情:trust.clickhouse.com。                                   | ❌               | ✅                 |
| **企业级安全**  | 支持高级安全功能,如单点登录(SSO)、多因素身份验证、基于角色的访问控制(RBAC)、支持 Private Link 和 Private Service Connect 的私有安全连接、IP 过滤、客户管理的加密密钥(CMEK)等。                              | ❌               | ✅                 |
| **扩展和优化**   | 根据工作负载无缝扩展或缩减,支持水平和垂直扩展。通过自动备份、复制和高可用性,ClickHouse 为用户提供最优的资源分配。                                                                               | ❌               | ✅                 |
| **支持服务**           | 我们一流的支持服务和开源社区资源为您选择的任何部署模式提供全面支持。                                                                                                                                                                         | ❌               | ✅                 |
| **数据库升级**          | 定期的数据库升级对于建立强大的安全态势以及获取最新功能和性能改进至关重要。                                                                                                                                                                | ❌               | ✅                 |
| **备份**                    | 备份和恢复功能确保数据持久性,并在发生中断或其他故障时支持平稳恢复。                                                                                                                                                                     | ❌               | ✅                 |
| **计算存储分离** | 用户可以独立于存储扩展计算资源,因此团队和工作负载可以共享相同的存储并维护专用的计算资源。这确保了一个工作负载的性能不会干扰另一个工作负载,从而增强灵活性、性能和成本效益。         | ❌               | ✅                 |
| **托管服务**           | 通过云托管服务,团队可以专注于业务成果并加快上市时间,而无需担心 ClickHouse 的规模调整、设置和维护等运营开销。                                                                                                   | ❌               | ✅                 |
-->


## ClickHouse Cloud 使用哪个版本的 ClickHouse? {#what-version-of-clickhouse-does-clickhouse-cloud-use}

ClickHouse Cloud 会持续将您的服务升级到更新版本。在开源版本发布核心数据库版本后,我们会在云端预发布环境中进行额外验证,通常需要 6-8 周时间才会推出到生产环境。推出过程按云服务提供商、服务类型和区域分阶段进行。

我们提供"快速"发布渠道,让您可以提前订阅更新,无需等待常规发布计划。有关更多详细信息,请参阅["快速发布渠道"](/manage/updates#fast-release-channel-early-upgrades)。

如果您依赖早期版本中的功能,在某些情况下可以使用服务的兼容性设置来恢复到之前的行为。
