---
sidebar_label: 'HIPAA 合规接入'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'HIPAA 合规接入'
description: '了解如何接入符合 HIPAA 要求的服务'
doc_type: 'guide'
keywords: ['hipaa', '合规', '医疗保健', '安全', '数据保护']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA" />

ClickHouse 提供符合 1996 年《健康保险携带与责任法案》（HIPAA）安全规则的服务。客户在签署业务合作伙伴协议（BAA）并将服务部署到合规地区后，可以在这些服务中处理受保护的健康信息（PHI）。

有关 ClickHouse 合规计划以及第三方审计报告可用性的更多信息，请查看我们的[合规性概览](/cloud/security/compliance-overview)和[Trust Center](https://trust.clickhouse.com)。此外，客户还应查看我们的[安全功能](/cloud/security)页面，以便为其工作负载选择并实施适当的安全控制措施。

本页描述了在 ClickHouse Cloud 中启用部署符合 HIPAA 要求服务的流程。


## 启用并部署符合 HIPAA 的服务 \\{#enable-hipaa-compliant-services\\}

<VerticalStepper headerLevel="h3">

### 注册 Enterprise 服务 \\{#sign-up-for-enterprise\\}

1. 在控制台左下角选择您的组织名称。
2. 点击 **Billing**。
3. 查看左上角的 **Plan**。
4. 如果您的 **Plan** 为 **Enterprise**，则继续下一部分；如果不是，点击 **Change plan**。
5. 选择 **Switch to Enterprise**。

### 为您的组织启用 HIPAA \\{#enable-hipaa\\}

1. 在控制台左下角选择您的组织名称。
2. 点击 **Organization details**。
3. 开启 **Enable HIPAA** 开关。

<br />

<Image img={hipaa1} size="md" alt="请求启用 HIPAA" background='black'/>

<br />

4. 按照屏幕上的说明提交请求，以完成 BAA 签署。

<br />

<Image img={hipaa2} size="md" alt="提交 BAA 请求" background='black'/>

<br />

5. BAA 签署完成后，将为该组织启用 HIPAA。

<br />

<Image img={hipaa3} size="md" alt="已启用 HIPAA" background='black'/>

<br />

### 将服务部署到符合 HIPAA 的区域 \\{#deploy-hippa-services\\}

1. 在控制台主页左上角选择 **New service**。
2. 将 **Region type** 更改为 **HIPAA compliant**。

<br />

<Image img={hipaa4} size="md" alt="部署到 HIPAA 区域" background='black'/>

<br />

3. 为该服务输入名称并填写其余信息。

有关符合 HIPAA 的云服务提供商和服务的完整列表，请查看我们的 [Supported cloud regions](/cloud/reference/supported-regions) 页面。

</VerticalStepper>



## 迁移现有服务 \\{#migrate-to-hipaa\\}

在需要满足合规要求的情况下，我们强烈建议客户将服务部署到符合合规要求的环境中。将服务从标准区域迁移到 HIPAA 合规区域的过程需要通过备份恢复来完成，并且可能会产生一定的停机时间。

如果需要从标准区域迁移到 HIPAA 合规区域，请按照以下步骤自行完成迁移：

1. 选择要迁移的服务。
2. 单击左侧的 **Backups**。
3. 单击要恢复的备份左侧的省略号图标（三个点）。
4. 选择 **Region type**，将备份恢复到 HIPAA 合规区域。
5. 恢复完成后，运行一些查询以验证 schema 与记录数量是否符合预期。
6. 删除旧服务。

:::info 限制
服务必须保持在相同的云服务提供商和地理区域内。此过程会将服务迁移到同一云服务提供商和区域中的合规环境。
:::
