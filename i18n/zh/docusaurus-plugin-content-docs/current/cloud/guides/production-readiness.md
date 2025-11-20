---
slug: /cloud/guides/production-readiness
sidebar_label: '生产就绪'
title: 'ClickHouse Cloud 生产就绪指南'
description: '为计划从快速入门迁移到企业级 ClickHouse Cloud 部署的组织提供指导'
keywords: ['production readiness', 'enterprise', 'saml', 'sso', 'terraform', 'monitoring', 'backup', 'disaster recovery']
doc_type: 'guide'
---



# ClickHouse Cloud 生产环境就绪指南 {#production-readiness}

适用于已完成快速入门指南且拥有正在运行的数据服务的组织

:::note[TL;DR]
本指南帮助您从快速入门过渡到企业级 ClickHouse Cloud 部署。您将学习如何:

- 建立独立的开发/预发布/生产环境以进行安全测试
- 将 SAML/SSO 身份验证与您的身份提供商集成
- 使用 Terraform 或 Cloud API 实现自动化部署
- 将监控系统连接到您的告警基础设施(Prometheus、PagerDuty)
- 验证备份流程并记录灾难恢复过程
  :::


## 简介 {#introduction}

您已成功运行 ClickHouse Cloud 来处理业务工作负载。现在您需要提升部署成熟度以满足企业生产标准——无论是因为合规审计、未经测试的查询导致的生产事故,还是需要与企业系统集成的 IT 要求。

ClickHouse Cloud 的托管平台负责基础设施运维、自动扩缩容和系统维护。企业生产就绪要求通过身份验证系统、监控基础设施、自动化工具和业务连续性流程将 ClickHouse Cloud 连接到更广泛的 IT 环境。

您在企业生产就绪方面的职责:

- 建立独立环境,以便在生产部署前进行安全测试
- 与现有的身份提供商和访问管理系统集成
- 将监控和告警连接到您的运维基础设施
- 实施基础设施即代码实践以实现一致性管理
- 建立备份验证和灾难恢复流程
- 配置成本管理和计费集成

本指南将引导您完成各个方面,帮助您从可运行的 ClickHouse Cloud 部署过渡到企业级生产系统。


## 环境策略 {#environment-strategy}

建立独立的环境以安全地测试变更,避免影响生产工作负载。大多数生产事故都可以追溯到未经测试的查询或直接部署到生产系统的配置变更。

:::note
**在 ClickHouse Cloud 中,每个环境都是一个独立的服务。**您需要在组织内配置不同的生产、预发布和开发服务,每个服务都有自己的计算资源、存储和端点。
:::

**环境结构**:维护生产环境(实时工作负载)、预发布环境(生产等效验证)和开发环境(个人/团队实验)。

**测试**:在生产部署之前,先在预发布环境中测试查询。在小数据集上运行正常的查询,在生产规模下往往会导致内存耗尽、CPU 使用率过高或执行缓慢。在预发布环境中验证配置变更,包括用户权限、配额和服务设置——在生产环境中发现配置错误会立即引发运维事故。

**规模配置**:调整预发布服务的规模以接近生产负载特征。在明显较小的基础设施上测试可能无法发现资源争用或扩展问题。通过定期数据刷新或合成数据生成来使用具有生产代表性的数据集。有关如何调整预发布环境规模和适当扩展服务的指导,请参阅[规模配置和硬件建议](/guides/sizing-and-hardware-recommendations)和 [ClickHouse Cloud 中的扩展](/manage/scaling)文档。这些资源提供了关于内存、CPU 和存储规模配置的实用建议,以及垂直和水平扩展选项的详细信息,帮助您使预发布环境与生产工作负载相匹配。


## 私有网络 {#private-networking}

ClickHouse Cloud 中的[私有网络](/cloud/security/connectivity/private-networking)允许您将 ClickHouse 服务直接连接到您的云虚拟网络,确保数据不经过公共互联网传输。这对于有严格安全或合规要求的组织,或在私有子网中运行应用程序的组织至关重要。

ClickHouse Cloud 通过以下机制支持私有网络:

