---
'title': 'New Pricing Dimensions'
'slug': '/cloud/manage/jan-2025-faq/pricing-dimensions'
'keywords':
- 'new pricing'
- 'dimensions'
'description': 'Pricing dimensions for data transfer and ClickPipes'
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';
import NetworkPricing from '@site/docs/cloud/manage/_snippets/_network_transfer_rates.md';

以下维度已添加到新的 ClickHouse Cloud 定价中。

:::note
数据传输和 ClickPipes 的定价不适用于传统计划，即开发、生产和专用计划，直到 2025 年 3 月 24 日。
:::

## 数据传输定价 {#data-transfer-pricing}

### 用户如何被收取数据传输费用，这会因组织级别和地区而有所不同吗？ {#how-are-users-charged-for-data-transfer-and-will-this-vary-across-organization-tiers-and-regions}

- 用户将根据两个维度支付数据传输费用——公共互联网出口和区域间出口。对于区域内的数据传输或 Private Link/Private Service Connect 的使用和数据传输，没有收费。然而，我们保留在看到影响我们适当收取用户费用的使用模式时实施额外数据传输定价维度的权利。
- 数据传输定价将因云服务提供商 (CSP) 和地区而异。
- 数据传输定价在组织级别之间**不会**有所不同。
- 公共出口定价只基于源区域。区域间（或跨区域）定价取决于源区域和目标区域。

<NetworkPricing/>

### 数据传输定价会随着使用的增加而分级吗？ {#will-data-transfer-pricing-be-tiered-as-usage-increases}

数据传输价格**不会**随着使用的增加而分级。请注意，定价因地区和云服务提供商而异。

## ClickPipes 定价 FAQ {#clickpipes-pricing-faq}

### 为什么现在要为 ClickPipes 引入定价模型？ {#why-are-we-introducing-a-pricing-model-for-clickpipes-now}

我们决定最初免费提供 ClickPipes，以收集反馈、完善功能并确保其满足用户需求。
随着 GA 平台的发展并成功承受了数万亿行数据的测试，引入定价模型使我们能够持续改善服务、维护基础设施，并提供专门支持和新连接器。

### ClickPipes 副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源摄取数据，该基础设施与 ClickHouse Cloud 服务独立运行和扩展。
因此，它使用专用的计算副本。
下面的图表显示了简化的架构。

对于流式 ClickPipes，ClickPipes 副本访问远程数据源（例如 Kafka broker），拉取数据，处理并摄取到目标 ClickHouse 服务中。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 副本 - 流式 ClickPipes" border/>

在对象存储 ClickPipes 的情况下，ClickPipes 副本协调数据加载任务（识别要复制的文件、维护状态和移动分区），而数据直接从 ClickHouse 服务中拉取。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 副本 - 对象存储 ClickPipes" border/>

### 默认的副本数量及其大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认提供 1 个副本，配备 2 GiB 的内存和 0.5 vCPU。
这对应于 **0.25** ClickHouse 计算单元（1 单元 = 8 GiB 内存，2 vCPUs）。

### ClickPipes 副本可以扩展吗？ {#can-clickpipes-replicas-be-scaled}

目前，只有流式 ClickPipes 可以通过添加更多每个基础单元为 **0.25** ClickHouse 计算单元的副本进行水平扩展。
针对特定用例，垂直扩展也可按需提供（为每个副本添加更多 CPU 和内存）。

### 我需要多少个 ClickPipes 副本？ {#how-many-clickpipes-replicas-do-i-need}

这取决于工作负载的吞吐量和延迟要求。
我们建议以 1 个副本的默认值开始，测量延迟，并根据需要添加副本。
请记住，对于 Kafka ClickPipes，您还必须相应扩展 Kafka broker 的分区。
每个流式 ClickPipe 的“设置”下可用缩放控制。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 副本 - 我需要多少个 ClickPipes 副本？" border/>

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成：
- **计算**：每单位每小时的价格
  计算代表运行 ClickPipes 副本容器的成本，无论它们是否主动摄取数据。
  适用于所有 ClickPipes 类型。
- **摄取的数据**：每 GB 定价
  摄取的数据费率适用于所有流式 ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），用于通过副本容器传输的数据。
  摄取的数据大小（GB）是根据从源接收的字节（未压缩或压缩）收费。

### ClickPipes 的公开价格是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时 $0.20（每个副本每小时 $0.05）
- 摄取的数据：每 GB $0.04

### 在一个示例中看起来如何？ {#how-does-it-look-in-an-illustrative-example}

例如，使用 Kafka 连接器通过单个副本（0.25 计算单元）摄取 1 TB 数据，持续 24 小时，费用为：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

对于对象存储连接器（S3 和 GCS），只收取 ClickPipes 计算成本，因为 ClickPipes 容器并未处理数据，而只是协调整个由底层 ClickHouse 服务操作的传输：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

### 新的定价模型何时生效？ {#when-does-the-new-pricing-model-take-effect}

新的定价模型将于 2025 年 1 月 27 日之后创建的所有组织生效。

### 当前用户将会发生什么？ {#what-happens-to-current-users}

现有用户将享有 **60 天的宽限期**，在此期间 ClickPipes 服务将继续免费提供。
对现有用户的 ClickPipes 计费将于 **2025 年 3 月 24 日** 自动开始。

### ClickPipes 的定价与市场相比如何？ {#how-does-clickpipes-pricing-compare-to-the-market}

ClickPipes 定价背后的哲学是覆盖平台的运营成本，同时提供一种简单可靠的方法将数据移动到 ClickHouse Cloud。
从这个角度来说，我们的市场分析显示我们在竞争中处于有利地位。
