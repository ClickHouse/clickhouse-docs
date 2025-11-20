---
title: '部署选项'
slug: /infrastructure/deployment-options
description: 'ClickHouse 客户可用的部署选项'
keywords: ['bring your own cloud', 'byoc', 'private', 'government', 'self-deployed']
doc_type: 'reference'
---



# ClickHouse 部署选项

ClickHouse 提供多种部署选项，以满足不同客户的需求，在控制权、合规性以及运维开销等方面提供不同程度的选择。
本文档概述了可用的各类部署类型，帮助用户根据自身的架构偏好、合规要求及资源管理策略，选择最适合的解决方案。



## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud 是一个完全托管的云原生服务,提供 ClickHouse 的强大功能和高速性能,无需用户承担自行管理的运维复杂性。
该服务非常适合优先考虑快速部署、可扩展性和最小化管理开销的用户。
ClickHouse Cloud 负责处理基础设施配置、扩展、维护和更新的所有环节,让用户能够专注于数据分析和应用程序开发。
它提供按量计费和自动扩展功能,确保分析工作负载获得可靠且经济高效的性能表现。该服务支持 AWS、GCP 和 Azure,并提供直接的云市场计费选项。

了解更多关于 [ClickHouse Cloud](/getting-started/quick-start/cloud) 的信息。


## 自带云 {#byoc}

ClickHouse 自带云(BYOC)允许组织在自己的云环境中部署和管理 ClickHouse,同时利用托管服务层。该方案在 ClickHouse Cloud 的全托管体验与自管理部署的完全控制之间架起了桥梁。通过 ClickHouse BYOC,用户保留对其数据、基础设施和安全策略的控制权,满足特定的合规性和监管要求,同时将修补、监控和扩展等运维任务交由 ClickHouse 处理。该模式兼具私有云部署的灵活性和托管服务的优势,适用于对安全性、治理和数据驻留有严格要求的企业大规模部署场景。

了解更多关于[自带云](/cloud/reference/byoc/overview)的信息。


## ClickHouse Private {#clickhouse-private}

ClickHouse Private 是 ClickHouse 的自部署版本,采用与 ClickHouse Cloud 相同的专有技术。此选项提供最高程度的控制权,非常适合对合规性、网络和安全有严格要求的组织,以及具备运维专业能力、能够自主管理基础设施的团队。它可获得在 ClickHouse Cloud 环境中经过充分测试的定期更新和升级,享有功能丰富的产品路线图,并由我们的专家支持团队提供技术支持。

了解更多关于 [ClickHouse Private](/cloud/infrastructure/clickhouse-private) 的信息。


## ClickHouse Government {#clickhouse-government}

ClickHouse Government 是 ClickHouse 的自部署版本,专为满足政府机构和公共部门组织对隔离和认证环境的独特且严格需求而设计。该部署方案提供高度安全、合规且隔离的环境,重点实现基于 OpenSSL 的 FIPS 140-3 合规性、额外的系统加固以及漏洞管理。它充分利用 ClickHouse Cloud 的强大功能,同时集成专门的特性和配置,以满足政府实体的特定运营和安全要求。借助 ClickHouse Government,政府机构可以在受控且经过认证的基础设施中对敏感数据进行高性能分析,并获得针对公共部门需求定制的专家支持。

了解更多关于 [ClickHouse Government](/cloud/infrastructure/clickhouse-government) 的信息。
