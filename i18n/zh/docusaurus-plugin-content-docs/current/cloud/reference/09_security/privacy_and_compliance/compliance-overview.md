---
'title': '安全与合规报告'
'slug': '/cloud/security/compliance-overview'
'description': '关于 ClickHouse Cloud 安全与合规认证的概述，包括 SOC 2、ISO 27001、美国 DPF 和 HIPAA'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 安全和合规报告
ClickHouse Cloud 评估我们的客户的安全和合规需求，并在不断扩展该计划，以满足其他报告的请求。有关更多信息或下载报告，请访问我们的 [信任中心](https://trust.clickhouse.com)。

### SOC 2 Type II（自2022年起） {#soc-2-type-ii-since-2022}

系统和组织控制（SOC）2是一份专注于安全性、可用性、机密性、处理完整性和隐私标准的报告，这些标准包含在信任服务标准（TSC）中，并适用于组织的系统，旨在向依赖方（我们的客户）提供有关这些控制的保证。ClickHouse 与独立的外部审计师合作，至少每年进行一次审计，以解决我们系统的安全性、可用性和处理完整性，以及我们系统处理的数据的机密性和隐私。该报告涉及我们的 ClickHouse Cloud 和自带云（BYOC）服务。

### ISO 27001（自2023年起） {#iso-27001-since-2023}

国际标准组织（ISO）27001是信息安全的国际标准。它要求公司实施信息安全管理系统（ISMS），该系统包括管理风险、创建和传达政策、实施安全控制以及监控以确保组件保持相关和有效的流程。ClickHouse 进行内部审计，并与独立的外部审计师合作，在证书发放后的两年内进行审计和中期检查。

### 美国数据隐私框架（自2024年起） {#us-dpf-since-2024}

美国数据隐私框架的制定旨在为美国组织提供可靠的机制，从欧洲联盟/欧洲经济区、英国和瑞士将个人数据传输到美国，这些机制符合欧盟、英国和瑞士法律（https://dataprivacyframework.gov/Program-Overview）。ClickHouse 自我认证该框架，并在 [数据隐私框架列表](https://dataprivacyframework.gov/list) 上列出。

### HIPAA（自2024年起） {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

希望在符合 HIPAA 的区域部署服务以加载电子受保护健康信息（ePHI）的客户，可以访问控制台中的 **组织** 页面请求启用该功能。一名销售人员将联系您以获取签署的商业伙伴协议（BAA），以完成设置。部署到符合 HIPAA 区域的客户应查看我们的 [共享责任模型](/cloud/security/shared-responsibility-model)，并为其用例选择和实施适当的控制。

《1996年健康保险流通与问责法案》（HIPAA）是一项基于美国的隐私法，专注于受保护健康信息（PHI）的管理。HIPAA 有多个要求，包括 [安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html)，该规则专注于保护电子个人健康信息（ePHI）。ClickHouse 已实施行政、物理和技术保障措施，以确保存储在指定服务中的 ePHI 的机密性、完整性和安全性。这些活动已被纳入我们的 SOC 2 Type II 报告中，可在我们的 [信任中心](https://trust.clickhouse.com) 下载。

### PCI 服务提供商（自2025年起） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

希望在符合 PCI 的区域部署服务以加载持卡人数据的客户，可以访问控制台中的 **组织** 页面以启用该功能。一旦启用，客户在部署新服务时可以选择 "PCI 合规" 区域类型。部署到符合 PCI 区域的客户应查看我们在 [信任中心](https://trust.clickhouse.com) 提供的 PCI 责任概述，并为其用例选择和实施适当的控制。

[支付卡行业数据安全标准（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/) 是由 PCI 安全标准委员会制定的一套规则，旨在保护信用卡支付数据。ClickHouse 已通过合格的安全评估员（QSA）进行外部审计，结果是根据存储信用卡数据相关的 PCI 标准通过了合规报告（ROC）。要下载我们的一份合规证明（AOC）副本和 PCI 责任概述，请访问我们的 [信任中心](https://trust.clickhouse.com)。


# 隐私合规

除了上述项目，ClickHouse 还维护内部合规程序，以应对一般数据保护条例（GDPR）、加州消费者隐私法（CCPA）以及其他相关隐私框架。有关 ClickHouse 收集的个人数据、如何使用、如何保护以及其他隐私相关信息的详细信息，可以在以下位置找到。

### 法律文件 {#legal-documents}

- [隐私政策](https://clickhouse.com/legal/privacy-policy)
- [Cookie 政策](https://clickhouse.com/legal/cookie-policy)
- [数据隐私框架通知](https://clickhouse.com/legal/data-privacy-framework)
- [数据处理附录（DPA）](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 处理位置 {#processing-locations}

- [子处理器和附属机构](https://clickhouse.com/legal/agreements/subprocessors)
- [数据处理位置](https://trust.clickhouse.com) 

### 其他程序 {#additional-procedures}

- [个人数据访问](/cloud/security/personal-data-access)
- [删除账户](/cloud/manage/close_account)


# 支付合规

ClickHouse 提供一种安全的信用卡支付方式，符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)。
