---
slug: /cloud/guides/production-readiness
sidebar_label: '生产就绪'
title: 'ClickHouse Cloud 生产就绪指南'
description: '为正从快速入门阶段过渡到企业级 ClickHouse Cloud 部署的组织提供指南'
keywords: ['生产就绪', '企业', 'saml', 'sso', 'terraform', '监控', '备份', '灾难恢复']
doc_type: 'guide'
---

# ClickHouse Cloud 生产就绪指南 \\{#production-readiness\\}

适用于已完成快速入门指南且已有活跃服务并在持续接收数据的组织

:::note[摘要]
本指南将帮助你从快速入门过渡到满足企业级要求的 ClickHouse Cloud 部署。你将学习如何：

- 建立独立的开发/预发布/生产环境以进行安全测试
- 将 SAML/SSO 认证与身份提供商集成
- 使用 Terraform 或 Cloud API 实现部署自动化
- 将监控系统接入你的告警基础设施（Prometheus、PagerDuty）
- 验证备份流程并编写灾难恢复流程文档
:::

## 简介 \\{#introduction\\}

你已经成功在业务工作负载中运行 ClickHouse Cloud。现在，你需要使你的部署进一步成熟，以满足企业级生产标准——无论是由于合规审计的触发、由未测试查询引发的生产事故，还是因为 IT 部门要求将其集成到公司系统中。

ClickHouse Cloud 的托管平台负责基础设施运维、自动扩缩容以及系统维护。要实现企业级生产就绪，你需要将 ClickHouse Cloud 接入更广泛的 IT 环境，包括身份验证系统、监控基础设施、自动化工具以及业务连续性流程。

你在企业级生产就绪方面的职责包括：

- 为生产部署前的安全测试建立独立环境
- 与现有身份提供商和访问管理系统集成
- 将监控和告警接入你的运维基础设施
- 落实基础设施即代码实践，以实现一致性管理
- 建立备份验证和灾难恢复流程
- 配置成本管理和账单对接

本指南将逐一讲解上述各个方面，帮助你从一个可用的 ClickHouse Cloud 部署平滑过渡到企业级就绪的系统。

## 环境策略 \\{#environment-strategy\\}

建立彼此独立的环境，以便在不影响生产工作负载的前提下安全测试变更。大多数生产事故都可以追溯到直接部署到生产系统、但未经过测试的查询或配置更改。

:::note
**在 ClickHouse Cloud 中，每个环境都是一个独立的服务。** 你将在组织中分别预配生产、预发布（staging）和开发服务，每个服务都有自己的计算资源、存储以及端点。
:::

**环境结构**：维护生产环境（在线工作负载）、预发布环境（与生产等价的验证）和开发环境（个人/团队实验）。

**测试**：在生产部署之前，先在预发布环境中测试查询。在小数据集上运行正常的查询，在生产规模下往往会导致内存耗尽、过高的 CPU 使用率或执行过慢。需要在预发布环境中验证包括用户权限、配额和服务设置在内的配置更改——如果在生产环境中才发现配置错误，会立即引发运维事故。

**规模规划**：预发布服务的规格应尽量贴近生产负载特征。在明显更小的基础设施上进行测试，可能无法暴露资源争用或扩展性问题。通过定期数据刷新或生成合成数据，使用贴近生产的代表性数据集。关于如何为预发布环境进行规模规划并适当扩展服务，请参考 [Sizing and hardware recommendations](/guides/sizing-and-hardware-recommendations) 和 [Scaling in ClickHouse Cloud](/manage/scaling) 文档。这些资源提供了关于内存、CPU 和存储规模规划的实用建议，以及纵向和横向扩展选项的详细信息，帮助你使预发布环境尽可能贴近生产工作负载。

## 私有网络 \\{#private-networking\\}

ClickHouse Cloud 中的[私有网络](/cloud/security/connectivity/private-networking)功能允许将 ClickHouse 服务直接连接到您的云虚拟网络，确保数据不经过公共互联网传输。对于具有严格安全或合规性要求的组织，或在私有子网中运行应用程序的场景，这一点尤为重要。

ClickHouse Cloud 通过以下机制支持私有网络：

