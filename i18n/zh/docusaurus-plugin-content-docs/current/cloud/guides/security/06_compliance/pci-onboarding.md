---
sidebar_label: "PCI 入门"
slug: /cloud/security/compliance/pci-onboarding
title: "PCI 入门"
description: "了解如何接入符合 PCI 标准的服务"
doc_type: "guide"
keywords:
  ["pci", "合规", "支付安全", "数据保护", "安全"]
---

import BetaBadge from "@theme/badges/BetaBadge"
import EnterprisePlanFeatureBadge from "@theme/badges/EnterprisePlanFeatureBadge"

import Image from "@theme/IdealImage"
import pci1 from "@site/static/images/cloud/security/compliance/pci_1.png"
import pci2 from "@site/static/images/cloud/security/compliance/pci_2.png"
import pci3 from "@site/static/images/cloud/security/compliance/pci_3.png"

<EnterprisePlanFeatureBadge feature='PCI 合规' />

ClickHouse 提供符合支付卡行业数据安全标准(PCI-DSS)的服务,并已通过一级服务提供商要求的审计。客户可以通过启用此功能并将服务部署到合规区域,在这些服务中处理主账号(PAN)。

有关 ClickHouse 合规计划和第三方审计报告可用性的更多信息,请查看我们的[合规概述](/cloud/security/compliance-overview)。如需获取我们的 PCI 共同责任文档副本,请访问我们的[信任中心](https://trust.clickhouse.com)。此外,客户应查看我们的[安全功能](/cloud/security)页面,以选择并实施适合其工作负载的安全控制措施。

本页面介绍在 ClickHouse Cloud 中启用部署符合 PCI 标准的服务的流程。

<VerticalStepper headerLevel="h3">

### 注册企业服务 {#sign-up-for-enterprise}

1. 在控制台左下角选择您的组织名称。
2. 点击**账单**。
3. 查看左上角的**套餐**。
4. 如果您的**套餐**是**企业版**,则进入下一部分。如果不是,请点击**更改套餐**。
5. 选择**切换到企业版**。

### 为您的组织启用 PCI {#enable-hipaa}

1. 在控制台左下角选择您的组织名称。
2. 点击**组织详情**。
3. 打开**启用 PCI** 开关。

<br />

<Image img={pci1} size='md' alt='启用 PCI' background='black' />

<br />

4. 启用后,即可在组织内部署 PCI 服务。

<br />

<Image img={pci2} size='md' alt='PCI 已启用' background='black' />

<br />

### 将服务部署到符合 PCI 标准的区域 {#deploy-pci-regions}

1. 在控制台主屏幕左上角选择**新建服务**
2. 将**区域类型**更改为**PCI 合规**

<br />

<Image img={pci3} size='md' alt='部署到 PCI 区域' background='black' />

<br />

3. 输入服务名称并填写其余信息

有关符合 PCI 标准的云提供商和服务的完整列表,请查看我们的[支持的云区域](/cloud/reference/supported-regions)页面。

</VerticalStepper>


## 迁移现有服务 {#migrate-to-hipaa}

强烈建议客户在必要时将服务部署到合规环境。从标准区域迁移到 PCI 合规区域的过程需要从备份进行恢复,可能会导致一定的停机时间。

如果需要从标准区域迁移到 PCI 合规区域,请按照以下步骤进行自助迁移:

1. 选择要迁移的服务。
2. 点击左侧的 **Backups**。
3. 选择要恢复的备份左侧的三点图标。
4. 选择 **Region type** 将备份恢复到 PCI 合规区域。
5. 恢复完成后,运行一些查询以验证架构和记录数是否符合预期。
6. 删除旧服务。

:::info 限制
服务必须保持在相同的云服务商和地理区域内。此过程会将服务迁移到同一云服务商和区域内的合规环境。
:::
