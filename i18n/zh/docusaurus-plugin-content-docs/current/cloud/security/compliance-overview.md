---
'sidebar_label': '安全与合规'
'slug': '/cloud/security/security-and-compliance'
'title': '安全与合规'
'description': '本页面描述了 ClickHouse Cloud 实施的安全与合规措施，以保护客户数据。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 安全与合规报告
ClickHouse Cloud 评估我们客户的安全和合规需求，并不断扩大该计划以满足额外报告的请求。有关更多信息或下载报告，请访问我们的 [信任中心](https://trust.clickhouse.com)。

### SOC 2 Type II (自 2022 年起) {#soc-2-type-ii-since-2022}

系统和组织控制 (SOC) 2 是一份报告，专注于信任服务标准 (TSC) 中包含的安全性、可用性、机密性、处理完整性和隐私标准，适用于组织的系统，旨在向依赖方（我们的客户）提供对这些控制的保证。ClickHouse 与独立的外部审计师合作，每年至少进行一次审核，审查我们系统的安全性、可用性和处理完整性，以及我们系统处理的数据的机密性和隐私。该报告涵盖了我们的 ClickHouse Cloud 和自带云 (BYOC) 产品。

### ISO 27001 (自 2023 年起) {#iso-27001-since-2023}

国际标准化组织 (ISO) 27001 是信息安全的国际标准。它要求公司实施信息安全管理系统 (ISMS)，包括管理风险、制定和传达政策、实施安全控制以及监控以确保组件保持相关性和有效性的流程。ClickHouse 进行内部审计，并与独立的外部审计师合作，在证书发布后的 2 年间进行审计和临时检查。

### U.S. DPF (自 2024 年起) {#us-dpf-since-2024}

美国数据隐私框架旨在为美国组织提供将个人数据从欧盟/欧洲经济区、英国和瑞士传输到美国的可靠机制，符合欧盟、英国和瑞士的法律 (https://dataprivacyframework.gov/Program-Overview)。ClickHouse 已自我认证该框架，并已列入 [数据隐私框架列表](https://dataprivacyframework.gov/list)。

### HIPAA (自 2024 年起) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须完成商业伙伴协议 (BAA)，并联系销售或支持团队以在 HIPAA 合规区域启动服务，以加载电子健康信息 (ePHI)。此外，客户应查看我们的 [共享责任模型](/cloud/security/shared-responsibility-model)，为其使用案例选择并实施适当的控制措施。

《健康保险可移植性与责任法案》 (HIPAA) 于 1996 年在美国实施，是一项专注于受保护健康信息 (PHI) 管理的隐私法。HIPAA 有几项要求，包括 [安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html)，其重点是保护电子个人健康信息 (ePHI)。ClickHouse 已实施行政、物理和技术保障措施，以确保存储于指定服务中的 ePHI 的机密性、完整性和安全性。这些活动已纳入我们的 SOC 2 Type II 报告中，您可以在我们的 [信任中心](https://trust.clickhouse.com) 下载。

### PCI 服务提供商 (自 2025 年起) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance" support="true"/>

客户必须联系销售或支持团队，启动服务到 PCI 合规区域以加载持卡人数据。此外，客户应查看我们在 [信任中心](https://trust.clickhouse.com) 提供的 PCI 责任概述，为其使用案例选择并实施适当的控制措施。

[支付卡行业数据安全标准 (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/) 是由 PCI 安全标准委员会制定的一套规则，旨在保护信用卡支付数据。ClickHouse 已接受合格安全评估师 (QSA) 的外部审核，获得关于存储信用卡数据的 PCI 标准的合格合规报告 (ROC)。要下载我们的合规性证明 (AOC) 和 PCI 责任概述的副本，请访问我们的 [信任中心](https://trust.clickhouse.com)。


# 隐私合规性

除了上述项目，ClickHouse 还维持内部合规程序，以满足通用数据保护条例 (GDPR)、加州消费者隐私法 (CCPA) 和其他相关隐私框架。关于 ClickHouse 收集的个人数据、如何使用、如何保护以及其他隐私相关信息的详细信息，请参阅以下位置。

### 法律文件 {#legal-documents}

- [隐私政策](https://clickhouse.com/legal/privacy-policy)
- [Cookie 政策](https://clickhouse.com/legal/cookie-policy)
- [数据隐私框架通知](https://clickhouse.com/legal/data-privacy-framework)
- [数据处理附录 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 处理位置 {#processing-locations}

- [子处理器和附属机构](https://clickhouse.com/legal/agreements/subprocessors)
- [数据处理位置](https://trust.clickhouse.com) 

### 其他程序 {#additional-procedures}

- [个人数据访问](/cloud/security/personal-data-access)
- [删除账户](/cloud/manage/close_account)


# 支付合规性

ClickHouse 提供符合 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) 的安全信用卡支付方式。
