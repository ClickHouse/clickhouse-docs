import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>

<summary>什么是 ClickPipes 副本？</summary>

ClickPipes 通过专用基础设施从远程数据源摄取数据，这些基础设施独立于 ClickHouse Cloud 服务运行和扩展。
因此，它使用专用计算副本。
下面的图表展示了简化的架构。

对于流式 ClickPipes，ClickPipes 副本访问远程数据源（例如：Kafka 代理），拉取数据，处理并将其摄取到目标 ClickHouse 服务中。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 副本 - 流式 ClickPipes" border force/>

在对象存储 ClickPipes 的情况下，
ClickPipes 副本协调数据加载任务
（识别要复制的文件，维护状态，并移动分区），
而数据则直接从 ClickHouse 服务拉取。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 副本 - 对象存储 ClickPipes" border force/>

</details>

<details>

<summary>副本的默认数量及其大小是多少？</summary>

每个 ClickPipe 默认有 1 个副本，配备 2 GiB 的 RAM 和 0.5 vCPU。
这对应于 **0.25** ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPUs）。

</details>

<details>

<summary>ClickPipes 副本可以扩展吗？</summary>

是的，流式 ClickPipes 可以横向和纵向扩展。
横向扩展增加更多副本以提高吞吐量，而纵向扩展则增加分配给每个副本的资源（CPU 和 RAM），以处理更密集的工作负载。
这可以在 ClickPipe 创建期间配置，或者在 **设置** -> **高级设置** -> **扩展** 下的任何其他时候配置。

</details>

<details>

<summary>我需要多少个 ClickPipes 副本？</summary>

这取决于工作负载的吞吐量和延迟要求。
我们建议从 1 个副本的默认值开始，测量延迟，并根据需要添加副本。
请记住，对于 Kafka ClickPipes，您还必须相应地扩展 Kafka 代理的分区。
扩展控件在每个流式 ClickPipe 的“设置”中可用。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 副本 - 我需要多少个 ClickPipes 副本？" border force/>

</details>

<details>

<summary>ClickPipes 的定价结构是什么样的？</summary>

它由两个维度组成：
- **计算**：每个单位每小时的价格
  计算代表运行 ClickPipes 副本 pod 的成本，无论它们是否正在积极摄取数据。
  它适用于所有 ClickPipes 类型。
- **摄取的数据**：每 GB 定价
  摄取的数据费率适用于所有流式 ClickPipes
  （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），用于通过副本 pod 传输的数据。
  摄取的数据大小（GB）根据从源收到的字节数收费（无压缩或压缩）。

</details>

<details>

<summary>ClickPipes 的公开价格是什么？</summary>

- 计算：每单位每小时 \$0.20（每副本每小时 \$0.05）
- 摄取数据：每 GB \$0.04

</details>

<details>

<summary>在一个示例中看起来如何？</summary>

例如，使用 Kafka 连接器以单个副本（0.25 计算单位）在 24 小时内摄取 1 TB 数据的成本为：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

对于对象存储连接器（S3 和 GCS），
只会产生 ClickPipes 计算成本，因为 ClickPipes pod 并未处理数据
而仅仅是协调由底层的 ClickHouse 服务操作的传输：

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

</details>

<details>

<summary>ClickPipes 定价与市场相比如何？</summary>

ClickPipes 定价的理念是
覆盖平台的运营成本，同时提供一种简单可靠的方式将数据移动到 ClickHouse Cloud。
从这个角度来看，我们的市场分析表明我们的定价具有竞争力。

</details>
