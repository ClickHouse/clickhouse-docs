---
'sidebar_label': '安全与合规性'
'slug': '/cloud/security/security-and-compliance'
'title': '安全与合规性'
'description': '本页面描述了 ClickHouse Cloud 实施的安全与合规措施，以保护客户数据。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 安全与合规报告
ClickHouse Cloud 评估我们客户的安全和合规需求，并在不断扩展该计划，以应对额外报告的请求。如需更多信息或下载报告，请访问我们的 [信任中心](https://trust.clickhouse.com)。

### SOC 2 类型 II（自2022年起） {#soc-2-type-ii-since-2022}

系统和组织控制（SOC）2 是一份报告，专注于安全性、可用性、机密性、处理完整性和隐私标准，这些标准包含在信任服务标准（TSC）中，适用于组织的系统，旨在为依赖方（我们的客户）提供关于这些控制措施的保证。ClickHouse 与独立外部审计员合作，每年至少进行一次审计，评估我们系统的安全性、可用性和处理完整性，以及我们系统处理的数据的机密性和隐私。该报告涉及我们的 ClickHouse Cloud 和自带云（BYOC）产品。

### ISO 27001（自2023年起） {#iso-27001-since-2023}

国际标准化组织（ISO）27001 是一项国际信息安全标准。它要求公司实施信息安全管理系统（ISMS），该系统包括管理风险的流程、制定和传达政策、实施安全控制措施，以及监控以确保各组件保持相关性和有效性。ClickHouse 进行内部审计，并与独立外部审计员合作，在证书签发后的2年内进行审计和临时检查。

### 美国数据隐私框架（自2024年起） {#us-dpf-since-2024}

美国数据隐私框架旨在为美国组织提供可靠的个人数据传输机制，从欧盟/欧洲经济区、英国和瑞士传输个人数据，确保符合欧盟、英国和瑞士法律（https://dataprivacyframework.gov/Program-Overview）。ClickHouse 进行了自我认证，并已列入 [数据隐私框架清单](https://dataprivacyframework.gov/list)。

### HIPAA（自2024年起） {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须完成商业伙伴协议（BAA），并联系销售或支持部门，以在符合HIPAA的地区启用服务以加载ePHI。此外，客户应审查我们的 [共享责任模型](/cloud/security/shared-responsibility-model)，并根据其用例选择并实施适当的控制措施。

《健康保险流通与问责法案》（HIPAA）于1996年通过，是一项集中于受保护健康信息（PHI）管理的美国隐私法。HIPAA有若干要求，包括 [安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html)，其重点在于保护电子个人健康信息（ePHI）。ClickHouse 实施了行政、物理和技术保障，以确保存储在指定服务中的ePHI的机密性、完整性和安全性。这些活动已包含在我们的 SOC 2 类型 II 报告中，报告可在我们的 [信任中心](https://trust.clickhouse.com)下载。

### PCI 服务提供商（自2025年起） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance" support="true"/>

客户必须联系销售或支持部门，以在符合PCI的地区启用服务以加载持卡人数据。此外，客户应审查我们在 [信任中心](https://trust.clickhouse.com) 提供的PCI责任概述，并根据其用例选择并实施适当的控制措施。

[支付卡行业数据安全标准（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/) 是PCI安全标准委员会制定的一套规则，旨在保护信用卡支付数据。ClickHouse 已经通过合格安全评估员（QSA）进行了外部审计，获得了符合与存储信用卡数据相关的PCI标准的合规报告（ROC）。要下载我们的合规证明（AOC）和PCI责任概述，请访问我们的 [信任中心](https://trust.clickhouse.com)。


# 隐私合规性

除了上述条款，ClickHouse 维护内部合规程序，涉及以下内容：通用数据保护条例（GDPR）、加州消费者隐私法（CCPA）和其他相关隐私框架。有关 ClickHouse 收集的个人数据、如何使用、如何保护以及其他隐私相关信息的详细信息，请参阅以下位置。

### 法律文件 {#legal-documents}

- [隐私政策](https://clickhouse.com/legal/privacy-policy)
- [cookie政策](https://clickhouse.com/legal/cookie-policy)
- [数据隐私框架通知](https://clickhouse.com/legal/data-privacy-framework)
- [数据处理附录（DPA）](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 处理地点 {#processing-locations}

- [子处理器和附属机构](https://clickhouse.com/legal/agreements/subprocessors)
- [数据处理地点](https://trust.clickhouse.com) 

### 其他程序 {#additional-procedures}

- [个人数据访问](/cloud/security/personal-data-access)
- [删除帐户](/cloud/manage/close_account)


# 支付合规性

ClickHouse 提供了一种符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) 的安全信用卡支付方式。
