---
'sidebar_label': '安全与合规性'
'slug': '/cloud/security/security-and-compliance'
'title': '安全与合规性'
'description': '本页描述了ClickHouse Cloud实施的安全与合规性措施，以保护客户数据。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

# 安全与合规报告
ClickHouse Cloud 评估我们客户的安全和合规需求，并随着更多报告的请求不断扩展该计划。有关更多信息或下载报告，请访问我们的 [信任中心](https://trust.clickhouse.com)。

### SOC 2 Type II（自2022年起） {#soc-2-type-ii-since-2022}

系统和组织控制 (SOC) 2 是一份报告，专注于安全性、可用性、机密性、处理完整性和隐私标准，这些标准包含在信任服务标准 (TSC) 中，并应用于组织的系统，旨在向依赖方（我们的客户）提供这些控制的保证。ClickHouse 与独立的外部审计师合作，每年至少进行一次审计，评估我们系统的安全性、可用性和处理完整性以及系统处理的数据的机密性和隐私性。该报告涵盖了我们的 ClickHouse Cloud 和自带云 (BYOC) 产品。

### ISO 27001（自2023年起） {#iso-27001-since-2023}

国际标准化组织 (ISO) 27001 是一项信息安全国际标准。它要求公司实施信息安全管理系统 (ISMS)，包括管理风险、制定和沟通政策、实施安全控制和监控以确保组件保持相关性和有效性的流程。ClickHouse 进行内部审计，并与独立的外部审计师合作，在证书发放后的两年内进行审计和临时检查。

### 美国数据隐私框架（自2024年起） {#us-dpf-since-2024}

美国数据隐私框架旨在为美国组织提供可靠的个人数据转移机制，以便从欧盟/欧洲经济区、英国和瑞士转移到美国，这些机制符合欧盟、英国和瑞士的法律 (https://dataprivacyframework.gov/Program-Overview)。ClickHouse 自我认证符合该框架，并在 [数据隐私框架列表](https://dataprivacyframework.gov/list) 中列出。

### HIPAA（自2024年起） {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须完成商业伙伴协议 (BAA)，并联系销售或支持团队，以便在符合 HIPAA 的地区引入服务以加载 ePHI。此外，客户还应查看我们的 [共享责任模型](/cloud/security/shared-responsibility-model)，选择并实施适合其用例的控制措施。

1996 年的健康保险可携带性与责任法案 (HIPAA) 是一部以美国为基础的隐私法，专注于保护健康信息 (PHI) 的管理。HIPAA 有多个要求，包括 [安全规定](https://www.hhs.gov/hipaa/for-professionals/security/index.html)，该规定专注于保护电子个人健康信息 (ePHI)。ClickHouse 已实施行政、物理和技术保障措施，以确保存储在指定服务中的 ePHI 的机密性、完整性和安全性。这些活动已纳入我们的 SOC 2 Type II 报告中，可以在我们的 [信任中心](https://trust.clickhouse.com) 下载。

### PCI 服务提供商（自2025年起） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance" support="true"/>

客户必须联系销售或支持团队，以便在符合 PCI 的地区引入服务以加载持卡人数据。此外，客户还应查看我们在 [信任中心](https://trust.clickhouse.com) 中提供的 PCI 责任概述，并选择并实施适合其用例的控制措施。

[支付卡行业数据安全标准 (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/) 是一套由 PCI 安全标准委员会制定的规则，用于保护信用卡支付数据。ClickHouse 已经接受了合格安全评估师 (QSA) 的外部审计，并产生了符合存储信用卡数据的 PCI 标准的合规报告 (ROC)。要下载我们的合规证明 (AOC) 和 PCI 责任概述的副本，请访问我们的 [信任中心](https://trust.clickhouse.com)。


# 隐私合规

除了上述项目外，ClickHouse 还维护内部合规程序，处理通用数据保护条例 (GDPR)、加利福尼亚消费者隐私法 (CCPA) 和其他相关隐私框架。有关 ClickHouse 收集的个人数据、如何使用、如何保护以及其他隐私相关信息的详细信息可以在以下位置找到。

### 法律文档 {#legal-documents}

- [隐私政策](https://clickhouse.com/legal/privacy-policy)
- [Cookie 政策](https://clickhouse.com/legal/cookie-policy)
- [数据隐私框架通知](https://clickhouse.com/legal/data-privacy-framework)
- [数据处理附录 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 处理地点 {#processing-locations}

- [子处理者和附属机构](https://clickhouse.com/legal/agreements/subprocessors)
- [数据处理地点](https://trust.clickhouse.com) 

### 其他程序 {#additional-procedures}

- [个人数据访问](/cloud/security/personal-data-access)
- [删除账户](/cloud/manage/close_account)


# 支付合规

ClickHouse 提供一种安全的信用卡支付方式，符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)。