- [AWS PrivateLink](/manage/security/aws-privatelink):在您的 VPC 与 ClickHouse Cloud 之间建立安全连接,流量不会暴露到公共互联网。支持跨区域连接,在 Scale 和 Enterprise 套餐中提供。设置过程包括创建 PrivateLink 端点并将其添加到您的 ClickHouse Cloud 组织和服务允许列表中。更多详细信息和分步说明请参阅相关文档。
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC):允许从您的 Google Cloud VPC 私密访问 ClickHouse Cloud。与 AWS 类似,在 Scale 和 Enterprise 套餐中提供,需要明确配置服务端点和允许列表。
- [Azure Private Link](/cloud/security/azure-privatelink):在您的 Azure VNet 与 ClickHouse Cloud 之间提供私有连接,支持跨区域连接。设置过程包括获取连接别名、创建私有端点以及更新允许列表。

如需更多技术细节或分步设置说明,请参阅各云服务提供商的相关文档,其中包含详尽的指南。


## 企业身份验证和用户管理 {#enterprise-authentication}

从基于控制台的用户管理过渡到企业身份验证集成是实现生产就绪的关键步骤。

### SSO 和社交身份验证 {#sso-authentication}

[SAML SSO](/cloud/security/saml-setup):企业版 ClickHouse Cloud 支持与身份提供商(包括 Okta、Azure Active Directory 和 Google Workspace)的 SAML 集成。SAML 配置需要与 ClickHouse 支持团队协调,包括提供您的 IdP 元数据和配置属性映射。

[社交 SSO](/cloud/security/manage-my-account):ClickHouse Cloud 还支持社交身份验证提供商(Google、Microsoft、GitHub)作为 SAML SSO 的同等安全替代方案。对于没有现有 SAML 基础设施的组织,社交 SSO 提供了更快的设置方式,同时保持企业安全标准。

:::note 重要限制
通过 SAML 或社交 SSO 进行身份验证的用户默认被分配"Member"角色,必须在首次登录后由管理员手动授予其他角色。目前不支持组到角色的映射和自动角色分配。
:::

### 访问控制设计 {#access-control-design}

ClickHouse Cloud 使用组织级角色(Admin、Developer、Billing、Member)和服务/数据库级角色(Service Admin、Read Only、SQL console 角色)。围绕工作职能设计角色时,应遵循最小权限原则:

- **应用程序用户**:具有特定数据库和表访问权限的服务账户
- **分析师用户**:对精选数据集和报告视图的只读访问权限
- **管理员用户**:完整的管理权限

配置配额、限制和设置配置文件以管理不同用户和角色的资源使用。设置内存和执行时间限制以防止单个查询影响系统性能。通过审计、会话和查询日志监控资源使用情况,以识别频繁达到限制的用户或应用程序。使用 ClickHouse Cloud 的审计功能定期进行访问权限审查。

### 用户生命周期管理限制 {#user-lifecycle-management}

ClickHouse Cloud 目前不支持 SCIM 或通过身份提供商进行自动配置/取消配置。用户从您的 IdP 中删除后,必须从 ClickHouse Cloud 控制台手动删除。在这些功能可用之前,请规划手动用户管理流程。

了解更多关于[云访问管理](/cloud/security/cloud_access_management)和 [SAML SSO 设置](/cloud/security/saml-setup)的信息。


## 基础设施即代码与自动化 {#infrastructure-as-code}

通过基础设施即代码实践和 API 自动化管理 ClickHouse Cloud,可为您的部署配置提供一致性、版本控制和可重复性。

### Terraform Provider {#terraform-provider}

使用在 ClickHouse Cloud 控制台中创建的 API 密钥配置 ClickHouse Terraform provider:

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

Terraform provider 支持服务配置、IP 访问列表和用户管理。请注意,该 provider 目前不支持导入现有服务或显式备份配置。对于 provider 未涵盖的功能,请通过控制台进行管理或联系 ClickHouse 支持团队。

有关包括服务配置和网络访问控制在内的完整示例,请参阅 [Terraform 使用 Cloud API 示例](/knowledgebase/terraform_example)。

### Cloud API 集成 {#cloud-api-integration}

拥有现有自动化框架的组织可以直接通过 Cloud API 集成 ClickHouse Cloud 管理。该 API 提供对服务生命周期管理、用户管理、备份操作和监控数据检索的编程访问。

常见的 API 集成模式:

- 与内部工单系统集成的自定义配置工作流
- 基于应用程序部署计划的自动扩缩容调整
- 用于合规工作流的编程式备份验证和报告
- 与现有基础设施管理平台的集成

