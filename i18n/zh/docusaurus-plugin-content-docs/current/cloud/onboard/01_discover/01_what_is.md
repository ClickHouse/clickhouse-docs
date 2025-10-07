---
'slug': '/cloud/overview'
'title': '介绍'
'description': '了解 ClickHouse Cloud 是什么，它相对于开源的优势，以及这个完全自管理分析平台的关键功能'
'keywords':
- 'clickhouse cloud'
- 'what is clickhouse cloud'
- 'clickhouse cloud overview'
- 'clickhouse cloud features'
'hide_title': true
'doc_type': 'guide'
---

## What is ClickHouse Cloud? {#what-is-clickhouse-cloud}

ClickHouse Cloud 是一个由 ClickHouse 的原始创建者创建的完全托管的云服务，ClickHouse 是最快速和最受欢迎的开源列式在线分析处理数据库。

有了 Cloud，基础设施、维护、扩展和运营都由我们为您处理，因此您可以专注于最重要的事情，即更快地为您的组织和客户创造价值。

## Benefits of ClickHouse Cloud {#benefits-of-clickhouse-cloud}

ClickHouse Cloud 提供了相较于开源版本的几个主要优势：

- **快速创造价值**：立即开始构建，无需为您的集群进行调整和扩展。
- **无缝扩展**：自动扩展适应可变负载，因此您无需过度配置以应对峰值使用。
- **无服务器操作**：放轻松，让我们为您处理尺寸、扩展、安全、可靠性和升级。
- **透明定价**：仅为您使用的内容付费，附带资源预留和扩展控制。
- **总拥有成本**：最佳的价格/性能比和低行政开销。
- **广泛的生态系统**：带上您最喜欢的数据连接器、可视化工具、SQL 和语言客户端。

## OSS vs ClickHouse Cloud comparison {#oss-vs-clickhouse-cloud}

| Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
| **Deployment modes**           | ClickHouse 提供了灵活性，可以选择自我管理的开源版本或在云中部署。使用 ClickHouse local 为本地文件提供服务，而 chDB 可以将 ClickHouse 直接嵌入到您的应用程序中。                                                                                              | ✅               | ✅                 |
| **Storage**                    | 作为一个开源和云托管的产品，ClickHouse 可以在共享磁盘和无共享架构中部署。                                                                                                                                                                               | ✅               | ✅                 |
| **Monitoring and alerting**    | 监控和警报您服务的状态对于确保最佳性能和主动检测潜在问题至关重要。                                                                                                                                                                                      | ✅               | ✅                 |
| **ClickPipes**                 | ClickPipes 是 ClickHouse 的托管摄取管道，允许您无缝连接外部数据源，如数据库、API 和流媒体服务到 ClickHouse Cloud，消除了管理管道、自定义作业或 ETL 过程的需求。它支持各种规模的工作负载。 | ❌               | ✅                 |
| **Pre-built integrations**     | ClickHouse 提供了预构建的集成，将 ClickHouse 连接到流行工具和服务，例如数据湖、SQL 和语言客户端、可视化库等。                                                                                                                | ❌               | ✅                 |
| **SQL console**                | SQL 控制台提供了一种快速、直观的方式来连接、探索和查询 ClickHouse 数据库，具有流畅的标题、查询界面、数据导入工具、可视化、协作功能以及 GenAI 驱动的 SQL 支持。                                                                                       | ❌               | ✅                 |
| **Compliance**                 | ClickHouse Cloud 合规性包括 CCPA、EU-US DPF、GDPR、HIPAA、ISO 27001、ISO 27001 SoA、PCI DSS 和 SOC2。ClickHouse Cloud 的安全性、可用性、处理完整性和保密性流程均经过独立审计。详情请访问: trust.clickhouse.com。                                   | ❌               | ✅                 |
| **Enterprise-grade security**  | 支持高级安全功能，如单点登录 (SSO)、多因素身份验证、基于角色的访问控制 (RBAC)、支持 Private Link 和 Private Service Connect 的私有和安全连接、IP 过滤、客户管理的加密密钥 (CMEK) 等。                                                     | ❌               | ✅                 |
| **Scaling and optimization**   | 根据工作负载无缝扩展或收缩，支持水平和垂直扩展。凭借自动备份、复制和高可用性，ClickHouse 提供给用户最佳的资源分配。                                                                                                                  | ❌               | ✅                 |
| **Support services**           | 我们一流的支持服务和开源社区资源为您选择的任何部署模式提供支持。                                                                                                                                                                        | ❌               | ✅                 |
| **Database upgrades**          | 定期的数据库升级对于建立强大的安全态势和访问最新功能及性能改进至关重要。                                                                                                                                                                           | ❌               | ✅                 |
| **Backups**                    | 备份和恢复功能确保数据的持久性，并支持在发生停机或其他中断时的优雅恢复。                                                                                                                                                                          | ❌               | ✅                 |
| **Compute-compute separation** | 用户可以独立扩展计算资源，因此团队和工作负载可以共享相同的存储，并保持专用的计算资源。这确保了一个工作负载的性能不会干扰另一个，提高了灵活性、性能和成本效率。                                                                          | ❌               | ✅                 |
| **Managed services**           | 通过云托管服务，团队可以专注于业务成果，加快上市时间，而无需担心 ClickHouse 的尺寸、设置和维护的操作开销。                                                                                                                | ❌               | ✅                 |
