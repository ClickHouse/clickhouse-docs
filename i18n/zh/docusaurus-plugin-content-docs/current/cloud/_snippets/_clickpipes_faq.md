import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>什么是 ClickPipes 副本？</summary>

  ClickPipes 通过一套专用基础设施从远程数据源摄取数据，
  该基础设施独立于 ClickHouse Cloud 服务运行和伸缩。
  因此，它使用专用的计算副本。
  下图展示了简化后的架构。

  对于流式 ClickPipes，ClickPipes 副本会访问远程数据源（例如 Kafka broker），
  拉取数据、进行处理并将其摄取到目标 ClickHouse 服务中。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 副本 - 流式 ClickPipes" border force />

  对于对象存储类型的 ClickPipes，
  ClickPipes 副本负责编排数据加载任务
  （识别需要复制的文件、维护状态以及移动分区），
  而数据则是由 ClickHouse 服务直接拉取的。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 副本 - 对象存储 ClickPipes" border force />
</details>

<details>
  <summary>默认的副本数量和规格是多少？</summary>

  每个 ClickPipe 默认具有 1 个副本，提供 2 GiB RAM 和 0.5 vCPU。
  这对应于 **0.25** 个 ClickHouse 计算单元（1 个单元 = 8 GiB RAM，2 个 vCPU）。
</details>

<details>
  <summary>ClickPipes 副本可以伸缩吗？</summary>

  可以，流式 ClickPipes 可以进行水平和垂直伸缩。
  水平伸缩通过增加更多副本来提升吞吐量，而垂直伸缩则通过增加分配给每个副本的资源（CPU 和 RAM）来处理更高强度的工作负载。
  这可以在创建 ClickPipe 时配置，或之后随时在 **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** 中进行配置。
</details>

<details>
  <summary>我需要多少个 ClickPipes 副本？</summary>

  这取决于工作负载的吞吐量和延迟要求。
  我们建议从默认的 1 个副本开始，先测量延迟，如有需要再增加副本。
  请注意，对于 Kafka ClickPipes，你还必须相应伸缩 Kafka broker 的分区数量。
  每个流式 ClickPipe 的扩缩控制均可在其 &quot;settings&quot; 中进行设置。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 副本数量 - 我需要多少个 ClickPipes 副本？" border force />
</details>

<details>
  <summary>ClickPipes 的定价结构是什么样的？</summary>

  它由两个维度组成：

  * **Compute**：按单元每小时计费\
    Compute 表示运行 ClickPipes 副本 Pod（容器组）的成本，无论它们当前是否在摄取数据。
    适用于所有类型的 ClickPipes。
  * **Ingested data**：按 GB 计费\
    摄取数据费率适用于所有流式 ClickPipes
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs），按通过副本 Pod（容器组）传输的数据计费。
    摄取数据大小（GB）基于从源端接收的字节数（未压缩或已压缩）计费。
</details>

<details>
  <summary>ClickPipes 的公开定价是多少？</summary>

  * Compute：每个单元每小时 $0.20（每个副本每小时 $0.05）
  * 摄取数据：每 GB $0.04
</details>

<details>
  <summary>在一个示例中大概是什么样子？</summary>

  例如，使用 Kafka 连接器和单个副本（0.25 计算单元），在 24 小时内摄取 1 TB 数据的成本为：

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  对于对象存储连接器（S3 和 GCS），
  仅会产生 ClickPipes 的计算成本，因为 ClickPipes Pod（容器组）不会处理数据，
  而只是编排由底层 ClickHouse 服务执行的传输：

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes 的定价与市场相比如何？</summary>

ClickPipes 定价的理念是在覆盖平台运营成本的同时，为将数据导入 ClickHouse Cloud 提供一种简单可靠的方式。
从这个角度看，我们的市场分析表明，我们的定价在市场上具有竞争力。

</details>