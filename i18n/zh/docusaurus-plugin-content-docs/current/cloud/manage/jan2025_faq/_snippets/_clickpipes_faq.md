---
null
...
---

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>

<summary>为什么我们现在为 ClickPipes 引入定价模型？</summary>

我们决定最初将 ClickPipes 免费推出，目的是收集反馈、完善功能并确保其满足用户需求。
随着 GA 平台的发展，它在处理数万亿行数据方面经受住了时间的考验。引入定价模型使我们能够继续改善服务，维护基础设施，并提供专门的支持和新的连接器。

</details>

<details>

<summary>什么是 ClickPipes 副本？</summary>

ClickPipes 通过专用基础设施从远程数据源中摄取数据，这些基础设施独立于 ClickHouse Cloud 服务运行和扩展。
因此，它使用专用的计算副本。
下面的图示显示了一个简化的架构。

对于流式 ClickPipes，ClickPipes 副本访问远程数据源（例如 Kafka 代理），
拉取数据，处理并摄取到目标 ClickHouse 服务中。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 副本 - 流式 ClickPipes" border force/>

在对象存储 ClickPipes 的情况下，
ClickPipes 副本协调数据加载任务
（识别要复制的文件、维护状态和移动分区），
同时数据是直接从 ClickHouse 服务中拉取的。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 副本 - 对象存储 ClickPipes" border force/>

</details>

<details>

<summary>副本的默认数量和大小是多少？</summary>

每个 ClickPipe 默认包含 1 个副本，配备 2 GiB 内存和 0.5 vCPU。
这相当于 **0.25** ClickHouse 计算单元（1 单元 = 8 GiB RAM, 2 vCPUs）。

</details>

<details>

<summary>ClickPipes 副本可以扩展吗？</summary>

流式 ClickPipes 可以通过添加更多副本来横向扩展，每个副本的基本单元为 **0.25** ClickHouse 计算单元。
对于特定用例，垂直扩展也是按需提供（为每个副本增加更多 CPU 和 RAM）。

</details>

<details>

<summary>我需要多少 ClickPipes 副本？</summary>

这取决于工作负载的吞吐量和延迟要求。
我们建议从 1 个副本的默认值开始，测量您的延迟，并在需要时添加副本。
请记住，对于 Kafka ClickPipes，您还需要相应地扩展 Kafka 代理分区。
扩展控制在每个流式 ClickPipe 的“设置”中可用。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 副本 - 我需要多少 ClickPipes 副本？" border force/>

</details>

<details>

<summary>ClickPipes 的定价结构是什么样的？</summary>

它由两个维度组成：
- **计算**: 每单位每小时的价格
  计算代表运行 ClickPipes 副本 Pod 的成本，无论它们是否积极摄取数据。
  这适用于所有类型的 ClickPipes。
- **摄取的数据**: 按 GB 计费
  对于所有流式 ClickPipes（Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs），摄取的数据费率适用于通过副本 Pod 传输的数据。
  摄取的数据大小（GB）是基于从源接收的字节数（未压缩或压缩）进行收费。

</details>

<details>

<summary>ClickPipes 的公开价格是什么？</summary>

- 计算: 每单位每小时 \$0.20 （每个副本每小时 \$0.05）
- 摄取的数据: 每 GB \$0.04

</details>

<details>

<summary>在一个示例中它看起来怎么样？</summary>

例如，使用 Kafka 连接器通过单个副本（0.25 计算单元）摄取 1 TB 数据，持续 24 小时的费用为：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

对于对象存储连接器（S3 和 GCS），
只产生 ClickPipes 的计算成本，因为 ClickPipes Pod 不处理数据
而只是协调由基础 ClickHouse 服务操作的传输：

$$
0.25 \times 0,20 \times 24 = \$1.2
$$

</details>

<details>

<summary>新的定价模型何时生效？</summary>

新的定价模型将在 2025 年 1 月 27 日之后创建的所有组织中生效。

</details>

<details>

<summary>当前用户会发生什么？</summary>

现有用户将有一个 **60 天的宽限期**，在此期间 ClickPipes 服务将继续免费提供。
现有用户的 ClickPipes 计费将于 **2025 年 3 月 24 日** 自动开始。

</details>

<details>

<summary>ClickPipes 的定价与市场相比如何？</summary>

ClickPipes 定价背后的理念是
覆盖平台的运营成本，同时提供一种简单可靠的方式将数据迁移到 ClickHouse Cloud。
从这个角度来看，我们的市场分析显示，我们的定位具有竞争力。

</details>
