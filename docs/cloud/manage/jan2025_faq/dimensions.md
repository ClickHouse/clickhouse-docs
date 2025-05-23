---
title: 'New Pricing Dimensions'
slug: /cloud/manage/jan-2025-faq/pricing-dimensions
keywords: ['new pricing', 'dimensions']
description: 'Pricing dimensions for data transfer and ClickPipes'
---
import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/docs/cloud/manage/_snippets/_network_transfer_rates.md';
import ClickPipesFAQ from './_snippets/_clickpipes_faq.md'

The following dimensions have been added to the new ClickHouse Cloud pricing.

:::note
Data transfer and ClickPipes pricing will not apply to legacy plans, i.e. Development, Production, and Dedicated, until 24 March 2025.
:::

## Data Transfer Pricing {#data-transfer-pricing}

### How are users charged for data transfer, and will this vary across organization tiers and regions? {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- Users will pay for data transfer along two dimensions — public internet egress and inter-region egress. There are no charges for intra-region data transfer or Private Link/Private Service Connect use and data transfer. However, we reserve the right to implement additional data transfer pricing dimensions if we see usage patterns that impact our ability to charge users appropriately.
- Data transfer pricing will vary by Cloud Service Provider (CSP) and region.
- Data transfer pricing will **not** vary between organizational tiers.
- Public egress pricing is based only on the origin region. Inter-region (or cross-region) pricing depends on both the origin and destination regions.

<NetworkPricing/>

### Will data transfer pricing be tiered as usage increases? {#will-data-transfer-pricing-be-tiered-as-usage-increases}

Data transfer prices will **not** be tiered as usage increases. Note that the pricing varies by region and cloud service provider.

## ClickPipes Pricing FAQ {#clickpipes-pricing-faq}

<ClickPipesFAQ/>
