---
title: '部署选项'
slug: /infrastructure/deployment-options
description: '适用于 ClickHouse 客户的部署选项'
keywords: ['自有云（BYOC，bring your own cloud）', 'byoc', '私有', '政府', '自托管']
doc_type: 'reference'
---

# ClickHouse 部署选项 \{#clickhouse-deployment-options\}

ClickHouse 提供多种部署选项，以满足不同客户的需求，在控制能力、合规性以及运维开销方面提供不同程度的选择。
本文档概述了可用的各类部署类型，帮助你选择最契合其特定架构偏好、合规要求和资源管理策略的最优解决方案。

## ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud 是一项完全托管的云原生服务，在免除自建与自管运维复杂性的前提下，提供 ClickHouse 的强大功能与高性能。
此选项非常适合优先考虑快速部署、弹性扩展以及尽可能降低运维开销的用户。
ClickHouse Cloud 负责基础设施的全部环节，包括资源供应、扩缩容、维护和更新，使用户可以将精力完全专注于数据分析和应用开发。
它提供按使用量计费和自动扩缩容，确保分析型工作负载具备可靠且高性价比的性能。该服务在 AWS、GCP 和 Azure 上均可用，并支持通过云市场直接计费。

了解更多关于 [ClickHouse Cloud](/getting-started/quick-start/cloud) 的信息。

## 自带云环境（Bring Your Own Cloud） \{#byoc\}

ClickHouse 自带云环境（Bring Your Own Cloud，简称 BYOC）使组织能够在自己的云环境中部署和管理 ClickHouse，同时利用托管服务层。此选项在 ClickHouse Cloud 的全托管体验与完全自管部署的完全控制之间架起桥梁。借助 ClickHouse BYOC，用户可以保留对其数据、基础设施和安全策略的控制权，以满足特定合规和监管要求，同时将补丁更新、监控和扩缩容等运维任务交由 ClickHouse 负责。该模式在提供私有云部署灵活性的同时，兼具托管服务的优势，适用于在安全、治理和数据驻留方面具有严格要求的大规模企业级部署。

进一步了解[自带云环境（Bring Your Own Cloud）](/cloud/reference/byoc/overview)。

## ClickHouse Private \{#clickhouse-private\}

ClickHouse Private 是一种自部署的 ClickHouse 版本，采用与 ClickHouse Cloud 相同的专有技术。此选项提供最大程度的控制权，非常适合具有严格合规、网络与安全要求的组织，以及具备运维专长、能够自行管理基础设施的团队。它受益于在 ClickHouse Cloud 环境中经过充分验证的定期更新与升级、功能丰富的产品路线图，并由我们的专家支持团队全程支援。

进一步了解 [ClickHouse Private](/cloud/infrastructure/clickhouse-private)。

## ClickHouse Government \{#clickhouse-government\}

ClickHouse Government 是一种自部署的 ClickHouse 版本，专为需要隔离且具备合规认证环境的政府机构和公共部门组织的独特且严格需求而设计。此部署选项提供高度安全、合规且隔离的环境，重点通过使用 OpenSSL 实现 FIPS 140-3 合规性，并提供额外的系统加固和漏洞管理。在充分利用 ClickHouse Cloud 强大能力的同时，它集成了专门的功能和配置，以满足政府机构特定的运营和安全要求。借助 ClickHouse Government，机构可以在受控且经认证的基础设施中对敏感数据进行高性能分析，并获得针对公共部门需求量身定制的专家支持。

了解更多关于 [ClickHouse Government](/cloud/infrastructure/clickhouse-government) 的信息。