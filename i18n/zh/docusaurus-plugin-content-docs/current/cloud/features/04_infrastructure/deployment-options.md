---
title: '部署选项'
slug: /infrastructure/deployment-options
description: 'ClickHouse 客户可用的部署选项'
keywords: ['自带云（BYOC，bring your own cloud）', 'byoc', '私有', '政府', '自托管部署']
doc_type: 'reference'
---



# ClickHouse 部署选项

ClickHouse 提供多种部署选项，以满足不同客户的需求，在控制程度、合规性以及运维开销方面提供不同的选择。
本文档概述了可用的不同部署类型，帮助用户选择与其特定架构偏好、合规要求和资源管理策略相匹配的最优解决方案。



## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 是一个完全托管的云原生服务,无需自行管理运维的复杂性,即可提供 ClickHouse 的强大功能和高速性能。此选项非常适合优先考虑快速部署、可扩展性和最小化管理开销的用户。ClickHouse Cloud 处理基础设施配置、扩展、维护和更新的所有方面,使用户能够完全专注于数据分析和应用程序开发。它提供基于消费量的定价和自动扩展功能,确保分析工作负载的可靠性和成本效益。它可在 AWS、GCP 和 Azure 上使用,并提供直接的云市场计费选项。

了解更多关于 [ClickHouse Cloud](/getting-started/quick-start/cloud) 的信息。


## 自带云 {#byoc}

ClickHouse 自带云(BYOC)允许组织在自己的云环境中部署和管理 ClickHouse,同时利用托管服务层。该方案在 ClickHouse Cloud 的全托管体验与自管理部署的完全控制之间架起了桥梁。通过 ClickHouse BYOC,用户保留对其数据、基础设施和安全策略的控制权,满足特定的合规性和监管要求,同时将修补、监控和扩展等运维任务交由 ClickHouse 处理。该模式兼具私有云部署的灵活性和托管服务的优势,适用于对安全性、治理和数据驻留有严格要求的企业级大规模部署。

了解更多关于[自带云](/cloud/reference/byoc/overview)的信息。


## ClickHouse Private {#clickhouse-private}

ClickHouse Private 是 ClickHouse 的自部署版本,采用与 ClickHouse Cloud 相同的专有技术。该方案提供最高级别的控制能力,非常适合对合规性、网络和安全有严格要求的组织,以及具备运维专业能力、能够自主管理基础设施的团队。它可获得在 ClickHouse Cloud 环境中经过充分测试的定期更新和升级,享有功能丰富的产品路线图,并由我们的专家支持团队提供技术支持。

了解更多关于 [ClickHouse Private](/cloud/infrastructure/clickhouse-private) 的信息。


## ClickHouse Government {#clickhouse-government}

ClickHouse Government 是 ClickHouse 的自部署版本,专为满足政府机构和公共部门组织对隔离和认证环境的独特且严格的需求而设计。该部署方案提供高度安全、合规且隔离的环境,重点关注通过 OpenSSL 实现 FIPS 140-3 合规性、额外的系统加固以及漏洞管理。它充分利用 ClickHouse Cloud 的强大功能,同时集成专门的特性和配置,以满足政府实体的特定运营和安全要求。借助 ClickHouse Government,政府机构可以在受控且经过认证的基础设施中对敏感数据进行高性能分析,并获得针对公共部门需求定制的专家支持。

了解更多关于 [ClickHouse Government](/cloud/infrastructure/clickhouse-government) 的信息。
