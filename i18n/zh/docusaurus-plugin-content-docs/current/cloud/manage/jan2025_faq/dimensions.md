---
'title': '新的定价维度'
'slug': '/cloud/manage/jan-2025-faq/pricing-dimensions'
'keywords':
- 'new pricing'
- 'dimensions'
'description': '数据传输和 ClickPipes 的定价维度'
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/i18n/jp/docusaurus-plugin-content-docs/current/cloud/manage/_snippets/_network_transfer_rates.md';

以下维度已被添加到新的 ClickHouse Cloud 定价中。

:::note
数据传输和 ClickPipes 定价将不适用于遗留计划，即开发、生产和专用计划，直到 2025 年 3 月 24 日。
:::

## 数据传输定价 {#data-transfer-pricing}

### 用户如何为数据传输付费，这是否会因组织层级和地区而异？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- 用户将按照两个维度为数据传输付费——公共互联网外发和跨区域外发。区域内的数据传输或私人链接/私人服务连接的使用和数据传输不收取费用。然而，我们保留在看到影响我们适当向用户收费的使用模式时实施额外数据传输定价维度的权利。
- 数据传输定价将因云服务提供商 (CSP) 和地区而异。
- 数据传输定价在组织层级之间 **不会** 变化。
- 公共外发定价仅基于原始区域。跨区域（或区域之间）定价依赖于原始和目标区域。

<NetworkPricing/>

### 数据传输定价会随着使用量增加而分层吗？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

数据传输价格 **不会** 随着使用量增加而分层。请注意，定价因地区和云服务提供商而异。

## ClickPipes 定价常见问题 {#clickpipes-pricing-faq}

### 为什么我们现在要为 ClickPipes 引入定价模型？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

我们决定最初免费推出 ClickPipes，目的是收集反馈、完善功能，并确保其满足用户需求。随着 GA 平台的发展，并有效经受住了移动数万亿行数据的考验，引入定价模型使我们能够继续改善服务，维护基础设施，并提供专门支持和新连接器。

### 什么是 ClickPipes 副本？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源摄取数据，该基础设施与 ClickHouse Cloud 服务独立运行和扩展。因此，它使用专用计算副本。下面的图示展示了简化的架构。

对于流式 ClickPipes，ClickPipes 副本访问远程数据源（例如，Kafka 代理），提取数据，处理并摄取到目标 ClickHouse 服务中。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes Replicas - Streaming ClickPipes" border/>

在对象存储 ClickPipes 的情况下，ClickPipes 副本协调数据加载任务（识别要复制的文件、维护状态和移动分区），而数据则直接从 ClickHouse 服务中提取。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes Replicas - Object Storage ClickPipes" border/>

### 默认的副本数量及其大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认有 1 个副本，提供 2 GiB 的 RAM 和 0.5 vCPU。这相当于 **0.25** ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPUs）。

### ClickPipes 副本可以扩展吗？ {#can-clickpipes-replicas-be-scaled}

目前，只有流式 ClickPipes 可以通过增加更多副本（每个副本的基本单位为 **0.25** ClickHouse 计算单位）进行水平扩展。根据需求，特定用例也可以进行垂直扩展（为每个副本增加更多 CPU 和 RAM）。

### 我需要多少个 ClickPipes 副本？ {#how-many-clickpipes-replicas-do-i-need}

这取决于工作负载的吞吐量和延迟要求。我们建议从默认值 1 个副本开始，测量您的延迟，并在需要时增加副本。请记住，对于 Kafka ClickPipes，您还必须相应地扩展 Kafka 代理分区。扩展控制在每个流式 ClickPipe 的“设置”中可用。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes Replicas - How many ClickPipes replicas do I need?" border/>

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

定价结构由两个维度组成：
- **计算**：每单位每小时的价格
  计算表示运行 ClickPipes 副本 pod 的成本，无论它们是否积极摄取数据。适用于所有 ClickPipes 类型。
- **摄取数据**：每 GB 定价
  摄取的数据费率适用于所有流式 ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），适用于通过副本 pods 传输的数据。摄取的数据大小（GB）基于从源接收的字节（未压缩或压缩）收费。

### ClickPipes 的公开定价是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时 $0.20 ($0.05 每个副本每小时)
- 摄取数据：每 GB $0.04

### 在示例中看起来如何？ {#how-does-it-look-in-an-illustrative-example}

例如，使用单个副本（0.25 计算单位）在 24 小时内通过 Kafka 连接器摄取 1 TB 数据的成本为：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

对于对象存储连接器（S3 和 GCS），仅会产生 ClickPipes 计算成本，因为 ClickPipes pod 不处理数据，只是协调传输，由底层 ClickHouse 服务操作：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新的定价模型何时生效？ {#when-does-the-new-pricing-model-take-effect}

新的定价模型将于 2025 年 1 月 27 日之后创建的所有组织生效。

### 目前的用户会怎样？ {#what-happens-to-current-users}

现有用户将享有 **60 天的宽限期**，在此期间 ClickPipes 服务继续免费提供。现有用户的 ClickPipes 计费将于 **2025 年 3 月 24 日** 自动开始。

### ClickPipes 的定价与市场相比如何？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipes 定价背后的哲学是覆盖平台的运营成本，同时提供一种简单可靠的方式将数据移动到 ClickHouse Cloud。从这个角度来看，我们的市场分析表明我们在竞争中处于有利地位。