- [AWS PrivateLink](/manage/security/aws-privatelink)：在不将流量暴露到公共互联网的情况下，实现您的 VPC 与 ClickHouse Cloud 之间的安全连接。它支持跨区域连接，并在 Scale 和 Enterprise 套餐中提供。部署流程包括创建 PrivateLink 端点，并将其添加到 ClickHouse Cloud 组织和服务的允许列表中。更多详细信息和分步指导请参阅相关文档。
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC)：允许从您的 Google Cloud VPC 私密访问 ClickHouse Cloud。与 AWS 类似，它在 Scale 和 Enterprise 套餐中提供，并需要显式配置服务端点和允许列表，具体见文档说明。
- [Azure Private Link](/cloud/security/azure-privatelink)：在您的 Azure VNet 与 ClickHouse Cloud 之间提供私有连接，并支持跨区域连接。部署流程包括获取连接别名、创建私有端点以及更新允许列表，具体见文档说明。

如果您需要更多技术细节或分步配置说明，可参阅各云服务商的链接文档，其中提供了完整的指南。

## 企业级认证与用户管理 \\{#enterprise-authentication\\}

从基于控制台的用户管理迁移到企业级认证集成，是实现生产环境就绪的关键步骤。

### SSO 与社交认证 \\{#sso-authentication\\}

[SAML SSO](/cloud/security/saml-setup)：ClickHouse Cloud 的 Enterprise 层级支持与身份提供方（包括 Okta、Azure Active Directory 和 Google Workspace）的 SAML 集成。SAML 配置需要与 ClickHouse 支持团队协同完成，包括提供 IdP 元数据并配置属性映射。

[Social SSO](/cloud/security/manage-my-account)：ClickHouse Cloud 也支持社交认证提供方（Google、Microsoft、GitHub），作为与 SAML SSO 同样安全的替代方案。Social SSO 为尚未部署 SAML 基础设施的组织提供更快速的部署路径，同时保持企业级安全标准。

:::note 重要限制
通过 SAML 或 Social SSO 认证的用户默认会被分配为 “Member” 角色，且必须在首次登录后由管理员手动授予其他角色。目前不支持从用户组到角色的映射以及自动角色分配。
:::

### 访问控制设计 \\{#access-control-design\\}

ClickHouse Cloud 使用组织级角色（Admin、Developer、Billing、Member）以及服务/数据库级角色（Service Admin、Read Only、SQL console 角色）。应围绕岗位职能设计角色，并应用最小权限原则：

- **应用用户**：具备特定数据库和表访问权限的服务账户
- **分析用户**：对整理好的数据集和报表视图具有只读访问权限
- **管理员用户**：具备完整管理权限

配置配额、限制和 settings profiles，以管理不同用户和角色的资源使用。设置内存与执行时间限制，以防止单个查询影响系统性能。通过审计日志、会话日志和查询日志监控资源使用情况，以识别频繁触达限制的用户或应用。使用 ClickHouse Cloud 的审计能力定期开展访问审查。

### 用户生命周期管理限制 \\{#user-lifecycle-management\\}

ClickHouse Cloud 目前尚不支持通过身份提供方进行 SCIM 或自动化的用户开通/停用。用户在从 IdP 中移除后，必须从 ClickHouse Cloud 控制台中手动移除。在相关功能可用之前，请规划并实施手工的用户管理流程。

进一步了解 [Cloud Access Management](/cloud/security/cloud_access_management) 和 [SAML SSO 设置](/cloud/security/saml-setup)。

## 基础设施即代码与自动化 \\{#infrastructure-as-code\\}

通过采用基础设施即代码实践和 API 自动化来管理 ClickHouse Cloud，可以为您的部署配置提供一致性、版本控制和可复现性。

### Terraform Provider \{#terraform-provider\}

在 ClickHouse Cloud 控制台中创建 API 密钥，并使用它们配置 ClickHouse 的 Terraform Provider：

```terraform
terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 2.0"
    }
  }
}

provider "clickhouse" {
  environment     = "production"
  organization_id = var.organization_id
  token_key       = var.token_key
  token_secret    = var.token_secret
}
```

Terraform 提供程序支持服务开通、IP 访问列表和用户管理。对于该提供程序未覆盖的功能，请通过控制台进行管理，或联系 ClickHouse 支持。

有关包含服务配置和网络访问控制的完整示例，请参阅 [Terraform 示例：如何使用 Cloud API](/knowledgebase/terraform_example)。


### Cloud API 集成 \\{#cloud-api-integration\\}

已经拥有自动化框架的组织可以通过 Cloud API 将 ClickHouse Cloud 管理直接集成到现有框架中。该 API 提供对服务生命周期管理、用户管理、备份操作以及监控数据检索的编程访问能力。

常见的 API 集成模式包括：

* 与内部工单系统集成的自定义服务开通工作流
* 基于应用部署计划的自动化扩缩容调整
* 面向合规性工作流的备份校验与报告自动化
* 与现有基础设施管理平台的集成

