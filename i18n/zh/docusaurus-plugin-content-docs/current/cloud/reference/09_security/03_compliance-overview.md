---
title: '合规性概述'
slug: /cloud/security/compliance-overview
description: 'ClickHouse Cloud 安全与合规认证概述,包括 SOC 2、ISO 27001、美国数据隐私框架 (U.S. DPF) 和 HIPAA'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 安全与合规报告
ClickHouse 会评估客户在安全与合规方面的需求，并在有更多报告需求时持续扩展相关项目。要了解更多信息或下载这些报告，请访问我们的 [信任中心](https://trust.clickhouse.com)。



## SOC 2 Type II(自 2022 年起){#soc-2-type-ii-since-2022}

系统与组织控制(SOC)2 是一份专注于安全性、可用性、机密性、处理完整性和隐私标准的报告,这些标准包含在信任服务标准(TSC)中,适用于组织的系统,旨在向依赖方(我们的客户)提供关于这些控制措施的保证。ClickHouse 与独立的外部审计机构合作,每年至少进行一次审计,审计范围涵盖我们系统的安全性、可用性和处理完整性,以及我们系统所处理数据的机密性和隐私性。该报告涵盖我们的 ClickHouse Cloud 和自带云(BYOC)服务。


## ISO 27001(自 2023 年起){#iso-27001-since-2023}

国际标准化组织(ISO)27001 是一项国际信息安全标准。该标准要求企业实施信息安全管理体系(ISMS),包括风险管理、政策制定与传达、安全控制实施以及监控等流程,以确保各组成部分持续保持相关性和有效性。ClickHouse 会进行内部审计,并与独立的外部审计机构合作,在证书颁发后的两年内定期接受审计和中期检查。


## 美国数据隐私框架（自 2024 年起）{#us-dpf-since-2024}

美国数据隐私框架旨在为美国组织提供可靠的机制，用于从欧盟/欧洲经济区、英国和瑞士向美国传输个人数据，确保符合欧盟、英国和瑞士的法律要求（https://dataprivacyframework.gov/Program-Overview）。ClickHouse 已完成该框架的自我认证，并已列入[数据隐私框架名单](https://dataprivacyframework.gov/list)。


## HIPAA(自 2024 年起){#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature='HIPAA' />

1996 年《健康保险流通与责任法案》(HIPAA) 是美国一项专注于受保护健康信息 (PHI) 管理的隐私法律。HIPAA 包含多项要求,其中包括[安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html),该规则专注于保护电子个人健康信息 (ePHI)。ClickHouse 已实施管理、物理和技术保障措施,以确保存储在指定服务中的 ePHI 的机密性、完整性和安全性。这些活动已纳入我们的 SOC 2 Type II 报告中,可在我们的[信任中心](https://trust.clickhouse.com)下载。

请参阅 [HIPAA 入门](//cloud/security/compliance/hipaa-onboarding)了解完成业务合作伙伴协议 (BAA) 并部署符合 HIPAA 要求的服务的步骤。


## PCI 服务提供商（自 2025 年起）{#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature='PCI compliance' />

[支付卡行业数据安全标准（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/) 是由 PCI 安全标准委员会制定的一套规则，旨在保护信用卡支付数据。ClickHouse 已通过合格安全评估机构（QSA）的外部审计，并获得了针对信用卡数据存储相关 PCI 标准的合规报告（ROC）。如需下载我们的合规证明（AOC）和 PCI 责任概述副本，请访问我们的[信任中心](https://trust.clickhouse.com)。

有关部署符合 PCI 标准的服务的步骤，请参阅 [PCI 入门](//cloud/security/compliance/pci-onboarding)。


## 隐私合规 {#privacy-compliance}

除上述内容外,ClickHouse 还维护内部合规计划,以应对《通用数据保护条例》(GDPR)、《加州消费者隐私法案》(CCPA) 及其他相关隐私法规框架的要求。


## 支付合规性 {#payment-compliance}

ClickHouse 提供安全的信用卡支付方式,符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) 标准。
