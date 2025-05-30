---
'title': '新定价维度'
'slug': '/cloud/manage/jan-2025-faq/pricing-dimensions'
'keywords':
- 'new pricing'
- 'dimensions'
'description': '用于数据传输和 ClickPipes 的定价维度'
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/i18n/zh/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';
import ClickPipesFAQ from './_snippets/_clickpipes_faq.md'

以下维度已被添加到新的 ClickHouse Cloud 定价中。

:::note
自 2025 年 3 月 24 日起，数据传输和 ClickPipes 定价不适用于遗留计划，即开发、生产和专用计划。
:::

## 数据传输定价 {#data-transfer-pricing}

### 用户如何为数据传输收费，组织层级和地区会有所不同吗？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- 用户在两个维度上为数据传输付费——公共互联网出口和跨区域出口。区域内的数据传输或私人链接/私人服务连接的使用和数据传输不收取费用。然而，如果我们看到影响我们适当收费能力的使用模式，我们保留实施额外数据传输定价维度的权利。
- 数据传输定价因云服务提供商 (CSP) 和地区而异。
- 数据传输定价在组织层级之间 **不** 变化。
- 公共出口定价仅基于来源地区。跨区域（或跨区域）定价取决于来源地区和目的地区。

<NetworkPricing/>

### 随着使用量的增加，数据传输定价会分层吗？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

数据传输价格随着使用量的增加 **不会** 分层。定价因地区和云服务提供商而异。

## ClickPipes 定价常见问题 {#clickpipes-pricing-faq}

<ClickPipesFAQ/>
