---
title: '合规性概览'
slug: /cloud/security/compliance-overview
description: 'ClickHouse Cloud 安全和合规认证概览，包括 SOC 2、ISO 27001、U.S. DPF 和 HIPAA'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

# 安全与合规报告 \\{#security-and-compliance-reports\\}
ClickHouse 会评估客户在安全与合规方面的需求，并会根据额外报告请求持续扩展相关项目。有关更多信息或下载报告，请访问我们的[信任中心（Trust Center）](https://trust.clickhouse.com)。

## SOC 2 Type II（自 2022 年起） \\{#soc-2-type-ii-since-2022\\}

System and Organization Controls（SOC）2 是一类报告，聚焦于信任服务准则（Trust Services Criteria，TSC）中关于安全性、可用性、机密性、处理完整性和隐私的标准，这些标准适用于组织的系统，并旨在就这些控制向依赖方（即我们的客户）提供可靠保障。ClickHouse 与独立的外部审计机构合作，至少每年进行一次审计，评估我们系统的安全性、可用性和处理完整性，以及由我们系统处理的数据的机密性和隐私性。该报告涵盖我们的 ClickHouse Cloud 服务以及自带云（Bring Your Own Cloud，BYOC）部署选项。 

## ISO 27001（自 2023 年起） \\{#iso-27001-since-2023\\}

国际标准化组织（ISO）27001 是一项关于信息安全的国际标准。该标准要求公司实施信息安全管理体系（ISMS），其中包括用于管理风险、制定和传达政策、实施安全控制，以及开展监控的流程，以确保各组成部分持续保持适用性和有效性。ClickHouse 会开展内部审计，并与独立的外部审计机构合作，在证书签发后的 2 年内接受审计和阶段性检查。 

## 美国 DPF（自 2024 年起） \\{#us-dpf-since-2024\\}

美国数据隐私框架（U.S. Data Privacy Framework）的制定旨在为美国组织提供可靠机制，用于在符合欧盟、英国和瑞士法律的前提下，将个人数据从欧盟/欧洲经济区、英国和瑞士传输到美国（https://dataprivacyframework.gov/Program-Overview）。ClickHouse 已根据该框架完成自我认证，并被列入 [Data Privacy Framework List](https://dataprivacyframework.gov/list)。

## HIPAA（自 2024 年起） \\{#hipaa-since-2024\\}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

《健康保险携带与责任法案》（Health Insurance Portability and Accountability Act，HIPAA）于 1996 年在美国颁布，是一部聚焦于受保护健康信息（PHI）管理的美国隐私法。HIPAA 包含多项要求，其中之一是[《安全规则》](https://www.hhs.gov/hipaa/for-professionals/security/index.html)，其重点在于保护电子个人健康信息（ePHI）。ClickHouse 已实施管理、物理及技术防护措施，以确保存储在指定服务中的 ePHI 的机密性、完整性和安全性。这些措施已纳入我们的 SOC 2 Type II 报告中，您可以在我们的[信任中心](https://trust.clickhouse.com)下载该报告。

请参阅 [HIPAA onboarding](//cloud/security/compliance/hipaa-onboarding)，了解完成业务伙伴协议（BAA）并部署符合 HIPAA 要求的服务的具体步骤。

## PCI 服务提供商（自 2025 年起） \\{#pci-service-provider-since-2025\\}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

[Payment Card Industry Data Security Standard（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/) 是由 PCI Security Standards Council 制定的一套用于保护信用卡支付数据的安全标准。ClickHouse 已通过合格安全评估员（Qualified Security Assessor，QSA）执行的外部审计，并依据与存储信用卡数据相关的 PCI 标准获得了合规性报告（Report on Compliance，ROC）。如需下载我们的合规声明（Attestation on Compliance，AOC）及 PCI 职责概览，请访问我们的 [Trust Center](https://trust.clickhouse.com)。

有关部署符合 PCI 合规要求服务的步骤，请参阅 [PCI onboarding](//cloud/security/compliance/pci-onboarding)。

## 隐私合规 \\{#privacy-compliance\\}

除上述内容外，ClickHouse 还实施并维护内部合规计划，以满足《通用数据保护条例》（GDPR）、《加州消费者隐私法案》（CCPA）及其他相关隐私框架的要求。 

## 支付合规性 \\{#payment-compliance\\}

ClickHouse 提供安全的信用卡支付方式，并符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) 要求。 
