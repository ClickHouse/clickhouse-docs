---
sidebar_label: 'PCI 合规接入'
slug: /cloud/security/compliance/pci-onboarding
title: 'PCI 合规接入'
description: '了解如何对接符合 PCI 合规要求的服务'
doc_type: 'guide'
keywords: ['pci', 'compliance', 'payment security', 'data protection', 'security']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import pci1 from '@site/static/images/cloud/security/compliance/pci_1.png';
import pci2 from '@site/static/images/cloud/security/compliance/pci_2.png';
import pci3 from '@site/static/images/cloud/security/compliance/pci_3.png';

<EnterprisePlanFeatureBadge feature="PCI 合规性" />

ClickHouse 提供符合支付卡行业数据安全标准（PCI-DSS）的服务，并通过了一级服务提供商（Level 1 Service Provider）要求的审计。客户可以在这些服务中处理主账号号码（PAN），方法是启用此功能并将服务部署到合规区域。

有关 ClickHouse 合规计划以及第三方审计报告可用性的更多信息，请参阅我们的[合规性概览](/cloud/security/compliance-overview)。如需获取 PCI 共享责任文档的副本，请访问我们的 [Trust Center](https://trust.clickhouse.com)。此外，客户应查看我们的[安全功能](/cloud/security)页面，以便为其工作负载选择并实施适当的安全控制。

本页面介绍在 ClickHouse Cloud 中启用 PCI 合规服务部署的流程。

<VerticalStepper headerLevel="h3">
  ### 注册 Enterprise 级服务

  1. 在控制台左下角选择您的组织名称。
  2. 点击 **Billing**。
  3. 查看左上角的 **Plan**。
  4. 如果您的 **Plan** 为 **Enterprise**，则进入下一节。否则，点击 **Change plan**。
  5. 选择 **Switch to Enterprise**。

  ### 为您的组织启用 PCI

  1. 在控制台左下角选择您的组织名称。
  2. 点击 **Organization details**。
  3. 将 **Enable PCI** 开关打开。

  <br />

  <Image img={pci1} size="md" alt="启用 PCI" background="black" />

  <br />

  4. 启用后，即可在该组织内部署 PCI 服务。

  <br />

  <Image img={pci2} size="md" alt="已启用 PCI" background="black" />

  <br />

  ### 将服务部署到符合 PCI 的区域

  1. 在控制台主页左上角选择 **New service**。
  2. 将 **Region type** 更改为 **HIPAA compliant**。

  <br />

  <Image img={pci3} size="md" alt="部署到 PCI 区域" background="black" />

  <br />

  3. 输入服务名称并填写其余信息。

  如需获取符合 PCI 的云服务商和服务的完整列表，请查看我们的[支持的云区域](/cloud/reference/supported-regions)页面。
</VerticalStepper>


## 迁移现有服务 {#migrate-to-hipaa}

在需要满足合规要求时，我们强烈建议客户将服务部署到合规环境中。将服务从标准区域迁移到 PCI 合规区域的过程需要从备份中恢复，且可能会有一段停机时间。

如果需要从标准区域迁移到 PCI 合规区域，请按照以下步骤自行完成迁移：

1. 选择要迁移的服务。
2. 在左侧点击 **Backups**。
3. 点击要恢复的备份左侧的三点图标。
4. 选择 **Region type**，将该备份恢复到 PCI 合规区域。
5. 恢复完成后，运行一些查询，验证表结构和记录数量是否符合预期。
6. 删除旧服务。

:::info 限制
服务必须保持在同一云服务提供商和同一地理区域内。该过程会在相同云服务提供商和区域中，将服务迁移到合规环境。
:::