API 身份验证使用与 Terraform 相同的基于令牌的方法。有关完整的 API 参考和集成示例,请参阅 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 文档。


## 监控与运维集成 {#monitoring-integration}

将 ClickHouse Cloud 接入现有监控基础设施,可确保系统可见性和主动发现问题。

### 内置监控 {#built-in-monitoring}

ClickHouse Cloud 提供高级仪表板,包含实时指标,如每秒查询数、内存使用量、CPU 使用率和存储速率。通过 Cloud 控制台的 Monitoring → Advanced dashboard 访问。可创建自定义仪表板,针对特定工作负载模式或团队资源消耗进行定制。

:::note 常见生产环境不足
缺乏与企业事件管理系统的主动告警集成以及自动化成本监控。内置仪表板提供可见性,但自动化告警需要外部集成。
:::

### 生产环境告警配置 {#production-alerting}

**内置功能**:ClickHouse Cloud 通过电子邮件、UI 和 Slack 提供账单事件、扩缩容事件和服务健康状况的通知。通过控制台通知设置配置传递渠道和通知严重级别。

**企业集成**:对于高级告警(PagerDuty、自定义 webhook),使用 Prometheus 端点将指标导出到现有监控基础设施:

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets:
          ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

有关包括详细 Prometheus/Grafana 配置和高级告警在内的完整设置,请参阅 [ClickHouse Cloud 可观测性指南](/use-cases/observability/cloud-monitoring#prometheus)。


## 业务连续性与支持集成 {#business-continuity}

建立备份验证流程和支持集成,可确保您的 ClickHouse Cloud 部署能够从故障中恢复,并在需要时获得帮助。

### 备份策略评估 {#backup-strategy}

ClickHouse Cloud 提供可配置保留期的自动备份。请根据合规性和恢复要求评估您当前的备份配置。对备份位置或加密有特定合规要求的企业客户,可以配置 ClickHouse Cloud 将备份存储在自己的云存储桶中(BYOB)。如需配置 BYOB,请联系 ClickHouse 支持团队。

### 验证和测试恢复流程 {#validate-test-recovery}

大多数组织都是在实际恢复场景中才发现备份存在的问题。应建立定期验证机制,在故障发生前验证备份完整性并测试恢复流程。定期安排向非生产环境的测试恢复,记录包含时间估算的详细恢复步骤,验证恢复数据的完整性和应用程序功能,并针对不同的故障场景(服务删除、数据损坏、区域性中断)测试恢复流程。维护最新的恢复操作手册,确保值班团队可以随时访问。

对于关键生产服务,至少每季度测试一次备份恢复。具有严格合规要求的组织可能需要每月甚至每周进行验证。

### 灾难恢复规划 {#disaster-recovery-planning}

记录您的恢复时间目标(RTO)和恢复点目标(RPO),以验证当前备份配置是否满足业务要求。建立备份恢复的定期测试计划,并维护最新的恢复文档。

**跨区域备份存储**:具有地理灾难恢复要求的组织可以配置 ClickHouse Cloud 将备份导出到备用区域中客户自有的存储桶。这可以防范区域性中断,但需要手动执行恢复流程。如需实施跨区域备份导出,请联系 ClickHouse 支持团队。未来的平台版本将提供自动化的多区域复制功能。

### 生产支持集成 {#production-support}

了解您当前支持级别的 SLA 预期和升级流程。创建内部操作手册,明确何时需要联系 ClickHouse 支持团队,并将这些流程与现有的故障管理流程集成。

了解更多关于 [ClickHouse Cloud 备份与恢复](/cloud/manage/backups/overview)和[支持服务](/about-us/support)的信息。


## 后续步骤 {#next-steps}

完成本指南中的集成和操作步骤后,请访问 [Cloud 资源导览](/cloud/get-started/cloud/resource-tour),了解有关[监控](/cloud/get-started/cloud/resource-tour#monitoring)、[安全](/cloud/get-started/cloud/resource-tour#security)和[成本优化](/cloud/get-started/cloud/resource-tour#cost-optimization)的指南。

当当前[服务层级限制](/cloud/manage/cloud-tiers)影响到您的生产环境运行时,可考虑升级以获得增强功能,例如[私有网络](/cloud/security/connectivity/private-networking)、[TDE/CMEK](/cloud/security/cmek)(透明数据加密与客户托管加密密钥)或[高级备份选项](/cloud/manage/backups/configurable-backups)。
