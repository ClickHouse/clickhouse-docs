---
title: '新定价维度'
slug: /cloud/manage/jan-2025-faq/pricing-dimensions
keywords: ['新定价', '维度']
description: '数据传输和 ClickPipes 的定价维度'
---

import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/i18n/zh/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';

以下维度已添加到新的 ClickHouse Cloud 定价中。

:::note
数据传输和 ClickPipes 定价将不适用于传统计划，即开发、生产和专属计划，直到 2025 年 3 月 24 日。
:::

## 数据传输定价 {#data-transfer-pricing}

### 用户如何为数据传输收费？这在不同组织层级和地区之间会有所不同吗？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- 用户将根据两个维度为数据传输付费——公共互联网出口和跨区域出口。对于区域内的数据传输或使用私有链接/私有服务连接的数据传输不收取费用。然而，我们保留在看到影响我们合理收费的使用模式时实施额外数据传输定价维度的权利。
- 数据传输定价将根据云服务提供商（CSP）和地区的不同而有所变化。
- 数据传输定价在组织层级之间**不会**有所不同。
- 公共出口定价仅基于来源区域。跨区域（或区域间）定价取决于来源和目的地区域。

<NetworkPricing/>

### 数据传输定价会随着使用量的增加而分层吗？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

数据传输价格将**不会**随着使用量的增加而分层。注意，定价因地区和云服务提供商而异。

## ClickPipes 定价常见问题 {#clickpipes-pricing-faq}

### 为什么我们现在要为 ClickPipes 引入定价模型？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

我们决定最初免费推出 ClickPipes，目的是收集反馈，完善功能，并确保其满足用户需求。随着 GA 平台的成长并经受住时间的考验，处理了数万亿行数据，引入定价模型使我们能够继续改善服务，维护基础设施，并提供专门的支持和新的连接器。

### 什么是 ClickPipes 副本？ {#what-are-clickpipes-replicas}

ClickPipes 通过独立于 ClickHouse Cloud 服务运行和扩展的专用基础设施从远程数据源提取数据。因此，它使用专用的计算副本。下面的图表显示了一个简化的架构。

对于流式 ClickPipes，ClickPipes 副本访问远程数据源（例如，一个 Kafka 代理），提取数据，处理并将其摄取到目标 ClickHouse 服务中。

<img src={clickpipesPricingFaq1} alt="ClickPipes 副本 - 流式 ClickPipes" />

在对象存储 ClickPipes 的情况下，ClickPipes 副本协调数据加载任务（识别要复制的文件、维护状态和移动分区），而数据直接从 ClickHouse 服务中提取。

<img src={clickpipesPricingFaq2} alt="ClickPipes 副本 - 对象存储 ClickPipes" />

### 副本的默认数量和大小是什么？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认为 1 个副本，提供 2 GiB 的 RAM 和 0.5 vCPU。这相当于 **0.25** 个 ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPUs）。

### ClickPipes 副本可以扩展吗？ {#can-clickpipes-replicas-be-scaled}

目前，仅流式 ClickPipes 可以通过添加更多副本进行水平扩展，每个副本的基础单元为 **0.25** 个 ClickHouse 计算单位。针对特定用例的垂直扩展也可以按需提供（每个副本增加更多 CPU 和 RAM）。

### 我需要多少个 ClickPipes 副本？ {#how-many-clickpipes-replicas-do-i-need}

这取决于工作负载的吞吐量和延迟要求。我们建议从默认值 1 个副本开始，测量延迟，并在需要时添加副本。请记住，对于 Kafka ClickPipes，您还必须相应地扩展 Kafka 代理分区。扩展控制在每个流式 ClickPipe 的“设置”中可用。

<img src={clickpipesPricingFaq3} alt="ClickPipes 副本 - 我需要多少个 ClickPipes 副本？" />

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成：
- **计算**：每单位每小时的价格
  计算代表运行 ClickPipes 副本 Pod 的成本，无论它们是否实际摄取数据。这适用于所有 ClickPipes 类型。
- **摄取的数据**：按 GB 计费
  摄取数据费率适用于所有流式 ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），用于通过副本 Pod 传输的数据。摄取数据的大小（GB）依据从源接收的字节（未压缩或压缩）收费。

### ClickPipes 的公开价格是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：\$0.20 每单位每小时（每个副本 \$0.05 每小时）
- 摄取数据：\$0.04 每 GB

### 在一个示例中表现如何？ {#how-does-it-look-in-an-illustrative-example}

例如，使用单个副本（0.25 计算单位）在 24 小时内通过 Kafka 连接器摄取 1 TB 的数据将花费：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$

对于对象存储连接器（S3 和 GCS），只会产生 ClickPipes 的计算费用，因为 ClickPipes pod 不处理数据，而只是协调传输，由底层的 ClickHouse 服务操作：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新定价模型何时生效？ {#when-does-the-new-pricing-model-take-effect}

新定价模型将于 2025 年 1 月 27 日后创建的所有组织生效。

### 当前用户会怎样？ {#what-happens-to-current-users}

现有用户将有一个 **60 天的宽限期**，在此期间 ClickPipes 服务将继续免费提供。对现有用户的 ClickPipes 收费将于 **2025 年 3 月 24 日** 自动开始。

### ClickPipes 的定价与市场相比如何？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipes 定价的哲学是覆盖平台的运营成本，同时提供一种简单且可靠的方式将数据迁移到 ClickHouse Cloud。从这个角度来看，我们的市场分析显示我们在竞争中处于有利位置。