API 认证采用与 Terraform 相同的基于 Token 的方式。完整的 API 参考与集成示例请参阅 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 文档。

## 监控与运维集成 \\{#monitoring-integration\\}

将 ClickHouse Cloud 接入现有监控基础设施，可以确保可观测性并实现对问题的主动发现。

### 内置监控 \\{#built-in-monitoring\\}

ClickHouse Cloud 提供高级仪表板，包含实时指标，例如每秒查询数、内存使用率、CPU 使用率以及存储速率。可在 Cloud 控制台的 Monitoring → Advanced dashboard 中访问。可以创建自定义仪表板，以适配特定的工作负载模式或团队资源消耗情况。

:::note 常见生产环境缺口
缺乏与企业级事件管理系统的主动告警集成，以及对成本的自动化监控。内置仪表板提供可观测性，但自动化告警仍需要借助外部集成。
:::

### 生产环境告警配置 \{#production-alerting\}

**内置能力**：ClickHouse Cloud 通过电子邮件、UI 和 Slack 提供账单事件、扩缩容事件以及服务健康状况的通知。可在控制台的通知设置中配置发送渠道和通知级别。

**企业集成**：对于高级告警（PagerDuty、自定义 Webhook），可使用 Prometheus 端点将指标导出到现有的监控基础设施：

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

如需了解包含 Prometheus 和 Grafana 详细配置以及高级告警在内的完整设置，请参阅 [ClickHouse Cloud 可观测性指南](/use-cases/observability/cloud-monitoring#prometheus)。


## 业务连续性与支持集成 \\{#business-continuity\\}

建立备份校验流程并完成支持集成，可确保你的 ClickHouse Cloud 部署在发生故障时能够恢复，并在需要时获得帮助。

### 备份策略评估 \\{#backup-strategy\\}

ClickHouse Cloud 提供带有可配置保留期的自动备份。根据合规性和恢复要求评估你当前的备份配置。对备份位置或加密有特定合规性要求的企业客户，可以将 ClickHouse Cloud 配置为将备份存储在其自有的云存储桶中（BYOB）。有关 BYOB 配置，请联系 ClickHouse 支持。

### 验证并测试恢复流程 \\{#validate-test-recovery\\}

大多数组织都是在实际恢复场景中才发现备份存在缺口。建立定期验证周期，在故障发生前校验备份完整性并测试恢复流程。定期在非生产环境中安排测试恢复，记录包含时间预估在内的分步恢复流程，验证已恢复数据的完整性以及应用的正常功能，并在不同故障场景下测试恢复流程（服务删除、数据损坏、区域性故障）。维护最新的恢复运行手册，并确保值班团队可以访问。

对于关键生产服务，至少每季度测试一次备份恢复。具有严格合规性要求的组织可能需要每月甚至每周进行验证。

### 灾难恢复规划 \\{#disaster-recovery-planning\\}

记录你的恢复时间目标（RTO）和恢复点目标（RPO），以验证当前备份配置是否满足业务要求。为备份恢复制定定期测试计划，并保持恢复文档的最新状态。

**跨区域备份存储**：具有跨地域灾难恢复需求的组织可以将 ClickHouse Cloud 配置为将备份导出到位于其他区域、由客户自有的存储桶中。这样可以防范区域性故障，但需要手动执行恢复流程。请联系 ClickHouse 支持以配置跨区域备份导出。未来的平台版本将提供自动化的多区域复制能力。

### 生产支持集成 \\{#production-support\\}

了解你当前支持等级的 SLA 预期和升级流程。创建内部运行手册，定义在何种情况下需要联系 ClickHouse 支持，并将这些流程与现有的事件管理流程集成。

详细了解 [ClickHouse Cloud 备份与恢复](/cloud/manage/backups/overview) 和 [支持服务](/about-us/support)。

## 后续步骤 \\{#next-steps\\}

在完成本指南中的集成和相关操作后，请访问 [Cloud 资源导览](/cloud/get-started/cloud/resource-tour)，查阅关于[监控](/cloud/get-started/cloud/resource-tour#monitoring)、[安全](/cloud/get-started/cloud/resource-tour#security)以及[成本优化](/cloud/get-started/cloud/resource-tour#cost-optimization)的指南。

如果当前的[服务层级限制](/cloud/manage/cloud-tiers)影响到你的生产环境运行，请考虑升级到更高层级，以获得更强大的功能，例如[私有网络](/cloud/security/connectivity/private-networking)、[TDE/CMEK](/cloud/security/cmek)（使用客户管理密钥的透明数据加密），或[高级备份选项](/cloud/manage/backups/configurable-backups)。