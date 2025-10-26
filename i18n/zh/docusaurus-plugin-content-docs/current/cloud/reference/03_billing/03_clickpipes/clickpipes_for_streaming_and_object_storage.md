---
'sidebar_label': '流式和对象存储'
'slug': '/cloud/reference/billing/clickpipes/streaming-and-object-storage'
'title': 'ClickPipes 用于流式和对象存储'
'description': '流式和对象存储 ClickPipes 计费概述'
'doc_type': 'reference'
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# ClickPipes 用于流式传输和对象存储 {#clickpipes-for-streaming-object-storage}

本节概述了 ClickPipes 用于流式传输和对象存储的定价模型。

## ClickPipes 定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成：

- **计算**：每单位每小时的价格。
  计算代表了运行 ClickPipes 副本 Pod 的成本，无论它们是否积极接收数据。
  它适用于所有 ClickPipes 类型。
- **接收的数据**：按每 GB 的价格。
  接收的数据费率适用于所有流式 ClickPipes
  （Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs），
  适用于通过副本 Pod 传输的数据。接收的数据大小（GB）是基于从源接收的字节（未压缩或压缩）收费。

## 什么是 ClickPipes 副本？ {#what-are-clickpipes-replicas}

ClickPipes 通过独立的基础设施从远程数据源接收数据，
该基础设施独立于 ClickHouse Cloud 服务运行和扩展。
因此，它使用专用的计算副本。

## 默认副本的数量和大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认提供 1 个副本，配备 512 MiB 的 RAM 和 0.125 vCPU (XS)。
这相当于 **0.0625** ClickHouse 计算单位（1 单位 = 8 GiB RAM, 2 vCPUs）。

## ClickPipes 的公开价格是什么？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时 \$0.20（默认副本大小下每副本每小时 \$0.0125）
- 接收的数据：每 GB \$0.04

计算维度的价格取决于 ClickPipe 中副本的 **数量** 和 **大小**。默认副本大小可以通过垂直扩展进行调整，且每个副本大小的定价如下：

| 副本大小                | 计算单位 | RAM     | vCPU   | 每小时价格  |
|-------------------------|-----------|---------|--------|--------------|
| 超小型 (XS) (默认)      | 0.0625    | 512 MiB | 0.125  | \$0.0125     |
| 小型 (S)                | 0.125     | 1 GiB   | 0.25   | \$0.025      |
| 中型 (M)                | 0.25      | 2 GiB   | 0.5    | \$0.05       |
| 大型 (L)                | 0.5       | 4 GiB   | 1.0    | \$0.10       |
| 特大 (XL)               | 1.0       | 8 GiB   | 2.0    | \$0.20       |

## 在一个示例中如何体现？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设有一个 M 大小的单一副本，除非明确提及。

<table><thead>
  <tr>
    <th></th>
    <th>100 GB 在 24 小时内</th>
    <th>1 TB 在 24 小时内</th>
    <th>10 TB 在 24 小时内</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流式 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>使用 4 个副本： <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>对象存储 ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _仅 ClickPipes 的计算用于编排，
有效的数据传输由底层 Clickhouse 服务承担_

## 流式传输和对象存储 ClickPipes 的常见问题解答 {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>
