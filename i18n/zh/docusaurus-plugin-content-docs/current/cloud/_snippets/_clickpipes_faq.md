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
  拉取数据，对其进行处理并将其写入目标 ClickHouse 服务。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 副本 - 流式 ClickPipes" border force />

  对于对象存储类型的 ClickPipes，
  ClickPipes 副本负责编排数据加载任务
  （识别要复制的文件、维护状态以及移动分区），
  而数据则由 ClickHouse 服务直接拉取。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 副本 - 对象存储 ClickPipes" border force />
</details>

<details>
  <summary>默认的副本数量和规格是多少？</summary>

  每个 ClickPipe 默认有 1 个副本，配备 2 GiB RAM 和 0.5 vCPU。
  这相当于 **0.25** 个 ClickHouse compute 单元（1 个单元 = 8 GiB RAM，2 vCPU）。
</details>

<details>
  <summary>ClickPipes 副本可以扩展吗？</summary>

  可以，流式 ClickPipes 支持横向和纵向扩展。
  横向扩展通过增加副本数量来提高吞吐量，而纵向扩展则通过增加分配给每个副本的资源（CPU 和 RAM）来处理更高强度的工作负载。
  这些可在创建 ClickPipe 时配置，也可以在之后通过 **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** 进行调整。
</details>

<details>
  <summary>我需要多少个 ClickPipes 副本？</summary>

  这取决于工作负载的吞吐量和延迟需求。
  我们建议从默认的 1 个副本开始，测量延迟，如有需要再增加副本。
  请注意，对于 Kafka ClickPipes，你还需要相应扩展 Kafka broker 的分区数量。
  每个流式 ClickPipe 的扩展控制可在其 **Settings** 中进行配置。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 副本 - 我需要多少个 ClickPipes 副本？" border force />
</details>

<details>
  <summary>ClickPipes 的计费结构是怎样的？</summary>

  它由两个维度组成：

  * **Compute**：按单元按小时计费\
    Compute 表示运行 ClickPipes 副本 Pod 的成本，无论它们当前是否在主动摄取数据。
    该项适用于所有类型的 ClickPipes。
  * **Ingested data**：按 GB 计费\
    摄取数据费率适用于所有流式 ClickPipes
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs），针对通过副本 Pod 传输的数据。
    摄取数据大小（GB）基于从源端接收的字节数计费（无论是否压缩）。
</details>

<details>
  <summary>ClickPipes 的公开价格是多少？</summary>

  * Compute：每单元每小时 $0.20（每副本每小时 $0.05）
  * 摄取数据：每 GB $0.04
</details>

<details>
  <summary>能通过一个示例说明吗？</summary>

  例如，使用单个副本（0.25 compute 单元）通过 Kafka 连接器在 24 小时内摄取 1 TB 数据的成本为：

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  对于对象存储连接器（S3 和 GCS），
  只会产生 ClickPipes 的 compute 成本，因为 ClickPipes Pod 并不处理数据，
  而只是编排由底层 ClickHouse 服务执行的数据传输：

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes 的定价与市场相比如何？</summary>

ClickPipes 定价背后的理念是，在覆盖平台运营成本的同时，提供一种将数据传输到 ClickHouse Cloud 的简便且可靠的方式。
从这一角度来看，我们的市场分析表明，我们在市场上的定价具有竞争力。

</details>